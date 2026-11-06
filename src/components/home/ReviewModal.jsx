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
import {
  Star, X, CheckCircle2, Sparkles, ArrowRight, ArrowLeft,
  MapPin, Globe2, Send, MessageCircle,
} from "lucide-react";

import { useUserAuth }          from "../../context/UserAuthContext";
import { useSubmitTestimonial } from "../../hooks/useSubmitTestimonial";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const MAX_WORDS   = 150;
const TOTAL_STEPS = 4;
const STAR_LABELS = ["Terrible", "Poor", "Good", "Great", "Excellent"];

const rawApiBase = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://backend-jd8f.onrender.com"
).replace(/\/+$/, "");
const API_BASE = rawApiBase.endsWith("/api") ? rawApiBase.slice(0, -4) : rawApiBase;
const CONTEXT_SEARCH_ENDPOINT = `${API_BASE}/api/testimonials/context-search`;

const EMPTY_FORM = Object.freeze({
  testimonial_text: "",
  rating: 0,
  trip: "",
  trip_entity_type: "",
  trip_entity_id: "",
  trip_entity: null,
  review_answers: [],
  expectations_met: "",
  location: "",
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
          <Star aria-hidden="true" fill="currentColor" />
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
      <span className="rmod-alert-mark" aria-hidden="true">!</span>
      <span className="rmod-alert-text">{msg}</span>
      {onDismiss && (
        <button
          type="button"
          className="rmod-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
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
      <p className="rmod-field-hint">Choose 1–5 stars to continue.</p>
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
          maxLength={1500}
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

// ── Step 2: Verified trip selection and traveller details ────────────────
const Step2 = ({
  form, set, onTripInput, searchResults, searchLoading, searchError,
  onSelectTrip, onClearTrip, canProceed,
}) => (
  <div className="rmod-step">
    <div className="rmod-step-head">
      <div className="rmod-step-num" aria-hidden="true">2</div>
      <div>
        <h3 className="rmod-step-title">Trip Details</h3>
        <p className="rmod-step-sub">Connect your review to a real Altuvera experience</p>
      </div>
    </div>

    <div className="rmod-field">
      <label className="rmod-label" htmlFor="rmod-trip">
        Destination, Country or Package <span className="rmod-opt">— optional</span>
      </label>
      <div style={{ position: "relative" }}>
        <div className="rmod-input-wrap">
          <Globe2 className={`rmod-input-icon${form.trip_entity_id ? " is-valid" : ""}`} aria-hidden="true" />
          <input
            id="rmod-trip"
            type="text"
            className="rmod-input"
            placeholder="Start typing a destination, country or package…"
            value={form.trip_entity_id ? typedTrip : form.trip}
            onChange={(event) => onTripInput(event.target.value)}
            maxLength={100}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={Boolean(form.trip.trim()) && !form.trip_entity_id}
            aria-controls="rmod-trip-results"
            aria-describedby="rmod-trip-hint"
          />
          {form.trip && (
            <button type="button" onClick={onClearTrip} aria-label="Clear trip selection"
              style={{ border: 0, background: "transparent", color: "#64748b", padding: "0 10px", cursor: "pointer" }}>
              <X size={16} />
            </button>
          )}
        </div>

        {!form.trip_entity_id && form.trip.trim().length >= 2 && (
          <div id="rmod-trip-results" role="listbox" className="rmod-search-results">
            {searchLoading ? (
              <div className="rmod-search-state"><span className="rmod-spinner" /> Searching experiences…</div>
            ) : searchError ? (
              <div className="rmod-search-state rmod-search-state--error">{searchError}</div>
            ) : searchResults.length ? searchResults.map((item) => (
              <button key={`${item.type}-${item.id}`} type="button" role="option"
                aria-selected="false" className="rmod-search-result" onClick={() => onSelectTrip(item)}>
                <span className="rmod-search-result-icon">{item.type === "package" ? <Send size={16} /> : item.type === "country" ? <Globe2 size={16} /> : <MapPin size={16} />}</span>
                <span className="rmod-search-result-copy"><strong>{item.title}</strong><small>{String(item.type).replace("_", " ")}{item.country_name && item.type !== "country" ? ` · ${item.country_name}` : ""}</small></span>
                <ArrowRight size={15} />
              </button>
            )) : (
              <div className="rmod-search-state">No matching destination, country or published package was found. Choose a result from the list or clear your search.</div>
            )}
          </div>
        )}
      </div>
      <p id="rmod-trip-hint" className="rmod-field-hint">
        Search results are verified Altuvera records. You may leave this field blank, but typed text must be selected from the results before continuing.
      </p>
      {form.trip.trim() && !form.trip_entity_id && form.trip.length < 2 && (
        <p className="rmod-err">Enter at least two characters to search, or clear this field to continue without a trip reference.</p>
      )}
      {form.trip.trim() && !form.trip_entity_id && form.trip.length >= 2 && !searchLoading && searchResults.length === 0 && !searchError && (
        <p className="rmod-err">Select a matching result or clear the field before continuing.</p>
      )}
    </div>

    <div className="rmod-field">
      <label className="rmod-label">Did the experience meet your expectations? <span className="rmod-opt">— optional</span></label>
      <div className="rmod-expectation-options">
        {[
          { value: "met", label: "Yes, it did" },
          { value: "partly_met", label: "Partly" },
          { value: "not_met", label: "No, it did not" },
        ].map((option) => (
          <button key={option.value} type="button"
            className={`rmod-expectation-option${form.expectations_met === option.value ? " is-selected" : ""}`}
            aria-pressed={form.expectations_met === option.value}
            onClick={() => set("expectations_met", form.expectations_met === option.value ? "" : option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <p className="rmod-field-hint">Your honest response helps us understand where we are meeting expectations and where we can improve.</p>
    </div>

    <div className="rmod-field">
      <label className="rmod-label" htmlFor="rmod-loc">
        Where you&apos;re from <span className="rmod-opt">— optional</span>
      </label>
      <div className="rmod-input-wrap">
        <MapPin className="rmod-input-icon" aria-hidden="true" />
        <input id="rmod-loc" type="text" className="rmod-input"
          placeholder="e.g. London, UK" value={form.location}
          onChange={(event) => set("location", event.target.value)}
          maxLength={100} autoComplete="country-name" />
      </div>
    </div>

  </div>
);

// ── Step 3: Optional, context-specific questions ────────────────────────────
const StepQuestions = ({ form, onAnswer, onSkip }) => {
  const questions = Array.isArray(form.trip_entity?.review_questions) ? form.trip_entity.review_questions : [];
  const getAnswer = (questionId) => form.review_answers.find((answer) => answer.question_id === questionId)?.value ?? "";

  if (!questions.length) {
    return (
      <div className="rmod-step">
        <div className="rmod-step-head"><div className="rmod-step-num">3</div><div>
          <h3 className="rmod-step-title">A Few More Details</h3>
          <p className="rmod-step-sub">No additional questions are configured for this selection.</p>
        </div></div>
        <p className="rmod-field-hint">You can continue to preview your review. Thank you for sharing your experience.</p>
      </div>
    );
  }

  return (
    <div className="rmod-step">
      <div className="rmod-step-head"><div className="rmod-step-num">3</div><div>
        <h3 className="rmod-step-title">Help Us Improve This Experience</h3>
        <p className="rmod-step-sub">These questions are specific to {form.trip_entity?.title || "your selected experience"}. Every answer is optional.</p>
      </div></div>
      <div className="rmod-question-list">
        {questions.map((question, index) => {
          const id = String(question.id || `question-${index + 1}`);
          const value = getAnswer(id);
          const common = { id: `rmod-question-${id}`, className: "rmod-input", value, onChange: (event) => onAnswer(id, event.target.value) };
          return (
            <div className="rmod-field rmod-question-card" key={id}>
              <label className="rmod-label" htmlFor={common.id}>{question.prompt || `Question ${index + 1}`} <span className="rmod-opt">— optional</span></label>
              {question.type === "long_text" ? (
                <textarea {...common} rows={3} maxLength={2000} placeholder="Share any details you feel comfortable providing…" />
              ) : question.type === "number" ? (
                <div className="rmod-input-wrap"><input {...common} type="number" inputMode="decimal" step="any" placeholder="Enter a number" />{question.unit && <span className="rmod-question-unit">{question.unit}</span>}</div>
              ) : question.type === "date" ? (
                <input {...common} type="date" />
              ) : question.type === "yes_no" ? (
                <select {...common}><option value="">Choose an answer</option><option value="yes">Yes</option><option value="no">No</option></select>
              ) : question.type === "choice" ? (
                <select {...common}><option value="">Choose an option</option>{(Array.isArray(question.options) ? question.options : []).map(option => <option key={option} value={option}>{option}</option>)}</select>
              ) : question.type === "rating" ? (
                <select {...common}><option value="">Select a rating</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select>
              ) : (
                <input {...common} type="text" maxLength={500} placeholder="Your answer…" />
              )}
              {question.help_text && <p className="rmod-field-hint">{question.help_text}</p>}
            </div>
          );
        })}
      </div>
      <div className="rmod-optional-actions">
        <button type="button" className="rmod-btn rmod-btn--ghost" onClick={onSkip}>Skip these questions</button>
      </div>
      <p className="rmod-note">You may answer as many or as few as you wish. Skipping this step will not affect your review.</p>
    </div>
  );
};

// ── Step 4: Preview + submit ─────────────────────────────────────────────────
const Step4 = ({ form, user, submitting, error, onDismissError }) => {
  const stars    = Math.max(1, Math.min(5, Number(form.rating) || 5));
  const userName = getUserName(user);
  const avatar   = getUserAvatar(user);
  const tripLine = [form.trip, form.location].map((value) => String(value || "").trim()).filter(Boolean).join(" · ");
  const answeredQuestions = (Array.isArray(form.review_answers) ? form.review_answers : [])
    .filter((answer) => answer.value !== "" && answer.value !== null && answer.value !== undefined)
    .map((answer) => {
      const question = (Array.isArray(form.trip_entity?.review_questions) ? form.trip_entity.review_questions : [])
        .find((item) => String(item.id) === String(answer.question_id));
      return { ...answer, prompt: question?.prompt || "Additional feedback", unit: question?.unit || "" };
    });

  return (
    <div className="rmod-step">
      <div className="rmod-step-head">
        <div className="rmod-step-num" aria-hidden="true">4</div>
        <div><h3 className="rmod-step-title">Preview &amp; Submit</h3><p className="rmod-step-sub">Review how your feedback will appear</p></div>
      </div>
      <div className="rmod-preview" aria-label="Review preview">
        <div className="rmod-preview-stars" aria-label={`${stars} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < stars ? "rmod-pstar--on" : "rmod-pstar--off"} aria-hidden="true" fill="currentColor" />)}
        </div>
        <p className="rmod-preview-text">&ldquo;{String(form.testimonial_text || "Your review will appear here…")}&rdquo;</p>
        {form.expectations_met && <p className="rmod-preview-expectation">Expectations: {form.expectations_met === "met" ? "Met" : form.expectations_met === "partly_met" ? "Partly met" : "Not met"}</p>}
        {answeredQuestions.length > 0 && <div className="rmod-preview-answers">{answeredQuestions.map(answer => <div key={answer.question_id}><strong>{answer.prompt}</strong><span>{String(answer.value)}{answer.unit ? ` ${answer.unit}` : ""}</span></div>)}</div>}
        <div className="rmod-preview-author">
          <div className="rmod-preview-avatar" aria-hidden="true">{avatar ? <img src={avatar} alt="" /> : <span>{getInitials(userName) || "T"}</span>}</div>
          <div className="rmod-preview-meta"><strong>{userName}</strong>{tripLine && <span>{tripLine}</span>}</div>
          <span className="rmod-preview-status">Pending admin approval</span>
        </div>
      </div>
      {error && <ErrorAlert error={error} onDismiss={onDismissError} />}
      {submitting && <div className="rmod-submitting" aria-live="polite" aria-busy="true"><span className="rmod-spinner" aria-hidden="true" /><span>Submitting your review…</span></div>}
      <p className="rmod-note">Your review remains private until an Altuvera administrator approves it.</p>
    </div>
  );
};

// ── Success screen ─────────────────────────────────────────────────────────
const SuccessScreen = ({ onClose, userName }) => (
  <div className="rmod-success" role="status" aria-live="polite">
    <div className="rmod-success-ring" aria-hidden="true">
      <CheckCircle2 className="rmod-success-icon" />
    </div>
    <h3 className="rmod-success-title">
      Thank you, {String(userName || "Traveler")}!
    </h3>
    <p className="rmod-success-body">
      Your review has been received and is awaiting approval by the Altuvera team. It will appear publicly only after an administrator approves it.
    </p>
    <div className="rmod-success-actions">
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
  const { user } = useUserAuth();
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setFormState] = useState({ ...EMPTY_FORM });
  const [localErrors, setLocalErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [typedTrip, setTypedTrip] = useState("");
  const submitLockRef = useRef(false);
  const { submit, submitting, submitted, error, reset } = useSubmitTestimonial();

  const wc = countWords(form.testimonial_text);
  const overLimit = wc > MAX_WORDS;
  const pct = Math.min(100, (wc / MAX_WORDS) * 100);
  const barColor = overLimit ? "#ef4444" : wc > 50 ? "#f59e0b" : "#22c55e";
  const firstName = getUserName(user).split(" ")[0];
  const customQuestions = Array.isArray(form.trip_entity?.review_questions) ? form.trip_entity.review_questions : [];
  const canProceedStep1 = String(form.testimonial_text || "").trim().length > 0 && !overLimit &&
    Number(form.rating) >= 1 && Number(form.rating) <= 5;
  const canProceedStep2 = !String(form.trip || "").trim() || Boolean(form.trip_entity_id && form.trip_entity_type);

  const set = useCallback((field, value) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
    setLocalErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const setTripInput = useCallback((value) => {
    setTypedTrip(value);
    setFormState((previous) => ({
      ...previous,
      trip: value,
      trip_entity_type: "",
      trip_entity_id: "",
      trip_entity: null,
      review_answers: [],
    }));
    setSearchError("");
    setSearchResults([]);
  }, []);

  const selectTrip = useCallback((item) => {
    setTypedTrip("");
    setFormState((previous) => ({
      ...previous,
      trip: item.title,
      trip_entity_type: item.type,
      trip_entity_id: String(item.id),
      trip_entity: item,
      review_answers: [],
    }));
    setSearchResults([]);
    setSearchError("");
  }, []);

  const clearTrip = useCallback(() => { setTypedTrip(""); setTripInput(""); }, [setTripInput]);

  useEffect(() => {
    const target = String(form.trip_entity?.title || "");
    if (!form.trip_entity_id || !target) return undefined;
    setTypedTrip("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedTrip(target.slice(0, index));
      if (index >= target.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [form.trip_entity_id, form.trip_entity?.title]);

  const setAnswer = useCallback((questionId, value) => {
    setFormState((previous) => {
      const answers = Array.isArray(previous.review_answers) ? previous.review_answers : [];
      const existing = answers.find((answer) => answer.question_id === questionId);
      const nextAnswers = existing
        ? answers.map((answer) => answer.question_id === questionId ? { ...answer, value } : answer)
        : [...answers, { question_id: questionId, value }];
      return { ...previous, review_answers: nextAnswers };
    });
  }, []);

  useEffect(() => {
    if (!isOpen || step !== 2 || form.trip_entity_id || String(form.trip || "").trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }
    setSearchLoading(true);
    setSearchError("");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const response = await fetch(`${CONTEXT_SEARCH_ENDPOINT}?q=${encodeURIComponent(form.trip.trim())}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body?.error || "Unable to search experiences right now.");
        setSearchResults(Array.isArray(body.data) ? body.data : []);
      } catch (searchErr) {
        if (searchErr.name !== "AbortError") {
          setSearchResults([]);
          setSearchError(searchErr.message || "Search is temporarily unavailable. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, step, form.trip, form.trip_entity_id]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const timer = setTimeout(() => {
      const first = modalRef.current?.querySelector(
        "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex=\"-1\"])",
      );
      first?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen, step]);

  const validateStep1 = useCallback(() => {
    const errors = {};
    const text = String(form.testimonial_text || "").trim();
    if (!text) errors.testimonial_text = "Please write your review before continuing.";
    else if (overLimit) errors.testimonial_text = `Max ${MAX_WORDS} words (you used ${wc}).`;
    if (!form.rating || form.rating < 1 || form.rating > 5) errors.rating = "Please select a star rating.";
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, overLimit, wc]);

  const handleNext = useCallback(() => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !canProceedStep2) return;
    if (step === 2 && customQuestions.length === 0) {
      setStep(4);
      return;
    }
    if (step < TOTAL_STEPS) setStep((current) => current + 1);
  }, [step, validateStep1, canProceedStep2, customQuestions.length]);

  const handleBack = useCallback(() => {
    if (step === 4 && customQuestions.length === 0) setStep(2);
    else if (step > 1) setStep((current) => current - 1);
  }, [step, customQuestions.length]);

  const handleSubmit = useCallback(async () => {
    if (submitLockRef.current || submitting || !canProceedStep2) return;
    submitLockRef.current = true;
    try {
      await submit({
        testimonial_text: form.testimonial_text,
        rating: form.rating,
        trip: form.trip || undefined,
        trip_entity_type: form.trip_entity_type || undefined,
        trip_entity_id: form.trip_entity_id || undefined,
        expectations_met: form.expectations_met || undefined,
        review_answers: form.review_answers || [],
        location: form.location || undefined,
      });
    } finally {
      submitLockRef.current = false;
    }
  }, [submit, form, submitting, canProceedStep2]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    setFormState({ ...EMPTY_FORM });
    setLocalErrors({});
    setSearchResults([]);
    setSearchError("");
    setStep(1);
    onClose();
  }, [reset, onClose, submitting]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event) => { if (event.key === "Escape" && !submitting) handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, submitting, handleClose]);

  if (!isOpen) return null;
  const STEP_LABELS = ["Review", "Trip", "Questions", "Submit"];

  return createPortal(
    <>
      <ReviewModalStyles />
      <div className="rmod-overlay" onClick={handleClose} role="presentation" aria-hidden="true">
        <div ref={modalRef} className="rmod-modal" onClick={(event) => event.stopPropagation()}
          role="dialog" aria-modal="true" aria-labelledby="rmod-title" aria-describedby="rmod-subtitle">
          <button type="button" className="rmod-close" onClick={handleClose} disabled={submitting} aria-label="Close review modal"><X aria-hidden="true" /></button>
          <div className="rmod-header">
            <div className="rmod-header-icon rmod-header-logo"><img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT || "Altuvera"} /></div>
            <div><h2 id="rmod-title" className="rmod-title">Share Your Experience</h2><p id="rmod-subtitle" className="rmod-subtitle">Help fellow travelers plan their adventure</p></div>
          </div>

          {!submitted && (
            <div className="rmod-stepper" role="list" aria-label="Form steps">
              {STEP_LABELS.map((label, index) => {
                const number = index + 1;
                const done = step > number;
                const active = step === number;
                return (
                  <React.Fragment key={number}>
                    <div className="rmod-stepper-item" role="listitem">
                      <div className={["rmod-stepper-circle", done ? "rmod-stepper-circle--done" : active ? "rmod-stepper-circle--active" : "rmod-stepper-circle--pending"].join(" ")} aria-current={active ? "step" : undefined}>
                        {done ? <CheckCircle2 aria-hidden="true" /> : <span aria-hidden="true">{number}</span>}
                      </div>
                      <span className={["rmod-stepper-lbl", active ? "rmod-stepper-lbl--active" : done ? "rmod-stepper-lbl--done" : ""].filter(Boolean).join(" ")}>{label}</span>
                    </div>
                    {index < STEP_LABELS.length - 1 && <div className="rmod-stepper-line" aria-hidden="true"><div className={["rmod-stepper-line-fill", done ? "rmod-stepper-line-fill--done" : ""].filter(Boolean).join(" ")} /></div>}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="rmod-body">
            {submitted ? (
              <SuccessScreen onClose={handleClose} userName={firstName} />
            ) : (
              <>
                {step === 1 && <Step1 form={form} set={set} errors={localErrors} wordCount={wc} overLimit={overLimit} pct={pct} barColor={barColor} />}
                {step === 2 && <Step2 form={form} set={set} onTripInput={setTripInput} searchResults={searchResults} searchLoading={searchLoading} searchError={searchError} onSelectTrip={selectTrip} onClearTrip={clearTrip} canProceed={canProceedStep2} />}
                {step === 3 && <StepQuestions form={form} onAnswer={setAnswer} onSkip={() => setStep(4)} />}
                {step === 4 && <Step4 form={form} user={user} submitting={submitting} error={error} onDismissError={() => {}} />}
              </>
            )}
          </div>

          {!submitted && (
            <div className="rmod-footer">
              {step > 1 ? (
                <button type="button" className="rmod-btn rmod-btn--ghost" onClick={handleBack} disabled={submitting}><ArrowLeft aria-hidden="true" />Back</button>
              ) : <div aria-hidden="true" />}
              {step < TOTAL_STEPS ? (
                <button type="button" className="rmod-btn rmod-btn--primary" onClick={handleNext}
                  disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}>
                  Continue<ArrowRight aria-hidden="true" />
                </button>
              ) : (
                <button type="button" className="rmod-btn rmod-btn--submit" onClick={handleSubmit}
                  disabled={submitting || !canProceedStep1 || !canProceedStep2} aria-busy={submitting}>
                  {submitting ? <><span className="rmod-spinner" aria-hidden="true" />Submitting…</> : <><Send aria-hidden="true" />Submit Review</>}
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
.rmod-accent{display:none;}

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
.rmod-header-logo{width:58px;height:58px;border-radius:15px;background:#fff;border:1px solid #e7eee9;box-shadow:0 5px 18px rgba(15,45,30,.08);padding:7px;}
.rmod-header-logo img{display:block;width:100%;height:100%;object-fit:contain;}
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
.rmod-field-hint{font-size:.72rem;color:#64748b;margin:-.2rem 0 0;}
.rmod-opt{font-weight:400;font-size:.75rem;color:#9ca3af;}
.rmod-label-row{display:flex;align-items:center;justify-content:space-between;}

/* ── Stars ── */
.rmod-stars{display:flex;align-items:center;gap:.2rem;flex-wrap:wrap;}
.rmod-star-btn{
  background:none;border:none;cursor:pointer;padding:.45rem;min-width:44px;min-height:44px;
  font-size:1.75rem;color:#e5e7eb;line-height:1;
  transition:color .15s ease,transform .2s cubic-bezier(.34,1.56,.64,1);
}
.rmod-star-btn--on{color:#f59e0b;}
.rmod-star-btn svg{width:24px;height:24px;stroke-width:2.2;}
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
.rmod-preview-stars svg{width:18px;height:18px;stroke-width:1.8;}
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
.rmod-preview-status{display:inline-flex;align-items:center;justify-content:center;padding:.4rem .65rem;border-radius:999px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:.65rem;font-weight:800;line-height:1.2;text-align:center;flex-shrink:0;}

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
.rmod-alert-mark{flex-shrink:0;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:900;background:#fee2e2;color:#b91c1c;}
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
  .rmod-header{padding:1.25rem 1.25rem .75rem;gap:.8rem;}
  .rmod-header-logo{width:48px;height:48px;border-radius:13px;}
  .rmod-title{font-size:1.08rem;}
  .rmod-subtitle{font-size:.76rem;}
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
.rmod-input-wrap{position:relative;display:flex;align-items:center;min-height:52px;}
.rmod-input-icon{position:absolute;left:15px;top:50%;transform:translateY(-50%);width:19px;height:19px;color:#829187;z-index:2;pointer-events:none;transition:color .2s,filter .2s;}
.rmod-input-icon.is-valid{color:#079669;filter:drop-shadow(0 1px 2px rgba(7,150,105,.18));}
.rmod-input-wrap:has(.rmod-input-icon) .rmod-input{padding-left:46px;padding-right:42px;}
.rmod-input-wrap:has(.rmod-input-icon.is-valid) .rmod-input{border-color:#12a875;background:#f6fdf9;box-shadow:0 0 0 3px rgba(18,168,117,.09);}
.rmod-search-results{position:absolute;z-index:30;top:calc(100% + 7px);left:0;right:0;max-height:260px;overflow:auto;border:1px solid #dbe7df;border-radius:14px;background:#fff;box-shadow:0 16px 38px rgba(15,45,30,.16)}
.rmod-search-result{display:flex;align-items:center;gap:10px;width:100%;padding:11px 13px;border:0;border-bottom:1px solid #eef3ef;background:#fff;text-align:left;color:#1f3d2f;cursor:pointer}
.rmod-search-result:last-child{border-bottom:0}.rmod-search-result:hover,.rmod-search-result:focus-visible{background:#f0faf4;outline:none}
.rmod-search-result-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:10px;background:#e9f7ee;color:#087d5a}
.rmod-search-result-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:3px}.rmod-search-result-copy strong{font-size:13px;overflow-wrap:anywhere}.rmod-search-result-copy small{font-size:10px;color:#718078;text-transform:capitalize}
.rmod-search-state{padding:14px;color:#69796f;font-size:12px;line-height:1.55}.rmod-search-state--error{color:#b42318}
.rmod-expectation-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.rmod-expectation-option{padding:10px 9px;border:1px solid #dce7df;border-radius:11px;background:#fff;color:#42594b;font-size:12px;font-weight:650;cursor:pointer}
.rmod-expectation-option.is-selected{border-color:#0b8b62;background:#eaf8f0;color:#066044;box-shadow:0 0 0 2px rgba(11,139,98,.1)}
.rmod-question-list{display:grid;gap:12px}.rmod-question-card{padding:14px;border:1px solid #e1ebe4;border-radius:14px;background:#fbfdfb}
.rmod-question-unit{padding:0 12px;color:#728077;font-size:12px;white-space:nowrap}
.rmod-optional-actions{display:flex;justify-content:flex-end;margin-top:4px}
.rmod-preview-expectation{margin:0 0 12px;padding:9px 11px;border-radius:10px;background:#eff8f2;color:#176246;font-size:12px;font-weight:650}
.rmod-preview-answers{display:grid;gap:8px;margin:0 0 14px}.rmod-preview-answers>div{display:grid;gap:3px;padding:9px 11px;border-radius:10px;background:#f7faf8}.rmod-preview-answers strong{font-size:11px;color:#496052}.rmod-preview-answers span{font-size:12px;color:#193d2c;overflow-wrap:anywhere}
@media(max-width:520px){.rmod-expectation-options{grid-template-columns:1fr}.rmod-search-results{max-height:220px}}
    `}
</style>
  );
}