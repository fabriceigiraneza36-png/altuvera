// src/pages/CountryPage.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCountry, useCountryDestinations } from "../../hooks/useCountries";
import { getCountrySlug } from "../../utils/countrySlugMap";
import AnimatedSection from "../../components/common/AnimatedSection";
import DestinationCard from "../../components/destinations/DestinationCard";
import Loader from "../../components/common/Loader";
import "./CountryPage.css";

/* ═══════════════════════════════════════════════════════
   ICON SYSTEM — matches DestinationDetail exactly
═══════════════════════════════════════════════════════ */
const P = {
  mapPin:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  calendar:     "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  dollar:       "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  globe:        "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  users:        "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  book:         "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V5a2 2 0 012-2h14a2 2 0 012 2v14",
  star:         "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  camera:       "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  arrowRight:   "M5 12h14M12 5l7 7-7 7",
  arrowLeft:    "M19 12H5M12 19l-7-7 7-7",
  arrowDown:    "M12 5v14M19 12l-7 7-7-7",
  chevronDown:  "M6 9l6 6 6-6",
  chevronLeft:  "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  compass:      "M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 5.8l-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z",
  sun:          "M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.7 12.7l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 100-10 5 5 0 000 10z",
  clock:        "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5H11v6l5.2 3.2.8-1.2-4.5-2.7V7z",
  map:          "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  info:         "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  award:        "M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  alertCircle:  "M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4m0 4h.01",
  alertTri:     "M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4m0 4h.01",
  refresh:      "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.8-3.3L23 10M1 14l4.7 4.3A9 9 0 0020.5 15",
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  thermometer:  "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  droplet:      "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  feather:      "M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9",
  trending:     "M23 6l-9.5 9.5-5-5L1 18",
  heart:        "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z",
  eye:          "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  zoomIn:       "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3M11 8v6m-3-3h6",
  x:            "M18 6L6 18M6 6l12 12",
  plus:         "M12 5v14M5 12h14",
  minus:        "M5 12h14",
  check:        "M20 6L9 17l-5-5",
  checkCircle:  "M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3",
  mail:         "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  messageCircle:"M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z",
  headphones:   "M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z",
  externalLink: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3",
  calendarCheck:"M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  grid:         "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  list:         "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  maximize:     "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
  mountain:     "M8 3l4 8 5-5 5 15H2L8 3z",
  snowflake:    "M12 2v20m5.7-16.3L12 12M6.3 6.3L12 12m10 0H2m15.7 5.7L12 12M6.3 17.7L12 12",
  plane:        "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  car:          "M16 3h-2l-2 3H5a2 2 0 00-2 2v7a2 2 0 002 2h1m10 0h3a2 2 0 002-2V8a2 2 0 00-2-2h-2l-1-3z",
  wifi:         "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  ticket:       "M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z",
  sparkles:     "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  coffee:       "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  flag:         "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  loader:       "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
};

const Icon = ({ name, size = 20, className = "", style = {}, sw = 1.7 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={`cp-icon ${className}`} style={style} aria-hidden="true"
  >
    <path d={P[name] || P.compass} />
  </svg>
);

/* ═══════════════════════════════════════════════════════
   SCROLL CONTEXT
═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════ */
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

const useScreen = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { w, mob: w < 640, tab: w >= 640 && w < 1024, desk: w >= 1024 };
};

/* ═══════════════════════════════════════════════════════
   ANIMATION — Reveal (identical to DestinationDetail)
═══════════════════════════════════════════════════════ */
const Reveal = ({ children, from = "bottom", delay = 0, distance = 36, className = "" }) => {
  const [ref, vis] = useInView();
  const tx = {
    bottom: `translateY(${distance}px)`,
    top:    `translateY(-${distance}px)`,
    left:   `translateX(-${distance}px)`,
    right:  `translateX(${distance}px)`,
    scale:  `scale(0.93) translateY(14px)`,
  };
  return (
    <div
      ref={ref} className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? "none" : (tx[from] || tx.bottom),
        transition: `opacity .6s cubic-bezier(.4,0,.2,1) ${delay}ms,
                     transform .6s cubic-bezier(.4,0,.2,1) ${delay}ms`,
        willChange: "opacity,transform",
      }}
    >
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════════ */
const ProgressBar = () => {
  const p = useContext(ScrollCtx);
  return (
    <div className="cp-dp">
      <div className="cp-dp__bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ATOMS — Tag, SecHead
═══════════════════════════════════════════════════════ */
const Tag = ({ text, dark }) => (
  <span className={`cp-stag ${dark ? "cp-stag--dark" : ""}`}>{text}</span>
);

const SecHead = ({ tag, title, sub, center = false, light = false }) => {
  const [ref, vis] = useInView({ threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={`cp-sh ${center ? "cp-sh--c" : ""} ${light ? "cp-sh--light" : ""}`}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? "none" : "translateY(24px)",
        transition: "all .6s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {tag && <Tag text={tag} dark={light} />}
      <h2 className="cp-sh__t">{title}</h2>
      {sub && <p className="cp-sh__s">{sub}</p>}
      <div className="cp-sh__bar" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   DATA HELPERS — normalise country fields
═══════════════════════════════════════════════════════ */
const toStr = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean).join(", ");
  if (typeof v === "object") return toStr(v.name || v.label || v.value || "");
  return String(v).trim();
};

const toArr = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    return t.split(/[,·|/•;]+/).map(s => s.trim()).filter(Boolean);
  }
  if (typeof v === "object") return toArr(v.name || v.label || "");
  return [];
};

const pick = (...vals) => {
  for (const v of vals) { const t = toStr(v); if (t) return t; }
  return "";
};

const getHeroImages = (c) => {
  const set = new Set();
  const add = (v) => { const t = toStr(v); if (t) set.add(t); };
  add(c?.heroImage); add(c?.coverImageUrl); add(c?.imageUrl);
  if (Array.isArray(c?.images)) c.images.forEach(add);
  return [...set].filter(Boolean).slice(0, 7);
};

const getFlag     = (c) => pick(c?.flagUrl, c?.flag);
const getRegion   = (c) => pick(c?.continent, c?.region, c?.subRegion);
const getTagline  = (c) => pick(c?.tagline, c?.motto);
const getDesc     = (c) => pick(c?.fullDescription, c?.description, c?.additionalInfo);
const getOverview = (c) => pick(c?.description, c?.tagline);

const getGallery  = (c) => {
  const set = new Set();
  if (Array.isArray(c?.images))   c.images.forEach(s => s && set.add(s));
  const heroImgs = getHeroImages(c);
  heroImgs.forEach(s => set.add(s));
  return [...set].slice(0, 12);
};

const getActivities = (c) => {
  const src = c?.experiences || c?.highlights || [];
  return toArr(Array.isArray(src) ? src.join(",") : src).slice(0, 12);
};

const getWildlife = (c) => {
  const w = c?.wildlife;
  if (!w) return [];
  const all = [];
  if (typeof w === "object" && !Array.isArray(w)) {
    Object.values(w).forEach(v => all.push(...toArr(Array.isArray(v) ? v.join(",") : v)));
  } else {
    all.push(...toArr(Array.isArray(w) ? w.join(",") : w));
  }
  return [...new Set(all)].slice(0, 20);
};

const getHighlights = (c) => toArr(
  Array.isArray(c?.highlights) ? c.highlights.join(",") : (c?.highlights || "")
).slice(0, 10);

const getTips = (c) => toArr(
  Array.isArray(c?.travelTips) ? c.travelTips.join(",") : (c?.travelTips || "")
).slice(0, 6);

const getFaqs     = (c) => (Array.isArray(c?.faqs)     ? c.faqs     : []);
const getReviews  = (c) => (Array.isArray(c?.reviews)  ? c.reviews  : []);

const getFactItems = (c) => [
  { icon: "mapPin",     label: "Capital",          val: pick(c?.capital) },
  { icon: "dollar",     label: "Currency",         val: pick(c?.currency, c?.currencySymbol && `${c.currency} (${c.currencySymbol})`) },
  { icon: "sun",        label: "Best Time",        val: pick(c?.bestTime, c?.bestTimeToVisit) },
  { icon: "book",       label: "Languages",        val: toArr(c?.languages || c?.officialLanguages).slice(0,3).join(", ") },
  { icon: "users",      label: "Population",       val: formatPop(c?.population) },
  { icon: "clock",      label: "Time Zone",        val: pick(c?.timezone) },
  { icon: "shield",     label: "Visa",             val: pick(c?.visaInfo).slice(0, 80) },
  { icon: "thermometer",label: "Climate",          val: pick(c?.climate) },
  { icon: "globe",      label: "Region",           val: pick(c?.region, c?.continent) },
  { icon: "feather",    label: "Driving Side",     val: pick(c?.drivingSide) },
].filter(f => f.val);

const formatPop = (p) => {
  const n = Number(p);
  if (!n || isNaN(n)) return "";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const getMonthStatus = (c, monthAbbr) => {
  const seasons = c?.seasons;
  const best  = (seasons?.best ? toArr(seasons.best) : []).map(s => s.toLowerCase().slice(0,3));
  const wet   = (seasons?.wet  ? toArr(seasons.wet)  : []).map(s => s.toLowerCase().slice(0,3));
  const m = monthAbbr.toLowerCase();
  if (best.some(b => b === m || b.startsWith(m))) return "best";
  if (wet.some(w  => w === m || w.startsWith(m)))  return "avoid";
  return "ok";
};

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
const Hero = ({ country, navigate }) => {
  const images  = useMemo(() => getHeroImages(country), [country]);
  const flag    = getFlag(country);
  const region  = getRegion(country);
  const tagline = getTagline(country);
  const slug    = getCountrySlug(country);

  const [idx, setIdx] = useState(0);
  const [rdy, setRdy] = useState(false);

  const isFlagEmoji = flag && !flag.startsWith("http");
  const isFlagUrl   = flag && flag.startsWith("http");

  useEffect(() => { const t = setTimeout(() => setRdy(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (images.length <= 1) return;
    const iv = setInterval(() => setIdx(p => (p + 1) % images.length), 6500);
    return () => clearInterval(iv);
  }, [images.length]);

  const rating    = country?.averageRating ?? country?.rating ?? null;
  const destCount = country?.destinationCount ?? null;

  return (
    <header className={`cp-hero ${rdy ? "cp-hero--rdy" : ""}`}>
      {/* Slides */}
      <div className="cp-hero__slides" aria-hidden="true">
        {images.length > 0 ? images.map((src, i) => (
          <div key={i} className={`cp-hero__slide ${idx === i ? "active" : ""}`}>
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        )) : (
          <div className="cp-hero__slide cp-hero__slide--empty active">
            <Icon name="globe" size={120} style={{ opacity: 0.07 }} />
          </div>
        )}
      </div>
      <div className="cp-hero__ov" />

      {/* Dots */}
      {images.length > 1 && (
        <div className="cp-hero__dots">
          {images.map((_, i) => (
            <button
              key={i} className={`cp-hero__dot ${idx === i ? "on" : ""}`}
              onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="cp-hero__nav" aria-label="Breadcrumb">
        <div className="cp-wrap">
          <ol className="cp-hero__crumbs">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li aria-current="page">{country.name}</li>
          </ol>
        </div>
      </nav>

      {/* Body */}
      <div className="cp-wrap cp-hero__body">
        <Reveal from="bottom" delay={80}>
          <div className="cp-hero__chips">
            {country.isFeatured && (
              <span className="cp-chip cp-chip--gold">
                <Icon name="award" size={12} /> Featured
              </span>
            )}
            {region && (
              <span className="cp-chip cp-chip--glass">
                <Icon name="globe" size={12} /> {region}
              </span>
            )}
            {destCount != null && (
              <span className="cp-chip cp-chip--glass">
                <Icon name="camera" size={12} /> {destCount} Destinations
              </span>
            )}
          </div>
        </Reveal>

        <Reveal from="bottom" delay={240}>
          <h1 className="cp-hero__title">{country.name}</h1>
        </Reveal>

        {tagline && (
          <Reveal from="bottom" delay={400}>
            <p className="cp-hero__sub">{tagline}</p>
          </Reveal>
        )}

        <Reveal from="bottom" delay={560}>
          <div className="cp-hero__ctas">
            <Link to={`/country/${slug}/destinations`} className="cp-btn cp-btn--emerald cp-btn--lg">
              <Icon name="compass" size={16} /> Explore Destinations
              <Icon name="arrowRight" size={14} />
            </Link>
            <button
              className="cp-btn cp-btn--white cp-btn--lg"
              onClick={() => document.getElementById("cp-about")?.scrollIntoView({ behavior: "smooth" })}
            >
              Discover More <Icon name="arrowDown" size={14} />
            </button>
            <button
              className="cp-btn cp-btn--glass cp-btn--lg"
              onClick={() => navigate("/contact")}
            >
              Plan My Trip
            </button>
          </div>
        </Reveal>

        {/* Mini stats */}
        {(rating != null || destCount != null || country.capital) && (
          <Reveal from="bottom" delay={720}>
            <div className="cp-hero__stats">
              {rating != null && (
                <div className="cp-hero__stat">
                  <span className="cp-hero__stat-n">{Number(rating).toFixed(1)}</span>
                  <span className="cp-hero__stat-l">Rating</span>
                </div>
              )}
              {destCount != null && (
                <div className="cp-hero__stat">
                  <span className="cp-hero__stat-n">{destCount}</span>
                  <span className="cp-hero__stat-l">Destinations</span>
                </div>
              )}
              {country.capital && (
                <div className="cp-hero__stat">
                  <span className="cp-hero__stat-n" style={{ fontSize: "1.3rem" }}>{country.capital}</span>
                  <span className="cp-hero__stat-l">Capital</span>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>

      {/* Flag badge */}
      {flag && (
        <div className="cp-hero__flag" aria-hidden="true">
          {isFlagUrl
            ? <img src={flag} alt={`${country.name} flag`} />
            : isFlagEmoji
            ? <span>{flag}</span>
            : <Icon name="globe" size={28} />
          }
        </div>
      )}

      <div className="cp-hero__scroll">
        <span>SCROLL</span>
        <Icon name="chevronDown" size={20} className="cp-hero__bounce" />
      </div>
    </header>
  );
};

/* ═══════════════════════════════════════════════════════
   STATS STICKY BAR
═══════════════════════════════════════════════════════ */
const StatsBar = ({ country }) => {
  const facts = getFactItems(country).slice(0, 6);
  if (!facts.length) return null;
  return (
    <div className="cp-statsbar">
      <div className="cp-wrap">
        <div className="cp-statsbar__inner">
          {facts.map((f, i) => (
            <div key={i} className="cp-statsbar__item">
              <div className="cp-statsbar__icon"><Icon name={f.icon} size={15} /></div>
              <div>
                <span className="cp-statsbar__label">{f.label}</span>
                <span className="cp-statsbar__val">{f.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ABOUT — 7/5 grid with sidebar
═══════════════════════════════════════════════════════ */
const AboutSec = ({ country, navigate }) => {
  const desc     = getDesc(country);
  const overview = getOverview(country);
  const slug     = getCountrySlug(country);
  const facts    = getFactItems(country);
  const flag     = getFlag(country);
  const isFlagEmoji = flag && !flag.startsWith("http");
  const isFlagUrl   = flag && flag.startsWith("http");

  if (!desc && !overview) return null;

  return (
    <section id="cp-about" className="cp-sec cp-sec--leaf">
      <div className="cp-wrap">
        <div className="cp-about">
          {/* Main text */}
          <div className="cp-about__main">
            <Tag text="COUNTRY GUIDE" />
            <Reveal from="left">
              <h2 className="cp-about__title">About {country.name}</h2>
            </Reveal>

            {overview && overview !== desc && (
              <Reveal from="left" delay={80}>
                <blockquote className="cp-about__quote">
                  <span className="cp-about__quote-mark">"</span>
                  <p>{overview}</p>
                </blockquote>
              </Reveal>
            )}

            {desc && (
              <Reveal from="left" delay={140}>
                <div className="cp-prose">
                  {desc.split(/\n\n|\r\n\r\n/).filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal from="bottom" delay={220}>
              <div className="cp-about__actions">
                <Link to={`/country/${slug}/destinations`} className="cp-btn cp-btn--emerald">
                  <Icon name="compass" size={15} /> Explore Destinations
                </Link>
                <button className="cp-btn cp-btn--outline" onClick={() => navigate("/contact")}>
                  <Icon name="mail" size={15} /> Plan My Trip
                </button>
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="cp-about__aside">
            {/* Country card */}
            <Reveal from="right" delay={80}>
              <div className="cp-country-card">
                <div className="cp-country-card__hdr">
                  {flag && (
                    <div className="cp-country-card__flag">
                      {isFlagUrl
                        ? <img src={flag} alt={`${country.name} flag`} />
                        : isFlagEmoji
                        ? <span>{flag}</span>
                        : <Icon name="globe" size={32} />
                      }
                    </div>
                  )}
                  <div>
                    <span className="cp-country-card__sub">Country Profile</span>
                    <span className="cp-country-card__name">{country.name}</span>
                    {country.officialName && (
                      <span className="cp-country-card__official">{country.officialName}</span>
                    )}
                  </div>
                </div>
                <ul className="cp-country-card__list">
                  {facts.slice(0, 7).map((f, i) => (
                    <li key={i} className="cp-country-card__item">
                      <span className="cp-country-card__item-icon">
                        <Icon name={f.icon} size={14} />
                      </span>
                      <span className="cp-country-card__item-label">{f.label}</span>
                      <span className="cp-country-card__item-val">{f.val}</span>
                    </li>
                  ))}
                </ul>
                <div className="cp-country-card__foot">
                  <button
                    className="cp-btn cp-btn--emerald cp-btn--full"
                    onClick={() => navigate("/contact")}
                  >
                    <Icon name="calendarCheck" size={15} /> Plan My Visit
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Trust block */}
            <Reveal from="right" delay={180}>
              <div className="cp-trust-block">
                {[
                  { icon: "award",      label: "Expert Guides" },
                  { icon: "shield",     label: "Safe Travel" },
                  { icon: "headphones", label: "24/7 Support" },
                ].map((x, i) => (
                  <div key={i} className="cp-trust-block__item">
                    <div className="cp-trust-block__icon"><Icon name={x.icon} size={18} /></div>
                    <span>{x.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   FACTS GRID
═══════════════════════════════════════════════════════ */
const FactsSec = ({ country }) => {
  const facts = getFactItems(country);
  if (!facts.length) return null;
  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="QUICK FACTS" title={`Travel Information — ${country.name}`} center />
        <div className="cp-facts-grid">
          {facts.map((f, i) => (
            <Reveal key={i} from="scale" delay={i * 45}>
              <div className="cp-fact">
                <div className="cp-fact__icon"><Icon name={f.icon} size={18} /></div>
                <div>
                  <span className="cp-fact__label">{f.label}</span>
                  <span className="cp-fact__val">{f.val}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   HIGHLIGHTS
═══════════════════════════════════════════════════════ */
const HighlightsSec = ({ country }) => {
  const highlights = getHighlights(country);
  if (!highlights.length) return null;
  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead
          tag="SIGNATURE EXPERIENCES"
          title={`What ${country.name} is Known For`}
          sub={`The unmissable experiences that define ${country.name}`}
          center
        />
        <div className="cp-hl-grid">
          {highlights.map((h, i) => (
            <Reveal key={i} from="bottom" delay={i * 55}>
              <div className="cp-hl-card">
                <span className="cp-hl-card__num">{String(i + 1).padStart(2, "0")}</span>
                <p>{h}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   BEST TIME
═══════════════════════════════════════════════════════ */
const BestTimeSec = ({ country }) => {
  const bestTime = pick(country?.bestTime, country?.bestTimeToVisit);
  const climate  = pick(country?.climate);
  if (!bestTime && !climate) return null;

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="WHEN TO GO" title="Best Time to Visit" center
          sub={`Plan your visit to ${country.name} at the ideal time`} />
        <div className="cp-besttime">
          {/* Hero card */}
          <Reveal from="left" delay={60}>
            <div className="cp-besttime__hero">
              <span className="cp-besttime__label">Recommended Season</span>
              <h3 className="cp-besttime__val">{bestTime || "Year-round"}</h3>
              {climate && <p className="cp-besttime__note">{climate}</p>}
              {country?.seasons?.best && (
                <div className="cp-besttime__temps">
                  <span className="cp-chip cp-chip--glass-sm">
                    <Icon name="sun" size={12} /> Best: {toArr(country.seasons.best).join(", ")}
                  </span>
                </div>
              )}
              {country?.waterSafety && (
                <div className="cp-besttime__water">
                  <Icon name="droplet" size={14} />
                  <span>Water: {country.waterSafety}</span>
                </div>
              )}
            </div>
          </Reveal>

          {/* Calendar */}
          <Reveal from="right" delay={100}>
            <div className="cp-besttime__cal">
              <span className="cp-besttime__cal-label">Monthly Guide</span>
              <div className="cp-besttime__months">
                {MONTHS.map(m => {
                  const s = getMonthStatus(country, m.toLowerCase());
                  return (
                    <div key={m} className={`cp-besttime__month cp-besttime__month--${s}`}>
                      <span>{m}</span>
                      <div className="cp-besttime__pip" />
                    </div>
                  );
                })}
              </div>
              <div className="cp-besttime__legend">
                {[{ c:"best",l:"Best" },{ c:"ok",l:"OK" },{ c:"avoid",l:"Avoid" }].map(x => (
                  <div key={x.c} className="cp-besttime__legend-item">
                    <div className={`cp-besttime__legend-dot cp-besttime__legend-dot--${x.c}`} />
                    {x.l}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   ACTIVITIES
═══════════════════════════════════════════════════════ */
const ACT_ICONS = {
  safari:  "eye",  drive: "car",   walk: "mapPin",  hike: "mountain",
  bird:    "eye",  photo: "camera",culture:"book",   village:"flag",
  boat:    "compass", fish:"compass", swim:"compass", balloon:"sun",
  trek:    "mountain", gorilla:"eye", chimp:"eye", track:"compass",
};
const getActIcon = (act) => {
  const a = act.toLowerCase();
  for (const [k, v] of Object.entries(ACT_ICONS)) { if (a.includes(k)) return v; }
  return "compass";
};

const ActivitiesSec = ({ country }) => {
  const activities = getActivities(country);
  if (!activities.length) return null;
  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead tag="THINGS TO DO" title={`Activities in ${country.name}`}
          sub="Experiences that bring this country to life" center />
        <div className="cp-act-grid">
          {activities.map((act, i) => (
            <Reveal key={i} from="scale" delay={i * 50}>
              <div className="cp-act-card">
                <div className="cp-act-card__ring">
                  <Icon name={getActIcon(act)} size={22} />
                </div>
                <h4>{act}</h4>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   WILDLIFE
═══════════════════════════════════════════════════════ */
const WildlifeSec = ({ country }) => {
  const wildlife = getWildlife(country);
  if (!wildlife.length) return null;
  return (
    <section className="cp-sec cp-sec--dark">
      <div className="cp-wrap">
        <SecHead tag="WILDLIFE" title={`Wildlife in ${country.name}`}
          sub="Species you may encounter" center light />
        <div className="cp-wildlife-wrap">
          {wildlife.map((w, i) => (
            <Reveal key={i} from="scale" delay={i * 35}>
              <div className="cp-wildlife-pill">
                <div className="cp-wildlife-pill__dot" />
                <span>{w}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   DESTINATIONS PREVIEW
═══════════════════════════════════════════════════════ */
const DestinationsSec = ({ country, slug, allDests, previewDests, loading }) => {
  if (!previewDests.length && !loading) return null;
  const [viewMode, setViewMode] = useState("grid");

  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <div className="cp-dest-top">
          <SecHead tag="TOP DESTINATIONS" title={`Must-Visit Places in ${country.name}`}
            sub={`Curated highlights across ${country.name}`} />
          <div className="cp-dest-top__right">
            {/* View toggle */}
            <div className="cp-view-toggle">
              <button
                className={`cp-view-btn ${viewMode === "grid" ? "on" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Icon name="grid" size={14} />
              </button>
              <button
                className={`cp-view-btn ${viewMode === "list" ? "on" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <Icon name="list" size={14} />
              </button>
            </div>
            {allDests.length > 3 && (
              <Link to={`/country/${slug}/destinations`} className="cp-btn cp-btn--outline cp-btn--sm">
                All {allDests.length} <Icon name="arrowRight" size={14} />
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="cp-dest-grid">
            {[1,2,3].map(i => (
              <div key={i} className="cp-dest-skel">
                <div className="cp-shimmer" style={{ aspectRatio:"16/10" }} />
                <div style={{ padding: 20, display:"flex", flexDirection:"column", gap:10 }}>
                  <div className="cp-shimmer" style={{ height:22, width:"60%", borderRadius:6 }} />
                  <div className="cp-shimmer" style={{ height:14, width:"85%", borderRadius:6 }} />
                  <div className="cp-shimmer" style={{ height:14, width:"50%", borderRadius:6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`cp-dest-grid ${viewMode === "list" ? "cp-dest-grid--list" : ""}`}>
            {previewDests.map((dest, i) => (
              <Reveal key={dest.slug || dest.id || i} from="bottom" delay={i * 70}>
                <DestinationCard destination={dest} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        )}

        {allDests.length > 3 && !loading && (
          <Reveal from="bottom" delay={200}>
            <div className="cp-dest-viewall">
              <Link to={`/country/${slug}/destinations`} className="cp-btn cp-btn--emerald cp-btn--lg">
                See All {allDests.length} Destinations <Icon name="arrowRight" size={15} />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   GALLERY WITH LIGHTBOX
═══════════════════════════════════════════════════════ */
const GallerySec = ({ country, gallery }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });

  const openLb = useCallback((i) => {
    setLb({ open: true, idx: i });
    document.body.style.overflow = "hidden";
  }, []);
  const closeLb = useCallback(() => {
    setLb({ open: false, idx: 0 });
    document.body.style.overflow = "";
  }, []);
  const prev = useCallback(e => {
    e?.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx - 1 + gallery.length) % gallery.length }));
  }, [gallery.length]);
  const next = useCallback(e => {
    e?.stopPropagation();
    setLb(p => ({ ...p, idx: (p.idx + 1) % gallery.length }));
  }, [gallery.length]);

  useEffect(() => {
    if (!lb.open) return;
    const fn = e => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lb.open, closeLb, prev, next]);

  if (!gallery.length) return null;

  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead tag="GALLERY" title={`Photo Gallery — ${country.name}`}
          sub={`A visual journey through ${country.name}`} center />
        <div className="cp-gallery-grid">
          {gallery.map((src, i) => (
            <Reveal key={i} from="scale" delay={i * 40}>
              <button
                className={`cp-gallery-item ${i === 0 ? "cp-gallery-item--hero" : ""}`}
                onClick={() => openLb(i)}
                aria-label={`View photo ${i + 1}`}
              >
                <img src={src} alt={`${country.name} ${i + 1}`} loading={i < 3 ? "eager" : "lazy"}
                  onError={e => { e.currentTarget.closest(".cp-gallery-item").style.display = "none"; }}
                />
                <div className="cp-gallery-item__ov">
                  <Icon name="zoomIn" size={22} />
                  <span>{country.name} · {String(i + 1).padStart(2,"0")}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lb.open && (
        <div className="cp-lb" onClick={closeLb}>
          <div className="cp-lb__bd" />
          <button className="cp-lb__x" onClick={closeLb} aria-label="Close">
            <Icon name="x" size={18} />
          </button>
          <div className="cp-lb__stage" onClick={e => e.stopPropagation()}>
            <img src={gallery[lb.idx]} alt={`${country.name} ${lb.idx + 1}`} className="cp-lb__img" />
          </div>
          {gallery.length > 1 && (
            <>
              <button className="cp-lb__arr cp-lb__arr--p" onClick={prev} aria-label="Previous">
                <Icon name="chevronLeft" size={22} />
              </button>
              <button className="cp-lb__arr cp-lb__arr--n" onClick={next} aria-label="Next">
                <Icon name="chevronRight" size={22} />
              </button>
              <div className="cp-lb__foot" onClick={e => e.stopPropagation()}>
                <div className="cp-lb__strip">
                  {gallery.slice(0, 12).map((src, i) => (
                    <button key={i} className={`cp-lb__thumb ${lb.idx === i ? "on" : ""}`}
                      onClick={() => setLb(p => ({ ...p, idx: i }))}>
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
                <span className="cp-lb__count">{lb.idx + 1} / {gallery.length}</span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   AIRPORTS, UNESCO, FESTIVALS — rich data sections
═══════════════════════════════════════════════════════ */
const AirportsSec = ({ country }) => {
  const airports = country?.airports || [];
  if (!airports.length) return null;
  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="GETTING THERE" title={`Airports in ${country.name}`}
          sub="International and domestic airports" />
        <div className="cp-airports-grid">
          {airports.map((ap, i) => (
            <Reveal key={ap.id || i} from="bottom" delay={i * 60}>
              <div className="cp-airport-card">
                <div className="cp-airport-card__icon">
                  <Icon name="plane" size={20} />
                </div>
                <div>
                  <h4>{ap.name}</h4>
                  {ap.code && <span className="cp-airport-card__code">{ap.code}</span>}
                  {ap.location && <p>{ap.location}</p>}
                  {ap.isMainInternational && (
                    <span className="cp-chip cp-chip--green-sm">Main International</span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const UnescoSec = ({ country }) => {
  const sites = country?.unescoSites || [];
  if (!sites.length) return null;
  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead tag="UNESCO WORLD HERITAGE" title="World Heritage Sites"
          sub={`Protected sites of outstanding universal value in ${country.name}`} />
        <div className="cp-unesco-grid">
          {sites.map((s, i) => (
            <Reveal key={s.id || i} from="left" delay={i * 60}>
              <div className="cp-unesco-card">
                <div className="cp-unesco-card__year">{s.year || "—"}</div>
                <div>
                  <h4>{s.name}</h4>
                  {s.type && <span className="cp-chip cp-chip--soft-green">{s.type}</span>}
                  {s.description && <p>{s.description}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const FestivalsSec = ({ country }) => {
  const fests = country?.festivals || [];
  if (!fests.length) return null;
  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="CULTURE & EVENTS" title={`Festivals in ${country.name}`}
          sub="Celebrations that bring local culture to life" />
        <div className="cp-festivals-grid">
          {fests.map((f, i) => (
            <Reveal key={f.id || i} from="bottom" delay={i * 55}>
              <div className="cp-festival-card">
                <div className="cp-festival-card__top">
                  <div className="cp-festival-card__icon"><Icon name="sparkles" size={18} /></div>
                  {f.period && <span className="cp-festival-card__period">{f.period}</span>}
                  {f.isMajorEvent && <span className="cp-chip cp-chip--gold-sm">Major Event</span>}
                </div>
                <h4>{f.name}</h4>
                {f.description && <p>{f.description}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   HISTORICAL TIMELINE
═══════════════════════════════════════════════════════ */
const TimelineSec = ({ country }) => {
  const events = (country?.historicalTimeline || []).slice(0, 10);
  if (!events.length) return null;
  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead tag="HISTORY" title={`Historical Timeline — ${country.name}`}
          sub="Key events that shaped this nation" />
        <div className="cp-timeline">
          {events.map((ev, i) => (
            <Reveal key={ev.id || i} from={i % 2 === 0 ? "left" : "right"} delay={i * 60}>
              <div className="cp-timeline__item">
                <div className="cp-timeline__dot" />
                <div className="cp-timeline__card">
                  <span className="cp-timeline__year">{ev.year}</span>
                  <p>{ev.event}</p>
                  {ev.type && <span className="cp-chip cp-chip--soft-green">{ev.type}</span>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CUISINE
═══════════════════════════════════════════════════════ */
const CuisineSec = ({ country }) => {
  const cuisine = country?.cuisine;
  if (!cuisine || typeof cuisine !== "object") return null;
  const staples     = toArr((cuisine.staples     || []).join(","));
  const specialties = toArr((cuisine.specialties || []).join(","));
  const beverages   = toArr((cuisine.beverages   || []).join(","));
  if (!staples.length && !specialties.length && !beverages.length) return null;

  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="FOOD & CULTURE" title={`Cuisine of ${country.name}`}
          sub="A taste of local flavour" />
        <div className="cp-cuisine-grid">
          {[
            { label: "Staple Foods",  items: staples,     icon: "coffee" },
            { label: "Specialties",   items: specialties, icon: "sparkles" },
            { label: "Beverages",     items: beverages,   icon: "droplet" },
          ].filter(g => g.items.length).map((group, gi) => (
            <Reveal key={gi} from="bottom" delay={gi * 80}>
              <div className="cp-cuisine-card">
                <div className="cp-cuisine-card__hdr">
                  <Icon name={group.icon} size={18} />
                  <h4>{group.label}</h4>
                </div>
                <div className="cp-chip-row">
                  {group.items.map((item, ii) => (
                    <span key={ii} className="cp-chip cp-chip--soft-green">{item}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   TIPS & SAFETY
═══════════════════════════════════════════════════════ */
const TipsSec = ({ country }) => {
  const tips       = getTips(country);
  const healthInfo = pick(country?.healthInfo);
  const visaInfo   = pick(country?.visaInfo);
  if (!tips.length && !healthInfo && !visaInfo) return null;

  return (
    <section className="cp-sec cp-sec--leaf">
      <div className="cp-wrap">
        <SecHead tag="INSIDER KNOWLEDGE" title="Tips & Travel Essentials" center />
        <div className="cp-tips-grid">
          {tips.length > 0 && (
            <Reveal from="left">
              <div className="cp-tips-card">
                <div className="cp-tips-card__hdr">
                  <div className="cp-tips-card__hdr-icon"><Icon name="sparkles" size={20} /></div>
                  <div>
                    <h3>Travel Tips</h3>
                    <p>Advice from local experts and experienced travellers</p>
                  </div>
                </div>
                <ul className="cp-tips-list">
                  {tips.map((tip, i) => (
                    <li key={i} className="cp-tips-list__item">
                      <span className="cp-tips-list__num">{String(i + 1).padStart(2,"0")}</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {(healthInfo || visaInfo) && (
            <Reveal from="right" delay={80}>
              <div className="cp-safety-card">
                <div className="cp-safety-card__hdr">
                  <div className="cp-safety-card__hdr-icon"><Icon name="shield" size={20} /></div>
                  <div>
                    <h3>Health & Visa</h3>
                    <p>Essential information for safe travel</p>
                  </div>
                </div>
                <div className="cp-safety-card__body">
                  {healthInfo && (
                    <div className="cp-safety-block">
                      <span className="cp-safety-block__label">
                        <Icon name="alertTri" size={13} /> Health Information
                      </span>
                      <p>{healthInfo}</p>
                    </div>
                  )}
                  {visaInfo && (
                    <div className="cp-safety-block">
                      <span className="cp-safety-block__label">
                        <Icon name="ticket" size={13} /> Visa Requirements
                      </span>
                      <p>{visaInfo}</p>
                    </div>
                  )}
                  <div className="cp-safety-card__contact">
                    <Icon name="headphones" size={14} />
                    <span>24/7 Travel Support Available</span>
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

/* ═══════════════════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════════════════ */
const ReviewsSec = ({ country }) => {
  const reviews  = getReviews(country);
  const agg      = country?.reviewAggregate ?? null;
  if (!reviews.length && !agg) return null;

  const avg   = agg?.avgRating   || country?.averageRating || 0;
  const total = agg?.totalReviews || country?.reviewCount   || 0;
  const dist  = agg?.distribution;

  return (
    <section className="cp-sec cp-sec--white">
      <div className="cp-wrap">
        <SecHead tag="REVIEWS" title="What Travellers Say" center />

        {agg && (
          <Reveal from="bottom">
            <div className="cp-rev-agg">
              <div className="cp-rev-agg__score">
                <span className="cp-rev-agg__big">{Number(avg).toFixed(1)}</span>
                <div className="cp-rev-agg__stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={16}
                      className={i < Math.round(avg) ? "cp-star-on" : "cp-star-off"} />
                  ))}
                </div>
                <span className="cp-rev-agg__total">{total.toLocaleString()} reviews</span>
              </div>
              {dist && (
                <div className="cp-rev-agg__bars">
                  {[
                    { l:"5★", c: dist.fiveStar  || 0 },
                    { l:"4★", c: dist.fourStar  || 0 },
                    { l:"3★", c: dist.threeStar || 0 },
                    { l:"2★", c: dist.twoStar   || 0 },
                    { l:"1★", c: dist.oneStar   || 0 },
                  ].map(b => {
                    const pct = total > 0 ? Math.round((b.c / total) * 100) : 0;
                    return (
                      <div key={b.l} className="cp-rev-bar">
                        <span className="cp-rev-bar__label">{b.l}</span>
                        <div className="cp-rev-bar__track">
                          <div className="cp-rev-bar__fill" style={{ width:`${pct}%` }} />
                        </div>
                        <span className="cp-rev-bar__pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        )}

        {reviews.length > 0 && (
          <div className="cp-rev-grid">
            {reviews.map((rev, i) => (
              <Reveal key={rev.id || i} from="bottom" delay={i * 65}>
                <div className="cp-rev-card">
                  <div className="cp-rev-card__top">
                    <div className="cp-rev-card__av">
                      {rev.reviewerAvatar
                        ? <img src={rev.reviewerAvatar} alt="" />
                        : <span>{(rev.reviewerName || "A")[0].toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <strong>{rev.reviewerName || "Anonymous"}</strong>
                      <div className="cp-rev-card__meta">
                        {rev.reviewerCountry}
                        {rev.tripDate && ` · ${new Date(rev.tripDate).toLocaleDateString("en-US",{month:"short",year:"numeric"})}`}
                      </div>
                    </div>
                    {rev.isVerified && <Icon name="checkCircle" size={14} className="cp-rev-card__v" />}
                  </div>
                  <div className="cp-rev-card__stars">
                    {Array.from({ length:5 }, (_, s) => (
                      <Icon key={s} name="star" size={12}
                        className={s < Math.round(rev.rating) ? "cp-star-on" : "cp-star-off"} />
                    ))}
                    <span>{rev.rating?.toFixed?.(1)}</span>
                  </div>
                  {rev.title && <p className="cp-rev-card__title">"{rev.title}"</p>}
                  <p className="cp-rev-card__body">{rev.content}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════ */
const FaqSec = ({ country }) => {
  const faqs    = getFaqs(country);
  const [open, setOpen] = useState(null);

  /* Auto-generate fallback FAQs if none */
  const fallback = useMemo(() => {
    const bestTime = pick(country?.bestTime, country?.bestTimeToVisit);
    const visa     = pick(country?.visaInfo);
    const currency = pick(country?.currency);
    return [
      bestTime && { question:`When is the best time to visit ${country.name}?`, answer: bestTime },
      visa     && { question:"Do I need a visa?", answer: visa },
      currency && { question:`What currency is used in ${country.name}?`, answer:`${currency}${country.currencySymbol ? ` (${country.currencySymbol})` : ""}` },
      { question:"Is it safe to travel?", answer: pick(country?.healthInfo) || `${country.name} is generally safe for tourists. Always follow local advice and travel with a reputable guide.` },
    ].filter(Boolean);
  }, [country]);

  const displayFaqs = faqs.length > 0 ? faqs : fallback;
  if (!displayFaqs.length) return null;

  return (
    <section className="cp-sec cp-sec--soft">
      <div className="cp-wrap">
        <SecHead tag="FAQ" title="Frequently Asked Questions"
          sub={`Common questions about travelling to ${country.name}`} center />
        <div className="cp-faq-list">
          {displayFaqs.map((faq, i) => (
            <Reveal key={faq.id || i} from="bottom" delay={i * 50}>
              <div className={`cp-faq-item ${open === i ? "cp-faq-item--open" : ""}`}>
                <button className="cp-faq-item__btn" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="cp-faq-item__num">{String(i + 1).padStart(2,"0")}</span>
                  <span className="cp-faq-item__q">{faq.question}</span>
                  <span className="cp-faq-item__icon">
                    <Icon name={open === i ? "minus" : "plus"} size={16} />
                  </span>
                </button>
                <div className="cp-faq-item__body">
                  <div className="cp-faq-item__inner"><p>{faq.answer}</p></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Still have questions */}
        <Reveal from="bottom" delay={250}>
          <div className="cp-faq-cta">
            <div className="cp-faq-cta__icon"><Icon name="messageCircle" size={24} /></div>
            <div>
              <h3>Still have questions?</h3>
              <p>Our travel experts can help you plan the perfect {country.name} experience.</p>
            </div>
            <Link to="/contact" className="cp-btn cp-btn--emerald">
              <Icon name="mail" size={14} /> Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════
   CTA FOOTER
═══════════════════════════════════════════════════════ */
const CtaFooter = ({ country, slug, navigate }) => (
  <section className="cp-cta-footer">
    <div className="cp-cta-footer__bg" />
    <div className="cp-wrap cp-cta-footer__inner">
      <Reveal from="bottom">
        <h2>Ready to explore {country.name}?</h2>
      </Reveal>
      <Reveal from="bottom" delay={130}>
        <p>
          Browse curated destinations, plan your perfect itinerary, and let our experts
          craft an unforgettable journey through {country.name}.
        </p>
      </Reveal>
      <Reveal from="bottom" delay={260}>
        <div className="cp-cta-footer__btns">
          <Link to={`/country/${slug}/destinations`} className="cp-btn cp-btn--white cp-btn--lg">
            <Icon name="compass" size={16} /> Explore Destinations <Icon name="arrowRight" size={14} />
          </Link>
          <button className="cp-btn cp-btn--emerald cp-btn--lg" onClick={() => navigate("/contact")}>
            <Icon name="calendarCheck" size={16} /> Plan My Trip
          </button>
          <button className="cp-btn cp-btn--glass cp-btn--lg" onClick={() => navigate("/contact")}>
            <Icon name="mail" size={14} /> Enquire Now
          </button>
        </div>
        <div className="cp-cta-footer__trust">
          {[
            { icon:"award",      label:"Expert Guides" },
            { icon:"shield",     label:"Safe & Ethical" },
            { icon:"headphones", label:"24/7 Support" },
            { icon:"star",       label:"Top Rated" },
          ].map((x, i) => (
            <div key={i} className="cp-cta-footer__trust-item">
              <Icon name={x.icon} size={16} /> {x.label}
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════ */
const CountryPage = () => {
  const { countryId } = useParams();
  const navigate      = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [countryId]);

  const { country, loading, error, refetch } = useCountry(countryId);
  const { destinations: allDests = [], loading: destsLoading } =
    useCountryDestinations(countryId);
  const previewDests = useMemo(() => allDests.slice(0, 6), [allDests]);

  /* Loading */
  if (loading) return <div className="cp-page"><Loader /></div>;

  /* Error */
  if (error || !country) {
    return (
      <div className="cp-page cp-page--error">
        <div className="cp-error">
          <div className="cp-error__glow" />
          <div className="cp-error__circle"><Icon name="alertCircle" size={40} /></div>
          <h2>Country Not Found</h2>
          <p>{error || `We couldn't load details for "${countryId}". Please try again.`}</p>
          <div className="cp-error__btns">
            <button className="cp-btn cp-btn--ghost" onClick={() => navigate(-1)}>
              <Icon name="arrowLeft" size={14} /> Go Back
            </button>
            <button className="cp-btn cp-btn--emerald" onClick={refetch}>
              <Icon name="refresh" size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slug    = getCountrySlug(country);
  const gallery = getGallery(country);

  return (
    <ScrollProvider>
      <div className="cp-page">
        <ProgressBar />

        <Hero country={country} navigate={navigate} />
        <StatsBar country={country} />
        <AboutSec country={country} navigate={navigate} />
        <FactsSec country={country} />
        <HighlightsSec country={country} />
        <BestTimeSec country={country} />
        <ActivitiesSec country={country} />
        <WildlifeSec country={country} />
        <DestinationsSec
          country={country} slug={slug}
          allDests={allDests} previewDests={previewDests}
          loading={destsLoading}
        />
        <GallerySec country={country} gallery={gallery} />
        <AirportsSec country={country} />
        <FestivalsSec country={country} />
        <UnescoSec country={country} />
        <TimelineSec country={country} />
        <CuisineSec country={country} />
        <TipsSec country={country} />
        <ReviewsSec country={country} />
        <FaqSec country={country} />
        <CtaFooter country={country} slug={slug} navigate={navigate} />
      </div>
    </ScrollProvider>
  );
};

export default CountryPage;