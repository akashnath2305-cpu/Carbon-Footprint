import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['canvas-confetti']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            icons: ['lucide-react']
          }
        }
      }
    },
    server: {
      allowedHosts: ['carbon-footprint-1-893m.onrender.com', 'localhost'],
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})