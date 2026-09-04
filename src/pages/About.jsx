// src/pages/About.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT PAGE v3.0 — Powerful Brand Story, Team from Backend, Horizontal Gallery
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart, ShieldCheck, Globe2, Zap, Users, Compass, ArrowRight, Play, X,
  ChevronLeft, ChevronRight, Target, Eye, MessageCircle, Sparkles, Mountain,
  Camera, TrendingUp, MapPin, Star, Maximize2, Quote, Rocket, BadgeCheck,
  Award, Crown, Phone, Mail, Leaf, HandHeart, Trees, Sun,
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import SEO from '../components/common/SEO';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import CookieSettingsButton from '../components/common/CookieSettingsButton';
import ReviewModal from '../components/home/ReviewModal';
import AnimatedSection from '../components/common/AnimatedSection';
import TeamContent from '../components/common/TeamContent';
import { useUserAuth } from '../context/UserAuthContext';
import { useGallery } from '../hooks/useGallery';

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const ABOUT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

  .about-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #ffffff;
    color: #0f172a;
    overflow-x: hidden;
  }

  /* ── Sections ── */
  .about-section {
    padding: clamp(48px, 6vw, 88px) clamp(16px, 3vw, 32px);
  }

  .about-section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(28px, 4.5vw, 46px);
    font-weight: 800;
    line-height: 1.15;
    color: #064e3b;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
  }

  .about-section-title em {
    font-style: normal;
    color: #059669;
  }

  .about-section-lead {
    font-size: clamp(15px, 1.25vw, 17px);
    line-height: 1.8;
    color: #4b5563;
    max-width: 720px;
    margin: 0 auto;
  }

  .about-section-p {
    font-size: clamp(15px, 1.15vw, 17px);
    line-height: 1.85;
    color: #4b5563;
    margin: 0 0 18px;
  }

  /* ── Video Cards ── */
  .about-video-wrap {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: #000;
    cursor: pointer;
    isolation: isolate;
    box-shadow: 0 20px 50px rgba(6, 78, 59, 0.15);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }

  .about-video-wrap:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px rgba(6, 78, 59, 0.2);
  }

  .about-video-wrap--hero {
    border-radius: 28px;
  }

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
    width: 200%; height: 200%;
    transform: translate(-50%, -50%);
    border: 0;
    pointer-events: none;
  }

  .about-video-shield {
    position: absolute; inset: 0; z-index: 2;
    background: linear-gradient(
      to top,
      rgba(4,55,40,0.82) 0%,
      rgba(4,55,40,0.22) 45%,
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
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
    padding: clamp(14px, 2vw, 24px);
    pointer-events: none;
  }

  .about-video-play-btn {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    width: clamp(52px, 8vw, 78px);
    height: clamp(52px, 8vw, 78px);
    border-radius: 50%;
    background: rgba(5, 150, 105, 0.92);
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 8px 32px rgba(5,150,105,0.5);
    transition: transform 0.3s ease, background 0.3s ease;
    pointer-events: none;
  }

  .about-video-wrap:hover .about-video-play-btn {
    background: #059669;
    transform: translate(-50%, -50%) scale(1.12);
  }

  /* ══════════════════════════════════════════════════════
     GALLERY — HORIZONTAL SLIDER (Mobile + Desktop)
  ══════════════════════════════════════════════════════ */

  .about-gallery-slider {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .about-gallery-track {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 8px 4px 20px;
    scrollbar-width: thin;
    scrollbar-color: #a7f3d0 transparent;
    scroll-behavior: smooth;
  }

  .about-gallery-track::-webkit-scrollbar {
    height: 6px;
  }

  .about-gallery-track::-webkit-scrollbar-track {
    background: #f0fdf4;
    border-radius: 99px;
  }

  .about-gallery-track::-webkit-scrollbar-thumb {
    background: #a7f3d0;
    border-radius: 99px;
  }

  .about-gallery-track::-webkit-scrollbar-thumb:hover {
    background: #6ee7b7;
  }

  .about-gallery-slide {
    flex: 0 0 auto;
    width: clamp(240px, 30vw, 340px);
    height: clamp(320px, 40vw, 420px);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(5, 150, 105, 0.08);
    border: 1px solid #f3f4f6;
    scroll-snap-align: start;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.35s ease;
  }

  .about-gallery-slide:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(5, 150, 105, 0.18);
  }

  .about-gallery-slide:hover .about-gallery-slide-img { transform: scale(1.06); }
  .about-gallery-slide:hover .about-gallery-slide-overlay { opacity: 1; }

  .about-gallery-slide-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .about-gallery-slide-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to top,
      rgba(6,79,70,0.9) 0%,
      rgba(6,79,70,0.35) 40%,
      transparent 100%
    );
    opacity: 0.6;
    transition: opacity 0.35s ease;
    pointer-events: none;
  }

  .about-gallery-slide-body {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 22px 18px 20px;
    z-index: 2;
    color: white;
  }

  .about-gallery-slide-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    margin: 0 0 5px;
    line-height: 1.35;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .about-gallery-slide-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 500;
  }

  .about-gallery-slide-zoom {
    position: absolute;
    top: 12px; right: 12px;
    width: 34px; height: 34px;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.25);
    color: white;
    display: flex; align-items: center; justify-content: center;
    z-index: 3;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }

  .about-gallery-slide:hover .about-gallery-slide-zoom {
    opacity: 1;
    transform: translateY(0);
  }

  .about-gallery-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }

  .about-gallery-nav-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1.5px solid #d1fae5;
    background: white;
    color: #065f46;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.08);
  }

  .about-gallery-nav-btn:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(5, 150, 105, 0.25);
  }

  .about-gallery-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Lightbox ── */
  .about-lightbox {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.96);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  /* ── Value Cards ── */
  .about-values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 20px;
  }

  .about-value-card {
    background: white;
    border-radius: 20px;
    padding: 28px 24px;
    text-align: left;
    border: 1.5px solid #e5f5ee;
    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .about-value-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669, #10b981);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  .about-value-card:hover {
    transform: translateY(-6px);
    border-color: #a7f3d0;
    box-shadow: 0 20px 40px rgba(5, 150, 105, 0.15);
  }

  .about-value-card:hover::before {
    transform: scaleX(1);
  }

  .about-value-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    color: #059669;
    transition: all 0.3s ease;
  }

  .about-value-card:hover .about-value-icon-wrap {
    background: #059669;
    color: white;
    transform: scale(1.08);
  }

  .about-value-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: #064e3b;
    margin: 0 0 8px;
  }

  .about-value-desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.65;
    margin: 0;
  }

  /* ── Contact Grid ── */
  .about-contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 16px;
    margin-top: 32px;
  }

  .about-contact-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    color: #064e3b;
    text-decoration: none;
    transition: all 0.25s ease;
  }

  .about-contact-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.1);
  }

  .about-contact-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    display: flex; align-items: center; justify-content: center;
    color: #059669;
    flex-shrink: 0;
  }

  .about-contact-label {
    font-size: 11px;
    font-weight: 700;
    color: #059669;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }

  .about-contact-val {
    font-size: 14.5px;
    font-weight: 700;
    color: #064e3b;
    line-height: 1.3;
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

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .about-gallery-slide {
      width: 78vw;
      height: 78vw;
      max-width: 320px;
      max-height: 380px;
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
    up:    { y:  40, x:   0 },
    down:  { y: -40, x:   0 },
    left:  { y:   0, x: -40 },
    right: { y:   0, x:  40 },
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

/* ═══════════════════════════════════════════════════════
   AUTOPLAY VIDEO CARD
   ═══════════════════════════════════════════════════════ */
const AutoplayVideoCard = ({ video, onClick, isHero = false }) => {
  const src = [
    `https://www.youtube.com/embed/${video.videoId}`,
    `?autoplay=1&mute=1&loop=1&playlist=${video.videoId}`,
    `&controls=0&disablekb=1&modestbranding=1`,
    `&showinfo=0&rel=0&iv_load_policy=3`,
    `&playsinline=1&fs=0&enablejsapi=0`,
  ].join('');

  return (
    <div
      className={`about-video-wrap${isHero ? ' about-video-wrap--hero' : ''}`}
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
        <div className="about-video-shield" />
        <div className="about-video-play-btn">
          <Play size={isHero ? 30 : 22} style={{ marginLeft: 3 }} />
        </div>
        <div className="about-video-meta">
          <h4 style={{
            color: 'white',
            fontSize: isHero ? 'clamp(17px,2.5vw,28px)' : 'clamp(13px,1.4vw,16px)',
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
              color: 'rgba(255,255,255,0.85)',
              fontSize: isHero ? 'clamp(13px,1.2vw,15px)' : '12px',
              margin: 0, lineHeight: 1.5,
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
   HORIZONTAL GALLERY SLIDER
   ═══════════════════════════════════════════════════════ */
const HorizontalGallery = ({ images, onImageClick }) => {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateNav = useCallback(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    setCanPrev(el.scrollLeft > 5);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useEffect(() => {
    updateNav();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    return () => {
      el.removeEventListener('scroll', updateNav);
      window.removeEventListener('resize', updateNav);
    };
  }, [updateNav, images]);

  const scrollBy = (dir) => {
    if (!trackRef.current) return;
    const slideWidth = trackRef.current.querySelector('.about-gallery-slide')?.offsetWidth || 260;
    trackRef.current.scrollBy({
      left: dir === 'next' ? slideWidth + 16 : -(slideWidth + 16),
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div className="about-gallery-slider">
        <div className="about-gallery-track" ref={trackRef}>
          {images.map((img) => (
            <div
              key={img.id}
              className="about-gallery-slide"
              onClick={() => onImageClick(img)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onImageClick(img); }}
            >
              <img
                src={img.thumb || img.src}
                alt={img.alt || img.title || 'Gallery image'}
                loading="lazy"
                className="about-gallery-slide-img"
              />
              <div className="about-gallery-slide-overlay" />
              <div className="about-gallery-slide-zoom">
                <Maximize2 size={15} />
              </div>
              <div className="about-gallery-slide-body">
                {img.title && (
                  <h4 className="about-gallery-slide-title">{img.title}</h4>
                )}
                {(img.location || img.countryName) && (
                  <div className="about-gallery-slide-meta">
                    <MapPin size={12} />
                    <span>{img.location || img.countryName}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-gallery-nav">
        <button
          className="about-gallery-nav-btn"
          onClick={() => scrollBy('prev')}
          disabled={!canPrev}
          aria-label="Previous images"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="about-gallery-nav-btn"
          onClick={() => scrollBy('next')}
          disabled={!canNext}
          aria-label="Next images"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════════════════════ */
const GalleryLightbox = ({ image, images, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const idx = images.findIndex((i) => i.id === image.id);
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
        color: 'white', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
      }}>
        <X size={24} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={idx === 0}
        style={{ ...btnStyle(idx === 0), left: 24 }}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={idx === images.length - 1}
        style={{ ...btnStyle(idx === images.length - 1), right: 24 }}
      >
        <ChevronRight size={24} />
      </button>

      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '85%', maxHeight: '85vh', position: 'relative' }}>
        <motion.img
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={image.src || image.thumb}
          alt={image.alt || image.title}
          style={{
            maxWidth: '100%', maxHeight: '80vh',
            objectFit: 'contain', borderRadius: 12, display: 'block',
          }}
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
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
const About = () => {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const { isAuthenticated } = useUserAuth();

  const { images: galleryImages, loading: galleryLoading, error: galleryError, refetch: galleryRefetch } = useGallery();
  const displayImages = useMemo(() => galleryImages.slice(0, 20), [galleryImages]);

  const lbIndex = useMemo(
    () => displayImages.findIndex((i) => i.id === lightboxImage?.id),
    [displayImages, lightboxImage]
  );
  const prevImage = useCallback(() => {
    if (lbIndex > 0) setLightboxImage(displayImages[lbIndex - 1]);
  }, [lbIndex, displayImages]);
  const nextImage = useCallback(() => {
    if (lbIndex < displayImages.length - 1) setLightboxImage(displayImages[lbIndex + 1]);
  }, [lbIndex, displayImages]);

  const heroImage = 'https://i.pinimg.com/1200x/d6/fd/68/d6fd6828f6d716bf6786bdecef85e642.jpg';

  const VIDEO_PLAYLIST = [
    { id: 1, title: 'Wildlife Memories in Motion', subtitle: 'Experience East Africa through our lens', videoId: 'fKsrERSd_Lo' },
    { id: 2, title: 'The Great Wildebeest Migration', subtitle: 'One of nature\'s most spectacular events', videoId: 'IvCfINrZrLk' },
    { id: 3, title: 'Landscapes of East Africa', subtitle: 'From volcanoes to shorelines', videoId: 'xdFYFB3vyoo' },
  ];

  const VALUES = [
    { icon: <HandHeart size={22} />, title: 'Authentic Connection', desc: 'We facilitate meaningful encounters between travelers and local communities—never staged, always real.' },
    { icon: <Leaf size={22} />, title: 'Conservation First', desc: 'Every journey contributes to wildlife protection and habitat preservation across East Africa.' },
    { icon: <Trees size={22} />, title: 'Community Empowerment', desc: 'We partner with local guides, families, and cooperatives so that tourism uplifts entire villages.' },
    { icon: <ShieldCheck size={22} />, title: 'Uncompromising Safety', desc: 'Licensed guides, vetted vehicles, and 24/7 support ensure your peace of mind at every step.' },
  ];

  return (
    <div className="about-root">
      <style>{ABOUT_STYLES}</style>

      <SEO
        title="About Altuvera Safaris | Authentic East African Adventures"
        description="Discover why travelers choose Altuvera Safaris — Rwanda-based experts in gorilla trekking, wildlife safaris, and cultural immersions across East Africa and beyond."
        keywords={['Altuvera Safaris', 'about', 'gorilla trekking', 'East Africa', 'cultural tours', 'safari company Rwanda']}
        url="/about"
        image="/og-about.jpg"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]}
      />

      <ReviewModal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} />

      <PageHeader
        title="Our Story"
        subtitle="Rwanda-born. East Africa-crafted. Travel that transforms lives — travelers and locals alike."
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

      <section style={{ padding: '16px 24px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <CookieSettingsButton />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHO WE ARE — Core brand story
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: 'linear-gradient(180deg,#fff 0%,#f0fdf4 100%)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <FadeInSection>
            <h2 className="about-section-title">
              We don't just take travelers to Africa.<br />
              <em>We connect them with what makes it extraordinary.</em>
            </h2>
            <p className="about-section-lead" style={{ marginBottom: 24 }}>
              Altuvera Safaris is a Rwandan travel company crafting adventures, wildlife encounters, and cultural immersions across East Africa and beyond.
            </p>
            <p className="about-section-lead" style={{ marginBottom: 24 }}>
              Founded and headquartered in <strong style={{ color: '#059669' }}>Kinigi, Musanze</strong> — at the gateway to Volcanoes National Park — we design journeys that go far beyond sightseeing. Every itinerary is built around three things that never change: <strong>the wild landscapes</strong>, <strong>the incredible wildlife</strong>, and <strong>the resilient communities</strong> that make East Africa unforgettable.
            </p>
            <p className="about-section-lead">
              With over a decade of combined local expertise, our team knows the terrain, speaks the languages, and holds the trust of the parks and communities we visit. That is why travelers choose Altuvera — and why they come back.
            </p>
            {isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setReviewOpen(true)}
                style={{
                  marginTop: 32, padding: '14px 26px', borderRadius: 9999, border: 'none',
                  background: 'linear-gradient(135deg,#059669,#047857)', color: 'white',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 12px 30px rgba(5,150,105,0.22)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <MessageCircle size={16} /> Share Your Experience
              </motion.button>
            )}
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VIDEO SECTION
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <FadeInSection>
              <h2 className="about-section-title">
                Feel East Africa <em>through film</em>
              </h2>
              <p className="about-section-lead">
                Immerse yourself in the sights and sounds of the adventures that await you.
              </p>
            </FadeInSection>
          </div>

          <FadeInSection>
            <div style={{ marginBottom: 24 }}>
              <AutoplayVideoCard video={VIDEO_PLAYLIST[0]} isHero onClick={() => {}} />
            </div>
          </FadeInSection>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px),1fr))',
            gap: 20,
          }}>
            {VIDEO_PLAYLIST.slice(1).map((video, idx) => (
              <FadeInSection key={video.id} delay={idx * 0.1}>
                <AutoplayVideoCard video={video} onClick={() => {}} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY ALTUVERA — Trust builder
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: '#f0fdf4' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <FadeInSection>
              <h2 className="about-section-title">
                Why travel with <em>Altuvera Safaris</em>?
              </h2>
              <p className="about-section-lead">
                Four principles guide every decision we make — from the guides we hire to the lodges we recommend.
              </p>
            </FadeInSection>
          </div>

          <FadeInSection delay={0.1}>
            <div className="about-values-grid">
              {VALUES.map((v, i) => (
                <div key={i} className="about-value-card">
                  <div className="about-value-icon-wrap">{v.icon}</div>
                  <h3 className="about-value-title">{v.title}</h3>
                  <p className="about-value-desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          OUR ADVENTURES — Quick showcase
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 'clamp(32px, 5vw, 60px)',
            alignItems: 'center',
          }}>
            <FadeInSection direction="left">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                gap: 14,
                position: 'relative',
              }}>
                <motion.div whileHover={{ scale: 1.03 }} style={{
                  borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(5,150,105,0.15)', gridRow: 'span 2',
                }}>
                  <img
                    src="https://i.pinimg.com/736x/f3/8e/5d/f38e5ddcc6677a39515284b5c2c7a2e4.jpg"
                    alt="Wildlife safari"
                    style={{ width: '100%', height: '100%', minHeight: 380, objectFit: 'cover' }}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} style={{
                  borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(5,150,105,0.15)',
                }}>
                  <img
                    src="https://i.pinimg.com/1200x/81/45/9e/81459ea63d041cdb6e64d080c07f4937.jpg"
                    alt="Gorilla trekking"
                    style={{ width: '100%', height: '100%', minHeight: 180, objectFit: 'cover' }}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} style={{
                  borderRadius: 20, overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(5,150,105,0.15)',
                }}>
                  <img
                    src="https://i.pinimg.com/1200x/e8/c3/dc/e8c3dc61a18c07053646caddbc45a454.jpg"
                    alt="Cultural immersion"
                    style={{ width: '100%', height: '100%', minHeight: 180, objectFit: 'cover' }}
                  />
                </motion.div>
              </div>
            </FadeInSection>

            <FadeInSection direction="right" delay={0.15}>
              <h2 className="about-section-title">
                <em>Adventures</em>, safaris & cultural immersions
              </h2>
              <div style={{
                width: 60, height: 4, borderRadius: 2, marginBottom: 24,
                background: 'linear-gradient(90deg,#059669,#10B981)',
              }} />
              <p className="about-section-p">
                From tracking <strong style={{ color: '#065f46' }}>mountain gorillas</strong> in the misty forests of Volcanoes National Park to witnessing the <strong style={{ color: '#065f46' }}>Great Migration</strong> thunder across the Serengeti — our journeys are as diverse as the land itself.
              </p>
              <p className="about-section-p">
                We craft personalized itineraries that blend <strong>wildlife adventures</strong>, <strong>cultural immersions</strong> in villages where traditions still shape daily life, and <strong>quiet luxury retreats</strong> where you can simply breathe in the beauty of Africa.
              </p>
              <p className="about-section-p">
                Whether you're seeking the thrill of a Big Five safari, a soul-stirring cultural exchange, or the challenge of climbing Kilimanjaro — <strong style={{ color: '#059669' }}>we build the journey around you</strong>.
              </p>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GALLERY — Horizontal Slider
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: '#f0fdf4' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <FadeInSection>
              <h2 className="about-section-title">
                Captured <em>moments</em>
              </h2>
              <p className="about-section-lead">
                Real photographs from real journeys — swipe or scroll to explore.
              </p>
            </FadeInSection>
          </div>

          {galleryLoading ? (
            <div className="about-gallery-slider">
              <div className="about-gallery-track">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="about-gallery-slide about-shimmer" />
                ))}
              </div>
            </div>
          ) : galleryError ? (
            <div style={{
              textAlign: 'center', padding: '56px 24px',
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20,
            }}>
              <Mountain size={40} color="#EF4444" style={{ marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#064e3b', marginBottom: 8 }}>
                Failed to Load Gallery
              </h3>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>{galleryError}</p>
              <button onClick={galleryRefetch} style={{
                padding: '12px 28px', borderRadius: 9999, border: 'none',
                background: 'linear-gradient(135deg,#059669,#047857)', color: 'white',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <Rocket size={15} /> Try Again
              </button>
            </div>
          ) : displayImages.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '56px 24px',
              background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 20,
            }}>
              <Camera size={44} style={{ color: '#a7f3d0', marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#064e3b', marginBottom: 8 }}>
                No Images Yet
              </h3>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Gallery images will appear here once added.</p>
            </div>
          ) : (
            <FadeInSection delay={0.1}>
              <HorizontalGallery images={displayImages} onImageClick={setLightboxImage} />
            </FadeInSection>
          )}

          <FadeInSection delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Button to="/gallery" variant="primary" size="large">
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Camera size={18} /> Explore Full Gallery
                </span>
              </Button>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THE TEAM — from backend via TeamContent
      ══════════════════════════════════════════ */}
      <TeamContent />

      {/* ══════════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════════ */}
      <section className="about-section" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))',
            gap: 'clamp(28px,4vw,48px)',
          }}>
            <FadeInSection>
              <div style={{
                background: 'linear-gradient(135deg,#059669,#047857)',
                borderRadius: 24, padding: 'clamp(30px,4vw,42px)',
                height: '100%', color: 'white',
              }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'rgba(255,255,255,0.15)', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <Target size={26} />
                </div>
                <h3 style={{
                  fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: 700, marginBottom: 16,
                  fontFamily: "'Playfair Display',serif",
                }}>
                  Our Mission
                </h3>
                <p style={{
                  fontSize: 'clamp(15px,1.2vw,16.5px)', lineHeight: 1.8, opacity: 0.95,
                }}>
                  To design travel experiences that honor East Africa's wildlife, empower its communities, and awaken in every traveler a profound connection to the natural world.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div style={{
                background: 'white', borderRadius: 24, padding: 'clamp(30px,4vw,42px)',
                height: '100%', border: '1px solid rgba(5,150,105,0.15)',
                boxShadow: '0 12px 32px rgba(5,150,105,0.08)',
              }}>
                <div style={{
                  width: 56, height: 56, background: '#ECFDF5', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <Eye size={26} color="#059669" />
                </div>
                <h3 style={{
                  fontSize: 'clamp(22px,2.8vw,28px)', fontWeight: 700, marginBottom: 16,
                  color: '#064e3b', fontFamily: "'Playfair Display',serif",
                }}>
                  Our Vision
                </h3>
                <p style={{
                  fontSize: 'clamp(15px,1.2vw,16.5px)', lineHeight: 1.8, color: '#374151',
                }}>
                  A world where travel is a force for conservation, cultural preservation, and human transformation — where every journey leaves both traveler and destination better than before.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT + CTA
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(56px,7vw,88px) clamp(16px,3vw,32px)',
        background: 'linear-gradient(135deg,#065f46,#064e3b)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{
          maxWidth: 1000, margin: '0 auto',
          textAlign: 'center', position: 'relative', zIndex: 1,
        }}>
          <FadeInSection>
            <h2 style={{
              fontSize: 'clamp(28px,4.5vw,42px)', fontWeight: 800, lineHeight: 1.15,
              color: 'white', fontFamily: "'Playfair Display',serif", marginBottom: 18,
            }}>
              Let's craft your African journey
            </h2>
            <p style={{
              fontSize: 'clamp(15px,1.3vw,17px)', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.88)',
              maxWidth: 640, margin: '0 auto 36px',
            }}>
              Reach us directly, or start planning your itinerary — we respond within 24 hours.
            </p>

            <div className="about-contact-grid">
              <a href="tel:+250785751391" className="about-contact-card">
                <div className="about-contact-icon"><Phone size={20} /></div>
                <div>
                  <div className="about-contact-label">Call Us</div>
                  <div className="about-contact-val">+250 785 751 391</div>
                </div>
              </a>

              <a href="mailto:altuverasafari@gmail.com" className="about-contact-card">
                <div className="about-contact-icon"><Mail size={20} /></div>
                <div>
                  <div className="about-contact-label">Email</div>
                  <div className="about-contact-val">altuverasafari@gmail.com</div>
                </div>
              </a>

              <div className="about-contact-card" style={{ cursor: 'default' }}>
                <div className="about-contact-icon"><MapPin size={20} /></div>
                <div>
                  <div className="about-contact-label">Visit Us</div>
                  <div className="about-contact-val">Kinigi, Musanze, Rwanda</div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', gap: 14, justifyContent: 'center',
              flexWrap: 'wrap', marginTop: 40,
            }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/booking" variant="secondary" size="large"
                  style={{ background: 'white', color: '#065f46', border: 'none', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    Start Planning My Journey <ArrowRight size={18} />
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button to="/contact" variant="outline" size="large"
                  style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)' }}>
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