import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, 
  FiStar, 
  FiArrowRight, 
  FiClock, 
  FiGrid, 
  FiList,
  FiFilter,
  FiSearch,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiHeart,
  FiShare2,
  FiArrowLeft,
  FiCheck,
  FiCamera,
  FiSun,
  FiCompass,
  FiAward
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { countries } from '../data/countries';
import { getDestinationsByCountry } from '../data/destinations';

// ============================================================
// GLOBAL STYLES - Inject once
// ============================================================

const GlobalStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap');
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .destination-card {
        animation: fadeIn 0.6s ease forwards;
      }
      
      .destination-card:hover .card-image {
        transform: scale(1.08);
      }
      
      .destination-card:hover .image-overlay {
        opacity: 0.6;
      }
      
      .feature-tag:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 128, 0, 0.2);
      }
      
      .cta-button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 15px 40px rgba(0, 128, 0, 0.35);
      }
      
      .favorite-btn:hover {
        transform: scale(1.15);
      }
      
      input:focus, select:focus {
        outline: none;
        border-color: #43a047 !important;
        box-shadow: 0 0 0 4px rgba(67, 160, 71, 0.15);
      }
      
      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #e8f5e9;
        border-radius: 10px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #43a047, #1b5e20);
        border-radius: 10px;
      }
      
      /* Selection */
      ::selection {
        background: rgba(67, 160, 71, 0.3);
        color: #1b5e20;
      }
    `}
  </style>
);

// ============================================================
// CUSTOM HOOKS
// ============================================================

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

const useImageSlider = (images, interval = 4000) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  return currentIndex;
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

/**
 * Skeleton Loader with Shimmer Effect
 */
const DestinationCardSkeleton = () => {
  const styles = {
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '28px',
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(0, 128, 0, 0.1)',
    },
    shimmer: {
      background: 'linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    },
    image: {
      height: '260px',
      width: '100%',
    },
    content: {
      padding: '28px',
    },
    title: {
      height: '28px',
      borderRadius: '8px',
      marginBottom: '8px',
      width: '70%',
    },
    location: {
      height: '16px',
      borderRadius: '6px',
      marginBottom: '18px',
      width: '50%',
    },
    text: {
      height: '14px',
      borderRadius: '6px',
      marginBottom: '8px',
    },
    features: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
      marginBottom: '24px',
    },
    feature: {
      height: '36px',
      width: '100px',
      borderRadius: '20px',
    },
  };

  return (
    <div style={styles.card}>
      <div style={{ ...styles.image, ...styles.shimmer }} />
      <div style={styles.content}>
        <div style={{ ...styles.title, ...styles.shimmer }} />
        <div style={{ ...styles.location, ...styles.shimmer }} />
        <div style={{ ...styles.text, ...styles.shimmer }} />
        <div style={{ ...styles.text, ...styles.shimmer, width: '90%' }} />
        <div style={{ ...styles.text, ...styles.shimmer, width: '60%' }} />
        <div style={styles.features}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...styles.feature, ...styles.shimmer }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...styles.shimmer, height: '24px', width: '80px', borderRadius: '6px' }} />
          <div style={{ ...styles.shimmer, height: '44px', width: '130px', borderRadius: '30px' }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Luxurious Destination Card with Image Slider
 */
const DestinationCard = ({ 
  destination, 
  index, 
  viewMode, 
  favorites, 
  onToggleFavorite 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const images = destination.images || [destination.image];
  const currentImageIndex = useImageSlider(images, 4000);
  const isFavorite = favorites.includes(destination.id);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(destination.id);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: destination.description,
        url: `${window.location.origin}/destination/${destination.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/destination/${destination.id}`);
    }
  };

  const styles = {
    card: {
      width: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: viewMode === 'list' ? '24px' : '28px',
      overflow: 'hidden',
      boxShadow: isHovered 
        ? '0 35px 80px rgba(0, 128, 0, 0.25)' 
        : '0 25px 60px rgba(0, 128, 0, 0.12)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'translateY(-12px) scale(1.01)' : 'translateY(0) scale(1)',
      position: 'relative',
      display: viewMode === 'list' ? 'flex' : 'block',
      cursor: 'pointer',
      border: '1px solid rgba(67, 160, 71, 0.1)',
    },
    imageContainer: {
      position: 'relative',
      height: viewMode === 'list' ? '100%' : '260px',
      minHeight: viewMode === 'list' ? '320px' : '260px',
      width: viewMode === 'list' ? '380px' : '100%',
      flexShrink: 0,
      overflow: 'hidden',
    },
    imageOverlay: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(27, 94, 32, 0.7), transparent 60%)',
      zIndex: 1,
      opacity: isHovered ? 0.8 : 1,
      transition: 'opacity 0.5s ease',
    },
    image: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'opacity 1.2s ease-in-out, transform 6s ease',
    },
    badge: {
      position: 'absolute',
      top: '18px',
      left: '18px',
      background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '30px',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      zIndex: 3,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    rating: {
      position: 'absolute',
      top: '18px',
      right: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 16px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#1b5e20',
      zIndex: 3,
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
    actions: {
      position: 'absolute',
      bottom: '18px',
      right: '18px',
      display: 'flex',
      gap: '10px',
      zIndex: 3,
      opacity: isHovered ? 1 : 0,
      transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 0.4s ease',
    },
    actionButton: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    },
    imageIndicators: {
      position: 'absolute',
      bottom: '18px',
      left: '18px',
      display: 'flex',
      gap: '6px',
      zIndex: 3,
    },
    indicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.5)',
      transition: 'all 0.3s ease',
    },
    indicatorActive: {
      width: '24px',
      borderRadius: '10px',
      background: '#fff',
    },
    content: {
      padding: viewMode === 'list' ? '32px' : '28px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: viewMode === 'list' ? '28px' : '24px',
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: '8px',
      lineHeight: 1.3,
      transition: 'color 0.3s ease',
    },
    location: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      color: '#43a047',
      marginBottom: '16px',
      fontWeight: '500',
    },
    description: {
      fontSize: '14px',
      color: '#555',
      lineHeight: '1.8',
      marginBottom: '20px',
      display: '-webkit-box',
      WebkitLineClamp: viewMode === 'list' ? 4 : 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      flex: viewMode === 'list' ? 1 : 'auto',
    },
    features: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '24px',
    },
    feature: {
      background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
      color: '#2e7d32',
      padding: '10px 16px',
      borderRadius: '24px',
      fontSize: '12px',
      fontWeight: '600',
      boxShadow: '0 6px 20px rgba(0, 128, 0, 0.08)',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(67, 160, 71, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '20px',
      padding: '16px',
      background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
      borderRadius: '16px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#2e7d32',
      fontWeight: '500',
    },
    metaIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 128, 0, 0.1)',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: '2px solid #e8f5e9',
      marginTop: 'auto',
    },
    priceWrapper: {
      display: 'flex',
      flexDirection: 'column',
    },
    priceLabel: {
      fontSize: '12px',
      color: '#81c784',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px',
    },
    price: {
      fontSize: '26px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1b5e20 0%, #43a047 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    ctaButton: {
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      boxShadow: '0 10px 30px rgba(0, 128, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
    },
  };

  // Feature icons mapping
  const featureIcons = {
    'Safari': FiCompass,
    'Wildlife': FiCamera,
    'Photography': FiCamera,
    'Luxury': FiAward,
    'Adventure': FiSun,
    'default': FiCheck,
  };

  const getFeatureIcon = (feature) => {
    const Icon = Object.entries(featureIcons).find(([key]) => 
      feature.toLowerCase().includes(key.toLowerCase())
    )?.[1] || featureIcons.default;
    return Icon;
  };

  return (
    <AnimatedSection 
      animation="fadeInUp" 
      delay={index * 0.1}
    >
      <Link 
        to={`/destination/${destination.id}`} 
        style={{ textDecoration: 'none' }}
        aria-label={`View ${destination.name}`}
      >
        <article
          className="destination-card"
          style={styles.card}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container with Slider */}
          <div style={styles.imageContainer}>
            {/* Images */}
            {images.map((img, imgIndex) => (
              <img
                key={imgIndex}
                src={img}
                alt={`${destination.name} - ${imgIndex + 1}`}
                style={{
                  ...styles.image,
                  opacity: imgIndex === currentImageIndex ? 1 : 0,
                  transform: imgIndex === currentImageIndex ? 'scale(1.08)' : 'scale(1)',
                }}
                loading="lazy"
              />
            ))}
            
            {/* Overlay */}
            <div style={styles.imageOverlay} />
            
            {/* Badge */}
            <div style={styles.badge}>
              <FiAward size={14} />
              {destination.type || 'Premium'}
            </div>
            
            {/* Rating */}
            <div style={styles.rating}>
              <FiStar size={16} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span>{destination.rating}</span>
              <span style={{ color: '#81c784', fontWeight: '400' }}>
                ({destination.reviews})
              </span>
            </div>
            
            {/* Image Indicators */}
            {images.length > 1 && (
              <div style={styles.imageIndicators}>
                {images.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.indicator,
                      ...(i === currentImageIndex ? styles.indicatorActive : {}),
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={styles.actions}>
              <button
                className="favorite-btn"
                style={{
                  ...styles.actionButton,
                  background: isFavorite ? '#fee2e2' : 'rgba(255, 255, 255, 0.95)',
                  color: isFavorite ? '#ef4444' : '#6b7280',
                }}
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart 
                  size={20} 
                  style={{ fill: isFavorite ? '#ef4444' : 'transparent' }} 
                />
              </button>
              <button
                style={styles.actionButton}
                onClick={handleShareClick}
                aria-label="Share destination"
              >
                <FiShare2 size={20} style={{ color: '#1b5e20' }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <h3 style={styles.title}>{destination.name}</h3>
            
            <div style={styles.location}>
              <FiMapPin size={16} />
              <span>{destination.location || destination.country}</span>
            </div>
            
            <p style={styles.description}>{destination.description}</p>

            {/* Features/Highlights */}
            {destination.highlights && (
              <div style={styles.features}>
                {destination.highlights.slice(0, 4).map((highlight, i) => {
                  const FeatureIcon = getFeatureIcon(highlight);
                  return (
                    <span 
                      key={i} 
                      className="feature-tag"
                      style={styles.feature}
                    >
                      <FeatureIcon size={14} />
                      {highlight}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Meta Info */}
            <div style={styles.meta}>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <FiClock size={16} style={{ color: '#43a047' }} />
                </div>
                <span>{destination.duration}</span>
              </div>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <FiUsers size={16} style={{ color: '#43a047' }} />
                </div>
                <span>{destination.groupSize || 'Small Groups'}</span>
              </div>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <FiCalendar size={16} style={{ color: '#43a047' }} />
                </div>
                <span>{destination.bestSeason || 'Year Round'}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={styles.priceWrapper}>
                <span style={styles.priceLabel}>Starting from</span>
                <span style={styles.price}>{destination.price}</span>
              </div>
              <span 
                className="cta-button"
                style={styles.ctaButton}
              >
                Reserve Now
                <FiArrowRight size={18} />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </AnimatedSection>
  );
};

/**
 * Elevated Statistics Card
 */
const StatCard = ({ icon: Icon, value, label, delay, color = '#43a047' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    card: {
      background: isHovered 
        ? 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '28px',
      textAlign: 'center',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      boxShadow: isHovered 
        ? '0 25px 60px rgba(0, 128, 0, 0.3)' 
        : '0 15px 40px rgba(0, 128, 0, 0.08)',
      cursor: 'default',
      border: '1px solid rgba(67, 160, 71, 0.1)',
    },
    iconWrapper: {
      width: '64px',
      height: '64px',
      borderRadius: '20px',
      background: isHovered 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      transition: 'all 0.4s ease',
      boxShadow: '0 8px 20px rgba(0, 128, 0, 0.1)',
    },
    value: {
      fontSize: '36px',
      fontWeight: '800',
      color: isHovered ? 'white' : '#1b5e20',
      marginBottom: '6px',
      transition: 'color 0.4s ease',
      fontFamily: "'Poppins', sans-serif",
    },
    label: {
      fontSize: '14px',
      color: isHovered ? 'rgba(255, 255, 255, 0.85)' : '#5a7a5a',
      fontWeight: '600',
      transition: 'color 0.4s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  };

  return (
    <AnimatedSection animation="fadeInUp" delay={delay}>
      <div
        style={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.iconWrapper}>
          <Icon 
            size={28} 
            style={{ color: isHovered ? 'white' : '#43a047' }} 
          />
        </div>
        <div style={styles.value}>{value}</div>
        <div style={styles.label}>{label}</div>
      </div>
    </AnimatedSection>
  );
};

/**
 * Elevated Filter Dropdown
 */
const FilterDropdown = ({ label, options, value, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styles = {
    wrapper: {
      position: 'relative',
      zIndex: isOpen ? 100 : 1,
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 22px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: isOpen ? '2px solid #43a047' : '2px solid #e8f5e9',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1b5e20',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '170px',
      justifyContent: 'space-between',
      boxShadow: isOpen ? '0 10px 30px rgba(0, 128, 0, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      fontFamily: "'Poppins', sans-serif",
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      boxShadow: '0 20px 50px rgba(0, 128, 0, 0.15)',
      border: '1px solid #e8f5e9',
      overflow: 'hidden',
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'all 0.3s ease',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '1px solid #f0fdf4',
      fontFamily: "'Poppins', sans-serif",
    },
  };

  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <div ref={dropdownRef} style={styles.wrapper}>
      <button
        style={styles.button}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && <Icon size={18} style={{ color: '#43a047' }} />}
          {selectedLabel}
        </span>
        <FiChevronDown
          size={18}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
            color: '#43a047',
          }}
        />
      </button>
      <div style={styles.dropdown}>
        {options.map((option, index) => (
          <div
            key={option.value}
            style={{
              ...styles.option,
              backgroundColor: value === option.value ? '#f0fdf4' : 'transparent',
              color: value === option.value ? '#1b5e20' : '#374151',
              fontWeight: value === option.value ? '600' : '400',
              borderBottom: index === options.length - 1 ? 'none' : '1px solid #f0fdf4',
            }}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            onMouseEnter={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }
            }}
            onMouseLeave={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span>{option.label}</span>
            {value === option.value && (
              <FiCheck size={18} style={{ color: '#43a047' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Search Input Component
 */
const SearchInput = ({ value, onChange, onClear }) => {
  const [isFocused, setIsFocused] = useState(false);

  const styles = {
    wrapper: {
      position: 'relative',
      flex: 1,
      maxWidth: '380px',
    },
    input: {
      width: '100%',
      padding: '16px 50px 16px 24px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: isFocused ? '2px solid #43a047' : '2px solid #e8f5e9',
      borderRadius: '16px',
      fontSize: '15px',
      fontWeight: '500',
      color: '#1b5e20',
      transition: 'all 0.3s ease',
      boxShadow: isFocused ? '0 10px 30px rgba(0, 128, 0, 0.15)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
      fontFamily: "'Poppins', sans-serif",
    },
    icon: {
      position: 'absolute',
      right: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#81c784',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearButton: {
      background: '#e8f5e9',
      border: 'none',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.wrapper}>
      <input
        type="text"
        placeholder="Search destinations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
        aria-label="Search destinations"
      />
      <div style={styles.icon}>
        {value ? (
          <button
            onClick={onClear}
            style={styles.clearButton}
            aria-label="Clear search"
          >
            <FiX size={16} style={{ color: '#43a047' }} />
          </button>
        ) : (
          <FiSearch size={20} />
        )}
      </div>
    </div>
  );
};

/**
 * View Mode Toggle
 */
const ViewModeToggle = ({ viewMode, onChange }) => {
  const styles = {
    wrapper: {
      display: 'flex',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      borderRadius: '14px',
      padding: '6px',
      boxShadow: '0 4px 15px rgba(0, 128, 0, 0.08)',
    },
    button: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.wrapper}>
      <button
        style={{
          ...styles.button,
          backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
          boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(0, 128, 0, 0.15)' : 'none',
        }}
        onClick={() => onChange('grid')}
        aria-label="Grid view"
      >
        <FiGrid 
          size={20} 
          style={{ color: viewMode === 'grid' ? '#1b5e20' : '#81c784' }} 
        />
      </button>
      <button
        style={{
          ...styles.button,
          backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
          boxShadow: viewMode === 'list' ? '0 4px 12px rgba(0, 128, 0, 0.15)' : 'none',
        }}
        onClick={() => onChange('list')}
        aria-label="List view"
      >
        <FiList 
          size={20} 
          style={{ color: viewMode === 'list' ? '#1b5e20' : '#81c784' }} 
        />
      </button>
    </div>
  );
};

/**
 * Active Filter Tags
 */
const ActiveFilterTags = ({ filters, onRemove, onClearAll }) => {
  if (filters.length === 0) return null;

  const styles = {
    wrapper: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      borderRadius: '24px',
      fontSize: '13px',
      color: '#1b5e20',
      fontWeight: '600',
      fontFamily: "'Poppins', sans-serif",
    },
    removeButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'rgba(27, 94, 32, 0.15)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    clearAll: {
      padding: '8px 14px',
      background: 'transparent',
      border: 'none',
      fontSize: '13px',
      color: '#5a7a5a',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontFamily: "'Poppins', sans-serif",
    },
  };

  return (
    <div style={styles.wrapper}>
      {filters.map((filter) => (
        <span key={filter.key} style={styles.tag}>
          {filter.label}
          <button
            style={styles.removeButton}
            onClick={filter.clear}
            aria-label={`Remove ${filter.label} filter`}
          >
            <FiX size={12} style={{ color: '#1b5e20' }} />
          </button>
        </span>
      ))}
      <button style={styles.clearAll} onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
};

/**
 * Back to Top Button
 */
const BackToTopButton = ({ visible }) => {
  const styles = {
    button: {
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 12px 35px rgba(0, 128, 0, 0.35)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
      zIndex: 1000,
    },
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      style={styles.button}
      onClick={scrollToTop}
      aria-label="Back to top"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.1)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 128, 0, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 128, 0, 0.35)';
      }}
    >
      <FiChevronUp size={28} style={{ color: 'white' }} />
    </button>
  );
};

/**
 * Empty State Component
 */
const EmptyState = ({ country, searchQuery, onClearFilters }) => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '80px 40px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '32px',
      boxShadow: '0 25px 60px rgba(0, 128, 0, 0.1)',
    },
    iconWrapper: {
      width: '140px',
      height: '140px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 36px',
      boxShadow: '0 20px 50px rgba(0, 128, 0, 0.15)',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: '16px',
    },
    description: {
      fontSize: '16px',
      color: '#5a7a5a',
      marginBottom: '36px',
      maxWidth: '450px',
      marginLeft: 'auto',
      marginRight: 'auto',
      lineHeight: '1.8',
      fontFamily: "'Poppins', sans-serif",
    },
    actions: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <FiMapPin size={56} style={{ color: '#43a047' }} />
      </div>
      <h3 style={styles.title}>
        {searchQuery ? 'No Matching Destinations' : 'No Destinations Yet'}
      </h3>
      <p style={styles.description}>
        {searchQuery
          ? `We couldn't find any destinations matching "${searchQuery}". Try adjusting your search or filters.`
          : `We're curating amazing experiences for ${country.name}. Check back soon for extraordinary adventures!`}
      </p>
      <div style={styles.actions}>
        {searchQuery && (
          <Button onClick={onClearFilters} variant="outline">
            Clear Filters
          </Button>
        )}
        <Button to="/destinations" variant="primary">
          Explore Other Destinations
        </Button>
      </div>
    </div>
  );
};

/**
 * Country Not Found Component
 */
const CountryNotFound = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at top left, #e8f5e9, #ffffff 60%)',
      textAlign: 'center',
    },
    iconWrapper: {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '48px',
      boxShadow: '0 30px 80px rgba(0, 128, 0, 0.15)',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '52px',
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: '20px',
    },
    description: {
      fontSize: '18px',
      color: '#5a7a5a',
      marginBottom: '48px',
      maxWidth: '520px',
      lineHeight: '1.8',
      fontFamily: "'Poppins', sans-serif",
    },
    actions: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 32px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '2px solid #e8f5e9',
      borderRadius: '50px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#1b5e20',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: "'Poppins', sans-serif",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <span style={{ fontSize: '72px' }}>🗺️</span>
      </div>
      <h1 style={styles.title}>Country Not Found</h1>
      <p style={styles.description}>
        The country you're looking for doesn't exist or may have been removed. 
        Let's get you back on track to explore amazing destinations.
      </p>
      <div style={styles.actions}>
        <button 
          style={styles.backButton}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0fdf4';
            e.currentTarget.style.borderColor = '#c8e6c9';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.borderColor = '#e8f5e9';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FiArrowLeft size={20} />
          Go Back
        </button>
        <Button to="/destinations" variant="primary" size="large">
          View All Destinations
        </Button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CountryDestinations = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  
  // Responsive
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  // Scroll
  const scrollPosition = useScrollPosition();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterType, setFilterType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favoriteDestinations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Data
  const country = countries.find(c => c.id === countryId);
  const allDestinations = useMemo(() => 
    country ? getDestinationsByCountry(countryId) : [], 
    [countryId, country]
  );

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [countryId]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('favoriteDestinations', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy('');
    setFilterType('');
    setPriceRange('');
  }, []);

  // Filter and sort
  const filteredDestinations = useMemo(() => {
    let result = [...allDestinations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        (d.highlights && d.highlights.some(h => h.toLowerCase().includes(query)))
      );
    }

    if (filterType) {
      result = result.filter(d => d.type === filterType);
    }

    if (priceRange) {
      const priceNum = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
      result = result.filter(d => {
        const price = priceNum(d.price);
        switch (priceRange) {
          case 'budget': return price < 500;
          case 'mid': return price >= 500 && price < 1500;
          case 'luxury': return price >= 1500;
          default: return true;
        }
      });
    }

    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
          case 'price-high':
            return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
          case 'rating':
            return b.rating - a.rating;
          case 'reviews':
            return b.reviews - a.reviews;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allDestinations, searchQuery, filterType, priceRange, sortBy]);

  // Filter options
  const destinationTypes = useMemo(() => {
    const types = [...new Set(allDestinations.map(d => d.type))];
    return types.map(t => ({ value: t, label: t }));
  }, [allDestinations]);

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'name', label: 'Name: A-Z' },
  ];

  const priceOptions = [
    { value: '', label: 'All Prices' },
    { value: 'budget', label: 'Budget (< $500)' },
    { value: 'mid', label: 'Mid-Range ($500-$1500)' },
    { value: 'luxury', label: 'Luxury ($1500+)' },
  ];

  // Stats
  const stats = useMemo(() => ({
    totalDestinations: allDestinations.length,
    averageRating: allDestinations.length > 0
      ? (allDestinations.reduce((sum, d) => sum + d.rating, 0) / allDestinations.length).toFixed(1)
      : '0',
    totalReviews: allDestinations.reduce((sum, d) => sum + (d.reviews || 0), 0),
    uniqueTypes: new Set(allDestinations.map(d => d.type)).size,
  }), [allDestinations]);

  // Active filters
  const activeFilters = [
    ...(filterType ? [{ key: 'type', label: filterType, clear: () => setFilterType('') }] : []),
    ...(priceRange ? [{ key: 'price', label: priceOptions.find(p => p.value === priceRange)?.label, clear: () => setPriceRange('') }] : []),
    ...(sortBy ? [{ key: 'sort', label: sortOptions.find(s => s.value === sortBy)?.label, clear: () => setSortBy('') }] : []),
  ];

  // Not found
  if (!country) {
    return <CountryNotFound />;
  }

  // Styles
  const styles = {
    page: {
      fontFamily: "'Poppins', sans-serif",
    },
    section: {
      padding: isMobile ? '48px 16px 100px' : '72px 24px 140px',
      background: 'radial-gradient(ellipse at top left, #e8f5e9, #ffffff 60%)',
      minHeight: '100vh',
    },
    container: {
      maxWidth: '1440px',
      margin: '0 auto',
    },
    intro: {
      textAlign: 'center',
      marginBottom: isMobile ? '48px' : '72px',
      maxWidth: '800px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    flagWrapper: {
      width: isMobile ? '100px' : '120px',
      height: isMobile ? '100px' : '120px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 28px',
      boxShadow: '0 20px 50px rgba(0, 128, 0, 0.15)',
      border: '4px solid white',
    },
    flag: {
      fontSize: isMobile ? '48px' : '56px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? '36px' : '48px',
      fontWeight: '700',
      color: '#1b5e20',
      marginBottom: '20px',
      lineHeight: 1.2,
    },
    description: {
      fontSize: isMobile ? '16px' : '18px',
      color: '#5a7a5a',
      lineHeight: '1.9',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? 'repeat(2, 1fr)' 
        : 'repeat(4, 1fr)',
      gap: isMobile ? '16px' : '28px',
      marginBottom: isMobile ? '48px' : '72px',
    },
    toolbar: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: '20px',
      marginBottom: '36px',
      padding: '24px 28px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 15px 50px rgba(0, 128, 0, 0.08)',
      border: '1px solid rgba(67, 160, 71, 0.1)',
    },
    filtersWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px',
      alignItems: 'center',
    },
    resultsInfo: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: '16px',
      marginBottom: '28px',
      padding: '0 8px',
    },
    resultsCount: {
      fontSize: '15px',
      color: '#5a7a5a',
      fontWeight: '500',
    },
    resultsStrong: {
      color: '#1b5e20',
      fontWeight: '700',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: viewMode === 'list' 
        ? '1fr'
        : isMobile 
          ? '1fr' 
          : isTablet 
            ? 'repeat(2, 1fr)' 
            : 'repeat(3, 1fr)',
      gap: isMobile ? '24px' : '36px',
    },
  };

  return (
    <div style={styles.page}>
      <GlobalStyles />

      {/* Page Header */}
      <PageHeader
        title={`${country.name} Destinations`}
        subtitle={`Explore the best places to visit in ${country.name}`}
        backgroundImage={country.heroImage}
        breadcrumbs={[
          { label: 'Destinations', path: '/destinations' },
          { label: country.name, path: `/country/${country.id}` },
          { label: 'All Destinations' },
        ]}
      />

      {/* Main Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          
          {/* Introduction */}
          <AnimatedSection animation="fadeInUp">
            <div style={styles.intro}>
              <div style={styles.flagWrapper}>
                <span style={styles.flag}>{country.flag}</span>
              </div>
              <h2 style={styles.title}>Discover {country.name}</h2>
              <p style={styles.description}>{country.description}</p>
            </div>
          </AnimatedSection>

          {/* Statistics */}
          {allDestinations.length > 0 && (
            <div style={styles.statsGrid}>
              <StatCard
                icon={FiMapPin}
                value={stats.totalDestinations}
                label="Destinations"
                delay={0}
              />
              <StatCard
                icon={FiStar}
                value={stats.averageRating}
                label="Avg. Rating"
                delay={0.1}
              />
              <StatCard
                icon={FiUsers}
                value={stats.totalReviews.toLocaleString()}
                label="Reviews"
                delay={0.2}
              />
              <StatCard
                icon={FiCompass}
                value={stats.uniqueTypes}
                label="Experience Types"
                delay={0.3}
              />
            </div>
          )}

          {/* Content */}
          {allDestinations.length > 0 && (
            <>
              {/* Toolbar */}
              <AnimatedSection animation="fadeInUp" delay={0.2}>
                <div style={styles.toolbar}>
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                  />

                  <div style={styles.filtersWrapper}>
                    {destinationTypes.length > 0 && (
                      <FilterDropdown
                        label="All Types"
                        options={[{ value: '', label: 'All Types' }, ...destinationTypes]}
                        value={filterType}
                        onChange={setFilterType}
                        icon={FiFilter}
                      />
                    )}

                    <FilterDropdown
                      label="Price Range"
                      options={priceOptions}
                      value={priceRange}
                      onChange={setPriceRange}
                      icon={FiDollarSign}
                    />

                    <FilterDropdown
                      label="Sort By"
                      options={sortOptions}
                      value={sortBy}
                      onChange={setSortBy}
                    />

                    {!isMobile && (
                      <ViewModeToggle
                        viewMode={viewMode}
                        onChange={setViewMode}
                      />
                    )}
                  </div>
                </div>
              </AnimatedSection>

              {/* Results Info & Filters */}
              <div style={styles.resultsInfo}>
                <span style={styles.resultsCount}>
                  Showing{' '}
                  <span style={styles.resultsStrong}>{filteredDestinations.length}</span>
                  {' '}of{' '}
                  <span style={styles.resultsStrong}>{allDestinations.length}</span>
                  {' '}destinations
                </span>
                
                <ActiveFilterTags
                  filters={activeFilters}
                  onRemove={(key) => {
                    const filter = activeFilters.find(f => f.key === key);
                    if (filter) filter.clear();
                  }}
                  onClearAll={clearFilters}
                />
              </div>

              {/* Destinations Grid */}
              {isLoading ? (
                <div style={styles.grid}>
                  {[...Array(6)].map((_, i) => (
                    <DestinationCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredDestinations.length > 0 ? (
                <div style={styles.grid}>
                  {filteredDestinations.map((destination, index) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      index={index}
                      viewMode={viewMode}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  country={country}
                  searchQuery={searchQuery || filterType || priceRange}
                  onClearFilters={clearFilters}
                />
              )}
            </>
          )}

          {/* No Destinations */}
          {allDestinations.length === 0 && !isLoading && (
            <EmptyState country={country} onClearFilters={clearFilters} />
          )}
        </div>
      </section>

      {/* Back to Top */}
      <BackToTopButton visible={scrollPosition > 500} />
    </div>
  );
};

export default CountryDestinations;