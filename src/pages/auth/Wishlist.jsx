// src/pages/auth/Wishlist.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart, FiMapPin, FiTrash2, FiExternalLink,
  FiSearch, FiRefreshCw, FiGrid, FiList,
} from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

const css = `
  .wl-root * { box-sizing: border-box; }
  .wl-root {
    display: flex; flex-direction: column; gap: 1.5rem;
    animation: wlFadeIn 0.5s ease-out;
  }

  /* ── Hero ── */
  .wl-hero {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
    border-radius: 20px; padding: 2rem 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1.5rem; flex-wrap: wrap; position: relative; overflow: hidden;
  }
  .wl-hero::before {
    content: ''; position: absolute; top: -60px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .wl-hero-left { z-index: 1; }
  .wl-hero-icon { font-size: 2.5rem; margin-bottom: 8px; }
  .wl-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 800; color: #fff;
    margin: 0 0 6px;
  }
  .wl-hero-sub { color: rgba(255,255,255,0.75); font-size: 0.9rem; margin: 0; }
  .wl-hero-stats {
    display: flex; gap: 16px; z-index: 1; flex-wrap: wrap;
  }
  .wl-hero-stat {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px; padding: 12px 20px; text-align: center;
    backdrop-filter: blur(8px);
  }
  .wl-hero-stat-num {
    font-size: 1.6rem; font-weight: 900; color: #fff; display: block;
  }
  .wl-hero-stat-label {
    font-size: 0.7rem; color: rgba(255,255,255,0.7);
    text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;
  }

  /* ── Controls ── */
  .wl-controls {
    display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  }
  .wl-search-wrap { position: relative; flex: 1 1 200px; max-width: 320px; }
  .wl-search-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); color: #94a3b8; pointer-events: none;
  }
  .wl-search {
    width: 100%; padding: 10px 12px 10px 36px;
    border-radius: 12px; border: 1.5px solid #e2e8f0;
    font-size: 0.88rem; outline: none; background: #fff;
    font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .wl-search:focus {
    border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }
  .wl-view-toggle {
    display: flex; gap: 4px; background: #f1f5f9;
    border-radius: 10px; padding: 3px;
  }
  .wl-view-btn {
    padding: 7px 10px; border-radius: 8px; border: none;
    background: transparent; color: #64748b; cursor: pointer;
    display: flex; align-items: center; transition: all 0.15s;
  }
  .wl-view-btn.active {
    background: #fff; color: #059669;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .wl-refresh-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: #fff;
    color: #64748b; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .wl-refresh-btn:hover { background: #f8fafc; color: #0f172a; }

  /* ── Grid ── */
  .wl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .wl-list { display: flex; flex-direction: column; gap: 12px; }

  /* ── Card (Grid) ── */
  .wl-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #e2e8f0; overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .wl-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,0,0,0.1);
    border-color: #bbf7d0;
  }
  .wl-card-img-wrap {
    position: relative; height: 180px; overflow: hidden; background: #f1f5f9;
  }
  .wl-card-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.4s ease;
  }
  .wl-card:hover .wl-card-img { transform: scale(1.06); }
  .wl-card-img-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem;
  }
  .wl-card-remove {
    position: absolute; top: 10px; right: 10px;
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: none;
    color: #ef4444; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .wl-card-remove:hover {
    background: #fef2f2; transform: scale(1.1);
  }
  .wl-card-country-badge {
    position: absolute; bottom: 10px; left: 10px;
    background: rgba(0,0,0,0.55); color: #fff;
    padding: 3px 10px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700;
    backdrop-filter: blur(4px);
    display: flex; align-items: center; gap: 4px;
  }
  .wl-card-body { padding: 16px; }
  .wl-card-name {
    font-size: 1rem; font-weight: 800; color: #0f172a;
    margin: 0 0 6px; line-height: 1.3;
  }
  .wl-card-desc {
    font-size: 0.82rem; color: #64748b; margin: 0 0 12px;
    line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .wl-card-meta {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .wl-card-tag {
    background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0;
    padding: 2px 8px; border-radius: 6px;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  }
  .wl-card-actions {
    display: flex; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid #f1f5f9;
  }
  .wl-card-btn {
    flex: 1; padding: 8px; border-radius: 9px; border: none;
    font-size: 0.8rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    gap: 5px; transition: all 0.18s; font-family: inherit;
  }
  .wl-card-btn-primary {
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; box-shadow: 0 3px 8px rgba(5,150,105,0.25);
  }
  .wl-card-btn-primary:hover { transform: translateY(-1px); }
  .wl-card-btn-ghost {
    background: #f8fafc; color: #475569;
    border: 1.5px solid #e2e8f0;
  }
  .wl-card-btn-ghost:hover { background: #f1f5f9; color: #0f172a; }

  /* ── List Card ── */
  .wl-list-card {
    background: #fff; border-radius: 16px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    display: flex; align-items: center; gap: 16px;
    padding: 14px 18px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .wl-list-card:hover {
    border-color: #bbf7d0;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .wl-list-img {
    width: 80px; height: 70px; border-radius: 10px;
    object-fit: cover; flex-shrink: 0; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; overflow: hidden;
  }
  .wl-list-img img { width: 100%; height: 100%; object-fit: cover; }
  .wl-list-body { flex: 1; min-width: 0; }
  .wl-list-name {
    font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 4px;
  }
  .wl-list-location {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.8rem; color: #64748b; margin: 0 0 6px;
  }
  .wl-list-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .wl-list-actions {
    display: flex; gap: 8px; flex-shrink: 0; align-items: center;
  }
  .wl-list-action-btn {
    padding: 7px 14px; border-radius: 9px; border: none;
    font-size: 0.78rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 5px;
    transition: all 0.18s; font-family: inherit;
  }

  /* ── Empty ── */
  .wl-empty {
    text-align: center; padding: 80px 24px;
    background: #fff; border-radius: 20px;
    border: 1.5px dashed #e2e8f0;
  }
  .wl-empty-icon { font-size: 4rem; margin-bottom: 16px; }
  .wl-empty h3 {
    margin: 0 0 10px; font-size: 1.2rem;
    color: #0f172a; font-weight: 800;
  }
  .wl-empty p { margin: 0 0 24px; color: #64748b; font-size: 0.9rem; }
  .wl-empty-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px;
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; border-radius: 12px; text-decoration: none;
    font-weight: 800; font-size: 0.9rem;
    box-shadow: 0 4px 14px rgba(5,150,105,0.3);
    transition: all 0.2s;
  }
  .wl-empty-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(5,150,105,0.4);
  }

  /* ── Loading ── */
  .wl-loading { text-align: center; padding: 64px 24px; }
  .wl-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #e2e8f0; border-top-color: #059669;
    animation: wlSpin 0.8s linear infinite; margin: 0 auto 16px;
  }

  /* ── Clear all btn ── */
  .wl-clear-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    border: 1.5px solid #fecaca; background: #fef2f2;
    color: #dc2626; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
    margin-left: auto;
  }
  .wl-clear-btn:hover { background: #fee2e2; }

  /* ── Keyframes ── */
  @keyframes wlFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wlSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .wl-spin { animation: wlSpin 1s linear infinite; }

  @media (max-width: 640px) {
    .wl-grid { grid-template-columns: 1fr; }
    .wl-hero { padding: 1.5rem; }
    .wl-hero-title { font-size: 1.4rem; }
    .wl-list-card { flex-direction: column; align-items: flex-start; }
    .wl-list-actions { width: 100%; }
  }
`;

// ─── Destination Card (Grid) ───────────────────────────────────────────────────
function DestinationCard({ destination, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    await onRemove(destination.id);
  };

  const slug = destination.slug || destination.id;
  const img  = destination.thumbnail_url || destination.cover_image_url
             || destination.images?.[0]?.url || null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: removing ? 0.4 : 1, scale: removing ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.25 }}
      className="wl-card"
    >
      <div className="wl-card-img-wrap">
        {img ? (
          <img src={img} alt={destination.name} className="wl-card-img" />
        ) : (
          <div className="wl-card-img-placeholder">🌍</div>
        )}
        <button
          className="wl-card-remove"
          onClick={handleRemove}
          disabled={removing}
          title="Remove from wishlist"
        >
          {removing
            ? <FiRefreshCw size={15} className="wl-spin" />
            : <FiTrash2 size={15} />
          }
        </button>
        {destination.country_name && (
          <div className="wl-card-country-badge">
            <HiOutlineLocationMarker size={11} />
            {destination.country_name}
          </div>
        )}
      </div>

      <div className="wl-card-body">
        <h3 className="wl-card-name">{destination.name}</h3>
        {destination.short_description && (
          <p className="wl-card-desc">{destination.short_description}</p>
        )}
        <div className="wl-card-meta">
          {destination.category && (
            <span className="wl-card-tag">{destination.category}</span>
          )}
          {destination.difficulty_level && (
            <span className="wl-card-tag">{destination.difficulty_level}</span>
          )}
        </div>
        <div className="wl-card-actions">
          <Link
            to={`/destinations/${slug}`}
            className="wl-card-btn wl-card-btn-primary"
            style={{ textDecoration: "none" }}
          >
            <FiExternalLink size={13} /> Explore
          </Link>
          <Link
            to={`/booking?destination=${slug}`}
            className="wl-card-btn wl-card-btn-ghost"
            style={{ textDecoration: "none" }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Destination Row (List) ────────────────────────────────────────────────────
function DestinationRow({ destination, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(destination.id);
  };

  const slug = destination.slug || destination.id;
  const img  = destination.thumbnail_url || destination.cover_image_url
             || destination.images?.[0]?.url || null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: removing ? 0.4 : 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.22 }}
      className="wl-list-card"
    >
      <div className="wl-list-img">
        {img
          ? <img src={img} alt={destination.name} />
          : "🌍"
        }
      </div>

      <div className="wl-list-body">
        <p className="wl-list-name">{destination.name}</p>
        {destination.country_name && (
          <p className="wl-list-location">
            <FiMapPin size={12} color="#059669" />
            {destination.country_name}
          </p>
        )}
        <div className="wl-list-tags">
          {destination.category && (
            <span className="wl-card-tag">{destination.category}</span>
          )}
        </div>
      </div>

      <div className="wl-list-actions">
        <Link
          to={`/destinations/${slug}`}
          className="wl-list-action-btn"
          style={{
            background: "linear-gradient(135deg,#059669,#047857)",
            color: "#fff", textDecoration: "none",
            boxShadow: "0 3px 8px rgba(5,150,105,0.25)",
          }}
        >
          <FiExternalLink size={13} /> View
        </Link>
        <button
          className="wl-list-action-btn"
          onClick={handleRemove}
          disabled={removing}
          style={{
            background: "#fef2f2", color: "#dc2626",
            border: "1.5px solid #fecaca",
          }}
        >
          {removing
            ? <FiRefreshCw size={13} className="wl-spin" />
            : <><FiTrash2 size={13} /> Remove</>
          }
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Wishlist Page ────────────────────────────────────────────────────────
export default function Wishlist() {
  const { wishlistIds, toggleWishlist, loaded } = useWishlist();
  const { authFetch } = useUserAuth();

  const [destinations,  setDestinations]  = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [view,          setView]          = useState("grid"); // "grid" | "list"
  const [fetchError,    setFetchError]    = useState(null);

  // Convert wishlistIds Set → plain array of strings (FIXES React #31 error)
  const wishlistArr = useMemo(
    () => Array.from(wishlistIds || new Set()),
    [wishlistIds],
  );

  const fetchWishlistDestinations = useCallback(async () => {
    if (!wishlistArr.length) { setDestinations([]); return; }
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch each destination — batch if API supports it, else parallel
      const results = await Promise.allSettled(
        wishlistArr.map((id) =>
          authFetch(`/destinations/${id}`).then((d) => d?.data || d)
        )
      );
      const valid = results
        .filter((r) => r.status === "fulfilled" && r.value?.id)
        .map((r) => r.value);
      setDestinations(valid);
    } catch (err) {
      setFetchError(err.message || "Failed to load wishlist destinations.");
    } finally {
      setLoading(false);
    }
  }, [wishlistArr, authFetch]);

  useEffect(() => {
    if (loaded) fetchWishlistDestinations();
  }, [loaded, fetchWishlistDestinations]);

  const handleRemove = useCallback(
    (id) => {
      toggleWishlist(id);
      setDestinations((prev) => prev.filter((d) => String(d.id) !== String(id)));
    },
    [toggleWishlist]
  );

  const handleClearAll = useCallback(() => {
    wishlistArr.forEach((id) => toggleWishlist(id));
    setDestinations([]);
  }, [wishlistArr, toggleWishlist]);

  // Filter — only on string fields, never render objects
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        String(d.name || "").toLowerCase().includes(q) ||
        String(d.country_name || "").toLowerCase().includes(q) ||
        String(d.category || "").toLowerCase().includes(q)
    );
  }, [destinations, search]);

  return (
    <>
      <Helmet>
        <title>My Wishlist | Altuvera</title>
        <meta name="description" content="Your saved East African destinations." />
      </Helmet>

      <DashboardLayout
        title="My Wishlist"
        subtitle="Destinations you've saved for future adventures."
      >
        <style>{css}</style>
        <div className="wl-root">

          {/* ── Hero ── */}
          <div className="wl-hero">
            <div className="wl-hero-left">
              <div className="wl-hero-icon">❤️</div>
              <h1 className="wl-hero-title">My Wishlist</h1>
              <p className="wl-hero-sub">
                Dream destinations saved for your next adventure
              </p>
            </div>
            <div className="wl-hero-stats">
              <div className="wl-hero-stat">
                <span className="wl-hero-stat-num">{wishlistArr.length}</span>
                <span className="wl-hero-stat-label">Saved</span>
              </div>
              <div className="wl-hero-stat">
                <span className="wl-hero-stat-num">{destinations.length}</span>
                <span className="wl-hero-stat-label">Loaded</span>
              </div>
            </div>
          </div>

          {/* ── Controls ── */}
          {wishlistArr.length > 0 && (
            <div className="wl-controls">
              <div className="wl-search-wrap">
                <FiSearch size={15} className="wl-search-icon" />
                <input
                  type="text"
                  className="wl-search"
                  placeholder="Search wishlist…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="wl-view-toggle">
                <button
                  className={`wl-view-btn ${view === "grid" ? "active" : ""}`}
                  onClick={() => setView("grid")}
                  title="Grid view"
                >
                  <FiGrid size={16} />
                </button>
                <button
                  className={`wl-view-btn ${view === "list" ? "active" : ""}`}
                  onClick={() => setView("list")}
                  title="List view"
                >
                  <FiList size={16} />
                </button>
              </div>
              <button
                className="wl-refresh-btn"
                onClick={fetchWishlistDestinations}
                disabled={loading}
              >
                <FiRefreshCw size={14} className={loading ? "wl-spin" : ""} />
                Refresh
              </button>
              {wishlistArr.length > 1 && (
                <button className="wl-clear-btn" onClick={handleClearAll}>
                  <FiTrash2 size={13} /> Clear All
                </button>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {fetchError && (
            <div style={{
              padding: "14px 18px", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 12,
              color: "#991b1b", fontSize: "0.88rem", fontWeight: 600,
            }}>
              ⚠️ {fetchError}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="wl-loading">
              <div className="wl-spinner" />
              <p style={{ color: "#64748b", margin: 0 }}>
                Loading your saved destinations…
              </p>
            </div>
          )}

          {/* ── Empty — wishlist itself is empty ── */}
          {!loading && wishlistArr.length === 0 && (
            <div className="wl-empty">
              <div className="wl-empty-icon">💔</div>
              <h3>Your wishlist is empty</h3>
              <p>
                Explore our destinations and tap the heart icon to save your
                favourites here.
              </p>
              <Link to="/destinations" className="wl-empty-cta">
                <FiMapPin size={16} /> Browse Destinations
              </Link>
            </div>
          )}

          {/* ── Empty — search has no results ── */}
          {!loading && wishlistArr.length > 0 && filtered.length === 0 && search && (
            <div className="wl-empty">
              <div className="wl-empty-icon">🔍</div>
              <h3>No results for "{search}"</h3>
              <p>Try a different search term.</p>
              <button
                onClick={() => setSearch("")}
                style={{
                  padding: "10px 24px", background: "#059669",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                Clear Search
              </button>
            </div>
          )}

          {/* ── Destination Grid ── */}
          {!loading && filtered.length > 0 && view === "grid" && (
            <div className="wl-grid">
              <AnimatePresence>
                {filtered.map((dest) => (
                  <DestinationCard
                    key={String(dest.id)}
                    destination={dest}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── Destination List ── */}
          {!loading && filtered.length > 0 && view === "list" && (
            <div className="wl-list">
              <AnimatePresence>
                {filtered.map((dest) => (
                  <DestinationRow
                    key={String(dest.id)}
                    destination={dest}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}