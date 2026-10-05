// src/pages/Gallery.jsx
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiX,
  FiGrid,
  FiList,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiArrowUp,
  FiTag,
  FiMapPin,
  FiCamera,
  FiStar,
  FiHeart,
  FiDownload,
  FiShare2,
  FiZoomIn,
  FiRefreshCw,
  FiAlertCircle,
  FiImage,
  FiChevronDown,
  FiSliders,
  FiInfo,
  FiExternalLink,
} from "react-icons/fi";
import SEO from "../components/common/SEO";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { useGallery } from "../hooks/useGallery";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');

  :root {
    --g-green-50:   #ECFDF5;
    --g-green-100:  #D1FAE5;
    --g-green-200:  #A7F3D0;
    --g-green-400:  #34D399;
    --g-green-500:  #10B981;
    --g-green-600:  #059669;
    --g-green-700:  #047857;
    --g-green-800:  #065F46;
    --g-green-900:  #064E3B;
    --g-white:      #FFFFFF;
    --g-off-white:  #F8FFFE;
    --g-gray-50:    #F9FAFB;
    --g-gray-100:   #F3F4F6;
    --g-gray-200:   #E5E7EB;
    --g-gray-400:   #9CA3AF;
    --g-gray-500:   #6B7280;
    --g-gray-600:   #4B5563;
    --g-gray-700:   #374151;
    --g-gray-800:   #1F2937;
    --g-gray-900:   #111827;
    --g-shadow-sm:  0 1px 4px rgba(5,150,105,0.06);
    --g-shadow-md:  0 4px 20px rgba(5,150,105,0.10);
    --g-shadow-lg:  0 12px 44px rgba(5,150,105,0.14);
    --g-shadow-xl:  0 24px 64px rgba(5,150,105,0.18);
    --g-shadow-green: 0 8px 32px rgba(5,150,105,0.24);
    --g-radius-sm:  8px;
    --g-radius-md:  14px;
    --g-radius-lg:  20px;
    --g-radius-xl:  28px;
    --g-radius-full:9999px;
    --g-ease:       cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes gFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gSlideUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gScaleIn {
    from { opacity:0; transform:scale(0.88); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes gShimmer {
    0%   { background-position:-200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes gFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-8px); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .g-shimmer {
    background: linear-gradient(110deg,#d1fae5 8%,#ecfdf5 18%,#d1fae5 33%);
    background-size: 200% 100%;
    animation: gShimmer 1.6s ease infinite;
  }

  .g-card {
    transition: all 0.38s var(--g-ease);
    cursor: pointer;
  }
  .g-card:hover { transform: translateY(-6px); }
  .g-card:hover .g-card-overlay { opacity: 1; }
  .g-card:hover .g-card-img { transform: scale(1.08); }
  .g-card:hover .g-card-actions { opacity:1; transform:translateY(0); }

  .g-card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(6,79,70,0.88) 0%, rgba(6,79,70,0.3) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.38s var(--g-ease);
  }

  .g-card-img {
    transition: transform 0.6s var(--g-ease);
    will-change: transform;
  }

  .g-card-actions {
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s var(--g-ease);
  }


  /* Immersive Instagram-style fullscreen viewer */
  .g-viewer {
    position: fixed; inset: 0; z-index: 99999; color: white;
    overflow: hidden; background: #07130f;
    animation: gViewerIn .35s ease both;
  }
  .g-viewer-backdrop {
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, rgba(6,78,59,.35), rgba(2,12,9,.98) 72%);
  }
  .g-viewer-topbar, .g-viewer-bottom { position: absolute; z-index: 5; left: 0; right: 0; }
  .g-viewer-topbar {
    top: 0; padding: 18px 22px 14px;
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px;
    background: linear-gradient(to bottom, rgba(0,0,0,.65), transparent);
  }
  .g-story-progress { display:flex; gap:5px; min-width:0; }
  .g-story-progress button {
    height: 3px; flex:1; min-width:8px; border:0; border-radius:99px;
    background: rgba(255,255,255,.28); cursor:pointer; transition:all .3s ease;
  }
  .g-story-progress button.active { background:#fff; box-shadow:0 0 10px rgba(255,255,255,.45); }
  .g-viewer-counter { font-size:12px; font-weight:700; letter-spacing:.08em; white-space:nowrap; }
  .g-viewer-close {
    justify-self:end; width:42px; height:42px; border:1px solid rgba(255,255,255,.18);
    border-radius:50%; background:rgba(255,255,255,.1); color:#fff; display:grid; place-items:center;
    cursor:pointer; backdrop-filter:blur(14px); transition:transform .25s ease, background .25s ease;
  }
  .g-viewer-close:hover { transform:scale(1.08); background:rgba(5,150,105,.8); }
  .g-story-stage { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; min-height:0; }
  .g-story-track {
    width:100%; height:100%; display:flex; align-items:center; gap:clamp(14px,3vw,42px);
    overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory; scroll-behavior:smooth;
    overscroll-behavior-x:contain; padding:clamp(78px,10vh,105px) max(9vw,78px) clamp(120px,17vh,155px);
    -webkit-overflow-scrolling:touch; touch-action:pan-x;
  }
  .g-story-slide {
    flex:0 0 auto; width:auto; height:auto; min-height:0;
    scroll-snap-align:center; scroll-snap-stop:always; display:flex; align-items:center; justify-content:center;
    opacity:.28; filter:blur(7px) saturate(.65); transform:scale(.82);
    transition:transform .55s cubic-bezier(.2,.8,.2,1), opacity .55s ease, filter .55s ease;
    cursor:pointer;
  }
  .g-story-slide.is-active { opacity:1; filter:none; transform:scale(1); cursor:default; }
  .g-story-image-shell {
    position:relative; width:100%; height:100%; min-width:0; min-height:0; overflow:hidden; border-radius:24px;
    box-shadow:0 30px 100px rgba(0,0,0,.55); background:#10241d;
    display:flex; align-items:center; justify-content:center;
  }
  .g-story-image-shell img {
    width:100%; height:100%; max-width:100%; max-height:100%; display:block; object-fit:cover; user-select:none;
    -webkit-user-drag:none; animation:gStoryImageIn .55s ease both;
  }
  .g-story-caption {
    position:absolute; left:0; right:0; bottom:0; padding:65px 24px 22px;
    background:linear-gradient(transparent,rgba(0,0,0,.82)); pointer-events:none;
  }
  .g-story-caption h2 { margin:0 0 5px; font:700 clamp(18px,2vw,27px) 'Playfair Display',serif; }
  .g-story-caption span { display:flex; align-items:center; gap:6px; font-size:13px; opacity:.9; }
  .g-viewer-arrow {
    position:absolute; z-index:20; width:54px; height:54px; border-radius:50%;
    border:1px solid rgba(255,255,255,.34); background:rgba(5,30,22,.62); color:#fff;
    display:grid; place-items:center; cursor:pointer; backdrop-filter:blur(18px) saturate(140%);
    -webkit-backdrop-filter:blur(18px) saturate(140%);
    box-shadow:0 8px 28px rgba(0,0,0,.28);
    transition:transform .25s cubic-bezier(.2,.8,.2,1), background .25s ease, border-color .25s ease,
      box-shadow .25s ease, opacity .25s ease;
    overflow:hidden; isolation:isolate;
    animation:gArrowGlow 2.8s ease-in-out infinite;
  }
  .g-viewer-arrow::before {
    content:""; position:absolute; inset:-45%;
    background:radial-gradient(circle, rgba(52,211,153,.34) 0%, rgba(52,211,153,0) 62%);
    opacity:.7; z-index:-1; transition:transform .35s ease, opacity .25s ease;
  }
  .g-viewer-arrow::after {
    content:""; position:absolute; inset:2px; border-radius:50%;
    border:1px solid rgba(255,255,255,.10); pointer-events:none;
  }
  .g-viewer-arrow:hover:not(:disabled) {
    transform:scale(1.12);
    background:linear-gradient(135deg,#10b981,#047857);
    border-color:rgba(167,243,208,.7);
    box-shadow:0 12px 34px rgba(0,0,0,.4), 0 0 28px rgba(16,185,129,.26);
  }
  .g-viewer-arrow:hover:not(:disabled)::before { transform:scale(1.35); opacity:1; }
  .g-viewer-arrow:active:not(:disabled) { transform:scale(.91); }
  .g-viewer-arrow:focus-visible {
    outline:3px solid rgba(110,231,183,.9); outline-offset:4px;
  }
  .g-viewer-arrow:disabled {
    opacity:.22; cursor:not-allowed; animation:none; pointer-events:none;
  }
  .g-viewer-arrow-left { left:clamp(8px,2vw,24px); animation-name:gArrowGlow,gArrowFloatLeft; animation-duration:2.8s,2.2s; animation-iteration-count:infinite; animation-timing-function:ease-in-out; }
  .g-viewer-arrow-right { right:clamp(8px,2vw,24px); animation-name:gArrowGlow,gArrowFloatRight; animation-duration:2.8s,2.2s; animation-iteration-count:infinite; animation-timing-function:ease-in-out; }
  .g-viewer-bottom {
    bottom:0; padding:15px 22px 22px; background:linear-gradient(transparent,rgba(0,0,0,.78) 28%);
  }
  .g-info-link {
    display:flex; align-items:center; gap:8px; margin:auto; border:0; color:#fff; background:none;
    cursor:pointer; font-weight:700; font-size:13px; padding:8px 4px;
  }
  .g-info-chevron { transition:transform .25s ease; } .g-info-chevron.open { transform:rotate(180deg); }
  .g-image-info {
    max-width:850px; margin:8px auto 0; padding:17px 20px; border-radius:18px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(18px);
    animation:gSlideUp .3s ease both; max-height:30vh; overflow:auto;
  }
  .g-image-info h3 { margin:0 0 6px; font:700 20px 'Playfair Display',serif; }
  .g-image-info p { margin:0 0 13px; color:rgba(255,255,255,.78); font-size:13px; line-height:1.6; }
  .g-info-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .g-info-grid div { min-width:0; } .g-info-grid small { display:block; color:#6ee7b7; font-size:10px; text-transform:uppercase; letter-spacing:.08em; margin-bottom:3px; }
  .g-info-grid strong { display:block; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .g-info-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
  .g-info-tags span { padding:4px 9px; border-radius:99px; background:rgba(16,185,129,.18); color:#a7f3d0; font-size:11px; }
  @keyframes gViewerIn { from {opacity:0; transform:scale(1.015)} to {opacity:1; transform:scale(1)} }
  @keyframes gStoryImageIn { from {opacity:0; transform:scale(1.025)} to {opacity:1; transform:scale(1)} }
  @keyframes gArrowFloatLeft {
    0%,100% { transform:translate3d(0,0,0); }
    50% { transform:translate3d(-3px,0,0); }
  }
  @keyframes gArrowFloatRight {
    0%,100% { transform:translate3d(0,0,0); }
    50% { transform:translate3d(3px,0,0); }
  }
  @keyframes gArrowGlow {
    0%,100% { box-shadow:0 8px 28px rgba(0,0,0,.28), 0 0 0 0 rgba(16,185,129,0); }
    50% { box-shadow:0 10px 32px rgba(0,0,0,.34), 0 0 0 5px rgba(16,185,129,.08); }
  }

  @media (max-width: 700px) {
    .g-viewer-topbar { padding:12px 12px 10px; grid-template-columns:1fr auto; }
    .g-viewer-counter { display:none; }
    .g-viewer-close { width:38px; height:38px; }
    .g-story-track {
      gap:10px; padding:70px 52px 112px;
      scroll-padding-inline:52px;
    }
    .g-story-slide {
      flex:0 0 auto; width:auto; height:auto;
      transform:scale(.82); filter:blur(5px) saturate(.55);
    }
    .g-story-slide.is-active { transform:scale(1); }
    .g-story-image-shell { border-radius:18px; }
    .g-viewer-arrow {
      display:grid; width:46px; height:46px; z-index:30;
      background:rgba(5,30,22,.68); border-color:rgba(255,255,255,.38);
    }
    .g-viewer-arrow-left { left:7px; }
    .g-viewer-arrow-right { right:7px; }
    .g-story-caption { padding:55px 16px 16px; }
    .g-story-caption h2 { font-size:19px; }
    .g-image-info { margin-left:0; margin-right:0; max-height:28vh; padding:14px; border-radius:15px; }
    .g-info-grid { grid-template-columns:1fr 1fr; }
    .g-viewer-bottom { padding:10px 12px 16px; }
  }
  @media (max-width: 390px) {
    .g-story-slide { flex:0 0 auto; width:auto; height:auto; }
    .g-info-grid { grid-template-columns:1fr; }
  }
  .g-focus:focus-visible {
    outline: 2px solid var(--g-green-600);
    outline-offset: 2px;
  }

  .g-btn-primary {
    background: linear-gradient(135deg,#059669,#047857);
    color: white; border: none; cursor: pointer;
    font-weight: 700;
    transition: all 0.3s var(--g-ease);
    box-shadow: var(--g-shadow-green);
    position: relative; overflow: hidden;
  }
  .g-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 14px 44px rgba(5,150,105,0.36);
  }
  .g-btn-primary:active { transform: translateY(0) scale(0.98); }

  .g-btn-secondary {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s var(--g-ease);
    backdrop-filter: blur(8px);
  }
  .g-btn-secondary:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.05);
  }

  .g-scroll-hidden::-webkit-scrollbar { display:none; }
  .g-scroll-hidden { -ms-overflow-style:none; scrollbar-width:none; }

  .g-grid-4 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  @media (max-width: 1200px) {
    .g-grid-4 { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 900px) {
    .g-grid-4 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .g-grid-4 { grid-template-columns: 1fr; gap: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const useWidth = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    let t;
    const fn = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("resize", fn); clearTimeout(t); };
  }, []);
  return w;
};

const SkeletonCard = ({ height = 240 }) => (
  <div style={{
    borderRadius: "var(--g-radius-lg)",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "var(--g-shadow-sm)",
  }}>
    <div className="g-shimmer" style={{ height }} />
    <div style={{ padding: "14px 16px" }}>
      <div className="g-shimmer" style={{ height: 14, width: "70%", borderRadius: 6, marginBottom: 8 }} />
      <div className="g-shimmer" style={{ height: 12, width: "50%", borderRadius: 6 }} />
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{
    textAlign: "center", padding: "72px 24px",
    animation: "gFadeUp 0.4s ease",
  }}>
    <div style={{
      width: 92, height: 92, borderRadius: "50%",
      background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <FiAlertCircle size={40} color="#EF4444" />
    </div>
    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#111827", marginBottom: 8 }}>
      Failed to Load Gallery
    </h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 24px" }}>
      {message || "Something went wrong. Please try again."}
    </p>
    <button onClick={onRetry} className="g-btn-primary g-focus" style={{
      padding: "12px 28px", borderRadius: "var(--g-radius-full)", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8,
    }}>
      <FiRefreshCw size={15} /> Try Again
    </button>
  </div>
);

const EmptyState = ({ onClear }) => (
  <div style={{
    textAlign: "center", padding: "80px 24px",
    animation: "gFadeUp 0.4s ease",
  }}>
    <div style={{
      width: 100, height: 100, borderRadius: "50%",
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 24px",
      animation: "gFloat 3s ease infinite",
    }}>
      <FiImage size={42} color="#059669" />
    </div>
    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#111827", marginBottom: 8 }}>
      No Images Found
    </h3>
    <p style={{ color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>
      Try adjusting your filters or search query.
    </p>
    <button onClick={onClear} className="g-btn-primary g-focus" style={{
      padding: "12px 28px", borderRadius: "var(--g-radius-full)", fontSize: 14,
    }}>
      Clear Filters
    </button>
  </div>
);

const StatCard = ({ icon, value, label }) => (
  <div style={{
    flex: "1 1 160px", display: "flex", alignItems: "center", gap: 12,
    padding: "14px 18px", backgroundColor: "white", borderRadius: "var(--g-radius-lg)",
    border: "1px solid #ECFDF5", boxShadow: "var(--g-shadow-sm)",
    transition: "all 0.3s var(--g-ease)",
  }} onMouseOver={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = "var(--g-shadow-md)";
  }} onMouseOut={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "var(--g-shadow-sm)";
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#059669", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const GalleryCard = ({ image, index, onOpen, isFav, onFav }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="g-card" onClick={() => onOpen(image)} style={{
      borderRadius: "var(--g-radius-lg)", overflow: "hidden",
      position: "relative", backgroundColor: "white",
      boxShadow: "var(--g-shadow-sm)", border: "1px solid #F3F4F6",
      animation: `gSlideUp 0.4s ease ${index * 0.04}s both`,
    }}>
      {!loaded && <div className="g-shimmer" style={{ height: 240, position: "absolute", inset: 0, zIndex: 1 }} />}
      <img src={image.thumb || image.src} alt={image.alt} loading="lazy" onLoad={() => setLoaded(true)}
        className="g-card-img" style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
      <div className="g-card-overlay" />
      {image.isFeatured && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
          <span style={{
            background: "rgba(255,255,255,0.14)", backdropFilter: "blur(12px)",
            color: "white", border: "1px solid rgba(255,255,255,0.2)",
            padding: "4px 10px", borderRadius: "var(--g-radius-full)",
            fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4
          }}>
            <FiStar size={10} /> Featured
          </span>
        </div>
      )}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
        <span style={{
          backgroundColor: "#ECFDF5", color: "#059669", border: "1px solid #D1FAE5",
          padding: "4px 10px", borderRadius: "var(--g-radius-full)", fontSize: 11.5, fontWeight: 600
        }}>
          {image.category}
        </span>
      </div>
      <div className="g-card-actions" style={{
        position: "absolute", top: 42, right: 10, zIndex: 3, display: "flex", flexDirection: "column", gap: 6
      }}>
        <button onClick={(e) => { e.stopPropagation(); onFav(image.id); }} className="g-focus" style={{
          width: 30, height: 30, borderRadius: "50%", backgroundColor: isFav(image.id) ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)",
          color: isFav(image.id) ? "#EF4444" : "rgba(255,255,255,0.9)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
        }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.18)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
          <FiHeart size={13} fill={isFav(image.id) ? "#EF4444" : "none"} />
        </button>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "20px 14px 14px", zIndex: 3,
      }}>
        {image.title && (
          <h4 style={{
            color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {image.title}
          </h4>
        )}
        {(image.location || image.countryName) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.8)", fontSize: 11.5,
          }}>
            <FiMapPin size={10} /> {image.location || image.countryName}
          </div>
        )}
      </div>
    </div>
  );
};

const FullscreenModal = ({ images, selectedIndex, onClose, onPrev, onNext, onIndexChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [storySizes, setStorySizes] = useState({});
  const trackRef = useRef(null);
  const touchStartX = useRef(null);
  const currentImage = images[selectedIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const item = track.children[selectedIndex];
    if (item) item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const syncActiveSlide = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let nearest = selectedIndex;
        let distance = Infinity;

        Array.from(track.children).forEach((child, index) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const d = Math.abs(childCenter - center);
          if (d < distance) {
            distance = d;
            nearest = index;
          }
        });

        if (nearest !== selectedIndex) {
          onIndexChange(nearest);
          setShowDetails(false);
        }
      });
    };

    track.addEventListener("scroll", syncActiveSlide, { passive: true });
    return () => {
      track.removeEventListener("scroll", syncActiveSlide);
      cancelAnimationFrame(raf);
    };
  }, [selectedIndex, onIndexChange]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const distance = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 45) distance < 0 ? onNext() : onPrev();
    touchStartX.current = null;
  };

  const getStorySize = (image, index) => {
    const size = storySizes[image.id];
    if (size) return size;

    // A compact fallback keeps the first render responsive before the image reports
    // its natural dimensions. Once loaded, the exact aspect ratio is used.
    const mobile = typeof window !== "undefined" && window.innerWidth <= 700;
    const maxW = Math.min(window.innerWidth * (mobile ? 0.88 : 0.76), mobile ? 680 : 900);
    const maxH = Math.min(window.innerHeight * (mobile ? 0.68 : 0.72), mobile ? 560 : 760);
    return { width: maxW, height: maxH };
  };

  const handleStoryImageLoad = (image, e) => {
    const nw = e.currentTarget.naturalWidth;
    const nh = e.currentTarget.naturalHeight;
    if (!nw || !nh) return;

    const mobile = typeof window !== "undefined" && window.innerWidth <= 700;
    const maxW = Math.min(window.innerWidth * (mobile ? 0.88 : 0.76), mobile ? 680 : 900);
    const maxH = Math.min(window.innerHeight * (mobile ? 0.68 : 0.72), mobile ? 560 : 760);
    const scale = Math.min(maxW / nw, maxH / nh);
    const next = {
      width: Math.max(1, Math.round(nw * scale)),
      height: Math.max(1, Math.round(nh * scale)),
    };

    setStorySizes((prev) => {
      const oldSize = prev[image.id];
      if (oldSize && oldSize.width === next.width && oldSize.height === next.height) return prev;
      return { ...prev, [image.id]: next };
    });
  };

  if (!currentImage) return null;

  return (
    <div className="g-viewer" role="dialog" aria-modal="true" aria-label="Image viewer">
      <div className="g-viewer-backdrop" />
      <div className="g-viewer-topbar">
        <div className="g-story-progress">
          {images.map((_, i) => (
            <button key={i} aria-label={'Open image ' + (i + 1)} onClick={() => {
              if (i > selectedIndex) onNext();
              else if (i < selectedIndex) onPrev();
            }} className={i === selectedIndex ? "active" : ""} />
          ))}
        </div>
        <div className="g-viewer-counter">{selectedIndex + 1} / {images.length}</div>
        <button className="g-viewer-close g-focus" onClick={onClose} aria-label="Close image viewer">
          <FiX size={21} />
        </button>
      </div>

      <div
        className="g-story-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="g-viewer-arrow g-viewer-arrow-left g-focus" onClick={onPrev} disabled={selectedIndex === 0} aria-label="Previous image" title="Previous image">
          <FiChevronLeft size={27} />
        </button>

        <div ref={trackRef} className="g-story-track g-scroll-hidden">
          {images.map((image, i) => (
            <article
              key={image.id}
              className={'g-story-slide ' + (i === selectedIndex ? "is-active" : "")}
              onClick={() => i === selectedIndex && setShowDetails(false)}
            >
              <div
                className="g-story-image-shell"
                style={getStorySize(image, i)}
              >
                <img
                  src={image.src || image.thumb}
                  alt={image.alt || image.title || "Altuvera gallery image"}
                  draggable="false"
                  onLoad={(e) => handleStoryImageLoad(image, e)}
                />
                <div className="g-story-caption">
                  {image.title && <h2>{image.title}</h2>}
                  {(image.location || image.countryName) && (
                    <span><FiMapPin size={13} /> {image.location || image.countryName}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className="g-viewer-arrow g-viewer-arrow-right g-focus" onClick={onNext} disabled={selectedIndex === images.length - 1} aria-label="Next image" title="Next image">
          <FiChevronRight size={27} />
        </button>
      </div>

      <div className="g-viewer-bottom">
        <button className="g-info-link g-focus" onClick={() => setShowDetails((v) => !v)}>
          <FiInfo size={16} />
          {showDetails ? "Hide image information" : "View image information"}
          <FiChevronDown className={showDetails ? "g-info-chevron open" : "g-info-chevron"} size={15} />
        </button>

        {showDetails && (
          <div className="g-image-info">
            {currentImage.title && <h3>{currentImage.title}</h3>}
            {currentImage.description && <p>{currentImage.description}</p>}
            <div className="g-info-grid">
              {currentImage.location && <div><small>Location</small><strong>{currentImage.location}</strong></div>}
              {currentImage.countryName && <div><small>Country</small><strong>{currentImage.countryName}</strong></div>}
              {currentImage.category && <div><small>Category</small><strong>{currentImage.category}</strong></div>}
              {currentImage.photographer && <div><small>Photographer</small><strong>{currentImage.photographer}</strong></div>}
            </div>
            {currentImage.tags?.length > 0 && (
              <div className="g-info-tags">
                {currentImage.tags.map((tag) => <span key={tag}>#{tag}</span>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const SnapScrollGallery = ({ images, onImageClick }) => {
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12, marginBottom: 40,
    }}>
      <h3 style={{
        fontSize: 16, fontWeight: 700, color: "#111827", paddingLeft: 8,
      }}>
        Featured Stories
      </h3>
      <div ref={scrollContainerRef} style={{
        display: "flex", gap: 12, overflowX: "auto", scrollBehavior: "smooth",
        paddingBottom: 8, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
      }} className="g-scroll-hidden">
        {images.slice(0, 8).map((image, idx) => (
          <div key={image.id} onClick={() => onImageClick(image)} style={{
            minWidth: "160px", height: "240px", borderRadius: "var(--g-radius-lg)",
            overflow: "hidden", cursor: "pointer", position: "relative",
            flexShrink: 0, scrollSnapAlign: "start",
            transform: `scale(${Math.abs(scrollPosition - idx * 172) < 100 ? 1 : 0.9}) blur(${Math.abs(scrollPosition - idx * 172) > 100 ? "4px" : "0px"})`,
            transition: "all 0.3s ease", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
          }}>
            <img src={image.thumb || image.src} alt={image.alt} loading="lazy" style={{
              width: "100%", height: "100%", objectFit: "cover",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(6,79,70,0.8) 0%, transparent 70%)",
            }} />
            <div style={{
              position: "absolute", bottom: 8, left: 8, right: 8, color: "white",
              fontSize: 11, fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            }}>
              {image.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Gallery() {
  const width = useWidth();
  const { images, categories, tags, loading, error, pagination, params, updateParams, refetch } = useGallery();
  const [favorites, setFavorites] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);


  const handleOpenImage = (image) => {
    const index = images.findIndex((img) => img.id === image.id);
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = "";
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const handleFav = (id) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    setFavorites(newFavs);
  };

  const isFav = (id) => favorites.has(id);

  const clearFilters = () => {
    updateParams({ page: 1, limit: 24, sort: "featured", category: "", search: "", tag: "" });
  };

  return (
    <>
      <style>{STYLES}</style>
      <SEO
        title="Gallery | Altuvera"
        description="Explore stunning photography from Rwanda's most beautiful destinations"
        image="/og-image.jpg"
      />
      <PageHeader
        title="Gallery"
        subtitle="Discover the visual stories of Rwanda"
        icon={<FiCamera size={32} />}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <AnimatedSection animation="fadeInUp">
        <div style={{ padding: "40px 24px", maxWidth: 1400, margin: "0 auto" }}>
          {/* Stats */}
          <div style={{
            display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap",
          }}>
            <StatCard icon={<FiCamera size={18} />} value={images.length} label="Total Images" />
            <StatCard icon={<FiStar size={18} />} value={images.filter((i) => i.isFeatured).length} label="Featured" />
            <StatCard icon={<FiHeart size={18} />} value={favorites.size} label="Favorites" />
          </div>

          {/* Snap scroll gallery */}
          {!loading && !error && images.length > 0 && (
            <SnapScrollGallery images={images} onImageClick={handleOpenImage} />
          )}

          {/* Loading */}
          {loading && (
            <div className="g-grid-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && <ErrorState message={error} onRetry={refetch} />}

          {/* Empty */}
          {!loading && !error && images.length === 0 && <EmptyState onClear={clearFilters} />}

          {/* Main grid */}
          {!loading && !error && images.length > 0 && (
            <>
              <h3 style={{
                fontSize: 16, fontWeight: 700, color: "#111827", paddingLeft: 8, marginBottom: 16,
              }}>
                All Images
              </h3>
              <div className="g-grid-4">
                {images.map((image, index) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    index={index}
                    onOpen={handleOpenImage}
                    isFav={isFav}
                    onFav={handleFav}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </AnimatedSection>

      {/* Fullscreen Modal */}
      {selectedImageIndex !== null && (
        <FullscreenModal
          images={images}
          selectedIndex={selectedImageIndex}
          onClose={handleCloseModal}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          onIndexChange={setSelectedImageIndex}
        />
      )}
    </>
  );
}
