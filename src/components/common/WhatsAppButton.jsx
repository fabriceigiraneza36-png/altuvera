import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Admin Contact Information
const CONTACT_INFO = {
  name: "IGIRANEZA Fabrice",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792 352 409",
};

// Preset message templates
const PRESET_MESSAGES = [
  { id: 1, label: "General Inquiry", emoji: "💬", message: "Hello! I'm interested in learning more about your travel services." },
  { id: 2, label: "Book a Trip", emoji: "✈️", message: "Hi! I would like to book a trip. Can you help me?" },
  { id: 3, label: "Tour Packages", emoji: "🎒", message: "Hello! I'm interested in your tour packages." },
  { id: 4, label: "Custom Itinerary", emoji: "📋", message: "Hi! I need help creating a custom travel itinerary." },
  { id: 5, label: "Get Support", emoji: "🤝", message: "Hello! I need assistance with my booking." },
  { id: 6, label: "Price Quote", emoji: "💰", message: "Hi! Can I get a price quote for your services?" },
];

// Modern SVG Icons Component
const Icons = {
  WhatsApp: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Close: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  Send: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  User: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Message: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Chat: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  Sparkles: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3L14.5 8.5L20 9.27L16 13.14L16.94 18.63L12 16L7.06 18.63L8 13.14L4 9.27L9.5 8.5L12 3Z"/>
      <circle cx="19" cy="5" r="2" fill={color} opacity="0.6"/>
      <circle cx="5" cy="19" r="1.5" fill={color} opacity="0.4"/>
    </svg>
  ),
  ArrowRight: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  ArrowLeft: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Check: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Phone: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  ),
  Shield: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <polyline points="9 12 11 14 15 10" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  Rocket: ({ size = 24, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
    </svg>
  ),
};

// Confetti Animation Function
const fireConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999999 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);

    // Green and white themed confetti
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#25D366', '#128C7E', '#ffffff', '#34eb83', '#0a6847'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#25D366', '#128C7E', '#ffffff', '#34eb83', '#dcfce7'],
    });
  }, 250);

  // Initial burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#25D366', '#128C7E', '#ffffff', '#34eb83'],
    zIndex: 9999999,
  });
};

// Success celebration with multiple effects
const celebrateSuccess = () => {
  // Fire main confetti
  fireConfetti();

  // Side cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#25D366', '#128C7E', '#ffffff'],
      zIndex: 9999999,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#25D366', '#128C7E', '#ffffff'],
      zIndex: 9999999,
    });
  }, 200);

  // Star burst
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 20,
      shapes: ['star'],
      colors: ['#FFD700', '#25D366', '#ffffff'],
      origin: { x: 0.5, y: 0.5 },
      zIndex: 9999999,
    });
  }, 400);
};

const WhatsAppButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const modalRef = useRef(null);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show button after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Responsive breakpoints
  const isMobile = windowWidth < 480;
  const isTablet = windowWidth >= 480 && windowWidth < 768;

  const formatPhoneNumber = useCallback((phone) => phone.replace(/\D/g, ''), []);

  const generateWhatsAppURL = useCallback((message = '') => {
    const phone = formatPhoneNumber(CONTACT_INFO.whatsapp);
    
    // Using api.whatsapp.com for better compatibility
    if (message) {
      const formattedMessage = userName 
        ? `Hi, I'm ${userName}.\n\n${message}` 
        : message;
      return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(formattedMessage)}&type=phone_number&app_absent=0`;
    }
    return `https://api.whatsapp.com/send/?phone=${phone}&type=phone_number&app_absent=0`;
  }, [formatPhoneNumber, userName]);

  const handleSkipToWhatsApp = useCallback(() => {
    setIsSending(true);
    setShowSuccess(true);
    celebrateSuccess();
    
    setTimeout(() => {
      window.open(generateWhatsAppURL(), '_blank');
      setIsSending(false);
      setTimeout(() => handleCloseModal(), 500);
    }, 1500);
  }, [generateWhatsAppURL]);

  const handleSendMessage = useCallback(() => {
    setIsSending(true);
    const message = selectedPreset 
      ? PRESET_MESSAGES.find(p => p.id === selectedPreset)?.message
      : customMessage;
    
    setShowSuccess(true);
    celebrateSuccess();

    setTimeout(() => {
      window.open(generateWhatsAppURL(message), '_blank');
      setIsSending(false);
      setTimeout(() => handleCloseModal(), 500);
    }, 1500);
  }, [selectedPreset, customMessage, generateWhatsAppURL]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setSelectedPreset(null);
      setCustomMessage('');
      setUserName('');
      setShowSuccess(false);
    }, 300);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // Animation Variants
  const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.4, 1],
    opacity: [0.6, 0, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 100 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 100,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const successVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    }
  };

  // Dynamic styles based on screen size
  const getResponsiveStyles = () => ({
    modal: {
      width: isMobile ? '95vw' : isTablet ? '85vw' : '400px',
      maxWidth: '420px',
      maxHeight: isMobile ? '85vh' : '90vh',
      margin: isMobile ? '10px' : '20px',
    },
    header: {
      padding: isMobile ? '20px 16px 16px' : '28px 24px 20px',
    },
    content: {
      padding: isMobile ? '12px 16px' : '16px 24px',
    },
    presetGrid: {
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    },
  });

  const responsiveStyles = getResponsiveStyles();

  return (
    <>
      {/* Floating WhatsApp Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            style={styles.buttonWrapper}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Multiple Pulse Rings */}
            <motion.div style={styles.pulseRing} animate={pulseAnimation} />
            <motion.div 
              style={{ ...styles.pulseRing, ...styles.pulseRing2 }} 
              animate={{ ...pulseAnimation, transition: { ...pulseAnimation.transition, delay: 0.5 } }} 
            />
            
            {/* Main Button */}
            <motion.button
              style={styles.floatingBtn}
              animate={floatingAnimation}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsModalOpen(true)}
              aria-label="Contact us on WhatsApp"
            >
              <Icons.WhatsApp size={isMobile ? 22 : 26} color="#fff" />
              
              {/* Notification Badge */}
              <motion.div
                style={styles.badge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, type: 'spring' }}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  1
                </motion.span>
              </motion.div>
            </motion.button>

            {/* Animated Tooltip */}
            <motion.div
              style={styles.tooltip}
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💬
              </motion.span>
              <span>Chat Now!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              ref={modalRef}
              style={{ ...styles.modal, ...responsiveStyles.modal }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Elements */}
              <div style={styles.decorCircle1} />
              <div style={styles.decorCircle2} />

              {/* Close Button */}
              <motion.button
                style={styles.closeBtn}
                onClick={handleCloseModal}
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: '#fee2e2' }}
                whileTap={{ scale: 0.9 }}
              >
                <Icons.Close size={14} color="#666" />
              </motion.button>

              {/* Success State */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    style={styles.successOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      style={styles.successContent}
                      variants={successVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div
                        style={styles.successIcon}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 0.5, repeat: 2 }}
                      >
                        <Icons.Rocket size={40} color="#fff" />
                      </motion.div>
                      <motion.h3
                        style={styles.successTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Opening WhatsApp!
                      </motion.h3>
                      <motion.p
                        style={styles.successText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Redirecting you now...
                      </motion.p>
                      <motion.div
                        style={styles.loadingDots}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            style={styles.dot}
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <motion.div 
                style={{ ...styles.header, ...responsiveStyles.header }}
                variants={itemVariants}
              >
                <motion.div
                  style={styles.iconCircle}
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                  animate={{ 
                    boxShadow: [
                      '0 8px 30px rgba(37, 211, 102, 0.3)',
                      '0 8px 40px rgba(37, 211, 102, 0.5)',
                      '0 8px 30px rgba(37, 211, 102, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icons.WhatsApp size={28} color="#fff" />
                </motion.div>
                
                <motion.h3 
                  style={styles.title}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Let's Connect!
                </motion.h3>
                
                <motion.p 
                  style={styles.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Chat with <strong style={{ color: '#128C7E' }}>{CONTACT_INFO.name}</strong>
                </motion.p>
                
                <motion.div 
                  style={styles.phoneTag}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Icons.Phone size={12} color="#128C7E" />
                  <span>{CONTACT_INFO.whatsappDisplay}</span>
                </motion.div>
              </motion.div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    style={{ ...styles.content, ...responsiveStyles.content }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <motion.p style={styles.choiceLabel} variants={itemVariants}>
                      How would you like to start?
                    </motion.p>

                    <div style={styles.optionsList}>
                      {/* Quick Message Option */}
                      <motion.button
                        style={styles.optionCard}
                        onClick={() => setStep(2)}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -4,
                          boxShadow: '0 12px 30px rgba(37, 211, 102, 0.2)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <motion.div 
                          style={styles.optionIconBox}
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                        >
                          <Icons.Chat size={22} color="#fff" />
                        </motion.div>
                        <div style={styles.optionInfo}>
                          <strong style={styles.optionTitle}>Send Quick Message</strong>
                          <span style={styles.optionDesc}>Choose preset or write custom</span>
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Icons.ArrowRight size={18} color="#128C7E" />
                        </motion.div>
                      </motion.button>

                      {/* Skip Option */}
                      <motion.button
                        style={{ ...styles.optionCard, ...styles.skipCard }}
                        onClick={handleSkipToWhatsApp}
                        whileHover={{ 
                          scale: 1.02, 
                          y: -4,
                          boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                        disabled={isSending}
                      >
                        <motion.div 
                          style={{ ...styles.optionIconBox, ...styles.skipIconBox }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                          <Icons.Sparkles size={22} color="#fff" />
                        </motion.div>
                        <div style={styles.optionInfo}>
                          <strong style={styles.optionTitle}>Skip to WhatsApp</strong>
                          <span style={styles.optionDesc}>Open chat directly</span>
                        </div>
                        <Icons.WhatsApp size={20} color="#128C7E" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    style={{ ...styles.content, ...responsiveStyles.content }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {/* Back Button */}
                    <motion.button
                      style={styles.backBtn}
                      onClick={() => setStep(1)}
                      whileHover={{ x: -5, color: '#0a6847' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icons.ArrowLeft size={14} color="#128C7E" />
                      <span>Back</span>
                    </motion.button>

                    {/* Name Input */}
                    <motion.div style={styles.inputGroup} variants={itemVariants}>
                      <label style={styles.label}>
                        <Icons.User size={14} color="#25D366" />
                        <span>Your Name</span>
                        <span style={styles.optional}>(Optional)</span>
                      </label>
                      <motion.input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name..."
                        style={styles.input}
                        whileFocus={{ 
                          borderColor: '#25D366',
                          boxShadow: '0 0 0 3px rgba(37, 211, 102, 0.15)'
                        }}
                      />
                    </motion.div>

                    {/* Preset Messages */}
                    <motion.div style={styles.inputGroup} variants={itemVariants}>
                      <label style={styles.label}>
                        <Icons.Message size={14} color="#25D366" />
                        <span>Quick Messages</span>
                      </label>
                      <div style={{ ...styles.presetGrid, ...responsiveStyles.presetGrid }}>
                        {PRESET_MESSAGES.map((preset, index) => (
                          <motion.button
                            key={preset.id}
                            style={{
                              ...styles.presetBtn,
                              ...(selectedPreset === preset.id && styles.presetActive),
                            }}
                            onClick={() => {
                              setSelectedPreset(preset.id);
                              setCustomMessage('');
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              scale: 1.03,
                              borderColor: '#25D366',
                              backgroundColor: selectedPreset === preset.id ? '#dcfce7' : '#f0fdf4'
                            }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <motion.span 
                              style={styles.presetEmoji}
                              animate={selectedPreset === preset.id ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {preset.emoji}
                            </motion.span>
                            <span style={styles.presetLabel}>{preset.label}</span>
                            <AnimatePresence>
                              {selectedPreset === preset.id && (
                                <motion.span
                                  style={styles.checkBadge}
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                >
                                  <Icons.Check size={10} color="#fff" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Custom Message */}
                    <motion.div style={styles.inputGroup} variants={itemVariants}>
                      <label style={styles.label}>
                        <span>Or write your own</span>
                      </label>
                      <motion.textarea
                        value={customMessage}
                        onChange={(e) => {
                          setCustomMessage(e.target.value);
                          setSelectedPreset(null);
                        }}
                        placeholder="Type your message here..."
                        style={styles.textarea}
                        rows={2}
                        whileFocus={{ 
                          borderColor: '#25D366',
                          boxShadow: '0 0 0 3px rgba(37, 211, 102, 0.15)'
                        }}
                      />
                      {customMessage && (
                        <motion.span 
                          style={styles.charCount}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {customMessage.length} characters
                        </motion.span>
                      )}
                    </motion.div>

                    {/* Send Button */}
                    <motion.button
                      style={{
                        ...styles.sendBtn,
                        opacity: (!selectedPreset && !customMessage) ? 0.5 : 1,
                        cursor: (!selectedPreset && !customMessage) ? 'not-allowed' : 'pointer',
                      }}
                      onClick={handleSendMessage}
                      disabled={!selectedPreset && !customMessage || isSending}
                      whileHover={(selectedPreset || customMessage) ? { 
                        scale: 1.02,
                        boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4)'
                      } : {}}
                      whileTap={(selectedPreset || customMessage) ? { scale: 0.98 } : {}}
                      variants={itemVariants}
                    >
                      {isSending ? (
                        <motion.div style={styles.spinnerWrapper}>
                          <motion.div
                            style={styles.spinner}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          <span>Preparing...</span>
                        </motion.div>
                      ) : (
                        <>
                          <Icons.Send size={16} color="#fff" />
                          <span>Send & Open WhatsApp</span>
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <motion.div 
                style={styles.footer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Icons.Shield size={14} color="#25D366" />
                <span>Secure & Private Conversation</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Styles
const styles = {
  // Floating Button
  buttonWrapper: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pulseRing: {
    position: 'absolute',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#25D366',
    left: '0',
    top: '0',
  },
  pulseRing2: {
    animationDelay: '0.5s',
  },
  floatingBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.5)',
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
  },
  tooltip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fff',
    color: '#128C7E',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap',
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    zIndex: 9999999,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
  },
  decorCircle1: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.05) 100%)',
    pointerEvents: 'none',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: '-30px',
    left: '-30px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s',
  },

  // Success Overlay
  successOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderRadius: '24px',
  },
  successContent: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 40px rgba(37, 211, 102, 0.4)',
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px',
  },
  successText: {
    fontSize: '0.95rem',
    color: '#666',
    margin: 0,
  },
  loadingDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '20px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#25D366',
  },

  // Header
  header: {
    textAlign: 'center',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
    position: 'relative',
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    boxShadow: '0 8px 30px rgba(37, 211, 102, 0.35)',
  },
  title: {
    margin: '0 0 6px',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '0 0 12px',
    fontSize: '0.9rem',
    color: '#666',
  },
  phoneTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e8f5e9',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#128C7E',
    fontWeight: '600',
  },

  // Content
  content: {
    position: 'relative',
  },
  choiceLabel: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '16px',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: '#f8fdf9',
    border: '2px solid #e8f5e9',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%',
  },
  skipCard: {
    backgroundColor: '#fafafa',
    borderColor: '#eee',
  },
  optionIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  skipIconBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  optionInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  optionTitle: {
    fontSize: '0.95rem',
    color: '#1a1a1a',
  },
  optionDesc: {
    fontSize: '0.8rem',
    color: '#888',
  },

  // Step 2
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#128C7E',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '16px',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  optional: {
    fontSize: '0.75rem',
    color: '#999',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e8f5e9',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    backgroundColor: '#fafffe',
  },
  presetGrid: {
    display: 'grid',
    gap: '8px',
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#fafffe',
    border: '2px solid #e8f5e9',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%',
  },
  presetActive: {
    borderColor: '#25D366',
    backgroundColor: '#dcfce7',
  },
  presetEmoji: {
    fontSize: '1.2rem',
  },
  presetLabel: {
    flex: 1,
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#333',
  },
  checkBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e8f5e9',
    fontSize: '0.9rem',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '70px',
    transition: 'all 0.2s',
    backgroundColor: '#fafffe',
  },
  charCount: {
    display: 'block',
    textAlign: 'right',
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '4px',
  },
  sendBtn: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
  },
  spinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
  },

  // Footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px 18px',
    fontSize: '0.8rem',
    color: '#888',
    borderTop: '1px solid #f0f0f0',
  },
};

export default WhatsAppButton;