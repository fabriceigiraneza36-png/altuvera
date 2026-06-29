// src/components/booking/EmailVerification.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiSend, FiCheckCircle, FiAlertTriangle, FiRefreshCw,
  FiCheck, FiX, FiLoader, FiClock, FiShield,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const OTP_LENGTH    = 6;
const RESEND_SECS   = 60;
const EXPIRY_SECS   = 600;

/* ── Inject styles once ───────────────────────────────────────────── */
const STYLES = `
  @keyframes ev-pulse-ring {
    0%   { transform: scale(0.95); opacity: 1; }
    100% { transform: scale(1.4);  opacity: 0; }
  }
  @keyframes ev-shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
  }
  @keyframes ev-fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ev-card {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border: 1.5px solid #a7f3d0;
    border-radius: 18px;
    padding: 20px;
    margin-top: 12px;
    animation: ev-fade-up 0.3s ease;
  }

  .ev-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
  }
  .ev-icon-wrap {
    position: relative;
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #059669, #065f46);
    display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(5,150,105,0.28);
  }
  .ev-icon-ring {
    position: absolute; inset: -4px;
    border-radius: 14px;
    border: 2px solid rgba(5,150,105,0.45);
    animation: ev-pulse-ring 1.8s ease-out infinite;
  }
  .ev-title {
    font-size: 14.5px; font-weight: 700; color: #064e3b;
    margin: 0 0 2px;
  }
  .ev-subtitle {
    font-size: 12.5px; color: #6b7280; margin: 0;
  }
  .ev-subtitle strong { color: #065f46; }

  .ev-boxes {
    display: flex; gap: 8px; justify-content: center;
    margin: 4px 0 14px;
  }
  .ev-box {
    width: 44px; height: 54px;
    border: 2px solid #d1fae5;
    border-radius: 12px;
    background: white;
    font-size: 22px; font-weight: 800;
    color: #064e3b;
    text-align: center;
    outline: none;
    transition: all 0.18s ease;
    font-family: 'Inter', -apple-system, sans-serif;
    -moz-appearance: textfield;
  }
  .ev-box::-webkit-outer-spin-button,
  .ev-box::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0;
  }
  .ev-box:focus {
    border-color: #059669;
    box-shadow: 0 0 0 4px rgba(5,150,105,0.12);
    transform: scale(1.05);
  }
  .ev-box-filled {
    background: #f0fdf4;
    border-color: #6ee7b7;
  }
  .ev-box-error {
    border-color: #f87171;
    background: #fef2f2;
    color: #dc2626;
    animation: ev-shake 0.4s ease;
  }
  .ev-box-success {
    border-color: #059669;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #065f46;
  }
  .ev-box:disabled { opacity: 0.6; cursor: not-allowed; }

  @media (max-width: 380px) {
    .ev-box { width: 38px; height: 48px; font-size: 19px; }
    .ev-boxes { gap: 6px; }
  }

  .ev-error {
    display: flex; align-items: flex-start; gap: 7px;
    padding: 10px 12px; border-radius: 10px;
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; font-size: 12.5px; line-height: 1.5;
    margin-bottom: 12px;
    animation: ev-fade-up 0.25s ease;
  }
  .ev-success {
    display: flex; align-items: center; gap: 7px;
    color: #059669; font-size: 12.5px; font-weight: 600;
    margin-bottom: 12px;
  }

  .ev-timer-row {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; color: #6b7280;
    padding: 10px 14px;
    background: white;
    border: 1px solid #d1fae5;
    border-radius: 12px;
  }
  .ev-timer-text { flex: 1; font-weight: 500; }
  .ev-timer-urgent { color: #dc2626; font-weight: 700; }

  .ev-resend-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none;
    color: #059669; font-size: 12.5px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    padding: 4px 8px; border-radius: 6px;
    transition: all 0.18s;
  }
  .ev-resend-btn:hover:not(:disabled) {
    background: #f0fdf4; color: #065f46;
  }
  .ev-resend-btn:disabled {
    color: #9ca3af; cursor: not-allowed;
  }

  .ev-send-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px; border-radius: 12px;
    background: linear-gradient(135deg, #059669, #065f46);
    color: white; border: none;
    font-size: 13.5px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 16px rgba(5,150,105,0.28);
    transition: all 0.22s;
  }
  .ev-send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(5,150,105,0.38);
  }
  .ev-send-btn:disabled {
    opacity: 0.6; cursor: not-allowed; transform: none;
  }

  .ev-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ev-hint {
    margin: 8px 0 0; font-size: 11.5px; color: #9ca3af;
    line-height: 1.55; text-align: center;
  }
  .ev-hint strong { color: #374151; }

  .ev-verified-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 50px;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    border: 1.5px solid #6ee7b7;
    color: #065f46; font-size: 13px; font-weight: 700;
    animation: ev-fade-up 0.4s ease;
  }
`;

let _stylesInjected = false;
const injectStyles = () => {
  if (_stylesInjected || typeof document === "undefined") return;
  if (document.getElementById("ev-styles")) { _stylesInjected = true; return; }
  const el = document.createElement("style");
  el.id = "ev-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
  _stylesInjected = true;
};

/* ── OTP Boxes ──────────────────────────────────────────────────── */
const OtpBoxes = memo(({ value, onChange, hasError, isSuccess, disabled }) => {
  const inputsRef = useRef([]);
  const digits = value.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

  const focus = useCallback((i) => {
    requestAnimationFrame(() => inputsRef.current[i]?.focus());
  }, []);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "");

    if (!val) {
      // backspace cleared this box
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      return;
    }

    // accept single digit
    const digit = val.slice(-1);
    const next = (value.slice(0, i) + digit + value.slice(i + 1)).slice(0, OTP_LENGTH);
    onChange(next);

    if (i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = value.slice(0, i - 1) + value.slice(i);
      onChange(next);
      focus(i - 1);
      return;
    }
    if (e.key === "ArrowLeft"  && i > 0)              { e.preventDefault(); focus(i - 1); }
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) { e.preventDefault(); focus(i + 1); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted) {
      onChange(pasted);
      focus(Math.min(pasted.length, OTP_LENGTH - 1));
    }
  };

  const boxClass = (filled) => [
    "ev-box",
    filled && !hasError && !isSuccess ? "ev-box-filled" : "",
    hasError ? "ev-box-error" : "",
    isSuccess ? "ev-box-success" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="ev-boxes" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={boxClass(!!d)}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
        />
      ))}
    </div>
  );
});
OtpBoxes.displayName = "OtpBoxes";

/* ── Timer Ring SVG ─────────────────────────────────────────────── */
const TimerRing = memo(({ seconds, total }) => {
  const r = 9;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, seconds / total);
  const dash = c * (1 - pct);
  const color = seconds < 60 ? "#dc2626" : "#059669";

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle
        cx="12" cy="12" r={r}
        fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={c} strokeDashoffset={dash}
        strokeLinecap="round" transform="rotate(-90 12 12)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
      />
    </svg>
  );
});
TimerRing.displayName = "TimerRing";

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function EmailVerification({ email, onVerified, autoSend = false }) {
  useEffect(() => { injectStyles(); }, []);

  /* phase: idle → sending → sent → verifying → verified | error */
  const [phase,      setPhase]      = useState("idle");
  const [otp,        setOtp]        = useState("");
  const [otpError,   setOtpError]   = useState("");
  const [apiError,   setApiError]   = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const [timerSecs,  setTimerSecs]  = useState(EXPIRY_SECS);

  const expiryRef = useRef(null);
  const resendRef = useRef(null);

  /* ── Cleanup timers on unmount ── */
  useEffect(() => () => {
    clearInterval(expiryRef.current);
    clearInterval(resendRef.current);
  }, []);

  /* ── Auto-send when component mounts (if requested) ── */
  useEffect(() => {
    if (autoSend && phase === "idle" && email) {
      sendCode();
    }
    // eslint-disable-next-line
  }, [autoSend]);

  const startExpiry = useCallback(() => {
    clearInterval(expiryRef.current);
    setTimerSecs(EXPIRY_SECS);
    expiryRef.current = setInterval(() => {
      setTimerSecs((s) => {
        if (s <= 1) {
          clearInterval(expiryRef.current);
          setPhase("idle");
          setOtp("");
          setApiError("Code expired. Please request a new one.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const startResend = useCallback(() => {
    clearInterval(resendRef.current);
    setResendSecs(RESEND_SECS);
    resendRef.current = setInterval(() => {
      setResendSecs((s) => {
        if (s <= 1) { clearInterval(resendRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  /* ── Send verification code ── */
  const sendCode = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setApiError("Please enter a valid email address first.");
      return;
    }

    setPhase("sending");
    setApiError("");
    setOtpError("");
    setOtp("");

    try {
      const res = await fetch(`${API}/bookings/send-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: text }; }

      if (!res.ok) {
        const msg =
          res.status === 429 ? (data?.error || "Too many requests. Please wait a minute.") :
          res.status === 500 ? (data?.detail || data?.error || "Server error. Please try again shortly or contact support.") :
                                (data?.error || `Failed (${res.status})`);
        throw new Error(msg);
      }

      setPhase("sent");
      startExpiry();
      startResend();
    } catch (err) {
      console.error("[OTP] Send failed:", err);
      setApiError(err.message || "Network error. Please try again.");
      setPhase("idle");
    }
  }, [email, startExpiry, startResend]);

  /* ── Verify code ── */
  const verifyCode = useCallback(async (code) => {
    if (!code || code.length !== OTP_LENGTH) return;

    setPhase("verifying");
    setOtpError("");

    try {
      const res = await fetch(`${API}/bookings/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!res.ok || !data.verified) {
        throw new Error(data?.error || "Incorrect code. Please try again.");
      }

      clearInterval(expiryRef.current);
      clearInterval(resendRef.current);
      setPhase("verified");
      onVerified?.();
    } catch (err) {
      console.error("[OTP] Verify failed:", err);
      setOtpError(err.message || "Verification failed.");
      setOtp("");
      setPhase("sent");
    }
  }, [email, onVerified]);

  /* ── Auto-verify when 6 digits entered ── */
  useEffect(() => {
    if (otp.length === OTP_LENGTH && phase === "sent") {
      verifyCode(otp);
    }
  }, [otp, phase, verifyCode]);

  /* ── Format timer ── */
  const mins = String(Math.floor(timerSecs / 60)).padStart(2, "0");
  const secs = String(timerSecs % 60).padStart(2, "0");

  /* ══════════════════════════════════════════════════════════════════
     RENDER STATES
     ══════════════════════════════════════════════════════════════════ */

  /* ✅ Verified */
  if (phase === "verified") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}
      >
        <span className="ev-verified-badge">
          <FiCheckCircle size={15} /> Email verified
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{email}</span>
      </motion.div>
    );
  }

  /* 🟢 Idle / Sending → show Send button */
  if (phase === "idle" || phase === "sending") {
    return (
      <div style={{ marginTop: 10 }}>
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ev-error"
              role="alert"
            >
              <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="ev-send-btn"
          onClick={sendCode}
          disabled={phase === "sending" || !email}
        >
          {phase === "sending" ? (
            <>
              <span className="ev-spinner" />
              Sending code…
            </>
          ) : (
            <>
              <FiSend size={14} />
              Send Verification Code
            </>
          )}
        </button>

        <p className="ev-hint">
          We'll send a 6-digit code to <strong>{email || "your email"}</strong> to confirm your identity.
        </p>
      </div>
    );
  }

  /* 📨 Sent / Verifying → show OTP boxes */
  return (
    <div className="ev-card">

      {/* Header */}
      <div className="ev-header">
        <div className="ev-icon-wrap">
          <div className="ev-icon-ring" />
          <FiMail size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ev-title">Check your inbox</p>
          <p className="ev-subtitle">
            Code sent to <strong>{email}</strong>
          </p>
        </div>
      </div>

      {/* OTP Boxes */}
      <OtpBoxes
        value={otp}
        onChange={setOtp}
        hasError={!!otpError}
        isSuccess={phase === "verifying"}
        disabled={phase === "verifying"}
      />

      {/* Error or verifying */}
      <AnimatePresence>
        {otpError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ev-error"
            role="alert"
          >
            <FiAlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{otpError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "verifying" && (
        <div className="ev-success">
          <FiLoader size={13} className="ev-spinner" style={{
            width: 13, height: 13, borderColor: "rgba(5,150,105,0.3)", borderTopColor: "#059669",
          }} />
          Verifying code…
        </div>
      )}

      {/* Timer + Resend row */}
      <div className="ev-timer-row">
        <TimerRing seconds={timerSecs} total={EXPIRY_SECS} />
        <span className={`ev-timer-text${timerSecs < 60 ? " ev-timer-urgent" : ""}`}>
          Expires in {mins}:{secs}
        </span>
        <button
          type="button"
          className="ev-resend-btn"
          onClick={sendCode}
          disabled={resendSecs > 0 || phase === "verifying"}
        >
          <FiRefreshCw size={11} />
          {resendSecs > 0 ? `Resend in ${resendSecs}s` : "Resend"}
        </button>
      </div>

      {/* Manual verify button (fallback if auto doesn't fire) */}
      {otp.length === OTP_LENGTH && phase === "sent" && !otpError && (
        <button
          type="button"
          className="ev-send-btn"
          style={{ marginTop: 12 }}
          onClick={() => verifyCode(otp)}
        >
          <FiCheck size={14} /> Verify Code
        </button>
      )}

      {/* Security note */}
      <p className="ev-hint" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
        <FiShield size={11} style={{ color: "#059669" }} />
        Never share this code with anyone
      </p>
    </div>
  );
}