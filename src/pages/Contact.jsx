// src/pages/Contact.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, useInView, useScroll, useTransform, motion } from "framer-motion";
import {
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare,
  FiCheckCircle, FiUser, FiAlertCircle, FiChevronDown, FiUsers,
  FiGlobe, FiArrowRight, FiArrowLeft, FiHelpCircle,
  FiShield, FiExternalLink, FiCalendar,
} from "react-icons/fi";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp, FaTiktok,
} from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import SEO from "../components/common/SEO";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { sendMessage } from "../utils/sendMessage";
import { useUserAuth } from "../context/UserAuthContext";

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
  { icon: FiMail, title: "Email Us", lines: ["altuverasafari@gmail.com"], href: "mailto:altuverasafari@gmail.com", accent: "#065f46" },
  { icon: FiClock, title: "Working Hours", lines: ["Mon–Fri: 8 AM – 6 PM", "Sat: 9 AM – 2 PM"], accent: "#064e3b" },
];

const TRIP_TYPES = [
  "Safari Adventure", "Mountain Trekking", "Gorilla Trekking",
  "Beach Holiday", "Cultural Tour", "Photography Safari",
  "Honeymoon", "Family Trip",
];

const SOCIALS = [
  { icon: FaFacebookF, label: "Facebook", url: "#", color: "#1877F2" },
  { icon: FaInstagram, label: "Instagram", url: "#", color: "#E1306C" },
  { icon: FaTwitter, label: "Twitter", url: "#", color: "#1DA1F2" },
  { icon: FaYoutube, label: "YouTube", url: "#", color: "#FF0000" },
  { icon: FaWhatsapp, label: "WhatsApp", url: "https://wa.me/250785751391", color: "#25D366" },
  { icon: FaTiktok, label: "TikTok", url: "#", color: "#000" },
];

const QUICK_CHANNELS = [
  { icon: FaWhatsapp, title: "WhatsApp", subtitle: "Instant chat", detail: "+250 785 751 391", href: "https://wa.me/250785751391", color: "#25D366" },
  { icon: FiPhone, title: "Call Us", subtitle: "Speak to an expert", detail: "+250 792 352 409", href: "tel:+250792352409", color: "#047857" },
  { icon: FiMail, title: "Email", subtitle: "Detailed inquiries", detail: "altuverasafari@gmail.com", href: "mailto:altuverasafari@gmail.com", color: "#3B82F6" },
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
  const pct = (chars / maxLength) * 100;
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
        <div className="ct-char-bar">
          <div className="ct-char-track">
            <motion.div className="ct-char-fill" animate={{ width: `${pct}%` }}
              style={{ background: pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#059669" }} />
          </div>
          <span className="ct-char-count" style={{ color: pct > 90 ? "#ef4444" : undefined }}>{chars}/{maxLength}</span>
        </div>
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

  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
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
    setSubmitting(true); setSubmitProgress(0); setErrors(p => ({ ...p, submit: "" }));
    const tick = setInterval(() => setSubmitProgress(p => Math.min(p + 10, 88)), 100);
    try {
      const res = await sendMessage(form);
      if (res?.error) throw new Error(res.error);
      setSubmittedEmail(form.email);
      setSubmitProgress(100);
      setTimeout(() => { if (mounted.current) setSubmitted(true); }, 250);
    } catch (err) {
      setErrors(p => ({ ...p, submit: err?.message || "Something went wrong. Please try again." }));
    } finally {
      clearInterval(tick);
      if (mounted.current) setSubmitting(false);
    }
  }, [form, validateStep]);

  const resetForm = useCallback(() => {
    setSubmitted(false); setStep(0); setDirection(1); setForm(INIT_FORM);
    setTouched({}); setErrors({}); setSubmitProgress(0); setSubmittedEmail("");
    autoFilled.current = false;
  }, []);

  const completion = useMemo(() => {
    const req = ["name", "email", "subject", "message"];
    return Math.round(req.filter(k => form[k]?.trim()).length / req.length * 100);
  }, [form]);

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

      {/* ═══ HERO ═══ */}
      <section className="ct-hero" ref={heroRef}>
        <motion.div className="ct-hero-bg"
          style={{ backgroundImage: "url(https://i.pinimg.com/736x/bb/ca/d1/bbcad1c07136f38bfc47257f8b38cf2a.jpg)", y: heroY }}
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }} />
        <div className="ct-hero-overlay" />

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
          <motion.div className="ct-hero-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}>
            {["2,400+ Happy Guests", "12 Countries", "< 2hr Response"].map((s, i) => (
              <div key={i} className="ct-hero-stat">
                <FiCheckCircle size={11} /> {s}
              </div>
            ))}
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
                  <motion.div key="done" className="ct-form-card"
                    initial={{ opacity: 0, scale: 0.92, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE.snappy }}>
                    <div className="ct-success">
                      <motion.div className="ct-success-circle"
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.12, duration: 0.45, ease: EASE.bounce }}>
                        <FiCheckCircle size={44} color="#fff" />
                      </motion.div>
                      <motion.h3 className="ct-success-h"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        Message Sent Successfully
                      </motion.h3>
                      <motion.p className="ct-success-p"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                        Our safari experts will get back to you within 24 hours.
                      </motion.p>
                      <motion.div className="ct-success-email"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                        <small>Confirmation sent to</small>
                        <strong>{submittedEmail}</strong>
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
                    {/* Progress */}
                    <div className="ct-progress">
                      <div className="ct-progress-top">
                        <span className="ct-progress-label">Progress</span>
                        <span className="ct-progress-pct">{completion}%</span>
                      </div>
                      <div className="ct-progress-track">
                        <motion.div className="ct-progress-fill" animate={{ width: `${completion}%` }} transition={{ duration: 0.35 }} />
                      </div>
                    </div>
                    {/* Step tabs */}
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
                            <FormInput name="subject" label="Subject" icon={FiMessageSquare}
                              placeholder="e.g. 7-Day Gorilla Trekking Inquiry" required
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
                                  <div className="ct-submit-progress" style={{ width: `${submitProgress}%` }} />
                                </>
                              ) : (
                                <><RiSendPlaneFill size={16} /> Send Message</>
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

/* ═══ HERO ═══ */
.ct-hero{position:relative;min-height:80vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
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
  .ct-hero{min-height:66vh}
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
  .ct-hero{min-height:58vh}
  .ct-step-tab{gap:3px}
  .ct-step-tab-dot{width:22px;height:22px}
  .ct-step-tab-meta{display:none}
  .ct-faq-toggle__title{font-size:15px}
  .ct-faq-toggle__sub{display:none}
}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;

export default Contact;