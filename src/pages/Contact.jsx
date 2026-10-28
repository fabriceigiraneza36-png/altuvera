// src/pages/Contact.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, useInView, useScroll, useTransform, motion } from "framer-motion";
import {
  Mail as FiMail, Phone as FiPhone, MapPin as FiMapPin, Clock3 as FiClock,
  Send as FiSend, MessageCircle as FiMessageSquare, CircleCheck as FiCheckCircle,
  UserRound as FiUser, CircleAlert as FiAlertCircle, ChevronDown as FiChevronDown,
  Users as FiUsers, Globe2 as FiGlobe, ArrowRight as FiArrowRight,
  ArrowLeft as FiArrowLeft, CircleHelp as FiHelpCircle, ShieldCheck as FiShield,
  ExternalLink as FiExternalLink, CalendarDays as FiCalendar, Sparkles as FiSparkles,
} from "lucide-react";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaTiktok,
} from "react-icons/fa";
import SEO from "../components/common/SEO";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { sendMessage } from "../utils/sendMessage";
import { useUserAuth } from "../context/UserAuthContext";
import { useLocation } from "react-router-dom";
import { useDestinations } from "../hooks/useDestinations";

/* ═══════════════════════════════════════════════════
   API BASE
═══════════════════════════════════════════════════ */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.REACT_APP_API_BASE_URL ||
  "";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const EASE = {
  smooth: [0.21, 0.68, 0.35, 0.98],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
};

/* ═══════════════════════════════════════════════════
   SAFE FETCH
═══════════════════════════════════════════════════ */
async function safeFetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json"))
    throw new Error(`Expected JSON but got ${ct || "unknown"} (HTTP ${res.status})`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || body?.error || `Server error ${res.status}`);
  }
  return res.json();
}

/* ═══════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════ */
const RULES = {
  name: {
    required: true, minLength: 2,
    pattern: /^[a-zA-ZÀ-ÿ\s'\-]+$/,
    msg: { required: "Full name is required", minLength: "At least 2 characters", pattern: "Letters, spaces, hyphens & apostrophes only" },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    msg: { required: "Email address is required", pattern: "Please enter a valid email" },
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    msg: { pattern: "Please enter a valid phone number" },
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

const STEP_FIELDS = [["name", "email", "phone"], ["subject", "message"]];
const INIT_FORM = { name: "", email: "", phone: "", tripType: "", travelDate: "", travelers: "", subject: "", message: "" };

/* ═══════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════ */
const CONTACT_CARDS = [
  { icon: FiMapPin, title: "Visit Us", lines: ["Musanze, Rwanda"], href: "https://maps.google.com/?q=Musanze+Rwanda", accent: "#059669" },
  { icon: FiPhone, title: "Call Us", lines: ["+250 792 352 409"], href: "tel:+250792352409", accent: "#047857" },
  { icon: FiMail, title: "Email Us", lines: ["info@altuverasafaris.com"], href: "mailto:info@altuverasafaris.com", accent: "#065f46" },
  { icon: FiClock, title: "Working Hours", lines: ["Mon–Fri: 8 AM – 6 PM", "Sat: 9 AM – 2 PM"], accent: "#064e3b" },
];

const TRIP_TYPES = [
  "Safari Adventure", "Mountain Trekking", "Gorilla Trekking",
  "Beach Holiday", "Cultural Tour", "Photography Safari",
  "Honeymoon", "Family Trip",
];

const SOCIALS = [
  { icon: FaFacebookF, label: "Facebook", url: "https://www.facebook.com/profile.php?id=61591972225527&sfnsn=mo&mibextid=RUbZ1f", color: "#1877F2" },
  { icon: FaInstagram, label: "Instagram", url: "#", color: "#E1306C" },
  { icon: FaTwitter, label: "Twitter", url: "#", color: "#1DA1F2" },
  { icon: FaYoutube, label: "YouTube", url: "#", color: "#FF0000" },
  { icon: FaWhatsapp, label: "WhatsApp", url: "https://wa.me/250785751391", color: "#25D366" },
  { icon: FaTiktok, label: "TikTok", url: "#", color: "#000" },
];

const QUICK_CHANNELS = [
  { icon: FaWhatsapp, title: "WhatsApp", subtitle: "Instant chat", detail: "+250 785 751 391", href: "https://wa.me/250785751391", color: "#25D366" },
  { icon: FiPhone, title: "Call Us", subtitle: "Speak to an expert", detail: "+250 792 352 409", href: "tel:+250792352409", color: "#047857" },
  { icon: FiMail, title: "Email", subtitle: "Detailed inquiries", detail: "info@altuverasafaris.com", href: "mailto:info@altuverasafaris.com", color: "#3B82F6" },
];

const FALLBACK_FAQS = [
  { id: 1, q: "How far in advance should I book a safari?", a: "We recommend booking at least 3–6 months in advance, especially during peak season (June–October and December–February). This ensures the best availability for lodges and permits." },
  { id: 2, q: "What's included in a typical safari package?", a: "Our packages typically include airport transfers, accommodation, all meals, game drives with expert guides, park entry fees, and 24/7 support. International flights are usually not included." },
  { id: 3, q: "Do I need a visa to visit Rwanda?", a: "Most nationalities can obtain a visa on arrival or apply for an e-visa online. We'll guide you through the entire process based on your nationality." },
  { id: 4, q: "Is it safe to go on a gorilla trek?", a: "Absolutely! Gorilla trekking is conducted with experienced rangers and strict protocols. The mountain gorillas are habituated to human presence and the experience is both safe and unforgettable." },
  { id: 5, q: "Can I customise my safari itinerary?", a: "Yes! Every trip we plan is fully bespoke. We'll work with you to create a personalised itinerary based on your interests, budget, fitness level, and travel dates." },
  { id: 6, q: "What is your cancellation policy?", a: "We offer flexible cancellation up to 30 days before departure for a full refund. Cancellations within 14–30 days receive a 50% refund. Specific permit-related bookings may have different terms." },
];

const STEP_CONFIG = [
  { label: "About You", icon: FiUser },
  { label: "Your Message", icon: FiMessageSquare },
];

const FORM_BUBBLES = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  left: `${(index * 37 + 7) % 100}%`,
  top: `${(index * 29 + 9) % 100}%`,
  size: 18 + (index % 5) * 13,
  delay: `${-(index * 0.73).toFixed(2)}s`,
  duration: `${13 + (index % 6) * 3}s`,
  opacity: 0.14 + (index % 4) * 0.045,
}));

const FormBubbleLayer = React.memo(function FormBubbleLayer() {
  return (
    <div className="ct-form-bubble-layer" aria-hidden="true">
      {FORM_BUBBLES.map((bubble) => (
        <span key={bubble.id} className={`ct-form-bubble ct-form-bubble--${(bubble.id % 4) + 1}`}
          style={{ left:bubble.left, top:bubble.top, width:bubble.size, height:bubble.size,
            opacity:bubble.opacity, animationDelay:bubble.delay, animationDuration:bubble.duration }} />
      ))}
    </div>
  );
});


/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════ */
const ScrollReveal = ({ children, delay = 0, direction = "up", distance = 22, style = {}, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const dirs = { up: { y: distance }, down: { y: -distance }, left: { x: -distance }, right: { x: distance }, scale: { scale: 0.95 } };
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.48, delay, ease: EASE.smooth }}>
      {children}
    </motion.div>
  );
};

const FormInput = React.memo(({ name, label, icon: Icon, type = "text", placeholder, required, value, onChange, onBlur, error, touched, hint }) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;
  return (
    <div className="ct-field">
      <label className="ct-label" htmlFor={`ct-${name}`}>
        {Icon && <Icon size={13} className="ct-label-icon" />}
        <span>{label}</span>
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-input-wrap ${focused ? "ct-focused" : ""} ${hasErr ? "ct-err" : ""} ${isOk ? "ct-ok" : ""}`}>
        {type === "email" ? (
          <EmailAutocompleteInput
            id={`ct-${name}`} name={name} value={value} placeholder={placeholder}
            onValueChange={v => onChange?.({ target: { name, value: v } })}
            onFocus={() => setFocused(true)}
            onBlur={e => { setFocused(false); onBlur?.(e); }}
            className="ct-input" aria-invalid={!!hasErr}
          />
        ) : (
          <input id={`ct-${name}`} type={type} name={name} value={value} placeholder={placeholder}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={e => { setFocused(false); onBlur?.(e); }}
            className="ct-input" aria-invalid={!!hasErr}
          />
        )}
        <AnimatePresence mode="wait">
          {hasErr && (
            <motion.span key="err" className="ct-icon-r" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiAlertCircle size={15} color="#ef4444" />
            </motion.span>
          )}
          {isOk && (
            <motion.span key="ok" className="ct-icon-r" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <FiCheckCircle size={15} color="#059669" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.p className="ct-err-msg" role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -4, height: 0 }}>
            <FiAlertCircle size={10} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !hasErr && <p className="ct-hint">{hint}</p>}
    </div>
  );
});
FormInput.displayName = "FormInput";

const FormSelect = React.memo(({ name, label, icon: Icon, placeholder, options, value, onChange, onBlur }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="ct-field">
      <label className="ct-label" htmlFor={`ct-${name}`}>
        {Icon && <Icon size={13} className="ct-label-icon" />}
        <span>{label}</span>
      </label>
      <div className={`ct-input-wrap ct-sel-wrap ${focused ? "ct-focused" : ""}`}>
        <select id={`ct-${name}`} name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={e => { setFocused(false); onBlur?.(e); }}
          className="ct-select">
          <option value="">{placeholder}</option>
          {options.map((o, i) => <option key={i} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
        </select>
        <span className="ct-sel-chevron"><FiChevronDown size={16} /></span>
      </div>
    </div>
  );
});
FormSelect.displayName = "FormSelect";

const FormTextarea = React.memo(({ name, label, placeholder, required, maxLength = 2000, value, onChange, onBlur, error, touched }) => {
  const [focused, setFocused] = useState(false);
  const hasErr = touched && error;
  const isOk = touched && !error && value;
  const chars = value?.length || 0;
  return (
    <div className="ct-field ct-field--full">
      <label className="ct-label" htmlFor={`ct-${name}`}>
        <FiMessageSquare size={13} className="ct-label-icon" />
        <span>{label}</span>
        {required && <span className="ct-req">*</span>}
      </label>
      <div className={`ct-input-wrap ct-ta-wrap ${focused ? "ct-focused" : ""} ${hasErr ? "ct-err" : ""} ${isOk ? "ct-ok" : ""}`}>
        <textarea id={`ct-${name}`} name={name} value={value} placeholder={placeholder}
          maxLength={maxLength} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={e => { setFocused(false); onBlur?.(e); }}
          className="ct-textarea" aria-invalid={!!hasErr} />
        <div className="ct-char-bar ct-char-bar--count-only"><span className="ct-char-count" aria-live="polite">{chars} / {maxLength} characters</span></div>
      </div>
      <AnimatePresence>
        {hasErr && (
          <motion.p className="ct-err-msg" role="alert"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <FiAlertCircle size={10} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
FormTextarea.displayName = "FormTextarea";

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const Contact = () => {
  const { user, isAuthenticated } = useUserAuth();
  const location = useLocation();
  const { destinations: availableDestinations = [], loading: destinationsLoading } = useDestinations();
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationInquiry, setDestinationInquiry] = useState(false);

  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [faqSectionOpen, setFaqSectionOpen] = useState(false);

  const heroRef = useRef(null);
  const mounted = useRef(true);
  const autoFilled = useRef(false);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* ── Auto-fill from auth ── */
  useEffect(() => {
    if (!user || !isAuthenticated || autoFilled.current) return;
    autoFilled.current = true;
    const updates = {}, t = {}, e = {};
    const name = user.fullName || user.full_name || user.name || "";
    const email = user.email || "";
    const phone = user.phone || "";
    if (name)  { updates.name = name;   t.name = true;  e.name = validateField("name", name); }
    if (email) { updates.email = email; t.email = true; e.email = validateField("email", email); }
    if (phone) { updates.phone = phone; t.phone = true; e.phone = validateField("phone", phone); }
    if (Object.keys(updates).length) {
      setForm(p => ({ ...p, ...updates }));
      setTouched(p => ({ ...p, ...t }));
      setErrors(p => ({ ...p, ...e }));
    }
  }, [user, isAuthenticated]);

  /* ── Preselect destination when opened from a destination detail page ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedSlug = params.get("destination") || "";
    const requestedName = params.get("destinationName") || "";
    if (!requestedSlug && !requestedName) return;
    const match = availableDestinations.find((item) => {
      const itemSlug = String(item.slug || "");
      const itemId = String(item.id || item._id || "");
      const itemName = String(item.name || item.title || "");
      return (requestedSlug && [itemSlug, itemId].includes(requestedSlug))
        || (requestedName && itemName.toLowerCase() === requestedName.toLowerCase());
    });
    const selected = match || { id: requestedSlug, slug: requestedSlug, name: requestedName || requestedSlug.replace(/[-_]+/g, " ") };
    setSelectedDestinations((current) => {
      const existingIndex = current.findIndex((item) => {
        const keys = [item.slug, item.id, item._id, item.name, item.title].filter(Boolean).map(String);
        return keys.includes(requestedSlug) || (requestedName && keys.some((key) => key.toLowerCase() === requestedName.toLowerCase()));
      });
      if (existingIndex < 0) return [selected, ...current];
      return current.map((item, index) => index === existingIndex ? selected : item);
    });
    setDestinationInquiry(true);
    setForm((current) => ({ ...current, subject: current.subject || "Destination Inquiry — " + (selected.name || selected.title || requestedName || requestedSlug) }));
  }, [location.search, availableDestinations]);

  /* ── Fetch FAQs ── */
  useEffect(() => {
    const controller = new AbortController();
    setFaqsLoading(true);
    safeFetchJSON(`${API_BASE}/faqs`, { signal: controller.signal })
      .then(json => {
        if (!mounted.current) return;
        const list = (json?.data || json?.faqs || json || []).map((f, i) => ({
          id: f.id || f._id || i, q: f.question || f.q || "", a: f.answer || f.a || "",
        }));
        setFaqs(list.length > 0 ? list : FALLBACK_FAQS);
      })
      .catch(err => {
        if (err?.name !== "AbortError" && mounted.current) setFaqs(FALLBACK_FAQS);
      })
      .finally(() => { if (mounted.current) setFaqsLoading(false); });
    return () => controller.abort();
  }, []);

  /* ── Handlers ── */
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => p[name] ? { ...p, [name]: validateField(name, value) } : p);
  }, []);

  const handleBlur = useCallback(e => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validateField(name, value) }));
  }, []);

  const validateStep = useCallback(idx => {
    const errs = {}, touch = {};
    STEP_FIELDS[idx].forEach(f => {
      touch[f] = true;
      const e = validateField(f, form[f]);
      if (e) errs[f] = e;
    });
    setTouched(p => ({ ...p, ...touch }));
    setErrors(p => ({ ...p, ...errs }));
    return Object.keys(errs).length === 0;
  }, [form]);

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, STEP_FIELDS.length - 1));
  }, [step, validateStep]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    let hasErr = false;
    STEP_FIELDS.forEach((_, i) => { if (!validateStep(i)) hasErr = true; });
    if (hasErr) return;
    setSubmitting(true);
    setErrors(p => ({ ...p, submit: "" }));
    try {
      const destinationNames = selectedDestinations.map((item) => item.name || item.title).filter(Boolean);
      const res = await sendMessage({
        ...form,
        destinations: selectedDestinations.map((item) => ({ id: item.id || item._id || item.slug, slug: item.slug || "", name: item.name || item.title || "" })),
        destinationNames,
        destinationInquiry,
        source: "website_contact_form",
      });
      if (res?.error) throw new Error(res.error);
      setSubmittedEmail(form.email);
      if (mounted.current) setSubmitted(true);
    } catch (err) {
      setErrors(p => ({ ...p, submit: err?.message || "Something went wrong. Please try again." }));
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }, [form, validateStep, selectedDestinations, destinationInquiry]);

  const resetForm = useCallback(() => {
    setSubmitted(false); setStep(0); setDirection(1); setForm(INIT_FORM);
    setSelectedDestinations([]); setDestinationQuery(""); setDestinationInquiry(false);
    setTouched({}); setErrors({}); setSubmittedEmail("");
    autoFilled.current = false;
  }, []);

  const slideVariants = {
    enter: d => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: d => ({ opacity: 0, x: d * -40 }),
  };

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="ct-page">
      <SEO
        title="Contact Us — Altuvera Safari"
        description="Get in touch with Altuvera for personalised safari planning across East Africa."
        keywords={["contact Altuvera", "safari booking", "East Africa travel"]}
        url="/contact"
      />
      <style>{STYLES}</style>

      <section className="ct-hero" ref={heroRef}>
        <motion.div className="ct-hero-bg"
          style={{ backgroundImage: "url(https://i.pinimg.com/736x/bb/ca/d1/bbcad1c07136f38bfc47257f8b38cf2a.jpg)", y: heroY }}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }} />
        <div className="ct-hero-overlay" />
        <div className="ct-hero-fog" aria-hidden="true"><span className="ct-hero-fog__layer ct-hero-fog__layer--one" /><span className="ct-hero-fog__layer ct-hero-fog__layer--two" /><span className="ct-hero-fog__ground" /></div>

        <div className="ct-hero-decor" aria-hidden="true">
          {[
            { size: 90, top: "12%", left: "6%", delay: 0 },
            { size: 60, top: "55%", left: "12%", delay: 1.2 },
            { size: 110, top: "18%", left: "82%", delay: 0.6 },
            { size: 45, top: "68%", left: "90%", delay: 2 },
          ].map((p, i) => (
            <motion.div key={i} className="ct-hero-orb"
              style={{ width: p.size, height: p.size, top: p.top, left: p.left }}
              animate={{ y: [0, -12, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
          ))}
        </div>

        <motion.div className="ct-hero-content" style={{ opacity: heroOpacity }}>
          <motion.div className="ct-hero-kicker" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}>
            <span className="ct-hero-kicker-dot" />
            TRUE ADVENTURE IN HIGH PLACES &amp; DEEP CULTURE
          </motion.div>
          <motion.h1 className="ct-hero-h1"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65 }}>
            Let's Plan Your <br /><em>Dream Safari</em>
          </motion.h1>
          <motion.p className="ct-hero-sub"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}>
            Connect with our expert team and let us craft an unforgettable
            African adventure tailored just for you.
          </motion.p>
          <motion.div className="ct-hero-actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.55 }}>
            <a href="#contact-form" className="ct-btn ct-btn--white">
              <FiSend size={14} /> Send a Message
            </a>
            <a href="tel:+250792352409" className="ct-btn ct-btn--ghost">
              <FiPhone size={14} /> Call Us Now
            </a>
          </motion.div>

        </motion.div>

        <motion.div className="ct-scroll-hint"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          <div className="ct-scroll-mouse">
            <motion.div className="ct-scroll-wheel"
              animate={{ y: [0, 11, 0], opacity: [1, 0.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ═══ CONTACT FORM SECTION ═══ */}
      <section className="ct-section ct-section--mint" id="contact-form">
        <div className="ct-container">
          <ScrollReveal>
            <div className="ct-section-header">
              <h2 className="ct-h2">We'd Love to <em>Hear From You</em></h2>
              <p className="ct-subtitle">Our Africa travel experts are ready to help craft your perfect adventure.</p>
            </div>
          </ScrollReveal>

          <div className="ct-grid-main">
            {/* ── Left: Info ── */}
            <ScrollReveal direction="left" delay={0.08}>
              <div className="ct-info-col">
                <h3 className="ct-info-title">Contact Information</h3>
                <p className="ct-info-desc">
                  Reach us through any channel — we respond within 2 hours during business hours.
                </p>
                <div className="ct-cards-stack">
                  {CONTACT_CARDS.map((c, i) => (
                    <ScrollReveal key={i} delay={0.06 + i * 0.04}>
                      <a href={c.href || "#"} className="ct-contact-card"
                        onClick={!c.href ? e => e.preventDefault() : undefined}
                        style={{ "--card-accent": c.accent }}>
                        <div className="ct-cc-icon"><c.icon size={18} /></div>
                        <div className="ct-cc-body">
                          <div className="ct-cc-title">{c.title}</div>
                          {c.lines.map((l, j) => <div key={j} className="ct-cc-line">{l}</div>)}
                        </div>
                        {c.href && <FiExternalLink size={11} className="ct-cc-ext" />}
                      </a>
                    </ScrollReveal>
                  ))}
                </div>
                <ScrollReveal delay={0.3}>
                  <div className="ct-social-box">
                    <div className="ct-social-title">Follow Our Adventures</div>
                    <div className="ct-social-row">
                      {SOCIALS.map((s, i) => (
                        <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          title={s.label} className="ct-social-link"
                          whileHover={{ scale: 1.12, y: -3 }} whileTap={{ scale: 0.94 }}>
                          <s.icon />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* ── Right: Form ── */}
            <ScrollReveal direction="right" delay={0.1}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="done" className="ct-form-card ct-form-card--success"
                    role="status" aria-live="polite"
                    initial={{ opacity: 0, scale: 0.96, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.34, ease: EASE.snappy }}>
                    <FormBubbleLayer />
                    <div className="ct-success">
                      <div className="ct-success-kicker"><FiSparkles size={14} /> MESSAGE RECEIVED</div>
                      <motion.div className="ct-success-circle"
                        initial={{ scale: 0, rotate: -18 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.08, duration: 0.48, ease: EASE.bounce }}>
                        <FiCheckCircle size={40} strokeWidth={1.8} />
                      </motion.div>
                      <motion.h3 className="ct-success-h"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        Your message is on its way
                      </motion.h3>
                      <motion.p className="ct-success-p"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                        Thank you for reaching out to Altuvera Safaris. Our team has received your message and will follow up as soon as possible.
                      </motion.p>
                      <motion.div className="ct-success-email"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <span className="ct-success-email-icon"><FiMail size={17} /></span>
                        <span className="ct-success-email-copy"><small>We’ll reply to</small><strong>{submittedEmail}</strong></span>
                      </motion.div>
                      <motion.div className="ct-success-next"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                        <span className="ct-success-next-icon"><FiClock size={17} /></span>
                        <span><strong>What happens next?</strong><small>A safari specialist will review your enquiry and contact you with helpful next steps.</small></span>
                      </motion.div>
                      <motion.div className="ct-success-btns"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                        <button className="ct-btn ct-btn--green" onClick={resetForm}>
                          <FiSend size={13} /> Send Another
                        </button>
                        <a href="/" className="ct-btn ct-btn--outline">
                          <FiArrowLeft size={13} /> Back Home
                        </a>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" className="ct-form-card" onSubmit={handleSubmit} autoComplete="off" noValidate
                    initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                    <FormBubbleLayer />
                    <div className="ct-form-intro">
                      <div>
                        <span className="ct-form-eyebrow">LET’S GET ACQUAINTED</span>
                        <h3>Tell us about your trip</h3>
                        <p>A few details help us plan a more personal response.</p>
                      </div>
                      <span className="ct-form-intro-icon"><FiMessageSquare size={20} /></span>
                    </div>
                    {/* Step navigation — no percentage or auto-filling progress bar. */}
                    <div className="ct-step-tabs">
                      {STEP_CONFIG.map((cfg, i) => {
                        const isActive = step === i;
                        const isDone = step > i;
                        return (
                          <React.Fragment key={i}>
                            <button type="button"
                              className={`ct-step-tab ${isActive ? "ct-step-tab--active" : ""} ${isDone ? "ct-step-tab--done" : ""}`}
                              onClick={() => {
                                if (i < step) { setDirection(-1); setStep(i); }
                                else if (i > step && validateStep(step)) { setDirection(1); setStep(i); }
                              }}>
                              <div className="ct-step-tab-dot">
                                {isDone ? <FiCheckCircle size={15} /> : <cfg.icon size={15} />}
                              </div>
                              <div className="ct-step-tab-meta">
                                <span className="ct-step-tab-num">Step {i + 1}</span>
                                <span className="ct-step-tab-name">{cfg.label}</span>
                              </div>
                            </button>
                            {i < STEP_CONFIG.length - 1 && (
                              <div className={`ct-step-tab-line ${isDone ? "ct-step-tab-line--done" : ""}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* Step content */}
                    <div className="ct-step-content">
                      <AnimatePresence mode="wait" custom={direction}>
                        {step === 0 && (
                          <motion.div key="step0" custom={direction} variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.28, ease: EASE.snappy }}>
                            <div className="ct-step-hdr">
                              <h4>Personal Information</h4>
                              <p>Tell us who you are so we can personalise your experience.</p>
                            </div>
                            <div className="ct-form-grid">
                              <FormInput name="name" label="Full Name" icon={FiUser} placeholder="e.g. Jane Smith"
                                required value={form.name} onChange={handleChange} onBlur={handleBlur}
                                error={errors.name} touched={touched.name} />
                              <FormInput name="email" label="Email Address" icon={FiMail} type="email"
                                placeholder="you@example.com" required value={form.email}
                                onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} />
                            </div>
                            <FormInput name="phone" label="Phone Number" icon={FiPhone} type="tel"
                              placeholder="+250 700 000 000" value={form.phone}
                              onChange={handleChange} onBlur={handleBlur} error={errors.phone} touched={touched.phone}
                              hint="Optional — for WhatsApp or callback" />
                            <div className="ct-optional-section">
                              <div className="ct-optional-label">
                                <FiGlobe size={12} /> Optional Trip Details
                              </div>
                              <div className="ct-form-grid">
                                <FormSelect name="tripType" label="Trip Type" icon={FiGlobe}
                                  placeholder="Select type" options={TRIP_TYPES}
                                  value={form.tripType} onChange={handleChange} onBlur={handleBlur} />
                                <FormInput name="travelDate" label="Travel Date" icon={FiCalendar}
                                  type="date" value={form.travelDate} onChange={handleChange} onBlur={handleBlur} />
                              </div>
                              <FormSelect name="travelers" label="Travelers" icon={FiUsers}
                                placeholder="Select group size"
                                options={["Solo", "2 — Couple", "3–4 — Small Group", "5–8 — Group", "9+ — Large Group"]}
                                value={form.travelers} onChange={handleChange} onBlur={handleBlur} />
                            </div>
                          </motion.div>
                        )}
                        {step === 1 && (
                          <motion.div key="step1" custom={direction} variants={slideVariants}
                            initial="enter" animate="center" exit="exit"
                            transition={{ duration: 0.28, ease: EASE.snappy }}>
                            <div className="ct-step-hdr">
                              <h4>Your Message</h4>
                              <p>Share your dream trip idea and any questions you have.</p>
                            </div>
                            <section className="ct-destination-picker" aria-label="Destinations for your inquiry">
                              <div className="ct-destination-picker-heading">
                                <div><strong>Destination inquiry</strong><p>Search for one or more destinations so our team can personalise its reply.</p></div>
                                <label className="ct-destination-toggle"><input type="checkbox" checked={destinationInquiry} onChange={(event) => {
                                  const checked = event.target.checked;
                                  setDestinationInquiry(checked);
                                  if (checked && selectedDestinations.length) setForm((current) => ({ ...current, subject: "Destination Inquiry — " + selectedDestinations.map((item) => item.name || item.title).filter(Boolean).join(", ") }));
                                  if (!checked && form.subject.startsWith("Destination Inquiry — ")) setForm((current) => ({ ...current, subject: "" }));
                                }} /><span>Use destination name as subject</span></label>
                              </div>
                              <div className="ct-destination-search-wrap"><FiMapPin size={16} aria-hidden="true" />
                                <input type="search" value={destinationQuery} onChange={(event) => setDestinationQuery(event.target.value)} placeholder={destinationsLoading ? "Loading destinations…" : "Search destinations by name…"} aria-label="Search destinations" />
                              </div>
                              {destinationQuery.trim() && <div className="ct-destination-results" role="listbox" aria-label="Destination search results">
                                {availableDestinations.filter((item) => String(item.name || item.title || "").toLowerCase().includes(destinationQuery.trim().toLowerCase()) && !selectedDestinations.some((selected) => String(selected.slug || selected.id || selected._id) === String(item.slug || item.id || item._id))).slice(0, 7).map((item) => (
                                  <button type="button" key={String(item.id || item._id || item.slug || item.name)} onClick={() => {
                                    const next = [...selectedDestinations, item];
                                    setSelectedDestinations(next); setDestinationQuery("");
                                    if (destinationInquiry) setForm((current) => ({ ...current, subject: "Destination Inquiry — " + next.map((entry) => entry.name || entry.title).filter(Boolean).join(", ") }));
                                  }}>{item.name || item.title || "Destination"}<FiArrowRight size={14} aria-hidden="true" /></button>
                                ))}
                                {!availableDestinations.some((item) => String(item.name || item.title || "").toLowerCase().includes(destinationQuery.trim().toLowerCase())) && <p>No matching destinations found. Try another name.</p>}
                              </div>}
                              {selectedDestinations.length > 0 && <div className="ct-destination-chips" aria-label="Selected destinations">
                                {selectedDestinations.map((item) => <span key={String(item.id || item._id || item.slug || item.name)}>{item.name || item.title}<button type="button" aria-label={"Remove " + (item.name || item.title)} onClick={() => {
                                  const next = selectedDestinations.filter((entry) => String(entry.slug || entry.id || entry._id || entry.name) !== String(item.slug || item.id || item._id || item.name));
                                  setSelectedDestinations(next);
                                  if (destinationInquiry) setForm((current) => ({ ...current, subject: next.length ? "Destination Inquiry — " + next.map((entry) => entry.name || entry.title).filter(Boolean).join(", ") : "" }));
                                }}>×</button></span>)}
                              </div>}
                            </section>
                            <FormInput name="subject" label="Subject" icon={FiMessageSquare}
                              placeholder="e.g. Destination Inquiry — Volcanoes National Park" required
                              value={form.subject} onChange={handleChange} onBlur={handleBlur}
                              error={errors.subject} touched={touched.subject} />
                            <FormTextarea name="message" label="Message" required
                              placeholder="Hi, I'm interested in booking a gorilla trekking experience in Rwanda..."
                              value={form.message} onChange={handleChange} onBlur={handleBlur}
                              error={errors.message} touched={touched.message} />
                            <AnimatePresence>
                              {errors.submit && (
                                <motion.div className="ct-server-err"
                                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                  <FiAlertCircle size={14} /> {errors.submit}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <button type="submit" className="ct-submit" disabled={submitting} aria-busy={submitting}>
                              {submitting ? (
                                <>
                                  <svg className="ct-spinner-svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                  </svg>
                                  Sending…
                                </>
                              ) : (
                                <><FiSend size={16} /> Send Message</>
                              )}
                            </button>
                            <div className="ct-privacy-note">
                              <FiShield size={11} /> Your information is encrypted and never shared with third parties.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Nav */}
                    <div className="ct-form-nav">
                      {step > 0 ? (
                        <button type="button" className="ct-nav-back" onClick={goPrev}>
                          <FiArrowLeft size={14} /> Back
                        </button>
                      ) : <div />}
                      {step < STEP_FIELDS.length - 1 && (
                        <button type="button" className="ct-nav-next" onClick={goNext}>
                          Continue <FiArrowRight size={14} />
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

      {/* ═══ QUICK CHANNELS ═══ */}
      <section className="ct-section ct-section--white">
        <div className="ct-container ct-container--md">
          <ScrollReveal>
            <div className="ct-section-header">
              <h2 className="ct-h2">Prefer to <em>Talk Directly</em>?</h2>
              <p className="ct-subtitle">Choose the channel that works best for you.</p>
            </div>
          </ScrollReveal>
          <div className="ct-channels-grid">
            {QUICK_CHANNELS.map((ch, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <a href={ch.href} className="ct-channel-card" target="_blank" rel="noopener noreferrer"
                  style={{ "--ch-accent": ch.color }}>
                  <div className="ct-ch-icon"><ch.icon size={24} /></div>
                  <div className="ct-ch-name">{ch.title}</div>
                  <div className="ct-ch-sub">{ch.subtitle}</div>
                  <div className="ct-ch-detail">{ch.detail}</div>
                  <div className="ct-ch-arrow"><FiArrowRight size={15} /></div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ — TOGGLEABLE SECTION ═══ */}
      <section className="ct-section ct-section--mint">
        <div className="ct-container ct-container--sm">
          <ScrollReveal>
            <button
              type="button"
              className="ct-faq-toggle"
              onClick={() => setFaqSectionOpen(p => !p)}
              aria-expanded={faqSectionOpen}
            >
              <div className="ct-faq-toggle__left">
                <div className="ct-faq-toggle__icon-wrap">
                  <FiHelpCircle size={20} />
                </div>
                <div>
                  <h2 className="ct-faq-toggle__title">Frequently Asked Questions</h2>
                  <p className="ct-faq-toggle__sub">
                    {faqSectionOpen
                      ? "Click to collapse"
                      : `${faqs.length} answers to common questions`}
                  </p>
                </div>
              </div>
              <motion.div
                className="ct-faq-toggle__chevron"
                animate={{ rotate: faqSectionOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: EASE.snappy }}
              >
                <FiChevronDown size={20} />
              </motion.div>
            </button>
          </ScrollReveal>

          <AnimatePresence initial={false}>
            {faqSectionOpen && (
              <motion.div
                key="faq-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE.snappy }}
                style={{ overflow: "hidden" }}
              >
                <div className="ct-faq-body">
                  {faqsLoading ? (
                    <div className="ct-faq-loading">
                      <div className="ct-spinner" /><span>Loading FAQs…</span>
                    </div>
                  ) : (
                    <div className="ct-faq-list">
                      {faqs.map((faq, i) => {
                        const isOpen = openFaqId === faq.id;
                        return (
                          <div key={faq.id} className={`ct-faq-item ${isOpen ? "ct-faq-item--open" : ""}`}>
                            <button className="ct-faq-trigger" type="button"
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)} aria-expanded={isOpen}>
                              <span className="ct-faq-num">{String(i + 1).padStart(2, "0")}</span>
                              <span className="ct-faq-question">{faq.q}</span>
                              <motion.span className="ct-faq-chevron" animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}>
                                <FiChevronDown size={15} />
                              </motion.span>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE.snappy }}
                                  style={{ overflow: "hidden" }}>
                                  <div className="ct-faq-answer">{faq.a}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="ct-section ct-cta-section">
        <div className="ct-cta-pattern" />
        <div className="ct-container">
          <ScrollReveal>
            <div className="ct-cta-content">
              <h2 className="ct-h2 ct-h2--light">Ready for Your <em>African Adventure</em>?</h2>
              <p className="ct-subtitle ct-subtitle--light">
                Join thousands of happy travellers who trusted Altuvera to make their safari dreams real.
              </p>
              <div className="ct-cta-btns">
                <a href="#contact-form" className="ct-btn ct-btn--white"><FiSend size={14} /> Plan My Safari</a>
                <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer" className="ct-btn ct-btn--ghost">
                  <FaWhatsapp size={15} /> WhatsApp Us
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

.ct-page{
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  color:#1e293b;background:#fff;line-height:1.6;
  overflow-x:hidden;-webkit-font-smoothing:antialiased;
}

.ct-destination-picker{margin:0 0 18px;padding:16px;border:1px solid #dbe7e1;border-radius:16px;background:linear-gradient(135deg,#f8fffb,#fff);min-width:0}
.ct-destination-picker-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.ct-destination-picker-heading strong{display:block;color:#064e3b;font-size:14px}
.ct-destination-picker-heading p{margin:3px 0 0;color:#64748b;font-size:12px;line-height:1.5;max-width:440px}
.ct-destination-toggle{display:flex;align-items:center;gap:7px;color:#334155;font-size:11px;font-weight:700;cursor:pointer}
.ct-destination-toggle input{width:16px;height:16px;accent-color:#059669}
.ct-destination-search-wrap{display:flex;align-items:center;gap:9px;margin-top:13px;padding:0 12px;min-height:44px;border:1px solid #dbe4e0;border-radius:11px;background:#fff;color:#059669}
.ct-destination-search-wrap input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#0f172a;font:inherit;font-size:13px}
.ct-destination-results{display:grid;gap:4px;margin-top:7px;max-height:220px;overflow:auto;padding:5px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}
.ct-destination-results button{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;border:0;border-radius:8px;background:#fff;text-align:left;color:#334155;font:inherit;font-size:13px;cursor:pointer}
.ct-destination-results button:hover{background:#ecfdf5;color:#047857}
.ct-destination-results p{margin:7px;color:#64748b;font-size:12px}
.ct-destination-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.ct-destination-chips span{display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:6px 9px;border-radius:999px;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;overflow-wrap:anywhere}
.ct-destination-chips button{border:0;background:transparent;color:#065f46;font-size:18px;line-height:1;cursor:pointer}
@media(max-width:520px){.ct-destination-picker{padding:12px}.ct-destination-picker-heading{display:grid;gap:10px}.ct-destination-toggle{align-items:flex-start}}

/* ═══ HERO ═══ */
.ct-hero{position:relative;height:99vh;height:99svh;min-height:99svh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.ct-hero-bg{position:absolute;inset:-10%;background-size:cover;background-position:center;will-change:transform;filter:brightness(.75)}
.ct-hero-overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(6,78,59,.3),rgba(4,120,87,.65) 40%,rgba(6,95,70,.82) 70%,rgba(6,78,59,.9))}
.ct-hero-decor{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.ct-hero-orb{position:absolute;border-radius:50%;background:rgba(52,211,153,.12);backdrop-filter:blur(2px)}
.ct-hero-content{position:relative;z-index:2;text-align:center;padding:0 clamp(20px,5vw,40px);max-width:840px;width:100%}
.ct-hero-h1{font-family:'Playfair Display',serif;font-size:clamp(32px,7vw,68px);font-weight:800;color:#fff;line-height:1.06;margin-bottom:14px;letter-spacing:-.5px}
.ct-hero-h1 em{font-style:normal;background:linear-gradient(90deg,#6ee7b7,#a7f3d0,#d1fae5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-hero-sub{font-size:clamp(14px,1.8vw,18px);color:rgba(255,255,255,.82);line-height:1.72;max-width:520px;margin:0 auto 24px;font-weight:300}
.ct-hero-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.ct-hero-stats{display:flex;align-items:center;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:22px}
.ct-hero-stat{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.68);font-weight:500}
.ct-hero-stat svg{color:#34d399}
.ct-scroll-hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:2}
.ct-scroll-mouse{width:24px;height:40px;border:2px solid rgba(255,255,255,.22);border-radius:12px;display:flex;justify-content:center;padding-top:7px}
.ct-scroll-wheel{width:3px;height:8px;background:#fff;border-radius:2px}

/* ═══ BUTTONS ═══ */
.ct-btn{display:inline-flex;align-items:center;gap:8px;padding:clamp(10px,1.3vw,13px) clamp(18px,2.6vw,28px);border-radius:12px;font-family:'Inter',sans-serif;font-size:clamp(13px,1.2vw,14px);font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);white-space:nowrap;justify-content:center}
.ct-btn--white{background:#fff;color:#065f46;box-shadow:0 6px 24px rgba(0,0,0,.15)}
.ct-btn--white:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.2)}
.ct-btn--ghost{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);color:#fff;border:1.5px solid rgba(255,255,255,.2)}
.ct-btn--ghost:hover{background:rgba(255,255,255,.18);transform:translateY(-3px)}
.ct-btn--green{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 6px 20px rgba(6,78,59,.28)}
.ct-btn--green:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(6,78,59,.4)}
.ct-btn--outline{background:#fff;color:#065f46;border:1.5px solid #059669}
.ct-btn--outline:hover{background:#ecfdf5;transform:translateY(-2px)}

/* ═══ SECTIONS ═══ */
.ct-section{padding:clamp(32px,5vw,56px) clamp(16px,4vw,24px);position:relative;overflow:hidden}
.ct-section--white{background:#fff}
.ct-section--mint{background:linear-gradient(180deg,#f0fdf4,#ecfdf5 50%,#f8fffe);position:relative}
.ct-section--mint::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 10% 20%,rgba(6,78,59,.04) 0%,transparent 50%),radial-gradient(circle at 90% 80%,rgba(4,120,87,.03) 0%,transparent 50%)}
.ct-container{max-width:1260px;margin:0 auto;position:relative;z-index:1;width:100%}
.ct-container--sm{max-width:800px}
.ct-container--md{max-width:1040px}
.ct-section-header{text-align:center;margin-bottom:clamp(20px,3.5vw,36px)}
.ct-h2{font-family:'Playfair Display',serif;font-size:clamp(24px,4.2vw,42px);font-weight:800;line-height:1.12;letter-spacing:-.4px;color:#0f172a;margin-bottom:6px}
.ct-h2 em{font-style:normal;background:linear-gradient(135deg,#065f46,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-h2--light{color:#fff}
.ct-h2--light em{background:linear-gradient(90deg,#6ee7b7,#a7f3d0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-subtitle{font-size:clamp(13px,1.3vw,15px);color:#64748b;max-width:480px;margin:0 auto;line-height:1.65}
.ct-subtitle--light{color:rgba(255,255,255,.75)}

/* ═══ MAIN GRID ═══ */
.ct-grid-main{display:grid;grid-template-columns:1fr;gap:clamp(20px,3.5vw,36px);align-items:start}
@media(min-width:1024px){.ct-grid-main{grid-template-columns:5fr 7fr}}

/* ═══ INFO COLUMN ═══ */
.ct-info-col{display:flex;flex-direction:column;gap:clamp(8px,1vw,12px)}
.ct-info-title{font-family:'Playfair Display',serif;font-size:clamp(18px,2vw,22px);font-weight:700;color:#0f172a}
.ct-info-desc{font-size:clamp(13px,1.1vw,14px);color:#64748b;line-height:1.65;margin-bottom:2px}
.ct-cards-stack{display:flex;flex-direction:column;gap:7px}
.ct-contact-card{display:flex;align-items:flex-start;gap:12px;padding:clamp(11px,1.4vw,15px) clamp(12px,1.5vw,16px);background:#fff;border-radius:13px;border:1px solid rgba(6,78,59,.06);box-shadow:0 1px 6px rgba(0,0,0,.02);text-decoration:none;color:inherit;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.ct-contact-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--card-accent,#059669);border-radius:3px 0 0 3px;opacity:0;transition:opacity .25s}
.ct-contact-card:hover{transform:translateX(4px);box-shadow:0 5px 18px rgba(6,78,59,.08);border-color:rgba(6,78,59,.1)}
.ct-contact-card:hover::before{opacity:1}
.ct-cc-icon{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#065f46,#047857);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 3px 10px rgba(6,78,59,.22);transition:transform .25s}
.ct-contact-card:hover .ct-cc-icon{transform:rotate(-4deg) scale(1.05)}
.ct-cc-body{flex:1;min-width:0}
.ct-cc-title{font-size:clamp(12.5px,1vw,13.5px);font-weight:700;color:#0f172a;margin-bottom:1px}
.ct-cc-line{font-size:clamp(11.5px,.95vw,12.5px);color:#64748b;line-height:1.45;word-break:break-word}
.ct-cc-ext{position:absolute;top:10px;right:10px;color:#cbd5e1;opacity:0;transition:opacity .25s}
.ct-contact-card:hover .ct-cc-ext{opacity:1}
.ct-social-box{background:#fff;padding:clamp(11px,1.3vw,16px);border-radius:13px;border:1px solid rgba(6,78,59,.06);box-shadow:0 1px 6px rgba(0,0,0,.02)}
.ct-social-title{font-size:12.5px;font-weight:700;color:#0f172a;margin-bottom:8px}
.ct-social-row{display:flex;flex-wrap:wrap;gap:6px}
.ct-social-link{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;text-decoration:none;background:#ecfdf5;color:#065f46;border:1px solid rgba(6,78,59,.08);transition:all .25s}
.ct-social-link:hover{background:#065f46;color:#fff;box-shadow:0 4px 14px rgba(6,78,59,.24)}

/* ═══ FORM CARD ═══ */
.ct-form-card{background:#fff;border-radius:18px;padding:clamp(16px,2.8vw,30px);box-shadow:0 4px 24px rgba(0,0,0,.04);border:1px solid rgba(6,78,59,.07);position:relative;overflow:hidden}
.ct-form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#064e3b,#047857,#10b981,#047857,#064e3b);background-size:200% 100%;animation:ct-flow 5s ease infinite}
@keyframes ct-flow{0%{background-position:200% 0}100%{background-position:-200% 0}}

.ct-progress{margin-bottom:14px}
.ct-progress-top{display:flex;justify-content:space-between;margin-bottom:3px}
.ct-progress-label{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px}
.ct-progress-pct{font-size:10px;font-weight:700;color:#065f46}
.ct-progress-track{height:3px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.ct-progress-fill{height:100%;background:linear-gradient(90deg,#065f46,#059669);border-radius:2px;transition:width .35s}

.ct-step-tabs{display:flex;align-items:center;gap:0;margin-bottom:18px;padding:9px 12px;background:#f8fafc;border-radius:13px;border:1px solid #e2e8f0}
.ct-step-tab{display:flex;align-items:center;gap:7px;flex:1;padding:2px 0;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;transition:opacity .25s;outline:none}
.ct-step-tab:focus-visible{outline:2px solid #065f46;outline-offset:2px;border-radius:8px}
.ct-step-tab:not(.ct-step-tab--active):not(.ct-step-tab--done){opacity:.4}
.ct-step-tab-dot{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:2px solid #e2e8f0;background:#fff;color:#94a3b8;transition:all .3s}
.ct-step-tab--active .ct-step-tab-dot{background:linear-gradient(135deg,#065f46,#047857);border-color:#065f46;color:#fff;box-shadow:0 3px 12px rgba(6,78,59,.28)}
.ct-step-tab--done .ct-step-tab-dot{background:#047857;border-color:#047857;color:#fff}
.ct-step-tab-meta{display:flex;flex-direction:column}
.ct-step-tab-num{font-size:9px;font-weight:600;color:#94a3b8;letter-spacing:.3px;text-transform:uppercase}
.ct-step-tab-name{font-size:11.5px;font-weight:700;color:#0f172a;line-height:1.2}
.ct-step-tab--active .ct-step-tab-name{color:#065f46}
.ct-step-tab-line{flex:1;height:2px;background:#e2e8f0;margin:0 7px;border-radius:1px;transition:background .35s}
.ct-step-tab-line--done{background:linear-gradient(90deg,#065f46,#059669)}

.ct-step-content{min-height:230px;position:relative}
.ct-step-hdr{margin-bottom:14px}
.ct-step-hdr h4{font-family:'Playfair Display',serif;font-size:clamp(15px,1.7vw,19px);font-weight:700;color:#0f172a;margin-bottom:2px}
.ct-step-hdr p{font-size:12.5px;color:#64748b;line-height:1.55}

.ct-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
@media(max-width:560px){.ct-form-grid{grid-template-columns:1fr}}

.ct-optional-section{margin-top:4px;padding:10px;background:#f8fafc;border-radius:11px;border:1px dashed #e2e8f0}
.ct-optional-label{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}

/* ═══ FORM FIELDS ═══ */
.ct-field{margin-bottom:10px}
.ct-field--full{grid-column:1/-1}
.ct-label{display:flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:#334155;margin-bottom:3px;flex-wrap:wrap}
.ct-label-icon{color:#059669}
.ct-req{color:#ef4444;margin-left:1px}
.ct-hint{font-size:10.5px;color:#94a3b8;margin-top:2px;font-weight:400}
.ct-input-wrap{position:relative;transition:all .25s}
.ct-input,.ct-select{width:100%;padding:10px 34px 10px 11px;font-family:'Inter',sans-serif;font-size:13px;border:1.5px solid #e2e8f0;border-radius:10px;outline:none;background:#f8fafc;color:#1e293b;transition:all .25s cubic-bezier(.4,0,.2,1)}
.ct-input::placeholder{color:#94a3b8}
.ct-input:focus{outline:none}
.ct-focused .ct-input,.ct-focused .ct-select{border-color:#065f46;background:#fff;box-shadow:0 0 0 3px rgba(6,78,59,.06)}
.ct-err .ct-input{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.06)}
.ct-ok .ct-input{border-color:#059669}
.ct-select{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:34px}
.ct-sel-wrap{display:block}
.ct-sel-chevron{position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:#94a3b8;transition:color .25s}
.ct-focused .ct-sel-chevron{color:#065f46}
.ct-icon-r{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex}
.ct-err-msg{display:flex;align-items:center;gap:4px;font-size:10.5px;color:#ef4444;margin-top:2px;font-weight:500;overflow:hidden}

.ct-ta-wrap{display:block}
.ct-textarea{width:100%;padding:10px 11px 36px;font-family:'Inter',sans-serif;font-size:13px;border:1.5px solid #e2e8f0;border-radius:10px;outline:none;background:#f8fafc;color:#1e293b;min-height:110px;resize:vertical;transition:all .25s cubic-bezier(.4,0,.2,1)}
.ct-textarea::placeholder{color:#94a3b8}
.ct-textarea:focus{outline:none}
.ct-focused .ct-textarea{border-color:#065f46;background:#fff;box-shadow:0 0 0 3px rgba(6,78,59,.06)}
.ct-err .ct-textarea{border-color:#ef4444}
.ct-ok .ct-textarea{border-color:#059669}
.ct-char-bar{display:flex;align-items:center;gap:7px;padding:4px 10px 5px}
.ct-char-track{flex:1;height:2px;background:#e2e8f0;border-radius:2px;overflow:hidden}
.ct-char-fill{height:100%;border-radius:2px;transition:width .3s}
.ct-char-count{font-size:10px;font-weight:500;color:#94a3b8;flex-shrink:0}

.ct-server-err{display:flex;align-items:center;gap:6px;padding:9px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;font-size:12.5px;color:#dc2626;font-weight:500;margin-bottom:8px}
.ct-submit{width:100%;padding:12px 22px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,#064e3b,#047857);color:#fff;font-family:'Inter',sans-serif;font-size:13.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 18px rgba(6,78,59,.26);position:relative;overflow:hidden;transition:box-shadow .3s;margin-top:2px}
.ct-submit:hover:not(:disabled){box-shadow:0 10px 30px rgba(6,78,59,.4)}
.ct-submit:disabled{opacity:.8;cursor:wait}
.ct-submit:focus-visible{outline:2px solid #10b981;outline-offset:2px}
.ct-submit-progress{position:absolute;bottom:0;left:0;height:3px;background:rgba(255,255,255,.35);border-radius:0 2px 2px 0;transition:width .12s linear}
.ct-privacy-note{display:flex;align-items:center;justify-content:center;gap:5px;font-size:10.5px;color:#94a3b8;margin-top:8px}
.ct-form-nav{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:8px;border-top:1px solid #f1f5f9;padding-top:12px}
.ct-nav-back{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:#f1f5f9;color:#475569;border:none;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .2s}
.ct-nav-back:hover{background:#e2e8f0}
.ct-nav-back:focus-visible{outline:2px solid #065f46;outline-offset:2px}
.ct-nav-next{display:inline-flex;align-items:center;gap:6px;padding:9px 20px;border-radius:10px;background:linear-gradient(135deg,#065f46,#047857);color:#fff;border:none;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(6,78,59,.24);transition:box-shadow .25s}
.ct-nav-next:hover{box-shadow:0 8px 24px rgba(6,78,59,.36)}
.ct-nav-next:focus-visible{outline:2px solid #10b981;outline-offset:2px}

/* ═══ SUCCESS ═══ */
.ct-success{text-align:center;padding:clamp(20px,3.5vw,36px) 12px}
.ct-success-circle{width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,#065f46,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 10px 30px rgba(6,78,59,.28)}
.ct-success-h{font-family:'Playfair Display',serif;font-size:clamp(19px,2.6vw,24px);font-weight:700;color:#0f172a;margin-bottom:6px}
.ct-success-p{font-size:clamp(12.5px,1.1vw,14px);color:#64748b;line-height:1.65;max-width:320px;margin:0 auto 16px}
.ct-success-email{display:inline-block;background:#ecfdf5;padding:7px 18px;border-radius:11px;margin-bottom:18px;border:1px solid rgba(6,78,59,.1)}
.ct-success-email small{display:block;font-size:10.5px;color:#64748b;margin-bottom:1px}
.ct-success-email strong{font-size:13.5px;color:#065f46}
.ct-success-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}

/* ═══ CHANNELS ═══ */
.ct-channels-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.ct-channel-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:clamp(16px,2.2vw,24px) clamp(12px,1.8vw,20px);background:#fff;border-radius:16px;border:1.5px solid transparent;box-shadow:0 2px 10px rgba(0,0,0,.03);text-decoration:none;color:inherit;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden}
.ct-channel-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--ch-accent,#065f46),transparent 70%);opacity:0;transition:opacity .3s;pointer-events:none}
.ct-channel-card:hover{border-color:var(--ch-accent,#065f46);transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
.ct-channel-card:hover::before{opacity:.04}
.ct-ch-icon{width:46px;height:46px;border-radius:13px;background:#ecfdf5;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--ch-accent,#065f46);margin-bottom:8px;transition:all .25s}
.ct-channel-card:hover .ct-ch-icon{background:var(--ch-accent,#065f46);color:#fff;box-shadow:0 5px 16px rgba(0,0,0,.16)}
.ct-ch-name{font-size:14.5px;font-weight:700;color:#0f172a;margin-bottom:2px}
.ct-ch-sub{font-size:11.5px;color:#94a3b8;margin-bottom:5px}
.ct-ch-detail{font-size:12.5px;font-weight:600;color:var(--ch-accent,#065f46);word-break:break-word}
.ct-ch-arrow{margin-top:8px;width:26px;height:26px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;transition:all .25s}
.ct-channel-card:hover .ct-ch-arrow{background:var(--ch-accent,#065f46);color:#fff}

/* ═══ FAQ TOGGLE ═══ */
.ct-faq-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:clamp(16px,2.2vw,22px) clamp(16px,2.5vw,24px);background:#fff;border-radius:18px;border:1.5px solid rgba(6,78,59,.08);box-shadow:0 3px 16px rgba(6,78,59,.06);cursor:pointer;font-family:'Inter',sans-serif;transition:all .3s;text-align:left}
.ct-faq-toggle:hover{border-color:rgba(6,78,59,.16);box-shadow:0 6px 26px rgba(6,78,59,.1);transform:translateY(-1px)}
.ct-faq-toggle:focus-visible{outline:2px solid #065f46;outline-offset:2px;border-radius:18px}
.ct-faq-toggle__left{display:flex;align-items:center;gap:14px}
.ct-faq-toggle__icon-wrap{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,#065f46,#047857);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 3px 12px rgba(6,78,59,.2)}
.ct-faq-toggle__title{font-family:'Playfair Display',serif;font-size:clamp(16px,2vw,20px);font-weight:700;color:#0f172a;line-height:1.2}
.ct-faq-toggle__sub{font-size:clamp(11px,1vw,12.5px);color:#94a3b8;margin-top:2px;font-weight:500}
.ct-faq-toggle__chevron{width:36px;height:36px;border-radius:10px;background:#ecfdf5;display:flex;align-items:center;justify-content:center;color:#065f46;flex-shrink:0;transition:background .25s}
.ct-faq-toggle:hover .ct-faq-toggle__chevron{background:#d1fae5}

.ct-faq-body{padding-top:16px}

/* ═══ FAQ LIST ═══ */
.ct-faq-list{display:flex;flex-direction:column;gap:6px}
.ct-faq-item{background:#fff;border-radius:13px;border:1px solid rgba(6,78,59,.06);box-shadow:0 1px 5px rgba(0,0,0,.02);overflow:hidden;transition:all .3s;position:relative}
.ct-faq-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#065f46,#059669);border-radius:3px 0 0 3px;opacity:0;transition:opacity .25s}
.ct-faq-item:hover,.ct-faq-item--open{box-shadow:0 3px 14px rgba(6,78,59,.06)}
.ct-faq-item:hover::before,.ct-faq-item--open::before{opacity:1}
.ct-faq-trigger{width:100%;padding:clamp(11px,1.4vw,14px) clamp(11px,1.6vw,16px);display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;text-align:left;font-family:'Inter',sans-serif}
.ct-faq-trigger:focus-visible{outline:2px solid #065f46;outline-offset:-2px;border-radius:13px}
.ct-faq-num{font-size:10.5px;font-weight:700;color:#065f46;background:rgba(6,78,59,.08);width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .25s}
.ct-faq-item--open .ct-faq-num{background:linear-gradient(135deg,#065f46,#047857);color:#fff}
.ct-faq-question{flex:1;font-size:clamp(12.5px,1.1vw,14px);font-weight:650;color:#1e293b;line-height:1.4;transition:color .25s}
.ct-faq-item:hover .ct-faq-question{color:#065f46}
.ct-faq-chevron{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f1f5f9;color:#64748b;flex-shrink:0;transition:all .25s}
.ct-faq-item--open .ct-faq-chevron{background:linear-gradient(135deg,#065f46,#047857);color:#fff;box-shadow:0 2px 8px rgba(6,78,59,.22)}
.ct-faq-answer{padding:0 clamp(11px,1.6vw,16px) clamp(10px,1.4vw,14px) clamp(40px,4.2vw,52px);font-size:clamp(12px,1vw,13.5px);color:#475569;line-height:1.75;border-top:1px solid #f1f5f9;padding-top:8px}
.ct-faq-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:32px 16px;color:#94a3b8;font-size:13px}

/* ═══ CTA ═══ */
.ct-cta-section{background:linear-gradient(135deg,#064e3b,#065f46 45%,#047857);text-align:center}
.ct-cta-pattern{position:absolute;inset:0;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")}
.ct-cta-content{position:relative;z-index:1;max-width:640px;margin:0 auto}
.ct-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px}

/* ═══ SPINNERS ═══ */
.ct-spinner{width:18px;height:18px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:#065f46;animation:ct-spin .7s linear infinite}
@keyframes ct-spin{to{transform:rotate(360deg)}}
.ct-spinner-svg{animation:ct-spin .7s linear infinite}

/* ═══ RESPONSIVE ═══ */
@media(max-width:768px){
  .ct-hero{height:99vh;height:99svh;min-height:99svh}
  .ct-step-tabs{flex-wrap:wrap;gap:5px;padding:8px 9px}
  .ct-step-tab-line{display:none}
  .ct-step-tab{flex:0 0 auto;padding:3px 5px;border-radius:8px;background:#fff;border:1px solid #e2e8f0}
  .ct-step-tab--active{border-color:#065f46;background:#ecfdf5}
  .ct-step-tab--done{border-color:#047857;background:#d1fae5}
  .ct-step-tab-dot{width:26px;height:26px}
  .ct-step-tab-num{font-size:8px}
  .ct-step-tab-name{font-size:10.5px}
  .ct-form-card{padding:clamp(12px,3vw,20px);border-radius:14px}
  .ct-channels-grid{grid-template-columns:1fr}
  .ct-faq-toggle__icon-wrap{width:38px;height:38px;border-radius:11px}
  .ct-faq-toggle{padding:12px 14px;border-radius:14px}
}

@media(max-width:520px){
  .ct-hero-actions,.ct-cta-btns,.ct-success-btns{flex-direction:column;align-items:stretch}
  .ct-btn{justify-content:center}
  .ct-form-nav{flex-direction:column}
  .ct-nav-back,.ct-nav-next{width:100%;justify-content:center}
}

@media(max-width:380px){
  .ct-hero{height:99vh;height:99svh;min-height:99svh}
  .ct-step-tab{gap:3px}
  .ct-step-tab-dot{width:22px;height:22px}
  .ct-step-tab-meta{display:none}
  .ct-faq-toggle__title{font-size:15px}
  .ct-faq-toggle__sub{display:none}
}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
/* Premium responsive contact refresh */
.ct-page{background:#f7faf8;color:#172a22;overflow:clip}
.ct-hero{height:clamp(610px,86svh,860px);min-height:610px;isolation:isolate;background:#073f2d}
.ct-hero-bg{inset:-4%;filter:brightness(.68) saturate(.9);background-position:center 46%;will-change:transform}
.ct-hero-overlay{background:linear-gradient(90deg,rgba(4,35,24,.76),rgba(4,48,32,.48) 52%,rgba(4,45,30,.22)),linear-gradient(0deg,rgba(4,37,25,.46),transparent 58%)}
.ct-hero-content{width:min(calc(100% - 40px),1180px);padding:clamp(70px,10vw,140px) 0 100px}
.ct-hero-h1{max-width:850px;text-wrap:balance;letter-spacing:-.045em;line-height:1.02;font-size:clamp(42px,6.5vw,82px)}
.ct-hero-fog{position:absolute;z-index:2;pointer-events:none;inset:auto 0 -1px;height:clamp(120px,20vw,260px);overflow:hidden}
.ct-hero-fog__layer,.ct-hero-fog__ground{position:absolute;inset:0;display:block}
.ct-hero-fog__layer--one{background:radial-gradient(ellipse at 12% 100%,#fff,rgba(255,255,255,.65) 23%,transparent 63%),radial-gradient(ellipse at 58% 112%,rgba(255,255,255,.92),rgba(255,255,255,.54) 31%,transparent 68%);filter:blur(20px);animation:ct-fog-drift 13s ease-in-out infinite alternate}
.ct-hero-fog__layer--two{background:radial-gradient(ellipse at 85% 100%,#f9fdfa,rgba(249,253,250,.65) 25%,transparent 66%),radial-gradient(ellipse at 38% 115%,rgba(255,255,255,.72),transparent 62%);filter:blur(28px);animation:ct-fog-drift 17s ease-in-out infinite alternate-reverse}
.ct-hero-fog__ground{top:62%;background:linear-gradient(180deg,transparent,#f7faf8 92%)}
@keyframes ct-fog-drift{from{translate:-1.5% 0;scale:1}to{translate:2% -3%;scale:1.06}}
.ct-section{padding:clamp(52px,7vw,92px) clamp(16px,3.6vw,42px)}.ct-container{max-width:1200px}
.ct-section-header{margin-bottom:clamp(26px,4vw,46px)}.ct-h2{font-size:clamp(29px,4vw,46px);letter-spacing:-.035em;line-height:1.08;margin-bottom:12px}
.ct-subtitle{font-size:clamp(14px,1.25vw,16px);line-height:1.8;max-width:570px}
.ct-grid-main{grid-template-columns:minmax(280px,.88fr) minmax(0,1.35fr);gap:clamp(22px,3.2vw,44px);align-items:stretch}
.ct-info-col{gap:15px}.ct-info-title{font-size:clamp(23px,2.3vw,30px)}.ct-info-desc{font-size:14px;line-height:1.8}
.ct-cards-stack{gap:10px}.ct-contact-card{padding:16px;gap:14px;border-radius:17px;border-color:#e5eee8;box-shadow:0 4px 16px rgba(19,54,36,.035);transition:transform .22s,box-shadow .22s,border-color .22s}
.ct-contact-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(19,54,36,.09);border-color:#c9e5d4}
.ct-cc-icon{width:44px;height:44px;border-radius:14px;box-shadow:none}.ct-cc-title{font-size:14px}.ct-cc-line{font-size:13px;line-height:1.65}
.ct-social-box{padding:16px;border-radius:17px;border-color:#e5eee8}.ct-social-link{width:40px;height:40px;border-radius:12px;transition:transform .18s,background .18s,box-shadow .18s}
.ct-social-link:hover{transform:translateY(-3px);box-shadow:0 8px 18px rgba(6,78,59,.18)}
.ct-form-card{padding:clamp(22px,3vw,38px);border-radius:25px;border:1px solid #e1ece5;box-shadow:0 18px 54px rgba(19,54,36,.07),0 2px 8px rgba(19,54,36,.025);background:rgba(255,255,255,.98)}
.ct-form-card::before{height:3px;animation-duration:9s}.ct-progress{margin-bottom:20px}.ct-progress-top{margin-bottom:8px}
.ct-progress-track{height:5px;border-radius:8px;background:#e8f0eb}.ct-progress-fill{border-radius:8px}
.ct-step-tabs{margin-bottom:25px;padding:12px 15px;border-radius:16px;background:#f7faf8;border-color:#e7efe9;gap:10px}
.ct-step-tab{gap:10px;padding:4px;border-radius:11px}.ct-step-tab-dot{width:37px;height:37px;border-width:1px}
.ct-step-tab-name{font-size:13px}.ct-step-content{min-height:230px}.ct-step-hdr{margin-bottom:20px}
.ct-step-hdr h4{font-size:clamp(21px,2vw,25px);margin-bottom:6px}.ct-step-hdr p{font-size:14px;line-height:1.7}
.ct-form-grid{gap:2px 18px}.ct-field{margin-bottom:16px}.ct-label{font-size:12px;font-weight:700;gap:6px;margin-bottom:7px;color:#34483c}
.ct-input,.ct-select{min-height:49px;padding:13px 40px 13px 14px;border-radius:13px;border-width:1px;background:#f8fbf9;font-size:14px}
.ct-focused .ct-input,.ct-focused .ct-select{border-color:#0a8b5c;box-shadow:0 0 0 4px rgba(8,127,88,.09)}
.ct-textarea{min-height:145px;padding:14px 14px 40px;border-radius:13px;border-width:1px;background:#f8fbf9;font-size:14px;line-height:1.65}
.ct-focused .ct-textarea{box-shadow:0 0 0 4px rgba(8,127,88,.09)}
.ct-optional-section{margin-top:12px;padding:15px;border-radius:15px;background:#f7faf8;border-color:#dce9e0}
.ct-submit{min-height:52px;border-radius:14px;font-size:14px;box-shadow:0 8px 22px rgba(6,78,59,.2);transition:transform .2s,box-shadow .2s,filter .2s}
.ct-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 13px 28px rgba(6,78,59,.27)}
.ct-form-nav{margin-top:22px;padding-top:18px;gap:12px}.ct-nav-back,.ct-nav-next{min-height:46px;border-radius:12px;padding:11px 18px;transition:transform .18s,box-shadow .18s}
.ct-nav-back:hover,.ct-nav-next:hover{transform:translateY(-1px)}.ct-privacy-note{font-size:11px;margin-top:12px;line-height:1.6;text-align:center}
.ct-channels-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.ct-channel-card{padding:26px 18px;border-radius:20px;border-color:#e6eee8;box-shadow:0 5px 20px rgba(19,54,36,.035)}
.ct-channel-card:hover{transform:translateY(-5px);box-shadow:0 16px 34px rgba(19,54,36,.09)}.ct-ch-icon{width:52px;height:52px;border-radius:16px}
.ct-faq-toggle,.ct-faq-item{border-color:#e5eee8;box-shadow:0 5px 20px rgba(19,54,36,.035)}.ct-faq-toggle{border-radius:20px;padding:22px}
.ct-faq-item{border-radius:15px}.ct-faq-trigger{padding:17px}.ct-faq-answer{font-size:14px;line-height:1.8;padding-top:13px}
@media(max-width:1023px){.ct-grid-main{grid-template-columns:1fr;gap:26px}.ct-info-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:14px}.ct-info-title,.ct-info-desc{grid-column:1/-1}.ct-cards-stack{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ct-social-box{grid-column:1/-1}}
@media(max-width:767px){.ct-hero{height:82svh;min-height:580px;max-height:780px}.ct-hero-content{width:calc(100% - 36px);padding:92px 0 120px}.ct-hero-h1{font-size:clamp(39px,10vw,64px);line-height:1.04}.ct-section{padding:54px 18px}.ct-info-col{display:flex;gap:12px}.ct-cards-stack{display:grid;grid-template-columns:1fr;gap:10px}.ct-form-card{padding:20px 17px;border-radius:21px}.ct-step-tabs{gap:7px;padding:9px;justify-content:space-between}.ct-step-tab{min-width:0;gap:7px}.ct-step-tab-dot{width:32px;height:32px}.ct-step-content{min-height:0}.ct-form-grid{grid-template-columns:1fr;gap:0}.ct-input,.ct-select{min-height:49px;font-size:16px}.ct-textarea{font-size:16px;min-height:140px}.ct-form-nav{flex-direction:row;align-items:stretch}.ct-nav-back,.ct-nav-next{width:auto;flex:1;justify-content:center}.ct-channels-grid{grid-template-columns:1fr;gap:12px}.ct-channel-card{display:grid;grid-template-columns:48px minmax(0,1fr) 26px;gap:12px;text-align:left;align-items:center;padding:15px}.ct-ch-icon{grid-row:span 3;margin:0}.ct-ch-name,.ct-ch-sub,.ct-ch-detail{grid-column:2;margin:0;min-width:0;overflow-wrap:anywhere}.ct-ch-arrow{grid-column:3;grid-row:1/4;margin:0}.ct-faq-toggle{padding:16px;border-radius:16px}.ct-faq-toggle__title{font-size:17px}.ct-faq-trigger{padding:14px 12px;gap:8px}.ct-faq-answer{padding-left:48px;padding-right:14px}}
@media(max-width:420px){.ct-hero{min-height:540px;height:76svh}.ct-hero-content{width:calc(100% - 30px)}.ct-hero-h1{font-size:clamp(36px,10.5vw,48px)}.ct-step-tab{padding:3px;gap:5px}.ct-step-tab-name{font-size:10.5px}.ct-step-tab-dot{width:27px;height:27px}.ct-form-card{padding:17px 13px}.ct-form-nav{gap:8px}.ct-nav-back,.ct-nav-next{padding:11px 10px}.ct-channel-card{grid-template-columns:42px minmax(0,1fr) 22px;gap:9px}.ct-ch-icon{width:42px;height:42px}}
@media(prefers-reduced-motion:reduce){.ct-hero-fog__layer,.ct-contact-card,.ct-social-link,.ct-channel-card,.ct-submit,.ct-btn{animation:none!important;transition:none!important}}


/* Premium Altuvera Safaris contact refresh */
.ct-page{--ct-forest:#064e3b;--ct-green:#087f58;--ct-emerald:#10b981;--ct-mint:#ecf8f0;--ct-ink:#14271f;--ct-muted:#64766d;--ct-border:#e0ebe4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ct-ink);background:#f7faf8;overflow:clip}
.ct-page button,.ct-page input,.ct-page select,.ct-page textarea{font:inherit}.ct-page a{-webkit-tap-highlight-color:transparent}
.ct-hero{min-height:clamp(610px,84svh,860px);height:clamp(610px,84svh,860px);padding-top:clamp(60px,7vw,90px);isolation:isolate;position:relative;background:#073f2d;overflow:hidden}
.ct-hero-bg{inset:-5%;background-position:center 43%;filter:brightness(.66) saturate(.86);transform:translateZ(0)}
.ct-hero-overlay{background:linear-gradient(90deg,rgba(3,29,20,.8),rgba(4,50,32,.54) 52%,rgba(4,45,30,.2)),linear-gradient(0deg,rgba(5,50,34,.48),transparent 58%)}
.ct-hero-content{width:min(calc(100% - 48px),1180px);max-width:1180px;padding:clamp(38px,6vw,92px) 0 clamp(110px,12vw,150px);text-align:left;margin-inline:auto}
.ct-hero-kicker{display:inline-flex;align-items:center;justify-content:flex-start;gap:10px;margin:0 0 clamp(20px,2.8vw,32px);padding:9px 14px;border:1px solid rgba(220,255,237,.25);border-radius:999px;background:rgba(2,38,25,.27);color:rgba(242,255,248,.91);font-size:clamp(9px,.8vw,11px);letter-spacing:.16em;font-weight:800;line-height:1.3;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.ct-hero-kicker-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 0 5px rgba(110,231,183,.12)}
.ct-hero-h1{max-width:920px;font-family:"Playfair Display",Georgia,serif;font-size:clamp(44px,6.7vw,88px);font-weight:700;line-height:1.015;letter-spacing:-.045em;text-wrap:balance;margin:0 0 24px}
.ct-hero-h1 em{background:linear-gradient(95deg,#a7f3d0,#6ee7b7 48%,#d1fae5);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ct-hero-sub{max-width:570px;margin:0 0 30px;font-size:clamp(15px,1.45vw,18px);line-height:1.8;color:rgba(244,255,248,.84);font-weight:400}
.ct-hero-actions{justify-content:flex-start;gap:12px}
.ct-btn{min-height:48px;padding:13px 20px;gap:9px;border-radius:13px;font-size:13px;font-weight:750;letter-spacing:.005em;transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s ease,background .2s ease,border-color .2s ease,color .2s ease}
.ct-btn svg{flex:0 0 auto}.ct-btn--white{box-shadow:0 9px 26px rgba(0,0,0,.15)}.ct-btn--white:hover{transform:translateY(-3px);box-shadow:0 16px 35px rgba(0,0,0,.2)}.ct-btn--ghost{border:1px solid rgba(255,255,255,.33);background:rgba(255,255,255,.07);backdrop-filter:blur(9px)}.ct-btn--ghost:hover{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.55)}
.ct-scroll-hint{bottom:27px}.ct-scroll-mouse{width:24px;height:38px;border-color:rgba(255,255,255,.55);border-radius:99px}.ct-scroll-wheel{width:3px;height:7px;border-radius:4px;background:#fff}
.ct-hero-fog{z-index:3;height:clamp(150px,19vw,260px);bottom:-1px}
.ct-hero-fog__layer--one{background:radial-gradient(ellipse at 10% 105%,rgba(255,255,255,.98),rgba(255,255,255,.68) 24%,transparent 65%),radial-gradient(ellipse at 55% 110%,rgba(255,255,255,.94),rgba(255,255,255,.48) 33%,transparent 70%);filter:blur(21px);animation:ct-fog-drift 14s ease-in-out infinite alternate}
.ct-hero-fog__layer--two{background:radial-gradient(ellipse at 88% 105%,rgba(247,252,249,.98),rgba(247,252,249,.64) 27%,transparent 67%),radial-gradient(ellipse at 35% 118%,rgba(255,255,255,.7),transparent 64%);filter:blur(30px);animation:ct-fog-drift 18s ease-in-out infinite alternate-reverse}
.ct-hero-fog__ground{top:55%;background:linear-gradient(180deg,transparent,rgba(247,250,248,.84) 66%,#f7faf8 96%)}
@keyframes ct-fog-drift{from{translate:-1.7% 0;scale:1}to{translate:2% -3%;scale:1.07}}
.ct-section{padding:clamp(58px,7vw,100px) clamp(18px,4vw,48px)}.ct-section--mint{background:linear-gradient(180deg,#f7faf8,#f1f8f3)}.ct-section--white{background:#fff}
.ct-container{width:100%;max-width:1220px;margin-inline:auto}.ct-container--md{max-width:1050px}.ct-container--sm{max-width:900px}
.ct-section-header{max-width:760px;margin:0 auto clamp(30px,4.6vw,54px);text-align:center}
.ct-h2{font-family:"Playfair Display",Georgia,serif;font-size:clamp(30px,4vw,48px);line-height:1.1;letter-spacing:-.035em;color:#152e22;margin-bottom:14px;text-wrap:balance}.ct-h2 em{color:#087f58;font-style:normal}
.ct-subtitle{max-width:590px;margin-inline:auto;color:#66776d;font-size:clamp(14px,1.3vw,16px);line-height:1.8}
.ct-grid-main{display:grid;grid-template-columns:minmax(280px,.82fr) minmax(0,1.18fr);gap:clamp(22px,3.8vw,54px);align-items:start}
.ct-info-col{display:flex;flex-direction:column;gap:15px;min-width:0}.ct-info-title{font-family:"Playfair Display",Georgia,serif;font-size:clamp(24px,2.5vw,32px);line-height:1.14;letter-spacing:-.025em;color:#173729;margin:0}.ct-info-desc{font-size:14px;line-height:1.8;color:#66776d;max-width:480px;margin:0 0 3px}
.ct-cards-stack{display:grid;grid-template-columns:minmax(0,1fr);gap:11px}
.ct-contact-card{display:flex;align-items:center;gap:14px;min-width:0;min-height:84px;padding:16px;border:1px solid #e4ece6;border-radius:18px;background:rgba(255,255,255,.91);box-shadow:0 5px 18px rgba(22,63,42,.035);text-decoration:none;color:inherit;transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s,border-color .2s}
.ct-contact-card:hover,.ct-contact-card:focus-visible{transform:translateY(-3px);border-color:#c6e3d1;box-shadow:0 12px 28px rgba(22,63,42,.08);outline:none}
.ct-cc-icon{width:46px;height:46px;flex:0 0 46px;border-radius:14px;background:linear-gradient(145deg,#0a7451,#07573d);display:grid;place-items:center;color:white;box-shadow:0 7px 16px rgba(6,78,59,.15);transition:transform .2s}.ct-contact-card:hover .ct-cc-icon{transform:translateY(-1px) scale(1.04)}
.ct-cc-body{min-width:0;flex:1}.ct-cc-title{font-size:13px;font-weight:800;letter-spacing:.005em;color:#344a3c;margin-bottom:3px}.ct-cc-line{font-size:13px;line-height:1.65;color:#62766a;overflow-wrap:anywhere}.ct-cc-ext{color:#91a89a;flex:0 0 auto}
.ct-social-box{padding:18px 17px;border:1px solid #e3ece6;border-radius:18px;background:rgba(255,255,255,.75)}.ct-social-title{font-size:12px;font-weight:800;letter-spacing:.04em;color:#344a3c;margin-bottom:13px}.ct-social-row{display:flex;flex-wrap:wrap;gap:9px}
.ct-social-link{display:grid;place-items:center;width:41px;height:41px;border:1px solid #e3eee7;border-radius:13px;background:#fff;color:#087f58;transition:transform .18s ease,background .18s ease,color .18s ease,box-shadow .18s ease}.ct-social-link:hover,.ct-social-link:focus-visible{transform:translateY(-3px);background:#087f58;color:#fff;box-shadow:0 8px 18px rgba(6,78,59,.16);outline:none}
.ct-form-card{position:relative;isolation:isolate;overflow:hidden;min-width:0;padding:clamp(22px,3.5vw,42px);border:1px solid rgba(214,231,220,.95);border-radius:clamp(22px,2.5vw,30px);background:rgba(255,255,255,.96);box-shadow:0 22px 60px rgba(16,58,36,.08),0 3px 12px rgba(16,58,36,.03),inset 0 1px 0 rgba(255,255,255,.9)}
.ct-form-card::before{display:none!important;content:none!important}.ct-progress,.ct-progress-pct,.ct-progress-track,.ct-submit-progress,.ct-char-track,.ct-char-fill{display:none!important}
.ct-form-bubble-layer{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;border-radius:inherit;contain:paint}
.ct-form-bubble{position:absolute;display:block;border:1px solid rgba(16,185,129,.22);border-radius:50%;background:radial-gradient(circle at 30% 28%,rgba(255,255,255,.94),rgba(137,225,177,.12) 42%,rgba(16,185,129,.035) 72%,transparent);box-shadow:inset 0 0 12px rgba(255,255,255,.52),0 5px 20px rgba(8,127,88,.035);transform:translate3d(0,0,0);will-change:transform}
.ct-form-bubble--1{animation-name:ct-form-float-one;animation-timing-function:ease-in-out;animation-iteration-count:infinite}.ct-form-bubble--2{animation-name:ct-form-float-two;animation-timing-function:ease-in-out;animation-iteration-count:infinite}.ct-form-bubble--3{animation-name:ct-form-float-three;animation-timing-function:ease-in-out;animation-iteration-count:infinite}.ct-form-bubble--4{animation-name:ct-form-float-four;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes ct-form-float-one{0%,100%{transform:translate3d(0,0,0) scale(.94)}50%{transform:translate3d(14px,-20px,0) scale(1.06)}}@keyframes ct-form-float-two{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-16px,-25px,0) scale(.9)}}@keyframes ct-form-float-three{0%,100%{transform:translate3d(0,0,0) scale(.95)}50%{transform:translate3d(7px,18px,0) scale(1.08)}}@keyframes ct-form-float-four{0%,100%{transform:translate3d(0,0,0) scale(1.02)}50%{transform:translate3d(-12px,15px,0) scale(.92)}}
.ct-form-card>*:not(.ct-form-bubble-layer){position:relative;z-index:1}
.ct-form-intro{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:24px}.ct-form-eyebrow{display:block;font-size:10px;font-weight:850;letter-spacing:.16em;color:#087f58;margin-bottom:8px}.ct-form-intro h3{font-family:"Playfair Display",Georgia,serif;font-size:clamp(23px,2.5vw,30px);font-weight:700;line-height:1.16;letter-spacing:-.035em;color:#18392a;margin:0 0 7px}.ct-form-intro p{font-size:13px;line-height:1.7;color:#6e7f74;margin:0;max-width:390px}.ct-form-intro-icon{width:46px;height:46px;flex:0 0 46px;display:grid;place-items:center;border:1px solid #dcefe3;border-radius:15px;background:linear-gradient(145deg,#effaf3,#dff4e7);color:#087f58}
.ct-step-tabs{margin-bottom:24px;padding:8px 10px;gap:8px;border:1px solid #e3ece6;border-radius:16px;background:rgba(247,251,248,.88)}.ct-step-tab{gap:9px;padding:5px 7px;border-radius:12px;opacity:.74;transition:opacity .18s,background .18s,transform .18s}.ct-step-tab:hover{opacity:1;background:#f0f8f3}.ct-step-tab--active,.ct-step-tab--done{opacity:1}.ct-step-tab--active{background:#edf8f1}.ct-step-tab-dot{width:35px;height:35px;font-size:14px;border:1px solid #dce8e0}.ct-step-tab--active .ct-step-tab-dot{background:linear-gradient(140deg,#09815a,#065f46);border-color:#087f58;box-shadow:0 4px 12px rgba(6,78,59,.18)}.ct-step-tab--done .ct-step-tab-dot{background:#087f58;border-color:#087f58}.ct-step-tab-num{font-size:9px;letter-spacing:.12em}.ct-step-tab-name{font-size:12px}.ct-step-tab-line{min-width:12px;opacity:.65;margin:0 1px}
.ct-step-content{min-height:0}.ct-step-hdr{margin-bottom:20px}.ct-step-hdr h4{font-family:"Playfair Display",Georgia,serif;font-size:clamp(22px,2vw,27px);line-height:1.18;color:#193b2b;letter-spacing:-.03em}.ct-step-hdr p{margin-top:6px;color:#718176;font-size:13px;line-height:1.7}
.ct-form-grid{gap:2px 16px}.ct-field{margin-bottom:17px;min-width:0}.ct-label{color:#354b3d;font-size:12px;font-weight:750;line-height:1.4;margin-bottom:8px}.ct-label-icon{color:#087f58;width:15px;height:15px;stroke-width:1.9}.ct-req{color:#0b9567}.ct-input-wrap{min-width:0}
.ct-input,.ct-select,.ct-textarea{width:100%;min-width:0;border:1px solid #dce8e0;border-radius:13px;background:rgba(249,252,250,.94);color:#20392b;font-size:14px;transition:border-color .17s ease,box-shadow .17s ease,background .17s ease,transform .17s ease}.ct-input,.ct-select{min-height:50px;padding:13px 42px 13px 14px}.ct-input::placeholder,.ct-textarea::placeholder{color:#9aa99f}.ct-input:hover,.ct-select:hover,.ct-textarea:hover{border-color:#c4ddcd}.ct-focused .ct-input,.ct-focused .ct-select,.ct-focused .ct-textarea{border-color:#07865c;background:#fff;box-shadow:0 0 0 4px rgba(8,127,88,.085)}.ct-err .ct-input,.ct-err .ct-textarea{border-color:#e58a8a;background:#fffafa}.ct-ok .ct-input{border-color:#a7d9bb}
.ct-err-msg{gap:6px;font-size:11px;font-weight:600;line-height:1.45;margin-top:6px}.ct-hint{font-size:11px;line-height:1.5;color:#839389;margin-top:5px}.ct-icon-r{right:12px}.ct-textarea{min-height:158px;padding:14px;line-height:1.75;resize:vertical}.ct-char-bar{display:flex;justify-content:flex-end;padding:5px 2px 0}.ct-char-count{font-size:10px;color:#8a9a90}
.ct-optional-section{padding:17px;border:1px solid #e2ece5;border-radius:17px;background:rgba(246,250,247,.84);margin-top:14px}.ct-optional-label{font-size:10px;letter-spacing:.12em;color:#587165}.ct-destination-picker{padding:16px;border:1px solid #e1ece5;border-radius:16px;background:rgba(248,252,249,.92)}.ct-destination-picker-heading strong{font-size:13px;color:#124a34}.ct-destination-picker-heading p{font-size:12px;line-height:1.65}.ct-destination-toggle{font-size:11px}.ct-destination-search-wrap{min-height:46px;border-radius:12px;border-color:#dbe8df;background:#fff}.ct-destination-search-wrap input{font-size:14px;min-width:0}.ct-destination-results{border-radius:13px;box-shadow:0 12px 24px rgba(16,58,36,.1)}.ct-destination-results button{min-height:43px;transition:background .15s,color .15s}.ct-destination-results button:hover{background:#eef8f1;color:#087f58}.ct-destination-chips>span{border:1px solid #cde8d6;background:#edf8f1;color:#086a49;border-radius:999px}.ct-destination-chips button{width:23px;height:23px;border-radius:50%;transition:background .15s}.ct-destination-chips button:hover{background:#d1ecdb}
.ct-server-err{padding:12px 14px;border-radius:13px;font-size:12px;line-height:1.6;margin:6px 0 12px}.ct-submit{min-height:53px;padding:14px 20px;gap:10px;border-radius:14px;background:linear-gradient(115deg,#075b40,#087f58 55%,#0b9867);box-shadow:0 9px 22px rgba(6,78,59,.19);font-size:14px;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease}.ct-submit::after{content:"";position:absolute;inset:0;transform:translateX(-110%);background:linear-gradient(105deg,transparent,rgba(255,255,255,.16),transparent);transition:transform .45s ease;pointer-events:none}.ct-submit:hover:not(:disabled)::after{transform:translateX(110%)}.ct-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 28px rgba(6,78,59,.26)}.ct-submit:active:not(:disabled){transform:translateY(0) scale(.99)}.ct-submit:disabled{opacity:.76}.ct-privacy-note{margin-top:13px;font-size:10px;color:#7e9185;line-height:1.6}.ct-privacy-note svg{width:14px;height:14px;color:#087f58}
.ct-form-nav{margin-top:22px;padding-top:17px;border-color:#e7eee9;gap:12px}.ct-nav-back,.ct-nav-next{min-height:46px;padding:11px 17px;border-radius:12px;font-size:12.5px;transition:transform .17s ease,box-shadow .17s ease,background .17s ease}.ct-nav-back{background:#f2f6f3;color:#465a4d}.ct-nav-back:hover{background:#e8f3eb;transform:translateY(-1px)}.ct-nav-next{background:linear-gradient(135deg,#087f58,#065f46);box-shadow:0 5px 14px rgba(6,78,59,.16)}.ct-nav-next:hover{transform:translateY(-2px);box-shadow:0 9px 20px rgba(6,78,59,.22)}
.ct-success{padding:clamp(24px,4vw,45px) clamp(3px,1vw,12px);text-align:center}.ct-success-kicker{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;margin:0 auto 20px;border:1px solid #d6eddf;border-radius:999px;background:#f0faf4;color:#087f58;font-size:9px;letter-spacing:.14em;font-weight:850}.ct-success-circle{width:88px;height:88px;margin:0 auto 21px;border:1px solid rgba(255,255,255,.85);background:linear-gradient(145deg,#0b9867,#066044);color:#fff;box-shadow:0 14px 32px rgba(6,78,59,.2),0 0 0 9px rgba(16,185,129,.08)}.ct-success-h{max-width:480px;margin:0 auto 10px;font-size:clamp(26px,3.2vw,36px);line-height:1.12;letter-spacing:-.04em;color:#18392a}.ct-success-p{max-width:430px;font-size:14px;line-height:1.8;margin:0 auto 22px;color:#65786b}
.ct-success-email{display:flex;align-items:center;justify-content:flex-start;gap:13px;width:min(100%,430px);margin:0 auto 11px;padding:14px 15px;border:1px solid #d9ebe0;border-radius:16px;background:rgba(247,252,248,.9);text-align:left}.ct-success-email-icon{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;border-radius:13px;background:#e3f5e9;color:#087f58}.ct-success-email-copy{min-width:0;display:flex;flex-direction:column;gap:3px}.ct-success-email small{font-size:11px;color:#75867a}.ct-success-email strong{font-size:13px;color:#194a34;overflow-wrap:anywhere}
.ct-success-next{display:flex;align-items:flex-start;gap:12px;width:min(100%,430px);padding:14px 15px;margin:0 auto 25px;border:1px solid #e8eee9;border-radius:16px;background:rgba(255,255,255,.8);text-align:left}.ct-success-next-icon{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:11px;background:#f0f6f2;color:#47715b}.ct-success-next>span:last-child{display:flex;flex-direction:column;gap:4px;min-width:0}.ct-success-next strong{font-size:12px;color:#294737}.ct-success-next small{font-size:11px;line-height:1.65;color:#738379}.ct-success-btns{gap:10px}.ct-success-btns .ct-btn{min-height:46px}
.ct-cta-section{position:relative;overflow:hidden;background:radial-gradient(ellipse at 15% 0%,rgba(110,231,183,.16),transparent 42%),linear-gradient(125deg,#073f2d,#065f46 55%,#087f58)}.ct-cta-section .ct-h2{font-size:clamp(30px,4vw,46px)}.ct-cta-section .ct-subtitle{line-height:1.8}.ct-cta-btns{gap:12px}
.ct-channel-card{min-width:0;border:1px solid #e5eee8;border-radius:22px;background:#fff;box-shadow:0 6px 24px rgba(19,54,36,.045);transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s,border-color .2s}.ct-channel-card:hover,.ct-channel-card:focus-visible{transform:translateY(-5px);border-color:#c7e5d2;box-shadow:0 18px 38px rgba(19,54,36,.1);outline:none}.ct-ch-icon{width:52px;height:52px;border-radius:16px;font-size:22px;background:#edf8f1;color:#087f58}.ct-channel-card:hover .ct-ch-icon{background:#087f58;color:#fff}
.ct-faq-toggle,.ct-faq-item{border-color:#e2ece5}.ct-faq-toggle{gap:12px;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.ct-faq-toggle:hover{transform:translateY(-2px);border-color:#c9e6d4}.ct-faq-toggle__icon-wrap{background:linear-gradient(140deg,#0a825a,#075c42)}.ct-faq-question{font-size:clamp(13px,1.1vw,15px);line-height:1.5}.ct-faq-answer{line-height:1.8}.ct-page :focus-visible{outline:2px solid #10a875;outline-offset:3px}
@media(min-width:1400px){.ct-container{max-width:1260px}.ct-grid-main{grid-template-columns:minmax(310px,.78fr) minmax(0,1.22fr);gap:56px}}
@media(max-width:1023px){.ct-grid-main{grid-template-columns:minmax(0,1fr);gap:28px}.ct-info-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:14px}.ct-info-title,.ct-info-desc{grid-column:1/-1;max-width:720px}.ct-cards-stack{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ct-social-box{grid-column:1/-1}.ct-form-card{padding:clamp(22px,4vw,36px)}.ct-channel-card{padding:23px 15px}}
@media(max-width:767px){
.ct-hero{height:clamp(590px,82svh,780px);min-height:590px;max-height:790px;padding-top:56px}.ct-hero-content{width:calc(100% - 38px);padding:54px 0 122px;text-align:left}.ct-hero-kicker{max-width:100%;font-size:9px;letter-spacing:.1em;padding:8px 10px;gap:7px;margin-bottom:22px}.ct-hero-h1{font-size:clamp(41px,9.6vw,66px);line-height:1.04;margin-bottom:18px}.ct-hero-sub{font-size:15px;line-height:1.75;margin-bottom:25px;max-width:480px}.ct-hero-actions{display:grid;grid-template-columns:minmax(0,1fr);width:min(100%,330px);justify-content:stretch;gap:10px}.ct-btn{min-height:48px;width:100%;justify-content:center}.ct-hero-fog{height:clamp(130px,25vw,210px)}.ct-scroll-hint{bottom:22px}
.ct-section{padding:58px 18px}.ct-section-header{text-align:left;margin:0 0 30px}.ct-section-header .ct-subtitle{margin:0;max-width:580px}.ct-h2{font-size:clamp(29px,7.7vw,40px);line-height:1.1}.ct-grid-main{gap:26px}.ct-info-col{display:flex;gap:13px}.ct-info-title{font-size:27px}.ct-info-desc{font-size:13.5px}.ct-cards-stack{grid-template-columns:minmax(0,1fr);gap:10px}.ct-contact-card{min-height:76px;padding:14px;border-radius:16px}.ct-cc-icon{width:43px;height:43px;flex-basis:43px;border-radius:13px}.ct-social-box{padding:15px}
.ct-form-card{padding:22px 17px;border-radius:22px}.ct-form-intro{gap:10px;margin-bottom:20px}.ct-form-eyebrow{font-size:9px;letter-spacing:.13em}.ct-form-intro h3{font-size:25px}.ct-form-intro p{font-size:12px;line-height:1.65}.ct-form-intro-icon{width:40px;height:40px;flex-basis:40px;border-radius:13px}.ct-step-tabs{padding:7px;gap:5px;margin-bottom:22px}.ct-step-tab{flex:1;min-width:0;gap:7px;padding:5px;border:1px solid transparent}.ct-step-tab-dot{width:30px;height:30px;flex:0 0 30px}.ct-step-tab-meta{min-width:0;display:flex!important}.ct-step-tab-num{font-size:8px}.ct-step-tab-name{font-size:11px;white-space:normal}.ct-step-tab-line{min-width:7px}.ct-step-hdr{margin-bottom:17px}.ct-step-hdr h4{font-size:23px}.ct-step-hdr p{font-size:12.5px}.ct-form-grid{grid-template-columns:minmax(0,1fr);gap:0}.ct-field{margin-bottom:15px}.ct-input,.ct-select{min-height:50px;font-size:16px;padding:13px 42px 13px 13px}.ct-textarea{font-size:16px;min-height:150px}.ct-optional-section{padding:14px;border-radius:15px}.ct-destination-picker{padding:13px;border-radius:15px}.ct-destination-picker-heading{gap:11px}.ct-destination-toggle{width:100%;justify-content:flex-start}.ct-destination-search-wrap input{font-size:16px}
.ct-form-nav{flex-direction:row;align-items:stretch;margin-top:20px;padding-top:15px}.ct-nav-back,.ct-nav-next{width:auto;flex:1;justify-content:center;padding:11px 10px}.ct-privacy-note{align-items:flex-start;text-align:center}.ct-success{padding:22px 0}.ct-success-circle{width:76px;height:76px;margin-bottom:20px}.ct-success-h{font-size:28px}.ct-success-p{font-size:13px}.ct-success-email,.ct-success-next{padding:12px}.ct-success-btns{flex-direction:column;align-items:stretch}.ct-success-btns .ct-btn{width:100%}
.ct-channels-grid{grid-template-columns:minmax(0,1fr);gap:11px}.ct-channel-card{display:grid;grid-template-columns:47px minmax(0,1fr) 24px;gap:10px;align-items:center;text-align:left;padding:14px;border-radius:17px}.ct-ch-icon{grid-column:1;grid-row:1/4;width:45px;height:45px;margin:0;border-radius:14px}.ct-ch-name,.ct-ch-sub,.ct-ch-detail{grid-column:2;min-width:0;margin:0;overflow-wrap:anywhere}.ct-ch-name{font-size:14px}.ct-ch-sub{font-size:11px}.ct-ch-detail{font-size:12px}.ct-ch-arrow{grid-column:3;grid-row:1/4;margin:0}
.ct-faq-toggle{padding:15px;border-radius:16px}.ct-faq-toggle__left{gap:11px;min-width:0}.ct-faq-toggle__icon-wrap{width:40px;height:40px;flex:0 0 40px}.ct-faq-toggle__title{font-size:16px}.ct-faq-toggle__sub{font-size:11px;line-height:1.45}.ct-faq-toggle__chevron{width:31px;height:31px;flex:0 0 31px}.ct-faq-trigger{padding:14px 11px;gap:9px}.ct-faq-answer{padding-left:46px;padding-right:13px;font-size:13px}.ct-cta-section .ct-h2{text-align:left}.ct-cta-content{text-align:left}.ct-cta-content .ct-subtitle{text-align:left;margin:0}.ct-cta-btns{display:grid;grid-template-columns:minmax(0,1fr);width:min(100%,330px);margin-top:22px}
}
@media(max-width:420px){.ct-hero{height:clamp(570px,80svh,690px);min-height:570px}.ct-hero-content{width:calc(100% - 30px);padding-top:48px}.ct-hero-h1{font-size:clamp(38px,10.2vw,46px);letter-spacing:-.04em}.ct-hero-kicker{font-size:8px;letter-spacing:.075em}.ct-section{padding:48px 14px}.ct-form-card{padding:19px 13px;border-radius:20px}.ct-form-intro h3{font-size:23px}.ct-form-intro-icon{display:none}.ct-step-tabs{gap:4px;padding:6px}.ct-step-tab{gap:5px;padding:4px 3px}.ct-step-tab-dot{width:27px;height:27px;flex-basis:27px}.ct-step-tab-num{display:none}.ct-step-tab-name{font-size:10.5px}.ct-form-nav{gap:8px}.ct-nav-back,.ct-nav-next{font-size:12px;padding:11px 8px}.ct-success-h{font-size:25px}.ct-success-email strong{font-size:12px}.ct-faq-toggle__sub{display:none}}
@media(prefers-reduced-motion:reduce){.ct-form-bubble,.ct-hero-fog__layer,.ct-hero-orb{animation:none!important}.ct-contact-card,.ct-social-link,.ct-channel-card,.ct-submit,.ct-btn,.ct-step-tab,.ct-nav-back,.ct-nav-next{transition:none!important}}

`;

export default Contact;