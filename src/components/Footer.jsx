import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src={`${import.meta.env.BASE_URL}eyewear.png`} alt="Bright Eyewear logo" className="logo-img" />
              <span className="logo-text">Bright<span> Eyewear</span></span>
            </Link>
            <p>Premium eyewear crafted for clarity, comfort, and style. See brighter, live better.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/collection/eyeglasses">Eyeglasses</Link></li>
              <li><Link to="/collection/sunglasses">Sunglasses</Link></li>
              <li><Link to="/collection">All Eyewear</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/">Home</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/collection">Our Collection</Link></li>
              <li><Link to="/contact">Get in Touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Bright Eyewear. All rights reserved.</span>
          <div className="footer-socials">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.163 15.584 2.151 15.204 2.151 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.155 0-3.528.012-4.775.069-1.15.053-1.774.245-2.189.406-.55.216-.943.471-1.355.883-.412.412-.667.805-.883 1.355-.161.415-.353 1.039-.406 2.189-.057 1.247-.069 1.62-.069 4.775s.012 3.528.069 4.775c.053 1.15.245 1.774.406 2.189.216.55.471.943.883 1.355.412.412.805.667 1.355.883.415.161 1.039.353 2.189.406 1.247.057 1.62.069 4.775.069s3.528-.012 4.775-.069c1.15-.053 1.774-.245 2.189-.406.55-.216.943-.471 1.355-.883.412-.412.667-.805.883-1.355.161-.415.353-1.039.406-2.189.057-1.247.069-1.62.069-4.775s-.012-3.528-.069-4.775c-.053-1.15-.245-1.774-.406-2.189-.216-.55-.471-.943-.883-1.355-.412-.412-.805-.667-1.355-.883-.415-.161-1.039-.353-2.189-.406-1.247-.057-1.62-.069-4.775-.069zm0 3.059a4.976 4.976 0 1 1 0 9.952 4.976 4.976 0 0 1 0-9.952zm0 1.802a3.174 3.174 0 1 0 0 6.348 3.174 3.174 0 0 0 0-6.348zm5.179-2.18a1.163 1.163 0 1 1 0 2.326 1.163 1.163 0 0 1 0-2.326z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}