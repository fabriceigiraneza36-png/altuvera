// src/pages/PostDetail.jsx — Premium Green/White Redesign

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
import { getBrandLogoUrl, toAbsoluteUrl, toMetaDescription } from '../utils/seo';
import { apiFetch } from '../utils/apiBase';

/* ═══════════════════════════════════════════════════════
   API
   ═══════════════════════════════════════════════════════ */
const postsAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await apiFetch(endpoint, {
        ...options, signal: controller.signal,
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
        await new Promise(r => setTimeout(r, 1000));
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
   STYLES
   ═══════════════════════════════════════════════════════ */
const PD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --pd2-green-50:  #f0fdf4;
    --pd2-green-100: #dcfce7;
    --pd2-green-200: #bbf7d0;
    --pd2-green-300: #86efac;
    --pd2-green-500: #22c55e;
    --pd2-green-600: #059669;
    --pd2-green-700: #047857;
    --pd2-green-800: #065f46;
    --pd2-green-900: #064e3b;
  }

  .pd2-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #f0fdf4;
    min-height: 100vh;
  }

  /* ── Animations ── */
  @keyframes pd2-fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pd2-fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pd2-scaleIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
  @keyframes pd2-spin     { to{transform:rotate(360deg)} }
  @keyframes pd2-shimmer  { from{background-position:-200% 0} to{background-position:200% 0} }
  @keyframes pd2-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes pd2-heartbeat{ 0%{transform:scale(1)} 14%{transform:scale(1.28)} 28%{transform:scale(1)} 42%{transform:scale(1.28)} 70%{transform:scale(1)} }
  @keyframes pd2-progress { from{width:0} to{width:var(--pd2-progress,0%)} }
  @keyframes pd2-bounceIn { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.06)} 70%{transform:scale(0.94)} 100%{transform:scale(1);opacity:1} }

  .pd2-fadeup   { animation: pd2-fadeUp 0.46s ease both; }
  .pd2-scalein  { animation: pd2-scaleIn 0.3s ease both; }
  .pd2-spin     { animation: pd2-spin 0.85s linear infinite; }
  .pd2-bouncein { animation: pd2-bounceIn 0.4s ease; }

  /* ── Skeleton ── */
  .pd2-skeleton {
    background: linear-gradient(110deg,#d1fae5 8%,#ecfdf5 18%,#d1fae5 33%);
    background-size: 200% 100%;
    animation: pd2-shimmer 1.5s ease infinite;
    border-radius: 8px;
  }

  /* ── Reading progress bar ── */
  .pd2-progress-bar {
    position: fixed; top: 0; left: 0; height: 3px;
    background: linear-gradient(90deg,#059669,#4ade80,#86efac);
    z-index: 9999;
    box-shadow: 0 0 10px rgba(74,222,128,0.5);
    transition: width 0.12s linear;
  }

  /* ── Article content ── */
  .pd2-article {
    font-family: 'Inter', sans-serif;
    font-size: clamp(15px, 2vw, 18px);
    line-height: 1.9;
    color: #374151;
    letter-spacing: -0.008em;
  }
  .pd2-article p { margin-bottom: 1.8em; }
  .pd2-article h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px,3vw,28px); font-weight: 700;
    color: #064e3b; margin-top: 2.4em; margin-bottom: 0.7em;
    letter-spacing: -0.02em; line-height: 1.28;
    padding-left: 18px; position: relative;
  }
  .pd2-article h2::before {
    content: ''; position: absolute; left: 0; top: 4px; bottom: 4px;
    width: 4px; border-radius: 2px;
    background: linear-gradient(180deg, #059669, #4ade80);
  }
  .pd2-article h3 {
    font-size: clamp(17px,2.5vw,22px); font-weight: 700;
    color: #065f46; margin-top: 2em; margin-bottom: 0.6em;
  }
  .pd2-article blockquote {
    margin: 2em 0; padding: 22px 26px 22px 30px;
    background: linear-gradient(135deg,#f0fdf4,#dcfce7);
    border-radius: 18px; border-left: 4px solid #059669;
    font-style: italic; font-size: 1.06em;
    color: #065f46; line-height: 1.72; position: relative;
  }
  .pd2-article blockquote::before {
    content: '"'; position: absolute; top: -10px; left: 14px;
    font-family: 'Playfair Display', serif; font-size: 64px;
    color: #059669; opacity: 0.22; line-height: 1; pointer-events: none;
  }
  .pd2-article ul, .pd2-article ol { margin: 1.4em 0; padding-left: 22px; }
  .pd2-article li { margin-bottom: 0.55em; padding-left: 6px; }
  .pd2-article li::marker { color: #059669; font-weight: 700; }
  .pd2-article a { color: #059669; font-weight: 500; text-decoration: none; border-bottom: 1.5px solid rgba(5,150,105,0.22); transition: border-color 0.2s; }
  .pd2-article a:hover { border-bottom-color: #059669; }
  .pd2-article img { width: 100%; border-radius: 18px; margin: 2em 0; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
  .pd2-article code { font-family: 'JetBrains Mono', monospace; background: #f0fdf4; color: #065f46; padding: 2px 7px; border-radius: 5px; font-size: 0.87em; border: 1px solid #bbf7d0; }
  .pd2-article hr { border: none; height: 1px; background: linear-gradient(90deg,transparent,#bbf7d0,transparent); margin: 3em 0; }
  .pd2-article .drop-cap::first-letter {
    float: left; font-family: 'Playfair Display', serif;
    font-size: 4.2em; line-height: 0.78; margin-right: 12px; margin-top: 8px;
    color: #059669; font-weight: 800;
  }

  /* ── TOC ── */
  .pd2-toc-link {
    display: block; padding: 7px 12px; font-size: 13px;
    font-weight: 400; text-decoration: none;
    border-radius: 10px; border-left: 3px solid transparent;
    transition: all 0.18s; line-height: 1.45; margin-bottom: 2px;
    color: #6b7280;
  }
  .pd2-toc-link:hover { color: #059669; background: #f0fdf4; }
  .pd2-toc-link.active {
    color: #059669; font-weight: 700;
    background: linear-gradient(135deg,#f0fdf4,#ecfdf5);
    border-left-color: #059669;
  }

  /* ── Comment card hover ── */
  .pd2-comment-card {
    background: white; border-radius: 18px;
    border: 1px solid #d1fae5;
    padding: 20px 22px; transition: all 0.2s;
  }
  .pd2-comment-card:hover { border-color: #a7f3d0; box-shadow: 0 4px 18px rgba(5,150,105,0.09); }

  /* ── Related card ── */
  .pd2-related-card {
    background: white; border-radius: 22px;
    border: 1px solid #dcfce7; overflow: hidden;
    text-decoration: none; color: inherit;
    display: flex; flex-direction: column;
    transition: all 0.32s ease;
    box-shadow: 0 2px 12px rgba(5,150,105,0.06);
  }
  .pd2-related-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 52px rgba(5,150,105,0.15);
    border-color: #a7f3d0;
  }
  .pd2-related-img { transition: transform 0.6s ease; }
  .pd2-related-card:hover .pd2-related-img { transform: scale(1.06); }

  /* ── CTA button ── */
  .pd2-cta {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 28px; border-radius: 14px;
    background: linear-gradient(135deg,#059669,#065f46);
    color: white; border: none; font-size: 14.5px; font-weight: 700;
    cursor: pointer; text-decoration: none; transition: all 0.25s ease;
    box-shadow: 0 6px 24px rgba(5,150,105,0.28); font-family: 'Inter',sans-serif;
    position: relative; overflow: hidden;
  }
  .pd2-cta::before {
    content: ''; position: absolute; top:50%; left:50%;
    width: 0; height: 0; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transform: translate(-50%,-50%); transition: width 0.5s, height 0.5s;
  }
  .pd2-cta:hover::before { width: 350px; height: 350px; }
  .pd2-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 38px rgba(5,150,105,0.38); }
  .pd2-cta:active { transform: translateY(0); }

  /* ── Hide scroll ── */
  .pd2-hide-scroll { scrollbar-width: none; }
  .pd2-hide-scroll::-webkit-scrollbar { display: none; }

  /* ── Responsive ── */
  @media (max-width: 1200px) {
    .pd2-sidebar { display: none !important; }
    .pd2-content { max-width: 720px !important; margin: 0 auto !important; }
  }
  @media (max-width: 768px) {
    .pd2-hero-img { height: 280px !important; border-radius: 16px !important; }
    .pd2-title { font-size: 26px !important; }
    .pd2-meta-row { flex-direction: column !important; gap: 10px !important; }
    .pd2-share-bar { flex-direction: column !important; gap: 14px !important; }
    .pd2-author-card { flex-direction: column !important; text-align: center !important; }
    .pd2-related-grid { grid-template-columns: 1fr !important; }
    .pd2-nav-row { flex-direction: column !important; }
  }
  @media (max-width: 480px) {
    .pd2-hero-img { height: 220px !important; }
    .pd2-title { font-size: 22px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    .pd2-progress-bar { display: none; }
  }
  @media print {
    .pd2-sidebar, .pd2-floating-actions, .pd2-progress-bar,
    .pd2-share-bar, .pd2-comment-section, .pd2-nav-row { display: none !important; }
    .pd2-article { font-size: 13px; color: black; }
  }
`;

let _pd2StylesInjected = false;
function injectPD2Styles() {
  if (_pd2StylesInjected || typeof document === 'undefined') return;
  if (document.getElementById('pd2-styles')) { _pd2StylesInjected = true; return; }
  const s = document.createElement('style');
  s.id = 'pd2-styles';
  s.textContent = PD_STYLES;
  document.head.appendChild(s);
  _pd2StylesInjected = true;
}

/* ═══════════════════════════════════════════════════════
   HOOKS
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
    const h = () => {
      const el = document.documentElement;
      const st = el.scrollTop || document.body.scrollTop;
      const sh = el.scrollHeight - el.clientHeight;
      setProgress(sh > 0 ? (st / sh) * 100 : 0);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return progress;
};

/* ═══════════════════════════════════════════════════════
   READING LABEL
   ═══════════════════════════════════════════════════════ */
const getReadingLabel = (readTime) => {
  const min = parseInt(readTime) || 5;
  if (min <= 3) return { icon: <FiZap size={13} />, label: 'Quick Read', color: '#059669' };
  if (min <= 7) return { icon: <FiCoffee size={13} />, label: 'Medium Read', color: '#0891b2' };
  return { icon: <FiBookOpen size={13} />, label: 'Long Read', color: '#7c3aed' };
};

/* ═══════════════════════════════════════════════════════
   SECTION LABEL (matches PackageDetail)
   ═══════════════════════════════════════════════════════ */
function SectionLabel({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg,#059669,#065f46)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(17px,2.5vw,22px)', fontWeight: 700, color: '#064e3b', margin: 0 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TABLE OF CONTENTS
   ═══════════════════════════════════════════════════════ */
function TableOfContents({ headings, activeId }) {
  if (!headings?.length) return null;
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '22px 20px', border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}>
      <SectionLabel icon={FiList} title="Contents" />
      <nav>
        {headings.map((h, i) => (
          <a key={i} href={`#${h.id}`} className={`pd2-toc-link ${activeId === h.id ? 'active' : ''}`}>
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════ */
function ShareModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const platforms = [
    { name: 'Twitter',  icon: <FiTwitter size={20} />,  color: '#1DA1F2', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: <FiFacebook size={20} />, color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', icon: <FiLinkedin size={20} />, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'Email',    icon: <FiMail size={20} />,     color: '#059669', url: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = () => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(4,47,31,0.45)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, animation: 'pd2-fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 24, padding: 'clamp(24px,4vw,40px)', maxWidth: 440, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.22)', animation: 'pd2-scaleIn 0.3s ease' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#064e3b', margin: 0 }}>Share Article</h3>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'} onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}>
            <FiX size={16} color="#6b7280" />
          </button>
        </div>

        <p style={{ fontSize: 13.5, color: '#9ca3af', marginBottom: 24, lineHeight: 1.55 }}>
          Share "<strong style={{ color: '#374151' }}>{post.title}</strong>" with your network
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {platforms.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '14px 8px', borderRadius: 14, border: '1.5px solid #e5e7eb', textDecoration: 'none', color: '#374151', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.color = p.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {p.icon}
              <span style={{ fontSize: 11, fontWeight: 600 }}>{p.name}</span>
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={shareUrl} readOnly
            style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1.5px solid #d1fae5', background: '#f9fffe', fontSize: 12.5, color: '#9ca3af', outline: 'none', fontFamily: 'inherit' }}
          />
          <button onClick={copyLink}
            style={{ padding: '11px 18px', borderRadius: 12, background: copied ? 'linear-gradient(135deg,#059669,#065f46)' : '#f0fdf4', border: '1.5px solid #a7f3d0', color: copied ? 'white' : '#059669', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {copied ? <><FiCheck size={13} /> Copied!</> : <><FiCopy size={13} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTENT RENDERER
   ═══════════════════════════════════════════════════════ */
const RenderContent = ({ content }) => {
  if (!content) return null;
  const blocks = content.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const t = block.trim();
        if (t.match(/^#{1,3}\s/)) {
          const level = t.match(/^(#{1,3})\s/)[1].length;
          const text  = t.replace(/^#{1,3}\s/, '');
          const id    = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const Tag   = `h${Math.min(level + 1, 4)}`;
          return <Tag key={i} id={id}>{text}</Tag>;
        }
        if (t.startsWith('>')) return <blockquote key={i}>{t.replace(/^>\s*/, '')}</blockquote>;
        if (t.match(/^[-•]\s/m)) {
          const items = t.split('\n').filter(l => l.trim().match(/^[-•]\s/));
          return <ul key={i}>{items.map((item, j) => <li key={j}>{item.replace(/^[-•]\s/, '')}</li>)}</ul>;
        }
        if (t.match(/^\d+\.\s/m)) {
          const items = t.split('\n').filter(l => l.trim().match(/^\d+\.\s/));
          return <ol key={i}>{items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s/, '')}</li>)}</ol>;
        }
        if (t === '---' || t === '***') return <hr key={i} />;
        return <p key={i} className={i === 0 ? 'drop-cap' : ''}>{t}</p>;
      })}
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════════════════ */
function PostSkeleton() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,24px) 80px' }}>
      {[140, 90, '100%', '80%'].map((w, i) => (
        <div key={i} className="pd2-skeleton" style={{ width: w, height: i < 2 ? 32 : 20, marginBottom: i < 2 ? 16 : 12 }} />
      ))}
      <div className="pd2-skeleton" style={{ width: '100%', height: 380, borderRadius: 20, margin: '28px 0' }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="pd2-skeleton" style={{ width: `${95 - i * 4}%`, height: 16, marginBottom: 13 }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NOT FOUND / ERROR
   ═══════════════════════════════════════════════════════ */
function NotFoundState({ message }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40, textAlign: 'center' }}>
      <div style={{ width: 100, height: 100, borderRadius: 28, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pd2-float 3s ease infinite' }}>
        <FiFeather size={44} color="#059669" />
      </div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,44px)', color: '#064e3b', marginBottom: 14, letterSpacing: '-0.02em' }}>
        Article Not Found
      </h1>
      <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 32, maxWidth: 380, lineHeight: 1.65 }}>
        {message || "The article you're looking for doesn't exist or has been moved."}
      </p>
      <Link to="/posts" className="pd2-cta">
        <FiArrowLeft size={16} /> Back to Journal
      </Link>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40, textAlign: 'center' }}>
      <FiAlertCircle size={52} color="#f87171" style={{ marginBottom: 20 }} />
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: '#064e3b', marginBottom: 10 }}>
        Something Went Wrong
      </h2>
      <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 28, maxWidth: 380, lineHeight: 1.65 }}>{error}</p>
      <button onClick={onRetry} className="pd2-cta">
        <FiRefreshCw size={15} /> Try Again
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const PostDetail = () => {
  const { slug } = useParams();

  const [post,         setPost]         = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevPost,     setPrevPost]     = useState(null);
  const [nextPost,     setNextPost]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [notFound,     setNotFound]     = useState(false);

  const [liked,          setLiked]          = useState(false);
  const [likeCount,      setLikeCount]      = useState(0);
  const [bookmarked,     setBookmarked]     = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackToTop,  setShowBackToTop]  = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const [comments,          setComments]          = useState([]);
  const [commentText,       setCommentText]       = useState('');
  const [commentName,       setCommentName]       = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const articleRef = useRef(null);
  const isMounted  = useRef(true);
  const windowWidth = useWindowSize();
  const isMobile   = windowWidth < 768;
  const isDesktop  = windowWidth >= 1200;
  const progress   = useReadingProgress();

  useEffect(() => { injectPD2Styles(); }, []);

  /* ── Fetch post ── */
  const fetchPost = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true); setError(null); setNotFound(false);
    try {
      const res  = await postsAPI.getBySlug(slug);
      if (!isMounted.current) return;
      const data = res.data;
      setPost(data);
      setLikeCount(data.like_count || 0);
      setRelatedPosts(data.related_posts || []);
      setPrevPost(data.prev_post || null);
      setNextPost(data.next_post || null);
      try {
        const bm = JSON.parse(localStorage.getItem('altuvera_bookmarks') || '[]');
        setBookmarked(bm.includes(slug));
        const lk = JSON.parse(localStorage.getItem('altuvera_likes') || '[]');
        setLiked(lk.includes(slug));
      } catch {}
    } catch (err) {
      if (!isMounted.current) return;
      if (err.message.includes('404')) setNotFound(true);
      else setError(err.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [slug]);

  /* ── Fetch comments ── */
  const fetchComments = useCallback(async () => {
    try {
      const res = await postsAPI.getComments(slug);
      if (isMounted.current) setComments(res.data || []);
    } catch {}
  }, [slug]);

  useEffect(() => {
    isMounted.current = true;
    fetchPost(); fetchComments();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted.current = false; };
  }, [fetchPost, fetchComments]);

  /* ── Back to top ── */
  useEffect(() => {
    const h = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  /* ── Headings for TOC ── */
  const headings = useMemo(() => {
    if (!post?.content) return [];
    const matches = [];
    post.content.split('\n').forEach(line => {
      const t = line.trim();
      if (t.length > 10 && t.length < 80 && t.endsWith(':')) {
        const text = t.replace(/:$/, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        matches.push({ id, text });
      }
    });
    if (!matches.length && post.content.length > 500) {
      return [{ id: 'article-start', text: 'Introduction' }, { id: 'article-main', text: 'Main Content' }];
    }
    return matches;
  }, [post]);

  /* ── Like ── */
  const handleLike = async () => {
    const nv = !liked;
    setLiked(nv); setLikeCount(c => nv ? c + 1 : Math.max(0, c - 1));
    try {
      const lk = JSON.parse(localStorage.getItem('altuvera_likes') || '[]');
      localStorage.setItem('altuvera_likes', JSON.stringify(nv ? [...lk, slug] : lk.filter(s => s !== slug)));
      await postsAPI.toggleLike(slug, nv ? 'like' : 'unlike');
    } catch {
      setLiked(!nv); setLikeCount(c => nv ? c - 1 : c + 1);
    }
  };

  /* ── Bookmark ── */
  const handleBookmark = () => {
    const nv = !bookmarked; setBookmarked(nv);
    try {
      const saved = JSON.parse(localStorage.getItem('altuvera_bookmarks') || '[]');
      localStorage.setItem('altuvera_bookmarks', JSON.stringify(nv ? [...saved, slug] : saved.filter(s => s !== slug)));
    } catch {}
  };

  /* ── Comment submit ── */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !commentName.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await postsAPI.addComment(slug, { author_name: commentName.trim(), content: commentText.trim() });
      if (res.data) setComments(prev => [res.data, ...prev]);
      setCommentText('');
    } catch (err) { console.error(err.message); }
    finally { setCommentSubmitting(false); }
  };

  const readingInfo = post ? getReadingLabel(post.read_time) : null;
  const estimatedMin = post ? parseInt(post.read_time) || 5 : 5;
  const minutesLeft = Math.max(0, Math.round(estimatedMin * (1 - progress / 100)));

  const fmtDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return d; }
  };

  const fmtRelative = (d) => {
    if (!d) return '';
    try {
      const diff = Date.now() - new Date(d).getTime();
      const min = Math.floor(diff / 60000);
      if (min < 1) return 'Just now';
      if (min < 60) return `${min}m ago`;
      const h = Math.floor(min / 60);
      if (h < 24) return `${h}h ago`;
      const days = Math.floor(h / 24);
      if (days < 7) return `${days}d ago`;
      return fmtDate(d);
    } catch { return ''; }
  };

  /* ── Render states ── */
  if (notFound) {
    return (
      <div className="pd2-root">
        <style>{PD_STYLES}</style>
        <Helmet><title>Article Not Found | Altuvera</title><meta name="robots" content="noindex,follow" /></Helmet>
        <NotFoundState />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="pd2-root">
        <style>{PD_STYLES}</style>
        <ErrorState error={error} onRetry={fetchPost} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pd2-root">
        <style>{PD_STYLES}</style>
        <div className="pd2-progress-bar" style={{ width: '28%' }} />
        <PostSkeleton />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="pd2-root">
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
          '@context': 'https://schema.org', '@type': 'BlogPosting',
          headline: post.title, description: post.excerpt,
          image: post.image_url ? [post.image_url] : undefined,
          datePublished: post.published_at, dateModified: post.updated_at,
          author: post.author_name ? { '@type': 'Person', name: post.author_name } : undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': toAbsoluteUrl(`/post/${slug}`) },
          publisher: { '@type': 'Organization', name: 'Altuvera', logo: { '@type': 'ImageObject', url: getBrandLogoUrl() } },
        })}</script>
      </Helmet>

      {/* Progress bar */}
      <div className="pd2-progress-bar" style={{ width: `${progress}%` }} />

      {/* ── HERO BANNER ── */}
      {post.image_url && (
        <div style={{ position: 'relative', height: 'clamp(280px,40vh,520px)', overflow: 'hidden' }}>
          <img
            src={post.image_url} alt={post.title}
            className="pd2-hero-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 8s ease' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(2,44,22,0.15) 0%,rgba(4,47,31,0.52) 55%,rgba(1,30,15,0.82) 100%)' }} />

          {/* Hero meta overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: 'clamp(20px,4vw,48px)',
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {post.category && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 50, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  <FiTag size={11} /> {post.category}
                </span>
              )}
              {post.is_featured && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 50, background: 'rgba(245,158,11,0.8)', color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  <FiStar size={11} /> Featured
                </span>
              )}
              {readingInfo && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 50, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600 }}>
                  {readingInfo.icon} {readingInfo.label}
                </span>
              )}
            </div>

            <h1 className="pd2-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(24px,4vw,48px)', fontWeight: 900, color: 'white',
              lineHeight: 1.12, letterSpacing: '-0.025em',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)', maxWidth: 800,
            }}>
              {post.title}
            </h1>

            {/* Time remaining */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', width: 'fit-content', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>
              <FiClock size={11} />
              {minutesLeft > 0 ? `${minutesLeft} min read` : 'Finished'}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,32px) 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 280px' : '1fr', gap: 36, alignItems: 'flex-start' }}>

          {/* ══ LEFT: Article ══ */}
          <div className="pd2-content">

            {/* Back link */}
            <Link
              to="/posts"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: 13.5,
                marginBottom: 28, padding: '8px 18px',
                background: '#f0fdf4', borderRadius: 50,
                border: '1.5px solid #a7f3d0', transition: 'all 0.22s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.transform = 'translateX(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <FiArrowLeft size={15} /> Back to Journal
            </Link>

            {/* If no hero image, show title here */}
            {!post.image_url && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                  {post.category && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 16px', borderRadius: 50, background: '#f0fdf4', border: '1.5px solid #a7f3d0', color: '#059669', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      <FiTag size={11} /> {post.category}
                    </span>
                  )}
                  {post.is_featured && (
                    <span style={{ padding: '6px 16px', borderRadius: 50, background: 'linear-gradient(135deg,#d97706,#b45309)', color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <h1 className="pd2-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#064e3b', lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: 0 }}>
                  {post.title}
                </h1>
              </div>
            )}

            {/* Meta row */}
            <div
              className="pd2-meta-row"
              style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 32, padding: '18px 22px', background: 'white', borderRadius: 18, border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #a7f3d0' }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 17 }}>
                    {(post.author_name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#064e3b', margin: 0 }}>{post.author_name || 'Altuvera Team'}</p>
                  <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Travel Writer</p>
                </div>
              </div>

              <div style={{ width: 1, height: 32, background: '#d1fae5' }} />

              {[
                { icon: <FiCalendar size={13} />, text: fmtDate(post.published_at || post.created_at) },
                { icon: <FiClock size={13} />,    text: post.read_time || '5 min read' },
                { icon: <FiEye size={13} />,      text: `${(post.view_count || 0).toLocaleString()} views` },
              ].map((m, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
                  {m.icon} {m.text}
                </span>
              ))}
            </div>

            {/* Article body */}
            <article ref={articleRef} className="pd2-article" id="article-start">
              <RenderContent content={post.content} />
            </article>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 36, paddingTop: 28, borderTop: '1px solid #d1fae5' }}>
                <span style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginRight: 4 }}>
                  <FiHash size={13} /> Tags:
                </span>
                {post.tags.map((tag, i) => (
                  <Link key={i} to={`/posts?tag=${tag}`}
                    style={{ padding: '5px 14px', background: '#f0fdf4', borderRadius: 50, fontSize: 12.5, color: '#059669', fontWeight: 500, textDecoration: 'none', border: '1.5px solid #a7f3d0', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share bar */}
            <div
              className="pd2-share-bar"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '22px 0', borderTop: '1px solid #d1fae5', borderBottom: '1px solid #d1fae5', margin: '32px 0', flexWrap: 'wrap' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#064e3b' }}>Share</span>
                <div style={{ display: 'flex', gap: 7 }}>
                  {[
                    { icon: <FiTwitter size={15} />,  label: 'Twitter',  url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                    { icon: <FiFacebook size={15} />, label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                    { icon: <FiLinkedin size={15} />, label: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                  ].map(p => (
                    <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
                      style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1.5px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}>
                      {p.icon}
                    </a>
                  ))}
                  <button onClick={() => setShowShareModal(true)}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1.5px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}>
                    <FiShare2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleLike}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 50, border: `1.5px solid ${liked ? '#fca5a5' : '#d1fae5'}`, background: liked ? '#fef2f2' : '#f0fdf4', color: liked ? '#ef4444' : '#059669', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, transition: 'all 0.25s', fontFamily: 'inherit' }}>
                  <FiHeart size={15} fill={liked ? '#ef4444' : 'none'} style={{ transition: 'all 0.3s' }} />
                  {likeCount}
                </button>
                <button onClick={handleBookmark}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 50, border: `1.5px solid ${bookmarked ? '#a7f3d0' : '#d1fae5'}`, background: bookmarked ? '#f0fdf4' : 'white', color: bookmarked ? '#059669' : '#6b7280', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, transition: 'all 0.25s', fontFamily: 'inherit' }}>
                  <FiBookmark size={15} fill={bookmarked ? '#059669' : 'none'} />
                  {bookmarked ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Author card */}
            <div
              className="pd2-author-card"
              style={{ display: 'flex', gap: 24, padding: 'clamp(20px,4vw,32px)', background: 'white', borderRadius: 22, border: '1px solid #d1fae5', boxShadow: '0 4px 20px rgba(5,150,105,0.07)', marginBottom: 36 }}
            >
              {post.author_avatar ? (
                <img src={post.author_avatar} alt={post.author_name}
                  style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid #a7f3d0', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 28, flexShrink: 0 }}>
                  {(post.author_name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 50, background: '#f0fdf4', border: '1px solid #a7f3d0', color: '#059669', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Author
                </span>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,3vw,22px)', fontWeight: 700, color: '#064e3b', marginBottom: 8 }}>
                  {post.author_name || 'Altuvera Team'}
                </h3>
                <p style={{ fontSize: 13.5, color: '#9ca3af', lineHeight: 1.65, marginBottom: 16 }}>
                  Passionate travel writer and explorer dedicated to sharing authentic East African experiences.
                </p>
                <Link to="/posts" className="pd2-cta" style={{ fontSize: 13 }}>
                  <FiFeather size={14} /> All Articles
                </Link>
              </div>
            </div>

            {/* Comments */}
            <div className="pd2-comment-section" style={{ marginBottom: 40 }}>
              <SectionLabel icon={FiMessageCircle} title={`Discussion (${comments.length})`} subtitle="Join the conversation" />

              {/* Comment form */}
              <form onSubmit={handleCommentSubmit} style={{ background: 'white', borderRadius: 20, border: '1px solid #d1fae5', padding: 'clamp(16px,3vw,24px)', marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 10 }}>
                  <input
                    value={commentName} onChange={e => setCommentName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #d1fae5', background: '#f9fffe', fontSize: 13.5, color: '#1f2937', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all 0.2s' }}
                    onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; }}
                    onBlur={e => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; }}
                  />
                  <textarea
                    value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this article…" rows={3}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #d1fae5', background: '#f9fffe', fontSize: 13.5, color: '#1f2937', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box', transition: 'all 0.2s' }}
                    onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'; }}
                    onBlur={e => { e.target.style.borderColor = '#d1fae5'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="pd2-cta" disabled={!commentText.trim() || !commentName.trim() || commentSubmitting}
                    style={{ fontSize: 13.5, padding: '10px 22px', opacity: (commentText.trim() && commentName.trim() && !commentSubmitting) ? 1 : 0.5, cursor: (commentText.trim() && commentName.trim() && !commentSubmitting) ? 'pointer' : 'not-allowed' }}>
                    {commentSubmitting ? <><FiLoader size={13} className="pd2-spin" /> Posting…</> : <><FiSend size={13} /> Post Comment</>}
                  </button>
                </div>
              </form>

              {/* Comment list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((c, i) => (
                  <div key={c.id || i} className="pd2-comment-card" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {c.author_avatar ? (
                        <img src={c.author_avatar} alt={c.author_name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d1fae5', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#059669,#065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                          {(c.author_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#064e3b' }}>{c.author_name}</span>
                          <span style={{ fontSize: 11.5, color: '#9ca3af' }}>{fmtRelative(c.created_at)}</span>
                        </div>
                        <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.65, marginBottom: 10 }}>{c.content}</p>
                        <div style={{ display: 'flex', gap: 14 }}>
                          {[
                            { icon: <FiThumbsUp size={12} />, label: c.like_count || 0 },
                            { icon: <FiCornerUpLeft size={12} />, label: 'Reply' },
                          ].map((btn, j) => (
                            <button key={j} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 12, fontWeight: 600, transition: 'color 0.18s', fontFamily: 'inherit' }}
                              onMouseOver={e => e.currentTarget.style.color = '#059669'} onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}>
                              {btn.icon} {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!comments.length && (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9ca3af' }}>
                    <FiMessageCircle size={34} style={{ marginBottom: 12, opacity: 0.35, display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14 }}>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Prev / Next nav */}
            <div className="pd2-nav-row" style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
              {prevPost ? (
                <Link to={`/post/${prevPost.slug}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'white', borderRadius: 18, border: '1px solid #d1fae5', textDecoration: 'none', transition: 'all 0.25s', boxShadow: '0 2px 10px rgba(5,150,105,0.06)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.12)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(5,150,105,0.06)'; }}>
                  <FiChevronLeft size={20} color="#a7f3d0" />
                  <div>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 3 }}>Previous</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#064e3b', lineHeight: 1.35, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prevPost.title}</p>
                  </div>
                </Link>
              ) : <div style={{ flex: 1 }} />}

              {nextPost ? (
                <Link to={`/post/${nextPost.slug}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'white', borderRadius: 18, border: '1px solid #d1fae5', textDecoration: 'none', textAlign: 'right', justifyContent: 'flex-end', transition: 'all 0.25s', boxShadow: '0 2px 10px rgba(5,150,105,0.06)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.12)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(5,150,105,0.06)'; }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 3 }}>Next</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#064e3b', lineHeight: 1.35, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{nextPost.title}</p>
                  </div>
                  <FiChevronRight size={20} color="#a7f3d0" />
                </Link>
              ) : <div style={{ flex: 1 }} />}
            </div>
          </div>

          {/* ══ RIGHT: Sidebar ══ */}
          {isDesktop && (
            <aside
              className="pd2-sidebar"
              style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <TableOfContents headings={headings} activeId={activeHeadingId} />

              {/* Quick actions */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #d1fae5', padding: '20px', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}>
                <SectionLabel icon={FiZap} title="Quick Actions" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { onClick: handleLike, icon: <FiHeart size={15} fill={liked ? '#ef4444' : 'none'} />, label: liked ? `Liked (${likeCount})` : `Like (${likeCount})`, bg: liked ? '#fef2f2' : '#f9fffe', color: liked ? '#ef4444' : '#6b7280', borderColor: liked ? '#fecaca' : '#d1fae5' },
                    { onClick: handleBookmark, icon: <FiBookmark size={15} fill={bookmarked ? '#059669' : 'none'} />, label: bookmarked ? 'Saved' : 'Save for Later', bg: bookmarked ? '#f0fdf4' : '#f9fffe', color: bookmarked ? '#059669' : '#6b7280', borderColor: bookmarked ? '#a7f3d0' : '#d1fae5' },
                    { onClick: () => setShowShareModal(true), icon: <FiShare2 size={15} />, label: 'Share Article', bg: '#f9fffe', color: '#6b7280', borderColor: '#d1fae5' },
                    { onClick: () => window.print(), icon: <FiPrinter size={15} />, label: 'Print', bg: '#f9fffe', color: '#6b7280', borderColor: '#d1fae5' },
                  ].map((a, i) => (
                    <button key={i} onClick={a.onClick}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${a.borderColor}`, background: a.bg, color: a.color, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s', textAlign: 'left', fontFamily: 'inherit' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateX(3px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading progress ring */}
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #d1fae5', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(5,150,105,0.06)' }}>
                <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 12px' }}>
                  <svg viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#d1fae5" strokeWidth="6" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke="url(#pd2-grad)" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 30}`}
                      strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                    />
                    <defs>
                      <linearGradient id="pd2-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#059669' }}>
                    {Math.round(progress)}%
                  </div>
                </div>
                <p style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 500, margin: 0 }}>
                  {minutesLeft > 0 ? `${minutesLeft} min remaining` : '🎉 Finished reading!'}
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ══ RELATED ARTICLES ══ */}
      {relatedPosts.length > 0 && (
        <section style={{ background: 'white', borderTop: '1px solid #d1fae5', padding: 'clamp(48px,8vw,96px) clamp(16px,3vw,32px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 18px', borderRadius: 50, background: 'linear-gradient(135deg,#059669,#065f46)', color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
                <FiBookOpen size={12} /> Related Reading
              </span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, color: '#064e3b', marginBottom: 10, letterSpacing: '-0.02em' }}>
                More Articles You'll Love
              </h2>
              <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
                Continue your journey with these related stories
              </p>
            </div>

            <div
              className="pd2-related-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}
            >
              {relatedPosts.map((rp, i) => (
                <Link key={rp.id} to={`/post/${rp.slug}`} className="pd2-related-card">
                  <div style={{ overflow: 'hidden', position: 'relative', height: 210, flexShrink: 0 }}>
                    <img src={rp.image_url} alt={rp.title} loading="lazy"
                      className="pd2-related-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,47,31,0.45), transparent)' }} />
                    {rp.category && (
                      <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 12px', borderRadius: 50, background: '#f0fdf4', color: '#059669', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {rp.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#064e3b', marginBottom: 10, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rp.title}
                    </h3>
                    <p style={{ fontSize: 13.5, color: '#9ca3af', lineHeight: 1.65, marginBottom: 16, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rp.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{fmtDate(rp.published_at)} · {rp.read_time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 12.5, fontWeight: 700 }}>
                        Read <FiArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/posts" className="pd2-cta">
                <FiBookOpen size={16} /> View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ FLOATING ACTIONS (mobile) ══ */}
      {!isDesktop && (
        <div
          className="pd2-floating-actions pd2-bouncein"
          style={{ position: 'fixed', bottom: 24, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}
        >
          {[
            { onClick: handleLike, icon: <FiHeart size={17} fill={liked ? '#ef4444' : 'none'} />, bg: liked ? '#fef2f2' : 'white', color: liked ? '#ef4444' : '#6b7280', border: liked ? '#fca5a5' : '#d1fae5', badge: likeCount > 0 ? likeCount : null },
            { onClick: handleBookmark, icon: <FiBookmark size={17} fill={bookmarked ? '#059669' : 'none'} />, bg: bookmarked ? '#f0fdf4' : 'white', color: bookmarked ? '#059669' : '#6b7280', border: bookmarked ? '#a7f3d0' : '#d1fae5' },
            { onClick: () => setShowShareModal(true), icon: <FiShare2 size={17} />, bg: 'white', color: '#6b7280', border: '#d1fae5' },
          ].map((btn, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <button onClick={btn.onClick}
                style={{ width: 48, height: 48, borderRadius: '50%', background: btn.bg, border: `2px solid ${btn.border}`, color: btn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 18px rgba(5,150,105,0.16)', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                {btn.icon}
              </button>
              {btn.badge && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                  {btn.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share modal */}
      {showShareModal && <ShareModal post={post} onClose={() => setShowShareModal(false)} />}

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="pd2-cta pd2-bouncein"
          aria-label="Back to top"
          style={{ position: 'fixed', bottom: isDesktop ? 32 : 160, right: isDesktop ? 32 : 20, width: 48, height: 48, borderRadius: '50%', padding: 0, zIndex: 99 }}
        >
          <FiArrowUp size={19} />
        </button>
      )}
    </div>
  );
};

export default PostDetail;