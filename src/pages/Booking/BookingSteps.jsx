// src/pages/Booking/BookingSteps.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Step 0 → Trip Details
// Step 1 → Travellers
// Step 2 → Contact Info
// Step 3 → Review + Submit (opens WhatsApp)
// ─────────────────────────────────────────────────────────────────────────────
import React, {
  useState, useCallback, useMemo, memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, ChevronDown, X, Sparkles, Clock,
  CheckCircle2, Navigation, Users, Home, ArrowLeft, ArrowRight,
  User, Mail, Phone, Globe, MessageCircle, Settings, Compass,
  Heart, Star, Send,
} from "lucide-react";
import SelectModal from "./components/SelectModal";
import {
  MONTHS, BUDGET_OPTIONS, BUDGET_LABELS,
  normalizeOptionLabel, normalizeOptionValue,
} from "./BookingShared";

/* ════════════════════════════════════════════════════════
   PRIMITIVES
════════════════════════════════════════════════════════ */
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
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -4, height: 0 }}
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

const FieldReveal = memo(({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
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

const StepHeader = memo(({ icon, badge, title, subtitle, isMobile }) => (
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
        fontSize: 30,
      }}
    >
      {icon}
    </motion.div>
    {badge && (
      <motion.span
        initial={{ opacity: 0, y: -6, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.12 }}
        style={{
          display: "inline-block", marginBottom: 10,
          background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
          border: "1.5px solid #a7f3d0", borderRadius: 20,
          padding: "4px 16px", fontSize: 12, fontWeight: 700,
          color: "#059669", letterSpacing: ".05em", textTransform: "uppercase",
        }}
      >
        {badge}
      </motion.span>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: isMobile ? 24 : 32, fontWeight: 900,
        color: "#0f172a", margin: "0 0 10px",
        lineHeight: 1.2, letterSpacing: "-0.02em",
      }}
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
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

/* ── PickerButton ── */
const PickerButton = memo(({
  onClick, icon, label, value, hasValue, error, touched, clearable, onClear,
}) => (
  <motion.div whileTap={{ scale: 0.99 }}>
    <button
      type="button" onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px",
        background: hasValue ? "#f0fdf4" : "#f9fafb",
        border: `2px solid ${
          error && touched ? "#fca5a5" : hasValue ? "#6ee7b7" : "#e5e7eb"
        }`,
        borderRadius: 14, cursor: "pointer", textAlign: "left",
        transition: "all .2s", fontFamily: "inherit",
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: hasValue ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {React.cloneElement(icon, { size: 16, color: hasValue ? "#fff" : "#9ca3af" })}
      </span>
      <span style={{
        flex: 1, fontSize: 14.5, fontWeight: hasValue ? 700 : 400,
        color: hasValue ? "#111827" : "#9ca3af",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value || label}
      </span>
      {clearable && hasValue ? (
        <button type="button"
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
      {error && touched && <FieldError error={error} touched={touched} />}
    </AnimatePresence>
  </motion.div>
));
PickerButton.displayName = "PickerButton";

/* ── DateField ── */
const DateField = memo(({
  label, name, value, min, onChange, onBlur, error, touched, required,
}) => (
  <div>
    <Label required={required}>{label}</Label>
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", left: 14, top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
        width: 34, height: 34,
        background: value ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
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
            error && touched ? "#fca5a5" : value ? "#6ee7b7" : "#e5e7eb"
          }`,
          borderRadius: 14, fontSize: 14.5,
          fontWeight: value ? 700 : 400,
          color: value ? "#111827" : "#9ca3af",
          outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", transition: "all .2s", cursor: "pointer",
        }}
      />
    </div>
    <AnimatePresence>
      {error && touched && <FieldError error={error} touched={touched} />}
    </AnimatePresence>
  </div>
));
DateField.displayName = "DateField";

/* ── TextInput ── */
const TextInput = memo(({
  name, label, type = "text", placeholder, required,
  icon: Icon, value, onChange, onBlur, error, touched, helpText,
}) => {
  const hasVal = !!value;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
          width: 34, height: 34, borderRadius: 10,
          background: hasVal ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <Icon size={15} color={hasVal ? "#fff" : "#9ca3af"} />
        </div>
        <input
          name={name} type={type} placeholder={placeholder}
          value={value || ""}
          onChange={onChange} onBlur={onBlur}
          style={{
            width: "100%", padding: "14px 16px 14px 60px",
            background: hasVal ? "#f0fdf4" : "#f9fafb",
            border: `2px solid ${
              error && touched ? "#fca5a5" : hasVal ? "#6ee7b7" : "#e5e7eb"
            }`,
            borderRadius: 14, fontSize: 14.5, fontWeight: hasVal ? 600 : 400,
            color: "#111827", outline: "none",
            boxSizing: "border-box", fontFamily: "inherit", transition: "all .2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.boxShadow   = "0 0 0 4px rgba(5,150,105,.1)";
          }}
          onBlur={(e) => {
            onBlur?.(e);
            e.target.style.borderColor = error && touched ? "#fca5a5"
              : hasVal ? "#6ee7b7" : "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
      <AnimatePresence>
        {error && touched && <FieldError error={error} touched={touched} />}
      </AnimatePresence>
      {helpText && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af" }}>{helpText}</p>
      )}
    </div>
  );
});
TextInput.displayName = "TextInput";

/* ── SelectInput ── */
const SelectInput = memo(({
  name, label, options, icon: Icon, value, onChange, onBlur,
  error, touched, required,
}) => {
  const hasVal = !!value;
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 14, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
          width: 34, height: 34, borderRadius: 10,
          background: hasVal ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <Icon size={15} color={hasVal ? "#fff" : "#9ca3af"} />
        </div>
        <select
          name={name} value={value || ""}
          onChange={onChange} onBlur={onBlur}
          style={{
            width: "100%", padding: "14px 40px 14px 60px",
            background: hasVal ? "#f0fdf4" : "#f9fafb",
            border: `2px solid ${
              error && touched ? "#fca5a5" : hasVal ? "#6ee7b7" : "#e5e7eb"
            }`,
            borderRadius: 14, fontSize: 14.5, fontWeight: hasVal ? 600 : 400,
            color: hasVal ? "#111827" : "#9ca3af",
            outline: "none", boxSizing: "border-box",
            fontFamily: "inherit", cursor: "pointer",
            appearance: "none", transition: "all .2s",
          }}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value ?? o.id} value={o.value ?? o.id}>
              {o.name ?? o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} color="#9ca3af" style={{
          position: "absolute", right: 14, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none",
        }} />
      </div>
      <AnimatePresence>
        {error && touched && <FieldError error={error} touched={touched} />}
      </AnimatePresence>
    </div>
  );
});
SelectInput.displayName = "SelectInput";

/* ── Counter ── */
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
      <motion.button whileTap={{ scale: value <= min ? 1 : 0.85 }}
        type="button" onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 40, height: 40, border: "none",
          background: value <= min ? "#f9fafb" : "#fff",
          color: value <= min ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value <= min ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >−</motion.button>
      <AnimatePresence mode="wait">
        <motion.span key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
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
      <motion.button whileTap={{ scale: value >= max ? 1 : 0.85 }}
        type="button" onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 40, height: 40, border: "none",
          background: value >= max ? "#f9fafb" : "#fff",
          color: value >= max ? "#d1d5db" : "#059669",
          fontSize: 20, fontWeight: 700,
          cursor: value >= max ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >+</motion.button>
    </div>
  </div>
));
Counter.displayName = "Counter";

/* ── ReviewRow ── */
const ReviewRow = memo(({ label, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
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

/* ════════════════════════════════════════════════════════
   STEP 0 — TRIP DETAILS
════════════════════════════════════════════════════════ */
const StepTrip = memo(({
  formData, setFormData, errors, touched,
  handleChange, handleBlur,
  destinationsList, countriesList, categoriesList,
  getTripDuration, isMobile, displayName,
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <StepHeader
        icon={<Navigation size={30} color="#fff" />}
        badge="Step 1 of 4 · Trip Details"
        title={displayName
          ? <>{greeting}, <span style={{ color: "#059669" }}>{displayName}!</span> Where to?</>
          : <>Where would you like <span style={{ color: "#059669" }}>to go?</span></>
        }
        subtitle="Choose your dream destination and travel dates to begin your perfect adventure."
        isMobile={isMobile}
      />

      {/* Destination */}
      <SectionCard headerIcon={<MapPin />} headerLabel="Destination" delay={0.05}>
        <div style={{
          padding: "20px 22px", display: "grid", gap: 18,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        }}>
          <FieldReveal delay={0.1}>
            <div>
              <Label required>Country</Label>
              <PickerButton
                onClick={() => setOpenCountry(true)}
                icon={<MapPin />}
                label="Select a country"
                value={selectedCountry
                  ? `${selectedCountry.flag && !selectedCountry.flag.startsWith("http")
                      ? selectedCountry.flag + " " : ""}${selectedCountry.label}`
                  : null}
                hasValue={!!selectedCountry}
                error={errors.countryId} touched={touched.countryId}
                clearable
                onClear={() => setFormData((p) => ({ ...p, countryId: "", destinationId: "" }))}
              />
            </div>
          </FieldReveal>
          <FieldReveal delay={0.15}>
            <div>
              <Label>
                Specific Destination{" "}
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400,
                  textTransform: "none", letterSpacing: 0 }}>
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

      <SelectModal isOpen={openCountry} onClose={() => setOpenCountry(false)}
        onSelect={(c) => { setFormData((p) => ({ ...p, countryId: c.value, destinationId: "" })); setOpenCountry(false); }}
        items={countriesList} mode="country"
        selectedValue={formData.countryId} isMobile={isMobile} />
      <SelectModal isOpen={openDest} onClose={() => setOpenDest(false)}
        onSelect={(d) => { setFormData((p) => ({ ...p, destinationId: d.value, countryId: d.countryId || p.countryId })); setOpenDest(false); }}
        items={destinationsList} mode="destination"
        selectedValue={formData.destinationId} isMobile={isMobile} />

      {/* Popular destinations */}
      {(destinationsList || []).length > 0 && (
        <SectionCard headerIcon={<Sparkles />} headerLabel="Popular Destinations" delay={0.1}>
          <div style={{
            padding: "16px 22px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10,
          }}>
            {destinationsList.slice(0, 6).map((dest, i) => {
              const id = normalizeOptionValue(dest);
              const isActive = formData.destinationId === id;
              return (
                <motion.button key={id || i} type="button"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.18)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData((p) => ({ ...p, destinationId: id }))}
                  style={{
                    padding: "12px 14px", borderRadius: 14,
                    background: isActive ? "linear-gradient(135deg,#059669,#10b981)" : "#f9fafb",
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
                    {normalizeOptionLabel(dest)}
                  </div>
                  {(dest.country || dest.region) && (
                    <div style={{ fontSize: 11.5, color: isActive ? "rgba(255,255,255,.78)" : "#9ca3af" }}>
                      {dest.country || dest.region}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Dates */}
      <SectionCard
        headerIcon={<Calendar />} headerLabel="Travel Dates" delay={0.15}
        headerRight={
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6b7280" }}>Flexible</span>
            <button type="button" role="switch" aria-checked={formData.isFlexible}
              onClick={() => setFormData((p) => ({ ...p, isFlexible: !p.isFlexible }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none",
                background: formData.isFlexible
                  ? "linear-gradient(90deg,#059669,#10b981)" : "#e5e7eb",
                position: "relative", cursor: "pointer", transition: "background .25s",
                boxShadow: formData.isFlexible ? "0 2px 8px rgba(5,150,105,.3)" : "none",
              }}>
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
              <motion.div key="fixed"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                style={{ display: "grid", gap: 18,
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
              >
                <DateField label="Departure Date" name="startDate" required
                  value={formData.startDate} min={today}
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.startDate} touched={touched.startDate} />
                <DateField label="Return Date" name="endDate"
                  value={formData.endDate} min={formData.startDate || today}
                  onChange={handleChange} onBlur={handleBlur}
                  error={errors.endDate} touched={touched.endDate} />
              </motion.div>
            ) : (
              <motion.div key="flex"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
              >
                <Label required>Preferred Months</Label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {MONTHS.map(({ s, v }, i) => {
                    const active = (formData.flexibleMonths || []).includes(v);
                    return (
                      <motion.button key={v} type="button"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setFormData((p) => ({
                          ...p,
                          flexibleMonths: (p.flexibleMonths || []).includes(v)
                            ? (p.flexibleMonths || []).filter((m) => m !== v)
                            : [...(p.flexibleMonths || []), v],
                        }))}
                        style={{
                          padding: "10px 4px", borderRadius: 10, border: "none",
                          background: active ? "linear-gradient(135deg,#059669,#10b981)" : "#f3f4f6",
                          color: active ? "#fff" : "#374151",
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", transition: "all .18s",
                          boxShadow: active ? "0 2px 8px rgba(5,150,105,.28)" : "none",
                        }}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {errors.flexibleMonths && touched.flexibleMonths && (
                    <FieldError error={errors.flexibleMonths} touched={touched.flexibleMonths} />
                  )}
                </AnimatePresence>
                {(formData.flexibleMonths || []).length > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ margin: "10px 0 0", fontSize: 13, color: "#059669", fontWeight: 700 }}>
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
                animate={{ opacity: 1, scale: 1, height: "auto" }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
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
                  }}>
                    <Clock size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11.5, color: "#6b7280",
                      fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Trip Duration
                    </p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#059669" }}>
                      {tripDays} day{tripDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* Category */}
      {(categoriesList || []).length > 0 && (
        <SectionCard headerIcon={<CheckCircle2 />} headerLabel="Trip Category (optional)" delay={0.2}>
          <div style={{ padding: "16px 22px" }}>
            <select name="categoryId" value={formData.categoryId || ""} onChange={handleChange}
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

/* ════════════════════════════════════════════════════════
   STEP 1 — TRAVELLERS
════════════════════════════════════════════════════════ */
const StepTravelers = memo(({
  formData, setFormData, errors, touched,
  groupTypes, accommodationTypes,
  getTotalVisitors, isMobile, displayName,
}) => {
  const adults   = useMemo(() => parseInt(formData.adults,   10) || 0, [formData.adults]);
  const children = useMemo(() => parseInt(formData.children, 10) || 0, [formData.children]);
  const infants  = useMemo(() => parseInt(formData.infants,  10) || 0, [formData.infants]);
  const total    = adults + children + infants;

  return (
    <div>
      <StepHeader
        icon={<Users size={30} color="#fff" />}
        badge="Step 2 of 4 · Travellers"
        title={displayName
          ? <>Perfect, <span style={{ color: "#059669" }}>{displayName}!</span> Who's joining?</>
          : <>Who's joining the <span style={{ color: "#059669" }}>adventure?</span></>
        }
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
              <motion.button key={id} type="button"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(5,150,105,.18)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFormData((p) => ({ ...p, groupType: id }))}
                role="radio" aria-checked={isActive}
                style={{
                  padding: "18px 10px", borderRadius: 16,
                  background: isActive ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#f9fafb",
                  border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                  cursor: "pointer", textAlign: "center",
                  transition: "all .2s", fontFamily: "inherit",
                  boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none", outline: "none",
                }}
              >
                <motion.div animate={{ scale: isActive ? 1.1 : 1 }} style={{ fontSize: 30, marginBottom: 8 }}>
                  {g.icon}
                </motion.div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? "#065f46" : "#374151", lineHeight: 1.3 }}>
                  {g.label || g.name || g.full_name}
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                      style={{ width: 20, height: 20, borderRadius: "50%", background: "#059669", margin: "8px auto 0",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
              ⚠ {errors.groupType}
            </motion.p>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Traveller counts */}
      <SectionCard headerIcon={<Users />} headerLabel="Number of Travellers" delay={0.1}>
        <div style={{ padding: "4px 22px" }}>
          <Counter icon="🧑" label="Adults" hint="Ages 18 and above"
            value={adults} min={1} max={30}
            onChange={(v) => setFormData((p) => ({ ...p, adults: v }))} />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter icon="🧒" label="Children" hint="Ages 5 – 17"
            value={children} min={0} max={15}
            onChange={(v) => setFormData((p) => ({ ...p, children: v }))} />
          <div style={{ height: 1, background: "#f3f4f6" }} />
          <Counter icon="👶" label="Infants" hint="Ages 0 – 4"
            value={infants} min={0} max={5}
            onChange={(v) => setFormData((p) => ({ ...p, infants: v }))} />
        </div>

        <AnimatePresence>
          {total > 0 && (
            <motion.div initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              style={{ margin: "0 22px 18px", overflow: "hidden" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
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
                <motion.span key={total}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: 32, fontWeight: 900, color: "#059669", lineHeight: 1 }}>
                  {total}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {errors.adults && touched.adults && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ margin: "0 22px 14px", fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
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
              const isActive = formData.accommodationType === id || formData.accommodation === id;
              return (
                <motion.button key={id} type="button"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(5,150,105,.15)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData((p) => ({ ...p, accommodationType: id, accommodation: id }))}
                  role="radio" aria-checked={isActive}
                  style={{
                    padding: "16px 18px", borderRadius: 16,
                    background: isActive ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#f9fafb",
                    border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .2s", fontFamily: "inherit",
                    boxShadow: isActive ? "0 4px 16px rgba(5,150,105,.18)" : "none",
                    display: "flex", alignItems: "flex-start", gap: 14, outline: "none",
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: isActive ? "linear-gradient(135deg,#059669,#10b981)" : "#e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all .2s",
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 14,
                      color: isActive ? "#065f46" : "#111827" }}>
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
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
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

      {/* Budget */}
      <SectionCard headerIcon={<Star />} headerLabel="Budget Range (optional)" delay={0.2}>
        <div style={{
          padding: "16px 22px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)",
          gap: 10,
        }}>
          {BUDGET_OPTIONS.map((b, i) => {
            const isActive = formData.budgetRange === b.value;
            return (
              <motion.button key={b.value} type="button"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFormData((p) => ({ ...p, budgetRange: isActive ? "" : b.value }))}
                style={{
                  padding: "14px 10px", borderRadius: 14,
                  background: isActive ? "linear-gradient(135deg,#059669,#10b981)" : "#f9fafb",
                  border: `2px solid ${isActive ? "#059669" : "#e5e7eb"}`,
                  cursor: "pointer", textAlign: "center",
                  transition: "all .2s", fontFamily: "inherit",
                  boxShadow: isActive ? "0 4px 14px rgba(5,150,105,.28)" : "none",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700,
                  color: isActive ? "#fff" : "#374151", lineHeight: 1.3 }}>
                  {b.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
});
StepTravelers.displayName = "StepTravelers";

/* ════════════════════════════════════════════════════════
   STEP 2 — CONTACT INFO
════════════════════════════════════════════════════════ */
const StepContact = memo(({
  formData, setFormData, errors, touched,
  handleChange, handleBlur,
  interests, handleInterestToggle,
  isMobile, displayName,
  user, isAuthenticated,
}) => (
  <div>
    <StepHeader
      icon={<User size={30} color="#fff" />}
      badge="Step 3 of 4 · Contact"
      title={<>Almost <span style={{ color: "#059669" }}>there!</span></>}
      subtitle={displayName
        ? `Let's go, ${displayName}! Fill in your details and we'll reach out within 24 hours.`
        : "Fill in your contact details and we'll be in touch within 24 hours."}
      isMobile={isMobile}
    />

    {/* Auto-fill notice */}
    {isAuthenticated && (formData.firstName || formData.email) && (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 14,
          padding: "18px 22px",
          background: "linear-gradient(135deg,rgba(5,150,105,.08),rgba(236,253,245,1))",
          border: "1.5px solid rgba(16,185,129,.2)", borderRadius: 18,
        }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg,#059669,#10b981)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 size={20} color="#fff" />
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: "#065f46" }}>
            Auto-filled from your account
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Your name and email have been pre-loaded.
          </p>
        </div>
      </motion.div>
    )}

    {/* Contact details */}
    <SectionCard headerIcon={<User />} headerLabel="Contact Details" delay={0.05}>
      <div style={{
        padding: "20px 22px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 18 : 22,
      }}>
        <TextInput name="firstName" label="First Name" required
          placeholder="Jane" icon={User}
          value={formData.firstName}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.firstName} touched={touched.firstName} />
        <TextInput name="lastName" label="Last Name" required
          placeholder="Smith" icon={User}
          value={formData.lastName}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.lastName} touched={touched.lastName} />
        <TextInput name="email" label="Email Address" type="email" required
          placeholder="jane@example.com" icon={Mail}
          value={formData.email}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.email} touched={touched.email} />
        <TextInput name="phone" label="Phone Number" type="tel" required
          placeholder="+1 234 567 8900" icon={Phone}
          value={formData.phone}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.phone} touched={touched.phone} />
        <TextInput name="country" label="Your Country" required
          placeholder="United States" icon={Globe}
          value={formData.country}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.country} touched={touched.country} />
      </div>
    </SectionCard>

    {/* Preferences */}
    <SectionCard
      headerIcon={<Settings />}
      headerLabel={<>Travel Preferences <span style={{ fontSize: 11, color: "#9ca3af",
        fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></>}
      delay={0.1}
    >
      <div style={{
        padding: "20px 22px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 18 : 22,
      }}>
        <SelectInput name="preferredContactMethod" label="Preferred Contact"
          icon={MessageCircle}
          value={formData.preferredContactMethod}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.preferredContactMethod} touched={touched.preferredContactMethod}
          options={[
            { value: "whatsapp", name: "💬 WhatsApp" },
            { value: "email",    name: "📧 Email"    },
            { value: "phone",    name: "📞 Phone Call" },
          ]} />
        <TextInput name="preferredContactTime" label="Best Time to Reach You"
          placeholder="e.g. 9am–12pm (GMT+2)" icon={Clock}
          value={formData.preferredContactTime}
          onChange={handleChange} onBlur={handleBlur}
          helpText="Include your timezone for faster replies." />
        <TextInput name="pickupLocation" label="Pickup Location"
          placeholder="Hotel / Airport / City" icon={MapPin}
          value={formData.pickupLocation}
          onChange={handleChange} onBlur={handleBlur} />
        <SelectInput name="marketingSource" label="How Did You Find Us?"
          icon={Compass}
          value={formData.marketingSource}
          onChange={handleChange} onBlur={handleBlur}
          options={[
            { value: "google",    name: "🔍 Google Search"    },
            { value: "instagram", name: "📸 Instagram"         },
            { value: "tiktok",    name: "🎵 TikTok"            },
            { value: "facebook",  name: "👥 Facebook"          },
            { value: "referral",  name: "🤝 Friend/Referral"   },
            { value: "returning", name: "✈️ Returning Traveler" },
            { value: "other",     name: "💡 Other"             },
          ]} />
      </div>
      {/* Newsletter */}
      <div style={{ padding: "0 22px 18px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div
            onClick={() => setFormData((p) => ({ ...p, newsletterOptIn: !p.newsletterOptIn }))}
            style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${formData.newsletterOptIn ? "#059669" : "#d1d5db"}`,
              background: formData.newsletterOptIn
                ? "linear-gradient(135deg,#059669,#10b981)" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all .18s",
            }}
          >
            {formData.newsletterOptIn && <CheckCircle2 size={13} color="#fff" />}
          </div>
          <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 500 }}>
            Email me destination updates and travel inspiration
          </span>
        </label>
      </div>
    </SectionCard>

    {/* Interests */}
    {(interests || []).length > 0 && (
      <SectionCard
        headerIcon={<Heart />}
        headerLabel={<>Interests <span style={{ fontSize: 11, color: "#9ca3af",
          fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></>}
        delay={0.15}
      >
        <div style={{ padding: "16px 22px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 10,
          }}>
            {interests.map((item, i) => {
              const val    = item?.value ?? item?.name ?? item;
              const label  = item?.label ?? item?.name ?? item;
              const icon   = item?.icon ?? "";
              const active = (formData.interests || []).includes(val);
              return (
                <motion.button key={val} type="button"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleInterestToggle(val)}
                  aria-pressed={active}
                  style={{
                    padding: "14px 10px", borderRadius: 14, border: "none",
                    background: active ? "linear-gradient(135deg,#059669,#10b981)" : "#f3f4f6",
                    cursor: "pointer", fontFamily: "inherit", transition: "all .18s",
                    boxShadow: active ? "0 4px 14px rgba(5,150,105,.28)" : "none",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}
                >
                  {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
                  <span style={{ fontSize: 12, fontWeight: 700,
                    color: active ? "#fff" : "#374151", lineHeight: 1.3, textAlign: "center" }}>
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </SectionCard>
    )}

    {/* Special requests */}
    <SectionCard headerIcon={<MessageCircle />} headerLabel="Special Requests" delay={0.2}>
      <div style={{ padding: "16px 22px" }}>
        <textarea name="specialRequests"
          value={formData.specialRequests || ""}
          onChange={handleChange}
          placeholder="Any special requirements, dietary needs, celebrations, or questions…"
          rows={4}
          style={{
            width: "100%", padding: "14px 16px", fontSize: 14.5,
            border: "2px solid #e5e7eb", borderRadius: 14,
            background: "#f9fafb", outline: "none", resize: "vertical",
            minHeight: isMobile ? 100 : 120,
            fontFamily: "inherit", lineHeight: 1.6,
            color: "#374151", transition: "all .2s", boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.background  = "#f0fdf4";
            e.target.style.boxShadow   = "0 0 0 4px rgba(5,150,105,.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.background  = "#f9fafb";
            e.target.style.boxShadow   = "none";
          }}
        />
      </div>
    </SectionCard>

    {/* Terms */}
    <FieldReveal delay={0.25}>
      <div style={{
        padding: "18px 22px", marginBottom: 20,
        background: "#f9fafb", borderRadius: 16,
        border: `2px solid ${errors.agreeToTerms && touched.agreeToTerms ? "#fca5a5" : "#e5e7eb"}`,
      }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
          <div
            onClick={() => setFormData((p) => ({ ...p, agreeToTerms: !p.agreeToTerms }))}
            style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
              border: `2px solid ${formData.agreeToTerms ? "#059669" : "#d1d5db"}`,
              background: formData.agreeToTerms
                ? "linear-gradient(135deg,#059669,#10b981)" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all .18s",
            }}
          >
            {formData.agreeToTerms && <CheckCircle2 size={14} color="#fff" />}
          </div>
          <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer"
              style={{ color: "#059669", fontWeight: 700, textDecoration: "underline" }}>
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              style={{ color: "#059669", fontWeight: 700, textDecoration: "underline" }}>
              Privacy Policy
            </a>
            <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>
          </span>
        </label>
        <AnimatePresence>
          {errors.agreeToTerms && touched.agreeToTerms && (
            <FieldError error={errors.agreeToTerms} touched={touched.agreeToTerms} />
          )}
        </AnimatePresence>
      </div>
    </FieldReveal>

    {/* WhatsApp info */}
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: isMobile ? "18px" : "22px",
        background: "linear-gradient(135deg,rgba(37,211,102,.1),rgba(5,150,105,.06))",
        border: "1.5px solid rgba(37,211,102,.25)", borderRadius: 20,
      }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#25D366,#128C7E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 6px 20px rgba(37,211,102,.3)",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
      <div>
        <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 14.5, color: "#065f46" }}>
          Your request will be sent via WhatsApp
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Our travel expert will respond within 24 hours with a personalised quote.
        </p>
      </div>
    </motion.div>
  </div>
));
StepContact.displayName = "StepContact";

/* ════════════════════════════════════════════════════════
   STEP 3 — REVIEW + SUBMIT
════════════════════════════════════════════════════════ */
const StepReview = memo(({
  formData, destinationsList, countriesList,
  groupTypes, accommodationTypes,
  getTripDuration, getTotalVisitors, isMobile,
}) => {
  const dest    = (destinationsList || []).find((d) => d.value === formData.destinationId);
  const country = (countriesList    || []).find((c) => c.value === formData.countryId);
  const group   = (groupTypes       || []).find((g) => (g.value || g.id) === formData.groupType);
  const accom   = (accommodationTypes || []).find((a) =>
    (a.value || a.id) === (formData.accommodationType || formData.accommodation),
  );

  const duration = getTripDuration?.();
  const total    = getTotalVisitors?.();
  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;

  const rows = [
    // Contact
    { icon: "👤", label: "Name",
      value: `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "—" },
    { icon: "📧", label: "Email",     value: formData.email   || "—" },
    { icon: "📞", label: "Phone",     value: formData.phone   || "—" },
    { icon: "🌍", label: "From",      value: formData.country || "—" },
    // Trip
    { icon: "📍", label: "Destination",
      value: dest?.label || country?.label || "Not specified" },
    formData.isFlexible
      ? { icon: "📅", label: "Dates",
          value: `Flexible — ${(formData.flexibleMonths || []).length
            ? formData.flexibleMonths.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")
            : "Any month"}` }
      : { icon: "📅", label: "Departure",
          value: formData.startDate
            ? new Date(formData.startDate).toLocaleDateString("en-US",
                { weekday: "short", year: "numeric", month: "long", day: "numeric" })
            : "—" },
    !formData.isFlexible && formData.endDate && {
      icon: "🏁", label: "Return",
      value: new Date(formData.endDate).toLocaleDateString("en-US",
        { weekday: "short", year: "numeric", month: "long", day: "numeric" }),
    },
    duration && { icon: "⏱️", label: "Duration",
      value: `${duration} day${duration !== 1 ? "s" : ""}` },
    // Travellers
    { icon: "👥", label: "Travellers",
      value: `${total || 0} total — ${adults} adult${adults !== 1 ? "s" : ""}${
        children ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""
      }${infants ? `, ${infants} infant${infants !== 1 ? "s" : ""}` : ""}` },
    group && { icon: "🧳", label: "Group Type",
      value: `${group.icon ?? ""} ${group.label || group.name}`.trim() },
    accom && { icon: "🏨", label: "Accommodation",
      value: `${accom.icon ?? ""} ${accom.label || accom.name}`.trim() },
    formData.budgetRange && { icon: "💰", label: "Budget",
      value: BUDGET_LABELS[formData.budgetRange] || formData.budgetRange },
    formData.interests?.length && { icon: "✨", label: "Interests",
      value: formData.interests.join(", ") },
    formData.specialRequests && { icon: "💬", label: "Special Requests",
      value: formData.specialRequests },
    formData.preferredContactMethod && { icon: "📲", label: "Contact Via",
      value: formData.preferredContactMethod },
  ].filter(Boolean);

  return (
    <div>
      <StepHeader
        icon={<CheckCircle2 size={30} color="#fff" />}
        badge="Step 4 of 4 · Review"
        title={<>Review your <span style={{ color: "#059669" }}>trip details</span></>}
        subtitle="Everything look good? Hit submit and we'll send your request via WhatsApp instantly."
        isMobile={isMobile}
      />

      {/* Hero image */}
      {dest?.image && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            borderRadius: 20, overflow: "hidden",
            height: isMobile ? 170 : 230,
            marginBottom: 20, position: "relative",
            boxShadow: "0 8px 32px rgba(0,0,0,.14)",
          }}>
          <img src={dest.image} alt={dest.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)",
            display: "flex", alignItems: "flex-end", padding: "22px 24px",
          }}>
            <div>
              <h3 style={{ margin: "0 0 4px", color: "#fff",
                fontFamily: "'Playfair Display',serif",
                fontSize: isMobile ? 20 : 24, fontWeight: 900 }}>
                {dest.label}
              </h3>
              {dest.country && (
                <p style={{ margin: 0, color: "rgba(255,255,255,.82)", fontSize: 13.5 }}>
                  📍 {dest.country}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <SectionCard headerIcon={<CheckCircle2 />} headerLabel="Full Trip Summary" delay={0.05}>
        <div style={{ padding: "0 22px" }}>
          {rows.map((row, i) => (
            <ReviewRow key={row.label}
              icon={row.icon} label={row.label} value={row.value}
              delay={0.05 + i * 0.04} />
          ))}
        </div>
        <div style={{ height: 8 }} />
      </SectionCard>

      {/* WhatsApp submit notice */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{
          display: "flex", gap: 14, alignItems: "flex-start",
          padding: "20px 24px",
          background: "linear-gradient(135deg,rgba(37,211,102,.12),rgba(5,150,105,.06))",
          borderRadius: 18, border: "1.5px solid rgba(37,211,102,.3)",
          boxShadow: "0 2px 16px rgba(37,211,102,.1)",
        }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#25D366,#128C7E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(37,211,102,.3)",
        }}>
          <Send size={22} color="#fff" />
        </div>
        <div>
          <p style={{ margin: "0 0 5px", fontWeight: 800, fontSize: 15, color: "#065f46" }}>
            Ready to submit? 🎉
          </p>
          <p style={{ margin: 0, fontSize: 13.5, color: "#6b7280", lineHeight: 1.6 }}>
            Clicking <strong style={{ color: "#059669" }}>Submit Booking</strong> will open
            WhatsApp with your full booking details pre-filled.{" "}
            <strong>No payment required</strong> — our expert will be in touch within 24 hours.
          </p>
        </div>
      </motion.div>
    </div>
  );
});
StepReview.displayName = "StepReview";

/* ════════════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════════════ */
const NavBar = memo(({
  currentStep, totalSteps, onPrev, onNext,
  isSubmitting, isReviewStep, isMobile,
}) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: 36, paddingTop: 24,
    borderTop: "1.5px solid #f3f4f6",
    gap: 12, flexWrap: "wrap",
  }}>
    <div>
      {currentStep > 0 && (
        <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
          type="button" onClick={onPrev} disabled={isSubmitting}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "13px 22px",
            background: "#f9fafb", color: "#374151",
            border: "1.5px solid #e5e7eb", borderRadius: 50,
            fontSize: 14, fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
            transition: "all .2s", fontFamily: "inherit",
          }}>
          <ArrowLeft size={16} />
          Back
        </motion.button>
      )}
    </div>

    <div style={{ display: "flex", gap: 14, alignItems: "center", marginLeft: "auto" }}>
      {/* Progress dots */}
      {!isMobile && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div key={i}
              animate={{
                width: i === currentStep ? 22 : 7,
                background: i < currentStep ? "#10b981"
                  : i === currentStep ? "linear-gradient(90deg,#059669,#10b981)"
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
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNext(); }}
        disabled={isSubmitting}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "14px 28px",
          background: isReviewStep
            ? "linear-gradient(135deg,#25D366,#128C7E)"
            : "linear-gradient(135deg,#059669,#10b981)",
          color: "#fff", border: "none", borderRadius: 50,
          fontSize: 14.5, fontWeight: 800,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
          boxShadow: isReviewStep
            ? "0 4px 18px rgba(37,211,102,.4)"
            : "0 4px 18px rgba(5,150,105,.3)",
          transition: "all .2s", fontFamily: "inherit",
          minWidth: isMobile ? 160 : 220, justifyContent: "center",
        }}
      >
        {isSubmitting ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block" }}
            >⟳</motion.span>
            &nbsp;Sending…
          </>
        ) : isReviewStep ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Submit via WhatsApp
          </>
        ) : (
          <>Next Step <ArrowRight size={16} /></>
        )}
      </motion.button>
    </div>
  </div>
));
NavBar.displayName = "NavBar";

/* ════════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════════ */
const TOTAL_STEPS = 4;

const BookingSteps = ({
  currentStep,
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  isMobile, isTablet,
  displayName,
  categoriesList, destinationsList, countriesList,
  groupTypes, accommodationTypes,
  interests, handleInterestToggle,
  getTripDuration, getTotalVisitors,
  nextStep, prevStep,
  isSubmitting, isReviewStep,
  user, isAuthenticated,
}) => {
  const sharedProps = {
    formData, setFormData, errors, touched,
    handleChange, handleBlur, isMobile, displayName,
  };

  const steps = [
    <StepTrip key="trip" {...sharedProps}
      destinationsList={destinationsList}
      countriesList={countriesList}
      categoriesList={categoriesList}
      getTripDuration={getTripDuration}
    />,
    <StepTravelers key="travelers" {...sharedProps}
      groupTypes={groupTypes}
      accommodationTypes={accommodationTypes}
      getTotalVisitors={getTotalVisitors}
    />,
    <StepContact key="contact" {...sharedProps}
      interests={interests}
      handleInterestToggle={handleInterestToggle}
      user={user}
      isAuthenticated={isAuthenticated}
    />,
    <StepReview key="review"
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
          key={`step-inner-${currentStep}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          {steps[currentStep] ?? null}
        </motion.div>
      </AnimatePresence>

      <NavBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrev={prevStep}
        onNext={nextStep}
        isSubmitting={isSubmitting}
        isReviewStep={isReviewStep}
        isMobile={isMobile}
      />
    </>
  );
};

export default BookingSteps;