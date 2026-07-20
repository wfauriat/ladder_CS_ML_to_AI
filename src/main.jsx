import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "./index.css";

// import LectureLadder from './LectureLadder.jsx'   // English version
import LectureLadderFr from './LectureLadderFr_last.jsx' // French version

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <LectureLadder /> */}
    <LectureLadderFr />
  </StrictMode>,
)
