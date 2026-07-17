"""
LADDER proxy — a Kerberos-authenticated relay to a local, OpenAI-compatible
(Mistral) endpoint, plus static serving of the built SPA.

WHY THIS EXISTS
---------------
The LADDER front-end (Vite/React) originally called model endpoints straight
from the browser with a Bearer key. On the target private network the model
endpoint sits behind SPNEGO/Kerberos and must be reached with `httpx` from a
trusted *server* identity — neither of which a browser can do. This process IS
that server identity: it serves the built SPA and exposes ONE same-origin
endpoint, POST /api/generate, that adds Kerberos auth and forwards an
OpenAI-shaped chat-completions call.

Because the SPA and /api share an origin, the browser needs no CORS, no API
key, and no knowledge of the model endpoint at all — the whole key-bar and
direct-fetch surface in the front-end simply goes unused for this engine.

IDENTITY MODEL
--------------
This assumes a SINGLE service identity: the proxy authenticates to the endpoint
as one Kerberos principal (from a client keytab or credential cache), and every
app user's request goes out under that identity. Per-user delegation (S4U2Proxy)
is deliberately NOT implemented here — it is a much larger piece of work and is
only needed if the endpoint itself does per-user authorization/auditing.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    # SPNEGO/Kerberos auth flow for httpx (mirrors requests-gssapi). Requires
    # system GSSAPI/krb5 libraries at build time — see requirements.txt.
    from httpx_gssapi import HTTPSPNEGOAuth, REQUIRED, OPTIONAL, DISABLED
except ImportError:  # surfaced as a clear error at startup, not a silent import
    HTTPSPNEGOAuth = None


# ---------------------------------------------------------------------------
# Configuration — everything endpoint/identity-specific is read from the
# environment so nothing sensitive is baked into the image or the JS bundle.
# ---------------------------------------------------------------------------
class Settings:
    # The local OpenAI-compatible endpoint, full path to chat-completions,
    # e.g. https://mistral.internal.example/v1/chat/completions
    ENDPOINT_URL = os.environ["LADDER_ENDPOINT_URL"]
    MODEL = os.environ.get("LADDER_MODEL", "mistral-medium-2508")
    MAX_TOKENS = int(os.environ.get("LADDER_MAX_TOKENS", "1000"))
    TIMEOUT_S = float(os.environ.get("LADDER_TIMEOUT_S", "120"))

    # Kerberos target service principal. Leave unset to let httpx-gssapi derive
    # HTTP@<host-from-url>, which is the usual case. Set explicitly only if the
    # gateway's SPN differs from the URL host (e.g. "HTTP@mistral.internal").
    TARGET_NAME = os.environ.get("LADDER_SPN")

    # required | optional | disabled — mutual authentication strictness. Prefer
    # "required"; drop to "optional" if the gateway does not return the final
    # mutual token and the handshake otherwise succeeds.
    MUTUAL_AUTH = os.environ.get("LADDER_MUTUAL_AUTH", "optional").lower()

    # TLS: path to an internal CA bundle, or "false" to disable verification
    # (only acceptable on a trusted private network). Default: system trust.
    VERIFY = os.environ.get("LADDER_TLS_VERIFY", "true")

    # Where the built SPA lives (Vite `dist`). Served at "/". Leave empty to run
    # the proxy API-only (e.g. behind nginx that serves the static files).
    STATIC_DIR = os.environ.get("LADDER_STATIC_DIR", "")


def _tls_verify(value: str):
    v = value.strip().lower()
    if v in ("false", "0", "no"):
        return False
    if v in ("true", "1", "yes", ""):
        return True
    return value  # otherwise treat it as a path to a CA bundle


def _build_auth():
    """One reusable SPNEGO auth object; it builds a fresh GSSAPI context per
    request inside httpx's auth_flow, so it is safe to share on the client."""
    if HTTPSPNEGOAuth is None:
        raise RuntimeError(
            "httpx-gssapi is not installed — `pip install httpx-gssapi` and make "
            "sure the system krb5/GSSAPI libraries are present (see requirements.txt)."
        )
    mutual = {"required": REQUIRED, "optional": OPTIONAL, "disabled": DISABLED}.get(
        Settings.MUTUAL_AUTH, OPTIONAL
    )
    kwargs = {"mutual_authentication": mutual}
    if Settings.TARGET_NAME:
        kwargs["target_name"] = Settings.TARGET_NAME
    return HTTPSPNEGOAuth(**kwargs)


# ---------------------------------------------------------------------------
# Request / response contracts. The browser sends only the already-built prompt
# string; the proxy wraps it in the OpenAI messages shape (exactly as the old
# callMistral did) so all prompt logic stays in the front-end's promptBuilder.
# ---------------------------------------------------------------------------
class GenerateIn(BaseModel):
    prompt: str = Field(min_length=1)


class GenerateOut(BaseModel):
    text: str


_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _client
    _client = httpx.AsyncClient(
        auth=_build_auth(),
        timeout=httpx.Timeout(Settings.TIMEOUT_S),
        verify=_tls_verify(Settings.VERIFY),
    )
    try:
        yield
    finally:
        await _client.aclose()


app = FastAPI(title="LADDER proxy", lifespan=lifespan)


@app.get("/api/health")
async def health():
    return {"ok": True, "model": Settings.MODEL, "endpoint": Settings.ENDPOINT_URL}


@app.post("/api/generate", response_model=GenerateOut)
async def generate(body: GenerateIn):
    payload = {
        "model": Settings.MODEL,
        "max_tokens": Settings.MAX_TOKENS,
        "stream": False,
        "messages": [{"role": "user", "content": body.prompt}],
    }
    try:
        resp = await _client.post(Settings.ENDPOINT_URL, json=payload)
    except httpx.TimeoutException:
        # Mirrors the front-end's old local-timeout diagnostic.
        raise HTTPException(
            504, f"model endpoint timed out after {Settings.TIMEOUT_S:.0f}s — "
            "it may be loading or overloaded"
        )
    except httpx.TransportError as e:
        raise HTTPException(502, f"cannot reach model endpoint — {e}")

    if resp.status_code == 401:
        # SPNEGO handshake was rejected: bad/expired ticket, missing/mismatched
        # SPN, or clock skew between this host and the KDC/endpoint.
        raise HTTPException(
            502, "Kerberos auth rejected (401) — check the service ticket/keytab, "
            "the SPN, and clock skew against the KDC"
        )
    if resp.status_code >= 400:
        raise HTTPException(502, f"model endpoint answered {resp.status_code}")

    data = resp.json()
    text = (
        (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
    ).strip()
    if not text:
        raise HTTPException(502, "empty completion from model endpoint")
    return GenerateOut(text=text)


# ---------------------------------------------------------------------------
# Static SPA serving (optional). Registered LAST so it never shadows /api. Real
# files are served directly; everything else falls back to index.html so the
# client-side app boots on any path.
# ---------------------------------------------------------------------------
if Settings.STATIC_DIR:
    _static = Path(Settings.STATIC_DIR)
    _assets = _static / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=_assets), name="assets")

    @app.get("/{full_path:path}")
    async def spa(full_path: str):
        candidate = _static / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_static / "index.html")
