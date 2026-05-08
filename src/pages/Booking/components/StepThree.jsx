import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiCheckCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { THEME } from "../BookingShared";
import { InterestTag } from "./FormComponents";

const StepThree = memo(({ formData, setFormData, interests, handleInterestToggle, isMobile, displayName }) => {
  const getPersonalizedInterestsMessage = () => {
    if (displayName) {
      return `Excellent choices so far, ${displayName}! Now let's discover what activities will make your trip unforgettable.`;
    }
    return "Excellent choices so far! Now let's discover what activities will make your trip unforgettable.";
  };

  const selectedCount = formData.interests.length;
  const getProgressMessage = () => {
    if (selectedCount === 0) return "Select your interests to personalize your experience";
    if (selectedCount < 3) return "Great start! Feel free to add more interests";
    return `Perfect! ${selectedCount} interests selected for your customized itinerary`;
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
          <FiHeart size={30} color="white" />
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
          What Excites You <span style={{ color: THEME.primary }}>Most?</span>
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
          {getPersonalizedInterestsMessage()}
        </p>
      </div>

      {/* Interests */}
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
            <FiStar size={18} color={THEME.primary} />
          </div>
          Select Your Interests
          <span
            style={{ fontSize: 12, color: THEME.textLight, fontWeight: 500 }}
          >
            (Select as many as you like)
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {interests.map((interest, i) => (
            <motion.div
              key={interest.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <InterestTag
                selected={formData.interests.includes(interest.name)}
                onClick={() => handleInterestToggle(interest.name)}
                icon={interest.icon}
                name={interest.name}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </div>

        {/* Personalized Progress Message */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              style={{
                marginTop: 24,
                padding: "16px 20px",
                backgroundColor: selectedCount >= 3 ? THEME.background : THEME.gray50,
                borderRadius: 14,
                border: `2px solid ${selectedCount >= 3 ? THEME.primaryLighter : THEME.gray200}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: selectedCount >= 3 ? THEME.primary : THEME.gray400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiCheckCircle size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: selectedCount >= 3 ? THEME.primaryDark : THEME.text,
                    marginBottom: 2,
                  }}
                >
                  {getProgressMessage()}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: THEME.textLight,
                  }}
                >
                  {selectedCount >= 3
                    ? "Your selections will help us create the perfect itinerary for you!"
                    : "The more interests you select, the better we can customize your experience."
                  }
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Special Preferences Note */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 36,
          padding: isMobile ? 20 : 24,
          background: `linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)`,
          borderRadius: 18,
          border: "1px solid rgba(37, 211, 102, 0.2)",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FaWhatsapp size={24} color="white" />
        </div>
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 16,
              fontWeight: 700,
              color: THEME.primaryDark,
              marginBottom: 6,
            }}
          >
            Personalized Pricing Available
          </div>
          <p
            style={{
              fontSize: isMobile ? 13 : 14,
              color: THEME.textLight,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            After submitting your request, our travel expert{" "}
            <strong>IGIRANEZA Fabrice</strong> will contact you via
            WhatsApp with a customized quote tailored to your preferences.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default StepThree;
