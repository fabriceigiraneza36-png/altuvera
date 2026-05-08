import React, { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSunrise, FiGlobe, FiCalendar, FiStar } from "react-icons/fi";
import { THEME, normalizeOptionLabel } from "../BookingShared";
import { FormSelect, FormInput } from "./FormComponents";

const StepOne = memo(
  ({
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    categoriesList,
    destinationsList,
    countriesList,
    servicesData,
    getTripDuration,
    isMobile,
    displayName,
  }) => {
    const getPersonalizedGreeting = () => {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

      if (displayName) {
        return `${timeGreeting}, ${displayName}!`;
      }
      return `${timeGreeting}!`;
    };

    const getPersonalizedSubtitle = () => {
      if (formData.email) {
        return "Let's create your perfect African adventure. Based on your preferences, here are some tailored recommendations.";
      }
      return "Let's start planning your perfect African adventure. Choose from our most popular destinations.";
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 12px 32px ${THEME.shadowDark}`,
            }}
          >
            <FiCompass size={30} color="white" />
          </motion.div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 26 : 36,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            {getPersonalizedGreeting()}{" "}
            <span style={{ color: THEME.primary }}>Where's Your Dream Destination?</span>
          </h2>
          <p
            style={{
              fontSize: isMobile ? 14 : 16,
              color: THEME.textLight,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            {getPersonalizedSubtitle()}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 20 : 24,
          }}
        >
          <FormSelect
            name="tripType"
            label="Safari Experience"
            icon={FiSunrise}
            options={
              categoriesList.length > 0
                ? categoriesList.map((c) => {
                    if (typeof c === "object" && c !== null) {
                      if (c.category) return { id: c.category, name: c.category };
                      if (c.name) return { id: c.name, name: c.name };
                      return { id: String(c), name: String(c) };
                    }
                    return { id: c, name: c };
                  })
                : servicesData.map((s) => ({
                    id: s.id || s.value || s.name,
                    name: normalizeOptionLabel(s.name || s.title || s),
                  }))
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
            label="Where would you like to explore?"
            icon={FiGlobe}
            options={destinationsList.length > 0 ? destinationsList : countriesList}
            required
            placeholder="Select your destination..."
            value={formData.destination}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.destination}
            touched={touched.destination}
            isMobile={isMobile}
          />

          <FormInput
            name="startDate"
            label="Start Date"
            type="date"
            icon={FiCalendar}
            required
            value={formData.startDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.startDate}
            touched={touched.startDate}
            isMobile={isMobile}
            min={new Date().toISOString().split("T")[0]}
          />

          <FormInput
            name="endDate"
            label="End Date"
            type="date"
            icon={FiCalendar}
            required
            value={formData.endDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.endDate}
            touched={touched.endDate}
            isMobile={isMobile}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Personalized Recommendations */}
        {displayName && destinationsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: 32,
              padding: isMobile ? 20 : 24,
              background: `linear-gradient(135deg, ${THEME.backgroundAlt} 0%, ${THEME.background} 100%)`,
              borderRadius: 18,
              border: `2px solid ${THEME.primaryLighter}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                fontSize: isMobile ? 15 : 17,
                fontWeight: 700,
                color: THEME.primaryDark,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: THEME.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiStar size={18} color="white" />
              </div>
              Recommended for You, {displayName}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {destinationsList.slice(0, 3).map((dest, i) => (
                <motion.div
                  key={dest.id || dest._id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  onClick={() => setFormData(prev => ({ ...prev, destination: dest.id || dest._id || dest.name }))}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: formData.destination === (dest.id || dest._id || dest.name) ? THEME.primary : THEME.white,
                    border: `2px solid ${formData.destination === (dest.id || dest._id || dest.name) ? THEME.primary : THEME.gray200}`,
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    boxShadow: formData.destination === (dest.id || dest._id || dest.name) ? `0 4px 16px ${THEME.shadow}` : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: 700,
                      color: formData.destination === (dest.id || dest._id || dest.name) ? THEME.white : THEME.text,
                      marginBottom: 4,
                    }}
                  >
                    {normalizeOptionLabel(dest.name || dest.title)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: formData.destination === (dest.id || dest._id || dest.name) ? "rgba(255,255,255,0.8)" : THEME.textLight,
                    }}
                  >
                    {normalizeOptionLabel(dest.location || dest.country)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {getTripDuration() && (
            <motion.div
              initial={{ opacity: 0, y: 16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 16, height: 0 }}
              style={{
                marginTop: 28,
                padding: isMobile ? 18 : 24,
                background: `linear-gradient(135deg, ${THEME.background} 0%, ${THEME.backgroundAlt} 100%)`,
                borderRadius: 18,
                border: `2px solid ${THEME.primaryLighter}`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: THEME.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${THEME.shadow}`,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={THEME.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: THEME.primaryDark,
                    fontWeight: 600,
                  }}
                >
                  Trip Duration
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 24 : 30,
                    fontWeight: 800,
                    color: THEME.primary,
                  }}
                >
                  {getTripDuration()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

export default StepOne;
