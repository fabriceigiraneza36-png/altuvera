// components/common/Loader.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { getBrandLogoUrl } from "../../utils/seo";

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [activeMessage, setActiveMessage] = useState(0);
  const progressIntervalRef = useRef(null);
  const displayIntervalRef = useRef(null);

  const loadingMessages = [
    { threshold: 0,  text: "Preparing your adventure" },
    { threshold: 20, text: "Discovering hidden gems" },
    { threshold: 40, text: "Charting unique paths" },
    { threshold: 60, text: "Curating experiences" },
    { threshold: 80, text: "Almost ready for takeoff" },
  ];

  useEffect(() => {
    for (let i = loadingMessages.length - 1; i >= 0; i--) {
      if (displayProgress >= loadingMessages[i].threshold) {
        setActiveMessage(i);
        break;
      }
    }
  }, [displayProgress]);

  const orbs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        size: 280 + Math.random() * 220,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        duration: 18 + Math.random() * 10,
        delay: Math.random() * 5,
        opacity: 0.025 + Math.random() * 0.02,
      })),
    [],
  );

  const floatingDots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        size: 2 + Math.random() * 2.5,
        delay: `${Math.random() * 8}s`,
        duration: `${12 + Math.random() * 8}s`,
        opacity: 0.12 + Math.random() * 0.15,
      })),
    [],
  );

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (displayIntervalRef.current) clearInterval(displayIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          return 100;
        }
        if (prev < 35) return Math.min(100, prev + 8 + Math.random() * 8);
        if (prev < 70) return Math.min(100, prev + 5 + Math.random() * 5);
        if (prev < 92) return Math.min(100, prev + 2 + Math.random() * 3);
        return Math.min(100, prev + 1 + Math.random() * 1.5);
      });
    }, 120);
    return () => clearInterval(progressIntervalRef.current);
  }, []);

  useEffect(() => {
    displayIntervalRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) return prev + 1;
        if (progress === 100 && prev >= 100) {
          clearInterval(displayIntervalRef.current);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => setIsVisible(false), 900);
          }, 200);
          return 100;
        }
        return prev;
      });
    }, 18);
    return () => clearInterval(displayIntervalRef.current);
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        @keyframes ld-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-8px) scale(1.008); }
        }
        @keyframes ld-ring-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.92); opacity: 0; }
          20%  { opacity: 0.5; }
          80%  { opacity: 0.08; }
          100% { transform: translate(-50%,-50%) scale(1.2); opacity: 0; }
        }
        @keyframes ld-shimmer {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(300%); }
        }
        @keyframes ld-dot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40%           { opacity: 1;    transform: translateY(-3px); }
        }
        @keyframes ld-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(15px, -20px) scale(1.05); }
          50%      { transform: translate(-10px, 10px) scale(0.95); }
          75%      { transform: translate(20px, 15px) scale(1.02); }
        }
        @keyframes ld-particle-rise {
          0%   { transform: translateY(20px); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 20px)); opacity: 0; }
        }
        @keyframes ld-text-in {
          0%   { opacity: 0; transform: translateY(8px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
        @keyframes ld-logo-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0), 0 0 40px rgba(16,185,129,0.06); }
          50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0.04), 0 0 60px rgba(16,185,129,0.08); }
        }
        @keyframes ld-progress-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.7; }
        }
        @keyframes ld-mountain-breath {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50%      { transform: translateY(-1px) scaleY(1.02); }
        }
        @keyframes ld-line-grow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        .ld-msg-enter {
          animation: ld-text-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @media (max-width: 768px) {
          .ld-title    { font-size: 32px !important; }
          .ld-tagline  { font-size: 14px !important; }
          .ld-logo-box { width: 160px !important; height: 160px !important; }
          .ld-logo-img { width: 88px !important;  height: 88px !important; }
          .ld-bar-wrap { width: 240px !important; }
        }
        @media (max-width: 480px) {
          .ld-title    { font-size: 26px !important; }
          .ld-tagline  { font-size: 12.5px !important; letter-spacing: 3px !important; }
          .ld-logo-box { width: 130px !important; height: 130px !important; margin-bottom: 20px !important; }
          .ld-logo-img { width: 72px !important;  height: 72px !important; }
          .ld-bar-wrap { width: 85vw !important; max-width: 260px !important; }
          .ld-pct      { font-size: 11px !important; }
        }
      `}</style>

      {/* ── Background ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(168deg, #ffffff 0%, #f8fdfb 35%, #f0fdf7 60%, #ffffff 100%)",
      }} />

      {/* ── Floating orbs ── */}
      {orbs.map(orb => (
        <div
          key={orb.id}
          style={{
            position: "absolute",
            left: `${orb.x}%`, top: `${orb.y}%`,
            width: orb.size, height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(16,185,129,${orb.opacity}) 0%, transparent 70%)`,
            animation: `ld-orb-drift ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />
      ))}

      {/* ── Rising particles ── */}
      {floatingDots.map(dot => (
        <div
          key={dot.id}
          style={{
            position: "absolute",
            left: dot.left,
            bottom: "-20px",
            width: dot.size, height: dot.size,
            borderRadius: "50%",
            background: `rgba(16,185,129,${dot.opacity})`,
            animation: `ld-particle-rise ${dot.duration} linear infinite`,
            animationDelay: dot.delay,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Subtle grid pattern ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
        opacity: 0.6,
      }} />

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateY(-10px)" : "translateY(0)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>

        {/* Logo Container */}
        <div
          className="ld-logo-box"
          style={{
            position: "relative",
            width: 190, height: 190,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
          }}
        >
          {/* Rings */}
          {[140, 172, 204].map((size, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: size, height: size,
                borderRadius: "50%",
                border: `1px solid rgba(16,185,129,${0.14 - i * 0.035})`,
                animation: `ld-ring-pulse 3.8s cubic-bezier(0.22,1,0.36,1) infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}

          {/* Glow halo */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 130, height: 130,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
            filter: "blur(16px)",
            animation: "ld-logo-glow 4s ease-in-out infinite",
          }} />

          {/* Logo */}
          <img
            src={getBrandLogoUrl()}
            alt="Altuvera"
            className="ld-logo-img"
            style={{
              width: 100, height: 100,
              objectFit: "contain",
              position: "relative", zIndex: 5,
              animation: "ld-float 5s cubic-bezier(0.37,0,0.63,1) infinite",
              filter: "drop-shadow(0 4px 20px rgba(16,185,129,0.12))",
            }}
            onError={(e) => {
              e.currentTarget.src = getBrandLogoUrl();
            }}
          />
        </div>

        {/* Brand Name */}
        <h1
          className="ld-title"
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 42,
            fontWeight: 400,
            color: "#0f172a",
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Altuvera
        </h1>

        {/* Tagline with decorative lines */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          marginBottom: 36,
        }}>
          <div style={{
            width: 32, height: 1.5,
            background: "linear-gradient(90deg, transparent, #10b981)",
            borderRadius: 1,
            animation: "ld-line-grow 1s ease forwards",
            transformOrigin: "right",
          }} />
          <p
            className="ld-tagline"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#059669",
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              margin: 0,
              opacity: 0.85,
            }}
          >
            Adventure Awaits
          </p>
          <div style={{
            width: 32, height: 1.5,
            background: "linear-gradient(90deg, #10b981, transparent)",
            borderRadius: 1,
            animation: "ld-line-grow 1s ease forwards",
            transformOrigin: "left",
          }} />
        </div>

        {/* Progress Section */}
        <div
          className="ld-bar-wrap"
          style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", width: 300,
          }}
        >
          {/* Loading Message */}
          <p
            key={activeMessage}
            className="ld-msg-enter"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "#64748b",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 14,
              minHeight: 18,
              display: "flex", alignItems: "center", gap: 2,
            }}
          >
            {loadingMessages[activeMessage].text}
            <span style={{ display: "inline-flex", marginLeft: 3 }}>
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    color: "#10b981",
                    fontSize: 14,
                    fontWeight: 700,
                    animation: `ld-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
                  }}
                >
                  .
                </span>
              ))}
            </span>
          </p>

          {/* Progress Track */}
          <div style={{
            width: "100%", height: 3,
            borderRadius: 999,
            background: "rgba(16,185,129,0.08)",
            overflow: "hidden",
            marginBottom: 14,
            position: "relative",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(displayProgress, 100)}%`,
              borderRadius: 999,
              background: "linear-gradient(90deg, #059669, #10b981, #34d399)",
              transition: "width 0.12s linear",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                animation: "ld-shimmer 2s linear infinite",
              }} />
            </div>

            {/* Glow dot at end of bar */}
            {displayProgress > 3 && displayProgress < 100 && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: `${Math.min(displayProgress, 100)}%`,
                transform: "translate(-50%, -50%)",
                width: 8, height: 8,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 12px rgba(16,185,129,0.5), 0 0 4px rgba(16,185,129,0.8)",
                animation: "ld-progress-pulse 1.2s ease-in-out infinite",
                transition: "left 0.12s linear",
              }} />
            )}
          </div>

          {/* Percentage */}
          <p
            className="ld-pct"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              letterSpacing: "0.5px",
              margin: 0,
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.3s ease",
              ...(displayProgress >= 100 ? { color: "#10b981" } : {}),
            }}
          >
            {displayProgress}%
          </p>
        </div>
      </div>

      {/* ── Mountain Silhouette ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 80,
        overflow: "hidden",
        opacity: isExiting ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: "none",
      }}>
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            width: "100%", height: "100%",
          }}
        >
          <defs>
            <linearGradient id="ld-mtn-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Back range */}
          <path
            d="M0,80 L0,60 L120,42 L240,55 L360,32 L480,48 L600,25 L720,40 L840,20 L960,38 L1080,28 L1200,45 L1320,35 L1440,50 L1440,80 Z"
            fill="url(#ld-mtn-grad)"
            style={{ animation: "ld-mountain-breath 8s ease-in-out infinite" }}
          />

          {/* Front range */}
          <path
            d="M0,80 L0,65 L180,50 L320,60 L480,40 L640,55 L800,35 L960,50 L1100,38 L1280,52 L1440,45 L1440,80 Z"
            fill="rgba(16,185,129,0.04)"
            style={{ animation: "ld-mountain-breath 6s ease-in-out 0.5s infinite" }}
          />

          {/* Accent peaks */}
          <path
            d="M600,80 L600,30 L620,25 L640,30 L640,80 Z"
            fill="rgba(16,185,129,0.05)"
            style={{ animation: "ld-mountain-breath 7s ease-in-out 0.2s infinite" }}
          />
          <path
            d="M820,80 L820,35 L845,22 L870,35 L870,80 Z"
            fill="rgba(16,185,129,0.06)"
            style={{ animation: "ld-mountain-breath 7s ease-in-out 0.8s infinite" }}
          />
        </svg>
      </div>
    </div>
  );
};

export default Loader;