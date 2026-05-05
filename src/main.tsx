import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/styles/global.css'

const prepare = async () => {
  // Run MSW in dev always, and in production when VITE_ENABLE_MOCKS=true
  // For Quickhost static deploys, set VITE_ENABLE_MOCKS=true at build time
  const shouldMock = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'
  if (shouldMock) {
    try {
      const { worker } = await import('./modules/upay/mocks/browser')
      // Use a relative URL so MSW finds the service worker regardless of
      // what sub-path the host serves the app from (Quickhost: /viewer/{id}/)
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: './mockServiceWorker.js',
          options: { scope: '/' },
        },
      })
    } catch (e) {
      // MSW failed to start (e.g. service worker scope issue) — app still renders,
      // API calls will fall through to the network (or fail gracefully in the UI)
      console.warn('[MSW] Service worker failed to start:', e)
    }
  }
}

void prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
