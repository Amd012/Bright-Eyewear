/**
 * Prescription PDF Generation Utility
 * 
 * Generates a professional, print-ready A4 prescription PDF using jsPDF.
 * Sections in order:
 * 1. Header (Logo + Company + Date)
 * 2. Customer Details
 * 3. Product Details (Image + Name + Description)
 * 4. Lens Selection (Category + Type)
 * 5. Price Breakdown (Frame Price, Lens Price, Grand Total)
 * 6. Prescription Details (RE/LE)
 * 7. Pupillary Distance
 * 8. Product Link (clickable + QR code)
 * 9. Store Information
 * 10. Footer
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { saveAs } from 'file-saver';
import { getLensInfo, getLensCategory, getLensCategoryLabel, getFinalPrice } from '../data/products.jsx';

// ===== Constants =====
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

const STORE_INFO = {
  name: 'Bright Eyewear',
  phone: '+917676044306',
  website: 'bright-eyewear.netlify.app'
};

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

let logoDataUrl = null;
let logoDimensions = null;

async function loadLogo() {
  if (logoDataUrl && logoDimensions) return { dataUrl: logoDataUrl, ...logoDimensions };
  try {
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
          logoDimensions = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 1, height: 1 });
            img.src = logoDataUrl;
          });
          return { dataUrl: logoDataUrl, ...logoDimensions };
        }
      } catch (e) {}
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function loadProductImage(imagePath) {
  if (!imagePath) return null;
  try {
    const response = await fetch(imagePath);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dimensions = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 1, height: 1 });
      img.src = dataUrl;
    });
    return { dataUrl, ...dimensions };
  } catch (error) {
    return null;
  }
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return 'N/A';
  return String(value).trim() || 'N/A';
}

function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

function sanitizeFilename(name) {
  if (!name || !name.trim()) return 'Customer';
  return name.trim().replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
}

function numberToWords(num) {
  if (num === undefined || num === null || num === '') return 'N/A';
  const value = parseFloat(num);
  if (isNaN(value)) return String(num);
  const whole = Math.floor(Math.abs(value));
  const decimal = Math.round((Math.abs(value) - whole) * 100);
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }
  function threeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred) result += ones[hundred] + ' Hundred';
    if (rest) {
      if (hundred) result += ' ';
      result += twoDigits(rest);
    }
    return result;
  }
  function toWords(n) {
    if (n === 0) return 'Zero';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const rest = n % 1000;
    let result = '';
    if (crore) result += twoDigits(crore) + ' Crore';
    if (lakh) {
      if (result) result += ' ';
      result += twoDigits(lakh) + ' Lakh';
    }
    if (thousand) {
      if (result) result += ' ';
      result += twoDigits(thousand) + ' Thousand';
    }
    if (rest) {
      if (result) result += ' ';
      result += threeDigits(rest);
    }
    return result;
  }
  let words = toWords(whole);
  if (decimal > 0) {
    words += ' Rupees and ' + twoDigits(decimal) + ' Paise';
  } else {
    words += ' Rupees';
  }
  return words;
}

function drawDivider(doc, y, x = MARGIN, width = CONTENT_WIDTH, color = COLORS.lightGray, lineWidth = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(lineWidth);
  doc.line(x, y, x + width, y);
}

function drawSectionHeader(doc, title, y) {
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.black);
  doc.text(title.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 1.5, MARGIN + 30, y + 1.5);
  return y + 8;
}

function drawFieldRow(doc, label, value, y, valueX = MARGIN + 45) {
  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkGray);
  doc.text(label, MARGIN, y);
  doc.setFont(FONTS.body, 'normal');
  doc.setTextColor(...COLORS.black);
  doc.text(value, valueX, y);
  return y + 7;
}

function drawEyeSection(doc, eyeLabel, values, y, x = MARGIN, width = CONTENT_WIDTH) {
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text(eyeLabel, x, y);
  y += 5;
  const boxHeight = 28;
  doc.setFillColor(...COLORS.veryLightGray);
  doc.roundedRect(x, y - 4, width, boxHeight, 1.5, 1.5, 'F');
  const fields = [
    { label: 'SPH', value: formatValue(values.sph) },
    { label: 'CYL', value: formatValue(values.cyl) },
    { label: 'AXIS', value: formatValue(values.axis) },
    { label: 'ADD', value: formatValue(values.add) }
  ];
  const colWidth = width / 2;
  const col1X = x + 6;
  const col2X = x + colWidth + 6;
  fields.forEach((field, index) => {
    const colX = index < 2 ? col1X : col2X;
    const rowIndex = index % 2;
    const rowY = y + 1 + (rowIndex * 6);
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(field.label, colX, rowY);
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.black);
    doc.text(field.value, colX + 15, rowY);
  });
  return y + boxHeight + 2;
}

async function generateQRCode(url) {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: { dark: '#141414', light: '#ffffff' }
    });
  } catch (error) {
    return null;
  }
}

export async function generatePrescriptionPDF({
  product,
  prescription,
  confirmationText,
  customerName = '',
  productUrl,
  selectedLens,
  finalPrice
}) {
  if (!product) throw new Error('Product information is required to generate the PDF.');
  if (!productUrl) throw new Error('Product URL is required to generate the PDF.');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // ===== HEADER =====
  let y = MARGIN + 5;
  const logo = await loadLogo();

  if (logo) {
    const targetWidth = 30;
    const aspectRatio = logo.height / logo.width;
    const logoHeight = targetWidth * aspectRatio;
    const maxHeight = 20;
    const finalHeight = Math.min(logoHeight, maxHeight);
    const finalWidth = finalHeight / aspectRatio;
    const logoX = MARGIN;
    const logoY = y - finalHeight + 2;
    doc.addImage(logo.dataUrl, 'PNG', logoX, logoY, finalWidth, finalHeight);
    const nameX = logoX + finalWidth + 6;
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.black);
    doc.text('BRIGHT EYEWEAR', nameX, y);
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('Crafted for Your Vision', nameX, y + 4.5);
  } else {
    doc.setFont(FONTS.heading, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.black);
    doc.text('BRIGHT EYEWEAR', MARGIN, y);
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('Crafted for Your Vision', MARGIN, y + 4.5);
  }

  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.accent);
  doc.text('PRESCRIPTION ORDER', PAGE_WIDTH - MARGIN, y, { align: 'right' });
  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Date: ${formatDate()}`, PAGE_WIDTH - MARGIN, y + 5.5, { align: 'right' });

  y += 14;
  drawDivider(doc, y, MARGIN, CONTENT_WIDTH, COLORS.accent, 0.8);
  y += 8;

  // ===== QR CODE (top right, above product image) =====
  const qrDataUrl = await generateQRCode(productUrl);
  if (qrDataUrl) {
    const qrSize = 25;
    const qrX = PAGE_WIDTH - MARGIN - qrSize;
    const qrY = y - 4;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text('Scan to view product', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
  }

  // ===== CUSTOMER DETAILS =====
  y = drawSectionHeader(doc, 'Customer Details', y);
  y = drawFieldRow(doc, 'Customer Name:', formatValue(customerName), y);
  y = drawFieldRow(doc, 'Order Date:', formatDate(), y);
  y += 3;

  // ===== PRODUCT DETAILS =====
  y = drawSectionHeader(doc, 'Product Details', y);

  const category = product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'N/A';

  // Load and display product image (right side)
  const productImage = await loadProductImage(product.image);
  if (productImage) {
    const imgWidth = 45;
    const imgHeight = imgWidth * (productImage.height / productImage.width);
    const imgX = PAGE_WIDTH - MARGIN - imgWidth;
    const imgY = y - 4;
    doc.addImage(productImage.dataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight);
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
    doc.rect(imgX, imgY, imgWidth, imgHeight);
  }

  y = drawFieldRow(doc, 'Model Name:', formatValue(product.name), y);
  y = drawFieldRow(doc, 'Category:', formatValue(category), y);
  y = drawFieldRow(doc, 'Price:', `RS. ${formatValue(product.price)}`, y);

  // Product description (wrapped) - keep strictly within left side, never overlap image
  if (product.description) {
    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.darkGray);
    doc.text('Description:', MARGIN, y);
    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.black);
    // Use much narrower width to guarantee no overlap with image on right
    const descLines = doc.splitTextToSize(product.description, CONTENT_WIDTH - 70);
    doc.text(descLines, MARGIN + 45, y);
    y += (descLines.length * 5) + 2;
  }
  y += 4;

  // ===== LENS SELECTION =====
  const lensInfo = selectedLens ? getLensInfo(selectedLens) : null;
  const lensCategory = selectedLens ? getLensCategory(selectedLens) : null;
  const total = finalPrice || getFinalPrice(product.price, selectedLens);

  y = drawSectionHeader(doc, 'Lens Selection', y);
  y = drawFieldRow(doc, 'Lens Category:', lensInfo && lensCategory ? getLensCategoryLabel(lensCategory) : 'N/A', y);
  y = drawFieldRow(doc, 'Lens Type:', lensInfo ? lensInfo.name : 'N/A', y);
  y += 3;

  // ===== PRICE BREAKDOWN =====
  y = drawSectionHeader(doc, 'Price Breakdown', y);

  y = drawFieldRow(doc, 'Frame Price:', lensInfo ? `RS. ${formatValue(product.price)}` : `RS. ${formatValue(product.price)}`, y);
  y = drawFieldRow(doc, 'Lens Price:', lensInfo ? `RS. ${formatValue(lensInfo.price)}` : 'N/A', y);

  // Grand total highlighted
  doc.setFillColor(...COLORS.veryLightGray);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 12, 1.5, 1.5, 'F');
  doc.setFont(FONTS.heading, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.accent);
  doc.text('GRAND TOTAL:', MARGIN + 8, y + 1.5);
  doc.text(`RS. ${formatValue(total)}`, PAGE_WIDTH - MARGIN - 8, y + 1.5, { align: 'right' });
  y += 14;

  // Price in words
  doc.setFont(FONTS.body, 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`(Price in words: ${numberToWords(total)} Only)`, MARGIN, y);
  y += 7;
  y += 4;

  // ===== PRESCRIPTION DETAILS =====
  const hasPrescription = prescription && (
    prescription.reSph || prescription.reCyl || prescription.reAxis || prescription.reAdd ||
    prescription.leSph || prescription.leCyl || prescription.leAxis || prescription.leAdd ||
    prescription.pd
  );

  if (hasPrescription) {
    y = drawSectionHeader(doc, 'Prescription Details', y);

    // RE and LE side by side
    const halfWidth = (CONTENT_WIDTH - 8) / 2;
    const reY = drawEyeSection(doc, 'Right Eye (RE)', {
      sph: prescription.reSph,
      cyl: prescription.reCyl,
      axis: prescription.reAxis,
      add: prescription.reAdd
    }, y, MARGIN, halfWidth);

    drawEyeSection(doc, 'Left Eye (LE)', {
      sph: prescription.leSph,
      cyl: prescription.leCyl,
      axis: prescription.leAxis,
      add: prescription.leAdd
    }, y, MARGIN + halfWidth + 8, halfWidth);

    y = reY + 3;

    // ===== PUPILLARY DISTANCE =====
    y = drawSectionHeader(doc, 'Pupillary Distance', y);

    doc.setFillColor(...COLORS.veryLightGray);
    doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 12, 1.5, 1.5, 'F');

    doc.setFont(FONTS.body, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.darkGray);
    doc.text('IPD', MARGIN + 8, y + 1.5);

    doc.setFont(FONTS.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.black);
    const pdValue = formatValue(prescription.pd);
    doc.text(`${pdValue}${pdValue !== 'N/A' ? ' mm' : ''}`, MARGIN + 25, y + 1.5);

    y += 14;
  }

  // ===== PRODUCT LINK =====
  y = drawSectionHeader(doc, 'Product Link', y);

  doc.setFont(FONTS.body, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.black);
  doc.text(`Product: Bright Eyewear – ${formatValue(product.name)}`, MARGIN, y);
  y += 6;

  doc.setFont(FONTS.body, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.accent);
  doc.textWithLink(productUrl, MARGIN, y, { url: productUrl });
  const linkWidth = doc.getTextWidth(productUrl);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 0.8, MARGIN + linkWidth, y + 0.8);
  y += 8;

  y += 12;

  // ===== FOOTER =====
  const footerY = PAGE_HEIGHT - MARGIN - 5;
  drawDivider(doc, footerY - 5, MARGIN, CONTENT_WIDTH, COLORS.lightGray, 0.3);
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

export async function generateAndDownloadPrescriptionPDF(options) {
  try {
    const { doc, filename } = await generatePrescriptionPDF(options);
    const pdfBlob = doc.output('blob');
    saveAs(pdfBlob, filename);
    return { doc, filename };
  } catch (error) {
    console.error('Failed to generate prescription PDF:', error);
    throw new Error('Failed to generate the prescription PDF. Please try again.');
  }
}