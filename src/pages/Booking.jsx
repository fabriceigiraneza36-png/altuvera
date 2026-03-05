
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
  FiDollarSign,
  FiHome,
  FiSend,
  FiChevronDown,
  FiCamera,
  FiSunrise,
  FiCompass,
  FiAward,
  FiShield,
  FiZap,
  FiTrendingUp,
  FiEdit3,
  FiX,
  FiInfo,
  FiPlus,
  FiMinus,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  useScroll,
} from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { countries as countriesData } from "../data/countries";
import { services as servicesData } from "../data/services";
import { useUserAuth } from "../context/UserAuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING CONTEXT - Concurrent State Management
   ═══════════════════════════════════════════════════════════════════════════ */
const BookingContext = createContext(null);

const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider");
  return context;
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONFETTI CELEBRATION COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
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
      "#10B981", "#059669", "#F59E0B", "#EF4444", "#8B5CF6",
      "#06B6D4", "#F97316", "#EC4899", "#22C55E", "#3B82F6"
    ];

    const particles = [];
    const startTime = performance.now();

    // Create particles in bursts
    for (let burst = 0; burst < 12; burst++) {
      const burstDelay = burst * 150;
      const burstX = (0.1 + Math.random() * 0.8) * window.innerWidth;
      const burstY = Math.random() * window.innerHeight * 0.3;
      
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 12 + Math.random() * 20;
        
        particles.push({
          x: burstX + (Math.random() - 0.5) * 100,
          y: burstY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 8,
          size: 4 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
          gravity: 0.3 + Math.random() * 0.4,
          friction: 0.98,
          opacity: 1,
          delay: burstDelay,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.05 + Math.random() * 0.1,
        });
      }
    }

    let rafId;
    const animate = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const elapsed = now - startTime;

      particles.forEach(p => {
        if (elapsed < p.delay) return;
        
        const t = elapsed - p.delay;
        
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx + Math.sin(p.wobble + t * p.wobbleSpeed) * 2;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        
        if (elapsed > duration * 0.6) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0 && p.y < window.innerHeight + 100) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          
          if (p.shape === 'rect') {
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

/* ═══════════════════════════════════════════════════════════════════════════
   FLOATING PARTICLES BACKGROUND
   ═══════════════════════════════════════════════════════════════════════════ */
const FloatingParticles = memo(() => {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            borderRadius: "50%",
            background: `rgba(5, 150, 105, ${0.1 + Math.random() * 0.2})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON WRAPPER
   ═══════════════════════════════════════════════════════════════════════════ */
const MagneticButton = memo(({ children, strength = 0.3, className, style, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }, [strength, x, y]);

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
});

/* ═══════════════════════════════════════════════════════════════════════════
   GLASS MORPHISM CARD
   ═══════════════════════════════════════════════════════════════════════════ */
const GlassCard = memo(({ children, style, className, hover = true, glow = false, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: 28,
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: isHovered && hover
          ? "0 30px 60px -12px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(5, 150, 105, 0.1)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
            background: "radial-gradient(circle at center, rgba(5, 150, 105, 0.05) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      {children}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED PROGRESS STEPPER
   ═══════════════════════════════════════════════════════════════════════════ */
const ProgressStepper = memo(({ steps, currentStep, onStepClick, isMobile }) => {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  return (
    <div style={{ marginBottom: isMobile ? 32 : 50, padding: "0 20px" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Progress Line Background */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? 22 : 28,
            left: isMobile ? 35 : 70,
            right: isMobile ? 35 : 70,
            height: 4,
            background: "linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 100%)",
            borderRadius: 4,
            zIndex: 0,
          }}
        />
        
        {/* Animated Progress Fill */}
        <motion.div
          style={{
            position: "absolute",
            top: isMobile ? 22 : 28,
            left: isMobile ? 35 : 70,
            height: 4,
            background: "linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)",
            borderRadius: 4,
            zIndex: 1,
            boxShadow: "0 0 20px rgba(5, 150, 105, 0.4)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `calc(${progressPercent}% - ${isMobile ? 70 : 140}px * ${progressPercent / 100})` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />

        {steps.map((step, index) => {
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
              whileHover={isClickable ? { scale: 1.05 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              <motion.div
                style={{
                  width: isMobile ? 44 : 56,
                  height: isMobile ? 44 : 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: isMobile ? 8 : 12,
                  position: "relative",
                  border: "3px solid",
                }}
                animate={{
                  backgroundColor: isCompleted || isActive ? "#059669" : "white",
                  borderColor: isCompleted || isActive ? "#059669" : "#E5E7EB",
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? "0 0 0 8px rgba(5, 150, 105, 0.15), 0 8px 24px rgba(5, 150, 105, 0.3)"
                    : isCompleted
                    ? "0 4px 12px rgba(5, 150, 105, 0.2)"
                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Pulse Animation for Active Step */}
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: -8,
                      borderRadius: "50%",
                      border: "2px solid #059669",
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
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
                      transition={{ duration: 0.3 }}
                    >
                      <FiCheck size={isMobile ? 20 : 24} color="white" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ color: isActive ? "white" : "#9CA3AF" }}
                    >
                      {step.icon}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.span
                style={{
                  fontSize: isMobile ? 11 : 14,
                  fontWeight: 600,
                  textAlign: "center",
                  maxWidth: isMobile ? 60 : 100,
                  lineHeight: 1.3,
                }}
                animate={{
                  color: isActive ? "#059669" : isCompleted ? "#065F46" : "#9CA3AF",
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
});

/* ═══════════════════════════════════════════════════════════════════════════
   FORM INPUT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const FormInput = memo(({
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
  const inputRef = useRef(null);
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <motion.div
      style={{ position: "relative" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: isMobile ? 13 : 14,
          fontWeight: 600,
          color: "#1a1a1a",
          marginBottom: 10,
        }}
      >
        {Icon && <Icon size={16} style={{ color: "#059669" }} />}
        {label}
        {required && <span style={{ color: "#EF4444", fontSize: 12 }}>*</span>}
      </label>
      
      <div style={{ position: "relative" }}>
        <motion.input
          ref={inputRef}
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
            borderColor: hasError ? "#EF4444" : isFocused ? "#059669" : isValid ? "#10B981" : "#E5E7EB",
            borderRadius: 14,
            backgroundColor: hasError ? "#FEF2F2" : isFocused ? "white" : isValid ? "#F0FDF4" : "#FAFAFA",
            outline: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isFocused
              ? "0 0 0 4px rgba(5, 150, 105, 0.1), 0 4px 12px rgba(5, 150, 105, 0.08)"
              : hasError
              ? "0 0 0 4px rgba(239, 68, 68, 0.1)"
              : "none",
          }}
          animate={{
            x: hasError ? [0, -5, 5, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.4 }}
          {...props}
        />
        
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
              <FiCheckCircle size={20} color="#10B981" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
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
        <p style={{ marginTop: 6, fontSize: 12, color: "#9CA3AF" }}>{helpText}</p>
      )}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   FORM SELECT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const FormSelect = memo(({
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: isMobile ? 13 : 14,
          fontWeight: 600,
          color: "#1a1a1a",
          marginBottom: 10,
        }}
      >
        {Icon && <Icon size={16} style={{ color: "#059669" }} />}
        {label}
        {required && <span style={{ color: "#EF4444", fontSize: 12 }}>*</span>}
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
            borderColor: hasError ? "#EF4444" : isFocused ? "#059669" : isValid ? "#10B981" : "#E5E7EB",
            borderRadius: 14,
            backgroundColor: hasError ? "#FEF2F2" : isFocused ? "white" : isValid ? "#F0FDF4" : "#FAFAFA",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isFocused
              ? "0 0 0 4px rgba(5, 150, 105, 0.1), 0 4px 12px rgba(5, 150, 105, 0.08)"
              : "none",
          }}
        >
          <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
          {options.map((opt) => (
            <option key={opt.id || opt.value || opt._id} value={opt.id || opt.value || opt._id}>
              {opt.flag ? `${opt.flag} ` : ""}{opt.name || opt.title || opt.label}
            </option>
          ))}
        </select>
        
        <div
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#6B7280",
          }}
        >
          <FiChevronDown size={20} />
        </div>
      </div>

      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
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
});

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Counter = memo(({ label, description, value, onChange, min = 0, max = 20, isMobile }) => {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? 18 : 24,
        backgroundColor: value > min ? "#F0FDF4" : "#FAFAFA",
        borderRadius: 18,
        border: `2px solid ${value > min ? "#DCFCE7" : "#E5E7EB"}`,
        transition: "all 0.3s ease",
      }}
      whileHover={{ borderColor: "#059669" }}
    >
      <div>
        <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>{description}</div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 18 }}>
        <motion.button
          type="button"
          onClick={() => !isAtMin && onChange(value - 1)}
          disabled={isAtMin}
          style={{
            width: isMobile ? 42 : 48,
            height: isMobile ? 42 : 48,
            borderRadius: 14,
            border: "2px solid #E5E7EB",
            backgroundColor: "white",
            cursor: isAtMin ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isAtMin ? 0.4 : 1,
            transition: "all 0.2s ease",
          }}
          whileHover={!isAtMin ? { scale: 1.05, borderColor: "#059669" } : {}}
          whileTap={!isAtMin ? { scale: 0.95 } : {}}
        >
          <FiMinus size={20} color="#374151" />
        </motion.button>
        
        <motion.span
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 800,
            color: "#059669",
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
            border: "2px solid #059669",
            backgroundColor: "#059669",
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
});

/* ═══════════════════════════════════════════════════════════════════════════
   SELECTION CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SelectionCard = memo(({ selected, onClick, icon, title, description, badge, isMobile }) => {
  return (
    <motion.div
      onClick={onClick}
      style={{
        padding: isMobile ? 18 : 24,
        borderRadius: 18,
        border: `2px solid ${selected ? "#059669" : "#E5E7EB"}`,
        backgroundColor: selected ? "#F0FDF4" : "white",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
      whileHover={{
        borderColor: "#059669",
        boxShadow: "0 8px 24px rgba(5, 150, 105, 0.12)",
        y: -2,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span style={{ fontSize: isMobile ? 28 : 34, flexShrink: 0 }}>{icon}</span>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
          {title}
        </h4>
        <p style={{ fontSize: isMobile ? 12 : 14, color: "#6B7280", lineHeight: 1.5 }}>
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
              color: "#059669",
              backgroundColor: "rgba(5, 150, 105, 0.1)",
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
              backgroundColor: "#059669",
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
});

/* ═══════════════════════════════════════════════════════════════════════════
   INTEREST TAG COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const InterestTag = memo(({ selected, onClick, icon, name, isMobile }) => {
  return (
    <motion.div
      onClick={onClick}
      style={{
        padding: isMobile ? "14px 12px" : "18px 16px",
        borderRadius: 14,
        border: `2px solid ${selected ? "#059669" : "#E5E7EB"}`,
        backgroundColor: selected ? "#059669" : "white",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
      whileHover={{
        borderColor: "#059669",
        y: -2,
        boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: selected ? "#059669" : "white",
      }}
    >
      <span style={{ fontSize: isMobile ? 24 : 28 }}>{icon}</span>
      <span
        style={{
          fontSize: isMobile ? 11 : 13,
          fontWeight: 600,
          color: selected ? "white" : "#1a1a1a",
          lineHeight: 1.3,
        }}
      >
        {name}
      </span>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   TRIP SUMMARY COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const TripSummary = memo(({ formData, getTripDuration, getTotalVisitors, getDestinationName, accommodationTypes, isMobile }) => {
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
      value: accommodationTypes.find(a => a.id === formData.accommodation)?.name || "Not selected",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: isMobile ? 20 : 28,
        background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
        borderRadius: 22,
        border: "2px solid #DCFCE7",
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
          color: "#065F46",
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
            transition={{ delay: i * 0.1 }}
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
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                flexShrink: 0,
              }}
            >
              <item.icon size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "#065F46" }}>{item.value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   STEP CONTENT COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const StepOne = memo(({ formData, setFormData, errors, touched, handleChange, handleBlur, categoriesList, destinationsList, countriesList, servicesData, getTripDuration, isMobile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(5, 150, 105, 0.3)",
          }}
        >
          <FiCompass size={32} color="white" />
        </motion.div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 26 : 38,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          Where's Your Dream <span style={{ color: "#059669" }}>Destination?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "#6B7280", lineHeight: 1.6 }}>
          Let's start planning your perfect African adventure
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 20 : 28,
        }}
      >
        <FormSelect
          name="tripType"
          label="Safari Experience"
          icon={FiSunrise}
          options={categoriesList.length > 0 ? categoriesList.map(c => ({ id: c.name || c, name: c.name || c })) : servicesData}
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

      <AnimatePresence>
        {getTripDuration() && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            style={{
              marginTop: 28,
              padding: isMobile ? 18 : 24,
              background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
              borderRadius: 18,
              border: "2px solid #DCFCE7",
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
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            >
              <FiClock size={24} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: 14, color: "#065F46", fontWeight: 600 }}>Trip Duration</div>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: "#059669" }}>
                {getTripDuration()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const StepTwo = memo(({ formData, setFormData, groupTypes, accommodationTypes, getTotalVisitors, isMobile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(5, 150, 105, 0.3)",
          }}
        >
          <FiUsers size={32} color="white" />
        </motion.div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 26 : 38,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 10,
          }}
        >
          Who's Joining the <span style={{ color: "#059669" }}>Adventure?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "#6B7280" }}>
          Tell us about your travel group
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
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F0FDF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiUsers size={18} color="#059669" />
          </div>
          Group Type
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
            gap: isMobile ? 10 : 14,
          }}
        >
          {groupTypes.map((type, i) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFormData(prev => ({ ...prev, groupType: type.id }))}
              style={{
                padding: isMobile ? "16px 10px" : "20px 14px",
                borderRadius: 16,
                border: `2px solid ${formData.groupType === type.id ? "#059669" : "#E5E7EB"}`,
                backgroundColor: formData.groupType === type.id ? "#F0FDF4" : "white",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: isMobile ? 28 : 34, marginBottom: 8 }}>{type.icon}</div>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#1a1a1a" }}>
                {isMobile ? type.name : type.fullName}
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
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F0FDF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiUsers size={18} color="#059669" />
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
            onChange={(val) => setFormData(prev => ({ ...prev, adults: val }))}
            min={1}
            max={20}
            isMobile={isMobile}
          />
          <Counter
            label="Children"
            description="2-17 years old"
            value={formData.children}
            onChange={(val) => setFormData(prev => ({ ...prev, children: val }))}
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
            background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
            borderRadius: 18,
            border: "2px solid #DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#065F46", fontWeight: 600, fontSize: isMobile ? 15 : 17 }}>
            <FiUsers size={24} color="#059669" />
            Total Travelers
          </div>
          <motion.span
            key={getTotalVisitors()}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, color: "#059669" }}
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
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F0FDF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiHome size={18} color="#059669" />
          </div>
          Accommodation Level
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <SelectionCard
                selected={formData.accommodation === type.id}
                onClick={() => setFormData(prev => ({ ...prev, accommodation: type.id }))}
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
});

const StepThree = memo(({ formData, setFormData, budgetRanges, interests, handleInterestToggle, isMobile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(5, 150, 105, 0.3)",
          }}
        >
          <FiHeart size={32} color="white" />
        </motion.div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 26 : 38,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 10,
          }}
        >
          What Excites You <span style={{ color: "#059669" }}>Most?</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "#6B7280" }}>
          Select your interests and budget preferences
        </p>
      </div>

      {/* Budget Range */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            fontSize: isMobile ? 15 : 17,
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F0FDF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiDollarSign size={18} color="#059669" />
          </div>
          Budget Preference
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            (We'll confirm pricing with you)
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {budgetRanges.map((budget, i) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFormData(prev => ({ ...prev, budgetRange: budget.id }))}
              style={{
                padding: isMobile ? "16px 12px" : "22px 18px",
                borderRadius: 14,
                border: `2px solid ${formData.budgetRange === budget.id ? "#059669" : "#E5E7EB"}`,
                backgroundColor: formData.budgetRange === budget.id ? "#059669" : "white",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 700,
                  color: formData.budgetRange === budget.id ? "white" : "#1a1a1a",
                }}
              >
                {budget.name}
              </div>
            </motion.div>
          ))}
        </div>
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
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F0FDF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiStar size={18} color="#059669" />
          </div>
          Select Your Interests
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
            (Select as many as you like)
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 12,
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

        {formData.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20,
              padding: "14px 18px",
              backgroundColor: "#F0FDF4",
              borderRadius: 12,
              fontSize: 14,
              color: "#065F46",
            }}
          >
            <strong>{formData.interests.length}</strong> {formData.interests.length === 1 ? "interest" : "interests"} selected
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

const StepFour = memo(({
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
  isMobile,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(5, 150, 105, 0.3)",
          }}
        >
          <FiUser size={32} color="white" />
        </motion.div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 26 : 38,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 10,
          }}
        >
          Almost <span style={{ color: "#059669" }}>There!</span>
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 17, color: "#6B7280" }}>
          How can we reach you?
        </p>
      </div>

      <TripSummary
        formData={formData}
        getTripDuration={getTripDuration}
        getTotalVisitors={getTotalVisitors}
        getDestinationName={getDestinationName}
        accommodationTypes={accommodationTypes}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 20 : 28,
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginTop: 28 }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: 10,
          }}
        >
          <FiMessageSquare size={16} style={{ color: "#059669" }} />
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
            border: "2px solid #E5E7EB",
            borderRadius: 16,
            backgroundColor: "#FAFAFA",
            outline: "none",
            resize: "vertical",
            minHeight: isMobile ? 110 : 130,
            fontFamily: "inherit",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.backgroundColor = "white";
            e.target.style.boxShadow = "0 0 0 4px rgba(5, 150, 105, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#E5E7EB";
            e.target.style.backgroundColor = "#FAFAFA";
            e.target.style.boxShadow = "none";
          }}
        />
      </motion.div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
const SuccessScreen = memo(({ isMobile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: "center", padding: isMobile ? "50px 20px" : "70px 40px" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
        style={{
          width: isMobile ? 110 : 140,
          height: isMobile ? 110 : 140,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 30px",
          boxShadow: "0 20px 50px rgba(5, 150, 105, 0.35)",
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
          color: "#1a1a1a",
          marginBottom: 16,
        }}
      >
        Request Sent! 🎉
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: isMobile ? "12px 24px" : "16px 32px",
          backgroundColor: "#25D366",
          color: "white",
          borderRadius: 50,
          fontSize: isMobile ? 14 : 16,
          fontWeight: 600,
          marginBottom: 24,
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
        }}
      >
        <FiMessageSquare size={20} />
        Message sent via WhatsApp
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          fontSize: isMobile ? 15 : 18,
          color: "#6B7280",
          marginBottom: 32,
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.7,
        }}
      >
        Thank you for your interest in traveling with Altuvera! Your booking details have been sent to our team. 
        We'll reach out within 24 hours with a personalized itinerary.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BOOKING COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const Booking = () => {
  const { authFetch, user } = useUserAuth();

  // Data fetching states
  const [countriesList, setCountriesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Window size
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Form data
  const [formData, setFormData] = useState({
    tripType: "",
    destination: "",
    startDate: "",
    endDate: "",
    adults: 2,
    children: 0,
    groupType: "couple",
    accommodation: "mid-range",
    interests: [],
    budgetRange: "standard",
    name: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        const [cRes, catRes, destRes] = await Promise.all([
          fetch(`${API_URL}/countries`).then(r => r.json()).catch(() => ({})),
          fetch(`${API_URL}/destinations/categories`).then(r => r.json()).catch(() => ({})),
          fetch(`${API_URL}/destinations`).then(r => r.json()).catch(() => ({})),
        ]);

        setCountriesList(cRes.data || cRes || countriesData || []);
        setCategoriesList(catRes.data || catRes || []);
        setDestinationsList(destRes.data || destRes || []);
      } catch (err) {
        console.error("Failed to fetch booking data", err);
        setCountriesList(countriesData || []);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Interests options
  const interests = useMemo(() => [
    { name: "Wildlife Safari", icon: "🦁" },
    { name: "Mountain Trekking", icon: "🏔️" },
    { name: "Gorilla Tracking", icon: "🦍" },
    { name: "Beach & Relaxation", icon: "🏖️" },
    { name: "Cultural Experiences", icon: "🎭" },
    { name: "Photography", icon: "📸" },
    { name: "Bird Watching", icon: "🦅" },
    { name: "Adventure Sports", icon: "🪂" },
  ], []);

  // Accommodation types
  const accommodationTypes = useMemo(() => [
    { id: "budget", name: "Budget", description: "Comfortable lodges & camps", icon: "🏕️" },
    { id: "mid-range", name: "Mid-Range", description: "Quality lodges & tented camps", icon: "🏨" },
    { id: "luxury", name: "Luxury", description: "Premium lodges & camps", icon: "🏰" },
    { id: "ultra-luxury", name: "Ultra Luxury", description: "Exclusive private experiences", icon: "👑" },
  ], []);

  // Group types
  const groupTypes = useMemo(() => [
    { id: "solo", name: "Solo", fullName: "Solo Traveler", icon: "🧑" },
    { id: "couple", name: "Couple", fullName: "Couple", icon: "💑" },
    { id: "family", name: "Family", fullName: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "friends", name: "Friends", fullName: "Friends", icon: "👥" },
    { id: "business", name: "Business", fullName: "Business", icon: "💼" },
  ], []);

  // Budget ranges
  const budgetRanges = useMemo(() => [
    { id: "economy", name: "Economy" },
    { id: "standard", name: "Standard" },
    { id: "premium", name: "Premium" },
    { id: "luxury", name: "Luxury" },
  ], []);

  // Validation rules
  const validationRules = useMemo(() => ({
    tripType: { required: true, message: "Please select a trip type" },
    destination: { required: true, message: "Please select a destination" },
    startDate: {
      required: true,
      message: "Please select a start date",
      validate: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) < today) return "Start date cannot be in the past";
        return null;
      },
    },
    endDate: {
      required: true,
      message: "Please select an end date",
      validate: (value) => {
        if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
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
  }), [formData.startDate]);

  // Validate single field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === "string" && !value.trim()))) {
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
  }, [validationRules]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Handle interest toggle
  const handleInterestToggle = useCallback((interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  // Validate step
  const validateStep = useCallback((step) => {
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

    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  }, [formData, validateField]);

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
  const getTotalVisitors = useCallback(() => formData.adults + formData.children, [formData.adults, formData.children]);

  // Get destination name
  const getDestinationName = useCallback(() => {
    const dest = destinationsList.find(c => c.id === formData.destination || c._id === formData.destination);
    if (dest) return `${dest.flag || "📍"} ${dest.name}`;
    const country = countriesList.find(c => c.id === formData.destination || c.slug === formData.destination);
    return country ? `${country.flag || "🏳️"} ${country.name}` : "Not selected";
  }, [formData.destination, destinationsList, countriesList]);

  // Send WhatsApp message
  const sendWhatsAppMessage = useCallback(() => {
    const phoneNumber = "256792352409";
    const tripDuration = getTripDuration() || "Not specified";
    const totalVisitors = getTotalVisitors();
    const destinationName = getDestinationName();
    const accommodationType = accommodationTypes.find(a => a.id === formData.accommodation)?.name || "Not specified";
    const groupTypeName = groupTypes.find(g => g.id === formData.groupType)?.fullName || "Not specified";
    const budgetName = budgetRanges.find(b => b.id === formData.budgetRange)?.name || "Not specified";
    const interestsList = formData.interests.length > 0 ? formData.interests.join(", ") : "None selected";

    const message = `🌍 *NEW BOOKING REQUEST - ALTUVERA TOURS*

Hello Admin! 👋

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
• *Travel Dates:* ${formData.startDate} to ${formData.endDate}
• *Duration:* ${tripDuration}

👥 *GROUP INFORMATION*
━━━━━━━━━━━━━━━━━━━━━
• *Group Type:* ${groupTypeName}
• *Adults:* ${formData.adults}
• *Children:* ${formData.children}
• *Total Travelers:* ${totalVisitors}

⭐ *PREFERENCES*
━━━━━━━━━━━━━━━━━━━━━
• *Accommodation:* ${accommodationType}
• *Budget Range:* ${budgetName}
• *Interests:* ${interestsList}

💬 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━
${formData.specialRequests || "No special requests"}

━━━━━━━━━━━━━━━━━━━━━
📅 *Submitted:* ${new Date().toLocaleString()}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }, [formData, getTripDuration, getTotalVisitors, getDestinationName, accommodationTypes, groupTypes, budgetRanges]);

  // Handle form submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      await authFetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tripDuration: getTripDuration(),
          totalTravelers: getTotalVisitors(),
          destinationName: getDestinationName(),
          status: "Pending",
        }),
      });

      sendWhatsAppMessage();
      setIsSubmitted(true);
    } catch (err) {
      console.error("Booking submission error:", err);
      sendWhatsAppMessage();
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateStep, authFetch, formData, getTripDuration, getTotalVisitors, getDestinationName, sendWhatsAppMessage]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  }, []);

  // Handle step click
  const handleStepClick = useCallback((stepNumber) => {
    if (stepNumber < currentStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepNumber);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentStep]);

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
          />
        );
      case 2:
        return (
          <StepTwo
            {...commonProps}
            groupTypes={groupTypes}
            accommodationTypes={accommodationTypes}
            getTotalVisitors={getTotalVisitors}
          />
        );
      case 3:
        return (
          <StepThree
            {...commonProps}
            budgetRanges={budgetRanges}
            interests={interests}
            handleInterestToggle={handleInterestToggle}
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
        <PageHeader
          title="Book Your Adventure"
          subtitle="Start planning your East African adventure today."
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "60px 20px" : "100px 24px",
            backgroundColor: "#F8FAF9",
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "4px solid #E5E7EB",
              borderTopColor: "#059669",
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
        <ConfettiCelebration active={true} duration={5000} />
        <PageHeader
          title="Booking Request"
          subtitle="Your adventure awaits!"
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: "Booking" }]}
        />
        <section
          style={{
            padding: isMobile ? "40px 16px 100px" : "80px 24px 140px",
            backgroundColor: "#F8FAF9",
            minHeight: "70vh",
            position: "relative",
          }}
        >
          <FloatingParticles />
          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <GlassCard glow style={{ padding: isMobile ? "30px 20px" : "50px 60px" }}>
              <SuccessScreen isMobile={isMobile} />
            </GlassCard>
          </div>
        </section>
      </div>
    );
  }

  // Main booking form
  return (
    <div>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; }
        
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
        
        .gradient-text {
          background: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <PageHeader
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Booking" }]}
      />

      <section
        style={{
          padding: isMobile ? "40px 16px 100px" : isTablet ? "50px 24px 120px" : "80px 24px 140px",
          backgroundColor: "#F8FAF9",
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
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 500,
            height: 500,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            background: "linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(52, 211, 153, 0.03) 100%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Progress Stepper */}
          <AnimatedSection animation="fadeInUp">
            <ProgressStepper
              steps={steps}
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
                padding: isMobile ? "30px 22px" : isTablet ? "45px 35px" : "55px 70px",
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? "translateY(20px)" : "translateY(0)",
                transition: "all 0.3s ease",
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    display: "flex",
                    justifyContent: currentStep > 1 ? "space-between" : "flex-end",
                    alignItems: isMobile ? "stretch" : "center",
                    flexDirection: isMobile ? "column-reverse" : "row",
                    marginTop: isMobile ? 36 : 50,
                    paddingTop: isMobile ? 28 : 36,
                    borderTop: "2px solid #F3F4F6",
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
                          border: "2px solid #E5E7EB",
                          backgroundColor: "transparent",
                          color: "#374151",
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          width: isMobile ? "100%" : "auto",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          backgroundColor: "#F9FAFB",
                          borderColor: "#D1D5DB",
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
                          background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                          color: "white",
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          width: isMobile ? "100%" : "auto",
                          boxShadow: "0 6px 20px rgba(5, 150, 105, 0.35)",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          boxShadow: "0 10px 30px rgba(5, 150, 105, 0.45)",
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
                            ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                            : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                          color: "white",
                          fontSize: isMobile ? 14 : 16,
                          fontWeight: 600,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          width: isMobile ? "100%" : "auto",
                          boxShadow: isSubmitting
                            ? "none"
                            : "0 6px 20px rgba(5, 150, 105, 0.35)",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={
                          !isSubmitting
                            ? {
                                boxShadow: "0 10px 30px rgba(5, 150, 105, 0.45)",
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
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <FiLoader size={18} />
                            </motion.div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FiSend size={18} />
                            {isMobile ? "Submit" : "Submit via WhatsApp"}
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
          <AnimatedSection animation="fadeInUp" delay={0.3}>
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
                { icon: FiShield, text: "Secure Booking" },
                { icon: FiAward, text: "Best Price Guarantee" },
                { icon: FiMessageSquare, text: "24/7 Support" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#6B7280",
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 500,
                  }}
                >
                  <item.icon size={18} color="#059669" />
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