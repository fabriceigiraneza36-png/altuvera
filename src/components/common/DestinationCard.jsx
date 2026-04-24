// components/DestinationCard.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiClock,
  FiStar,
  FiHeart,
  FiUsers,
  FiAward,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiGlobe,
  FiCalendar,
  FiCamera,
  FiEye,
  FiBookmark,
  FiShare2,
  FiThumbsUp,
} from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import { FALLBACK_IMAGE } from '../../utils/destinationAdapter';

/* ===================================================================
   DESIGN TOKENS
   =================================================================== */

const COLORS = {
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  white: {
    pure: '#FFFFFF',
  },
  neutral: {
    900: '#0F1B0F',
    800: '#1A2E1A',
    700: '#2D452D',
    600: '#3F5C3F',
    500: '#5A7A5A',
    400: '#7A9E7A',
    300: '#A8C5A8',
    200: '#D0E3D0',
    100: '#E8F0E8',
    50: '#F4F8F4',
  },
  amber: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
  },
  rose: {
    light: '#FFE4E6',
    main: '#F43F5E',
    dark: '#E11D48',
  },
  blue: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },
  purple: {
    light: '#EDE9FE',
    main: '#8B5CF6',
    dark: '#5B21B6',
  },
};

/* ===================================================================
   STYLES
   =================================================================== */

const styles = `
  .destination-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .destination-card:hover {
    transform: translateY(-8px) scale(1.02);
  }

  .destination-card.priority {
    border: 2px solid #8B5CF6;
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);
  }

  .shine {
    left: 100% !important;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 0; }
    100% { transform: scale(0.8); opacity: 0; }
  }

  @media (max-width: 768px) {
    .destination-card:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      size={13}
      style={{
        fill: i < Math.floor(rating) ? COLORS.green[500] : 'transparent',
        color: i < Math.floor(rating) ? COLORS.green[500] : COLORS.neutral[300],
      }}
    />
  ));

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const calculateDiscount = (original, current) => {
  return Math.round(((original - current) / original) * 100);
};

const isCountryLike = (item) =>
  Boolean(
    item?.capital &&
      (item?.officialName || item?.continent || item?.region || item?.subRegion)
  );

const getDetailsHref = (item) => {
  const rawId = item?._id || item?.id || item?.slug;
  if (!rawId) return '/destinations';
  if (isCountryLike(item)) return `/country/${item?.id || item?.slug || rawId}`;
  return `/destination/${item?.slug || rawId}`;
};

/* ===================================================================
   SLIDESHOW HOOK
   =================================================================== */

function useSlideshow(images, interval = 4500) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images, interval]);

  const goNext = useCallback(() => {
    if (!images) return;
    setIdx((prev) => (prev + 1) % images.length);
  }, [images]);

  const goPrev = useCallback(() => {
    if (!images) return;
    setIdx((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  return { idx, goNext, goPrev };
}

/* ===================================================================
   IMAGE SLIDESHOW COMPONENT
   =================================================================== */

function ImageSlideshow({ images, height = 280 }) {
  const { idx, goNext, goPrev } = useSlideshow(images, 5000);
  const [hovered, setHovered] = useState(false);

  const safeImages = images?.filter(Boolean)?.length > 0 
    ? images.filter(Boolean) 
    : [FALLBACK_IMAGE];

  return (
    <div
      style={{
        position: 'relative',
        height,
        overflow: 'hidden',
        backgroundColor: COLORS.green[900],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {safeImages.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? 'scale(1)' : 'scale(1.06)',
            transition: 'opacity 1s ease, transform 6s ease',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Navigation arrows */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: COLORS.white.pure,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 5,
            }}
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: COLORS.white.pure,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 5,
            }}
          >
            <FiChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {safeImages.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            zIndex: 5,
          }}
        >
          {safeImages.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === idx ? COLORS.green[400] : 'rgba(255,255,255,0.4)',
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {safeImages.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 8,
            zIndex: 5,
          }}
        >
          <FiCamera size={12} color="rgba(255, 255, 255, 0.8)" />
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>
            {idx + 1}/{safeImages.length}
          </span>
        </div>
      )}
    </div>
  );
}

/* ===================================================================
   BADGE COMPONENT
   =================================================================== */

const Badge = memo(({ children, variant = 'default', icon: Icon }) => {
  const variants = {
    default: {
      bg: 'rgba(255, 255, 255, 0.95)',
      color: COLORS.neutral[700],
      border: '1px solid rgba(0, 0, 0, 0.08)',
    },
    featured: {
      bg: `linear-gradient(135deg, ${COLORS.amber.main}, #FBBF24)`,
      color: '#fff',
      border: 'none',
    },
    new: {
      bg: `linear-gradient(135deg, ${COLORS.green[600]}, ${COLORS.green[500]})`,
      color: '#fff',
      border: 'none',
    },
    popular: {
      bg: `linear-gradient(135deg, ${COLORS.rose.main}, #FB7185)`,
      color: '#fff',
      border: 'none',
    },
  };

  const v = variants[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 14px',
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: 30,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backdropFilter: variant === 'default' ? 'blur(12px)' : 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
});

/* ===================================================================
   PRICE DISPLAY COMPONENT
   =================================================================== */

const PriceDisplay = memo(({ price, originalPrice, currency = 'USD', period = 'person' }) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? calculateDiscount(originalPrice, price) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.neutral[900],
            letterSpacing: '-0.02em',
          }}
        >
          {formatPrice(price, currency)}
        </span>
        <span style={{ fontSize: 12, color: COLORS.neutral[500] }}>/ {period}</span>
      </div>
      {hasDiscount && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 14,
              color: COLORS.neutral[400],
              textDecoration: 'line-through',
            }}
          >
            {formatPrice(originalPrice, currency)}
          </span>
          <Badge variant="popular">
            {discount}% OFF
          </Badge>
        </div>
      )}
    </div>
  );
});

/* ===================================================================
   DESTINATION CARD COMPONENT
   =================================================================== */

/**
 * DestinationCard Component
 * 
 * A professionally designed card for displaying travel destinations
 * with image slideshow, wishlist functionality, and detailed information.
 * 
 * @param {Object} props
 * @param {Object} props.destination - The destination data object
 * @param {string} props.destination.id - Unique identifier
 * @param {string} props.destination.name - Destination name
 * @param {string[]} props.destination.images - Array of image URLs
 * @param {string} props.destination.location - Location name
 * @param {string} props.destination.duration - Duration (e.g., "7 Days")
 * @param {string} props.destination.description - Description text
 * @param {number} props.destination.rating - Rating (0-5)
 * @param {number} props.destination.reviewCount - Number of reviews
 * @param {string[]} props.destination.highlights - Array of highlight tags
 * @param {string} props.destination.groupSize - Group size (e.g., "2-8")
 * @param {number} props.destination.price - Price
 * @param {number} props.destination.originalPrice - Original price (for discounts)
 * @param {boolean} props.destination.isFeatured - Whether featured
 * @param {boolean} props.destination.isNew - Whether new
 * @param {boolean} props.destination.isPopular - Whether popular
 * @param {Function} [props.onWishlistToggle] - Callback when wishlist is toggled
 * @param {boolean} [props.showBookButton=true] - Whether to show the book button
 * @param {boolean} [props.compact=false] - Compact mode
 */
function DestinationCard({
  destination,
  onWishlistToggle,
  showBookButton = true,
  compact = false,
  user,
  isMobile = false,
  priority = false,
}) {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef(null);
  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();

  const destKey = destination?._id || destination?.id || destination?.slug;
  const liked = isWishlisted(destKey);

  // User personalization
  const isRecommended = user && destination?.recommendedFor?.includes(user?.id);
  const hasUserRating = user && destination?.userRatings?.[user?.id];
  const userRating = hasUserRating ? destination.userRatings[user.id] : 0;

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(destKey);
    onWishlistToggle?.(destKey, !liked);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleShareOption = (platform) => {
    const url = window.location.origin + getDetailsHref(destination);
    const text = `Check out ${destination?.name} - ${destination?.description?.slice(0, 100)}...`;

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  if (!destination) {
    return null;
  }

  const {
    name,
    images,
    heroImage,
    location,
    country,
    capital,
    region,
    subRegion,
    duration,
    description,
    shortDescription,
    rating = 0,
    reviewCount = 0,
    reviews,
    highlights = [],
    groupSize,
    price,
    originalPrice,
    startingPrice,
    isFeatured,
    isNew,
    isPopular,
    type,
    category,
    difficulty,
    views = 0,
    likes = 0,
  } = destination;

  // Determine values
  const isCountry = isCountryLike(destination);
  const detailsHref = getDetailsHref(destination);
  const locationLabel = location || country || capital || region || subRegion || 'East Africa';
  const safeImages = images?.filter(Boolean) || (heroImage ? [heroImage] : []);
  const ratingValue = Number(rating);
  const reviewsCount = reviewCount || reviews || 0;
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const numericPrice = Number(price ?? startingPrice);
  const hasPrice = Number.isFinite(numericPrice) && numericPrice > 0;

  return (
    <article
      ref={cardRef}
      className={`destination-card ${compact ? 'compact' : ''} ${priority ? 'priority' : ''}`}
      style={{
        position: 'relative',
        borderRadius: compact ? 20 : 24,
        overflow: 'hidden',
        backgroundColor: COLORS.white.pure,
        boxShadow: hovered
          ? `0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(34, 197, 94, 0.1)`
          : `0 8px 24px -8px rgba(0,0,0,0.08)`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: hovered ? `2px solid ${COLORS.green[200]}` : `1px solid ${COLORS.neutral[100]}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Priority/Recommendation Badge */}
      {isRecommended && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
            background: `linear-gradient(135deg, ${COLORS.purple.main}, ${COLORS.purple.dark})`,
            color: COLORS.white.pure,
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <FiThumbsUp size={12} />
          Recommended for You
        </div>
      )}

      {/* Status Badges */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {isNew && (
          <Badge variant="new" size="small">
            NEW
          </Badge>
        )}
        {isPopular && (
          <Badge variant="popular" size="small">
            POPULAR
          </Badge>
        )}
        {isFeatured && (
          <Badge variant="featured" size="small">
            FEATURED
          </Badge>
        )}
      </div>
      {/* Image Section */}
      <div style={{ position: 'relative' }}>
        <ImageSlideshow images={safeImages} height={compact ? 200 : 280} />

        {/* Top badges and wishlist */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 6,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '70%' }}>
            {isFeatured && (
              <Badge variant="featured" icon={FiAward}>
                Featured
              </Badge>
            )}
            {isNew && (
              <Badge variant="new">
                New
              </Badge>
            )}
            {isPopular && (
              <Badge variant="popular" icon={FiTrendingUp}>
                Popular
              </Badge>
            )}
            {!isFeatured && !isNew && !isPopular && (
              <Badge>
                {isCountry
                  ? region || subRegion || 'Country'
                  : type || category || 'Destination'}
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Share Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleShareClick}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 7,
                }}
                aria-label="Share destination"
              >
                <FiShare2 size={14} color={COLORS.white.pure} />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    backgroundColor: COLORS.white.pure,
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    padding: 8,
                    minWidth: 140,
                    zIndex: 20,
                  }}
                >
                  {[
                    { icon: '📱', label: 'WhatsApp', action: 'whatsapp' },
                    { icon: '📘', label: 'Facebook', action: 'facebook' },
                    { icon: '🐦', label: 'Twitter', action: 'twitter' },
                    { icon: '📋', label: 'Copy Link', action: 'copy' },
                  ].map((option) => (
                    <button
                      key={option.action}
                      onClick={() => handleShareOption(option.action)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        color: COLORS.neutral[700],
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = COLORS.neutral[50];
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Wishlist Button */}
            <button
              onClick={handleWishlistClick}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: liked
                  ? COLORS.rose.main
                  : 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 7,
                transform: liked ? 'scale(1.1)' : 'scale(1)',
                boxShadow: liked ? `0 0 0 4px rgba(244, 63, 94, 0.2)` : 'none',
              }}
              aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart
                size={16}
                style={{
                  color: COLORS.white.pure,
                  fill: liked ? COLORS.white.pure : 'transparent',
                  transition: 'all 0.3s',
                }}
              />
            </button>
          </div>
        </div>

        {/* Location pill with country info */}
        <Link
          to={`/country/${destination.countrySlug}`}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: 30,
            zIndex: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          <FiMapPin size={14} color={COLORS.green[600]} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.neutral[700],
            }}
          >
            {destination.countryFlag && `${destination.countryFlag} `}{locationLabel}
          </span>
        </Link>
      </div>

      {/* Content Section */}
      <div style={{ padding: compact ? '20px' : '24px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title and Rating */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <Link to={detailsHref} style={{ textDecoration: 'none', flex: 1 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: compact ? 20 : isMobile ? 20 : 22,
                fontWeight: 700,
                color: hovered ? COLORS.green[700] : COLORS.neutral[900],
                marginBottom: 0,
                lineHeight: 1.3,
                transition: 'color 0.3s',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {name}
            </h3>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {hasRating && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', gap: 2 }}>
                  {renderStars(ratingValue)}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.green[700],
                  }}
                >
                  {ratingValue.toFixed(1)}
                </span>
              </div>
            )}

            {/* User Personal Rating */}
            {hasUserRating && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: COLORS.blue[50],
                  padding: '2px 6px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.blue[700],
                }}
              >
                <FiStar size={10} style={{ fill: COLORS.blue[500], color: COLORS.blue[500] }} />
                Your rating: {userRating}
              </div>
            )}

            {/* Views and Likes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                color: COLORS.neutral[500],
              }}
            >
              {views > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiEye size={10} />
                  {formatNumber(views)}
                </span>
              )}
              {likes > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiHeart size={10} style={{ fill: COLORS.rose[400], color: COLORS.rose[400] }} />
                  {formatNumber(likes)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Review Count */}
        {hasRating && reviewsCount > 0 && (
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.neutral[400] }}>
              ({formatNumber(reviewsCount)} reviews)
            </span>
          </div>
        )}

        {/* Description */}
        {!compact && (
          <p
            style={{
              fontSize: 14,
              color: COLORS.neutral[500],
              lineHeight: 1.7,
              marginBottom: 16,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {shortDescription || description || 'Experience the breathtaking beauty and unforgettable adventures of this stunning destination.'}
          </p>
        )}

        {/* Highlights */}
        {highlights.length > 0 && !compact && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 18,
            }}
          >
            {highlights.slice(0, 3).map((highlight, i) => (
              <span
                key={i}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  backgroundColor: COLORS.green[50],
                  color: COLORS.green[800],
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${COLORS.green[200]}`,
                }}
              >
                {highlight}
              </span>
            ))}
            {highlights.length > 3 && (
              <span
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  color: COLORS.green[600],
                  fontWeight: 600,
                }}
              >
                +{highlights.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 18,
            borderTop: `1px solid ${COLORS.neutral[100]}`,
            marginTop: 'auto',
            marginBottom: hasPrice ? 18 : 0,
          }}
        >
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {duration && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: COLORS.neutral[500],
                  fontWeight: 500,
                }}
              >
                <FiClock size={13} color={COLORS.green[600]} />
                {duration}
              </span>
            )}
            {groupSize && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: COLORS.neutral[500],
                  fontWeight: 500,
                }}
              >
                <FiUsers size={13} color={COLORS.green[600]} />
                {groupSize}
              </span>
            )}
            {difficulty && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  color: COLORS.neutral[500],
                  fontWeight: 500,
                }}
              >
                <FiGlobe size={13} color={COLORS.green[600]} />
                {difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Price and CTA */}
        {hasPrice && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <PriceDisplay
              price={numericPrice}
              originalPrice={originalPrice}
            />
          </div>
        )}

        {/* Enhanced CTA Button */}
        {showBookButton && (
          <div style={{ marginTop: 20 }}>
            <Link
              to={detailsHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '16px 24px',
                borderRadius: 16,
                background: hovered
                  ? `linear-gradient(135deg, ${COLORS.green[700]}, ${COLORS.green[600]})`
                  : `linear-gradient(135deg, ${COLORS.green[600]}, ${COLORS.green[500]})`,
                color: COLORS.white.pure,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 700,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hovered
                  ? `0 8px 24px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.2)`
                  : `0 4px 16px rgba(34, 197, 94, 0.2)`,
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Button shine effect */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                }}
                className={hovered ? 'shine' : ''}
              />

              <span style={{ position: 'relative', zIndex: 1 }}>
                {isCountry ? 'Explore Country' : 'View Details'}
              </span>
              <FiArrowRight
                size={16}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.3s',
                  transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                }}
              />
            </Link>

            {/* Quick Actions */}
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 12,
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistClick(e);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: `1px solid ${liked ? COLORS.rose[300] : COLORS.neutral[300]}`,
                    backgroundColor: liked ? COLORS.rose[50] : COLORS.white.pure,
                    color: liked ? COLORS.rose[700] : COLORS.neutral[700],
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <FiHeart size={14} style={{ fill: liked ? COLORS.rose[500] : 'transparent', color: liked ? COLORS.rose[500] : COLORS.neutral[500] }} />
                  {liked ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareClick(e);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: `1px solid ${COLORS.neutral[300]}`,
                    backgroundColor: COLORS.white.pure,
                    color: COLORS.neutral[700],
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <FiShare2 size={14} />
                  Share
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Hover Effects */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${COLORS.green[500]}, ${COLORS.green[400]}, ${COLORS.blue[500]})`,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '0 0 24px 24px',
        }}
      />

      {/* Subtle glow effect */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 26,
            background: `linear-gradient(135deg, ${COLORS.green[200]}, ${COLORS.blue[200]}, ${COLORS.purple[200]})`,
            opacity: 0.1,
            zIndex: -1,
            animation: 'pulse-ring 2s infinite',
          }}
        />
      )}
    </article>
  );
}

/* ===================================================================
   EXPORT VARIANTS
   =================================================================== */

// Compact variant
export const CompactDestinationCard = (props) => (
  <DestinationCard {...props} compact />
);

// Grid component
export const DestinationCardGrid = memo(({ destinations = [], columns = 3, gap = '24px' }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${100 / columns}%, 1fr))`,
    gap,
    }}
  >
    {destinations.map((destination, index) => (
      <DestinationCard
        key={destination._id || destination.id || index}
        destination={destination}
      />
    ))}
  </div>
));

export default memo(DestinationCard);