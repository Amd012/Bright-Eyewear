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

// WhatsApp business number for Bright Eyewear
const WHATSAPP_NUMBER = '917676044306';

// Canonical production base URL for all product links
// This ensures WhatsApp creates a rich link preview card for the product page
const BASE_URL = 'https://bright-eyewear.netlify.app';

/**
 * Build the canonical product URL
 * Always uses the production domain so WhatsApp link previews work correctly
 * @param {string} productId - The product ID
 * @returns {string} Full product URL
 */
export function buildProductUrl(productId) {
  return `${BASE_URL}/product/${productId}`;
}

/**
 * Build the WhatsApp message for sharing a prescription
 * Simple message only - does NOT include the full prescription
 * Follows the prescription message style with section headers and "Label : Value" format
 * Only ONE URL: the product link (triggers WhatsApp rich link preview card)
 *
 * @param {Object} options - Message options
 * @param {string} options.productUrl - The product URL
 * @param {Object} options.product - Product object (for name/category/price display)
 * @returns {string} The WhatsApp message text
 */
export function buildPrescriptionWhatsAppMessage({ productUrl, product }) {
  // Format product details in the prescription message style
  const category = product?.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : '';

  const priceText = product?.price ? `RS. ${product.price}` : '';

  const lines = [
    'Hello!',
    '',
    'Your prescription has been generated successfully.',
    '',
    '📄 Please find your prescription PDF attached.',
    '',
    `👓 *PRODUCT DETAILS* 👓`,
    ...(product?.name ? [`Model Name : ${product.name}`] : []),
    ...(category ? [`Category    : ${category}`] : []),
    ...(priceText ? [`Price       : ${priceText}`] : []),
    '',
    `✨ Bright Eyewear — Crafted for Your Vision`,
    `Precision Lenses • Premium Frames • Clear Vision`,
    '',
    `*🔗 PRODUCT LINK*`,
    productUrl,
    '',
    'Thank you for choosing Bright Eyewear.'
  ];

  return lines.join('\n');
}

/**
 * Build the full prescription WhatsApp message (without PDF)
 * Includes all prescription details directly in the message
 *
 * @param {Object} options - Message options
 * @param {string} options.productUrl - The product URL
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @returns {string} The WhatsApp message text
 */
export function buildFullPrescriptionMessage({ productUrl, product, prescription, confirmationText }) {
  const category = product?.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'N/A';

  const reSph = prescription?.reSph || 'N/A';
  const reCyl = prescription?.reCyl || 'N/A';
  const reAxis = prescription?.reAxis || 'N/A';
  const reAdd = prescription?.reAdd || 'N/A';
  const leSph = prescription?.leSph || 'N/A';
  const leCyl = prescription?.leCyl || 'N/A';
  const leAxis = prescription?.leAxis || 'N/A';
  const leAdd = prescription?.leAdd || 'N/A';
  const pd = prescription?.pd || 'N/A';

  const lines = [
    `*NEW PRESCRIPTION ORDER*`,
    ``,
    `*📦 PRODUCT DETAILS*`,
    `Model Name : ${product?.name || 'N/A'}`,
    `Category    : ${category}`,
    `Price       : RS. ${product?.price || 'N/A'}`,
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
    confirmationText || 'I confirm that the prescription details provided above are accurate and match my latest eye prescription.',
    ``,
    `*🔗 PRODUCT LINK*`,
    `Product: Bright Eyewear – ${product?.name || 'N/A'}`,
    ``,
    productUrl,
    ``,
    `✨ Bright Eyewear — Crafted for Your Vision`,
    `Precision Lenses • Premium Frames • Clear Vision`
  ];

  return lines.join('\n');
}

/**
 * Open WhatsApp with a pre-filled message
 * @param {string} message - The message to send
 * @param {string} phoneNumber - WhatsApp number (defaults to Bright Eyewear)
 */
export function openWhatsApp(message, phoneNumber = WHATSAPP_NUMBER) {
  // encodeURIComponent produces %0A for newlines, which WhatsApp
  // correctly decodes as line breaks.
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encoded}`;

  // Open in new tab
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Share prescription on WhatsApp WITH PDF
 * 
 * Flow:
 * 1. Generate the PDF
 * 2. Download it (browser limitation - cannot auto-attach to WhatsApp)
 * 3. Open WhatsApp with a short message
 * 4. Show a notice to attach the PDF
 * 
 * @param {Object} options - Share options
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name (for filename)
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsAppWithPDF({
  product,
  prescription,
  confirmationText,
  customerName = ''
}) {
  try {
    // Build the product URL
    const productUrl = buildProductUrl(product.id);

    // Step 1: Generate and download the PDF
    const { filename } = await generateAndDownloadPrescriptionPDF({
      product,
      prescription,
      confirmationText,
      customerName,
      productUrl
    });

    // Step 2: Build the WhatsApp message
    const message = buildPrescriptionWhatsAppMessage({
      productUrl,
      product
    });

    // Step 3: Open WhatsApp with the message
    openWhatsApp(message);

    // Step 4: Return success with filename for the user notice
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
 * Flow:
 * 1. Build the full prescription message
 * 2. Open WhatsApp directly with the message
 * 
 * @param {Object} options - Share options
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @returns {Promise<{success: boolean, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsAppWithoutPDF({
  product,
  prescription,
  confirmationText
}) {
  try {
    // Build the product URL
    const productUrl = buildProductUrl(product.id);

    // Build the full prescription message
    const message = buildFullPrescriptionMessage({
      productUrl,
      product,
      prescription,
      confirmationText
    });

    // Open WhatsApp with the message
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
 * @param {Object} options.product - Product object
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name (for filename)
 * @param {boolean} options.withPDF - Whether to generate a PDF (default: true)
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>} Result
 */
export async function sharePrescriptionOnWhatsApp(options) {
  const { withPDF = true } = options;
  
  if (withPDF) {
    return sharePrescriptionOnWhatsAppWithPDF(options);
  }
  
  return sharePrescriptionOnWhatsAppWithoutPDF(options);
}