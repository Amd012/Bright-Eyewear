import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById, formatPrice, getDiscountPercent, products } from '../data/products.jsx';

const WHATSAPP_NUMBER = '7676044306';

function buildWhatsAppShareUrl(product) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const priceText = product.oldPrice
    ? `${formatPrice(product.price)} (was ${formatPrice(product.oldPrice)}${discount ? `, SAVE ${discount}%` : ''})`
    : formatPrice(product.price);

  // Build the clickable product page URL that works on all platforms
  // Use the current page's path to determine the correct base
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  // Extract the base path (everything before /product/)
  const basePath = pathname.includes('/product/')
    ? pathname.substring(0, pathname.indexOf('/product/'))
    : pathname.replace(/\/$/, '');
  const productUrl = `${origin}${basePath}/product/${product.id}`;

  const category = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const message = [
    `👓 *${product.name}* 👓`,
    `${category} · ${priceText}`,
    ``,
    `✨ Bright Eyewear — Crafted for Your Vision`,
    ``,
    productUrl
  ].join('\n');

  // Pass the raw message string directly - the browser handles URL encoding
  // naturally when navigating, and WhatsApp decodes newlines correctly.
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

// Field tooltips for prescription guide
const FIELD_TOOLTIPS = {
  SPH: 'SPH (Sphere): Corrects short-sightedness (minus power) or long-sightedness (plus power).',
  CYL: 'CYL (Cylinder): Corrects astigmatism (uneven curvature of the eye).',
  AXIS: 'AXIS: Specifies the direction of astigmatism correction (1°–180°).',
  ADD: 'ADD: Additional magnification required for reading or progressive lenses.',
  PD: 'PD (Pupillary Distance): Distance between the centers of your pupils, used for accurate lens alignment.'
};

function Tooltip({ text, label }) {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef(null);
  const hideTimerRef = useRef(null);
  const isTouchRef = useRef(false);

  // Detect touch devices once on mount
  useEffect(() => {
    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  // Clear any pending hide timer
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const handleShow = useCallback((e) => {
    if (e) e.stopPropagation();
    clearHideTimer();
    setShow(true);
  }, [clearHideTimer]);

  const handleHide = useCallback(() => {
    // Small delay to allow moving mouse from icon to tooltip - prevents flickering
    hideTimerRef.current = setTimeout(() => {
      setShow(false);
    }, 100);
  }, []);

  // For touch devices: ignore hover events to prevent double-fire with click
  const handlePointerEnter = useCallback((e) => {
    if (isTouchRef.current) return;
    handleShow(e);
  }, [handleShow]);

  const handlePointerLeave = useCallback(() => {
    if (isTouchRef.current) return;
    handleHide();
  }, [handleHide]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    clearHideTimer();
    setShow(prev => !prev);
  }, [clearHideTimer]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(e);
    } else if (e.key === 'Escape') {
      setShow(false);
    }
  }, [handleToggle]);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  return (
    <span className="tooltip-wrapper" ref={wrapperRef}>
      <span
        className="tooltip-icon"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onFocus={handleShow}
        onBlur={() => setShow(false)}
        role="button"
        tabIndex={0}
        aria-label={`Info about ${label}`}
        aria-expanded={show}
      >
        ⓘ
      </span>
      {show && (
        <span
          className="tooltip-bubble tooltip-top"
          role="tooltip"
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState({
    reSph: '', reCyl: '', reAxis: '', reAdd: '',
    leSph: '', leCyl: '', leAxis: '', leAdd: '',
    pd: ''
  });
  const [confirmed, setConfirmed] = useState(false);

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

  const updateField = (key, value) => {
    setPrescription(prev => ({ ...prev, [key]: value }));
  };

  const buildPrescriptionMessage = () => {
    // Build the clickable product page URL that works on all platforms
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    // Extract the base path (everything before /product/)
    const basePath = pathname.includes('/product/')
      ? pathname.substring(0, pathname.indexOf('/product/'))
      : pathname.replace(/\/$/, '');
    const productUrl = `${origin}${basePath}/product/${product.id}`;

    const reSph = prescription.reSph || 'N/A';
    const reCyl = prescription.reCyl || 'N/A';
    const reAxis = prescription.reAxis || 'N/A';
    const reAdd = prescription.reAdd || 'N/A';
    const leSph = prescription.leSph || 'N/A';
    const leCyl = prescription.leCyl || 'N/A';
    const leAxis = prescription.leAxis || 'N/A';
    const leAdd = prescription.leAdd || 'N/A';
    const pd = prescription.pd || 'N/A';

    const category = product.category.charAt(0).toUpperCase() + product.category.slice(1);

    const lines = [
      `*NEW PRESCRIPTION ORDER*`,
      ``,
      `*📦 PRODUCT DETAILS*`,
      `Model Name : ${product.name}`,
      `Category    : ${category}`,
      `Price       : ₹${product.price}`,
      ``,
      `*👓 PRESCRIPTION DETAILS*`,
      ``,
      `🔹 Right Eye (RE)`,
      `• SPH  : ${reSph}`,
      `• CYL  : ${reCyl}`,
      `• AXIS : ${reAxis}°`,
      `• ADD  : ${reAdd}`,
      ``,
      `🔹 Left Eye (LE)`,
      `• SPH  : ${leSph}`,
      `• CYL  : ${leCyl}`,
      `• AXIS : ${leAxis}°`,
      `• ADD  : ${leAdd}`,
      ``,
      `*📏 PUPILLARY DISTANCE*`,
      `IPD (Interpupillary Distance): ${pd} mm`,
      ``,
      `✅ CUSTOMER CONFIRMATION`,
      `I confirm that the prescription details provided above are accurate and match my latest eye prescription. I understand that these values will be used to manufacture my lenses, and I have reviewed all information before submitting this order.`,
      ``,
      `*🔗 PRODUCT LINK*`,
      `Product: Bright Eyewear – ${product.name}`,
      ``,
      productUrl,
      ``,
      `✨ Bright Eyewear — Crafted for Your Vision`,
      `Precision Lenses • Premium Frames • Clear Vision`
    ];

    // Join with simple \n (line feed). WhatsApp's URL parser strips \r\n but keeps %0A.
    return lines.join('\n');
  };

  const sendPrescriptionOnWhatsApp = () => {
    if (!confirmed) {
      alert('Please tick the confirmation checkbox before sending your prescription.');
      return;
    }
    const message = buildPrescriptionMessage();
    // Pass the raw message string directly - the browser handles URL encoding
    // naturally when navigating, and WhatsApp decodes newlines correctly.
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <>
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

            {/* Action buttons: WhatsApp Share + Add Prescription (not for sunglasses) */}
            <div className="product-action-buttons">
              <a
                href={buildWhatsAppShareUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm product-share-btn"
                aria-label="Share this product on WhatsApp"
                title="Share on WhatsApp"
              >
                <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.68a12.76 12.76 0 0 0 6.24 1.6c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.796-12.72zm0 23.36a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-3.89 1 1.04-3.79-.25-.39a10.54 10.54 0 0 1-1.62-5.68c0-5.84 4.75-10.6 10.6-10.6 2.83 0 5.49 1.1 7.49 3.1a10.53 10.53 0 0 1 3.1 7.5c0 5.85-4.75 10.56-10.31 10.56zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/>
                </svg>
                WhatsApp Share
              </a>
              {product.category !== 'sunglasses' && (
                <a href="#prescription-form" className="btn btn-primary btn-sm product-prescription-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  Add Prescription Details
                </a>
              )}
            </div>
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
              <li><span>Gender</span><span>{product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : 'Unisex'}</span></li>
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

      {/* ===== PRESCRIPTION GUIDE & CUSTOMER NOTES (not for sunglasses) ===== */}
      {product.category !== 'sunglasses' && (
      <section className="prescription-section" id="prescription">
        <div className="container">
          <div className="section-header">
            <h2>Prescription Guide & Customer Notes</h2>
            <div className="accent-line"></div>
          </div>

          {/* Why we ask */}
          <div className="prescription-info-box">
            <h3>Why do we ask for these details?</h3>
            <p>
              These values help us manufacture and deliver lenses that match your vision requirements. If you already wear glasses, you can find these values on your prescription provided by your eye doctor or optometrist.
            </p>
          </div>

          {/* Field explanations with tooltips */}
          <div className="prescription-fields-guide">
            <h3>Field Explanations</h3>
            <div className="prescription-field-list">
              <div className="prescription-field-item">
                <span className="field-name">SPH <Tooltip text={FIELD_TOOLTIPS.SPH} label="SPH" /></span>
                <span className="field-desc">Corrects short-sightedness (minus power) or long-sightedness (plus power).</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">CYL <Tooltip text={FIELD_TOOLTIPS.CYL} label="CYL" /></span>
                <span className="field-desc">Corrects astigmatism (uneven curvature of the eye).</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">AXIS <Tooltip text={FIELD_TOOLTIPS.AXIS} label="AXIS" /></span>
                <span className="field-desc">Specifies the direction of astigmatism correction (1°–180°).</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">ADD <Tooltip text={FIELD_TOOLTIPS.ADD} label="ADD" /></span>
                <span className="field-desc">Additional magnification required for reading or progressive lenses.</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">PD <Tooltip text={FIELD_TOOLTIPS.PD} label="PD" /></span>
                <span className="field-desc">Distance between the centers of your pupils, used for accurate lens alignment.</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">RE</span>
                <span className="field-desc">Right Eye prescription values.</span>
              </div>
              <div className="prescription-field-item">
                <span className="field-name">LE</span>
                <span className="field-desc">Left Eye prescription values.</span>
              </div>
            </div>
          </div>

          {/* Important notes */}
          <div className="prescription-notes-box">
            <h3>Important Notes</h3>
            <ul>
              <li>✅ Tick the checkbox only after verifying that the prescription details are correct.</li>
              <li>💬 If you do not have a prescription, contact our team through <strong>WhatsApp</strong> for assistance.</li>
              <li>⚠️ Wrong prescription values may result in incorrect lenses being manufactured.</li>
              <li>📄 We recommend uploading a prescription image for verification.</li>
            </ul>
          </div>

          {/* Prescription form */}
          <div className="prescription-form-box" id="prescription-form">
            <h3>Enter Your Prescription</h3>

            <div className="prescription-form-grid">
              {/* RE card */}
              <div className="prescription-column">
                <h4>Right Eye (RE)</h4>
                <div className="prescription-fields-row">
                  <div className="prescription-input-group">
                    <label>SPH <Tooltip text={FIELD_TOOLTIPS.SPH} label="SPH" /></label>
                    <input type="text" placeholder="e.g. -2.50" value={prescription.reSph} onChange={e => updateField('reSph', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>CYL <Tooltip text={FIELD_TOOLTIPS.CYL} label="CYL" /></label>
                    <input type="text" placeholder="e.g. -0.75" value={prescription.reCyl} onChange={e => updateField('reCyl', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>AXIS <Tooltip text={FIELD_TOOLTIPS.AXIS} label="AXIS" /></label>
                    <input type="text" placeholder="e.g. 180" value={prescription.reAxis} onChange={e => updateField('reAxis', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>ADD <Tooltip text={FIELD_TOOLTIPS.ADD} label="ADD" /></label>
                    <input type="text" placeholder="e.g. +1.75" value={prescription.reAdd} onChange={e => updateField('reAdd', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* LE card */}
              <div className="prescription-column">
                <h4>Left Eye (LE)</h4>
                <div className="prescription-fields-row">
                  <div className="prescription-input-group">
                    <label>SPH <Tooltip text={FIELD_TOOLTIPS.SPH} label="SPH" /></label>
                    <input type="text" placeholder="e.g. -2.50" value={prescription.leSph} onChange={e => updateField('leSph', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>CYL <Tooltip text={FIELD_TOOLTIPS.CYL} label="CYL" /></label>
                    <input type="text" placeholder="e.g. -0.75" value={prescription.leCyl} onChange={e => updateField('leCyl', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>AXIS <Tooltip text={FIELD_TOOLTIPS.AXIS} label="AXIS" /></label>
                    <input type="text" placeholder="e.g. 180" value={prescription.leAxis} onChange={e => updateField('leAxis', e.target.value)} />
                  </div>
                  <div className="prescription-input-group">
                    <label>ADD <Tooltip text={FIELD_TOOLTIPS.ADD} label="ADD" /></label>
                    <input type="text" placeholder="e.g. +1.75" value={prescription.leAdd} onChange={e => updateField('leAdd', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* PD - full width */}
            <div className="prescription-input-group prescription-ipd">
              <label>PD (mm) <Tooltip text={FIELD_TOOLTIPS.PD} label="PD" /></label>
              <input type="text" placeholder="e.g. 62" value={prescription.pd} onChange={e => updateField('pd', e.target.value)} />
            </div>

            {/* Confirmation checkbox */}
            <label className="prescription-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
              />
              <span>I confirm that the prescription information provided above is accurate and matches my latest eye prescription.</span>
            </label>

            {/* Send on WhatsApp */}
            <button className="btn btn-primary prescription-send-btn" onClick={sendPrescriptionOnWhatsApp}>
              <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.68a12.76 12.76 0 0 0 6.24 1.6c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.796-12.72zm0 23.36a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-3.89 1 1.04-3.79-.25-.39a10.54 10.54 0 0 1-1.62-5.68c0-5.84 4.75-10.6 10.6-10.6 2.83 0 5.49 1.1 7.49 3.1a10.53 10.53 0 0 1 3.1 7.5c0 5.85-4.75 10.56-10.31 10.56zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/>
              </svg>
              Send Prescription on WhatsApp
            </button>
          </div>
        </div>
      </section>
      )}

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