# THE LADDER — App Synthesis (working reference)

*A compact map of the app, written so it can be pasted into a future session instead of re-reading the whole codebase. Today's focus: sharpening content and de-literalizing the French translation.*

---

## 1. What the app is

An interactive lecture deck: **"How computers and data work — a climb from switches to AI"** (FR: *"Comment fonctionnent les ordinateurs et les données — une ascension, des interrupteurs jusqu'à l'IA"*).

The deck is a vertical **ladder** of slides ("rungs"), each a compressed thesis *fragment*. On demand, a language model fleshes out any rung through *probes*. First answers come from a **hand-authored cache** (seeds); further answers are generated **live**. The lecturer on stage is the human "verifying step."

---

## 2. File layout — the clean split

| File | Role | Touch it for authoring/translation? |
|---|---|---|
| `LectureLadder.jsx` | The **engine**. Generic, content-agnostic. Renders whatever the content module provides. Holds all register/tone rules (in `buildPrompt`), model adapters, UI, keyboard, state. | **Rarely.** Only if changing prompt register, tone rules, or UI. |
| `ladderContent.js` | The **English content**. Exports `SLIDES` and `ACTIONS`. | **Yes — primary EN file.** |
| `ladderContentFr.js` | The **French content**. Same shape, translated. A parallel `LectureLadderFr.jsx` is assumed to import it. | **Yes — primary FR file.** |

The engine never has to change when content changes. **Order is data:** reorder/add/drop slides by editing the array.

---

## 3. Data model

### A SLIDE (object in `SLIDES[]`)

| Field | Role | Seen by |
|---|---|---|
| `id` | Stable key (cache keys + internal). **Must match across EN and FR files.** Never change casually. | internal |
| `tag` | Short left-rail label (e.g. `switches` / `interrupteurs`) | room |
| `eyebrow` | Kicker, `"Section · concept"` | room |
| `fragment` | The headline, big type | room |
| `sub` | One-line subtext under the fragment | room |
| `anchor` | **Ground truth: intended meaning + limits + "differentiate from neighbours" notes.** Constrains every live generation. Written as an instruction to the model. | **model only** |
| `seeds` | Precomputed cached answers, per probe | room (on click) |

**`seeds[probeId]`** is EITHER one string OR an array of strings.
- Array → browsable alternatives, shown as `‹ 1 of 4 ›` before any live call.
- Omit a probe entirely → its first click goes straight to the live model.
- Convention in current content: slides seed `threads`, `synthesis`, `more`, `example`; they leave `differently`, `risk`, `bite` to generate live. The **root** slide's `more` is an array of 3 (a template); every other slide has a single-string `more`.

### A PROBE (object in `ACTIONS[]`)

`{ id, label (button text), task (instruction spliced into the prompt) }`.

Current probes, in order:

| id | EN label | FR label | Notes |
|---|---|---|---|
| `more` | Tell me more | En dire plus | lay register, ≤110 words |
| `example` | Give an example | Donner un exemple | one concrete everyday scene |
| `synthesis` | Technical synthesis | Synthèse technique | **technical register**, ≤130 words |
| `differently` | Explain it differently | Expliquer autrement | fresh analogy each time |
| `risk` | What limitations/risks? | Limites / risques ? | |
| `bite` | An example that bites? | Un exemple qui mord ? | one concrete failure/cost |
| `threads` | Threads to pull | Fils à tirer | **special — see below** |

**`threads` is cross-fed:** `buildPrompt` injects the slide's `synthesis` seed as extra context, then asks for 3–5 deeper pointers. Rendered as clickable chips that load into the custom-question box. One thread per line, no bullets.

---

## 4. Slide order (the climb, base → top)

18 slides in five arcs. IDs are stable and shared between EN and FR.

1. `root` — the climb (opening frame)
2. **The machine:** `switches` · `steps` · `os` · `memory`
3. **Instructing:** `code` · `algorithms`
4. **Assembling:** `stacks` · `gluing` · `defensive`
5. **Recurring (base plate):** `recurring`
6. **Learning from data:** `learningparadigm` · `space` · `correlation` · `generalization` · `uncertainty`
7. **The AI paradigm:** `nextword` · `scale` · `trainonce` · `probably`

The left rail reads **bottom-to-top**: `SLIDES[0]` (`root`) is the base of the climb.

---

## 5. Prompt construction (`buildPrompt`, in the engine)

Every prompt injects: `fragment`, `sub`, `anchor` (as declared ground truth), the probe's `task`, and an **"avoid repeating earlier answers"** block (feeds prior texts, truncated ~2400 chars).

**Per-probe register switching** (this is where tone is enforced, NOT in the content file):

- **Default** (`more`, `example`, `differently`, `risk`, `bite`): audience = "intelligent lay audience," ≤110 words, concrete/vivid, plain-words gloss on any technical term, plain prose, add to the fragment (don't restate).
- **`synthesis`**: audience = "scientifically literate," precise/technical, correct domain terms, NO plain-word translation, ≤130 words.
- **`threads`**: technical audience; fed the `synthesis` seed; asks for 3–5 concrete threads, one per line, ≤~100 words total.
- **`custom`** (user's own question): adaptive lay/technical, ≤130 words.

**Implication for editing/translation:** seeds must match the register their probe enforces. `synthesis`/`threads` seeds are technical; `more`/`example` seeds are plain, vivid, "breathing" (~100 words, projected and read aloud).

---

## 6. Model adapters (engine)

Single choke-point: `callModel(prompt, { mode, apiKey })`. Two engines, toggled in the UI:

- **local** — Qwen 3 8B via Ollama, native `/api/chat` endpoint, `think:false` (kills chain-of-thought that otherwise ate the token budget and returned empty). Timeout + num_predict cap + random seed per call so regenerations diverge.
- **cloud** — Claude via the Anthropic API, called directly from the browser (needs API key + `anthropic-dangerous-direct-browser-access`). Key stored in `localStorage` only.

Everything else is engine-agnostic. To run against another local model, swap `callLocal`.

---

## 7. UI / interaction (engine)

- **Left rail:** rungs, bottom-to-top, current one highlighted amber.
- **Main column:** eyebrow + engine toggle → fragment (big) → sub → probe buttons → custom-question input → response panel.
- **Response panel:** shows source badge — amber ■ *precomputed* vs green ● *live · (claude|qwen)*; version browser `‹ n of m ›`; typewriter reveal on live text (skippable by click; disabled under `prefers-reduced-motion`); `threads` render as clickable chips.
- **Keyboard:** `↑↓` rungs · `←→` probes · `C` cycle versions · `G` generate.
- **Palette:** phosphor-on-dark; amber = stored/precomputed, green = live generation.

---

## 8. State of the two content layers (for today's work)

- **`ladderContent.js` (EN):** complete, the source of truth. Fields to sharpen: `fragment`, `sub`, `anchor`, and the `seeds` prose.
- **`ladderContentFr.js` (FR):** complete and careful, but **often tracks English word order and idiom too closely** — the "too literal" problem. Typical tells to loosen in iteration: anglicisms and calqued idioms (e.g. *"se pointe vers des milliers de jobs," "le marché était simple," "tu peux tirer cent mille pages," "boring-until-catastrophic"* rendered literally), English sentence rhythm carried into French, and register slips where the plain-vs-technical line should differ from English.

### How we'll iterate (agreed loop)
1. Go **slide by slide**, in a tight amend/clean/refine loop.
2. For each field: sharpen the EN meaning first if needed, then produce **idiomatic** FR — natural for a French lecturer reading aloud, faithful to the `anchor`, matching the register the probe enforces.
3. Keep `id`s identical across EN and FR; keep seed lengths "breathing" (~100 words); preserve the `more`-as-array shape only where it already exists (root).

---

## 9. Quick-reference invariants (don't break these)

- `id` values are stable and **identical across EN/FR** (cache keys depend on them).
- `anchor` is model-only and written as an instruction — it is not shown to the room.
- Register lives in the **engine**, not the content; seeds must conform to it.
- `threads` = one pointer per line, no bullets; it is fed the `synthesis` seed.
- `more` on `root` is an **array**; elsewhere it's a single string.
- Prose fields use backticks (accents, dashes, apostrophes need no escaping).
