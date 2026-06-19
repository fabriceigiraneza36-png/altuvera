// src/pages/CountryPage/components/ScrollProgress.jsx
import React, { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="cpx-progress">
      <div className="cpx-progress__fill" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}