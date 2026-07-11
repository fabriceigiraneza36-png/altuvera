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

  // Faster actual loading progress
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }

        if (prev < 35) {
          return Math.min(100, prev + 8 + Math.random() * 8);
        }
        if (prev < 70) {
          return Math.min(100, prev + 5 + Math.random() * 5);
        }
        if (prev < 92) {
          return Math.min(100, prev + 2 + Math.random() * 3);
        }
        return Math.min(100, prev + 1 + Math.random() * 1.5);
      });
    }, 120);

    return () => clearInterval(progressIntervalRef.current);
  }, []);

  // Real-time visible percentage counting
  useEffect(() => {
    displayIntervalRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          return prev + 1;
        }

        if (progress === 100 && prev >= 100) {
          clearInterval(displayIntervalRef.current);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => setIsVisible(false), 850);
          }, 120);
          return 100;
        }

        return prev;
      });
    }, 18);

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
      marginBottom: "28px",
      width: "200px",
      height: "200px",
    },
    logo: {
      width: "118px",
      height: "118px",
      objectFit: "contain",
      position: "relative",
      zIndex: 5,
      animation: "logoFloat 4.8s cubic-bezier(0.37, 0, 0.63, 1) infinite",
    },
    logoRing: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      border: "1px solid rgba(16, 185, 129, 0.16)",
      animation: "ringExpand 4.2s cubic-bezier(0.22, 1, 0.36, 1) infinite",
    },
    logoHalo: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "150px",
      height: "150px",
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 38%, transparent 72%)",
      filter: "blur(10px)",
    },
    text: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "44px",
      fontWeight: "700",
      color: "#111111",
      marginBottom: "10px",
      letterSpacing: "-0.5px",
    },
    tagline: {
      fontFamily: "'Dancing Script', cursive",
      fontSize: "20px",
      color: "#10B981",
      marginBottom: "40px",
      opacity: 0.92,
    },
    progressWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "280px",
      maxWidth: "85vw",
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
      fontSize: "12px",
      color: "#444444",
      letterSpacing: "2.5px",
      textTransform: "uppercase",
      fontWeight: "500",
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
    <div style={styles.container}>
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

          @media (max-width: 768px) {
            .loader-title {
              font-size: 34px !important;
            }
            .loader-tagline {
              font-size: 17px !important;
              margin-bottom: 34px !important;
            }
            .loader-logo-wrap {
              width: 170px !important;
              height: 170px !important;
              margin-bottom: 22px !important;
            }
            .loader-logo {
              width: 98px !important;
              height: 98px !important;
            }
            .loader-progress {
              width: 240px !important;
            }
          }

          @media (max-width: 480px) {
            .loader-title {
              font-size: 28px !important;
            }
            .loader-tagline {
              font-size: 15px !important;
              margin-bottom: 28px !important;
            }
            .loader-logo-wrap {
              width: 145px !important;
              height: 145px !important;
              margin-bottom: 18px !important;
            }
            .loader-logo {
              width: 84px !important;
              height: 84px !important;
            }
            .loader-progress {
              width: 82vw !important;
              max-width: 260px !important;
            }
          }
        `}
      </style>

      <div style={styles.whiteBase}></div>
      <div style={styles.ambientGlow}></div>

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

      <div style={styles.content}>
        <div style={styles.logoContainer} className="loader-logo-wrap">
          <div style={styles.logoHalo}></div>

          <div style={{ ...styles.logoRing, width: "150px", height: "150px" }}></div>
          <div
            style={{
              ...styles.logoRing,
              width: "188px",
              height: "188px",
              borderColor: "rgba(16, 185, 129, 0.11)",
              animationDelay: "0.8s",
            }}
          ></div>
          <div
            style={{
              ...styles.logoRing,
              width: "224px",
              height: "224px",
              borderWidth: "1px",
              borderColor: "rgba(16, 185, 129, 0.07)",
              animationDelay: "1.6s",
            }}
          ></div>

          <img
            src={getBrandLogoUrl()}
            alt="Altuvera"
            style={styles.logo}
            className="loader-logo"
            onError={(e) => {
              e.currentTarget.src = getBrandLogoUrl();
              e.currentTarget.alt = 'Altuvera';
            }}
          />
        </div>

        <h1 style={styles.text} className="loader-title">
          Altuvera
        </h1>

        <p style={styles.tagline} className="loader-tagline">
          True adventure in High Places & Deep Culture
        </p>

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