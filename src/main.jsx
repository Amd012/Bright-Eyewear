import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
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
  return params.get('path');
}

const savedPath = getSavedPath();

// When a deep link was redirected via 404.html, use MemoryRouter with the saved path
// so React Router can render the correct page. Otherwise use BrowserRouter normally.
function Router({ children }) {
  if (savedPath) {
    // Clean up the URL by removing the ?path= parameter
    const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]path=[^&]*/, '').replace(/^\?$/, '');
    window.history.replaceState({}, '', cleanUrl);
    return (
      <MemoryRouter initialEntries={[savedPath]}>
        {children}
      </MemoryRouter>
    );
  }
  return <BrowserRouter basename={basename}>{children}</BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);