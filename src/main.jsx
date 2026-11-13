import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
// Fonts are bundled with the app so they work offline and never flash.
// The Cyanotype print: Newsreader sets the text, Red Hat Mono the small labels and menus,
// Frank Ruhl Libre the Hebrew.
import '@fontsource/newsreader/latin-300.css'
import '@fontsource/newsreader/latin-300-italic.css'
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-400-italic.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/newsreader/latin-500-italic.css'
import '@fontsource/newsreader/latin-ext-300.css'
import '@fontsource/newsreader/latin-ext-300-italic.css'
import '@fontsource/newsreader/latin-ext-400.css'
import '@fontsource/newsreader/latin-ext-400-italic.css'
import '@fontsource/red-hat-mono/latin-400.css'
import '@fontsource/red-hat-mono/latin-500.css'
import '@fontsource/frank-ruhl-libre/hebrew-400.css'
import '@fontsource/noto-nastaliq-urdu/arabic-400.css'
import './index.css'
import App from './App.jsx'
import { registerOffline } from './lib/offline'
import { setupNative } from './lib/native'

registerOffline()
setupNative()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* "user" follows the reader's reduced-motion setting for every animation. */}
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <App />
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
)
