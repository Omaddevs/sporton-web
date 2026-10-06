import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Backend (Next.js, ./backend) — `cd backend && npm run dev`
    proxy: {
      '/api': { target: process.env.VITE_API_PROXY || 'http://localhost:3001', changeOrigin: false },
    },
    watch: {
      ignored: ['**/temp-fonts/**', '**/public/images/categories/**', '**/backend/**'],
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // React va ikonalar alohida chunk — ilova kodi o‘zgarganda kesh saqlanadi
        manualChunks(id) {
          if (id.includes('node_modules/react-icons') || id.includes('node_modules/lucide-react')) return 'icons'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
        },
      },
    },
  },
})
