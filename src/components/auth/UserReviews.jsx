// src/pages/auth/UserReviews.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiEdit3, FiTrash2, FiRefreshCw, FiPlus } from "react-icons/fi";

const css = `
  .rv-root * { box-sizing: border-box; }
  .rv-root { display: flex; flex-direction: column; gap: 1.5rem; animation: rvFade 0.5s ease-out; }

  .rv-hero {
    background: linear-gradient(135deg, #7c2d12 0%, #92400e 50%, #b45309 100%);
    border-radius: 20px; padding: 2rem 2.5rem; position: relative; overflow: hidden;
  }
  .rv-hero::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%; background: rgba(255,255,255,0.05);
  }
  .rv-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 6px; z-index: 1; position: relative;
  }
  .rv-hero-sub { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 0; z-index: 1; position: relative; }

  .rv-card {
    background: #fff; border-radius: 18px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden; margin-bottom: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .rv-card:hover { border-color: #fde68a; box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
  .rv-card-body { padding: 18px 22px; }
  .rv-card-top {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 12px; flex-wrap: wrap;
  }
  .rv-destination { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
  .rv-stars { display: flex; gap: 2px; }
  .rv-star { font-size: 1.1rem; }
  .rv-date { font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0; }
  .rv-comment {
    margin-top: 12px; padding: 12px 14px;
    background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;
    font-size: 0.88rem; color: #374151; line-height: 1.65;
  }
  .rv-actions { display: flex; gap: 8px; margin-top: 12px; }
  .rv-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; border: none;
    font-size: 0.78rem; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all 0.18s;
  }

  .rv-empty {
    text-align: center; padding: 64px 24px;
    background: #fff; border-radius: 20px; border: 1.5px dashed #e2e8f0;
  }
  .rv-spinner {
    width: 44px; height: 44px; border-radius: 50%;
    border: 4px solid #e2e8f0; border-top-color: #d97706;
    animation: rvSpin 0.8s linear infinite; margin: 32px auto;
  }
  @keyframes rvFade { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes rvSpin  { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  .rv-spin { animation: rvSpin 1s linear infinite; }
`;

function StarRating({ rating, max = 5, size = 18, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? rating;
  return (
    <div className="rv-stars" style={{ cursor: interactive ? "pointer" : "default" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className="rv-star"
          style={{
            fontSize: size, color: star <= display ? "#f59e0b" : "#e2e8f0",
            transition: "color 0.12s",
          }}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function UserReviews() {
  const { authFetch } = useUserAuth();
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from destinations reviews filtered by current user
      // Backend should support GET /reviews/my or similar
      const data = await authFetch("/reviews/my").catch(() => ({ data: [] }));
      setReviews(data?.data || data?.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = useCallback(async (id) => {
    try {
      await authFetch(`/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { /* show toast in production */ }
  }, [authFetch]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <>
      <Helmet>
        <title>My Reviews | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="My Reviews"
        subtitle="Reviews you've left for destinations and tours."
      >
        <style>{css}</style>
        <div className="rv-root">

          <div className="rv-hero">
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>⭐</div>
            <h1 className="rv-hero-title">My Reviews</h1>
            <p className="rv-hero-sub">
              Share your experiences with the community
            </p>
            <div style={{
              display: "flex", gap: 14, marginTop: 16,
              flexWrap: "wrap", position: "relative", zIndex: 1,
            }}>
              {[
                { num: reviews.length, label: "Reviews" },
                { num: avgRating,      label: "Avg Rating" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10, padding: "10px 16px", textAlign: "center",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", display: "block" }}>
                    {s.num}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase" }}>
                    {s.label}
                  </span>
                </div>
              ))}
              <Link
                to="/destinations"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 18px", borderRadius: 10,
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)", textDecoration: "none",
                  fontWeight: 700, fontSize: "0.85rem", alignSelf: "center",
                  backdropFilter: "blur(8px)",
                }}
              >
                <FiPlus size={14} /> Write a Review
              </Link>
            </div>
          </div>

          {loading && <div className="rv-spinner" />}
          {error && (
            <div style={{
              padding: "14px 18px", background: "#fef2f2",
              border: "1px solid #fecaca", borderRadius: 12,
              color: "#991b1b", fontSize: "0.88rem",
            }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div className="rv-empty">
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>⭐</div>
              <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#0f172a" }}>
                No reviews yet
              </h3>
              <p style={{ color: "#64748b", margin: "0 0 20px" }}>
                Visit a destination page and share your experience!
              </p>
              <Link
                to="/destinations"
                style={{
                  display: "inline-block", padding: "11px 26px",
                  background: "linear-gradient(135deg,#d97706,#b45309)",
                  color: "#fff", borderRadius: 12, textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                Browse Destinations
              </Link>
            </div>
          )}

          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="rv-card"
              >
                <div className="rv-card-body">
                  <div className="rv-card-top">
                    <div>
                      <p className="rv-destination">
                        {review.destination_name || review.destination?.name || "Destination"}
                      </p>
                      <StarRating rating={review.rating || 0} />
                      <p className="rv-date">
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div style={{
                      background: "#fef9c3", color: "#d97706", border: "1px solid #fde68a",
                      borderRadius: 10, padding: "4px 12px",
                      fontSize: "1rem", fontWeight: 900,
                    }}>
                      {review.rating}★
                    </div>
                  </div>
                  {review.comment && (
                    <div className="rv-comment">{review.comment}</div>
                  )}
                  {/* Admin response */}
                  {review.admin_response && (
                    <div style={{
                      marginTop: 10, padding: "10px 14px",
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: 10,
                    }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
                        Response from Altuvera Team
                      </p>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534" }}>
                        {review.admin_response}
                      </p>
                    </div>
                  )}
                  <div className="rv-actions">
                    <button
                      className="rv-btn"
                      style={{ background: "#fef9c3", color: "#d97706", border: "1.5px solid #fde68a" }}
                    >
                      <FiEdit3 size={13} /> Edit
                    </button>
                    <button
                      className="rv-btn"
                      style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca" }}
                      onClick={() => handleDelete(review.id)}
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </DashboardLayout>
    </>
  );
}