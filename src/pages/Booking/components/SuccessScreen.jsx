import React, { memo } from "react";
import { motion } from "framer-motion";
import { ADMIN_CONTACT, THEME, getWhatsAppLink } from "../BookingShared";
import MagneticButton from "./MagneticButton";

const SuccessScreen = memo(({ isMobile, displayName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        textAlign: "center",
        padding: isMobile ? "50px 20px" : "70px 40px",
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
        style={{
          width: isMobile ? 110 : 140,
          height: isMobile ? 110 : 140,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 30px",
          boxShadow: `0 24px 56px ${THEME.shadowDark}`,
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
        >
          <svg width={isMobile ? 50 : 65} height={isMobile ? 50 : 65} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? 30 : 44,
          fontWeight: 700,
          color: THEME.text,
          marginBottom: 16,
        }}
      >
        {displayName ? `Congratulations, ${displayName}! 🎉` : "Congratulations! 🎉"}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: isMobile ? "14px 26px" : "16px 32px",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          color: "white",
          borderRadius: 50,
          fontSize: isMobile ? 14 : 16,
          fontWeight: 600,
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(37, 211, 102, 0.4)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Redirecting to WhatsApp...
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: isMobile ? 15 : 18,
          color: THEME.textLight,
          marginBottom: 32,
          maxWidth: 540,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.7,
        }}
      >
        Your booking request has been successfully submitted! You'll be redirected to WhatsApp shortly where <strong>{ADMIN_CONTACT.name}</strong> will personally assist you with payment details and finalize your dream East African adventure.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "20px 28px",
          background: THEME.background,
          borderRadius: 18,
          marginBottom: 32,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <span style={{ fontSize: 14, color: THEME.textLight }}>
          Need immediate assistance?
        </span>
        <a
          href={getWhatsAppLink(
            `Hello ${ADMIN_CONTACT.name}! I just submitted a booking request and wanted to follow up.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 24px",
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            color: "white",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(37, 211, 102, 0.3)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.44-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chat with {ADMIN_CONTACT.name}
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <MagneticButton>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: isMobile ? "15px 24px" : "17px 32px",
              borderRadius: 16,
              border: `2px solid ${THEME.gray200}`,
              backgroundColor: "transparent",
              color: THEME.gray700,
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Return Home
          </button>
        </MagneticButton>
        <MagneticButton>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: isMobile ? "15px 24px" : "17px 32px",
              borderRadius: 16,
              border: "none",
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              color: "white",
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 8px 24px ${THEME.shadowDark}`,
              transition: "all 0.3s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            Explore Destinations
          </button>
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
});

export default SuccessScreen;
