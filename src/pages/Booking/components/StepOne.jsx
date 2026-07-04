// src/pages/Booking/components/StepOne.jsx
// (fixed: removed internal motion wrapper since BookingSteps handles animation)
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Globe, Calendar, Star, Compass } from "lucide-react";
import { THEME, normalizeOptionLabel, normalizeOptionValue } from "../BookingShared";
import { FormSelect, FormInput } from "./FormComponents";

const StepOne = memo(({
  formData, setFormData,
  errors, touched,
  handleChange, handleBlur,
  categoriesList, destinationsList, countriesList, servicesData,
  getTripDuration, isMobile, displayName,
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 30 : 42 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
          style={{
            width: 66, height: 66, borderRadius: "50%",
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: `0 12px 30px rgba(5,150,105,0.3)`,
          }}
        >
          <Compass size={28} color="white" />
        </motion.div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? 24 : 34,
          fontWeight: 700, color: THEME.text, marginBottom: 10, lineHeight: 1.2,
        }}>
          {displayName ? `${greeting}, ${displayName}! ` : `${greeting}! `}
          <span style={{ color: THEME.primary }}>Where to?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: THEME.textLight, lineHeight: 1.65, maxWidth: 560, margin: "0 auto" }}>
          Choose your destination and travel dates to begin planning your perfect African adventure.
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 18 : 22 }}>
        <FormSelect
          name="tripType"
          label="Safari Experience"
          icon={Sunrise}
          options={
            categoriesList.length > 0
              ? categoriesList.map((c) => typeof c === "object" ? { id: c.category || c.name || c.id, name: c.category || c.name || String(c) } : { id: c, name: c })
              : servicesData.map((s) => ({ id: s.id || s.name, name: normalizeOptionLabel(s.name || s.title || s) }))
          }
          required
          placeholder="What type of adventure?"
          value={formData.tripType}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.tripType}
          touched={touched.tripType}
          isMobile={isMobile}
        />

        <FormSelect
          name="destination"
          label="Destination"
          icon={Globe}
          options={destinationsList.length > 0 ? destinationsList : countriesList}
          required
          placeholder="Where would you like to go?"
          value={formData.destination}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.destination}
          touched={touched.destination}
          isMobile={isMobile}
        />

        <FormInput
          name="startDate" label="Start Date" type="date"
          icon={Calendar} required
          value={formData.startDate}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.startDate} touched={touched.startDate}
          isMobile={isMobile}
          min={new Date().toISOString().split("T")[0]}
        />

        <FormInput
          name="endDate" label="End Date" type="date"
          icon={Calendar} required
          value={formData.endDate}
          onChange={handleChange} onBlur={handleBlur}
          error={errors.endDate} touched={touched.endDate}
          isMobile={isMobile}
          min={formData.startDate || new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Quick destination picks */}
      {destinationsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            marginTop: 28, padding: isMobile ? 18 : 24,
            background: `linear-gradient(135deg, ${THEME.backgroundAlt}, ${THEME.background})`,
            borderRadius: 18, border: `2px solid ${THEME.primaryLighter}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, fontSize: isMobile ? 14 : 16, fontWeight: 700, color: THEME.primaryDark }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: THEME.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={16} color="white" />
            </div>
            Popular Destinations
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {destinationsList.slice(0, 6).map((dest, i) => {
              const id = normalizeOptionValue(dest.id || dest._id || dest.slug || dest.name || dest);
              const isActive = formData.destination === id;
              return (
                <motion.button
                  key={id || i}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, destination: id }))}
                  whileHover={{ y: -2, boxShadow: `0 6px 18px ${THEME.shadow}` }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "12px 14px", borderRadius: 12,
                    backgroundColor: isActive ? THEME.primary : THEME.white,
                    border: `2px solid ${isActive ? THEME.primary : THEME.gray200}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.22s ease",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: isActive ? "#fff" : THEME.text, marginBottom: 2 }}>
                    {dest.flag ? `${dest.flag} ` : ""}{normalizeOptionLabel(dest.name || dest.title || dest.slug)}
                  </div>
                  {(dest.country || dest.region) && (
                    <div style={{ fontSize: 11, color: isActive ? "rgba(255,255,255,0.78)" : THEME.textLight }}>
                       {normalizeOptionLabel(dest.country || dest.region).label}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Duration badge */}
      <AnimatePresence>
        {getTripDuration() && (
          <motion.div
            initial={{ opacity: 0, y: 14, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 14, height: 0 }}
            style={{
              marginTop: 24, padding: isMobile ? 16 : 22,
              background: `linear-gradient(135deg, ${THEME.background}, ${THEME.backgroundAlt})`,
              borderRadius: 16, border: `2px solid ${THEME.primaryLighter}`,
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: THEME.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${THEME.shadow}` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: THEME.primaryDark, fontWeight: 600 }}>Trip Duration</div>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: THEME.primary }}>{getTripDuration()}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default StepOne;