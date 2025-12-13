import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './css/main.css';

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
