// components/home/Hero.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPlay,
  FiMap,
  FiArrowRight,
  FiChevronDown,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import { useApp } from "../../context/AppContext";
import { useScrollTriggeredSlide } from "../../hooks/useScrollTriggeredSlide";

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
    animationPreset: "cinematicDrift",
    overlayGradient:
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
    animationPreset: "softFocus",
    overlayGradient:
      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(34,85,51,0.35) 100%)",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=3840",
    fallback:
      "https://www.andbeyond.com/wp-content/uploads/sites/5/Elephants-and-mount-kilimanjaro.jpg",
    title: "Summit Mount Kilimanjaro",
    subtitle:
      "Conquer Africa's highest peak and stand at the legendary roof of the continent",
    location: "Tanzania",
    animationPreset: "risingHorizon",
    overlayGradient:
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
    animationPreset: "zoomOut",
    overlayGradient:
      "linear-gradient(45deg, rgba(139,69,19,0.35) 0%, rgba(0,0,0,0.45) 100%)",
  },
  {
    image:
      "https://copilot.microsoft.com/th/id/BCO.fd1714d5-8831-4d7f-8cb0-141b6ee84f02.png",
    fallback:
      "https://images.trvl-media.com/place/3000470585/420aa538-86d3-463e-ab29-6105311b6442.jpg",
    title: "Lake Kivu Sunrise in Rwanda",
    subtitle:
      "Serene dawn over Lake Kivu with misty waters and distant hills at sunrise",
    location: "Lake Kivu, Rwanda",
    animationPreset: "parallaxDepth",
    overlayGradient:
      "linear-gradient(180deg, rgba(255,140,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/736x/68/e6/cd/68e6cd9f11e9fd00ea3fb928103b8f2b.jpg",
    fallback:
      "https://copilot.microsoft.com/th/id/BCO.e252cb92-305d-4a41-905c-bf7924734ce6.png",
    title: "Serengeti Grasslands",
    subtitle:
      "Endless grasslands and wildlife roaming under wide Tanzanian skies",
    location: "Tanzania",
    animationPreset: "horizontalPan",
    overlayGradient:
      "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, rgba(218,165,32,0.15) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/736x/7b/57/7e/7b577ea3d79d41336090cafb48ca1bc0.jpg",
    fallback:
      "https://i.pinimg.com/1200x/8c/8d/39/8c8d391974e82e3a2c2422ee8775394b.jpg",
    title: "Ngorongoro Caldera Vista",
    subtitle:
      "Breathtaking crater views and rich wildlife habitats high in Tanzanian highlands",
    location: "Tanzania",
    animationPreset: "cinematicWide",
    overlayGradient:
      "linear-gradient(135deg, rgba(0,100,0,0.25) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/736x/10/51/94/1051943d2c780489c4e999436a06b4b3.jpg",
    fallback:
      "https://copilot.microsoft.com/th/id/BCO.580c7e63-7c54-4f45-91a8-6c837aa880ed.png",
    title: "Bwindi Rainforest",
    subtitle:
      "Mist‑covered rainforests rich with gorillas and biodiversity in Uganda",
    location: "Uganda",
    animationPreset: "verticalReveal",
    overlayGradient:
      "linear-gradient(180deg, rgba(0,50,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
  },
  {
    image:
      "https://i.pinimg.com/1200x/18/8c/c2/188cc2754c648e1f6426268a6ba5c382.jpg",
    fallback:
      "https://i.natgeofe.com/n/2c6a7c2d-5dcc-4c19-9707-5fd50222374c/Magashi_05-19-98e.JPG",
    title: "Akagera National Park",
    subtitle:
      "Open landscapes and wildlife safaris across eastern Rwanda's pristine wilderness",
    location: "Rwanda",
    animationPreset: "dynamicSweep",
    overlayGradient:
      "linear-gradient(45deg, rgba(0,0,0,0.45) 0%, rgba(16,185,129,0.15) 100%)",
  },
  {
    image:
      "https://res.cloudinary.com/doijjawna/image/upload/v1781342711/ChatGPT_Image_Jun_13_2026_11_24_57_AM_fu7nt6.png",
    fallback:
      "https://copilot.microsoft.com/th/id/BCO.db353217-b4b5-4d08-b747-001ccd69d7b9.png",
    title: "Amboseli & Kilimanjaro",
    subtitle:
      "Iconic African wildlife framed by majestic Mount Kilimanjaro in Rwanda",
    location: "Rwanda",
    animationPreset: "rotateZoom",
    overlayGradient:
      "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(135,206,235,0.15) 100%)",
  },
];

/* ═══════════════════════════════════════════════════════════
   ANIMATED LOCATION PIN
═══════════════════════════════════════════════════════════ */
const AnimatedLocationPin = ({ size = 16 }) => (
  <motion.div
    style={{
      position: "relative",
      width: size + 8,
      height: size + 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {[0, 0.8].map((delay, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1.5px solid rgba(16, 185, 129, ${0.4 - i * 0.1})`,
        }}
        animate={{
          scale: [1, 1.8 + i * 0.3, 2.2 + i * 0.3],
          opacity: [0.6 - i * 0.15, 0.2, 0],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeOut",
          delay,
        }}
      />
    ))}
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "relative",
        zIndex: 2,
        filter: "drop-shadow(0 2px 4px rgba(16,185,129,0.35))",
      }}
    >
      <defs>
        <linearGradient
          id="pinGradient"
          x1="5"
          y1="2"
          x2="19"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <motion.path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="url(#pinGradient)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="0.8"
      />
      <motion.circle
        cx="12"
        cy="9"
        r="3"
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="1.5"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.circle
        cx="12"
        cy="9"
        r="1.2"
        fill="rgba(255,255,255,0.9)"
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  </motion.div>
);

const Hero = () => {
  const slides = HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const { playVideo, isPlayerOpen } = useApp();

  const tourismVideos = [
    "eoTKXtrRjmY",
    "8YVlT7GFqzA",
    "86aGcUQq_1E",
    "0RZknKnFqOg",
    "wP4AAYn5tqY",
    "siqAfzwCVuw",
    "4cX_JIMJwGY",
    "eoTKXtrRjmY",
    "86aGcUQq_1E",
    "8YVlT7GFqzA",
  ];

  const slideAnimationPresets = {
    cinematicDrift: {
      initial: { scale: 1.2, x: "5%", y: "3%" },
      animate: { scale: 1, x: "-3%", y: "-2%" },
    },
    verticalReveal: {
      initial: { scale: 1.25, y: "8%" },
      animate: { scale: 1.05, y: "-5%" },
    },
    horizontalPan: {
      initial: { scale: 1.1, x: "-8%" },
      animate: { scale: 1.02, x: "5%" },
    },
    zoomOut: {
      initial: { scale: 1.3 },
      animate: { scale: 1 },
    },
    rotateZoom: {
      initial: { scale: 1.15, rotate: 2 },
      animate: { scale: 1, rotate: 0 },
    },
    parallaxDepth: {
      initial: { scale: 1.2, y: "10%" },
      animate: { scale: 1.02, y: "-3%" },
    },
    softFocus: {
      initial: { scale: 1.08 },
      animate: { scale: 1.02 },
    },
    dynamicSweep: {
      initial: { scale: 1.15, x: "8%", y: "-5%" },
      animate: { scale: 1, x: "-4%", y: "3%" },
    },
    risingHorizon: {
      initial: { scale: 1.2, y: "12%" },
      animate: { scale: 1, y: "-5%" },
    },
    cinematicWide: {
      initial: { scale: 1.25, x: "-5%" },
      animate: { scale: 1.02, x: "4%" },
    },
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const containerRef = useScrollTriggeredSlide(nextSlide, 300);

  useEffect(() => {
    if (isPlayerOpen) return;
    const timer = setInterval(nextSlide, 11000);
    return () => clearInterval(timer);
  }, [isPlayerOpen, nextSlide]);

  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      if (slide.fallback) {
        const fallbackImg = new Image();
        fallbackImg.src = slide.fallback;
      }
    });
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const handleWatchStory = () => {
    const randomIdx = Math.floor(Math.random() * tourismVideos.length);
    playVideo(tourismVideos[randomIdx], "Watching Altuvera Story");
  };

  const getCurrentAnimation = (index) => {
    const preset = slides[index].animationPreset;
    return (
      slideAnimationPresets[preset] || slideAnimationPresets.cinematicDrift
    );
  };

  const styles = {
    hero: {
      position: "relative",
      height: "100vh",
      minHeight: "800px",
      overflow: "hidden",
      backgroundColor: "#111",
    },
    slidesContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    slide: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
    },
    slideImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      willChange: "transform",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      pointerEvents: "none",
    },
    vignetteOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.35) 100%)",
      zIndex: 3,
      pointerEvents: "none",
    },
    pattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      zIndex: 4,
      pointerEvents: "none",
    },
    content: {
      position: "relative",
      zIndex: 10,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "0 24px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    taglineContainer: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px",
    },
    taglineLine: {
      width: "60px",
      height: "2px",
      background: "linear-gradient(90deg, transparent, #10B981, transparent)",
    },
    tagline: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      fontWeight: "600",
      color: "#10B981",
      letterSpacing: "4px",
      textTransform: "uppercase",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(36px, 6vw, 72px)",
      fontWeight: "700",
      color: "white",
      marginBottom: "24px",
      lineHeight: "1.1",
      textShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
      maxWidth: "900px",
    },
    subtitle: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "16px",
      maxWidth: "700px",
      lineHeight: "1.7",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
    },
    locationContainer: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "40px",
    },
    locationDivider: {
      width: "20px",
      height: "1.5px",
      background:
        "linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,0.15))",
      borderRadius: "1px",
    },
    locationText: {
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.92)",
      letterSpacing: "0.5px",
      textShadow: "0 1px 8px rgba(0,0,0,0.3)",
    },
    buttons: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    playButton: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px 32px",
      backgroundColor: "transparent",
      border: "2px solid white",
      borderRadius: "50px",
      color: "white",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
    playIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#059669",
      transition: "all 0.3s ease",
    },
    scrollIndicator: {
      position: "absolute",
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      color: "white",
      cursor: "pointer",
      zIndex: 10,
      background: "none",
      border: "none",
    },
    scrollText: {
      fontSize: "12px",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "2px",
      opacity: 0.8,
    },
    floatingElement: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 5,
    },
  };

  return (
    <section style={styles.hero} ref={containerRef}>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
          }
          .play-btn-hover:hover {
            background-color: white !important;
            color: #059669 !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .play-btn-hover:hover .play-icon-inner {
            background-color: #059669 !important;
            color: white !important;
            transform: scale(1.1);
          }
          .scroll-indicator-btn:hover {
            opacity: 0.7;
          }
          .scroll-indicator-btn {
            animation: bounce 2s infinite;
          }
        `}
      </style>

      {/* Floating Elements */}
      <motion.div
        style={{ ...styles.floatingElement, top: "10%", left: "-100px" }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        style={{ ...styles.floatingElement, bottom: "20%", right: "-100px" }}
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* SLIDES */}
      <div style={styles.slidesContainer}>
        <AnimatePresence initial={false}>
          {slides.map(
            (slide, index) =>
              index === currentSlide && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 1.2, ease: "easeInOut" },
                  }}
                  style={{
                    ...styles.slide,
                    zIndex: index === currentSlide ? 1 : 0,
                  }}
                >
                  <motion.img
                    src={imageErrors[index] ? slide.fallback : slide.image}
                    alt={slide.title}
                    onError={() => handleImageError(index)}
                    initial={getCurrentAnimation(index).initial}
                    animate={getCurrentAnimation(index).animate}
                    transition={{
                      duration: 12,
                      ease: "linear",
                    }}
                    style={styles.slideImage}
                  />
                  <div
                    style={{
                      ...styles.overlay,
                      background: slide.overlayGradient,
                    }}
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Static Overlays */}
      <div style={styles.vignetteOverlay} />
      <div style={styles.pattern} />

      {/* Content */}
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Tagline */}
            <motion.div
              style={styles.taglineContainer}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <motion.div
                style={styles.taglineLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <span style={styles.tagline}>
                True adventure in High Places & Deep Culture
              </span>
              <motion.div
                style={styles.taglineLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.div>

            {/* Title */}
            <div style={{ overflow: "hidden", marginBottom: "24px" }}>
              <motion.h1
                style={styles.title}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                key={`title-${currentSlide}`}
              >
                {slides[currentSlide].title}
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.p
              style={styles.subtitle}
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              key={`sub-${currentSlide}`}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Location */}
            <motion.div
              style={styles.locationContainer}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatedLocationPin size={16} />
              <div style={styles.locationDivider} />
              <span style={styles.locationText}>
                {slides[currentSlide].location}
              </span>
            </motion.div>

            {/* Buttons */}
            <motion.div
              style={styles.buttons}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  to="/destinations"
                  variant="primary"
                  size="large"
                  icon={<FiArrowRight size={18} />}
                >
                  Explore Destinations
                </Button>
              </motion.div>

              <motion.button
                style={styles.playButton}
                onClick={handleWatchStory}
                className="play-btn-hover"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div style={styles.playIcon} className="play-icon-inner">
                  <FiPlay size={16} />
                </div>
                Watch Our Story
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        style={styles.scrollIndicator}
        onClick={scrollToContent}
        className="scroll-indicator-btn"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        whileHover={{ scale: 1.1 }}
      >
        <span style={styles.scrollText}>Scroll Down</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FiChevronDown size={24} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;