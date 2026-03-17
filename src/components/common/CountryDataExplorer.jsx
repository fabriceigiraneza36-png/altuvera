import React from 'react';
import './CountryDataExplorer.css';

// Innovative display: show data explorer as interactive mini-cards and a small visual sitemap
const CountryDataExplorer = ({ data = {} }) => {
  const keys = Object.keys(data || {}).filter((k) => k !== 'page' && k !== 'meta');
  if (!keys.length) return null;

  return (
    <section className="cde-section">
      <h3 className="cde-title">Explore Country Insights</h3>
      <div className="cde-layout">
        <div className="cde-cards">
          {keys.map((k) => (
            <button
              key={k}
              className="cde-card"
              onClick={() => {
                const v = data[k];
                alert(`${k}: ${Array.isArray(v) ? v.slice(0,3).join(', ') : String(v).slice(0,240)}`);
              }}
            >
              <div className="cde-key">{k.replace(/([A-Z])/g, ' $1')}</div>
              <div className="cde-preview">{Array.isArray(data[k]) ? `${data[k].slice(0,3).map(x=>x.name||x).join(', ')}${data[k].length>3?'…':''}` : String(data[k] || '').slice(0,80)}</div>
            </button>
          ))}
        </div>
        <div className="cde-visual">
          <div className="cde-map" />
          <div className="cde-legend">Interactive overview — click a card to preview</div>
        </div>
      </div>
    </section>
  );
};

export default CountryDataExplorer;
