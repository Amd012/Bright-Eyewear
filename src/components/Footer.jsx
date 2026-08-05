import React from 'react';
import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '917676044306';
const INSTAGRAM_HANDLE = '_bright_eyewear';

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
            {/* Instagram - real brand color #E4405F */}
            <a href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="social-instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.163 15.584 2.151 15.204 2.151 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.155 0-3.528.012-4.775.069-1.15.053-1.774.245-2.189.406-.55.216-.943.471-1.355.883-.412.412-.667.805-.883 1.355-.161.415-.353 1.039-.406 2.189-.057 1.247-.069 1.62-.069 4.775s.012 3.528.069 4.775c.053 1.15.245 1.774.406 2.189.216.55.471.943.883 1.355.412.412.805.667 1.355.883.415.161 1.039.353 2.189.406 1.247.057 1.62.069 4.775.069s3.528-.012 4.775-.069c1.15-.053 1.774-.245 2.189-.406.55-.216.943-.471 1.355-.883.412-.412.667-.805.883-1.355.161-.415.353-1.039.406-2.189.057-1.247.069-1.62.069-4.775s-.012-3.528-.069-4.775c-.053-1.15-.245-1.774-.406-2.189-.216-.55-.471-.943-.883-1.355-.412-.412-.805-.667-1.355-.883-.415-.161-1.039-.353-2.189-.406-1.247-.057-1.62-.069-4.775-.069zm0 3.059a4.976 4.976 0 1 1 0 9.952 4.976 4.976 0 0 1 0-9.952zm0 1.802a3.174 3.174 0 1 0 0 6.348 3.174 3.174 0 0 0 0-6.348zm5.179-2.18a1.163 1.163 0 1 1 0 2.326 1.163 1.163 0 0 1 0-2.326z"/>
              </svg>
            </a>
            {/* WhatsApp - real brand color #25D366 */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" className="social-whatsapp">
              <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.68a12.76 12.76 0 0 0 6.24 1.6c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.796-12.72zm0 23.36a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-3.89 1 1.04-3.79-.25-.39a10.54 10.54 0 0 1-1.62-5.68c0-5.84 4.75-10.6 10.6-10.6 2.83 0 5.49 1.1 7.49 3.1a10.53 10.53 0 0 1 3.1 7.5c0 5.85-4.75 10.56-10.31 10.56zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}