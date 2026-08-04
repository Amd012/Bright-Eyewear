import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/products.jsx';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>See the World<br />in <span className="highlight">Perfect Clarity</span></h1>
            <p>Premium handcrafted eyewear designed for those who refuse to compromise on style, comfort, or vision. Discover frames that define you.</p>
            <div className="hero-buttons">
              <Link to="/collection" className="btn btn-primary">Shop Collection</Link>
              <a href="#features" className="btn btn-light">Explore More</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="glasses-frame">
              <img
                src="https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&auto=format&fit=crop&q=80"
                alt="Premium eyewear"
                className="glasses-svg"
                style={{ borderRadius: '20px', objectFit: 'cover', width: '100%', height: '100%' }}
              />
              <div className="floating-badge badge-1">
                <span className="badge-icon">👓</span>
                <span className="badge-text"><small>New Arrival</small><strong>Ultra-Light Titanium</strong></span>
              </div>
              <div className="floating-badge badge-2">
                <span className="badge-icon">⭐</span>
                <span className="badge-text"><small>4.9 Rating</small><strong>2,500+ Reviews</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Bright Eyewear?</h2>
            <p>We combine cutting-edge optics with timeless design to deliver an unmatched eyewear experience.</p>
            <div className="accent-line"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3>Premium Optics</h3>
              <p>German-engineered lenses with anti-reflective, scratch-resistant, and blue-light filtering coatings.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✈️</div>
              <h3>Ultra-Light Frames</h3>
              <p>Crafted from aerospace-grade titanium and acetate for all-day comfort without compromise.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♻️</div>
              <h3>Sustainable Craft</h3>
              <p>Eco-friendly materials and ethical production. Every frame planted a tree through our reforestation program.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="brand-story">
        <div className="container">
          <div className="brand-story-content">
            <h2>Crafted for Clarity,<br />Designed for Life</h2>
            <p>Since 2018, Bright Eyewear has been redefining how the world sees eyewear. What started as a small workshop with a single mission — to make premium optics accessible to everyone — has grown into a global brand trusted by thousands.</p>
            <p>Every frame is a fusion of art and science. We source the finest materials from around the world, partner with leading optical engineers, and hand-finish each pair in our atelier.</p>
            <div className="brand-stats">
              <div className="brand-stat"><div className="number">50K+</div><div className="label">Happy Customers</div></div>
              <div className="brand-stat"><div className="number">200+</div><div className="label">Unique Designs</div></div>
              <div className="brand-stat"><div className="number">4.9★</div><div className="label">Average Rating</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our curated collections — from timeless classics to modern sport styles.</p>
            <div className="accent-line"></div>
          </div>
          <div className="categories-grid">
            {categories.filter(cat => cat.id !== 'all').map(cat => (
              <Link
                key={cat.id}
                to={`/collection/${cat.id}`}
                className={`category-card ${cat.color}`}
              >
                <span className="cat-count">{cat.name}</span>
                <div>
                  <span className="cat-icon">{cat.icon}</span>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}