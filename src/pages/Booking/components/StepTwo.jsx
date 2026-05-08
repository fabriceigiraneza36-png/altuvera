import React, { memo } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiHome } from "react-icons/fi";
import { THEME } from "../BookingShared";
import { Counter, SelectionCard } from "./FormComponents";

const StepTwo = memo(
  ({
    formData,
    setFormData,
    groupTypes,
    accommodationTypes,
    getTotalVisitors,
    isMobile,
    displayName,
  }) => {
    const getPersonalizedGroupMessage = () => {
      if (displayName) {
        return `Perfect, ${displayName}! Now let's customize your group and accommodation preferences.`;
      }
      return "Great choice! Now let's customize your group and accommodation preferences.";
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
            <FiUsers size={30} color="white" />
          </motion.div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 26 : 36,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 10,
            }}
          >
            Who's Joining the{" "}
            <span style={{ color: THEME.primary }}>Adventure?</span>
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
            {getPersonalizedGroupMessage()}
          </p>
        </div>

        {/* Group Type Selection */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: THEME.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiUsers size={18} color={THEME.primary} />
            </div>
            Group Type
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(3, 1fr)"
                : "repeat(5, 1fr)",
              gap: isMobile ? 10 : 14,
            }}
          >
            {groupTypes.map((type, i) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, groupType: type.id }))
                }
                style={{
                  padding: isMobile ? "16px 10px" : "20px 14px",
                  borderRadius: 16,
                  border: `2px solid ${formData.groupType === type.id ? THEME.primary : THEME.gray200}`,
                  backgroundColor:
                    formData.groupType === type.id
                      ? THEME.background
                      : THEME.white,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: isMobile ? 28 : 34, marginBottom: 8 }}>
                  {type.icon}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 600,
                    color: THEME.text,
                  }}
                >
                  {isMobile ? type.name : type.full_name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Travelers Count */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: THEME.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiUsers size={18} color={THEME.primary} />
            </div>
            Number of Travelers
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 18,
            }}
          >
            <Counter
              label="Adults"
              description="18 years and above"
              value={formData.adults}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, adults: val }))
              }
              min={1}
              max={20}
              isMobile={isMobile}
            />
            <Counter
              label="Children"
              description="2-17 years old"
              value={formData.children}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, children: val }))
              }
              min={0}
              max={15}
              isMobile={isMobile}
            />
          </div>

          {/* Total Travelers */}
          <motion.div
            key={getTotalVisitors()}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            style={{
              marginTop: 20,
              padding: isMobile ? 18 : 24,
              background: `linear-gradient(135deg, ${THEME.background} 0%, ${THEME.backgroundAlt} 100%)`,
              borderRadius: 18,
              border: `2px solid ${THEME.primaryLighter}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: THEME.primaryDark,
                fontWeight: 600,
                fontSize: isMobile ? 15 : 17,
              }}
            >
              <FiUsers size={24} color={THEME.primary} />
              Total Travelers
            </div>
            <motion.span
              key={getTotalVisitors()}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: isMobile ? 36 : 44,
                fontWeight: 800,
                color: THEME.primary,
              }}
            >
              {getTotalVisitors()}
            </motion.span>
          </motion.div>
        </div>

        {/* Accommodation */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: THEME.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiHome size={18} color={THEME.primary} />
            </div>
            Accommodation Style
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            {accommodationTypes.map((type, i) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <SelectionCard
                  selected={formData.accommodation === type.id}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, accommodation: type.id }))
                  }
                  icon={type.icon}
                  title={type.name}
                  description={type.description}
                  isMobile={isMobile}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  },
);

export default StepTwo;
