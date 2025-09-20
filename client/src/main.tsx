import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './scanner/App';
import { QrGallery } from './scanner/QrGallery';

const el = document.getElementById('root');
if (el) {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const relPath = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length - (base.endsWith('/')?1:0)) : window.location.pathname;
  const normalized = relPath.replace(/^\//,'');
  const Page = normalized === 'qrs' ? QrGallery : App;
  createRoot(el).render(<Page />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = (import.meta as any).env?.BASE_URL || '/';
    navigator.serviceWorker.register(base + 'sw.js').catch(err => console.warn('SW reg failed', err));
  });
}
