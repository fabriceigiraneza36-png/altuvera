import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  createContext,
  useContext,
} from "react";
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiUser,
  FiGlobe,
  FiStar,
  FiMessageSquare,
  FiHeart,
  FiClock,
  FiHome,
  FiSend,
  FiChevronDown,
  FiCamera,
  FiSunrise,
  FiCompass,
  FiAward,
  FiShield,
  FiZap,
  FiX,
  FiInfo,
  FiPlus,
  FiMinus,
  FiSettings,
  FiDollarSign,
  FiCreditCard,
  FiLoader,
  FiHeadphones,
  FiFeather,
  FiSun,
  FiMoon,
  FiNavigation,
  FiCoffee,
  FiHelpCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { useUserAuth } from "../context/UserAuthContext";
import { useServices } from "../hooks/useServices";
import { apiFetch } from "../utils/apiBase";
import { sendMessage } from "../utils/sendMessage";
import { applyBookingPrefill } from "../utils/bookingPrefill";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════


const ADMIN_CONTACT = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 780 702 773",
  phone2: "+250 792 352 409",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792 352 409",
  role: "Travel Consultant",
};

const THEME = {
  primary: "#059669",
  primaryLight: "#10B981",
  primaryLighter: "#34D399",
  primaryDark: "#065F46",
  primaryDarker: "#064E3B",
  accent: "#047857",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  white: "#FFFFFF",
  background: "#F0FDF4",
  backgroundAlt: "#ECFDF5",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  text: "#1a1a1a",
  textLight: "#6B7280",
  shadow: "rgba(5, 150, 105, 0.15)",
  shadowDark: "rgba(5, 150, 105, 0.25)",
};

const STEPS = [
  {
    number: 1,
    title: "Destination & Dates",
    shortTitle: "Trip",
    icon: <FiCompass size={22} />,
    description: "Choose where and when",
  },
  {
    number: 2,
    title: "Travelers & Stay",
    shortTitle: "Group",
    icon: <FiUsers size={22} />,
    description: "Tell us about your group",
  },
  {
    number: 3,
    title: "Interests",
    shortTitle: "Activities",
    icon: <FiHeart size={22} />,
    description: "What excites you most",
  },
  {
    number: 4,
    title: "Contact Details",
    shortTitle: "Details",
    icon: <FiUser size={22} />,
    description: "How can we reach you",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    input, select, textarea, button {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    input[type=number] {
      -moz-appearance: textfield;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
    }
    
    ::selection {
      background: rgba(5, 150, 105, 0.2);
      color: ${THEME.primaryDark};
    }
    
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${THEME.backgroundAlt};
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark});
      border-radius: 10px;
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 0; }
      100% { transform: scale(0.8); opacity: 0; }
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .gradient-text {
      background: linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 50%, ${THEME.primaryLighter} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getWhatsAppLink = (message) => {
  const phoneNumber = ADMIN_CONTACT.whatsapp.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeResponseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.results)) return value.results;
  }
  return [];
};

const normalizeOptionId = (id) =>
  id === undefined || id === null ? "" : String(id);

const normalizeOptionValue = (value) =>
  value === undefined || value === null ? "" : String(value);

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI CELEBRATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ConfettiCelebration = memo(({ active, duration = 5000 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const colors = [
      THEME.primary,
      THEME.primaryLight,
      THEME.primaryLighter,
      THEME.success,
      THEME.white,
      "#A7F3D0",
      "#6EE7B7",
      "#D1FAE5",
    ];

    const particles = [];
    const startTime = performance.now();

    for (let burst = 0; burst < 10; burst++) {
      const burstDelay = burst * 180;
      const burstX = (0.15 + Math.random() * 0.7) * window.innerWidth;
      const burstY = Math.random() * window.innerHeight * 0.4;

      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 10 + Math.random() * 18;

        particles.push({
          x: burstX + (Math.random() - 0.5) * 80,
          y: burstY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 6,
          size: 4 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.25 + Math.random() * 0.35,
          friction: 0.985,
          opacity: 1,
          delay: burstDelay,
          shape: Math.random() > 0.5 ? "rect" : "circle",
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.04 + Math.random() * 0.08,
        });
      }
    }

    let rafId;
    const animate = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = now - startTime;

      particles.forEach((p) => {
        if (elapsed < p.delay) return;

        const t = elapsed - p.delay;

        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx + Math.sin(p.wobble + t * p.wobbleSpeed) * 1.5;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (elapsed > duration * 0.65) {
          p.opacity -= 0.018;
        }

        if (p.opacity > 0 && p.y < window.innerHeight + 100) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      if (elapsed < duration + 2000) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10000,
      }}
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING PARTICLES BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

const FloatingParticles = memo(() => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            borderRadius: "50%",
            background: `rgba(5, 150, 105, ${0.08 + Math.random() * 0.15})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

const MagneticButton = memo(
  ({ children, strength = 0.25, className, style, ...props }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 180, damping: 18 });
    const springY = useSpring(y, { stiffness: 180, damping: 18 });

    const handleMouseMove = useCallback(
      (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
      },
      [strength, x, y],
    );

    const handleMouseLeave = useCallback(() => {
      x.set(0);
      y.set(0);
    }, [x, y]);

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY, display: "inline-block", ...style }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// GLASS MORPHISM CARD
// ═══════════════════════════════════════════════════════════════════════════

const GlassCard = memo(
  ({ children, style, className, hover = true, glow = false, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          background: "rgba(255, 255, 255, 0.97)",
          backdropFilter: "blur(24px)",
          borderRadius: 32,
          border: `1px solid rgba(5, 150, 105, 0.1)`,
          boxShadow:
            isHovered && hover
              ? `0 32px 64px -16px ${THEME.shadow}, 0 0 0 1px rgba(5, 150, 105, 0.08)`
              : `0 24px 48px -16px rgba(0, 0, 0, 0.06)`,
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
        className={className}
        {...props}
      >
        {glow && (
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `radial-gradient(circle at center, rgba(5, 150, 105, 0.04) 0%, transparent 50%)`,
              pointerEvents: "none",
              zIndex: 0,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP CONTACT BANNER
// ═══════════════════════════════════════════════════════════════════════════

const WhatsAppContactBanner = memo(({ isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const message = `Hello ${ADMIN_CONTACT.name}! 👋\n\nI'm interested in planning a trip with Altuvera Tours. Could you help me with information about destinations, availability, and pricing?\n\nThank you!`;
    window.open(getWhatsAppLink(message), "_blank");
  };

  const styles = {
    contactText: {
      fontSize: isMobile ? "13px" : "15px",
      lineHeight: "1.6",
      textAlign: isMobile ? "center" : "left",
    },
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
        <span style={styles.contactText}>
          {ADMIN_CONTACT.phone1}
          <br />
          {ADMIN_CONTACT.phone2}
        </span>
        <FiArrowRight size={16} />
      </motion.div>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED PROGRESS STEPPER
// ═══════════════════════════════════════════════════════════════════════════

const ProgressStepper = memo(
  ({ steps, currentStep, onStepClick, isMobile }) => {
    const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
      <div style={{ marginBottom: isMobile ? 28 : 44, padding: "0 16px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Progress Line Background */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? 20 : 26,
              left: isMobile ? 30 : 60,
              right: isMobile ? 30 : 60,
              height: 4,
              background: THEME.gray200,
              borderRadius: 4,
              zIndex: 0,
            }}
          />

          {/* Animated Progress Fill */}
          <motion.div
            style={{
              position: "absolute",
              top: isMobile ? 20 : 26,
              left: isMobile ? 30 : 60,
              height: 4,
              background: `linear-gradient(90deg, ${THEME.primary} 0%, ${THEME.primaryLight} 50%, ${THEME.primaryLighter} 100%)`,
              borderRadius: 4,
              zIndex: 1,
              boxShadow: `0 0 16px ${THEME.shadowDark}`,
            }}
            initial={{ width: 0 }}
            animate={{
              width: `calc(${progressPercent}% - ${isMobile ? 60 : 120}px * ${progressPercent / 100})`,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />

          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isClickable = step.number < currentStep;

            return (
              <motion.div
                key={step.number}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 2,
                  flex: 1,
                  cursor: isClickable ? "pointer" : "default",
                }}
                onClick={() => isClickable && onStepClick(step.number)}
                whileHover={isClickable ? { scale: 1.03 } : {}}
                whileTap={isClickable ? { scale: 0.97 } : {}}
              >
                <motion.div
                  style={{
                    width: isMobile ? 40 : 52,
                    height: isMobile ? 40 : 52,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isMobile ? 8 : 12,
                    position: "relative",
                    border: "3px solid",
                  }}
                  animate={{
                    backgroundColor:
                      isCompleted || isActive ? THEME.primary : THEME.white,
                    borderColor:
                      isCompleted || isActive ? THEME.primary : THEME.gray200,
                    scale: isActive ? 1.08 : 1,
                    boxShadow: isActive
                      ? `0 0 0 6px rgba(5, 150, 105, 0.12), 0 8px 20px ${THEME.shadowDark}`
                      : isCompleted
                        ? `0 4px 12px ${THEME.shadow}`
                        : "0 2px 6px rgba(0, 0, 0, 0.04)",
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  {isActive && (
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: `2px solid ${THEME.primary}`,
                      }}
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.25 }}
                      >
                        <FiCheck
                          size={isMobile ? 18 : 22}
                          color="white"
                          strokeWidth={3}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ color: isActive ? "white" : THEME.gray400 }}
                      >
                        {React.cloneElement(step.icon, {
                          size: isMobile ? 18 : 22,
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.span
                  style={{
                    fontSize: isMobile ? 10 : 13,
                    fontWeight: 600,
                    textAlign: "center",
                    maxWidth: isMobile ? 55 : 90,
                    lineHeight: 1.3,
                  }}
                  animate={{
                    color: isActive
                      ? THEME.primary
                      : isCompleted
                        ? THEME.primaryDark
                        : THEME.gray400,
                  }}
                >
                  {isMobile ? step.shortTitle : step.title}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// FORM INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FormInput = memo(
  ({
    name,
    label,
    type = "text",
    placeholder,
    required,
    icon: Icon,
    value,
    onChange,
    onBlur,
    error,
    touched,
    isMobile,
    helpText,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = touched && error;
    const isValid = touched && !error && value;

    return (
      <motion.div
        style={{ position: "relative" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: THEME.text,
            marginBottom: 10,
          }}
        >
          {Icon && <Icon size={16} style={{ color: THEME.primary }} />}
          {label}
          {required && (
            <span style={{ color: THEME.error, fontSize: 12 }}>*</span>
          )}
        </label>

        <motion.div
          style={{ position: "relative" }}
          animate={{
            x: hasError ? [0, -4, 4, -4, 4, 0] : 0,
          }}
          transition={{ duration: 0.35 }}
        >
          {type === "email" ? (
            <EmailAutocompleteInput
              name={name}
              value={value}
              onValueChange={(next) => {
                onChange?.({ target: { name, value: next } });
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              placeholder={placeholder}
              style={{
                width: "100%",
                padding: isMobile ? "14px 16px" : "16px 20px",
                paddingRight: isValid ? 48 : 20,
                fontSize: isMobile ? 16 : 15,
                border: "2px solid",
                borderColor: hasError
                  ? THEME.error
                  : isFocused
                    ? THEME.primary
                    : isValid
                      ? THEME.primaryLight
                      : THEME.gray200,
                borderRadius: 14,
                backgroundColor: hasError
                  ? "#FEF2F2"
                  : isFocused
                    ? THEME.white
                    : isValid
                      ? THEME.background
                      : THEME.gray50,
                outline: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isFocused
                  ? `0 0 0 4px rgba(5, 150, 105, 0.08), 0 4px 12px ${THEME.shadow}`
                  : hasError
                    ? "0 0 0 4px rgba(239, 68, 68, 0.08)"
                    : "none",
              }}
              aria-invalid={hasError}
              {...props}
            />
          ) : (
            <motion.input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              placeholder={placeholder}
              style={{
                width: "100%",
                padding: isMobile ? "14px 16px" : "16px 20px",
                paddingRight: isValid ? 48 : 20,
                fontSize: isMobile ? 16 : 15,
                border: "2px solid",
                borderColor: hasError
                  ? THEME.error
                  : isFocused
                    ? THEME.primary
                    : isValid
                      ? THEME.primaryLight
                      : THEME.gray200,
                borderRadius: 14,
                backgroundColor: hasError
                  ? "#FEF2F2"
                  : isFocused
                    ? THEME.white
                    : isValid
                      ? THEME.background
                      : THEME.gray50,
                outline: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isFocused
                  ? `0 0 0 4px rgba(5, 150, 105, 0.08), 0 4px 12px ${THEME.shadow}`
                  : hasError
                    ? "0 0 0 4px rgba(239, 68, 68, 0.08)"
                    : "none",
              }}
              {...props}
            />
          )}

          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <FiCheckCircle size={20} color={THEME.primaryLight} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                borderRadius: 8,
              }}
            >
              <FiAlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {helpText && !hasError && (
          <p style={{ marginTop: 6, fontSize: 12, color: THEME.gray400 }}>
            {helpText}
          </p>
        )}
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// FORM SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FormSelect = memo(
  ({
    name,
    label,
    options,
    required,
    placeholder,
    icon: Icon,
    value,
    onChange,
    onBlur,
    error,
    touched,
    isMobile,
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = touched && error;
    const isValid = touched && !error && value;

    return (
      <motion.div
        style={{ position: "relative" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: THEME.text,
            marginBottom: 10,
          }}
        >
          {Icon && <Icon size={16} style={{ color: THEME.primary }} />}
          {label}
          {required && (
            <span style={{ color: THEME.error, fontSize: 12 }}>*</span>
          )}
        </label>

        <div style={{ position: "relative" }}>
          <select
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={{
              width: "100%",
              padding: isMobile ? "14px 16px" : "16px 20px",
              paddingRight: 48,
              fontSize: isMobile ? 16 : 15,
              border: "2px solid",
              borderColor: hasError
                ? THEME.error
                : isFocused
                  ? THEME.primary
                  : isValid
                    ? THEME.primaryLight
                    : THEME.gray200,
              borderRadius: 14,
              backgroundColor: hasError
                ? "#FEF2F2"
                : isFocused
                  ? THEME.white
                  : isValid
                    ? THEME.background
                    : THEME.gray50,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isFocused
                ? `0 0 0 4px rgba(5, 150, 105, 0.08), 0 4px 12px ${THEME.shadow}`
                : "none",
            }}
          >
            <option value="">
              {placeholder || `Select ${label.toLowerCase()}`}
            </option>
            {Array.isArray(options) &&
              options.map((opt, optIndex) => {
                // Handle different option formats
                let optionId, optionLabel, optionFlag;

                if (typeof opt === "string") {
                  optionId = opt;
                  optionLabel = opt;
                } else if (typeof opt === "object" && opt !== null) {
                  optionId =
                    opt.id || opt.value || opt._id || opt.name || optIndex;
                  optionLabel =
                    opt.name ||
                    opt.title ||
                    opt.label ||
                    opt.category ||
                    String(optionId);
                  optionFlag = opt.flag || "";
                } else {
                  optionId = optIndex;
                  optionLabel = String(opt);
                }

                return (
                  <option
                    key={`${name}-option-${normalizeOptionId(optionId)}-${optIndex}`}
                    value={normalizeOptionId(optionId)}
                  >
                    {optionFlag && `${optionFlag} `}
                    {optionLabel}
                  </option>
                );
              })}
          </select>

          <div
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: THEME.gray500,
            }}
          >
            <FiChevronDown size={20} />
          </div>
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                borderRadius: 8,
              }}
            >
              <FiAlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Counter = memo(
  ({ label, description, value, onChange, min = 0, max = 20, isMobile }) => {
    const isAtMin = value <= min;
    const isAtMax = value >= max;

    return (
      <motion.div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? 18 : 24,
          backgroundColor: value > min ? THEME.background : THEME.gray50,
          borderRadius: 18,
          border: `2px solid ${value > min ? THEME.primaryLighter : THEME.gray200}`,
          transition: "all 0.3s ease",
        }}
        whileHover={{ borderColor: THEME.primary }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 13, color: THEME.textLight }}>
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 14 : 18,
          }}
        >
          <motion.button
            type="button"
            onClick={() => !isAtMin && onChange(value - 1)}
            disabled={isAtMin}
            style={{
              width: isMobile ? 42 : 48,
              height: isMobile ? 42 : 48,
              borderRadius: 14,
              border: `2px solid ${THEME.gray200}`,
              backgroundColor: THEME.white,
              cursor: isAtMin ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAtMin ? 0.4 : 1,
              transition: "all 0.2s ease",
            }}
            whileHover={
              !isAtMin ? { scale: 1.05, borderColor: THEME.primary } : {}
            }
            whileTap={!isAtMin ? { scale: 0.95 } : {}}
          >
            <FiMinus size={20} color={THEME.gray700} />
          </motion.button>

          <motion.span
            key={value}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: isMobile ? 24 : 28,
              fontWeight: 800,
              color: THEME.primary,
              minWidth: 44,
              textAlign: "center",
            }}
          >
            {value}
          </motion.span>

          <motion.button
            type="button"
            onClick={() => !isAtMax && onChange(value + 1)}
            disabled={isAtMax}
            style={{
              width: isMobile ? 42 : 48,
              height: isMobile ? 42 : 48,
              borderRadius: 14,
              border: `2px solid ${THEME.primary}`,
              backgroundColor: THEME.primary,
              cursor: isAtMax ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAtMax ? 0.4 : 1,
              transition: "all 0.2s ease",
            }}
            whileHover={!isAtMax ? { scale: 1.05 } : {}}
            whileTap={!isAtMax ? { scale: 0.95 } : {}}
          >
            <FiPlus size={20} color="white" />
          </motion.button>
        </div>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const SelectionCard = memo(
  ({ selected, onClick, icon, title, description, badge, isMobile }) => {
    return (
      <motion.div
        onClick={onClick}
        style={{
          padding: isMobile ? 18 : 24,
          borderRadius: 18,
          border: `2px solid ${selected ? THEME.primary : THEME.gray200}`,
          backgroundColor: selected ? THEME.background : THEME.white,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
        whileHover={{
          borderColor: THEME.primary,
          boxShadow: `0 8px 24px ${THEME.shadow}`,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{ fontSize: isMobile ? 28 : 34, flexShrink: 0 }}>
          {icon}
        </span>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 4,
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: isMobile ? 12 : 14,
              color: THEME.textLight,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
          {badge && (
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: THEME.primary,
                backgroundColor: `rgba(5, 150, 105, 0.1)`,
                borderRadius: 6,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: THEME.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiCheck size={14} color="white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// INTEREST TAG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const InterestTag = memo(({ selected, onClick, icon, name, isMobile }) => {
  return (
    <motion.div
      onClick={onClick}
      style={{
        padding: isMobile ? "14px 12px" : "18px 16px",
        borderRadius: 16,
        border: `2px solid ${selected ? THEME.primary : THEME.gray200}`,
        backgroundColor: selected ? THEME.primary : THEME.white,
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
      whileHover={{
        borderColor: THEME.primary,
        y: -2,
        boxShadow: `0 6px 16px ${THEME.shadow}`,
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: selected ? THEME.primary : THEME.white,
      }}
    >
      <span style={{ fontSize: isMobile ? 26 : 32 }}>{icon}</span>
      <span
        style={{
          fontSize: isMobile ? 11 : 13,
          fontWeight: 600,
          color: selected ? THEME.white : THEME.text,
          lineHeight: 1.3,
        }}
      >
        {name}
      </span>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// TRIP SUMMARY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const TripSummary = memo(
  ({
    formData,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    accommodationTypes,
    isMobile,
  }) => {
    const items = [
      {
        icon: FiMapPin,
        label: "Destination",
        value: getDestinationName(),
      },
      {
        icon: FiCalendar,
        label: "Duration",
        value: getTripDuration() || "Not set",
      },
      {
        icon: FiUsers,
        label: "Travelers",
        value: `${getTotalVisitors()} ${getTotalVisitors() === 1 ? "person" : "people"}`,
      },
      {
        icon: FiHome,
        label: "Accommodation",
        value:
          accommodationTypes.find((a) => a.id === formData.accommodation)
            ?.name || "Not selected",
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: isMobile ? 20 : 28,
          background: `linear-gradient(135deg, ${THEME.background} 0%, ${THEME.backgroundAlt} 100%)`,
          borderRadius: 22,
          border: `2px solid ${THEME.primaryLighter}`,
          marginBottom: isMobile ? 28 : 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: THEME.primaryDark,
          }}
        >
          <FiCheckCircle size={20} />
          Your Trip Summary
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: isMobile ? 14 : 18,
          }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: THEME.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  flexShrink: 0,
                }}
              >
                <item.icon size={18} color={THEME.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: THEME.textLight,
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 700,
                    color: THEME.primaryDark,
                  }}
                >
                  {item.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE IMAGE UPLOAD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ProfileImageUpload = ({ user, formData, setFormData, isMobile }) => {
  const [preview, setPreview] = useState(
    user?.avatar || formData.userImage || "",
  );
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData((prev) => ({ ...prev, userImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: 32, textAlign: "center" }}>
      <div
        style={{
          position: "relative",
          width: isMobile ? 100 : 120,
          height: isMobile ? 100 : 120,
          margin: "0 auto",
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${THEME.primary}`,
            background: THEME.gray100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img
              src={preview}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Profile Preview"
            />
          ) : (
            <FiUser size={isMobile ? 50 : 60} color={THEME.gray400} />
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            background: THEME.primary,
            borderRadius: "50%",
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <FiCamera size={isMobile ? 16 : 18} color="white" />
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleFile}
      />
      <p
        style={{
          fontSize: 13,
          color: THEME.textLight,
          marginTop: 12,
          fontWeight: 500,
        }}
      >
        {user
          ? "Personalize your booking profile"
          : "Upload your photo for this booking"}
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

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
    user,
    displayName,
  }) => {
    // Personalized recommendations based on user data
    const getPersonalizedGreeting = () => {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

      if (displayName) {
        return `${timeGreeting}, ${displayName}!`;
      }
      return `${timeGreeting}!`;
    };

    const getPersonalizedSubtitle = () => {
      if (user?.email) {
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
                    // Handle API response format: { category: "Safari", count: 5 }
                    if (typeof c === "object" && c !== null) {
                      if (c.category) {
                        return { id: c.category, name: c.category };
                      }
                      if (c.name) {
                        return { id: c.name, name: c.name };
                      }
                      // Fallback for unknown object structure
                      return { id: String(c), name: String(c) };
                    }
                    // Handle string format
                    return { id: c, name: c };
                  })
                : servicesData.map((s) => ({
                    id: s.id || s.value || s.name,
                    name: s.name || s.title || s,
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
            options={
              destinationsList.length > 0 ? destinationsList : countriesList
            }
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
        {user && destinationsList.length > 0 && (
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
                    {dest.name || dest.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: formData.destination === (dest.id || dest._id || dest.name) ? "rgba(255,255,255,0.8)" : THEME.textLight,
                    }}
                  >
                    {dest.location || dest.country}
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
                <FiClock size={24} color={THEME.primary} />
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

const StepTwo = memo(
  ({
    formData,
    setFormData,
    groupTypes,
    accommodationTypes,
    getTotalVisitors,
    isMobile,
    user,
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
          <p style={{
            fontSize: isMobile ? 14 : 16,
            color: THEME.textLight,
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto",
          }}>
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

const StepThree = memo(
  ({ formData, setFormData, interests, handleInterestToggle, isMobile, user, displayName }) => {
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
          <p style={{
            fontSize: isMobile ? 14 : 16,
            color: THEME.textLight,
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto",
          }}>
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
              <strong>{ADMIN_CONTACT.name}</strong> will contact you via
              WhatsApp with a customized quote tailored to your preferences.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

const StepFour = memo(
  ({
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    accommodationTypes,
    user,
    isMobile,
    displayName,
    isAuthenticated,
    openModal,
  }) => {
    const getPersonalizedContactMessage = () => {
      if (displayName) {
        return `Almost there, ${displayName}! Let's finalize your booking details and get you ready for an unforgettable adventure.`;
      }
      return "Almost there! Let's finalize your booking details and get you ready for an unforgettable adventure.";
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
            <FiUser size={30} color="white" />
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
            Almost <span style={{ color: THEME.primary }}>There!</span>
          </h2>
          <p style={{
            fontSize: isMobile ? 14 : 16,
            color: THEME.textLight,
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto",
          }}>
            {getPersonalizedContactMessage()}
          </p>
        </div>

        <div
          style={{
            marginBottom: 24,
            padding: 22,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${THEME.primary}10, ${THEME.background} 100%)`,
            border: `1px solid rgba(16, 185, 129, 0.16)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                backgroundColor: THEME.primary,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <FiUser size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                Auto-filled contact details
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: THEME.textLight,
                }}
              >
                We preloaded your name and email from your account for a smoother booking experience.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16,
            }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 18,
                backgroundColor: '#fff',
                border: `1px solid ${THEME.gray200}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: THEME.textLight,
                  marginBottom: 6,
                }}
              >
                Full name
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                {formData.name || 'Enter your name'}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                backgroundColor: '#fff',
                border: `1px solid ${THEME.gray200}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: THEME.textLight,
                  marginBottom: 6,
                }}
              >
                Email address
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
                }}
              >
                {formData.email || 'Enter your email'}
              </div>
            </div>
          </div>
        </div>

        <ProfileImageUpload
          user={user}
          formData={formData}
          setFormData={setFormData}
          isMobile={isMobile}
        />

        <TripSummary
          formData={formData}
          getTripDuration={getTripDuration}
          getTotalVisitors={getTotalVisitors}
          getDestinationName={getDestinationName}
          accommodationTypes={accommodationTypes}
          user={user}
          isMobile={isMobile}
        />
        {!isAuthenticated ? (
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              borderRadius: 20,
              backgroundColor: "#D1FAE5",
              color: "#064E3B",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              Sign in to auto-fill your booking contact details.
            </div>
            <button
              type="button"
              onClick={() => openModal("login")}
              style={{
                padding: "12px 20px",
                borderRadius: 16,
                border: "none",
                backgroundColor: "#059669",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sign in with your account
            </button>
          </div>
        ) : (
          <div
            style={{
              marginBottom: 24,
              padding: 18,
              borderRadius: 20,
              backgroundColor: "#ECFDF5",
              color: "#166534",
            }}
          >
            Signed in as <strong>{user.fullName || user.email}</strong>. Your booking details are synced.
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 20 : 24,
          }}
        >
          <FormInput
            name="name"
            label="Full Name"
            placeholder="John Smith"
            required
            icon={FiUser}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            isMobile={isMobile}
          />

          <FormInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            isMobile={isMobile}
          />

          <FormInput
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            required
            icon={FiPhone}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            isMobile={isMobile}
          />

          <FormInput
            name="country"
            label="Your Country"
            placeholder="United States"
            required
            icon={FiGlobe}
            value={formData.country}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.country}
            touched={touched.country}
            isMobile={isMobile}
          />
        </div>

        <div style={{ marginTop: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
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
              <FiSettings size={18} color={THEME.primary} />
            </div>
            Travel Preferences (Optional)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 20 : 24,
            }}
          >
            <FormSelect
              name="preferredContactMethod"
              label="Preferred Contact"
              options={[
                { value: "whatsapp", name: "WhatsApp" },
                { value: "email", name: "Email" },
                { value: "phone", name: "Phone Call" },
              ]}
              icon={FiMessageSquare}
              value={formData.preferredContactMethod}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.preferredContactMethod}
              error={errors.preferredContactMethod}
              isMobile={isMobile}
            />

            <FormInput
              name="preferredContactTime"
              label="Best Time to Reach You"
              placeholder="e.g. 9am–12pm (GMT+2)"
              icon={FiClock}
              value={formData.preferredContactTime}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.preferredContactTime}
              error={errors.preferredContactTime}
              isMobile={isMobile}
              helpText="Add your timezone for faster replies."
            />

            <FormInput
              name="budgetPerPerson"
              label="Budget Per Person"
              type="number"
              placeholder="e.g. 2500"
              icon={FiDollarSign}
              value={formData.budgetPerPerson}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.budgetPerPerson}
              error={errors.budgetPerPerson}
              isMobile={isMobile}
            />

            <FormSelect
              name="currency"
              label="Currency"
              options={[
                { value: "USD", name: "USD" },
                { value: "EUR", name: "EUR" },
                { value: "GBP", name: "GBP" },
                { value: "ZAR", name: "ZAR" },
                { value: "KES", name: "KES" },
                { value: "TZS", name: "TZS" },
                { value: "UGX", name: "UGX" },
                { value: "RWF", name: "RWF" },
              ]}
              icon={FiCreditCard}
              value={formData.currency}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.currency}
              error={errors.currency}
              isMobile={isMobile}
            />

            <FormInput
              name="pickupLocation"
              label="Pickup Location (If Known)"
              placeholder="Hotel / Airport / City"
              icon={FiMapPin}
              value={formData.pickupLocation}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.pickupLocation}
              error={errors.pickupLocation}
              isMobile={isMobile}
            />

            <FormSelect
              name="marketingSource"
              label="How Did You Find Us?"
              options={[
                { value: "google", name: "Google Search" },
                { value: "instagram", name: "Instagram" },
                { value: "tiktok", name: "TikTok" },
                { value: "facebook", name: "Facebook" },
                { value: "referral", name: "Friend/Referral" },
                { value: "returning", name: "Returning Traveler" },
                { value: "other", name: "Other" },
              ]}
              icon={FiCompass}
              value={formData.marketingSource}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.marketingSource}
              error={errors.marketingSource}
              isMobile={isMobile}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: isMobile ? 13 : 14,
                fontWeight: 600,
                color: THEME.text,
              }}
            >
              <input
                type="checkbox"
                checked={!!formData.newsletterOptIn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newsletterOptIn: e.target.checked,
                  }))
                }
                style={{ transform: "translateY(1px)" }}
              />
              Email me destination updates and travel tips.
            </label>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginTop: 28 }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 600,
              color: THEME.text,
              marginBottom: 10,
            }}
          >
            <FiMessageSquare size={16} style={{ color: THEME.primary }} />
            Special Requests or Questions
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requirements, dietary needs, celebrations, or questions..."
            style={{
              width: "100%",
              padding: isMobile ? "14px 16px" : "18px 22px",
              fontSize: isMobile ? 16 : 15,
              border: `2px solid ${THEME.gray200}`,
              borderRadius: 16,
              backgroundColor: THEME.gray50,
              outline: "none",
              resize: "vertical",
              minHeight: isMobile ? 110 : 130,
              fontFamily: "inherit",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = THEME.primary;
              e.target.style.backgroundColor = THEME.white;
              e.target.style.boxShadow = `0 0 0 4px rgba(5, 150, 105, 0.08)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = THEME.gray200;
              e.target.style.backgroundColor = THEME.gray50;
              e.target.style.boxShadow = "none";
            }}
          />
        </motion.div>

        {/* WhatsApp Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            marginTop: 28,
            padding: isMobile ? 18 : 24,
            background: `linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(5, 150, 105, 0.06) 100%)`,
            borderRadius: 18,
            border: "1px solid rgba(37, 211, 102, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 6px 20px rgba(37, 211, 102, 0.3)",
            }}
          >
            <FaWhatsapp size={26} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: isMobile ? 14 : 15,
                fontWeight: 700,
                color: THEME.primaryDark,
                marginBottom: 4,
              }}
            >
              Your request will be sent via WhatsApp
            </div>
            <p
              style={{
                fontSize: isMobile ? 12 : 13,
                color: THEME.textLight,
                margin: 0,
              }}
            >
              {ADMIN_CONTACT.name} will respond within 24 hours with a
              personalized quote
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS SCREEN
// ═══════════════════════════════════════════════════════════════════════════

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
          <FiCheckCircle size={isMobile ? 50 : 65} color="white" />
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
        {displayName ? `Request Sent, ${displayName}! 🎉` : "Request Sent! 🎉"}
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
        <FaWhatsapp size={22} />
        Message sent via WhatsApp
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
        {displayName ? `${displayName}, thank you for your interest in traveling with Altuvera! ` : "Thank you for your interest in traveling with Altuvera! "}
        <strong>{ADMIN_CONTACT.name}</strong> will reach out within 24 hours
        with a personalized itinerary and quote.
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
          <FaWhatsapp size={18} />
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
          <Button to="/" variant="primary" size="large">
            Return Home
          </Button>
        </MagneticButton>
        <MagneticButton>
          <Button to="/destinations" variant="secondary" size="large">
            Explore Destinations
          </Button>
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN BOOKING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Booking = () => {
  const { authFetch, user, openModal } = useUserAuth();

  // Data fetching states
  const [countriesList, setCountriesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Booking statistics from live backend
  const [mostBookedDestinations, setMostBookedDestinations] = useState([]);
  const [countriesStats, setCountriesStats] = useState([]);
  const [destinationsStats, setDestinationsStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");

  const displayName = useMemo(
    () => user?.full_name || user?.name || user?.email?.split("@")[0] || "",
    [user],
  );
  const isAuthenticated = Boolean(user?.email);

  // Window size
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const BOOKING_DRAFT_KEY = "altuvera_booking_draft_v1";

  // Form data
  const [formData, setFormData] = useState(() => {
    const defaults = {
      tripType: "",
      destination: "",
      startDate: "",
      endDate: "",
      adults: 2,
      children: 0,
      groupType: "couple",
      accommodation: "mid-range",
      interests: [],
      budgetPerPerson: "",
      currency: "USD",
      preferredContactMethod: "whatsapp",
      preferredContactTime: "",
      pickupLocation: "",
      flightArrival: "",
      flightDeparture: "",
      dietaryRequirements: "",
      accessibilityNeeds: "",
      marketingSource: "",
      newsletterOptIn: false,
      userImage: user?.avatar || "",
      name: user?.full_name || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      country: "",
      specialRequests: "",
    };

    try {
      const raw =
        sessionStorage.getItem(BOOKING_DRAFT_KEY) ||
        localStorage.getItem(BOOKING_DRAFT_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaults;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isSubmitted) {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      localStorage.removeItem(BOOKING_DRAFT_KEY);
    }
  }, [BOOKING_DRAFT_KEY, isSubmitted]);

  useEffect(() => {
    if (isSubmitted) return;
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // ignore storage failures
      }
    }, 250);
    return () => clearTimeout(id);
  }, [BOOKING_DRAFT_KEY, formData, isSubmitted]);

  // Update form data when user changes
  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      name: user.full_name || user.fullName || user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      country: prev.country || user.country || prev.country,
    }));
  }, [user]);

  // Fetch live booking statistics from backend
  const fetchBookingStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [mostBookedRes, countriesStatsRes, destinationsStatsRes] = await Promise.all([
        authFetch("/bookings/most-booked").catch(() => null),
        authFetch("/bookings/countries-stats").catch(() => null),
        authFetch("/bookings/destinations-stats").catch(() => null),
      ]);

      setMostBookedDestinations(normalizeResponseArray(mostBookedRes));
      setCountriesStats(normalizeResponseArray(countriesStatsRes));
      setDestinationsStats(normalizeResponseArray(destinationsStatsRes));
    } catch (err) {
      console.error("Failed to fetch booking statistics:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [authFetch]);

  // Fetch main data (countries, categories, destinations)
  useEffect(() => {
    (async () => {
      setLoadingData(true);
      try {
        const [cRes, catRes, destRes] = await Promise.all([
          authFetch("/countries").catch(() => null),
          authFetch("/destinations/categories").catch(() => null),
          authFetch("/destinations").catch(() => null),
        ]);

        const countries = normalizeResponseArray(cRes);
        const categories = normalizeResponseArray(catRes);
        const destinations = normalizeResponseArray(destRes);

        setCountriesList(countries);
        setCategoriesList(categories);
        setDestinationsList(destinations);

        // Fetch booking stats after destinations are loaded
        await fetchBookingStats();
      } catch (err) {
        console.error("Failed to fetch booking data", err);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [authFetch, fetchBookingStats]);

  // Apply booking prefill from query params or storage
  useEffect(() => {
    applyBookingPrefill(formData, setFormData);
  }, [formData]);


  // Handle resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Interests options
  const interests = useMemo(
    () => [
      { name: "Wildlife Safari", icon: "🦁" },
      { name: "Mountain Trekking", icon: "🏔️" },
      { name: "Gorilla Tracking", icon: "🦍" },
      { name: "Beach & Relaxation", icon: "🏖️" },
      { name: "Cultural Experiences", icon: "🎭" },
      { name: "Photography", icon: "📸" },
      { name: "Bird Watching", icon: "🦅" },
      { name: "Adventure Sports", icon: "🪂" },
    ],
    [],
  );

  // Accommodation types
  const accommodationTypes = useMemo(
    () => [
      {
        id: "budget",
        name: "Budget Friendly",
        description: "Comfortable lodges & camps",
        icon: "🏕️",
      },
      {
        id: "mid-range",
        name: "Mid-Range",
        description: "Quality lodges & tented camps",
        icon: "🏨",
      },
      {
        id: "luxury",
        name: "Luxury",
        description: "Premium lodges & camps",
        icon: "🏰",
      },
      {
        id: "ultra-luxury",
        name: "Ultra Luxury",
        description: "Exclusive private experiences",
        icon: "👑",
      },
    ],
    [],
  );

  // Group types
  const groupTypes = useMemo(
    () => [
      { id: "solo", name: "Solo", full_name: "Solo Traveler", icon: "🧑" },
      { id: "couple", name: "Couple", full_name: "Couple", icon: "💑" },
      { id: "family", name: "Family", full_name: "Family", icon: "👨‍👩‍👧‍👦" },
      { id: "friends", name: "Friends", full_name: "Friends", icon: "👥" },
      { id: "business", name: "Business", full_name: "Business", icon: "💼" },
    ],
    [],
  );

  // Validation rules
  const validationRules = useMemo(
    () => ({
      tripType: { required: true, message: "Please select a trip type" },
      destination: { required: true, message: "Please select a destination" },
      startDate: {
        required: true,
        message: "Please select a start date",
        validate: (value) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (new Date(value) < today)
            return "Start date cannot be in the past";
          return null;
        },
      },
      endDate: {
        required: true,
        message: "Please select an end date",
        validate: (value) => {
          if (
            formData.startDate &&
            new Date(value) <= new Date(formData.startDate)
          ) {
            return "End date must be after start date";
          }
          return null;
        },
      },
      name: {
        required: true,
        message: "Full name is required",
        minLength: 3,
        pattern: /^[a-zA-Z\s'-]+$/,
        patternMessage: "Please enter a valid name (letters only)",
      },
      email: {
        required: true,
        message: "Email is required",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email address",
      },
      phone: {
        required: true,
        message: "Phone number is required",
        pattern: /^[\d\s+\-()]{8,20}$/,
        patternMessage: "Please enter a valid phone number",
      },
      country: { required: true, message: "Please enter your country" },
    }),
    [formData.startDate],
  );

  // Validate single field
  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) return null;

      if (
        rules.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        return rules.message;
      }
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.patternMessage;
      }
      if (rules.validate) {
        return rules.validate(value);
      }
      return null;
    },
    [validationRules],
  );

  // Handle input change
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField],
  );

  // Handle input blur
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField],
  );

  // Handle interest toggle
  const handleInterestToggle = useCallback((interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  // Validate step
  const validateStep = useCallback(
    (step) => {
      const stepFields = {
        1: ["tripType", "destination", "startDate", "endDate"],
        2: [],
        3: [],
        4: ["name", "email", "phone", "country"],
      };

      const fields = stepFields[step] || [];
      let isValid = true;
      const newErrors = {};
      const newTouched = {};

      fields.forEach((field) => {
        newTouched[field] = true;
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      setTouched((prev) => ({ ...prev, ...newTouched }));
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return isValid;
    },
    [formData, validateField],
  );

  // Get trip duration
  const getTripDuration = useCallback(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} ${diff === 1 ? "day" : "days"}` : null;
    }
    return null;
  }, [formData.startDate, formData.endDate]);

  // Get total visitors
  const getTotalVisitors = useCallback(
    () => formData.adults + formData.children,
    [formData.adults, formData.children],
  );

  // Get destination name
  const getDestinationName = useCallback(() => {
    const destinationKey = normalizeOptionValue(formData.destination);
    const dest = destinationsList.find(
      (c) =>
        normalizeOptionValue(c.id) === destinationKey ||
        normalizeOptionValue(c._id) === destinationKey ||
        normalizeOptionValue(c.slug) === destinationKey ||
        normalizeOptionValue(c.countryId) === destinationKey,
    );
    if (dest) return `${dest.flag || "📍"} ${dest.name}`;
    const country = countriesList.find(
      (c) =>
        normalizeOptionValue(c.id) === destinationKey ||
        normalizeOptionValue(c.slug) === destinationKey ||
        normalizeOptionValue(c.countryId) === destinationKey,
    );
    return country ? `${country.flag || "🏳️"} ${country.name}` : "Not selected";
  }, [formData.destination, destinationsList, countriesList]);

  const buildBookingMessage = useCallback(() => {
    const tripDuration = getTripDuration() || "Not specified";
    const totalVisitors = getTotalVisitors();
    const destinationName = getDestinationName();
    const accommodationType =
      accommodationTypes.find((a) => a.id === formData.accommodation)?.name ||
      "Not specified";
    const groupTypeName =
      groupTypes.find((g) => g.id === formData.groupType)?.full_name ||
      "Not specified";
    const interestsList =
      formData.interests.length > 0
        ? formData.interests.join(", ")
        : "None selected";

    return `🌍 *NEW BOOKING REQUEST - ALTUVERA TOURS*

Hello ${ADMIN_CONTACT.name}! 👋

You have received a new booking inquiry:

📋 *TRAVELER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━
• *Name:* ${formData.name}
• *Email:* ${formData.email}
• *Phone:* ${formData.phone}
• *Country:* ${formData.country}

✈️ *TRIP DETAILS*
━━━━━━━━━━━━━━━━━━━━━
• *Trip Type:* ${formData.tripType || "Not specified"}
• *Destination:* ${destinationName}
• *Travel Dates:* ${formatDate(formData.startDate)} to ${formatDate(formData.endDate)}
• *Duration:* ${tripDuration}

👥 *GROUP INFORMATION*
━━━━━━━━━━━━━━━━━━━━━
• *Group Type:* ${groupTypeName}
• *Adults:* ${formData.adults}
• *Children:* ${formData.children}
• *Total Travelers:* ${totalVisitors}

⭐ *PREFERENCES*
━━━━━━━━━━━━━━━━━━━━━
• *Accommodation Style:* ${accommodationType}
• *Interests:* ${interestsList}
• *Budget/Person:* ${formData.budgetPerPerson ? `${formData.currency} ${formData.budgetPerPerson}` : "Not specified"}
• *Preferred Contact:* ${formData.preferredContactMethod || "Not specified"}
• *Best Contact Time:* ${formData.preferredContactTime || "Not specified"}
• *Pickup Location:* ${formData.pickupLocation || "Not specified"}
• *Found Us Via:* ${formData.marketingSource || "Not specified"}

💬 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━
${formData.specialRequests || "No special requests"}

━━━━━━━━━━━━━━━━━━━━━
📅 *Submitted:* ${new Date().toLocaleString()}

Please provide a personalized quote and itinerary. Thank you!`;
  }, [
    formData,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    accommodationTypes,
    groupTypes,
  ]);

  // Send WhatsApp message
  const sendWhatsAppMessage = useCallback(() => {
    window.open(getWhatsAppLink(buildBookingMessage()), "_blank");
  }, [buildBookingMessage]);

  // Handle form submit
  const saveBookingLocally = (booking) => {
    try {
      const raw = localStorage.getItem("altuvera_bookings");
      const existing = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(existing) ? existing : [];
      localStorage.setItem(
        "altuvera_bookings",
        JSON.stringify([booking, ...list].slice(0, 50)),
      );
    } catch {
      // ignore
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateStep(4)) return;

      setIsSubmitting(true);
      setFeedbackMessage("");

      const bookingPayload = {
        ...formData,
        userId: user?.id || user?.userId || null,
        userName: user?.fullName || user?.name || formData.name,
        userEmail: user?.email || formData.email,
        userPhone: user?.phone || formData.phone,
        tripDuration: getTripDuration(),
        totalTravelers: getTotalVisitors(),
        destinationName: getDestinationName(),
        message: buildBookingMessage(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      try {
        const result = await sendMessage({
          type: "booking",
          data: bookingPayload,
        });

        saveBookingLocally(bookingPayload);

        if (result?.success) {
          setFeedbackType("success");
          setFeedbackMessage(
            "Your booking request has been received. A travel specialist will contact you shortly."
          );
          sendWhatsAppMessage();
          setIsSubmitted(true);
        } else {
          setFeedbackType("warning");
          setFeedbackMessage(
            "We could not submit your booking to the server right now. Your request is saved locally and WhatsApp is opening so we can keep the conversation moving."
          );
          sendWhatsAppMessage();
        }
      } catch (err) {
        console.error("Booking submission error:", err);
        saveBookingLocally(bookingPayload);
        setFeedbackType("error");
        setFeedbackMessage(
          err?.message ||
            "We were unable to submit your booking. Your request is saved locally. Please try again or contact us on WhatsApp."
        );
        sendWhatsAppMessage();
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateStep,
      formData,
      getTripDuration,
      getTotalVisitors,
      getDestinationName,
      sendWhatsAppMessage,
    ],
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 250);
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 250);
  }, []);

  // Handle step click
  const handleStepClick = useCallback(
    (stepNumber) => {
      if (stepNumber < currentStep) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(stepNumber);
          setIsAnimating(false);
        }, 250);
      }
    },
    [currentStep],
  );

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      touched,
      handleChange,
      handleBlur,
      isMobile,
    };

    switch (currentStep) {
      case 1:
        return (
          <StepOne
            {...commonProps}
            categoriesList={categoriesList}
            destinationsList={destinationsList}
            countriesList={countriesList}
            servicesData={servicesData}
            getTripDuration={getTripDuration}
            user={user}
            displayName={displayName}
          />
        );
      case 2:
        return (
          <StepTwo
            {...commonProps}
            groupTypes={groupTypes}
            accommodationTypes={accommodationTypes}
            getTotalVisitors={getTotalVisitors}
            user={user}
            displayName={displayName}
          />
        );
      case 3:
        return (
          <StepThree
            {...commonProps}
            interests={interests}
            handleInterestToggle={handleInterestToggle}
            user={user}
            displayName={displayName}
          />
        );
      case 4:
        return (
          <StepFour
            {...commonProps}
            getTripDuration={getTripDuration}
            getTotalVisitors={getTotalVisitors}
            getDestinationName={getDestinationName}
            accommodationTypes={accommodationTypes}
            user={user}
            displayName={displayName}
            isAuthenticated={isAuthenticated}
            openModal={openModal}
          />
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loadingData) {
    return (
      <div>
        <GlobalStyles />
        <PageHeader
          title="Book Your Adventure"
          subtitle="Start planning your East African adventure today."
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "40px 20px" : "70px 24px",
            backgroundColor: THEME.background,
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `4px solid ${THEME.gray200}`,
              borderTopColor: THEME.primary,
            }}
          />
        </section>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div>
        <GlobalStyles />
        <ConfettiCelebration active={true} duration={5000} />
        <PageHeader
          title="Booking Request"
          subtitle="Your adventure awaits!"
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "30px 16px 75px" : "60px 24px 100px",
            backgroundColor: THEME.background,
            minHeight: "70vh",
            position: "relative",
          }}
        >
          <FloatingParticles />
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <GlassCard
              glow
              style={{ padding: isMobile ? "20px 20px" : "35px 40px" }}
            >
              <SuccessScreen isMobile={isMobile} displayName={displayName} />
            </GlassCard>
          </div>
        </section>
      </div>
    );
  }

  // Main booking form
  return (
    <div>
      <GlobalStyles />

      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Booking" }]}
      />

      <section
        style={{
          padding: isMobile
            ? "40px 16px 100px"
            : isTablet
              ? "50px 24px 120px"
              : "80px 24px 140px",
          backgroundColor: THEME.background,
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Floating particles */}
        <FloatingParticles />

        {/* Decorative blobs */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 450,
            height: 450,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background: `linear-gradient(135deg, rgba(5, 150, 105, 0.06) 0%, rgba(16, 185, 129, 0.03) 100%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          style={{
            position: "absolute",
            bottom: -130,
            left: -130,
            width: 380,
            height: 380,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: `linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.02) 100%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* WhatsApp Contact Banner */}
          <AnimatedSection animation="fadeInUp">
            <WhatsAppContactBanner isMobile={isMobile} />
          </AnimatedSection>

          {/* Progress Stepper */}
          <AnimatedSection animation="fadeInUp" delay={0.05}>
            <ProgressStepper
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              isMobile={isMobile}
            />
          </AnimatedSection>

          {/* Form Card */}
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <GlassCard
              glow
              style={{
                padding: isMobile
                  ? "30px 22px"
                  : isTablet
                    ? "45px 35px"
                    : "55px 70px",
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? "translateY(16px)" : "translateY(0)",
                transition: "all 0.25s ease",
                position: "relative",
                zIndex: 2,
                boxShadow:
                  "0 32px 80px rgba(2,44,34,.14), 0 12px 30px rgba(2,44,34,.08)",
              }}
            >
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep}>
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  style={{
                    display: "flex",
                    justifyContent:
                      currentStep > 1 ? "space-between" : "flex-end",
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column-reverse" : "row",
                    marginTop: isMobile ? 36 : 50,
                    paddingTop: isMobile ? 28 : 36,
                    borderTop: `2px solid ${THEME.gray100}`,
                    gap: 14,
                  }}
                >
                  {currentStep > 1 && (
                    <MagneticButton>
                      <motion.button
                        type="button"
                        onClick={prevStep}
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
                          width: isMobile ? "100%" : "auto",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          backgroundColor: THEME.gray50,
                          borderColor: THEME.gray300,
                          scale: 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiArrowLeft size={18} />
                        {!isMobile && "Previous"}
                      </motion.button>
                    </MagneticButton>
                  )}

                  <MagneticButton>
                    {currentStep < 4 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          padding: isMobile ? "15px 24px" : "17px 36px",
                          borderRadius: 16,
                          border: "none",
                          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
                          color: "white",
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          width: isMobile ? "100%" : "auto",
                          boxShadow: `0 8px 24px ${THEME.shadowDark}`,
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          boxShadow: `0 12px 32px ${THEME.shadowDark}`,
                          scale: 1.02,
                          y: -2,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Continue
                        <FiArrowRight size={18} />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          padding: isMobile ? "15px 24px" : "17px 40px",
                          borderRadius: 16,
                          border: "none",
                          background: isSubmitting
                            ? `linear-gradient(135deg, ${THEME.gray400} 0%, ${THEME.gray500} 100%)`
                            : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                          color: "white",
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: 600,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          width: isMobile ? "100%" : "auto",
                          boxShadow: isSubmitting
                            ? "none"
                            : "0 8px 24px rgba(37, 211, 102, 0.35)",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={
                          !isSubmitting
                            ? {
                                boxShadow:
                                  "0 12px 32px rgba(37, 211, 102, 0.45)",
                                scale: 1.02,
                                y: -2,
                              }
                            : {}
                        }
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <FiLoader size={18} />
                            </motion.div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaWhatsapp size={20} />
                            {isMobile
                              ? "Submit via WhatsApp"
                              : "Submit Request via WhatsApp"}
                          </>
                        )}
                      </motion.button>
                    )}
                  </MagneticButton>
                </motion.div>
              </form>
            </GlassCard>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection animation="fadeInUp" delay={0.25}>
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: isMobile ? 20 : 40,
                marginTop: isMobile ? 36 : 50,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: FiShield, text: "Secure & Verified" },
                { icon: FiAward, text: "Expert Guidance" },
                { icon: FiHeadphones, text: "24/7 WhatsApp Support" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: THEME.textLight,
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                  }}
                >
                  <item.icon size={18} color={THEME.primary} />
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Booking;
