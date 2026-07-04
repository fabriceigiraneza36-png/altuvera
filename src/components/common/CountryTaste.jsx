import React from 'react';
import './CountryTaste.css';

const CountryTaste = ({ items = [] }) => {
  if (!items || !items.length) return null;
  // Spread items into alternating cards to avoid empty gaps
  return (
    <section className="ct-section">
      <h3 className="ct-title">Taste & Traditions</h3>
      <div className="ct-grid">
        {items.map((it, i) => (
          <article key={i} className={`ct-card ct-card--${i % 3}`}> 
            <h4>{it.title || it.name}</h4>
            <p>{it.summary || it.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CountryTaste;
