// components/home/PackageSlider.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import packagesAPI from "../../api/packages";

const fmtPrice = (price, currency = "USD") => {
  if (!price && price !== 0) return "Contact Us";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${Number(price).toLocaleString()}`;
  }
};

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
        <div className="pkg-slider-body">
          <div className="pkg-slider-header">
            <h3 className="pkg-slider-title">{pkg.title}</h3>
            {(pkg.destination || pkg.country) && (
              <span className="pkg-slider-location">
                <MapPin size={12} />
                {[pkg.destination, pkg.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          <div className="pkg-slider-meta">
            {pkg.duration_days && (
              <span className="pkg-slider-meta-item">
                <Clock size={12} />
                {fmtDuration(pkg.duration_days)}
              </span>
            )}
            {pkg.max_travelers && (
              <span className="pkg-slider-meta-item">
                <Users size={12} />
                Max {pkg.max_travelers}
              </span>
            )}
          </div>
          <div className="pkg-slider-price-row">
            <span className="pkg-slider-price">
              {pkg.is_price_visible !== false ? fmtPrice(pkg.price, pkg.currency) : "POA"}
            </span>
          </div>
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
    <section className="pkg-slider-section">
      <div className="home-container">
        <div className="section-header">
          <span className="testimonial-compact-label">PACKAGE DEALS</span>
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
  );
}

// CSS will be injected via Home.css updates