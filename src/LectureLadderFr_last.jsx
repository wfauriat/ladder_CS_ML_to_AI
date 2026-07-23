import React, { useState, useEffect, useRef, useCallback } from "react";
import { buildPrompt, CUSTOM_ACTION, buildCustomTask } from "./promptBuilder.js";
import { SLIDES, ACTIONS, CATEGORIES } from "./ladderContentFr_last.js";

/* ============================================================
   THE LADDER (FR) — a lecture instrument.
   French edition of LectureLadder.jsx: same engine, French UI and
   French prompts (so live generations come back in French). The
   content is hand-authored in ladderContentFr.js.
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

const SHOW_PROMPT_ON_GENERATE = false; // stale-ish (now UI button)

/* SLIDES (the spine) and ACTIONS (the probes) are hand-authored in a
   separate content module so this component stays generic. */

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
const MODEL_LOCAL = "qwen3:8b";
const MODEL_CLOUD = "claude-sonnet-5";
// const MODEL_MISTRAL = "mistral-small-latest";
const MODEL_MISTRAL = "mistral-medium-2508";


// Each engine declares its display strings and, for the cloud providers, how
// its API key is sourced (env var + localStorage slot) so keys never collide.
// The UI stays generic: it renders Object.values(MODES) and reads these fields.
const MODES = {
  local: {
    id: "local", label: "local-qwen", short: "qwen",
    note: "Ollama · localhost:11434", model: MODEL_LOCAL,
  },
  cloud: {
    id: "cloud", label: "claude", short: "claude",
    note: "Anthropic API · api.anthropic.com", model: MODEL_CLOUD,
    needsKey: true, keyStore: "ladder.apiKey", keyEnv: "VITE_ANTHROPIC_API_KEY",
    keyLabel: "Clé API Anthropic", keyHint: "Clé API Anthropic (sk-ant-…)",
  },
  mistral: {
    id: "mistral", label: "mistral", short: "mistral",
    note: "Mistral API · api.mistral.ai", model: MODEL_MISTRAL,
    needsKey: true, keyStore: "ladder.mistralKey", keyEnv: "VITE_MISTRAL_API_KEY",
    keyLabel: "Clé API Mistral", keyHint: "Clé API Mistral",
  },
  // Private-network engine: same-origin Python proxy adds Kerberos/SPNEGO and
  // relays to the local Mistral endpoint. No needsKey ⇒ the key-bar UI stays
  // hidden; no endpoint URL or key ever reaches the browser.
  proxy: {
    id: "proxy", label: "local-mistral", short: "mistral",
    note: "Endpoint local via proxy Kerberos", model: MODEL_MISTRAL,
  },
};

/* Local engine — Qwen via Ollama, using the NATIVE /api/chat endpoint.
   See LectureLadder.jsx for the full rationale. think:false disables the
   chain-of-thought at the engine; an AbortController bounds the wait; a
   random seed + mild temperature make regenerations diverge. */
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

/* Cloud engine — Claude via the Anthropic API (direct browser access). */
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

/* Cloud engine — Mistral via its OpenAI-compatible chat-completions endpoint,
   called directly from the browser with a Bearer key (mirrors callCloud). The
   response shape is OpenAI-style: choices[0].message.content. Note: unlike
   Anthropic there is no "browser access" opt-in header, so this depends on
   Mistral's CORS policy allowing the request from this origin. */
async function callMistral(prompt, apiKey) {
  if (!apiKey) throw new Error("no API key set — add one in the key bar");
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_MISTRAL,
      max_tokens: 1000,
      stream: false,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Mistral answered ${response.status}`);
  const data = await response.json();
  const text = (data?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new Error("Empty completion");
  return text;
}

/* Private-network engine — same-origin proxy that adds Kerberos/SPNEGO and
   relays to the local Mistral endpoint. The browser sends only the built
   prompt to POST /api/generate (same origin ⇒ no CORS, no key, no endpoint
   URL in the bundle) and receives { text }. All prompt logic stays in the
   browser; the proxy is a thin relay. FastAPI error bodies ({ detail }) are
   surfaced into the existing red error panel, mirroring the local diagnostics
   (timeout / unreachable / 401 Kerberos / empty). */
const PROXY_TIMEOUT_MS = 130000; // slightly above the server-side timeout

async function callProxy(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      let detail = "";
      try { detail = (await response.json())?.detail || ""; } catch { /* non-JSON body */ }
      throw new Error(`le proxy a répondu ${response.status}${detail ? ` — ${detail}` : ""}`);
    }
    const data = await response.json();
    const text = (data?.text || "").trim();
    if (!text) throw new Error("réponse vide du modèle");
    return text;
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error(`le proxy a expiré après ${PROXY_TIMEOUT_MS / 1000}s — le modèle est peut-être en cours de chargement ou surchargé`, { cause: err });
    if (err instanceof TypeError)
      throw new Error("impossible de joindre le proxy sur cette origine — le serveur est-il démarré ?", { cause: err });
    throw err; // our own diagnostic Errors pass through unchanged
  } finally {
    clearTimeout(timer);
  }
}

/* Dispatcher — pick the engine for this call. */
function callModel(prompt, { mode, apiKey }) {
  if (mode === "proxy") return callProxy(prompt);
  if (mode === "cloud") return callCloud(prompt, apiKey);
  if (mode === "mistral") return callMistral(prompt, apiKey);
  return callLocal(prompt);
}

/* ------------------------------------------------------------ */

/* Category rail — group consecutive slides sharing a `category` id so a
   single coloured pill can span the whole run. Slides without a category
   (the opening frame, the hinge) fall into pill-less singleton groups.
   Pure view derivation over the content; the engine stays content-agnostic. */
function groupSlidesByCategory(slides) {
  const groups = [];
  slides.forEach((s, i) => {
    const category = s.category || null;
    const last = groups[groups.length - 1];
    if (last && last.category === category) last.items.push({ s, i });
    else groups.push({ category, items: [{ s, i }] });
  });
  return groups;
}

/* hex → rgba, so a category's single accent colour yields both a faint
   fill and a mid-strength border — the same tint pattern as amber/green. */
function tint(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* average two hex colours into one — the hinge pill borrows this to bridge
   the accents of the two halves it belongs to. */
function blend(hexA, hexB) {
  const chan = (hex, i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16);
  const mid = (i) => Math.round((chan(hexA, i) + chan(hexB, i)) / 2).toString(16).padStart(2, "0");
  return `#${mid(0)}${mid(2)}${mid(4)}`;
}

const RAIL_PILL_WIDTH = 26; // px — fixed so tags stay aligned across pill and spacer

// The custom box is a TASK box: its text is sent verbatim as the prompt's TASK.
// A thread chip, by contrast, is a QUESTION, so loading one prefaces it into a
// task ("answer this question") before it lands in the box.
const THREAD_QUESTION_PREFIX = `Answer the following question with more details. 
You can target a more technical audience: "`;

export default function LectureLadderFr() {
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
  const [lastPrompt, setLastPrompt] = useState(null); // DEV: prompt string shown in the inspector overlay (null = hidden)
  const [showPromptEnabled, setShowPromptEnabled] = useState(SHOW_PROMPT_ON_GENERATE); // runtime toggle for the prompt inspector
  const [typing, setTyping] = useState(null); // { key, full, shown }
  const typingTimer = useRef(null);
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // engine selection: 'local' (Ollama), 'cloud' (Anthropic) or 'mistral'
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem("ladder.mode");
      if (saved && MODES[saved]) return saved;
    } catch {}
    return "local";
  });
  // per-provider API keys, each seeded from its own env var then localStorage
  // (see MODES). Keyed by mode id so the Anthropic and Mistral keys never mix.
  const [apiKeys, setApiKeys] = useState(() => {
    const keys = {};
    for (const m of Object.values(MODES)) {
      if (!m.needsKey) continue;
      try {
        keys[m.id] = import.meta.env?.[m.keyEnv] || localStorage.getItem(m.keyStore) || "";
      } catch { keys[m.id] = ""; }
    }
    return keys;
  });
  const [keyDraft, setKeyDraft] = useState("");
  const [editingKey, setEditingKey] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("ladder.mode", mode); } catch {}
  }, [mode]);
  useEffect(() => {
    for (const m of Object.values(MODES)) {
      if (!m.needsKey) continue;
      try { if (apiKeys[m.id]) localStorage.setItem(m.keyStore, apiKeys[m.id]); } catch {}
    }
  }, [apiKeys]);

  const activeMode = MODES[mode];
  const apiKey = apiKeys[mode] || "";

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    setApiKeys((prev) => ({ ...prev, [mode]: k }));
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
        // const prev = Object.values(history[s.id]).flat().map((e) => e.text);
        const prompt = buildPrompt({ slide: s, probe: a, priorAnswers: prev, outputLanguage: "fr" });
        if (showPromptEnabled) setLastPrompt(prompt);
        const text = await callModel(prompt, { mode, apiKey });
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
    [history, startTyping, mode, apiKey, showPromptEnabled]
  );

  // First click on a probe just displays it; clicking the already-active probe
  // cycles through its versions if there is more than one. Never auto-generates.
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

  // The custom-task probe: run the user's own task (its text is sent verbatim as
  // the prompt's TASK), routed through the same history/typewriter machinery
  // under a per-slide "custom" bucket.
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
        .cat-pill { transition: filter 0.15s ease; }
        .cat-pill:hover { filter: brightness(1.4); }
        @keyframes blinkCursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .cursor-blink { animation: blinkCursor 0.9s step-end infinite; }
        @media (prefers-reduced-motion: reduce) { .cursor-blink { animation: none; } }
      `}</style>

      {/* DEV prompt inspector — non-blocking overlay showing the exact prompt
          last sent to the model. Gated by SHOW_PROMPT_ON_GENERATE. */}
      {lastPrompt != null && (
        <div
          role="dialog"
          aria-label="Sent prompt"
          onClick={() => setLastPrompt(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.panel,
              border: `1px solid ${C.panelEdge}`,
              borderRadius: 8,
              width: "min(860px, 100%)",
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: `1px solid ${C.panelEdge}`,
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.12em",
                color: C.amber,
              }}
            >
              <span>PROMPT SENT · {lastPrompt.length} chars</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    try { navigator.clipboard?.writeText(lastPrompt); } catch {}
                  }}
                  style={{
                    background: "none",
                    border: `1px solid ${C.panelEdge}`,
                    borderRadius: 4,
                    color: C.muted,
                    fontFamily: MONO,
                    fontSize: 12,
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  copy
                </button>
                <button
                  onClick={() => setLastPrompt(null)}
                  style={{
                    background: "none",
                    border: `1px solid ${C.amber}`,
                    borderRadius: 4,
                    color: C.amber,
                    fontFamily: MONO,
                    fontSize: 12,
                    padding: "4px 10px",
                    cursor: "pointer",
                  }}
                >
                  close
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 16,
                overflow: "auto",
                fontFamily: MONO,
                fontSize: 12.5,
                lineHeight: 1.65,
                color: C.text,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {lastPrompt}
            </pre>
          </div>
        </div>
      )}


      <div className="flex flex-1 min-h-0">
        {/* ladder — vertical tag navigation (base at the bottom, climb up) */}
        <nav
          aria-label="Barreaux"
          className="hidden md:flex flex-col-reverse justify-end gap-2 px-4 pt-8 md:pt-10"
          style={{
            borderRight: `1px solid ${C.panelEdge}`,
            // stay glued to the top of the viewport while a long response scrolls
            // the page. A stretched flex item can't stick, so pin an explicit
            // viewport height + top-align, and let the rail scroll internally if
            // it ever outgrows a short viewport.
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {groupSlidesByCategory(SLIDES).map((group) => {
            const cat = group.category ? CATEGORIES[group.category] : null;
            // a category declares a single `color` or, for the hinge, a
            // two-colour `colors` split — resolve the pill fill + border once.
            // a `shape:"triangle"` category (the opening `stack`) clips its
            // pill into a triangle to evoke stacking, and drops the border.
            const split = cat && Array.isArray(cat.colors);
            const triangle = cat && cat.shape === "triangle";
            const pillBg = !cat
              ? null
              : split
              ? `linear-gradient(to top, ${tint(cat.colors[0], 0.2)} 0 50%, ${tint(cat.colors[1], 0.2)} 50% 100%)`
              : triangle
              ? tint(cat.color, 0.5)
              : tint(cat.color, 0.1);
            const pillBorder = !cat
              ? null
              : split
              ? tint(blend(cat.colors[0], cat.colors[1]), 0.42)
              : tint(cat.color, 0.42);
            return (
              /* The tag column is the positioning context; the pill is pinned
                 top-0/bottom-0 so it always spans the run's EXACT height (no
                 dependency on flex-stretch resolving against the vertical text).
                 The left padding reserves the pill's lane + gap, so every tag —
                 categorised or not — lines up at the same x. */
              <div
                key={group.category || group.items[0].s.id}
                className="relative flex flex-col-reverse gap-1.5"
                style={{ paddingLeft: RAIL_PILL_WIDTH + 8 }}
                role={cat && cat.label ? "group" : undefined}
                aria-label={cat && cat.label ? cat.label : undefined}
              >
                {cat && (
                  <button
                    type="button"
                    className="cat-pill rung-btn"
                    onClick={() => goto(group.items[0].i)}
                    title={`Aller à « ${group.items[0].s.tag} »`}
                    aria-label={`Aller à « ${group.items[0].s.tag} »`}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: RAIL_PILL_WIDTH,
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: triangle ? 0 : 999,
                      background: pillBg,
                      border: triangle ? "none" : `1px solid ${pillBorder}`,
                      clipPath: triangle ? "polygon(50% 0%, 100% 100%, 0% 100%)" : undefined,
                      cursor: "pointer",
                    }}
                  >
                    {cat.label && (
                      <span
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          whiteSpace: "nowrap",
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: cat.color,
                        }}
                      >
                        {cat.label}
                      </span>
                    )}
                  </button>
                )}
                {group.items.map(({ s, i }) => {
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
              </div>
            );
          })}
        </nav>

        {/* main slide */}
        <main className="flex-1 flex flex-col px-6 md:px-14 py-8 md:py-10 min-w-0">
          {/* eyebrow + engine toggle */}
          <div
            className="flex items-center gap-4 mb-3 flex-wrap"
            style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em" }}
          >
            <span style={{ color: C.amber, textTransform: "uppercase" }}>
              {slide.eyebrow}
            </span>
            <span style={{ color: C.faint }}>
              {slideIdx === 0 ? "Depuis des états élémentaires jusqu'à des objets complexes" : `${slideIdx} / ${SLIDES.length - 1}`}
            </span>
            <div className="ml-auto flex items-center gap-1" role="group" aria-label="Moteur">
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
<button
                className="probe-btn"
                onClick={() => {
                  setShowPromptEnabled((v) => {
                    const next = !v;
                    if (!next) setLastPrompt(null); // closing the toggle also dismisses any open inspector
                    return next;
                  });
                }}
                title="Afficher le prompt envoyé au modèle"
                aria-pressed={showPromptEnabled}
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "5px 10px",
                  borderRadius: 4,
                  border: `1px solid ${showPromptEnabled ? C.amber : C.panelEdge}`,
                  background: showPromptEnabled ? "rgba(242,169,59,0.08)" : "transparent",
                  color: showPromptEnabled ? C.amber : C.faint,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginLeft: 8,
                }}
              >
                prompt {showPromptEnabled ? "on" : "off"}
              </button>
            </div>
          </div>

          {/* key bar — only relevant in cloud mode */}
          {activeMode.needsKey && (
            <div
              className="flex items-center gap-2 mb-3 flex-wrap"
              style={{ fontFamily: MONO, fontSize: 12 }}
            >
              {apiKey && !editingKey ? (
                <>
                  <span style={{ color: C.green }}>&#9679; clé API enregistrée</span>
                  <button
                    onClick={() => { setKeyDraft(""); setEditingKey(true); }}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: MONO, fontSize: 12, textDecoration: "underline", padding: 0 }}
                  >
                    modifier
                  </button>
                  <span style={{ color: C.faint }}>· modèle : {activeMode.model}</span>
                </>
              ) : (
                <>
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && keyDraft.trim()) saveKey(); }}
                    placeholder={activeMode.keyHint}
                    aria-label={activeMode.keyLabel}
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
                    enregistrer
                  </button>
                  {apiKey && (
                    <button
                      onClick={() => { setEditingKey(false); setKeyDraft(""); }}
                      style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontFamily: MONO, fontSize: 12, textDecoration: "underline", padding: 0 }}
                    >
                      annuler
                    </button>
                  )}
                  <span style={{ color: C.faint }}>stockée uniquement dans ce navigateur</span>
                </>
              )}
            </div>
          )}

          {/* the fragment */}
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontSize: "clamp(1.7rem, 4.6vw, 3.6rem)",
              maxWidth: "30ch",
            }}
          >
            {slide.fragment}
          </h1>
          <p
            className="mt-4"
            style={{
              color: C.muted,
              fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
              maxWidth: "62ch",
              lineHeight: 1.5,
            }}
          >
            {slide.sub}
          </p>

          {/* probes */}
          <div className="flex flex-wrap gap-2 mt-5" role="group" aria-label="Sondes">
            {ACTIONS.map((a) => {
              const isActive = a.id === activeActionId;
              return (
                <button
                  key={a.id}
                  className="probe-btn"
                  onClick={() => selectAction(a)}
                  title={
                    isActive && history[slide.id][a.id].length > 1
                      ? `Cliquer pour faire défiler les versions (${history[slide.id][a.id].length})`
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

          {/* custom task box — type your own task, or click a thread above (loaded as a question) */}
          <div className="flex gap-2 mt-3">
            <input
              ref={customInputRef}
              type="text"
              value={customQ}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && customQ.trim()) generateCustom(customQ); }}
              placeholder="Formulez votre propre tâche…"
              aria-label="Formulez votre propre tâche sur ce barreau"
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
              Exécuter ↵
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
                <p style={{ color: C.faint, fontFamily: MONO, fontSize: 14, maxWidth: "56ch", lineHeight: 1.7 }}>
                  Choisissez une question à poser au modèle (LLM).
                  Le modèle répond en fonction du barreau/slide courant et du type de question (sonde), à la demande.
                </p>
                <p style={{ color: C.faint, fontFamily: MONO, fontSize: 14, maxWidth: "56ch", lineHeight: 1.7 }}>
                  Des réponses sont pré-calculées pour chaque sonde, « en générer une autre »
                  interroge le modèle (LLM) en direct.
                </p>
                <p style={{ color: C.faint, fontFamily: MONO, fontSize: 14, maxWidth: "56ch", lineHeight: 1.7 }}>
                  Vous pouvez choisir le fournisseur de modèle (en haut à droite).
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
                        ? `● en direct · ${MODES[entry.via]?.short || entry.via}`
                        : "■ pré-calculé"}
                    </span>
                  )}
                  {entries.length > 1 && (
                    <span className="flex items-center gap-1" style={{ color: C.faint }}>
                      <button className="nav-btn" onClick={() => browse(-1)} disabled={shownIdx === 0}
                        style={{ background: "none", border: "none", color: shownIdx === 0 ? C.panelEdge : C.muted, cursor: "pointer", fontSize: 13, padding: "0 4px" }}
                        aria-label="Réponse précédente">‹</button>
                      {shownIdx + 1} sur {entries.length}
                      <button className="nav-btn" onClick={() => browse(1)} disabled={shownIdx >= entries.length - 1}
                        style={{ background: "none", border: "none", color: shownIdx >= entries.length - 1 ? C.panelEdge : C.muted, cursor: "pointer", fontSize: 13, padding: "0 4px" }}
                        aria-label="Réponse suivante">›</button>
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
                        ? "…"
                        : entries.length === 0
                        ? "↻ générer"
                        : "↻ en générer une autre"}
                    </button>
                  </span>
                </div>

                {/* panel body */}
                <div
                  className="px-5 py-5 overflow-y-auto"
                  onClick={isTypingThis ? skipTyping : undefined}
                  style={{ cursor: isTypingThis ? "pointer" : "default" }}
                  title={isTypingThis ? "Cliquer pour tout révéler" : undefined}
                >
                  {loading != null ? (
                    <p style={{ fontFamily: MONO, color: C.green, fontSize: 14, lineHeight: 1.8 }}>
                      interrogation du modèle… {elapsed}s{" "}
                      <span className="cursor-blink">▊</span>
                    </p>
                  ) : error ? (
                    <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.7 }}>
                      <p style={{ color: C.red }}>
                        Échec de la génération — {error}. Vérifiez la connexion, puis réessayez.
                      </p>
                      <button
                        className="nav-btn mt-3"
                        onClick={() => (activeActionId === "custom" ? generateCustom(customQRef.current) : generate(slide, activeAction))}
                        style={{ background: "none", border: `1px solid ${C.red}`, borderRadius: 4, color: C.red, fontFamily: MONO, fontSize: 12, padding: "5px 12px", cursor: "pointer" }}
                      >
                        Réessayer
                      </button>
                    </div>
                  ) : entry && activeAction.id === "threads" ? (
                    <div className="flex flex-col gap-2" style={{ maxWidth: "72ch" }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.08em" }}>
                        choisissez un fil à tirer pour le charger comme question dans la boîte de tâche ci-dessous ↓
                      </span>
                      {entry.text
                        .split("\n")
                        .map((l) => l.replace(/^[-•–→\s]+/, "").trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <button
                            key={i}
                            className="thread-chip"
                            onClick={() => { setCustom(THREAD_QUESTION_PREFIX + line + `"`); customInputRef.current?.focus(); }}
                            title="Charger comme question dans la boîte de tâche"
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
                    <p style={{ fontFamily: MONO, color: C.faint, fontSize: 14, lineHeight: 1.8, maxWidth: "64ch" }}>
                      Aucune version pré-calculée pour cette sonde. Cliquez sur{" "}
                      <span style={{ color: C.green }}>↻ générer</span> ci-dessus pour
                      interroger {mode === "local" ? "le modèle local" : "le modèle distant"}.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* footer: slide navigation */}
          <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint, letterSpacing: "0.1em" }}>
              ↑↓ barreaux · ←→ sondes · C défiler · G générer
            </span>
            <div className="flex gap-2">
              <button
                className="nav-btn"
                onClick={() => goto(Math.max(0, slideIdx - 1))}
                disabled={slideIdx === 0}
                style={{ fontFamily: MONO, fontSize: 13, padding: "8px 16px", borderRadius: 4, border: `1px solid ${C.panelEdge}`, background: "transparent", color: slideIdx === 0 ? C.faint : C.text, cursor: slideIdx === 0 ? "default" : "pointer" }}
              >
                ↓ descendre
              </button>
              <button
                className="nav-btn"
                onClick={() => goto(Math.min(SLIDES.length - 1, slideIdx + 1))}
                disabled={slideIdx === SLIDES.length - 1}
                style={{ fontFamily: MONO, fontSize: 13, padding: "8px 16px", borderRadius: 4, border: `1px solid ${C.amber}`, background: "rgba(242,169,59,0.08)", color: slideIdx === SLIDES.length - 1 ? C.faint : C.amber, cursor: slideIdx === SLIDES.length - 1 ? "default" : "pointer" }}
              >
                monter ↑
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
