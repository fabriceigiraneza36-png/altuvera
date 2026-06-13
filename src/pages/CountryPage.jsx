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
  FiEye,
} from "react-icons/fi";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const T = {
  // Greens
  g50:  "#ECFDF5", g100: "#D1FAE5", g200: "#A7F3D0",
  g300: "#6EE7B7", g400: "#34D399", g500: "#10B981",
  g600: "#059669", g700: "#047857", g800: "#065F46", g900: "#064E3B",

  // Neutrals
  n50:  "#F9FAFB", n100: "#F3F4F6", n200: "#E5E7EB",
  n300: "#D1D5DB", n400: "#9CA3AF", n500: "#6B7280",
  n600: "#4B5563", n700: "#374151", n800: "#1F2937", n900: "#111827",
  white: "#FFFFFF",

  // Accents
  amber: "#F59E0B", amberBg: "#FEF3C7",
  red:   "#EF4444", redBg:   "#FEF2F2",
  blue:  "#3B82F6", blueBg:  "#DBEAFE",
  purple:"#7C3AED", purpleBg:"#F5F3FF",

  // Typography
  sans:  "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'Playfair Display',Georgia,serif",

  // Layout
  max: "1280px",

  // Radius
  r: { xs:"4px", sm:"8px", md:"12px", lg:"18px", xl:"24px", full:"9999px" },

  // Shadows
  sh: {
    xs:  "0 1px 2px rgba(0,0,0,.05)",
    sm:  "0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06)",
    md:  "0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)",
    lg:  "0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)",
    xl:  "0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)",
    xxl: "0 25px 50px -12px rgba(0,0,0,.25)",
    green: "0 8px 25px rgba(16,185,129,.25)",
  },
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════ */
const injectStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("cp-styles")) return;
  const s = document.createElement("style");
  s.id = "cp-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{-webkit-font-smoothing:antialiased}
    ::selection{background:${T.g100};color:${T.g900}}
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:${T.n100}}
    ::-webkit-scrollbar-thumb{background:${T.g300};border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:${T.g400}}

    @keyframes cp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes cp-fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cp-fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes cp-scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
    @keyframes cp-heroZoom{from{transform:scale(1.08)}to{transform:scale(1)}}
    @keyframes cp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes cp-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes cp-spin{to{transform:rotate(360deg)}}

    .cp-skel{
      background:linear-gradient(90deg,${T.n200} 25%,${T.n100} 50%,${T.n200} 75%);
      background-size:200% 100%;
      animation:cp-shimmer 1.5s ease-in-out infinite;
    }
    .cp-fadeUp{animation:cp-fadeUp .7s cubic-bezier(.22,1,.36,1) forwards}
    .cp-fadeIn{animation:cp-fadeIn .45s ease forwards}
    .cp-scaleIn{animation:cp-scaleIn .4s cubic-bezier(.22,1,.36,1) forwards}
    .cp-float{animation:cp-float 3.5s ease-in-out infinite}

    .cp-lift{
      transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s ease;
      will-change:transform;
    }
    .cp-lift:hover{transform:translateY(-5px);box-shadow:${T.sh.xl}}

    .cp-img-zoom{overflow:hidden}
    .cp-img-zoom img{transition:transform .55s cubic-bezier(.22,1,.36,1)}
    .cp-img-zoom:hover img{transform:scale(1.07)}

    .cp-stagger>*{opacity:0;animation:cp-fadeUp .6s cubic-bezier(.22,1,.36,1) forwards}
    ${Array.from({length:12},(_,i)=>`.cp-stagger>*:nth-child(${i+1}){animation-delay:${i*80}ms}`).join("")}

    .cp-nav-scroll{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
    .cp-nav-scroll::-webkit-scrollbar{display:none}

    .cp-btn-primary{
      display:inline-flex;align-items:center;gap:8px;
      padding:14px 32px;background:${T.g600};color:${T.white};
      border:none;border-radius:${T.r.md};font-size:15px;font-weight:700;
      cursor:pointer;font-family:${T.sans};text-decoration:none;
      transition:all .25s;box-shadow:${T.sh.green};
    }
    .cp-btn-primary:hover{background:${T.g700};transform:translateY(-2px);box-shadow:0 12px 30px rgba(16,185,129,.35)}
    .cp-btn-outline{
      display:inline-flex;align-items:center;gap:8px;
      padding:14px 32px;background:transparent;color:${T.white};
      border:2px solid rgba(255,255,255,.35);border-radius:${T.r.md};
      font-size:15px;font-weight:600;cursor:pointer;font-family:${T.sans};
      text-decoration:none;transition:all .25s;
    }
    .cp-btn-outline:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.6)}

    /* Responsive grid helpers */
    .cp-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
    .cp-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .cp-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
    @media(max-width:1024px){
      .cp-grid-4{grid-template-columns:repeat(2,1fr)}
      .cp-grid-3{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:768px){
      .cp-grid-2,.cp-grid-3,.cp-grid-4{grid-template-columns:1fr}
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
  return { mob: w < 768, tab: w >= 768 && w < 1024, desk: w >= 1024, w };
};

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const fmt = (n) => {
  if (typeof n !== "number") return n;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
};

const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const normStr = (v) => (typeof v === "string" ? v : v?.name ?? "");

/* ═══════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════ */
const Box = ({ children, style = {} }) => (
  <div style={{ maxWidth: T.max, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", width: "100%", ...style }}>
    {children}
  </div>
);

const Skel = ({ w = "100%", h = 18, r = T.r.sm, style = {} }) => (
  <div className="cp-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const Badge = ({ children, variant = "green", size = "md", icon, style = {} }) => {
  const V = {
    green:   { bg: T.g100,    color: T.g800 },
    solid:   { bg: T.g600,    color: T.white },
    white:   { bg: "rgba(255,255,255,.15)", color: T.white, border: "1px solid rgba(255,255,255,.3)" },
    dark:    { bg: "rgba(0,0,0,.5)",        color: T.white },
    gray:    { bg: T.n100,    color: T.n700 },
    success: { bg: "#D1FAE5", color: "#065F46" },
    warning: { bg: T.amberBg, color: "#92400E" },
    info:    { bg: T.blueBg,  color: "#1E40AF" },
    red:     { bg: T.redBg,   color: T.red },
  };
  const S = {
    xs: { p: "3px 8px",   f: 10 },
    sm: { p: "5px 12px",  f: 11 },
    md: { p: "6px 16px",  f: 12 },
    lg: { p: "8px 20px",  f: 14 },
  };
  const v = V[variant] || V.green;
  const s = S[size]    || S.md;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: v.bg, color: v.color, border: v.border || "none", fontWeight: 700, fontFamily: T.sans, borderRadius: T.r.full, textTransform: "uppercase", letterSpacing: ".55px", padding: s.p, fontSize: s.f, whiteSpace: "nowrap", flexShrink: 0, ...style }}>
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
};

const GreenLine = ({ style = {} }) => (
  <div style={{ width: 52, height: 4, borderRadius: 2, background: `linear-gradient(90deg,${T.g400},${T.g600})`, ...style }} />
);

const Section = ({ children, id, bg = T.white }) => {
  const [ref, vis] = useInView();
  return (
    <section ref={ref} id={id} style={{ background: bg, padding: "clamp(52px,7vw,96px) 0", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(32px)", transition: "opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)" }}>
      <Box>{children}</Box>
    </section>
  );
};

const SectionHead = ({ children, sub }) => (
  <div style={{ marginBottom: "clamp(28px,4vw,52px)" }}>
    <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.n900, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>{children}</h2>
    {sub && <p style={{ fontSize: "clamp(14px,1.5vw,17px)", color: T.n500, margin: "0 0 14px", lineHeight: 1.65, maxWidth: 580 }}>{sub}</p>}
    <GreenLine />
  </div>
);

const Card = ({ children, style = {}, lift = true }) => (
  <div className={lift ? "cp-lift" : ""} style={{ background: T.white, borderRadius: T.r.lg, border: `1px solid ${T.n200}`, overflow: "hidden", ...style }}>
    {children}
  </div>
);

const IconBox = ({ icon: Icon, size = 48, bg = T.g50, color = T.g600, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: T.r.md, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, ...style }}>
    <Icon size={size * 0.46} />
  </div>
);

/* ═══════════════════════════════════════════════════
   UNSPLASH ILLUSTRATION HELPER
═══════════════════════════════════════════════════ */
const getCountryFallback = (name = "") => {
  const encoded = encodeURIComponent(`${name} landscape nature`);
  return `https://source.unsplash.com/featured/1600x900/?${encoded}`;
};

const getDestFallback = (name = "") => {
  const encoded = encodeURIComponent(`${name} africa safari`);
  return `https://source.unsplash.com/featured/800x600/?${encoded}`;
};

/* ═══════════════════════════════════════════════════
   SKELETON PAGE
═══════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div style={{ background: T.white, minHeight: "100vh", fontFamily: T.sans }}>
    <div style={{ position: "relative", height: "82vh" }}>
      <Skel w="100%" h="100%" r="0" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(28px,5vw,72px) clamp(16px,4vw,48px)", background: "linear-gradient(transparent,rgba(0,0,0,.7)" }}>
        <div style={{ maxWidth: T.max, margin: "0 auto" }}>
          <Skel w={200} h={24} r={T.r.full} style={{ marginBottom: 20, opacity: .5 }} />
          <Skel w={380} h={56} style={{ marginBottom: 16, opacity: .55 }} />
          <Skel w={300} h={22} style={{ marginBottom: 32, opacity: .45 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <Skel w={180} h={52} r={T.r.md} style={{ opacity: .4 }} />
            <Skel w={140} h={52} r={T.r.md} style={{ opacity: .4 }} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ borderBottom: `1px solid ${T.n200}`, padding: "14px clamp(16px,4vw,48px)" }}>
      <div style={{ maxWidth: T.max, margin: "0 auto", display: "flex", gap: 10 }}>
        {[90,110,80,100,75,95].map((w, i) => <Skel key={i} w={w} h={36} r={T.r.full} />)}
      </div>
    </div>
    <div style={{ maxWidth: T.max, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(16px,4vw,48px)" }}>
      <Skel w={240} h={36} style={{ marginBottom: 12 }} />
      <Skel w={400} h={18} style={{ marginBottom: 8 }} />
      <Skel w={52} h={4} r={T.r.sm} style={{ marginBottom: 44 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: T.n50, borderRadius: T.r.lg, border: `1px solid ${T.n200}`, overflow: "hidden" }}>
            <Skel w="100%" h={180} r="0" />
            <div style={{ padding: 24 }}>
              <Skel w="60%" h={20} style={{ marginBottom: 10 }} />
              <Skel w="100%" h={14} style={{ marginBottom: 6 }} />
              <Skel w="80%" h={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate, refetch }) => (
  <div style={{ minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: T.sans, padding: "clamp(24px,5vw,64px)", textAlign: "center", background: T.n50 }}>
    <div className="cp-float" style={{ width: 130, height: 130, borderRadius: "50%", background: T.g50, border: `3px solid ${T.g200}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
      <FiGlobe size={52} color={T.g400} />
    </div>
    <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: T.n800, margin: "0 0 14px" }}>Country Not Found</h2>
    <p style={{ fontSize: "clamp(15px,1.5vw,18px)", color: T.n500, maxWidth: 440, margin: "0 0 36px", lineHeight: 1.65 }}>
      {error?.message || "We couldn't load this country. Please try again."}
    </p>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      <button onClick={refetch} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 28px", background: T.g600, color: T.white, border: "none", borderRadius: T.r.md, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: T.sans }}>
        <FiRefreshCw size={15} /> Retry
      </button>
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 28px", background: T.white, color: T.n700, border: `2px solid ${T.n300}`, borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>
        <FiChevronLeft size={15} /> Go Back
      </button>
      <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 28px", background: T.white, color: T.n700, border: `2px solid ${T.n300}`, borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>
        <FiHome size={15} /> Home
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════ */
const Hero = ({ c }) => {
  const heroImg = c.heroImage || c.coverImageUrl || c.imageUrl || getCountryFallback(c.name);
  return (
    <section style={{ position: "relative", height: "clamp(520px,88vh,900px)", overflow: "hidden" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, animation: "cp-heroZoom 10s ease forwards" }}>
        <img src={heroImg} alt={c.name} onError={(e) => { e.currentTarget.src = getCountryFallback(c.name); }} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </div>

      {/* Overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.28) 45%,rgba(0,0,0,.82) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${T.g900}25,transparent 65%)` }} />

      {/* Bottom gradient line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${T.g400},${T.g600},${T.g400})`, backgroundSize: "200% 100%", animation: "cp-flow 3s ease infinite" }} />

      {/* Breadcrumb */}
      <div style={{ position: "absolute", top: "clamp(80px,10vw,110px)", left: 0, right: 0 }}>
        <Box>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 500 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <FiHome size={13} /> Home
            </Link>
            <FiChevronRight size={13} />
            <Link to="/destinations" style={{ color: "inherit", textDecoration: "none" }}>Destinations</Link>
            <FiChevronRight size={13} />
            <span style={{ color: T.g300, fontWeight: 600 }}>{c.name}</span>
          </div>
        </Box>
      </div>

      {/* Content */}
      <Box style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "clamp(44px,6vw,88px)" }}>
        <div style={{ maxWidth: 840 }}>
          {/* Region badge */}
          {c.region && (
            <div className="cp-fadeUp" style={{ marginBottom: 16, opacity: 0, animationDelay: ".1s" }}>
              <Badge variant="white" size="lg" icon={<FiMapPin size={12} />}>{c.region}</Badge>
            </div>
          )}

          {/* Flag + Title */}
          <div className="cp-fadeUp" style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)", marginBottom: 16, opacity: 0, animationDelay: ".2s" }}>
            {c.flagUrl ? (
              <img src={c.flagUrl} alt={`${c.name} flag`} style={{ width: "clamp(52px,6vw,80px)", height: "clamp(36px,4vw,56px)", borderRadius: T.r.sm, objectFit: "cover", boxShadow: T.sh.lg, flexShrink: 0 }} />
            ) : c.flag ? (
              <img src={`https://flagcdn.com/w80/${c.slug?.slice(0,2)}.png`} alt="" onError={e => e.currentTarget.style.display="none"} style={{ width: "clamp(52px,6vw,80px)", height: "auto", borderRadius: T.r.sm, boxShadow: T.sh.lg, flexShrink: 0 }} />
            ) : null}
            <h1 style={{ fontFamily: T.serif, fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, color: T.white, margin: 0, lineHeight: 1.06, textShadow: "0 4px 32px rgba(0,0,0,.5)", letterSpacing: "-0.02em" }}>
              {c.name}
            </h1>
          </div>

          {/* Tagline */}
          {c.tagline && (
            <p className="cp-fadeUp" style={{ fontSize: "clamp(16px,1.8vw,22px)", color: "rgba(255,255,255,.85)", margin: "0 0 28px", lineHeight: 1.55, fontWeight: 400, maxWidth: 600, opacity: 0, animationDelay: ".3s" }}>
              {c.tagline}
            </p>
          )}

          {/* Stats */}
          <div className="cp-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: "clamp(16px,3vw,36px)", marginBottom: 32, opacity: 0, animationDelay: ".4s" }}>
            {[
              { icon: FiHome, label: "Capital",      value: c.capital },
              { icon: FiUsers, label: "Population",  value: c.population ? fmt(c.population) : null },
              { icon: FiGrid, label: "Destinations", value: c.destinationCount > 0 ? `${c.destinationCount}+ Places` : null },
              { icon: FiGlobe, label: "Continent",   value: c.continent },
            ].filter(s => s.value).map((s, i) => (
              <div key={i} style={{ color: "rgba(255,255,255,.9)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, opacity: .65, textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 600, marginBottom: 3 }}>
                  <s.icon size={11} /> {s.label}
                </div>
                <div style={{ fontSize: "clamp(15px,1.5vw,19px)", fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="cp-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: 12, opacity: 0, animationDelay: ".5s" }}>
            <Link to={`/country/${c.slug}/destinations`} className="cp-btn-primary">
              Explore Destinations <FiArrowRight size={16} />
            </Link>
            <button className="cp-btn-outline" onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </button>
          </div>
        </div>
      </Box>

      {/* Scroll indicator */}
      <div style={{ position: "absolute", bottom: 36, right: "clamp(24px,4vw,60px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,255,255,.45)", fontSize: 11, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", animation: "cp-float 2.8s ease-in-out infinite" }}>
        <span>Scroll</span>
        <FiChevronRight size={16} style={{ transform: "rotate(90deg)" }} />
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION NAV (sticky)
═══════════════════════════════════════════════════ */
const SectionNav = ({ sections, active, onNav }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && active) {
      const btn = ref.current.querySelector(`[data-id="${active}"]`);
      if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: T.white, borderBottom: `1px solid ${T.n200}`, boxShadow: T.sh.sm }}>
      <Box>
        <div ref={ref} className="cp-nav-scroll" style={{ display: "flex", gap: 4, padding: "12px 0" }}>
          {sections.map(s => {
            const isActive = active === s.id;
            return (
              <button key={s.id} data-id={s.id} onClick={() => onNav(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px clamp(12px,1.5vw,20px)", background: isActive ? T.g50 : "transparent", color: isActive ? T.g700 : T.n500, border: `1.5px solid ${isActive ? T.g200 : "transparent"}`, borderRadius: T.r.full, fontSize: 13, fontWeight: 600, fontFamily: T.sans, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.n50; e.currentTarget.style.color = T.n700; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.n500; } }}
              >
                <s.icon size={13} />
                {s.label}
              </button>
            );
          })}
        </div>
      </Box>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK FACTS BAR
═══════════════════════════════════════════════════ */
const QuickFacts = ({ c }) => {
  const facts = [
    { icon: FiHome,     label: "Capital",      value: c.capital },
    { icon: FiUsers,    label: "Population",   value: c.population ? fmt(c.population) : null },
    { icon: FiMap,      label: "Area",         value: c.area ? `${fmt(c.area)} km²` : null },
    { icon: FiActivity, label: "Currency",     value: c.currency ? `${c.currency}${c.currencySymbol ? ` (${c.currencySymbol})` : ""}` : null },
    { icon: FiGlobe,    label: "Language",     value: normStr(safeArr(c.languages || c.officialLanguages)[0]) || null },
    { icon: FiClock,    label: "Timezone",     value: c.timezone },
    { icon: FiPhone,    label: "Calling Code", value: c.callingCode },
    { icon: FiNavigation, label: "Driving",   value: c.drivingSide },
  ].filter(f => f.value);

  if (!facts.length) return null;

  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.n200}` }}>
      <Box style={{ padding: "clamp(24px,4vw,48px) clamp(16px,4vw,48px)" }}>
        <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "clamp(12px,1.5vw,20px)" }}>
          {facts.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "clamp(14px,1.5vw,20px)", background: T.n50, borderRadius: T.r.md, borderLeft: `4px solid ${T.g400}`, transition: "box-shadow .2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = T.sh.md}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ width: 42, height: 42, borderRadius: T.r.sm, background: `linear-gradient(135deg,${T.g50},${T.g100})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.g600, flexShrink: 0 }}>
                <f.icon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: "clamp(13px,1.2vw,16px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════ */
const Overview = ({ c }) => {
  const desc      = c.fullDescription || c.description;
  const highlights = safeArr(c.highlights);
  if (!desc && !highlights.length) return null;

  return (
    <Section id="overview" bg={T.n50}>
      <SectionHead sub={`Discover what makes ${c.name} an extraordinary destination`}>
        About {c.name}
      </SectionHead>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,480px),1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "start" }}>
        {/* Description */}
        {desc && (
          <div>
            {/* Illustration */}
            <div style={{ borderRadius: T.r.lg, overflow: "hidden", marginBottom: 28, boxShadow: T.sh.lg }}>
              <img
                src={c.imageUrl || getCountryFallback(c.name)}
                alt={c.name}
                onError={e => { e.currentTarget.src = getCountryFallback(c.name); }}
                style={{ width: "100%", height: "clamp(200px,28vw,340px)", objectFit: "cover", display: "block" }}
              />
            </div>
            {desc.split(/\n\n|\n/).filter(Boolean).map((p, i) => (
              <p key={i} style={{ fontSize: "clamp(14px,1.3vw,16px)", lineHeight: 1.85, color: T.n600, margin: i > 0 ? "18px 0 0" : 0 }}>{p}</p>
            ))}
            {c.additionalInfo && (
              <div style={{ marginTop: 20, padding: "16px 20px", background: T.g50, borderRadius: T.r.md, borderLeft: `4px solid ${T.g400}` }}>
                <p style={{ margin: 0, fontSize: 14, color: T.g800, lineHeight: 1.7, fontStyle: "italic" }}>{c.additionalInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <Card lift={false} style={{ padding: "clamp(22px,3vw,36px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <IconBox icon={FiStar} size={46} bg={T.g100} color={T.g600} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.g500, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 2 }}>Top Features</div>
                <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: T.n800, margin: 0 }}>Country Highlights</h3>
              </div>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {highlights.map((h, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "clamp(12px,1.5vw,16px) 0", borderBottom: i < highlights.length - 1 ? `1px solid ${T.n100}` : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${T.g500},${T.g700})`, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, boxShadow: `0 2px 8px ${T.g500}40` }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.55, paddingTop: 4 }}>{h}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GEOGRAPHY & CLIMATE
═══════════════════════════════════════════════════ */
const Geography = ({ c }) => {
  const geo = typeof c.geography === "object" && c.geography ? c.geography : {};
  const geoFacts = [
    { label: "Terrain",          value: geo.terrain },
    { label: "Highest Point",    value: geo.highestPoint },
    { label: "Major Rivers",     value: Array.isArray(geo.majorRivers) ? geo.majorRivers.join(", ") : geo.majorRivers },
    { label: "Natural Resources", value: Array.isArray(geo.naturalResources) ? geo.naturalResources.slice(0,4).join(", ") : geo.naturalResources },
    { label: "Area",             value: c.area ? `${fmt(c.area)} km²` : null },
    { label: "Pop. Density",     value: c.populationDensity ? `${c.populationDensity} /km²` : null },
  ].filter(f => f.value);

  if (!geoFacts.length && !c.climate) return null;

  return (
    <Section id="geography" bg={T.white}>
      <SectionHead sub={`Natural landscapes and weather patterns of ${c.name}`}>
        Geography & Climate
      </SectionHead>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 24 }}>
        {/* Geography Card */}
        {geoFacts.length > 0 && (
          <Card>
            <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${T.g50},${T.g100})`, borderBottom: `1px solid ${T.g100}`, display: "flex", alignItems: "center", gap: 12 }}>
              <FiMap size={22} color={T.g700} />
              <h4 style={{ margin: 0, fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.g800 }}>Geography</h4>
            </div>
            <div style={{ padding: "clamp(16px,2vw,24px)" }}>
              {geoFacts.map((f, i) => (
                <div key={i} style={{ padding: "clamp(12px,1.5vw,16px) 0", borderBottom: i < geoFacts.length - 1 ? `1px solid ${T.n100}` : "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: "clamp(13px,1.2vw,15px)", color: T.n800, lineHeight: 1.5 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Climate Card */}
        {c.climate && (
          <Card>
            <div style={{ padding: "18px 24px", background: `linear-gradient(135deg,${T.g100},${T.g200}50)`, borderBottom: `1px solid ${T.g200}`, display: "flex", alignItems: "center", gap: 12 }}>
              <FiSun size={22} color={T.g700} />
              <h4 style={{ margin: 0, fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.g800 }}>Climate</h4>
            </div>
            <div style={{ padding: "clamp(16px,2vw,24px)" }}>
              <p style={{ margin: "0 0 18px", fontSize: "clamp(13px,1.2vw,15px)", color: T.n600, lineHeight: 1.75 }}>
                {typeof c.climate === "string" ? c.climate : c.climate?.overview || ""}
              </p>
              {(c.bestTime || c.bestTimeToVisit) && (
                <div style={{ padding: "14px 16px", background: T.g50, borderRadius: T.r.sm, borderLeft: `3px solid ${T.g500}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: T.g600, textTransform: "uppercase", marginBottom: 5 }}>
                    <FiCalendar size={11} /> Best Time to Visit
                  </div>
                  <div style={{ fontSize: "clamp(13px,1.2vw,15px)", color: T.n800, fontWeight: 600 }}>
                    {c.bestTime || c.bestTimeToVisit}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   PEOPLE & CULTURE
═══════════════════════════════════════════════════ */
const People = ({ c }) => {
  const langs    = safeArr(c.languages || c.officialLanguages).map(normStr).filter(Boolean);
  const ethnic   = safeArr(c.ethnicGroups).map(normStr).filter(Boolean);
  const religion = safeArr(c.religions).map(normStr).filter(Boolean);

  const groups = [
    { items: langs,    label: "Languages",    icon: FiFeather, bg: T.g100 },
    { items: ethnic,   label: "Ethnic Groups",icon: FiUsers,   bg: `${T.g200}70` },
    { items: religion, label: "Religions",    icon: FiHeart,   bg: T.g50 },
  ].filter(g => g.items.length > 0);

  const stats = [
    { icon: FiHeart,  label: "Life Expectancy", value: c.lifeExpectancy ? `${c.lifeExpectancy} yrs` : null },
    { icon: FiBook,   label: "Literacy Rate",   value: c.literacyRate   ? `${c.literacyRate}%`      : null },
    { icon: FiCalendar, label: "Median Age",    value: c.medianAge      ? `${c.medianAge} yrs`      : null },
  ].filter(s => s.value);

  if (!groups.length && !stats.length) return null;

  return (
    <Section id="people" bg={T.n50}>
      <SectionHead sub={`Diverse communities and vibrant culture of ${c.name}`}>
        People & Culture
      </SectionHead>

      {groups.length > 0 && (
        <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,260px),1fr))`, gap: "clamp(16px,2vw,24px)", marginBottom: stats.length ? "clamp(24px,3vw,36px)" : 0 }}>
          {groups.map((g, i) => (
            <Card key={i} lift={false} style={{ padding: "clamp(20px,2.5vw,32px)" }}>
              <IconBox icon={g.icon} size={52} bg={g.bg} color={T.g700} style={{ marginBottom: 18, borderRadius: "50%" }} />
              <h4 style={{ margin: "0 0 16px", fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.n800 }}>{g.label}</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {g.items.slice(0, 8).map((item, j) => (
                  <Badge key={j} variant="green" size="sm">{item}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit,minmax(min(100%,200px),1fr))`, gap: "clamp(12px,1.5vw,18px)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "clamp(14px,1.8vw,22px)", background: T.white, borderRadius: T.r.md, border: `1px solid ${T.n200}` }}>
              <IconBox icon={s.icon} size={46} bg={T.g50} color={T.g600} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.n400, textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: "clamp(16px,1.6vw,20px)", fontWeight: 800, color: T.n800 }}>{s.value}</div>
              </div>
            </div>
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
  const unesco   = safeArr(c.unescoSites);
  if (!timeline.length && !unesco.length) return null;

  return (
    <Section id="history" bg={T.white}>
      <SectionHead sub={`Rich heritage and historical milestones of ${c.name}`}>
        History & Heritage
      </SectionHead>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(28px,4vw,48px)" }}>

        {/* Timeline */}
        {timeline.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <IconBox icon={FiBook} size={42} bg={T.g50} color={T.g600} />
              <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: T.n800, margin: 0 }}>Historical Timeline</h3>
            </div>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom,${T.g400},${T.g100})`, borderRadius: 2 }} />
              {timeline.slice(0, 8).map((ev, i) => (
                <div key={ev.id || i} className="cp-fadeUp" style={{ position: "relative", paddingBottom: "clamp(18px,2vw,26px)", opacity: 0, animationDelay: `${i * 90}ms` }}>
                  <div style={{ position: "absolute", left: -28, top: 4, width: 14, height: 14, borderRadius: "50%", background: ev.isMajor ? T.g500 : T.g300, border: `3px solid ${T.white}`, boxShadow: `0 0 0 3px ${T.g100}` }} />
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.g600, marginBottom: 4 }}>{ev.year}</div>
                  <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.6 }}>{ev.event}</p>
                  {ev.type && <Badge variant="gray" size="xs" style={{ marginTop: 6 }}>{ev.type}</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNESCO */}
        {unesco.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <IconBox icon={FiAward} size={42} bg={T.amberBg} color={T.amber} />
              <h3 style={{ fontFamily: T.serif, fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: T.n800, margin: 0 }}>UNESCO Heritage Sites</h3>
            </div>
            <div className="cp-stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {unesco.slice(0, 6).map((site, i) => (
                <Card key={site.id || i} style={{ padding: "clamp(16px,2vw,22px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800, lineHeight: 1.35 }}>{site.name}</h4>
                    {site.year && <Badge variant="green" size="xs" style={{ flexShrink: 0 }}>{site.year}</Badge>}
                  </div>
                  {site.type && <Badge variant="gray" size="xs" style={{ marginBottom: 8 }}>{site.type}</Badge>}
                  {site.description && <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{site.description}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE & NATURE
═══════════════════════════════════════════════════ */
const Wildlife = ({ c }) => {
  const w = typeof c.wildlife === "object" && c.wildlife ? c.wildlife : {};
  const cats = [
    { key: "mammals",   label: "Mammals",    icon: FiActivity },
    { key: "birds",     label: "Birds",      icon: FiFeather  },
    { key: "reptiles",  label: "Reptiles",   icon: FiEye      },
    { key: "marine",    label: "Marine Life",icon: FiAnchor   },
    { key: "marineLife",label: "Marine Life",icon: FiAnchor   },
    { key: "endangered",label: "Endangered", icon: FiAlertCircle },
  ].filter((cat, idx, arr) =>
    safeArr(w[cat.key]).length > 0 &&
    arr.findIndex(a => a.key === cat.key) === idx
  ).slice(0, 6);

  if (!cats.length) return null;

  return (
    <Section id="wildlife" bg={T.n50}>
      <SectionHead sub={`Incredible biodiversity and wildlife of ${c.name}`}>
        Wildlife & Nature
      </SectionHead>

      {/* Illustration strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "clamp(28px,3vw,44px)", borderRadius: T.r.lg, overflow: "hidden", height: "clamp(140px,18vw,220px)", boxShadow: T.sh.md }}>
        {["safari wildlife africa", "leopard savanna", "elephant kenya"].map((q, i) => (
          <img key={i} src={`https://source.unsplash.com/featured/600x400/?${encodeURIComponent(q)}&sig=${i}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.currentTarget.style.display="none"} />
        ))}
      </div>

      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 20 }}>
        {cats.map((cat, i) => (
          <Card key={i} lift={false}>
            <div style={{ padding: "15px 20px", background: `linear-gradient(135deg,${T.g50},${T.g100})`, borderBottom: `1px solid ${T.g100}`, display: "flex", alignItems: "center", gap: 10 }}>
              <cat.icon size={18} color={T.g700} />
              <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.g800 }}>{cat.label}</h4>
            </div>
            <div style={{ padding: "clamp(14px,1.5vw,18px)", display: "flex", flexWrap: "wrap", gap: 7 }}>
              {safeArr(w[cat.key]).slice(0, 10).map((a, j) => (
                <Badge key={j} variant="gray" size="sm">{normStr(a)}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   CUISINE
═══════════════════════════════════════════════════ */
const Cuisine = ({ c }) => {
  const cuisine   = typeof c.cuisine === "object" && c.cuisine ? c.cuisine : {};
  const staples   = safeArr(cuisine.staples);
  const specialties = safeArr(cuisine.specialties);
  const beverages = safeArr(cuisine.beverages);
  const dishes    = [...staples, ...specialties].map(s => typeof s === "string" ? { name: s } : s);

  if (!dishes.length && !beverages.length) return null;

  return (
    <Section id="cuisine" bg={T.white}>
      <SectionHead sub={`Authentic flavours and traditional dishes of ${c.name}`}>
        Local Cuisine
      </SectionHead>

      {/* Header illustration */}
      <div style={{ borderRadius: T.r.lg, overflow: "hidden", marginBottom: "clamp(24px,3vw,40px)", height: "clamp(160px,20vw,260px)", boxShadow: T.sh.md }}>
        <img src={`https://source.unsplash.com/featured/1600x400/?${encodeURIComponent(`${c.name} food cuisine african`)}`} alt="Cuisine" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.currentTarget.style.display="none"} />
      </div>

      {dishes.length > 0 && (
        <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "clamp(14px,2vw,22px)", marginBottom: beverages.length ? "clamp(28px,3vw,44px)" : 0 }}>
          {dishes.slice(0, 6).map((dish, i) => (
            <Card key={i} className="cp-img-zoom">
              {dish.imageUrl ? (
                <img src={dish.imageUrl} alt={dish.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ height: 140, background: `linear-gradient(135deg,${T.g50},${T.g100})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCoffee size={36} color={T.g300} />
                </div>
              )}
              <div style={{ padding: "clamp(14px,1.5vw,20px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <FiCoffee size={15} color={T.g500} />
                  <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800 }}>{dish.name}</h4>
                </div>
                {dish.description && <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.55 }}>{dish.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {beverages.length > 0 && (
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "clamp(16px,1.6vw,20px)", fontWeight: 700, color: T.n800, marginBottom: 18 }}>
            <FiCoffee size={18} color={T.g600} /> Traditional Beverages
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {beverages.map((b, i) => (
              <div key={i} style={{ padding: "10px 20px", background: T.n50, borderRadius: T.r.md, border: `1px solid ${T.n200}`, fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 600, color: T.n700 }}>
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
    { icon: FiInfo,    title: "Visa Information",     content: c.visaInfo,     color: T.g700,   bg: T.g50  },
    { icon: FiShield,  title: "Health & Vaccinations", content: c.healthInfo,   color: T.red,    bg: T.redBg },
    { icon: FiZap,     title: "Electricity",           content: c.electricalPlug ? `${c.electricalPlug}${c.voltage ? ` · ${c.voltage}` : ""}` : null, color: T.purple, bg: T.purpleBg },
    { icon: FiDroplet, title: "Water Safety",          content: c.waterSafety,  color: T.blue,   bg: T.blueBg },
  ].filter(e => e.content);

  if (!items.length) return null;

  return (
    <Section id="travel" bg={T.n50}>
      <SectionHead sub={`Essential information for travelling to ${c.name}`}>
        Travel Essentials
      </SectionHead>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: "clamp(14px,2vw,22px)" }}>
        {items.map((item, i) => (
          <Card key={i} lift={false}>
            <div style={{ padding: "16px 22px", background: item.bg, borderBottom: `1px solid ${item.color}18`, display: "flex", alignItems: "center", gap: 12 }}>
              <item.icon size={20} color={item.color} />
              <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: item.color }}>{item.title}</h4>
            </div>
            <div style={{ padding: "clamp(16px,2vw,24px)" }}>
              <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,15px)", color: T.n700, lineHeight: 1.8 }}>
                {typeof item.content === "string" ? item.content : item.content?.description || JSON.stringify(item.content)}
              </p>
            </div>
          </Card>
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
      <SectionHead sub={`Vibrant celebrations and cultural events in ${c.name}`}>
        Festivals & Events
      </SectionHead>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(14px,2vw,22px)" }}>
        {fests.slice(0, 6).map((f, i) => (
          <Card key={f.id || i} className="cp-img-zoom">
            {f.imageUrl ? (
              <img src={f.imageUrl} alt={f.name} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ height: 160, background: `linear-gradient(135deg,${T.g600},${T.g800})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiCalendar size={40} color="rgba(255,255,255,.4)" />
              </div>
            )}
            <div style={{ padding: "clamp(16px,2vw,22px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: "clamp(14px,1.3vw,17px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>{f.name}</h4>
                {f.isMajorEvent && <Badge variant="warning" size="xs">Major</Badge>}
              </div>
              {(f.period || f.month) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: T.g600, fontSize: 13, fontWeight: 600 }}>
                  <FiCalendar size={12} /> {f.period || f.month}
                </div>
              )}
              {f.description && <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.6 }}>{f.description}</p>}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   AIRPORTS / GETTING THERE
═══════════════════════════════════════════════════ */
const Airports = ({ c }) => {
  const airports = safeArr(c.airports);
  if (!airports.length) return null;

  return (
    <Section id="airports" bg={T.n50}>
      <SectionHead sub={`Key entry points and transport hubs for ${c.name}`}>
        Getting There
      </SectionHead>

      {/* Map illustration */}
      <div style={{ borderRadius: T.r.lg, overflow: "hidden", marginBottom: "clamp(24px,3vw,40px)", height: "clamp(150px,18vw,220px)", boxShadow: T.sh.md }}>
        <img src={`https://source.unsplash.com/featured/1600x400/?${encodeURIComponent(`${c.name} airport terminal travel`)}`} alt="Airport" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => e.currentTarget.style.display="none"} />
      </div>

      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(14px,2vw,20px)" }}>
        {airports.slice(0, 6).map((a, i) => (
          <Card key={a.id || i} style={{ padding: "clamp(18px,2vw,26px)", borderLeft: a.isMainInternational ? `4px solid ${T.g500}` : `4px solid ${T.n300}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <IconBox icon={FiNavigation} size={48} bg={a.isMainInternational ? T.g50 : T.n100} color={a.isMainInternational ? T.g600 : T.n500} />
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: "0 0 5px", fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>{a.name}</h4>
                {a.code && (
                  <span style={{ display: "inline-block", fontSize: 13, fontWeight: 800, color: T.g600, background: T.g100, padding: "2px 10px", borderRadius: T.r.xs }}>{a.code}</span>
                )}
              </div>
            </div>
            {a.location && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: T.n500, marginBottom: 8 }}><FiMapPin size={12} /> {a.location}</div>}
            {a.type && <Badge variant="gray" size="xs" style={{ marginBottom: a.description ? 8 : 0 }}>{a.type}</Badge>}
            {a.description && <p style={{ margin: "8px 0 0", fontSize: 13, color: T.n500, lineHeight: 1.6 }}>{a.description}</p>}
            {a.isMainInternational && <Badge variant="success" size="xs" icon={<FiStar size={9} />} style={{ marginTop: 10 }}>Main International</Badge>}
          </Card>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: "clamp(24px,3vw,44px)" }}>
        <SectionHead sub={`Discover stunning places across ${countryName}`}>
          Explore Destinations
        </SectionHead>
        {countrySlug && (
          <Link to={`/country/${countrySlug}/destinations`} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: T.g600, textDecoration: "none", padding: "10px 20px", borderRadius: T.r.full, border: `2px solid ${T.g200}`, transition: "all .2s", flexShrink: 0, marginBottom: "clamp(28px,4vw,52px)" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.g50; e.currentTarget.style.borderColor = T.g400; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.g200; }}>
            View All <FiArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: "clamp(14px,2vw,24px)" }}>
        {destinations.slice(0, 9).map((d, i) => {
          const img = d.imageUrl || d.image_url || safeArr(d.images)[0] || getDestFallback(d.name);
          return (
            <Link key={d.id || i} to={`/destinations/${d.slug || d.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card className="cp-img-zoom" style={{ height: "100%" }}>
                <div style={{ position: "relative", height: "clamp(160px,18vw,220px)", overflow: "hidden", flexShrink: 0 }}>
                  <img src={img} alt={d.name} onError={e => { e.currentTarget.src = getDestFallback(d.name); }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.38) 0%,transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                    {(d.isFeatured || d.is_featured) && <Badge variant="green" size="xs" icon={<FiStar size={9} />}>Featured</Badge>}
                  </div>
                  {d.rating && (
                    <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.6)", color: T.amber, padding: "4px 10px", borderRadius: T.r.xs, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <FiStar size={11} fill={T.amber} /> {d.rating}
                    </div>
                  )}
                </div>
                <div style={{ padding: "clamp(14px,1.8vw,22px)" }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 700, color: T.n800, lineHeight: 1.3 }}>{d.name}</h4>
                  {(d.category) && <Badge variant="green" size="xs" style={{ marginBottom: 10 }}>{d.category}</Badge>}
                  {(d.shortDescription || d.short_description || d.description) && (
                    <p style={{ margin: 0, fontSize: 13, color: T.n500, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {d.shortDescription || d.short_description || d.description}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, fontSize: 12, fontWeight: 600, color: T.g600 }}>
                    Explore <FiArrowRight size={12} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY — Professional Masonry + Lightbox
═══════════════════════════════════════════════════ */
const Gallery = ({ images, name }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const imgs        = safeArr(images);
  if (!imgs.length) return null;

  const getUrl = (img) => typeof img === "string" ? img : img?.url || img?.imageUrl || img?.src || "";
  const visible = imgs.slice(0, 9);

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
      if (e.key === "Escape")     setLb(p => ({ ...p, open: false }));
      if (e.key === "ArrowLeft")  setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
      if (e.key === "ArrowRight") setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lb.open, imgs.length]);

  // Build masonry-style layout: [2-col-big, 1-col-small, 1-col-small] repeated
  const layout = visible.map((img, i) => {
    const url  = getUrl(img);
    const span = i === 0 ? { col: "span 2", row: "span 2", pb: "60%" } :
                 i === 1 || i === 2 ? { col: "span 1", row: "span 1", pb: "90%" } :
                 i === 3 ? { col: "span 2", row: "span 1", pb: "42%" } :
                 { col: "span 1", row: "span 1", pb: "80%" };
    return { url, span, i };
  });

  return (
    <Section id="gallery" bg={T.n50}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: "clamp(20px,2.5vw,36px)" }}>
        <SectionHead sub={`Stunning photography from ${name}`}>
          Photo Gallery
        </SectionHead>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.n400, fontWeight: 500, marginBottom: "clamp(28px,4vw,52px)" }}>
          <FiCamera size={14} /> {visible.length} photos
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridAutoRows: "180px", gap: "clamp(6px,1vw,12px)", borderRadius: T.r.lg, overflow: "hidden", boxShadow: T.sh.lg }}>
        {layout.map(({ url, span, i }) => (
          <div key={i} onClick={() => setLb({ open: true, idx: i })}
            style={{ gridColumn: span.col, gridRow: span.row, position: "relative", overflow: "hidden", cursor: "zoom-in", background: T.n200 }}>
            <img src={url} alt={`${name} ${i + 1}`}
              onError={e => { e.currentTarget.src = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(name + " travel")}&sig=${i}`; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .55s cubic-bezier(.22,1,.36,1)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.25) 0%,transparent 50%)", opacity: 0, transition: "opacity .3s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0"}>
              <div style={{ position: "absolute", bottom: 10, right: 12, color: T.white }}>
                <FiEye size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {imgs.length > 9 && (
        <div style={{ textAlign: "center", marginTop: "clamp(16px,2vw,24px)" }}>
          <span style={{ fontSize: 13, color: T.n400, fontWeight: 500 }}>
            Showing 9 of {imgs.length} photos
          </span>
        </div>
      )}

      {/* Lightbox */}
      {lb.open && (
        <div className="cp-fadeIn" onClick={() => setLb(p => ({ ...p, open: false }))}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.97)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px,3vw,40px)" }}>

          {/* Close */}
          <button onClick={() => setLb(p => ({ ...p, open: false }))}
            style={{ position: "absolute", top: 20, right: 20, width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
            <FiX size={20} />
          </button>

          {/* Image */}
          <img src={getUrl(imgs[lb.idx])} alt="" className="cp-scaleIn"
            onClick={e => e.stopPropagation()}
            onError={e => { e.currentTarget.src = `https://source.unsplash.com/featured/1200x800/?${encodeURIComponent(name)}&sig=${lb.idx}`; }}
            style={{ maxWidth: "88vw", maxHeight: "84vh", objectFit: "contain", borderRadius: T.r.md, boxShadow: "0 32px 64px rgba(0,0,0,.7)" }}
          />

          {/* Nav buttons */}
          {imgs.length > 1 && (
            <>
              <button onClick={prev}
                style={{ position: "absolute", left: "clamp(10px,2vw,28px)", top: "50%", transform: "translateY(-50%)", width: "clamp(44px,5vw,56px)", height: "clamp(44px,5vw,56px)", borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
                <FiChevronLeft size={22} />
              </button>
              <button onClick={next}
                style={{ position: "absolute", right: "clamp(10px,2vw,28px)", top: "50%", transform: "translateY(-50%)", width: "clamp(44px,5vw,56px)", height: "clamp(44px,5vw,56px)", borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
                <FiChevronRight size={22} />
              </button>
            </>
          )}

          {/* Counter + strip */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px", background: "linear-gradient(transparent,rgba(0,0,0,.8))", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {/* Thumbnail strip */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "90vw", padding: "4px 0" }}>
              {imgs.slice(0, 12).map((img, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: i })); }}
                  style={{ width: 52, height: 38, borderRadius: 6, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: `2px solid ${lb.idx === i ? T.g400 : "transparent"}`, transition: "border-color .2s", opacity: lb.idx === i ? 1 : 0.5 }}>
                  <img src={getUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 500 }}>
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
      <SectionHead sub={`Practical advice to make the most of ${c.name}`}>
        Travel Tips
      </SectionHead>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(14px,1.8vw,22px)" }}>
        {tips.map((tip, i) => (
          <Card key={i} style={{ padding: "clamp(18px,2vw,26px)", display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${T.g500},${T.g700})`, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0, boxShadow: T.sh.green }}>
              {i + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              {typeof tip !== "string" && tip?.title && (
                <h4 style={{ margin: "0 0 7px", fontSize: "clamp(14px,1.3vw,16px)", fontWeight: 700, color: T.n800 }}>{tip.title}</h4>
              )}
              <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,14px)", color: T.n600, lineHeight: 1.7 }}>
                {typeof tip === "string" ? tip : tip?.content || tip?.description || String(tip)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   ECONOMIC INFO
═══════════════════════════════════════════════════ */
const EconomicInfo = ({ c }) => {
  const eco    = typeof c.economicInfo === "object" && c.economicInfo ? c.economicInfo : {};
  const fields = Object.entries(eco).filter(([, v]) => v && typeof v === "string");
  if (!fields.length) return null;

  return (
    <Section id="economy" bg={T.n50}>
      <SectionHead sub={`Economic landscape and key industries of ${c.name}`}>
        Economy
      </SectionHead>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "clamp(12px,1.5vw,18px)" }}>
        {fields.slice(0, 8).map(([key, val], i) => (
          <div key={i} style={{ padding: "clamp(16px,1.8vw,22px)", background: T.white, borderRadius: T.r.md, border: `1px solid ${T.n200}`, borderLeft: `4px solid ${T.g400}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <FiBriefcase size={14} color={T.g500} />
              <div style={{ fontSize: 10, fontWeight: 700, color: T.n400, textTransform: "uppercase", letterSpacing: ".5px" }}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
              </div>
            </div>
            <div style={{ fontSize: "clamp(14px,1.3vw,16px)", color: T.n800, fontWeight: 600 }}>{val}</div>
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
    <Section id="ai-insights" bg={T.g900}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "clamp(24px,3vw,44px)" }}>
        <div style={{ width: 50, height: 50, borderRadius: T.r.md, background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FiTrendingUp size={24} color={T.g300} />
        </div>
        <div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, color: T.white, margin: 0 }}>AI Travel Intelligence</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: "4px 0 0" }}>Powered by DeepSeek · Gemini · GPT — updated 2026</p>
        </div>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: "rgba(255,255,255,.07)", borderRadius: T.r.md, padding: 24 }}>
              <Skel w="40%" h={14} style={{ marginBottom: 12, background: "rgba(255,255,255,.15)" }} />
              <Skel w="100%" h={12} style={{ marginBottom: 8, background: "rgba(255,255,255,.1)" }} />
              <Skel w="80%" h={12} style={{ background: "rgba(255,255,255,.1)" }} />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: 24, background: "rgba(239,68,68,.15)", borderRadius: T.r.md, border: "1px solid rgba(239,68,68,.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FCA5A5", fontSize: 14 }}>
            <FiAlertCircle size={16} /> {error}
          </div>
          <button onClick={onRetry} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "rgba(255,255,255,.12)", color: T.white, border: "1px solid rgba(255,255,255,.2)", borderRadius: T.r.full, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <FiRefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {insights && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {insights.summary && (
            <div style={{ padding: "clamp(18px,2vw,28px)", background: "rgba(255,255,255,.07)", borderRadius: T.r.md, borderLeft: `4px solid ${T.g400}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.g400, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>Overview</div>
              <p style={{ margin: 0, fontSize: "clamp(14px,1.3vw,16px)", color: "rgba(255,255,255,.87)", lineHeight: 1.8 }}>{insights.summary}</p>
            </div>
          )}

          {insights.quickStats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 12 }}>
              {Object.entries(insights.quickStats).map(([k, v]) => (
                <div key={k} style={{ padding: "16px 14px", background: "rgba(255,255,255,.07)", borderRadius: T.r.md, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: T.g300, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600, marginBottom: 6 }}>
                    {k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                  </div>
                  <div style={{ fontSize: "clamp(13px,1.2vw,15px)", fontWeight: 700, color: T.white }}>{v}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16 }}>
            {[
              { key: "demographics", label: "Demographics", icon: FiUsers },
              { key: "economy",      label: "Economy",      icon: FiTrendingUp },
              { key: "tourismOutlook", label: "Tourism",    icon: FiGlobe },
              { key: "currentEvents",  label: "Current Events", icon: FiInfo },
            ].filter(item => insights[item.key]).map(item => (
              <div key={item.key} style={{ padding: "clamp(16px,2vw,24px)", background: "rgba(255,255,255,.07)", borderRadius: T.r.md }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>
                  <item.icon size={13} /> {item.label}
                </div>
                <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,14px)", color: "rgba(255,255,255,.78)", lineHeight: 1.75 }}>{insights[item.key]}</p>
              </div>
            ))}
          </div>

          {(insights.bestTravelMonths?.length > 0) && (
            <div style={{ padding: "clamp(16px,2vw,22px)", background: "rgba(255,255,255,.07)", borderRadius: T.r.md }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: T.g300, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 14 }}>
                <FiCalendar size={12} /> Best Months to Travel
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {insights.bestTravelMonths.map((m, i) => (
                  <span key={i} style={{ padding: "7px 16px", background: `${T.g600}55`, color: T.g200, borderRadius: T.r.full, fontSize: 13, fontWeight: 600, border: `1px solid ${T.g700}` }}>{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   FOOTER CTA
═══════════════════════════════════════════════════ */
const FooterCTA = ({ c }) => (
  <section style={{ background: `linear-gradient(145deg,${T.g700} 0%,${T.g900} 100%)`, padding: "clamp(72px,10vw,130px) 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
    {/* Pattern overlay */}
    <div style={{ position: "absolute", inset: 0, opacity: .05, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />

    {/* Floating rings */}
    {[{ s:180, t:"10%", l:"4%", d:"0s" }, { s:120, t:"60%", r:"6%", d:"1.6s" }, { s:80, t:"30%", r:"18%", d:"0.9s" }].map((r, i) => (
      <div key={i} style={{ position: "absolute", width: r.s, height: r.s, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.06)", top: r.t, left: r.l, right: r.r, animation: `cp-float 4s ease-in-out ${r.d} infinite`, pointerEvents: "none" }} />
    ))}

    <Box style={{ position: "relative" }}>
      <div className="cp-float" style={{ display: "inline-flex", marginBottom: 24, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,.1)", alignItems: "center", justifyContent: "center" }}>
        <FiGlobe size={36} color={T.g300} />
      </div>
      <h2 style={{ fontFamily: T.serif, fontSize: "clamp(28px,5vw,56px)", fontWeight: 800, color: T.white, margin: "0 0 18px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Ready to Explore {c.name}?
      </h2>
      <p style={{ fontSize: "clamp(16px,1.7vw,20px)", color: "rgba(255,255,255,.78)", maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.7 }}>
        Start planning your adventure. Discover stunning destinations, rich culture, and unforgettable wildlife experiences.
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
        {c.destinationCount > 0 && (
          <Link to={`/country/${c.slug}/destinations`} className="cp-btn-primary">
            View All Destinations <FiArrowRight size={16} />
          </Link>
        )}
        <Link to="/destinations" className="cp-btn-outline">
          More Countries
        </Link>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px,5vw,64px)", flexWrap: "wrap" }}>
        {[
          { icon: FiShield,   text: "Expert Guides" },
          { icon: FiStar,     text: "Top Rated"     },
          { icon: FiAward,    text: "Verified"       },
          { icon: FiActivity, text: "24/7 Support"   },
        ].map((t, i) => (
          <div key={i} style={{ textAlign: "center", color: "rgba(255,255,255,.65)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <t.icon size={28} />
            </div>
            <div style={{ fontSize: "clamp(11px,1vw,13px)", fontWeight: 600, letterSpacing: ".4px" }}>{t.text}</div>
          </div>
        ))}
      </div>
    </Box>
  </section>
);

/* ═══════════════════════════════════════════════════
   NAV SECTION DEFINITIONS
═══════════════════════════════════════════════════ */
const buildSections = (c, destinations) => {
  const s = [];
  if (!c) return s;
  if (c.description || c.fullDescription || safeArr(c.highlights).length)
    s.push({ id: "overview",    label: "Overview",       icon: FiInfo });
  if (c.area || c.climate || Object.keys(c.geography || {}).length)
    s.push({ id: "geography",   label: "Geography",      icon: FiMap });
  if (safeArr(c.languages).length || safeArr(c.ethnicGroups).length)
    s.push({ id: "people",      label: "People",         icon: FiUsers });
  if (safeArr(c.historicalTimeline).length || safeArr(c.unescoSites).length)
    s.push({ id: "history",     label: "History",        icon: FiBook });
  if (typeof c.wildlife === "object" && Object.values(c.wildlife || {}).some(v => Array.isArray(v) && v.length))
    s.push({ id: "wildlife",    label: "Wildlife",       icon: FiActivity });
  if (typeof c.cuisine === "object" && Object.values(c.cuisine || {}).some(v => Array.isArray(v) && v.length))
    s.push({ id: "cuisine",     label: "Cuisine",        icon: FiCoffee });
  if (typeof c.economicInfo === "object" && Object.keys(c.economicInfo || {}).length)
    s.push({ id: "economy",     label: "Economy",        icon: FiTrendingUp });
  if (c.visaInfo || c.healthInfo || c.electricalPlug || c.waterSafety)
    s.push({ id: "travel",      label: "Travel Info",    icon: FiShield });
  if (safeArr(c.festivals).length)
    s.push({ id: "festivals",   label: "Festivals",      icon: FiCalendar });
  if (safeArr(c.airports).length)
    s.push({ id: "airports",    label: "Getting There",  icon: FiNavigation });
  if (safeArr(destinations).length)
    s.push({ id: "destinations",label: "Destinations",   icon: FiMapPin });
  if (safeArr(c.images).length)
    s.push({ id: "gallery",     label: "Gallery",        icon: FiCamera });
  if (safeArr(c.travelTips).length)
    s.push({ id: "tips",        label: "Tips",           icon: FiStar });
  s.push({ id: "ai-insights", label: "AI Insights",     icon: FiTrendingUp });
  return s;
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const CountryPage = () => {
  const { countryId, idOrSlug, id } = useParams();
  const slug     = countryId || idOrSlug || id;
  const navigate = useNavigate();
  const { mob }  = useScreen();
  const [activeSection, setActiveSection] = useState("overview");
  const [destinations, setDestinations]   = useState([]);

  useEffect(() => { injectStyles(); }, []);

  const { country, loading, error, refetch, insights, insightsLoading, insightsError, retryInsights } =
    useCountry(slug, { withInsights: true });

  // Fetch destination preview
  useEffect(() => {
    if (!country?.slug) return;
    import("../services/countryService")
      .then(({ default: cs }) => cs.getDestinations(country.slug, { limit: 9 }))
      .then(res => setDestinations(res.data ?? []))
      .catch(() => setDestinations([]));
  }, [country?.slug]);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [slug]);

  // Scroll spy
  const sections = buildSections(country, destinations);
  useEffect(() => {
    if (!sections.length) return;
    const ids = sections.map(s => s.id);
    const handler = () => {
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections.length]);

  const scrollTo = useCallback(id => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 68, behavior: "smooth" });
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
      <AIInsights insights={insights} loading={insightsLoading} error={insightsError} onRetry={retryInsights} />
      <FooterCTA c={c} />
    </div>
  );
};

export default CountryPage;