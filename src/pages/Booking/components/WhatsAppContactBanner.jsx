// src/pages/Booking/components/WhatsAppContactBanner.jsx
import React from "react";

const WA_NUMBER = "+250785751391"; // Altuvera WhatsApp number
const WA_MSG = encodeURIComponent(
  "Hi Altuvera! I'm interested in booking an adventure. Can you help me?"
);

const WhatsAppContactBanner = ({ isMobile }) => (
  <div className="bk-wa-banner">
    <span style={{ fontSize: 28 }}>💬</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          fontWeight: 700,
          color: "#065f46",
        }}
      >
        Need help planning your trip?
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 12.5,
          color: "#6b7280",
          lineHeight: 1.4,
        }}
      >
        Our travel experts are available 24/7 via WhatsApp
      </p>
    </div>
    <a
      href={`https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=${WA_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: isMobile ? "9px 16px" : "10px 22px",
        background: "linear-gradient(135deg, #25d366, #128c7e)",
        color: "#fff",
        borderRadius: "50px",
        fontWeight: 700,
        fontSize: 13.5,
        textDecoration: "none",
        boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,0.3)";
      }}
    >
      <span style={{ fontSize: 18 }}>📱</span>
      Chat on WhatsApp
    </a>
  </div>
);

export default WhatsAppContactBanner;