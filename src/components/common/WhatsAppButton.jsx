// WhatsAppButton.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ============================================================
// CONFIGURATION
// ============================================================
const CONTACT_INFO = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 780 702 773",
  phone2: "+250 792 352 409",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792 352 409",
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
// SCROLL VISIBILITY STATE
// ============================================================
// We keep the WhatsApp button minimal and visible only when the user scrolls up.

// ============================================================
// REMOTE ICON FETCHER — modern CDN icons
// ============================================================
const ICONIFY_MAP = {
  WhatsApp: 'logos:whatsapp',
  Close: 'akar-icons:cross',
  Send: 'mdi:send',
  User: 'mdi:account-circle-outline',
  MessageSquare: 'mdi:message-text-outline',
  Chat: 'mdi:chat-processing-outline',
  Phone: 'mdi:phone-outline',
  Shield: 'mdi:shield-check-outline',
  Rocket: 'mdi:rocket-launch-outline',
  ArrowRight: 'mdi:arrow-right-bold',
  ArrowLeft: 'mdi:arrow-left-bold',
  Check: 'mdi:check-bold',
  ExternalLink: 'mdi:open-in-new',
  Clock: 'mdi:clock-time-five-outline',
};

const getIconifyUrl = (name, size, color) => {
  const icon = ICONIFY_MAP[name];
  const hex = (color || '#000').replace(/^#/, '');
  return `https://api.iconify.design/${icon}.svg?color=%23${encodeURIComponent(hex)}&width=${size}&height=${size}`;
};

const Icons = {
  WhatsApp: ({ size = 24, color = '#fff' }) => (
    <img
      src={getIconifyUrl('WhatsApp', size, color)}
      alt="WhatsApp icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Close: ({ size = 20, color = '#128C7E' }) => (
    <img
      src={getIconifyUrl('Close', size, color)}
      alt="Close icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Send: ({ size = 20, color = '#fff' }) => (
    <img
      src={getIconifyUrl('Send', size, color)}
      alt="Send icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  User: ({ size = 16, color = '#25D366' }) => (
    <img
      src={getIconifyUrl('User', size, color)}
      alt="User icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  MessageSquare: ({ size = 16, color = '#25D366' }) => (
    <img
      src={getIconifyUrl('MessageSquare', size, color)}
      alt="Message icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Chat: ({ size = 22, color = '#fff' }) => (
    <img
      src={getIconifyUrl('Chat', size, color)}
      alt="Chat icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Phone: ({ size = 14, color = '#128C7E' }) => (
    <img
      src={getIconifyUrl('Phone', size, color)}
      alt="Phone icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Shield: ({ size = 14, color = '#25D366' }) => (
    <img
      src={getIconifyUrl('Shield', size, color)}
      alt="Shield icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Rocket: ({ size = 40, color = '#fff' }) => (
    <img
      src={getIconifyUrl('Rocket', size, color)}
      alt="Rocket icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  ArrowRight: ({ size = 18, color = '#128C7E' }) => (
    <img
      src={getIconifyUrl('ArrowRight', size, color)}
      alt="Right arrow icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  ArrowLeft: ({ size = 16, color = '#128C7E' }) => (
    <img
      src={getIconifyUrl('ArrowLeft', size, color)}
      alt="Left arrow icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Check: ({ size = 12, color = '#fff' }) => (
    <img
      src={getIconifyUrl('Check', size, color)}
      alt="Check icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  ExternalLink: ({ size = 14, color = '#128C7E' }) => (
    <img
      src={getIconifyUrl('ExternalLink', size, color)}
      alt="External link icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
  Clock: ({ size = 14, color = '#25D366' }) => (
    <img
      src={getIconifyUrl('Clock', size, color)}
      alt="Clock icon"
      width={size}
      height={size}
      style={{ display: 'block' }}
      loading="lazy"
    />
  ),
};

// ============================================================
// CONFETTI
// ============================================================
const fireConfetti = () => {
  const end = Date.now() + 2500;
  const colors = ["#25D366", "#128C7E", "#ffffff", "#dcfce7", "#a7f3d0"];
  const defaults = {
    startVelocity: 25,
    spread: 360,
    ticks: 50,
    zIndex: 99999999,
  };

  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors,
    });
  }, 200);

  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.65 },
    colors,
    zIndex: 99999999,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0 },
      colors,
      zIndex: 99999999,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 1 },
      colors,
      zIndex: 99999999,
    });
  }, 300);
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const WhatsAppButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.scrollY : 0,
  );

  const isMobile = windowWidth < 480;

  // ── Lifecycle ──
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollY.current;

      if (delta > 15 && currentScroll > 100) {
        setIsVisible(false);
      } else if (delta < -15 || currentScroll < 100) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // ── Helpers ──
  const generateWhatsAppURL = useCallback(
    (message = "") => {
      const phone = CONTACT_INFO.whatsapp.replace(/\D/g, "");
      if (message) {
        const full = userName ? `Hi, I'm ${userName}.\n\n${message}` : message;
        return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(full)}&type=phone_number&app_absent=0`;
      }
      return `https://api.whatsapp.com/send/?phone=${phone}&type=phone_number&app_absent=0`;
    },
    [userName],
  );

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setSelectedPreset(null);
      setCustomMessage("");
      setUserName("");
      setShowSuccess(false);
      setIsSending(false);
    }, 300);
  }, []);

  const handleDirectOpen = useCallback(() => {
    setIsSending(true);
    setShowSuccess(true);
    fireConfetti();
    setTimeout(() => {
      window.open(generateWhatsAppURL(), "_blank");
      setIsSending(false);
      setTimeout(handleCloseModal, 600);
    }, 1400);
  }, [generateWhatsAppURL, handleCloseModal]);

  const handleSendMessage = useCallback(() => {
    const msg = selectedPreset
      ? PRESET_MESSAGES.find((p) => p.id === selectedPreset)?.message
      : customMessage;
    if (!msg) return;

    setIsSending(true);
    setShowSuccess(true);
    fireConfetti();

    setTimeout(() => {
      window.open(generateWhatsAppURL(msg), "_blank");
      setIsSending(false);
      setTimeout(handleCloseModal, 600);
    }, 1400);
  }, [selectedPreset, customMessage, generateWhatsAppURL, handleCloseModal]);

  const canSend = selectedPreset || customMessage.trim();
  const showFloatingButton = isVisible && !isModalOpen;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* ═══════════ FLOATING BUTTON ═══════════ */}
      <AnimatePresence>
        {showFloatingButton && (
          <motion.div
            style={{
              position: "fixed",
              bottom: isMobile ? "16px" : "24px",
              left: isMobile ? "16px" : "24px",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            {/* Pulse rings */}
            <motion.div
              style={{
                position: "absolute",
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                backgroundColor: "#25D366",
                left: "-3px",
                top: "-3px",
                zIndex: 0,
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main button */}
            <motion.button
              onClick={handleOpenModal}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                border: "3px solid #fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
                position: "relative",
                zIndex: 2,
                outline: "none",
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icons.WhatsApp size={isMobile ? 22 : 25} />

            </motion.button>

            {/* Tooltip */}
            <motion.div
              style={{
                backdropFilter: "blur(12px)",
                color: "#128C7E",
                padding: "7px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
                whiteSpace: "nowrap",
                border: "1px solid #e8f5e9",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, type: "spring" }}
            >
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💬
              </motion.span>
              Chat with us!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ MODAL ═══════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999999,
              padding: "16px",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "22px",
                width: isMobile ? "100%" : "400px",
                maxWidth: "400px",
                maxHeight: isMobile ? "92vh" : "88vh",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                position: "relative",
              }}
              initial={{ opacity: 0, scale: 0.88, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 50 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Green accent bar */}
              <div
                style={{
                  height: "4px",
                  flexShrink: 0,
                  background:
                    "linear-gradient(90deg, #25D366, #128C7E, #25D366)",
                }}
              />

              {/* Close button */}
              <motion.button
                onClick={handleCloseModal}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid #e8f5e9",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  outline: "none",
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                  backgroundColor: "#dcfce7",
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Close size={14} />
              </motion.button>

              {/* ═══ SUCCESS OVERLAY ═══ */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 50,
                      borderRadius: "22px",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      style={{ textAlign: "center", padding: "40px 24px" }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <motion.div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #25D366, #128C7E)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          boxShadow: "0 10px 35px rgba(37,211,102,0.35)",
                        }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                      >
                        <Icons.Rocket />
                      </motion.div>
                      <h3
                        style={{
                          margin: "0 0 8px",
                          fontSize: "1.25rem",
                          fontWeight: "700",
                          color: "#1a1a1a",
                        }}
                      >
                        Opening WhatsApp!
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.88rem",
                          color: "#777",
                        }}
                      >
                        Connecting you now…
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                          marginTop: "22px",
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              backgroundColor: "#25D366",
                              display: "inline-block",
                            }}
                            animate={{ y: [0, -12, 0] }}
                            transition={{
                              duration: 0.5,
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

              {/* ═══ HEADER — Fixed ═══ */}
              <div
                style={{
                  textAlign: "center",
                  flexShrink: 0,
                  padding: isMobile ? "18px 16px 14px" : "22px 24px 14px",
                  background: "linear-gradient(180deg, #f0fdf4 0%, #fff 100%)",
                }}
              >
                <motion.div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    border: "3px solid #fff",
                    boxShadow: "0 6px 22px rgba(37,211,102,0.3)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 6px 22px rgba(37,211,102,0.25)",
                      "0 6px 32px rgba(37,211,102,0.45)",
                      "0 6px 22px rgba(37,211,102,0.25)",
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Icons.WhatsApp size={26} />
                </motion.div>

                <h3
                  style={{
                    margin: "0 0 3px",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#111",
                  }}
                >
                  Let's Connect!
                </h3>

                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.85rem",
                    color: "#666",
                  }}
                >
                  Chat with{" "}
                  <strong style={{ color: "#128C7E" }}>
                    {CONTACT_INFO.name}
                  </strong>
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    backgroundColor: "#e8f5e9",
                    padding: "6px 14px",
                    borderRadius: "16px",
                    fontSize: "0.75rem",
                    color: "#128C7E",
                    fontWeight: "600",
                    border: "1px solid #c8e6c9",
                  }}
                >
                  <Icons.Phone />
                  <span style={{ lineHeight: "1.4", textAlign: "left" }}>
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
                    gap: "5px",
                    marginTop: "8px",
                  }}
                >
                  <motion.div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      backgroundColor: "#25D366",
                    }}
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span style={{ fontSize: "0.72rem", color: "#999" }}>
                    Online • Replies instantly
                  </span>
                </div>
              </div>

              {/* ═══ SCROLLABLE CONTENT ═══ */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <AnimatePresence mode="wait">
                  {/* ── STEP 1: Choose action ── */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      style={{
                        padding: isMobile ? "14px 16px 18px" : "16px 24px 22px",
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p
                        style={{
                          textAlign: "center",
                          color: "#888",
                          fontSize: "0.84rem",
                          margin: "0 0 14px",
                          fontWeight: "500",
                        }}
                      >
                        How would you like to start?
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {/* Option: Quick message */}
                        <motion.button
                          onClick={() => setStep(2)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px",
                            backgroundColor: "#fff",
                            border: "2px solid #c8e6c9",
                            borderRadius: "16px",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "border-color 0.15s",
                          }}
                          whileHover={{
                            scale: 1.015,
                            y: -2,
                            borderColor: "#25D366",
                            boxShadow: "0 8px 25px rgba(37,211,102,0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #25D366, #128C7E)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(37,211,102,0.2)",
                            }}
                          >
                            <Icons.Chat />
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong
                              style={{
                                fontSize: "0.92rem",
                                color: "#111",
                                display: "block",
                              }}
                            >
                              Send a Message
                            </strong>
                            <span
                              style={{ fontSize: "0.78rem", color: "#888" }}
                            >
                              Choose a preset or write your own
                            </span>
                          </div>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Icons.ArrowRight />
                          </motion.div>
                        </motion.button>

                        {/* Option: Open directly */}
                        <motion.button
                          onClick={handleDirectOpen}
                          disabled={isSending}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px",
                            backgroundColor: "#fff",
                            border: "2px solid #c8e6c9",
                            borderRadius: "16px",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            opacity: isSending ? 0.6 : 1,
                          }}
                          whileHover={{
                            scale: 1.015,
                            y: -2,
                            borderColor: "#25D366",
                            boxShadow: "0 8px 25px rgba(37,211,102,0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "12px",
                              background:
                                "linear-gradient(135deg, #128C7E, #0a6847)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(18,140,126,0.2)",
                            }}
                          >
                            <Icons.WhatsApp size={22} />
                          </motion.div>
                          <div style={{ flex: 1 }}>
                            <strong
                              style={{
                                fontSize: "0.92rem",
                                color: "#111",
                                display: "block",
                              }}
                            >
                              Open WhatsApp Directly
                            </strong>
                            <span
                              style={{ fontSize: "0.78rem", color: "#888" }}
                            >
                              Jump straight into chat
                            </span>
                          </div>
                          <Icons.ExternalLink />
                        </motion.button>
                      </div>

                      {/* Response time badge */}
                      <motion.div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          marginTop: "16px",
                          padding: "8px 14px",
                          backgroundColor: "#f0fdf4",
                          borderRadius: "12px",
                          border: "1px solid #e8f5e9",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Icons.Clock />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#128C7E",
                            fontWeight: "500",
                          }}
                        >
                          Typical response time: under 5 minutes
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Compose message ── */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      style={{
                        padding: isMobile ? "14px 16px 18px" : "16px 24px 22px",
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Back button */}
                      <motion.button
                        onClick={() => setStep(1)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "none",
                          border: "none",
                          color: "#128C7E",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          padding: "0",
                          marginBottom: "16px",
                          fontWeight: "600",
                          outline: "none",
                        }}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icons.ArrowLeft />
                        <span>Back</span>
                      </motion.button>

                      {/* Name input */}
                      <div style={{ marginBottom: "18px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.84rem",
                            fontWeight: "600",
                            color: "#222",
                            marginBottom: "8px",
                          }}
                        >
                          <Icons.User />
                          <span>Your Name</span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#bbb",
                              fontWeight: "400",
                            }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name…"
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "2px solid #c8e6c9",
                            fontSize: "0.9rem",
                            outline: "none",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            color: "#1a1a1a",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                            fontFamily: "inherit",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#25D366";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(37,211,102,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#c8e6c9";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </div>

                      {/* Preset Messages */}
                      <div style={{ marginBottom: "18px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.84rem",
                            fontWeight: "600",
                            color: "#222",
                            marginBottom: "8px",
                          }}
                        >
                          <Icons.MessageSquare />
                          <span>Quick Messages</span>
                        </label>

                        <div
                          style={{
                            display: "grid",
                            gap: "8px",
                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                          }}
                        >
                          {PRESET_MESSAGES.map((preset, index) => {
                            const isActive = selectedPreset === preset.id;
                            return (
                              <motion.button
                                key={preset.id}
                                onClick={() => {
                                  setSelectedPreset(preset.id);
                                  setCustomMessage("");
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "10px 12px",
                                  backgroundColor: isActive
                                    ? "#dcfce7"
                                    : "#fff",
                                  border: `2px solid ${isActive ? "#25D366" : "#c8e6c9"}`,
                                  borderRadius: "12px",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  position: "relative",
                                  outline: "none",
                                  transition:
                                    "border-color 0.1s, background-color 0.1s",
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                whileHover={{
                                  borderColor: "#25D366",
                                  backgroundColor: isActive
                                    ? "#dcfce7"
                                    : "#f0fdf4",
                                }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <span
                                  style={{ fontSize: "1.1rem", flexShrink: 0 }}
                                >
                                  {preset.emoji}
                                </span>
                                <span
                                  style={{
                                    flex: 1,
                                    fontSize: "0.8rem",
                                    fontWeight: "500",
                                    color: isActive ? "#128C7E" : "#333",
                                  }}
                                >
                                  {preset.label}
                                </span>

                                <AnimatePresence>
                                  {isActive && (
                                    <motion.span
                                      style={{
                                        position: "absolute",
                                        top: "-6px",
                                        right: "-6px",
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background:
                                          "linear-gradient(135deg, #25D366, #128C7E)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px solid #fff",
                                        boxShadow:
                                          "0 2px 8px rgba(37,211,102,0.3)",
                                      }}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 25,
                                      }}
                                    >
                                      <Icons.Check />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom message */}
                      <div style={{ marginBottom: "20px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.84rem",
                            fontWeight: "600",
                            color: "#222",
                            marginBottom: "8px",
                          }}
                        >
                          <span>✍️ Or write your own</span>
                        </label>
                        <textarea
                          value={customMessage}
                          onChange={(e) => {
                            setCustomMessage(e.target.value);
                            setSelectedPreset(null);
                          }}
                          placeholder="Type your message here…"
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "2px solid #c8e6c9",
                            fontSize: "0.9rem",
                            resize: "vertical",
                            fontFamily: "inherit",
                            outline: "none",
                            boxSizing: "border-box",
                            minHeight: "82px",
                            backgroundColor: "#fff",
                            color: "#1a1a1a",
                            lineHeight: "1.5",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#25D366";
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(37,211,102,0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#c8e6c9";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        {customMessage && (
                          <span
                            style={{
                              display: "block",
                              textAlign: "right",
                              fontSize: "0.7rem",
                              color: "#bbb",
                              marginTop: "4px",
                            }}
                          >
                            {customMessage.length} characters
                          </span>
                        )}
                      </div>

                      {/* Send button */}
                      <motion.button
                        onClick={handleSendMessage}
                        disabled={!canSend || isSending}
                        style={{
                          width: "100%",
                          padding: "14px 20px",
                          borderRadius: "14px",
                          border: "none",
                          cursor: canSend ? "pointer" : "not-allowed",
                          background: canSend
                            ? "linear-gradient(135deg, #25D366, #128C7E)"
                            : "linear-gradient(135deg, #a7f3d0, #86efac)",
                          color: "#fff",
                          fontSize: "0.94rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          outline: "none",
                          boxShadow: canSend
                            ? "0 4px 18px rgba(37,211,102,0.3)"
                            : "none",
                          opacity: canSend ? 1 : 0.55,
                          transition: "opacity 0.15s",
                        }}
                        whileHover={
                          canSend
                            ? {
                                scale: 1.02,
                                boxShadow: "0 6px 25px rgba(37,211,102,0.35)",
                              }
                            : {}
                        }
                        whileTap={canSend ? { scale: 0.98 } : {}}
                      >
                        {isSending ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <motion.div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.3)",
                                borderTopColor: "#fff",
                              }}
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
                            <Icons.Send />
                            <span>Send & Open WhatsApp</span>
                            <motion.span
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
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

              {/* ═══ FOOTER — Fixed ═══ */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "12px 20px 14px",
                  fontSize: "0.75rem",
                  color: "#bbb",
                  borderTop: "1px solid #f0fdf4",
                  backgroundColor: "#fafffe",
                  flexShrink: 0,
                }}
              >
                <Icons.Shield />
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
