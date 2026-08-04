/**
 * Prescription PDF Generation Utility
 * 
 * Generates a professional, print-ready A4 prescription PDF using jsPDF.
 * Features:
 * - Company logo beside company name (logo on the left)
 * - Monochrome professional layout
 * - Clickable product URL hyperlink
 * - Auto-generated QR code pointing to the product page
 * - Handles missing values with "N/A"
 * - Automatic filename: Prescription-{CustomerName}-{Date}.pdf
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ===== Constants =====
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 15; // Page margin in mm
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2); // Usable content width

// Typography (monochrome professional palette)
const COLORS = {
  black: [20, 20, 20],
  darkGray: [60, 60, 60],
  gray: [100, 100, 100],
  lightGray: [180, 180, 180],
  veryLightGray: [240, 240, 240],
  white: [255, 255, 255],
  accent: [37, 99, 235],
  accentLight: [96, 165, 250]
};

const FONTS = {
  heading: 'helvetica',
  body: 'helvetica'
};

// Logo data URL - loaded from public/eyewear.png
let logoDataUrl = null;

/**
 * Load the company logo as a data URL for embedding in the PDF
 * @returns {Promise<string|null>} Logo data URL or null if failed
 */
async function loadLogo() {
  if (logoDataUrl) return logoDataUrl;
  
  try {
    // Try multiple paths to find the logo
    const paths = [
      `${import.meta.env.BASE_URL}eyewear.png`,
      '/eyewear.png',
      'eyewear.png'
    ];
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const blob = await response.blob();
          logoDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          return logoDataUrl;
        }
      } catch (e) {
        // Try next path
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to load logo for PDF:', error);
    return null;
  }
}

/**
 * Format a value for display, showing "N/A" for empty/missing values
 * @param {string|number} value - The prescription value
 * @returns {string} Formatted value or "N/A"
 */
function formatValue(value) {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  return String(value).trim() || 'N/A';
}

/**
 * Format the current date as DD-MM-YYYY
 * @returns {string} Formatted date string
 */
function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Sanitize a customer name for use in a filename
 * @param {string} name - Raw customer name
 * @returns {string} Sanitized filename-safe name
 */
function sanitizeFilename(name) {
  if (!name || !name.trim()) return 'Customer';
  // Remove characters that are invalid in filenames
  return name.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
}

/**
 * Draw a horizontal divider line
 * @param {jsPDF} doc - jsPDF instance
 * @param {number} y - Y position
 * @param {number} x - X start position
 * @param {number} width - Line width
 * @param {Array} color - RGB color array
 * @param {number} lineWidth - Line thickness
 */
function drawDivider(doc, y, x = MARGIN, width = CONTENT_WIDTH, color = COLORS.lightGray, lineWidth = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(lineWidth);
  doc.line(x, y, x + width, y);
}

/**
 * Draw a section header with a subtle background bar
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} title - Section title
 * @param {number} y - Y position
 * @returns {number} New Y position after the section header
 */
function drawSectionHeader(doc, title, y) {
  // Section title
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.black);
  doc.text(title.toUpperCase(), MARGIN, y);

  // Underline accent
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, MARGIN + 30, y + 1.5);

  return y + 7;
}

/**
 * Draw a label-value pair in a table-like row
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} label - Field label
 * @param {string} value - Field value
 * @param {number} y - Y position
 * @param {number} labelWidth - Width of the label column
 * @param {number} valueX - X position for the value
 * @returns {number} New Y position
 */
function drawFieldRow(doc, label, value, y, labelWidth = 30, valueX = MARGIN + 35) {
  // Label
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkGray);
  doc.text(label, MARGIN, y);

  // Value
  doc.setFont(FONTS.body, 'normal');
  doc.setTextColor(...COLORS.black);
  doc.text(value, valueX, y);

  return y + 6;
}

/**
 * Draw the prescription eye section (RE or LE)
 * @param {jsPDF} doc - jsPDF instance
 * @param {string} eyeLabel - "Right Eye (RE)" or "Left Eye (LE)"
 * @param {Object} values - Prescription values for the eye
 * @param {number} y - Starting Y position
 * @returns {number} New Y position
 */
function drawEyeSection(doc, eyeLabel, values, y) {
  // Eye label
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.black);
  doc.text(eyeLabel, MARGIN, y);

  y += 5;

  // Draw a subtle box for the eye values
  const boxHeight = 30;
  doc.setFillColor(...COLORS.veryLightGray);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, boxHeight, 1.5, 1.5, 'F');

  // Field rows inside the box
  const fields = [
    { label: 'SPH', value: formatValue(values.sph) },
    { label: 'CYL', value: formatValue(values.cyl) },
    { label: 'AXIS', value: formatValue(values.axis) },
    { label: 'ADD', value: formatValue(values.add) }
  ];

  // Two-column layout for eye fields
  const colWidth = CONTENT_WIDTH / 2;
  const col1X = MARGIN + 5;
  const col2X = MARGIN + colWidth + 5;

  fields.forEach((field, index) => {
    const colX = index < 2 ? col1X : col2X;
    const rowIndex = index % 2;
    const rowY = y + (rowIndex * 6);

    // Label
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(field.label, colX, rowY);

    // Value
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.black);
    doc.text(field.value, colX + 15, rowY);
  });

  return y + boxHeight + 2;
}

/**
 * Generate a QR code as a data URL
 * @param {string} url - URL to encode in the QR code
 * @returns {Promise<string>} QR code data URL
 */
async function generateQRCode(url) {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#141414',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

/**
 * Generate the prescription PDF
 * @param {Object} options - PDF generation options
 * @param {Object} options.product - Product object (name, category, price, id)
 * @param {Object} options.prescription - Prescription values
 * @param {string} options.prescription.reSph - Right eye SPH
 * @param {string} options.prescription.reCyl - Right eye CYL
 * @param {string} options.prescription.reAxis - Right eye AXIS
 * @param {string} options.prescription.reAdd - Right eye ADD
 * @param {string} options.prescription.leSph - Left eye SPH
 * @param {string} options.prescription.leCyl - Left eye CYL
 * @param {string} options.prescription.leAxis - Left eye AXIS
 * @param {string} options.prescription.leAdd - Left eye ADD
 * @param {string} options.prescription.pd - Pupillary distance
 * @param {string} options.confirmationText - Customer confirmation text
 * @param {string} options.customerName - Customer name (for filename)
 * @param {string} options.productUrl - Full product URL
 * @returns {Promise<{doc: jsPDF, filename: string}>} PDF document and filename
 */
export async function generatePrescriptionPDF({
  product,
  prescription,
  confirmationText,
  customerName = '',
  productUrl
}) {
  // Validate required inputs
  if (!product) {
    throw new Error('Product information is required to generate the PDF.');
  }
  if (!productUrl) {
    throw new Error('Product URL is required to generate the PDF.');
  }

  // Create A4 document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // ===== HEADER =====
  let y = MARGIN + 5;

  // Load the company logo
  const logo = await loadLogo();

  // Logo on the left side, company name beside it
  if (logo) {
    const logoSize = 18; // mm
    const logoX = MARGIN;
    const logoY = y - logoSize + 2;
    
    // Add logo image
    doc.addImage(logo, 'PNG', logoX, logoY, logoSize, logoSize);
    
    // Company name to the right of the logo
    const nameX = logoX + logoSize + 5;
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.black);
    doc.text('BRIGHT EYEWEAR', nameX, y);
    
    // Tagline below company name
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('Crafted for Your Vision', nameX, y + 4);
  } else {
    // Fallback: text-only header if logo fails to load
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.black);
    doc.text('BRIGHT EYEWEAR', MARGIN, y);

    // Tagline
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('Crafted for Your Vision', MARGIN, y + 4);
  }

  // Document title on the right
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.accent);
  doc.text('NEW PRESCRIPTION ORDER', PAGE_WIDTH - MARGIN, y, { align: 'right' });

  // Date below title
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Date: ${formatDate()}`, PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

  y += 12;

  // Header divider
  drawDivider(doc, y, MARGIN, CONTENT_WIDTH, COLORS.accent, 0.8);
  y += 8;

  // ===== PRODUCT DETAILS =====
  y = drawSectionHeader(doc, 'Product Details', y);

  const category = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'N/A';

  y = drawFieldRow(doc, 'Model Name:', formatValue(product.name), y);
  y = drawFieldRow(doc, 'Category:', formatValue(category), y);
  y = drawFieldRow(doc, 'Price:', `₹${formatValue(product.price)}`, y);

  y += 4;

  // ===== PRESCRIPTION DETAILS =====
  y = drawSectionHeader(doc, 'Prescription Details', y);

  // Right Eye
  y = drawEyeSection(doc, 'Right Eye (RE)', {
    sph: prescription.reSph,
    cyl: prescription.reCyl,
    axis: prescription.reAxis,
    add: prescription.reAdd
  }, y);

  y += 3;

  // Left Eye
  y = drawEyeSection(doc, 'Left Eye (LE)', {
    sph: prescription.leSph,
    cyl: prescription.leCyl,
    axis: prescription.leAxis,
    add: prescription.leAdd
  }, y);

  y += 4;

  // ===== PUPILLARY DISTANCE =====
  y = drawSectionHeader(doc, 'Pupillary Distance', y);

  // IPD box
  doc.setFillColor(...COLORS.veryLightGray);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 10, 1.5, 1.5, 'F');

  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkGray);
  doc.text('IPD', MARGIN + 5, y + 1);

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  const pdValue = formatValue(prescription.pd);
  doc.text(`${pdValue}${pdValue !== 'N/A' ? ' mm' : ''}`, MARGIN + 20, y + 1);

  y += 12;

  // ===== CUSTOMER CONFIRMATION =====
  y = drawSectionHeader(doc, 'Customer Confirmation', y);

  // Confirmation text in a bordered box
  const confirmation = confirmationText || 'I confirm that the prescription details provided above are accurate and match my latest eye prescription.';

  // Calculate text wrapping
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.darkGray);

  const lines = doc.splitTextToSize(confirmation, CONTENT_WIDTH - 10);
  const textHeight = lines.length * 4.5;

  // Draw box
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, textHeight + 8, 1.5, 1.5, 'S');

  // Draw text
  doc.text(lines, MARGIN + 5, y + 1);

  y += textHeight + 10;

  // ===== PRODUCT LINK =====
  y = drawSectionHeader(doc, 'Product Link', y);

  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text(`Product: Bright Eyewear – ${formatValue(product.name)}`, MARGIN, y);

  y += 5;

  // Clickable hyperlink
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.accent);
  doc.textWithLink(productUrl, MARGIN, y, { url: productUrl });

  // Underline the link
  const linkWidth = doc.getTextWidth(productUrl);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 0.8, MARGIN + linkWidth, y + 0.8);

  y += 8;

  // ===== QR CODE =====
  // Generate QR code pointing to the product URL
  const qrDataUrl = await generateQRCode(productUrl);

  if (qrDataUrl) {
    // QR code size
    const qrSize = 35;
    const qrX = PAGE_WIDTH - MARGIN - qrSize;
    const qrY = y - 2;

    // Add QR code image
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // QR label
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.gray);
    doc.text('Scan to view product', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });

    // Draw a border around the QR code
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
  }

  // ===== FOOTER =====
  // Footer at the bottom of the page
  const footerY = PAGE_HEIGHT - MARGIN - 5;

  // Footer divider
  drawDivider(doc, footerY - 5, MARGIN, CONTENT_WIDTH, COLORS.lightGray, 0.3);

  // Footer text
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.black);
  doc.text('Bright Eyewear — Crafted for Your Vision', PAGE_WIDTH / 2, footerY, { align: 'center' });

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('Precision Lenses • Premium Frames • Clear Vision', PAGE_WIDTH / 2, footerY + 4, { align: 'center' });

  // ===== FILENAME =====
  const safeName = sanitizeFilename(customerName);
  const filename = `Prescription-${safeName}-${formatDate()}.pdf`;

  return { doc, filename };
}

/**
 * Generate and download the prescription PDF
 * @param {Object} options - Same options as generatePrescriptionPDF
 * @returns {Promise<{doc: jsPDF, filename: string}>} The generated PDF and filename
 */
export async function generateAndDownloadPrescriptionPDF(options) {
  try {
    const { doc, filename } = await generatePrescriptionPDF(options);
    doc.save(filename);
    return { doc, filename };
  } catch (error) {
    console.error('Failed to generate prescription PDF:', error);
    throw new Error('Failed to generate the prescription PDF. Please try again.');
  }
}