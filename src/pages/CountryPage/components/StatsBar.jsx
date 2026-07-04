// src/pages/CountryPage/components/StatsBar.jsx
import React from "react";

export default function StatsBar({ facts }) {
  const stats = facts.slice(0, 6);
  if (!stats.length) return null;
  return (
    <div className="cpx-statsbar">
      <div className="cpx-wrap">
        <div className="cpx-statsbar__inner">
          {stats.map((f, i) => (
            <div key={i} className="cpx-stat">
              <div className="cpx-stat__icon"><f.icon size={16} /></div>
              <div>
                <span className="cpx-stat__label">{f.label}</span>
                <span className="cpx-stat__val">{f.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}