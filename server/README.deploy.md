# LADDER — private-network deployment (Kerberos → local Mistral)

Runs the browser-direct LADDER deck on a private network whose only model
endpoint is a **local, OpenAI-compatible (Mistral)** service reached over
**Kerberos/SPNEGO**. A browser can do neither Kerberos nor a clean cross-origin
call to that endpoint, so a thin **Python proxy** sits in the middle: it serves
the built SPA *and* exposes one same-origin endpoint, `POST /api/generate`, that
adds Kerberos auth and forwards the call.

```
Browser (built SPA)  ──POST /api/generate {prompt}──▶  Python proxy (FastAPI)
                     ◀────────── {text} ─────────────  │  openai SDK + httpx
                                                        │  truststore TLS
                                                        │  HTTPSPNEGOAuth (Kerberos)
                                                        ▼
                              Local Mistral endpoint  <base_url>/chat/completions
```

Same origin for the SPA and `/api` ⇒ **no CORS, no API key in the browser, no
endpoint URL in the bundle.**

## How the endpoint is called — matches your validated snippet

`server/app.py` was rewritten to build the client **exactly** as your working
Python excerpt, instead of the earlier hand-rolled httpx relay. The three things
that matter on a corporate network:

1. **TLS via `truststore`** (`truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)`) —
   trusts the internal CA from the OS store, so no certifi bundle to ship. This
   was the most likely thing to break in the old version.
2. **`api_key="EMPTY"` + `default_headers={"Authorization": Omit()}`** — the SDK
   demands a key; the dummy is stripped so it can't collide with the Kerberos
   `Negotiate` header.
3. **`HTTPSPNEGOAuth()`** (bare) — SPN derived from the endpoint host, using the
   ambient Kerberos credentials.

> **Two typos to fix in your original snippet** if you reuse it elsewhere:
> `"Autorization"` → `"Authorization"`, and `client.chat.completion.create` →
> `client.chat.completions.create`. `app.py` already uses the correct forms.

## Files here

| File | Purpose |
|------|---------|
| `server/app.py` | FastAPI proxy: `/api/generate`, `/api/health`, static SPA serving, openai-SDK relay with Kerberos+truststore |
| `server/app.reference.py` | the earlier hand-rolled httpx version, kept for reference |
| `server/requirements.txt` | Python + system deps |
| `server/.env.example` | runtime config (base_url, model, static dir, Kerberos hints) |
| `frontend/proxyAdapter.js` | `callProxy(prompt)` — canonical source of the JSX adapter |
| `LectureLadderFr_last.jsx` | **the deck, with the three edits already applied** |

**Identity model:** a single service account (keytab/ccache). Every user's
request goes out under that one Kerberos identity. Per-user delegation
(S4U2Proxy) is *not* implemented — a much larger change if the endpoint needs it.

---

## Front-end: already done

All three edits are applied in the `LectureLadderFr_last.jsx` in this folder:
a `proxy` entry in `MODES` (labelled **réseau · mistral**, no key bar), the
`callProxy` adapter next to `callMistral`, and the `proxy` branch in `callModel`.
**All four engines are kept** (proxy + local/cloud/mistral), per your choice.

If you later want to lock the deck down to the proxy only, reduce `MODES` to just
the `proxy` entry and change the initial `mode` default (line ~269) from
`"local"` to `"proxy"`. Nothing else changes.

## Build the SPA

```
npm ci && npm run build      # → dist/
```
If served under a sub-path (not `/`), set `base` in `vite.config.js` first.

## Why not `python -m http.server`?

`http.server` is static-only — it cannot handle `POST /api/generate` or add
Kerberos, and running it on a separate port reintroduces the cross-origin
problem the whole design avoids. **uvicorn serves the static SPA *and* the API
from one origin**, which is what you want, for one extra flag over `http.server`.

## Run the proxy

```
# system deps (Debian/Ubuntu) — needed to build the Kerberos wheel
apt-get install -y libkrb5-dev krb5-user gcc

python -m venv .venv && . .venv/bin/activate
pip install -r server/requirements.txt
cp server/.env.example server/.env        # fill in real values

# load env and run FROM server/
set -a; . ./server/.env; set +a
cd server && uvicorn app:app --host 0.0.0.0 --port 8080
```

With `LADDER_STATIC_DIR` pointing at your `dist/`, the deck is now at
`http://<host>:8080/` and the API at `/api`. For production run under systemd or
a container, load `server/.env` as the environment, and mount the keytab
read-only. (Alternative: nginx serves `dist/` and reverse-proxies `/api` →
uvicorn; then leave `LADDER_STATIC_DIR` empty and run the proxy API-only.)

## Kerberos (target network — outside this repo)

`HTTPSPNEGOAuth()` uses whatever credentials are ambient in the environment:

- **Dev / testing:** `kinit` in your shell first (a ccache), exactly like your
  snippet. Nothing else needed.
- **Production:** provision a **service principal + keytab** for the proxy host,
  point `KRB5_CLIENT_KTNAME` at it (and `KRB5CCNAME` at a writable cache for
  renewals). No interactive login, tickets auto-renew.

Other infra: confirm the endpoint gateway's **SPN** (usually `HTTP/<host>` —
if it differs from the URL host, that's a small code change in `_build_client`,
not an env var); keep **clock sync (NTP)** with the KDC (skew breaks SPNEGO).

Smoke-test the identity independently before wiring the app:
```
kinit -k -t /etc/ladder/ladder.keytab <service-principal>
curl --negotiate -u : -sS -X POST "$LADDER_BASE_URL/chat/completions" \
     -H 'Content-Type: application/json' \
     -d '{"model":"'"$LADDER_MODEL"'","messages":[{"role":"user","content":"ping"}],"max_tokens":8}'
```

## Verify end-to-end

`GET /api/health` → 200; then load the app, pick the **réseau · mistral**
engine, open a rung, hit **↻ générer**, and confirm a live (green) answer.

## Notes / decisions

- **Streaming**: non-streaming (`stream:false`); the front-end typewriter is
  cosmetic, so nothing changes.
- **Prompt logic**: unchanged — `buildPrompt` runs in the browser; the proxy is
  a thin relay that wraps the string in `messages`.
- **Concurrency**: the openai SDK client is synchronous (`httpx.Client`), so
  `/api/generate` runs it in a worker thread (`anyio.to_thread`) to keep the
  event loop responsive.
- **Errors**: the proxy returns FastAPI `{detail}` messages mirroring the old
  local diagnostics (timeout / unreachable / 401 Kerberos / empty); `callProxy`
  surfaces them into the existing red error panel.
