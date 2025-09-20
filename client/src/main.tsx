import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './scanner/App';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(<App />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW reg failed', err));
  });
}
