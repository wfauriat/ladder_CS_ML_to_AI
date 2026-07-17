/* ============================================================
   PROXY ENGINE ADAPTER (reference source)
   ------------------------------------------------------------
   Drop-in engine for the LADDER front-end that talks to the
   Kerberos proxy in deploy/server instead of a provider directly.

   This file is the CANONICAL SOURCE for the snippet you paste into
   LectureLadderFr_last.jsx (see deploy/README.md, "Front-end edits").
   It is not imported anywhere yet — the JSX keeps its adapters inline,
   so copy `callProxy` next to callMistral rather than importing this.

   Contract: POST /api/generate  { prompt }  ->  { text }
   Same-origin, so: no API key, no endpoint URL, no CORS. The proxy adds
   Kerberos auth and forwards the OpenAI-compatible call server-side.
   ============================================================ */

const PROXY_TIMEOUT_MS = 130000; // slightly above the server's own timeout, so
                                 // the server's diagnostic wins the race

export async function callProxy(prompt) {
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
      // FastAPI errors arrive as { detail: "..." }; fall back to the status.
      let detail = "";
      try { detail = (await response.json())?.detail || ""; } catch { /* non-JSON */ }
      throw new Error(detail || `proxy answered ${response.status}`);
    }
    const data = await response.json();
    const text = (data?.text || "").trim();
    if (!text) throw new Error("Empty completion");
    return text;
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error(`proxy timed out after ${PROXY_TIMEOUT_MS / 1000}s`, { cause: err });
    if (err instanceof TypeError)
      throw new Error("cannot reach the LADDER proxy — is the server running?", { cause: err });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
