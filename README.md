# LADDER

An interactive lecture deck that climbs from CS/ML fundamentals to modern AI, one rung at a time. Each slide carries hidden "anchor" notes and probe buttons (*example*, *differently*, *more*…) that generate live explanations from an LLM — with precomputed seeds as a warmed cache — so the talk can go off-script without going off-truth.

## The arc

One climb from electricity to meaning, taken as two ladders. The first half is structural — computer science: transistors as switches, bits under a reading convention, a processor pushing symbols, memory tradeoffs, the OS as arbiter, code, algorithms, abstraction and assembly — a world that is exact, inspectable, reproducible. A hinge names the recurring patterns (understand one layer below; everything is a tradeoff; the map is not the territory) and turns the deck: from there up, reach is bought with certainty. The second half is epistemic — machine learning, then LLMs: rules learned from examples instead of written, objects as points in a space, correlation not cause, generalization with irreducible error, honest uncertainty; then next-word prediction at scale, orientation into a useful assistant, the training/inference cost asymmetry, context as the model's only working memory, and finally agents, which turn probable answers into compounding actions. The through-line: each rung gains reach and loses certainty — and the human remains the verifying step the top layer can no longer promise for itself.

- **Front end** — Vite/React SPA (`src/`). The lecture itself is authored in `src/ladderContentFr_last.js`; the rendering engine never has to change.
- **Back end** — a FastAPI server that serves the built SPA. Two variants, same static behaviour:
  - `server/app_vapi.py` — **static only**, FastAPI as its sole dependency. Serves the deck and `settings.json`; no `/api/generate`, so the `proxy` engine is unavailable and the other three (which call their endpoints directly from the browser) work normally.
  - `server/app.py` — adds `POST /api/generate`, relaying an OpenAI-shaped chat-completions call to a Kerberos-protected endpoint. Pulls in httpx, truststore, httpx-gssapi and the OpenAI SDK, plus system krb5/GSSAPI libraries. Configured entirely from the environment: `LADDER_BASE_URL`, `LADDER_MODEL`, `LADDER_MAX_TOKENS`, `LADDER_TEMPERATURE` (empty ⇒ omit the field), `LADDER_TIMEOUT_S`, `LADDER_STATIC_DIR`. `GET /api/health` reports the effective values.

## Install

```sh
./install.sh
```

One-time setup: creates a virtualenv at `server/venv` and installs the Python dependencies (`server/requirements-vapi.txt`).

## Run

```sh
./run_server.sh
```

Picks the best available mode:

1. **`dist/` exists** — activates `server/venv` if present, then serves SPA + API with uvicorn at <http://localhost:8080>.
2. **`dist/` exists but no uvicorn** — falls back to `python -m http.server` on the same port (static SPA only, no `/api`).
3. **No `dist/`** — runs `npm install` and starts the Vite dev server instead.

## Settings (no rebuild)

Behaviour that you may want to change between talks lives in **`dist/settings.json`**, a plain file the app fetches at startup — not in the bundle. Edit it, reload the page, done: no `npm run build`, no server restart.

| Key | Default | What it does |
|---|---|---|
| `includeAbstract` | `true` | Prepend the whole-deck synopsis to every prompt as shared framing. Off = each rung is generated on its own. |
| `loadSeeds` | `true` | Load the precomputed answers from the content file. Off = every probe generates live on first click, and no seed reaches the prompt. |
| `showPrompt` | `false` | Open the prompt inspector on each generation. The header's `prompt on/off` button still overrides it for the session. |
| `defaultEngine` | `"local"` | Engine on a first visit: `local`, `cloud`, `mistral` or `proxy`. |
| `engines.<id>` | see file | Per-engine `model`, `maxTokens`, `temperature`, `timeoutMs`. |

Two engine notes. `defaultEngine` only applies when no engine has been picked before — the header choice is remembered in `localStorage` and wins; clear it with `localStorage.removeItem("ladder.mode")`. And `engines.proxy` carries only `timeoutMs` on purpose: the proxy's model and token budget are server-side (`LADDER_MODEL`, `LADDER_MAX_TOKENS`), so the private endpoint's shape never reaches the browser.

Anything malformed is survivable: a missing file, bad JSON, or an ill-typed key falls back to the built-in default and says so in the browser console. The startup line `[settings] loaded /settings.json — applied:` reports each value with its provenance (`[settings.json]` vs `[default]`) — the quickest way to tell "my edit was ignored" from "my edit never arrived". Watch for `"false"` in quotes: that's a string, not a boolean, and it will be rejected.

## Model engines

The engine picker (top right of the deck) switches between the configured providers at runtime: a local model via Ollama, cloud APIs keyed from the browser, or the same-origin `/api/generate` proxy.

Swapping a model or retuning generation parameters is now a `settings.json` edit (above), not a code change. Structural work — adding a vendor, changing an endpoint URL or response shape — remains a dev change in the **MODEL ADAPTERS** section of `src/LectureLadderFr_last.jsx` (the `MODES` map and the `call*` functions), followed by a rebuild: `npm run build` to refresh the served `dist/`, or `npm run dev` to iterate live.

The local engine talks to Ollama straight from the browser, so it needs `ollama serve` running and `OLLAMA_ORIGINS` set to allow this page's origin — note that changes when you switch between the dev server and the built app on :8080.