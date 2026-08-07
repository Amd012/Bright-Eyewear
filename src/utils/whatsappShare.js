/**
 * WhatsApp Sharing Utility
 * 
 * Handles the "Share on WhatsApp" flow for prescriptions:
 * 1. Option A: Generate a professional PDF, download it, and open WhatsApp
 * 2. Option B: Open WhatsApp directly with the full prescription message (no PDF)
 * 
 * The user can choose which method they prefer.
 */

import { generateAndDownloadPrescriptionPDF } from './prescriptionPdf';
import { getLensInfo, getLensCategory, getLensCategoryLabel, getFinalPrice } from '../data/products.jsx';
import { buildProductUrl } from './siteConfig';

// WhatsApp business number for Bright Eyewear
const WHATSAPP_NUMBER = '917676044306';

/**
 * Build the WhatsApp message for sharing a prescription
 * Includes lens selection and dynamic pricing when available
 *
 * @param {Object} options - Message options
 * @param {string} options.productUrl - The product URL
 * @param {Object} options.product - Product object
 * @param {string} options.customerName - Customer name
 * @param {string} options.selectedLens - Selected lens ID
 * @param {number} options.finalPrice - Final price (frame + lens)
 * @returns {string} The WhatsApp message text
 */
export function buildPrescriptionWhatsAppMessage({ productUrl, product, customerName, selectedLens, finalPrice }) {
  const category = product?.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : '';

  const lensInfo = selectedLens ? getLensInfo(selectedLens) : null;
  const lensCategory = selectedLens ? getLensCategory(selectedLens) : null;
  const total = finalPrice || getFinalPrice(product?.price || 0, selectedLens);

  const frameColor = product?.specs?.find(s => s.label === 'Color')?.value || 'N/A';
  const frameSize = product?.specs?.find(s => s.label === 'Frame Size')?.value || 'N/A';

  const lines = [
    `*NEW PRESCRIPTION ORDER*`,
    '',
    `👓 *PRODUCT DETAILS* 👓`,
    ...(customerName ? [`Customer Name : ${customerName}`] : []),
    ...(product?.name ? [`Model Name : ${product.name}`] : []),
    ...(category ? [`Category    : ${category}`] : []),
    ...(product?.description ? [`Description : ${product.description}`] : []),
    `Frame Color : ${frameColor}`,
    `Frame Size  : ${frameSize}`,
    `Frame Price : RS. ${product?.price || 'N/A'}`,
  ];

  if (lensInfo && lensCategory) {
    lines.push(
      '',
      `*🔬 LENS SELECTION*`,
      `Lens Category : ${getLensCategoryLabel(lensCategory)}`,
      `Lens Type     : ${lensInfo.name}`,
      `Lens Price    : RS. ${lensInfo.price}`,
      `Grand Total   : RS. ${total}`
    );
  } else {
    lines.push(`Grand Total   : RS. ${product?.price || 'N/A'}`);
  }

  lines.push(
    '',
    `✨ Bright Eyewear — Crafted for Your Vision`,
    `Precision Lenses • Premium Frames • Clear Vision`,
    '',
    `*🔗 PRODUCT LINK*`,
    productUrl,
    '',
    'Thank you for choosing Bright Eyewear.'
  );

  return lines.join('\n');
}

/**
 * Build the full prescription WhatsApp message (without PDF)
 * Includes all prescription details directly in the message
 * Omits prescription section if no prescription values are provided
 *
 * @param {Object} options - Message options
 * @param {string} options.productUrl - The product URL
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name
 * @param {string} options.selectedLens - Selected lens ID
 * @param {number} options.finalPrice - Final price
 * @returns {string} The WhatsApp message text
 */
export function buildFullPrescriptionMessage({ productUrl, product, prescription, confirmationText, customerName, selectedLens, finalPrice }) {
  // Always include prescription details when provided
  const reSph = prescription?.reSph || 'N/A';
  const reCyl = prescription?.reCyl || 'N/A';
  const reAxis = prescription?.reAxis || 'N/A';
  const reAdd = prescription?.reAdd || 'N/A';
  const leSph = prescription?.leSph || 'N/A';
  const leCyl = prescription?.leCyl || 'N/A';
  const leAxis = prescription?.leAxis || 'N/A';
  const leAdd = prescription?.leAdd || 'N/A';
  const pd = prescription?.pd || 'N/A';
  const category = product?.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'N/A';

  const lensInfo = selectedLens ? getLensInfo(selectedLens) : null;
  const lensCategory = selectedLens ? getLensCategory(selectedLens) : null;
  const total = finalPrice || getFinalPrice(product?.price || 0, selectedLens);

  const frameColor = product?.specs?.find(s => s.label === 'Color')?.value || 'N/A';
  const frameSize = product?.specs?.find(s => s.label === 'Frame Size')?.value || 'N/A';

  const lines = [
    `*NEW PRESCRIPTION ORDER*`,
    ``,
    `*📦 PRODUCT DETAILS*`,
    ...(customerName ? [`Customer Name : ${customerName}`] : []),
    `Model Name    : ${product?.name || 'N/A'}`,
    `Category      : ${category}`,
    ...(product?.description ? [`Description   : ${product.description}`] : []),
    `Frame Color   : ${frameColor}`,
    `Frame Size    : ${frameSize}`,
    `Frame Price   : RS. ${product?.price || 'N/A'}`,
  ];

  if (lensInfo && lensCategory) {
    lines.push(
      `Lens Category : ${getLensCategoryLabel(lensCategory)}`,
      `Lens Type     : ${lensInfo.name}`,
      `Lens Price    : RS. ${lensInfo.price}`,
      `Grand Total   : RS. ${total}`
    );
  } else {
    lines.push(`Grand Total   : RS. ${product?.price || 'N/A'}`);
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
      confirmationText || 'I confirm that the prescription details provided above are accurate and match my latest eye prescription.'
    );
  }

  lines.push(
    ``,
    `*🔗 PRODUCT LINK*`,
    `Product: Bright Eyewear – ${product?.name || 'N/A'}`,
    ``,
    productUrl,
    ``,
    `✨ Bright Eyewear — Crafted for Your Vision`,
    `Precision Lenses • Premium Frames • Clear Vision`
  );

  return lines.join('\n');
}

/**
 * Open WhatsApp with a pre-filled message
 * @param {string} message - The message to send
 * @param {string} phoneNumber - WhatsApp number (defaults to Bright Eyewear)
 */
export function openWhatsApp(message, phoneNumber = WHATSAPP_NUMBER) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Share prescription on WhatsApp WITH PDF
 * 
 * @param {Object} options - Share options
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name
 * @param {string} options.selectedLens - Selected lens ID
 * @param {number} options.finalPrice - Final price
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsAppWithPDF({
  product,
  prescription,
  confirmationText,
  customerName = '',
  selectedLens,
  finalPrice
}) {
  try {
    const productUrl = buildProductUrl(product.id);

    const { filename } = await generateAndDownloadPrescriptionPDF({
      product,
      prescription,
      confirmationText,
      customerName,
      productUrl,
      selectedLens,
      finalPrice
    });

    // Both buttons send the SAME full message with prescription details
    const message = buildFullPrescriptionMessage({
      productUrl,
      product,
      prescription,
      confirmationText,
      customerName,
      selectedLens,
      finalPrice
    });

    openWhatsApp(message);

    return {
      success: true,
      filename,
      message: `Your prescription PDF "${filename}" has been downloaded. Please attach it to the WhatsApp message before sending.`
    };
  } catch (error) {
    console.error('Failed to share prescription on WhatsApp with PDF:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate the prescription PDF. Please try again.'
    };
  }
}

/**
 * Share prescription on WhatsApp WITHOUT PDF
 * 
 * @param {Object} options - Share options
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name
 * @param {string} options.selectedLens - Selected lens ID
 * @param {number} options.finalPrice - Final price
 * @returns {Promise<{success: boolean, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsAppWithoutPDF({
  product,
  prescription,
  confirmationText,
  customerName,
  selectedLens,
  finalPrice
}) {
  try {
    const productUrl = buildProductUrl(product.id);

    const message = buildFullPrescriptionMessage({
      productUrl,
      product,
      prescription,
      confirmationText,
      customerName,
      selectedLens,
      finalPrice
    });

    openWhatsApp(message);

    return {
      success: true,
      message: 'WhatsApp has been opened with your prescription details. Please review and send the message.'
    };
  } catch (error) {
    console.error('Failed to share prescription on WhatsApp:', error);
    return {
      success: false,
      error: error.message || 'Failed to open WhatsApp. Please try again.'
    };
  }
}

/**
 * Main handler for "Share Prescription on WhatsApp"
 * Backward-compatible wrapper that defaults to PDF generation
 * 
 * @param {Object} options - Share options
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsApp(options) {
  const { withPDF = true } = options;
  
  if (withPDF) {
    return sharePrescriptionOnWhatsAppWithPDF(options);
  }
  
  return sharePrescriptionOnWhatsAppWithoutPDF(options);
}