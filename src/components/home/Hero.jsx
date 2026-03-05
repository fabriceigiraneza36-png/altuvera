import React, { useState, useEffect, useCallback } from "react";
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
     // https://i.pinimg.com/1200x/cc/22/42/cc2242dbd24507eca2cd4313ffbd5c72.jpg
      image: "https://i.pinimg.com/1200x/cc/22/42/cc2242dbd24507eca2cd4313ffbd5c72.jpg",
      fallback: "https://i.pinimg.com/1200x/cc/22/42/cc2242dbd24507eca2cd4313ffbd5c72.jpg",
      title: "Witness the Great Migration",
      subtitle: "Experience nature's greatest spectacle across the vast Serengeti and Maasai Mara plains",
      location: "Kenya & Tanzania",
      animationPreset: "cinematicDrift",
      overlayGradient: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(16,185,129,0.15) 100%)",
    },
    {
      image: "https://i.pinimg.com/1200x/f7/d8/79/f7d879d6a1486f026ba9ba9c30a3a125.jpg",
      fallback: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=3840",
      title: "Meet the Mountain Gorillas",
      subtitle: "An intimate encounter with our closest relatives in their misty forest home",
      location: "Rwanda & Uganda",
      animationPreset: "softFocus",
      overlayGradient: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(34,85,51,0.35) 100%)",
    },
    {
      image: "https://pictures.altai-travel.com/1920x1040/kilimanjaro-national-park-tanzania-istock-3490.jpg",
      fallback: "https://www.andbeyond.com/wp-content/uploads/sites/5/Elephants-and-mount-kilimanjaro.jpg",
      title: "Summit Mount Kilimanjaro",
      subtitle: "Conquer Africa's highest peak and stand at the legendary roof of the continent",
      location: "Tanzania",
      animationPreset: "risingHorizon",
      overlayGradient: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 60%, rgba(255,255,255,0.05) 100%)",
    },
    {
      image: "https://i.pinimg.com/1200x/0a/43/ca/0a43cafc5ea639697427a07f078506e3.jpg",
      fallback: "https://images.unsplash.com/photo-1529876751255-1c6d8f09ff1d?auto=format&fit=crop&w=3840",
      title: "Discover Ancient Wonders",
      subtitle: "Explore the rock-hewn churches of Lalibela and Ethiopia's 3,000-year timeless heritage",
      location: "Ethiopia",
      animationPreset: "zoomOut",
      overlayGradient: "linear-gradient(45deg, rgba(139,69,19,0.35) 0%, rgba(0,0,0,0.45) 100%)",
    },
    {
      image: "https://images.squarespace-cdn.com/content/v1/57b88db03e00be38aec142b0/1526928305567-Y0MTKDAAGPS2IP0YXMSO/03_What_To_Do_In_Gisenyi_in_Lake_Kivu_Rwanda_Visiting_Gisenyi_HandZaround.jpg?format=1500w",
      fallback: "https://images.trvl-media.com/place/3000470585/420aa538-86d3-463e-ab29-6105311b6442.jpg",
      title: "Lake Kivu Sunrise in Rwanda",
      subtitle: "Serene dawn over Lake Kivu with misty waters and distant hills at sunrise",
      location: "Lake Kivu, Rwanda",
      animationPreset: "parallaxDepth",
      overlayGradient: "linear-gradient(180deg, rgba(255,140,0,0.15) 0%, rgba(0,0,0,0.5) 100%)",
    },
    {
      image: "https://yellowzebrasafaris.com/media/46316/serengeti-safaris-tanzania-wildlife-adventures.jpg?format=jpg&height=1024&v=1da5e0fb8b7e1f0&width=2048",
      fallback: "https://www.serengeti.com/assets/img/serengeti-national-park-savannah-landscape.jpg",
      title: "Serengeti Grasslands",
      subtitle: "Endless grasslands and wildlife roaming under wide Tanzanian skies",
      location: "Tanzania",
      animationPreset: "horizontalPan",
      overlayGradient: "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, rgba(218,165,32,0.15) 100%)",
    },
    {
      image: "https://img1.wsimg.com/isteam/ip/29cc5507-095f-4b8e-ad81-fae5576e3852/GettyImages-148679836-5b03d89030371300373c5135.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1280",
      fallback: "https://i.pinimg.com/1200x/8c/8d/39/8c8d391974e82e3a2c2422ee8775394b.jpg",
      title: "Ngorongoro Caldera Vista",
      subtitle: "Breathtaking crater views and rich wildlife habitats high in Tanzanian highlands",
      location: "Tanzania",
      animationPreset: "cinematicWide",
      overlayGradient: "linear-gradient(135deg, rgba(0,100,0,0.25) 0%, rgba(0,0,0,0.5) 100%)",
    },
    {
      image: "https://ugandarwandagorillatours.com/wp-content/uploads/2019/02/bwindi-forest-uganda-gorilla-safaris.jpg",
      fallback: "https://i.pinimg.com/1200x/1e/5b/d2/1e5bd2291f7be957992fbc3c13a8f9a2.jpg",
      title: "Bwindi Rainforest",
      subtitle: "Mist‑covered rainforests rich with gorillas and biodiversity in Uganda",
      location: "Uganda",
      animationPreset: "verticalReveal",
      overlayGradient: "linear-gradient(180deg, rgba(0,50,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
    },
    {
      image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/26/6d/0c/views-from-the-western.jpg?h=1200&s=1&w=1200",
      fallback: "https://i.natgeofe.com/n/2c6a7c2d-5dcc-4c19-9707-5fd50222374c/Magashi_05-19-98e.JPG",
      title: "Akagera National Park",
      subtitle: "Open landscapes and wildlife safaris across eastern Rwanda's pristine wilderness",
      location: "Rwanda",
      animationPreset: "dynamicSweep",
      overlayGradient: "linear-gradient(45deg, rgba(0,0,0,0.45) 0%, rgba(16,185,129,0.15) 100%)",
    },
    {
      image: "https://i.pinimg.com/736x/3f/48/50/3f485098d9bf8b3a79fe2e6946ea0302.jpg",
      fallback: "https://www.explore.com/img/gallery/the-best-way-to-view-mount-kilimanjaro-in-kenya/l-intro-1673982083.jpg",
      title: "Amboseli & Kilimanjaro",
      subtitle: "Iconic African wildlife framed by majestic Mount Kilimanjaro in Kenya",
      location: "Kenya",
      animationPreset: "rotateZoom",
      overlayGradient: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 50%, rgba(135,206,235,0.15) 100%)",
    },
  ];

const Hero = () => {
  const slides = HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const { playVideo, openMap, isPlayerOpen } = useApp();

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

  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const containerRef = useScrollTriggeredSlide(nextSlide, 300);

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  useEffect(() => {
    if (isPaused || isPlayerOpen) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [isPaused, isPlayerOpen, nextSlide]);

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

  const handleWatchMap = () => {
    openMap({
      title: "East Africa Live Explorer",
      lat: -1.95,
      lng: 35.9,
      zoom: 5,
      query: "East Africa",
    });
  };

  const getCurrentAnimation = (index) => {
    const preset = slides[index].animationPreset;
    return slideAnimationPresets[preset] || slideAnimationPresets.cinematicDrift;
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
      background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.35) 100%)",
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
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "16px",
      maxWidth: "700px",
      lineHeight: "1.7",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
    },
    location: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "50px",
      color: "#10B981",
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "40px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
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
    mapButton: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "16px 28px",
      backgroundColor: "rgba(16, 185, 129, 0.16)",
      border: "1px solid rgba(255,255,255,0.36)",
      borderRadius: "50px",
      color: "white",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backdropFilter: "blur(8px)",
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
    slideIndicators: {
      position: "absolute",
      bottom: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "8px",
      zIndex: 10,
    },
    indicator: {
      width: "32px",
      height: "4px",
      borderRadius: "2px",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
      position: "relative",
      overflow: "hidden",
    },
    indicatorActive: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      width: "48px",
    },
    indicatorProgress: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      backgroundColor: "#10B981",
      borderRadius: "2px",
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
    stats: {
      position: "absolute",
      bottom: "40px",
      left: "40px",
      right: "40px",
      display: "none",
      justifyContent: "space-between",
      zIndex: 10,
      maxWidth: "1400px",
      margin: "0 auto",
    },
    stat: { textAlign: "left" },
    statNumber: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "42px",
      fontWeight: "700",
      color: "white",
    },
    statLabel: {
      fontSize: "14px",
      color: "rgba(255, 255, 255, 0.7)",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    floatingElement: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
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
          .map-btn-hover:hover {
            transform: translateY(-3px);
            background-color: rgba(16, 185, 129, 0.35) !important;
            box-shadow: 0 10px 30px rgba(16,185,129,0.3);
          }
          .indicator-btn:hover {
            background-color: rgba(255, 255, 255, 0.5);
          }
          .scroll-indicator-btn:hover {
            opacity: 0.7;
          }
          .scroll-indicator-btn {
            animation: bounce 2s infinite;
          }
          @media (max-width: 768px) {
            .hero-stats { display: none !important; }
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

      {/* SLIDES - Cross-fade without black screen */}
      <div style={styles.slidesContainer}>
        <AnimatePresence initial={false}>
          {slides.map((slide, index) => (
            index === currentSlide && (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeInOut" },
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
                    duration: 7,
                    ease: "linear",
                  }}
                  style={styles.slideImage}
                />
                {/* Slide-specific gradient overlay */}
                <div
                  style={{
                    ...styles.overlay,
                    background: slide.overlayGradient,
                  }}
                />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Static Overlays */}
      <div style={styles.vignetteOverlay} />
      <div style={styles.pattern} />

      {/* Content with smooth transitions */}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div
                style={styles.taglineLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <span style={styles.tagline}>
                True adventure in High & Deep Culture
              </span>
              <motion.div
                style={styles.taglineLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              style={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {slides[currentSlide].title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              style={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Location */}
            <motion.div
              style={styles.location}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📍
              </motion.span>
              {slides[currentSlide].location}
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

      {/* Slide Indicators with Progress */}
      <div style={styles.slideIndicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            className="indicator-btn"
            style={{
              ...styles.indicator,
              ...(currentSlide === index ? styles.indicatorActive : {}),
            }}
            onClick={() => goToSlide(index)}
          >
            {currentSlide === index && !isPaused && !isPlayerOpen && (
              <motion.div
                style={styles.indicatorProgress}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
                key={`progress-${currentSlide}`}
              />
            )}
          </button>
        ))}
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

      {/* Stats */}
      <div style={styles.stats} className="hero-stats">
        {[
          { num: "2+", lab: "Countries" },
          { num: "500+", lab: "Destinations" },
          { num: "15K+", lab: "Happy Travelers" },
          { num: "98%", lab: "Satisfaction" },
        ].map((st, i) => (
          <motion.div
            key={i}
            style={styles.stat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + i * 0.15 }}
          >
            <div style={styles.statNumber}>{st.num}</div>
            <div style={styles.statLabel}>{st.lab}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
