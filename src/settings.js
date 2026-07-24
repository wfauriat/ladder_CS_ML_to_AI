/* ============================================================
   RUNTIME SETTINGS — read from a static JSON file at startup, so an
   operator can retune a DEPLOYED build (edit `settings.json` next to
   index.html, reload the page) without rebuilding the bundle.

   Mirrors the proxy's configuration philosophy (app.py `Settings`):
   nothing endpoint- or taste-specific is baked into the artifact;
   every knob has a safe built-in default and is overridable from
   outside the source. The proxy reads env vars; the browser can't, so
   it reads this file — same idea, different transport.

   KEYS
   ----
   • includeAbstract — prepend DECK_ABSTRACT to every prompt.
   • loadSeeds       — hydrate history from the content file's seeds.
                       false → every probe's first click generates live.
   • defaultEngine   — engine used on a first visit ("local" | "cloud"
                       | "mistral" | "proxy"). A previously chosen engine
                       in localStorage["ladder.mode"] takes precedence.
   • showPrompt      — initial state of the prompt inspector (the header's
                       "prompt on/off" toggle). true opens an overlay with
                       the exact prompt on every generation. The toggle
                       still overrides it live, for the session.
   • engines[id]     — { model, maxTokens, temperature, timeoutMs } per
                       engine. `proxy` holds only timeoutMs: its model
                       and token budget are server-side (LADDER_MODEL /
                       LADDER_MAX_TOKENS in app.py), deliberately, so the
                       browser never learns the private endpoint's shape.

   A missing file, malformed JSON, or a missing/ill-typed key silently
   falls back to the default, so the deck never fails to boot on a typo
   in settings.json — it warns to the console and runs as shipped.
   ============================================================ */

export const DEFAULT_SETTINGS = {
  includeAbstract: true,
  loadSeeds: true,
  defaultEngine: "local",
  showPrompt: false,
  engines: {
    // qwen3 is a "thinking" model; callLocal sends think:false so the
    // chain-of-thought can't eat this budget before the answer starts.
    local:   { model: "qwen3:8b",            maxTokens: 512,  temperature: 0.8, timeoutMs: 120000 },
    cloud:   { model: "claude-sonnet-5",     maxTokens: 1000, temperature: 1.0 },
    mistral: { model: "mistral-medium-2508", maxTokens: 1000, temperature: 0.8 },
    // Model + max tokens live server-side (app.py). Only the client-side
    // abort deadline is a browser concern — keep it above the server's.
    proxy:   { timeoutMs: 130000 },
  },
};

const ENGINE_IDS = Object.keys(DEFAULT_SETTINGS.engines);

/* Vite serves /public at the site root; BASE_URL keeps this correct when
   the deck is hosted under a sub-path. The FastAPI SPA fallback in app.py
   serves real files directly, so /settings.json resolves there too. */
const SETTINGS_URL = `${import.meta.env?.BASE_URL || "/"}settings.json`;

/* --- typed coercion: only a well-typed value may override a default --- */
const asBool = (v, d) => (typeof v === "boolean" ? v : d);
const asStr = (v, d) => (typeof v === "string" && v.trim() ? v.trim() : d);
const asNum = (v, d) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : d);
const asTemp = (v, d) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d);

/* Merge one engine's overrides onto its defaults, key by key, so an
   unknown or ill-typed field can never reach an adapter. Only fields the
   default declares are considered (proxy has no model/maxTokens on
   purpose — those are the server's business). */
function coerceEngine(raw, d) {
  const r = raw && typeof raw === "object" ? raw : {};
  const out = { ...d };
  if ("model" in d) out.model = asStr(r.model, d.model);
  if ("maxTokens" in d) out.maxTokens = asNum(r.maxTokens, d.maxTokens);
  if ("temperature" in d) out.temperature = asTemp(r.temperature, d.temperature);
  if ("timeoutMs" in d) out.timeoutMs = asNum(r.timeoutMs, d.timeoutMs);
  return out;
}

function coerceEngines(raw) {
  const out = {};
  for (const id of ENGINE_IDS) {
    out[id] = coerceEngine(raw?.[id], DEFAULT_SETTINGS.engines[id]);
  }
  return out;
}

/* Mutable snapshot, replaced in place once the fetch resolves — so plain
   modules (promptBuilder, the model adapters) can read it synchronously. */
let CURRENT = { ...DEFAULT_SETTINGS };

export function getSettings() {
  return CURRENT;
}

/* Config for one engine id; always returns an object (never undefined). */
export function engineSettings(id) {
  return CURRENT.engines?.[id] || DEFAULT_SETTINGS.engines[id] || {};
}

/* Fetch + apply. Resolves to the effective settings; never rejects.

   Logging is deliberately loud, because the two failure modes look identical
   in the UI: a file that never loaded and a file that loaded but whose key was
   ignored both leave the deck running on defaults. On success this logs a
   table of what was APPLIED and where each value came from (file vs default),
   so `loadSeeds: false` sitting in the file but showing "default" tells you
   the served copy is not the one you edited. */
export async function loadSettings() {
  const provenance = {}; // key -> "settings.json" | "default (…)"
  try {
    const res = await fetch(SETTINGS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Read as text first so a JSON syntax error can name the offending file
    // rather than surfacing as an opaque "Unexpected token" from res.json().
    const body = await res.text();
    let raw;
    try {
      raw = JSON.parse(body);
    } catch (parseErr) {
      throw new Error(
        `${SETTINGS_URL} is not valid JSON (${parseErr.message}). ` +
          `First 80 chars received: ${JSON.stringify(body.slice(0, 80))}` +
          (body.trimStart().startsWith("<")
            ? " — that looks like HTML, i.e. the server returned index.html instead of the file (wrong folder, or the SPA fallback caught the request)."
            : "")
      );
    }

    // Track which keys the file actually supplied, so the summary can show
    // provenance rather than just the effective value.
    const seen = (key) => {
      provenance[key] = key in raw ? "settings.json" : "default";
    };
    ["includeAbstract", "loadSeeds", "showPrompt", "defaultEngine"].forEach(seen);

    const wanted = asStr(raw.defaultEngine, DEFAULT_SETTINGS.defaultEngine);
    const known = ENGINE_IDS.includes(wanted);
    if (!known) {
      console.warn(
        `[settings] unknown defaultEngine "${wanted}" — expected one of ${ENGINE_IDS.join(", ")}; using "${DEFAULT_SETTINGS.defaultEngine}"`
      );
    }

    CURRENT = {
      includeAbstract: asBool(raw.includeAbstract, DEFAULT_SETTINGS.includeAbstract),
      loadSeeds: asBool(raw.loadSeeds, DEFAULT_SETTINGS.loadSeeds),
      showPrompt: asBool(raw.showPrompt, DEFAULT_SETTINGS.showPrompt),
      defaultEngine: known ? wanted : DEFAULT_SETTINGS.defaultEngine,
      engines: coerceEngines(raw.engines),
    };

    // Flag keys present in the file but ignored because they were ill-typed —
    // e.g. "false" (a string) instead of false, the classic JSON slip.
    for (const key of ["includeAbstract", "loadSeeds", "showPrompt"]) {
      if (key in raw && typeof raw[key] !== "boolean") {
        console.warn(
          `[settings] "${key}" is ${typeof raw[key]} (${JSON.stringify(raw[key])}) — expected a bare true/false, not a string. Ignored; using ${CURRENT[key]}.`
        );
        provenance[key] = "IGNORED (bad type) → default";
      }
    }

    console.info(
      `[settings] loaded ${SETTINGS_URL} — applied:`,
      {
        includeAbstract: `${CURRENT.includeAbstract}  [${provenance.includeAbstract}]`,
        loadSeeds: `${CURRENT.loadSeeds}  [${provenance.loadSeeds}]`,
        showPrompt: `${CURRENT.showPrompt}  [${provenance.showPrompt}]`,
        defaultEngine: `${CURRENT.defaultEngine}  [${provenance.defaultEngine}]`,
      }
    );
  } catch (e) {
    CURRENT = { ...DEFAULT_SETTINGS };
    console.error(
      `[settings] ${SETTINGS_URL} NOT LOADED — running on built-in defaults. Reason: ${e.message}`,
      `\n  • 404 → the file is not in the served folder. Vite copies public/ into dist/ AT BUILD TIME only.`,
      `\n  • HTML received → the SPA fallback answered instead of the file.`,
      `\n  • Effective settings now:`, CURRENT
    );
  }
  return CURRENT;
}