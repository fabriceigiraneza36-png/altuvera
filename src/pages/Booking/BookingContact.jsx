// src/pages/Booking/BookingContact.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUser, FiMail, FiPhone, FiGlobe, FiMessageCircle,
  FiSend, FiShield, FiCheck, FiAlertTriangle, FiRefreshCw,
  FiLock, FiArrowLeft, FiZap, FiCheckCircle, FiInfo,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const COUNTRIES_LIST = [
  "United States","United Kingdom","Germany","France","Canada",
  "Australia","Netherlands","Belgium","Switzerland","Sweden",
  "Norway","Denmark","Austria","Spain","Italy","Portugal",
  "Japan","Singapore","UAE","India","South Africa","Kenya",
  "Rwanda","Uganda","Tanzania","Ethiopia","Nigeria","Ghana","Other",
];

const HEAR_ABOUT_US = [
  "Google Search","Instagram","Facebook","Twitter / X","YouTube",
  "Friend / Family Referral","Travel Blog","Travel Agent",
  "TripAdvisor","Direct Email","LinkedIn","Other",
];

const OTP_LENGTH   = 6;
const RESEND_SECS  = 60;
const TIMER_SECS   = 600; // 10 min

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const FieldError = ({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error">
      <FiAlertTriangle size={12} /> {error}
    </p>
  ) : null;

const FieldSuccess = ({ msg }) =>
  msg ? (
    <p className="bk-field-success">
      <FiCheckCircle size={12} /> {msg}
    </p>
  ) : null;

/* Countdown ring SVG */
function TimerRing({ seconds, total }) {
  const r   = 11;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  const dash = circ * (1 - pct);
  const color = seconds < 60 ? "#ef4444" : "#059669";

  return (
    <svg className="bk-otp-timer-ring" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle
        cx="14" cy="14" r={r}
        fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
      />
    </svg>
  );
}

/* OTP 6-box input */
function OtpBoxes({ value, onChange, hasError, disabled }) {
  const inputsRef = useRef([]);
  const digits    = value.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

  const focus = (i) => inputsRef.current[i]?.focus();

  const handleKey = useCallback((e, i) => {
    const { key } = e;

    if (key === "Backspace") {
      e.preventDefault();
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) focus(i - 1);
      return;
    }

    if (key === "ArrowLeft"  && i > 0)              { e.preventDefault(); focus(i - 1); return; }
    if (key === "ArrowRight" && i < OTP_LENGTH - 1) { e.preventDefault(); focus(i + 1); return; }

    if (/^\d$/.test(key)) {
      e.preventDefault();
      const next = value.slice(0, i) + key + value.slice(i + 1);
      onChange(next.slice(0, OTP_LENGTH));
      if (i < OTP_LENGTH - 1) focus(i + 1);
    }
  }, [value, onChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted) { onChange(pasted); focus(Math.min(pasted.length, OTP_LENGTH - 1)); }
  }, [onChange]);

  return (
    <div className="bk-otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          readOnly
          disabled={disabled}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={() => focus(i)}
          onClick={() => focus(i)}
          className={[
            "bk-otp-box",
            d                      ? "bk-otp-box--filled" : "",
            hasError && !disabled  ? "bk-otp-box--error"  : "",
          ].filter(Boolean).join(" ")}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   EMAIL VERIFICATION BLOCK
───────────────────────────────────────────────────────── */
function EmailVerification({ email, onVerified, isMobile }) {
  const [phase, setPhase]           = useState("idle"); // idle | sending | sent | verifying | verified | error
  const [otp, setOtp]               = useState("");
  const [otpError, setOtpError]     = useState("");
  const [apiError, setApiError]     = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const [timerSecs, setTimerSecs]   = useState(TIMER_SECS);
  const timerRef                    = useRef(null);
  const resendRef                   = useRef(null);

  /* Cleanup on unmount */
  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(resendRef.current);
  }, []);

  /* OTP expiry countdown */
  const startExpiry = useCallback(() => {
    clearInterval(timerRef.current);
    setTimerSecs(TIMER_SECS);
    timerRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setPhase("idle");
          setOtp("");
          setApiError("Code expired. Please request a new one.");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  /* Resend cooldown */
  const startResend = useCallback(() => {
    clearInterval(resendRef.current);
    setResendSecs(RESEND_SECS);
    resendRef.current = setInterval(() => {
      setResendSecs(s => {
        if (s <= 1) { clearInterval(resendRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  const sendCode = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setApiError("Please enter a valid email address first.");
      return;
    }
    setPhase("sending");
    setApiError("");
    setOtp("");
    setOtpError("");

    try {
      const res  = await fetch(`${API}/bookings/send-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code.");
      setPhase("sent");
      startExpiry();
      startResend();
    } catch (err) {
      setApiError(err.message);
      setPhase("idle");
    }
  }, [email, startExpiry, startResend]);

  /* Auto-verify when all 6 digits entered */
  useEffect(() => {
    if (otp.length === OTP_LENGTH && phase === "sent") {
      verifyCode(otp);
    }
  }, [otp]); // eslint-disable-line

  const verifyCode = useCallback(async (code) => {
    setPhase("verifying");
    setOtpError("");

    try {
      const res  = await fetch(`${API}/bookings/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data.error || "Incorrect code. Please try again.");
      }

      clearInterval(timerRef.current);
      clearInterval(resendRef.current);
      setPhase("verified");
      onVerified();
    } catch (err) {
      setOtpError(err.message);
      setOtp("");
      setPhase("sent");
    }
  }, [email, onVerified]);

  const mins = String(Math.floor(timerSecs / 60)).padStart(2, "0");
  const secs = String(timerSecs % 60).padStart(2, "0");

  /* ── Verified state ── */
  if (phase === "verified") {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
        <div className="bk-verified-badge">
          <FiCheckCircle size={15} />
          Email verified
        </div>
        <span style={{ fontSize:12, color:"#9ca3af" }}>{email}</span>
      </div>
    );
  }

  /* ── Idle: show "Send Code" button ── */
  if (phase === "idle" || phase === "sending") {
    return (
      <div style={{ marginTop:8 }}>
        {apiError && (
          <div className="bk-info-box bk-info-box--red" style={{ marginBottom:10 }}>
            <FiAlertTriangle size={15} style={{ flexShrink:0 }} />
            <p style={{ margin:0 }}>{apiError}</p>
          </div>
        )}
        <button
          type="button"
          className="bk-send-code-btn"
          onClick={sendCode}
          disabled={phase === "sending" || !email}
        >
          {phase === "sending" ? (
            <>
              <span className="bk-btn__spinner" style={{
                borderColor:"rgba(255,255,255,0.3)",
                borderTopColor:"#fff",
                width:14, height:14,
              }} />
              Sending…
            </>
          ) : (
            <>
              <FiSend size={14} />
              Send Verification Code
            </>
          )}
        </button>
        <p style={{ margin:"8px 0 0", fontSize:12, color:"#9ca3af", lineHeight:1.5 }}>
          We'll send a 6-digit code to <strong style={{ color:"#374151" }}>{email || "your email"}</strong> to confirm your identity.
        </p>
      </div>
    );
  }

  /* ── Sent: show OTP boxes ── */
  return (
    <div className="bk-otp-section">
      <div className="bk-otp-header">
        <div className="bk-otp-icon">
          <FiMail size={20} />
        </div>
        <div>
          <p className="bk-otp-title">Check your inbox</p>
          <p className="bk-otp-sub">
            Code sent to <strong>{email}</strong>
          </p>
        </div>
      </div>

      <OtpBoxes
        value={otp}
        onChange={setOtp}
        hasError={!!otpError}
        disabled={phase === "verifying"}
      />

      {otpError && (
        <p className="bk-field-error" style={{ marginBottom:8 }}>
          <FiAlertTriangle size={12} /> {otpError}
        </p>
      )}

      {phase === "verifying" && (
        <p className="bk-field-success">
          <FiCheckCircle size={12} /> Verifying…
        </p>
      )}

      {/* Timer */}
      <div className="bk-otp-timer">
        <TimerRing seconds={timerSecs} total={TIMER_SECS} />
        <span className={`bk-otp-timer-text${timerSecs < 60 ? " bk-otp-timer-text--urgent" : ""}`}>
          Code expires in {mins}:{secs}
        </span>

        {/* Resend */}
        <button
          type="button"
          onClick={sendCode}
          disabled={resendSecs > 0 || phase === "verifying"}
          style={{
            marginLeft:"auto",
            display:"inline-flex", alignItems:"center", gap:5,
            background:"none", border:"none", cursor: resendSecs > 0 ? "not-allowed" : "pointer",
            color: resendSecs > 0 ? "#9ca3af" : "#059669",
            fontSize:12.5, fontWeight:700, fontFamily:"inherit",
            padding:"4px 0",
            opacity: resendSecs > 0 ? 0.6 : 1,
          }}
        >
          <FiRefreshCw size={12} />
          {resendSecs > 0 ? `Resend in ${resendSecs}s` : "Resend Code"}
        </button>
      </div>

      {/* Manual verify button */}
      {otp.length === OTP_LENGTH && phase === "sent" && (
        <button
          type="button"
          className="bk-send-code-btn"
          style={{ marginTop:12 }}
          onClick={() => verifyCode(otp)}
        >
          <FiCheck size={14} />
          Verify Code
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const BookingContact = ({
  formData,
  setFormData,
  errors,
  touched,
  handleChange,
  handleBlur,
  getTripDuration,
  getTotalVisitors,
  getDestinationName,
  accommodationTypes,
  user,
  displayName,
  isAuthenticated,
  openModal,
  isSubmitting,
  onSubmit,
  prevStep,
  isMobile,
}) => {
  const [emailVerified, setEmailVerified] = useState(
    /* Pre-verified if user is already authenticated */
    isAuthenticated || false
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const duration = getTripDuration();
  const total    = getTotalVisitors();
  const destName = getDestinationName();
  const accom    = accommodationTypes?.find(a => a.value === formData.accommodationType);

  /* Reset verification if email changes */
  useEffect(() => {
    if (!isAuthenticated) setEmailVerified(false);
  }, [formData.email, isAuthenticated]);

  const handleSubmitClick = useCallback((e) => {
    setSubmitAttempted(true);
    if (!emailVerified) return; // block — UI shows warning
    onSubmit(e);
  }, [emailVerified, onSubmit]);

  /* Trip summary items */
  const summaryItems = [
    destName && { Icon: FiMap,    val: destName },
    duration && { Icon: FiClock,  val: `${duration} days` },
    total > 0 && { Icon: FiUsers, val: `${total} traveller${total !== 1 ? "s" : ""}` },
    accom    && { Icon: FiStar,   val: accom.label },
  ].filter(Boolean);

  return (
    <div className="bk-step-content">

      {/* Header */}
      <div className="bk-step-header">
        <div className="bk-step-header__icon-wrap">
          <FiMail size={24} />
        </div>
        <h2 className="bk-step-header__title">
          {displayName ? `Almost there, ${displayName}!` : "Your contact details"}
        </h2>
        <p className="bk-step-header__sub">
          We'll use these details to send your booking confirmation and reach
          you to finalise your perfect itinerary. No payment required.
        </p>
      </div>

      {/* Auth shortcut */}
      {!isAuthenticated && openModal && (
        <div className="bk-info-box bk-info-box--blue" style={{ marginBottom:22 }}>
          <FiZap size={16} style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ margin:0 }}>
            <strong>Already have an account?</strong>{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              style={{
                background:"none", border:"none",color:"#2563eb",
                fontWeight:700, cursor:"pointer",
                textDecoration:"underline", fontSize:"inherit", padding:0,
              }}
            >
              Sign in
            </button>{" "}
            to auto-fill your details and skip email verification.
          </p>
        </div>
      )}

      {/* Trip mini-summary */}
      {summaryItems.length > 0 && (
        <div style={{
          background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
          border:"1.5px solid #a7f3d0", borderRadius:16,
          padding:"14px 20px", marginBottom:26,
          display:"flex", gap:16, flexWrap:"wrap",
        }}>
          {summaryItems.map(({ Icon, val }, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:7,
              fontSize:13, fontWeight:600, color:"#065f46",
            }}>
              <Icon size={14} style={{ flexShrink:0 }} />
              {val}
            </div>
          ))}
        </div>
      )}

      {/* ── Name row ── */}
      <div style={{
        display:"grid", gap:18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom:18,
      }}>
        <div>
          <label className="bk-label">
            First Name <span>*</span>
          </label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              type="text" name="firstName"
              className={`bk-input${errors.firstName && touched.firstName ? " bk-input--error" : ""}`}
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange} onBlur={handleBlur}
              autoComplete="given-name"
            />
          </div>
          <FieldError error={errors.firstName} touched={touched.firstName} />
        </div>
        <div>
          <label className="bk-label">
            Last Name <span>*</span>
          </label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              type="text" name="lastName"
              className={`bk-input${errors.lastName && touched.lastName ? " bk-input--error" : ""}`}
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange} onBlur={handleBlur}
              autoComplete="family-name"
            />
          </div>
          <FieldError error={errors.lastName} touched={touched.lastName} />
        </div>
      </div>

      {/* ── Email + Verification ── */}
      <div style={{ marginBottom:18 }}>
        <label className="bk-label">
          Email Address <span>*</span>
        </label>
        <div className="bk-input-wrap">
          <FiMail size={15} className="bk-input-icon" />
          <input
            type="email" name="email"
            className={[
              "bk-input",
              errors.email && touched.email   ? "bk-input--error"    : "",
              emailVerified                   ? "bk-input--verified" : "",
            ].filter(Boolean).join(" ")}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange} onBlur={handleBlur}
            autoComplete="email"
            disabled={emailVerified && !isAuthenticated}
            style={{ paddingRight: emailVerified ? 44 : 16 }}
          />
          {emailVerified && (
            <div className="bk-input-suffix">
              <FiCheckCircle size={18} color="#059669" />
            </div>
          )}
        </div>
        <FieldError error={errors.email} touched={touched.email} />

        {/* Verification block — only for non-authenticated users */}
        {!isAuthenticated && formData.email && !errors.email && (
          <EmailVerification
            email={formData.email}
            onVerified={() => setEmailVerified(true)}
            isMobile={isMobile}
          />
        )}

        {emailVerified && !isAuthenticated && (
          <FieldSuccess msg="Email address verified successfully" />
        )}

        {/* Warning if user tries to submit without verifying */}
        {submitAttempted && !emailVerified && (
          <div className="bk-info-box bk-info-box--amber" style={{ marginTop:10 }}>
            <FiAlertTriangle size={15} style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ margin:0 }}>
              Please verify your email address before submitting your booking.
            </p>
          </div>
        )}
      </div>

      {/* ── Phone ── */}
      <div style={{ marginBottom:18 }}>
        <label className="bk-label">Phone Number (optional)</label>
        <div className="bk-input-wrap">
          <FiPhone size={15} className="bk-input-icon" />
          <input
            type="tel" name="phone"
            className={`bk-input${errors.phone && touched.phone ? " bk-input--error" : ""}`}
            placeholder="+1 555 000 0000"
            value={formData.phone}
            onChange={handleChange} onBlur={handleBlur}
            autoComplete="tel"
          />
        </div>
        <FieldError error={errors.phone} touched={touched.phone} />
      </div>

      {/* ── Country & Hear About ── */}
      <div style={{
        display:"grid", gap:18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom:24,
      }}>
        <div>
          <label className="bk-label">Your Country</label>
          <div className="bk-input-wrap">
            <FiGlobe size={15} className="bk-input-icon" />
            <select
              name="country"
              className="bk-select"
              value={formData.country}
              onChange={handleChange}
              style={{ paddingLeft:44 }}
            >
              <option value="">Select country…</option>
              {COUNTRIES_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="bk-label">How did you hear about us?</label>
          <div className="bk-input-wrap">
            <FiMessageCircle size={15} className="bk-input-icon" />
            <select
              name="hearAboutUs"
              className="bk-select"
              value={formData.hearAboutUs}
              onChange={handleChange}
              style={{ paddingLeft:44 }}
            >
              <option value="">Select option…</option>
              {HEAR_ABOUT_US.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="bk-info-box bk-info-box--red" style={{ marginBottom:18 }}>
          <FiAlertTriangle size={15} style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ margin:0 }}>{errors.submit}</p>
        </div>
      )}

      {/* ── Terms ── */}
      <div style={{ marginBottom:18 }}>
        <label
          className="bk-check-row"
          onClick={() => setFormData(p => ({ ...p, agreeToTerms:!p.agreeToTerms }))}
        >
          <div
            className={`bk-check${formData.agreeToTerms ? " bk-check--on" : ""}`}
            style={errors.agreeToTerms && touched.agreeToTerms ? { borderColor:"#ef4444" } : {}}
          >
            {formData.agreeToTerms && <FiCheck size={11} color="#fff" strokeWidth={3} />}
          </div>
          <span className="bk-check-label">
            I agree to the{" "}
            <a href="/terms" target="_blank"
              style={{ color:"#059669", fontWeight:700 }}
              onClick={e => e.stopPropagation()}>
              Terms of Service
            </a>{" "}and{" "}
            <a href="/privacy" target="_blank"
              style={{ color:"#059669", fontWeight:700 }}
              onClick={e => e.stopPropagation()}>
              Privacy Policy
            </a>
            <span style={{ color:"#ef4444" }}> *</span>
          </span>
        </label>
        {errors.agreeToTerms && touched.agreeToTerms && (
          <p className="bk-field-error" style={{ marginTop:6 }}>
            <FiAlertTriangle size={12} /> {errors.agreeToTerms}
          </p>
        )}
      </div>

      {/* ── Newsletter ── */}
      <div style={{ marginBottom:28 }}>
        <label
          className="bk-check-row"
          onClick={() => setFormData(p => ({ ...p, subscribeNewsletter:!p.subscribeNewsletter }))}
        >
          <div className={`bk-check${formData.subscribeNewsletter ? " bk-check--on" : ""}`}>
            {formData.subscribeNewsletter && <FiCheck size={11} color="#fff" strokeWidth={3} />}
          </div>
          <span className="bk-check-label">
            Send me travel inspiration, deals and news from Altuvera
          </span>
        </label>
      </div>

      {/* ── Navigation ── */}
      <div className="bk-nav">
        <button
          type="button"
          className="bk-btn bk-btn--secondary"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          <FiArrowLeft size={15} /> Back
        </button>

        <button
          type="submit"
          className="bk-btn bk-btn--primary bk-btn--lg"
          disabled={isSubmitting || !emailVerified}
          style={{
            minWidth: isMobile ? "100%" : 220,
            opacity: !emailVerified ? 0.65 : 1,
          }}
          onClick={handleSubmitClick}
        >
          {isSubmitting ? (
            <>
              <span className="bk-btn__spinner" />
              Submitting…
            </>
          ) : !emailVerified ? (
            <>
              <FiLock size={15} />
              Verify Email to Submit
            </>
          ) : (
            <>
              <FiSend size={15} />
              Submit Booking Request
            </>
          )}
        </button>
      </div>

      {/* Trust micro-copy */}
      <div className="bk-trust-row" style={{ marginTop:16 }}>
        {[
          { Icon: FiLock,    text: "Secure & encrypted" },
          { Icon: FiShield,  text: "No payment required" },
          { Icon: FiInfo,    text: "Free consultation" },
        ].map(({ Icon, text }, i) => (
          <div key={i} className="bk-trust-item">
            <Icon size={13} />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingContact;