import React, { useState, useEffect, useRef, useMemo } from "react";
import { getBrandLogoUrl } from "../../utils/seo";

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const progressIntervalRef = useRef(null);
  const displayIntervalRef = useRef(null);

  const loadingMessages = [
    { threshold: 0, text: "Preparing your adventure" },
    { threshold: 20, text: "Discovering hidden gems" },
    { threshold: 40, text: "Charting unique paths" },
    { threshold: 60, text: "Curating experiences" },
    { threshold: 80, text: "Almost ready for takeoff" },
  ];

  const getLoadingText = () => {
    for (let i = loadingMessages.length - 1; i >= 0; i--) {
      if (displayProgress >= loadingMessages[i].threshold) {
        return loadingMessages[i].text;
      }
    }
    return loadingMessages[0].text;
  };

  const bubbles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        size: 16 + Math.random() * 16,
        opacity: 0.14 + Math.random() * 0.1,
        duration: `${11 + Math.random() * 6}s`,
        delay: `${Math.random() * 4}s`,
      })),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        size: 3 + Math.random() * 2,
        delay: `${Math.random() * 6}s`,
        duration: `${8 + Math.random() * 5}s`,
        opacity: 0.14 + Math.random() * 0.1,
      })),
    [],
  );

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
    };
  }, []);

  // Give the wordmark its full reveal time. Progress can reach 75 quickly,
  // but never races past it before the last letter finishes animating.
  const loaderStartedAtRef = useRef(Date.now());
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }

        const elapsed = Date.now() - loaderStartedAtRef.current;
        if (elapsed < 1220) {
          if (prev >= 75) return 75;
          if (prev < 35) return Math.min(75, prev + 8 + Math.random() * 8);
          return Math.min(75, prev + 5 + Math.random() * 5);
        }

        // Once every letter has finished, glide through the final quarter
        // rather than jumping straight to 100 on fast-loading pages.
        return Math.min(100, prev + (prev < 90 ? 8 : 5));
      });
    }, 120);

    return () => clearInterval(progressIntervalRef.current);
  }, []);

  // Smoothly count the visible percentage up to the progress target.
  useEffect(() => {
    displayIntervalRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) return Math.min(progress, prev + 1);

        if (progress === 100 && prev >= 100) {
          clearInterval(displayIntervalRef.current);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => setIsVisible(false), 420);
          }, 80);
          return 100;
        }

        return prev;
      });
    }, 16);

    return () => clearInterval(displayIntervalRef.current);
  }, [progress]);

  if (!isVisible) return null;

  const styles = {
    container: {
      position: "fixed",
      inset: 0,
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      overflow: "hidden",
      opacity: isExiting ? 0 : 1,
      filter: isExiting ? "blur(4px)" : "blur(0px)",
      transform: isExiting ? "scale(1.02)" : "scale(1)",
      transition:
        "opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), filter 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)",
    },
    whiteBase: {
      position: "absolute",
      inset: 0,
      background: "#ffffff",
      zIndex: 0,
    },
    ambientGlow: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(circle at 50% 45%, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.015) 26%, transparent 58%)",
      zIndex: 1,
      pointerEvents: "none",
    },
    content: {
      position: "relative",
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      width: "100%",
      maxWidth: "760px",
      padding: "24px",
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? "translateY(-14px) scale(0.99)" : "translateY(0) scale(1)",
      transition:
        "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
    },
    logoContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      margin: 0,
      width: "84px",
      height: "84px",
    },
    logo: {
      width: "76px",
      height: "76px",
      objectFit: "contain",
      position: "relative",
      zIndex: 5,
      animation: "logoFloat 3.8s cubic-bezier(0.37, 0, 0.63, 1) infinite",
    },
    text: {
      fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      gap: "0.045em",
      fontSize: "clamp(24px, 4vw, 36px)",
      lineHeight: 1,
      fontWeight: "800",
      color: "#064e3b",
      margin: "0 0 8px",
      letterSpacing: "0.04em",
    },
    tagline: {
      fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      fontSize: "9px",
      fontWeight: "800",
      color: "#059669",
      margin: 0,
      letterSpacing: ".1em",
      lineHeight: 1.5,
      textTransform: "uppercase",
      opacity: 0.92,
      maxWidth: "250px",
    },
    progressWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "300px",
      maxWidth: "88vw",
      marginTop: "44px",
    },
    progressContainer: {
      width: "100%",
      height: "4px",
      backgroundColor: "rgba(16, 185, 129, 0.08)",
      borderRadius: "999px",
      overflow: "hidden",
      marginBottom: "16px",
    },
    progressBar: {
      height: "100%",
      background: "linear-gradient(90deg, #059669 0%, #10B981 58%, #34D399 100%)",
      borderRadius: "999px",
      transition: "width 0.16s linear",
      width: `${Math.min(displayProgress, 100)}%`,
      position: "relative",
      overflow: "hidden",
    },
    progressShine: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
      animation: "shine 2.2s linear infinite",
    },
    loadingText: {
      fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      fontSize: "10px",
      color: "#475569",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      fontWeight: "700",
      marginBottom: "8px",
      minHeight: "18px",
      textAlign: "center",
    },
    loadingDots: {
      display: "inline-flex",
      marginLeft: "4px",
    },
    loadingDot: {
      display: "inline-block",
      color: "#10B981",
      animation: "dotBounce 1.6s ease-in-out infinite",
      fontSize: "14px",
      lineHeight: 1,
    },
    percentText: {
      fontSize: "12px",
      color: "#888888",
      letterSpacing: "1px",
      fontWeight: "500",
      fontVariantNumeric: "tabular-nums",
    },
    floatingBubble: {
      position: "absolute",
      borderRadius: "50%",
      pointerEvents: "none",
      border: "1px solid rgba(16, 185, 129, 0.09)",
      background:
        "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.58) 18%, rgba(16,185,129,0.11) 55%, rgba(16,185,129,0.04) 76%, transparent 100%)",
      boxShadow:
        "inset 0 0 10px rgba(255,255,255,0.6), 0 0 10px rgba(16,185,129,0.05)",
      willChange: "transform, opacity",
    },
    particle: {
      position: "absolute",
      borderRadius: "50%",
      pointerEvents: "none",
    },
    mountainsContainer: {
      position: "absolute",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: "6px",
      opacity: isExiting ? 0 : 0.12,
      transition: "opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
      zIndex: 3,
    },
    mountain: {
      width: 0,
      height: 0,
      borderStyle: "solid",
      borderColor: "transparent transparent #10B981 transparent",
      animation: "mountainSway 7s ease-in-out infinite",
    },
  };

  return (
    <div
      style={styles.container}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        event.currentTarget.style.setProperty("--bubble-parallax-x", String(x * 22) + "px");
        event.currentTarget.style.setProperty("--bubble-parallax-y", String(y * 16) + "px");
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--bubble-parallax-x", "0px");
        event.currentTarget.style.setProperty("--bubble-parallax-y", "0px");
      }}
    >
      <style>
        {`
          @keyframes logoFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-7px) scale(1.01); }
          }

          @keyframes ringExpand {
            0% {
              transform: translate(-50%, -50%) scale(0.94);
              opacity: 0;
            }
            16% {
              opacity: 0.52;
            }
            72% {
              opacity: 0.12;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.16);
              opacity: 0;
            }
          }

          @keyframes dotBounce {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 0.35;
            }
            40% {
              transform: translateY(-4px);
              opacity: 1;
            }
          }

          @keyframes shine {
            0% { transform: translateX(-160%); }
            100% { transform: translateX(220%); }
          }

          @keyframes mountainSway {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }

          @keyframes bubbleFloatDown1 {
            0% {
              transform: translate3d(0px, -12vh, 0) scale(0.95);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            35% {
              transform: translate3d(8px, 10vh, 0) scale(1);
            }
            62% {
              transform: translate3d(-5px, 34vh, 0) scale(1.01);
            }
            82% {
              transform: translate3d(4px, 56vh, 0) scale(0.995);
              opacity: 0.9;
            }
            100% {
              transform: translate3d(0px, 72vh, 0) scale(0.99);
              opacity: 0;
            }
          }

          @keyframes bubbleFloatDown2 {
            0% {
              transform: translate3d(0px, -14vh, 0) scale(0.95);
              opacity: 0;
            }
            12% {
              opacity: 1;
            }
            30% {
              transform: translate3d(-8px, 12vh, 0) scale(1.01);
            }
            58% {
              transform: translate3d(-14px, 36vh, 0) scale(1.02);
            }
            84% {
              transform: translate3d(-7px, 60vh, 0) scale(1);
              opacity: 0.88;
            }
            100% {
              transform: translate3d(0px, 74vh, 0) scale(0.99);
              opacity: 0;
            }
          }

          @keyframes bubbleFloatDown3 {
            0% {
              transform: translate3d(0px, -11vh, 0) scale(0.95);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            36% {
              transform: translate3d(7px, 14vh, 0) scale(1);
            }
            66% {
              transform: translate3d(12px, 40vh, 0) scale(1.015);
            }
            86% {
              transform: translate3d(5px, 61vh, 0) scale(1);
              opacity: 0.9;
            }
            100% {
              transform: translate3d(0px, 76vh, 0) scale(0.99);
              opacity: 0;
            }
          }

          @keyframes bubbleFloatDown4 {
            0% {
              transform: translate3d(0px, -13vh, 0) scale(0.94);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            34% {
              transform: translate3d(-5px, 11vh, 0) scale(1);
            }
            60% {
              transform: translate3d(9px, 35vh, 0) scale(1.02);
            }
            84% {
              transform: translate3d(3px, 59vh, 0) scale(1);
              opacity: 0.88;
            }
            100% {
              transform: translate3d(0px, 75vh, 0) scale(0.99);
              opacity: 0;
            }
          }

          @keyframes particleDrift {
            0% {
              transform: translateY(-16px);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(calc(100vh + 18px));
              opacity: 0;
            }
          }

          .loader-bubble-layer {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            transform: translate3d(var(--bubble-parallax-x, 0px), var(--bubble-parallax-y, 0px), 0);
            transition: transform .18s cubic-bezier(.22, 1, .36, 1);
            will-change: transform;
          }
          .loader-brand-lockup {
            width: min(100%, 570px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
            text-align: left;
          }
          .loader-brand-copy { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
          .loader-title { white-space: nowrap; }
          .loader-brand-letter {
            display: inline-block;
            opacity: 0;
            transform-origin: left center;
            animation: loaderLetterReveal .68s cubic-bezier(.2,.8,.2,1) both;
            will-change: transform, opacity, filter;
          }
          @keyframes loaderLetterReveal {
            0% { opacity: 0; transform: translate3d(-17px, 0, 0) scale(.94); filter: blur(3px); }
            65% { opacity: 1; filter: blur(0); }
            100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
          }
          @media (max-width: 768px) {
            .loader-brand-lockup { gap: 14px; }
            .loader-logo-wrap { width: 72px !important; height: 72px !important; }
            .loader-logo { width: 68px !important; height: 68px !important; }
            .loader-title { font-size: 27px !important; }
            .loader-tagline { font-size: 8px !important; max-width: 210px; letter-spacing: .09em !important; }
            .loader-progress { margin-top: 38px !important; width: 260px !important; }
          }
          @media (max-width: 480px) {
            .loader-brand-lockup { gap: 11px; width: 100%; }
            .loader-logo-wrap { width: 58px !important; height: 58px !important; }
            .loader-logo { width: 56px !important; height: 56px !important; }
            .loader-title { font-size: 20px !important; letter-spacing: .035em !important; }
            .loader-tagline { font-size: 7px !important; letter-spacing: .06em !important; max-width: 175px; }
            .loader-progress { margin-top: 34px !important; width: 82vw !important; max-width: 280px !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .loader-bubble-layer, .loader-bubble-layer *, .loader-brand-letter, .loader-logo, .loader-progress .progressShine {
              animation: none !important; transition: none !important; filter: none !important;
            }
            .loader-brand-letter { opacity: 1 !important; transform: none !important; }
          }
        `}
      </style>

      <div style={styles.whiteBase}></div>
      <div style={styles.ambientGlow}></div>

      <div className="loader-bubble-layer" aria-hidden="true">
      {bubbles.map((bubble, index) => (
        <div
          key={bubble.id}
          style={{
            ...styles.floatingBubble,
            left: bubble.left,
            top: "-10vh",
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            animation: `bubbleFloatDown${(index % 4) + 1} ${bubble.duration} cubic-bezier(0.22, 1, 0.36, 1) infinite`,
            animationDelay: bubble.delay,
          }}
        />
      ))}

      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            ...styles.particle,
            left: particle.left,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `rgba(16, 185, 129, ${particle.opacity})`,
            boxShadow: "0 0 6px rgba(16,185,129,0.16)",
            animation: `particleDrift ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}
      </div>

      <div style={styles.content}>
        <div className="loader-brand-lockup">
          <div style={styles.logoContainer} className="loader-logo-wrap">
            <img
              src={getBrandLogoUrl()}
              alt="Altuvera Safaris logo"
              style={styles.logo}
              className="loader-logo"
              onError={(e) => {
                e.currentTarget.src = getBrandLogoUrl();
                e.currentTarget.alt = "Altuvera Safaris logo";
              }}
            />
          </div>
          <div className="loader-brand-copy">
            <h1 style={styles.text} className="loader-title" aria-label="Altuvera">
              {"ALTUVERA".split("").map((letter, index) => (
                <span key={letter + "-" + index} aria-hidden="true" className="loader-brand-letter" style={{ animationDelay: (index * 68) + "ms" }}>{letter}</span>
              ))}
            </h1>
            <p style={styles.tagline} className="loader-tagline">
              True adventure in high places &amp; deep culture
            </p>
          </div>
        </div>

        <div style={styles.progressWrapper} className="loader-progress">
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={styles.progressShine}></div>
            </div>
          </div>

          <p style={styles.loadingText}>
            {getLoadingText()}
            <span style={styles.loadingDots}>
              <span style={styles.loadingDot}>.</span>
              <span style={{ ...styles.loadingDot, animationDelay: "0.2s" }}>.</span>
              <span style={{ ...styles.loadingDot, animationDelay: "0.4s" }}>.</span>
            </span>
          </p>

          <p style={styles.percentText}>{displayProgress}%</p>
        </div>
      </div>

      <div style={styles.mountainsContainer}>
        <div
          style={{
            ...styles.mountain,
            borderWidth: "0 18px 32px 18px",
            animationDelay: "0s",
          }}
        ></div>
        <div
          style={{
            ...styles.mountain,
            borderWidth: "0 26px 48px 26px",
            animationDelay: "0.4s",
          }}
        ></div>
        <div
          style={{
            ...styles.mountain,
            borderWidth: "0 35px 65px 35px",
            animationDelay: "0.2s",
          }}
        ></div>
        <div
          style={{
            ...styles.mountain,
            borderWidth: "0 28px 52px 28px",
            animationDelay: "0.5s",
          }}
        ></div>
        <div
          style={{
            ...styles.mountain,
            borderWidth: "0 20px 36px 20px",
            animationDelay: "0.3s",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;