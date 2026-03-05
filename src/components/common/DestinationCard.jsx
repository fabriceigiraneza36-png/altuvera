import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiPlay,
  FiMap,
  FiArrowRight,
} from "react-icons/fi";
import { MdOutlineEco } from "react-icons/md";
import { useApp } from "../../context/AppContext";

const DestinationCard = ({ destination, index }) => {
  const images = destination.images || [destination.heroImage];
  const safeImages = images.filter(Boolean).length
    ? images.filter(Boolean)
    : ["https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"];
  const [current, setCurrent] = useState(0);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { playVideo, openMap } = useApp();

  const tourismVideos = [
    "eoTKXtrRjmY",
    "8YVlT7GFqzA",
    "86aGcUQq_1E",
    "0RZknKnFqOg",
    "wP4AAYn5tqY",
    "8YVlT7GFqzA",
    "eoTKXtrRjmY",
    "86aGcUQq_1E",
  ];

  const [imageError, setImageError] = useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800";

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;
    const intervalTime = 5000 + (index % 6) * 800;
    const interval = setInterval(() => {
      setImageLoaded(false);
      setCurrent((prev) => (prev + 1) % safeImages.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [safeImages.length, index]);

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setCurrent((prev) => (prev + 1) % safeImages.length);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageLoaded(false);
    setCurrent((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handlePlayVideo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const randomIdx = Math.floor(Math.random() * tourismVideos.length);
    playVideo(tourismVideos[randomIdx], `${destination.name} Experience`);
  };

  const handleOpenMap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMap({
      title: `${destination.name} Map View`,
      lat: destination?.coordinates?.lat,
      lng: destination?.coordinates?.lng,
      query:
        destination?.location || destination?.countryId || destination?.name,
      zoom: 9,
    });
  };

  const styles = {
    card: {
      position: "relative",
      backgroundColor: "white",
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: isHovered
        ? "0 0 60px rgba(5, 150, 105, 0.25)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      border: `1px solid ${isHovered ? "#A7F3D0" : "#E5E7EB"}`,
      transform: isHovered ? "translateY(-12px)" : "translateY(0)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      cursor: "pointer",
    },
    imageContainer: {
      position: "relative",
      height: "clamp(220px, 30vw, 260px)",
      overflow: "hidden",
      flexShrink: 0,
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHovered ? "scale(1.1)" : "scale(1)",
    },
    badge: {
      position: "absolute",
      top: "16px",
      left: "16px",
      padding: "8px 16px",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "700",
      color: "#047857",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      zIndex: 10,
    },
    iconContainer: {
      position: "absolute",
      bottom: "-30px",
      right: "24px",
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 8px 24px rgba(5, 150, 105, 0.35)`,
      zIndex: 20,
      transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHovered
        ? "scale(1.1) rotate(-5deg)"
        : "scale(1) rotate(0deg)",
      color: "white",
    },
    content: {
      padding: "32px 28px",
      paddingTop: "36px",
      backgroundColor: "white",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: "24px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "12px",
      lineHeight: "1.3",
      transition: "0.3s ease",
    },
    description: {
      fontSize: "15px",
      color: "#6B7280",
      lineHeight: "1.7",
      marginBottom: "20px",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    features: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginBottom: "28px",
    },
    feature: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "14px",
      color: "#4B5563",
    },
    featureIcon: {
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      backgroundColor: "#ECFDF5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#059669",
      flexShrink: 0,
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "14px 20px",
      backgroundColor: isHovered ? "#059669" : "#ECFDF5",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      textDecoration: "none",
      marginTop: "auto",
    },
    buttonText: {
      fontSize: "14px",
      fontWeight: "600",
      color: isHovered ? "white" : "#047857",
      transition: "0.3s ease",
    },
    buttonIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      backgroundColor: isHovered ? "rgba(255,255,255,0.2)" : "#D1FAE5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: isHovered ? "white" : "#059669",
      transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isHovered ? "translateX(4px)" : "translateX(0)",
    },
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: "4px",
      backgroundColor: "#10B981",
      width: isHovered ? "100%" : "0%",
      transition: "width 0.4s ease",
    },
  };

  const featureList = [
    {
      icon: <FiMapPin size={12} strokeWidth={3} />,
      text: destination.location || "East Africa",
    },
    {
      icon: <FiClock size={12} strokeWidth={3} />,
      text: destination.duration || "Flexible",
    },
    {
      icon: <MdOutlineEco size={12} strokeWidth={3} />,
      text: "Eco-Conservation",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageContainer}>
        {!imageLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#e5e7eb",
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite linear",
              zIndex: 1,
              borderRadius: "24px 24px 0 0",
            }}
          >
            <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={imageError ? fallbackImage : safeImages[current]}
            alt={destination.name}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            loading="lazy"
            style={styles.image}
          />
        </AnimatePresence>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)",
            pointerEvents: "none",
          }}
        />

        <span style={styles.badge}>{destination.type || "Adventure"}</span>

        {/* Video & Map Buttons */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <button
            onClick={handlePlayVideo}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FiPlay size={18} />
          </button>
          <button
            onClick={handleOpenMap}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#0EA5E9";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FiMap size={16} />
          </button>
        </div>

        {/* Navigation arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                opacity: isHovered ? 1 : 0,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "#065f46",
              }}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                opacity: isHovered ? 1 : 0,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "#065f46",
              }}
            >
              <FiChevronRight size={20} />
            </button>

            {/* Dots */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "16px",
                transform: "translateX(-50%)",
                zIndex: 16,
                display: "flex",
                gap: "6px",
              }}
            >
              {safeImages.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    width: idx === current ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background:
                      idx === current
                        ? "rgba(16,185,129,0.95)"
                        : "rgba(255,255,255,0.62)",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          </>
        )}

        <div style={styles.iconContainer}>
          <FiStar size={20} />
          <span
            style={{ fontSize: "14px", marginLeft: "4px", fontWeight: "bold" }}
          >
            {destination.rating || "5.0"}
          </span>
        </div>
      </div>

      <div style={styles.content}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h3 style={styles.title}>{destination.name}</h3>
          <div
            onClick={toggleLike}
            style={{
              cursor: "pointer",
              color: isLiked ? "#ef4444" : "#9CA3AF",
              display: "flex",
              alignItems: "center",
              marginTop: "6px",
            }}
          >
            <FiHeart
              style={{ fill: isLiked ? "#ef4444" : "none", marginRight: "4px" }}
              size={18}
            />
            <span style={{ fontSize: "14px", fontWeight: "600" }}>{likes}</span>
          </div>
        </div>

        <p style={styles.description}>{destination.description}</p>

        <div style={styles.features}>
          {featureList.map((feature, idx) => (
            <div key={idx} style={styles.feature}>
              <span style={styles.featureIcon}>{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <Link to={`/destination/${destination.id}`} style={styles.button}>
          <span style={styles.buttonText}>Discover Destination</span>
          <span style={styles.buttonIcon}>
            <FiArrowRight size={16} />
          </span>
        </Link>
      </div>

      <div style={styles.progressBar} />
    </motion.div>
  );
};

export default DestinationCard;
