import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmojiPickerNative from "emoji-picker-react";
import { MessageCircle, Send, Smile, X, AlertCircle, SlidersHorizontal } from "lucide-react";
import { useDestinationComments } from "../hooks/useDestinationComments";
import { useUserAuth } from "../context/UserAuthContext";
import "./CommentsCarousel.css";

const getCommentUser = (comment) => comment?.user?.name || comment?.authorName || "Traveler";

function CommentCard({ comment }) {
  const userName = getCommentUser(comment);
  const avatar = comment?.user?.avatar;
  return (
    <article className="dc-comment-card" tabIndex={0} aria-label={`Comment by ${userName}`}>
      <p className="dc-comment-card__content">{comment?.content}</p>
      <div className="dc-comment-card__author">
        {avatar
          ? <img className="dc-comment-card__avatar" src={avatar} alt="" loading="lazy" />
          : <span className="dc-comment-card__avatar dc-comment-card__avatar--initial">{userName.slice(0, 1).toUpperCase()}</span>}
        <span className="dc-comment-card__name">{userName}</span>
      </div>
    </article>
  );
}

export default function CommentsCarousel({ destination, entityType = "destination" }) {
  const destinationId = destination?.numericId || destination?.id || destination?._id || destination?.slug;
  const { comments, loading, error, createComment, refetch } = useDestinationComments(destinationId, entityType);
  const { isAuthenticated = false, openModal } = useUserAuth() || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiFiltersOpen, setEmojiFiltersOpen] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiToggleRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const visibleComments = useMemo(() => comments.filter((comment) => comment && comment.content), [comments]);
  const loopComments = useMemo(() => visibleComments.length > 0 ? [...visibleComments, ...visibleComments] : [], [visibleComments]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEmojiOpen(false);
    setEmojiFiltersOpen(false);
    setSubmitError("");
  }, []);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (emojiOpen) {
        setEmojiOpen(false);
        setEmojiFiltersOpen(false);
      } else {
        closeModal();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, emojiOpen, closeModal]);

  // Clicking elsewhere closes only the picker, not the comment composer.
  useEffect(() => {
    if (!emojiOpen) return undefined;
    const onPointerDown = (event) => {
      const target = event.target;
      if (emojiPickerRef.current?.contains(target) || emojiToggleRef.current?.contains(target)) return;
      setEmojiOpen(false);
      setEmojiFiltersOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [emojiOpen]);

  const openCommentModal = () => {
    if (!isAuthenticated) {
      if (typeof openModal === "function") openModal("login");
      else setSubmitError("Please sign in to comment.");
      return;
    }
    setSubmitError("");
    setSubmitSuccess(false);
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setSubmitError("Your session has expired. Please sign in again.");
      if (typeof openModal === "function") openModal("login");
      return;
    }
    const clean = text.trim();
    if (!clean) {
      setSubmitError("Write a comment before saving.");
      return;
    }
    if (!destinationId) {
      setSubmitError("This destination could not be identified. Refresh the page and try again.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      await createComment(destinationId, clean);
      setText("");
      setEmojiOpen(false);
      setEmojiFiltersOpen(false);
      setSubmitSuccess(true);
      await refetch();
      window.setTimeout(() => setSubmitSuccess(false), 2500);
    } catch (err) {
      setSubmitError(err?.message || "Your comment could not be saved. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!destinationId) return null;

  return (
    <>
      {visibleComments.length > 0 && (
        <section className="dc-comments-marquee" aria-label="Destination comments">
          <div className="dc-comments-marquee__track">
            {loopComments.map((comment, index) => (
              <div className="dc-comments-marquee__item" key={`${comment.id || comment.createdAt || "comment"}-${index}`}>
                <CommentCard comment={comment} />
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        className="dc-comment-fab"
        onClick={openCommentModal}
        aria-label="Write a comment"
        title="Write a comment"
      >
        <MessageCircle size={22} />
      </button>

      {(error || submitError) && !modalOpen && (
        <div className="dc-comment-error-toast" role="alert">
          <AlertCircle size={16} />
          <span>{submitError || error}</span>
          <button type="button" onClick={() => { setSubmitError(""); refetch(); }} aria-label="Dismiss error"><X size={15} /></button>
        </div>
      )}

      {modalOpen && (
        <div className="dc-comment-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="dc-comment-modal" role="dialog" aria-modal="true" aria-label="Write a destination comment">
            <button type="button" className="dc-comment-modal__close" onClick={closeModal} aria-label="Close comment modal"><X size={19} /></button>
            <form onSubmit={handleSubmit}>
              <textarea
                className="dc-comment-modal__textarea"
                value={text}
                onChange={(event) => { setText(event.target.value); setSubmitError(""); }}
                placeholder={`Share your experience at ${destination?.name || "this destination"}…`}
                maxLength={2000}
                rows={5}
                autoFocus
                aria-label="Your comment"
              />
              <div className="dc-comment-modal__tools">
                <button ref={emojiToggleRef} type="button" className="dc-comment-modal__emoji" onClick={() => { setEmojiOpen((open) => !open); setEmojiFiltersOpen(false); }} aria-label="Open emoji picker" aria-expanded={emojiOpen}>
                  <Smile size={20} />
                </button>
                <span className="dc-comment-modal__length">{text.length}/2000</span>
                <button type="submit" className="dc-comment-modal__send" disabled={submitting || !text.trim()}>
                  <Send size={16} />
                </button>
              </div>
              {emojiOpen && (
                <div
                  ref={emojiPickerRef}
                  className={`dc-comment-modal__emoji-picker ${emojiFiltersOpen ? "dc-comment-modal__emoji-picker--filters-open" : ""}`}
                  aria-label="Emoji picker"
                >
                  <div className="dc-comment-modal__emoji-picker-toolbar">
                    <span className="dc-comment-modal__emoji-picker-label">Choose an emoji</span>
                    <button
                      type="button"
                      className="dc-comment-modal__emoji-filter-toggle"
                      onClick={() => setEmojiFiltersOpen((open) => !open)}
                      aria-expanded={emojiFiltersOpen}
                      aria-label={emojiFiltersOpen ? "Hide emoji categories" : "Show emoji categories"}
                    >
                      <SlidersHorizontal size={15} />
                      <span>Categories</span>
                    </button>
                  </div>
                  <EmojiPickerNative
                    onEmojiClick={(emojiData) => {
                      const pickedEmoji = emojiData?.emoji || "";
                      if (pickedEmoji) setText((current) => (current + pickedEmoji).slice(0, 2000));
                    }}
                    height="clamp(210px, 34dvh, 285px)"
                    width="100%"
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                  />
                </div>
              )}
              {(submitError || error) && (
                <div className="dc-comment-modal__error" role="alert"><AlertCircle size={15} /> <span>{submitError || error}</span></div>
              )}
              {submitSuccess && <div className="dc-comment-modal__success" role="status">Comment saved</div>}
              {loading && <span className="dc-comment-modal__sync" role="status">Refreshing comments…</span>}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
