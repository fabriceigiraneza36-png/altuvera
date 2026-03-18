// src/pages/PostDetail.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiCalendar, FiClock, FiUser, FiArrowLeft, FiShare2, FiHeart,
  FiTwitter, FiFacebook, FiBookmark, FiMessageCircle, FiArrowUp,
  FiCopy, FiCheck, FiChevronLeft, FiChevronRight, FiTag, FiEye,
  FiStar, FiLinkedin, FiMail, FiExternalLink, FiArrowRight,
  FiFeather, FiList, FiHash, FiX, FiSend, FiCornerUpLeft,
  FiThumbsUp, FiMoreHorizontal, FiPrinter, FiZap, FiCoffee,
  FiBookOpen, FiAlertCircle, FiRefreshCw, FiLoader,
} from 'react-icons/fi';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { getBrandLogoUrl, toAbsoluteUrl, toMetaDescription } from '../utils/seo';
import { apiFetch } from '../utils/apiBase';

/* ═══════════════════════════════════════════════════════
   API SERVICE
   ═══════════════════════════════════════════════════════ */
const postsAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await apiFetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
      });
      clearTimeout(timeout);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${response.status})`);
      }
      return response.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== 'AbortError' && !err.message.includes('404')) {
        await new Promise((r) => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },

  getBySlug(slug) { return this._fetch(`/posts/${slug}`); },
  getAll(params = {}) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))).toString();
    return this._fetch(`/posts${q ? `?${q}` : ''}`);
  },
  toggleLike(slug, action) { return this._fetch(`/posts/${slug}/like`, { method: 'POST', body: JSON.stringify({ action }) }); },
  getComments(slug) { return this._fetch(`/posts/${slug}/comments`); },
  addComment(slug, data) { return this._fetch(`/posts/${slug}/comments`, { method: 'POST', body: JSON.stringify(data) }); },
};

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --pd-green-50: #ECFDF5; --pd-green-100: #D1FAE5; --pd-green-200: #A7F3D0;
    --pd-green-300: #6EE7B7; --pd-green-400: #34D399; --pd-green-500: #10B981;
    --pd-green-600: #059669; --pd-green-700: #047857; --pd-green-800: #065F46;
    --pd-green-900: #064E3B; --pd-white: #FFFFFF; --pd-off-white: #FAFDF7;
    --pd-cream: #FEFDFB;
    --pd-gray-50: #F9FAFB; --pd-gray-100: #F3F4F6; --pd-gray-200: #E5E7EB;
    --pd-gray-300: #D1D5DB; --pd-gray-400: #9CA3AF; --pd-gray-500: #6B7280;
    --pd-gray-600: #4B5563; --pd-gray-700: #374151; --pd-gray-800: #1F2937;
    --pd-gray-900: #111827;
    --pd-shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
    --pd-shadow-md: 0 4px 16px rgba(0,0,0,0.06);
    --pd-shadow-lg: 0 12px 40px rgba(0,0,0,0.1);
    --pd-shadow-xl: 0 25px 60px rgba(0,0,0,0.14);
    --pd-shadow-green: 0 8px 30px rgba(5,150,105,0.2);
    --pd-radius-sm: 8px; --pd-radius-md: 14px; --pd-radius-lg: 20px;
    --pd-radius-xl: 28px; --pd-radius-2xl: 36px; --pd-radius-full: 9999px;
    --pd-transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  @keyframes bounceIn { 0%{transform:scale(0.3);opacity:0;} 50%{transform:scale(1.05);} 70%{transform:scale(0.9);} 100%{transform:scale(1);opacity:1;} }
  @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
  @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  @keyframes heartBeat { 0%{transform:scale(1);} 14%{transform:scale(1.3);} 28%{transform:scale(1);} 42%{transform:scale(1.3);} 70%{transform:scale(1);} }
  @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  .pd-focus:focus-visible { outline:2px solid var(--pd-green-600); outline-offset:2px; }

  .pd-btn-primary {
    background: linear-gradient(135deg,#059669,#047857); color:white; border:none; cursor:pointer;
    font-weight:700; font-family:'Inter',sans-serif; transition:all 0.3s var(--pd-transition);
    box-shadow:var(--pd-shadow-green); position:relative; overflow:hidden;
  }
  .pd-btn-primary::before {
    content:''; position:absolute; top:50%; left:50%; width:0; height:0; border-radius:50%;
    background:rgba(255,255,255,0.2); transform:translate(-50%,-50%); transition:width 0.6s,height 0.6s;
  }
  .pd-btn-primary:hover::before { width:300px; height:300px; }
  .pd-btn-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 40px rgba(5,150,105,0.35); }
  .pd-btn-primary:active { transform:translateY(0) scale(0.98); }

  .pd-card-hover { transition:all 0.4s var(--pd-transition); }
  .pd-card-hover:hover { transform:translateY(-8px); box-shadow:0 20px 60px rgba(5,150,105,0.12); }

  .pd-article-content { font-family:'Inter',sans-serif; font-size:18px; line-height:1.9; color:var(--pd-gray-700); letter-spacing:-0.01em; }
  .pd-article-content p { margin-bottom:1.8em; }
  .pd-article-content h2 { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--pd-gray-900); margin-top:2.4em; margin-bottom:0.8em; letter-spacing:-0.02em; line-height:1.3; position:relative; padding-left:20px; }
  .pd-article-content h2::before { content:''; position:absolute; left:0; top:4px; bottom:4px; width:4px; background:linear-gradient(180deg,#059669,#34D399); border-radius:2px; }
  .pd-article-content h3 { font-family:'Inter',sans-serif; font-size:22px; font-weight:700; color:var(--pd-gray-800); margin-top:2em; margin-bottom:0.6em; }
  .pd-article-content blockquote { position:relative; margin:2em 0; padding:24px 28px 24px 32px; background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border-radius:var(--pd-radius-lg); border-left:4px solid #059669; font-style:italic; font-size:19px; color:#065F46; line-height:1.7; }
  .pd-article-content blockquote::before { content:'"'; position:absolute; top:-8px; left:16px; font-family:'Playfair Display',serif; font-size:60px; color:#059669; opacity:0.3; line-height:1; }
  .pd-article-content ul, .pd-article-content ol { margin:1.5em 0; padding-left:24px; }
  .pd-article-content li { margin-bottom:0.6em; padding-left:8px; }
  .pd-article-content li::marker { color:#059669; font-weight:700; }
  .pd-article-content a { color:#059669; text-decoration:none; border-bottom:2px solid rgba(5,150,105,0.2); transition:border-color 0.2s; font-weight:500; }
  .pd-article-content a:hover { border-bottom-color:#059669; }
  .pd-article-content img { width:100%; border-radius:var(--pd-radius-lg); margin:2em 0; box-shadow:var(--pd-shadow-md); }
  .pd-article-content code { font-family:'JetBrains Mono',monospace; background:#F3F4F6; padding:2px 8px; border-radius:4px; font-size:0.88em; color:#065F46; }
  .pd-article-content hr { border:none; height:1px; background:linear-gradient(90deg,transparent,#E5E7EB,transparent); margin:3em 0; }
  .pd-article-content .pd-drop-cap::first-letter { float:left; font-family:'Playfair Display',serif; font-size:4em; line-height:0.8; margin-right:12px; margin-top:6px; color:#059669; font-weight:700; }

  .pd-scrollbar-thin::-webkit-scrollbar { height:4px; width:4px; }
  .pd-scrollbar-thin::-webkit-scrollbar-track { background:rgba(0,0,0,0.03); }
  .pd-scrollbar-thin::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#059669,#34D399); border-radius:2px; }
  .pd-line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .pd-line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .pd-progress-bar { position:fixed; top:0; left:0; height:3px; background:linear-gradient(90deg,#059669,#34D399,#6EE7B7); z-index:9999; transition:width 0.1s linear; box-shadow:0 0 10px rgba(52,211,153,0.5); }
  .pd-sticky { position:sticky; top:100px; }

  .pd-tooltip { position:relative; }
  .pd-tooltip::after { content:attr(data-tooltip); position:absolute; bottom:calc(100%+8px); left:50%; transform:translateX(-50%) translateY(4px); background:var(--pd-gray-900); color:white; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500; white-space:nowrap; opacity:0; visibility:hidden; transition:all 0.2s; pointer-events:none; z-index:50; }
  .pd-tooltip:hover::after { opacity:1; visibility:visible; transform:translateX(-50%) translateY(0); }

  @media (max-width:1200px) { .pd-layout{grid-template-columns:1fr!important;} .pd-sidebar{display:none!important;} .pd-content-wrapper{max-width:720px!important;margin:0 auto!important;} }
  @media (max-width:768px) { .pd-hero-image{height:300px!important;border-radius:var(--pd-radius-lg)!important;} .pd-title{font-size:28px!important;} .pd-article-content{font-size:16px!important;} .pd-article-content h2{font-size:22px!important;} .pd-article-content h3{font-size:18px!important;} .pd-article-content blockquote{padding:20px 20px 20px 24px!important;font-size:16px!important;} .pd-meta-row{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;} .pd-share-section{flex-direction:column!important;align-items:flex-start!important;} .pd-related-grid{grid-template-columns:1fr!important;} .pd-nav-posts{flex-direction:column!important;} .pd-floating-actions{bottom:16px!important;right:16px!important;gap:8px!important;} .pd-author-card{flex-direction:column!important;text-align:center!important;} .pd-author-avatar-lg{margin:0 auto!important;} .pd-comment-form{flex-direction:column!important;} }
  @media (max-width:480px) { .pd-hero-image{height:240px!important;border-radius:var(--pd-radius-md)!important;} .pd-title{font-size:24px!important;} .pd-back-link{font-size:13px!important;} .pd-tags-wrap{gap:6px!important;} }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;} .pd-progress-bar{display:none;} }
  @media print { .pd-sidebar,.pd-floating-actions,.pd-progress-bar,.pd-share-section,.pd-comment-section,.pd-nav-posts{display:none!important;} .pd-article-content{font-size:14px;color:black;} }
`;

/* ═══════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => { let t; const h = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 150); }; window.addEventListener('resize', h); return () => { window.removeEventListener('resize', h); clearTimeout(t); }; }, []);
  return w;
};

const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const h = () => { const el = document.documentElement; const st = el.scrollTop || document.body.scrollTop; const sh = el.scrollHeight - el.clientHeight; setProgress(sh > 0 ? (st / sh) * 100 : 0); }; window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  return progress;
};

/* ═══════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════ */
const IconBtn = ({ icon, label, onClick, active = false, variant = 'outline', size = 44, tooltip, badge, className = '' }) => {
  const variants = {
    outline: { backgroundColor: active ? '#059669' : 'white', border: active ? '2px solid #059669' : '2px solid #E5E7EB', color: active ? 'white' : '#6B7280' },
    ghost: { backgroundColor: 'transparent', border: 'none', color: active ? '#059669' : '#9CA3AF' },
    solid: { backgroundColor: active ? '#059669' : '#F3F4F6', border: 'none', color: active ? 'white' : '#6B7280' },
  };
  return (
    <button onClick={onClick} aria-label={label} data-tooltip={tooltip} className={`pd-focus ${tooltip ? 'pd-tooltip' : ''} ${className}`}
      style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s var(--pd-transition)', position: 'relative', flexShrink: 0, ...variants[variant] }}
      onMouseOver={(e) => { if (variant === 'outline' && !active) { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.backgroundColor = '#ECFDF5'; } e.currentTarget.style.transform = 'scale(1.1)'; }}
      onMouseOut={(e) => { if (variant === 'outline' && !active) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = 'white'; } e.currentTarget.style.transform = 'scale(1)'; }}>
      {icon}
      {badge && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 'var(--pd-radius-full)', backgroundColor: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid white', animation: 'bounceIn 0.4s ease' }}>{badge}</span>}
    </button>
  );
};

const Pill = ({ children, icon, variant = 'green', onClick, size = 'md' }) => {
  const sizes = { sm: { padding: '4px 12px', fontSize: 11, gap: 4 }, md: { padding: '8px 18px', fontSize: 13, gap: 6 }, lg: { padding: '10px 22px', fontSize: 14, gap: 8 } };
  const variants = { green: { backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #D1FAE5' }, solid: { background: 'linear-gradient(135deg,#059669,#047857)', color: 'white', border: 'none' }, outline: { backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' }, white: { backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB', boxShadow: 'var(--pd-shadow-sm)' } };
  return (
    <span onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} className={onClick ? 'pd-focus' : ''}
      style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--pd-radius-full)', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.3s var(--pd-transition)', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif", ...sizes[size], ...variants[variant] }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center', marginRight: sizes[size].gap }}>{icon}</span>}
      {children}
    </span>
  );
};

const TableOfContents = ({ headings, activeId }) => {
  if (!headings?.length) return null;
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', padding: '28px', border: '1px solid #F3F4F6', boxShadow: 'var(--pd-shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><FiList size={16} /></div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Inter',sans-serif" }}>Table of Contents</h4>
      </div>
      <nav>{headings.map((h, i) => (
        <a key={i} href={`#${h.id}`} style={{ display: 'block', padding: '8px 12px', fontSize: 13, fontWeight: activeId === h.id ? 600 : 400, color: activeId === h.id ? '#059669' : '#6B7280', textDecoration: 'none', borderRadius: 'var(--pd-radius-sm)', backgroundColor: activeId === h.id ? '#ECFDF5' : 'transparent', borderLeft: activeId === h.id ? '3px solid #059669' : '3px solid transparent', transition: 'all 0.2s', marginBottom: 2, lineHeight: 1.4 }}
          onMouseOver={(e) => { if (activeId !== h.id) { e.currentTarget.style.color = '#059669'; e.currentTarget.style.backgroundColor = '#FAFDF7'; } }}
          onMouseOut={(e) => { if (activeId !== h.id) { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.backgroundColor = 'transparent'; } }}>
          {h.text}
        </a>
      ))}</nav>
    </div>
  );
};

const ShareModal = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const platforms = [
    { name: 'Twitter', icon: <FiTwitter size={20} />, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: <FiFacebook size={20} />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: <FiLinkedin size={20} />, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'Email', icon: <FiMail size={20} />, color: '#059669', url: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}` },
  ];
  const copyLink = () => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'fadeIn 0.2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', padding: 36, maxWidth: 440, width: '100%', animation: 'scaleIn 0.3s ease', boxShadow: 'var(--pd-shadow-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#111827' }}>Share Article</h3>
          <IconBtn icon={<FiX size={18} />} label="Close" onClick={onClose} variant="ghost" size={36} />
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.5 }}>Share "{post.title}" with your network</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          {platforms.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 'var(--pd-radius-md)', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#374151', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.color = p.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {p.icon}<span style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</span>
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={shareUrl} readOnly style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--pd-radius-md)', border: '1px solid #E5E7EB', fontSize: 13, color: '#6B7280', backgroundColor: '#F9FAFB', outline: 'none', fontFamily: "'Inter',sans-serif" }} />
          <button onClick={copyLink} className="pd-btn-primary pd-focus" style={{ padding: '12px 20px', borderRadius: 'var(--pd-radius-md)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {copied ? <><FiCheck size={14} /> Copied!</> : <><FiCopy size={14} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const getReadingLabel = (readTime) => {
  const min = parseInt(readTime) || 5;
  if (min <= 3) return { icon: <FiZap size={14} />, label: 'Quick Read', color: '#059669' };
  if (min <= 7) return { icon: <FiCoffee size={14} />, label: 'Medium Read', color: '#0891B2' };
  return { icon: <FiBookOpen size={14} />, label: 'Long Read', color: '#7C3AED' };
};

/* ═══════════════════════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════════════════════ */
const PostDetailSkeleton = ({ isMobile }) => (
  <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '48px 24px 100px' }}>
    <div style={{ width: 160, height: 38, borderRadius: 50, backgroundColor: '#E5E7EB', marginBottom: 32, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 80, height: 30, borderRadius: 50, backgroundColor: '#E5E7EB', backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
      <div style={{ width: 100, height: 30, borderRadius: 50, backgroundColor: '#E5E7EB', backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
    </div>
    <div style={{ width: '100%', height: 40, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 12, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
    <div style={{ width: '80%', height: 40, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 28, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#E5E7EB', backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
      <div><div style={{ width: 120, height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 6, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} /><div style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: '#E5E7EB', backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} /></div>
    </div>
    <div style={{ width: '100%', height: isMobile ? 300 : 480, borderRadius: 'var(--pd-radius-xl)', backgroundColor: '#E5E7EB', marginBottom: 40, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />
    {[...Array(6)].map((_, i) => <div key={i} style={{ width: `${90 - i * 5}%`, height: 16, borderRadius: 4, backgroundColor: '#E5E7EB', marginBottom: 14, backgroundImage: 'linear-gradient(90deg,#E5E7EB,#F3F4F6,#E5E7EB)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear' }} />)}
  </div>
);

/* ═══════════════════════════════════════════════════════
   NOT FOUND
   ═══════════════════════════════════════════════════════ */
const NotFound = ({ message }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40, backgroundColor: 'var(--pd-off-white)', textAlign: 'center' }}>
    <style>{globalStyles}</style>
    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', animation: 'float 3s ease infinite' }}><FiFeather size={48} color="#059669" /></div>
    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(32px,5vw,48px)', color: '#111827', marginBottom: 16, letterSpacing: '-0.02em' }}>Article Not Found</h1>
    <p style={{ fontSize: 18, color: '#6B7280', marginBottom: 36, maxWidth: 420, lineHeight: 1.6 }}>{message || "The article you're looking for doesn't exist or has been moved."}</p>
    <Link to="/posts" className="pd-btn-primary pd-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 'var(--pd-radius-full)', fontSize: 16, textDecoration: 'none' }}><FiArrowLeft size={18} /> Back to Journal</Link>
  </div>
);

/* ═══════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════ */
const ErrorState = ({ error, onRetry }) => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40, textAlign: 'center' }}>
    <style>{globalStyles}</style>
    <FiAlertCircle size={56} color="#DC2626" style={{ marginBottom: 24 }} />
    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: '#111827', marginBottom: 12 }}>Something Went Wrong</h2>
    <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 32, maxWidth: 420, lineHeight: 1.6 }}>{error}</p>
    <button onClick={onRetry} className="pd-btn-primary pd-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 'var(--pd-radius-full)', fontSize: 15 }}><FiRefreshCw size={16} /> Try Again</button>
  </div>
);

/* ═══════════════════════════════════════════════════════
   RENDER CONTENT — Converts content string to JSX
   ═══════════════════════════════════════════════════════ */
const RenderContent = ({ content }) => {
  if (!content) return null;

  // Split content by double newlines into paragraphs
  const blocks = content.split(/\n\n+/).filter(Boolean);
  let headingCounter = 0;

  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        // Heading detection
        if (trimmed.match(/^#{1,3}\s/)) {
          const level = trimmed.match(/^(#{1,3})\s/)[1].length;
          const text = trimmed.replace(/^#{1,3}\s/, '');
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const Tag = `h${Math.min(level + 1, 4)}`;
          return <Tag key={i} id={id}>{text}</Tag>;
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          return <blockquote key={i}>{trimmed.replace(/^>\s*/, '')}</blockquote>;
        }

        // Unordered list
        if (trimmed.match(/^[-•]\s/m)) {
          const items = trimmed.split('\n').filter((l) => l.trim().match(/^[-•]\s/));
          return <ul key={i}>{items.map((item, j) => <li key={j}>{item.replace(/^[-•]\s/, '')}</li>)}</ul>;
        }

        // Ordered list
        if (trimmed.match(/^\d+\.\s/m)) {
          const items = trimmed.split('\n').filter((l) => l.trim().match(/^\d+\.\s/));
          return <ol key={i}>{items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s/, '')}</li>)}</ol>;
        }

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={i} />;
        }

        // Regular paragraph (first one gets drop cap)
        if (i === 0) {
          return <p key={i} className="pd-drop-cap">{trimmed}</p>;
        }

        return <p key={i}>{trimmed}</p>;
      })}
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const articleRef = useRef(null);
  const isMounted = useRef(true);
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1200;
  const readingProgress = useReadingProgress();

  // ── Fetch post data ─────────────────────────────────
  const fetchPost = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await postsAPI.getBySlug(slug);
      if (!isMounted.current) return;

      const data = res.data;
      setPost(data);
      setLikeCount(data.like_count || 0);
      setRelatedPosts(data.related_posts || []);
      setPrevPost(data.prev_post || null);
      setNextPost(data.next_post || null);

      // Load bookmark state from localStorage
      const savedBookmarks = JSON.parse(localStorage.getItem('altuvera_bookmarks') || '[]');
      setBookmarked(savedBookmarks.includes(slug));

      // Load liked state from localStorage
      const savedLikes = JSON.parse(localStorage.getItem('altuvera_likes') || '[]');
      setLiked(savedLikes.includes(slug));
    } catch (err) {
      if (!isMounted.current) return;
      if (err.message.includes('404')) {
        setNotFound(true);
      } else {
        setError(err.message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [slug]);

  // ── Fetch comments ──────────────────────────────────
  const fetchComments = useCallback(async () => {
    try {
      const res = await postsAPI.getComments(slug);
      if (isMounted.current) setComments(res.data || []);
    } catch {
      // Silently fail — comments are secondary
    }
  }, [slug]);

  useEffect(() => {
    isMounted.current = true;
    fetchPost();
    fetchComments();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted.current = false; };
  }, [fetchPost, fetchComments]);

  // ── Back to top ─────────────────────────────────────
  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // ── Extract headings from content for TOC ───────────
  const headings = useMemo(() => {
    if (!post?.content) return [];
    const matches = [];
    const lines = post.content.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      // Check for section headers (lines that look like titles)
      if (trimmed.length > 10 && trimmed.length < 80 && trimmed.endsWith(':')) {
        const text = trimmed.replace(/:$/, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        matches.push({ id, text });
      }
    });
    // If no colon-style headers found, create generic ones
    if (matches.length === 0 && post.content.length > 500) {
      return [
        { id: 'article-start', text: 'Introduction' },
        { id: 'article-main', text: 'Main Content' },
        { id: 'article-end', text: 'Conclusion' },
      ];
    }
    return matches;
  }, [post]);

  // ── Like handler ────────────────────────────────────
  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));

    // Save to localStorage
    const savedLikes = JSON.parse(localStorage.getItem('altuvera_likes') || '[]');
    if (newLiked) {
      localStorage.setItem('altuvera_likes', JSON.stringify([...savedLikes, slug]));
    } else {
      localStorage.setItem('altuvera_likes', JSON.stringify(savedLikes.filter((s) => s !== slug)));
    }

    // Send to API
    try {
      await postsAPI.toggleLike(slug, newLiked ? 'like' : 'unlike');
    } catch {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  // ── Bookmark handler ────────────────────────────────
  const handleBookmark = () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    const saved = JSON.parse(localStorage.getItem('altuvera_bookmarks') || '[]');
    if (newBookmarked) {
      localStorage.setItem('altuvera_bookmarks', JSON.stringify([...saved, slug]));
    } else {
      localStorage.setItem('altuvera_bookmarks', JSON.stringify(saved.filter((s) => s !== slug)));
    }
  };

  // ── Comment submit ──────────────────────────────────
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentName.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await postsAPI.addComment(slug, {
        author_name: commentName.trim(),
        content: commentText.trim(),
      });
      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
      }
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // ── Reading info ────────────────────────────────────
  const readingInfo = post ? getReadingLabel(post.read_time) : null;
  const estimatedMin = post ? parseInt(post.read_time) || 5 : 5;
  const minutesLeft = Math.max(0, Math.round(estimatedMin * (1 - readingProgress / 100)));

  // ── Format date ─────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks}w ago`;
      return formatDate(dateStr);
    } catch { return ''; }
  };

  // ── Render states ───────────────────────────────────
  if (notFound) {
    return (
      <>
        <Helmet><title>Article Not Found | Altuvera</title><meta name="robots" content="noindex, follow" /></Helmet>
        <NotFound />
      </>
    );
  }

  if (error && !post) {
    return (
      <>
        <Helmet><title>Error | Altuvera</title></Helmet>
        <div style={{ backgroundColor: 'var(--pd-off-white)' }}>
          <style>{globalStyles}</style>
          <ErrorState error={error} onRetry={fetchPost} />
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--pd-off-white)' }}>
        <style>{globalStyles}</style>
        <div className="pd-progress-bar" style={{ width: '30%', animation: 'shimmer 2s infinite' }} />
        <PostDetailSkeleton isMobile={isMobile} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={{ backgroundColor: 'var(--pd-off-white)' }}>
      <Helmet>
        <title>{`${post.meta_title || post.title} | Altuvera`}</title>
        <meta name="description" content={toMetaDescription(post.meta_description || post.excerpt || '')} />
        <link rel="canonical" href={toAbsoluteUrl(`/post/${slug}`)} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Altuvera`} />
        <meta property="og:description" content={toMetaDescription(post.excerpt || '')} />
        <meta property="og:url" content={toAbsoluteUrl(`/post/${slug}`)} />
        <meta property="og:image" content={post.image_url || getBrandLogoUrl()} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Altuvera`} />
        <meta name="twitter:description" content={toMetaDescription(post.excerpt || '')} />
        <meta name="twitter:image" content={post.image_url || getBrandLogoUrl()} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title,
          description: post.excerpt, image: post.image_url ? [post.image_url] : undefined,
          datePublished: post.published_at, dateModified: post.updated_at,
          author: post.author_name ? { '@type': 'Person', name: post.author_name } : undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': toAbsoluteUrl(`/post/${slug}`) },
          publisher: { '@type': 'Organization', name: 'Altuvera', logo: { '@type': 'ImageObject', url: getBrandLogoUrl() } },
          wordCount: post.content ? post.content.split(/\s+/).length : undefined,
          articleSection: post.category,
          keywords: post.tags ? post.tags.join(', ') : undefined,
        })}</script>
      </Helmet>
      <style>{globalStyles}</style>

      {/* Progress Bar */}
      <div className="pd-progress-bar" style={{ width: `${readingProgress}%` }} />

      {/* Main Section */}
      <section style={{ padding: isMobile ? '24px 16px 60px' : '48px 24px 100px' }}>
        <div className="pd-layout" style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 280px' : '1fr', gap: 40, maxWidth: 1200, margin: '0 auto', alignItems: 'start' }}>

          {/* ══════════ MAIN CONTENT ══════════ */}
          <div className="pd-content-wrapper">
            <AnimatedSection animation="fadeInUp">
              {/* Back link */}
              <Link to="/posts" className="pd-back-link pd-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginBottom: 32, padding: '8px 18px', backgroundColor: '#ECFDF5', borderRadius: 'var(--pd-radius-full)', transition: 'all 0.3s', border: '1px solid #D1FAE5' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; e.currentTarget.style.transform = 'translateX(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ECFDF5'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <FiArrowLeft size={16} /> Back to Journal
              </Link>

              {/* Header */}
              <header style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  {post.category && <Pill variant="green" icon={<FiTag size={11} />}>{post.category}</Pill>}
                  {readingInfo && <Pill variant="outline" size="sm" icon={readingInfo.icon}><span style={{ color: readingInfo.color }}>{readingInfo.label}</span></Pill>}
                  {post.is_featured && <Pill variant="solid" size="sm" icon={<FiStar size={11} />}>Featured</Pill>}
                </div>

                <h1 className="pd-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, color: '#111827', marginBottom: 24, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                  {post.title}
                </h1>

                {/* Meta row */}
                <div className="pd-meta-row" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt={post.author_name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '3px solid #D1FAE5' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 700, fontSize: 18 }}>
                        {(post.author_name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{post.author_name || 'Altuvera Team'}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>Travel Writer</div>
                    </div>
                  </div>
                  <div style={{ width: 1, height: 32, backgroundColor: '#E5E7EB', display: isMobile ? 'none' : 'block' }} />
                  {[
                    { icon: <FiCalendar size={14} />, text: formatDate(post.published_at || post.created_at) },
                    { icon: <FiClock size={14} />, text: post.read_time || '5 min read' },
                    { icon: <FiEye size={14} />, text: `${(post.view_count || 0).toLocaleString()} views` },
                  ].map((item, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
                      {item.icon} {item.text}
                    </span>
                  ))}
                </div>
              </header>

              {/* Featured Image */}
              {post.image_url && (
                <div style={{ position: 'relative', marginBottom: 40, borderRadius: 'var(--pd-radius-xl)', overflow: 'hidden', boxShadow: 'var(--pd-shadow-lg)' }}>
                  <img src={post.image_url} alt={post.title} className="pd-hero-image"
                    style={{ width: '100%', height: isMobile ? 300 : 480, objectFit: 'cover', display: 'block', transition: 'transform 0.6s var(--pd-transition)' }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(transparent,rgba(0,0,0,0.3))', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 16, right: 16, padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: 'var(--pd-radius-full)', color: 'white', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiClock size={12} />{minutesLeft > 0 ? `${minutesLeft} min left` : 'Finished'}
                  </div>
                </div>
              )}

              {/* Article Content */}
              <article ref={articleRef} className="pd-article-content" id="article-start">
                <RenderContent content={post.content} />
              </article>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="pd-tags-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40, marginBottom: 40, paddingTop: 32, borderTop: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}><FiHash size={14} /> Tags:</span>
                  {post.tags.map((tag, i) => (
                    <Link key={i} to={`/posts?tag=${tag}`}
                      style={{ padding: '6px 16px', backgroundColor: '#ECFDF5', borderRadius: 'var(--pd-radius-full)', fontSize: 13, color: '#059669', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', border: '1px solid #D1FAE5' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#D1FAE5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ECFDF5'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share Section */}
              <div className="pd-share-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '28px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: 40, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Share this article</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { icon: <FiTwitter size={16} />, label: 'Twitter' },
                      { icon: <FiFacebook size={16} />, label: 'Facebook' },
                      { icon: <FiLinkedin size={16} />, label: 'LinkedIn' },
                      { icon: <FiMail size={16} />, label: 'Email' },
                    ].map((p) => <IconBtn key={p.label} icon={p.icon} label={`Share on ${p.label}`} variant="outline" size={40} tooltip={p.label} />)}
                    <IconBtn icon={<FiShare2 size={16} />} label="Share" variant="outline" size={40} tooltip="More" onClick={() => setShowShareModal(true)} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={handleLike} className="pd-focus" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--pd-radius-full)', border: liked ? '2px solid #EF4444' : '2px solid #E5E7EB', backgroundColor: liked ? '#FEF2F2' : 'white', color: liked ? '#EF4444' : '#6B7280', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.3s' }}>
                    <FiHeart size={16} fill={liked ? '#EF4444' : 'none'} style={{ animation: liked ? 'heartBeat 0.6s ease' : 'none' }} />{likeCount}
                  </button>
                  <IconBtn icon={<FiPrinter size={16} />} label="Print" variant="outline" size={40} tooltip="Print" onClick={() => window.print()} />
                </div>
              </div>

              {/* Author Card */}
              <div className="pd-author-card" style={{ display: 'flex', gap: 24, padding: 32, backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', border: '1px solid #F3F4F6', boxShadow: 'var(--pd-shadow-sm)', marginBottom: 40 }}>
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="pd-author-avatar-lg" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '4px solid #D1FAE5', flexShrink: 0 }} />
                ) : (
                  <div className="pd-author-avatar-lg" style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 700, fontSize: 28, flexShrink: 0 }}>
                    {(post.author_name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <Pill variant="green" size="sm">Author</Pill>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 10, marginBottom: 6 }}>{post.author_name || 'Altuvera Team'}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                    Passionate travel writer and explorer dedicated to sharing authentic East African experiences.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/posts" className="pd-btn-primary pd-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 'var(--pd-radius-full)', fontSize: 13, textDecoration: 'none' }}><FiFeather size={14} /> All Articles</Link>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pd-comment-section" style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><FiMessageCircle size={20} /></div>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#111827' }}>Discussion ({comments.length})</h3>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Join the conversation</p>
                  </div>
                </div>

                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} style={{ marginBottom: 32 }}>
                  <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="Your name" className="pd-focus"
                    style={{ width: '100%', padding: '12px 18px', borderRadius: 'var(--pd-radius-md)', border: '2px solid #E5E7EB', backgroundColor: '#FAFDF7', fontSize: 14, color: '#374151', outline: 'none', fontFamily: "'Inter',sans-serif", marginBottom: 10, boxSizing: 'border-box', transition: 'border-color 0.3s' }}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; }} onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }} />
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Share your thoughts on this article..." className="pd-focus" rows={3}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 'var(--pd-radius-lg)', border: '2px solid #E5E7EB', backgroundColor: '#FAFDF7', fontSize: 14, color: '#374151', outline: 'none', resize: 'vertical', transition: 'border-color 0.3s', fontFamily: "'Inter',sans-serif", lineHeight: 1.6, boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="submit" className="pd-btn-primary pd-focus" disabled={!commentText.trim() || !commentName.trim() || commentSubmitting}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--pd-radius-full)', fontSize: 14, opacity: (commentText.trim() && commentName.trim() && !commentSubmitting) ? 1 : 0.5, cursor: (commentText.trim() && commentName.trim() && !commentSubmitting) ? 'pointer' : 'not-allowed' }}>
                      {commentSubmitting ? <><FiLoader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Posting...</> : <><FiSend size={14} /> Post Comment</>}
                    </button>
                  </div>
                </form>

                {/* Comments list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {comments.map((comment, i) => (
                    <div key={comment.id || i} style={{ display: 'flex', gap: 14, padding: '20px 24px', backgroundColor: 'white', borderRadius: 'var(--pd-radius-lg)', border: '1px solid #F3F4F6', animation: `slideUp 0.3s ease ${i * 0.05}s both`, transition: 'border-color 0.2s' }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#D1FAE5')} onMouseOut={(e) => (e.currentTarget.style.borderColor = '#F3F4F6')}>
                      {comment.author_avatar ? (
                        <img src={comment.author_avatar} alt={comment.author_name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ECFDF5', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {(comment.author_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginRight: 10 }}>{comment.author_name}</span>
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{formatRelativeTime(comment.created_at)}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 10 }}>{comment.content}</p>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#059669')} onMouseOut={(e) => (e.currentTarget.style.color = '#9CA3AF')}>
                            <FiThumbsUp size={12} /> {comment.like_count || 0}
                          </button>
                          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 12, fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#059669')} onMouseOut={(e) => (e.currentTarget.style.color = '#9CA3AF')}>
                            <FiCornerUpLeft size={12} /> Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>
                      <FiMessageCircle size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous / Next Navigation */}
              <div className="pd-nav-posts" style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
                {prevPost ? (
                  <Link to={`/post/${prevPost.slug}`} className="pd-card-hover pd-focus" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', backgroundColor: 'white', borderRadius: 'var(--pd-radius-lg)', border: '1px solid #F3F4F6', textDecoration: 'none', transition: 'all 0.3s' }}>
                    <FiChevronLeft size={20} color="#9CA3AF" />
                    <div><span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Previous</span><p className="pd-line-clamp-2" style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginTop: 4 }}>{prevPost.title}</p></div>
                  </Link>
                ) : <div style={{ flex: 1 }} />}
                {nextPost ? (
                  <Link to={`/post/${nextPost.slug}`} className="pd-card-hover pd-focus" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', backgroundColor: 'white', borderRadius: 'var(--pd-radius-lg)', border: '1px solid #F3F4F6', textDecoration: 'none', textAlign: 'right', justifyContent: 'flex-end', transition: 'all 0.3s' }}>
                    <div><span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Next</span><p className="pd-line-clamp-2" style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginTop: 4 }}>{nextPost.title}</p></div>
                    <FiChevronRight size={20} color="#9CA3AF" />
                  </Link>
                ) : <div style={{ flex: 1 }} />}
              </div>
            </AnimatedSection>
          </div>

          {/* ══════════ SIDEBAR ══════════ */}
          {isDesktop && (
            <aside className="pd-sidebar pd-sticky pd-scrollbar-thin" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <TableOfContents headings={headings} activeId={activeHeadingId} />
              <div style={{ backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', padding: '24px', border: '1px solid #F3F4F6', boxShadow: 'var(--pd-shadow-sm)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Quick Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { onClick: handleLike, icon: <FiHeart size={16} fill={liked ? '#EF4444' : 'none'} />, label: liked ? `Liked (${likeCount})` : `Like Article (${likeCount})`, bg: liked ? '#FEF2F2' : '#F9FAFB', color: liked ? '#EF4444' : '#6B7280' },
                    { onClick: handleBookmark, icon: <FiBookmark size={16} fill={bookmarked ? '#059669' : 'none'} />, label: bookmarked ? 'Saved' : 'Save for Later', bg: bookmarked ? '#ECFDF5' : '#F9FAFB', color: bookmarked ? '#059669' : '#6B7280' },
                    { onClick: () => setShowShareModal(true), icon: <FiShare2 size={16} />, label: 'Share', bg: '#F9FAFB', color: '#6B7280' },
                    { onClick: () => window.print(), icon: <FiPrinter size={16} />, label: 'Print', bg: '#F9FAFB', color: '#6B7280' },
                  ].map((a, i) => (
                    <button key={i} onClick={a.onClick} className="pd-focus" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--pd-radius-md)', border: 'none', backgroundColor: a.bg, color: a.color, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', textAlign: 'left' }}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', padding: '24px', border: '1px solid #F3F4F6', boxShadow: 'var(--pd-shadow-sm)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: `conic-gradient(#059669 ${readingProgress}%,#F3F4F6 ${readingProgress}%)`, position: 'relative' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#059669' }}>{Math.round(readingProgress)}%</div>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{minutesLeft > 0 ? `${minutesLeft} min remaining` : 'Finished reading'}</p>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ══════════ RELATED ARTICLES ══════════ */}
      {relatedPosts.length > 0 && (
        <section style={{ backgroundColor: '#F0FDF4', padding: isMobile ? '48px 16px' : '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <AnimatedSection animation="fadeInUp">
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Pill variant="solid" size="md" icon={<FiBookOpen size={12} />}>Related Reading</Pill>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? '24px' : '34px', fontWeight: 800, color: '#111827', marginTop: 20, marginBottom: 10, letterSpacing: '-0.02em' }}>More Articles You'll Love</h2>
                <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>Continue your journey with these related stories</p>
              </div>
            </AnimatedSection>
            <div className="pd-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {relatedPosts.map((relPost, index) => (
                <AnimatedSection key={relPost.id} animation="fadeInUp" delay={index * 0.1}>
                  <Link to={`/post/${relPost.slug}`} className="pd-card-hover pd-focus" style={{ display: 'block', backgroundColor: 'white', borderRadius: 'var(--pd-radius-xl)', overflow: 'hidden', boxShadow: 'var(--pd-shadow-sm)', textDecoration: 'none', border: '1px solid #E5E7EB', height: '100%' }}>
                    <div style={{ overflow: 'hidden', position: 'relative' }}>
                      <img src={relPost.image_url} alt={relPost.title} loading="lazy" style={{ height: 200, width: '100%', objectFit: 'cover', transition: 'transform 0.6s var(--pd-transition)', display: 'block' }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
                      {relPost.category && <div style={{ position: 'absolute', top: 12, left: 12 }}><Pill variant="green" size="sm" icon={<FiTag size={10} />}>{relPost.category}</Pill></div>}
                    </div>
                    <div style={{ padding: 24 }}>
                      <h3 className="pd-line-clamp-2" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 10, lineHeight: 1.35 }}>{relPost.title}</h3>
                      <p className="pd-line-clamp-2" style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{relPost.excerpt}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{formatDate(relPost.published_at)} · {relPost.read_time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 13, fontWeight: 600 }}>Read <FiArrowRight size={12} /></span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/posts" className="pd-btn-primary pd-focus" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 'var(--pd-radius-full)', fontSize: 16, textDecoration: 'none' }}><FiBookOpen size={18} /> View All Articles</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ FLOATING ACTIONS (Mobile) ══════════ */}
      {!isDesktop && (
        <div className="pd-floating-actions" style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100, animation: 'fadeUp 0.4s ease' }}>
          <IconBtn icon={<FiHeart size={18} fill={liked ? '#EF4444' : 'none'} />} label="Like" variant="solid" size={48} active={liked} onClick={handleLike} badge={likeCount > 0 ? likeCount : undefined} />
          <IconBtn icon={<FiBookmark size={18} fill={bookmarked ? '#059669' : 'none'} />} label="Bookmark" variant="solid" size={48} active={bookmarked} onClick={handleBookmark} />
          <IconBtn icon={<FiShare2 size={18} />} label="Share" variant="solid" size={48} onClick={() => setShowShareModal(true)} />
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && <ShareModal post={post} onClose={() => setShowShareModal(false)} />}

      {/* Back to Top */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="pd-btn-primary pd-focus" aria-label="Back to top"
          style={{ position: 'fixed', bottom: isDesktop ? 32 : 200, right: isDesktop ? 32 : 24, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99, animation: 'bounceIn 0.4s ease', padding: 0 }}>
          <FiArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default PostDetail;
