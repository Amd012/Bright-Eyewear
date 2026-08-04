import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use absolute base '/', which works for Netlify/Vercel (served from root).
  // GitHub Actions overrides base to '/Bright-Eyewear/' for GitHub Pages.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/Bright-Eyewear/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});