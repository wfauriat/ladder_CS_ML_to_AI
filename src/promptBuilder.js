/* ============================================================
   PROMPT BUILDER — the deck's prompt-construction logic, lifted
   out of the React engine into a standalone, framework-agnostic
   module. Pure functions, no React, no DOM: give it a context
   object, get a prompt string back.

   DESIGN
   ------
   • The prompt STEM (role, register rules, task, anti-repetition
     block, optional abstract) is authored in ENGLISH, where model
     instruction-following is sharpest.
   • A single OUTPUT-LANGUAGE directive, appended last (where models
     weight it most), forces the answer into the target language.
     Language is data (`outputLanguage`), so the English and French
     decks share this one module.
   • Anti-repetition sees PRIOR ANSWERS (optionally across probes,
     not just the current one) so the model won't recycle the same
     example, analogy or framing.
   • A short deck ABSTRACT can be prepended to every prompt as shared
     framing. Toggled at runtime by `includeAbstract` in settings.json
     (see settings.js) — no rebuild to A/B it. No UI (by request).

   The register rules are lifted verbatim from the previous inline
   buildPrompt so generation behaviour does not drift; only the
   plumbing around them changed.
   ============================================================ */

/* ------------------------------------------------------------
   OUTPUT LANGUAGE
   The directive is appended at the very end of the prompt. Add a
   language here to support another deck; the stem stays English.
   ------------------------------------------------------------ */
import { getSettings } from "./settings.js";

const OUTPUT_LANGUAGE_DIRECTIVE = {
  fr: `OUTPUT LANGUAGE: write your entire answer in FRENCH. It will be projected on screen and read aloud by a French-speaking lecturer, so it must sound like natural, idiomatic spoken French — NOT A TRANSLATION, so write as if you generated french to convey the meaning in your english context. Keep all reasoning above in mind, but produce only French prose. Do not preface the answer with any note about the language.`,
  en: `OUTPUT LANGUAGE: write your entire answer in ENGLISH.`,
};

/* ------------------------------------------------------------
   DECK ABSTRACT (toggleable)
   A condensed synopsis of the whole deck, prepended as shared
   framing so every rung is generated with the arc in view. Kept
   deliberately short.

   The on/off switch now lives in `settings.json` (`includeAbstract`,
   default true) and is read at call time — no rebuild to A/B it.
   A caller may still force it per call via options.includeAbstract.
   ------------------------------------------------------------ */

/* PREVIOUS ABSTRACT (v1) — kept for development / A-B testing. To revert,
   comment out the active DECK_ABSTRACT below and uncomment this one.
   ---------------------------------------------------------------------
const DECK_ABSTRACT = `DECK ARC (context, not to be restated): The deck is a single climb from electricity to meaning, taken as two parallel ladders at once. One is structural — transistors → bits under a reading convention → CPU operations → memory tradeoffs → OS arbitration → code → algorithms → abstraction, assembly and defensive building — where meaning is composed upward from mechanism, exact and inspectable. The other is epistemic: the learning and AI half spends those guarantees for reach — rules learned from examples instead of authored, objects as points in space, correlation not cause, generalization to the unseen, calibrated uncertainty, then large language models (next-word prediction at scale, train-once economics) as the non-deterministic top layer, and agents as its instantiation that acts. The through-line: each rung gains reach and loses certainty; the human is the verifying step the top layer can no longer promise for itself. This rung sits somewhere on that climb.`;
   --------------------------------------------------------------------- */

// ACTIVE ABSTRACT (v2) — the reworked "two ladders" synopsis, with the cost
// asymmetry corrected (training parallel + heavy, inference sequential + light).
// The full author-facing prose lives in ABSTRACT.md; this is its condensed,
// model-facing framing, prepended to every prompt and kept deliberately short.

const DECK_ABSTRACT = `DECK ARC (context, not to be restated): The deck is a single climb from electricity to meaning, taken as two parallel ladders at once. Ladder A — structural: transistors as fast switches → bits that mean nothing until a convention reads them → a processor pushing symbols with trivial, deterministic operations at speed → memory's near-fast-vs-far-large tradeoff → an OS rationing finite resources → code as machine steps written in words, translated exactly to the metal → algorithms whose scaling decides what is feasible → composition as the discipline of building (abstract behind a "what" that hides its "how"; assemble borrowed parts that leak; build defensively because networks drop, code drifts and inputs lie) — a half that is exact, inspectable, reproducible. A hinge names the recurring ideas (understand one layer below; everything is a tradeoff; the map is never the territory) and turns the deck: from here up, reach is bought with certainty. Ladder B — epistemic: learn rules from examples instead of writing them, so the data becomes the program → objects as points in a space where similarity is geometry → correlation, not cause, drifting from the training snapshot → generalization to the unseen with irreducible error → predictions usable only with an honest, calibrated measure of their own confidence. The AI half is this epistemic layer at full scale: next-word prediction, from which grammar, facts and something like reasoning emerge; scale as the engine (billions of parameters, colossal parallel arithmetic, abilities appearing "as if from nowhere"); an orientation phase that turns the raw predictor into a useful assistant — the "rules" return, learned from hand-crafted examples and human preferences (fine-tuning) or supplied per call in the context; and an asymmetric economics — training is parallel and heavy, a massive one-time cost, while inference is sequential and light, one token after the last. And use is stateless: knowledge splits across frozen weights (broad, dated, uncitable), the small context window that is the model's only working memory, and external stores reached by approximate retrieval — the memory hierarchy returning with freshness and verifiability at stake. So generative AI is the non-deterministic top layer of the abstraction stack: specify a context and let a statistical translator produce a result — more reach, weaker guarantee, the two ladders meeting at their floor. Agents instantiate it — a probably-right system given tools and a goal turns its guesses into compounding actions — so the human verifying step stops being optional. Through-line: each rung gains reach and loses certainty; the human on stage is the verifying step the top layer can no longer promise for itself. This rung sits somewhere on that climb.`;

/* ------------------------------------------------------------
   REGISTER TABLE
   Per-probe: audience + rules. Lifted verbatim from the previous
   inline buildPrompt. `threads` also pulls in the slide's technical
   synthesis as context (assembled in buildPrompt, not here).
   ------------------------------------------------------------ */
/* How the slide's `anchor` is introduced. The authored probes fence the answer
   inside it (it IS the slide); `custom` reframes it as the starting point the
   listener's own task may travel from. Default is verbatim the old wording so
   generation behaviour for the seven authored probes does not drift. */
const DEFAULT_ANCHOR_FRAMING =
  "INTENDED MEANING: stay strictly inside this, it is the ground truth of the slide:";

const DEFAULT_REGISTER = {
  audience: "an intelligent lay audience",
  rules: `RULES:
- At most 110 words. The text is projected and read aloud, so it must breathe.
- Concrete and vivid. Any technical term gets an instant plain-words translation.
- Plain prose only: no headings, no bullet points, no markdown.
- Do not restate the fragment; add to it.`,
};

const REGISTER_BY_PROBE = {
  synthesis: {
    audience: "a scientifically literate reader (comfortable with technical vocabulary)",
    rules: `RULES:
- Register: precise and technical. Use correct domain-specific terminology; do NOT translate terms into plain words, but avoid needless jargon and all hype.
- Be synthetic and explicit: compress the essential content into clear, connected prose — more comprehensive than the fragment, close to the intended meaning.
- At most 130 words. Plain prose only: no headings, no bullet points, no markdown.
- Do not restate the fragment verbatim; make it precise.`,
  },
  threads: {
    audience: "a scientifically literate reader (comfortable with technical vocabulary)",
    rules: `RULES:
- Offer 3 to 5 "threads" worth pulling to go deeper: each a specific concept, mechanism, term, result, or open question a technically-minded listener could investigate next — grounded in the intended meaning above.
- One thread per line. Each is a compact, self-contained pointer: name the thing, then a few words on what pulling it opens up. No numbering, no bullets, no markdown, no preamble.
- Domain-specific and precise; prefer the concrete over the vague, and keep the whole set under ~100 words.`,
  },
  /* CUSTOM — the listener's own task, and the one register that yields to it.
     The other probes are authored instruments with a fixed shape; this one is
     whatever was typed in the box. So the task governs: it sets the scope (one
     rung, several rungs, the whole arc, or a step outside the deck), the depth
     and the register, and the guidance below only fills what the task leaves
     unsaid. The anchor arrives as a starting point rather than a fence — see
     anchorFraming. */
  custom: {
    audience: "an engaged listener who may be lay or technical",
    anchorFraming:
      "THIS RUNG'S INTENDED MEANING — the listener asked from here, so this is where the answer starts. It anchors the task; it does not fence it. Follow the task wherever it leads, including across other rungs of the arc above or outside the deck entirely, and keep this accurate wherever it bears on the answer:",
    rules: `RULES:
- The listener's TASK governs. Follow its direction, scope and depth. Where it asks for something these rules did not anticipate, the task wins — treat the rest of this list as defaults for whatever the task leaves unspecified.
- Scope follows the task, not the slide. If it calls for comparing rungs, tracing a thread through the climb, standing back from the deck, or answering something the deck only touches in passing, do that fully and without apology or meta-commentary about leaving the slide.{{ARC_CLAUSE}}
- Match the register the task implies — technical if it is technical, plain if it is plain — and match its form: a question wants an answer, a comparison wants a comparison, a request to be brief wants brevity.
- Say so plainly if the task rests on a false premise, or if answering well needs something the deck does not contain; then give the best answer you can.
- Default length about 130 words, but follow the task if it asks for shorter or longer. Plain prose only: no headings, no bullet points, no markdown — unless the task explicitly asks for a list, in which case use one line per item, no bullet characters.`,
  },
};

/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */

/* NOTE — `threads` used to be cross-fed the slide's first `synthesis` seed as
   its base. It now pulls from the ANCHOR instead, which is already in every
   prompt as INTENDED MEANING. Three reasons, in order of weight:
     • The anchor is the ground truth; a seed is one rendering of it. Pulling
       threads from a rendering means pulling from a lossy copy.
     • The anchor carries what threads actually need — the cross-rung ties and
       the "not this neighbour" boundaries (every slide has them) — which the
       room-facing synthesis prose deliberately leaves out.
     • It is seed-independent, so `threads` behaves identically whether or not
       settings.loadSeeds is on, and drops a duplicated block from the prompt.
   The seed lookup this replaced is gone; nothing else read it. */

/* The anti-repetition block. `priorAnswers` is an array of strings —
   previously generated/shown texts the model should not echo. Truncated
   to a character budget so the prompt stays bounded. */
function buildAvoidBlock(priorAnswers, charBudget, { soft = false } = {}) {
  if (!priorAnswers || priorAnswers.length === 0) return "";
  const joined = priorAnswers
    .filter(Boolean)
    .map((t, i) => `--- earlier answer ${i + 1} ---\n${t}`)
    .join("\n")
    .slice(0, charBudget);
  if (!joined) return "";
  // Soft mode (custom): a directive not to repeat would fight a task that
  // legitimately asks to revisit, extend or compare against what came before.
  // So the earlier answers are given as context, and only redundancy is ruled
  // out — the task still decides what to do with them.
  const preamble = soft
    ? `\nAlready said on this rung (context, not a constraint): unless the TASK asks you to build on, revisit or compare against these, avoid simply restating them — add something they do not already give:`
    : `\nDo NOT repeat the framing, analogies or examples of these earlier answers — reach for a genuinely fresh angle, and in particular do not reuse the same concrete example:`;
  return `${preamble}\n${joined}`;
}

/* The custom-task probe: the box now holds a TASK authored by the user (or a
   thread question prefaced into one), spliced verbatim as the prompt's TASK.
   Kept here so all task-string construction lives in one module. */
export const CUSTOM_ACTION = { id: "custom", label: "your task" };
export const buildCustomTask = (task) => task;


/* ------------------------------------------------------------
   buildPrompt — the single entry point.

   ctx = {
     slide,                 // SLIDES[] entry: fragment, sub, anchor, id, seeds
     probe,                 // ACTIONS[] entry (or a custom probe): id, task
     priorAnswers = [],     // strings the model should not repeat
     outputLanguage = "fr", // "fr" | "en" — which directive to append
     deckTitle,             // shown in the role line
     options = {},          // { includeAbstract, priorCharBudget }
   }

   Every argument except `slide` and `probe` is optional and defaults
   sensibly, so callers stay terse.
   ------------------------------------------------------------ */
export function buildPrompt(ctx) {
  const {
    slide,
    probe,
    priorAnswers = [],
    outputLanguage = "fr",
    deckTitle = "How computers, learning and AI work",
    options = {},
  } = ctx;

  const {
    includeAbstract = getSettings().includeAbstract,
    priorCharBudget = 2400,
  } = options;

  const register = REGISTER_BY_PROBE[probe.id] || DEFAULT_REGISTER;
  const { audience, rules } = register;
  const anchorFraming = register.anchorFraming || DEFAULT_ANCHOR_FRAMING;

  // `threads` pulls from the INTENDED MEANING above rather than a separate
  // block: the anchor is already the richest statement of the rung, including
  // the cross-rung ties and neighbour boundaries threads are made of. This
  // just tells the model to read it that way.
  const context =
    probe.id === "threads"
      ? `\nThe INTENDED MEANING above is the base to pull threads from: mine it for the mechanisms it names, the ties it draws to other rungs, and the boundaries it sets against neighbouring ones — the threads live there and just beyond it.\n`
      : "";

  const avoid = buildAvoidBlock(priorAnswers, priorCharBudget, {
    soft: probe.id === "custom",
  });

  const abstract = includeAbstract ? `${DECK_ABSTRACT}` : "";

  // The custom rules invite the model to reach for the deck arc when a task is
  // cross-cutting — but only if the arc is actually in the prompt. With
  // includeAbstract off, that sentence would point at nothing, so it is dropped
  // and the model is told to work from this rung alone.
  const rulesResolved = rules.replace(
    "{{ARC_CLAUSE}}",
    includeAbstract
      ? " Use the DECK ARC above as your map of the other rungs when the task is cross-cutting."
      : " You have only this rung in front of you: if the task reaches for other rungs, work from what you know of the subject and say where you are inferring rather than reading off the deck."
  );

  const languageDirective =
    OUTPUT_LANGUAGE_DIRECTIVE[outputLanguage] || OUTPUT_LANGUAGE_DIRECTIVE.fr;

  // The role line. For `custom` the audience is whoever the task implies, so
  // asserting one here would compete with the task's own direction.
  const roleLine =
    probe.id === "custom"
      ? `You are the live explanation engine embedded in a lecture deck titled "${deckTitle}". A listener has typed their own task into the box; carrying it out well is the whole job, and it may take you beyond the rung on screen. Pitch it for ${audience}, unless the task implies otherwise — then follow the task.`
      : `You are the live explanation engine embedded in a lecture deck titled "${deckTitle}", for ${audience}. `;

  return `${roleLine}

${abstract}

The lecturer is projecting this fragment on screen:

FRAGMENT: "${slide.fragment}"
SUBTEXT: "${slide.sub}"

${anchorFraming}
${slide.anchor}
${context}
TASK: ${probe.task}${avoid}

${rulesResolved}

${languageDirective}`;

}