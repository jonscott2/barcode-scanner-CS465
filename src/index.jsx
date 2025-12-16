import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import './css/main.css';
import { initTheme } from './js/services/theme.js';
import { SENTRY_CONFIG } from './js/sentry.config.js';

// Initialize Sentry as early as possible
Sentry.init({
  dsn: "https://03ec3495eaeeefb169f7068ddd270e85@o4510541249118208.ingest.us.sentry.io/4510541260324864",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  // Additional Sentry configuration
  environment: SENTRY_CONFIG.environment,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend: SENTRY_CONFIG.beforeSend,
  ignoreErrors: SENTRY_CONFIG.ignoreErrors,
});

console.log('✅ Sentry initialized for error tracking');

// Initialize theme on app load
initTheme();

// Suppress browser extension errors that don't affect app functionality
window.addEventListener('error', event => {
  // Filter out common browser extension errors
  if (
    event.message &&
    (event.message.includes('message channel closed') ||
      event.message.includes('Extension context invalidated') ||
      event.message.includes('asynchronous response'))
  ) {
    event.preventDefault();
    return false;
  }
});

// Suppress unhandled promise rejections from browser extensions
window.addEventListener('unhandledrejection', event => {
  if (
    event.reason &&
    typeof event.reason === 'object' &&
    event.reason.message &&
    (event.reason.message.includes('message channel closed') ||
      event.reason.message.includes('Extension context invalidated') ||
      event.reason.message.includes('asynchronous response'))
  ) {
    event.preventDefault();
    return false;
  }
});

const rootEl = document.getElementById('root') || document.createElement('div');
if (!document.getElementById('root')) {
  rootEl.id = 'root';
  document.body.appendChild(rootEl);
}

// Wrap App with Sentry's ErrorBoundary for better error handling
createRoot(rootEl).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <h1>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error.message}</p>
          <button 
            onClick={resetError}
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            Try again
          </button>
        </div>
      )}
      showDialog={false}
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
