import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './css/main.css';
import { initTheme } from './js/services/theme.js';

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

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
