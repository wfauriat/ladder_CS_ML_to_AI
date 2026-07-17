# LADDER — private-network deployment (Kerberos → local Mistral)

Adapts the browser-direct LADDER app to run on a private network where the only
model endpoint is a **local, OpenAI-compatible (Mistral)** service reached over
**Kerberos/SPNEGO via `httpx`**. Because a browser can do neither Kerberos-with-
httpx nor cross-origin calls to that endpoint cleanly, we insert a thin **Python
proxy**: it serves the built SPA *and* exposes one same-origin endpoint,
`POST /api/generate`, that adds the Kerberos auth and forwards the call.

```
Browser (built SPA)  ──POST /api/generate {prompt}──▶  Python proxy (FastAPI + httpx-gssapi)
                     ◀────────── {text} ─────────────  │  SPNEGO/Kerberos (service keytab)
                                                        ▼
                                     Local Mistral endpoint  /v1/chat/completions
```

Same origin for the SPA and `/api` ⇒ **no CORS, no API key in the browser, no
endpoint URL in the bundle.**

## What is already built here

| File | Purpose | Status |
|------|---------|--------|
| `server/app.py` | FastAPI proxy: `/api/generate`, `/api/health`, static SPA serving, Kerberos auth, OpenAI relay | **complete, reference** |
| `server/requirements.txt` | Python + system deps | complete |
| `server/.env.example` | all runtime config (endpoint, model, SPN, keytab, TLS, static dir) | complete |
| `frontend/proxyAdapter.js` | `callProxy(prompt)` — the new engine adapter (canonical source of the JSX snippet) | complete |

**Identity model assumed:** a single service account (keytab/ccache). Every app
user's request goes out under that one Kerberos identity. Per-user delegation
(S4U2Proxy) is *not* implemented — call it out if the endpoint needs it, it's a
much larger change.

---

## What remains to be done

### 1. Front-end edits (inside `src/LectureLadderFr_last.jsx`)
The engine layer is generic (the mode picker renders `Object.values(MODES)`, the
key bar is gated on `needsKey`, the dispatcher is one function), so exactly
**three small edits** wire the proxy in. `LectureLadderFr_last.jsx` was left
untouched on purpose — apply these:

**a. Add a `MODES` entry** (alongside `local`/`cloud`/`mistral`). No `needsKey`,
so the whole key-bar UI stays hidden for it:
```js
proxy: {
  id: "proxy", label: "réseau · mistral", short: "mistral",
  note: "Endpoint local via proxy Kerberos", model: MODEL_MISTRAL,
},
```

**b. Add the adapter** — paste the body of `deploy/frontend/proxyAdapter.js`
(the `callProxy` function + its `PROXY_TIMEOUT_MS` const) next to `callMistral`.

**c. Extend the dispatcher** `callModel`:
```js
function callModel(prompt, { mode, apiKey }) {
  if (mode === "proxy") return callProxy(prompt);   // ← add
  if (mode === "cloud") return callCloud(prompt, apiKey);
  if (mode === "mistral") return callMistral(prompt, apiKey);
  return callLocal(prompt);
}
```

*Optional lock-down:* on a closed network you'll likely want `MODES` to contain
**only** `proxy` (drop `local`/`cloud`/`mistral`), and set the initial `mode`
default to `"proxy"`. Nothing else in the component needs to change.

### 2. Build the SPA
```
npm ci && npm run build      # → dist/
```
If the app is served under a sub-path (not `/`), set `base` in `vite.config.js`
accordingly before building.

### 3. Kerberos infrastructure (target network — outside this repo)
- Provision a **service principal + keytab** for the proxy host; place the
  keytab where `KRB5_CLIENT_KTNAME` points.
- Confirm the endpoint gateway's **SPN** (usually `HTTP/<host>`); set
  `LADDER_SPN` only if it differs from the URL host.
- Ensure **clock sync** (NTP) with the KDC — skew breaks SPNEGO.
- Smoke-test the identity independently before wiring the app:
  ```
  kinit -k -t /etc/ladder/ladder.keytab <service-principal>
  curl --negotiate -u : -sS -X POST "$LADDER_ENDPOINT_URL" \
       -H 'Content-Type: application/json' \
       -d '{"model":"'"$LADDER_MODEL"'","messages":[{"role":"user","content":"ping"}],"max_tokens":8}'
  ```

### 4. Run / package the proxy
```
apt-get install -y libkrb5-dev krb5-user gcc        # system deps (Debian/Ubuntu)
python -m venv .venv && . .venv/bin/activate
pip install -r server/requirements.txt
cp server/.env.example server/.env                  # fill in real values
# then, with the env loaded:
uvicorn app:app --host 0.0.0.0 --port 8080          # run from server/
```
For production: run under systemd or a container, load `server/.env` as the
environment, mount the keytab read-only, point `LADDER_STATIC_DIR` at `dist/`.
(Alternative: nginx serves `dist/` and reverse-proxies `/api` → uvicorn; then
leave `LADDER_STATIC_DIR` empty and run the proxy API-only.)

### 5. Verify end-to-end
`GET /api/health` → 200; then load the app, pick the **réseau · mistral** engine,
open a rung, hit **↻ générer**, and confirm a live (green) answer comes back.

---

## Notes / decisions
- **Streaming**: kept non-streaming (`stream:false`); the front-end's typewriter
  is cosmetic, so nothing changes.
- **Prompt logic**: unchanged — `buildPrompt` still runs in the browser and the
  proxy is a thin relay that only wraps the string in `messages`.
- **Errors**: the proxy returns FastAPI `{detail}` messages that mirror the old
  local diagnostics (timeout / unreachable / 401 Kerberos / empty), and
  `callProxy` surfaces them into the existing red error panel.
