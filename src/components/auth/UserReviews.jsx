// src/pages/auth/UserReviews.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// USER REVIEWS v2.0 — Green/White Theme, Lucide Icons, No Emojis
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";
import { Helmet }    from "react-helmet-async";
import { Link }      from "react-router-dom";
import { useUserAuth }   from "../../context/UserAuthContext";
import DashboardLayout   from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Edit3, Trash2, RefreshCw, Plus, AlertCircle,
  MessageSquare, MapPin, CheckCircle, TrendingUp,
  Loader2, ArrowRight, X, Globe,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day:   "numeric",
        year:  "numeric",
      })
    : "—";

/* Safe fetch — mirrors MyBookings pattern */
const safeFetch = async (authFetch, endpoint, options = {}) => {
  try {
    const result = await authFetch(endpoint, options);
    return { data: result, error: null };
  } catch (err) {
    const status = err?.status || err?.statusCode || 0;
    if (status === 403 || status === 401)
      return { data: null, error: `auth:${status}` };
    return { data: null, error: err.message || "Request failed" };
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  root: {
    display:       "flex",
    flexDirection: "column",
    gap:           "1.5rem",
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth:  860,
    margin:    "0 auto",
    animation: "rvFadeUp 0.45s ease-out both",
  },

  /* Hero */
  hero: {
    background:
      "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #059669 100%)",
    borderRadius: 22,
    padding:      "2rem 2.5rem",
    position:     "relative",
    overflow:     "hidden",
  },
  heroBubble: {
    position:     "absolute",
    top:          -70,
    right:        -70,
    width:        220,
    height:       220,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  heroIconWrap: {
    width:          52,
    height:         52,
    borderRadius:   16,
    background:     "rgba(255,255,255,0.15)",
    border:         "1px solid rgba(255,255,255,0.25)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    marginBottom:   14,
    backdropFilter: "blur(8px)",
  },
  heroTitle: {
    fontSize:    "clamp(1.4rem, 3vw, 1.9rem)",
    fontWeight:  900,
    color:       "#fff",
    margin:      "0 0 6px",
    letterSpacing: "-0.4px",
    position:    "relative",
    zIndex:      1,
  },
  heroSub: {
    color:     "rgba(255,255,255,0.72)",
    fontSize:  "0.88rem",
    margin:    0,
    position:  "relative",
    zIndex:    1,
  },
  heroStats: {
    display:   "flex",
    gap:       12,
    marginTop: 18,
    flexWrap:  "wrap",
    position:  "relative",
    zIndex:    1,
  },
  heroStatPill: {
    background:     "rgba(255,255,255,0.12)",
    border:         "1px solid rgba(255,255,255,0.2)",
    borderRadius:   12,
    padding:        "10px 18px",
    textAlign:      "center",
    backdropFilter: "blur(8px)",
  },
  heroStatValue: {
    fontSize:    "1.35rem",
    fontWeight:  900,
    color:       "#fff",
    display:     "block",
    lineHeight:  1,
  },
  heroStatLabel: {
    fontSize:      "0.65rem",
    color:         "rgba(255,255,255,0.65)",
    fontWeight:    700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    display:       "block",
    marginTop:     3,
  },
  heroWriteBtn: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            7,
    padding:        "10px 18px",
    borderRadius:   11,
    background:     "rgba(255,255,255,0.15)",
    color:          "#fff",
    border:         "1px solid rgba(255,255,255,0.25)",
    textDecoration: "none",
    fontWeight:     700,
    fontSize:       "0.85rem",
    alignSelf:      "center",
    backdropFilter: "blur(8px)",
    transition:     "all 0.2s",
  },

  /* Error / warning */
  errorBanner: {
    padding:      "13px 16px",
    background:   "#fef2f2",
    border:       "1px solid #fecaca",
    borderRadius: 12,
    color:        "#991b1b",
    fontSize:     "0.87rem",
    fontWeight:   600,
    display:      "flex",
    alignItems:   "center",
    gap:          10,
  },
  authWarnBanner: {
    padding:      "12px 16px",
    background:   "#fffbeb",
    border:       "1px solid #fde68a",
    borderRadius: 12,
    color:        "#92400e",
    fontSize:     "0.83rem",
    fontWeight:   600,
    display:      "flex",
    alignItems:   "center",
    gap:          10,
  },

  /* Loading */
  spinner: {
    width:          44,
    height:         44,
    borderRadius:   "50%",
    border:         "4px solid #e2e8f0",
    borderTopColor: "#059669",
    animation:      "rvSpin 0.8s linear infinite",
    margin:         "0 auto",
  },

  /* Empty state */
  empty: {
    textAlign:    "center",
    padding:      "72px 24px",
    background:   "#fff",
    borderRadius: 22,
    border:       "1.5px dashed #e2e8f0",
  },
  emptyIconWrap: {
    width:          80,
    height:         80,
    borderRadius:   24,
    background:     "linear-gradient(135deg, #ecfdf5, #d1fae5)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 auto 20px",
  },
  emptyTitle: {
    margin:     "0 0 8px",
    fontSize:   "1.1rem",
    fontWeight: 800,
    color:      "#0f172a",
  },
  emptyText: {
    margin:     "0 0 24px",
    color:      "#64748b",
    fontSize:   "0.9rem",
    lineHeight: 1.55,
  },
  emptyCta: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "12px 28px",
    background:     "linear-gradient(135deg, #059669, #047857)",
    color:          "#fff",
    borderRadius:   14,
    textDecoration: "none",
    fontWeight:     800,
    fontSize:       "0.9rem",
    boxShadow:      "0 4px 14px rgba(5,150,105,0.3)",
  },

  /* Review card */
  card: {
    background:   "#fff",
    borderRadius: 20,
    border:       "1.5px solid #e2e8f0",
    boxShadow:    "0 2px 12px rgba(0,0,0,0.04)",
    overflow:     "hidden",
    marginBottom: 12,
    transition:   "border-color 0.2s, box-shadow 0.2s",
  },
  cardStrip: (rating) => {
    const color =
      rating >= 4 ? "#059669" :
      rating >= 3 ? "#d97706" :
                    "#dc2626";
    return {
      height:     4,
      background: `linear-gradient(90deg, ${color}, ${color}88)`,
    };
  },
  cardBody: { padding: "20px 24px" },
  cardTop: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    gap:            12,
    flexWrap:       "wrap",
  },

  destName: {
    fontSize:   "1rem",
    fontWeight: 800,
    color:      "#0f172a",
    margin:     "0 0 6px",
  },
  ratingRow: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
  },
  ratingBadge: (rating) => {
    const color =
      rating >= 4 ? "#059669" :
      rating >= 3 ? "#d97706" :
                    "#dc2626";
    const bg =
      rating >= 4 ? "#ecfdf5" :
      rating >= 3 ? "#fffbeb" :
                    "#fef2f2";
    const border =
      rating >= 4 ? "#6ee7b7" :
      rating >= 3 ? "#fde68a" :
                    "#fecaca";
    return {
      display:        "inline-flex",
      alignItems:     "center",
      gap:            4,
      padding:        "3px 10px",
      borderRadius:   8,
      fontSize:       "0.8rem",
      fontWeight:     900,
      color,
      background:     bg,
      border:         `1px solid ${border}`,
    };
  },
  reviewDate: {
    fontSize:   "0.73rem",
    color:      "#94a3b8",
    margin:     "6px 0 0",
    display:    "flex",
    alignItems: "center",
    gap:        4,
  },
  comment: {
    marginTop:    14,
    padding:      "13px 16px",
    background:   "#f8fafc",
    borderRadius: 12,
    border:       "1px solid #f1f5f9",
    fontSize:     "0.87rem",
    color:        "#374151",
    lineHeight:   1.65,
  },
  adminResponse: {
    marginTop:    10,
    padding:      "11px 15px",
    background:   "#ecfdf5",
    border:       "1px solid #bbf7d0",
    borderRadius: 11,
  },
  adminResponseLabel: {
    margin:        "0 0 4px",
    fontSize:      "0.63rem",
    fontWeight:    800,
    color:         "#166534",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  adminResponseText: {
    margin:    0,
    fontSize:  "0.84rem",
    color:     "#166534",
    lineHeight: 1.5,
  },
  actions: {
    display:    "flex",
    gap:        8,
    marginTop:  14,
    flexWrap:   "wrap",
  },
  editBtn: {
    display:    "inline-flex",
    alignItems: "center",
    gap:        5,
    padding:    "7px 14px",
    borderRadius: 10,
    border:     "1.5px solid #fde68a",
    background: "#fffbeb",
    color:      "#d97706",
    fontSize:   "0.78rem",
    fontWeight: 700,
    cursor:     "pointer",
    fontFamily: "inherit",
    transition: "all 0.18s",
  },
  deleteBtn: {
    display:    "inline-flex",
    alignItems: "center",
    gap:        5,
    padding:    "7px 14px",
    borderRadius: 10,
    border:     "1.5px solid #fecaca",
    background: "#fef2f2",
    color:      "#dc2626",
    fontSize:   "0.78rem",
    fontWeight: 700,
    cursor:     "pointer",
    fontFamily: "inherit",
    transition: "all 0.18s",
  },
  refreshBtn: {
    display:     "inline-flex",
    alignItems:  "center",
    gap:         7,
    padding:     "10px 16px",
    borderRadius: 12,
    border:      "1.5px solid #e2e8f0",
    background:  "#fff",
    color:       "#64748b",
    fontSize:    "0.82rem",
    fontWeight:  700,
    cursor:      "pointer",
    fontFamily:  "inherit",
    transition:  "all 0.2s",
  },
};

const KEYFRAMES = `
  @keyframes rvFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes rvSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @media (max-width: 640px) {
    .rv-card-body  { padding: 14px 16px !important; }
    .rv-hero-wrap  { padding: 1.5rem !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   STAR RATING COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? rating;

  return (
    <div style={{ display: "flex", gap: 2, cursor: interactive ? "pointer" : "default" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= display ? "#f59e0b" : "none"}
          color={n <= display ? "#f59e0b" : "#e2e8f0"}
          style={{ transition: "color 0.12s, fill 0.12s" }}
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(null)}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE CONFIRM INLINE
═══════════════════════════════════════════════════════════════════════════ */

function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          8,
      padding:      "10px 14px",
      background:   "#fef2f2",
      border:       "1px solid #fecaca",
      borderRadius: 11,
      marginTop:    10,
    }}>
      <AlertCircle size={15} color="#dc2626" />
      <span style={{ fontSize: "0.82rem", color: "#991b1b", fontWeight: 600, flex: 1 }}>
        Delete this review?
      </span>
      <button
        onClick={onCancel}
        style={{
          border: "1px solid #fecaca", background: "#fff",
          color: "#dc2626", borderRadius: 8, padding: "5px 12px",
          fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
        }}
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        style={{
          border: "none", background: "#dc2626", color: "#fff",
          borderRadius: 8, padding: "5px 12px",
          fontWeight: 800, fontSize: "0.78rem",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 5,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? <><Loader2 size={12} style={{ animation: "rvSpin 0.8s linear infinite" }} /> Deleting…</>
          : <><Trash2 size={12} /> Delete</>}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEW CARD
═══════════════════════════════════════════════════════════════════════════ */

function ReviewCard({ review, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(review.id);
    setDeleting(false);
    setConfirmDelete(false);
  };

  const name =
    review.destination_name ||
    review.destination?.name ||
    "Destination";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -10 }}
      transition={{ duration: 0.24 }}
      style={S.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#6ee7b7";
        e.currentTarget.style.boxShadow   = "0 8px 28px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow   = "0 2px 12px rgba(0,0,0,0.04)";
      }}
    >
      {/* Colour strip tied to rating */}
      <div style={S.cardStrip(review.rating || 0)} />

      <div className="rv-card-body" style={S.cardBody}>
        <div style={S.cardTop}>
          {/* Left */}
          <div>
            <p style={S.destName}>{name}</p>
            <div style={S.ratingRow}>
              <StarRating rating={review.rating || 0} size={15} />
              <span style={S.ratingBadge(review.rating || 0)}>
                <Star size={11} fill="currentColor" />
                {review.rating || 0}
              </span>
            </div>
            <p style={S.reviewDate}>
              <MapPin size={11} /> {fmtDate(review.created_at)}
            </p>
          </div>

          {/* Right — status */}
          {review.is_approved && (
            <span style={{
              display:     "inline-flex",
              alignItems:  "center",
              gap:         4,
              padding:     "4px 10px",
              borderRadius: 8,
              fontSize:    "0.68rem",
              fontWeight:  800,
              color:       "#059669",
              background:  "#ecfdf5",
              border:      "1px solid #6ee7b7",
            }}>
              <CheckCircle size={11} /> Published
            </span>
          )}
        </div>

        {/* Comment */}
        {review.comment && (
          <div style={S.comment}>{review.comment}</div>
        )}

        {/* Admin response */}
        {review.admin_response && (
          <div style={S.adminResponse}>
            <p style={S.adminResponseLabel}>Response from Altuvera Team</p>
            <p style={S.adminResponseText}>{review.admin_response}</p>
          </div>
        )}

        {/* Actions */}
        {!confirmDelete ? (
          <div style={S.actions}>
            <button
              style={S.editBtn}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef3c7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fffbeb"; }}
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              style={S.deleteBtn}
              onClick={() => setConfirmDelete(true)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        ) : (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
            loading={deleting}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */

export default function UserReviews() {
  const { authFetch } = useUserAuth();

  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [authWarn, setAuthWarn] = useState(null);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthWarn(null);

    // Try /reviews/my first, then /reviews?mine=true
    let { data, error: err } = await safeFetch(authFetch, "/reviews/my");

    if ((err || !data) && !err?.startsWith("auth:")) {
      const fb = await safeFetch(authFetch, "/reviews?mine=true");
      if (!fb.error && fb.data) { data = fb.data; err = null; }
    }

    if (err) {
      if (err.startsWith("auth:")) {
        setAuthWarn("Session may have expired. Please reload or log in again.");
      } else {
        setError(err);
      }
    } else {
      const rows =
        data?.data ||
        data?.reviews ||
        (Array.isArray(data) ? data : []);
      setReviews(rows);
    }

    setLoading(false);
  }, [authFetch]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  /* ── Delete ─────────────────────────────────────────────────────────────── */
  const handleDelete = useCallback(async (id) => {
    const { error: delErr } = await safeFetch(
      authFetch,
      `/reviews/${id}`,
      { method: "DELETE" },
    );
    if (!delErr) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  }, [authFetch]);

  /* ── Stats ─────────────────────────────────────────────────────────────── */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */

  return (
    <>
      <Helmet>
        <title>My Reviews | Altuvera</title>
        <meta name="description" content="Reviews you've left for destinations and tours." />
      </Helmet>

      <style>{KEYFRAMES}</style>

      <DashboardLayout
        title="My Reviews"
        subtitle="Reviews you've left for destinations and tours."
      >
        <div style={S.root}>

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <div className="rv-hero-wrap" style={S.hero}>
            <div style={S.heroBubble} />

            <div style={S.heroIconWrap}>
              <MessageSquare size={24} color="#ffffff" />
            </div>

            <h1 style={S.heroTitle}>My Reviews</h1>
            <p style={S.heroSub}>
              Share your experiences and help other travellers decide
            </p>

            <div style={S.heroStats}>
              {[
                { value: reviews.length, label: "Total Reviews"  },
                { value: avgRating,      label: "Avg Rating"     },
              ].map((s) => (
                <div key={s.label} style={S.heroStatPill}>
                  <span style={S.heroStatValue}>{s.value}</span>
                  <span style={S.heroStatLabel}>{s.label}</span>
                </div>
              ))}

              <Link
                to="/destinations"
                style={S.heroWriteBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.24)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              >
                <Plus size={14} /> Write a Review
              </Link>

              <button
                style={S.refreshBtn}
                onClick={fetchReviews}
                disabled={loading}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff";    e.currentTarget.style.color = "#64748b"; }}
              >
                <RefreshCw
                  size={14}
                  style={loading ? { animation: "rvSpin 0.8s linear infinite" } : undefined}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Auth warning ─────────────────────────────────────────── */}
          {authWarn && (
            <div style={S.authWarnBanner}>
              <AlertCircle size={16} color="#d97706" />
              {authWarn}
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginLeft: "auto", border: "none", background: "transparent",
                  color: "#92400e", fontWeight: 700, cursor: "pointer",
                  textDecoration: "underline", padding: 0, fontSize: "0.82rem",
                }}
              >
                Reload
              </button>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {error && (
            <div style={S.errorBanner}>
              <AlertCircle size={15} />
              {error}
              <button
                onClick={fetchReviews}
                style={{
                  marginLeft: "auto", border: "none", background: "transparent",
                  color: "#991b1b", fontWeight: 700, cursor: "pointer",
                  textDecoration: "underline", padding: 0, fontSize: "0.82rem",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Loading ──────────────────────────────────────────────── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={S.spinner} />
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "14px 0 0" }}>
                Loading your reviews…
              </p>
            </div>
          )}

          {/* ── Empty state ───────────────────────────────────────────── */}
          {!loading && !error && reviews.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              style={S.empty}
            >
              <div style={S.emptyIconWrap}>
                <Star size={36} color="#059669" />
              </div>
              <h3 style={S.emptyTitle}>No reviews yet</h3>
              <p style={S.emptyText}>
                Visit a destination and share your experience with the community!
              </p>
              <Link to="/destinations" style={S.emptyCta}>
                <Globe size={16} /> Browse Destinations
              </Link>
            </motion.div>
          )}

          {/* ── Review cards ─────────────────────────────────────────── */}
          {!loading && reviews.length > 0 && (
            <AnimatePresence>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}