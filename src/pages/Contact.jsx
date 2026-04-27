import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare,
  FiCheckCircle, FiUser, FiAlertCircle, FiChevronDown, FiCalendar,
  FiUsers, FiGlobe, FiStar, FiArrowRight, FiArrowLeft,
  FiMessageCircle, FiHelpCircle, FiShield, FiHeadphones, FiX,
  FiExternalLink, FiAward, FiZap,
} from "react-icons/fi";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaTiktok,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import SEO from "../components/common/SEO";

import herobg from "../assets/fabrice.jpg";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { sendMessage } from "../utils/sendMessage";
import { sendVerificationCode, verifyCode } from "../utils/verifyEmail";
import { useChatSocket } from "../hooks/useChatSocket";
import VerificationModal from "../components/common/VerificationModal";

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
   ══════════════════════════════════════════════════════════════ */

const BRAND = {
  // Darkened green palette
  green900: "#064e3b",
  green800: "#065f46",
  green700: "#047857",
  green600: "#059669",
  green500: "#10b981",
  green400: "#34d399",
  green300: "#6ee7b7",
  green200: "#a7f3d0",
  green100: "#d1fae5",
  green50: "#ecfdf5",
  greenGlow: "rgba(5, 150, 105, 0.35)",
};

const TIMING = {
  smooth: [0.21, 0.68, 0.35, 0.98],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
};

/* ══════════════════════════════════════════════════════════════
   VALIDATION ENGINE
   ══════════════════════════════════════════════════════════════ */

const validationRules = {
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s'\-]+$/,
    messages: {
      required: "Full name is required",
      minLength: "At least 2 characters",
      pattern: "Enter a valid name (letters only)",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "Email address is required",
      pattern: "Enter a valid email address",
    },
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    messages: { pattern: "Enter a valid phone number" },
  },
  subject: {
    required: true,
    minLength: 5,
    messages: {
      required: "Subject is required",
      minLength: "At least 5 characters",
    },
  },
  message: {
    required: true,
    minLength: 20,
    messages: {
      required: "Message is required",
      minLength: "At least 20 characters",
    },
  },
};

const validateField = (fieldName, value) => {
  const rule = validationRules[fieldName];
  if (!rule) return "";
  if (rule.required && !value?.trim()) return rule.messages.required;
  if (value && rule.minLength && value.length < rule.minLength)
    return rule.messages.minLength;
  if (value && rule.pattern && !rule.pattern.test(value))
    return rule.messages.pattern;
  return "";
};

const STEP_FIELDS = [
  ["name", "email", "phone"],
  ["tripType", "travelDate", "travelers"],
  ["subject", "message"],
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  tripType: "",
  travelDate: "",
  travelers: "",
};

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
   ══════════════════════════════════════════════════════════════ */

const ScrollReveal = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
  style = {},
  distance = 40,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: -distance },
    right: { x: distance },
    scale: { scale: 0.92 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: TIMING.smooth }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   FIELD COMPONENTS
   ══════════════════════════════════════════════════════════════ */

const FieldInput = React.memo(({
  name, label, icon: Icon, type = "text", placeholder,
  required, value, onChange, onBlur, error, touched, full,
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: hasError ? "#ef4444" : focused ? BRAND.green700 : undefined }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.7 }} />} {label}
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-field-wrap ${focused ? "focused" : ""}`}>
        {type === "email" ? (
          <EmailAutocompleteInput
            name={name}
            value={value}
            onValueChange={(next) => onChange?.({ target: { name, value: next } })}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            className={`ct-input ${hasError ? "err" : isValid ? "ok" : ""}`}
            aria-invalid={!!hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            className={`ct-input ${hasError ? "err" : isValid ? "ok" : ""}`}
            aria-invalid={!!hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        )}
        <div className="ct-underline" />
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.span
              className="ct-status"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.25, ease: TIMING.bounce }}
            >
              <FiAlertCircle size={17} color="#ef4444" />
            </motion.span>
          )}
          {isValid && (
            <motion.span
              className="ct-status"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.25, ease: TIMING.bounce }}
            >
              <FiCheckCircle size={17} color={BRAND.green700} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            id={`${name}-error`}
            className="ct-field-err"
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <FiAlertCircle size={12} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FieldInput.displayName = "FieldInput";

const FieldSelect = React.memo(({
  name, label, icon: Icon, placeholder, options,
  value, onChange, onBlur, full,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: focused ? BRAND.green700 : undefined }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.7 }} />} {label}
      </label>
      <div className={`ct-field-wrap ${focused ? "focused" : ""}`}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className="ct-select"
        >
          <option value="">{placeholder}</option>
          {options.map((o, i) => (
            <option key={i} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
        <div className="ct-underline" />
        <span
          className="ct-sel-arrow"
          style={{ color: focused ? BRAND.green700 : "#94a3b8" }}
        >
          <FiChevronDown size={18} />
        </span>
      </div>
    </div>
  );
});

FieldSelect.displayName = "FieldSelect";

const FieldTextarea = React.memo(({
  name, label, placeholder, required, maxLength = 2000,
  value, onChange, onBlur, error, touched, full,
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && value;
  const charCount = value?.length || 0;
  const percentage = (charCount / maxLength) * 100;

  const progressColor =
    percentage > 90 ? "#ef4444" : percentage > 70 ? "#f59e0b" : BRAND.green700;

  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: hasError ? "#ef4444" : focused ? BRAND.green700 : undefined }}
      >
        <FiMessageSquare size={13} style={{ opacity: 0.7 }} /> {label}
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-field-wrap ${focused ? "focused" : ""}`}>
        <textarea
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className={`ct-textarea ${hasError ? "err" : isValid ? "ok" : ""}`}
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
        <div className="ct-underline" />
        <div className="ct-char">
          <div className="ct-char-track">
            <motion.div
              className="ct-char-fill"
              animate={{ width: `${percentage}%`, backgroundColor: progressColor }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="ct-char-num" style={{ color: percentage > 90 ? "#ef4444" : "#94a3b8" }}>
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            id={`${name}-error`}
            className="ct-field-err"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FiAlertCircle size={12} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FieldTextarea.displayName = "FieldTextarea";

/* ══════════════════════════════════════════════════════════════
   STEP ANIMATION VARIANTS
   ══════════════════════════════════════════════════════════════ */

const stepVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 60 : -60,
    scale: 0.96,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: TIMING.snappy },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    scale: 0.96,
    transition: { duration: 0.35, ease: TIMING.snappy },
  }),
};

/* ══════════════════════════════════════════════════════════════
   TRUST BADGES (NEW SECTION)
   ══════════════════════════════════════════════════════════════ */

const TRUST_STATS = [
  { icon: FiUsers, value: "5,000+", label: "Happy Travelers" },
  { icon: FiStar, value: "4.9/5", label: "Average Rating" },
  { icon: FiAward, value: "12+", label: "Years Experience" },
  { icon: FiZap, value: "<2hrs", label: "Avg. Response Time" },
];

/* ══════════════════════════════════════════════════════════════
   DATA CONSTANTS
   ══════════════════════════════════════════════════════════════ */

const CONTACT_CARDS = [
  {
    icon: FiMapPin,
    title: "Visit Our Office",
    lines: ["Altuvera House, Safari Way", "Kinigi, Musanze, Rwanda"],
    href: "https://maps.google.com/?q=Kinigi+Musanze",
  },
  {
    icon: FiPhone,
    title: "Call Us",
    lines: ["+250 780 702 773", "+250 792 352 409"],
    href: "tel:+250 792 352 4090702773",
  },
  {
    icon: FiMail,
    title: "Email Us",
    lines: ["altuverasafari@gmail.com", "fabriceigiraneza36@gmail.com"],
    href: "mailto:altuverasafari@gmail.com",
  },
  {
    icon: FiClock,
    title: "Working Hours",
    lines: ["Mon – Fri: 8 AM – 6 PM EAT", "Sat: 9 AM – 2 PM EAT"],
  },
];

const TRIP_TYPES = [
  "🦁 Safari Adventure",
  "⛰️ Mountain Trekking",
  "🦍 Gorilla Trekking",
  "🏖️ Beach Holiday",
  "🎭 Cultural Tour",
  "📷 Photography Safari",
  "💕 Honeymoon",
  "👨‍👩‍👧‍👦 Family Trip",
];

const TRAVELER_OPTIONS = [
  "1 — Solo",
  "2 — Couple / Duo",
  "3–4 — Small Group",
  "5–8 — Group",
  "9+ — Large Group",
];

const SOCIALS = [
  { icon: FaFacebookF, label: "Facebook", url: "#" },
  { icon: FaInstagram, label: "Instagram", url: "#" },
  { icon: FaTwitter, label: "Twitter", url: "#" },
  { icon: FaYoutube, label: "YouTube", url: "#" },
  { icon: FaWhatsapp, label: "WhatsApp", url: "#" },
  { icon: FaTiktok, label: "TikTok", url: "#" },
];

const FAQS = [
  {
    q: "How far in advance should I book my safari?",
    a: "We recommend booking 3–6 months ahead, especially for peak season (June–October, December–February). This ensures the best lodge availability and gorilla permits. Last-minute bookings are possible but selection may be limited.",
  },
  {
    q: "What is included in your safari packages?",
    a: "Our packages typically include accommodation, all meals on safari, game drives with professional guides, park and conservation fees, airport transfers, and 24/7 support. International flights and travel insurance are usually excluded but can be arranged.",
  },
  {
    q: "Is it safe to go on safari in East Africa?",
    a: "Absolutely. East Africa has a strong tourism safety record. Our experienced guides, vetted accommodation partners, and comprehensive safety protocols ensure your wellbeing throughout the journey. We also provide detailed pre-trip briefings.",
  },
  {
    q: "Can you build a fully custom itinerary?",
    a: "Yes — bespoke itineraries are our specialty. Share your interests, preferred dates, budget range, and group composition, and our safari designers will craft a tailor-made journey that matches your vision perfectly.",
  },
  {
    q: "What should I pack for an East African safari?",
    a: "Essentials include neutral-colored clothing, a good sun hat, sunscreen (SPF 50+), binoculars, a camera with a zoom lens, comfortable walking shoes, and insect repellent. We provide a comprehensive packing list upon booking confirmation.",
  },
];

const QUICK_CHANNELS = [
  {
    icon: FaWhatsapp,
    title: "WhatsApp",
    subtitle: "Chat instantly",
    detail: "+250 780 702 773",
    href: "https://wa.me/250792352409",
    color: "#25D366",
  },
  {
    icon: FiPhone,
    title: "Call Us",
    subtitle: "Speak with an expert",
    detail: "+250 780 702 773",
    href: "tel:+250 792 352 4090702773",
    color: BRAND.green700,
  },
  {
    icon: FiMail,
    title: "Email",
    subtitle: "Detailed inquiries",
    detail: "altuverasafari@gmail.com",
    href: "mailto:altuverasafari@gmail.com",
    color: "#3B82F6",
  },
];

const STEP_CONFIG = [
  { label: "Personal Info", icon: FiUser, description: "Tell us about yourself" },
  { label: "Trip Details", icon: FiGlobe, description: "Describe your dream trip" },
  { label: "Your Message", icon: FiMessageSquare, description: "Share your thoughts" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN CONTACT COMPONENT
   ══════════════════════════════════════════════════════════════ */

const Contact = () => {
  // ── State ──
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const {
    connected: chatConnected,
    connect: connectChat,
    registerChat,
    sendMessage: sendChatMessage,
    messages: chatMessages,
    error: chatSocketError,
    loading: chatLoading,
  } = useChatSocket();

  const { user, isAuthenticated } = useUserAuth();

  // Auto-fill form when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && !form.name && !form.email) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName || user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, isAuthenticated]);

  // ── Refs ──
  const formRef = useRef(null);
  const faqRefs = useRef({});
  const heroRef = useRef(null);

  const chatRef = useRef(null);

  // ── Effects for chat socket ──
  useEffect(() => {
    if (chatOpen && !chatConnected) {
      connectChat();
    }
  }, [chatOpen, chatConnected, connectChat]);

  useEffect(() => {
    if (!chatOpen || !chatConnected) return;
    registerChat({
      name: form.name || "Guest",
      email: form.email || "",
    }).catch(() => {
      // Chat registration failed silently until user sends a message
    });
  }, [chatOpen, chatConnected, registerChat, form.name, form.email]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages, chatOpen]);

  const handleChatSend = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setChatError("");
    setChatSending(true);

    try {
      await registerChat({
        name: form.name || "Guest",
        email: form.email || "",
      });
      await sendChatMessage({
        body: trimmed,
        name: form.name || "Guest",
        email: form.email || "",
        metadata: { source: "frontend-chat" },
      });
      setChatInput("");
    } catch (err) {
      setChatError(err?.message || "Unable to send message");
    } finally {
      setChatSending(false);
    }
  }, [chatInput, form.email, form.name, registerChat, sendChatMessage]);

  const handleQuickReply = useCallback((text) => {
    setChatInput(text);
  }, []);

  // ── Parallax for hero ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // ── Handlers ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      return { ...prev, [name]: validateField(name, value) };
    });
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const validateStep = useCallback(
    (stepIndex) => {
      const newErrors = {};
      const newTouched = {};
      STEP_FIELDS[stepIndex].forEach((field) => {
        const error = validateField(field, form[field]);
        if (error) newErrors[field] = error;
        newTouched[field] = true;
      });
      setErrors((prev) => ({ ...prev, ...newErrors }));
      setTouched((prev) => ({ ...prev, ...newTouched }));
      return Object.keys(newErrors).length === 0;
    },
    [form]
  );

  const navigateStep = useCallback(
    (targetStep) => {
      if (targetStep > step && !validateStep(step)) return;
      setDirection(targetStep > step ? 1 : -1);
      setStep(targetStep);
    },
    [step, validateStep]
  );

  const nextStep = useCallback(() => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);

  const closeVerificationModal = useCallback(() => {
    setVerificationModalOpen(false);
    setVerificationError("");
    setVerificationId(null);
    setProgress(0);
  }, []);

  const handleVerifyCode = useCallback(
    async (code) => {
      if (!verificationId) return;
      setVerificationLoading(true);
      setVerificationError("");

      try {
        await verifyCode({
          email: form.email,
          verificationId,
          code,
        });

        const result = await sendMessage({
          type: "contact",
          data: { ...form },
        });

        if (!result.error) {
          setSubmitted(true);
          setVerificationModalOpen(false);
          setForm(INITIAL_FORM);
          setTouched({});
          setErrors({});
        } else {
          setVerificationError(result.error);
        }
      } catch (err) {
        setVerificationError(err.message || "Invalid code");
      } finally {
        setVerificationLoading(false);
      }
    },
    [form, verificationId],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateStep(2)) return;

      setSubmitting(true);
      setProgress(0);

      let progressVal = 0;
      const interval = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 92);
        setProgress(progressVal);
      }, 100);

      try {
        const { verificationId: id } = await sendVerificationCode({
          email: form.email,
          purpose: "contact",
        });

        setVerificationId(id);
        setVerificationError("");
        setVerificationModalOpen(true);
      } catch (err) {
        setErrors((prev) => ({ ...prev, submit: err.message || "Failed to send verification code" }));
      } finally {
        clearInterval(interval);
        setProgress(100);
        setSubmitting(false);
      }
    },
    [form, validateStep]
  );

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setStep(0);
    setDirection(1);
    setProgress(0);
    setForm(INITIAL_FORM);
    setTouched({});
    setErrors({});
  }, []);

  // ── Computed ──
  const completionPercentage = useMemo(() => {
    const filledFields = Object.values(form).filter((v) => v.trim()).length;
    return Math.round((filledFields / Object.keys(form).length) * 100);
  }, [form]);

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div className="ct">
      <SEO
        title="Contact Us"
        description="Get in touch with Altuvera for personalized safari planning, booking assistance, and expert travel advice. We're here to help you create your perfect East African adventure."
        keywords={["contact Altuvera", "safari booking", "travel inquiry", "East Africa travel", "customer support"]}
        url="/contact"
        image="/og-contact.jpg"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" }
        ]}
      />
      <style>{contactStyles}</style>

      {/* ════════════════ HERO ════════════════ */}
      <section className="ct-hero" ref={heroRef}>
        <motion.div
          className="ct-hero-bg"
          style={{ backgroundImage: `url(https://i.pinimg.com/736x/bb/ca/d1/bbcad1c07136f38bfc47257f8b38cf2a.jpg)`, y: heroY }}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: "easeOut" }}
        />
        <div className="ct-hero-overlay" />

        <motion.div className="ct-hero-inner" style={{ opacity: heroOpacity }}>
          <motion.div
            className="ct-hero-badge"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: TIMING.bounce }}
          >
            <HiSparkles size={15} color={BRAND.green300} />
            Your Safari Adventure Starts Here
          </motion.div>

          <motion.h1
            className="ct-hero-title"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Let's Plan Your
            <br />
            <em>Dream Safari</em>
          </motion.h1>

          <motion.p
            className="ct-hero-desc"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
          >
            Connect with our expert team and let us craft an unforgettable
            African adventure tailored just for you.
          </motion.p>

          <motion.div
            className="ct-hero-btns"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <a href="#contact-form" className="ct-btn ct-btn--white">
              <FiSend size={16} /> Send Message
            </a>
            <a href="tel:+250 792 352 4090702773" className="ct-btn ct-btn--ghost">
              <FiPhone size={16} /> Call Us Now
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="ct-hero-scroll"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="ct-scroll-pill">
            <motion.div
              className="ct-scroll-dot"
              animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ════════════════ TRUST STATS BAR ════════════════ */}
      <section className="ct-trust-bar">
        <div className="ct-wrap">
          <div className="ct-trust-grid">
            {TRUST_STATS.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction="up" distance={24}>
                <div className="ct-trust-item">
                  <div className="ct-trust-icon">
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="ct-trust-value">{stat.value}</div>
                    <div className="ct-trust-label">{stat.label}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ MAIN FORM SECTION ════════════════ */}
      <section className="ct-section ct-section--green-light" id="contact-form">
        <div className="ct-wrap">
          <ScrollReveal>
            <div className="ct-hdr">
              <div className="ct-badge">
                <FiMessageSquare size={14} /> Get In Touch
              </div>
              <h2 className="ct-title ct-title--dark">
                We'd Love to <em>Hear From You</em>
              </h2>
              <p className="ct-subtitle">
                Have questions about your dream safari? Our Africa travel
                experts are here to help plan your perfect journey.
              </p>
            </div>
          </ScrollReveal>

          <div className="ct-grid">
            {/* ── LEFT COLUMN: Contact Info ── */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="ct-info">
                <h3 className="ct-info-title">Contact Information</h3>
                <p className="ct-info-desc">
                  Reach out through any channel below. Our team responds within
                  2 hours during business hours.
                </p>

                {CONTACT_CARDS.map((card, i) => (
                  <ScrollReveal key={i} delay={0.15 + i * 0.06}>
                    <a
                      href={card.href || "#"}
                      className="ct-card"
                      style={{ textDecoration: "none" }}
                      {...(!card.href ? { onClick: (e) => e.preventDefault() } : {})}
                    >
                      <div className="ct-card-icon">
                        <card.icon size={20} />
                      </div>
                      <div>
                        <div className="ct-card-title">{card.title}</div>
                        {card.lines.map((line, j) => (
                          <div key={j} className="ct-card-line">{line}</div>
                        ))}
                      </div>
                      {card.href && (
                        <FiExternalLink
                          size={14}
                          className="ct-card-arrow"
                          style={{
                            position: "absolute",
                            top: 18,
                            right: 18,
                            color: "#94a3b8",
                            opacity: 0,
                            transition: "opacity .3s",
                          }}
                        />
                      )}
                    </a>
                  </ScrollReveal>
                ))}

                <ScrollReveal delay={0.45}>
                  <div className="ct-socials">
                    <div className="ct-socials-title">Follow Our Adventures</div>
                    <div className="ct-socials-row">
                      {SOCIALS.map((social, i) => (
                        <motion.a
                          key={i}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.label}
                          className="ct-social"
                          whileHover={{ scale: 1.1, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <social.icon />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* ── RIGHT COLUMN: Multi-step Form ── */}
            <ScrollReveal direction="right" delay={0.15}>
              <div className="ct-form-wrapper">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      className="ct-form-card"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: TIMING.snappy }}
                    >
                      <div className="ct-success">
                        <motion.div
                          className="ct-success-icon"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5, ease: TIMING.bounce }}
                        >
                          <FiCheckCircle size={54} color="#fff" />
                        </motion.div>

                        <motion.h3
                          className="ct-success-title"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          Message Sent Successfully!
                        </motion.h3>

                        <motion.p
                          className="ct-success-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.45 }}
                        >
                          Thank you for reaching out. Our safari experts will
                          respond to your inquiry within 24 hours.
                        </motion.p>

                        <motion.div
                          className="ct-success-email"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                        >
                          <small>Confirmation sent to</small>
                          <strong>{form.email}</strong>
                        </motion.div>

                        <motion.div
                          className="ct-success-btns"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.65 }}
                        >
                          <button className="ct-btn ct-btn--green" onClick={resetForm}>
                            <FiSend size={15} /> Send Another Message
                          </button>
                          <a href="/" className="ct-btn ct-btn--outline">
                            <FiArrowLeft size={15} /> Back to Home
                          </a>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      className="ct-form-card"
                      ref={formRef}
                      onSubmit={handleSubmit}
                      autoComplete="off"
                      noValidate
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      {/* Completion bar */}
                      <div className="ct-completion">
                        <div className="ct-completion-info">
                          <span className="ct-completion-label">Form Completion</span>
                          <span className="ct-completion-pct">{completionPercentage}%</span>
                        </div>
                        <div className="ct-completion-track">
                          <motion.div
                            className="ct-completion-fill"
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      </div>

                      {/* Step indicator */}
                      <div className="ct-steps">
                        {STEP_CONFIG.map((cfg, i) => (
                          <React.Fragment key={i}>
                            <motion.button
                              type="button"
                              className={`ct-step-circle ${
                                step === i ? "active" : step > i ? "done" : ""
                              }`}
                              onClick={() => navigateStep(i)}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label={`Step ${i + 1}: ${cfg.label}`}
                            >
                              {step > i ? (
                                <FiCheckCircle size={18} />
                              ) : (
                                <cfg.icon size={18} />
                              )}
                            </motion.button>
                            {i < STEP_CONFIG.length - 1 && (
                              <div className={`ct-step-line ${step > i ? "filled" : ""}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Step labels */}
                      <div className="ct-step-labels">
                        {STEP_CONFIG.map((cfg, i) => (
                          <span
                            key={i}
                            className={step === i ? "active" : step > i ? "done" : ""}
                          >
                            {cfg.label}
                          </span>
                        ))}
                      </div>

                      {/* Step heading */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`heading-${step}`}
                          className="ct-step-heading"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4>{STEP_CONFIG[step].label}</h4>
                          <p>{STEP_CONFIG[step].description}</p>
                        </motion.div>
                      </AnimatePresence>

                      {/* Form body */}
                      <div className="ct-form-body">
                        <AnimatePresence
                          initial={false}
                          custom={direction}
                          mode="wait"
                        >
                          <motion.div
                            key={step}
                            className="ct-form-step"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                          >
                            {step === 0 && (
                              <div className="ct-form-row">
                                <FieldInput
                                  name="name"
                                  label="Full Name"
                                  icon={FiUser}
                                  placeholder="John Doe"
                                  value={form.name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={errors.name}
                                  touched={touched.name}
                                  required
                                />
                                <FieldInput
                                  name="email"
                                  label="Email Address"
                                  icon={FiMail}
                                  type="email"
                                  placeholder="john@example.com"
                                  value={form.email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={errors.email}
                                  touched={touched.email}
                                  required
                                />
                                <FieldInput
                                  name="phone"
                                  label="Phone Number"
                                  icon={FiPhone}
                                  placeholder="+1 (555) 123-4567"
                                  value={form.phone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={errors.phone}
                                  touched={touched.phone}
                                  full
                                />
                              </div>
                            )}
                            {step === 1 && (
                              <div className="ct-form-row">
                                <FieldSelect
                                  name="tripType"
                                  label="Trip Type"
                                  icon={FiGlobe}
                                  placeholder="Select your adventure"
                                  options={TRIP_TYPES}
                                  value={form.tripType}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  full
                                />
                                <FieldInput
                                  name="travelDate"
                                  label="Travel Date"
                                  icon={FiCalendar}
                                  type="date"
                                  value={form.travelDate}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <FieldSelect
                                  name="travelers"
                                  label="Number of Travelers"
                                  icon={FiUsers}
                                  placeholder="How many travelers?"
                                  options={TRAVELER_OPTIONS}
                                  value={form.travelers}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </div>
                            )}
                            {step === 2 && (
                              <>
                                <FieldInput
                                  name="subject"
                                  label="Subject"
                                  icon={FiMessageCircle}
                                  placeholder="What is your inquiry about?"
                                  value={form.subject}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={errors.subject}
                                  touched={touched.subject}
                                  required
                                  full
                                />
                                <FieldTextarea
                                  name="message"
                                  label="Your Message"
                                  placeholder="Tell us about your dream safari, preferred destinations, special requirements, or any questions you have..."
                                  value={form.message}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={errors.message}
                                  touched={touched.message}
                                  required
                                  full
                                />
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Server error */}
                      <AnimatePresence>
                        {errors.submit && (
                          <motion.div
                            className="ct-server-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            role="alert"
                          >
                            <FiAlertCircle size={16} />
                            <span>{errors.submit}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation */}
                      <div className="ct-form-nav">
                        <div className="ct-form-nav-left">
                          {step > 0 && (
                            <motion.button
                              type="button"
                              className="ct-nav-btn ct-nav-btn--back"
                              onClick={prevStep}
                              disabled={submitting}
                              whileHover={{ x: -3 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <FiArrowLeft size={16} /> Back
                            </motion.button>
                          )}
                        </div>
                        <div className="ct-form-nav-right">
                          {step < 2 ? (
                            <motion.button
                              type="button"
                              className="ct-nav-btn ct-nav-btn--next"
                              onClick={nextStep}
                              disabled={submitting}
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Continue <FiArrowRight size={16} />
                            </motion.button>
                          ) : (
                            <motion.button
                              type="submit"
                              className="ct-nav-btn ct-nav-btn--submit"
                              disabled={submitting}
                              whileHover={!submitting ? { y: -2 } : {}}
                              whileTap={!submitting ? { scale: 0.98 } : {}}
                            >
                              {submitting ? (
                                <>
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{ display: "inline-flex" }}
                                  >
                                    ⏳
                                  </motion.span>
                                  <span>Sending...</span>
                                  <span
                                    className="ct-progress"
                                    style={{ width: `${progress}%` }}
                                  />
                                </>
                              ) : (
                                <>
                                  <RiSendPlaneFill size={17} /> Send Message
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Privacy note */}
                      <div className="ct-privacy">
                        <FiShield size={13} />
                        Your information is encrypted and never shared with third parties.
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section className="ct-section ct-section--white">
        <div className="ct-wrap ct-wrap--sm">
          <ScrollReveal>
            <div className="ct-hdr">
              <div className="ct-badge">
                <FiHelpCircle size={14} /> Frequently Asked Questions
              </div>
              <h2 className="ct-title ct-title--dark">
                Got <em>Questions</em>?
              </h2>
              <p className="ct-subtitle">
                Find quick answers about our safari experiences, booking
                process, and travel logistics.
              </p>
            </div>
          </ScrollReveal>

          <div className="ct-faq-list">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className={`ct-faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      className="ct-faq-btn"
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                    >
                      <span className="ct-faq-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="ct-faq-q">{faq.q}</span>
                      <motion.span
                        className={`ct-faq-toggle ${isOpen ? "opened" : "closed"}`}
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <FiChevronDown size={17} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${i}`}
                          role="region"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: TIMING.snappy }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            className="ct-faq-answer-inner"
                            ref={(el) => (faqRefs.current[i] = el)}
                          >
                            <p>{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ QUICK CHANNELS ════════════════ */}
      <section className="ct-section ct-section--green-light">
        <div className="ct-wrap ct-wrap--md">
          <ScrollReveal>
            <div className="ct-hdr">
              <h2 className="ct-title ct-title--dark">
                Prefer a <em>Direct Channel</em>?
              </h2>
              <p className="ct-subtitle">
                Choose the communication method that works best for you.
              </p>
            </div>
          </ScrollReveal>
          <div className="ct-quick-grid">
            {QUICK_CHANNELS.map((channel, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.a
                  href={channel.href}
                  className="ct-quick-card"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="ct-quick-icon"
                    style={{ "--channel-color": channel.color }}
                  >
                    <channel.icon size={22} />
                  </div>
                  <div>
                    <div className="ct-quick-title">{channel.title}</div>
                    <div className="ct-quick-sub">{channel.subtitle}</div>
                    <div className="ct-quick-detail">{channel.detail}</div>
                  </div>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="ct-section ct-section--dark">
        <div className="ct-cta-pattern" />
        <ScrollReveal>
          <div className="ct-wrap" style={{ textAlign: "center", maxWidth: 700 }}>
            <motion.div
              className="ct-cta-icon"
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 0 0 rgba(255,255,255,0)",
                  "0 0 0 20px rgba(255,255,255,0.06)",
                  "0 0 0 0 rgba(255,255,255,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiHeadphones size={32} color="#fff" />
            </motion.div>
            <h2 className="ct-title ct-title--white">
              Ready to Start Your <em>Adventure</em>?
            </h2>
            <p className="ct-subtitle ct-subtitle--light" style={{ marginBottom: 40 }}>
              Let's discuss your dream African safari. No obligations, just
              inspiration and expert guidance.
            </p>
            <div className="ct-cta-btns">
              <motion.a
                href="#contact-form"
                className="ct-btn ct-btn--white"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <HiSparkles size={17} /> Start Planning Today
              </motion.a>
              <motion.a
                href="/services"
                className="ct-btn ct-btn--ghost"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Our Services <FiArrowRight size={16} />
              </motion.a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ════════════════ LIVE CHAT ════════════════ */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            className="ct-chat-btn"
            onClick={() => setChatOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            aria-label="Open chat"
          >
            <FiMessageCircle size={24} color="#fff" />
            <span className="ct-chat-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="ct-chat-window"
            initial={{ opacity: 0, y: 80, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.85 }}
            transition={{ duration: 0.4, ease: TIMING.snappy }}
          >
            <div className="ct-chat-head">
              <div className="ct-chat-head-left">
                <div className="ct-chat-avatar">
                  <BiSupport size={20} color="#fff" />
                </div>
                <div>
                  <div className="ct-chat-name">Safari Support</div>
                  <div className="ct-chat-status">
                    <span className="ct-chat-dot" /> Online now
                  </div>
                </div>
              </div>
              <div className="ct-chat-head-btns">
                <button
                  className="ct-chat-hbtn"
                  onClick={() => setChatMinimized((p) => !p)}
                  aria-label={chatMinimized ? "Expand chat" : "Minimize chat"}
                >
                  <motion.div
                    animate={{ rotate: chatMinimized ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown size={15} />
                  </motion.div>
                </button>
                <button
                  className="ct-chat-hbtn"
                  onClick={() => setChatOpen(false)}
                  aria-label="Close chat"
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!chatMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ct-chat-body" ref={chatRef}>
                      {chatMessages.length === 0 ? (
                        <motion.div
                          className="ct-chat-bubble"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <p>👋 Hello! Welcome to Altuvera Safaris!</p>
                          <p>How can we help you plan your adventure today?</p>
                        </motion.div>
                      ) : (
                        chatMessages.map((message, index) => (
                          <motion.div
                            key={`${message.id || index}-${message.createdAt}`}
                            className={`ct-chat-bubble ${message.senderType === 'admin' ? 'ct-chat-bubble--admin' : 'ct-chat-bubble--user'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                          >
                            <p>{message.senderType === 'admin' ? 'Support' : message.senderName || 'You'}:</p>
                            <p>{message.body}</p>
                          </motion.div>
                        ))
                      )}
                      <div className="ct-chat-chips">
                        {[
                          "Safari packages",
                          "Best time to visit",
                          "Group bookings",
                          "Custom itinerary",
                        ].map((text, i) => (
                          <motion.button
                            key={i}
                            className="ct-chat-chip"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.07 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickReply(text)}
                          >
                            {text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  <div className="ct-chat-footer">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      className="ct-chat-input"
                      placeholder="Type your message…"
                      aria-label="Chat message input"
                    />
                    <motion.button
                      type="button"
                      disabled={chatSending}
                      onClick={handleChatSend}
                      className="ct-chat-send"
                      whileHover={{ scale: chatSending ? 1 : 1.08 }}
                      whileTap={{ scale: chatSending ? 1 : 0.92 }}
                      aria-label="Send message"
                    >
                      <RiSendPlaneFill size={16} color="#fff" />
                    </motion.button>
                  </div>
                  {(chatSocketError || chatError) && (
                    <div className="ct-chat-error">{chatSocketError || chatError}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <VerificationModal
        open={verificationModalOpen}
        email={form.email}
        loading={verificationLoading}
        error={verificationError}
        onClose={closeVerificationModal}
        onSubmit={handleVerifyCode}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   STYLES — Darkened Green Palette
   ══════════════════════════════════════════════════════════════ */

const contactStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ct {
  font-family: 'Inter', system-ui, sans-serif;
  color: #1e293b;
  background: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ═══════════════ HERO ═══════════════ */
.ct-hero {
  position: relative;
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.ct-hero-bg {
  position: absolute;
  inset: -10%;
  background-size: cover;
  background-position: center;
  will-change: transform;
  filter: brightness(0.85);
}
.ct-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    170deg,
    rgba(6, 78, 59, 0.35) 0%,
    rgba(4, 120, 87, 0.72) 40%,
    rgba(6, 95, 70, 0.8) 70%,
    rgba(6, 78, 59, 0.85) 100%
  );
}
.ct-hero-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
  max-width: 820px;
}
.ct-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  color: ${BRAND.green200};
  margin-bottom: 28px;
  letter-spacing: 0.3px;
}
.ct-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 7vw, 68px);
  font-weight: 800;
  color: #fff;
  line-height: 1.06;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}
.ct-hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, ${BRAND.green300}, ${BRAND.green200}, ${BRAND.green100});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ct-hero-desc {
  font-size: clamp(15px, 2vw, 18px);
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.75;
  max-width: 560px;
  margin: 0 auto 40px;
}
.ct-hero-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons */
.ct-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 34px;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 650;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.2px;
}
.ct-btn--white {
  background: #fff;
  color: ${BRAND.green800};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}
.ct-btn--white:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22);
}
.ct-btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.18);
}
.ct-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-3px);
}
.ct-btn--green {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
  box-shadow: 0 8px 28px rgba(6, 78, 59, 0.35);
}
.ct-btn--green:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 44px rgba(6, 78, 59, 0.42);
  background: linear-gradient(135deg, ${BRAND.green900}, ${BRAND.green800});
}
.ct-btn--outline {
  background: #fff;
  color: ${BRAND.green800};
  border: 2px solid ${BRAND.green700};
}
.ct-btn--outline:hover {
  background: ${BRAND.green50};
  transform: translateY(-2px);
}

/* Scroll indicator */
.ct-hero-scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}
.ct-scroll-pill {
  width: 28px;
  height: 46px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}
.ct-scroll-dot {
  width: 4px;
  height: 10px;
  background: #fff;
  border-radius: 2px;
}

/* ═══════════════ TRUST BAR ═══════════════ */
.ct-trust-bar {
  background: ${BRAND.green900};
  padding: 0 24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 4px 20px rgba(6, 78, 59, 0.3);
}
.ct-trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 1340px;
  margin: 0 auto;
}
.ct-trust-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 28px 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.3s;
}
.ct-trust-item:last-child { border-right: none; }
.ct-trust-item:hover { background: rgba(255, 255, 255, 0.04); }
.ct-trust-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${BRAND.green300};
  flex-shrink: 0;
}
.ct-trust-value {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}
.ct-trust-label {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* ═══════════════ SECTIONS ═══════════════ */
.ct-section {
  padding: 70px 24px;
  position: relative;
  overflow: hidden;
}
.ct-section--white { background: #fff; }
.ct-section--green-light {
  background: linear-gradient(180deg, #f0fdf4, ${BRAND.green50} 50%, #f8fffe);
}
.ct-section--green-light::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 20%, rgba(6, 78, 59, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 90% 75%, rgba(4, 120, 87, 0.04) 0%, transparent 50%);
  pointer-events: none;
}
.ct-section--dark {
  background: linear-gradient(135deg, ${BRAND.green900} 0%, ${BRAND.green800} 40%, ${BRAND.green700} 100%);
  color: #fff;
}
.ct-wrap { max-width: 1340px; margin: 0 auto; position: relative; z-index: 1; }
.ct-wrap--sm { max-width: 860px; }
.ct-wrap--md { max-width: 1100px; }

/* Headers */
.ct-hdr { text-align: center; margin-bottom: 64px; }
.ct-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.1), rgba(4, 120, 87, 0.06));
  border: 1px solid rgba(6, 78, 59, 0.12);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  color: ${BRAND.green800};
  margin-bottom: 20px;
}
.ct-badge--light {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: ${BRAND.green200};
}
.ct-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.5px;
  margin-bottom: 14px;
}
.ct-title--dark { color: #0f172a; }
.ct-title--white { color: #fff; }
.ct-title em {
  font-style: normal;
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700}, ${BRAND.green500});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ct-title--white em {
  background: linear-gradient(90deg, ${BRAND.green300}, ${BRAND.green200});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ct-subtitle {
  font-size: 17px;
  color: #64748b;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}
.ct-subtitle--light { color: rgba(255, 255, 255, 0.78); }

/* ═══════════════ GRID LAYOUT ═══════════════ */
.ct-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}
@media (min-width: 1024px) {
  .ct-grid { grid-template-columns: 5fr 7fr; gap: 52px; }
}

/* ─── Contact Info Column ─── */
.ct-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ct-info-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}
.ct-info-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 10px;
}
.ct-card {
  display: flex;
  gap: 16px;
  padding: 22px 24px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(6, 78, 59, 0.06);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.025);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  color: inherit;
}
.ct-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, ${BRAND.green800}, ${BRAND.green600});
  border-radius: 4px 0 0 4px;
  opacity: 0;
  transition: opacity 0.3s;
}
.ct-card:hover {
  transform: translateX(6px);
  box-shadow: 0 8px 32px rgba(6, 78, 59, 0.08);
  border-color: rgba(6, 78, 59, 0.12);
}
.ct-card:hover::before { opacity: 1; }
.ct-card:hover .ct-card-arrow { opacity: 1 !important; }
.ct-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(6, 78, 59, 0.3);
  transition: transform 0.3s;
}
.ct-card:hover .ct-card-icon { transform: rotate(-6deg) scale(1.06); }
.ct-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 5px;
}
.ct-card-line {
  font-size: 13.5px;
  color: #64748b;
  line-height: 1.55;
}

/* Socials */
.ct-socials {
  background: #fff;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(6, 78, 59, 0.06);
}
.ct-socials-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}
.ct-socials-row { display: flex; flex-wrap: wrap; gap: 10px; }
.ct-social {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  text-decoration: none;
  background: ${BRAND.green50};
  color: ${BRAND.green800};
  border: 1px solid rgba(6, 78, 59, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-social:hover {
  background: ${BRAND.green800};
  color: #fff;
  box-shadow: 0 8px 22px rgba(6, 78, 59, 0.3);
  border-color: ${BRAND.green800};
}

/* ─── Form Card ─── */
.ct-form-wrapper { position: relative; }
.ct-form-card {
  background: #fff;
  border-radius: 28px;
  padding: clamp(28px, 5vw, 48px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(6, 78, 59, 0.06);
  position: relative;
  overflow: hidden;
}
.ct-form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, ${BRAND.green900}, ${BRAND.green700}, ${BRAND.green500}, ${BRAND.green700}, ${BRAND.green900});
  background-size: 200% 100%;
  animation: ct-shimmer 5s ease infinite;
}
@keyframes ct-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Completion bar */
.ct-completion {
  margin-bottom: 28px;
}
.ct-completion-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ct-completion-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ct-completion-pct {
  font-size: 12px;
  font-weight: 700;
  color: ${BRAND.green700};
}
.ct-completion-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}
.ct-completion-fill {
  height: 100%;
  background: linear-gradient(90deg, ${BRAND.green800}, ${BRAND.green600});
  border-radius: 2px;
  transition: width 0.4s;
}

/* Steps */
.ct-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 10px;
}
.ct-step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}
.ct-step-circle.active {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  border-color: ${BRAND.green800};
  color: #fff;
  box-shadow: 0 4px 18px rgba(6, 78, 59, 0.35);
}
.ct-step-circle.done {
  background: ${BRAND.green700};
  border-color: ${BRAND.green700};
  color: #fff;
}
.ct-step-line {
  width: clamp(32px, 6vw, 68px);
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  transition: background 0.4s;
}
.ct-step-line.filled {
  background: linear-gradient(90deg, ${BRAND.green800}, ${BRAND.green600});
}
.ct-step-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 8px;
}
.ct-step-labels span {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  flex: 1;
  transition: color 0.3s;
}
.ct-step-labels span.active { color: ${BRAND.green800}; }
.ct-step-labels span.done { color: ${BRAND.green700}; }

/* Step heading */
.ct-step-heading { margin-bottom: 28px; }
.ct-step-heading h4 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}
.ct-step-heading p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

/* Form fields */
.ct-form-body {
  position: relative;
  min-height: 260px;
}
.ct-form-step { width: 100%; }
.ct-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}
@media (max-width: 640px) {
  .ct-form-row { grid-template-columns: 1fr; }
}
.ct-field { margin-bottom: 20px; }
.ct-field--full { grid-column: 1 / -1; }
.ct-field-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
  transition: color 0.3s;
}
.ct-req { color: #ef4444; margin-left: 2px; }
.ct-field-wrap { position: relative; }
.ct-input, .ct-select, .ct-textarea {
  width: 100%;
  padding: 15px 44px 15px 17px;
  font-family: 'Inter', sans-serif;
  font-size: 14.5px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  outline: none;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-input::placeholder, .ct-textarea::placeholder { color: #94a3b8; }
.ct-input:focus, .ct-select:focus, .ct-textarea:focus {
  border-color: ${BRAND.green700};
  background: #fff;
  box-shadow: 0 0 0 4px rgba(6, 78, 59, 0.06);
}
.ct-input.err, .ct-textarea.err { border-color: #ef4444; }
.ct-input.err:focus, .ct-textarea.err:focus { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.06); }
.ct-input.ok { border-color: ${BRAND.green600}; }
.ct-select { appearance: none; cursor: pointer; padding-right: 44px; }
.ct-sel-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  transition: color 0.3s;
}
.ct-textarea {
  min-height: 140px;
  resize: vertical;
  padding-bottom: 42px;
}
.ct-underline {
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 90%;
  height: 3px;
  background: linear-gradient(90deg, ${BRAND.green800}, ${BRAND.green600}, ${BRAND.green400});
  border-radius: 0 0 14px 14px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-field-wrap.focused .ct-underline { transform: scaleX(1); }
.ct-status {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
}
.ct-field-err {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
  font-weight: 500;
  overflow: hidden;
}
.ct-char {
  position: absolute;
  bottom: 12px;
  left: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ct-char-track {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}
.ct-char-fill {
  height: 100%;
  border-radius: 2px;
}
.ct-char-num {
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

/* Server error */
.ct-server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #dc2626;
  font-weight: 500;
}

/* Navigation */
.ct-form-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  gap: 14px;
}
.ct-form-nav-left, .ct-form-nav-right { display: flex; gap: 12px; }
.ct-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-nav-btn--back {
  background: ${BRAND.green50};
  color: ${BRAND.green800};
  border: 2px solid rgba(6, 78, 59, 0.15);
}
.ct-nav-btn--back:hover {
  background: ${BRAND.green100};
}
.ct-nav-btn--next {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
  box-shadow: 0 6px 22px rgba(6, 78, 59, 0.3);
}
.ct-nav-btn--next:hover {
  box-shadow: 0 10px 32px rgba(6, 78, 59, 0.38);
}
.ct-nav-btn--submit {
  background: linear-gradient(135deg, ${BRAND.green900}, ${BRAND.green700});
  color: #fff;
  box-shadow: 0 6px 24px rgba(6, 78, 59, 0.32);
  width: 100%;
  justify-content: center;
  padding: 18px 32px;
  font-size: 15.5px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}
.ct-nav-btn--submit:hover:not(:disabled) {
  box-shadow: 0 14px 44px rgba(6, 78, 59, 0.4);
}
.ct-nav-btn--submit:disabled { opacity: 0.8; cursor: wait; }
.ct-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 0 2px 2px 0;
  transition: width 0.15s;
}
.ct-privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 18px;
}

/* ═══════════════ SUCCESS ═══════════════ */
.ct-success { text-align: center; padding: 48px 16px; }
.ct-success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green600});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  box-shadow: 0 14px 44px rgba(6, 78, 59, 0.35);
}
.ct-success-title {
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14px;
}
.ct-success-text {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  max-width: 380px;
  margin: 0 auto 28px;
}
.ct-success-email {
  display: inline-block;
  background: ${BRAND.green50};
  padding: 16px 28px;
  border-radius: 14px;
  margin-bottom: 30px;
  border: 1px solid rgba(6, 78, 59, 0.1);
}
.ct-success-email small {
  display: block;
  font-size: 12.5px;
  color: #64748b;
  margin-bottom: 4px;
}
.ct-success-email strong {
  font-size: 16px;
  color: ${BRAND.green800};
}
.ct-success-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ═══════════════ FAQ ═══════════════ */
.ct-faq-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ct-faq-item {
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(6, 78, 59, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.ct-faq-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, ${BRAND.green800}, ${BRAND.green600}, ${BRAND.green400});
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 4px 0 0 4px;
}
.ct-faq-item:hover {
  box-shadow: 0 6px 24px rgba(6, 78, 59, 0.07);
  border-color: rgba(6, 78, 59, 0.1);
}
.ct-faq-item:hover::before,
.ct-faq-item.open::before { opacity: 1; }
.ct-faq-item.open {
  box-shadow: 0 8px 32px rgba(6, 78, 59, 0.09);
  border-color: rgba(6, 78, 59, 0.12);
}
.ct-faq-btn {
  width: 100%;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.ct-faq-num {
  font-family: 'Playfair Display', serif;
  font-size: 12.5px;
  font-weight: 700;
  color: ${BRAND.green800};
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.08), rgba(4, 120, 87, 0.05));
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}
.ct-faq-item.open .ct-faq-num {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
}
.ct-faq-q {
  flex: 1;
  font-size: 15.5px;
  font-weight: 640;
  color: #1e293b;
  line-height: 1.45;
  transition: color 0.3s;
}
.ct-faq-item:hover .ct-faq-q { color: ${BRAND.green800}; }
.ct-faq-toggle {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-faq-toggle.closed {
  background: ${BRAND.green50};
  color: ${BRAND.green800};
}
.ct-faq-toggle.opened {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
  box-shadow: 0 4px 14px rgba(6, 78, 59, 0.3);
}
.ct-faq-answer-inner {
  padding: 0 24px 22px 72px;
  font-size: 14.5px;
  color: #475569;
  line-height: 1.8;
  position: relative;
}
.ct-faq-answer-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}
.ct-faq-answer-inner p { margin: 0; padding-top: 16px; }
@media (max-width: 640px) {
  .ct-faq-answer-inner { padding-left: 24px; }
}

/* ═══════════════ QUICK CHANNELS ═══════════════ */
.ct-quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.ct-quick-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px 26px;
  background: #fff;
  border-radius: 20px;
  border: 2px solid transparent;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.ct-quick-card:hover {
  box-shadow: 0 14px 40px rgba(6, 78, 59, 0.1);
  border-color: rgba(6, 78, 59, 0.15);
}
.ct-quick-icon {
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: ${BRAND.green50};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${BRAND.green800};
  transition: all 0.3s;
}
.ct-quick-card:hover .ct-quick-icon {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
  box-shadow: 0 8px 22px rgba(6, 78, 59, 0.3);
}
.ct-quick-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 3px;
}
.ct-quick-sub {
  font-size: 12.5px;
  color: #94a3b8;
  margin-bottom: 6px;
}
.ct-quick-detail {
  font-size: 14.5px;
  font-weight: 600;
  color: ${BRAND.green800};
}

/* ═══════════════ CTA SECTION ═══════════════ */
.ct-cta-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}
.ct-cta-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  backdrop-filter: blur(4px);
}
.ct-cta-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ═══════════════ LIVE CHAT ═══════════════ */
.ct-chat-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(6, 78, 59, 0.4);
  z-index: 999;
}
.ct-chat-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid ${BRAND.green700};
  animation: ct-pulse 2s ease-out infinite;
}
@keyframes ct-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.55); opacity: 0; }
}
.ct-chat-window {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 370px;
  max-width: calc(100vw - 56px);
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 24px 68px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
.ct-chat-head {
  background: linear-gradient(135deg, ${BRAND.green900}, ${BRAND.green700});
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ct-chat-head-left { display: flex; align-items: center; gap: 12px; }
.ct-chat-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ct-chat-name { color: #fff; font-weight: 600; font-size: 14.5px; }
.ct-chat-status {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ct-chat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}
.ct-chat-head-btns { display: flex; gap: 6px; }
.ct-chat-hbtn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s;
}
.ct-chat-hbtn:hover { background: rgba(255, 255, 255, 0.22); }
.ct-chat-body {
  flex: 1;
  padding: 20px;
  background: #f8fffe;
  overflow-y: auto;
  max-height: 300px;
}
.ct-chat-bubble {
  background: #fff;
  padding: 14px 17px;
  border-radius: 16px 16px 16px 4px;
  max-width: 85%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 14px;
}
.ct-chat-bubble--admin {
  background: #dbeafe;
  margin-left: auto;
  border-radius: 16px 16px 4px 16px;
}
.ct-chat-bubble--user {
  background: #fff;
  margin-right: auto;
}
.ct-chat-bubble p {
  font-size: 13.5px;
  color: #1e293b;
  line-height: 1.55;
  margin: 0 0 5px;
}
.ct-chat-bubble p:last-child { margin-bottom: 0; }
.ct-chat-error {
  padding: 8px 12px;
  margin: 10px 18px 0;
  border-radius: 14px;
  background: rgba(248, 113, 113, 0.12);
  color: #b91c1c;
  font-size: 12.8px;
}
.ct-chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}
.ct-chat-chip {
  padding: 7px 14px;
  background: #fff;
  border: 1px solid ${BRAND.green700};
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  color: ${BRAND.green800};
  cursor: pointer;
  transition: all 0.2s;
}
.ct-chat-chip:hover {
  background: ${BRAND.green800};
  color: #fff;
  border-color: ${BRAND.green800};
}
.ct-chat-footer {
  padding: 14px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
}
.ct-chat-input {
  flex: 1;
  padding: 11px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 50px;
  font-size: 13.5px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.3s;
}
.ct-chat-input:focus { border-color: ${BRAND.green700}; }
.ct-chat-send {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(6, 78, 59, 0.25);
}

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 1024px) {
  .ct-trust-grid { grid-template-columns: repeat(2, 1fr); }
  .ct-trust-item:nth-child(2) { border-right: none; }
}
@media (max-width: 768px) {
  .ct-hero { min-height: 62vh; }
  .ct-section { padding: 68px 18px; }
  .ct-hdr { margin-bottom: 48px; }
  .ct-trust-grid { grid-template-columns: 1fr 1fr; }
  .ct-trust-item { padding: 20px 16px; }
  .ct-trust-value { font-size: 18px; }
  .ct-step-labels span { font-size: 10.5px; }
}
@media (max-width: 480px) {
  .ct-hero-btns,
  .ct-cta-btns,
  .ct-success-btns { flex-direction: column; align-items: stretch; }
  .ct-btn,
  .ct-success-btns > * { justify-content: center; width: 100%; }
  .ct-form-nav { flex-direction: column; }
  .ct-form-nav-left, .ct-form-nav-right { width: 100%; }
  .ct-nav-btn { width: 100%; justify-content: center; }
  .ct-steps { gap: 0; }
  .ct-step-line { width: 24px; }
  .ct-trust-grid { grid-template-columns: 1fr; }
  .ct-trust-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .ct-trust-item:last-child { border-bottom: none; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 7px; }
::-webkit-scrollbar-track { background: ${BRAND.green50}; }
::-webkit-scrollbar-thumb { background: ${BRAND.green800}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${BRAND.green900}; }
::selection { background: ${BRAND.green800}; color: #fff; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default Contact;