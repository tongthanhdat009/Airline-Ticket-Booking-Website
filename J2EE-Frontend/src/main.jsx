import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n'
import App from './App.jsx'

// Vite fires `vite:preloadError` on window when a lazy chunk fails to load — the
// classic stale-hash-after-deploy symptom, but also a transient network/525.
// Reload once onto the fresh build; the sessionStorage sentinel stops a reload
// loop when a chunk is genuinely broken (the error then surfaces to the
// ErrorBoundary instead).
const PRELOAD_RELOAD_AT = 'airline.preloadReloadAt'
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem(PRELOAD_RELOAD_AT) || 0)
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem(PRELOAD_RELOAD_AT, String(Date.now()))
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
