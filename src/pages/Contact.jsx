// src/pages/Contact.jsx
import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from "react";
import {
  AnimatePresence, useInView, useScroll, useTransform, motion,
} from "framer-motion";
import {
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare,
  FiCheckCircle, FiUser, FiAlertCircle, FiChevronDown, FiUsers,
  FiGlobe, FiStar, FiArrowRight, FiArrowLeft, FiHelpCircle,
  FiShield, FiX, FiExternalLink, FiAward, FiZap, FiUserCheck,
  FiMessageCircle, FiSmile,
} from "react-icons/fi";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaTiktok,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import SEO from "../components/common/SEO";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { sendMessage } from "../utils/sendMessage";
import { sendVerificationCode, verifyCode } from "../utils/verifyEmail";
import { useChatSocket } from "../hooks/useChatSocket";
import { apiFetch } from "../utils/apiBase";
import VerificationModal from "../components/common/VerificationModal";
import EmojiPicker from "../components/messaging/EmojiPicker";
import { useUserAuth } from "../context/UserAuthContext";

/* ══════════════════════════════════════════════════════
   BRAND TOKENS
══════════════════════════════════════════════════════ */
const G = {
  900: "#064e3b", 800: "#065f46", 700: "#047857",
  600: "#059669", 500: "#10b981", 400: "#34d399",
  300: "#6ee7b7", 200: "#a7f3d0", 100: "#d1fae5", 50: "#ecfdf5",
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
  ["subject", "message"],
];

const INIT_FORM = {
  name: "", email: "", phone: "",
  tripType: "", travelDate: "", travelers: "",
  subject: "", message: "",
};

/* ══════════════════════════════════════════════════════
   STATIC DATA
══════════════════════════════════════════════════════ */
const TRUST_STATS = [
  { icon: FiUsers, value: "5,000+", label: "Happy Travelers" },
  { icon: FiStar, value: "4.9/5", label: "Average Rating" },
  { icon: FiAward, value: "12+", label: "Years Experience" },
  { icon: FiZap, value: "<2hrs", label: "Response Time" },
];

const CONTACT_CARDS = [
  {
    icon: FiMapPin, title: "Visit Us",
    lines: ["Musanze, Rwanda"],
    href: "https://maps.google.com/?q=Musanze+Rwanda",
  },
  {
    icon: FiPhone, title: "Call Us",
    lines: ["+250 792 352 409"],
    href: "tel:+250792352409",
  },
  {
    icon: FiMail, title: "Email Us",
    lines: ["altuverasafari@gmail.com"],
    href: "mailto:altuverasafari@gmail.com",
  },
  {
    icon: FiClock, title: "Working Hours",
    lines: ["Mon–Fri: 8 AM – 6 PM EAT", "Sat: 9 AM – 2 PM EAT"],
  },
];

const TRIP_TYPES = [
  "🦁 Safari Adventure", "⛰️ Mountain Trekking", "🦍 Gorilla Trekking",
  "🏖️ Beach Holiday", "🎭 Cultural Tour", "📷 Photography Safari",
  "💕 Honeymoon", "👨‍👩‍👧‍👦 Family Trip",
];

const SOCIALS = [
  { icon: FaFacebookF, label: "Facebook", url: "#", color: "#1877F2" },
  { icon: FaInstagram, label: "Instagram", url: "#", color: "#E1306C" },
  { icon: FaTwitter, label: "Twitter", url: "#", color: "#1DA1F2" },
  { icon: FaYoutube, label: "YouTube", url: "#", color: "#FF0000" },
  { icon: FaWhatsapp, label: "WhatsApp", url: "https://wa.me/250792352409", color: "#25D366" },
  { icon: FaTiktok, label: "TikTok", url: "#", color: "#000" },
];

const QUICK_CHANNELS = [
  {
    icon: FaWhatsapp, title: "WhatsApp", subtitle: "Instant chat",
    detail: "+250 792 352 409", href: "https://wa.me/250792352409", color: "#25D366",
  },
  {
    icon: FiPhone, title: "Call Us", subtitle: "Speak to an expert",
    detail: "+250 792 352 409", href: "tel:+250792352409", color: G[700],
  },
  {
    icon: FiMail, title: "Email", subtitle: "Detailed inquiries",
    detail: "altuverasafari@gmail.com", href: "mailto:altuverasafari@gmail.com", color: "#3B82F6",
  },
];

const STEP_CONFIG = [
  { label: "Your Info", icon: FiUser, desc: "Tell us about yourself" },
  { label: "Message", icon: FiMessageSquare, desc: "What's on your mind?" },
];

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════ */
const ScrollReveal = ({
  children, delay = 0, direction = "up", distance = 32,
  style = {}, className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = {
    up: { y: distance }, down: { y: -distance },
    left: { x: -distance }, right: { x: distance },
    scale: { scale: 0.94 },
  };
  return (
    <motion.div
      ref={ref} className={className} style={style}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE.smooth }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   FIELD INPUT
══════════════════════════════════════════════════════ */
const FieldInput = React.memo(({
  name, label, icon: Icon, type = "text", placeholder,
  required, value, onChange, onBlur, error, touched,
  autoFilled = false,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;

  return (
    <div className="cf-field">
      <label
        className="cf-label"
        style={{ color: hasErr ? "#ef4444" : focused ? G[700] : undefined }}
      >
        {Icon && <Icon size={13} />}
        {label}
        {required && <span className="cf-req">*</span>}
        {autoFilled && (
          <span className="cf-autobadge">
            <FiUserCheck size={9} /> Auto-filled
          </span>
        )}
      </label>

      <div className={`cf-input-wrap${focused ? " is-focused" : ""}${hasErr ? " is-error" : isOk ? " is-ok" : ""}${autoFilled ? " is-auto" : ""}`}>
        {type === "email" ? (
          <EmailAutocompleteInput
            name={name} value={value} placeholder={placeholder}
            onValueChange={(v) => onChange?.({ target: { name, value: v } })}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            className="cf-input"
            aria-invalid={!!hasErr}
          />
        ) : (
          <input
            type={type} name={name} value={value} placeholder={placeholder}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            className="cf-input"
            aria-invalid={!!hasErr}
            aria-describedby={hasErr ? `${name}-err` : undefined}
          />
        )}

        <AnimatePresence mode="wait">
          {hasErr && (
            <motion.span key="err" className="cf-icon-right"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiAlertCircle size={16} color="#ef4444" />
            </motion.span>
          )}
          {isOk && !autoFilled && (
            <motion.span key="ok" className="cf-icon-right"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiCheckCircle size={16} color={G[600]} />
            </motion.span>
          )}
          {autoFilled && (
            <motion.span key="auto" className="cf-icon-right"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiUserCheck size={16} color={G[600]} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasErr && (
          <motion.p id={`${name}-err`} className="cf-err-msg" role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
          >
            <FiAlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
FieldInput.displayName = "FieldInput";

/* ══════════════════════════════════════════════════════
   FIELD SELECT
══════════════════════════════════════════════════════ */
const FieldSelect = React.memo(({
  name, label, icon: Icon, placeholder, options,
  value, onChange, onBlur,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="cf-field">
      <label className="cf-label" style={{ color: focused ? G[700] : undefined }}>
        {Icon && <Icon size={13} />} {label}
      </label>
      <div className={`cf-input-wrap cf-select-wrap${focused ? " is-focused" : ""}`}>
        <select
          name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className="cf-select"
        >
          <option value="">{placeholder}</option>
          {options.map((o, i) => (
            <option key={i} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </option>
          ))}
        </select>
        <span className="cf-sel-icon" style={{ color: focused ? G[700] : "#94a3b8" }}>
          <FiChevronDown size={17} />
        </span>
      </div>
    </div>
  );
});
FieldSelect.displayName = "FieldSelect";

/* ══════════════════════════════════════════════════════
   FIELD TEXTAREA
══════════════════════════════════════════════════════ */
const FieldTextarea = React.memo(({
  name, label, placeholder, required, maxLength = 2000,
  value, onChange, onBlur, error, touched,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;
  const chars = value?.length || 0;
  const pct = (chars / maxLength) * 100;
  const barColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : G[600];

  return (
    <div className="cf-field cf-field--full">
      <label
        className="cf-label"
        style={{ color: hasErr ? "#ef4444" : focused ? G[700] : undefined }}
      >
        <FiMessageSquare size={13} /> {label}
        {required && <span className="cf-req">*</span>}
      </label>

      <div className={`cf-input-wrap cf-ta-wrap${focused ? " is-focused" : ""}${hasErr ? " is-error" : isOk ? " is-ok" : ""}`}>
        <textarea
          name={name} value={value} placeholder={placeholder}
          maxLength={maxLength} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          className="cf-textarea"
          aria-invalid={!!hasErr}
          aria-describedby={hasErr ? `${name}-err` : undefined}
        />
        <div className="cf-char-row">
          <div className="cf-char-track">
            <motion.div className="cf-char-fill"
              animate={{ width: `${pct}%`, background: barColor }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="cf-char-cnt" style={{ color: pct > 90 ? "#ef4444" : "#94a3b8" }}>
            {chars}/{maxLength}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {hasErr && (
          <motion.p id={`${name}-err`} className="cf-err-msg" role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FiAlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
FieldTextarea.displayName = "FieldTextarea";

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const Contact = () => {
  const { user, isAuthenticated } = useUserAuth();

  /* ── Auto-fill tracking ── */
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());
  const [showBanner, setShowBanner] = useState(false);
  const autoFillDone = useRef(false);

  /* ── Form state ── */
  const [form, setForm] = useState(INIT_FORM);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  /* ── Verification ── */
  const [verOpen, setVerOpen] = useState(false);
  const [verErr, setVerErr] = useState("");
  const [verLoading, setVerLoading] = useState(false);
  // Store email at time of submit so it survives form resets
  const verEmailRef = useRef("");

  /* ── FAQ ── */
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqsError, setFaqsError] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);

  /* ── Chat ── */
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatErr, setChatErr] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  /* ── Refs ── */
  const heroRef = useRef(null);
  const chatBodyRef = useRef(null);
  const emojiRef = useRef(null);
  // Store the full form data at submit time for use after verification
  const pendingFormRef = useRef(null);

  /* ── Parallax ── */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* ── Chat socket ── */
  const {
    connected: chatConnected,
    connect: connectChat,
    registerChat,
    sendMessage: sendChatMsg,
    messages: chatMessages,
  } = useChatSocket();

  /* ═══════════════════════════════
     FETCH FAQs
  ═══════════════════════════════ */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setFaqsLoading(true);
      try {
        const res = await apiFetch("/faqs", { signal: ac.signal });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const json = await res.json();
        setFaqs(
          (json?.data || []).map((f) => ({
            id: f.id,
            q: f.question,
            a: f.answer,
          }))
        );
      } catch (err) {
        if (err?.name !== "AbortError") {
          setFaqsError(err?.message || "Failed to load FAQs");
        }
      } finally {
        setFaqsLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  /* ═══════════════════════════════
     AUTO-FILL FROM AUTH USER
  ═══════════════════════════════ */
  useEffect(() => {
    if (!user || !isAuthenticated || autoFillDone.current) return;
    const name = user.fullName || user.full_name || user.name || "";
    const email = user.email || "";
    const phone = user.phone || "";
    if (!name && !email && !phone) return;

    autoFillDone.current = true;
    const updates = {};
    const filled = new Set();
    if (name) { updates.name = name; filled.add("name"); }
    if (email) { updates.email = email; filled.add("email"); }
    if (phone) { updates.phone = phone; filled.add("phone"); }

    setForm((prev) => ({ ...prev, ...updates }));
    setAutoFilledFields(filled);
    setShowBanner(true);

    const newTouched = {};
    const newErrors = {};
    Object.keys(updates).forEach((k) => {
      newTouched[k] = true;
      newErrors[k] = validateField(k, updates[k]);
    });
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [user, isAuthenticated]);

  /* ═══════════════════════════════
     CHAT LIFECYCLE
  ═══════════════════════════════ */
  useEffect(() => {
    if (chatOpen && !chatConnected) connectChat();
  }, [chatOpen, chatConnected, connectChat]);

  const chatRegistered = useRef(false);
  useEffect(() => {
    if (!chatOpen || !chatConnected || chatRegistered.current) return;
    chatRegistered.current = true;
    registerChat({
      name: form.name || user?.fullName || "Guest",
      email: form.email || user?.email || "",
    }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, chatConnected]);

  // Reset chat registration when chat closes
  useEffect(() => {
    if (!chatOpen) chatRegistered.current = false;
  }, [chatOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    if (!emojiOpen) return;
    const handlePointerDown = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [emojiOpen]);

  /* ═══════════════════════════════
     HANDLERS
  ═══════════════════════════════ */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (autoFilledFields.has(name)) {
      setAutoFilledFields((prev) => {
        const s = new Set(prev);
        s.delete(name);
        return s;
      });
    }
    setErrors((prev) =>
      prev[name] ? { ...prev, [name]: validateField(name, value) } : prev
    );
  }, [autoFilledFields]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const handleEmojiSelect = useCallback((emoji) => {
    setForm((prev) => ({
      ...prev,
      message: `${prev.message || ""}${emoji}`,
    }));
    setEmojiOpen(false);
  }, []);

  const validateStep = useCallback((idx) => {
    const errs = {};
    const touch = {};
    STEP_FIELDS[idx].forEach((f) => {
      touch[f] = true;
      const e = validateField(f, form[f]);
      if (e) errs[f] = e;
    });
    setTouched((prev) => ({ ...prev, ...touch }));
    setErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  }, [form]);

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  }, [step, validateStep]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  /* ── Submit → Send OTP ── */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate all steps
    let hasErrors = false;
    STEP_FIELDS.forEach((_, idx) => {
      if (!validateStep(idx)) hasErrors = true;
    });
    if (hasErrors) return;

    const email = form.email?.trim().toLowerCase();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    setSubmitting(true);
    setSubmitProgress(0);
    setErrors((prev) => ({ ...prev, submit: "" }));

    const tick = setInterval(
      () => setSubmitProgress((p) => Math.min(p + 7, 88)),
      120
    );

    try {
      // Store form data and email for after-verification use
      pendingFormRef.current = { ...form };
      verEmailRef.current = email;

      await sendVerificationCode({ email });

      setVerErr("");
      setVerOpen(true);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || "Unable to send verification code. Please try again.",
      }));
    } finally {
      clearInterval(tick);
      setSubmitProgress(100);
      setTimeout(() => setSubmitting(false), 300);
    }
  }, [form, validateStep]);

  /* ── Verify OTP → Send Message ── */
  const handleVerify = useCallback(async (code) => {
    const email = verEmailRef.current;
    if (!email) {
      setVerErr("Email is missing. Please close and try again.");
      return;
    }
    if (!code?.trim()) {
      setVerErr("Please enter the verification code.");
      return;
    }

    const sanitizedCode = String(code).replace(/\D/g, "").slice(0, 6);
    if (sanitizedCode.length !== 6) {
      setVerErr("Enter a valid 6-digit code.");
      return;
    }

    setVerLoading(true);
    setVerErr("");

    try {
      // Step 1: Verify the OTP code
      await verifyCode({
        email,
        code: sanitizedCode,
      });

      // Step 2: Send the actual contact message
      const formData = pendingFormRef.current || form;
      const res = await sendMessage({
        type: "contact",
        data: { ...formData },
      });

      if (res?.error) {
        setVerErr(res.error);
        return;
      }

      // Step 3: Success — clean up everything
      setSubmitted(true);
      setVerOpen(false);
      setForm(INIT_FORM);
      setTouched({});
      setErrors({});
      setAutoFilledFields(new Set());
      autoFillDone.current = false;
      pendingFormRef.current = null;
      verEmailRef.current = "";
    } catch (err) {
      const msg = err?.message || "Invalid code. Please try again.";

      // Provide user-friendly messages
      if (msg.includes("expired")) {
        setVerErr("Code expired. Please close and request a new one.");
      } else if (msg.includes("attempts")) {
        setVerErr("Too many attempts. Please close and try again.");
      } else {
        setVerErr(msg);
      }
    } finally {
      setVerLoading(false);
    }
  }, [form]);

  /* ── Close verification modal ── */
  const closeVer = useCallback(() => {
    setVerOpen(false);
    setVerErr("");
    // Don't clear verEmailRef or pendingFormRef here
    // in case user wants to re-open
  }, []);

  /* ── Reset form completely ── */
  const resetForm = useCallback(() => {
    setSubmitted(false);
    setStep(0);
    setDirection(1);
    setForm(INIT_FORM);
    setTouched({});
    setErrors({});
    setAutoFilledFields(new Set());
    setShowBanner(false);
    autoFillDone.current = false;
    pendingFormRef.current = null;
    verEmailRef.current = "";
    setSubmitProgress(0);
  }, []);

  /* ── Chat send ── */
  const handleChatSend = useCallback(async () => {
    const body = chatInput.trim();
    if (!body) return;
    setChatErr("");
    setChatSending(true);
    try {
      const chatName = form.name || user?.fullName || "Guest";
      const chatEmail = form.email || user?.email || "";

      if (!chatRegistered.current) {
        await registerChat({ name: chatName, email: chatEmail });
        chatRegistered.current = true;
      }

      await sendChatMsg({ body, name: chatName, email: chatEmail });
      setChatInput("");
    } catch (err) {
      setChatErr(err?.message || "Failed to send. Try again.");
    } finally {
      setChatSending(false);
    }
  }, [chatInput, form, user, registerChat, sendChatMsg]);

  /* ── Completion % ── */
  const completion = useMemo(() => {
    const required = ["name", "email", "subject", "message"];
    const filled = required.filter((k) => form[k]?.trim()).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  /* ═══════════════════════════════
     RENDER
  ═══════════════════════════════ */
  return (
    <div className="cf">
      <SEO
        title="Contact Us — Altuvera Safari"
        description="Get in touch with Altuvera for personalized safari planning, booking assistance, and expert travel advice across East Africa."
        keywords={["contact Altuvera", "safari booking", "East Africa travel"]}
        url="/contact"
      />
      <style>{CSS}</style>

      {/* ══════════ HERO ══════════ */}
      <section className="cf-hero" ref={heroRef}>
        <motion.div
          className="cf-hero-bg"
          style={{
            backgroundImage:
              "url(https://i.pinimg.com/736x/bb/ca/d1/bbcad1c07136f38bfc47257f8b38cf2a.jpg)",
            y: heroY,
          }}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        />
        <div className="cf-hero-overlay" />

        <motion.div className="cf-hero-inner" style={{ opacity: heroOpacity }}>
          <motion.div
            className="cf-hero-badge"
            initial={{ opacity: 0, y: -18, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6, ease: EASE.bounce }}
          >
            <HiSparkles size={14} /> Your Safari Starts Here
          </motion.div>

          <motion.h1
            className="cf-hero-h1"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Let's Plan Your<br />
            <em>Dream Safari</em>
          </motion.h1>

          <motion.p
            className="cf-hero-p"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.65 }}
          >
            Connect with our expert team and let us craft an unforgettable
            African adventure tailored just for you.
          </motion.p>

          <motion.div
            className="cf-hero-btns"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.6 }}
          >
            <a href="#contact-form" className="cf-btn cf-btn--white">
              <FiSend size={15} /> Send a Message
            </a>
            <a href="tel:+250792352409" className="cf-btn cf-btn--ghost">
              <FiPhone size={15} /> Call Us Now
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="cf-scroll-hint"
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="cf-scroll-pill">
            <motion.div
              className="cf-scroll-dot"
              animate={{ y: [0, 13, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.7, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════ TRUST BAR ══════════ */}
      <div className="cf-trust">
        <div className="cf-wrap">
          <div className="cf-trust-grid">
            {TRUST_STATS.map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.07} direction="up" distance={18}>
                <div className="cf-trust-item">
                  <div className="cf-trust-icon"><s.icon size={20} /></div>
                  <div>
                    <div className="cf-trust-val">{s.value}</div>
                    <div className="cf-trust-lbl">{s.label}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ MAIN FORM SECTION ══════════ */}
      <section className="cf-section cf-section--soft" id="contact-form">
        <div className="cf-wrap">
          <ScrollReveal>
            <div className="cf-hdr">
              <div className="cf-pill">
                <FiMessageSquare size={12} /> Get In Touch
              </div>
              <h2 className="cf-h2">
                We'd Love to <em>Hear From You</em>
              </h2>
              <p className="cf-sub">
                Our Africa travel experts are ready to help craft your perfect
                adventure.
              </p>
            </div>
          </ScrollReveal>

          <div className="cf-two-col">
            {/* ── Contact Info ── */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="cf-info">
                <AnimatePresence>
                  {isAuthenticated && user && (
                    <motion.div
                      className="cf-user-card"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                    >
                      <div className="cf-user-av">
                        {user.avatar || user.avatarUrl ? (
                          <img
                            src={user.avatar || user.avatarUrl}
                            alt=""
                            style={{
                              width: "100%", height: "100%",
                              objectFit: "cover", borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <FiUser size={20} color="#fff" />
                        )}
                      </div>
                      <div className="cf-user-meta">
                        <div className="cf-user-name">
                          {user.fullName || user.name || "Traveler"}
                        </div>
                        <div className="cf-user-email">{user.email}</div>
                      </div>
                      <div className="cf-user-badge">
                        <FiUserCheck size={11} /> Signed In
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <h3 className="cf-info-h3">Contact Information</h3>
                <p className="cf-info-p">
                  Reach us through any channel. We respond within 2 hours
                  during working hours.
                </p>

                {CONTACT_CARDS.map((c, i) => (
                  <ScrollReveal key={i} delay={0.12 + i * 0.06}>
                    <a
                      href={c.href || "#"}
                      className="cf-card-link"
                      onClick={!c.href ? (e) => e.preventDefault() : undefined}
                    >
                      <div className="cf-card-icon"><c.icon size={19} /></div>
                      <div className="cf-card-body">
                        <div className="cf-card-title">{c.title}</div>
                        {c.lines.map((l, j) => (
                          <div key={j} className="cf-card-line">{l}</div>
                        ))}
                      </div>
                      {c.href && (
                        <FiExternalLink size={12} className="cf-card-ext" />
                      )}
                    </a>
                  </ScrollReveal>
                ))}

                <ScrollReveal delay={0.44}>
                  <div className="cf-socials">
                    <div className="cf-socials-title">Follow Our Adventures</div>
                    <div className="cf-socials-row">
                      {SOCIALS.map((s, i) => (
                        <motion.a
                          key={i} href={s.url}
                          target="_blank" rel="noopener noreferrer"
                          title={s.label} className="cf-social"
                          whileHover={{ scale: 1.14, y: -3 }}
                          whileTap={{ scale: 0.93 }}
                        >
                          <s.icon />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* ── Form Panel ── */}
            <ScrollReveal direction="right" delay={0.15}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── SUCCESS STATE ── */
                  <motion.div
                    key="success" className="cf-panel"
                    initial={{ opacity: 0, scale: 0.92, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, ease: EASE.snappy }}
                  >
                    <div className="cf-success">
                      <motion.div
                        className="cf-success-ring"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: EASE.bounce }}
                      >
                        <FiCheckCircle size={50} color="#fff" />
                      </motion.div>
                      <motion.h3
                        className="cf-success-h3"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Message Sent! 🎉
                      </motion.h3>
                      <motion.p
                        className="cf-success-p"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        Our safari experts will respond within 24 hours.
                      </motion.p>
                      <motion.div
                        className="cf-success-tag"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <small>Confirmation sent to</small>
                        <strong>
                          {pendingFormRef.current?.email || user?.email || "your email"}
                        </strong>
                      </motion.div>
                      <motion.div
                        className="cf-success-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <button className="cf-btn cf-btn--green" onClick={resetForm}>
                          <FiSend size={14} /> Send Another
                        </button>
                        <a href="/" className="cf-btn cf-btn--outline">
                          <FiArrowLeft size={14} /> Back Home
                        </a>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  /* ── FORM ── */
                  <motion.form
                    key="form" className="cf-panel"
                    onSubmit={handleSubmit} autoComplete="off" noValidate
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    {/* Auto-fill banner */}
                    <AnimatePresence>
                      {showBanner && isAuthenticated && user && (
                        <motion.div
                          key="banner" className="cf-banner"
                          initial={{ opacity: 0, y: -10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.38 }}
                        >
                          <div className="cf-banner-av">
                            {user.avatar || user.avatarUrl ? (
                              <img
                                src={user.avatar || user.avatarUrl}
                                alt=""
                                style={{
                                  width: "100%", height: "100%",
                                  borderRadius: "50%", objectFit: "cover",
                                }}
                              />
                            ) : (
                              <FiUserCheck size={15} color="#fff" />
                            )}
                          </div>
                          <div className="cf-banner-txt">
                            <span className="cf-banner-name">
                              Welcome back, {user.fullName || user.name || "there"}! 👋
                            </span>
                            <span className="cf-banner-sub">
                              Your details have been auto-filled — just review and send.
                            </span>
                          </div>
                          <button
                            type="button" className="cf-banner-close"
                            onClick={() => setShowBanner(false)}
                            aria-label="Dismiss"
                          >
                            <FiX size={14} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Completion bar */}
                    <div className="cf-prog">
                      <div className="cf-prog-top">
                        <span className="cf-prog-lbl">Form Completion</span>
                        <span className="cf-prog-pct">{completion}%</span>
                      </div>
                      <div className="cf-prog-track">
                        <motion.div
                          className="cf-prog-fill"
                          animate={{ width: `${completion}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>

                    {/* Step indicator */}
                    <div className="cf-stepper">
                      {STEP_CONFIG.map((cfg, i) => (
                        <React.Fragment key={i}>
                          <div
                            className={`cf-step${step === i ? " cf-step--active" : step > i ? " cf-step--done" : ""}`}
                            onClick={() => {
                              if (i < step) {
                                setDirection(-1);
                                setStep(i);
                              } else if (i > step && validateStep(step)) {
                                setDirection(1);
                                setStep(i);
                              }
                            }}
                            role="button" tabIndex={0}
                            aria-label={`Step ${i + 1}: ${cfg.label}`}
                          >
                            <div className="cf-step-circle">
                              {step > i ? (
                                <FiCheckCircle size={17} />
                              ) : (
                                <cfg.icon size={17} />
                              )}
                            </div>
                            <div className="cf-step-meta">
                              <span className="cf-step-num">Step {i + 1}</span>
                              <span className="cf-step-lbl">{cfg.label}</span>
                            </div>
                          </div>
                          {i < STEP_CONFIG.length - 1 && (
                            <div
                              className={`cf-step-line${step > i ? " cf-step-line--done" : ""}`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Step body */}
                    <div className="cf-step-body">
                      <AnimatePresence mode="wait" custom={direction}>
                        {step === 0 && (
                          <motion.div
                            key="s0" custom={direction}
                            variants={{
                              enter: (d) => ({ opacity: 0, x: d * 40 }),
                              center: { opacity: 1, x: 0 },
                              exit: (d) => ({ opacity: 0, x: d * -40 }),
                            }}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.32, ease: EASE.snappy }}
                          >
                            <div className="cf-step-hd">
                              <h4>Personal Information</h4>
                              <p>Tell us who you are so we can personalise your experience.</p>
                            </div>
                            <div className="cf-grid-2">
                              <FieldInput
                                name="name" label="Full Name" icon={FiUser}
                                placeholder="e.g. Jane Smith" required
                                value={form.name} onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.name} touched={touched.name}
                                autoFilled={autoFilledFields.has("name")}
                              />
                              <FieldInput
                                name="email" label="Email Address" icon={FiMail}
                                type="email" placeholder="you@example.com" required
                                value={form.email} onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.email} touched={touched.email}
                                autoFilled={autoFilledFields.has("email")}
                              />
                            </div>
                            <FieldInput
                              name="phone" label="Phone Number (Optional)"
                              icon={FiPhone} type="tel"
                              placeholder="+250 700 000 000"
                              value={form.phone} onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.phone} touched={touched.phone}
                              autoFilled={autoFilledFields.has("phone")}
                            />

                            <div className="cf-optional-block">
                              <div className="cf-optional-lbl">
                                <FiGlobe size={13} /> Optional Trip Details
                              </div>
                              <div className="cf-grid-2">
                                <FieldSelect
                                  name="tripType" label="Trip Type" icon={FiGlobe}
                                  placeholder="Select trip type" options={TRIP_TYPES}
                                  value={form.tripType} onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                <FieldInput
                                  name="travelDate" label="Travel Date"
                                  icon={FiClock} type="date"
                                  value={form.travelDate} onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </div>
                              <FieldSelect
                                name="travelers" label="Number of Travelers"
                                icon={FiUsers} placeholder="Select group size"
                                options={[
                                  "Solo", "2 — Couple", "3–4 — Small Group",
                                  "5–8 — Group", "9+ — Large Group",
                                ]}
                                value={form.travelers} onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                          </motion.div>
                        )}

                        {step === 1 && (
                          <motion.div
                            key="s1" custom={direction}
                            variants={{
                              enter: (d) => ({ opacity: 0, x: d * 40 }),
                              center: { opacity: 1, x: 0 },
                              exit: (d) => ({ opacity: 0, x: d * -40 }),
                            }}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.32, ease: EASE.snappy }}
                          >
                            <div className="cf-step-hd">
                              <h4>Your Message</h4>
                              <p>Tell us about your dream trip and any questions you have.</p>
                            </div>
                            <FieldInput
                              name="subject" label="Subject"
                              icon={FiMessageSquare}
                              placeholder="e.g. 7-Day Gorilla Trekking Package"
                              required
                              value={form.subject} onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.subject} touched={touched.subject}
                            />
                            <FieldTextarea
                              name="message" label="Message" required
                              placeholder="Hi, I'm interested in booking a gorilla trekking experience for 2 people in October..."
                              value={form.message} onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors.message} touched={touched.message}
                            />

                            <div className="cf-emoji-row">
                              <button
                                type="button"
                                className="cf-emoji-btn"
                                onClick={() => setEmojiOpen((prev) => !prev)}
                                aria-label="Toggle emoji picker"
                              >
                                <FiSmile size={15} /> Add emoji
                              </button>
                              {emojiOpen && (
                                <div ref={emojiRef} className="cf-emoji-wrap">
                                  <EmojiPicker
                                    onSelect={handleEmojiSelect}
                                    onClose={() => setEmojiOpen(false)}
                                  />
                                </div>
                              )}
                            </div>

                            {errors.submit && (
                              <div className="cf-srv-err">
                                <FiAlertCircle size={15} /> {errors.submit}
                              </div>
                            )}

                            <button
                              type="submit" className="cf-submit"
                              disabled={submitting}
                              aria-busy={submitting}
                            >
                              {submitting ? (
                                <>
                                  <svg
                                    className="cf-spin" width="18" height="18"
                                    viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5"
                                  >
                                    <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                  </svg>
                                  Sending…
                                  <div
                                    className="cf-submit-bar"
                                    style={{ width: `${submitProgress}%` }}
                                  />
                                </>
                              ) : (
                                <>
                                  <RiSendPlaneFill size={17} /> Send Message
                                </>
                              )}
                            </button>

                            <div className="cf-privacy">
                              <FiShield size={12} /> Your information is
                              encrypted and never shared.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="cf-nav">
                      {step > 0 ? (
                        <button
                          type="button" className="cf-nav-back"
                          onClick={goPrev}
                        >
                          <FiArrowLeft size={15} /> Back
                        </button>
                      ) : <div />}
                      {step < STEP_FIELDS.length - 1 && (
                        <button
                          type="button" className="cf-nav-next"
                          onClick={goNext}
                        >
                          Next Step <FiArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════ QUICK CHANNELS ══════════ */}
      <section className="cf-section cf-section--white">
        <div className="cf-wrap cf-wrap--md">
          <ScrollReveal>
            <div className="cf-hdr">
              <div className="cf-pill">
                <BiSupport size={13} /> Reach Us Instantly
              </div>
              <h2 className="cf-h2">
                Prefer to <em>Talk Directly</em>?
              </h2>
              <p className="cf-sub">
                Choose the channel that suits you best. We're always ready to
                help.
              </p>
            </div>
          </ScrollReveal>
          <div className="cf-channels">
            {QUICK_CHANNELS.map((ch, i) => (
              <ScrollReveal key={i} delay={i * 0.1} direction="up">
                <a
                  href={ch.href} className="cf-ch-card"
                  target="_blank" rel="noopener noreferrer"
                  style={{ "--ch-color": ch.color }}
                >
                  <div className="cf-ch-icon"><ch.icon size={26} /></div>
                  <div className="cf-ch-title">{ch.title}</div>
                  <div className="cf-ch-sub">{ch.subtitle}</div>
                  <div className="cf-ch-detail">{ch.detail}</div>
                  <div className="cf-ch-arrow">
                    <FiArrowRight size={16} />
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="cf-section cf-section--soft">
        <div className="cf-wrap cf-wrap--sm">
          <ScrollReveal>
            <div className="cf-hdr">
              <div className="cf-pill">
                <FiHelpCircle size={12} /> FAQ
              </div>
              <h2 className="cf-h2">
                Got <em>Questions</em>?
              </h2>
              <p className="cf-sub">
                Quick answers about our safaris and booking process.
              </p>
            </div>
          </ScrollReveal>

          <div className="cf-faqs">
            {faqsLoading ? (
              <div className="cf-faq-state">
                <div className="cf-spinner" />
                <span>Loading FAQs…</span>
              </div>
            ) : faqsError ? (
              <div className="cf-faq-state cf-faq-state--err">
                <FiAlertCircle size={22} /> {faqsError}
              </div>
            ) : faqs.length === 0 ? (
              <div className="cf-faq-state">
                No FAQs available at the moment.
              </div>
            ) : (
              faqs.map((faq, i) => {
                const open = openFaqId === faq.id;
                return (
                  <ScrollReveal key={faq.id} delay={i * 0.05}>
                    <div className={`cf-faq${open ? " cf-faq--open" : ""}`}>
                      <button
                        className="cf-faq-btn" type="button"
                        onClick={() => setOpenFaqId(open ? null : faq.id)}
                        aria-expanded={open}
                      >
                        <span className="cf-faq-num">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="cf-faq-q">{faq.q}</span>
                        <motion.span
                          className="cf-faq-chev"
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FiChevronDown size={16} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE.snappy }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="cf-faq-body">{faq.a}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ══════════ CTA STRIP ══════════ */}
      <section className="cf-section cf-cta">
        <div className="cf-cta-pat" />
        <div className="cf-wrap">
          <ScrollReveal>
            <div className="cf-cta-inner">
              <div className="cf-cta-icon">
                <HiSparkles size={34} color="#6ee7b7" />
              </div>
              <h2 className="cf-h2 cf-h2--white">
                Ready for Your <em>African Adventure</em>?
              </h2>
              <p className="cf-sub cf-sub--light">
                Join thousands of happy travellers who trusted Altuvera to make
                their safari dreams a reality.
              </p>
              <div className="cf-cta-btns">
                <a href="#contact-form" className="cf-btn cf-btn--white">
                  <FiSend size={15} /> Plan My Safari
                </a>
                <a
                  href="https://wa.me/250792352409"
                  target="_blank" rel="noopener noreferrer"
                  className="cf-btn cf-btn--ghost"
                >
                  <FaWhatsapp size={16} /> WhatsApp Us
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ LIVE CHAT FAB ══════════ */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            key="fab" className="cf-fab"
            onClick={() => setChatOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            aria-label="Open live chat"
          >
            <FiMessageCircle size={24} color="#fff" />
            <span className="cf-fab-pulse" />
            <span className="cf-fab-badge">Chat</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ══════════ CHAT WINDOW ══════════ */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat" className="cf-chat"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.38, ease: EASE.snappy }}
          >
            <div className="cf-chat-head">
              <div className="cf-chat-head-l">
                <div className="cf-chat-av">
                  <BiSupport size={20} color="#fff" />
                </div>
                <div>
                  <div className="cf-chat-name">Altuvera Support</div>
                  <div className="cf-chat-status">
                    <span
                      className={`cf-chat-dot${chatConnected ? " live" : ""}`}
                    />
                    {chatConnected ? "Online" : "Connecting…"}
                  </div>
                </div>
              </div>
              <button
                className="cf-chat-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="cf-chat-body" ref={chatBodyRef}>
              {chatMessages.length === 0 && (
                <div className="cf-chat-welcome">
                  <div className="cf-chat-welcome-icon">
                    <BiSupport size={26} color={G[700]} />
                  </div>
                  <p><strong>Hi there! 👋</strong></p>
                  <p>How can we help you plan your safari today?</p>
                  <div className="cf-chips">
                    {[
                      "Gorilla Trekking", "Safari Packages",
                      "Group Tours", "Pricing",
                    ].map((t) => (
                      <button
                        key={t} className="cf-chip" type="button"
                        onClick={() => setChatInput(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => {
                const isUser =
                  msg.sender === "user" || msg.role === "user";
                return (
                  <motion.div
                    key={i}
                    className={`cf-bubble${isUser ? " cf-bubble--user" : ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    {!isUser && (
                      <span className="cf-bubble-who">Support</span>
                    )}
                    <p>{msg.body || msg.message || msg.content}</p>
                    <span className="cf-bubble-time">
                      {new Date(
                        msg.createdAt || Date.now()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {chatErr && (
              <div className="cf-chat-err">
                <FiAlertCircle size={13} /> {chatErr}
              </div>
            )}

            <div className="cf-chat-foot">
              <input
                className="cf-chat-in"
                placeholder="Type your message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
                disabled={chatSending}
                aria-label="Chat message"
              />
              <motion.button
                className="cf-chat-send"
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatSending}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                aria-label="Send message"
              >
                {chatSending ? (
                  <svg
                    className="cf-spin" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <RiSendPlaneFill size={16} color="#fff" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ VERIFICATION MODAL ══════════ */}
      <VerificationModal
        open={verOpen}
        email={verEmailRef.current || form.email}
        loading={verLoading}
        error={verErr}
        onClose={closeVer}
        onSubmit={handleVerify}
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
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:#f0fdf4}
::-webkit-scrollbar-thumb{background:#065f46;border-radius:3px}

.cf{font-family:'Inter',system-ui,sans-serif;color:#1e293b;background:#fff;line-height:1.6}

/* ─── HERO ─────────────────────────────────── */
.cf-hero{
  position:relative;min-height:80vh;
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.cf-hero-bg{
  position:absolute;inset:-12%;
  background-size:cover;background-position:center;
  will-change:transform;filter:brightness(.78);
}
.cf-hero-overlay{
  position:absolute;inset:0;
  background:linear-gradient(160deg,
    rgba(6,78,59,.28) 0%,
    rgba(4,120,87,.68) 35%,
    rgba(6,95,70,.8) 65%,
    rgba(6,78,59,.88) 100%
  );
}
.cf-hero-inner{
  position:relative;z-index:2;
  text-align:center;
  padding:0 clamp(20px,5vw,32px);
  max-width:820px;
}
.cf-hero-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 22px;
  background:rgba(255,255,255,.09);backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,.14);border-radius:999px;
  font-size:13px;font-weight:600;color:#a7f3d0;
  margin-bottom:24px;letter-spacing:.3px;
}
.cf-hero-h1{
  font-family:'Playfair Display',serif;
  font-size:clamp(36px,7vw,70px);
  font-weight:800;color:#fff;
  line-height:1.05;margin-bottom:20px;letter-spacing:-.5px;
}
.cf-hero-h1 em{
  font-style:normal;
  background:linear-gradient(90deg,#6ee7b7,#a7f3d0,#d1fae5);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.cf-hero-p{
  font-size:clamp(15px,1.9vw,19px);color:rgba(255,255,255,.84);
  line-height:1.75;max-width:520px;margin:0 auto 36px;
}
.cf-hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.cf-scroll-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);z-index:2}
.cf-scroll-pill{width:26px;height:44px;border:2px solid rgba(255,255,255,.22);border-radius:13px;display:flex;justify-content:center;padding-top:8px}
.cf-scroll-dot{width:4px;height:9px;background:#fff;border-radius:2px}

/* ─── BUTTONS ───────────────────────────────── */
.cf-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:clamp(12px,1.5vw,15px) clamp(22px,3vw,32px);
  border-radius:13px;
  font-family:'Inter',sans-serif;
  font-size:clamp(13.5px,1.3vw,15px);font-weight:700;
  text-decoration:none;border:none;cursor:pointer;
  transition:all .32s cubic-bezier(.4,0,.2,1);
}
.cf-btn--white{background:#fff;color:#065f46;box-shadow:0 8px 26px rgba(0,0,0,.17)}
.cf-btn--white:hover{transform:translateY(-3px);box-shadow:0 16px 42px rgba(0,0,0,.22)}
.cf-btn--ghost{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);color:#fff;border:2px solid rgba(255,255,255,.2)}
.cf-btn--ghost:hover{background:rgba(255,255,255,.18);transform:translateY(-3px)}
.cf-btn--green{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 8px 22px rgba(6,78,59,.3)}
.cf-btn--green:hover{transform:translateY(-3px);box-shadow:0 14px 38px rgba(6,78,59,.42)}
.cf-btn--outline{background:#fff;color:#065f46;border:2px solid #059669}
.cf-btn--outline:hover{background:#ecfdf5;transform:translateY(-2px)}

/* ─── TRUST BAR ─────────────────────────────── */
.cf-trust{background:#064e3b;padding:0 clamp(16px,4vw,24px);box-shadow:0 4px 18px rgba(6,78,59,.26)}
.cf-trust-grid{
  display:grid;grid-template-columns:repeat(4,1fr);
  max-width:1280px;margin:0 auto;
}
.cf-trust-item{
  display:flex;align-items:center;gap:13px;
  padding:clamp(18px,2.5vw,26px) clamp(12px,1.8vw,20px);
  border-right:1px solid rgba(255,255,255,.07);
  transition:background .25s;
}
.cf-trust-item:last-child{border-right:none}
.cf-trust-item:hover{background:rgba(255,255,255,.04)}
.cf-trust-icon{
  width:42px;height:42px;border-radius:11px;
  background:rgba(255,255,255,.08);
  display:flex;align-items:center;justify-content:center;
  color:#6ee7b7;flex-shrink:0;
}
.cf-trust-val{font-size:clamp(16px,2vw,20px);font-weight:800;color:#fff;line-height:1.2}
.cf-trust-lbl{font-size:11.5px;color:rgba(255,255,255,.55);font-weight:500;margin-top:1px}

/* ─── SECTIONS ──────────────────────────────── */
.cf-section{
  padding:clamp(56px,8vw,96px) clamp(16px,4vw,24px);
  position:relative;overflow:hidden;
}
.cf-section--white{background:#fff}
.cf-section--soft{
  background:linear-gradient(180deg,#f0fdf4,#ecfdf5 60%,#f8fffe);
}
.cf-section--soft::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(circle at 8% 18%,rgba(6,78,59,.045) 0%,transparent 48%),
    radial-gradient(circle at 88% 72%,rgba(4,120,87,.035) 0%,transparent 48%);
}
.cf-cta{
  background:linear-gradient(135deg,#064e3b 0%,#065f46 45%,#047857 100%);
  text-align:center;
}
.cf-cta-pat{
  position:absolute;inset:0;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
}
.cf-cta-inner{position:relative;z-index:1;max-width:680px;margin:0 auto}
.cf-cta-icon{
  width:72px;height:72px;border-radius:50%;
  background:rgba(255,255,255,.1);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 22px;backdrop-filter:blur(4px);
}
.cf-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px}

.cf-wrap{max-width:1280px;margin:0 auto;position:relative;z-index:1}
.cf-wrap--sm{max-width:820px}
.cf-wrap--md{max-width:1060px}

.cf-hdr{text-align:center;margin-bottom:clamp(36px,5.5vw,60px)}
.cf-pill{
  display:inline-flex;align-items:center;gap:6px;
  padding:6px 16px;
  background:rgba(6,78,59,.08);border:1px solid rgba(6,78,59,.12);
  border-radius:999px;font-size:12px;font-weight:700;color:#065f46;
  margin-bottom:16px;
}
.cf-h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(26px,4.5vw,46px);
  font-weight:800;line-height:1.12;
  letter-spacing:-.4px;color:#0f172a;margin-bottom:12px;
}
.cf-h2 em{
  font-style:normal;
  background:linear-gradient(135deg,#065f46,#059669);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.cf-h2--white{color:#fff}
.cf-h2--white em{
  background:linear-gradient(90deg,#6ee7b7,#a7f3d0);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.cf-sub{font-size:clamp(14px,1.5vw,16.5px);color:#64748b;max-width:520px;margin:0 auto;line-height:1.72}
.cf-sub--light{color:rgba(255,255,255,.78)}

/* ─── TWO-COL LAYOUT ────────────────────────── */
.cf-two-col{
  display:grid;grid-template-columns:1fr;
  gap:clamp(28px,5vw,52px);align-items:start;
}
@media(min-width:1024px){.cf-two-col{grid-template-columns:5fr 7fr}}

/* ─── CONTACT INFO ──────────────────────────── */
.cf-info{display:flex;flex-direction:column;gap:clamp(12px,1.4vw,16px)}
.cf-info-h3{
  font-family:'Playfair Display',serif;
  font-size:clamp(20px,2.4vw,26px);font-weight:700;color:#0f172a;
}
.cf-info-p{font-size:clamp(13px,1.2vw,14.5px);color:#64748b;line-height:1.7}

.cf-card-link{
  display:flex;align-items:flex-start;gap:15px;
  padding:clamp(14px,1.8vw,20px) clamp(14px,2vw,22px);
  background:#fff;border-radius:16px;
  border:1px solid rgba(6,78,59,.06);
  box-shadow:0 2px 10px rgba(0,0,0,.024);
  text-decoration:none;color:inherit;
  transition:all .32s cubic-bezier(.4,0,.2,1);
  position:relative;overflow:hidden;
}
.cf-card-link::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,#065f46,#059669);
  border-radius:4px 0 0 4px;
  opacity:0;transition:opacity .28s;
}
.cf-card-link:hover{transform:translateX(5px);box-shadow:0 8px 26px rgba(6,78,59,.09);border-color:rgba(6,78,59,.12)}
.cf-card-link:hover::before{opacity:1}
.cf-card-icon{
  width:46px;height:46px;border-radius:13px;
  background:linear-gradient(135deg,#065f46,#047857);
  display:flex;align-items:center;justify-content:center;
  color:#fff;flex-shrink:0;
  box-shadow:0 4px 12px rgba(6,78,59,.26);
  transition:transform .28s;
}
.cf-card-link:hover .cf-card-icon{transform:rotate(-5deg) scale(1.06)}
.cf-card-body{flex:1;min-width:0}
.cf-card-title{font-size:clamp(13px,1.2vw,14.5px);font-weight:700;color:#0f172a;margin-bottom:3px}
.cf-card-line{font-size:clamp(12px,1.1vw,13px);color:#64748b;line-height:1.5}
.cf-card-ext{position:absolute;top:14px;right:14px;color:#cbd5e1;opacity:0;transition:opacity .28s}
.cf-card-link:hover .cf-card-ext{opacity:1}

/* User card */
.cf-user-card{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  border:1px solid #a7f3d0;border-radius:16px;
  box-shadow:0 4px 14px rgba(6,78,59,.07);
  position:relative;overflow:hidden;
}
.cf-user-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#065f46,#10b981,#065f46);
  background-size:200% 100%;
  animation:cf-flow 4s ease infinite;
}
.cf-user-av{
  width:46px;height:46px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#065f46,#047857);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(6,78,59,.24);
  border:2px solid rgba(255,255,255,.5);overflow:hidden;
}
.cf-user-meta{flex:1;min-width:0}
.cf-user-name{font-size:14px;font-weight:700;color:#064e3b}
.cf-user-email{font-size:12px;color:#065f46;opacity:.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cf-user-badge{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 9px;border-radius:999px;
  background:rgba(6,78,59,.1);border:1px solid rgba(6,78,59,.15);
  color:#065f46;font-size:10.5px;font-weight:700;
  white-space:nowrap;flex-shrink:0;
}

/* Socials */
.cf-socials{background:#fff;padding:clamp(16px,1.8vw,22px);border-radius:16px;border:1px solid rgba(6,78,59,.06);box-shadow:0 2px 10px rgba(0,0,0,.024)}
.cf-socials-title{font-size:13px;font-weight:700;color:#0f172a;margin-bottom:13px}
.cf-socials-row{display:flex;flex-wrap:wrap;gap:9px}
.cf-social{
  width:40px;height:40px;border-radius:11px;
  display:flex;align-items:center;justify-content:center;
  font-size:15px;text-decoration:none;
  background:#ecfdf5;color:#065f46;
  border:1px solid rgba(6,78,59,.08);
  transition:all .28s cubic-bezier(.4,0,.2,1);
}
.cf-social:hover{background:#065f46;color:#fff;box-shadow:0 7px 20px rgba(6,78,59,.26)}

/* ─── FORM PANEL ────────────────────────────── */
.cf-panel{
  background:#fff;border-radius:22px;
  padding:clamp(22px,4vw,42px);
  box-shadow:0 6px 34px rgba(0,0,0,.048);
  border:1px solid rgba(6,78,59,.07);
  position:relative;overflow:hidden;
}
.cf-panel::before{
  content:'';position:absolute;top:0;left:0;right:0;height:4px;
  background:linear-gradient(90deg,#064e3b,#047857,#10b981,#047857,#064e3b);
  background-size:200% 100%;
  animation:cf-flow 5s ease infinite;
}
@keyframes cf-flow{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Auto-fill banner */
.cf-banner{
  display:flex;align-items:center;gap:11px;
  padding:11px 14px;margin-bottom:18px;
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  border:1px solid #a7f3d0;border-radius:13px;
  position:relative;overflow:hidden;
}
.cf-banner::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:linear-gradient(180deg,#065f46,#10b981);
  border-radius:13px 0 0 13px;
}
.cf-banner-av{
  width:34px;height:34px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#065f46,#047857);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 10px rgba(6,78,59,.22);overflow:hidden;
}
.cf-banner-txt{flex:1;min-width:0}
.cf-banner-name{display:block;font-size:12.5px;font-weight:700;color:#064e3b}
.cf-banner-sub{display:block;font-size:11px;color:#065f46;opacity:.75;margin-top:1px}
.cf-banner-close{
  background:none;border:none;cursor:pointer;
  color:#065f46;opacity:.6;padding:3px;
  display:flex;align-items:center;flex-shrink:0;
  transition:opacity .2s;
}
.cf-banner-close:hover{opacity:1}

/* Completion bar */
.cf-prog{margin-bottom:24px}
.cf-prog-top{display:flex;justify-content:space-between;margin-bottom:6px}
.cf-prog-lbl{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.cf-prog-pct{font-size:11px;font-weight:700;color:#065f46}
.cf-prog-track{height:4px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.cf-prog-fill{height:100%;background:linear-gradient(90deg,#065f46,#059669);border-radius:2px}

/* Stepper */
.cf-stepper{
  display:flex;align-items:center;
  gap:0;margin-bottom:28px;
  background:#f8fafc;border-radius:14px;
  padding:14px 18px;border:1px solid #e2e8f0;
}
.cf-step{
  display:flex;align-items:center;gap:10px;
  cursor:pointer;flex:1;
  padding:2px 0;transition:opacity .25s;
}
.cf-step:not(.cf-step--active):not(.cf-step--done){opacity:.45}
.cf-step-circle{
  width:38px;height:38px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  border:2px solid #e2e8f0;background:#fff;color:#94a3b8;
  transition:all .3s cubic-bezier(.4,0,.2,1);
}
.cf-step--active .cf-step-circle{
  background:linear-gradient(135deg,#065f46,#047857);
  border-color:#065f46;color:#fff;
  box-shadow:0 4px 16px rgba(6,78,59,.3);
}
.cf-step--done .cf-step-circle{
  background:#047857;border-color:#047857;color:#fff;
}
.cf-step-meta{display:flex;flex-direction:column}
.cf-step-num{font-size:10px;font-weight:600;color:#94a3b8;letter-spacing:.3px;text-transform:uppercase}
.cf-step-lbl{font-size:13px;font-weight:700;color:#0f172a;line-height:1.3}
.cf-step--active .cf-step-lbl{color:#065f46}
.cf-step-line{
  flex:1;height:2px;background:#e2e8f0;
  margin:0 10px;border-radius:1px;
  transition:background .35s;
}
.cf-step-line--done{background:linear-gradient(90deg,#065f46,#059669)}

/* Step body */
.cf-step-body{min-height:260px;position:relative}
.cf-step-hd{margin-bottom:22px}
.cf-step-hd h4{
  font-family:'Playfair Display',serif;
  font-size:clamp(17px,2vw,21px);font-weight:700;color:#0f172a;margin-bottom:4px;
}
.cf-step-hd p{font-size:13.5px;color:#64748b;line-height:1.6}

/* Grid */
.cf-grid-2{
  display:grid;grid-template-columns:1fr 1fr;gap:0 16px;
}
@media(max-width:560px){.cf-grid-2{grid-template-columns:1fr}}

/* Optional block */
.cf-optional-block{
  margin-top:8px;padding:16px;
  background:#f8fafc;border-radius:13px;
  border:1px dashed #e2e8f0;
}
.cf-optional-lbl{
  display:flex;align-items:center;gap:6px;
  font-size:11.5px;font-weight:700;color:#94a3b8;
  text-transform:uppercase;letter-spacing:.4px;
  margin-bottom:14px;
}

/* Form fields */
.cf-field{margin-bottom:16px}
.cf-field--full{grid-column:1/-1}
.cf-label{
  display:flex;align-items:center;gap:6px;
  font-size:12.5px;font-weight:600;color:#334155;
  margin-bottom:6px;transition:color .25s;flex-wrap:wrap;
}
.cf-req{color:#ef4444;margin-left:1px}
.cf-autobadge{
  display:inline-flex;align-items:center;gap:3px;
  padding:2px 7px;border-radius:999px;
  background:#d1fae5;border:1px solid #a7f3d0;
  color:#065f46;font-size:10px;font-weight:700;
  letter-spacing:.2px;margin-left:4px;
}
.cf-input-wrap{position:relative;transition:all .28s}
.cf-input-wrap.is-focused .cf-input,
.cf-input-wrap.is-focused .cf-select{
  border-color:#065f46;background:#fff;
  box-shadow:0 0 0 4px rgba(6,78,59,.07);
}
.cf-input-wrap.is-error .cf-input{border-color:#ef4444}
.cf-input-wrap.is-ok .cf-input{border-color:#059669}
.cf-input-wrap.is-auto .cf-input{
  border-color:#a7f3d0;
  background:linear-gradient(135deg,#fff,#f0fdf4);
}
.cf-input,.cf-select{
  width:100%;
  padding:13px 40px 13px 14px;
  font-family:'Inter',sans-serif;font-size:14px;
  border:2px solid #e2e8f0;border-radius:12px;
  outline:none;background:#f8fafc;color:#1e293b;
  transition:all .28s cubic-bezier(.4,0,.2,1);
}
.cf-input::placeholder{color:#94a3b8}
.cf-select{appearance:none;cursor:pointer;padding-right:40px}
.cf-select-wrap{display:block}
.cf-sel-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;transition:color .25s}
.cf-icon-right{position:absolute;right:12px;top:50%;transform:translateY(-50%)}
.cf-err-msg{
  display:flex;align-items:center;gap:5px;
  font-size:11.5px;color:#ef4444;margin-top:4px;
  font-weight:500;overflow:hidden;
}

/* Textarea */
.cf-ta-wrap{display:block}
.cf-textarea{
  width:100%;
  padding:13px 14px 44px;
  font-family:'Inter',sans-serif;font-size:14px;
  border:2px solid #e2e8f0;border-radius:12px;
  outline:none;background:#f8fafc;color:#1e293b;
  min-height:140px;resize:vertical;
  transition:all .28s cubic-bezier(.4,0,.2,1);
}
.cf-textarea::placeholder{color:#94a3b8}
.cf-ta-wrap.is-focused .cf-textarea{
  border-color:#065f46;background:#fff;
  box-shadow:0 0 0 4px rgba(6,78,59,.07);
}
.cf-ta-wrap.is-error .cf-textarea{border-color:#ef4444}
.cf-ta-wrap.is-ok .cf-textarea{border-color:#059669}
.cf-char-row{
  display:flex;align-items:center;gap:10px;
  padding:8px 14px 10px;
}
.cf-char-track{flex:1;height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.cf-char-fill{height:100%;border-radius:2px}
.cf-char-cnt{font-size:11px;font-weight:500;color:#94a3b8;flex-shrink:0}

/* Emoji picker */
.cf-emoji-row{position:relative;display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
.cf-emoji-btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:9px 12px;border-radius:999px;
  border:1px solid #d1fae5;background:#ecfdf5;color:#065f46;
  font-size:12px;font-weight:700;cursor:pointer;
  transition:all .2s ease;
}
.cf-emoji-btn:hover{background:#d1fae5;border-color:#a7f3d0}
.cf-emoji-wrap{position:absolute;right:0;top:calc(100% + 8px);z-index:20}

/* Server error */
.cf-srv-err{
  display:flex;align-items:center;gap:8px;
  padding:12px 15px;
  background:#fef2f2;border:1px solid #fecaca;border-radius:12px;
  font-size:13.5px;color:#dc2626;font-weight:500;
  margin-bottom:14px;
}

/* Submit */
.cf-submit{
  width:100%;padding:16px 28px;
  border-radius:14px;border:none;cursor:pointer;
  background:linear-gradient(135deg,#064e3b,#047857);
  color:#fff;
  font-family:'Inter',sans-serif;font-size:15px;font-weight:700;
  display:flex;align-items:center;justify-content:center;gap:9px;
  box-shadow:0 6px 22px rgba(6,78,59,.28);
  position:relative;overflow:hidden;
  transition:box-shadow .3s;
  margin-top:4px;
}
.cf-submit:hover:not(:disabled){box-shadow:0 14px 36px rgba(6,78,59,.42)}
.cf-submit:disabled{opacity:.82;cursor:wait}
.cf-submit-bar{
  position:absolute;bottom:0;left:0;height:3px;
  background:rgba(255,255,255,.35);
  border-radius:0 2px 2px 0;
  transition:width .15s linear;
}
.cf-privacy{
  display:flex;align-items:center;justify-content:center;gap:6px;
  font-size:11.5px;color:#94a3b8;margin-top:14px;
}

/* Nav */
.cf-nav{
  display:flex;justify-content:space-between;align-items:center;
  margin-top:24px;gap:10px;border-top:1px solid #f1f5f9;
  padding-top:20px;
}
.cf-nav-back{
  display:inline-flex;align-items:center;gap:7px;
  padding:12px 22px;border-radius:12px;
  background:#f1f5f9;color:#475569;
  border:none;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;transition:background .22s;
}
.cf-nav-back:hover{background:#e2e8f0}
.cf-nav-next{
  display:inline-flex;align-items:center;gap:7px;
  padding:12px 26px;border-radius:12px;
  background:linear-gradient(135deg,#065f46,#047857);
  color:#fff;border:none;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:700;
  cursor:pointer;box-shadow:0 5px 18px rgba(6,78,59,.26);
  transition:box-shadow .28s;
}
.cf-nav-next:hover{box-shadow:0 10px 28px rgba(6,78,59,.38)}

/* ─── SUCCESS ────────────────────────────────── */
.cf-success{text-align:center;padding:clamp(28px,5vw,50px) 16px}
.cf-success-ring{
  width:92px;height:92px;border-radius:50%;
  background:linear-gradient(135deg,#065f46,#059669);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 24px;box-shadow:0 14px 38px rgba(6,78,59,.3);
}
.cf-success-h3{
  font-family:'Playfair Display',serif;
  font-size:clamp(22px,3vw,28px);font-weight:700;color:#0f172a;margin-bottom:11px;
}
.cf-success-p{font-size:clamp(13px,1.3vw,15px);color:#64748b;line-height:1.7;max-width:340px;margin:0 auto 22px}
.cf-success-tag{
  display:inline-block;background:#ecfdf5;
  padding:12px 24px;border-radius:13px;margin-bottom:26px;
  border:1px solid rgba(6,78,59,.1);
}
.cf-success-tag small{display:block;font-size:11.5px;color:#64748b;margin-bottom:2px}
.cf-success-tag strong{font-size:14.5px;color:#065f46}
.cf-success-actions{display:flex;gap:11px;justify-content:center;flex-wrap:wrap}

/* ─── QUICK CHANNELS ─────────────────────────── */
.cf-channels{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
.cf-ch-card{
  display:flex;flex-direction:column;align-items:center;
  text-align:center;
  padding:clamp(22px,3vw,32px) clamp(18px,2.5vw,26px);
  background:#fff;border-radius:20px;
  border:2px solid transparent;
  box-shadow:0 2px 14px rgba(0,0,0,.04);
  text-decoration:none;color:inherit;
  transition:all .32s cubic-bezier(.4,0,.2,1);
  position:relative;overflow:hidden;
}
.cf-ch-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,var(--ch-color,#065f46),transparent 70%);
  opacity:0;transition:opacity .32s;
  pointer-events:none;
}
.cf-ch-card:hover{
  border-color:var(--ch-color,#065f46);
  transform:translateY(-5px);
  box-shadow:0 16px 40px rgba(0,0,0,.08);
}
.cf-ch-card:hover::before{opacity:.05}
.cf-ch-icon{
  width:56px;height:56px;border-radius:16px;
  background:#ecfdf5;
  display:flex;align-items:center;justify-content:center;
  font-size:26px;color:var(--ch-color,#065f46);
  margin-bottom:14px;
  transition:all .28s;
}
.cf-ch-card:hover .cf-ch-icon{
  background:var(--ch-color,#065f46);color:#fff;
  box-shadow:0 8px 20px rgba(0,0,0,.18);
}
.cf-ch-title{font-size:17px;font-weight:700;color:#0f172a;margin-bottom:3px}
.cf-ch-sub{font-size:12px;color:#94a3b8;margin-bottom:8px}
.cf-ch-detail{font-size:13.5px;font-weight:600;color:var(--ch-color,#065f46)}
.cf-ch-arrow{
  margin-top:14px;width:32px;height:32px;border-radius:50%;
  background:#f1f5f9;
  display:flex;align-items:center;justify-content:center;
  color:#94a3b8;transition:all .28s;
}
.cf-ch-card:hover .cf-ch-arrow{background:var(--ch-color,#065f46);color:#fff}

/* ─── FAQ ────────────────────────────────────── */
.cf-faqs{display:flex;flex-direction:column;gap:10px}
.cf-faq{
  background:#fff;border-radius:16px;
  border:1px solid rgba(6,78,59,.06);
  box-shadow:0 2px 8px rgba(0,0,0,.022);
  overflow:hidden;
  transition:all .32s cubic-bezier(.4,0,.2,1);
  position:relative;
}
.cf-faq::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,#065f46,#059669);
  border-radius:4px 0 0 4px;
  opacity:0;transition:opacity .28s;
}
.cf-faq:hover,.cf-faq--open{box-shadow:0 6px 20px rgba(6,78,59,.08)}
.cf-faq:hover::before,.cf-faq--open::before{opacity:1}
.cf-faq-btn{
  width:100%;padding:clamp(15px,2vw,20px) clamp(16px,2.2vw,22px);
  display:flex;align-items:center;gap:13px;
  background:none;border:none;cursor:pointer;text-align:left;
}
.cf-faq-num{
  font-size:11.5px;font-weight:700;color:#065f46;
  background:rgba(6,78,59,.08);
  width:32px;height:32px;border-radius:9px;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .28s;
}
.cf-faq--open .cf-faq-num{
  background:linear-gradient(135deg,#065f46,#047857);color:#fff;
}
.cf-faq-q{
  flex:1;font-size:clamp(13.5px,1.3vw,15px);
  font-weight:650;color:#1e293b;line-height:1.44;
  transition:color .25s;
}
.cf-faq:hover .cf-faq-q{color:#065f46}
.cf-faq-chev{
  width:34px;height:34px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  background:#f1f5f9;color:#64748b;
  flex-shrink:0;transition:all .28s;
}
.cf-faq--open .cf-faq-chev{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 4px 12px rgba(6,78,59,.26)}
.cf-faq-body{
  padding:0 clamp(16px,2.2vw,22px) clamp(14px,2vw,20px) clamp(50px,5.5vw,65px);
  font-size:clamp(13px,1.2vw,14.5px);color:#475569;line-height:1.8;
  border-top:1px solid #f1f5f9;padding-top:14px;
}

/* FAQ loading/error states */
.cf-faq-state{
  display:flex;align-items:center;justify-content:center;gap:10px;
  padding:48px 20px;color:#94a3b8;font-size:15px;
}
.cf-faq-state--err{color:#ef4444}
.cf-spinner{
  width:22px;height:22px;border-radius:50%;
  border:3px solid #e2e8f0;
  border-top-color:#065f46;
  animation:cf-spin 0.7s linear infinite;
}
@keyframes cf-spin{to{transform:rotate(360deg)}}

/* ─── CHAT FAB ───────────────────────────────── */
.cf-fab{
  position:fixed;bottom:28px;right:28px;
  width:58px;height:58px;border-radius:50%;
  background:linear-gradient(135deg,#065f46,#047857);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 26px rgba(6,78,59,.36);
  z-index:900;
}
.cf-fab-pulse{
  position:absolute;inset:-4px;border-radius:50%;
  border:3px solid #059669;opacity:.5;
  animation:cf-pulse 2s ease-out infinite;
}
@keyframes cf-pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.55);opacity:0}}
.cf-fab-badge{
  position:absolute;top:-4px;right:-4px;
  background:#ef4444;color:#fff;
  font-size:10px;font-weight:700;
  padding:2px 6px;border-radius:999px;
  border:2px solid #fff;
  pointer-events:none;
}

/* ─── CHAT WINDOW ────────────────────────────── */
.cf-chat{
  position:fixed;bottom:28px;right:28px;
  width:clamp(300px,88vw,370px);
  background:#fff;border-radius:20px;
  box-shadow:0 22px 60px rgba(0,0,0,.15);
  overflow:hidden;z-index:950;
  display:flex;flex-direction:column;
  max-height:calc(100vh - 56px);
}
.cf-chat-head{
  background:linear-gradient(135deg,#064e3b,#047857);
  padding:14px 16px;
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.cf-chat-head-l{display:flex;align-items:center;gap:10px}
.cf-chat-av{
  width:38px;height:38px;border-radius:50%;
  background:rgba(255,255,255,.14);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.cf-chat-name{color:#fff;font-weight:700;font-size:14px}
.cf-chat-status{color:rgba(255,255,255,.72);font-size:11.5px;display:flex;align-items:center;gap:5px;margin-top:1px}
.cf-chat-dot{width:7px;height:7px;border-radius:50%;background:#94a3b8}
.cf-chat-dot.live{background:#4ade80;box-shadow:0 0 7px rgba(74,222,128,.5)}
.cf-chat-close{
  width:28px;height:28px;border-radius:50%;
  background:rgba(255,255,255,.14);border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:#fff;transition:background .2s;
}
.cf-chat-close:hover{background:rgba(255,255,255,.24)}
.cf-chat-body{flex:1;padding:16px;background:#f8fffe;overflow-y:auto;min-height:200px;max-height:300px}
.cf-chat-welcome{
  background:#fff;padding:16px;border-radius:14px;
  box-shadow:0 2px 8px rgba(0,0,0,.04);
}
.cf-chat-welcome-icon{
  width:42px;height:42px;border-radius:12px;
  background:#ecfdf5;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:10px;
}
.cf-chat-welcome p{font-size:13.5px;color:#1e293b;line-height:1.55;margin-bottom:6px}
.cf-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
.cf-chip{
  padding:6px 12px;background:#fff;
  border:1px solid #059669;border-radius:999px;
  font-size:11.5px;font-weight:600;color:#065f46;
  cursor:pointer;transition:all .2s;
}
.cf-chip:hover{background:#065f46;color:#fff;border-color:#065f46}
.cf-bubble{
  padding:11px 14px;border-radius:14px;
  max-width:88%;margin-bottom:10px;
  box-shadow:0 2px 7px rgba(0,0,0,.04);
}
.cf-bubble--user{
  background:linear-gradient(135deg,#065f46,#047857);
  margin-left:auto;border-radius:14px 14px 4px 14px;
}
.cf-bubble--user p{color:#fff}
.cf-bubble:not(.cf-bubble--user){
  background:#fff;margin-right:auto;
  border-radius:14px 14px 14px 4px;
}
.cf-bubble-who{display:block;font-size:10.5px;font-weight:700;color:#94a3b8;margin-bottom:3px}
.cf-bubble p{font-size:13.5px;line-height:1.5;margin:0 0 3px}
.cf-bubble-time{font-size:10px;color:#94a3b8;display:block;text-align:right}
.cf-bubble--user .cf-bubble-time{color:rgba(255,255,255,.6)}
.cf-chat-err{
  padding:8px 14px;margin:0 14px 10px;
  border-radius:10px;background:#fef2f2;
  color:#b91c1c;font-size:12px;
  display:flex;align-items:center;gap:6px;
  flex-shrink:0;
}
.cf-chat-foot{
  padding:10px 12px;border-top:1px solid #e2e8f0;
  display:flex;gap:8px;align-items:center;flex-shrink:0;
}
.cf-chat-in{
  flex:1;padding:9px 14px;
  border:1.5px solid #e2e8f0;border-radius:999px;
  font-family:'Inter',sans-serif;font-size:13.5px;
  outline:none;transition:border-color .22s;
}
.cf-chat-in:focus{border-color:#065f46}
.cf-chat-send{
  width:38px;height:38px;border-radius:50%;
  background:linear-gradient(135deg,#065f46,#059669);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 11px rgba(6,78,59,.22);flex-shrink:0;
  transition:box-shadow .22s;
}
.cf-chat-send:hover:not(:disabled){box-shadow:0 7px 18px rgba(6,78,59,.34)}
.cf-chat-send:disabled{opacity:.55;cursor:not-allowed}

/* ─── SPINNER ────────────────────────────────── */
.cf-spin{animation:cf-spin .7s linear infinite}

/* ─── RESPONSIVE ─────────────────────────────── */
@media(max-width:1024px){
  .cf-trust-grid{grid-template-columns:repeat(2,1fr)}
  .cf-trust-item:nth-child(2){border-right:none}
}
@media(max-width:768px){
  .cf-hero{min-height:68vh}
  .cf-stepper{flex-wrap:wrap;gap:8px}
  .cf-step-line{display:none}
}
@media(max-width:640px){
  .cf-trust-grid{grid-template-columns:1fr 1fr}
  .cf-trust-item{padding:14px 10px}
}
@media(max-width:520px){
  .cf-hero-btns,.cf-cta-btns,.cf-success-actions{flex-direction:column;align-items:stretch}
  .cf-btn{justify-content:center}
  .cf-nav{flex-direction:column}
  .cf-nav-back,.cf-nav-next{width:100%;justify-content:center}
  .cf-trust-grid{grid-template-columns:1fr}
  .cf-trust-item{border-right:none;border-bottom:1px solid rgba(255,255,255,.07)}
  .cf-trust-item:last-child{border-bottom:none}
  .cf-chat{bottom:0;right:0;width:100vw;border-radius:20px 20px 0 0;max-height:85vh}
  .cf-fab{bottom:18px;right:18px}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
}
`;

export default Contact;