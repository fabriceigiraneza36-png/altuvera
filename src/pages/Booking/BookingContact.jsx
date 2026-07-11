// src/pages/Booking/BookingContact.jsx
/**
 * BookingContact.jsx — v5.0
 * ✅ No OTP — shows EmailVerification info after submit
 * ✅ Verification widget is informational pre-submit,
 *    becomes resend widget post-submit (bookingId passed from parent)
 * ✅ Professional layout, full a11y
 */
import React, {
  useState, useEffect, useCallback, memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser, FiMail, FiPhone, FiGlobe, FiMessageCircle,
  FiSend, FiShield, FiCheck, FiAlertTriangle,
  FiLock, FiArrowLeft, FiZap, FiCheckCircle, FiInfo,
  FiMapPin, FiClock, FiUsers, FiStar,
} from "react-icons/fi";
import EmailVerification from "../../components/booking/EmailVerification";

/* ── Constants ── */
const COUNTRIES_LIST = [
  "United States", "United Kingdom", "Germany", "France", "Canada",
  "Australia", "Netherlands", "Belgium", "Switzerland", "Sweden",
  "Norway", "Denmark", "Austria", "Spain", "Italy", "Portugal",
  "Japan", "Singapore", "UAE", "India", "South Africa", "Kenya",
  "Rwanda", "Uganda", "Tanzania", "Ethiopia", "Nigeria", "Ghana", "Other",
];

const HEAR_ABOUT_US = [
  "Google Search", "Instagram", "Facebook", "Twitter / X", "YouTube",
  "Friend / Family Referral", "Travel Blog", "Travel Agent",
  "TripAdvisor", "Direct Email", "LinkedIn", "Other",
];

/* ── Helpers ── */
const FieldError = memo(({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error" role="alert">
      <FiAlertTriangle size={12} />
      {typeof error === "string" ? error : JSON.stringify(error)}
    </p>
  ) : null
);
FieldError.displayName = "FieldError";

const FieldHint = memo(({ text }) =>
  text ? (
    <p style={{
      margin: "5px 0 0", fontSize: 12,
      color: "#9ca3af", lineHeight: 1.5,
    }}>
      {text}
    </p>
  ) : null
);
FieldHint.displayName = "FieldHint";

/* ── Auto-filled-from-account tag ── */
const AutoFilledTag = () => (
  <span
    title="Auto-completed from your account"
    style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      marginLeft: 8, padding: "2px 7px",
      borderRadius: 999, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.03em", textTransform: "uppercase",
      color: "#047857", background: "#dcfce7",
      border: "1px solid #a7f3d0", verticalAlign: "middle",
    }}
  >
    <FiZap size={9} /> Auto-filled
  </span>
);

/* ── Trip mini summary ── */
const TripMiniSummary = memo(({
  formData, getTripDuration, getTotalVisitors,
  getDestinationName, accommodationTypes,
}) => {
  const duration = getTripDuration?.();
  const total    = getTotalVisitors?.();
  const destName = getDestinationName?.();
  const accom    = accommodationTypes?.find(
    (a) => a.value === formData.accommodationType
  );

  const items = [
    destName && { Icon: FiMapPin, val: destName },
    duration && { Icon: FiClock,  val: `${duration} day${duration !== 1 ? "s" : ""}` },
    total > 0 && { Icon: FiUsers, val: `${total} traveller${total !== 1 ? "s" : ""}` },
    accom    && { Icon: FiStar,   val: accom.label },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      border: "1.5px solid #a7f3d0",
      borderRadius: 16,
      padding: "14px 20px",
      marginBottom: 24,
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      alignItems: "center",
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

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
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
  /* fields auto-completed from the logged-in user's account */
  prefilledFields = {},
  /* bookingId — provided after successful submission for resend */
  bookingId,
}) => {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleSubmitClick = useCallback((e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    onSubmit(e);
  }, [onSubmit]);

  return (
    <div className="bk-step-content">

      {/* ── Header ── */}
      <div className="bk-step-header">
        <div className="bk-step-header__icon-wrap">
          <FiMail size={22} />
        </div>
        <h2 className="bk-step-header__title">
          {displayName
            ? `Almost there, ${displayName.split(" ")[0]}!`
            : "Your contact details"}
        </h2>
        <p className="bk-step-header__sub">
          We'll use these to send your booking confirmation and reach you to
          finalise your perfect itinerary.{" "}
          <strong style={{ color: "#059669" }}>No payment required now.</strong>
        </p>
      </div>

      {/* ── Sign-in shortcut ── */}
      {!isAuthenticated && typeof openModal === "function" && (
        <div
          className="bk-info-box bk-info-box--blue"
          style={{ marginBottom: 22 }}
        >
          <FiZap size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0 }}>
            <strong>Already have an account?</strong>{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              style={{
                background: "none", border: "none",
                color: "#2563eb", fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit", padding: 0,
              }}
            >
              Sign in
            </button>{" "}
            to auto-fill your details and skip email verification.
          </p>
        </div>
      )}

      {/* ── Auto-completed notice (logged-in users) ── */}
      {isAuthenticated && Object.keys(prefilledFields).length > 0 && (
        <div
          className="bk-info-box bk-info-box--green"
          style={{ marginBottom: 22 }}
          role="status"
        >
          <FiCheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0 }}>
            <strong>Your details were auto-completed</strong> from your
            Altuvera account. Review them below and update if needed.
          </p>
        </div>
      )}

      {/* ── Trip summary pill ── */}
      <TripMiniSummary
        formData={formData}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
      />

      {/* ── Submit-level error ── */}
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
              <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
                {typeof submitError === "string"
                  ? submitError
                  : submitError?.message || "An error occurred. Please try again."}
              </p>
              <a
                href="https://wa.me/250785751391"
                target="_blank" rel="noopener noreferrer"
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

      {/* ── Name row ── */}
      <div style={{
        display: "grid", gap: 18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom: 18,
      }}>
        <div>
          <label className="bk-label" htmlFor="bk-firstName">
            First Name <span>*</span>
            {prefilledFields.firstName && <AutoFilledTag />}
          </label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              id="bk-firstName"
              type="text"
              name="firstName"
              className={[
                "bk-input",
                errors.firstName && touched.firstName ? "bk-input--error" : "",
                formData.firstName && !errors.firstName ? "bk-input--verified" : "",
              ].filter(Boolean).join(" ")}
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="given-name"
              aria-required="true"
              aria-invalid={!!(errors.firstName && touched.firstName)}
            />
          </div>
          <FieldError error={errors.firstName} touched={touched.firstName} />
        </div>

        <div>
          <label className="bk-label" htmlFor="bk-lastName">
            Last Name <span>*</span>
            {prefilledFields.lastName && <AutoFilledTag />}
          </label>
          <div className="bk-input-wrap">
            <FiUser size={15} className="bk-input-icon" />
            <input
              id="bk-lastName"
              type="text"
              name="lastName"
              className={[
                "bk-input",
                errors.lastName && touched.lastName ? "bk-input--error" : "",
                formData.lastName && !errors.lastName ? "bk-input--verified" : "",
              ].filter(Boolean).join(" ")}
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="family-name"
              aria-required="true"
            />
          </div>
          <FieldError error={errors.lastName} touched={touched.lastName} />
        </div>
      </div>

      {/* ── Email ── */}
      <div style={{ marginBottom: 18 }}>
          <label className="bk-label" htmlFor="bk-email">
            Email Address <span>*</span>
            {prefilledFields.email && <AutoFilledTag />}
          </label>
        <div className="bk-input-wrap">
          <FiMail size={15} className="bk-input-icon" />
          <input
            id="bk-email"
            type="email"
            name="email"
            className={[
              "bk-input",
              errors.email && touched.email ? "bk-input--error" : "",
              formData.email && !errors.email ? "bk-input--verified" : "",
            ].filter(Boolean).join(" ")}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!(errors.email && touched.email)}
          />
        </div>
        <FieldError error={errors.email} touched={touched.email} />

        {/* Email verification info widget */}
        {!isAuthenticated &&
          formData.email &&
          !errors.email && (
            <EmailVerification
              email={formData.email}
              bookingId={bookingId}
              isMobile={isMobile}
            />
          )}

        {/* Authenticated — already verified */}
        {isAuthenticated && (
          <p className="bk-field-success">
            <FiCheckCircle size={12} />
            Email verified via your account ✓
          </p>
        )}
      </div>

      {/* ── Phone ── */}
      <div style={{ marginBottom: 18 }}>
          <label className="bk-label" htmlFor="bk-phone">
            Phone Number{" "}
            <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
            {prefilledFields.phone && <AutoFilledTag />}
          </label>
        <div className="bk-input-wrap">
          <FiPhone size={15} className="bk-input-icon" />
          <input
            id="bk-phone"
            type="tel"
            name="phone"
            className={[
              "bk-input",
              errors.phone && touched.phone ? "bk-input--error" : "",
              formData.phone && !errors.phone ? "bk-input--verified" : "",
            ].filter(Boolean).join(" ")}
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

      {/* ── Country + How did you hear ── */}
      <div style={{
        display: "grid", gap: 18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom: 24,
      }}>
        <div>
          <label className="bk-label" htmlFor="bk-country">
            Country of Residence
            {prefilledFields.country && <AutoFilledTag />}
          </label>
          <div className="bk-input-wrap">
            <FiGlobe size={15} className="bk-input-icon" />
            <select
              id="bk-country"
              name="country"
              className={[
                "bk-select",
                errors.country && touched.country ? "bk-select--error" : "",
              ].filter(Boolean).join(" ")}
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select country…</option>
              {COUNTRIES_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <FieldError error={errors.country} touched={touched.country} />
        </div>

        <div>
          <label className="bk-label" htmlFor="bk-hear">
            How did you hear about us?
          </label>
          <div className="bk-input-wrap">
            <FiMessageCircle size={15} className="bk-input-icon" />
            <select
              id="bk-hear"
              name="hearAboutUs"
              className="bk-select"
              value={formData.hearAboutUs || ""}
              onChange={handleChange}
            >
              <option value="">Select…</option>
              {HEAR_ABOUT_US.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bk-sep" />

      {/* ── Terms ── */}
      <div style={{ marginBottom: 14 }}>
        <label
          className="bk-check-row"
          style={{
            cursor: "pointer",
            borderColor: errors.agreeToTerms && touched.agreeToTerms
              ? "#ef4444" : undefined,
          }}
          onClick={() =>
            setFormData((p) => ({ ...p, agreeToTerms: !p.agreeToTerms }))
          }
        >
          <div
            className={`bk-check${formData.agreeToTerms ? " bk-check--on" : ""}`}
            role="checkbox"
            aria-checked={formData.agreeToTerms}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setFormData((p) => ({ ...p, agreeToTerms: !p.agreeToTerms }))
            }
          >
            {formData.agreeToTerms && (
              <FiCheck size={11} color="#fff" strokeWidth={3} />
            )}
          </div>
          <span className="bk-check-label">
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              style={{ color: "#059669", fontWeight: 700 }}
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              style={{ color: "#059669", fontWeight: 700 }}
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
            <span style={{ color: "#ef4444" }}> *</span>
          </span>
        </label>
        <FieldError error={errors.agreeToTerms} touched={touched.agreeToTerms} />
      </div>

      {/* ── Newsletter ── */}
      <div style={{ marginBottom: 30 }}>
        <label
          className="bk-check-row"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setFormData((p) => ({
              ...p,
              subscribeNewsletter: !p.subscribeNewsletter,
            }))
          }
        >
          <div
            className={`bk-check${formData.subscribeNewsletter ? " bk-check--on" : ""}`}
            role="checkbox"
            aria-checked={!!formData.subscribeNewsletter}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setFormData((p) => ({
                ...p,
                subscribeNewsletter: !p.subscribeNewsletter,
              }))
            }
          >
            {formData.subscribeNewsletter && (
              <FiCheck size={11} color="#fff" strokeWidth={3} />
            )}
          </div>
          <span className="bk-check-label">
            Send me travel inspiration, exclusive deals and adventure news
          </span>
        </label>
      </div>

      {/* ── Email verification info pre-submit ── */}
      {!isAuthenticated && !bookingId && (
        <div
          className="bk-info-box bk-info-box--green"
          style={{ marginBottom: 20 }}
        >
          <FiInfo size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0 }}>
            After submitting, you'll receive a{" "}
            <strong>verification link</strong> by email.
            Click it to confirm your booking — no codes to enter.
          </p>
        </div>
      )}

      {/* ── Nav ── */}
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
        >
          {isSubmitting ? (
            <>
              <span className="bk-btn__spinner" />
              Submitting your request…
            </>
          ) : (
            <>
              <FiSend size={15} />
              Submit Booking Request
            </>
          )}
        </button>
      </div>

      {/* ── Trust micro-copy ── */}
      <div className="bk-trust-row" style={{ marginTop: 18 }}>
        {[
          { Icon: FiLock,    text: "256-bit encrypted" },
          { Icon: FiShield,  text: "No payment now"    },
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