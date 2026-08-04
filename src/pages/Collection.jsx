import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { products, CATEGORY_META, formatPrice } from '../data/products.jsx';

export default function Collection() {
  const { category = 'all' } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const meta = CATEGORY_META[category] || CATEGORY_META.all;

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (category !== 'all') {
      list = list.filter(p => p.category === category);
    }
    const q = searchTerm.toLowerCase();
    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sortBy === 'low') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'high') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, searchTerm, sortBy]);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
      </section>

      <section className="collection-section">
        <div className="container">
          <div className="toolbar">
            <div className="search-bar">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search eyewear..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="filters" style={{ marginBottom: '20px' }}>
            <button
              className={`filter-btn${category === 'all' ? ' active' : ''}`}
              onClick={() => navigate('/collection')}
            >
              All
            </button>
            {['classic', 'modern', 'vintage', 'sport'].map(cat => (
              <button
                key={cat}
                className={`filter-btn${category === cat ? ' active' : ''}`}
                onClick={() => navigate(`/collection/${cat}`)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="result-count">
            Showing {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image">
                    {product.tag && <span className="product-tag">{product.tag}</span>}
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <span className="price">
                      {formatPrice(product.price)}
                      {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
                    </span>
                    <div className="rating">
                      <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>{' '}
                      {product.rating} ({product.reviews} reviews)
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="icon">🔍</div>
              <h3>No eyewear found</h3>
              <p>Try adjusting your search or filter to explore more.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}