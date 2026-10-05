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

const FullscreenModal = ({ images, selectedIndex, onClose, onPrev, onNext }) => {
  const [showDetails, setShowDetails] = useState(false);
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

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) onNext();
    else onPrev();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }} onWheel={handleWheel}>
      {/* Animated gradient background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(45deg, #ECFDF5, #D1FAE5, #A7F3D0, #34D399, #ECFDF5)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        zIndex: 0,
      }} />

      <div style={{
        position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(255, 255, 255, 0.95)", borderBottom: "1px solid #E5E7EB",
        }}>
          <div style={{ color: "#111827", fontSize: 14, fontWeight: 600 }}>
            {selectedIndex + 1} / {images.length}
          </div>
          <button onClick={onClose} style={{
            background: "linear-gradient(135deg, #059669, #047857)",
            border: "none", color: "white", width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.3s", fontWeight: 700,
          }} onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "var(--g-shadow-green)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Image container with dramatic zoom/blur */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", position: "relative", overflow: "hidden",
        }}>
          {currentImage && (
            <img src={currentImage.src} alt={currentImage.alt} style={{
              maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
              borderRadius: "12px", boxShadow: "0 20px 80px rgba(6, 78, 59, 0.3)",
              animation: "gScaleIn 0.4s ease",
            }} />
          )}
        </div>

        {/* Navigation and details button */}
        <div style={{
          padding: "16px 20px", background: "rgba(255, 255, 255, 0.95)",
          borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <button onClick={onPrev} disabled={selectedIndex === 0} className="g-btn-secondary" style={{
            width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: selectedIndex === 0 ? 0.5 : 1,
            cursor: selectedIndex === 0 ? "not-allowed" : "pointer",
          }} onMouseOver={(e) => {
            if (selectedIndex > 0) e.currentTarget.style.background = "rgba(5, 150, 105, 0.15)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}>
            <FiChevronLeft size={20} color="#059669" />
          </button>

          <button onClick={() => setShowDetails(!showDetails)} className="g-btn-primary" style={{
            padding: "8px 16px", borderRadius: "var(--g-radius-full)", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center",
          }}>
            <FiInfo size={14} />
            {showDetails ? "Hide" : "Show"} Details
          </button>

          <button onClick={onNext} disabled={selectedIndex === images.length - 1} className="g-btn-secondary" style={{
            width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: selectedIndex === images.length - 1 ? 0.5 : 1,
            cursor: selectedIndex === images.length - 1 ? "not-allowed" : "pointer",: "cover", display: "block" }} />
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

const FullscreenModal = ({ images, selectedIndex, onClose, onPrev, onNext }) => {
  const [showDetails, setShowDetails] = useState(false);
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

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) onNext();
    else onPrev();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, overflow: "hidden" }} onWheel={handleWheel}>
      {/* Animated gradient background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(45deg, #ECFDF5, #D1FAE5, #A7F3D0, #34D399, #ECFDF5)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
        zIndex: 0,
      }} />

      <div style={{
        position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(255, 255, 255, 0.95)", borderBottom: "1px solid #E5E7EB",
        }}>
          <div style={{ color: "#111827", fontSize: 14, fontWeight: 600 }}>
            {selectedIndex + 1} / {images.length}
          </div>
          <button onClick={onClose} style={{
            background: "linear-gradient(135deg, #059669, #047857)",
            border: "none", color: "white", width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.3s", fontWeight: 700,
          }} onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "var(--g-shadow-green)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Image container with dramatic zoom/blur */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", position: "relative", overflow: "hidden",
        }}>
          {currentImage && (
            <img src={currentImage.src} alt={currentImage.alt} style={{
              maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
              borderRadius: "12px", boxShadow: "0 20px 80px rgba(6, 78, 59, 0.3)",
              animation: "gScaleIn 0.4s ease",
            }} />
          )}
        </div>

        {/* Navigation and details button */}
        <div style={{
          padding: "16px 20px", background: "rgba(255, 255, 255, 0.95)",
          borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <button onClick={onPrev} disabled={selectedIndex === 0} className="g-btn-secondary" style={{
            width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: selectedIndex === 0 ? 0.5 : 1,
            cursor: selectedIndex === 0 ? "not-allowed" : "pointer",
          }} onMouseOver={(e) => {
            if (selectedIndex > 0) e.currentTarget.style.background = "rgba(5, 150, 105, 0.15)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}>
            <FiChevronLeft size={20} color="#059669" />
          </button>

          <button onClick={() => setShowDetails(!showDetails)} className="g-btn-primary" style={{
            padding: "8px 16px", borderRadius: "var(--g-radius-full)", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center",
          }}>
            <FiInfo size={14} />
            {showDetails ? "Hide" : "Show"} Details
          </button>

          <button onClick={onNext} disabled={selectedIndex === images.length - 1} className="g-btn-secondary" style={{
            width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", opacity: selectedIndex === images.length - 1 ? 0.5 : 1,
            cursor: selectedIndex === images.length - 1 ? "not-allowed" : "pointer",
          }} onMouseOver={(e) => {
            if (selectedIndex < images.length - 1) e.currentTarget.style.background = "rgba(5, 150, 105, 0.15)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}>
            <FiChevronRight size={20} color="#059669" />
          </button>
        </div>

        {/* Details panel */}
        {showDetails && currentImage && (
          <div style={{
            padding: "20px", background: "rgba(236, 253, 245, 0.98)",
            borderTop: "2px solid #10B981", color: "#111827",
            maxHeight: "250px", overflowY: "auto", animation: "gSlideUp 0.3s ease",
          }}>
            {currentImage.title && (
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#059669" }}>
                {currentImage.title}
              </h3>
            )}
            {currentImage.description && (
              <p style={{
                fontSize: 14, color: "#4B5563", marginBottom: 16, lineHeight: 1.6,
              }}>
                {currentImage.description}
              </p>
            )}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13, marginBottom: 16,
            }}>
              {currentImage.location && (
                <div>
                  <span style={{ color: "#059669", fontWeight: 600 }}>📍 Location</span>
                  <div style={{ fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {currentImage.location}
                  </div>
                </div>
              )}
              {currentImage.countryName && (
                <div>
                  <span style={{ color: "#059669", fontWeight: 600 }}>🌍 Country</span>
                  <div style={{ fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {currentImage.countryName}
                  </div>
                </div>
              )}
              {currentImage.photographer && (
                <div>
                  <span style={{ color: "#059669", fontWeight: 600 }}>📷 Photographer</span>
                  <div style={{ fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {currentImage.photographer}
                  </div>
                </div>
              )}
              {currentImage.category && (
                <div>
                  <span style={{ color: "#059669", fontWeight: 600 }}>🏷️ Category</span>
                  <div style={{ fontWeight: 600, color: "#111827", marginTop: 4 }}>
                    {currentImage.category}
                  </div>
                </div>
              )}
            </div>
            {currentImage.tags && currentImage.tags.length > 0 && (
              <div>
                <span style={{ color: "#059669", fontWeight: 600, fontSize: 12 }}>TAGS</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {currentImage.tags.map((tag) => (
                    <span key={tag} style={{
                      background: "#D1FAE5", color: "#059669", padding: "4px 10px",
                      borderRadius: "var(--g-radius-full)", fontSize: 12, fontWeight: 600,
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
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
  const { images, categories, tags, loading, error, pagination, params, setParams, fetchImages } = useGallery();
  const [favorites, setFavorites] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [params, fetchImages]);

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
    setParams({ page: 1, limit: 24, sort: "featured", category: "", search: "", tag: "" });
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
          {error && !loading && <ErrorState message={error} onRetry={fetchImages} />}

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
        />
      )}
    </>
  );
}
