"""
LADDER static server — the SPA, and nothing else.

WHY THIS EXISTS
---------------
A dependency-light twin of app.py. That module relays generations to a private
Kerberos-protected endpoint, which drags in httpx, truststore, httpx-gssapi and
the OpenAI SDK — plus system krb5/GSSAPI libraries at build time. When all you
need is to SERVE the built deck (browser-side engines: local Ollama, Anthropic,
Mistral), none of that is required. This file imports FastAPI only.

WHAT IT DOES NOT DO
-------------------
No /api/generate. The `proxy` ("local-mistral") engine in the deck's header
therefore cannot work against this server — it will get HTML back and report a
transport error. Use app.py when you need that engine; the other three call
their endpoints directly from the browser and are unaffected.

ROUTE ORDER MATTERS
-------------------
FastAPI matches in registration order, and the SPA fallback matches EVERYTHING.
So any real route must be registered BEFORE it. /settings.json is the one that
bites: it is a real file the front-end fetches at startup, and if the fallback
catches it first the browser receives index.html, fails to parse it as JSON,
and silently falls back to built-in defaults — the deck then ignores every
toggle in settings.json with no visible error. Hence the explicit route below,
ahead of the catch-all.
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


class Settings:
    # Where the built SPA lives (Vite `dist`). Served at "/".
    # Default: ../dist relative to THIS file's parent — i.e. if this file is at
    # <project>/server/app_vapi.py, that resolves to <project>/dist.
    _DEFAULT_STATIC_DIR = str(Path(__file__).resolve().parent.parent / "dist")
    STATIC_DIR = os.environ.get("LADDER_STATIC_DIR", _DEFAULT_STATIC_DIR)


app = FastAPI(title="LADDER static server")

_static = Path(Settings.STATIC_DIR)


@app.get("/api/health")
async def health():
    """Liveness + a straight answer to 'which files am I actually serving?'.

    Deliberately reports the RESOLVED static dir and whether the two files that
    matter are present, because the usual failure is a server pointed at a
    different dist/ than the one being edited.
    """
    return {
        "ok": True,
        "role": "static-only (no /api/generate — use app.py for the proxy engine)",
        "static_dir": str(_static),
        "index_html": (_static / "index.html").is_file(),
        "settings_json": (_static / "settings.json").is_file(),
    }


# Hashed, immutable build output — safe to cache normally.
_assets = _static / "assets"
if _assets.is_dir():
    app.mount("/assets", StaticFiles(directory=_assets), name="assets")


@app.get("/settings.json")
async def settings_json():
    """The front-end's runtime knobs (deck arc, seed pre-fill, default engine,
    per-engine model + parameters). Served with no-store so an edit is picked
    up on the next reload rather than sitting in a browser or proxy cache.

    A 404 here is honest and useful: settings.js falls back to its built-in
    defaults and logs why. Letting the SPA fallback answer instead would hand
    back index.html, which looks like success and fails silently.
    """
    path = _static / "settings.json"
    if not path.is_file():
        raise HTTPException(
            404,
            f"no settings.json in {_static} — front-end will use its built-in "
            "defaults. Vite copies public/ into dist/ at BUILD time only.",
        )
    return FileResponse(
        path,
        media_type="application/json",
        headers={"Cache-Control": "no-store, must-revalidate"},
    )


# Registered LAST: matches everything, so nothing real may come after it.
@app.get("/{full_path:path}")
async def spa(full_path: str):
    candidate = _static / full_path
    if full_path and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(_static / "index.html")