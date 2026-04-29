// src/components/EastAfricaFlags.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { useCountries } from "../../hooks/useCountries";

export default function EastAfricaFlags({ variant = "full" }) {
  const { countries: backendCountries, loading, error, refetch } = useCountries();

  // Generate countries with animation data from backend
  const countries =
    backendCountries?.slice(0, 6).map((country, index) => ({
      name: country.name,
      code:
        country.code ||
        country.slug ||
        country.name.toLowerCase().slice(0, 2),
      capital: country.capital || "Capital",
      delay: -index * 2,
      duration: 16 + index,
      idle: {
        ry: 3 + index * 0.5,
        sk: 0.3 + index * 0.1,
        rz: 0.3 + index * 0.1,
      },
      active: {
        ry: 14 + index * 2,
        sk: 1.5 + index * 0.3,
        rz: 1.6 + index * 0.3,
        z: 20 + index * 4,
      },
    })) || [];

  const containerRef = useRef(null);
  const scrollRef    = useRef(null);
  const dirRef       = useRef(1);

  const [activeFlag, setActiveFlag] = useState(null);
  const [isInView,   setIsInView]   = useState(false);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ── Mouse move 3-D tilt ─────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let posX = 0, posY = 0, targetX = 0, targetY = 0, rafId;

    const ease = (current, target, factor) =>
      current + (target - current) * factor;

    const update = () => {
      posX = ease(posX, targetX, 0.025);
      posY = ease(posY, targetY, 0.025);
      container.style.setProperty("--mx", `${posX.toFixed(3)}deg`);
      container.style.setProperty("--my", `${posY.toFixed(3)}deg`);
      rafId = requestAnimationFrame(update);
    };

    const onMove = (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) *  4;
      targetY = (e.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Intersection observer (visibility) ─────────────────────────────────
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => setIsInView(!!entry?.isIntersecting),
      { threshold: 0.2, rootMargin: "120px 0px 120px 0px" }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (reduceMotion || !isInView) return;

    const scroller = scrollRef.current;
    if (!scroller) return;

    let rafId = 0;
    const speedPxPerSec = 70;
    let lastTs = 0, pauseUntil = 0;

    // Alternate direction each time the component enters view
    dirRef.current = dirRef.current * -1;

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;

      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) { rafId = requestAnimationFrame(tick); return; }

      if (pauseUntil && ts < pauseUntil) { rafId = requestAnimationFrame(tick); return; }
      pauseUntil = 0;

      const dt    = Math.min(40, ts - lastTs) / 1000;
      lastTs      = ts;
      const delta = speedPxPerSec * dt * dirRef.current;
      const next  = scroller.scrollLeft + delta;

      if (next <= 0) {
        scroller.scrollLeft = 0;
        dirRef.current      = 1;
        pauseUntil          = ts + 550;
      } else if (next >= max) {
        scroller.scrollLeft = max;
        dirRef.current      = -1;
        pauseUntil          = ts + 550;
      } else {
        scroller.scrollLeft = next;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, reduceMotion]);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading && backendCountries.length === 0) {
    return (
      <section
        ref={containerRef}
        className={`flags-section ${variant === "flush" ? "flush" : ""}`}
      >
        <div className="flags-row" aria-label="Countries loading">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flag-card-skeleton">
              <div className="skeleton-content">
                <div className="skeleton-flag" />
                <div className="skeleton-info">
                  <div className="skeleton-name" />
                  <div className="skeleton-capital" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <style>{skeletonStyles}</style>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error && backendCountries.length === 0) {
    return (
      <section
        ref={containerRef}
        className={`flags-section ${variant === "flush" ? "flush" : ""}`}
      >
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "16px",
            padding:        "40px 20px",
            color:          "rgba(255,255,255,0.7)",
            textAlign:      "center",
          }}
        >
          <FiWifiOff size={32} />
          <p>Unable to load countries</p>
          <button
            onClick={refetch}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
              padding:      "10px 20px",
              background:   "rgba(255,255,255,0.1)",
              border:       "1px solid rgba(255,255,255,0.2)",
              borderRadius: "20px",
              color:        "white",
              cursor:       "pointer",
              fontSize:     "14px",
            }}
          >
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      </section>
    );
  }

  // ── Normal render ───────────────────────────────────────────────────────
  return (
    <section
      ref={containerRef}
      className={`flags-section ${variant === "flush" ? "flush" : ""}`}
    >
      <style>{styles}</style>

      {/* SVG Filters */}
      <svg className="filters" aria-hidden="true">
        <defs>
          {countries.map((c, i) => (
            <React.Fragment key={c.code}>
              <filter
                id={`f-idle-${c.code}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.003 0.001"
                  numOctaves="2"
                  seed={i * 31 + 13}
                  result="n"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur={`${c.duration * 2.5}s`}
                    values="0.003 0.001;0.002 0.0012;0.003 0.001"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="n"
                  scale="1.5"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              <filter
                id={`f-hover-${c.code}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.006 0.002"
                  numOctaves="3"
                  seed={i * 31 + 13}
                  result="n"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="5s"
                    values="0.006 0.002;0.004 0.003;0.006 0.002"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="n"
                  scale="4"
                  xChannelSelector="R"
                  yChannelSelector="G"
                >
                  <animate
                    attributeName="scale"
                    dur="3s"
                    values="4;6;4"
                    repeatCount="indefinite"
                  />
                </feDisplacementMap>
              </filter>
            </React.Fragment>
          ))}
        </defs>
      </svg>

      {/* Flags Row */}
      <div ref={scrollRef} className="flags-row" aria-label="Countries">
        {countries.map((country, idx) => (
          <Link
            key={country.code}
            to={`/country/${country.name.toLowerCase().replace(/ /g, "-")}`}
            className={`flag-card ${activeFlag === country.code ? "active" : ""}`}
            style={{
              "--d":     `${country.delay}s`,
              "--t":     `${country.duration}s`,
              "--fi":    `url(#f-idle-${country.code})`,
              "--fh":    `url(#f-hover-${country.code})`,
              "--enter": `${idx * 80 + 100}ms`,
            }}
            onMouseEnter={() => setActiveFlag(country.code)}
            onMouseLeave={() => setActiveFlag(null)}
            aria-label={`Flag of ${country.name}`}
          >
            <div className="card-content">
              <div className="scene">
                <div className="flag">
                  <div className="cloth">
                    <img
                      src={`https://flagcdn.com/w1280/${country.code}.png`}
                      srcSet={`
                        https://flagcdn.com/w640/${country.code}.png 640w,
                        https://flagcdn.com/w1280/${country.code}.png 1280w
                      `}
                      sizes="280px"
                      alt={`${country.name} flag`}
                      className="flag-img"
                      draggable="false"
                    />
                    <div className="cloth-overlay" />
                    <div className="cloth-shine" />
                    <div className="cloth-edge" />
                  </div>
                </div>
                <div className="flag-shadow" />
              </div>
            </div>

            <div className="card-border" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Skeleton styles ───────────────────────────────────────────────────────────
const skeletonStyles = `
  .flag-card-skeleton {
    flex-shrink: 0;
    width: 280px;
  }
  .skeleton-content {
    padding: 1.5rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
  }
  .skeleton-flag {
    width: 100%;
    aspect-ratio: 3/2;
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.05) 25%,
      rgba(255,255,255,0.1)  50%,
      rgba(255,255,255,0.05) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 10px;
  }
  .skeleton-info {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .skeleton-name {
    height: 16px;
    width: 70%;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
  .skeleton-capital {
    height: 12px;
    width: 50%;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
  }
  @keyframes shimmer {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// ── Component styles ──────────────────────────────────────────────────────────
const styles = `
/* =============================================
   BASE
============================================= */
* { box-sizing: border-box; margin: 0; padding: 0; }

.filters {
  position: absolute;
  width: 0; height: 0;
  visibility: hidden;
  pointer-events: none;
}

/* =============================================
   SECTION
============================================= */
.flags-section {
  --mx: 0deg;
  --my: 0deg;

  position: relative;
  min-height: 1vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  background: transparent;
  justify-content: center;
  backdrop-filter: blur(20px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0;
}

.flags-section.flush {
  min-height: auto;
  justify-content: flex-start;
  padding: 0;
}

.flags-section.flush .header {
  padding: 0 2rem 1.25rem;
}

/* =============================================
   HEADER
============================================= */
.header { text-align: center; padding: 0 2rem 2rem; }

.header-tag {
  display: inline-block;
  padding: 0.4rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 100px;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.03);
}

.header-title {
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: rgba(255,255,255,0.95);
  margin-bottom: 0.5rem;
}

.header-desc {
  font-size: clamp(0.85rem, 2vw, 1rem);
  color: rgba(255,255,255,0.4);
  font-weight: 400;
}

/* =============================================
   SCROLL CONTROLS
============================================= */
.scroll-controls {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.scroll-btn:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.9);
  transform: scale(1.05);
}

/* =============================================
   FLAGS ROW
============================================= */
.flags-row {
  display: flex;
  gap: 1.25rem;
  padding: 0;
  overflow-x: auto;
  overflow-y: visible;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.flags-row::-webkit-scrollbar       { height: 6px; }
.flags-row::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 3px; }
.flags-row::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1);  border-radius: 3px; }
.flags-row::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* =============================================
   FLAG CARD
============================================= */
.flag-card {
  position: relative;
  flex-shrink: 0;
  width: 280px;
  text-decoration: none;
  cursor: pointer;
  scroll-snap-align: center;
  opacity: 0;
  transform: translateY(20px);
  animation: cardEnter 0.6s ease forwards;
  animation-delay: var(--enter);
}

.card-content {
  position: relative;
  padding: 1.5rem;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.flag-card:hover .card-content,
.flag-card.active .card-content {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-6px);
}

.card-border {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.1) 0%,
    transparent 50%,
    rgba(255,255,255,0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: -1;
}

.flag-card:hover .card-border,
.flag-card.active .card-border { opacity: 1; }

/* =============================================
   SCENE / FLAG / CLOTH
============================================= */
.scene {
  position: relative;
  width: 100%;
  margin-bottom: 1.25rem;
  perspective: 1200px;
  transform-style: preserve-3d;
}

.flag {
  width: 100%;
  transform-style: preserve-3d;
  transform: rotateX(var(--my)) rotateY(var(--mx));
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.cloth {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  transform-origin: 0% 50%;
  overflow: hidden;
  border-radius: 10px;
  filter: var(--fi);
  animation: waveIdle calc(var(--t) * 0.9) ease-in-out infinite;
  animation-delay: var(--d);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1);
  transition: filter 1s ease, box-shadow 0.5s ease;
}

.flag-card.active .cloth {
  filter: var(--fh);
  animation: waveActive 5s ease-in-out infinite;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3), 0 10px 25px rgba(0,0,0,0.2);
}

.flag-img {
  width: 100%; height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.cloth-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.12) 0%,
    transparent 20%,
    transparent 80%,
    rgba(0,0,0,0.08) 100%
  );
  pointer-events: none;
}

.cloth-shine {
  position: absolute; inset: 0;
  background: linear-gradient(
    110deg,
    transparent 30%,
    rgba(255,255,255,0.08) 45%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.08) 55%,
    transparent 70%
  );
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.flag-card.active .cloth-shine {
  opacity: 1;
  animation: shineMove 2s ease-in-out infinite;
}

.cloth-edge {
  position: absolute; inset: 0;
  box-shadow:
    inset 2px 0  10px rgba(0,0,0,0.15),
    inset 0  2px 6px  rgba(0,0,0,0.1),
    inset 0 -2px 6px  rgba(0,0,0,0.1);
  border-radius: 10px;
  pointer-events: none;
}

/* =============================================
   FLAG SHADOW
============================================= */
.flag-shadow {
  position: absolute;
  bottom: -15px; left: 10%; right: 10%;
  height: 20px;
  background: radial-gradient(
    ellipse 60% 40% at center,
    rgba(0,0,0,0.25) 0%,
    transparent 70%
  );
  filter: blur(6px);
  opacity: 0.7;
  animation: shadowPulse var(--t) ease-in-out infinite;
  animation-delay: var(--d);
}

/* =============================================
   INFO
============================================= */
.info { text-align: center; margin-bottom: 1rem; }

.info-name {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: rgba(255,255,255,0.9);
  margin-bottom: 0.2rem;
  transition: color 0.3s ease;
}

.flag-card.active .info-name { color: #fff; }

.info-capital {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.02em;
}

/* =============================================
   ACTION
============================================= */
.action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.5);
  transition: all 0.3s ease;
}

.action svg { transition: transform 0.3s ease; }

.flag-card:hover .action,
.flag-card.active .action {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.9);
}

.flag-card:hover .action svg,
.flag-card.active .action svg { transform: translateX(3px); }

/* =============================================
   SCROLL HINT
============================================= */
.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.25);
}

.scroll-hint svg { animation: arrowBounce 1.5s ease-in-out infinite; }

/* =============================================
   ANIMATIONS
============================================= */
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(25px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes waveIdle {
  0%,100% { transform: rotateY(0deg)    skewY(0deg)     scaleX(1);     }
  25%     { transform: rotateY(-2.5deg) skewY(-0.3deg)  scaleX(1.005); }
  50%     { transform: rotateY(2deg)    skewY(0.25deg)  scaleX(0.995); }
  75%     { transform: rotateY(-1.5deg) skewY(-0.2deg)  scaleX(1.003); }
}

@keyframes waveActive {
  0%,100% { transform: rotateY(0deg)  scaleX(1);     }
  25%     { transform: rotateY(-8deg) scaleX(1.01);  }
  50%     { transform: rotateY(6deg)  scaleX(0.99);  }
  75%     { transform: rotateY(-5deg) scaleX(1.008); }
}

@keyframes shadowPulse {
  0%,100% { transform: scaleX(1);   opacity: 0.6; }
  50%     { transform: scaleX(1.1); opacity: 0.8; }
}

@keyframes shineMove {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%);  }
}

@keyframes arrowBounce {
  0%,100% { transform: translateX(0);   }
  50%     { transform: translateX(5px); }
}

/* =============================================
   RESPONSIVE
============================================= */
@media (max-width: 1024px) {
  .flag-card  { width: 260px; }
  .flags-row  { padding: 1.5rem 2rem; gap: 1.25rem; }
}

@media (max-width: 768px) {
  .header        { padding: 0 1.5rem 1.5rem; }
  .scroll-controls { margin-bottom: 1rem; }
  .scroll-btn    { width: 40px; height: 40px; }
  .flag-card     { width: 240px; }
  .card-content  { padding: 1.25rem; border-radius: 16px; }
  .flags-row     { padding: 1.5rem; gap: 1rem; }
  .info-name     { font-size: 1rem; }
  .action        { padding: 0.55rem 1rem; font-size: 0.65rem; }
}

@media (max-width: 480px) {
  .flags-section { padding: 1rem 0; }
  .header-title  { font-size: 1.5rem; }
  .flag-card     { width: 220px; }
  .card-content  { padding: 1rem; border-radius: 14px; }
  .flags-row     { padding: 1rem; gap: 0.75rem; }
  .scroll-hint   { padding: 1rem; font-size: 0.7rem; }
}

/* =============================================
   REDUCED MOTION
============================================= */
@media (prefers-reduced-motion: reduce) {
  .cloth,
  .flag-shadow,
  .cloth-shine,
  .scroll-hint svg { animation: none !important; }

  .flag-card {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;