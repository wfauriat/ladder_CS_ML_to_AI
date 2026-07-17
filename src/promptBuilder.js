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
     framing. Toggled by INCLUDE_ABSTRACT below — comment/uncomment
     to A/B it. No UI (by request).

   The register rules are lifted verbatim from the previous inline
   buildPrompt so generation behaviour does not drift; only the
   plumbing around them changed.
   ============================================================ */

/* ------------------------------------------------------------
   OUTPUT LANGUAGE
   The directive is appended at the very end of the prompt. Add a
   language here to support another deck; the stem stays English.
   ------------------------------------------------------------ */
const OUTPUT_LANGUAGE_DIRECTIVE = {
  fr: `OUTPUT LANGUAGE: write your entire answer in FRENCH. It will be projected on screen and read aloud by a French-speaking lecturer, so it must sound like natural, idiomatic spoken French — NOT A TRANSLATION, so write as if you generated french to convey the meaning in your english context. Keep all reasoning above in mind, but produce only French prose. Do not preface the answer with any note about the language.`,
  en: `OUTPUT LANGUAGE: write your entire answer in ENGLISH.`,
};

/* ------------------------------------------------------------
   DECK ABSTRACT (toggleable)
   A condensed synopsis of the whole deck, prepended as shared
   framing so every rung is generated with the arc in view. Kept
   deliberately short. Flip INCLUDE_ABSTRACT to test with/without.
   ------------------------------------------------------------ */
const INCLUDE_ABSTRACT = true; // ← toggle here (comment logic below is driven by this)

/* PREVIOUS ABSTRACT (v1) — kept for development / A-B testing. To revert,
   comment out the active DECK_ABSTRACT below and uncomment this one.
   ---------------------------------------------------------------------
const DECK_ABSTRACT = `DECK ARC (context, not to be restated): The deck is a single climb from electricity to meaning, taken as two parallel ladders at once. One is structural — transistors → bits under a reading convention → CPU operations → memory tradeoffs → OS arbitration → code → algorithms → abstraction, assembly and defensive building — where meaning is composed upward from mechanism, exact and inspectable. The other is epistemic: the learning and AI half spends those guarantees for reach — rules learned from examples instead of authored, objects as points in space, correlation not cause, generalization to the unseen, calibrated uncertainty, then large language models (next-word prediction at scale, train-once economics) as the non-deterministic top layer, and agents as its instantiation that acts. The through-line: each rung gains reach and loses certainty; the human is the verifying step the top layer can no longer promise for itself. This rung sits somewhere on that climb.`;
   --------------------------------------------------------------------- */

// ACTIVE ABSTRACT (v2) — the reworked "two ladders" synopsis, with the cost
// asymmetry corrected (training parallel + heavy, inference sequential + light).
// The full author-facing prose lives in ABSTRACT.md; this is its condensed,
// model-facing framing, prepended to every prompt and kept deliberately short.

const DECK_ABSTRACT = `DECK ARC (context, not to be restated): The deck is a single climb from electricity to meaning, taken as two parallel ladders at once. Ladder A — structural: transistors as fast switches → bits that mean nothing until a convention reads them → a processor pushing symbols with trivial, deterministic operations at speed → memory's near-fast-vs-far-large tradeoff → an OS rationing finite resources → code as machine steps written in words, translated exactly to the metal → algorithms whose scaling decides what is feasible → composition as the discipline of building (abstract behind a "what" that hides its "how"; assemble borrowed parts that leak; build defensively because networks drop, code drifts and inputs lie) — a half that is exact, inspectable, reproducible. A hinge names the recurring ideas (understand one layer below; everything is a tradeoff; the map is never the territory) and turns the deck: from here up, reach is bought with certainty. Ladder B — epistemic: learn rules from examples instead of writing them, so the data becomes the program → objects as points in a space where similarity is geometry → correlation, not cause, drifting from the training snapshot → generalization to the unseen with irreducible error → predictions usable only with an honest, calibrated measure of their own confidence. The AI half is this epistemic layer at full scale: next-word prediction, from which grammar, facts and something like reasoning emerge; scale as the engine (billions of parameters, colossal parallel arithmetic, abilities appearing "as if from nowhere"); and an asymmetric economics — training is parallel and heavy, a massive one-time cost, while inference is sequential and light, one token after the last. So generative AI is the non-deterministic top layer of the abstraction stack: specify a context and let a statistical translator produce a result — more reach, weaker guarantee, the two ladders meeting at their floor. Agents instantiate it — a probably-right system given tools and a goal turns its guesses into compounding actions — so the human verifying step stops being optional. Through-line: each rung gains reach and loses certainty; the human on stage is the verifying step the top layer can no longer promise for itself. This rung sits somewhere on that climb.`;

/* ------------------------------------------------------------
   REGISTER TABLE
   Per-probe: audience + rules. Lifted verbatim from the previous
   inline buildPrompt. `threads` also pulls in the slide's technical
   synthesis as context (assembled in buildPrompt, not here).
   ------------------------------------------------------------ */
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
- Offer 3 to 5 "threads" worth pulling to go deeper: each a specific concept, mechanism, term, result, or open question a technically-minded listener could investigate next — grounded in the synthesis above and the intended meaning.
- One thread per line. Each is a compact, self-contained pointer: name the thing, then a few words on what pulling it opens up. No numbering, no bullets, no markdown, no preamble.
- Domain-specific and precise; prefer the concrete over the vague, and keep the whole set under ~100 words.`,
  },
  custom: {
    audience: "an engaged listener who may be lay or technical",
    rules: `RULES:
- Answer the listener's question directly and honestly, grounded in the intended meaning above; if it strays beyond the slide, answer briefly and say so.
- Accessible first, but you may use precise terms with a quick gloss where they earn their place.
- At most 130 words. Plain prose only: no headings, no bullet points, no markdown.`,
  },
};

/* ------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------ */

/* A slide's synthesis seed may be a string or an array of variants. */
function synthesisSeedOf(slide) {
  const s = slide?.seeds?.synthesis;
  return Array.isArray(s) ? s[0] || "" : s || "";
}

/* The anti-repetition block. `priorAnswers` is an array of strings —
   previously generated/shown texts the model should not echo. Truncated
   to a character budget so the prompt stays bounded. */
function buildAvoidBlock(priorAnswers, charBudget) {
  if (!priorAnswers || priorAnswers.length === 0) return "";
  const joined = priorAnswers
    .filter(Boolean)
    .map((t, i) => `--- earlier answer ${i + 1} ---\n${t}`)
    .join("\n")
    .slice(0, charBudget);
  if (!joined) return "";
  return `\nDo NOT repeat the framing, analogies or examples of these earlier answers — reach for a genuinely fresh angle, and in particular do not reuse the same concrete example:\n${joined}`;
}

/* The custom-question probe: the user's own question, framed against the
   slide. Kept here so all task-string construction lives in one module. */
export const CUSTOM_ACTION = { id: "custom", label: "your question" };
export const buildCustomTask = (question) =>
  `Answer the listener's own question about this slide. Question: "${question}"`;

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
    includeAbstract = INCLUDE_ABSTRACT,
    priorCharBudget = 2400,
  } = options;

  const register = REGISTER_BY_PROBE[probe.id] || DEFAULT_REGISTER;
  const { audience, rules } = register;

  // `threads` is cross-fed the slide's technical synthesis as its base.
  const context =
    probe.id === "threads" && synthesisSeedOf(slide)
      ? `\nTECHNICAL SYNTHESIS (the base to pull threads from):\n${synthesisSeedOf(slide)}\n`
      : "";

  const avoid = buildAvoidBlock(priorAnswers, priorCharBudget);

  const abstract = includeAbstract ? `${DECK_ABSTRACT}` : "";

  const languageDirective =
    OUTPUT_LANGUAGE_DIRECTIVE[outputLanguage] || OUTPUT_LANGUAGE_DIRECTIVE.fr;

  return `You are the live explanation engine embedded in a lecture deck titled "${deckTitle}", for ${audience}. 

${abstract}

The lecturer is projecting this fragment on screen:

FRAGMENT: "${slide.fragment}"
SUBTEXT: "${slide.sub}"

INTENDED MEANING: stay strictly inside this, it is the ground truth of the slide:
${slide.anchor}
${context}
TASK: ${probe.task}${avoid}

${rules}

${languageDirective}`;

}