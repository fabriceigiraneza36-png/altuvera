// src/pages/Contact.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FiMail, FiPhone, FiMapPin, FiClock, FiSend,
  FiMessageSquare, FiCheckCircle, FiUser, FiAlertCircle,
  FiChevronDown, FiCalendar, FiUsers, FiGlobe, FiStar,
  FiArrowRight, FiArrowLeft, FiMessageCircle, FiHelpCircle,
  FiShield, FiHeadphones, FiX, FiExternalLink, FiAward,
  FiZap, FiLogIn, FiUserCheck,
} from "react-icons/fi";
import {
  FaFacebookF, FaInstagram, FaTwitter,
  FaYoutube, FaWhatsapp, FaTiktok,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import SEO from "../components/common/SEO";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { sendMessage } from "../utils/sendMessage";
import { sendVerificationCode, verifyCode } from "../utils/verifyEmail";
import { useChatSocket } from "../hooks/useChatSocket";
import VerificationModal from "../components/common/VerificationModal";
import { useUserAuth } from "../context/UserAuthContext";

/* ══════════════════════════════════════════════════════
   BRAND TOKENS
══════════════════════════════════════════════════════ */
const G = {
  900: "#064e3b", 800: "#065f46", 700: "#047857",
  600: "#059669", 500: "#10b981", 400: "#34d399",
  300: "#6ee7b7", 200: "#a7f3d0", 100: "#d1fae5", 50: "#ecfdf5",
  glow: "rgba(5,150,105,0.32)",
};

const EASE = {
  smooth: [0.21, 0.68, 0.35, 0.98],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
};

/* ══════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════ */
const RULES = {
  name: {
    required: true, minLength: 2,
    pattern: /^[a-zA-Z\s'\-]+$/,
    msg: {
      required: "Full name is required",
      minLength: "At least 2 characters",
      pattern: "Letters only",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    msg: { required: "Email is required", pattern: "Enter a valid email" },
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    msg: { pattern: "Enter a valid phone number" },
  },
  subject: {
    required: true, minLength: 5,
    msg: { required: "Subject is required", minLength: "At least 5 characters" },
  },
  message: {
    required: true, minLength: 20,
    msg: { required: "Message is required", minLength: "At least 20 characters" },
  },
};

const validateField = (name, value) => {
  const r = RULES[name];
  if (!r) return "";
  if (r.required && !value?.trim()) return r.msg.required;
  if (value && r.minLength && value.length < r.minLength) return r.msg.minLength;
  if (value && r.pattern && !r.pattern.test(value)) return r.msg.pattern;
  return "";
};

const STEP_FIELDS = [
  ["name", "email", "phone"],
  ["tripType", "travelDate", "travelers"],
  ["subject", "message"],
];

const INIT_FORM = {
  name: "", email: "", phone: "",
  subject: "", message: "",
  tripType: "", travelDate: "", travelers: "",
};

/* ══════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════ */
const TRUST_STATS = [
  { icon: FiUsers, value: "5,000+", label: "Happy Travelers" },
  { icon: FiStar, value: "4.9/5", label: "Average Rating" },
  { icon: FiAward, value: "12+", label: "Years Experience" },
  { icon: FiZap, value: "<2hrs", label: "Avg Response Time" },
];

const CONTACT_CARDS = [
  { icon: FiMapPin, title: "Visit Our Office", lines: ["Altuvera House, Safari Way", "Kinigi, Musanze, Rwanda"], href: "https://maps.google.com/?q=Kinigi+Musanze" },
  { icon: FiPhone, title: "Call Us", lines: ["+250 780 702 773", "+250 792 352 409"], href: "tel:+250780702773" },
  { icon: FiMail, title: "Email Us", lines: ["altuverasafari@gmail.com", "fabriceigiraneza36@gmail.com"], href: "mailto:altuverasafari@gmail.com" },
  { icon: FiClock, title: "Working Hours", lines: ["Mon – Fri: 8 AM – 6 PM EAT", "Sat: 9 AM – 2 PM EAT"] },
];

const TRIP_TYPES = [
  "🦁 Safari Adventure", "⛰️ Mountain Trekking", "🦍 Gorilla Trekking",
  "🏖️ Beach Holiday", "🎭 Cultural Tour", "📷 Photography Safari",
  "💕 Honeymoon", "👨‍👩‍👧‍👦 Family Trip",
];

const TRAVELER_OPTIONS = [
  "1 — Solo", "2 — Couple / Duo", "3–4 — Small Group",
  "5–8 — Group", "9+ — Large Group",
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
    a: "We recommend booking 3–6 months ahead, especially for peak season (June–October, December–February). This ensures the best lodge availability and gorilla permits.",
  },
  {
    q: "What is included in your safari packages?",
    a: "Packages typically include accommodation, all meals on safari, game drives with professional guides, park and conservation fees, airport transfers, and 24/7 support.",
  },
  {
    q: "Is it safe to go on safari in East Africa?",
    a: "Absolutely. East Africa has a strong tourism safety record. Our experienced guides, vetted partners, and comprehensive safety protocols ensure your wellbeing.",
  },
  {
    q: "Can you build a fully custom itinerary?",
    a: "Yes — bespoke itineraries are our specialty. Share your interests, dates, budget, and group size, and our safari designers will craft a tailor-made journey.",
  },
  {
    q: "What should I pack for an East African safari?",
    a: "Neutral-colored clothing, sun hat, sunscreen SPF 50+, binoculars, a camera with zoom lens, comfortable walking shoes, and insect repellent. We send a full packing list on booking.",
  },
];

const QUICK_CHANNELS = [
  { icon: FaWhatsapp, title: "WhatsApp", subtitle: "Chat instantly", detail: "+250 780 702 773", href: "https://wa.me/250792352409", color: "#25D366" },
  { icon: FiPhone, title: "Call Us", subtitle: "Speak with an expert", detail: "+250 780 702 773", href: "tel:+250780702773", color: G[700] },
  { icon: FiMail, title: "Email", subtitle: "Detailed inquiries", detail: "altuverasafari@gmail.com", href: "mailto:altuverasafari@gmail.com", color: "#3B82F6" },
];

const STEP_CONFIG = [
  { label: "Personal Info", icon: FiUser, description: "Tell us about yourself" },
  { label: "Trip Details", icon: FiGlobe, description: "Describe your dream trip" },
  { label: "Your Message", icon: FiMessageSquare, description: "Share your thoughts" },
];

/* ══════════════════════════════════════════════════════
   AUTO-FILL BANNER COMPONENT
══════════════════════════════════════════════════════ */
const AutoFillBanner = ({ user, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.97 }}
    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      marginBottom: 20,
      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
      border: "1px solid #a7f3d0",
      borderRadius: 14,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Glow accent */}
    <div style={{
      position: "absolute", top: 0, left: 0, bottom: 0, width: 4,
      background: "linear-gradient(180deg, #065f46, #10b981)",
      borderRadius: "14px 0 0 14px",
    }} />

    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: "linear-gradient(135deg, #065f46, #047857)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 4px 12px rgba(6,78,59,0.25)",
    }}>
      {user?.avatar || user?.avatarUrl ? (
        <img
          src={user.avatar || user.avatarUrl}
          alt={user.fullName || user.name}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <FiUserCheck size={17} color="#fff" />
      )}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#064e3b", lineHeight: 1.3 }}>
        Welcome back, {user?.fullName || user?.name || "there"}! 👋
      </div>
      <div style={{ fontSize: 11.5, color: "#065f46", opacity: 0.8, marginTop: 2 }}>
        Your details have been auto-filled — just review and send.
      </div>
    </div>

    <button
      onClick={onDismiss}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#065f46", opacity: 0.6, padding: 4,
        display: "flex", alignItems: "center",
        transition: "opacity 0.2s",
        flexShrink: 0,
      }}
      onMouseOver={e => (e.currentTarget.style.opacity = "1")}
      onMouseOut={e => (e.currentTarget.style.opacity = "0.6")}
      aria-label="Dismiss"
    >
      <FiX size={15} />
    </button>
  </motion.div>
);

/* ══════════════════════════════════════════════════════
   FIELD LOCK INDICATOR (shows when auto-filled)
══════════════════════════════════════════════════════ */
const FieldLockBadge = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.7 }}
    transition={{ duration: 0.25 }}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      padding: "2px 7px",
      borderRadius: 999,
      backgroundColor: "#d1fae5",
      border: "1px solid #a7f3d0",
      color: "#065f46",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.3px",
      marginLeft: 6,
      verticalAlign: "middle",
    }}
  >
    <FiUserCheck size={9} /> Auto-filled
  </motion.span>
);

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════ */
const ScrollReveal = ({
  children, delay = 0, direction = "up",
  distance = 36, style = {}, className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = {
    up: { y: distance }, down: { y: -distance },
    left: { x: -distance }, right: { x: distance },
    scale: { scale: 0.92 },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE.smooth }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   FIELD — INPUT
══════════════════════════════════════════════════════ */
const FieldInput = React.memo(({
  name, label, icon: Icon, type = "text", placeholder,
  required, value, onChange, onBlur, error, touched, full,
  autoFilled = false,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;

  return (
    <div className={`ct-field${full ? " ct-field--full" : ""}`}>
      <label
        className="ct-label"
        style={{ color: hasErr ? "#ef4444" : focused ? G[700] : undefined }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.7 }} />}
        {label}
        {required && <span className="ct-req">*</span>}
        <AnimatePresence>
          {autoFilled && <FieldLockBadge key="badge" />}
        </AnimatePresence>
      </label>
      <div className={`ct-wrap-f${focused ? " focused" : ""}${autoFilled ? " autofilled" : ""}`}>
        {type === "email" ? (
          <EmailAutocompleteInput
            name={name}
            value={value}
            onValueChange={v => onChange?.({ target: { name, value: v } })}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={e => { setFocused(false); onBlur?.(e); }}
            className={`ct-input${hasErr ? " err" : isOk ? " ok" : ""}${autoFilled ? " autofill-glow" : ""}`}
            aria-invalid={!!hasErr}
            aria-describedby={hasErr ? `${name}-err` : undefined}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={e => { setFocused(false); onBlur?.(e); }}
            className={`ct-input${hasErr ? " err" : isOk ? " ok" : ""}${autoFilled ? " autofill-glow" : ""}`}
            aria-invalid={!!hasErr}
            aria-describedby={hasErr ? `${name}-err` : undefined}
          />
        )}
        <div className="ct-uline" />
        <AnimatePresence mode="wait">
          {hasErr && (
            <motion.span className="ct-status" key="err"
              initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }} transition={{ duration: 0.25, ease: EASE.bounce }}
            >
              <FiAlertCircle size={17} color="#ef4444" />
            </motion.span>
          )}
          {isOk && !autoFilled && (
            <motion.span className="ct-status" key="ok"
              initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }} transition={{ duration: 0.25, ease: EASE.bounce }}
            >
              <FiCheckCircle size={17} color={G[700]} />
            </motion.span>
          )}
          {autoFilled && (
            <motion.span className="ct-status" key="autofill"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              exit={{ scale: 0 }} transition={{ duration: 0.25 }}
            >
              <FiUserCheck size={17} color={G[600]} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.div
            id={`${name}-err`} className="ct-field-err" role="alert"
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

/* ══════════════════════════════════════════════════════
   FIELD — SELECT
══════════════════════════════════════════════════════ */
const FieldSelect = React.memo(({
  name, label, icon: Icon, placeholder, options,
  value, onChange, onBlur, full,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`ct-field${full ? " ct-field--full" : ""}`}>
      <label className="ct-label" style={{ color: focused ? G[700] : undefined }}>
        {Icon && <Icon size={13} style={{ opacity: 0.7 }} />} {label}
      </label>
      <div className={`ct-wrap-f${focused ? " focused" : ""}`}>
        <select
          name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={e => { setFocused(false); onBlur?.(e); }}
          className="ct-select"
        >
          <option value="">{placeholder}</option>
          {options.map((o, i) => (
            <option key={i} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
        <div className="ct-uline" />
        <span className="ct-sel-arr" style={{ color: focused ? G[700] : "#94a3b8" }}>
          <FiChevronDown size={18} />
        </span>
      </div>
    </div>
  );
});
FieldSelect.displayName = "FieldSelect";

/* ══════════════════════════════════════════════════════
   FIELD — TEXTAREA
══════════════════════════════════════════════════════ */
const FieldTextarea = React.memo(({
  name, label, placeholder, required, maxLength = 2000,
  value, onChange, onBlur, error, touched, full,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;
  const chars = value?.length || 0;
  const pct = (chars / maxLength) * 100;
  const pctColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : G[700];

  return (
    <div className={`ct-field${full ? " ct-field--full" : ""}`}>
      <label
        className="ct-label"
        style={{ color: hasErr ? "#ef4444" : focused ? G[700] : undefined }}
      >
        <FiMessageSquare size={13} style={{ opacity: 0.7 }} /> {label}
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-wrap-f${focused ? " focused" : ""}`}>
        <textarea
          name={name} value={value} placeholder={placeholder}
          maxLength={maxLength} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={e => { setFocused(false); onBlur?.(e); }}
          className={`ct-textarea${hasErr ? " err" : isOk ? " ok" : ""}`}
          aria-invalid={!!hasErr}
          aria-describedby={hasErr ? `${name}-err` : undefined}
        />
        <div className="ct-uline" />
        <div className="ct-char">
          <div className="ct-char-track">
            <motion.div
              className="ct-char-fill"
              animate={{ width: `${pct}%`, backgroundColor: pctColor }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="ct-char-num" style={{ color: pct > 90 ? "#ef4444" : "#94a3b8" }}>
            {chars}/{maxLength}
          </span>
        </div>
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.div
            id={`${name}-err`} className="ct-field-err" role="alert"
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

/* ══════════════════════════════════════════════════════
   STEP VARIANTS
══════════════════════════════════════════════════════ */
const stepVariants = {
  enter: dir => ({ opacity: 0, x: dir > 0 ? 56 : -56, scale: 0.97 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease: EASE.snappy } },
  exit: dir => ({ opacity: 0, x: dir > 0 ? -56 : 56, scale: 0.97, transition: { duration: 0.3, ease: EASE.snappy } }),
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const Contact = () => {
  /* ── Auth ── */
  const { user, isAuthenticated } = useUserAuth();

  /* ── Track which fields were auto-filled ── */
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [showAutoFillBanner, setShowAutoFillBanner] = useState(false);
  const autoFillApplied = useRef(false);

  /* ── Form state ── */
  const [form, setForm] = useState(INIT_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  /* ── UI state ── */
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMin, setChatMin] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");

  /* ── Verification state ── */
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [verId, setVerId] = useState(null);
  const [verError, setVerError] = useState("");
  const [verLoading, setVerLoading] = useState(false);

  /* ── Refs ── */
  const heroRef = useRef(null);
  const chatRef = useRef(null);
  const formRef = useRef(null);

  /* ── Chat socket ── */
  const {
    connected: chatConnected,
    connect: connectChat,
    registerChat,
    sendMessage: sendChatMessage,
    messages: chatMessages,
    error: chatSocketError,
  } = useChatSocket();

  /* ── Parallax ── */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  /* ══════════════════════════════════════════════════
     AUTO-FILL LOGIC
     Runs once when user becomes available.
     Maps backend sanitizeUser fields to form fields.
  ══════════════════════════════════════════════════ */
  useEffect(() => {
    if (!user || !isAuthenticated || autoFillApplied.current) return;

    // Extract from sanitizeUser output (backend returns both camelCase + snake_case)
    const autoName = user.fullName || user.full_name || user.name || "";
    const autoEmail = user.email || "";
    const autoPhone = user.phone || "";

    // Only fill if we have at least one useful field
    if (!autoName && !autoEmail && !autoPhone) return;

    autoFillApplied.current = true;

    const newAutoFilled = new Set();
    const updates = {};

    if (autoName && !form.name) { updates.name = autoName; newAutoFilled.add("name"); }
    if (autoEmail && !form.email) { updates.email = autoEmail; newAutoFilled.add("email"); }
    if (autoPhone && !form.phone) { updates.phone = autoPhone; newAutoFilled.add("phone"); }

    if (Object.keys(updates).length === 0) return;

    setForm(prev => ({ ...prev, ...updates }));
    setAutoFilledFields(newAutoFilled);
    setShowAutoFillBanner(true);

    // Mark auto-filled fields as touched + valid immediately
    const newTouched = {};
    const newErrors = {};
    Object.keys(updates).forEach(field => {
      newTouched[field] = true;
      newErrors[field] = validateField(field, updates[field]);
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [user, isAuthenticated]);

  /* ── When user manually edits an auto-filled field, remove badge ── */
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Remove auto-fill badge if user edits the field
    if (autoFilledFields.has(name)) {
      setAutoFilledFields(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }

    setErrors(prev => prev[name]
      ? { ...prev, [name]: validateField(name, value) }
      : prev
    );
  }, [autoFilledFields]);

  /* ── Chat lifecycle ── */
  useEffect(() => {
    if (chatOpen && !chatConnected) connectChat();
  }, [chatOpen, chatConnected, connectChat]);

  useEffect(() => {
    if (!chatOpen || !chatConnected) return;
    registerChat({
      name: form.name || user?.fullName || user?.name || "Guest",
      email: form.email || user?.email || "",
    }).catch(() => { });
  }, [chatOpen, chatConnected, registerChat, form.name, form.email, user]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages, chatOpen]);

  /* ── Field handlers ── */
  const handleBlur = useCallback(e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const validateStep = useCallback(idx => {
    const newErr = {}, newTouched = {};
    STEP_FIELDS[idx].forEach(field => {
      const e = validateField(field, form[field]);
      if (e) newErr[field] = e;
      newTouched[field] = true;
    });
    setErrors(prev => ({ ...prev, ...newErr }));
    setTouched(prev => ({ ...prev, ...newTouched }));
    return !Object.keys(newErr).length;
  }, [form]);

  const goStep = useCallback(target => {
    if (target > step && !validateStep(step)) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step, validateStep]);

  const nextStep = useCallback(() => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, 2));
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setSubmitting(true);
    setProgress(0);
    let pv = 0;
    const interval = setInterval(() => {
      pv = Math.min(pv + 8, 92);
      setProgress(pv);
    }, 100);
    try {
      const { verificationId: id } = await sendVerificationCode({
        email: form.email,
        purpose: "contact",
      });
      setVerId(id);
      setVerError("");
      setVerModalOpen(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || "Failed to send verification" }));
    } finally {
      clearInterval(interval);
      setProgress(100);
      setSubmitting(false);
    }
  }, [form, validateStep]);

  const handleVerifyCode = useCallback(async code => {
    if (!verId) return;
    setVerLoading(true);
    setVerError("");
    try {
      await verifyCode({ email: form.email, verificationId: verId, code });
      const result = await sendMessage({ type: "contact", data: { ...form } });
      if (!result.error) {
        setSubmitted(true);
        setVerModalOpen(false);
        setForm(INIT_FORM);
        setTouched({});
        setErrors({});
        setAutoFilledFields(new Set());
        autoFillApplied.current = false;
      } else {
        setVerError(result.error);
      }
    } catch (err) {
      setVerError(err.message || "Invalid code");
    } finally {
      setVerLoading(false);
    }
  }, [form, verId]);

  const closeVerModal = useCallback(() => {
    setVerModalOpen(false);
    setVerError("");
    setVerId(null);
    setProgress(0);
  }, []);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setStep(0);
    setDirection(1);
    setProgress(0);
    setForm(INIT_FORM);
    setTouched({});
    setErrors({});
    setAutoFilledFields(new Set());
    setShowAutoFillBanner(false);
    autoFillApplied.current = false;
  }, []);

  const handleChatSend = useCallback(async () => {
    const body = chatInput.trim();
    if (!body) return;
    setChatError("");
    setChatSending(true);
    try {
      await registerChat({
        name: form.name || user?.fullName || user?.name || "Guest",
        email: form.email || user?.email || "",
      });
      await sendChatMessage({
        body,
        name: form.name || user?.fullName || user?.name || "Guest",
        email: form.email || user?.email || "",
        metadata: { source: "frontend-chat" },
      });
      setChatInput("");
    } catch (err) {
      setChatError(err?.message || "Unable to send message");
    } finally {
      setChatSending(false);
    }
  }, [chatInput, form.name, form.email, user, registerChat, sendChatMessage]);

  const completion = useMemo(() => {
    const filled = Object.values(form).filter(v => String(v).trim()).length;
    return Math.round((filled / Object.keys(form).length) * 100);
  }, [form]);

  /* ════════════════════════════════════
     RENDER
  ════════════════════════════════════ */
  return (
    <div className="ct">
      <SEO
        title="Contact Us"
        description="Get in touch with Altuvera for personalized safari planning, booking assistance, and expert travel advice."
        keywords={["contact Altuvera", "safari booking", "East Africa travel"]}
        url="/contact"
      />
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <section className="ct-hero" ref={heroRef}>
        <motion.div
          className="ct-hero-bg"
          style={{
            backgroundImage: `url(https://i.pinimg.com/736x/bb/ca/d1/bbcad1c07136f38bfc47257f8b38cf2a.jpg)`,
            y: heroY,
          }}
          initial={{ scale: 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: "easeOut" }}
        />
        <div className="ct-hero-overlay" />

        <motion.div className="ct-hero-inner" style={{ opacity: heroOpacity }}>
          <motion.div
            className="ct-hero-badge"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE.bounce }}
          >
            <HiSparkles size={15} color={G[300]} />
            Your Safari Adventure Starts Here
          </motion.div>

          <motion.h1
            className="ct-hero-h1"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.75 }}
          >
            Let's Plan Your<br /><em>Dream Safari</em>
          </motion.h1>

          <motion.p
            className="ct-hero-p"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56, duration: 0.7 }}
          >
            Connect with our expert team and let us craft an unforgettable
            African adventure tailored just for you.
          </motion.p>

          <motion.div
            className="ct-hero-btns"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.65 }}
          >
            <a href="#contact-form" className="ct-btn ct-btn--white">
              <FiSend size={15} /> Send Message
            </a>
            <a href="tel:+250780702773" className="ct-btn ct-btn--ghost">
              <FiPhone size={15} /> Call Us Now
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="ct-scroll"
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

      {/* ══ TRUST BAR ══ */}
      <div className="ct-trust-bar">
        <div className="ct-wrap">
          <div className="ct-trust-grid">
            {TRUST_STATS.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction="up" distance={20}>
                <div className="ct-trust-item">
                  <div className="ct-trust-icon"><s.icon size={20} /></div>
                  <div>
                    <div className="ct-trust-val">{s.value}</div>
                    <div className="ct-trust-lbl">{s.label}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN FORM SECTION ══ */}
      <section className="ct-section ct-section--soft" id="contact-form">
        <div className="ct-wrap">
          <ScrollReveal>
            <div className="ct-hdr">
              <div className="ct-badge-pill">
                <FiMessageSquare size={13} /> Get In Touch
              </div>
              <h2 className="ct-h2">We'd Love to <em>Hear From You</em></h2>
              <p className="ct-sub">
                Have questions about your dream safari? Our Africa travel experts are here to help.
              </p>
            </div>
          </ScrollReveal>

          <div className="ct-two-col">
            {/* ── Contact Info ── */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="ct-info-col">
                {/* Auth greeting card */}
                {isAuthenticated && user && (
                  <motion.div
                    className="ct-user-card"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="ct-user-card-inner">
                      <div className="ct-user-avatar">
                        {user.avatar || user.avatarUrl ? (
                          <img
                            src={user.avatar || user.avatarUrl}
                            alt={user.fullName || user.name}
                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <FiUser size={22} color="#fff" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ct-user-name">
                          {user.fullName || user.name || "Traveler"}
                        </div>
                        <div className="ct-user-email">{user.email}</div>
                        {user.phone && (
                          <div className="ct-user-phone">{user.phone}</div>
                        )}
                      </div>
                      <div className="ct-user-badge">
                        <FiUserCheck size={13} /> Signed In
                      </div>
                    </div>
                  </motion.div>
                )}

                <h3 className="ct-info-h3">Contact Information</h3>
                <p className="ct-info-p">
                  Reach out through any channel. We respond within 2 hours during business hours.
                </p>

                {CONTACT_CARDS.map((card, i) => (
                  <ScrollReveal key={i} delay={0.15 + i * 0.06}>
                    <a
                      href={card.href || "#"}
                      className="ct-contact-card"
                      onClick={!card.href ? e => e.preventDefault() : undefined}
                    >
                      <div className="ct-contact-icon"><card.icon size={20} /></div>
                      <div>
                        <div className="ct-contact-title">{card.title}</div>
                        {card.lines.map((l, j) => (
                          <div key={j} className="ct-contact-line">{l}</div>
                        ))}
                      </div>
                      {card.href && <FiExternalLink size={13} className="ct-contact-ext" />}
                    </a>
                  </ScrollReveal>
                ))}

                <ScrollReveal delay={0.46}>
                  <div className="ct-socials-box">
                    <div className="ct-socials-title">Follow Our Adventures</div>
                    <div className="ct-socials-row">
                      {SOCIALS.map((s, i) => (
                        <motion.a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.label}
                          className="ct-social"
                          whileHover={{ scale: 1.12, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <s.icon />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* ── Form ── */}
            <ScrollReveal direction="right" delay={0.15}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="ct-card"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: EASE.snappy }}
                  >
                    <div className="ct-success">
                      <motion.div
                        className="ct-success-circle"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: EASE.bounce }}
                      >
                        <FiCheckCircle size={52} color="#fff" />
                      </motion.div>
                      <motion.h3 className="ct-success-h3"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        Message Sent Successfully!
                      </motion.h3>
                      <motion.p className="ct-success-p"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                        Our safari experts will respond within 24 hours.
                      </motion.p>
                      <motion.div className="ct-success-email"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                        <small>Confirmation sent to</small>
                        <strong>{form.email}</strong>
                      </motion.div>
                      <motion.div className="ct-success-btns"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                        <button className="ct-btn ct-btn--green" onClick={resetForm}>
                          <FiSend size={14} /> Send Another
                        </button>
                        <a href="/" className="ct-btn ct-btn--outline">
                          <FiArrowLeft size={14} /> Back to Home
                        </a>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className="ct-card"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    autoComplete="off"
                    noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    {/* Auto-fill banner */}
                    <AnimatePresence>
                      {showAutoFillBanner && isAuthenticated && user && (
                        <AutoFillBanner
                          key="banner"
                          user={user}
                          onDismiss={() => setShowAutoFillBanner(false)}
                        />
                      )}
                    </AnimatePresence>

                    {/* Completion bar */}
                    <div className="ct-prog-row">
                      <span className="ct-prog-label">Form Completion</span>
                      <span className="ct-prog-pct">{completion}%</span>
                    </div>
                    <div className="ct-prog-track">
                      <motion.div
                        className="ct-prog-fill"
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Step dots */}
                    <div className="ct-steps">
                      {STEP_CONFIG.map((cfg, i) => (
                        <React.Fragment key={i}>
                          <motion.button
                            type="button"
                            className={`ct-step-dot${step === i ? " active" : step > i ? " done" : ""}`}
                            onClick={() => goStep(i)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Step ${i + 1}: ${cfg.label}`}
                          >
                            {step > i ? <FiCheckCircle size={18} /> : <cfg.icon size={18} />}
                          </motion.button>
                          {i < STEP_CONFIG.length - 1 && (
                            <div className={`ct-step-line${step > i ? " filled" : ""}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="ct-step-lbls">
                      {STEP_CONFIG.map((cfg, i) => (
                        <span key={i} className={step === i ? "active" : step > i ? "done" : ""}>
                          {cfg.label}
                        </span>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`h-${step}`}
                        className="ct-step-hd"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.28 }}
                      >
                        <h4>{STEP_CONFIG[step].label}</h4>
                        <p>{STEP_CONFIG[step].description}</p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Form body */}
                    <div className="ct-body">
                      <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                          key={step}
                          className="ct-step-wrap"
                          custom={direction}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          {step === 0 && (
                            <div className="ct-row">
                              <FieldInput
                                name="name" label="Full Name" icon={FiUser}
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.name} touched={touched.name}
                                required
                                autoFilled={autoFilledFields.has("name")}
                              />
                              <FieldInput
                                name="email" label="Email Address" icon={FiMail}
                                type="email" placeholder="john@email.com"
                                value={form.email}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.email} touched={touched.email}
                                required
                                autoFilled={autoFilledFields.has("email")}
                              />
                              <FieldInput
                                name="phone" label="Phone Number" icon={FiPhone}
                                placeholder="+1 555 123 4567"
                                value={form.phone}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.phone} touched={touched.phone}
                                full
                                autoFilled={autoFilledFields.has("phone")}
                              />
                            </div>
                          )}
                          {step === 1 && (
                            <div className="ct-row">
                              <FieldSelect
                                name="tripType" label="Trip Type" icon={FiGlobe}
                                placeholder="Select your adventure"
                                options={TRIP_TYPES} value={form.tripType}
                                onChange={handleChange} onBlur={handleBlur}
                                full
                              />
                              <FieldInput
                                name="travelDate" label="Travel Date" icon={FiCalendar}
                                type="date" value={form.travelDate}
                                onChange={handleChange} onBlur={handleBlur}
                              />
                              <FieldSelect
                                name="travelers" label="Number of Travelers" icon={FiUsers}
                                placeholder="How many travelers?"
                                options={TRAVELER_OPTIONS} value={form.travelers}
                                onChange={handleChange} onBlur={handleBlur}
                              />
                            </div>
                          )}
                          {step === 2 && (
                            <>
                              <FieldInput
                                name="subject" label="Subject" icon={FiMessageCircle}
                                placeholder="What is your inquiry about?"
                                value={form.subject}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.subject} touched={touched.subject}
                                required full
                              />
                              <FieldTextarea
                                name="message" label="Your Message"
                                placeholder="Tell us about your dream safari..."
                                value={form.message}
                                onChange={handleChange} onBlur={handleBlur}
                                error={errors.message} touched={touched.message}
                                required full
                              />
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Server error */}
                    <AnimatePresence>
                      {errors.submit && (
                        <motion.div className="ct-srv-err" role="alert"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FiAlertCircle size={15} /> {errors.submit}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="ct-nav">
                      <div>
                        {step > 0 && (
                          <motion.button
                            type="button" className="ct-nav-back"
                            onClick={prevStep} disabled={submitting}
                            whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }}
                          >
                            <FiArrowLeft size={15} /> Back
                          </motion.button>
                        )}
                      </div>
                      <div>
                        {step < 2 ? (
                          <motion.button
                            type="button" className="ct-nav-next"
                            onClick={nextStep} disabled={submitting}
                            whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                          >
                            Continue <FiArrowRight size={15} />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="submit" className="ct-nav-submit"
                            disabled={submitting}
                            whileHover={!submitting ? { y: -2 } : {}}
                            whileTap={!submitting ? { scale: 0.98 } : {}}
                          >
                            {submitting ? (
                              <>
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                                  style={{ display: "inline-flex" }}
                                >⏳</motion.span>
                                Sending…
                                <span className="ct-progress-strip" style={{ width: `${progress}%` }} />
                              </>
                            ) : (
                              <><RiSendPlaneFill size={16} /> Send Message</>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <div className="ct-privacy-note">
                      <FiShield size={12} />
                      Your information is encrypted and never shared with third parties.
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="ct-section ct-section--white">
        <div className="ct-wrap ct-wrap--sm">
          <ScrollReveal>
            <div className="ct-hdr">
              <div className="ct-badge-pill"><FiHelpCircle size={13} /> FAQ</div>
              <h2 className="ct-h2">Got <em>Questions</em>?</h2>
              <p className="ct-sub">Find quick answers about our safari experiences and booking process.</p>
            </div>
          </ScrollReveal>
          <div className="ct-faq-list">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <ScrollReveal key={i} delay={i * 0.055}>
                  <div className={`ct-faq${open ? " open" : ""}`}>
                    <button
                      className="ct-faq-btn" type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                    >
                      <span className="ct-faq-num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ct-faq-q">{faq.q}</span>
                      <motion.span
                        className={`ct-faq-chevron${open ? " open" : ""}`}
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.32 }}
                      >
                        <FiChevronDown size={17} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.38, ease: EASE.snappy }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="ct-faq-body"><p>{faq.a}</p></div>
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

      {/* ══ QUICK CHANNELS ══ */}
      <section className="ct-section ct-section--soft">
        <div className="ct-wrap ct-wrap--md">
          <ScrollReveal>
            <div className="ct-hdr">
              <h2 className="ct-h2">Prefer a <em>Direct Channel</em>?</h2>
              <p className="ct-sub">Choose the communication method that works best for you.</p>
            </div>
          </ScrollReveal>
          <div className="ct-quick-grid">
            {QUICK_CHANNELS.map((ch, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.a
                  href={ch.href}
                  className="ct-quick-card"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="ct-quick-icon" style={{ "--ch": ch.color }}>
                    <ch.icon size={22} />
                  </div>
                  <div>
                    <div className="ct-quick-title">{ch.title}</div>
                    <div className="ct-quick-sub">{ch.subtitle}</div>
                    <div className="ct-quick-detail">{ch.detail}</div>
                  </div>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="ct-section ct-section--dark">
        <div className="ct-cta-pat" />
        <ScrollReveal>
          <div className="ct-wrap" style={{ textAlign: "center", maxWidth: 700 }}>
            <motion.div
              className="ct-cta-icon"
              animate={{
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 0 0 rgba(255,255,255,0)",
                  "0 0 0 20px rgba(255,255,255,.05)",
                  "0 0 0 0 rgba(255,255,255,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FiHeadphones size={30} color="#fff" />
            </motion.div>
            <h2 className="ct-h2 ct-h2--white">Ready to Start Your <em>Adventure</em>?</h2>
            <p className="ct-sub ct-sub--light" style={{ marginBottom: 40 }}>
              Let's discuss your dream African safari. No obligations, just inspiration and expert guidance.
            </p>
            <div className="ct-hero-btns">
              <motion.a href="#contact-form" className="ct-btn ct-btn--white"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <HiSparkles size={16} /> Start Planning
              </motion.a>
              <motion.a href="/services" className="ct-btn ct-btn--ghost"
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                Our Services <FiArrowRight size={15} />
              </motion.a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ══ CHAT FAB ══ */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            className="ct-chat-fab"
            onClick={() => setChatOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280 }}
            aria-label="Open chat"
          >
            <FiMessageCircle size={24} color="#fff" />
            <span className="ct-fab-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ══ CHAT WINDOW ══ */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="ct-chat-win"
            initial={{ opacity: 0, y: 80, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.86 }}
            transition={{ duration: 0.38, ease: EASE.snappy }}
          >
            <div className="ct-chat-head">
              <div className="ct-chat-head-l">
                <div className="ct-chat-avatar"><BiSupport size={19} color="#fff" /></div>
                <div>
                  <div className="ct-chat-name">Safari Support</div>
                  <div className="ct-chat-status">
                    <span className="ct-chat-dot" /> Online now
                  </div>
                </div>
              </div>
              <div className="ct-chat-head-r">
                <button className="ct-chat-hbtn" onClick={() => setChatMin(p => !p)} aria-label="Minimize">
                  <motion.div animate={{ rotate: chatMin ? 180 : 0 }} transition={{ duration: 0.28 }}>
                    <FiChevronDown size={14} />
                  </motion.div>
                </button>
                <button className="ct-chat-hbtn" onClick={() => setChatOpen(false)} aria-label="Close">
                  <FiX size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!chatMin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ct-chat-body" ref={chatRef}>
                    {chatMessages.length === 0 ? (
                      <motion.div className="ct-bubble"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        {isAuthenticated && user ? (
                          <>
                            <p>👋 Welcome back, {user.fullName || user.name || "Traveler"}!</p>
                            <p>How can we help plan your next safari adventure?</p>
                          </>
                        ) : (
                          <>
                            <p>👋 Hello! Welcome to Altuvera Safaris!</p>
                            <p>How can we help plan your adventure?</p>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <motion.div
                          key={msg.id || idx}
                          className={`ct-bubble${msg.senderType === "admin" ? " ct-bubble--admin" : " ct-bubble--user"}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 * idx }}
                        >
                          <span className="ct-bubble-who">
                            {msg.senderType === "admin" ? "Support" : msg.senderName || "You"}
                          </span>
                          <p>{msg.body}</p>
                        </motion.div>
                      ))
                    )}

                    <div className="ct-chips">
                      {["Safari packages", "Best time to visit", "Group bookings", "Custom itinerary"].map((t, i) => (
                        <motion.button
                          key={i} className="ct-chip"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.28 + i * 0.07 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setChatInput(t)}
                        >
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="ct-chat-foot">
                    <input
                      className="ct-chat-in"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                      placeholder="Type your message…"
                      aria-label="Chat message"
                    />
                    <motion.button
                      type="button"
                      className="ct-chat-send"
                      disabled={chatSending}
                      onClick={handleChatSend}
                      whileHover={{ scale: chatSending ? 1 : 1.08 }}
                      whileTap={{ scale: chatSending ? 1 : 0.92 }}
                      aria-label="Send"
                    >
                      <RiSendPlaneFill size={15} color="#fff" />
                    </motion.button>
                  </div>

                  {(chatSocketError || chatError) && (
                    <div className="ct-chat-err">{chatSocketError || chatError}</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ VERIFICATION MODAL ══ */}
      <VerificationModal
        open={verModalOpen}
        email={form.email}
        loading={verLoading}
        error={verError}
        onClose={closeVerModal}
        onSubmit={handleVerifyCode}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{-webkit-font-smoothing:antialiased}
::selection{background:#065f46;color:#fff}
::-webkit-scrollbar{width:7px}
::-webkit-scrollbar-track{background:#f0fdf4}
::-webkit-scrollbar-thumb{background:#065f46;border-radius:4px}

.ct{font-family:'Inter',system-ui,sans-serif;color:#1e293b;background:#fff}

/* ── HERO ── */
.ct-hero{position:relative;min-height:78vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ct-hero-bg{position:absolute;inset:-10%;background-size:cover;background-position:center;will-change:transform;filter:brightness(.82)}
.ct-hero-overlay{position:absolute;inset:0;background:linear-gradient(170deg,rgba(6,78,59,.32) 0%,rgba(4,120,87,.7) 40%,rgba(6,95,70,.78) 70%,rgba(6,78,59,.85) 100%)}
.ct-hero-inner{position:relative;z-index:2;text-align:center;padding:0 clamp(16px,4vw,24px);max-width:840px}
.ct-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 24px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);border-radius:999px;font-size:13px;font-weight:600;color:#a7f3d0;margin-bottom:26px;letter-spacing:.3px}
.ct-hero-h1{font-family:'Playfair Display',serif;font-size:clamp(34px,6.5vw,68px);font-weight:800;color:#fff;line-height:1.06;margin-bottom:22px;letter-spacing:-.4px}
.ct-hero-h1 em{font-style:normal;background:linear-gradient(90deg,#6ee7b7,#a7f3d0,#d1fae5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-hero-p{font-size:clamp(15px,1.8vw,19px);color:rgba(255,255,255,.85);line-height:1.75;max-width:560px;margin:0 auto 38px}
.ct-hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.ct-scroll{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:2}
.ct-scroll-pill{width:28px;height:46px;border:2px solid rgba(255,255,255,.2);border-radius:14px;display:flex;justify-content:center;padding-top:10px}
.ct-scroll-dot{width:4px;height:10px;background:#fff;border-radius:2px}

/* ── BUTTONS ── */
.ct-btn{display:inline-flex;align-items:center;gap:9px;padding:clamp(13px,1.6vw,16px) clamp(22px,3vw,34px);border-radius:14px;font-family:'Inter',sans-serif;font-size:clamp(14px,1.3vw,15px);font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all .35s cubic-bezier(.4,0,.2,1)}
.ct-btn--white{background:#fff;color:#065f46;box-shadow:0 8px 28px rgba(0,0,0,.18)}
.ct-btn--white:hover{transform:translateY(-3px);box-shadow:0 16px 44px rgba(0,0,0,.22)}
.ct-btn--ghost{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);color:#fff;border:2px solid rgba(255,255,255,.18)}
.ct-btn--ghost:hover{background:rgba(255,255,255,.18);transform:translateY(-3px)}
.ct-btn--green{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 8px 24px rgba(6,78,59,.32)}
.ct-btn--green:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(6,78,59,.42)}
.ct-btn--outline{background:#fff;color:#065f46;border:2px solid #059669}
.ct-btn--outline:hover{background:#ecfdf5;transform:translateY(-2px)}

/* ── TRUST BAR ── */
.ct-trust-bar{background:#064e3b;padding:0 clamp(16px,4vw,24px);box-shadow:0 4px 20px rgba(6,78,59,.28);position:relative;z-index:5}
.ct-trust-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1340px;margin:0 auto}
.ct-trust-item{display:flex;align-items:center;gap:14px;padding:clamp(18px,2.5vw,28px) clamp(12px,2vw,20px);border-right:1px solid rgba(255,255,255,.07);transition:background .25s}
.ct-trust-item:last-child{border-right:none}
.ct-trust-item:hover{background:rgba(255,255,255,.04)}
.ct-trust-icon{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:#6ee7b7;flex-shrink:0}
.ct-trust-val{font-size:clamp(17px,2vw,21px);font-weight:800;color:#fff;line-height:1.2}
.ct-trust-lbl{font-size:12px;color:rgba(255,255,255,.58);font-weight:500}

/* ── SECTIONS ── */
.ct-section{padding:clamp(56px,8vw,100px) clamp(16px,4vw,24px);position:relative;overflow:hidden}
.ct-section--white{background:#fff}
.ct-section--soft{background:linear-gradient(180deg,#f0fdf4,#ecfdf5 50%,#f8fffe)}
.ct-section--soft::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 10% 20%,rgba(6,78,59,.04) 0%,transparent 50%),radial-gradient(circle at 90% 75%,rgba(4,120,87,.03) 0%,transparent 50%)}
.ct-section--dark{background:linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 100%);color:#fff}
.ct-wrap{max-width:1340px;margin:0 auto;position:relative;z-index:1}
.ct-wrap--sm{max-width:860px}
.ct-wrap--md{max-width:1120px}
.ct-hdr{text-align:center;margin-bottom:clamp(40px,6vw,64px)}
.ct-badge-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 18px;background:rgba(6,78,59,.08);border:1px solid rgba(6,78,59,.12);border-radius:999px;font-size:12.5px;font-weight:700;color:#065f46;margin-bottom:18px}
.ct-h2{font-family:'Playfair Display',serif;font-size:clamp(26px,4.5vw,48px);font-weight:800;line-height:1.12;letter-spacing:-.4px;color:#0f172a;margin-bottom:12px}
.ct-h2 em{font-style:normal;background:linear-gradient(135deg,#065f46,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-h2--white{color:#fff}
.ct-h2--white em{background:linear-gradient(90deg,#6ee7b7,#a7f3d0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-sub{font-size:clamp(14px,1.5vw,17px);color:#64748b;max-width:540px;margin:0 auto;line-height:1.7}
.ct-sub--light{color:rgba(255,255,255,.78)}

/* ── TWO-COL ── */
.ct-two-col{display:grid;grid-template-columns:1fr;gap:clamp(28px,5vw,52px)}
@media(min-width:1024px){.ct-two-col{grid-template-columns:5fr 7fr}}

/* ── USER CARD (auth greeting) ── */
.ct-user-card{
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  border:1px solid #a7f3d0;border-radius:18px;
  padding:16px 18px;margin-bottom:4px;
  box-shadow:0 4px 16px rgba(6,78,59,.08);
  overflow:hidden;position:relative;
}
.ct-user-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#065f46,#10b981,#065f46);
  background-size:200% 100%;
  animation:ct-flow 4s ease infinite;
}
.ct-user-card-inner{display:flex;align-items:center;gap:12px}
.ct-user-avatar{
  width:48px;height:48px;border-radius:50%;
  background:linear-gradient(135deg,#065f46,#047857);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;box-shadow:0 4px 14px rgba(6,78,59,.25);
  overflow:hidden;border:2px solid rgba(255,255,255,.5);
}
.ct-user-name{font-size:14.5px;font-weight:700;color:#064e3b;line-height:1.3}
.ct-user-email{font-size:12px;color:#065f46;opacity:.75;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ct-user-phone{font-size:12px;color:#065f46;opacity:.65;margin-top:2px}
.ct-user-badge{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 10px;border-radius:999px;
  background:rgba(6,78,59,.1);border:1px solid rgba(6,78,59,.15);
  color:#065f46;font-size:10.5px;font-weight:700;
  white-space:nowrap;flex-shrink:0;
}

/* ── CONTACT INFO COL ── */
.ct-info-col{display:flex;flex-direction:column;gap:clamp(12px,1.5vw,16px)}
.ct-info-h3{font-family:'Playfair Display',serif;font-size:clamp(22px,2.5vw,28px);font-weight:700;color:#0f172a;margin-bottom:4px}
.ct-info-p{font-size:clamp(13px,1.2vw,15px);color:#64748b;line-height:1.7;margin-bottom:8px}
.ct-contact-card{display:flex;align-items:flex-start;gap:16px;padding:clamp(16px,2vw,22px) clamp(16px,2vw,24px);background:#fff;border-radius:18px;border:1px solid rgba(6,78,59,.06);box-shadow:0 2px 10px rgba(0,0,0,.025);text-decoration:none;color:inherit;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.ct-contact-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#065f46,#059669);border-radius:4px 0 0 4px;opacity:0;transition:opacity .3s}
.ct-contact-card:hover{transform:translateX(6px);box-shadow:0 8px 28px rgba(6,78,59,.09);border-color:rgba(6,78,59,.12)}
.ct-contact-card:hover::before{opacity:1}
.ct-contact-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#065f46,#047857);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 4px 14px rgba(6,78,59,.28);transition:transform .3s}
.ct-contact-card:hover .ct-contact-icon{transform:rotate(-6deg) scale(1.07)}
.ct-contact-title{font-size:clamp(13px,1.2vw,15px);font-weight:700;color:#0f172a;margin-bottom:4px}
.ct-contact-line{font-size:clamp(12px,1.1vw,13.5px);color:#64748b;line-height:1.55}
.ct-contact-ext{position:absolute;top:16px;right:16px;color:#cbd5e1;opacity:0;transition:opacity .3s}
.ct-contact-card:hover .ct-contact-ext{opacity:1}
.ct-socials-box{background:#fff;padding:clamp(18px,2vw,24px);border-radius:18px;border:1px solid rgba(6,78,59,.06);box-shadow:0 2px 10px rgba(0,0,0,.025)}
.ct-socials-title{font-size:13.5px;font-weight:700;color:#0f172a;margin-bottom:14px}
.ct-socials-row{display:flex;flex-wrap:wrap;gap:10px}
.ct-social{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;background:#ecfdf5;color:#065f46;border:1px solid rgba(6,78,59,.08);transition:all .3s cubic-bezier(.4,0,.2,1)}
.ct-social:hover{background:#065f46;color:#fff;box-shadow:0 8px 22px rgba(6,78,59,.28);border-color:#065f46}

/* ── FORM CARD ── */
.ct-card{background:#fff;border-radius:24px;padding:clamp(22px,4vw,44px);box-shadow:0 6px 36px rgba(0,0,0,.05);border:1px solid rgba(6,78,59,.06);position:relative;overflow:hidden}
.ct-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#064e3b,#047857,#10b981,#047857,#064e3b);background-size:200% 100%;animation:ct-flow 5s ease infinite}
@keyframes ct-flow{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Auto-fill glow on inputs */
.ct-input.autofill-glow{
  border-color:#a7f3d0 !important;
  background:linear-gradient(135deg,#fff,#f0fdf4) !important;
  box-shadow:0 0 0 3px rgba(6,78,59,.06) !important;
}
.ct-wrap-f.autofilled .ct-uline{background:linear-gradient(90deg,#047857,#34d399)!important;transform:scaleX(1)!important}

/* Completion */
.ct-prog-row{display:flex;justify-content:space-between;margin-bottom:7px}
.ct-prog-label{font-size:11.5px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.ct-prog-pct{font-size:11.5px;font-weight:700;color:#065f46}
.ct-prog-track{height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden;margin-bottom:28px}
.ct-prog-fill{height:100%;background:linear-gradient(90deg,#065f46,#059669);border-radius:2px}

/* Step dots */
.ct-steps{display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.ct-step-dot{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #e2e8f0;background:#fff;color:#94a3b8;cursor:pointer;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative;z-index:2}
.ct-step-dot.active{background:linear-gradient(135deg,#065f46,#047857);border-color:#065f46;color:#fff;box-shadow:0 4px 18px rgba(6,78,59,.32)}
.ct-step-dot.done{background:#047857;border-color:#047857;color:#fff}
.ct-step-line{flex:1;max-width:80px;height:3px;background:#e2e8f0;border-radius:2px;transition:background .4s}
.ct-step-line.filled{background:linear-gradient(90deg,#065f46,#059669)}
.ct-step-lbls{display:flex;justify-content:space-between;margin-bottom:28px;padding:0 6px}
.ct-step-lbls span{font-size:clamp(10px,1.1vw,12px);font-weight:600;color:#94a3b8;text-align:center;flex:1;transition:color .3s}
.ct-step-lbls span.active{color:#065f46}
.ct-step-lbls span.done{color:#047857}
.ct-step-hd{margin-bottom:24px}
.ct-step-hd h4{font-family:'Playfair Display',serif;font-size:clamp(18px,2vw,22px);font-weight:700;color:#0f172a;margin-bottom:5px}
.ct-step-hd p{font-size:13.5px;color:#64748b;line-height:1.6}

/* Form fields */
.ct-body{position:relative;min-height:240px}
.ct-step-wrap{width:100%}
.ct-row{display:grid;grid-template-columns:1fr 1fr;gap:0 18px}
@media(max-width:580px){.ct-row{grid-template-columns:1fr}}
.ct-field{margin-bottom:18px}
.ct-field--full{grid-column:1/-1}
.ct-label{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:#334155;margin-bottom:7px;transition:color .3s;flex-wrap:wrap}
.ct-req{color:#ef4444;margin-left:2px}
.ct-wrap-f{position:relative}
.ct-input,.ct-select,.ct-textarea{width:100%;padding:14px 42px 14px 16px;font-family:'Inter',sans-serif;font-size:14px;border:2px solid #e2e8f0;border-radius:13px;outline:none;background:#f8fafc;color:#1e293b;transition:all .32s cubic-bezier(.4,0,.2,1)}
.ct-input::placeholder,.ct-textarea::placeholder{color:#94a3b8}
.ct-input:focus,.ct-select:focus,.ct-textarea:focus{border-color:#065f46;background:#fff;box-shadow:0 0 0 4px rgba(6,78,59,.07)}
.ct-input.err,.ct-textarea.err{border-color:#ef4444}
.ct-input.ok{border-color:#059669}
.ct-select{appearance:none;cursor:pointer;padding-right:42px}
.ct-sel-arr{position:absolute;right:13px;top:50%;transform:translateY(-50%);pointer-events:none;transition:color .3s}
.ct-textarea{min-height:130px;resize:vertical;padding-bottom:40px}
.ct-uline{position:absolute;bottom:0;left:5%;width:90%;height:3px;background:linear-gradient(90deg,#065f46,#059669,#34d399);border-radius:0 0 13px 13px;transform:scaleX(0);transform-origin:center;transition:transform .32s cubic-bezier(.4,0,.2,1)}
.ct-wrap-f.focused .ct-uline{transform:scaleX(1)}
.ct-status{position:absolute;right:13px;top:50%;transform:translateY(-50%)}
.ct-field-err{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#ef4444;margin-top:5px;font-weight:500;overflow:hidden}
.ct-char{position:absolute;bottom:11px;left:14px;right:14px;display:flex;align-items:center;gap:10px}
.ct-char-track{flex:1;height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.ct-char-fill{height:100%;border-radius:2px}
.ct-char-num{font-size:11px;font-weight:500;flex-shrink:0}

/* Server error */
.ct-srv-err{display:flex;align-items:center;gap:8px;padding:13px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:14px;font-size:13.5px;color:#dc2626;font-weight:500}

/* Nav */
.ct-nav{display:flex;justify-content:space-between;align-items:center;margin-top:26px;gap:12px}
.ct-nav-back{display:inline-flex;align-items:center;gap:7px;padding:13px 24px;border-radius:13px;background:#ecfdf5;color:#065f46;border:2px solid rgba(6,78,59,.14);font-family:'Inter',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .25s}
.ct-nav-back:hover{background:#d1fae5}
.ct-nav-next{display:inline-flex;align-items:center;gap:7px;padding:13px 28px;border-radius:13px;background:linear-gradient(135deg,#065f46,#047857);color:#fff;border:none;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(6,78,59,.28);transition:box-shadow .3s}
.ct-nav-next:hover{box-shadow:0 10px 30px rgba(6,78,59,.38)}
.ct-nav-submit{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:17px 28px;border-radius:15px;background:linear-gradient(135deg,#064e3b,#047857);color:#fff;border:none;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(6,78,59,.3);position:relative;overflow:hidden;transition:box-shadow .3s}
.ct-nav-submit:hover:not(:disabled){box-shadow:0 14px 40px rgba(6,78,59,.42)}
.ct-nav-submit:disabled{opacity:.8;cursor:wait}
.ct-progress-strip{position:absolute;bottom:0;left:0;height:4px;background:rgba(255,255,255,.3);border-radius:0 2px 2px 0;transition:width .15s}
.ct-privacy-note{display:flex;align-items:center;justify-content:center;gap:7px;font-size:11.5px;color:#94a3b8;margin-top:16px}

/* ── SUCCESS ── */
.ct-success{text-align:center;padding:clamp(32px,5vw,52px) 16px}
.ct-success-circle{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#065f46,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 26px;box-shadow:0 14px 40px rgba(6,78,59,.32)}
.ct-success-h3{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,30px);font-weight:700;color:#0f172a;margin-bottom:12px}
.ct-success-p{font-size:clamp(13px,1.3vw,15px);color:#64748b;line-height:1.7;max-width:360px;margin:0 auto 24px}
.ct-success-email{display:inline-block;background:#ecfdf5;padding:14px 26px;border-radius:14px;margin-bottom:28px;border:1px solid rgba(6,78,59,.1)}
.ct-success-email small{display:block;font-size:12px;color:#64748b;margin-bottom:3px}
.ct-success-email strong{font-size:15px;color:#065f46}
.ct-success-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ── FAQ ── */
.ct-faq-list{display:flex;flex-direction:column;gap:12px}
.ct-faq{background:#fff;border-radius:18px;border:1px solid rgba(6,78,59,.06);box-shadow:0 2px 8px rgba(0,0,0,.02);overflow:hidden;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative}
.ct-faq::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#065f46,#059669,#34d399);border-radius:4px 0 0 4px;opacity:0;transition:opacity .3s}
.ct-faq:hover{box-shadow:0 6px 22px rgba(6,78,59,.07);border-color:rgba(6,78,59,.1)}
.ct-faq:hover::before,.ct-faq.open::before{opacity:1}
.ct-faq.open{box-shadow:0 8px 28px rgba(6,78,59,.09);border-color:rgba(6,78,59,.12)}
.ct-faq-btn{width:100%;padding:clamp(16px,2vw,22px) clamp(18px,2.5vw,24px);display:flex;align-items:center;gap:14px;background:none;border:none;cursor:pointer;text-align:left}
.ct-faq-num{font-size:12px;font-weight:700;color:#065f46;background:rgba(6,78,59,.08);width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}
.ct-faq.open .ct-faq-num{background:linear-gradient(135deg,#065f46,#047857);color:#fff}
.ct-faq-q{flex:1;font-size:clamp(14px,1.3vw,15.5px);font-weight:650;color:#1e293b;line-height:1.45;transition:color .3s}
.ct-faq:hover .ct-faq-q{color:#065f46}
.ct-faq-chevron{width:36px;height:36px;border-radius:11px;border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;background:#ecfdf5;color:#065f46;transition:all .32s}
.ct-faq-chevron.open{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 4px 14px rgba(6,78,59,.28)}
.ct-faq-body{padding:0 clamp(18px,2.5vw,24px) clamp(16px,2vw,22px) clamp(56px,6vw,72px);font-size:clamp(13px,1.2vw,14.5px);color:#475569;line-height:1.8}
.ct-faq-body::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin-bottom:16px}
.ct-faq-body p{margin:0}
@media(max-width:580px){.ct-faq-body{padding-left:24px}}

/* ── QUICK CHANNELS ── */
.ct-quick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.ct-quick-card{display:flex;align-items:center;gap:18px;padding:clamp(20px,2.5vw,28px) clamp(18px,2vw,26px);background:#fff;border-radius:20px;border:2px solid transparent;box-shadow:0 2px 12px rgba(0,0,0,.03);text-decoration:none;color:inherit;transition:all .35s cubic-bezier(.4,0,.2,1)}
.ct-quick-card:hover{box-shadow:0 14px 38px rgba(6,78,59,.1);border-color:rgba(6,78,59,.14)}
.ct-quick-icon{width:52px;height:52px;border-radius:15px;background:#ecfdf5;color:#065f46;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}
.ct-quick-card:hover .ct-quick-icon{background:linear-gradient(135deg,var(--ch,#065f46),#059669);color:#fff;box-shadow:0 8px 22px rgba(6,78,59,.28)}
.ct-quick-title{font-size:clamp(15px,1.5vw,17px);font-weight:700;color:#0f172a;margin-bottom:3px}
.ct-quick-sub{font-size:12px;color:#94a3b8;margin-bottom:5px}
.ct-quick-detail{font-size:clamp(13px,1.2vw,14.5px);font-weight:600;color:#065f46}

/* ── CTA ── */
.ct-cta-pat{position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")}
.ct-cta-icon{width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 26px;backdrop-filter:blur(4px)}

/* ── CHAT ── */
.ct-chat-fab{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#065f46,#047857);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(6,78,59,.38);z-index:999}
.ct-fab-pulse{position:absolute;inset:0;border-radius:50%;border:3px solid #059669;animation:ct-pulse 2.2s ease-out infinite}
@keyframes ct-pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.6);opacity:0}}
.ct-chat-win{position:fixed;bottom:28px;right:28px;width:clamp(300px,90vw,372px);background:#fff;border-radius:22px;box-shadow:0 24px 64px rgba(0,0,0,.16);overflow:hidden;z-index:1000;display:flex;flex-direction:column}
.ct-chat-head{background:linear-gradient(135deg,#064e3b,#047857);padding:16px 18px;display:flex;align-items:center;justify-content:space-between}
.ct-chat-head-l{display:flex;align-items:center;gap:11px}
.ct-chat-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center}
.ct-chat-name{color:#fff;font-weight:600;font-size:14px}
.ct-chat-status{color:rgba(255,255,255,.72);font-size:11.5px;display:flex;align-items:center;gap:5px}
.ct-chat-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.5)}
.ct-chat-head-r{display:flex;gap:5px}
.ct-chat-hbtn{width:29px;height:29px;border-radius:50%;background:rgba(255,255,255,.12);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .2s}
.ct-chat-hbtn:hover{background:rgba(255,255,255,.22)}
.ct-chat-body{flex:1;padding:18px;background:#f8fffe;overflow-y:auto;max-height:280px}
.ct-bubble{background:#fff;padding:13px 16px;border-radius:16px 16px 16px 4px;max-width:86%;box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:12px}
.ct-bubble--admin{background:#dbeafe;margin-left:auto;border-radius:16px 16px 4px 16px}
.ct-bubble--user{background:#fff;margin-right:auto}
.ct-bubble-who{font-size:11px;font-weight:700;color:#64748b;display:block;margin-bottom:4px}
.ct-bubble p{font-size:13.5px;color:#1e293b;line-height:1.55;margin:0 0 4px}
.ct-bubble p:last-child{margin-bottom:0}
.ct-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
.ct-chip{padding:6px 13px;background:#fff;border:1px solid #059669;border-radius:999px;font-size:11.5px;font-weight:600;color:#065f46;cursor:pointer;transition:all .2s}
.ct-chip:hover{background:#065f46;color:#fff;border-color:#065f46}
.ct-chat-foot{padding:12px;border-top:1px solid #e2e8f0;display:flex;gap:9px}
.ct-chat-in{flex:1;padding:10px 15px;border:1.5px solid #e2e8f0;border-radius:999px;font-size:13.5px;font-family:'Inter',sans-serif;outline:none;transition:border-color .25s}
.ct-chat-in:focus{border-color:#065f46}
.ct-chat-send{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#065f46,#059669);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(6,78,59,.24);flex-shrink:0}
.ct-chat-err{padding:8px 14px;margin:0 14px 12px;border-radius:12px;background:rgba(248,113,113,.1);color:#b91c1c;font-size:12.5px}

/* ── RESPONSIVE ── */
@media(max-width:1024px){.ct-trust-grid{grid-template-columns:repeat(2,1fr)}.ct-trust-item:nth-child(2){border-right:none}}
@media(max-width:768px){.ct-hero{min-height:65vh}.ct-hdr{margin-bottom:clamp(28px,5vw,44px)}}
@media(max-width:640px){.ct-trust-grid{grid-template-columns:1fr 1fr}.ct-trust-item{padding:16px 12px}.ct-trust-val{font-size:17px}.ct-step-lbls span{font-size:10px}.ct-step-line{max-width:40px}}
@media(max-width:480px){.ct-hero-btns,.ct-success-btns{flex-direction:column;align-items:stretch}.ct-btn,.ct-success-btns>*{justify-content:center;width:100%}.ct-nav{flex-direction:column}.ct-nav>div{width:100%}.ct-nav-back,.ct-nav-next,.ct-nav-submit{width:100%;justify-content:center}.ct-trust-grid{grid-template-columns:1fr}.ct-trust-item{border-right:none;border-bottom:1px solid rgba(255,255,255,.07)}.ct-trust-item:last-child{border-bottom:none}.ct-chat-win{bottom:0;right:0;width:100vw;border-radius:22px 22px 0 0}.ct-chat-fab{bottom:20px;right:20px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

export default Contact;