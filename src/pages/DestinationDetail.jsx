import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════ */
const T = {
  green50: "#ECFDF5",
  green100: "#D1FAE5",
  green200: "#A7F3D0",
  green300: "#6EE7B7",
  green400: "#34D399",
  green500: "#10B981",
  green600: "#059669",
  green700: "#047857",
  green800: "#065F46",
  green900: "#064E3B",

  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  amber: "#F59E0B",
  amberLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEF2F2",
  blue: "#3B82F6",
  blueLight: "#DBEAFE",

  sans: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'Playfair Display',Georgia,serif",

  max: "1280px",
  narrow: "960px",

  r: { xs: "6px", sm: "10px", md: "14px", lg: "20px", xl: "28px", full: "9999px" },

  shadow: {
    xs: "0 1px 2px rgba(0,0,0,.05)",
    sm: "0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06)",
    md: "0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)",
    xl: "0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)",
    xxl: "0 25px 50px -12px rgba(0,0,0,.25)",
  },
};

/* ═══════════════════════════════════════════════════
   GLOBAL ANIMATION STYLES
   ═══════════════════════════════════════════════════ */
const AnimationStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    ::selection { background: ${T.green100}; color: ${T.green900}; }

    /* ── keyframes ──────────────────────────── */
    @keyframes dd-shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes dd-fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dd-fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes dd-scaleIn {
      from { opacity: 0; transform: scale(.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes dd-slideRight {
      from { opacity: 0; transform: translateX(-24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes dd-slideLeft {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes dd-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes dd-pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: .6; }
    }
    @keyframes dd-glow {
      0%, 100% { box-shadow: 0 0 8px ${T.green400}44; }
      50%      { box-shadow: 0 0 24px ${T.green400}66; }
    }
    @keyframes dd-heroZoom {
      from { transform: scale(1.05); }
      to   { transform: scale(1); }
    }
    @keyframes dd-countUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dd-borderFlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes dd-wiggle {
      0%, 100% { transform: rotate(0deg); }
      25%      { transform: rotate(3deg); }
      75%      { transform: rotate(-3deg); }
    }

    /* ── utility classes ────────────────────── */
    .dd-skel {
      background: linear-gradient(90deg, ${T.gray200} 25%, ${T.gray100} 50%, ${T.gray200} 75%);
      background-size: 200% 100%;
      animation: dd-shimmer 1.4s ease-in-out infinite;
      border-radius: ${T.r.sm};
    }
    .dd-fadeUp   { animation: dd-fadeUp .7s cubic-bezier(.22,1,.36,1) forwards; }
    .dd-fadeIn   { animation: dd-fadeIn .5s ease forwards; }
    .dd-scaleIn  { animation: dd-scaleIn .4s ease forwards; }
    .dd-slideR   { animation: dd-slideRight .6s ease forwards; }
    .dd-slideL   { animation: dd-slideLeft .6s ease forwards; }
    .dd-float    { animation: dd-float 3s ease-in-out infinite; }
    .dd-wiggle:hover { animation: dd-wiggle .4s ease; }

    .dd-lift {
      transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease;
    }
    .dd-lift:hover {
      transform: translateY(-6px);
      box-shadow: ${T.shadow.xl};
    }

    .dd-imgZoom {
      overflow: hidden;
    }
    .dd-imgZoom img {
      transition: transform .5s cubic-bezier(.22,1,.36,1);
    }
    .dd-imgZoom:hover img {
      transform: scale(1.08);
    }

    .dd-stagger > * {
      opacity: 0;
      animation: dd-fadeUp .6s cubic-bezier(.22,1,.36,1) forwards;
    }
    ${Array.from({ length: 12 }, (_, i) => `.dd-stagger > *:nth-child(${i + 1}) { animation-delay: ${i * 80}ms; }`).join("\n")}

    /* ── scrollbar ──────────────────────────── */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${T.gray100}; }
    ::-webkit-scrollbar-thumb { background: ${T.green300}; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: ${T.green400}; }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */
const useWindowSize = () => {
  const [s, setS] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const fn = () => setS({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { ...s, mob: s.w < 768, tab: s.w >= 768 && s.w < 1024, desk: s.w >= 1024 };
};

const useInView = (opts = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: opts.threshold || 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ═══════════════════════════════════════════════════
   SKELETON LOADER (FULL PAGE)
   ═══════════════════════════════════════════════════ */
const Skel = ({ w = "100%", h = "20px", r = T.r.sm, style = {} }) => (
  <div className="dd-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const FullPageSkeleton = ({ mob }) => (
  <div style={{ background: T.white, minHeight: "100vh", fontFamily: T.sans }}>
    {/* Hero */}
    <div style={{ position: "relative", height: mob ? "60vh" : "80vh" }}>
      <Skel w="100%" h="100%" r="0" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mob ? "32px 20px" : "64px 48px", background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)" }}>
        <div style={{ maxWidth: T.max, margin: "0 auto" }}>
          <Skel w="100px" h="28px" style={{ marginBottom: 16, opacity: .6 }} />
          <Skel w={mob ? "85%" : "420px"} h={mob ? "32px" : "52px"} style={{ marginBottom: 14, opacity: .6 }} />
          <Skel w={mob ? "60%" : "300px"} h="22px" style={{ marginBottom: 28, opacity: .6 }} />
          <div style={{ display: "flex", gap: 10 }}>
            {[100, 80, 110].map((x, i) => <Skel key={i} w={`${x}px`} h="34px" r={T.r.full} style={{ opacity: .5 }} />)}
          </div>
        </div>
      </div>
    </div>

    {/* Quick bar */}
    <div style={{ borderBottom: `1px solid ${T.gray200}`, padding: "20px 24px" }}>
      <div style={{ maxWidth: T.max, margin: "0 auto", display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(5,1fr)", gap: 20 }}>
        {Array.from({ length: mob ? 4 : 5 }).map((_, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <Skel w="44px" h="44px" r="50%" style={{ margin: "0 auto 10px" }} />
            <Skel w="50%" h="12px" style={{ margin: "0 auto 6px" }} />
            <Skel w="70%" h="16px" style={{ margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </div>

    {/* Content */}
    <div style={{ maxWidth: T.max, margin: "0 auto", padding: mob ? "48px 20px" : "80px 48px" }}>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "5fr 3fr", gap: 48 }}>
        <div>
          <Skel w="200px" h="32px" style={{ marginBottom: 24 }} />
          {[1, 2, 3, 4, 5].map(i => <Skel key={i} w={i === 5 ? "55%" : "100%"} h="16px" style={{ marginBottom: 14 }} />)}
          <div style={{ marginTop: 40 }}>
            <Skel w="160px" h="28px" style={{ marginBottom: 20 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Skel w="28px" h="28px" r="50%" />
                  <Skel w="65%" h="16px" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ background: T.gray50, borderRadius: T.r.lg, padding: 24 }}>
            <Skel w="100%" h="52px" r={T.r.md} style={{ marginBottom: 18 }} />
            <Skel w="55%" h="18px" style={{ marginBottom: 22 }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Skel w="38%" h="14px" />
                <Skel w="48%" h="14px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery skeleton */}
      <div style={{ marginTop: 80 }}>
        <Skel w="140px" h="30px" style={{ marginBottom: 28 }} />
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ position: "relative", paddingBottom: "75%" }}><Skel w="100%" h="100%" style={{ position: "absolute", inset: 0 }} r={T.r.md} /></div>)}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════ */
const Container = ({ children, narrow, style = {} }) => (
  <div style={{ maxWidth: narrow ? T.narrow : T.max, margin: "0 auto", padding: "0 24px", width: "100%", ...style }}>{children}</div>
);

const Badge = ({ children, variant = "primary", size = "md", icon, style = {} }) => {
  const v = {
    primary: { bg: T.green100, c: T.green800 },
    accent: { bg: T.green200, c: T.green900 },
    white: { bg: "rgba(255,255,255,.18)", c: T.white, border: "1px solid rgba(255,255,255,.35)" },
    dark: { bg: "rgba(0,0,0,.55)", c: T.white },
    gray: { bg: T.gray100, c: T.gray700 },
    success: { bg: "#D1FAE5", c: "#065F46" },
    warning: { bg: "#FEF3C7", c: "#92400E" },
    info: { bg: "#DBEAFE", c: "#1E40AF" },
    star: { bg: "rgba(251,191,36,.2)", c: "#FBBF24" },
  }[variant] || { bg: T.green100, c: T.green800 };
  const s = { xs: { p: "3px 8px", f: 10 }, sm: { p: "5px 12px", f: 11 }, md: { p: "6px 16px", f: 12 }, lg: { p: "8px 20px", f: 14 } }[size] || { p: "6px 16px", f: 12 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: v.bg, color: v.c, border: v.border || "none", fontWeight: 700, fontFamily: T.sans, borderRadius: T.r.full, textTransform: "uppercase", letterSpacing: ".6px", padding: s.p, fontSize: s.f, whiteSpace: "nowrap", ...style }}>
      {icon && <span style={{ fontSize: s.f + 3 }}>{icon}</span>}
      {children}
    </span>
  );
};

const IconCircle = ({ icon, size = 48, bg = T.green50, color = T.green600, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .48, color, flexShrink: 0, ...style }}>
    {icon}
  </div>
);

const AnimatedSection = ({ children, id, bg = T.white, py, mob }) => {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} id={id} style={{ background: bg, padding: py || (mob ? "64px 0" : "100px 0"), opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)" }}>
      {children}
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */
const Hero = ({ d, mob }) => (
  <section style={{ position: "relative", height: mob ? "75vh" : "88vh", minHeight: 520, overflow: "hidden" }}>
    {/* BG Image with zoom animation */}
    <div style={{ position: "absolute", inset: 0, animation: "dd-heroZoom 8s ease forwards" }}>
      <img src={d.heroImage || d.imageUrl} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>

    {/* Overlays */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.35) 50%, rgba(0,0,0,.82) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${T.green900}30, transparent 70%)` }} />

    {/* Bottom green accent */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, ${T.green400}, ${T.green600}, ${T.green400})`, backgroundSize: "200% 100%", animation: "dd-borderFlow 3s ease infinite" }} />

    {/* Content */}
    <Container style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: mob ? 44 : 72 }}>
      <div style={{ maxWidth: 820 }}>
        {/* Breadcrumb */}
        <div className="dd-fadeUp" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, animationDelay: ".1s", opacity: 0 }}>
          {d.countrySlug && (
            <Link to={`/countries/${d.countrySlug}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,.9)", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color .2s" }}>
              {d.country?.flag && <span style={{ fontSize: 22 }}>{d.country.flag}</span>}
              <span>{d.countryName || d.country?.name}</span>
            </Link>
          )}
          {d.region && (
            <>
              <span style={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>›</span>
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>{d.region}</span>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="dd-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, animationDelay: ".2s", opacity: 0 }}>
          {d.isFeatured && <Badge variant="star" size="md" icon="⭐">Featured</Badge>}
          {d.isPopular && <Badge variant="warning" size="md" icon="🔥">Popular</Badge>}
          {d.isEcoFriendly && <Badge variant="success" size="md" icon="🌿">Eco-Friendly</Badge>}
          {d.destinationType && <Badge variant="white" size="md">{d.destinationType}</Badge>}
        </div>

        {/* Title */}
        <h1 className="dd-fadeUp" style={{ fontFamily: T.serif, fontSize: mob ? 36 : 60, fontWeight: 800, color: T.white, margin: "0 0 14px", lineHeight: 1.08, textShadow: "0 4px 32px rgba(0,0,0,.5)", animationDelay: ".3s", opacity: 0 }}>
          {d.name}
        </h1>

        {/* Tagline */}
        {d.tagline && (
          <p className="dd-fadeUp" style={{ fontSize: mob ? 18 : 24, color: "rgba(255,255,255,.88)", margin: "0 0 28px", lineHeight: 1.5, fontWeight: 500, maxWidth: 600, animationDelay: ".4s", opacity: 0 }}>
            {d.tagline}
          </p>
        )}

        {/* Rating + Duration */}
        <div className="dd-fadeUp" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: mob ? 14 : 24, animationDelay: ".5s", opacity: 0 }}>
          {d.rating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(251,191,36,.2)", padding: "8px 16px", borderRadius: T.r.full, backdropFilter: "blur(8px)" }}>
                <span style={{ color: "#FBBF24", fontSize: 20 }}>★</span>
                <span style={{ color: T.white, fontWeight: 800, fontSize: 17 }}>{d.rating}</span>
              </div>
              {d.reviewCount > 0 && <span style={{ color: "rgba(255,255,255,.65)", fontSize: 14 }}>({d.reviewCount} reviews)</span>}
            </div>
          )}
          {d.duration && <Badge variant="dark" size="lg" icon="🕐">{d.duration}</Badge>}
          {d.category && <Badge variant="dark" size="lg">{d.category}</Badge>}
        </div>
      </div>
    </Container>
  </section>
);

/* ═══════════════════════════════════════════════════
   QUICK INFO BAR (sticky)
   ═══════════════════════════════════════════════════ */
const QuickInfoBar = ({ d, mob }) => {
  const items = [
    { icon: "🕐", label: "Duration", value: d.duration || (d.durationDays ? `${d.durationDays} Days` : null) },
    { icon: "📊", label: "Difficulty", value: d.difficulty || d.fitnessLevel, badge: true },
    { icon: "👥", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize} – ${d.maxGroupSize}` : null },
    { icon: "⭐", label: "Rating", value: d.rating ? `${d.rating} / 5` : null, highlight: true },
    { icon: "🎫", label: "Entry Fee", value: d.entranceFee },
  ].filter(i => i.value);

  if (!items.length) return null;

  return (
    <div style={{ background: T.white, borderBottom: `1px solid ${T.gray200}`, position: "sticky", top: 0, zIndex: 90, boxShadow: T.shadow.sm }}>
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: mob ? `repeat(${Math.min(items.length, 2)},1fr)` : `repeat(${items.length},1fr)`, gap: 0, padding: mob ? "16px 0" : "0" }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: mob ? "10px" : "22px 16px", borderRight: !mob && i < items.length - 1 ? `1px solid ${T.gray200}` : "none" }}>
              <span className="dd-wiggle" style={{ fontSize: 26, marginBottom: 6, cursor: "default" }}>{it.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.gray400, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 3 }}>{it.label}</span>
              {it.badge ? (
                <Badge variant={it.value === "easy" ? "success" : it.value === "moderate" ? "warning" : "info"} size="sm">{it.value}</Badge>
              ) : (
                <span style={{ fontSize: 15, fontWeight: 700, color: it.highlight ? T.green600 : T.gray800 }}>{it.value}</span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   OVERVIEW + SIDEBAR
   ═══════════════════════════════════════════════════ */
const OverviewSection = ({ d, mob }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  return (
    <AnimatedSection id="overview" bg={T.white} mob={mob}>
      <Container>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "5fr 3fr", gap: mob ? 48 : 64, alignItems: "start" }}>
          {/* Left */}
          <div>
            <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px", lineHeight: 1.15 }}>
              About This Destination
            </h2>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 32 }} />

            {d.overview && (
              <div style={{ background: T.green50, borderLeft: `4px solid ${T.green500}`, borderRadius: `0 ${T.r.md} ${T.r.md} 0`, padding: mob ? 20 : 28, marginBottom: 32 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: T.green800, lineHeight: 1.75, fontStyle: "italic" }}>{d.overview}</p>
              </div>
            )}

            {desc && (
              <div style={{ fontSize: 16, lineHeight: 1.9, color: T.gray600 }}>
                {desc.split("\n\n").filter(Boolean).map((p, i) => (
                  <p key={i} style={{ margin: i > 0 ? "22px 0 0" : 0 }}>{p}</p>
                ))}
              </div>
            )}

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
              {d.isFamilyFriendly && <Badge variant="success" size="lg" icon="👨‍👩‍👧‍👦">Family Friendly</Badge>}
              {d.isEcoFriendly && <Badge variant="primary" size="lg" icon="🌿">Eco-Friendly</Badge>}
              {d.minAge && <Badge variant="info" size="lg" icon="📋">Min Age: {d.minAge}+</Badge>}
            </div>
          </div>

          {/* Right — Sidebar */}
          {!mob && <SidebarCard d={d} />}
        </div>
        {mob && <div style={{ marginTop: 40 }}><SidebarCard d={d} /></div>}
      </Container>
    </AnimatedSection>
  );
};

const SidebarCard = ({ d }) => (
  <div style={{ position: "sticky", top: 100, borderRadius: T.r.lg, overflow: "hidden", border: `2px solid ${T.green500}`, boxShadow: T.shadow.lg }}>
    {/* Header */}
    <div style={{ background: `linear-gradient(135deg, ${T.green600}, ${T.green700})`, padding: "28px 24px", textAlign: "center" }}>
      <p style={{ margin: "0 0 4px", fontSize: 14, color: "rgba(255,255,255,.75)", fontWeight: 500 }}>Starting from</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.white, fontFamily: T.sans }}>{d.entranceFee || "Contact for Price"}</p>
    </div>

    <div style={{ padding: 24, background: T.white }}>
      {/* Buttons */}
      <button style={{ width: "100%", padding: "16px", background: T.green600, color: T.white, border: "none", borderRadius: T.r.md, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: T.sans, marginBottom: 12, transition: "background .2s" }}
        onMouseEnter={e => e.currentTarget.style.background = T.green700}
        onMouseLeave={e => e.currentTarget.style.background = T.green600}
      >
        Book Now
      </button>
      <button style={{ width: "100%", padding: "14px", background: T.white, color: T.green700, border: `2px solid ${T.green500}`, borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans, transition: "background .2s" }}
        onMouseEnter={e => e.currentTarget.style.background = T.green50}
        onMouseLeave={e => e.currentTarget.style.background = T.white}
      >
        Contact Us
      </button>

      <hr style={{ border: "none", height: 1, background: T.gray200, margin: "24px 0" }} />

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { icon: "🕐", label: "Operating Hours", value: d.operatingHours },
          { icon: "🏙️", label: "Nearest City", value: d.nearestCity },
          { icon: "✈️", label: "Nearest Airport", value: d.nearestAirport },
          { icon: "⛰️", label: "Altitude", value: d.altitudeMeters ? `${d.altitudeMeters.toLocaleString()}m` : null },
        ].filter(x => x.value).map((x, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <IconCircle icon={x.icon} size={42} bg={T.green50} />
            <div>
              <p style={{ margin: 0, fontSize: 12, color: T.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{x.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: T.gray800, fontWeight: 600 }}>{x.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   HIGHLIGHTS
   ═══════════════════════════════════════════════════ */
const Highlights = ({ d, mob }) => {
  const list = d.highlights || [];
  if (!list.length) return null;

  return (
    <AnimatedSection id="highlights" bg={T.gray50} mob={mob}>
      <Container>
        <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Highlights</h2>
        <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 0 8px", lineHeight: 1.6, maxWidth: 560 }}>What makes {d.name} extraordinary</p>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 40 }} />

        <div className="dd-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 24 }}>
          {list.map((h, i) => (
            <div key={i} className="dd-lift" style={{ background: T.white, borderRadius: T.r.lg, padding: mob ? 24 : 32, border: `1px solid ${T.gray200}`, display: "flex", alignItems: "flex-start", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green500}, ${T.green600})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontWeight: 800, fontSize: 20, flexShrink: 0, boxShadow: `0 4px 14px ${T.green500}44` }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 16, color: T.gray700, lineHeight: 1.65, fontWeight: 500 }}>{h}</p>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   ACTIVITIES
   ═══════════════════════════════════════════════════ */
const Activities = ({ d, mob }) => {
  const list = d.activities || [];
  if (!list.length) return null;

  const icons = { "Game drives": "🚙", "Hot air balloon safari": "🎈", "Bush walks": "🚶", "Cultural village visits": "🏘️", "Bird watching": "🦅", "Photography safaris": "📷", "Night game drives": "🌙", "Bush breakfast": "🍳" };

  return (
    <AnimatedSection id="activities" bg={T.white} mob={mob}>
      <Container>
        <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Things To Do</h2>
        <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 0 8px", lineHeight: 1.6 }}>Experiences awaiting you</p>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 40 }} />

        <div className="dd-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 20 }}>
          {list.map((act, i) => (
            <div key={i} className="dd-lift dd-wiggle" style={{ background: T.gray50, borderRadius: T.r.lg, padding: 28, textAlign: "center", border: `1px solid ${T.gray200}`, cursor: "default" }}>
              <div className="dd-float" style={{ width: 72, height: 72, borderRadius: "50%", background: T.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 18px", border: `2px solid ${T.green200}` }}>
                {icons[act] || "✨"}
              </div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.gray800, lineHeight: 1.35 }}>{act}</h4>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE
   ═══════════════════════════════════════════════════ */
const WildlifeSection = ({ d, mob }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;

  const ico = { Lion: "🦁", Leopard: "🐆", Cheetah: "🐆", "African Elephant": "🐘", Elephant: "🐘", "Cape Buffalo": "🐃", Wildebeest: "🦬", Zebra: "🦓", Hippopotamus: "🦛", "Nile Crocodile": "🐊", Giraffe: "🦒", Hyena: "🐺", "African Wild Dog": "🐕", Rhinoceros: "🦏" };

  return (
    <AnimatedSection id="wildlife" bg={T.gray50} mob={mob}>
      <Container>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Wildlife</h2>
          <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 auto", lineHeight: 1.6, maxWidth: 520 }}>Incredible species you may encounter at {d.name}</p>
          <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, margin: "16px auto 0" }} />
        </div>

        <div className="dd-stagger" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {list.map((a, i) => (
            <div key={i} className="dd-lift" style={{ display: "flex", alignItems: "center", gap: 12, background: T.white, padding: "16px 24px", borderRadius: T.r.full, border: `1px solid ${T.gray200}`, cursor: "default" }}>
              <span style={{ fontSize: 28 }}>{ico[a] || "🦌"}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.gray700 }}>{a}</span>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY
   ═══════════════════════════════════════════════════ */
const GallerySection = ({ d, mob }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });

  const gallery = d.gallery || [];
  const imgs = gallery.length ? gallery.map(g => g.imageUrl) : d.images || [];
  if (!imgs.length) return null;

  const closeLb = () => setLb({ ...lb, open: false });
  const prev = (e) => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length })); };
  const next = (e) => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length })); };

  return (
    <AnimatedSection id="gallery" bg={T.white} mob={mob}>
      <Container>
        <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Photo Gallery</h2>
        <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 0 8px", lineHeight: 1.6 }}>Stunning visuals from {d.name}</p>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 40 }} />

        <div className="dd-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : imgs.length <= 4 ? "repeat(4,1fr)" : "repeat(4,1fr)", gap: 16 }}>
          {imgs.slice(0, 8).map((img, i) => (
            <div key={i} className="dd-imgZoom dd-lift" onClick={() => setLb({ open: true, idx: i })} style={{ position: "relative", paddingBottom: i === 0 && !mob && imgs.length > 4 ? "100%" : "75%", gridColumn: i === 0 && !mob && imgs.length > 4 ? "span 2" : "span 1", gridRow: i === 0 && !mob && imgs.length > 4 ? "span 2" : "span 1", borderRadius: T.r.md, overflow: "hidden", cursor: "pointer" }}>
              <img src={img} alt={`${d.name} ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.25), transparent 50%)", opacity: 0, transition: "opacity .3s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,.9)", borderRadius: T.r.full, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: T.gray700 }}>
                  View ↗
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lb.open && (
          <div onClick={closeLb} className="dd-fadeIn" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <button onClick={closeLb} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.1)", border: "none", color: T.white, width: 52, height: 52, borderRadius: "50%", fontSize: 26, cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
            >✕</button>

            <img src={imgs[lb.idx]} alt="" className="dd-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: T.r.md }} />

            {imgs.length > 1 && (
              <>
                <button onClick={prev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.12)", border: "none", color: T.white, width: 56, height: 56, borderRadius: "50%", fontSize: 24, cursor: "pointer", transition: "background .2s", backdropFilter: "blur(4px)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                >←</button>
                <button onClick={next} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.12)", border: "none", color: T.white, width: 56, height: 56, borderRadius: "50%", fontSize: 24, cursor: "pointer", transition: "background .2s", backdropFilter: "blur(4px)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                >→</button>
              </>
            )}

            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 500 }}>
              {lb.idx + 1} / {imgs.length}
            </div>
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   LOCATION & MAP
   ═══════════════════════════════════════════════════ */
const LocationSection = ({ d, mob }) => {
  const hasMap = d.latitude && d.longitude;
  const hasInfo = d.region || d.nearestCity || d.nearestAirport || d.gettingThere;
  if (!hasMap && !hasInfo) return null;

  return (
    <AnimatedSection id="location" bg={T.gray50} mob={mob}>
      <Container>
        <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Location & Access</h2>
        <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 0 8px", lineHeight: 1.6 }}>How to get there</p>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 40 }} />

        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 32 }}>
          {hasMap && (
            <div style={{ borderRadius: T.r.lg, overflow: "hidden", border: `1px solid ${T.gray200}`, height: mob ? 300 : 420, boxShadow: T.shadow.md }}>
              <iframe title="Map" src={`https://www.google.com/maps?q=${d.latitude},${d.longitude}&z=12&output=embed`} style={{ width: "100%", height: "100%", border: "none" }} loading="lazy" allowFullScreen />
            </div>
          )}

          <div className="dd-stagger" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "📍", label: "Region", value: d.region, bg: T.green50 },
              { icon: "🏙️", label: "Nearest City", value: d.nearestCity, bg: T.green50 },
              { icon: "✈️", label: "Nearest Airport", value: d.nearestAirport, sub: d.distanceFromAirportKm ? `${d.distanceFromAirportKm} km away` : null, bg: T.blueLight },
              { icon: "⛰️", label: "Altitude", value: d.altitudeMeters ? `${d.altitudeMeters.toLocaleString()}m above sea level` : null, bg: T.amberLight },
            ].filter(x => x.value).map((x, i) => (
              <div key={i} className="dd-lift" style={{ background: T.white, borderRadius: T.r.lg, padding: 24, border: `1px solid ${T.gray200}`, display: "flex", alignItems: "center", gap: 20 }}>
                <IconCircle icon={x.icon} size={56} bg={x.bg} />
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: T.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{x.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 18, color: T.gray800, fontWeight: 700 }}>{x.value}</p>
                  {x.sub && <p style={{ margin: "2px 0 0", fontSize: 13, color: T.gray500 }}>{x.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   PRACTICAL INFO
   ═══════════════════════════════════════════════════ */
const PracticalInfo = ({ d, mob }) => {
  const items = [
    { icon: "🎫", label: "Entrance Fee", value: d.entranceFee },
    { icon: "🕐", label: "Operating Hours", value: d.operatingHours },
    { icon: "📅", label: "Best Time to Visit", value: d.bestTimeToVisit },
    { icon: "👥", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize} – ${d.maxGroupSize} people` : null },
    { icon: "👶", label: "Minimum Age", value: d.minAge ? `${d.minAge} years` : null },
    { icon: "💪", label: "Fitness Level", value: d.fitnessLevel },
  ].filter(x => x.value);

  const cards = [
    { icon: "📋", title: "What to Expect", text: d.whatToExpect, bg: T.green50, accent: T.green600 },
    { icon: "💡", title: "Local Tips", text: d.localTips, bg: T.amberLight, accent: "#B45309" },
    { icon: "⚠️", title: "Safety Information", text: d.safetyInfo, bg: T.redLight, accent: T.red, span: true },
  ].filter(x => x.text);

  if (!items.length && !cards.length) return null;

  return (
    <AnimatedSection id="practical" bg={T.white} mob={mob}>
      <Container>
        <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.gray900, margin: "0 0 12px" }}>Practical Information</h2>
        <p style={{ fontSize: mob ? 16 : 18, color: T.gray500, margin: "0 0 8px", lineHeight: 1.6 }}>Everything you need to plan your visit</p>
        <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${T.green400}, ${T.green600})`, marginBottom: 40 }} />

        {items.length > 0 && (
          <div className="dd-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 20, marginBottom: cards.length ? 40 : 0 }}>
            {items.map((it, i) => (
              <div key={i} className="dd-lift" style={{ background: T.gray50, borderRadius: T.r.lg, padding: 24, border: `1px solid ${T.gray200}`, display: "flex", alignItems: "center", gap: 18 }}>
                <span style={{ fontSize: 34 }}>{it.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: T.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{it.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 16, color: T.gray800, fontWeight: 600 }}>{it.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className="dd-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)", gap: 24 }}>
            {cards.map((c, i) => (
              <div key={i} style={{ borderRadius: T.r.lg, overflow: "hidden", border: `1px solid ${T.gray200}`, gridColumn: c.span && !mob ? "span 2" : "span 1", boxShadow: T.shadow.sm }}>
                <div style={{ padding: "18px 24px", background: c.bg, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${c.accent}22` }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: c.accent }}>{c.title}</h4>
                </div>
                <div style={{ padding: 24, background: T.white }}>
                  <p style={{ margin: 0, fontSize: 15, color: T.gray600, lineHeight: 1.75 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
};

/* ═══════════════════════════════════════════════════
   CTA FOOTER
   ═══════════════════════════════════════════════════ */
const CTAFooter = ({ d, mob }) => (
  <section style={{ background: `linear-gradient(135deg, ${T.green700} 0%, ${T.green900} 100%)`, padding: mob ? "80px 0" : "120px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
    {/* Pattern */}
    <div style={{ position: "absolute", inset: 0, opacity: .06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

    {/* Floating decorative circles */}
    <div className="dd-float" style={{ position: "absolute", top: "15%", left: "8%", width: 120, height: 120, borderRadius: "50%", border: `2px solid rgba(255,255,255,.08)`, animationDelay: "0s" }} />
    <div className="dd-float" style={{ position: "absolute", bottom: "20%", right: "10%", width: 80, height: 80, borderRadius: "50%", border: `2px solid rgba(255,255,255,.06)`, animationDelay: "1.5s" }} />

    <Container style={{ position: "relative" }}>
      <div className="dd-float" style={{ display: "inline-block", marginBottom: 24 }}>
        <span style={{ fontSize: 56 }}>🌍</span>
      </div>
      <h2 style={{ fontFamily: T.serif, fontSize: mob ? 32 : 52, fontWeight: 800, color: T.white, margin: "0 0 20px", lineHeight: 1.15 }}>
        Ready to Experience<br />{d.name}?
      </h2>
      <p style={{ fontSize: mob ? 17 : 20, color: "rgba(255,255,255,.85)", maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.65 }}>
        Start planning your unforgettable adventure today. Create memories that will last a lifetime.
      </p>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
        <button style={{ padding: "18px 40px", background: T.white, color: T.green800, border: "none", borderRadius: T.r.md, fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: T.sans, transition: "transform .2s, box-shadow .2s", boxShadow: T.shadow.lg }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = T.shadow.xxl; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.shadow.lg; }}
        >
          📅 Book This Experience
        </button>
        {d.countrySlug && (
          <Link to={`/countries/${d.countrySlug}`} style={{ padding: "18px 40px", background: "transparent", color: T.white, border: "2px solid rgba(255,255,255,.35)", borderRadius: T.r.md, fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: T.sans, textDecoration: "none", transition: "background .2s, border-color .2s", display: "inline-flex", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,.35)"; }}
          >
            Explore {d.countryName}
          </Link>
        )}
      </div>

      {/* Trust Row */}
      <div style={{ display: "flex", justifyContent: "center", gap: mob ? 28 : 56, flexWrap: "wrap" }}>
        {[
          { icon: "🏆", text: "Top Rated" },
          { icon: "✅", text: "Verified" },
          { icon: "🔒", text: "Secure" },
          { icon: "💬", text: "24 / 7 Support" },
        ].map((t, i) => (
          <div key={i} style={{ color: "rgba(255,255,255,.75)", textAlign: "center" }}>
            <div className="dd-wiggle" style={{ fontSize: 30, marginBottom: 8, cursor: "default" }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".3px" }}>{t.text}</div>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

/* ═══════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate }) => (
  <div style={{ minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: T.sans, padding: 48, textAlign: "center", background: T.gray50 }}>
    <div className="dd-float" style={{ width: 150, height: 150, borderRadius: "50%", background: T.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 36, border: `3px solid ${T.green200}` }}>
      🗺️
    </div>
    <h2 style={{ fontFamily: T.serif, fontSize: 38, fontWeight: 700, color: T.gray800, margin: "0 0 16px" }}>Destination Not Found</h2>
    <p style={{ fontSize: 18, color: T.gray500, maxWidth: 480, margin: "0 0 36px", lineHeight: 1.65 }}>
      {error || "The destination you're looking for doesn't exist or may have been removed."}
    </p>
    <div style={{ display: "flex", gap: 14 }}>
      <button onClick={() => navigate(-1)} style={{ padding: "14px 32px", background: T.white, color: T.gray700, border: `2px solid ${T.gray300}`, borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>Go Back</button>
      <button onClick={() => navigate("/destinations")} style={{ padding: "14px 32px", background: T.green600, color: T.white, border: "none", borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>Browse Destinations</button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   API FETCH
   ═══════════════════════════════════════════════════ */
const fetchDestination = async (slug) => {
  const res = await fetch(`/api/destinations/${slug}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch destination");
  return json.data;
};

/* ═══════════════════════════════════════════════════
   MAIN — DestinationDetails
   ═══════════════════════════════════════════════════ */
const DestinationDetails = () => {
  const { slug, id } = useParams();
  const identifier = slug || id;
  const navigate = useNavigate();
  const { mob } = useWindowSize();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identifier) return;
    setLoading(true);
    setError(null);
    fetchDestination(identifier)
      .then(setDestination)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [identifier]);

  useEffect(() => { window.scrollTo(0, 0); }, [identifier]);

  /* Loading */
  if (loading) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <AnimationStyles />
        <FullPageSkeleton mob={mob} />
      </div>
    );
  }

  /* Error */
  if (error || !destination) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <AnimationStyles />
        <ErrorState error={error} navigate={navigate} />
      </div>
    );
  }

  /* Success */
  const d = destination;

  return (
    <div style={{ fontFamily: T.sans, color: T.gray800, background: T.white }}>
      <AnimationStyles />

      <Hero d={d} mob={mob} />
      <QuickInfoBar d={d} mob={mob} />
      <OverviewSection d={d} mob={mob} />
      <Highlights d={d} mob={mob} />
      <Activities d={d} mob={mob} />
      <WildlifeSection d={d} mob={mob} />
      <GallerySection d={d} mob={mob} />
      <LocationSection d={d} mob={mob} />
      <PracticalInfo d={d} mob={mob} />
      <CTAFooter d={d} mob={mob} />
    </div>
  );
};

export default DestinationDetails;