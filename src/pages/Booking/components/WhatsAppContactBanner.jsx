import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { ADMIN_CONTACT, THEME, getWhatsAppLink } from "../BookingShared";

const WhatsAppContactBanner = memo(({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const message = `Hello ${ADMIN_CONTACT.name}! 👋\n\nI'm interested in planning a trip with Altuvera Tours. Could you help me with information about destinations, availability, and pricing?\n\nThank you!`;
    window.open(getWhatsAppLink(message), "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        background: `linear-gradient(135deg, ${THEME.backgroundAlt} 0%, ${THEME.background} 100%)`,
        borderRadius: 20,
        padding: isMobile ? "18px 20px" : "22px 28px",
        marginBottom: isMobile ? 28 : 40,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: isMobile ? 16 : 24,
        border: `2px solid rgba(5, 150, 105, 0.15)`,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: isHovered
          ? `0 12px 32px ${THEME.shadow}`
          : "0 4px 16px rgba(0, 0, 0, 0.04)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(37, 211, 102, 0.35)",
            flexShrink: 0,
          }}
        >
          <FaWhatsapp size={28} color="white" />
        </motion.div>
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.primaryDark,
              marginBottom: 4,
            }}
          >
            Chat with {ADMIN_CONTACT.name}
          </div>
          <div
            style={{
              fontSize: isMobile ? 13 : 14,
              color: THEME.textLight,
            }}
          >
            Get personalized quotes & instant support
          </div>
        </div>
      </div>

      <motion.div
        animate={{ x: isHovered ? 5 : 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: isMobile ? "12px 20px" : "14px 24px",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          borderRadius: 14,
          color: "white",
          fontWeight: 600,
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.3)",
          width: isMobile ? "100%" : "auto",
          justifyContent: "center",
        }}
      >
        <FaWhatsapp size={18} />
        <span style={{ fontSize: isMobile ? 13 : 14, lineHeight: 1.6, textAlign: isMobile ? "center" : "left" }}>
          {ADMIN_CONTACT.phone1}
          <br />
          {ADMIN_CONTACT.phone2}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </motion.div>
    </motion.div>
  );
});

export default WhatsAppContactBanner;
