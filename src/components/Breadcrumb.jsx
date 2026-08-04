import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProductById, CATEGORY_META } from '../data/products.jsx';

export default function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname.replace(/\/$/, '');

  if (path === '') return null;

  const segments = path.split('/').filter(Boolean);

  let label = '';
  if (path.startsWith('/collection')) {
    const cat = params.category || 'all';
    label = CATEGORY_META[cat]?.title || 'Collection';
  } else if (path.startsWith('/product')) {
    const product = getProductById(params.id);
    label = product ? product.name : 'Product';
  } else if (path.startsWith('/contact')) {
    label = 'Contact Us';
  }

  return (
    <nav className="breadcrumb-fixed" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {segments.length > 0 && (
        <>
          <span className="sep">/</span>
          <span className="current">{label || 'Page'}</span>
        </>
      )}
    </nav>
  );
}