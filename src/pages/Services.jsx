// src/pages/Services.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import {
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiAward,
  FiHeart,
  FiShield,
  FiClock,
  FiStar,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiMapPin,
  FiCalendar,
  FiCompass,
  FiGlobe,
  FiSun,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import CookieSettingsButton from "../components/common/CookieSettingsButton";
import AnimatedSection from "../components/common/AnimatedSection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";
import ServiceIcon from "../components/icons/ServiceIconSimple";

// ============================================================================
// THEME
// ============================================================================
const T = {
  g950: "#052e16", g900: "#14532d", g800: "#166534", g700: "#15803d",
  g600: "#16a34a", g500: "#22c55e", g400: "#4ade80", g300: "#86efac",
  g200: "#bbf7d0", g100: "#dcfce7", g50: "#f0fdf4",
  white: "#ffffff", offWhite: "#f8fffe",
  tDark: "#052e16", tMed: "#14532d", tBody: "#166534",
  tMuted: "#15803d", tLight: "#22c55e",
  surfaceLight: "#f0fdf4", surfaceMid: "#e8f8ed",
  border: "#bbf7d0", borderMid: "#86efac",
  overlay: "rgba(5,46,22,0.92)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
  rSm: "8px", rMd: "12px", rLg: "16px", rXl: "20px",
  r2Xl: "24px", r3Xl: "32px", rFull: "9999px",
  shadowSm: "0 1px 4px rgba(5,46,22,0.07)",
  shadowMd: "0 4px 20px rgba(5,46,22,0.10)",
  shadowLg: "0 12px 36px rgba(5,46,22,0.14)",
  shadowXl: "0 24px 52px rgba(5,46,22,0.17)",
  shadow2Xl: "0 32px 72px rgba(5,46,22,0.22)",
  shadowCard: "0 8px 32px rgba(5,46,22,0.12), 0 2px 8px rgba(5,46,22,0.06)",
  shadowHover: "0 24px 64px rgba(5,46,22,0.20), 0 0 0 1px rgba(22,163,74,0.15)",
  shadowGlow: "0 0 60px rgba(34,197,94,0.20)",
  tFast: "140ms cubic-bezier(0.4,0,0.2,1)",
  tBase: "240ms cubic-bezier(0.4,0,0.2,1)",
  tSmooth: "400ms cubic-bezier(0.22,1,0.36,1)",
  tSpring: "500ms cubic-bezier(0.34,1.56,0.64,1)",
};

// ============================================================================
// DATA
// ============================================================================
const HERO_TEXTS = [
  "Unforgettable journeys crafted with precision",
  "Expert-guided adventures across East Africa",
  "Luxury meets authentic wilderness experience",
  "Personalized itineraries for every traveler",
  "Where dreams become extraordinary memories",
];

const PROCESS_STEPS = [
  { step: "01", title: "Discovery Call", icon: FiMessageCircle, color: T.g400,
    descriptions: ["Share your travel dreams and preferences", "Discuss budget, dates, and group size", "Get expert recommendations instantly"] },
  { step: "02", title: "Custom Itinerary", icon: FiCalendar, color: T.g300,
    descriptions: ["Receive a tailored travel blueprint", "Every detail designed around you", "Handpicked accommodations and routes"] },
  { step: "03", title: "Fine-Tuning", icon: FiCompass, color: T.g400,
    descriptions: ["Refine every detail to perfection", "Add special requests and surprises", "Finalize your dream itinerary"] },
  { step: "04", title: "Adventure Time", icon: FiMapPin, color: T.g300,
    descriptions: ["Embark with 24/7 ground support", "Expert guides at every destination", "Create memories that last forever"] },
];

const WHY_US = [
  { icon: FiAward, title: "Expert Local Guides", stat: "15+", statLabel: "Years Experience", accent: T.g600,
    desc: ["Our guides bring decades of combined field experience across diverse African terrains.", "Each team member is a certified wildlife and safety expert.", "Deep regional cultural knowledge provides an authentic perspective."] },
  { icon: FiShield, title: "Safety Guaranteed", stat: "100%", statLabel: "Safety Record", accent: T.g700,
    desc: ["Rigorous safety protocols adhering to highest international standards.", "Full premium insurance included in every booking.", "Emergency support systems active 24/7."] },
  { icon: FiHeart, title: "Personalized Care", stat: "5,000+", statLabel: "Happy Travelers", accent: T.g600,
    desc: ["Every itinerary tailored to your unique travel style and interests.", "Unique experiences that go beyond the ordinary.", "Close attention to every detail for a seamless journey."] },
  { icon: FiClock, title: "24/7 Support", stat: "24/7", statLabel: "Available", accent: T.g700,
    desc: ["Round-the-clock live assistance whenever you need it.", "Continuous support from booking until you return home.", "Professional consultants always a call away."] },
  { icon: FiUsers, title: "Small Groups", stat: "8–12", statLabel: "Max Group Size", accent: T.g600,
    desc: ["Intimate experiences allowing meaningful connections with nature.", "Maximum personal attention throughout your expedition.", "No overcrowded tours — exclusivity guaranteed."] },
  { icon: FiStar, title: "Best Value", stat: "4.9★", statLabel: "Average Rating", accent: T.g700,
    desc: ["Premium quality at fair, competitive pricing.", "Transparent all-inclusive rates — no hidden extras.", "Comfort, adventure, and world-class service in one package."] },
];

const TESTIMONIALS = [
  { quote: "The safari exceeded all our expectations. Every detail was perfectly planned and the guides were incredibly knowledgeable.", author: "Sarah Mitchell", role: "Wildlife Photographer", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { quote: "Altuvera made our honeymoon absolutely magical. From the Serengeti to Zanzibar, every moment was perfect.", author: "James & Emily", role: "Honeymoon Trip", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { quote: "Professional, responsive, and truly passionate about African travel. I've booked three trips with them now.", author: "Michael Chen", role: "Adventure Traveler", rating: 5, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
];

const CTA_TEXTS = [
  "🌍 Trusted by 5,000+ travelers worldwide",
  "⭐ Rated 4.9/5 across all platforms",
  "🏆 Award-winning East Africa specialists",
  "🛡️ 100% satisfaction guarantee",
];

// ============================================================================
// HOOKS
// ============================================================================
const useKeyboardClose = (fn) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
};

const useRotating = (len, ms = 3000) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (len <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % len), ms);
    return () => clearInterval(t);
  }, [len, ms]);
  return i;
};

// ── Intersection Observer–based scroll reveal ──
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px", ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

// ── Auto-staggered grid reveal ──
const useGridReveal = (count, threshold = 0.08) => {
  const containerRef = useRef(null);
  const [visibleSet, setVisibleSet] = useState(new Set());
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(container.children);
    const observers = items.map((el, idx) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSet((prev) => new Set([...prev, idx]));
            obs.disconnect();
          }
        },
        { threshold, rootMargin: "0px 0px -32px 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [count, threshold]);
  return [containerRef, visibleSet];
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
      50%       { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
    }

    /* ── Grid reveal animation ── */
    .grid-item-reveal {
      opacity: 0;
      transform: translateY(36px) scale(0.97);
      transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                  transform 0.6s cubic-bezier(0.22,1,0.36,1);
    }
    .grid-item-reveal.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* ── Service card hover ── */
    .svc-card-new {
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.45s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.3s ease;
    }
    .svc-card-new:hover {
      transform: translateY(-12px) scale(1.012) !important;
      box-shadow: 0 32px 80px rgba(5,46,22,0.22), 0 0 0 1px rgba(22,163,74,0.2) !important;
    }
    .svc-card-new:focus-visible {
      outline: 3px solid #22c55e;
      outline-offset: 4px;
      border-radius: 20px;
    }
    .svc-card-new .card-cta-bar {
      transition: background 0.4s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.4s ease;
    }
    .svc-card-new:hover .card-cta-bar {
      background: linear-gradient(135deg, #15803d, #16a34a) !important;
      border-color: #15803d !important;
    }
    .svc-card-new .card-cta-label {
      transition: color 0.3s ease;
    }
    .svc-card-new:hover .card-cta-label { color: #ffffff !important; }
    .svc-card-new .card-cta-arrow {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  background 0.3s ease, color 0.3s ease;
    }
    .svc-card-new:hover .card-cta-arrow {
      transform: translateX(5px) !important;
      background: rgba(255,255,255,0.2) !important;
      color: #ffffff !important;
    }
    .svc-card-new .card-img {
      transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
    }
    .svc-card-new:hover .card-img { transform: scale(1.08) !important; }
    .svc-card-new .card-icon-badge {
      transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
    }
    .svc-card-new:hover .card-icon-badge {
      transform: scale(1.15) rotate(-8deg) !important;
    }
    .svc-card-new .card-accent-bar {
      transition: width 0.55s cubic-bezier(0.22,1,0.36,1);
      width: 0%;
    }
    .svc-card-new:hover .card-accent-bar { width: 100% !important; }

    /* ── Why card hover ── */
    .why-card {
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.45s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.3s ease;
    }
    .why-card:hover {
      transform: translateY(-8px) !important;
      box-shadow: 0 20px 56px rgba(5,46,22,0.16) !important;
    }
    .why-card .why-accent { transform: scaleX(0); transform-origin: left; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }
    .why-card:hover .why-accent { transform: scaleX(1) !important; }
    .why-card .why-icon { transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
    .why-card:hover .why-icon { transform: scale(1.1) rotate(-4deg) !important; }

    /* ── Process card ── */
    .proc-card {
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                  background 0.4s ease, border-color 0.4s ease;
    }
    .proc-card:hover {
      transform: translateY(-8px) !important;
      background: rgba(255,255,255,0.10) !important;
      border-color: rgba(255,255,255,0.18) !important;
    }

    /* ── Testi card ── */
    .testi-card {
      transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.4s ease;
    }
    .testi-card:hover {
      transform: translateY(-6px) !important;
      box-shadow: 0 20px 56px rgba(5,46,22,0.14) !important;
    }

    /* ── CTA contact links ── */
    .cl-link {
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }
    .cl-link:hover {
      background: ${T.g50} !important;
      border-color: ${T.g300} !important;
      transform: translateX(4px) !important;
    }

    /* ── Scrollbar ── */
    .modal-scroll::-webkit-scrollbar { width: 4px; }
    .modal-scroll::-webkit-scrollbar-track { background: ${T.g50}; }
    .modal-scroll::-webkit-scrollbar-thumb { background: ${T.g300}; border-radius: 2px; }
    .modal-scroll::-webkit-scrollbar-thumb:hover { background: ${T.g500}; }

    /* ── Responsive auto-grids ── */
    .auto-grid-services {
      display: grid;
      gap: 28px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    }
    .auto-grid-process {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
    }
    .auto-grid-why {
      display: grid;
      gap: 22px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    }
    .auto-grid-testi {
      display: grid;
      gap: 22px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    }

    @media (max-width: 480px) {
      .auto-grid-services { grid-template-columns: 1fr; gap: 18px; }
      .auto-grid-process  { grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .auto-grid-why      { grid-template-columns: 1fr; gap: 16px; }
      .auto-grid-testi    { grid-template-columns: 1fr; gap: 16px; }
    }
    @media (min-width: 481px) and (max-width: 767px) {
      .auto-grid-services { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .auto-grid-process  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .auto-grid-why      { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .auto-grid-testi    { grid-template-columns: 1fr; gap: 16px; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .auto-grid-services { grid-template-columns: repeat(2, 1fr); gap: 22px; }
      .auto-grid-process  { grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .auto-grid-why      { grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .auto-grid-testi    { grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }
    @media (min-width: 1024px) and (max-width: 1279px) {
      .auto-grid-services { grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .auto-grid-process  { grid-template-columns: repeat(4, 1fr); gap: 20px; }
      .auto-grid-why      { grid-template-columns: repeat(3, 1fr); gap: 22px; }
      .auto-grid-testi    { grid-template-columns: repeat(3, 1fr); gap: 22px; }
    }
    @media (min-width: 1280px) {
      .auto-grid-services { grid-template-columns: repeat(3, 1fr); gap: 28px; }
      .auto-grid-process  { grid-template-columns: repeat(4, 1fr); gap: 24px; }
      .auto-grid-why      { grid-template-columns: repeat(3, 1fr); gap: 24px; }
      .auto-grid-testi    { grid-template-columns: repeat(3, 1fr); gap: 24px; }
    }
  `}</style>
);

// ============================================================================
// MOTION VARIANTS
// ============================================================================
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};
const swap = {
  enter:  { opacity: 0, y: 10, filter: "blur(3px)" },
  center: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -10, filter: "blur(3px)", transition: { duration: 0.26 } },
};

// ============================================================================
// ATOMS
// ============================================================================
const Skeleton = () => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 1,
    background: `linear-gradient(90deg, ${T.g100} 0%, ${T.g50} 50%, ${T.g100} 100%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 1.6s infinite linear",
  }} />
);

const Badge = ({ children, light = false, style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "6px 16px",
    borderRadius: T.rFull,
    fontSize: "10px", fontWeight: "700", fontFamily: T.sans,
    textTransform: "uppercase", letterSpacing: "2.5px",
    backgroundColor: light ? "rgba(255,255,255,0.07)" : T.g50,
    color:           light ? T.g300 : T.g700,
    border:          light ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${T.g200}`,
    backdropFilter:  light ? "blur(12px)" : "none",
    ...style,
  }}>
    {children}
  </span>
);

const Pip = ({ active, total, vertical = false }) => (
  <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: "4px", alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{
        width:  vertical ? "4px" : (i === active ? "16px" : "4px"),
        height: vertical ? (i === active ? "16px" : "4px") : "4px",
        borderRadius: T.rFull,
        backgroundColor: i === active ? T.g600 : T.g200,
        transition: `all 0.4s cubic-bezier(0.22,1,0.36,1)`,
        flexShrink: 0,
      }} />
    ))}
  </div>
);

const Rotating = ({ texts, ms = 3200, style = {} }) => {
  const i = useRotating(texts.length, ms);
  return (
    <div style={{ position: "relative", height: "22px", overflow: "hidden", ...style }}>
      <AnimatePresence mode="wait">
        <motion.span key={i} variants={swap} initial="enter" animate="center" exit="exit"
          style={{ position: "absolute", inset: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {texts[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// ── Auto-grid reveal wrapper ──
const GridRevealItem = ({ index, children, delay = 0 }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`grid-item-reveal${visible ? " visible" : ""}`}
      style={{ transitionDelay: `${(index % 6) * 80 + delay}ms` }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = ({ label, title, subtitle, center = true, light = false }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      style={{
        textAlign: center ? "center" : "left",
        marginBottom: "clamp(40px,6vw,72px)",
        maxWidth: center ? "780px" : "none",
        marginLeft: center ? "auto" : undefined,
        marginRight: center ? "auto" : undefined,
      }}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: "16px" }}>
        <Badge light={light}>{label}</Badge>
      </motion.div>
      <motion.h2 variants={fadeUp} style={{
        fontFamily: T.serif,
        fontSize: "clamp(26px,5vw,52px)",
        fontWeight: "800",
        color: light ? T.white : T.tDark,
        lineHeight: "1.08",
        letterSpacing: "-0.035em",
        marginBottom: subtitle ? "20px" : 0,
      }}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} style={{
          fontFamily: T.sans,
          fontSize: "clamp(14px,1.8vw,17px)",
          color: light ? "rgba(255,255,255,0.65)" : T.tMuted,
          lineHeight: "1.8",
          maxWidth: center ? "600px" : "none",
          margin: center ? "0 auto" : 0,
        }}>
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================================================
// SERVICE CARD — Redesigned
// ============================================================================
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgOk, setImgOk] = useState(false);
  const slideI = useRotating(
    (Array.isArray(service.gallery) && service.gallery.length
      ? service.gallery
      : Array.isArray(service.images) && service.images.length
      ? service.images
      : [service.image]
    ).length,
    4200
  );

  const imgs = useMemo(() => {
    const g = Array.isArray(service.gallery) && service.gallery.length ? service.gallery : null;
    const f = Array.isArray(service.images) && service.images.length ? service.images : null;
    return g || f || [service.image];
  }, [service]);

  const feats = useMemo(
    () => (service.features?.length ? service.features.slice(0, 5) : [service.description]),
    [service]
  );
  const featI = useRotating(feats.length, 3200);

  useEffect(() => {
    if (imgs.length <= 1) return;
    setImgOk(false);
    setImgIdx(slideI);
  }, [imgs.length, slideI]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(service); }
  }, [onClick, service]);

  const prev = (e) => { e.stopPropagation(); setImgOk(false); setImgIdx((p) => (p - 1 + imgs.length) % imgs.length); };
  const next = (e) => { e.stopPropagation(); setImgOk(false); setImgIdx((p) => (p + 1) % imgs.length); };

  return (
    <article
      className="svc-card-new"
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={handleKey}
      style={{
        position: "relative",
        backgroundColor: T.white,
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowCard,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* ── IMAGE SECTION ── */}
      <div style={{ position: "relative", height: isMobile ? "200px" : "240px", overflow: "hidden", flexShrink: 0 }}>
        {!imgOk && <Skeleton />}

        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={imgs[imgIdx]}
            alt=""
            role="presentation"
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgOk(true)}
            className="card-img"
            initial={{ opacity: 0 }}
            animate={{ opacity: imgOk ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
            }}
          />
        </AnimatePresence>

        {/* Rich gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(180deg,
              rgba(5,46,22,0.08) 0%,
              rgba(5,46,22,0.18) 40%,
              rgba(5,46,22,0.82) 100%
            )
          `,
        }} />

        {/* Slide controls */}
        {imgs.length > 1 && ["left", "right"].map((side) => (
          <button
            key={side}
            type="button"
            aria-label={`${side} image`}
            onClick={side === "left" ? prev : next}
            style={{
              position: "absolute", top: "50%", [side]: "10px",
              transform: "translateY(-50%)",
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(5,46,22,0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: T.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 4,
              transition: `opacity ${T.tBase}, background ${T.tBase}`,
            }}
          >
            {side === "left" ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
          </button>
        ))}

        {/* Slide dots */}
        {imgs.length > 1 && (
          <div style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px", zIndex: 4 }}>
            {imgs.slice(0, 6).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); setImgOk(false); setImgIdx(i); }}
                style={{
                  width: i === imgIdx ? "22px" : "6px", height: "6px",
                  borderRadius: T.rFull,
                  background: i === imgIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: `all ${T.tSmooth}`,
                }}
              />
            ))}
          </div>
        )}

        {/* Top-left: Premium tag */}
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          display: "flex", gap: "6px", zIndex: 5,
        }}>
          <span style={{
            padding: "4px 12px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderRadius: T.rFull,
            fontSize: "9px", fontWeight: "800", fontFamily: T.sans,
            color: T.g700, textTransform: "uppercase", letterSpacing: "1.5px",
            border: `1px solid ${T.g100}`,
          }}>
            Premium
          </span>
        </div>

        {/* Bottom overlay: title preview */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 18px 16px",
          zIndex: 3,
        }}>
          <h3 style={{
            fontFamily: T.serif,
            fontSize: isMobile ? "18px" : "22px",
            fontWeight: "700",
            color: T.white,
            lineHeight: "1.2",
            marginBottom: "6px",
            textShadow: "0 1px 8px rgba(5,46,22,0.5)",
          }}>
            {service.title}
          </h3>
          {/* Mini feature ticker on image */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: T.g400,
              animation: "pulse-glow 2s infinite",
              flexShrink: 0,
            }} />
            <div style={{ position: "relative", height: "16px", overflow: "hidden", flex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={featI}
                  variants={swap} initial="enter" animate="center" exit="exit"
                  style={{
                    position: "absolute", inset: 0,
                    fontSize: "11px", fontFamily: T.sans, fontWeight: "500",
                    color: "rgba(255,255,255,0.82)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {feats[featI]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* ── BODY ── */}
      <div style={{
        padding: isMobile ? "28px 16px 20px" : "30px 20px 22px",
        flex: 1, display: "flex", flexDirection: "column",
      }}>
        {/* Description */}
        <p style={{
          fontFamily: T.sans, fontSize: "13px",
          color: T.tMuted, lineHeight: "1.72",
          marginBottom: "16px",
          display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {service.description}
        </p>

        {/* Feature chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
          {service.features.slice(0, 3).map((f, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "4px 10px",
              backgroundColor: i === 0 ? T.g50 : "#f8fffe",
              borderRadius: T.rFull,
              fontSize: "11px", fontFamily: T.sans, fontWeight: "500",
              color: i === 0 ? T.g700 : T.tMuted,
              border: `1px solid ${i === 0 ? T.g200 : T.border}`,
              maxWidth: "180px", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <FiCheck size={9} strokeWidth={3} color={T.g600} style={{ flexShrink: 0 }} />
              {f}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: `linear-gradient(90deg, ${T.g100}, transparent)`, marginBottom: "16px" }} />

        {/* CTA bar */}
        <div
          className="card-cta-bar"
          style={{
            marginTop: "auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            backgroundColor: T.g50,
            borderRadius: T.rLg,
            border: `1px solid ${T.g200}`,
          }}
        >
          <span
            className="card-cta-label"
            style={{
              fontSize: "13px", fontWeight: "600", fontFamily: T.sans,
              color: T.g700,
            }}
          >
            Explore Service
          </span>
          <span
            className="card-cta-arrow"
            style={{
              width: "30px", height: "30px", borderRadius: "50%",
              backgroundColor: T.g100,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.g600,
            }}
          >
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="card-accent-bar"
        style={{
          position: "absolute", bottom: 0, left: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${T.g400}, ${T.g700})`,
        }}
      />
    </article>
  );
};

// ============================================================================
// PROCESS CARD — Redesigned
// ============================================================================
const ProcessCard = ({ step, index, total, isMobile }) => {
  const di = useRotating(step.descriptions.length, 2800);
  const Icon = step.icon;

  return (
    <div
      className="proc-card"
      style={{
        position: "relative",
        textAlign: "center",
        padding: isMobile ? "44px 16px 28px" : "52px 22px 36px",
        borderRadius: "20px",
        backgroundColor: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Step number badge */}
      <div style={{
        position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)",
        width: "36px", height: "36px", borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.g400}, ${T.g500})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: "800", fontFamily: T.sans,
        color: T.g950,
        boxShadow: `0 4px 16px rgba(34,197,94,0.35)`,
        border: "2px solid rgba(255,255,255,0.15)",
      }}>
        {step.step}
      </div>

      {/* Icon ring */}
      <div style={{
        width: "60px", height: "60px", borderRadius: "18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px",
        color: step.color,
      }}>
        <Icon size={isMobile ? 20 : 24} />
      </div>

      <h3 style={{
        fontFamily: T.serif, fontSize: isMobile ? "16px" : "19px",
        fontWeight: "700", color: T.white, marginBottom: "10px",
      }}>
        {step.title}
      </h3>

      {/* Rotating description */}
      <div style={{ height: "48px", overflow: "hidden", position: "relative", marginBottom: "10px" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={di} variants={swap} initial="enter" animate="center" exit="exit"
            style={{
              position: "absolute", inset: 0,
              fontSize: isMobile ? "12px" : "13px",
              fontFamily: T.sans, color: "rgba(255,255,255,0.55)", lineHeight: "1.7",
              padding: "0 4px",
            }}
          >
            {step.descriptions[di]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Pip total={step.descriptions.length} active={di} />
      </div>

      {/* Connector */}
      {!isMobile && index < total - 1 && (
        <div style={{
          position: "absolute", top: "50%", right: "-12px",
          transform: "translateY(-50%)",
          width: "22px", height: "1px",
          background: "rgba(255,255,255,0.15)",
          zIndex: 2,
        }}>
          <FiChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)", position: "absolute", right: "-8px", top: "-7px" }} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WHY CARD — Redesigned
// ============================================================================
const WhyCard = ({ item, index, isMobile }) => {
  const di = useRotating(item.desc.length, 3400);
  const Icon = item.icon;

  return (
    <div
      className="why-card"
      style={{
        position: "relative",
        backgroundColor: T.white,
        borderRadius: "20px",
        padding: isMobile ? "24px 20px" : "32px 26px",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bar */}
      <div
        className="why-accent"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: `linear-gradient(90deg, ${T.g400}, ${T.g700})`,
        }}
      />

      {/* BG blob */}
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "120px", height: "120px", borderRadius: "50%",
        background: `radial-gradient(circle, ${T.g100} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Stat badge — top right */}
      <div style={{
        position: "absolute", top: "16px", right: "16px",
        padding: "6px 12px",
        background: T.g50,
        border: `1px solid ${T.g200}`,
        borderRadius: T.rFull,
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", fontWeight: "800", fontFamily: T.sans, color: T.g600, lineHeight: 1 }}>
          {item.stat}
        </div>
        <div style={{ fontSize: "9px", fontFamily: T.sans, fontWeight: "600", color: T.tMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "2px" }}>
          {item.statLabel}
        </div>
      </div>

      {/* Icon */}
      <div
        className="why-icon"
        style={{
          width: "50px", height: "50px", borderRadius: "14px",
          background: `linear-gradient(135deg, ${T.g50}, ${T.g100})`,
          border: `1px solid ${T.g200}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.g600, marginBottom: "14px", flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>

      <h3 style={{
        fontFamily: T.serif, fontSize: isMobile ? "16px" : "19px",
        fontWeight: "700", color: T.tDark, marginBottom: "12px", lineHeight: "1.25",
      }}>
        {item.title}
      </h3>

      {/* Rotating desc */}
      <div style={{ height: "72px", overflow: "hidden", position: "relative", marginBottom: "12px", flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={di} variants={swap} initial="enter" animate="center" exit="exit"
            style={{
              position: "absolute", inset: 0,
              fontSize: "13px", fontFamily: T.sans, color: T.tMuted, lineHeight: "1.72",
            }}
          >
            {item.desc[di]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ marginBottom: "0" }}>
        <Pip total={item.desc.length} active={di} />
      </div>
    </div>
  );
};

// ============================================================================
// TESTIMONIAL CARD — Redesigned
// ============================================================================
const TestiCard = ({ testimonial, index }) => {
  const [imgOk, setImgOk] = useState(false);

  return (
    <div
      className="testi-card"
      style={{
        backgroundColor: T.white,
        borderRadius: "20px",
        padding: "clamp(22px,4vw,32px)",
        boxShadow: T.shadowCard,
        border: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        height: "100%", position: "relative", overflow: "hidden",
      }}
    >
      {/* Quote mark watermark */}
      <div style={{
        position: "absolute", top: "-8px", right: "16px",
        fontSize: "96px", fontFamily: T.serif,
        color: T.g100, lineHeight: 1,
        pointerEvents: "none", userSelect: "none",
        fontWeight: "700",
      }}>
        "
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "14px", position: "relative" }}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <FiStar key={i} size={13} fill={T.g500} color={T.g500} />
        ))}
      </div>

      <p style={{
        fontFamily: T.sans,
        fontSize: "clamp(13px,1.8vw,15px)",
        color: T.tBody,
        lineHeight: "1.8",
        fontStyle: "italic",
        flex: 1, marginBottom: "22px",
        position: "relative",
      }}>
        "{testimonial.quote}"
      </p>

      {/* Author row */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 16px",
        background: T.g50,
        borderRadius: T.rLg,
        border: `1px solid ${T.g100}`,
      }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "50%",
          overflow: "hidden", border: `2px solid ${T.g300}`,
          backgroundColor: T.g100, flexShrink: 0,
          boxShadow: `0 2px 8px rgba(5,46,22,0.15)`,
        }}>
          <img
            src={testimonial.avatar} alt={testimonial.author} loading="lazy"
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: `opacity ${T.tBase}` }}
          />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", fontFamily: T.sans, color: T.tDark, marginBottom: "1px" }}>
            {testimonial.author}
          </div>
          <div style={{ fontSize: "11px", fontFamily: T.sans, color: T.tMuted, fontWeight: "500" }}>
            {testimonial.role}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.g500}, ${T.g700})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FiCheck size={12} color={T.white} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SERVICE MODAL
// ============================================================================
const ServiceModal = ({ service, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgOk, setImgOk] = useState(false);
  const modalRef = useRef(null);
  const featI = useRotating(service.features?.length ?? 0, 2400);

  useKeyboardClose(onClose);

  useEffect(() => {
    const sy = window.scrollY;
    Object.assign(document.body.style, { position: "fixed", top: `-${sy}px`, width: "100%", overflow: "hidden" });
    return () => {
      Object.assign(document.body.style, { position: "", top: "", width: "", overflow: "" });
      window.scrollTo(0, sy);
    };
  }, []);

  useEffect(() => { modalRef.current?.focus(); }, []);

  const contacts = useMemo(() => [
    { href: "tel:+250792352409",           Icon: FiPhone,         label: "+250 792352409", ext: true },
    { href: "/contact",                    Icon: FiMessageCircle, label: "Live Chat",          ext: false },
  ], []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${service.title} details`}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        backgroundColor: T.overlay, backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "24px",
      }}
    >
      <motion.div
        ref={modalRef} tabIndex={-1} className="modal-scroll"
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: T.white,
          borderRadius: isMobile ? "20px" : "28px",
          maxWidth: "880px", width: "100%",
          maxHeight: "92vh", overflowY: "auto",
          position: "relative",
          boxShadow: T.shadow2Xl,
          outline: "none",
        }}
      >
        {/* Close */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Close"
          style={{
            position: "absolute", top: "14px", right: "14px",
            width: "40px", height: "40px", borderRadius: "50%",
            backgroundColor: "rgba(5,46,22,0.55)", color: T.white,
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
          }}
        >
          <FiX size={18} />
        </motion.button>

        {/* Hero */}
        <div style={{
          position: "relative",
          height: isMobile ? "210px" : "310px",
          overflow: "hidden",
          borderRadius: isMobile ? "20px 20px 0 0" : "28px 28px 0 0",
        }}>
          {!imgOk && <Skeleton />}
          <img
            src={service.image} alt={service.title} onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: `opacity ${T.tBase}` }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${T.g950}E8 0%, ${T.g950}40 50%, transparent 100%)`,
          }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "20px" : "32px", color: T.white }}>
            <Badge style={{ marginBottom: "10px" }}>Signature Experience</Badge>
            <h2 style={{
              fontFamily: T.serif, fontSize: isMobile ? "22px" : "34px",
              fontWeight: "700", margin: 0, lineHeight: "1.2",
            }}>
              {service.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "22px 18px" : "36px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
            gap: isMobile ? "28px" : "36px",
          }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{
                  fontSize: "11px", fontWeight: "700", fontFamily: T.sans,
                  color: T.tDark, marginBottom: "10px",
                  display: "flex", alignItems: "center", gap: "6px",
                  textTransform: "uppercase", letterSpacing: "1.2px",
                }}>
                  <FiCompass size={13} color={T.g600} /> About This Experience
                </h3>
                <p style={{ fontSize: "14px", fontFamily: T.sans, color: T.tMuted, lineHeight: "1.8" }}>
                  {service.description} Our expert team ensures every aspect of your{" "}
                  {service.title.toLowerCase()} is meticulously curated to exceed world-class standards.
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: "11px", fontWeight: "700", fontFamily: T.sans,
                  color: T.tDark, marginBottom: "12px",
                  display: "flex", alignItems: "center", gap: "6px",
                  textTransform: "uppercase", letterSpacing: "1.2px",
                }}>
                  <FiCheck size={13} color={T.g600} /> What's Included
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {service.features.map((feat, idx) => {
                    const active = idx === featI;
                    return (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + idx * 0.04 }}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: "10px",
                          padding: "8px 12px", borderRadius: T.rMd,
                          backgroundColor: active ? T.g50 : "transparent",
                          border: `1px solid ${active ? T.g200 : "transparent"}`,
                          color: active ? T.g700 : T.tMuted,
                          fontWeight: active ? "600" : "400",
                          fontSize: "13px", fontFamily: T.sans, lineHeight: "1.6",
                          transition: `all ${T.tSmooth}`,
                        }}
                      >
                        <span style={{
                          width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                          backgroundColor: active ? T.g600 : T.g100,
                          color: active ? T.white : T.g600,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: "2px", transition: `all ${T.tBase}`,
                        }}>
                          <FiCheck size={9} strokeWidth={3} />
                        </span>
                        {feat}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Right — booking */}
            <div>
              <div style={{
                backgroundColor: T.g50,
                padding: isMobile ? "22px" : "28px",
                borderRadius: T.rXl,
                border: `1px solid ${T.g200}`,
                position: isMobile ? "static" : "sticky",
                top: "24px",
              }}>
                <h4 style={{
                  fontSize: "11px", fontWeight: "700", fontFamily: T.sans,
                  color: T.g800, marginBottom: "8px",
                  textTransform: "uppercase", letterSpacing: "1.2px",
                }}>
                  Ready to Book?
                </h4>
                <p style={{ fontSize: "13px", fontFamily: T.sans, color: T.tMuted, marginBottom: "20px", lineHeight: "1.68" }}>
                  Let our expert team craft your perfect {service.title.toLowerCase()} experience.
                </p>
                <Button to="/booking" variant="primary" fullWidth size="large" icon={<FiArrowRight size={14} />}>
                  Start Planning
                </Button>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
                  {contacts.map(({ href, Icon, label, ext }) => {
                    const s = {
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 14px",
                      backgroundColor: T.white, borderRadius: T.rMd,
                      fontSize: "12px", fontFamily: T.sans, fontWeight: "500",
                      color: T.tBody, border: `1px solid ${T.border}`,
                      textDecoration: "none", cursor: "pointer",
                    };
                    return ext ? (
                      <a key={label} href={href} className="cl-link" style={s}>
                        <Icon size={13} color={T.g600} /> {label}
                      </a>
                    ) : (
                      <Link key={label} to={href} className="cl-link" style={s} onClick={onClose}>
                        <Icon size={13} color={T.g600} /> {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// SCROLL BAR
// ============================================================================
const ScrollBar = ({ progress }) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
    aria-label="Page scroll progress"
    style={{
      position: "fixed", top: 0, left: 0, zIndex: 10001,
      height: "3px", width: `${progress}%`,
      background: `linear-gradient(90deg, ${T.g400}, ${T.g500}, ${T.g700})`,
      transition: "width 80ms linear",
      boxShadow: progress > 0 ? `0 0 14px ${T.g500}55` : "none",
    }}
  />
);

// ============================================================================
// STAT STRIP
// ============================================================================
const StatStrip = ({ isMobile }) => {
  const stats = [
    { value: "5,000+", label: "Happy Travelers", icon: FiUsers },
    { value: "15+", label: "Years Experience", icon: FiAward },
    { value: "4.9★", label: "Average Rating", icon: FiStar },
    { value: "24/7", label: "Support", icon: FiClock },
  ];
  return (
    <div style={{
      background: `linear-gradient(100deg, ${T.g900} 0%, ${T.g800} 50%, ${T.g700} 100%)`,
      padding: isMobile ? "22px 16px" : "28px 40px",
    }}>
      <div style={{
        maxWidth: "1320px", margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
        gap: isMobile ? "20px" : "0",
      }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              textAlign: "center",
              padding: isMobile ? "0" : "0 28px",
              borderRight: !isMobile && i < stats.length - 1 ? "1px solid rgba(255,255,255,0.10)" : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.g400,
                }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{
                fontFamily: T.serif, fontSize: isMobile ? "24px" : "30px",
                fontWeight: "800", color: T.white, lineHeight: 1, marginBottom: "4px",
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: T.sans, fontSize: "10px", fontWeight: "600",
                color: T.g300, textTransform: "uppercase", letterSpacing: "1.8px",
              }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
const Services = () => {
  const [selected, setSelected] = useState(null);
  const isMobile  = useMediaQuery("(max-width: 768px)");
  const isSmall   = useMediaQuery("(max-width: 480px)");
  const scrollProgress = useScrollProgress();

  const open  = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  const pad = isSmall ? "36px 14px" : isMobile ? "48px 18px" : "80px 36px";

  // Grid reveal refs for each section
  const [svcGridRef,  svcVisible]  = useGridReveal(services.length);
  const [procGridRef, procVisible] = useGridReveal(PROCESS_STEPS.length);
  const [whyGridRef,  whyVisible]  = useGridReveal(WHY_US.length);
  const [testiGridRef,testiVisible]= useGridReveal(TESTIMONIALS.length);

  return (
    <>
      <SEO
        title="Our Services"
        description="Discover Altuvera's premium safari services: wildlife expeditions, mountain climbing, gorilla trekking, beach holidays, and bespoke cultural experiences across East Africa."
        keywords={["safari services", "East Africa travel", "guided tours", "wildlife expeditions", "adventure travel"]}
        url="/services"
        type="website"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Services", url: "/services" }]}
      />

      <GlobalStyles />
      <ScrollBar progress={scrollProgress} />

      <PageHeader
        title="Our Services"
        subtitle="Comprehensive travel experiences designed to create your perfect East African adventure"
        backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
        breadcrumbs={[{ label: "Services", path: "/services" }]}
      />

      {/* Cookie bar */}
      <div style={{ padding: isMobile ? "8px 18px 0" : "12px 32px 0", backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <CookieSettingsButton />
        </div>
      </div>

      {/* Hero tagline */}
      <section style={{ padding: isSmall ? "32px 14px 12px" : isMobile ? "36px 18px 16px" : "52px 40px 24px", backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "12px",
              padding: "12px 28px",
              background: `linear-gradient(135deg, ${T.g50}, ${T.surfaceMid})`,
              borderRadius: T.rFull, border: `1px solid ${T.g200}`,
              boxShadow: T.shadowSm,
            }}
          >
            <FiGlobe size={14} color={T.g600} />
            <Rotating
              texts={HERO_TEXTS} ms={4000}
              style={{
                fontSize: isMobile ? "13px" : "15px",
                fontFamily: T.sans, fontWeight: "600", color: T.g700,
                width: isMobile ? "230px" : "340px", height: "20px",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Stat strip */}
      <StatStrip isMobile={isMobile} />

      {/* ══════════ SERVICES GRID ══════════ */}
      <section style={{ padding: pad, backgroundColor: T.surfaceLight }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="perspectiveIn">
            <SectionHeader
              label="✦ What We Offer"
              title="Tailored Travel Experiences"
              subtitle="From thrilling safaris to cultural immersions — discover our complete range of services crafted to make your East African journey extraordinary."
            />
          </AnimatedSection>

          <div ref={svcGridRef} className="auto-grid-services">
            {services.map((svc, i) => (
              <div
                key={svc.id}
                className={`grid-item-reveal${svcVisible.has(i) ? " visible" : ""}`}
                style={{ transitionDelay: `${(i % 3) * 90}ms` }}
              >
                <ServiceCard service={svc} index={i} onClick={open} isMobile={isMobile} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROCESS ══════════ */}
      <section style={{
        padding: pad,
        background: `linear-gradient(150deg, ${T.g950} 0%, ${T.g900} 45%, ${T.g800} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        {[
          { top: "-25%", left: "-12%", size: "520px", color: `${T.g700}15` },
          { top: "55%",  right: "-12%", size: "420px", color: `${T.g600}10` },
        ].map((orb, i) => (
          <div key={i} aria-hidden="true" style={{
            position: "absolute",
            top: orb.top, left: orb.left, right: orb.right,
            width: orb.size, height: orb.size, borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
        ))}

        <div style={{ maxWidth: "1320px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="slideReveal">
            <SectionHeader
              label="✦ Our Process"
              title="How It Works"
              subtitle="From your first inquiry to touchdown, we make planning your adventure seamless and enjoyable."
              light
            />
          </AnimatedSection>

          <div ref={procGridRef} className="auto-grid-process">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.step}
                className={`grid-item-reveal${procVisible.has(i) ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <ProcessCard step={step} index={i} total={PROCESS_STEPS.length} isMobile={isMobile} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHY US ══════════ */}
      <section style={{ padding: pad, backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="zoomIn">
            <SectionHeader
              label="✦ Why Altuvera"
              title="The Altuvera Difference"
              subtitle="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
            />
          </AnimatedSection>

          <div ref={whyGridRef} className="auto-grid-why">
            {WHY_US.map((item, i) => (
              <div
                key={item.title}
                className={`grid-item-reveal${whyVisible.has(i) ? " visible" : ""}`}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <WhyCard item={item} index={i} isMobile={isMobile} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section style={{ padding: pad, backgroundColor: T.surfaceLight }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="blurIn">
            <SectionHeader
              label="✦ Testimonials"
              title="What Our Travelers Say"
              subtitle="Don't just take our word for it — hear from adventurers who've experienced the Altuvera difference."
            />
          </AnimatedSection>

          <div ref={testiGridRef} className="auto-grid-testi">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.author}
                className={`grid-item-reveal${testiVisible.has(i) ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <TestiCard testimonial={t} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section style={{ padding: pad, backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: "940px", margin: "0 auto",
              padding: isSmall ? "44px 22px" : isMobile ? "52px 28px" : "80px 64px",
              background: `linear-gradient(140deg, ${T.g950} 0%, ${T.g900} 40%, ${T.g800} 75%, ${T.g700} 100%)`,
              borderRadius: isMobile ? "20px" : "32px",
              boxShadow: `${T.shadow2Xl}, ${T.shadowGlow}`,
              position: "relative", overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* Orbs */}
            {[
              { top: "-50%", left: "-18%", size: "380px" },
              { bottom: "-50%", right: "-18%", size: "340px" },
            ].map((o, i) => (
              <div key={i} aria-hidden="true" style={{
                position: "absolute", ...o, width: o.size, height: o.size, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
            ))}

            {/* Top shimmer line */}
            <div style={{
              position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
              background: `linear-gradient(90deg, transparent, ${T.g400}50, transparent)`,
            }} />

            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.1 }}
                style={{ marginBottom: "20px" }}
              >
                <Badge light style={{ color: T.g300 }}>
                  <FiSun size={11} /> Start Your Adventure
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.18 }}
                style={{
                  fontFamily: T.serif,
                  fontSize: isSmall ? "24px" : isMobile ? "30px" : "44px",
                  fontWeight: "800", color: T.white,
                  marginBottom: "16px", lineHeight: "1.1",
                  letterSpacing: "-0.025em",
                }}
              >
                Ready to Start Your Journey?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.25 }}
                style={{
                  fontFamily: T.sans, fontSize: isMobile ? "14px" : "16px",
                  color: "rgba(255,255,255,0.72)",
                  maxWidth: "540px", margin: "0 auto 28px",
                  lineHeight: "1.8",
                }}
              >
                Contact our expert team today and let us help you plan the adventure of a lifetime
                across the breathtaking landscapes of East Africa.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                style={{ marginBottom: "32px", display: "flex", justifyContent: "center" }}
              >
                <Rotating
                  texts={CTA_TEXTS} ms={3000}
                  style={{
                    fontSize: "13px", fontFamily: T.sans,
                    color: "rgba(255,255,255,0.58)",
                    width: isMobile ? "260px" : "320px", height: "20px",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.36 }}
                style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
              >
                <Button to="/booking" variant="white" size="large" icon={<FiArrowRight size={15} />}>
                  Start Planning
                </Button>
                <Button to="/contact" variant="outline" size="large" style={{
                  borderColor: "rgba(255,255,255,0.28)",
                  color: T.white, backgroundColor: "transparent",
                }}>
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selected && (
          <ServiceModal key={selected.id} service={selected} onClose={close} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;