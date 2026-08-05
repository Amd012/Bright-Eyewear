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