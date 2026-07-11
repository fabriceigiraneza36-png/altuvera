// src/components/booking/EmailVerification.jsx
/**
 * EmailVerification.jsx
 * Shows a "check your email" notice after booking is submitted.
 * Handles resend with cooldown + WhatsApp fallback.
 * NO OTP codes — purely link-based.
 */
import React, {
  useState, useEffect, useRef, useCallback, memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiCheck, FiRefreshCw, FiAlertTriangle,
  FiCheckCircle, FiClock,
} from "react-icons/fi";

const RESEND_COOLDOWN = 60; // seconds

/* ── Cooldown ring SVG ─────────────────────────────────────── */
const CooldownRing = memo(({ seconds, total }) => {
  const r    = 8;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  const dash = circ * (1 - pct);

  return (
    <svg
      className="bk-email-verify__cooldown-ring"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle
        cx="10" cy="10" r={r}
        fill="none" stroke="#e5e7eb" strokeWidth="2"
      />
      <circle
        cx="10" cy="10" r={r}
        fill="none"
        stroke={seconds < 20 ? "#ef4444" : "#10b981"}
        strokeWidth="2"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 10 10)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
      />
    </svg>
  );
});
CooldownRing.displayName = "CooldownRing";

/* ── Main Component ────────────────────────────────────────── */
const EmailVerification = memo(({
  email,
  bookingId,
  onVerified,  // called if we detect verification (optional polling)
  isMobile,
}) => {
  const [state,     setState]     = useState("idle");
  // idle | sending | sent | resending | success | error
  const [cooldown,  setCooldown]  = useState(0);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [sendCount, setSendCount] = useState(0);

  const cooldownRef  = useRef(null);
  const mountedRef   = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(cooldownRef.current);
    };
  }, []);

  /* ── Start cooldown timer ── */
  const startCooldown = useCallback((secs = RESEND_COOLDOWN) => {
    setCooldown(secs);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ── Send / Resend ── */
  const handleResend = useCallback(async () => {
    if (!bookingId || cooldown > 0) return;

    const isFirst = state === "idle";
    setState(isFirst ? "sending" : "resending");
    setErrorMsg("");

    try {
      const res  = await fetch(
        `/api/bookings/${bookingId}/resend-verification`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json().catch(() => ({}));

      if (!mountedRef.current) return;

      if (!res.ok) {
        const msg =
          (typeof data.error === "string" ? data.error : null) ||
          (data.message && typeof data.message === "string" ? data.message : null) ||
          "Failed to send email. Please try again.";
        setErrorMsg(msg);
        setState(sendCount > 0 ? "sent" : "idle");
        return;
      }

      setState("sent");
      setSendCount((c) => c + 1);
      startCooldown(RESEND_COOLDOWN);

    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMsg("Network error — please check your connection.");
      setState(sendCount > 0 ? "sent" : "idle");
    }
  }, [bookingId, cooldown, state, sendCount, startCooldown]);

  /* ── Verified state (triggered externally if needed) ── */
  const handleVerifiedExternally = useCallback(() => {
    setState("success");
    onVerified?.();
  }, [onVerified]);

  /* ── Render: success ── */
  if (state === "success") {
    return (
      <div className="bk-email-verify bk-email-verify--success">
        <div className="bk-email-verify__success-content">
          <div className="bk-email-verify__success-icon">
            <FiCheckCircle size={22} />
          </div>
          <div>
            <p className="bk-email-verify__success-title">
              Email verified! ✓
            </p>
            <p className="bk-email-verify__success-sub">
              Your booking is now confirmed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: idle (not yet sent) ── */
  if (state === "idle") {
    return (
      <div className="bk-email-verify">
        <div className="bk-email-verify__inner">
          <div className="bk-email-verify__header">
            <div className="bk-email-verify__icon">
              <FiMail size={18} />
            </div>
            <div>
              <p className="bk-email-verify__title">Email verification required</p>
              <p className="bk-email-verify__sub">
                We'll send a confirmation link after you submit.
              </p>
            </div>
          </div>

          <div className="bk-email-verify__email-chip">
            <FiMail size={12} />
            <span>{email}</span>
          </div>

          <p style={{
            margin: "0 0 12px",
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.6,
          }}>
            After submitting your booking, check your inbox for a{" "}
            <strong style={{ color: "#059669" }}>verification link</strong>.
            Clicking it confirms your booking and notifies our team.
          </p>

          <div
            className="bk-info-box bk-info-box--blue"
            style={{ fontSize: 12.5 }}
          >
            <FiClock size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              No code to enter — just click the link in your email.
              Check your spam folder if you don't see it.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: sending (first time) ── */
  if (state === "sending") {
    return (
      <div className="bk-email-verify">
        <div className="bk-email-verify__inner">
          <div className="bk-email-verify__header">
            <div className="bk-email-verify__icon">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw size={18} />
              </motion.div>
            </div>
            <div>
              <p className="bk-email-verify__title">Sending verification link…</p>
              <p className="bk-email-verify__sub">
                Preparing your email, one moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: sent / resending ── */
  return (
    <div className="bk-email-verify">
      <div className="bk-email-verify__inner">

        {/* Header */}
        <div className="bk-email-verify__header">
          <div className="bk-email-verify__icon">
            {state === "resending" ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw size={18} />
              </motion.div>
            ) : (
              <FiMail size={18} />
            )}
          </div>
          <div>
            <p className="bk-email-verify__title">
              {state === "resending"
                ? "Resending link…"
                : sendCount > 1
                ? "Link resent!"
                : "Verification link sent!"}
            </p>
            <p className="bk-email-verify__sub">
              Check your inbox and spam folder.
            </p>
          </div>
        </div>

        {/* Email chip */}
        <div className="bk-email-verify__email-chip">
          <FiMail size={12} />
          <span>{email}</span>
        </div>

        {/* Sent message */}
        <div className="bk-email-verify__sent-msg">
          <span className="bk-email-verify__sent-icon">📧</span>
          <span>
            We've sent a <strong>confirmation link</strong> to your email.
            Click it to verify your address and confirm your booking with our team.
            The link expires in <strong>24 hours</strong>.
          </span>
        </div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bk-info-box bk-info-box--red"
              style={{ marginBottom: 12 }}
              role="alert"
            >
              <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions row */}
        <div className="bk-email-verify__actions">
          {/* Resend button / cooldown */}
          {cooldown > 0 ? (
            <div className="bk-email-verify__cooldown">
              <CooldownRing seconds={cooldown} total={RESEND_COOLDOWN} />
              <span>Resend in {cooldown}s</span>
            </div>
          ) : (
            <button
              type="button"
              className="bk-email-verify__resend-btn"
              onClick={handleResend}
              disabled={state === "resending" || !bookingId}
              aria-label="Resend verification email"
            >
              {state === "resending" ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block" }}
                  >
                    <FiRefreshCw size={13} />
                  </motion.span>
                  Resending…
                </>
              ) : (
                <>
                  <FiRefreshCw size={13} />
                  {sendCount > 1 ? "Resend Again" : "Resend Link"}
                </>
              )}
            </button>
          )}

          {/* WhatsApp fallback */}
          <a
            href="https://wa.me/250785751391"
            target="_blank"
            rel="noopener noreferrer"
            className="bk-email-verify__wa-link"
            aria-label="Contact via WhatsApp"
          >
            💬 WhatsApp help
          </a>
        </div>

        {/* Spam hint */}
        <p style={{
          margin: "12px 0 0",
          fontSize: 11.5,
          color: "#9ca3af",
          lineHeight: 1.5,
        }}>
          💡 Not in inbox? Check your spam / junk folder. Mark us as safe
          to ensure future emails arrive.
        </p>
      </div>
    </div>
  );
});

EmailVerification.displayName = "EmailVerification";
export default EmailVerification;