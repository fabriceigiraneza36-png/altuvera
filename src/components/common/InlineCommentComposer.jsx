import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { useDestinationComments } from "../../hooks/useDestinationComments";
import { useUserAuth } from "../../context/UserAuthContext";
import "../../pages/CommentsCarousel.css";

const getCommentAuthorId = (comment) =>
  comment?.userId ?? comment?.user_id ?? comment?.user?.id ?? comment?.user?._id ?? comment?.authorId ?? comment?.author_id;

export default function InlineCommentComposer({ resourceId, resourceType = "destination", resourceName = "this place" }) {
  const normalizedId = /^\d+$/.test(String(resourceId ?? "")) ? String(resourceId) : null;
  const normalizedType = resourceType === "country" ? "country" : "destination";
  const { comments, loading, error, createComment, refetch } = useDestinationComments(normalizedId, normalizedType);
  const { isAuthenticated = false, openModal: openAuthModal, user } = useUserAuth() || {};

  const currentUserId = user?.id ?? user?._id ?? user?.userId ?? user?.uid;
  const userIdentity = currentUserId ?? user?.email ?? null;
  const storageKey = normalizedId && userIdentity != null
    ? "altuvera:comment-submitted:v1:" + normalizedType + ":" + normalizedId + ":" + String(userIdentity).toLowerCase()
    : null;

  const [locallySubmitted, setLocallySubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!storageKey) {
      setLocallySubmitted(false);
      return;
    }
    try {
      setLocallySubmitted(window.localStorage.getItem(storageKey) === "1");
    } catch {
      setLocallySubmitted(false);
    }
  }, [storageKey]);

  const alreadyCommented = useMemo(() => {
    if (currentUserId == null) return false;
    return comments.some((comment) => {
      const authorId = getCommentAuthorId(comment);
      return authorId != null && String(authorId) === String(currentUserId) && (comment?.parentId ?? comment?.parent_id ?? null) == null;
    });
  }, [comments, currentUserId]);

  useEffect(() => {
    if (!storageKey || !alreadyCommented) return;
    try { window.localStorage.setItem(storageKey, "1"); } catch { /* Server-side check still protects the submission. */ }
    setLocallySubmitted(true);
  }, [alreadyCommented, storageKey]);

  const submitted = locallySubmitted || alreadyCommented;

  const closeModal = useCallback(() => {
    if (submitting) return;
    setModalOpen(false);
    setSubmitError("");
  }, [submitting]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, submitting, closeModal]);

  const openComposer = () => {
    if (submitted || submitting) return;
    if (!isAuthenticated) {
      if (typeof openAuthModal === "function") openAuthModal("login");
      else setSubmitError("Please sign in before sharing a comment.");
      return;
    }
    setText("");
    setSubmitError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clean = text.trim();
    if (!isAuthenticated) {
      setSubmitError("Your session has expired. Please sign in again.");
      if (typeof openAuthModal === "function") openAuthModal("login");
      return;
    }
    if (!clean) {
      setSubmitError("Write a comment before sending.");
      return;
    }
    if (submitted) {
      setModalOpen(false);
      return;
    }
    if (!normalizedId) {
      setSubmitError("This page could not be identified. Refresh and try again.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await createComment(normalizedId, clean);
      try { if (storageKey) window.localStorage.setItem(storageKey, "1"); } catch { /* The saved server comment remains the source of truth. */ }
      setLocallySubmitted(true);
      setText("");
      setModalOpen(false);
      await refetch();
    } catch (submitFailure) {
      const message = submitFailure?.message || "Your comment could not be sent. Check your connection and try again.";
      if (/already.*comment|comment.*already|COMMENT_ALREADY_EXISTS/i.test(message)) {
        try { if (storageKey) window.localStorage.setItem(storageKey, "1"); } catch { /* Ignore unavailable browser storage. */ }
        setLocallySubmitted(true);
        setModalOpen(false);
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!normalizedId) return null;

  return (
    <div className="dc-inline-comment" aria-label={"Comment about " + resourceName}>
      {submitted ? (
        <div className="dc-inline-comment__submitted" role="status" aria-live="polite">
          <CheckCircle2 size={19} aria-hidden="true" />
          <div>
            <strong>Thank you for sharing</strong>
            <span>Your comment has been submitted for {resourceName}.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="dc-inline-comment__intro">
            <span className="dc-inline-comment__icon"><MessageCircle size={20} aria-hidden="true" /></span>
            <div>
              <strong>Share your experience</strong>
              <p>Help other travellers discover {resourceName} with a useful tip or personal insight.</p>
            </div>
          </div>
          <button type="button" className="dc-inline-comment__trigger" onClick={openComposer} disabled={loading}>
            <MessageCircle size={17} aria-hidden="true" />
            <span>{loading ? "Checking comment status…" : "Write a comment"}</span>
          </button>
        </>
      )}

      {modalOpen && createPortal(
        <div
          className="dc-comment-modal-backdrop dc-inline-comment-backdrop"
          onMouseDown={(event) => { if (!submitting && event.target === event.currentTarget) closeModal(); }}
        >
          <section className="dc-comment-modal dc-inline-comment-modal" role="dialog" aria-modal="true" aria-label={"Write a comment about " + resourceName} aria-busy={submitting}>
            <div className="dc-inline-comment-modal__header">
              <span className="dc-inline-comment-modal__mark"><MessageCircle size={20} aria-hidden="true" /></span>
              <div className="dc-inline-comment-modal__heading">
                <p>YOUR VOICE MATTERS</p>
                <h2>Share your experience</h2>
                <span>Comment on {resourceName}</span>
              </div>
              <button type="button" className="dc-comment-modal__close" onClick={closeModal} disabled={submitting} aria-label="Close comment modal">
                <X size={19} />
              </button>
            </div>
            <form className="dc-inline-comment-modal__form" onSubmit={handleSubmit}>
              <label className="dc-inline-comment-modal__label" htmlFor="dc-inline-comment-text">Your comment</label>
              <textarea
                id="dc-inline-comment-text"
                className="dc-comment-modal__textarea dc-inline-comment-modal__textarea"
                value={text}
                disabled={submitting}
                onChange={(event) => { setText(event.target.value.slice(0, 2000)); setSubmitError(""); }}
                placeholder={"What would you like other travellers to know about " + resourceName + "?"}
                maxLength={2000}
                rows={5}
                autoFocus
                required
              />
              <div className="dc-inline-comment-modal__meta">
                <span>Keep it helpful, respectful, and relevant.</span>
                <span>{text.length}/2000</span>
              </div>
              {submitError && (
                <div className="dc-comment-modal__error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}
              {error && !submitError && !modalOpen && <p className="dc-comment-modal__error" role="alert">{error}</p>}
              <div className="dc-inline-comment-modal__actions">
                <button type="button" className="dc-inline-comment-modal__cancel" onClick={closeModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="dc-inline-comment-modal__submit" disabled={submitting || !text.trim()}>
                  {submitting ? <LoaderCircle size={17} className="dc-inline-comment-modal__spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
                  {submitting ? "Sending…" : "Send comment"}
                </button>
              </div>
              {submitting && <span className="dc-inline-comment-modal__saving" role="status">Sending your comment securely to Altuvera…</span>}
            </form>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
}
