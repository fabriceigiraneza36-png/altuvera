import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiMessageSquare,
  FiCheckCircle,
  FiUser,
  FiAlertCircle,
  FiChevronDown,
  FiCalendar,
  FiUsers,
  FiGlobe,
  FiStar,
  FiArrowRight,
  FiArrowLeft,
  FiMessageCircle,
  FiHelpCircle,
  FiShield,
  FiHeadphones,
  FiX,
} from "react-icons/fi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import herobg from "../assets/fabrice.jpg";

/* ══════════════════════════════
   VALIDATION
   ══════════════════════════════ */
const rules = {
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s'-]+$/,
    msg: {
      required: "Full name is required",
      minLength: "At least 2 characters",
      pattern: "Enter a valid name",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    msg: { required: "Email is required", pattern: "Enter a valid email" },
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    msg: { pattern: "Enter a valid phone number" },
  },
  subject: {
    required: true,
    minLength: 5,
    msg: {
      required: "Subject is required",
      minLength: "At least 5 characters",
    },
  },
  message: {
    required: true,
    minLength: 20,
    msg: {
      required: "Message is required",
      minLength: "At least 20 characters",
    },
  },
};
const validate = (n, v) => {
  const r = rules[n];
  if (!r) return "";
  if (r.required && !v?.trim()) return r.msg.required;
  if (v && r.minLength && v.length < r.minLength) return r.msg.minLength;
  if (v && r.pattern && !r.pattern.test(v)) return r.msg.pattern;
  return "";
};

/* ══════════════════════════════
   SCROLL SECTION WRAPPER
   ══════════════════════════════ */
const ScrollReveal = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
  style = {},
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: -50 },
    right: { x: 50 },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.68, 0.35, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════
   FIELD COMPONENTS
   ══════════════════════════════ */
const FieldInput = ({
  name,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  onBlur,
  error,
  touched,
  full,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const valid = touched && !error && value;
  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: hasErr ? "#ef4444" : focused ? "#059669" : undefined }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.6 }} />} {label}
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-field-wrap ${focused ? "focused" : ""}`}>
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`ct-input ${hasErr ? "err" : valid ? "ok" : ""}`}
        />
        <div className="ct-underline" />
        {hasErr && (
          <span className="ct-status">
            <FiAlertCircle size={17} color="#ef4444" />
          </span>
        )}
        {valid && (
          <span className="ct-status">
            <FiCheckCircle size={17} color="#059669" />
          </span>
        )}
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.div
            className="ct-field-err"
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
};

const FieldSelect = ({
  name,
  label,
  icon: Icon,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  full,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: focused ? "#059669" : undefined }}
      >
        {Icon && <Icon size={13} style={{ opacity: 0.6 }} />} {label}
      </label>
      <div className={`ct-field-wrap ${focused ? "focused" : ""}`}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
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
          style={{ color: focused ? "#059669" : "#94a3b8" }}
        >
          <FiChevronDown size={18} />
        </span>
      </div>
    </div>
  );
};

const FieldTextarea = ({
  name,
  label,
  placeholder,
  required,
  maxLength = 2000,
  value,
  onChange,
  onBlur,
  error,
  touched,
  full,
}) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const valid = touched && !error && value;
  const ct = value?.length || 0;
  const pct = (ct / maxLength) * 100;
  return (
    <div className={`ct-field ${full ? "ct-field--full" : ""}`}>
      <label
        className="ct-field-label"
        style={{ color: hasErr ? "#ef4444" : focused ? "#059669" : undefined }}
      >
        <FiMessageSquare size={13} style={{ opacity: 0.6 }} /> {label}
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
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`ct-textarea ${hasErr ? "err" : valid ? "ok" : ""}`}
        />
        <div className="ct-underline" />
        <div className="ct-char">
          <div className="ct-char-track">
            <div
              className="ct-char-fill"
              style={{
                width: `${pct}%`,
                background:
                  pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#059669",
              }}
            />
          </div>
          <span
            className="ct-char-num"
            style={{ color: pct > 90 ? "#ef4444" : "#94a3b8" }}
          >
            {ct}/{maxLength}
          </span>
        </div>
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.div
            className="ct-field-err"
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
};

/* ══════════════════════════════
   STEP ANIMATION VARIANTS
   ══════════════════════════════ */
const stepVariants = [
  // Step 1: slide from right + fade
  {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  },
  // Step 2: scale up + fade
  {
    initial: { opacity: 0, scale: 0.88, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.88, y: -30 },
  },
  // Step 3: slide from bottom + rotate subtle
  {
    initial: { opacity: 0, y: 50, rotateX: 8 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit: { opacity: 0, y: -40, rotateX: -6 },
  },
];

/* ══════════════════════════════
   MAIN CONTACT COMPONENT
   ══════════════════════════════ */
const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    tripType: "",
    travelDate: "",
    travelers: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMin, setChatMin] = useState(false);
  const faqRefs = useRef({});

  const formRef = useRef(null);
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: "-60px" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (touched[name])
      setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };

  // Step validation
  const stepFields = [
    ["name", "email", "phone"],
    ["tripType", "travelDate", "travelers"],
    ["subject", "message"],
  ];
  const validateStep = (s) => {
    const errs = {};
    stepFields[s].forEach((f) => {
      const err = validate(f, form[f]);
      if (err) errs[f] = err;
    });
    setErrors((p) => ({ ...p, ...errs }));
    const t = {};
    stepFields[s].forEach((f) => (t[f] = true));
    setTouched((p) => ({ ...p, ...t }));
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setSubmitting(true);
    setProgress(0);
    const iv = setInterval(
      () => setProgress((p) => (p >= 90 ? 90 : p + 10)),
      120,
    );
    await new Promise((r) => setTimeout(r, 2200));
    clearInterval(iv);
    setProgress(100);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(0);
    setDirection(1);
    setProgress(0);
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      tripType: "",
      travelDate: "",
      travelers: "",
    });
    setTouched({});
    setErrors({});
  };

  const contactCards = [
    {
      icon: FiMapPin,
      title: "Visit Our Office",
      lines: ["Altuvera House, Safari Way", "Westlands, Nairobi, Kenya"],
    },
    {
      icon: FiPhone,
      title: "Call Us",
      lines: ["+254 700 123 456", "+254 733 987 654"],
    },
    {
      icon: FiMail,
      title: "Email Us",
      lines: ["hello@altuvera.com", "bookings@altuvera.com"],
    },
    {
      icon: FiClock,
      title: "Working Hours",
      lines: ["Mon – Fri: 8 AM – 6 PM EAT", "Sat: 9 AM – 2 PM EAT"],
    },
  ];

  const tripTypes = [
    "🦁 Safari Adventure",
    "⛰️ Mountain Trekking",
    "🦍 Gorilla Trekking",
    "🏖️ Beach Holiday",
    "🎭 Cultural Tour",
    "📷 Photography Safari",
    "💕 Honeymoon",
    "👨‍👩‍👧‍👦 Family Trip",
  ];
  const travelerOpts = [
    "1 — Solo",
    "2 — Couple / Duo",
    "3–4 — Small Group",
    "5–8 — Group",
    "9+ — Large Group",
  ];

  const socials = [
    { icon: FaFacebookF, label: "Facebook", url: "#" },
    { icon: FaInstagram, label: "Instagram", url: "#" },
    { icon: FaTwitter, label: "Twitter", url: "#" },
    { icon: FaYoutube, label: "YouTube", url: "#" },
    { icon: FaWhatsapp, label: "WhatsApp", url: "#" },
    { icon: FaTiktok, label: "TikTok", url: "#" },
  ];

  const faqs = [
    {
      q: "How far in advance should I book my safari?",
      a: "We recommend 3–6 months ahead, especially for peak season (June–October, December–February). This ensures the best lodge availability and gorilla permits.",
    },
    {
      q: "What is included in your safari packages?",
      a: "Accommodation, all meals, game drives, park fees, airport transfers, and a professional guide. International flights are usually excluded.",
    },
    {
      q: "Is it safe to go on safari in East Africa?",
      a: "Absolutely. East Africa has a strong tourism safety record. Our experienced guides and vetted partners ensure your wellbeing throughout.",
    },
    {
      q: "Can you build a fully custom itinerary?",
      a: "Yes — that's our specialty. Share your interests, dates, and budget and we'll craft a bespoke journey for you.",
    },
  ];

  const quickChannels = [
    {
      icon: FaWhatsapp,
      title: "WhatsApp",
      sub: "Chat instantly",
      detail: "+254 700 123 456",
      href: "https://wa.me/254700123456",
    },
    {
      icon: FiPhone,
      title: "Call Us",
      sub: "Speak with an expert",
      detail: "+254 700 123 456",
      href: "tel:+254700123456",
    },
    {
      icon: FiMail,
      title: "Email",
      sub: "Get detailed info",
      detail: "hello@altuvera.com",
      href: "mailto:hello@altuvera.com",
    },
  ];

  const stepLabels = ["Personal Info", "Trip Details", "Your Message"];
  const stepIcons = [FiUser, FiGlobe, FiMessageSquare];

  return (
    <div className="ct">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.ct{font-family:'Inter',sans-serif;color:#1e293b;background:#fff;-webkit-font-smoothing:antialiased}

/* ═══ HERO ═══ */
.ct-hero{position:relative;min-height:72vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ct-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;will-change:transform}
.ct-hero-overlay{position:absolute;inset:0;background:linear-gradient(170deg,rgba(249, 255, 249, 0.24) 0%,rgba(5,150,105,.68) 50%,rgba(16,185,129,.55) 100%)}
.ct-hero-inner{position:relative;z-index:2;text-align:center;padding:0 24px;max-width:800px}
.ct-hero-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 22px;background:rgba(255,255,255,.1);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:50px;font-size:13px;font-weight:600;color:#d1fae5;margin-bottom:26px}
.ct-hero-title{font-family:'Playfair Display',serif;font-size:clamp(34px,7vw,66px);font-weight:800;color:#fff;line-height:1.08;margin-bottom:22px;letter-spacing:-.5px}
.ct-hero-title em{font-style:normal;background:linear-gradient(90deg,#6ee7b7,#a7f3d0,#d1fae5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-hero-desc{font-size:clamp(15px,2vw,18px);color:rgba(255,255,255,.88);line-height:1.7;max-width:540px;margin:0 auto 38px}
.ct-hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.ct-btn{display:inline-flex;align-items:center;gap:10px;padding:16px 32px;border-radius:16px;font-family:'Inter',sans-serif;font-size:15px;font-weight:650;text-decoration:none;border:none;cursor:pointer;transition:all .4s cubic-bezier(.4,0,.2,1)}
.ct-btn--white{background:#fff;color:#059669;box-shadow:0 8px 28px rgba(0,0,0,.16)}
.ct-btn--white:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.2)}
.ct-btn--ghost{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);color:#fff;border:2px solid rgba(255,255,255,.22)}
.ct-btn--ghost:hover{background:rgba(255,255,255,.18);transform:translateY(-3px)}
.ct-btn--green{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 8px 28px rgba(5,150,105,.3)}
.ct-btn--green:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(5,150,105,.38)}
.ct-btn--outline{background:#fff;color:#059669;border:2px solid #059669}
.ct-btn--outline:hover{background:#f0fdf4;transform:translateY(-2px)}
.ct-hero-scroll{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:2}
.ct-scroll-pill{width:28px;height:44px;border:2px solid rgba(255,255,255,.25);border-radius:14px;display:flex;justify-content:center;padding-top:9px}
.ct-scroll-dot{width:4px;height:9px;background:#fff;border-radius:2px}

/* ═══ SECTION COMMON ═══ */
.ct-section{padding:100px 24px;position:relative;overflow:hidden}
.ct-section--white{background:#fff}
.ct-section--green-light{background:linear-gradient(180deg,#f0fdf4,#ecfdf5 50%,#f8fffe)}
.ct-section--green-light::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 12% 25%,rgba(5,150,105,.04) 0%,transparent 50%),radial-gradient(circle at 88% 70%,rgba(16,185,129,.04) 0%,transparent 50%);pointer-events:none}
.ct-section--dark{background:linear-gradient(135deg,#064e3b 0%,#059669 60%,#10b981 100%);color:#fff}
.ct-wrap{max-width:1340px;margin:0 auto;position:relative;z-index:1}
.ct-wrap--sm{max-width:860px}
.ct-wrap--md{max-width:1100px}

/* Headers */
.ct-hdr{text-align:center;margin-bottom:64px}
.ct-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;background:linear-gradient(135deg,rgba(5,150,105,.1),rgba(16,185,129,.06));border:1px solid rgba(5,150,105,.12);border-radius:50px;font-size:13px;font-weight:600;color:#059669;margin-bottom:20px}
.ct-badge--light{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.18);color:#d1fae5}
.ct-title{font-family:'Playfair Display',serif;font-size:clamp(28px,5vw,48px);font-weight:800;line-height:1.12;letter-spacing:-.5px;margin-bottom:14px}
.ct-title--dark{color:#0f172a}
.ct-title--white{color:#fff}
.ct-title em{font-style:normal;background:linear-gradient(135deg,#059669,#10b981,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-title--white em{background:linear-gradient(90deg,#6ee7b7,#a7f3d0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-subtitle{font-size:17px;color:#64748b;max-width:520px;margin:0 auto;line-height:1.7}
.ct-subtitle--light{color:rgba(255,255,255,.82)}

/* ═══ GRID ═══ */
.ct-grid{display:grid;grid-template-columns:1fr;gap:40px}
@media(min-width:1024px){.ct-grid{grid-template-columns:5fr 7fr;gap:48px}}

/* ─── Info Column ─── */
.ct-info{display:flex;flex-direction:column;gap:16px}
.ct-info-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#0f172a;margin-bottom:6px}
.ct-info-desc{font-size:15px;color:#64748b;line-height:1.7;margin-bottom:10px}
.ct-card{display:flex;gap:16px;padding:20px 22px;background:#fff;border-radius:18px;border:1px solid rgba(5,150,105,.06);box-shadow:0 2px 10px rgba(0,0,0,.03);transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.ct-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#059669,#10b981);border-radius:4px 0 0 4px;opacity:0;transition:opacity .3s}
.ct-card:hover{transform:translateX(6px);box-shadow:0 8px 28px rgba(5,150,105,.08);border-color:rgba(5,150,105,.12)}
.ct-card:hover::before{opacity:1}
.ct-card-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#059669,#10b981);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 4px 14px rgba(5,150,105,.25);transition:transform .3s}
.ct-card:hover .ct-card-icon{transform:rotate(-6deg) scale(1.06)}
.ct-card-title{font-size:15px;font-weight:700;color:#0f172a;margin-bottom:5px}
.ct-card-line{font-size:13.5px;color:#64748b;line-height:1.5}

.ct-socials{background:#fff;padding:24px;border-radius:18px;box-shadow:0 2px 10px rgba(0,0,0,.03);border:1px solid rgba(5,150,105,.06)}
.ct-socials-title{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:16px}
.ct-socials-row{display:flex;flex-wrap:wrap;gap:10px}
.ct-social{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;text-decoration:none;background:#f0fdf4;color:#059669;border:1px solid rgba(5,150,105,.08);transition:all .3s cubic-bezier(.4,0,.2,1)}
.ct-social:hover{background:#059669;color:#fff;transform:translateY(-3px);box-shadow:0 8px 20px rgba(5,150,105,.3);border-color:#059669}

/* ─── Form Card ─── */
.ct-form-card{background:#fff;border-radius:28px;padding:clamp(28px,5vw,48px);box-shadow:0 6px 36px rgba(0,0,0,.05);border:1px solid rgba(5,150,105,.06);position:relative;overflow:hidden}
.ct-form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#059669,#10b981,#34d399,#10b981,#059669);background-size:200% 100%;animation:ct-shimmer 4s ease infinite}
@keyframes ct-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Step indicator */
.ct-steps{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:40px;position:relative}
.ct-step-item{display:flex;align-items:center;gap:0}
.ct-step-circle{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:2px solid #e2e8f0;background:#fff;color:#94a3b8;transition:all .4s cubic-bezier(.4,0,.2,1);position:relative;z-index:2;cursor:pointer}
.ct-step-circle.active{background:linear-gradient(135deg,#059669,#10b981);border-color:#059669;color:#fff;box-shadow:0 4px 16px rgba(5,150,105,.3)}
.ct-step-circle.done{background:#059669;border-color:#059669;color:#fff}
.ct-step-line{width:clamp(32px,6vw,64px);height:3px;background:#e2e8f0;border-radius:2px;transition:background .4s}
.ct-step-line.filled{background:linear-gradient(90deg,#059669,#10b981)}
.ct-step-label{position:absolute;top:52px;font-size:11.5px;font-weight:600;color:#94a3b8;white-space:nowrap;transition:color .3s}
.ct-step-circle.active+.ct-step-label,.ct-step-circle.active~.ct-step-label{color:#059669}
.ct-step-labels{display:flex;justify-content:space-between;margin-top:8px;padding:0 4px}
.ct-step-labels span{font-size:12px;font-weight:600;color:#94a3b8;transition:color .3s;text-align:center;flex:1}
.ct-step-labels span.active{color:#059669}
.ct-step-labels span.done{color:#059669}

/* Form fields */
.ct-form-body{position:relative;min-height:280px;perspective:1000px}
.ct-form-step{width:100%}
.ct-form-row{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
@media(max-width:640px){.ct-form-row{grid-template-columns:1fr}}
.ct-field{margin-bottom:20px}
.ct-field--full{grid-column:1/-1}
.ct-field-label{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#334155;margin-bottom:8px;transition:color .3s}
.ct-req{color:#ef4444;margin-left:2px}
.ct-field-wrap{position:relative}
.ct-input,.ct-select,.ct-textarea{width:100%;padding:14px 44px 14px 17px;font-family:'Inter',sans-serif;font-size:14.5px;border:2px solid #e2e8f0;border-radius:14px;outline:none;background:#f8fafc;color:#1e293b;transition:all .35s cubic-bezier(.4,0,.2,1)}
.ct-input::placeholder,.ct-textarea::placeholder{color:#94a3b8}
.ct-input:focus,.ct-select:focus,.ct-textarea:focus{border-color:#059669;background:#fff;box-shadow:0 0 0 4px rgba(5,150,105,.07)}
.ct-input.err,.ct-textarea.err{border-color:#ef4444}
.ct-input.err:focus,.ct-textarea.err:focus{box-shadow:0 0 0 4px rgba(239,68,68,.07)}
.ct-input.ok{border-color:#10b981}
.ct-select{appearance:none;cursor:pointer;padding-right:44px}
.ct-sel-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;transition:color .3s}
.ct-textarea{min-height:140px;resize:vertical;padding-bottom:40px}
.ct-underline{position:absolute;bottom:0;left:5%;width:90%;height:3px;background:linear-gradient(90deg,#059669,#10b981,#34d399);border-radius:0 0 14px 14px;transform:scaleX(0);transform-origin:center;transition:transform .35s cubic-bezier(.4,0,.2,1)}
.ct-field-wrap.focused .ct-underline{transform:scaleX(1)}
.ct-status{position:absolute;right:14px;top:50%;transform:translateY(-50%)}
.ct-field-err{display:flex;align-items:center;gap:5px;font-size:12px;color:#ef4444;margin-top:6px;font-weight:500;overflow:hidden}
.ct-char{position:absolute;bottom:11px;left:15px;right:15px;display:flex;align-items:center;gap:10px}
.ct-char-track{flex:1;height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.ct-char-fill{height:100%;border-radius:2px;transition:width .3s,background .3s}
.ct-char-num{font-size:11px;font-weight:500;flex-shrink:0}

/* Form nav */
.ct-form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:28px;gap:14px}
.ct-form-nav-left,.ct-form-nav-right{display:flex;gap:12px}
.ct-nav-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:14px;font-family:'Inter',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;border:none;transition:all .35s cubic-bezier(.4,0,.2,1)}
.ct-nav-btn--back{background:#f0fdf4;color:#059669;border:2px solid rgba(5,150,105,.15)}
.ct-nav-btn--back:hover{background:#d1fae5;transform:translateY(-2px)}
.ct-nav-btn--next{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 6px 20px rgba(5,150,105,.25)}
.ct-nav-btn--next:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(5,150,105,.32)}
.ct-nav-btn--submit{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 6px 20px rgba(5,150,105,.25);width:100%;justify-content:center;padding:18px 32px;font-size:15.5px;border-radius:16px;position:relative;overflow:hidden}
.ct-nav-btn--submit:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 14px 40px rgba(5,150,105,.35)}
.ct-nav-btn--submit:disabled{opacity:.8;cursor:wait}
.ct-progress{position:absolute;bottom:0;left:0;height:4px;background:rgba(255,255,255,.35);border-radius:0 2px 2px 0;transition:width .15s}

.ct-privacy{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;color:#94a3b8;margin-top:16px}

/* Step heading */
.ct-step-heading{margin-bottom:28px}
.ct-step-heading h4{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#0f172a;margin-bottom:6px}
.ct-step-heading p{font-size:14px;color:#64748b;line-height:1.6}

/* ═══ SUCCESS ═══ */
.ct-success{text-align:center;padding:48px 16px}
.ct-success-icon{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);display:flex;align-items:center;justify-content:center;margin:0 auto 26px;box-shadow:0 12px 40px rgba(5,150,105,.3)}
.ct-success-title{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#0f172a;margin-bottom:12px}
.ct-success-text{font-size:15px;color:#64748b;line-height:1.7;max-width:360px;margin:0 auto 26px}
.ct-success-email{display:inline-block;background:#f0fdf4;padding:14px 24px;border-radius:14px;margin-bottom:28px;border:1px solid rgba(5,150,105,.1)}
.ct-success-email small{display:block;font-size:12.5px;color:#64748b;margin-bottom:3px}
.ct-success-email strong{font-size:16px;color:#059669}
.ct-success-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* ═══ FAQ ═══ */
.ct-faq-list{display:flex;flex-direction:column;gap:14px}
.ct-faq-item{background:#fff;border-radius:18px;border:1px solid rgba(5,150,105,.06);box-shadow:0 2px 8px rgba(0,0,0,.025);overflow:hidden;transition:all .4s cubic-bezier(.4,0,.2,1);position:relative}
.ct-faq-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#059669,#10b981,#34d399);opacity:0;transition:opacity .3s;border-radius:4px 0 0 4px}
.ct-faq-item:hover{box-shadow:0 6px 22px rgba(5,150,105,.07);border-color:rgba(5,150,105,.1)}
.ct-faq-item:hover::before,.ct-faq-item.open::before{opacity:1}
.ct-faq-item.open{box-shadow:0 8px 28px rgba(5,150,105,.09);border-color:rgba(5,150,105,.12)}
.ct-faq-btn{width:100%;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:none;border:none;cursor:pointer;text-align:left}
.ct-faq-num{font-family:'Playfair Display',serif;font-size:12.5px;font-weight:700;color:#059669;background:linear-gradient(135deg,rgba(5,150,105,.08),rgba(16,185,129,.05));width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}
.ct-faq-item.open .ct-faq-num{background:linear-gradient(135deg,#059669,#10b981);color:#fff}
.ct-faq-q{flex:1;font-size:15.5px;font-weight:640;color:#1e293b;line-height:1.45;transition:color .3s}
.ct-faq-item:hover .ct-faq-q{color:#059669}
.ct-faq-toggle{width:36px;height:36px;border-radius:12px;border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:all .35s cubic-bezier(.4,0,.2,1)}
.ct-faq-toggle.closed{background:#f0fdf4;color:#059669}
.ct-faq-toggle.opened{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 4px 12px rgba(5,150,105,.25)}
.ct-faq-toggle svg{transition:transform .4s cubic-bezier(.4,0,.2,1)}
.ct-faq-toggle.opened svg{transform:rotate(180deg)}
.ct-faq-answer-inner{padding:0 24px 22px 70px;font-size:14.5px;color:#475569;line-height:1.8;position:relative}
.ct-faq-answer-inner::before{content:'';position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent)}
.ct-faq-answer-inner p{margin:0;padding-top:16px}
@media(max-width:640px){.ct-faq-answer-inner{padding-left:24px}}

/* ═══ QUICK CHANNELS ═══ */
.ct-quick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:18px}
.ct-quick-card{display:flex;align-items:center;gap:16px;padding:26px 24px;background:#fff;border-radius:18px;border:2px solid transparent;box-shadow:0 2px 10px rgba(0,0,0,.03);text-decoration:none;transition:all .4s cubic-bezier(.4,0,.2,1)}
.ct-quick-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(5,150,105,.1);border-color:rgba(5,150,105,.2)}
.ct-quick-icon{width:52px;height:52px;border-radius:14px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#059669;transition:all .3s}
.ct-quick-card:hover .ct-quick-icon{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 6px 18px rgba(5,150,105,.25)}
.ct-quick-title{font-size:17px;font-weight:700;color:#0f172a;margin-bottom:2px}
.ct-quick-sub{font-size:12.5px;color:#94a3b8;margin-bottom:5px}
.ct-quick-detail{font-size:14.5px;font-weight:600;color:#059669}

/* ═══ CTA PATTERN ═══ */
.ct-cta-pattern{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");pointer-events:none}
.ct-cta-icon{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.ct-cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

/* ═══ CHAT ═══ */
.ct-chat-btn{position:fixed;bottom:26px;right:26px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(5,150,105,.35);z-index:999;transition:transform .3s}
.ct-chat-btn:hover{transform:scale(1.1)}
.ct-chat-pulse{position:absolute;inset:0;border-radius:50%;border:3px solid #059669;animation:ct-pulse 2s ease-out infinite}
@keyframes ct-pulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.5);opacity:0}}
.ct-chat-window{position:fixed;bottom:26px;right:26px;width:360px;max-width:calc(100vw - 52px);background:#fff;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.14);overflow:hidden;z-index:1000;display:flex;flex-direction:column}
.ct-chat-head{background:linear-gradient(135deg,#059669,#10b981);padding:16px 18px;display:flex;align-items:center;justify-content:space-between}
.ct-chat-head-left{display:flex;align-items:center;gap:11px}
.ct-chat-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center}
.ct-chat-name{color:#fff;font-weight:600;font-size:14.5px}
.ct-chat-status{color:rgba(255,255,255,.8);font-size:12px;display:flex;align-items:center;gap:5px}
.ct-chat-dot{width:7px;height:7px;border-radius:50%;background:#4ade80}
.ct-chat-head-btns{display:flex;gap:5px}
.ct-chat-hbtn{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.15);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .2s}
.ct-chat-hbtn:hover{background:rgba(255,255,255,.28)}
.ct-chat-body{flex:1;padding:18px;background:#f8fffe;overflow-y:auto;max-height:300px}
.ct-chat-bubble{background:#fff;padding:13px 15px;border-radius:14px 14px 14px 4px;max-width:85%;box-shadow:0 2px 6px rgba(0,0,0,.04);margin-bottom:12px}
.ct-chat-bubble p{font-size:13.5px;color:#1e293b;line-height:1.5;margin:0 0 5px}
.ct-chat-bubble p:last-child{margin-bottom:0}
.ct-chat-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ct-chat-chip{padding:6px 13px;background:#fff;border:1px solid #059669;border-radius:50px;font-size:12px;font-weight:500;color:#059669;cursor:pointer;transition:all .2s}
.ct-chat-chip:hover{background:#059669;color:#fff}
.ct-chat-footer{padding:13px;border-top:1px solid #e2e8f0;display:flex;gap:9px}
.ct-chat-input{flex:1;padding:10px 15px;border:1px solid #e2e8f0;border-radius:50px;font-size:13.5px;outline:none;transition:border-color .3s}
.ct-chat-input:focus{border-color:#059669}
.ct-chat-send{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s}
.ct-chat-send:hover{transform:scale(1.06)}

/* ═══ RESPONSIVE ═══ */
@media(max-width:768px){
  .ct-hero{min-height:60vh}
  .ct-section{padding:64px 16px}
  .ct-hdr{margin-bottom:44px}
  .ct-info{gap:12px}
  .ct-step-labels span{font-size:10.5px}
}
@media(max-width:480px){
  .ct-hero-btns,.ct-cta-btns,.ct-success-btns{flex-direction:column;align-items:stretch}
  .ct-btn,.ct-success-btns>*{justify-content:center;width:100%}
  .ct-form-nav{flex-direction:column}
  .ct-form-nav-left,.ct-form-nav-right{width:100%}
  .ct-nav-btn{width:100%;justify-content:center}
  .ct-steps{gap:0}
  .ct-step-line{width:24px}
}

/* Scrollbar */
::-webkit-scrollbar{width:7px}
::-webkit-scrollbar-track{background:#f0fdf4}
::-webkit-scrollbar-thumb{background:#059669;border-radius:4px}
::selection{background:#059669;color:#fff}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>

      {/* ════════ HERO ════════ */}
      <section className="ct-hero">
        <motion.div
          className="ct-hero-bg"
          style={{ backgroundImage: `url(${herobg})` }}
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        />
        <div className="ct-hero-overlay" />

        <div className="ct-hero-inner">
          <motion.div
            className="ct-hero-badge"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.65 }}
          >
            <HiSparkles size={15} color="#34d399" />
            Your Safari Adventure Starts Here
          </motion.div>

          <motion.h1
            className="ct-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.75 }}
          >
            Let's Plan Your
            <br />
            <em>Dream Safari</em>
          </motion.h1>

          <motion.p
            className="ct-hero-desc"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Connect with our expert team and let us craft an unforgettable
            African adventure tailored just for you.
          </motion.p>

          <motion.div
            className="ct-hero-btns"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <a href="#contact-form" className="ct-btn ct-btn--white">
              <FiSend size={16} /> Send Message
            </a>
            <a href="tel:+254700123456" className="ct-btn ct-btn--ghost">
              <FiPhone size={16} /> Call Us Now
            </a>
          </motion.div>
        </div>

        <motion.div
          className="ct-hero-scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="ct-scroll-pill">
            <motion.div
              className="ct-scroll-dot"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ════════ MAIN FORM SECTION ════════ */}
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
                experts are here to help.
              </p>
            </div>
          </ScrollReveal>

          <div className="ct-grid">
            {/* ── LEFT: Info ── */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="ct-info">
                <h3 className="ct-info-title">Contact Information</h3>
                <p className="ct-info-desc">
                  Reach out through any channel. We're here to plan your perfect
                  adventure.
                </p>

                {contactCards.map((c, i) => (
                  <ScrollReveal key={i} delay={0.15 + i * 0.06}>
                    <div className="ct-card">
                      <div className="ct-card-icon">
                        <c.icon size={20} />
                      </div>
                      <div>
                        <div className="ct-card-title">{c.title}</div>
                        {c.lines.map((l, j) => (
                          <div key={j} className="ct-card-line">
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}

                <ScrollReveal delay={0.45}>
                  <div className="ct-socials">
                    <div className="ct-socials-title">
                      Follow Our Adventures
                    </div>
                    <div className="ct-socials-row">
                      {socials.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.label}
                          className="ct-social"
                        >
                          <s.icon />
                        </a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* ── RIGHT: Multi-Step Form ── */}
            <ScrollReveal direction="right" delay={0.15}>
              <div className="ct-form-card" ref={formRef}>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="done"
                      className="ct-success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="ct-success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          delay: 0.2,
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.45, type: "spring" }}
                        >
                          <FiCheckCircle size={44} color="#fff" />
                        </motion.div>
                      </motion.div>
                      <h3 className="ct-success-title">Message Sent! 🎉</h3>
                      <p className="ct-success-text">
                        Our travel experts will review your inquiry and respond
                        within 24 hours.
                      </p>
                      <div className="ct-success-email">
                        <small>📧 🍭 Message Conveyed to:
                        </small>
                        <strong>{form.email}</strong>
                      </div>
                      <div className="ct-success-btns">
                        <button
                          className="ct-btn ct-btn--green"
                          onClick={resetForm}
                        >
                          <FiSend size={15} /> Send Another
                        </button>
                        <a href="/" className="ct-btn ct-btn--outline">
                          <FiArrowRight size={15} /> Explore Safaris
                        </a>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -16 }}
                    >
                      {/* Step Indicator */}
                      <div style={{ marginBottom: 8 }}>
                        <div className="ct-steps">
                          {stepLabels.map((lbl, i) => {
                            const Icon = stepIcons[i];
                            const isActive = step === i;
                            const isDone = step > i;
                            return (
                              <div className="ct-step-item" key={i}>
                                {i > 0 && (
                                  <div
                                    className={`ct-step-line ${step >= i ? "filled" : ""}`}
                                  />
                                )}
                                <motion.div
                                  className={`ct-step-circle ${isActive ? "active" : isDone ? "done" : ""}`}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => {
                                    if (isDone) {
                                      setDirection(i < step ? -1 : 1);
                                      setStep(i);
                                    }
                                  }}
                                  layout
                                >
                                  {isDone ? (
                                    <FiCheckCircle size={16} />
                                  ) : (
                                    <Icon size={16} />
                                  )}
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="ct-step-labels">
                          {stepLabels.map((lbl, i) => (
                            <span
                              key={i}
                              className={
                                step === i ? "active" : step > i ? "done" : ""
                              }
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Step Content */}
                      <form onSubmit={handleSubmit}>
                        <div className="ct-form-body">
                          <AnimatePresence mode="wait" custom={direction}>
                            {step === 0 && (
                              <motion.div
                                key="s0"
                                className="ct-form-step"
                                initial={stepVariants[0].initial}
                                animate={stepVariants[0].animate}
                                exit={stepVariants[0].exit}
                                transition={{
                                  duration: 0.45,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                              >
                                <div className="ct-step-heading">
                                  <h4>👤 Personal Information</h4>
                                  <p>
                                    Tell us who you are so we can personalize
                                    your experience.
                                  </p>
                                </div>
                                <div className="ct-form-row">
                                  <FieldInput
                                    name="name"
                                    label="Full Name"
                                    icon={FiUser}
                                    placeholder="John Smith"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.name}
                                    touched={touched.name}
                                    full
                                  />
                                  <FieldInput
                                    name="email"
                                    label="Email Address"
                                    icon={FiMail}
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    touched={touched.email}
                                  />
                                  <FieldInput
                                    name="phone"
                                    label="Phone Number"
                                    icon={FiPhone}
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={form.phone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.phone}
                                    touched={touched.phone}
                                  />
                                </div>
                              </motion.div>
                            )}

                            {step === 1 && (
                              <motion.div
                                key="s1"
                                className="ct-form-step"
                                initial={stepVariants[1].initial}
                                animate={stepVariants[1].animate}
                                exit={stepVariants[1].exit}
                                transition={{
                                  duration: 0.5,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                              >
                                <div className="ct-step-heading">
                                  <h4>🌍 Trip Details</h4>
                                  <p>
                                    Help us understand your dream adventure.
                                  </p>
                                </div>
                                <div className="ct-form-row">
                                  <FieldSelect
                                    name="tripType"
                                    label="Trip Type"
                                    icon={FiGlobe}
                                    placeholder="Select your adventure"
                                    options={tripTypes}
                                    value={form.tripType}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                  <FieldInput
                                    name="travelDate"
                                    label="Preferred Date"
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
                                    placeholder="Select group size"
                                    options={travelerOpts}
                                    value={form.travelers}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    full
                                  />
                                </div>
                              </motion.div>
                            )}

                            {step === 2 && (
                              <motion.div
                                key="s2"
                                className="ct-form-step"
                                initial={stepVariants[2].initial}
                                animate={stepVariants[2].animate}
                                exit={stepVariants[2].exit}
                                transition={{
                                  duration: 0.5,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                              >
                                <div className="ct-step-heading">
                                  <h4>💬 Your Message</h4>
                                  <p>
                                    Share the details of your dream safari with
                                    us.
                                  </p>
                                </div>
                                <div className="ct-form-row">
                                  <FieldInput
                                    name="subject"
                                    label="Subject"
                                    icon={FiMessageSquare}
                                    placeholder="What would you like to know?"
                                    required
                                    value={form.subject}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.subject}
                                    touched={touched.subject}
                                    full
                                  />
                                  <FieldTextarea
                                    name="message"
                                    label="Your Message"
                                    placeholder="Tell us about your dream African adventure…"
                                    required
                                    maxLength={2000}
                                    value={form.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.message}
                                    touched={touched.message}
                                    full
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="ct-form-nav">
                          <div className="ct-form-nav-left">
                            {step > 0 && (
                              <motion.button
                                type="button"
                                className="ct-nav-btn ct-nav-btn--back"
                                onClick={prevStep}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
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
                                whileTap={{ scale: 0.96 }}
                              >
                                Next Step <FiArrowRight size={16} />
                              </motion.button>
                            ) : (
                              <button
                                type="submit"
                                className="ct-nav-btn ct-nav-btn--submit"
                                disabled={submitting}
                              >
                                {submitting ? (
                                  <>
                                    <motion.svg
                                      width="18"
                                      height="18"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#fff"
                                        strokeWidth="3"
                                        strokeDasharray="31.4 31.4"
                                        strokeLinecap="round"
                                      />
                                    </motion.svg>
                                    Sending…
                                  </>
                                ) : (
                                  <>
                                    <RiSendPlaneFill size={17} /> Send Safari
                                    Inquiry
                                  </>
                                )}
                                {submitting && (
                                  <div
                                    className="ct-progress"
                                    style={{ width: `${progress}%` }}
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {step === 2 && (
                          <div className="ct-privacy">
                            <FiShield size={12} /> Your information is secure
                            and will never be shared.
                          </div>
                        )}
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="ct-section ct-section--white" ref={faqRef}>
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
                Find quick answers about our safari experiences.
              </p>
            </div>
          </ScrollReveal>

          <div className="ct-faq-list">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              const h = faqRefs.current[i]?.scrollHeight || 0;
              return (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className={`ct-faq-item ${isOpen ? "open" : ""}`}>
                    <button
                      className="ct-faq-btn"
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span className="ct-faq-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="ct-faq-q">{faq.q}</span>
                      <span
                        className={`ct-faq-toggle ${isOpen ? "opened" : "closed"}`}
                      >
                        <FiChevronDown size={17} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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

      {/* ════════ QUICK CHANNELS ════════ */}
      <section className="ct-section ct-section--green-light">
        <div className="ct-wrap ct-wrap--md">
          <ScrollReveal>
            <div className="ct-hdr">
              <h2 className="ct-title ct-title--dark">
                Quick Contact <em>Options</em>
              </h2>
              <p className="ct-subtitle">
                Choose the way that works best for you
              </p>
            </div>
          </ScrollReveal>
          <div className="ct-quick-grid">
            {quickChannels.map((ch, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <a href={ch.href} className="ct-quick-card">
                  <div className="ct-quick-icon">
                    <ch.icon size={22} />
                  </div>
                  <div>
                    <div className="ct-quick-title">{ch.title}</div>
                    <div className="ct-quick-sub">{ch.sub}</div>
                    <div className="ct-quick-detail">{ch.detail}</div>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="ct-section ct-section--dark">
        <div className="ct-cta-pattern" />
        <ScrollReveal>
          <div
            className="ct-wrap"
            style={{ textAlign: "center", maxWidth: 680 }}
          >
            <motion.div
              className="ct-cta-icon"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FiHeadphones size={32} color="#fff" />
            </motion.div>
            <h2 className="ct-title ct-title--white">
              Ready to Start Your <em>Adventure</em>?
            </h2>
            <p
              className="ct-subtitle ct-subtitle--light"
              style={{ marginBottom: 36 }}
            >
              Let's discuss your dream African safari. No obligations, just
              inspiration.
            </p>
            <div className="ct-cta-btns">
              <a href="#contact-form" className="ct-btn ct-btn--white">
                <HiSparkles size={17} /> Start Planning
              </a>
              <a href="/services" className="ct-btn ct-btn--ghost">
                View All Our Offerings <FiArrowRight size={16} />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ════════ CHAT ════════ */}
      {!chatOpen && (
        <button className="ct-chat-btn" onClick={() => setChatOpen(true)}>
          <FiMessageCircle size={24} color="#fff" />
          <span className="ct-chat-pulse" />
        </button>
      )}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="ct-chat-window"
            initial={{ opacity: 0, y: 70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 70, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
                  onClick={() => setChatMin((p) => !p)}
                >
                  <FiChevronDown size={15} />
                </button>
                <button
                  className="ct-chat-hbtn"
                  onClick={() => setChatOpen(false)}
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>
            {!chatMin && (
              <>
                <div className="ct-chat-body">
                  <div className="ct-chat-bubble">
                    <p>👋 Hello! Welcome to Altuvera Safaris!</p>
                    <p>How can we help you today?</p>
                  </div>
                  <div className="ct-chat-chips">
                    {[
                      "Safari packages",
                      "Best time to visit",
                      "Group bookings",
                      "Custom itinerary",
                    ].map((t, i) => (
                      <button key={i} className="ct-chat-chip">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ct-chat-footer">
                  <input
                    className="ct-chat-input"
                    placeholder="Type your message…"
                  />
                  <button className="ct-chat-send">
                    <RiSendPlaneFill size={16} color="#fff" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
