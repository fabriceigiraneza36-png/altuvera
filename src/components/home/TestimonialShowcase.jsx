// src/components/home/TestimonialShowcase.jsx
import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { FaStar, FaRegStar, FaQuoteRight } from "react-icons/fa6";
import {
  IoChevronBack, IoChevronForward, IoPause, IoPlay,
} from "react-icons/io5";
import { useTestimonials } from "../../hooks/useTestimonials";

/* ═══════════════════════════════════════════
   STYLES — injected once
═══════════════════════════════════════════ */
const TESTIMONIAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Inter:wght@400;500;600;700&display=swap');

/* ── Section ── */
.tshow-section {
  padding: clamp(2.5rem, 5vw, 4rem) 0;
  background: linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%);
  position: relative;
  overflow: hidden;
}
.tshow-section::before {
  content: '';
  position: absolute;
  top: -6rem;
  right: -6rem;
  width: 22rem;
  height: 22rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167,243,208,.12) 0%, transparent 70%);
  pointer-events: none;
}
.tshow-section::after {
  content: '';
  position: absolute;
  bottom: -5rem;
  left: -5rem;
  width: 18rem;
  height: 18rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,.15) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Container ── */
.tshow-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
  position: relative;
  z-index: 1;
}

/* ── Header ── */
.tshow-header {
  text-align: center;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.tshow-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: .65rem;
  font-weight: 800;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: #a7f3d0;
  margin-bottom: .6rem;
  display: block;
}
.tshow-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  margin: 0 0 .6rem;
}
.tshow-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(.82rem, 1.2vw, .95rem);
  color: rgba(255,255,255,.75);
  line-height: 1.6;
  max-width: 520px;
  margin: 0 auto;
}

/* ── Slideshow frame ── */
.tshow-frame {
  position: relative;
  overflow: hidden;
  min-height: 240px;
}

/* ── Pair wrapper ── */
.tshow-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 2.5vw, 1.75rem);
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1);
  position: absolute;
  inset: 0;
  align-content: start;
}
.tshow-pair--active {
  opacity: 1;
  transform: translateY(0);
  position: relative;
}
.tshow-pair--exit {
  opacity: 0;
  transform: translateY(-18px);
}

/* ── Individual card ── */
.tshow-card {
  display: flex;
  gap: clamp(.85rem, 2vw, 1.5rem);
  background: rgba(255,255,255,.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 1.25rem;
  padding: clamp(1rem, 2vw, 1.5rem);
  transition: all .35s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
.tshow-card:hover {
  background: rgba(255,255,255,.1);
  border-color: rgba(255,255,255,.18);
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(0,0,0,.2);
}
.tshow-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #34d399, #059669);
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity .3s;
}
.tshow-card:hover::before {
  opacity: 1;
}

/* ── Avatar side ── */
.tshow-avatar-col {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .6rem;
}
.tshow-avatar-ring {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #34d399, #059669, #047857);
  flex-shrink: 0;
}
.tshow-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid #064e3b;
}
.tshow-avatar-init {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #065f46, #047857);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a7f3d0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  border: 2px solid #064e3b;
}
.tshow-quote-icon {
  color: rgba(167,243,208,.3);
  font-size: 1rem;
}

/* ── Content side ── */
.tshow-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: .45rem;
}
.tshow-stars {
  display: flex;
  gap: .15rem;
  margin-bottom: .1rem;
}
.tshow-star {
  font-size: .7rem;
  color: rgba(255,255,255,.2);
}
.tshow-star.filled {
  color: #fbbf24;
}

/* ── Typewriter text ── */
.tshow-text {
  font-family: 'Inter', sans-serif;
  font-size: clamp(.8rem, 1vw, .9rem);
  color: rgba(255,255,255,.88);
  line-height: 1.7;
  font-style: italic;
  min-height: 3.4em;
  position: relative;
}
.tshow-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #34d399;
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: tshowBlink .7s steps(1) infinite;
}
@keyframes tshowBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── Person info ── */
.tshow-person {
  display: flex;
  flex-direction: column;
  gap: .15rem;
  margin-top: auto;
  padding-top: .5rem;
  border-top: 1px solid rgba(255,255,255,.08);
}
.tshow-name {
  font-family: 'Inter', sans-serif;
  font-size: .85rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}
.tshow-meta {
  font-family: 'Inter', sans-serif;
  font-size: .7rem;
  color: rgba(255,255,255,.5);
  line-height: 1.3;
}
.tshow-trip {
  display: inline-flex;
  align-items: center;
  margin-top: .35rem;
  padding: .2rem .6rem;
  border-radius: 99px;
  background: rgba(16,185,129,.15);
  border: 1px solid rgba(16,185,129,.25);
  font-family: 'Inter', sans-serif;
  font-size: .62rem;
  font-weight: 700;
  color: #6ee7b7;
  letter-spacing: .04em;
  width: fit-content;
}

/* ── Controls ── */
.tshow-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: clamp(1.25rem, 2.5vw, 2rem);
}
.tshow-nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .25s cubic-bezier(.34,1.56,.64,1);
}
.tshow-nav-btn:hover {
  background: rgba(255,255,255,.15);
  border-color: rgba(255,255,255,.3);
  color: #fff;
  transform: scale(1.08);
}
.tshow-nav-btn:disabled {
  opacity: .3;
  cursor: not-allowed;
  transform: none;
}
.tshow-pause-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1.5px solid rgba(52,211,153,.3);
  background: rgba(52,211,153,.1);
  color: #34d399;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .25s ease;
}
.tshow-pause-btn:hover {
  background: rgba(52,211,153,.2);
  border-color: rgba(52,211,153,.5);
}

/* ── Dots ── */
.tshow-dots {
  display: flex;
  gap: .4rem;
  align-items: center;
}
.tshow-dot {
  height: .35rem;
  border-radius: 99px;
  border: none;
  cursor: pointer;
  transition: all .35s ease;
  padding: 0;
  position: relative;
  overflow: hidden;
}
.tshow-dot.active {
  width: 2rem;
  background: rgba(52,211,153,.25);
}
.tshow-dot:not(.active) {
  width: .35rem;
  background: rgba(255,255,255,.2);
}
.tshow-dot:not(.active):hover {
  background: rgba(255,255,255,.4);
}
.tshow-dot-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #34d399;
  border-radius: 99px;
  transition: width .3s linear;
}

/* ── Progress ring ── */
.tshow-progress-ring {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}
.tshow-progress-ring svg {
  transform: rotate(-90deg);
}
.tshow-progress-track {
  fill: none;
  stroke: rgba(255,255,255,.08);
  stroke-width: 2.5;
}
.tshow-progress-bar {
  fill: none;
  stroke: #34d399;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset .3s linear;
}
.tshow-progress-time {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: .55rem;
  font-weight: 700;
  color: rgba(255,255,255,.5);
}

/* ── Skeleton ── */
.tshow-skeleton-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.75rem;
}
.tshow-skeleton-card {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  animation: tshowSkeletonPulse 1.8s ease-in-out infinite;
}
@keyframes tshowSkeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
.tshow-skel-block {
  background: rgba(255,255,255,.08);
  border-radius: .4rem;
}

/* ── Responsive ── */
@media (max-width: 800px) {
  .tshow-pair {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .tshow-skeleton-pair {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 500px) {
  .tshow-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: .75rem;
    padding: 1rem;
  }
  .tshow-avatar-col {
    flex-direction: row;
    gap: .75rem;
  }
  .tshow-avatar-ring {
    width: 52px;
    height: 52px;
  }
  .tshow-person {
    align-items: center;
  }
  .tshow-trip {
    margin-left: auto;
    margin-right: auto;
  }
  .tshow-text {
    text-align: center;
  }
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  if (document.getElementById("tshow-styles")) { stylesInjected = true; return; }
  const el = document.createElement("style");
  el.id = "tshow-styles";
  el.textContent = TESTIMONIAL_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

/* ═══════════════════════════════════════════
   TYPEWRITER HOOK
═══════════════════════════════════════════ */
function useTypewriter(text, isActive, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    indexRef.current = 0;

    if (!isActive || !text) return;

    const maxLen = text.length;

    const tick = () => {
      indexRef.current += 1;
      if (indexRef.current <= maxLen) {
        setDisplayed(text.slice(0, indexRef.current));
        // Vary speed slightly for natural feel
        const char = text[indexRef.current - 1];
        const delay = /[.!?]/.test(char) ? speed * 6 : /[,;:]/.test(char) ? speed * 3 : speed;
        timerRef.current = setTimeout(tick, delay);
      } else {
        setIsDone(true);
      }
    };

    // Small initial delay before typing starts
    timerRef.current = setTimeout(tick, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, isActive, speed]);

  return { displayed, isDone };
}

/* ═══════════════════════════════════════════
   SINGLE TESTIMONIAL CARD
═══════════════════════════════════════════ */
const TestimonialCard = React.memo(function TestimonialCard({
  slide, isActive, typewriterSpeed,
}) {
  const truncated = useMemo(() => {
    if (!slide.quote) return "";
    return slide.quote.length > 220
      ? slide.quote.substring(0, 220).replace(/\s+\S*$/, "") + "…"
      : slide.quote;
  }, [slide.quote]);

  const { displayed, isDone } = useTypewriter(truncated, isActive, typewriterSpeed);

  return (
    <div className="tshow-card">
      {/* Avatar column */}
      <div className="tshow-avatar-col">
        <div className="tshow-avatar-ring">
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.name}
              className="tshow-avatar-img"
              loading="lazy"
            />
          ) : (
            <div className="tshow-avatar-init">
              {(slide.name || "G")[0]}
            </div>
          )}
        </div>
        <FaQuoteRight className="tshow-quote-icon" />
      </div>

      {/* Content column */}
      <div className="tshow-content">
        <div className="tshow-stars">
          {Array.from({ length: 5 }).map((_, i) =>
            i < (slide.rating || 5) ? (
              <FaStar key={i} className="tshow-star filled" />
            ) : (
              <FaRegStar key={i} className="tshow-star" />
            )
          )}
        </div>

        <div className="tshow-text">
          &ldquo;{isActive ? displayed : truncated}&rdquo;
          {isActive && !isDone && <span className="tshow-cursor" />}
        </div>

        <div className="tshow-person">
          <span className="tshow-name">{slide.name}</span>
          {slide.meta && <span className="tshow-meta">{slide.meta}</span>}
          {slide.trip && <span className="tshow-trip">{slide.trip}</span>}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   PROGRESS RING
═══════════════════════════════════════════ */
const ProgressRing = ({ progress, secondsLeft }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="tshow-progress-ring">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} className="tshow-progress-track" />
        <circle
          cx="20" cy="20" r={radius}
          className="tshow-progress-bar"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="tshow-progress-time">{secondsLeft}s</span>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════ */
const SkeletonPair = () => (
  <div className="tshow-skeleton-pair">
    {[0, 1].map((i) => (
      <div key={i} className="tshow-skeleton-card" style={{ animationDelay: `${i * .2}s` }}>
        <div style={{ flexShrink: 0 }}>
          <div className="tshow-skel-block" style={{ width: 68, height: 68, borderRadius: "50%" }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: ".6rem" }}>
          <div className="tshow-skel-block" style={{ height: 10, width: "35%" }} />
          <div className="tshow-skel-block" style={{ height: 10, width: "100%" }} />
          <div className="tshow-skel-block" style={{ height: 10, width: "90%" }} />
          <div className="tshow-skel-block" style={{ height: 10, width: "60%" }} />
          <div style={{ marginTop: "auto", paddingTop: ".5rem", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", gap: ".5rem", alignItems: "center" }}>
            <div className="tshow-skel-block" style={{ height: 12, width: "40%" }} />
            <div className="tshow-skel-block" style={{ height: 8, width: "25%" }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const SLIDE_DURATION = 20; // seconds per pair

const TestimonialShowcase = () => {
  useEffect(injectStyles, []);

  const { testimonials, loading } = useTestimonials("active=all");

  // Build slides
  const slides = useMemo(() => {
    if (loading || !testimonials?.length) return [];
    return testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      trip: t.trip,
      meta: [t.location, t.date_text].filter(Boolean).join(" · "),
      image: t.avatar_url || null,
      rating: parseInt(t.rating) || 5,
      quote: t.testimonial_text,
    }));
  }, [testimonials, loading]);

  // Build pairs
  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < slides.length; i += 2) {
      const pair = [slides[i]];
      if (slides[i + 1]) pair.push(slides[i + 1]);
      result.push(pair);
    }
    return result;
  }, [slides]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const pausedAtRef = useRef(0);
  const rafRef = useRef(null);

  const totalPairs = pairs.length;

  const goTo = useCallback((idx) => {
    setActiveIdx(idx);
    setProgress(0);
    startTimeRef.current = Date.now();
    pausedAtRef.current = 0;
  }, []);

  const goNext = useCallback(() => {
    goTo((activeIdx + 1) % totalPairs);
  }, [activeIdx, totalPairs, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIdx - 1 + totalPairs) % totalPairs);
  }, [activeIdx, totalPairs, goTo]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (!prev) {
        // Pausing: record how much progress has elapsed
        pausedAtRef.current = progress;
      } else {
        // Resuming: reset start time accounting for elapsed progress
        const elapsedMs = (pausedAtRef.current / 100) * SLIDE_DURATION * 1000;
        startTimeRef.current = Date.now() - elapsedMs;
      }
      return !prev;
    });
  }, [progress]);

  // Auto-advance timer
  useEffect(() => {
    if (totalPairs <= 0) return;

    const animate = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min((elapsed / (SLIDE_DURATION * 1000)) * 100, 100);
        setProgress(pct);
        if (pct >= 100) {
          goNext();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIdx, isPaused, totalPairs, goNext]);

  // Reset on slide change
  useEffect(() => {
    startTimeRef.current = Date.now();
    pausedAtRef.current = 0;
    setProgress(0);
  }, [activeIdx]);

  const secondsLeft = Math.max(0, Math.ceil(SLIDE_DURATION - (progress / 100) * SLIDE_DURATION));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === " ") { e.preventDefault(); togglePause(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext, togglePause]);

  // Typewriter speed — calculate so text finishes within ~60% of slide duration
  const typewriterSpeed = 28;

  if (loading) {
    return (
      <section className="tshow-section">
        <div className="tshow-container">
          <div className="tshow-header">
            <span className="tshow-eyebrow">Guest Experiences</span>
            <h2 className="tshow-title">Voices From the Field</h2>
            <p className="tshow-subtitle">
              Real stories from real travellers whose journeys became life-defining moments.
            </p>
          </div>
          <SkeletonPair />
        </div>
      </section>
    );
  }

  if (!slides.length) {
    return (
      <section className="tshow-section">
        <div className="tshow-container">
          <div className="tshow-header">
            <span className="tshow-eyebrow">Guest Experiences</span>
            <h2 className="tshow-title">Voices From the Field</h2>
            <p className="tshow-subtitle">
              Real stories from real travellers whose journeys became life-defining moments.
            </p>
          </div>
          <div style={{
            textAlign: "center",
            padding: "2rem 1rem",
            color: "rgba(255,255,255,.7)",
            fontFamily: "'Inter',sans-serif",
          }}>
            <p style={{ fontWeight: 600, color: "#fff", marginBottom: ".3rem" }}>
              No reviews yet
            </p>
            <p style={{ fontSize: ".85rem" }}>
              Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tshow-section" aria-label="Guest testimonials">
      <div className="tshow-container">
        {/* Header */}
        <div className="tshow-header">
          <span className="tshow-eyebrow">Guest Experiences</span>
          <h2 className="tshow-title">Voices From the Field</h2>
          <p className="tshow-subtitle">
            Real stories from real travellers whose journeys became life-defining moments.
          </p>
        </div>

        {/* Slideshow */}
        <div className="tshow-frame">
          {pairs.map((pair, pairIdx) => (
            <div
              key={pairIdx}
              className={`tshow-pair ${
                pairIdx === activeIdx
                  ? "tshow-pair--active"
                  : "tshow-pair--exit"
              }`}
              aria-hidden={pairIdx !== activeIdx}
            >
              {pair.map((slide, cardIdx) => (
                <TestimonialCard
                  key={slide.id || `${pairIdx}-${cardIdx}`}
                  slide={slide}
                  isActive={pairIdx === activeIdx}
                  typewriterSpeed={typewriterSpeed}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Controls */}
        {totalPairs > 1 && (
          <div className="tshow-controls">
            <button
              className="tshow-nav-btn"
              onClick={goPrev}
              aria-label="Previous testimonials"
            >
              <IoChevronBack size={16} />
            </button>

            <div className="tshow-dots">
              {pairs.map((_, i) => (
                <button
                  key={i}
                  className={`tshow-dot ${i === activeIdx ? "active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial pair ${i + 1}`}
                >
                  {i === activeIdx && (
                    <div
                      className="tshow-dot-fill"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>

            <ProgressRing progress={progress} secondsLeft={secondsLeft} />

            <button
              className="tshow-pause-btn"
              onClick={togglePause}
              aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
            >
              {isPaused ? <IoPlay size={14} /> : <IoPause size={14} />}
            </button>

            <button
              className="tshow-nav-btn"
              onClick={goNext}
              aria-label="Next testimonials"
            >
              <IoChevronForward size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialShowcase;