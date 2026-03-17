import React, { useState, useEffect } from 'react';
import './CountrySlideshow.css';

const CountrySlideshow = ({ images = [], alt = '' }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!images?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images]);

  if (!images?.length) return null;

  return (
    <div className="cs-slideshow">
      {images.map((img, i) => (
        <img
          key={i}
          src={img.url || img.src || img}
          alt={img.alt || alt}
          className={`cs-slide ${i === idx ? 'cs-active' : ''}`}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/altuvera.png'; }}
        />
      ))}
      <div className="cs-controls">
        {images.map((_, i) => (
          <button
            key={i}
            className={`cs-dot ${i === idx ? 'active' : ''}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CountrySlideshow;
