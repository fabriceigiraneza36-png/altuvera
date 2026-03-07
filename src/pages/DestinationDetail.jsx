import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  createContext,
  useContext,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiMapPin, FiStar, FiClock, FiCheck, FiCalendar, FiUsers,
  FiCamera, FiHeart, FiShare2, FiChevronLeft, FiChevronRight,
  FiArrowRight, FiArrowLeft, FiX, FiMaximize2, FiDownload,
  FiMessageCircle, FiPhone, FiMail, FiSun, FiDroplet, FiWind,
  FiThermometer, FiGrid, FiChevronDown, FiChevronUp, FiInfo,
  FiShield, FiGlobe, FiNavigation, FiBookmark, FiPrinter,
  FiMap, FiCompass, FiSunrise, FiSunset, FiPackage, FiHelpCircle,
  FiThumbsUp, FiCoffee, FiZap, FiEye, FiLoader, FiAlertTriangle,
  FiHome, FiExternalLink, FiCopy, FiCheckCircle, FiAlertCircle,
  FiXCircle, FiPlay, FiPause, FiVolume2, FiVolumeX, FiRefreshCw,
  FiFilter, FiSearch, FiMoreHorizontal, FiEdit, FiTrash2,
  FiPlus, FiMinus, FiSettings, FiLogIn, FiUserPlus, FiAward,
  FiTrendingUp, FiActivity, FiBell, FiLock, FiUnlock
} from "react-icons/fi";
import { useCountry } from "../hooks/useCountries";
import { useCountryDestinations, useDestination } from "../hooks/useDestinations";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM & THEME
// ═══════════════════════════════════════════════════════════════════════════
const THEME = {
  colors: {
    primary: {
      50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
      400: '#34D399', 500: '#10B981', 600: '#059669', 700: '#047857',
      800: '#065F46', 900: '#064E3B',
    },
    neutral: {
      0: '#FFFFFF', 50: '#FAFAFA', 100: '#F5F5F5', 200: '#E5E5E5',
      300: '#D4D4D4', 400: '#A3A3A3', 500: '#737373', 600: '#525252',
      700: '#404040', 800: '#262626', 900: '#171717',
    },
    semantic: {
      success: '#059669', warning: '#F59E0B', error: '#DC2626', info: '#3B82F6',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      hero: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)',
      card: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
    }
  },
  typography: {
    fontFamily: {
      heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    },
    fontSize: {
      xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
      xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
      '5xl': '3rem', '6xl': '3.75rem',
    },
    fontWeight: {
      normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800,
    },
    lineHeight: {
      tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2,
    },
  },
  spacing: {
    px: '1px', 0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
    5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem',
    16: '4rem', 20: '5rem', 24: '6rem', 32: '8rem', 40: '10rem',
  },
  borderRadius: {
    none: '0', sm: '0.25rem', DEFAULT: '0.5rem', md: '0.75rem',
    lg: '1rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '2rem', full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(5, 150, 105, 0.35)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    DEFAULT: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: '600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  breakpoints: {
    xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536,
  },
  zIndex: {
    dropdown: 1000, sticky: 1020, fixed: 1030, modal: 1040, popover: 1050, tooltip: 1060, toast: 1070,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES & KEYFRAMES
// ═══════════════════════════════════════════════════════════════════════════
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${THEME.typography.fontFamily.body};
    color: ${THEME.colors.neutral[800]};
    background-color: ${THEME.colors.neutral[50]};
    line-height: ${THEME.typography.lineHeight.normal};
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-100%); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(5, 150, 105, 0.3); }
    50% { box-shadow: 0 0 40px rgba(5, 150, 105, 0.6); }
  }

  @keyframes progressBar {
    from { width: 0; }
    to { width: var(--progress, 100%); }
  }

  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }

  @keyframes toastIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes toastOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${THEME.colors.neutral[100]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${THEME.colors.primary[400]};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${THEME.colors.primary[500]};
  }

  /* Selection */
  ::selection {
    background: ${THEME.colors.primary[200]};
    color: ${THEME.colors.primary[900]};
  }

  /* Focus */
  :focus-visible {
    outline: 2px solid ${THEME.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Print */
  @media print {
    .no-print { display: none !important; }
    .print-break { page-break-before: always; }
    body { background: white; }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════
const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast,
  }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════════════
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    ...size,
    isMobile: size.width < THEME.breakpoints.md,
    isTablet: size.width >= THEME.breakpoints.md && size.width < THEME.breakpoints.lg,
    isDesktop: size.width >= THEME.breakpoints.lg,
    isLargeDesktop: size.width >= THEME.breakpoints.xl,
  };
};

const useScrollPosition = (threshold = 80) => {
  const [state, setState] = useState({ scrollY: 0, isScrolled: false, direction: null });
  const prevScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setState({
            scrollY: currentScrollY,
            isScrolled: currentScrollY > threshold,
            direction: currentScrollY > prevScrollY.current ? 'down' : 'up',
          });
          prevScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return state;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useKeyPress = (targetKey, handler, options = {}) => {
  const { ctrl = false, shift = false, alt = false, preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const matchesKey = event.key === targetKey || event.code === targetKey;
      const matchesModifiers =
        (!ctrl || event.ctrlKey || event.metaKey) &&
        (!shift || event.shiftKey) &&
        (!alt || event.altKey);

      if (matchesKey && matchesModifiers) {
        if (preventDefault) event.preventDefault();
        handler(event);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, handler, ctrl, shift, alt, preventDefault]);
};

const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);

  const observer = useRef(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold: 0.1, rootMargin: '0px', ...options }
    );

    if (node) observer.current.observe(node);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [node, options.threshold, options.rootMargin]);

  return [setNode, entry];
};

const useClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }, [timeout]);

  return { copied, copy };
};

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler]);

  return ref;
};

const useLockBodyScroll = (lock = true) => {
  useEffect(() => {
    if (!lock) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
};

const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const touchStart = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStart.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeLeft) onSwipeLeft();
      else if (diff < 0 && onSwipeRight) onSwipeRight();
    }
    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_DATA = {
  weather: {
    current: {
      temp: 24,
      feelsLike: 26,
      condition: 'Sunny',
      humidity: 65,
      wind: 12,
      uv: 6,
      visibility: 10,
      pressure: 1015,
    },
    forecast: [
      { day: 'Mon', high: 25, low: 18, condition: 'sunny', icon: '☀️', precipitation: 0 },
      { day: 'Tue', high: 23, low: 17, condition: 'partly-cloudy', icon: '⛅', precipitation: 10 },
      { day: 'Wed', high: 22, low: 16, condition: 'rainy', icon: '🌧️', precipitation: 60 },
      { day: 'Thu', high: 24, low: 17, condition: 'sunny', icon: '☀️', precipitation: 5 },
      { day: 'Fri', high: 26, low: 19, condition: 'sunny', icon: '☀️', precipitation: 0 },
      { day: 'Sat', high: 27, low: 20, condition: 'sunny', icon: '☀️', precipitation: 0 },
      { day: 'Sun', high: 25, low: 18, condition: 'partly-cloudy', icon: '⛅', precipitation: 15 },
    ],
  },
  packingList: [
    {
      category: 'Essentials',
      icon: '🎒',
      color: THEME.colors.primary[500],
      items: [
        { name: 'Passport & ID', essential: true, checked: false },
        { name: 'Travel Insurance Docs', essential: true, checked: false },
        { name: 'Cash & Credit Cards', essential: true, checked: false },
        { name: 'Phone & Charger', essential: true, checked: false },
        { name: 'Travel Adapter', essential: false, checked: false },
      ],
    },
    {
      category: 'Clothing',
      icon: '👕',
      color: THEME.colors.semantic.info,
      items: [
        { name: 'Comfortable Walking Shoes', essential: true, checked: false },
        { name: 'Light Layers', essential: false, checked: false },
        { name: 'Rain Jacket', essential: false, checked: false },
        { name: 'Sun Hat', essential: false, checked: false },
        { name: 'Swimwear', essential: false, checked: false },
      ],
    },
    {
      category: 'Health & Safety',
      icon: '💊',
      color: THEME.colors.semantic.error,
      items: [
        { name: 'First Aid Kit', essential: true, checked: false },
        { name: 'Sunscreen SPF50+', essential: true, checked: false },
        { name: 'Insect Repellent', essential: false, checked: false },
        { name: 'Personal Medications', essential: true, checked: false },
        { name: 'Hand Sanitizer', essential: false, checked: false },
      ],
    },
    {
      category: 'Electronics & Gear',
      icon: '📷',
      color: THEME.colors.semantic.warning,
      items: [
        { name: 'Camera', essential: false, checked: false },
        { name: 'Power Bank', essential: true, checked: false },
        { name: 'Reusable Water Bottle', essential: true, checked: false },
        { name: 'Day Backpack', essential: true, checked: false },
        { name: 'Headphones', essential: false, checked: false },
      ],
    },
  ],
  travelTips: [
    {
      id: 1,
      icon: '🌅',
      title: 'Best Time to Visit',
      content: 'Early morning (6-8 AM) offers the best lighting for photography and significantly fewer crowds. Consider arriving before sunrise for the most magical experience.',
      category: 'timing',
    },
    {
      id: 2,
      icon: '📸',
      title: 'Photography Spots',
      content: 'The eastern viewpoint offers stunning sunrise shots. Bring a tripod for long exposures. The golden hour before sunset is equally impressive from the western terrace.',
      category: 'photography',
    },
    {
      id: 3,
      icon: '👟',
      title: 'What to Wear',
      content: 'Comfortable walking shoes are essential as the terrain can be uneven in some areas. Dress in layers as temperatures can vary throughout the day.',
      category: 'preparation',
    },
    {
      id: 4,
      icon: '🍽️',
      title: 'Local Food',
      content: 'Don\'t miss the local street food markets for authentic cuisine at great value. Try the regional specialties early in the day when ingredients are freshest.',
      category: 'food',
    },
    {
      id: 5,
      icon: '💬',
      title: 'Language Tips',
      content: 'Learn basic greetings in the local language - locals greatly appreciate the effort! A simple "hello" and "thank you" go a long way.',
      category: 'culture',
    },
    {
      id: 6,
      icon: '🚗',
      title: 'Getting Around',
      content: 'Book transportation in advance during peak season for better rates. Local ride-sharing apps often offer the best value for short distances.',
      category: 'transport',
    },
  ],
  safetyInfo: [
    { label: 'Overall Safety', rating: 4.5, description: 'Generally very safe for tourists with low crime rates', color: THEME.colors.primary[500] },
    { label: 'Health Services', rating: 4.0, description: 'Good medical facilities and pharmacies nearby', color: THEME.colors.semantic.info },
    { label: 'Infrastructure', rating: 4.2, description: 'Well-maintained paths, signage, and facilities', color: THEME.colors.primary[400] },
    { label: 'Communication', rating: 4.8, description: 'Excellent mobile coverage and WiFi availability', color: THEME.colors.primary[600] },
    { label: 'Emergency Services', rating: 4.3, description: 'Quick response times, multilingual operators', color: THEME.colors.semantic.warning },
  ],
  accessibility: [
    { feature: 'Wheelchair Access', available: true, details: 'Main areas fully accessible with ramps and elevators', icon: '♿' },
    { feature: 'Audio Guides', available: true, details: 'Available in 12 languages including sign language', icon: '🎧' },
    { feature: 'Rest Areas', available: true, details: 'Shaded seating every 300-500 meters', icon: '🪑' },
    { feature: 'Service Animals', available: true, details: 'Welcome in all public areas', icon: '🐕' },
    { feature: 'Braille Signage', available: true, details: 'Available at major points of interest', icon: '⠿' },
    { feature: 'Accessible Restrooms', available: true, details: 'Located throughout the venue', icon: '🚻' },
  ],
  faqs: [
    {
      id: 1,
      question: 'What is the best time of year to visit?',
      answer: 'The ideal time is during spring (March-May) and autumn (September-November) when weather is mild, crowds are smaller, and prices are more reasonable. Summer offers longer days but expect more tourists.',
      category: 'planning',
    },
    {
      id: 2,
      question: 'How long should I plan for this destination?',
      answer: 'We recommend 2-3 full days to fully experience all the highlights without rushing. If you want to explore nearby attractions, consider extending to 4-5 days.',
      category: 'planning',
    },
    {
      id: 3,
      question: 'Is this suitable for families with children?',
      answer: 'Absolutely! This destination offers activities suitable for all ages. Children under 12 have special guided tours available, and there are dedicated play areas and family-friendly dining options.',
      category: 'family',
    },
    {
      id: 4,
      question: 'What languages are spoken here?',
      answer: 'The primary language is local, but English is widely understood in tourist areas. Guides are available in multiple languages including Spanish, French, German, Chinese, and Japanese.',
      category: 'practical',
    },
    {
      id: 5,
      question: 'Are there food options for dietary restrictions?',
      answer: 'Yes! Vegetarian, vegan, gluten-free, and halal options are available at most restaurants. We recommend informing restaurants of allergies in advance.',
      category: 'food',
    },
    {
      id: 6,
      question: 'What payment methods are accepted?',
      answer: 'Major credit cards (Visa, Mastercard, Amex) are widely accepted. ATMs are available, but carrying some cash is recommended for small vendors and tips.',
      category: 'practical',
    },
  ],
  reviews: [
    {
      id: 1,
      author: { name: 'Sarah Mitchell', avatar: '👩', location: 'New York, USA', trips: 24 },
      rating: 5,
      date: '2024-01-15',
      title: 'Absolutely breathtaking experience!',
      content: 'One of the most beautiful places I\'ve ever visited. The local guides were incredibly knowledgeable and friendly. The sunrise view alone is worth the trip. Highly recommend the early morning tour!',
      helpful: 47,
      photos: 5,
      verified: true,
      response: { author: 'Destination Team', content: 'Thank you for your wonderful review, Sarah! We\'re thrilled you enjoyed your experience.' },
    },
    {
      id: 2,
      author: { name: 'James Chen', avatar: '👨', location: 'Singapore', trips: 18 },
      rating: 4,
      date: '2024-01-08',
      title: 'Great experience with minor crowds',
      content: 'Beautiful scenery and well-organized facilities. Would recommend going early morning to avoid the afternoon crowds. The facilities are clean and staff are helpful.',
      helpful: 32,
      photos: 3,
      verified: true,
      response: null,
    },
    {
      id: 3,
      author: { name: 'Emily Rodriguez', avatar: '👩‍🦰', location: 'Barcelona, Spain', trips: 31 },
      rating: 5,
      date: '2023-12-22',
      title: 'A must-visit destination!',
      content: 'Exceeded all my expectations. The sunset views are absolutely magical - truly unforgettable. The local food scene is amazing too. Don\'t miss the night market nearby!',
      helpful: 58,
      photos: 8,
      verified: true,
      response: null,
    },
    {
      id: 4,
      author: { name: 'Michael Thompson', avatar: '🧔', location: 'London, UK', trips: 12 },
      rating: 4,
      date: '2023-12-10',
      title: 'Beautiful but plan ahead',
      content: 'Stunning location with excellent photo opportunities. Visit during weekdays if possible to avoid weekend crowds. Book your tickets online in advance - saves a lot of time.',
      helpful: 21,
      photos: 2,
      verified: false,
      response: null,
    },
  ],
  itinerary: [
    { time: '05:30', activity: 'Early Morning Departure', description: 'Beat the crowds for the best experience', icon: <FiSunrise />, duration: '30 min' },
    { time: '06:00', activity: 'Sunrise Viewing', description: 'Witness the magical golden hour', icon: <FiSun />, duration: '1.5 hr' },
    { time: '07:30', activity: 'Photography Session', description: 'Capture stunning morning light', icon: <FiCamera />, duration: '1 hr' },
    { time: '08:30', activity: 'Local Breakfast', description: 'Traditional cuisine experience', icon: <FiCoffee />, duration: '1 hr' },
    { time: '09:30', activity: 'Guided Walking Tour', description: 'Explore main attractions with expert guide', icon: <FiMap />, duration: '2.5 hr' },
    { time: '12:00', activity: 'Lunch Break', description: 'Rest and try local specialties', icon: <FiCoffee />, duration: '1.5 hr' },
    { time: '13:30', activity: 'Free Exploration', description: 'Discover hidden gems at your pace', icon: <FiCompass />, duration: '3 hr' },
    { time: '16:30', activity: 'Afternoon Tea', description: 'Relax with scenic views', icon: <FiCoffee />, duration: '1 hr' },
    { time: '17:30', activity: 'Sunset Spot', description: 'Golden hour from western viewpoint', icon: <FiSunset />, duration: '1.5 hr' },
    { time: '19:00', activity: 'Dinner & Evening', description: 'Local restaurant recommendations', icon: <FiStar />, duration: '2 hr' },
  ],
  nearbyAttractions: [
    { id: 1, name: 'Mountain Viewpoint', distance: 2.5, time: '15 min drive', type: 'Nature', rating: 4.7, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
    { id: 2, name: 'Historic Temple', distance: 4.0, time: '25 min drive', type: 'Culture', rating: 4.8, image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400' },
    { id: 3, name: 'Local Market', distance: 1.2, time: '5 min walk', type: 'Shopping', rating: 4.5, image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400' },
    { id: 4, name: 'Waterfall Trail', distance: 6.0, time: '30 min drive', type: 'Adventure', rating: 4.6, image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400' },
    { id: 5, name: 'Botanical Garden', distance: 3.5, time: '20 min drive', type: 'Nature', rating: 4.4, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400' },
  ],
  transportOptions: [
    { mode: 'By Air', icon: '✈️', details: 'International Airport (XYZ) - 45 km away', duration: '45 min - 1 hr', price: '$$', tips: 'Book airport transfer in advance' },
    { mode: 'By Train', icon: '🚂', details: 'Direct high-speed trains from major cities', duration: '2-4 hours', price: '$', tips: 'First class offers more comfort' },
    { mode: 'By Bus', icon: '🚌', details: 'Regular services from regional bus stations', duration: '3-5 hours', price: '$', tips: 'Book VIP buses for comfort' },
    { mode: 'By Car', icon: '🚗', details: 'Well-connected highways, parking available', duration: 'Varies', price: '$$', tips: 'GPS navigation recommended' },
    { mode: 'By Ferry', icon: '⛴️', details: 'Scenic coastal route available', duration: '2-3 hours', price: '$$', tips: 'Book deck seats for views' },
  ],
  localPhrases: [
    { english: 'Hello', local: 'Merhaba', pronunciation: 'mer-HA-ba', audio: true },
    { english: 'Thank you', local: 'Teşekkürler', pronunciation: 'teh-shek-KOOR-ler', audio: true },
    { english: 'Please', local: 'Lütfen', pronunciation: 'LOOT-fen', audio: true },
    { english: 'Excuse me', local: 'Pardon', pronunciation: 'par-DON', audio: true },
    { english: 'Goodbye', local: 'Hoşça kal', pronunciation: 'HOSH-cha kal', audio: true },
    { english: 'How much?', local: 'Ne kadar?', pronunciation: 'neh ka-DAR', audio: true },
    { english: 'Yes / No', local: 'Evet / Hayır', pronunciation: 'eh-VET / ha-YIR', audio: true },
    { english: 'Help!', local: 'İmdat!', pronunciation: 'im-DAT', audio: true },
  ],
  culturalTips: [
    { title: 'Greetings', description: 'A slight bow or nod is customary when greeting locals. Handshakes are common in business settings.', icon: '🙏' },
    { title: 'Dress Code', description: 'Modest clothing is appreciated, especially at religious or cultural sites. Cover shoulders and knees.', icon: '👔' },
    { title: 'Photography', description: 'Always ask permission before photographing people. Some sacred sites may prohibit photography.', icon: '📷' },
    { title: 'Tipping', description: 'Tipping 10-15% is customary at restaurants. Round up taxi fares. Hotel porters appreciate small tips.', icon: '💰' },
    { title: 'Bargaining', description: 'Expected at markets and street vendors. Start at 50-60% of asking price and negotiate respectfully.', icon: '🤝' },
    { title: 'Punctuality', description: 'Being on time is appreciated for tours and reservations. Social events may be more relaxed.', icon: '⏰' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  const options = format === 'short'
    ? { month: 'short', day: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  return formatDate(date);
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiXCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />,
  };

  const colors = {
    success: { bg: THEME.colors.primary[50], border: THEME.colors.primary[500], text: THEME.colors.primary[700] },
    error: { bg: '#FEF2F2', border: THEME.colors.semantic.error, text: '#991B1B' },
    warning: { bg: '#FFFBEB', border: THEME.colors.semantic.warning, text: '#92400E' },
    info: { bg: '#EFF6FF', border: THEME.colors.semantic.info, text: '#1E40AF' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: THEME.spacing[4],
        right: THEME.spacing[4],
        zIndex: THEME.zIndex.toast,
        display: 'flex',
        flexDirection: 'column',
        gap: THEME.spacing[3],
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const c = colors[toast.type] || colors.info;
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: THEME.spacing[3],
              padding: THEME.spacing[4],
              backgroundColor: c.bg,
              borderLeft: `4px solid ${c.border}`,
              borderRadius: THEME.borderRadius.lg,
              boxShadow: THEME.shadows.lg,
              animation: 'toastIn 0.3s ease',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ color: c.border, flexShrink: 0 }}>{icons[toast.type]}</span>
            <p style={{ flex: 1, fontSize: THEME.typography.fontSize.sm, color: c.text, fontWeight: THEME.typography.fontWeight.medium }}>
              {toast.message}
            </p>
            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: c.text,
                cursor: 'pointer',
                padding: THEME.spacing[1],
                borderRadius: THEME.borderRadius.sm,
                opacity: 0.7,
                transition: `opacity ${THEME.transitions.fast}`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <FiX size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Skeleton Loader
const Skeleton = ({ width = '100%', height = '20px', borderRadius = THEME.borderRadius.md, className = '' }) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${THEME.colors.neutral[200]} 25%, ${THEME.colors.neutral[100]} 50%, ${THEME.colors.neutral[200]} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  />
);

// Loading Spinner
const Spinner = ({ size = 24, color = THEME.colors.primary[500] }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `3px solid ${THEME.colors.neutral[200]}`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}
  />
);

// Badge Component
const Badge = ({ children, variant = 'default', size = 'md', icon, dot = false }) => {
  const variants = {
    default: { bg: THEME.colors.primary[100], color: THEME.colors.primary[700], border: THEME.colors.primary[200] },
    success: { bg: THEME.colors.primary[100], color: THEME.colors.primary[700], border: THEME.colors.primary[200] },
    warning: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    error: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    info: { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
    neutral: { bg: THEME.colors.neutral[100], color: THEME.colors.neutral[700], border: THEME.colors.neutral[200] },
    outline: { bg: 'transparent', color: THEME.colors.primary[600], border: THEME.colors.primary[300] },
  };

  const sizes = {
    sm: { padding: `${THEME.spacing[1]} ${THEME.spacing[2]}`, fontSize: '10px' },
    md: { padding: `${THEME.spacing[1]} ${THEME.spacing[3]}`, fontSize: '11px' },
    lg: { padding: `${THEME.spacing[2]} ${THEME.spacing[4]}`, fontSize: '12px' },
  };

  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: THEME.spacing[1],
        padding: s.padding,
        backgroundColor: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: THEME.borderRadius.full,
        fontSize: s.fontSize,
        fontWeight: THEME.typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: v.color,
          }}
        />
      )}
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </span>
  );
};

// Button Component
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  as: Component = 'button',
  to,
  href,
  onClick,
  type = 'button',
  className = '',
  style: customStyle = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);

  const variants = {
    primary: {
      bg: THEME.colors.gradient.primary,
      bgHover: THEME.colors.primary[700],
      color: THEME.colors.neutral[0],
      border: 'none',
      shadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
      shadowHover: '0 6px 20px rgba(5, 150, 105, 0.45)',
    },
    secondary: {
      bg: THEME.colors.neutral[0],
      bgHover: THEME.colors.primary[50],
      color: THEME.colors.primary[600],
      border: `2px solid ${THEME.colors.primary[500]}`,
      shadow: 'none',
      shadowHover: '0 4px 12px rgba(5, 150, 105, 0.15)',
    },
    outline: {
      bg: THEME.colors.neutral[0],
      bgHover: THEME.colors.neutral[50],
      color: THEME.colors.neutral[700],
      border: `2px solid ${THEME.colors.neutral[300]}`,
      shadow: 'none',
      shadowHover: THEME.shadows.sm,
    },
    ghost: {
      bg: 'transparent',
      bgHover: THEME.colors.primary[50],
      color: THEME.colors.primary[600],
      border: 'none',
      shadow: 'none',
      shadowHover: 'none',
    },
    danger: {
      bg: THEME.colors.semantic.error,
      bgHover: '#B91C1C',
      color: THEME.colors.neutral[0],
      border: 'none',
      shadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
      shadowHover: '0 6px 20px rgba(220, 38, 38, 0.45)',
    },
  };

  const sizes = {
    xs: { padding: `${THEME.spacing[1]} ${THEME.spacing[2]}`, fontSize: THEME.typography.fontSize.xs, height: '28px' },
    sm: { padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`, fontSize: THEME.typography.fontSize.sm, height: '36px' },
    md: { padding: `${THEME.spacing[2]} ${THEME.spacing[5]}`, fontSize: THEME.typography.fontSize.sm, height: '44px' },
    lg: { padding: `${THEME.spacing[3]} ${THEME.spacing[6]}`, fontSize: THEME.typography.fontSize.base, height: '52px' },
    xl: { padding: `${THEME.spacing[4]} ${THEME.spacing[8]}`, fontSize: THEME.typography.fontSize.lg, height: '60px' },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = generateId();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);

    onClick?.(e);
  };

  const buttonStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing[2],
    padding: s.padding,
    minHeight: s.height,
    fontSize: s.fontSize,
    fontWeight: THEME.typography.fontWeight.semibold,
    fontFamily: THEME.typography.fontFamily.body,
    color: v.color,
    background: variant === 'primary' && isHovered ? v.bgHover : v.bg,
    border: v.border,
    borderRadius: THEME.borderRadius.lg,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    overflow: 'hidden',
    transition: `all ${THEME.transitions.DEFAULT}`,
    boxShadow: isHovered && !disabled ? v.shadowHover : v.shadow,
    transform: isPressed && !disabled ? 'scale(0.98)' : isHovered && !disabled ? 'translateY(-2px)' : 'none',
    ...customStyle,
  };

  const content = (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none',
          }}
        />
      ))}
      {loading && <Spinner size={16} color={v.color} />}
      {!loading && icon && iconPosition === 'left' && <span style={{ display: 'flex' }}>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span style={{ display: 'flex' }}>{icon}</span>}
    </>
  );

  const commonProps = {
    style: buttonStyle,
    className,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => { setIsHovered(false); setIsPressed(false); },
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    ...props,
  };

  if (to) {
    return <Link to={to} onClick={handleClick} {...commonProps}>{content}</Link>;
  }

  if (href) {
    return <a href={href} onClick={handleClick} {...commonProps}>{content}</a>;
  }

  return (
    <button type={type} onClick={handleClick} disabled={disabled || loading} {...commonProps}>
      {content}
    </button>
  );
};

// IconButton Component
const IconButton = ({
  icon,
  onClick,
  variant = 'default',
  size = 'md',
  active = false,
  disabled = false,
  tooltip,
  badge,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const variants = {
    default: {
      bg: active ? THEME.colors.primary[600] : 'rgba(255, 255, 255, 0.15)',
      bgHover: active ? THEME.colors.primary[700] : 'rgba(255, 255, 255, 0.25)',
      color: THEME.colors.neutral[0],
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    solid: {
      bg: active ? THEME.colors.primary[600] : THEME.colors.neutral[0],
      bgHover: active ? THEME.colors.primary[700] : THEME.colors.neutral[100],
      color: active ? THEME.colors.neutral[0] : THEME.colors.neutral[600],
      border: `1px solid ${THEME.colors.neutral[200]}`,
    },
    ghost: {
      bg: active ? THEME.colors.primary[100] : 'transparent',
      bgHover: THEME.colors.primary[100],
      color: active ? THEME.colors.primary[600] : THEME.colors.neutral[600],
      border: 'none',
    },
    outline: {
      bg: 'transparent',
      bgHover: THEME.colors.primary[50],
      color: active ? THEME.colors.primary[600] : THEME.colors.neutral[600],
      border: `2px solid ${active ? THEME.colors.primary[500] : THEME.colors.neutral[300]}`,
    },
  };

  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  };

  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.md;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => { setIsHovered(true); if (tooltip) setTimeout(() => setShowTooltip(true), 500); }}
        onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
        style={{
          width: s,
          height: s,
          borderRadius: THEME.borderRadius.full,
          backgroundColor: isHovered ? v.bgHover : v.bg,
          border: v.border,
          color: v.color,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `all ${THEME.transitions.DEFAULT}`,
          backdropFilter: 'blur(10px)',
          transform: isHovered && !disabled ? 'scale(1.08)' : 'scale(1)',
        }}
        {...props}
      >
        {icon}
      </button>
      {badge !== undefined && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            padding: '0 5px',
            backgroundColor: THEME.colors.semantic.error,
            color: THEME.colors.neutral[0],
            fontSize: '10px',
            fontWeight: THEME.typography.fontWeight.bold,
            borderRadius: THEME.borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${THEME.colors.neutral[0]}`,
          }}
        >
          {badge}
        </span>
      )}
      {showTooltip && tooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: THEME.spacing[2],
            padding: `${THEME.spacing[1]} ${THEME.spacing[2]}`,
            backgroundColor: THEME.colors.neutral[900],
            color: THEME.colors.neutral[0],
            fontSize: THEME.typography.fontSize.xs,
            fontWeight: THEME.typography.fontWeight.medium,
            borderRadius: THEME.borderRadius.sm,
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.15s ease',
            zIndex: THEME.zIndex.tooltip,
          }}
        >
          {tooltip}
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `4px solid ${THEME.colors.neutral[900]}`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Card Component
const Card = ({
  children,
  padding = THEME.spacing[6],
  hover = false,
  animate = true,
  delay = 0,
  onClick,
  className = '',
  style: customStyle = {},
  ...props
}) => {
  const [ref, entry] = useIntersectionObserver({ threshold: 0.1 });
  const [isHovered, setIsHovered] = useState(false);
  const isVisible = !animate || entry?.isIntersecting;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        backgroundColor: THEME.colors.neutral[0],
        borderRadius: THEME.borderRadius['2xl'],
        padding,
        boxShadow: isHovered && hover ? THEME.shadows.xl : THEME.shadows.md,
        border: `1px solid ${THEME.colors.neutral[200]}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${THEME.transitions.DEFAULT}`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? isHovered && hover ? 'translateY(-4px)' : 'translateY(0)'
          : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
        ...customStyle,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon, title, subtitle, action, badge }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: THEME.spacing[6],
      gap: THEME.spacing[4],
      flexWrap: 'wrap',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[4] }}>
      {icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: THEME.borderRadius.xl,
            background: THEME.colors.gradient.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: THEME.colors.neutral[0],
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2] }}>
          <h3
            style={{
              fontFamily: THEME.typography.fontFamily.heading,
              fontSize: THEME.typography.fontSize['2xl'],
              fontWeight: THEME.typography.fontWeight.bold,
              color: THEME.colors.neutral[900],
              margin: 0,
              lineHeight: THEME.typography.lineHeight.tight,
            }}
          >
            {title}
          </h3>
          {badge}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: THEME.typography.fontSize.sm,
              color: THEME.colors.neutral[500],
              margin: `${THEME.spacing[1]} 0 0`,
              lineHeight: THEME.typography.lineHeight.normal,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
);

// Star Rating Component
const StarRating = ({ rating, size = 16, showValue = false, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[1] }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (interactive ? hoverRating || rating : rating) >= star;
        const halfFilled = !filled && (interactive ? hoverRating || rating : rating) >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              transition: `transform ${THEME.transitions.fast}`,
              transform: interactive && hoverRating >= star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <FiStar
              size={size}
              style={{
                fill: filled ? THEME.colors.semantic.warning : halfFilled ? `url(#half-${star})` : 'none',
                color: THEME.colors.semantic.warning,
                transition: `all ${THEME.transitions.fast}`,
              }}
            />
          </button>
        );
      })}
      {showValue && (
        <span
          style={{
            marginLeft: THEME.spacing[2],
            fontSize: size * 0.875,
            fontWeight: THEME.typography.fontWeight.semibold,
            color: THEME.colors.neutral[700],
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = THEME.colors.primary[500],
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 4, md: 8, lg: 12 };
  const h = heights[size] || heights.md;

  return (
    <div style={{ marginBottom: THEME.spacing[4] }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: THEME.spacing[2],
          }}
        >
          {label && (
            <span
              style={{
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.medium,
                color: THEME.colors.neutral[700],
              }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              style={{
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.semibold,
                color,
              }}
            >
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          height: h,
          backgroundColor: THEME.colors.neutral[200],
          borderRadius: THEME.borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${THEME.colors.primary[400]} 100%)`,
            borderRadius: THEME.borderRadius.full,
            transition: animated ? `width 1s ${THEME.transitions.spring}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

// Tab Component
const Tab = ({ children, active, onClick, icon, count }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: THEME.spacing[2],
        padding: `${THEME.spacing[4]} ${THEME.spacing[5]}`,
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: THEME.typography.fontWeight.semibold,
        fontFamily: THEME.typography.fontFamily.body,
        color: active ? THEME.colors.primary[600] : THEME.colors.neutral[500],
        backgroundColor: active ? THEME.colors.primary[50] : isHovered ? THEME.colors.neutral[50] : 'transparent',
        border: 'none',
        borderBottom: `3px solid ${active ? THEME.colors.primary[500] : 'transparent'}`,
        borderRadius: `${THEME.borderRadius.lg} ${THEME.borderRadius.lg} 0 0`,
        cursor: 'pointer',
        transition: `all ${THEME.transitions.DEFAULT}`,
        whiteSpace: 'nowrap',
        marginBottom: '-1px',
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          style={{
            minWidth: 20,
            height: 20,
            padding: '0 6px',
            backgroundColor: active ? THEME.colors.primary[500] : THEME.colors.neutral[300],
            color: THEME.colors.neutral[0],
            fontSize: '10px',
            fontWeight: THEME.typography.fontWeight.bold,
            borderRadius: THEME.borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// Accordion Component
const Accordion = ({ items, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggle = (index) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setOpenItems(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[3] }}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        return (
          <div
            key={item.id || index}
            style={{
              borderRadius: THEME.borderRadius.xl,
              border: `1px solid ${THEME.colors.neutral[200]}`,
              overflow: 'hidden',
              backgroundColor: THEME.colors.neutral[0],
            }}
          >
            <button
              onClick={() => toggle(index)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: THEME.spacing[5],
                backgroundColor: isOpen ? THEME.colors.primary[50] : THEME.colors.neutral[0],
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: `background-color ${THEME.transitions.DEFAULT}`,
              }}
            >
              <span
                style={{
                  fontSize: THEME.typography.fontSize.base,
                  fontWeight: THEME.typography.fontWeight.semibold,
                  color: THEME.colors.neutral[900],
                  paddingRight: THEME.spacing[4],
                }}
              >
                {item.question}
              </span>
              <span
                style={{
                  color: THEME.colors.primary[500],
                  transition: `transform ${THEME.transitions.DEFAULT}`,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              >
                <FiChevronDown size={20} />
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: `max-height ${THEME.transitions.slow}`,
              }}
            >
              <div
                style={{
                  padding: `0 ${THEME.spacing[5]} ${THEME.spacing[5]}`,
                  fontSize: THEME.typography.fontSize.sm,
                  color: THEME.colors.neutral[600],
                  lineHeight: THEME.typography.lineHeight.relaxed,
                }}
              >
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true }) => {
  const modalRef = useClickOutside(onClose);
  useLockBodyScroll(isOpen);
  useKeyPress('Escape', onClose);

  if (!isOpen) return null;

  const sizes = {
    sm: '400px',
    md: '500px',
    lg: '700px',
    xl: '900px',
    full: '95vw',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: THEME.zIndex.modal,
        padding: THEME.spacing[4],
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: THEME.colors.neutral[0],
          borderRadius: THEME.borderRadius['2xl'],
          maxWidth: sizes[size] || sizes.md,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 0.3s ease',
          boxShadow: THEME.shadows['2xl'],
        }}
      >
        {(title || showClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: THEME.spacing[6],
              borderBottom: `1px solid ${THEME.colors.neutral[200]}`,
            }}
          >
            {title && (
              <h2
                style={{
                  fontFamily: THEME.typography.fontFamily.heading,
                  fontSize: THEME.typography.fontSize['xl'],
                  fontWeight: THEME.typography.fontWeight.bold,
                  color: THEME.colors.neutral[900],
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {showClose && (
              <IconButton
                icon={<FiX size={20} />}
                onClick={onClose}
                variant="ghost"
                size="sm"
              />
            )}
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: THEME.spacing[6] }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, description, action }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: THEME.spacing[12],
      textAlign: 'center',
    }}
  >
    {icon && (
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: THEME.borderRadius.full,
          backgroundColor: THEME.colors.primary[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: THEME.spacing[6],
          color: THEME.colors.primary[500],
        }}
      >
        {icon}
      </div>
    )}
    <h3
      style={{
        fontFamily: THEME.typography.fontFamily.heading,
        fontSize: THEME.typography.fontSize['xl'],
        fontWeight: THEME.typography.fontWeight.semibold,
        color: THEME.colors.neutral[900],
        marginBottom: THEME.spacing[2],
      }}
    >
      {title}
    </h3>
    {description && (
      <p
        style={{
          fontSize: THEME.typography.fontSize.base,
          color: THEME.colors.neutral[500],
          marginBottom: THEME.spacing[6],
          maxWidth: '400px',
        }}
      >
        {description}
      </p>
    )}
    {action}
  </div>
);

// Image Gallery Component
const ImageGallery = ({
  images,
  currentIndex,
  setCurrentIndex,
  autoPlay = true,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showControls = true,
  onImageClick,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const swipeHandlers = useSwipe(
    () => setCurrentIndex(prev => (prev + 1) % images.length),
    () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  );

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, autoPlayInterval, images.length, setCurrentIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...swipeHandlers}
    >
      {/* Main Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: onImageClick ? 'pointer' : 'default',
        }}
        onClick={onImageClick}
      >
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: `all ${THEME.transitions.slow}`,
            transform: imageLoaded ? 'scale(1)' : 'scale(1.05)',
            opacity: imageLoaded ? 1 : 0,
          }}
        />
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: THEME.colors.neutral[200],
            }}
          >
            <Spinner size={32} />
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && images.length > 1 && (
        <>
          <IconButton
            icon={<FiChevronLeft size={24} />}
            onClick={() => setCurrentIndex(prev => (prev - 1 + images.length) % images.length)}
            variant="default"
            size="lg"
            style={{
              position: 'absolute',
              left: THEME.spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <IconButton
            icon={<FiChevronRight size={24} />}
            onClick={() => setCurrentIndex(prev => (prev + 1) % images.length)}
            variant="default"
            size="lg"
            style={{
              position: 'absolute',
              right: THEME.spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </>
      )}

      {/* Indicators */}
      {showThumbnails && images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: THEME.spacing[4],
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: THEME.spacing[2],
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: currentIndex === i ? 24 : 10,
                height: 10,
                borderRadius: THEME.borderRadius.full,
                backgroundColor: currentIndex === i ? THEME.colors.neutral[0] : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: `all ${THEME.transitions.DEFAULT}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.spacing[4],
          right: THEME.spacing[4],
          display: 'flex',
          alignItems: 'center',
          gap: THEME.spacing[2],
          padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: THEME.borderRadius.full,
          color: THEME.colors.neutral[0],
          fontSize: THEME.typography.fontSize.sm,
          fontWeight: THEME.typography.fontWeight.medium,
        }}
      >
        <FiCamera size={14} />
        <span>{currentIndex + 1} / {images.length}</span>
      </div>
    </div>
  );
};

// Lightbox Component
const Lightbox = ({ images, currentIndex, setCurrentIndex, onClose }) => {
  useLockBodyScroll(true);
  useKeyPress('Escape', onClose);
  useKeyPress('ArrowLeft', () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length));
  useKeyPress('ArrowRight', () => setCurrentIndex(prev => (prev + 1) % images.length));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: THEME.zIndex.modal + 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <IconButton
        icon={<FiX size={24} />}
        onClick={onClose}
        variant="default"
        size="lg"
        style={{ position: 'absolute', top: THEME.spacing[4], right: THEME.spacing[4], zIndex: 10 }}
      />

      {/* Navigation */}
      <IconButton
        icon={<FiChevronLeft size={28} />}
        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + images.length) % images.length); }}
        variant="default"
        size="xl"
        style={{ position: 'absolute', left: THEME.spacing[4], top: '50%', transform: 'translateY(-50%)' }}
      />
      <IconButton
        icon={<FiChevronRight size={28} />}
        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % images.length); }}
        variant="default"
        size="xl"
        style={{ position: 'absolute', right: THEME.spacing[4], top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Image */}
      <img
        src={images[currentIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: THEME.borderRadius.lg,
          animation: 'scaleIn 0.3s ease',
        }}
      />

      {/* Thumbnails */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.spacing[6],
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: THEME.spacing[2],
          padding: THEME.spacing[2],
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: THEME.borderRadius.lg,
        }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
            style={{
              width: 48,
              height: 48,
              borderRadius: THEME.borderRadius.md,
              overflow: 'hidden',
              border: currentIndex === i ? `2px solid ${THEME.colors.primary[500]}` : '2px solid transparent',
              opacity: currentIndex === i ? 1 : 0.6,
              cursor: 'pointer',
              transition: `all ${THEME.transitions.DEFAULT}`,
              padding: 0,
              background: 'none',
            }}
          >
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>

      {/* Counter */}
      <div
        style={{
          position: 'absolute',
          top: THEME.spacing[4],
          left: '50%',
          transform: 'translateX(-50%)',
          padding: `${THEME.spacing[2]} ${THEME.spacing[4]}`,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: THEME.borderRadius.full,
          color: THEME.colors.neutral[0],
          fontSize: THEME.typography.fontSize.sm,
          fontWeight: THEME.typography.fontWeight.semibold,
        }}
      >
        {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Hero Section
const HeroSection = ({
  destination,
  country,
  currentImageIndex,
  setCurrentImageIndex,
  isFavorite,
  setIsFavorite,
  isBookmarked,
  setIsBookmarked,
  onShare,
  onOpenLightbox,
  onScrollToContent,
  isMobile,
  toast,
}) => {
  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    toast[isFavorite ? 'info' : 'success'](
      isFavorite ? 'Removed from favorites' : 'Added to favorites!'
    );
  };

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
    toast[isBookmarked ? 'info' : 'success'](
      isBookmarked ? 'Removed from saved' : 'Saved for later!'
    );
  };

  return (
    <section
      style={{
        position: 'relative',
        height: isMobile ? '75vh' : '92vh',
        minHeight: isMobile ? '500px' : '650px',
        overflow: 'hidden',
      }}
    >
      {/* Image Gallery */}
      <ImageGallery
        images={destination.images}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
        autoPlay={true}
        autoPlayInterval={6000}
        showThumbnails={true}
        showControls={!isMobile}
        onImageClick={onOpenLightbox}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: THEME.colors.gradient.hero,
          pointerEvents: 'none',
        }}
      />

      {/* Top Actions */}
      <div
        className="no-print"
        style={{
          position: 'absolute',
          top: THEME.spacing[4],
          right: isMobile ? THEME.spacing[4] : THEME.spacing[8],
          display: 'flex',
          gap: THEME.spacing[3],
          zIndex: 20,
          animation: 'fadeInDown 0.6s ease forwards',
        }}
      >
        <IconButton
          icon={<FiHeart size={20} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />}
          onClick={handleFavoriteClick}
          active={isFavorite}
          tooltip="Add to favorites"
        />
        <IconButton
          icon={<FiBookmark size={20} style={{ fill: isBookmarked ? 'currentColor' : 'none' }} />}
          onClick={handleBookmarkClick}
          active={isBookmarked}
          tooltip="Save for later"
        />
        <IconButton
          icon={<FiShare2 size={20} />}
          onClick={onShare}
          tooltip="Share"
        />
        <IconButton
          icon={<FiMaximize2 size={20} />}
          onClick={onOpenLightbox}
          tooltip="View gallery"
        />
      </div>

      {/* Hero Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isMobile ? `${THEME.spacing[6]} ${THEME.spacing[4]} ${THEME.spacing[24]}` : `${THEME.spacing[10]} ${THEME.spacing[12]} ${THEME.spacing[32]}`,
          color: THEME.colors.neutral[0],
          zIndex: 10,
        }}
      >
        {/* Breadcrumbs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: THEME.spacing[2],
            marginBottom: THEME.spacing[4],
            fontSize: THEME.typography.fontSize.sm,
            opacity: 0.9,
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.6s ease forwards',
          }}
        >
          {[
            { to: '/', label: 'Home', icon: <FiHome size={14} /> },
            { to: '/destinations', label: 'Destinations' },
            { to: `/country/${destination.countryId || destination.country_id}`, label: country?.name || 'Country' },
            { label: destination.name, current: true },
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              {item.to ? (
                <Link
                  to={item.to}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: THEME.spacing[1],
                    transition: `opacity ${THEME.transitions.fast}`,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span style={{ fontWeight: THEME.typography.fontWeight.semibold }}>{item.label}</span>
              )}
              {i < arr.length - 1 && <FiChevronRight size={14} style={{ opacity: 0.6 }} />}
            </React.Fragment>
          ))}
        </nav>

        {/* Title */}
        <h1
          style={{
            fontFamily: THEME.typography.fontFamily.heading,
            fontSize: isMobile ? THEME.typography.fontSize['4xl'] : THEME.typography.fontSize['6xl'],
            fontWeight: THEME.typography.fontWeight.bold,
            margin: `0 0 ${THEME.spacing[3]}`,
            textShadow: '0 4px 30px rgba(0,0,0,0.4)',
            lineHeight: THEME.typography.lineHeight.tight,
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}
        >
          {destination.name}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: isMobile ? THEME.typography.fontSize.base : THEME.typography.fontSize.lg,
            maxWidth: '700px',
            lineHeight: THEME.typography.lineHeight.relaxed,
            marginBottom: THEME.spacing[5],
            opacity: 0.95,
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}
        >
          {destination.description}
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: THEME.spacing[3],
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}
        >
          {[
            { icon: <FiStar size={14} style={{ fill: THEME.colors.semantic.warning, color: THEME.colors.semantic.warning }} />, label: `${destination.rating} Rating` },
            { icon: <FiClock size={14} />, label: destination.duration },
            { icon: <FiUsers size={14} />, label: destination.difficulty },
            { icon: <FiMessageCircle size={14} />, label: `${destination.reviews}+ Reviews` },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: THEME.spacing[2],
                padding: `${THEME.spacing[2]} ${THEME.spacing[4]}`,
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: THEME.borderRadius.full,
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.medium,
              }}
            >
              {stat.icon}
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      {!isMobile && (
        <button
          onClick={onScrollToContent}
          style={{
            position: 'absolute',
            bottom: THEME.spacing[8],
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: THEME.spacing[2],
            color: THEME.colors.neutral[0],
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 20,
            animation: 'fadeInUp 0.6s ease 0.5s both, bounce 2s ease-in-out 1.5s infinite',
          }}
        >
          <span
            style={{
              fontSize: THEME.typography.fontSize.xs,
              fontWeight: THEME.typography.fontWeight.semibold,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Explore
          </span>
          <FiChevronDown size={24} />
        </button>
      )}
    </section>
  );
};

// Quick Actions Bar
const QuickActionsBar = ({ destination, onDownload, onPrint, onShare, isMobile, isScrolled, viewCount = 2847 }) => (
  <div
    className="no-print"
    style={{
      backgroundColor: THEME.colors.neutral[0],
      borderBottom: `1px solid ${THEME.colors.neutral[200]}`,
      padding: `${THEME.spacing[3]} ${isMobile ? THEME.spacing[4] : THEME.spacing[8]}`,
      position: 'sticky',
      top: 0,
      zIndex: THEME.zIndex.sticky,
      boxShadow: isScrolled ? THEME.shadows.md : 'none',
      transition: `box-shadow ${THEME.transitions.DEFAULT}`,
    }}
  >
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: THEME.spacing[4],
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[3], flexWrap: 'wrap' }}>
        <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500], fontWeight: THEME.typography.fontWeight.medium }}>
          Quick Actions:
        </span>
        <Button variant="outline" size="sm" icon={<FiDownload size={14} />} onClick={onDownload}>
          {!isMobile && 'Download'}
        </Button>
        <Button variant="outline" size="sm" icon={<FiPrinter size={14} />} onClick={onPrint}>
          {!isMobile && 'Print'}
        </Button>
        <Button variant="outline" size="sm" icon={<FiShare2 size={14} />} onClick={onShare}>
          {!isMobile && 'Share'}
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: THEME.spacing[2],
          padding: `${THEME.spacing[2]} ${THEME.spacing[4]}`,
          backgroundColor: THEME.colors.primary[50],
          borderRadius: THEME.borderRadius.lg,
        }}
      >
        <FiEye size={16} style={{ color: THEME.colors.primary[600] }} />
        <span style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.primary[700] }}>
          {viewCount.toLocaleString()} views today
        </span>
      </div>
    </div>
  </div>
);

// Overview Section
const OverviewSection = ({ destination, country }) => {
  const weather = MOCK_DATA.weather;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[6] }}>
      {/* About Card */}
      <Card delay={0}>
        <SectionHeader
          icon={<FiInfo size={24} />}
          title="About This Destination"
          subtitle="Everything you need to know"
          badge={<Badge variant="success" dot>Popular</Badge>}
        />
        <div style={{ marginBottom: THEME.spacing[5] }}>
          <Badge icon={<FiMapPin size={10} />}>{destination.type}</Badge>
        </div>
        <p
          style={{
            fontSize: THEME.typography.fontSize.base,
            color: THEME.colors.neutral[600],
            lineHeight: THEME.typography.lineHeight.relaxed,
            marginBottom: THEME.spacing[6],
          }}
        >
          {destination.fullDescription || destination.description}
        </p>

        {/* Quick Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: THEME.spacing[4],
          }}
        >
          {[
            { icon: <FiMapPin size={20} />, label: 'Location', value: country?.name || 'Unknown' },
            { icon: <FiClock size={20} />, label: 'Duration', value: destination.duration },
            { icon: <FiUsers size={20} />, label: 'Difficulty', value: destination.difficulty },
            { icon: <FiCalendar size={20} />, label: 'Best Time', value: destination.bestTime || 'Spring-Fall' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: THEME.spacing[4],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                textAlign: 'center',
                border: `1px solid ${THEME.colors.neutral[200]}`,
                transition: `all ${THEME.transitions.DEFAULT}`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: THEME.borderRadius.lg,
                  backgroundColor: THEME.colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${THEME.spacing[3]}`,
                  color: THEME.colors.primary[600],
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500], marginBottom: THEME.spacing[1] }}>
                {item.label}
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[900] }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weather Card */}
      <Card delay={100}>
        <SectionHeader
          icon={<FiSun size={24} />}
          title="Current Weather"
          subtitle="Live conditions & 7-day forecast"
          action={
            <Button variant="ghost" size="sm" icon={<FiRefreshCw size={14} />}>
              Refresh
            </Button>
          }
        />

        {/* Current Weather */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: THEME.spacing[3],
            marginBottom: THEME.spacing[6],
          }}
        >
          {[
            { icon: <FiThermometer size={24} />, value: `${weather.current.temp}°C`, label: 'Temperature', color: THEME.colors.semantic.error },
            { icon: <FiSun size={24} />, value: weather.current.condition, label: 'Condition', color: THEME.colors.semantic.warning },
            { icon: <FiDroplet size={24} />, value: `${weather.current.humidity}%`, label: 'Humidity', color: THEME.colors.semantic.info },
            { icon: <FiWind size={24} />, value: `${weather.current.wind} km/h`, label: 'Wind', color: THEME.colors.neutral[500] },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: THEME.spacing[4],
                backgroundColor: THEME.colors.primary[50],
                borderRadius: THEME.borderRadius.xl,
                textAlign: 'center',
              }}
            >
              <div style={{ color: item.color, marginBottom: THEME.spacing[2] }}>{item.icon}</div>
              <div style={{ fontSize: THEME.typography.fontSize.lg, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                {item.value}
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Forecast */}
        <div
          style={{
            display: 'flex',
            gap: THEME.spacing[2],
            overflowX: 'auto',
            paddingBottom: THEME.spacing[2],
            margin: `0 -${THEME.spacing[2]}`,
            padding: `0 ${THEME.spacing[2]}`,
          }}
        >
          {weather.forecast.map((day, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 auto',
                minWidth: 85,
                padding: THEME.spacing[3],
                backgroundColor: i === 0 ? THEME.colors.primary[100] : THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                textAlign: 'center',
                border: i === 0 ? `2px solid ${THEME.colors.primary[300]}` : `1px solid ${THEME.colors.neutral[200]}`,
              }}
            >
              <div style={{ fontSize: THEME.typography.fontSize.xs, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[500], marginBottom: THEME.spacing[2] }}>
                {day.day}
              </div>
              <div style={{ fontSize: '28px', marginBottom: THEME.spacing[2] }}>{day.icon}</div>
              <div style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                {day.high}°
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[400] }}>
                {day.low}°
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Itinerary Card */}
      <Card delay={200}>
        <SectionHeader
          icon={<FiCalendar size={24} />}
          title="Suggested Itinerary"
          subtitle="Make the most of your day"
          action={
            <Button variant="ghost" size="sm" icon={<FiDownload size={14} />}>
              Export
            </Button>
          }
        />

        <div style={{ position: 'relative', paddingLeft: THEME.spacing[8] }}>
          {/* Timeline Line */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              top: 16,
              bottom: 16,
              width: 2,
              backgroundColor: THEME.colors.primary[200],
              borderRadius: THEME.borderRadius.full,
            }}
          />

          {MOCK_DATA.itinerary.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: THEME.spacing[4],
                marginBottom: i < MOCK_DATA.itinerary.length - 1 ? THEME.spacing[5] : 0,
                position: 'relative',
              }}
            >
              {/* Timeline Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: -THEME.spacing[8],
                  top: 2,
                  width: 32,
                  height: 32,
                  borderRadius: THEME.borderRadius.full,
                  backgroundColor: THEME.colors.primary[500],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME.colors.neutral[0],
                  fontSize: THEME.typography.fontSize.xs,
                  zIndex: 1,
                  boxShadow: `0 0 0 4px ${THEME.colors.neutral[0]}, 0 0 0 6px ${THEME.colors.primary[200]}`,
                }}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[3], marginBottom: THEME.spacing[1] }}>
                  <span style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.primary[600] }}>
                    {item.time}
                  </span>
                  <Badge variant="neutral" size="sm">{item.duration}</Badge>
                </div>
                <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[900], marginBottom: THEME.spacing[1] }}>
                  {item.activity}
                </div>
                <div style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500] }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Highlights Section
const HighlightsSection = ({ destination }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[6] }}>
    {/* Main Highlights */}
    <Card delay={0}>
      <SectionHeader
        icon={<FiStar size={24} />}
        title="Experience Highlights"
        subtitle="What makes this place special"
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: THEME.spacing[4],
        }}
      >
        {(destination.highlights || []).map((highlight, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: THEME.spacing[3],
              padding: THEME.spacing[4],
              backgroundColor: THEME.colors.neutral[50],
              borderRadius: THEME.borderRadius.xl,
              border: `1px solid ${THEME.colors.neutral[200]}`,
              transition: `all ${THEME.transitions.DEFAULT}`,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: THEME.borderRadius.lg,
                background: THEME.colors.gradient.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: THEME.colors.neutral[0],
                flexShrink: 0,
              }}
            >
              <FiCheck size={18} />
            </div>
            <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[700], lineHeight: THEME.typography.lineHeight.relaxed }}>
              {highlight}
            </span>
          </div>
        ))}
      </div>
    </Card>

    {/* Nearby Attractions */}
    <Card delay={100}>
      <SectionHeader
        icon={<FiMapPin size={24} />}
        title="Nearby Attractions"
        subtitle="Explore the surrounding area"
        action={
          <Button variant="ghost" size="sm" icon={<FiMap size={14} />}>
            View Map
          </Button>
        }
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: THEME.spacing[4],
        }}
      >
        {MOCK_DATA.nearbyAttractions.map((attraction, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: THEME.spacing[4],
              padding: THEME.spacing[4],
              backgroundColor: THEME.colors.neutral[50],
              borderRadius: THEME.borderRadius.xl,
              border: `1px solid ${THEME.colors.neutral[200]}`,
              cursor: 'pointer',
              transition: `all ${THEME.transitions.DEFAULT}`,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: THEME.borderRadius.lg,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img src={attraction.image} alt={attraction.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[900], marginBottom: THEME.spacing[1] }}>
                {attraction.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[3], fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
                <span>{attraction.distance} km</span>
                <span>•</span>
                <span>{attraction.time}</span>
                <span>•</span>
                <StarRating rating={attraction.rating} size={12} />
              </div>
            </div>
            <Badge variant="neutral" size="sm">{attraction.type}</Badge>
          </div>
        ))}
      </div>
    </Card>

    {/* Photo Gallery */}
    <Card delay={200}>
      <SectionHeader
        icon={<FiCamera size={24} />}
        title="Photo Gallery"
        subtitle={`${destination.images?.length || 0} photos from travelers`}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: THEME.spacing[3],
        }}
      >
        {(destination.images || []).slice(0, 8).map((img, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: THEME.borderRadius.xl,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={img}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: `transform ${THEME.transitions.DEFAULT}`,
              }}
            />
            {i === 7 && (destination.images?.length || 0) > 8 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME.colors.neutral[0],
                  fontSize: THEME.typography.fontSize.xl,
                  fontWeight: THEME.typography.fontWeight.bold,
                }}
              >
                +{(destination.images?.length || 0) - 8}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Planning Section
const PlanningSection = ({ toast }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      if (newState[key]) {
        toast.success(`"${item}" checked off!`);
      }
      return newState;
    });
  };

  const totalItems = MOCK_DATA.packingList.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[6] }}>
      {/* Packing List */}
      <Card delay={0}>
        <SectionHeader
          icon={<FiPackage size={24} />}
          title="Packing Checklist"
          subtitle={`${checkedCount} of ${totalItems} items packed`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[3] }}>
              <div style={{ width: 120 }}>
                <ProgressBar value={progress} max={100} showValue={false} size="sm" />
              </div>
              <Badge variant={progress === 100 ? 'success' : 'neutral'}>{progress}%</Badge>
            </div>
          }
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: THEME.spacing[5],
          }}
        >
          {MOCK_DATA.packingList.map((category, i) => (
            <div
              key={i}
              style={{
                padding: THEME.spacing[5],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                border: `1px solid ${THEME.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: THEME.spacing[2],
                  marginBottom: THEME.spacing[4],
                }}
              >
                <span style={{ fontSize: '24px' }}>{category.icon}</span>
                <span style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                  {category.category}
                </span>
              </div>
              {category.items.map((item, j) => {
                const key = `${category.category}-${item.name}`;
                const isChecked = checkedItems[key];
                return (
                  <div
                    key={j}
                    onClick={() => toggleItem(category.category, item.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: THEME.spacing[3],
                      padding: `${THEME.spacing[3]} 0`,
                      borderBottom: j < category.items.length - 1 ? `1px solid ${THEME.colors.neutral[200]}` : 'none',
                      cursor: 'pointer',
                      transition: `opacity ${THEME.transitions.fast}`,
                      opacity: isChecked ? 0.6 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: THEME.borderRadius.sm,
                        border: `2px solid ${isChecked ? THEME.colors.primary[500] : THEME.colors.neutral[300]}`,
                        backgroundColor: isChecked ? THEME.colors.primary[500] : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: THEME.colors.neutral[0],
                        transition: `all ${THEME.transitions.DEFAULT}`,
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <FiCheck size={14} />}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: THEME.typography.fontSize.sm,
                        color: THEME.colors.neutral[700],
                        textDecoration: isChecked ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </span>
                    {item.essential && (
                      <Badge variant="warning" size="sm">Essential</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Transport Options */}
      <Card delay={100}>
        <SectionHeader
          icon={<FiNavigation size={24} />}
          title="Getting There"
          subtitle="Transportation options"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: THEME.spacing[4],
          }}
        >
          {MOCK_DATA.transportOptions.map((option, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: THEME.spacing[4],
                padding: THEME.spacing[4],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                border: `1px solid ${THEME.colors.neutral[200]}`,
              }}
            >
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{option.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900], marginBottom: THEME.spacing[1] }}>
                  {option.mode}
                </div>
                <div style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500], marginBottom: THEME.spacing[2] }}>
                  {option.details}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], flexWrap: 'wrap' }}>
                  <Badge>{option.duration}</Badge>
                  <Badge variant="neutral">{option.price}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Local Phrases */}
      <Card delay={200}>
        <SectionHeader
          icon={<FiGlobe size={24} />}
          title="Useful Phrases"
          subtitle="Learn basic local language"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: THEME.spacing[3],
          }}
        >
          {MOCK_DATA.localPhrases.map((phrase, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: THEME.spacing[4],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                border: `1px solid ${THEME.colors.neutral[200]}`,
                gap: THEME.spacing[4],
              }}
            >
              <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500], minWidth: 80 }}>
                {phrase.english}
              </span>
              <div style={{ textAlign: 'right', flex: 1 }}>
                <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                  {phrase.local}
                </div>
                <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.primary[600], fontStyle: 'italic' }}>
                  {phrase.pronunciation}
                </div>
              </div>
              {phrase.audio && (
                <IconButton
                  icon={<FiVolume2 size={16} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => console.log('Playing audio...')}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Tips Section
const TipsSection = ({ selectedTip, setSelectedTip }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[6] }}>
      {/* Travel Tips Carousel */}
      <Card delay={0}>
        <SectionHeader
          icon={<FiZap size={24} />}
          title="Insider Tips"
          subtitle="Pro tips from experienced travelers"
        />
        <div
          style={{
            padding: THEME.spacing[8],
            background: `linear-gradient(135deg, ${THEME.colors.primary[50]} 0%, ${THEME.colors.primary[100]} 100%)`,
            borderRadius: THEME.borderRadius['2xl'],
            textAlign: 'center',
            border: `2px solid ${THEME.colors.primary[200]}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: '56px', marginBottom: THEME.spacing[4] }}>
            {MOCK_DATA.travelTips[selectedTip].icon}
          </div>
          <h4
            style={{
              fontFamily: THEME.typography.fontFamily.heading,
              fontSize: THEME.typography.fontSize.xl,
              fontWeight: THEME.typography.fontWeight.bold,
              color: THEME.colors.neutral[900],
              marginBottom: THEME.spacing[3],
            }}
          >
            {MOCK_DATA.travelTips[selectedTip].title}
          </h4>
          <p
            style={{
              fontSize: THEME.typography.fontSize.base,
              color: THEME.colors.neutral[600],
              lineHeight: THEME.typography.lineHeight.relaxed,
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {MOCK_DATA.travelTips[selectedTip].content}
          </p>

          {/* Navigation Arrows */}
          <IconButton
            icon={<FiChevronLeft size={20} />}
            onClick={() => setSelectedTip(prev => (prev - 1 + MOCK_DATA.travelTips.length) % MOCK_DATA.travelTips.length)}
            variant="solid"
            style={{ position: 'absolute', left: THEME.spacing[4], top: '50%', transform: 'translateY(-50%)' }}
          />
          <IconButton
            icon={<FiChevronRight size={20} />}
            onClick={() => setSelectedTip(prev => (prev + 1) % MOCK_DATA.travelTips.length)}
            variant="solid"
            style={{ position: 'absolute', right: THEME.spacing[4], top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: THEME.spacing[2], marginTop: THEME.spacing[5] }}>
          {MOCK_DATA.travelTips.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedTip(i)}
              style={{
                width: selectedTip === i ? 28 : 10,
                height: 10,
                borderRadius: THEME.borderRadius.full,
                backgroundColor: selectedTip === i ? THEME.colors.primary[500] : THEME.colors.neutral[300],
                border: 'none',
                cursor: 'pointer',
                transition: `all ${THEME.transitions.DEFAULT}`,
              }}
            />
          ))}
        </div>
      </Card>

      {/* Safety Information */}
      <Card delay={100}>
        <SectionHeader
          icon={<FiShield size={24} />}
          title="Safety Information"
          subtitle="Know before you go"
        />
        {MOCK_DATA.safetyInfo.map((item, i) => (
          <div key={i} style={{ marginBottom: i < MOCK_DATA.safetyInfo.length - 1 ? THEME.spacing[5] : 0 }}>
            <ProgressBar value={item.rating} max={5} label={item.label} color={item.color} />
            <p style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500], marginTop: `-${THEME.spacing[2]}` }}>
              {item.description}
            </p>
          </div>
        ))}
      </Card>

      {/* Accessibility */}
      <Card delay={150}>
        <SectionHeader
          icon={<FiUsers size={24} />}
          title="Accessibility"
          subtitle="Facilities & services available"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: THEME.spacing[4],
          }}
        >
          {MOCK_DATA.accessibility.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: THEME.spacing[4],
                padding: THEME.spacing[4],
                backgroundColor: item.available ? THEME.colors.primary[50] : THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                border: `1px solid ${item.available ? THEME.colors.primary[200] : THEME.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: THEME.borderRadius.lg,
                  backgroundColor: item.available ? THEME.colors.primary[100] : THEME.colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], marginBottom: THEME.spacing[1] }}>
                  <span style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[900] }}>
                    {item.feature}
                  </span>
                  {item.available ? (
                    <FiCheckCircle size={14} style={{ color: THEME.colors.primary[500] }} />
                  ) : (
                    <FiXCircle size={14} style={{ color: THEME.colors.neutral[400] }} />
                  )}
                </div>
                <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
                  {item.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cultural Tips */}
      <Card delay={180}>
        <SectionHeader
          icon={<FiGlobe size={24} />}
          title="Local Culture & Etiquette"
          subtitle="Respect local customs"
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: THEME.spacing[4],
          }}
        >
          {MOCK_DATA.culturalTips.map((tip, i) => (
            <div
              key={i}
              style={{
                padding: THEME.spacing[5],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                borderLeft: `4px solid ${THEME.colors.primary[500]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], marginBottom: THEME.spacing[3] }}>
                <span style={{ fontSize: '20px' }}>{tip.icon}</span>
                <span style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                  {tip.title}
                </span>
              </div>
              <p style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[600], lineHeight: THEME.typography.lineHeight.relaxed }}>
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ */}
      <Card delay={200}>
        <SectionHeader
          icon={<FiHelpCircle size={24} />}
          title="Frequently Asked Questions"
          subtitle="Common questions answered"
        />
        <Accordion items={MOCK_DATA.faqs} allowMultiple={false} />
      </Card>
    </div>
  );
};

// Continuing from ReviewsSection...

const ReviewsSection = ({ destination, helpfulReviews, toggleHelpful, showAllReviews, setShowAllReviews, toast }) => {
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('recent');

  const filteredReviews = useMemo(() => {
    let reviews = [...MOCK_DATA.reviews];
    
    // Filter by rating
    if (filterRating > 0) {
      reviews = reviews.filter(r => r.rating >= filterRating);
    }
    
    // Sort
    switch (sortBy) {
      case 'recent':
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return reviews;
  }, [filterRating, sortBy]);

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    MOCK_DATA.reviews.forEach(r => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return dist;
  }, []);

  const averageRating = useMemo(() => {
    const total = MOCK_DATA.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / MOCK_DATA.reviews.length).toFixed(1);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[6] }}>
      <Card delay={0}>
        <SectionHeader
          icon={<FiMessageCircle size={24} />}
          title="Traveler Reviews"
          subtitle={`${destination.reviews}+ verified reviews`}
          action={
            <Button variant="secondary" size="sm" icon={<FiEdit size={14} />}>
              Write Review
            </Button>
          }
        />

        {/* Rating Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: THEME.spacing[6],
            padding: THEME.spacing[6],
            backgroundColor: '#FEF3C7',
            borderRadius: THEME.borderRadius['2xl'],
            marginBottom: THEME.spacing[6],
            flexWrap: 'wrap',
          }}
        >
          {/* Overall Rating */}
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div
              style={{
                fontFamily: THEME.typography.fontFamily.heading,
                fontSize: THEME.typography.fontSize['5xl'],
                fontWeight: THEME.typography.fontWeight.bold,
                color: '#92400E',
                lineHeight: 1,
              }}
            >
              {averageRating}
            </div>
            <div style={{ margin: `${THEME.spacing[2]} 0` }}>
              <StarRating rating={parseFloat(averageRating)} size={18} />
            </div>
            <div style={{ fontSize: THEME.typography.fontSize.sm, color: '#92400E', fontWeight: THEME.typography.fontWeight.medium }}>
              {destination.reviews}+ reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ flex: 1, minWidth: 200 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = Math.round((count / MOCK_DATA.reviews.length) * 100);
              return (
                <div
                  key={star}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: THEME.spacing[3],
                    marginBottom: THEME.spacing[2],
                    cursor: 'pointer',
                    opacity: filterRating === 0 || filterRating === star ? 1 : 0.4,
                    transition: `opacity ${THEME.transitions.fast}`,
                  }}
                  onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                >
                  <span style={{ fontSize: THEME.typography.fontSize.sm, color: '#92400E', minWidth: 50 }}>
                    {star} star
                  </span>
                  <div style={{ flex: 1, height: 8, backgroundColor: '#FDE68A', borderRadius: THEME.borderRadius.full, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: '#F59E0B',
                        borderRadius: THEME.borderRadius.full,
                        transition: `width ${THEME.transitions.DEFAULT}`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: THEME.typography.fontSize.sm, color: '#92400E', minWidth: 40, textAlign: 'right' }}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[3], minWidth: 150 }}>
            {[
              { label: 'Would Recommend', value: '96%', icon: <FiThumbsUp size={16} /> },
              { label: 'Return Visitors', value: '42%', icon: <FiRefreshCw size={16} /> },
              { label: 'With Photos', value: '78%', icon: <FiCamera size={16} /> },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: THEME.spacing[2],
                  padding: THEME.spacing[2],
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: THEME.borderRadius.lg,
                }}
              >
                <span style={{ color: '#92400E' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.bold, color: '#92400E' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: THEME.typography.fontSize.xs, color: '#B45309' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: THEME.spacing[4],
            marginBottom: THEME.spacing[5],
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2] }}>
            <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500] }}>Filter:</span>
            {[0, 5, 4, 3].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
                style={{
                  padding: `${THEME.spacing[1]} ${THEME.spacing[3]}`,
                  borderRadius: THEME.borderRadius.full,
                  border: `1px solid ${filterRating === rating ? THEME.colors.primary[500] : THEME.colors.neutral[300]}`,
                  backgroundColor: filterRating === rating ? THEME.colors.primary[50] : THEME.colors.neutral[0],
                  color: filterRating === rating ? THEME.colors.primary[600] : THEME.colors.neutral[600],
                  fontSize: THEME.typography.fontSize.sm,
                  fontWeight: THEME.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${THEME.transitions.fast}`,
                }}
              >
                {rating === 0 ? 'All' : `${rating}+ ★`}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2] }}>
            <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500] }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`,
                borderRadius: THEME.borderRadius.lg,
                border: `1px solid ${THEME.colors.neutral[300]}`,
                backgroundColor: THEME.colors.neutral[0],
                fontSize: THEME.typography.fontSize.sm,
                fontWeight: THEME.typography.fontWeight.medium,
                color: THEME.colors.neutral[700],
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {displayedReviews.length === 0 ? (
          <EmptyState
            icon={<FiMessageCircle size={32} />}
            title="No reviews match your filter"
            description="Try adjusting your filters to see more reviews"
            action={
              <Button variant="secondary" size="sm" onClick={() => setFilterRating(0)}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[4] }}>
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: THEME.spacing[5],
                  backgroundColor: THEME.colors.neutral[50],
                  borderRadius: THEME.borderRadius['2xl'],
                  border: `1px solid ${THEME.colors.neutral[200]}`,
                }}
              >
                {/* Review Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: THEME.spacing[4],
                    gap: THEME.spacing[4],
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[3] }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: THEME.borderRadius.full,
                        backgroundColor: THEME.colors.primary[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      {review.author.avatar}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], marginBottom: THEME.spacing[1] }}>
                        <span style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                          {review.author.name}
                        </span>
                        {review.verified && (
                          <Badge variant="success" size="sm" icon={<FiCheckCircle size={10} />}>
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
                        <span>{review.author.location}</span>
                        <span>•</span>
                        <span>{review.author.trips} trips</span>
                        <span>•</span>
                        <span>{formatRelativeTime(review.date)}</span>
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>

                {/* Review Content */}
                <h4
                  style={{
                    fontSize: THEME.typography.fontSize.lg,
                    fontWeight: THEME.typography.fontWeight.bold,
                    color: THEME.colors.neutral[900],
                    marginBottom: THEME.spacing[2],
                  }}
                >
                  {review.title}
                </h4>
                <p
                  style={{
                    fontSize: THEME.typography.fontSize.sm,
                    color: THEME.colors.neutral[600],
                    lineHeight: THEME.typography.lineHeight.relaxed,
                    marginBottom: THEME.spacing[4],
                  }}
                >
                  {review.content}
                </p>

                {/* Photos */}
                {review.photos > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: THEME.spacing[2],
                      marginBottom: THEME.spacing[4],
                      padding: THEME.spacing[3],
                      backgroundColor: THEME.colors.neutral[100],
                      borderRadius: THEME.borderRadius.lg,
                      width: 'fit-content',
                    }}
                  >
                    <FiCamera size={16} style={{ color: THEME.colors.neutral[500] }} />
                    <span style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[600] }}>
                      {review.photos} photos attached
                    </span>
                    <Button variant="ghost" size="xs">View</Button>
                  </div>
                )}

                {/* Response */}
                {review.response && (
                  <div
                    style={{
                      padding: THEME.spacing[4],
                      backgroundColor: THEME.colors.primary[50],
                      borderRadius: THEME.borderRadius.xl,
                      borderLeft: `4px solid ${THEME.colors.primary[500]}`,
                      marginBottom: THEME.spacing[4],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], marginBottom: THEME.spacing[2] }}>
                      <FiMessageCircle size={14} style={{ color: THEME.colors.primary[600] }} />
                      <span style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.primary[700] }}>
                        Response from {review.response.author}
                      </span>
                    </div>
                    <p style={{ fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[600], lineHeight: THEME.typography.lineHeight.relaxed }}>
                      {review.response.content}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[4] }}>
                  <button
                    onClick={() => {
                      toggleHelpful(review.id);
                      toast.success(helpfulReviews[review.id] ? 'Removed helpful vote' : 'Marked as helpful!');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: THEME.spacing[2],
                      padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`,
                      borderRadius: THEME.borderRadius.lg,
                      border: `1px solid ${helpfulReviews[review.id] ? THEME.colors.primary[300] : THEME.colors.neutral[300]}`,
                      backgroundColor: helpfulReviews[review.id] ? THEME.colors.primary[50] : THEME.colors.neutral[0],
                      color: helpfulReviews[review.id] ? THEME.colors.primary[600] : THEME.colors.neutral[600],
                      fontSize: THEME.typography.fontSize.sm,
                      fontWeight: THEME.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${THEME.transitions.fast}`,
                    }}
                  >
                    <FiThumbsUp size={14} style={{ fill: helpfulReviews[review.id] ? 'currentColor' : 'none' }} />
                    Helpful ({review.helpful + (helpfulReviews[review.id] ? 1 : 0)})
                  </button>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: THEME.spacing[2],
                      padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`,
                      borderRadius: THEME.borderRadius.lg,
                      border: `1px solid ${THEME.colors.neutral[300]}`,
                      backgroundColor: THEME.colors.neutral[0],
                      color: THEME.colors.neutral[600],
                      fontSize: THEME.typography.fontSize.sm,
                      fontWeight: THEME.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${THEME.transitions.fast}`,
                    }}
                  >
                    <FiShare2 size={14} />
                    Share
                  </button>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: THEME.spacing[2],
                      padding: `${THEME.spacing[2]} ${THEME.spacing[3]}`,
                      borderRadius: THEME.borderRadius.lg,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: THEME.colors.neutral[500],
                      fontSize: THEME.typography.fontSize.sm,
                      fontWeight: THEME.typography.fontWeight.medium,
                      cursor: 'pointer',
                    }}
                  >
                    <FiAlertCircle size={14} />
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {filteredReviews.length > 3 && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowAllReviews(!showAllReviews)}
            icon={showAllReviews ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            style={{ marginTop: THEME.spacing[5] }}
          >
            {showAllReviews ? 'Show Less' : `Show All ${filteredReviews.length} Reviews`}
          </Button>
        )}
      </Card>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ destination, country, isMobile, onShare, toast }) => {
  const { copied, copy } = useClipboard();

  if (isMobile) return null;

  const handleCopyLink = () => {
    copy(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[5] }}>
      {/* Main Booking Card */}
      <div
        style={{
          backgroundColor: THEME.colors.neutral[0],
          borderRadius: THEME.borderRadius['2xl'],
          padding: THEME.spacing[6],
          boxShadow: THEME.shadows.xl,
          border: `1px solid ${THEME.colors.neutral[200]}`,
          position: 'sticky',
          top: 80,
        }}
      >
        {/* Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: THEME.spacing[4],
            padding: THEME.spacing[4],
            backgroundColor: '#FEF3C7',
            borderRadius: THEME.borderRadius.xl,
            marginBottom: THEME.spacing[5],
          }}
        >
          <div
            style={{
              fontFamily: THEME.typography.fontFamily.heading,
              fontSize: THEME.typography.fontSize['4xl'],
              fontWeight: THEME.typography.fontWeight.bold,
              color: '#92400E',
            }}
          >
            {destination.rating}
          </div>
          <div>
            <StarRating rating={destination.rating} size={16} />
            <div style={{ fontSize: THEME.typography.fontSize.sm, color: '#92400E', marginTop: THEME.spacing[1] }}>
              {destination.reviews}+ reviews
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: THEME.spacing[3],
            marginBottom: THEME.spacing[5],
          }}
        >
          {[
            { icon: <FiClock size={18} />, value: destination.duration, label: 'Duration' },
            { icon: <FiUsers size={18} />, value: destination.difficulty, label: 'Difficulty' },
            { icon: <FiMapPin size={18} />, value: destination.type, label: 'Type' },
            { icon: <FiCalendar size={18} />, value: 'Spring', label: 'Best Time' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: THEME.spacing[4],
                backgroundColor: THEME.colors.neutral[50],
                borderRadius: THEME.borderRadius.xl,
                textAlign: 'center',
                border: `1px solid ${THEME.colors.neutral[200]}`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: THEME.borderRadius.lg,
                  backgroundColor: THEME.colors.primary[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${THEME.spacing[2]}`,
                  color: THEME.colors.primary[600],
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900] }}>
                {item.value}
              </div>
              <div style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing[3], marginBottom: THEME.spacing[5] }}>
          <Button to="/contact" icon={<FiMail size={18} />} fullWidth size="lg">
            Request Information
          </Button>
          <Button to="/booking" variant="secondary" icon={<FiCalendar size={18} />} fullWidth>
            Plan My Trip
          </Button>
          <Button
            variant="outline"
            icon={<FiDownload size={18} />}
            fullWidth
            onClick={() => toast.info('Download starting...')}
          >
            Download Guide (PDF)
          </Button>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: THEME.spacing[2], marginBottom: THEME.spacing[5] }}>
          {['Free Cancellation', 'Expert Guides', 'Small Groups', '24/7 Support'].map((feature, i) => (
            <Badge key={i} variant="success" size="sm" icon={<FiCheck size={10} />}>
              {feature}
            </Badge>
          ))}
        </div>

        {/* Contact Info */}
        <div
          style={{
            padding: THEME.spacing[5],
            backgroundColor: THEME.colors.primary[50],
            borderRadius: THEME.borderRadius.xl,
            border: `2px solid ${THEME.colors.primary[200]}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: THEME.spacing[2],
              marginBottom: THEME.spacing[4],
              fontSize: THEME.typography.fontSize.base,
              fontWeight: THEME.typography.fontWeight.bold,
              color: THEME.colors.neutral[900],
            }}
          >
            <FiPhone size={18} style={{ color: THEME.colors.primary[600] }} />
            Need Help Planning?
          </div>
          {[
            { icon: <FiPhone size={16} />, text: '+1 (555) 123-4567', action: 'tel:+15551234567' },
            { icon: <FiMail size={16} />, text: 'travel@explorer.com', action: 'mailto:travel@explorer.com' },
            { icon: <FiMessageCircle size={16} />, text: 'Live Chat Available', action: null },
          ].map((contact, i) => (
            <a
              key={i}
              href={contact.action || '#'}
              onClick={contact.action ? undefined : (e) => { e.preventDefault(); toast.info('Opening chat...'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: THEME.spacing[3],
                padding: `${THEME.spacing[3]} 0`,
                fontSize: THEME.typography.fontSize.sm,
                color: THEME.colors.neutral[700],
                textDecoration: 'none',
                borderBottom: i < 2 ? `1px solid ${THEME.colors.primary[200]}` : 'none',
                transition: `color ${THEME.transitions.fast}`,
              }}
            >
              <span style={{ color: THEME.colors.primary[600] }}>{contact.icon}</span>
              {contact.text}
            </a>
          ))}
        </div>
      </div>

      {/* Map Card */}
      <div
        style={{
          backgroundColor: THEME.colors.neutral[0],
          borderRadius: THEME.borderRadius['2xl'],
          overflow: 'hidden',
          boxShadow: THEME.shadows.lg,
          border: `1px solid ${THEME.colors.neutral[200]}`,
        }}
      >
        <div
          style={{
            height: 200,
            backgroundColor: THEME.colors.neutral[200],
            backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
          <Button
            variant="primary"
            size="sm"
            icon={<FiMap size={16} />}
            onClick={() => toast.info('Opening map...')}
            style={{ position: 'relative', zIndex: 1 }}
          >
            View on Map
          </Button>
        </div>
        <div style={{ padding: THEME.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2], marginBottom: THEME.spacing[2] }}>
            <FiMapPin size={16} style={{ color: THEME.colors.primary[600] }} />
            <span style={{ fontSize: THEME.typography.fontSize.sm, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[900] }}>
              {destination.name}
            </span>
          </div>
          <p style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
            {country?.name || 'Location'} • Click to view interactive map
          </p>
        </div>
      </div>

      {/* Share Card */}
      <div
        style={{
          backgroundColor: THEME.colors.neutral[0],
          borderRadius: THEME.borderRadius['2xl'],
          padding: THEME.spacing[5],
          boxShadow: THEME.shadows.lg,
          border: `1px solid ${THEME.colors.neutral[200]}`,
        }}
      >
        <div style={{ fontSize: THEME.typography.fontSize.base, fontWeight: THEME.typography.fontWeight.bold, color: THEME.colors.neutral[900], marginBottom: THEME.spacing[4] }}>
          Share This Destination
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: THEME.spacing[3] }}>
          {[
            { icon: '📋', label: 'Copy', action: handleCopyLink },
            { icon: '✉️', label: 'Email', action: () => window.open(`mailto:?subject=${encodeURIComponent(destination.name)}&body=${encodeURIComponent(window.location.href)}`) },
            { icon: '💬', label: 'WhatsApp', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(destination.name + ' ' + window.location.href)}`) },
            { icon: '🐦', label: 'Twitter', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(destination.name)}&url=${encodeURIComponent(window.location.href)}`) },
          ].map((option, i) => (
            <button
              key={i}
              onClick={option.action}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: THEME.spacing[2],
                padding: THEME.spacing[3],
                backgroundColor: THEME.colors.neutral[50],
                border: `1px solid ${THEME.colors.neutral[200]}`,
                borderRadius: THEME.borderRadius.xl,
                cursor: 'pointer',
                transition: `all ${THEME.transitions.fast}`,
              }}
            >
              <span style={{ fontSize: '22px' }}>{option.icon}</span>
              <span style={{ fontSize: THEME.typography.fontSize.xs, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[600] }}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

// Related Destinations Component
const RelatedDestinations = ({ destinations, country, isMobile, isTablet }) => {
  if (!destinations || destinations.length === 0) return null;

  return (
    <section
      style={{
        marginTop: THEME.spacing[16],
        paddingTop: THEME.spacing[12],
        borderTop: `2px solid ${THEME.colors.neutral[200]}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: THEME.spacing[8],
          gap: THEME.spacing[4],
          flexWrap: 'wrap',
        }}
      >
        <SectionHeader
          icon={<FiCompass size={24} />}
          title={`More in ${country?.name || 'This Region'}`}
          subtitle="Discover similar destinations"
        />
        <Button
          to={`/country/${destinations[0]?.countryId || destinations[0]?.country_id}`}
          variant="ghost"
          icon={<FiArrowRight size={18} />}
          iconPosition="right"
        >
          View All
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: THEME.spacing[6],
        }}
      >
        {destinations.map((dest, i) => (
          <Link
            key={dest.id}
            to={`/destination/${dest.id}`}
            style={{
              backgroundColor: THEME.colors.neutral[0],
              borderRadius: THEME.borderRadius['2xl'],
              overflow: 'hidden',
              boxShadow: THEME.shadows.lg,
              border: `1px solid ${THEME.colors.neutral[200]}`,
              textDecoration: 'none',
              transition: `all ${THEME.transitions.DEFAULT}`,
              animation: `fadeInUp 0.5s ease ${i * 0.1}s both`,
            }}
          >
            <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
              <img
                src={dest.images?.[0]}
                alt={dest.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: `transform ${THEME.transitions.slow}`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: THEME.spacing[3],
                  right: THEME.spacing[3],
                }}
              >
                <Badge>{dest.type}</Badge>
              </div>
            </div>
            <div style={{ padding: THEME.spacing[5] }}>
              <h4
                style={{
                  fontFamily: THEME.typography.fontFamily.heading,
                  fontSize: THEME.typography.fontSize.xl,
                  fontWeight: THEME.typography.fontWeight.bold,
                  color: THEME.colors.neutral[900],
                  marginBottom: THEME.spacing[3],
                }}
              >
                {dest.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[4], fontSize: THEME.typography.fontSize.sm, color: THEME.colors.neutral[500] }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[1] }}>
                  <FiStar size={14} style={{ fill: THEME.colors.semantic.warning, color: THEME.colors.semantic.warning }} />
                  {dest.rating}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[1] }}>
                  <FiClock size={14} />
                  {dest.duration}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[1] }}>
                  <FiUsers size={14} />
                  {dest.difficulty}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Mobile CTA Component
const MobileCTA = ({ destination, isFavorite, setIsFavorite, toast }) => (
  <div
    className="no-print"
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: THEME.spacing[4],
      backgroundColor: THEME.colors.neutral[0],
      boxShadow: '0 -4px 30px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: THEME.spacing[3],
      zIndex: THEME.zIndex.fixed,
      animation: 'slideUp 0.4s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: THEME.spacing[2] }}>
      <StarRating rating={destination.rating} size={14} />
      <span style={{ fontSize: THEME.typography.fontSize.xs, color: THEME.colors.neutral[500] }}>
        {destination.reviews}+ reviews
      </span>
    </div>
    <div style={{ display: 'flex', gap: THEME.spacing[2] }}>
      <IconButton
        icon={<FiHeart size={20} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />}
        onClick={() => {
          setIsFavorite(!isFavorite);
          toast[isFavorite ? 'info' : 'success'](isFavorite ? 'Removed from favorites' : 'Added to favorites!');
        }}
        active={isFavorite}
        variant="solid"
      />
      <Button to="/contact" size="sm" icon={<FiMail size={16} />}>
        Inquire Now
      </Button>
    </div>
  </div>
);

// Share Modal Component
const ShareModal = ({ isOpen, onClose, destination, toast }) => {
  const { copy } = useClipboard();

  const shareOptions = [
    {
      icon: '📋',
      label: 'Copy Link',
      action: async () => {
        await copy(window.location.href);
        toast.success('Link copied to clipboard!');
        onClose();
      },
    },
    {
      icon: '✉️',
      label: 'Email',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(destination.name)}&body=${encodeURIComponent(`Check out this amazing destination: ${window.location.href}`)}`);
        onClose();
      },
    },
    {
      icon: '💬',
      label: 'WhatsApp',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${destination.name} - ${window.location.href}`)}`);
        onClose();
      },
    },
    {
      icon: '🐦',
      label: 'Twitter',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Discover ${destination.name}`)}&url=${encodeURIComponent(window.location.href)}`);
        onClose();
      },
    },
    {
      icon: '📘',
      label: 'Facebook',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
        onClose();
      },
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
        onClose();
      },
    },
    {
      icon: '📌',
      label: 'Pinterest',
      action: () => {
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(destination.name)}`);
        onClose();
      },
    },
    {
      icon: '💬',
      label: 'Telegram',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(destination.name)}`);
        onClose();
      },
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share This Destination" size="md">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: THEME.spacing[4],
          marginBottom: THEME.spacing[6],
        }}
      >
        {shareOptions.map((option, i) => (
          <button
            key={i}
            onClick={option.action}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: THEME.spacing[2],
              padding: THEME.spacing[4],
              backgroundColor: THEME.colors.neutral[50],
              border: `2px solid ${THEME.colors.neutral[200]}`,
              borderRadius: THEME.borderRadius.xl,
              cursor: 'pointer',
              transition: `all ${THEME.transitions.DEFAULT}`,
            }}
          >
            <span style={{ fontSize: '28px' }}>{option.icon}</span>
            <span style={{ fontSize: THEME.typography.fontSize.xs, fontWeight: THEME.typography.fontWeight.semibold, color: THEME.colors.neutral[700] }}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <Button variant="outline" fullWidth onClick={onClose}>
        Cancel
      </Button>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const DestinationDetailContent = () => {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isMobile, isTablet, isDesktop } = useWindowSize();
  const { isScrolled, direction } = useScrollPosition(80);
  const contentRef = useRef(null);

  // Data fetching
  const { destination, loading: destinationLoading } = useDestination(destinationId);
  const { country } = useCountry(destination?.countryId || destination?.country_id);
  const { destinations: countryDestinations } = useCountryDestinations(destination?.countryId || destination?.country_id);

  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useLocalStorage(`favorite_${destinationId}`, false);
  const [isBookmarked, setIsBookmarked] = useLocalStorage(`bookmark_${destinationId}`, false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTip, setSelectedTip] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useLocalStorage(`helpful_reviews_${destinationId}`, {});

  // Keyboard shortcuts
  useKeyPress('Escape', () => {
    if (isLightboxOpen) setIsLightboxOpen(false);
    if (showShareModal) setShowShareModal(false);
  });

  // Related destinations
  const relatedDestinations = useMemo(
    () => (countryDestinations || []).filter((d) => d.id !== destination?.id).slice(0, 3),
    [countryDestinations, destination]
  );

  // Handlers
  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: destination.name,
          text: destination.description,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleDownload = () => {
    toast.info('Preparing your travel guide PDF...');
    setTimeout(() => toast.success('Download started!'), 1500);
  };

  const handlePrint = () => {
    toast.info('Opening print dialog...');
    setTimeout(() => window.print(), 500);
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleHelpful = (reviewId) => {
    setHelpfulReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // Tab configuration
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: <FiGrid size={16} /> },
    { id: 'highlights', label: 'Highlights', icon: <FiStar size={16} /> },
    { id: 'planning', label: 'Planning', icon: <FiCalendar size={16} /> },
    { id: 'tips', label: 'Tips & Info', icon: <FiInfo size={16} /> },
    { id: 'reviews', label: 'Reviews', icon: <FiMessageCircle size={16} />, count: MOCK_DATA.reviews.length },
  ], []);

  // Loading state
  if (destinationLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: THEME.spacing[5],
          backgroundColor: THEME.colors.neutral[50],
        }}
      >
        <Spinner size={48} color={THEME.colors.primary[500]} />
        <p style={{ fontSize: THEME.typography.fontSize.lg, color: THEME.colors.neutral[500], fontWeight: THEME.typography.fontWeight.medium }}>
          Loading destination...
        </p>
      </div>
    );
  }

  // Not found state
  if (!destination) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: THEME.spacing[8],
          backgroundColor: THEME.colors.primary[50],
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: THEME.borderRadius.full,
            background: THEME.colors.gradient.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: THEME.spacing[8],
            animation: 'float 3s ease-in-out infinite',
            boxShadow: THEME.shadows.glow,
          }}
        >
          <FiAlertTriangle size={48} color={THEME.colors.neutral[0]} />
        </div>
        <h1
          style={{
            fontFamily: THEME.typography.fontFamily.heading,
            fontSize: isMobile ? THEME.typography.fontSize['3xl'] : THEME.typography.fontSize['5xl'],
            fontWeight: THEME.typography.fontWeight.bold,
            color: THEME.colors.neutral[900],
            marginBottom: THEME.spacing[4],
            animation: 'fadeInUp 0.6s ease forwards',
          }}
        >
          Destination Not Found
        </h1>
        <p
          style={{
            fontSize: THEME.typography.fontSize.lg,
            color: THEME.colors.neutral[600],
            marginBottom: THEME.spacing[8],
            maxWidth: 450,
            lineHeight: THEME.typography.lineHeight.relaxed,
            animation: 'fadeInUp 0.6s ease 0.1s both',
          }}
        >
          The destination you're looking for doesn't exist or may have been moved.
        </p>
        <div style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
          <Button to="/destinations" size="lg" icon={<FiCompass size={20} />}>
            Explore All Destinations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Navigation */}
      <Link
        to="/destinations"
        className="no-print"
        style={{
          position: 'fixed',
          top: isScrolled ? THEME.spacing[4] : THEME.spacing[24],
          left: isMobile ? THEME.spacing[4] : THEME.spacing[8],
          zIndex: THEME.zIndex.fixed,
          display: 'flex',
          alignItems: 'center',
          gap: THEME.spacing[2],
          color: isScrolled ? THEME.colors.primary[600] : THEME.colors.neutral[0],
          textDecoration: 'none',
          fontSize: THEME.typography.fontSize.sm,
          fontWeight: THEME.typography.fontWeight.semibold,
          padding: `${THEME.spacing[2]} ${THEME.spacing[4]}`,
          backgroundColor: isScrolled ? THEME.colors.neutral[0] : 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: THEME.borderRadius.full,
          border: isScrolled ? `1px solid ${THEME.colors.neutral[200]}` : '1px solid rgba(255,255,255,0.2)',
          boxShadow: isScrolled ? THEME.shadows.lg : 'none',
          transition: `all ${THEME.transitions.DEFAULT}`,
          transform: direction === 'down' && isScrolled ? 'translateY(-100px)' : 'translateY(0)',
        }}
      >
        <FiArrowLeft size={18} />
        {!isMobile && 'Back to Destinations'}
      </Link>

      {/* Hero Section */}
      <HeroSection
        destination={destination}
        country={country}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        isBookmarked={isBookmarked}
        setIsBookmarked={setIsBookmarked}
        onShare={handleShare}
        onOpenLightbox={() => setIsLightboxOpen(true)}
        onScrollToContent={scrollToContent}
        isMobile={isMobile}
        toast={toast}
      />

      {/* Quick Actions Bar */}
      <QuickActionsBar
        destination={destination}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onShare={handleShare}
        isMobile={isMobile}
        isScrolled={isScrolled}
      />

      {/* Main Content */}
      <main
        ref={contentRef}
        style={{
          backgroundColor: THEME.colors.neutral[50],
          padding: isMobile ? `${THEME.spacing[8]} ${THEME.spacing[4]} ${THEME.spacing[32]}` : `${THEME.spacing[12]} ${THEME.spacing[8]} ${THEME.spacing[24]}`,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Tabs Navigation */}
          <div
            style={{
              marginBottom: THEME.spacing[8],
              overflowX: 'auto',
              borderBottom: `1px solid ${THEME.colors.neutral[200]}`,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'flex', gap: THEME.spacing[1], minWidth: 'max-content' }}>
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                  count={tab.count}
                >
                  {tab.label}
                </Tab>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 400px',
              gap: THEME.spacing[10],
              alignItems: 'start',
            }}
          >
            {/* Main Content Area */}
            <div>
              {activeTab === 'overview' && (
                <OverviewSection destination={destination} country={country} />
              )}
              {activeTab === 'highlights' && (
                <HighlightsSection destination={destination} />
              )}
              {activeTab === 'planning' && (
                <PlanningSection toast={toast} />
              )}
              {activeTab === 'tips' && (
                <TipsSection selectedTip={selectedTip} setSelectedTip={setSelectedTip} />
              )}
              {activeTab === 'reviews' && (
                <ReviewsSection
                  destination={destination}
                  helpfulReviews={helpfulReviews}
                  toggleHelpful={toggleHelpful}
                  showAllReviews={showAllReviews}
                  setShowAllReviews={setShowAllReviews}
                  toast={toast}
                />
              )}
            </div>

            {/* Sidebar */}
            <Sidebar
              destination={destination}
              country={country}
              isMobile={isMobile || isTablet}
              onShare={handleShare}
              toast={toast}
            />
          </div>

          {/* Related Destinations */}
          <RelatedDestinations
            destinations={relatedDestinations}
            country={country}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>
      </main>

      {/* Mobile CTA */}
      {isMobile && (
        <MobileCTA
          destination={destination}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          toast={toast}
        />
      )}

      {/* Lightbox */}
      {isLightboxOpen && destination.images && (
        <Lightbox
          images={destination.images}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        destination={destination}
        toast={toast}
      />
    </>
  );
};

// Main Export with Providers
const DestinationDetail = () => {
  return (
    <>
      <style>{globalStyles}</style>
      <ToastProvider>
        <DestinationDetailContent />
      </ToastProvider>
    </>
  );
};

export default DestinationDetail;