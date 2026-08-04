import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </section>
  );
}