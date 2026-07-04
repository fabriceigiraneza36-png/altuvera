// components/ExperienceCard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
} from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';

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
};

/* ===================================================================
   HELPER FUNCTIONS
   =================================================================== */

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
      {images?.map((src, i) => (
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
      {images && images.length > 1 && (
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
      {images && images.length > 1 && (
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
          {images.map((_, i) => (
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
    </div>
  );
}

/* ===================================================================
   EXPERIENCE CARD COMPONENT
   =================================================================== */

/**
 * ExperienceCard Component
 * 
 * A beautifully designed card component for displaying travel experiences
 * with image slideshow, wishlist functionality, and detailed information.
 * 
 * @param {Object} props
 * @param {Object} props.experience - The experience data object
 * @param {string} props.experience.id - Unique identifier
 * @param {string} props.experience.title - Experience title
 * @param {string[]} props.experience.images - Array of image URLs
 * @param {string} props.experience.location - Location name
 * @param {string} props.experience.duration - Duration (e.g., "7 Days")
 * @param {string} props.experience.description - Description text
 * @param {number} props.experience.rating - Rating (0-5)
 * @param {number} props.experience.reviewCount - Number of reviews
 * @param {string[]} props.experience.highlights - Array of highlight tags
 * @param {string} props.experience.groupSize - Group size (e.g., "2-8")
 * @param {boolean} props.experience.featured - Whether this is featured
 * @param {string} [props.linkPrefix="/booking"] - Base path for the detail link
 * @param {Function} [props.onWishlistToggle] - Callback when wishlist is toggled
 * @param {boolean} [props.showBookButton=true] - Whether to show the book button
 */
function ExperienceCard({
  experience,
  linkPrefix = '/booking',
  onWishlistToggle,
  showBookButton = true,
}) {
  const [hovered, setHovered] = useState(false);
  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();
  
  const expKey = experience?._id || experience?.id || experience?.slug;
  const liked = isWishlisted(expKey);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(expKey);
    onWishlistToggle?.(expKey, !liked);
  };

  if (!experience) {
    return null;
  }

  const {
    id,
    title,
    images,
    location,
    duration,
    description,
    rating = 0,
    reviewCount = 0,
    highlights = [],
    groupSize,
    featured,
  } = experience;

  return (
    <article
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: COLORS.white.pure,
        boxShadow: hovered
          ? '0 24px 56px rgba(22,163,74,0.18)'
          : '0 4px 24px rgba(0,0,0,0.06)',
        transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-10px)' : 'none',
        border: `1px solid ${hovered ? COLORS.green[200] : COLORS.neutral[100]}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Section */}
      <div style={{ position: 'relative' }}>
        <ImageSlideshow images={images} height={280} />

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
          <div style={{ display: 'flex', gap: 6 }}>
            {featured && (
              <span
                style={{
                  padding: '5px 14px',
                  background: `linear-gradient(135deg, ${COLORS.green[600]}, ${COLORS.green[500]})`,
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.white.pure,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <FiAward size={11} /> Featured
              </span>
            )}
          </div>
          
          <button
            onClick={handleWishlistClick}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: liked
                ? COLORS.green[600]
                : 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              zIndex: 7,
            }}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart
              size={16}
              style={{
                color: COLORS.white.pure,
                fill: liked ? COLORS.white.pure : 'transparent',
              }}
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '24px 28px 28px' }}>
        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
          }}
        >
          <FiMapPin size={13} color={COLORS.green[600]} />
          <span
            style={{
              fontSize: 13,
              color: COLORS.green[700],
              fontWeight: 600,
            }}
          >
            {location}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.neutral[900],
            marginBottom: 10,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        {/* Description */}
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
          {description}
        </p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 18,
            }}
          >
            {highlights.map((highlight, i) => (
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
          </div>
        )}

        {/* Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {renderStars(rating)}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.green[700],
            }}
          >
            {rating}
          </span>
          <span style={{ fontSize: 13, color: COLORS.neutral[400] }}>
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Meta info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 18,
            borderTop: `1px solid ${COLORS.neutral[100]}`,
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
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
          </div>
        </div>

        {/* CTA Button */}
        {showBookButton && (
          <Link
            to={`${linkPrefix}?experience=${id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 20,
              padding: '14px 0',
              borderRadius: 16,
              backgroundColor: hovered ? COLORS.green[700] : COLORS.green[600],
              color: COLORS.white.pure,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 700,
              transition: 'background-color 0.3s',
            }}
          >
            View Details <FiArrowRight size={16} />
          </Link>
        )}
      </div>
    </article>
  );
}

/* ===================================================================
   PROP TYPES (Optional - for documentation)
   =================================================================== */

ExperienceCard.defaultProps = {
  linkPrefix: '/booking',
  showBookButton: true,
};

export default ExperienceCard;