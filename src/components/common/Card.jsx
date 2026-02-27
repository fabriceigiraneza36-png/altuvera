import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiClock, FiArrowRight, FiHeart } from 'react-icons/fi';

const Card = ({ 
  image, 
  title, 
  subtitle, 
  description, 
  location, 
  rating,
  reviews,
  duration,
  price,
  type,
  to,
  badge,
  featured = false,
  horizontal = false,
  onFavoriteClick,
  isFavorite = false,
  className = '',
}) => {
  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      height: '100%',
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      position: 'relative',
      textDecoration: 'none',
    },
    horizontalCard: {
      minHeight: '220px',
    },
    imageContainer: {
      position: 'relative',
      height: horizontal ? '100%' : '240px',
      width: horizontal ? '350px' : '100%',
      overflow: 'hidden',
      flexShrink: 0,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    badge: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      padding: '8px 16px',
      backgroundColor: '#059669',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '30px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      zIndex: 2,
    },
    featuredBadge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      zIndex: 2,
    },
    favoriteButton: {
      position: 'absolute',
      top: '16px',
      right: featured ? '110px' : '16px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      zIndex: 2,
    },
    content: {
      padding: '24px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    type: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#059669',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: horizontal ? '24px' : '22px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '8px',
      lineHeight: '1.3',
      transition: 'color 0.3s ease',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '12px',
    },
    description: {
      fontSize: '14px',
      color: '#4B5563',
      lineHeight: '1.7',
      marginBottom: '16px',
      flex: 1,
      display: '-webkit-box',
      WebkitLineClamp: horizontal ? 3 : 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '16px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: '#6B7280',
    },
    metaIcon: {
      color: '#059669',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #E5E7EB',
      marginTop: 'auto',
    },
    price: {
      fontSize: '14px',
      color: '#6B7280',
    },
    priceValue: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#059669',
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#059669',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
    },
    altuvераPattern: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.4s ease',
    },
  };

  const handleMouseOver = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'translateY(-8px)';
    card.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.15)';
    
    const img = card.querySelector('.card-image');
    if (img) img.style.transform = 'scale(1.1)';
    
    const overlay = card.querySelector('.card-overlay');
    if (overlay) overlay.style.opacity = '1';
    
    const pattern = card.querySelector('.altuvera-pattern');
    if (pattern) pattern.style.transform = 'scaleX(1)';
    
    const title = card.querySelector('.card-title');
    if (title) title.style.color = '#059669';
  };

  const handleMouseOut = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    
    const img = card.querySelector('.card-image');
    if (img) img.style.transform = 'scale(1)';
    
    const overlay = card.querySelector('.card-overlay');
    if (overlay) overlay.style.opacity = '0';
    
    const pattern = card.querySelector('.altuvera-pattern');
    if (pattern) pattern.style.transform = 'scaleX(0)';
    
    const title = card.querySelector('.card-title');
    if (title) title.style.color = '#1a1a1a';
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteClick) {
      onFavoriteClick();
    }
  };

  const CardWrapper = to ? Link : 'div';

  return (
    <CardWrapper
      to={to}
      style={{ 
        ...styles.card, 
        ...(horizontal ? styles.horizontalCard : {}),
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div style={styles.imageContainer}>
        <img 
          src={image} 
          alt={title} 
          style={styles.image} 
          className="card-image"
          loading="lazy"
        />
        <div style={styles.imageOverlay} className="card-overlay"></div>
        {badge && <span style={styles.badge}>{badge}</span>}
        {featured && (
          <span style={styles.featuredBadge}>
            <FiStar size={12} /> Featured
          </span>
        )}
        {onFavoriteClick && (
          <button
            style={{
              ...styles.favoriteButton,
              backgroundColor: isFavorite ? '#059669' : 'rgba(255, 255, 255, 0.9)',
              color: isFavorite ? 'white' : '#1a1a1a',
            }}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart size={18} style={{ fill: isFavorite ? 'white' : 'none' }} />
          </button>
        )}
      </div>
      <div style={styles.content}>
        {type && <span style={styles.type}>{type}</span>}
        <h3 style={styles.title} className="card-title">{title}</h3>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        {description && <p style={styles.description}>{description}</p>}
        <div style={styles.meta}>
          {location && (
            <span style={styles.metaItem}>
              <FiMapPin size={14} style={styles.metaIcon} />
              {location}
            </span>
          )}
          {rating && (
            <span style={styles.metaItem}>
              <FiStar size={14} style={{ ...styles.metaIcon, fill: '#059669' }} />
              {rating} {reviews && `(${reviews})`}
            </span>
          )}
          {duration && (
            <span style={styles.metaItem}>
              <FiClock size={14} style={styles.metaIcon} />
              {duration}
            </span>
          )}
        </div>
        <div style={styles.footer}>
          {price && (
            <div style={styles.price}>
              From <span style={styles.priceValue}>{price}</span>
            </div>
          )}
          <span style={styles.link}>
            Explore <FiArrowRight size={16} />
          </span>
        </div>
      </div>
      <div style={styles.altuvераPattern} className="altuvera-pattern"></div>
    </CardWrapper>
  );
};

export default Card;