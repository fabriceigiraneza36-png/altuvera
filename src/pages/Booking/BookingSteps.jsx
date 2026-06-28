// src/pages/Booking/BookingSteps.jsx
import React, {
  useState, useRef, useEffect, useCallback, memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════════════════════════ */
const FieldError = memo(({ error, touched }) =>
  error && touched ? (
    <p className="bk-field-error" role="alert">
      <span aria-hidden="true">⚠</span> {error}
    </p>
  ) : null
);
FieldError.displayName = "FieldError";

const FieldHint = memo(({ text }) =>
  text ? (
    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
      {text}
    </p>
  ) : null
);
FieldHint.displayName = "FieldHint";

const Counter = memo(({ value, onChange, min = 0, max = 30, label, hint }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 0",
  }}>
    <div>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: "#374151" }}>
        {label}
      </span>
      {hint && (
        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#9ca3af" }}>{hint}</p>
      )}
    </div>
    <div className="bk-counter">
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >−</button>
      <span className="bk-counter__val" aria-live="polite">{value}</span>
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >+</button>
    </div>
  </div>
));
Counter.displayName = "Counter";

const SectionCard = memo(({ children, style }) => (
  <div style={{
    background: "#f9fafb",
    borderRadius: 18,
    padding: "6px 20px",
    border: "1.5px solid #e5e7eb",
    marginBottom: 24,
    ...style,
  }}>
    {children}
  </div>
));
SectionCard.displayName = "SectionCard";

/* ══════════════════════════════════════════════════════════════
   STEP 0 — TRIP DETAILS
══════════════════════════════════════════════════════════════ */
const StepTrip = memo(({
  formData, setFormData, errors, touched,
  handleChange, handleBlur,
  destinationsList, countriesList, categoriesList,
  isMobile,
}) => {
  const [destQuery,        setDestQuery]        = useState("");
  const [countryQuery,     setCountryQuery]     = useState("");
  const [showDestDrop,     setShowDestDrop]     = useState(false);
  const [showCountryDrop,  setShowCountryDrop]  = useState(false);
  const destRef    = useRef(null);
  const countryRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (!destRef.current?.contains(e.target))    setShowDestDrop(false);
      if (!countryRef.current?.contains(e.target)) setShowCountryDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filteredDests = (destinationsList || []).filter((d) => {
    const q = destQuery.toLowerCase();
    return d.label?.toLowerCase().includes(q) || d.country?.toLowerCase().includes(q);
  });

  const filteredCountries = (countriesList || []).filter((c) => {
    const q = countryQuery.toLowerCase();
    return c.label?.toLowerCase().includes(q) || c.region?.toLowerCase().includes(q);
  });

  const selectedCountry = countriesList?.find(c => c.value === formData.countryId);
  const selectedDest    = destinationsList?.find(d => d.value === formData.destinationId);
  const today = new Date().toISOString().split("T")[0];

  const handleCountrySelect = useCallback((c) => {
    setFormData(p => ({ ...p, countryId: c.value, destinationId: "" }));
    setCountryQuery("");
    setShowCountryDrop(false);
  }, [setFormData]);

  const handleDestSelect = useCallback((d) => {
    setFormData(p => ({ ...p, destinationId: d.value, countryId: d.countryId || p.countryId }));
    setDestQuery("");
    setShowDestDrop(false);
  }, [setFormData]);

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <div className="bk-step-header__icon-wrap">
          <span style={{ fontSize: 26 }}>🗺️</span>
        </div>
        <h2 className="bk-step-header__title">Where would you like to go?</h2>
        <p className="bk-step-header__sub">
          Choose your dream destination and travel dates. Select a specific
          destination or simply choose a country to explore.
        </p>
      </div>

      {/* Destination selectors */}
      <div style={{
        display: "grid", gap: 22,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        marginBottom: 8,
      }}>
        {/* Country picker */}
        <div ref={countryRef}>
          <label className="bk-label">Country <span>*</span></label>
          <div className="bk-dest-search">
            <input
              type="text"
              className={`bk-input${errors.countryId && touched.countryId ? " bk-input--error" : selectedCountry ? " bk-input--verified" : ""}`}
              placeholder="🌍 Search countries…"
              value={selectedCountry ? selectedCountry.label : countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value);
                setShowCountryDrop(true);
                if (!e.target.value) setFormData(p => ({ ...p, countryId: "" }));
              }}
              onFocus={() => {
                if (!selectedCountry) setShowCountryDrop(true);
              }}
              aria-label="Search countries"
              aria-expanded={showCountryDrop}
              aria-autocomplete="list"
            />
            {selectedCountry && (
              <button
                type="button"
                onClick={() => {
                  setFormData(p => ({ ...p, countryId: "", destinationId: "" }));
                  setCountryQuery("");
                }}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "#9ca3af", cursor: "pointer",
                  fontSize: 16, padding: 0,
                }}
                aria-label="Clear country"
              >×</button>
            )}
            <AnimatePresence>
              {showCountryDrop && filteredCountries.length > 0 && (
                <motion.div
                  className="bk-dest-dropdown"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  role="listbox"
                >
                  {filteredCountries.slice(0, 30).map((c) => (
                    <div
                      key={c.value}
                      className={`bk-dest-option${formData.countryId === c.value ? " bk-dest-option--active" : ""}`}
                      onClick={() => handleCountrySelect(c)}
                      role="option"
                      aria-selected={formData.countryId === c.value}
                    >
                      <span style={{ fontSize: 24, flexShrink: 0 }}>
                        {c.flag && !c.flag.startsWith("http") ? c.flag : "🌍"}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>
                          {c.label}
                        </p>
                        {c.region && (
                          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{c.region}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <FieldError error={errors.countryId} touched={touched.countryId} />
        </div>

        {/* Destination picker */}
        <div ref={destRef}>
          <label className="bk-label">Specific Destination <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
          <div className="bk-dest-search" style={{ position: "relative" }}>
            <input
              type="text"
              className={`bk-input${selectedDest ? " bk-input--verified" : ""}`}
              placeholder="🏞️ Search destinations…"
              value={selectedDest ? selectedDest.label : destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setShowDestDrop(true);
                if (!e.target.value) setFormData(p => ({ ...p, destinationId: "" }));
              }}
              onFocus={() => {
                if (!selectedDest) setShowDestDrop(true);
              }}
              aria-label="Search destinations"
              aria-expanded={showDestDrop}
            />
            {selectedDest && (
              <button
                type="button"
                onClick={() => {
                  setFormData(p => ({ ...p, destinationId: "" }));
                  setDestQuery("");
                }}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: 0,
                }}
                aria-label="Clear destination"
              >×</button>
            )}
            <AnimatePresence>
              {showDestDrop && filteredDests.length > 0 && (
                <motion.div
                  className="bk-dest-dropdown"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  role="listbox"
                >
                  {filteredDests.slice(0, 20).map((d) => (
                    <div
                      key={d.value}
                      className={`bk-dest-option${formData.destinationId === d.value ? " bk-dest-option--active" : ""}`}
                      onClick={() => handleDestSelect(d)}
                      role="option"
                      aria-selected={formData.destinationId === d.value}
                    >
                      {d.image ? (
                        <img src={d.image} alt={d.label} className="bk-dest-thumb" />
                      ) : (
                        <div className="bk-dest-thumb" style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 20,
                        }}>🏞️</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>
                          {d.label}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                          {d.country}{d.duration && ` · ${d.duration}`}
                        </p>
                      </div>
                      {d.rating && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: "#f59e0b",
                          flexShrink: 0, marginLeft: "auto",
                        }}>
                          ⭐ {Number(d.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Validation hint */}
      {errors.destinationId && touched.destinationId && (
        <FieldError error={errors.destinationId} touched={true} />
      )}

      <div className="bk-sep" />

      {/* Flexible dates toggle */}
      <div style={{ marginBottom: 20 }}>
        <label
          className="bk-check-row"
          onClick={() => setFormData(p => ({ ...p, isFlexible: !p.isFlexible }))}
        >
          <div className={`bk-check${formData.isFlexible ? " bk-check--on" : ""}`}>
            {formData.isFlexible && <span className="bk-check__mark">✓</span>}
          </div>
          <div>
            <span className="bk-check-label" style={{ fontWeight: 700 }}>
              My dates are flexible
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
              Open to adjustments for better availability and pricing
            </p>
          </div>
        </label>
      </div>

      {/* Date inputs */}
      <AnimatePresence mode="wait">
        {!formData.isFlexible ? (
          <motion.div
            key="fixed-dates"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "grid", gap: 22,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div>
              <label className="bk-label">Departure Date <span>*</span></label>
              <input
                type="date"
                name="startDate"
                className={`bk-input${errors.startDate && touched.startDate ? " bk-input--error" : formData.startDate ? " bk-input--verified" : ""}`}
                value={formData.startDate}
                min={today}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-label="Departure date"
              />
              <FieldError error={errors.startDate} touched={touched.startDate} />
            </div>
            <div>
              <label className="bk-label">
                Return Date{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="date"
                name="endDate"
                className={`bk-input${errors.endDate && touched.endDate ? " bk-input--error" : formData.endDate ? " bk-input--verified" : ""}`}
                value={formData.endDate}
                min={formData.startDate || today}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-label="Return date"
              />
              <FieldError error={errors.endDate} touched={touched.endDate} />
              {formData.startDate && formData.endDate && (
                <p style={{ margin: "5px 0 0", fontSize: 12, color: "#059669", fontWeight: 600 }}>
                  {(() => {
                    const d = Math.round(
                      (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000
                    );
                    return d > 0 ? `✓ ${d} day${d !== 1 ? "s" : ""} trip` : null;
                  })()}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="flexible-months"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <label className="bk-label">Preferred Months <span>*</span></label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6,
            }}>
              {[
                "Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec",
              ].map((m) => {
                const active = (formData.flexibleMonths || []).includes(m.toLowerCase());
                return (
                  <button
                    key={m}
                    type="button"
                    className={`bk-interest${active ? " bk-interest--active" : ""}`}
                    style={{ padding: "7px 14px", fontSize: 13 }}
                    onClick={() => {
                      const ml = m.toLowerCase();
                      setFormData(p => ({
                        ...p,
                        flexibleMonths: active
                          ? (p.flexibleMonths || []).filter(x => x !== ml)
                          : [...(p.flexibleMonths || []), ml],
                      }));
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <FieldError error={errors.flexibleMonths} touched={touched.flexibleMonths} />
            {(formData.flexibleMonths || []).length > 0 && (
              <p style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 }}>
                ✓ {formData.flexibleMonths.length} month{formData.flexibleMonths.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category */}
      {categoriesList?.length > 0 && (
        <>
          <div className="bk-sep" />
          <div>
            <label className="bk-label">Trip Category <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
            <select
              name="categoryId"
              className="bk-select"
              value={formData.categoryId}
              onChange={handleChange}
              aria-label="Trip category"
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
});
StepTrip.displayName = "StepTrip";

/* ══════════════════════════════════════════════════════════════
   STEP 1 — TRAVELERS
══════════════════════════════════════════════════════════════ */
const StepTravelers = memo(({
  formData, setFormData, errors, touched, groupTypes, isMobile,
}) => {
  const total = (parseInt(formData.adults) || 0)
    + (parseInt(formData.children) || 0)
    + (parseInt(formData.infants) || 0);

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <div className="bk-step-header__icon-wrap">
          <span style={{ fontSize: 26 }}>👥</span>
        </div>
        <h2 className="bk-step-header__title">Who's coming along?</h2>
        <p className="bk-step-header__sub">
          Tell us about your group so we can tailor the perfect experience.
        </p>
      </div>

      {/* Traveler counters */}
      <SectionCard>
        <Counter
          label="Adults"
          hint="Ages 18+"
          value={parseInt(formData.adults) || 0}
          onChange={(v) => setFormData(p => ({ ...p, adults: v }))}
          min={1}
          max={30}
        />
        <div style={{ height: 1, background: "#e5e7eb" }} />
        <Counter
          label="Children"
          hint="Ages 5–17"
          value={parseInt(formData.children) || 0}
          onChange={(v) => setFormData(p => ({ ...p, children: v }))}
          min={0}
          max={15}
        />
        <div style={{ height: 1, background: "#e5e7eb" }} />
        <Counter
          label="Infants"
          hint="Ages 0–4"
          value={parseInt(formData.infants) || 0}
          onChange={(v) => setFormData(p => ({ ...p, infants: v }))}
          min={0}
          max={5}
        />
      </SectionCard>

      <FieldError error={errors.adults} touched={touched.adults} />

      {/* Total badge */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 18px",
              background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderRadius: 12, marginBottom: 24,
              border: "1.5px solid #a7f3d0",
            }}
          >
            <span style={{ fontSize: 20 }}>👣</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>
              {total} traveller{total !== 1 ? "s" : ""} total
            </span>
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>
              {formData.adults > 0 && `${formData.adults} adult${formData.adults !== 1 ? "s" : ""}`}
              {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? "ren" : ""}`}
              {formData.infants > 0 && `, ${formData.infants} infant${formData.infants !== 1 ? "s" : ""}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group type */}
      <div>
        <label className="bk-label">Group Type <span>*</span></label>
        <div
          className="bk-opt-grid bk-opt-grid--3"
          style={isMobile ? { gridTemplateColumns: "repeat(2,1fr)" } : {}}
          role="radiogroup"
          aria-label="Group type"
        >
          {(groupTypes || []).map((g) => (
            <div
              key={g.value}
              className={`bk-opt-card${formData.groupType === g.value ? " bk-opt-card--active" : ""}`}
              onClick={() => setFormData(p => ({ ...p, groupType: g.value }))}
              role="radio"
              aria-checked={formData.groupType === g.value}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setFormData(p => ({ ...p, groupType: g.value }))}
            >
              <span className="bk-opt-card__icon" style={{ fontSize: 28 }}>{g.icon}</span>
              <span className="bk-opt-card__label">{g.label}</span>
            </div>
          ))}
        </div>
        <FieldError error={errors.groupType} touched={touched.groupType} />
      </div>
    </div>
  );
});
StepTravelers.displayName = "StepTravelers";

/* ══════════════════════════════════════════════════════════════
   STEP 2 — PREFERENCES
══════════════════════════════════════════════════════════════ */
const BUDGET_OPTIONS = [
  { value: "under-2000",  label: "Under $2K",    icon: "💵"     },
  { value: "2000-5000",   label: "$2K – $5K",    icon: "💵💵"   },
  { value: "5000-10000",  label: "$5K – $10K",   icon: "💵💵💵" },
  { value: "over-10000",  label: "Over $10K",    icon: "💎"     },
  { value: "flexible",    label: "Flexible",     icon: "🤝"     },
];

const StepPreferences = memo(({
  formData, setFormData, handleChange,
  accommodationTypes, interests: interestsList,
  handleInterestToggle, isMobile,
}) => (
  <div className="bk-step-content">
    <div className="bk-step-header">
      <div className="bk-step-header__icon-wrap">
        <span style={{ fontSize: 26 }}>✨</span>
      </div>
      <h2 className="bk-step-header__title">Personalise your experience</h2>
      <p className="bk-step-header__sub">
        Help us craft the perfect itinerary by sharing your travel style and preferences.
      </p>
    </div>

    {/* Accommodation */}
    <div style={{ marginBottom: 28 }}>
      <label className="bk-label">Accommodation Style <span>*</span></label>
      <div
        className="bk-opt-grid bk-opt-grid--4"
        style={isMobile ? { gridTemplateColumns: "repeat(2,1fr)" } : {}}
        role="radiogroup"
        aria-label="Accommodation style"
      >
        {(accommodationTypes || []).map((a) => (
          <div
            key={a.value}
            className={`bk-opt-card${formData.accommodationType === a.value ? " bk-opt-card--active" : ""}`}
            onClick={() => setFormData(p => ({ ...p, accommodationType: a.value }))}
            role="radio"
            aria-checked={formData.accommodationType === a.value}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFormData(p => ({ ...p, accommodationType: a.value }))}
          >
            <span className="bk-opt-card__icon" style={{ fontSize: 28 }}>{a.icon}</span>
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
        <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 12 }}>
          (Select all that apply)
        </span>
      </label>
      <div className="bk-interests" role="group" aria-label="Interests">
        {(interestsList || []).map((item) => (
          <button
            key={item.value}
            type="button"
            className={`bk-interest${formData.interests?.includes(item.value) ? " bk-interest--active" : ""}`}
            onClick={() => handleInterestToggle(item.value)}
            aria-pressed={formData.interests?.includes(item.value)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      {(formData.interests?.length > 0) && (
        <p style={{ marginTop: 10, fontSize: 12.5, color: "#059669", fontWeight: 700 }}>
          ✓ {formData.interests.length} interest{formData.interests.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>

    <div className="bk-sep" />

    {/* Budget */}
    <div style={{ marginBottom: 24 }}>
      <label className="bk-label">Budget Range (per person) <span>*</span></label>
      <div
        className="bk-opt-grid bk-opt-grid--3"
        style={isMobile ? { gridTemplateColumns: "repeat(2,1fr)" } : {}}
        role="radiogroup"
        aria-label="Budget range"
      >
        {BUDGET_OPTIONS.map((b) => (
          <div
            key={b.value}
            className={`bk-opt-card${formData.budgetRange === b.value ? " bk-opt-card--active" : ""}`}
            onClick={() => setFormData(p => ({ ...p, budgetRange: b.value }))}
            role="radio"
            aria-checked={formData.budgetRange === b.value}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setFormData(p => ({ ...p, budgetRange: b.value }))}
          >
            <span className="bk-opt-card__icon" style={{ fontSize: 24 }}>{b.icon}</span>
            <span className="bk-opt-card__label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="bk-sep" />

    {/* Special requirements */}
    <div style={{
      display: "grid", gap: 18,
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      marginBottom: 20,
    }}>
      <div>
        <label className="bk-label">Dietary Requirements</label>
        <select
          name="dietaryRequirements"
          className="bk-select"
          value={formData.dietaryRequirements}
          onChange={handleChange}
        >
          <option value="">No restrictions</option>
          <option value="vegetarian">🥦 Vegetarian</option>
          <option value="vegan">🌱 Vegan</option>
          <option value="halal">☪️ Halal</option>
          <option value="kosher">✡️ Kosher</option>
          <option value="gluten-free">🌾 Gluten-Free</option>
          <option value="nut-allergy">🥜 Nut Allergy</option>
          <option value="other">💬 Other</option>
        </select>
      </div>
      <div>
        <label className="bk-label">Special Requests</label>
        <textarea
          name="specialRequests"
          className="bk-textarea"
          placeholder="Anniversary celebrations, accessibility needs, wildlife wishlist…"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={3}
          style={{ minHeight: 80 }}
          aria-label="Special requests"
        />
      </div>
    </div>

    {/* Medical */}
    <div>
      <label
        className="bk-check-row"
        onClick={() => setFormData(p => ({ ...p, hasMedicalConditions: !p.hasMedicalConditions }))}
      >
        <div className={`bk-check${formData.hasMedicalConditions ? " bk-check--on" : ""}`}>
          {formData.hasMedicalConditions && <span className="bk-check__mark">✓</span>}
        </div>
        <div>
          <span className="bk-check-label" style={{ fontWeight: 700 }}>
            I have medical conditions to disclose
          </span>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#9ca3af" }}>
            Helps us ensure your safety and comfort
          </p>
        </div>
      </label>
      <AnimatePresence>
        {formData.hasMedicalConditions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 12, overflow: "hidden" }}
          >
            <textarea
              name="medicalDetails"
              className="bk-textarea"
              placeholder="Briefly describe relevant medical conditions or needs…"
              value={formData.medicalDetails}
              onChange={handleChange}
              rows={3}
              style={{ minHeight: 80 }}
              aria-label="Medical details"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
));
StepPreferences.displayName = "StepPreferences";

/* ══════════════════════════════════════════════════════════════
   STEP 3 — REVIEW
══════════════════════════════════════════════════════════════ */
const StepReview = memo(({
  formData, destinationsList, countriesList,
  groupTypes, accommodationTypes,
  getTripDuration, getTotalVisitors, isMobile,
}) => {
  const dest      = destinationsList?.find(d => d.value === formData.destinationId);
  const country   = countriesList?.find(c => c.value === formData.countryId);
  const groupType = groupTypes?.find(g => g.value === formData.groupType);
  const accom     = accommodationTypes?.find(a => a.value === formData.accommodationType);
  const duration  = getTripDuration?.();
  const total     = getTotalVisitors?.();

  const budgetLabel = formData.budgetRange
    ? {
        "under-2000":  "Under $2,000",
        "2000-5000":   "$2,000 – $5,000",
        "5000-10000":  "$5,000 – $10,000",
        "over-10000":  "Over $10,000",
        "flexible":    "Flexible",
      }[formData.budgetRange] || formData.budgetRange
    : null;

  const rows = [
    {
      key: "📍 Destination",
      val: dest?.label || country?.label || "Not specified",
    },
    formData.isFlexible
      ? { key: "📅 Dates", val: `Flexible — ${(formData.flexibleMonths || []).join(", ") || "Any"}` }
      : {
          key: "📅 Departure",
          val: formData.startDate
            ? new Date(formData.startDate).toLocaleDateString("en-US", {
                weekday: "short", year: "numeric", month: "long", day: "numeric",
              })
            : "—",
        },
    !formData.isFlexible && formData.endDate && {
      key: "🏁 Return",
      val: new Date(formData.endDate).toLocaleDateString("en-US", {
        weekday: "short", year: "numeric", month: "long", day: "numeric",
      }),
    },
    duration && { key: "⏱️ Duration", val: `${duration} day${duration !== 1 ? "s" : ""}` },
    {
      key: "👥 Travellers",
      val: `${total} (${formData.adults} adult${formData.adults !== 1 ? "s" : ""}${
        formData.children ? `, ${formData.children} child${formData.children !== 1 ? "ren" : ""}` : ""
      }${formData.infants ? `, ${formData.infants} infant${formData.infants !== 1 ? "s" : ""}` : ""})`,
    },
    groupType && { key: "🧳 Group Type", val: `${groupType.icon} ${groupType.label}` },
    accom     && { key: "🏨 Accommodation", val: `${accom.icon} ${accom.label}` },
    budgetLabel && { key: "💰 Budget Range", val: budgetLabel },
    formData.interests?.length > 0 && {
      key: "✨ Interests",
      val: formData.interests.join(", "),
    },
    formData.dietaryRequirements && {
      key: "🍽️ Dietary",
      val: formData.dietaryRequirements,
    },
    formData.specialRequests && {
      key: "💬 Special Requests",
      val: formData.specialRequests,
    },
  ].filter(Boolean);

  return (
    <div className="bk-step-content">
      <div className="bk-step-header">
        <div className="bk-step-header__icon-wrap">
          <span style={{ fontSize: 26 }}>📋</span>
        </div>
        <h2 className="bk-step-header__title">Review your trip details</h2>
        <p className="bk-step-header__sub">
          Everything look good? Go back to edit anything, or continue to fill in
          your contact details to complete your booking request.
        </p>
      </div>

      {/* Destination hero image */}
      {dest?.image && (
        <div style={{
          borderRadius: 18, overflow: "hidden",
          height: isMobile ? 160 : 220,
          marginBottom: 24, position: "relative",
        }}>
          <img
            src={dest.image}
            alt={dest.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)",
            display: "flex", alignItems: "flex-end",
            padding: "20px 22px",
          }}>
            <div>
              <h3 style={{
                margin: 0, color: "#fff",
                fontFamily: "'Playfair Display',serif",
                fontSize: isMobile ? 18 : 22, fontWeight: 800,
              }}>{dest.label}</h3>
              {dest.country && (
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,.8)", fontSize: 13 }}>
                  {dest.country}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary table */}
      <div className="bk-summary">
        {rows.map((row) => (
          <div key={row.key} className="bk-summary__row">
            <span className="bk-summary__key">{row.key}</span>
            <span className="bk-summary__val">{row.val}</span>
          </div>
        ))}
      </div>

      {/* No payment notice */}
      <div className="bk-info-box bk-info-box--green" style={{ marginTop: 20 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ margin: 0, fontWeight: 700, marginBottom: 3 }}>
            No payment required at this stage.
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            Your booking request is completely free. Our travel expert will contact
            you to discuss pricing, availability and customise your itinerary.
          </p>
        </div>
      </div>
    </div>
  );
});
StepReview.displayName = "StepReview";

/* ══════════════════════════════════════════════════════════════
   NAVIGATION BAR
══════════════════════════════════════════════════════════════ */
const NavBar = memo(({
  currentStep, totalSteps, onPrev, onNext,
  isSubmitting, isLastStep, isMobile,
}) => (
  <div className="bk-nav">
    <div style={{ display: "flex", gap: 10 }}>
      {currentStep > 0 && (
        <button
          type="button"
          className="bk-btn bk-btn--secondary"
          onClick={onPrev}
          disabled={isSubmitting}
          aria-label="Go to previous step"
        >
          ← Back
        </button>
      )}
    </div>

    <div style={{
      display: "flex", gap: 12, alignItems: "center", marginLeft: "auto",
    }}>
      {!isMobile && (
        <span style={{ fontSize: 12.5, color: "#9ca3af", fontWeight: 500 }}>
          Step {currentStep + 1} of {totalSteps}
        </span>
      )}
      <button
        type="button"
        className="bk-btn bk-btn--primary"
        onClick={onNext}
        disabled={isSubmitting}
        style={{ minWidth: isMobile ? 0 : 190 }}
        aria-label={isLastStep ? "Continue to contact" : "Next step"}
      >
        {isLastStep ? (
          <>Continue to Contact <span aria-hidden="true">→</span></>
        ) : (
          <>Next Step <span aria-hidden="true">→</span></>
        )}
      </button>
    </div>
  </div>
));
NavBar.displayName = "NavBar";

/* ══════════════════════════════════════════════════════════════
   MAIN BOOKING STEPS
══════════════════════════════════════════════════════════════ */
const STEP_TRANSITION = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
  transition: { duration: 0.25, ease: "easeInOut" },
};

const BookingSteps = ({
  currentStep, isAnimating,
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  isMobile, isTablet,
  categoriesList, destinationsList,
  countriesList, groupTypes,
  accommodationTypes, getTripDuration,
  getTotalVisitors, interests,
  handleInterestToggle, nextStep, prevStep,
  isSubmitting,
}) => {
  const sharedProps = {
    formData, setFormData,
    errors, touched,
    handleChange, handleBlur,
    isMobile,
  };

  const stepComponents = [
    <StepTrip
      key="trip"
      {...sharedProps}
      destinationsList={destinationsList}
      countriesList={countriesList}
      categoriesList={categoriesList}
    />,
    <StepTravelers
      key="travelers"
      {...sharedProps}
      groupTypes={groupTypes}
    />,
    <StepPreferences
      key="preferences"
      {...sharedProps}
      accommodationTypes={accommodationTypes}
      interests={interests}
      handleInterestToggle={handleInterestToggle}
    />,
    <StepReview
      key="review"
      formData={formData}
      destinationsList={destinationsList}
      countriesList={countriesList}
      groupTypes={groupTypes}
      accommodationTypes={accommodationTypes}
      getTripDuration={getTripDuration}
      getTotalVisitors={getTotalVisitors}
      isMobile={isMobile}
    />,
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          {...STEP_TRANSITION}
        >
          {stepComponents[currentStep]}
        </motion.div>
      </AnimatePresence>

      <NavBar
        currentStep={currentStep}
        totalSteps={5}
        onPrev={prevStep}
        onNext={nextStep}
        isLastStep={currentStep === 3}
        isMobile={isMobile}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default BookingSteps;