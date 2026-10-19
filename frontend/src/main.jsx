import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { Toaster } from 'react-hot-toast'
import { registerServiceWorker } from './utils/registerSW.js'
import { startSync, initSyncManager } from './utils/syncManager.js'

// Register Service Worker for offline support
registerServiceWorker();

// Initialize sync manager early
initSyncManager();

// Expose sync function globally for service worker
window.triggerSync = startSync;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
