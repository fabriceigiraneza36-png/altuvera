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
  FiMessageCircle,
  FiMapPin,
  FiCalendar,
  FiCompass,
  FiGlobe,
  FiSun,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import CookieSettingsButton from "../components/common/CookieSettingsButton";
import AnimatedSection from "../components/common/AnimatedSection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";

// ============================================================================
// THEME
// ============================================================================
const T = {
  g950: "#052e16",
  g900: "#14532d",
  g800: "#166534",
  g700: "#15803d",
  g600: "#16a34a",
  g500: "#22c55e",
  g400: "#4ade80",
  g300: "#86efac",
  g200: "#bbf7d0",
  g100: "#dcfce7",
  g50: "#f0fdf4",
  white: "#ffffff",
  offWhite: "#f8fffe",
  tDark: "#052e16",
  tMed: "#14532d",
  tBody: "#166534",
  tMuted: "#4b7c59",
  surfaceLight: "#f0fdf4",
  surfaceMid: "#e4f5ec",
  border: "#bbf7d0",
  borderMid: "#86efac",
  overlay: "rgba(5,46,22,0.90)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
  rSm: "8px",
  rMd: "12px",
  rLg: "16px",
  rXl: "20px",
  r2Xl: "24px",
  r3Xl: "32px",
  rFull: "9999px",
  shadowSm: "0 1px 4px rgba(5,46,22,0.07)",
  shadowMd: "0 4px 20px rgba(5,46,22,0.10)",
  shadowLg: "0 12px 36px rgba(5,46,22,0.14)",
  shadowCard: "0 4px 24px rgba(5,46,22,0.09), 0 1px 6px rgba(5,46,22,0.05)",
  shadowHover:
    "0 20px 56px rgba(5,46,22,0.18), 0 0 0 1px rgba(22,163,74,0.12)",
  shadowGlow: "0 0 48px rgba(34,197,94,0.18)",
  shadow2Xl: "0 32px 72px rgba(5,46,22,0.22)",
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
  "Authentic wilderness & cultural experiences",
  "Personalized itineraries for every traveler",
  "Where dreams become extraordinary memories",
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery Call",
    icon: FiMessageCircle,
    color: T.g400,
    desc: "Share your travel dreams, budget, dates, and group size with our expert consultants.",
  },
  {
    step: "02",
    title: "Custom Itinerary",
    icon: FiCalendar,
    color: T.g300,
    desc: "Receive a fully tailored travel blueprint with handpicked routes and accommodations.",
  },
  {
    step: "03",
    title: "Fine-Tuning",
    icon: FiCompass,
    color: T.g400,
    desc: "Refine every detail to perfection — add special requests and finalize your dream plan.",
  },
  {
    step: "04",
    title: "Adventure Begins",
    icon: FiMapPin,
    color: T.g300,
    desc: "Embark with 24/7 ground support and expert guides creating memories that last forever.",
  },
];

const WHY_US = [
  {
    icon: FiAward,
    title: "Expert Local Guides",
    stat: "15+",
    statLabel: "Years Experience",
    desc: "Certified wildlife and safety experts with deep cultural knowledge and field expertise.",
  },
  {
    icon: FiShield,
    title: "Safety Guaranteed",
    stat: "100%",
    statLabel: "Safety Record",
    desc: "Rigorous safety protocols, full premium insurance, and 24/7 emergency support systems.",
  },
  {
    icon: FiHeart,
    title: "Personalized Care",
    stat: "5,000+",
    statLabel: "Happy Travelers",
    desc: "Every itinerary tailored to your unique travel style with close attention to every detail.",
  },
  {
    icon: FiClock,
    title: "24/7 Support",
    stat: "24/7",
    statLabel: "Available",
    desc: "Round-the-clock live assistance from booking until you return home safely.",
  },
  {
    icon: FiUsers,
    title: "Small Groups",
    stat: "8–12",
    statLabel: "Max Group Size",
    desc: "Intimate experiences with maximum personal attention — no overcrowded tours.",
  },
  {
    icon: FiStar,
    title: "Best Value",
    stat: "4.9★",
    statLabel: "Avg Rating",
    desc: "Premium quality at fair pricing with transparent all-inclusive rates and no hidden extras.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The safari exceeded all our expectations. Every detail was perfectly planned and the guides were incredibly knowledgeable about the wildlife.",
    author: "Sarah Mitchell",
    role: "Wildlife Photographer, UK",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
  },
  {
    quote:
      "Altuvera made our honeymoon absolutely magical. From the Serengeti to Zanzibar, every single moment was perfectly curated.",
    author: "James & Emily Parker",
    role: "Honeymoon Trip, Australia",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
  {
    quote:
      "Professional, responsive, and truly passionate about African travel. The attention to detail was extraordinary.",
    author: "Michael Chen",
    role: "Adventure Traveler, Canada",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
  },
];

const STATS = [
  { value: "5,000+", label: "Happy Travelers", icon: FiUsers },
  { value: "15+", label: "Years Experience", icon: FiAward },
  { value: "4.9★", label: "Average Rating", icon: FiStar },
  { value: "24/7", label: "Support", icon: FiClock },
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

const useRotating = (len, ms = 3500) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (len <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % len), ms);
    return () => clearInterval(t);
  }, [len, ms]);
  return i;
};

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
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
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes pulseRing {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.28); }
      50%       { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
    }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ── Reveal animation ── */
    .reveal-item {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                  transform 0.6s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal-item.in { opacity: 1; transform: translateY(0); }

    /* ── Service card ── */
    .svc-card {
      transition: transform 0.42s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.42s cubic-bezier(0.22,1,0.36,1);
    }
    .svc-card:hover {
      transform: translateY(-10px) !important;
      box-shadow: 0 28px 72px rgba(5,46,22,0.20), 0 0 0 1px rgba(22,163,74,0.14) !important;
    }
    .svc-card:focus-visible {
      outline: 3px solid #22c55e;
      outline-offset: 4px;
    }
    .svc-card .svc-img { transition: transform 0.65s cubic-bezier(0.22,1,0.36,1); }
    .svc-card:hover .svc-img { transform: scale(1.07) !important; }
    .svc-card .svc-cta {
      transition: background 0.38s cubic-bezier(0.22,1,0.36,1),
                  border-color 0.38s ease;
    }
    .svc-card:hover .svc-cta {
      background: linear-gradient(135deg, #15803d, #16a34a) !important;
      border-color: transparent !important;
    }
    .svc-card .svc-cta-txt { transition: color 0.28s ease; }
    .svc-card:hover .svc-cta-txt { color: #ffffff !important; }
    .svc-card .svc-arrow {
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                  background 0.3s ease;
    }
    .svc-card:hover .svc-arrow {
      transform: translateX(4px) !important;
      background: rgba(255,255,255,0.18) !important;
    }
    .svc-card .svc-bar {
      width: 0;
      transition: width 0.5s cubic-bezier(0.22,1,0.36,1);
    }
    .svc-card:hover .svc-bar { width: 100% !important; }

    /* ── Why card ── */
    .why-card {
      transition: transform 0.42s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.42s ease;
    }
    .why-card:hover {
      transform: translateY(-7px) !important;
      box-shadow: 0 18px 52px rgba(5,46,22,0.14) !important;
    }
    .why-card .why-top {
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.42s cubic-bezier(0.22,1,0.36,1);
    }
    .why-card:hover .why-top { transform: scaleX(1) !important; }
    .why-card .why-icon {
      transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
    }
    .why-card:hover .why-icon { transform: scale(1.1) rotate(-5deg) !important; }

    /* ── Process card ── */
    .proc-card {
      transition: transform 0.38s cubic-bezier(0.22,1,0.36,1),
                  background 0.38s ease, border-color 0.38s ease;
    }
    .proc-card:hover {
      transform: translateY(-7px) !important;
      background: rgba(255,255,255,0.09) !important;
      border-color: rgba(255,255,255,0.17) !important;
    }

    /* ── Testi card ── */
    .testi-card {
      transition: transform 0.38s cubic-bezier(0.22,1,0.36,1),
                  box-shadow 0.38s ease;
    }
    .testi-card:hover {
      transform: translateY(-6px) !important;
      box-shadow: 0 18px 52px rgba(5,46,22,0.13) !important;
    }

    /* ── Contact links in modal ── */
    .clink {
      transition: background 0.2s ease, border-color 0.2s ease,
                  transform 0.2s ease;
    }
    .clink:hover {
      background: #f0fdf4 !important;
      border-color: #86efac !important;
      transform: translateX(3px) !important;
    }

    /* ── Scrollbar modal ── */
    .mscroll::-webkit-scrollbar { width: 4px; }
    .mscroll::-webkit-scrollbar-track { background: #f0fdf4; }
    .mscroll::-webkit-scrollbar-thumb { background: #86efac; border-radius: 2px; }
    .mscroll::-webkit-scrollbar-thumb:hover { background: #22c55e; }

    /* ── Grids ── */
    .grid-svc {
      display: grid;
      gap: 24px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
    }
    .grid-proc {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
    }
    .grid-why {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
    }
    .grid-testi {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
    }

    @media (max-width: 479px) {
      .grid-svc   { grid-template-columns: 1fr; gap: 16px; }
      .grid-proc  { grid-template-columns: repeat(2,1fr); gap: 12px; }
      .grid-why   { grid-template-columns: 1fr; gap: 14px; }
      .grid-testi { grid-template-columns: 1fr; gap: 14px; }
    }
    @media (min-width: 480px) and (max-width: 767px) {
      .grid-svc   { grid-template-columns: repeat(2,1fr); gap: 14px; }
      .grid-proc  { grid-template-columns: repeat(2,1fr); gap: 14px; }
      .grid-why   { grid-template-columns: repeat(2,1fr); gap: 14px; }
      .grid-testi { grid-template-columns: 1fr; gap: 14px; }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .grid-svc   { grid-template-columns: repeat(2,1fr); gap: 20px; }
      .grid-proc  { grid-template-columns: repeat(4,1fr); gap: 14px; }
      .grid-why   { grid-template-columns: repeat(3,1fr); gap: 18px; }
      .grid-testi { grid-template-columns: repeat(2,1fr); gap: 18px; }
    }
    @media (min-width: 1024px) {
      .grid-svc   { grid-template-columns: repeat(3,1fr); gap: 24px; }
      .grid-proc  { grid-template-columns: repeat(4,1fr); gap: 20px; }
      .grid-why   { grid-template-columns: repeat(3,1fr); gap: 22px; }
      .grid-testi { grid-template-columns: repeat(3,1fr); gap: 22px; }
    }
  `}</style>
);

// ============================================================================
// MOTION VARIANTS
// ============================================================================
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};
const swap = {
  enter: { opacity: 0, y: 8 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22 } },
};

// ============================================================================
// ATOMS
// ============================================================================
const Shimmer = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 1,
      background: `linear-gradient(90deg, ${T.g100} 0%, ${T.g50} 50%, ${T.g100} 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite linear",
    }}
  />
);

const Badge = ({ children, light = false, style: s = {} }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "5px 14px",
      borderRadius: T.rFull,
      fontSize: "10px",
      fontWeight: "700",
      fontFamily: T.sans,
      textTransform: "uppercase",
      letterSpacing: "2px",
      background: light ? "rgba(255,255,255,0.07)" : T.g50,
      color: light ? T.g300 : T.g700,
      border: light
        ? "1px solid rgba(255,255,255,0.13)"
        : `1px solid ${T.g200}`,
      backdropFilter: light ? "blur(10px)" : "none",
      ...s,
    }}
  >
    {children}
  </span>
);

const RotatingText = ({ texts, ms = 3500, style: s = {} }) => {
  const i = useRotating(texts.length, ms);
  return (
    <div
      style={{
        position: "relative",
        height: "20px",
        overflow: "hidden",
        ...s,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          variants={swap}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: "absolute",
            inset: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {texts[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// Staggered dot row
const Dots = ({ total, active }) => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        style={{
          width: i === active ? "18px" : "4px",
          height: "4px",
          borderRadius: T.rFull,
          background: i === active ? T.g500 : T.g200,
          transition: `all 0.38s cubic-bezier(0.22,1,0.36,1)`,
          flexShrink: 0,
        }}
      />
    ))}
  </div>
);

// Reveal wrapper driven by IntersectionObserver
const Reveal = ({ index = 0, delay = 0, children }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-item${visible ? " in" : ""}`}
      style={{ transitionDelay: `${(index % 6) * 75 + delay}ms` }}
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
      variants={stagger}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      style={{
        textAlign: center ? "center" : "left",
        marginBottom: "clamp(24px,4vw,44px)",
        maxWidth: center ? "760px" : "none",
        marginLeft: center ? "auto" : undefined,
        marginRight: center ? "auto" : undefined,
      }}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: "14px" }}>
        <Badge light={light}>{label}</Badge>
      </motion.div>
      <motion.h2
        variants={fadeUp}
        style={{
          fontFamily: T.serif,
          fontSize: "clamp(24px,4.5vw,50px)",
          fontWeight: "800",
          color: light ? T.white : T.tDark,
          lineHeight: "1.08",
          letterSpacing: "-0.03em",
          marginBottom: subtitle ? "18px" : 0,
        }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: T.sans,
            fontSize: "clamp(14px,1.7vw,16px)",
            color: light ? "rgba(255,255,255,0.62)" : T.tMuted,
            lineHeight: "1.8",
            maxWidth: center ? "580px" : "none",
            margin: center ? "0 auto" : 0,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

// ============================================================================
// SERVICE CARD
// ============================================================================
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgOk, setImgOk] = useState(false);

  const imgs = useMemo(() => {
    const g =
      Array.isArray(service.gallery) && service.gallery.length
        ? service.gallery
        : null;
    const f =
      Array.isArray(service.images) && service.images.length
        ? service.images
        : null;
    return g || f || [service.image];
  }, [service]);

  const autoI = useRotating(imgs.length, 4500);

  useEffect(() => {
    if (imgs.length <= 1) return;
    setImgOk(false);
    setImgIdx(autoI);
  }, [autoI, imgs.length]);

  const prev = (e) => {
    e.stopPropagation();
    setImgOk(false);
    setImgIdx((p) => (p - 1 + imgs.length) % imgs.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgOk(false);
    setImgIdx((p) => (p + 1) % imgs.length);
  };

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(service);
      }
    },
    [onClick, service]
  );

  const feats = service.features?.slice(0, 4) || [];

  return (
    <article
      className="svc-card"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={handleKey}
      style={{
        position: "relative",
        background: T.white,
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
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          height: isMobile ? "196px" : "232px",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {!imgOk && <Shimmer />}
        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={imgs[imgIdx]}
            alt={service.title}
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgOk(true)}
            className="svc-img"
            initial={{ opacity: 0 }}
            animate={{ opacity: imgOk ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,46,22,0.06) 0%, rgba(5,46,22,0.72) 100%)",
          }}
        />

        {/* Nav arrows */}
        {imgs.length > 1 &&
          ["left", "right"].map((side) => (
            <button
              key={side}
              type="button"
              aria-label={`${side === "left" ? "Previous" : "Next"} image`}
              onClick={side === "left" ? prev : next}
              style={{
                position: "absolute",
                top: "50%",
                [side]: "9px",
                transform: "translateY(-50%)",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "rgba(5,46,22,0.52)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: T.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 4,
                transition: "opacity 0.2s ease",
              }}
            >
              {side === "left" ? (
                <FiChevronLeft size={14} />
              ) : (
                <FiChevronRight size={14} />
              )}
            </button>
          ))}

        {/* Dot nav */}
        {imgs.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "56px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "4px",
              zIndex: 4,
            }}
          >
            {imgs.slice(0, 5).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgOk(false);
                  setImgIdx(i);
                }}
                style={{
                  width: i === imgIdx ? "20px" : "5px",
                  height: "5px",
                  borderRadius: T.rFull,
                  background:
                    i === imgIdx
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.40)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: `all ${T.tSmooth}`,
                }}
              />
            ))}
          </div>
        )}

        {/* Premium tag */}
        <div
          style={{
            position: "absolute",
            top: "11px",
            left: "11px",
            zIndex: 5,
          }}
        >
          <span
            style={{
              padding: "4px 11px",
              background: "rgba(255,255,255,0.90)",
              backdropFilter: "blur(10px)",
              borderRadius: T.rFull,
              fontSize: "9px",
              fontWeight: "800",
              fontFamily: T.sans,
              color: T.g700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              border: `1px solid ${T.g100}`,
            }}
          >
            Premium
          </span>
        </div>

        {/* Bottom title overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 16px 14px",
            zIndex: 3,
          }}
        >
          <h3
            style={{
              fontFamily: T.serif,
              fontSize: isMobile ? "17px" : "20px",
              fontWeight: "700",
              color: T.white,
              lineHeight: "1.2",
              textShadow: "0 1px 8px rgba(5,46,22,0.45)",
              margin: 0,
            }}
          >
            {service.title}
          </h3>
        </div>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: isMobile ? "20px 16px 18px" : "22px 20px 20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Description */}
        <p
          style={{
            fontFamily: T.sans,
            fontSize: "13px",
            color: T.tMuted,
            lineHeight: "1.72",
            marginBottom: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {service.description}
        </p>

        {/* Feature chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginBottom: "16px",
          }}
        >
          {feats.map((f, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 9px",
                background: i === 0 ? T.g50 : T.white,
                borderRadius: T.rFull,
                fontSize: "11px",
                fontFamily: T.sans,
                fontWeight: "500",
                color: i === 0 ? T.g700 : T.tMuted,
                border: `1px solid ${i === 0 ? T.g200 : T.border}`,
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <FiCheck size={8} strokeWidth={3} color={T.g600} />
              {f}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, ${T.g100}, transparent)`,
            marginBottom: "14px",
          }}
        />

        {/* CTA row */}
        <div
          className="svc-cta"
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 14px",
            background: T.g50,
            borderRadius: T.rLg,
            border: `1px solid ${T.g200}`,
          }}
        >
          <span
            className="svc-cta-txt"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: T.sans,
              color: T.g700,
            }}
          >
            Explore Service
          </span>
          <span
            className="svc-arrow"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: T.g100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.g600,
            }}
          >
            <FiArrowRight size={12} />
          </span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="svc-bar"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${T.g400}, ${T.g700})`,
        }}
      />
    </article>
  );
};

// ============================================================================
// PROCESS CARD
// ============================================================================
const ProcessCard = ({ step, index, total, isMobile }) => {
  const Icon = step.icon;
  return (
    <div
      className="proc-card"
      style={{
        position: "relative",
        textAlign: "center",
        padding: isMobile ? "40px 14px 26px" : "48px 20px 32px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Step number */}
      <div
        style={{
          position: "absolute",
          top: "-16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "33px",
          height: "33px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.g400}, ${T.g500})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "800",
          fontFamily: T.sans,
          color: T.g950,
          boxShadow: "0 4px 14px rgba(34,197,94,0.32)",
          border: "2px solid rgba(255,255,255,0.14)",
        }}
      >
        {step.step}
      </div>

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          color: step.color,
        }}
      >
        <Icon size={isMobile ? 20 : 23} />
      </div>

      <h3
        style={{
          fontFamily: T.serif,
          fontSize: isMobile ? "15px" : "18px",
          fontWeight: "700",
          color: T.white,
          marginBottom: "10px",
          lineHeight: "1.25",
        }}
      >
        {step.title}
      </h3>
      <p
        style={{
          fontSize: isMobile ? "11px" : "12.5px",
          fontFamily: T.sans,
          color: "rgba(255,255,255,0.54)",
          lineHeight: "1.72",
        }}
      >
        {step.desc}
      </p>

      {/* Connector */}
      {!isMobile && index < total - 1 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-10px",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: "rgba(255,255,255,0.18)",
          }}
        >
          <FiChevronRight size={18} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// WHY CARD
// ============================================================================
const WhyCard = ({ item, isMobile }) => {
  const Icon = item.icon;
  return (
    <div
      className="why-card"
      style={{
        position: "relative",
        background: T.white,
        borderRadius: "18px",
        padding: isMobile ? "22px 18px" : "28px 24px",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowSm,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent */}
      <div
        className="why-top"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${T.g400}, ${T.g700})`,
        }}
      />

      {/* BG blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-36px",
          right: "-36px",
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.g100} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Stat badge */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          padding: "5px 11px",
          background: T.g50,
          border: `1px solid ${T.g200}`,
          borderRadius: T.rFull,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "800",
            fontFamily: T.sans,
            color: T.g600,
            lineHeight: 1,
          }}
        >
          {item.stat}
        </div>
        <div
          style={{
            fontSize: "9px",
            fontFamily: T.sans,
            fontWeight: "600",
            color: T.tMuted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginTop: "2px",
          }}
        >
          {item.statLabel}
        </div>
      </div>

      {/* Icon */}
      <div
        className="why-icon"
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "13px",
          background: `linear-gradient(135deg, ${T.g50}, ${T.g100})`,
          border: `1px solid ${T.g200}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.g600,
          marginBottom: "12px",
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>

      <h3
        style={{
          fontFamily: T.serif,
          fontSize: isMobile ? "16px" : "18px",
          fontWeight: "700",
          color: T.tDark,
          marginBottom: "10px",
          lineHeight: "1.25",
        }}
      >
        {item.title}
      </h3>
      <p
        style={{
          fontSize: "13px",
          fontFamily: T.sans,
          color: T.tMuted,
          lineHeight: "1.72",
          flex: 1,
        }}
      >
        {item.desc}
      </p>
    </div>
  );
};

// ============================================================================
// TESTIMONIAL CARD
// ============================================================================
const TestiCard = ({ testimonial }) => {
  const [imgOk, setImgOk] = useState(false);
  return (
    <div
      className="testi-card"
      style={{
        background: T.white,
        borderRadius: "18px",
        padding: "clamp(14px,2.5vw,22px)",
        boxShadow: T.shadowCard,
        border: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Watermark quote */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10px",
          right: "14px",
          fontSize: "90px",
          fontFamily: T.serif,
          color: T.g100,
          lineHeight: 1,
          fontWeight: "700",
          userSelect: "none",
        }}
      >
        "
      </div>

      {/* Stars */}
      <div
        style={{
          display: "flex",
          gap: "3px",
          marginBottom: "12px",
          position: "relative",
        }}
      >
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <FiStar key={i} size={12} fill={T.g500} color={T.g500} />
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontFamily: T.sans,
          fontSize: "clamp(13px,1.7vw,14.5px)",
          color: T.tBody,
          lineHeight: "1.8",
          fontStyle: "italic",
          flex: 1,
          marginBottom: "20px",
          position: "relative",
        }}
      >
        "{testimonial.quote}"
      </p>

      {/* Author */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "13px 14px",
          background: T.g50,
          borderRadius: T.rLg,
          border: `1px solid ${T.g100}`,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${T.g300}`,
            background: T.g100,
            flexShrink: 0,
          }}
        >
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            loading="lazy"
            onLoad={() => setImgOk(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgOk ? 1 : 0,
              transition: `opacity ${T.tBase}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              fontFamily: T.sans,
              color: T.tDark,
              marginBottom: "1px",
            }}
          >
            {testimonial.author}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: T.sans,
              color: T.tMuted,
              fontWeight: "500",
            }}
          >
            {testimonial.role}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.g500}, ${T.g700})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiCheck size={11} color={T.white} strokeWidth={3} />
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

  useKeyboardClose(onClose);

  useEffect(() => {
    const sy = window.scrollY;
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${sy}px`,
      width: "100%",
      overflow: "hidden",
    });
    return () => {
      Object.assign(document.body.style, {
        position: "",
        top: "",
        width: "",
        overflow: "",
      });
      window.scrollTo(0, sy);
    };
  }, []);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${service.title} details`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: T.overlay,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "10px" : "24px",
      }}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="mscroll"
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.white,
          borderRadius: isMobile ? "20px" : "28px",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: T.shadow2Xl,
          outline: "none",
        }}
      >
        {/* Close button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "13px",
            right: "13px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(5,46,22,0.55)",
            color: T.white,
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <FiX size={17} />
        </motion.button>

        {/* Hero image */}
        <div
          style={{
            position: "relative",
            height: isMobile ? "200px" : "300px",
            overflow: "hidden",
            borderRadius: isMobile ? "20px 20px 0 0" : "28px 28px 0 0",
          }}
        >
          {!imgOk && <Shimmer />}
          <img
            src={service.image}
            alt={service.title}
            onLoad={() => setImgOk(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgOk ? 1 : 0,
              transition: `opacity ${T.tBase}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, ${T.g950}E0 0%, ${T.g950}40 50%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: isMobile ? "18px" : "28px",
            }}
          >
            <Badge style={{ marginBottom: "8px" }}>Signature Experience</Badge>
            <h2
              style={{
                fontFamily: T.serif,
                fontSize: isMobile ? "21px" : "32px",
                fontWeight: "700",
                color: T.white,
                margin: 0,
                lineHeight: "1.2",
              }}
            >
              {service.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "20px 18px" : "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
              gap: isMobile ? "24px" : "32px",
            }}
          >
            {/* Left */}
            <div>
              {/* About */}
              <div style={{ marginBottom: "22px" }}>
                <h3
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    fontFamily: T.sans,
                    color: T.g700,
                    marginBottom: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "1.3px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FiCompass size={12} /> About This Experience
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    fontFamily: T.sans,
                    color: T.tMuted,
                    lineHeight: "1.8",
                  }}
                >
                  {service.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    fontFamily: T.sans,
                    color: T.g700,
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "1.3px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FiCheck size={12} /> What's Included
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  {service.features.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + idx * 0.04 }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "9px",
                        padding: "7px 11px",
                        borderRadius: T.rMd,
                        background: T.g50,
                        border: `1px solid ${T.g100}`,
                        fontSize: "13px",
                        fontFamily: T.sans,
                        color: T.tBody,
                        lineHeight: "1.58",
                      }}
                    >
                      <span
                        style={{
                          width: "17px",
                          height: "17px",
                          borderRadius: "50%",
                          background: T.g600,
                          color: T.white,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        <FiCheck size={9} strokeWidth={3} />
                      </span>
                      {feat}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — booking panel */}
            <div>
              <div
                style={{
                  background: T.g50,
                  padding: isMobile ? "20px" : "26px",
                  borderRadius: T.rXl,
                  border: `1px solid ${T.g200}`,
                  position: isMobile ? "static" : "sticky",
                  top: "22px",
                }}
              >
                <h4
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    fontFamily: T.sans,
                    color: T.g800,
                    marginBottom: "7px",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                  }}
                >
                  Ready to Book?
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    fontFamily: T.sans,
                    color: T.tMuted,
                    marginBottom: "18px",
                    lineHeight: "1.68",
                  }}
                >
                  Let our expert team craft your perfect{" "}
                  {service.title.toLowerCase()} experience.
                </p>

                <Button
                  to="/booking"
                  variant="primary"
                  fullWidth
                  size="large"
                  icon={<FiArrowRight size={14} />}
                >
                  Start Planning
                </Button>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "7px",
                    marginTop: "12px",
                  }}
                >
                  {[
                    { href: "tel:+250792352409", Icon: FiPhone, label: "+250 792 352 409", ext: true },
                    { href: "/contact", Icon: FiMessageCircle, label: "Chat With Us", ext: false },
                  ].map(({ href, Icon, label, ext }) => {
                    const cs = {
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "10px 13px",
                      background: T.white,
                      borderRadius: T.rMd,
                      fontSize: "12px",
                      fontFamily: T.sans,
                      fontWeight: "500",
                      color: T.tBody,
                      border: `1px solid ${T.border}`,
                      textDecoration: "none",
                      cursor: "pointer",
                    };
                    return ext ? (
                      <a key={label} href={href} className="clink" style={cs}>
                        <Icon size={13} color={T.g600} />
                        {label}
                      </a>
                    ) : (
                      <Link
                        key={label}
                        to={href}
                        className="clink"
                        style={cs}
                        onClick={onClose}
                      >
                        <Icon size={13} color={T.g600} />
                        {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Trust signals */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: `1px solid ${T.g200}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {[
                    "Free consultation — no obligation",
                    "100% satisfaction guarantee",
                    "Flexible payment options",
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        fontSize: "11.5px",
                        fontFamily: T.sans,
                        color: T.tMuted,
                      }}
                    >
                      <FiCheck size={11} color={T.g600} strokeWidth={3} />
                      {t}
                    </div>
                  ))}
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
// SCROLL PROGRESS BAR
// ============================================================================
const ScrollBar = ({ progress }) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(progress)}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Page scroll progress"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 10001,
      height: "3px",
      width: `${progress}%`,
      background: `linear-gradient(90deg, ${T.g400}, ${T.g500}, ${T.g700})`,
      transition: "width 80ms linear",
      boxShadow: progress > 0 ? `0 0 12px ${T.g500}55` : "none",
    }}
  />
);

// ============================================================================
// STAT STRIP
// ============================================================================
const StatStrip = ({ isMobile }) => (
  <div
    style={{
      background: `linear-gradient(100deg, ${T.g950} 0%, ${T.g900} 55%, ${T.g800} 100%)`,
      padding: isMobile ? "20px 14px" : "26px 40px",
    }}
  >
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
        gap: isMobile ? "16px" : "0",
      }}
    >
      {STATS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: isMobile ? "0" : "0 24px",
              borderRight:
                !isMobile && i < STATS.length - 1
                  ? "1px solid rgba(255,255,255,0.09)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "7px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.g400,
                }}
              >
                <Icon size={15} />
              </div>
            </div>
            <div
              style={{
                fontFamily: T.serif,
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: "800",
                color: T.white,
                lineHeight: 1,
                marginBottom: "3px",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: T.sans,
                fontSize: "10px",
                fontWeight: "600",
                color: T.g300,
                textTransform: "uppercase",
                letterSpacing: "1.6px",
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// MAIN PAGE
// ============================================================================
const Services = () => {
  const [selected, setSelected] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmall = useMediaQuery("(max-width: 480px)");
  const scrollProgress = useScrollProgress();

  const open = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  const pad = "42px 24px";

  return (
    <>
      <SEO
        title="Our Services"
        description="Discover Altuvera's premium safari services: wildlife expeditions, mountain climbing, gorilla trekking, beach holidays, and bespoke cultural experiences across East Africa."
        keywords={[
          "safari services",
          "East Africa travel",
          "guided tours",
          "wildlife expeditions",
          "adventure travel",
        ]}
        url="/services"
        type="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ]}
      />

      <GlobalStyles />
      <ScrollBar progress={scrollProgress} />

      <PageHeader
        title="Our Services"
        subtitle="Comprehensive travel experiences designed to create your perfect East African adventure"
        backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
        breadcrumbs={[{ label: "Services", path: "/services" }]}
      />

      {/* Cookie settings */}
      <div
        style={{
          padding: isMobile ? "8px 16px 0" : "12px 36px 0",
          background: T.white,
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <CookieSettingsButton />
        </div>
      </div>

      {/* ── Hero tagline banner ── */}
      <section
        style={{
          padding: isSmall
            ? "28px 14px 10px"
            : isMobile
            ? "32px 16px 14px"
            : "48px 36px 20px",
          background: T.white,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.14 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "11px",
              padding: "11px 26px",
              background: `linear-gradient(135deg, ${T.g50}, ${T.surfaceMid})`,
              borderRadius: T.rFull,
              border: `1px solid ${T.g200}`,
              boxShadow: T.shadowSm,
            }}
          >
            <FiGlobe size={13} color={T.g600} />
            <RotatingText
              texts={HERO_TEXTS}
              ms={4000}
              style={{
                fontSize: isMobile ? "12.5px" : "14.5px",
                fontFamily: T.sans,
                fontWeight: "600",
                color: T.g700,
                width: isMobile ? "220px" : "320px",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Stat strip ── */}
      <StatStrip isMobile={isMobile} />

      {/* ══════════════════════════════════════════
          SERVICES GRID
      ══════════════════════════════════════════ */}
      <section style={{ padding: pad, background: T.surfaceLight }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimatedSection animation="perspectiveIn">
            <SectionHeader
              label="✦ What We Offer"
              title="Tailored Travel Experiences"
              subtitle="From thrilling safaris to cultural immersions — discover our complete range of services crafted to make your East African journey extraordinary."
            />
          </AnimatedSection>

          <div className="grid-svc">
            {services.map((svc, i) => (
              <Reveal key={svc.id} index={i}>
                <ServiceCard
                  service={svc}
                  index={i}
                  onClick={open}
                  isMobile={isMobile}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        style={{
          padding: pad,
          background: `linear-gradient(145deg, ${T.g950} 0%, ${T.g900} 45%, ${T.g800} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BG orbs */}
        {[
          { top: "-28%", left: "-14%", size: "480px", c: `${T.g700}12` },
          { top: "60%", right: "-14%", size: "400px", c: `${T.g600}0e` },
        ].map((o, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: o.top,
              left: o.left,
              right: o.right,
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <AnimatedSection animation="slideReveal">
            <SectionHeader
              label="✦ Our Process"
              title="How It Works"
              subtitle="From your first inquiry to touchdown, we make planning your adventure seamless and enjoyable."
              light
            />
          </AnimatedSection>

          <div className="grid-proc">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.step} index={i} delay={20}>
                <ProcessCard
                  step={step}
                  index={i}
                  total={PROCESS_STEPS.length}
                  isMobile={isMobile}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY ALTUVERA
      ══════════════════════════════════════════ */}
      <section style={{ padding: pad, background: T.white }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimatedSection animation="zoomIn">
            <SectionHeader
              label="✦ Why Altuvera"
              title="The Altuvera Difference"
              subtitle="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
            />
          </AnimatedSection>

          <div className="grid-why">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} index={i}>
                <WhyCard item={item} isMobile={isMobile} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section style={{ padding: pad, background: T.surfaceLight }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimatedSection animation="blurIn">
            <SectionHeader
              label="✦ Testimonials"
              title="What Our Travelers Say"
              subtitle="Don't just take our word for it — hear from adventurers who've experienced the Altuvera difference firsthand."
            />
          </AnimatedSection>

          <div className="grid-testi">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.author} index={i} delay={30}>
                <TestiCard testimonial={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: pad, background: T.white }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: "920px",
              margin: "0 auto",
              padding: isSmall
                ? "44px 20px"
                : isMobile
                ? "52px 26px"
                : "76px 60px",
              background: `linear-gradient(140deg, ${T.g950} 0%, ${T.g900} 40%, ${T.g800} 75%, ${T.g700} 100%)`,
              borderRadius: isMobile ? "20px" : "30px",
              boxShadow: `${T.shadow2Xl}, ${T.shadowGlow}`,
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            {/* Orbs */}
            {[
              { top: "-50%", left: "-16%", size: "360px" },
              { bottom: "-50%", right: "-16%", size: "320px" },
            ].map((o, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  ...o,
                  width: o.size,
                  height: o.size,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Top shimmer */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${T.g400}45, transparent)`,
              }}
            />

            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: "18px" }}
              >
                <Badge light style={{ color: T.g300 }}>
                  <FiSun size={10} /> Start Your Adventure
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.17 }}
                style={{
                  fontFamily: T.serif,
                  fontSize: isSmall ? "22px" : isMobile ? "28px" : "42px",
                  fontWeight: "800",
                  color: T.white,
                  marginBottom: "14px",
                  lineHeight: "1.1",
                  letterSpacing: "-0.025em",
                }}
              >
                Ready to Start Your Journey?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.23 }}
                style={{
                  fontFamily: T.sans,
                  fontSize: isMobile ? "13.5px" : "15.5px",
                  color: "rgba(255,255,255,0.68)",
                  maxWidth: "520px",
                  margin: "0 auto 28px",
                  lineHeight: "1.8",
                }}
              >
                Contact our expert team and let us craft the adventure of a
                lifetime across the breathtaking landscapes of East Africa.
              </motion.p>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.28 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "28px",
                }}
              >
                {[
                  "5,000+ travelers worldwide",
                  "4.9★ rated",
                  "100% satisfaction guarantee",
                ].map((t, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 13px",
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: T.rFull,
                      border: "1px solid rgba(255,255,255,0.11)",
                      fontSize: "11.5px",
                      fontFamily: T.sans,
                      color: "rgba(255,255,255,0.62)",
                      fontWeight: "500",
                    }}
                  >
                    <FiCheck
                      size={10}
                      color={T.g400}
                      strokeWidth={3}
                    />
                    {t}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.33 }}
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  to="/booking"
                  variant="white"
                  size="large"
                  icon={<FiArrowRight size={14} />}
                >
                  Start Planning
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="large"
                  style={{
                    borderColor: "rgba(255,255,255,0.26)",
                    color: T.white,
                    background: "transparent",
                  }}
                >
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
          <ServiceModal
            key={selected.id}
            service={selected}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;
