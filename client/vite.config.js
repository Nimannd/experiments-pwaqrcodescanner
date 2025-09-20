import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace this with your repository name for GitHub Pages deployment
const repoName = 'experiments-pwaqrcodescanner';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    port: 5173
  },
  define: {
    __PAGES_ENV__: JSON.stringify(true)
  }
}));
