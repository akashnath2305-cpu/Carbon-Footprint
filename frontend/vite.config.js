import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Triggering Vite restart to pick up newly installed dependencies like canvas-confetti
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['canvas-confetti']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
