// src/components/common/ScrollToTop.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTop = () => {
  const [isVisible, setIsVisible]         = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { pathname } = useLocation();

  /* ── Scroll to top on route change ─────────────────────── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  /* ── Track scroll position & progress ──────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setIsVisible(scrollY > 400);

      const docHeight    = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollable   = docHeight - windowHeight;

      /* Guard: avoid division by zero → NaN */
      if (scrollable <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress = Math.min(100, Math.max(0, (scrollY / scrollable) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    /* Run once on mount so initial state is correct */
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── SVG circle maths ───────────────────────────────────── */
  const RADIUS      = 26;
  const STROKE      = 3.5;
  const SIZE        = 60;
  const CENTER      = SIZE / 2;                          // 30
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;           // ≈ 163.36

  /* Clamp to valid number — prevents NaN from reaching the DOM */
  const safeProgress = Number.isFinite(scrollProgress) ? scrollProgress : 0;
  const dashOffset   = CIRCUMFERENCE - (CIRCUMFERENCE * safeProgress) / 100;

  return (
    <div
      onClick={scrollToTop}
      role="button"
      tabIndex={0}
      aria-label="Scroll back to top"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") scrollToTop(); }}
      style={{
        position:   "fixed",
        bottom:     28,
        right:      28,
        zIndex:     1000,
        opacity:    isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transform:  isVisible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.8)",
        transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), visibility 0.4s ease",
        cursor:     "pointer",
        userSelect: "none",
      }}
    >
      {/* Outer ring + progress SVG */}
      <div
        style={{
          position:        "relative",
          width:           SIZE,
          height:          SIZE,
          borderRadius:    "50%",
          backgroundColor: "white",
          boxShadow:
            "0 8px 28px rgba(5,150,105,0.22), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          transition:     "box-shadow 0.3s ease, transform 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform  = "scale(1.10)";
          e.currentTarget.style.boxShadow  =
            "0 14px 40px rgba(5,150,105,0.34), 0 4px 12px rgba(0,0,0,0.08)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform  = "scale(1)";
          e.currentTarget.style.boxShadow  =
            "0 8px 28px rgba(5,150,105,0.22), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";
        }}
      >
        {/* SVG progress ring */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            position:  "absolute",
            top:       0,
            left:      0,
            transform: "rotate(-90deg)",
            borderRadius: "50%",
          }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(5,150,105,0.10)"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="url(#scrollGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.15s linear" }}
          />
          <defs>
            <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#34D399" />
              <stop offset="50%"  stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner button */}
        <div
          style={{
            width:          42,
            height:         42,
            borderRadius:   "50%",
            background:     "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            color:          "white",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            position:       "relative",
            zIndex:         2,
            boxShadow:      "0 4px 14px rgba(5,150,105,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
            transition:     "transform 0.3s ease",
          }}
        >
          <FiArrowUp size={19} strokeWidth={2.5} />
        </div>
      </div>

      {/* Percentage label — appears when scrolled */}
      {safeProgress > 5 && (
        <div
          style={{
            position:   "absolute",
            bottom:     -22,
            left:       "50%",
            transform:  "translateX(-50%)",
            fontSize:   10,
            fontWeight: 700,
            color:      "#059669",
            letterSpacing: "0.4px",
            whiteSpace: "nowrap",
            opacity:    0.85,
          }}
        >
          {Math.round(safeProgress)}%
        </div>
      )}
    </div>
  );
};

export default ScrollToTop;