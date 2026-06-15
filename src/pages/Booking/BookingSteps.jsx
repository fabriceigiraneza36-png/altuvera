// src/pages/Booking/BookingSteps.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";

/* ── Shared sub-components ───────────────────────────────────── */

const FieldError = ({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error">
      <span>⚠</span> {error}
    </p>
  ) : null;

const Counter = ({ value, onChange, min = 0, max = 30, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 0",
    }}
  >
    <span style={{ fontSize: 14.5, fontWeight: 600, color: "#374151" }}>
      {label}
    </span>
    <div className="bk-counter">
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="bk-counter__val">{value}</span>
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

/* ── Step 0 — Trip Details ───────────────────────────────────── */
const StepTrip = ({
  formData,
  setFormData,
  errors,
  touched,
  handleChange,
  handleBlur,
  destinationsList,
  countriesList,
  categoriesList,
  isMobile,
}) => {
  const [destQuery, setDestQuery] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [showDestDrop, setShowDestDrop] = useState(false);
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const destRef = useRef(null);
  const countryRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (!destRef.current?.contains(e.target)) setShowDestDrop(false);
      if (!countryRef.current?.contains(e.target)) setShowCountryDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filteredDests = destinationsList.filter((d) =>
    d.label.toLowerCase().includes(destQuery.toLowerCase()) ||
    d.country.toLowerCase().includes(destQuery.toLowerCase())
  );

  const filteredCountries = countriesList.filter((c) =>
    c.label.toLowerCase().includes(countryQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <span className="bk-step-header__icon">🗺️</span>
        <h2 className="bk-step-header__title">Where would you like to go?</h2>
        <p className="bk-step-header__sub">
          Choose your destination and travel dates. You can pick a specific
          destination or simply select a country to explore.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 22,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        {/* Country Picker */}
        <div ref={countryRef}>
          <label className="bk-label">
            Country <span>*</span>
          </label>
          <div className="bk-dest-search">
            <input
              type="text"
              className={`bk-input${errors.destinationId && touched.destinationId ? " bk-input--error" : ""}`}
              placeholder="🌍 Search countries…"
              value={
                formData.countryId
                  ? countriesList.find((c) => c.value === formData.countryId)
                      ?.label || countryQuery
                  : countryQuery
              }
              onChange={(e) => {
                setCountryQuery(e.target.value);
                setShowCountryDrop(true);
                if (!e.target.value) {
                  setFormData((p) => ({ ...p, countryId: "" }));
                }
              }}
              onFocus={() => setShowCountryDrop(true)}
            />
            {showCountryDrop && filteredCountries.length > 0 && (
              <div className="bk-dest-dropdown">
                {filteredCountries.map((c) => (
                  <div
                    key={c.value}
                    className={`bk-dest-option${formData.countryId === c.value ? " bk-dest-option--active" : ""}`}
                    onClick={() => {
                      setFormData((p) => ({
                        ...p,
                        countryId: c.value,
                        destinationId: "",
                      }));
                      setCountryQuery("");
                      setShowCountryDrop(false);
                    }}
                  >
                    <span style={{ fontSize: 26 }}>
                      {c.flag && !c.flag.startsWith("http") ? c.flag : "🌍"}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>
                        {c.label}
                      </p>
                      {c.region && (
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                          {c.region}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destination Picker */}
        <div ref={destRef}>
          <label className="bk-label">Specific Destination (optional)</label>
          <div className="bk-dest-search">
            <input
              type="text"
              className="bk-input"
              placeholder="🏞️ Search destinations…"
              value={
                formData.destinationId
                  ? destinationsList.find(
                      (d) => d.value === formData.destinationId
                    )?.label || destQuery
                  : destQuery
              }
              onChange={(e) => {
                setDestQuery(e.target.value);
                setShowDestDrop(true);
                if (!e.target.value) {
                  setFormData((p) => ({ ...p, destinationId: "" }));
                }
              }}
              onFocus={() => setShowDestDrop(true)}
            />
            {showDestDrop && filteredDests.length > 0 && (
              <div className="bk-dest-dropdown">
                {filteredDests.slice(0, 20).map((d) => (
                  <div
                    key={d.value}
                    className={`bk-dest-option${formData.destinationId === d.value ? " bk-dest-option--active" : ""}`}
                    onClick={() => {
                      setFormData((p) => ({ ...p, destinationId: d.value }));
                      setDestQuery("");
                      setShowDestDrop(false);
                    }}
                  >
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.label}
                        className="bk-dest-thumb"
                      />
                    ) : (
                      <div
                        className="bk-dest-thumb"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        🏞️
                      </div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>
                        {d.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                        {d.country}
                        {d.duration && ` · ${d.duration}`}
                      </p>
                    </div>
                    {d.rating && (
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#f59e0b",
                          flexShrink: 0,
                        }}
                      >
                        ⭐ {Number(d.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <FieldError error={errors.destinationId} touched={touched.destinationId} />
        </div>
      </div>

      <div className="bk-sep" />

      {/* Dates */}
      <div
        style={{
          display: "grid",
          gap: 22,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}
      >
        <div>
          <label className="bk-label">
            Departure Date <span>*</span>
          </label>
          <div className="bk-date-wrap">
            <input
              type="date"
              name="startDate"
              className={`bk-input${errors.startDate && touched.startDate ? " bk-input--error" : ""}`}
              value={formData.startDate}
              min={today}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <FieldError error={errors.startDate} touched={touched.startDate} />
        </div>

        <div>
          <label className="bk-label">Return Date (optional)</label>
          <div className="bk-date-wrap">
            <input
              type="date"
              name="endDate"
              className={`bk-input${errors.endDate && touched.endDate ? " bk-input--error" : ""}`}
              value={formData.endDate}
              min={formData.startDate || today}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <FieldError error={errors.endDate} touched={touched.endDate} />
        </div>
      </div>

      {/* Flexible dates */}
      <div style={{ marginTop: 16 }}>
        <label
          className="bk-check-row"
          onClick={() =>
            setFormData((p) => ({ ...p, isFlexible: !p.isFlexible }))
          }
        >
          <div
            className={`bk-check${formData.isFlexible ? " bk-check--on" : ""}`}
          >
            {formData.isFlexible && <span className="bk-check__mark">✓</span>}
          </div>
          <div>
            <span className="bk-check-label" style={{ fontWeight: 600 }}>
              My dates are flexible
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
              Check this if you're open to date adjustments for better pricing
            </p>
          </div>
        </label>
      </div>

      {/* Category */}
      {categoriesList.length > 0 && (
        <>
          <div className="bk-sep" />
          <div>
            <label className="bk-label">Trip Category (optional)</label>
            <select
              name="categoryId"
              className="bk-select"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Step 1 — Travelers ──────────────────────────────────────── */
const StepTravelers = ({
  formData,
  setFormData,
  errors,
  touched,
  groupTypes,
  isMobile,
}) => (
  <div className="bk-step-content">
    <div className="bk-step-header">
      <span className="bk-step-header__icon">👥</span>
      <h2 className="bk-step-header__title">Who's coming along?</h2>
      <p className="bk-step-header__sub">
        Tell us about your group so we can tailor the perfect experience for
        everyone.
      </p>
    </div>

    {/* Traveler counts */}
    <div
      style={{
        background: "#f9fafb",
        borderRadius: 18,
        padding: "8px 20px",
        border: "1.5px solid #e5e7eb",
        marginBottom: 24,
      }}
    >
      <Counter
        label="Adults (18+)"
        value={parseInt(formData.adults) || 0}
        onChange={(v) => setFormData((p) => ({ ...p, adults: v }))}
        min={1}
        max={30}
      />
      <div style={{ height: 1, background: "#e5e7eb" }} />
      <Counter
        label="Children (5–17)"
        value={parseInt(formData.children) || 0}
        onChange={(v) => setFormData((p) => ({ ...p, children: v }))}
        min={0}
        max={15}
      />
      <div style={{ height: 1, background: "#e5e7eb" }} />
      <Counter
        label="Infants (0–4)"
        value={parseInt(formData.infants) || 0}
        onChange={(v) => setFormData((p) => ({ ...p, infants: v }))}
        min={0}
        max={5}
      />
    </div>

    {errors.adults && touched.adults && (
      <p className="bk-field-error" style={{ marginBottom: 12 }}>
        ⚠ {errors.adults}
      </p>
    )}

    {/* Total badge */}
    {(formData.adults + formData.children + formData.infants) > 0 && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          background: "#f0fdf4",
          borderRadius: 12,
          marginBottom: 24,
          border: "1px solid #d1fae5",
        }}
      >
        <span style={{ fontSize: 18 }}>👣</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#065f46" }}>
          Total:{" "}
          {parseInt(formData.adults || 0) +
            parseInt(formData.children || 0) +
            parseInt(formData.infants || 0)}{" "}
          traveller
          {parseInt(formData.adults || 0) +
            parseInt(formData.children || 0) +
            parseInt(formData.infants || 0) !==
          1
            ? "s"
            : ""}
        </span>
      </div>
    )}

    {/* Group type */}
    <div>
      <label className="bk-label">Group Type</label>
      <div
        className="bk-opt-grid bk-opt-grid--3"
        style={isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}
      >
        {groupTypes.map((g) => (
          <div
            key={g.value}
            className={`bk-opt-card${formData.groupType === g.value ? " bk-opt-card--active" : ""}`}
            onClick={() =>
              setFormData((p) => ({ ...p, groupType: g.value }))
            }
            role="radio"
            aria-checked={formData.groupType === g.value}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setFormData((p) => ({ ...p, groupType: g.value }))
            }
          >
            <span className="bk-opt-card__icon">{g.icon}</span>
            <span className="bk-opt-card__label">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Step 2 — Preferences ────────────────────────────────────── */
const StepPreferences = ({
  formData,
  setFormData,
  handleChange,
  accommodationTypes,
  interests: interestsList,
  handleInterestToggle,
  isMobile,
}) => (
  <div className="bk-step-content">
    <div className="bk-step-header">
      <span className="bk-step-header__icon">✨</span>
      <h2 className="bk-step-header__title">Personalise your experience</h2>
      <p className="bk-step-header__sub">
        Help us understand your travel style and preferences so we can craft the
        perfect itinerary.
      </p>
    </div>

    {/* Accommodation */}
    <div style={{ marginBottom: 28 }}>
      <label className="bk-label">Accommodation Style</label>
      <div
        className="bk-opt-grid bk-opt-grid--4"
        style={isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}
      >
        {accommodationTypes.map((a) => (
          <div
            key={a.value}
            className={`bk-opt-card${formData.accommodationType === a.value ? " bk-opt-card--active" : ""}`}
            onClick={() =>
              setFormData((p) => ({ ...p, accommodationType: a.value }))
            }
            role="radio"
            aria-checked={formData.accommodationType === a.value}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setFormData((p) => ({ ...p, accommodationType: a.value }))
            }
          >
            <span className="bk-opt-card__icon">{a.icon}</span>
            <span className="bk-opt-card__label">{a.label}</span>
            <span className="bk-opt-card__desc">{a.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="bk-sep" />

    {/* Interests */}
    <div style={{ marginBottom: 28 }}>
      <label className="bk-label">
        What interests you most?{" "}
        <span
          style={{
            fontWeight: 400,
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          (Select all that apply)
        </span>
      </label>
      <div className="bk-interests">
        {interestsList.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`bk-interest${formData.interests.includes(item.value) ? " bk-interest--active" : ""}`}
            onClick={() => handleInterestToggle(item.value)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      {formData.interests.length > 0 && (
        <p
          style={{
            marginTop: 10,
            fontSize: 12.5,
            color: "#059669",
            fontWeight: 600,
          }}
        >
          ✓ {formData.interests.length} interest
          {formData.interests.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>

    <div className="bk-sep" />

    {/* Budget */}
    <div style={{ marginBottom: 24 }}>
      <label className="bk-label">Budget Range (per person)</label>
      <div
        className="bk-opt-grid bk-opt-grid--3"
        style={isMobile ? { gridTemplateColumns: "repeat(2, 1fr)" } : {}}
      >
        {[
          { value: "under-2000", label: "Under $2K", icon: "💵" },
          { value: "2000-5000", label: "$2K – $5K", icon: "💵💵" },
          { value: "5000-10000", label: "$5K – $10K", icon: "💵💵💵" },
          { value: "over-10000", label: "Over $10K", icon: "💎" },
          { value: "flexible", label: "Flexible", icon: "🤝" },
        ].map((b) => (
          <div
            key={b.value}
            className={`bk-opt-card${formData.budgetRange === b.value ? " bk-opt-card--active" : ""}`}
            onClick={() =>
              setFormData((p) => ({ ...p, budgetRange: b.value }))
            }
            role="radio"
            aria-checked={formData.budgetRange === b.value}
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              setFormData((p) => ({ ...p, budgetRange: b.value }))
            }
          >
            <span className="bk-opt-card__icon">{b.icon}</span>
            <span className="bk-opt-card__label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="bk-sep" />

    {/* Special requirements */}
    <div
      style={{
        display: "grid",
        gap: 18,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      }}
    >
      <div>
        <label className="bk-label">Dietary Requirements</label>
        <select
          name="dietaryRequirements"
          className="bk-select"
          value={formData.dietaryRequirements}
          onChange={handleChange}
        >
          <option value="">No restrictions</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="halal">Halal</option>
          <option value="kosher">Kosher</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="other">Other (specify below)</option>
        </select>
      </div>

      <div>
        <label className="bk-label">Special Requests</label>
        <textarea
          name="specialRequests"
          className="bk-textarea"
          placeholder="Anniversary celebrations, accessibility needs, specific wildlife you want to see…"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={3}
          style={{ minHeight: 80 }}
        />
      </div>
    </div>

    {/* Medical */}
    <div style={{ marginTop: 18 }}>
      <label
        className="bk-check-row"
        onClick={() =>
          setFormData((p) => ({
            ...p,
            hasMedicalConditions: !p.hasMedicalConditions,
          }))
        }
      >
        <div
          className={`bk-check${formData.hasMedicalConditions ? " bk-check--on" : ""}`}
        >
          {formData.hasMedicalConditions && (
            <span className="bk-check__mark">✓</span>
          )}
        </div>
        <div>
          <span className="bk-check-label" style={{ fontWeight: 600 }}>
            I have medical conditions to disclose
          </span>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
            This helps us ensure your safety and comfort
          </p>
        </div>
      </label>
      {formData.hasMedicalConditions && (
        <div style={{ marginTop: 12 }}>
          <textarea
            name="medicalDetails"
            className="bk-textarea"
            placeholder="Please briefly describe any relevant medical conditions or needs…"
            value={formData.medicalDetails}
            onChange={handleChange}
            rows={3}
            style={{ minHeight: 80 }}
          />
        </div>
      )}
    </div>
  </div>
);

/* ── Step 3 — Review ─────────────────────────────────────────── */
const StepReview = ({
  formData,
  destinationsList,
  countriesList,
  groupTypes,
  accommodationTypes,
  getTripDuration,
  getTotalVisitors,
  isMobile,
}) => {
  const dest = destinationsList.find((d) => d.value === formData.destinationId);
  const country = countriesList.find((c) => c.value === formData.countryId);
  const groupType = groupTypes.find((g) => g.value === formData.groupType);
  const accom = accommodationTypes.find(
    (a) => a.value === formData.accommodationType
  );
  const duration = getTripDuration();
  const total = getTotalVisitors();

  const rows = [
    {
      key: "Destination",
      val: dest?.label || country?.label || "Not specified",
    },
    {
      key: "Departure",
      val: formData.startDate
        ? new Date(formData.startDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
    {
      key: "Return",
      val: formData.endDate
        ? new Date(formData.endDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Flexible",
    },
    { key: "Duration", val: duration ? `${duration} day${duration !== 1 ? "s" : ""}` : "—" },
    { key: "Travellers", val: `${total} (${formData.adults} adult${formData.adults !== 1 ? "s" : ""}${formData.children ? `, ${formData.children} child${formData.children !== 1 ? "ren" : ""}` : ""}${formData.infants ? `, ${formData.infants} infant${formData.infants !== 1 ? "s" : ""}` : ""})` },
    { key: "Group Type", val: `${groupType?.icon || ""} ${groupType?.label || "—"}` },
    { key: "Accommodation", val: `${accom?.icon || ""} ${accom?.label || "—"}` },
    {
      key: "Budget Range",
      val: formData.budgetRange
        ? formData.budgetRange
            .replace(/-/g, " – $")
            .replace("under – $", "Under $")
            .replace("over – $", "Over $")
        : "Not specified",
    },
    {
      key: "Interests",
      val:
        formData.interests.length > 0
          ? formData.interests.join(", ")
          : "None selected",
    },
    {
      key: "Dietary",
      val: formData.dietaryRequirements || "No restrictions",
    },
    {
      key: "Special Requests",
      val: formData.specialRequests || "None",
    },
  ].filter((r) => r.val && r.val !== "—");

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <span className="bk-step-header__icon">📋</span>
        <h2 className="bk-step-header__title">Review your trip details</h2>
        <p className="bk-step-header__sub">
          Everything look good? You can go back to make changes, or continue to
          fill in your contact details.
        </p>
      </div>

      {dest?.image && (
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            height: isMobile ? 160 : 220,
            marginBottom: 24,
            position: "relative",
          }}
        >
          <img
            src={dest.image}
            alt={dest.label}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
              display: "flex",
              alignItems: "flex-end",
              padding: "20px 22px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#fff",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {dest.label}
              </h3>
              {dest.country && (
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                  {dest.country}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bk-summary">
        {rows.map((row) => (
          <div key={row.key} className="bk-summary__row">
            <span className="bk-summary__key">{row.key}</span>
            <span className="bk-summary__val">{row.val}</span>
          </div>
        ))}
      </div>

      <div className="bk-info-box bk-info-box--green" style={{ marginTop: 20 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <p style={{ margin: 0 }}>
          <strong>No payment required now.</strong> Your booking request is
          completely free. Our travel expert will contact you to discuss
          pricing, availability and customise your itinerary before any
          commitment.
        </p>
      </div>
    </div>
  );
};

/* ── Navigation Bar ──────────────────────────────────────────── */
const NavBar = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isSubmitting,
  isLastStep,
  isMobile,
}) => (
  <div className="bk-nav">
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {currentStep > 0 && (
        <button
          type="button"
          className="bk-btn bk-btn--secondary"
          onClick={onPrev}
          disabled={isSubmitting}
        >
          ← Back
        </button>
      )}
    </div>

    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginLeft: "auto",
      }}
    >
      {/* Step progress text */}
      {!isMobile && (
        <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
      )}

      <button
        type="button"
        className="bk-btn bk-btn--primary"
        onClick={onNext}
        disabled={isSubmitting}
        style={{ minWidth: isMobile ? "100%" : 180 }}
      >
        {isLastStep ? (
          <>
            Continue to Contact
            <span>→</span>
          </>
        ) : (
          <>
            Next Step
            <span>→</span>
          </>
        )}
      </button>
    </div>
  </div>
);

/* ── Main BookingSteps ────────────────────────────────────────── */
const BookingSteps = ({
  currentStep,
  isAnimating,
  formData,
  setFormData,
  errors,
  touched,
  handleChange,
  handleBlur,
  isMobile,
  categoriesList,
  destinationsList,
  countriesList,
  groupTypes,
  accommodationTypes,
  getTripDuration,
  getTotalVisitors,
  interests,
  handleInterestToggle,
  nextStep,
  prevStep,
}) => {
  const stepProps = {
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    isMobile,
  };

  return (
    <>
      {currentStep === 0 && (
        <StepTrip
          {...stepProps}
          destinationsList={destinationsList}
          countriesList={countriesList}
          categoriesList={categoriesList}
        />
      )}
      {currentStep === 1 && (
        <StepTravelers {...stepProps} groupTypes={groupTypes} />
      )}
      {currentStep === 2 && (
        <StepPreferences
          {...stepProps}
          accommodationTypes={accommodationTypes}
          interests={interests}
          handleInterestToggle={handleInterestToggle}
        />
      )}
      {currentStep === 3 && (
        <StepReview
          formData={formData}
          destinationsList={destinationsList}
          countriesList={countriesList}
          groupTypes={groupTypes}
          accommodationTypes={accommodationTypes}
          getTripDuration={getTripDuration}
          getTotalVisitors={getTotalVisitors}
          isMobile={isMobile}
        />
      )}

      <NavBar
        currentStep={currentStep}
        totalSteps={5}
        onPrev={prevStep}
        onNext={nextStep}
        isLastStep={currentStep === 3}
        isMobile={isMobile}
      />
    </>
  );
};

export default BookingSteps;