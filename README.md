# LADDER

An interactive lecture deck that climbs from CS/ML fundamentals to modern AI, one rung at a time. Each slide carries hidden "anchor" notes and probe buttons (*example*, *differently*, *more*…) that generate live explanations from an LLM — with precomputed seeds as a warmed cache — so the talk can go off-script without going off-truth.

## The arc

One climb from electricity to meaning, taken as two ladders. The first half is structural — computer science: transistors as switches, bits under a reading convention, a processor pushing symbols, memory tradeoffs, the OS as arbiter, code, algorithms, abstraction and assembly — a world that is exact, inspectable, reproducible. A hinge names the recurring patterns (understand one layer below; everything is a tradeoff; the map is not the territory) and turns the deck: from there up, reach is bought with certainty. The second half is epistemic — machine learning, then LLMs: rules learned from examples instead of written, objects as points in a space, correlation not cause, generalization with irreducible error, honest uncertainty; then next-word prediction at scale, orientation into a useful assistant, the training/inference cost asymmetry, context as the model's only working memory, and finally agents, which turn probable answers into compounding actions. The through-line: each rung gains reach and loses certainty — and the human remains the verifying step the top layer can no longer promise for itself.

- **Front end** — Vite/React SPA (`src/`). The lecture itself is authored in `src/ladderContentFr_last.js`; the rendering engine never has to change.
- **Back end** — FastAPI server (`server/app_vapi.py`) that serves the built SPA and exposes one same-origin endpoint, `POST /api/generate`, which relays an OpenAI-shaped chat-completions call to the configured model endpoint.

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

## Model engines

The engine picker (top right of the deck) switches between the configured providers at runtime: a local model via Ollama, cloud APIs keyed from the browser, or the same-origin `/api/generate` proxy.

Any change to how the LLM is queried — swapping models, adding a vendor, pointing at a different local or cloud endpoint — is a dev change in the **MODEL ADAPTERS** section of `src/LectureLadderFr_last.jsx` (the `MODES` map and the `call*` functions), followed by a rebuild: `npm run build` to refresh the served `dist/`, or `npm run dev` to iterate on it live.
