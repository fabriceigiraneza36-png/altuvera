// src/pages/Home.jsx
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineArrowRight, HiOutlineSparkles } from "react-icons/hi2";
import { FaStar, FaRegStar }                       from "react-icons/fa6";
import {
  MdOutlineArticle, MdOutlineDateRange, MdOutlineVisibility,
  MdClose, MdOutlineLocationOn, MdOutlineExplore, MdPlayArrow,
  MdSkipNext, MdSkipPrevious, MdPlaylistPlay,
} from "react-icons/md";
import {
  IoChevronBack, IoChevronForward, IoCompassOutline, IoEarthOutline,
  IoHeartOutline, IoHeart, IoPlayCircle,
} from "react-icons/io5";
import {
  Clock, Users, MapPin, ArrowRight, Package, Heart,
} from "lucide-react";

import Hero, { HERO_SLIDES }   from "../components/home/Hero";
import Button                  from "../components/common/Button";
import SEO                     from "../components/common/SEO";
import ReviewFAB from "../components/home/ReviewFAB";

import { useApp }           from "../context/AppContext";
import { useUserAuth }      from "../context/UserAuthContext";
import { useDestinations }  from "../hooks/useDestinations";
import { usePosts }         from "../hooks/usePosts";
import { useWishlist }      from "../hooks/useWishlist";
import { useFeaturedTestimonials } from "../hooks/useTestimonials";

import "../styles/Home.css";

/* ═══════════════════════════════════════════
   PACKAGES API
═══════════════════════════════════════════ */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-jd8f.onrender.com/api";

const apiGet = async (path, params = null) => {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }
  const token =
    localStorage.getItem("altuvera_auth_token") ||
    localStorage.getItem("altuvera_token")      ||
    localStorage.getItem("token")               ||
    null;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) throw new Error(`Server error (${res.status})`);
  return res.json();
};

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmtPrice = (price, currency = "USD") => {
  if (!price && price !== 0) return "Contact Us";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${Number(price).toLocaleString()}`;
  }
};

const fmtDuration = (days, nights) => {
  if (!days) return null;
  const n = nights ?? days - 1;
  return `${days}D / ${n}N`;
};

const parseJsonField = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const THEME = {
  default: { accent: "#059669" },
  dark:    { accent: "#f59e0b" },
  earth:   { accent: "#d97706" },
  ocean:   { accent: "#2563eb" },
  sunset:  { accent: "#ea580c" },
  minimal: { accent: "#334155" },
};

/* ═══════════════════════════════════════════
   INJECTED STYLES
═══════════════════════════════════════════ */
const HOME_PKG_STYLES = `
  .mixed-scroll-row {
    display:flex; gap:1.5rem; overflow-x:auto;
    padding-bottom:1.25rem;
    scroll-snap-type:x mandatory;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  }
  .mixed-scroll-row::-webkit-scrollbar{display:none;}
  .mixed-scroll-row>*{scroll-snap-align:start;flex-shrink:0;}

  .scroll-nav-btn{
    position:absolute;top:50%;transform:translateY(-50%);z-index:10;
    width:2.75rem;height:2.75rem;border-radius:50%;
    background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);
    border:1.5px solid rgba(16,185,129,0.2);
    box-shadow:0 4px 20px rgba(0,0,0,0.12);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:#059669;
    transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .scroll-nav-btn:hover{
    background:#059669;color:#fff;border-color:#059669;
    box-shadow:0 6px 24px rgba(5,150,105,0.35);
    transform:translateY(-50%) scale(1.1);
  }
  .scroll-nav-btn:disabled{opacity:.35;cursor:not-allowed;transform:translateY(-50%) scale(1);}
  .scroll-nav-btn--left{left:-1.25rem;}
  .scroll-nav-btn--right{right:-1.25rem;}

  .hpkg-card{
    width:300px;border-radius:1.5rem;overflow:hidden;
    background:#fff;border:1.5px solid #f1f5f9;
    box-shadow:0 2px 12px rgba(0,0,0,0.06);
    display:flex;flex-direction:column;
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
               box-shadow 0.35s ease,border-color 0.25s ease;
    cursor:pointer;text-decoration:none;color:inherit;position:relative;
  }
  .hpkg-card:hover{
    transform:translateY(-8px) scale(1.015);
    box-shadow:0 24px 56px rgba(0,0,0,0.14),0 4px 16px rgba(5,150,105,0.1);
    border-color:rgba(16,185,129,0.3);
  }
  .hpkg-card:hover .hpkg-img{transform:scale(1.08);}
  .hpkg-img-wrap{position:relative;height:190px;overflow:hidden;background:#e2e8f0;}
  .hpkg-img{width:100%;height:100%;object-fit:cover;transition:transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);}
  .hpkg-img-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55) 0%,transparent 60%);pointer-events:none;}
  .hpkg-body{padding:1.1rem 1.2rem 1.2rem;display:flex;flex-direction:column;flex:1;gap:.5rem;}
  .hpkg-category{font-size:.6rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#059669;}
  .hpkg-title{font-size:1rem;font-weight:700;color:#1e293b;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;}
  .hpkg-card:hover .hpkg-title{color:#059669;}
  .hpkg-meta{display:flex;flex-wrap:wrap;gap:.6rem;font-size:.72rem;color:#94a3b8;}
  .hpkg-meta-item{display:flex;align-items:center;gap:.25rem;}
  .hpkg-desc{font-size:.8rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;}
  .hpkg-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:.5rem;padding-top:.75rem;border-top:1px solid #f1f5f9;gap:.5rem;}
  .hpkg-price{font-size:1.35rem;font-weight:900;line-height:1;color:#059669;}
  .hpkg-price-label{font-size:.65rem;color:#94a3b8;margin-top:.2rem;}
  .hpkg-cta{display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:700;color:#fff;padding:.55rem 1rem;border-radius:.75rem;background:linear-gradient(135deg,#059669 0%,#047857 100%);box-shadow:0 4px 14px rgba(5,150,105,.3);transition:all .25s ease;white-space:nowrap;flex-shrink:0;}
  .hpkg-card:hover .hpkg-cta{box-shadow:0 8px 22px rgba(5,150,105,.45);transform:scale(1.04);}
  .hpkg-badge{position:absolute;top:.75rem;left:.75rem;font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;padding:.3rem .6rem;border-radius:99px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);}
  .hpkg-discount{position:absolute;top:.75rem;right:.75rem;font-size:.6rem;font-weight:900;background:#ef4444;color:#fff;padding:.25rem .5rem;border-radius:99px;}
  .hpkg-duration-pill{position:absolute;bottom:.75rem;right:.75rem;font-size:.65rem;font-weight:700;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;padding:.3rem .65rem;border-radius:99px;display:flex;align-items:center;gap:.3rem;border:1px solid rgba(255,255,255,.12);}
  .hpkg-wish{position:absolute;top:.75rem;right:.75rem;width:2rem;height:2rem;border-radius:50%;background:rgba(255,255,255,.92);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.12);cursor:pointer;transition:transform .2s cubic-bezier(0.34,1.56,0.64,1),background .2s;}
  .hpkg-wish:hover{transform:scale(1.18);background:#fff;}

  .hpost-card{width:280px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;box-shadow:0 2px 12px rgba(0,0,0,.06);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(0.34,1.56,0.64,1),box-shadow .35s ease,border-color .25s ease;cursor:pointer;text-decoration:none;color:inherit;}
  .hpost-card:hover{transform:translateY(-6px) scale(1.012);box-shadow:0 20px 48px rgba(0,0,0,.12);border-color:rgba(16,185,129,.25);}
  .hpost-card:hover .hpost-img{transform:scale(1.07);}
  .hpost-img-wrap{position:relative;height:170px;overflow:hidden;background:#e2e8f0;flex-shrink:0;}
  .hpost-img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(0.25,0.46,0.45,0.94);}
  .hpost-category{position:absolute;top:.75rem;left:.75rem;font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;padding:.3rem .65rem;border-radius:99px;border:1px solid rgba(255,255,255,.15);}
  .hpost-body{padding:1rem 1.1rem 1.2rem;display:flex;flex-direction:column;gap:.45rem;flex:1;}
  .hpost-meta{display:flex;align-items:center;gap:.5rem;font-size:.68rem;color:#94a3b8;flex-wrap:wrap;}
  .hpost-title{font-size:.95rem;font-weight:700;color:#1e293b;line-height:1.38;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;transition:color .2s;}
  .hpost-card:hover .hpost-title{color:#059669;}
  .hpost-excerpt{font-size:.78rem;color:#64748b;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1;}
  .hpost-readmore{display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;font-weight:700;color:#059669;margin-top:.25rem;transition:gap .2s;}
  .hpost-card:hover .hpost-readmore{gap:.55rem;}

  .mixed-section-pill{display:inline-flex;align-items:center;gap:.4rem;font-size:.65rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:.35rem .9rem;border-radius:99px;}
  .mixed-section-pill--pkg{background:rgba(5,150,105,.1);color:#059669;border:1px solid rgba(5,150,105,.2);}
  .mixed-section-pill--story{background:rgba(99,102,241,.08);color:#6366f1;border:1px solid rgba(99,102,241,.18);}

  .hpkg-skeleton{width:300px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkeletonPulse 1.6s ease-in-out infinite;}
  .hpost-skeleton{width:280px;border-radius:1.5rem;overflow:hidden;background:#fff;border:1.5px solid #f1f5f9;flex-shrink:0;animation:hSkeletonPulse 1.6s ease-in-out infinite;}
  @keyframes hSkeletonPulse{0%,100%{opacity:1}50%{opacity:.55}}
  .h-skel{background:#e2e8f0;border-radius:.5rem;}

  .mixed-card-reveal{animation:mixedReveal .55s cubic-bezier(0.34,1.56,0.64,1) both;}
  @keyframes mixedReveal{from{opacity:0;transform:translateY(24px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}

  .scroll-progress-bar{height:3px;border-radius:99px;background:#e2e8f0;overflow:hidden;margin-top:1rem;}
  .scroll-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#059669,#34d399);transition:width .2s ease;}
`;

let homeStylesInjected = false;
function injectHomeStyles() {
  if (homeStylesInjected || typeof document === "undefined") return;
  if (document.getElementById("home-pkg-styles")) {
    homeStylesInjected = true; return;
  }
  const s    = document.createElement("style");
  s.id       = "home-pkg-styles";
  s.textContent = HOME_PKG_STYLES;
  document.head.appendChild(s);
  homeStylesInjected = true;
}

/* ═══════════════════════════════════════════
   VIDEO PLAYLIST
═══════════════════════════════════════════ */
const VIDEO_PLAYLIST = [
  { id: 1, title: "Serengeti Great Migration",   subtitle: "Tanzania's endless plains",  videoId: "jIwyy2D5iag", poster: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Mountain Gorillas of Rwanda", subtitle: "Volcanoes National Park",    videoId: "b1V4pzuncg",  poster: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Zanzibar Paradise",           subtitle: "Indian Ocean coastline",     videoId: "DZnw2TeLuEU", poster: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "Masai Mara Sunset",           subtitle: "Kenya's golden hour",        videoId: "--rk-kMATUc", poster: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80" },
];

const INTRO_SIDE_IMAGES = [
  { src: "https://i.pinimg.com/736x/8b/8b/61/8b8b61c3e5aa4d7e96b4bc15e26aba78.jpg", alt: "African Culture" },
  { src: "https://i.pinimg.com/1200x/33/b4/bc/33b4bc7083952ab04349188419bbcdcb.jpg", alt: "Safari Landscape" },
];

/* ═══════════════════════════════════════════
   VIDEO PLAYER MODAL
═══════════════════════════════════════════ */
const VideoPlayerModal = ({ isOpen, onClose, playlist, startIndex = 0 }) => {
  const [currentIdx,    setCurrentIdx]    = useState(startIndex);
  const [showPlaylist,  setShowPlaylist]  = useState(false);
  const [videoError,    setVideoError]    = useState(false);
  const [isReady,       setIsReady]       = useState(false);
  const playerRef    = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentIdx(startIndex);
    setVideoError(false);
    setIsReady(false);
  }, [startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", h);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !window.YT) return;
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
    setIsReady(false); setVideoError(false);

    const handleStateChange = (e) => {
      if (e.data === window.YT.PlayerState.ENDED)
        setCurrentIdx((p) => (p + 1) % playlist.length);
      if (e.data === window.YT.PlayerState.PLAYING) setVideoError(false);
    };

    const initPlayer = () => {
      if (!containerRef.current) return;
      try {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: "100%", width: "100%",
          videoId: playlist[currentIdx]?.videoId,
          playerVars: { autoplay: 1, modestbranding: 1, rel: 0, fs: 1, enablejsapi: 1 },
          events: {
            onReady:       () => setIsReady(true),
            onStateChange: handleStateChange,
            onError:       () => setVideoError(true),
          },
        });
      } catch { setVideoError(true); }
    };

    const timer = setTimeout(initPlayer, 300);
    return () => {
      clearTimeout(timer);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [isOpen, currentIdx, playlist]);

  const playNext = useCallback(
    () => setCurrentIdx((p) => (p + 1) % playlist.length),
    [playlist.length],
  );
  const playPrev = useCallback(
    () => setCurrentIdx((p) => (p - 1 + playlist.length) % playlist.length),
    [playlist.length],
  );

  if (!isOpen) return null;
  const current = playlist[currentIdx];

  return (
    <div className="vmodal-overlay" onClick={onClose}>
      <div className="vmodal-container" onClick={(e) => e.stopPropagation()}>
        <button className="vmodal-close" onClick={onClose} aria-label="Close video">
          <MdClose size={22} />
        </button>

        <div className="vmodal-video-area">
          {videoError ? (
            <div className="vmodal-error-state">
              <h3 className="vmodal-error-title">Unable to Play Video</h3>
              <div className="vmodal-error-actions">
                <button className="vmodal-error-retry" onClick={() => setVideoError(false)}>
                  <MdPlayArrow size={18} /> Retry
                </button>
                {playlist.length > 1 && (
                  <button className="vmodal-error-skip" onClick={playNext}>
                    <MdSkipNext size={18} /> Next
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="vmodal-yt-player" />
          )}
          {!videoError && !isReady && (
            <div className="vmodal-loading">
              <div className="vmodal-loading-spinner" />
              <p>Loading video…</p>
            </div>
          )}
        </div>

        <div className="vmodal-controls">
          <div className="vmodal-controls-row">
            <div className="vmodal-controls-left">
              <button className="vmodal-btn" onClick={playPrev} aria-label="Previous">
                <MdSkipPrevious size={22} />
              </button>
              <button
                className="vmodal-btn vmodal-btn--play"
                aria-label="Play/Pause"
                onClick={() => {
                  if (!playerRef.current || !window.YT) return;
                  const s = playerRef.current.getPlayerState();
                  s === window.YT.PlayerState.PLAYING
                    ? playerRef.current.pauseVideo()
                    : playerRef.current.playVideo();
                }}
              >
                <MdPlayArrow size={22} />
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
              className={`vmodal-btn ${showPlaylist ? "active" : ""}`}
              onClick={() => setShowPlaylist((p) => !p)}
              aria-label="Toggle playlist"
            >
              <MdPlaylistPlay size={22} />
            </button>
          </div>
        </div>

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
                onClick={() => { setCurrentIdx(i); setVideoError(false); }}
              >
                <div className="vmodal-playlist-thumb">
                  <img src={item.poster} alt={item.title} />
                  {i === currentIdx && isReady && (
                    <div className="vmodal-playlist-playing">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
                <div className="vmodal-playlist-meta">
                  <span className="vmodal-playlist-name">{item.title}</span>
                  <span className="vmodal-playlist-desc">{item.subtitle}</span>
                </div>
                <span className="vmodal-playlist-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
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
  const firstVideo = VIDEO_PLAYLIST[0];

  return (
    <>
      <div className="intro-media-panel">
        <div className="intro-main-card" onClick={() => setVideoModalOpen(true)}>
          <div className="intro-main-card-overlay" />
          <div className="intro-main-card-play">
            <IoPlayCircle size={56} />
          </div>
          <div className="intro-main-card-label">
            <span className="intro-main-card-badge">▶ Watch Reel</span>
            <h3 className="intro-main-card-title">{firstVideo?.title}</h3>
            <p className="intro-main-card-sub">{firstVideo?.subtitle}</p>
          </div>
        </div>

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
const DestinationModal = ({
  destination, isOpen, onClose, isWishlisted, onWishlistToggle,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen || !destination) return null;

  const name        = destination?.name || destination?.title || "Destination";
  const country     = destination?.country || destination?.countryObj?.name || "";
  const description = destination?.description || destination?.shortDescription || destination?.excerpt || "Discover this breathtaking destination.";
  const img         = destination?.heroImage || destination?.imageUrl || destination?.image_url || destination?.image
    || (Array.isArray(destination?.images)  ? destination.images[0]             : "")
    || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl  : "");
  const slug        = destination?.slug || destination?.id || destination?._id;
  const rating      = destination?.rating || destination?.averageRating || 0;
  const price       = destination?.price  || destination?.startingPrice  || null;
  const duration    = destination?.duration || destination?.tripDuration  || null;
  const category    = destination?.category || destination?.type          || "";
  const highlights  = destination?.highlights || destination?.features    || [];
  const wishId      = destination?._id || destination?.id || destination?.slug;

  return (
    <div className="dest-modal-overlay" onClick={onClose}>
      <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="dest-modal-close" onClick={onClose} aria-label="Close">
          <MdClose />
        </button>

        <div className="dest-modal-image-section">
          {img
            ? <img src={img} alt={name} className="dest-modal-image" />
            : <div className="dest-modal-image-placeholder"><IoCompassOutline /></div>
          }
          <div className="dest-modal-image-overlay" />

          <div className="dest-modal-image-badges">
            {category && <span className="dest-modal-badge">{category}</span>}
            {price && (
              <span className="dest-modal-badge dest-modal-badge--price">
                From ${typeof price === "number" ? price.toLocaleString() : price}
              </span>
            )}
          </div>

          <button
            className={`dest-modal-wishlist ${isWishlisted ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onWishlistToggle(wishId); }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? <IoHeart /> : <IoHeartOutline />}
          </button>

          <div className="dest-modal-image-content">
            <h2 className="dest-modal-name">{name}</h2>
            {country && (
              <span className="dest-modal-location">
                <MdOutlineLocationOn /> {country}
              </span>
            )}
          </div>
        </div>

        <div className="dest-modal-body">
          {rating > 0 && (
            <div className="dest-modal-rating">
              {Array.from({ length: 5 }).map((_, i) =>
                i < Math.round(rating)
                  ? <FaStar    key={i} className="dest-modal-star filled" />
                  : <FaRegStar key={i} className="dest-modal-star" />,
              )}
              <span className="dest-modal-rating-text">{rating.toFixed(1)}</span>
            </div>
          )}
          {duration && (
            <div className="dest-modal-duration">
              <MdOutlineExplore /><span>{duration}</span>
            </div>
          )}
          <p className="dest-modal-description">
            {description.length > 280
              ? description.substring(0, 280) + "…"
              : description}
          </p>
          {highlights.length > 0 && (
            <div className="dest-modal-highlights">
              <h4>Highlights</h4>
              <ul>
                {highlights.slice(0, 4).map((h, i) => (
                  <li key={i}>
                    <span className="dest-modal-highlight-dot" />
                    {typeof h === "string" ? h : h.text || h.title || ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="dest-modal-actions">
            <button
              className="dest-modal-cta"
              onClick={() => { onClose(); if (slug) navigate(`/country/${slug}`); }}
            >
              <span>Explore Destination</span>
              <HiOutlineArrowRight />
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

  const name     = destination?.name || destination?.title || "Destination";
  const country  = destination?.country || destination?.countryObj?.name || "";
  const img      = destination?.heroImage || destination?.imageUrl || destination?.image_url || destination?.image
    || (Array.isArray(destination?.images)  ? destination.images[0]            : "")
    || (Array.isArray(destination?.gallery) ? destination.gallery[0]?.imageUrl : "");
  const category = destination?.category || destination?.type || "";

  return (
    <>
      <div
        className="dest-mystery-card"
        onClick={() => setModalOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setModalOpen(true)}
        aria-label={`View ${name}`}
      >
        <div className="dest-mystery-card-inner">
          <div className="dest-mystery-image-wrap">
            {img
              ? <img src={img} alt={name} className="dest-mystery-image" loading="lazy" />
              : <div className="dest-mystery-placeholder"><IoEarthOutline /></div>
            }
            <div className="dest-mystery-gradient" />
            <div className="dest-mystery-border-glow" />
          </div>
          <div className="dest-mystery-content">
            {category && <span className="dest-mystery-tag">{category}</span>}
            <h3 className="dest-mystery-name">{name}</h3>
            {country && (
              <span className="dest-mystery-location">
                <MdOutlineLocationOn /> {country}
              </span>
            )}
            <span className="dest-mystery-cta">
              Discover <HiOutlineArrowRight />
            </span>
          </div>
          <div className="dest-mystery-number">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>
      </div>

      <DestinationModal
        destination={destination}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isWishlisted={isWishlisted}
        onWishlistToggle={onWishlistToggle}
      />
    </>
  );
};

/* ═══════════════════════════════════════════
   FEATURE BLOCK
═══════════════════════════════════════════ */
const FeatureBlock = ({ data, index }) => {
  const reverse = index % 2 === 1;
  const [curImg,         setCurImg]      = useState(0);
  const [isTransitioning, setTransition] = useState(false);

  useEffect(() => {
    if (!data.images || data.images.length <= 1) return;
    const iv = setInterval(() => {
      setTransition(true);
      setTimeout(() => {
        setCurImg((p) => (p + 1) % data.images.length);
        setTransition(false);
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
              className={[
                "feature-block-img",
                i === curImg                    ? "feature-block-img--active"  : "",
                isTransitioning && i === curImg ? "feature-block-img--exiting" : "",
              ].join(" ")}
              loading="lazy"
            />
          ))}
          <div className="feature-block-img-overlay" />
        </div>
        {data.images.length > 1 && (
          <div className="feature-block-dots">
            {data.images.map((_, i) => (
              <button
                key={i}
                className={`feature-block-dot ${i === curImg ? "active" : ""}`}
                onClick={() => { setTransition(false); setCurImg(i); }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="feature-block-body">
        <div className="feature-block-body-inner">
          <span className="feature-block-eyebrow">{data.eyebrow}</span>
          <h3 className="feature-block-title">{data.title}</h3>
          <div className="feature-block-divider" />
          <p className="feature-block-desc">
            {data.descriptions ? data.descriptions[0] : data.description}
          </p>
          {data.bullets && (
            <ul className="feature-block-bullets">
              {data.bullets.map((b, i) => (
                <li key={i}>
                  <span className="feature-block-bullet-mark" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to={data.link} className="feature-block-cta">
            <span>{data.ctaLabel}</span>
            <HiOutlineArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   TESTIMONIAL SLIDER  (backend-driven)
═══════════════════════════════════════════ */
const STATIC_SLIDES = [
  { id: "s1", name: "Sarah Thompson",        meta: "United Kingdom · June 2025", image: "https://picsum.photos/id/64/120/120",   rating: 5, quote: "The canopy walkway was magical. Standing high above the ancient trees with the sounds of the forest all around us was unforgettable." },
  { id: "s2", name: "Michael Okoro",         meta: "Nigeria · Photographer",     image: "https://picsum.photos/id/201/120/120", rating: 5, quote: "Tracking chimpanzees in Nyungwe was the highlight of our Rwanda trip. Professional guides made the experience educational and deeply moving." },
  { id: "s3", name: "Amina & Khalid Hassan", meta: "Kenya · Honeymoon",          image: "https://picsum.photos/id/1005/120/120",rating: 5, quote: "A perfect blend of adventure and serenity. The waterfalls and biodiversity left us speechless. Highly recommend for nature lovers." },
];

const TestimonialSlider = () => {
  const { testimonials, loading } = useFeaturedTestimonials(6);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused,       setPaused]       = useState(false);
  const slidesRef = useRef(null);

  const slides = useMemo(() => {
    if (loading || testimonials.length === 0) return STATIC_SLIDES;
    return testimonials.map((t) => ({
      id:     t.id,
      name:   t.name,
      meta:   [t.trip, t.location, t.date_text].filter(Boolean).join(" · "),
      image:  t.avatar_url || null,
      rating: parseInt(t.rating) || 5,
      quote:  t.testimonial_text,
    }));
  }, [testimonials, loading]);

  const total = slides.length;
  const next  = useCallback(() => setCurrentSlide((c) => (c + 1) % total), [total]);
  const prev  = useCallback(() => setCurrentSlide((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (slidesRef.current)
      slidesRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
  }, [currentSlide]);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(next, 5000);
    return () => clearInterval(iv);
  }, [next, paused]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [next, prev]);

  return (
    <section className="testimonial-compact-section">
      <div className="home-container">
        <div className="section-header">
          <span className="testimonial-compact-label">TESTIMONIALS</span>
          <h2 className="section-title">What Our Guests Say</h2>
        </div>

        <div
          className="testimonial-compact-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div ref={slidesRef} className="testimonial-compact-slides">
            {slides.map((slide, index) => (
              <div key={slide.id || index} className="testimonial-compact-slide">
                <div className="testimonial-compact-inner">
                  <div className="testimonial-compact-quote">"</div>
                  <p className="testimonial-compact-text">{slide.quote}</p>
                  <div className="testimonial-compact-person">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.name}
                        className="testimonial-compact-avatar"
                      />
                    ) : (
                      <div
                        className="testimonial-compact-avatar"
                        style={{
                          background: "#059669",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", color: "#fff",
                          fontWeight: 800, fontSize: "1rem",
                        }}
                      >
                        {(slide.name || "T")[0]}
                      </div>
                    )}
                    <div>
                      <div className="testimonial-compact-name">{slide.name}</div>
                      <div className="testimonial-compact-meta">{slide.meta}</div>
                    </div>
                    <div className="testimonial-compact-stars">
                      {"★".repeat(Math.max(1, Math.min(5, slide.rating || 5)))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="testimonial-compact-arrow testimonial-compact-arrow--left"
            onClick={prev}
            aria-label="Previous testimonial"
          >
            <IoChevronBack />
          </button>
          <button
            type="button"
            className="testimonial-compact-arrow testimonial-compact-arrow--right"
            onClick={next}
            aria-label="Next testimonial"
          >
            <IoChevronForward />
          </button>

          <div className="testimonial-compact-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`testimonial-compact-dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="testimonial-compact-trust">
          <div className="testimonial-compact-trust-item">
            <FaStar size={12} /><span>Verified</span>
          </div>
          <div>TripAdvisor · 4.9/5</div>
          <div>
            {!loading && testimonials.length > 0
              ? `${testimonials.length}+ Reviews`
              : "10+ Happy Visitors"}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════
   HORIZONTAL PACKAGE CARD
═══════════════════════════════════════════ */
const HorizontalPackageCard = React.memo(function HorizontalPackageCard({
  pkg, index, wishlist, onWishlist,
}) {
  const t      = THEME[pkg.card_theme] || THEME.default;
  const isWish = wishlist?.has(pkg.id);
  const accent = pkg.accent_color || t.accent || "#059669";
  const hasDisc = Number(pkg.discount_percent) > 0;
  const cover  = pkg.cover_image_url || pkg.thumbnail_url || null;
  const feats  = useMemo(() => parseJsonField(pkg.features).slice(0, 2), [pkg.features]);

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlist?.(pkg.id);
  };

  return (
    <Link
      to={`/packages/${pkg.slug || pkg.id}`}
      className="hpkg-card mixed-card-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="hpkg-img-wrap">
        {cover ? (
          <img src={cover} alt={pkg.title} className="hpkg-img" loading="lazy" />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(145deg,${accent}33,${accent}77)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Package size={40} style={{ color: accent, opacity: 0.4 }} />
          </div>
        )}
        <div className="hpkg-img-gradient" />

        {pkg.badge_label ? (
          <span className="hpkg-badge" style={{ backgroundColor: pkg.badge_color || accent }}>
            {pkg.badge_label}
          </span>
        ) : pkg.is_featured ? (
          <span className="hpkg-badge" style={{ backgroundColor: "#f59e0b" }}>
            ⭐ Featured
          </span>
        ) : null}

        {hasDisc && (
          <span className="hpkg-discount">-{pkg.discount_percent}% OFF</span>
        )}
        {!hasDisc && (
          <button className="hpkg-wish" onClick={handleWish} aria-label="Wishlist">
            <Heart
              size={14}
              style={{
                fill:  isWish ? "#ef4444" : "none",
                color: isWish ? "#ef4444" : "#64748b",
              }}
            />
          </button>
        )}
        {pkg.duration_days && (
          <div className="hpkg-duration-pill">
            <Clock size={10} />
            {fmtDuration(pkg.duration_days, pkg.duration_nights)}
          </div>
        )}
        {pkg.is_sold_out && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              color: "#fff", fontWeight: 900, fontSize: "0.75rem",
              letterSpacing: "0.1em", textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.4)",
              padding: "0.4rem 1rem", borderRadius: "99px",
              backdropFilter: "blur(6px)",
            }}>Sold Out</span>
          </div>
        )}
      </div>

      <div className="hpkg-body">
        {pkg.category && (
          <span className="hpkg-category">{pkg.category}</span>
        )}
        <h3 className="hpkg-title">{pkg.title}</h3>

        <div className="hpkg-meta">
          {(pkg.destination || pkg.country) && (
            <span className="hpkg-meta-item">
              <MapPin size={10} style={{ color: "#059669", flexShrink: 0 }} />
              {[pkg.destination, pkg.country].filter(Boolean).join(", ")}
            </span>
          )}
          {pkg.max_travelers && (
            <span className="hpkg-meta-item">
              <Users size={10} style={{ color: "#059669" }} />
              Max {pkg.max_travelers}
            </span>
          )}
        </div>

        {pkg.short_description && (
          <p className="hpkg-desc">{pkg.short_description}</p>
        )}

        {feats.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {feats.map((f, i) => (
              <span key={i} style={{
                fontSize: "0.65rem", fontWeight: 700,
                padding: "0.2rem 0.6rem", borderRadius: "99px",
                background: `${accent}15`, color: accent,
                border: `1px solid ${accent}30`,
              }}>
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="hpkg-footer">
          <div>
            {hasDisc && (() => {
              const orig = Number(pkg.price) / (1 - Number(pkg.discount_percent) / 100);
              return (
                <p style={{
                  fontSize: "0.7rem", color: "#94a3b8",
                  textDecoration: "line-through", lineHeight: 1, marginBottom: "0.15rem",
                }}>
                  {fmtPrice(orig, pkg.currency)}
                </p>
              );
            })()}
            <p className="hpkg-price" style={{ color: accent }}>
              {pkg.is_price_visible !== false
                ? fmtPrice(pkg.price, pkg.currency)
                : "POA"}
            </p>
            <p className="hpkg-price-label">{pkg.price_label || "per person"}</p>
          </div>
          <span className="hpkg-cta">
            Explore <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
});

/* ═══════════════════════════════════════════
   HORIZONTAL POST CARD
═══════════════════════════════════════════ */
const HorizontalPostCard = React.memo(function HorizontalPostCard({ post, index }) {
  const date      = post.published_at || post.created_at;
  const formatted = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="hpost-card mixed-card-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="hpost-img-wrap">
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="hpost-img" loading="lazy" />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg,#e2e8f0,#f1f5f9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MdOutlineArticle size={36} style={{ color: "#94a3b8" }} />
          </div>
        )}
        {post.category && (
          <span className="hpost-category">{post.category}</span>
        )}
      </div>

      <div className="hpost-body">
        <div className="hpost-meta">
          {formatted && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <MdOutlineDateRange size={11} /> {formatted}
            </span>
          )}
          {post.read_time > 0 && <span>· {post.read_time} min</span>}
          {post.view_count > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <MdOutlineVisibility size={11} /> {post.view_count}
            </span>
          )}
        </div>
        <h3 className="hpost-title">{post.title}</h3>
        {post.excerpt && (
          <p className="hpost-excerpt">
            {post.excerpt.length > 120
              ? post.excerpt.substring(0, 120) + "…"
              : post.excerpt}
          </p>
        )}
        <span className="hpost-readmore">
          Read article <HiOutlineArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
});

/* ── Skeletons ── */
const PackageSkeleton = () => (
  <div className="hpkg-skeleton">
    <div className="h-skel" style={{ height: 190 }} />
    <div style={{ padding: "1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div className="h-skel" style={{ height: 10, width: "40%" }} />
      <div className="h-skel" style={{ height: 18, width: "85%" }} />
      <div className="h-skel" style={{ height: 10, width: "60%" }} />
      <div className="h-skel" style={{ height: 32, width: "100%" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div className="h-skel" style={{ height: 22, width: 60, borderRadius: 99 }} />
        <div className="h-skel" style={{ height: 22, width: 50, borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
        <div className="h-skel" style={{ height: 28, width: 80 }} />
        <div className="h-skel" style={{ height: 34, width: 90, borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const PostSkeleton = () => (
  <div className="hpost-skeleton">
    <div className="h-skel" style={{ height: 170 }} />
    <div style={{ padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
      <div className="h-skel" style={{ height: 10, width: "50%" }} />
      <div className="h-skel" style={{ height: 16, width: "90%" }} />
      <div className="h-skel" style={{ height: 14, width: "70%" }} />
      <div className="h-skel" style={{ height: 28, width: "100%" }} />
      <div className="h-skel" style={{ height: 12, width: "40%" }} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MIXED SCROLL ROW
═══════════════════════════════════════════ */
const MixedScrollRow = ({
  packages, posts, loadingPkgs, loadingPosts, wishlist, onWishlist,
}) => {
  const rowRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canLeft,        setCanLeft]        = useState(false);
  const [canRight,       setCanRight]       = useState(true);

  const items = useMemo(() => {
    const result = [];
    const pkgs   = packages.slice(0, 12);
    const strs   = posts.slice(0, 6);
    let pi = 0, si = 0;
    while (pi < pkgs.length || si < strs.length) {
      for (let k = 0; k < 2 && pi < pkgs.length; k++, pi++)
        result.push({ type: "pkg",  data: pkgs[pi], idx: pi });
      if (si < strs.length) {
        result.push({ type: "post", data: strs[si], idx: si });
        si++;
      }
    }
    return result;
  }, [packages, posts]);

  const updateScrollState = useCallback(() => {
    const el = rowRef.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pct = max > 0 ? el.scrollLeft / max : 0;
    setScrollProgress(pct * 100);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = rowRef.current; if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, items]);

  const scroll = useCallback((dir) => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -360 : 360, behavior: "smooth",
    });
  }, []);

  const isLoading = loadingPkgs || loadingPosts;

  return (
    <div>
      {/* Row header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span className="mixed-section-pill mixed-section-pill--pkg">
            <Package size={11} /> Packages
          </span>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>+</span>
          <span className="mixed-section-pill mixed-section-pill--story">
            <MdOutlineArticle size={11} /> Stories
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/packages" style={{
            fontSize: "0.78rem", fontWeight: 700, color: "#059669",
            textDecoration: "none", display: "flex", alignItems: "center",
            gap: "0.3rem", padding: "0.4rem 0.85rem",
            border: "1.5px solid rgba(5,150,105,0.25)",
            borderRadius: "99px", background: "rgba(5,150,105,0.05)",
          }}>
            All Packages <ArrowRight size={12} />
          </Link>
          <Link to="/blog" style={{
            fontSize: "0.78rem", fontWeight: 700, color: "#6366f1",
            textDecoration: "none", display: "flex", alignItems: "center",
            gap: "0.3rem", padding: "0.4rem 0.85rem",
            border: "1.5px solid rgba(99,102,241,0.2)",
            borderRadius: "99px", background: "rgba(99,102,241,0.04)",
          }}>
            All Stories <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Scrollable track */}
      <div style={{ position: "relative" }}>
        <button
          className="scroll-nav-btn scroll-nav-btn--left"
          onClick={() => scroll("left")}
          disabled={!canLeft}
          aria-label="Scroll left"
        >
          <IoChevronBack size={18} />
        </button>

        <div
          ref={rowRef}
          className="mixed-scroll-row"
          style={{ padding: "0.5rem 0.25rem 1.25rem" }}
        >
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) =>
                i % 3 === 2
                  ? <PostSkeleton    key={i} />
                  : <PackageSkeleton key={i} />
              )
            : items.map((item, i) =>
                item.type === "pkg" ? (
                  <HorizontalPackageCard
                    key={`pkg-${item.data.id || i}`}
                    pkg={item.data}
                    index={i}
                    wishlist={wishlist}
                    onWishlist={onWishlist}
                  />
                ) : (
                  <HorizontalPostCard
                    key={`post-${item.data.id || item.data.slug || i}`}
                    post={item.data}
                    index={i}
                  />
                )
              )
          }
        </div>

        <button
          className="scroll-nav-btn scroll-nav-btn--right"
          onClick={() => scroll("right")}
          disabled={!canRight}
          aria-label="Scroll right"
        >
          <IoChevronForward size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="scroll-progress-bar">
        <div
          className="scroll-progress-fill"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN HOME
═══════════════════════════════════════════ */
const Home = () => {
  useEffect(injectHomeStyles, []);

  const { setIsLoading }      = useApp();
  const { isAuthenticated }   = useUserAuth();
  const hasCompletedRef       = useRef(false);

  const { destinations: allDest = [], loading: destLoading } =
    useDestinations({ limit: 100, sort: "-featured" });

  const { posts = [], loading: postsLoading } =
    usePosts({ limit: 12, sort: "created" });

  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();

  /* packages */
  const [packages,    setPackages]    = useState([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [pkgWishlist, setPkgWishlist] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem("altuvera_wishlist") || "[]"),
      );
    } catch { return new Set(); }
  });

  useEffect(() => {
    setLoadingPkgs(true);
    apiGet("/packages", {
      limit: 12, sortBy: "sort_order", order: "asc", is_active: true,
    })
      .then((data) => setPackages(data.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoadingPkgs(false));
  }, []);

  const handlePkgWishlist = useCallback((id) => {
    setPkgWishlist((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      try {
        localStorage.setItem("altuvera_wishlist", JSON.stringify([...n]));
      } catch {}
      return n;
    });
  }, []);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  /* preload hero images */
  useEffect(() => {
    if (hasCompletedRef.current) return;
    if (destLoading) { setIsLoading(true); return; }
    let cancelled = false;
    const preload = (src) =>
      new Promise((r) => { const img = new Image(); img.onload = r; img.onerror = r; img.src = src; });

    (async () => {
      setIsLoading(true);
      await new Promise((r) => requestAnimationFrame(r));
      const urls = new Set();
      HERO_SLIDES?.forEach((s) => {
        if (s.image)    urls.add(s.image);
        if (s.fallback) urls.add(s.fallback);
      });
      await Promise.all([...urls].filter(Boolean).slice(0, 5).map(preload));
      if (!cancelled) { hasCompletedRef.current = true; setIsLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [destLoading, setIsLoading]);

  /* feature blocks data */
  const featureBlocks = useMemo(() => [
    {
      eyebrow: "DISCOVER RWANDA",
      title: "Encounter Mountain Gorillas & Explore the Land of a Thousand Hills",
      description: "Rwanda offers one of Africa's most exclusive wildlife experiences. Trek through the misty forests of Volcanoes National Park to meet endangered mountain gorillas, walk above the rainforest canopy in Nyungwe, enjoy Big Five safaris in Akagera, and immerse yourself in Kigali's vibrant culture.",
      bullets: [
        "World-famous mountain gorilla trekking",
        "Nyungwe Forest canopy walk & chimpanzee tracking",
        "Big Five safaris in Akagera National Park",
        "Luxury eco-lodges with expert local guides",
      ],
      ctaLabel: "Explore Rwanda",
      link: "/country/rwanda",
      images: [
        "https://i.pinimg.com/1200x/04/f3/52/04f3527e8135a4ab914b6257147bf044.jpg",
        "https://i.pinimg.com/1200x/47/49/a6/4749a673fd707e5f24b78d530ec65265.jpg",
        "https://i.pinimg.com/1200x/17/5b/7d/175b7d6895318e3ac0f3f1c5412dc7a6.jpg",
      ],
    },
    {
      eyebrow: "EXPLORE TANZANIA",
      title: "Witness the Great Migration & Conquer Africa's Highest Peak",
      description: "From the endless plains of the Serengeti to the snow-capped summit of Mount Kilimanjaro, Tanzania delivers bucket-list adventures. Experience the Great Migration, descend into the Ngorongoro Crater, discover abundant wildlife, and unwind on the turquoise beaches of Zanzibar.",
      bullets: [
        "The Great Wildebeest Migration in Serengeti",
        "Mount Kilimanjaro climbing expeditions",
        "Ngorongoro Crater Big Five safaris",
        "Zanzibar beach escapes & cultural tours",
      ],
      ctaLabel: "Explore Tanzania",
      link: "/country/tanzania",
      images: [
        "https://i.pinimg.com/736x/7a/22/e2/7a22e2fbb7beb766a834c4380853cd39.jpg",
        "https://i.pinimg.com/1200x/83/18/87/8318877539f07b4befe950cc66c78750.jpg",
        "https://i.pinimg.com/736x/57/d3/24/57d324e0621e2c7e4906873e8ebd73d5.jpg",
      ],
    },
    {
      eyebrow: "DISCOVER KENYA",
      title: "Experience Legendary Safaris & Coastal Paradise",
      description: "Kenya combines iconic wildlife encounters with spectacular landscapes and pristine Indian Ocean beaches. Witness the Great Migration in the Maasai Mara, photograph elephants beneath Mount Kilimanjaro in Amboseli, soar over the savannah in a hot-air balloon, or relax along the white sands of Diani Beach.",
      bullets: [
        "Maasai Mara Great Migration safaris",
        "Amboseli elephant encounters with Kilimanjaro views",
        "Sunrise hot-air balloon adventures",
        "Diani Beach & Swahili coastal experiences",
      ],
      ctaLabel: "Explore Kenya",
      link: "/country/kenya",
      images: [
        "https://i.pinimg.com/736x/1f/fb/71/1ffb71af6d57f558303acce6ae0fc8af.jpg",
        "https://i.pinimg.com/736x/7e/9a/00/7e9a0089e1c1f9793fcb60ba776fb790.jpg",
        "https://i.pinimg.com/736x/3c/4a/7a/3c4a7aca8019008379987d991b7e012b.jpg",
      ],
    },
  ], []);

  /* ── RENDER ── */
  return (
    <div className="home-root">
      <SEO title="Altuvera Travel — True Adventures in High Places & Deep Culture" />

      {/* 1. Hero */}
      <Hero />

      {/* 2. Intro */}
      <section className="home-section intro-section">
        <div className="home-container">
          <div className="intro-layout">
            <div className="intro-text">
              <div className="intro-badge">
                <HiOutlineSparkles /><span>Welcome to Altuvera</span>
              </div>
              <h2 className="intro-heading">
                Your Gateway to{" "}
                <span className="text-gradient">East Africa</span>
              </h2>
              <div className="intro-divider" />
              <p className="intro-paragraph">
                From the thundering hooves of the Great Migration across the
                Serengeti, to the quiet wonder of a silverback gorilla's gaze in
                Bwindi, to the warm hospitality of Maasai elders beneath
                star-filled skies — Altuvera transforms wanderlust into
                life-defining adventures.
              </p>
            </div>
            <IntroMediaPanel />
          </div>
        </div>
      </section>

      {/* 3. Destinations */}
      <section className="home-section destinations-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">
              Handpicked{" "}
              <span className="text-gradient">Destinations</span>
            </h2>
            <p className="section-subtitle">
              Click any destination to unveil its secrets.
            </p>
          </div>

          {destLoading ? (
            <div className="dest-mystery-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="dest-mystery-card dest-mystery-card--skeleton">
                  <div className="skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : (
            <div className="dest-mystery-grid">
              {allDest.slice(0, 8).map((d, i) => (
                <DestinationTile
                  key={d?._id || d?.slug || i}
                  destination={d}
                  index={i}
                  isWishlisted={isWishlisted(d?._id || d?.id || d?.slug)}
                  onWishlistToggle={toggleWishlist}
                />
              ))}
            </div>
          )}

          <div className="section-cta">
            <Button
              to="/destinations"
              variant="primary"
              size="large"
              icon={<HiOutlineArrowRight size={18} />}
            >
              View All Destinations
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Feature blocks */}
      <section className="home-section feature-blocks-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title">
              What Makes Us{" "}
              <span className="text-gradient">Different</span>
            </h2>
            <p className="section-subtitle">
              Three pillars of the Altuvera experience.
            </p>
          </div>
        </div>
        <div className="feature-blocks-stack">
          {featureBlocks.map((block, i) => (
            <FeatureBlock key={block.title} data={block} index={i} />
          ))}
        </div>
      </section>

      {/* 5. Testimonial compact slider (always visible — backend-driven) */}
      <TestimonialSlider />

      {/* 6. Mixed packages + stories */}
      <section className="home-section posts-section">
        <div className="home-container">
          <div className="section-header" style={{ marginBottom: "0.5rem" }}>
            <h2 className="section-title">
              Explore Packages &{" "}
              <span className="text-gradient">Stories</span>
            </h2>
            <p className="section-subtitle">
              Curated adventures and field notes — scroll to discover.
            </p>
          </div>

          <MixedScrollRow
            packages={packages}
            posts={posts}
            loadingPkgs={loadingPkgs}
            loadingPosts={postsLoading}
            wishlist={pkgWishlist}
            onWishlist={handlePkgWishlist}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. MEMBER REVIEW SECTION
          — Conditionally rendered ONLY for authenticated users.
          — When logged out: component is not in the DOM at all.
          — No empty space, no layout shift, no placeholder.
          ════════════════════════════════════════════ */}
      {isAuthenticated && <ReviewFAB />}

    </div>
  );
};

export default Home;