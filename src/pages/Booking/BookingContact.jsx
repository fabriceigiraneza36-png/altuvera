// src/pages/Booking/BookingContact.jsx
import React from "react";

const FieldError = ({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error">
      <span>⚠</span> {error}
    </p>
  ) : null;

const COUNTRIES_LIST = [
  "United States", "United Kingdom", "Germany", "France", "Canada",
  "Australia", "Netherlands", "Belgium", "Switzerland", "Sweden",
  "Norway", "Denmark", "South Africa", "Kenya", "Rwanda", "Uganda",
  "Tanzania", "Ethiopia", "Other",
];

const HEAR_ABOUT_US = [
  "Google Search", "Instagram", "Facebook", "Twitter/X", "YouTube",
  "Friend / Family Referral", "Travel Blog", "Travel Agent", "TripAdvisor",
  "Direct Email", "Other",
];

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
  const duration = getTripDuration();
  const total = getTotalVisitors();
  const destName = getDestinationName();
  const accom = accommodationTypes?.find(
    (a) => a.value === formData.accommodationType
  );

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <span className="bk-step-header__icon">📬</span>
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
        <div className="bk-info-box bk-info-box--blue" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
          <p style={{ margin: 0 }}>
            <strong>Already have an account?</strong>{" "}
            <button
              type="button"
              onClick={() => openModal("login")}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
                padding: 0,
              }}
            >
              Sign in
            </button>{" "}
            to auto-fill your details.
          </p>
        </div>
      )}

      {/* Trip mini-summary */}
      {(destName || duration || total > 0) && (
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            border: "1.5px solid #a7f3d0",
            borderRadius: 16,
            padding: "14px 20px",
            marginBottom: 28,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            destName && { icon: "🗺️", val: destName },
            duration && { icon: "📅", val: `${duration} days` },
            total > 0 && { icon: "👥", val: `${total} traveller${total !== 1 ? "s" : ""}` },
            accom && { icon: accom.icon, val: accom.label },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#065f46",
                }}
              >
                <span>{item.icon}</span>
                {item.val}
              </div>
            ))}
        </div>
      )}

      {/* Name row */}
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          marginBottom: 18,
        }}
      >
        <div>
          <label className="bk-label">
            First Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="firstName"
            className={`bk-input${errors.firstName && touched.firstName ? " bk-input--error" : ""}`}
            placeholder="Jane"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="given-name"
          />
          <FieldError error={errors.firstName} touched={touched.firstName} />
        </div>
        <div>
          <label className="bk-label">
            Last Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            name="lastName"
            className={`bk-input${errors.lastName && touched.lastName ? " bk-input--error" : ""}`}
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="family-name"
          />
          <FieldError error={errors.lastName} touched={touched.lastName} />
        </div>
      </div>

      {/* Email & Phone */}
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          marginBottom: 18,
        }}
      >
        <div>
          <label className="bk-label">
            Email Address <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            className={`bk-input${errors.email && touched.email ? " bk-input--error" : ""}`}
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
          />
          <FieldError error={errors.email} touched={touched.email} />
        </div>
        <div>
          <label className="bk-label">Phone Number (optional)</label>
          <input
            type="tel"
            name="phone"
            className={`bk-input${errors.phone && touched.phone ? " bk-input--error" : ""}`}
            placeholder="+1 555 000 0000"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="tel"
          />
          <FieldError error={errors.phone} touched={touched.phone} />
        </div>
      </div>

      {/* Country & Hear About */}
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          marginBottom: 24,
        }}
      >
        <div>
          <label className="bk-label">Your Country</label>
          <select
            name="country"
            className="bk-select"
            value={formData.country}
            onChange={handleChange}
          >
            <option value="">Select country…</option>
            {COUNTRIES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="bk-label">How did you hear about us?</label>
          <select
            name="hearAboutUs"
            className="bk-select"
            value={formData.hearAboutUs}
            onChange={handleChange}
          >
            <option value="">Select option…</option>
            {HEAR_ABOUT_US.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div
          className="bk-info-box bk-info-box--amber"
          style={{ marginBottom: 20 }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0 }}>{errors.submit}</p>
        </div>
      )}

      {/* Terms */}
      <div style={{ marginBottom: 20 }}>
        <label
          className="bk-check-row"
          onClick={() =>
            setFormData((p) => ({ ...p, agreeToTerms: !p.agreeToTerms }))
          }
        >
          <div
            className={`bk-check${formData.agreeToTerms ? " bk-check--on" : errors.agreeToTerms && touched.agreeToTerms ? " bk-check--error" : ""}`}
            style={
              errors.agreeToTerms && touched.agreeToTerms
                ? { borderColor: "#ef4444" }
                : {}
            }
          >
            {formData.agreeToTerms && (
              <span className="bk-check__mark">✓</span>
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
        {errors.agreeToTerms && touched.agreeToTerms && (
          <p className="bk-field-error" style={{ marginTop: 6 }}>
            ⚠ {errors.agreeToTerms}
          </p>
        )}
      </div>

      {/* Newsletter */}
      <div style={{ marginBottom: 28 }}>
        <label
          className="bk-check-row"
          onClick={() =>
            setFormData((p) => ({
              ...p,
              subscribeNewsletter: !p.subscribeNewsletter,
            }))
          }
        >
          <div
            className={`bk-check${formData.subscribeNewsletter ? " bk-check--on" : ""}`}
          >
            {formData.subscribeNewsletter && (
              <span className="bk-check__mark">✓</span>
            )}
          </div>
          <span className="bk-check-label">
            Send me travel inspiration, deals and news from Altuvera
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
        >
          ← Back
        </button>

        <button
          type="submit"
          className="bk-btn bk-btn--primary bk-btn--lg"
          disabled={isSubmitting}
          style={{ minWidth: isMobile ? "100%" : 220 }}
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <span className="bk-btn__spinner" />
              Submitting…
            </>
          ) : (
            <>
              🚀 Submit Booking Request
            </>
          )}
        </button>
      </div>

      {/* Trust micro-copy */}
      <p
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 12.5,
          color: "#9ca3af",
          lineHeight: 1.6,
        }}
      >
        🔒 Your data is secure · No payment required · Free consultation
      </p>
    </div>
  );
};

export default BookingContact;