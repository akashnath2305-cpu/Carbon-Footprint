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
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'charts';
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('react') || id.includes('react-dom')) return 'vendor';
            }
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