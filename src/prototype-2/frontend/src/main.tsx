// Frontend application entry point
// This file will be implemented in subsequent tasks

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker in production mode (SPEC-A-PWA-018)
if (import.meta.env.PROD) {
  import('./sw-register').then(({ registerServiceWorker }) => {
    registerServiceWorker().catch(err =>
      console.error('[SW] Registration failed:', err)
    );
  });
}
