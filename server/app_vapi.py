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
# import truststore
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


# # ---------------------------------------------------------------------------
# # Configuration — everything endpoint/identity-specific is read from the
# # environment so nothing sensitive is baked into the image or the JS bundle.
# # ---------------------------------------------------------------------------
class Settings:

    # Where the built SPA lives (Vite `dist`). Served at "/". Leave empty to run
    # the proxy API-only (e.g. behind nginx that serves the static files).
    _DEFAULT_STATIC_DIR = str(Path(__file__).resolve().parent.parent / "dist")
    STATIC_DIR = os.environ.get("LADDER_STATIC_DIR", _DEFAULT_STATIC_DIR)

app = FastAPI(title="LADDER proxy")

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
