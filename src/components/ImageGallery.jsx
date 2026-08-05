import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Responsive Image Gallery with:
 * - Previous/Next buttons
 * - Mobile swipe support
 * - Thumbnail navigation
 * - Autoplay after 3-4 seconds of inactivity
 * - Pause autoplay during interaction
 * - Smooth animations
 * - Lazy loading
 * - Zoom support
 * - Responsive layout
 */
export default function ImageGallery({ images, alt = 'Product image' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const autoplayTimer = useRef(null);
  const galleryRef = useRef(null);

  const totalImages = images?.length || 0;

  // Autoplay: advance every 3.5 seconds when not paused and not zoomed
  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    if (totalImages <= 1 || isPaused || isZoomed) return;
    autoplayTimer.current = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % totalImages);
    }, 3500);
  }, [totalImages, isPaused, isZoomed]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    };
  }, [currentIndex, startAutoplay]);

  // Reset index if images change
  useEffect(() => {
    setCurrentIndex(0);
    setIsZoomed(false);
  }, [images]);

  const goTo = useCallback((index) => {
    if (totalImages === 0) return;
    setCurrentIndex(((index % totalImages) + totalImages) % totalImages);
    setIsPaused(true);
    // Resume autoplay after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  }, [totalImages]);

  const next = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex]);
  const prev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger swipe for horizontal movement
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setTimeout(() => setIsPaused(false), 5000);
  };

  // Zoom support
  const handleMouseMove = (e) => {
    if (!isZoomed || !galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(prev => !prev);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') setIsZoomed(false);
  };

  if (totalImages === 0) return null;

  // Single image - display normally
  if (totalImages === 1) {
    return (
      <div
        className={`product-gallery${isZoomed ? ' zoomed' : ''}`}
        ref={galleryRef}
        onMouseMove={handleMouseMove}
        onClick={toggleZoom}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Zoom product image"
      >
        <img
          src={images[0]}
          alt={alt}
          loading="lazy"
          style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2)' } : undefined}
        />
        {isZoomed && <span className="gallery-zoom-hint">Click to zoom out</span>}
      </div>
    );
  }

  // Multiple images - display slider
  return (
    <div className="product-gallery-slider" onKeyDown={handleKeyDown}>
      <div
        className={`product-gallery${isZoomed ? ' zoomed' : ''}`}
        ref={galleryRef}
        onMouseMove={handleMouseMove}
        onClick={toggleZoom}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="button"
        aria-label="Product image gallery"
      >
        <img
          src={images[currentIndex]}
          alt={`${alt} - view ${currentIndex + 1}`}
          loading="lazy"
          style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: 'scale(2)' } : undefined}
        />

        {/* Navigation arrows */}
        <button
          className="gallery-nav gallery-prev"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button
          className="gallery-nav gallery-next"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next image"
        >
          ›
        </button>

        {/* Image counter */}
        <span className="gallery-counter">{currentIndex + 1} / {totalImages}</span>

        {isZoomed && <span className="gallery-zoom-hint">Click to zoom out</span>}
      </div>

      {/* Thumbnails */}
      <div className="gallery-thumbnails" role="tablist" aria-label="Image thumbnails">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`gallery-thumb${idx === currentIndex ? ' active' : ''}`}
            onClick={() => goTo(idx)}
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`View image ${idx + 1}`}
          >
            <img src={img} alt={`${alt} thumbnail ${idx + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}