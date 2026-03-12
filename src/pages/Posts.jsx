// src/pages/Posts.jsx

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiUser,
  FiBookmark,
  FiHeart,
  FiShare2,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiTag,
  FiMessageCircle,
  FiEye,
  FiArrowUp,
  FiBookOpen,
  FiCoffee,
  FiStar,
  FiExternalLink,
  FiMail,
  FiChevronDown,
  FiZap,
  FiCompass,
  FiFeather,
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";
import { posts } from '../data/posts';

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  :root {
    --ps-green-50: #ECFDF5;
    --ps-green-100: #D1FAE5;
    --ps-green-200: #A7F3D0;
    --ps-green-300: #6EE7B7;
    --ps-green-400: #34D399;
    --ps-green-500: #10B981;
    --ps-green-600: #059669;
    --ps-green-700: #047857;
    --ps-green-800: #065F46;
    --ps-green-900: #064E3B;
    --ps-white: #FFFFFF;
    --ps-off-white: #FAFDF7;
    --ps-gray-50: #F9FAFB;
    --ps-gray-100: #F3F4F6;
    --ps-gray-200: #E5E7EB;
    --ps-gray-300: #D1D5DB;
    --ps-gray-400: #9CA3AF;
    --ps-gray-500: #6B7280;
    --ps-gray-600: #4B5563;
    --ps-gray-700: #374151;
    --ps-gray-800: #1F2937;
    --ps-gray-900: #111827;
    --ps-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --ps-shadow-md: 0 4px 16px rgba(0,0,0,0.06);
    --ps-shadow-lg: 0 12px 40px rgba(0,0,0,0.1);
    --ps-shadow-xl: 0 25px 60px rgba(0,0,0,0.14);
    --ps-shadow-green: 0 8px 30px rgba(5,150,105,0.2);
    --ps-radius-sm: 8px;
    --ps-radius-md: 14px;
    --ps-radius-lg: 20px;
    --ps-radius-xl: 28px;
    --ps-radius-full: 9999px;
    --ps-transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.04); }
  }

  @keyframes bounceIn {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.05); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .ps-card-hover {
    transition: all 0.4s var(--ps-transition);
  }
  .ps-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(5,150,105,0.12);
  }

  .ps-focus-ring:focus-visible {
    outline: 2px solid var(--ps-green-600);
    outline-offset: 2px;
  }

  .ps-line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ps-line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ps-scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
  .ps-scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .ps-scrollbar-thin::-webkit-scrollbar {
    height: 4px;
  }
  .ps-scrollbar-thin::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.03);
    border-radius: 2px;
  }
  .ps-scrollbar-thin::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #059669, #34D399);
    border-radius: 2px;
  }

  .ps-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--ps-transition);
    box-shadow: var(--ps-shadow-green);
    position: relative;
    overflow: hidden;
  }
  .ps-btn-primary::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  .ps-btn-primary:hover::before {
    width: 300px;
    height: 300px;
  }
  .ps-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 40px rgba(5,150,105,0.35);
  }
  .ps-btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .ps-featured-card {
      grid-template-columns: 1fr !important;
    }
    .ps-featured-image {
      min-height: 300px !important;
      height: 300px !important;
    }
    .ps-featured-content {
      padding: 32px !important;
    }
    .ps-posts-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 768px) {
    .ps-filter-bar {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .ps-search-wrap {
      max-width: 100% !important;
    }
    .ps-category-scroll {
      width: 100% !important;
      overflow-x: auto !important;
    }
    .ps-posts-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .ps-featured-title {
      font-size: 24px !important;
    }
    .ps-section-title {
      font-size: 24px !important;
    }
    .ps-stats-bar {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .ps-newsletter {
      padding: 40px 24px !important;
    }
    .ps-reading-list {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .ps-featured-content {
      padding: 24px !important;
    }
    .ps-post-content {
      padding: 20px !important;
    }
    .ps-meta-row {
      flex-wrap: wrap !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════
   UTILITY HOOK
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setSize({ width: window.innerWidth }), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, []);

  return size;
};

/* ═══════════════════════════════════════════════════════
   READING TIME ESTIMATOR
   ═══════════════════════════════════════════════════════ */
const getReadingIcon = (readTime) => {
  const min = parseInt(readTime) || 5;
  if (min <= 3) return <FiZap size={12} />;
  if (min <= 7) return <FiCoffee size={12} />;
  return <FiBookOpen size={12} />;
};

/* ═══════════════════════════════════════════════════════
   PILL COMPONENT
   ═══════════════════════════════════════════════════════ */
const Pill = ({
  children,
  icon,
  active = false,
  onClick,
  variant = 'default',
  size = 'md',
  color,
}) => {
  const sizes = {
    sm: { padding: '4px 10px', fontSize: '11px', gap: '4px' },
    md: { padding: '8px 18px', fontSize: '13px', gap: '6px' },
    lg: { padding: '10px 22px', fontSize: '14px', gap: '8px' },
  };

  const variants = {
    default: {
      backgroundColor: active ? '#059669' : 'white',
      color: active ? 'white' : '#374151',
      border: active ? '2px solid #059669' : '2px solid #E5E7EB',
      boxShadow: active ? 'var(--ps-shadow-green)' : 'var(--ps-shadow-sm)',
    },
    green: {
      backgroundColor: '#ECFDF5',
      color: '#059669',
      border: '1px solid #D1FAE5',
    },
    solid: {
      background: 'linear-gradient(135deg, #059669, #047857)',
      color: 'white',
      border: 'none',
    },
    glass: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.15)',
    },
    custom: {
      backgroundColor: `${color}12`,
      color: color,
      border: `1px solid ${color}20`,
    },
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? 'ps-focus-ring' : ''}
      onKeyDown={(e) => {
        if (onClick && e.key === 'Enter') onClick();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ps-radius-full)',
        fontWeight: '600',
        letterSpacing: '0.3px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s var(--ps-transition)',
        whiteSpace: 'nowrap',
        textTransform: variant === 'green' ? 'uppercase' : 'none',
        ...sizes[size],
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
          if (variant === 'default') {
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.color = '#059669';
          }
        }
      }}
      onMouseOut={(e) => {
        if (onClick && !active) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          if (variant === 'default') {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#374151';
          }
        }
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════════ */
const shimmerBg = {
  background: 'linear-gradient(110deg, #e8f5e9 8%, #f1f8f2 18%, #e8f5e9 33%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease infinite',
};

const PostSkeleton = () => (
  <div
    style={{
      backgroundColor: 'white',
      borderRadius: 'var(--ps-radius-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--ps-shadow-sm)',
    }}
  >
    <div style={{ height: 220, ...shimmerBg }} />
    <div style={{ padding: 28 }}>
      <div style={{ width: 80, height: 24, borderRadius: 30, marginBottom: 16, ...shimmerBg }} />
      <div style={{ width: '90%', height: 22, borderRadius: 6, marginBottom: 10, ...shimmerBg }} />
      <div style={{ width: '70%', height: 22, borderRadius: 6, marginBottom: 16, ...shimmerBg }} />
      <div style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 6, ...shimmerBg }} />
      <div style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 20, ...shimmerBg }} />
      <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', ...shimmerBg }} />
        <div>
          <div style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 4, ...shimmerBg }} />
          <div style={{ width: 140, height: 12, borderRadius: 4, ...shimmerBg }} />
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   SHARE DROPDOWN
   ═══════════════════════════════════════════════════════ */
const ShareDropdown = ({ postTitle, onClose }) => (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      backgroundColor: 'white',
      borderRadius: 'var(--ps-radius-md)',
      padding: '12px',
      boxShadow: 'var(--ps-shadow-lg)',
      border: '1px solid var(--ps-gray-100)',
      zIndex: 50,
      minWidth: 180,
      animation: 'scaleIn 0.2s ease',
    }}
  >
    {['Twitter', 'Facebook', 'LinkedIn', 'Copy Link'].map((platform) => (
      <button
        key={platform}
        className="ps-focus-ring"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '10px 14px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          color: '#374151',
          borderRadius: 'var(--ps-radius-sm)',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#ECFDF5';
          e.currentTarget.style.color = '#059669';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#374151';
        }}
        onClick={() => {
          if (platform === 'Copy Link') {
            navigator.clipboard?.writeText(window.location.href);
          }
          onClose();
        }}
      >
        {platform}
      </button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════
   POST CARD COMPONENT
   ═══════════════════════════════════════════════════════ */
const PostCard = ({ post, index, onBookmark, isBookmarked, viewMode = 'grid' }) => {
  const [showShare, setShowShare] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (viewMode === 'list') {
    return (
      <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
        <div
          className="ps-card-hover"
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            backgroundColor: 'white',
            borderRadius: 'var(--ps-radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--ps-shadow-sm)',
            border: '1px solid #F3F4F6',
            animation: `slideUp 0.4s ease ${index * 0.05}s both`,
          }}
        >
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                minHeight: 200,
                objectFit: 'cover',
                transition: 'transform 0.6s var(--ps-transition)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
              }}
            >
              <Pill variant="green" size="sm" icon={<FiTag size={10} />}>
                {post.category}
              </Pill>
            </div>
          </div>

          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '10px',
                lineHeight: 1.35,
              }}
            >
              {post.title}
            </h3>
            <p
              className="ps-line-clamp-2"
              style={{
                fontSize: '15px',
                color: '#6B7280',
                lineHeight: 1.7,
                marginBottom: '16px',
              }}
            >
              {post.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={post.authorImage}
                  alt={post.author}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ECFDF5',
                  }}
                />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', display: 'block' }}>
                    {post.author}
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                    {post.date} · {post.readTime}
                  </span>
                </div>
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#059669',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Read More <FiArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <div
      style={{
        position: 'relative',
        animation: `slideUp 0.4s ease ${index * 0.06}s both`,
      }}
    >
      <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
        <div
          className="ps-card-hover"
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--ps-radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--ps-shadow-sm)',
            border: '1px solid #F3F4F6',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Image */}
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            {!imageLoaded && (
              <div style={{ height: 220, ...shimmerBg, position: 'absolute', inset: 0, zIndex: 1 }} />
            )}
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              style={{
                height: 220,
                width: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s var(--ps-transition)',
                display: 'block',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />

            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                pointerEvents: 'none',
              }}
            />

            {/* Category pill */}
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <Pill variant="green" size="sm" icon={<FiTag size={10} />}>
                {post.category}
              </Pill>
            </div>

            {/* Read time badge */}
            <div style={{ position: 'absolute', top: 14, right: 14 }}>
              <Pill variant="glass" size="sm" icon={getReadingIcon(post.readTime)}>
                {post.readTime}
              </Pill>
            </div>
          </div>

          {/* Content */}
          <div
            className="ps-post-content"
            style={{
              padding: '24px 24px 20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              className="ps-line-clamp-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '10px',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}
            >
              {post.title}
            </h3>

            <p
              className="ps-line-clamp-3"
              style={{
                fontSize: '14px',
                color: '#6B7280',
                lineHeight: 1.7,
                marginBottom: '18px',
                flex: 1,
              }}
            >
              {post.excerpt}
            </p>

            {/* Author + Meta */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #F3F4F6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={post.authorImage}
                  alt={post.author}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ECFDF5',
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {post.author}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiCalendar size={10} /> {post.date}
                  </div>
                </div>
              </div>

              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: '#059669',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Read <FiArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 85,
          right: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          zIndex: 5,
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked((p) => !p);
          }}
          className="ps-focus-ring"
          aria-label="Like"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            color: liked ? '#EF4444' : '#9CA3AF',
            boxShadow: 'var(--ps-shadow-sm)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FiHeart size={14} fill={liked ? '#EF4444' : 'none'} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmark?.(post.id);
          }}
          className="ps-focus-ring"
          aria-label="Bookmark"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            color: isBookmarked ? '#059669' : '#9CA3AF',
            boxShadow: 'var(--ps-shadow-sm)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FiBookmark size={14} fill={isBookmarked ? '#059669' : 'none'} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN POSTS COMPONENT
   ═══════════════════════════════════════════════════════ */
const Posts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const postsPerPage = 9;
  const categoryRef = useRef(null);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const categories = useMemo(() => [...new Set(posts.map((p) => p.category))], []);
  const featuredPosts = useMemo(() => posts.filter((p) => p.featured), []);

  // Filtered and sorted
  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Back to top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bookmark handler
  const toggleBookmark = useCallback((postId) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }, []);

  // Newsletter submit
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Stats
  const totalReadTime = useMemo(() => {
    return posts.reduce((sum, p) => sum + (parseInt(p.readTime) || 5), 0);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--ps-off-white)' }}>
      <style>{globalStyles}</style>

      <PageHeader
        title="Travel Journal"
        subtitle="Stories, guides, and inspiration from East Africa's most experienced travelers"
        backgroundImage="https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=1920"
        breadcrumbs={[{ label: 'Posts' }]}
      />

      <section
        style={{
          padding: isMobile ? '32px 16px 80px' : '60px 24px 120px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* ══════════ STATS BAR ══════════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            className="ps-stats-bar"
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '40px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: <FiFeather size={18} />, value: posts.length, label: 'Articles Published' },
              { icon: <FiUser size={18} />, value: new Set(posts.map((p) => p.author)).size, label: 'Authors' },
              { icon: <FiTag size={18} />, value: categories.length, label: 'Categories' },
              { icon: <FiClock size={18} />, value: `${totalReadTime} min`, label: 'Total Reading' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: '1 1 200px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px 22px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--ps-radius-lg)',
                  border: '1px solid #F3F4F6',
                  boxShadow: 'var(--ps-shadow-sm)',
                  transition: 'all 0.3s var(--ps-transition)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--ps-shadow-md)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ══════════ FILTER BAR ══════════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            className="ps-filter-bar"
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '40px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <div
              className="ps-search-wrap"
              style={{
                position: 'relative',
                flex: '1 1 320px',
                maxWidth: isMobile ? '100%' : '420px',
              }}
            >
              <FiSearch
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  transition: 'color 0.3s',
                }}
              />
              <input
                type="text"
                placeholder="Search articles, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-focus-ring"
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 48px',
                  borderRadius: 'var(--ps-radius-full)',
                  border: '2px solid #E5E7EB',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#374151',
                  outline: 'none',
                  transition: 'all 0.3s var(--ps-transition)',
                  boxShadow: 'var(--ps-shadow-sm)',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'var(--ps-shadow-sm)';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    padding: 4,
                    display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div
              ref={categoryRef}
              className="ps-category-scroll ps-scrollbar-hidden"
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'nowrap',
                overflowX: 'auto',
              }}
            >
              <Pill
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                size="md"
              >
                All Posts
              </Pill>
              {categories.map((cat) => (
                <Pill
                  key={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  size="md"
                >
                  {cat}
                </Pill>
              ))}
            </div>

            {/* Controls */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginLeft: isMobile ? 0 : 'auto',
              }}
            >
              {/* Sort */}
              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ps-focus-ring"
                  style={{
                    padding: '10px 36px 10px 14px',
                    borderRadius: 'var(--ps-radius-sm)',
                    border: '2px solid #E5E7EB',
                    backgroundColor: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#059669')}
                  onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular</option>
                </select>
                <FiChevronDown
                  size={14}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* View mode */}
              <div
                style={{
                  display: 'flex',
                  gap: 0,
                  padding: '4px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 'var(--ps-radius-sm)',
                }}
              >
                {[
                  { mode: 'grid', icon: <FiGrid size={16} /> },
                  { mode: 'list', icon: <FiList size={16} /> },
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="ps-focus-ring"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: viewMode === mode ? 'white' : 'transparent',
                      color: viewMode === mode ? '#059669' : '#9CA3AF',
                      boxShadow: viewMode === mode ? 'var(--ps-shadow-sm)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Search results info */}
        {searchQuery && (
          <div
            style={{
              marginBottom: '24px',
              padding: '12px 20px',
              backgroundColor: '#ECFDF5',
              borderRadius: 'var(--ps-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <FiSearch size={14} color="#059669" />
            <span style={{ fontSize: 14, color: '#065F46' }}>
              Found <strong>{filteredPosts.length}</strong> article
              {filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#059669',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* ══════════ FEATURED POST ══════════ */}
        {featuredPosts[0] && selectedCategory === 'all' && !searchQuery && (
          <AnimatedSection animation="fadeInUp">
            <div style={{ marginBottom: '56px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <FiStar size={20} />
                </div>
                <div>
                  <h2
                    className="ps-section-title"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#111827',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Featured Article
                  </h2>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
                    Editor's pick of the week
                  </p>
                </div>
              </div>

              <Link to={`/post/${featuredPosts[0].slug}`} style={{ textDecoration: 'none' }}>
                <div
                  className="ps-featured-card ps-card-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    backgroundColor: 'white',
                    borderRadius: 'var(--ps-radius-xl)',
                    overflow: 'hidden',
                    boxShadow: 'var(--ps-shadow-md)',
                    border: '1px solid #F3F4F6',
                    position: 'relative',
                  }}
                >
                  {/* Image */}
                  <div style={{ overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={featuredPosts[0].image}
                      alt={featuredPosts[0].title}
                      className="ps-featured-image"
                      style={{
                        height: '100%',
                        minHeight: '420px',
                        width: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s var(--ps-transition)',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(5,150,105,0.15), transparent)',
                        pointerEvents: 'none',
                      }}
                    />
                    {/* Featured badge */}
                    <div style={{ position: 'absolute', top: 20, left: 20 }}>
                      <Pill variant="solid" size="md" icon={<FiStar size={12} />}>
                        Featured
                      </Pill>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="ps-featured-content"
                    style={{
                      padding: '48px 44px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Pill variant="green" size="md" icon={<FiTag size={11} />}>
                      {featuredPosts[0].category}
                    </Pill>

                    <h3
                      className="ps-featured-title"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '30px',
                        fontWeight: '800',
                        color: '#111827',
                        marginTop: '20px',
                        marginBottom: '14px',
                        lineHeight: 1.25,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {featuredPosts[0].title}
                    </h3>

                    <p
                      style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        lineHeight: 1.75,
                        marginBottom: '24px',
                      }}
                    >
                      {featuredPosts[0].excerpt}
                    </p>

                    <div
                      className="ps-meta-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '28px',
                      }}
                    >
                      {[
                        { icon: <FiCalendar size={14} />, text: featuredPosts[0].date },
                        { icon: <FiClock size={14} />, text: featuredPosts[0].readTime },
                      ].map((item, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            color: '#9CA3AF',
                            fontWeight: 500,
                          }}
                        >
                          {item.icon} {item.text}
                        </span>
                      ))}
                    </div>

                    {/* Author */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '28px',
                        padding: '14px 18px',
                        backgroundColor: '#FAFDF7',
                        borderRadius: 'var(--ps-radius-md)',
                        border: '1px solid #F3F4F6',
                      }}
                    >
                      <img
                        src={featuredPosts[0].authorImage}
                        alt={featuredPosts[0].author}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #D1FAE5',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                          {featuredPosts[0].author}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Travel Writer</div>
                      </div>
                    </div>

                    <span
                      className="ps-btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 32px',
                        borderRadius: 'var(--ps-radius-full)',
                        fontSize: '15px',
                        width: 'fit-content',
                      }}
                    >
                      Read Full Article <FiArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ POSTS GRID / LIST ══════════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <h2
              className="ps-section-title"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: '800',
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              {selectedCategory === 'all' ? 'All Articles' : selectedCategory}
            </h2>
            <p style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                animation: 'fadeUp 0.4s ease',
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'float 3s ease infinite',
                }}
              >
                <FiSearch size={40} color="#059669" />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px',
                  color: '#111827',
                  marginBottom: '8px',
                }}
              >
                No Articles Found
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '24px', lineHeight: 1.6 }}>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="ps-btn-primary ps-focus-ring"
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--ps-radius-full)',
                  fontSize: '14px',
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {paginatedPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  viewMode="list"
                  onBookmark={toggleBookmark}
                  isBookmarked={bookmarks.has(post.id)}
                />
              ))}
            </div>
          ) : (
            <div
              className="ps-posts-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '28px',
              }}
            >
              {paginatedPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  viewMode="grid"
                  onBookmark={toggleBookmark}
                  isBookmarked={bookmarks.has(post.id)}
                />
              ))}
            </div>
          )}
        </AnimatedSection>

        {/* ══════════ PAGINATION ══════════ */}
        {totalPages > 1 && (
          <AnimatedSection animation="fadeInUp">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '48px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="ps-focus-ring"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--ps-radius-sm)',
                  border: '1px solid #E5E7EB',
                  backgroundColor: 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage === 1 ? '#D1D5DB' : '#374151',
                  transition: 'all 0.2s',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.color = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = currentPage === 1 ? '#D1D5DB' : '#374151';
                }}
              >
                <FiChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="ps-focus-ring"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--ps-radius-sm)',
                    border: page === currentPage ? '2px solid #059669' : '1px solid #E5E7EB',
                    backgroundColor: page === currentPage ? '#059669' : 'white',
                    color: page === currentPage ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: page === currentPage ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow:
                      page === currentPage
                        ? '0 4px 12px rgba(5,150,105,0.3)'
                        : 'none',
                  }}
                  onMouseOver={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.color = '#059669';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (page !== currentPage) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ps-focus-ring"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--ps-radius-sm)',
                  border: '1px solid #E5E7EB',
                  backgroundColor: 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentPage === totalPages ? '#D1D5DB' : '#374151',
                  transition: 'all 0.2s',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
                onMouseOver={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.color = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color =
                    currentPage === totalPages ? '#D1D5DB' : '#374151';
                }}
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* ══════════ NEWSLETTER CTA ══════════ */}
        <AnimatedSection animation="fadeInUp">
          <div
            className="ps-newsletter"
            style={{
              marginTop: '80px',
              padding: isMobile ? '40px 24px' : '56px 48px',
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)',
              borderRadius: 'var(--ps-radius-xl)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'rgba(52,211,153,0.08)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-60px',
                left: '-60px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'rgba(110,231,183,0.06)',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'float 3s ease infinite',
                }}
              >
                <FiMail size={28} color="#34D399" />
              </div>

              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: isMobile ? '24px' : '32px',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em',
                }}
              >
                Never Miss a Story
              </h3>

              <p
                style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'rgba(255,255,255,0.75)',
                  maxWidth: '480px',
                  margin: '0 auto 32px',
                  lineHeight: 1.7,
                }}
              >
                Get the latest travel stories, tips, and exclusive content delivered
                straight to your inbox every week.
              </p>

              <form
                onSubmit={handleSubscribe}
                style={{
                  display: 'flex',
                  gap: '12px',
                  maxWidth: '480px',
                  margin: '0 auto',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}
              >
                <EmailAutocompleteInput
                  value={emailInput}
                  onValueChange={setEmailInput}
                  placeholder="Enter your email address"
                  required
                  className="ps-focus-ring"
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: 'var(--ps-radius-full)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    backdropFilter: 'blur(8px)',
                    minWidth: isMobile ? '100%' : 'auto',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(52,211,153,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
                />
                <button
                  type="submit"
                  className="ps-focus-ring"
                  style={{
                    padding: '14px 28px',
                    borderRadius: 'var(--ps-radius-full)',
                    background: subscribed
                      ? 'linear-gradient(135deg, #34D399, #10B981)'
                      : 'linear-gradient(135deg, white, #F9FAFB)',
                    color: subscribed ? 'white' : '#065F46',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    minWidth: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => {
                    if (!subscribed) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                  }}
                >
                  {subscribed ? (
                    <>
                      <FiStar size={16} /> Subscribed!
                    </>
                  ) : (
                    <>
                      <FiMail size={16} /> Subscribe
                    </>
                  )}
                </button>
              </form>

              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: 16,
                }}
              >
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ══════════ BACK TO TOP ══════════ */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="ps-btn-primary ps-focus-ring"
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            animation: 'bounceIn 0.4s ease',
            padding: 0,
          }}
        >
          <FiArrowUp size={22} />
        </button>
      )}
    </div>
  );
};

export default Posts;
