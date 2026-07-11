// src/pages/Booking/BookingSteps.jsx
import React, {
  useState, useCallback, useMemo, memo, useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, ChevronDown, X, Sparkles, Clock,
  CheckCircle2, Navigation, Users, Home, ArrowLeft, ArrowRight,
} from "lucide-react";
import SelectModal from "./components/SelectModal";
import { useTypewriter, useTypewriterOnce } from "../../hooks/useTypewriter";

/* ══════════════════════════════════════════════════════════════
   TYPEWRITER HEADING
══════════════════════════════════════════════════════════════ */
const TypewriterHeading = memo(({ strings, className, style, loop = true }) => {
  const { text } = useTypewriter(strings, {
    speed: 55, deleteSpeed: 30, pauseAfter: 2200, loop,
  });

  return (
    <span style={style} className={className}>
      {text}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{ color: "#059669", fontWeight: 900, marginLeft: 1 }}
      >
        |
      </motion.span>
    </span>
  );
});
TypewriterHeading.displayName = "TypewriterHeading";

/* Single-shot typewriter for subtitles */
const TypewriterSub = memo(({ text, delay = 0, style }) => {
  const { text: t } = useTypewriterOnce(text, { speed: 28, startDelay: delay });
  return <span style={style}>{t}</span>;
});
TypewriterSub.displayName = "TypewriterSub";

/* ══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════════ */
const Label = memo(({ children, required }) => (
  <p style={{
    margin: "0 0 8px", fontSize: 12.5, fontWeight: 700,
    color: "#374151", textTransform: "uppercase",
    letterSpacing: ".07em", display: "flex", alignItems: "center", gap: 4,
  }}>
    {children}
    {required && <span style={{ color: "#ef4444" }}>*</span>}
  </p>
));
Label.displayName = "Label";

const FieldError = memo(({ error, touched }) =>
  error && touched ? (
    <motion.p
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0,  height: "auto" }}
      exit={{    opacity: 0, y: -4, height: 0      }}
      style={{
        margin: "6px 0 0", fontSize: 12.5, color: "#dc2626",
        display: "flex", alignItems: "center", gap: 5, fontWeight: 600,
      }}
      role="alert"
    >
      ⚠ {error}
    </motion.p>
  ) : null
);
FieldError.displayName = "FieldError";

/* Staggered field reveal wrapper */
const FieldReveal = memo(({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
));
FieldReveal.displayName = "FieldReveal";

const SectionCard = memo(({ headerIcon, headerLabel, headerRight, children, delay = 0 }) => (
  <FieldReveal delay={delay}>
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
  </FieldReveal>
));
SectionCard.displayName = "SectionCard";

/* Animated step header */
const StepHeader = memo(({ icon, badge, titleStrings, titleStatic, subtitle, isMobile }) => (
  <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0  }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
      style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "linear-gradient(135deg,#059669,#10b981)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: "0 12px 36px rgba(5,150,105,.32)",
        fontSize: 30,
      }}
    >
      {icon}
    </motion.div>

    {badge && (
      <motion.span
        initial={{ opacity: 0, y: -6, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1   }}
        transition={{ delay: 0.12 }}
        style={{
          display: "inline-block", marginBottom: 10,
          background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
          border: "1.5px solid #a7f3d0", borderRadius: 20,
          padding: "4px 16px", fontSize: 12, fontWeight: 700,
          color: "#059669", letterSpacing: ".05em",
          textTransform: "uppercase",
        }}
      >
        {badge}
      </motion.span>
    )}

    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: 0.14 }}
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: isMobile ? 24 : 32, fontWeight: 900,
        color: "#0f172a", margin: "0 0 10px",
        lineHeight: 1.2, letterSpacing: "-0.02em",
        minHeight: isMobile ? 58 : 42,
      }}
    >
      {titleStrings ? (
        <TypewriterHeading strings={titleStrings} loop={false} />
      ) : (
        titleStatic
      )}
    </motion.h2>

    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          fontSize: isMobile ? 14 : 15.5, color: "#6b7280",
          lineHeight: 1.65, maxWidth: 500, margin: "0 auto",
        }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
));
StepHeader.displayName = "StepHeader";

/* ── Picker button ── */
const PickerButton = memo(({
  onClick, icon, label, value,
  hasValue, error, touched, clearable, onClear,
}) => (
  <motion.div whileTap={{ scale: 0.99 }}>
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        background: hasValue ? "#f0fdf4" : "#f9fafb",
        border: `2px solid ${
          error && touched ? "#fca5a5"
          : hasValue ? "#6ee7b7" : "#e5e7eb"
        }`,
        borderRadius: 14, cursor: "pointer", textAlign: "left",
        transition: "all .2s", fontFamily: "inherit",
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: hasValue
          ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {React.cloneElement(icon, { size: 16, color: hasValue ? "#fff" : "#9ca3af" })}
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
    <AnimatePresence>
      {error && touched && (
        <FieldError error={error} touched={touched} />
      )}
    </AnimatePresence>
  </motion.div>
));
PickerButton.displayName = "PickerButton";

/* ── Date field ── */
const DateField = memo(({
  label, name, value, min,
  onChange, onBlur, error, touched, required,
}) => (
  <div>
    <Label required={required}>{label}</Label>
    <motion.div
      whileFocus={{ scale: 1.01 }}
      style={{ position: "relative" }}
    >
      <div style={{
        position: "absolute", left: 14, top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
        width: 34, height: 34,
        background: value
          ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        <Calendar size={16} color={value ? "#fff" : "#9ca3af"} />
      </div>
      <input
        type="date" name={name} value={value || ""} min={min}
        onChange={onChange} onBlur={onBlur}
        style={{
          width: "100%", padding: "14px 16px 14px 60px",
          background: value ? "#f0fdf4" : "#f9fafb",
          border: `2px solid ${
            error && touched ? "#fca5a5"
            : value ? "#6ee7b7" : "#e5e7eb"
          }`,
          borderRadius: 14, fontSize: 14.5,
          fontWeight: value ? 700 : 400,
          color: value ? "#111827" : "#9ca3af",
          outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", transition: "all .2s", cursor: "pointer",
        }}
      />
    </motion.div>
    <AnimatePresence>
      {error && touched && <FieldError error={error} touched={touched} />}
    </AnimatePresence>
  </div>
));
DateField.displayName = "DateField";

/* ── Month selector ── */
const MONTHS = [
  { s: "Jan", v: "january"   }, { s: "Feb", v: "february"  },
  { s: "Mar", v: "march"     }, { s: "Apr", v: "april"     },
  { s: "May", v: "may"       }, { s: "Jun", v: "june"      },
  { s: "Jul", v: "july"      }, { s: "Aug", v: "august"    },
  { s: "Sep", v: "september" }, { s: "Oct", v: "october"   },
  { s: "Nov", v: "november"  }, { s: "Dec", v: "december"  },
];

/* ══════════════════════════════════════════════════════════════
   STEP 0 — TRIP DETAILS
══════════════════════════════════════════════════════════════ */
const StepTrip = memo(({
  formData, setFormData, errors, touched,
  handleChange, handleBlur,
  destinationsList, countriesList, categoriesList,
  isMobile, displayName,
}) => {
  const [openCountry, setOpenCountry] = useState(false);
  const [openDest,    setOpenDest]    = useState(false);

  const today = new Date().toISOString().split("T")[0];

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

  const handleCountrySelect = useCallback((c) => {
    setFormData((p) => ({ ...p, countryId: c.value, destinationId: "" }));
    setOpenCountry(false);
  }, [setFormData]);

  const handleDestSelect = useCallback((d) => {
    setFormData((p) => ({
      ...p, destinationId: d.value,
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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const titleStrings = displayName
    ? [`${greeting}, ${displayName}! Where to?`]
    : ["Where would you like to go?", "Plan your African adventure!", "Your journey starts here!"];

  return (
    <div>
      <StepHeader
        icon={<Navigation size={30} color="#fff" />}
        badge="Step 1 of 4 · Trip Details"
        titleStrings={titleStrings}
        subtitle="Choose your dream destination and travel dates to begin your perfect adventure."
        isMobile={isMobile}
      />

      {/* Destination card */}
      <SectionCard
        headerIcon={<MapPin />}
        headerLabel="Destination"
        delay={0.05}
      >
        <div style={{
          padding: "20px 22px",
          display: "grid", gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}>
          <FieldReveal delay={0.1}>
            <div>
              <Label required>Country</Label>
              <PickerButton
                onClick={() => setOpenCountry(true)}
                icon={<MapPin />}
                label="Select a country"
                value={
                  selectedCountry
                    ? `${selectedCountry.flag && !selectedCountry.flag.startsWith("http")
                        ? selectedCountry.flag + " " : ""}${selectedCountry.label}`
                    : null
                }
                hasValue={!!selectedCountry}
                error={errors.countryId}
                touched={touched.countryId}
                clearable
                onClear={() => setFormData((p) => ({ ...p, countryId: "", destinationId: "" }))}
              />
            </div>
          </FieldReveal>

          <FieldReveal delay={0.15}>
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
                onClear={() => setFormData((p) => ({ ...p, destinationId: "" }))}
              />
            </div>
          </FieldReveal>
        </div>
      </SectionCard>

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

      {/* Popular destinations */}
      {(destinationsList || []).length > 0 && (
        <SectionCard
          headerIcon={<Sparkles />}
          headerLabel="Popular Destinations"
          delay={0.1}
        >
          <div style={{
            padding: "16px 22px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10,
          }}>
            {destinationsList.slice(0, 6).map((dest, i) => {
              const id = dest.value || dest.id || dest._id
                || dest.slug || String(dest.name || dest);
              const isActive = formData.destinationId === id;
              return (
                <motion.button
                  key={id || i}
                  type="button"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.18)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData((p) => ({ ...p, destinationId: id }))}
                  style={{
                    padding: "12px 14px", borderRadius: 14,
                    background: isActive
                      ? "linear-gradient(135deg,#059669,#10b981)" : "#f9fafb",
                    border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .2s", fontFamily: "inherit",
                    boxShadow: isActive ? "0 4px 14px rgba(5,150,105,.28)" : "none",
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: isActive ? "#fff" : "#111827",
                    marginBottom: 2, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {dest.flag ? `${dest.flag} ` : "🏞️ "}
                    {dest.label || dest.name || dest.title || String(dest)}
                  </div>
                  {(dest.country || dest.region) && (
                    <div style={{
                      fontSize: 11.5,
                      color: isActive ? "rgba(255,255,255,.78)" : "#9ca3af",
                    }}>
                      {dest.country || dest.region}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Dates card */}
      <SectionCard
        headerIcon={<Calendar />}
        headerLabel="Travel Dates"
        delay={0.15}
        headerRight={
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7280" }}>
              Flexible
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isFlexible}
              onClick={() => setFormData((p) => ({ ...p, isFlexible: !p.isFlexible }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none",
                background: formData.isFlexible
                  ? "linear-gradient(90deg,#059669,#10b981)" : "#e5e7eb",
                position: "relative", cursor: "pointer",
                transition: "background .25s",
                boxShadow: formData.isFlexible
                  ? "0 2px 8px rgba(5,150,105,.3)" : "none",
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
                animate={{ opacity: 1, y: 0  }}
                exit={{    opacity: 0, y: -6  }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "grid", gap: 18,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                }}
              >
                <DateField
                  label="Departure Date" name="startDate" required
                  value={formData.startDate} min={today}
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.startDate} touched={touched.startDate}
                />
                <DateField
                  label="Return Date" name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.endDate} touched={touched.endDate}
                />
              </motion.div>
            ) : (
              <motion.div
                key="flex"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{    opacity: 0, y: -6  }}
                transition={{ duration: 0.2 }}
              >
                <Label required>Preferred Months</Label>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8,
                }}>
                  {MONTHS.map(({ s, v }, i) => {
                    const active = (formData.flexibleMonths || []).includes(v);
                    return (
                      <motion.button
                        key={v}
                        type="button"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleMonth(v)}
                        style={{
                          padding: "10px 4px", borderRadius: 10, border: "none",
                          background: active
                            ? "linear-gradient(135deg,#059669,#10b981)" : "#f3f4f6",
                          color: active ? "#fff" : "#374151",
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "all .18s",
                          boxShadow: active
                            ? "0 2px 8px rgba(5,150,105,.28)" : "none",
                        }}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {errors.flexibleMonths && touched.flexibleMonths && (
                    <FieldError
                      error={errors.flexibleMonths}
                      touched={touched.flexibleMonths}
                    />
                  )}
                </AnimatePresence>
                {(formData.flexibleMonths || []).length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      margin: "10px 0 0", fontSize: 13,
                      color: "#059669", fontWeight: 700,
                    }}
                  >
                    ✓ {formData.flexibleMonths.length} month
                    {formData.flexibleMonths.length !== 1 ? "s" : ""} selected
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration badge */}
          <AnimatePresence>
            {tripDays && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, height: 0 }}
                animate={{ opacity: 1, scale: 1,   height: "auto" }}
                exit={{    opacity: 0, scale: 0.9, height: 0      }}
                style={{ marginTop: 16, overflow: "hidden" }}
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
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(5,150,105,.3)",
                  }}>
                    <Clock size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{
                      margin: 0, fontSize: 11.5, color: "#6b7280",
                      fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em",
                    }}>
                      Trip Duration
                    </p>
                    <motion.p
                      key={tripDays}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1,   opacity: 1 }}
                      style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#059669" }}
                    >
                      {tripDays} day{tripDays !== 1 ? "s" : ""}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* Category */}
      {(categoriesList || []).length > 0 && (
        <SectionCard
          headerIcon={<CheckCircle2 />}
          headerLabel="Trip Category (optional)"
          delay={0.2}
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
                backgroundSize: "18px", boxSizing: "border-box",
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
StepTrip.displayName = "StepTrip";

/* ══════════════════════════════════════════════════════════════
   STEP 1 — TRAVELERS
══════════════════════════════════════════════════════════════ */
const Counter = memo(({ label, hint, icon, value, onChange, min = 0, max = 30 }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "16px 0",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        border: "1.5px solid #a7f3d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, color: "#1f2937" }}>{label}</p>
        {hint && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>{hint}</p>}
      </div>
    </div>
    <div style={{
      display: "flex", alignItems: "center",
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden",
    }}>
      <motion.button
        whileTap={{ scale: value <= min ? 1 : 0.85 }}
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value <= min ? "#f9fafb" : "#fff",
          color: value <= min ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value <= min ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >−</motion.button>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{    scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            minWidth: 44, textAlign: "center",
            fontSize: 17, fontWeight: 800, color: "#111827",
            borderLeft: "1px solid #f3f4f6",
            borderRight: "1px solid #f3f4f6",
            lineHeight: "40px", height: 40, display: "block",
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: value >= max ? 1 : 0.85 }}
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        style={{
          width: 40, height: 40, border: "none",
          background: value >= max ? "#f9fafb" : "#fff",
          color: value >= max ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value >= max ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >+</motion.button>
    </div>
  </div>
));
Counter.displayName = "Counter";

const StepTravelers = memo(({
  formData, setFormData, errors, touched,
  groupTypes, accommodationTypes, isMobile, displayName,
}) => {
  const adults   = useMemo(() => parseInt(formData.adults,   10) || 0, [formData.adults]);
  const children = useMemo(() => parseInt(formData.children, 10) || 0, [formData.children]);
  const infants  = useMemo(() => parseInt(formData.infants,  10) || 0, [formData.infants]);
  const total    = adults + children + infants;

  const titleStrings = displayName
    ? [`Perfect, ${displayName}! Who's joining?`]
    : ["Who's joining the adventure?", "Tell us about your group!"];

  return (
    <div>
      <StepHeader
        icon={<Users size={30} color="#fff" />}
        badge="Step 2 of 4 · Travelers"
        titleStrings={titleStrings}
        subtitle="Help us tailor the perfect experience for your group."
        isMobile={isMobile}
      />

      {/* Group type */}
      <SectionCard headerIcon={<Users />} headerLabel="Group Type" delay={0.05}>
        <div style={{
          padding: "18px 22px",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",
          gap: 12,
        }}>
          {(groupTypes || []).map((g, i) => {
            const id = g.value || g.id;
            const isActive = formData.groupType === id;
            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(5,150,105,.18)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFormData((p) => ({ ...p, groupType: id }))}
                role="radio"
                aria-checked={isActive}
                style={{
                  padding: "18px 10px", borderRadius: 16,
                  background: isActive
                    ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#f9fafb",
                  border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                  cursor: "pointer", textAlign: "center",
                  transition: "all .2s", fontFamily: "inherit",
                  boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none",
                  outline: "none",
                }}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  style={{ fontSize: 30, marginBottom: 8 }}
                >
                  {g.icon}
                </motion.div>
                <div style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: isActive ? "#065f46" : "#374151", lineHeight: 1.3,
                }}>
                  {g.label || g.name || g.full_name}
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{    scale: 0, opacity: 0 }}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#059669", margin: "8px auto 0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 size={13} color="#fff" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {errors.groupType && touched.groupType && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0    }}
              style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}
            >
              ⚠ {errors.groupType}
            </motion.p>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Traveler counts */}
      <SectionCard headerIcon={<Users />} headerLabel="Number of Travellers" delay={0.1}>
        <div style={{ padding: "4px 22px" }}>
          <Counter
            icon="🧑" label="Adults" hint="Ages 18 and above"
            value={adults} min={1} max={30}
            onChange={(v) => setFormData((p) => ({ ...p, adults: v }))}
          />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter
            icon="🧒" label="Children" hint="Ages 5 – 17"
            value={children} min={0} max={15}
            onChange={(v) => setFormData((p) => ({ ...p, children: v }))}
          />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter
            icon="👶" label="Infants" hint="Ages 0 – 4"
            value={infants} min={0} max={5}
            onChange={(v) => setFormData((p) => ({ ...p, infants: v }))}
          />
        </div>

        <AnimatePresence>
          {total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{    opacity: 0, y: 8, height: 0    }}
              style={{
                margin: "0 22px 18px", overflow: "hidden",
              }}
            >
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "1.5px solid #a7f3d0", borderRadius: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={18} color="#059669" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#065f46" }}>
                      Total travellers
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                      {adults} adult{adults !== 1 ? "s" : ""}
                      {children > 0 && ` · ${children} child${children !== 1 ? "ren" : ""}`}
                      {infants  > 0 && ` · ${infants} infant${infants !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                <motion.span
                  key={total}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  style={{ fontSize: 32, fontWeight: 900, color: "#059669", lineHeight: 1 }}
                >
                  {total}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errors.adults && touched.adults && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0    }}
              style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}
            >
              ⚠ {errors.adults}
            </motion.p>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Accommodation */}
      {(accommodationTypes || []).length > 0 && (
        <SectionCard headerIcon={<Home />} headerLabel="Accommodation Style" delay={0.15}>
          <div style={{
            padding: "18px 22px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 12,
          }}>
            {accommodationTypes.map((a, i) => {
              const id = a.value || a.id;
              const isActive =
                formData.accommodationType === id || formData.accommodation === id;
              return (
                <motion.button
                  key={id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.15)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData((p) => ({
                    ...p, accommodationType: id, accommodation: id,
                  }))}
                  role="radio"
                  aria-checked={isActive}
                  style={{
                    padding: "16px 18px", borderRadius: 16,
                    background: isActive
                      ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#f9fafb",
                    border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .2s", fontFamily: "inherit",
                    boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none",
                    display: "flex", alignItems: "flex-start", gap: 14, outline: "none",
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: isActive
                      ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all .2s",
                    boxShadow: isActive ? "0 4px 12px rgba(5,150,105,.3)" : "none",
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: "0 0 3px", fontWeight: 700, fontSize: 14,
                      color: isActive ? "#065f46" : "#111827",
                    }}>
                      {a.label || a.name}
                    </p>
                    {(a.desc || a.description) && (
                      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                        {a.desc || a.description}
                      </p>
                    )}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{    scale: 0 }}
                      >
                        <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
});
StepTravelers.displayName = "StepTravelers";

/* ══════════════════════════════════════════════════════════════
   STEP 2 — REVIEW
══════════════════════════════════════════════════════════════ */
const BUDGET_LABELS = {
  "under-2000": "Under $2,000",
  "2000-5000":  "$2,000 – $5,000",
  "5000-10000": "$5,000 – $10,000",
  "over-10000": "Over $10,000",
  "flexible":   "Flexible",
};

const ReviewRow = memo(({ label, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0   }}
    transition={{ delay, duration: 0.3 }}
    style={{
      display: "flex", alignItems: "flex-start",
      gap: 12, padding: "14px 0",
      borderBottom: "1px solid #f3f4f6",
    }}
  >
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
      <p style={{
        margin: "0 0 2px", fontSize: 11.5, color: "#9ca3af",
        fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
      }}>
        {label}
      </p>
      <p style={{
        margin: 0, fontSize: 14.5, fontWeight: 700,
        color: "#111827", lineHeight: 1.45, wordBreak: "break-word",
      }}>
        {value}
      </p>
    </div>
  </motion.div>
));
ReviewRow.displayName = "ReviewRow";

const StepReview = memo(({
  formData, destinationsList, countriesList,
  groupTypes, accommodationTypes,
  getTripDuration, getTotalVisitors, isMobile,
}) => {
  const dest = useMemo(() =>
    (destinationsList || []).find((d) => d.value === formData.destinationId),
  [destinationsList, formData.destinationId]);

  const country = useMemo(() =>
    (countriesList || []).find((c) => c.value === formData.countryId),
  [countriesList, formData.countryId]);

  const groupType = useMemo(() =>
    (groupTypes || []).find((g) => (g.value || g.id) === formData.groupType),
  [groupTypes, formData.groupType]);

  const accom = useMemo(() =>
    (accommodationTypes || []).find(
      (a) => (a.value || a.id) === (formData.accommodationType || formData.accommodation),
    ),
  [accommodationTypes, formData.accommodationType, formData.accommodation]);

  const duration = getTripDuration?.();
  const total    = getTotalVisitors?.();
  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;

  const rows = useMemo(() => [
    { icon: "📍", label: "Destination",
      value: dest?.label || country?.label || "Not specified" },
    formData.isFlexible
      ? { icon: "📅", label: "Dates",
          value: `Flexible — ${
            (formData.flexibleMonths || []).length
              ? formData.flexibleMonths
                  .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                  .join(", ")
              : "Any month"
          }` }
      : { icon: "📅", label: "Departure",
          value: formData.startDate
            ? new Date(formData.startDate).toLocaleDateString("en-US", {
                weekday: "short", year: "numeric",
                month: "long", day: "numeric",
              })
            : "—" },
    !formData.isFlexible && formData.endDate && {
      icon: "🏁", label: "Return",
      value: new Date(formData.endDate).toLocaleDateString("en-US", {
        weekday: "short", year: "numeric", month: "long", day: "numeric",
      }),
    },
    duration && { icon: "⏱️", label: "Duration",
      value: `${duration} day${duration !== 1 ? "s" : ""}` },
    { icon: "👥", label: "Travellers",
      value: `${total || 0} total — ${adults} adult${adults !== 1 ? "s" : ""}${
        children ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""
      }${infants ? `, ${infants} infant${infants !== 1 ? "s" : ""}` : ""}` },
    groupType && { icon: "🧳", label: "Group Type",
      value: `${groupType.icon ?? ""} ${groupType.label || groupType.name}`.trim() },
    accom && { icon: "🏨", label: "Accommodation",
      value: `${accom.icon ?? ""} ${accom.label || accom.name}`.trim() },
    formData.budgetRange && { icon: "💰", label: "Budget",
      value: BUDGET_LABELS[formData.budgetRange] || formData.budgetRange },
    formData.interests?.length > 0 && { icon: "✨", label: "Interests",
      value: formData.interests.join(", ") },
    formData.specialRequests && { icon: "💬", label: "Special Requests",
      value: formData.specialRequests },
  ].filter(Boolean), [
    dest, country, formData, duration, total,
    adults, children, infants, groupType, accom,
  ]);

  return (
    <div>
      <StepHeader
        icon={<CheckCircle2 size={30} color="#fff" />}
        badge="Step 3 of 4 · Review"
        titleStatic={
          <>
            Review your{" "}
            <span style={{ color: "#059669" }}>trip details</span>
          </>
        }
        subtitle="Everything look good? Go back to edit, or continue to complete your booking."
        isMobile={isMobile}
      />

      {/* Destination hero */}
      {dest?.image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, overflow: "hidden",
            height: isMobile ? 170 : 230,
            marginBottom: 20, position: "relative",
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
            display: "flex", alignItems: "flex-end", padding: "22px 24px",
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
                  margin: 0, color: "rgba(255,255,255,.82)",
                  fontSize: 13.5,
                }}>
                  📍 {dest.country}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <SectionCard headerIcon={<CheckCircle2 />} headerLabel="Trip Summary" delay={0.05}>
        <div style={{ padding: "0 22px" }}>
          {rows.map((row, i) => (
            <ReviewRow
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.value}
              delay={0.06 + i * 0.05}
            />
          ))}
        </div>
        <div style={{ height: 8 }} />
      </SectionCard>

      {/* No payment notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ delay: 0.4 }}
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
}) => {
  const [shaking, setShaking] = useState(false);

  const handleNext = () => {
    // The parent validates; if it returns without navigating, shake
    onNext();
  };

  return (
    <motion.div
      animate={shaking ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginTop: 36, paddingTop: 24,
        borderTop: "1.5px solid #f3f4f6",
        gap: 12, flexWrap: "wrap",
      }}
    >
      <div>
        {currentStep > 0 && (
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            aria-label="Previous step"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "13px 22px",
              background: "#f9fafb", color: "#374151",
              border: "1.5px solid #e5e7eb",
              borderRadius: 50, fontSize: 14, fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1, transition: "all .2s",
            }}
          >
            <ArrowLeft size={16} /> Back
          </motion.button>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginLeft: "auto" }}>
        {/* Dot progress */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentStep ? 22 : 7,
                  background: i < currentStep
                    ? "#10b981"
                    : i === currentStep
                    ? "linear-gradient(90deg,#059669,#10b981)"
                    : "#e5e7eb",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ height: 7, borderRadius: 10 }}
              />
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ y: -1, boxShadow: "0 10px 28px rgba(5,150,105,.38)" }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleNext}
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
            transition: "all .2s",
            minWidth: isMobile ? 140 : 210,
            justifyContent: "center",
          }}
        >
          {isSubmitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block", fontSize: 16 }}
              >⟳</motion.span>
              Processing…
            </>
          ) : (
            <>
              {isLastStep ? "Continue to Contact" : "Next Step"}
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
});
NavBar.displayName = "NavBar";

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */
const TOTAL_STEPS = 4;

const BookingSteps = ({
  currentStep, formData, setFormData,
  errors, touched, handleChange, handleBlur,
  isMobile, isTablet,
  categoriesList, destinationsList, countriesList,
  groupTypes, accommodationTypes, getTripDuration,
  getTotalVisitors, interests, handleInterestToggle,
  nextStep, prevStep, isSubmitting, displayName,
}) => {
  const sharedProps = {
    formData, setFormData,
    errors, touched, handleChange, handleBlur,
    isMobile, displayName,
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
      accommodationTypes={accommodationTypes}
      getTotalVisitors={getTotalVisitors}
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

  const isLastStep = currentStep === 2;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40  }}
          animate={{ opacity: 1, x: 0   }}
          exit={{    opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
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