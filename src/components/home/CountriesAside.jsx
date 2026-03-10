import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const countries = [
  { name: "Rwanda", code: "rw", delay: 0, duration: 18 },
  { name: "Kenya", code: "ke", delay: -4, duration: 16 },
  { name: "Tanzania", code: "tz", delay: -8, duration: 19 },
  { name: "Uganda", code: "ug", delay: -2.5, duration: 17 },
  { name: "Ethiopia", code: "et", delay: -6, duration: 18.5 },
  { name: "Djibouti", code: "dj", delay: -10, duration: 17.5 }
];

export default function EastAfricaFlags() {
  const containerRef = useRef(null);
  const [activeFlag, setActiveFlag] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    let posX = 0, posY = 0;
    let targetX = 0, targetY = 0;
    let rafId;

    const ease = (current, target, factor) => current + (target - current) * factor;

    const update = () => {
      posX = ease(posX, targetX, 0.03);
      posY = ease(posY, targetY, 0.03);
      container.style.setProperty("--mx", `${posX.toFixed(3)}deg`);
      container.style.setProperty("--my", `${posY.toFixed(3)}deg`);
      rafId = requestAnimationFrame(update);
    };

    const onMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 5;
      targetY = (e.clientY / window.innerHeight - 0.5) * -3;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={containerRef} className="flags">
      <style>{styles}</style>

      {/* Filters */}
      <svg className="filters" aria-hidden="true">
        <defs>
          {countries.map((c, i) => (
            <React.Fragment key={c.code}>
              <filter id={`f-idle-${c.code}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.004 0.001"
                  numOctaves="2"
                  seed={i * 31 + 13}
                  result="n"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur={`${c.duration * 2.5}s`}
                    values="0.004 0.001;0.003 0.0015;0.004 0.001"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id={`f-hover-${c.code}`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.008 0.003"
                  numOctaves="3"
                  seed={i * 31 + 13}
                  result="n"
                >
                  <animate
                    attributeName="baseFrequency"
                    dur="6s"
                    values="0.008 0.003;0.005 0.004;0.008 0.003"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G">
                  <animate
                    attributeName="scale"
                    dur="4s"
                    values="5;7;5"
                    repeatCount="indefinite"
                  />
                </feDisplacementMap>
              </filter>
            </React.Fragment>
          ))}
        </defs>
      </svg>

      {/* Grid */}
      <div className="grid">
        {countries.map((country) => (
          <Link
            key={country.code}
            to={`/country/${country.name.toLowerCase()}`}
            className={`card ${activeFlag === country.code ? "active" : ""}`}
            style={{
              "--d": `${country.delay}s`,
              "--t": `${country.duration}s`,
              "--fi": `url(#f-idle-${country.code})`,
              "--fh": `url(#f-hover-${country.code})`
            }}
            onMouseEnter={() => setActiveFlag(country.code)}
            onMouseLeave={() => setActiveFlag(null)}
            aria-label={`Flag of ${country.name}`}
          >
            <div className="scene">
              <div className="flag">
                <div className="cloth">
                  <img
                    src={`https://flagcdn.com/w640/${country.code}.png`}
                    srcSet={`https://flagcdn.com/w1280/${country.code}.png 2x`}
                    alt=""
                    className="img"
                    draggable="false"
                  />

                  {/* Shadows */}
                  <div className="shadow s1"></div>
                  <div className="shadow s2"></div>
                  <div className="shadow s3"></div>
                  <div className="shadow s4"></div>
                  <div className="shadow s5"></div>

                  {/* Highlights */}
                  <div className="light l1"></div>
                  <div className="light l2"></div>
                  <div className="light l3"></div>
                  <div className="light l4"></div>

                  {/* Sheen */}
                  <div className="sheen"></div>

                  {/* Texture & Depth */}
                  <div className="weave"></div>
                  <div className="edge"></div>
                </div>
              </div>

              {/* Ground Shadow */}
              <div className="ground"></div>
            </div>

            {/* Tooltip */}
            <div className="tip">
              <span className="tip-text">{country.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const styles = `
/* =============================================
   RESET & UTILITIES
============================================= */
.filters {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  visibility: hidden;
}

/* =============================================
   CONTAINER
============================================= */
.flags {
  --mx: 0deg;
  --my: 0deg;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 3rem;
  background: 
    radial-gradient(circle at 20% 30%, #f8fafc 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #f1f5f9 0%, transparent 50%),
    linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  position: relative;
}

/* =============================================
   GRID
============================================= */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6rem 5rem;
  max-width: 1600px;
  width: 100%;
}

/* =============================================
   CARD (Link Wrapper)
============================================= */
.card {
  --d: 0s;
  --t: 18s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.card:focus-visible .cloth {
  outline: 3px solid #3b82f6;
  outline-offset: 12px;
}

/* =============================================
   SCENE (3D Container)
============================================= */
.scene {
  position: relative;
  width: 100%;
  max-width: 380px;
  perspective: 1800px;
  transform-style: preserve-3d;
}

/* =============================================
   FLAG (Rotation Handler)
============================================= */
.flag {
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transform: rotateX(var(--my)) rotateY(var(--mx));
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}

/* =============================================
   CLOTH (The Animated Flag)
============================================= */
.cloth {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  transform-origin: 0% 50%;
  overflow: hidden;
  filter: var(--fi);
  animation: wave var(--t) cubic-bezier(0.35, 0, 0.25, 1) infinite;
  animation-delay: var(--d);
  transition: 
    filter 1.5s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 1s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, filter;
  backface-visibility: hidden;
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.18),
    0 15px 30px -10px rgba(0, 0, 0, 0.12),
    0 5px 10px -3px rgba(0, 0, 0, 0.08);
}

.card.active .cloth {
  filter: var(--fh);
  animation-name: waveActive;
  animation-duration: 6s;
  box-shadow:
    0 45px 90px -20px rgba(0, 0, 0, 0.28),
    0 25px 50px -15px rgba(0, 0, 0, 0.18),
    0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

/* =============================================
   IMAGE
============================================= */
.img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* =============================================
   SHADOWS (Rolling Wave Shadows)
============================================= */
.shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.4;
  transition: opacity 1s ease;
}

.card.active .shadow {
  opacity: 1;
}

.s1 {
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.22) 0%,
    transparent 8%,
    rgba(0,0,0,0.18) 16%,
    transparent 24%,
    rgba(0,0,0,0.2) 32%,
    transparent 40%,
    rgba(0,0,0,0.16) 48%,
    transparent 56%,
    rgba(0,0,0,0.19) 64%,
    transparent 72%,
    rgba(0,0,0,0.15) 80%,
    transparent 88%,
    rgba(0,0,0,0.12) 96%,
    transparent 100%
  );
  background-size: 600% 100%;
  animation: shadowRoll var(--t) linear infinite;
  animation-delay: var(--d);
}

.s2 {
  background: linear-gradient(
    92deg,
    transparent 4%,
    rgba(0,0,0,0.14) 12%,
    transparent 20%,
    rgba(0,0,0,0.18) 30%,
    transparent 40%,
    rgba(0,0,0,0.12) 52%,
    transparent 62%,
    rgba(0,0,0,0.16) 74%,
    transparent 84%,
    rgba(0,0,0,0.1) 94%
  );
  background-size: 550% 100%;
  animation: shadowRoll calc(var(--t) * 0.85) linear infinite;
  animation-delay: calc(var(--d) - 2.5s);
}

.s3 {
  background: linear-gradient(
    88deg,
    rgba(0,0,0,0.1) 0%,
    transparent 10%,
    rgba(0,0,0,0.15) 22%,
    transparent 34%,
    rgba(0,0,0,0.12) 46%,
    transparent 58%,
    rgba(0,0,0,0.18) 70%,
    transparent 82%,
    rgba(0,0,0,0.08) 94%
  );
  background-size: 520% 100%;
  animation: shadowRoll calc(var(--t) * 1.15) linear infinite;
  animation-delay: calc(var(--d) - 5s);
}

.s4 {
  background: linear-gradient(
    91deg,
    transparent 6%,
    rgba(0,0,0,0.12) 18%,
    transparent 30%,
    rgba(0,0,0,0.16) 44%,
    transparent 58%,
    rgba(0,0,0,0.1) 72%,
    transparent 86%,
    rgba(0,0,0,0.14) 98%
  );
  background-size: 480% 100%;
  animation: shadowRoll calc(var(--t) * 0.95) linear infinite;
  animation-delay: calc(var(--d) - 7.5s);
}

.s5 {
  background: linear-gradient(
    89deg,
    rgba(0,0,0,0.08) 2%,
    transparent 14%,
    rgba(0,0,0,0.14) 28%,
    transparent 42%,
    rgba(0,0,0,0.1) 56%,
    transparent 70%,
    rgba(0,0,0,0.16) 84%,
    transparent 98%
  );
  background-size: 560% 100%;
  animation: shadowRoll calc(var(--t) * 1.05) linear infinite;
  animation-delay: calc(var(--d) - 3.5s);
}

/* =============================================
   HIGHLIGHTS (Light on Peaks)
============================================= */
.light {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: soft-light;
  opacity: 0.25;
  transition: opacity 1s ease;
}

.card.active .light {
  opacity: 0.8;
}

.l1 {
  background: linear-gradient(
    88deg,
    transparent 0%,
    rgba(255,255,255,0.45) 10%,
    transparent 20%,
    rgba(255,255,255,0.35) 30%,
    transparent 40%,
    rgba(255,255,255,0.4) 50%,
    transparent 60%,
    rgba(255,255,255,0.3) 70%,
    transparent 80%,
    rgba(255,255,255,0.38) 90%,
    transparent 100%
  );
  background-size: 600% 100%;
  animation: lightRoll var(--t) linear infinite;
  animation-delay: calc(var(--d) - 1s);
}

.l2 {
  background: linear-gradient(
    91deg,
    rgba(255,255,255,0.25) 5%,
    transparent 15%,
    rgba(255,255,255,0.4) 28%,
    transparent 40%,
    rgba(255,255,255,0.32) 55%,
    transparent 68%,
    rgba(255,255,255,0.38) 82%,
    transparent 95%
  );
  background-size: 580% 100%;
  animation: lightRoll calc(var(--t) * 0.9) linear infinite;
  animation-delay: calc(var(--d) - 4s);
}

.l3 {
  background: linear-gradient(
    87deg,
    transparent 8%,
    rgba(255,255,255,0.35) 20%,
    transparent 32%,
    rgba(255,255,255,0.42) 48%,
    transparent 62%,
    rgba(255,255,255,0.28) 78%,
    transparent 92%
  );
  background-size: 540% 100%;
  animation: lightRoll calc(var(--t) * 1.1) linear infinite;
  animation-delay: calc(var(--d) - 6.5s);
}

.l4 {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.2) 2%,
    transparent 12%,
    rgba(255,255,255,0.38) 26%,
    transparent 38%,
    rgba(255,255,255,0.3) 52%,
    transparent 66%,
    rgba(255,255,255,0.4) 80%,
    transparent 94%
  );
  background-size: 620% 100%;
  animation: lightRoll calc(var(--t) * 0.95) linear infinite;
  animation-delay: calc(var(--d) - 2s);
}

/* =============================================
   SHEEN (Glossy Sweep)
============================================= */
.sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 0%,
    transparent 30%,
    rgba(255,255,255,0.06) 38%,
    rgba(255,255,255,0.18) 50%,
    rgba(255,255,255,0.06) 62%,
    transparent 70%,
    transparent 100%
  );
  transform: translateX(-120%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.card.active .sheen {
  opacity: 1;
  animation: sheenSweep 3.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

/* =============================================
   WEAVE (Fabric Texture)
============================================= */
.weave {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.018;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* =============================================
   EDGE (Depth Effect)
============================================= */
.edge {
  position: absolute;
  inset: 0;
  box-shadow: 
    inset 3px 0 20px rgba(0, 0, 0, 0.15),
    inset 0 3px 15px rgba(0, 0, 0, 0.08),
    inset 0 -3px 15px rgba(0, 0, 0, 0.1),
    inset -1px 0 8px rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

/* =============================================
   GROUND SHADOW
============================================= */
.ground {
  position: absolute;
  bottom: -35px;
  left: 5%;
  right: 5%;
  height: 50px;
  background: radial-gradient(
    ellipse 55% 40% at center,
    rgba(0, 0, 0, 0.28) 0%,
    rgba(0, 0, 0, 0.15) 35%,
    rgba(0, 0, 0, 0.05) 60%,
    transparent 75%
  );
  filter: blur(14px);
  transform-origin: center top;
  animation: groundPulse var(--t) ease-in-out infinite;
  animation-delay: var(--d);
  opacity: 0.75;
  transition: opacity 0.8s ease;
}

.card.active .ground {
  opacity: 1;
  animation-name: groundPulseActive;
  animation-duration: 6s;
}

/* =============================================
   TOOLTIP
============================================= */
.tip {
  position: absolute;
  bottom: -70px;
  left: 50%;
  transform: translateX(-50%) translateY(20px) scale(0.9);
  opacity: 0;
  pointer-events: none;
  transition: 
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 100;
}

.card.active .tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.tip-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 2rem;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  border-radius: 10px;
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.35),
    0 5px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
}

.tip-text::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #0f172a;
}

/* =============================================
   WAVE KEYFRAMES
============================================= */
@keyframes wave {
  0%, 100% {
    transform: 
      rotateY(0deg) 
      rotateZ(0deg) 
      rotateX(0deg)
      skewY(0deg) 
      scaleX(1);
  }
  10% {
    transform: 
      rotateY(-4deg) 
      rotateZ(0.5deg) 
      rotateX(-0.3deg)
      skewY(-0.5deg) 
      scaleX(1.006);
  }
  20% {
    transform: 
      rotateY(3deg) 
      rotateZ(-0.35deg) 
      rotateX(0.2deg)
      skewY(0.35deg) 
      scaleX(0.997);
  }
  30% {
    transform: 
      rotateY(-3.5deg) 
      rotateZ(0.4deg) 
      rotateX(-0.25deg)
      skewY(-0.4deg) 
      scaleX(1.004);
  }
  40% {
    transform: 
      rotateY(2.5deg) 
      rotateZ(-0.3deg) 
      rotateX(0.15deg)
      skewY(0.3deg) 
      scaleX(0.998);
  }
  50% {
    transform: 
      rotateY(-2deg) 
      rotateZ(0.25deg) 
      rotateX(-0.15deg)
      skewY(-0.25deg) 
      scaleX(1.003);
  }
  60% {
    transform: 
      rotateY(3deg) 
      rotateZ(-0.35deg) 
      rotateX(0.2deg)
      skewY(0.35deg) 
      scaleX(0.996);
  }
  70% {
    transform: 
      rotateY(-3deg) 
      rotateZ(0.35deg) 
      rotateX(-0.2deg)
      skewY(-0.35deg) 
      scaleX(1.005);
  }
  80% {
    transform: 
      rotateY(2deg) 
      rotateZ(-0.25deg) 
      rotateX(0.12deg)
      skewY(0.25deg) 
      scaleX(0.998);
  }
  90% {
    transform: 
      rotateY(-1.5deg) 
      rotateZ(0.18deg) 
      rotateX(-0.1deg)
      skewY(-0.18deg) 
      scaleX(1.002);
  }
}

@keyframes waveActive {
  0%, 100% {
    transform: 
      rotateY(0deg) 
      rotateZ(0deg) 
      rotateX(0deg)
      skewY(0deg) 
      scaleX(1)
      translateZ(0);
  }
  8% {
    transform: 
      rotateY(-15deg) 
      rotateZ(2deg) 
      rotateX(-1.5deg)
      skewY(-2deg) 
      scaleX(1.018)
      translateZ(20px);
  }
  18% {
    transform: 
      rotateY(10deg) 
      rotateZ(-1.4deg) 
      rotateX(1deg)
      skewY(1.4deg) 
      scaleX(0.988)
      translateZ(30px);
  }
  28% {
    transform: 
      rotateY(-12deg) 
      rotateZ(1.8deg) 
      rotateX(-1.2deg)
      skewY(-1.8deg) 
      scaleX(1.014)
      translateZ(18px);
  }
  38% {
    transform: 
      rotateY(13deg) 
      rotateZ(-1.6deg) 
      rotateX(1.3deg)
      skewY(1.6deg) 
      scaleX(0.992)
      translateZ(35px);
  }
  48% {
    transform: 
      rotateY(-10deg) 
      rotateZ(1.4deg) 
      rotateX(-1deg)
      skewY(-1.4deg) 
      scaleX(1.01)
      translateZ(22px);
  }
  58% {
    transform: 
      rotateY(11deg) 
      rotateZ(-1.5deg) 
      rotateX(1.1deg)
      skewY(1.5deg) 
      scaleX(0.99)
      translateZ(28px);
  }
  68% {
    transform: 
      rotateY(-13deg) 
      rotateZ(1.7deg) 
      rotateX(-1.3deg)
      skewY(-1.7deg) 
      scaleX(1.016)
      translateZ(15px);
  }
  78% {
    transform: 
      rotateY(9deg) 
      rotateZ(-1.2deg) 
      rotateX(0.9deg)
      skewY(1.2deg) 
      scaleX(0.994)
      translateZ(25px);
  }
  88% {
    transform: 
      rotateY(-7deg) 
      rotateZ(1deg) 
      rotateX(-0.7deg)
      skewY(-1deg) 
      scaleX(1.008)
      translateZ(12px);
  }
}

/* =============================================
   SHADOW ROLL KEYFRAMES
============================================= */
@keyframes shadowRoll {
  0% { background-position: 600% 0; }
  100% { background-position: -200% 0; }
}

/* =============================================
   LIGHT ROLL KEYFRAMES
============================================= */
@keyframes lightRoll {
  0% { background-position: 600% 0; }
  100% { background-position: -200% 0; }
}

/* =============================================
   SHEEN SWEEP
============================================= */
@keyframes sheenSweep {
  0% { 
    transform: translateX(-120%); 
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% { 
    transform: translateX(220%); 
    opacity: 0;
  }
}

/* =============================================
   GROUND SHADOW KEYFRAMES
============================================= */
@keyframes groundPulse {
  0%, 100% {
    transform: scaleX(1) scaleY(1);
    opacity: 0.65;
  }
  20% {
    transform: scaleX(1.12) scaleY(1.15);
    opacity: 0.8;
  }
  40% {
    transform: scaleX(0.96) scaleY(0.92);
    opacity: 0.6;
  }
  60% {
    transform: scaleX(1.08) scaleY(1.1);
    opacity: 0.75;
  }
  80% {
    transform: scaleX(0.98) scaleY(0.96);
    opacity: 0.65;
  }
}

@keyframes groundPulseActive {
  0%, 100% {
    transform: scaleX(1) scaleY(1) translateX(0);
    opacity: 0.85;
  }
  12% {
    transform: scaleX(1.25) scaleY(1.35) translateX(18px);
    opacity: 1;
  }
  28% {
    transform: scaleX(0.92) scaleY(0.88) translateX(-12px);
    opacity: 0.7;
  }
  44% {
    transform: scaleX(1.2) scaleY(1.28) translateX(15px);
    opacity: 0.95;
  }
  60% {
    transform: scaleX(0.95) scaleY(0.92) translateX(-8px);
    opacity: 0.75;
  }
  76% {
    transform: scaleX(1.15) scaleY(1.22) translateX(10px);
    opacity: 0.9;
  }
  88% {
    transform: scaleX(0.98) scaleY(0.95) translateX(-5px);
    opacity: 0.8;
  }
}

/* =============================================
   RESPONSIVE: ULTRA-WIDE
============================================= */
@media (min-width: 1800px) {
  .flags {
    padding: 7rem 5rem;
  }
  .grid {
    gap: 7rem 6rem;
    max-width: 1900px;
  }
  .scene {
    max-width: 440px;
  }
  .tip-text {
    font-size: 1.05rem;
    padding: 1rem 2.4rem;
  }
}

/* =============================================
   RESPONSIVE: LARGE DESKTOP
============================================= */
@media (max-width: 1500px) {
  .grid {
    gap: 5rem 4rem;
  }
  .scene {
    max-width: 350px;
  }
}

/* =============================================
   RESPONSIVE: DESKTOP
============================================= */
@media (max-width: 1280px) {
  .flags {
    padding: 4rem 2.5rem;
  }
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 5rem 4rem;
  }
  .scene {
    max-width: 380px;
  }
}

/* =============================================
   RESPONSIVE: TABLET
============================================= */
@media (max-width: 1024px) {
  .grid {
    gap: 4rem 3rem;
  }
  .scene {
    max-width: 340px;
  }
  .tip {
    bottom: -60px;
  }
  .tip-text {
    font-size: 0.85rem;
    padding: 0.7rem 1.5rem;
    letter-spacing: 0.12em;
  }
}

/* =============================================
   RESPONSIVE: TABLET PORTRAIT
============================================= */
@media (max-width: 860px) {
  .flags {
    padding: 3rem 2rem;
  }
  .grid {
    gap: 3.5rem 2.5rem;
  }
  .scene {
    max-width: 300px;
  }
  .ground {
    bottom: -25px;
    height: 35px;
    filter: blur(10px);
  }
  .tip {
    bottom: -52px;
  }
  .tip-text {
    font-size: 0.78rem;
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
  }
  .tip-text::before {
    border-width: 8px;
    top: -8px;
  }
}

/* =============================================
   RESPONSIVE: LARGE MOBILE
============================================= */
@media (max-width: 680px) {
  .flags {
    padding: 2.5rem 1.5rem;
  }
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem 1.5rem;
  }
  .scene {
    max-width: 100%;
  }
  .cloth {
    box-shadow:
      0 20px 40px -12px rgba(0, 0, 0, 0.15),
      0 10px 20px -8px rgba(0, 0, 0, 0.1);
  }
  .card.active .cloth {
    box-shadow:
      0 30px 60px -15px rgba(0, 0, 0, 0.22),
      0 15px 30px -10px rgba(0, 0, 0, 0.14);
  }
  .ground {
    bottom: -20px;
    height: 28px;
  }
  .tip {
    bottom: -48px;
  }
  .tip-text {
    font-size: 0.72rem;
    padding: 0.5rem 1rem;
    letter-spacing: 0.1em;
  }
}

/* =============================================
   RESPONSIVE: MOBILE
============================================= */
@media (max-width: 540px) {
  .flags {
    padding: 2rem 1rem;
  }
  .grid {
    gap: 2.5rem 1rem;
  }
  .ground {
    bottom: -16px;
    height: 22px;
    filter: blur(8px);
  }
  .tip {
    bottom: -42px;
  }
  .tip-text {
    font-size: 0.68rem;
    padding: 0.45rem 0.85rem;
  }
  .tip-text::before {
    border-width: 6px;
    top: -6px;
  }
}

/* =============================================
   RESPONSIVE: SMALL MOBILE
============================================= */
@media (max-width: 400px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 3rem;
    max-width: 320px;
    margin: 0 auto;
  }
  .scene {
    max-width: 320px;
  }
  .tip-text {
    font-size: 0.8rem;
    padding: 0.55rem 1.1rem;
  }
}

/* =============================================
   TOUCH DEVICES
============================================= */
@media (hover: none) and (pointer: coarse) {
  .cloth {
    animation-name: waveActive;
    animation-duration: 12s;
    filter: var(--fh);
  }
  .shadow {
    opacity: 0.7 !important;
  }
  .light {
    opacity: 0.5 !important;
  }
  .sheen {
    opacity: 0.6;
    animation: sheenSweep 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  }
  .ground {
    animation-name: groundPulseActive;
    animation-duration: 12s;
    opacity: 0.85;
  }
  .tip {
    position: relative;
    bottom: auto;
    margin-top: 1.5rem;
    opacity: 1;
    transform: none;
    left: 0;
  }
  .tip-text {
    background: transparent;
    color: #334155;
    box-shadow: none;
    font-weight: 500;
    font-size: 0.85rem;
    padding: 0;
    letter-spacing: 0.08em;
  }
  .tip-text::before {
    display: none;
  }
}

/* =============================================
   REDUCED MOTION
============================================= */
@media (prefers-reduced-motion: reduce) {
  .cloth,
  .shadow,
  .light,
  .sheen,
  .ground {
    animation: none !important;
    transition: none !important;
  }
  .cloth {
    filter: none !important;
  }
  .flag {
    transition: none !important;
  }
}

/* =============================================
   HIGH CONTRAST
============================================= */
@media (prefers-contrast: high) {
  .edge {
    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.6);
  }
  .tip-text {
    background: #000;
    border: 2px solid #fff;
  }
}

/* =============================================
   PRINT
============================================= */
@media print {
  .flags {
    background: #fff;
    padding: 1rem;
    min-height: auto;
  }
  .cloth {
    animation: none !important;
    filter: none !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }
  .shadow,
  .light,
  .sheen,
  .ground {
    display: none;
  }
  .tip {
    position: relative;
    opacity: 1;
    transform: none;
    margin-top: 0.5rem;
    bottom: auto;
    left: auto;
  }
  .tip-text {
    background: transparent;
    color: #000;
    box-shadow: none;
    padding: 0;
    font-size: 0.9rem;
  }
  .tip-text::before {
    display: none;
  }
}



@media (max-width: 480px) {
  .flags-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem 1.5rem;
  }
  .flag-depth {
    max-width: 160px;
  }
  .tooltip-text {
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
}

/* Touch devices */
@media (hover: none) {
  .flag-body {
    animation-name: activeWave;
    animation-duration: 8s;
    filter: var(--filter-active);
  }
  .shadow-wave {
    opacity: 0.8 !important;
  }
  .highlight-wave {
    opacity: 0.6 !important;
  }
  .tooltip {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .flag-body,
  .shadow-wave,
  .highlight-wave,
  .ground-shadow {
    animation: none !important;
  }
  .flag-body {
    filter: none !important;
  }
}
`;
