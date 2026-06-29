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
import { api } from "../utils/api";
import MiniVideoPlayer from "../components/common/MiniVideoPlayer";
import "./DestinationDetail.css";

/* ─── ICON PATHS ──────────────────────────────────────── */
const P = {
  clock:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5H11v6l5.2 3.2.8-1.2-4.5-2.7V7z",
  star:"M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  calendar:"M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  mapPin:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  globe:"M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  compass:"M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 5.8l-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z",
  camera:"M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:"M18 6L6 18M6 6l12 12",
  chevronLeft:"M15 18l-6-6 6-6",
  chevronRight:"M9 18l6-6-6-6",
  chevronDown:"M6 9l6 6 6-6",
  chevronUp:"M18 15l-6-6-6 6",
  plus:"M12 5v14M5 12h14",
  minus:"M5 12h14",
  check:"M20 6L9 17l-5-5",
  checkCircle:"M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  headphones:"M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z",
  award:"M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  messageCircle:"M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z",
  arrowDown:"M12 5v14M19 12l-7 7-7-7",
  arrowRight:"M5 12h14M12 5l7 7-7 7",
  arrowUp:"M12 19V5M5 12l7-7 7 7",
  sparkles:"M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  alertTriangle:"M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4m0 4h.01",
  lightbulb:"M9 21h6m-3-18a6 6 0 00-4 10.5V17a1 1 0 001 1h6a1 1 0 001-1v-3.5A6 6 0 0012 3z",
  backpack:"M4 10l-.3 8.2A2 2 0 005.7 20h12.7a2 2 0 002-1.8L20 10M4 10h16M4 10l1-6h14l1 6",
  ticket:"M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z",
  map:"M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  barChart:"M18 20V10M12 20V4M6 20v-6",
  zoomIn:"M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3M11 8v6m-3-3h6",
  grid:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  list:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  maximize:"M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
  car:"M16 3h-2l-2 3H5a2 2 0 00-2 2v7a2 2 0 002 2h1m10 0h3a2 2 0 002-2V8a2 2 0 00-2-2h-2l-1-3z",
  flag:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  heart:"M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z",
  externalLink:"M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3",
  send:"M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  search:"M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3",
  loader:"M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
  sunrise:"M17 18a5 5 0 10-10 0m5-11v7M4.2 10.2l1.4 1.4M1 18h2m18 0h2M18.4 11.6l1.4-1.4M23 22H1",
  moon:"M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  fish:"M6.5 12c.9-3.5 4.9-6 8.5-6s6.1 2.5 7 6c-.9 3.5-3.4 6-7 6s-7.6-2.5-8.5-6z",
  mountain:"M8 3l4 8 5-5 5 15H2L8 3z",
  waves:"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1",
  ship:"M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M19.4 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.9.9 5.3 2.8 7.8",
  bird:"M16 7h.01M3.4 18H12a8 8 0 008-8V7a4 4 0 00-7.3-2.3L2 20",
  trees:"M10 10v11m0-11L8 4l-2 6m4 0l2-6m8 4v11m0-11l-2-4-2 4m4 0l2-4",
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  utensils:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20m14-7V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  pawPrint:"M12 10a2 2 0 100 4 2 2 0 000-4zM5 14a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM8 6a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
  binoculars:"M21 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5h4",
  footprints:"M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5 10 7.9 8 9 8 11v5",
  route:"M3 7h2.6c.3 0 .5.1.7.3l2.4 2.4c.2.2.5.3.7.3h3.2c.3 0 .5-.1.7-.3l2.4-2.4c.2-.2.4-.3.7-.3H21",
  snowflake:"M12 2v20m5.7-16.3L12 12M6.3 6.3L12 12m10 0H2m15.7 5.7L12 12M6.3 17.7L12 12",
  calendarCheck:"M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  creditCard:"M1 4h22v16H1zM1 10h22",
  info:"M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  coffee:"M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  thermometer:"M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  droplet:"M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
};

const Icon = ({ name, size = 20, className = "", style = {}, sw = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={`dd-i ${className}`} style={style} aria-hidden="true">
    <path d={P[name] || P.compass} />
  </svg>
);

/* ─── SCROLL CONTEXT ──────────────────────────────────── */
const ScrollCtx = createContext(0);
const ScrollProvider = ({ children }) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <ScrollCtx.Provider value={p}>{children}</ScrollCtx.Provider>;
};

/* ─── HOOKS ───────────────────────────────────────────── */
const useScreen = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { w, mob: w < 640, tab: w >= 640 && w < 1024, desk: w >= 1024 };
};

const useInView = (opts = {}) => {
  const { threshold = 0.08, rootMargin = "0px 0px -40px 0px", once = true } = opts;
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); if (once) obs.disconnect(); }
      else if (!once) setVis(false);
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, vis];
};

/* ─── ANIMATION ───────────────────────────────────────── */
const Reveal = ({ children, from = "bottom", delay = 0, distance = 36, className = "" }) => {
  const [ref, vis] = useInView();
  const tx = {
    bottom: `translateY(${distance}px)`,
    top: `translateY(-${distance}px)`,
    left: `translateX(-${distance}px)`,
    right: `translateX(${distance}px)`,
    scale: `scale(0.93) translateY(14px)`,
    none: "none",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : (tx[from] || tx.bottom),
      transition: `opacity 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms,transform 0.6s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      willChange: "opacity,transform",
    }}>
      {children}
    </div>
  );
};

/* ─── CONSTANTS ───────────────────────────────────────── */
const ACT_ICONS = {
  "Game drives":"car","Hot air balloon safari":"sunrise","Bush walks":"footprints",
  "Cultural village visits":"home","Bird watching":"bird","Photography safaris":"camera",
  "Night game drives":"moon","Bush breakfast":"utensils","Hiking":"mountain",
  "Snorkeling":"waves","Swimming":"waves","Boat safari":"ship","Camel riding":"compass",
  "Gorilla trekking":"binoculars","Chimpanzee tracking":"binoculars",
  "Nile boat safari":"ship","Waterfall hike":"waves","Sport fishing":"fish",
  "Great Migration viewing":"binoculars","Mara River crossing watching":"eye",
  "Maasai village cultural visit":"home","Sundowner bush dinners":"sunrise",
  "Nature walks":"trees","Mountain trekking":"mountain","Camping":"flag",
};

const PHASE = {
  "before-travel":{ color:"#166534", bg:"#f0fdf4", label:"Before Travel" },
  "on-arrival":{ color:"#14532d", bg:"#dcfce7", label:"On Arrival" },
  "during-stay":{ color:"#065f46", bg:"#d1fae5", label:"During Stay" },
  departure:{ color:"#374151", bg:"#f9fafb", label:"Departure" },
};

/* ─── PROGRESS BAR ────────────────────────────────────── */
const ProgressBar = () => {
  const p = useContext(ScrollCtx);
  return (
    <div className="dp">
      <div className="dp__bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
};

/* ─── SKELETON ────────────────────────────────────────── */
const Bone = ({ h = 16, w = "100%", r = 8 }) => (
  <div className="d-bone" style={{ height: h, width: w, borderRadius: r }} />
);
const SkeletonPage = () => (
  <div className="d-page">
    <div className="d-skel-hero" />
    <div className="d-wrap" style={{ paddingTop: 56 }}>
      <div className="d-skel-row">{[1,2,3,4].map(i => <Bone key={i} h={90} r={16} />)}</div>
      <div style={{ maxWidth: 600, marginTop: 48 }}>
        <Bone w={220} h={32} /><div style={{ height: 14 }} />
        <Bone w="80%" h={14} /><div style={{ height: 8 }} /><Bone w="60%" h={14} />
      </div>
    </div>
  </div>
);

/* ─── ERROR ───────────────────────────────────────────── */
const ErrorPage = ({ error, navigate }) => (
  <div className="d-error">
    <div className="d-error__glow" />
    <div className="d-error__circle"><Icon name="map" size={48} /></div>
    <h2>Destination Not Found</h2>
    <p>{error || "This destination doesn't exist or may have been removed."}</p>
    <div className="d-error__btns">
      <button className="d-btn d-btn--ghost" onClick={() => navigate(-1)}>
        <Icon name="chevronLeft" size={14} /> Go Back
      </button>
      <button className="d-btn d-btn--solid" onClick={() => navigate("/destinations")}>
        Browse All
      </button>
    </div>
  </div>
);

/* ─── TAG ─────────────────────────────────────────────── */
const Tag = ({ text }) => <span className="d-stag">{text}</span>;

/* ─── SECTION HEADING ─────────────────────────────────── */
const SecHead = ({ tag, title, sub, center = false, light = false }) => {
  const [ref, vis] = useInView({ threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={`d-sh ${center ? "d-sh--c" : ""} ${light ? "d-sh--light" : ""}`}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(24px)",
        transition: "all .6s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <h2 className="d-sh__t">{title}</h2>
      {sub && <p className="d-sh__s">{sub}</p>}
      <div className="d-sh__bar" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
const Hero = ({ d, navigate }) => {
  const allImgs = useMemo(() =>
    [d.heroImage, d.imageUrl, ...(d.images || []),
     ...(d.gallery || []).map(g => g.imageUrl)].filter(Boolean)
  , [d]);
  const slides = useMemo(() => [...new Set(allImgs)].slice(0, 7), [allImgs]);
  const [idx, setIdx] = useState(0);
  const [rdy, setRdy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setRdy(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (slides.length <= 1) return;
    const iv = setInterval(() => setIdx(p => (p + 1) % slides.length), 6500);
    return () => clearInterval(iv);
  }, [slides.length]);

  const stats = [
    d.durationDays && { val: d.durationDays, label: "Days" },
    (d.wildlife || []).length > 0 && { val: `${(d.wildlife || []).length}+`, label: "Species" },
    (d.activities || []).length > 0 && { val: `${(d.activities || []).length}+`, label: "Activities" },
    d.rating && { val: d.rating.toFixed(1), label: "Rating" },
  ].filter(Boolean);

  return (
    <header className={`d-hero ${rdy ? "d-hero--rdy" : ""}`}>
      {/* Slides */}
      <div className="d-hero__slides" aria-hidden="true">
        {slides.length > 0 ? slides.map((src, i) => (
          <div key={i} className={`d-hero__slide ${idx === i ? "active" : ""}`}>
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        )) : (
          <div className="d-hero__slide d-hero__slide--empty active">
            <Icon name="mountain" size={120} style={{ opacity: 0.06 }} />
          </div>
        )}
      </div>
      <div className="d-hero__ov" />

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="d-hero__dots">
          {slides.map((_, i) => (
            <button key={i} className={`d-hero__dot ${idx === i ? "on" : ""}`}
              onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="d-hero__nav" aria-label="Breadcrumb">
        <div className="d-wrap">
          <ol className="d-hero__crumbs">
            <li><Link to="/destinations">Destinations</Link></li>
            {(d.country?.name) && (
              <li>
                <Link to={`/country/${d.countrySlug || d.country?.slug}`}>
                  {d.country?.flag && <span>{d.country.flag} </span>}
                  {d.country.name}
                </Link>
              </li>
            )}
            <li aria-current="page">{d.name}</li>
          </ol>
        </div>
      </nav>

      {/* Body */}
      <div className="d-wrap d-hero__body">
        {d.country?.name && (
          <Reveal from="bottom" delay={80}>
            <div className="d-hero__loc">
              {d.country?.flag && <span>{d.country.flag}</span>}
              <span>{d.country.name.toUpperCase()}</span>
            </div>
          </Reveal>
        )}
        <Reveal from="bottom" delay={250}>
          <h1 className="d-hero__title">{(d.name || "").toUpperCase()}</h1>
        </Reveal>
        {d.tagline && (
          <Reveal from="bottom" delay={420}>
            <p className="d-hero__sub">{d.tagline}</p>
          </Reveal>
        )}
        <Reveal from="bottom" delay={580}>
          <div className="d-hero__ctas">
            <button
              className="d-btn d-btn--emerald d-btn--lg"
              onClick={() => navigate(`/booking?destination=${d.slug}`)}
            >
              <Icon name="calendarCheck" size={16} /> Book This Destination
            </button>
            <button className="d-btn d-btn--white d-btn--lg"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              Explore <Icon name="arrowDown" size={14} />
            </button>
            <button className="d-btn d-btn--glass d-btn--lg"
              onClick={() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" })}>
              Plan Your Trip
            </button>
          </div>
        </Reveal>
        {stats.length > 0 && (
          <Reveal from="bottom" delay={750}>
            <div className="d-hero__stats">
              {stats.map((s, i) => (
                <div key={i} className="d-hero__stat">
                  <div className="d-hero__stat-n">{s.val}</div>
                  <div className="d-hero__stat-l">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>

      <div className="d-hero__scroll">
        <span>SCROLL</span>
        <Icon name="chevronDown" size={20} className="d-hero__bounce" />
      </div>
    </header>
  );
};

/* ═══════════════════════════════════════════════════════════
   ABOUT — aside with slideshow + rich details card
═══════════════════════════════════════════════════════════ */
const AboutSec = ({ d }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  /* ── Aside slideshow images ── */
  const asideImgs = useMemo(() => {
    const all = [
      d.heroImage, d.imageUrl,
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images || []),
    ].filter(Boolean);
    return [...new Set(all)].slice(0, 10);
  }, [d]);

  const [sIdx, setSIdx] = useState(0);
  useEffect(() => {
    if (asideImgs.length <= 1) return;
    const iv = setInterval(() => setSIdx(p => (p + 1) % asideImgs.length), 4200);
    return () => clearInterval(iv);
  }, [asideImgs.length]);

  const goSlide = dir => {
    setSIdx(p =>
      dir === "p"
        ? (p - 1 + asideImgs.length) % asideImgs.length
        : (p + 1) % asideImgs.length
    );
  };

  /* ── Details items ── */
  const detailItems = [
    d.country?.name && {
      icon: "mapPin", label: "LOCATED IN",
      val: `${d.country?.flag || ""} ${d.country.name}`.trim(),
      link: `/country/${d.countrySlug || d.country?.slug}`,
    },
    d.duration && { icon: "clock", label: "DURATION", val: d.duration },
    d.difficulty && { icon: "barChart", label: "DIFFICULTY", val: d.difficulty },
    d.bestTimeToVisit && { icon: "calendar", label: "BEST SEASON", val: d.bestTimeToVisit },
    d.rating && { icon: "star", label: "RATING", val: `${d.rating.toFixed(1)} / 5` },
    (d.minGroupSize && d.maxGroupSize) && {
      icon: "users", label: "GROUP SIZE", val: `${d.minGroupSize} – ${d.maxGroupSize}`,
    },
  ].filter(Boolean);

  return (
    <section id="about" className="d-sec d-sec--leaf">
      <div className="d-wrap">
        <div className="d-about">
          {/* Main */}
          <div className="d-about__main">
            {d.destinationType && <Tag text={d.destinationType} />}
            <Reveal from="left">
              <h2 className="d-about__title">
                {d.overview
                  ? d.overview.slice(0, 90).split(" ").slice(0, -1).join(" ")
                  : `Discover ${d.name}`}
              </h2>
            </Reveal>
            {desc && (
              <Reveal from="left" delay={100}>
                <div className="d-prose">
                  {desc.split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </Reveal>
            )}
            {detailItems.length > 0 && (
              <Reveal from="bottom" delay={200}>
                <div className="d-about__stats-grid">
                  {detailItems.map((s, i) => (
                    <div key={i} className="d-about__stat-card">
                      <div className="d-about__stat-icon">
                        <Icon name={s.icon} size={16} />
                      </div>
                      <span className="d-about__stat-l">{s.label}</span>
                      {s.link
                        ? <Link to={s.link} className="d-about__stat-v d-about__stat-link">{s.val}</Link>
                        : <span className="d-about__stat-v">{s.val}</span>
                      }
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
            {/* Book CTA inline */}
            <Reveal from="bottom" delay={300}>
              <div className="d-about__book-row">
                <button
                  className="d-btn d-btn--emerald"
                  onClick={() => {
                    const el = document.getElementById("book-cta");
                    el ? el.scrollIntoView({ behavior: "smooth" }) : window.location.assign(`/booking?destination=${d.slug}`);
                  }}
                >
                  <Icon name="calendarCheck" size={15} /> Reserve Your Spot
                </button>
                <button
                  className="d-btn d-btn--outline"
                  onClick={() => document.getElementById("ai-search")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Icon name="messageCircle" size={15} /> Ask a Question
                </button>
              </div>
            </Reveal>
          </div>

          {/* Aside */}
          <aside className="d-about__aside">
            {/* Slideshow */}
            {asideImgs.length > 0 && (
              <Reveal from="right" delay={80}>
                <div className="d-aside-slider">
                  <div className="d-aside-slider__track">
                    {asideImgs.map((src, i) => (
                      <div
                        key={i}
                        className={`d-aside-slider__slide ${sIdx === i ? "active" : sIdx > i ? "was" : "will"}`}
                      >
                        <img src={src} alt={`${d.name} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
                      </div>
                    ))}
                  </div>
                  {asideImgs.length > 1 && (
                    <>
                      <button className="d-aside-slider__arr d-aside-slider__arr--p" onClick={() => goSlide("p")} aria-label="Previous">
                        <Icon name="chevronLeft" size={15} />
                      </button>
                      <button className="d-aside-slider__arr d-aside-slider__arr--n" onClick={() => goSlide("n")} aria-label="Next">
                        <Icon name="chevronRight" size={15} />
                      </button>
                      <div className="d-aside-slider__dots">
                        {asideImgs.map((_, i) => (
                          <button
                            key={i}
                            className={`d-aside-slider__dot ${sIdx === i ? "on" : ""}`}
                            onClick={() => setSIdx(i)}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="d-aside-slider__counter">
                        {sIdx + 1} / {asideImgs.length}
                      </div>
                    </>
                  )}
                </div>
              </Reveal>
            )}

            {/* Details card */}
            <Reveal from="right" delay={180}>
              <div className="d-aside-details">
                <div className="d-aside-details__hdr">
                  {d.country?.flag && (
                    <span className="d-aside-details__flag">{d.country.flag}</span>
                  )}
                  <div>
                    <span className="d-aside-details__sub">Located in</span>
                    <span className="d-aside-details__country">{d.country?.name || d.name}</span>
                  </div>
                </div>
                <ul className="d-aside-details__list">
                  {detailItems.map((it, i) => (
                    <li key={i} className="d-aside-details__item">
                      <span className="d-aside-details__item-icon">
                        <Icon name={it.icon} size={14} />
                      </span>
                      <span className="d-aside-details__item-label">{it.label}</span>
                      {it.link
                        ? <Link to={it.link} className="d-aside-details__item-val d-aside-details__item-link">{it.val}</Link>
                        : <span className="d-aside-details__item-val">{it.val}</span>
                      }
                    </li>
                  ))}
                </ul>
                <div className="d-aside-details__foot">
                  <button
                    className="d-btn d-btn--emerald d-btn--full"
                    onClick={() => window.location.assign(`/booking?destination=${d.slug}`)}
                  >
                    <Icon name="calendarCheck" size={15} /> Book Now
                  </button>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   HIGHLIGHTS — image-only cards, info on hover
═══════════════════════════════════════════════════════════ */
const HighlightsSec = ({ d }) => {
  const list = d.highlights || [];
  const activities = d.activities || [];
  if (!list.length && !activities.length) return null;

  const imgPool = useMemo(() => {
    const all = [
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images || []),
      d.heroImage, d.imageUrl,
    ].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  const items = [
    ...list.map((h, i) => ({
      text: h,
      img: imgPool[i % Math.max(imgPool.length, 1)] || null,
      label: "Highlight",
      icon: "sparkles",
      desc: `Experience the wonder of ${h} on your ${d.name} adventure.`,
    })),
    ...activities.map((act, i) => ({
      text: act,
      img: imgPool[(list.length + i) % Math.max(imgPool.length, 1)] || null,
      label: "Activity",
      icon: ACT_ICONS[act] || "compass",
      desc: `Join expert guides for an unforgettable ${act} experience at ${d.name}.`,
    })),
  ];

  return (
    <section id="highlights" className="d-sec d-sec--soft">
      <div className="d-wrap">
        <SecHead
          tag="SIGNATURE EXPERIENCES"
          title={`What Makes ${d.name} Unforgettable`}
          sub="Hover each card to discover more"
          center
        />
        <div className="d-exp-grid">
          {items.slice(0, 9).map((item, i) => (
            <Reveal key={i} from="scale" delay={i * 55}>
              <div className="d-exp-card">
                <div className="d-exp-card__media">
                  {item.img
                    ? <img src={item.img} alt={item.text} loading="lazy" />
                    : <div className="d-exp-card__placeholder"><Icon name={item.icon} size={42} /></div>
                  }
                  {/* Hover overlay — always rendered, shown via CSS */}
                  <div className="d-exp-card__overlay">
                    <span className="d-exp-card__ov-tag">{item.label}</span>
                    <h3 className="d-exp-card__ov-title">{item.text}</h3>
                    <p className="d-exp-card__ov-desc">{item.desc}</p>
                    <div className="d-exp-card__ov-icon">
                      <Icon name={item.icon} size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   WILDLIFE — image cards, name on hover
═══════════════════════════════════════════════════════════ */
const WildlifeSec = ({ d }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;

  const imgPool = useMemo(() => {
    const all = [
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images || []),
      d.heroImage, d.imageUrl,
    ].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  return (
    <section id="wildlife" className="d-sec d-sec--dark">
      <div className="d-wrap">
        <SecHead
          tag="WILDLIFE"
          title={`Species at ${d.name}`}
          sub="Hover each card to reveal the species"
          center
          light
        />
        <div className="d-wildlife-grid">
          {list.map((animal, i) => (
            <Reveal key={i} from="scale" delay={i * 45}>
              <div className="d-wildlife-card">
                <img
                  src={imgPool[i % Math.max(imgPool.length, 1)] || `https://source.unsplash.com/400x400/?${encodeURIComponent(animal)},wildlife`}
                  alt={animal}
                  loading="lazy"
                />
                <div className="d-wildlife-card__ov">
                  <span>{animal}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   DESTINATION DEEP-DIVE — rich text between Wildlife & Gallery
═══════════════════════════════════════════════════════════ */
const DeepDiveSec = ({ d }) => {
  /* Build rich content from every available field */
  const hasAny = d.overview || d.description || d.whatToExpect
    || d.gettingThere || d.bestTimeToVisit
    || (d.highlights?.length) || (d.activities?.length)
    || d.practicalInfo;

  if (!hasAny) return null;

  const pi = d.practicalInfo;
  const climate = pi?.climate;
  const packing = pi?.packing;
  const health  = pi?.healthAndSafety;
  const permits = pi?.permitsAndRegulations;

  /* Highlights split into 2 cols for ordered list display */
  const highlights = d.highlights || [];
  const activities = d.activities || [];

  return (
    <section className="d-sec d-sec--white d-deepdive">
      <div className="d-wrap">
        <SecHead
          tag="DESTINATION GUIDE"
          title={`Everything About ${d.name}`}
          sub="A comprehensive guide to help you plan, prepare and experience this destination to the fullest"
          center
        />

        <div className="d-deepdive__grid">
          {/* ── Overview ── */}
          {(d.overview || d.description) && (
            <Reveal from="left">
              <div className="d-deepdive__block d-deepdive__block--full">
                <div className="d-deepdive__block-icon"><Icon name="globe" size={20} /></div>
                <h3>Overview</h3>
                <div className="d-deepdive__prose">
                  {(d.overview || d.description).split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── What to Expect ── */}
          {d.whatToExpect && (
            <Reveal from="left" delay={60}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="eye" size={20} /></div>
                <h3>What to Expect</h3>
                <div className="d-deepdive__prose">
                  {d.whatToExpect.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── Best Time / Climate ── */}
          {(d.bestTimeToVisit || climate) && (
            <Reveal from="right" delay={60}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="thermometer" size={20} /></div>
                <h3>Climate & Best Time to Visit</h3>
                {d.bestTimeToVisit && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="calendar" size={15} />
                    <strong>Best Season:</strong> {d.bestTimeToVisit}
                  </div>
                )}
                {climate?.climateNotes && <p className="d-deepdive__para">{climate.climateNotes}</p>}
                {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                  <div className="d-deepdive__temp-row">
                    {climate.avgTempLowC != null && (
                      <div className="d-deepdive__temp-chip d-deepdive__temp-chip--low">
                        <Icon name="snowflake" size={13} />
                        Low: {climate.avgTempLowC}°C
                      </div>
                    )}
                    {climate.avgTempHighC != null && (
                      <div className="d-deepdive__temp-chip d-deepdive__temp-chip--high">
                        <Icon name="droplet" size={13} />
                        High: {climate.avgTempHighC}°C
                      </div>
                    )}
                  </div>
                )}
                {climate?.bestMonths?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Best months to visit:</p>
                    <ul className="d-deepdive__pill-list">
                      {climate.bestMonths.map((m, i) => (
                        <li key={i} className="d-deepdive__pill d-deepdive__pill--green">{m}</li>
                      ))}
                    </ul>
                  </>
                )}
                {climate?.avoidMonths?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Months to avoid:</p>
                    <ul className="d-deepdive__pill-list">
                      {climate.avoidMonths.map((m, i) => (
                        <li key={i} className="d-deepdive__pill d-deepdive__pill--red">{m}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          )}

          {/* ── Highlights ordered list ── */}
          {highlights.length > 0 && (
            <Reveal from="left" delay={80}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="sparkles" size={20} /></div>
                <h3>Key Highlights</h3>
                <ol className="d-deepdive__ol">
                  {highlights.map((h, i) => (
                    <li key={i}>
                      <span className="d-deepdive__ol-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}

          {/* ── Activities unordered ── */}
          {activities.length > 0 && (
            <Reveal from="right" delay={80}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="compass" size={20} /></div>
                <h3>Available Activities</h3>
                <ul className="d-deepdive__ul">
                  {activities.map((act, i) => (
                    <li key={i}>
                      <Icon name={ACT_ICONS[act] || "check"} size={14} />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* ── Getting There ── */}
          {(d.gettingThere || d.howToGetThere?.generalInfo) && (
            <Reveal from="left" delay={100}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="plane" size={20} /></div>
                <h3>Getting There</h3>
                <div className="d-deepdive__prose">
                  {(d.gettingThere || d.howToGetThere?.generalInfo)
                    .split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
                  }
                </div>
                {d.howToGetThere?.nearestAirport && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="mapPin" size={14} />
                    <span><strong>Nearest Airport:</strong> {d.howToGetThere.nearestAirport}</span>
                  </div>
                )}
                {d.howToGetThere?.driveTimeFromCapital && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="car" size={14} />
                    <span><strong>Drive time:</strong> {d.howToGetThere.driveTimeFromCapital}</span>
                  </div>
                )}
                {d.howToGetThere?.transportOptions?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Transport options:</p>
                    <ul className="d-deepdive__ul">
                      {d.howToGetThere.transportOptions.map((t, i) => (
                        <li key={i}><Icon name="route" size={13} /><span>{t}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          )}

          {/* ── Health & Safety ── */}
          {(health?.vaccinationsRequired?.length || health?.malariaRisk || health?.safetyNotes) && (
            <Reveal from="right" delay={100}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon d-deepdive__block-icon--red">
                  <Icon name="shield" size={20} />
                </div>
                <h3>Health & Safety</h3>
                {health.malariaRisk && (
                  <div className="d-deepdive__alert d-deepdive__alert--warn">
                    <Icon name="alertTriangle" size={15} />
                    <span>Malaria risk: <strong>{health.malariaRisk}</strong></span>
                  </div>
                )}
                {health.safetyNotes && <p className="d-deepdive__para">{health.safetyNotes}</p>}
                {health.vaccinationsRequired?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Vaccinations required:</p>
                    <ul className="d-deepdive__ul">
                      {health.vaccinationsRequired.map((v, i) => (
                        <li key={i}><Icon name="checkCircle" size={14} /><span>{v}</span></li>
                      ))}
                    </ul>
                  </>
                )}
                {health.vaccinationsRecommended?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Recommended:</p>
                    <ul className="d-deepdive__ul">
                      {health.vaccinationsRecommended.map((v, i) => (
                        <li key={i}><Icon name="check" size={14} /><span>{v}</span></li>
                      ))}
                    </ul>
                  </>
                )}
                {health.waterSafety && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="droplet" size={14} />
                    <span>{health.waterSafety}</span>
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* ── Packing ── */}
          {(packing?.essentials?.length || packing?.clothingTips || packing?.gearRecommendations?.length) && (
            <Reveal from="left" delay={120}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="backpack" size={20} /></div>
                <h3>What to Pack</h3>
                {packing.clothingTips && <p className="d-deepdive__para">{packing.clothingTips}</p>}
                {packing.essentials?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Essentials:</p>
                    <ul className="d-deepdive__ul d-deepdive__ul--cols">
                      {packing.essentials.map((item, i) => (
                        <li key={i}><Icon name="check" size={13} /><span>{item}</span></li>
                      ))}
                    </ul>
                  </>
                )}
                {packing.gearRecommendations?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Recommended gear:</p>
                    <ul className="d-deepdive__ul">
                      {packing.gearRecommendations.map((g, i) => (
                        <li key={i}><Icon name="check" size={13} /><span>{g}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          )}

          {/* ── Permits ── */}
          {permits?.permitsRequired?.length > 0 && (
            <Reveal from="right" delay={120}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="ticket" size={20} /></div>
                <h3>Permits & Regulations</h3>
                {permits.bookingLeadTime && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="calendar" size={14} />
                    <span><strong>Book in advance:</strong> {permits.bookingLeadTime}</span>
                  </div>
                )}
                <ul className="d-deepdive__ul">
                  {permits.permitsRequired.map((p, i) => (
                    <li key={i}><Icon name="checkCircle" size={14} /><span>{p}</span></li>
                  ))}
                </ul>
                {permits.permitCost && (
                  <p className="d-deepdive__para">
                    <Icon name="creditCard" size={13} style={{ display:"inline",marginRight:5 }} />
                    Permit cost: <strong>{permits.permitCost}</strong>
                  </p>
                )}
                {permits.visitorLimits && (
                  <div className="d-deepdive__alert d-deepdive__alert--info">
                    <Icon name="info" size={14} />
                    <span>Visitor limit: {permits.visitorLimits}</span>
                  </div>
                )}
                {permits.regulations && <p className="d-deepdive__para">{permits.regulations}</p>}
              </div>
            </Reveal>
          )}

          {/* ── Budget ── */}
          {(pi?.budget?.rangeUsd || pi?.budget?.entranceFeeUsd || pi?.budget?.guideCostUsd) && (
            <Reveal from="left" delay={140}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="creditCard" size={20} /></div>
                <h3>Budget Guide (USD)</h3>
                <div className="d-deepdive__budget-grid">
                  {pi.budget.rangeUsd && (
                    <div className="d-deepdive__budget-item">
                      <span className="d-deepdive__budget-label">Budget Range</span>
                      <span className="d-deepdive__budget-val">{pi.budget.rangeUsd}</span>
                    </div>
                  )}
                  {pi.budget.entranceFeeUsd && (
                    <div className="d-deepdive__budget-item">
                      <span className="d-deepdive__budget-label">Entrance Fee</span>
                      <span className="d-deepdive__budget-val">{pi.budget.entranceFeeUsd}</span>
                    </div>
                  )}
                  {pi.budget.guideCostUsd && (
                    <div className="d-deepdive__budget-item">
                      <span className="d-deepdive__budget-label">Guide Cost</span>
                      <span className="d-deepdive__budget-val">{pi.budget.guideCostUsd}</span>
                    </div>
                  )}
                  {pi.budget.mealCostRange && (
                    <div className="d-deepdive__budget-item">
                      <span className="d-deepdive__budget-label">Meals</span>
                      <span className="d-deepdive__budget-val">{pi.budget.mealCostRange}</span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── Culture & Etiquette ── */}
          {(pi?.culture?.localEtiquette?.length || pi?.culture?.tippingCulture || pi?.culture?.photographyRules) && (
            <Reveal from="right" delay={140}>
              <div className="d-deepdive__block">
                <div className="d-deepdive__block-icon"><Icon name="coffee" size={20} /></div>
                <h3>Culture & Etiquette</h3>
                {pi.culture.tippingCulture && (
                  <p className="d-deepdive__para"><strong>Tipping:</strong> {pi.culture.tippingCulture}</p>
                )}
                {pi.culture.photographyRules && (
                  <div className="d-deepdive__highlight-box">
                    <Icon name="camera" size={14} />
                    <span>{pi.culture.photographyRules}</span>
                  </div>
                )}
                {pi.culture.localEtiquette?.length > 0 && (
                  <>
                    <p className="d-deepdive__sub-label">Local etiquette:</p>
                    <ul className="d-deepdive__ul">
                      {pi.culture.localEtiquette.map((e, i) => (
                        <li key={i}><Icon name="check" size={13} /><span>{e}</span></li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Reveal>
          )}
        </div>

        {/* ── Book CTA inside deep dive ── */}
        <Reveal from="bottom" delay={200}>
          <div id="book-cta" className="d-deepdive__book-cta">
            <div className="d-deepdive__book-cta__text">
              <h3>Ready to experience {d.name}?</h3>
              <p>Book today and secure your spot. Limited availability.</p>
            </div>
            <Link
              to={`/booking?destination=${d.slug}`}
              className="d-btn d-btn--emerald d-btn--lg"
            >
              <Icon name="calendarCheck" size={16} /> Book This Destination
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   GALLERY
═══════════════════════════════════════════════════════════ */
const GallerySec = ({ d }) => {
  const [mode, setMode] = useState("grid");
  const [lb, setLb] = useState({ open: false, idx: 0 });

  const imgs = useMemo(() => {
    const gallery = d.gallery || [];
    return gallery.length
      ? gallery.map(g => g.imageUrl).filter(Boolean)
      : (d.images || []).filter(Boolean);
  }, [d]);

  if (!imgs.length) return null;
  const visible = imgs.slice(0, 8);

  const openLb = i => { setLb({ open: true, idx: i }); document.body.style.overflow = "hidden"; };
  const closeLb = () => { setLb({ open: false, idx: 0 }); document.body.style.overflow = ""; };

  return (
    <section id="gallery" className="d-sec d-sec--white">
      <div className="d-wrap">
        <div className="d-gal-top">
          <SecHead tag="GALLERY" title={`Moments from ${d.name}`} />
          <div className="d-gal-controls">
            <button className={`d-gal-btn ${mode === "grid" ? "on" : ""}`} onClick={() => setMode("grid")}>
              <Icon name="grid" size={13} /> Grid
            </button>
            <button className={`d-gal-btn ${mode === "list" ? "on" : ""}`} onClick={() => setMode("list")}>
              <Icon name="list" size={13} /> List
            </button>
          </div>
        </div>

        {mode === "grid" && (
          <div className="d-gal-mosaic">
            {visible.map((src, i) => (
              <Reveal key={i} from="scale" delay={i * 45}>
                <button className="d-gal-cell" onClick={() => openLb(i)} aria-label={`Photo ${i + 1}`}>
                  <img src={src} alt={`${d.name} ${i + 1}`} loading="lazy" />
                  <div className="d-gal-cell__ov"><Icon name="zoomIn" size={20} /></div>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        {mode === "list" && (
          <div className="d-gal-list">
            {visible.map((src, i) => (
              <Reveal key={i} from="left" delay={i * 45}>
                <button className="d-gal-list__row" onClick={() => openLb(i)}>
                  <div className="d-gal-list__thumb"><img src={src} alt="" loading="lazy" /></div>
                  <div className="d-gal-list__info">
                    <span className="d-gal-list__num">#{String(i + 1).padStart(2, "0")}</span>
                    <span className="d-gal-list__name">{d.name}</span>
                  </div>
                  <Icon name="maximize" size={16} className="d-gal-list__icon" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <Lightbox imgs={imgs} lb={lb} setLb={setLb} close={closeLb} name={d.name} />
    </section>
  );
};

const Lightbox = ({ imgs, lb, setLb, close, name }) => {
  const prev = useCallback(e => {
    e?.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
  }, [imgs.length, setLb]);

  const next = useCallback(e => {
    e?.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));
  }, [imgs.length, setLb]);

  useEffect(() => {
    if (!lb.open) return;
    const fn = e => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lb.open, close, prev, next]);

  if (!lb.open) return null;
  return (
    <div className="d-lb" onClick={close}>
      <div className="d-lb__bd" />
      <button className="d-lb__x" onClick={close}><Icon name="x" size={18} /></button>
      <div className="d-lb__stage" onClick={e => e.stopPropagation()}>
        <img src={imgs[lb.idx]} alt={`${name} ${lb.idx + 1}`} className="d-lb__img" />
      </div>
      {imgs.length > 1 && (
        <>
          <button className="d-lb__arr d-lb__arr--p" onClick={prev}><Icon name="chevronLeft" size={22} /></button>
          <button className="d-lb__arr d-lb__arr--n" onClick={next}><Icon name="chevronRight" size={22} /></button>
          <div className="d-lb__foot" onClick={e => e.stopPropagation()}>
            <div className="d-lb__strip">
              {imgs.slice(0, 10).map((src, i) => (
                <button key={i} className={`d-lb__thumb ${lb.idx === i ? "on" : ""}`}
                  onClick={() => setLb(p => ({ ...p, idx: i }))}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <span className="d-lb__count">{lb.idx + 1} / {imgs.length}</span>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   LOCAL TIPS & SAFETY
═══════════════════════════════════════════════════════════ */
const TipsSafetySec = ({ d }) => {
  const localTips = d.localTips;
  const safetyInfo = d.safetyInfo;
  if (!localTips && !safetyInfo) return null;

  const parseTips = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return [];
      if (t.startsWith("[")) {
        try {
          const p = JSON.parse(t);
          return Array.isArray(p) ? p.map(x => String(x).replace(/^["']|["']$/g, "").trim()).filter(Boolean) : [t];
        } catch { /* fall through */ }
      }
      /* comma-separated or single */ 
      return t.includes('","') || t.includes("','")
        ? t.replace(/^\[|\]$/g, "").split(/",\s*"/).map(x => x.replace(/^["']|["']$/g, "").trim()).filter(Boolean)
        : [t];
    }
    return [];
  };

  const tipsArr = parseTips(localTips);

  const parseSafety = (raw) => {
    if (!raw) return [];
    if (typeof raw === "string") {
      return raw.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8);
    }
    return [String(raw)];
  };
  const safetyPoints = parseSafety(safetyInfo);

  return (
    <section className="d-sec d-sec--leaf d-tips-sec">
      <div className="d-wrap">
        <SecHead tag="INSIDER KNOWLEDGE" title="Tips & Safety" center />
        <div className="d-tips-grid">
          {/* Tips card */}
          {tipsArr.length > 0 && (
            <Reveal from="left">
              <div className="d-tips-card">
                <div className="d-tips-card__hdr">
                  <div className="d-tips-card__hdr-icon">
                    <Icon name="lightbulb" size={22} />
                  </div>
                  <div>
                    <h3>Local Tips</h3>
                    <p>Insider advice from expert guides</p>
                  </div>
                </div>
                <ul className="d-tips-list">
                  {tipsArr.map((tip, i) => (
                    <li key={i} className="d-tips-list__item">
                      <span className="d-tips-list__num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="d-tips-list__text">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* Safety card */}
          {safetyPoints.length > 0 && (
            <Reveal from="right" delay={80}>
              <div className="d-safety-card">
                <div className="d-safety-card__hdr">
                  <div className="d-safety-card__hdr-icon">
                    <Icon name="shield" size={22} />
                  </div>
                  <div>
                    <h3>Safety Information</h3>
                    <p>Stay safe and prepared</p>
                  </div>
                </div>
                <div className="d-safety-card__body">
                  <div className="d-safety-card__alert">
                    <Icon name="alertTriangle" size={16} />
                    <span>Please read before your trip</span>
                  </div>
                  <ul className="d-safety-list">
                    {safetyPoints.map((pt, i) => (
                      <li key={i} className="d-safety-list__item">
                        <Icon name="checkCircle" size={14} className="d-safety-list__icon" />
                        <span>{pt.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="d-safety-card__footer">
                    <Icon name="headphones" size={14} />
                    <span>24/7 Emergency Support Available</span>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAP — auto-zoom on scroll into view
═══════════════════════════════════════════════════════════ */
const MapSec = ({ d }) => {
  const hgt = d.howToGetThere;
  const lat = hgt?.mapPosition?.lat ?? d.latitude ?? d.mapPosition?.lat;
  const lng = hgt?.mapPosition?.lng ?? d.longitude ?? d.mapPosition?.lng;
  if (!lat || !lng) return null;

  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [iframeKey, setIframeKey] = useState(0);
  const animDone = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || animDone.current) return;
    animDone.current = true;
    const steps = [2, 4, 6, 8, 10, 11, 12, 13, 14];
    let si = 0;
    const iv = setInterval(() => {
      si++;
      const z = steps[Math.min(si, steps.length - 1)];
      setZoom(z);
      setIframeKey(k => k + 1);
      if (si >= steps.length - 1) clearInterval(iv);
    }, 220);
    return () => clearInterval(iv);
  }, [inView]);

  return (
    <section className="d-sec d-sec--soft d-map-sec">
      <div className="d-wrap">
        <SecHead tag="LOCATION" title={`Find ${d.name}`} sub={`${lat.toFixed ? lat.toFixed(4) : lat}, ${lng.toFixed ? lng.toFixed(4) : lng}`} center />
        <Reveal from="bottom">
          <div className="d-map-wrap" ref={containerRef}>
            <div className="d-map-overlay">
              <div className="d-map-pin">
                <Icon name="mapPin" size={14} />
                <span>{d.name}</span>
              </div>
              {inView && zoom < 14 && (
                <div className="d-map-zoom-badge">
                  <Icon name="zoomIn" size={12} />
                  <span>Zooming in…</span>
                </div>
              )}
            </div>
            <div className="d-map-frame">
              <iframe
                key={iframeKey}
                title={`Map of ${d.name}`}
                src={`https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`}
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="d-map-foot">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="d-map-link"
              >
                <Icon name="externalLink" size={13} /> Open in Google Maps
              </a>
              <span className="d-map-coords">
                {lat?.toFixed?.(4) ?? lat}, {lng?.toFixed?.(4) ?? lng}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   PLAN — practical info + tips + sidebar CTA
═══════════════════════════════════════════════════════════ */
const PlanSec = ({ d, navigate }) => {
  const pi = d.practicalInfo;
  const hgt = d.howToGetThere;

  const infoCards = [
    { icon: "calendar", title: "Best Time to Visit",
      text: d.bestTimeToVisit ? `${d.bestTimeToVisit}. ${pi?.climate?.climateNotes || ""}`.trim() : null },
    { icon: "mapPin", title: "Getting There",
      text: hgt?.generalInfo || d.gettingThere
        || (hgt?.nearestAirport ? `Fly into ${hgt.nearestAirport}. ${hgt.driveTimeFromCapital ? `${hgt.driveTimeFromCapital} drive.` : ""}` : null) },
    { icon: "clock", title: "Duration", text: d.duration || (d.durationDays ? `${d.durationDays} day(s)` : null) },
    { icon: "barChart", title: "Difficulty", text: d.difficulty },
  ].filter(c => c.text);

  const packing = pi?.packing?.essentials || [];
  const vaccReq = pi?.healthAndSafety?.vaccinationsRequired || [];
  const malaria = pi?.healthAndSafety?.malariaRisk;
  const permits = pi?.permitsAndRegulations?.permitsRequired || [];
  const tips = d.tips || [];

  if (!infoCards.length && !packing.length && !tips.length) return null;

  return (
    <section id="plan" className="d-sec d-sec--white">
      <div className="d-wrap">
        <SecHead tag="PLAN YOUR TRIP" title="Practical Travel Information" center />
        <div className="d-plan">
          <div className="d-plan__left">
            {infoCards.map((c, i) => (
              <Reveal key={i} from="left" delay={i * 55}>
                <div className="d-infocard">
                  <div className="d-infocard__icon"><Icon name={c.icon} size={22} /></div>
                  <div>
                    <h4>{c.title}</h4>
                    <p>{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            {(packing.length > 0 || vaccReq.length > 0 || malaria || permits.length > 0) && (
              <div className="d-prac-blocks">
                {packing.length > 0 && (
                  <Reveal from="bottom" delay={70}>
                    <div className="d-prac-block">
                      <h4><Icon name="backpack" size={15} /> What to Pack</h4>
                      <ul>{packing.map((p, i) => <li key={i}><Icon name="check" size={11} sw={2.5} />{p}</li>)}</ul>
                    </div>
                  </Reveal>
                )}
                {(vaccReq.length > 0 || malaria) && (
                  <Reveal from="bottom" delay={120}>
                    <div className="d-prac-block">
                      <h4><Icon name="shield" size={15} /> Health & Safety</h4>
                      {malaria && <p className="d-prac-alert">⚠ Malaria Risk: {malaria}</p>}
                      {vaccReq.length > 0 && <ul>{vaccReq.map((v, i) => <li key={i}><Icon name="check" size={11} sw={2.5} />{v}</li>)}</ul>}
                    </div>
                  </Reveal>
                )}
                {permits.length > 0 && (
                  <Reveal from="bottom" delay={170}>
                    <div className="d-prac-block">
                      <h4><Icon name="ticket" size={15} /> Permits Required</h4>
                      <ul>{permits.map((p, i) => <li key={i}><Icon name="check" size={11} sw={2.5} />{p}</li>)}</ul>
                    </div>
                  </Reveal>
                )}
              </div>
            )}

            {tips.slice(0, 4).map((tip, i) => {
              const phase = PHASE[tip.tripPhase] || PHASE["during-stay"];
              return (
                <Reveal key={i} from="left" delay={i * 55}>
                  <div className="d-tip-item">
                    <span className="d-tip-phase" style={{ background: phase.bg, color: phase.color }}>{phase.label}</span>
                    {tip.headline && <h4>{tip.headline}</h4>}
                    <p>{tip.summary}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="d-plan__right">
            {/* Book card */}
            <Reveal from="right" delay={100}>
              <div className="d-book-card">
                <div className="d-book-card__top">
                  <div className="d-book-card__icon"><Icon name="calendarCheck" size={26} /></div>
                  <h3>Book {d.name}</h3>
                  <p>Secure your spot — limited availability each season</p>
                </div>
                <div className="d-book-card__body">
                  <button
                    className="d-btn d-btn--emerald d-btn--full"
                    onClick={() => navigate(`/booking?destination=${d.slug}`)}
                  >
                    <Icon name="calendarCheck" size={15} /> Book This Destination
                  </button>
                  <button
                    className="d-btn d-btn--outline d-btn--full"
                    onClick={() => navigate("/contact")}
                  >
                    <Icon name="mail" size={15} /> Enquire Now
                  </button>
                  <button
                    className="d-btn d-btn--ghost-green d-btn--full"
                    onClick={() => navigate("/contact")}
                  >
                    <Icon name="messageCircle" size={15} /> Talk to an Expert
                  </button>
                  <div className="d-book-card__trust">
                    {[
                      { icon: "award", t: "Expert Guides" },
                      { icon: "shield", t: "Safe Travel" },
                      { icon: "headphones", t: "24/7 Support" },
                    ].map((x, i) => (
                      <div key={i} className="d-book-card__trust-item">
                        <Icon name={x.icon} size={14} />
                        <span>{x.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   AI SEARCH — clean input, persists Q&A to FAQ
═══════════════════════════════════════════════════════════ */
const SUGGEST_QS = [
  "What is the best time to visit?",
  "How difficult is the trek?",
  "What should I pack?",
  "Is altitude sickness a risk?",
  "What permits do I need?",
  "How do I get there?",
];

const buildAnswer = (q, d) => {
  const lq = q.toLowerCase();
  const name = d.name || "this destination";
  const pi = d.practicalInfo;

  if (lq.match(/best time|when.*visit|season/)) {
    const bt = d.bestTimeToVisit;
    const cn = pi?.climate?.climateNotes;
    return bt
      ? `The best time to visit ${name} is **${bt}**.${cn ? ` ${cn}` : ""} We recommend booking well in advance as this is a popular period.`
      : `${name} can be visited year-round, but conditions vary by season. Contact our team for a personalised recommendation.`;
  }
  if (lq.match(/diffic|hard|challeng|strenu|fit/)) {
    return `${name} is rated **${d.difficulty || "moderate to strenuous"}**. ${d.duration ? `The typical duration is ${d.duration}.` : ""} Good physical fitness and prior hiking experience are strongly recommended. Acclimatize properly, ascend slowly, and stay hydrated throughout.`;
  }
  if (lq.match(/pack|bring|gear|equip|bag/)) {
    const ess = pi?.packing?.essentials || [];
    const gear = pi?.packing?.gearRecommendations || [];
    if (ess.length || gear.length) {
      return `For ${name}, pack the following: ${[...ess, ...gear].slice(0, 8).join(", ")}. Always dress in layers, carry rain gear and a first-aid kit.`;
    }
    return `For ${name}, we recommend warm layered clothing, waterproof outerwear, sturdy hiking boots, sunscreen, a first-aid kit, and a refillable water bottle. Our guides can provide a full gear checklist upon booking.`;
  }
  if (lq.match(/altitude|elevation|sick|ams|acclim/)) {
    return `Altitude sickness is a genuine concern at ${name}. Our recommendations: ascend slowly, take acclimatization days, stay well hydrated, avoid alcohol on the first nights, and descend immediately if symptoms worsen. Consult a doctor about preventive medication before departure.`;
  }
  if (lq.match(/permit|entry|fee|cost|price/)) {
    const perms = pi?.permitsAndRegulations?.permitsRequired || [];
    const cost = pi?.permitsAndRegulations?.permitCost;
    if (perms.length) {
      return `For ${name}, you will need: **${perms.join(", ")}**. ${cost ? `Estimated cost: ${cost}.` : ""} ${pi?.permitsAndRegulations?.bookingLeadTime ? `Book at least ${pi.permitsAndRegulations.bookingLeadTime} in advance.` : "Permits are limited — book early."}`;
    }
    return `${name} may require entry permits and park fees. Our team handles all permit arrangements as part of your booking. Contact us for the latest costs and availability.`;
  }
  if (lq.match(/get there|transport|airport|drive|reach/)) {
    const hgt = d.howToGetThere;
    const apt = hgt?.nearestAirport || d.nearestAirport;
    const drive = hgt?.driveTimeFromCapital;
    if (apt || drive) {
      return `To reach ${name}: ${apt ? `fly into **${apt}**` : ""}${apt && drive ? ", then " : ""}${drive ? `drive approximately **${drive}**` : ""}. ${hgt?.generalInfo || d.gettingThere || ""}`.trim();
    }
    return `${d.gettingThere || hgt?.generalInfo || `Getting to ${name} requires careful planning. Our team will arrange all transportation as part of your package.`}`;
  }
  if (lq.match(/safe|danger|risk|secur/)) {
    return d.safetyInfo
      ? d.safetyInfo
      : `${name} is generally safe when visited with qualified guides. Always follow your guide's instructions, stay on marked trails, inform someone of your itinerary, and carry a charged phone and emergency contacts.`;
  }
  if (lq.match(/wildlife|animal|species|bird|mammal/)) {
    const w = (d.wildlife || []).slice(0, 6).join(", ");
    return w
      ? `${name} is home to remarkable wildlife including **${w}**${(d.wildlife || []).length > 6 ? ` and ${(d.wildlife || []).length - 6} more species` : ""}. Always maintain a respectful distance and follow park regulations.`
      : `${name} is home to diverse wildlife. Your guide will help you spot species and explain their behaviour and conservation status.`;
  }
  if (lq.match(/group|solo|size|alone|partner/)) {
    const gs = (d.minGroupSize && d.maxGroupSize)
      ? `${d.minGroupSize}–${d.maxGroupSize} people`
      : "2–8 people";
    return `${name} typically accommodates groups of **${gs}**. Solo travellers are very welcome — we can pair you with a small group departure for a sociable experience without compromising quality.`;
  }
  if (lq.match(/guide|porter|local|cook/)) {
    return `Hiring a local guide${d.difficulty === "strenuous" || d.difficulty === "hard" ? " and a porter" : ""} is strongly recommended for ${name}. Local guides have deep knowledge of terrain, weather patterns, and cultural context, greatly enriching your experience and ensuring safety.`;
  }
  if (lq.match(/weather|rain|temp|cold|hot/)) {
    const c = pi?.climate;
    if (c) {
      const parts = [];
      if (c.avgTempLowC != null) parts.push(`lows of ${c.avgTempLowC}°C`);
      if (c.avgTempHighC != null) parts.push(`highs of ${c.avgTempHighC}°C`);
      return `At ${name}, temperatures range from ${parts.join(" to ")}. ${c.climateNotes || ""} ${c.bestMonths?.length ? `Best months: ${c.bestMonths.join(", ")}.` : ""}`.trim();
    }
    return `Weather at ${name} varies significantly by season and altitude. Check conditions with our team before your trip and always pack layers regardless of the time of year.`;
  }
  /* Default */
  const short = d.shortDescription || d.description?.slice(0, 220);
  return `${name} is ${short || "an extraordinary destination"}. For specific information about your question, our expert team is available 24/7 — feel free to contact us or browse the FAQ section below.`;
};

/* Normalise a raw question into a valid FAQ question */
const normaliseQuestion = (q) => {
  let s = q.trim();
  if (!s) return null;
  if (!s.endsWith("?")) s += "?";
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s.length < 10 ? null : s;
};

const AiSearchSec = ({ d }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [askedQ, setAskedQ] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const answerRef = useRef(null);

  const handleAsk = useCallback(async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setQuery("");
    setError(null);
    setSaved(false);
    setAnswer(null);
    setAskedQ(trimmed);
    setLoading(true);

    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    const ans = buildAnswer(trimmed, d);
    setAnswer(ans);
    setLoading(false);

    setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);

    /* Auto-save well-formed Q&A to destination FAQs */
    const normQ = normaliseQuestion(trimmed);
    if (normQ && ans && d.id) {
      setSaving(true);
      try {
        await api.post(`/destinations/${d.id}/faqs`, {
          question: normQ,
          answer: ans.replace(/\*\*/g, ""),
          category: "AI Generated",
          sort_order: 9999,
        });
        setSaved(true);
      } catch (e) {
        /* non-fatal — FAQ save failure doesn't break UX */
        console.warn("[AI] FAQ save skipped:", e.message);
      } finally {
        setSaving(false);
      }
    }
  }, [query, loading, d]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); handleAsk(); }
  };

  /* Render answer with basic **bold** markdown */
  const renderAnswer = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <section id="ai-search" className="d-sec d-ai-sec">
      <div className="d-wrap">
        <div className="d-ai-inner">
          <Reveal from="bottom">
            <div className="d-ai-head">
              <div className="d-ai-head__icon">
                <Icon name="sparkles" size={22} />
              </div>
              <div>
                <h2 className="d-ai-head__title">Ask About {d.name}</h2>
                <p className="d-ai-head__sub">
                  Type any question and get an instant, expert-informed answer
                </p>
              </div>
            </div>
          </Reveal>

          {/* Input box */}
          <Reveal from="bottom" delay={80}>
            <div className="d-ai-form">
              <div className="d-ai-form__input-row">
                <div className="d-ai-form__icon">
                  <Icon name="search" size={18} />
                </div>
                <textarea
                  ref={inputRef}
                  className="d-ai-form__textarea"
                  placeholder={`Ask anything about ${d.name}… e.g. "What permits do I need?" or "How difficult is the summit?"`}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  rows={2}
                  disabled={loading}
                />
                <button
                  className={`d-ai-form__send ${loading ? "d-ai-form__send--loading" : ""}`}
                  onClick={() => handleAsk()}
                  disabled={loading || !query.trim()}
                  aria-label="Ask question"
                >
                  {loading
                    ? <Icon name="loader" size={18} className="d-ai-spin" />
                    : <Icon name="arrowRight" size={18} />
                  }
                </button>
              </div>
              <p className="d-ai-form__hint">
                Press <kbd>Enter</kbd> to send · Shift+Enter for new line
              </p>

              {/* Suggestion chips */}
              <div className="d-ai-chips">
                <span className="d-ai-chips__label">Try asking:</span>
                <div className="d-ai-chips__row">
                  {SUGGEST_QS.map((sq, i) => (
                    <button
                      key={i}
                      className="d-ai-chip"
                      onClick={() => handleAsk(sq)}
                      disabled={loading}
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Answer panel */}
          {(loading || answer) && (
            <div className="d-ai-answer" ref={answerRef}>
              {askedQ && (
                <div className="d-ai-answer__q">
                  <Icon name="messageCircle" size={14} />
                  <span>{askedQ}</span>
                </div>
              )}
              {loading ? (
                <div className="d-ai-answer__loading">
                  <div className="d-ai-answer__dots">
                    <span /><span /><span />
                  </div>
                  <span>Thinking…</span>
                </div>
              ) : (
                <>
                  <div className="d-ai-answer__body">
                    <div className="d-ai-answer__avatar">
                      <Icon name="sparkles" size={14} />
                    </div>
                    <div className="d-ai-answer__text">
                      <p>{renderAnswer(answer)}</p>
                    </div>
                  </div>
                  <div className="d-ai-answer__meta">
                    {saving && (
                      <span className="d-ai-answer__saving">
                        <Icon name="loader" size={12} className="d-ai-spin" /> Saving to FAQ…
                      </span>
                    )}
                    {saved && (
                      <span className="d-ai-answer__saved">
                        <Icon name="checkCircle" size={13} /> Added to FAQs
                      </span>
                    )}
                    <button
                      className="d-ai-answer__faq-link"
                      onClick={() => document.getElementById("faq-sec")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      View all FAQs <Icon name="arrowDown" size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   FAQ SECTION
═══════════════════════════════════════════════════════════ */
const FaqSec = ({ d }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [faqs, setFaqs] = useState(d.faqs || []);

  /* Keep in sync if parent data refreshes (e.g. AI added a FAQ) */
  useEffect(() => { if (d.faqs?.length) setFaqs(d.faqs); }, [d.faqs]);

  const fallback = useMemo(() => [
    {
      id: "f1", question: `What is the best time to visit ${d.name}?`,
      answer: d.bestTimeToVisit
        ? `The best time to visit is ${d.bestTimeToVisit}. ${d.practicalInfo?.climate?.climateNotes || ""}`.trim()
        : "Please contact us for seasonal recommendations.",
    },
    {
      id: "f2", question: `How difficult is ${d.name}?`,
      answer: d.difficulty
        ? `${d.name} is rated as **${d.difficulty}**. ${d.duration ? `The experience takes approximately ${d.duration}.` : ""} Physical fitness and prior experience are recommended.`
        : "Difficulty varies. Please contact us for a personalised assessment.",
    },
    {
      id: "f3", question: "What permits are required?",
      answer: (d.practicalInfo?.permitsAndRegulations?.permitsRequired || []).join(", ")
        || "Permit requirements vary by season. Our team handles all permits as part of your booking.",
    },
    {
      id: "f4", question: "Is it safe?",
      answer: d.safetyInfo || "Your safety is our top priority. We work with certified, experienced guides and follow all park safety protocols.",
    },
    {
      id: "f5", question: "What should I pack?",
      answer: (d.practicalInfo?.packing?.essentials || []).join(", ")
        || "Pack warm layers, waterproof gear, sturdy boots, and personal medication. We will provide a complete packing list upon booking.",
    },
  ], [d]);

  const displayFaqs = faqs.length > 0 ? faqs : fallback;

  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i);

  return (
    <section id="faq-sec" className="d-sec d-sec--soft d-faq-sec">
      <div className="d-wrap">
        <SecHead
          tag="FAQ"
          title="Frequently Asked Questions"
          sub={`Everything you need to know about ${d.name}`}
          center
        />
        <div className="d-faq-list">
          {displayFaqs.map((faq, i) => (
            <Reveal key={faq.id || i} from="bottom" delay={i * 50}>
              <div className={`d-faq-item ${openIdx === i ? "d-faq-item--open" : ""}`}>
                <button
                  className="d-faq-item__btn"
                  onClick={() => toggle(i)}
                  aria-expanded={openIdx === i}
                >
                  <span className="d-faq-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="d-faq-item__q">{faq.question}</span>
                  <span className="d-faq-item__icon">
                    <Icon name={openIdx === i ? "chevronUp" : "chevronDown"} size={17} />
                  </span>
                </button>
                <div className="d-faq-item__body" aria-hidden={openIdx !== i}>
                  <div className="d-faq-item__inner">
                    <p>{typeof faq.answer === "string"
                      ? faq.answer.replace(/\*\*/g, "")
                      : faq.answer}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Still have questions */}
        <Reveal from="bottom" delay={250}>
          <div className="d-faq-cta">
            <div className="d-faq-cta__icon"><Icon name="messageCircle" size={26} /></div>
            <div className="d-faq-cta__text">
              <h3>Still have questions?</h3>
              <p>Our travel experts are ready to help you plan the perfect trip to {d.name}.</p>
            </div>
            <div className="d-faq-cta__btns">
              <Link to={`/booking?destination=${d.slug}`} className="d-btn d-btn--emerald">
                <Icon name="calendarCheck" size={14} /> Book Now
              </Link>
              <Link to="/contact" className="d-btn d-btn--outline">
                <Icon name="mail" size={14} /> Contact Us
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════════════════════ */
const ReviewsSec = ({ d }) => {
  const reviews = d.reviews || [];
  const agg = d.reviewAggregate || d.aggregate;
  if (!reviews.length && !agg) return null;

  const avg = agg?.avgRating || d.rating || 0;
  const total = agg?.totalReviews || d.reviewCount || 0;

  return (
    <section id="reviews" className="d-sec d-sec--leaf">
      <div className="d-wrap">
        <SecHead tag="REVIEWS" title="What Travellers Say" center />
        {agg && (
          <Reveal from="bottom">
            <div className="d-rev-agg">
              <span className="d-rev-agg__big">{avg.toFixed(1)}</span>
              <div className="d-rev-agg__stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={16} className={i < Math.round(avg) ? "d-star-on" : "d-star-off"} />
                ))}
              </div>
              <span className="d-rev-agg__total">{total.toLocaleString()} reviews</span>
            </div>
          </Reveal>
        )}
        {reviews.length > 0 && (
          <div className="d-rev-grid">
            {reviews.map((rev, i) => (
              <Reveal key={i} from="bottom" delay={i * 65}>
                <div className="d-rev-card">
                  <div className="d-rev-card__top">
                    <div className="d-rev-card__av">
                      {rev.reviewerAvatar
                        ? <img src={rev.reviewerAvatar} alt="" />
                        : <span>{(rev.reviewerName || "A")[0]}</span>
                      }
                    </div>
                    <div>
                      <strong>{rev.reviewerName || "Anonymous"}</strong>
                      <div className="d-rev-card__meta">
                        {rev.reviewerCountry}
                        {rev.tripDate && ` · ${new Date(rev.tripDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </div>
                    </div>
                    {rev.isVerified && <Icon name="checkCircle" size={14} className="d-rev-card__v" />}
                  </div>
                  <div className="d-rev-card__stars">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Icon key={s} name="star" size={12} className={s < Math.round(rev.rating) ? "d-star-on" : "d-star-off"} />
                    ))}
                    <span>{rev.rating?.toFixed(1)}</span>
                  </div>
                  {rev.title && <p className="d-rev-card__title">"{rev.title}"</p>}
                  <p className="d-rev-card__body">{rev.content}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   BOOKING CTA FOOTER
═══════════════════════════════════════════════════════════ */
const CtaFooter = ({ d, navigate }) => (
  <section className="d-cta-footer">
    <div className="d-cta-footer__bg" />
    <div className="d-wrap d-cta-footer__inner">
      <Reveal from="bottom">
        <h2>Ready for an unforgettable adventure?</h2>
      </Reveal>
      <Reveal from="bottom" delay={130}>
        <p>Join us in experiencing {d.name}. Let our experts craft the perfect journey for you.</p>
      </Reveal>
      <Reveal from="bottom" delay={270}>
        <div className="d-cta-footer__btns">
          <button
            className="d-btn d-btn--emerald d-btn--lg"
            onClick={() => navigate(`/booking?destination=${d.slug}`)}
          >
            <Icon name="calendarCheck" size={16} /> Book This Destination
          </button>
          <button className="d-btn d-btn--white d-btn--lg" onClick={() => navigate("/contact")}>
            <Icon name="mail" size={15} /> Enquire Now
          </button>
          {(d.countrySlug || d.country?.slug) && (
            <Link
              to={`/country/${d.countrySlug || d.country?.slug}`}
              className="d-btn d-btn--glass d-btn--lg"
            >
              More in {d.country?.name}
            </Link>
          )}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate = useNavigate();
  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [identifier]);

  if (loading) return <div className="d-page"><SkeletonPage /></div>;
  if (error || !destination) return <div className="d-page"><ErrorPage error={error} navigate={navigate} /></div>;

  const d = destination;
  const hasVideo = d.virtualTourUrl || d.videoUrl || (Array.isArray(d.videos) && d.videos.length > 0);

  return (
    <ScrollProvider>
      <div className="d-page">
        <ProgressBar />
        <Hero d={d} navigate={navigate} />
        <AboutSec d={d} />
        <HighlightsSec d={d} />
        <WildlifeSec d={d} />
        <DeepDiveSec d={d} />
        <GallerySec d={d} />
        <TipsSafetySec d={d} />
        <MapSec d={d} />
        <PlanSec d={d} navigate={navigate} />
        <AiSearchSec d={d} />
        <FaqSec d={d} />
        <ReviewsSec d={d} />
        {hasVideo && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <MiniVideoPlayer
                title={`${d.name} Videos`}
                videos={[
                  ...(d.virtualTourUrl ? [{ url: d.virtualTourUrl, title: `${d.name} Virtual Tour` }] : []),
                  ...(d.videoUrl ? [{ url: d.videoUrl, title: `${d.name} Video` }] : []),
                  ...(Array.isArray(d.videos) ? d.videos : []),
                ].filter(v => v?.url)}
              />
            </div>
          </section>
        )}
        <CtaFooter d={d} navigate={navigate} />
      </div>
    </ScrollProvider>
  );
};

export default DestinationDetail;