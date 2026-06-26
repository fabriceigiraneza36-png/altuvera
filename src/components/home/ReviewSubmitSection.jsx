// src/components/home/ReviewSubmitSection.jsx
import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from "react";
import { FaStar } from "react-icons/fa6";
import {
  HiCheckCircle, HiSparkles, HiX,
} from "react-icons/hi";
import {
  HiOutlineMapPin, HiOutlineGlobeAlt,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { RiDoubleQuotesL } from "react-icons/ri";

import { useUserAuth }            from "../../context/UserAuthContext";
import { useSubmitTestimonial }   from "../../hooks/useSubmitTestimonial";
import { useFeaturedTestimonials } from "../../hooks/useTestimonials";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MAX_WORDS   = 60;
const STAR_LABELS = ["Terrible", "Poor", "Good", "Great", "Excellent"];

const countWords = (s = "") =>
  s.trim().split(/\s+/).filter(Boolean).length;

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const avatarFallback = (name = "", color = "#059669") => {
  const initials = getInitials(name) || "T";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.replace("#", "")}&color=fff&bold=true&size=96`;
};

/* ══════════════════════════════════════════════════════════
   STAR RATING INPUT
══════════════════════════════════════════════════════════ */
const StarRatingInput = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div
      className="rs-stars"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`${n} star — ${STAR_LABELS[n - 1]}`}
          className={`rs-star-btn ${n <= display ? "rs-star-btn--on" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
        >
          <FaStar />
        </button>
      ))}
      {display > 0 && (
        <span className="rs-star-lbl">{STAR_LABELS[display - 1]}</span>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SINGLE REVIEW CARD  (used in the wall)
══════════════════════════════════════════════════════════ */
const ReviewCard = ({ item, delay = 0 }) => {
  const stars = Math.max(1, Math.min(5, parseInt(item.rating) || 5));
  const initials = getInitials(item.name);

  return (
    <div
      className="rs-rcard"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Top row: stars + featured badge */}
      <div className="rs-rcard-top">
        <div className="rs-rcard-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar
              key={i}
              className={i < stars ? "rs-rcard-star--on" : "rs-rcard-star--off"}
            />
          ))}
        </div>
        {item.is_featured && (
          <span className="rs-rcard-featured">
            <HiSparkles /> Featured
          </span>
        )}
      </div>

      {/* Quote icon */}
      <div className="rs-rcard-quote-icon">
        <RiDoubleQuotesL />
      </div>

      {/* Text */}
      <p className="rs-rcard-text">{item.testimonial_text}</p>

      {/* Author */}
      <div className="rs-rcard-author">
        <div className="rs-rcard-avatar">
          {item.avatar_url ? (
            <img src={item.avatar_url} alt={item.name} />
          ) : (
            <span>{initials || "T"}</span>
          )}
        </div>
        <div className="rs-rcard-meta">
          <strong>{item.name}</strong>
          {(item.trip || item.location) && (
            <span>
              {[item.trip, item.location].filter(Boolean).join(" · ")}
            </span>
          )}
          {item.date_text && <em>{item.date_text}</em>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SKELETON CARD
══════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="rs-rcard rs-rcard--skel">
    <div className="rs-skel rs-skel--stars" />
    <div className="rs-skel rs-skel--line rs-skel--w100" />
    <div className="rs-skel rs-skel--line rs-skel--w80" />
    <div className="rs-skel rs-skel--line rs-skel--w60" />
    <div className="rs-rcard-author">
      <div className="rs-skel rs-skel--avatar" />
      <div style={{ flex: 1 }}>
        <div className="rs-skel rs-skel--line rs-skel--w50" style={{ marginBottom: 6 }} />
        <div className="rs-skel rs-skel--line rs-skel--w30" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   REVIEW WALL  (right column — live backend data)
══════════════════════════════════════════════════════════ */
const ReviewWall = ({ testimonials, loading }) => {
  const [page,    setPage]    = useState(0);
  const [paused,  setPaused]  = useState(false);
  const perPage   = 4;
  const total     = testimonials.length;
  const pages     = Math.ceil(total / perPage);
  const timerRef  = useRef(null);

  const slice = useMemo(
    () => testimonials.slice(page * perPage, page * perPage + perPage),
    [testimonials, page, perPage],
  );

  const next = useCallback(
    () => setPage((p) => (p + 1) % pages),
    [pages],
  );
  const prev = useCallback(
    () => setPage((p) => (p - 1 + pages) % pages),
    [pages],
  );

  useEffect(() => {
    if (paused || pages <= 1) return;
    timerRef.current = setInterval(next, 8000);
    return () => clearInterval(timerRef.current);
  }, [next, pages, paused]);

  if (loading) {
    return (
      <div className="rs-wall">
        <div className="rs-wall-grid">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rs-wall">
        <div className="rs-wall-empty">
          <RiDoubleQuotesL className="rs-wall-empty-icon" />
          <p>No reviews yet — yours could be the first!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rs-wall"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rs-wall-grid">
        {slice.map((item, i) => (
          <ReviewCard
            key={item.id}
            item={item}
            delay={i * 80}
          />
        ))}
      </div>

      {pages > 1 && (
        <div className="rs-wall-nav">
          <button
            className="rs-wall-nav-btn"
            onClick={prev}
            aria-label="Previous reviews"
          >
            <IoChevronBack />
          </button>

          <div className="rs-wall-dots">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                className={`rs-wall-dot ${i === page ? "rs-wall-dot--active" : ""}`}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="rs-wall-nav-btn"
            onClick={next}
            aria-label="Next reviews"
          >
            <IoChevronForward />
          </button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   REVIEW FORM  (left column)
══════════════════════════════════════════════════════════ */
const ReviewForm = ({ user }) => {
  const [form, setForm] = useState({
    testimonial_text: "",
    rating:           5,
    trip:             "",
    location:         "",
  });
  const [focused, setFocused] = useState(false);

  const wordCount = countWords(form.testimonial_text);
  const wordsLeft = MAX_WORDS - wordCount;
  const overLimit = wordCount > MAX_WORDS;
  const pct       = Math.min(100, (wordCount / MAX_WORDS) * 100);
  const barColor  = overLimit     ? "#ef4444"
    : wordCount > MAX_WORDS * 0.8 ? "#f59e0b"
    : "#22c55e";

  const { submit, submitting, submitted, error, reset } =
    useSubmitTestimonial();

  const set = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(form);
  };

  const userName   = user?.fullName || user?.full_name || user?.name || user?.email?.split("@")[0] || "Traveler";
  const userAvatar = user?.avatar   || user?.avatarUrl || user?.avatar_url;

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="rs-success">
        <div className="rs-success-ring">
          <HiCheckCircle className="rs-success-icon" />
        </div>
        <h3 className="rs-success-title">
          Thank you, {userName.split(" ")[0]}!
        </h3>
        <p className="rs-success-body">
          Your review has been submitted and will appear here once our team
          approves it — usually within 24 hours.
        </p>
        <button className="rs-success-again" onClick={reset}>
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form className="rs-form" onSubmit={handleSubmit} noValidate>

      {/* ── Who is writing ── */}
      <div className="rs-who">
        <div className="rs-who-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            <span>{getInitials(userName) || "T"}</span>
          )}
          <div className="rs-who-verified-dot" title="Verified member">
            <MdVerified />
          </div>
        </div>
        <div className="rs-who-text">
          <strong>{userName}</strong>
          <span>
            <MdVerified style={{ color: "#22c55e", verticalAlign: "middle" }} />
            {" "}Verified Member
          </span>
        </div>
      </div>

      {/* ── Star rating ── */}
      <div className="rs-field">
        <label className="rs-label">Overall Rating</label>
        <StarRatingInput
          value={form.rating}
          onChange={(v) => set("rating", v)}
          disabled={submitting}
        />
      </div>

      {/* ── Review text ── */}
      <div className="rs-field">
        <div className="rs-label-row">
          <label className="rs-label" htmlFor="rs-text">
            Your Experience
          </label>
          <span
            className={`rs-wcount ${
              overLimit ? "rs-wcount--over"
              : wordsLeft <= 10 ? "rs-wcount--warn"
              : ""
            }`}
          >
            {wordCount}&thinsp;/&thinsp;{MAX_WORDS}
          </span>
        </div>
        <div className={`rs-ta-wrap ${focused ? "rs-ta-wrap--focus" : ""} ${overLimit ? "rs-ta-wrap--error" : ""}`}>
          <textarea
            id="rs-text"
            className="rs-textarea"
            placeholder="Tell fellow travelers about your experience — what made it special, what surprised you, what you'd recommend…"
            value={form.testimonial_text}
            onChange={(e) => set("testimonial_text", e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={5}
            disabled={submitting}
            maxLength={600}
            required
          />
          {/* Progress bar */}
          <div className="rs-progress">
            <div
              className="rs-progress-fill"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
        </div>
        {overLimit && (
          <p className="rs-field-err">
            Please trim your review to {MAX_WORDS} words or fewer.
          </p>
        )}
      </div>

      {/* ── Optional fields ── */}
      <div className="rs-grid-2">
        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-trip">
            Trip / Package
            <span className="rs-opt"> — optional</span>
          </label>
          <div className="rs-input-wrap">
            <HiOutlineGlobeAlt className="rs-input-icon" />
            <input
              id="rs-trip"
              type="text"
              className="rs-input"
              placeholder="e.g. Gorilla Trek…"
              value={form.trip}
              onChange={(e) => set("trip", e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
          </div>
        </div>

        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-loc">
            Where you&apos;re from
            <span className="rs-opt"> — optional</span>
          </label>
          <div className="rs-input-wrap">
            <HiOutlineMapPin className="rs-input-icon" />
            <input
              id="rs-loc"
              type="text"
              className="rs-input"
              placeholder="e.g. London, UK"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              disabled={submitting}
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rs-err-banner">
          <span>{error}</span>
          <button
            type="button"
            className="rs-err-close"
            onClick={() => {}}
            aria-label="Dismiss error"
          >
            <HiX />
          </button>
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        className="rs-submit"
        disabled={
          submitting ||
          overLimit  ||
          !form.testimonial_text.trim()
        }
      >
        {submitting ? (
          <>
            <span className="rs-spinner" />
            Submitting…
          </>
        ) : (
          <>
            <HiOutlinePaperAirplane />
            Share My Experience
          </>
        )}
      </button>

      <p className="rs-note">
        Reviews are moderated and typically approved within 24 hours.
      </p>
    </form>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
   Only rendered when user IS authenticated (Home.jsx gate)
══════════════════════════════════════════════════════════ */
export default function ReviewSubmitSection() {
  const { user }                      = useUserAuth();
  const { testimonials, loading }     = useFeaturedTestimonials(12);

  return (
    <section className="rs-section" aria-labelledby="rs-heading">

      {/* ── Styles ── */}
      <ReviewStyles />

      <div className="rs-container">

        {/* ── Section label ── */}
        <div className="rs-section-label">
          <span className="rs-section-pill">
            <MdVerified />
            Member Exclusive
          </span>
        </div>

        {/* ── Two-column layout ── */}
        <div className="rs-layout">

          {/* LEFT — form */}
          <div className="rs-left">
            <div className="rs-left-head">
              <h2 id="rs-heading" className="rs-left-title">
                Share Your<br />
                <span className="rs-gradient">Adventure Story</span>
              </h2>
              <p className="rs-left-sub">
                Help fellow travelers plan their journey with your honest, 
                first-hand experience. Keep it real — up to 60 words.
              </p>
            </div>

            <div className="rs-form-card">
              <ReviewForm user={user} />
            </div>
          </div>

          {/* RIGHT — wall of love */}
          <div className="rs-right">
            <div className="rs-right-head">
              <h3 className="rs-right-title">
                Community Reviews
              </h3>
              {!loading && testimonials.length > 0 && (
                <span className="rs-right-count">
                  {testimonials.length}
                  {" "}review{testimonials.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <ReviewWall
              testimonials={testimonials}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SELF-CONTAINED STYLES
══════════════════════════════════════════════════════════ */
function ReviewStyles() {
  return (
    <style>{`

/* ─────────────────────────────────────────
   SECTION SHELL
───────────────────────────────────────── */
.rs-section {
  position: relative;
  background: linear-gradient(175deg,#f8fafc 0%,#f0fdf4 40%,#fafffe 100%);
  padding: clamp(4rem,8vw,6.5rem) 0;
  border-top: 1px solid #e2e8f0;
  overflow: hidden;
  isolation: isolate;
}

/* Decorative blobs */
.rs-section::before,
.rs-section::after {
  content:'';
  position:absolute;
  border-radius:50%;
  pointer-events:none;
  z-index:0;
}
.rs-section::before {
  width:600px; height:600px;
  top:-200px; right:-150px;
  background:radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 65%);
}
.rs-section::after {
  width:400px; height:400px;
  bottom:-100px; left:-80px;
  background:radial-gradient(circle,rgba(16,185,129,0.05) 0%,transparent 65%);
}

.rs-container {
  max-width:1320px;
  margin:0 auto;
  padding:0 clamp(1.25rem,4vw,3rem);
  position:relative;
  z-index:1;
}

/* ─────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────── */
.rs-section-label {
  text-align:center;
  margin-bottom:clamp(2rem,4vw,3rem);
}
.rs-section-pill {
  display:inline-flex;
  align-items:center;
  gap:0.45rem;
  font-size:0.72rem;
  font-weight:800;
  letter-spacing:0.12em;
  text-transform:uppercase;
  padding:0.55rem 1.25rem;
  border-radius:100px;
  background:rgba(22,163,74,0.08);
  color:#16a34a;
  border:1px solid rgba(22,163,74,0.18);
}
.rs-section-pill svg { width:14px; height:14px; }

/* ─────────────────────────────────────────
   LAYOUT
───────────────────────────────────────── */
.rs-layout {
  display:grid;
  grid-template-columns:1fr 1.15fr;
  gap:clamp(2rem,5vw,4rem);
  align-items:start;
}

/* ─────────────────────────────────────────
   LEFT COLUMN
───────────────────────────────────────── */
.rs-left { display:flex; flex-direction:column; gap:2rem; }

.rs-left-head { }
.rs-left-title {
  font-size:clamp(2rem,4vw,3rem);
  font-weight:900;
  letter-spacing:-0.035em;
  line-height:1.1;
  color:#0f172a;
  margin:0 0 1rem;
}
.rs-gradient {
  background:linear-gradient(135deg,#15803d 0%,#22c55e 50%,#4ade80 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.rs-left-sub {
  font-size:clamp(0.9rem,1.3vw,1.05rem);
  color:#64748b;
  line-height:1.7;
  margin:0;
  max-width:400px;
}

/* ─────────────────────────────────────────
   FORM CARD
───────────────────────────────────────── */
.rs-form-card {
  background:#ffffff;
  border:1.5px solid #e2e8f0;
  border-radius:2rem;
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,0.04),
    0 20px 50px -10px rgba(0,0,0,0.08);
  overflow:hidden;
  transition:box-shadow 0.3s ease;
}
.rs-form-card:hover {
  box-shadow:
    0 4px 6px -1px rgba(0,0,0,0.04),
    0 30px 60px -10px rgba(5,150,105,0.12);
}

/* ─────────────────────────────────────────
   FORM INTERNALS
───────────────────────────────────────── */
.rs-form {
  padding:2rem 2.25rem 2.25rem;
  display:flex;
  flex-direction:column;
  gap:1.35rem;
}

/* Who strip */
.rs-who {
  display:flex;
  align-items:center;
  gap:1rem;
  padding:1rem 1.25rem;
  background:linear-gradient(135deg,#f0fdf4,#ecfdf5);
  border-radius:1.25rem;
  border:1px solid #d1fae5;
}
.rs-who-avatar {
  position:relative;
  width:48px; height:48px; flex-shrink:0;
  border-radius:50%;
  overflow:visible;
}
.rs-who-avatar img,
.rs-who-avatar span {
  width:100%; height:100%;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  object-fit:cover;
}
.rs-who-avatar span {
  background:#16a34a;
  color:#fff;
  font-size:1.05rem;
  font-weight:800;
  letter-spacing:0;
}
.rs-who-avatar img {
  border:2.5px solid #4ade80;
}
.rs-who-verified-dot {
  position:absolute;
  bottom:-2px; right:-2px;
  width:18px; height:18px;
  border-radius:50%;
  background:#fff;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 1px 4px rgba(0,0,0,0.15);
}
.rs-who-verified-dot svg { width:14px; height:14px; color:#22c55e; }

.rs-who-text strong {
  display:block;
  font-size:0.95rem;
  font-weight:700;
  color:#0f172a;
  margin-bottom:0.15rem;
}
.rs-who-text span {
  font-size:0.75rem;
  font-weight:600;
  color:#15803d;
  display:flex;
  align-items:center;
  gap:3px;
}

/* Field */
.rs-field { display:flex; flex-direction:column; gap:0.5rem; }
.rs-label {
  font-size:0.82rem;
  font-weight:700;
  color:#374151;
}
.rs-opt { font-weight:400; font-size:0.75rem; color:#9ca3af; }
.rs-label-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.rs-wcount {
  font-size:0.72rem;
  font-weight:700;
  color:#9ca3af;
  font-variant-numeric:tabular-nums;
  transition:color 0.2s;
}
.rs-wcount--warn { color:#f59e0b; }
.rs-wcount--over { color:#ef4444; }

/* Stars */
.rs-stars {
  display:flex;
  align-items:center;
  gap:0.3rem;
  flex-wrap:wrap;
}
.rs-star-btn {
  background:none; border:none; cursor:pointer;
  padding:0.25rem;
  font-size:1.6rem;
  color:#e5e7eb;
  line-height:1;
  transition:color 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.rs-star-btn--on { color:#f59e0b; }
.rs-star-btn:hover:not(:disabled) { transform:scale(1.25); }
.rs-star-btn:disabled { cursor:not-allowed; opacity:0.6; }
.rs-star-lbl {
  font-size:0.8rem;
  font-weight:700;
  color:#22c55e;
  margin-left:0.4rem;
}

/* Textarea */
.rs-ta-wrap {
  border-radius:1rem;
  border:2px solid #e5e7eb;
  background:#f9fafb;
  overflow:hidden;
  transition:border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s;
}
.rs-ta-wrap--focus {
  border-color:#22c55e;
  background:#fff;
  box-shadow:0 0 0 4px rgba(34,197,94,0.1);
}
.rs-ta-wrap--error {
  border-color:#ef4444;
  background:#fef2f2;
}
.rs-textarea {
  width:100%; display:block;
  padding:1rem 1.1rem;
  border:none; outline:none;
  background:transparent;
  font-size:0.9rem;
  color:#111827;
  line-height:1.7;
  font-family:inherit;
  resize:vertical;
  min-height:130px;
  box-sizing:border-box;
}
.rs-textarea::placeholder { color:#9ca3af; }

/* Progress bar */
.rs-progress {
  height:3px;
  background:#f3f4f6;
  border-radius:0 0 1rem 1rem;
  overflow:hidden;
}
.rs-progress-fill {
  height:100%;
  border-radius:999px;
  transition:width 0.3s ease, background 0.3s ease;
}

/* Field error */
.rs-field-err {
  font-size:0.75rem;
  color:#ef4444;
  font-weight:600;
  margin:0;
}

/* 2-column grid for optional fields */
.rs-grid-2 {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1rem;
}

/* Input */
.rs-input-wrap { position:relative; }
.rs-input-icon {
  position:absolute;
  left:0.85rem; top:50%; transform:translateY(-50%);
  width:16px; height:16px;
  color:#9ca3af;
  pointer-events:none;
}
.rs-input {
  width:100%;
  height:46px;
  padding:0 0.9rem 0 2.5rem;
  border-radius:0.85rem;
  border:2px solid #e5e7eb;
  background:#f9fafb;
  font-size:0.85rem;
  color:#111827;
  font-family:inherit;
  outline:none;
  transition:border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s;
  box-sizing:border-box;
}
.rs-input::placeholder { color:#9ca3af; }
.rs-input:focus {
  border-color:#22c55e;
  background:#fff;
  box-shadow:0 0 0 4px rgba(34,197,94,0.10);
}
.rs-input:disabled { opacity:0.6; cursor:not-allowed; }

/* Error banner */
.rs-err-banner {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:0.75rem;
  padding:0.9rem 1rem;
  background:#fef2f2;
  border:1px solid #fecaca;
  border-radius:0.85rem;
  font-size:0.82rem;
  color:#dc2626;
  font-weight:500;
}
.rs-err-close {
  background:none; border:none; cursor:pointer;
  color:#ef4444; display:flex; align-items:center;
  padding:0.2rem; border-radius:4px; flex-shrink:0;
  transition:background 0.15s;
}
.rs-err-close:hover { background:#fee2e2; }
.rs-err-close svg { width:15px; height:15px; }

/* Submit */
.rs-submit {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:0.6rem;
  width:100%;
  height:54px;
  border-radius:1rem;
  border:none;
  background:linear-gradient(135deg,#14532d 0%,#16a34a 50%,#22c55e 100%);
  color:#fff;
  font-size:0.95rem;
  font-weight:700;
  font-family:inherit;
  letter-spacing:0.01em;
  cursor:pointer;
  box-shadow:0 4px 20px rgba(22,163,74,0.30);
  transition:transform 0.25s ease, box-shadow 0.25s ease, opacity 0.2s;
  position:relative;
  overflow:hidden;
}
.rs-submit::after {
  content:'';
  position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%);
  pointer-events:none;
}
.rs-submit:hover:not(:disabled) {
  transform:translateY(-2px);
  box-shadow:0 8px 28px rgba(22,163,74,0.40);
}
.rs-submit:active:not(:disabled) {
  transform:scale(0.97);
}
.rs-submit:disabled {
  opacity:0.45;
  cursor:not-allowed;
  transform:none;
}
.rs-submit svg { width:17px; height:17px; }
.rs-spinner {
  display:inline-block;
  width:17px; height:17px;
  border:2px solid rgba(255,255,255,0.3);
  border-top-color:#fff;
  border-radius:50%;
  animation:rsSpinAnim 0.7s linear infinite;
  flex-shrink:0;
}
@keyframes rsSpinAnim { to { transform:rotate(360deg); } }

.rs-note {
  font-size:0.72rem;
  color:#9ca3af;
  text-align:center;
  margin:0;
  line-height:1.5;
}

/* ─────────────────────────────────────────
   SUCCESS STATE
───────────────────────────────────────── */
.rs-success {
  padding:2.5rem 2rem 3rem;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:1rem;
}
.rs-success-ring {
  width:80px; height:80px;
  border-radius:50%;
  background:linear-gradient(135deg,#dcfce7,#bbf7d0);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 0 12px rgba(34,197,94,0.08);
  animation:rsPopAnim 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes rsPopAnim {
  from { transform:scale(0); opacity:0; }
  to   { transform:scale(1); opacity:1; }
}
.rs-success-icon { width:40px; height:40px; color:#16a34a; }
.rs-success-title {
  font-size:1.4rem;
  font-weight:800;
  color:#0f172a;
  margin:0;
  letter-spacing:-0.02em;
}
.rs-success-body {
  font-size:0.9rem;
  color:#64748b;
  line-height:1.7;
  margin:0;
  max-width:28rem;
}
.rs-success-again {
  background:none;
  border:1.5px solid #d1fae5;
  color:#16a34a;
  font-size:0.82rem;
  font-weight:700;
  padding:0.6rem 1.5rem;
  border-radius:100px;
  cursor:pointer;
  font-family:inherit;
  transition:all 0.2s ease;
  margin-top:0.25rem;
}
.rs-success-again:hover {
  background:#f0fdf4;
  border-color:#86efac;
  transform:translateY(-1px);
}

/* ─────────────────────────────────────────
   RIGHT COLUMN — HEADING
───────────────────────────────────────── */
.rs-right { display:flex; flex-direction:column; gap:1.5rem; }
.rs-right-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
}
.rs-right-title {
  font-size:1.25rem;
  font-weight:800;
  color:#0f172a;
  margin:0;
  letter-spacing:-0.02em;
}
.rs-right-count {
  font-size:0.72rem;
  font-weight:700;
  color:#16a34a;
  background:rgba(22,163,74,0.08);
  border:1px solid rgba(22,163,74,0.15);
  padding:0.3rem 0.85rem;
  border-radius:100px;
  white-space:nowrap;
}

/* ─────────────────────────────────────────
   REVIEW WALL
───────────────────────────────────────── */
.rs-wall { display:flex; flex-direction:column; gap:1.25rem; }

.rs-wall-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:1rem;
}

/* Empty state */
.rs-wall-empty {
  text-align:center;
  padding:4rem 2rem;
  color:#94a3b8;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0.75rem;
}
.rs-wall-empty-icon {
  width:3rem; height:3rem;
  color:#d1fae5;
}
.rs-wall-empty p {
  font-size:0.9rem;
  color:#64748b;
  margin:0;
}

/* Pagination */
.rs-wall-nav {
  display:flex;
  align-items:center;
  justify-content:center;
  gap:1rem;
  margin-top:0.5rem;
}
.rs-wall-nav-btn {
  width:36px; height:36px;
  border-radius:50%;
  border:1.5px solid #e2e8f0;
  background:#fff;
  color:#16a34a;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer;
  font-size:1rem;
  transition:all 0.2s ease;
  box-shadow:0 2px 8px rgba(0,0,0,0.06);
}
.rs-wall-nav-btn:hover {
  background:#f0fdf4;
  border-color:#a7f3d0;
  transform:scale(1.08);
}
.rs-wall-dots {
  display:flex;
  align-items:center;
  gap:0.45rem;
}
.rs-wall-dot {
  width:8px; height:8px;
  border-radius:100px;
  border:none;
  background:#d1fae5;
  cursor:pointer;
  padding:0;
  transition:all 0.3s ease;
}
.rs-wall-dot--active {
  width:24px;
  background:#16a34a;
}

/* ─────────────────────────────────────────
   REVIEW CARD
───────────────────────────────────────── */
.rs-rcard {
  background:#fff;
  border:1.5px solid #f1f5f9;
  border-radius:1.5rem;
  padding:1.5rem;
  display:flex;
  flex-direction:column;
  gap:0.8rem;
  box-shadow:0 2px 12px rgba(0,0,0,0.04);
  transition:
    transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.35s ease,
    border-color 0.2s ease;
  animation:rsCardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes rsCardIn {
  from { opacity:0; transform:translateY(16px) scale(0.96); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.rs-rcard:hover {
  transform:translateY(-5px);
  box-shadow:0 16px 40px rgba(22,163,74,0.10);
  border-color:#d1fae5;
}

/* Card top row */
.rs-rcard-top {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:0.5rem;
}
.rs-rcard-stars {
  display:flex;
  gap:0.15rem;
}
.rs-rcard-star--on  { font-size:0.8rem; color:#f59e0b; }
.rs-rcard-star--off { font-size:0.8rem; color:#e5e7eb; }

.rs-rcard-featured {
  display:inline-flex;
  align-items:center;
  gap:0.25rem;
  font-size:0.62rem;
  font-weight:800;
  letter-spacing:0.06em;
  text-transform:uppercase;
  color:#d97706;
  background:#fefce8;
  border:1px solid #fde68a;
  padding:0.2rem 0.6rem;
  border-radius:100px;
}
.rs-rcard-featured svg { width:10px; height:10px; }

/* Quote icon */
.rs-rcard-quote-icon {
  font-size:1.5rem;
  line-height:1;
  color:rgba(22,163,74,0.15);
  margin-bottom:-0.4rem;
}

/* Text */
.rs-rcard-text {
  font-size:0.875rem;
  color:#374151;
  line-height:1.7;
  margin:0;
  flex:1;
  display:-webkit-box;
  -webkit-line-clamp:4;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

/* Author */
.rs-rcard-author {
  display:flex;
  align-items:center;
  gap:0.75rem;
  padding-top:0.85rem;
  border-top:1px solid #f8fafc;
}
.rs-rcard-avatar {
  width:38px; height:38px;
  border-radius:50%;
  overflow:hidden;
  background:#16a34a;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
  border:2px solid #d1fae5;
}
.rs-rcard-avatar img { width:100%; height:100%; object-fit:cover; }
.rs-rcard-avatar span {
  font-size:0.85rem;
  font-weight:800;
  color:#fff;
}
.rs-rcard-meta {
  display:flex;
  flex-direction:column;
  gap:0.1rem;
  min-width:0;
}
.rs-rcard-meta strong {
  font-size:0.82rem;
  font-weight:700;
  color:#0f172a;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.rs-rcard-meta span {
  font-size:0.72rem;
  color:#64748b;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.rs-rcard-meta em {
  font-size:0.68rem;
  font-style:normal;
  color:#94a3b8;
}

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
.rs-rcard--skel {
  pointer-events:none;
  animation:none;
}
.rs-skel {
  border-radius:0.5rem;
  background:linear-gradient(
    90deg,
    #f3f4f6 25%,
    #e5e7eb 50%,
    #f3f4f6 75%
  );
  background-size:400% 100%;
  animation:rsShimmerAnim 1.6s ease infinite;
}
@keyframes rsShimmerAnim {
  0%   { background-position:200% 0; }
  100% { background-position:-200% 0; }
}
.rs-skel--stars  { height:14px; width:80px; }
.rs-skel--line   { height:13px; margin-bottom:6px; }
.rs-skel--w100   { width:100%; }
.rs-skel--w80    { width:80%; }
.rs-skel--w60    { width:60%; }
.rs-skel--w50    { width:50%; }
.rs-skel--w30    { width:30%; }
.rs-skel--avatar {
  width:38px; height:38px;
  border-radius:50%;
  flex-shrink:0;
}

/* ─────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────── */
@media (max-width:1024px) {
  .rs-layout {
    grid-template-columns:1fr;
    gap:3rem;
  }
  .rs-left-sub { max-width:100%; }
  .rs-wall-grid { grid-template-columns:repeat(2,1fr); }
}

@media (max-width:768px) {
  .rs-form { padding:1.5rem; }
  .rs-grid-2 { grid-template-columns:1fr; }
  .rs-left-title { font-size:clamp(1.6rem,5vw,2.25rem); }
}

@media (max-width:540px) {
  .rs-wall-grid { grid-template-columns:1fr; }
  .rs-form-card { border-radius:1.5rem; }
  .rs-rcard { border-radius:1.25rem; padding:1.25rem; }
}

@media (max-width:480px) {
  .rs-section { padding:3rem 0; }
  .rs-form { padding:1.25rem; gap:1.1rem; }
  .rs-submit { height:50px; font-size:0.9rem; }
  .rs-star-btn { font-size:1.4rem; }
}

    `}</style>
  );
}