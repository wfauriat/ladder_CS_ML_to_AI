import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { loadSettings } from "./settings.js";

import "./index.css";

// import LectureLadder from './LectureLadder.jsx'   // English version
import LectureLadderFr from './LectureLadderFr_last.jsx' // French version

// Settings are fetched BEFORE the first render, on purpose: the seed decision
// (settings.loadSeeds) and the default engine (settings.defaultEngine) are read
// inside useState initializers, which run once at mount. Rendering first and
// letting the fetch land afterwards would hydrate the history from seeds and
// only then learn it was meant to skip them.
//
// loadSettings() never rejects — a missing or malformed settings.json falls
// back to the built-in defaults with a console warning — so this cannot leave
// the page blank.
loadSettings().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {/* <LectureLadder /> */}
      <LectureLadderFr />
    </StrictMode>,
  )
})