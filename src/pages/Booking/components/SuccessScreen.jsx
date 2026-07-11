// src/pages/Booking/components/SuccessScreen.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail, Phone, Map, Package,
  ArrowRight, Home, CheckCircle2, Copy, Check,
} from "lucide-react";
import { useState } from "react";

const NEXT_STEPS = [
  {
    icon: <Mail size={17} />,
    title: "Check your email",
    desc:  "A confirmation link has been sent to your inbox.",
    color: "#3b82f6",
    bg:    "#eff6ff",
    border:"#bfdbfe",
  },
  {
    icon: <Phone size={17} />,
    title: "Expert contact",
    desc:  "Our travel specialist will reach out within 24 hours.",
    color: "#059669",
    bg:    "#f0fdf4",
    border:"#a7f3d0",
  },
  {
    icon: <Map size={17} />,
    title: "Custom itinerary",
    desc:  "We'll craft your personalised adventure plan.",
    color: "#7c3aed",
    bg:    "#f5f3ff",
    border:"#ddd6fe",
  },
  {
    icon: <Package size={17} />,
    title: "Pack your bags!",
    desc:  "Your unforgettable African adventure awaits.",
    color: "#d97706",
    bg:    "#fffbeb",
    border:"#fde68a",
  },
];

const SuccessScreen = ({ isMobile, displayName, submissionRef }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!submissionRef) return;
    navigator.clipboard.writeText(`#${submissionRef}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ textAlign: "center" }}>

      {/* ── Animated checkmark ── */}
      <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 28px" }}>
        {/* Pulse rings */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{
              duration: 2, repeat: Infinity,
              delay: i * 0.7, ease: "easeOut",
            }}
            style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(16,185,129,.4)",
            }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          style={{
            width: 96, height: 96, borderRadius: "50%",
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 12px 36px rgba(5,150,105,.38)",
            position: "relative", zIndex: 1,
          }}
        >
          <CheckCircle2 size={46} color="#fff" strokeWidth={1.8} />
        </motion.div>
      </div>

      {/* ── Title ── */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: isMobile ? 26 : 34,
          fontWeight: 900, color: "#0f172a",
          margin: "0 0 10px", letterSpacing: "-0.02em",
        }}
      >
        {displayName ? `Amazing, ${displayName}! 🎉` : "Booking Submitted! 🎉"}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        style={{
          fontSize: isMobile ? 14.5 : 16, color: "#6b7280",
          lineHeight: 1.7, maxWidth: 480, margin: "0 auto 28px",
        }}
      >
        Your adventure request has been received. Our travel experts will
        contact you within{" "}
        <strong style={{ color: "#059669" }}>24 hours</strong>{" "}
        to finalise your perfect itinerary.
      </motion.p>

      {/* ── Booking reference ── */}
      {submissionRef && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 28 }}
        >
          <p style={{
            margin: "0 0 8px", fontSize: 11.5, fontWeight: 700,
            color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".1em",
          }}>
            Booking Reference
          </p>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 22px",
              background: copied ? "#f0fdf4" : "#fff",
              border: `2px solid ${copied ? "#6ee7b7" : "#e5e7eb"}`,
              borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s",
            }}
          >
            <span style={{
              fontSize: 16, fontWeight: 900,
              color: "#059669", letterSpacing: ".08em", fontFamily: "monospace",
            }}>
              #{submissionRef}
            </span>
            {copied ? (
              <Check size={16} color="#059669" />
            ) : (
              <Copy size={16} color="#9ca3af" />
            )}
          </button>
          {copied && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#059669", fontWeight: 600 }}>
              ✓ Copied to clipboard
            </p>
          )}
        </motion.div>
      )}

      {/* ── What happens next ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        style={{
          background: "#fff",
          border: "1.5px solid #f0fdf4",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 28,
          boxShadow: "0 4px 20px rgba(5,150,105,.08)",
          textAlign: "left",
        }}
      >
        <div style={{
          padding: "14px 22px",
          background: "linear-gradient(to right,#f0fdf4,#fff)",
          borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle2 size={15} color="#059669" />
          <span style={{
            fontSize: 12.5, fontWeight: 700, color: "#374151",
            textTransform: "uppercase", letterSpacing: ".07em",
          }}>
            What Happens Next
          </span>
        </div>
        <div style={{ padding: "6px 0" }}>
          {NEXT_STEPS.map(({ icon, title, desc, color, bg, border }, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 22px",
                borderBottom: i < NEXT_STEPS.length - 1
                  ? "1px solid #f9fafb" : "none",
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: bg, border: `1.5px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color,
              }}>
                {icon}
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#111827" }}>
                  {title}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── CTAs ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        style={{
          display: "flex", gap: 12,
          justifyContent: "center", flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <Link
          to="/destinations"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px",
            background: "linear-gradient(135deg,#059669,#10b981)",
            color: "#fff", borderRadius: 50,
            fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 18px rgba(5,150,105,.3)",
            transition: "all .2s",
          }}
        >
          <Map size={16} />
          Explore More Destinations
          <ArrowRight size={15} />
        </Link>

        <a
          href="https://wa.me/250785751391"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px",
            background: "#25D366", color: "#fff", borderRadius: 50,
            fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(37,211,102,.3)",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat on WhatsApp
        </a>

        <Link
          to="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 24px",
            background: "#f9fafb", color: "#374151",
            border: "1.5px solid #e5e7eb",
            borderRadius: 50, fontSize: 14, fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <Home size={16} />
          Back to Home
        </Link>
      </motion.div>

      <p style={{ margin: 0, fontSize: 12.5, color: "#9ca3af" }}>
        Need immediate help?{" "}
        <a
          href="https://wa.me/250785751391"
          target="_blank" rel="noopener noreferrer"
          style={{ color: "#059669", fontWeight: 700, textDecoration: "none" }}
        >
          Chat with us on WhatsApp
        </a>
      </p>
    </div>
  );
};

export default SuccessScreen;