import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './scanner/App';
import { QrGallery } from './scanner/QrGallery';

const el = document.getElementById('root');
if (el) {
  const path = window.location.pathname;
  const Page = path === '/qrs' ? QrGallery : App;
  createRoot(el).render(<Page />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW reg failed', err));
  });
}
