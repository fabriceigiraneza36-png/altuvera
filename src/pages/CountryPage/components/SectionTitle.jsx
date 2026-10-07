// src/pages/CountryPage/components/SectionTitle.jsx
import React from "react";

export default function SectionTitle({ icon, label, children, sub, center, dark }) {
  return (
    <header className={`cpx-shdr ${center ? "cpx-shdr--center" : ""} ${dark ? "cpx-shdr--dark" : ""}`}>
      <h2 className="cpx-shdr__h2">{children}</h2>
      {sub && <p className="cpx-shdr__sub">{sub}</p>}
    </header>
  );
}