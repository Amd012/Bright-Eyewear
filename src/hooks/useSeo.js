import { useEffect } from 'react';
import { getBaseUrl } from '../utils/siteConfig';

/**
 * Dynamic SEO Metadata Hook
 * 
 * Updates document title, meta description, Open Graph tags,
 * Twitter Card tags, and canonical URL for each page.
 * 
 * This ensures WhatsApp link previews show the correct product
 * image, name, price, and description when shared.
 */
export function useSeo({ title, description, image, url, type = 'website' }) {
  useEffect(() => {
    const BASE_URL = getBaseUrl();
    const canonicalUrl = url || window.location.href;
    // Ensure image URL is absolute for WhatsApp/OG preview
    const fullImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : `${BASE_URL}/eyewear.png`;

    // Document title
    document.title = title ? `${title} | Bright Eyewear` : 'Bright Eyewear — Premium Eyewear';

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || 'Premium handcrafted eyewear designed for those who refuse to compromise on style, comfort, or vision.');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Open Graph tags
    const ogTags = {
      'og:title': title || 'Bright Eyewear — Premium Eyewear',
      'og:description': description || 'Premium handcrafted eyewear designed for those who refuse to compromise on style, comfort, or vision.',
      'og:image': fullImage,
      'og:url': canonicalUrl,
      'og:type': type,
      'og:site_name': 'Bright Eyewear'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title || 'Bright Eyewear — Premium Eyewear',
      'twitter:description': description || 'Premium handcrafted eyewear designed for those who refuse to compromise on style, comfort, or vision.',
      'twitter:image': fullImage
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Cleanup: reset to defaults on unmount
    return () => {
      document.title = 'Bright Eyewear — Premium Eyewear';
    };
  }, [title, description, image, url, type]);
}