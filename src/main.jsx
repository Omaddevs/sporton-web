import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { hydrateCatalog } from './services/catalog.js'
import { installErrorReporter } from './services/errorReporter.js'

// Katalog avval yuklanadi, keyin ilova (sahifa modullari yangilangan ma’lumotni ko‘rishi uchun)
async function boot() {
  installErrorReporter()
  await hydrateCatalog()
  const { default: App } = await import('./App.jsx')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot()
