// src/components/EastAfricaFlags.jsx
import { useEffect, useRef, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { useCountries } from "../../hooks/useCountries";

// ── Utility ──────────────────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function EastAfricaFlags({ variant = "full" }) {
  const { countries: backendCountries, loading, error, refetch } = useCountries();

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
  const scrollRef = useRef(null);
  const dirRef = useRef(1);

  const [activeFlag, setActiveFlag] = useState(null);
  const [isInView, setIsInView] = useState(false);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ── Mouse move 3-D tilt ─────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let posX = 0,
      posY = 0,
      targetX = 0,
      targetY = 0,
      rafId;

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
      targetX = (e.clientX / window.innerWidth - 0.5) * 4;
      targetY = (e.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Intersection observer ──────────────────────────────────────────────
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
    let lastTs = 0,
      pauseUntil = 0;

    dirRef.current = dirRef.current * -1;

    const tick = (ts) => {
      if (!lastTs) lastTs = ts;

      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (pauseUntil && ts < pauseUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      pauseUntil = 0;

      const dt = Math.min(40, ts - lastTs) / 1000;
      lastTs = ts;
      const delta = speedPxPerSec * dt * dirRef.current;
      const next = scroller.scrollLeft + delta;

      if (next <= 0) {
        scroller.scrollLeft = 0;
        dirRef.current = 1;
        pauseUntil = ts + 550;
      } else if (next >= max) {
        scroller.scrollLeft = max;
        dirRef.current = -1;
        pauseUntil = ts + 550;
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
        className={cn(
          "relative flex w-full flex-row justify-center backdrop-blur-[20px]",
          "min-h-[1vh] font-sans",
          variant === "flush" && "min-h-0 justify-start"
        )}
      >
        <div
          className="flex gap-5 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory
                     [-webkit-overflow-scrolling:touch]
                     [&::-webkit-scrollbar]:h-1.5
                     [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-track]:bg-white/[0.02]
                     [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-white/10
                     [&::-webkit-scrollbar-thumb:hover]:bg-white/20"
          aria-label="Countries loading"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[280px] flex-shrink-0">
              <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-6">
                {/* Skeleton flag */}
                <div
                  className="w-full rounded-[10px] bg-[length:200%_100%]"
                  style={{
                    aspectRatio: "3/2",
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                {/* Skeleton info */}
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-4 w-[70%] rounded bg-white/10" />
                  <div className="h-3 w-[50%] rounded bg-white/[0.05]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shimmer keyframe — only one needed for skeletons */}
        <style>{`
          @keyframes shimmer {
            0%   { background-position:  200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error && backendCountries.length === 0) {
    return (
      <section
        ref={containerRef}
        className={cn(
          "relative flex w-full flex-row justify-center backdrop-blur-[20px]",
          "min-h-[1vh] font-sans",
          variant === "flush" && "min-h-0 justify-start"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-10 text-center text-white/70">
          <FiWifiOff size={32} />
          <p>Unable to load countries</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 rounded-[20px] border border-white/20 bg-white/10
                       px-5 py-2.5 text-sm text-white transition-all
                       hover:border-white/30 hover:bg-white/[0.15] active:scale-95"
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
      style={{ "--mx": "0deg", "--my": "0deg" }}
      className={cn(
        "relative flex w-full flex-row justify-center backdrop-blur-[20px]",
        "min-h-[1vh] font-sans",
        variant === "flush" && "min-h-0 justify-start"
      )}
    >
      {/* Keyframes that can't be expressed purely in Tailwind */}
      <style>{`
        @keyframes waveIdle {
          0%,100% { transform: rotateY(0deg)    skewY(0deg)     scaleX(1);     }
          25%     { transform: rotateY(-2.5deg)  skewY(-0.3deg)  scaleX(1.005); }
          50%     { transform: rotateY(2deg)     skewY(0.25deg)  scaleX(0.995); }
          75%     { transform: rotateY(-1.5deg)  skewY(-0.2deg)  scaleX(1.003); }
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
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(25px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @media (prefers-reduced-motion: reduce) {
          .cloth-anim,
          .shadow-anim,
          .shine-anim,
          .card-enter-anim {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* SVG Filters */}
      <svg
        className="pointer-events-none invisible absolute h-0 w-0"
        aria-hidden="true"
      >
        <defs>
          {countries.map((c, i) => (
            <Fragment key={c.code}>
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
            </Fragment>
          ))}
        </defs>
      </svg>

      {/* Flags Row */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory
                   [-webkit-overflow-scrolling:touch]
                   [&::-webkit-scrollbar]:h-1.5
                   [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-track]:bg-white/[0.02]
                   [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-white/10
                   [&::-webkit-scrollbar-thumb:hover]:bg-white/20"
        aria-label="Countries"
      >
        {countries.map((country, idx) => {
          const isActive = activeFlag === country.code;

          return (
            <Link
              key={country.code}
              to={`/country/${country.name.toLowerCase().replace(/ /g, "-")}`}
              className="card-enter-anim group relative w-[280px] flex-shrink-0 snap-center
                         cursor-pointer no-underline opacity-0 translate-y-5
                         md:w-[260px] sm:w-[240px] max-[480px]:w-[220px]"
              style={{
                animationName: "cardEnter",
                animationDuration: "0.6s",
                animationTimingFunction: "ease",
                animationFillMode: "forwards",
                animationDelay: `${idx * 80 + 100}ms`,
              }}
              onMouseEnter={() => setActiveFlag(country.code)}
              onMouseLeave={() => setActiveFlag(null)}
              aria-label={`Flag of ${country.name}`}
            >
              {/* Card content */}
              <div
                className={cn(
                  "relative rounded-[20px] border bg-white/[0.02] p-6",
                  "backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]",
                  "transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "md:p-5 sm:rounded-2xl sm:p-5 max-[480px]:rounded-[14px] max-[480px]:p-4",
                  isActive
                    ? "border-white/[0.12] bg-white/[0.05] -translate-y-1.5"
                    : "border-white/[0.06] group-hover:border-white/[0.12] group-hover:bg-white/[0.05] group-hover:-translate-y-1.5"
                )}
              >
                {/* 3-D scene */}
                <div className="relative mb-5 w-full [perspective:1200px] [transform-style:preserve-3d]">
                  {/* Flag wrapper — receives mouse tilt via CSS vars */}
                  <div
                    className="w-full [transform-style:preserve-3d] transition-transform duration-1000
                               ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: "rotateX(var(--my)) rotateY(var(--mx))",
                    }}
                  >
                    {/* Cloth */}
                    <div
                      className={cn(
                        "cloth-anim relative w-full overflow-hidden rounded-[10px]",
                        "origin-left [aspect-ratio:3/2]",
                        "shadow-[0_15px_35px_rgba(0,0,0,0.2),0_5px_15px_rgba(0,0,0,0.1)]",
                        "transition-[filter,box-shadow] duration-[1s,0.5s] ease-in-out",
                        isActive &&
                          "shadow-[0_25px_50px_rgba(0,0,0,0.3),0_10px_25px_rgba(0,0,0,0.2)]"
                      )}
                      style={{
                        filter: isActive
                          ? `url(#f-hover-${country.code})`
                          : `url(#f-idle-${country.code})`,
                        animationName: isActive ? "waveActive" : "waveIdle",
                        animationDuration: isActive
                          ? "5s"
                          : `${country.duration * 0.9}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDelay: isActive ? "0s" : `${country.delay}s`,
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/w1280/${country.code}.png`}
                        srcSet={`
                          https://flagcdn.com/w640/${country.code}.png 640w,
                          https://flagcdn.com/w1280/${country.code}.png 1280w
                        `}
                        sizes="280px"
                        alt={`${country.name} flag`}
                        className="pointer-events-none h-full w-full select-none object-cover"
                        draggable="false"
                      />

                      {/* Cloth overlay */}
                      <div
                        className="pointer-events-none absolute inset-0
                                   bg-gradient-to-r from-black/[0.12] via-transparent via-20% to-black/[0.08]"
                      />

                      {/* Cloth shine */}
                      <div
                        className={cn(
                          "shine-anim pointer-events-none absolute inset-0 -translate-x-full",
                          "bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_55%,transparent_70%)]",
                          "transition-opacity duration-300 ease-in-out",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                        style={
                          isActive
                            ? {
                                animationName: "shineMove",
                                animationDuration: "2s",
                                animationTimingFunction: "ease-in-out",
                                animationIterationCount: "infinite",
                              }
                            : undefined
                        }
                      />

                      {/* Cloth edge */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[10px]
                                   shadow-[inset_2px_0_10px_rgba(0,0,0,0.15),inset_0_2px_6px_rgba(0,0,0,0.1),inset_0_-2px_6px_rgba(0,0,0,0.1)]"
                      />
                    </div>
                  </div>

                  {/* Flag shadow */}
                  <div
                    className="shadow-anim absolute -bottom-[15px] left-[10%] right-[10%] h-5 opacity-70
                               blur-[6px]
                               bg-[radial-gradient(ellipse_60%_40%_at_center,rgba(0,0,0,0.25)_0%,transparent_70%)]"
                    style={{
                      animationName: "shadowPulse",
                      animationDuration: `${country.duration}s`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDelay: `${country.delay}s`,
                    }}
                  />
                </div>
              </div>

              {/* Card border glow */}
              <div
                className={cn(
                  "pointer-events-none absolute -inset-px -z-10 rounded-[21px]",
                  "bg-gradient-to-br from-white/10 via-transparent to-white/[0.05]",
                  "transition-opacity duration-400 ease-in-out",
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}