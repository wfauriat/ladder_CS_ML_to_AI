# THE LADDER — App Synthesis (working reference)

*A compact map of the app, written so it can be pasted into a future session instead of re-reading the whole codebase. Last refreshed 2026-07-23, after the seed typo sweep and the addition of the `orienter` rung.*

---

## 1. What the app is

An interactive lecture deck: **"How computers and data work — a climb from switches to AI"** (FR: *"Comment fonctionnent les ordinateurs et les données — une ascension, des interrupteurs jusqu'à l'IA"*).

The deck is a vertical **ladder** of slides ("rungs"), each a compressed thesis *fragment*. On demand, a language model fleshes out any rung through *probes*. First answers come from a **hand-authored cache** (seeds); further answers are generated **live**. The lecturer on stage is the human "verifying step."

---

## 2. File layout — the current split

| File | Role | Touch it for authoring? |
|---|---|---|
| `src/ladderContentFr_last.js` | The **content — source of truth** (FR, v3). Exports `SLIDES`, `ACTIONS`, `CATEGORIES`. | **Yes — primary authoring file.** |
| `src/LectureLadderFr_last.jsx` | The **engine** (FR edition; the one `main.jsx` mounts). Generic UI/state/keyboard, model adapters, category rail, prompt inspector. | Rarely — UI/engine changes only. |
| `src/promptBuilder.js` | **Prompt construction**, extracted from the engine: `buildPrompt`, per-probe register table, `DECK_ABSTRACT`, output-language directive. Pure functions, framework-agnostic. | For register/tone/abstract changes. |
| `src/ladderContent.js` | EN content, **v2 — stale** (19 slides, old English ids, pre-`agents`/`apprendre`/`orienter` arc). No engine imports it anymore (`LectureLadder.jsx` was removed); kept as reference. | Only if reviving the EN deck. |
| `src/main.jsx` | Mounts `LectureLadderFr`; the EN import is commented out. | No. |
| `src/App.jsx` / `App.css` | Untouched Vite starter, unused. | No. |
| `dev/ABSTRACT.md` | Author-facing prose behind the condensed `DECK_ABSTRACT`. **Keep the two in sync.** | When the arc changes. |

The engine never changes when content changes. **Order is data:** reorder/add/drop slides by editing the array.

---

## 3. Data model

### A SLIDE (object in `SLIDES[]`)

| Field | Role | Seen by |
|---|---|---|
| `id` | Stable key (cache keys + internal). **French words now** (`sujet`, `interrupteurs`, …). Never change casually. | internal |
| `category` | Key into `CATEGORIES`; consecutive slides sharing one form a coloured pill on the rail. | room (as pill) |
| `tag` | Short left-rail label | room |
| `eyebrow` | Kicker, `"Section · concept"` | room |
| `fragment` | The headline, big type | room |
| `sub` | One-line subtext under the fragment | room |
| `anchor` | **Ground truth in English: intended meaning + deck-theme ties + "differentiate from neighbours" notes.** Written as an instruction to the model; constrains every live generation. | **model only** |
| `seeds` | Precomputed cached answers, per probe | room (on click) |

**`CATEGORIES`**: `cs` (blue #6FA8DC), `ml` (mauve #B39DDB), `ai` (pink #E28AAE), `stack` (amber triangle pill, unlabeled — the opening frame), `hinge` (split cs/ml colours, unlabeled — `motifs`).

**`seeds[probeId]`** is EITHER one string OR an array of strings.
- Array → browsable alternatives, shown as `‹ n sur m ›` before any live call.
- Omit a probe → its first click goes straight to the live model.
- **Current seeding state:** every slide seeds all 7 probes with 1–4 variants each, EXCEPT `sujet` (no `threads` seed).
- Seeds are plain text rendered raw: **no markdown** (`*…*` would display literally).

### A PROBE (object in `ACTIONS[]`)

`{ id, label (FR button text), task (English instruction spliced into the prompt) }`. Current probes, in order:

| id | FR label | Register enforced (in promptBuilder) |
|---|---|---|
| `more` | En savoir plus | lay, ≤110 words, halfway between fragment and anchor |
| `example` | Un exemple | one concrete everyday scene |
| `synthesis` | Résumé technique | **technical**, ≤130 words |
| `differently` | Autre perspective | fresh analogy each time |
| `risk` | Difficultés ? | limitations/risks w.r.t. CS/data-science |
| `bite` | Une surprise ? | one concrete real-world failure/cost |
| `threads` | Dérouler un fil | **special — see below** |

**`threads` is cross-fed:** `buildPrompt` injects the slide's **first** `synthesis` seed variant as context, then asks for 3–5 deeper pointers, one per line, no bullets. Rendered as **clickable chips**; clicking one loads it into the task box wrapped as a question (`THREAD_QUESTION_PREFIX` in the engine: *"Answer the following question with more details. You can target a more technical audience: '…'"*).

**The custom box is a TASK box**, not a question box: its text is sent verbatim as the prompt's TASK (`buildCustomTask` is a passthrough).

---

## 4. Slide order (the climb, base → top)

**23 slides.** The left rail reads bottom-to-top: `SLIDES[0]` (`sujet`) is the base.

1. `sujet` — the opening frame (▲ stack) — operations not magic; the twin climb (reach up / certainty down) held model-only
2. **cs:** `interrupteurs` · `opérations` · `memoire` · `arbitre` · `code` · `algorithmes` · `abstractions` · `assemblages` · `perturbations`
3. **hinge:** `motifs` — one layer below · map ≠ territory · everything is a tradeoff (epistemic ladder latent in anchor)
4. **ml:** `apprendre` · `representation` · `correlation` · `generalisation` · `incertitude`
5. **ai:** `motsuivant` · `taille` · `orienter` · `couts` · `contexte` · `probables` · `agents`

The AI arc's internal logic: *principle* (`motsuivant`) + *infrastructure/scale* (`taille`) = pre-training; then *orientation* (`orienter` — fine-tuning + context engineering turn the raw predictor into an assistant; the deck's "rules" reattach here); then *economics* (`couts`); then *memory at usage time* (`contexte` — stateless model, knowledge tiered across frozen weights / the window / external stores: the `memoire` hierarchy recurring with freshness & verifiability at stake); then *the non-deterministic top layer* (`probables`), *action* (`agents`).

**EN/FR id parity is dead** — the FR ids are the only cache keys that matter while the EN deck is stale.

---

## 5. Prompt construction (`src/promptBuilder.js`)

`buildPrompt({ slide, probe, priorAnswers, outputLanguage = "fr", deckTitle, options })` assembles, in order:

1. Role line (lecture-deck engine, audience from the register table).
2. **`DECK_ABSTRACT`** — condensed whole-deck synopsis, prepended to every prompt (`INCLUDE_ABSTRACT = true` toggle; v1 kept commented for A/B). Now includes the `orienter` clause ("an orientation phase … rules return…") and the `contexte` clause ("use is stateless: knowledge splits across frozen weights, the window, external stores…").
3. FRAGMENT + SUBTEXT.
4. INTENDED MEANING = the `anchor`, declared ground truth.
5. For `threads` only: the first `synthesis` seed as "TECHNICAL SYNTHESIS".
6. TASK = the probe's `task` (or the custom box's text verbatim).
7. Anti-repetition block: prior answers for this slide+probe, truncated to 2400 chars.
8. Register RULES (see probe table above; `custom` = adaptive, ≤130 words).
9. **Output-language directive appended last** — fr: idiomatic spoken French, "not a translation," projected and read aloud.

**Implication for authoring:** seeds must match the register their probe enforces; `synthesis`/`threads` technical, the rest plain, vivid, ~100 words, breathing for read-aloud.

---

## 6. Model adapters (engine)

Single choke-point: `callModel(prompt, { mode, apiKey })`. **Four engines**, toggled in the header (choice persisted at `localStorage["ladder.mode"]`); per-provider keys never mix (each mode declares `keyEnv` + `keyStore`):

- **local** — `qwen3:8b` via Ollama native `/api/chat`, `think:false` (kills chain-of-thought that ate the token budget). 120 s timeout, `num_predict` 512, temp 0.8, random seed per call.
- **cloud** — `claude-sonnet-5` via Anthropic API, direct from browser (`anthropic-dangerous-direct-browser-access`). Key: `VITE_ANTHROPIC_API_KEY` env or `ladder.apiKey`.
- **mistral** — `mistral-medium-2508` via `api.mistral.ai` (OpenAI-shaped response). Key: `VITE_MISTRAL_API_KEY` env or `ladder.mistralKey`. Depends on Mistral's CORS.
- **proxy** ("local-mistral") — same-origin `POST /api/generate {prompt} → {text}`; a Python/FastAPI proxy adds Kerberos/SPNEGO and relays to a private Mistral endpoint. No key or endpoint URL in the browser; 130 s timeout; FastAPI `{detail}` errors surfaced in the red panel.

---

## 7. UI / interaction (engine)

- **Left rail:** rungs bottom-to-top, current one amber; **category pills** span each run (vertical label; ▲ triangle for `stack`; split-colour unlabeled pill for the hinge; clicking a pill jumps to the run's first slide). Rail is sticky and scrolls internally.
- **Header:** eyebrow + slide counter → engine toggle (4 modes) → **`prompt on/off`** toggle: when on, each generation opens a non-blocking overlay showing the exact prompt sent (copy/close).
- **Key bar** appears only for modes with `needsKey`.
- **Main column:** fragment (big) → sub → probe buttons → task box (*"Formulez votre propre tâche…"* + Exécuter ↵) → response panel.
- **Response panel:** source badge — amber ■ *pré-calculé* vs green ● *en direct · (claude|qwen|mistral)*; version browser `‹ n sur m ›`; `↻ générer` / `↻ en générer une autre`; typewriter reveal on live text (click to skip; off under `prefers-reduced-motion`); `threads` render as chips.
- **Keyboard:** `↑↓` rungs · `←→` probes · `C` cycle versions · `G` generate. Second click on the active probe also cycles versions. Footer: `↓ descendre` / `monter ↑`.
- **Palette:** phosphor-on-dark; amber = stored, green = live.

---

## 8. Content state & open items (as of 2026-07-23)

- **FR content file is the only live layer.** A ~30-fix typo/grammar sweep of all read-aloud seeds was completed 2026-07-23 (incl. the two English typos in the `more` task and the thread-prefix "audience").
- **`orienter` added** after `taille` (fragment/sub hand-authored, anchor by Claude); **seeds populated** via templated Opus interactions (bite: the April 2025 ChatGPT sycophancy rollback). `sujet` still lacks a `threads` seed.
- **`contexte` added** between `couts` and `probables` (authored end-to-end by Claude, kept after the author's review, 2026-07-23; tag "contexte"). Thesis: statelessness + three memory tiers (frozen weights / context window as only working memory / external stores via approximate retrieval) = the `memoire` hierarchy recurring with freshness & verifiability at stake. Bite: Bing insisting Avatar 2 wasn't out (Feb 2023).
- **EN deck stale:** `ladderContent.js` is v2 (19 slides, old ids); the EN engine file was removed. Decide eventually: re-derive EN from FR v3, or drop.
- **Remaining candidates from the 2026-07-23 review** (decision: distribute as seeds/threads, no more rungs): reasoning / automated decomposition → one `agents` seed (learned decomposition without contracts — its constructive on-ramp) + a `couts` thread on test-time compute (buying reliability with sequential tokens); tool calls as the top layer calling back down the deterministic stack (fold into the same `agents` seed); promote the "vérification asymétrique" thread (`probables`) to a room-facing seed — the deck's most actionable takeaway; an anthropomorphism/Eliza-effect seed (fluency ≠ competence).
- **Style backlog (deliberate, low priority):** "bogue" vs "bug" inconsistency; French spacing before `;`/`:`; tense mix "gagnerons/payons" in `sujet` more[1].

---

## 9. Quick-reference invariants (don't break these)

- FR slide `id`s are **stable cache keys** — never rename casually.
- `anchor` is model-only, English, written as an instruction — never shown to the room.
- Register lives in **promptBuilder.js**, not the content; seeds must conform to their probe's register.
- `threads` = one pointer per line, no bullets/numbering; it is cross-fed the **first** `synthesis` seed variant.
- Seeds: string or array (array → browsable); omitted probe → first click generates live; **no markdown inside seeds** (rendered raw).
- `category` must reference a key of `CATEGORIES`; only *consecutive* slides sharing a category merge into one pill.
- Prose fields use backticks (accents, dashes, apostrophes need no escaping; straight double quotes are fine).
- **When the arc changes** (add/move/drop a rung): update `DECK_ABSTRACT` in `promptBuilder.js` **and** `dev/ABSTRACT.md`, then refresh this file.
