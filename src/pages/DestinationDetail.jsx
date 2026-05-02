// src/pages/DestinationDetail.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const T = {
  // Greens
  g50:  "#ECFDF5", g100: "#D1FAE5", g200: "#A7F3D0",
  g300: "#6EE7B7", g400: "#34D399", g500: "#10B981",
  g600: "#059669", g700: "#047857", g800: "#065F46", g900: "#064E3B",

  // Neutrals
  white: "#FFFFFF",
  f50:  "#F9FAFB", f100: "#F3F4F6", f200: "#E5E7EB",
  f300: "#D1D5DB", f400: "#9CA3AF", f500: "#6B7280",
  f600: "#4B5563", f700: "#374151", f800: "#1F2937", f900: "#111827",

  // Accents
  amber:     "#F59E0B", amberBg:  "#FEF3C7",
  red:       "#EF4444", redBg:    "#FEF2F2",
  blue:      "#3B82F6", blueBg:   "#DBEAFE",
  purple:    "#8B5CF6", purpleBg: "#EDE9FE",

  // Typography
  sans:  "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  serif: "'Playfair Display',Georgia,serif",

  // Layout
  maxW:   "1280px",
  narrowW:"960px",

  // Radii
  rSm: "8px",  rMd: "14px", rLg: "20px",
  rXl: "28px", rFull: "9999px",

  // Shadows
  shSm:  "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)",
  shMd:  "0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)",
  shLg:  "0 12px 24px rgba(0,0,0,.1), 0 4px 8px rgba(0,0,0,.06)",
  shXl:  "0 24px 48px rgba(0,0,0,.12), 0 8px 16px rgba(0,0,0,.06)",
  shGreen: "0 8px 24px rgba(16,185,129,.25)",
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES — injected once
═══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; }
  ::selection { background: ${T.g100}; color: ${T.g900}; }
  ::-webkit-scrollbar { width: 7px; }
  ::-webkit-scrollbar-track { background: ${T.f100}; }
  ::-webkit-scrollbar-thumb { background: ${T.g300}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.g400}; }

  @keyframes dd-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes dd-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes dd-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dd-scaleIn {
    from { opacity: 0; transform: scale(.94); }
    to   { opacity: 1; transform: scale(1);   }
  }
  @keyframes dd-heroZoom {
    from { transform: scale(1.06); }
    to   { transform: scale(1);    }
  }
  @keyframes dd-float {
    0%, 100% { transform: translateY(0);   }
    50%      { transform: translateY(-9px);}
  }
  @keyframes dd-flow {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  @keyframes dd-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes dd-staggerFade {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  .dd-skel {
    background: linear-gradient(90deg, ${T.f200} 25%, ${T.f100} 50%, ${T.f200} 75%);
    background-size: 200% 100%;
    animation: dd-shimmer 1.5s ease-in-out infinite;
  }
  .dd-fadeUp  { animation: dd-fadeUp  .65s cubic-bezier(.22,1,.36,1) both; }
  .dd-fadeIn  { animation: dd-fadeIn  .45s ease both; }
  .dd-scaleIn { animation: dd-scaleIn .38s ease both; }

  .dd-lift {
    transition: transform .28s cubic-bezier(.22,1,.36,1),
                box-shadow .28s ease;
    will-change: transform;
  }
  .dd-lift:hover {
    transform:  translateY(-5px);
    box-shadow: ${T.shXl};
  }
  .dd-imgHover { overflow: hidden; }
  .dd-imgHover img {
    transition: transform .55s cubic-bezier(.22,1,.36,1);
  }
  .dd-imgHover:hover img { transform: scale(1.07); }

  /* staggered children */
  .dd-stagger > * {
    opacity: 0;
    animation: dd-staggerFade .55s cubic-bezier(.22,1,.36,1) both;
  }
  ${Array.from({length:12},(_,i)=>
    `.dd-stagger>*:nth-child(${i+1}){animation-delay:${i*75}ms}`
  ).join(";")}

  /* responsive helpers */
  @media (max-width: 767px) {
    .dd-hide-mob { display: none !important; }
  }
  @media (min-width: 768px) {
    .dd-hide-desk { display: none !important; }
  }
`;

function injectGlobalStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("dd-global")) return;
  const s = document.createElement("style");
  s.id = "dd-global";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */
function useWindowSize() {
  const [s, setS] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
  });
  useEffect(() => {
    const fn = () => setS({ w: window.innerWidth });
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return {
    w:    s.w,
    mob:  s.w < 640,
    tab:  s.w >= 640 && s.w < 1024,
    desk: s.w >= 1024,
    sm:   s.w >= 640,
  };
}

function useInView(threshold = 0.12) {
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
}

/* ═══════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════ */
const Container = ({ children, narrow = false, style = {} }) => (
  <div
    style={{
      maxWidth: narrow ? T.narrowW : T.maxW,
      margin: "0 auto",
      padding: "0 clamp(16px, 4vw, 48px)",
      width: "100%",
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, sub, accent = true, center = false }) => (
  <div style={{ marginBottom: "clamp(28px,4vw,48px)", textAlign: center ? "center" : "left" }}>
    <h2
      style={{
        fontFamily: T.serif,
        fontSize: "clamp(26px,4vw,42px)",
        fontWeight: 800,
        color: T.f900,
        margin: "0 0 10px",
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
    {sub && (
      <p
        style={{
          fontSize: "clamp(14px,1.5vw,17px)",
          color: T.f500,
          margin: "0 0 16px",
          lineHeight: 1.6,
          maxWidth: center ? 540 : "100%",
          marginLeft: center ? "auto" : 0,
          marginRight: center ? "auto" : 0,
        }}
      >
        {sub}
      </p>
    )}
    {accent && (
      <div
        style={{
          width: 56,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg,${T.g400},${T.g600})`,
          marginLeft: center ? "auto" : 0,
          marginRight: center ? "auto" : 0,
        }}
      />
    )}
  </div>
);

const Badge = ({
  children, variant = "primary", size = "md", icon, style = {},
}) => {
  const variants = {
    primary:  { bg: T.g100,    color: T.g800 },
    green:    { bg: T.g500,    color: T.white },
    white:    { bg: "rgba(255,255,255,.18)", color: T.white, border: "1px solid rgba(255,255,255,.3)" },
    dark:     { bg: "rgba(0,0,0,.5)",        color: T.white },
    gray:     { bg: T.f100,    color: T.f700 },
    success:  { bg: "#D1FAE5", color: "#065F46" },
    warning:  { bg: "#FEF3C7", color: "#92400E" },
    info:     { bg: T.blueBg,  color: "#1E40AF" },
    star:     { bg: "rgba(251,191,36,.18)", color: "#D97706" },
    eco:      { bg: T.g50,     color: T.g700 },
  };
  const sizes = {
    xs: { p: "3px 8px",   f: 10 },
    sm: { p: "4px 11px",  f: 11 },
    md: { p: "6px 14px",  f: 12 },
    lg: { p: "8px 18px",  f: 13 },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size]       || sizes.md;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: v.bg, color: v.color,
        border: v.border || "none",
        fontWeight: 700, fontFamily: T.sans,
        borderRadius: T.rFull,
        textTransform: "uppercase", letterSpacing: ".55px",
        padding: s.p, fontSize: s.f,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: s.f + 2 }}>{icon}</span>}
      {children}
    </span>
  );
};

const Divider = ({ color = T.f200, my = 24 }) => (
  <hr style={{ border: "none", height: 1, background: color, margin: `${my}px 0` }} />
);

const IconCircle = ({
  icon, size = 48, bg = T.g50, color = T.g600, style = {},
}) => (
  <div
    style={{
      width: size, height: size,
      borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.44, color,
      flexShrink: 0, ...style,
    }}
  >
    {icon}
  </div>
);

/* ═══════════════════════════════════════════════════
   ANIMATED SECTION WRAPPER
═══════════════════════════════════════════════════ */
const Section = memo(({ children, id, bg = T.white, py }) => {
  const [ref, visible] = useInView();
  return (
    <section
      ref={ref}
      id={id}
      style={{
        background: bg,
        padding: py || "clamp(56px,8vw,100px) 0",
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: "opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {children}
    </section>
  );
});
Section.displayName = "Section";

/* ═══════════════════════════════════════════════════
   SKELETON LOADER
═══════════════════════════════════════════════════ */
const Skel = ({ w = "100%", h = 18, r = T.rSm, mb = 0, style = {} }) => (
  <div
    className="dd-skel"
    style={{ width: w, height: h, borderRadius: r, marginBottom: mb, ...style }}
  />
);

const FullPageSkeleton = memo(({ mob }) => (
  <div style={{ background: T.white, minHeight: "100vh", fontFamily: T.sans }}>
    {/* Hero */}
    <div style={{ position: "relative", height: mob ? "65vh" : "85vh" }}>
      <Skel w="100%" h="100%" r="0" />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: mob ? "32px 20px" : "72px 48px",
          background: "linear-gradient(transparent,rgba(0,0,0,.65))",
        }}
      >
        <div style={{ maxWidth: T.maxW, margin: "0 auto" }}>
          <Skel w={90} h={26} mb={18} style={{ opacity:.5, borderRadius: T.rFull }} />
          <Skel w={mob ? "80%" : 480} h={mob ? 36 : 58} mb={16} style={{ opacity:.55 }} />
          <Skel w={mob ? "55%" : 300} h={22} mb={32} style={{ opacity:.45 }} />
          <div style={{ display:"flex", gap:10 }}>
            {[90,70,100].map((x,i) => (
              <Skel key={i} w={x} h={32} style={{ borderRadius:T.rFull, opacity:.4 }} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Quick bar */}
    <div style={{ borderBottom:`1px solid ${T.f200}`, padding:"20px 24px" }}>
      <div style={{ maxWidth:T.maxW, margin:"0 auto", display:"grid", gridTemplateColumns: mob?"repeat(2,1fr)":"repeat(5,1fr)", gap:24 }}>
        {Array.from({length: mob?4:5}).map((_,i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <Skel w={44} h={44} r="50%" style={{ margin:"0 auto 10px" }} />
            <Skel w="50%" h={11} mb={6} style={{ margin:"0 auto 6px" }} />
            <Skel w="65%" h={15} style={{ margin:"0 auto" }} />
          </div>
        ))}
      </div>
    </div>

    {/* Body */}
    <div style={{ maxWidth:T.maxW, margin:"0 auto", padding: mob?"40px 20px":"80px 48px" }}>
      <div style={{ display:"grid", gridTemplateColumns: mob?"1fr":"5fr 3fr", gap:48 }}>
        <div>
          <Skel w={200} h={34} mb={24} />
          {[100,100,100,100,55].map((w,i) => (
            <Skel key={i} w={`${w}%`} h={15} mb={14} />
          ))}
          <div style={{ marginTop:40 }}>
            <Skel w={160} h={26} mb={22} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {Array.from({length:6}).map((_,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <Skel w={32} h={32} r="50%" />
                  <Skel w="60%" h={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ background:T.f50, borderRadius:T.rLg, padding:28 }}>
            <Skel w="100%" h={56} r={T.rMd} mb={20} />
            <Skel w="100%" h={48} r={T.rMd} mb={20} />
            <Divider />
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
                <Skel w="38%" h={14} />
                <Skel w="45%" h={14} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery skel */}
      <div style={{ marginTop:80 }}>
        <Skel w={150} h={32} mb={32} />
        <div style={{ display:"grid", gridTemplateColumns: mob?"repeat(2,1fr)":"repeat(4,1fr)", gap:16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ position:"relative", paddingBottom:"70%" }}>
              <Skel w="100%" h="100%" r={T.rMd} style={{ position:"absolute", inset:0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
));
FullPageSkeleton.displayName = "FullPageSkeleton";

/* ═══════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════ */
const ErrorState = memo(({ error, navigate }) => (
  <div
    style={{
      minHeight: "85vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: T.sans, padding: "clamp(24px,5vw,64px)",
      textAlign: "center", background: T.f50,
    }}
  >
    <div
      style={{
        width: 140, height: 140, borderRadius: "50%",
        background: T.g50, border: `3px solid ${T.g200}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 68, marginBottom: 36,
        animation: "dd-float 3s ease-in-out infinite",
      }}
    >
      🗺️
    </div>
    <h2
      style={{
        fontFamily: T.serif,
        fontSize: "clamp(26px,4vw,40px)",
        fontWeight: 800, color: T.f800,
        margin: "0 0 14px",
      }}
    >
      Destination Not Found
    </h2>
    <p style={{ fontSize:"clamp(15px,1.5vw,18px)", color:T.f500, maxWidth:480, margin:"0 0 36px", lineHeight:1.65 }}>
      {error || "The destination you're looking for doesn't exist or may have been removed."}
    </p>
    <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "13px 28px", background: T.white,
          color: T.f700, border: `2px solid ${T.f300}`,
          borderRadius: T.rMd, fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: T.sans,
          transition: "border-color .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.f500}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.f300}
      >
        ← Go Back
      </button>
      <button
        onClick={() => navigate("/destinations")}
        style={{
          padding: "13px 28px", background: T.g600,
          color: T.white, border: "none",
          borderRadius: T.rMd, fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: T.sans,
          transition: "background .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = T.g700}
        onMouseLeave={e => e.currentTarget.style.background = T.g600}
      >
        Browse All Destinations
      </button>
    </div>
  </div>
));
ErrorState.displayName = "ErrorState";

/* ═══════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════ */
const Hero = memo(({ d, size }) => {
  const heroImg = d.heroImage || d.imageUrl || (d.images || [])[0];

  return (
    <section
      style={{
        position: "relative",
        height: size.mob ? "72vh" : "88vh",
        minHeight: size.mob ? 480 : 600,
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      {heroImg ? (
        <div
          style={{
            position: "absolute", inset: 0,
            animation: "dd-heroZoom 9s ease forwards",
          }}
        >
          <img
            src={heroImg}
            alt={d.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
          />
        </div>
      ) : (
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${T.g700},${T.g900})` }} />
      )}

      {/* Overlays */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(0,0,0,.12) 0%,rgba(0,0,0,.3) 45%,rgba(0,0,0,.8) 100%)" }} />
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg,${T.g900}28,transparent 65%)` }} />

      {/* Content */}
      <Container
        style={{
          position: "relative", height: "100%",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: size.mob ? "clamp(36px,6vw,56px)" : "clamp(56px,6vw,88px)",
        }}
      >
        <div style={{ maxWidth: 820 }}>
          {/* Breadcrumb */}
          <div
            className="dd-fadeUp"
            style={{
              display:"flex", alignItems:"center", gap:10,
              marginBottom:18, animationDelay:".08s",
            }}
          >
            <Link
              to="/destinations"
              style={{
                color:"rgba(255,255,255,.75)", textDecoration:"none",
                fontSize:14, fontWeight:500, transition:"color .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.white}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.75)"}
            >
              Destinations
            </Link>
            {(d.countryName || d.country?.name) && (
              <>
                <span style={{ color:"rgba(255,255,255,.35)", fontSize:13 }}>›</span>
                <Link
                  to={`/country/${d.countrySlug || d.country?.slug}`}
                  style={{
                    display:"flex", alignItems:"center", gap:7,
                    color:"rgba(255,255,255,.8)", textDecoration:"none",
                    fontSize:14, fontWeight:600, transition:"color .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = T.white}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
                >
                  {(d.country?.flag || d.countryFlag) && (
                    <span style={{ fontSize:20 }}>{d.country?.flag || d.countryFlag}</span>
                  )}
                  {d.countryName || d.country?.name}
                </Link>
              </>
            )}
            {d.region && (
              <>
                <span style={{ color:"rgba(255,255,255,.35)", fontSize:13 }}>›</span>
                <span style={{ color:"rgba(255,255,255,.65)", fontSize:13, fontWeight:500 }}>
                  {d.region}
                </span>
              </>
            )}
          </div>

          {/* Badges */}
          <div
            className="dd-fadeUp"
            style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18, animationDelay:".16s" }}
          >
            {d.isFeatured   && <Badge variant="star"    size="md" icon="⭐">Featured</Badge>}
            {d.isPopular    && <Badge variant="warning" size="md" icon="🔥">Popular</Badge>}
            {d.isNew        && <Badge variant="success" size="md" icon="✨">New</Badge>}
            {d.isEcoFriendly && <Badge variant="eco"   size="md" icon="🌿">Eco-Friendly</Badge>}
            {d.destinationType && <Badge variant="white" size="md">{d.destinationType}</Badge>}
          </div>

          {/* Title */}
          <h1
            className="dd-fadeUp"
            style={{
              fontFamily: T.serif,
              fontSize: "clamp(32px,5.5vw,64px)",
              fontWeight: 800, color: T.white,
              margin: "0 0 12px", lineHeight: 1.06,
              textShadow: "0 3px 24px rgba(0,0,0,.45)",
              letterSpacing: "-0.02em",
              animationDelay: ".22s",
            }}
          >
            {d.name}
          </h1>

          {/* Tagline */}
          {d.tagline && (
            <p
              className="dd-fadeUp"
              style={{
                fontSize: "clamp(15px,1.8vw,22px)",
                color: "rgba(255,255,255,.85)",
                margin: "0 0 26px", lineHeight: 1.55,
                fontWeight: 500, maxWidth: 580,
                animationDelay: ".3s",
              }}
            >
              {d.tagline}
            </p>
          )}

          {/* Meta row */}
          <div
            className="dd-fadeUp"
            style={{
              display:"flex", flexWrap:"wrap",
              alignItems:"center", gap: size.mob ? 12 : 20,
              animationDelay:".38s",
            }}
          >
            {d.rating > 0 && (
              <div
                style={{
                  display:"flex", alignItems:"center", gap:9,
                  background:"rgba(251,191,36,.18)",
                  padding:"8px 16px", borderRadius:T.rFull,
                  backdropFilter:"blur(10px)",
                  border:"1px solid rgba(251,191,36,.3)",
                }}
              >
                <span style={{ color:"#FBBF24", fontSize:18, lineHeight:1 }}>★</span>
                <span style={{ color:T.white, fontWeight:800, fontSize:16 }}>{d.rating.toFixed(1)}</span>
                {d.reviewCount > 0 && (
                  <span style={{ color:"rgba(255,255,255,.6)", fontSize:13 }}>
                    ({d.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
            {d.duration && <Badge variant="dark" size="lg" icon="🕐">{d.duration}</Badge>}
            {d.difficulty && (
              <Badge
                variant={
                  d.difficulty === "easy" ? "success" :
                  d.difficulty === "moderate" ? "warning" : "info"
                }
                size="lg"
              >
                {d.difficulty}
              </Badge>
            )}
            {d.category && <Badge variant="dark" size="lg">{d.category}</Badge>}
          </div>
        </div>
      </Container>

      {/* Scroll hint */}
      {!size.mob && (
        <div
          style={{
            position:"absolute", bottom:32, right:48,
            display:"flex", flexDirection:"column",
            alignItems:"center", gap:6,
            color:"rgba(255,255,255,.5)", fontSize:12,
            fontWeight:600, letterSpacing:".8px",
            textTransform:"uppercase",
            animation:"dd-float 2.5s ease-in-out infinite",
          }}
        >
          <span>Scroll</span>
          <span style={{ fontSize:20 }}>↓</span>
        </div>
      )}
    </section>
  );
});
Hero.displayName = "Hero";

/* ═══════════════════════════════════════════════════
   QUICK INFO BAR (sticky)
═══════════════════════════════════════════════════ */
const QuickInfoBar = memo(({ d, size }) => {
  const items = [
    { icon:"🕐", label:"Duration",   value: d.duration || (d.durationDays ? `${d.durationDays} Days` : null) },
    { icon:"📊", label:"Difficulty", value: d.difficulty, isDiff: true },
    { icon:"👥", label:"Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize} pax` : null },
    { icon:"⭐", label:"Rating",     value: d.rating ? `${d.rating.toFixed(1)} / 5.0` : null, highlight: true },
    { icon:"🎫", label:"Entry Fee",  value: d.entranceFee },
  ].filter(x => x.value);

  if (!items.length) return null;
  const cols = size.mob ? Math.min(items.length, 2) : items.length;

  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.f200}`,
        position: "sticky", top: 0, zIndex: 90,
        boxShadow: T.shSm,
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols},1fr)`,
          }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              style={{
                display:"flex", flexDirection:"column",
                alignItems:"center", textAlign:"center",
                padding: size.mob ? "14px 8px" : "22px 12px",
                borderRight: i < items.length - 1 && !size.mob
                  ? `1px solid ${T.f200}` : "none",
              }}
            >
              <span style={{ fontSize: size.mob ? 22 : 28, marginBottom:6 }}>{it.icon}</span>
              <span
                style={{
                  fontSize:10, fontWeight:700, color:T.f400,
                  textTransform:"uppercase", letterSpacing:".7px", marginBottom:4,
                }}
              >
                {it.label}
              </span>
              {it.isDiff ? (
                <Badge
                  variant={
                    it.value === "easy" ? "success" :
                    it.value === "moderate" ? "warning" : "info"
                  }
                  size="sm"
                >
                  {it.value}
                </Badge>
              ) : (
                <span
                  style={{
                    fontSize: size.mob ? 13 : 15,
                    fontWeight:700,
                    color: it.highlight ? T.g600 : T.f800,
                  }}
                >
                  {it.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
});
QuickInfoBar.displayName = "QuickInfoBar";

/* ═══════════════════════════════════════════════════
   SIDEBAR CARD
═══════════════════════════════════════════════════ */
const SidebarCard = memo(({ d, navigate }) => {
  const infoRows = [
    { icon:"🕐", label:"Operating Hours",  value: d.operatingHours },
    { icon:"🏙️", label:"Nearest City",    value: d.nearestCity },
    { icon:"✈️", label:"Nearest Airport", value: d.nearestAirport },
    { icon:"⛰️", label:"Altitude",        value: d.altitudeMeters ? `${d.altitudeMeters.toLocaleString()}m` : null },
    { icon:"📅", label:"Best Time",       value: d.bestTimeToVisit },
  ].filter(x => x.value);

  return (
    <div
      style={{
        borderRadius: T.rXl, overflow:"hidden",
        border: `2px solid ${T.g500}`,
        boxShadow: T.shGreen,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg,${T.g600},${T.g800})`,
          padding: "clamp(22px,3vw,32px) clamp(20px,3vw,28px)",
          textAlign:"center", position:"relative",
        }}
      >
        <div
          style={{
            position:"absolute", top:-20, right:-20,
            width:120, height:120, borderRadius:"50%",
            background:"rgba(255,255,255,.05)",
            pointerEvents:"none",
          }}
        />
        <p style={{ margin:"0 0 4px", fontSize:12, color:"rgba(255,255,255,.7)", fontWeight:600, textTransform:"uppercase", letterSpacing:".6px" }}>
          Starting from
        </p>
        <p style={{ margin:"0 0 6px", fontSize:"clamp(22px,3vw,30px)", fontWeight:800, color:T.white, fontFamily:T.sans }}>
          {d.entranceFee || "Contact for Price"}
        </p>
        <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,.55)" }}>
          per person · prices may vary
        </p>
      </div>

      {/* CTAs */}
      <div style={{ padding:"clamp(18px,2vw,24px)", background:T.white }}>
        <button
          onClick={() => navigate("/booking")}
          style={{
            width:"100%", padding:"clamp(13px,1.5vw,16px)",
            background:`linear-gradient(135deg,${T.g500},${T.g700})`,
            color:T.white, border:"none",
            borderRadius:T.rMd, fontSize:"clamp(14px,1.3vw,16px)",
            fontWeight:700, cursor:"pointer", fontFamily:T.sans,
            marginBottom:10, boxShadow:T.shGreen,
            transition:"all .25s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform="translateY(-2px)";
            e.currentTarget.style.boxShadow=`0 12px 28px rgba(16,185,129,.35)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform="translateY(0)";
            e.currentTarget.style.boxShadow=T.shGreen;
          }}
        >
          📅 Book This Experience
        </button>
        <button
          onClick={() => navigate("/contact")}
          style={{
            width:"100%", padding:"clamp(11px,1.3vw,14px)",
            background:T.white, color:T.g700,
            border:`2px solid ${T.g400}`,
            borderRadius:T.rMd, fontSize:"clamp(13px,1.2vw,15px)",
            fontWeight:600, cursor:"pointer", fontFamily:T.sans,
            transition:"all .2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background=T.g50;
            e.currentTarget.style.borderColor=T.g600;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background=T.white;
            e.currentTarget.style.borderColor=T.g400;
          }}
        >
          💬 Ask a Question
        </button>

        {infoRows.length > 0 && (
          <>
            <Divider my={20} />
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <IconCircle icon={row.icon} size={40} bg={T.g50} />
                  <div style={{ minWidth:0 }}>
                    <p style={{ margin:0, fontSize:11, color:T.f400, fontWeight:600, textTransform:"uppercase", letterSpacing:".4px" }}>
                      {row.label}
                    </p>
                    <p style={{ margin:"2px 0 0", fontSize:13, color:T.f700, fontWeight:600, lineHeight:1.35 }}>
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Trust signals */}
        <div
          style={{
            display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:8, marginTop:22,
            padding:"16px 12px",
            background:T.f50, borderRadius:T.rMd,
          }}
        >
          {[
            { icon:"✅", text:"Verified" },
            { icon:"🔒", text:"Secure" },
            { icon:"💬", text:"24/7" },
          ].map((t, i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{t.icon}</div>
              <div style={{ fontSize:10, color:T.f500, fontWeight:600, letterSpacing:".3px" }}>
                {t.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
SidebarCard.displayName = "SidebarCard";

/* ═══════════════════════════════════════════════════
   OVERVIEW SECTION
═══════════════════════════════════════════════════ */
const OverviewSection = memo(({ d, size, navigate }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  return (
    <Section id="overview" bg={T.white}>
      <Container>
        <div
          style={{
            display:"grid",
            gridTemplateColumns: size.desk ? "5fr 3fr" : "1fr",
            gap: "clamp(36px,5vw,64px)",
            alignItems:"start",
          }}
        >
          {/* Left */}
          <div>
            <SectionTitle sub={`Discover what makes ${d.name} extraordinary`}>
              About This Destination
            </SectionTitle>

            {d.overview && (
              <div
                style={{
                  background:T.g50, borderLeft:`4px solid ${T.g500}`,
                  borderRadius:`0 ${T.rMd} ${T.rMd} 0`,
                  padding:"clamp(18px,2vw,28px)", marginBottom:28,
                }}
              >
                <p style={{ margin:0, fontSize:"clamp(15px,1.4vw,17px)", fontWeight:500, color:T.g800, lineHeight:1.8, fontStyle:"italic" }}>
                  {d.overview}
                </p>
              </div>
            )}

            {desc && (
              <div style={{ fontSize:"clamp(14px,1.3vw,16px)", lineHeight:1.9, color:T.f600 }}>
                {desc.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} style={{ margin: i > 0 ? "20px 0 0" : 0 }}>{para}</p>
                ))}
              </div>
            )}

            {/* Flags */}
            {(d.isFamilyFriendly || d.isEcoFriendly || d.minAge) && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:28 }}>
                {d.isFamilyFriendly && (
                  <Badge variant="success" size="lg" icon="👨‍👩‍👧‍👦">Family Friendly</Badge>
                )}
                {d.isEcoFriendly && (
                  <Badge variant="eco" size="lg" icon="🌿">Eco-Friendly</Badge>
                )}
                {d.minAge && (
                  <Badge variant="info" size="lg" icon="📋">Min Age: {d.minAge}+</Badge>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position: size.desk ? "sticky" : "static", top:80 }}>
            <SidebarCard d={d} navigate={navigate} />
          </div>
        </div>
      </Container>
    </Section>
  );
});
OverviewSection.displayName = "OverviewSection";

/* ═══════════════════════════════════════════════════
   HIGHLIGHTS
═══════════════════════════════════════════════════ */
const HighlightsSection = memo(({ d, size }) => {
  const list = d.highlights || [];
  if (!list.length) return null;

  return (
    <Section id="highlights" bg={T.f50}>
      <Container>
        <SectionTitle sub={`What makes ${d.name} unforgettable`}>
          Highlights
        </SectionTitle>
        <div
          className="dd-stagger"
          style={{
            display:"grid",
            gridTemplateColumns: size.mob ? "1fr" : size.tab ? "repeat(2,1fr)" : "repeat(3,1fr)",
            gap: "clamp(16px,2vw,24px)",
          }}
        >
          {list.map((h, i) => (
            <div
              key={i}
              className="dd-lift"
              style={{
                background:T.white, borderRadius:T.rLg,
                padding:"clamp(20px,2.5vw,32px)",
                border:`1px solid ${T.f200}`,
                display:"flex", alignItems:"flex-start", gap:18,
              }}
            >
              <div
                style={{
                  width:48, height:48, borderRadius:"50%",
                  background:`linear-gradient(135deg,${T.g500},${T.g700})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:T.white, fontWeight:800, fontSize:18, flexShrink:0,
                  boxShadow:`0 4px 14px ${T.g500}38`,
                }}
              >
                {i + 1}
              </div>
              <p style={{ margin:0, fontSize:"clamp(14px,1.2vw,16px)", color:T.f700, lineHeight:1.7, fontWeight:500 }}>
                {h}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
});
HighlightsSection.displayName = "HighlightsSection";

/* ═══════════════════════════════════════════════════
   ACTIVITIES
═══════════════════════════════════════════════════ */
const ACTIVITY_ICONS = {
  "Game drives":"🚙", "Hot air balloon safari":"🎈",
  "Bush walks":"🚶", "Cultural village visits":"🏘️",
  "Bird watching":"🦅", "Photography safaris":"📷",
  "Night game drives":"🌙", "Bush breakfast":"🍳",
  "Hiking":"🥾", "Snorkeling":"🤿", "Swimming":"🏊",
  "Boat safari":"🚤", "Camel riding":"🐪",
};

const ActivitiesSection = memo(({ d, size }) => {
  const list = d.activities || [];
  if (!list.length) return null;

  return (
    <Section id="activities" bg={T.white}>
      <Container>
        <SectionTitle sub="Experiences awaiting you">
          Things To Do
        </SectionTitle>
        <div
          className="dd-stagger"
          style={{
            display:"grid",
            gridTemplateColumns: size.mob ? "repeat(2,1fr)" : size.tab ? "repeat(3,1fr)" : "repeat(4,1fr)",
            gap: "clamp(14px,1.8vw,22px)",
          }}
        >
          {list.map((act, i) => (
            <div
              key={i}
              className="dd-lift"
              style={{
                background:T.f50, borderRadius:T.rLg,
                padding:"clamp(18px,2.5vw,28px) clamp(14px,2vw,22px)",
                textAlign:"center", border:`1px solid ${T.f200}`,
                cursor:"default",
              }}
            >
              <div
                style={{
                  width:"clamp(56px,7vw,72px)", height:"clamp(56px,7vw,72px)",
                  borderRadius:"50%", background:T.g50,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"clamp(26px,3.5vw,38px)",
                  margin:"0 auto clamp(12px,1.5vw,18px)",
                  border:`2px solid ${T.g200}`,
                  animation:"dd-float 3s ease-in-out infinite",
                  animationDelay:`${i * 0.3}s`,
                }}
              >
                {ACTIVITY_ICONS[act] || "✨"}
              </div>
              <h4
                style={{
                  margin:0, fontSize:"clamp(13px,1.2vw,15px)",
                  fontWeight:700, color:T.f800, lineHeight:1.35,
                }}
              >
                {act}
              </h4>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
});
ActivitiesSection.displayName = "ActivitiesSection";

/* ═══════════════════════════════════════════════════
   WILDLIFE
═══════════════════════════════════════════════════ */
const WILDLIFE_ICONS = {
  Lion:"🦁", Leopard:"🐆", Cheetah:"🐆",
  "African Elephant":"🐘", Elephant:"🐘",
  "Cape Buffalo":"🐃", Wildebeest:"🦬", Zebra:"🦓",
  Hippopotamus:"🦛", "Nile Crocodile":"🐊", Giraffe:"🦒",
  Hyena:"🐺", "African Wild Dog":"🐕", Rhinoceros:"🦏",
  Gorilla:"🦍", Chimpanzee:"🐒", Flamingo:"🦩",
};

const WildlifeSection = memo(({ d }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;

  return (
    <Section id="wildlife" bg={T.f50}>
      <Container>
        <SectionTitle sub={`Incredible species at ${d.name}`} center>
          Wildlife
        </SectionTitle>
        <div
          className="dd-stagger"
          style={{ display:"flex", flexWrap:"wrap", gap:"clamp(10px,1.5vw,16px)", justifyContent:"center" }}
        >
          {list.map((animal, i) => (
            <div
              key={i}
              className="dd-lift"
              style={{
                display:"flex", alignItems:"center", gap:12,
                background:T.white, padding:"clamp(12px,1.5vw,16px) clamp(18px,2.5vw,26px)",
                borderRadius:T.rFull, border:`1px solid ${T.f200}`,
                cursor:"default",
              }}
            >
              <span style={{ fontSize:"clamp(22px,2.5vw,28px)" }}>
                {WILDLIFE_ICONS[animal] || "🦌"}
              </span>
              <span style={{ fontSize:"clamp(13px,1.2vw,15px)", fontWeight:700, color:T.f700 }}>
                {animal}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
});
WildlifeSection.displayName = "WildlifeSection";

/* ═══════════════════════════════════════════════════
   GALLERY
═══════════════════════════════════════════════════ */
const GallerySection = memo(({ d, size }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const gallery = d.gallery || [];
  const imgs = gallery.length
    ? gallery.map(g => g.imageUrl).filter(Boolean)
    : (d.images || []).filter(Boolean);

  if (!imgs.length) return null;

  const prev = useCallback((e) => {
    e.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
  }, [imgs.length]);

  const next = useCallback((e) => {
    e.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
  }, [imgs.length]);

  useEffect(() => {
    if (!lb.open) return;
    const handler = (e) => {
      if (e.key === "Escape") setLb(p => ({ ...p, open: false }));
      if (e.key === "ArrowLeft")  setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
      if (e.key === "ArrowRight") setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lb.open, imgs.length]);

  const visible = imgs.slice(0, 8);
  const cols = size.mob ? 2 : 4;

  return (
    <Section id="gallery" bg={T.white}>
      <Container>
        <SectionTitle sub={`Stunning visuals from ${d.name}`}>
          Photo Gallery
        </SectionTitle>

        <div
          className="dd-stagger"
          style={{
            display:"grid",
            gridTemplateColumns:`repeat(${cols},1fr)`,
            gap:"clamp(10px,1.5vw,16px)",
          }}
        >
          {visible.map((img, i) => {
            const isFeatured = i === 0 && !size.mob && visible.length > 4;
            return (
              <div
                key={i}
                className="dd-imgHover dd-lift"
                onClick={() => setLb({ open: true, idx: i })}
                style={{
                  position:"relative",
                  paddingBottom: isFeatured ? "100%" : "70%",
                  gridColumn: isFeatured ? "span 2" : "span 1",
                  gridRow:    isFeatured ? "span 2" : "span 1",
                  borderRadius:T.rMd, overflow:"hidden",
                  cursor:"pointer",
                  border:`1px solid ${T.f200}`,
                }}
              >
                <img
                  src={img}
                  alt={`${d.name} ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                />
                <div
                  style={{
                    position:"absolute", inset:0,
                    background:"linear-gradient(to top,rgba(0,0,0,.3),transparent 60%)",
                    opacity:0, transition:"opacity .3s",
                    display:"flex", alignItems:"flex-end", justifyContent:"flex-end",
                    padding:12,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity="1"}
                  onMouseLeave={e => e.currentTarget.style.opacity="0"}
                >
                  <span
                    style={{
                      background:"rgba(255,255,255,.92)",
                      borderRadius:T.rFull, padding:"5px 14px",
                      fontSize:12, fontWeight:700, color:T.f700,
                    }}
                  >
                    View ↗
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Lightbox */}
      {lb.open && (
        <div
          className="dd-fadeIn"
          onClick={() => setLb(p => ({ ...p, open: false }))}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,.97)",
            zIndex:1000, display:"flex",
            alignItems:"center", justifyContent:"center",
            padding:"clamp(16px,3vw,32px)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLb(p => ({ ...p, open: false }))}
            style={{
              position:"absolute", top:20, right:20,
              background:"rgba(255,255,255,.1)", border:"none",
              color:T.white, width:48, height:48, borderRadius:"50%",
              fontSize:22, cursor:"pointer", backdropFilter:"blur(4px)",
              transition:"background .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.2)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.1)"}
          >
            ✕
          </button>

          <img
            src={imgs[lb.idx]}
            alt=""
            className="dd-scaleIn"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth:"90vw", maxHeight:"88vh",
              objectFit:"contain", borderRadius:T.rMd,
              boxShadow:"0 32px 64px rgba(0,0,0,.6)",
            }}
          />

          {/* Nav */}
          {imgs.length > 1 && (
            <>
              {[
                { fn: prev, label:"←", pos:{ left:"clamp(8px,2vw,24px)" } },
                { fn: next, label:"→", pos:{ right:"clamp(8px,2vw,24px)" } },
              ].map(({ fn, label, pos }) => (
                <button
                  key={label}
                  onClick={fn}
                  style={{
                    position:"absolute", top:"50%",
                    transform:"translateY(-50%)", ...pos,
                    background:"rgba(255,255,255,.1)", border:"none",
                    color:T.white, width:"clamp(44px,5vw,56px)", height:"clamp(44px,5vw,56px)",
                    borderRadius:"50%", fontSize:"clamp(18px,2vw,24px)",
                    cursor:"pointer", backdropFilter:"blur(4px)",
                    transition:"background .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.22)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.1)"}
                >
                  {label}
                </button>
              ))}
              <div
                style={{
                  position:"absolute", bottom:20, left:"50%",
                  transform:"translateX(-50%)",
                  color:"rgba(255,255,255,.55)", fontSize:13, fontWeight:600,
                }}
              >
                {lb.idx + 1} / {imgs.length}
              </div>
            </>
          )}
        </div>
      )}
    </Section>
  );
});
GallerySection.displayName = "GallerySection";

/* ═══════════════════════════════════════════════════
   LOCATION
═══════════════════════════════════════════════════ */
const LocationSection = memo(({ d, size }) => {
  const hasMap  = d.latitude && d.longitude;
  const hasInfo = d.region || d.nearestCity || d.nearestAirport;
  if (!hasMap && !hasInfo) return null;

  const rows = [
    { icon:"📍", label:"Region",         value: d.region },
    { icon:"🏙️", label:"Nearest City",  value: d.nearestCity },
    { icon:"✈️", label:"Nearest Airport",value: d.nearestAirport, sub: d.distanceFromAirportKm ? `${d.distanceFromAirportKm} km away` : null },
    { icon:"⛰️", label:"Altitude",       value: d.altitudeMeters ? `${d.altitudeMeters.toLocaleString()}m asl` : null },
  ].filter(x => x.value);

  return (
    <Section id="location" bg={T.f50}>
      <Container>
        <SectionTitle sub="How to get there">
          Location &amp; Access
        </SectionTitle>
        <div
          style={{
            display:"grid",
            gridTemplateColumns: hasMap && hasInfo && !size.mob ? "1fr 1fr" : "1fr",
            gap:"clamp(24px,3vw,36px)",
          }}
        >
          {hasMap && (
            <div
              style={{
                borderRadius:T.rLg, overflow:"hidden",
                border:`1px solid ${T.f200}`, boxShadow:T.shMd,
                height:"clamp(280px,35vw,420px)",
              }}
            >
              <iframe
                title={`${d.name} map`}
                src={`https://www.google.com/maps?q=${d.latitude},${d.longitude}&z=12&output=embed`}
                style={{ width:"100%", height:"100%", border:"none" }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          )}

          {rows.length > 0 && (
            <div className="dd-stagger" style={{ display:"flex", flexDirection:"column", gap:"clamp(12px,1.5vw,18px)" }}>
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="dd-lift"
                  style={{
                    background:T.white, borderRadius:T.rLg,
                    padding:"clamp(16px,2vw,24px)",
                    border:`1px solid ${T.f200}`,
                    display:"flex", alignItems:"center", gap:18,
                  }}
                >
                  <IconCircle icon={row.icon} size={52} bg={T.g50} />
                  <div>
                    <p style={{ margin:0, fontSize:11, color:T.f400, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px" }}>
                      {row.label}
                    </p>
                    <p style={{ margin:"3px 0 0", fontSize:"clamp(15px,1.5vw,18px)", color:T.f800, fontWeight:700 }}>
                      {row.value}
                    </p>
                    {row.sub && (
                      <p style={{ margin:"2px 0 0", fontSize:12, color:T.f500 }}>{row.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Getting there */}
        {d.gettingThere && (
          <div
            style={{
              marginTop:"clamp(24px,3vw,36px)",
              background:T.white, borderRadius:T.rLg,
              border:`1px solid ${T.f200}`,
              overflow:"hidden",
            }}
          >
            <div style={{ padding:"16px 24px", background:T.g50, borderBottom:`1px solid ${T.f200}`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>🗺️</span>
              <h4 style={{ margin:0, fontSize:16, fontWeight:700, color:T.g800 }}>Getting There</h4>
            </div>
            <div style={{ padding:"clamp(18px,2vw,24px)" }}>
              <p style={{ margin:0, fontSize:"clamp(14px,1.3vw,16px)", color:T.f600, lineHeight:1.8 }}>
                {d.gettingThere}
              </p>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
});
LocationSection.displayName = "LocationSection";

/* ═══════════════════════════════════════════════════
   PRACTICAL INFO
═══════════════════════════════════════════════════ */
const PracticalSection = memo(({ d, size }) => {
  const items = [
    { icon:"🎫", label:"Entrance Fee",   value: d.entranceFee },
    { icon:"🕐", label:"Opening Hours",  value: d.operatingHours },
    { icon:"📅", label:"Best Season",    value: d.bestTimeToVisit },
    { icon:"👥", label:"Group Size",     value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize} people` : null },
    { icon:"👶", label:"Minimum Age",    value: d.minAge ? `${d.minAge}+ years` : null },
    { icon:"💪", label:"Fitness Level",  value: d.fitnessLevel },
  ].filter(x => x.value);

  const infoCards = [
    { icon:"📋", title:"What to Expect", text: d.whatToExpect, bg: T.g50,       accent: T.g700 },
    { icon:"💡", title:"Local Tips",     text: d.localTips,    bg: T.amberBg,   accent: "#92400E" },
    { icon:"⚠️", title:"Safety Info",   text: d.safetyInfo,   bg: T.redBg,     accent: T.red, span: true },
  ].filter(x => x.text);

  if (!items.length && !infoCards.length) return null;

  const cols = size.mob ? 1 : size.tab ? 2 : 3;

  return (
    <Section id="practical" bg={T.white}>
      <Container>
        <SectionTitle sub="Everything you need to plan your visit">
          Practical Information
        </SectionTitle>

        {items.length > 0 && (
          <div
            className="dd-stagger"
            style={{
              display:"grid",
              gridTemplateColumns:`repeat(${cols},1fr)`,
              gap:"clamp(14px,1.8vw,20px)",
              marginBottom: infoCards.length ? "clamp(28px,3vw,40px)" : 0,
            }}
          >
            {items.map((it, i) => (
              <div
                key={i}
                className="dd-lift"
                style={{
                  background:T.f50, borderRadius:T.rLg,
                  padding:"clamp(16px,2vw,24px)",
                  border:`1px solid ${T.f200}`,
                  display:"flex", alignItems:"center", gap:16,
                }}
              >
                <span style={{ fontSize:"clamp(26px,3vw,34px)", flexShrink:0 }}>{it.icon}</span>
                <div style={{ minWidth:0 }}>
                  <p style={{ margin:0, fontSize:11, color:T.f400, fontWeight:700, textTransform:"uppercase", letterSpacing:".4px" }}>
                    {it.label}
                  </p>
                  <p style={{ margin:"3px 0 0", fontSize:"clamp(13px,1.2vw,15px)", color:T.f800, fontWeight:700, lineHeight:1.35 }}>
                    {it.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {infoCards.length > 0 && (
          <div
            className="dd-stagger"
            style={{
              display:"grid",
              gridTemplateColumns: size.mob ? "1fr" : "repeat(2,1fr)",
              gap:"clamp(16px,2vw,24px)",
            }}
          >
            {infoCards.map((c, i) => (
              <div
                key={i}
                style={{
                  borderRadius:T.rLg, overflow:"hidden",
                  border:`1px solid ${T.f200}`,
                  gridColumn: c.span && !size.mob ? "span 2" : "span 1",
                  boxShadow:T.shSm,
                }}
              >
                <div
                  style={{
                    padding:"16px 22px", background:c.bg,
                    borderBottom:`2px solid ${c.accent}22`,
                    display:"flex", alignItems:"center", gap:10,
                  }}
                >
                  <span style={{ fontSize:20 }}>{c.icon}</span>
                  <h4 style={{ margin:0, fontSize:"clamp(14px,1.3vw,17px)", fontWeight:700, color:c.accent }}>
                    {c.title}
                  </h4>
                </div>
                <div style={{ padding:"clamp(16px,2vw,24px)", background:T.white }}>
                  <p style={{ margin:0, fontSize:"clamp(13px,1.2vw,15px)", color:T.f600, lineHeight:1.8 }}>
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
});
PracticalSection.displayName = "PracticalSection";

/* ═══════════════════════════════════════════════════
   ITINERARY
═══════════════════════════════════════════════════ */
const ItinerarySection = memo(({ d, size }) => {
  const list = d.itinerary || [];
  if (!list.length) return null;

  return (
    <Section id="itinerary" bg={T.f50}>
      <Container>
        <SectionTitle sub="Your day-by-day journey">
          Itinerary
        </SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:"clamp(16px,2vw,22px)" }}>
          {list.map((day, i) => (
            <div
              key={i}
              className="dd-lift"
              style={{
                background:T.white, borderRadius:T.rLg,
                border:`1px solid ${T.f200}`,
                overflow:"hidden",
              }}
            >
              {/* Day header */}
              <div
                style={{
                  padding:"clamp(14px,1.8vw,20px) clamp(18px,2.5vw,28px)",
                  background:`linear-gradient(135deg,${T.g50},${T.white})`,
                  borderBottom:`1px solid ${T.f200}`,
                  display:"flex", alignItems:"center", gap:16,
                }}
              >
                <div
                  style={{
                    width:"clamp(40px,5vw,52px)", height:"clamp(40px,5vw,52px)",
                    borderRadius:"50%",
                    background:`linear-gradient(135deg,${T.g500},${T.g700})`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:T.white, fontWeight:800,
                    fontSize:"clamp(14px,1.5vw,18px)", flexShrink:0,
                    boxShadow:`0 4px 12px ${T.g500}38`,
                  }}
                >
                  {day.dayNumber || i + 1}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:11, color:T.g600, fontWeight:700, textTransform:"uppercase", letterSpacing:".6px" }}>
                    Day {day.dayNumber || i + 1}
                  </p>
                  <h4 style={{ margin:"2px 0 0", fontSize:"clamp(15px,1.5vw,18px)", fontWeight:700, color:T.f800 }}>
                    {day.title}
                  </h4>
                </div>
              </div>

              {/* Day body */}
              <div style={{ padding:"clamp(16px,2.5vw,26px) clamp(18px,2.5vw,28px)" }}>
                {day.description && (
                  <p style={{ margin:"0 0 16px", fontSize:"clamp(13px,1.2vw,15px)", color:T.f600, lineHeight:1.75 }}>
                    {day.description}
                  </p>
                )}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {(day.activities || []).map((a, j) => (
                    <Badge key={j} variant="primary" size="sm" icon="✓">{a}</Badge>
                  ))}
                  {(day.meals || []).map((m, j) => (
                    <Badge key={j} variant="warning" size="sm" icon="🍽️">{m}</Badge>
                  ))}
                  {day.accommodation && (
                    <Badge variant="info" size="sm" icon="🏨">{day.accommodation}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
});
ItinerarySection.displayName = "ItinerarySection";

/* ═══════════════════════════════════════════════════
   FAQs
═══════════════════════════════════════════════════ */
const FAQSection = memo(({ d }) => {
  const [open, setOpen] = useState(null);
  const list = d.faqs || [];
  if (!list.length) return null;

  return (
    <Section id="faqs" bg={T.white}>
      <Container narrow>
        <SectionTitle sub="Common questions answered" center>
          Frequently Asked Questions
        </SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {list.map((faq, i) => (
            <div
              key={i}
              style={{
                borderRadius:T.rMd, border:`1px solid`,
                borderColor: open === i ? T.g400 : T.f200,
                overflow:"hidden", transition:"border-color .25s",
                boxShadow: open === i ? `0 4px 16px rgba(16,185,129,.1)` : "none",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width:"100%", padding:"clamp(16px,2vw,22px) clamp(18px,2.5vw,26px)",
                  background: open === i ? T.g50 : T.white,
                  border:"none", cursor:"pointer", fontFamily:T.sans,
                  display:"flex", justifyContent:"space-between",
                  alignItems:"center", gap:16,
                  transition:"background .2s",
                  textAlign:"left",
                }}
              >
                <span style={{ fontSize:"clamp(14px,1.3vw,16px)", fontWeight:700, color: open===i ? T.g800 : T.f800, lineHeight:1.4 }}>
                  {faq.question}
                </span>
                <span
                  style={{
                    width:28, height:28, borderRadius:"50%",
                    background: open===i ? T.g500 : T.f100,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color: open===i ? T.white : T.f500,
                    fontSize:16, flexShrink:0,
                    transition:"all .25s",
                    transform: open===i ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div
                  className="dd-fadeIn"
                  style={{
                    padding:"0 clamp(18px,2.5vw,26px) clamp(16px,2vw,22px)",
                    background:T.white,
                  }}
                >
                  <p style={{ margin:0, fontSize:"clamp(13px,1.2vw,15px)", color:T.f600, lineHeight:1.8 }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
});
FAQSection.displayName = "FAQSection";

/* ═══════════════════════════════════════════════════
   CTA FOOTER
═══════════════════════════════════════════════════ */
const CTAFooter = memo(({ d, navigate, size }) => (
  <section
    style={{
      background:`linear-gradient(135deg,${T.g700} 0%,${T.g900} 100%)`,
      padding:"clamp(72px,10vw,128px) 0",
      textAlign:"center", position:"relative", overflow:"hidden",
    }}
  >
    {/* Subtle pattern */}
    <div
      style={{
        position:"absolute", inset:0, opacity:.05,
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents:"none",
      }}
    />

    {/* Floating rings */}
    {[
      { size:140, top:"12%", left:"6%",  delay:"0s"   },
      { size:90,  top:"65%", right:"8%", delay:"1.8s" },
      { size:60,  top:"35%", right:"15%",delay:"0.9s" },
    ].map((r, i) => (
      <div
        key={i}
        style={{
          position:"absolute", width:r.size, height:r.size,
          borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.07)",
          top:r.top, left:r.left, right:r.right,
          animation:`dd-float 4s ease-in-out ${r.delay} infinite`,
          pointerEvents:"none",
        }}
      />
    ))}

    <Container style={{ position:"relative" }}>
      {/* Globe */}
      <div style={{ fontSize:"clamp(44px,6vw,64px)", marginBottom:24, animation:"dd-float 3.5s ease-in-out infinite" }}>
        🌍
      </div>

      <h2
        style={{
          fontFamily:T.serif,
          fontSize:"clamp(28px,4.5vw,56px)",
          fontWeight:800, color:T.white,
          margin:"0 0 18px", lineHeight:1.12,
          letterSpacing:"-0.02em",
        }}
      >
        Ready to Experience<br />{d.name}?
      </h2>

      <p
        style={{
          fontSize:"clamp(15px,1.6vw,20px)",
          color:"rgba(255,255,255,.8)",
          maxWidth:560, margin:"0 auto 44px",
          lineHeight:1.7,
        }}
      >
        Start planning your unforgettable adventure today. Create memories that will last a lifetime.
      </p>

      {/* CTA buttons */}
      <div style={{ display:"flex", gap:"clamp(10px,2vw,18px)", justifyContent:"center", flexWrap:"wrap", marginBottom:56 }}>
        <button
          onClick={() => navigate("/booking")}
          style={{
            padding:"clamp(14px,1.8vw,18px) clamp(28px,4vw,44px)",
            background:T.white, color:T.g800,
            border:"none", borderRadius:T.rMd,
            fontSize:"clamp(14px,1.4vw,17px)", fontWeight:800,
            cursor:"pointer", fontFamily:T.sans,
            boxShadow:T.shLg, transition:"all .25s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=T.shXl; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=T.shLg; }}
        >
          📅 Book This Experience
        </button>

        {(d.countrySlug || d.country?.slug) && (
          <Link
            to={`/country/${d.countrySlug || d.country?.slug}`}
            style={{
              padding:"clamp(14px,1.8vw,18px) clamp(28px,4vw,44px)",
              background:"transparent", color:T.white,
              border:"2px solid rgba(255,255,255,.3)",
              borderRadius:T.rMd, fontSize:"clamp(14px,1.4vw,17px)",
              fontWeight:700, cursor:"pointer", fontFamily:T.sans,
              textDecoration:"none", display:"inline-flex",
              alignItems:"center", transition:"all .25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.1)"; e.currentTarget.style.borderColor="rgba(255,255,255,.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent";           e.currentTarget.style.borderColor="rgba(255,255,255,.3)"; }}
          >
            Explore {d.countryName || d.country?.name} →
          </Link>
        )}
      </div>

      {/* Trust signals */}
      <div style={{ display:"flex", justifyContent:"center", gap:"clamp(24px,5vw,64px)", flexWrap:"wrap" }}>
        {[
          { icon:"🏆", text:"Top Rated"   },
          { icon:"✅", text:"Verified"    },
          { icon:"🔒", text:"Secure"      },
          { icon:"💬", text:"24/7 Support"},
        ].map((t, i) => (
          <div key={i} style={{ textAlign:"center", color:"rgba(255,255,255,.7)" }}>
            <div style={{ fontSize:"clamp(24px,3vw,32px)", marginBottom:6 }}>{t.icon}</div>
            <div style={{ fontSize:"clamp(11px,1vw,13px)", fontWeight:700, letterSpacing:".4px" }}>{t.text}</div>
          </div>
        ))}
      </div>
    </Container>
  </section>
));
CTAFooter.displayName = "CTAFooter";

/* ═══════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate = useNavigate();
  const size = useWindowSize();

  const { destination, loading, error } = useDestination(identifier);

  // Inject styles once
  useEffect(() => { injectGlobalStyles(); }, []);

  // Scroll to top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [identifier]);

  if (loading) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <FullPageSkeleton mob={size.mob} />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div style={{ fontFamily: T.sans }}>
        <ErrorState error={error} navigate={navigate} />
      </div>
    );
  }

  const d = destination;

  return (
    <div
      style={{
        fontFamily: T.sans,
        color: T.f800,
        background: T.white,
        overflowX: "hidden",
      }}
    >
      <Hero             d={d} size={size} />
      <QuickInfoBar     d={d} size={size} />
      <OverviewSection  d={d} size={size} navigate={navigate} />
      <HighlightsSection d={d} size={size} />
      <ActivitiesSection d={d} size={size} />
      <WildlifeSection   d={d} />
      <GallerySection    d={d} size={size} />
      <ItinerarySection  d={d} size={size} />
      <LocationSection   d={d} size={size} />
      <PracticalSection  d={d} size={size} />
      <FAQSection        d={d} />
      <CTAFooter         d={d} size={size} navigate={navigate} />
    </div>
  );
};

export default DestinationDetail;