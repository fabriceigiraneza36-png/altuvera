// src/components/destinations/CommentsCarousel.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDestinationComments } from "../../hooks/useDestinationComments";
import { useDestinationLikes } from "../../hooks/useDestinationLikes";
import { useUserAuth } from "../../context/UserAuthContext";
import "./CommentsCarousel.css";

/* ─── SVG Icon (self-contained, no external dep) ─── */
const CPATHS = {
  messageCircle: "M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z",
  heart: "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 000-7.8z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  clock: "M12 2a10 10 0 100 20 10 10 0 000-20zm.5 5H11v6l5.2 3.2.8-1.3-4.5-2.7V7z",
  star: "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  quote: "M3 21c3 0 7-1 7-8V5c0-1.3-.8-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3c0 3-2 4.5-4 5.5zm12 0c3 0 7-1 7-8V5c0-1.3-.8-2-2-2h-4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3c0 3-2 4.5-4 5.5z",
  alertCircle: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4m0 4h.01",
};

const CIcon = ({ name, size = 16, className = "", fill = "none", sw = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={`cc-icon ${className}`} aria-hidden="true">
    <path d={CPATHS[name] || CPATHS.messageCircle} />
  </svg>
);

/* ─── Typewriter ─── */
const Typewriter = ({ text, speed = 22, onDone }) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;

    if (!text) {
      onDone?.();
      return;
    }

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        onDone?.();
      } else {
        timerRef.current = setTimeout(tick, speed);
      }
    };

    timerRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timerRef.current);
  }, [text, speed, onDone]);

  return (
    <span className="cc-typewriter">
      {displayed}
      {displayed.length < (text?.length || 0) && (
        <span className="cc-typewriter__cursor" />
      )}
    </span>
  );
};

/* ─── Single Comment Card ─── */
const CommentCard = ({ comment, isActive, onDoneTyping }) => {
  const date = useMemo(() => {
    if (!comment?.createdAt) return "";
    return new Date(comment.createdAt).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  }, [comment?.createdAt]);

  const userName = comment?.user?.name || comment?.authorName || "Anonymous";
  const initial = userName[0]?.toUpperCase() || "A";
  const avatar = comment?.user?.avatar;

  return (
    <div className={`cc-card ${isActive ? "cc-card--active" : ""}`}>
      <div className="cc-card__quote-icon">
        <CIcon name="quote" size={20} fill="currentColor" sw={0} />
      </div>

      <div className="cc-card__content">
        {isActive ? (
          <Typewriter
            text={comment?.content || ""}
            speed={18}
            onDone={onDoneTyping}
          />
        ) : (
          <span className="cc-card__text">{comment?.content}</span>
        )}
      </div>

      <div className="cc-card__author">
        <div className="cc-card__avatar">
          {avatar
            ? <img src={avatar} alt={userName} className="cc-card__avatar-img" />
            : <span className="cc-card__avatar-initial">{initial}</span>
          }
        </div>
        <div className="cc-card__author-info">
          <span className="cc-card__author-name">{userName}</span>
          <span className="cc-card__author-date">
            <CIcon name="clock" size={10} /> {date}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Carousel ─── */
const SLIDE_INTERVAL = 8000;
const VISIBLE_COUNT = 1;

const CommentsCarousel = ({ destination }) => {
  const destId = destination?.numericId || destination?.id || destination?._id || destination?.slug;
  const { comments, loading, createComment, error } = useDestinationComments(destId);
  const { likes, loading: likesLoading, toggleLike } = useDestinationLikes(destId);
  const { isAuthenticated = false, openModal } = useUserAuth() || {};

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const intervalRef = useRef(null);
  const trackRef = useRef(null);

  // Auto-advance after typewriter finishes
  const advance = useCallback(() => {
    if (comments.length <= 1) return;
    setActiveIdx(prev => (prev + 1) % comments.length);
    setTypingDone(false);
  }, [comments.length]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (comments.length <= 1) return;

    if (typingDone) {
      intervalRef.current = setTimeout(advance, SLIDE_INTERVAL - 2000);
    }

    return () => clearTimeout(intervalRef.current);
  }, [typingDone, advance, comments.length]);

  // Reset when comments change
  useEffect(() => {
    setActiveIdx(0);
    setTypingDone(false);
  }, [comments.length]);

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
    setTypingDone(false);
    clearTimeout(intervalRef.current);
  }, []);

  const goPrev = useCallback(() => {
    goTo((activeIdx - 1 + comments.length) % comments.length);
  }, [activeIdx, comments.length, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIdx + 1) % comments.length);
  }, [activeIdx, comments.length, goTo]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError("");
    if (!text.trim()) return;
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      else setLocalError("Please sign in to post a comment.");
      return;
    }
    setSubmitting(true);
    try {
      await createComment(destId, text.trim());
      setText("");
      setActiveIdx(0);
      setTypingDone(false);
    } catch (err) {
      setLocalError(err?.message || "Could not post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      return;
    }
    setLikeBusy(true);
    try { await toggleLike(destId); } catch {}
    finally { setLikeBusy(false); }
  };

  if (!destId) return null;

  return (
    <section className="cc-section">
      <div className="cc-container">
        {/* Header */}
        <div className="cc-header">
          <div className="cc-header__title-row">
            <CIcon name="messageCircle" size={22} className="cc-header__icon" />
            <h2 className="cc-header__title">Community Discussion</h2>
          </div>
          <p className="cc-header__desc">
            Share your experience and read what others say about {destination?.name}
          </p>
          <div className="cc-header__bar" />
        </div>

        {/* Main card */}
        <div className="cc-main">
          {/* Stats bar */}
          <div className="cc-stats-bar">
            <button type="button" onClick={handleLike}
              disabled={likeBusy || likesLoading}
              className={`cc-like-btn ${likes.isLiked ? "cc-like-btn--liked" : ""}`}
              title={likes.isLiked ? "Remove like" : "Like this destination"}>
              <CIcon name="heart" size={14}
                fill={likes.isLiked ? "currentColor" : "none"}
                sw={likes.isLiked ? 0 : 1.7} />
              <span>{likes.total}</span>
            </button>
            <span className="cc-stats-badge">
              <CIcon name="messageCircle" size={12} />
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Error */}
          {(localError || error) && (
            <div className="cc-error">
              <CIcon name="alertCircle" size={14} />
              {localError || error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="cc-form">
            <div className="cc-form__input-wrap">
              <CIcon name="messageCircle" size={16} className="cc-form__input-icon" />
              <input
                type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder={isAuthenticated
                  ? `Share your experience at ${destination?.name}...`
                  : "Sign in to comment..."
                }
                maxLength={2000}
                className="cc-form__input"
              />
            </div>
            <button type="submit" disabled={submitting || !text.trim()}
              className="cc-form__submit">
              <CIcon name="send" size={14} />
              <span className="cc-form__submit-text">
                {submitting ? "Posting..." : "Post"}
              </span>
            </button>
          </form>

          {/* Carousel */}
          {comments.length > 0 ? (
            <div className="cc-carousel">
              <div className="cc-carousel__viewport" ref={trackRef}>
                <div className="cc-carousel__track"
                  style={{ transform: `translateX(-${activeIdx * 100}%)` }}>
                  {comments.map((c, i) => (
                    <div key={c.id || i} className="cc-carousel__slide">
                      <CommentCard
                        comment={c}
                        isActive={i === activeIdx}
                        onDoneTyping={() => setTypingDone(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              {comments.length > 1 && (
                <div className="cc-carousel__nav">
                  <button onClick={goPrev} className="cc-nav-btn" aria-label="Previous comment">
                    <CIcon name="chevronLeft" size={16} />
                  </button>

                  <div className="cc-carousel__dots">
                    {comments.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)} aria-label={`Comment ${i + 1}`}
                        className={`cc-dot ${i === activeIdx ? "cc-dot--active" : ""}`} />
                    ))}
                  </div>

                  <button onClick={goNext} className="cc-nav-btn" aria-label="Next comment">
                    <CIcon name="chevronRight" size={16} />
                  </button>

                  <span className="cc-carousel__counter">
                    {activeIdx + 1} / {comments.length}
                  </span>
                </div>
              )}
            </div>
          ) : !loading ? (
            <div className="cc-empty">
              <CIcon name="messageCircle" size={36} className="cc-empty__icon" />
              <p className="cc-empty__title">No comments yet</p>
              <p className="cc-empty__desc">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="cc-loading">
              <div className="cc-loading__spinner" />
              <span>Loading comments...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommentsCarousel;