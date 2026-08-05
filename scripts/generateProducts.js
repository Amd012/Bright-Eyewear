/**
 * Product Catalog Automation Script
 * Scans Eyeglasses and Sunglasses folders, extracts product info from folder names,
 * imports all images, and generates products.json data.
 * Run: node scripts/generateProducts.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = { eyeglasses: path.join(ROOT, 'Eyeglasses'), sunglasses: path.join(ROOT, 'Sunglasses') };
const OUT = path.join(ROOT, 'data', 'products.json');

const LENS_OPTIONS = {
  singleVision: [
    { id: 'hmc', name: 'Hard Multi Coated (HMC)', price: 599, tooltip: 'Scratch-resistant Hard Multi Coating for better durability and clearer vision.' },
    { id: 'blue-block', name: 'Blue Block Lens', price: 799, tooltip: 'Protects eyes from harmful blue light emitted from digital screens.' },
    { id: 'photo-grey-blue-block', name: 'Photo Grey Blue Block Lens', price: 1599, tooltip: 'Automatically darkens outdoors while providing blue light protection indoors.' }
  ],
  bifocal: [
    { id: 'bifocal-hard-coat', name: 'Hard Coat', price: 699, tooltip: 'Provides separate zones for distance and near vision.' },
    { id: 'bifocal-blue-block', name: 'Blue Block', price: 1299, tooltip: 'Bifocal lens with integrated blue light protection.' },
    { id: 'bifocal-photo-grey-hard-coat', name: 'Photo Grey Hard Coat', price: 999, tooltip: 'Photochromic bifocal lens with durable hard coating.' },
    { id: 'bifocal-photo-grey-blue-block', name: 'Photo Grey Blue Block', price: 1799, tooltip: 'Photochromic bifocal lens with blue light protection.' }
  ],
  progressive: [
    { id: 'progressive-hmc', name: 'Hard Multi Coat Progressive', price: 1800, tooltip: 'Seamless progressive vision with premium hard multi coating.' },
    { id: 'progressive-blue-block', name: 'Blue Block Progressive', price: 2500, tooltip: 'Progressive lens with blue light protection.' },
    { id: 'progressive-photo-grey-hmc', name: 'Photo Grey Hard Multi Coat Progressive', price: 2800, tooltip: 'Premium photochromic progressive lens with hard multi coating.' },
    { id: 'progressive-photo-grey-blue-block', name: 'Photo Grey Blue Block Progressive', price: 3500, tooltip: 'Premium progressive lens with photochromic technology and blue light protection.' }
  ]
};

const DESC = {
  eyeglasses: [
    n => `A stylish full-rim frame designed for everyday comfort and long-lasting durability. Perfect for office, study, and casual wear with a lightweight modern design.`,
    n => `Premium ${n} eyeglasses featuring a contemporary silhouette that blends sophistication with everyday practicality. Ideal for daily wear and professional settings.`,
    n => `Crafted with precision, this ${n} frame offers a refined look with exceptional comfort. A versatile choice for work, study, and leisure.`,
    n => `Modern ${n} eyeglasses with a sleek profile and premium finish. Designed for all-day wear with a comfortable, secure fit.`,
    n => `Elegant ${n} frame combining classic aesthetics with modern engineering. Perfect for those who value both style and function.`,
    n => `Lightweight and durable, this ${n} eyeglass frame delivers clear vision with a sophisticated appearance. Great for everyday use.`
  ],
  sunglasses: [
    n => `Premium ${n} sunglasses offering excellent UV protection with a sleek contemporary frame that complements both casual and formal outfits.`,
    n => `Stylish ${n} sunglasses with high-quality lenses and a durable frame. Perfect for outdoor activities, driving, and everyday fashion.`,
    n => `Fashion-forward ${n} sunglasses designed to elevate any look. Featuring UV-protective lenses and a comfortable, secure fit.`,
    n => `Trendsetting ${n} sunglasses with a bold frame and premium lens technology. Ideal for sunny days and stylish outings.`,
    n => `Sophisticated ${n} sunglasses crafted for those who appreciate quality and style. UV protection meets timeless design.`,
    n => `Modern ${n} sunglasses with a sleek frame and superior lens clarity. A must-have accessory for any wardrobe.`
  ]
};

function detectShape(n) {
  const l = n.toLowerCase();
  if (l.includes('round') || l.includes('circle')) return 'Round';
  if (l.includes('aviator') || l.includes('pilot')) return 'Aviator';
  if (l.includes('cat')) return 'Cat Eye';
  if (l.includes('square')) return 'Square';
  if (l.includes('wayfarer')) return 'Wayfarer';
  if (l.includes('clubmaster')) return 'Clubmaster';
  if (l.includes('shield') || l.includes('sport') || l.includes('wrap')) return 'Sport Wrap';
  if (l.includes('geometric') || l.includes('hexagon')) return 'Geometric';
  if (l.includes('panto')) return 'Panto';
  if (l.includes('browline')) return 'Browline';
  if (l.includes('rimless')) return 'Rimless';
  if (l.includes('oversized')) return 'Oversized';
  if (l.includes('navigator')) return 'Navigator';
  return 'Rectangular';
}

function detectStyle(n) {
  const l = n.toLowerCase();
  if (l.includes('classic') || l.includes('timeless') || l.includes('retro') || l.includes('vintage')) return 'Classic';
  if (l.includes('sport') || l.includes('wrap') || l.includes('cyclist') || l.includes('shield')) return 'Sport';
  if (l.includes('fashion') || l.includes('trend') || l.includes('chic')) return 'Fashion';
  if (l.includes('premium') || l.includes('gentleman')) return 'Premium';
  if (l.includes('minimal') || l.includes('rimless')) return 'Minimalist';
  return 'Modern';
}

function detectColor(n) {
  const l = n.toLowerCase();
  if (l.includes('gold')) return 'Gold';
  if (l.includes('silver')) return 'Silver';
  if (l.includes('rose')) return 'Rose Gold';
  if (l.includes('tortoise') || l.includes('havana')) return 'Tortoise Shell';
  if (l.includes('blue')) return 'Blue';
  if (l.includes('green')) return 'Green';
  if (l.includes('brown')) return 'Brown';
  if (l.includes('navy')) return 'Navy Blue';
  if (l.includes('clear') || l.includes('transparent')) return 'Clear';
  if (l.includes('gunmetal')) return 'Gunmetal';
  if (l.includes('red')) return 'Red';
  return 'Black';
}

function detectOccasion(n, style) {
  const l = n.toLowerCase();
  if (style === 'Sport') return 'Outdoor';
  if (style === 'Classic') return 'Office';
  if (style === 'Fashion') return 'Fashion';
  if (l.includes('driving') || l.includes('pilot') || l.includes('aviator')) return 'Driving';
  return 'Daily Wear';
}

function faceShapesFor(shape) {
  if (shape === 'Round') return 'Oval, Square, Heart';
  if (shape === 'Aviator') return 'Oval, Square, Heart';
  if (shape === 'Cat Eye') return 'Oval, Round, Heart';
  if (shape === 'Square') return 'Oval, Round, Heart';
  if (shape === 'Wayfarer') return 'Oval, Round, Square';
  if (shape === 'Sport Wrap') return 'Oval, Round, Square';
  if (shape === 'Oversized') return 'Oval, Round, Heart';
  return 'Oval, Round';
}

function buildSpecs(name, category, polarized) {
  const shape = detectShape(name);
  const style = detectStyle(name);
  const color = detectColor(name);
  const occasion = detectOccasion(name, style);
  const specs = [
    { label: 'Frame Shape', value: shape },
    { label: 'Frame Type', value: name.toLowerCase().includes('rimless') ? 'Rimless' : name.toLowerCase().includes('semi') || name.toLowerCase().includes('half') ? 'Half Rim' : 'Full Rim' },
    { label: 'Frame Style', value: style },
    { label: 'Suitable Face Shapes', value: faceShapesFor(shape) },
    { label: 'Frame Size', value: 'Medium' },
    { label: 'Weight', value: 'Lightweight' },
    { label: 'Prescription Compatible', value: 'Yes' },
    { label: 'Blue Cut Compatible', value: 'Yes' }
  ];
  if (category === 'sunglasses') {
    specs.push({ label: 'UV Protection', value: 'UV400' });
    if (polarized) specs.push({ label: 'Polarized', value: 'Yes' });
  }
  specs.push({ label: 'Color', value: color });
  specs.push({ label: 'Occasion', value: occasion });
  return specs;
}

function buildHighlights(name, category, polarized) {
  const shape = detectShape(name).toLowerCase();
  const h = [
    `✨ Premium ${shape} ${category} design`,
    '🛡️ 2-year manufacturer warranty',
    '🚚 Free shipping over ₹10,000',
    '↩️ 30-day hassle-free returns'
  ];
  if (category === 'sunglasses') {
    h.push('☀️ UV400 protection for complete sun safety');
    if (polarized) h.push('🕶️ Polarized lenses reduce glare for clearer vision');
  } else {
    h.push('👓 Compatible with prescription lenses');
    h.push('💙 Blue light filter option available');
  }
  return h;
}

function parseFolder(folderName) {
  const m = folderName.match(/^(.+?)\s*\(?\s*rs\s*(\d+)\s*\)?$/i);
  if (!m) return { name: folderName.trim(), price: null };
  let name = m[1].trim();
  // Fix spelling mistakes
  name = name.replace(/porlarized/gi, 'Polarized');
  name = name.replace(/polarized/gi, 'Polarized');
  name = name.replace(/polarised/gi, 'Polarized');
  name = name.replace(/bluecut/gi, 'Blue Cut');
  return { name, price: parseInt(m[2], 10) };
}

function scan(dir, category) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const folders = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  folders.forEach((folder, i) => {
    const fp = path.join(dir, folder);
    const { name, price } = parseFolder(folder);
    const imgs = fs.readdirSync(fp).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).sort();
    if (!imgs.length) return;
    const images = imgs.map(f => `/${path.join(category, folder, f).replace(/\\/g, '/')}`);
    const polarized = /polarized|polarised|porlarized/i.test(folder);
    const templates = DESC[category] || DESC.eyeglasses;
    const desc = templates[i % templates.length](name);
    out.push({
      id: 0, name, category, price: price || 999, oldPrice: null, tag: null,
      description: desc, images, image: images[0],
      highlights: buildHighlights(name, category, polarized),
      lensOptions: LENS_OPTIONS,
      rating: null, reviews: null, inStock: true,
      gender: null, frameMaterial: null, stockStatus: null
    });
    console.log(`✓ ${name} (₹${price || 999}) - ${images.length} img`);
  });
  return out;
}

const all = [...scan(DIRS.eyeglasses, 'eyeglasses'), ...scan(DIRS.sunglasses, 'sunglasses')];
all.forEach((p, i) => p.id = i + 1);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(all, null, 2), 'utf8');
console.log(`\n✅ ${all.length} products → ${OUT}`);