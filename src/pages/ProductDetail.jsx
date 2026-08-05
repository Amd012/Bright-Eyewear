import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductById, formatPrice, getDiscountPercent, products, getLensInfo, getLensCategory, getLensCategoryLabel, getFinalPrice } from '../data/products.jsx';
import { sharePrescriptionOnWhatsAppWithPDF, sharePrescriptionOnWhatsAppWithoutPDF } from '../utils/whatsappShare';
import ImageGallery from '../components/ImageGallery';
import LensSelection from '../components/LensSelection';
import { useSeo } from '../hooks/useSeo';

const WHATSAPP_NUMBER = '917676044306';
const BASE_URL = 'https://bright-eyewear.netlify.app';

function buildWhatsAppShareUrl(product, selectedLens) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const productUrl = `${BASE_URL}/product/${product.id}`;
  const category = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const lensInfo = selectedLens ? getLensInfo(selectedLens) : null;
  const lensCategory = selectedLens ? getLensCategory(selectedLens) : null;
  const finalPrice = getFinalPrice(product.price, selectedLens);

  const priceText = product.oldPrice
    ? `RS. ${product.price} (was RS. ${product.oldPrice}${discount ? `, SAVE ${discount}%` : ''})`
    : `RS. ${product.price}`;

  const lines = [
    `👓 *PRODUCT DETAILS* 👓`,
    `Model Name : ${product.name}`,
    `Category    : ${category}`,
    `Price       : ${priceText}`,
    `Description : ${product.description}`,
    `Frame Color : ${product.specs?.find(s => s.label === 'Color')?.value || 'N/A'}`,
    `Frame Size  : ${product.specs?.find(s => s.label === 'Frame Size')?.value || 'N/A'}`,
  ];

  if (lensInfo && lensCategory) {
    lines.push(
      ``,
      `*🔬 LENS SELECTION*`,
      `Lens Category : ${getLensCategoryLabel(lensCategory)}`,
      `Lens Type     : ${lensInfo.name}`,
      `Lens Price    : RS. ${lensInfo.price}`,
      `Frame Price   : RS. ${product.price}`,
      `Grand Total   : RS. ${finalPrice}`
    );
  }

  lines.push(
    ``,
    `✨ Bright Eyewear — Crafted for Your Vision`,
    `Precision Lenses • Premium Frames • Clear Vision`,
    ``,
    `*🔗 PRODUCT LINK*`,
    productUrl
  );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
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

  useEffect(() => {
    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

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
    hideTimerRef.current = setTimeout(() => {
      setShow(false);
    }, 100);
  }, []);

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
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState({
    reSph: '', reCyl: '', reAxis: '', reAdd: '',
    leSph: '', leCyl: '', leAxis: '', leAdd: '',
    pd: ''
  });
  const [confirmed, setConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);
  const [selectedLens, setSelectedLens] = useState(null);

  const product = getProductById(id);

  // Dynamic SEO metadata for WhatsApp link previews
  useSeo({
    title: product?.name,
    description: product?.description,
    image: product?.image,
    url: `${BASE_URL}/product/${id}`,
    type: 'product'
  });

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
  const finalPrice = getFinalPrice(product.price, selectedLens);
  const lensInfo = selectedLens ? getLensInfo(selectedLens) : null;
  const lensCategory = selectedLens ? getLensCategory(selectedLens) : null;

  const updateField = (key, value) => {
    setPrescription(prev => ({ ...prev, [key]: value }));
  };

  const buildPrescriptionMessage = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
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
    const frameColor = product.specs?.find(s => s.label === 'Color')?.value || 'N/A';
    const frameSize = product.specs?.find(s => s.label === 'Frame Size')?.value || 'N/A';

    const lines = [
      `*NEW PRESCRIPTION ORDER*`,
      ``,
      `*📦 PRODUCT DETAILS*`,
      `Customer Name : ${customerName || 'N/A'}`,
      `Model Name    : ${product.name}`,
      `Category      : ${category}`,
      `Description   : ${product.description}`,
      `Frame Color   : ${frameColor}`,
      `Frame Size    : ${frameSize}`,
      `Frame Price   : RS. ${product.price}`,
    ];

    if (lensInfo && lensCategory) {
      lines.push(
        `Lens Category : ${getLensCategoryLabel(lensCategory)}`,
        `Lens Type     : ${lensInfo.name}`,
        `Lens Price    : RS. ${lensInfo.price}`,
        `Grand Total   : RS. ${finalPrice}`
      );
    } else {
      lines.push(`Grand Total   : RS. ${product.price}`);
    }

    // Only include prescription details if any are provided
    const hasPrescription = reSph !== 'N/A' || reCyl !== 'N/A' || reAxis !== 'N/A' || reAdd !== 'N/A' ||
      leSph !== 'N/A' || leCyl !== 'N/A' || leAxis !== 'N/A' || leAdd !== 'N/A' || pd !== 'N/A';

    if (hasPrescription) {
      lines.push(
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
        `I confirm that the prescription details provided above are accurate and match my latest eye prescription. I understand that these values will be used to manufacture my lenses, and I have reviewed all information before submitting this order.`
      );
    }

    lines.push(
      ``,
      `*🔗 PRODUCT LINK*`,
      `Product: Bright Eyewear – ${product.name}`,
      ``,
      productUrl,
      ``,
      `✨ Bright Eyewear — Crafted for Your Vision`,
      `Precision Lenses • Premium Frames • Clear Vision`
    );

    return lines.join('\n');
  };

  const sendPrescriptionOnWhatsApp = async (withPDF) => {
    if (!customerName || !customerName.trim()) {
      alert('Please enter your name before sending your prescription.');
      return;
    }

    if (!confirmed) {
      alert('Please tick the confirmation checkbox before sending your prescription.');
      return;
    }

    if (isSending) return;

    setIsSending(true);
    setShareStatus(null);

    try {
      const confirmationText = 'I confirm that the prescription details provided above are accurate and match my latest eye prescription. I understand that these values will be used to manufacture my lenses, and I have reviewed all information before submitting this order.';

      let result;
      if (withPDF) {
        result = await sharePrescriptionOnWhatsAppWithPDF({
          product,
          prescription,
          confirmationText,
          customerName,
          selectedLens,
          finalPrice
        });
      } else {
        result = await sharePrescriptionOnWhatsAppWithoutPDF({
          product,
          prescription,
          confirmationText,
          customerName,
          selectedLens,
          finalPrice
        });
      }

      if (result.success) {
        setShareStatus({
          type: 'success',
          text: result.message
        });
        
        setTimeout(() => {
          navigate(`/product/${product.id}`, { replace: true });
        }, 800);
      } else {
        setShareStatus({
          type: 'error',
          text: result.error
        });
      }
    } catch (error) {
      console.error('Error sharing prescription:', error);
      setShareStatus({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
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
          <div className="product-gallery-wrapper">
            {product.tag && <span className="product-tag">{product.tag}</span>}
            <ImageGallery images={product.images || [product.image]} alt={product.name} />
          </div>

          {/* Right: Basic Information */}
          <div className="product-info-detail">
            <h1>{product.name}</h1>
            <p className="category-label">{product.category}</p>
            <div className="price-row">
              <span className="price-current">{formatPrice(finalPrice)}</span>
              {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
              {discount && <span className="price-discount">SAVE {discount}%</span>}
            </div>
            <p className="product-desc">{product.description}</p>

            {/* Action buttons */}
            <div className="product-action-buttons">
              <a
                href={buildWhatsAppShareUrl(product, selectedLens)}
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
              <a href="#prescription-form" className="btn btn-primary btn-sm product-prescription-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
                Add Prescription Details
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Below: Lens Selection, Specifications & Highlights (full width) */}
      <section className="product-below">
        <div className="container">
          {/* Lens Selection - positioned below product info, above specs */}
          <div className="lens-selection-section">
            <LensSelection
              product={product}
              selectedLens={selectedLens}
              onLensSelect={setSelectedLens}
            />
          </div>

          <div className="highlights-full">
            <h3>Key Highlights</h3>
            <ul>
              {(product.highlights || []).map((highlight, idx) => (
                <li key={idx}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== PRESCRIPTION GUIDE & CUSTOMER NOTES ===== */}
      <section className="prescription-section" id="prescription">
        <div className="container">
          <div className="section-header">
            <h2>Prescription Guide & Customer Notes</h2>
            <div className="accent-line"></div>
          </div>

          <div className="prescription-info-box">
            <h3>Why do we ask for these details?</h3>
            <p>
              These values help us manufacture and deliver lenses that match your vision requirements. If you already wear glasses, you can find these values on your prescription provided by your eye doctor or optometrist.
            </p>
          </div>

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

          <div className="prescription-notes-box">
            <h3>Important Notes</h3>
            <ul>
              <li>✅ Tick the checkbox only after verifying that the prescription details are correct.</li>
              <li>💬 If you do not have a prescription, contact our team through <strong>WhatsApp</strong> for assistance.</li>
              <li>⚠️ Wrong prescription values may result in incorrect lenses being manufactured.</li>
              <li>📄 We recommend uploading a prescription image for verification.</li>
            </ul>
          </div>

          <div className="prescription-form-box" id="prescription-form">
            <h3>Enter Your Prescription</h3>

            <div className="prescription-form-grid">
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

            <div className="prescription-input-group prescription-ipd">
              <label>Your Name (required) <Tooltip text="Used to name your prescription PDF file. This is required before sending." label="Name" /></label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                maxLength={50}
                required
              />
            </div>

            <div className="prescription-input-group prescription-ipd">
              <label>PD (mm) <Tooltip text={FIELD_TOOLTIPS.PD} label="PD" /></label>
              <input type="text" placeholder="e.g. 62" value={prescription.pd} onChange={e => updateField('pd', e.target.value)} />
            </div>

            <label className="prescription-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
              />
              <span>I confirm that the prescription information provided above is accurate and matches my latest eye prescription.</span>
            </label>

            {shareStatus && (
              <div className={`prescription-share-status ${shareStatus.type}`} role="status">
                {shareStatus.type === 'success' ? '✅ ' : '⚠️ '}
                {shareStatus.text}
              </div>
            )}

            <div className="prescription-send-options">
              <button
                className="btn btn-primary prescription-send-btn"
                onClick={() => sendPrescriptionOnWhatsApp(true)}
                disabled={isSending}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm1-3.5c0 .83-.67 1.5-1.5 1.5h-1V7h1c.83 0 1.5.67 1.5 1.5zM9 11.5h1.5V13H9v-1.5zm4.5 0h1.5V13h-1.5v-1.5zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                </svg>
                {isSending ? 'Generating PDF...' : 'Send with PDF'}
              </button>
              <button
                className="btn btn-outline prescription-send-btn prescription-send-no-pdf"
                onClick={() => sendPrescriptionOnWhatsApp(false)}
                disabled={isSending}
              >
                <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.46 1.71 6.4L3.2 28.8l6.56-1.68a12.76 12.76 0 0 0 6.24 1.6c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.796-12.72zm0 23.36a10.56 10.56 0 0 1-5.38-1.47l-.38-.23-3.89 1 1.04-3.79-.25-.39a10.54 10.54 0 0 1-1.62-5.68c0-5.84 4.75-10.6 10.6-10.6 2.83 0 5.49 1.1 7.49 3.1a10.53 10.53 0 0 1 3.1 7.5c0 5.85-4.75 10.56-10.31 10.56zm5.81-7.92c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/>
                </svg>
                {isSending ? 'Opening WhatsApp...' : 'Send without PDF'}
              </button>
            </div>
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