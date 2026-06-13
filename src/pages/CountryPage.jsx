// src/pages/CountryPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCountry } from "../hooks/useCountries";
import {
  FiMapPin, FiUsers, FiGlobe, FiClock, FiPhone,
  FiWifi, FiDroplet, FiZap, FiArrowRight, FiX,
  FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiNavigation, FiSun, FiCalendar, FiInfo,
  FiCamera, FiShield, FiTrendingUp, FiBook,
  FiHeart, FiGrid, FiStar, FiFlag, FiAward,
  FiActivity, FiMap, FiAlertCircle, FiHome,
  FiCoffee, FiBriefcase, FiFeather, FiAnchor,
  FiEye, FiCheck, FiPlay,
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const T = {
  g50: "#ECFDF5", g100: "#D1FAE5", g200: "#A7F3D0",
  g300: "#6EE7B7", g400: "#34D399", g500: "#10B981",
  g600: "#059669", g700: "#047857", g800: "#065F46", g900: "#064E3B",
  n50: "#F8FAFC", n100: "#F1F5F9", n200: "#E2E8F0",
  n300: "#CBD5E1", n400: "#94A3B8", n500: "#64748B",
  n600: "#475569", n700: "#334155", n800: "#1E293B", n900: "#0F172A",
  white: "#FFFFFF",
  amber: "#F59E0B", amberLight: "#FEF3C7", amberDark: "#92400E",
  red: "#EF4444", redLight: "#FEF2F2",
  blue: "#3B82F6", blueLight: "#DBEAFE",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  sans: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'Playfair Display',Georgia,serif",
  mono: "'JetBrains Mono','Fira Code',monospace",
  max: "1320px",
  r: { xs: "4px", sm: "8px", md: "14px", lg: "20px", xl: "28px", xxl: "40px", full: "9999px" },
  sh: {
    xs: "0 1px 2px rgba(0,0,0,.04)",
    sm: "0 2px 4px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)",
    md: "0 4px 12px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04)",
    lg: "0 8px 24px rgba(0,0,0,.10),0 4px 8px rgba(0,0,0,.06)",
    xl: "0 16px 40px rgba(0,0,0,.12),0 8px 16px rgba(0,0,0,.06)",
    xxl: "0 32px 64px rgba(0,0,0,.16)",
    green: "0 8px 32px rgba(16,185,129,.28)",
    greenLg: "0 16px 48px rgba(16,185,129,.35)",
    glow: "0 0 0 3px rgba(16,185,129,.18)",
  },
};

/* ═══════════════════════════════════════════════════
   INJECT STYLES
═══════════════════════════════════════════════════ */
const injectStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("cp-styles")) return;
  const s = document.createElement("style");
  s.id = "cp-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    ::selection{background:${T.g200};color:${T.g900}}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:${T.n100}}
    ::-webkit-scrollbar-thumb{background:linear-gradient(${T.g400},${T.g600});border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:${T.g500}}

    /* ── Keyframes ── */
    @keyframes cp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes cp-fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cp-fadeDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cp-fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes cp-fadeLeft{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes cp-fadeRight{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes cp-scaleIn{from{opacity:0;transform:scale(.88) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes cp-heroZoom{from{transform:scale(1.12)}to{transform:scale(1)}}
    @keyframes cp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes cp-floatSlow{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(2deg)}}
    @keyframes cp-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes cp-spin{to{transform:rotate(360deg)}}
    @keyframes cp-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.97)}}
    @keyframes cp-slideRight{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes cp-typewriter{from{width:0}to{width:100%}}
    @keyframes cp-blink{0%,100%{border-right-color:${T.g500}}50%{border-right-color:transparent}}
    @keyframes cp-countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cp-ripple{0%{transform:scale(0);opacity:.8}100%{transform:scale(2.5);opacity:0}}
    @keyframes cp-gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes cp-particleFloat{0%{transform:translateY(0) translateX(0) scale(1);opacity:.8}100%{transform:translateY(-120px) translateX(var(--x,20px)) scale(0);opacity:0}}

    /* ── Skeleton ── */
    .cp-skel{
      background:linear-gradient(90deg,${T.n200} 25%,${T.n100} 50%,${T.n200} 75%);
      background-size:200% 100%;
      animation:cp-shimmer 1.8s ease-in-out infinite;
      border-radius:8px;
    }

    /* ── Reveal animations ── */
    .cp-fadeUp{animation:cp-fadeUp .75s cubic-bezier(.22,1,.36,1) forwards}
    .cp-fadeIn{animation:cp-fadeIn .5s ease forwards}
    .cp-fadeLeft{animation:cp-fadeLeft .65s cubic-bezier(.22,1,.36,1) forwards}
    .cp-fadeRight{animation:cp-fadeRight .65s cubic-bezier(.22,1,.36,1) forwards}
    .cp-scaleIn{animation:cp-scaleIn .45s cubic-bezier(.22,1,.36,1) forwards}
    .cp-float{animation:cp-float 3.8s ease-in-out infinite}
    .cp-floatSlow{animation:cp-floatSlow 5s ease-in-out infinite}

    /* ── Hover lifts ── */
    .cp-lift{transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s ease;will-change:transform}
    .cp-lift:hover{transform:translateY(-6px);box-shadow:${T.sh.xl}}
    .cp-lift-sm{transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease}
    .cp-lift-sm:hover{transform:translateY(-3px);box-shadow:${T.sh.md}}

    /* ── Image zoom ── */
    .cp-img-zoom{overflow:hidden}
    .cp-img-zoom img{transition:transform .6s cubic-bezier(.22,1,.36,1)}
    .cp-img-zoom:hover img{transform:scale(1.08)}

    /* ── Stagger ── */
    .cp-stagger>*{opacity:0;animation:cp-fadeUp .65s cubic-bezier(.22,1,.36,1) forwards}
    ${Array.from({length:16},(_,i)=>`.cp-stagger>*:nth-child(${i+1}){animation-delay:${i*70}ms}`).join("")}

    /* ── Nav scroll ── */
    .cp-nav-scroll{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
    .cp-nav-scroll::-webkit-scrollbar{display:none}

    /* ── Buttons ── */
    .cp-btn-primary{
      display:inline-flex;align-items:center;gap:9px;
      padding:15px 34px;
      background:linear-gradient(135deg,${T.g500} 0%,${T.g700} 100%);
      color:${T.white};border:none;border-radius:${T.r.md};
      font-size:15px;font-weight:700;cursor:pointer;font-family:${T.sans};
      text-decoration:none;transition:all .28s;box-shadow:${T.sh.green};
      position:relative;overflow:hidden;letter-spacing:.2px;
    }
    .cp-btn-primary::before{
      content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,${T.g400},${T.g600});
      opacity:0;transition:opacity .28s;
    }
    .cp-btn-primary:hover::before{opacity:1}
    .cp-btn-primary:hover{transform:translateY(-3px);box-shadow:${T.sh.greenLg}}
    .cp-btn-primary>*{position:relative;z-index:1}

    .cp-btn-outline{
      display:inline-flex;align-items:center;gap:9px;
      padding:15px 34px;background:rgba(255,255,255,.08);
      color:${T.white};border:2px solid rgba(255,255,255,.3);
      border-radius:${T.r.md};font-size:15px;font-weight:600;
      cursor:pointer;font-family:${T.sans};text-decoration:none;
      transition:all .28s;backdrop-filter:blur(8px);
    }
    .cp-btn-outline:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.7);transform:translateY(-3px)}

    .cp-btn-ghost{
      display:inline-flex;align-items:center;gap:7px;
      padding:10px 22px;background:transparent;
      color:${T.g600};border:2px solid ${T.g200};
      border-radius:${T.r.full};font-size:13px;font-weight:700;
      cursor:pointer;font-family:${T.sans};text-decoration:none;
      transition:all .25s;
    }
    .cp-btn-ghost:hover{background:${T.g50};border-color:${T.g400};color:${T.g700};transform:translateY(-2px)}

    /* ── Typewriter ── */
    .cp-typewriter{
      overflow:hidden;white-space:nowrap;
      border-right:3px solid ${T.g500};
      animation:cp-typewriter var(--dur,2.5s) steps(var(--chars,40)) forwards,
                cp-blink .75s step-end infinite;
      width:0;
    }
    .cp-typewriter.done{border-right-color:transparent;animation:cp-typewriter var(--dur,2.5s) steps(var(--chars,40)) forwards}

    /* ── Cards ── */
    .cp-card{
      background:${T.white};border-radius:${T.r.lg};
      border:1px solid ${T.n200};overflow:hidden;
      transition:all .32s cubic-bezier(.22,1,.36,1);
    }
    .cp-card:hover{border-color:${T.g200};box-shadow:${T.sh.lg}}
    .cp-card-glass{
      background:rgba(255,255,255,.85);
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      border:1px solid rgba(255,255,255,.6);
      border-radius:${T.r.lg};
    }
    .cp-card-green{
      background:linear-gradient(135deg,${T.g50} 0%,${T.white} 100%);
      border:1px solid ${T.g100};border-radius:${T.r.lg};
      transition:all .3s;
    }
    .cp-card-green:hover{border-color:${T.g300};box-shadow:${T.sh.green}}

    /* ── Stat cards ── */
    .cp-stat-card{
      background:${T.white};border-radius:${T.r.lg};
      border:1px solid ${T.n200};padding:28px 24px;
      transition:all .32s cubic-bezier(.22,1,.36,1);
      position:relative;overflow:hidden;
    }
    .cp-stat-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:3px;
      background:linear-gradient(90deg,${T.g400},${T.g600});
      transform:scaleX(0);transform-origin:left;
      transition:transform .4s cubic-bezier(.22,1,.36,1);
    }
    .cp-stat-card:hover::before{transform:scaleX(1)}
    .cp-stat-card:hover{transform:translateY(-5px);box-shadow:${T.sh.lg};border-color:${T.g200}}

    /* ── Section ── */
    .cp-section-reveal{
      opacity:0;transform:translateY(36px);
      transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);
    }
    .cp-section-reveal.visible{opacity:1;transform:translateY(0)}

    /* ── Grid ── */
    .cp-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
    .cp-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .cp-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    @media(max-width:1024px){
      .cp-grid-4{grid-template-columns:repeat(2,1fr)}
      .cp-grid-3{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:640px){
      .cp-grid-2,.cp-grid-3,.cp-grid-4{grid-template-columns:1fr}
    }

    /* ── Divider ── */
    .cp-divider{height:1px;background:linear-gradient(90deg,transparent,${T.n200},transparent)}
    .cp-divider-green{height:2px;background:linear-gradient(90deg,transparent,${T.g300},transparent)}

    /* ── Tag ── */
    .cp-tag{
      display:inline-flex;align-items:center;gap:5px;
      padding:5px 13px;border-radius:${T.r.full};
      font-size:11.5px;font-weight:700;letter-spacing:.4px;
      text-transform:uppercase;transition:all .2s;
    }
    .cp-tag-green{background:${T.g100};color:${T.g700};border:1px solid ${T.g200}}
    .cp-tag-green:hover{background:${T.g200};border-color:${T.g300}}
    .cp-tag-dark{background:rgba(0,0,0,.55);color:${T.white}}
    .cp-tag-white{background:rgba(255,255,255,.15);color:${T.white};border:1px solid rgba(255,255,255,.3)}
    .cp-tag-amber{background:${T.amberLight};color:${T.amberDark};border:1px solid #FDE68A}

    /* ── Nav item ── */
    .cp-nav-item{
      display:flex;align-items:center;gap:6px;
      padding:9px 18px;border-radius:${T.r.full};
      font-size:13px;font-weight:600;cursor:pointer;
      border:1.5px solid transparent;font-family:${T.sans};
      white-space:nowrap;transition:all .22s;color:${T.n500};
      background:transparent;
    }
    .cp-nav-item:hover{background:${T.n50};color:${T.n700};border-color:${T.n200}}
    .cp-nav-item.active{background:${T.g50};color:${T.g700};border-color:${T.g200}}

    /* ── Highlight row ── */
    .cp-hl-row{
      display:flex;align-items:flex-start;gap:14px;
      padding:14px 0;border-bottom:1px solid ${T.n100};
      transition:background .2s;border-radius:8px;padding:14px 10px;margin:0 -10px;
    }
    .cp-hl-row:hover{background:${T.n50}}
    .cp-hl-row:last-child{border-bottom:none}

    /* ── Timeline ── */
    .cp-timeline-item{position:relative;padding-left:32px;padding-bottom:28px}
    .cp-timeline-item::before{
      content:'';position:absolute;left:7px;top:14px;bottom:0;
      width:2px;background:linear-gradient(to bottom,${T.g300},${T.g100});
    }
    .cp-timeline-item:last-child::before{display:none}
    .cp-timeline-dot{
      position:absolute;left:0;top:4px;
      width:16px;height:16px;border-radius:50%;
      background:linear-gradient(135deg,${T.g400},${T.g600});
      border:3px solid ${T.white};
      box-shadow:0 0 0 3px ${T.g100};
      transition:transform .2s;
    }
    .cp-timeline-item:hover .cp-timeline-dot{transform:scale(1.25)}

    /* ── Floating particles ── */
    .cp-particle{
      position:absolute;border-radius:50%;
      background:rgba(255,255,255,.15);
      animation:cp-particleFloat var(--dur,4s) ease-out var(--delay,0s) infinite;
    }

    /* ── Progress bar ── */
    .cp-progress-bar{
      height:6px;border-radius:3px;
      background:linear-gradient(90deg,${T.g400},${T.g600});
      transform-origin:left;transition:transform 1.2s cubic-bezier(.22,1,.36,1);
    }

    /* Responsive helpers */
    @media(max-width:768px){
      .cp-hide-mob{display:none!important}
    }
    @media(min-width:769px){
      .cp-hide-desk{display:none!important}
    }
  `;
  document.head.appendChild(s);
};

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */
const useScreen = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { mob: w < 640, tab: w >= 640 && w < 1024, desk: w >= 1024, w };
};

const useInView = (threshold = 0.12, once = true) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return [ref, visible];
};

/* Typewriter hook */
const useTypewriter = (text = "", speed = 45, startDelay = 200) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [ref, visible] = useInView(0.2);

  useEffect(() => {
    if (!visible || !text) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [visible, text, speed, startDelay]);

  return [ref, displayed, done];
};

/* Counter hook */
const useCounter = (target, duration = 2000, suffix = "") => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);

  useEffect(() => {
    if (!visible || !target) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    if (num === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * num));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  return [ref, count, visible];
};

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const fmt = (n) => {
  if (typeof n !== "number") return String(n || "");
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
};

const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const normStr = (v) => (typeof v === "string" ? v : v?.name ?? "");

const getCountryFallback = (name = "") =>
  `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent(`${name} landscape`)}`;
const getDestFallback = (name = "") =>
  `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(`${name} travel destination`)}`;

/* ═══════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════ */
const Box = ({ children, style = {} }) => (
  <div style={{
    maxWidth: T.max, margin: "0 auto",
    padding: "0 clamp(16px,4vw,56px)",
    width: "100%", ...style
  }}>
    {children}
  </div>
);

const Skel = ({ w = "100%", h = 18, r = "8px", style = {} }) => (
  <div className="cp-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const GreenLine = ({ w = 56, style = {} }) => (
  <div style={{
    width: w, height: 4, borderRadius: 2,
    background: `linear-gradient(90deg,${T.g400},${T.g600})`,
    ...style
  }} />
);

const IconBox = ({ icon: Icon, size = 48, bg = T.g50, color = T.g600, style = {}, round = false }) => (
  <div style={{
    width: size, height: size,
    borderRadius: round ? "50%" : T.r.md,
    background: bg, display: "flex",
    alignItems: "center", justifyContent: "center",
    color, flexShrink: 0, ...style
  }}>
    <Icon size={Math.round(size * 0.44)} />
  </div>
);

/* Animated section wrapper */
const Section = ({ children, id, bg = T.white, style = {} }) => {
  const [ref, visible] = useInView(0.06);
  return (
    <section
      ref={ref} id={id}
      className={`cp-section-reveal${visible ? " visible" : ""}`}
      style={{ background: bg, padding: "clamp(60px,8vw,110px) 0", ...style }}
    >
      <Box>{children}</Box>
    </section>
  );
};

/* Section heading with typewriter */
const SectionHead = ({ children, sub, tw = false }) => {
  const text = typeof children === "string" ? children : "";
  const [twRef, displayed, done] = useTypewriter(tw ? text : "", 38, 100);

  if (!tw) {
    const [ref, visible] = useInView(0.15);
    return (
      <div ref={ref} style={{ marginBottom: "clamp(32px,4vw,56px)" }}>
        <h2 style={{
          fontFamily: T.serif,
          fontSize: "clamp(26px,4vw,42px)",
          fontWeight: 800, color: T.n900,
          margin: "0 0 14px", lineHeight: 1.12,
          letterSpacing: "-0.025em",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(20px)",
          transition: "opacity .7s ease,transform .7s ease",
        }}>
          {children}
        </h2>
        {sub && (
          <p style={{
            fontSize: "clamp(14px,1.4vw,17px)",
            color: T.n500, margin: "0 0 18px",
            lineHeight: 1.7, maxWidth: 600,
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(16px)",
            transition: "opacity .7s .1s ease,transform .7s .1s ease",
          }}>
            {sub}
          </p>
        )}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "opacity .6s .2s ease,transform .6s .2s ease",
        }}>
          <GreenLine />
        </div>
      </div>
    );
  }

  return (
    <div ref={twRef} style={{ marginBottom: "clamp(32px,4vw,56px)" }}>
      <h2 style={{
        fontFamily: T.serif,
        fontSize: "clamp(26px,4vw,42px)",
        fontWeight: 800, color: T.n900,
        margin: "0 0 14px", lineHeight: 1.12,
        letterSpacing: "-0.025em",
        minHeight: "1.2em",
      }}>
        {displayed}
        {!done && (
          <span style={{
            display: "inline-block", width: "2px",
            height: "0.85em", background: T.g500,
            marginLeft: "2px", verticalAlign: "middle",
            animation: "cp-blink .7s step-end infinite",
          }} />
        )}
      </h2>
      {sub && (
        <p style={{
          fontSize: "clamp(14px,1.4vw,17px)",
          color: T.n500, margin: "0 0 18px",
          lineHeight: 1.7, maxWidth: 600,
        }}>
          {sub}
        </p>
      )}
      <GreenLine />
    </div>
  );
};

/* ── Animated counter display ── */
const AnimatedStat = ({ value, label, icon: Icon, suffix = "", prefix = "", color = T.g600 }) => {
  const isNumeric = /^\d/.test(String(value || ""));
  const numValue = isNumeric ? parseFloat(String(value).replace(/[^0-9.]/g, "")) : 0;
  const [ref, count, visible] = useCounter(numValue, 1800);

  const displayValue = visible && isNumeric
    ? `${prefix}${numValue >= 1e9 ? (count / 1e9).toFixed(1) + "B" : numValue >= 1e6 ? (count / 1e6).toFixed(1) + "M" : numValue >= 1e3 ? (count / 1e3).toFixed(1) + "K" : count.toLocaleString()}${suffix}`
    : String(value || "");

  return (
    <div ref={ref} className="cp-stat-card" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `linear-gradient(135deg,${T.g50},${T.g100})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, boxShadow: T.sh.green,
        }}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      <div style={{
        fontSize: "clamp(22px,3vw,36px)",
        fontWeight: 900, color: T.n800,
        fontFamily: T.serif, lineHeight: 1,
        marginBottom: 8,
        animation: visible ? "cp-countUp .6s ease forwards" : "none",
      }}>
        {displayValue}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".6px" }}>
        {label}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SKELETON PAGE
═══════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div style={{ background: T.white, minHeight: "100vh" }}>
    <div style={{ position: "relative", height: "85vh", background: T.n200 }}>
      <Skel w="100%" h="100%" r="0" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "64px clamp(16px,4vw,56px)" }}>
        <div style={{ maxWidth: T.max, margin: "0 auto" }}>
          <Skel w={120} h={28} r="99px" style={{ marginBottom: 20, opacity: .5 }} />
          <Skel w={380} h={64} r="12px" style={{ marginBottom: 18, opacity: .4 }} />
          <Skel w={280} h={20} r="8px" style={{ marginBottom: 40, opacity: .35 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <Skel w={190} h={54} r="14px" style={{ opacity: .4 }} />
            <Skel w={150} h={54} r="14px" style={{ opacity: .3 }} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ padding: "14px clamp(16px,4vw,56px)", borderBottom: `1px solid ${T.n200}` }}>
      <div style={{ maxWidth: T.max, margin: "0 auto", display: "flex", gap: 8 }}>
        {[100, 80, 120, 90, 110, 75, 95].map((w, i) => (
          <Skel key={i} w={w} h={38} r="99px" />
        ))}
      </div>
    </div>
    <Box style={{ padding: "clamp(48px,6vw,80px) clamp(16px,4vw,56px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 60 }}>
        {[1, 2, 3, 4, 5, 6].map(i => <Skel key={i} h={100} r="14px" />)}
      </div>
      <Skel w={280} h={40} r="8px" style={{ marginBottom: 14 }} />
      <Skel w={480} h={18} r="6px" style={{ marginBottom: 8 }} />
      <Skel w={52} h={4} r="4px" style={{ marginBottom: 44 }} />
      <div className="cp-grid-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ borderRadius: T.r.lg, overflow: "hidden", border: `1px solid ${T.n200}` }}>
            <Skel w="100%" h={200} r="0" />
            <div style={{ padding: 24 }}>
              <Skel w="55%" h={22} r="6px" style={{ marginBottom: 12 }} />
              <Skel w="100%" h={14} r="4px" style={{ marginBottom: 8 }} />
              <Skel w="75%" h={14} r="4px" />
            </div>
          </div>
        ))}
      </div>
    </Box>
  </div>
);

/* ═══════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate, refetch }) => (
  <div style={{
    minHeight: "88vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: `linear-gradient(135deg,${T.n50},${T.g50})`,
    padding: "clamp(24px,5vw,64px)", textAlign: "center",
    fontFamily: T.sans,
  }}>
    <div className="cp-float" style={{
      width: 140, height: 140, borderRadius: "50%",
      background: `linear-gradient(135deg,${T.g50},${T.g100})`,
      border: `3px solid ${T.g200}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 36, boxShadow: T.sh.green,
    }}>
      <FiGlobe size={56} color={T.g400} />
    </div>
    <h2 style={{
      fontFamily: T.serif, fontSize: "clamp(26px,4vw,42px)",
      fontWeight: 800, color: T.n800, margin: "0 0 16px",
    }}>
      Country Not Found
    </h2>
    <p style={{
      fontSize: "clamp(15px,1.5vw,18px)", color: T.n500,
      maxWidth: 460, margin: "0 0 40px", lineHeight: 1.7,
    }}>
      {error?.message || "We couldn't load this destination. Please try again."}
    </p>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {[
        { icon: FiRefreshCw, label: "Retry", action: refetch, primary: true },
        { icon: FiChevronLeft, label: "Go Back", action: () => navigate(-1) },
        { icon: FiHome, label: "Home", action: () => navigate("/") },
      ].map((btn, i) => (
        <button key={i} onClick={btn.action} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "13px 28px",
          background: btn.primary ? T.g600 : T.white,
          color: btn.primary ? T.white : T.n700,
          border: btn.primary ? "none" : `2px solid ${T.n300}`,
          borderRadius: T.r.md, fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: T.sans,
          boxShadow: btn.primary ? T.sh.green : T.sh.sm,
          transition: "all .25s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = T.sh.lg; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = btn.primary ? T.sh.green : T.sh.sm; }}
        >
          <btn.icon size={15} /> {btn.label}
        </button>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   HERO — Cinematic
═══════════════════════════════════════════════════ */
const Hero = ({ c }) => {
  const heroImg = c.heroImage || c.coverImageUrl || c.imageUrl || getCountryFallback(c.name);
  const [titleRef, titleDisplayed, titleDone] = useTypewriter(c.name || "", 55, 600);
  const [loaded, setLoaded] = useState(false);

  return (
    <section style={{ position: "relative", height: "clamp(560px,92vh,960px)", overflow: "hidden" }}>
      {/* BG Image */}
      <div style={{
        position: "absolute", inset: 0,
        animation: "cp-heroZoom 12s ease forwards",
      }}>
        <img
          src={heroImg} alt={c.name}
          onLoad={() => setLoaded(true)}
          onError={e => { e.currentTarget.src = getCountryFallback(c.name); setLoaded(true); }}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* Multi-layer overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.18) 35%,rgba(6,78,59,.72) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(4,120,87,.55) 0%,transparent 55%)" }} />

      {/* Noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: .03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Animated bottom gradient line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg,${T.g300},${T.g500},${T.g700},${T.g500},${T.g300})`,
        backgroundSize: "200% 100%",
        animation: "cp-gradientShift 4s ease infinite",
      }} />

      {/* Floating particles */}
      {[
        { s: 6, t: "20%", l: "8%", dur: "5s", delay: "0s", x: "15px" },
        { s: 4, t: "65%", l: "15%", dur: "7s", delay: "1s", x: "-10px" },
        { s: 8, t: "40%", r: "10%", dur: "6s", delay: "2s", x: "20px" },
        { s: 5, t: "75%", r: "20%", dur: "5.5s", delay: ".5s", x: "-15px" },
        { s: 3, t: "55%", l: "35%", dur: "8s", delay: "1.5s", x: "10px" },
      ].map((p, i) => (
        <div key={i} className="cp-particle" style={{
          width: p.s, height: p.s,
          top: p.t, left: p.l, right: p.r,
          "--dur": p.dur, "--delay": p.delay, "--x": p.x,
        }} />
      ))}

      {/* Breadcrumb */}
      <div style={{ position: "absolute", top: "clamp(80px,10vw,108px)", left: 0, right: 0 }}>
        <Box>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            color: "rgba(255,255,255,.65)", fontSize: 12.5, fontWeight: 500,
          }}>
            {[
              { to: "/", label: "Home", icon: FiHome },
              { to: "/destinations", label: "Destinations" },
              { label: c.name, active: true },
            ].map((crumb, i, arr) => (
              <React.Fragment key={i}>
                {crumb.to ? (
                  <Link to={crumb.to} style={{
                    color: "inherit", textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "color .2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = T.g300}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.65)"}
                  >
                    {crumb.icon && <crumb.icon size={12} />}
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: crumb.active ? T.g300 : "inherit", fontWeight: crumb.active ? 700 : 500 }}>
                    {crumb.label}
                  </span>
                )}
                {i < arr.length - 1 && <FiChevronRight size={12} style={{ opacity: .5 }} />}
              </React.Fragment>
            ))}
          </div>
        </Box>
      </div>

      {/* Main content */}
      <Box style={{
        position: "relative", height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: "clamp(52px,7vw,96px)",
      }}>
        <div style={{ maxWidth: 900 }}>
          {/* Region badge */}
          {c.region && (
            <div className="cp-fadeUp" style={{ marginBottom: 18, opacity: 0, animationDelay: ".15s" }}>
              <span className="cp-tag cp-tag-white" style={{ fontSize: 12 }}>
                <FiMapPin size={11} /> {c.region}
                {c.subregion && <> · {c.subregion}</>}
              </span>
            </div>
          )}

          {/* Flag + Title */}
          <div className="cp-fadeUp" style={{ display: "flex", alignItems: "center", gap: "clamp(16px,2.5vw,28px)", marginBottom: 18, opacity: 0, animationDelay: ".28s" }}>
            {(c.flagUrl || c.flag) && (
              <div style={{
                borderRadius: T.r.md, overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                border: "2.5px solid rgba(255,255,255,.35)",
                flexShrink: 0,
              }}>
                <img
                  src={c.flagUrl || c.flag}
                  alt={`${c.name} flag`}
                  onError={e => e.currentTarget.style.display = "none"}
                  style={{ width: "clamp(60px,7vw,96px)", height: "auto", display: "block" }}
                />
              </div>
            )}

            {/* Typewriter title */}
            <div ref={titleRef}>
              <h1 style={{
                fontFamily: T.serif,
                fontSize: "clamp(40px,7vw,82px)",
                fontWeight: 800, color: T.white,
                margin: 0, lineHeight: 1.04,
                textShadow: "0 4px 40px rgba(0,0,0,.5)",
                letterSpacing: "-0.025em",
                minHeight: "1.1em",
              }}>
                {titleDisplayed}
                {!titleDone && (
                  <span style={{
                    display: "inline-block", width: "3px",
                    height: "0.78em", background: T.g400,
                    marginLeft: "3px", verticalAlign: "middle",
                    borderRadius: "2px",
                    animation: "cp-blink .7s step-end infinite",
                  }} />
                )}
              </h1>
            </div>
          </div>

          {/* Tagline */}
          {c.tagline && (
            <p className="cp-fadeUp" style={{
              fontSize: "clamp(16px,2vw,22px)",
              color: "rgba(255,255,255,.82)",
              margin: "0 0 32px", lineHeight: 1.6,
              maxWidth: 620, opacity: 0,
              animationDelay: ".42s",
              fontWeight: 300,
            }}>
              {c.tagline}
            </p>
          )}

          {/* Quick stats row */}
          <div className="cp-fadeUp" style={{
            display: "flex", flexWrap: "wrap",
            gap: "clamp(20px,4vw,48px)",
            marginBottom: 36, opacity: 0, animationDelay: ".55s",
          }}>
            {[
              { icon: FiHome, label: "Capital", value: c.capital },
              { icon: FiUsers, label: "Population", value: c.population ? fmt(c.population) : null },
              { icon: FiGrid, label: "Places", value: c.destinationCount > 0 ? `${c.destinationCount}+` : null },
              { icon: FiGlobe, label: "Continent", value: c.continent },
            ].filter(s => s.value).map((stat, i) => (
              <div key={i} style={{ color: "rgba(255,255,255,.92)" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 10.5, opacity: .65,
                  textTransform: "uppercase", letterSpacing: ".7px",
                  fontWeight: 700, marginBottom: 4,
                }}>
                  <stat.icon size={10.5} /> {stat.label}
                </div>
                <div style={{ fontSize: "clamp(16px,1.6vw,20px)", fontWeight: 800 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="cp-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: 13, opacity: 0, animationDelay: ".68s" }}>
            <Link to={`/country/${c.slug}/destinations`} className="cp-btn-primary">
              <span>Explore Destinations</span>
              <FiArrowRight size={16} />
            </Link>
            <button className="cp-btn-outline" onClick={() => {
              const el = document.getElementById("overview");
              if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 68, behavior: "smooth" });
            }}>
              Discover More
            </button>
          </div>
        </div>
      </Box>

      {/* Scroll indicator */}
      <div className="cp-float" style={{
        position: "absolute", bottom: 40,
        right: "clamp(24px,4vw,64px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8,
        color: "rgba(255,255,255,.4)",
        fontSize: 10, fontWeight: 700,
        letterSpacing: "1px", textTransform: "uppercase",
      }}>
        <span>Scroll</span>
        <div style={{
          width: 24, height: 38, borderRadius: 12,
          border: "2px solid rgba(255,255,255,.3)",
          display: "flex", justifyContent: "center",
          paddingTop: 6,
        }}>
          <div style={{
            width: 3, height: 8, borderRadius: 2,
            background: T.g300,
            animation: "cp-float 1.8s ease-in-out infinite",
          }} />
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION NAV
═══════════════════════════════════════════════════ */
const SectionNav = ({ sections, active, onNav }) => {
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (ref.current && active) {
      const btn = ref.current.querySelector(`[data-id="${active}"]`);
      if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: scrolled ? "rgba(255,255,255,.97)" : T.white,
      borderBottom: `1px solid ${T.n200}`,
      boxShadow: scrolled ? T.sh.md : T.sh.xs,
      backdropFilter: "blur(12px)",
      transition: "all .3s ease",
    }}>
      <Box>
        <div ref={ref} className="cp-nav-scroll" style={{ display: "flex", gap: 4, padding: "10px 0" }}>
          {sections.map(s => (
            <button
              key={s.id} data-id={s.id}
              className={`cp-nav-item${active === s.id ? " active" : ""}`}
              onClick={() => onNav(s.id)}
            >
              <s.icon size={13} />
              {s.label}
              {active === s.id && (
                <div style={{
                  position: "absolute", bottom: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%",
                  background: T.g500,
                }} />
              )}
            </button>
          ))}
        </div>
      </Box>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK FACTS
═══════════════════════════════════════════════════ */
const QuickFacts = ({ c }) => {
  const facts = [
    { icon: FiHome, label: "Capital", value: c.capital, color: T.g600 },
    { icon: FiUsers, label: "Population", value: c.population ? fmt(c.population) : null, color: "#3B82F6" },
    { icon: FiMap, label: "Area", value: c.area ? `${fmt(c.area)} km²` : null, color: "#8B5CF6" },
    { icon: FiActivity, label: "Currency", value: c.currency ? `${c.currency}${c.currencySymbol ? ` (${c.currencySymbol})` : ""}` : null, color: T.amber },
    { icon: FiGlobe, label: "Language", value: normStr(safeArr(c.languages || c.officialLanguages)[0]) || null, color: "#EC4899" },
    { icon: FiClock, label: "Timezone", value: c.timezone, color: T.g600 },
    { icon: FiPhone, label: "Calling Code", value: c.callingCode, color: "#06B6D4" },
    { icon: FiNavigation, label: "Driving", value: c.drivingSide, color: T.red },
  ].filter(f => f.value);

  if (!facts.length) return null;

  return (
    <div style={{ background: T.white, borderBottom: `1px solid ${T.n100}` }}>
      <Box style={{ padding: "clamp(28px,4vw,52px) clamp(16px,4vw,56px)" }}>
        <div className="cp-stagger" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: "clamp(10px,1.5vw,16px)",
        }}>
          {facts.map((f, i) => (
            <div key={i} className="cp-lift-sm" style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "clamp(14px,1.8vw,20px)",
              background: `linear-gradient(135deg,${T.n50} 0%,${T.white} 100%)`,
              borderRadius: T.r.md,
              border: `1px solid ${T.n200}`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
                background: f.color, borderRadius: "0 2px 2px 0",
              }} />
              <div style={{
                width: 42, height: 42, borderRadius: T.r.sm,
                background: `${f.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: f.color, flexShrink: 0,
              }}>
                <f.icon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".65px", marginBottom: 4 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 700, color: T.n800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   STATS SECTION (auto-count)
═══════════════════════════════════════════════════ */
const StatsSection = ({ c }) => {
  const stats = [
    { icon: FiUsers, label: "Population", value: c.population ? fmt(c.population) : null, raw: c.population, suffix: "" },
    { icon: FiMap, label: "Area (km²)", value: c.area ? fmt(c.area) : null, raw: c.area },
    { icon: FiMapPin, label: "Destinations", value: c.destinationCount > 0 ? c.destinationCount : null, raw: c.destinationCount, suffix: "+" },
    { icon: FiAward, label: "UNESCO Sites", value: safeArr(c.unescoSites).length || null, raw: safeArr(c.unescoSites).length },
    { icon: FiCalendar, label: "Festivals", value: safeArr(c.festivals).length || null, raw: safeArr(c.festivals).length },
    { icon: FiHeart, label: "Life Expectancy", value: c.lifeExpectancy ? `${c.lifeExpectancy} yrs` : null, raw: c.lifeExpectancy },
  ].filter(s => s.value);

  if (stats.length < 3) return null;

  return (
    <div style={{ background: `linear-gradient(135deg,${T.g800} 0%,${T.g900} 100%)`, padding: "clamp(52px,7vw,88px) 0" }}>
      {/* Decorative circles */}
      {[{ s: 300, t: "-20%", r: "-5%", o: .05 }, { s: 200, b: "-15%", l: "5%", o: .05 }].map((c, i) => (
        <div key={i} style={{
          position: "absolute", width: c.s, height: c.s, borderRadius: "50%",
          border: `1px solid rgba(255,255,255,${c.o})`,
          top: c.t, right: c.r, bottom: c.b, left: c.l,
          pointerEvents: "none",
        }} />
      ))}
      <Box>
        <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,64px)" }}>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(24px,3.5vw,38px)",
            fontWeight: 800, color: T.white, margin: "0 0 12px",
          }}>
            By the Numbers
          </h2>
          <p style={{ color: `${T.g200}90`, fontSize: "clamp(14px,1.4vw,17px)" }}>
            Key statistics about {c?.name || "this country"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <GreenLine style={{ background: `linear-gradient(90deg,${T.g400},${T.g300})` }} />
          </div>
        </div>
        <div className="cp-stagger" style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,200px),1fr))`,
          gap: "clamp(14px,2vw,24px)",
        }}>
          {stats.map((s, i) => {
            const [ref, count, visible] = useCounter(s.raw || 0, 2200);
            const display = visible
              ? (s.raw >= 1e9 ? `${(Math.min(count, s.raw) / 1e9).toFixed(1)}B`
                : s.raw >= 1e6 ? `${(Math.min(count, s.raw) / 1e6).toFixed(1)}M`
                : s.raw >= 1e3 ? `${(Math.min(count, s.raw) / 1e3).toFixed(1)}K`
                : count.toLocaleString()) + (s.suffix || "")
              : String(s.value);
            return (
              <div key={i} ref={ref} style={{
                textAlign: "center",
                padding: "clamp(24px,3vw,36px) 20px",
                background: "rgba(255,255,255,.06)",
                borderRadius: T.r.lg,
                border: "1px solid rgba(255,255,255,.08)",
                transition: "all .3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `linear-gradient(135deg,${T.g500}22,${T.g400}33)`,
                  border: `1.5px solid ${T.g400}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", color: T.g300,
                }}>
                  <s.icon size={22} />
                </div>
                <div style={{
                  fontFamily: T.serif,
                  fontSize: "clamp(28px,4vw,44px)",
                  fontWeight: 900, color: T.white,
                  lineHeight: 1, marginBottom: 10,
                  background: `linear-gradient(135deg,${T.g300},${T.white})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {display}
                </div>
                <div style={{
                  fontSize: 11.5, fontWeight: 700,
                  color: `${T.g300}90`,
                  textTransform: "uppercase", letterSpacing: ".7px",
                }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════ */
const Overview = ({ c }) => {
  const desc = c.fullDescription || c.description;
  const highlights = safeArr(c.highlights);
  if (!desc && !highlights.length) return null;

  return (
    <Section id="overview" bg={T.n50}>
      <SectionHead tw sub={`Discover what makes ${c.name} an extraordinary destination`}>
        About {c.name}
      </SectionHead>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))",
        gap: "clamp(32px,5vw,64px)",
        alignItems: "start",
      }}>
        {/* Description column */}
        {desc && (
          <div>
            <div className="cp-img-zoom" style={{
              borderRadius: T.r.xl, overflow: "hidden",
              marginBottom: 28, boxShadow: T.sh.xl,
              position: "relative",
            }}>
              <img
                src={c.imageUrl || getCountryFallback(c.name)}
                alt={c.name}
                onError={e => { e.currentTarget.src = getCountryFallback(c.name); }}
                style={{ width: "100%", height: "clamp(220px,30vw,360px)", objectFit: "cover", display: "block" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(to top,${T.g900}40,transparent 60%)`,
              }} />
              {c.name && (
                <div style={{
                  position: "absolute", bottom: 16, left: 20,
                  color: T.white, fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                  textShadow: "0 1px 4px rgba(0,0,0,.5)",
                }}>
                  <FiMapPin size={12} color={T.g300} /> {c.name}
                  {c.continent && <> · {c.continent}</>}
                </div>
              )}
            </div>

            {desc.split(/\n\n|\n/).filter(Boolean).map((p, i) => (
              <p key={i} style={{
                fontSize: "clamp(14px,1.3vw,16px)", lineHeight: 1.9,
                color: T.n600, margin: i > 0 ? "20px 0 0" : 0,
              }}>
                {p}
              </p>
            ))}

            {c.additionalInfo && (
              <div style={{
                marginTop: 24, padding: "18px 22px",
                background: `linear-gradient(135deg,${T.g50},${T.g100}50)`,
                borderRadius: T.r.md, borderLeft: `4px solid ${T.g500}`,
                boxShadow: T.sh.xs,
              }}>
                <p style={{ margin: 0, fontSize: 14, color: T.g800, lineHeight: 1.75, fontStyle: "italic" }}>
                  {c.additionalInfo}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Highlights column */}
        {highlights.length > 0 && (
          <div className="cp-card" style={{ padding: "clamp(24px,3vw,40px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: T.r.md,
                background: `linear-gradient(135deg,${T.g500},${T.g700})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.sh.green,
              }}>
                <FiStar size={22} color={T.white} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.g500, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 3 }}>
                  Must Know
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: T.n800, margin: 0 }}>
                  Country Highlights
                </h3>
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {highlights.map((h, i) => (
                <li key={i} className="cp-hl-row">
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: `linear-gradient(135deg,${T.g500},${T.g700})`,
                    color: T.white, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                    boxShadow: `0 2px 8px ${T.g600}40`,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.6, paddingTop: 2 }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>

            {c.bestTimeToVisit && (
              <div style={{
                marginTop: 20, padding: "14px 18px",
                background: T.amberLight, borderRadius: T.r.md,
                borderLeft: `4px solid ${T.amber}`,
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.amberDark, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                  <FiCalendar size={11} /> Best Time to Visit
                </div>
                <div style={{ fontSize: 14, color: T.amberDark, fontWeight: 600 }}>
                  {c.bestTimeToVisit}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GEOGRAPHY & CLIMATE
═══════════════════════════════════════════════════ */
const Geography = ({ c }) => {
  const geo = (typeof c.geography === "object" && c.geography) ? c.geography : {};
  const geoFacts = [
    { label: "Terrain", value: geo.terrain },
    { label: "Highest Point", value: geo.highestPoint },
    { label: "Major Rivers", value: Array.isArray(geo.majorRivers) ? geo.majorRivers.join(", ") : geo.majorRivers },
    { label: "Natural Resources", value: Array.isArray(geo.naturalResources) ? geo.naturalResources.slice(0, 5).join(", ") : geo.naturalResources },
    { label: "Total Area", value: c.area ? `${fmt(c.area)} km²` : null },
    { label: "Pop. Density", value: c.populationDensity ? `${c.populationDensity}/km²` : null },
    { label: "Borders", value: Array.isArray(geo.borders) ? geo.borders.slice(0, 5).join(", ") : geo.borders },
  ].filter(f => f.value);

  if (!geoFacts.length && !c.climate) return null;

  return (
    <Section id="geography" bg={T.white}>
      <SectionHead tw sub={`Natural landscapes and climate patterns of ${c.name}`}>
        Geography & Climate
      </SectionHead>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
        gap: "clamp(20px,3vw,32px)",
      }}>
        {geoFacts.length > 0 && (
          <div className="cp-card">
            <div style={{
              padding: "20px 28px",
              background: `linear-gradient(135deg,${T.g50},${T.g100}60)`,
              borderBottom: `1px solid ${T.g100}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: T.r.sm,
                background: `linear-gradient(135deg,${T.g500},${T.g700})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.sh.green,
              }}>
                <FiMap size={18} color={T.white} />
              </div>
              <h4 style={{ margin: 0, fontSize: "clamp(16px,1.5vw,19px)", fontWeight: 700, color: T.g800, fontFamily: T.serif }}>
                Geography
              </h4>
            </div>
            <div style={{ padding: "clamp(16px,2.5vw,28px)" }}>
              {geoFacts.map((f, i) => (
                <div key={i} style={{
                  padding: "clamp(13px,1.5vw,17px) 0",
                  borderBottom: i < geoFacts.length - 1 ? `1px solid ${T.n100}` : "none",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 5 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: "clamp(13px,1.2vw,15px)", color: T.n800, lineHeight: 1.55, fontWeight: 500 }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {c.climate && (
          <div>
            <div className="cp-card" style={{ marginBottom: 16 }}>
              <div style={{
                padding: "20px 28px",
                background: `linear-gradient(135deg,#FEF3C7,#FDE68A30)`,
                borderBottom: `1px solid #FDE68A`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: T.r.sm,
                  background: `linear-gradient(135deg,${T.amber},#D97706)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FiSun size={18} color={T.white} />
                </div>
                <h4 style={{ margin: 0, fontSize: "clamp(16px,1.5vw,19px)", fontWeight: 700, color: T.amberDark, fontFamily: T.serif }}>
                  Climate
                </h4>
              </div>
              <div style={{ padding: "clamp(16px,2.5vw,28px)" }}>
                <p style={{
                  margin: 0, fontSize: "clamp(13px,1.2vw,15px)",
                  color: T.n600, lineHeight: 1.85,
                }}>
                  {typeof c.climate === "string" ? c.climate : c.climate?.overview || ""}
                </p>
              </div>
            </div>

            {(c.bestTime || c.bestTimeToVisit) && (
              <div style={{
                padding: "20px 24px",
                background: `linear-gradient(135deg,${T.g700},${T.g900})`,
                borderRadius: T.r.lg, boxShadow: T.sh.green,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <FiCalendar size={16} color={T.g300} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px" }}>
                    Best Time to Visit
                  </span>
                </div>
                <div style={{ fontSize: "clamp(15px,1.4vw,18px)", color: T.white, fontWeight: 700 }}>
                  {c.bestTime || c.bestTimeToVisit}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   PEOPLE & CULTURE
═══════════════════════════════════════════════════ */
const People = ({ c }) => {
  const langs = safeArr(c.languages || c.officialLanguages).map(normStr).filter(Boolean);
  const ethnic = safeArr(c.ethnicGroups).map(normStr).filter(Boolean);
  const religion = safeArr(c.religions).map(normStr).filter(Boolean);

  const groups = [
    { items: langs, label: "Official Languages", icon: FiFeather, accent: T.g600, bg: T.g50 },
    { items: ethnic, label: "Ethnic Groups", icon: FiUsers, accent: "#3B82F6", bg: "#EFF6FF" },
    { items: religion, label: "Religions", icon: FiHeart, accent: "#8B5CF6", bg: "#F5F3FF" },
  ].filter(g => g.items.length > 0);

  const stats = [
    { icon: FiHeart, label: "Life Expectancy", value: c.lifeExpectancy ? `${c.lifeExpectancy} yrs` : null, raw: c.lifeExpectancy },
    { icon: FiBook, label: "Literacy Rate", value: c.literacyRate ? `${c.literacyRate}%` : null, raw: c.literacyRate },
    { icon: FiCalendar, label: "Median Age", value: c.medianAge ? `${c.medianAge} yrs` : null, raw: c.medianAge },
  ].filter(s => s.value);

  if (!groups.length && !stats.length) return null;

  return (
    <Section id="people" bg={T.n50}>
      <SectionHead tw sub={`Diverse communities and vibrant culture of ${c.name}`}>
        People & Culture
      </SectionHead>

      {groups.length > 0 && (
        <div className="cp-stagger" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
          gap: "clamp(16px,2.5vw,28px)",
          marginBottom: stats.length ? "clamp(28px,4vw,44px)" : 0,
        }}>
          {groups.map((g, i) => (
            <div key={i} className="cp-card" style={{ padding: "clamp(22px,3vw,36px)" }}>
              <div style={{
                width: 54, height: 54, borderRadius: T.r.md,
                background: g.bg, display: "flex",
                alignItems: "center", justifyContent: "center",
                color: g.accent, marginBottom: 18,
                border: `1px solid ${g.accent}22`,
              }}>
                <g.icon size={24} />
              </div>
              <h4 style={{ margin: "0 0 16px", fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.n800 }}>
                {g.label}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {g.items.slice(0, 10).map((item, j) => (
                  <span key={j} className="cp-tag cp-tag-green">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
          gap: "clamp(12px,1.8vw,20px)",
        }}>
          {stats.map((s, i) => (
            <AnimatedStat key={i} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   HISTORY & HERITAGE
═══════════════════════════════════════════════════ */
const History = ({ c }) => {
  const timeline = safeArr(c.historicalTimeline);
  const unesco = safeArr(c.unescoSites);
  if (!timeline.length && !unesco.length) return null;

  return (
    <Section id="history" bg={T.white}>
      <SectionHead tw sub={`Rich heritage and historical milestones of ${c.name}`}>
        History & Heritage
      </SectionHead>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
        gap: "clamp(32px,5vw,60px)",
      }}>
        {timeline.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <IconBox icon={FiBook} size={48} bg={T.g50} color={T.g600} style={{ boxShadow: T.sh.green }} />
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.g500, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 3 }}>
                  Timeline
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: T.n800, margin: 0 }}>
                  Historical Events
                </h3>
              </div>
            </div>
            <div className="cp-stagger">
              {timeline.slice(0, 9).map((ev, i) => (
                <div key={ev.id || i} className="cp-timeline-item">
                  <div className="cp-timeline-dot" style={{
                    background: ev.isMajor
                      ? `linear-gradient(135deg,${T.g500},${T.g700})`
                      : `linear-gradient(135deg,${T.g300},${T.g500})`,
                  }} />
                  <div style={{
                    fontSize: 13, fontWeight: 800, color: T.g600, marginBottom: 5,
                    fontFamily: T.mono,
                  }}>
                    {ev.year}
                  </div>
                  <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.65 }}>
                    {ev.event}
                  </p>
                  {ev.type && (
                    <span className="cp-tag cp-tag-green" style={{ marginTop: 8, display: "inline-flex" }}>
                      {ev.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {unesco.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <IconBox icon={FiAward} size={48} bg={T.amberLight} color={T.amber} style={{ boxShadow: `0 4px 14px ${T.amber}30` }} />
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.amber, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 3 }}>
                  World Heritage
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,24px)", fontWeight: 700, color: T.n800, margin: 0 }}>
                  UNESCO Sites
                </h3>
              </div>
            </div>
            <div className="cp-stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {unesco.slice(0, 7).map((site, i) => (
                <div key={site.id || i} className="cp-card" style={{ padding: "clamp(16px,2vw,24px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800, lineHeight: 1.35 }}>
                      {site.name}
                    </h4>
                    {site.year && (
                      <span className="cp-tag cp-tag-amber" style={{ flexShrink: 0 }}>{site.year}</span>
                    )}
                  </div>
                  {site.type && <span className="cp-tag cp-tag-green" style={{ marginBottom: 8, display: "inline-flex" }}>{site.type}</span>}
                  {site.description && (
                    <p style={{
                      margin: "8px 0 0", fontSize: 13, color: T.n500, lineHeight: 1.6,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {site.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE
═══════════════════════════════════════════════════ */
const Wildlife = ({ c }) => {
  const w = (typeof c.wildlife === "object" && c.wildlife) ? c.wildlife : {};
  const cats = [
    { key: "mammals", label: "Mammals", icon: FiActivity, accent: T.g600 },
    { key: "birds", label: "Birds", icon: FiFeather, accent: "#06B6D4" },
    { key: "reptiles", label: "Reptiles", icon: FiEye, accent: "#10B981" },
    { key: "marineLife", label: "Marine Life", icon: FiAnchor, accent: T.blue },
    { key: "marine", label: "Marine Life", icon: FiAnchor, accent: T.blue },
    { key: "endangered", label: "Endangered", icon: FiAlertCircle, accent: T.red },
  ].filter((cat, idx, arr) =>
    safeArr(w[cat.key]).length > 0 &&
    arr.findIndex(a => a.key === cat.key) === idx
  ).slice(0, 6);

  if (!cats.length) return null;

  return (
    <Section id="wildlife" bg={T.n50}>
      <SectionHead tw sub={`Incredible biodiversity found in ${c.name}`}>
        Wildlife & Nature
      </SectionHead>

      {/* Photo strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 8, marginBottom: "clamp(28px,4vw,48px)",
        borderRadius: T.r.xl, overflow: "hidden",
        height: "clamp(140px,20vw,240px)", boxShadow: T.sh.xl,
      }}>
        {["safari wildlife big five", "African elephant savanna", "leopard tree africa"].map((q, i) => (
          <img key={i} src={`https://source.unsplash.com/featured/600x400/?${encodeURIComponent(q)}&sig=${i + 10}`}
            alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.currentTarget.style.display = "none"; }} />
        ))}
      </div>

      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
        gap: "clamp(14px,2vw,22px)",
      }}>
        {cats.map((cat, i) => (
          <div key={i} className="cp-card">
            <div style={{
              padding: "16px 22px",
              background: `${cat.accent}08`,
              borderBottom: `1px solid ${cat.accent}18`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: T.r.sm,
                background: `${cat.accent}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: cat.accent,
              }}>
                <cat.icon size={17} />
              </div>
              <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800 }}>
                {cat.label}
              </h4>
              <span style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 700,
                color: cat.accent, background: `${cat.accent}12`,
                padding: "3px 10px", borderRadius: T.r.full,
              }}>
                {safeArr(w[cat.key]).length}
              </span>
            </div>
            <div style={{ padding: "clamp(14px,1.8vw,20px)", display: "flex", flexWrap: "wrap", gap: 7 }}>
              {safeArr(w[cat.key]).slice(0, 12).map((a, j) => (
                <span key={j} className="cp-tag cp-tag-green">{normStr(a)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   CUISINE
═══════════════════════════════════════════════════ */
const Cuisine = ({ c }) => {
  const cuisine = (typeof c.cuisine === "object" && c.cuisine) ? c.cuisine : {};
  const staples = safeArr(cuisine.staples);
  const specialties = safeArr(cuisine.specialties);
  const beverages = safeArr(cuisine.beverages);
  const dishes = [...staples, ...specialties].map(s => typeof s === "string" ? { name: s } : s).filter(d => d.name);

  if (!dishes.length && !beverages.length) return null;

  return (
    <Section id="cuisine" bg={T.white}>
      <SectionHead tw sub={`Authentic flavours and culinary traditions of ${c.name}`}>
        Local Cuisine
      </SectionHead>

      {/* Banner */}
      <div style={{
        borderRadius: T.r.xl, overflow: "hidden",
        marginBottom: "clamp(28px,4vw,48px)",
        height: "clamp(160px,22vw,280px)",
        boxShadow: T.sh.xl, position: "relative",
      }}>
        <img
          src={`https://source.unsplash.com/featured/1600x500/?${encodeURIComponent(`${c.name} food cuisine`)}`}
          alt="Cuisine" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.currentTarget.style.background = `linear-gradient(135deg,${T.g600},${T.g900})`; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right,rgba(0,0,0,.55) 0%,transparent 70%)",
          display: "flex", alignItems: "center",
          padding: "0 clamp(24px,4vw,48px)",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 8 }}>
              Culinary Heritage
            </div>
            <h3 style={{ fontFamily: T.serif, fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, color: T.white, margin: 0 }}>
              Taste of {c.name}
            </h3>
          </div>
        </div>
      </div>

      {dishes.length > 0 && (
        <div className="cp-stagger" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,260px),1fr))",
          gap: "clamp(14px,2vw,24px)",
          marginBottom: beverages.length ? "clamp(32px,4vw,48px)" : 0,
        }}>
          {dishes.slice(0, 6).map((dish, i) => (
            <div key={i} className="cp-card cp-img-zoom cp-lift">
              {dish.imageUrl ? (
                <div style={{ height: 168, overflow: "hidden" }}>
                  <img src={dish.imageUrl} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ) : (
                <div style={{
                  height: 148,
                  background: `linear-gradient(135deg,${T.g800},${T.g600})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <FiCoffee size={44} color="rgba(255,255,255,.2)" />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "12px 16px",
                    background: "linear-gradient(transparent,rgba(0,0,0,.4))",
                  }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>
                      {c.name} Dish
                    </span>
                  </div>
                </div>
              )}
              <div style={{ padding: "clamp(14px,1.8vw,22px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <FiCoffee size={14} color={T.g500} />
                  <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,17px)", fontWeight: 700, color: T.n800 }}>
                    {dish.name}
                  </h4>
                </div>
                {dish.description && (
                  <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.6 }}>
                    {dish.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {beverages.length > 0 && (
        <div>
          <h3 style={{
            display: "flex", alignItems: "center", gap: 9,
            fontSize: "clamp(16px,1.7vw,21px)", fontWeight: 700,
            color: T.n800, marginBottom: 18, fontFamily: T.serif,
          }}>
            <FiCoffee size={19} color={T.g600} /> Traditional Beverages
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {beverages.map((b, i) => (
              <div key={i} style={{
                padding: "10px 22px",
                background: `linear-gradient(135deg,${T.n50},${T.white})`,
                borderRadius: T.r.md,
                border: `1.5px solid ${T.n200}`,
                fontSize: "clamp(13px,1.2vw,15px)",
                fontWeight: 600, color: T.n700,
                transition: "all .22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.g300; e.currentTarget.style.background = T.g50; e.currentTarget.style.color = T.g700; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.n200; e.currentTarget.style.background = `linear-gradient(135deg,${T.n50},${T.white})`; e.currentTarget.style.color = T.n700; }}
              >
                {normStr(b)}
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL ESSENTIALS
═══════════════════════════════════════════════════ */
const TravelEssentials = ({ c }) => {
  const items = [
    { icon: FiInfo, title: "Visa Requirements", content: c.visaInfo, accent: T.g600, bg: T.g50 },
    { icon: FiShield, title: "Health & Vaccinations", content: c.healthInfo, accent: T.red, bg: T.redLight },
    { icon: FiZap, title: "Electricity", content: c.electricalPlug ? `${c.electricalPlug}${c.voltage ? ` · ${c.voltage}` : ""}` : null, accent: T.purple, bg: T.purpleLight },
    { icon: FiDroplet, title: "Water Safety", content: c.waterSafety, accent: T.blue, bg: T.blueLight },
    { icon: FiWifi, title: "Connectivity", content: c.wifiInfo, accent: "#06B6D4", bg: "#ECFEFF" },
    { icon: FiPhone, title: "Emergency Numbers", content: c.emergencyNumbers, accent: T.amber, bg: T.amberLight },
  ].filter(e => e.content);

  if (!items.length) return null;

  return (
    <Section id="travel" bg={T.n50}>
      <SectionHead tw sub={`Essential information before travelling to ${c.name}`}>
        Travel Essentials
      </SectionHead>
      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
        gap: "clamp(14px,2vw,24px)",
      }}>
        {items.map((item, i) => (
          <div key={i} className="cp-card cp-lift-sm">
            <div style={{
              padding: "18px 24px",
              background: item.bg,
              borderBottom: `1px solid ${item.accent}20`,
              display: "flex", alignItems: "center", gap: 13,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: T.r.sm,
                background: `${item.accent}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: item.accent,
              }}>
                <item.icon size={18} />
              </div>
              <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: item.accent }}>
                {item.title}
              </h4>
            </div>
            <div style={{ padding: "clamp(16px,2.2vw,26px)" }}>
              <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.85 }}>
                {typeof item.content === "string"
                  ? item.content
                  : item.content?.description || JSON.stringify(item.content)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   FESTIVALS
═══════════════════════════════════════════════════ */
const Festivals = ({ c }) => {
  const fests = safeArr(c.festivals);
  if (!fests.length) return null;

  return (
    <Section id="festivals" bg={T.white}>
      <SectionHead tw sub={`Vibrant celebrations and cultural events in ${c.name}`}>
        Festivals & Events
      </SectionHead>
      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,290px),1fr))",
        gap: "clamp(14px,2vw,24px)",
      }}>
        {fests.slice(0, 6).map((f, i) => (
          <div key={f.id || i} className="cp-card cp-img-zoom cp-lift">
            {f.imageUrl ? (
              <div style={{ height: 188, overflow: "hidden" }}>
                <img src={f.imageUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ) : (
              <div style={{
                height: 168,
                background: `linear-gradient(135deg,${T.g700},${T.g900})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <FiCalendar size={48} color="rgba(255,255,255,.2)" />
                <div style={{
                  position: "absolute", inset: 0,
                  background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,.03)'%3E%3Cpath d='M20 0l20 20-20 20L0 20z'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
            )}
            <div style={{ padding: "clamp(16px,2vw,24px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,17px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>
                  {f.name}
                </h4>
                {f.isMajorEvent && (
                  <span className="cp-tag cp-tag-amber" style={{ flexShrink: 0 }}>Major</span>
                )}
              </div>
              {(f.period || f.month) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: T.g600, fontSize: 13, fontWeight: 600 }}>
                  <FiCalendar size={12} /> {f.period || f.month}
                </div>
              )}
              {f.description && (
                <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.65 }}>
                  {f.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   AIRPORTS
═══════════════════════════════════════════════════ */
const Airports = ({ c }) => {
  const airports = safeArr(c.airports);
  if (!airports.length) return null;

  return (
    <Section id="airports" bg={T.n50}>
      <SectionHead tw sub={`Key entry points and transport hubs for ${c.name}`}>
        Getting There
      </SectionHead>
      <div style={{
        borderRadius: T.r.xl, overflow: "hidden",
        marginBottom: "clamp(28px,4vw,48px)",
        height: "clamp(150px,18vw,220px)",
        boxShadow: T.sh.xl,
      }}>
        <img
          src={`https://source.unsplash.com/featured/1600x400/?${encodeURIComponent("airport terminal international travel")}`}
          alt="Airport" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
      </div>
      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,290px),1fr))",
        gap: "clamp(14px,2vw,22px)",
      }}>
        {airports.slice(0, 6).map((a, i) => (
          <div key={a.id || i} className="cp-card cp-lift-sm" style={{
            borderLeft: a.isMainInternational ? `4px solid ${T.g500}` : `4px solid ${T.n300}`,
          }}>
            <div style={{ padding: "clamp(18px,2.2vw,28px)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: T.r.md,
                  background: a.isMainInternational ? T.g50 : T.n100,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: a.isMainInternational ? T.g600 : T.n400,
                  flexShrink: 0,
                }}>
                  <FiNavigation size={21} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>
                    {a.name}
                  </h4>
                  {a.code && (
                    <span style={{
                      display: "inline-block", fontSize: 13, fontWeight: 800,
                      color: T.g600, background: T.g100,
                      padding: "3px 11px", borderRadius: T.r.xs,
                      fontFamily: T.mono,
                    }}>
                      {a.code}
                    </span>
                  )}
                </div>
              </div>
              {a.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.n500, marginBottom: 8 }}>
                  <FiMapPin size={12} /> {a.location}
                </div>
              )}
              {a.type && <span className="cp-tag cp-tag-green" style={{ marginBottom: a.description ? 10 : 0, display: "inline-flex" }}>{a.type}</span>}
              {a.description && (
                <p style={{ margin: "10px 0 0", fontSize: 13, color: T.n500, lineHeight: 1.65 }}>
                  {a.description}
                </p>
              )}
              {a.isMainInternational && (
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: T.g600 }}>
                  <FiCheck size={13} /> Main International Hub
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   DESTINATIONS PREVIEW
═══════════════════════════════════════════════════ */
const DestinationsPreview = ({ destinations, countryName, countrySlug }) => {
  if (!safeArr(destinations).length) return null;

  return (
    <Section id="destinations" bg={T.white}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-end", flexWrap: "wrap", gap: 16,
        marginBottom: "clamp(28px,4vw,52px)",
      }}>
        <SectionHead sub={`Discover stunning places across ${countryName}`}>
          Explore Destinations
        </SectionHead>
        {countrySlug && (
          <Link to={`/country/${countrySlug}/destinations`} className="cp-btn-ghost">
            View All <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,290px),1fr))",
        gap: "clamp(14px,2vw,24px)",
      }}>
        {destinations.slice(0, 9).map((d, i) => {
          const img = d.imageUrl || d.image_url || safeArr(d.images)[0] || getDestFallback(d.name);
          return (
            <Link key={d.id || i} to={`/destinations/${d.slug || d.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div className="cp-card cp-lift" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="cp-img-zoom" style={{ position: "relative", height: "clamp(170px,20vw,230px)", flexShrink: 0 }}>
                  <img
                    src={img} alt={d.name}
                    onError={e => { e.currentTarget.src = getDestFallback(d.name); }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 55%)" }} />
                  {(d.isFeatured || d.is_featured) && (
                    <div style={{ position: "absolute", top: 12, left: 12 }}>
                      <span className="cp-tag" style={{ background: `linear-gradient(135deg,${T.g500},${T.g700})`, color: T.white, fontSize: 10.5 }}>
                        <FiStar size={9} /> Featured
                      </span>
                    </div>
                  )}
                  {d.rating && (
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      background: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)",
                      color: T.amber, padding: "4px 10px",
                      borderRadius: T.r.sm, fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <FiStar size={11} fill={T.amber} /> {d.rating}
                    </div>
                  )}
                </div>
                <div style={{ padding: "clamp(14px,1.8vw,22px)", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>
                    {d.name}
                  </h4>
                  {d.category && (
                    <span className="cp-tag cp-tag-green" style={{ marginBottom: 10, alignSelf: "flex-start" }}>
                      {d.category}
                    </span>
                  )}
                  {(d.shortDescription || d.short_description || d.description) && (
                    <p style={{
                      margin: "0 0 14px", fontSize: 13.5, color: T.n500,
                      lineHeight: 1.65, flex: 1,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {d.shortDescription || d.short_description || d.description}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: T.g600, marginTop: "auto" }}>
                    Explore <FiArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY — Masonry + Lightbox
═══════════════════════════════════════════════════ */
const Gallery = ({ images, name }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const imgs = safeArr(images);
  if (!imgs.length) return null;

  const getUrl = (img) => typeof img === "string" ? img : img?.url || img?.imageUrl || img?.src || "";
  const visible = imgs.slice(0, 10);

  const prev = useCallback(e => {
    e.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
  }, [imgs.length]);

  const next = useCallback(e => {
    e.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
  }, [imgs.length]);

  useEffect(() => {
    if (!lb.open) return;
    const h = e => {
      if (e.key === "Escape") setLb(p => ({ ...p, open: false }));
      if (e.key === "ArrowLeft") setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
      if (e.key === "ArrowRight") setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [lb.open, imgs.length]);

  return (
    <Section id="gallery" bg={T.n50}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: "clamp(24px,3vw,40px)" }}>
        <SectionHead sub={`Stunning photography from ${name}`}>
          Photo Gallery
        </SectionHead>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.n400, fontWeight: 500, marginBottom: "clamp(32px,4vw,56px)" }}>
          <FiCamera size={14} color={T.g500} /> {visible.length} photos
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gridAutoRows: "200px",
        gap: "clamp(6px,1vw,10px)",
        borderRadius: T.r.xl, overflow: "hidden",
        boxShadow: T.sh.xxl,
      }}>
        {visible.map((img, i) => {
          const isLarge = i === 0;
          const isMedH = i === 3;
          return (
            <div key={i}
              onClick={() => setLb({ open: true, idx: i })}
              style={{
                gridColumn: isLarge ? "span 2" : isMedH ? "span 2" : "span 1",
                gridRow: isLarge ? "span 2" : "span 1",
                position: "relative", overflow: "hidden",
                cursor: "zoom-in", background: T.n200,
              }}
            >
              <img
                src={getUrl(img)} alt={`${name} ${i + 1}`}
                onError={e => { e.currentTarget.src = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(name + " travel")}&sig=${i}`; }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .6s cubic-bezier(.22,1,.36,1)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.09)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top,rgba(0,0,0,.35) 0%,transparent 50%)",
                opacity: 0, transition: "opacity .3s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0"}
              >
                <div style={{ position: "absolute", bottom: 12, right: 14, color: T.white, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}>
                  <FiEye size={14} /> View
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {imgs.length > 10 && (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span style={{ fontSize: 13, color: T.n400, fontWeight: 500 }}>
            Showing 10 of {imgs.length} photos
          </span>
        </div>
      )}

      {/* Lightbox */}
      {lb.open && (
        <div className="cp-fadeIn" onClick={() => setLb(p => ({ ...p, open: false }))}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.97)",
            zIndex: 99999, display: "flex",
            alignItems: "center", justifyContent: "center",
            padding: "clamp(16px,3vw,48px)",
          }}>
          {/* Close */}
          <button onClick={() => setLb(p => ({ ...p, open: false }))}
            style={{
              position: "absolute", top: 20, right: 20,
              width: 50, height: 50, borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.15)",
              color: T.white, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s", zIndex: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "none"; }}>
            <FiX size={22} />
          </button>

          {/* Image */}
          <img src={getUrl(imgs[lb.idx])} alt="" className="cp-scaleIn"
            onClick={e => e.stopPropagation()}
            onError={e => { e.currentTarget.src = `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(name)}&sig=${lb.idx}`; }}
            style={{
              maxWidth: "90vw", maxHeight: "82vh",
              objectFit: "contain", borderRadius: T.r.lg,
              boxShadow: "0 40px 80px rgba(0,0,0,.8)",
            }}
          />

          {/* Prev/Next */}
          {imgs.length > 1 && (
            <>
              {[
                { fn: prev, pos: "left", icon: FiChevronLeft },
                { fn: next, pos: "right", icon: FiChevronRight },
              ].map(({ fn, pos, icon: Icon }) => (
                <button key={pos} onClick={fn}
                  style={{
                    position: "absolute", [pos]: "clamp(10px,2.5vw,32px)",
                    top: "50%", transform: "translateY(-50%)",
                    width: "clamp(46px,5.5vw,60px)", height: "clamp(46px,5.5vw,60px)",
                    borderRadius: "50%", background: "rgba(255,255,255,.1)",
                    border: "1px solid rgba(255,255,255,.18)",
                    color: T.white, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.g600; e.currentTarget.style.transform = "translateY(-50%) scale(1.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.transform = "translateY(-50%)"; }}>
                  <Icon size={24} />
                </button>
              ))}
            </>
          )}

          {/* Bottom: thumbnails + counter */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "20px 24px",
            background: "linear-gradient(transparent,rgba(0,0,0,.85))",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "88vw", padding: "4px 0" }}>
              {imgs.slice(0, 14).map((img, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: i })); }}
                  style={{
                    width: 54, height: 40, borderRadius: T.r.sm,
                    overflow: "hidden", flexShrink: 0, cursor: "pointer",
                    border: `2.5px solid ${lb.idx === i ? T.g400 : "transparent"}`,
                    transition: "all .2s", opacity: lb.idx === i ? 1 : 0.45,
                    transform: lb.idx === i ? "scale(1.08)" : "scale(1)",
                  }}>
                  <img src={getUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 500 }}>
              {lb.idx + 1} / {imgs.length}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL TIPS
═══════════════════════════════════════════════════ */
const TravelTips = ({ c }) => {
  const tips = safeArr(c.travelTips);
  if (!tips.length) return null;

  return (
    <Section id="tips" bg={T.white}>
      <SectionHead tw sub={`Practical tips to make the most of your trip to ${c.name}`}>
        Travel Tips & Advice
      </SectionHead>
      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,350px),1fr))",
        gap: "clamp(14px,2vw,24px)",
      }}>
        {tips.map((tip, i) => (
          <div key={i} className="cp-card cp-lift-sm" style={{ padding: "clamp(18px,2.2vw,28px)", display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%",
              background: `linear-gradient(135deg,${T.g500},${T.g700})`,
              color: T.white, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 900, flexShrink: 0,
              boxShadow: T.sh.green,
            }}>
              {i + 1}
            </div>
            <div style={{ minWidth: 0, paddingTop: 3 }}>
              {typeof tip !== "string" && tip?.title && (
                <h4 style={{ margin: "0 0 8px", fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800 }}>
                  {tip.title}
                </h4>
              )}
              <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,14.5px)", color: T.n600, lineHeight: 1.75 }}>
                {typeof tip === "string" ? tip : tip?.content || tip?.description || String(tip)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   ECONOMY
═══════════════════════════════════════════════════ */
const EconomicInfo = ({ c }) => {
  const eco = (typeof c.economicInfo === "object" && c.economicInfo) ? c.economicInfo : {};
  const fields = Object.entries(eco).filter(([, v]) => v && (typeof v === "string" || typeof v === "number"));
  if (!fields.length) return null;

  return (
    <Section id="economy" bg={T.n50}>
      <SectionHead tw sub={`Economic landscape and key industries of ${c.name}`}>
        Economy & Industry
      </SectionHead>
      <div className="cp-stagger" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
        gap: "clamp(12px,1.8vw,20px)",
      }}>
        {fields.slice(0, 9).map(([key, val], i) => (
          <div key={i} className="cp-card cp-lift-sm" style={{ padding: "clamp(16px,2vw,24px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: T.r.sm,
                background: T.g50, display: "flex",
                alignItems: "center", justifyContent: "center", color: T.g600,
              }}>
                <FiBriefcase size={15} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".5px" }}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
              </div>
            </div>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg,${T.g400},${T.g600})`,
            }} />
            <div style={{ fontSize: "clamp(14px,1.3vw,16px)", color: T.n800, fontWeight: 600, lineHeight: 1.5 }}>
              {String(val)}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   AI INSIGHTS
═══════════════════════════════════════════════════ */
const AIInsights = ({ insights, loading, error, onRetry }) => {
  if (!loading && !insights && !error) return null;

  return (
    <div style={{
      background: `linear-gradient(145deg,${T.g900} 0%,${T.n900} 100%)`,
      padding: "clamp(60px,8vw,110px) 0",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      {[
        { w: 400, h: 400, t: "-15%", r: "-8%", c: T.g700 },
        { w: 300, h: 300, b: "-10%", l: "5%", c: T.g800 },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", width: b.w, height: b.h, borderRadius: "50%",
          background: b.c, opacity: .15, filter: "blur(80px)",
          top: b.t, right: b.r, bottom: b.b, left: b.l,
          pointerEvents: "none",
        }} />
      ))}

      <Box style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(28px,4vw,52px)" }}>
          <div style={{
            width: 58, height: 58, borderRadius: T.r.lg,
            background: `linear-gradient(135deg,${T.g500},${T.g700})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: T.sh.greenLg,
          }}>
            <FiTrendingUp size={26} color={T.white} />
          </div>
          <div>
            <h2 style={{
              fontFamily: T.serif, fontSize: "clamp(22px,3.5vw,38px)",
              fontWeight: 800, color: T.white, margin: 0,
            }}>
              AI Travel Intelligence
            </h2>
            <p style={{ fontSize: 13, color: `${T.g300}80`, margin: "5px 0 0" }}>
              Powered by advanced AI · Updated 2026
            </p>
          </div>
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: "rgba(255,255,255,.06)",
                borderRadius: T.r.lg, padding: 28,
                border: "1px solid rgba(255,255,255,.06)",
              }}>
                <Skel w="45%" h={13} style={{ background: "rgba(255,255,255,.1)", marginBottom: 14 }} />
                <Skel w="100%" h={12} style={{ background: "rgba(255,255,255,.07)", marginBottom: 8 }} />
                <Skel w="80%" h={12} style={{ background: "rgba(255,255,255,.07)", marginBottom: 8 }} />
                <Skel w="65%" h={12} style={{ background: "rgba(255,255,255,.07)" }} />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div style={{
            padding: "24px 28px", borderRadius: T.r.lg,
            background: "rgba(239,68,68,.12)",
            border: "1px solid rgba(239,68,68,.22)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FCA5A5", fontSize: 14.5 }}>
              <FiAlertCircle size={18} /> {error}
            </div>
            <button onClick={onRetry} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 22px", background: "rgba(255,255,255,.1)",
              color: T.white, border: "1px solid rgba(255,255,255,.18)",
              borderRadius: T.r.full, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
            >
              <FiRefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {insights && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {insights.summary && (
              <div style={{
                padding: "clamp(20px,2.5vw,32px)",
                background: "rgba(255,255,255,.06)",
                borderRadius: T.r.lg,
                borderLeft: `4px solid ${T.g400}`,
                border: `1px solid rgba(255,255,255,.06)`,
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.g400, textTransform: "uppercase", letterSpacing: ".65px", marginBottom: 12 }}>
                  Overview
                </div>
                <p style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", color: "rgba(255,255,255,.86)", lineHeight: 1.85 }}>
                  {insights.summary}
                </p>
              </div>
            )}

            {insights.quickStats && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))",
                gap: 14,
              }}>
                {Object.entries(insights.quickStats).map(([k, v]) => (
                  <div key={k} style={{
                    padding: "18px 16px", textAlign: "center",
                    background: "rgba(255,255,255,.06)",
                    borderRadius: T.r.md,
                    border: "1px solid rgba(255,255,255,.06)",
                    transition: "all .25s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
                  >
                    <div style={{ fontSize: 10, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700, marginBottom: 8 }}>
                      {k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    </div>
                    <div style={{ fontSize: "clamp(13px,1.3vw,16px)", fontWeight: 700, color: T.white }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))",
              gap: 18,
            }}>
              {[
                { key: "demographics", label: "Demographics", icon: FiUsers },
                { key: "economy", label: "Economy", icon: FiTrendingUp },
                { key: "tourismOutlook", label: "Tourism Outlook", icon: FiGlobe },
                { key: "currentEvents", label: "Current Events", icon: FiInfo },
              ].filter(item => insights[item.key]).map(item => (
                <div key={item.key} style={{
                  padding: "clamp(18px,2.5vw,28px)",
                  background: "rgba(255,255,255,.05)",
                  borderRadius: T.r.lg,
                  border: "1px solid rgba(255,255,255,.06)",
                  transition: "all .25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.09)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 14 }}>
                    <item.icon size={13} /> {item.label}
                  </div>
                  <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,14.5px)", color: "rgba(255,255,255,.77)", lineHeight: 1.8 }}>
                    {insights[item.key]}
                  </p>
                </div>
              ))}
            </div>

            {safeArr(insights.bestTravelMonths).length > 0 && (
              <div style={{
                padding: "clamp(18px,2.5vw,28px)",
                background: "rgba(255,255,255,.05)",
                borderRadius: T.r.lg,
                border: "1px solid rgba(255,255,255,.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 16 }}>
                  <FiCalendar size={13} /> Best Months to Travel
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {insights.bestTravelMonths.map((m, i) => (
                    <span key={i} style={{
                      padding: "8px 18px",
                      background: `${T.g700}60`,
                      color: T.g200, borderRadius: T.r.full,
                      fontSize: 13, fontWeight: 600,
                      border: `1px solid ${T.g600}60`,
                      transition: "all .2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.g600; e.currentTarget.style.color = T.white; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${T.g700}60`; e.currentTarget.style.color = T.g200; }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Box>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   FOOTER CTA
═══════════════════════════════════════════════════ */
const FooterCTA = ({ c }) => {
  const [twRef, displayed, done] = useTypewriter(`Ready to Explore ${c.name}?`, 40, 200);

  return (
    <section style={{
      background: `linear-gradient(145deg,${T.g700} 0%,${T.g800} 50%,${T.g900} 100%)`,
      padding: "clamp(80px,12vw,140px) 0",
      textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: .04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: "none",
      }} />

      {/* Animated rings */}
      {[
        { s: 240, t: "8%", l: "3%", d: "0s" },
        { s: 160, b: "12%", r: "5%", d: "1.8s" },
        { s: 100, t: "35%", r: "15%", d: "1s" },
        { s: 180, b: "5%", l: "18%", d: "2.5s" },
      ].map((r, i) => (
        <div key={i} className="cp-floatSlow" style={{
          position: "absolute", width: r.s, height: r.s, borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,.07)",
          top: r.t, left: r.l, right: r.r, bottom: r.b,
          animationDelay: r.d, pointerEvents: "none",
        }} />
      ))}

      <Box style={{ position: "relative" }}>
        {/* Floating globe */}
        <div className="cp-float" style={{
          display: "inline-flex", marginBottom: 28,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
          border: "2px solid rgba(255,255,255,.12)",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 16px 48px rgba(0,0,0,.2)",
        }}>
          <FiGlobe size={38} color={T.g300} />
        </div>

        {/* Typewriter heading */}
        <div ref={twRef} style={{ marginBottom: 20, minHeight: "1.15em" }}>
          <h2 style={{
            fontFamily: T.serif,
            fontSize: "clamp(30px,5.5vw,62px)",
            fontWeight: 800, color: T.white,
            margin: 0, lineHeight: 1.08,
            letterSpacing: "-0.025em",
            textShadow: "0 4px 32px rgba(0,0,0,.35)",
          }}>
            {displayed}
            {!done && (
              <span style={{
                display: "inline-block", width: "3px",
                height: "0.8em", background: T.g400,
                marginLeft: "4px", verticalAlign: "middle",
                borderRadius: "2px",
                animation: "cp-blink .7s step-end infinite",
              }} />
            )}
          </h2>
        </div>

        <p style={{
          fontSize: "clamp(16px,1.8vw,21px)",
          color: "rgba(255,255,255,.75)",
          maxWidth: 560, margin: "0 auto 52px",
          lineHeight: 1.72, fontWeight: 300,
        }}>
          Start planning your adventure. Discover stunning destinations, rich culture,
          and unforgettable experiences.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
          {c.destinationCount > 0 && (
            <Link to={`/country/${c.slug}/destinations`} className="cp-btn-primary">
              <span>View All Destinations</span>
              <FiArrowRight size={16} />
            </Link>
          )}
          <Link to="/destinations" className="cp-btn-outline">
            Explore More Countries
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "clamp(24px,5vw,72px)", flexWrap: "wrap",
        }}>
          {[
            { icon: FiShield, text: "Expert Verified" },
            { icon: FiStar, text: "Top Rated" },
            { icon: FiAward, text: "Award Winning" },
            { icon: FiActivity, text: "Live Updates" },
          ].map((t, i) => (
            <div key={i} style={{ textAlign: "center", color: "rgba(255,255,255,.55)", transition: "color .25s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.color = T.g300}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                <t.icon size={30} />
              </div>
              <div style={{ fontSize: "clamp(11px,1vw,13px)", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" }}>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      </Box>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   BUILD NAV SECTIONS
═══════════════════════════════════════════════════ */
const buildSections = (c, destinations) => {
  if (!c) return [];
  const s = [];
  if (c.description || c.fullDescription || safeArr(c.highlights).length)
    s.push({ id: "overview", label: "Overview", icon: FiInfo });
  if (c.area || c.climate || Object.keys(c.geography || {}).length)
    s.push({ id: "geography", label: "Geography", icon: FiMap });
  if (safeArr(c.languages || c.officialLanguages).length || safeArr(c.ethnicGroups).length)
    s.push({ id: "people", label: "People", icon: FiUsers });
  if (safeArr(c.historicalTimeline).length || safeArr(c.unescoSites).length)
    s.push({ id: "history", label: "History", icon: FiBook });
  if (typeof c.wildlife === "object" && Object.values(c.wildlife || {}).some(v => Array.isArray(v) && v.length))
    s.push({ id: "wildlife", label: "Wildlife", icon: FiActivity });
  if (typeof c.cuisine === "object" && Object.values(c.cuisine || {}).some(v => Array.isArray(v) && v.length))
    s.push({ id: "cuisine", label: "Cuisine", icon: FiCoffee });
  if (typeof c.economicInfo === "object" && Object.keys(c.economicInfo || {}).length)
    s.push({ id: "economy", label: "Economy", icon: FiTrendingUp });
  if (c.visaInfo || c.healthInfo || c.electricalPlug || c.waterSafety)
    s.push({ id: "travel", label: "Travel Info", icon: FiShield });
  if (safeArr(c.festivals).length)
    s.push({ id: "festivals", label: "Festivals", icon: FiCalendar });
  if (safeArr(c.airports).length)
    s.push({ id: "airports", label: "Getting There", icon: FiNavigation });
  if (safeArr(destinations).length)
    s.push({ id: "destinations", label: "Destinations", icon: FiMapPin });
  if (safeArr(c.images).length)
    s.push({ id: "gallery", label: "Gallery", icon: FiCamera });
  if (safeArr(c.travelTips).length)
    s.push({ id: "tips", label: "Tips", icon: FiStar });
  s.push({ id: "ai-insights", label: "AI Insights", icon: FiTrendingUp });
  return s;
};

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const CountryPage = () => {
  const { countryId, idOrSlug, id } = useParams();
  const slug = countryId || idOrSlug || id;
  const navigate = useNavigate();
  const { mob } = useScreen();
  const [activeSection, setActiveSection] = useState("overview");
  const [destinations, setDestinations] = useState([]);

  useEffect(() => { injectStyles(); }, []);

  const {
    country, loading, error, refetch,
    insights, insightsLoading, insightsError, retryInsights,
  } = useCountry(slug, { withInsights: true });

  // Fetch destinations preview
  useEffect(() => {
    if (!country?.slug) return;
    import("../services/countryService")
      .then(({ default: cs }) => cs.getDestinations(country.slug, { limit: 9 }))
      .then(res => setDestinations(res.data ?? []))
      .catch(() => setDestinations([]));
  }, [country?.slug]);

  // Scroll to top on slug change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [slug]);

  const sections = buildSections(country, destinations);

  // Scroll spy
  useEffect(() => {
    if (!sections.length) return;
    const ids = sections.map(s => s.id);
    const handler = () => {
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 130) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections.length]);

  const scrollTo = useCallback(sectionId => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 72,
        behavior: "smooth",
      });
    }
  }, []);

  if (loading) return <div style={{ fontFamily: T.sans }}><SkeletonPage /></div>;
  if (error || !country) return <div style={{ fontFamily: T.sans }}><ErrorState error={error} navigate={navigate} refetch={refetch} /></div>;

  const c = country;

  return (
    <div style={{ fontFamily: T.sans, color: T.n800, background: T.white, overflowX: "hidden" }}>
      <Hero c={c} />

      {sections.length > 0 && (
        <SectionNav sections={sections} active={activeSection} onNav={scrollTo} />
      )}

      <QuickFacts c={c} />
      <StatsSection c={c} />
      <Overview c={c} />
      <Geography c={c} />
      <People c={c} />
      <History c={c} />
      <Wildlife c={c} />
      <Cuisine c={c} />
      <EconomicInfo c={c} />
      <TravelEssentials c={c} />
      <Festivals c={c} />
      <Airports c={c} />
      <DestinationsPreview destinations={destinations} countryName={c.name} countrySlug={c.slug} />
      <Gallery images={c.images} name={c.name} />
      <TravelTips c={c} />
      <AIInsights
        insights={insights}
        loading={insightsLoading}
        error={insightsError}
        onRetry={retryInsights}
      />
      <FooterCTA c={c} />
    </div>
  );
};

export default CountryPage;