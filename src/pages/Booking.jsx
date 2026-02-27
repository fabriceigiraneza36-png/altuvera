import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, FiUsers, FiMapPin, FiCheck, FiArrowRight, FiArrowLeft, 
  FiCheckCircle, FiAlertCircle, FiMail, FiPhone, FiUser, FiGlobe, 
  FiStar, FiMessageSquare, FiHeart, FiClock, FiDollarSign, FiHome,
  FiSend, FiChevronDown
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { countries } from '../data/countries';
import { services } from '../data/services';

// Confetti overlay component — rectangular 'card' confetti with flip/flutter
const ConfettiOverlay = ({ duration = 6500, particleCount = 1400, bursts = 8 }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    const colors = ['#10B981', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#1F2937', '#111827'];

    const particles = [];
    const nowStart = performance.now();

    // schedule staggered bursts across the top width
    for (let b = 0; b < bursts; b++) {
      const burstTime = Math.random() * (duration * 0.6);
      const burstX = (0.05 + Math.random() * 0.9) * window.innerWidth;
      const burstY = Math.max(20, Math.random() * window.innerHeight * 0.12);
      const count = Math.floor(particleCount / bursts * (0.9 + Math.random() * 0.8));

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 8 + Math.random() * 26;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed * 0.9;
        const w = 6 + Math.random() * 20; // card width
        const h = Math.max(4, w * (0.4 + Math.random() * 1.4)); // card height (rectangular)

        particles.push({
          x: burstX + (Math.random() - 0.5) * 120,
          y: burstY + (Math.random() - 0.5) * 40,
          vx,
          vy,
          w,
          h,
          gravity: 0.22 + Math.random() * 0.6,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 18,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1,
          drift: (Math.random() - 0.5) * 1.6,
          wobbleAmp: 6 + Math.random() * 18,
          wobbleFreq: 1 + Math.random() * 3,
          wobblePhase: Math.random() * Math.PI * 2,
          flipSpeed: 0.004 + Math.random() * 0.012,
          flipPhase: Math.random() * Math.PI * 2,
          startAt: nowStart + burstTime,
        });
      }
    }

    let rafId;

    const render = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        if (now < p.startAt) return;

        // time since this particle started
        const t = (now - p.startAt);

        // physics
        p.vy += p.gravity;
        p.vx += p.drift * 0.018;

        // flutter / wobble adds a playful horizontal oscillation
        const wobble = Math.sin((now * 0.001) * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;

        p.x += p.vx + wobble * 0.04;
        p.y += p.vy;
        p.rotation += p.rotationSpeed * (1 + Math.sin(t * 0.002));

        // air resistance
        p.vx *= 0.997;
        p.vy *= 0.997;

        // fade near end
        if (now - nowStart > duration * 0.6) {
          p.opacity -= 0.01 + Math.random() * 0.02;
          if (p.opacity < 0) p.opacity = 0;
        }

        // draw only if visible
        if (p.opacity > 0 && p.y < window.innerHeight + 300) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          // flipping effect: scaleY oscillates between -1 and 1 to simulate card flipping
          const flip = Math.cos((now + p.flipPhase) * p.flipSpeed);
          const scaleY = 0.6 + 0.9 * flip; // vary vertical scale for comedic flip
          ctx.scale(1, scaleY);

          // subtle shadow for depth
          ctx.shadowColor = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 6;

          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

          ctx.restore();
        }
      });

      const timeElapsed = now - nowStart;
      const anyAlive = particles.some(p => p.opacity > 0 && (now >= p.startAt));
      if (timeElapsed < duration || anyAlive) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [duration, particleCount, bursts]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [formData, setFormData] = useState({
    tripType: '',
    destination: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: 0,
    groupType: '',
    accommodation: 'mid-range',
    interests: [],
    budgetRange: '',
    name: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Responsive breakpoints
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const steps = [
    { number: 1, title: 'Trip Details', shortTitle: 'Trip', icon: <FiMapPin size={isMobile ? 18 : 22} /> },
    { number: 2, title: 'Travelers', shortTitle: 'Group', icon: <FiUsers size={isMobile ? 18 : 22} /> },
    { number: 3, title: 'Preferences', shortTitle: 'Prefs', icon: <FiStar size={isMobile ? 18 : 22} /> },
    { number: 4, title: 'Your Info', shortTitle: 'Info', icon: <FiUser size={isMobile ? 18 : 22} /> },
  ];

  const interests = [
    { name: 'Wildlife Safari', icon: '🦁' },
    { name: 'Mountain Trekking', icon: '🏔️' },
    { name: 'Gorilla Tracking', icon: '🦍' },
    { name: 'Beach & Relaxation', icon: '🏖️' },
    { name: 'Cultural Experiences', icon: '🎭' },
    { name: 'Photography', icon: '📸' },
    { name: 'Bird Watching', icon: '🦅' },
    { name: 'Adventure Sports', icon: '🪂' },
  ];

  const accommodationTypes = [
    { id: 'budget', name: 'Budget', description: 'Comfortable lodges & camps', icon: '🏕️' },
    { id: 'mid-range', name: 'Mid-Range', description: 'Quality lodges & tented camps', icon: '🏨' },
    { id: 'luxury', name: 'Luxury', description: 'Premium lodges & camps', icon: '🏰' },
    { id: 'ultra-luxury', name: 'Ultra Luxury', description: 'Exclusive private experiences', icon: '👑' },
  ];

  const groupTypes = [
    { id: 'solo', name: 'Solo', fullName: 'Solo Traveler', icon: '🧑' },
    { id: 'couple', name: 'Couple', fullName: 'Couple', icon: '💑' },
    { id: 'family', name: 'Family', fullName: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', name: 'Friends', fullName: 'Friends', icon: '👥' },
    { id: 'business', name: 'Business', fullName: 'Business', icon: '💼' },
  ];

  const budgetRanges = [
    { id: 'economy', name: 'Economy' },
    { id: 'standard', name: 'Standard' },
    { id: 'premium', name: 'Premium' },
    { id: 'luxury', name: 'Luxury' },
  ];

  // Validation Rules
  const validationRules = {
    tripType: { required: true, message: 'Please select a trip type' },
    destination: { required: true, message: 'Please select a destination' },
    startDate: { 
      required: true, 
      message: 'Please select a start date',
      validate: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) < today) return 'Start date cannot be in the past';
        return null;
      }
    },
    endDate: { 
      required: true, 
      message: 'Please select an end date',
      validate: (value) => {
        if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
          return 'End date must be after start date';
        }
        return null;
      }
    },
    name: { 
      required: true, 
      message: 'Full name is required',
      minLength: 3,
      pattern: /^[a-zA-Z\s'-]+$/,
      patternMessage: 'Please enter a valid name'
    },
    email: { 
      required: true, 
      message: 'Email is required',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please enter a valid email address'
    },
    phone: { 
      required: true, 
      message: 'Phone number is required',
      pattern: /^[\d\s+\-()]{8,20}$/,
      patternMessage: 'Please enter a valid phone number'
    },
    country: { required: true, message: 'Please enter your country' },
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rules.message;
    }
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage;
    }
    if (rules.validate) {
      return rules.validate(value);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setFocusedField(null);
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCounter = (field, increment) => {
    setFormData(prev => {
      const minValues = { adults: 1, children: 0 };
      const maxValues = { adults: 20, children: 15 };
      const newValue = prev[field] + increment;
      return {
        ...prev,
        [field]: Math.max(minValues[field], Math.min(maxValues[field], newValue))
      };
    });
  };

  const validateStep = (step) => {
    const stepFields = {
      1: ['tripType', 'destination', 'startDate', 'endDate'],
      2: [],
      3: [],
      4: ['name', 'email', 'phone', 'country'],
    };

    const fields = stepFields[step] || [];
    let isValid = true;
    const newErrors = {};
    const newTouched = {};

    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const getTripDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} ${diff === 1 ? 'day' : 'days'}` : null;
    }
    return null;
  };

  const getTotalVisitors = () => formData.adults + formData.children;

  const getDestinationName = () => {
    const dest = countries.find(c => c.id === formData.destination);
    return dest ? `${dest.flag} ${dest.name}` : 'Not selected';
  };

  const sendWhatsAppMessage = () => {
    const phoneNumber = '256792352409';
    
    const tripDuration = getTripDuration() || 'Not specified';
    const totalVisitors = getTotalVisitors();
    const destinationName = countries.find(c => c.id === formData.destination)?.name || 'Not specified';
    const accommodationType = accommodationTypes.find(a => a.id === formData.accommodation)?.name || 'Not specified';
    const groupTypeName = groupTypes.find(g => g.id === formData.groupType)?.fullName || 'Not specified';
    const budgetName = budgetRanges.find(b => b.id === formData.budgetRange)?.fullRange || 'Not specified';
    const interestsList = formData.interests.length > 0 ? formData.interests.join(', ') : 'None selected';
    
    const message = `🌍 *NEW BOOKING REQUEST - ALTUVERA TOURS*

Hello Admin! 👋

You have received a new booking inquiry:

📋 *TRAVELER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━
• *Name:* ${formData.name}
• *Email:* ${formData.email}
• *Phone:* ${formData.phone}
• *Country:* ${formData.country}

✈️ *TRIP DETAILS*
━━━━━━━━━━━━━━━━━━━━━
• *Trip Type:* ${formData.tripType || 'Not specified'}
• *Destination:* ${destinationName}
• *Travel Dates:* ${formData.startDate} to ${formData.endDate}
• *Duration:* ${tripDuration}

👥 *GROUP INFORMATION*
━━━━━━━━━━━━━━━━━━━━━
• *Group Type:* ${groupTypeName}
• *Adults:* ${formData.adults}
• *Children:* ${formData.children}
• *Total Travelers:* ${totalVisitors}

⭐ *PREFERENCES*
━━━━━━━━━━━━━━━━━━━━━
• *Accommodation:* ${accommodationType}
• *Budget Range:* ${budgetName}
• *Interests:* ${interestsList}

💬 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━
${formData.specialRequests || 'No special requests'}

━━━━━━━━━━━━━━━━━━━━━
📅 *Submitted:* ${new Date().toLocaleString()}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      sendWhatsAppMessage();
      setIsSubmitted(true);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const prevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  // Responsive Styles
  const styles = {
    section: {
      padding: isMobile ? '40px 16px 100px' : isTablet ? '50px 24px 120px' : '80px 24px 140px',
      backgroundColor: '#F8FAF9',
      minHeight: '100vh',
      position: 'relative',
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: 'none',
      zIndex: 0,
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    
    // Progress Steps
    progressContainer: {
      marginBottom: isMobile ? '30px' : '50px',
      padding: isMobile ? '0' : '0 20px',
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      position: 'relative',
    },
    progressLine: {
      position: 'absolute',
      top: isMobile ? '20px' : '28px',
      left: isMobile ? '30px' : '80px',
      right: isMobile ? '30px' : '80px',
      height: '4px',
      backgroundColor: '#E5E7EB',
      borderRadius: '2px',
      zIndex: 0,
      overflow: 'hidden',
    },
    progressLineFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '2px',
    },
    stepItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 1,
      flex: 1,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    stepCircle: {
      width: isMobile ? '44px' : '56px',
      height: isMobile ? '44px' : '56px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isMobile ? '8px' : '14px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '3px solid',
      position: 'relative',
    },
    stepPulse: {
      position: 'absolute',
      top: '-6px',
      left: '-6px',
      right: '-6px',
      bottom: '-6px',
      borderRadius: '50%',
      border: '2px solid #059669',
      animation: 'pulse 2s infinite',
      opacity: 0.5,
    },
    stepTitle: {
      fontSize: isMobile ? '11px' : '14px',
      fontWeight: '600',
      textAlign: 'center',
      transition: 'color 0.3s ease',
      maxWidth: isMobile ? '60px' : 'none',
    },
    
    // Form Card
    formCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '24px' : '32px',
      padding: isMobile ? '28px 20px' : isTablet ? '40px 30px' : '50px 60px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    formCardGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle at center, rgba(5, 150, 105, 0.03) 0%, transparent 50%)',
      pointerEvents: 'none',
    },
    
    // Step Headers
    stepHeader: {
      textAlign: 'center',
      marginBottom: isMobile ? '28px' : '40px',
    },
    stepTitle2: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '24px' : isTablet ? '28px' : '36px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '8px',
      lineHeight: 1.2,
    },
    stepSubtitle: {
      fontSize: isMobile ? '14px' : '16px',
      color: '#6B7280',
      lineHeight: 1.6,
    },
    
    // Form Grid
    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '20px' : '24px',
    },
    formGroup: {
      position: 'relative',
    },
    formGroupFull: {
      gridColumn: isMobile ? '1' : 'span 2',
    },
    
    // Labels
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '10px',
    },
    labelIcon: {
      color: '#059669',
    },
    required: {
      color: '#EF4444',
      fontSize: '12px',
    },
    
    // Inputs
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '16px 20px',
      fontSize: isMobile ? '16px' : '15px', // 16px prevents zoom on iOS
      border: '2px solid #E5E7EB',
      borderRadius: '14px',
      backgroundColor: '#FAFAFA',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
    },
    inputFocused: {
      borderColor: '#059669',
      backgroundColor: 'white',
      boxShadow: '0 0 0 4px rgba(5, 150, 105, 0.1), 0 4px 12px rgba(5, 150, 105, 0.08)',
    },
    inputError: {
      borderColor: '#EF4444',
      backgroundColor: '#FEF2F2',
      boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
    },
    inputSuccess: {
      borderColor: '#10B981',
      backgroundColor: '#F0FDF4',
    },
    inputIcon: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Select
    select: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '16px 20px',
      paddingRight: '48px',
      fontSize: isMobile ? '16px' : '15px',
      border: '2px solid #E5E7EB',
      borderRadius: '14px',
      backgroundColor: '#FAFAFA',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    selectArrow: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: '#6B7280',
    },
    
    // Textarea
    textarea: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '16px 20px',
      fontSize: isMobile ? '16px' : '15px',
      border: '2px solid #E5E7EB',
      borderRadius: '14px',
      backgroundColor: '#FAFAFA',
      outline: 'none',
      resize: 'vertical',
      minHeight: isMobile ? '100px' : '120px',
      fontFamily: 'inherit',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
    },
    
    // Error Message
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '8px',
      padding: '8px 12px',
      fontSize: '13px',
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
      borderRadius: '8px',
      animation: 'slideDown 0.3s ease',
    },
    
    // Counter Group
    counterSection: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: isMobile ? '16px' : '20px',
    },
    counterGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '16px' : '20px',
      backgroundColor: '#FAFAFA',
      borderRadius: '16px',
      border: '2px solid #E5E7EB',
      transition: 'all 0.3s ease',
    },
    counterGroupActive: {
      borderColor: '#059669',
      backgroundColor: '#F0FDF4',
    },
    counterInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    counterLabel: {
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    counterDescription: {
      fontSize: '12px',
      color: '#6B7280',
    },
    counterControls: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '12px' : '16px',
    },
    counterButton: {
      width: isMobile ? '40px' : '48px',
      height: isMobile ? '40px' : '48px',
      borderRadius: '12px',
      border: '2px solid #E5E7EB',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '20px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: '#374151',
      WebkitTapHighlightColor: 'transparent',
    },
    counterValue: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: '#059669',
      minWidth: '36px',
      textAlign: 'center',
    },
    
    // Group Type Grid
    groupTypeGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
      gap: isMobile ? '10px' : '12px',
    },
    groupTypeCard: {
      padding: isMobile ? '14px 8px' : '18px 12px',
      borderRadius: '14px',
      border: '2px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'center',
      backgroundColor: 'white',
      WebkitTapHighlightColor: 'transparent',
    },
    groupTypeCardSelected: {
      borderColor: '#059669',
      backgroundColor: '#F0FDF4',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
    },
    groupTypeIcon: {
      fontSize: isMobile ? '24px' : '28px',
      marginBottom: '6px',
    },
    groupTypeName: {
      fontSize: isMobile ? '11px' : '13px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    
    // Accommodation Grid
    accommodationGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
      gap: isMobile ? '12px' : '16px',
    },
    accommodationCard: {
      padding: isMobile ? '18px' : '24px',
      borderRadius: '16px',
      border: '2px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: 'white',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      WebkitTapHighlightColor: 'transparent',
    },
    accommodationCardSelected: {
      borderColor: '#059669',
      backgroundColor: '#F0FDF4',
      boxShadow: '0 8px 20px rgba(5, 150, 105, 0.15)',
    },
    accommodationIcon: {
      fontSize: isMobile ? '28px' : '32px',
      flexShrink: 0,
    },
    accommodationContent: {
      flex: 1,
    },
    accommodationTitle: {
      fontSize: isMobile ? '15px' : '17px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '4px',
    },
    accommodationDescription: {
      fontSize: isMobile ? '12px' : '13px',
      color: '#6B7280',
      marginBottom: '8px',
      lineHeight: 1.4,
    },
    // accommodationPrice removed — prices are negotiated via WhatsApp
    checkMark: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#059669',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      animation: 'popIn 0.3s ease',
    },
    
    // Budget Grid
    budgetGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '10px' : '12px',
    },
    budgetCard: {
      padding: isMobile ? '14px 12px' : '20px 16px',
      borderRadius: '14px',
      border: '2px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'center',
      backgroundColor: 'white',
      WebkitTapHighlightColor: 'transparent',
    },
    budgetCardSelected: {
      borderColor: '#059669',
      backgroundColor: '#059669',
      color: 'white',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    },
    budgetName: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '700',
      marginBottom: '4px',
    },
    budgetRange: {
      fontSize: isMobile ? '11px' : '12px',
      opacity: 0.8,
    },
    
    // Interests Grid
    interestsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '10px' : '12px',
    },
    interestTag: {
      padding: isMobile ? '12px 10px' : '16px 14px',
      borderRadius: '12px',
      border: '2px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textAlign: 'center',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      WebkitTapHighlightColor: 'transparent',
    },
    interestTagSelected: {
      borderColor: '#059669',
      backgroundColor: '#059669',
      color: 'white',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
    },
    interestIcon: {
      fontSize: isMobile ? '22px' : '26px',
    },
    interestName: {
      fontSize: isMobile ? '11px' : '13px',
      fontWeight: '600',
      lineHeight: 1.2,
    },
    
    // Trip Summary
    tripSummary: {
      padding: isMobile ? '16px' : '24px',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
      borderRadius: '20px',
      marginBottom: isMobile ? '24px' : '32px',
      border: '2px solid #DCFCE7',
    },
    tripSummaryTitle: {
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: '700',
      color: '#065F46',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tripSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '12px' : '16px',
    },
    tripSummaryItem: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '12px',
    },
    tripSummaryIcon: {
      width: isMobile ? '36px' : '42px',
      height: isMobile ? '36px' : '42px',
      borderRadius: '12px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      flexShrink: 0,
    },
    tripSummaryText: {
      fontSize: isMobile ? '11px' : '12px',
      color: '#065F46',
      lineHeight: 1.3,
    },
    tripSummaryValue: {
      fontWeight: '700',
      display: 'block',
      fontSize: isMobile ? '12px' : '13px',
      color: '#047857',
    },
    
    // Duration Info
    durationInfo: {
      padding: isMobile ? '14px 16px' : '18px 24px',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
      borderRadius: '14px',
      border: '2px solid #DCFCE7',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'fadeInUp 0.3s ease',
    },
    durationIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    },
    
    // Total Visitors
    totalVisitors: {
      padding: isMobile ? '14px 16px' : '18px 24px',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
      borderRadius: '14px',
      border: '2px solid #DCFCE7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    totalVisitorsLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#065F46',
      fontWeight: '600',
      fontSize: isMobile ? '14px' : '15px',
    },
    totalVisitorsValue: {
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '800',
      color: '#059669',
    },
    
    // Navigation
    navigationButtons: {
      display: 'flex',
      justifyContent: currentStep > 1 ? 'space-between' : 'flex-end',
      alignItems: isMobile ? 'stretch' : 'center',
      flexDirection: isMobile ? 'column-reverse' : 'row',
      marginTop: isMobile ? '30px' : '40px',
      paddingTop: isMobile ? '24px' : '30px',
      borderTop: '2px solid #F3F4F6',
      gap: '12px',
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: isMobile ? '14px 20px' : '16px 28px',
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: isMobile ? '14px' : '15px',
      width: isMobile ? '100%' : 'auto',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      WebkitTapHighlightColor: 'transparent',
    },
    navButtonPrimary: {
      backgroundColor: '#059669',
      color: 'white',
      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
    },
    navButtonSecondary: {
      backgroundColor: 'transparent',
      color: '#374151',
      border: '2px solid #E5E7EB',
    },
    
    // Success State
    successContainer: {
      textAlign: 'center',
      padding: isMobile ? '40px 20px' : '60px 40px',
    },
    successIcon: {
      width: isMobile ? '100px' : '130px',
      height: isMobile ? '100px' : '130px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      margin: '0 auto 24px',
      boxShadow: '0 20px 40px rgba(5, 150, 105, 0.3)',
      animation: 'popIn 0.5s ease',
    },
    successTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '28px' : '38px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '12px',
    },
    successText: {
      fontSize: isMobile ? '15px' : '17px',
      color: '#6B7280',
      marginBottom: '24px',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: 1.7,
    },
    whatsappBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: isMobile ? '12px 20px' : '14px 28px',
      backgroundColor: '#25D366',
      color: 'white',
      borderRadius: '50px',
      fontSize: isMobile ? '13px' : '15px',
      fontWeight: '600',
      marginBottom: '24px',
      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
    },
    successButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    
    // Section Title
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: isMobile ? '15px' : '16px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '16px',
      marginTop: '8px',
    },
    sectionIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      backgroundColor: '#F0FDF4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
    },
  };

  const keyframes = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.5); }
      70% { transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 0.3; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  // Form Components
  const FormInput = ({ name, label, type = 'text', placeholder, required, icon, ...props }) => {
    const isFocused = focusedField === name;
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && formData[name];

    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.labelIcon}>{icon}</span>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
        <div style={styles.inputWrapper}>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={(e) => {
              handleBlur(e);
            }}
            placeholder={placeholder}
            style={{
              ...styles.input,
              ...(isFocused && styles.inputFocused),
              ...(hasError && styles.inputError),
              ...(isValid && styles.inputSuccess),
              paddingRight: isValid ? '48px' : '16px',
            }}
            {...props}
          />
          {isValid && (
            <div style={styles.inputIcon}>
              <FiCheckCircle size={20} color="#10B981" />
            </div>
          )}
        </div>
        {hasError && (
          <div style={styles.errorMessage}>
            <FiAlertCircle size={14} />
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  const FormSelect = ({ name, label, options, required, placeholder, icon }) => {
    const isFocused = focusedField === name;
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && formData[name];

    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <span style={styles.labelIcon}>{icon}</span>
          {label}
          {required && <span style={styles.required}>*</span>}
        </label>
        <div style={styles.inputWrapper}>
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={(e) => {
              handleBlur(e);
            }}
            style={{
              ...styles.select,
              ...(isFocused && styles.inputFocused),
              ...(hasError && styles.inputError),
              ...(isValid && styles.inputSuccess),
            }}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options.map(opt => (
              <option key={opt.id || opt.value} value={opt.id || opt.value}>
                {opt.flag ? `${opt.flag} ` : ''}{opt.name || opt.title || opt.label}
              </option>
            ))}
          </select>
          <div style={styles.selectArrow}>
            <FiChevronDown size={20} />
          </div>
        </div>
        {hasError && (
          <div style={styles.errorMessage}>
            <FiAlertCircle size={14} />
            {errors[name]}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle2}>Where's Your Dream Destination?</h2>
              <p style={styles.stepSubtitle}>Let's start planning your perfect African adventure</p>
            </div>
            
            <div style={styles.formGrid}>
              <FormSelect
                name="tripType"
                label="Trip Type"
                options={services}
                required
                placeholder="What type of experience?"
                icon={<FiMapPin size={16} />}
              />
              <FormSelect
                name="destination"
                label="Primary Destination"
                options={countries}
                required
                placeholder="Where would you like to go?"
                icon={<FiGlobe size={16} />}
              />
              <FormInput
                name="startDate"
                label="Start Date"
                type="date"
                required
                icon={<FiCalendar size={16} />}
                min={new Date().toISOString().split('T')[0]}
              />
              <FormInput
                name="endDate"
                label="End Date"
                type="date"
                required
                icon={<FiCalendar size={16} />}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
              
              {getTripDuration() && (
                <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                  <div style={styles.durationInfo}>
                    <div style={styles.durationIcon}>
                      <FiClock size={20} />
                    </div>
                    <div>
                      <span style={{ color: '#065F46', fontWeight: '600', fontSize: isMobile ? '14px' : '15px' }}>
                        Trip Duration
                      </span>
                      <span style={{ display: 'block', color: '#059669', fontWeight: '800', fontSize: isMobile ? '20px' : '24px' }}>
                        {getTripDuration()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle2}>Who's Joining the Adventure?</h2>
              <p style={styles.stepSubtitle}>Tell us about your travel group</p>
            </div>
            
            <div style={styles.formGrid}>
              {/* Group Type */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.sectionTitle}>
                  <div style={styles.sectionIcon}><FiUsers size={16} /></div>
                  Group Type
                </div>
                <div style={styles.groupTypeGrid}>
                  {groupTypes.map(type => (
                    <div
                      key={type.id}
                      style={{
                        ...styles.groupTypeCard,
                        ...(formData.groupType === type.id && styles.groupTypeCardSelected),
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, groupType: type.id }))}
                    >
                      <div style={styles.groupTypeIcon}>{type.icon}</div>
                      <div style={styles.groupTypeName}>{isMobile ? type.name : type.fullName}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travelers Count */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.sectionTitle}>
                  <div style={styles.sectionIcon}><FiUsers size={16} /></div>
                  Number of Travelers
                </div>
                <div style={styles.counterSection}>
                  <div style={{
                    ...styles.counterGroup,
                    ...(formData.adults > 2 && styles.counterGroupActive),
                  }}>
                    <div style={styles.counterInfo}>
                      <span style={styles.counterLabel}>Adults</span>
                      <span style={styles.counterDescription}>18 years and above</span>
                    </div>
                    <div style={styles.counterControls}>
                      <button
                        type="button"
                        style={{
                          ...styles.counterButton,
                          opacity: formData.adults <= 1 ? 0.4 : 1,
                          cursor: formData.adults <= 1 ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleCounter('adults', -1)}
                        disabled={formData.adults <= 1}
                      >
                        −
                      </button>
                      <span style={styles.counterValue}>{formData.adults}</span>
                      <button
                        type="button"
                        style={styles.counterButton}
                        onClick={() => handleCounter('adults', 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{
                    ...styles.counterGroup,
                    ...(formData.children > 0 && styles.counterGroupActive),
                  }}>
                    <div style={styles.counterInfo}>
                      <span style={styles.counterLabel}>Children</span>
                      <span style={styles.counterDescription}>2-17 years old</span>
                    </div>
                    <div style={styles.counterControls}>
                      <button
                        type="button"
                        style={{
                          ...styles.counterButton,
                          opacity: formData.children <= 0 ? 0.4 : 1,
                          cursor: formData.children <= 0 ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleCounter('children', -1)}
                        disabled={formData.children <= 0}
                      >
                        −
                      </button>
                      <span style={styles.counterValue}>{formData.children}</span>
                      <button
                        type="button"
                        style={styles.counterButton}
                        onClick={() => handleCounter('children', 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Visitors */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.totalVisitors}>
                  <div style={styles.totalVisitorsLabel}>
                    <FiUsers color="#059669" size={22} />
                    Total Travelers
                  </div>
                  <span style={styles.totalVisitorsValue}>{getTotalVisitors()}</span>
                </div>
              </div>

              {/* Accommodation */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.sectionTitle}>
                  <div style={styles.sectionIcon}><FiHome size={16} /></div>
                  Accommodation Level
                </div>
                <div style={styles.accommodationGrid}>
                  {accommodationTypes.map(type => (
                    <div
                      key={type.id}
                      style={{
                        ...styles.accommodationCard,
                        ...(formData.accommodation === type.id && styles.accommodationCardSelected),
                      }}
                      onClick={() => setFormData({ ...formData, accommodation: type.id })}
                    >
                      <span style={styles.accommodationIcon}>{type.icon}</span>
                      <div style={styles.accommodationContent}>
                        <h4 style={styles.accommodationTitle}>{type.name}</h4>
                        <p style={styles.accommodationDescription}>{type.description}</p>
                      </div>
                      {formData.accommodation === type.id && (
                        <div style={styles.checkMark}>
                          <FiCheck size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle2}>What Excites You Most?</h2>
              <p style={styles.stepSubtitle}>Select your interests and budget preferences</p>
            </div>
            
            <div style={styles.formGrid}>
              {/* Budget Range */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.sectionTitle}>
                  <div style={styles.sectionIcon}><FiDollarSign size={16} /></div>
                  Budget Preference (we will confirm pricing with you)
                </div>
                <div style={styles.budgetGrid}>
                  {budgetRanges.map(budget => (
                    <div
                      key={budget.id}
                      style={{
                        ...styles.budgetCard,
                        ...(formData.budgetRange === budget.id && styles.budgetCardSelected),
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, budgetRange: budget.id }))}
                    >
                      <div style={styles.budgetName}>{budget.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <div style={styles.sectionTitle}>
                  <div style={styles.sectionIcon}><FiHeart size={16} /></div>
                  Select Your Interests
                </div>
                <div style={styles.interestsGrid}>
                  {interests.map(interest => (
                    <div
                      key={interest.name}
                      style={{
                        ...styles.interestTag,
                        ...(formData.interests.includes(interest.name) && styles.interestTagSelected),
                      }}
                      onClick={() => handleInterestToggle(interest.name)}
                    >
                      <span style={styles.interestIcon}>{interest.icon}</span>
                      <span style={styles.interestName}>{interest.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={{ animation: 'fadeInUp 0.5s ease' }}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle2}>Almost There!</h2>
              <p style={styles.stepSubtitle}>How can we reach you?</p>
            </div>
            
            {/* Trip Summary */}
            <div style={styles.tripSummary}>
              <div style={styles.tripSummaryTitle}>
                📋 Your Trip Summary
              </div>
              <div style={styles.tripSummaryGrid}>
                <div style={styles.tripSummaryItem}>
                  <div style={styles.tripSummaryIcon}><FiMapPin size={18} /></div>
                  <div style={styles.tripSummaryText}>
                    <span style={styles.tripSummaryValue}>{getDestinationName()}</span>
                    Destination
                  </div>
                </div>
                <div style={styles.tripSummaryItem}>
                  <div style={styles.tripSummaryIcon}><FiCalendar size={18} /></div>
                  <div style={styles.tripSummaryText}>
                    <span style={styles.tripSummaryValue}>{getTripDuration() || 'Not set'}</span>
                    Duration
                  </div>
                </div>
                <div style={styles.tripSummaryItem}>
                  <div style={styles.tripSummaryIcon}><FiUsers size={18} /></div>
                  <div style={styles.tripSummaryText}>
                    <span style={styles.tripSummaryValue}>{getTotalVisitors()} travelers</span>
                    Group Size
                  </div>
                </div>
                <div style={styles.tripSummaryItem}>
                  <div style={styles.tripSummaryIcon}><FiStar size={18} /></div>
                  <div style={styles.tripSummaryText}>
                    <span style={styles.tripSummaryValue}>
                      {accommodationTypes.find(a => a.id === formData.accommodation)?.name || 'Not selected'}
                    </span>
                    Accommodation
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.formGrid}>
              <FormInput
                name="name"
                label="Full Name"
                placeholder="John Smith"
                required
                icon={<FiUser size={16} />}
              />
              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                icon={<FiMail size={16} />}
              />
              <FormInput
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+1 234 567 8900"
                required
                icon={<FiPhone size={16} />}
              />
              <FormInput
                name="country"
                label="Your Country"
                placeholder="United States"
                required
                icon={<FiGlobe size={16} />}
              />
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}><FiMessageSquare size={16} /></span>
                  Special Requests or Questions
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requirements, dietary needs, celebrations, or questions..."
                  style={{
                    ...styles.textarea,
                    ...(focusedField === 'specialRequests' && styles.inputFocused),
                  }}
                  onFocus={() => setFocusedField('specialRequests')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <div>
        <ConfettiOverlay duration={4200} particleCount={160} />
        <style>{keyframes}</style>
        <PageHeader 
          title="Booking Request"
          subtitle="Start planning your East African adventure today."
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
          breadcrumbs={[{ label: 'Booking' }]}
        />
        <section style={styles.section}>
          <div style={styles.backgroundPattern} />
          <div style={styles.container}>
            <div style={styles.formCard}>
              <div style={styles.successContainer}>
                <div style={styles.successIcon}>
                  <FiCheckCircle size={isMobile ? 48 : 60} />
                </div>
                <h2 style={styles.successTitle}>Request Sent!</h2>
                <div style={styles.whatsappBadge}>
                  <FiMessageSquare size={18} />
                  Message sent via WhatsApp
                </div>
                <p style={styles.successText}>
                  Thank you for your interest in traveling with Altuvera! Your booking details have been 
                  sent to our team via WhatsApp. We'll reach out within 24 hours with a personalized itinerary.
                </p>
                <div style={styles.successButtons}>
                  <Button to="/" variant="primary">Return Home</Button>
                  <Button to="/destinations" variant="secondary">Explore Destinations</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Render
  return (
    <div>
      <style>{keyframes}</style>
      <PageHeader 
        title="Book Your Adventure"
        subtitle="Start planning your East African adventure today."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: 'Booking' }]}
      />

      <section style={styles.section}>
        <div style={styles.backgroundPattern} />
        <div style={styles.container}>
          {/* Progress Bar */}
          <AnimatedSection animation="fadeInUp">
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div style={styles.progressLine}>
                  <div 
                    style={{
                      ...styles.progressLineFill,
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                {steps.map((step) => (
                  <div 
                    key={step.number} 
                    style={styles.stepItem}
                    onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  >
                    <div
                      style={{
                        ...styles.stepCircle,
                        backgroundColor: currentStep >= step.number ? '#059669' : 'white',
                        borderColor: currentStep >= step.number ? '#059669' : '#D1D5DB',
                        transform: currentStep === step.number ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: currentStep === step.number 
                          ? '0 8px 20px rgba(5, 150, 105, 0.35)' 
                          : currentStep > step.number 
                            ? '0 4px 12px rgba(5, 150, 105, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      {currentStep === step.number && <div style={styles.stepPulse} />}
                      {currentStep > step.number ? (
                        <FiCheck size={isMobile ? 18 : 22} color="white" />
                      ) : (
                        <span style={{ color: currentStep >= step.number ? 'white' : '#6B7280' }}>
                          {step.icon}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.stepTitle,
                        color: currentStep >= step.number ? '#059669' : '#9CA3AF',
                      }}
                    >
                      {isMobile ? step.shortTitle : step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Form Card */}
          <AnimatedSection animation="fadeInUp">
            <div 
              style={{
                ...styles.formCard,
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
              }}
            >
              <div style={styles.formCardGlow} />
              
              <form onSubmit={handleSubmit}>
                {renderStep()}

                <div style={styles.navigationButtons}>
                  {currentStep > 1 ? (
                    <button
                      onClick={prevStep}
                      type="button"
                      style={{
                        ...styles.navButton,
                        ...styles.navButtonSecondary,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <FiArrowLeft size={18} />
                      {!isMobile && 'Previous'}
                    </button>
                  ) : null}
                  
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      type="button"
                      style={{
                        ...styles.navButton,
                        ...styles.navButtonPrimary,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#047857';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.35)';
                      }}
                    >
                      Continue
                      <FiArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      style={{
                        ...styles.navButton,
                        ...styles.navButtonPrimary,
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(5, 150, 105, 0.45)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.35)';
                      }}
                    >
                      <FiSend size={18} />
                      {isMobile ? 'Submit' : 'Submit via WhatsApp'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Booking;
