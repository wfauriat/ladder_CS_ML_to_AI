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
key, and no knowledge of the model endpoint at all.

HOW THE ENDPOINT IS CALLED
--------------------------
This mirrors the validated client construction 1:1:

    client = OpenAI(
        base_url=...,                 # LADDER_BASE_URL, e.g. https://host/mistral-small-2506/v1
        api_key="EMPTY",              # the SDK demands *some* key; the endpoint ignores it
        http_client=httpx.Client(
            verify=truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT),  # OS trust store, not certifi
            auth=HTTPSPNEGOAuth(),    # SPNEGO/Kerberos from the ambient credential cache/keytab
        ),
        default_headers={"Authorization": Omit()},  # strip the SDK's bearer so it can't
                                                     # collide with the Negotiate header
    )

The two departures from the raw-httpx reference that actually matter on a
corporate network are (1) truststore for TLS — so the internal CA is trusted
without shipping a bundle — and (2) stripping Authorization so the dummy
"EMPTY" bearer never fights the Kerberos Negotiate header.

IDENTITY MODEL
--------------
A SINGLE service identity: the proxy authenticates as one Kerberos principal
(from a client keytab or a pre-populated credential cache), and every app
user's request goes out under that identity. HTTPSPNEGOAuth() reads whatever
credentials are ambient in the environment — so:
  • dev:  run `kinit` in the shell first (a ccache), exactly like the snippet;
  • prod: point KRB5_CLIENT_KTNAME at a service keytab (and optionally
          KRB5CCNAME at a writable ccache path) so no interactive login is
          needed and tickets auto-renew.
Per-user delegation (S4U2Proxy) is deliberately NOT implemented — it is a much
larger piece of work, only needed if the endpoint does per-user authz/audit.
"""

from __future__ import annotations

import os
import ssl
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
import truststore
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    # SPNEGO/Kerberos auth flow for httpx. Requires system GSSAPI/krb5 libraries
    # at build time — see requirements.txt.
    from httpx_gssapi import HTTPSPNEGOAuth
except ImportError:  # surfaced as a clear error at startup, not a silent import
    HTTPSPNEGOAuth = None

try:
    from openai import OpenAI
    from openai._types import Omit
except ImportError:
    OpenAI = None
    Omit = None


# ---------------------------------------------------------------------------
# Configuration — everything endpoint/identity-specific is read from the
# environment so nothing sensitive is baked into the image or the JS bundle.
# ---------------------------------------------------------------------------
class Settings:
    # Base URL of the OpenAI-compatible endpoint, INCLUDING the /v1 suffix, e.g.
    #   https://host.internal/mistral-small-2506/v1
    # (This is the OpenAI SDK `base_url`; the SDK appends /chat/completions.)
    BASE_URL = os.environ["LADDER_BASE_URL"]

    # Model name passed in the request body. Must match what the endpoint serves.
    MODEL = os.environ.get("LADDER_MODEL", "mistral-small-2506")

    MAX_TOKENS = int(os.environ.get("LADDER_MAX_TOKENS", "1000"))
    TIMEOUT_S = float(os.environ.get("LADDER_TIMEOUT_S", "120"))

    # Where the built SPA lives (Vite `dist`). Served at "/". Leave empty to run
    # the proxy API-only (e.g. behind nginx that serves the static files).
    _DEFAULT_STATIC_DIR = str(Path(__file__).resolve().parent.parent / "dist")
    STATIC_DIR = os.environ.get("LADDER_STATIC_DIR", _DEFAULT_STATIC_DIR)


# ---------------------------------------------------------------------------
# Request / response contracts. The browser sends only the already-built prompt
# string; the proxy wraps it in the OpenAI messages shape so all prompt logic
# stays in the front-end's promptBuilder.
# ---------------------------------------------------------------------------
class GenerateIn(BaseModel):
    prompt: str = Field(min_length=1)


class GenerateOut(BaseModel):
    text: str


def _build_client() -> "OpenAI":
    """Construct the OpenAI client exactly as the validated snippet does:
    truststore TLS + SPNEGO/Kerberos auth + dummy key with Authorization stripped.
    """
    if OpenAI is None or Omit is None:
        raise RuntimeError(
            "openai is not installed — `pip install openai` (see requirements.txt)."
        )
    if HTTPSPNEGOAuth is None:
        raise RuntimeError(
            "httpx-gssapi is not installed — `pip install httpx-gssapi` and make "
            "sure the system krb5/GSSAPI libraries are present (see requirements.txt)."
        )

    http_client = httpx.Client(
        # OS trust store — trusts the internal CA without shipping a bundle.
        verify=truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT),
        # SPNEGO/Kerberos from the ambient ccache/keytab. Bare call = same
        # defaults the working snippet relies on (SPN derived from host).
        auth=HTTPSPNEGOAuth(),
        timeout=httpx.Timeout(Settings.TIMEOUT_S),
    )
    return OpenAI(
        base_url=Settings.BASE_URL,
        api_key="EMPTY",  # SDK requires a value; endpoint ignores it
        http_client=http_client,
        # Strip the SDK's bearer so it cannot collide with the Negotiate header.
        default_headers={"Authorization": Omit()},
    )


_client: "OpenAI | None" = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _client
    _client = _build_client()
    try:
        yield
    finally:
        # httpx.Client is sync; close it via the SDK's underlying client.
        try:
            _client._client.close()  # type: ignore[attr-defined]
        except Exception:
            pass


app = FastAPI(title="LADDER proxy", lifespan=lifespan)


@app.get("/api/health")
async def health():
    return {"ok": True, "model": Settings.MODEL, "base_url": Settings.BASE_URL}


@app.post("/api/generate", response_model=GenerateOut)
async def generate(body: GenerateIn):
    # The OpenAI SDK call is synchronous (httpx.Client); run it off the event
    # loop so the server stays responsive under concurrent requests.
    import anyio

    def _call() -> str:
        resp = _client.chat.completions.create(
            model=Settings.MODEL,
            max_tokens=Settings.MAX_TOKENS,
            stream=False,
            messages=[{"role": "user", "content": body.prompt}],
        )
        return (resp.choices[0].message.content or "").strip()

    try:
        text = await anyio.to_thread.run_sync(_call)
    except Exception as e:  # map SDK/transport errors to the old diagnostics
        text = None
        msg = str(e)
        # openai raises typed errors; match on class name to avoid a hard import
        # dependency on the exception hierarchy across SDK versions.
        name = type(e).__name__
        if name in ("APITimeoutError",) or isinstance(e, httpx.TimeoutException):
            raise HTTPException(
                504,
                f"model endpoint timed out after {Settings.TIMEOUT_S:.0f}s — "
                "it may be loading or overloaded",
            )
        if name in ("APIConnectionError",) or isinstance(e, httpx.TransportError):
            # SPNEGO failures usually surface here or as a 401 below.
            raise HTTPException(502, f"cannot reach model endpoint — {msg}")
        if name in ("AuthenticationError", "PermissionDeniedError") or " 401" in msg:
            raise HTTPException(
                502,
                "Kerberos auth rejected (401) — check the service ticket/keytab, "
                "the SPN, and clock skew against the KDC",
            )
        raise HTTPException(502, f"model endpoint error — {msg}")

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
