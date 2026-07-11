/**
 * BookingSteps.jsx — v3.0
 * Steps: 0=Trip Details, 1=Travelers, 2=Review
 * ✅ Preferences step removed
 * ✅ All camelCase field names matching useBookingWizard
 * ✅ Polished, accessible, responsive design
 */

import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelectModal from "./components/SelectModal";

/* ══════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
══════════════════════════════════════════════════════════════ */

const FieldError = memo(({ error, touched }) =>
  error && touched ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bk-field-error"
      role="alert"
    >
      <span aria-hidden="true">⚠</span> {error}
    </motion.p>
  ) : null
);
FieldError.displayName = "FieldError";

const Counter = memo(({ value, onChange, min = 0, max = 30, label, hint, icon }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {icon && (
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
          border: "1.5px solid #a7f3d0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1f2937", display: "block" }}>
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 1, display: "block" }}>
            {hint}
          </span>
        )}
      </div>
    </div>
    <div className="bk-counter" style={{
      display: "flex", alignItems: "center", gap: 0,
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      overflow: "hidden",
    }}>
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value <= min ? "#f9fafb" : "#fff",
          color: value <= min ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700, cursor: value <= min ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >−</button>
      <span
        aria-live="polite"
        style={{
          minWidth: 44, textAlign: "center",
          fontSize: 16, fontWeight: 800, color: "#111827",
          borderLeft: "1px solid #f3f4f6",
          borderRight: "1px solid #f3f4f6",
          lineHeight: "40px", height: 40,
        }}
      >
        {value}
      </span>
      <button
        type="button"
        className="bk-counter__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value >= max ? "#f9fafb" : "#fff",
          color: value >= max ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700, cursor: value >= max ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >+</button>
    </div>
  </div>
));
Counter.displayName = "Counter";

const SectionCard = memo(({ children, style, title, icon }) => (
  <div style={{
    background: "#fff",
    borderRadius: 20,
    border: "1.5px solid #f0fdf4",
    boxShadow: "0 2px 16px rgba(5,150,105,.06)",
    overflow: "hidden",
    marginBottom: 24,
    ...style,
  }}>
    {(title || icon) && (
      <div style={{
        padding: "14px 22px 12px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex", alignItems: "center", gap: 8,
        background: "linear-gradient(to right,#f0fdf4,#fff)",
      }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        {title && (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", letterSpacing: ".01em" }}>
            {title}
          </span>
        )}
      </div>
    )}
    <div style={{ padding: "4px 22px" }}>
      {children}
    </div>
  </div>
));
SectionCard.displayName = "SectionCard";

const StepHeader = memo(({ icon, title, subtitle, badge }) => (
  <div style={{ marginBottom: 36, textAlign: "center" }}>
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "linear-gradient(135deg,#059669,#10b981)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 18px",
        boxShadow: "0 8px 28px rgba(5,150,105,.28)",
        fontSize: 30,
      }}
    >
      {icon}
    </motion.div>
    {badge && (
      <motion.span
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "inline-block",
          background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
          color: "#059669", border: "1.5px solid #a7f3d0",
          borderRadius: 20, padding: "3px 14px",
          fontSize: 11.5, fontWeight: 700,
          letterSpacing: ".05em", textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {badge}
      </motion.span>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      style={{
        margin: "0 0 8px",
        fontSize: 26, fontWeight: 900, color: "#0f172a",
        fontFamily: "'Playfair Display', serif",
        letterSpacing: "-0.02em", lineHeight: 1.25,
      }}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{
          margin: 0, color: "#6b7280",
          fontSize: 15, lineHeight: 1.65,
          maxWidth: 480, marginLeft: "auto", marginRight: "auto",
        }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
));
StepHeader.displayName = "StepHeader";

/* ══════════════════════════════════════════════════════════════
   STEP 0 — TRIP DETAILS
══════════════════════════════════════════════════════════════ */
const MONTHS = [
  { short: "Jan", full: "january"   },
  { short: "Feb", full: "february"  },
  { short: "Mar", full: "march"     },
  { short: "Apr", full: "april"     },
  { short: "May", full: "may"       },
  { short: "Jun", full: "june"      },
  { short: "Jul", full: "july"      },
  { short: "Aug", full: "august"    },
  { short: "Sep", full: "september" },
  { short: "Oct", full: "october"   },
  { short: "Nov", full: "november"  },
  { short: "Dec", full: "december"  },
];

const StepTrip = memo(({
  formData, setFormData, errors, touched,
  handleChange, handleBlur,
  destinationsList, countriesList, categoriesList,
  isMobile,
}) => {
  const [openCountryModal, setOpenCountryModal] = useState(false);
  const [openDestModal,    setOpenDestModal]    = useState(false);

  const selectedCountry = (countriesList || []).find((c) => c.value === formData.countryId);
  const selectedDest    = (destinationsList || []).find((d) => d.value === formData.destinationId);
  const today = new Date().toISOString().split("T")[0];

  const handleCountrySelect = useCallback((c) => {
    setFormData((p) => ({ ...p, countryId: c.value, destinationId: "" }));
    setOpenCountryModal(false);
  }, [setFormData]);

  const handleDestSelect = useCallback((d) => {
    setFormData((p) => ({
      ...p,
      destinationId: d.value,
      countryId: d.countryId || p.countryId,
    }));
    setOpenDestModal(false);
  }, [setFormData]);

  const tripDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const d = Math.round(
      (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000
    );
    return d > 0 ? d : null;
  }, [formData.startDate, formData.endDate]);

  return (
    <div className="bk-step-content">
      <StepHeader
        icon="🗺️"
        badge="Step 1 of 4"
        title="Where would you like to go?"
        subtitle="Choose your dream destination and preferred travel dates."
      />

      {/* Location pickers */}
      <SectionCard title="Destination" icon="📍">
        <div style={{
          display: "grid", gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          padding: "10px 0 6px",
        }}>
          {/* Country picker */}
          <div>
            <label className="bk-label" style={{ marginBottom: 8 }}>
              Country <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpenCountryModal(true)}
                aria-label="Open country selector"
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "13px 16px",
                  background: errors.countryId && touched.countryId
                    ? "#fef2f2"
                    : selectedCountry ? "#f0fdf4" : "#f9fafb",
                  border: `2px solid ${
                    errors.countryId && touched.countryId
                      ? "#fca5a5"
                      : selectedCountry ? "#6ee7b7" : "#e5e7eb"
                  }`,
                  borderRadius: 14, cursor: "pointer",
                  transition: "all .2s",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>
                  {selectedCountry?.flag && !selectedCountry.flag.startsWith("http")
                    ? selectedCountry.flag : "🌍"}
                </span>
                <span style={{
                  flex: 1, fontSize: 14.5, fontWeight: selectedCountry ? 700 : 400,
                  color: selectedCountry ? "#111827" : "#9ca3af",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {selectedCountry?.label ?? "Select a country"}
                </span>
                {selectedCountry ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((p) => ({ ...p, countryId: "", destinationId: "" }));
                    }}
                    aria-label="Clear country"
                    style={{
                      background: "#e5e7eb", border: "none",
                      borderRadius: "50%", width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, color: "#6b7280",
                      flexShrink: 0,
                    }}
                  >×</button>
                ) : (
                  <span style={{ color: "#9ca3af", fontSize: 14, flexShrink: 0 }}>▾</span>
                )}
              </button>
            </div>
            <FieldError error={errors.countryId} touched={touched.countryId} />
          </div>

          {/* Destination picker */}
          <div>
            <label className="bk-label" style={{ marginBottom: 8 }}>
              Specific Destination{" "}
              <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 12 }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpenDestModal(true)}
                aria-label="Open destination selector"
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "13px 16px",
                  background: selectedDest ? "#f0fdf4" : "#f9fafb",
                  border: `2px solid ${selectedDest ? "#6ee7b7" : "#e5e7eb"}`,
                  borderRadius: 14, cursor: "pointer",
                  transition: "all .2s", textAlign: "left",
                }}
              >
                {selectedDest?.image ? (
                  <img
                    src={selectedDest.image} alt=""
                    style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <span style={{ fontSize: 22, flexShrink: 0 }}>🏞️</span>
                )}
                <span style={{
                  flex: 1, fontSize: 14.5, fontWeight: selectedDest ? 700 : 400,
                  color: selectedDest ? "#111827" : "#9ca3af",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {selectedDest?.label ?? "Select a destination"}
                </span>
                {selectedDest ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((p) => ({ ...p, destinationId: "" }));
                    }}
                    aria-label="Clear destination"
                    style={{
                      background: "#e5e7eb", border: "none",
                      borderRadius: "50%", width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, color: "#6b7280",
                      flexShrink: 0,
                    }}
                  >×</button>
                ) : (
                  <span style={{ color: "#9ca3af", fontSize: 14, flexShrink: 0 }}>▾</span>
                )}
              </button>
            </div>
            <FieldError error={errors.destinationId} touched={touched.destinationId} />
          </div>
        </div>
      </SectionCard>

      {/* Modals */}
      <SelectModal
        isOpen={openCountryModal}
        onClose={() => setOpenCountryModal(false)}
        onSelect={handleCountrySelect}
        items={countriesList}
        mode="country"
        selectedValue={formData.countryId}
        isMobile={isMobile}
      />
      <SelectModal
        isOpen={openDestModal}
        onClose={() => setOpenDestModal(false)}
        onSelect={handleDestSelect}
        items={destinationsList}
        mode="destination"
        selectedValue={formData.destinationId}
        isMobile={isMobile}
      />

      {/* Dates section */}
      <SectionCard title="Travel Dates" icon="📅">
        {/* Flexible toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0 12px",
          borderBottom: "1px solid #f3f4f6",
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
              Flexible dates
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Choose preferred months instead of fixed dates
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData.isFlexible}
            onClick={() => setFormData((p) => ({ ...p, isFlexible: !p.isFlexible }))}
            style={{
              width: 52, height: 28, borderRadius: 14, border: "none",
              background: formData.isFlexible
                ? "linear-gradient(90deg,#059669,#10b981)"
                : "#e5e7eb",
              position: "relative", cursor: "pointer",
              transition: "background .25s", flexShrink: 0,
              boxShadow: formData.isFlexible
                ? "0 2px 8px rgba(5,150,105,.3)"
                : "none",
            }}
          >
            <motion.div
              animate={{ x: formData.isFlexible ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "#fff", position: "absolute", top: 3,
                boxShadow: "0 1px 4px rgba(0,0,0,.18)",
              }}
            />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!formData.isFlexible ? (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "grid", gap: 18,
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                padding: "14px 0 6px",
              }}
            >
              <div>
                <label className="bk-label" style={{ marginBottom: 8 }}>
                  Departure Date <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  min={today}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-label="Departure date"
                  style={{
                    width: "100%", padding: "12px 14px",
                    borderRadius: 12, fontSize: 14, fontWeight: 500,
                    border: `2px solid ${
                      errors.startDate && touched.startDate
                        ? "#fca5a5"
                        : formData.startDate ? "#6ee7b7" : "#e5e7eb"
                    }`,
                    background: errors.startDate && touched.startDate
                      ? "#fef2f2"
                      : formData.startDate ? "#f0fdf4" : "#f9fafb",
                    outline: "none", boxSizing: "border-box",
                    transition: "all .2s", color: "#111827",
                  }}
                />
                <FieldError error={errors.startDate} touched={touched.startDate} />
              </div>

              <div>
                <label className="bk-label" style={{ marginBottom: 8 }}>
                  Return Date{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 12 }}>(optional)</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-label="Return date"
                  style={{
                    width: "100%", padding: "12px 14px",
                    borderRadius: 12, fontSize: 14, fontWeight: 500,
                    border: `2px solid ${
                      errors.endDate && touched.endDate
                        ? "#fca5a5"
                        : formData.endDate ? "#6ee7b7" : "#e5e7eb"
                    }`,
                    background: errors.endDate && touched.endDate
                      ? "#fef2f2"
                      : formData.endDate ? "#f0fdf4" : "#f9fafb",
                    outline: "none", boxSizing: "border-box",
                    transition: "all .2s", color: "#111827",
                  }}
                />
                <FieldError error={errors.endDate} touched={touched.endDate} />
              </div>

              {tripDays && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    gridColumn: isMobile ? "1" : "1 / -1",
                    display: "flex", alignItems: "center", gap: 10,
                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: 12, padding: "10px 16px",
                  }}
                >
                  <span style={{ fontSize: 18 }}>⏱️</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#065f46" }}>
                    {tripDays} day{tripDays !== 1 ? "s" : ""} adventure
                  </span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="flexible"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ padding: "14px 0 10px" }}
            >
              <label className="bk-label" style={{ marginBottom: 10 }}>
                Preferred Months <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}>
                {MONTHS.map(({ short, full }) => {
                  const active = (formData.flexibleMonths || []).includes(full);
                  return (
                    <button
                      key={full}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          flexibleMonths: active
                            ? (p.flexibleMonths || []).filter((x) => x !== full)
                            : [...(p.flexibleMonths || []), full],
                        }))
                      }
                      style={{
                        padding: "10px 6px",
                        borderRadius: 10, border: "none",
                        background: active
                          ? "linear-gradient(135deg,#059669,#10b981)"
                          : "#f3f4f6",
                        color: active ? "#fff" : "#374151",
                        fontSize: 13, fontWeight: 700,
                        cursor: "pointer", transition: "all .18s",
                        boxShadow: active
                          ? "0 2px 8px rgba(5,150,105,.28)"
                          : "none",
                      }}
                    >
                      {short}
                    </button>
                  );
                })}
              </div>
              <FieldError error={errors.flexibleMonths} touched={touched.flexibleMonths} />
              {(formData.flexibleMonths || []).length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 10, fontSize: 13, color: "#059669",
                    fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  ✓ {formData.flexibleMonths.length} month
                  {formData.flexibleMonths.length !== 1 ? "s" : ""} selected
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Category (optional) */}
      {categoriesList?.length > 0 && (
        <SectionCard title="Trip Category" icon="🎯">
          <div style={{ padding: "10px 0 6px" }}>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              aria-label="Trip category"
              style={{
                width: "100%", padding: "12px 14px",
                borderRadius: 12, fontSize: 14, fontWeight: 500,
                border: "2px solid #e5e7eb", background: "#f9fafb",
                color: "#374151", outline: "none", cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "18px",
              }}
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </SectionCard>
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
  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;
  const total    = adults + children + infants;

  return (
    <div className="bk-step-content">
      <StepHeader
        icon="👥"
        badge="Step 2 of 4"
        title="Who's coming along?"
        subtitle="Tell us about your group so we can tailor the perfect experience."
      />

      <SectionCard title="Group Composition" icon="👣">
        <Counter
          icon="🧑" label="Adults" hint="Ages 18 and above"
          value={adults}
          onChange={(v) => setFormData((p) => ({ ...p, adults: v }))}
          min={1} max={30}
        />
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 -22px" }} />
        <Counter
          icon="🧒" label="Children" hint="Ages 5 – 17"
          value={children}
          onChange={(v) => setFormData((p) => ({ ...p, children: v }))}
          min={0} max={15}
        />
        <div style={{ height: 1, background: "#f3f4f6", margin: "0 -22px" }} />
        <Counter
          icon="👶" label="Infants" hint="Ages 0 – 4"
          value={infants}
          onChange={(v) => setFormData((p) => ({ ...p, infants: v }))}
          min={0} max={5}
        />
      </SectionCard>

      <FieldError error={errors.adults} touched={touched.adults} />

      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 22px",
              background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderRadius: 16, marginBottom: 24,
              border: "1.5px solid #a7f3d0",
              boxShadow: "0 4px 16px rgba(5,150,105,.1)",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#059669,#10b981)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
              boxShadow: "0 4px 12px rgba(5,150,105,.3)",
            }}>
              ✅
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#065f46" }}>
                {total} traveller{total !== 1 ? "s" : ""} total
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                {adults} adult{adults !== 1 ? "s" : ""}
                {children > 0 && ` · ${children} child${children !== 1 ? "ren" : ""}`}
                {infants > 0 && ` · ${infants} infant${infants !== 1 ? "s" : ""}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group type */}
      <div>
        <label className="bk-label" style={{ marginBottom: 12 }}>
          Group Type <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2,1fr)"
              : "repeat(3,1fr)",
            gap: 12,
          }}
          role="radiogroup"
          aria-label="Group type"
        >
          {(groupTypes || []).map((g) => {
            const isActive = formData.groupType === g.value;
            return (
              <motion.div
                key={g.value}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(5,150,105,.15)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData((p) => ({ ...p, groupType: g.value }))}
                role="radio"
                aria-checked={isActive}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setFormData((p) => ({ ...p, groupType: g.value }))
                }
                style={{
                  padding: "18px 14px",
                  borderRadius: 16, cursor: "pointer",
                  border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                  background: isActive
                    ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                    : "#fff",
                  textAlign: "center",
                  transition: "all .2s",
                  boxShadow: isActive
                    ? "0 4px 16px rgba(5,150,105,.18)"
                    : "0 1px 4px rgba(0,0,0,.05)",
                  outline: "none",
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>{g.icon}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: isActive ? "#065f46" : "#374151",
                }}>
                  {g.label}
                </div>
                {isActive && (
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#059669", margin: "8px auto 0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 900,
                  }}>✓</div>
                )}
              </motion.div>
            );
          })}
        </div>
        <FieldError error={errors.groupType} touched={touched.groupType} />
      </div>
    </div>
  );
});
StepTravelers.displayName = "StepTravelers";

/* ══════════════════════════════════════════════════════════════
   STEP 2 — REVIEW
══════════════════════════════════════════════════════════════ */
const BUDGET_LABELS = {
  "under-2000":  "Under $2,000",
  "2000-5000":   "$2,000 – $5,000",
  "5000-10000":  "$5,000 – $10,000",
  "over-10000":  "Over $10,000",
  "flexible":    "Flexible",
};

const ReviewRow = ({ label, value, icon }) => (
  <div style={{
    display: "flex", alignItems: "flex-start",
    gap: 12, padding: "14px 0",
    borderBottom: "1px solid #f3f4f6",
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      border: "1px solid #a7f3d0",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: "0 0 2px", fontSize: 11.5, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#111827", lineHeight: 1.45 }}>
        {value}
      </p>
    </div>
  </div>
);

const StepReview = memo(({
  formData, destinationsList, countriesList,
  groupTypes, accommodationTypes,
  getTripDuration, getTotalVisitors, isMobile,
}) => {
  const dest      = (destinationsList   || []).find((d) => d.value === formData.destinationId);
  const country   = (countriesList      || []).find((c) => c.value === formData.countryId);
  const groupType = (groupTypes         || []).find((g) => g.value === formData.groupType);
  const accom     = (accommodationTypes || []).find((a) => a.value === formData.accommodationType);
  const duration  = getTripDuration?.();
  const total     = getTotalVisitors?.();

  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;

  const locationLabel = dest?.label || country?.label || "Not specified";
  const dateLabel = formData.isFlexible
    ? `Flexible — ${(formData.flexibleMonths || []).length
        ? formData.flexibleMonths.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")
        : "Any month"}`
    : formData.startDate
      ? new Date(formData.startDate).toLocaleDateString("en-US", {
          weekday: "short", year: "numeric", month: "long", day: "numeric",
        })
      : "—";

  const travellerLabel = `${total || 0} total — ${adults} adult${adults !== 1 ? "s" : ""}${
    children ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""
  }${infants ? `, ${infants} infant${infants !== 1 ? "s" : ""}` : ""}`;

  return (
    <div className="bk-step-content">
      <StepHeader
        icon="📋"
        badge="Step 3 of 4"
        title="Review your trip details"
        subtitle="Everything look good? Go back to edit, or continue to complete your booking."
      />

      {/* Destination hero image */}
      {dest?.image && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 20, overflow: "hidden",
            height: isMobile ? 170 : 230,
            marginBottom: 24, position: "relative",
            boxShadow: "0 8px 32px rgba(0,0,0,.14)",
          }}
        >
          <img
            src={dest.image} alt={dest.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)",
            display: "flex", alignItems: "flex-end",
            padding: "22px 24px",
          }}>
            <div>
              <h3 style={{
                margin: "0 0 4px", color: "#fff",
                fontFamily: "'Playfair Display',serif",
                fontSize: isMobile ? 20 : 24, fontWeight: 900,
                textShadow: "0 2px 8px rgba(0,0,0,.4)",
              }}>
                {dest.label}
              </h3>
              {dest.country && (
                <p style={{
                  margin: 0, color: "rgba(255,255,255,.82)", fontSize: 13.5,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  📍 {dest.country}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary card */}
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1.5px solid #f0fdf4",
        boxShadow: "0 2px 16px rgba(5,150,105,.07)",
        overflow: "hidden", marginBottom: 24,
      }}>
        <div style={{
          padding: "14px 22px",
          background: "linear-gradient(to right,#f0fdf4,#fff)",
          borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
            Trip Summary
          </span>
        </div>
        <div style={{ padding: "0 22px" }}>
          <ReviewRow icon="📍" label="Destination"  value={locationLabel} />
          <ReviewRow icon="📅" label="Dates"        value={dateLabel} />
          {duration && !formData.isFlexible && formData.endDate && (
            <ReviewRow icon="⏱️" label="Duration"   value={`${duration} day${duration !== 1 ? "s" : ""}`} />
          )}
          <ReviewRow icon="👥" label="Travellers"   value={travellerLabel} />
          {groupType && (
            <ReviewRow icon="🧳" label="Group Type" value={`${groupType.icon} ${groupType.label}`} />
          )}
          {accom && (
            <ReviewRow icon="🏨" label="Accommodation" value={`${accom.icon} ${accom.label}`} />
          )}
          {formData.budgetRange && (
            <ReviewRow icon="💰" label="Budget" value={BUDGET_LABELS[formData.budgetRange] || formData.budgetRange} />
          )}
          {formData.interests?.length > 0 && (
            <ReviewRow
              icon="✨" label="Interests"
              value={formData.interests.join(", ")}
            />
          )}
          {formData.dietaryRequirements && (
            <ReviewRow icon="🍽️" label="Dietary" value={formData.dietaryRequirements} />
          )}
          {formData.specialRequests && (
            <ReviewRow icon="💬" label="Special Requests" value={formData.specialRequests} />
          )}
        </div>
      </div>

      {/* No payment notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex", gap: 14, alignItems: "flex-start",
          padding: "18px 22px",
          background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
          borderRadius: 16, border: "1.5px solid #93c5fd",
          boxShadow: "0 2px 12px rgba(59,130,246,.1)",
        }}
      >
        <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: "#1e40af" }}>
            No payment required at this stage
          </p>
          <p style={{ margin: 0, fontSize: 13.5, color: "#3b82f6", lineHeight: 1.6 }}>
            Your booking request is completely free. Our travel expert will
            contact you to discuss pricing and craft your perfect itinerary.
          </p>
        </div>
      </motion.div>
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
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: 36, paddingTop: 24,
    borderTop: "1.5px solid #f3f4f6",
    gap: 12, flexWrap: "wrap",
  }}>
    <div>
      {currentStep > 0 && (
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          aria-label="Go to previous step"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "13px 22px",
            background: "#f9fafb", color: "#374151",
            border: "1.5px solid #e5e7eb",
            borderRadius: 50, fontSize: 14, fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
            transition: "all .2s",
          }}
        >
          ← Back
        </motion.button>
      )}
    </div>

    <div style={{
      display: "flex", gap: 14,
      alignItems: "center", marginLeft: "auto",
    }}>
      {!isMobile && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 20 : 7,
                height: 7, borderRadius: 10,
                background: i <= currentStep
                  ? "linear-gradient(90deg,#059669,#10b981)"
                  : "#e5e7eb",
                transition: "all .3s",
              }}
            />
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(5,150,105,.35)" }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        aria-label={isLastStep ? "Continue to contact details" : "Next step"}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 28px",
          background: "linear-gradient(135deg,#059669,#10b981)",
          color: "#fff", border: "none",
          borderRadius: 50, fontSize: 14.5, fontWeight: 800,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          boxShadow: "0 4px 18px rgba(5,150,105,.3)",
          transition: "all .2s", minWidth: isMobile ? 0 : 200,
          justifyContent: "center",
        }}
      >
        {isSubmitting ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", fontSize: 16 }}
            >⟳</motion.span>
            Processing…
          </span>
        ) : isLastStep ? (
          <>Continue to Contact <span aria-hidden="true">→</span></>
        ) : (
          <>Next Step <span aria-hidden="true">→</span></>
        )}
      </motion.button>
    </div>
  </div>
));
NavBar.displayName = "NavBar";

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT — BookingSteps
   Steps 0=Trip, 1=Travelers, 2=Review  (step 3=Contact in Booking.jsx)
══════════════════════════════════════════════════════════════ */
const STEP_TRANSITION = {
  initial:    { opacity: 0, x: 20  },
  animate:    { opacity: 1, x: 0   },
  exit:       { opacity: 0, x: -20 },
  transition: { duration: 0.25, ease: "easeInOut" },
};

const TOTAL_STEPS = 4; // Trip, Travelers, Review, Contact

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

  // isLastStep here = step 2 (Review), last before Contact
  const isLastStep = currentStep === 2;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} {...STEP_TRANSITION}>
          {stepComponents[currentStep] ?? null}
        </motion.div>
      </AnimatePresence>

      <NavBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrev={prevStep}
        onNext={nextStep}
        isLastStep={isLastStep}
        isMobile={isMobile}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default BookingSteps;