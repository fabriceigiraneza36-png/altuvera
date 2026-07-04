// src/pages/Booking/components/GlassCard.jsx
import React from "react";

const GlassCard = ({ children, glow = false, style = {}, className = "" }) => (
  <div
    className={`bk-glass ${glow ? "bk-glass--glow" : ""} ${className}`}
    style={style}
  >
    {children}
  </div>
);

export default GlassCard;