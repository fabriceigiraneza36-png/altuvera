// src/pages/Services.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
// GREEN-WHITE ONLY THEME
// ============================================================================

const THEME = {
  colors: {
    primary: {
      50: "#F0FDF4",
      100: "#DCFCE7",
      200: "#BBF7D0",
      300: "#86EFAC",
      400: "#177339",
      500: "#257341",
      600: "#169143",
      700: "#15803D",
      800: "#166534",
      900: "#14532D",
      950: "#052E16",
    },
    white: "#FFFFFF",
    offWhite: "#FAFFFE",
    lightGreen: "#F0FDF4",
    paleGreen: "#E8F8ED",
    textDark: "#14532D",
    textMedium: "#166534",
    textBody: "#1C6E3A",
    textMuted: "#4A9B6B",
    textLight: "#6BBF8A",
    border: "#D1FAE5",
    borderLight: "#E8F8ED",
    overlay: "rgba(5, 46, 22, 0.85)",
  },
  fonts: {
    heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 3px rgba(22,163,74,0.06), 0 1px 2px rgba(22,163,74,0.04)",
    md: "0 4px 12px rgba(22,163,74,0.08), 0 2px 4px rgba(22,163,74,0.04)",
    lg: "0 12px 24px rgba(22,163,74,0.1), 0 4px 8px rgba(22,163,74,0.04)",
    xl: "0 20px 40px rgba(22,163,74,0.12), 0 8px 16px rgba(22,163,74,0.06)",
    "2xl": "0 28px 56px rgba(22,163,74,0.15)",
    glow: "0 0 40px rgba(22,163,74,0.12)",
    cardHover:
      "0 24px 48px rgba(22,163,74,0.14), 0 0 0 1px rgba(22,163,74,0.08)",
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "400ms cubic-bezier(0.22, 1, 0.36, 1)",
    spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};

// ============================================================================
// DATA
// ============================================================================

const ROTATING_HERO_TEXTS = [
  "Unforgettable journeys crafted with precision",
  "Expert-guided adventures across East Africa",
  "Luxury meets authentic wilderness experience",
  "Personalized itineraries for every traveler",
  "Where dreams become extraordinary memories",
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery Call",
    icon: FiMessageCircle,
    descriptions: [
      "Share your travel dreams and preferences",
      "Discuss budget, dates, and group size",
      "Get expert recommendations instantly",
    ],
  },
  {
    step: "02",
    title: "Custom Itinerary",
    icon: FiCalendar,
    descriptions: [
      "Receive a tailored travel blueprint",
      "Every detail designed around you",
      "Handpicked accommodations and routes",
    ],
  },
  {
    step: "03",
    title: "Fine-Tuning",
    icon: FiCompass,
    descriptions: [
      "Refine every detail to perfection",
      "Add special requests and surprises",
      "Finalize your dream itinerary",
    ],
  },
  {
    step: "04",
    title: "Adventure Time",
    icon: FiMapPin,
    descriptions: [
      "Embark with 24/7 ground support",
      "Expert guides at every destination",
      "Create memories that last forever",
    ],
  },
];

const WHY_CHOOSE_US = [
  {
    icon: FiAward,
    title: "Expert Local Guides",
    stat: "5+",
    statLabel: "Expert Guides",
    descriptions: [
      "Our guides bring decades of combined field experience across diverse African terrains and ecosystems.",
      "Each team member is a certified wildlife and safety expert committed to providing a secure and educational journey.",
      "They share deep regional cultural knowledge and hidden stories that provide an authentic perspective of every destination.",
    ],
  },
  {
    icon: FiShield,
    title: "Safety Guaranteed",
    stat: "100%",
    statLabel: "Safety Record",
    descriptions: [
      "We implement rigorous comprehensive safety protocols that strictly adhere to the highest international travel standards.",
      "Full premium insurance coverage is included in every booking to ensure you can explore with absolute peace of mind.",
      "Our emergency support systems are active 24/7 with a dedicated response team ready to assist you at any moment.",
    ],
  },
  {
    icon: FiHeart,
    title: "Personalized Care",
    stat: "5+",
    statLabel: "Happy Travelers",
    descriptions: [
      "Every itinerary is meticulously tailored to match your unique travel style, interests, and personal pace.",
      "We specialize in designing unique experiences that go beyond the ordinary to create life-changing memories.",
      "Our dedicated planners pay close attention to every small detail to ensure your journey is seamless and stress-free.",
    ],
  },
  {
    icon: FiClock,
    title: "24/7 Support",
    stat: "24/7",
    statLabel: "Available",
    descriptions: [
      "Our round-the-clock live assistance ensures that expert help is always available whenever you might need it.",
      "We provide continuous support from the initial booking phase until the very moment you return home safely.",
      "Professional travel consultants are always just a call away to handle requests or provide immediate ground assistance.",
    ],
  },
  {
    icon: FiUsers,
    title: "Small Groups",
    stat: "8-12",
    statLabel: "Max Group Size",
    descriptions: [
      "We focus on intimate and authentic experiences that allow for meaningful connections with nature and local communities.",
      "Small group sizes ensure you receive maximum personal attention and expert guidance throughout your entire expedition.",
      "We guarantee no overcrowded tours ever, preserving the exclusivity and quiet majesty of the wilderness for our guests.",
    ],
  },
  {
    icon: FiStar,
    title: "Best Value",
    stat: "4.9★",
    statLabel: "Average Rating",
    descriptions: [
      "We deliver premium quality and luxury experiences at fair and competitive pricing reflecting true artisanal value.",
      "Our transparent all-inclusive rates mean you can enjoy your adventure without worrying about hidden extras or fees.",
      "We believe in providing the best possible value by combining comfort, adventure, and world-class service in one package.",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "The safari exceeded all our expectations. Every detail was perfectly planned and the guides were incredibly knowledgeable.",
    author: "Sarah Mitchell",
    role: "Wildlife Photographer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    quote:
      "Altuvera made our honeymoon absolutely magical. From the Serengeti to Zanzibar, every moment was perfect.",
    author: "James & Emily",
    role: "Honeymoon Trip",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
  },
  {
    quote:
      "Professional, responsive, and truly passionate about African travel. I've booked three trips with them now.",
    author: "Michael Chen",
    role: "Adventure Traveler",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5,
  },
];

const CTA_ROTATING_TEXTS = [
  "🌍 Trusted by 5+ travelers worldwide",
  "⭐ Rated 4.9/5 across all platforms",
  "🏆 Award-winning East Africa specialists",
  "🛡️ 100% satisfaction guarantee",
];

// ============================================================================
// HOOKS
// ============================================================================

const useKeyboardClose = (onClose) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
};

const useRotatingIndex = (length, interval = 3000) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [length, interval]);

  return index;
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const textSwap = {
  enter: { opacity: 0, y: 14, filter: "blur(4px)" },
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================

const GlobalStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .svc-focus:focus-visible {
      outline: 3px solid ${THEME.colors.primary[500]};
      outline-offset: 4px;
      border-radius: ${THEME.radii["2xl"]};
    }

    .modal-scroll::-webkit-scrollbar { width: 5px; }
    .modal-scroll::-webkit-scrollbar-track { background: ${THEME.colors.primary[50]}; }
    .modal-scroll::-webkit-scrollbar-thumb { background: ${THEME.colors.primary[300]}; border-radius: 3px; }
    .modal-scroll::-webkit-scrollbar-thumb:hover { background: ${THEME.colors.primary[500]}; }

    .contact-link {
      text-decoration: none;
      transition: all ${THEME.transitions.base};
    }
    .contact-link:hover {
      background-color: ${THEME.colors.primary[50]} !important;
      border-color: ${THEME.colors.primary[300]} !important;
      transform: translateX(4px);
    }
    .contact-link:focus-visible {
      outline: 2px solid ${THEME.colors.primary[500]};
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .grid-services { grid-template-columns: 1fr !important; gap: 16px !important; }
      .grid-process { grid-template-columns: 1fr !important; gap: 40px !important; }
      .grid-why { grid-template-columns: 1fr !important; gap: 16px !important; }
      .grid-testimonials { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
    @media (min-width: 481px) and (max-width: 768px) {
      .grid-services { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
      .grid-process { grid-template-columns: repeat(2, 1fr) !important; gap: 32px !important; }
      .grid-why { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
      .grid-testimonials { grid-template-columns: 1fr !important; gap: 16px !important; }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      .grid-services { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
      .grid-process { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
      .grid-why { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
      .grid-testimonials { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
    }
    @media (min-width: 1025px) {
      .grid-services { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important; gap: 28px !important; }
      .grid-process { grid-template-columns: repeat(4, 1fr) !important; gap: 28px !important; }
      .grid-why { grid-template-columns: repeat(3, 1fr) !important; gap: 24px !important; }
      .grid-testimonials { grid-template-columns: repeat(3, 1fr) !important; gap: 24px !important; }
    }
  `}</style>
);

// ============================================================================
// SHARED TINY COMPONENTS
// ============================================================================

const ImageSkeleton = () => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: THEME.colors.primary[100],
      backgroundImage: `linear-gradient(90deg, transparent 0%, ${THEME.colors.primary[50]} 50%, transparent 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite linear",
      zIndex: 1,
    }}
  />
);

/**
 * Animated text that cycles through an array of strings
 */
const RotatingText = React.memo(({ texts, interval = 3000, style = {} }) => {
  const idx = useRotatingIndex(texts.length, interval);

  return (
    <div
      style={{
        position: "relative",
        height: "24px",
        overflow: "hidden",
        ...style,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          variants={textSwap}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {texts[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});
RotatingText.displayName = "RotatingText";

/**
 * Dot progress bar for rotating content
 */
const DotProgress = React.memo(({ total, active, vertical = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      gap: vertical ? "3px" : "5px",
      alignItems: "center",
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: !vertical && i === active ? "16px" : "5px",
          height: vertical ? (i === active ? "16px" : "5px") : "4px",
          borderRadius: THEME.radii.full,
          backgroundColor:
            i === active
              ? THEME.colors.primary[500]
              : THEME.colors.primary[200],
          transition: `all ${THEME.transitions.smooth}`,
        }}
      />
    ))}
  </div>
));
DotProgress.displayName = "DotProgress";

// ============================================================================
// SECTION HEADER
// ============================================================================

const SplitText = React.memo(({ children }) => <>{children}</>);
SplitText.displayName = "SplitText";

const SectionHeader = React.memo(
  ({
    label,
    title,
    subtitle,
    alignment = "center",
    light = false,
    rotatingTexts = null,
  }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        style={{
          textAlign: alignment,
          marginBottom: "clamp(40px, 7vw, 72px)",
          maxWidth: alignment === "center" ? "760px" : "none",
          marginLeft: alignment === "center" ? "auto" : undefined,
          marginRight: alignment === "center" ? "auto" : undefined,
        }}
      >
        <motion.span
          variants={staggerItem}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            backgroundColor: light
              ? "rgba(255,255,255,0.08)"
              : THEME.colors.primary[50],
            borderRadius: THEME.radii.full,
            color: light
              ? THEME.colors.primary[300]
              : THEME.colors.primary[700],
            fontSize: "11px",
            fontWeight: "700",
            fontFamily: THEME.fonts.body,
            marginBottom: "20px",
            textTransform: "uppercase",
            letterSpacing: "2.5px",
            backdropFilter: light ? "blur(12px)" : "none",
            border: light
              ? "1px solid rgba(255,255,255,0.1)"
              : `1px solid ${THEME.colors.primary[200]}`,
          }}
        >
          {label}
        </motion.span>

        <motion.h2
          variants={staggerItem}
          style={{
            fontFamily: THEME.fonts.heading,
            fontSize: "clamp(28px, 5.5vw, 52px)",
            fontWeight: "800",
            color: light ? THEME.colors.white : THEME.colors.textDark,
            marginBottom: subtitle || rotatingTexts ? "20px" : 0,
            lineHeight: "1.1",
            letterSpacing: "-0.03em",
          }}
        >
          {typeof title === "string" ? <SplitText>{title}</SplitText> : title}
        </motion.h2>

        {subtitle && (
          <motion.p
            variants={staggerItem}
            style={{
              fontSize: "clamp(14px, 2vw, 17px)",
              color: light ? "rgba(255,255,255,0.7)" : THEME.colors.textMuted,
              lineHeight: "1.75",
              maxWidth: alignment === "center" ? "600px" : "none",
              margin: alignment === "center" ? "0 auto" : 0,
              fontFamily: THEME.fonts.body,
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {rotatingTexts && (
          <motion.div variants={staggerItem}>
            <RotatingText
              texts={rotatingTexts}
              interval={3500}
              style={{
                fontSize: "clamp(14px, 2vw, 17px)",
                color: light ? "rgba(255,255,255,0.7)" : THEME.colors.textMuted,
                fontFamily: THEME.fonts.body,
                fontStyle: "italic",
                height: "28px",
                display: "flex",
                justifyContent:
                  alignment === "center" ? "center" : "flex-start",
              }}
            />
          </motion.div>
        )}
      </motion.div>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

// ============================================================================
// SERVICE CARD
// ============================================================================

const ServiceCard = React.memo(({ service, index, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const images = useMemo(() => {
    const gallery =
      Array.isArray(service.gallery) && service.gallery.length > 0
        ? service.gallery
        : null;
    const fallback =
      Array.isArray(service.images) && service.images.length > 0
        ? service.images
        : null;
    return gallery || fallback || [service.image];
  }, [service.gallery, service.images, service.image]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rotatingFeatures = useMemo(
    () =>
      service.features && service.features.length > 0
        ? service.features.slice(0, 4)
        : [service.description],
    [service.features, service.description],
  );

  const activeIdx = useRotatingIndex(rotatingFeatures.length, 3500);
  const slideIdx = useRotatingIndex(images.length, 4200);

  useEffect(() => {
    if (images.length <= 1) return;
    setImageLoaded(false);
    setActiveImageIndex(slideIdx);
  }, [images.length, slideIdx]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(service);
      }
    },
    [onClick, service],
  );

  return (
    <motion.article
      ref={ref}
      className="svc-focus"
      variants={staggerItem}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        position: "relative",
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.radii["2xl"],
        overflow: "hidden",
        boxShadow: isHovered ? THEME.shadows.cardHover : THEME.shadows.md,
        transition: `all ${THEME.transitions.smooth}`,
        cursor: "pointer",
        border: `1px solid ${isHovered ? THEME.colors.primary[300] : THEME.colors.border}`,
        transform:
          isHovered && !isMobile ? "translateY(-10px)" : "translateY(0)",
        willChange: "transform, box-shadow",
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => onClick(service)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Learn more about ${service.title}`}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          height: isMobile ? "180px" : "220px",
          overflow: "hidden",
        }}
      >
        {!imageLoaded && <ImageSkeleton />}
        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${activeImageIndex}`}
            src={images[activeImageIndex]}
            alt=""
            role="presentation"
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImageLoaded(true)}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: isHovered ? "scale(1.04)" : "scale(1)",
              transition: `transform 800ms ${THEME.transitions.smooth}`,
              opacity: imageLoaded ? 1 : 0,
            }}
          />
        </AnimatePresence>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 40%, ${THEME.colors.primary[950]}80 100%)`,
          }}
        />

        {/* Slideshow controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImageLoaded(false);
                setActiveImageIndex(
                  (prev) => (prev - 1 + images.length) % images.length,
                );
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: THEME.colors.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: isHovered && !isMobile ? 1 : 0,
                pointerEvents: isHovered && !isMobile ? "auto" : "none",
                transition: `opacity ${THEME.transitions.base}`,
                zIndex: 4,
              }}
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImageLoaded(false);
                setActiveImageIndex((prev) => (prev + 1) % images.length);
              }}
              style={{
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: THEME.colors.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: isHovered && !isMobile ? 1 : 0,
                pointerEvents: isHovered && !isMobile ? "auto" : "none",
                transition: `opacity ${THEME.transitions.base}`,
                zIndex: 4,
              }}
            >
              <FiChevronRight size={18} />
            </button>

            <div
              aria-label="Image position"
              style={{
                position: "absolute",
                left: "14px",
                bottom: "14px",
                display: "flex",
                gap: "6px",
                zIndex: 4,
              }}
            >
              {images.slice(0, 6).map((_, i) => {
                const isActive = i === activeImageIndex;
                return (
                  <span
                    key={i}
                    style={{
                      width: isActive ? "22px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: isActive
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(255,255,255,0.44)",
                      transition: `all ${THEME.transitions.base}`,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
        <span
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            padding: "6px 14px",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: THEME.radii.full,
            fontSize: "10px",
            fontWeight: "700",
            fontFamily: THEME.fonts.body,
            color: THEME.colors.primary[700],
            textTransform: "uppercase",
            letterSpacing: "1px",
            border: `1px solid ${THEME.colors.primary[100]}`,
          }}
        >
          Premium
        </span>
        <div
          style={{
            position: "absolute",
            bottom: "-26px",
            right: "20px",
            width: "52px",
            height: "52px",
            borderRadius: THEME.radii.lg,
            background: `linear-gradient(135deg, ${THEME.colors.primary[600]}, ${THEME.colors.primary[500]})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 8px 24px rgba(22,163,74,0.2)`,
            zIndex: 2,
            transition: `transform ${THEME.transitions.spring}`,
            transform: isHovered
              ? "scale(1.12) rotate(-5deg)"
              : "scale(1) rotate(0deg)",
            border: `3px solid ${THEME.colors.white}`,
          }}
        >
          <ServiceIcon name={service.iconName} size={22} color="white" />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? "22px 18px 18px" : "26px 24px 22px" }}>
        <h3
          style={{
            fontFamily: THEME.fonts.heading,
            fontSize: isMobile ? "18px" : "20px",
            fontWeight: "700",
            color: THEME.colors.textDark,
            marginBottom: "8px",
            lineHeight: "1.3",
          }}
        >
          {service.title}
        </h3>

        <p
          style={{
            fontSize: "13px",
            fontFamily: THEME.fonts.body,
            color: THEME.colors.textMuted,
            lineHeight: "1.65",
            marginBottom: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {service.description}
        </p>

        {/* Dynamic rotating highlight */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: THEME.colors.primary[50],
            borderRadius: THEME.radii.md,
            border: `1px solid ${THEME.colors.primary[100]}`,
            marginBottom: "16px",
            minHeight: "48px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <DotProgress
            total={Math.min(rotatingFeatures.length, 4)}
            active={activeIdx}
            vertical
          />
          <div
            style={{
              flex: 1,
              position: "relative",
              height: "20px",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIdx}
                variants={textSwap}
                initial="enter"
                animate="center"
                exit="exit"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  fontSize: "12px",
                  fontFamily: THEME.fonts.body,
                  fontWeight: "600",
                  color: THEME.colors.primary[700],
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "20px",
                }}
              >
                {rotatingFeatures[activeIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Feature chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "18px",
          }}
        >
          {service.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                backgroundColor: THEME.colors.lightGreen,
                borderRadius: THEME.radii.full,
                fontSize: "11px",
                fontFamily: THEME.fonts.body,
                color: THEME.colors.primary[700],
                fontWeight: "500",
                border: `1px solid ${THEME.colors.primary[100]}`,
                maxWidth: "160px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <FiCheck size={10} strokeWidth={3} style={{ flexShrink: 0 }} />
              {feature}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 16px",
            backgroundColor: isHovered
              ? THEME.colors.primary[600]
              : THEME.colors.primary[50],
            borderRadius: THEME.radii.lg,
            transition: `all ${THEME.transitions.smooth}`,
            border: `1px solid ${isHovered ? THEME.colors.primary[600] : THEME.colors.primary[200]}`,
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: THEME.fonts.body,
              color: isHovered ? THEME.colors.white : THEME.colors.primary[700],
              transition: `color ${THEME.transitions.base}`,
            }}
          >
            Explore Service
          </span>
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: isHovered
                ? "rgba(255,255,255,0.2)"
                : THEME.colors.primary[100],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isHovered ? THEME.colors.white : THEME.colors.primary[600],
              transition: `all ${THEME.transitions.smooth}`,
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${THEME.colors.primary[400]}, ${THEME.colors.primary[600]})`,
          width: isHovered ? "100%" : "0%",
          transition: "width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </motion.article>
  );
});
ServiceCard.displayName = "ServiceCard";

// ============================================================================
// PROCESS STEP CARD
// ============================================================================

const ProcessStepCard = React.memo(({ step, index, total, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const StepIcon = step.icon;
  const descIdx = useRotatingIndex(step.descriptions.length, 2800);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "relative",
        textAlign: "center",
        padding: isMobile ? "40px 20px 28px" : "52px 28px 36px",
        backgroundColor: isHovered
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        borderRadius: THEME.radii["2xl"],
        border: `1px solid ${isHovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
        transition: `all ${THEME.transitions.smooth}`,
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Step badge */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${THEME.colors.primary[500]}, ${THEME.colors.primary[400]})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: "800",
          fontFamily: THEME.fonts.body,
          color: THEME.colors.white,
          boxShadow: `0 6px 20px rgba(22,163,74,0.2)`,
          border: "3px solid rgba(255,255,255,0.15)",
        }}
      >
        {step.step}
      </div>

      {/* Icon */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: THEME.radii.xl,
          backgroundColor: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
          transition: `all ${THEME.transitions.smooth}`,
          transform: isHovered ? "scale(1.08)" : "scale(1)",
          color: THEME.colors.primary[300],
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <StepIcon size={isMobile ? 24 : 28} />
      </div>

      <h3
        style={{
          fontFamily: THEME.fonts.heading,
          fontSize: isMobile ? "18px" : "20px",
          fontWeight: "700",
          color: THEME.colors.white,
          marginBottom: "12px",
          lineHeight: "1.3",
        }}
      >
        {step.title}
      </h3>

      {/* Dynamic rotating description */}
      <div style={{ height: "44px", overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={descIdx}
            variants={textSwap}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: "absolute",
              inset: 0,
              fontSize: isMobile ? "12px" : "13px",
              fontFamily: THEME.fonts.body,
              color: "rgba(255,255,255,0.6)",
              lineHeight: "1.65",
              margin: 0,
            }}
          >
            {step.descriptions[descIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}
      >
        <DotProgress total={step.descriptions.length} active={descIdx} />
      </div>

      {/* Connector */}
      {!isMobile && index < total - 1 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            right: "-14px",
            transform: "translateY(-50%)",
            zIndex: 3,
          }}
        >
          <FiChevronRight
            size={18}
            style={{ color: "rgba(255,255,255,0.2)" }}
          />
        </div>
      )}
    </motion.div>
  );
});
ProcessStepCard.displayName = "ProcessStepCard";

// ============================================================================
// WHY CHOOSE CARD
// ============================================================================

const WhyChooseCard = React.memo(({ item, index, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const IconComponent = item.icon;
  const descIdx = useRotatingIndex(item.descriptions.length, 3200);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "relative",
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.radii["2xl"],
        padding: isMobile ? "24px 20px" : "32px 28px",
        boxShadow: isHovered ? THEME.shadows.cardHover : THEME.shadows.sm,
        transition: `all ${THEME.transitions.smooth}`,
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        border: `1px solid ${isHovered ? THEME.colors.primary[300] : THEME.colors.border}`,
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${THEME.colors.primary[400]}, ${THEME.colors.primary[600]})`,
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: `transform ${THEME.transitions.smooth}`,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: THEME.radii.lg,
            backgroundColor: THEME.colors.primary[50],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: THEME.colors.primary[600],
            flexShrink: 0,
            transition: `transform ${THEME.transitions.spring}`,
            transform: isHovered ? "scale(1.08) rotate(-3deg)" : "scale(1)",
            border: `1px solid ${THEME.colors.primary[100]}`,
          }}
        >
          <IconComponent size={22} />
        </div>
        <h3
          style={{
            fontFamily: THEME.fonts.heading,
            fontSize: isMobile ? "17px" : "19px",
            fontWeight: "700",
            color: THEME.colors.textDark,
            margin: 0,
            lineHeight: "1.3",
          }}
        >
          {item.title}
        </h3>
      </div>

      {/* Dynamic description */}
      <div
        style={{
          height: "68px",
          overflow: "hidden",
          position: "relative",
          marginBottom: "14px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={descIdx}
            variants={textSwap}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "13px",
              fontFamily: THEME.fonts.body,
              color: THEME.colors.textMuted,
              lineHeight: "1.65",
              margin: 0,
            }}
          >
            {item.descriptions[descIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <DotProgress total={item.descriptions.length} active={descIdx} />
      </div>

      {/* Stat */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          padding: "12px 16px",
          backgroundColor: THEME.colors.primary[50],
          borderRadius: THEME.radii.lg,
          border: `1px solid ${THEME.colors.primary[100]}`,
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: "800",
            fontFamily: THEME.fonts.body,
            color: THEME.colors.primary[600],
            lineHeight: "1",
          }}
        >
          {item.stat}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontFamily: THEME.fonts.body,
            color: THEME.colors.textMuted,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {item.statLabel}
        </span>
      </div>
    </motion.div>
  );
});
WhyChooseCard.displayName = "WhyChooseCard";

// ============================================================================
// TESTIMONIAL CARD — **FIXED: no isMobile reference**
// ============================================================================

const TestimonialCard = React.memo(({ testimonial, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.radii["2xl"],
        padding: "clamp(22px, 4vw, 28px)",
        boxShadow: THEME.shadows.md,
        border: `1px solid ${THEME.colors.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Stars — green only */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "18px" }}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <FiStar
            key={i}
            size={15}
            fill={THEME.colors.primary[500]}
            color={THEME.colors.primary[500]}
          />
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontSize: "clamp(14px, 2vw, 15px)",
          fontFamily: THEME.fonts.body,
          color: THEME.colors.textBody,
          lineHeight: "1.75",
          marginBottom: "22px",
          fontStyle: "italic",
          flex: 1,
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${THEME.colors.primary[200]}`,
            backgroundColor: THEME.colors.primary[50],
            flexShrink: 0,
          }}
        >
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: `opacity ${THEME.transitions.base}`,
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              fontFamily: THEME.fonts.body,
              color: THEME.colors.textDark,
              marginBottom: "2px",
            }}
          >
            {testimonial.author}
          </div>
          <div
            style={{
              fontSize: "12px",
              fontFamily: THEME.fonts.body,
              color: THEME.colors.textMuted,
            }}
          >
            {testimonial.role}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
TestimonialCard.displayName = "TestimonialCard";

// ============================================================================
// SERVICE MODAL
// ============================================================================

const ServiceModal = React.memo(({ service, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgLoaded, setImgLoaded] = useState(false);
  const modalRef = useRef(null);
  const activeFeatureIdx = useRotatingIndex(
    service.features ? service.features.length : 0,
    2500,
  );

  useKeyboardClose(onClose);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (modalRef.current) modalRef.current.focus();
  }, []);

  const contactOptions = useMemo(
    () => [
      {
        href: "tel:+250780702773",
        icon: FiPhone,
        label: (
          <span>
            +250 780 702 773
            <br />
            +250 792 352 409
          </span>
        ),
        isExternal: true,
      },
      {
        href: "mailto:altuverasafari@gmail.com",
        icon: FiMail,
        label: "Email Us",
        isExternal: true,
      },
      {
        href: "/contact",
        icon: FiMessageCircle,
        label: "Live Chat",
        isExternal: false,
      },
    ],
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${service.title} details`}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: THEME.colors.overlay,
        backdropFilter: "blur(10px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "10px" : "28px",
      }}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="modal-scroll"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: THEME.colors.white,
          borderRadius: isMobile ? THEME.radii.xl : THEME.radii["3xl"],
          maxWidth: "860px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: THEME.shadows["2xl"],
          outline: "none",
        }}
      >
        {/* Close */}
        <motion.button
          onClick={onClose}
          whileHover={{
            scale: 1.05,
            backgroundColor: THEME.colors.primary[600],
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.45)",
            color: THEME.colors.white,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: `background-color ${THEME.transitions.base}`,
          }}
        >
          <FiX size={18} />
        </motion.button>

        {/* Hero */}
        <div
          style={{
            position: "relative",
            height: isMobile ? "200px" : "300px",
            overflow: "hidden",
            borderRadius: `${isMobile ? THEME.radii.xl : THEME.radii["3xl"]} ${isMobile ? THEME.radii.xl : THEME.radii["3xl"]} 0 0`,
          }}
        >
          {!imgLoaded && <ImageSkeleton />}
          <img
            src={service.image}
            alt={`${service.title} experience`}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: `opacity ${THEME.transitions.base}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, ${THEME.colors.primary[950]}DD 0%, ${THEME.colors.primary[950]}40 50%, transparent 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: isMobile ? "18px" : "32px",
              color: THEME.colors.white,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 16px",
                backgroundColor: THEME.colors.primary[500],
                borderRadius: THEME.radii.full,
                fontSize: "10px",
                fontWeight: "700",
                fontFamily: THEME.fonts.body,
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Signature Experience
            </span>
            <h2
              style={{
                fontFamily: THEME.fonts.heading,
                fontSize: isMobile ? "24px" : "34px",
                fontWeight: "700",
                margin: 0,
                lineHeight: "1.2",
              }}
            >
              {service.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "22px 18px" : "36px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr",
              gap: isMobile ? "28px" : "36px",
            }}
          >
            {/* Left column */}
            <div>
              <div style={{ marginBottom: "28px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: THEME.fonts.body,
                    color: THEME.colors.textDark,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  <FiCompass size={16} color={THEME.colors.primary[600]} />
                  About This Experience
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    fontFamily: THEME.fonts.body,
                    color: THEME.colors.textMuted,
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  {service.description} Our expert team ensures every aspect of
                  your {service.title.toLowerCase()} experience is meticulously
                  curated to exceed world-class standards and create lasting
                  memories.
                </p>
              </div>

              {/* Features with auto-highlight */}
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: THEME.fonts.body,
                    color: THEME.colors.textDark,
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  <FiCheck size={16} color={THEME.colors.primary[600]} />
                  What&apos;s Included
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {service.features.map((feature, idx) => {
                    const isActive = idx === activeFeatureIdx;
                    return (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + idx * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          marginBottom: "8px",
                          fontSize: "13px",
                          fontFamily: THEME.fonts.body,
                          color: isActive
                            ? THEME.colors.primary[700]
                            : THEME.colors.textMuted,
                          lineHeight: "1.6",
                          padding: "8px 12px",
                          borderRadius: THEME.radii.md,
                          backgroundColor: isActive
                            ? THEME.colors.primary[50]
                            : "transparent",
                          border: `1px solid ${isActive ? THEME.colors.primary[200] : "transparent"}`,
                          transition: `all ${THEME.transitions.smooth}`,
                          fontWeight: isActive ? "600" : "400",
                        }}
                      >
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: isActive
                              ? THEME.colors.primary[500]
                              : THEME.colors.primary[100],
                            color: isActive
                              ? THEME.colors.white
                              : THEME.colors.primary[600],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "1px",
                            transition: `all ${THEME.transitions.base}`,
                          }}
                        >
                          <FiCheck size={11} strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Right column — CTA */}
            <div>
              <div
                style={{
                  backgroundColor: THEME.colors.primary[50],
                  padding: isMobile ? "22px" : "28px",
                  borderRadius: THEME.radii.xl,
                  border: `1px solid ${THEME.colors.primary[100]}`,
                  position: isMobile ? "static" : "sticky",
                  top: "24px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    fontFamily: THEME.fonts.body,
                    color: THEME.colors.primary[800],
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Ready to Book?
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    fontFamily: THEME.fonts.body,
                    color: THEME.colors.textMuted,
                    marginBottom: "20px",
                    lineHeight: "1.65",
                  }}
                >
                  Let our expert team craft your perfect{" "}
                  {service.title.toLowerCase()} experience, tailored just for
                  you.
                </p>

                <Button
                  to="/booking"
                  variant="primary"
                  fullWidth
                  size="large"
                  icon={<FiArrowRight size={15} />}
                >
                  Start Planning
                </Button>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "18px",
                  }}
                >
                  {contactOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const linkStyle = {
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      backgroundColor: THEME.colors.white,
                      borderRadius: THEME.radii.md,
                      fontSize: "12px",
                      fontFamily: THEME.fonts.body,
                      fontWeight: "500",
                      color: THEME.colors.textBody,
                      border: `1px solid ${THEME.colors.border}`,
                      textDecoration: "none",
                      cursor: "pointer",
                    };

                    return opt.isExternal ? (
                      <a
                        key={opt.label}
                        href={opt.href}
                        className="contact-link"
                        style={linkStyle}
                      >
                        <IconComp size={14} color={THEME.colors.primary[600]} />
                        <span>{opt.label}</span>
                      </a>
                    ) : (
                      <Link
                        key={opt.label}
                        to={opt.href}
                        className="contact-link"
                        style={linkStyle}
                        onClick={onClose}
                      >
                        <IconComp size={14} color={THEME.colors.primary[600]} />
                        <span>{opt.label}</span>
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
});
ServiceModal.displayName = "ServiceModal";

// ============================================================================
// MAIN PAGE
// ============================================================================

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");
  const scrollProgress = useScrollProgress();

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedService(null);
  }, []);

  const sectionPadding = isSmallMobile
    ? "48px 14px"
    : isMobile
      ? "56px 18px"
      : "100px 40px";

  return (
    <>
      <Helmet>
        <title>
          Our Services | Altuvera — Premium East Africa Travel Experiences
        </title>
        <meta
          name="description"
          content="Discover Altuvera's premium safari services: wildlife expeditions, mountain climbing, gorilla trekking, beach holidays, and bespoke cultural experiences across East Africa."
        />
        <meta
          property="og:title"
          content="Our Services | Altuvera — Premium East Africa Travel"
        />
        <meta property="og:type" content="website" />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
      </Helmet>

      <GlobalStyles />

      {/* Scroll Progress */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${THEME.colors.primary[400]}, ${THEME.colors.primary[600]})`,
          width: `${scrollProgress}%`,
          zIndex: 10001,
          transition: "width 80ms linear",
          boxShadow:
            scrollProgress > 0
              ? `0 0 10px ${THEME.colors.primary[400]}60`
              : "none",
        }}
      />

      {/* Page Header */}
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive travel experiences designed to create your perfect East African adventure"
        backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
        breadcrumbs={[{ label: "Services", path: "/services" }]}
      />

      {/* Cookie Settings */}
      <div
        style={{
          padding: isMobile ? "8px 18px 0" : "12px 28px 0",
          backgroundColor: THEME.colors.white,
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <CookieSettingsButton />
        </div>
      </div>

      {/* Rotating Hero Tagline */}
      <section
        style={{
          padding: isSmallMobile
            ? "36px 14px 12px"
            : isMobile
              ? "40px 18px 16px"
              : "56px 40px 24px",
          backgroundColor: THEME.colors.white,
        }}
      >
        <div
          style={{ maxWidth: "1320px", margin: "0 auto", textAlign: "center" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 28px",
              backgroundColor: THEME.colors.primary[50],
              borderRadius: THEME.radii.full,
              border: `1px solid ${THEME.colors.primary[200]}`,
            }}
          >
            <FiGlobe size={16} color={THEME.colors.primary[600]} />
            <RotatingText
              texts={ROTATING_HERO_TEXTS}
              interval={4000}
              style={{
                fontSize: isMobile ? "13px" : "15px",
                fontFamily: THEME.fonts.body,
                fontWeight: "600",
                color: THEME.colors.primary[700],
                width: isMobile ? "240px" : "340px",
                textAlign: "center",
                height: "22px",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ============================== SERVICES ============================== */}
      <section
        style={{
          padding: sectionPadding,
          backgroundColor: THEME.colors.lightGreen,
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="perspectiveIn">
            <SectionHeader
              label="✦ What We Offer"
              title="Tailored Travel Experiences"
              subtitle="From thrilling safaris to cultural immersions, discover our complete range of services crafted to make your East African journey extraordinary."
            />
          </AnimatedSection>
          <div
            className="grid-services"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            {services.map((service, index) => (
              <AnimatedSection
                key={service.id}
                animation="flipIn"
                delay={index * 0.1}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  onClick={handleServiceClick}
                  isMobile={isMobile}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PROCESS ============================== */}
      <section
        style={{
          padding: sectionPadding,
          background: `linear-gradient(135deg, ${THEME.colors.primary[950]} 0%, ${THEME.colors.primary[900]} 40%, ${THEME.colors.primary[800]} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 10% 90%, ${THEME.colors.primary[600]}15 0%, transparent 50%), radial-gradient(circle at 90% 10%, ${THEME.colors.primary[500]}10 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <AnimatedSection animation="slideReveal">
            <SectionHeader
              label="✦ Our Process"
              title="How It Works"
              subtitle="From your first inquiry to touchdown, we make planning your adventure seamless and enjoyable."
              light
            />
          </AnimatedSection>
          <div
            className="grid-process"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(4, 1fr)",
              gap: "28px",
            }}
          >
            {PROCESS_STEPS.map((step, index) => (
              <AnimatedSection
                key={step.step}
                animation="slideReveal"
                delay={index * 0.15}
                direction={index % 2 === 0 ? "left" : "right"}
              >
                <ProcessStepCard
                  step={step}
                  index={index}
                  total={PROCESS_STEPS.length}
                  isMobile={isMobile}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== WHY US ============================== */}
      <section
        style={{ padding: sectionPadding, backgroundColor: THEME.colors.white }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="zoomIn">
            <SectionHeader
              label="✦ Why Altuvera"
              title="The Altuvera Difference"
              subtitle="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
            />
          </AnimatedSection>
          <div
            className="grid-why"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {WHY_CHOOSE_US.map((item, index) => (
              <AnimatedSection
                key={item.title}
                animation="zoomIn"
                delay={index * 0.1}
              >
                <WhyChooseCard item={item} index={index} isMobile={isMobile} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section
        style={{
          padding: sectionPadding,
          backgroundColor: THEME.colors.lightGreen,
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <AnimatedSection animation="blurIn">
            <SectionHeader
              label="✦ Testimonials"
              title="What Our Travelers Say"
              subtitle="Don't just take our word for it — hear from adventurers who've experienced the Altuvera difference."
            />
          </AnimatedSection>
          <div
            className="grid-testimonials"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <AnimatedSection
                key={testimonial.author}
                animation="blurIn"
                delay={index * 0.2}
              >
                <TestimonialCard testimonial={testimonial} index={index} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section
        style={{ padding: sectionPadding, backgroundColor: THEME.colors.white }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: "920px",
              margin: "0 auto",
              padding: isSmallMobile
                ? "40px 22px"
                : isMobile
                  ? "48px 28px"
                  : "72px 56px",
              background: `linear-gradient(135deg, ${THEME.colors.primary[700]} 0%, ${THEME.colors.primary[600]} 50%, ${THEME.colors.primary[500]} 100%)`,
              borderRadius: isMobile ? THEME.radii.xl : THEME.radii["3xl"],
              boxShadow: `${THEME.shadows["2xl"]}, 0 0 80px ${THEME.colors.primary[500]}20`,
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-40%",
                left: "-30%",
                width: "160%",
                height: "160%",
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: THEME.radii.full,
                  color: THEME.colors.primary[100],
                  fontSize: "11px",
                  fontWeight: "700",
                  fontFamily: THEME.fonts.body,
                  marginBottom: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <FiSun size={13} />
                Start Your Adventure
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  fontFamily: THEME.fonts.heading,
                  fontSize: isSmallMobile ? "24px" : isMobile ? "26px" : "38px",
                  fontWeight: "700",
                  color: THEME.colors.white,
                  marginBottom: "16px",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                }}
              >
                Ready to Start Your Journey?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontFamily: THEME.fonts.body,
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: "28px",
                  maxWidth: "520px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: "1.75",
                }}
              >
                Contact our expert team today and let us help you plan the
                adventure of a lifetime across the breathtaking landscapes of
                East Africa.
              </motion.p>

              {/* Rotating trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ marginBottom: "28px" }}
              >
                <RotatingText
                  texts={CTA_ROTATING_TEXTS}
                  interval={3000}
                  style={{
                    fontSize: "13px",
                    fontFamily: THEME.fonts.body,
                    color: "rgba(255,255,255,0.7)",
                    height: "22px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  to="/booking"
                  variant="white"
                  size="large"
                  icon={<FiArrowRight size={15} />}
                >
                  Start Planning
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="large"
                  style={{
                    borderColor: "rgba(255,255,255,0.35)",
                    color: THEME.colors.white,
                    backgroundColor: "transparent",
                  }}
                >
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selectedService && (
          <ServiceModal
            key={selectedService.id}
            service={selectedService}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;
