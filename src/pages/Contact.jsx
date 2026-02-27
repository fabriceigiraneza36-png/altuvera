import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare, 
  FiGlobe, FiCheckCircle, FiUser, FiAlertCircle, FiChevronDown,
  FiCalendar, FiUsers, FiStar, FiArrowRight, FiMessageCircle,
  FiHelpCircle, FiChevronRight, FiX, FiCheck, FiZap, FiHeart,
  FiAward, FiShield, FiHeadphones, FiCoffee
} from 'react-icons/fi';
import { 
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedinIn,
  FaWhatsapp, FaTiktok, FaPinterestP
} from 'react-icons/fa';
import { HiSparkles, HiLocationMarker, HiOutlineMail } from 'react-icons/hi';
import { BiSupport } from 'react-icons/bi';
import { RiSendPlaneFill } from 'react-icons/ri';

// ============================================
// THEME CONFIGURATION
// ============================================
const theme = {
  colors: {
    primary: '#059669',
    primaryLight: '#10B981',
    primaryDark: '#047857',
    primaryGlow: 'rgba(5, 150, 105, 0.4)',
    secondary: '#064E3B',
    accent: '#34D399',
    white: '#FFFFFF',
    offWhite: '#F0FDF4',
    background: '#ECFDF5',
    backgroundAlt: '#D1FAE5',
    text: '#1F2937',
    textLight: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
    primaryReverse: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
    hero: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
    soft: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #D1FAE5 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    glow: 'radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0 4px 20px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 40px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 80px rgba(0, 0, 0, 0.12)',
    glow: '0 0 40px rgba(5, 150, 105, 0.3)',
    glowLg: '0 0 60px rgba(5, 150, 105, 0.4)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
};

// ============================================
// ANIMATION VARIANTS
// ============================================
const animations = {
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  },
  float: {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(5, 150, 105, 0.2)',
        '0 0 40px rgba(5, 150, 105, 0.4)',
        '0 0 20px rgba(5, 150, 105, 0.2)',
      ],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  }
};

// ============================================
// VALIDATION RULES
// ============================================
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    messages: {
      required: 'Please enter your full name',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must be less than 50 characters',
      pattern: 'Please enter a valid name',
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: 'Email address is required',
      pattern: 'Please enter a valid email address',
    },
  },
  phone: {
    required: false,
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    messages: {
      pattern: 'Please enter a valid phone number',
    },
  },
  subject: {
    required: true,
    minLength: 5,
    maxLength: 100,
    messages: {
      required: 'Please enter a subject',
      minLength: 'Subject must be at least 5 characters',
      maxLength: 'Subject must be less than 100 characters',
    },
  },
  message: {
    required: true,
    minLength: 20,
    maxLength: 2000,
    messages: {
      required: 'Please enter your message',
      minLength: 'Please provide more details (at least 20 characters)',
      maxLength: 'Message must be less than 2000 characters',
    },
  },
};

// ============================================
// FLOATING DECORATIONS COMPONENT
// ============================================
const FloatingDecorations = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  }}>
    {/* Large gradient circles */}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%)',
      }}
    />
    <motion.div
      animate={{ 
        scale: [1.2, 1, 1.2],
        rotate: [360, 180, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
      }}
    />
    
    {/* Floating shapes */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.sin(i) * 20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5,
        }}
        style={{
          position: 'absolute',
          top: `${15 + i * 15}%`,
          left: `${5 + i * 15}%`,
          width: `${20 + i * 8}px`,
          height: `${20 + i * 8}px`,
          borderRadius: i % 2 === 0 ? '50%' : '30%',
          background: i % 3 === 0 
            ? 'rgba(5, 150, 105, 0.1)' 
            : i % 3 === 1 
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(52, 211, 153, 0.06)',
          border: '1px solid rgba(5, 150, 105, 0.1)',
        }}
      />
    ))}
    
    {/* Grid pattern overlay */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(rgba(5, 150, 105, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(5, 150, 105, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}/>
  </div>
);

// ============================================
// ANIMATED INPUT COMPONENT
// ============================================
const AnimatedInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  required, 
  error, 
  touched,
  icon: Icon,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: '20px' }}
    >
      <label style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
        color: hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.text,
        transition: 'color 0.3s ease',
      }}>
        {Icon && <Icon size={14} style={{ marginRight: '8px', opacity: 0.7 }} />}
        {label}
        {required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
      </label>
      
      <div style={{ position: 'relative' }}>
        <motion.input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          placeholder={placeholder}
          disabled={disabled}
          whileFocus={{ scale: 1.01 }}
          style={{
            width: '100%',
            padding: '16px 48px 16px 20px',
            fontSize: '15px',
            fontFamily: "'Inter', sans-serif",
            border: `2px solid ${hasError ? theme.colors.error : isFocused ? theme.colors.primary : isValid ? theme.colors.success : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            outline: 'none',
            backgroundColor: isFocused ? theme.colors.white : theme.colors.offWhite,
            boxShadow: isFocused 
              ? `0 0 0 4px ${hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(5, 150, 105, 0.1)'}`
              : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        />
        
        {/* Animated border effect */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '5%',
            width: '90%',
            height: '3px',
            background: theme.gradients.primary,
            borderRadius: '0 0 16px 16px',
            transformOrigin: 'center',
          }}
        />
        
        {/* Status icons */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <FiAlertCircle size={20} color={theme.colors.error} />
            </motion.div>
          )}
          {isValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <FiCheckCircle size={20} color={theme.colors.success} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
              fontSize: '13px',
              color: theme.colors.error,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiAlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// ANIMATED SELECT COMPONENT
// ============================================
const AnimatedSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  options, 
  placeholder,
  icon: Icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: '20px' }}
    >
      <label style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
        color: isFocused ? theme.colors.primary : theme.colors.text,
        transition: 'color 0.3s ease',
      }}>
        {Icon && <Icon size={14} style={{ marginRight: '8px', opacity: 0.7 }} />}
        {label}
      </label>
      
      <div style={{ position: 'relative' }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => { setIsFocused(true); setIsOpen(true); }}
          onBlur={(e) => { setIsFocused(false); setIsOpen(false); onBlur?.(e); }}
          style={{
            width: '100%',
            padding: '16px 48px 16px 20px',
            fontSize: '15px',
            fontFamily: "'Inter', sans-serif",
            border: `2px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            outline: 'none',
            backgroundColor: isFocused ? theme.colors.white : theme.colors.offWhite,
            boxShadow: isFocused ? `0 0 0 4px rgba(5, 150, 105, 0.1)` : 'none',
            cursor: 'pointer',
            appearance: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: isFocused ? theme.colors.primary : theme.colors.textMuted,
          }}
        >
          <FiChevronDown size={20} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// ANIMATED TEXTAREA COMPONENT
// ============================================
const AnimatedTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  required, 
  error, 
  touched,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = touched && error;
  const isValid = touched && !error && value;
  const charCount = value?.length || 0;
  const charPercentage = (charCount / maxLength) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: '20px' }}
    >
      <label style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
        color: hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.text,
        transition: 'color 0.3s ease',
      }}>
        <FiMessageSquare size={14} style={{ marginRight: '8px', opacity: 0.7 }} />
        {label}
        {required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
      </label>
      
      <div style={{ position: 'relative' }}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: '16px 20px',
            paddingBottom: '45px',
            fontSize: '15px',
            fontFamily: "'Inter', sans-serif",
            border: `2px solid ${hasError ? theme.colors.error : isFocused ? theme.colors.primary : isValid ? theme.colors.success : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            outline: 'none',
            backgroundColor: isFocused ? theme.colors.white : theme.colors.offWhite,
            boxShadow: isFocused 
              ? `0 0 0 4px ${hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(5, 150, 105, 0.1)'}`
              : 'none',
            resize: 'vertical',
            minHeight: '160px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box',
          }}
        />
        
        {/* Character counter with progress bar */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: theme.colors.border,
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${charPercentage}%` }}
              style={{
                height: '100%',
                background: charPercentage > 90 
                  ? theme.colors.error 
                  : charPercentage > 70 
                    ? theme.colors.warning 
                    : theme.gradients.primary,
                borderRadius: '2px',
              }}
            />
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: '500',
            color: charPercentage > 90 ? theme.colors.error : theme.colors.textMuted,
          }}>
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
      
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
              fontSize: '13px',
              color: theme.colors.error,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FiAlertCircle size={14} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// CONTACT INFO CARD COMPONENT
// ============================================
const ContactInfoCard = ({ icon: Icon, title, lines, color, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={animations.staggerItem}
      whileHover={{ x: 8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '20px',
        padding: '24px',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        boxShadow: isHovered ? `0 20px 40px ${color}25` : theme.shadows.md,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        border: `2px solid ${isHovered ? color : 'transparent'}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effect */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0] }}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: theme.borderRadius.lg,
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.white,
          flexShrink: 0,
          boxShadow: `0 8px 24px ${color}40`,
          position: 'relative',
        }}
      >
        <Icon size={26} />
      </motion.div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: theme.colors.text,
          marginBottom: '8px',
        }}>
          {title}
        </h4>
        {lines.map((line, i) => (
          <p key={i} style={{
            fontSize: '14px',
            color: theme.colors.textLight,
            marginBottom: '4px',
            lineHeight: '1.5',
          }}>
            {line}
          </p>
        ))}
      </div>
      
      {onClick && (
        <motion.div
          animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: color,
          }}
        >
          <FiChevronRight size={24} />
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// SOCIAL LINK COMPONENT
// ============================================
const SocialLink = ({ icon: Icon, color, name, url, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      variants={animations.staggerItem}
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        width: '50px',
        height: '50px',
        borderRadius: theme.borderRadius.lg,
        backgroundColor: isHovered ? color : theme.colors.offWhite,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHovered ? theme.colors.white : color,
        fontSize: '20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered ? `0 10px 30px ${color}40` : 'none',
        textDecoration: 'none',
      }}
    >
      <Icon />
    </motion.a>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ number, label, icon: Icon, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={animations.staggerItem}
      whileHover={{ y: -5, scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        backgroundColor: theme.colors.white,
        padding: '24px 20px',
        borderRadius: theme.borderRadius.xl,
        textAlign: 'center',
        boxShadow: isHovered ? theme.shadows.lg : theme.shadows.sm,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: theme.gradients.primary,
        }}
      />
      
      {Icon && (
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: theme.borderRadius.md,
            background: theme.colors.offWhite,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: theme.colors.primary,
          }}
        >
          <Icon size={20} />
        </motion.div>
      )}
      
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        style={{
          fontSize: '32px',
          fontWeight: '800',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '4px',
        }}
      >
        {number}
      </motion.div>
      <div style={{
        fontSize: '13px',
        color: theme.colors.textLight,
        fontWeight: '500',
      }}>
        {label}
      </div>
    </motion.div>
  );
};

// ============================================
// FAQ ITEM COMPONENT
// ============================================
const FAQItem = ({ question, answer, index, isOpen, onClick }) => {
  return (
    <motion.div
      variants={animations.staggerItem}
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        boxShadow: isOpen ? theme.shadows.lg : theme.shadows.sm,
        border: `2px solid ${isOpen ? theme.colors.primary : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ backgroundColor: theme.colors.offWhite }}
        style={{
          width: '100%',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          color: theme.colors.text,
          paddingRight: '20px',
        }}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: theme.borderRadius.full,
            backgroundColor: isOpen ? theme.colors.primary : theme.colors.offWhite,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOpen ? theme.colors.white : theme.colors.primary,
            flexShrink: 0,
          }}
        >
          <FiChevronDown size={20} />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              padding: '0 24px 24px',
              fontSize: '15px',
              color: theme.colors.textLight,
              lineHeight: '1.7',
            }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// SUCCESS ANIMATION COMPONENT
// ============================================
const SuccessAnimation = ({ email, onReset }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center',
        padding: '60px 40px',
        position: 'relative',
      }}
    >
      {/* Confetti effect */}
      <AnimatePresence>
        {showConfetti && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 1, 
              y: 0, 
              x: 0,
              scale: 1,
            }}
            animate={{ 
              opacity: 0, 
              y: -200 - Math.random() * 200,
              x: (Math.random() - 0.5) * 400,
              rotate: Math.random() * 720,
              scale: 0,
            }}
            transition={{ 
              duration: 2 + Math.random(),
              ease: "easeOut",
              delay: Math.random() * 0.5,
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              backgroundColor: [
                theme.colors.primary,
                theme.colors.primaryLight,
                theme.colors.accent,
                '#FFD700',
                '#FF69B4',
              ][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: theme.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: theme.shadows.glowLg,
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <FiCheckCircle size={56} color={theme.colors.white} />
        </motion.div>
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '36px',
          fontWeight: '700',
          color: theme.colors.text,
          marginBottom: '16px',
        }}
      >
        Message Sent! 🎉
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          fontSize: '16px',
          color: theme.colors.textLight,
          marginBottom: '32px',
          lineHeight: '1.7',
          maxWidth: '400px',
          margin: '0 auto 32px',
        }}
      >
        Thank you for reaching out! Our travel experts will review your inquiry 
        and get back to you within 24 hours.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          backgroundColor: theme.colors.offWhite,
          padding: '20px 28px',
          borderRadius: theme.borderRadius.xl,
          marginBottom: '32px',
          display: 'inline-block',
        }}
      >
        <p style={{ fontSize: '14px', color: theme.colors.textLight, marginBottom: '6px' }}>
          📧 Confirmation sent to:
        </p>
        <p style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.primary }}>
          {email}
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          style={{
            padding: '16px 32px',
            background: theme.gradients.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: theme.shadows.glow,
          }}
        >
          <FiSend size={18} />
          Send Another Message
        </motion.button>
        
        <motion.a
          href="/"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '16px 32px',
            backgroundColor: theme.colors.white,
            color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <FiArrowRight size={18} />
          Explore Safaris
        </motion.a>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// LIVE CHAT WIDGET COMPONENT
// ============================================
const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Chat button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: theme.gradients.primary,
          border: 'none',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows.glowLg,
          zIndex: 1000,
        }}
      >
        <FiMessageCircle size={28} color={theme.colors.white} />
        
        {/* Pulse ring */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `3px solid ${theme.colors.primary}`,
          }}
        />
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '380px',
              maxWidth: 'calc(100vw - 60px)',
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius['2xl'],
              boxShadow: theme.shadows.xl,
              overflow: 'hidden',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              background: theme.gradients.primary,
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <BiSupport size={24} color={theme.colors.white} />
                </div>
                <div>
                  <h4 style={{ color: theme.colors.white, fontWeight: '600', fontSize: '16px' }}>
                    Safari Support
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4ADE80',
                      marginRight: '6px',
                    }}/>
                    Online now
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white,
                  }}
                >
                  <FiChevronDown size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white,
                  }}
                >
                  <FiX size={18} />
                </motion.button>
              </div>
            </div>
            
            {/* Chat content */}
            {!isMinimized && (
              <>
                <div style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  backgroundColor: theme.colors.offWhite,
                }}>
                  {/* Welcome message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: theme.colors.white,
                      padding: '16px',
                      borderRadius: '16px 16px 16px 4px',
                      maxWidth: '85%',
                      boxShadow: theme.shadows.sm,
                    }}
                  >
                    <p style={{ fontSize: '14px', color: theme.colors.text, marginBottom: '8px' }}>
                      👋 Hello! Welcome to Altuvera Safaris!
                    </p>
                    <p style={{ fontSize: '14px', color: theme.colors.textLight }}>
                      How can we help you plan your African adventure today?
                    </p>
                  </motion.div>
                  
                  {/* Quick replies */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {['Safari packages', 'Best time to visit', 'Group bookings', 'Custom itinerary'].map((text, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: theme.colors.white,
                          border: `1px solid ${theme.colors.primary}`,
                          borderRadius: theme.borderRadius.full,
                          fontSize: '13px',
                          color: theme.colors.primary,
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        {text}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                
                {/* Input area */}
                <div style={{
                  padding: '16px',
                  borderTop: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  gap: '12px',
                }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.full,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: theme.gradients.primary,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RiSendPlaneFill size={20} color={theme.colors.white} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// MAIN CONTACT COMPONENT
// ============================================
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tripType: '',
    travelDate: '',
    travelers: '',
  });
  
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);
  
  const formRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Validation
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    if (rules.required && !value?.trim()) return rules.messages.required;
    if (value && rules.minLength && value.length < rules.minLength) return rules.messages.minLength;
    if (value && rules.maxLength && value.length > rules.maxLength) return rules.messages.maxLength;
    if (value && rules.pattern && !rules.pattern.test(value)) return rules.messages.pattern;
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitProgress(0);

    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearInterval(progressInterval);
    setSubmitProgress(100);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '', email: '', phone: '', subject: '',
      message: '', tripType: '', travelDate: '', travelers: '',
    });
    setTouched({});
    setErrors({});
    setSubmitProgress(0);
  };

  // Data
  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Visit Our Office',
      lines: ['Altuvera House, Safari Way', 'Westlands, Nairobi, Kenya'],
      color: theme.colors.primary,
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      lines: ['+254 700 123 456', '+254 733 987 654'],
      color: '#3B82F6',
    },
    {
      icon: FiMail,
      title: 'Email Us',
      lines: ['hello@altuvera.com', 'bookings@altuvera.com'],
      color: '#8B5CF6',
    },
    {
      icon: FiClock,
      title: 'Working Hours',
      lines: ['Mon - Fri: 8AM - 6PM EAT', 'Sat: 9AM - 2PM EAT'],
      color: '#F59E0B',
    },
  ];

  const tripTypes = [
    { value: 'safari', label: '🦁 Safari Adventure' },
    { value: 'mountain', label: '⛰️ Mountain Trekking' },
    { value: 'gorilla', label: '🦍 Gorilla Trekking' },
    { value: 'beach', label: '🏖️ Beach Holiday' },
    { value: 'cultural', label: '🎭 Cultural Tour' },
    { value: 'photography', label: '📷 Photography Safari' },
    { value: 'honeymoon', label: '💕 Honeymoon' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family Trip' },
  ];

  const socialLinks = [
    { icon: FaFacebookF, color: '#1877F2', name: 'Facebook', url: '#' },
    { icon: FaInstagram, color: '#E4405F', name: 'Instagram', url: '#' },
    { icon: FaTwitter, color: '#1DA1F2', name: 'Twitter', url: '#' },
    { icon: FaYoutube, color: '#FF0000', name: 'YouTube', url: '#' },
    { icon: FaLinkedinIn, color: '#0A66C2', name: 'LinkedIn', url: '#' },
    { icon: FaWhatsapp, color: '#25D366', name: 'WhatsApp', url: '#' },
    { icon: FaTiktok, color: '#000000', name: 'TikTok', url: '#' },
    { icon: FaPinterestP, color: '#E60023', name: 'Pinterest', url: '#' },
  ];

  const stats = [
    { number: '24h', label: 'Response Time', icon: FiClock },
    { number: '98%', label: 'Satisfaction', icon: FiHeart },
    { number: '15+', label: 'Years Experience', icon: FiAward },
    { number: '10K+', label: 'Happy Travelers', icon: FiUsers },
  ];

  const faqs = [
    {
      question: 'How far in advance should I book my safari?',
      answer: 'We recommend booking at least 3-6 months in advance, especially for peak season (June-October and December-February). This ensures availability at the best lodges and camps.',
    },
    {
      question: 'What is included in your safari packages?',
      answer: 'Our packages typically include accommodation, all meals, game drives, park fees, airport transfers, and a professional guide. International flights are usually not included.',
    },
    {
      question: 'Is it safe to go on safari in East Africa?',
      answer: 'Yes! East Africa is very safe for tourists. Our experienced guides prioritize your safety, and we only work with reputable lodges and camps that maintain high security standards.',
    },
    {
      question: 'Can you customize an itinerary for me?',
      answer: 'Absolutely! We specialize in creating custom itineraries tailored to your interests, budget, and timeframe. Just fill out the contact form with your preferences.',
    },
  ];

  const quickContactOptions = [
    {
      icon: FaWhatsapp,
      color: '#25D366',
      title: 'WhatsApp',
      subtitle: 'Chat instantly',
      action: '+254 700 123 456',
      href: 'https://wa.me/254700123456',
    },
    {
      icon: FiPhone,
      color: '#3B82F6',
      title: 'Call Us',
      subtitle: 'Speak with an expert',
      action: '+254 700 123 456',
      href: 'tel:+254700123456',
    },
    {
      icon: FiMail,
      color: '#8B5CF6',
      title: 'Email',
      subtitle: 'Get detailed info',
      action: 'hello@altuvera.com',
      href: 'mailto:hello@altuvera.com',
    },
  ];

  return (
    <div style={{ backgroundColor: theme.colors.background, minHeight: '100vh' }}>
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <motion.section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.gradients.hero,
          overflow: 'hidden',
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -1000],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
              style={{
                position: 'absolute',
                bottom: '-50px',
                left: `${Math.random() * 100}%`,
                width: '2px',
                height: '100px',
                background: `linear-gradient(to top, transparent, rgba(255,255,255,${0.1 + Math.random() * 0.2}), transparent)`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '900px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: theme.borderRadius.full,
              marginBottom: '24px',
            }}
          >
            <HiSparkles color={theme.colors.accent} size={18} />
            <span style={{ color: theme.colors.white, fontSize: '14px', fontWeight: '500' }}>
              Your Safari Adventure Starts Here
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 8vw, 72px)',
              fontWeight: '700',
              color: theme.colors.white,
              marginBottom: '20px',
              lineHeight: '1.1',
            }}
          >
            Let's Plan Your
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #34D399, #6EE7B7, #A7F3D0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Dream Safari
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.7',
            }}
          >
            Connect with our expert team and let us craft an unforgettable 
            African adventure tailored just for you.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <motion.a
              href="#contact-form"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '18px 36px',
                background: theme.colors.white,
                color: theme.colors.primary,
                borderRadius: theme.borderRadius.full,
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
            >
              <FiSend size={18} />
              Send Message
            </motion.a>
            <motion.a
              href="tel:+254700123456"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '18px 36px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: theme.colors.white,
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: theme.borderRadius.full,
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <FiPhone size={18} />
              Call Us Now
            </motion.a>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div style={{
            width: '30px',
            height: '50px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '10px',
          }}>
            <motion.div
              animate={{ y: [0, 15, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '4px',
                height: '10px',
                backgroundColor: theme.colors.white,
                borderRadius: '2px',
              }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* ============================================
          MAIN CONTENT SECTION
          ============================================ */}
      <section
        id="contact-form"
        style={{
          position: 'relative',
          padding: '100px 24px',
          background: theme.gradients.soft,
        }}
      >
        <FloatingDecorations />
        
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Section header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={animations.fadeInUp}
            style={{
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            <motion.div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderRadius: theme.borderRadius.full,
                marginBottom: '20px',
              }}
            >
              <FiMessageSquare size={16} color={theme.colors.primary} />
              <span style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: '600' }}>
                Get In Touch
              </span>
            </motion.div>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '16px',
            }}>
              We'd Love to Hear From You
            </h2>
            <p style={{
              fontSize: '18px',
              color: theme.colors.textLight,
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              Have questions about your dream safari? Our team of Africa travel 
              experts is here to help make it happen.
            </p>
          </motion.div>

          {/* Main grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '40px',
          }}>
            {/* Left column - Contact info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={animations.fadeInLeft}
              style={{
                gridColumn: 'span 12',
                '@media (min-width: 1024px)': {
                  gridColumn: 'span 5',
                },
              }}
              className="contact-info-column"
            >
              <div style={{ position: 'sticky', top: '100px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '32px',
                  fontWeight: '700',
                  color: theme.colors.text,
                  marginBottom: '16px',
                }}>
                  Contact Information
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: theme.colors.textLight,
                  lineHeight: '1.7',
                  marginBottom: '32px',
                }}>
                  Reach out through any channel that works best for you. 
                  We're here to help plan your perfect African adventure.
                </p>

                <motion.div
                  variants={animations.staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    marginBottom: '32px',
                  }}
                >
                  {contactInfo.map((info, index) => (
                    <ContactInfoCard key={index} {...info} index={index} />
                  ))}
                </motion.div>

                {/* Social links */}
                <motion.div
                  variants={animations.fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  style={{
                    backgroundColor: theme.colors.white,
                    padding: '28px',
                    borderRadius: theme.borderRadius.xl,
                    boxShadow: theme.shadows.md,
                    marginBottom: '32px',
                  }}
                >
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: theme.colors.text,
                    marginBottom: '20px',
                  }}>
                    Follow Our Adventures
                  </h4>
                  <motion.div
                    variants={animations.staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    {socialLinks.map((social, index) => (
                      <SocialLink key={index} {...social} index={index} />
                    ))}
                  </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={animations.staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                  }}
                >
                  {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} index={index} />
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Right column - Contact form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={animations.fadeInRight}
              style={{
                gridColumn: 'span 12',
              }}
              className="contact-form-column"
            >
              <motion.div
                ref={formRef}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.borderRadius['2xl'],
                  padding: 'clamp(30px, 5vw, 60px)',
                  boxShadow: theme.shadows.xl,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: '-100px',
                  right: '-100px',
                  width: '300px',
                  height: '300px',
                  background: theme.gradients.glow,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: '-50px',
                  left: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}/>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <SuccessAnimation email={formData.email} onReset={resetForm} />
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {/* Form header */}
                      <div style={{ position: 'relative', marginBottom: '40px' }}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: theme.colors.offWhite,
                            borderRadius: theme.borderRadius.full,
                            marginBottom: '16px',
                          }}
                        >
                          <FiStar size={14} color={theme.colors.primary} />
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: theme.colors.primary,
                          }}>
                            Personal Travel Consultation
                          </span>
                        </motion.div>
                        
                        <h3 style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 'clamp(28px, 4vw, 36px)',
                          fontWeight: '700',
                          color: theme.colors.text,
                          marginBottom: '12px',
                        }}>
                          Plan Your Dream Safari
                        </h3>
                        <p style={{
                          fontSize: '16px',
                          color: theme.colors.textLight,
                          lineHeight: '1.7',
                        }}>
                          Share your travel dreams with us and we'll create a 
                          customized itinerary just for you.
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '20px',
                        }} className="form-grid">
                          <div style={{ gridColumn: 'span 2' }} className="form-field-full">
                            <AnimatedInput
                              label="Full Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="John Smith"
                              required
                              error={errors.name}
                              touched={touched.name}
                              icon={FiUser}
                            />
                          </div>

                          <div className="form-field-half">
                            <AnimatedInput
                              label="Email Address"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="john@example.com"
                              required
                              error={errors.email}
                              touched={touched.email}
                              icon={FiMail}
                            />
                          </div>

                          <div className="form-field-half">
                            <AnimatedInput
                              label="Phone Number"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="+1 234 567 8900"
                              error={errors.phone}
                              touched={touched.phone}
                              icon={FiPhone}
                            />
                          </div>

                          <div className="form-field-half">
                            <AnimatedSelect
                              label="Trip Type"
                              name="tripType"
                              value={formData.tripType}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              options={tripTypes}
                              placeholder="Select your adventure"
                              icon={FiGlobe}
                            />
                          </div>

                          <div className="form-field-half">
                            <AnimatedInput
                              label="Preferred Travel Date"
                              name="travelDate"
                              type="date"
                              value={formData.travelDate}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              icon={FiCalendar}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }} className="form-field-full">
                            <AnimatedSelect
                              label="Number of Travelers"
                              name="travelers"
                              value={formData.travelers}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              options={[
                                { value: '1', label: '1 Traveler (Solo Adventure)' },
                                { value: '2', label: '2 Travelers (Couple/Duo)' },
                                { value: '3-4', label: '3-4 Travelers (Small Group)' },
                                { value: '5-8', label: '5-8 Travelers (Group)' },
                                { value: '9+', label: '9+ Travelers (Large Group)' },
                              ]}
                              placeholder="Select group size"
                              icon={FiUsers}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }} className="form-field-full">
                            <AnimatedInput
                              label="Subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="What would you like to know?"
                              required
                              error={errors.subject}
                              touched={touched.subject}
                              icon={FiMessageSquare}
                            />
                          </div>

                          <div style={{ gridColumn: 'span 2' }} className="form-field-full">
                            <AnimatedTextarea
                              label="Your Message"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Tell us about your dream African adventure. Include any specific destinations, activities, or experiences you'd like..."
                              required
                              error={errors.message}
                              touched={touched.message}
                              maxLength={2000}
                            />
                          </div>
                        </div>

                        {/* Submit button */}
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -3 }}
                          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                          style={{
                            width: '100%',
                            padding: '20px 32px',
                            background: isSubmitting 
                              ? theme.colors.primary 
                              : theme.gradients.primary,
                            color: theme.colors.white,
                            border: 'none',
                            borderRadius: theme.borderRadius.xl,
                            fontSize: '17px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: theme.shadows.glow,
                            marginTop: '32px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
                                </svg>
                              </motion.div>
                              Sending Your Message...
                            </>
                          ) : (
                            <>
                              <RiSendPlaneFill size={20} />
                              Send Safari Inquiry
                            </>
                          )}
                          
                          {/* Progress bar */}
                          {isSubmitting && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${submitProgress}%` }}
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                height: '4px',
                                backgroundColor: 'rgba(255,255,255,0.4)',
                                borderRadius: '0 2px 2px 0',
                              }}
                            />
                          )}
                        </motion.button>

                        {/* Privacy note */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          style={{
                            fontSize: '13px',
                            color: theme.colors.textMuted,
                            textAlign: 'center',
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <FiShield size={14} />
                          Your information is secure and will never be shared.
                        </motion.p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION
          ============================================ */}
      <section style={{
        padding: '100px 24px',
        backgroundColor: theme.colors.white,
        position: 'relative',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.fadeInUp}
            style={{
              textAlign: 'center',
              marginBottom: '60px',
            }}
          >
            <motion.div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                backgroundColor: theme.colors.offWhite,
                borderRadius: theme.borderRadius.full,
                marginBottom: '20px',
              }}
            >
              <FiHelpCircle size={16} color={theme.colors.primary} />
              <span style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: '600' }}>
                Frequently Asked Questions
              </span>
            </motion.div>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '16px',
            }}>
              Got Questions?
            </h2>
            <p style={{
              fontSize: '18px',
              color: theme.colors.textLight,
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              Find quick answers to common questions about our safari experiences.
            </p>
          </motion.div>

          <motion.div
            variants={animations.staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                {...faq}
                index={index}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          QUICK CONTACT SECTION
          ============================================ */}
      <section style={{
        padding: '80px 24px',
        background: theme.gradients.soft,
        position: 'relative',
      }}>
        <FloatingDecorations />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.fadeInUp}
            style={{
              textAlign: 'center',
              marginBottom: '50px',
            }}
          >
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '12px',
            }}>
              Quick Contact Options
            </h2>
            <p style={{
              fontSize: '16px',
              color: theme.colors.textLight,
            }}>
              Choose the way that works best for you
            </p>
          </motion.div>

          <motion.div
            variants={animations.staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {quickContactOptions.map((option, index) => (
              <motion.a
                key={index}
                href={option.href}
                variants={animations.staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: theme.colors.white,
                  padding: '32px',
                  borderRadius: theme.borderRadius.xl,
                  boxShadow: theme.shadows.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = option.color;
                  e.currentTarget.style.boxShadow = `0 20px 40px ${option.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = theme.shadows.md;
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: theme.borderRadius.lg,
                  backgroundColor: `${option.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: option.color,
                  flexShrink: 0,
                }}>
                  <option.icon size={28} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: theme.colors.text,
                    marginBottom: '4px',
                  }}>
                    {option.title}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: theme.colors.textLight,
                    marginBottom: '8px',
                  }}>
                    {option.subtitle}
                  </p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: option.color,
                  }}>
                    {option.action}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section style={{
        padding: '100px 24px',
        background: theme.gradients.hero,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.fadeInUp}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <FiCoffee size={36} color={theme.colors.white} />
            </motion.div>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: '700',
              color: theme.colors.white,
              marginBottom: '20px',
              lineHeight: '1.2',
            }}>
              Ready to Start Your Adventure?
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '40px',
              lineHeight: '1.7',
            }}>
              Let's grab a virtual coffee and discuss your dream African safari. 
              No obligations, just inspiration.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <motion.a
                href="#contact-form"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '18px 40px',
                  background: theme.colors.white,
                  color: theme.colors.primary,
                  borderRadius: theme.borderRadius.full,
                  fontSize: '17px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                }}
              >
                <HiSparkles size={20} />
                Start Planning
              </motion.a>
              <motion.a
                href="/safaris"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '18px 40px',
                  background: 'transparent',
                  color: theme.colors.white,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: theme.borderRadius.full,
                  fontSize: '17px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                View Safari Packages
                <FiArrowRight size={18} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Chat Widget */}
      <LiveChatWidget />

      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        /* Responsive grid adjustments */
        @media (min-width: 1024px) {
          .contact-info-column {
            grid-column: span 5 !important;
          }
          .contact-form-column {
            grid-column: span 7 !important;
          }
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .form-field-half {
            grid-column: span 1 !important;
          }
          .form-field-full {
            grid-column: span 1 !important;
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${theme.colors.offWhite};
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme.colors.primary};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.primaryDark};
        }
        
        /* Selection color */
        ::selection {
          background: ${theme.colors.primary};
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Contact;