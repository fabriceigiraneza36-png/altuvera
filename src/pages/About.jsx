// src/pages/About.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart as LuHeart,
  ShieldCheck as LuShieldCheck,
  Globe2 as LuGlobe,
  Zap as LuZap,
  Users as LuUsers,
  Compass as LuCompass,
  ArrowRight as LuArrowRight,
  Play as LuPlay,
  X as LuX,
  ChevronLeft as LuChevronLeft,
  ChevronRight as LuChevronRight,
  Target as LuTarget,
  Eye as LuEye,
  MessageCircle as LuMessageCircle,
  Sparkles as LuSparkles,
  Mountain as LuMountain,
  Camera as LuCamera,
  TrendingUp as LuTrendingUp,
  MapPin as LuMapPin,
  Star as LuStar,
  Maximize2 as LuMaximize2,
  Quote as LuQuote,
  Rocket as LuRocket,
  BadgeCheck as LuBadgeCheck,
  Award as LuAward,
  Crown as LuCrown,
} from 'lucide-react';
import { MdPlayArrow, MdSkipNext, MdSkipPrevious, MdPlaylistPlay } from "react-icons/md";
import { motion, AnimatePresence, useInView } from 'framer-motion';
import SEO from '../components/common/SEO';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import CookieSettingsButton from '../components/common/CookieSettingsButton';
import ReviewModal from '../components/home/ReviewModal';
import AnimatedSection from '../components/common/AnimatedSection';
import TeamCard from '../components/common/TeamCard';
import { useUserAuth } from '../context/UserAuthContext';
import { useGallery } from '../hooks/useGallery';

/* ═══════════════════════════════════════════════════════
   TEAM API
   ═══════════════════════════════════════════════════════ */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { Accept: "application/json", ...options.headers }
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `Status ${res.status}`);
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== "AbortError") {
        await new Promise(r => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
};

const FALLBACK_MEMBERS = [
  {
    id: 1, name: "IGIRANEZA Fabrice", role: "Founder & CEO", department: "Leadership",
    image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
    expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"],
    languages: ["English", "French", "Kinyarwanda"], certifications: [],
    years_experience: 12, location: "Musanze, Rwanda",
    linkedin_url: "#", twitter_url: "#", email: "fabrice@altuvera.com",
    is_featured: true, is_active: true, display_order: 1
  },
  {
    id: 2, name: "UWIMANA Grace", role: "Head of Operations", department: "Operations",
    image_url: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Ensures seamless coordination of every itinerary with precision and local expertise.",
    expertise: ["Logistics Management", "Quality Assurance"],
    languages: ["English", "Swahili"], certifications: [],
    years_experience: 8, location: "Musanze, Rwanda",
    linkedin_url: "#", email: "grace@altuvera.com",
    is_featured: false, is_active: true, display_order: 2
  },
  {
    id: 3, name: "MUTABAZI Jean", role: "Lead Safari Guide", department: "Guides",
    image_url: "https://randomuser.me/api/portraits/men/67.jpg",
    bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards.",
    expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"],
    languages: ["English", "Swahili", "French"], certifications: ["Certified Safari Guide"],
    years_experience: 15, location: "Serengeti, Tanzania",
    linkedin_url: "#", email: "jean@altuvera.com",
    is_featured: true, is_active: true, display_order: 3
  },
  {
    id: 4, name: "INGABIRE Diane", role: "Customer Experience Manager", department: "Customer Service",
    image_url: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "Designs guest-first service experiences from initial inquiry through post-trip follow-up.",
    expertise: ["Client Relations", "Service Design"],
    languages: ["English", "French"], certifications: [],
    years_experience: 6, location: "Kampala, Uganda",
    linkedin_url: "#", email: "diane@altuvera.com",
    is_featured: false, is_active: true, display_order: 4
  },
];

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const ABOUT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

  .about-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #ffffff;
    color: #0f172a;
    overflow-x: hidden;
  }

  /* ── Video Cards ── */
  .about-video-wrap {
    position: relative;
    border-radius: 32px;
    overflow: hidden;
    background: #000;
    cursor: pointer;
    isolation: isolate;
  }
  .about-video-wrap--sm {
    border-radius: 24px;
    box-shadow: 0 15px 40px rgba(5,150,105,0.12);
  }
  .about-video-wrap--hero {
    box-shadow: 0 30px 60px rgba(5,150,105,0.15);
  }

  /* iframe fills parent absolutely */
  .about-video-ratio {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #000;
  }
  .about-video-ratio--hero { padding-bottom: clamp(44%, 45vw, 56%); }
  .about-video-ratio--sm   { padding-bottom: 56.25%; }

  .about-video-iframe {
    position: absolute;
    top: 50%; left: 50%;
    /* scale up so black bars are hidden and controls go off-screen */
    width: 200%;
    height: 200%;
    transform: translate(-50%, -50%);
    border: 0;
    pointer-events: none; /* no clicks → no controls */
  }

  /* overlay blocks clicks on iframe so card click works */
  .about-video-shield {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to top,
      rgba(4,55,40,0.80) 0%,
      rgba(4,55,40,0.20) 45%,
      transparent 100%
    );
    transition: background 0.4s ease;
  }
  .about-video-wrap:hover .about-video-shield {
    background: linear-gradient(
      to top,
      rgba(4,55,40,0.88) 0%,
      rgba(4,55,40,0.30) 45%,
      transparent 100%
    );
  }

  .about-video-meta {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    z-index: 3;
    padding: clamp(14px,2vw,24px);
    pointer-events: none;
  }

  .about-video-play-btn {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    z-index: 3;
    width: clamp(52px,8vw,80px);
    height: clamp(52px,8vw,80px);
    border-radius: 50%;
    background: rgba(5,150,105,0.9);
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 8px 32px rgba(5,150,105,0.5);
    transition: transform 0.3s ease, background 0.3s ease;
    pointer-events: none;
  }
  .about-video-wrap:hover .about-video-play-btn {
    background: #059669;
    transform: translate(-50%,-50%) scale(1.12);
  }

  /* ── Gallery ── */
  .about-gallery-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .about-gallery-card {
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(5,150,105,0.08);
    border: 1px solid #f3f4f6;
    transition: all 0.38s cubic-bezier(0.4,0,0.2,1);
  }
  .about-gallery-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(5,150,105,0.16);
  }
  .about-gallery-card:hover .about-gallery-overlay { opacity: 1; }
  .about-gallery-card:hover .about-gallery-img { transform: scale(1.08); }
  .about-gallery-card:hover .about-gallery-zoom { opacity: 1; transform: translateY(0); }

  .about-gallery-img {
    width: 100%; height: 240px; object-fit: cover; display: block;
    transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
  }
  .about-gallery-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(6,79,70,0.88) 0%, rgba(6,79,70,0.25) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.38s ease;
  }
  .about-gallery-zoom {
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;
  }

  /* ── Team ── */
  .about-team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 26px;
  }
  .about-team-card {
    background: white;
    border-radius: 24px;
    border: 1px solid #d1fae5;
    box-shadow: 0 6px 24px rgba(5,150,105,0.08);
    padding: 28px 22px;
    text-align: center;
    transition: all 0.36s cubic-bezier(0.4,0,0.2,1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .about-team-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 56px rgba(5,150,105,0.18);
    border-color: #a7f3d0;
  }
  .about-team-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #059669, #4ade80, #059669);
    opacity: 0; transition: opacity 0.3s;
  }
  .about-team-card:hover::before { opacity: 1; }

  .about-team-avatar-ring {
    width: 120px; height: 120px;
    border-radius: 50%; overflow: hidden;
    border: 4px solid #d1fae5;
    transition: all 0.36s ease;
    margin: 0 auto 18px;
    position: relative;
  }
  .about-team-card:hover .about-team-avatar-ring {
    border-color: #a7f3d0;
    box-shadow: 0 0 0 6px rgba(5,150,105,0.10);
  }
  .about-team-avatar-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s ease;
  }
  .about-team-card:hover .about-team-avatar-img { transform: scale(1.07); }

  .about-team-initials {
    width: 100%; height: 100%; border-radius: 50%;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 34px; font-weight: 800; color: #059669;
  }
  .about-team-socials {
    display: flex; justify-content: center; flex-wrap: wrap;
    gap: 9px; padding-top: 14px;
    border-top: 1px solid #d1fae5; margin-top: auto;
  }
  .about-team-social-link {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid #a7f3d0; background: #f0fdf4; color: #047857;
    display: flex; align-items: center; justify-content: center;
    text-decoration: none; transition: all 0.22s;
  }
  .about-team-social-link:hover {
    background: linear-gradient(135deg, #059669, #065f46);
    border-color: #059669; color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5,150,105,0.3);
  }

  /* ── Value Cards ── */
  .about-value-card {
    background: white; border-radius: 24px;
    border: 1px solid rgba(5,150,105,0.1);
    position: relative; overflow: hidden;
    transition: all 0.5s cubic-bezier(0.25,0.1,0.25,1);
  }
  .about-value-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(5,150,105,0.15);
  }
  .about-value-card:hover .about-value-bar { transform: scaleX(1); }
  .about-value-card:hover .about-value-icon {
    background: #059669 !important;
  }
  .about-value-card:hover .about-value-icon svg { color: white !important; }
  .about-value-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #059669, #10B981);
    transform-origin: left; transform: scaleX(0);
    transition: transform 0.4s ease;
  }

  /* ── Shimmer ── */
  .about-shimmer {
    background: linear-gradient(110deg, #d1fae5 8%, #ecfdf5 18%, #d1fae5 33%);
    background-size: 200% 100%;
    animation: aboutShimmer 1.5s ease infinite;
  }
  @keyframes aboutShimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }

  /* ── Lightbox ── */
  .about-lightbox {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.96);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  /* ── Responsive ── */
  @media (max-width: 1200px) {
    .about-gallery-grid { grid-template-columns: repeat(3,1fr); }
  }
  @media (max-width: 900px) {
    .about-gallery-grid { grid-template-columns: repeat(2,1fr); }
    .about-team-grid    { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .about-gallery-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .about-root section {
      padding-left:  18px !important;
      padding-right: 18px !important;
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
   HELPERS
   ═══════════════════════════════════════════════════════ */
const FadeInSection = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const dirs = {
    up:    { y:  50, x:   0 },
    down:  { y: -50, x:   0 },
    left:  { y:   0, x: -50 },
    right: { y:   0, x:  50 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

/* ═══════════════════════════════════════════════════════
   AUTOPLAY VIDEO CARD
   — iframe scaled 200 % so YouTube chrome is off-screen
   — pointer-events:none on iframe → no controls visible
   — click shield on top forwards clicks to card handler
   ═══════════════════════════════════════════════════════ */
const AutoplayVideoCard = ({ video, onClick, isHero = false }) => {
  /* YouTube embed params:
     autoplay=1  mute=1  loop=1  playlist=<id>
     controls=0  disablekb=1  modestbranding=1
     showinfo=0  rel=0  iv_load_policy=3
     playsinline=1  fs=0                          */
  const src = [
    `https://www.youtube.com/embed/${video.videoId}`,
    `?autoplay=1&mute=1&loop=1&playlist=${video.videoId}`,
    `&controls=0&disablekb=1&modestbranding=1`,
    `&showinfo=0&rel=0&iv_load_policy=3`,
    `&playsinline=1&fs=0&enablejsapi=0`,
  ].join('');

  return (
    <div
      className={`about-video-wrap${isHero ? ' about-video-wrap--hero' : ' about-video-wrap--sm'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      aria-label={`Play: ${video.title}`}
    >
      <div className={`about-video-ratio${isHero ? ' about-video-ratio--hero' : ' about-video-ratio--sm'}`}>
        <iframe
          className="about-video-iframe"
          src={src}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          loading="lazy"
        />

        {/* gradient + click shield */}
        <div className="about-video-shield" />

        {/* play button hint */}
        <div className="about-video-play-btn">
          <LuPlay size={isHero ? 32 : 22} style={{ marginLeft: 3 }} />
        </div>

        {/* title / subtitle */}
        <div className="about-video-meta">
          <h4 style={{
            color: 'white',
            fontSize: isHero ? 'clamp(18px,2.8vw,32px)' : 'clamp(13px,1.4vw,16px)',
            fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1.3,
            margin: 0,
            marginBottom: 4,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {video.title}
          </h4>
          {video.subtitle && (
            <p style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: isHero ? 'clamp(13px,1.3vw,16px)' : '12px',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {video.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════════════════════ */
const GalleryLightbox = ({ image, images, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onPrev();
      if (e.key === 'ArrowRight')  onNext();
    };
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  const idx = images.findIndex(i => i.id === image.id);
  const btnStyle = (disabled) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 50, height: 50, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: 'white', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.35 : 1, zIndex: 10,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="about-lightbox"
      onClick={onClose}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 24, right: 24, width: 50, height: 50, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
      }}>
        <LuX size={24} />
      </button>

      <button
        onClick={e => { e.stopPropagation(); onPrev(); }}
        disabled={idx === 0}
        style={{ ...btnStyle(idx === 0), left: 24 }}
      >
        <LuChevronLeft size={24} />
      </button>

      <button
        onClick={e => { e.stopPropagation(); onNext(); }}
        disabled={idx === images.length - 1}
        style={{ ...btnStyle(idx === images.length - 1), right: 24 }}
      >
        <LuChevronRight size={24} />
      </button>

      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '85%', maxHeight: '85vh', position: 'relative' }}>
        <motion.img
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={image.src || image.thumb}
          alt={image.alt || image.title}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, display: 'block' }}
        />
        <div style={{
          position: 'absolute', bottom: -48, left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center', color: 'white', whiteSpace: 'nowrap',
        }}>
          <p style={{ fontSize: 16, marginBottom: 4 }}>{image.title}</p>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{idx + 1} / {images.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   GALLERY CARD
   ═══════════════════════════════════════════════════════ */
const AboutGalleryCard = ({ image, onClick }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="about-gallery-card" onClick={() => onClick(image)}>
      {!loaded && (
        <div className="about-shimmer" style={{ height: 240, position: 'absolute', inset: 0, zIndex: 1 }} />
      )}
      <img
        src={image.thumb || image.src}
        alt={image.alt || image.title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="about-gallery-img"
      />
      <div className="about-gallery-overlay" />

      {image.isFeatured && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          padding: '4px 10px', borderRadius: 9999,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <LuStar size={10} /> Featured
        </div>
      )}

      {image.category && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 3,
          padding: '4px 10px', borderRadius: 9999,
          background: '#ECFDF5', border: '1px solid #D1FAE5',
          color: '#059669', fontSize: 11, fontWeight: 600,
        }}>
          {image.category}
        </div>
      )}

      <div className="about-gallery-zoom" style={{
        position: 'absolute', top: image.isFeatured ? 42 : 10, right: 10, zIndex: 3,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LuMaximize2 size={13} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 14px 14px', zIndex: 3 }}>
        {image.title && (
          <h4 style={{
            color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {image.title}
          </h4>
        )}
        {(image.location || image.countryName) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 11.5 }}>
            <LuMapPin size={10} /> {image.location || image.countryName}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TEAM CARD
   ═══════════════════════════════════════════════════════ */
const AboutTeamCard = ({ member }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr,    setImgErr]    = useState(false);

  const expertise = Array.isArray(member.expertise) ? member.expertise : [];
  const languages = Array.isArray(member.languages)  ? member.languages  : [];

  const socials = [
    member.linkedin_url && { href: member.linkedin_url, icon: <LuUsers size={15} />,       label: 'LinkedIn' },
    member.twitter_url  && { href: member.twitter_url,  icon: <LuMessageCircle size={15} />, label: 'Twitter'  },
    member.email        && { href: `mailto:${member.email}`, icon: <LuSparkles size={15} />, label: 'Email', internal: true },
  ].filter(Boolean);

  const initials = member.name
    ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <article className="about-team-card">
      {member.is_featured && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 11px', borderRadius: 9999,
          background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
          color: '#d97706', fontSize: 10.5, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          border: '1px solid #fde68a',
        }}>
          <LuAward size={11} /> Featured
        </div>
      )}

      {/* Avatar */}
      <div className="about-team-avatar-ring">
        {!imgLoaded && !imgErr && (
          <div className="about-shimmer" style={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />
        )}
        {imgErr ? (
          <div className="about-team-initials">{initials}</div>
        ) : member.image_url ? (
          <img
            src={member.image_url}
            alt={`${member.name} – ${member.role}`}
            className="about-team-avatar-img"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgErr(true); setImgLoaded(true); }}
            loading="lazy"
          />
        ) : (
          <div className="about-team-initials">{initials}</div>
        )}
        <div style={{
          position: 'absolute', bottom: 6, right: 6,
          width: 15, height: 15, borderRadius: '50%',
          border: '3px solid white',
          backgroundColor: member.is_active ? '#10b981' : '#9ca3af',
          boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
        }} />
      </div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
        color: '#064e3b', marginBottom: 5, lineHeight: 1.25,
      }}>{member.name}</h3>

      <p style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 8 }}>{member.role}</p>

      {member.department && (
        <span style={{
          display: 'inline-block', padding: '3px 12px', borderRadius: 9999,
          background: '#f0fdf4', border: '1px solid #d1fae5',
          fontSize: 11.5, color: '#047857', fontWeight: 600, marginBottom: 13,
        }}>{member.department}</span>
      )}

      {member.bio && (
        <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 14 }}>{member.bio}</p>
      )}

      {expertise.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 12 }}>
          {expertise.slice(0, 3).map((s, i) => (
            <span key={i} style={{
              padding: '3px 9px', borderRadius: 7,
              background: '#ecfdf5', border: '1px solid #d1fae5',
              fontSize: 10.5, color: '#059669', fontWeight: 600,
            }}>{s}</span>
          ))}
          {expertise.length > 3 && (
            <span style={{
              padding: '3px 9px', borderRadius: 7, background: '#f3f4f6',
              fontSize: 10.5, color: '#6b7280', fontWeight: 600,
            }}>+{expertise.length - 3}</span>
          )}
        </div>
      )}

      {languages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
          <LuGlobe size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <span>{languages.slice(0, 3).join(', ')}{languages.length > 3 ? ` +${languages.length - 3}` : ''}</span>
        </div>
      )}

      {member.years_experience > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
          <LuTrendingUp size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <span>{member.years_experience}+ years experience</span>
        </div>
      )}

      {member.location && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
          <LuMapPin size={11} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <span>{member.location}</span>
        </div>
      )}

      {socials.length > 0 && (
        <div className="about-team-socials">
          {socials.map((lk, i) => (
            <a
              key={i} href={lk.href}
              target={lk.internal ? undefined : '_blank'}
              rel={lk.internal ? undefined : 'noopener noreferrer'}
              className="about-team-social-link"
              aria-label={lk.label} title={lk.label}
            >
              {lk.icon}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

/* ═══════════════════════════════════════════════════════
    STAT CARD
   ═══════════════════════════════════════════════════════ */
const AboutStatCard = ({ value, suffix, label, description, icon: Icon }) => (
  <FadeInSection>
    <motion.div
      whileHover={{ y: -5 }}
      style={{
        background: 'white', borderRadius: 24, padding: 'clamp(28px,4vw,40px)',
        textAlign: 'center', boxShadow: '0 10px 30px rgba(5,150,105,0.08)',
        border: '1px solid rgba(5,150,105,0.1)',
      }}
    >
      <div style={{
        width: 56, height: 56, background: '#ECFDF5', borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <Icon size={26} color="#059669" />
      </div>
      <div style={{
        fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, color: '#059669',
        lineHeight: 1, marginBottom: 8, fontFamily: "'Playfair Display', serif",
      }}>
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
      <div style={{
        fontSize: 'clamp(14px,1.2vw,16px)', fontWeight: 700, color: '#0f172a',
        marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
      }}>{label}</div>
      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{description}</p>
    </motion.div>
  </FadeInSection>
);

/* ═══════════════════════════════════════════════════════
   QUOTE BLOCK
   ═══════════════════════════════════════════════════════ */
const QuoteBlock = ({ quote, author, role, image }) => (
  <FadeInSection>
    <div style={{
      background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
      borderRadius: 32, padding: 'clamp(24px,4vw,42px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 20, left: 30, fontSize: 120,
        color: 'rgba(5,150,105,0.1)', fontFamily: 'Georgia,serif', lineHeight: 1,
        pointerEvents: 'none',
      }}>"</div>
      <LuQuote size={32} style={{ color: '#059669', marginBottom: 16, position: 'relative', zIndex: 1 }} />
      <blockquote style={{
        fontSize: 'clamp(18px,2.2vw,26px)', fontWeight: 500, color: '#0f172a',
        lineHeight: 1.7, fontStyle: 'italic', marginBottom: 28,
        fontFamily: "'Playfair Display', serif", position: 'relative', zIndex: 1,
      }}>{quote}</blockquote>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={image} alt={author} style={{
          width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid white',
        }} />
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 18 }}>{author}</div>
          <div style={{ color: '#059669', fontSize: 14, fontWeight: 600 }}>{role}</div>
        </div>
      </div>
    </div>
  </FadeInSection>
);

/* ═══════════════════════════════════════════════════════
   SHARED STYLE OBJECT  (declared before JSX that uses it)
   ═══════════════════════════════════════════════════════ */
const S = {
  h2: {
    fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 800, lineHeight: 1.15,
    color: '#0f172a', fontFamily: "'Playfair Display', serif", marginBottom: 20,
  },
  p: {
    fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.85,
    color: '#64748b', marginBottom: 18,
  },
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
const About = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [reviewOpen,    setReviewOpen]    = useState(false);
  const { isAuthenticated } = useUserAuth();

  /* ── Team ── */
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const isMounted = useRef(true);

  /* ── Gallery (hook) ── */
  const { images: galleryImages, loading: galleryLoading, error: galleryError, refetch: galleryRefetch } = useGallery();
  const displayImages = useMemo(() => galleryImages.slice(0, 20), [galleryImages]);

  /* lightbox nav */
  const lbIndex  = useMemo(() => displayImages.findIndex(i => i.id === lightboxImage?.id), [displayImages, lightboxImage]);
  const prevImage = useCallback(() => { if (lbIndex > 0) setLightboxImage(displayImages[lbIndex - 1]); }, [lbIndex, displayImages]);
  const nextImage = useCallback(() => { if (lbIndex < displayImages.length - 1) setLightboxImage(displayImages[lbIndex + 1]); }, [lbIndex, displayImages]);

  /* fetch team */
  const fetchTeam = useCallback(async () => {
    if (!isMounted.current) return;
    setTeamLoading(true);
    try {
      const res = await teamAPI.getAll({ sort: 'display_order', order: 'ASC', limit: 100 });
      if (!isMounted.current) return;
      const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setTeamMembers(arr.length > 0 ? arr : FALLBACK_MEMBERS);
    } catch {
      if (isMounted.current) setTeamMembers(FALLBACK_MEMBERS);
    } finally {
      if (isMounted.current) setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchTeam();
    return () => { isMounted.current = false; };
  }, [fetchTeam]);

  /* ── Data ── */
  const heroImage = 'https://i.pinimg.com/1200x/d6/fd/68/d6fd6828f6d716bf6786bdecef85e642.jpg';

  const VIDEO_PLAYLIST = [
    { id: 1, title: 'The Beauty of Rwanda', subtitle: "Experience Rwanda's natural wonders", videoId: 'dTlfCgkHN6s', poster: 'https://i.ytimg.com/vi/dTlfCgkHN6s/hqdefault.jpg' },
    { id: 2, title: "East Africa's Great Migration", subtitle: 'The Great Wildebeest Migration', videoId: 'IvCfINrZrLk', poster: 'https://i.ytimg.com/vi/IvCfINrZrLk/hqdefault.jpg' },
    { id: 3, title: 'Lake Victoria', subtitle: "Africa's largest lake", videoId: 'xdFYFB3vyoo', poster: 'https://i.ytimg.com/vi/xdFYFB3vyoo/hqdefault.jpg' },
  ];

  /* ── Skeleton helpers ── */
  const TeamSkeletons = () => (
    <div className="about-team-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="about-team-card" style={{ gap: 0 }}>
          <div className="about-shimmer" style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {[['65%', 22], ['45%', 14], ['38%', 20], ['90%', 13], ['75%', 13]].map(([w, h], j) => (
              <div key={j} className="about-shimmer" style={{ width: w, height: h, borderRadius: 8 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 14, marginTop: 14, borderTop: '1px solid #d1fae5' }}>
            {[1, 2, 3].map(j => <div key={j} className="about-shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />)}
          </div>
        </div>
      ))}
    </div>
  );

  const GallerySkeletons = () => (
    <div className="about-gallery-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div className="about-shimmer" style={{ height: 240 }} />
          <div style={{ padding: '14px 16px', background: 'white' }}>
            <div className="about-shimmer" style={{ height: 14, width: '70%', borderRadius: 6, marginBottom: 8 }} />
            <div className="about-shimmer" style={{ height: 12, width: '50%', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );

  /* ════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════ */
  return (
    <div className="about-root">
      <style>{ABOUT_STYLES}</style>

      <SEO
        title="About Us"
        description="Learn about Altuvera's mission to create transformative travel experiences through our 'High Places & Deep Culture' philosophy."
        keywords={['about Altuvera', 'travel company', 'safari experts', 'East Africa', 'sustainable tourism']}
        url="/about"
        image="/og-about.jpg"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]}
      />

      <ReviewModal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} />

      <PageHeader
        title="Our Heritage"
        subtitle="Discover the story of Altuvera—designed and created by IGIRANEZA Fabrice, where adventure meets preservation."
        backgroundImage={heroImage}
        breadcrumbs={[{ label: 'About Us' }]}
      />

      <AnimatePresence>
        {lightboxImage && (
          <GalleryLightbox
            image={lightboxImage}
            images={displayImages}
            onClose={() => setLightboxImage(null)}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      {/* Cookie Settings */}
      <section style={{ padding: '16px 24px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <CookieSettingsButton />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTRODUCTION
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(20px,4vw,40px) 24px', background: 'linear-gradient(180deg,#fff 0%,#FAFFFE 100%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <FadeInSection>
            <h2 style={{ ...S.h2, marginBottom: 32 }}>
              More Than a Safari Company—<span style={{ color: '#059669' }}>A Movement</span>
            </h2>
            <p style={{ ...S.p, fontSize: 'clamp(17px,1.5vw,20px)', maxWidth: 800, margin: '0 auto 28px' }}>
              In 2026, <strong style={{ color: '#059669' }}>IGIRANEZA Fabrice</strong> transformed
              his vision into reality by founding Altuvera. He believed that travel could be more
              than sightseeing—it could be transformation.
            </p>
            <p style={{ ...S.p, maxWidth: 800, margin: '0 auto 28px' }}>
              We believe that true exploration forges deep, meaningful connections—with the land
              beneath your feet, the wildlife that calls it home, and the communities that have
              thrived here for countless generations.
            </p>
            <p style={{ ...S.p, maxWidth: 800, margin: '0 auto' }}>
              From the visionary mind of IGIRANEZA Fabrice emerged the "High Places & Deep Culture"
              philosophy—a revolutionary approach that has redefined what experiential travel
              means for the modern explorer.
            </p>
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => setReviewOpen(true)}
                style={{
                  marginTop: 32, padding: '14px 24px', borderRadius: 9999, border: 'none',
                  background: 'linear-gradient(135deg,#059669,#047857)',
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 12px 30px rgba(5,150,105,0.22)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <LuMessageCircle size={16} /> Share Your Experience
              </motion.button>
            )}
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VIDEO SECTION — autoplay iframe cards
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(20px,4vw,40px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(22px,3vw,36px)' }}>
            <FadeInSection>
              <h2 style={S.h2}>Experience Altuvera <span style={{ color: '#059669' }}>Through Film</span></h2>
              <p style={{ ...S.p, maxWidth: 650, margin: '0 auto' }}>
                Immerse yourself in the sights and sounds of East Africa through our documentary content.
                Every card plays its video live—click to open the full player.
              </p>
            </FadeInSection>
          </div>

          {/* Hero video */}
          <FadeInSection>
            <div style={{ marginBottom: 'clamp(20px,3vw,32px)' }}>
              <AutoplayVideoCard
                video={VIDEO_PLAYLIST[0]}
                isHero
                onClick={() => {}}
              />
            </div>
          </FadeInSection>

          {/* Small video grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))',
            gap: 'clamp(16px,2vw,24px)',
          }}>
            {VIDEO_PLAYLIST.slice(1).map((video, idx) => (
              <FadeInSection key={video.id} delay={idx * 0.1}>
                <AutoplayVideoCard
                  video={video}
                  onClick={() => {}}
                />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PHILOSOPHY
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(18px,3.5vw,38px) 24px', background: '#F0FDF4', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,480px),1fr))',
            gap: 'clamp(40px,6vw,80px)', alignItems: 'center',
          }}>
            <FadeInSection direction="left">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, position: 'relative' }}>
                <motion.div whileHover={{ scale: 1.03, rotate: -1 }} style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(5,150,105,0.15)', gridRow: 'span 2' }}>
                  <img src="https://i.pinimg.com/736x/f3/8e/5d/f38e5ddcc6677a39515284b5c2c7a2e4.jpg" alt="Safari" style={{ width: '100%', height: '100%', minHeight: 380, objectFit: 'cover' }} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, rotate: 1 }} style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(5,150,105,0.15)' }}>
                  <img src="https://i.pinimg.com/1200x/81/45/9e/81459ea63d041cdb6e64d080c07f4937.jpg" alt="Wildlife" style={{ width: '100%', height: '100%', minHeight: 180, objectFit: 'cover' }} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, rotate: -1 }} style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(5,150,105,0.15)' }}>
                  <img src="https://i.pinimg.com/1200x/e8/c3/dc/e8c3dc61a18c07053646caddbc45a454.jpg" alt="Culture" style={{ width: '100%', height: '100%', minHeight: 180, objectFit: 'cover' }} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }} viewport={{ once: true }}
                  style={{
                    position: 'absolute', bottom: -20, right: -20,
                    background: 'linear-gradient(135deg,#059669,#047857)',
                    borderRadius: 20, padding: '20px 28px', color: 'white',
                    boxShadow: '0 20px 40px rgba(5,150,105,0.35)', zIndex: 10,
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LuCrown size={12} /> Founded by
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>IGIRANEZA Fabrice</div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>2026</div>
                </motion.div>
              </div>
            </FadeInSection>

            <FadeInSection direction="right" delay={0.15}>
              <h2 style={S.h2}>
                Understanding <span style={{ color: '#059669' }}>True Adventures In High Places & Deep Culture</span>
              </h2>
              <div style={{ width: 80, height: 4, background: 'linear-gradient(90deg,#059669,#10B981)', marginBottom: 28, borderRadius: 2 }} />
              <p style={S.p}>
                The concept of <strong style={{ color: '#059669' }}>"True Adventures In High Places & Deep Culture"</strong> is
                the philosophical foundation designed by IGIRANEZA Fabrice.
              </p>
              <p style={S.p}>
                <strong style={{ color: '#059669' }}>"True Adventures In High Places"</strong> represents our commitment
                to excellence in every tangible aspect and the pursuit of extraordinary destinations.
              </p>
              <p style={S.p}>
                <strong style={{ color: '#059669' }}>"Deep Culture"</strong> is where transformation
                happens. Genuine human connection, sharing meals with local families, learning living traditions.
              </p>
              <p style={S.p}>
                Together, they create journeys that are both comfortable and challenging, both luxurious
                and authentic—invitations to engage more deeply with the world.
              </p>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOUNDER'S STORY
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(18px,3.5vw,38px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={S.h2}>A Vision Born from <span style={{ color: '#059669' }}>IGIRANEZA Fabrice</span></h2>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <div style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', borderRadius: 32, padding: 'clamp(20px,3vw,32px)', boxShadow: '0 20px 50px rgba(5,150,105,0.1)' }}>
              {[
                'In 2026, <strong style="color:#059669">IGIRANEZA Fabrice</strong> set out to revolutionize the travel industry. Having witnessed countless tourists pass through Africa\'s magnificent landscapes without truly connecting to their deeper meaning, Fabrice envisioned something radically different.',
                '"I wanted to create experiences that don\'t just show people Africa," Fabrice explains. "I wanted to help them understand it, feel it, and carry a piece of it with them forever."',
                'With this vision, Fabrice designed Altuvera from the ground up. The name itself—a fusion of "altitude" and "vera" (truth)—reflects this mission: reaching higher standards while staying grounded in authentic experience.',
                "Today, under Fabrice's continued guidance as Co-Founder, Altuvera has grown into one of East Africa's most respected safari operators.",
              ].map((text, i) => (
                <p
                  key={i}
                  style={{ ...S.p, fontSize: 'clamp(16px,1.3vw,18px)', marginBottom: i < 3 ? 24 : 0 }}
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GALLERY — backend-fetched, max 20
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(20px,4vw,40px) 24px', background: '#F0FDF4' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px,4vw,44px)' }}>
            <FadeInSection>
              <h2 style={S.h2}>Captured <span style={{ color: '#059669' }}>Moments</span></h2>
              <p style={{ ...S.p, maxWidth: 600, margin: '0 auto' }}>
                A curated collection of breathtaking moments from our East African journeys.
              </p>
            </FadeInSection>
          </div>

          {galleryLoading ? <GallerySkeletons /> : galleryError ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20 }}>
              <LuMountain size={40} color="#EF4444" style={{ marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#064e3b', marginBottom: 8 }}>Failed to Load Gallery</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>{galleryError}</p>
              <button onClick={galleryRefetch} style={{
                padding: '12px 28px', borderRadius: 9999, border: 'none',
                background: 'linear-gradient(135deg,#059669,#047857)', color: 'white',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <LuRocket size={15} /> Try Again
              </button>
            </div>
          ) : displayImages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 20 }}>
              <LuCamera size={44} style={{ color: '#a7f3d0', marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#064e3b', marginBottom: 8 }}>No Images Yet</h3>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Gallery images will appear here once added.</p>
            </div>
          ) : (
            <div className="about-gallery-grid">
              {displayImages.map((img, i) => (
                <AnimatedSection key={img.id} animation="fadeInUp" delay={i * 0.04}>
                  <AboutGalleryCard image={img} onClick={setLightboxImage} />
                </AnimatedSection>
              ))}
            </div>
          )}

          <FadeInSection delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 'clamp(28px,4vw,44px)' }}>
              <Button to="/gallery" variant="primary" size="large">
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LuCamera size={18} /> View Full Gallery
                </span>
              </Button>
            </div>
          </FadeInSection>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          QUOTE
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(18px,3.5vw,38px) 24px', background: '#FAFFFE' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <QuoteBlock
            quote="I designed Altuvera to prove that travel can be more than tourism. It can be a force for transformation—changing travelers, empowering communities, and protecting the wild places that make Africa extraordinary."
            author="IGIRANEZA Fabrice"
            role="Co-Founder & Visionary, Altuvera (Est. 2026)"
            image="https://drive.google.com/uc?export=download&id=1Ln8s-kXLgqffNvwKg7M3b7s9eIs3ed_n"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TEAM — backend-fetched
          ══════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(22px,5vw,52px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
            <FadeInSection>
              <h2 style={S.h2}>The <span style={{ color: '#059669' }}>People</span> Behind Your Journey</h2>
              <p style={{ ...S.p, maxWidth: 750, margin: '0 auto' }}>
                Led by Co-Founder IGIRANEZA Fabrice, our leadership team combines visionary thinking
                with deep expertise in wildlife conservation, luxury hospitality, and sustainable tourism.
              </p>
            </FadeInSection>
          </div>
          {teamLoading ? <TeamSkeletons /> : (
            <div className="about-team-grid">
              {teamMembers.map((member, i) => (
                <AnimatedSection key={member.id || i} animation="fadeInUp" delay={i * 0.08}>
                  <TeamCard member={member} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MISSION & VISION
          ══════════════════════════════════════════ */}
      <section id="mission" style={{ padding: 'clamp(18px,3.5vw,38px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,450px),1fr))',
            gap: 'clamp(40px,6vw,80px)',
          }}>
            <FadeInSection>
              <div style={{
                background: 'linear-gradient(135deg,#059669,#047857)',
                borderRadius: 32, padding: 'clamp(32px,5vw,48px)', height: '100%', color: 'white',
              }}>
                <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                  <LuTarget size={32} />
                </div>
                <h3 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, marginBottom: 20, fontFamily: "'Playfair Display',serif" }}>Our Mission</h3>
                <p style={{ fontSize: 'clamp(16px,1.3vw,18px)', lineHeight: 1.8, opacity: 0.95, marginBottom: 24 }}>
                  To create transformative travel experiences that honor Africa's wildlife,
                  empower its communities, and awaken in every traveler a profound connection
                  to the natural world.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
                  Designed by IGIRANEZA Fabrice in 2026, this mission guides every decision we make.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div style={{ background: 'white', borderRadius: 32, padding: 'clamp(32px,5vw,48px)', height: '100%', border: '1px solid rgba(5,150,105,0.15)' }}>
                <div style={{ width: 64, height: 64, background: '#ECFDF5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                  <LuEye size={32} color="#059669" />
                </div>
                <h3 style={{ fontSize: 'clamp(24px,3vw,32px)', fontWeight: 700, marginBottom: 20, color: '#0f172a', fontFamily: "'Playfair Display',serif" }}>Our Vision</h3>
                <p style={{ fontSize: 'clamp(16px,1.3vw,18px)', lineHeight: 1.8, color: '#374151', marginBottom: 24 }}>
                  A world where travel is a force for conservation, cultural preservation,
                  and human transformation—where every journey leaves both traveler and
                  destination better than before.
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: '#64748b' }}>
                  We envision a future where sustainable tourism is the standard and
                  communities thrive through ethical partnerships.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA  (reduced height)
          ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(28px,4vw,52px) 24px',
        background: 'linear-gradient(135deg,#059669,#047857)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ maxWidth: 850, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <h2 style={{
              fontSize: 'clamp(28px,4.5vw,44px)', fontWeight: 800, lineHeight: 1.15,
              color: 'white', fontFamily: "'Playfair Display',serif", marginBottom: 20,
            }}>
              Experience Fabrice's Vision for Yourself
            </h2>
            <p style={{
              fontSize: 'clamp(15px,1.3vw,17px)', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.9)', maxWidth: 600, margin: '0 auto 32px',
            }}>
              Join the explorers who have discovered the transformative power of
              authentic African travel. Let us show you what's possible.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/booking" variant="secondary" size="large"
                  style={{ background: 'white', color: '#059669', border: 'none', fontWeight: 700 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    Start Planning My Journey <LuArrowRight size={18} />
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/contact" variant="outline" size="large"
                  style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)' }}
                >
                  Schedule a Consultation
                </Button>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
};

export default About;