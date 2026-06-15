// src/pages/DestinationDetail.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import MiniVideoPlayer from "../components/common/MiniVideoPlayer";
import "./DestinationDetail.css";

/* ═══════════════════════════════════════════════════════════
   INLINE SVG ICON SYSTEM — Zero external dependencies
═══════════════════════════════════════════════════════════ */
const paths = {
  clock:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:
    "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar:
    "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  mapPin:
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  globe:
    "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  plane: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  compass:
    "M12 2a10 10 0 100 20 10 10 0 000-20zm4.24 5.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  camera:
    "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x: "M18 6L6 18M6 6l12 12",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  checkCircle:
    "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  shield:
    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  headphones:
    "M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z",
  award:
    "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  messageCircle:
    "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  arrowDown: "M12 5v14M19 12l-7 7-7-7",
  arrowRight: "M5 12h14M12 5l7 7-7 7",
  sparkles:
    "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 8l.5 1.5L21 10l-1.5.5L19 12l-.5-1.5L17 10l1.5-.5L19 8z",
  flame:
    "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7.5.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 001.5 3z",
  leaf: "M11 20A7 7 0 009.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  sun: "M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.73 12.73l1.41 1.41M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.41-1.41M12 17a5 5 0 100-10 5 5 0 000 10z",
  cloudSun:
    "M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 17.66l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M17.07 4.93l1.41-1.41M17 12a5 5 0 10-9.58 2",
  snowflake:
    "M12 2v20m5.66-16.34L12 12M6.34 6.34L12 12m10 0H2m15.66 5.66L12 12M6.34 17.66L12 12",
  alertTriangle:
    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01",
  lightbulb:
    "M9 21h6m-3-18a6 6 0 00-4 10.47V17a1 1 0 001 1h6a1 1 0 001-1v-3.53A6 6 0 0012 3z",
  info: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  backpack:
    "M4 10l-.33 8.17A2 2 0 005.66 20h12.68a2 2 0 001.99-1.83L20 10M4 10h16M4 10l1-6h14l1 6M8 10V5m8 5V5m-4 10v2",
  stethoscope:
    "M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3",
  syringe:
    "M18 2l4 4m-5 2l3-3M19 9l-8.7 8.7A2.8 2.8 0 017.1 21L3 21l0-4.1a2.8 2.8 0 013.3-3.2L15 5z",
  pill: "M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7zM8.5 8.5l7 7",
  clipboardList:
    "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1zM12 11h4m-4 5h4M8 11h.01M8 16h.01",
  ticket:
    "M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2zM13 5v2m0 12v2m0-8v2",
  theater:
    "M2 10s3-3 5-3 5 3 5 3 3-3 5-3 5 3 5 3M2 14s3-3 5-3 5 3 5 3 3-3 5-3 5 3 5 3",
  thumbsUp:
    "M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m7-2V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z",
  building:
    "M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2m12-13h2a2 2 0 012 2v9a2 2 0 01-2 2h-2",
  route:
    "M3 7h2.59a1 1 0 01.7.3l2.42 2.41a1 1 0 00.71.29h3.17a1 1 0 00.7-.29l2.42-2.41a1 1 0 01.71-.3H21",
  road: "M18 6H5a2 2 0 00-2 2v3a2 2 0 002 2h13l4-3.5L18 6zM12 13v8m0-15V2",
  binoculars:
    "M21 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM3 9V5l3.5 3.5M21 9V5l-3.5 3.5M10 12.5h4",
  footprints:
    "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5 10 7.89 8 9 8 11v5",
  sunrise:
    "M17 18a5 5 0 10-10 0m5-16v7M4.22 10.22l1.42 1.42M1 18h2m18 0h2M18.36 11.64l1.42-1.42M23 22H1M8 6l4-4 4 4",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  fish: "M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6zM18 12h.01",
  mountain: "M8 3l4 8 5-5 5 15H2L8 3z",
  waves:
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1",
  ship: "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76",
  bird: "M16 7h.01M3.4 18H12a8 8 0 008-8V7a4 4 0 00-7.28-2.3L2 20",
  trees:
    "M10 10v11m0-11L8 4l-2 6m4 0l2-6-2 6m8 0v11m0-11l-2-4-2 4m4 0l2-4-2 4",
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  utensils:
    "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20m14-7V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  pawPrint:
    "M12 10a2 2 0 100 4 2 2 0 000-4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM8 6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
  map: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  bus: "M4 6L2 16a2 2 0 002 2h16a2 2 0 002-2L20 6M4 6h16m-12 0l1-4h6l1 4M7.5 16h.01M16.5 16h.01",
  barChart: "M18 20V10M12 20V4M6 20v-6",
  zoomIn:
    "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35M11 8v6m-3-3h6",
  heart:
    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  externalLink:
    "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3",
  download:
    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3",
  share2: "M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zm12 3a3 3 0 100 6 3 3 0 000-6zM8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98",
  refresh:
    "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  maximize: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
};

const Icon = ({ name, size = 20, className = "", style = {}, sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`dd-icon ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path d={paths[name] || paths.compass} />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   SCROLL CONTEXT — Shared scroll progress
═══════════════════════════════════════════════════════════ */
const ScrollCtx = createContext(0);

const ScrollProvider = ({ children }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <ScrollCtx.Provider value={progress}>{children}</ScrollCtx.Provider>;
};

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */
const useScreen = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { w, mob: w < 640, tab: w >= 640 && w < 1024, desk: w >= 1024 };
};

const useInView = (opts = {}) => {
  const { threshold = 0.1, rootMargin = "0px 0px -60px 0px", once = true } =
    opts;
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          if (once) obs.disconnect();
        } else if (!once) setVis(false);
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, vis];
};

/* ═══════════════════════════════════════════════════════════
   TEXT REVEAL ANIMATIONS — Multiple unique styles
═══════════════════════════════════════════════════════════ */

// 1. Classic typewriter — letter by letter with blinking cursor
const useTypewriter = (text = "", speed = 36, startDelay = 80) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [ref, vis] = useInView({ threshold: 0.25 });
  const started = useRef(false);

  useEffect(() => {
    if (!vis || !text || started.current) return;
    started.current = true;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(iv);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t);
  }, [vis, text, speed, startDelay]);

  return { ref, displayed, done, vis };
};

// 2. Word-by-word cascade reveal
const WordCascade = ({ text, className = "", tag: Tag = "h2", delay = 0 }) => {
  const [ref, vis] = useInView({ threshold: 0.3 });
  const words = (text || "").split(" ");

  return (
    <Tag ref={ref} className={`dd-word-cascade ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="dd-word-cascade__word"
          style={{
            transitionDelay: vis ? `${delay + i * 80}ms` : "0ms",
            opacity: vis ? 1 : 0,
            transform: vis
              ? "translateY(0) rotateX(0)"
              : "translateY(100%) rotateX(-80deg)",
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </Tag>
  );
};

// 3. Character split reveal — each character emerges from below
const CharSplit = ({
  text,
  className = "",
  tag: Tag = "h2",
  stagger = 25,
  delay = 0,
}) => {
  const [ref, vis] = useInView({ threshold: 0.3 });
  const chars = (text || "").split("");

  return (
    <Tag ref={ref} className={`dd-char-split ${className}`}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="dd-char-split__char"
          style={{
            transitionDelay: vis ? `${delay + i * stagger}ms` : "0ms",
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(110%)",
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </Tag>
  );
};

// 4. Line-by-line wipe reveal
const LineReveal = ({ children, delay = 0, className = "" }) => {
  const [ref, vis] = useInView({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`dd-line-reveal ${vis ? "dd-line-reveal--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// 5. Counter with easing
const useCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const [ref, vis] = useInView({ threshold: 0.35 });
  const ran = useRef(false);

  useEffect(() => {
    if (!vis || !target || ran.current) return;
    ran.current = true;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    if (!num) { setCount(0); return; }
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * num));
      if (p >= 1) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [vis, target, duration]);

  return { ref, count, vis };
};

/* ═══════════════════════════════════════════════════════════
   MERGE / ASSEMBLE ANIMATION — Sections slide into view
   from different directions
═══════════════════════════════════════════════════════════ */
const MergeIn = ({
  children,
  from = "bottom",
  delay = 0,
  distance = 60,
  className = "",
}) => {
  const [ref, vis] = useInView({ threshold: 0.05, rootMargin: "0px 0px -30px 0px" });

  const transforms = {
    bottom: `translateY(${distance}px)`,
    top: `translateY(-${distance}px)`,
    left: `translateX(-${distance}px)`,
    right: `translateX(${distance}px)`,
    scale: `scale(0.88)`,
    "bottom-left": `translate(-${distance * 0.5}px, ${distance}px)`,
    "bottom-right": `translate(${distance * 0.5}px, ${distance}px)`,
  };

  return (
    <div
      ref={ref}
      className={`dd-merge ${vis ? "dd-merge--visible" : ""} ${className}`}
      style={{
        "--merge-transform": transforms[from] || transforms.bottom,
        "--merge-delay": `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACTIVITY ICON MAP
═══════════════════════════════════════════════════════════ */
const ACT_ICONS = {
  "Game drives": "car",
  "Hot air balloon safari": "sunrise",
  "Bush walks": "footprints",
  "Cultural village visits": "home",
  "Bird watching": "bird",
  "Photography safaris": "camera",
  "Night game drives": "moon",
  "Bush breakfast": "utensils",
  Hiking: "mountain",
  Snorkeling: "waves",
  Swimming: "waves",
  "Boat safari": "ship",
  "Camel riding": "compass",
  "Gorilla trekking": "binoculars",
  "Chimpanzee tracking": "binoculars",
  "Nile boat safari": "ship",
  "Waterfall hike": "waves",
  "Sport fishing": "fish",
  "Great Migration viewing": "binoculars",
  "Mara River crossing watching": "eye",
  "Maasai village cultural visit": "home",
  "Sundowner bush dinners": "sunrise",
  "Nature walks": "trees",
};

const PHASE = {
  "before-travel": { color: "#166534", bg: "var(--dd-g50)", label: "Before Travel" },
  "on-arrival": { color: "#14532D", bg: "#F0FDF4", label: "On Arrival" },
  "during-stay": { color: "#065F46", bg: "#ECFDF5", label: "During Stay" },
  departure: { color: "#374151", bg: "#F9FAFB", label: "Departure" },
};

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const progress = useContext(ScrollCtx);
  return (
    <div className="dd-scroll-progress">
      <div
        className="dd-scroll-progress__bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */
const Skel = ({ w = "100%", h = 20, r = 10, mb = 0 }) => (
  <div className="dd-skel" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

const SkeletonPage = () => (
  <div className="dd-skeleton-page">
    <div className="dd-skeleton-hero"><Skel w="100%" h="100%" r={0} /></div>
    <div className="dd-container" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <div className="dd-skeleton-stats">
        {[1, 2, 3, 4, 5].map((i) => <Skel key={i} h={100} r={16} />)}
      </div>
      <div style={{ marginTop: 52 }}>
        <Skel w={300} h={40} mb={16} />
        <Skel w="65%" h={16} mb={12} />
        <Skel w="85%" h={14} mb={12} />
        <Skel w="55%" h={14} />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ERROR
═══════════════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate }) => (
  <div className="dd-error-state">
    <div className="dd-error-state__glow" />
    <div className="dd-error-state__icon">
      <Icon name="map" size={64} />
    </div>
    <h2>Destination Not Found</h2>
    <p>{error || "This destination doesn't exist or may have been removed."}</p>
    <div className="dd-error-state__btns">
      <button className="dd-btn dd-btn--ghost" onClick={() => navigate(-1)}>
        <Icon name="chevronLeft" size={16} /> Go Back
      </button>
      <button className="dd-btn dd-btn--primary" onClick={() => navigate("/destinations")}>
        Browse Destinations
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION CONTAINER — Unified section wrapper
═══════════════════════════════════════════════════════════ */
const Section = ({ children, id, variant = "white", className = "", style }) => (
  <section
    id={id}
    className={`dd-sec dd-sec--${variant} ${className}`}
    style={style}
  >
    {children}
  </section>
);

const SectionTitle = ({
  children,
  sub,
  icon,
  center,
  revealType = "typewriter",
  delay = 0,
}) => {
  const text = typeof children === "string" ? children : "";
  const tw = useTypewriter(revealType === "typewriter" ? text : "", 34, 60 + delay);

  const renderTitle = () => {
    switch (revealType) {
      case "cascade":
        return <WordCascade text={text} className="dd-sec-title__h2" delay={delay} />;
      case "chars":
        return (
          <CharSplit
            text={text}
            className="dd-sec-title__h2"
            stagger={22}
            delay={delay}
          />
        );
      case "typewriter":
      default:
        return (
          <h2 ref={tw.ref} className="dd-sec-title__h2">
            {tw.displayed}
            {!tw.done && tw.vis && <span className="dd-cursor" />}
          </h2>
        );
    }
  };

  return (
    <div className={`dd-sec-title ${center ? "dd-sec-title--center" : ""}`}>
      {icon && (
        <LineReveal delay={delay}>
          <div className="dd-sec-title__icon">
            <Icon name={icon} size={22} />
          </div>
        </LineReveal>
      )}
      {renderTitle()}
      {sub && (
        <LineReveal delay={delay + 200}>
          <p className="dd-sec-title__sub">{sub}</p>
        </LineReveal>
      )}
      <LineReveal delay={delay + 350}>
        <div className="dd-sec-title__bar" />
      </LineReveal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════ */
const Hero = ({ d, size }) => {
  const allImgs = useMemo(
    () =>
      [d.heroImage, d.imageUrl, ...(d.images || []), ...(d.gallery || []).map((g) => g.imageUrl)]
        .filter(Boolean),
    [d]
  );
  const heroImgs = useMemo(() => [...new Set(allImgs)].slice(0, 6), [allImgs]);
  const [slide, setSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (heroImgs.length <= 1) return;
    const iv = setInterval(() => setSlide((p) => (p + 1) % heroImgs.length), 6000);
    return () => clearInterval(iv);
  }, [heroImgs.length]);

  return (
    <header className={`dd-hero ${loaded ? "dd-hero--loaded" : ""}`}>
      {/* Slides */}
      <div className="dd-hero__slides" aria-hidden="true">
        {heroImgs.length > 0 ? (
          heroImgs.map((img, i) => (
            <div key={i} className={`dd-hero__slide ${slide === i ? "active" : ""}`}>
              <img src={img} alt="" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))
        ) : (
          <div className="dd-hero__slide active dd-hero__slide--empty">
            <Icon name="mountain" size={140} style={{ opacity: 0.08 }} />
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="dd-hero__film" />
      <div className="dd-hero__vignette" />
      <div className="dd-hero__gradient" />
      <div className="dd-hero__bottom-line" />

      {/* Dots */}
      {heroImgs.length > 1 && (
        <div className="dd-hero__dots">
          {heroImgs.map((_, i) => (
            <button
              key={i}
              className={`dd-hero__dot ${slide === i ? "active" : ""}`}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="dd-hero__nav" aria-label="Breadcrumb">
        <div className="dd-container">
          <ol className="dd-hero__crumbs">
            <li>
              <Link to="/destinations">Destinations</Link>
            </li>
            {(d.country || d.countryObj?.name) && (
              <li>
                <Link to={`/country/${d.countrySlug || d.countryObj?.slug}`}>
                  {d.countryFlag && <span>{d.countryFlag}</span>}
                  {d.country || d.countryObj?.name}
                </Link>
              </li>
            )}
            <li aria-current="page">{d.name}</li>
          </ol>
        </div>
      </nav>

      {/* Body */}
      <div className="dd-container dd-hero__body">
        {/* Tags */}
        <MergeIn from="left" delay={200}>
          <div className="dd-hero__chips">
            {d.isFeatured && (
              <span className="dd-chip dd-chip--gold"><Icon name="star" size={12} /> Featured</span>
            )}
            {d.isPopular && (
              <span className="dd-chip dd-chip--gold"><Icon name="flame" size={12} /> Popular</span>
            )}
            {d.isNew && (
              <span className="dd-chip dd-chip--mint"><Icon name="sparkles" size={12} /> New</span>
            )}
            {d.isEcoFriendly && (
              <span className="dd-chip dd-chip--eco"><Icon name="leaf" size={12} /> Eco</span>
            )}
            {d.destinationType && (
              <span className="dd-chip dd-chip--glass">{d.destinationType}</span>
            )}
          </div>
        </MergeIn>

        {/* Title */}
        <CharSplit
          text={d.name || ""}
          tag="h1"
          className="dd-hero__title"
          stagger={40}
          delay={500}
        />

        {d.tagline && (
          <MergeIn from="bottom" delay={900}>
            <p className="dd-hero__tagline">{d.tagline}</p>
          </MergeIn>
        )}

        {/* Meta */}
        <MergeIn from="bottom" delay={1100}>
          <div className="dd-hero__meta">
            {d.rating > 0 && (
              <div className="dd-hero__rating">
                <Icon name="star" size={16} className="dd-hero__star-icon" />
                <span className="dd-hero__rating-val">{d.rating.toFixed(1)}</span>
                {d.reviewCount > 0 && (
                  <span className="dd-hero__rating-cnt">({d.reviewCount.toLocaleString()})</span>
                )}
              </div>
            )}
            {d.duration && (
              <span className="dd-chip dd-chip--dark"><Icon name="clock" size={12} /> {d.duration}</span>
            )}
            {d.difficulty && (
              <span className={`dd-chip dd-chip--diff-${d.difficulty}`}>{d.difficulty}</span>
            )}
            {d.category && <span className="dd-chip dd-chip--dark">{d.category}</span>}
          </div>
        </MergeIn>

        {/* CTAs */}
        <MergeIn from="bottom" delay={1300}>
          <div className="dd-hero__ctas">
            <button
              className="dd-btn dd-btn--primary dd-btn--lg"
              onClick={() =>
                document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Discover More <Icon name="arrowDown" size={16} />
            </button>
            <button
              className="dd-btn dd-btn--outline-light dd-btn--lg"
              onClick={() =>
                document.getElementById("contact-sidebar")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Plan Your Visit
            </button>
          </div>
        </MergeIn>
      </div>

      {/* Scroll hint */}
      {!size.mob && (
        <div className="dd-hero__scroll-hint">
          <span>Scroll</span>
          <div className="dd-hero__scroll-track">
            <div className="dd-hero__scroll-thumb" />
          </div>
        </div>
      )}
    </header>
  );
};

/* ═══════════════════════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, rawValue, accent, i }) => {
  const isNum = /^[\d.]+/.test(String(rawValue).replace(/[^0-9.]/g, ""));
  const num = parseFloat(String(rawValue).replace(/[^0-9.]/g, "")) || 0;
  const suffix = String(rawValue).replace(/[\d.]+/, "").trim();
  const { ref, count, vis } = useCounter(isNum && num > 1 ? num : 0, 1200);
  const display = isNum && num > 1 ? `${count}${suffix ? ` ${suffix}` : ""}` : rawValue;

  return (
    <MergeIn from="bottom" delay={i * 100} className="dd-stat-merge">
      <div ref={ref} className="dd-stat">
        <div className="dd-stat__icon-ring">
          <Icon name={icon} size={20} />
        </div>
        <span className="dd-stat__label">{label}</span>
        <span className={`dd-stat__val ${accent ? "dd-stat__val--accent" : ""}`}>
          {vis ? display : rawValue}
        </span>
      </div>
    </MergeIn>
  );
};

const StatsBar = ({ d }) => {
  const stats = [
    { icon: "clock", label: "Duration", value: d.duration || (d.durationDays ? `${d.durationDays} Days` : null) },
    { icon: "barChart", label: "Difficulty", value: d.difficulty },
    { icon: "star", label: "Rating", value: d.rating ? `${d.rating.toFixed(1)} / 5` : null, accent: true },
    { icon: "users", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize}` : null },
    { icon: "calendar", label: "Best Season", value: d.bestTimeToVisit },
  ].filter((s) => s.value);

  if (!stats.length) return null;

  return (
    <div className="dd-stats-bar">
      <div className="dd-container">
        <div className="dd-stats-bar__row">
          {stats.map((s, i) => (
            <StatCard key={i} i={i} icon={s.icon} label={s.label} rawValue={s.value} accent={s.accent} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
const Sidebar = ({ d, navigate }) => {
  const rows = [
    { icon: "clock", label: "Operating Hours", val: d.operatingHours },
    { icon: "building", label: "Nearest City", val: d.nearestCity },
    { icon: "plane", label: "Nearest Airport", val: d.nearestAirport },
    { icon: "calendar", label: "Best Time", val: d.bestTimeToVisit },
    { icon: "users", label: "Group Size", val: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize}` : null },
    { icon: "info", label: "Min Age", val: d.minAge ? `${d.minAge}+ years` : null },
  ].filter((r) => r.val);

  return (
    <aside id="contact-sidebar" className="dd-aside">
      <MergeIn from="right" delay={200}>
        <div className="dd-aside__card">
          {/* Header */}
          <div className="dd-aside__header">
            <div className="dd-aside__orb dd-aside__orb--1" />
            <div className="dd-aside__orb dd-aside__orb--2" />
            <div className="dd-aside__globe"><Icon name="globe" size={42} /></div>
            <h3>Plan Your Visit</h3>
            <p>Let our experts design your perfect {d.name} experience</p>
          </div>

          {/* Body */}
          <div className="dd-aside__body">
            <button onClick={() => navigate("/contact")} className="dd-btn dd-btn--primary dd-btn--full">
              <Icon name="mail" size={17} /> Enquire Now
            </button>
            <button onClick={() => navigate("/contact")} className="dd-btn dd-btn--outline-green dd-btn--full">
              <Icon name="messageCircle" size={17} /> Talk to an Expert
            </button>

            {rows.length > 0 && (
              <>
                <div className="dd-aside__hr" />
                <ul className="dd-aside__info-list">
                  {rows.map((r, i) => (
                    <li key={i}>
                      <div className="dd-aside__info-icon"><Icon name={r.icon} size={15} /></div>
                      <div>
                        <span className="dd-aside__info-label">{r.label}</span>
                        <span className="dd-aside__info-val">{r.val}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Trust */}
            <div className="dd-aside__trust">
              {[
                { icon: "award", t: "Expert Guides" },
                { icon: "shield", t: "Safe Travel" },
                { icon: "headphones", t: "24/7 Support" },
              ].map((item, i) => (
                <div key={i} className="dd-aside__trust-item">
                  <Icon name={item.icon} size={18} />
                  <span>{item.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MergeIn>
    </aside>
  );
};

/* ═══════════════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════════════ */
const OverviewSec = ({ d, navigate }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  return (
    <Section id="overview">
      <div className="dd-container">
        <div className="dd-layout-2col">
          <div className="dd-layout-2col__main">
            <SectionTitle
              icon="compass"
              sub={`Discover what makes ${d.name} extraordinary`}
              revealType="cascade"
            >
              About This Destination
            </SectionTitle>

            {d.overview && (
              <MergeIn from="left" delay={200}>
                <blockquote className="dd-quote">
                  <div className="dd-quote__mark">"</div>
                  <p>{d.overview}</p>
                </blockquote>
              </MergeIn>
            )}

            {desc && (
              <MergeIn from="bottom" delay={350}>
                <div className="dd-prose">
                  {desc.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </MergeIn>
            )}

            {(d.isFamilyFriendly || d.isEcoFriendly || d.minAge) && (
              <MergeIn from="bottom" delay={500}>
                <div className="dd-chip-row">
                  {d.isFamilyFriendly && (
                    <span className="dd-chip dd-chip--green-soft"><Icon name="users" size={13} /> Family Friendly</span>
                  )}
                  {d.isEcoFriendly && (
                    <span className="dd-chip dd-chip--green-soft"><Icon name="leaf" size={13} /> Eco-Certified</span>
                  )}
                  {d.minAge && (
                    <span className="dd-chip dd-chip--blue-soft"><Icon name="clipboardList" size={13} /> Min Age: {d.minAge}+</span>
                  )}
                </div>
              </MergeIn>
            )}
          </div>

          <div className="dd-layout-2col__aside">
            <Sidebar d={d} navigate={navigate} />
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   HIGHLIGHTS
═══════════════════════════════════════════════════════════ */
const HighlightsSec = ({ d }) => {
  const list = d.highlights || [];
  if (!list.length) return null;

  return (
    <Section id="highlights" variant="soft">
      <div className="dd-container">
        <SectionTitle
          icon="sparkles"
          sub={`What makes ${d.name} unforgettable`}
          center
          revealType="typewriter"
        >
          Highlights
        </SectionTitle>
        <div className="dd-highlights-grid">
          {list.map((h, i) => (
            <MergeIn key={i} from={i % 2 === 0 ? "bottom-left" : "bottom-right"} delay={i * 100}>
              <div className="dd-hl-card">
                <div className="dd-hl-card__num">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="dd-hl-card__body">
                  <p>{h}</p>
                </div>
                <div className="dd-hl-card__edge" />
              </div>
            </MergeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   BEST TIME
═══════════════════════════════════════════════════════════ */
const BestTimeSec = ({ d }) => {
  const pi = d.practicalInfo;
  const climate = pi?.climate;
  const bestTime = d.bestTimeToVisit;
  if (!bestTime && !climate) return null;

  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const best = climate?.bestMonths || [];
  const avoid = climate?.avoidMonths || [];

  const status = (m) => {
    const ml = m.toLowerCase();
    if (best.some((b) => b.toLowerCase().startsWith(ml) || ml.startsWith(b.slice(0, 3).toLowerCase()))) return "best";
    if (avoid.some((a) => a.toLowerCase().startsWith(ml) || ml.startsWith(a.slice(0, 3).toLowerCase()))) return "avoid";
    return "ok";
  };

  return (
    <Section id="best-time">
      <div className="dd-container">
        <SectionTitle icon="calendar" sub="Plan your visit at the perfect time" center revealType="chars">
          Best Time to Visit
        </SectionTitle>
        <div className={`dd-besttime ${best.length ? "" : "dd-besttime--single"}`}>
          <MergeIn from="left" delay={100}>
            <div className="dd-besttime__hero-card">
              <div className="dd-besttime__glow" />
              <Icon name="sun" size={52} className="dd-besttime__sun" />
              <span className="dd-besttime__label">Recommended</span>
              <h4 className="dd-besttime__val">{bestTime}</h4>
              {climate?.climateNotes && <p className="dd-besttime__note">{climate.climateNotes}</p>}
              {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                <div className="dd-chip-row dd-chip-row--center" style={{ marginTop: 14 }}>
                  {climate.avgTempLowC != null && (
                    <span className="dd-chip dd-chip--blue-soft"><Icon name="snowflake" size={12} /> {climate.avgTempLowC}°C Low</span>
                  )}
                  {climate.avgTempHighC != null && (
                    <span className="dd-chip dd-chip--amber-soft"><Icon name="sun" size={12} /> {climate.avgTempHighC}°C High</span>
                  )}
                </div>
              )}
            </div>
          </MergeIn>

          {best.length > 0 && (
            <MergeIn from="right" delay={200}>
              <div className="dd-besttime__cal">
                <span className="dd-besttime__cal-label">Monthly Guide</span>
                <div className="dd-besttime__grid">
                  {mons.map((m, i) => {
                    const s = status(m);
                    return (
                      <div key={m} className={`dd-besttime__cell dd-besttime__cell--${s}`}>
                        <span>{m}</span>
                        <div className="dd-besttime__pip" />
                      </div>
                    );
                  })}
                </div>
                <div className="dd-besttime__legend">
                  {[{ c: "best", l: "Best" }, { c: "ok", l: "OK" }, { c: "avoid", l: "Avoid" }].map((x) => (
                    <div key={x.c} className="dd-besttime__legend-item">
                      <div className={`dd-besttime__legend-dot dd-besttime__legend-dot--${x.c}`} />
                      {x.l}
                    </div>
                  ))}
                </div>
              </div>
            </MergeIn>
          )}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACTIVITIES
═══════════════════════════════════════════════════════════ */
const ActivitiesSec = ({ d }) => {
  const list = d.activities || [];
  if (!list.length) return null;

  return (
    <Section id="activities" variant="soft">
      <div className="dd-container">
        <SectionTitle icon="compass" sub="Experiences awaiting you" center revealType="cascade">
          Things To Do
        </SectionTitle>
        <div className="dd-act-grid">
          {list.map((act, i) => (
            <MergeIn key={i} from="scale" delay={i * 70}>
              <div className="dd-act-card">
                <div className="dd-act-card__ring">
                  <Icon name={ACT_ICONS[act] || "compass"} size={26} />
                </div>
                <h4>{act}</h4>
                <div className="dd-act-card__shine" />
              </div>
            </MergeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   WILDLIFE
═══════════════════════════════════════════════════════════ */
const WildlifeSec = ({ d }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;

  return (
    <Section id="wildlife">
      <div className="dd-container">
        <SectionTitle icon="pawPrint" sub={`Species found at ${d.name}`} center revealType="typewriter">
          Wildlife
        </SectionTitle>
        <div className="dd-wildlife-wrap">
          {list.map((a, i) => (
            <MergeIn key={i} from="scale" delay={i * 50}>
              <div className="dd-wildlife-pill">
                <div className="dd-wildlife-pill__dot" />
                <span>{a}</span>
              </div>
            </MergeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   GALLERY — Premium masonry-like responsive grid
═══════════════════════════════════════════════════════════ */
const GallerySec = ({ d, size }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const [viewMode, setViewMode] = useState("grid");
  const gallery = d.gallery || [];
  const imgs = useMemo(
    () =>
      gallery.length
        ? gallery.map((g) => g.imageUrl).filter(Boolean)
        : (d.images || []).filter(Boolean),
    [gallery, d.images]
  );
  if (!imgs.length) return null;

  const visible = imgs.slice(0, 12);
  const openLb = (i) => setLb({ open: true, idx: i });
  const closeLb = () => {
    setLb({ open: false, idx: 0 });
    document.body.style.overflow = "";
  };

  return (
    <Section id="gallery" variant="soft">
      <div className="dd-container">
        <div className="dd-gallery-head">
          <SectionTitle icon="camera" sub={`Stunning visuals from ${d.name}`}>
            Photo Gallery
          </SectionTitle>
          <div className="dd-gallery-head__controls">
            <span className="dd-gallery-head__count">
              <Icon name="camera" size={15} /> {visible.length} photos
            </span>
            <div className="dd-gallery-head__toggle">
              <button
                className={`dd-gallery-head__toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Icon name="grid" size={16} />
              </button>
              <button
                className={`dd-gallery-head__toggle-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <div className="dd-gallery-grid">
            {visible.map((img, i) => {
              const span =
                i === 0
                  ? "dd-gallery-grid__item--hero"
                  : i === 3 || i === 7
                  ? "dd-gallery-grid__item--wide"
                  : i === 5
                  ? "dd-gallery-grid__item--tall"
                  : "";
              return (
                <MergeIn key={i} from="scale" delay={i * 60}>
                  <div
                    className={`dd-gallery-grid__item ${span}`}
                    onClick={() => openLb(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openLb(i)}
                  >
                    <img src={img} alt={`${d.name} photo ${i + 1}`} loading="lazy" />
                    <div className="dd-gallery-grid__overlay">
                      <div className="dd-gallery-grid__zoom">
                        <Icon name="zoomIn" size={22} />
                      </div>
                    </div>
                  </div>
                </MergeIn>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="dd-gallery-list">
            {visible.map((img, i) => (
              <MergeIn key={i} from="left" delay={i * 60}>
                <div
                  className="dd-gallery-list__item"
                  onClick={() => openLb(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openLb(i)}
                >
                  <div className="dd-gallery-list__thumb">
                    <img src={img} alt={`${d.name} photo ${i + 1}`} loading="lazy" />
                  </div>
                  <div className="dd-gallery-list__info">
                    <span className="dd-gallery-list__num">Photo {i + 1}</span>
                    <span className="dd-gallery-list__name">{d.name}</span>
                  </div>
                  <div className="dd-gallery-list__action">
                    <Icon name="maximize" size={18} />
                  </div>
                </div>
              </MergeIn>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <Lightbox
        imgs={imgs}
        lb={lb}
        setLb={setLb}
        closeLb={closeLb}
        name={d.name}
      />
    </Section>
  );
};

const Lightbox = ({ imgs, lb, setLb, closeLb, name }) => {
  const prev = useCallback((e) => {
    e?.stopPropagation();
    setLb((p) => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
  }, [imgs.length, setLb]);

  const next = useCallback((e) => {
    e?.stopPropagation();
    setLb((p) => ({ ...p, idx: (p.idx + 1) % imgs.length }));
  }, [imgs.length, setLb]);

  useEffect(() => {
    if (!lb.open) return;
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lb.open, closeLb, prev, next]);

  if (!lb.open) return null;

  return (
    <div className="dd-lb" onClick={closeLb}>
      <div className="dd-lb__backdrop" />

      <button className="dd-lb__close" onClick={closeLb} aria-label="Close">
        <Icon name="x" size={22} />
      </button>

      <div className="dd-lb__stage" onClick={(e) => e.stopPropagation()}>
        <img src={imgs[lb.idx]} alt={`${name} ${lb.idx + 1}`} className="dd-lb__img" />
      </div>

      {imgs.length > 1 && (
        <>
          <button className="dd-lb__arrow dd-lb__arrow--prev" onClick={prev} aria-label="Previous">
            <Icon name="chevronLeft" size={26} />
          </button>
          <button className="dd-lb__arrow dd-lb__arrow--next" onClick={next} aria-label="Next">
            <Icon name="chevronRight" size={26} />
          </button>

          <div className="dd-lb__footer" onClick={(e) => e.stopPropagation()}>
            <div className="dd-lb__thumbstrip">
              {imgs.slice(0, 14).map((img, i) => (
                <button
                  key={i}
                  className={`dd-lb__thumb ${lb.idx === i ? "active" : ""}`}
                  onClick={() => setLb((p) => ({ ...p, idx: i }))}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
            <span className="dd-lb__counter">{lb.idx + 1} / {imgs.length}</span>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOW TO GET THERE
═══════════════════════════════════════════════════════════ */
const GetThereSec = ({ d, size }) => {
  const hgt = d.howToGetThere;
  const lat = hgt?.mapPosition?.lat ?? d.latitude;
  const lng = hgt?.mapPosition?.lng ?? d.longitude;
  const hasMap = lat && lng;

  const rows = [
    { icon: "plane", label: "Nearest Airport", val: hgt?.nearestAirport || d.nearestAirport, sub: hgt?.distanceFromAirport || (d.distanceFromAirportKm ? `${d.distanceFromAirportKm} km` : null) },
    { icon: "building", label: "Nearest City", val: hgt?.nearestCity || d.nearestCity },
    { icon: "route", label: "Drive from Capital", val: hgt?.driveTimeFromCapital && hgt?.countryCapital ? `${hgt.driveTimeFromCapital} from ${hgt.countryCapital}` : hgt?.driveTimeFromCapital },
    { icon: "road", label: "Road Conditions", val: hgt?.roadConditions },
  ].filter((r) => r.val);

  const transport = hgt?.transportOptions || [];
  const general = hgt?.generalInfo || d.gettingThere;
  if (!rows.length && !hasMap && !general && !transport.length) return null;

  return (
    <Section id="getting-there">
      <div className="dd-container">
        <SectionTitle icon="mapPin" sub="Directions and travel logistics" revealType="typewriter">
          How to Get There
        </SectionTitle>
        <div className={`dd-getthere ${hasMap && !size.mob ? "dd-getthere--map" : ""}`}>
          {hasMap && (
            <MergeIn from="left" delay={100}>
              <div className="dd-getthere__map">
                <iframe
                  title={`Map of ${d.name}`}
                  src={`https://www.google.com/maps?q=${lat},${lng}&z=12&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </MergeIn>
          )}

          <div className="dd-getthere__details">
            {transport.length > 0 && (
              <MergeIn from="right" delay={150}>
                <div className="dd-getthere__transport">
                  <span className="dd-mini-label">Transport Options</span>
                  <div className="dd-chip-row">
                    {transport.map((t, i) => {
                      const ic = t.toLowerCase().includes("flight") ? "plane" : t.toLowerCase().includes("bus") ? "bus" : "car";
                      return <span key={i} className="dd-chip dd-chip--green-soft"><Icon name={ic} size={13} /> {t}</span>;
                    })}
                  </div>
                </div>
              </MergeIn>
            )}

            {rows.map((row, i) => (
              <MergeIn key={i} from="right" delay={200 + i * 80}>
                <div className="dd-info-row">
                  <div className="dd-info-row__icon"><Icon name={row.icon} size={18} /></div>
                  <div className="dd-info-row__body">
                    <span className="dd-info-row__label">{row.label}</span>
                    <span className="dd-info-row__val">{row.val}</span>
                    {row.sub && <span className="dd-info-row__sub">{row.sub}</span>}
                  </div>
                </div>
              </MergeIn>
            ))}

            {general && (
              <MergeIn from="bottom" delay={400}>
                <div className="dd-getthere__note">
                  <Icon name="map" size={18} className="dd-getthere__note-icon" />
                  <div>
                    <strong>Getting There</strong>
                    <p>{general}</p>
                  </div>
                </div>
              </MergeIn>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   PRACTICAL INFO
═══════════════════════════════════════════════════════════ */
const PracticalSec = ({ d }) => {
  const pi = d.practicalInfo;
  const packing = pi?.packing?.essentials || [];
  const vaccReq = pi?.healthAndSafety?.vaccinationsRequired || [];
  const vaccRec = pi?.healthAndSafety?.vaccinationsRecommended || [];
  const malaria = pi?.healthAndSafety?.malariaRisk;
  const safetyNotes = pi?.healthAndSafety?.safetyNotes;
  const permits = pi?.permitsAndRegulations?.permitsRequired || [];
  const leadTime = pi?.permitsAndRegulations?.bookingLeadTime;
  const visitorLimits = pi?.permitsAndRegulations?.visitorLimits;
  const etiquette = pi?.culture?.localEtiquette || [];
  const tipping = pi?.culture?.tippingCulture;
  const photoRules = pi?.culture?.photographyRules;

  const alerts = [
    { icon: "lightbulb", title: "Local Tips", text: d.localTips, theme: "amber" },
    { icon: "alertTriangle", title: "Safety Info", text: d.safetyInfo, theme: "rose" },
  ].filter((c) => c.text);

  const cards = [];
  if (packing.length) cards.push({ type: "packing", packing, clothingTips: pi?.packing?.clothingTips });
  if (vaccReq.length || vaccRec.length || malaria) cards.push({ type: "health", vaccReq, vaccRec, malaria, safetyNotes });
  if (permits.length || leadTime || visitorLimits) cards.push({ type: "permits", permits, leadTime, visitorLimits });
  if (etiquette.length || tipping || photoRules) cards.push({ type: "culture", etiquette, tipping, photoRules });

  if (!cards.length && !alerts.length) return null;

  const cardHeaders = {
    packing: { icon: "backpack", title: "What to Pack", theme: "green" },
    health: { icon: "stethoscope", title: "Health Requirements", theme: "amber" },
    permits: { icon: "clipboardList", title: "Permits & Regulations", theme: "blue" },
    culture: { icon: "theater", title: "Local Culture", theme: "purple" },
  };

  return (
    <Section id="practical" variant="soft">
      <div className="dd-container">
        <SectionTitle icon="clipboardList" sub="Everything you need to know" center revealType="cascade">
          Practical Information
        </SectionTitle>

        {alerts.length > 0 && (
          <div className="dd-prac-alerts">
            {alerts.map((a, i) => (
              <MergeIn key={i} from="top" delay={i * 100}>
                <div className={`dd-alert dd-alert--${a.theme}`}>
                  <Icon name={a.icon} size={20} className="dd-alert__icon" />
                  <div>
                    <h4 className="dd-alert__title">{a.title}</h4>
                    <p className="dd-alert__text">{a.text}</p>
                  </div>
                </div>
              </MergeIn>
            ))}
          </div>
        )}

        <div className="dd-prac-grid">
          {cards.map((card, ci) => {
            const hdr = cardHeaders[card.type];
            return (
              <MergeIn key={ci} from="bottom" delay={ci * 120}>
                <div className="dd-prac-card">
                  <div className={`dd-prac-card__hdr dd-prac-card__hdr--${hdr.theme}`}>
                    <Icon name={hdr.icon} size={20} />
                    <h4>{hdr.title}</h4>
                  </div>
                  <div className="dd-prac-card__body">
                    {card.type === "packing" && (
                      <>
                        <div className="dd-chip-row">{card.packing.map((p, i) => (
                          <span key={i} className="dd-chip dd-chip--green-soft"><Icon name="check" size={11} /> {p}</span>
                        ))}</div>
                        {card.clothingTips && <p className="dd-prac-card__note">{card.clothingTips}</p>}
                      </>
                    )}
                    {card.type === "health" && (
                      <>
                        {card.malaria && (
                          <div className="dd-alert dd-alert--rose dd-alert--sm">
                            <Icon name="alertTriangle" size={14} />
                            <span>Malaria Risk: {card.malaria}</span>
                          </div>
                        )}
                        {card.vaccReq.length > 0 && (
                          <div className="dd-prac-card__group">
                            <span className="dd-mini-label dd-mini-label--rose">Required</span>
                            <div className="dd-chip-row">{card.vaccReq.map((v, i) => (
                              <span key={i} className="dd-chip dd-chip--rose-soft"><Icon name="syringe" size={11} /> {v}</span>
                            ))}</div>
                          </div>
                        )}
                        {card.vaccRec.length > 0 && (
                          <div className="dd-prac-card__group">
                            <span className="dd-mini-label dd-mini-label--amber">Recommended</span>
                            <div className="dd-chip-row">{card.vaccRec.map((v, i) => (
                              <span key={i} className="dd-chip dd-chip--amber-soft"><Icon name="pill" size={11} /> {v}</span>
                            ))}</div>
                          </div>
                        )}
                        {card.safetyNotes && <p className="dd-prac-card__note">{card.safetyNotes}</p>}
                      </>
                    )}
                    {card.type === "permits" && (
                      <>
                        {card.permits.length > 0 && (
                          <div className="dd-prac-card__group">
                            <span className="dd-mini-label">Required Permits</span>
                            <div className="dd-chip-row">{card.permits.map((p, i) => (
                              <span key={i} className="dd-chip dd-chip--blue-soft"><Icon name="ticket" size={11} /> {p}</span>
                            ))}</div>
                          </div>
                        )}
                        {[{ l: "Booking Lead Time", v: card.leadTime }, { l: "Visitor Limits", v: card.visitorLimits }]
                          .filter((r) => r.v)
                          .map((r, i) => (
                            <div key={i} className="dd-prac-card__kv">
                              <span>{r.l}</span><span>{r.v}</span>
                            </div>
                          ))}
                      </>
                    )}
                    {card.type === "culture" && (
                      <>
                        {card.etiquette.length > 0 && (
                          <ul className="dd-prac-card__list">
                            {card.etiquette.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        )}
                        {card.tipping && <p className="dd-prac-card__note"><strong>Tipping:</strong> {card.tipping}</p>}
                        {card.photoRules && <p className="dd-prac-card__note"><strong>Photography:</strong> {card.photoRules}</p>}
                      </>
                    )}
                  </div>
                </div>
              </MergeIn>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   TIPS
═══════════════════════════════════════════════════════════ */
const TipsSec = ({ d }) => {
  const tips = d.tips || [];
  if (!tips.length) return null;

  return (
    <Section id="tips">
      <div className="dd-container">
        <SectionTitle icon="lightbulb" sub={`Expert advice for ${d.name}`} revealType="typewriter">
          Travel Tips
        </SectionTitle>
        <div className="dd-tips-grid">
          {tips.map((tip, i) => {
            const phase = PHASE[tip.tripPhase] || PHASE["during-stay"];
            return (
              <MergeIn key={i} from="bottom" delay={i * 90}>
                <article className="dd-tip">
                  <div className="dd-tip__phase" style={{ background: phase.bg }} />
                  <div className="dd-tip__head">
                    <span className="dd-tip__phase-label" style={{ color: phase.color }}>{phase.label}</span>
                    {tip.category && <span className="dd-tip__cat">{tip.category}</span>}
                    {tip.isFeatured && <Icon name="star" size={13} className="dd-tip__star" />}
                  </div>
                  <div className="dd-tip__content">
                    {tip.headline && <h4>{tip.headline}</h4>}
                    <p>{tip.summary}</p>
                    {tip.checklist?.length > 0 && (
                      <ul className="dd-tip__checklist">
                        {tip.checklist.slice(0, 4).map((item, j) => (
                          <li key={j}><Icon name="check" size={12} className="dd-tip__check" />{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </MergeIn>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════════════════════ */
const ReviewsSec = ({ d }) => {
  const reviews = d.reviews || [];
  const agg = d.reviewAggregate;
  if (!reviews.length && !agg) return null;

  const total = agg?.totalReviews || d.reviewCount || 0;
  const avg = agg?.avgRating || d.rating || 0;
  const dist = agg?.distribution;
  const bars = dist ? [
    { l: "5★", c: dist.fiveStar },
    { l: "4★", c: dist.fourStar },
    { l: "3★", c: dist.threeStar },
    { l: "2★", c: dist.twoStar },
    { l: "1★", c: dist.oneStar },
  ] : [];

  const { ref: cRef, count: cCount, vis: cVis } = useCounter(avg * 10, 1400);

  return (
    <Section id="reviews" variant="soft">
      <div className="dd-container">
        <SectionTitle icon="messageCircle" sub="What travellers say" center revealType="chars">
          Reviews
        </SectionTitle>

        {agg && (
          <MergeIn from="bottom" delay={100}>
            <div ref={cRef} className="dd-reviews-agg">
              <div className="dd-reviews-agg__score">
                <span className="dd-reviews-agg__num">{cVis ? (cCount / 10).toFixed(1) : avg.toFixed(1)}</span>
                <div className="dd-reviews-agg__stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={18} className={i < Math.round(avg) ? "dd-star--on" : "dd-star--off"} />
                  ))}
                </div>
                <span className="dd-reviews-agg__total">{total.toLocaleString()} reviews</span>
              </div>
              {bars.length > 0 && (
                <div className="dd-reviews-agg__bars">
                  {bars.map((b) => {
                    const pct = total > 0 ? Math.round((b.c / total) * 100) : 0;
                    return (
                      <div key={b.l} className="dd-bar">
                        <span className="dd-bar__label">{b.l}</span>
                        <div className="dd-bar__track">
                          <div className="dd-bar__fill" style={{ width: cVis ? `${pct}%` : "0%" }} />
                        </div>
                        <span className="dd-bar__pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </MergeIn>
        )}

        {reviews.length > 0 && (
          <div className="dd-reviews-grid">
            {reviews.map((rev, i) => (
              <MergeIn key={i} from={i % 2 === 0 ? "bottom-left" : "bottom-right"} delay={i * 100}>
                <div className="dd-rev">
                  <div className="dd-rev__top">
                    <div className="dd-rev__avatar">
                      {rev.reviewerAvatar ? <img src={rev.reviewerAvatar} alt="" /> : <span>{(rev.reviewerName || "A")[0]}</span>}
                    </div>
                    <div className="dd-rev__author">
                      <span className="dd-rev__name">{rev.reviewerName || "Anonymous"}</span>
                      <span className="dd-rev__meta">
                        {rev.reviewerCountry}{rev.tripDate && ` · ${new Date(rev.tripDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </span>
                    </div>
                    {rev.isVerified && <Icon name="checkCircle" size={16} className="dd-rev__verified" />}
                  </div>
                  <div className="dd-rev__stars">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Icon key={s} name="star" size={13} className={s < Math.round(rev.rating) ? "dd-star--on" : "dd-star--off"} />
                    ))}
                    <span>{rev.rating.toFixed(1)}</span>
                    {rev.tripType && <span className="dd-chip dd-chip--xs">{rev.tripType}</span>}
                  </div>
                  {rev.title && <p className="dd-rev__title">"{rev.title}"</p>}
                  <p className="dd-rev__body">{rev.content}</p>
                  {rev.helpfulCount > 0 && (
                    <div className="dd-rev__helpful"><Icon name="thumbsUp" size={12} /> {rev.helpfulCount} helpful</div>
                  )}
                </div>
              </MergeIn>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════════ */
const FAQSec = ({ d }) => {
  const [open, setOpen] = useState(null);
  const list = d.faqs || [];
  if (!list.length) return null;

  return (
    <Section id="faqs">
      <div className="dd-container dd-container--narrow">
        <SectionTitle icon="info" sub="Common questions answered" center revealType="cascade">
          Frequently Asked Questions
        </SectionTitle>
        <div className="dd-faqs">
          {list.map((faq, i) => (
            <MergeIn key={i} from="bottom" delay={i * 70}>
              <div className={`dd-faq ${open === i ? "dd-faq--open" : ""}`}>
                <button className="dd-faq__q" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="dd-faq__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="dd-faq__text">{faq.question}</span>
                  <div className="dd-faq__toggle">
                    <Icon name={open === i ? "x" : "plus"} size={14} />
                  </div>
                </button>
                <div className="dd-faq__answer">
                  <div className="dd-faq__answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </MergeIn>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════
   FOOTER CTA
═══════════════════════════════════════════════════════════ */
const FooterCTA = ({ d, navigate }) => {
  return (
    <section className="dd-cta-sec">
      <div className="dd-cta-sec__bg" />
      <div className="dd-cta-sec__orbs" aria-hidden="true">
        {[
          { s: 280, t: "3%", l: "1%", d: 0 },
          { s: 180, b: "5%", r: "2%", d: 2 },
          { s: 110, t: "28%", r: "12%", d: 1 },
          { s: 200, b: "2%", l: "12%", d: 3 },
        ].map((o, i) => (
          <div
            key={i}
            className="dd-cta-sec__orb"
            style={{ width: o.s, height: o.s, top: o.t, left: o.l, right: o.r, bottom: o.b, animationDelay: `${o.d}s` }}
          />
        ))}
      </div>

      <div className="dd-container dd-cta-sec__inner">
        <MergeIn from="scale" delay={0}>
          <div className="dd-cta-sec__globe">
            <Icon name="globe" size={36} />
          </div>
        </MergeIn>

        <WordCascade
          text={`Ready to Experience ${d.name}?`}
          className="dd-cta-sec__title"
          tag="h2"
          delay={200}
        />

        <MergeIn from="bottom" delay={600}>
          <p className="dd-cta-sec__sub">
            Our safari experts will craft a personalised journey just for you. Start planning your
            perfect adventure today.
          </p>
        </MergeIn>

        <MergeIn from="bottom" delay={800}>
          <div className="dd-cta-sec__btns">
            <button className="dd-btn dd-btn--primary dd-btn--lg" onClick={() => navigate("/contact")}>
              <Icon name="mail" size={17} /> Enquire About This Trip
            </button>
            {(d.countrySlug || d.countryObj?.slug) && (
              <Link to={`/country/${d.countrySlug || d.countryObj?.slug}`} className="dd-btn dd-btn--outline-light dd-btn--lg">
                More {d.country || d.countryObj?.name} Destinations <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>
        </MergeIn>

        <MergeIn from="bottom" delay={1000}>
          <div className="dd-cta-sec__trust">
            {[
              { icon: "award", t: "Expert Guides" },
              { icon: "checkCircle", t: "Verified" },
              { icon: "shield", t: "Safe & Ethical" },
              { icon: "headphones", t: "24/7 Support" },
            ].map((item, i) => (
              <div key={i} className="dd-cta-sec__trust-item">
                <Icon name={item.icon} size={24} />
                <span>{item.t}</span>
              </div>
            ))}
          </div>
        </MergeIn>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate = useNavigate();
  const size = useScreen();
  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [identifier]);

  if (loading) return <div className="dd"><SkeletonPage /></div>;
  if (error || !destination) return <div className="dd"><ErrorState error={error} navigate={navigate} /></div>;

  const d = destination;

  return (
    <ScrollProvider>
      <div className="dd">
        <ScrollProgress />
        <Hero d={d} size={size} />
        <StatsBar d={d} />
        <OverviewSec d={d} navigate={navigate} />
        <HighlightsSec d={d} />
        <BestTimeSec d={d} />
        <ActivitiesSec d={d} />
        <WildlifeSec d={d} />
        <GallerySec d={d} size={size} />
        <GetThereSec d={d} size={size} />
        <PracticalSec d={d} />
        <TipsSec d={d} />
        <ReviewsSec d={d} />
        <FAQSec d={d} />
        {(d.virtualTourUrl || d.videoUrl || (Array.isArray(d.videos) && d.videos.length > 0)) && (
          <Section variant="soft" style={{ paddingTop: 40, paddingBottom: 40 }}>
            <div className="dd-container">
              <MiniVideoPlayer
                title={`${d.name} Videos`}
                videos={[
                  ...(d.virtualTourUrl ? [{ url: d.virtualTourUrl, title: `${d.name} Virtual Tour` }] : []),
                  ...(d.videoUrl ? [{ url: d.videoUrl, title: `${d.name} Video` }] : []),
                  ...(Array.isArray(d.videos) ? d.videos : []),
                ].filter((v) => v?.url)}
              />
            </div>
          </Section>
        )}
        <FooterCTA d={d} navigate={navigate} />
      </div>
    </ScrollProvider>
  );
};

export default DestinationDetail;