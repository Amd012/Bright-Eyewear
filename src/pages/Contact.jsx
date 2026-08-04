import React from 'react';

export default function Contact() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p className="contact-intro">Have a question about our products, an order, or need help finding the perfect pair? Our team is here to help.</p>

            <div className="contact-grid-layout">
              {/* Left: Address */}
              <div className="contact-card contact-address-card">
                <div className="contact-card-icon">📍</div>
                <h3>Visit Us</h3>
                <p className="contact-address-text">#30, 1st Main Road, Chikka Bommasandra, Yelahanka, Bangalore 560064</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Chikka+Bommasandra+Yelahanka+Bangalore+560064"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm get-directions-btn"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                  </svg>
                  Get Directions
                </a>
              </div>

              {/* Right: Contact details */}
              <div className="contact-details-column">
                <div className="contact-detail">
                  <div className="icon">📞</div>
                  <div>
                    <strong>Phone</strong>
                    <span>+91 76760 44306</span>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="icon">📧</div>
                  <div>
                    <strong>Email</strong>
                    <span>brighteyewear25@gmail.com</span>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="icon">🕐</div>
                  <div>
                    <strong>Timings</strong>
                    <span>Everyday: 10:00 AM – 9:30 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}