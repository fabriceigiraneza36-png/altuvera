import React from "react";
import { HiAdjustments } from "react-icons/hi";
import { openCookieSettings } from "../../utils/cookiePreferences";

export default function CookieSettingsButton({ align = "right" }) {
  const wrapperStyle = {
    display: "flex",
    justifyContent: align === "left" ? "flex-start" : "flex-end",
    marginBottom: "14px",
  };

  const buttonStyle = {
    border: "1px solid rgba(5, 150, 105, 0.28)",
    background:
      "linear-gradient(130deg, rgba(255,255,255,0.95) 0%, rgba(236,253,245,0.95) 100%)",
    color: "#065f46",
    borderRadius: "999px",
    height: "38px",
    padding: "0 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    transition: "all 0.22s ease",
  };

  return (
    <div style={wrapperStyle}>
      <button
        type="button"
        style={buttonStyle}
        onClick={openCookieSettings}
        onMouseOver={(event) => {
          event.currentTarget.style.transform = "translateY(-1px)";
          event.currentTarget.style.boxShadow = "0 14px 28px rgba(5, 150, 105, 0.14)";
        }}
        onMouseOut={(event) => {
          event.currentTarget.style.transform = "translateY(0)";
          event.currentTarget.style.boxShadow = "0 10px 24px rgba(15, 23, 42, 0.08)";
        }}
      >
        <HiAdjustments size={15} />
        Cookie Settings
      </button>
    </div>
  );
}

