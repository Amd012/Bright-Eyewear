/**
 * Site Configuration Utility
 * 
 * Dynamically determines the correct production base URL for the current deployment.
 * Works across:
 *   - Vercel (root path)
 *   - Netlify (root path)
 *   - GitHub Pages (subpath via /Bright-Eyewear/)
 */

// Fallback production URL (used in SSR/non-browser contexts)
const DEFAULT_BASE_URL = 'https://bright-eyewear.vercel.app';

/**
 * Get the production base URL for the current deployment.
 * When running on GitHub Pages, this returns `https://<username>.github.io/Bright-Eyewear`.
 * When running on Vercel/Netlify, this returns `https://<domain>`.
 *
 * @returns {string} The base URL without trailing slash
 */
export function getBaseUrl() {
  if (typeof window === 'undefined') return DEFAULT_BASE_URL;

  const origin = window.location.origin;
  const base = import.meta.env.BASE_URL || '/';

  // GitHub Pages: BASE_URL will be something like '/Bright-Eyewear/'
  if (base && base !== '/') {
    return `${origin}${base.replace(/\/+$/, '')}`;
  }

  // Vercel/Netlify/any root deployment: just use the origin
  return origin;
}

/**
 * Build the canonical product URL for the current deployment
 * @param {string|number} productId - The product ID
 * @returns {string} Full product URL
 */
export function buildProductUrl(productId) {
  return `${getBaseUrl()}/product/${productId}`;
}

/**
 * Get the website domain for display purposes (e.g., in PDFs)
 * @returns {string} Domain without protocol
 */
export function getWebsiteDomain() {
  const url = getBaseUrl();
  return url.replace(/^https?:\/\//, '');
}