import React, { useState } from 'react';
import { LENS_OPTIONS, getLensCategoryLabel, getFinalPrice, formatPrice } from '../data/products.jsx';

/**
 * Lens Selection Component
 * 
 * Displays lens options in a clean card layout with:
 * - Modern UI
 * - Proper spacing
 * - Responsive design
 * - Tooltips
 * - Selectable radio buttons
 * - Only one lens option may be selected at a time
 * - Dynamic pricing (Frame Price + Lens Price = Final Price)
 */
export default function LensSelection({ product, selectedLens, onLensSelect }) {
  const [showTooltip, setShowTooltip] = useState(null);

  const handleLensSelect = (lensId) => {
    onLensSelect(lensId === selectedLens ? null : lensId);
  };

  const finalPrice = getFinalPrice(product.price, selectedLens);

  return (
    <div className="lens-selection">
      <div className="lens-selection-header">
        <h3>Lens Selection</h3>
        <p>Choose the perfect lens option for your needs. Only one lens type can be selected.</p>
      </div>

      <div className="lens-categories">
        {Object.entries(LENS_OPTIONS).map(([category, lenses]) => (
          <div key={category} className="lens-category">
            <h4 className="lens-category-title">{getLensCategoryLabel(category)}</h4>
            <div className="lens-options-grid">
              {lenses.map(lens => {
                const isSelected = selectedLens === lens.id;
                const lensTotal = product.price + lens.price;
                return (
                  <label
                    key={lens.id}
                    className={`lens-option${isSelected ? ' selected' : ''}`}
                    htmlFor={`lens-${lens.id}`}
                  >
                    <input
                      type="radio"
                      id={`lens-${lens.id}`}
                      name="lens-selection"
                      value={lens.id}
                      checked={isSelected}
                      onChange={() => handleLensSelect(lens.id)}
                    />
                    <div className="lens-option-content">
                      <div className="lens-option-name-row">
                        <span className="lens-option-name">{lens.name}</span>
                        <span
                          className="lens-tooltip-icon"
                          onMouseEnter={() => setShowTooltip(lens.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTooltip(showTooltip === lens.id ? null : lens.id);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Info about ${lens.name}`}
                        >
                          ⓘ
                        </span>
                      </div>
                      <div className="lens-option-price">
                        <span className="lens-price-add">+ {formatPrice(lens.price)}</span>
                        <span className="lens-total">Total: {formatPrice(lensTotal)}</span>
                      </div>
                    </div>
                    {showTooltip === lens.id && (
                      <div className="lens-tooltip" role="tooltip">
                        {lens.tooltip}
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic pricing summary */}
      <div className="lens-pricing-summary">
        <div className="lens-price-row">
          <span>Frame Price</span>
          <span>{formatPrice(product.price)}</span>
        </div>
        <div className="lens-price-row">
          <span>Lens Price</span>
          <span>{selectedLens ? formatPrice(getLensPriceById(selectedLens)) : '—'}</span>
        </div>
        <div className="lens-price-row total">
          <span>Final Price</span>
          <span>{formatPrice(finalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function getLensPriceById(lensId) {
  for (const category of Object.values(LENS_OPTIONS)) {
    const lens = category.find(l => l.id === lensId);
    if (lens) return lens.price;
  }
  return 0;
}