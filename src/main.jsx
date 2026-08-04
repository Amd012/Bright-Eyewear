import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App';
import './styles.css';

// Detect the base path dynamically:
// - Netlify/Vercel: served from root '/'
// - GitHub Pages: served from '/Bright-Eyewear/'
// - Local dev: served from '/'
function detectBasename() {
  const path = window.location.pathname;
  // Check if we're on GitHub Pages subpath
  if (path.startsWith('/Bright-Eyewear/')) {
    return '/Bright-Eyewear/';
  }
  return '/';
}

const basename = detectBasename();

// If GitHub Pages served the 404.html fallback (for SPA deep links like /product/1),
// extract the original path from the '?path=' query parameter
function getSavedPath() {
  const params = new URLSearchParams(window.location.search);
  const saved = params.get('path');
  if (!saved) return null;
  // Ensure the path starts with a leading slash
  return saved.startsWith('/') ? saved : '/' + saved;
}

const savedPath = getSavedPath();

// When a deep link was redirected via 404.html, this component navigates to the
// saved path once on mount. We always use BrowserRouter so the browser URL stays
// in sync with the router - this ensures links keep working on every click.
function RedirectToSavedPath() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!savedPath) return;

    // Clean up the URL by removing the ?path= parameter
    const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]path=[^&]*/, '').replace(/^\?$/, '');
    window.history.replaceState({}, '', cleanUrl);

    // Navigate to the saved path, replacing the current entry
    navigate(savedPath, { replace: true });
  }, [navigate]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <RedirectToSavedPath />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);