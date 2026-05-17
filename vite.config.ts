import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const devApi = process.env.VITE_DEV_API_URL || 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VERCEL_DEPLOY': JSON.stringify(process.env.VERCEL === '1'),
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: devApi,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '') || '/',
      },
      '/auth': devApi,
      '/books': devApi,
      '/borrow': devApi,
      '/return': devApi,
      '/me': devApi,
      '/upload': devApi,
      '/health': devApi,
      '/openapi.json': devApi,
      '/docs': devApi,
    },
  },
})
