import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById, formatPrice, getDiscountPercent, products } from '../data/products.jsx';

const WHATSAPP_NUMBER = '7676044306';

function buildWhatsAppShareUrl(product) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const priceText = product.oldPrice
    ? `${formatPrice(product.price)} (was ${formatPrice(product.oldPrice)}${discount ? `, SAVE ${discount}%` : ''})`
    : formatPrice(product.price);

  const message = [
    `👓 ${product.name}`,
    `Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`,
    `Price: ${priceText}`,
    `Rating: ${product.rating} ★ (${product.reviews} reviews)`,
    `In Stock: ${product.inStock ? '✅ Yes' : '❌ No'}`,
    ``,
    `Description:`,
    product.description,
    ``,
    `Image: ${product.image}`,
    ``,
    `Check it out on our website!`
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ProductDetail() {
  const { id } = useParams();

  const product = getProductById(id);

  if (!product) {
    return (
      <section className="notfound">
        <div className="container">
          <h1>404</h1>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/collection" className="btn btn-primary">Browse Collection</Link>
        </div>
      </section>
    );
  }

  const discount = getDiscountPercent(product.price, product.oldPrice);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <>
      <a
        href={buildWhatsAppShareUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-share-btn"
        aria-label="Share this product on WhatsApp"
        title="Share on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.68a12.76 12.76 0 0 0 6.24 1.6c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.796-12.72zm0 23.36a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-3.89 1 1.04-3.79-.25-.39a10.54 10.54 0 0 1-1.62-5.68c0-5.84 4.75-10.6 10.6-10.6 2.83 0 5.49 1.1 7.49 3.1a10.53 10.53 0 0 1 3.1 7.5c0 5.85-4.75 10.56-10.31 10.56zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/>
        </svg>
        <span className="whatsapp-share-label">Share</span>
      </a>

      <section className="page-header">
        <div className="container">
          <h1>{product.name}</h1>
        </div>
      </section>

      <section className="product-detail">
        <div className="container">
          {/* Left: Gallery */}
          <div className="product-gallery">
            {product.tag && <span className="product-tag">{product.tag}</span>}
            <img src={product.image} alt={product.name} />
          </div>

          {/* Right: Basic Information */}
          <div className="product-info-detail">
            <h1>{product.name}</h1>
            <p className="category-label">{product.category}</p>
            <div className="rating-row">
              <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
              <span className="rating-text">{product.rating} out of 5 · {product.reviews} reviews</span>
            </div>
            <div className="price-row">
              <span className="price-current">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
              {discount && <span className="price-discount">SAVE {discount}%</span>}
            </div>
            <p className="product-desc">{product.description}</p>
          </div>
        </div>
      </section>

      {/* Below: Specifications & Highlights (full width) */}
      <section className="product-below">
        <div className="container">
          <div className="specs">
            <h3>Specifications</h3>
            <ul>
              <li><span>Frame Material</span><span>{product.category === 'sport' ? 'Polycarbonate' : 'Acetate / Titanium'}</span></li>
              <li><span>Lens Type</span><span>{product.category === 'sport' ? 'Polarized' : 'Anti-reflective'}</span></li>
              <li><span>Weight</span><span>{product.category === 'sport' ? '32g' : '24g'}</span></li>
              <li><span>Stock</span><span style={{ color: product.inStock ? '#16a34a' : '#dc2626' }}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span></li>
            </ul>
          </div>

          <div className="highlights">
            <h3>Key Highlights</h3>
            <ul>
              <li>✨ Premium {product.category} design</li>
              <li>🛡️ 2-year manufacturer warranty</li>
              <li>🚚 Free shipping over ₹10,000</li>
              <li>↩️ 30-day hassle-free returns</li>
            </ul>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="categories" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <div className="accent-line"></div>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className="product-card">
                  <div className="product-image">
                    {p.tag && <span className="product-tag">{p.tag}</span>}
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p className="category">{p.category}</p>
                    <span className="price">
                      {formatPrice(p.price)}
                      {p.oldPrice && <span className="old-price">{formatPrice(p.oldPrice)}</span>}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}