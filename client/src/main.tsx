import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { App } from './scanner/App';
import { QrGallery } from './scanner/QrGallery';

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/qrs" element={<QrGallery />} />
      </Routes>
    </HashRouter>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = (import.meta as any).env?.BASE_URL || '/';
    navigator.serviceWorker.register(base + 'sw.js').catch(err => console.warn('SW reg failed', err));
  });
}
