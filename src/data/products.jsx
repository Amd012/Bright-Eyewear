import productsData from '../../data/products.json';
import testimonialsData from '../../data/testimonials.json';

export const products = productsData;
export const testimonials = testimonialsData;

export const categories = [
  { id: 'all', name: 'All Eyewear', icon: '👓', description: 'Browse the complete collection', color: 'cat-all' },
  { id: 'classic', name: 'Classic', icon: '🕶️', description: 'Timeless designs that never go out of style', color: 'cat-classic' },
  { id: 'modern', name: 'Modern', icon: '✨', description: 'Sleek, contemporary frames for today', color: 'cat-modern' },
  { id: 'vintage', name: 'Vintage', icon: '🎭', description: 'Retro-inspired frames with a nostalgic touch', color: 'cat-vintage' },
  { id: 'sport', name: 'Sport', icon: '🏃', description: 'High-performance eyewear for active lifestyles', color: 'cat-sport' },
  { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️', description: 'Stylish sun protection for every look', color: 'cat-sunglasses' }
];

export const CATEGORY_META = {
  all: { title: 'All Eyewear', description: 'Browse our complete collection of premium handcrafted eyewear — from timeless classics to modern sport styles.' },
  classic: { title: 'Classic Eyewear', description: 'Timeless designs that never go out of style. Explore our classic collection of premium handcrafted eyewear.' },
  modern: { title: 'Modern Eyewear', description: "Sleek, contemporary frames for today's style-conscious individual." },
  vintage: { title: 'Vintage Eyewear', description: 'Retro-inspired frames with a nostalgic touch — perfect for those who love timeless character.' },
  sport: { title: 'Sport Eyewear', description: 'High-performance eyewear built for active lifestyles and demanding environments.' },
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