import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './index.css'

// Reload page automatically when Vite fails to load stale dynamic chunks due to new deployments
window.addEventListener('vite:preloadError', () => {
  const lastReload = sessionStorage.getItem('vite_preload_error')
  const now = Date.now()
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('vite_preload_error', now.toString())
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
