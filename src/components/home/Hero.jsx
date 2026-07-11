// components/home/Hero.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPlay,
  FiArrowRight,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import { useApp } from "../../context/AppContext";
import { useScrollTriggeredSlide } from "../../hooks/useScrollTriggeredSlide";

/* ═══════════════════════════════════════════════════════════
   SLIDE DATA
═══════════════════════════════════════════════════════════ */
export const HERO_SLIDES = [
  {
    image:
      "https://res.cloudinary.com/doijjawna/image/upload/v1781342220/ChatGPT_Image_Jun_13_2026_11_16_51_AM_oibwwb.png",
    fallback:
      "https://drive.google.com/uc?export=view&id=15LlHLEX_dDLEqMVPX2C3M4Gz6FfsAkWY",
    title: "Witness the Great Migration",
    subtitle:
      "Experience nature's greatest spectacle across the vast Serengeti and Maasai Mara plains",
    location: "Rwanda & Tanzania",
    preset: "cinematicDrift",
    gradient:
      "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(16,185,129,0.15) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/1200x/f7/d8/79/f7d879d6a1486f026ba9ba9c30a3a125.jpg",
    fallback:
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=3840",
    title: "Meet the Mountain Gorillas",
    subtitle:
      "An intimate encounter with our closest relatives in their misty forest home",
    location: "Rwanda & Uganda",
    preset: "softFocus",
    gradient:
      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(34,85,51,0.35) 100%)",
  },
  {
    image:
      "https://pictures.altai-travel.com/1920x1040/kilimanjaro-national-park-tanzania-istock-3490.jpg",
    fallback:
      "https://www.andbeyond.com/wp-content/uploads/sites/5/Elephants-and-mount-kilimanjaro.jpg",
    title: "Summit Mount Kilimanjaro",
    subtitle:
      "Conquer Africa's highest peak and stand at the legendary roof of the continent",
    location: "Tanzania",
    preset: "risingHorizon",
    gradient:
      "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 60%, rgba(255,255,255,0.05) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/1200x/0a/43/ca/0a43cafc5ea639697427a07f078506e3.jpg",
    fallback:
      "https://images.unsplash.com/photo-1529876751255-1c6d8f09ff1d?auto=format&fit=crop&w=3840",
    title: "Discover Ancient Wonders",
    subtitle:
      "Explore the rock-hewn churches of Lalibela and Ethiopia's 3,000-year timeless heritage",
    location: "Ethiopia",
    preset: "zoomOut",
    gradient:
      "linear-gradient(45deg, rgba(139,69,19,0.35) 0%, rgba(0,0,0,0.45) 100%)",
  },
  {
    image:
      "https://images.squarespace-cdn.com/content/v1/57b88db03e00be38aec142b0/1526928305567-Y0MTKDAAGPS2IP0YXMSO/03_What_To_Do_In_Gisenyi_in_Lake_Kivu_Rwanda_Visiting_Gisenyi_HandZaround.jpg?format=1500w",
    fallback:
      "https://images.trvl-media.com/place/3000470585/420aa538-86d3-463e-ab29-6105311b6442.jpg",
    title: "Lake Kivu Sunrise in Rwanda",
    subtitle:
      "Serene dawn over Lake Kivu with misty waters and distant hills at sunrise",
    location: "Lake Kivu, Rwanda",
    preset: "parallaxDepth",
    gradient:
      "linear-gradient(180deg, rgba(255,140,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image:
      "https://yellowzebrasafaris.com/media/46316/serengeti-safaris-tanzania-wildlife-adventures.jpg?format=jpg&height=1024&v=1da5e0fb8b7e1f0&width=2048",
    fallback:
      "https://www.serengeti.com/assets/img/serengeti-national-park-savannah-landscape.jpg",
    title: "Serengeti Grasslands",
    subtitle:
      "Endless grasslands and wildlife roaming under wide Tanzanian skies",
    location: "Tanzania",
    preset: "horizontalPan",
    gradient:
      "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, rgba(218,165,32,0.15) 100%)",
  },
  {
    image:
      "https://img1.wsimg.com/isteam/ip/29cc5507-095f-4b8e-ad81-fae5576e3852/GettyImages-148679836-5b03d89030371300373c5135.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1280",
    fallback:
      "https://i.pinimg.com/1200x/8c/8d/39/8c8d391974e82e3a2c2422ee8775394b.jpg",
    title: "Ngorongoro Caldera Vista",
    subtitle:
      "Breathtaking crater views and rich wildlife habitats high in Tanzanian highlands",
    location: "Tanzania",
    preset: "cinematicWide",
    gradient:
      "linear-gradient(135deg, rgba(0,100,0,0.25) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image:
      "https://ugandarwandagorillatours.com/wp-content/uploads/2019/02/bwindi-forest-uganda-gorilla-safaris.jpg",
    fallback:
      "https://i.pinimg.com/1200x/1e/5b/d2/1e5bd2291f7be957992fbc3c13a8f9a2.jpg",
    title: "Bwindi Rainforest",
    subtitle:
      "Mist‑covered rainforests rich with gorillas and biodiversity in Uganda",
    location: "Uganda",
    preset: "verticalReveal",
    gradient:
      "linear-gradient(180deg, rgba(0,50,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
  },
  {
    image:
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/26/6d/0c/views-from-the-western.jpg?h=1200&s=1&w=1200",
    fallback:
      "https://i.natgeofe.com/n/2c6a7c2d-5dcc-4c19-9707-5fd50222374c/Magashi_05-19-98e.JPG",
    title: "Akagera National Park",
    subtitle:
      "Open landscapes and wildlife safaris across eastern Rwanda's pristine wilderness",
    location: "Rwanda",
    preset: "dynamicSweep",
    gradient:
      "linear-gradient(45deg, rgba(0,0,0,0.45) 0%, rgba(16,185,129,0.15) 100%)",
  },
  {
    image:
      "https://res.cloudinary.com/doijjawna/image/upload/v1781342711/ChatGPT_Image_Jun_13_2026_11_24_57_AM_fu7nt6.png",
    fallback:
      "https://i.pinimg.com/1200x/77/19/ad/7719adaae5f3d0c347a8d034aee9c9b2.jpg",
    title: "Amboseli & Kilimanjaro",
    subtitle:
      "Iconic African wildlife framed by majestic Mount Kilimanjaro in Rwanda",
    location: "Rwanda",
    preset: "rotateZoom",
    gradient:
      "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(135,206,235,0.15) 100%)",
  },
];

/* ═══════════════════════════════════════════════════════════
   IMAGE PRESETS (Ken Burns effects)
═══════════════════════════════════════════════════════════ */
const PRESETS = {
  cinematicDrift: {
    initial: { scale: 1.18, x: "4%", y: "2%" },
    animate: { scale: 1.02, x: "-3%", y: "-1%" },
  },
  verticalReveal: {
    initial: { scale: 1.22, y: "6%" },
    animate: { scale: 1.04, y: "-4%" },
  },
  horizontalPan: {
    initial: { scale: 1.1, x: "-6%" },
    animate: { scale: 1.02, x: "4%" },
  },
  zoomOut: {
    initial: { scale: 1.28 },
    animate: { scale: 1.02 },
  },
  rotateZoom: {
    initial: { scale: 1.14, rotate: 1.5 },
    animate: { scale: 1.02, rotate: 0 },
  },
  parallaxDepth: {
    initial: { scale: 1.18, y: "8%" },
    animate: { scale: 1.02, y: "-2%" },
  },
  softFocus: {
    initial: { scale: 1.08 },
    animate: { scale: 1.02 },
  },
  dynamicSweep: {
    initial: { scale: 1.14, x: "6%", y: "-4%" },
    animate: { scale: 1.02, x: "-3%", y: "2%" },
  },
  risingHorizon: {
    initial: { scale: 1.18, y: "10%" },
    animate: { scale: 1.02, y: "-4%" },
  },
  cinematicWide: {
    initial: { scale: 1.22, x: "-4%" },
    animate: { scale: 1.02, x: "3%" },
  },
};

/* ═══════════════════════════════════════════════════════════
   ANIMATED LOCATION PIN SVG
═══════════════════════════════════════════════════════════ */
const LocationPin = ({ size = 17 }) => (
  <motion.div
    style={{
      position: "relative",
      width: size + 10,
      height: size + 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {/* Ripple rings */}
    {[0, 0.9].map((delay, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1px solid rgba(16,185,129,${0.35 - i * 0.12})`,
        }}
        animate={{
          scale: [1, 1.7 + i * 0.3, 2 + i * 0.3],
          opacity: [0.5 - i * 0.15, 0.15, 0],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeOut",
          delay,
        }}
      />
    ))}

    {/* Pin SVG */}
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ y: [0, -2.5, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.4))",
      }}
    >
      <defs>
        <linearGradient id="hero-pin-g" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <motion.path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="url(#hero-pin-g)"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="0.7"
      />
      <motion.circle
        cx="12" cy="9" r="2.8"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="12" cy="9" r="1"
        fill="rgba(255,255,255,0.85)"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   CSS INJECTION
═══════════════════════════════════════════════════════════ */
const HERO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.hero-root {
  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 600px;
  overflow: hidden;
  background: #0a0a0a;
}

/* ── Slide Layers ── */
.hero-slides {
  position: absolute; inset: 0;
}
.hero-slide {
  position: absolute; inset: 0; overflow: hidden;
}
.hero-slide-img {
  width: 100%; height: 100%;
  object-fit: cover;
  will-change: transform;
}
.hero-overlay-slide {
  position: absolute; inset: 0;
  z-index: 2; pointer-events: none;
}
.hero-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%);
  z-index: 3; pointer-events: none;
}
.hero-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  z-index: 4; pointer-events: none;
  opacity: 0.5;
}

/* ── Content ── */
.hero-content {
  position: relative; z-index: 10;
  height: 100%;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center;
  padding: 0 24px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Eyebrow ── */
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: clamp(16px, 3vw, 28px);
}
.hero-eyebrow__line {
  width: clamp(24px, 5vw, 56px);
  height: 1.5px;
  border-radius: 1px;
}
.hero-eyebrow__line--left {
  background: linear-gradient(90deg, transparent, rgba(16,185,129,0.7));
}
.hero-eyebrow__line--right {
  background: linear-gradient(90deg, rgba(16,185,129,0.7), transparent);
}
.hero-eyebrow__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(10px, 1.2vw, 13px);
  font-weight: 700;
  color: #10b981;
  letter-spacing: clamp(2px, 0.5vw, 4.5px);
  text-transform: uppercase;
  white-space: nowrap;
}

/* ── Title ── */
.hero-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(32px, 6.5vw, 74px);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 0 0 clamp(12px, 2vw, 24px);
  max-width: 900px;
  text-shadow: 0 4px 40px rgba(0,0,0,0.4);
}

/* ── Subtitle ── */
.hero-subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(14px, 1.6vw, 19px);
  font-weight: 400;
  color: rgba(255,255,255,0.88);
  line-height: 1.7;
  max-width: 660px;
  margin: 0 0 clamp(10px, 1.5vw, 18px);
  text-shadow: 0 2px 12px rgba(0,0,0,0.25);
}

/* ── Location ── */
.hero-location {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: clamp(24px, 4vw, 44px);
}
.hero-location__divider {
  width: clamp(14px, 2vw, 22px);
  height: 1.5px;
  border-radius: 1px;
  background: linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.12));
}
.hero-location__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(12px, 1.3vw, 15px);
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
}

/* ── Buttons ── */
.hero-buttons {
  display: flex;
  gap: clamp(12px, 2vw, 20px);
  flex-wrap: wrap;
  justify-content: center;
}
.hero-play-btn {
  display: flex; align-items: center; gap: 12px;
  padding: clamp(12px, 1.5vw, 16px) clamp(20px, 2.5vw, 32px);
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.6);
  border-radius: 999px;
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px, 1.2vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  backdrop-filter: blur(4px);
}
.hero-play-btn:hover {
  background: rgba(255,255,255,1);
  color: #059669;
  border-color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0,0,0,0.25);
}
.hero-play-icon {
  width: clamp(32px, 3.5vw, 40px);
  height: clamp(32px, 3.5vw, 40px);
  border-radius: 50%;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  color: #059669;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.hero-play-btn:hover .hero-play-icon {
  background: #059669;
  color: #fff;
  transform: scale(1.06);
}

/* ── Nav Arrows ── */
.hero-nav {
  position: absolute;
  top: 50%; z-index: 12;
  transform: translateY(-50%);
  width: clamp(38px, 4vw, 48px);
  height: clamp(38px, 4vw, 48px);
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.8);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.hero-root:hover .hero-nav { opacity: 1; }
.hero-nav:hover {
  background: rgba(255,255,255,0.16);
  border-color: rgba(255,255,255,0.4);
  color: #fff;
  transform: translateY(-50%) scale(1.06);
}
.hero-nav--prev { left: clamp(12px, 2vw, 28px); }
.hero-nav--next { right: clamp(12px, 2vw, 28px); }

/* ── Indicators ── */
.hero-indicators {
  position: absolute;
  bottom: clamp(80px, 14vh, 130px);
  left: 50%; transform: translateX(-50%);
  display: flex; gap: 6px;
  z-index: 12;
}
.hero-dot {
  width: 28px; height: 3px;
  border-radius: 2px;
  background: rgba(255,255,255,0.25);
  border: none; padding: 0;
  cursor: pointer;
  position: relative; overflow: hidden;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
}
.hero-dot:hover { background: rgba(255,255,255,0.4); }
.hero-dot--active {
  width: 44px;
  background: rgba(255,255,255,0.3);
}
.hero-dot__fill {
  position: absolute; top: 0; left: 0;
  height: 100%;
  background: #10b981;
  border-radius: 2px;
}

/* ── Scroll CTA ── */
.hero-scroll {
  position: absolute;
  bottom: clamp(20px, 4vh, 44px);
  left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column;
  align-items: center; gap: 6px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  z-index: 12;
  background: none; border: none;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  transition: color 0.3s ease;
}
.hero-scroll:hover { color: rgba(255,255,255,0.95); }
.hero-scroll__text {
  font-size: 10px; font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* ── Stats Bar ── */
.hero-stats {
  position: absolute;
  bottom: clamp(20px, 4vh, 44px);
  right: clamp(16px, 3vw, 44px);
  z-index: 12;
  display: flex; gap: clamp(20px, 3vw, 36px);
}
.hero-stat__value {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 3vw, 34px);
  font-weight: 400; color: #fff;
  line-height: 1;
}
.hero-stat__label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(9px, 0.9vw, 11px);
  font-weight: 600; color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
}

/* ── Ambient Glow ── */
.hero-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 5;
  filter: blur(60px);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero-stats { display: none; }
}
@media (max-width: 768px) {
  .hero-root { min-height: 100svh; }
  .hero-nav { display: none; }
  .hero-indicators { bottom: 90px; }
  .hero-scroll { bottom: 20px; }
}
@media (max-width: 480px) {
  .hero-indicators { bottom: 80px; gap: 5px; }
  .hero-dot { width: 20px; height: 2.5px; }
  .hero-dot--active { width: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.2s !important;
  }
}
`;

function injectHeroCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("hero-css-v2")) return;
  const s = document.createElement("style");
  s.id = "hero-css-v2";
  s.textContent = HERO_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   HERO COMPONENT
═══════════════════════════════════════════════════════════ */
const Hero = () => {
  const slides = HERO_SLIDES;
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const { playVideo, isPlayerOpen } = useApp();
  const timerRef = useRef(null);
  const INTERVAL = 11000;

  const tourismVideos = [
    "eoTKXtrRjmY", "8YVlT7GFqzA", "86aGcUQq_1E",
    "0RZknKnFqOg", "wP4AAYn5tqY", "siqAfzwCVuw",
    "4cX_JIMJwGY",
  ];

  useEffect(() => { injectHeroCSS(); }, []);

  // ── Auto-advance ──
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (isPaused || isPlayerOpen) return;
    timerRef.current = setInterval(
      () => setCurrent((p) => (p + 1) % total),
      INTERVAL,
    );
  }, [isPaused, isPlayerOpen, total]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  // ── Navigation ──
  const goTo = useCallback(
    (i) => {
      setCurrent(i);
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 16000);
    },
    [],
  );

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % total);
    startTimer();
  }, [total, startTimer]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + total) % total);
    startTimer();
  }, [total, startTimer]);

  // ── Scroll trigger ──
  const containerRef = useScrollTriggeredSlide(next, 300);

  // ── Preload ──
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
      if (s.fallback) {
        const fb = new Image();
        fb.src = s.fallback;
      }
    });
  }, []);

  const handleImageError = (i) => {
    setImageErrors((prev) => ({ ...prev, [i]: true }));
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const handleWatch = () => {
    const idx = Math.floor(Math.random() * tourismVideos.length);
    playVideo(tourismVideos[idx], "Altuvera Story");
  };

  const getPreset = (i) =>
    PRESETS[slides[i].preset] || PRESETS.cinematicDrift;

  const slide = slides[current];

  return (
    <section className="hero-root" ref={containerRef}>
      {/* ── Ambient glow ── */}
      <motion.div
        className="hero-glow"
        style={{
          top: "8%", left: "-80px",
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hero-glow"
        style={{
          bottom: "15%", right: "-60px",
          width: 280, height: 280,
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Slides ── */}
      <div className="hero-slides">
        <AnimatePresence initial={false}>
          {slides.map(
            (s, i) =>
              i === current && (
                <motion.div
                  key={i}
                  className="hero-slide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  style={{ zIndex: 1 }}
                >
                  <motion.img
                    src={imageErrors[i] ? s.fallback : s.image}
                    alt={s.title}
                    className="hero-slide-img"
                    onError={() => handleImageError(i)}
                    initial={getPreset(i).initial}
                    animate={getPreset(i).animate}
                    transition={{ duration: 13, ease: "linear" }}
                    draggable={false}
                  />
                  <div
                    className="hero-overlay-slide"
                    style={{ background: s.gradient }}
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      <div className="hero-vignette" />
      <div className="hero-grain" />

      {/* ── Content ── */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Eyebrow */}
            <motion.div
              className="hero-eyebrow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="hero-eyebrow__line hero-eyebrow__line--left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ transformOrigin: "right" }}
              />
              <span className="hero-eyebrow__text">
                Adventure in High Places & Deep Culture
              </span>
              <motion.div
                className="hero-eyebrow__line hero-eyebrow__line--right"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>

            {/* Title */}
            <div style={{ overflow: "hidden" }}>
              <motion.h1
                className="hero-title"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.9,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {slide.title}
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Location */}
            <motion.div
              className="hero-location"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <LocationPin size={17} />
              <div className="hero-location__divider" />
              <span className="hero-location__text">{slide.location}</span>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  to="/destinations"
                  variant="primary"
                  size="large"
                  icon={<FiArrowRight size={16} />}
                >
                  Explore Destinations
                </Button>
              </motion.div>

              <motion.button
                className="hero-play-btn"
                onClick={handleWatch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="hero-play-icon">
                  <FiPlay size={14} />
                </div>
                Watch Our Story
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav Arrows ── */}
      <button className="hero-nav hero-nav--prev" onClick={prev} aria-label="Previous slide">
        <FiChevronLeft size={18} />
      </button>
      <button className="hero-nav hero-nav--next" onClick={next} aria-label="Next slide">
        <FiChevronRight size={18} />
      </button>

      {/* ── Indicators ── */}
      <div className="hero-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "hero-dot--active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          >
            {i === current && !isPaused && !isPlayerOpen && (
              <motion.div
                className="hero-dot__fill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                key={`fill-${current}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Scroll CTA ── */}
      <motion.button
        className="hero-scroll"
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="hero-scroll__text">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <FiChevronDown size={20} />
        </motion.div>
      </motion.button>

      {/* ── Stats (desktop) ── */}
      <div className="hero-stats">
        {[
          { num: "6+", lab: "Countries" },
          { num: "500+", lab: "Destinations" },
          { num: "15K+", lab: "Travelers" },
        ].map((st, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.12 }}
          >
            <div className="hero-stat__value">{st.num}</div>
            <div className="hero-stat__label">{st.lab}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Hero;