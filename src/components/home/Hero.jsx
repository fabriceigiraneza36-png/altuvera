// components/home/Hero.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiPlay, FiArrowRight, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import { useApp } from "../../context/AppContext";

/* ═══════════════════════════════════════════════════════════
   SLIDE DATA
═══════════════════════════════════════════════════════════ */
export const HERO_SLIDES = [
  {
    image: "https://res.cloudinary.com/doijjawna/image/upload/v1781342220/ChatGPT_Image_Jun_13_2026_11_16_51_AM_oibwwb.png",
    fallback: "https://drive.google.com/uc?export=view&id=15LlHLEX_dDLEqMVPX2C3M4Gz6FfsAkWY",
    title: "Witness the Great Migration",
    subtitle: "Experience nature's greatest spectacle across the vast Serengeti and Maasai Mara plains",
    location: "Rwanda & Tanzania",
    preset: "cinematicDrift",
    gradient: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(16,185,129,0.15) 100%)",
  },
  {
    image: "https://i.pinimg.com/1200x/f7/d8/79/f7d879d6a1486f026ba9ba9c30a3a125.jpg",
    fallback: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=3840",
    title: "Meet the Mountain Gorillas",
    subtitle: "An intimate encounter with our closest relatives in their misty forest home",
    location: "Rwanda & Uganda",
    preset: "softFocus",
    gradient: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(34,85,51,0.35) 100%)",
  },
  {
    image: "https://pictures.altai-travel.com/1920x1040/kilimanjaro-national-park-tanzania-istock-3490.jpg",
    fallback: "https://www.andbeyond.com/wp-content/uploads/sites/5/Elephants-and-mount-kilimanjaro.jpg",
    title: "Summit Mount Kilimanjaro",
    subtitle: "Conquer Africa's highest peak and stand at the legendary roof of the continent",
    location: "Tanzania",
    preset: "risingHorizon",
    gradient: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 60%, rgba(255,255,255,0.05) 100%)",
  },
  {
    image: "https://i.pinimg.com/1200x/0a/43/ca/0a43cafc5ea639697427a07f078506e3.jpg",
    fallback: "https://images.unsplash.com/photo-1529876751255-1c6d8f09ff1d?auto=format&fit=crop&w=3840",
    title: "Discover Ancient Wonders",
    subtitle: "Explore the rock-hewn churches of Lalibela and Ethiopia's 3,000-year timeless heritage",
    location: "Ethiopia",
    preset: "zoomOut",
    gradient: "linear-gradient(45deg, rgba(139,69,19,0.35) 0%, rgba(0,0,0,0.45) 100%)",
  },
  {
    image: "https://images.squarespace-cdn.com/content/v1/57b88db03e00be38aec142b0/1526928305567-Y0MTKDAAGPS2IP0YXMSO/03_What_To_Do_In_Gisenyi_in_Lake_Kivu_Rwanda_Visiting_Gisenyi_HandZaround.jpg?format=1500w",
    fallback: "https://images.trvl-media.com/place/3000470585/420aa538-86d3-463e-ab29-6105311b6442.jpg",
    title: "Lake Kivu Sunrise in Rwanda",
    subtitle: "Serene dawn over Lake Kivu with misty waters and distant hills at sunrise",
    location: "Lake Kivu, Rwanda",
    preset: "parallaxDepth",
    gradient: "linear-gradient(180deg, rgba(255,140,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image: "https://yellowzebrasafaris.com/media/46316/serengeti-safaris-tanzania-wildlife-adventures.jpg?format=jpg&height=1024&v=1da5e0fb8b7e1f0&width=2048",
    fallback: "https://www.serengeti.com/assets/img/serengeti-national-park-savannah-landscape.jpg",
    title: "Serengeti Grasslands",
    subtitle: "Endless grasslands and wildlife roaming under wide Tanzanian skies",
    location: "Tanzania",
    preset: "horizontalPan",
    gradient: "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, rgba(218,165,32,0.15) 100%)",
  },
  {
    image: "https://img1.wsimg.com/isteam/ip/29cc5507-095f-4b8e-ad81-fae5576e3852/GettyImages-148679836-5b03d89030371300373c5135.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1280",
    fallback: "https://i.pinimg.com/1200x/8c/8d/39/8c8d391974e82e3a2c2422ee8775394b.jpg",
    title: "Ngorongoro Caldera Vista",
    subtitle: "Breathtaking crater views and rich wildlife habitats high in Tanzanian highlands",
    location: "Tanzania",
    preset: "cinematicWide",
    gradient: "linear-gradient(135deg, rgba(0,100,0,0.25) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image: "https://ugandarwandagorillatours.com/wp-content/uploads/2019/02/bwindi-forest-uganda-gorilla-safaris.jpg",
    fallback: "https://i.pinimg.com/1200x/1e/5b/d2/1e5bd2291f7be957992fbc3c13a8f9a2.jpg",
    title: "Bwindi Rainforest",
    subtitle: "Mist‑covered rainforests rich with gorillas and biodiversity in Uganda",
    location: "Uganda",
    preset: "verticalReveal",
    gradient: "linear-gradient(180deg, rgba(0,50,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
  },
  {
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/26/6d/0c/views-from-the-western.jpg?h=1200&s=1&w=1200",
    fallback: "https://i.natgeofe.com/n/2c6a7c2d-5dcc-4c19-9707-5fd50222374c/Magashi_05-19-98e.JPG",
    title: "Akagera National Park",
    subtitle: "Open landscapes and wildlife safaris across eastern Rwanda's pristine wilderness",
    location: "Rwanda",
    preset: "dynamicSweep",
    gradient: "linear-gradient(45deg, rgba(0,0,0,0.45) 0%, rgba(16,185,129,0.15) 100%)",
  },
  {
    image: "https://res.cloudinary.com/doijjawna/image/upload/v1781342711/ChatGPT_Image_Jun_13_2026_11_24_57_AM_fu7nt6.png",
    fallback: "https://i.pinimg.com/1200x/77/19/ad/7719adaae5f3d0c347a8d034aee9c9b2.jpg",
    title: "Amboseli & Kilimanjaro",
    subtitle: "Iconic African wildlife framed by majestic Mount Kilimanjaro in Rwanda",
    location: "Rwanda",
    preset: "rotateZoom",
    gradient: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(135,206,235,0.15) 100%)",
  },
];

/* ═══════════════════════════════════════════════════════════
   KEN BURNS PRESETS
═══════════════════════════════════════════════════════════ */
const PRESETS = {
  cinematicDrift:  { initial: { scale: 1.18, x: "4%", y: "2%" },       animate: { scale: 1.02, x: "-3%", y: "-1%" } },
  verticalReveal:  { initial: { scale: 1.22, y: "6%" },                 animate: { scale: 1.04, y: "-4%" } },
  horizontalPan:   { initial: { scale: 1.1, x: "-6%" },                 animate: { scale: 1.02, x: "4%" } },
  zoomOut:         { initial: { scale: 1.28 },                           animate: { scale: 1.02 } },
  rotateZoom:      { initial: { scale: 1.14, rotate: 1.5 },             animate: { scale: 1.02, rotate: 0 } },
  parallaxDepth:   { initial: { scale: 1.18, y: "8%" },                 animate: { scale: 1.02, y: "-2%" } },
  softFocus:       { initial: { scale: 1.08 },                           animate: { scale: 1.02 } },
  dynamicSweep:    { initial: { scale: 1.14, x: "6%", y: "-4%" },       animate: { scale: 1.02, x: "-3%", y: "2%" } },
  risingHorizon:   { initial: { scale: 1.18, y: "10%" },                animate: { scale: 1.02, y: "-4%" } },
  cinematicWide:   { initial: { scale: 1.22, x: "-4%" },                animate: { scale: 1.02, x: "3%" } },
};

/* ═══════════════════════════════════════════════════════════
   ANIMATED LOCATION PIN
═══════════════════════════════════════════════════════════ */
const LocationPin = ({ size = 17 }) => (
  <motion.div
    style={{
      position: "relative",
      width: size + 10, height: size + 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {[0, 0.9].map((delay, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid rgba(16,185,129,${0.35 - i * 0.12})`,
        }}
        animate={{ scale: [1, 1.7 + i * 0.3, 2 + i * 0.3], opacity: [0.5 - i * 0.15, 0.15, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay }}
      />
    ))}
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      animate={{ y: [0, -2.5, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 2px 6px rgba(16,185,129,0.4))" }}
    >
      <defs>
        <linearGradient id="hpin" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#hpin)" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />
      <motion.circle cx="12" cy="9" r="2.8" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx="12" cy="9" r="1" fill="rgba(255,255,255,0.85)" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
    </motion.svg>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.h-root {
  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 580px;
  overflow: hidden;
  background: #080f0b;
}

/* ── Slide layers ── */
.h-slides { position: absolute; inset: 0; }
.h-slide  { position: absolute; inset: 0; overflow: hidden; }
.h-slide-img {
  width: 100%; height: 100%;
  object-fit: cover;
  will-change: transform;
}
.h-overlay-slide {
  position: absolute; inset: 0;
  z-index: 2; pointer-events: none;
}
.h-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.32) 100%);
  z-index: 3; pointer-events: none;
}
.h-grain {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  z-index: 4; pointer-events: none; opacity: 0.45;
}

/* ── Bottom fade for seamless page flow ── */
.h-bottom-fade {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: clamp(80px, 15vh, 160px);
  background: linear-gradient(to top, #080f0b 0%, rgba(8,15,11,0.6) 40%, transparent 100%);
  z-index: 6; pointer-events: none;
}

/* ── Ambient glow ── */
.h-glow {
  position: absolute; border-radius: 50%;
  pointer-events: none; z-index: 5;
  filter: blur(60px);
}

/* ── Content ── */
.h-content {
  position: relative; z-index: 10;
  height: 100%;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center;
  padding: 0 clamp(20px, 5vw, 48px);
  max-width: 1080px;
  margin: 0 auto;
}

/* Eyebrow */
.h-eyebrow {
  display: inline-flex; align-items: center; gap: clamp(8px, 1.5vw, 14px);
  margin-bottom: clamp(14px, 2.5vw, 26px);
}
.h-eyebrow__line {
  height: 1px; border-radius: 1px;
  width: clamp(20px, 4.5vw, 52px);
}
.h-eyebrow__line--l { background: linear-gradient(90deg, transparent, rgba(16,185,129,0.65)); }
.h-eyebrow__line--r { background: linear-gradient(90deg, rgba(16,185,129,0.65), transparent); }
.h-eyebrow__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(9px, 1.1vw, 12px);
  font-weight: 700;
  color: #10b981;
  letter-spacing: clamp(2px, 0.4vw, 4px);
  text-transform: uppercase;
  white-space: nowrap;
}

/* Title */
.h-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(30px, 6.2vw, 72px);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.06;
  letter-spacing: -0.025em;
  margin: 0 0 clamp(10px, 1.8vw, 22px);
  max-width: 860px;
  text-shadow: 0 3px 30px rgba(0,0,0,0.35);
}

/* Subtitle */
.h-subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(13px, 1.5vw, 18px);
  font-weight: 400;
  color: rgba(255,255,255,0.85);
  line-height: 1.72;
  max-width: 620px;
  margin: 0 0 clamp(8px, 1.2vw, 16px);
  text-shadow: 0 1px 10px rgba(0,0,0,0.2);
}

/* Location */
.h-location {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: clamp(22px, 3.5vw, 42px);
}
.h-location__line {
  width: clamp(12px, 1.8vw, 20px); height: 1px;
  background: linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.1));
  border-radius: 1px;
}
.h-location__text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(11px, 1.2vw, 14px);
  font-weight: 600;
  color: rgba(255,255,255,0.88);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.25);
}

/* Buttons */
.h-buttons {
  display: flex;
  gap: clamp(10px, 1.8vw, 18px);
  flex-wrap: wrap;
  justify-content: center;
}
.h-play {
  display: flex; align-items: center;
  gap: clamp(8px, 1vw, 12px);
  padding: clamp(11px, 1.3vw, 15px) clamp(18px, 2.2vw, 30px);
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.5);
  border-radius: 999px;
  color: #fff;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: clamp(12px, 1.1vw, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.h-play:hover {
  background: #fff; color: #059669;
  border-color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
}
.h-play__icon {
  width: clamp(30px, 3vw, 38px);
  height: clamp(30px, 3vw, 38px);
  border-radius: 50%;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  color: #059669;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.h-play:hover .h-play__icon {
  background: #059669; color: #fff;
  transform: scale(1.05);
}

/* Scroll indicator */
.h-scroll {
  position: absolute;
  bottom: clamp(16px, 3.5vh, 40px);
  left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  color: rgba(255,255,255,0.55);
  cursor: pointer; z-index: 12;
  background: none; border: none;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  transition: color 0.3s ease;
}
.h-scroll:hover { color: rgba(255,255,255,0.9); }
.h-scroll__text {
  font-size: clamp(8px, 0.9vw, 10px);
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .h-root { min-height: 100svh; min-height: 540px; }
  .h-subtitle { max-width: 90vw; }
}
@media (max-width: 480px) {
  .h-buttons { flex-direction: column; align-items: center; width: 100%; }
  .h-play { width: 100%; max-width: 280px; justify-content: center; }
  .h-scroll { bottom: 12px; }
  .h-scroll__text { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.15s !important;
  }
}
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("h-css")) return;
  const s = document.createElement("style");
  s.id = "h-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════════
   HERO COMPONENT
═══════════════════════════════════════════════════════════ */
const Hero = () => {
  const slides = HERO_SLIDES;
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const { playVideo, isPlayerOpen } = useApp();
  const timerRef = useRef(null);
  const INTERVAL = 10000;

  const tourismVideos = [
    "eoTKXtrRjmY", "8YVlT7GFqzA", "86aGcUQq_1E",
    "0RZknKnFqOg", "wP4AAYn5tqY", "siqAfzwCVuw", "4cX_JIMJwGY",
  ];

  useEffect(() => { injectCSS(); }, []);

  // Auto-advance
  useEffect(() => {
    if (isPlayerOpen) return;
    timerRef.current = setInterval(
      () => setCurrent((p) => (p + 1) % total),
      INTERVAL,
    );
    return () => clearInterval(timerRef.current);
  }, [isPlayerOpen, total]);

  // Preload
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
      if (s.fallback) { const fb = new Image(); fb.src = s.fallback; }
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

  const getPreset = (i) => PRESETS[slides[i].preset] || PRESETS.cinematicDrift;

  const slide = slides[current];

  return (
    <section className="h-root">
      {/* Ambient */}
      <motion.div
        className="h-glow"
        style={{
          top: "5%", left: "-60px", width: 300, height: 300,
          background: "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="h-glow"
        style={{
          bottom: "10%", right: "-40px", width: 260, height: 260,
          background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Slides */}
      <div className="h-slides">
        <AnimatePresence initial={false}>
          {slides.map(
            (s, i) =>
              i === current && (
                <motion.div
                  key={i}
                  className="h-slide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  style={{ zIndex: 1 }}
                >
                  <motion.img
                    src={imageErrors[i] ? s.fallback : s.image}
                    alt={s.title}
                    className="h-slide-img"
                    onError={() => handleImageError(i)}
                    initial={getPreset(i).initial}
                    animate={getPreset(i).animate}
                    transition={{ duration: 14, ease: "linear" }}
                    draggable={false}
                  />
                  <div className="h-overlay-slide" style={{ background: s.gradient }} />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      <div className="h-vignette" />
      <div className="h-grain" />
      <div className="h-bottom-fade" />

      {/* Content */}
      <div className="h-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Eyebrow */}
            <motion.div
              className="h-eyebrow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="h-eyebrow__line h-eyebrow__line--l"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                style={{ transformOrigin: "right" }}
              />
              <span className="h-eyebrow__text">
                Adventure in High Places &amp; Deep Culture
              </span>
              <motion.div
                className="h-eyebrow__line h-eyebrow__line--r"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>

            {/* Title */}
            <div style={{ overflow: "hidden" }}>
              <motion.h1
                className="h-title"
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                {slide.title}
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              className="h-subtitle"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, delay: 0.35 }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Location */}
            <motion.div
              className="h-location"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <LocationPin size={16} />
              <div className="h-location__line" />
              <span className="h-location__text">{slide.location}</span>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="h-buttons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  to="/destinations"
                  variant="primary"
                  size="large"
                  icon={<FiArrowRight size={15} />}
                >
                  Explore Destinations
                </Button>
              </motion.div>

              <motion.button
                className="h-play"
                onClick={handleWatch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="h-play__icon">
                  <FiPlay size={13} />
                </div>
                Watch Our Story
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll */}
      <motion.button
        className="h-scroll"
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="h-scroll__text">Scroll</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <FiChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;