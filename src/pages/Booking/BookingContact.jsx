// src/pages/Booking/BookingContact.jsx
import React, {
  useState, useEffect, useRef, useCallback, memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser, FiMail, FiPhone, FiGlobe, FiMessageCircle,
  FiSend, FiShield, FiCheck, FiAlertTriangle, FiRefreshCw,
  FiLock, FiArrowLeft, FiZap, FiCheckCircle, FiInfo,
  FiMapPin, FiClock, FiUsers, FiStar,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ── Constants ──────────────────────────────────────────────── */
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

const OTP_LENGTH  = 6;
const RESEND_SECS = 60;
const TIMER_SECS  = 600;

/* ── Helpers ────────────────────────────────────────────────── */
const FieldError = memo(({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error" role="alert">
      <FiAlertTriangle size={12} /> {error}
    </p>
  ) : null
);
FieldError.displayName = "FieldError";

const FieldSuccess = memo(({ msg }) =>
  msg ? (
    <p className="bk-field-success">
      <FiCheckCircle size={12} /> {msg}
    </p>
  ) : null
);
FieldSuccess.displayName = "FieldSuccess";

/* ── Timer ring SVG ─────────────────────────────────────────── */
const TimerRing = memo(({ seconds, total }) => {
  const r    = 11;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  const dash = circ * (1 - pct);
  const color = seconds < 60 ? "#ef4444" : "#059669";

  return (
    <svg className="bk-otp-timer-ring" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle
        cx="14" cy="14" r={r}
        fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
        style={{ transition: "stroke-dashoffset 1s linear, stroke .3s ease" }}
      />
    </svg>
  );
});
TimerRing.displayName = "TimerRing";

/* ── OTP 6-box input ────────────────────────────────────────── */
const OtpBoxes = memo(({ value, onChange, hasError, disabled }) => {
  const inputsRef = useRef([]);
  const digits    = value.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

  const focus = useCallback((i) => {
    requestAnimationFrame(() => inputsRef.current[i]?.focus());
  }, []);

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
  }, [value, onChange, focus]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted) {
      onChange(pasted);
      focus(Math.min(pasted.length, OTP_LENGTH - 1));
    }
  }, [onChange, focus]);

  return (
    <div className="bk-otp-boxes" role="group" aria-label="One-time verification code">
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
          onFocus={() => {}}
          onClick={() => focus(i)}
          className={[
            "bk-otp-box",
            d               ? "bk-otp-box--filled" : "",
            hasError && !disabled ? "bk-otp-box--error"  : "",
          ].filter(Boolean).join(" ")}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
        />
      ))}
    </div>
  );
});
OtpBoxes.displayName = "OtpBoxes";

/* ── Email Verification Block ───────────────────────────────── */
const EmailVerification = memo(({ email, onVerified, isMobile }) => {
  const [phase, setPhase]           = useState("idle");
  const [otp, setOtp]               = useState("");
  const [otpError, setOtpError]     = useState("");
  const [apiError, setApiError]     = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const [timerSecs, setTimerSecs]   = useState(TIMER_SECS);
  const timerRef  = useRef(null);
  const resendRef = useRef(null);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(resendRef.current);
  }, []);

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to send code.");
      setPhase("sent");
      startExpiry();
      startResend();
    } catch (err) {
      setApiError(err.message || "Network error. Please try again.");
      setPhase("idle");
    }
  }, [email, startExpiry, startResend]);

  /* Auto-verify when 6 digits entered */
  useEffect(() => {
    if (otp.length === OTP_LENGTH && phase === "sent") {
      verifyCode(otp);
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyCode = useCallback(async (code) => {
    setPhase("verifying");
    setOtpError("");

    try {
      const res  = await fetch(`${API}/bookings/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        throw new Error(data?.error || data?.message || "Incorrect code. Please try again.");
      }

      clearInterval(timerRef.current);
      clearInterval(resendRef.current);
      setPhase("verified");
      onVerified();
    } catch (err) {
      setOtpError(err.message || "Verification failed. Please try again.");
      setOtp("");
      setPhase("sent");
    }
  }, [email, onVerified]);

  const mins = String(Math.floor(timerSecs / 60)).padStart(2, "0");
  const secs = String(timerSecs % 60).padStart(2, "0");

  /* Verified */
  if (phase === "verified") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}
      >
        <div className="bk-verified-badge">
          <FiCheckCircle size={15} />
          Email verified
        </div>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{email}</span>
      </motion.div>
    );
  }

  /* Idle / sending */
  if (phase === "idle" || phase === "sending") {
    return (
      <div style={{ marginTop: 10 }}>
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bk-info-box bk-info-box--red"
              style={{ marginBottom: 10 }}
              role="alert"
            >
              <FiAlertTriangle size={15} style={{ flexShrink: 0 }} />
              <p style={{ margin: 0 }}>{apiError}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="bk-send-code-btn"
          onClick={sendCode}
          disabled={phase === "sending" || !email}
          aria-busy={phase === "sending"}
        >
          {phase === "sending" ? (
            <>
              <span className="bk-btn__spinner" style={{
                width: 14, height: 14,
                borderColor: "rgba(255,255,255,.3)",
                borderTopColor: "#fff",
              }} />
              Sending code…
            </>
          ) : (
            <>
              <FiSend size={14} />
              Send Verification Code
            </>
          )}
        </button>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.55 }}>
          We'll send a {OTP_LENGTH}-digit code to{" "}
          <strong style={{ color: "#374151" }}>{email || "your email"}</strong> to
          confirm your identity. Check spam if it doesn't arrive.
        </p>
      </div>
    );
  }

  /* Sent — show OTP boxes */
  return (
    <motion.div
      className="bk-otp-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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

      <AnimatePresence>
        {otpError && (
          <motion.p
            className="bk-field-error"
            style={{ marginBottom: 8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
          >
            <FiAlertTriangle size={12} /> {otpError}
          </motion.p>
        )}
      </AnimatePresence>

      {phase === "verifying" && (
        <p className="bk-field-success">
          <FiCheckCircle size={12} /> Verifying…
        </p>
      )}

      {/* Timer + resend */}
      <div className="bk-otp-timer">
        <TimerRing seconds={timerSecs} total={TIMER_SECS} />
        <span
          className={`bk-otp-timer-text${timerSecs < 60 ? " bk-otp-timer-text--urgent" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          Code expires in {mins}:{secs}
        </span>

        <button
          type="button"
          onClick={sendCode}
          disabled={resendSecs > 0 || phase === "verifying"}
          style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "none", border: "none",
            cursor: resendSecs > 0 ? "not-allowed" : "pointer",
            color: resendSecs > 0 ? "#9ca3af" : "#059669",
            fontSize: 12.5, fontWeight: 700,
            fontFamily: "inherit", padding: "4px 0",
            opacity: resendSecs > 0 ? 0.6 : 1,
          }}
          aria-disabled={resendSecs > 0}
        >
          <FiRefreshCw size={12} />
          {resendSecs > 0 ? `Resend in ${resendSecs}s` : "Resend Code"}
        </button>
      </div>

      {/* Manual verify if auto didn't trigger */}
      {otp.length === OTP_LENGTH && phase === "sent" && (
        <button
          type="button"
          className="bk-send-code-btn"
          style={{ marginTop: 12 }}
          onClick={() => verifyCode(otp)}
        >
          <FiCheck size={14} /> Verify Code
        </button>
      )}
    </motion.div>
  );
});
EmailVerification.displayName = "EmailVerification";

/* ── Trip Mini Summary ──────────────────────────────────────── */
const TripMiniSummary = memo(({
  formData, getTripDuration, getTotalVisitors,
  getDestinationName, accommodationTypes,
}) => {
  const duration  = getTripDuration?.();
  const total     = getTotalVisitors?.();
  const destName  = getDestinationName?.();
  const accom     = accommodationTypes?.find(a => a.value === formData.accommodationType);

  const items = [
    destName && { Icon: FiMapPin,  val: destName },
    duration && { Icon: FiClock,   val: `${duration} day${duration !== 1 ? "s" : ""}` },
    total > 0 && { Icon: FiUsers,  val: `${total} traveller${total !== 1 ? "s" : ""}` },
    accom    && { Icon: FiStar,    val: accom.label },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      border: "1.5px solid #a7f3d0", borderRadius: 16,
      padding: "14px 20px", marginBottom: 24,
      display: "flex", gap: 16, flexWrap: "wrap",
    }}>
      {items.map(({ Icon, val }, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 13, fontWeight: 600, color: "#065f46",
        }}>
          <Icon size={14} style={{ flexShrink: 0 }} />
          {val}
        </div>
      ))}
    </div>
  );
});
TripMiniSummary.displayName = "TripMiniSummary";

/* ── Main BookingContact ────────────────────────────────────── */
const BookingContact = ({
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  getTripDuration, getTotalVisitors,
  getDestinationName, accommodationTypes,
  user, displayName,
  isAuthenticated, openModal,
  isSubmitting, onSubmit, prevStep,
  isMobile, submitError,
}) => {
  const [emailVerified,    setEmailVerified]    = useState(isAuthenticated || false);
  const [submitAttempted,  setSubmitAttempted]  = useState(false);

  /* Reset verification if email changes */
  useEffect(() => {
    if (!isAuthenticated) setEmailVerified(false);
  }, [formData.email, isAuthenticated]);

  const handleSubmitClick = useCallback((e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!emailVerified) return;
    onSubmit(e);
  }, [emailVerified, onSubmit]);

  const emailHasError = errors.email && touched.email;

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
          We'll use these to send your booking confirmation and reach you to
          finalise your perfect itinerary.{" "}
          <strong style={{ color: "#059669" }}>No payment required now.</strong>
        </p>
      </div>

      {/* Auth shortcut */}
      {!isAuthenticated && typeof openModal === "function" && (
        <div className="bk-info-box bk-info-box--blue" style={{ marginBottom: 22 }}>
          <FiZap size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0 }}>
            <strong>Already have an account?</strong>{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              style={{
                background: "none", border: "none", color: "#2563eb",
                fontWeight: 700, cursor: "pointer",
                textDecoration: "underline", fontSize: "inherit", padding: 0,
              }}
            >
              Sign in
            </button>{" "}
            to auto-fill your details and skip email verification.
          </p>
        </div>
      )}

      {/* Trip mini-summary */}
      <TripMiniSummary
        formData={formData}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
      />

      {/* Submit-level error */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bk-info-box bk-info-box--red"
            style={{ marginBottom: 18 }}
            role="alert"
          >
            <FiAlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{submitError}</p>
              <a
                href="https://wa.me/250788000000"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 13, color: "#25D366", fontWeight: 700,
                }}
              >
                💬 Contact us on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name row */}
      <div style={{
        display: "grid", gap: 18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom: 18,
      }}>
        <div>
          <label className="bk-label" htmlFor="bk-firstName">First Name <span>*</span></label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              id="bk-firstName"
              type="text" name="firstName"
              className={`bk-input${errors.firstName && touched.firstName ? " bk-input--error" : formData.firstName ? " bk-input--verified" : ""}`}
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="given-name"
              aria-invalid={!!(errors.firstName && touched.firstName)}
              aria-describedby={errors.firstName && touched.firstName ? "err-firstName" : undefined}
            />
          </div>
          <FieldError error={errors.firstName} touched={touched.firstName} />
        </div>
        <div>
          <label className="bk-label" htmlFor="bk-lastName">Last Name <span>*</span></label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              id="bk-lastName"
              type="text" name="lastName"
              className={`bk-input${errors.lastName && touched.lastName ? " bk-input--error" : formData.lastName ? " bk-input--verified" : ""}`}
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="family-name"
            />
          </div>
          <FieldError error={errors.lastName} touched={touched.lastName} />
        </div>
      </div>

      {/* Email + verification */}
      <div style={{ marginBottom: 18 }}>
        <label className="bk-label" htmlFor="bk-email">Email Address <span>*</span></label>
        <div className="bk-input-wrap">
          <FiMail size={15} className="bk-input-icon" />
          <input
            id="bk-email"
            type="email" name="email"
            className={[
              "bk-input",
              emailHasError             ? "bk-input--error"    : "",
              emailVerified             ? "bk-input--verified" : "",
            ].filter(Boolean).join(" ")}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            disabled={emailVerified && !isAuthenticated}
            style={{ paddingRight: emailVerified ? 44 : 16 }}
            aria-invalid={!!emailHasError}
          />
          {emailVerified && (
            <div className="bk-input-suffix">
              <FiCheckCircle size={18} color="#059669" />
            </div>
          )}
          {/* Clear to re-verify */}
          {emailVerified && !isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setEmailVerified(false);
                setFormData(p => ({ ...p, email: "" }));
              }}
              style={{
                position: "absolute", right: 44,
                background: "none", border: "none",
                color: "#9ca3af", cursor: "pointer",
                fontSize: 13, fontWeight: 600, padding: "0 4px",
              }}
              title="Change email"
            >
              Change
            </button>
          )}
        </div>
        <FieldError error={errors.email} touched={touched.email} />

        {/* Verification widget */}
        {!isAuthenticated && formData.email && !errors.email && !touched.email_invalid && (
          <EmailVerification
            email={formData.email}
            onVerified={() => setEmailVerified(true)}
            isMobile={isMobile}
          />
        )}

        {emailVerified && !isAuthenticated && (
          <FieldSuccess msg="Email address verified successfully ✓" />
        )}

        {/* Warn if trying to submit without verifying */}
        <AnimatePresence>
          {submitAttempted && !emailVerified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bk-info-box bk-info-box--amber"
              style={{ marginTop: 10 }}
              role="alert"
            >
              <FiAlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0 }}>
                Please verify your email address before submitting.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phone */}
      <div style={{ marginBottom: 18 }}>
        <label className="bk-label" htmlFor="bk-phone">
          Phone Number{" "}
          <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
        </label>
        <div className="bk-input-wrap">
          <FiPhone size={15} className="bk-input-icon" />
          <input
            id="bk-phone"
            type="tel" name="phone"
            className={`bk-input${errors.phone && touched.phone ? " bk-input--error" : formData.phone ? " bk-input--verified" : ""}`}
            placeholder="+1 555 000 0000"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="tel"
          />
        </div>
        <FieldError error={errors.phone} touched={touched.phone} />
        <FieldHint text="Include country code for WhatsApp contact" />
      </div>

      {/* Country + How did you hear */}
      <div style={{
        display: "grid", gap: 18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom: 24,
      }}>
        <div>
          <label className="bk-label" htmlFor="bk-country">Country of Residence</label>
          <div className="bk-input-wrap">
            <FiGlobe size={15} className="bk-input-icon" />
            <select
              id="bk-country"
              name="country"
              className={`bk-select${errors.country && touched.country ? " bk-select--error" : ""}`}
              value={formData.country}
              onChange={handleChange}
              style={{ paddingLeft: 44 }}
            >
              <option value="">Select country…</option>
              {COUNTRIES_LIST.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <FieldError error={errors.country} touched={touched.country} />
        </div>
        <div>
          <label className="bk-label" htmlFor="bk-hear">How did you hear about us?</label>
          <div className="bk-input-wrap">
            <FiMessageCircle size={15} className="bk-input-icon" />
            <select
              id="bk-hear"
              name="hearAboutUs"
              className="bk-select"
              value={formData.hearAboutUs}
              onChange={handleChange}
              style={{ paddingLeft: 44 }}
            >
              <option value="">Select option…</option>
              {HEAR_ABOUT_US.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bk-sep" />

      {/* Terms */}
      <div style={{ marginBottom: 14 }}>
        <label
          className="bk-check-row"
          onClick={() => setFormData(p => ({ ...p, agreeToTerms: !p.agreeToTerms }))}
          style={{ cursor: "pointer" }}
        >
          <div
            className={`bk-check${formData.agreeToTerms ? " bk-check--on" : ""}`}
            style={errors.agreeToTerms && touched.agreeToTerms
              ? { borderColor: "#ef4444" } : {}}
            role="checkbox"
            aria-checked={formData.agreeToTerms}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFormData(p => ({ ...p, agreeToTerms: !p.agreeToTerms }))}
          >
            {formData.agreeToTerms && <FiCheck size={11} color="#fff" strokeWidth={3} />}
          </div>
          <span className="bk-check-label">
            I agree to the{" "}
            <a
              href="/terms" target="_blank"
              style={{ color: "#059669", fontWeight: 700 }}
              onClick={e => e.stopPropagation()}
            >Terms of Service</a>{" "}and{" "}
            <a
              href="/privacy" target="_blank"
              style={{ color: "#059669", fontWeight: 700 }}
              onClick={e => e.stopPropagation()}
            >Privacy Policy</a>
            <span style={{ color: "#ef4444" }}> *</span>
          </span>
        </label>
        <FieldError error={errors.agreeToTerms} touched={touched.agreeToTerms} />
      </div>

      {/* Newsletter */}
      <div style={{ marginBottom: 30 }}>
        <label
          className="bk-check-row"
          onClick={() => setFormData(p => ({ ...p, subscribeNewsletter: !p.subscribeNewsletter }))}
          style={{ cursor: "pointer" }}
        >
          <div
            className={`bk-check${formData.subscribeNewsletter ? " bk-check--on" : ""}`}
            role="checkbox"
            aria-checked={formData.subscribeNewsletter}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFormData(p => ({ ...p, subscribeNewsletter: !p.subscribeNewsletter }))}
          >
            {formData.subscribeNewsletter && <FiCheck size={11} color="#fff" strokeWidth={3} />}
          </div>
          <span className="bk-check-label">
            Send me travel inspiration, exclusive deals and adventure news from Altuvera
          </span>
        </label>
      </div>

      {/* Navigation */}
      <div className="bk-nav">
        <button
          type="button"
          className="bk-btn bk-btn--secondary"
          onClick={prevStep}
          disabled={isSubmitting}
          aria-label="Go back to review"
        >
          <FiArrowLeft size={15} /> Back
        </button>

        <button
          type="submit"
          className="bk-btn bk-btn--primary bk-btn--lg"
          disabled={isSubmitting}
          style={{ minWidth: isMobile ? "100%" : 230 }}
          onClick={handleSubmitClick}
          aria-busy={isSubmitting}
          aria-disabled={!emailVerified}
        >
          {isSubmitting ? (
            <>
              <span className="bk-btn__spinner" />
              Submitting your request…
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
      <div className="bk-trust-row" style={{ marginTop: 18 }}>
        {[
          { Icon: FiLock,   text: "256-bit encrypted" },
          { Icon: FiShield, text: "No payment now"    },
          { Icon: FiInfo,   text: "Free consultation" },
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

const FieldHint = memo(({ text }) =>
  text ? (
    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{text}</p>
  ) : null
);
FieldHint.displayName = "FieldHint";

export default BookingContact;