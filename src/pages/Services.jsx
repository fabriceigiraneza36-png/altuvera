// src/pages/Services.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  FiChevronRight,
  FiPlay,
  FiPhone,
  FiMail,
  FiMessageCircle,
} from 'react-icons/fi';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import CookieSettingsButton from '../components/common/CookieSettingsButton';
import { services } from '../data/services';
import ServiceIcon from '../components/icons/ServiceIconSimple';

// ============================================================================
// CONSTANTS & THEME
// ============================================================================

const THEME = {
  colors: {
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    accent: {
      amber: '#F59E0B',
      red: '#EF4444',
      pink: '#EC4899',
      indigo: '#6366F1',
      cyan: '#06B6D4',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(5, 150, 105, 0.15)',
    glowStrong: '0 0 60px rgba(5, 150, 105, 0.25)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    primaryDark: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    hero: 'linear-gradient(135deg, #022C22 0%, #065F46 50%, #047857 100%)',
    card: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
    overlay: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    smooth: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery Call',
    description: 'Share your travel dreams, preferences, and expectations with our expert consultants.',
    icon: '💬',
    color: THEME.colors.accent.indigo,
  },
  {
    step: '02',
    title: 'Custom Itinerary',
    description: 'Receive a personalized travel plan crafted specifically for your unique adventure.',
    icon: '📋',
    color: THEME.colors.accent.amber,
  },
  {
    step: '03',
    title: 'Fine-Tuning',
    description: 'Collaborate with us to perfect every detail until your trip is exactly right.',
    icon: '✨',
    color: THEME.colors.accent.pink,
  },
  {
    step: '04',
    title: 'Adventure Time',
    description: 'Embark on your journey with 24/7 on-ground support and peace of mind.',
    icon: '🚀',
    color: THEME.colors.primary[600],
  },
];

const WHY_CHOOSE_US = [
  {
    icon: FiAward,
    title: 'Expert Local Guides',
    description: 'Certified professionals with decades of combined experience and deep regional expertise.',
    color: THEME.colors.accent.amber,
    stat: '50+',
    statLabel: 'Expert Guides',
  },
  {
    icon: FiShield,
    title: 'Safety Guaranteed',
    description: 'Comprehensive safety protocols, full insurance coverage, and emergency support systems.',
    color: THEME.colors.accent.red,
    stat: '100%',
    statLabel: 'Safety Record',
  },
  {
    icon: FiHeart,
    title: 'Personalized Care',
    description: 'Every journey is uniquely tailored to match your travel style and preferences.',
    color: THEME.colors.accent.pink,
    stat: '5000+',
    statLabel: 'Happy Travelers',
  },
  {
    icon: FiClock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance from booking to return, wherever you are.',
    color: THEME.colors.accent.indigo,
    stat: '24/7',
    statLabel: 'Available',
  },
  {
    icon: FiUsers,
    title: 'Small Groups',
    description: 'Intimate group sizes ensuring authentic experiences and personal attention.',
    color: THEME.colors.primary[600],
    stat: '8-12',
    statLabel: 'Max Group Size',
  },
  {
    icon: FiStar,
    title: 'Best Value',
    description: 'Premium experiences at competitive prices with transparent, all-inclusive pricing.',
    color: THEME.colors.accent.cyan,
    stat: '4.9★',
    statLabel: 'Average Rating',
  },
];

const TESTIMONIALS = [
  {
    quote: "The safari exceeded all our expectations. Every detail was perfectly planned.",
    author: "Sarah Mitchell",
    role: "Wildlife Photographer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    rating: 5,
  },
  {
    quote: "Altuvera made our honeymoon absolutely magical. Highly recommended!",
    author: "James & Emily",
    role: "Honeymoon Trip",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 5,
  },
  {
    quote: "Professional, responsive, and truly passionate about African travel.",
    author: "Michael Chen",
    role: "Adventure Traveler",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    rating: 5,
  },
];

// ============================================================================
// HOOKS
// ============================================================================

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Animated Section Wrapper
 */
const AnimatedSection = ({ children, className, style, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

/**
 * Section Header Component
 */
const SectionHeader = ({ 
  label, 
  title, 
  subtitle, 
  alignment = 'center', 
  light = false,
  labelIcon = null 
}) => {
  const styles = {
    container: {
      textAlign: alignment,
      marginBottom: 'clamp(40px, 8vw, 70px)',
      maxWidth: alignment === 'center' ? '800px' : 'none',
      margin: alignment === 'center' ? '0 auto clamp(40px, 8vw, 70px)' : undefined,
    },
    label: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 24px',
      backgroundColor: light ? 'rgba(255, 255, 255, 0.1)' : THEME.colors.primary[50],
      borderRadius: THEME.borderRadius.full,
      color: light ? THEME.colors.primary[300] : THEME.colors.primary[600],
      fontSize: '13px',
      fontWeight: '700',
      marginBottom: '24px',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      backdropFilter: light ? 'blur(10px)' : 'none',
      border: light ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(32px, 5vw, 52px)',
      fontWeight: '700',
      color: light ? 'white' : THEME.colors.neutral[900],
      marginBottom: subtitle ? '20px' : 0,
      lineHeight: '1.15',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: 'clamp(16px, 2vw, 19px)',
      color: light ? 'rgba(255, 255, 255, 0.8)' : THEME.colors.neutral[500],
      lineHeight: '1.8',
      maxWidth: alignment === 'center' ? '650px' : 'none',
      margin: alignment === 'center' ? '0 auto' : 0,
    },
  };

  return (
    <div style={styles.container}>
      <motion.span 
        style={styles.label}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {labelIcon && <span style={{ fontSize: '16px' }}>{labelIcon}</span>}
        {label}
      </motion.span>
      <motion.h2 
        style={styles.title}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          style={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

/**
 * Service Card Component
 */
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const styles = useMemo(() => ({
    card: {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: THEME.borderRadius.xl,
      overflow: 'hidden',
      boxShadow: isHovered ? THEME.shadows.glowStrong : THEME.shadows.lg,
      transition: THEME.transitions.smooth,
      cursor: 'pointer',
      border: `1px solid ${isHovered ? THEME.colors.primary[200] : THEME.colors.neutral[200]}`,
      transform: isHovered && !isMobile ? 'translateY(-12px)' : 'translateY(0)',
    },
    imageContainer: {
      position: 'relative',
      height: isMobile ? '180px' : '220px',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    },
    imageOverlay: {
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(180deg, 
        rgba(0,0,0,0) 0%, 
        rgba(0,0,0,0.1) 50%,
        rgba(0,0,0,0.4) 100%)`,
      transition: THEME.transitions.normal,
    },
    badge: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      padding: '8px 16px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: THEME.borderRadius.full,
      fontSize: '12px',
      fontWeight: '700',
      color: THEME.colors.primary[700],
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    iconContainer: {
      position: 'absolute',
      bottom: '-30px',
      right: '24px',
      width: '64px',
      height: '64px',
      borderRadius: THEME.borderRadius.lg,
      background: THEME.gradients.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 8px 24px rgba(5, 150, 105, 0.35)`,
      zIndex: 2,
      transition: THEME.transitions.smooth,
      transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
    },
    content: {
      padding: isMobile ? '24px 20px' : '32px 28px',
      paddingTop: isMobile ? '20px' : '24px',
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: THEME.colors.neutral[900],
      marginBottom: '12px',
      lineHeight: '1.3',
      transition: THEME.transitions.normal,
    },
    description: {
      fontSize: isMobile ? '14px' : '15px',
      color: THEME.colors.neutral[500],
      lineHeight: '1.7',
      marginBottom: '20px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    features: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '24px',
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      color: THEME.colors.neutral[600],
    },
    featureIcon: {
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      backgroundColor: THEME.colors.primary[50],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: THEME.colors.primary[600],
      flexShrink: 0,
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '14px 20px',
      backgroundColor: isHovered ? THEME.colors.primary[600] : THEME.colors.primary[50],
      borderRadius: THEME.borderRadius.lg,
      border: 'none',
      cursor: 'pointer',
      transition: THEME.transitions.smooth,
    },
    buttonText: {
      fontSize: '14px',
      fontWeight: '600',
      color: isHovered ? 'white' : THEME.colors.primary[700],
      transition: THEME.transitions.normal,
    },
    buttonIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: isHovered ? 'rgba(255,255,255,0.2)' : THEME.colors.primary[100],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isHovered ? 'white' : THEME.colors.primary[600],
      transition: THEME.transitions.smooth,
      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
    },
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: '4px',
      backgroundColor: THEME.colors.primary[500],
      width: isHovered ? '100%' : '0%',
      transition: 'width 0.4s ease',
    },
  }), [isHovered, isMobile]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(service)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(service)}
      aria-label={`Learn more about ${service.title}`}
    >
      <div style={styles.imageContainer}>
        <img
          src={service.image}
          alt={service.title}
          style={styles.image}
          loading={index > 3 ? 'lazy' : 'eager'}
        />
        <div style={styles.imageOverlay} />
        <span style={styles.badge}>Premium</span>
        <div style={styles.iconContainer}>
          <ServiceIcon name={service.iconName} size={28} color="white" />
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{service.title}</h3>
        <p style={styles.description}>{service.description}</p>

        <div style={styles.features}>
          {service.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} style={styles.feature}>
              <span style={styles.featureIcon}>
                <FiCheck size={12} strokeWidth={3} />
              </span>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button style={styles.button}>
          <span style={styles.buttonText}>Explore Service</span>
          <span style={styles.buttonIcon}>
            <FiArrowRight size={16} />
          </span>
        </button>
      </div>

      <div style={styles.progressBar} />
    </motion.article>
  );
};

/**
 * Process Step Card
 */
const ProcessStepCard = ({ step, index, total, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const styles = useMemo(() => ({
    card: {
      position: 'relative',
      textAlign: 'center',
      padding: isMobile ? '32px 24px' : '48px 32px',
      paddingTop: isMobile ? '48px' : '64px',
      backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(20px)',
      borderRadius: THEME.borderRadius.xl,
      border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
      transition: THEME.transitions.smooth,
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
    },
    stepNumber: {
      position: 'absolute',
      top: '-24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}CC 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '800',
      color: 'white',
      boxShadow: `0 8px 24px ${step.color}50`,
      border: '4px solid rgba(255, 255, 255, 0.1)',
    },
    icon: {
      fontSize: isMobile ? '40px' : '56px',
      marginBottom: '20px',
      display: 'block',
      filter: isHovered ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'none',
      transition: THEME.transitions.normal,
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '12px',
    },
    description: {
      fontSize: isMobile ? '14px' : '15px',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: '1.7',
    },
    connector: {
      position: 'absolute',
      top: '80px',
      right: '-40px',
      width: '80px',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
      display: isMobile || index === total - 1 ? 'none' : 'block',
    },
  }), [isHovered, step.color, index, total, isMobile]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.stepNumber}>{step.step}</div>
      <span style={styles.icon} role="img" aria-hidden="true">
        {step.icon}
      </span>
      <h3 style={styles.title}>{step.title}</h3>
      <p style={styles.description}>{step.description}</p>
      <div style={styles.connector} />
    </motion.div>
  );
};

/**
 * Why Choose Us Card
 */
const WhyChooseCard = ({ item, index, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const IconComponent = item.icon;

  const styles = useMemo(() => ({
    card: {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: THEME.borderRadius.xl,
      padding: isMobile ? '28px' : '36px',
      boxShadow: isHovered ? THEME.shadows.glow : THEME.shadows.md,
      transition: THEME.transitions.smooth,
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      border: `1px solid ${isHovered ? THEME.colors.primary[200] : THEME.colors.neutral[100]}`,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}80 100%)`,
      transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
      transformOrigin: 'left',
      transition: THEME.transitions.smooth,
    },
    header: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '20px',
      marginBottom: '20px',
      flexDirection: isMobile ? 'column' : 'row',
    },
    iconContainer: {
      width: '64px',
      height: '64px',
      borderRadius: THEME.borderRadius.lg,
      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: `0 8px 20px ${item.color}40`,
      flexShrink: 0,
      transition: THEME.transitions.smooth,
      transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
    },
    content: {
      flex: 1,
    },
    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? '20px' : '22px',
      fontWeight: '700',
      color: THEME.colors.neutral[900],
      marginBottom: '8px',
    },
    description: {
      fontSize: '15px',
      color: THEME.colors.neutral[500],
      lineHeight: '1.7',
      marginBottom: '20px',
    },
    stats: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      padding: '16px 20px',
      backgroundColor: THEME.colors.neutral[50],
      borderRadius: THEME.borderRadius.lg,
      border: `1px solid ${THEME.colors.neutral[100]}`,
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '800',
      color: item.color,
      lineHeight: '1',
    },
    statLabel: {
      fontSize: '13px',
      color: THEME.colors.neutral[500],
      fontWeight: '500',
    },
  }), [isHovered, item.color, isMobile]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.accentBar} />
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <IconComponent size={28} />
        </div>
        <div style={styles.content}>
          <h3 style={styles.title}>{item.title}</h3>
        </div>
      </div>
      <p style={styles.description}>{item.description}</p>
      <div style={styles.stats}>
        <span style={styles.statValue}>{item.stat}</span>
        <span style={styles.statLabel}>{item.statLabel}</span>
      </div>
    </motion.div>
  );
};

/**
 * Testimonial Card
 */
const TestimonialCard = ({ testimonial, index }) => {
  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: THEME.borderRadius.xl,
      padding: '32px',
      boxShadow: THEME.shadows.lg,
      border: `1px solid ${THEME.colors.neutral[100]}`,
    },
    stars: {
      display: 'flex',
      gap: '4px',
      marginBottom: '20px',
    },
    star: {
      color: THEME.colors.accent.amber,
    },
    quote: {
      fontSize: '17px',
      color: THEME.colors.neutral[700],
      lineHeight: '1.8',
      marginBottom: '24px',
      fontStyle: 'italic',
    },
    author: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    avatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `3px solid ${THEME.colors.primary[100]}`,
    },
    authorInfo: {},
    authorName: {
      fontSize: '16px',
      fontWeight: '700',
      color: THEME.colors.neutral[900],
      marginBottom: '4px',
    },
    authorRole: {
      fontSize: '14px',
      color: THEME.colors.neutral[500],
    },
  };

  return (
    <motion.div
      style={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div style={styles.stars}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <FiStar key={i} size={18} fill={THEME.colors.accent.amber} style={styles.star} />
        ))}
      </div>
      <p style={styles.quote}>"{testimonial.quote}"</p>
      <div style={styles.author}>
        <img src={testimonial.avatar} alt={testimonial.author} style={styles.avatar} />
        <div style={styles.authorInfo}>
          <div style={styles.authorName}>{testimonial.author}</div>
          <div style={styles.authorRole}>{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Service Detail Modal
 */
const ServiceModal = ({ service, onClose }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const styles = {
    backdrop: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '32px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: THEME.borderRadius['2xl'],
      maxWidth: '900px',
      width: '100%',
      maxHeight: '92vh',
      overflowY: 'auto',
      position: 'relative',
      boxShadow: THEME.shadows['2xl'],
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 10,
      transition: THEME.transitions.normal,
    },
    imageSection: {
      position: 'relative',
      height: isMobile ? '250px' : '350px',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
    },
    imageContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: isMobile ? '24px' : '40px',
      color: 'white',
    },
    badge: {
      display: 'inline-block',
      padding: '10px 20px',
      backgroundColor: THEME.colors.primary[500],
      borderRadius: THEME.borderRadius.full,
      fontSize: '13px',
      fontWeight: '700',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    modalTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? '28px' : '40px',
      fontWeight: '700',
      margin: 0,
      lineHeight: '1.2',
    },
    content: {
      padding: isMobile ? '28px' : '48px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
      gap: isMobile ? '32px' : '48px',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: THEME.colors.neutral[900],
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    text: {
      fontSize: '16px',
      color: THEME.colors.neutral[600],
      lineHeight: '1.8',
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      marginBottom: '16px',
      fontSize: '15px',
      color: THEME.colors.neutral[600],
    },
    featureIcon: {
      width: '26px',
      height: '26px',
      borderRadius: '50%',
      backgroundColor: THEME.colors.primary[100],
      color: THEME.colors.primary[600],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: '2px',
    },
    ctaCard: {
      backgroundColor: THEME.colors.primary[50],
      padding: '32px',
      borderRadius: THEME.borderRadius.xl,
      border: `1px solid ${THEME.colors.primary[100]}`,
    },
    ctaTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: THEME.colors.primary[800],
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    ctaText: {
      fontSize: '15px',
      color: THEME.colors.neutral[600],
      marginBottom: '24px',
      lineHeight: '1.7',
    },
    contactOptions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '24px',
    },
    contactOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 18px',
      backgroundColor: 'white',
      borderRadius: THEME.borderRadius.lg,
      fontSize: '14px',
      color: THEME.colors.neutral[700],
      border: `1px solid ${THEME.colors.neutral[200]}`,
      transition: THEME.transitions.normal,
      cursor: 'pointer',
      textDecoration: 'none',
    },
  };

  return (
    <motion.div
      style={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={styles.modal}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          style={styles.closeButton}
          onClick={onClose}
          whileHover={{ scale: 1.1, backgroundColor: THEME.colors.primary[600] }}
          whileTap={{ scale: 0.95 }}
          aria-label="Close modal"
        >
          <FiX size={24} />
        </motion.button>

        <div style={styles.imageSection}>
          <img src={service.image} alt={service.title} style={styles.image} />
          <div style={styles.imageOverlay} />
          <div style={styles.imageContent}>
            <span style={styles.badge}>Signature Experience</span>
            <h2 style={styles.modalTitle}>{service.title}</h2>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.grid}>
            <div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <span style={{ fontSize: '20px' }}>📖</span>
                  About This Experience
                </h3>
                <p style={styles.text}>
                  {service.description} Our expert team ensures every aspect of your 
                  {service.title.toLowerCase()} experience is meticulously curated to 
                  exceed world-class standards and create lasting memories.
                </p>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <span style={{ fontSize: '20px' }}>✨</span>
                  What's Included
                </h3>
                <ul style={styles.featuresList}>
                  {service.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      style={styles.featureItem}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <span style={styles.featureIcon}>
                        <FiCheck size={14} strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div style={styles.ctaCard}>
                <h4 style={styles.ctaTitle}>Ready to Book?</h4>
                <p style={styles.ctaText}>
                  Let our expert team craft your perfect {service.title.toLowerCase()} 
                  experience, tailored just for you.
                </p>
                <Button
                  to="/booking"
                  variant="primary"
                  fullWidth
                  size="large"
                  icon={<FiArrowRight size={18} />}
                >
                  Start Planning
                </Button>

                <div style={styles.contactOptions}>
                  <a href="tel:+1234567890" style={styles.contactOption}>
                    <FiPhone size={18} color={THEME.colors.primary[600]} />
                    <span>Call Us Now</span>
                  </a>
                  <a href="mailto:info@altuvera.com" style={styles.contactOption}>
                    <FiMail size={18} color={THEME.colors.primary[600]} />
                    <span>Email Us</span>
                  </a>
                  <Link to="/contact" style={styles.contactOption}>
                    <FiMessageCircle size={18} color={THEME.colors.primary[600]} />
                    <span>Live Chat</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const scrollProgress = useScrollProgress();

  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedService(null);
  }, []);

  const styles = useMemo(() => ({
    progressBar: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '3px',
      backgroundColor: THEME.colors.primary[500],
      width: `${scrollProgress}%`,
      zIndex: 9999,
      transition: 'width 0.1s ease-out',
    },
    section: {
      padding: isMobile ? '60px 16px' : isTablet ? '80px 24px' : '100px 32px',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    servicesSection: {
      backgroundColor: THEME.colors.neutral[50],
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : isTablet 
          ? 'repeat(2, 1fr)' 
          : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: isMobile ? '24px' : '32px',
    },
    processSection: {
      background: THEME.gradients.hero,
      position: 'relative',
      overflow: 'hidden',
    },
    processPattern: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)`,
      pointerEvents: 'none',
    },
    processGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : isTablet 
          ? 'repeat(2, 1fr)' 
          : 'repeat(4, 1fr)',
      gap: isMobile ? '48px' : '32px',
      position: 'relative',
      zIndex: 2,
    },
    whySection: {
      backgroundColor: 'white',
    },
    whyGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : isTablet 
          ? 'repeat(2, 1fr)' 
          : 'repeat(3, 1fr)',
      gap: isMobile ? '24px' : '28px',
    },
    testimonialsSection: {
      backgroundColor: THEME.colors.neutral[50],
    },
    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(3, 1fr)',
      gap: '28px',
    },
    ctaSection: {
      backgroundColor: 'white',
    },
    ctaCard: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: isMobile ? '40px 24px' : '80px 60px',
      background: THEME.gradients.primary,
      borderRadius: isMobile ? THEME.borderRadius.xl : THEME.borderRadius['2xl'],
      boxShadow: `${THEME.shadows['2xl']}, 0 0 80px rgba(5, 150, 105, 0.2)`,
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    },
    ctaGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    ctaContent: {
      position: 'relative',
      zIndex: 2,
    },
    ctaTitle: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? '28px' : '42px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '20px',
      lineHeight: '1.2',
    },
    ctaText: {
      fontSize: isMobile ? '16px' : '18px',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '36px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: '1.8',
    },
    ctaButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  }), [isMobile, isTablet, scrollProgress]);

  return (
    <>
      <Helmet>
        <title>Our Services | Altuvera - Premium East Africa Travel</title>
        <meta 
          name="description" 
          content="Discover Altuvera's premium safari services: wildlife expeditions, mountain climbing, gorilla trekking, beach holidays, and bespoke cultural experiences across East Africa." 
        />
        <meta property="og:title" content="Our Services | Altuvera" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Scroll Progress Bar */}
      <div style={styles.progressBar} />

      {/* Page Header */}
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive travel experiences designed to create your perfect East African adventure"
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80"
        breadcrumbs={[{ label: 'Services', path: '/services' }]}
      />

      <div style={{ padding: isMobile ? '10px 16px 0' : '14px 24px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <CookieSettingsButton />
        </div>
      </div>

      {/* Services Grid Section */}
      <section style={{ ...styles.section, ...styles.servicesSection }}>
        <div style={styles.container}>
          <SectionHeader
            labelIcon="✨"
            label="What We Offer"
            title="Tailored Travel Experiences"
            subtitle="From thrilling safaris to cultural immersions, discover our complete range of services crafted to make your East African journey extraordinary."
          />

          <div style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onClick={handleServiceClick}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section style={{ ...styles.section, ...styles.processSection }}>
        <div style={styles.processPattern} />
        <div style={styles.container}>
          <SectionHeader
            labelIcon="🎯"
            label="Our Process"
            title="How It Works"
            subtitle="From your first inquiry to touchdown, we make planning your adventure seamless and enjoyable."
            light
          />

          <div style={styles.processGrid}>
            {PROCESS_STEPS.map((step, index) => (
              <ProcessStepCard
                key={step.step}
                step={step}
                index={index}
                total={PROCESS_STEPS.length}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={{ ...styles.section, ...styles.whySection }}>
        <div style={styles.container}>
          <SectionHeader
            labelIcon="💎"
            label="Why Altuvera"
            title="The Altuvera Difference"
            subtitle="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
          />

          <div style={styles.whyGrid}>
            {WHY_CHOOSE_US.map((item, index) => (
              <WhyChooseCard
                key={item.title}
                item={item}
                index={index}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ ...styles.section, ...styles.testimonialsSection }}>
        <div style={styles.container}>
          <SectionHeader
            labelIcon="💬"
            label="Testimonials"
            title="What Our Travelers Say"
            subtitle="Don't just take our word for it — hear from adventurers who've experienced the Altuvera difference."
          />

          <div style={styles.testimonialsGrid}>
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.author}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ ...styles.section, ...styles.ctaSection }}>
        <div style={styles.container}>
          <motion.div
            style={styles.ctaCard}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div style={styles.ctaGlow} />
            <div style={styles.ctaContent}>
              <motion.h2
                style={styles.ctaTitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Ready to Start Your Journey?
              </motion.h2>
              <motion.p
                style={styles.ctaText}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Contact our expert team today and let us help you plan the 
                adventure of a lifetime across the breathtaking landscapes of East Africa.
              </motion.p>
              <motion.div
                style={styles.ctaButtons}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  to="/booking"
                  variant="white"
                  size="large"
                  icon={<FiArrowRight size={18} />}
                >
                  Start Planning
                </Button>
                <Button
                  to="/contact"
                  variant="outline"
                  size="large"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    color: 'white',
                    backgroundColor: 'transparent',
                  }}
                >
                  Contact Us
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;
