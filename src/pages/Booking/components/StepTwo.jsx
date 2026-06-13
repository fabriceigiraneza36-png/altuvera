// src/pages/Booking/components/StepTwo.jsx
// (fixed: removed outer motion wrapper)
import React, { memo } from "react";
import { motion } from "framer-motion";
import { Users, Home } from "lucide-react";
import { THEME } from "../BookingShared";
import { Counter, SelectionCard } from "./FormComponents";

const StepTwo = memo(({ formData, setFormData, groupTypes, accommodationTypes, getTotalVisitors, isMobile, displayName }) => {
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
          <Users size={28} color="white" />
        </motion.div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 34, fontWeight: 700, color: THEME.text, marginBottom: 10 }}>
          Who's Joining the <span style={{ color: THEME.primary }}>Adventure?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: THEME.textLight, lineHeight: 1.65, maxWidth: 540, margin: "0 auto" }}>
          {displayName ? `Perfect, ${displayName}! ` : ""}Tell us about your group so we can tailor the experience.
        </p>
      </div>

      {/* Group type */}
      <div style={{ marginBottom: 34 }}>
        <SectionLabel icon={<Users size={17} color={THEME.primary} />} text="Group Type" />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)", gap: isMobile ? 10 : 13 }}>
          {groupTypes.map((type, i) => (
            <motion.button
              key={type.id}
              type="button"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFormData((prev) => ({ ...prev, groupType: type.id }))}
              whileHover={{ borderColor: THEME.primary, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: isMobile ? "14px 8px" : "18px 12px",
                borderRadius: 15,
                border: `2px solid ${formData.groupType === type.id ? THEME.primary : THEME.gray200}`,
                backgroundColor: formData.groupType === type.id ? THEME.background : THEME.white,
                cursor: "pointer", textAlign: "center",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontSize: isMobile ? 26 : 32, marginBottom: 7 }}>{type.icon}</div>
              <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 650, color: THEME.text }}>
                {isMobile ? type.name : type.full_name}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Traveler counts */}
      <div style={{ marginBottom: 34 }}>
        <SectionLabel icon={<Users size={17} color={THEME.primary} />} text="Number of Travelers" />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <Counter label="Adults" description="18 years and above" value={formData.adults} onChange={(v) => setFormData((p) => ({ ...p, adults: v }))} min={1} max={20} isMobile={isMobile} />
          <Counter label="Children" description="2–17 years old" value={formData.children} onChange={(v) => setFormData((p) => ({ ...p, children: v }))} min={0} max={15} isMobile={isMobile} />
        </div>

        <motion.div
          key={getTotalVisitors()}
          initial={{ scale: 0.96 }} animate={{ scale: 1 }}
          style={{
            marginTop: 18, padding: isMobile ? 16 : 22,
            background: `linear-gradient(135deg, ${THEME.background}, ${THEME.backgroundAlt})`,
            borderRadius: 16, border: `2px solid ${THEME.primaryLighter}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11, color: THEME.primaryDark, fontWeight: 600, fontSize: isMobile ? 15 : 17 }}>
            <Users size={22} color={THEME.primary} /> Total Travelers
          </div>
          <motion.span key={getTotalVisitors()} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            style={{ fontSize: isMobile ? 34 : 42, fontWeight: 800, color: THEME.primary }}>
            {getTotalVisitors()}
          </motion.span>
        </motion.div>
      </div>

      {/* Accommodation */}
      <div>
        <SectionLabel icon={<Home size={17} color={THEME.primary} />} text="Accommodation Style" />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          {accommodationTypes.map((type, i) => (
            <motion.div key={type.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <SelectionCard
                selected={formData.accommodation === type.id}
                onClick={() => setFormData((prev) => ({ ...prev, accommodation: type.id }))}
                icon={type.icon} title={type.name} description={type.description}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

const SectionLabel = ({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </div>
    {text}
  </div>
);

export default StepTwo;