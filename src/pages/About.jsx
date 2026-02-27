import React, { useState, useEffect, useRef } from 'react';
import { 
  FiAward, FiUsers, FiGlobe, FiHeart, FiTarget, FiStar, 
  FiArrowRight, FiLinkedin, FiTwitter, FiInstagram, 
  FiChevronLeft, FiChevronRight, FiZap, FiShield, FiCompass,
  FiMapPin, FiCheck, FiBookOpen, FiFeather, FiSun,
  FiTrendingUp, FiEye, FiClock, FiThumbsUp, FiMessageCircle,
  FiPlay, FiX, FiMaximize2, FiCamera, FiVideo, FiYoutube
} from 'react-icons/fi';
import { 
  Sprout, Globe, Trees, Award, Smartphone, Plane, Leaf, 
  ChevronRight, ChevronLeft, Rocket, Heart, Users, Shield
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import image from '../assets/image.jpg';
import Button from '../components/common/Button';
import CookieSettingsButton from '../components/common/CookieSettingsButton';
import { toYouTubeEmbedUrl } from '../utils/mediaEmbed';

// Evolution Data for Timeline
const EvolutionData = [
  {
    year: "2026",
    title: "The Genesis",
    description: "Altuvera was born from the visionary mind of IGIRANEZA Fabrice, who dreamed of creating travel experiences that transcend ordinary tourism (While he was in Level 5 Tour-> [Tourism & hospitality]). With a single vehicle and unwavering determination, the first safari operation launched in East Africa.",
    icon: <Sprout className="w-6 h-6" />,
    tag: "Foundation",
    details: ["Founded by IGIRANEZA Fabrice", "First safari operation launched", "Mission: Transform travel forever"],
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  },
  {
    year: "2027",
    title: "Conservation Partnership",
    description: "Established groundbreaking partnerships with wildlife conservancies across East Africa. Every safari began directly funding anti-poaching efforts and community development programs.",
    icon: <Heart className="w-6 h-6" />,
    tag: "First Growth",
    details: ["Wildlife conservancy partnerships", "Anti-poaching fund established", "Community development programs."],
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"
  },
  {
    year: "2028",
    title: "Regional Expansion",
    description: "Extended our footprint across four nations: Kenya, Tanzania, Rwanda, and Uganda. Each expansion carefully maintained our signature quality and ethical standards.",
    icon: <Globe className="w-6 h-6" />,
    tag: "Expansion",
    details: ["Kenya & Tanzania operations", "Rwanda gorilla trekking", "Uganda experiences launched"],
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800"
  },
  {
    year: "2029",
    title: "Sustainability Leadership",
    description: "Became the first major safari operator to eliminate all single-use plastics. Implemented 150% carbon offset program and achieved B-Corp certification.",
    icon: <Trees className="w-6 h-6" />,
    tag: "Eco-Pioneer",
    details: ["Plastic-free certification", "Carbon negative operations", "B-Corp certified"],
    image: "https://images.unsplash.com/photo-1534177616064-ef548ae5e58e?w=800"
  },
  {
    year: "2030",
    title: "Digital Innovation",
    description: "Launched immersive virtual safari previews and AI-powered trip matching. Technology enhanced guest connections while maintaining authentic experiences.",
    icon: <Smartphone className="w-6 h-6" />,
    tag: "Innovation",
    details: ["Virtual safari platform", "AI trip matching", "24/7 global support"],
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800"
  },
  {
    year: "2031",
    title: "Global Canopy",
    description: "A worldwide network spanning multiple continents, now leading the transition to completely carbon-negative adventure tourism with the High & Deep Culture philosophy.",
    icon: <Plane className="w-6 h-6" />,
    tag: "The Canopy",
    details: ["Global operations", "High & Deep Culture", "Industry leadership"],
    image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800"
  }
];

// Animated Counter Component
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Video Modal Component
const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  const embedUrl = toYouTubeEmbedUrl(videoUrl, {
    autoplay: 1,
    mute: 0,
    rel: 0,
    modestbranding: 1,
    controls: 1,
    fs: 1,
  }) || videoUrl;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={24} />
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '1000px',
              aspectRatio: '16/9',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000'
            }}
          >
            <iframe
              src={embedUrl}
              title="Video"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Image Lightbox Component
const ImageLightbox = ({ images, currentIndex, isOpen, onClose, onNext, onPrev }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiX size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onPrev}
            style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiChevronLeft size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onNext}
            style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FiChevronRight size={24} />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.caption}
              style={{
                maxWidth: '85%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
            />
          </AnimatePresence>

          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: 'white'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              {images[currentIndex]?.caption}
            </p>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Animated Section Wrapper
const FadeInSection = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: -50 },
    right: { y: 0, x: 50 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Social Icon Component
const SocialIcon = ({ Icon, href = '#' }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
    style={{
      width: '40px',
      height: '40px',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#059669',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#059669';
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
      e.currentTarget.style.color = '#059669';
    }}
  >
    <Icon size={18} />
  </motion.a>
);

// Evolution Timeline Component
const EvolutionTimeline = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextStep = () => setActiveIndex((prev) => (prev + 1) % EvolutionData.length);
  const prevStep = () => setActiveIndex((prev) => (prev - 1 + EvolutionData.length) % EvolutionData.length);

  return (
    <section style={{
      padding: 'clamp(60px, 10vw, 140px) 24px',
      background: '#FAFFFE',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorations */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 70px)' }}>
          <FadeInSection>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: 'rgba(5, 150, 105, 0.08)',
              borderRadius: '100px',
              marginBottom: '20px',
              border: '1px solid rgba(5, 150, 105, 0.12)'
            }}>
              <Leaf style={{ width: '14px', height: '14px', color: '#059669' }} />
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                Our Journey
              </span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: '800',
              color: '#0f172a',
              fontFamily: "'Playfair Display', serif",
              marginBottom: '20px'
            }}>
              The <span style={{ color: '#059669' }}>Growth</span> Narrative
            </h2>
            
            <p style={{
              fontSize: 'clamp(16px, 1.3vw, 18px)',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.8'
            }}>
              From a single sprout to a global canopy. Explore the evolution of Altuvera, 
              founded by visionary IGIRANEZA Fabrice.
            </p>
          </FadeInSection>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 'clamp(20px, 3vw, 40px)',
          alignItems: 'start'
        }}>
          {/* Year Navigation Sidebar */}
          <div style={{
            gridColumn: 'span 12',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '16px',
            scrollbarWidth: 'none'
          }}
          className="evolution-nav"
          >
            {EvolutionData.map((item, idx) => (
              <motion.button
                key={item.year}
                onClick={() => setActiveIndex(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: 'clamp(12px, 2vw, 18px) clamp(16px, 2.5vw, 24px)',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: 'max-content',
                  transition: 'all 0.3s ease',
                  background: idx === activeIndex 
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                    : 'white',
                  boxShadow: idx === activeIndex 
                    ? '0 15px 40px rgba(5, 150, 105, 0.25)' 
                    : '0 4px 15px rgba(0,0,0,0.05)',
                  color: idx === activeIndex ? 'white' : '#64748b'
                }}
              >
                <span style={{
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  fontWeight: '800',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {item.year}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: idx === activeIndex ? 1 : 0.7
                }}>
                  {item.tag}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Content Card */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              gridColumn: 'span 12',
              background: 'white',
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 56px)',
              boxShadow: '0 25px 60px rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative Ring */}
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              right: '-80px',
              width: '300px',
              height: '300px',
              border: '40px solid rgba(5, 150, 105, 0.03)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap: 'clamp(30px, 5vw, 60px)',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Text Content */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '28px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    {React.cloneElement(EvolutionData[activeIndex].icon, { 
                      style: { width: '28px', height: '28px' } 
                    })}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#059669',
                      textTransform: 'uppercase',
                      letterSpacing: '2px'
                    }}>
                      {EvolutionData[activeIndex].tag}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      Established {EvolutionData[activeIndex].year}
                    </div>
                  </div>
                </div>

                <h3 style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '20px',
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: '1.2'
                }}>
                  {EvolutionData[activeIndex].title}
                </h3>

                <p style={{
                  fontSize: 'clamp(15px, 1.2vw, 17px)',
                  color: '#64748b',
                  lineHeight: '1.85',
                  marginBottom: '28px'
                }}>
                  {EvolutionData[activeIndex].description}
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  {EvolutionData[activeIndex].details.map((detail, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <ChevronRight style={{ width: '14px', height: '14px', color: 'white' }} />
                      </div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Side */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
              }}>
                {/* Image with Icon Overlay */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '400px'
                }}>
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      borderRadius: '24px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 50px rgba(5, 150, 105, 0.15)'
                    }}
                  >
                    <img
                      src={EvolutionData[activeIndex].image}
                      alt={EvolutionData[activeIndex].title}
                      style={{
                        width: '100%',
                        height: 'clamp(250px, 30vw, 320px)',
                        objectFit: 'cover'
                      }}
                    />
                  </motion.div>

                  {/* Floating Icon Badge */}
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 0 0 rgba(5, 150, 105, 0.4)',
                        '0 0 0 20px rgba(5, 150, 105, 0)',
                        '0 0 0 0 rgba(5, 150, 105, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      right: '-20px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 15px 30px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    {React.cloneElement(EvolutionData[activeIndex].icon, { 
                      style: { width: '36px', height: '36px' } 
                    })}
                  </motion.div>
                </div>

                {/* Navigation Controls */}
                <div style={{
                  display: 'flex',
                  gap: '16px'
                }}>
                  <motion.button
                    onClick={prevStep}
                    whileHover={{ scale: 1.05, background: '#059669', color: 'white' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '2px solid #059669',
                      background: 'white',
                      color: '#059669',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ChevronLeft style={{ width: '22px', height: '22px' }} />
                  </motion.button>
                  <motion.button
                    onClick={nextStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '2px solid #059669',
                      background: '#059669',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronRight style={{ width: '22px', height: '22px' }} />
                  </motion.button>
                </div>

                {/* Progress Dots */}
                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  {EvolutionData.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      whileHover={{ scale: 1.2 }}
                      style={{
                        width: idx === activeIndex ? '32px' : '10px',
                        height: '10px',
                        borderRadius: '5px',
                        border: 'none',
                        background: idx === activeIndex ? '#059669' : '#D1FAE5',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .evolution-nav::-webkit-scrollbar { display: none; }
        @media (min-width: 1024px) {
          .evolution-nav {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

// Video Card Component
const VideoCard = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -8 }}
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 15px 40px rgba(5, 150, 105, 0.1)'
      }}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        style={{
          width: '100%',
          height: 'clamp(200px, 25vw, 260px)',
          objectFit: 'cover',
          transition: 'transform 0.6s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }}
      />
      
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
        }}
      />

      <motion.div
        animate={{ scale: isHovered ? 1.1 : 1 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.4)'
        }}
      >
        <FiPlay size={24} color="white" style={{ marginLeft: '3px' }} />
      </motion.div>

      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.7)',
        padding: '6px 12px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {video.duration}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#059669',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'white',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          {video.category}
        </span>
        <h4 style={{
          color: 'white',
          fontSize: 'clamp(15px, 1.6vw, 18px)',
          fontWeight: '700',
          margin: 0,
          lineHeight: 1.3
        }}>
          {video.title}
        </h4>
      </div>
    </motion.div>
  );
};

// Gallery Item Component
const GalleryItem = ({ item, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: item.size === 'tall' ? 'clamp(350px, 45vw, 450px)' : 'clamp(200px, 25vw, 280px)',
        gridColumn: item.size === 'wide' ? 'span 2' : 'span 1',
        gridRow: item.size === 'tall' ? 'span 2' : 'span 1'
      }}
    >
      <motion.img
        src={item.url}
        alt={item.caption}
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(5, 150, 105, 0.9) 0%, transparent 60%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '24px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px'
        }}>
          <FiMapPin size={14} color="white" />
          <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
            {item.location}
          </span>
        </div>
        <h4 style={{
          color: 'white',
          fontSize: 'clamp(14px, 1.4vw, 18px)',
          fontWeight: '700',
          margin: 0
        }}>
          {item.caption}
        </h4>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FiMaximize2 size={18} color="#059669" />
      </motion.div>
    </motion.div>
  );
};

// Value Card Component
const ValueCard = ({ icon: Icon, title, description, details, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <FadeInSection delay={index * 0.1}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
          padding: 'clamp(28px, 4vw, 40px)',
          borderRadius: '24px',
          height: '100%',
          border: '1px solid rgba(5, 150, 105, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)'
        }}
        whileHover={{ 
          y: -8,
          boxShadow: '0 25px 50px rgba(5, 150, 105, 0.15)'
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #059669, #10B981)',
            transformOrigin: 'left'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        <motion.div
          style={{
            width: '64px',
            height: '64px',
            background: isHovered ? '#059669' : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            transition: 'all 0.4s ease'
          }}
        >
          <Icon size={28} style={{ color: isHovered ? 'white' : '#059669', transition: 'color 0.4s ease' }} />
        </motion.div>
        
        <h3 style={{
          fontSize: 'clamp(20px, 2.2vw, 24px)',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#0f172a',
          fontFamily: "'Playfair Display', serif"
        }}>
          {title}
        </h3>
        
        <p style={{
          color: '#64748b',
          lineHeight: '1.8',
          fontSize: 'clamp(14px, 1.1vw, 15px)',
          marginBottom: '16px'
        }}>
          {description}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{
                color: '#64748b',
                lineHeight: '1.8',
                fontSize: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(5, 150, 105, 0.1)'
              }}>
                {details}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#059669',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
            marginTop: '8px'
          }}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            ↓
          </motion.span>
        </button>
      </motion.div>
    </FadeInSection>
  );
};

// Team Member Card
const TeamCard = ({ member, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <FadeInSection delay={index * 0.12}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
          border: '1px solid rgba(5, 150, 105, 0.1)'
        }}
        whileHover={{ y: -8 }}
      >
        <div style={{
          position: 'relative',
          height: 'clamp(280px, 35vw, 340px)',
          overflow: 'hidden'
        }}>
          <motion.img
            src={member.image}
            alt={member.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(5, 150, 105, 0.9) 0%, transparent 50%)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          
          <motion.div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '10px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.4 }}
          >
            <SocialIcon Icon={FiLinkedin} />
            <SocialIcon Icon={FiTwitter} />
            <SocialIcon Icon={FiInstagram} />
          </motion.div>

          {member.isFounder && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              padding: '6px 14px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Co-Founder
            </div>
          )}
        </div>
        
        <div style={{ padding: 'clamp(24px, 3vw, 32px)' }}>
          <h3 style={{
            fontSize: 'clamp(20px, 2.2vw, 24px)',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '4px',
            fontFamily: "'Playfair Display', serif"
          }}>
            {member.name}
          </h3>
          
          <div style={{
            fontSize: 'clamp(12px, 1vw, 13px)',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {member.role}
          </div>
          
          <p style={{
            fontSize: 'clamp(14px, 1.1vw, 15px)',
            color: '#64748b',
            lineHeight: '1.75',
            marginBottom: '16px'
          }}>
            {member.bio}
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {member.expertise.map((skill, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 14px',
                  background: '#ECFDF5',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#059669'
                }}
              >
                {skill}
              </span>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(5, 150, 105, 0.1)'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.7',
              fontStyle: 'italic'
            }}>
              "{member.quote}"
            </p>
          </div>
        </div>
      </motion.div>
    </FadeInSection>
  );
};

// Quote Block Component
const QuoteBlock = ({ quote, author, role, image }) => (
  <FadeInSection>
    <div style={{
      background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      borderRadius: '32px',
      padding: 'clamp(32px, 5vw, 56px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '30px',
        fontSize: '120px',
        color: 'rgba(5, 150, 105, 0.1)',
        fontFamily: 'Georgia, serif',
        lineHeight: 1
      }}>
        "
      </div>
      
      <blockquote style={{
        fontSize: 'clamp(18px, 2.2vw, 26px)',
        fontWeight: '500',
        color: '#0f172a',
        lineHeight: '1.7',
        fontStyle: 'italic',
        marginBottom: '28px',
        fontFamily: "'Playfair Display', serif",
        position: 'relative',
        zIndex: 1
      }}>
        {quote}
      </blockquote>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <img
          src={image}
          alt={author}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid white'
          }}
        />
        <div>
          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '18px' }}>
            {author}
          </div>
          <div style={{ color: '#059669', fontSize: '14px', fontWeight: '600' }}>
            {role}
          </div>
        </div>
      </div>
    </div>
  </FadeInSection>
);

// Stat Card Component
const StatCard = ({ value, suffix, label, description, icon: Icon }) => (
  <FadeInSection>
    <motion.div
      whileHover={{ y: -5 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: 'clamp(28px, 4vw, 40px)',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
        border: '1px solid rgba(5, 150, 105, 0.1)'
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        background: '#ECFDF5',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        <Icon size={26} color="#059669" />
      </div>
      
      <div style={{
        fontSize: 'clamp(36px, 5vw, 52px)',
        fontWeight: '800',
        color: '#059669',
        lineHeight: 1,
        marginBottom: '8px',
        fontFamily: "'Playfair Display', serif"
      }}>
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      
      <div style={{
        fontSize: 'clamp(14px, 1.2vw, 16px)',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {label}
      </div>
      
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        lineHeight: '1.6',
        margin: 0
      }}>
        {description}
      </p>
    </motion.div>
  </FadeInSection>
);

const About = () => {
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: '' });
  const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0 });

  const heroImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920";

  const team = [
    {
      name: 'IGIRANEZA Fabrice',
      role: 'Co-Founder & Visionary',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'IGIRANEZA Fabrice is the creative genius and visionary behind Altuvera. In 2026, he transformed his dream of creating transformative travel experiences into reality. With an unwavering belief that travel can change lives, Fabrice designed Altuvera\'s revolutionary "High & Deep Culture" philosophy that now defines modern safari experiences worldwide.',
      expertise: ['Visionary Leadership', 'Product Design', 'Innovation'],
      quote: 'I designed Altuvera to prove that travel can transform both the traveler and the world they visit.',
      isFounder: true
    },
    {
      name: 'James Kariuki',
      role: 'Chief Executive Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'James brings over two decades of safari expertise to lead Altuvera\'s operations. His deep knowledge of East African wildlife and cultures, combined with his passion for sustainable tourism, makes him the perfect steward of Fabrice\'s vision.',
      expertise: ['Safari Operations', 'Wildlife Conservation', 'Strategic Leadership'],
      quote: 'Every sunrise in Africa teaches me something new. After 25 years, I\'m still learning.',
      isFounder: false
    },
    {
      name: 'Amara Okonkwo',
      role: 'Chief Operations Officer',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      bio: 'Amara brings over 15 years of experience in sustainable tourism management. She previously led operations for three major conservation projects across Kenya and Tanzania. Her expertise ensures every Altuvera journey operates seamlessly while maximizing positive impact.',
      expertise: ['Operations', 'Sustainability', 'Community Relations'],
      quote: 'Sustainability isn\'t a feature—it\'s the foundation of everything we do.',
      isFounder: false
    },
    {
      name: 'Sarah Wanjiku',
      role: 'Director of Guest Experience',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      bio: 'Sarah has dedicated her career to understanding what makes travel truly memorable. With a background in luxury hospitality, she oversees every aspect of the guest journey—from the first inquiry to post-trip follow-up.',
      expertise: ['Guest Relations', 'Luxury Hospitality', 'Experience Design'],
      quote: 'The magic is in the details. We remember what you mentioned once, six months ago.',
      isFounder: false
    },
  ];

  const values = [
    {
      icon: FiHeart,
      title: 'Authentic Passion',
      description: 'We don\'t just guide tours—we share a lifetime of deep, genuine love for the African soil, its magnificent wildlife, and the rich tapestry of cultures that have flourished here for millennia.',
      details: 'Our passion extends beyond professional duty. Many of our team members have dedicated their entire lives to understanding and protecting Africa\'s ecosystems. This isn\'t a job for us—it\'s a calling.'
    },
    {
      icon: FiShield,
      title: 'Unwavering Integrity',
      description: 'Complete transparency defines every interaction. From honest pricing with no hidden fees to respecting sacred traditions and honoring commitments, we operate with integrity that builds lasting trust.',
      details: 'Every quote is comprehensive. Every expectation is realistic. When we say something is included, it\'s included. When we recommend a destination, it\'s because we genuinely believe it\'s right for you.'
    },
    {
      icon: FiGlobe,
      title: 'Environmental Stewardship',
      description: 'Pioneering low-impact travel that goes beyond sustainability—we actively restore vulnerable ecosystems and contribute to conservation efforts that protect Africa\'s natural heritage.',
      details: 'Since 2026, we\'ve operated as a plastic-free company. We offset 150% of our carbon emissions. We contribute 5% of every booking to our conservation fund.'
    },
    {
      icon: FiZap,
      title: 'Transformative Moments',
      description: 'We specialize in creating those rare, unplannable encounters that transform a journey into a life-changing experience. The moments you\'ll remember forever.',
      details: 'Our guides know where the leopards rest. They understand the migration patterns. This deep knowledge allows us to position you for those magical moments.'
    },
    {
      icon: FiUsers,
      title: 'Community Partnership',
      description: 'Our success is measured by the positive impact we create in local communities. We employ local talent, support indigenous businesses, and ensure tourism benefits flow to those who need it most.',
      details: 'Over 90% of our staff come from local communities. We\'ve funded schools and medical clinics. Our initiatives have created over 200 jobs outside of Altuvera itself.'
    },
    {
      icon: FiCompass,
      title: 'Expert Guidance',
      description: 'Our team combines generations of local knowledge with professional certifications. We don\'t just show you Africa—we help you understand its rhythms, its stories, and its significance.',
      details: 'Every Altuvera guide undergoes a minimum of 18 months of training. They bring something no classroom can teach: a lifetime of living alongside the wildlife and cultures they introduce you to.'
    }
  ];

  const stats = [
    { 
      value: 15000, 
      suffix: '+', 
      label: 'Happy Explorers', 
      description: 'Travelers transformed by authentic African journeys.',
      icon: FiUsers
    },
    { 
      value: 98, 
      suffix: '%', 
      label: 'Satisfaction', 
      description: 'Consistently exceeding expectations.',
      icon: FiThumbsUp
    },
    { 
      value: 52, 
      suffix: '+', 
      label: 'Destinations', 
      description: 'Across Kenya, Tanzania, Rwanda, and Uganda.',
      icon: FiMapPin
    },
    { 
      value: 100, 
      suffix: '+', 
      label: 'Expert Guides', 
      description: 'Local experts with deep cultural knowledge.',
      icon: FiCompass
    }
  ];

  const videos = [
    {
      title: 'The Altuvera Experience',
      thumbnail: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '4:32',
      category: 'Featured'
    },
    {
      title: 'Great Migration Documentary',
      thumbnail: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '12:45',
      category: 'Wildlife'
    },
    {
      title: 'Meet IGIRANEZA Fabrice',
      thumbnail: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '6:18',
      category: 'Founder'
    },
    {
      title: 'Luxury Safari Lodges Tour',
      thumbnail: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '8:55',
      category: 'Lodges'
    }
  ];

  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200', caption: 'Majestic Elephant Herd', location: 'Amboseli, Kenya', size: 'tall' },
    { url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200', caption: 'The Great Migration', location: 'Serengeti, Tanzania', size: 'normal' },
    { url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200', caption: 'Sunset on the Savanna', location: 'Maasai Mara, Kenya', size: 'normal' },
    { url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200', caption: 'Maasai Cultural Experience', location: 'Ngorongoro, Tanzania', size: 'wide' },
    { url: 'https://images.unsplash.com/photo-1534177616064-ef548ae5e58e?w=1200', caption: 'Mountain Gorilla Encounter', location: 'Volcanoes NP, Rwanda', size: 'normal' },
    { url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200', caption: 'Cheetah at Dawn', location: 'Samburu, Kenya', size: 'tall' },
    { url: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200', caption: 'Hot Air Balloon Safari', location: 'Maasai Mara, Kenya', size: 'normal' },
    { url: 'https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?w=1200', caption: 'Lion Pride Resting', location: 'Serengeti, Tanzania', size: 'normal' },
  ];

  const openLightbox = (index) => setLightbox({ isOpen: true, currentIndex: index });
  const closeLightbox = () => setLightbox({ isOpen: false, currentIndex: 0 });
  const nextImage = () => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % galleryImages.length }));
  const prevImage = () => setLightbox(prev => ({ ...prev, currentIndex: (prev.currentIndex - 1 + galleryImages.length) % galleryImages.length }));

  return (
    <div className="about-page" style={{ backgroundColor: '#fff', color: '#0f172a', overflowX: 'hidden' }}>
      {/* Modals */}
      <VideoModal 
        isOpen={videoModal.isOpen} 
        onClose={() => setVideoModal({ isOpen: false, url: '' })}
        videoUrl={videoModal.url}
      />
      <ImageLightbox
        images={galleryImages}
        currentIndex={lightbox.currentIndex}
        isOpen={lightbox.isOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />

      <PageHeader 
        title="Our Heritage"
        subtitle="Discover the story of Altuvera—designed and created by IGIRANEZA Fabrice, where adventure meets preservation and every journey becomes transformative."
        backgroundImage={heroImage}
        breadcrumbs={[{ label: 'About Us' }]}
      />

      {/* Cookie Settings */}
      <section style={{ padding: '16px 24px 0', background: '#fff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <CookieSettingsButton />
        </div>
      </section>

      {/* Introduction Section */}
      <section style={{ 
        padding: 'clamp(60px, 10vw, 120px) 24px',
        background: 'linear-gradient(180deg, #fff 0%, #FAFFFE 100%)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <FadeInSection>
            <span style={styles.label}>Welcome to Altuvera</span>
            
            <h2 style={{ ...styles.h2, marginBottom: '32px' }}>
              More Than a Safari Company—<span style={{ color: '#059669' }}>A Movement</span>
            </h2>
            
            <p style={{ 
              ...styles.p, 
              fontSize: 'clamp(17px, 1.5vw, 20px)',
              maxWidth: '800px',
              margin: '0 auto 28px'
            }}>
              In 2026, <strong style={{ color: '#059669' }}>IGIRANEZA Fabrice</strong> transformed 
              his vision into reality by founding Altuvera. He believed that travel could be more 
              than sightseeing—it could be transformation. Today, Altuvera stands as a testament 
              to that belief, offering experiences that go far beyond checking destinations off a list.
            </p>
            
            <p style={{ 
              ...styles.p, 
              maxWidth: '800px',
              margin: '0 auto 28px'
            }}>
              We believe that true exploration forges deep, meaningful connections—with the land 
              beneath your feet, the wildlife that calls it home, and the communities that have 
              thrived here for countless generations. Our approach combines the comfort and 
              refinement of luxury travel with the authenticity of genuine cultural immersion.
            </p>

            <p style={{ 
              ...styles.p, 
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              From the visionary mind of IGIRANEZA Fabrice emerged the "High & Deep Culture" 
              philosophy—a revolutionary approach that has redefined what experiential travel 
              means for the modern explorer. We've guided scientists, artists, families, 
              honeymooners, and everyone in between, united by a shared desire for something 
              real and transformative.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Video Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) 24px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
            <FadeInSection>
              <span style={styles.label}>Watch & Explore</span>
              <h2 style={styles.h2}>
                Experience Altuvera <span style={{ color: '#059669' }}>Through Film</span>
              </h2>
              <p style={{ ...styles.p, maxWidth: '650px', margin: '0 auto' }}>
                Immerse yourself in the sights and sounds of East Africa through our 
                award-winning documentary content.
              </p>
            </FadeInSection>
          </div>

          {/* Main Video */}
          <FadeInSection>
            <div 
              onClick={() => setVideoModal({ isOpen: true, url: videos[0].url })}
              style={{
                position: 'relative',
                borderRadius: '32px',
                overflow: 'hidden',
                cursor: 'pointer',
                marginBottom: 'clamp(30px, 5vw, 50px)',
                boxShadow: '0 30px 60px rgba(5, 150, 105, 0.15)'
              }}
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6 }}
                src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600"
                alt="Featured Video"
                style={{
                  width: '100%',
                  height: 'clamp(280px, 45vw, 550px)',
                  objectFit: 'cover'
                }}
              />
              
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.3) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: 'clamp(70px, 10vw, 100px)',
                    height: 'clamp(70px, 10vw, 100px)',
                    borderRadius: '50%',
                    background: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 50px rgba(5, 150, 105, 0.5)',
                    marginBottom: '24px'
                  }}
                >
                  <FiPlay size={36} color="white" style={{ marginLeft: '5px' }} />
                </motion.div>
                
                <h3 style={{
                  color: 'white',
                  fontSize: 'clamp(22px, 3.5vw, 36px)',
                  fontWeight: '700',
                  textAlign: 'center',
                  fontFamily: "'Playfair Display', serif",
                  marginBottom: '12px'
                }}>
                  The Altuvera Experience
                </h3>
                
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 'clamp(14px, 1.3vw, 17px)',
                  textAlign: 'center',
                  maxWidth: '450px'
                }}>
                  Watch our award-winning documentary
                </p>
              </div>
            </div>
          </FadeInSection>

          {/* Video Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(16px, 2vw, 24px)'
          }}>
            {videos.slice(1).map((video, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <VideoCard 
                  video={video} 
                  onClick={() => setVideoModal({ isOpen: true, url: video.url })}
                />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section with Image */}
      <section style={{ 
        padding: 'clamp(60px, 10vw, 140px) 24px',
        position: 'relative',
        overflow: 'hidden',
        background: '#F0FDF4'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: 'clamp(40px, 6vw, 80px)',
            alignItems: 'center'
          }}>
            {/* Image with Collage */}
            <FadeInSection direction="left">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                position: 'relative'
              }}>
                <motion.div
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)',
                    gridRow: 'span 2'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600"
                    alt="Safari Experience"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '380px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600"
                    alt="Wildlife"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '180px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(5, 150, 105, 0.15)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600"
                    alt="Culture"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '180px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>

                {/* Founder Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  viewport={{ once: true }}
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    borderRadius: '20px',
                    padding: '20px 28px',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(5, 150, 105, 0.35)',
                    zIndex: 10
                  }}
                >
                  <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Founded by</div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>IGIRANEZA Fabrice</div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>2026</div>
                </motion.div>
              </div>
            </FadeInSection>

            {/* Text Content */}
            <FadeInSection direction="right" delay={0.15}>
              <span style={styles.label}>Our Philosophy</span>
              
              <h2 style={styles.h2}>
                Understanding <span style={{ color: '#059669' }}>High & Deep Culture</span>
              </h2>
              
              <div style={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #059669, #10B981)',
                marginBottom: '28px',
                borderRadius: '2px'
              }} />
              
              <p style={styles.p}>
                The concept of <strong style={{ color: '#059669' }}>"High & Deep Culture"</strong> is 
                the philosophical foundation designed by IGIRANEZA Fabrice. It emerged from years of 
                observing what truly moves people during their African journeys—and what leaves them 
                unchanged despite spectacular surroundings.
              </p>
              
              <p style={styles.p}>
                <strong style={{ color: '#059669' }}>"High Culture"</strong> represents our commitment 
                to excellence in every tangible aspect. Accommodations that blend luxury with authentic 
                African aesthetics. Guides who communicate with eloquence. Logistics so seamless they 
                become invisible.
              </p>
              
              <p style={styles.p}>
                <strong style={{ color: '#059669' }}>"Deep Culture"</strong> is where transformation 
                happens. Genuine human connection and understanding. Sharing meals with Maasai families. 
                Learning the stories behind traditions. The unscripted moments of wonder as Africa 
                reveals truths about nature, humanity, and yourself.
              </p>

              <p style={styles.p}>
                Together, High and Deep Culture create journeys that are both comfortable and 
                challenging, both luxurious and authentic, both escapes from ordinary life and 
                invitations to engage more deeply with the world.
              </p>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Founder's Story Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) 24px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={styles.label}>The Beginning</span>
              <h2 style={styles.h2}>
                A Vision Born from <span style={{ color: '#059669' }}>IGIRANEZA Fabrice</span>
              </h2>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              borderRadius: '32px',
              padding: 'clamp(32px, 5vw, 56px)',
              boxShadow: '0 20px 50px rgba(5, 150, 105, 0.1)'
            }}>
              <p style={{
                ...styles.p,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                marginBottom: '24px'
              }}>
                In 2026, <strong style={{ color: '#059669' }}>IGIRANEZA Fabrice</strong> set out to 
                revolutionize the travel industry. Having witnessed countless tourists pass through 
                Africa's magnificent landscapes without truly connecting to their deeper meaning, 
                Fabrice envisioned something radically different.
              </p>

              <p style={{
                ...styles.p,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                marginBottom: '24px'
              }}>
                "I wanted to create experiences that don't just show people Africa," Fabrice explains. 
                "I wanted to help them understand it, feel it, and carry a piece of it with them forever. 
                Too many operators focus on the checklist—the Big Five, the luxury amenities. They miss 
                what makes Africa truly transformative: the deeper connections, the unexpected moments, 
                the profound impact of encountering wilderness on its own terms."
              </p>

              <p style={{
                ...styles.p,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                marginBottom: '24px'
              }}>
                With this vision, Fabrice designed Altuvera from the ground up. The name itself—a fusion 
                of "altitude" and "vera" (truth)—reflects this mission: reaching higher standards while 
                staying grounded in authentic experience. Every aspect of the company, from guide training 
                to conservation partnerships to guest communication protocols, was carefully crafted by 
                Fabrice to serve this singular purpose.
              </p>

              <p style={{
                ...styles.p,
                fontSize: 'clamp(16px, 1.3vw, 18px)',
                marginBottom: 0
              }}>
                Today, under Fabrice's continued guidance as Co-Founder, Altuvera has grown into one of 
                East Africa's most respected safari operators. But the mission remains unchanged from 
                that first day in 2026: every journey should have the potential to change a life.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Evolution Timeline */}
      <EvolutionTimeline />

      {/* Stats Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) 24px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
            <FadeInSection>
              <span style={styles.label}>By the Numbers</span>
              <h2 style={styles.h2}>
                Our <span style={{ color: '#059669' }}>Impact</span> Since 2026
              </h2>
            </FadeInSection>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'clamp(20px, 3vw, 32px)'
          }}>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) 24px',
        background: '#F0FDF4'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
            <FadeInSection>
              <span style={styles.label}>Visual Stories</span>
              <h2 style={styles.h2}>
                Moments We've <span style={{ color: '#059669' }}>Captured</span>
              </h2>
              <p style={{ ...styles.p, maxWidth: '600px', margin: '0 auto' }}>
                Each photograph tells a story of adventure and the deep connections forged 
                between travelers and the African wilderness.
              </p>
            </FadeInSection>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            gridAutoFlow: 'dense'
          }}>
            {galleryImages.slice(0, 6).map((item, index) => (
              <FadeInSection key={index} delay={index * 0.08}>
                <GalleryItem 
                  item={item} 
                  onClick={() => openLightbox(index)}
                />
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={0.4}>
            <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)' }}>
              <Button to="/gallery" variant="primary" size="large">
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCamera size={18} />
                  View Full Gallery
                </span>
              </Button>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 140px) 24px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(50px, 7vw, 80px)' }}>
            <FadeInSection>
              <span style={styles.label}>Our Core Values</span>
              <h2 style={styles.h2}>The Principles <span style={{ color: '#059669' }}>Fabrice Designed</span></h2>
              <p style={{ ...styles.p, maxWidth: '750px', margin: '0 auto' }}>
                IGIRANEZA Fabrice established these six principles as the foundation of Altuvera. 
                They guide every decision we make and every journey we create.
              </p>
            </FadeInSection>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
            gap: 'clamp(20px, 2.5vw, 28px)'
          }}>
            {values.map((value, index) => (
              <ValueCard key={index} {...value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) 24px',
        background: '#FAFFFE'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <QuoteBlock
            quote="I designed Altuvera to prove that travel can be more than tourism. It can be a force for transformation—changing travelers, empowering communities, and protecting the wild places that make Africa extraordinary. This is our mission, and it will never change."
            author="IGIRANEZA Fabrice"
            role="Co-Founder & Visionary, Altuvera (Est. 2026)"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
          />
        </div>
      </section>

      {/* Team Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 140px) 24px',
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(50px, 7vw, 80px)' }}>
            <FadeInSection>
              <span style={styles.label}>Our Leadership</span>
              <h2 style={styles.h2}>The <span style={{ color: '#059669' }}>People</span> Behind Your Journey</h2>
              <p style={{ ...styles.p, maxWidth: '750px', margin: '0 auto' }}>
                Led by Co-Founder IGIRANEZA Fabrice, our leadership team combines visionary thinking 
                with deep expertise in wildlife conservation, luxury hospitality, and sustainable tourism.
              </p>
            </FadeInSection>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(24px, 3vw, 40px)'
          }}>
            {team.map((member, index) => (
              <TeamCard key={index} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section style={{
        padding: 'clamp(60px, 10vw, 140px) 24px',
        background: '#F0FDF4'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: 'clamp(40px, 6vw, 80px)'
          }}>
            <FadeInSection>
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '32px',
                padding: 'clamp(32px, 5vw, 48px)',
                height: '100%',
                color: 'white'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <FiTarget size={32} />
                </div>
                
                <h3 style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: '700',
                  marginBottom: '20px',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Our Mission
                </h3>
                
                <p style={{
                  fontSize: 'clamp(16px, 1.3vw, 18px)',
                  lineHeight: '1.8',
                  opacity: 0.95,
                  marginBottom: '24px'
                }}>
                  To create transformative travel experiences that honor Africa's wildlife, 
                  empower its communities, and awaken in every traveler a profound connection 
                  to the natural world.
                </p>

                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  opacity: 0.85
                }}>
                  Designed by IGIRANEZA Fabrice in 2026, this mission guides every decision 
                  we make and every journey we create.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div style={{
                background: 'white',
                borderRadius: '32px',
                padding: 'clamp(32px, 5vw, 48px)',
                height: '100%',
                border: '1px solid rgba(5, 150, 105, 0.15)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#ECFDF5',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <FiEye size={32} color="#059669" />
                </div>
                
                <h3 style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#0f172a',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Our Vision
                </h3>
                
                <p style={{
                  fontSize: 'clamp(16px, 1.3vw, 18px)',
                  lineHeight: '1.8',
                  color: '#374151',
                  marginBottom: '24px'
                }}>
                  A world where travel is a force for conservation, cultural preservation, 
                  and human transformation—where every journey leaves both traveler and 
                  destination better than before.
                </p>

                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#64748b'
                }}>
                  We envision a future where sustainable tourism is the standard, where 
                  communities thrive through ethical partnerships, and where Africa's wild 
                  places remain protected for generations yet unborn.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: 'clamp(80px, 12vw, 160px) 24px',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <span style={{ 
              ...styles.label, 
              background: 'rgba(255,255,255,0.15)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Begin Your Story
            </span>
            
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: '800',
              lineHeight: '1.15',
              color: 'white',
              fontFamily: "'Playfair Display', serif",
              marginBottom: '24px'
            }}>
              Experience Fabrice's Vision for Yourself
            </h2>
            
            <p style={{
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '650px',
              margin: '0 auto 40px'
            }}>
              Join the thousands of explorers who have discovered the transformative power of 
              authentic African travel. Let us show you what's possible when every detail is 
              designed for transformation.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/booking" variant="secondary" size="large" style={{
                  background: 'white',
                  color: '#059669',
                  border: 'none',
                  fontWeight: '700'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Start Planning My Journey
                    <FiArrowRight size={18} />
                  </span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/contact" variant="outline" size="large" style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}>
                  Schedule a Consultation
                </Button>
              </motion.div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 40px)',
              marginTop: '50px',
              flexWrap: 'wrap'
            }}>
              {[
                { icon: FiShield, text: 'Fully Licensed & Insured' },
                { icon: FiAward, text: 'Est. 2026 by Fabrice' },
                { icon: FiMessageCircle, text: '24/7 Support' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'rgba(255,255,255,0.85)'
                  }}
                >
                  <item.icon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Global Styles */}
      <style>{`
        .about-page {
          background:
            radial-gradient(circle at 8% 0%, rgba(16,185,129,0.08) 0%, transparent 32%),
            radial-gradient(circle at 90% 14%, rgba(14,165,233,0.07) 0%, transparent 28%),
            #ffffff;
        }

        .about-page section {
          position: relative;
        }

        .about-page img {
          max-width: 100%;
          display: block;
        }

        .about-page button {
          touch-action: manipulation;
        }

        div::-webkit-scrollbar { display: none; }
        
        @media (max-width: 768px) {
          .about-page section {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .evolution-nav {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styles Object
const styles = {
  label: {
    display: 'inline-block',
    padding: '10px 24px',
    background: 'rgba(5, 150, 105, 0.08)',
    color: '#059669',
    borderRadius: '100px',
    fontSize: 'clamp(11px, 1vw, 13px)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '20px',
    border: '1px solid rgba(5, 150, 105, 0.12)'
  },
  h2: {
    fontSize: 'clamp(28px, 4.5vw, 52px)',
    fontWeight: '800',
    lineHeight: '1.15',
    color: '#0f172a',
    fontFamily: "'Playfair Display', serif",
    marginBottom: '20px'
  },
  p: {
    fontSize: 'clamp(15px, 1.2vw, 17px)',
    lineHeight: '1.85',
    color: '#64748b',
    marginBottom: '18px'
  }
};

export default About;
