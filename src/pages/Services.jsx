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
  FiPlay,
} from "react-icons/fi";
import { motion, AnimatePresence, useInView } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import CookieSettingsButton from "../components/common/CookieSettingsButton";
import AnimatedSection from "../components/common/AnimatedSection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";
import ServiceIcon from "../components/icons/ServiceIconSimple";

// ============================================================================
// THEME — Deep Forest Green + Pure White
// ============================================================================
const T = {
  // greens
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
  g50:  "#f0fdf4",
  // whites / off-whites
  white:    "#ffffff",
  offWhite: "#f8fffe",
  // text
  tDark:   "#052e16",
  tMed:    "#14532d",
  tBody:   "#166534",
  tMuted:  "#15803d",
  tLight:  "#22c55e",
  // surfaces
  surfaceLight: "#f0fdf4",
  surfaceMid:   "#e8f8ed",
  border:       "#bbf7d0",
  borderMid:    "#86efac",
  // overlays
  overlay: "rgba(5,46,22,0.88)",
  // fonts
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'Inter', system-ui, sans-serif",
  // radii
  rSm:   "8px",
  rMd:   "12px",
  rLg:   "16px",
  rXl:   "20px",
  r2Xl:  "24px",
  r3Xl:  "32px",
  rFull: "9999px",
  // shadows
  shadowSm:   "0 1px 4px rgba(5,46,22,0.07)",
  shadowMd:   "0 4px 16px rgba(5,46,22,0.10)",
  shadowLg:   "0 12px 32px rgba(5,46,22,0.13)",
  shadowXl:   "0 24px 48px rgba(5,46,22,0.16)",
  shadow2Xl:  "0 32px 64px rgba(5,46,22,0.20)",
  shadowHover:"0 28px 56px rgba(5,46,22,0.18), 0 0 0 1px rgba(22,163,74,0.10)",
  shadowGlow: "0 0 48px rgba(34,197,94,0.18)",
  // transitions
  tFast:   "140ms cubic-bezier(0.4,0,0.2,1)",
  tBase:   "240ms cubic-bezier(0.4,0,0.2,1)",
  tSmooth: "400ms cubic-bezier(0.22,1,0.36,1)",
  tSpring: "480ms cubic-bezier(0.34,1.56,0.64,1)",
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
  {
    step: "01", title: "Discovery Call", icon: FiMessageCircle,
    descriptions: [
      "Share your travel dreams and preferences",
      "Discuss budget, dates, and group size",
      "Get expert recommendations instantly",
    ],
  },
  {
    step: "02", title: "Custom Itinerary", icon: FiCalendar,
    descriptions: [
      "Receive a tailored travel blueprint",
      "Every detail designed around you",
      "Handpicked accommodations and routes",
    ],
  },
  {
    step: "03", title: "Fine-Tuning", icon: FiCompass,
    descriptions: [
      "Refine every detail to perfection",
      "Add special requests and surprises",
      "Finalize your dream itinerary",
    ],
  },
  {
    step: "04", title: "Adventure Time", icon: FiMapPin,
    descriptions: [
      "Embark with 24/7 ground support",
      "Expert guides at every destination",
      "Create memories that last forever",
    ],
  },
];

const WHY_US = [
  {
    icon: FiAward, title: "Expert Local Guides",
    stat: "15+", statLabel: "Years Experience",
    desc: [
      "Our guides bring decades of combined field experience across diverse African terrains.",
      "Each team member is a certified wildlife and safety expert.",
      "Deep regional cultural knowledge provides an authentic perspective.",
    ],
  },
  {
    icon: FiShield, title: "Safety Guaranteed",
    stat: "100%", statLabel: "Safety Record",
    desc: [
      "Rigorous safety protocols adhering to highest international standards.",
      "Full premium insurance included in every booking.",
      "Emergency support systems active 24/7 with dedicated response team.",
    ],
  },
  {
    icon: FiHeart, title: "Personalized Care",
    stat: "5,000+", statLabel: "Happy Travelers",
    desc: [
      "Every itinerary tailored to your unique travel style and interests.",
      "Unique experiences that go beyond the ordinary.",
      "Close attention to every detail for a seamless journey.",
    ],
  },
  {
    icon: FiClock, title: "24/7 Support",
    stat: "24/7", statLabel: "Available",
    desc: [
      "Round-the-clock live assistance whenever you need it.",
      "Continuous support from booking until you return home.",
      "Professional consultants always a call away.",
    ],
  },
  {
    icon: FiUsers, title: "Small Groups",
    stat: "8–12", statLabel: "Max Group Size",
    desc: [
      "Intimate experiences allowing meaningful connections with nature.",
      "Maximum personal attention throughout your expedition.",
      "No overcrowded tours — exclusivity guaranteed.",
    ],
  },
  {
    icon: FiStar, title: "Best Value",
    stat: "4.9★", statLabel: "Average Rating",
    desc: [
      "Premium quality at fair, competitive pricing.",
      "Transparent all-inclusive rates — no hidden extras.",
      "Comfort, adventure, and world-class service in one package.",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: "The safari exceeded all our expectations. Every detail was perfectly planned and the guides were incredibly knowledgeable.",
    author: "Sarah Mitchell", role: "Wildlife Photographer", rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    quote: "Altuvera made our honeymoon absolutely magical. From the Serengeti to Zanzibar, every moment was perfect.",
    author: "James & Emily", role: "Honeymoon Trip", rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    quote: "Professional, responsive, and truly passionate about African travel. I've booked three trips with them now.",
    author: "Michael Chen", role: "Adventure Traveler", rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
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

// ============================================================================
// MOTION VARIANTS
// ============================================================================
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const swap = {
  enter:  { opacity: 0, y: 12, filter: "blur(3px)" },
  center: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -12, filter: "blur(3px)", transition: { duration: 0.28 } },
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px);  }
      50%       { transform: translateY(-8px); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);    opacity: 0.6; }
      100% { transform: scale(1.5);  opacity: 0;   }
    }

    .svc-card:focus-visible {
      outline: 3px solid ${T.g500};
      outline-offset: 4px;
      border-radius: ${T.r2Xl};
    }
    .modal-scroll::-webkit-scrollbar { width: 4px; }
    .modal-scroll::-webkit-scrollbar-track { background: ${T.g50}; }
    .modal-scroll::-webkit-scrollbar-thumb {
      background: ${T.g300};
      border-radius: 2px;
    }
    .modal-scroll::-webkit-scrollbar-thumb:hover { background: ${T.g500}; }

    .cl:hover {
      background-color: ${T.g50} !important;
      border-color: ${T.g300} !important;
      transform: translateX(4px) !important;
    }

    @media (max-width: 480px) {
      .gs { grid-template-columns: 1fr !important; gap: 16px !important; }
      .gp { grid-template-columns: 1fr !important; gap: 36px !important; }
      .gw { grid-template-columns: 1fr !important; gap: 16px !important; }
      .gt { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
    @media (min-width: 481px) and (max-width: 768px) {
      .gs { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
      .gp { grid-template-columns: repeat(2,1fr) !important; gap: 24px !important; }
      .gw { grid-template-columns: repeat(2,1fr) !important; gap: 16px !important; }
      .gt { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      .gs { grid-template-columns: repeat(2,1fr) !important; gap: 22px !important; }
      .gp { grid-template-columns: repeat(2,1fr) !important; gap: 22px !important; }
      .gw { grid-template-columns: repeat(2,1fr) !important; gap: 20px !important; }
      .gt { grid-template-columns: repeat(2,1fr) !important; gap: 20px !important; }
    }
    @media (min-width: 1025px) {
      .gs { grid-template-columns: repeat(auto-fill,minmax(330px,1fr)) !important; gap: 28px !important; }
      .gp { grid-template-columns: repeat(4,1fr) !important; gap: 24px !important; }
      .gw { grid-template-columns: repeat(3,1fr) !important; gap: 24px !important; }
      .gt { grid-template-columns: repeat(3,1fr) !important; gap: 24px !important; }
    }
  `}</style>
);

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

const Pip = ({ active, total, vertical = false }) => (
  <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: "4px", alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{
        width:  vertical ? "4px" : (i === active ? "18px" : "4px"),
        height: vertical ? (i === active ? "18px" : "4px") : "4px",
        borderRadius: T.rFull,
        backgroundColor: i === active ? T.g600 : T.g200,
        transition: `all ${T.tSmooth}`,
        flexShrink: 0,
      }} />
    ))}
  </div>
);

const Badge = ({ children, light = false, style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "7px 18px",
    borderRadius: T.rFull,
    fontSize: "10px", fontWeight: "700", fontFamily: T.sans,
    textTransform: "uppercase", letterSpacing: "2.5px",
    backgroundColor: light ? "rgba(255,255,255,0.08)" : T.g50,
    color:           light ? T.g300 : T.g700,
    border:          light ? "1px solid rgba(255,255,255,0.12)" : `1px solid ${T.g200}`,
    backdropFilter:  light ? "blur(12px)" : "none",
    ...style,
  }}>
    {children}
  </span>
);

const Rotating = ({ texts, ms = 3200, style = {} }) => {
  const i = useRotating(texts.length, ms);
  return (
    <div style={{ position: "relative", height: "24px", overflow: "hidden", ...style }}>
      <AnimatePresence mode="wait">
        <motion.span key={i} variants={swap} initial="enter" animate="center" exit="exit"
          style={{ position: "absolute", inset: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {texts[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = ({ label, title, subtitle, center = true, light = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"}
      style={{
        textAlign: center ? "center" : "left",
        marginBottom: "clamp(40px,6vw,68px)",
        maxWidth: center ? "760px" : "none",
        marginLeft: center ? "auto" : undefined,
        marginRight: center ? "auto" : undefined,
      }}>
      <motion.div variants={fadeUp} style={{ marginBottom: "18px" }}>
        <Badge light={light}>{label}</Badge>
      </motion.div>

      <motion.h2 variants={fadeUp} style={{
        fontFamily: T.serif,
        fontSize: "clamp(26px,5vw,50px)",
        fontWeight: "800",
        color: light ? T.white : T.tDark,
        lineHeight: "1.1",
        letterSpacing: "-0.03em",
        marginBottom: subtitle ? "18px" : 0,
      }}>
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p variants={fadeUp} style={{
          fontFamily: T.sans,
          fontSize: "clamp(14px,1.8vw,17px)",
          color: light ? "rgba(255,255,255,0.68)" : T.tMuted,
          lineHeight: "1.78",
          maxWidth: center ? "580px" : "none",
          margin: center ? "0 auto" : 0,
        }}>
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
  const [hov, setHov] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgOk, setImgOk] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const imgs = useMemo(() => {
    const g = Array.isArray(service.gallery) && service.gallery.length ? service.gallery : null;
    const f = Array.isArray(service.images) && service.images.length ? service.images : null;
    return g || f || [service.image];
  }, [service]);

  const feats = useMemo(
    () => (service.features?.length ? service.features.slice(0, 4) : [service.description]),
    [service],
  );

  const slideI  = useRotating(imgs.length, 4000);
  const featI   = useRotating(feats.length, 3400);

  useEffect(() => {
    if (imgs.length <= 1) return;
    setImgOk(false);
    setImgIdx(slideI);
  }, [imgs.length, slideI]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(service); }
  }, [onClick, service]);

  return (
    <motion.article
      ref={ref}
      className="svc-card"
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={handleKey}
      onMouseEnter={() => !isMobile && setHov(true)}
      onMouseLeave={() => !isMobile && setHov(false)}
      style={{
        position: "relative",
        backgroundColor: T.white,
        borderRadius: T.r2Xl,
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${hov ? T.borderMid : T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadowMd,
        transform: hov && !isMobile ? "translateY(-10px)" : "translateY(0)",
        transition: `all ${T.tSmooth}`,
        willChange: "transform, box-shadow",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Image ── */}
      <div style={{ position: "relative", height: isMobile ? "190px" : "230px", overflow: "hidden", flexShrink: 0 }}>
        {!imgOk && <Skeleton />}

        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={imgs[imgIdx]} alt="" role="presentation"
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgOk(true)}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: imgOk ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              transform: hov ? "scale(1.05)" : "scale(1)",
              transition: `transform 700ms ${T.tSmooth}`,
            }}
          />
        </AnimatePresence>

        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(175deg, transparent 30%, ${T.g950}85 100%)`,
        }} />

        {/* left/right controls */}
        {imgs.length > 1 && [
          { side: "left",  Icon: FiChevronLeft,  fn: () => { setImgOk(false); setImgIdx((p) => (p - 1 + imgs.length) % imgs.length); } },
          { side: "right", Icon: FiChevronRight, fn: () => { setImgOk(false); setImgIdx((p) => (p + 1) % imgs.length); } },
        ].map(({ side, Icon, fn }) => (
          <button key={side} type="button" aria-label={`${side} image`}
            onClick={(e) => { e.stopPropagation(); fn(); }}
            style={{
              position: "absolute", top: "50%", [side]: "10px",
              transform: "translateY(-50%)",
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: T.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              opacity: hov ? 1 : 0,
              pointerEvents: hov ? "auto" : "none",
              transition: `opacity ${T.tBase}`,
              zIndex: 4,
            }}>
            <Icon size={16} />
          </button>
        ))}

        {/* slide dots */}
        {imgs.length > 1 && (
          <div style={{ position: "absolute", bottom: "12px", left: "14px", display: "flex", gap: "5px", zIndex: 4 }}>
            {imgs.slice(0, 6).map((_, i) => (
              <span key={i} style={{
                width: i === imgIdx ? "20px" : "6px", height: "6px",
                borderRadius: T.rFull,
                background: i === imgIdx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                transition: `all ${T.tBase}`,
              }} />
            ))}
          </div>
        )}

        {/* "Premium" tag */}
        <span style={{
          position: "absolute", top: "13px", left: "13px",
          padding: "5px 13px",
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(8px)",
          borderRadius: T.rFull,
          fontSize: "9px", fontWeight: "700", fontFamily: T.sans,
          color: T.g700, textTransform: "uppercase", letterSpacing: "1.2px",
          border: `1px solid ${T.g100}`,
        }}>
          Premium
        </span>

        {/* Icon badge */}
        <div style={{
          position: "absolute", bottom: "-24px", right: "18px",
          width: "50px", height: "50px",
          borderRadius: T.rLg,
          background: `linear-gradient(135deg, ${T.g700}, ${T.g500})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `3px solid ${T.white}`,
          boxShadow: T.shadowMd,
          zIndex: 3,
          transform: hov ? "scale(1.12) rotate(-5deg)" : "scale(1) rotate(0)",
          transition: `transform ${T.tSpring}`,
        }}>
          <ServiceIcon name={service.iconName} size={20} color="white" />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? "28px 16px 18px" : "32px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{
          fontFamily: T.serif,
          fontSize: isMobile ? "18px" : "21px",
          fontWeight: "700", color: T.tDark,
          marginBottom: "8px", lineHeight: "1.25",
        }}>
          {service.title}
        </h3>

        <p style={{
          fontFamily: T.sans, fontSize: "13px",
          color: T.tMuted, lineHeight: "1.68",
          marginBottom: "14px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {service.description}
        </p>

        {/* rotating highlight */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "11px 13px",
          backgroundColor: T.g50, borderRadius: T.rMd,
          border: `1px solid ${T.g100}`, marginBottom: "14px",
          minHeight: "46px",
        }}>
          <Pip total={Math.min(feats.length, 4)} active={featI} vertical />
          <div style={{ flex: 1, position: "relative", height: "18px", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.span key={featI} variants={swap} initial="enter" animate="center" exit="exit"
                style={{
                  position: "absolute", inset: 0,
                  fontSize: "12px", fontFamily: T.sans, fontWeight: "600",
                  color: T.g700, lineHeight: "18px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                {feats[featI]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {service.features.slice(0, 3).map((f, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "4px 10px",
              backgroundColor: T.surfaceLight, borderRadius: T.rFull,
              fontSize: "11px", fontFamily: T.sans, fontWeight: "500",
              color: T.g700, border: `1px solid ${T.g100}`,
              maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <FiCheck size={10} strokeWidth={3} style={{ flexShrink: 0 }} />{f}
            </span>
          ))}
        </div>

        {/* CTA bar */}
        <div style={{
          marginTop: "auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 15px",
          backgroundColor: hov ? T.g700 : T.g50,
          borderRadius: T.rLg,
          border: `1px solid ${hov ? T.g700 : T.g200}`,
          transition: `all ${T.tSmooth}`,
        }}>
          <span style={{
            fontSize: "13px", fontWeight: "600", fontFamily: T.sans,
            color: hov ? T.white : T.g700,
            transition: `color ${T.tBase}`,
          }}>
            Explore Service
          </span>
          <span style={{
            width: "28px", height: "28px", borderRadius: "50%",
            backgroundColor: hov ? "rgba(255,255,255,0.18)" : T.g100,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: hov ? T.white : T.g600,
            transform: hov ? "translateX(3px)" : "none",
            transition: `all ${T.tSmooth}`,
          }}>
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* bottom accent bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: "3px",
        background: `linear-gradient(90deg, ${T.g500}, ${T.g700})`,
        width: hov ? "100%" : "0%",
        transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
      }} />
    </motion.article>
  );
};

// ============================================================================
// PROCESS CARD
// ============================================================================
const ProcessCard = ({ step, index, total, isMobile }) => {
  const [hov, setHov] = useState(false);
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon = step.icon;
  const di   = useRotating(step.descriptions.length, 2800);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", textAlign: "center",
        padding: isMobile ? "40px 18px 28px" : "52px 24px 36px",
        borderRadius: T.r2Xl,
        backgroundColor: hov ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hov ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}`,
        transform: hov ? "translateY(-6px)" : "none",
        transition: `all ${T.tSmooth}`,
      }}>

      {/* step badge */}
      <div style={{
        position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)",
        width: "40px", height: "40px", borderRadius: "50%",
        background: `linear-gradient(135deg, ${T.g500}, ${T.g400})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: "800", fontFamily: T.sans,
        color: T.g950,
        boxShadow: `0 6px 20px rgba(34,197,94,0.3)`,
        border: "3px solid rgba(255,255,255,0.15)",
      }}>
        {step.step}
      </div>

      {/* icon */}
      <div style={{
        width: "64px", height: "64px", borderRadius: T.rXl,
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
        color: T.g400,
        transform: hov ? "scale(1.08)" : "scale(1)",
        transition: `transform ${T.tSpring}`,
      }}>
        <Icon size={isMobile ? 22 : 26} />
      </div>

      <h3 style={{
        fontFamily: T.serif, fontSize: isMobile ? "17px" : "20px",
        fontWeight: "700", color: T.white,
        marginBottom: "12px",
      }}>
        {step.title}
      </h3>

      <div style={{ height: "42px", overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.p key={di} variants={swap} initial="enter" animate="center" exit="exit"
            style={{
              position: "absolute", inset: 0,
              fontSize: isMobile ? "12px" : "13px",
              fontFamily: T.sans, color: "rgba(255,255,255,0.58)", lineHeight: "1.65",
            }}>
            {step.descriptions[di]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
        <Pip total={step.descriptions.length} active={di} />
      </div>

      {/* connector arrow */}
      {!isMobile && index < total - 1 && (
        <div style={{
          position: "absolute", top: "50%", right: "-14px",
          transform: "translateY(-50%)", zIndex: 3,
        }}>
          <FiChevronRight size={18} style={{ color: "rgba(255,255,255,0.18)" }} />
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// WHY-US CARD
// ============================================================================
const WhyCard = ({ item, index, isMobile }) => {
  const [hov, setHov] = useState(false);
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon  = item.icon;
  const di    = useRotating(item.desc.length, 3200);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        backgroundColor: T.white,
        borderRadius: T.r2Xl,
        padding: isMobile ? "24px 20px" : "32px 26px",
        border: `1px solid ${hov ? T.borderMid : T.border}`,
        boxShadow: hov ? T.shadowHover : T.shadowSm,
        transform: hov ? "translateY(-6px)" : "none",
        transition: `all ${T.tSmooth}`,
        overflow: "hidden",
      }}>

      {/* top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${T.g500}, ${T.g700})`,
        transform: hov ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: `transform ${T.tSmooth}`,
      }} />

      {/* icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <div style={{
          width: "50px", height: "50px", borderRadius: T.rLg,
          backgroundColor: T.g50, border: `1px solid ${T.g100}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.g600, flexShrink: 0,
          transform: hov ? "scale(1.08) rotate(-3deg)" : "none",
          transition: `transform ${T.tSpring}`,
        }}>
          <Icon size={22} />
        </div>
        <h3 style={{
          fontFamily: T.serif, fontSize: isMobile ? "16px" : "19px",
          fontWeight: "700", color: T.tDark, lineHeight: "1.3",
        }}>
          {item.title}
        </h3>
      </div>

      {/* rotating description */}
      <div style={{ height: "64px", overflow: "hidden", position: "relative", marginBottom: "12px" }}>
        <AnimatePresence mode="wait">
          <motion.p key={di} variants={swap} initial="enter" animate="center" exit="exit"
            style={{
              position: "absolute", inset: 0,
              fontSize: "13px", fontFamily: T.sans, color: T.tMuted, lineHeight: "1.68",
            }}>
            {item.desc[di]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Pip total={item.desc.length} active={di} />
      </div>

      {/* stat */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: "8px",
        padding: "11px 14px",
        backgroundColor: T.g50, borderRadius: T.rLg,
        border: `1px solid ${T.g100}`,
      }}>
        <span style={{
          fontSize: "22px", fontWeight: "800", fontFamily: T.sans,
          color: T.g600, lineHeight: 1,
        }}>
          {item.stat}
        </span>
        <span style={{
          fontSize: "11px", fontFamily: T.sans, fontWeight: "500",
          color: T.tMuted, textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {item.statLabel}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TESTIMONIAL CARD
// ============================================================================
const TestiCard = ({ testimonial, index }) => {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [imgOk, setImgOk] = useState(false);

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        backgroundColor: T.white,
        borderRadius: T.r2Xl,
        padding: "clamp(22px,4vw,28px)",
        boxShadow: T.shadowMd,
        border: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", height: "100%",
      }}>

      {/* stars */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <FiStar key={i} size={14} fill={T.g500} color={T.g500} />
        ))}
      </div>

      <p style={{
        fontFamily: T.sans, fontSize: "clamp(13px,1.8vw,15px)",
        color: T.tBody, lineHeight: "1.78",
        fontStyle: "italic", flex: 1, marginBottom: "20px",
      }}>
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${T.g200}`,
          backgroundColor: T.g50, flexShrink: 0,
        }}>
          <img src={testimonial.avatar} alt={testimonial.author} loading="lazy"
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: `opacity ${T.tBase}` }} />
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", fontFamily: T.sans, color: T.tDark, marginBottom: "2px" }}>
            {testimonial.author}
          </div>
          <div style={{ fontSize: "12px", fontFamily: T.sans, color: T.tMuted }}>
            {testimonial.role}
          </div>
        </div>
      </div>
    </motion.div>
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
    Object.assign(document.body.style, {
      position: "fixed", top: `-${sy}px`, width: "100%", overflow: "hidden",
    });
    return () => {
      Object.assign(document.body.style, { position: "", top: "", width: "", overflow: "" });
      window.scrollTo(0, sy);
    };
  }, []);

  useEffect(() => { modalRef.current?.focus(); }, []);

  const contacts = useMemo(() => [
    { href: "tel:+250780702773",          Icon: FiPhone,        label: "+250 780 702 773", ext: true },
    { href: "mailto:altuverasafari@gmail.com", Icon: FiMail,    label: "Email Us",          ext: true },
    { href: "/contact",                   Icon: FiMessageCircle,label: "Live Chat",          ext: false },
  ], []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${service.title} details`}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        backgroundColor: T.overlay, backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "10px" : "24px",
      }}>

      <motion.div ref={modalRef} tabIndex={-1} className="modal-scroll"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: T.white,
          borderRadius: isMobile ? T.rXl : T.r3Xl,
          maxWidth: "860px", width: "100%",
          maxHeight: "92vh", overflowY: "auto",
          position: "relative",
          boxShadow: T.shadow2Xl,
          outline: "none",
        }}>

        {/* close */}
        <motion.button onClick={onClose}
          whileHover={{ scale: 1.06, backgroundColor: T.g700 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close"
          style={{
            position: "absolute", top: "14px", right: "14px",
            width: "40px", height: "40px", borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.45)", color: T.white,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
            transition: `background-color ${T.tBase}`,
          }}>
          <FiX size={18} />
        </motion.button>

        {/* hero image */}
        <div style={{
          position: "relative", height: isMobile ? "200px" : "300px", overflow: "hidden",
          borderRadius: `${isMobile ? T.rXl : T.r3Xl} ${isMobile ? T.rXl : T.r3Xl} 0 0`,
        }}>
          {!imgOk && <Skeleton />}
          <img src={service.image} alt={service.title} onLoad={() => setImgOk(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              opacity: imgOk ? 1 : 0, transition: `opacity ${T.tBase}`,
            }} />
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${T.g950}E0 0%, ${T.g950}40 55%, transparent 100%)`,
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: isMobile ? "18px" : "32px", color: T.white,
          }}>
            <Badge style={{ marginBottom: "12px" }}>Signature Experience</Badge>
            <h2 style={{
              fontFamily: T.serif, fontSize: isMobile ? "24px" : "34px",
              fontWeight: "700", margin: 0, lineHeight: "1.2",
            }}>
              {service.title}
            </h2>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: isMobile ? "22px 18px" : "36px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
            gap: isMobile ? "28px" : "36px",
          }}>

            {/* left */}
            <div>
              {/* description */}
              <div style={{ marginBottom: "26px" }}>
                <h3 style={{
                  fontSize: "12px", fontWeight: "700", fontFamily: T.sans,
                  color: T.tDark, marginBottom: "10px",
                  display: "flex", alignItems: "center", gap: "6px",
                  textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  <FiCompass size={14} color={T.g600} /> About This Experience
                </h3>
                <p style={{
                  fontSize: "14px", fontFamily: T.sans, color: T.tMuted,
                  lineHeight: "1.78",
                }}>
                  {service.description} Our expert team ensures every aspect of your{" "}
                  {service.title.toLowerCase()} is meticulously curated to exceed
                  world-class standards and create lasting memories.
                </p>
              </div>

              {/* features */}
              <div>
                <h3 style={{
                  fontSize: "12px", fontWeight: "700", fontFamily: T.sans,
                  color: T.tDark, marginBottom: "12px",
                  display: "flex", alignItems: "center", gap: "6px",
                  textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  <FiCheck size={14} color={T.g600} /> What&apos;s Included
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {service.features.map((feat, idx) => {
                    const active = idx === featI;
                    return (
                      <motion.li key={idx}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + idx * 0.04 }}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: "10px",
                          marginBottom: "7px", padding: "8px 12px",
                          borderRadius: T.rMd,
                          backgroundColor: active ? T.g50 : "transparent",
                          border: `1px solid ${active ? T.g200 : "transparent"}`,
                          color: active ? T.g700 : T.tMuted,
                          fontWeight: active ? "600" : "400",
                          fontSize: "13px", fontFamily: T.sans, lineHeight: "1.6",
                          transition: `all ${T.tSmooth}`,
                        }}>
                        <span style={{
                          width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                          backgroundColor: active ? T.g600 : T.g100,
                          color: active ? T.white : T.g600,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: "1px",
                          transition: `all ${T.tBase}`,
                        }}>
                          <FiCheck size={10} strokeWidth={3} />
                        </span>
                        {feat}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* right — booking CTA */}
            <div>
              <div style={{
                backgroundColor: T.g50,
                padding: isMobile ? "22px" : "28px",
                borderRadius: T.rXl,
                border: `1px solid ${T.g100}`,
                position: isMobile ? "static" : "sticky",
                top: "24px",
              }}>
                <h4 style={{
                  fontSize: "12px", fontWeight: "700", fontFamily: T.sans,
                  color: T.g800, marginBottom: "8px",
                  textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  Ready to Book?
                </h4>
                <p style={{
                  fontSize: "13px", fontFamily: T.sans, color: T.tMuted,
                  marginBottom: "20px", lineHeight: "1.65",
                }}>
                  Let our expert team craft your perfect {service.title.toLowerCase()} experience, tailored just for you.
                </p>

                <Button to="/booking" variant="primary" fullWidth size="large" icon={<FiArrowRight size={15} />}>
                  Start Planning
                </Button>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                  {contacts.map(({ href, Icon, label, ext }) => {
                    const s = {
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 14px",
                      backgroundColor: T.white, borderRadius: T.rMd,
                      fontSize: "12px", fontFamily: T.sans, fontWeight: "500",
                      color: T.tBody, border: `1px solid ${T.border}`,
                      textDecoration: "none", cursor: "pointer",
                      transition: `all ${T.tBase}`,
                    };
                    return ext ? (
                      <a key={label} href={href} className="cl" style={s}>
                        <Icon size={14} color={T.g600} />{label}
                      </a>
                    ) : (
                      <Link key={label} to={href} className="cl" style={s} onClick={onClose}>
                        <Icon size={14} color={T.g600} />{label}
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
// SCROLL PROGRESS BAR
// ============================================================================
const ScrollBar = ({ progress }) => (
  <div
    role="progressbar"
    aria-valuenow={Math.round(progress)}
    aria-valuemin={0} aria-valuemax={100}
    aria-label="Page scroll progress"
    style={{
      position: "fixed", top: 0, left: 0, zIndex: 10001,
      height: "3px", width: `${progress}%`,
      background: `linear-gradient(90deg, ${T.g400}, ${T.g600}, ${T.g700})`,
      transition: "width 80ms linear",
      boxShadow: progress > 0 ? `0 0 12px ${T.g500}60` : "none",
    }}
  />
);

// ============================================================================
// STAT STRIP
// ============================================================================
const StatStrip = ({ isMobile }) => {
  const stats = [
    { value: "5,000+", label: "Happy Travelers" },
    { value: "15+",    label: "Years Experience" },
    { value: "4.9★",   label: "Average Rating" },
    { value: "24/7",   label: "Support" },
  ];

  return (
    <div style={{
      background: `linear-gradient(90deg, ${T.g800}, ${T.g700})`,
      padding: isMobile ? "20px 16px" : "24px 40px",
    }}>
      <div style={{
        maxWidth: "1320px", margin: "0 auto",
        display: "flex", flexWrap: "wrap",
        justifyContent: "center", gap: isMobile ? "24px 40px" : "0",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: isMobile ? "1 1 40%" : "1",
            textAlign: "center",
            padding: isMobile ? "0" : "0 32px",
            borderRight: !isMobile && i < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
          }}>
            <div style={{
              fontFamily: T.serif, fontSize: isMobile ? "26px" : "32px",
              fontWeight: "800", color: T.white, lineHeight: 1,
              marginBottom: "4px",
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: T.sans, fontSize: "11px", fontWeight: "600",
              color: T.g300, textTransform: "uppercase", letterSpacing: "1.5px",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
const Services = () => {
  const [selected, setSelected] = useState(null);
  const isMobile      = useMediaQuery("(max-width: 768px)");
  const isSmall       = useMediaQuery("(max-width: 480px)");
  const scrollProgress = useScrollProgress();

  const open  = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  const pad = isSmall ? "32px 14px" : isMobile ? "44px 18px" : "76px 32px";

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

      {/* ── Page Header ── */}
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive travel experiences designed to create your perfect East African adventure"
        backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
        breadcrumbs={[{ label: "Services", path: "/services" }]}
      />

      {/* ── Cookie bar ── */}
      <div style={{ padding: isMobile ? "8px 18px 0" : "12px 32px 0", backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <CookieSettingsButton />
        </div>
      </div>

      {/* ── Hero tagline strip ── */}
      <section style={{
        padding: isSmall ? "32px 14px 10px" : isMobile ? "36px 18px 14px" : "52px 40px 20px",
        backgroundColor: T.white,
      }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "12px",
              padding: "13px 28px",
              background: `linear-gradient(135deg, ${T.g50}, ${T.surfaceMid})`,
              borderRadius: T.rFull,
              border: `1px solid ${T.g200}`,
              boxShadow: T.shadowSm,
            }}>
            <FiGlobe size={15} color={T.g600} />
            <Rotating
              texts={HERO_TEXTS}
              ms={4000}
              style={{
                fontSize: isMobile ? "13px" : "15px",
                fontFamily: T.sans, fontWeight: "600",
                color: T.g700,
                width: isMobile ? "230px" : "340px",
                height: "22px",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <StatStrip isMobile={isMobile} />

      {/* ════════════════════════ SERVICES GRID ════════════════════════ */}
      <section style={{ padding: pad, backgroundColor: T.surfaceLight }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="perspectiveIn">
            <SectionHeader
              label="✦ What We Offer"
              title="Tailored Travel Experiences"
              subtitle="From thrilling safaris to cultural immersions — discover our complete range of services crafted to make your East African journey extraordinary."
            />
          </AnimatedSection>

          <div className="gs" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "28px",
          }}>
            {services.map((svc, i) => (
              <AnimatedSection key={svc.id} animation="flipIn" delay={i * 0.08}>
                <ServiceCard service={svc} index={i} onClick={open} isMobile={isMobile} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ PROCESS ════════════════════════ */}
      <section style={{
        padding: pad,
        background: `linear-gradient(150deg, ${T.g950} 0%, ${T.g900} 45%, ${T.g800} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative orbs */}
        {[
          { top: "-20%", left: "-10%",  size: "500px", color: `${T.g700}18` },
          { top: "60%",  right: "-10%", size: "400px", color: `${T.g600}12` },
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

          <div className="gp" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: "24px",
          }}>
            {PROCESS_STEPS.map((step, i) => (
              <AnimatedSection key={step.step} animation="slideReveal"
                delay={i * 0.12} direction={i % 2 === 0 ? "left" : "right"}>
                <ProcessCard step={step} index={i} total={PROCESS_STEPS.length} isMobile={isMobile} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY US ════════════════════════ */}
      <section style={{ padding: pad, backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="zoomIn">
            <SectionHeader
              label="✦ Why Altuvera"
              title="The Altuvera Difference"
              subtitle="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
            />
          </AnimatedSection>

          <div className="gw" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: "24px",
          }}>
            {WHY_US.map((item, i) => (
              <AnimatedSection key={item.title} animation="zoomIn" delay={i * 0.09}>
                <WhyCard item={item} index={i} isMobile={isMobile} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section style={{ padding: pad, backgroundColor: T.surfaceLight }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="blurIn">
            <SectionHeader
              label="✦ Testimonials"
              title="What Our Travelers Say"
              subtitle="Don't just take our word for it — hear from adventurers who've experienced the Altuvera difference."
            />
          </AnimatedSection>

          <div className="gt" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: "24px",
          }}>
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.author} animation="blurIn" delay={i * 0.15}>
                <TestiCard testimonial={t} index={i} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <section style={{ padding: pad, backgroundColor: T.white }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: "920px", margin: "0 auto",
              padding: isSmall ? "40px 22px" : isMobile ? "48px 28px" : "76px 60px",
              background: `linear-gradient(135deg, ${T.g900} 0%, ${T.g800} 50%, ${T.g700} 100%)`,
              borderRadius: isMobile ? T.rXl : T.r3Xl,
              boxShadow: `${T.shadow2Xl}, ${T.shadowGlow}`,
              position: "relative", overflow: "hidden",
              textAlign: "center",
            }}>

            {/* decorative orbs */}
            {[
              { top: "-50%", left: "-20%",  size: "360px" },
              { bottom: "-50%", right: "-20%", size: "320px" },
            ].map((o, i) => (
              <div key={i} aria-hidden="true" style={{
                position: "absolute", ...o, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
            ))}

            {/* thin top border */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
              background: `linear-gradient(90deg, transparent, ${T.g400}60, transparent)`,
            }} />

            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.1 }}
                style={{ marginBottom: "18px" }}>
                <Badge light style={{ color: T.g300 }}>
                  <FiSun size={12} /> Start Your Adventure
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.18 }}
                style={{
                  fontFamily: T.serif,
                  fontSize: isSmall ? "24px" : isMobile ? "28px" : "40px",
                  fontWeight: "800", color: T.white,
                  marginBottom: "14px", lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                }}>
                Ready to Start Your Journey?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.25 }}
                style={{
                  fontFamily: T.sans, fontSize: isMobile ? "14px" : "16px",
                  color: "rgba(255,255,255,0.76)",
                  maxWidth: "520px", margin: "0 auto 24px",
                  lineHeight: "1.78",
                }}>
                Contact our expert team today and let us help you plan the adventure of a lifetime
                across the breathtaking landscapes of East Africa.
              </motion.p>

              {/* rotating trust badge */}
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}>
                <Rotating
                  texts={CTA_TEXTS}
                  ms={3000}
                  style={{
                    fontSize: "13px", fontFamily: T.sans,
                    color: "rgba(255,255,255,0.62)",
                    width: isMobile ? "260px" : "320px",
                    height: "20px",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.36 }}
                style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Button to="/booking" variant="white" size="large" icon={<FiArrowRight size={15} />}>
                  Start Planning
                </Button>
                <Button to="/contact" variant="outline" size="large" style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  color: T.white,
                  backgroundColor: "transparent",
                }}>
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence mode="wait">
        {selected && (
          <ServiceModal key={selected.id} service={selected} onClose={close} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;