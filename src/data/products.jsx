import productsData from '../../data/products.json';
import testimonialsData from '../../data/testimonials.json';

export const products = productsData;
export const testimonials = testimonialsData;

export const categories = [
  { id: 'all', name: 'All Eyewear', icon: '👓', description: 'Browse the complete collection', color: 'cat-all' },
  { id: 'eyeglasses', name: 'Eyeglasses', icon: '👓', description: 'Prescription eyewear for every style — classic, modern, vintage & sport', color: 'cat-eyeglasses' },
  { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️', description: 'Stylish sun protection for every look', color: 'cat-sunglasses' }
];

export const CATEGORY_META = {
  all: { title: 'All Eyewear', description: 'Browse our complete collection of premium handcrafted eyewear — from timeless classics to modern sport styles.' },
  eyeglasses: { title: 'Eyeglasses', description: 'Premium prescription eyewear for every style — from timeless classics to modern sport designs.' },
  sunglasses: { title: 'Sunglasses', description: 'Stylish and protective sunglasses for men and women. Find the perfect pair for any occasion.' }
};

export function getProductById(id) {
  return products.find(p => p.id === Number(id));
}

export function formatPrice(price) {
  return `₹${price}`;
}

export function getDiscountPercent(price, oldPrice) {
  if (!oldPrice) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function ProductImage({ product, className = 'product-image' }) {
  return (
    <img
      src={product.image}
      alt={product.name}
      className={className}
      loading="lazy"
    />
  );
}

// ===== Lens Options =====
export const LENS_OPTIONS = {
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

// ===== Lens Selection Helpers =====
export function getLensPrice(lensId) {
  for (const category of Object.values(LENS_OPTIONS)) {
    const lens = category.find(l => l.id === lensId);
    if (lens) return lens.price;
  }
  return 0;
}

export function getLensInfo(lensId) {
  for (const category of Object.values(LENS_OPTIONS)) {
    const lens = category.find(l => l.id === lensId);
    if (lens) return lens;
  }
  return null;
}

export function getLensCategory(lensId) {
  for (const [cat, lenses] of Object.entries(LENS_OPTIONS)) {
    if (lenses.some(l => l.id === lensId)) return cat;
  }
  return null;
}

export function getLensCategoryLabel(cat) {
  const labels = {
    singleVision: 'Single Vision Lenses',
    bifocal: 'Bifocal Lenses',
    progressive: 'Progressive Lenses'
  };
  return labels[cat] || cat;
}

export function getFinalPrice(framePrice, lensId) {
  const lensPrice = getLensPrice(lensId);
  return framePrice + lensPrice;
}