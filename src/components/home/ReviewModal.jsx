// src/components/home/ReviewModal.jsx
// ═══════════════════════════════════════════════════════════════════════════
// Multi-Step Review Modal v3.0
// ─ All error values coerced to string before render (no [object Object])
// ─ Fully controlled form with word-count enforcement
// ─ Accessible: roles, aria-labels, focus management, reduced-motion
// ═══════════════════════════════════════════════════════════════════════════

import React, {
  useState, useCallback, useEffect, useRef,
} from "react";
import { createPortal } from "react-dom";
import { FaStar }       from "react-icons/fa6";
import {
  HiX, HiCheckCircle, HiSparkles,
  HiArrowRight, HiArrowLeft,
} from "react-icons/hi";
import {
  HiOutlineMapPin, HiOutlineGlobeAlt,
  HiOutlinePaperAirplane, HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { MdVerified } from "react-icons/md";

import { useUserAuth }          from "../../context/UserAuthContext";
import { useSubmitTestimonial } from "../../hooks/useSubmitTestimonial";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const MAX_WORDS   = 60;
const TOTAL_STEPS = 3;
const STAR_LABELS = ["Terrible", "Poor", "Good", "Great", "Excellent"];

const EMPTY_FORM = Object.freeze({
  testimonial_text: "",
  rating:           5,
  trip:             "",
  location:         "",
});

// ═══════════════════════════════════════════════════════════════════════════
// PURE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const countWords = (s = "") =>
  String(s).trim().split(/\s+/).filter(Boolean).length;

const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

/**
 * CRITICAL — always returns a plain string.
 * Prevents "[object Object]" when any non-string reaches JSX.
 */
const safeStr = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string")           return val;
  if (val instanceof Error)              return val.message || "An error occurred.";
  if (typeof val === "object") {
    if (typeof val.error   === "string" && val.error)   return val.error;
    if (typeof val.message === "string" && val.message) return val.message;
    try { return JSON.stringify(val); } catch { return "An error occurred."; }
  }
  return String(val);
};

/** Derive display name from user object (any shape) */
const getUserName = (user) =>
  (
    user?.fullName  ||
    user?.full_name ||
    user?.name      ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Traveler"
  );

/** Derive avatar URL from user object (any shape) */
const getUserAvatar = (user) =>
  user?.avatar     ||
  user?.avatarUrl  ||
  user?.avatar_url ||
  null;

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ── Star input ─────────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, disabled = false }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div
      className="rmod-stars"
      onMouseLeave={() => setHovered(0)}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={`rmod-star-btn${n <= display ? " rmod-star-btn--on" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          aria-label={`${n} star — ${STAR_LABELS[n - 1]}`}
          aria-pressed={n === value}
        >
          <FaStar aria-hidden="true" />
        </button>
      ))}
      {display > 0 && (
        <span className="rmod-star-label" aria-live="polite">
          {STAR_LABELS[display - 1]}
        </span>
      )}
    </div>
  );
};

// ── Error alert ────────────────────────────────────────────────────────────
const ErrorAlert = ({ error, onDismiss }) => {
  const msg = safeStr(error);
  if (!msg) return null;
  return (
    <div
      className="rmod-alert rmod-alert--err"
      role="alert"
      aria-live="assertive"
    >
      <span aria-hidden="true">⚠️</span>
      <span className="rmod-alert-text">{msg}</span>
      {onDismiss && (
        <button
          type="button"
          className="rmod-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ── Step 1: Rating + Review text ───────────────────────────────────────────
const Step1 = ({ form, set, errors, wordCount, overLimit, pct, barColor }) => (
  <div className="rmod-step">
    <div className="rmod-step-head">
      <div className="rmod-step-num" aria-hidden="true">1</div>
      <div>
        <h3 className="rmod-step-title">Rate Your Experience</h3>
        <p className="rmod-step-sub">How was your adventure with us?</p>
      </div>
    </div>

    {/* Rating */}
    <div className="rmod-field">
      <label className="rmod-label">Overall Rating</label>
      <StarInput
        value={form.rating}
        onChange={(v) => set("rating", v)}
      />
      {errors.rating && (
        <p className="rmod-err" role="alert">{safeStr(errors.rating)}</p>
      )}
    </div>

    {/* Review text */}
    <div className="rmod-field">
      <div className="rmod-label-row">
        <label className="rmod-label" htmlFor="rmod-text">
          Your Review
        </label>
        <span
          className={[
            "rmod-wcount",
            overLimit      ? "rmod-wcount--over" :
            wordCount > 50 ? "rmod-wcount--warn" : "",
          ].filter(Boolean).join(" ")}
          aria-live="polite"
          aria-label={`${wordCount} of ${MAX_WORDS} words used`}
        >
          {wordCount}/{MAX_WORDS}
        </span>
      </div>

      <div className={`rmod-ta-wrap${overLimit ? " rmod-ta-wrap--err" : ""}`}>
        <textarea
          id="rmod-text"
          className="rmod-textarea"
          placeholder={
            "Tell fellow travelers what made your trip special — the moments " +
            "that took your breath away, the guides who went above and beyond…"
          }
          value={form.testimonial_text}
          onChange={(e) => set("testimonial_text", e.target.value)}
          rows={5}
          maxLength={600}
          required
          aria-required="true"
          aria-invalid={overLimit || !!errors.testimonial_text}
          aria-describedby={
            overLimit || errors.testimonial_text ? "rmod-text-err" : undefined
          }
        />
        <div className="rmod-progress" aria-hidden="true">
          <div
            className="rmod-progress-fill"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>

      {(errors.testimonial_text || overLimit) && (
        <p id="rmod-text-err" className="rmod-err" role="alert">
          {errors.testimonial_text
            ? safeStr(errors.testimonial_text)
            : `Please trim to ${MAX_WORDS} words or fewer.`}
        </p>
      )}
    </div>
  </div>
);

// ── Step 2: Trip details ───────────────────────────────────────────────────
const Step2 = ({ form, set }) => (
  <div className="rmod-step">
    <div className="rmod-step-head">
      <div className="rmod-step-num" aria-hidden="true">2</div>
      <div>
        <h3 className="rmod-step-title">Trip Details</h3>
        <p className="rmod-step-sub">Optional — helps other travelers</p>
      </div>
    </div>

    {/* Trip / package */}
    <div className="rmod-field">
      <label className="rmod-label" htmlFor="rmod-trip">
        Trip / Package{" "}
        <span className="rmod-opt">— optional</span>
      </label>
      <div className="rmod-input-wrap">
        <HiOutlineGlobeAlt className="rmod-input-icon" aria-hidden="true" />
        <input
          id="rmod-trip"
          type="text"
          className="rmod-input"
          placeholder="e.g. Gorilla Trek, Safari, Kilimanjaro…"
          value={form.trip}
          onChange={(e) => set("trip", e.target.value)}
          maxLength={100}
          autoComplete="off"
        />
      </div>
    </div>

    {/* Location */}
    <div className="rmod-field">
      <label className="rmod-label" htmlFor="rmod-loc">
        Where you&apos;re from{" "}
        <span className="rmod-opt">— optional</span>
      </label>
      <div className="rmod-input-wrap">
        <HiOutlineMapPin className="rmod-input-icon" aria-hidden="true" />
        <input
          id="rmod-loc"
          type="text"
          className="rmod-input"
          placeholder="e.g. London, UK"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          maxLength={100}
          autoComplete="off"
        />
      </div>
    </div>

    <div className="rmod-tip">
      <HiOutlineChatBubbleLeftEllipsis
        className="rmod-tip-icon"
        aria-hidden="true"
      />
      <p>
        Adding trip details helps fellow travelers find relevant reviews
        for their planned adventure.
      </p>
    </div>
  </div>
);

// ── Step 3: Preview + submit ───────────────────────────────────────────────
const Step3 = ({ form, user, submitting, error, onDismissError }) => {
  const stars    = Math.max(1, Math.min(5, Number(form.rating) || 5));
  const userName = getUserName(user);
  const avatar   = getUserAvatar(user);

  const tripLine = [form.trip, form.location]
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join(" · ") || "Altuvera Traveler";

  return (
    <div className="rmod-step">
      <div className="rmod-step-head">
        <div className="rmod-step-num" aria-hidden="true">3</div>
        <div>
          <h3 className="rmod-step-title">Preview &amp; Submit</h3>
          <p className="rmod-step-sub">Review how your feedback will appear</p>
        </div>
      </div>

      {/* Preview card */}
      <div
        className="rmod-preview"
        aria-label="Review preview"
      >
        {/* Stars */}
        <div
          className="rmod-preview-stars"
          aria-label={`${stars} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar
              key={i}
              className={i < stars ? "rmod-pstar--on" : "rmod-pstar--off"}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Text */}
        <p className="rmod-preview-text">
          &ldquo;{String(form.testimonial_text || "Your review will appear here…")}&rdquo;
        </p>

        {/* Author */}
        <div className="rmod-preview-author">
          <div className="rmod-preview-avatar" aria-hidden="true">
            {avatar ? (
              <img src={avatar} alt="" />
            ) : (
              <span>{getInitials(userName) || "T"}</span>
            )}
          </div>
          <div className="rmod-preview-meta">
            <strong>{userName}</strong>
            <span>{tripLine}</span>
          </div>
          <MdVerified
            className="rmod-preview-verified"
            aria-label="Verified reviewer"
          />
        </div>
      </div>

      {/* Error — uses safeStr via ErrorAlert */}
      {error && (
        <ErrorAlert error={error} onDismiss={onDismissError} />
      )}

      {submitting && (
        <div className="rmod-submitting" aria-live="polite" aria-busy="true">
          <span className="rmod-spinner" aria-hidden="true" />
          <span>Submitting your review…</span>
        </div>
      )}

      <p className="rmod-note">
        Your review will be published after a quick moderation check —
        usually within 24 hours.
      </p>
    </div>
  );
};

// ── Success screen ─────────────────────────────────────────────────────────
const SuccessScreen = ({ onClose, onAnother, userName }) => (
  <div className="rmod-success" role="status" aria-live="polite">
    <div className="rmod-success-ring" aria-hidden="true">
      <HiCheckCircle className="rmod-success-icon" />
    </div>
    <h3 className="rmod-success-title">
      Thank you, {String(userName || "Traveler")}!
    </h3>
    <p className="rmod-success-body">
      Your review has been submitted and will appear once approved —
      usually within 24 hours.
    </p>
    <div className="rmod-success-actions">
      <button
        type="button"
        className="rmod-btn rmod-btn--outline"
        onClick={onAnother}
      >
        Write Another
      </button>
      <button
        type="button"
        className="rmod-btn rmod-btn--primary"
        onClick={onClose}
      >
        Done
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MODAL
// ═══════════════════════════════════════════════════════════════════════════

export default function ReviewModal({ isOpen, onClose }) {
  const { user }  = useUserAuth();
  const modalRef  = useRef(null);

  const [step, setStep]             = useState(1);
  const [form, setFormState]        = useState({ ...EMPTY_FORM });
  const [localErrors, setLocalErrors] = useState({});

  const { submit, submitting, submitted, error, reset } =
    useSubmitTestimonial();

  // ── Derived ───────────────────────────────────────────────────────────────
  const wc        = countWords(form.testimonial_text);
  const overLimit = wc > MAX_WORDS;
  const pct       = Math.min(100, (wc / MAX_WORDS) * 100);
  const barColor  = overLimit ? "#ef4444" : wc > 50 ? "#f59e0b" : "#22c55e";

  const firstName = getUserName(user).split(" ")[0];

  // ── Field setter — clears field error on change ───────────────────────────
  const set = useCallback((field, val) => {
    setFormState((prev) => ({ ...prev, [field]: val }));
    setLocalErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Escape key to close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape" && !submitting) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, submitting]);

  // ── Auto-focus first focusable element on step change ────────────────────
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const timer = setTimeout(() => {
      const first = modalRef.current?.querySelector(
        "button:not(:disabled), [href], input:not(:disabled), " +
        "select:not(:disabled), textarea:not(:disabled), " +
        '[tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen, step]);

  // ── Step 1 validation ─────────────────────────────────────────────────────
  const validateStep1 = useCallback(() => {
    const errs = {};
    const text = String(form.testimonial_text || "").trim();

    if (!text) {
      errs.testimonial_text = "Please write your review before continuing.";
    } else if (overLimit) {
      errs.testimonial_text = `Max ${MAX_WORDS} words (you used ${wc}).`;
    }

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      errs.rating = "Please select a star rating.";
    }

    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, overLimit, wc]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (step === 1 && !validateStep1()) return;
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }, [step, validateStep1]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    await submit({
      testimonial_text: form.testimonial_text,
      rating:           form.rating,
      trip:             form.trip     || undefined,
      location:         form.location || undefined,
    });
  }, [submit, form]);

  // ── Write another — reset everything ─────────────────────────────────────
  const handleAnother = useCallback(() => {
    reset();
    setFormState({ ...EMPTY_FORM });
    setLocalErrors({});
    setStep(1);
  }, [reset]);

  // ── Close — reset and call parent ────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (submitting) return; // prevent close mid-submission
    reset();
    setFormState({ ...EMPTY_FORM });
    setLocalErrors({});
    setStep(1);
    onClose();
  }, [reset, onClose, submitting]);

  if (!isOpen) return null;

  const STEP_LABELS = ["Rate", "Details", "Submit"];

  const canProceedStep1 =
    String(form.testimonial_text || "").trim().length > 0 && !overLimit;

  return createPortal(
    <>
      <ReviewModalStyles />
      <div
        className="rmod-overlay"
        onClick={handleClose}
        role="presentation"
        aria-hidden="true"
      >
        <div
          ref={modalRef}
          className="rmod-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rmod-title"
          aria-describedby="rmod-subtitle"
        >
          {/* Accent bar */}
          <div className="rmod-accent" aria-hidden="true" />

          {/* Close button */}
          <button
            type="button"
            className="rmod-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close review modal"
          >
            <HiX aria-hidden="true" />
          </button>

          {/* Header */}
          <div className="rmod-header">
            <div className="rmod-header-icon" aria-hidden="true">
              <HiSparkles />
            </div>
            <div>
              <h2
                id="rmod-title"
                className="rmod-title"
              >
                Share Your Experience
              </h2>
              <p
                id="rmod-subtitle"
                className="rmod-subtitle"
              >
                Help fellow travelers plan their adventure
              </p>
            </div>
          </div>

          {/* Stepper */}
          {!submitted && (
            <div
              className="rmod-stepper"
              role="list"
              aria-label="Form steps"
            >
              {STEP_LABELS.map((label, i) => {
                const n      = i + 1;
                const done   = step > n;
                const active = step === n;

                return (
                  <React.Fragment key={n}>
                    <div
                      className="rmod-stepper-item"
                      role="listitem"
                    >
                      <div
                        className={[
                          "rmod-stepper-circle",
                          done   ? "rmod-stepper-circle--done"   :
                          active ? "rmod-stepper-circle--active" :
                                   "rmod-stepper-circle--pending",
                        ].join(" ")}
                        aria-current={active ? "step" : undefined}
                      >
                        {done
                          ? <HiCheckCircle aria-hidden="true" />
                          : <span aria-hidden="true">{n}</span>
                        }
                      </div>
                      <span
                        className={[
                          "rmod-stepper-lbl",
                          active ? "rmod-stepper-lbl--active" :
                          done   ? "rmod-stepper-lbl--done"   : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {label}
                      </span>
                    </div>

                    {i < STEP_LABELS.length - 1 && (
                      <div
                        className="rmod-stepper-line"
                        aria-hidden="true"
                      >
                        <div
                          className={[
                            "rmod-stepper-line-fill",
                            done ? "rmod-stepper-line-fill--done" : "",
                          ].filter(Boolean).join(" ")}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Body */}
          <div className="rmod-body">
            {submitted ? (
              <SuccessScreen
                onClose={handleClose}
                onAnother={handleAnother}
                userName={firstName}
              />
            ) : (
              <>
                {step === 1 && (
                  <Step1
                    form={form}
                    set={set}
                    errors={localErrors}
                    wordCount={wc}
                    overLimit={overLimit}
                    pct={pct}
                    barColor={barColor}
                  />
                )}
                {step === 2 && (
                  <Step2 form={form} set={set} />
                )}
                {step === 3 && (
                  <Step3
                    form={form}
                    user={user}
                    submitting={submitting}
                    error={error}
                    onDismissError={() => {/* error auto-clears on next submit */}}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div className="rmod-footer">
              {/* Back button */}
              {step > 1 ? (
                <button
                  type="button"
                  className="rmod-btn rmod-btn--ghost"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  <HiArrowLeft aria-hidden="true" />
                  Back
                </button>
              ) : (
                <div aria-hidden="true" /> /* spacer */
              )}

              {/* Next / Submit */}
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  className="rmod-btn rmod-btn--primary"
                  onClick={handleNext}
                  disabled={step === 1 && !canProceedStep1}
                >
                  Continue
                  <HiArrowRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="rmod-btn rmod-btn--submit"
                  onClick={handleSubmit}
                  disabled={submitting || !canProceedStep1}
                  aria-busy={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="rmod-spinner" aria-hidden="true" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <HiOutlinePaperAirplane aria-hidden="true" />
                      Submit Review
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

function ReviewModalStyles() {
  return (
    <style>{`
/* ── Overlay ── */
.rmod-overlay{
  position:fixed;inset:0;z-index:10000;
  display:flex;align-items:center;justify-content:center;
  padding:clamp(1rem,3vw,2rem);
  background:rgba(0,20,10,0.55);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  animation:rmodFadeIn .25s ease both;
}
@keyframes rmodFadeIn{from{opacity:0}to{opacity:1}}

/* ── Modal ── */
.rmod-modal{
  position:relative;width:100%;max-width:520px;max-height:90vh;
  background:#fff;border-radius:1.75rem;
  box-shadow:0 32px 80px rgba(0,0,0,.20),0 8px 20px rgba(0,0,0,.10);
  display:flex;flex-direction:column;overflow:hidden;
  animation:rmodIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes rmodIn{
  from{opacity:0;transform:scale(.9) translateY(30px)}
  to{opacity:1;transform:scale(1) translateY(0)}
}

/* ── Accent bar ── */
.rmod-accent{
  height:4px;flex-shrink:0;
  background:linear-gradient(90deg,#14532d,#22c55e,#4ade80,#22c55e,#14532d);
}

/* ── Close ── */
.rmod-close{
  position:absolute;top:1rem;right:1rem;z-index:10;
  width:36px;height:36px;border-radius:50%;
  border:none;background:#f1f5f9;color:#64748b;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .2s ease;
}
.rmod-close:hover:not(:disabled){
  background:#e2e8f0;color:#0f172a;transform:rotate(90deg);
}
.rmod-close:disabled{opacity:.4;cursor:not-allowed;}
.rmod-close svg{width:18px;height:18px;}

/* ── Header ── */
.rmod-header{
  display:flex;align-items:center;gap:1rem;
  padding:1.75rem 2rem 1rem;flex-shrink:0;
}
.rmod-header-icon{
  width:48px;height:48px;border-radius:1rem;flex-shrink:0;
  background:linear-gradient(135deg,#dcfce7,#bbf7d0);
  display:flex;align-items:center;justify-content:center;
}
.rmod-header-icon svg{width:24px;height:24px;color:#16a34a;}
.rmod-title{
  font-size:1.25rem;font-weight:800;color:#0f172a;
  margin:0 0 .15rem;letter-spacing:-.02em;
}
.rmod-subtitle{font-size:.82rem;color:#64748b;margin:0;}

/* ── Stepper ── */
.rmod-stepper{
  display:flex;align-items:center;
  padding:1rem 2rem .5rem;flex-shrink:0;
}
.rmod-stepper-item{
  display:flex;flex-direction:column;
  align-items:center;gap:.35rem;flex-shrink:0;
}
.rmod-stepper-circle{
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:.78rem;font-weight:800;
  transition:all .3s ease;
}
.rmod-stepper-circle--done{
  background:#22c55e;color:#fff;
  box-shadow:0 2px 8px rgba(34,197,94,.35);
}
.rmod-stepper-circle--done svg{width:16px;height:16px;}
.rmod-stepper-circle--active{
  background:#fff;color:#16a34a;
  border:2.5px solid #22c55e;
  box-shadow:0 0 0 4px rgba(34,197,94,.12);
}
.rmod-stepper-circle--pending{
  background:#f1f5f9;color:#94a3b8;border:2px solid #e2e8f0;
}
.rmod-stepper-lbl{
  font-size:.65rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.08em;color:#94a3b8;transition:color .2s;
}
.rmod-stepper-lbl--active{color:#16a34a;}
.rmod-stepper-lbl--done{color:#22c55e;}
.rmod-stepper-line{
  flex:1;height:2px;background:#e2e8f0;border-radius:99px;
  margin:0 .5rem;margin-bottom:1.25rem;overflow:hidden;
}
.rmod-stepper-line-fill{
  height:100%;width:0;background:#22c55e;
  border-radius:99px;transition:width .5s ease;
}
.rmod-stepper-line-fill--done{width:100%;}

/* ── Body ── */
.rmod-body{
  flex:1;overflow-y:auto;overflow-x:hidden;
  padding:1.25rem 2rem 1.5rem;
}
.rmod-body::-webkit-scrollbar{width:4px;}
.rmod-body::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px;}

/* ── Steps ── */
.rmod-step{
  display:flex;flex-direction:column;gap:1.25rem;
  animation:rmodStepIn .35s ease both;
}
@keyframes rmodStepIn{
  from{opacity:0;transform:translateX(16px)}
  to{opacity:1;transform:translateX(0)}
}
.rmod-step-head{
  display:flex;align-items:center;gap:1rem;margin-bottom:.25rem;
}
.rmod-step-num{
  width:36px;height:36px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#dcfce7,#bbf7d0);
  color:#15803d;font-size:.88rem;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(34,197,94,.15);
}
.rmod-step-title{
  font-size:1.1rem;font-weight:800;color:#0f172a;
  margin:0;letter-spacing:-.01em;
}
.rmod-step-sub{font-size:.78rem;color:#64748b;margin:.1rem 0 0;}

/* ── Fields ── */
.rmod-field{display:flex;flex-direction:column;gap:.45rem;}
.rmod-label{font-size:.82rem;font-weight:700;color:#374151;}
.rmod-opt{font-weight:400;font-size:.75rem;color:#9ca3af;}
.rmod-label-row{display:flex;align-items:center;justify-content:space-between;}

/* ── Stars ── */
.rmod-stars{display:flex;align-items:center;gap:.2rem;flex-wrap:wrap;}
.rmod-star-btn{
  background:none;border:none;cursor:pointer;padding:.2rem;
  font-size:1.75rem;color:#e5e7eb;line-height:1;
  transition:color .15s ease,transform .2s cubic-bezier(.34,1.56,.64,1);
}
.rmod-star-btn--on{color:#f59e0b;}
.rmod-star-btn:hover:not(:disabled){transform:scale(1.25);}
.rmod-star-btn:disabled{cursor:not-allowed;opacity:.6;}
.rmod-star-label{font-size:.8rem;font-weight:700;color:#22c55e;margin-left:.5rem;}

/* ── Word counter ── */
.rmod-wcount{
  font-size:.72rem;font-weight:700;color:#9ca3af;
  font-variant-numeric:tabular-nums;transition:color .2s;
}
.rmod-wcount--warn{color:#f59e0b;}
.rmod-wcount--over{color:#ef4444;}

/* ── Textarea ── */
.rmod-ta-wrap{
  border-radius:1rem;border:2px solid #e5e7eb;background:#f9fafb;
  overflow:hidden;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.rmod-ta-wrap:focus-within{
  border-color:#22c55e;background:#fff;
  box-shadow:0 0 0 4px rgba(34,197,94,.10);
}
.rmod-ta-wrap--err{border-color:#ef4444!important;background:#fef2f2!important;}
.rmod-textarea{
  width:100%;display:block;padding:1rem 1.1rem;
  border:none;outline:none;background:transparent;
  font-size:.9rem;color:#111827;line-height:1.7;
  font-family:inherit;resize:vertical;min-height:130px;
  box-sizing:border-box;
}
.rmod-textarea::placeholder{color:#9ca3af;}
.rmod-progress{height:3px;background:#f3f4f6;}
.rmod-progress-fill{height:100%;transition:width .3s ease,background .3s ease;}
.rmod-err{font-size:.75rem;color:#ef4444;font-weight:600;margin:0;}

/* ── Text inputs ── */
.rmod-input-wrap{position:relative;}
.rmod-input-icon{
  position:absolute;left:.85rem;top:50%;
  transform:translateY(-50%);
  width:16px;height:16px;color:#9ca3af;pointer-events:none;
}
.rmod-input{
  width:100%;height:48px;padding:0 .9rem 0 2.5rem;
  border-radius:.85rem;border:2px solid #e5e7eb;
  background:#f9fafb;font-size:.88rem;color:#111827;
  font-family:inherit;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
  box-sizing:border-box;
}
.rmod-input::placeholder{color:#9ca3af;}
.rmod-input:focus{
  border-color:#22c55e;background:#fff;
  box-shadow:0 0 0 4px rgba(34,197,94,.10);
}

/* ── Tip box ── */
.rmod-tip{
  display:flex;gap:.75rem;padding:1rem 1.15rem;
  background:#f0fdf4;border:1px solid #d1fae5;border-radius:1rem;
}
.rmod-tip-icon{width:20px;height:20px;color:#16a34a;flex-shrink:0;margin-top:.1rem;}
.rmod-tip p{font-size:.78rem;color:#15803d;line-height:1.6;margin:0;}

/* ── Preview card ── */
.rmod-preview{
  background:#f8fafc;border:1.5px solid #e2e8f0;
  border-radius:1.25rem;padding:1.5rem;
  display:flex;flex-direction:column;gap:1rem;
}
.rmod-preview-stars{display:flex;gap:.2rem;}
.rmod-pstar--on{font-size:1rem;color:#f59e0b;}
.rmod-pstar--off{font-size:1rem;color:#e5e7eb;}
.rmod-preview-text{
  font-size:.92rem;color:#374151;line-height:1.7;
  font-style:italic;margin:0;min-height:3.5rem;
}
.rmod-preview-author{
  display:flex;align-items:center;gap:.75rem;
  padding-top:.85rem;border-top:1px solid #f1f5f9;
}
.rmod-preview-avatar{
  width:40px;height:40px;border-radius:50%;overflow:hidden;
  background:#16a34a;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;border:2px solid #d1fae5;
}
.rmod-preview-avatar img{width:100%;height:100%;object-fit:cover;}
.rmod-preview-avatar span{font-size:.88rem;font-weight:800;color:#fff;}
.rmod-preview-meta{flex:1;min-width:0;}
.rmod-preview-meta strong{display:block;font-size:.85rem;font-weight:700;color:#0f172a;}
.rmod-preview-meta span{display:block;font-size:.72rem;color:#64748b;margin-top:.1rem;}
.rmod-preview-verified{width:18px;height:18px;color:#22c55e;flex-shrink:0;}

/* ── Submitting indicator ── */
.rmod-submitting{
  display:flex;align-items:center;gap:.75rem;
  padding:.85rem 1rem;border-radius:.85rem;
  background:#f0fdf4;border:1px solid #d1fae5;
  font-size:.82rem;font-weight:600;color:#15803d;
}

/* ── Alert ── */
.rmod-alert{
  display:flex;align-items:flex-start;gap:.6rem;
  padding:.85rem 1rem;border-radius:.85rem;
  font-size:.82rem;font-weight:500;line-height:1.5;
}
.rmod-alert--err{
  background:#fef2f2;border:1px solid #fecaca;color:#dc2626;
}
.rmod-alert span:first-child{flex-shrink:0;font-size:1rem;}
.rmod-alert-text{flex:1;}
.rmod-alert-close{
  background:none;border:none;cursor:pointer;
  color:#dc2626;font-size:.9rem;padding:0;margin:0;
  line-height:1;opacity:.7;
}
.rmod-alert-close:hover{opacity:1;}
.rmod-note{
  font-size:.72rem;color:#9ca3af;
  text-align:center;margin:0;line-height:1.5;
}

/* ── Footer ── */
.rmod-footer{
  display:flex;align-items:center;justify-content:space-between;
  padding:1rem 2rem 1.5rem;
  border-top:1px solid #f1f5f9;flex-shrink:0;gap:.75rem;
}

/* ── Buttons ── */
.rmod-btn{
  display:inline-flex;align-items:center;justify-content:center;
  gap:.5rem;height:46px;padding:0 1.35rem;border-radius:.85rem;
  font-size:.88rem;font-weight:700;font-family:inherit;
  cursor:pointer;transition:all .25s ease;border:none;white-space:nowrap;
}
.rmod-btn svg{width:16px;height:16px;}
.rmod-btn--primary{
  background:linear-gradient(135deg,#14532d,#16a34a);color:#fff;
  box-shadow:0 4px 16px rgba(22,163,74,.30);
}
.rmod-btn--primary:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 8px 24px rgba(22,163,74,.40);
}
.rmod-btn--submit{
  background:linear-gradient(135deg,#14532d,#16a34a,#22c55e);
  color:#fff;box-shadow:0 4px 16px rgba(22,163,74,.30);min-width:160px;
}
.rmod-btn--submit:hover:not(:disabled){
  transform:translateY(-1px);
  box-shadow:0 8px 24px rgba(22,163,74,.40);
}
.rmod-btn--ghost{
  background:transparent;color:#64748b;border:1.5px solid #e2e8f0;
}
.rmod-btn--ghost:hover:not(:disabled){background:#f8fafc;border-color:#cbd5e1;}
.rmod-btn--outline{
  background:transparent;color:#16a34a;border:1.5px solid #d1fae5;
}
.rmod-btn--outline:hover:not(:disabled){background:#f0fdf4;border-color:#86efac;}
.rmod-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}

/* ── Spinner ── */
.rmod-spinner{
  display:inline-block;width:16px;height:16px;
  border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
  border-radius:50%;animation:rmodSpin .7s linear infinite;flex-shrink:0;
}
@keyframes rmodSpin{to{transform:rotate(360deg)}}

/* ── Success ── */
.rmod-success{
  text-align:center;display:flex;flex-direction:column;
  align-items:center;gap:1rem;padding:1rem 0 .5rem;
}
.rmod-success-ring{
  width:80px;height:80px;border-radius:50%;
  background:linear-gradient(135deg,#dcfce7,#bbf7d0);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 12px rgba(34,197,94,.08);
  animation:rmodPop .6s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes rmodPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.rmod-success-icon{width:42px;height:42px;color:#16a34a;}
.rmod-success-title{
  font-size:1.4rem;font-weight:800;color:#0f172a;
  margin:0;letter-spacing:-.02em;
}
.rmod-success-body{
  font-size:.9rem;color:#64748b;line-height:1.7;
  margin:0;max-width:28rem;
}
.rmod-success-actions{display:flex;gap:.75rem;margin-top:.5rem;}

/* ── Mobile ── */
@media(max-width:600px){
  .rmod-modal{
    max-width:100%;max-height:100dvh;
    border-radius:1.25rem 1.25rem 0 0;
    margin-top:auto;
  }
  .rmod-overlay{align-items:flex-end;padding:0;}
  .rmod-header{padding:1.5rem 1.5rem .75rem;}
  .rmod-stepper{padding:.75rem 1.5rem .25rem;}
  .rmod-body{padding:1rem 1.5rem 1.25rem;}
  .rmod-footer{padding:.85rem 1.5rem 1.25rem;}
  .rmod-star-btn{font-size:1.5rem;}
  .rmod-success-actions{flex-direction:column;width:100%;}
  .rmod-success-actions .rmod-btn{width:100%;}
}

/* ── Reduced motion ── */
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    transition-duration:.01ms!important;
  }
}
    `}</style>
  );
}