import React, { useState, useEffect, useRef, useCallback } from "react";
import { SLIDES, ACTIONS } from "./ladderContent.js";

/* ============================================================
   THE LADDER — a lecture instrument
   Spine: 1 thesis + 8 rungs, each a compressed fragment.
   Flesh: probes ("tell me more", "give me an example", ...)
   answered from a cache seeded with precomputed text and
   extended live by a model call.

   SWAPPING THE MODEL:
   All generation goes through callModel() below. Inside
   claude.ai it hits the Anthropic API (no key needed here).
   To run against a local model (e.g. Qwen via Ollama or
   llama.cpp, OpenAI-compatible), drop this component into a
   plain Vite app and replace callModel() with the commented
   variant underneath it. Nothing else changes.
   ============================================================ */

const C = {
  bg: "#191410",
  panel: "#231C15",
  panelEdge: "#3B2F21",
  text: "#EFE7DA",
  muted: "#9C8D78",
  faint: "#6E6252",
  amber: "#F2A93B",      // phosphor amber — stored / precomputed
  green: "#9FD8A0",      // phosphor green — live generation
  red: "#E08A6D",
};

const DISPLAY = "'Archivo', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

/* SLIDES (the spine) and ACTIONS (the probes) are hand-authored in a
   separate content module so this component stays generic. */

function buildPrompt(slide, action, previousTexts) {
  const avoid =
    previousTexts.length > 0
      ? "\nDo NOT repeat the framing, analogies or examples of these earlier answers:\n" +
        previousTexts
          .map((t, i) => `--- earlier answer ${i + 1} ---\n${t}`)
          .join("\n")
          .slice(0, 2400)
      : "";
  // Per-probe register: audience, an optional extra context block, and rules.
  const synthesis = Array.isArray(slide.seeds?.synthesis)
    ? slide.seeds.synthesis[0]
    : slide.seeds?.synthesis || "";
  let audience = "an intelligent lay audience";
  let context = "";
  let rules = `RULES:
- At most 110 words. The text is projected and read aloud, so it must breathe.
- Concrete and vivid. Any technical term gets an instant plain-words translation.
- Plain prose only: no headings, no bullet points, no markdown.
- Do not restate the fragment; add to it.`;
  if (action.id === "synthesis") {
    audience = "a scientifically literate reader (comfortable with technical vocabulary)";
    rules = `RULES:
- Register: precise and technical. Use correct domain-specific terminology; do NOT translate terms into plain words, but avoid needless jargon and all hype.
- Be synthetic and explicit: compress the essential content into clear, connected prose — more comprehensive than the fragment, close to the intended meaning.
- At most 130 words. Plain prose only: no headings, no bullet points, no markdown.
- Do not restate the fragment verbatim; make it precise.`;
  } else if (action.id === "threads") {
    audience = "a scientifically literate reader (comfortable with technical vocabulary)";
    context = synthesis
      ? `\nTECHNICAL SYNTHESIS (the base to pull threads from):\n${synthesis}\n`
      : "";
    rules = `RULES:
- Offer 3 to 5 "threads" worth pulling to go deeper: each a specific concept, mechanism, term, result, or open question a technically-minded listener could investigate next — grounded in the synthesis above and the intended meaning.
- One thread per line. Each is a compact, self-contained pointer: name the thing, then a few words on what pulling it opens up. No numbering, no bullets, no markdown, no preamble.
- Domain-specific and precise; prefer the concrete over the vague, and keep the whole set under ~100 words.`;
  } else if (action.id === "custom") {
    audience = "an engaged listener who may be lay or technical";
    rules = `RULES:
- Answer the listener's question directly and honestly, grounded in the intended meaning above; if it strays beyond the slide, answer briefly and say so.
- Accessible first, but you may use precise terms with a quick gloss where they earn their place.
- At most 130 words. Plain prose only: no headings, no bullet points, no markdown.`;
  }
  return `You are the live explanation engine embedded in a lecture deck titled "How computers and data work", for ${audience}. The lecturer is projecting this fragment on screen:

FRAGMENT: "${slide.fragment}"
SUBTEXT: "${slide.sub}"

INTENDED MEANING \u2014 stay strictly inside this, it is the ground truth of the slide:
${slide.anchor}
${context}
TASK: ${action.task}${avoid}

${rules}`;
}

/* The custom-question probe: the user's own question, framed against the slide. */
const CUSTOM_ACTION = { id: "custom", label: "your question" };
const buildCustomTask = (question) =>
  `Answer the listener's own question about this slide. Question: "${question}"`;

/* ------------------------------------------------------------
   MODEL ADAPTERS — the ONLY place that knows about an endpoint.
   Two engines, chosen live from the UI:
     • local — Qwen via Ollama (OpenAI-compatible, on localhost)
     • cloud — Claude via the Anthropic API (needs an API key)
   Everything else is engine-agnostic: it calls
   callModel(prompt, { mode, apiKey }) and gets text back.
   ------------------------------------------------------------ */
// qwen3 is a "thinking" model: its chain-of-thought can eat the whole token
// budget and leave `content` empty. callLocal disables it with `think: false`
// on the native API, so any qwen3 tag works; -nothink is just belt-and-braces.
const MODEL_LOCAL = "qwen3";
const MODEL_CLOUD = "claude-sonnet-5";

const MODES = {
  local: { id: "local", label: "local · qwen", note: "Ollama · localhost:11434" },
  cloud: { id: "cloud", label: "cloud · claude", note: "Anthropic API · api.anthropic.com" },
};

/* Local engine — Qwen via Ollama, using the NATIVE /api/chat endpoint.

   Why native rather than the OpenAI-compatible /v1 path: qwen3 is a
   "thinking" model. On /v1 its hidden chain-of-thought streams first and,
   when it runs long, consumes the entire token budget before any answer is
   produced — the reply comes back finish_reason "length" with an EMPTY
   content field, which surfaced as intermittent "Empty completion" errors.
   The native endpoint honors `think: false`, switching reasoning off at the
   engine (verified: thinking → 0 tokens, answer filled), removing the
   failure at its source and cutting latency.

   Layered defenses below: think:false (root cause), an AbortController
   timeout so a stuck / cold-loading request fails cleanly instead of
   hanging, a generous num_predict cap, and errors that name the actual
   fault (unreachable / timeout / HTTP / truncated / empty).

   Run Ollama with the dev origin allowed so the browser may call it:
     OLLAMA_ORIGINS="http://localhost:5173" ollama serve
   and pull a model once:  ollama pull qwen3:8b */
const LOCAL_TIMEOUT_MS = 120000; // abort a stuck / cold-loading request
const LOCAL_NUM_PREDICT = 512;   // ample for a ~110-word answer; caps runaway
const LOCAL_TEMPERATURE = 0.8;   // a little spread so regenerations diverge

async function callLocal(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL_LOCAL,
        stream: false,
        think: false, // disable qwen3 chain-of-thought — the root of empty replies
        // Ollama defaults to a FIXED seed, so an identical prompt returns an
        // identical answer — "generate another" would just repeat itself. A
        // fresh random seed each call (plus a mild temperature) makes regens
        // genuinely differ; the prompt's "avoid earlier answers" block then
        // steers them apart in content too.
        options: {
          num_predict: LOCAL_NUM_PREDICT,
          temperature: LOCAL_TEMPERATURE,
          seed: Math.floor(Math.random() * 1e9),
        },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.error || ""; } catch { /* non-JSON body */ }
      throw new Error(`Ollama answered ${response.status}${detail ? ` — ${detail}` : ""}`);
    }
    const data = await response.json();
    const raw = data?.message?.content ?? "";
    // Belt-and-suspenders: strip any <think>…</think> a model might still inline,
    // plus a dangling unclosed opener if reasoning leaked without a close.
    const text = raw
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/^\s*<think>[\s\S]*$/, "")
      .trim();
    if (!text) {
      if (data?.done_reason === "length")
        throw new Error(
          `model used its ${LOCAL_NUM_PREDICT}-token budget before answering — raise num_predict or confirm think:false is honored`
        );
      throw new Error("local model returned an empty answer");
    }
    return text;
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error(`local model timed out after ${LOCAL_TIMEOUT_MS / 1000}s — it may be loading or overloaded`, { cause: err });
    if (err instanceof TypeError)
      throw new Error("cannot reach Ollama at localhost:11434 — is `ollama serve` running with OLLAMA_ORIGINS set for this origin?", { cause: err });
    throw err; // our own diagnostic Errors pass through unchanged
  } finally {
    clearTimeout(timer);
  }
}

/* Cloud engine — Claude via the Anthropic API.
   Running outside claude.ai (this local Vite app) means calling the API
   directly from the browser: that needs an API key AND the explicit
   "dangerous-direct-browser-access" opt-in header to clear CORS.
   The key lives only in this browser (see the key bar in the UI). */
async function callCloud(prompt, apiKey) {
  if (!apiKey) throw new Error("no API key set — add one in the key bar");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL_CLOUD,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic answered ${response.status}`);
  const data = await response.json();
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Empty completion");
  return text;
}

/* Dispatcher — pick the engine for this call. */
function callModel(prompt, { mode, apiKey }) {
  return mode === "cloud" ? callCloud(prompt, apiKey) : callLocal(prompt);
}

/* ------------------------------------------------------------ */

export default function LectureLadder() {
  const [slideIdx, setSlideIdx] = useState(0);
  // history[slideId][actionId] = [{ text, source: 'precomputed' | 'live' }]
  const [history, setHistory] = useState(() => {
    const h = {};
    for (const s of SLIDES) {
      h[s.id] = {};
      for (const a of ACTIONS) {
        // a seed may be one string or an array of alternatives
        const seed = s.seeds && s.seeds[a.id];
        const seedList = Array.isArray(seed) ? seed : seed != null ? [seed] : [];
        h[s.id][a.id] = seedList.map((text) => ({ text, source: "precomputed" }));
      }
      h[s.id].custom = []; // the user's own questions (no seed)
    }
    return h;
  });
  const [active, setActive] = useState({}); // slideId -> actionId
  const [viewIdx, setViewIdx] = useState({}); // `${slideId}:${actionId}` -> number
  const [loading, setLoading] = useState(null); // actionId while generating
  const [customQ, setCustomQ] = useState(""); // the custom-question draft box
  const customQRef = useRef(""); // latest draft, read by the G key
  const customInputRef = useRef(null); // focused when a thread chip is clicked
  const setCustom = (v) => { customQRef.current = v; setCustomQ(v); };
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(null); // { key, full, shown }
  const typingTimer = useRef(null);
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // engine selection: 'local' (Ollama) or 'cloud' (Anthropic)
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem("ladder.mode");
      if (saved === "local" || saved === "cloud") return saved;
    } catch {}
    return "local";
  });
  const [apiKey, setApiKey] = useState(() => {
    try {
      const env = import.meta.env?.VITE_ANTHROPIC_API_KEY;
      if (env) return env;
      return localStorage.getItem("ladder.apiKey") || "";
    } catch {}
    return "";
  });
  const [keyDraft, setKeyDraft] = useState("");
  const [editingKey, setEditingKey] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("ladder.mode", mode); } catch {}
  }, [mode]);
  useEffect(() => {
    try { if (apiKey) localStorage.setItem("ladder.apiKey", apiKey); } catch {}
  }, [apiKey]);

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    setApiKey(k);
    setEditingKey(false);
    setKeyDraft("");
    setError(null);
  };

  const slide = SLIDES[slideIdx];
  const activeActionId = active[slide.id] || null;
  const activeAction =
    ACTIONS.find((a) => a.id === activeActionId) ||
    (activeActionId === "custom" ? CUSTOM_ACTION : null);
  const entries = activeActionId ? history[slide.id][activeActionId] : [];
  const vKey = activeActionId ? `${slide.id}:${activeActionId}` : null;
  const shownIdx =
    vKey != null && viewIdx[vKey] != null
      ? viewIdx[vKey]
      : 0; // default to the first authored alternative; live gens set viewIdx explicitly
  const entry = entries[shownIdx] || null;

  /* elapsed-seconds counter while generating (patience UI) */
  useEffect(() => {
    if (loading == null) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  /* typewriter reveal — live generations only */
  const startTyping = useCallback((key, full) => {
    if (reduceMotion.current) return;
    if (typingTimer.current) clearInterval(typingTimer.current);
    const pieces = full.split(/(\s+)/);
    let i = 0;
    setTyping({ key, full, shown: "" });
    typingTimer.current = setInterval(() => {
      i = Math.min(pieces.length, i + 2);
      const shown = pieces.slice(0, i).join("");
      setTyping({ key, full, shown });
      if (i >= pieces.length) {
        clearInterval(typingTimer.current);
        typingTimer.current = null;
        setTyping(null);
      }
    }, 30);
  }, []);

  const skipTyping = useCallback(() => {
    if (typingTimer.current) clearInterval(typingTimer.current);
    typingTimer.current = null;
    setTyping(null);
  }, []);

  const generate = useCallback(
    async (s, a) => {
      setError(null);
      setLoading(a.id);
      try {
        const prev = history[s.id][a.id].map((e) => e.text);
        const text = await callModel(buildPrompt(s, a, prev), { mode, apiKey });
        setHistory((h) => {
          const next = { ...h, [s.id]: { ...h[s.id] } };
          next[s.id][a.id] = [...h[s.id][a.id], { text, source: "live", via: mode }];
          return next;
        });
        const newIdx = history[s.id][a.id].length;
        setViewIdx((v) => ({ ...v, [`${s.id}:${a.id}`]: newIdx }));
        if (a.id !== "threads") // threads render as clickable chips, no typewriter
          startTyping(`${s.id}:${a.id}:${newIdx}`, text);
      } catch (err) {
        setError(err.message || "The model endpoint did not respond.");
      } finally {
        setLoading(null);
      }
    },
    [history, startTyping, mode, apiKey]
  );

  // First click on a probe just displays it (its cached version, or an empty
  // panel prompting "generate"). Clicking the already-active probe cycles
  // through its versions if there is more than one. Never auto-generates.
  // Advance the active probe to its next cached version, wrapping around.
  // Shared by the C key and a second click on the active probe.
  const cycleVersion = useCallback(() => {
    if (!activeActionId) return;
    const list = history[slide.id][activeActionId];
    if (list.length <= 1) return;
    skipTyping();
    const vk = `${slide.id}:${activeActionId}`;
    setViewIdx((v) => {
      const cur = v[vk] != null ? v[vk] : 0;
      return { ...v, [vk]: (cur + 1) % list.length };
    });
  }, [activeActionId, history, slide.id, skipTyping]);

  const selectAction = (a) => {
    setError(null);
    if (a.id !== activeActionId) {
      setActive((m) => ({ ...m, [slide.id]: a.id }));
      return;
    }
    cycleVersion(); // second click on the active probe cycles its versions
  };

  const browse = (delta) => {
    if (!vKey) return;
    skipTyping();
    const next = Math.min(entries.length - 1, Math.max(0, shownIdx + delta));
    setViewIdx((v) => ({ ...v, [vKey]: next }));
  };

  const goto = useCallback(
    (i) => {
      skipTyping();
      setError(null);
      setSlideIdx(i);
    },
    [skipTyping]
  );

  // Left/Right switch probes (display only — never auto-generates).
  const moveProbe = useCallback(
    (delta) => {
      if (loading != null) return;
      setError(null);
      skipTyping();
      const cur = activeActionId
        ? ACTIONS.findIndex((a) => a.id === activeActionId)
        : -1;
      const nextIdx =
        cur === -1
          ? delta > 0
            ? 0
            : ACTIONS.length - 1
          : Math.min(ACTIONS.length - 1, Math.max(0, cur + delta));
      setActive((m) => ({ ...m, [slide.id]: ACTIONS[nextIdx].id }));
    },
    [loading, activeActionId, slide.id, skipTyping]
  );

  // The custom-question probe: answer the user's own question, routed through the
  // same history/typewriter machinery under a per-slide "custom" bucket.
  const generateCustom = useCallback(
    (question) => {
      const q = (question || "").trim();
      if (!q || loading != null) return;
      setActive((m) => ({ ...m, [slide.id]: "custom" }));
      generate(slide, { id: "custom", task: buildCustomTask(q) });
    },
    [loading, slide, generate]
  );

  // Generate a fresh live answer for the active probe (the G key and the
  // "generate" button both route here). No-op with no probe or mid-request.
  const generateCurrent = useCallback(() => {
    if (loading != null) return;
    if (activeActionId === "custom") return generateCustom(customQRef.current);
    if (!activeAction) return;
    generate(slide, activeAction);
  }, [loading, activeActionId, activeAction, slide, generate, generateCustom]);

  // keyboard: ↑/↓ rungs, ←/→ probes, C cycle versions, G generate.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return; // leave copy/paste & OS shortcuts alone
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goto(Math.min(SLIDES.length - 1, slideIdx + 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        goto(Math.max(0, slideIdx - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveProbe(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveProbe(-1);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        cycleVersion();
      } else if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        generateCurrent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideIdx, goto, moveProbe, cycleVersion, generateCurrent]);

  const entryKey = vKey ? `${vKey}:${shownIdx}` : null;
  const isTypingThis = typing && typing.key === entryKey;
  const displayText = entry ? (isTypingThis ? typing.shown : entry.text) : "";

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: C.bg, color: C.text, fontFamily: DISPLAY }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .rung-btn:focus-visible, .probe-btn:focus-visible, .nav-btn:focus-visible {
          outline: 2px solid ${C.amber}; outline-offset: 2px;
        }
        .thread-chip:hover, .thread-chip:focus-visible {
          border-color: ${C.green} !important;
          background: rgba(159,216,160,0.12) !important;
          outline: none;
        }
        @keyframes blinkCursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .cursor-blink { animation: blinkCursor 0.9s step-end infinite; }
        @media (prefers-reduced-motion: reduce) { .cursor-blink { animation: none; } }
      `}</style>

      <div className="flex flex-1 min-h-0">
        {/* ladder — vertical tag navigation (base at the bottom, climb up) */}
        <nav
          aria-label="Rungs"
          className="hidden md:flex flex-col-reverse justify-center items-stretch gap-1.5 px-4"
          style={{ borderRight: `1px solid ${C.panelEdge}` }}
        >
          {SLIDES.map((s, i) => {
            const here = i === slideIdx;
            return (
              <button
                key={s.id}
                className="rung-btn"
                onClick={() => goto(i)}
                aria-label={s.fragment}
                aria-current={here ? "true" : undefined}
                title={s.fragment}
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  padding: "4px 9px",
                  borderRadius: 4,
                  border: `1px solid ${here ? C.amber : "transparent"}`,
                  background: here ? "rgba(242,169,59,0.08)" : "transparent",
                  color: here ? C.amber : i < slideIdx ? C.muted : C.faint,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                {s.tag}
              </button>
            );
          })}
        </nav>

        {/* main slide */}
        <main className="flex-1 flex flex-col px-6 md:px-14 py-8 md:py-10 min-w-0">
          {/* eyebrow + engine toggle */}
          <div
            className="flex items-center gap-4 mb-5 flex-wrap"
            style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em" }}
          >
            <span style={{ color: C.amber, textTransform: "uppercase" }}>
              {slide.eyebrow}
            </span>
            <span style={{ color: C.faint }}>
              {slideIdx === 0 ? "base of the ladder" : `${slideIdx} / ${SLIDES.length - 1}`}
            </span>
            <div className="ml-auto flex items-center gap-1" role="group" aria-label="Engine">
              {Object.values(MODES).map((m) => {
                const on = mode === m.id;
                return (
                  <button
                    key={m.id}
                    className="probe-btn"
                    onClick={() => setMode(m.id)}
                    disabled={loading != null}
                    title={m.note}
                    aria-pressed={on}
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "5px 10px",
                      borderRadius: 4,
                      border: `1px solid ${on ? C.amber : C.panelEdge}`,
                      background: on ? "rgba(242,169,59,0.08)" : "transparent",
                      color: on ? C.amber : C.faint,
                      cursor: loading != null ? "wait" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* key bar — only relevant in cloud mode */}
          {mode === "cloud" && (
            <div
              className="flex items-center gap-2 mb-5 flex-wrap"
              style={{ fontFamily: MONO, fontSize: 12 }}
            >
              {apiKey && !editingKey ? (
                <>
                  <span style={{ color: C.green }}>&#9679; API key set</span>
                  <button
                    onClick={() => { setKeyDraft(""); setEditingKey(true); }}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: MONO, fontSize: 12, textDecoration: "underline", padding: 0 }}
                  >
                    change
                  </button>
                  <span style={{ color: C.faint }}>· model: {MODEL_CLOUD}</span>
                </>
              ) : (
                <>
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && keyDraft.trim()) saveKey(); }}
                    placeholder="Anthropic API key (sk-ant-…)"
                    aria-label="Anthropic API key"
                    style={{
                      flex: "1 1 260px",
                      minWidth: 0,
                      background: C.bg,
                      border: `1px solid ${C.panelEdge}`,
                      borderRadius: 4,
                      color: C.text,
                      fontFamily: MONO,
                      fontSize: 12,
                      padding: "7px 10px",
                    }}
                  />
                  <button
                    onClick={saveKey}
                    disabled={!keyDraft.trim()}
                    style={{
                      background: keyDraft.trim() ? "rgba(242,169,59,0.08)" : "transparent",
                      border: `1px solid ${keyDraft.trim() ? C.amber : C.panelEdge}`,
                      borderRadius: 4,
                      color: keyDraft.trim() ? C.amber : C.faint,
                      fontFamily: MONO,
                      fontSize: 12,
                      padding: "7px 12px",
                      cursor: keyDraft.trim() ? "pointer" : "default",
                    }}
                  >
                    save
                  </button>
                  {apiKey && (
                    <button
                      onClick={() => { setEditingKey(false); setKeyDraft(""); }}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: MONO, fontSize: 12, textDecoration: "underline", padding: 0 }}
                    >
                      cancel
                    </button>
                  )}
                  <span style={{ color: C.faint }}>stored in this browser only</span>
                </>
              )}
            </div>
          )}

          {/* the fragment */}
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontSize: "clamp(1.7rem, 4.6vw, 3.6rem)",
              maxWidth: "20ch",
            }}
          >
            {slide.fragment}
          </h1>
          <p
            className="mt-4"
            style={{
              color: C.muted,
              fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
              maxWidth: "58ch",
              lineHeight: 1.5,
            }}
          >
            {slide.sub}
          </p>

          {/* probes */}
          <div className="flex flex-wrap gap-2 mt-8" role="group" aria-label="Probes">
            {ACTIONS.map((a) => {
              const isActive = a.id === activeActionId;
              return (
                <button
                  key={a.id}
                  className="probe-btn"
                  onClick={() => selectAction(a)}
                  title={
                    isActive && history[slide.id][a.id].length > 1
                      ? `Click to cycle versions (${history[slide.id][a.id].length})`
                      : undefined
                  }
                  disabled={loading != null}
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    padding: "9px 14px",
                    borderRadius: 4,
                    border: `1px solid ${isActive ? C.amber : C.panelEdge}`,
                    background: isActive ? "rgba(242,169,59,0.08)" : "transparent",
                    color: isActive ? C.amber : C.muted,
                    cursor: loading != null ? "wait" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {a.label}
                </button>
              );
            })}
          </div>

          {/* custom question box — type your own, or click a thread above */}
          <div className="flex gap-2 mt-3">
            <input
              ref={customInputRef}
              type="text"
              value={customQ}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && customQ.trim()) generateCustom(customQ); }}
              placeholder="Type your own question…"
              aria-label="Ask your own question about this rung"
              disabled={loading != null}
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                background: C.bg,
                border: `1px solid ${activeActionId === "custom" ? C.amber : C.panelEdge}`,
                borderRadius: 4,
                color: C.text,
                fontFamily: MONO,
                fontSize: 13,
                padding: "9px 12px",
              }}
            />
            <button
              className="probe-btn"
              onClick={() => generateCustom(customQ)}
              disabled={!customQ.trim() || loading != null}
              style={{
                fontFamily: MONO,
                fontSize: 13,
                padding: "9px 16px",
                borderRadius: 4,
                border: `1px solid ${customQ.trim() ? C.amber : C.panelEdge}`,
                background: customQ.trim() ? "rgba(242,169,59,0.08)" : "transparent",
                color: customQ.trim() ? C.amber : C.faint,
                cursor: customQ.trim() && loading == null ? "pointer" : "default",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              Ask ↵
            </button>
          </div>

          {/* response panel */}
          <div
            className="mt-5 flex-1 min-h-0 flex flex-col"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelEdge}`,
              borderRadius: 6,
              minHeight: 220,
            }}
          >
            {activeAction == null && (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <p style={{ color: C.faint, fontFamily: MONO, fontSize: 13, maxWidth: "44ch", lineHeight: 1.7 }}>
                  Pick a probe. The model fleshes out the rung on demand — first
                  answers come from the prepared cache, “generate another” asks live.
                </p>
              </div>
            )}

            {activeAction != null && (
              <>
                {/* panel header */}
                <div
                  className="flex items-center gap-3 px-4 py-2 flex-wrap"
                  style={{ borderBottom: `1px solid ${C.panelEdge}`, fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em" }}
                >
                  {entry && (
                    <span
                      style={{
                        color: entry.source === "live" ? C.green : C.amber,
                        textTransform: "uppercase",
                      }}
                    >
                      {entry.source === "live"
                        ? `\u25CF live \u00B7 ${entry.via === "cloud" ? "claude" : "qwen"}`
                        : "\u25A0 precomputed"}
                    </span>
                  )}
                  {entries.length > 1 && (
                    <span className="flex items-center gap-1" style={{ color: C.faint }}>
                      <button className="nav-btn" onClick={() => browse(-1)} disabled={shownIdx === 0}
                        style={{ background: "none", border: "none", color: shownIdx === 0 ? C.panelEdge : C.muted, cursor: "pointer", fontSize: 13, padding: "0 4px" }}
                        aria-label="Earlier answer">‹</button>
                      {shownIdx + 1} of {entries.length}
                      <button className="nav-btn" onClick={() => browse(1)} disabled={shownIdx >= entries.length - 1}
                        style={{ background: "none", border: "none", color: shownIdx >= entries.length - 1 ? C.panelEdge : C.muted, cursor: "pointer", fontSize: 13, padding: "0 4px" }}
                        aria-label="Later answer">›</button>
                    </span>
                  )}
                  <span className="ml-auto">
                    <button
                      className="nav-btn"
                      onClick={() => (activeActionId === "custom" ? generateCustom(customQRef.current) : generate(slide, activeAction))}
                      disabled={loading != null}
                      style={{
                        background: "none",
                        border: `1px solid ${C.panelEdge}`,
                        borderRadius: 4,
                        color: loading != null ? C.faint : C.green,
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        padding: "4px 10px",
                        cursor: loading != null ? "wait" : "pointer",
                      }}
                    >
                      {loading != null
                        ? "\u2026"
                        : entries.length === 0
                        ? "\u21BB generate"
                        : "\u21BB generate another"}
                    </button>
                  </span>
                </div>

                {/* panel body */}
                <div
                  className="px-5 py-5 overflow-y-auto"
                  onClick={isTypingThis ? skipTyping : undefined}
                  style={{ cursor: isTypingThis ? "pointer" : "default" }}
                  title={isTypingThis ? "Click to reveal all" : undefined}
                >
                  {loading != null ? (
                    <p style={{ fontFamily: MONO, color: C.green, fontSize: 14, lineHeight: 1.8 }}>
                      asking the model… {elapsed}s{" "}
                      <span className="cursor-blink">▊</span>
                    </p>
                  ) : error ? (
                    <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.7 }}>
                      <p style={{ color: C.red }}>
                        Generation failed — {error}. Check the connection, then try again.
                      </p>
                      <button
                        className="nav-btn mt-3"
                        onClick={() => (activeActionId === "custom" ? generateCustom(customQRef.current) : generate(slide, activeAction))}
                        style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 4, color: C.red, fontFamily: MONO, fontSize: 12, padding: "5px 12px", cursor: "pointer" }}
                      >
                        Try again
                      </button>
                    </div>
                  ) : entry && activeAction.id === "threads" ? (
                    <div className="flex flex-col gap-2" style={{ maxWidth: "72ch" }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.08em" }}>
                        pick a thread to load it into your question box below ↓
                      </span>
                      {entry.text
                        .split("\n")
                        .map((l) => l.replace(/^[-•–→\s]+/, "").trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <button
                            key={i}
                            className="thread-chip"
                            onClick={() => { setCustom(line); customInputRef.current?.focus(); }}
                            title="Load into your question box"
                            style={{
                              textAlign: "left",
                              fontFamily: MONO,
                              fontSize: "clamp(0.85rem, 1.4vw, 1rem)",
                              lineHeight: 1.5,
                              color: C.text,
                              background: "rgba(159,216,160,0.06)",
                              border: `1px solid ${C.panelEdge}`,
                              borderRadius: 6,
                              padding: "9px 12px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {line}
                          </button>
                        ))}
                    </div>
                  ) : entry ? (
                    <p
                      style={{
                        fontFamily: MONO,
                        fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                        lineHeight: 1.85,
                        color: C.text,
                        whiteSpace: "pre-wrap",
                        maxWidth: "72ch",
                      }}
                    >
                      {displayText}
                      {isTypingThis && <span className="cursor-blink" style={{ color: C.green }}>▊</span>}
                    </p>
                  ) : (
                    <p style={{ fontFamily: MONO, color: C.faint, fontSize: 14, lineHeight: 1.8, maxWidth: "60ch" }}>
                      No prepared version for this probe. Press{" "}
                      <span style={{ color: C.green }}>↻ generate</span> above to
                      ask the {mode === "cloud" ? "cloud model" : "local model"}.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* footer: slide navigation */}
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.1em" }}>
              ↑↓ rungs · ←→ probes · C cycle · G generate
            </span>
            <div className="flex gap-2">
              <button
                className="nav-btn"
                onClick={() => goto(Math.max(0, slideIdx - 1))}
                disabled={slideIdx === 0}
                style={{ fontFamily: MONO, fontSize: 13, padding: "8px 16px", borderRadius: 4, border: `1px solid ${C.panelEdge}`, background: "transparent", color: slideIdx === 0 ? C.faint : C.text, cursor: slideIdx === 0 ? "default" : "pointer" }}
              >
                ↓ down
              </button>
              <button
                className="nav-btn"
                onClick={() => goto(Math.min(SLIDES.length - 1, slideIdx + 1))}
                disabled={slideIdx === SLIDES.length - 1}
                style={{ fontFamily: MONO, fontSize: 13, padding: "8px 16px", borderRadius: 4, border: `1px solid ${C.amber}`, background: "rgba(242,169,59,0.08)", color: slideIdx === SLIDES.length - 1 ? C.faint : C.amber, cursor: slideIdx === SLIDES.length - 1 ? "default" : "pointer" }}
              >
                climb ↑
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
