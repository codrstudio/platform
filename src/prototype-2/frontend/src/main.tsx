// Frontend application entry point
// Based on SPEC-data-access.md TanStack Query integration

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';
import { initializeEventHandlers } from './services/events';
import { setupEventInvalidation } from './services/jqel/invalidation';

// Create QueryClient instance with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize event handlers with QueryClient (Task 1.5.10)
initializeEventHandlers(queryClient);

// Setup event-driven cache invalidation (Task 1.5.11)
setupEventInvalidation(queryClient);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
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
