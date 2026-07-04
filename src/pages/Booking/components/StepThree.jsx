// src/pages/Booking/components/StepThree.jsx
// (fixed: removed outer motion wrapper)
import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, CheckCircle, MessageSquare } from "lucide-react";
import { THEME } from "../BookingShared";
import { InterestTag } from "./FormComponents";
import { ADMIN_CONTACT } from "../BookingShared";

const StepThree = memo(({ formData, interests, handleInterestToggle, isMobile, displayName }) => {
  const selectedCount = formData.interests.length;

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
          <Heart size={28} color="white" />
        </motion.div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 34, fontWeight: 700, color: THEME.text, marginBottom: 10 }}>
          What Excites You <span style={{ color: THEME.primary }}>Most?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: THEME.textLight, lineHeight: 1.65, maxWidth: 540, margin: "0 auto" }}>
          {displayName ? `Excellent, ${displayName}! ` : ""}Select the experiences that excite you most and we'll build a custom itinerary.
        </p>
      </div>

      {/* Interest tags */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: isMobile ? 14 : 16, fontWeight: 700, color: THEME.text }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: THEME.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star size={17} color={THEME.primary} />
          </div>
          Select Your Interests
          <span style={{ fontSize: 12, color: THEME.textLight, fontWeight: 500 }}>(choose as many as you like)</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12 }}>
          {interests.map((interest, i) => (
            <motion.div
              key={interest.name}
              initial={{ opacity: 0, scale: 0.88 }}
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

        {/* Progress feedback */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              style={{
                marginTop: 20, padding: "14px 18px",
                backgroundColor: selectedCount >= 3 ? THEME.background : THEME.gray50,
                borderRadius: 13,
                border: `2px solid ${selectedCount >= 3 ? THEME.primaryLighter : THEME.gray200}`,
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: selectedCount >= 3 ? THEME.primary : THEME.gray400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={19} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedCount >= 3 ? THEME.primaryDark : THEME.text }}>
                  {selectedCount === 0 ? "Select your interests" : selectedCount < 3 ? `${selectedCount} selected — add a few more!` : `${selectedCount} interests selected ✨`}
                </div>
                <div style={{ fontSize: 12, color: THEME.textLight }}>
                  {selectedCount >= 3 ? "We'll build a tailored itinerary around these." : "The more you select, the better we can customise your trip."}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{
          marginTop: 32, padding: isMobile ? 18 : 22,
          background: "linear-gradient(135deg, rgba(37,211,102,0.08), rgba(5,150,105,0.05))",
          borderRadius: 16, border: "1px solid rgba(37,211,102,0.2)",
          display: "flex", alignItems: "flex-start", gap: 14,
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg, #25D366, #128C7E)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageSquare size={22} color="white" />
        </div>
        <div>
          <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: THEME.primaryDark, marginBottom: 5 }}>
            Personalised Pricing
          </div>
          <p style={{ fontSize: isMobile ? 13 : 14, color: THEME.textLight, lineHeight: 1.6, margin: 0 }}>
            After you submit, <strong>{ADMIN_CONTACT.name}</strong> will contact you via WhatsApp with a custom quote built around your interests.
          </p>
        </div>
      </motion.div>
    </div>
  );
});

export default StepThree;