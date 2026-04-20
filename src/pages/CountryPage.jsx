import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchCountryPageData } from "../data/countries";

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
  g50: "#F9FAFB",
  g100: "#F3F4F6",
  g200: "#E5E7EB",
  g300: "#D1D5DB",
  g400: "#9CA3AF",
  g500: "#6B7280",
  g600: "#4B5563",
  g700: "#374151",
  g800: "#1F2937",
  g900: "#111827",

  amber: "#F59E0B",
  amberLt: "#FEF3C7",
  red: "#EF4444",
  redLt: "#FEF2F2",
  blue: "#3B82F6",
  blueLt: "#DBEAFE",
  purple: "#7C3AED",
  purpleLt: "#F5F3FF",

  sans: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'Playfair Display',Georgia,serif",
  max: "1280px",

  r: {
    xs: "6px", sm: "10px", md: "14px", lg: "20px", xl: "28px", full: "9999px",
  },
  sh: {
    xs: "0 1px 2px rgba(0,0,0,.05)",
    sm: "0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06)",
    md: "0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)",
    xl: "0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)",
    xxl: "0 25px 50px -12px rgba(0,0,0,.25)",
  },
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES + ANIMATIONS
   ═══════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    ::selection{background:${T.green100};color:${T.green900}}

    @keyframes cp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes cp-fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cp-fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes cp-scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
    @keyframes cp-slideR{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
    @keyframes cp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes cp-heroZoom{from{transform:scale(1.06)}to{transform:scale(1)}}
    @keyframes cp-borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes cp-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(3deg)}75%{transform:rotate(-3deg)}}
    @keyframes cp-glow{0%,100%{box-shadow:0 0 6px ${T.green400}33}50%{box-shadow:0 0 20px ${T.green400}55}}

    .cp-skel{background:linear-gradient(90deg,${T.g200} 25%,${T.g100} 50%,${T.g200} 75%);background-size:200% 100%;animation:cp-shimmer 1.4s ease-in-out infinite;border-radius:${T.r.sm}}
    .cp-fadeUp{animation:cp-fadeUp .7s cubic-bezier(.22,1,.36,1) forwards}
    .cp-fadeIn{animation:cp-fadeIn .5s ease forwards}
    .cp-scaleIn{animation:cp-scaleIn .4s ease forwards}
    .cp-float{animation:cp-float 3s ease-in-out infinite}
    .cp-wiggle:hover{animation:cp-wiggle .4s ease}

    .cp-lift{transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease}
    .cp-lift:hover{transform:translateY(-6px);box-shadow:${T.sh.xl}}

    .cp-imgZoom{overflow:hidden}
    .cp-imgZoom img{transition:transform .5s cubic-bezier(.22,1,.36,1)}
    .cp-imgZoom:hover img{transform:scale(1.08)}

    .cp-stagger>*{opacity:0;animation:cp-fadeUp .6s cubic-bezier(.22,1,.36,1) forwards}
    ${Array.from({length:12},(_,i)=>`.cp-stagger>*:nth-child(${i+1}){animation-delay:${i*80}ms}`).join("\n")}

    .cp-nav-scroll{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
    .cp-nav-scroll::-webkit-scrollbar{display:none}

    ::-webkit-scrollbar{width:8px;height:8px}
    ::-webkit-scrollbar-track{background:${T.g100}}
    ::-webkit-scrollbar-thumb{background:${T.green300};border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:${T.green400}}
  `}</style>
);

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */
const useScreen = () => {
  const [s, set] = useState({ w: window.innerWidth });
  useEffect(() => {
    const fn = () => set({ w: window.innerWidth });
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { mob: s.w < 768, tab: s.w >= 768 && s.w < 1024 };
};

const useInView = (threshold = 0.12) => {
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
  }, []);
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

const splitP = (text) => (text ? text.split(/\n\n|\n/).filter(Boolean) : []);

/* ═══════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════ */
const Sk = ({ w = "100%", h = "20px", r = T.r.sm, style = {} }) => (
  <div className="cp-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const SkeletonPage = ({ mob }) => (
  <div style={{ background: T.white, minHeight: "100vh", fontFamily: T.sans }}>
    {/* Hero skeleton */}
    <div style={{ position: "relative", height: mob ? "65vh" : "82vh" }}>
      <Sk w="100%" h="100%" r="0" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mob ? "32px 20px" : "64px 48px", background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)" }}>
        <div style={{ maxWidth: T.max, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <Sk w="56px" h="40px" r={T.r.sm} style={{ opacity: .5 }} />
            <Sk w={mob ? "70%" : "380px"} h={mob ? "36px" : "56px"} style={{ opacity: .5 }} />
          </div>
          <Sk w={mob ? "90%" : "450px"} h="22px" style={{ marginBottom: 28, opacity: .5 }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
            {[100, 110, 120].map((x, i) => (
              <div key={i}>
                <Sk w="60px" h="12px" style={{ marginBottom: 6, opacity: .4 }} />
                <Sk w={`${x}px`} h="20px" style={{ opacity: .5 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Sk w="180px" h="52px" r={T.r.md} style={{ opacity: .4 }} />
            <Sk w="140px" h="52px" r={T.r.md} style={{ opacity: .4 }} />
          </div>
        </div>
      </div>
    </div>

    {/* Nav skeleton */}
    <div style={{ borderBottom: `1px solid ${T.g200}`, padding: "16px 24px" }}>
      <div style={{ maxWidth: T.max, margin: "0 auto", display: "flex", gap: 12 }}>
        {[80, 110, 90, 100, 85, 95, 70].map((w, i) => <Sk key={i} w={`${w}px`} h="36px" r={T.r.full} />)}
      </div>
    </div>

    {/* Quick Facts skeleton */}
    <div style={{ borderBottom: `1px solid ${T.g200}`, padding: mob ? "28px 20px" : "44px 24px" }}>
      <div style={{ maxWidth: T.max, margin: "0 auto", display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mob ? 14 : 24 }}>
        {Array.from({ length: mob ? 4 : 8 }).map((_, i) => (
          <div key={i} style={{ padding: mob ? 16 : 24, background: T.g50, borderRadius: T.r.md, borderLeft: `4px solid ${T.g200}` }}>
            <Sk w="36px" h="36px" style={{ marginBottom: 12 }} />
            <Sk w="50%" h="11px" style={{ marginBottom: 6 }} />
            <Sk w="75%" h="18px" />
          </div>
        ))}
      </div>
    </div>

    {/* Section skeletons */}
    {[T.g50, T.white, T.g50].map((bg, idx) => (
      <div key={idx} style={{ background: bg, padding: mob ? "48px 20px" : "80px 24px" }}>
        <div style={{ maxWidth: T.max, margin: "0 auto" }}>
          <Sk w="220px" h="34px" style={{ marginBottom: 12 }} />
          <Sk w={mob ? "100%" : "440px"} h="18px" style={{ marginBottom: 8 }} />
          <div style={{ width: 60, height: 4, borderRadius: 2, background: T.g200, marginBottom: 40 }} />
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : idx === 1 ? "repeat(3,1fr)" : "1fr 1fr", gap: 24 }}>
            {Array.from({ length: idx === 1 ? 3 : 2 }).map((_, i) => (
              <div key={i} style={{ background: idx === 0 ? T.white : T.g50, borderRadius: T.r.lg, border: `1px solid ${T.g200}`, overflow: "hidden" }}>
                <Sk w="100%" h="180px" r="0" />
                <div style={{ padding: 24 }}>
                  <Sk w="65%" h="20px" style={{ marginBottom: 12 }} />
                  <Sk w="100%" h="14px" style={{ marginBottom: 8 }} />
                  <Sk w="85%" h="14px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════ */
const Box = ({ children, narrow, style = {} }) => (
  <div style={{ maxWidth: narrow || T.max, margin: "0 auto", padding: "0 24px", width: "100%", ...style }}>{children}</div>
);

const Badge = ({ children, variant = "primary", size = "md", icon, style = {} }) => {
  const v = {
    primary: { bg: T.green100, c: T.green800 },
    accent: { bg: T.green200, c: T.green900 },
    white: { bg: "rgba(255,255,255,.18)", c: T.white, border: "1px solid rgba(255,255,255,.35)" },
    dark: { bg: "rgba(0,0,0,.55)", c: T.white },
    gray: { bg: T.g100, c: T.g700 },
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

const IconCircle = ({ icon, size = 48, bg = T.green50, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * .48, flexShrink: 0, ...style }}>
    {icon}
  </div>
);

const GreenBar = ({ style = {} }) => (
  <div style={{ width: 60, height: 4, borderRadius: 2, background: `linear-gradient(90deg,${T.green400},${T.green600})`, ...style }} />
);

const Section = ({ children, id, bg = T.white, mob }) => {
  const [ref, vis] = useInView();
  return (
    <section ref={ref} id={id} style={{ background: bg, padding: mob ? "48px 0" : "70px 0", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)", transition: "opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)" }}>
      <Box>{children}</Box>
    </section>
  );
};

const Heading = ({ children, sub, mob }) => (
  <div style={{ marginBottom: mob ? 28 : 44 }}>
    <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.g900, margin: "0 0 10px", lineHeight: 1.15 }}>{children}</h2>
    {sub && <p style={{ fontSize: mob ? 16 : 18, color: T.g500, margin: "0 0 8px", lineHeight: 1.6, maxWidth: 600 }}>{sub}</p>}
    <GreenBar style={{ marginTop: 12 }} />
  </div>
);

const Card = ({ children, hover = true, style = {}, className = "" }) => (
  <div className={`${hover ? "cp-lift" : ""} ${className}`} style={{ background: T.white, borderRadius: T.r.lg, border: `1px solid ${T.g200}`, overflow: "hidden", ...style }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════ */
const Hero = ({ c, mob }) => (
  <section style={{ position: "relative", height: mob ? "75vh" : "88vh", minHeight: 520, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, animation: "cp-heroZoom 8s ease forwards" }}>
      <img src={c.heroImage || c.flagUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.35) 50%,rgba(0,0,0,.82) 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${T.green900}30,transparent 70%)` }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg,${T.green400},${T.green600},${T.green400})`, backgroundSize: "200% 100%", animation: "cp-borderFlow 3s ease infinite" }} />

    <Box style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: mob ? 44 : 72 }}>
      <div style={{ maxWidth: 820 }}>
        {c.region && (
          <div className="cp-fadeUp" style={{ animationDelay: ".1s", opacity: 0, marginBottom: 16 }}>
            <Badge variant="white" size="lg">{c.region}</Badge>
          </div>
        )}
        <div className="cp-fadeUp" style={{ display: "flex", alignItems: "center", gap: mob ? 14 : 20, marginBottom: 18, animationDelay: ".2s", opacity: 0 }}>
          {c.flagUrl && <img src={c.flagUrl} alt="" style={{ width: mob ? 52 : 72, height: mob ? 37 : 52, borderRadius: T.r.sm, boxShadow: T.sh.lg, objectFit: "cover" }} />}
          <h1 style={{ fontFamily: T.serif, fontSize: mob ? 36 : 62, fontWeight: 800, color: T.white, margin: 0, lineHeight: 1.08, textShadow: "0 4px 32px rgba(0,0,0,.5)" }}>{c.name}</h1>
        </div>
        {c.tagline && (
          <p className="cp-fadeUp" style={{ fontSize: mob ? 17 : 23, color: "rgba(255,255,255,.88)", margin: "0 0 28px", lineHeight: 1.55, fontWeight: 500, maxWidth: 600, animationDelay: ".3s", opacity: 0 }}>{c.tagline}</p>
        )}
        <div className="cp-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: mob ? 16 : 32, marginBottom: 32, animationDelay: ".4s", opacity: 0 }}>
          {c.capital && <HeroStat label="Capital" value={c.capital} />}
          {c.population && <HeroStat label="Population" value={fmt(c.population)} />}
          {c.destinationCount > 0 && <HeroStat label="Destinations" value={`${c.destinationCount}+ Places`} />}
        </div>
        <div className="cp-fadeUp" style={{ display: "flex", flexWrap: "wrap", gap: 12, animationDelay: ".5s", opacity: 0 }}>
          <Link to={`/countries/${c.slug}/destinations`} style={{ padding: "16px 36px", background: T.green600, color: T.white, border: "none", borderRadius: T.r.md, fontSize: 16, fontWeight: 700, textDecoration: "none", fontFamily: T.sans, transition: "background .2s,transform .2s", display: "inline-flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.green700; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.green600; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Explore Destinations
          </Link>
          <button style={{ padding: "16px 36px", background: "rgba(255,255,255,.1)", color: T.white, border: "2px solid rgba(255,255,255,.3)", borderRadius: T.r.md, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: T.sans, backdropFilter: "blur(6px)", transition: "background .2s" }}
            onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
          >
            Learn More
          </button>
        </div>
      </div>
    </Box>
  </section>
);

const HeroStat = ({ label, value }) => (
  <div style={{ color: "rgba(255,255,255,.9)" }}>
    <span style={{ fontSize: 12, opacity: .7, display: "block", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: 19, fontWeight: 700 }}>{value}</span>
  </div>
);

/* ═══════════════════════════════════════════════════
   SECTION NAV (sticky)
   ═══════════════════════════════════════════════════ */
const SectionNav = ({ sections, active, onClick, mob }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && active) {
      const el = ref.current.querySelector(`[data-s="${active}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [active]);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: T.white, borderBottom: `1px solid ${T.g200}`, boxShadow: T.sh.sm }}>
      <Box>
        <div ref={ref} className="cp-nav-scroll" style={{ display: "flex", gap: mob ? 6 : 4, padding: "14px 0" }}>
          {sections.map(s => {
            const isActive = active === s.id;
            return (
              <button key={s.id} data-s={s.id} onClick={() => onClick(s.id)}
                style={{ padding: mob ? "10px 16px" : "10px 22px", background: isActive ? T.green50 : "transparent", color: isActive ? T.green700 : T.g500, border: isActive ? `1.5px solid ${T.green200}` : "1.5px solid transparent", borderRadius: T.r.full, fontSize: 14, fontWeight: 600, fontFamily: T.sans, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.g50; e.currentTarget.style.color = T.g700; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.g500; } }}
              >
                {mob ? s.short : s.label}
              </button>
            );
          })}
        </div>
      </Box>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK FACTS
   ═══════════════════════════════════════════════════ */
const QuickFacts = ({ c, mob }) => {
  const facts = [
    { icon: "🏛️", label: "Capital", value: c.capital },
    { icon: "👥", label: "Population", value: c.population ? fmt(c.population) : null },
    { icon: "🌍", label: "Area", value: c.area ? `${fmt(c.area)} km²` : null },
    { icon: "💰", label: "Currency", value: c.currency },
    { icon: "🗣️", label: "Language", value: Array.isArray(c.languages) ? (typeof c.languages[0] === "string" ? c.languages[0] : c.languages[0]?.name) : c.languages },
    { icon: "🕐", label: "Timezone", value: c.timezone },
    { icon: "📞", label: "Calling Code", value: c.callingCode },
    { icon: "🚗", label: "Driving Side", value: c.drivingSide },
  ].filter(f => f.value);

  if (!facts.length) return null;

  return (
    <section style={{ background: T.white, borderBottom: `1px solid ${T.g200}` }}>
      <Box style={{ padding: mob ? "28px 24px" : "44px 24px" }}>
        <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : `repeat(${Math.min(facts.length, 4)},1fr)`, gap: mob ? 14 : 20 }}>
          {facts.slice(0, 8).map((f, i) => (
            <div key={i} style={{ padding: mob ? 18 : 24, background: T.g50, borderRadius: T.r.md, borderLeft: `4px solid ${T.green500}`, transition: "box-shadow .2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = T.sh.md}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <span className="cp-wiggle" style={{ fontSize: 28, display: "block", marginBottom: 10, cursor: "default" }}>{f.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.g400, textTransform: "uppercase", letterSpacing: ".7px", display: "block", marginBottom: 4 }}>{f.label}</span>
              <span style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: T.g800 }}>{f.value}</span>
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
const Overview = ({ c, mob }) => {
  const hasContent = c.description || c.fullDescription || c.highlights?.length;
  if (!hasContent) return null;

  return (
    <Section id="overview" bg={T.g50} mob={mob}>
      <Heading sub={`Discover what makes ${c.name} a remarkable destination`} mob={mob}>Overview</Heading>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 32 : 48, alignItems: "start" }}>
        <div>
          {(c.fullDescription || c.description) && (
            <div style={{ fontSize: 16, lineHeight: 1.85, color: T.g600 }}>
              {splitP(c.fullDescription || c.description).map((p, i) => (
                <p key={i} style={{ margin: i > 0 ? "22px 0 0" : 0 }}>{p}</p>
              ))}
            </div>
          )}
        </div>
        {c.highlights?.length > 0 && (
          <Card hover={false} style={{ padding: mob ? 24 : 32 }}>
            <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.g800, margin: "0 0 24px", display: "flex", alignItems: "center", gap: 12 }}>
              <IconCircle icon="✨" size={42} bg={T.green100} />
              Highlights
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }} className="cp-stagger">
              {c.highlights.map((h, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < c.highlights.length - 1 ? `1px solid ${T.g100}` : "none" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${T.green500},${T.green600})`, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, boxShadow: `0 2px 8px ${T.green500}44` }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 15, color: T.g700, lineHeight: 1.55 }}>{h}</span>
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
const Geography = ({ c, mob }) => {
  const geo = c.geography || {};
  const hasContent = c.area || Object.keys(geo).length || c.climate;
  if (!hasContent) return null;

  const geoFacts = [
    { label: "Terrain", value: geo.terrain },
    { label: "Highest Point", value: geo.highestPoint },
    { label: "Major Rivers", value: Array.isArray(geo.majorRivers) ? geo.majorRivers.join(", ") : geo.majorRivers },
    { label: "Natural Resources", value: Array.isArray(geo.naturalResources) ? geo.naturalResources.slice(0, 4).join(", ") : geo.naturalResources },
  ].filter(f => f.value);

  return (
    <Section id="geography" bg={T.white} mob={mob}>
      <Heading sub={`Explore the natural landscapes and weather of ${c.name}`} mob={mob}>Geography & Climate</Heading>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 24 }}>
        {geoFacts.length > 0 && (
          <Card hover={false}>
            <div style={{ padding: "18px 24px", background: T.green50, borderBottom: `1px solid ${T.green100}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏔️</span>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.green800 }}>Geography</h4>
            </div>
            <div style={{ padding: 24 }}>
              {geoFacts.map((f, i) => (
                <div key={i} style={{ padding: "16px 0", borderBottom: i < geoFacts.length - 1 ? `1px solid ${T.g100}` : "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.g400, textTransform: "uppercase", letterSpacing: ".5px", display: "block", marginBottom: 4 }}>{f.label}</span>
                  <span style={{ fontSize: 15, color: T.g800, lineHeight: 1.5 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {c.climate && (
          <Card hover={false}>
            <div style={{ padding: "18px 24px", background: T.green200 + "55", borderBottom: `1px solid ${T.green200}33`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🌤️</span>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.green800 }}>Climate</h4>
            </div>
            <div style={{ padding: 24 }}>
              {typeof c.climate === "string" ? (
                <p style={{ margin: 0, fontSize: 15, color: T.g700, lineHeight: 1.75 }}>{c.climate}</p>
              ) : (
                <>
                  {c.climate.overview && <p style={{ margin: "0 0 16px", fontSize: 15, color: T.g700, lineHeight: 1.75 }}>{c.climate.overview}</p>}
                  {c.climate.bestTime && (
                    <div style={{ padding: 16, background: T.g50, borderRadius: T.r.sm, borderLeft: `3px solid ${T.green500}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.green600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Best Time to Visit</span>
                      <span style={{ fontSize: 15, color: T.g800 }}>{c.climate.bestTime}</span>
                    </div>
                  )}
                </>
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
const People = ({ c, mob }) => {
  const hasContent = c.languages?.length || c.ethnicGroups?.length || c.religions?.length;
  if (!hasContent) return null;

  const groups = [
    { key: "languages", label: "Languages", icon: "🗣️", bg: T.green100, variant: "gray" },
    { key: "ethnicGroups", label: "Ethnic Groups", icon: "👥", bg: T.green200 + "55", variant: "accent" },
    { key: "religions", label: "Religions", icon: "🛕", bg: T.green50, variant: "primary" },
  ].filter(g => c[g.key]?.length > 0);

  return (
    <Section id="people" bg={T.g50} mob={mob}>
      <Heading sub={`Learn about the diverse communities of ${c.name}`} mob={mob}>People & Culture</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : `repeat(${Math.min(groups.length, 3)},1fr)`, gap: 24 }}>
        {groups.map((g, i) => (
          <Card key={i} hover={false} style={{ padding: mob ? 24 : 28 }}>
            <IconCircle icon={g.icon} size={56} bg={g.bg} style={{ marginBottom: 20 }} />
            <h4 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: T.g800 }}>{g.label}</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {c[g.key].slice(0, 8).map((item, j) => (
                <Badge key={j} variant={g.variant} size="sm">
                  {typeof item === "string" ? item : item.name}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   HISTORY & HERITAGE
   ═══════════════════════════════════════════════════ */
const History = ({ c, mob }) => {
  const timeline = c.historicalTimeline || [];
  const unesco = c.unescoSites || [];
  if (!timeline.length && !unesco.length) return null;

  return (
    <Section id="history" bg={T.white} mob={mob}>
      <Heading sub={`Rich history and cultural heritage of ${c.name}`} mob={mob}>History & Heritage</Heading>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 32 }}>
        {timeline.length > 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span>📜</span> Timeline
            </h3>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 5, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom,${T.green300},${T.green100})` }} />
              {timeline.slice(0, 6).map((ev, i) => (
                <div key={i} className="cp-fadeUp" style={{ position: "relative", paddingBottom: 28, animationDelay: `${i * 100}ms`, opacity: 0 }}>
                  <div style={{ position: "absolute", left: -28, top: 4, width: 14, height: 14, borderRadius: "50%", background: T.green500, border: `3px solid ${T.white}`, boxShadow: `0 0 0 3px ${T.green100}` }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: T.green600, display: "block", marginBottom: 4 }}>{ev.year || ev.period}</span>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: T.g800 }}>{ev.title || ev.event}</h4>
                  {ev.description && <p style={{ margin: 0, fontSize: 14, color: T.g600, lineHeight: 1.6 }}>{ev.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {unesco.length > 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span>🏛️</span> UNESCO Heritage Sites
            </h3>
            <div className="cp-stagger" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {unesco.slice(0, 5).map((site, i) => (
                <Card key={i} style={{ padding: 20 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    {site.imageUrl && <img src={site.imageUrl} alt={site.name} style={{ width: 80, height: 80, borderRadius: T.r.sm, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: T.g800 }}>{site.name}</h4>
                      {site.yearInscribed && <Badge variant="primary" size="xs" style={{ marginBottom: 8 }}>Inscribed {site.yearInscribed}</Badge>}
                      {site.description && <p style={{ margin: 0, fontSize: 13, color: T.g600, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{site.description}</p>}
                    </div>
                  </div>
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
const Wildlife = ({ c, mob }) => {
  const w = c.wildlife || {};
  const hasContent = Object.values(w).some(v => Array.isArray(v) && v.length > 0);
  if (!hasContent) return null;

  const cats = [
    { key: "mammals", label: "Mammals", icon: "🦁" },
    { key: "birds", label: "Birds", icon: "🦅" },
    { key: "reptiles", label: "Reptiles", icon: "🐊" },
    { key: "marineLife", label: "Marine Life", icon: "🐋" },
    { key: "endangered", label: "Endangered", icon: "⚠️" },
  ].filter(cat => w[cat.key]?.length > 0);

  return (
    <Section id="wildlife" bg={T.g50} mob={mob}>
      <Heading sub={`Incredible biodiversity of ${c.name}`} mob={mob}>Wildlife & Nature</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)", gap: 24 }}>
        {cats.map((cat, i) => (
          <Card key={i} hover={false}>
            <div style={{ padding: "16px 24px", background: T.green50, borderBottom: `1px solid ${T.green100}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.green800 }}>{cat.label}</h4>
            </div>
            <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {w[cat.key].slice(0, 10).map((a, j) => (
                <Badge key={j} variant="gray" size="sm">{typeof a === "string" ? a : a.name}</Badge>
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
const Cuisine = ({ c, mob }) => {
  const cuisine = c.cuisine || {};
  const dishes = cuisine.dishes || cuisine.traditionalDishes || [];
  const beverages = cuisine.beverages || [];
  if (!dishes.length && !beverages.length) return null;

  return (
    <Section id="cuisine" bg={T.white} mob={mob}>
      <Heading sub={`Authentic flavors of ${c.name}`} mob={mob}>Local Cuisine</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 24 }}>
        {dishes.slice(0, 6).map((dish, i) => (
          <Card key={i} className="cp-imgZoom">
            {dish.imageUrl && (
              <div style={{ height: 180, overflow: "hidden" }}>
                <img src={dish.imageUrl} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>🍽️</span>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: T.g800 }}>{dish.name}</h4>
              </div>
              {dish.description && <p style={{ margin: 0, fontSize: 14, color: T.g600, lineHeight: 1.6 }}>{dish.description}</p>}
              {dish.isVegetarian && <Badge variant="success" size="xs" icon="🌱" style={{ marginTop: 12 }}>Vegetarian</Badge>}
            </div>
          </Card>
        ))}
      </div>
      {beverages.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: T.g800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🍹</span> Traditional Beverages
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {beverages.map((b, i) => (
              <Card key={i} style={{ padding: "14px 22px" }}>
                <span style={{ fontWeight: 600, color: T.g800 }}>{typeof b === "string" ? b : b.name}</span>
              </Card>
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
const TravelEssentials = ({ c, mob }) => {
  const essentials = [
    { icon: "📋", title: "Visa Information", content: c.visaInfo, color: T.green700, bg: T.green50 },
    { icon: "💊", title: "Health & Vaccinations", content: c.healthInfo, color: T.red, bg: T.redLt },
    { icon: "🛡️", title: "Safety & Security", content: c.safety, color: T.blue, bg: T.blueLt },
    { icon: "🔌", title: "Electricity", content: c.electricityInfo, color: T.purple, bg: T.purpleLt },
  ].filter(e => e.content);

  if (!essentials.length) return null;

  return (
    <Section id="travel" bg={T.g50} mob={mob}>
      <Heading sub={`Important info for your trip to ${c.name}`} mob={mob}>Travel Essentials</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)", gap: 24 }}>
        {essentials.map((item, i) => (
          <Card key={i} hover={false}>
            <div style={{ padding: "18px 24px", background: item.bg, borderBottom: `1px solid ${item.color}20`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: item.color }}>{item.title}</h4>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ margin: 0, fontSize: 15, color: T.g700, lineHeight: 1.75 }}>
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
const Festivals = ({ c, mob }) => {
  const fests = c.festivals || [];
  if (!fests.length) return null;

  return (
    <Section id="festivals" bg={T.white} mob={mob}>
      <Heading sub={`Vibrant celebrations in ${c.name}`} mob={mob}>Festivals & Events</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 24 }}>
        {fests.slice(0, 6).map((f, i) => (
          <Card key={i} className="cp-imgZoom">
            {f.imageUrl && (
              <div style={{ height: 180, overflow: "hidden" }}>
                <img src={f.imageUrl} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: T.g800 }}>{f.name}</h4>
                {f.isMajorEvent && <Badge variant="warning" size="xs">Major</Badge>}
              </div>
              {(f.period || f.month) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: T.green600, fontSize: 14, fontWeight: 600 }}>
                  <span>📅</span> {f.period || f.month}
                </div>
              )}
              {f.description && <p style={{ margin: 0, fontSize: 14, color: T.g600, lineHeight: 1.6 }}>{f.description}</p>}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   AIRPORTS
   ═══════════════════════════════════════════════════ */
const Airports = ({ c, mob }) => {
  const airports = c.airports || [];
  if (!airports.length) return null;

  return (
    <Section id="airports" bg={T.g50} mob={mob}>
      <Heading sub={`Key entry points for ${c.name}`} mob={mob}>Getting There</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
        {airports.slice(0, 6).map((a, i) => (
          <Card key={i} style={{ padding: 24, borderLeft: a.isMainInternational ? `4px solid ${T.green500}` : `4px solid ${T.g300}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <IconCircle icon="✈️" size={48} bg={a.isMainInternational ? T.green50 : T.g100} />
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: T.g800 }}>{a.name}</h4>
                {a.code && <span style={{ fontSize: 13, fontWeight: 800, color: T.green600, background: T.green100, padding: "2px 10px", borderRadius: T.r.xs }}>{a.code}</span>}
              </div>
            </div>
            {a.location && <p style={{ margin: "0 0 6px", fontSize: 14, color: T.g500 }}>📍 {a.location}</p>}
            {a.type && <Badge variant="gray" size="xs">{a.type}</Badge>}
            {a.description && <p style={{ margin: "10px 0 0", fontSize: 14, color: T.g600, lineHeight: 1.6 }}>{a.description}</p>}
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   DESTINATIONS
   ═══════════════════════════════════════════════════ */
const Destinations = ({ destinations, countryName, countrySlug, mob }) => {
  if (!destinations?.length) return null;

  return (
    <Section id="destinations" bg={T.white} mob={mob}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
        <div>
          <h2 style={{ fontFamily: T.serif, fontSize: mob ? 28 : 40, fontWeight: 700, color: T.g900, margin: "0 0 10px" }}>Explore Destinations</h2>
          <p style={{ fontSize: mob ? 16 : 18, color: T.g500, margin: "0 0 8px", lineHeight: 1.6, maxWidth: 600 }}>Discover stunning places in {countryName}</p>
          <GreenBar />
        </div>
        {countrySlug && (
          <Link to={`/countries/${countrySlug}/destinations`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: T.green600, textDecoration: "none", padding: "10px 20px", borderRadius: T.r.full, border: `2px solid ${T.green200}`, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.green50; e.currentTarget.style.borderColor = T.green400; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.green200; }}
          >
            View All →
          </Link>
        )}
      </div>

      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: 24, marginTop: 32 }}>
        {destinations.slice(0, 9).map((d, i) => (
          <Link key={d.id || i} to={`/destinations/${d.slug || d.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Card className="cp-imgZoom" style={{ height: "100%" }}>
              <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                <img src={d.imageUrl || d.image_url || (d.images || [])[0]} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.35) 0%,transparent 50%)" }} />
                {d.isFeatured && <Badge variant="primary" size="xs" style={{ position: "absolute", top: 12, left: 12 }}>Featured</Badge>}
                {d.rating && (
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.65)", color: "#FBBF24", padding: "4px 10px", borderRadius: T.r.xs, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    ★ {d.rating}
                  </div>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: T.g800 }}>{d.name}</h4>
                {d.category && <Badge variant="accent" size="xs" style={{ marginBottom: 10 }}>{d.category}</Badge>}
                {d.shortDescription && (
                  <p style={{ margin: 0, fontSize: 14, color: T.g600, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.shortDescription}</p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY
   ═══════════════════════════════════════════════════ */
const Gallery = ({ images, name, mob }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  if (!images?.length) return null;

  return (
    <Section id="gallery" bg={T.g50} mob={mob}>
      <Heading sub={`Stunning images from ${name}`} mob={mob}>Photo Gallery</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14 }}>
        {images.slice(0, 8).map((img, i) => {
          const url = typeof img === "string" ? img : img.url || img.imageUrl;
          return (
            <div key={i} className="cp-imgZoom cp-lift" onClick={() => setLb({ open: true, idx: i })} style={{ position: "relative", paddingBottom: i === 0 && !mob && images.length > 4 ? "100%" : "75%", gridColumn: i === 0 && !mob && images.length > 4 ? "span 2" : "span 1", gridRow: i === 0 && !mob && images.length > 4 ? "span 2" : "span 1", borderRadius: T.r.md, overflow: "hidden", cursor: "pointer" }}>
              <img src={url} alt={`${name} ${i + 1}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .3s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,.35)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
              >
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(255,255,255,.9)", borderRadius: T.r.full, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: T.g700, opacity: 0, transition: "opacity .3s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                >View ↗</div>
              </div>
            </div>
          );
        })}
      </div>

      {lb.open && (
        <div onClick={() => setLb({ ...lb, open: false })} className="cp-fadeIn" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <button onClick={() => setLb({ ...lb, open: false })} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.1)", border: "none", color: T.white, width: 52, height: 52, borderRadius: "50%", fontSize: 26, cursor: "pointer" }}>✕</button>
          <img src={typeof images[lb.idx] === "string" ? images[lb.idx] : images[lb.idx].url || images[lb.idx].imageUrl} alt="" className="cp-scaleIn" onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: T.r.md }} />
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx - 1 + images.length) % images.length })); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.12)", border: "none", color: T.white, width: 56, height: 56, borderRadius: "50%", fontSize: 24, cursor: "pointer", backdropFilter: "blur(4px)" }}>←</button>
              <button onClick={e => { e.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx + 1) % images.length })); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.12)", border: "none", color: T.white, width: 56, height: 56, borderRadius: "50%", fontSize: 24, cursor: "pointer", backdropFilter: "blur(4px)" }}>→</button>
            </>
          )}
          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 500 }}>{lb.idx + 1} / {images.length}</div>
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL TIPS
   ═══════════════════════════════════════════════════ */
const TravelTips = ({ c, mob }) => {
  const tips = c.travelTips || [];
  if (!tips.length) return null;

  return (
    <Section id="tips" bg={T.white} mob={mob}>
      <Heading sub={`Helpful advice for visiting ${c.name}`} mob={mob}>Travel Tips</Heading>
      <div className="cp-stagger" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)", gap: 20 }}>
        {tips.map((tip, i) => (
          <Card key={i} style={{ padding: 24, display: "flex", gap: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${T.green500},${T.green600})`, display: "flex", alignItems: "center", justifyContent: "center", color: T.white, fontWeight: 800, fontSize: 18, flexShrink: 0, boxShadow: `0 4px 12px ${T.green500}33` }}>
              {i + 1}
            </div>
            <div style={{ minWidth: 0 }}>
              {tip.title && <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: T.g800 }}>{tip.title}</h4>}
              <p style={{ margin: 0, fontSize: 14, color: T.g600, lineHeight: 1.65 }}>
                {typeof tip === "string" ? tip : tip.content || tip.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   FOOTER CTA
   ═══════════════════════════════════════════════════ */
const FooterCTA = ({ c, mob }) => (
  <section style={{ background: `linear-gradient(135deg,${T.green700} 0%,${T.green900} 100%)`, padding: mob ? "80px 0" : "120px 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, opacity: .06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
    <div className="cp-float" style={{ position: "absolute", top: "12%", left: "6%", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(255,255,255,.08)" }} />
    <div className="cp-float" style={{ position: "absolute", bottom: "15%", right: "8%", width: 90, height: 90, borderRadius: "50%", border: "2px solid rgba(255,255,255,.06)", animationDelay: "1.5s" }} />

    <Box style={{ position: "relative" }}>
      <div className="cp-float" style={{ display: "inline-block", marginBottom: 24 }}>
        <span style={{ fontSize: 56 }}>🌍</span>
      </div>
      <h2 style={{ fontFamily: T.serif, fontSize: mob ? 32 : 52, fontWeight: 800, color: T.white, margin: "0 0 20px", lineHeight: 1.15 }}>
        Ready to Explore<br />{c.name}?
      </h2>
      <p style={{ fontSize: mob ? 17 : 20, color: "rgba(255,255,255,.85)", maxWidth: 580, margin: "0 auto 44px", lineHeight: 1.65 }}>
        Start planning your adventure. Discover stunning destinations, rich culture, and unforgettable experiences.
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
        {c.destinationCount > 0 && (
          <Link to={`/countries/${c.slug}/destinations`} style={{ padding: "18px 40px", background: T.white, color: T.green800, border: "none", borderRadius: T.r.md, fontSize: 17, fontWeight: 700, textDecoration: "none", fontFamily: T.sans, transition: "transform .2s,box-shadow .2s", boxShadow: T.sh.lg, display: "inline-flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = T.sh.xxl; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = T.sh.lg; }}
          >
            View All Destinations
          </Link>
        )}
        <Link to="/countries" style={{ padding: "18px 40px", background: "transparent", color: T.white, border: "2px solid rgba(255,255,255,.35)", borderRadius: T.r.md, fontSize: 17, fontWeight: 600, textDecoration: "none", fontFamily: T.sans, transition: "background .2s,border-color .2s", display: "inline-flex", alignItems: "center" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.55)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,.35)"; }}
        >
          Explore More Countries
        </Link>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: mob ? 28 : 56, flexWrap: "wrap" }}>
        {[
          { icon: "🏆", text: "Top Rated" },
          { icon: "✅", text: "Verified" },
          { icon: "🔒", text: "Secure" },
          { icon: "💬", text: "24/7 Support" },
        ].map((t, i) => (
          <div key={i} style={{ color: "rgba(255,255,255,.75)", textAlign: "center" }}>
            <div className="cp-wiggle" style={{ fontSize: 30, marginBottom: 8, cursor: "default" }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".3px" }}>{t.text}</div>
          </div>
        ))}
      </div>
    </Box>
  </section>
);

/* ═══════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate }) => (
  <div style={{ minHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: T.sans, padding: 48, textAlign: "center", background: T.g50 }}>
    <div className="cp-float" style={{ width: 150, height: 150, borderRadius: "50%", background: T.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, marginBottom: 36, border: `3px solid ${T.green200}` }}>
      🌍
    </div>
    <h2 style={{ fontFamily: T.serif, fontSize: 38, fontWeight: 700, color: T.g800, margin: "0 0 16px" }}>Country Not Found</h2>
    <p style={{ fontSize: 18, color: T.g500, maxWidth: 480, margin: "0 0 36px", lineHeight: 1.65 }}>
      {error || "The country you're looking for doesn't exist or has been removed."}
    </p>
    <div style={{ display: "flex", gap: 14 }}>
      <button onClick={() => navigate(-1)} style={{ padding: "14px 32px", background: T.white, color: T.g700, border: `2px solid ${T.g300}`, borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>Go Back</button>
      <button onClick={() => navigate("/countries")} style={{ padding: "14px 32px", background: T.green600, color: T.white, border: "none", borderRadius: T.r.md, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: T.sans }}>Browse Countries</button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const CountryPage = () => {
  const { idOrSlug, id } = useParams();
  const slug = idOrSlug || id;
  const navigate = useNavigate();
  const { mob } = useScreen();

  const [country, setCountry] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchCountryPageData(slug)
      .then(({ country, destinations }) => {
        setCountry(country);
        setDestinations(destinations);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const scrollTo = useCallback((sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Build sections list
  const sections = [];
  if (country) {
    const c = country;
    if (c.description || c.fullDescription || c.highlights?.length) sections.push({ id: "overview", label: "Overview", short: "Overview" });
    if (c.area || Object.keys(c.geography || {}).length || c.climate) sections.push({ id: "geography", label: "Geography & Climate", short: "Geography" });
    if (c.languages?.length || c.ethnicGroups?.length || c.religions?.length) sections.push({ id: "people", label: "People & Culture", short: "People" });
    if ((c.historicalTimeline || []).length || (c.unescoSites || []).length) sections.push({ id: "history", label: "History & Heritage", short: "History" });
    if (Object.values(c.wildlife || {}).some(v => Array.isArray(v) && v.length)) sections.push({ id: "wildlife", label: "Wildlife", short: "Wildlife" });
    if (Object.values(c.cuisine || {}).some(v => Array.isArray(v) && v.length)) sections.push({ id: "cuisine", label: "Cuisine", short: "Food" });
    if (c.visaInfo || c.healthInfo || c.safety || c.electricityInfo) sections.push({ id: "travel", label: "Travel Essentials", short: "Travel" });
    if ((c.festivals || []).length) sections.push({ id: "festivals", label: "Festivals", short: "Festivals" });
    if ((c.airports || []).length) sections.push({ id: "airports", label: "Getting There", short: "Airports" });
    if (destinations.length) sections.push({ id: "destinations", label: "Destinations", short: "Places" });
    if ((c.images || []).length) sections.push({ id: "gallery", label: "Gallery", short: "Photos" });
    if ((c.travelTips || []).length) sections.push({ id: "tips", label: "Travel Tips", short: "Tips" });
  }

  // Scroll spy
  useEffect(() => {
    if (!sections.length) return;
    const handler = () => {
      const ids = sections.map(s => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections.length]);

  if (loading) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <Styles />
        <SkeletonPage mob={mob} />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <Styles />
        <ErrorState error={error} navigate={navigate} />
      </div>
    );
  }

  const c = country;

  return (
    <div style={{ fontFamily: T.sans, color: T.g800, background: T.white }}>
      <Styles />
      <Hero c={c} mob={mob} />
      {sections.length > 0 && <SectionNav sections={sections} active={activeSection} onClick={scrollTo} mob={mob} />}
      <QuickFacts c={c} mob={mob} />
      <Overview c={c} mob={mob} />
      <Geography c={c} mob={mob} />
      <People c={c} mob={mob} />
      <History c={c} mob={mob} />
      <Wildlife c={c} mob={mob} />
      <Cuisine c={c} mob={mob} />
      <TravelEssentials c={c} mob={mob} />
      <Festivals c={c} mob={mob} />
      <Airports c={c} mob={mob} />
      <Destinations destinations={destinations} countryName={c.name} countrySlug={c.slug} mob={mob} />
      <Gallery images={c.images} name={c.name} mob={mob} />
      <TravelTips c={c} mob={mob} />
      <FooterCTA c={c} mob={mob} />
    </div>
  );
};

export default CountryPage;