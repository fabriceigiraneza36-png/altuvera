// DestinationCard.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiPlay,
  FiMap,
  FiArrowRight,
  FiUsers,
  FiAward,
} from "react-icons/fi";
import { MdOutlineEco } from "react-icons/md";
import { useApp } from "../../context/AppContext";

// ═══════════════════════════════════════════════════════════════
// ULTRA DESTINATION CARD — Premium Travel Card Component
// Supreme Quality, Fully Responsive, Accessible
// ═══════════════════════════════════════════════════════════════

// Inject keyframes once
const injectKeyframes = () => {
  if (document.getElementById("destination-card-keyframes")) return;
  const style = document.createElement("style");
  style.id = "destination-card-keyframes";
  style.textContent = `
    @keyframes destCardShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes destCardPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }
    @keyframes destCardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes destCardHeartBeat {
      0% { transform: scale(1); }
      15% { transform: scale(1.3); }
      30% { transform: scale(1); }
      45% { transform: scale(1.15); }
      60% { transform: scale(1); }
    }
    @keyframes destCardRipple {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
};

// Format number with K suffix
const formatNumber = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Image Skeleton Component
const ImageSkeleton = memo(() => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(135deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)",
      backgroundSize: "200% 100%",
      animation: "destCardShimmer 1.8s infinite linear",
    }}
  />
));

// Action Button Component
const ActionButton = memo(({ icon: Icon, onClick, color, label, size = 40 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
    onClick?.(e);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: isHovered ? color : "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}
      aria-label={label}
    >
      {showRipple && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            animation: "destCardRipple 0.6s ease-out forwards",
          }}
        />
      )}
      <Icon size={size * 0.45} />
    </motion.button>
  );
});

// Navigation Arrow Component
const NavArrow = memo(({ direction, onClick, visible }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLeft = direction === "left";

  return (
    <motion.button
      initial={{ opacity: 0, x: isLeft ? -10 : 10 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : isLeft ? -10 : 10,
      }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: "14px",
        transform: "translateY(-50%)",
        width: "38px",
        height: "38px",
        borderRadius: "12px",
        border: "none",
        background: isHovered ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        color: "#065F46",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 15,
        boxShadow: isHovered
          ? "0 8px 24px rgba(0, 0, 0, 0.2)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: "all 0.25s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label={isLeft ? "Previous image" : "Next image"}
    >
      {isLeft ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
    </motion.button>
  );
});

// Feature Chip Component
const FeatureChip = memo(({ icon: Icon, text, variant = "default" }) => {
  const variants = {
    default: {
      bg: "#F0FDF4",
      border: "#D1FAE5",
      iconBg: "#ECFDF5",
      iconColor: "#059669",
      textColor: "#047857",
    },
    accent: {
      bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      border: "#A7F3D0",
      iconBg: "#059669",
      iconColor: "#FFFFFF",
      textColor: "#065F46",
    },
    subtle: {
      bg: "#F9FAFB",
      border: "#E5E7EB",
      iconBg: "#F3F4F6",
      iconColor: "#6B7280",
      textColor: "#4B5563",
    },
  };

  const v = variants[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        background: v.bg,
        borderRadius: "12px",
        border: `1px solid ${v.border}`,
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          background: v.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={14} style={{ color: v.iconColor }} />
      </div>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: v.textColor,
          lineHeight: 1.3,
        }}
      >
        {text}
      </span>
    </div>
  );
});

// Rating Badge Component
const RatingBadge = memo(({ rating, reviews }) => (
  <motion.div
    initial={{ scale: 0, rotate: -10 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
    style={{
      position: "absolute",
      bottom: "-28px",
      right: "20px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "12px 16px",
      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      borderRadius: "16px",
      boxShadow: "0 8px 24px rgba(5, 150, 105, 0.4), 0 0 0 4px white",
      zIndex: 25,
    }}
  >
    <FiStar size={18} style={{ color: "#FCD34D", fill: "#FCD34D" }} />
    <span
      style={{
        fontSize: "16px",
        fontWeight: 700,
        color: "white",
        letterSpacing: "-0.02em",
      }}
    >
      {rating}
    </span>
    {reviews && (
      <span
        style={{
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.8)",
          marginLeft: "2px",
        }}
      >
        ({formatNumber(reviews)})
      </span>
    )}
  </motion.div>
));

// Like Button Component
const LikeButton = memo(({ isLiked, likes, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    }
    onToggle();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        background: isLiked ? "rgba(239, 68, 68, 0.08)" : "transparent",
        border: `1px solid ${isLiked ? "rgba(239, 68, 68, 0.2)" : "#E5E7EB"}`,
        borderRadius: "100px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      aria-label={isLiked ? "Unlike destination" : "Like destination"}
      aria-pressed={isLiked}
    >
      <FiHeart
        size={16}
        style={{
          color: isLiked ? "#EF4444" : "#9CA3AF",
          fill: isLiked ? "#EF4444" : "none",
          animation: isAnimating ? "destCardHeartBeat 0.8s ease" : "none",
          transition: "all 0.3s ease",
        }}
      />
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: isLiked ? "#EF4444" : "#6B7280",
          minWidth: "32px",
        }}
      >
        {formatNumber(likes)}
      </span>
    </motion.button>
  );
});

// Main CTA Button Component
const CTAButton = memo(({ to, isHovered }) => (
  <Link
    to={to}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "16px 20px",
      background: isHovered
        ? "linear-gradient(135deg, #059669 0%, #10B981 100%)"
        : "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
      borderRadius: "16px",
      border: `1px solid ${isHovered ? "transparent" : "#A7F3D0"}`,
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      textDecoration: "none",
      boxShadow: isHovered
        ? "0 8px 24px rgba(5, 150, 105, 0.3)"
        : "none",
    }}
    aria-label="Discover this destination"
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: isHovered ? "white" : "#047857",
          transition: "color 0.3s ease",
        }}
      >
        Discover Destination
      </span>
      <span
        style={{
          fontSize: "12px",
          color: isHovered ? "rgba(255,255,255,0.8)" : "#10B981",
          transition: "color 0.3s ease",
        }}
      >
        View tours & experiences
      </span>
    </div>
    <motion.div
      animate={{ x: isHovered ? 4 : 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: isHovered ? "rgba(255,255,255,0.2)" : "#D1FAE5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.3s ease",
      }}
    >
      <FiArrowRight
        size={18}
        style={{
          color: isHovered ? "white" : "#059669",
          transition: "color 0.3s ease",
        }}
      />
    </motion.div>
  </Link>
));

// Type Badge Component
const TypeBadge = memo(({ type, isEcoFriendly }) => (
  <div
    style={{
      position: "absolute",
      top: "16px",
      left: "16px",
      display: "flex",
      gap: "8px",
      zIndex: 15,
    }}
  >
    <motion.span
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        padding: "8px 14px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: 700,
        color: "#047857",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
      }}
    >
      {type}
    </motion.span>
    {isEcoFriendly && (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
        }}
        title="Eco-friendly destination"
      >
        <MdOutlineEco size={18} style={{ color: "white" }} />
      </motion.span>
    )}
  </div>
));

// Dot Indicators Component
const DotIndicators = memo(({ total, current, onSelect }) => {
  if (total <= 1) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "6px",
        padding: "6px 10px",
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        borderRadius: "100px",
        zIndex: 15,
      }}
    >
      {Array.from({ length: Math.min(total, 8) }).map((_, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(idx);
          }}
          style={{
            width: idx === current ? "20px" : "6px",
            height: "6px",
            borderRadius: "100px",
            border: "none",
            background:
              idx === current
                ? "linear-gradient(135deg, #34D399 0%, #10B981 100%)"
                : "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            padding: 0,
          }}
          aria-label={`Go to image ${idx + 1}`}
        />
      ))}
    </div>
  );
});

// Stats Bar Component
const StatsBar = memo(({ travelers, duration }) => (
  <div
    style={{
      display: "flex",
      gap: "16px",
      padding: "12px 0",
      borderBottom: "1px solid #F3F4F6",
      marginBottom: "16px",
    }}
  >
    {travelers && (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <FiUsers size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
          {formatNumber(travelers)}+ travelers
        </span>
      </div>
    )}
    {duration && (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <FiClock size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
          {duration}
        </span>
      </div>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <FiAward size={14} style={{ color: "#F59E0B" }} />
      <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
        Top Rated
      </span>
    </div>
  </div>
));

// Main Component
const DestinationCard = ({ destination, index = 0, variant = "default" }) => {
  // Inject keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Image handling
  const images = useMemo(() => {
    const imgs = destination.images || [destination.heroImage];
    const safe = imgs.filter(Boolean);
    return safe.length
      ? safe
      : ["https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"];
  }, [destination]);

  const [current, setCurrent] = useState(0);
  const [likes, setLikes] = useState(() => Math.floor(Math.random() * 500) + 150);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const { playVideo, openMap } = useApp();

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return;
    const intervalTime = 5500 + (index % 5) * 700;
    const interval = setInterval(() => {
      setImageLoaded(false);
      setCurrent((prev) => (prev + 1) % images.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [images.length, index]);

  // Handlers
  const navigateImage = useCallback(
    (direction, e) => {
      e?.preventDefault();
      e?.stopPropagation();
      setImageLoaded(false);
      setCurrent((prev) =>
        direction === "next"
          ? (prev + 1) % images.length
          : (prev - 1 + images.length) % images.length
      );
    },
    [images.length]
  );

  const toggleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  // Video data
  const tourismVideos = useMemo(
    () => [
      "eoTKXtrRjmY",
      "8YVlT7GFqzA",
      "86aGcUQq_1E",
      "0RZknKnFqOg",
      "wP4AAYn5tqY",
    ],
    []
  );

  const handlePlayVideo = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const randomIdx = Math.floor(Math.random() * tourismVideos.length);
      playVideo(tourismVideos[randomIdx], `${destination.name} Experience`);
    },
    [playVideo, destination.name, tourismVideos]
  );

  const handleOpenMap = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMap({
        title: `${destination.name} Map View`,
        lat: destination?.coordinates?.lat,
        lng: destination?.coordinates?.lng,
        query: destination?.location || destination?.countryId || destination?.name,
        zoom: 9,
      });
    },
    [openMap, destination]
  );

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      navigateImage(diff > 0 ? "next" : "prev");
    }
    setTouchStart(null);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800";
  const currentImage = imageError ? fallbackImage : images[current];

  // Features list
  const features = useMemo(
    () => [
      {
        icon: FiMapPin,
        text: destination.location || "East Africa",
        variant: "default",
      },
      {
        icon: FiClock,
        text: destination.duration || "Flexible Duration",
        variant: "subtle",
      },
      {
        icon: MdOutlineEco,
        text: "Eco-Conservation Focus",
        variant: "accent",
      },
    ],
    [destination]
  );

  // Styles
  const styles = {
    card: {
      position: "relative",
      background: "var(--ui-surface, #FFFFFF)",
      borderRadius: isMobile ? "20px" : "24px",
      overflow: "hidden",
      boxShadow: isHovered
        ? "var(--ui-shadow-lg, 0 26px 70px rgba(2, 44, 34, 0.16))"
        : "var(--ui-shadow-md, 0 10px 30px rgba(2, 44, 34, 0.12))",
      border: "1px solid var(--ui-border, rgba(2, 44, 34, 0.12))",
      transition:
        "transform 500ms var(--ui-ease-out, cubic-bezier(0.22, 1, 0.36, 1)), box-shadow 500ms var(--ui-ease-out, cubic-bezier(0.22, 1, 0.36, 1))",
      transform: isHovered && !isMobile ? "translateY(-8px)" : "translateY(0)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      cursor: "pointer",
    },
    imageContainer: {
      position: "relative",
      height: isMobile ? "220px" : "clamp(240px, 28vw, 280px)",
      overflow: "hidden",
      flexShrink: 0,
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
      transform: isHovered ? "scale(1.08)" : "scale(1)",
    },
    imageOverlay: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)",
      pointerEvents: "none",
      zIndex: 5,
    },
    content: {
      padding: isMobile ? "28px 20px 20px" : "32px 24px 24px",
      paddingTop: "40px",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "12px",
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? "20px" : "22px",
      fontWeight: 700,
      color: "#111827",
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
      margin: 0,
      transition: "color 0.3s ease",
      flex: 1,
    },
    description: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: 1.7,
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
      marginBottom: "20px",
    },
    actionButtons: {
      position: "absolute",
      top: "16px",
      right: "16px",
      display: "flex",
      gap: "8px",
      zIndex: 15,
    },
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
      transformOrigin: "left",
      transform: `scaleX(${isHovered ? 1 : 0})`,
      transition: "transform 0.4s ease",
      zIndex: 30,
    },
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="article"
      aria-label={`${destination.name} destination card`}
    >
      {/* Image Section */}
      <div style={styles.imageContainer}>
        {/* Loading Skeleton */}
        {!imageLoaded && <ImageSkeleton />}

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`${currentImage}-${current}`}
            src={currentImage}
            alt={destination.name}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            loading="lazy"
            decoding="async"
            style={styles.image}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div style={styles.imageOverlay} />

        {/* Type Badge */}
        <TypeBadge
          type={destination.type || "Adventure"}
          isEcoFriendly={destination.isEcoFriendly}
        />

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <ActionButton
            icon={FiPlay}
            onClick={handlePlayVideo}
            color="#059669"
            label="Watch video"
          />
          <ActionButton
            icon={FiMap}
            onClick={handleOpenMap}
            color="#0EA5E9"
            label="View on map"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && !isMobile && (
          <>
            <NavArrow
              direction="left"
              onClick={(e) => navigateImage("prev", e)}
              visible={isHovered}
            />
            <NavArrow
              direction="right"
              onClick={(e) => navigateImage("next", e)}
              visible={isHovered}
            />
          </>
        )}

        {/* Dot Indicators */}
        <DotIndicators
          total={images.length}
          current={current}
          onSelect={(idx) => {
            setImageLoaded(false);
            setCurrent(idx);
          }}
        />

        {/* Rating Badge */}
        <RatingBadge
          rating={destination.rating || "4.9"}
          reviews={destination.reviews || Math.floor(Math.random() * 500) + 100}
        />
      </div>

      {/* Content Section */}
      <div style={styles.content}>
        {/* Header with Title and Like */}
        <div style={styles.header}>
          <h3
            style={{
              ...styles.title,
              color: isHovered ? "#059669" : "#111827",
            }}
          >
            {destination.name}
          </h3>
          <LikeButton isLiked={isLiked} likes={likes} onToggle={toggleLike} />
        </div>

        {/* Stats Bar */}
        <StatsBar
          travelers={destination.travelers || Math.floor(Math.random() * 5000) + 1000}
          duration={destination.duration}
        />

        {/* Description */}
        <p style={styles.description}>{destination.description}</p>

        {/* Features */}
        <div style={styles.features}>
          {features.map((feature, idx) => (
            <FeatureChip
              key={idx}
              icon={feature.icon}
              text={feature.text}
              variant={feature.variant}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ marginTop: "auto" }}>
          <CTAButton
            to={`/destination/${destination.id}`}
            isHovered={isHovered}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBar} />
    </motion.article>
  );
};

export default memo(DestinationCard);
