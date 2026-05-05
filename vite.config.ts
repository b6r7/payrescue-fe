import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      // Allow the MSW service worker to claim scope '/' even when the app
      // is served from a sub-path (e.g. Quickhost /viewer/<id>/).
      // Without this header, the browser restricts the SW scope to the
      // sub-directory the SW file is served from, so /api/* requests
      // fall outside the scope and MSW never intercepts them.
      name: 'msw-service-worker-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.includes('mockServiceWorker.js')) {
            res.setHeader('Service-Worker-Allowed', '/')
          }
          next()
        })
      },
    },
  ],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/send-email': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/send-email/, '/emails'),
      },
    },
  },
})
