import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

// Intercept fetch calls to automatically prepend the VITE_BACKEND_URL for relative /api paths
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (typeof url === 'string' && url.startsWith('/api')) {
    url = `${baseUrl.replace(/\/$/, '')}${url}`;
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
