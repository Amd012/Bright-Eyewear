import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// Base path for GitHub Pages subdirectory deployment
const basename = import.meta.env.PROD ? '/Bright-Eyewear/' : '/';

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