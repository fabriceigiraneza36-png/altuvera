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

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { playVideo, openMap, isPlayerOpen } = useApp();

  const tourismVideos = [
    "eoTKXtrRjmY", // Wild Kenya Safari
    "8YVlT7GFqzA", // Serengeti Safari Tanzania
    "86aGcUQq_1E", // Maasai Mara Migration
    "0RZknKnFqOg", // East Africa Documentary
    "wP4AAYn5tqY", // Akagera National Park Rwanda
    "siqAfzwCVuw", // Zanzibar Coastal Safari
    "4cX_JIMJwGY", // Mount Kilimanjaro Expedition
    "eoTKXtrRjmY", // Wildlife of East Africa
    "86aGcUQq_1E", // The Big Five Safari
    "8YVlT7GFqzA", // Nature's Greatest Spectacle
  ];

  const slides = [
    // Original 4 slides with Pinterest images — UNTOUCHED
    {
      image:
        "https://i.pinimg.com/1200x/cc/22/42/cc2242dbd24507eca2cd4313ffbd5c72.jpg",
      fallback:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuP9o7T_O079eC2mp4oycAJ6Nr5RibfoESnQ&s",
      title: "Witness the Great Migration",
      subtitle:
        "Experience nature's greatest spectacle across the vast Serengeti and Maasai Mara plains",
      location: "Kenya & Tanzania",
      animation: { scale: [1, 1.15] },
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
      animation: { x: ["-5%", "5%"] },
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
      animation: { y: ["5%", "-5%"] },
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
      animation: { scale: [1.1, 1] },
    },

    // **New East Africa HD/4K Unsplash Images**
    {
      image:
        "https://images.squarespace-cdn.com/content/v1/57b88db03e00be38aec142b0/1526928305567-Y0MTKDAAGPS2IP0YXMSO/03_What_To_Do_In_Gisenyi_in_Lake_Kivu_Rwanda_Visiting_Gisenyi_HandZaround.jpg?format=1500w",
      fallback:
        "https://images.trvl-media.com/place/3000470585/420aa538-86d3-463e-ab29-6105311b6442.jpg",
      title: "Lake Kivu Sunrise in Rwanda",
      subtitle:
        "Serene dawn over Lake Kivu with misty waters and distant hills at sunrise",
      location: "Lake Kivu, Rwanda",
      animation: { scale: [1, 1.1] },
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
      animation: { x: ["-3%", "3%"] },
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
      animation: { y: ["-2%", "2%"] },
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
      animation: { rotate: [0, 7] },
    },
    {
      image:
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/26/6d/0c/views-from-the-western.jpg?h=1200&s=1&w=1200",
      fallback:
        "https://i.natgeofe.com/n/2c6a7c2d-5dcc-4c19-9707-5fd50222374c/Magashi_05-19-98e.JPG",
      title: "Akagera National Park",
      subtitle:
        "Open landscapes and wildlife safaris across eastern Rwanda’s pristine wilderness",
      location: "Rwanda",
      animation: { scale: [1, 1.05] },
    },
    {
      image:
        "https://i.pinimg.com/736x/3f/48/50/3f485098d9bf8b3a79fe2e6946ea0302.jpg",
      fallback:
        "https://www.explore.com/img/gallery/the-best-way-to-view-mount-kilimanjaro-in-kenya/l-intro-1673982083.jpg",
      title: "Amboseli & Kilimanjaro",
      subtitle:
        "Iconic African wildlife framed by majestic Mount Kilimanjaro in Kenya",
      location: "Kenya",
      animation: { skewX: [0, 8] },
    },
  ];

  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const containerRef = useScrollTriggeredSlide(nextSlide, 300);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  useEffect(() => {
    if (isPaused || isPlayerOpen) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, isPlayerOpen, nextSlide]);

  // Preload all images on component mount
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

  const styles = {
    hero: {
      position: "relative",
      height: "100vh",
      minHeight: "800px",
      overflow: "hidden",
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
      transition: "opacity 1.5s ease",
    },
    slideImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    pattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5,
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
      opacity: 0,
    },
    taglineLine: {
      width: "60px",
      height: "2px",
      backgroundColor: "#10B981",
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
      textShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
      maxWidth: "900px",
      opacity: 0,
    },
    subtitle: {
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: "16px",
      maxWidth: "700px",
      lineHeight: "1.7",
      opacity: 0,
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
      opacity: 0,
    },
    buttons: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "center",
      opacity: 0,
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
      gap: "12px",
      zIndex: 10,
    },
    indicator: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid transparent",
    },
    indicatorActive: {
      backgroundColor: "#10B981",
      transform: "scale(1.2)",
      border: "2px solid white",
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
      animation: "bounce 2s infinite",
      transition: "opacity 0.3s ease",
    },
    scrollText: {
      fontSize: "12px",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "2px",
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
      background:
        "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
      animation: "float 6s ease-in-out infinite",
      pointerEvents: "none",
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
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .play-btn-hover:hover {
            background-color: white !important;
            color: #059669 !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          }
          .play-btn-hover:hover .play-icon-inner {
            background-color: #059669 !important;
            color: white !important;
          }
          .map-btn-hover:hover {
            transform: translateY(-3px);
            background-color: rgba(16, 185, 129, 0.35) !important;
            box-shadow: 0 10px 20px rgba(16,185,129,0.2);
          }
          @media (max-width: 768px) {
            .hero-stats { display: none !important; }
          }
        `}
      </style>

      <div
        style={{ ...styles.floatingElement, top: "10%", left: "-100px" }}
      ></div>
      <div
        style={{
          ...styles.floatingElement,
          bottom: "20%",
          right: "-100px",
          animationDelay: "-3s",
        }}
      ></div>

      <div style={styles.slidesContainer}>
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              ...styles.slide,
              zIndex: 1
            }}
          >
            <motion.img
              src={
                imageErrors[currentSlide]
                  ? slides[currentSlide].fallback
                  : slides[currentSlide].image
              }
              alt={slides[currentSlide].title}
              onError={() => handleImageError(currentSlide)}
              initial={{
                scale: slides[currentSlide].animation.scale
                  ? slides[currentSlide].animation.scale[0]
                  : 1.1,
                x: slides[currentSlide].animation.x
                  ? slides[currentSlide].animation.x[0]
                  : 0,
                y: slides[currentSlide].animation.y
                  ? slides[currentSlide].animation.y[0]
                  : 0,
                rotate: slides[currentSlide].animation.rotate
                  ? slides[currentSlide].animation.rotate[0]
                  : 0
              }}
              animate={slides[currentSlide].animation}
              transition={{
                duration: 6,
                ease: "linear",
              }}
              style={styles.slideImage}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={styles.pattern}></div>

      <div style={styles.content}>
        <motion.div 
          style={styles.taglineContainer}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={styles.taglineLine}></div>
          <span style={styles.tagline}>
            True adventure in High & Deep Culture
          </span>
          <div style={styles.taglineLine}></div>
        </motion.div>

        <motion.h1
          style={styles.title}
          key={`title-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {slides[currentSlide].title}
        </motion.h1>

        <motion.p
          style={styles.subtitle}
          key={`sub-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {slides[currentSlide].subtitle}
        </motion.p>

        <motion.div
          style={styles.location}
          key={`loc-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span>📍</span> {slides[currentSlide].location}
        </motion.div>

        <motion.div 
          style={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button
            to="/destinations"
            variant="primary"
            size="large"
            icon={<FiArrowRight size={18} />}
          >
            Explore Destinations
          </Button>
          <button
            style={styles.playButton}
            onClick={handleWatchStory}
            className="play-btn-hover"
          >
            <div style={styles.playIcon} className="play-icon-inner">
              <FiPlay size={16} />
            </div>
            Watch Our Story
          </button>
          <button
            style={styles.mapButton}
            onClick={handleWatchMap}
            className="map-btn-hover"
          >
            <FiMap size={16} />
            Watch Live Map
          </button>
        </motion.div>
      </div>

      <div style={styles.slideIndicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={{
              ...styles.indicator,
              ...(currentSlide === index ? styles.indicatorActive : {}),
            }}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <button style={styles.scrollIndicator} onClick={scrollToContent}>
        <span style={styles.scrollText}>Scroll Down</span>
        <FiChevronDown size={24} />
      </button>

      <div style={styles.stats} className="hero-stats">
        {[
          { num: "10+", lab: "Countries" },
          { num: "500+", lab: "Destinations" },
          { num: "15K+", lab: "Happy Travelers" },
          { num: "98%", lab: "Satisfaction" },
        ].map((st, i) => (
          <div key={i} style={styles.stat}>
            <div style={styles.statNumber}>{st.num}</div>
            <div style={styles.statLabel}>{st.lab}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
