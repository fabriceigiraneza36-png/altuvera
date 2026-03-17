// src/pages/PostDetail.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowLeft,
  FiShare2,
  FiHeart,
  FiTwitter,
  FiFacebook,
  FiBookmark,
  FiMessageCircle,
  FiArrowUp,
  FiCopy,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiEye,
  FiStar,
  FiLinkedin,
  FiMail,
  FiExternalLink,
  FiArrowRight,
  FiFeather,
  FiList,
  FiHash,
  FiX,
  FiSend,
  FiCornerUpLeft,
  FiThumbsUp,
  FiMoreHorizontal,
  FiPrinter,
  FiZap,
  FiCoffee,
  FiBookOpen,
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { posts } from '../data/posts';
import { getBrandLogoUrl, toAbsoluteUrl, toMetaDescription } from '../utils/seo';

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --pd-green-50: #ECFDF5;
    --pd-green-100: #D1FAE5;
    --pd-green-200: #A7F3D0;
    --pd-green-300: #6EE7B7;
    --pd-green-400: #34D399;
    --pd-green-500: #10B981;
    --pd-green-600: #059669;
    --pd-green-700: #047857;
    --pd-green-800: #065F46;
    --pd-green-900: #064E3B;
    --pd-white: #FFFFFF;
    --pd-off-white: #FAFDF7;
    --pd-cream: #FEFDFB;
    --pd-gray-50: #F9FAFB;
    --pd-gray-100: #F3F4F6;
    --pd-gray-200: #E5E7EB;
    --pd-gray-300: #D1D5DB;
    --pd-gray-400: #9CA3AF;
    --pd-gray-500: #6B7280;
    --pd-gray-600: #4B5563;
    --pd-gray-700: #374151;
    --pd-gray-800: #1F2937;
    --pd-gray-900: #111827;
    --pd-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --pd-shadow-md: 0 4px 16px rgba(0,0,0,0.06);
    --pd-shadow-lg: 0 12px 40px rgba(0,0,0,0.1);
    --pd-shadow-xl: 0 25px 60px rgba(0,0,0,0.14);
    --pd-shadow-green: 0 8px 30px rgba(5,150,105,0.2);
    --pd-radius-sm: 8px;
    --pd-radius-md: 14px;
    --pd-radius-lg: 20px;
    --pd-radius-xl: 28px;
    --pd-radius-2xl: 36px;
    --pd-radius-full: 9999px;
    --pd-transition: cubic-bezier(0.4, 0, 0.2, 1);
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

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes bounceIn {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.05); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.04); }
  }

  @keyframes heartBeat {
    0%   { transform: scale(1); }
    14%  { transform: scale(1.3); }
    28%  { transform: scale(1); }
    42%  { transform: scale(1.3); }
    70%  { transform: scale(1); }
  }

  @keyframes progressFill {
    from { width: 0%; }
  }

  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }

  /* Focus ring */
  .pd-focus:focus-visible {
    outline: 2px solid var(--pd-green-600);
    outline-offset: 2px;
  }

  /* Button primary */
  .pd-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s var(--pd-transition);
    box-shadow: var(--pd-shadow-green);
    position: relative;
    overflow: hidden;
  }
  .pd-btn-primary::before {
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
  .pd-btn-primary:hover::before {
    width: 300px;
    height: 300px;
  }
  .pd-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 12px 40px rgba(5,150,105,0.35);
  }
  .pd-btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  /* Card hover */
  .pd-card-hover {
    transition: all 0.4s var(--pd-transition);
  }
  .pd-card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(5,150,105,0.12);
  }

  /* Typography */
  .pd-article-content {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    line-height: 1.9;
    color: var(--pd-gray-700);
    letter-spacing: -0.01em;
  }

  .pd-article-content p {
    margin-bottom: 1.8em;
  }

  .pd-article-content h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--pd-gray-900);
    margin-top: 2.4em;
    margin-bottom: 0.8em;
    letter-spacing: -0.02em;
    line-height: 1.3;
    position: relative;
    padding-left: 20px;
  }

  .pd-article-content h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 4px;
    background: linear-gradient(180deg, #059669, #34D399);
    border-radius: 2px;
  }

  .pd-article-content h3 {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--pd-gray-800);
    margin-top: 2em;
    margin-bottom: 0.6em;
    letter-spacing: -0.01em;
  }

  .pd-article-content blockquote {
    position: relative;
    margin: 2em 0;
    padding: 24px 28px 24px 32px;
    background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
    border-radius: var(--pd-radius-lg);
    border-left: 4px solid #059669;
    font-style: italic;
    font-size: 19px;
    color: #065F46;
    line-height: 1.7;
  }

  .pd-article-content blockquote::before {
    content: '"';
    position: absolute;
    top: -8px;
    left: 16px;
    font-family: 'Playfair Display', serif;
    font-size: 60px;
    color: #059669;
    opacity: 0.3;
    line-height: 1;
  }

  .pd-article-content ul, .pd-article-content ol {
    margin: 1.5em 0;
    padding-left: 24px;
  }

  .pd-article-content li {
    margin-bottom: 0.6em;
    padding-left: 8px;
  }

  .pd-article-content li::marker {
    color: #059669;
    font-weight: 700;
  }

  .pd-article-content a {
    color: #059669;
    text-decoration: none;
    border-bottom: 2px solid rgba(5,150,105,0.2);
    transition: border-color 0.2s;
    font-weight: 500;
  }

  .pd-article-content a:hover {
    border-bottom-color: #059669;
  }

  .pd-article-content img {
    width: 100%;
    border-radius: var(--pd-radius-lg);
    margin: 2em 0;
    box-shadow: var(--pd-shadow-md);
  }

  .pd-article-content code {
    font-family: 'JetBrains Mono', monospace;
    background: #F3F4F6;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.88em;
    color: #065F46;
  }

  .pd-article-content hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
    margin: 3em 0;
  }

  /* First letter drop cap */
  .pd-article-content .pd-drop-cap::first-letter {
    float: left;
    font-family: 'Playfair Display', serif;
    font-size: 4em;
    line-height: 0.8;
    margin-right: 12px;
    margin-top: 6px;
    color: #059669;
    font-weight: 700;
  }

  /* Scrollbar */
  .pd-scrollbar-thin::-webkit-scrollbar { height: 4px; width: 4px; }
  .pd-scrollbar-thin::-webkit-scrollbar-track { background: rgba(0,0,0,0.03); }
  .pd-scrollbar-thin::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #059669, #34D399); border-radius: 2px; }

  /* Line clamp */
  .pd-line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .pd-line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Progress bar */
  .pd-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669, #34D399, #6EE7B7);
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(52,211,153,0.5);
  }

  /* Sticky sidebar */
  .pd-sticky {
    position: sticky;
    top: 100px;
  }

  /* Tooltip */
  .pd-tooltip {
    position: relative;
  }
  .pd-tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--pd-gray-900);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    pointer-events: none;
    z-index: 50;
  }
  .pd-tooltip:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .pd-layout {
      grid-template-columns: 1fr !important;
    }
    .pd-sidebar {
      display: none !important;
    }
    .pd-content-wrapper {
      max-width: 720px !important;
      margin: 0 auto !important;
    }
  }

  @media (max-width: 768px) {
    .pd-hero-image {
      height: 300px !important;
      border-radius: var(--pd-radius-lg) !important;
    }
    .pd-title {
      font-size: 28px !important;
    }
    .pd-article-content {
      font-size: 16px !important;
    }
    .pd-article-content h2 {
      font-size: 22px !important;
    }
    .pd-article-content h3 {
      font-size: 18px !important;
    }
    .pd-article-content blockquote {
      padding: 20px 20px 20px 24px !important;
      font-size: 16px !important;
    }
    .pd-meta-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }
    .pd-share-section {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .pd-related-grid {
      grid-template-columns: 1fr !important;
    }
    .pd-nav-posts {
      flex-direction: column !important;
    }
    .pd-floating-actions {
      bottom: 16px !important;
      right: 16px !important;
      gap: 8px !important;
    }
    .pd-author-card {
      flex-direction: column !important;
      text-align: center !important;
    }
    .pd-author-avatar-lg {
      margin: 0 auto !important;
    }
    .pd-comment-form {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .pd-hero-image {
      height: 240px !important;
      border-radius: var(--pd-radius-md) !important;
    }
    .pd-title {
      font-size: 24px !important;
    }
    .pd-back-link {
      font-size: 13px !important;
    }
    .pd-tags-wrap {
      gap: 6px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    .pd-progress-bar { display: none; }
  }

  @media print {
    .pd-sidebar, .pd-floating-actions, .pd-progress-bar,
    .pd-share-section, .pd-comment-section, .pd-nav-posts { display: none !important; }
    .pd-article-content { font-size: 14px; color: black; }
  }
`;

/* ═══════════════════════════════════════════════════════
   UTILITY HOOKS
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    let t;
    const h = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 150); };
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); clearTimeout(t); };
  }, []);
  return w;
};

const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return progress;
};

/* ═══════════════════════════════════════════════════════
   ICON BUTTON
   ═══════════════════════════════════════════════════════ */
const IconBtn = ({
  icon,
  label,
  onClick,
  active = false,
  variant = 'outline',
  size = 44,
  tooltip,
  badge,
  className = '',
}) => {
  const variants = {
    outline: {
      backgroundColor: active ? '#059669' : 'white',
      border: active ? '2px solid #059669' : '2px solid #E5E7EB',
      color: active ? 'white' : '#6B7280',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: 'none',
      color: active ? '#059669' : '#9CA3AF',
    },
    glass: {
      backgroundColor: active ? 'rgba(5,150,105,0.9)' : 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(12px)',
      border: '1px solid ' + (active ? 'rgba(5,150,105,0.9)' : 'rgba(255,255,255,0.15)'),
      color: 'white',
    },
    solid: {
      backgroundColor: active ? '#059669' : '#F3F4F6',
      border: 'none',
      color: active ? 'white' : '#6B7280',
    },
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-tooltip={tooltip}
      className={`pd-focus ${tooltip ? 'pd-tooltip' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s var(--pd-transition)',
        position: 'relative',
        flexShrink: 0,
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (variant === 'outline' && !active) {
          e.currentTarget.style.borderColor = '#059669';
          e.currentTarget.style.color = '#059669';
          e.currentTarget.style.backgroundColor = '#ECFDF5';
        }
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        if (variant === 'outline' && !active) {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.color = '#6B7280';
          e.currentTarget.style.backgroundColor = 'white';
        }
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {icon}
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 'var(--pd-radius-full)',
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid white',
            animation: 'bounceIn 0.4s ease',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════
   PILL COMPONENT
   ═══════════════════════════════════════════════════════ */
const Pill = ({ children, icon, variant = 'green', onClick, size = 'md' }) => {
  const sizes = {
    sm: { padding: '4px 12px', fontSize: 11, gap: 4 },
    md: { padding: '8px 18px', fontSize: 13, gap: 6 },
    lg: { padding: '10px 22px', fontSize: 14, gap: 8 },
  };
  const variants = {
    green: { backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #D1FAE5' },
    solid: { background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none' },
    outline: { backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' },
    glass: { backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' },
    white: { backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB', boxShadow: 'var(--pd-shadow-sm)' },
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={onClick ? 'pd-focus' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--pd-radius-full)',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s var(--pd-transition)',
        whiteSpace: 'nowrap',
        fontFamily: "'Inter', sans-serif",
        ...sizes[size],
        ...variants[variant],
      }}
      onMouseOver={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
      }}
      onMouseOut={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', marginRight: sizes[size].gap }}>{icon}</span>}
      {children}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════
   TABLE OF CONTENTS (SIDEBAR)
   ═══════════════════════════════════════════════════════ */
const TableOfContents = ({ headings, activeId }) => {
  if (!headings || headings.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--pd-radius-xl)',
        padding: '28px',
        border: '1px solid #F3F4F6',
        boxShadow: 'var(--pd-shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
          }}
        >
          <FiList size={16} />
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif" }}>
          Table of Contents
        </h4>
      </div>
      <nav>
        {headings.map((heading, i) => (
          <a
            key={i}
            href={`#${heading.id}`}
            style={{
              display: 'block',
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: activeId === heading.id ? 600 : 400,
              color: activeId === heading.id ? '#059669' : '#6B7280',
              textDecoration: 'none',
              borderRadius: 'var(--pd-radius-sm)',
              backgroundColor: activeId === heading.id ? '#ECFDF5' : 'transparent',
              borderLeft: activeId === heading.id ? '3px solid #059669' : '3px solid transparent',
              transition: 'all 0.2s',
              marginBottom: 2,
              lineHeight: 1.4,
            }}
            onMouseOver={(e) => {
              if (activeId !== heading.id) {
                e.currentTarget.style.color = '#059669';
                e.currentTarget.style.backgroundColor = '#FAFDF7';
              }
            }}
            onMouseOut={(e) => {
              if (activeId !== heading.id) {
                e.currentTarget.style.color = '#6B7280';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════ */
const ShareModal = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const platforms = [
    { name: 'Twitter', icon: <FiTwitter size={20} />, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: <FiFacebook size={20} />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: <FiLinkedin size={20} />, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'Email', icon: <FiMail size={20} />, color: '#059669', url: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--pd-radius-xl)',
          padding: 36,
          maxWidth: 440,
          width: '100%',
          animation: 'scaleIn 0.3s ease',
          boxShadow: 'var(--pd-shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#111827' }}>
            Share Article
          </h3>
          <IconBtn icon={<FiX size={18} />} label="Close" onClick={onClose} variant="ghost" size={36} />
        </div>

        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.5 }}>
          Share "{post.title}" with your network
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '16px 8px',
                borderRadius: 'var(--pd-radius-md)',
                border: '1px solid #E5E7EB',
                textDecoration: 'none',
                color: '#374151',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = p.color;
                e.currentTarget.style.color = p.color;
                e.currentTarget.style.backgroundColor = `${p.color}08`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {p.icon}
              <span style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</span>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--pd-radius-md)',
              border: '1px solid #E5E7EB',
              fontSize: 13,
              color: '#6B7280',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            onClick={copyLink}
            className="pd-btn-primary pd-focus"
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--pd-radius-md)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? <><FiCheck size={14} /> Copied!</> : <><FiCopy size={14} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ESTIMATED READING PROGRESS LABEL
   ═══════════════════════════════════════════════════════ */
const getReadingLabel = (readTime) => {
  const min = parseInt(readTime) || 5;
  if (min <= 3) return { icon: <FiZap size={14} />, label: 'Quick Read', color: '#059669' };
  if (min <= 7) return { icon: <FiCoffee size={14} />, label: 'Medium Read', color: '#0891B2' };
  return { icon: <FiBookOpen size={14} />, label: 'Long Read', color: '#7C3AED' };
};

/* ═══════════════════════════════════════════════════════
   NOT FOUND COMPONENT
   ═══════════════════════════════════════════════════════ */
const NotFound = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: 40,
      backgroundColor: 'var(--pd-off-white)',
      textAlign: 'center',
    }}
  >
    <style>{globalStyles}</style>
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 32px',
        animation: 'float 3s ease infinite',
      }}
    >
      <FiFeather size={48} color="#059669" />
    </div>
    <h1
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(32px, 5vw, 48px)',
        color: '#111827',
        marginBottom: 16,
        letterSpacing: '-0.02em',
      }}
    >
      Article Not Found
    </h1>
    <p style={{ fontSize: 18, color: '#6B7280', marginBottom: 36, maxWidth: 420, lineHeight: 1.6 }}>
      The article you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/posts"
      className="pd-btn-primary pd-focus"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '16px 36px',
        borderRadius: 'var(--pd-radius-full)',
        fontSize: 16,
        textDecoration: 'none',
      }}
    >
      <FiArrowLeft size={18} /> Back to Journal
    </Link>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Safari Explorer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: 'What an incredible article! The descriptions really transport you there.',
      date: '2 days ago',
      likes: 8,
    },
    {
      id: 2,
      author: 'Wildlife Photographer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: 'I visited this place last year and your writing captures it perfectly. The sunrise views are unmatched!',
      date: '1 week ago',
      likes: 15,
    },
  ]);

  const articleRef = useRef(null);
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1200;
  const readingProgress = useReadingProgress();

  // Related posts
  const relatedPosts = useMemo(
    () => posts.filter((p) => p.slug !== slug && p.category === post?.category).slice(0, 3),
    [slug, post]
  );

  // Previous/Next posts
  const currentPostIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentPostIndex > 0 ? posts[currentPostIndex - 1] : null;
  const nextPost = currentPostIndex < posts.length - 1 ? posts[currentPostIndex + 1] : null;

  // Table of contents headings (mock)
  const headings = useMemo(() => {
    if (!post) return [];
    return [
      { id: 'introduction', text: 'Introduction' },
      { id: 'the-journey', text: 'The Journey' },
      { id: 'highlights', text: 'Key Highlights' },
      { id: 'practical-tips', text: 'Practical Tips' },
      { id: 'conclusion', text: 'Final Thoughts' },
    ];
  }, [post]);

  // Back to top
  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Like handler
  const handleLike = () => {
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  // Comment submit
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      {
        id: Date.now(),
        author: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        text: commentText,
        date: 'Just now',
        likes: 0,
      },
      ...prev,
    ]);
    setCommentText('');
  };

  // Reading time info
  const readingInfo = post ? getReadingLabel(post.readTime) : null;

  // Estimated reading time in minutes
  const estimatedMin = post ? parseInt(post.readTime) || 5 : 5;
  const minutesLeft = Math.max(1, Math.round(estimatedMin * (1 - readingProgress / 100)));

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Article Not Found | Altuvera</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={toAbsoluteUrl(`/post/${slug}`)} />
        </Helmet>
        <NotFound />
      </>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--pd-off-white)' }}>
      <Helmet>
        <title>{`${post.title} | Altuvera`}</title>
        <meta name="description" content={toMetaDescription(post.excerpt || '')} />
        <link rel="canonical" href={toAbsoluteUrl(`/post/${slug}`)} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Altuvera`} />
        <meta
          property="og:description"
          content={toMetaDescription(post.excerpt || '')}
        />
        <meta property="og:url" content={toAbsoluteUrl(`/post/${slug}`)} />
        <meta property="og:image" content={post.image || getBrandLogoUrl()} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Altuvera`} />
        <meta
          name="twitter:description"
          content={toMetaDescription(post.excerpt || '')}
        />
        <meta
          name="twitter:image"
          content={post.image || getBrandLogoUrl()}
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.image ? [post.image] : undefined,
            datePublished: post.date,
            author: post.author
              ? { '@type': 'Person', name: post.author }
              : undefined,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': toAbsoluteUrl(`/post/${slug}`),
            },
            publisher: {
              '@type': 'Organization',
              name: 'Altuvera',
              logo: { '@type': 'ImageObject', url: getBrandLogoUrl() },
            },
          })}
        </script>
      </Helmet>
      <style>{globalStyles}</style>

      {/* ── Reading Progress Bar ── */}
      <div className="pd-progress-bar" style={{ width: `${readingProgress}%` }} />

      {/* ── Main Article Section ── */}
      <section style={{ padding: isMobile ? '24px 16px 60px' : '48px 24px 100px' }}>
        <div
          className="pd-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 280px' : '1fr',
            gap: 40,
            maxWidth: 1200,
            margin: '0 auto',
            alignItems: 'start',
          }}
        >
          {/* ══════════ MAIN CONTENT ══════════ */}
          <div className="pd-content-wrapper">
            <AnimatedSection animation="fadeInUp">
              {/* Back link */}
              <Link
                to="/posts"
                className="pd-back-link pd-focus"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#059669',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 32,
                  padding: '8px 18px',
                  backgroundColor: '#ECFDF5',
                  borderRadius: 'var(--pd-radius-full)',
                  transition: 'all 0.3s',
                  border: '1px solid #D1FAE5',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#D1FAE5';
                  e.currentTarget.style.transform = 'translateX(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ECFDF5';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <FiArrowLeft size={16} /> Back to Journal
              </Link>

              {/* Header */}
              <header style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  <Pill variant="green" icon={<FiTag size={11} />}>{post.category}</Pill>
                  {readingInfo && (
                    <Pill variant="outline" size="sm" icon={readingInfo.icon}>
                      <span style={{ color: readingInfo.color }}>{readingInfo.label}</span>
                    </Pill>
                  )}
                </div>

                <h1
                  className="pd-title"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(28px, 4vw, 46px)',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: 24,
                    lineHeight: 1.15,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {post.title}
                </h1>

                {/* Meta row */}
                <div
                  className="pd-meta-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Author */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #D1FAE5',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{post.author}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>Travel Writer</div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 1,
                      height: 32,
                      backgroundColor: '#E5E7EB',
                      display: isMobile ? 'none' : 'block',
                    }}
                  />

                  {[
                    { icon: <FiCalendar size={14} />, text: post.date },
                    { icon: <FiClock size={14} />, text: post.readTime },
                    { icon: <FiEye size={14} />, text: '2.4K views' },
                  ].map((item, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 14,
                        color: '#9CA3AF',
                        fontWeight: 500,
                      }}
                    >
                      {item.icon} {item.text}
                    </span>
                  ))}
                </div>
              </header>

              {/* Featured Image */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: 40,
                  borderRadius: 'var(--pd-radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--pd-shadow-lg)',
                }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="pd-hero-image"
                  style={{
                    width: '100%',
                    height: isMobile ? 300 : 480,
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.6s var(--pd-transition)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {/* Gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    pointerEvents: 'none',
                  }}
                />
                {/* Reading time remaining badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    padding: '8px 16px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 'var(--pd-radius-full)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FiClock size={12} />
                  {minutesLeft} min left
                </div>
              </div>

              {/* ── Article Content ── */}
              <article ref={articleRef} className="pd-article-content">
                <p className="pd-drop-cap">{post.excerpt}</p>

                <h2 id="introduction">Introduction</h2>
                <p>{post.content || post.excerpt}</p>

                <blockquote>
                  "East Africa's landscapes hold stories that have been told for millennia — each sunrise paints a new chapter across the savannah."
                </blockquote>

                <h2 id="the-journey">The Journey</h2>
                <p>
                  The journey into the heart of East Africa is one that transforms every traveler. From the moment you set foot on the red earth, 
                  there's a palpable sense of ancient rhythm — a connection to something far greater than yourself. The vast plains stretch endlessly 
                  under skies so wide they seem to wrap around you like a blanket of infinite possibility.
                </p>
                <p>
                  Wildlife roams freely here in ways that remind us of what the world looked like before modern boundaries were drawn. 
                  Every encounter is a privilege, every sunset a masterpiece, every star in the night sky a reminder of our place in the cosmos.
                </p>

                <h2 id="highlights">Key Highlights</h2>
                <ul>
                  <li>Witness the Great Migration across the Serengeti — one of nature's most spectacular events</li>
                  <li>Trek through misty bamboo forests to encounter mountain gorillas in their natural habitat</li>
                  <li>Experience the warmth of Maasai hospitality and learn centuries-old traditions</li>
                  <li>Explore pristine beaches along the Indian Ocean coastline</li>
                  <li>Summit iconic peaks with views that stretch across entire countries</li>
                </ul>

                <h2 id="practical-tips">Practical Tips</h2>
                <p>
                  Planning your East African adventure requires some preparation, but the rewards far outweigh the effort. 
                  The best time to visit varies by destination — the dry season (June to October) is ideal for wildlife viewing, 
                  while the green season offers lush landscapes and fewer crowds.
                </p>
                <p>
                  Pack layers, as temperatures can vary dramatically between the plains and higher elevations. 
                  Most importantly, come with an open heart and a willingness to be transformed by experiences 
                  that no photograph or description can fully capture.
                </p>

                <hr />

                <h2 id="conclusion">Final Thoughts</h2>
                <p>
                  East Africa isn't just a destination — it's an awakening. Whether you come for the wildlife, 
                  the landscapes, or the cultural richness, you'll leave with something far more profound: 
                  a deeper understanding of what it means to be connected to the natural world and to each other.
                </p>
              </article>

              {/* ── Tags ── */}
              {post.tags && post.tags.length > 0 && (
                <div
                  className="pd-tags-wrap"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 40,
                    marginBottom: 40,
                    paddingTop: 32,
                    borderTop: '1px solid #F3F4F6',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                    <FiHash size={14} /> Tags:
                  </span>
                  {post.tags.map((tag, i) => (
                    <Link
                      key={i}
                      to={`/posts?tag=${tag}`}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#ECFDF5',
                        borderRadius: 'var(--pd-radius-full)',
                        fontSize: 13,
                        color: '#059669',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        border: '1px solid #D1FAE5',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#D1FAE5';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ECFDF5';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* ── Share Section ── */}
              <div
                className="pd-share-section"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  padding: '28px 0',
                  borderTop: '1px solid #F3F4F6',
                  borderBottom: '1px solid #F3F4F6',
                  marginBottom: 40,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                    Share this article
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { icon: <FiTwitter size={16} />, label: 'Twitter', color: '#1DA1F2' },
                      { icon: <FiFacebook size={16} />, label: 'Facebook', color: '#1877F2' },
                      { icon: <FiLinkedin size={16} />, label: 'LinkedIn', color: '#0A66C2' },
                      { icon: <FiMail size={16} />, label: 'Email', color: '#059669' },
                    ].map((p) => (
                      <IconBtn
                        key={p.label}
                        icon={p.icon}
                        label={`Share on ${p.label}`}
                        variant="outline"
                        size={40}
                        tooltip={p.label}
                      />
                    ))}
                    <IconBtn
                      icon={<FiShare2 size={16} />}
                      label="Share"
                      variant="outline"
                      size={40}
                      tooltip="More options"
                      onClick={() => setShowShareModal(true)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={handleLike}
                    className="pd-focus"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      borderRadius: 'var(--pd-radius-full)',
                      border: liked ? '2px solid #EF4444' : '2px solid #E5E7EB',
                      backgroundColor: liked ? '#FEF2F2' : 'white',
                      color: liked ? '#EF4444' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.3s',
                    }}
                    onMouseOver={(e) => {
                      if (!liked) {
                        e.currentTarget.style.borderColor = '#FCA5A5';
                        e.currentTarget.style.color = '#EF4444';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!liked) {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#6B7280';
                      }
                    }}
                  >
                    <FiHeart
                      size={16}
                      fill={liked ? '#EF4444' : 'none'}
                      style={{ animation: liked ? 'heartBeat 0.6s ease' : 'none' }}
                    />
                    {likeCount}
                  </button>

                  <IconBtn
                    icon={<FiPrinter size={16} />}
                    label="Print"
                    variant="outline"
                    size={40}
                    tooltip="Print"
                    onClick={() => window.print()}
                  />
                </div>
              </div>

              {/* ── Author Card ── */}
              <div
                className="pd-author-card"
                style={{
                  display: 'flex',
                  gap: 24,
                  padding: 32,
                  backgroundColor: 'white',
                  borderRadius: 'var(--pd-radius-xl)',
                  border: '1px solid #F3F4F6',
                  boxShadow: 'var(--pd-shadow-sm)',
                  marginBottom: 40,
                }}
              >
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="pd-author-avatar-lg"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #D1FAE5',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Pill variant="green" size="sm">Author</Pill>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 10, marginBottom: 6 }}>
                    {post.author}
                  </h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                    Passionate travel writer and photographer with over a decade of experience exploring East Africa's
                    most remote and beautiful destinations. Dedicated to sustainable travel and cultural preservation.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      to="/posts"
                      className="pd-btn-primary pd-focus"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 22px',
                        borderRadius: 'var(--pd-radius-full)',
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      <FiFeather size={14} /> All Articles
                    </Link>
                    <IconBtn icon={<FiTwitter size={16} />} label="Twitter" variant="outline" size={40} />
                    <IconBtn icon={<FiLinkedin size={16} />} label="LinkedIn" variant="outline" size={40} />
                  </div>
                </div>
              </div>

              {/* ── Comments Section ── */}
              <div
                className="pd-comment-section"
                style={{
                  marginBottom: 40,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
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
                    <FiMessageCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#111827' }}>
                      Discussion ({comments.length})
                    </h3>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
                      Join the conversation
                    </p>
                  </div>
                </div>

                {/* Comment form */}
                <form
                  onSubmit={handleCommentSubmit}
                  className="pd-comment-form"
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 32,
                    alignItems: 'flex-start',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                    alt="You"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #D1FAE5',
                      flexShrink: 0,
                      display: isMobile ? 'none' : 'block',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this article..."
                      className="pd-focus"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        borderRadius: 'var(--pd-radius-lg)',
                        border: '2px solid #E5E7EB',
                        backgroundColor: '#FAFDF7',
                        fontSize: 14,
                        color: '#374151',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'border-color 0.3s',
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.6,
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#059669';
                        e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button
                        type="submit"
                        className="pd-btn-primary pd-focus"
                        disabled={!commentText.trim()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 24px',
                          borderRadius: 'var(--pd-radius-full)',
                          fontSize: 14,
                          opacity: commentText.trim() ? 1 : 0.5,
                          cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <FiSend size={14} /> Post Comment
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comments list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {comments.map((comment, i) => (
                    <div
                      key={comment.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '20px 24px',
                        backgroundColor: 'white',
                        borderRadius: 'var(--pd-radius-lg)',
                        border: '1px solid #F3F4F6',
                        animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                        transition: 'border-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#D1FAE5')}
                      onMouseOut={(e) => (e.currentTarget.style.borderColor = '#F3F4F6')}
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ECFDF5',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginRight: 10 }}>
                              {comment.author}
                            </span>
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{comment.date}</span>
                          </div>
                          <IconBtn icon={<FiMoreHorizontal size={14} />} label="More" variant="ghost" size={28} />
                        </div>
                        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 10 }}>
                          {comment.text}
                        </p>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              fontSize: 12,
                              fontWeight: 600,
                              transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#059669')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                          >
                            <FiThumbsUp size={12} /> {comment.likes}
                          </button>
                          <button
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#9CA3AF',
                              fontSize: 12,
                              fontWeight: 600,
                              transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#059669')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                          >
                            <FiCornerUpLeft size={12} /> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Previous / Next Navigation ── */}
              <div
                className="pd-nav-posts"
                style={{
                  display: 'flex',
                  gap: 20,
                  marginBottom: 40,
                }}
              >
                {prevPost ? (
                  <Link
                    to={`/post/${prevPost.slug}`}
                    className="pd-card-hover pd-focus"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '20px 24px',
                      backgroundColor: 'white',
                      borderRadius: 'var(--pd-radius-lg)',
                      border: '1px solid #F3F4F6',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    <FiChevronLeft size={20} color="#9CA3AF" />
                    <div>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Previous</span>
                      <p className="pd-line-clamp-2" style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginTop: 4 }}>
                        {prevPost.title}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div style={{ flex: 1 }} />
                )}

                {nextPost ? (
                  <Link
                    to={`/post/${nextPost.slug}`}
                    className="pd-card-hover pd-focus"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '20px 24px',
                      backgroundColor: 'white',
                      borderRadius: 'var(--pd-radius-lg)',
                      border: '1px solid #F3F4F6',
                      textDecoration: 'none',
                      textAlign: 'right',
                      justifyContent: 'flex-end',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Next</span>
                      <p className="pd-line-clamp-2" style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginTop: 4 }}>
                        {nextPost.title}
                      </p>
                    </div>
                    <FiChevronRight size={20} color="#9CA3AF" />
                  </Link>
                ) : (
                  <div style={{ flex: 1 }} />
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* ══════════ SIDEBAR ══════════ */}
          {isDesktop && (
            <aside className="pd-sidebar pd-sticky pd-scrollbar-thin" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Table of Contents */}
              <TableOfContents headings={headings} activeId={activeHeadingId} />

              {/* Quick actions */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--pd-radius-xl)',
                  padding: '24px',
                  border: '1px solid #F3F4F6',
                  boxShadow: 'var(--pd-shadow-sm)',
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  Quick Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={handleLike}
                    className="pd-focus"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--pd-radius-md)',
                      border: 'none',
                      backgroundColor: liked ? '#FEF2F2' : '#F9FAFB',
                      color: liked ? '#EF4444' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <FiHeart size={16} fill={liked ? '#EF4444' : 'none'} />
                    {liked ? 'Liked' : 'Like Article'} ({likeCount})
                  </button>

                  <button
                    onClick={() => setBookmarked((p) => !p)}
                    className="pd-focus"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--pd-radius-md)',
                      border: 'none',
                      backgroundColor: bookmarked ? '#ECFDF5' : '#F9FAFB',
                      color: bookmarked ? '#059669' : '#6B7280',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <FiBookmark size={16} fill={bookmarked ? '#059669' : 'none'} />
                    {bookmarked ? 'Saved' : 'Save for Later'}
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="pd-focus"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--pd-radius-md)',
                      border: 'none',
                      backgroundColor: '#F9FAFB',
                      color: '#6B7280',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <FiShare2 size={16} /> Share
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="pd-focus"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 'var(--pd-radius-md)',
                      border: 'none',
                      backgroundColor: '#F9FAFB',
                      color: '#6B7280',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <FiPrinter size={16} /> Print
                  </button>
                </div>
              </div>

              {/* Reading progress */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--pd-radius-xl)',
                  padding: '24px',
                  border: '1px solid #F3F4F6',
                  boxShadow: 'var(--pd-shadow-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    background: `conic-gradient(#059669 ${readingProgress}%, #F3F4F6 ${readingProgress}%)`,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#059669',
                    }}
                  >
                    {Math.round(readingProgress)}%
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
                  {minutesLeft > 0 ? `${minutesLeft} min remaining` : 'Finished reading'}
                </p>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ══════════ RELATED ARTICLES ══════════ */}
      {relatedPosts.length > 0 && (
        <section
          style={{
            backgroundColor: '#F0FDF4',
            padding: isMobile ? '48px 16px' : '80px 24px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <AnimatedSection animation="fadeInUp">
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Pill variant="solid" size="md" icon={<FiBookOpen size={12} />}>
                  Related Reading
                </Pill>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: isMobile ? '24px' : '34px',
                    fontWeight: 800,
                    color: '#111827',
                    marginTop: 20,
                    marginBottom: 10,
                    letterSpacing: '-0.02em',
                  }}
                >
                  More Articles You'll Love
                </h2>
                <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
                  Continue your journey with these related stories
                </p>
              </div>
            </AnimatedSection>

            <div
              className="pd-related-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 28,
              }}
            >
              {relatedPosts.map((relPost, index) => (
                <AnimatedSection key={relPost.id} animation="fadeInUp" delay={index * 0.1}>
                  <Link
                    to={`/post/${relPost.slug}`}
                    className="pd-card-hover pd-focus"
                    style={{
                      display: 'block',
                      backgroundColor: 'white',
                      borderRadius: 'var(--pd-radius-xl)',
                      overflow: 'hidden',
                      boxShadow: 'var(--pd-shadow-sm)',
                      textDecoration: 'none',
                      border: '1px solid #E5E7EB',
                      height: '100%',
                    }}
                  >
                    <div style={{ overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={relPost.image}
                        alt={relPost.title}
                        loading="lazy"
                        style={{
                          height: 200,
                          width: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s var(--pd-transition)',
                          display: 'block',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <div style={{ position: 'absolute', top: 12, left: 12 }}>
                        <Pill variant="green" size="sm" icon={<FiTag size={10} />}>
                          {relPost.category}
                        </Pill>
                      </div>
                    </div>

                    <div style={{ padding: 24 }}>
                      <h3
                        className="pd-line-clamp-2"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#111827',
                          marginBottom: 10,
                          lineHeight: 1.35,
                        }}
                      >
                        {relPost.title}
                      </h3>
                      <p
                        className="pd-line-clamp-2"
                        style={{
                          fontSize: 14,
                          color: '#6B7280',
                          lineHeight: 1.6,
                          marginBottom: 16,
                        }}
                      >
                        {relPost.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
                          {relPost.date} · {relPost.readTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                          Read <FiArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            {/* View all link */}
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link
                to="/posts"
                className="pd-btn-primary pd-focus"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '16px 36px',
                  borderRadius: 'var(--pd-radius-full)',
                  fontSize: 16,
                  textDecoration: 'none',
                }}
              >
                <FiBookOpen size={18} /> View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FLOATING ACTIONS (Mobile) ══════════ */}
      {!isDesktop && (
        <div
          className="pd-floating-actions"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 100,
            animation: 'fadeUp 0.4s ease',
          }}
        >
          <IconBtn
            icon={<FiHeart size={18} fill={liked ? '#EF4444' : 'none'} />}
            label="Like"
            variant="solid"
            size={48}
            active={liked}
            onClick={handleLike}
            badge={likeCount > 0 ? likeCount : undefined}
          />
          <IconBtn
            icon={<FiBookmark size={18} fill={bookmarked ? '#059669' : 'none'} />}
            label="Bookmark"
            variant="solid"
            size={48}
            active={bookmarked}
            onClick={() => setBookmarked((p) => !p)}
          />
          <IconBtn
            icon={<FiShare2 size={18} />}
            label="Share"
            variant="solid"
            size={48}
            onClick={() => setShowShareModal(true)}
          />
        </div>
      )}

      {/* ══════════ SHARE MODAL ══════════ */}
      {showShareModal && (
        <ShareModal post={post} onClose={() => setShowShareModal(false)} />
      )}

      {/* ══════════ BACK TO TOP ══════════ */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pd-btn-primary pd-focus"
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: isDesktop ? 32 : 200,
            right: isDesktop ? 32 : 24,
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
            animation: 'bounceIn 0.4s ease',
            padding: 0,
          }}
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default PostDetail;
