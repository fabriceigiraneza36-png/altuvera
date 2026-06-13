// WhatsAppButton.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ============================================================
// TYPOGRAPHY
// Use the same serif family as the hero heading for a consistent
// visual rhythm across the main app surfaces.
// ============================================================

const HEADING_FONT = "'Playfair Display', Georgia, serif";
const BODY_FONT =
  "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif";

// ============================================================
// CONFIGURATION
// ============================================================
const CONTACT_INFO = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 792352409",
  phone2: "+250 792352409",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792352409",
};

const PRESET_MESSAGES = [
  {
    id: 1,
    label: "General Inquiry",
    emoji: "💬",
    message:
      "Hello! I'm interested in learning more about your travel services.",
  },
  {
    id: 2,
    label: "Book a Trip",
    emoji: "✈️",
    message: "Hi! I would like to book a trip. Can you help me?",
  },
  {
    id: 3,
    label: "Tour Packages",
    emoji: "🎒",
    message: "Hello! I'm interested in your tour packages.",
  },
  {
    id: 4,
    label: "Custom Itinerary",
    emoji: "📋",
    message: "Hi! I need help creating a custom travel itinerary.",
  },
  {
    id: 5,
    label: "Get Support",
    emoji: "🤝",
    message: "Hello! I need assistance with my booking.",
  },
  {
    id: 6,
    label: "Price Quote",
    emoji: "💰",
    message: "Hi! Can I get a price quote for your services?",
  },
];

// ============================================================
// ICONIFY ICONS
// ============================================================
const ICONIFY_MAP = {
  WhatsApp: "logos:whatsapp-icon",
  Close: "mdi:close",
  Send: "mdi:send",
  User: "mdi:account-circle-outline",
  MessageSquare: "mdi:message-text-outline",
  Chat: "mdi:chat-processing-outline",
  Phone: "mdi:phone-outline",
  Shield: "mdi:shield-check-outline",
  Rocket: "mdi:rocket-launch-outline",
  ArrowRight: "mdi:chevron-right",
  ArrowLeft: "mdi:chevron-left",
  Check: "mdi:check-bold",
  ExternalLink: "mdi:open-in-new",
  Clock: "mdi:clock-time-five-outline",
  Sparkle: "mdi:creation",
};

const getIconUrl = (name, size = 24, color = "#000") => {
  const icon = ICONIFY_MAP[name];
  if (!icon) return "";
  const hex = (color || "#000").replace("#", "");
  return `https://api.iconify.design/${icon}.svg?color=%23${hex}&width=${size}&height=${size}`;
};

const Icon = ({ name, size = 24, color = "#000", style = {} }) => (
  <img
    src={getIconUrl(name, size, color)}
    alt=""
    width={size}
    height={size}
    style={{ display: "block", flexShrink: 0, ...style }}
    loading="lazy"
    draggable={false}
  />
);

// ============================================================
// CONFETTI
// ============================================================
const fireConfetti = () => {
  const end = Date.now() + 2200;
  const colors = ["#25D366", "#128C7E", "#ffffff", "#dcfce7", "#075E54"];

  const burst = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      zIndex: 99999999,
    });
  };

  burst();

  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      particleCount: 25,
      spread: 360,
      startVelocity: 20,
      ticks: 40,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors,
      zIndex: 99999999,
    });
  }, 250);

  setTimeout(() => {
    confetti({
      particleCount: 35,
      angle: 60,
      spread: 45,
      origin: { x: 0 },
      colors,
      zIndex: 99999999,
    });
    confetti({
      particleCount: 35,
      angle: 120,
      spread: 45,
      origin: { x: 1 },
      colors,
      zIndex: 99999999,
    });
  }, 400);
};

// ============================================================
// STYLES OBJECT
// ============================================================
const S = {
  // Floating button area
  floatingWrap: (isMobile) => ({
    position: "fixed",
    bottom: isMobile ? 18 : 28,
    left: isMobile ? 18 : 28,
    zIndex: 999999,
    display: "flex",
    alignItems: "center",
    gap: 12,
  }),

  pulseRing: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,211,102,0.35) 0%, transparent 70%)",
    left: -5,
    top: -5,
    zIndex: 0,
  },

  mainBtn: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(145deg, #25D366 0%, #128C7E 60%, #075E54 100%)",
    border: "3px solid rgba(255,255,255,0.9)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 6px 24px rgba(37,211,102,0.5), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
    position: "relative",
    zIndex: 2,
    outline: "none",
  },

  tooltip: {
    background: "linear-gradient(135deg, #fff 0%, #f0fdf4 100%)",
    color: "#075E54",
    padding: "8px 16px",
    borderRadius: 22,
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    whiteSpace: "nowrap",
    border: "1.5px solid #c8e6c9",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: BODY_FONT,
    letterSpacing: 0.2,
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999999,
    padding: 16,
    fontFamily: BODY_FONT,
  },

  modal: (isMobile) => ({
    backgroundColor: "#ffffff",
    borderRadius: 26,
    width: isMobile ? "100%" : 420,
    maxWidth: 420,
    maxHeight: isMobile ? "94vh" : "90vh",
    boxShadow:
      "0 25px 80px rgba(0,0,0,0.2), 0 8px 30px rgba(37,211,102,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(37,211,102,0.08)",
  }),

  accentBar: {
    height: 4,
    flexShrink: 0,
    background: "linear-gradient(90deg, #25D366, #128C7E, #075E54, #128C7E, #25D366)",
    backgroundSize: "200% 100%",
  },

  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1.5px solid #e8f5e9",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    outline: "none",
  },

  // Header
  header: (isMobile) => ({
    textAlign: "center",
    flexShrink: 0,
    padding: isMobile ? "20px 18px 16px" : "26px 28px 18px",
    background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
    position: "relative",
  }),

  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(145deg, #25D366, #128C7E, #075E54)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    border: "3px solid #fff",
    boxShadow: "0 8px 28px rgba(37,211,102,0.3)",
  },

  headerTitle: {
    margin: "0 0 4px",
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#075E54",
    fontFamily: HEADING_FONT,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  headerSub: {
    margin: "0 0 10px",
    fontSize: "0.86rem",
    color: "#666",
    fontFamily: BODY_FONT,
  },

  phoneBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e8f5e9",
    padding: "7px 16px",
    borderRadius: 18,
    fontSize: "0.76rem",
    color: "#075E54",
    fontWeight: 600,
    border: "1.5px solid #c8e6c9",
    fontFamily: BODY_FONT,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#25D366",
    boxShadow: "0 0 6px rgba(37,211,102,0.5)",
  },

  onlineText: {
    fontSize: "0.73rem",
    color: "#999",
    fontFamily: BODY_FONT,
  },

  // Content area
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
  },

  stepPadding: (isMobile) => ({
    padding: isMobile ? "16px 18px 20px" : "18px 26px 24px",
  }),

  stepLabel: {
    textAlign: "center",
    color: "#888",
    fontSize: "0.86rem",
    margin: "0 0 16px",
    fontWeight: 600,
    fontFamily: HEADING_FONT,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Action cards
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "15px 16px",
    backgroundColor: "#fff",
    border: "2px solid #e0f2e1",
    borderRadius: 18,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    outline: "none",
    fontFamily: BODY_FONT,
  },

  actionIcon: (gradient) => ({
    width: 48,
    height: 48,
    borderRadius: 14,
    background: gradient,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 14px rgba(37,211,102,0.18)",
  }),

  actionTitle: {
    fontSize: "0.95rem",
    color: "#111",
    display: "block",
    fontWeight: 700,
    fontFamily: HEADING_FONT,
    letterSpacing: 0.5,
  },

  actionDesc: {
    fontSize: "0.78rem",
    color: "#888",
    fontFamily: BODY_FONT,
  },

  // Response time
  responseTimeBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    padding: "10px 16px",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    border: "1.5px solid #e8f5e9",
  },

  responseTimeText: {
    fontSize: "0.76rem",
    color: "#128C7E",
    fontWeight: 600,
    fontFamily: BODY_FONT,
  },

  // Form elements
  label: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: "0.86rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 8,
    fontFamily: HEADING_FONT,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  labelOptional: {
    fontSize: "0.68rem",
    color: "#bbb",
    fontWeight: 400,
    fontFamily: BODY_FONT,
    textTransform: "none",
    letterSpacing: 0,
  },

  input: {
    width: "100%",
    padding: "13px 18px",
    borderRadius: 14,
    border: "2px solid #e0f2e1",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fafffe",
    color: "#1a1a1a",
    fontFamily: BODY_FONT,
    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
  },

  textarea: {
    width: "100%",
    padding: "13px 18px",
    borderRadius: 14,
    border: "2px solid #e0f2e1",
    fontSize: "0.9rem",
    resize: "vertical",
    fontFamily: BODY_FONT,
    outline: "none",
    boxSizing: "border-box",
    minHeight: 88,
    backgroundColor: "#fafffe",
    color: "#1a1a1a",
    lineHeight: 1.55,
    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
  },

  charCount: {
    display: "block",
    textAlign: "right",
    fontSize: "0.7rem",
    color: "#bbb",
    marginTop: 4,
    fontFamily: BODY_FONT,
  },

  // Preset grid
  presetGrid: (isMobile) => ({
    display: "grid",
    gap: 8,
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  }),

  presetBtn: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 14px",
    backgroundColor: isActive ? "#dcfce7" : "#fafffe",
    border: `2px solid ${isActive ? "#25D366" : "#e0f2e1"}`,
    borderRadius: 14,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    position: "relative",
    outline: "none",
    fontFamily: BODY_FONT,
    transition: "border-color 0.15s, background-color 0.15s",
  }),

  presetEmoji: {
    fontSize: "1.15rem",
    flexShrink: 0,
    width: 28,
    textAlign: "center",
  },

  presetLabel: (isActive) => ({
    flex: 1,
    fontSize: "0.82rem",
    fontWeight: isActive ? 700 : 500,
    color: isActive ? "#075E54" : "#333",
    fontFamily: BODY_FONT,
  }),

  checkBadge: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #25D366, #128C7E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2.5px solid #fff",
    boxShadow: "0 2px 10px rgba(37,211,102,0.35)",
  },

  // Send button
  sendBtn: (canSend) => ({
    width: "100%",
    padding: "15px 22px",
    borderRadius: 16,
    border: "none",
    cursor: canSend ? "pointer" : "not-allowed",
    background: canSend
      ? "linear-gradient(145deg, #25D366 0%, #128C7E 60%, #075E54 100%)"
      : "linear-gradient(135deg, #c8e6c9, #a5d6a7)",
    color: "#fff",
    fontSize: "0.96rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    outline: "none",
    boxShadow: canSend
      ? "0 6px 24px rgba(37,211,102,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"
      : "none",
    opacity: canSend ? 1 : 0.5,
    fontFamily: HEADING_FONT,
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: "opacity 0.2s",
  }),

  spinner: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
  },

  // Footer
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "13px 20px 15px",
    fontSize: "0.76rem",
    color: "#bbb",
    borderTop: "1px solid #f0fdf4",
    backgroundColor: "#fafffe",
    flexShrink: 0,
    fontFamily: BODY_FONT,
  },

  // Success overlay
  successOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    borderRadius: 26,
  },

  successContent: {
    textAlign: "center",
    padding: "44px 28px",
  },

  successIcon: {
    width: 86,
    height: 86,
    borderRadius: "50%",
    background: "linear-gradient(145deg, #25D366, #128C7E, #075E54)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 22px",
    boxShadow: "0 12px 40px rgba(37,211,102,0.35)",
  },

  successTitle: {
    margin: "0 0 8px",
    fontSize: "1.3rem",
    fontWeight: 800,
    color: "#075E54",
    fontFamily: HEADING_FONT,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  successSub: {
    margin: 0,
    fontSize: "0.88rem",
    color: "#888",
    fontFamily: BODY_FONT,
  },

  bounceDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#25D366",
    display: "inline-block",
  },

  // Back button
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "1.5px solid #e0f2e1",
    color: "#128C7E",
    fontSize: "0.82rem",
    cursor: "pointer",
    padding: "6px 14px",
    marginBottom: 18,
    fontWeight: 700,
    outline: "none",
    borderRadius: 20,
    fontFamily: BODY_FONT,
    transition: "background-color 0.15s",
  },
};

// ============================================================
// COMPONENT
// ============================================================
const WhatsAppButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0
  );

  const isMobile = windowWidth < 480;

  // ── Resize ──
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Initial show ──
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll hide/show ──
  useEffect(() => {
    const handleScroll = () => {
      const cur = window.scrollY;
      const delta = cur - lastScrollY.current;
      if (delta > 15 && cur > 100) setIsVisible(false);
      else if (delta < -15 || cur < 100) setIsVisible(true);
      lastScrollY.current = cur;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Lock body scroll ──
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // ── Helpers ──
  const makeURL = useCallback(
    (message = "") => {
      const phone = CONTACT_INFO.whatsapp.replace(/\D/g, "");
      if (message) {
        const full = userName ? `Hi, I'm ${userName}.\n\n${message}` : message;
        return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(full)}&type=phone_number&app_absent=0`;
      }
      return `https://api.whatsapp.com/send/?phone=${phone}&type=phone_number&app_absent=0`;
    },
    [userName]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setSelectedPreset(null);
      setCustomMessage("");
      setUserName("");
      setShowSuccess(false);
      setIsSending(false);
    }, 350);
  }, []);

  const handleDirect = useCallback(() => {
    setIsSending(true);
    setShowSuccess(true);
    fireConfetti();
    setTimeout(() => {
      window.open(makeURL(), "_blank");
      setIsSending(false);
      setTimeout(closeModal, 600);
    }, 1400);
  }, [makeURL, closeModal]);

  const handleSend = useCallback(() => {
    const msg = selectedPreset
      ? PRESET_MESSAGES.find((p) => p.id === selectedPreset)?.message
      : customMessage;
    if (!msg) return;
    setIsSending(true);
    setShowSuccess(true);
    fireConfetti();
    setTimeout(() => {
      window.open(makeURL(msg), "_blank");
      setIsSending(false);
      setTimeout(closeModal, 600);
    }, 1400);
  }, [selectedPreset, customMessage, makeURL, closeModal]);

  const canSend = selectedPreset || customMessage.trim();
  const showFAB = isVisible && !isModalOpen;

  const focusStyle = (e) => {
    e.target.style.borderColor = "#25D366";
    e.target.style.boxShadow = "0 0 0 4px rgba(37,211,102,0.1)";
    e.target.style.backgroundColor = "#fff";
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = "#e0f2e1";
    e.target.style.boxShadow = "none";
    e.target.style.backgroundColor = "#fafffe";
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* ═══════════ FLOATING ACTION BUTTON ═══════════ */}
      <AnimatePresence>
        {showFAB && (
          <motion.div
            style={S.floatingWrap(isMobile)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
          >
            {/* Pulse */}
            <motion.div
              style={S.pulseRing}
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Second pulse ring */}
            <motion.div
              style={{
                ...S.pulseRing,
                background:
                  "radial-gradient(circle, rgba(37,211,102,0.2) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Main Button */}
            <motion.button
              onClick={openModal}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={S.mainBtn}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{
                scale: 1.14,
                boxShadow:
                  "0 8px 32px rgba(37,211,102,0.55), 0 3px 12px rgba(0,0,0,0.12)",
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open WhatsApp chat"
            >
              <Icon name="WhatsApp" size={isMobile ? 24 : 27} color="#fff" />
            </motion.button>

            {/* Tooltip */}
            {isHovered && !isMobile && (
              <AnimatePresence>
                <motion.div
                  key="whatsapp-tooltip"
                  style={S.tooltip}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: 15 }}
                  >
                    💬
                  </motion.span>
                  <span>Chat with us!</span>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ MODAL ═══════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            style={S.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
          >
            <motion.div
              style={S.modal(isMobile)}
              initial={{ opacity: 0, scale: 0.85, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 60 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated accent bar */}
              <motion.div
                style={S.accentBar}
                animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              {/* Close */}
              <motion.button
                onClick={closeModal}
                style={S.closeBtn}
                whileHover={{
                  scale: 1.12,
                  rotate: 90,
                  backgroundColor: "#dcfce7",
                  borderColor: "#25D366",
                }}
                whileTap={{ scale: 0.88 }}
              >
                <Icon name="Close" size={15} color="#128C7E" />
              </motion.button>

              {/* ═══ SUCCESS ═══ */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    style={S.successOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      style={S.successContent}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    >
                      <motion.div
                        style={S.successIcon}
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 0.6, repeat: 3 }}
                      >
                        <Icon name="Rocket" size={42} color="#fff" />
                      </motion.div>
                      <h3 style={S.successTitle}>Opening WhatsApp!</h3>
                      <p style={S.successSub}>Connecting you now…</p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 10,
                          marginTop: 24,
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            style={S.bounceDot}
                            animate={{ y: [0, -14, 0] }}
                            transition={{
                              duration: 0.55,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ HEADER ═══ */}
              <div style={S.header(isMobile)}>
                <motion.div
                  style={S.headerIcon}
                  animate={{
                    boxShadow: [
                      "0 8px 28px rgba(37,211,102,0.25)",
                      "0 8px 38px rgba(37,211,102,0.5)",
                      "0 8px 28px rgba(37,211,102,0.25)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Icon name="WhatsApp" size={28} color="#fff" />
                </motion.div>

                <h3 style={S.headerTitle}>Let's Connect</h3>

                <p style={S.headerSub}>
                  Chat with{" "}
                  <strong style={{ color: "#075E54", fontWeight: 700 }}>
                    {CONTACT_INFO.name}
                  </strong>
                </p>

                <div style={S.phoneBadge}>
                  <Icon name="Phone" size={15} color="#128C7E" />
                  <span style={{ lineHeight: 1.5, textAlign: "left" }}>
                    {CONTACT_INFO.phone1}
                    <br />
                    {CONTACT_INFO.phone2}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  <motion.div
                    style={S.onlineDot}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <span style={S.onlineText}>Online • Replies instantly</span>
                </div>
              </div>

              {/* ═══ SCROLLABLE CONTENT ═══ */}
              <div style={S.scrollArea}>
                <AnimatePresence mode="wait">
                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      style={S.stepPadding(isMobile)}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p style={S.stepLabel}>How would you like to start?</p>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {/* Send a Message */}
                        <motion.button
                          onClick={() => setStep(2)}
                          style={S.actionCard}
                          whileHover={{
                            scale: 1.02,
                            y: -3,
                            borderColor: "#25D366",
                            boxShadow:
                              "0 10px 30px rgba(37,211,102,0.12)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            style={S.actionIcon(
                              "linear-gradient(145deg, #25D366, #128C7E)"
                            )}
                          >
                            <Icon name="Chat" size={24} color="#fff" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={S.actionTitle}>Send a Message</strong>
                            <span style={S.actionDesc}>
                              Choose a preset or write your own
                            </span>
                          </div>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Icon name="ArrowRight" size={20} color="#128C7E" />
                          </motion.div>
                        </motion.button>

                        {/* Open Directly */}
                        <motion.button
                          onClick={handleDirect}
                          disabled={isSending}
                          style={{
                            ...S.actionCard,
                            opacity: isSending ? 0.6 : 1,
                          }}
                          whileHover={{
                            scale: 1.02,
                            y: -3,
                            borderColor: "#25D366",
                            boxShadow:
                              "0 10px 30px rgba(37,211,102,0.12)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            style={S.actionIcon(
                              "linear-gradient(145deg, #128C7E, #075E54)"
                            )}
                          >
                            <Icon name="WhatsApp" size={24} color="#fff" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={S.actionTitle}>
                              Open WhatsApp
                            </strong>
                            <span style={S.actionDesc}>
                              Jump straight into the chat
                            </span>
                          </div>
                          <Icon name="ExternalLink" size={16} color="#128C7E" />
                        </motion.button>
                      </div>

                      {/* Response time */}
                      <motion.div
                        style={S.responseTimeBadge}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Icon name="Clock" size={15} color="#25D366" />
                        <span style={S.responseTimeText}>
                          Typical response time: under 5 minutes
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      style={S.stepPadding(isMobile)}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Back */}
                      <motion.button
                        onClick={() => setStep(1)}
                        style={S.backBtn}
                        whileHover={{
                          x: -3,
                          backgroundColor: "#f0fdf4",
                          borderColor: "#25D366",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon name="ArrowLeft" size={16} color="#128C7E" />
                        <span>Back</span>
                      </motion.button>

                      {/* Name */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={S.label}>
                          <Icon name="User" size={17} color="#25D366" />
                          <span>Your Name</span>
                          <span style={S.labelOptional}>(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name…"
                          style={S.input}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </div>

                      {/* Presets */}
                      <div style={{ marginBottom: 20 }}>
                        <label style={S.label}>
                          <Icon name="MessageSquare" size={17} color="#25D366" />
                          <span>Quick Messages</span>
                        </label>

                        <div style={S.presetGrid(isMobile)}>
                          {PRESET_MESSAGES.map((p, idx) => {
                            const active = selectedPreset === p.id;
                            return (
                              <motion.button
                                key={p.id}
                                onClick={() => {
                                  setSelectedPreset(p.id);
                                  setCustomMessage("");
                                }}
                                style={S.presetBtn(active)}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                whileHover={{
                                  borderColor: "#25D366",
                                  backgroundColor: active
                                    ? "#dcfce7"
                                    : "#f0fdf4",
                                  y: -2,
                                }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <span style={S.presetEmoji}>{p.emoji}</span>
                                <span style={S.presetLabel(active)}>
                                  {p.label}
                                </span>

                                <AnimatePresence>
                                  {active && (
                                    <motion.span
                                      style={S.checkBadge}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                      }}
                                    >
                                      <Icon
                                        name="Check"
                                        size={12}
                                        color="#fff"
                                      />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom */}
                      <div style={{ marginBottom: 22 }}>
                        <label style={S.label}>
                          <span style={{ fontSize: 16 }}>✍️</span>
                          <span>Or Write Your Own</span>
                        </label>
                        <textarea
                          value={customMessage}
                          onChange={(e) => {
                            setCustomMessage(e.target.value);
                            setSelectedPreset(null);
                          }}
                          placeholder="Type your message here…"
                          rows={3}
                          style={S.textarea}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                        {customMessage && (
                          <span style={S.charCount}>
                            {customMessage.length} characters
                          </span>
                        )}
                      </div>

                      {/* Send */}
                      <motion.button
                        onClick={handleSend}
                        disabled={!canSend || isSending}
                        style={S.sendBtn(canSend)}
                        whileHover={
                          canSend
                            ? {
                                scale: 1.02,
                                boxShadow:
                                  "0 8px 30px rgba(37,211,102,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                              }
                            : {}
                        }
                        whileTap={canSend ? { scale: 0.97 } : {}}
                      >
                        {isSending ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <motion.div
                              style={S.spinner}
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 0.7,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            <span>Preparing…</span>
                          </div>
                        ) : (
                          <>
                            <Icon name="Send" size={20} color="#fff" />
                            <span>Send & Open WhatsApp</span>
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{ fontSize: 16 }}
                            >
                              →
                            </motion.span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ═══ FOOTER ═══ */}
              <div style={S.footer}>
                <Icon name="Shield" size={15} color="#25D366" />
                <span>Secure & Private Conversation</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppButton;