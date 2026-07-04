// src/pages/BookingVerifyResult.jsx
// Route: /booking/verify?status=success&ref=BK-XXXX
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiRefreshCw, FiHome, FiMessageCircle } from "react-icons/fi";
import PageHeader  from "../components/common/PageHeader";
import GlobalStyles from "./Booking/GlobalStyles";

const HERO =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80";

const STATES = {
  success: {
    icon: "🎉", bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    border: "#6ee7b7", color: "#065f46",
    title: "Email Verified!",
    sub:   "Your booking is confirmed. Our team will contact you within 24 hours.",
  },
  already_verified: {
    icon: "✅", bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
    border: "#6ee7b7", color: "#065f46",
    title: "Already Verified",
    sub:   "Your email was already confirmed. Your booking is active.",
  },
  expired: {
    icon: "⏰", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    border: "#fde68a", color: "#92400e",
    title: "Link Expired",
    sub:   "Your verification link has expired (valid for 24 hours). Request a new one below.",
  },
  invalid: {
    icon: "❌", bg: "linear-gradient(135deg,#fef2f2,#fee2e2)",
    border: "#fecaca", color: "#991b1b",
    title: "Invalid Link",
    sub:   "This link is not valid. Please request a new verification email.",
  },
  error: {
    icon: "⚠️", bg: "linear-gradient(135deg,#fef2f2,#fee2e2)",
    border: "#fecaca", color: "#991b1b",
    title: "Something Went Wrong",
    sub:   "We couldn't verify your email. Please try again or contact us via WhatsApp.",
  },
};

/* ── Resend button for expired links ── */
const ResendButton = ({ bookingId }) => {
  const [state,   setState]   = useState("idle");
  const [error,   setError]   = useState("");

  const handle = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const res  = await fetch(
        `/api/bookings/${bookingId}/resend-verification`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to resend. Please try again."
        );
        setState("idle");
      } else {
        setState("sent");
      }
    } catch {
      setError("Network error. Please check your connection.");
      setState("idle");
    }
  }, [bookingId]);

  if (state === "sent") {
    return (
      <div style={{
        background: "#f0fdf4", border: "1.5px solid #a7f3d0",
        borderRadius: 12, padding: "12px 20px",
        color: "#059669", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        ✅ New link sent — check your inbox!
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p style={{
          color: "#dc2626", fontSize: 13,
          marginBottom: 8, fontWeight: 600,
        }}>
          ⚠️ {error}
        </p>
      )}
      <button
        onClick={handle}
        disabled={state === "loading"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,#10b981,#059669)",
          color: "#fff", border: "none",
          borderRadius: 50, padding: "12px 24px",
          fontSize: 14, fontWeight: 700,
          cursor: state === "loading" ? "not-allowed" : "pointer",
          opacity: state === "loading" ? 0.7 : 1,
          fontFamily: "inherit",
          boxShadow: "0 4px 16px rgba(5,150,105,.25)",
        }}
      >
        {state === "loading" ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block" }}
            >
              <FiRefreshCw size={15} />
            </motion.span>
            Sending…
          </>
        ) : (
          <>📧 Resend Verification Email</>
        )}
      </button>
    </div>
  );
};

/* ── Main ── */
const BookingVerifyResult = () => {
  const [params]  = useSearchParams();
  const status    = params.get("status") || "error";
  const ref       = params.get("ref");
  const bookingId = params.get("id");

  const cfg       = STATES[status] || STATES.error;
  const isSuccess = status === "success" || status === "already_verified";
  const isExpired = status === "expired";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <GlobalStyles />
      <PageHeader
        title={isSuccess ? "Booking Confirmed! 🎉" : "Verification Status"}
        backgroundImage={HERO}
        breadcrumbs={[
          { label: "Booking", href: "/booking" },
          { label: "Verification" },
        ]}
        height="300px"
      />

      <section style={{
        padding: "60px 20px 100px",
        background: "#f0fdf4",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bk-verify-card"
        >
          {/* Icon */}
          <div
            className="bk-verify-icon"
            style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}
          >
            {cfg.icon}
          </div>

          {/* Title */}
          <h1 style={{
            margin: "0 0 12px",
            fontSize: 26, fontWeight: 900,
            color: cfg.color,
            fontFamily: "'Playfair Display', serif",
          }}>
            {cfg.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            margin: "0 0 24px", color: "#4b5563",
            fontSize: 15, lineHeight: 1.7,
          }}>
            {cfg.sub}
          </p>

          {/* Booking ref */}
          {ref && isSuccess && (
            <div style={{ marginBottom: 24 }}>
              <p style={{
                margin: "0 0 6px", fontSize: 11,
                color: "#9ca3af", fontWeight: 700,
                letterSpacing: "1.5px", textTransform: "uppercase",
              }}>
                Booking Reference
              </p>
              <div className="bk-success-ref">{ref}</div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: "flex", gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            {isSuccess && (
              <>
                <a
                  href="https://wa.me/250788000000"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: "#25D366", color: "#fff",
                    borderRadius: 50, padding: "12px 22px",
                    fontSize: 14, fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(37,211,102,.3)",
                  }}
                >
                  <FiMessageCircle size={15} /> WhatsApp Us
                </a>
                <Link
                  to="/"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    background: "#f9fafb", color: "#374151",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 50, padding: "12px 22px",
                    fontSize: 14, fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <FiHome size={15} /> Home
                </Link>
              </>
            )}

            {isExpired && bookingId && (
              <ResendButton bookingId={bookingId} />
            )}

            {!isSuccess && (
              <Link
                to="/booking"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  color: "#fff",
                  borderRadius: 50, padding: "12px 22px",
                  fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(5,150,105,.25)",
                }}
              >
                📋 New Booking
              </Link>
            )}
          </div>

          <p style={{
            margin: "20px 0 0", fontSize: 12.5, color: "#9ca3af",
          }}>
            Need help?{" "}
            <a
              href="https://wa.me/250788000000"
              target="_blank" rel="noopener noreferrer"
              style={{ color: "#059669", fontWeight: 700 }}
            >
              Chat with our team
            </a>
          </p>
        </motion.div>
      </section>
    </>
  );
};

export default BookingVerifyResult;