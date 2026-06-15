// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineArrowRight, HiOutlineSparkles } from "react-icons/hi2";
import { FaStar, FaRegStar, FaQuoteLeft } from "react-icons/fa6";
import { BiSolidQuoteAltLeft } from "react-icons/bi";
import {
  MdOutlineArticle,
  MdOutlineDateRange,
  MdOutlineVisibility,
  MdClose,
  MdOutlineLocationOn,
  MdOutlineExplore,
  MdPlayArrow,
  MdPause,
  MdSkipNext,
  MdSkipPrevious,
  MdPlaylistPlay,
} from "react-icons/md";
import {
  IoChevronBack,
  IoChevronForward,
  IoCompassOutline,
  IoEarthOutline,
  IoHeartOutline,
  IoHeart,
  IoPlayCircle,
  IoCloseCircle,
} from "react-icons/io5";

import Hero, { HERO_SLIDES } from "../components/home/Hero";
import Button from "../components/common/Button";
import SEO from "../components/common/SEO";

import { useApp } from "../context/AppContext";
import { useDestinations } from "../hooks/useDestinations";
import { useTestimonials } from "../hooks/useTestimonials";
import { usePosts } from "../hooks/usePosts";
import { useWishlist } from "../hooks/useWishlist";

import "../styles/Home.css";

/* ═══════════════════════════════════════════
   VIDEO PLAYLIST DATA
   ═══════════════════════════════════════════ */
const VIDEO_PLAYLIST = [
  {
    id: 1,
    title: "Serengeti Great Migration",
    subtitle: "Tanzania's endless plains",
    src: "https://www.youtube.com/watch?v=oTw4XnLnSmU",
    poster: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Mountain Gorillas of Rwanda",
    subtitle: "Volcanoes National Park",
    src: "https://www.youtube.com/watch?v=GCi2-dChYt8",
    poster: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Zanzibar Paradise",
    subtitle: "Indian Ocean coastline",
    src: "https://www.youtube.com/watch?v=068mRPmbThE",
    poster: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Masai Mara Sunset",
    subtitle: "Kenya's golden hour",
    src: "https://www.youtube.com/watch?v=f2tmwZEeqCY",
    poster: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
  },
];

const INTRO_SIDE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=100",
    alt: "African Culture",
  },
  {
    src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=100",
    alt: "Safari Landscape",
  },
];

/* ═══════════════════════════════════════════
   VIDEO PLAYER MODAL
   ═══════════════════════════════════════════ */
const VideoPlayerModal = ({ isOpen, onClose, playlist, startIndex = 0 }) => {
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    setCurrentIdx(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (videoRef.current && isOpen) {
      videoRef.current.load();
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  }, [currentIdx, isOpen]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  const handleEnded = () => {
    if (currentIdx < playlist.length - 1) {
      setCurrentIdx((p) => p + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => setCurrentIdx((p) => (p + 1) % playlist.length);
  const playPrev = () => setCurrentIdx((p) => (p - 1 + playlist.length) % playlist.length);

  const seekTo = (e) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  if (!isOpen) return null;
  const current = playlist[currentIdx];

  return (
    <div className="vmodal-overlay" onClick={onClose}>
      <div className="vmodal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="vmodal-close" onClick={onClose} aria-label="Close">
          <MdClose size={22} />
        </button>

        {/* Video Area */}
        <div className="vmodal-video-area">
          <video
            ref={videoRef}
            src={current.src}
            poster={current.poster}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            playsInline
            className="vmodal-video"
          />

          {/* Center play/pause overlay */}
          <div className="vmodal-center-control" onClick={togglePlay}>
            {!isPlaying && (
              <div className="vmodal-big-play">
                <MdPlayArrow size={48} />
              </div>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="vmodal-controls">
          {/* Progress bar */}
          <div className="vmodal-progress" ref={progressRef} onClick={seekTo}>
            <div className="vmodal-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="vmodal-controls-row">
            <div className="vmodal-controls-left">
              <button className="vmodal-btn" onClick={playPrev} aria-label="Previous">
                <MdSkipPrevious size={22} />
              </button>
              <button className="vmodal-btn vmodal-btn--play" onClick={togglePlay}>
                {isPlaying ? <MdPause size={22} /> : <MdPlayArrow size={22} />}
              </button>
              <button className="vmodal-btn" onClick={playNext} aria-label="Next">
                <MdSkipNext size={22} />
              </button>
            </div>

            <div className="vmodal-track-info">
              <span className="vmodal-track-title">{current.title}</span>
              <span className="vmodal-track-sub">{current.subtitle}</span>
            </div>

            <button
              className={`vmodal-btn vmodal-btn--playlist ${showPlaylist ? "active" : ""}`}
              onClick={() => setShowPlaylist((p) => !p)}
              aria-label="Toggle playlist"
            >
              <MdPlaylistPlay size={22} />
            </button>
          </div>
        </div>

        {/* Playlist Panel */}
        {showPlaylist && (
          <div className="vmodal-playlist">
            <div className="vmodal-playlist-header">
              <MdPlaylistPlay size={18} />
              <span>Playlist ({playlist.length})</span>
            </div>
            {playlist.map((item, i) => (
              <button
                key={item.id}
                className={`vmodal-playlist-item ${i === currentIdx ? "active" : ""}`}
                onClick={() => { setCurrentIdx(i); setIsPlaying(true); }}
              >
                <div className="vmodal-playlist-thumb">
                  <img src={item.poster} alt={item.title} />
                  {i === currentIdx && isPlaying && (
                    <div className="vmodal-playlist-playing">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
                <div className="vmodal-playlist-meta">
                  <span className="vmodal-playlist-name">{item.title}</span>
                  <span className="vmodal-playlist-desc">{item.subtitle}</span>
                </div>
                <span className="vmodal-playlist-num">{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   INTRO MEDIA PANEL
   ═══════════════════════════════════════════ */
const IntroMediaPanel = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <>
      <div className="intro-media-panel">
        {/* Main Card — hero image, click to open video modal */}
        <div className="intro-main-card" onClick={() => setVideoModalOpen(true)}>
          <img
            src={VIDEO_PLAYLIST[0].poster}
            alt="East Africa Safari"
            className="intro-main-card-img"
          />
          <div className="intro-main-card-overlay" />
          <div className="intro-main-card-play">
            <IoPlayCircle size={56} />
          </div>
          <div className="intro-main-card-label">
            <span className="intro-main-card-badge">▶ Watch Reel</span>
            <h3 className="intro-main-card-title">{VIDEO_PLAYLIST[0].title}</h3>
            <p className="intro-main-card-sub">{VIDEO_PLAYLIST[0].subtitle}</p>
          </div>
        </div>

        {/* Side column — 2 smaller cards */}
        <div className="intro-side-col">
          {INTRO_SIDE_IMAGES.map((img, i) => (
            <div key={i} className="intro-side-card">
              <img src={img.src} alt={img.alt} className="intro-side-card-img" />
              <div className="intro-side-card-overlay" />
            </div>
          ))}
        </div>
      </div>

      <VideoPlayerModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        playlist={VIDEO_PLAYLIST}
        startIndex={0}
      />
    </>
  );
};

/* ═══════════════════════════════════════════
   DESTINATION MODAL
   ═══════════════════════════════════════════ */
const DestinationModal = ({ destination, isOpen, onClose, isWishlisted, onWishlistToggle }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !destination) return null;

  const name = destination?.name || destination?.title || "Destination";
  const country = destination?.country || destination?.countryObj?.name || "";
  const description = destination?.description || destination?.shortDescription || destination?.excerpt || "Discover this breathtaking destination.";
  const img = destination?.heroImage || destination?.imageUrl || destination?.image_url || destination?.image || (Array.isArray(destination?.images) ? destination.images[0] : "") || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl : "");
  const slug = destination?.slug || destination?.id || destination?._id;
  const rating = destination?.rating || destination?.averageRating || 0;
  const price = destination?.price || destination?.startingPrice || null;
  const duration = destination?.duration || destination?.tripDuration || null;
  const category = destination?.category || destination?.type || "";
  const highlights = destination?.highlights || destination?.features || [];

  return (
    <div className="dest-modal-overlay" onClick={onClose}>
      <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="dest-modal-close" onClick={onClose}><MdClose /></button>
        <div className="dest-modal-image-section">
          {img ? <img src={img} alt={name} className="dest-modal-image" /> : <div className="dest-modal-image-placeholder"><IoCompassOutline /></div>}
          <div className="dest-modal-image-overlay" />
          <div className="dest-modal-image-badges">
            {category && <span className="dest-modal-badge">{category}</span>}
            {price && <span className="dest-modal-badge dest-modal-badge--price">From ${typeof price === "number" ? price.toLocaleString() : price}</span>}
          </div>
          <button className={`dest-modal-wishlist ${isWishlisted ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); onWishlistToggle(destination?._id || destination?.id || destination?.slug); }}>
            {isWishlisted ? <IoHeart /> : <IoHeartOutline />}
          </button>
          <div className="dest-modal-image-content">
            <h2 className="dest-modal-name">{name}</h2>
            {country && <span className="dest-modal-location"><MdOutlineLocationOn /> {country}</span>}
          </div>
        </div>
        <div className="dest-modal-body">
          {rating > 0 && (
            <div className="dest-modal-rating">
              {Array.from({ length: 5 }).map((_, i) => i < Math.round(rating) ? <FaStar key={i} className="dest-modal-star filled" /> : <FaRegStar key={i} className="dest-modal-star" />)}
              <span className="dest-modal-rating-text">{rating.toFixed(1)}</span>
            </div>
          )}
          {duration && <div className="dest-modal-duration"><MdOutlineExplore /><span>{duration}</span></div>}
          <p className="dest-modal-description">{description.length > 280 ? description.substring(0, 280) + "…" : description}</p>
          {highlights.length > 0 && (
            <div className="dest-modal-highlights">
              <h4>Highlights</h4>
              <ul>{highlights.slice(0, 4).map((h, i) => <li key={i}><span className="dest-modal-highlight-dot" />{typeof h === "string" ? h : h.text || h.title || ""}</li>)}</ul>
            </div>
          )}
          <div className="dest-modal-actions">
            <button className="dest-modal-cta" onClick={() => { onClose(); if (slug) navigate(`/destinations/${slug}`); }}>
              <span>Explore Destination</span><HiOutlineArrowRight />
            </button>
          </div>
        </div>
        <div className="dest-modal-glow" />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   DESTINATION TILE
   ═══════════════════════════════════════════ */
const DestinationTile = ({ destination, index, isWishlisted, onWishlistToggle }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const name = destination?.name || destination?.title || "Destination";
  const country = destination?.country || destination?.countryObj?.name || "";
  const img = destination?.heroImage || destination?.imageUrl || destination?.image_url || destination?.image || (Array.isArray(destination?.images) ? destination.images[0] : "") || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl : "");
  const category = destination?.category || destination?.type || "";

  return (
    <>
      <div className="dest-mystery-card" onClick={() => setModalOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setModalOpen(true)} aria-label={`View ${name}`}>
        <div className="dest-mystery-card-inner">
          <div className="dest-mystery-image-wrap">
            {img ? <img src={img} alt={name} className="dest-mystery-image" loading="lazy" /> : <div className="dest-mystery-placeholder"><IoEarthOutline /></div>}
            <div className="dest-mystery-gradient" />
            <div className="dest-mystery-border-glow" />
          </div>
          <div className="dest-mystery-content">
            {category && <span className="dest-mystery-tag">{category}</span>}
            <h3 className="dest-mystery-name">{name}</h3>
            {country && <span className="dest-mystery-location"><MdOutlineLocationOn /> {country}</span>}
            <span className="dest-mystery-cta">Discover <HiOutlineArrowRight /></span>
          </div>
          <div className="dest-mystery-number">{String(index + 1).padStart(2, "0")}</div>
        </div>
      </div>
      <DestinationModal destination={destination} isOpen={modalOpen} onClose={() => setModalOpen(false)} isWishlisted={isWishlisted} onWishlistToggle={onWishlistToggle} />
    </>
  );
};

/* ═══════════════════════════════════════════
   FEATURE BLOCK
   ═══════════════════════════════════════════ */
const FeatureBlock = ({ data, index }) => {
  const reverse = index % 2 === 1;
  const [curImg, setCurImg] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!data.images || data.images.length <= 1) return;
    const iv = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurImg((p) => (p + 1) % data.images.length);
        setIsTransitioning(false);
      }, 600);
    }, 5000);
    return () => clearInterval(iv);
  }, [data.images]);

  return (
    <section className={`feature-block ${reverse ? "feature-block--reverse" : ""}`}>
      <div className="feature-block-media">
        <div className="feature-block-img-wrap">
          {data.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${data.title} ${i + 1}`}
              className={`feature-block-img ${i === curImg ? "feature-block-img--active" : ""} ${isTransitioning && i === curImg ? "feature-block-img--exiting" : ""}`}
              loading="lazy"
            />
          ))}
          <div className="feature-block-img-overlay" />
        </div>
        {data.images.length > 1 && (
          <div className="feature-block-dots">
            {data.images.map((_, i) => (
              <button key={i} className={`feature-block-dot ${i === curImg ? "active" : ""}`} onClick={() => { setIsTransitioning(false); setCurImg(i); }} aria-label={`Image ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
      <div className="feature-block-body">
        <div className="feature-block-body-inner">
          <span className="feature-block-eyebrow">{data.eyebrow}</span>
          <h3 className="feature-block-title">{data.title}</h3>
          <div className="feature-block-divider" />
          <p className="feature-block-desc">{data.descriptions ? data.descriptions[0] : data.description}</p>
          {data.bullets && (
            <ul className="feature-block-bullets">
              {data.bullets.map((b, i) => <li key={i}><span className="feature-block-bullet-mark" /><span>{b}</span></li>)}
            </ul>
          )}
          <Link to={data.link} className="feature-block-cta"><span>{data.ctaLabel}</span><HiOutlineArrowRight /></Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   TESTIMONIAL SLIDER — FULL WIDTH
   ═══════════════════════════════════════════ */
const TestimonialSlider = ({ items }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideDir, setSlideDir] = useState("next");

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const iv = setInterval(() => {
      setSlideDir("next");
      setActive((p) => (p + 1) % items.length);
    }, 7500);
    return () => clearInterval(iv);
  }, [paused, items.length]);

  const next = () => { setSlideDir("next"); setActive((p) => (p + 1) % items.length); };
  const prev = () => { setSlideDir("prev"); setActive((p) => (p - 1 + items.length) % items.length); };

  if (!items?.length) return null;
  const t = items[active];

  return (
    <div className="testimonial-full" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="testimonial-full-inner">
        {/* Left: decorative */}
        <div className="testimonial-full-decor">
          <div className="testimonial-full-quote-mark">
            <BiSolidQuoteAltLeft />
          </div>
          <div className="testimonial-full-stars">
            {Array.from({ length: 5 }).map((_, i) =>
              i < (t.stars || t.rating || 5) ? <FaStar key={i} className="tstar filled" /> : <FaRegStar key={i} className="tstar" />
            )}
          </div>
        </div>

        {/* Center: quote */}
        <div className="testimonial-full-content" key={active}>
          <blockquote className={`testimonial-full-text testimonial-slide--${slideDir}`}>
            {t.quote || t.content || t.text || t.testimonial_text || "An unforgettable experience that exceeded all expectations."}
          </blockquote>

          <div className={`testimonial-full-author testimonial-slide--${slideDir}`}>
            <div className="testimonial-full-avatar">
              {t.image || t.avatar
                ? <img src={t.image || t.avatar} alt={t.name || "Traveler"} />
                : <span>{(t.name || "T").charAt(0)}</span>
              }
            </div>
            <div className="testimonial-full-meta">
              <strong>{t.name || "Happy Traveler"}</strong>
              <span>{t.role || t.country || t.location || "East Africa"}</span>
            </div>
          </div>
        </div>

        {/* Right: navigation */}
        <div className="testimonial-full-nav">
          <button className="testimonial-full-nav-btn" onClick={prev} aria-label="Previous">
            <IoChevronBack />
          </button>
          <div className="testimonial-full-counter">
            <span className="testimonial-full-current">{String(active + 1).padStart(2, "0")}</span>
            <span className="testimonial-full-divider">/</span>
            <span className="testimonial-full-total">{String(items.length).padStart(2, "0")}</span>
          </div>
          <button className="testimonial-full-nav-btn" onClick={next} aria-label="Next">
            <IoChevronForward />
          </button>
        </div>
      </div>

      {/* Bottom dots */}
      <div className="testimonial-full-dots">
        {items.map((_, i) => (
          <button key={i} className={`testimonial-full-dot ${i === active ? "active" : ""}`} onClick={() => { setSlideDir(i > active ? "next" : "prev"); setActive(i); }} aria-label={`Testimonial ${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   POST CARD
   ═══════════════════════════════════════════ */
const PostCard = ({ post }) => {
  const date = post.published_at || post.created_at;
  const formatted = date ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <article className="post-card-pro">
      <Link to={`/blog/${post.slug}`} className="post-card-pro-link">
        <div className="post-card-pro-image-wrap">
          {post.image_url ? <img src={post.image_url} alt={post.title} className="post-card-pro-image" loading="lazy" /> : <div className="post-card-pro-placeholder"><MdOutlineArticle /></div>}
          {post.category && <span className="post-card-pro-category">{post.category}</span>}
        </div>
        <div className="post-card-pro-content">
          <div className="post-card-pro-meta">
            <span><MdOutlineDateRange /> {formatted}</span>
            {post.read_time > 0 && <span>• {post.read_time} min read</span>}
            {post.view_count > 0 && <span><MdOutlineVisibility /> {post.view_count}</span>}
          </div>
          <h3 className="post-card-pro-title">{post.title}</h3>
          {post.excerpt && <p className="post-card-pro-excerpt">{post.excerpt.length > 140 ? post.excerpt.substring(0, 140) + "…" : post.excerpt}</p>}
          <span className="post-card-pro-readmore">Read article <HiOutlineArrowRight /></span>
        </div>
      </Link>
    </article>
  );
};

/* ═══════════════════════════════════════════
   POSTS GRID
   ═══════════════════════════════════════════ */
const PostsGrid = ({ posts }) => {
  const [page, setPage] = useState(0);
  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const displayed = posts.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="posts-grid-wrapper">
      <div className="posts-grid">
        {displayed.map((p, i) => <PostCard key={p.id || p.slug || i} post={p} />)}
      </div>
      {totalPages > 1 && (
        <div className="posts-grid-pagination">
          <button className="posts-grid-page-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><IoChevronBack /> Prev</button>
          <span className="posts-grid-page-info">{page + 1} / {totalPages}</span>
          <button className="posts-grid-page-btn" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next <IoChevronForward /></button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN HOME
   ═══════════════════════════════════════════ */
const Home = () => {
  const { setIsLoading } = useApp();
  const hasCompletedRef = useRef(false);
  const { destinations: allDest = [], loading: destLoading } = useDestinations({ limit: 100, sort: "-featured" });
  const { testimonials: allTestimonials = [], loading: testimonialsLoading } = useTestimonials();
  const { posts = [], loading: postsLoading } = usePosts({ limit: 12, sort: "created" });
  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  useEffect(() => {
    if (hasCompletedRef.current) return;
    if (destLoading) { setIsLoading(true); return; }
    let cancelled = false;
    const preload = (src) => new Promise((r) => { const img = new Image(); img.onload = r; img.onerror = r; img.src = src; });
    const run = async () => {
      setIsLoading(true);
      await new Promise((r) => requestAnimationFrame(r));
      const urls = new Set();
      HERO_SLIDES?.forEach((s) => { if (s.image) urls.add(s.image); if (s.fallback) urls.add(s.fallback); });
      await Promise.all([...urls].filter(Boolean).slice(0, 5).map(preload));
      if (!cancelled) { hasCompletedRef.current = true; setIsLoading(false); }
    };
    run();
    return () => { cancelled = true; };
  }, [destLoading, setIsLoading]);

const featureBlocks = useMemo(() => [
  {
    eyebrow: "DISCOVER RWANDA",
    title: "Encounter Mountain Gorillas & Explore the Land of a Thousand Hills",
    description:
      "Rwanda offers one of Africa's most exclusive wildlife experiences. Trek through the misty forests of Volcanoes National Park to meet endangered mountain gorillas, walk above the rainforest canopy in Nyungwe, enjoy Big Five safaris in Akagera, and immerse yourself in Kigali's vibrant culture.",
    bullets: [
      "World-famous mountain gorilla trekking",
      "Nyungwe Forest canopy walk & chimpanzee tracking",
      "Big Five safaris in Akagera National Park",
      "Luxury eco-lodges with expert local guides"
    ],
    ctaLabel: "Explore Rwanda",
    link: "/destinations/rwanda",
    images: [
      "https://i.pinimg.com/1200x/04/f3/52/04f3527e8135a4ab914b6257147bf044.jpg",
      "https://i.pinimg.com/1200x/47/49/a6/4749a673fd707e5f24b78d530ec65265.jpg",
      "https://i.pinimg.com/1200x/17/5b/7d/175b7d6895318e3ac0f3f1c5412dc7a6.jpg",
    ],
  },

  {
    eyebrow: "EXPLORE TANZANIA",
    title: "Witness the Great Migration & Conquer Africa's Highest Peak",
    description:
      "From the endless plains of the Serengeti to the snow-capped summit of Mount Kilimanjaro, Tanzania delivers bucket-list adventures. Experience the Great Migration, descend into the Ngorongoro Crater, discover abundant wildlife, and unwind on the turquoise beaches of Zanzibar.",
    bullets: [
      "The Great Wildebeest Migration in Serengeti",
      "Mount Kilimanjaro climbing expeditions",
      "Ngorongoro Crater Big Five safaris",
      "Zanzibar beach escapes & cultural tours"
    ],
    ctaLabel: "Explore Tanzania",
    link: "/destinations/tanzania",
    images: [
      "https://i.pinimg.com/736x/7a/22/e2/7a22e2fbb7beb766a834c4380853cd39.jpg",
      "https://i.pinimg.com/1200x/83/18/87/8318877539f07b4befe950cc66c78750.jpg",
      "https://i.pinimg.com/736x/57/d3/24/57d324e0621e2c7e4906873e8ebd73d5.jpg",
    ],
  },

  {
    eyebrow: "DISCOVER KENYA",
    title: "Experience Legendary Safaris & Coastal Paradise",
    description:
      "Kenya combines iconic wildlife encounters with spectacular landscapes and pristine Indian Ocean beaches. Witness the Great Migration in the Maasai Mara, photograph elephants beneath Mount Kilimanjaro in Amboseli, soar over the savannah in a hot-air balloon, or relax along the white sands of Diani Beach.",
    bullets: [
      "Maasai Mara Great Migration safaris",
      "Amboseli elephant encounters with Kilimanjaro views",
      "Sunrise hot-air balloon adventures",
      "Diani Beach & Swahili coastal experiences"
    ],
    ctaLabel: "Explore Kenya",
    link: "/destinations/kenya",
    images: [
      "https://i.pinimg.com/736x/1f/fb/71/1ffb71af6d57f558303acce6ae0fc8af.jpg",
      "https://i.pinimg.com/736x/7e/9a/00/7e9a0089e1c1f9793fcb60ba776fb790.jpg",
      "https://i.pinimg.com/736x/3c/4a/7a/3c4a7aca8019008379987d991b7e012b.jpg",
    ],
  },
], []);

  return (
    <div className="home-root">
      <SEO title="Altuvera Travel — True Adventures in East Africa" />
      <Hero />

      {/* INTRO */}
      <section className="home-section intro-section">
        <div className="home-container">
          <div className="intro-layout">
            <div className="intro-text">
              <div className="intro-badge"><HiOutlineSparkles /><span>Welcome to Altuvera</span></div>
              <h2 className="intro-heading">Your Gateway to <span className="text-gradient">East Africa</span></h2>
              <div className="intro-divider" />
              <p className="intro-paragraph">
                From the thundering hooves of the Great Migration across the Serengeti, to the quiet wonder of a silverback gorilla's gaze in Bwindi, to the warm hospitality of Maasai elders beneath star-filled skies — Altuvera transforms wanderlust into life-defining adventures.
              </p>
            </div>
            <IntroMediaPanel />
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="home-section destinations-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Handpicked <span className="text-gradient">Destinations</span></h2>
            <p className="section-subtitle">Click any destination to unveil its secrets.</p>
          </div>
          {destLoading ? (
            <div className="dest-mystery-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="dest-mystery-card dest-mystery-card--skeleton"><div className="skeleton-shimmer" /></div>)}
            </div>
          ) : (
            <div className="dest-mystery-grid">
              {allDest.slice(0, 8).map((d, i) => <DestinationTile key={d?._id || d?.slug || i} destination={d} index={i} isWishlisted={isWishlisted(d?._id || d?.id || d?.slug)} onWishlistToggle={toggleWishlist} />)}
            </div>
          )}
          <div className="section-cta">
            <Button to="/destinations" variant="primary" size="large" icon={<HiOutlineArrowRight size={18} />}>View All Destinations</Button>
          </div>
        </div>
      </section>

      {/* FEATURE BLOCKS */}
      <section className="home-section feature-blocks-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">What Makes Us <span className="text-gradient">Different</span></h2>
            <p className="section-subtitle">Three pillars of the Altuvera experience.</p>
          </div>
        </div>
        <div className="feature-blocks-stack">
          {featureBlocks.map((block, i) => <FeatureBlock key={block.title} data={block} index={i} />)}
        </div>
      </section>

      {/* TESTIMONIALS — full width */}
      <section className="home-section testimonials-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Voices of Our <span className="text-gradient">Travelers</span></h2>
            <p className="section-subtitle">Real stories from adventurers who've experienced East Africa with Altuvera.</p>
          </div>
        </div>
        {testimonialsLoading ? (
          <div className="home-container"><div className="skeleton-shimmer" style={{ height: 240, borderRadius: 16 }} /></div>
        ) : allTestimonials.length > 0 ? (
          <TestimonialSlider items={allTestimonials} />
        ) : (
          <div className="home-container"><div className="testimonial-empty"><FaQuoteLeft /><p>Reviews coming soon.</p></div></div>
        )}
      </section>

      {/* BLOG */}
      <section className="home-section posts-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">Stories from the <span className="text-gradient">Wild</span></h2>
            <p className="section-subtitle">Insights, guides, and behind-the-scenes tales.</p>
          </div>
          {postsLoading ? (
            <div className="posts-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="post-card-pro post-card-pro--skeleton">
                  <div className="skeleton-shimmer" style={{ height: 200 }} />
                  <div style={{ padding: "1.25rem" }}>
                    <div className="skeleton-line" style={{ width: "60%", marginBottom: 8 }} />
                    <div className="skeleton-line" style={{ width: "90%", marginBottom: 6 }} />
                    <div className="skeleton-line" style={{ width: "75%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <PostsGrid posts={posts} />
              <div className="section-cta">
                <Button to="/blog" variant="outline" size="large" icon={<HiOutlineArrowRight size={18} />}>Read All Articles</Button>
              </div>
            </>
          ) : (
            <div className="posts-empty"><MdOutlineArticle /><p>New stories coming soon.</p></div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;