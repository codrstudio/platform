import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * SPEC-A-S-001: Frontend using React 19
 * SPEC-A-S-002: Vite as build tool
 * SPEC-A-S-003: TypeScript
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
