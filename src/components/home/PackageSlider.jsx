// components/home/PackageSlider.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import packagesAPI from "../../api/packages";

const fmtDuration = (days) => {
  if (!days) return null;
  const n = days - 1;
  return `${days}D / ${n}N`;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.92 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 18, delay: i * 0.08 },
  }),
};

const slideVariants = {
  enter: ({ direction }) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.85,
  }),
  center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
  exit: ({ direction }) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0,
    scale: 0.85,
    zIndex: 0,
  }),
};

// Package Card Component
const PackageCard = ({ pkg, index, onWishlist, wishlist }) => {
  const cover = pkg.cover_image_url || pkg.thumbnail_url || null;
  const accent = pkg.accent_color || "#059669";
  const isWish = wishlist?.has(pkg.id);
  const feats = parseJsonField(pkg.features).slice(0, 3);

  return (
    <motion.div
      className="pkg-slider-card"
      custom={index}
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      style={{ "--accent": accent }}
    >
      <Link to={`/packages/${pkg.slug || pkg.id}`} className="pkg-slider-link">
        <div className="pkg-slider-img-wrap">
          {cover ? (
            <img src={cover} alt={pkg.title} className="pkg-slider-img" loading="lazy" />
          ) : (
            <div
              className="pkg-slider-placeholder"
              style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}77)` }}
            >
              <span style={{ color: accent }}>{/* Package icon */}</span>
            </div>
          )}
          <div className="pkg-slider-gradient" />
          {pkg.badge_label && (
            <span
              className="pkg-slider-badge"
              style={{ backgroundColor: pkg.badge_color || accent }}
            >
              {pkg.badge_label}
            </span>
          )}
        </div>
        <div className="pkg-slider-poster-overlay">
          <div className="pkg-slider-poster-label">
            <span>ALTUVERA PACKAGE</span>
            <strong>{pkg.title && pkg.title !== "Travel package" ? pkg.title : "Adventure Package"}</strong>
          </div>
          <span className="pkg-slider-request-cta">
            Request this package <ChevronRight size={14} />
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlist?.(pkg.id);
          }}
          className={`pkg-slider-wishlist ${isWish ? "active" : ""}`}
        >
          <Heart size={16} />
        </button>
      </Link>
    </motion.div>
  );
};

const parseJsonField = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// Main Slider Component
export default function PackageSlider({ limit = 8 }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());
  const autoPlayRef = useRef(null);
  const [isHovering, setHovering] = useState(false);

  useEffect(() => {
    loadPackages();
    loadWishlist();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packagesAPI.getFeatured({ limit });
      setPackages(data.data || []);
    } catch (err) {
      console.error("[PackageSlider] Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    try {
      const s = JSON.parse(localStorage.getItem("altuvera_wishlist") || "[]");
      setWishlist(new Set(s));
    } catch {
      setWishlist(new Set());
    }
  };

  const handleWishlist = (id) => {
    setWishlist((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      localStorage.setItem("altuvera_wishlist", JSON.stringify([...n]));
      return n;
    });
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setPage((p) => (p + 1) % Math.max(1, Math.ceil(packages.length / 4)));
  }, [packages.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setPage((p) => (p - 1 + Math.max(1, Math.ceil(packages.length / 4))) % Math.max(1, Math.ceil(packages.length / 4)));
  }, [packages.length]);

  // Auto-play
  useEffect(() => {
    if (packages.length <= 4 || isHovering) return;
    autoPlayRef.current = setInterval(nextSlide, 6000);
    return () => clearInterval(autoPlayRef.current);
  }, [packages.length, isHovering, nextSlide]);

  const cardsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(packages.length / cardsPerPage));

  return (
    <>
      <style>{`
        .pkg-slider-poster-overlay {
          position:absolute; inset:0; display:flex; flex-direction:column;
          justify-content:flex-end; gap:12px; padding:18px;
          background:linear-gradient(180deg,rgba(2,44,22,0.02) 25%,rgba(2,44,22,0.88) 100%);
          color:#fff; z-index:2; pointer-events:none;
        }
        .pkg-slider-poster-label { display:flex; flex-direction:column; gap:5px; min-width:0; }
        .pkg-slider-poster-label span { font-size:9px; font-weight:800; letter-spacing:.14em; opacity:.78; }
        .pkg-slider-poster-label strong { font-size:clamp(15px,1.5vw,19px); line-height:1.2; text-shadow:0 2px 12px rgba(0,0,0,.35); }
        .pkg-slider-request-cta {
          align-self:flex-start; display:inline-flex; align-items:center; gap:5px;
          padding:8px 11px; border-radius:999px; background:rgba(255,255,255,.95);
          color:#047857; font-size:11px; font-weight:800; box-shadow:0 6px 18px rgba(0,0,0,.18);
        }
        .pkg-slider-img-wrap { position:relative; overflow:hidden; }
        .pkg-slider-img { transition:transform .6s ease; }
        .pkg-slider-card:hover .pkg-slider-img { transform:scale(1.045); }
        .pkg-slider-card {
          border: 1px solid rgba(255,255,255,.72);
          border-radius: 24px !important;
          overflow: hidden;
          isolation: isolate;
          background: #062e25;
          box-shadow: 0 14px 34px rgba(6, 78, 59, .13), 0 2px 8px rgba(15,23,42,.05);
          transition: box-shadow .35s ease, border-color .35s ease, transform .35s ease;
        }
        .pkg-slider-card:hover {
          border-color: rgba(16,185,129,.65);
          box-shadow: 0 24px 48px rgba(6,78,59,.24), 0 0 0 1px rgba(16,185,129,.12);
        }
        .pkg-slider-img-wrap { aspect-ratio: 4 / 5; }
        .pkg-slider-img { width:100%; height:100%; object-fit:cover; display:block; }
        .pkg-slider-gradient {
          position:absolute; inset:0; z-index:1; pointer-events:none;
          background:linear-gradient(180deg,rgba(2,44,34,.04) 20%,rgba(2,44,34,.08) 43%,rgba(2,44,34,.86) 100%);
        }
        .pkg-slider-poster-overlay {
          justify-content:flex-end;
          padding:20px;
          background:linear-gradient(180deg,rgba(2,44,34,.04) 10%,rgba(2,44,34,.18) 42%,rgba(2,44,34,.92) 100%);
        }
        .pkg-slider-poster-label span {
          display:inline-flex; align-self:flex-start; align-items:center;
          padding:6px 9px; border:1px solid rgba(255,255,255,.28);
          border-radius:999px; background:rgba(255,255,255,.13);
          backdrop-filter:blur(10px); font-size:9px; letter-spacing:.16em;
        }
        .pkg-slider-poster-label strong {
          font-size:clamp(17px,1.6vw,22px); line-height:1.15;
          letter-spacing:-.025em; max-width:18ch;
        }
        .pkg-slider-request-cta {
          padding:10px 13px; border:1px solid rgba(255,255,255,.65);
          background:linear-gradient(135deg,#fff,#ecfdf5);
          transition:transform .25s ease, box-shadow .25s ease;
        }
        .pkg-slider-card:hover .pkg-slider-request-cta {
          transform:translateY(-2px); box-shadow:0 10px 25px rgba(0,0,0,.22);
        }
        .pkg-slider-wishlist {
          z-index:5; width:42px; height:42px; display:grid; place-items:center;
          border:1px solid rgba(255,255,255,.65); border-radius:50%;
          background:rgba(255,255,255,.9); color:#047857;
          box-shadow:0 6px 20px rgba(0,0,0,.16); backdrop-filter:blur(10px);
        }
        .pkg-slider-link { position:relative; display:block; height:100%; overflow:hidden; }
        @media (max-width:640px) {
          .pkg-slider-poster-overlay { padding:14px; gap:9px; }
          .pkg-slider-poster-label strong { font-size:15px; }
          .pkg-slider-request-cta { font-size:10.5px; padding:7px 10px; }
        }
      `}</style>
      <section className="pkg-slider-section">
      <div className="home-container">
<div className="section-header">
           <h2 className="section-title">
             Curated <span className="text-gradient">Packages</span>
           </h2>
         </div>

        <div
          className="pkg-slider-container"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <AnimatePresence initial={false} custom={{ direction }} mode="wait">
            <motion.div
              key={page}
              className="pkg-slider-track"
              variants={slideVariants}
              custom={{ direction }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 80, damping: 20 } }}
            >
              <div className="pkg-slider-grid">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="pkg-slider-card pkg-slider-card--skeleton">
                        <div className="skeleton-shimmer" />
                      </div>
                    ))
                  : packages.slice(page * cardsPerPage, page * cardsPerPage + cardsPerPage).map((pkg, i) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        index={i}
                        onWishlist={handleWishlist}
                        wishlist={wishlist}
                      />
                    ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {packages.length > cardsPerPage && (
            <>
              <button
                onClick={prevSlide}
                className="pkg-slider-nav pkg-slider-nav--prev"
                aria-label="Previous packages"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="pkg-slider-nav pkg-slider-nav--next"
                aria-label="Next packages"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {packages.length > 0 && (
            <div className="pkg-slider-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`pkg-slider-dot ${i === page ? "active" : ""}`}
                  onClick={() => {
                    setDirection(i > page ? 1 : -1);
                    setPage(i);
                  }}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="section-cta">
          <Link to="/packages" className="pkg-slider-cta">
            View All Packages <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      </section>
    </>
  );
}

// CSS will be injected via Home.css updates