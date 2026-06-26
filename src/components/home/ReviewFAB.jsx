// src/components/home/ReviewFAB.jsx
// ═══════════════════════════════════════════════════════════════════════════
// Floating "+" Button → Premium Multi-Step Review Modal
// Only visible when authenticated. Fully self-contained styles.
// ═══════════════════════════════════════════════════════════════════════════

import React, {
  useState, useCallback, useEffect, useRef, useMemo,
} from "react";
import { createPortal } from "react-dom";
import { FaStar }       from "react-icons/fa6";
import {
  HiPlus, HiX, HiCheckCircle, HiSparkles,
  HiArrowRight, HiArrowLeft,
} from "react-icons/hi";
import {
  HiOutlineMapPin, HiOutlineGlobeAlt,
  HiOutlinePaperAirplane, HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { MdVerified } from "react-icons/md";

import { useUserAuth }          from "../../context/UserAuthContext";
import { useSubmitTestimonial } from "../../hooks/useSubmitTestimonial";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const MAX_WORDS   = 60;
const TOTAL_STEPS = 3;
const STAR_LABELS = ["Terrible", "Poor", "Good", "Great", "Excellent"];

const countWords = (s = "") =>
  s.trim().split(/\s+/).filter(Boolean).length;

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "").join("");

/* ═══════════════════════════════════════════
   STAR INPUT
═══════════════════════════════════════════ */
const StarInput = ({ value, onChange, disabled, size = "lg" }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const cls = size === "lg" ? "rfab-star--lg" : "rfab-star--sm";

  return (
    <div className="rfab-stars" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={`rfab-star-btn ${cls} ${n <= display ? "rfab-star-btn--on" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          aria-label={`${n} star — ${STAR_LABELS[n - 1]}`}
        >
          <FaStar />
        </button>
      ))}
      {display > 0 && (
        <span className="rfab-star-label">{STAR_LABELS[display - 1]}</span>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MODAL CONTENT — STEP 1: Rating + Text
═══════════════════════════════════════════ */
const Step1 = ({ form, set, errors, wordCount, overLimit, pct, barColor }) => (
  <div className="rfab-step">
    <div className="rfab-step-head">
      <div className="rfab-step-num">1</div>
      <div>
        <h3 className="rfab-step-title">Rate Your Experience</h3>
        <p className="rfab-step-sub">How was your adventure with us?</p>
      </div>
    </div>

    {/* Stars */}
    <div className="rfab-field">
      <label className="rfab-label">Overall Rating</label>
      <StarInput value={form.rating} onChange={(v) => set("rating", v)} />
    </div>

    {/* Review text */}
    <div className="rfab-field">
      <div className="rfab-label-row">
        <label className="rfab-label" htmlFor="rfab-text">Your Review</label>
        <span className={`rfab-wcount ${overLimit ? "rfab-wcount--over" : wordCount > 50 ? "rfab-wcount--warn" : ""}`}>
          {wordCount}/{MAX_WORDS}
        </span>
      </div>
      <div className={`rfab-ta-wrap ${overLimit ? "rfab-ta-wrap--err" : ""}`}>
        <textarea
          id="rfab-text"
          className="rfab-textarea"
          placeholder="Tell fellow travelers what made your trip special — the moments that took your breath away, the guides who went above and beyond…"
          value={form.testimonial_text}
          onChange={(e) => set("testimonial_text", e.target.value)}
          rows={5}
          maxLength={600}
          required
        />
        <div className="rfab-progress">
          <div className="rfab-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>
      {errors.testimonial_text && (
        <p className="rfab-err">{errors.testimonial_text}</p>
      )}
      {overLimit && (
        <p className="rfab-err">Please trim to {MAX_WORDS} words or fewer.</p>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MODAL CONTENT — STEP 2: Trip Details
═══════════════════════════════════════════ */
const Step2 = ({ form, set }) => (
  <div className="rfab-step">
    <div className="rfab-step-head">
      <div className="rfab-step-num">2</div>
      <div>
        <h3 className="rfab-step-title">Trip Details</h3>
        <p className="rfab-step-sub">Optional — helps other travelers</p>
      </div>
    </div>

    <div className="rfab-field">
      <label className="rfab-label" htmlFor="rfab-trip">
        Trip / Package <span className="rfab-opt">— optional</span>
      </label>
      <div className="rfab-input-wrap">
        <HiOutlineGlobeAlt className="rfab-input-icon" />
        <input
          id="rfab-trip"
          type="text"
          className="rfab-input"
          placeholder="e.g. Gorilla Trek, Safari, Kilimanjaro…"
          value={form.trip}
          onChange={(e) => set("trip", e.target.value)}
          maxLength={100}
        />
      </div>
    </div>

    <div className="rfab-field">
      <label className="rfab-label" htmlFor="rfab-loc">
        Where you're from <span className="rfab-opt">— optional</span>
      </label>
      <div className="rfab-input-wrap">
        <HiOutlineMapPin className="rfab-input-icon" />
        <input
          id="rfab-loc"
          type="text"
          className="rfab-input"
          placeholder="e.g. London, UK"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          maxLength={100}
        />
      </div>
    </div>

    <div className="rfab-tip">
      <HiOutlineChatBubbleLeftEllipsis className="rfab-tip-icon" />
      <p>Adding trip details helps fellow travelers find relevant reviews for their planned adventure.</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MODAL CONTENT — STEP 3: Preview + Submit
═══════════════════════════════════════════ */
const Step3 = ({ form, user, submitting, error }) => {
  const stars = Math.max(1, Math.min(5, form.rating));
  const userName = user?.fullName || user?.full_name || user?.name
    || user?.email?.split("@")[0] || "Traveler";
  const userAvatar = user?.avatar || user?.avatarUrl || user?.avatar_url;

  return (
    <div className="rfab-step">
      <div className="rfab-step-head">
        <div className="rfab-step-num">3</div>
        <div>
          <h3 className="rfab-step-title">Preview & Submit</h3>
          <p className="rfab-step-sub">Review how your feedback will appear</p>
        </div>
      </div>

      {/* Preview card */}
      <div className="rfab-preview">
        {/* Stars */}
        <div className="rfab-preview-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar key={i} className={i < stars ? "rfab-pstar--on" : "rfab-pstar--off"} />
          ))}
        </div>

        {/* Quote */}
        <p className="rfab-preview-text">
          "{form.testimonial_text || "Your review will appear here…"}"
        </p>

        {/* Author */}
        <div className="rfab-preview-author">
          <div className="rfab-preview-avatar">
            {userAvatar
              ? <img src={userAvatar} alt={userName} />
              : <span>{getInitials(userName) || "T"}</span>
            }
          </div>
          <div className="rfab-preview-meta">
            <strong>{userName}</strong>
            <span>
              {[form.trip, form.location].filter(Boolean).join(" · ") || "Altuvera Traveler"}
            </span>
          </div>
          <MdVerified className="rfab-preview-verified" />
        </div>
      </div>

      {error && (
        <div className="rfab-alert rfab-alert--err">
          <span>{error}</span>
        </div>
      )}

      <p className="rfab-note">
        Your review will be published after a quick moderation check — usually within 24 hours.
      </p>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════ */
const SuccessScreen = ({ onClose, onAnother, userName }) => (
  <div className="rfab-success">
    <div className="rfab-success-ring">
      <HiCheckCircle className="rfab-success-icon" />
    </div>
    <h3 className="rfab-success-title">
      Thank you, {userName}!
    </h3>
    <p className="rfab-success-body">
      Your review has been submitted successfully. It will appear on our
      site once approved by our team — usually within 24 hours.
    </p>
    <div className="rfab-success-actions">
      <button className="rfab-btn rfab-btn--outline" onClick={onAnother}>
        Write Another
      </button>
      <button className="rfab-btn rfab-btn--primary" onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN MODAL
═══════════════════════════════════════════ */
const ReviewModal = ({ isOpen, onClose }) => {
  const { user }     = useUserAuth();
  const modalRef     = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setFormState] = useState({
    testimonial_text: "",
    rating:           5,
    trip:             "",
    location:         "",
  });
  const [localErrors, setLocalErrors] = useState({});

  const { submit, submitting, submitted, error, reset } =
    useSubmitTestimonial();

  const wordCount = countWords(form.testimonial_text);
  const overLimit = wordCount > MAX_WORDS;
  const pct       = Math.min(100, (wordCount / MAX_WORDS) * 100);
  const barColor  = overLimit ? "#ef4444" : wordCount > 50 ? "#f59e0b" : "#22c55e";

  const userName = user?.fullName || user?.full_name || user?.name
    || user?.email?.split("@")[0] || "Traveler";

  const set = useCallback((field, val) => {
    setFormState((p) => ({ ...p, [field]: val }));
    setLocalErrors((p) => { const { [field]: _, ...rest } = p; return rest; });
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();
  }, [isOpen, step]);

  const validateStep1 = () => {
    const errs = {};
    if (!form.testimonial_text.trim())
      errs.testimonial_text = "Please write your review.";
    else if (overLimit)
      errs.testimonial_text = `Review must be ${MAX_WORDS} words or fewer.`;
    if (form.rating < 1 || form.rating > 5)
      errs.rating = "Please select a rating.";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const ok = await submit(form);
    // If successful, the `submitted` state flips in the hook
  };

  const handleAnother = () => {
    reset();
    setFormState({ testimonial_text: "", rating: 5, trip: "", location: "" });
    setLocalErrors({});
    setStep(1);
  };

  const handleClose = () => {
    reset();
    setFormState({ testimonial_text: "", rating: 5, trip: "", location: "" });
    setLocalErrors({});
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="rfab-overlay" onClick={handleClose}>
      <div
        ref={modalRef}
        className="rfab-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
      >
        {/* Close button */}
        <button className="rfab-close" onClick={handleClose} aria-label="Close">
          <HiX />
        </button>

        {/* Top accent */}
        <div className="rfab-accent" />

        {/* Header */}
        <div className="rfab-modal-header">
          <div className="rfab-modal-header-icon">
            <HiSparkles />
          </div>
          <div>
            <h2 className="rfab-modal-title">Share Your Experience</h2>
            <p className="rfab-modal-subtitle">
              Help fellow travelers plan their adventure
            </p>
          </div>
        </div>

        {/* Stepper */}
        {!submitted && (
          <div className="rfab-stepper">
            {["Rate", "Details", "Submit"].map((label, i) => {
              const n    = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={n}>
                  <div className="rfab-stepper-item">
                    <div className={`rfab-stepper-circle ${
                      done ? "rfab-stepper-circle--done" :
                      active ? "rfab-stepper-circle--active" :
                      "rfab-stepper-circle--pending"
                    }`}>
                      {done ? <HiCheckCircle /> : n}
                    </div>
                    <span className={`rfab-stepper-label ${
                      active ? "rfab-stepper-label--active" :
                      done ? "rfab-stepper-label--done" : ""
                    }`}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div className="rfab-stepper-line">
                      <div className={`rfab-stepper-line-fill ${done ? "rfab-stepper-line-fill--done" : ""}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="rfab-body">
          {submitted ? (
            <SuccessScreen
              onClose={handleClose}
              onAnother={handleAnother}
              userName={userName.split(" ")[0]}
            />
          ) : (
            <>
              {step === 1 && (
                <Step1
                  form={form} set={set}
                  errors={localErrors}
                  wordCount={wordCount}
                  overLimit={overLimit}
                  pct={pct} barColor={barColor}
                />
              )}
              {step === 2 && <Step2 form={form} set={set} />}
              {step === 3 && (
                <Step3
                  form={form} user={user}
                  submitting={submitting}
                  error={error}
                />
              )}
            </>
          )}
        </div>

        {/* Footer navigation */}
        {!submitted && (
          <div className="rfab-footer">
            {step > 1 ? (
              <button
                type="button"
                className="rfab-btn rfab-btn--ghost"
                onClick={handleBack}
                disabled={submitting}
              >
                <HiArrowLeft /> Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="rfab-btn rfab-btn--primary"
                onClick={handleNext}
                disabled={step === 1 && (!form.testimonial_text.trim() || overLimit)}
              >
                Continue <HiArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="rfab-btn rfab-btn--submit"
                onClick={handleSubmit}
                disabled={submitting || !form.testimonial_text.trim() || overLimit}
              >
                {submitting ? (
                  <><span className="rfab-spinner" /> Submitting…</>
                ) : (
                  <><HiOutlinePaperAirplane /> Submit Review</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

/* ═══════════════════════════════════════════
   FAB BUTTON + MODAL WRAPPER
═══════════════════════════════════════════ */
export default function ReviewFAB() {
  const { isAuthenticated } = useUserAuth();
  const [open, setOpen]     = useState(false);
  const [pulse, setPulse]   = useState(true);

  // Stop pulse after first interaction
  const handleOpen = useCallback(() => {
    setOpen(true);
    setPulse(false);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      <FABStyles />

      {/* Floating button */}
      <button
        className={`rfab-fab ${pulse ? "rfab-fab--pulse" : ""}`}
        onClick={handleOpen}
        aria-label="Write a review"
        title="Share your experience"
      >
        <HiPlus className="rfab-fab-icon" />
        <span className="rfab-fab-label">Review</span>
      </button>

      {/* Modal */}
      <ReviewModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ═══════════════════════════════════════════
   SELF-CONTAINED STYLES
═══════════════════════════════════════════ */
function FABStyles() {
  return (
    <style>{`

/* ─── FAB Button ─── */
.rfab-fab {
  position: fixed;
  bottom: clamp(1.25rem, 4vw, 2rem);
  right: clamp(1.25rem, 4vw, 2rem);
  z-index: 9900;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.35rem;
  height: 52px;
  border: none;
  border-radius: 100px;
  background: linear-gradient(135deg, #14532d 0%, #16a34a 50%, #22c55e 100%);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow:
    0 6px 24px rgba(22, 163, 74, 0.40),
    0 2px 8px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
  letter-spacing: 0.01em;
}
.rfab-fab::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 100px;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  pointer-events: none;
}
.rfab-fab:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow:
    0 12px 36px rgba(22, 163, 74, 0.50),
    0 4px 12px rgba(0, 0, 0, 0.15);
}
.rfab-fab:active {
  transform: scale(0.95);
}
.rfab-fab-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rfab-fab:hover .rfab-fab-icon {
  transform: rotate(90deg);
}
.rfab-fab-label {
  font-size: 0.82rem;
  font-weight: 700;
}

/* Pulse ring */
.rfab-fab--pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 100px;
  background: rgba(34, 197, 94, 0.3);
  animation: rfabPulseAnim 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes rfabPulseAnim {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 0; }
}

/* Mobile: icon only */
@media (max-width: 480px) {
  .rfab-fab {
    width: 52px;
    padding: 0;
    justify-content: center;
  }
  .rfab-fab-label { display: none; }
}

/* ─── Overlay ─── */
.rfab-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem);
  background: rgba(0, 20, 10, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: rfabFadeIn 0.25s ease both;
}
@keyframes rfabFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─── Modal Shell ─── */
.rfab-modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: #fff;
  border-radius: 1.75rem;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.20),
    0 8px 20px rgba(0, 0, 0, 0.10);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: rfabModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes rfabModalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Top accent bar */
.rfab-accent {
  height: 4px;
  background: linear-gradient(90deg, #14532d, #22c55e, #4ade80, #22c55e, #14532d);
  flex-shrink: 0;
}

/* Close */
.rfab-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.rfab-close:hover {
  background: #e2e8f0;
  color: #0f172a;
  transform: rotate(90deg);
}
.rfab-close svg { width: 18px; height: 18px; }

/* ─── Modal Header ─── */
.rfab-modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem 1rem;
  flex-shrink: 0;
}
.rfab-modal-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rfab-modal-header-icon svg {
  width: 24px;
  height: 24px;
  color: #16a34a;
}
.rfab-modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.15rem;
  letter-spacing: -0.02em;
}
.rfab-modal-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
}

/* ─── Stepper ─── */
.rfab-stepper {
  display: flex;
  align-items: center;
  padding: 1rem 2rem 0.5rem;
  gap: 0;
  flex-shrink: 0;
}
.rfab-stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}
.rfab-stepper-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 800;
  transition: all 0.3s ease;
}
.rfab-stepper-circle--done {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.35);
}
.rfab-stepper-circle--done svg { width: 16px; height: 16px; }
.rfab-stepper-circle--active {
  background: #fff;
  color: #16a34a;
  border: 2.5px solid #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}
.rfab-stepper-circle--pending {
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
}
.rfab-stepper-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  transition: color 0.2s;
}
.rfab-stepper-label--active { color: #16a34a; }
.rfab-stepper-label--done   { color: #22c55e; }

.rfab-stepper-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  border-radius: 99px;
  margin: 0 0.5rem;
  margin-bottom: 1.25rem;
  overflow: hidden;
}
.rfab-stepper-line-fill {
  height: 100%;
  width: 0;
  background: #22c55e;
  border-radius: 99px;
  transition: width 0.5s ease;
}
.rfab-stepper-line-fill--done { width: 100%; }

/* ─── Body (scrollable) ─── */
.rfab-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem 2rem 1.5rem;
}
.rfab-body::-webkit-scrollbar { width: 4px; }
.rfab-body::-webkit-scrollbar-track { background: transparent; }
.rfab-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

/* ─── Step header ─── */
.rfab-step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: rfabStepIn 0.35s ease both;
}
@keyframes rfabStepIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
.rfab-step-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}
.rfab-step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
  font-size: 0.88rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}
.rfab-step-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}
.rfab-step-sub {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0.1rem 0 0;
}

/* ─── Fields ─── */
.rfab-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.rfab-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
}
.rfab-opt {
  font-weight: 400;
  font-size: 0.75rem;
  color: #9ca3af;
}
.rfab-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Stars */
.rfab-stars {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex-wrap: wrap;
}
.rfab-star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  color: #e5e7eb;
  line-height: 1;
  transition: color 0.15s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rfab-star--lg { font-size: 1.75rem; }
.rfab-star--sm { font-size: 1.2rem; }
.rfab-star-btn--on { color: #f59e0b; }
.rfab-star-btn:hover:not(:disabled) { transform: scale(1.25); }
.rfab-star-btn:disabled { cursor: not-allowed; opacity: 0.6; }
.rfab-star-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #22c55e;
  margin-left: 0.5rem;
}

/* Word count */
.rfab-wcount {
  font-size: 0.72rem;
  font-weight: 700;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s;
}
.rfab-wcount--warn { color: #f59e0b; }
.rfab-wcount--over { color: #ef4444; }

/* Textarea */
.rfab-ta-wrap {
  border-radius: 1rem;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.rfab-ta-wrap:focus-within {
  border-color: #22c55e;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.10);
}
.rfab-ta-wrap--err {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}
.rfab-textarea {
  width: 100%;
  display: block;
  padding: 1rem 1.1rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #111827;
  line-height: 1.7;
  font-family: inherit;
  resize: vertical;
  min-height: 130px;
  box-sizing: border-box;
}
.rfab-textarea::placeholder { color: #9ca3af; }

/* Progress */
.rfab-progress {
  height: 3px;
  background: #f3f4f6;
}
.rfab-progress-fill {
  height: 100%;
  transition: width 0.3s ease, background 0.3s ease;
}

/* Error */
.rfab-err {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
  margin: 0;
}

/* Input */
.rfab-input-wrap { position: relative; }
.rfab-input-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}
.rfab-input {
  width: 100%;
  height: 48px;
  padding: 0 0.9rem 0 2.5rem;
  border-radius: 0.85rem;
  border: 2px solid #e5e7eb;
  background: #f9fafb;
  font-size: 0.88rem;
  color: #111827;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  box-sizing: border-box;
}
.rfab-input::placeholder { color: #9ca3af; }
.rfab-input:focus {
  border-color: #22c55e;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.10);
}

/* Tip box */
.rfab-tip {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 1rem;
}
.rfab-tip-icon {
  width: 20px;
  height: 20px;
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.rfab-tip p {
  font-size: 0.78rem;
  color: #15803d;
  line-height: 1.6;
  margin: 0;
}

/* ─── Preview Card ─── */
.rfab-preview {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.rfab-preview-stars {
  display: flex;
  gap: 0.2rem;
}
.rfab-pstar--on  { font-size: 1rem; color: #f59e0b; }
.rfab-pstar--off { font-size: 1rem; color: #e5e7eb; }

.rfab-preview-text {
  font-size: 0.92rem;
  color: #374151;
  line-height: 1.7;
  font-style: italic;
  margin: 0;
  min-height: 3.5rem;
}
.rfab-preview-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.85rem;
  border-top: 1px solid #f1f5f9;
}
.rfab-preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #d1fae5;
}
.rfab-preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rfab-preview-avatar span {
  font-size: 0.88rem;
  font-weight: 800;
  color: #fff;
}
.rfab-preview-meta {
  flex: 1;
  min-width: 0;
}
.rfab-preview-meta strong {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}
.rfab-preview-meta span {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.1rem;
}
.rfab-preview-verified {
  width: 18px;
  height: 18px;
  color: #22c55e;
  flex-shrink: 0;
}

/* Alert */
.rfab-alert {
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
}
.rfab-alert--err {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

/* Note */
.rfab-note {
  font-size: 0.72rem;
  color: #9ca3af;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

/* ─── Footer ─── */
.rfab-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
  gap: 0.75rem;
}

/* ─── Buttons ─── */
.rfab-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 46px;
  padding: 0 1.35rem;
  border-radius: 0.85rem;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  white-space: nowrap;
}
.rfab-btn svg { width: 16px; height: 16px; }

.rfab-btn--primary {
  background: linear-gradient(135deg, #14532d, #16a34a);
  color: #fff;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.30);
}
.rfab-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.40);
}

.rfab-btn--submit {
  background: linear-gradient(135deg, #14532d, #16a34a, #22c55e);
  color: #fff;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.30);
  min-width: 160px;
}
.rfab-btn--submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.40);
}

.rfab-btn--ghost {
  background: transparent;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}
.rfab-btn--ghost:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.rfab-btn--outline {
  background: transparent;
  color: #16a34a;
  border: 1.5px solid #d1fae5;
}
.rfab-btn--outline:hover {
  background: #f0fdf4;
  border-color: #86efac;
}

.rfab-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
}

/* Spinner */
.rfab-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rfabSpinAnim 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes rfabSpinAnim { to { transform: rotate(360deg); } }

/* ─── Success ─── */
.rfab-success {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0 0.5rem;
}
.rfab-success-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.08);
  animation: rfabPopAnim 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes rfabPopAnim {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.rfab-success-icon {
  width: 42px;
  height: 42px;
  color: #16a34a;
}
.rfab-success-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}
.rfab-success-body {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  max-width: 28rem;
}
.rfab-success-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .rfab-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 1.25rem 1.25rem 0 0;
    margin-top: auto;
  }
  .rfab-overlay {
    align-items: flex-end;
    padding: 0;
  }
  .rfab-modal-header { padding: 1.5rem 1.5rem 0.75rem; }
  .rfab-stepper { padding: 0.75rem 1.5rem 0.25rem; }
  .rfab-body { padding: 1rem 1.5rem 1.25rem; }
  .rfab-footer { padding: 0.85rem 1.5rem 1.25rem; }
  .rfab-step-head { gap: 0.75rem; }
  .rfab-star--lg { font-size: 1.5rem; }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

    `}</style>
  );
}