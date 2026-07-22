// src/pages/DestinationDetail.jsx
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  createContext, useContext,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import { useDestinationComments } from "../hooks/useDestinationComments";
import { useDestinationLikes } from "../hooks/useDestinationLikes";
import { useUserAuth } from "../context/UserAuthContext";
import { api } from "../utils/api";
import PageHeader from "../components/common/PageHeader";
import "../styles/destinationDetail.css";

/* ══════════════════════════════════════════════════════════════
   ICON SYSTEM
══════════════════════════════════════════════════════════════ */
const PATHS = {
  clock:         "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5H11v6l5.2 3.2.8-1.2-4.5-2.7V7z",
  star:          "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  users:         "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  calendar:      "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  mapPin:        "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  globe:         "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  compass:       "M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 5.8l-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z",
  camera:        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  eye:           "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:             "M18 6L6 18M6 6l12 12",
  chevronLeft:   "M15 18l-6-6 6-6",
  chevronRight:  "M9 18l6-6-6-6",
  chevronDown:   "M6 9l6 6 6-6",
  check:         "M20 6L9 17l-5-5",
  checkCircle:   "M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3",
  shield:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  headphones:    "M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z",
  award:         "M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  mail:          "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  messageCircle: "M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z",
  arrowDown:     "M12 5v14M19 12l-7 7-7-7",
  arrowRight:    "M5 12h14M12 5l7 7-7 7",
  sparkles:      "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  alertTriangle: "M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4m0 4h.01",
  lightbulb:     "M9 21h6m-3-18a6 6 0 00-4 10.5V17a1 1 0 001 1h6a1 1 0 001-1v-3.5A6 6 0 0012 3z",
  backpack:      "M4 10l-.3 8.2A2 2 0 005.7 20h12.7a2 2 0 002-1.8L20 10M4 10h16M4 10l1-6h14l1 6",
  ticket:        "M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z",
  barChart:      "M18 20V10M12 20V4M6 20v-6",
  calendarCheck: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  creditCard:    "M1 4h22v16H1zM1 10h22",
  info:          "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  map:           "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  sunrise:       "M17 18a5 5 0 10-10 0m5-11v7M4.2 10.2l1.4 1.4M1 18h2m18 0h2M18.4 11.6l1.4-1.4M23 22H1",
  moon:          "M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  mountain:      "M8 3l4 8 5-5 5 15H2L8 3z",
  waves:         "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1",
  home:          "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  car:           "M16 3h-2l-2 3H5a2 2 0 00-2 2v7a2 2 0 002 2h1m10 0h3a2 2 0 002-2V8a2 2 0 00-2-2h-2l-1-3z",
  footprints:    "M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5 10 7.9 8 9 8 11v5",
  bird:          "M16 7h.01M3.4 18H12a8 8 0 008-8V7a4 4 0 00-7.3-2.3L2 20",
  trees:         "M10 10v11m0-11L8 4l-2 6m4 0l2-6m8 4v11m0-11l-2-4-2 4m4 0l2-4",
  binoculars:    "M21 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5h4",
  ship:          "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M19.4 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.9.9 5.3 2.8 7.8",
  flag:          "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  thermometer:   "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  droplet:       "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  snowflake:     "M12 2v20m5.7-16.3L12 12M6.3 6.3L12 12m10 0H2m15.7 5.7L12 12M6.3 17.7L12 12",
  coffee:        "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  route:         "M3 7h2.6c.3 0 .5.1.7.3l2.4 2.4c.2.2.5.3.7.3h3.2c.3 0 .5-.1.7-.3l2.4-2.4c.2-.2.4-.3.7-.3H21",
  zoomIn:        "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3M11 8v6m-3-3h6",
};

const Icon = ({ name, size = 20, className = "", style = {}, sw = 1.7, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    aria-hidden="true">
    <path d={PATHS[name] || PATHS.compass} />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════════════════ */
const ScrollCtx = createContext(0);

const ScrollProvider = ({ children }) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <ScrollCtx.Provider value={p}>{children}</ScrollCtx.Provider>;
};

const ProgressBar = () => {
  const p = useContext(ScrollCtx);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: "rgba(6,78,59,.1)" }}>
      <div style={{ height: "100%", background: "linear-gradient(90deg,#059669,#34d399)", transform: `scaleX(${p})`, transformOrigin: "left", transition: "transform .1s linear" }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════ */
function useSlideshow(length, interval = 5000) {
  const [idx, setIdx] = useState(0);
  const t = useRef(null);
  const start = useCallback(() => {
    clearInterval(t.current);
    if (length <= 1) return;
    t.current = setInterval(() => setIdx(p => (p + 1) % length), interval);
  }, [length, interval]);
  useEffect(() => { start(); return () => clearInterval(t.current); }, [start]);
  return {
    idx,
    goNext: useCallback(() => { setIdx(p => (p + 1) % length); start(); }, [length, start]),
    goPrev: useCallback(() => { setIdx(p => (p - 1 + length) % length); start(); }, [length, start]),
    goTo:   useCallback(i => { setIdx(i); start(); }, [start]),
  };
}

const useInView = (opts = {}) => {
  const { threshold = 0.07, rootMargin = "0px 0px -32px 0px", once = true } = opts;
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); if (once) obs.disconnect(); }
      else if (!once) setVis(false);
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, vis];
};

/* ══════════════════════════════════════════════════════════════
   REVEAL
══════════════════════════════════════════════════════════════ */
const Reveal = ({ children, from = "bottom", delay = 0, distance = 22, className = "" }) => {
  const [ref, vis] = useInView();
  const tx = {
    bottom: `translateY(${distance}px)`,
    top:    `translateY(-${distance}px)`,
    left:   `translateX(-${distance}px)`,
    right:  `translateX(${distance}px)`,
    scale:  "scale(0.94)",
    none:   "none",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity:    vis ? 1 : 0,
      transform:  vis ? "none" : (tx[from] || tx.bottom),
      transition: `opacity .5s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .5s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      willChange: "opacity,transform",
    }}>
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION HEADING
══════════════════════════════════════════════════════════════ */
const SectionHead = ({ title, desc, center = true, tag }) => (
  <div style={{
    textAlign:    center ? "center" : "left",
    marginBottom: 32,
  }}>
    {tag && (
      <span style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            5,
        padding:        "4px 14px",
        borderRadius:   999,
        background:     "#ecfdf5",
        border:         "1px solid #a7f3d0",
        color:          "#065f46",
        fontSize:       11,
        fontWeight:     700,
        letterSpacing:  ".06em",
        textTransform:  "uppercase",
        marginBottom:   10,
      }}>
        {tag}
      </span>
    )}
    <h2 style={{
      fontFamily:    "'Playfair Display', serif",
      fontSize:      "clamp(22px,4vw,32px)",
      fontWeight:    800,
      color:         "#064e3b",
      margin:        "0 0 8px",
      lineHeight:    1.18,
      letterSpacing: "-.02em",
    }}>
      {title}
    </h2>
    {desc && (
      <p style={{
        fontSize:  "clamp(13.5px,1.5vw,15px)",
        color:     "#6b7280",
        lineHeight: 1.65,
        margin:    0,
        maxWidth:  center ? 520 : "none",
        ...(center ? { marginLeft: "auto", marginRight: "auto" } : {}),
      }}>
        {desc}
      </p>
    )}
    <div style={{
      width:      48,
      height:     3,
      borderRadius: 2,
      background: "linear-gradient(90deg,#059669,#34d399)",
      marginTop:  12,
      ...(center ? { marginLeft: "auto", marginRight: "auto" } : {}),
    }} />
  </div>
);

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const ACT_ICONS = {
  "Game drives": "car", "Hot air balloon safari": "sunrise",
  "Bush walks": "footprints", "Cultural village visits": "home",
  "Bird watching": "bird", "Photography safaris": "camera",
  "Night game drives": "moon", "Hiking": "mountain",
  "Snorkeling": "waves", "Swimming": "waves",
  "Boat safari": "ship", "Gorilla trekking": "binoculars",
  "Chimpanzee tracking": "binoculars", "Nile boat safari": "ship",
  "Great Migration viewing": "binoculars", "Nature walks": "trees",
  "Mountain trekking": "mountain", "Camping": "flag",
};

const SECTION_BG = {
  white:  "#fff",
  soft:   "#f9fafb",
  mint:   "#f0fdf4",
};

/* ══════════════════════════════════════════════════════════════
   SKELETON / ERROR
══════════════════════════════════════════════════════════════ */
const Skel = ({ w = "100%", h = 16, r = 8, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: "linear-gradient(110deg,#e2e8f0 8%,#f1f5f9 18%,#e2e8f0 33%)",
    backgroundSize: "200% 100%",
    animation: "ddShim 1.3s ease infinite",
  }} />
);

const SkeletonPage = () => (
  <div style={{ padding: "clamp(40px,6vw,80px) clamp(16px,4vw,40px)", maxWidth: 1180, margin: "0 auto" }}>
    <style>{`@keyframes ddShim{from{background-position:-200% 0}to{background-position:200% 0}}`}</style>
    <Skel h={52} w="60%" r={10} mb={16} />
    <Skel h={22} w="40%" r={8} mb={32} />
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      {[100, 80, 90, 70, 95, 60].map((w, i) => <Skel key={i} h={14} w={`${w}%`} mb={10} />)}
    </div>
  </div>
);

const ErrorPage = ({ error, navigate }) => (
  <div style={{
    minHeight: "60vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    padding: "40px 20px",
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: "#ecfdf5", border: "2px solid #a7f3d0",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#059669", marginBottom: 20,
    }}>
      <Icon name="map" size={32} />
    </div>
    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: "#064e3b", marginBottom: 10 }}>
      Destination Not Found
    </h2>
    <p style={{ color: "#6b7280", marginBottom: 28, maxWidth: 380 }}>
      {error || "This destination doesn't exist or may have been removed."}
    </p>
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={() => navigate(-1)} style={GHOST_BTN_STYLE}>← Go Back</button>
      <button onClick={() => navigate("/destinations")} style={PRIMARY_BTN_STYLE}>Browse All</button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SHARED BUTTON STYLES
══════════════════════════════════════════════════════════════ */
const PRIMARY_BTN_STYLE = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "11px 22px", borderRadius: 11,
  background: "linear-gradient(135deg,#059669,#047857)",
  color: "#fff", border: "none", fontWeight: 700,
  fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
  boxShadow: "0 4px 14px rgba(5,150,105,.28)",
  fontFamily: "inherit",
};
const GHOST_BTN_STYLE = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "11px 22px", borderRadius: 11,
  background: "transparent",
  color: "#059669", border: "1.5px solid #a7f3d0",
  fontWeight: 700, fontSize: 14, cursor: "pointer",
  whiteSpace: "nowrap", fontFamily: "inherit",
};

/* ══════════════════════════════════════════════════════════════
   IMAGE MODAL
══════════════════════════════════════════════════════════════ */
const ImageModal = ({ images, idx, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = e => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,.92)", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "92vw", maxHeight: "88vh" }}>
        <img src={images[idx]} alt="" style={{ maxWidth: "92vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 12 }} />
        <button onClick={onClose} style={{
          position: "absolute", top: -16, right: -16, width: 38, height: 38, borderRadius: "50%",
          background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,.3)", color: "#064e3b",
        }}>
          <Icon name="x" size={15} />
        </button>
        {images.length > 1 && (
          <>
            <button onClick={onPrev} style={{ position: "absolute", left: -52, top: "50%", transform: "translateY(-50%)", ...MODAL_NAV }}>
              <Icon name="chevronLeft" size={18} />
            </button>
            <button onClick={onNext} style={{ position: "absolute", right: -52, top: "50%", transform: "translateY(-50%)", ...MODAL_NAV }}>
              <Icon name="chevronRight" size={18} />
            </button>
            <div style={{
              position: "absolute", bottom: -34, left: "50%", transform: "translateX(-50%)",
              color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 600,
            }}>
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
const MODAL_NAV = {
  width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.12)",
  border: "1px solid rgba(255,255,255,.2)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
};

/* ══════════════════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════════════════ */
const Hero = ({ d, navigate }) => {
  const allImgs = useMemo(() =>
    [d.heroImage, d.imageUrl, ...(d.images || []), ...(d.gallery || []).map(g => g.imageUrl)].filter(Boolean)
  , [d]);
  const slides = useMemo(() => [...new Set(allImgs)].slice(0, 7), [allImgs]);
  const { idx, goTo } = useSlideshow(slides.length, 6000);

  const stats = [
    d.durationDays && { val: d.durationDays, label: "Days" },
    (d.activities || []).length > 0 && { val: `${(d.activities || []).length}+`, label: "Activities" },
    d.rating && { val: d.rating.toFixed(1), label: "Rating ⭐" },
  ].filter(Boolean);

  return (
    <header style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
      <style>{`
        @keyframes ddShim{from{background-position:-200% 0}to{background-position:200% 0}}
        @keyframes ddSlideFadeIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @keyframes ddDot{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
      `}</style>

      {/* Slides */}
      {slides.map((src, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          opacity: idx === i ? 1 : 0,
          transition: "opacity .8s ease",
          willChange: "opacity",
        }}>
          <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} style={{
            width: "100%", height: "100%", objectFit: "cover",
            animation: idx === i ? "ddSlideFadeIn 8s ease forwards" : "none",
          }} />
        </div>
      ))}

      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(2,44,34,.95) 0%, rgba(2,44,34,.6) 40%, rgba(0,0,0,.2) 100%)",
      }} />

      {/* Breadcrumb */}
      <nav style={{ position: "absolute", top: 20, left: 0, right: 0, padding: "0 clamp(16px,4vw,48px)", zIndex: 4 }}>
        <ol style={{ display: "flex", flexWrap: "wrap", gap: "0 6px", listStyle: "none", margin: 0, padding: 0 }}>
          {[
            { label: "🏠 Explore", path: "/explore" },
            { label: "Destinations", path: "/destinations" },
            d.country?.name && { label: `${d.country.flag || ""}${d.country.name}`, path: `/country/${d.countrySlug || d.country?.slug}` },
          ].filter(Boolean).map((bc, i) => (
            <React.Fragment key={i}>
              {i > 0 && <li style={{ color: "rgba(255,255,255,.4)", alignSelf: "center" }}>›</li>}
              <li>
                <Link to={bc.path} style={{ color: "rgba(255,255,255,.75)", fontSize: 12.5, fontWeight: 500, textDecoration: "none" }}>
                  {bc.label}
                </Link>
              </li>
            </React.Fragment>
          ))}
          <li style={{ color: "rgba(255,255,255,.4)", alignSelf: "center" }}>›</li>
          <li style={{ color: "rgba(255,255,255,.9)", fontSize: 12.5, fontWeight: 600 }}>{d.name}</li>
        </ol>
      </nav>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 3,
        padding: "0 clamp(16px,4vw,48px) clamp(40px,6vw,72px)",
        maxWidth: 820, width: "100%",
      }}>
        {d.country?.name && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "#a7f3d0", fontSize: 11.5, fontWeight: 700,
            letterSpacing: ".08em", textTransform: "uppercase",
            marginBottom: 14,
          }}>
            {d.country.flag && <span>{d.country.flag}</span>}
            <span>📍 {d.country.name}</span>
          </div>
        )}

        <h1 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(32px,6.5vw,64px)",
          fontWeight: 900, color: "#fff", margin: "0 0 14px",
          lineHeight: 1.08, letterSpacing: "-.025em",
        }}>
          {d.name}
        </h1>

        {d.tagline && (
          <p style={{ fontSize: "clamp(14px,2vw,18px)", color: "rgba(255,255,255,.82)", marginBottom: 24, lineHeight: 1.6 }}>
            {d.tagline}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: stats.length > 0 ? 32 : 0 }}>
          <button style={PRIMARY_BTN_STYLE} onClick={() => navigate(`/booking?destination=${d.slug}`)}>
            📅 Book This Destination
          </button>
          <button style={GHOST_BTN_STYLE} onClick={() => document.getElementById("dd-about")?.scrollIntoView({ behavior: "smooth" })}>
            Explore ↓
          </button>
        </div>

        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 900, color: "#34d399", fontFamily: "'Playfair Display',serif" }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div style={{
          position: "absolute", bottom: 24, right: "clamp(16px,4vw,48px)",
          display: "flex", gap: 6, zIndex: 4,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
              style={{
                width: idx === i ? 24 : 6, height: 6, borderRadius: 3,
                background: idx === i ? "#34d399" : "rgba(255,255,255,.35)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all .3s ease",
              }} />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        color: "rgba(255,255,255,.5)", fontSize: 9.5, fontWeight: 700,
        letterSpacing: ".1em", textTransform: "uppercase", zIndex: 4,
        animation: "ddDot 2.2s ease infinite",
      }}>
        <span>SCROLL</span>
        <Icon name="chevronDown" size={16} style={{ color: "rgba(255,255,255,.5)" }} />
      </div>
    </header>
  );
};

/* ══════════════════════════════════════════════════════════════
   ABOUT SECTION
══════════════════════════════════════════════════════════════ */
const AboutSection = ({ d }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  const asideImgs = useMemo(() => {
    const all = [d.heroImage, d.imageUrl, ...(d.gallery || []).map(g => g.imageUrl), ...(d.images || [])].filter(Boolean);
    return [...new Set(all)].slice(0, 8);
  }, [d]);
  const { idx, goNext, goPrev, goTo } = useSlideshow(asideImgs.length, 4500);

  const details = [
    d.country?.name      && { icon: "mapPin",   emoji: "📍", label: "Location",    val: `${d.country?.flag || ""}${d.country.name}`, link: `/country/${d.countrySlug || d.country?.slug}` },
    d.duration           && { icon: "clock",    emoji: "⏱",  label: "Duration",    val: d.duration },
    d.difficulty         && { icon: "barChart", emoji: "📊", label: "Difficulty",  val: d.difficulty },
    d.bestTimeToVisit    && { icon: "calendar", emoji: "🗓",  label: "Best Season", val: d.bestTimeToVisit },
    d.rating             && { icon: "star",     emoji: "⭐",  label: "Rating",      val: `${d.rating.toFixed(1)} / 5` },
    (d.minGroupSize && d.maxGroupSize) && { icon: "users", emoji: "👥", label: "Group Size", val: `${d.minGroupSize}–${d.maxGroupSize}` },
  ].filter(Boolean);

  return (
    <section id="dd-about" style={{ background: SECTION_BG.mint, padding: "clamp(40px,5.5vw,72px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)",
          gap: "clamp(28px,4vw,56px)",
          alignItems: "start",
        }}
          className="dd-about-responsive-grid"
        >
          <style>{`
            @media(max-width:900px){.dd-about-responsive-grid{grid-template-columns:1fr!important}}
            @media(max-width:600px){.dd-detail-grid-2{grid-template-columns:1fr!important}}
          `}</style>

          {/* ── LEFT ── */}
          <div>
            <Reveal from="left">
              <div>
                {d.destinationType && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 999,
                    background: "#ecfdf5", border: "1px solid #a7f3d0",
                    color: "#065f46", fontSize: 11, fontWeight: 700,
                    letterSpacing: ".05em", textTransform: "uppercase",
                    marginBottom: 12,
                  }}>
                    🧭 {d.destinationType}
                  </span>
                )}
                <h2 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800,
                  color: "#064e3b", margin: "0 0 16px", lineHeight: 1.2,
                }}>
                  Discover {d.name}
                </h2>
              </div>
            </Reveal>

            {desc && (
              <Reveal from="left" delay={70}>
                <div style={{ color: "#374151", lineHeight: 1.75, fontSize: "clamp(13.5px,1.4vw,15px)", marginBottom: 20 }}>
                  {desc.split("\n\n").filter(Boolean).map((p, i) => <p key={i} style={{ margin: "0 0 12px" }}>{p}</p>)}
                </div>
              </Reveal>
            )}

            {details.length > 0 && (
              <Reveal from="bottom" delay={130}>
                <div className="dd-detail-grid-2" style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 10, marginBottom: 22,
                }}>
                  {details.map((s, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 11,
                      background: "#fff", border: "1px solid #d1fae5",
                      boxShadow: "0 2px 8px rgba(6,78,59,.05)",
                    }}>
                      <span style={{ fontSize: 18 }}>{s.emoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, color: "#6b7280", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>{s.label}</div>
                        <div style={{ fontSize: 13.5, color: "#064e3b", fontWeight: 700, marginTop: 1 }}>
                          {s.link ? <Link to={s.link} style={{ color: "#059669", textDecoration: "none" }}>{s.val}</Link> : s.val}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal from="bottom" delay={200}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={PRIMARY_BTN_STYLE} onClick={() => window.location.assign(`/booking?destination=${d.slug}`)}>
                  📅 Reserve Your Spot
                </button>
                <button style={GHOST_BTN_STYLE} onClick={() => window.location.assign("/contact")}>
                  ✉️ Enquire
                </button>
              </div>
            </Reveal>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Reveal from="right" delay={80}>
              {asideImgs.length > 0 && (
                <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "4/3" }}>
                  {asideImgs.map((src, i) => (
                    <img key={i} src={src} alt={`${d.name} ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", opacity: i === idx ? 1 : 0,
                        transition: "opacity .7s ease",
                      }} />
                  ))}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,44,34,.7) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>{d.name}</div>
                    {d.country?.name && (
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        📍 {d.country.name}
                      </div>
                    )}
                  </div>
                  {asideImgs.length > 1 && (
                    <>
                      <button onClick={goPrev} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", ...MODAL_NAV, width: 34, height: 34 }}><Icon name="chevronLeft" size={14} /></button>
                      <button onClick={goNext} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", ...MODAL_NAV, width: 34, height: 34 }}><Icon name="chevronRight" size={14} /></button>
                      <div style={{ position: "absolute", bottom: 54, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                        {asideImgs.map((_, i) => (
                          <button key={i} onClick={() => goTo(i)} aria-label={`Image ${i + 1}`}
                            style={{ width: i === idx ? 18 : 5, height: 5, borderRadius: 3, background: i === idx ? "#34d399" : "rgba(255,255,255,.4)", border: "none", padding: 0, cursor: "pointer", transition: "all .3s ease" }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal from="right" delay={170}>
              <div style={{
                background: "#fff", borderRadius: 16, overflow: "hidden",
                border: "1px solid #d1fae5", boxShadow: "0 4px 20px rgba(6,78,59,.08)",
              }}>
                <div style={{
                  background: "linear-gradient(135deg,#064e3b,#065f46)",
                  padding: "18px 20px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "rgba(255,255,255,.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#34d399", fontSize: 22,
                  }}>
                    📅
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>Book {d.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 2 }}>Secure your spot today</div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <button style={{ ...PRIMARY_BTN_STYLE, justifyContent: "center", width: "100%" }}
                    onClick={() => window.location.assign(`/booking?destination=${d.slug}`)}>
                    📅 Book Now
                  </button>
                  <button style={{ ...GHOST_BTN_STYLE, justifyContent: "center", width: "100%" }}
                    onClick={() => window.location.assign("/contact")}>
                    ✉️ Send Enquiry
                  </button>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    paddingTop: 12, borderTop: "1px solid #f0fdf4",
                  }}>
                    {[["🏆", "Expert Guides"], ["🛡️", "Safe Travel"], ["📞", "24/7 Support"]].map(([emoji, label], i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 16 }}>{emoji}</span>
                        <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   MEDIA SHOWCASE
══════════════════════════════════════════════════════════════ */
const extractYouTubeId = url => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return m ? m[1] : null;
};

const MediaShowcase = ({ d }) => {
  const [modal, setModal] = useState({ open: false, idx: 0 });

  const videos = useMemo(() => {
    const v = [];
    if (d.virtualTourUrl) v.push({ url: d.virtualTourUrl, title: `${d.name} Virtual Tour` });
    if (d.videoUrl) v.push({ url: d.videoUrl, title: `${d.name} Video` });
    if (Array.isArray(d.videos)) v.push(...d.videos.filter(x => x?.url));
    return v;
  }, [d]);

  const galleryImgs = useMemo(() => {
    const all = [...(d.gallery || []).map(g => g.imageUrl), ...(d.images || []), d.heroImage, d.imageUrl].filter(Boolean);
    return [...new Set(all)].slice(0, 6);
  }, [d]);

  if (!videos.length && !galleryImgs.length) return null;

  return (
    <section style={{ background: SECTION_BG.white, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title={`📸 Experience ${d.name}`} desc="Cinematic footage and photography to bring this destination to life" tag="Gallery" />
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 16,
        }}>
          {videos.slice(0, 2).map((vid, i) => {
            const ytId = extractYouTubeId(vid.url);
            if (!ytId) return null;
            return (
              <Reveal key={`v-${i}`} from="bottom" delay={i * 80}>
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
                  <iframe
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&modestbranding=1`}
                    title={vid.title} allow="autoplay; encrypted-media"
                    loading="lazy" allowFullScreen />
                  <div style={{ position: "absolute", top: 10, left: 10, padding: "4px 10px", borderRadius: 999, background: "rgba(0,0,0,.6)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                    🎬 {i === 0 ? "Cinematic" : "Video"}
                  </div>
                </div>
              </Reveal>
            );
          })}

          {galleryImgs.map((src, i) => (
            <Reveal key={`g-${i}`} from="bottom" delay={(videos.length + i) * 60}>
              <div
                onClick={() => setModal({ open: true, idx: i })}
                role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setModal({ open: true, idx: i })}
                style={{
                  position: "relative", borderRadius: 16, overflow: "hidden",
                  aspectRatio: "4/3", cursor: "zoom-in", background: "#f1f5f9",
                }}>
                <img src={src} alt={`${d.name} ${i + 1}`} loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(2,44,34,.5) 0%, transparent 60%)",
                  opacity: 0, transition: "opacity .3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity .3s", color: "#059669",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}>
                  🔍
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {modal.open && (
        <ImageModal images={galleryImgs} idx={modal.idx}
          onClose={() => setModal({ open: false, idx: 0 })}
          onPrev={() => setModal(p => ({ ...p, idx: (p.idx - 1 + galleryImgs.length) % galleryImgs.length }))}
          onNext={() => setModal(p => ({ ...p, idx: (p.idx + 1) % galleryImgs.length }))} />
      )}
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   HIGHLIGHTS
══════════════════════════════════════════════════════════════ */
const HighlightsSection = ({ d }) => {
  const list       = d.highlights  || [];
  const activities = d.activities  || [];
  if (!list.length && !activities.length) return null;

  const imgPool = useMemo(() => {
    const all = [...(d.gallery || []).map(g => g.imageUrl), ...(d.images || []), d.heroImage, d.imageUrl].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  const items = [
    ...list.map((h, i) => ({ text: h, img: imgPool[i % Math.max(imgPool.length, 1)], emoji: "✨", desc: `Experience the wonder of ${h}.` })),
    ...activities.map((a, i) => ({ text: a, img: imgPool[(list.length + i) % Math.max(imgPool.length, 1)], emoji: "🧭", desc: `Expert-guided ${a} experiences.` })),
  ].slice(0, 9);

  return (
    <section style={{ background: SECTION_BG.soft, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title={`✨ What Makes ${d.name} Unforgettable`} desc="Hover any card to learn more" tag="Experiences" />
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
          gap: 16,
        }}>
          {items.map((item, i) => (
            <Reveal key={i} from="scale" delay={i * 40}>
              <div
                style={{
                  position: "relative", borderRadius: 16, overflow: "hidden",
                  aspectRatio: "3/4", background: "#064e3b", cursor: "default",
                }}
                className="dd-exp-card-hover"
              >
                <style>{`
                  .dd-exp-card-hover:hover .dd-exp-overlay{opacity:1!important}
                  .dd-exp-card-hover:hover .dd-exp-info{transform:translateY(0)!important;opacity:1!important}
                  .dd-exp-card-hover:hover .dd-exp-bottom{opacity:0!important}
                  .dd-exp-card-hover img{transition:transform .5s ease!important}
                  .dd-exp-card-hover:hover img{transform:scale(1.08)!important}
                `}</style>

                {item.img
                  ? <img src={item.img} alt={item.text} loading="lazy"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 48,
                    }}>
                      {item.emoji}
                    </div>
                }

                {/* Bottom label (default) */}
                <div className="dd-exp-bottom" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "32px 14px 14px",
                  background: "linear-gradient(to top, rgba(2,44,34,.9) 0%, transparent 100%)",
                  transition: "opacity .3s",
                }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{item.text}</div>
                </div>

                {/* Hover overlay */}
                <div className="dd-exp-overlay" style={{
                  position: "absolute", inset: 0,
                  background: "rgba(6,78,59,.88)",
                  opacity: 0, transition: "opacity .3s",
                }} />
                <div className="dd-exp-info" style={{
                  position: "absolute", inset: 0, display: "flex",
                  flexDirection: "column", justifyContent: "center",
                  padding: 20, opacity: 0,
                  transform: "translateY(10px)",
                  transition: "opacity .3s, transform .3s",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.emoji}</div>
                  <div style={{ color: "#34d399", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>
                    {list.includes(item.text) ? "Highlight" : "Activity"}
                  </div>
                  <h4 style={{ color: "#fff", fontSize: 17, fontWeight: 800, fontFamily: "'Playfair Display',serif", margin: "0 0 8px" }}>{item.text}</h4>
                  <p style={{ color: "rgba(255,255,255,.75)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   DEEP DIVE
══════════════════════════════════════════════════════════════ */
const Block = ({ icon, title, children, from = "left", delay = 0, full = false }) => (
  <Reveal from={from} delay={delay}>
    <div style={{
      background: "#fff", borderRadius: 16, padding: "22px 22px 20px",
      border: "1px solid #e5e7eb", height: "100%",
      gridColumn: full ? "1/-1" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#ecfdf5", border: "1px solid #a7f3d0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#064e3b", margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  </Reveal>
);

const DetailList = ({ items, check = "✅", cols = false }) => (
  <ul style={{ listStyle: "none", margin: 0, padding: 0, ...(cols ? { columns: 2, gap: 8 } : {}) }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, breakInside: "avoid" }}>
        <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{check}</span>
        <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{item}</span>
      </li>
    ))}
  </ul>
);

const HighlightBox = ({ children }) => (
  <div style={{
    display: "flex", gap: 8, alignItems: "flex-start",
    padding: "10px 14px", borderRadius: 10,
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    fontSize: 13, color: "#065f46", marginTop: 10, lineHeight: 1.55,
  }}>
    {children}
  </div>
);

const SubLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", margin: "12px 0 6px" }}>{children}</p>
);

const PillList = ({ items, danger = false }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {items.map((m, i) => (
      <span key={i} style={{
        padding: "3px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600,
        background: danger ? "#fef2f2" : "#ecfdf5",
        color: danger ? "#dc2626" : "#065f46",
        border: `1px solid ${danger ? "#fecaca" : "#a7f3d0"}`,
      }}>
        {m}
      </span>
    ))}
  </div>
);

const ProseText = ({ text }) => (
  <div>
    {text.split("\n\n").filter(Boolean).map((p, i) => (
      <p key={i} style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.72, margin: "0 0 10px" }}>{p}</p>
    ))}
  </div>
);

const Alert = ({ warn, children }) => (
  <div style={{
    display: "flex", gap: 8, alignItems: "flex-start",
    padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.5,
    background: warn ? "#fffbeb" : "#eff6ff",
    border: `1px solid ${warn ? "#fde68a" : "#bfdbfe"}`,
    color: warn ? "#92400e" : "#1e40af",
    marginTop: 10,
  }}>
    {children}
  </div>
);

const DeepDiveSection = ({ d }) => {
  const hasAny = d.overview || d.description || d.whatToExpect || d.gettingThere
    || d.bestTimeToVisit || d.highlights?.length || d.activities?.length || d.practicalInfo;
  if (!hasAny) return null;

  const pi      = d.practicalInfo;
  const climate = pi?.climate;
  const packing = pi?.packing;
  const health  = pi?.healthAndSafety;
  const permits = pi?.permitsAndRegulations;

  return (
    <section style={{ background: SECTION_BG.white, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title={`📖 Complete Guide to ${d.name}`} desc="Everything you need to plan and enjoy your visit" tag="Deep Dive" />
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: 16,
        }}>
          {(d.overview || d.description) && (
            <Block icon="🌍" title="Overview" from="left" full>
              <ProseText text={d.overview || d.description} />
            </Block>
          )}

          {d.whatToExpect && (
            <Block icon="👁️" title="What to Expect" from="left" delay={50}>
              <ProseText text={d.whatToExpect} />
            </Block>
          )}

          {(d.bestTimeToVisit || climate) && (
            <Block icon="🌡️" title="Climate & Best Time" from="right" delay={50}>
              {d.bestTimeToVisit && <HighlightBox>🗓 <span><strong>Best Season:</strong> {d.bestTimeToVisit}</span></HighlightBox>}
              {climate?.climateNotes && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.7, margin: "10px 0 6px" }}>{climate.climateNotes}</p>}
              {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {climate.avgTempLowC  != null && <span style={{ padding: "4px 12px", borderRadius: 999, background: "#eff6ff", color: "#1e40af", fontSize: 12, fontWeight: 700 }}>❄️ Low: {climate.avgTempLowC}°C</span>}
                  {climate.avgTempHighC != null && <span style={{ padding: "4px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>🌡️ High: {climate.avgTempHighC}°C</span>}
                </div>
              )}
              {climate?.bestMonths?.length > 0 && <><SubLabel>✅ Best months</SubLabel><PillList items={climate.bestMonths} /></>}
              {climate?.avoidMonths?.length  > 0 && <><SubLabel>⚠️ Avoid</SubLabel><PillList items={climate.avoidMonths} danger /></>}
            </Block>
          )}

          {d.highlights?.length > 0 && (
            <Block icon="✨" title="Key Highlights" from="left" delay={80}>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {d.highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9 }}>
                    <span style={{ minWidth: 24, height: 24, borderRadius: 6, background: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#059669", flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{h}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {d.activities?.length > 0 && (
            <Block icon="🧭" title="Activities" from="right" delay={80}>
              <DetailList items={d.activities} check="🎯" />
            </Block>
          )}

          {(d.gettingThere || d.howToGetThere?.generalInfo) && (
            <Block icon="🗺️" title="Getting There" from="left" delay={100}>
              <ProseText text={d.gettingThere || d.howToGetThere?.generalInfo} />
              {d.howToGetThere?.nearestAirport     && <HighlightBox>✈️ <span><strong>Nearest Airport:</strong> {d.howToGetThere.nearestAirport}</span></HighlightBox>}
              {d.howToGetThere?.driveTimeFromCapital && <HighlightBox>🚗 <span><strong>Drive time:</strong> {d.howToGetThere.driveTimeFromCapital}</span></HighlightBox>}
              {d.howToGetThere?.transportOptions?.length > 0 && <><SubLabel>Transport Options</SubLabel><DetailList items={d.howToGetThere.transportOptions} check="🛤️" /></>}
            </Block>
          )}

          {(health?.vaccinationsRequired?.length || health?.malariaRisk || health?.safetyNotes) && (
            <Block icon="🛡️" title="Health & Safety" from="right" delay={100}>
              {health.malariaRisk   && <Alert warn><span>⚠️</span><span>Malaria risk: <strong>{health.malariaRisk}</strong></span></Alert>}
              {health.safetyNotes   && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.7, margin: "10px 0 6px" }}>{health.safetyNotes}</p>}
              {health.vaccinationsRequired?.length > 0 && <><SubLabel>💉 Required vaccinations</SubLabel><DetailList items={health.vaccinationsRequired} check="✅" /></>}
              {health.vaccinationsRecommended?.length > 0 && <><SubLabel>Recommended</SubLabel><DetailList items={health.vaccinationsRecommended} /></>}
              {health.waterSafety   && <HighlightBox>💧 <span>{health.waterSafety}</span></HighlightBox>}
            </Block>
          )}

          {(packing?.essentials?.length || packing?.clothingTips) && (
            <Block icon="🎒" title="What to Pack" from="left" delay={120}>
              {packing.clothingTips && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.7, margin: "0 0 10px" }}>{packing.clothingTips}</p>}
              {packing.essentials?.length > 0 && <><SubLabel>Essentials</SubLabel><DetailList items={packing.essentials} cols check="✅" /></>}
              {packing.gearRecommendations?.length > 0 && <><SubLabel>Gear</SubLabel><DetailList items={packing.gearRecommendations} /></>}
            </Block>
          )}

          {permits?.permitsRequired?.length > 0 && (
            <Block icon="🎫" title="Permits & Regulations" from="right" delay={120}>
              {permits.bookingLeadTime && <HighlightBox>🗓 <span><strong>Book ahead:</strong> {permits.bookingLeadTime}</span></HighlightBox>}
              <DetailList items={permits.permitsRequired} check="✅" />
              {permits.permitCost    && <HighlightBox>💳 <span>Cost: <strong>{permits.permitCost}</strong></span></HighlightBox>}
              {permits.visitorLimits && <Alert><span>ℹ️</span><span>Visitor limit: {permits.visitorLimits}</span></Alert>}
            </Block>
          )}

          {(pi?.budget?.rangeUsd || pi?.budget?.entranceFeeUsd) && (
            <Block icon="💰" title="Budget Guide (USD)" from="left" delay={140}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Budget Range", pi.budget.rangeUsd],
                  ["Entrance Fee", pi.budget.entranceFeeUsd],
                  ["Guide Cost", pi.budget.guideCostUsd],
                  ["Meals", pi.budget.mealCostRange],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} style={{ padding: "10px 12px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#064e3b", marginTop: 3 }}>{val}</div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {(pi?.culture?.localEtiquette?.length || pi?.culture?.tippingCulture) && (
            <Block icon="☕" title="Culture & Etiquette" from="right" delay={140}>
              {pi.culture.tippingCulture   && <p style={{ fontSize: 13.5, color: "#374151", margin: "0 0 8px" }}><strong>💵 Tipping:</strong> {pi.culture.tippingCulture}</p>}
              {pi.culture.photographyRules && <HighlightBox>📷 <span>{pi.culture.photographyRules}</span></HighlightBox>}
              {pi.culture.localEtiquette?.length > 0 && <><SubLabel>Local Etiquette</SubLabel><DetailList items={pi.culture.localEtiquette} check="🤝" /></>}
            </Block>
          )}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   TIPS & SAFETY
══════════════════════════════════════════════════════════════ */
const TipsSafetySection = ({ d }) => {
  const localTips  = d.localTips;
  const safetyInfo = d.safetyInfo;
  if (!localTips && !safetyInfo) return null;

  const parseTips = raw => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return [];
      if (t.startsWith("[")) { try { return JSON.parse(t).map(x => String(x).trim()).filter(Boolean); } catch {} }
      return [t];
    }
    return [];
  };

  const tipsArr     = parseTips(localTips);
  const safetyPts   = safetyInfo
    ? (typeof safetyInfo === "string" ? safetyInfo.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8) : [String(safetyInfo)])
    : [];

  if (!tipsArr.length && !safetyPts.length) return null;

  return (
    <section style={{ background: SECTION_BG.mint, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title="💡 Tips & Safety" desc="Expert advice to make your visit safe and unforgettable" tag="Insider Guide" />
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: tipsArr.length && safetyPts.length ? "1fr 1fr" : "1fr",
          gap: 20,
        }}
          className="dd-tips-responsive"
        >
          <style>{`@media(max-width:680px){.dd-tips-responsive{grid-template-columns:1fr!important}}`}</style>

          {tipsArr.length > 0 && (
            <Reveal from="left">
              <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #d1fae5", height: "100%" }}>
                <div style={{ background: "linear-gradient(135deg,#064e3b,#065f46)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💡</div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>Local Tips</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 2 }}>Insider advice from expert guides</div>
                  </div>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {tipsArr.map((tip, i) => (
                      <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ minWidth: 26, height: 26, borderRadius: 8, background: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#059669", flexShrink: 0 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          )}

          {safetyPts.length > 0 && (
            <Reveal from="right" delay={80}>
              <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #fde68a", height: "100%" }}>
                <div style={{ background: "linear-gradient(135deg,#78350f,#92400e)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛡️</div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 800, color: "#fff" }}>Safety Information</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 2 }}>Stay safe and prepared</div>
                  </div>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 9, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 14, fontSize: 12.5, color: "#92400e", fontWeight: 600 }}>
                    ⚠️ Please read before your trip
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {safetyPts.map((pt, i) => (
                      <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5, color: "#374151", lineHeight: 1.6 }}>
                        <span style={{ flexShrink: 0, marginTop: 1 }}>✅</span>
                        <span>{pt.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 14, padding: "8px 12px", borderRadius: 9, background: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: 12.5, color: "#065f46", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>
                    📞 24/7 Emergency Support Available
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════ */
const FaqSection = ({ d }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [faqs, setFaqs]       = useState(d.faqs || []);
  useEffect(() => { if (d.faqs?.length) setFaqs(d.faqs); }, [d.faqs]);

  const fallback = useMemo(() => [
    { id: "f1", question: `What is the best time to visit ${d.name}?`, answer: d.bestTimeToVisit || "Contact us for seasonal recommendations." },
    { id: "f2", question: `How difficult is ${d.name}?`,               answer: d.difficulty ? `Rated as ${d.difficulty}.` : "Difficulty varies. Contact us for details." },
    { id: "f3", question: "What permits are required?",                  answer: (d.practicalInfo?.permitsAndRegulations?.permitsRequired || []).join(", ") || "Our team handles all necessary permits." },
    { id: "f4", question: "Is it safe to visit?",                        answer: d.safetyInfo || "Safety is our top priority — our guides are trained to the highest standards." },
    { id: "f5", question: "What should I pack?",                         answer: (d.practicalInfo?.packing?.essentials || []).join(", ") || "Warm layers, waterproof gear, sturdy boots, and sun protection." },
  ], [d]);

  const displayFaqs = faqs.length > 0 ? faqs : fallback;

  return (
    <section style={{ background: SECTION_BG.white, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title="❓ Frequently Asked Questions" desc={`Everything you need to know about ${d.name}`} tag="FAQ" />
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayFaqs.map((faq, i) => {
            const open = openIdx === i;
            return (
              <Reveal key={faq.id || i} from="bottom" delay={i * 40}>
                <div style={{
                  borderRadius: 14, overflow: "hidden",
                  border: `1.5px solid ${open ? "#a7f3d0" : "#e5e7eb"}`,
                  background: open ? "#f0fdf4" : "#fff",
                  transition: "border-color .25s, background .25s",
                  boxShadow: open ? "0 4px 16px rgba(6,78,59,.08)" : "0 1px 4px rgba(0,0,0,.04)",
                }}>
                  <button
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-expanded={open}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 18px", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{
                      minWidth: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: open ? "#059669" : "#f1f5f9",
                      border: `1px solid ${open ? "#059669" : "#e5e7eb"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                      color: open ? "#fff" : "#6b7280",
                      transition: "all .25s",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1, fontSize: "clamp(13.5px,1.4vw,15px)", fontWeight: 650, color: open ? "#064e3b" : "#1f2937", lineHeight: 1.4 }}>
                      {faq.question}
                    </span>
                    <span style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: open ? "#059669" : "#f1f5f9",
                      color: open ? "#fff" : "#6b7280",
                      transition: "all .25s",
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  <div style={{
                    maxHeight: open ? 400 : 0, overflow: "hidden",
                    transition: "max-height .35s cubic-bezier(.22,1,.36,1)",
                  }}>
                    <div style={{ padding: "0 18px 16px 60px", fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                      {typeof faq.answer === "string" ? faq.answer.replace(/\*\*/g, "") : faq.answer}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   MORE IN COUNTRY
══════════════════════════════════════════════════════════════ */
const MoreInCountrySection = ({ d }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const trackRef = useRef(null);

  const countryId   = d.country?.id || d.country?._id || d.countryId;
  const countrySlug = d.countrySlug  || d.country?.slug;
  const countryName = d.country?.name || "This Country";

  useEffect(() => {
    if (!countryId && !countrySlug) { setLoading(false); return; }
    (async () => {
      try {
        const param = countryId ? `countryId=${countryId}` : `countrySlug=${countrySlug}`;
        const res   = await api.get(`/destinations?${param}&limit=12&sort=rating`);
        const data  = res.data?.destinations || res.data?.data || res.data || [];
        setDestinations(data.filter(dest => dest.slug !== d.slug && dest.id !== d.id).slice(0, 10));
      } catch { setDestinations([]); }
      finally { setLoading(false); }
    })();
  }, [countryId, countrySlug, d.slug, d.id]);

  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const onMouseDown = useCallback(e => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
  }, []);
  const onMouseMove = useCallback(e => {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft = drag.current.scrollLeft - (e.pageX - el.offsetLeft - drag.current.startX);
  }, []);
  const onMouseUp = useCallback(() => {
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  }, []);
  const scrollBy = useCallback(dir => trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" }), []);

  if (loading) return (
    <section style={{ background: SECTION_BG.soft, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <SectionHead title={`More in ${countryName}`} center={false} />
        <div style={{ display: "flex", gap: 18, overflow: "hidden" }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ minWidth: 260, borderRadius: 16, background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden", flexShrink: 0 }}>
              <Skel h={160} r={0} />
              <div style={{ padding: "14px 14px 16px" }}>
                <Skel h={16} w="70%" mb={8} />
                <Skel h={12} w="45%" mb={6} />
                <Skel h={12} w="55%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!destinations.length) return null;

  return (
    <section style={{ background: SECTION_BG.soft, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <style>{`
        .dd-more-track::-webkit-scrollbar{height:4px}.dd-more-track::-webkit-scrollbar-track{background:#f1f5f9;border-radius:2px}.dd-more-track::-webkit-scrollbar-thumb{background:#a7f3d0;border-radius:2px}
        .dd-rel-card:hover .dd-rel-card-img{transform:scale(1.07)!important}
        .dd-rel-card:hover{box-shadow:0 12px 32px rgba(6,78,59,.14)!important;transform:translateY(-4px)!important;border-color:#a7f3d0!important}
      `}</style>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <Reveal from="left">
            <SectionHead
              title={`🗺️ More in ${countryName}`}
              desc={`${destinations.length} more incredible places await`}
              center={false}
            />
          </Reveal>
          <Reveal from="right">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "#6b7280", fontWeight: 600, marginRight: 4 }}>
                {destinations.length} destinations
              </span>
              {["left", "right"].map(dir => (
                <button key={dir} onClick={() => scrollBy(dir === "left" ? -1 : 1)}
                  aria-label={`Scroll ${dir}`}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#fff", border: "1.5px solid #d1fae5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#059669", transition: "all .2s",
                  }}>
                  {dir === "left" ? "←" : "→"}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div
          className="dd-more-track"
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display: "flex", gap: 18, overflowX: "auto", overflowY: "visible",
            scrollbarWidth: "thin", scrollbarColor: "#a7f3d0 #f1f5f9",
            cursor: "grab", paddingBottom: 8, userSelect: "none",
          }}
        >
          {destinations.map((dest, i) => {
            const img      = dest.heroImage || dest.imageUrl || (dest.images || [])[0];
            const slug     = dest.slug || dest.id;
            const duration = dest.duration || (dest.durationDays ? `${dest.durationDays} days` : null);

            return (
              <Link key={dest.id || i} to={`/destinations/${slug}`}
                className="dd-rel-card"
                style={{
                  minWidth: 280, maxWidth: 280, borderRadius: 16, overflow: "hidden",
                  background: "#fff", border: "1.5px solid #e5e7eb",
                  flexShrink: 0, textDecoration: "none", display: "flex", flexDirection: "column",
                  transition: "all .28s cubic-bezier(.4,0,.2,1)",
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                }}>
                <div style={{ position: "relative", height: 170, overflow: "hidden", background: "#ecfdf5" }}>
                  {img
                    ? <img className="dd-rel-card-img" src={img} alt={dest.name} loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏔️</div>
                  }
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,44,34,.4) 0%, transparent 55%)" }} />
                  {dest.rating && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "3px 8px", borderRadius: 999,
                      background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)",
                      color: "#fbbf24", fontSize: 11.5, fontWeight: 700, display: "flex", gap: 4, alignItems: "center",
                    }}>
                      ⭐ {dest.rating.toFixed(1)}
                    </div>
                  )}
                  {(dest.isFeatured || dest.isPopular || dest.isNew) && (
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                      background: dest.isFeatured ? "#059669" : dest.isPopular ? "#7c3aed" : "#0284c7",
                      color: "#fff",
                    }}>
                      {dest.isFeatured ? "🏆 Featured" : dest.isPopular ? "🔥 Trending" : "✨ New"}
                    </span>
                  )}
                </div>

                <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#064e3b", margin: "0 0 6px", lineHeight: 1.25 }}>
                    {dest.name}
                  </h3>
                  {(dest.country?.name || dest.location) && (
                    <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                      📍 {dest.country?.flag ? `${dest.country.flag} ` : ""}{dest.location || dest.country?.name}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {duration && (
                      <span style={{ padding: "2px 9px", borderRadius: 999, background: "#f0fdf4", border: "1px solid #a7f3d0", color: "#065f46", fontSize: 11, fontWeight: 600 }}>
                        ⏱ {duration}
                      </span>
                    )}
                    {dest.difficulty && (
                      <span style={{ padding: "2px 9px", borderRadius: 999, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>
                        {dest.difficulty}
                      </span>
                    )}
                  </div>
                  {(dest.shortDescription || dest.description) && (
                    <p style={{
                      fontSize: 12.5, color: "#6b7280", lineHeight: 1.6, margin: "0 0 12px",
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {dest.shortDescription || dest.description}
                    </p>
                  )}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, color: "#059669", fontWeight: 700 }}>
                      Explore →
                    </span>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "#ecfdf5", border: "1px solid #a7f3d0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#059669", fontSize: 13,
                    }}>→</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {countrySlug && (
          <Reveal from="bottom" delay={100}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <Link to={`/country/${countrySlug}`} style={{
                ...GHOST_BTN_STYLE,
                padding: "12px 28px", fontSize: 14.5,
              }}>
                🌍 View All Destinations in {countryName} →
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMMENTS
══════════════════════════════════════════════════════════════ */
const ROTATE_WINDOW   = 3;
const ROTATE_INTERVAL = 6000;

/* DEV-only test harness: seed a comment on mount for the "kalisin-mbi"
   destination to verify the community discussion flow end-to-end.
   Guarded so it never runs in production and never spams duplicates. */
let kalininSeeded = false;

const CommentsSection = ({ d }) => {
  /* The comments API matches the numeric primary key, so prefer numericId.
     (adaptDestination maps `id` to the slug, with the real PK in `numericId`.) */
  const destId = d?.numericId || d?.id || d?._id || d?.slug;
  const { comments, loading, createComment, error } = useDestinationComments(destId);
  const { likes, loading: likesLoading, toggleLike } = useDestinationLikes(destId);
  const { isAuthenticated = false, openModal } = useUserAuth() || {};

  const [text,       setText]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [rotIdx,     setRotIdx]     = useState(0);
  const [likeBusy,  setLikeBusy]   = useState(false);

  useEffect(() => {
    if (comments.length <= ROTATE_WINDOW) { setRotIdx(0); return; }
    const t = setInterval(() => setRotIdx(i => (i + ROTATE_WINDOW) % comments.length), ROTATE_INTERVAL);
    return () => clearInterval(t);
  }, [comments.length]);

  const visible = useMemo(() => {
    if (comments.length <= ROTATE_WINDOW) return comments;
    return Array.from({ length: ROTATE_WINDOW }, (_, k) => comments[(rotIdx + k) % comments.length]);
  }, [comments, rotIdx]);

  /* ── DEV test: auto-seed a comment on mount for kalisin-mbi ── */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (kalininSeeded) return;
    if (!d?.slug || !d.slug.toLowerCase().includes("kalisin")) return;
    if (!isAuthenticated) return;
    if (comments.length > 0) return;
    kalininSeeded = true;
    createComment(
      destId,
      "Test comment — verifying the community discussion feature works on Kalisin Mbi! 🌍"
    ).catch(() => { kalininSeeded = false; });
  }, [d?.slug, isAuthenticated, comments.length, destId, createComment]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError("");
    if (!text.trim()) return;
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      else setLocalError("Please sign in to post a comment.");
      return;
    }
    setSubmitting(true);
    try { await createComment(destId, text.trim()); setText(""); setRotIdx(0); }
    catch (err) { setLocalError(err?.message || "Could not post comment. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      return;
    }
    setLikeBusy(true);
    try { await toggleLike(destId); }
    catch { /* silent */ }
    finally { setLikeBusy(false); }
  };

  if (!destId) return null;

  return (
    <section style={{ background: SECTION_BG.mint, padding: "clamp(36px,5vw,64px) clamp(16px,4vw,40px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal from="bottom">
          <SectionHead title="💬 Community Discussion" desc={`Share your experience and read what others say about ${d.name}`} tag="Reviews" />
        </Reveal>

        <Reveal from="bottom" delay={70}>
          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #d1fae5", boxShadow: "0 4px 20px rgba(6,78,59,.07)" }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg,#064e3b,#065f46)",
              padding: "18px 22px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Share Your Thoughts</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.65)", marginTop: 2 }}>Join the conversation</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button type="button" onClick={handleLike} disabled={likeBusy || likesLoading} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 999,
                  background: likes.isLiked ? "rgba(244,63,94,.25)" : "rgba(255,255,255,.12)",
                  color: likes.isLiked ? "#ffe4e6" : "rgba(255,255,255,.9)",
                  border: likes.isLiked ? "1px solid rgba(244,63,94,.4)" : "1px solid rgba(255,255,255,.15)",
                  fontSize: 12, fontWeight: 700, cursor: likeBusy || likesLoading ? "not-allowed" : "pointer",
                  opacity: likeBusy || likesLoading ? 0.7 : 1,
                  transition: "all .2s",
                }} title={likes.isLiked ? "Remove like" : "Like this destination"}>
                  <span style={{ fontSize: 16 }}>{likes.isLiked ? "❤️" : "🤍"}</span>
                  <span>{likes.total}</span>
                </button>
                <span style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.9)", fontSize: 12, fontWeight: 700 }}>
                  {comments.length} comment{comments.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div style={{ padding: "18px 22px" }}>
              {(localError || error) && (
                <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {localError || error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                  type="text" value={text} onChange={e => setText(e.target.value)}
                  placeholder={isAuthenticated ? `Share your experience at ${d.name}…` : `Sign in to comment…`}
                  maxLength={2000}
                  style={{
                    flex: 1, padding: "11px 16px", borderRadius: 11,
                    border: "1.5px solid #d1fae5", background: "#f9fafb",
                    fontSize: 14, color: "#1f2937", outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={e => e.target.style.borderColor = "#059669"}
                  onBlur={e => e.target.style.borderColor = "#d1fae5"}
                />
                <button type="submit" disabled={submitting || !text.trim()}
                  style={{ ...PRIMARY_BTN_STYLE, opacity: (submitting || !text.trim()) ? .5 : 1, cursor: (submitting || !text.trim()) ? "not-allowed" : "pointer" }}>
                  {submitting ? "⏳" : "✉️ Post"}
                </button>
              </form>

              {/* Comments */}
              {visible.map(c => c && (
                <div key={c.id} style={{ borderBottom: "1px solid #f0fdf4", paddingBottom: 14, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#059669,#047857)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 14, fontWeight: 700, overflow: "hidden",
                    }}>
                      {c.user?.avatar
                        ? <img src={c.user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (c.user?.name || c.authorName || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#064e3b" }}>{c.user?.name || c.authorName || "Anonymous"}</div>
                      <div style={{ fontSize: 11.5, color: "#9ca3af" }}>{new Date(c.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 }}>{c.content}</p>
                </div>
              ))}

              {comments.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 14 }}>
                  🌍 No comments yet — be the first to share your experience!
                </div>
              )}

              {/* Rotation dots */}
              {comments.length > ROTATE_WINDOW && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    Showing 3 of {comments.length} comments
                  </span>
                  <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: Math.ceil(comments.length / ROTATE_WINDOW) }, (_, p) => {
                      const active = Math.floor(rotIdx / ROTATE_WINDOW) === p;
                      return (
                        <button key={p} type="button" aria-label={`Page ${p + 1}`}
                          onClick={() => setRotIdx((p * ROTATE_WINDOW) % comments.length)}
                          style={{
                            width: active ? 20 : 7, height: 7, borderRadius: 4, padding: 0, border: "none",
                            background: active ? "#059669" : "#d1fae5", cursor: "pointer", transition: "all .3s",
                          }} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   END CTA
══════════════════════════════════════════════════════════════ */
const EndCta = ({ d, navigate }) => (
  <section style={{ background: "linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)", padding: "clamp(36px,5vw,60px) clamp(16px,4vw,40px)" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Reveal from="bottom">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 24,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              📅
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                Ready to experience {d.name}?
              </h3>
              <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.7)", margin: 0 }}>
                Book today and secure your spot. Limited availability.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => navigate(`/booking?destination=${d.slug}`)}
              style={{ ...PRIMARY_BTN_STYLE, background: "#fff", color: "#065f46", boxShadow: "0 4px 20px rgba(0,0,0,.18)" }}>
              📅 Book Now
            </button>
            <button onClick={() => navigate("/contact")}
              style={{ ...GHOST_BTN_STYLE, borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>
              ✉️ Enquire
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate   = useNavigate();
  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [identifier]);

  if (loading)              return <div><SkeletonPage /></div>;
  if (error || !destination) return <div><ErrorPage error={error} navigate={navigate} /></div>;

  const d = destination;

  return (
    <ScrollProvider>
      <style>{`
        *{box-sizing:border-box}
        body{-webkit-font-smoothing:antialiased}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes ddShim{from{background-position:-200% 0}to{background-position:200% 0}}
        @keyframes ddDot{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}
        @keyframes ddSlideFadeIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @media(max-width:480px){
          .dd-about-responsive-grid{grid-template-columns:1fr!important}
          .dd-detail-grid-2{grid-template-columns:1fr!important}
        }
      `}</style>
      <ProgressBar />

      <PageHeader
        title={d.name}
        subtitle={d.tagline || `Discover the incredible beauty and experiences awaiting you at ${d.name}`}
        backgroundImage={d.heroImage || d.imageUrl}
        breadcrumbs={[
          { label: "Explore",      path: "/explore" },
          { label: "Destinations", path: "/destinations" },
          d.country?.name ? { label: d.country.name, path: `/country/${d.countrySlug || d.country?.slug}` } : null,
          { label: d.name },
        ].filter(Boolean)}
        height="620px"
        align="center"
      />

      <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
        <AboutSection      d={d} />
        <MediaShowcase     d={d} />
        <HighlightsSection d={d} />
        <DeepDiveSection   d={d} />
        <TipsSafetySection d={d} />
        <FaqSection        d={d} />
        <MoreInCountrySection d={d} />
        <CommentsSection   d={d} />
        <EndCta            d={d} navigate={navigate} />
      </div>
    </ScrollProvider>
  );
};

export default DestinationDetail;