import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      showToast(data.message || 'Subscribed successfully!');
      setEmail('');
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="container">
        <h2>Stay in the Loop</h2>
        <p>Subscribe to our newsletter and get 15% off your first order. New arrivals, exclusive offers, and more.</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}