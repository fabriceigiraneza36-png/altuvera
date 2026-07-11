// src/pages/Booking/components/StepOne.jsx
import React, { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, ChevronDown, X, Sparkles,
  Clock, CheckCircle2, Navigation,
} from "lucide-react";
import { THEME, normalizeOptionLabel, normalizeOptionValue } from "../BookingShared";
import SelectModal from "./SelectModal";

/* ── Shared primitives ── */
const Label = ({ children, required }) => (
  <p style={{
    margin: "0 0 8px", fontSize: 12.5, fontWeight: 700,
    color: "#374151", textTransform: "uppercase",
    letterSpacing: ".07em", display: "flex", alignItems: "center", gap: 4,
  }}>
    {children}
    {required && <span style={{ color: "#ef4444", fontSize: 14 }}>*</span>}
  </p>
);

const FieldError = ({ error, touched }) =>
  error && touched ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "6px 0 0", fontSize: 12.5, color: "#dc2626",
        display: "flex", alignItems: "center", gap: 5, fontWeight: 600,
      }}
      role="alert"
    >
      ⚠ {error}
    </motion.p>
  ) : null;

const PickerButton = ({
  onClick, icon, label, value,
  hasValue, error, touched, clearable, onClear,
}) => (
  <div>
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        background: hasValue ? "#f0fdf4" : "#f9fafb",
        border: `2px solid ${
          error && touched ? "#fca5a5"
          : hasValue ? "#6ee7b7"
          : "#e5e7eb"
        }`,
        borderRadius: 14, cursor: "pointer", textAlign: "left",
        transition: "all .2s", fontFamily: "inherit",
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: hasValue
          ? "linear-gradient(135deg,#059669,#10b981)"
          : "#e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {React.cloneElement(icon, {
          size: 16,
          color: hasValue ? "#fff" : "#9ca3af",
        })}
      </span>
      <span style={{
        flex: 1, fontSize: 14.5,
        fontWeight: hasValue ? 700 : 400,
        color: hasValue ? "#111827" : "#9ca3af",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value || label}
      </span>
      {clearable && hasValue ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear?.(); }}
          style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "#e5e7eb", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <X size={13} color="#6b7280" />
        </button>
      ) : (
        <ChevronDown size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
      )}
    </button>
    <FieldError error={error} touched={touched} />
  </div>
);

const DateField = ({
  label, name, value, min, onChange,
  onBlur, error, touched, required, icon,
}) => (
  <div>
    <Label required={required}>{label}</Label>
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", left: 14, top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
        width: 34, height: 34,
        background: value
          ? "linear-gradient(135deg,#059669,#10b981)"
          : "#e5e7eb",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {React.cloneElement(icon, { size: 16, color: value ? "#fff" : "#9ca3af" })}
      </div>
      <input
        type="date"
        name={name}
        value={value}
        min={min}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          width: "100%", padding: "14px 16px 14px 60px",
          background: value ? "#f0fdf4" : "#f9fafb",
          border: `2px solid ${
            error && touched ? "#fca5a5"
            : value ? "#6ee7b7"
            : "#e5e7eb"
          }`,
          borderRadius: 14, fontSize: 14.5,
          fontWeight: value ? 700 : 400,
          color: value ? "#111827" : "#9ca3af",
          outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", transition: "all .2s", cursor: "pointer",
        }}
      />
    </div>
    <FieldError error={error} touched={touched} />
  </div>
);

/* ── Month data ── */
const MONTHS = [
  { s: "Jan", v: "january"   }, { s: "Feb", v: "february"  },
  { s: "Mar", v: "march"     }, { s: "Apr", v: "april"     },
  { s: "May", v: "may"       }, { s: "Jun", v: "june"      },
  { s: "Jul", v: "july"      }, { s: "Aug", v: "august"    },
  { s: "Sep", v: "september" }, { s: "Oct", v: "october"   },
  { s: "Nov", v: "november"  }, { s: "Dec", v: "december"  },
];

/* ── Card wrapper ── */
const SectionCard = ({ headerIcon, headerLabel, headerRight, children }) => (
  <div style={{
    background: "#fff", borderRadius: 20,
    border: "1.5px solid #f0fdf4",
    boxShadow: "0 2px 16px rgba(5,150,105,.06)",
    marginBottom: 20, overflow: "hidden",
  }}>
    <div style={{
      padding: "13px 22px", borderBottom: "1px solid #f3f4f6",
      background: "linear-gradient(to right,#f0fdf4,#fff)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 8, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {React.cloneElement(headerIcon, { size: 15, color: "#059669" })}
        <span style={{
          fontSize: 12.5, fontWeight: 700, color: "#374151",
          textTransform: "uppercase", letterSpacing: ".06em",
        }}>
          {headerLabel}
        </span>
      </div>
      {headerRight}
    </div>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   STEP ONE
══════════════════════════════════════════════════════════════ */
const StepOne = memo(({
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  categoriesList, destinationsList, countriesList, servicesData,
  getTripDuration, isMobile, displayName,
}) => {
  const [openCountry, setOpenCountry] = useState(false);
  const [openDest,    setOpenDest]    = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning"
    : hour < 17 ? "Good afternoon"
    : "Good evening";

  const today = new Date().toISOString().split("T")[0];

  /* ✅ useMemo is now imported above */
  const selectedCountry = useMemo(() =>
    (countriesList || []).find((c) => c.value === formData.countryId),
  [countriesList, formData.countryId]);

  const selectedDest = useMemo(() =>
    (destinationsList || []).find((d) => d.value === formData.destinationId),
  [destinationsList, formData.destinationId]);

  const tripDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const d = Math.round(
      (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000,
    );
    return d > 0 ? d : null;
  }, [formData.startDate, formData.endDate]);

  /* ✅ useCallback is now imported above */
  const handleCountrySelect = useCallback((c) => {
    setFormData((p) => ({ ...p, countryId: c.value, destinationId: "" }));
    setOpenCountry(false);
  }, [setFormData]);

  const handleDestSelect = useCallback((d) => {
    setFormData((p) => ({
      ...p,
      destinationId: d.value,
      countryId: d.countryId || p.countryId,
    }));
    setOpenDest(false);
  }, [setFormData]);

  const toggleMonth = useCallback((v) => {
    setFormData((p) => ({
      ...p,
      flexibleMonths: (p.flexibleMonths || []).includes(v)
        ? (p.flexibleMonths || []).filter((m) => m !== v)
        : [...(p.flexibleMonths || []), v],
    }));
  }, [setFormData]);

  const toggleFlexible = useCallback(() => {
    setFormData((p) => ({ ...p, isFlexible: !p.isFlexible }));
  }, [setFormData]);

  const clearCountry = useCallback(() => {
    setFormData((p) => ({ ...p, countryId: "", destinationId: "" }));
  }, [setFormData]);

  const clearDest = useCallback(() => {
    setFormData((p) => ({ ...p, destinationId: "" }));
  }, [setFormData]);

  const selectDestQuick = useCallback((id) => {
    setFormData((p) => ({ ...p, destinationId: id }));
  }, [setFormData]);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#059669,#10b981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 12px 36px rgba(5,150,105,.32)",
          }}
        >
          <Navigation size={30} color="#fff" />
        </motion.div>

        {displayName && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: "inline-block", marginBottom: 10,
              background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
              border: "1.5px solid #a7f3d0", borderRadius: 20,
              padding: "4px 16px", fontSize: 12, fontWeight: 700,
              color: "#059669", letterSpacing: ".05em",
              textTransform: "uppercase",
            }}
          >
            {greeting}, {displayName}! 👋
          </motion.span>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile ? 26 : 34, fontWeight: 900,
            color: "#0f172a", margin: "0 0 10px",
            lineHeight: 1.2, letterSpacing: "-0.02em",
          }}
        >
          Where would you like{" "}
          <span style={{ color: "#059669" }}>to go?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            fontSize: isMobile ? 14 : 15.5, color: "#6b7280",
            lineHeight: 1.65, maxWidth: 520, margin: "0 auto",
          }}
        >
          Choose your dream destination and travel dates to begin planning
          your perfect African adventure.
        </motion.p>
      </div>

      {/* ── Destination card ── */}
      <SectionCard
        headerIcon={<MapPin />}
        headerLabel="Destination"
      >
        <div style={{
          padding: "20px 22px",
          display: "grid", gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}>
          {/* Country */}
          <div>
            <Label required>Country</Label>
            <PickerButton
              onClick={() => setOpenCountry(true)}
              icon={<MapPin />}
              label="Select a country"
              value={
                selectedCountry
                  ? `${
                      selectedCountry.flag &&
                      !selectedCountry.flag.startsWith("http")
                        ? selectedCountry.flag + " "
                        : ""
                    }${selectedCountry.label}`
                  : null
              }
              hasValue={!!selectedCountry}
              error={errors.countryId}
              touched={touched.countryId}
              clearable
              onClear={clearCountry}
            />
          </div>

          {/* Destination */}
          <div>
            <Label>
              Specific Destination{" "}
              <span style={{
                fontSize: 11, color: "#9ca3af",
                fontWeight: 400, textTransform: "none", letterSpacing: 0,
              }}>
                (optional)
              </span>
            </Label>
            <PickerButton
              onClick={() => setOpenDest(true)}
              icon={<Sparkles />}
              label="Select a destination"
              value={selectedDest?.label ?? null}
              hasValue={!!selectedDest}
              clearable
              onClear={clearDest}
            />
          </div>
        </div>
      </SectionCard>

      {/* Modals */}
      <SelectModal
        isOpen={openCountry}
        onClose={() => setOpenCountry(false)}
        onSelect={handleCountrySelect}
        items={countriesList}
        mode="country"
        selectedValue={formData.countryId}
        isMobile={isMobile}
      />
      <SelectModal
        isOpen={openDest}
        onClose={() => setOpenDest(false)}
        onSelect={handleDestSelect}
        items={destinationsList}
        mode="destination"
        selectedValue={formData.destinationId}
        isMobile={isMobile}
      />

      {/* ── Popular destinations ── */}
      {(destinationsList || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "#fff", borderRadius: 20,
            border: "1.5px solid #f0fdf4",
            boxShadow: "0 2px 16px rgba(5,150,105,.06)",
            marginBottom: 20, overflow: "hidden",
          }}
        >
          <div style={{
            padding: "13px 22px", borderBottom: "1px solid #f3f4f6",
            background: "linear-gradient(to right,#f0fdf4,#fff)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Sparkles size={15} color="#059669" />
            <span style={{
              fontSize: 12.5, fontWeight: 700, color: "#374151",
              textTransform: "uppercase", letterSpacing: ".06em",
            }}>
              Popular Destinations
            </span>
          </div>
          <div style={{
            padding: "16px 22px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10,
          }}>
            {destinationsList.slice(0, 6).map((dest, i) => {
              const id = normalizeOptionValue(
                dest.id || dest._id || dest.slug || dest.name || dest,
              );
              const isActive = formData.destinationId === id;
              return (
                <motion.button
                  key={id || i}
                  type="button"
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.18)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectDestQuick(id)}
                  style={{
                    padding: "12px 14px", borderRadius: 14,
                    background: isActive
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : "#f9fafb",
                    border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .2s", fontFamily: "inherit",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(5,150,105,.28)"
                      : "none",
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: isActive ? "#fff" : "#111827",
                    marginBottom: 2,
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {dest.flag ? `${dest.flag} ` : "🏞️ "}
                    {normalizeOptionLabel(dest.name || dest.title || dest.slug)}
                  </div>
                  {(dest.country || dest.region) && (
                    <div style={{
                      fontSize: 11.5,
                      color: isActive ? "rgba(255,255,255,.78)" : "#9ca3af",
                    }}>
                      {normalizeOptionLabel(dest.country || dest.region)}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Dates card ── */}
      <SectionCard
        headerIcon={<Calendar />}
        headerLabel="Travel Dates"
        headerRight={
          <label style={{
            display: "flex", alignItems: "center",
            gap: 8, cursor: "pointer",
          }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7280" }}>
              Flexible dates
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isFlexible}
              onClick={toggleFlexible}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none",
                background: formData.isFlexible
                  ? "linear-gradient(90deg,#059669,#10b981)"
                  : "#e5e7eb",
                position: "relative", cursor: "pointer",
                transition: "background .25s",
                boxShadow: formData.isFlexible
                  ? "0 2px 8px rgba(5,150,105,.3)"
                  : "none",
              }}
            >
              <motion.div
                animate={{ x: formData.isFlexible ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fff", position: "absolute", top: 3,
                  boxShadow: "0 1px 4px rgba(0,0,0,.18)",
                }}
              />
            </button>
          </label>
        }
      >
        <div style={{ padding: "20px 22px" }}>
          <AnimatePresence mode="wait">
            {!formData.isFlexible ? (
              <motion.div
                key="fixed"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  display: "grid", gap: 18,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                <DateField
                  label="Departure Date" name="startDate" required
                  icon={<Calendar />}
                  value={formData.startDate}
                  min={today}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.startDate}
                  touched={touched.startDate}
                />
                <DateField
                  label="Return Date" name="endDate"
                  icon={<Calendar />}
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.endDate}
                  touched={touched.endDate}
                />
              </motion.div>
            ) : (
              <motion.div
                key="flex"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <Label required>Preferred Months</Label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 8,
                }}>
                  {MONTHS.map(({ s, v }) => {
                    const active = (formData.flexibleMonths || []).includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleMonth(v)}
                        style={{
                          padding: "10px 4px", borderRadius: 10,
                          border: "none",
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
                        {s}
                      </button>
                    );
                  })}
                </div>
                <FieldError
                  error={errors.flexibleMonths}
                  touched={touched.flexibleMonths}
                />
                {(formData.flexibleMonths || []).length > 0 && (
                  <p style={{
                    margin: "10px 0 0", fontSize: 13,
                    color: "#059669", fontWeight: 700,
                  }}>
                    ✓ {formData.flexibleMonths.length} month
                    {formData.flexibleMonths.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration badge */}
          <AnimatePresence>
            {tripDays && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ marginTop: 16 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 18px",
                  background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                  border: "1.5px solid #a7f3d0", borderRadius: 14,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg,#059669,#10b981)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(5,150,105,.3)",
                  }}>
                    <Clock size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{
                      margin: 0, fontSize: 11.5, color: "#6b7280",
                      fontWeight: 600, textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}>
                      Trip Duration
                    </p>
                    <p style={{
                      margin: 0, fontSize: 20, fontWeight: 900, color: "#059669",
                    }}>
                      {tripDays} day{tripDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* ── Category (optional) ── */}
      {(categoriesList || []).length > 0 && (
        <SectionCard
          headerIcon={<CheckCircle2 />}
          headerLabel={
            <>
              Trip Category{" "}
              <span style={{
                fontSize: 11, color: "#9ca3af",
                fontWeight: 400, textTransform: "none", letterSpacing: 0,
              }}>
                (optional)
              </span>
            </>
          }
        >
          <div style={{ padding: "16px 22px" }}>
            <select
              name="categoryId"
              value={formData.categoryId || ""}
              onChange={handleChange}
              style={{
                width: "100%", padding: "13px 40px 13px 16px",
                borderRadius: 12, fontSize: 14, fontWeight: 500,
                border: "2px solid #e5e7eb", background: "#f9fafb",
                color: "#374151", outline: "none", cursor: "pointer",
                fontFamily: "inherit", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                backgroundSize: "18px",
                boxSizing: "border-box",
              }}
            >
              <option value="">All categories</option>
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

StepOne.displayName = "StepOne";
export default StepOne;