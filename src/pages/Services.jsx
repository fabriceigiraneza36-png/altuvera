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
  FiZap,
  FiCamera,
  FiMap,
  FiFeather,
  FiSun,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiBriefcase,
  FiPackage,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import AnimatedSection from "../components/common/AnimatedSection";
import TeamCard from "../components/common/TeamCard";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";

/* ─────────────────────────────────────────────
   INJECT FONTS + BASE STYLES
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sv-green:    #059669;
      --sv-green-lt: #10b981;
      --sv-green-dk: #047857;
      --sv-forest:   #022c22;
      --sv-mint:     #ecfdf5;
      --sv-text:     #0f172a;
      --sv-text-2:   #475569;
      --sv-text-3:   #94a3b8;
      --sv-border:   #e2e8f0;
      --sv-surface:  #ffffff;
      --sv-bg:       #f8fafb;
      --sv-radius:   20px;
      --sv-ease:     cubic-bezier(0.22,1,0.36,1);
    }

    @keyframes sv-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes sv-gradient-shift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes sv-fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .sv-page {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--sv-bg);
      color: var(--sv-text);
    }

    /* ── Scroll progress bar ── */
    .sv-progress {
      position: fixed; top: 0; left: 0; z-index: 9999;
      height: 3px;
      background: linear-gradient(90deg, #10b981, #059669, #047857);
      transition: width 80ms linear;
      box-shadow: 0 0 10px rgba(16,185,129,.4);
    }

    /* ── Section ── */
    .sv-section {
      padding: clamp(48px,6vw,80px) clamp(16px,5vw,56px);
    }
    .sv-section--white { background: #fff; }
    .sv-section--mint  { background: var(--sv-mint); }
    .sv-section--dark  {
      background: linear-gradient(140deg, var(--sv-forest) 0%, #064e3b 55%, var(--sv-forest) 100%);
      background-size: 200% 200%;
      animation: sv-gradient-shift 14s ease infinite;
    }
    .sv-inner { max-width: 1360px; margin: 0 auto; }

    /* ── Section head ── */
    .sv-head {
      text-align: center;
      max-width: 720px;
      margin: 0 auto clamp(28px,4vw,48px);
    }
    .sv-label {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 16px; border-radius: 999px;
      background: var(--sv-mint); color: var(--sv-green-dk);
      font-size: 11px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      border: 1px solid #a7f3d0; margin-bottom: 16px;
    }
    .sv-label--light {
      background: rgba(16,185,129,.15);
      color: #a7f3d0; border-color: rgba(16,185,129,.25);
    }
    .sv-h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(28px,4.5vw,50px);
      font-weight: 400; line-height: 1.1;
      color: var(--sv-text); margin: 0 0 14px;
      letter-spacing: -.025em;
    }
    .sv-h2--light { color: #fff; }
    .sv-desc {
      font-size: clamp(14px,1.4vw,16px);
      color: var(--sv-text-2); line-height: 1.8;
      max-width: 600px; margin: 0 auto;
    }
    .sv-desc--light { color: rgba(255,255,255,.68); }

    /* ── Skeleton shimmer ── */
    .sv-skel {
      background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
      background-size: 200%; border-radius: 10px;
      animation: sv-shimmer 1.6s ease infinite;
    }

    /* ─── SERVICE CARD ─── */
    .sv-card {
      background: #fff;
      border-radius: var(--sv-radius);
      border: 1.5px solid var(--sv-border);
      box-shadow: 0 2px 16px rgba(0,0,0,.05);
      overflow: hidden;
      display: flex; flex-direction: column;
      height: 100%; cursor: pointer;
      transition: transform .42s var(--sv-ease),
                  box-shadow .42s var(--sv-ease),
                  border-color .3s ease;
    }
    .sv-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 56px rgba(5,150,105,.14), 0 0 0 1.5px rgba(16,185,129,.2);
      border-color: rgba(16,185,129,.3);
    }
    .sv-card:focus-visible {
      outline: 3px solid #10b981; outline-offset: 4px;
    }
    .sv-card__img {
      transition: transform .65s var(--sv-ease);
    }
    .sv-card:hover .sv-card__img { transform: scale(1.06); }

    .sv-card__cta {
      transition: background .35s var(--sv-ease), color .25s ease;
    }
    .sv-card:hover .sv-card__cta {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: #fff !important;
    }
    .sv-card:hover .sv-card__cta-icon { color: #fff !important; }
    .sv-card:hover .sv-card__cta-text { color: #fff !important; }

    /* ── Why cards ── */
    .sv-why-card {
      background: #fff;
      border-radius: 18px;
      border: 1.5px solid var(--sv-border);
      padding: clamp(22px,3vw,30px);
      transition: transform .38s var(--sv-ease), box-shadow .38s ease, border-color .3s ease;
      height: 100%;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .sv-why-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 44px rgba(5,150,105,.1);
      border-color: rgba(16,185,129,.28);
    }
    .sv-why-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, #10b981, #059669);
      transform: scaleX(0); transform-origin: left;
      transition: transform .42s var(--sv-ease);
    }
    .sv-why-card:hover::before { transform: scaleX(1); }
    .sv-why-icon {
      transition: transform .4s var(--sv-ease), background .3s ease;
    }
    .sv-why-card:hover .sv-why-icon {
      transform: scale(1.08) rotate(-4deg);
      background: var(--sv-green) !important;
      color: #fff !important;
    }

    /* ── Testimonial card ── */
    .sv-testi-card {
      background: #fff;
      border-radius: 18px;
      border: 1.5px solid var(--sv-border);
      padding: clamp(22px,3vw,28px);
      box-shadow: 0 2px 14px rgba(0,0,0,.04);
      transition: transform .38s var(--sv-ease), box-shadow .38s ease;
      height: 100%; display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .sv-testi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 44px rgba(5,150,105,.1);
    }

    /* ── Modal scrollbar ── */
    .sv-modal-scroll::-webkit-scrollbar { width: 4px; }
    .sv-modal-scroll::-webkit-scrollbar-track { background: #f0fdf4; }
    .sv-modal-scroll::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 2px; }

    /* ── Grids ── */
    .sv-grid-3 {
      display: grid;
      gap: clamp(16px,2.5vw,24px);
      grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr));
    }
    .sv-grid-2 {
      display: grid;
      gap: clamp(14px,2vw,20px);
      grid-template-columns: repeat(auto-fill, minmax(min(100%,280px),1fr));
    }

    @media (max-width: 480px) {
      .sv-grid-3, .sv-grid-2 { grid-template-columns: 1fr; }
    }
    @media (min-width: 481px) and (max-width: 767px) {
      .sv-grid-3 { grid-template-columns: repeat(2,1fr); }
      .sv-grid-2 { grid-template-columns: repeat(2,1fr); }
    }
    @media (min-width: 768px) {
      .sv-grid-3 { grid-template-columns: repeat(3,1fr); }
      .sv-grid-2 { grid-template-columns: repeat(3,1fr); }
    }
    @media (min-width: 1100px) {
      .sv-grid-3 { grid-template-columns: repeat(3,1fr); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   TEAM DATA (live + fallback)
───────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { Accept: "application/json", ...options.headers },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `Status ${res.status}`);
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== "AbortError") {
        await new Promise((r) => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
};

const FALLBACK_TEAM = [
  {
    id: 1,
    name: "IGIRANEZA Fabrice",
    role: "Founder & CEO",
    department: "Leadership",
    image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
    expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"],
    languages: ["English", "French", "Kinyarwanda"],
    location: "Musanze, Rwanda",
    is_featured: true,
    is_active: true,
  },
  {
    id: 2,
    name: "UWIMANA Grace",
    role: "Head of Operations",
    department: "Operations",
    image_url: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Ensures seamless coordination of every itinerary with precision and local expertise.",
    expertise: ["Logistics Management", "Quality Assurance", "Team Coordination"],
    languages: ["English", "Swahili"],
    location: "Musanze, Rwanda",
    is_featured: false,
    is_active: true,
  },
  {
    id: 3,
    name: "MUTABAZI Jean",
    role: "Lead Safari Guide",
    department: "Guides",
    image_url: "https://randomuser.me/api/portraits/men/67.jpg",
    bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards.",
    expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"],
    languages: ["English", "Swahili", "French"],
    location: "Serengeti, Tanzania",
    is_featured: true,
    is_active: true,
  },
];

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const WHY_ITEMS = [
  {
    Icon: FiAward,
    title: "Expert Local Guides",
    stat: "15+ yrs",
    desc: "Certified field guides with deep ecological knowledge, cultural fluency, and wildlife expertise.",
  },
  {
    Icon: FiShield,
    title: "Fully Insured & Safe",
    stat: "100%",
    desc: "Comprehensive travel insurance, rigorous safety protocols, and 24/7 emergency response.",
  },
  {
    Icon: FiUsers,
    title: "Small-Group Intimacy",
    stat: "≤ 12",
    desc: "Maximum personal attention in intimate groups — no overcrowded buses or rushed itineraries.",
  },
  {
    Icon: FiTarget,
    title: "Bespoke Itineraries",
    stat: "Custom",
    desc: "Every journey is built from scratch around your timeline, interests, budget, and travel style.",
  },
  {
    Icon: FiTrendingUp,
    title: "Consistently Rated 4.9★",
    stat: "4.9 ★",
    desc: "Thousands of verified five-star reviews across Google, TripAdvisor, and independent platforms.",
  },
  {
    Icon: FiClock,
    title: "24/7 On-Ground Support",
    stat: "24 / 7",
    desc: "Live assistance from first enquiry through to your safe return — we're always just a call away.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Every single detail was flawlessly executed. Our guides brought the ecosystem to life in ways no documentary ever could.",
    author: "Sarah Mitchell",
    role: "Wildlife Photographer · United Kingdom",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    trip: "Serengeti Safari",
  },
  {
    quote:
      "From the Serengeti plains to Zanzibar's shores, our honeymoon was crafted with extraordinary care and attention.",
    author: "James & Emily Parker",
    role: "Honeymooners · Australia",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    trip: "Tanzania Honeymoon",
  },
  {
    quote:
      "Professional, deeply knowledgeable, and genuinely passionate about conservation. An experience I will treasure forever.",
    author: "Michael Chen",
    role: "Adventure Traveller · Canada",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    trip: "Gorilla Trekking",
  },
];

/* ─────────────────────────────────────────────
   HELPERS / HOOKS
───────────────────────────────────────────── */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const useKeyClose = (fn) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
};

const Reveal = ({ index = 0, children }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity .55s var(--sv-ease), transform .55s var(--sv-ease)`,
        transitionDelay: `${(index % 6) * 70}ms`,
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────────── */
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = useMemo(() => {
    const g = Array.isArray(service.gallery) && service.gallery.length ? service.gallery : null;
    const f = Array.isArray(service.images)  && service.images.length  ? service.images  : null;
    return g || f || [service.image];
  }, [service]);

  const prev = (e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(p => (p - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(p => (p + 1) % images.length); };

  const features = service.features?.slice(0, 3) || [];

  return (
    <article
      className="sv-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(service)}
    >
      {/* ── Image ── */}
      <div style={{ position: "relative", height: isMobile ? "200px" : "230px", overflow: "hidden", flexShrink: 0 }}>
        {!imgLoaded && (
          <div className="sv-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={images[imgIdx]}
            alt={service.title}
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgLoaded(true)}
            className="sv-card__img"
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .35 }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AnimatePresence>

        {/* Gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,44,34,.05) 0%, rgba(2,44,34,.68) 100%)" }} />

        {/* Arrow nav */}
        {images.length > 1 && ["prev","next"].map(dir => (
          <button
            key={dir}
            type="button"
            onClick={dir === "prev" ? prev : next}
            aria-label={dir === "prev" ? "Previous image" : "Next image"}
            style={{
              position: "absolute", top: "50%",
              [dir === "prev" ? "left" : "right"]: 10,
              transform: "translateY(-50%)",
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(2,44,34,.55)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 4,
            }}
          >
            {dir === "prev" ? <FiChevronLeft size={14}/> : <FiChevronRight size={14}/>}
          </button>
        ))}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 54, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 4 }}>
            {images.slice(0,5).map((_,i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(i); }}
                aria-label={`Image ${i+1}`}
                style={{
                  width: i === imgIdx ? 20 : 5, height: 5,
                  borderRadius: 999,
                  background: i === imgIdx ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.4)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all .38s var(--sv-ease)",
                }}
              />
            ))}
          </div>
        )}

        {/* Badge */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 999,
            background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)",
            fontSize: 10, fontWeight: 800, color: "#047857",
            textTransform: "uppercase", letterSpacing: "1.5px",
            border: "1px solid rgba(167,243,208,.5)",
          }}>
            Premium
          </span>
        </div>

        {/* Title overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 14px", zIndex: 3 }}>
          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: isMobile ? 18 : 21,
            fontWeight: 400, color: "#fff",
            lineHeight: 1.18, margin: 0,
            textShadow: "0 1px 8px rgba(2,44,34,.5)",
          }}>
            {service.title}
          </h3>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? "18px 16px" : "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{
          fontSize: 13, color: "var(--sv-text-2)", lineHeight: 1.72,
          marginBottom: 16,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {service.description}
        </p>

        {/* Features */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {features.map((f, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 999,
              background: i === 0 ? "var(--sv-mint)" : "#f8fafc",
              border: `1px solid ${i === 0 ? "#a7f3d0" : "var(--sv-border)"}`,
              fontSize: 11, fontWeight: 600,
              color: i === 0 ? "var(--sv-green-dk)" : "var(--sv-text-2)",
              maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <FiCheck size={9} strokeWidth={3} color={i === 0 ? "#059669" : "#94a3b8"} />
              {f}
            </span>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, #e2e8f0, transparent)", marginBottom: 16 }} />

        {/* CTA row */}
        <div
          className="sv-card__cta"
          style={{
            marginTop: "auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 16px", borderRadius: 14,
            background: "var(--sv-mint)",
            border: "1.5px solid #a7f3d0",
          }}
        >
          <span className="sv-card__cta-text" style={{ fontSize: 13, fontWeight: 700, color: "var(--sv-green-dk)" }}>
            View Experience
          </span>
          <span className="sv-card__cta-icon" style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(5,150,105,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--sv-green-dk)",
          }}>
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────
   WHY CARD
───────────────────────────────────────────── */
const WhyCard = ({ item, index }) => {
  const { Icon, title, stat, desc } = item;
  return (
    <div className="sv-why-card">
      {/* Stat badge */}
      <div style={{
        position: "absolute", top: 18, right: 18,
        padding: "4px 12px", borderRadius: 999,
        background: "var(--sv-mint)", border: "1px solid #a7f3d0",
        fontSize: 12, fontWeight: 800, color: "var(--sv-green-dk)",
      }}>
        {stat}
      </div>

      {/* BG blob */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: "radial-gradient(circle, #ecfdf5 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="sv-why-icon" style={{
        width: 48, height: 48, borderRadius: 14,
        background: "var(--sv-mint)", border: "1.5px solid #a7f3d0",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--sv-green-dk)", marginBottom: 14, flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>

      <h3 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: "clamp(17px,2vw,20px)", fontWeight: 400,
        color: "var(--sv-text)", marginBottom: 10, lineHeight: 1.2,
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 13.5, color: "var(--sv-text-2)", lineHeight: 1.72, flex: 1 }}>
        {desc}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────────── */
const TestiCard = ({ t }) => {
  const [imgOk, setImgOk] = useState(false);
  return (
    <div className="sv-testi-card">
      {/* Watermark */}
      <div aria-hidden style={{
        position: "absolute", top: -4, right: 18,
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 88, color: "#ecfdf5", lineHeight: 1,
        fontWeight: 400, userSelect: "none", pointerEvents: "none",
      }}>
        "
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <FiStar key={i} size={13} fill="#10b981" color="#10b981" />
        ))}
      </div>

      {/* Trip label */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 999,
        background: "var(--sv-mint)", border: "1px solid #a7f3d0",
        fontSize: 10, fontWeight: 700, color: "var(--sv-green-dk)",
        textTransform: "uppercase", letterSpacing: ".07em",
        marginBottom: 14,
      }}>
        <FiCompass size={10} /> {t.trip}
      </div>

      {/* Quote */}
      <p style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: "clamp(13px,1.5vw,14.5px)",
        color: "var(--sv-text-2)", lineHeight: 1.82,
        fontStyle: "italic", flex: 1, marginBottom: 20,
        position: "relative",
      }}>
        "{t.quote}"
      </p>

      {/* Author */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: "#f8fafb", borderRadius: 14,
        border: "1.5px solid var(--sv-border)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
          border: "2px solid #a7f3d0", background: "#ecfdf5", flexShrink: 0,
        }}>
          <img
            src={t.avatar} alt={t.author} loading="lazy"
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: "opacity .3s" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sv-text)" }}>{t.author}</div>
          <div style={{ fontSize: 11.5, color: "var(--sv-text-3)", fontWeight: 500, marginTop: 1 }}>{t.role}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FiCheck size={12} color="#fff" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SERVICE MODAL
───────────────────────────────────────────── */
const ServiceModal = ({ service, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgOk, setImgOk] = useState(false);
  const panelRef = useRef(null);

  useKeyClose(onClose);

  useEffect(() => {
    const sy = window.scrollY;
    Object.assign(document.body.style, { position: "fixed", top: `-${sy}px`, width: "100%", overflow: "hidden" });
    panelRef.current?.focus();
    return () => {
      Object.assign(document.body.style, { position: "", top: "", width: "", overflow: "" });
      window.scrollTo(0, sy);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .2 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${service.title} details`}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(2,44,34,.88)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 8 : 24,
      }}
    >
      <motion.div
        ref={panelRef} tabIndex={-1}
        className="sv-modal-scroll"
        initial={{ scale: .92, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .92, opacity: 0, y: 28 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: isMobile ? 20 : 28,
          maxWidth: 880, width: "100%", maxHeight: "92vh",
          overflowY: "auto", position: "relative",
          boxShadow: "0 40px 80px rgba(2,44,34,.3)", outline: "none",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(2,44,34,.6)", color: "#fff",
            border: "1px solid rgba(255,255,255,.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
            transition: "background .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(2,44,34,.85)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(2,44,34,.6)"}
        >
          <FiX size={17} />
        </button>

        {/* Hero image */}
        <div style={{
          position: "relative", height: isMobile ? 210 : 320, overflow: "hidden",
          borderRadius: isMobile ? "20px 20px 0 0" : "28px 28px 0 0",
        }}>
          {!imgOk && <div className="sv-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
          <img
            src={service.image} alt={service.title}
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: "opacity .4s" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,44,34,.85) 0%, rgba(2,44,34,.35) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "20px 20px 18px" : "30px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.3)",
              color: "#a7f3d0", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".08em",
              marginBottom: 10,
            }}>
              <FiPackage size={10} /> Signature Experience
            </span>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: isMobile ? 22 : 34, fontWeight: 400,
              color: "#fff", margin: 0, lineHeight: 1.15,
            }}>
              {service.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "22px 18px" : "32px 36px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
            gap: isMobile ? 24 : 36,
          }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 10,
                }}>
                  <FiFeather size={12} /> About This Experience
                </h3>
                <p style={{ fontSize: 14, color: "var(--sv-text-2)", lineHeight: 1.82 }}>
                  {service.description}
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 12,
                }}>
                  <FiCheck size={12} /> What's Included
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {service.features.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: .05 + idx * .04 }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "8px 12px", borderRadius: 12,
                        background: "#f8fafb", border: "1.5px solid #e2e8f0",
                        fontSize: 13, color: "var(--sv-text-2)", lineHeight: 1.6,
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: "var(--sv-green)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <FiCheck size={9} strokeWidth={3} />
                      </span>
                      {feat}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Booking panel */}
            <div>
              <div style={{
                background: "var(--sv-mint)", padding: isMobile ? 20 : 26,
                borderRadius: 18, border: "1.5px solid #a7f3d0",
                position: isMobile ? "static" : "sticky", top: 20,
              }}>
                <h4 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  Ready to Book?
                </h4>
                <p style={{ fontSize: 13, color: "var(--sv-text-2)", marginBottom: 18, lineHeight: 1.68 }}>
                  Let our team craft your perfect{" "}
                  {service.title.toLowerCase()} experience.
                </p>

                <Button to="/booking" variant="primary" fullWidth size="large" icon={<FiArrowRight size={14}/>}>
                  Start Planning
                </Button>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {[
                    { href: "tel:+250792352409", Icon: FiPhone, label: "+250 792 352 409", ext: true },
                    { href: "/contact", Icon: FiMail, label: "Send an Enquiry", ext: false },
                  ].map(({ href, Icon: Ic, label, ext }) => {
                    const s = {
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "11px 14px", borderRadius: 12, background: "#fff",
                      border: "1.5px solid var(--sv-border)",
                      fontSize: 13, fontWeight: 600, color: "var(--sv-text-2)",
                      textDecoration: "none", cursor: "pointer",
                      transition: "border-color .2s, color .2s, background .2s",
                    };
                    return ext ? (
                      <a key={label} href={href} style={s}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#a7f3d0"; e.currentTarget.style.color="var(--sv-green-dk)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--sv-border)"; e.currentTarget.style.color="var(--sv-text-2)"; }}>
                        <Ic size={14} color="var(--sv-green)" /> {label}
                      </a>
                    ) : (
                      <Link key={label} to={href} style={s} onClick={onClose}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#a7f3d0"; e.currentTarget.style.color="var(--sv-green-dk)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--sv-border)"; e.currentTarget.style.color="var(--sv-text-2)"; }}>
                        <Ic size={14} color="var(--sv-green)" /> {label}
                      </Link>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1.5px solid #a7f3d0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Free consultation — no obligation", "100% satisfaction guarantee", "Flexible payment options"].map((txt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--sv-text-2)" }}>
                      <FiCheck size={12} color="var(--sv-green)" strokeWidth={3} /> {txt}
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

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
const SectionHead = ({ label, title, desc, light = false, Icon = FiCompass }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className="sv-head"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity .55s var(--sv-ease), transform .55s var(--sv-ease)",
      }}
    >
      <div className={`sv-label ${light ? "sv-label--light" : ""}`}>
        <Icon size={11} /> {label}
      </div>
      <h2 className={`sv-h2 ${light ? "sv-h2--light" : ""}`}>{title}</h2>
      {desc && <p className={`sv-desc ${light ? "sv-desc--light" : ""}`}>{desc}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const Services = () => {
  const [selected, setSelected] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollProgress = useScrollProgress();

  const open  = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await teamAPI.getAll({ sort: "display_order", order: "ASC", limit: 6 });
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setTeamMembers(arr.length > 0 ? arr : FALLBACK_TEAM);
    } catch (err) {
      setTeamMembers(FALLBACK_TEAM);
      setTeamError(err.message || "Unable to load team members");
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <>
      <SEO
        title="Our Services"
        description="Discover Altuvera's premium safari services across East Africa — wildlife expeditions, gorilla trekking, mountain climbing, beach holidays, and bespoke cultural experiences."
        keywords={["safari services","East Africa travel","guided tours","wildlife expeditions","adventure travel"]}
        url="/services"
        type="website"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Services", url: "/services" }]}
      />

      <GlobalStyles />

      {/* Progress bar */}
      <div className="sv-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="sv-page">
        <PageHeader
          title="Our Services"
          subtitle="Premium travel experiences crafted for the discerning East Africa adventurer"
          backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
          breadcrumbs={[{ label: "Services", path: "/services" }]}
        />

        {/* ══ SERVICES GRID ══ */}
        <section className="sv-section">
          <div className="sv-inner">
            <SectionHead
              label="What We Offer"
              title="Tailored Travel Experiences"
              desc="From thrilling wildlife safaris to cultural immersions — explore our complete range of handcrafted East Africa journeys."
              Icon={FiPackage}
            />

            <div className="sv-grid-3">
              {services.map((svc, i) => (
                <Reveal key={svc.id} index={i}>
                  <ServiceCard service={svc} index={i} onClick={open} isMobile={isMobile} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHY ALTUVERA ══ */}
        <section className="sv-section sv-section--white">
          <div className="sv-inner">
            <SectionHead
              label="Why Altuvera"
              title="The Altuvera Difference"
              desc="Expertise, passion, and an unwavering commitment to excellence — here is what sets us apart."
              Icon={FiAward}
            />

            <div className="sv-grid-2">
              {WHY_ITEMS.map((item, i) => (
                <Reveal key={item.title} index={i}>
                  <WhyCard item={item} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TEAM ══ */}
        <section className="sv-section sv-section--white">
          <div className="sv-inner">
            <SectionHead
              label="Meet The Team"
              title="The People Behind Every Journey"
              desc="Our specialists combine local knowledge, conservation experience, and hospitality excellence to deliver seamless East African adventures."
              Icon={FiUsers}
            />

            {teamError && !teamLoading && (
              <div style={{ textAlign: 'center', marginBottom: 24, color: '#b45309', fontSize: 13, fontWeight: 600 }}>
                Showing preview team members while the live feed is unavailable.
              </div>
            )}

            <div className="sv-grid-3">
              {teamLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ padding: 18, borderRadius: 24, background: '#fff', border: '1px solid #e2e8f0', minHeight: 360 }}>
                      <div className="sv-skel" style={{ width: 112, height: 112, borderRadius: '50%', margin: '0 auto 16px' }} />
                      <div className="sv-skel" style={{ height: 20, width: '64%', margin: '0 auto 10px' }} />
                      <div className="sv-skel" style={{ height: 14, width: '44%', margin: '0 auto 16px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '84%', margin: '0 auto 8px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '72%', margin: '0 auto 8px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '68%', margin: '0 auto' }} />
                    </div>
                  ))
                : teamMembers.map((member, i) => (
                    <Reveal key={member.id || i} index={i}>
                      <TeamCard member={member} />
                    </Reveal>
                  ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="sv-section sv-section--mint">
          <div className="sv-inner">
            <SectionHead
              label="Traveller Stories"
              title="Voices of Our Community"
              desc="Real accounts from travellers who experienced the Altuvera difference — and came back changed."
              Icon={FiHeart}
            />

            <div className="sv-grid-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.author} index={i}>
                  <TestiCard t={t} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="sv-section sv-section--white">
          <div className="sv-inner">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: .6, ease: [.22,1,.36,1] }}
              style={{
                maxWidth: 900, margin: "0 auto",
                padding: isMobile ? "48px 24px" : "72px 72px",
                background: "linear-gradient(140deg, var(--sv-forest) 0%, #064e3b 50%, #047857 100%)",
                backgroundSize: "200% 200%",
                animation: "sv-gradient-shift 14s ease infinite",
                borderRadius: isMobile ? 22 : 32,
                boxShadow: "0 40px 80px rgba(2,44,34,.25), 0 0 60px rgba(16,185,129,.1)",
                position: "relative", overflow: "hidden", textAlign: "center",
              }}
            >
              {/* Orbs */}
              {[
                { top: "-40%", left: "-12%" },
                { bottom: "-40%", right: "-12%" },
              ].map((pos, i) => (
                <div key={i} aria-hidden style={{
                  position: "absolute", ...pos,
                  width: 360, height: 360, borderRadius: "50%", pointerEvents: "none",
                  background: "radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%)",
                }} />
              ))}

              {/* Top shimmer line */}
              <div style={{
                position: "absolute", top: 0, left: "12%", right: "12%",
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(167,243,208,.3), transparent)",
              }} />

              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 16px", borderRadius: 999,
                  background: "rgba(16,185,129,.18)", border: "1px solid rgba(16,185,129,.3)",
                  color: "#a7f3d0", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 20,
                }}>
                  <FiSun size={11} /> Begin Your Adventure
                </div>

                <h2 style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(28px,5.5vw,52px)", fontWeight: 400,
                  color: "#fff", lineHeight: 1.1, letterSpacing: "-.025em",
                  marginBottom: 16,
                }}>
                  Ready to Start Your Journey?
                </h2>

                <p style={{
                  fontSize: "clamp(14px,1.5vw,17px)",
                  color: "rgba(255,255,255,.68)",
                  maxWidth: 520, margin: "0 auto 28px",
                  lineHeight: 1.8,
                }}>
                  Contact our expert team and let us design the East African adventure
                  of a lifetime — tailored entirely to you.
                </p>

                {/* Trust chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: 8, marginBottom: 32,
                }}>
                  {["5,000+ travellers worldwide","4.9 ★ average rating","100% satisfaction guarantee"].map((txt, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 14px", borderRadius: 999,
                      background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.13)",
                      fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 500,
                    }}>
                      <FiCheck size={10} color="#4ade80" strokeWidth={3} /> {txt}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button to="/booking" variant="white" size="large" icon={<FiArrowRight size={15}/>}>
                    Start Planning
                  </Button>
                  <Button to="/contact" variant="outline" size="large"
                    style={{ borderColor: "rgba(255,255,255,.28)", color: "#fff", background: "transparent" }}>
                    <FiMail size={15} /> Contact Us
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

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