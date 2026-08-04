import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById, formatPrice, getDiscountPercent, products } from '../data/products.jsx';

const WHATSAPP_NUMBER = '7676044306';

function buildWhatsAppShareUrl(product) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const priceText = product.oldPrice
    ? `${formatPrice(product.price)} (was ${formatPrice(product.oldPrice)}${discount ? `, SAVE ${discount}%` : ''})`
    : formatPrice(product.price);

  // Build the clickable product page URL that works in both dev and production
  const baseUrl = window.location.origin + import.meta.env.BASE_URL;
  const productUrl = `${baseUrl}product/${product.id}`;

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
    `🔗 View this product:`,
    productUrl
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Field tooltips for prescription guide
const FIELD_TOOLTIPS = {
  SPH: 'SPH (Sphere): Corrects short-sightedness (minus power) or long-sightedness (plus power).',
  CYL: 'CYL (Cylinder): Corrects astigmatism (uneven curvature of the eye).',
  AXIS: 'AXIS: Specifies the direction of astigmatism correction (1°–180°).',
  ADD: 'ADD: Additional magnification required for reading or progressive lenses.',
  IPD: 'IPD (Interpupillary Distance): Distance between the centers of your pupils, used for accurate lens alignment.'
};

function Tooltip({ text, label }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState('top');
  const wrapperRef = React.useRef(null);

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextShow = !show;
    setShow(nextShow);
    if (nextShow && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 260;
      const spaceRight = viewportWidth - rect.right;
      const spaceLeft = rect.left;
      const spaceTop = rect.top;
      const spaceBottom = window.innerHeight - rect.bottom;

      // Smart positioning based on available space
      if (spaceRight >= tooltipWidth + 10) {
        setPosition('right');
      } else if (spaceLeft >= tooltipWidth + 10) {
        setPosition('left');
      } else if (spaceTop >= 120) {
        setPosition('top');
      } else if (spaceBottom >= 120) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  };

  // Close tooltip when clicking outside
  React.useEffect(() => {
    if (!show) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [show]);

  return (
    <span className="tooltip-wrapper" ref={wrapperRef}>
      <span
        className="tooltip-icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-label={`Info about ${label}`}
      >
        ⓘ
      </span>
      {show && (
        <span className={`tooltip-bubble tooltip-${position}`} role="tooltip">
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
    ipd: ''
  });
  const [confirmed, setConfirmed] = useState(false);
  const [fileName, setFileName] = useState('');

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const buildPrescriptionMessage = () => {
    const baseUrl = window.location.origin + import.meta.env.BASE_URL;
    const productUrl = `${baseUrl}product/${product.id}`;

    const lines = [
      `👓 Prescription Order: ${product.name}`,
      `Price: ${formatPrice(product.price)}`,
      ``,
      `RIGHT EYE (RE):`,
      `  SPH: ${prescription.reSph || '—'}`,
      `  CYL: ${prescription.reCyl || '—'}`,
      `  AXIS: ${prescription.reAxis || '—'}`,
      `  ADD: ${prescription.reAdd || '—'}`,
      ``,
      `LEFT EYE (LE):`,
      `  SPH: ${prescription.leSph || '—'}`,
      `  CYL: ${prescription.leCyl || '—'}`,
      `  AXIS: ${prescription.leAxis || '—'}`,
      `  ADD: ${prescription.leAdd || '—'}`,
      ``,
      `IPD: ${prescription.ipd || '—'} mm`,
      ``,
      `✅ I confirm the prescription details above are accurate.`,
      fileName ? `📄 Prescription uploaded: ${fileName}` : ``,
      ``,
      `🔗 Product: ${productUrl}`
    ].filter(line => line !== '');

    return lines.join('\n');
  };

  const sendPrescriptionOnWhatsApp = () => {
    if (!confirmed) {
      alert('Please tick the confirmation checkbox before sending your prescription.');
      return;
    }
    const message = buildPrescriptionMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
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
      <section className="prescription-section">
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
                <span className="field-name">IPD <Tooltip text={FIELD_TOOLTIPS.IPD} label="IPD" /></span>
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
          <div className="prescription-form-box">
            <h3>Enter Your Prescription</h3>

            <div className="prescription-form-grid">
              {/* RE column */}
              <div className="prescription-column">
                <h4>Right Eye (RE)</h4>
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

              {/* LE column */}
              <div className="prescription-column">
                <h4>Left Eye (LE)</h4>
                <div className="prescription-input-group">
                  <label>SPH <Tooltip text={FIELD_TOOLTIPS.SPH} label="SPH" /></label>
                  <input type="text" placeholder="e.g. -2.25" value={prescription.leSph} onChange={e => updateField('leSph', e.target.value)} />
                </div>
                <div className="prescription-input-group">
                  <label>CYL <Tooltip text={FIELD_TOOLTIPS.CYL} label="CYL" /></label>
                  <input type="text" placeholder="e.g. -0.50" value={prescription.leCyl} onChange={e => updateField('leCyl', e.target.value)} />
                </div>
                <div className="prescription-input-group">
                  <label>AXIS <Tooltip text={FIELD_TOOLTIPS.AXIS} label="AXIS" /></label>
                  <input type="text" placeholder="e.g. 175" value={prescription.leAxis} onChange={e => updateField('leAxis', e.target.value)} />
                </div>
                <div className="prescription-input-group">
                  <label>ADD <Tooltip text={FIELD_TOOLTIPS.ADD} label="ADD" /></label>
                  <input type="text" placeholder="e.g. +1.75" value={prescription.leAdd} onChange={e => updateField('leAdd', e.target.value)} />
                </div>
              </div>
            </div>

            {/* IPD */}
            <div className="prescription-input-group prescription-ipd">
              <label>IPD (mm) <Tooltip text={FIELD_TOOLTIPS.IPD} label="IPD" /></label>
              <input type="text" placeholder="e.g. 62" value={prescription.ipd} onChange={e => updateField('ipd', e.target.value)} />
            </div>

            {/* Prescription upload */}
            <div className="prescription-upload-area">
              <label className="prescription-upload-btn">
                📄 Upload Prescription
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} hidden />
              </label>
              {fileName && <span className="prescription-file-name">📎 {fileName}</span>}
              <p className="prescription-upload-note">
                "If you're unsure about any values, upload your prescription and our team will verify it before processing your order."
              </p>
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