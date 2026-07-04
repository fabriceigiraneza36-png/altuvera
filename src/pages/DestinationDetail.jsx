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
import { useDestinationComments } from "../hooks/useDestinationComments";
import { api } from "../utils/api";
import PageHeader from "../components/common/PageHeader";
import "../styles/destinationDetail.css";

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
const P = {
  clock:         "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 5H11v6l5.2 3.2.8-1.2-4.5-2.7V7z",
  star:          "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  users:         "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  calendar:      "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  mapPin:        "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  globe:         "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  compass:       "M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 5.8l-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z",
  camera:        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  eye:           "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:             "M18 6L6 18M6 6l12 12",
  chevronLeft:   "M15 18l-6-6 6-6",
  chevronRight:  "M9 18l6-6-6-6",
  chevronDown:   "M6 9l6 6 6-6",
  check:         "M20 6L9 17l-5-5",
  checkCircle:   "M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3",
  shield:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  headphones:    "M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z",
  award:         "M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  mail:          "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  messageCircle: "M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z",
  arrowDown:     "M12 5v14M19 12l-7 7-7-7",
  arrowRight:    "M5 12h14M12 5l7 7-7 7",
  sparkles:      "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  alertTriangle: "M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4m0 4h.01",
  lightbulb:     "M9 21h6m-3-18a6 6 0 00-4 10.5V17a1 1 0 001 1h6a1 1 0 001-1v-3.5A6 6 0 0012 3z",
  backpack:      "M4 10l-.3 8.2A2 2 0 005.7 20h12.7a2 2 0 002-1.8L20 10M4 10h16M4 10l1-6h14l1 6",
  ticket:        "M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2z",
  barChart:      "M18 20V10M12 20V4M6 20v-6",
  calendarCheck: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  creditCard:    "M1 4h22v16H1zM1 10h22",
  info:          "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  map:           "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  sunrise:       "M17 18a5 5 0 10-10 0m5-11v7M4.2 10.2l1.4 1.4M1 18h2m18 0h2M18.4 11.6l1.4-1.4M23 22H1",
  moon:          "M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  mountain:      "M8 3l4 8 5-5 5 15H2L8 3z",
  waves:         "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1",
  home:          "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  car:           "M16 3h-2l-2 3H5a2 2 0 00-2 2v7a2 2 0 002 2h1m10 0h3a2 2 0 002-2V8a2 2 0 00-2-2h-2l-1-3z",
  footprints:    "M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5 10 7.9 8 9 8 11v5",
  bird:          "M16 7h.01M3.4 18H12a8 8 0 008-8V7a4 4 0 00-7.3-2.3L2 20",
  trees:         "M10 10v11m0-11L8 4l-2 6m4 0l2-6m8 4v11m0-11l-2-4-2 4m4 0l2-4",
  binoculars:    "M21 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5h4",
  ship:          "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.4 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M19.4 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.9.9 5.3 2.8 7.8",
  flag:          "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  thermometer:   "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  droplet:       "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  snowflake:     "M12 2v20m5.7-16.3L12 12M6.3 6.3L12 12m10 0H2m15.7 5.7L12 12M6.3 17.7L12 12",
  coffee:        "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  route:         "M3 7h2.6c.3 0 .5.1.7.3l2.4 2.4c.2.2.5.3.7.3h3.2c.3 0 .5-.1.7-.3l2.4-2.4c.2-.2.4-.3.7-.3H21",
  zoomIn:        "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3M11 8v6m-3-3h6",
};

const Icon = ({
  name, size = 20, className = "", style = {}, sw = 1.7, fill = "none",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
    strokeLinejoin="round" className={className}
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    aria-hidden="true">
    <path d={P[name] || P.compass} />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════════════════════════ */
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

const ProgressBar = () => {
  const p = useContext(ScrollCtx);
  return (
    <div className="dd-progress">
      <div className="dd-progress__bar" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */
function useSlideshow(length, interval = 4500) {
  const [idx, setIdx] = useState(0);
  const t = useRef(null);
  const start = useCallback(() => {
    clearInterval(t.current);
    if (length <= 1) return;
    t.current = setInterval(() => setIdx(p => (p + 1) % length), interval);
  }, [length, interval]);
  useEffect(() => { start(); return () => clearInterval(t.current); }, [start]);
  return {
    idx,
    goNext: useCallback(() => { setIdx(p => (p + 1) % length); start(); }, [length, start]),
    goPrev: useCallback(() => { setIdx(p => (p - 1 + length) % length); start(); }, [length, start]),
    goTo:   useCallback(i => { setIdx(i); start(); }, [start]),
  };
}

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

/* ═══════════════════════════════════════════════════════════
   REVEAL
═══════════════════════════════════════════════════════════ */
const Reveal = ({ children, from = "bottom", delay = 0, distance = 24, className = "" }) => {
  const [ref, vis] = useInView();
  const tx = {
    bottom: `translateY(${distance}px)`,
    top:    `translateY(-${distance}px)`,
    left:   `translateX(-${distance}px)`,
    right:  `translateX(${distance}px)`,
    scale:  "scale(0.93)",
    none:   "none",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : (tx[from] || tx.bottom),
      transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      willChange: "opacity,transform",
    }}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECTION HEAD
═══════════════════════════════════════════════════════════ */
const SectionHead = ({ title, desc, center = true, light = false }) => (
  <div className={`dd-section-head${!center ? " dd-section-head--left" : ""}`}>
    <h2 className={`dd-section-title${light ? " dd-section-title--light" : ""}`}>{title}</h2>
    {desc && <p className={`dd-section-desc${light ? " dd-section-desc--light" : ""}`}>{desc}</p>}
    <div className="dd-section-bar" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const ACT_ICONS = {
  "Game drives": "car", "Hot air balloon safari": "sunrise",
  "Bush walks": "footprints", "Cultural village visits": "home",
  "Bird watching": "bird", "Photography safaris": "camera",
  "Night game drives": "moon", "Hiking": "mountain",
  "Snorkeling": "waves", "Swimming": "waves",
  "Boat safari": "ship", "Gorilla trekking": "binoculars",
  "Chimpanzee tracking": "binoculars", "Nile boat safari": "ship",
  "Great Migration viewing": "binoculars", "Nature walks": "trees",
  "Mountain trekking": "mountain", "Camping": "flag",
};

/* ═══════════════════════════════════════════════════════════
   SKELETON / ERROR
═══════════════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div className="dd-skeleton-page">
    <div className="dd-skeleton-hero">
      <div style={{ maxWidth: 600 }}>
        <div className="dd-skel" style={{ height: 20, width: 120, marginBottom: 16 }} />
        <div className="dd-skel" style={{ height: 48, width: "80%", marginBottom: 12 }} />
        <div className="dd-skel" style={{ height: 20, width: "60%", marginBottom: 32 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div className="dd-skel" style={{ height: 48, width: 180 }} />
          <div className="dd-skel" style={{ height: 48, width: 130 }} />
        </div>
      </div>
    </div>
  </div>
);

const ErrorPage = ({ error, navigate }) => (
  <div className="dd-error">
    <div className="dd-error__glow" />
    <div className="dd-error__circle"><Icon name="map" size={36} /></div>
    <h2>Destination Not Found</h2>
    <p>{error || "This destination doesn't exist or may have been removed."}</p>
    <div className="dd-error__btns">
      <button className="dd-btn dd-btn--outline" onClick={() => navigate(-1)}>
        <Icon name="chevronLeft" size={14} /> Go Back
      </button>
      <button className="dd-btn dd-btn--primary" onClick={() => navigate("/destinations")}>
        Browse All
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   IMAGE MODAL
═══════════════════════════════════════════════════════════ */
const ImageModal = ({ images, idx, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="dd-modal-backdrop" onClick={onClose}>
      <div className="dd-modal-content" onClick={e => e.stopPropagation()}>
        <button className="dd-modal-close" onClick={onClose}>
          <Icon name="x" size={16} />
        </button>
        <img src={images[idx]} alt={`Image ${idx + 1}`} />
        {images.length > 1 && (
          <>
            <button className="dd-modal-nav dd-modal-nav--prev" onClick={onPrev}>
              <Icon name="chevronLeft" size={18} />
            </button>
            <button className="dd-modal-nav dd-modal-nav--next" onClick={onNext}>
              <Icon name="chevronRight" size={18} />
            </button>
            <div className="dd-modal-counter">{idx + 1} / {images.length}</div>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
const Hero = ({ d, navigate }) => {
  const allImgs = useMemo(() =>
    [d.heroImage, d.imageUrl, ...(d.images || []), ...(d.gallery || []).map(g => g.imageUrl)].filter(Boolean)
  , [d]);
  const slides = useMemo(() => [...new Set(allImgs)].slice(0, 7), [allImgs]);
  const { idx, goTo } = useSlideshow(slides.length, 6500);
  const stats = [
    d.durationDays && { val: d.durationDays, label: "Days" },
    (d.activities || []).length > 0 && { val: `${(d.activities || []).length}+`, label: "Activities" },
    d.rating && { val: d.rating.toFixed(1), label: "Rating" },
  ].filter(Boolean);

  return (
    <header className="dd-hero">
      <div className="dd-hero__slides" aria-hidden="true">
        {slides.length > 0
          ? slides.map((src, i) => (
              <div key={i} className={`dd-hero__slide${idx === i ? " active" : ""}`}>
                <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
              </div>
            ))
          : (
            <div className="dd-hero__slide active"
              style={{ background: "linear-gradient(135deg,#052e16,#14532d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="mountain" size={120} style={{ opacity: 0.06, color: "#fff" }} />
            </div>
          )}
      </div>
      <div className="dd-hero__overlay" />

      {slides.length > 1 && (
        <div className="dd-hero__dots">
          {slides.map((_, i) => (
            <button key={i}
              className={`dd-hero__dot${idx === i ? " dd-hero__dot--active" : ""}`}
              onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      <nav className="dd-hero__nav" aria-label="Breadcrumb">
        <ol className="dd-hero__crumbs">
          <li><Link to="/explore">Explore</Link></li>
          <li><Link to="/destinations">Destinations</Link></li>
          {d.country?.name && (
            <li>
              <Link to={`/country/${d.countrySlug || d.country?.slug}`}>
                {d.country?.flag && <span>{d.country.flag} </span>}
                {d.country.name}
              </Link>
            </li>
          )}
          <li aria-current="page">{d.name}</li>
        </ol>
      </nav>

      <div className="dd-hero__body">
        {d.country?.name && (
          <Reveal from="bottom" delay={80}>
            <div className="dd-hero__location">
              {d.country?.flag && <span>{d.country.flag}</span>}
              <span>{d.country.name.toUpperCase()}</span>
            </div>
          </Reveal>
        )}
        <Reveal from="bottom" delay={200}>
          <h1 className="dd-hero__title">{d.name}</h1>
        </Reveal>
        {d.tagline && (
          <Reveal from="bottom" delay={350}>
            <p className="dd-hero__tagline">{d.tagline}</p>
          </Reveal>
        )}
        <Reveal from="bottom" delay={500}>
          <div className="dd-hero__actions">
            <button className="dd-btn dd-btn--primary dd-btn--lg"
              onClick={() => navigate(`/booking?destination=${d.slug}`)}>
              <Icon name="calendarCheck" size={16} /> Book This Destination
            </button>
            <button className="dd-btn dd-btn--ghost dd-btn--lg"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
              Explore <Icon name="arrowDown" size={14} />
            </button>
          </div>
        </Reveal>
        {stats.length > 0 && (
          <Reveal from="bottom" delay={650}>
            <div className="dd-hero__stats">
              {stats.map((s, i) => (
                <div key={i} className="dd-hero__stat">
                  <div className="dd-hero__stat-val">{s.val}</div>
                  <div className="dd-hero__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
      <div className="dd-hero__scroll">
        <span>SCROLL</span>
        <Icon name="chevronDown" size={18} />
      </div>
    </header>
  );
};

/* ═══════════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════════ */
const AboutSection = ({ d }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  const asideImgs = useMemo(() => {
    const all = [d.heroImage, d.imageUrl, ...(d.gallery || []).map(g => g.imageUrl), ...(d.images || [])].filter(Boolean);
    return [...new Set(all)].slice(0, 8);
  }, [d]);

  const { idx, goNext, goPrev, goTo } = useSlideshow(asideImgs.length, 4500);

  const detailItems = [
    d.country?.name && { icon: "mapPin", label: "Location", val: `${d.country?.flag || ""} ${d.country.name}`.trim(), link: `/country/${d.countrySlug || d.country?.slug}` },
    d.duration       && { icon: "clock",    label: "Duration",   val: d.duration },
    d.difficulty     && { icon: "barChart", label: "Difficulty", val: d.difficulty },
    d.bestTimeToVisit && { icon: "calendar", label: "Best Season", val: d.bestTimeToVisit },
    d.rating         && { icon: "star",     label: "Rating",     val: `${d.rating.toFixed(1)} / 5` },
    (d.minGroupSize && d.maxGroupSize) && { icon: "users", label: "Group Size", val: `${d.minGroupSize} – ${d.maxGroupSize}` },
  ].filter(Boolean);

  return (
    <section id="about" className="dd-section dd-section--mint">
      <div className="dd-inner">
        <div className="dd-about-grid">
          {/* Left */}
          <div className="dd-about-left">
            <Reveal from="left">
              <div>
                {d.destinationType && (
                  <span className="dd-about__tag">
                    <Icon name="compass" size={11} /> {d.destinationType}
                  </span>
                )}
                <h2 className="dd-about__title">
                  {d.overview
                    ? d.overview.slice(0, 90).split(" ").slice(0, -1).join(" ")
                    : `Discover ${d.name}`}
                </h2>
              </div>
            </Reveal>
            {desc && (
              <Reveal from="left" delay={80}>
                <div className="dd-about__prose">
                  {desc.split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </Reveal>
            )}
            {detailItems.length > 0 && (
              <Reveal from="bottom" delay={160}>
                <div className="dd-stats-grid">
                  {detailItems.map((s, i) => (
                    <div key={i} className="dd-stat-card">
                      <div className="dd-stat-card__icon"><Icon name={s.icon} size={16} /></div>
                      <div>
                        <div className="dd-stat-card__label">{s.label}</div>
                        <div className="dd-stat-card__val">
                          {s.link ? <Link to={s.link}>{s.val}</Link> : s.val}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
            <Reveal from="bottom" delay={240}>
              <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <button className="dd-btn dd-btn--primary"
                  onClick={() => window.location.assign(`/booking?destination=${d.slug}`)}>
                  <Icon name="calendarCheck" size={15} /> Reserve Your Spot
                </button>
                <button className="dd-btn dd-btn--outline"
                  onClick={() => window.location.assign("/contact")}>
                  <Icon name="mail" size={15} /> Enquire
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right */}
          <div className="dd-about-right">
            <Reveal from="right" delay={100}>
              {asideImgs.length > 0 && (
                <div className="dd-aside-showcard">
                  {asideImgs.map((src, i) => (
                    <img key={i} src={src} alt={`${d.name} ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      className={i === idx ? "dd-slide-visible" : "dd-slide-hidden"} />
                  ))}
                  <div className="dd-aside-showcard__overlay" />
                  <div className="dd-aside-showcard__content">
                    <h3 className="dd-aside-showcard__name">{d.name}</h3>
                    {d.country?.name && (
                      <div className="dd-aside-showcard__loc">
                        <Icon name="mapPin" size={12} /> {d.country.name}
                      </div>
                    )}
                  </div>
                  {asideImgs.length > 1 && (
                    <>
                      <button className="dd-aside-showcard__nav dd-aside-showcard__nav--prev" onClick={goPrev} aria-label="Previous">
                        <Icon name="chevronLeft" size={14} />
                      </button>
                      <button className="dd-aside-showcard__nav dd-aside-showcard__nav--next" onClick={goNext} aria-label="Next">
                        <Icon name="chevronRight" size={14} />
                      </button>
                      <div className="dd-aside-showcard__dots">
                        {asideImgs.map((_, i) => (
                          <button key={i}
                            className={`dd-aside-showcard__dot${idx === i ? " dd-aside-showcard__dot--active" : ""}`}
                            onClick={() => goTo(i)} aria-label={`Image ${i + 1}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal from="right" delay={200}>
              <div className="dd-book-card">
                <div className="dd-book-card__top">
                  <div className="dd-book-card__icon"><Icon name="calendarCheck" size={26} /></div>
                  <h3>Book {d.name}</h3>
                  <p>Limited availability — secure your spot</p>
                </div>
                <div className="dd-book-card__body">
                  <button className="dd-btn dd-btn--primary dd-btn--full"
                    onClick={() => window.location.assign(`/booking?destination=${d.slug}`)}>
                    <Icon name="calendarCheck" size={15} /> Book Now
                  </button>
                  <button className="dd-btn dd-btn--outline dd-btn--full"
                    onClick={() => window.location.assign("/contact")}>
                    <Icon name="mail" size={15} /> Enquire
                  </button>
                  <div className="dd-book-card__trust">
                    {[
                      { icon: "award",      t: "Expert Guides" },
                      { icon: "shield",     t: "Safe Travel"   },
                      { icon: "headphones", t: "24/7 Support"  },
                    ].map((x, i) => (
                      <div key={i} className="dd-book-card__trust-item">
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
   MEDIA SHOWCASE — gallery images open in modal
═══════════════════════════════════════════════════════════ */
const extractYouTubeId = url => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return m ? m[1] : null;
};

const MediaShowcase = ({ d }) => {
  const [modal, setModal] = useState({ open: false, idx: 0 });

  const videos = useMemo(() => {
    const v = [];
    if (d.virtualTourUrl) v.push({ url: d.virtualTourUrl, title: `${d.name} Virtual Tour` });
    if (d.videoUrl)       v.push({ url: d.videoUrl,       title: `${d.name} Video` });
    if (Array.isArray(d.videos)) v.push(...d.videos.filter(x => x?.url));
    return v;
  }, [d]);

  const galleryImgs = useMemo(() => {
    const all = [...(d.gallery || []).map(g => g.imageUrl), ...(d.images || []), d.heroImage, d.imageUrl].filter(Boolean);
    return [...new Set(all)].slice(0, 6);
  }, [d]);

  const openModal  = useCallback(i => setModal({ open: true, idx: i }), []);
  const closeModal = useCallback(() => setModal({ open: false, idx: 0 }), []);
  const prevModal  = useCallback(() => setModal(p => ({ ...p, idx: (p.idx - 1 + galleryImgs.length) % galleryImgs.length })), [galleryImgs.length]);
  const nextModal  = useCallback(() => setModal(p => ({ ...p, idx: (p.idx + 1) % galleryImgs.length })), [galleryImgs.length]);

  if (!videos.length && !galleryImgs.length) return null;

  return (
    <section className="dd-section">
      <div className="dd-inner">
        <Reveal from="bottom">
          <SectionHead
            title={`Experience ${d.name}`}
            desc="Videos and images — click any photo to view it in full detail."
          />
        </Reveal>
        <div className="dd-media-showcase">
          {videos.map((vid, i) => {
            const ytId = extractYouTubeId(vid.url);
            if (!ytId) return null;
            return (
              <Reveal key={`v-${i}`} from="bottom" delay={i * 100}>
                <div className={`dd-videocard${videos.length === 1 ? " dd-media-showcase__full" : ""}`}>
                  <iframe className="dd-videocard__iframe"
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
                    title={vid.title} allow="autoplay; encrypted-media"
                    referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen />
                  <div className="dd-videocard__overlay" />
                  <div className="dd-videocard__content">
                    <div className="dd-videocard__badge">
                      <span className="dd-videocard__badge-dot" />
                      {i === 0 ? "Cinematic Experience" : "Video"}
                    </div>
                    <h3 className="dd-videocard__title">{vid.title || d.name}</h3>
                    <p className="dd-videocard__desc">Immerse yourself in the beauty of {d.name}.</p>
                  </div>
                </div>
              </Reveal>
            );
          })}

          {galleryImgs.slice(0, 4).map((src, i) => (
            <Reveal key={`g-${i}`} from="bottom" delay={(videos.length + i) * 80}>
              <div className="dd-media-card"
                onClick={() => openModal(i)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && openModal(i)}>
                <img className="dd-media-card__img" src={src} alt={`${d.name} ${i + 1}`} loading="lazy" />
                <div className="dd-media-card__overlay" />
                <div className="dd-media-card__zoom"><Icon name="zoomIn" size={20} /></div>
                <div className="dd-media-card__content">
                  <h3 className="dd-media-card__title">{d.name}</h3>
                  <p className="dd-media-card__desc">
                    {d.country?.name ? `${d.country.flag || ""} ${d.country.name}` : "East Africa"}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      {modal.open && (
        <ImageModal images={galleryImgs} idx={modal.idx}
          onClose={closeModal} onPrev={prevModal} onNext={nextModal} />
      )}
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   HIGHLIGHTS
═══════════════════════════════════════════════════════════ */
const HighlightsSection = ({ d }) => {
  const list       = d.highlights  || [];
  const activities = d.activities  || [];
  if (!list.length && !activities.length) return null;

  const imgPool = useMemo(() => {
    const all = [...(d.gallery || []).map(g => g.imageUrl), ...(d.images || []), d.heroImage, d.imageUrl].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  const items = [
    ...list.map((h, i) => ({ text: h, img: imgPool[i % Math.max(imgPool.length, 1)] || null, label: "Highlight", icon: "sparkles", desc: `Experience the wonder of ${h} at ${d.name}.` })),
    ...activities.map((act, i) => ({ text: act, img: imgPool[(list.length + i) % Math.max(imgPool.length, 1)] || null, label: "Activity", icon: ACT_ICONS[act] || "compass", desc: `Join expert guides for an unforgettable ${act} experience.` })),
  ];

  return (
    <section className="dd-section dd-section--alt">
      <div className="dd-inner">
        <Reveal from="bottom">
          <SectionHead title={`What Makes ${d.name} Unforgettable`} desc="Hover each card to discover more" />
        </Reveal>
        <div className="dd-exp-grid">
          {items.slice(0, 9).map((item, i) => (
            <Reveal key={i} from="scale" delay={i * 50}>
              <div className="dd-exp-card">
                {item.img
                  ? <img className="dd-exp-card__img" src={item.img} alt={item.text} loading="lazy" />
                  : <div className="dd-exp-card__placeholder"><Icon name={item.icon} size={42} /></div>}
                <div className="dd-exp-card__bottom">
                  <h4 className="dd-exp-card__bottom-name">{item.text}</h4>
                </div>
                <div className="dd-exp-card__overlay" />
                <div className="dd-exp-card__info">
                  <span className="dd-exp-card__tag"><Icon name={item.icon} size={10} /> {item.label}</span>
                  <h3 className="dd-exp-card__name">{item.text}</h3>
                  <p className="dd-exp-card__desc">{item.desc}</p>
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
   DEEP DIVE
═══════════════════════════════════════════════════════════ */
const DeepDiveSection = ({ d }) => {
  const hasAny = d.overview || d.description || d.whatToExpect || d.gettingThere || d.bestTimeToVisit || d.highlights?.length || d.activities?.length || d.practicalInfo;
  if (!hasAny) return null;

  const pi      = d.practicalInfo;
  const climate = pi?.climate;
  const packing = pi?.packing;
  const health  = pi?.healthAndSafety;
  const permits = pi?.permitsAndRegulations;
  const highlights = d.highlights || [];
  const activities = d.activities || [];

  return (
    <section className="dd-section dd-section--alt">
      <div className="dd-inner">
        <Reveal from="bottom">
          <SectionHead title={`Everything About ${d.name}`} desc="A comprehensive guide to help you plan and experience this destination" />
        </Reveal>
        <div className="dd-deepdive-grid">

          {(d.overview || d.description) && (
            <Reveal from="left">
              <div className="dd-deepdive-block dd-deepdive-block--full">
                <div className="dd-deepdive-block__icon"><Icon name="globe" size={20} /></div>
                <h3>Overview</h3>
                <div className="dd-prose">
                  {(d.overview || d.description).split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </Reveal>
          )}

          {d.whatToExpect && (
            <Reveal from="left" delay={60}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="eye" size={20} /></div>
                <h3>What to Expect</h3>
                <div className="dd-prose">
                  {d.whatToExpect.split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </Reveal>
          )}

          {(d.bestTimeToVisit || climate) && (
            <Reveal from="right" delay={60}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="thermometer" size={20} /></div>
                <h3>Climate & Best Time</h3>
                {d.bestTimeToVisit && <div className="dd-highlight-box"><Icon name="calendar" size={15} /><span><strong>Best Season:</strong> {d.bestTimeToVisit}</span></div>}
                {climate?.climateNotes && <p style={{ fontSize: 13.5, color: "var(--dd-text-2)", lineHeight: 1.7, margin: "6px 0" }}>{climate.climateNotes}</p>}
                {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                  <div className="dd-temp-row">
                    {climate.avgTempLowC  != null && <div className="dd-temp-chip dd-temp-chip--low"><Icon name="snowflake" size={13} /> Low: {climate.avgTempLowC}°C</div>}
                    {climate.avgTempHighC != null && <div className="dd-temp-chip dd-temp-chip--high"><Icon name="droplet" size={13} /> High: {climate.avgTempHighC}°C</div>}
                  </div>
                )}
                {climate?.bestMonths?.length > 0 && (<><p className="dd-sub-label">Best months:</p><ul className="dd-pill-list">{climate.bestMonths.map((m, i) => <li key={i} className="dd-pill dd-pill--green">{m}</li>)}</ul></>)}
                {climate?.avoidMonths?.length > 0 && (<><p className="dd-sub-label">Avoid:</p><ul className="dd-pill-list">{climate.avoidMonths.map((m, i) => <li key={i} className="dd-pill dd-pill--red">{m}</li>)}</ul></>)}
              </div>
            </Reveal>
          )}

          {highlights.length > 0 && (
            <Reveal from="left" delay={80}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="sparkles" size={20} /></div>
                <h3>Key Highlights</h3>
                <ol className="dd-ordered-list">
                  {highlights.map((h, i) => <li key={i}><span className="dd-ordered-list__num">{String(i + 1).padStart(2, "0")}</span><span>{h}</span></li>)}
                </ol>
              </div>
            </Reveal>
          )}

          {activities.length > 0 && (
            <Reveal from="right" delay={80}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="compass" size={20} /></div>
                <h3>Available Activities</h3>
                <ul className="dd-detail-list">
                  {activities.map((act, i) => <li key={i}><Icon name={ACT_ICONS[act] || "check"} size={14} /><span>{act}</span></li>)}
                </ul>
              </div>
            </Reveal>
          )}

          {(d.gettingThere || d.howToGetThere?.generalInfo) && (
            <Reveal from="left" delay={100}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="map" size={20} /></div>
                <h3>Getting There</h3>
                <div className="dd-prose">
                  {(d.gettingThere || d.howToGetThere?.generalInfo).split("\n\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {d.howToGetThere?.nearestAirport     && <div className="dd-highlight-box"><Icon name="mapPin" size={14} /><span><strong>Nearest Airport:</strong> {d.howToGetThere.nearestAirport}</span></div>}
                {d.howToGetThere?.driveTimeFromCapital && <div className="dd-highlight-box"><Icon name="car" size={14} /><span><strong>Drive time:</strong> {d.howToGetThere.driveTimeFromCapital}</span></div>}
                {d.howToGetThere?.transportOptions?.length > 0 && (<><p className="dd-sub-label">Transport:</p><ul className="dd-detail-list">{d.howToGetThere.transportOptions.map((t, i) => <li key={i}><Icon name="route" size={13} /><span>{t}</span></li>)}</ul></>)}
              </div>
            </Reveal>
          )}

          {(health?.vaccinationsRequired?.length || health?.malariaRisk || health?.safetyNotes) && (
            <Reveal from="right" delay={100}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon dd-deepdive-block__icon--red"><Icon name="shield" size={20} /></div>
                <h3>Health & Safety</h3>
                {health.malariaRisk && <div className="dd-alert dd-alert--warn"><Icon name="alertTriangle" size={15} /><span>Malaria risk: <strong>{health.malariaRisk}</strong></span></div>}
                {health.safetyNotes && <p style={{ fontSize: 13.5, color: "var(--dd-text-2)", lineHeight: 1.7, margin: "6px 0" }}>{health.safetyNotes}</p>}
                {health.vaccinationsRequired?.length > 0 && (<><p className="dd-sub-label">Required vaccinations:</p><ul className="dd-detail-list">{health.vaccinationsRequired.map((v, i) => <li key={i}><Icon name="checkCircle" size={14} /><span>{v}</span></li>)}</ul></>)}
                {health.vaccinationsRecommended?.length > 0 && (<><p className="dd-sub-label">Recommended:</p><ul className="dd-detail-list">{health.vaccinationsRecommended.map((v, i) => <li key={i}><Icon name="check" size={14} /><span>{v}</span></li>)}</ul></>)}
                {health.waterSafety && <div className="dd-highlight-box"><Icon name="droplet" size={14} /><span>{health.waterSafety}</span></div>}
              </div>
            </Reveal>
          )}

          {(packing?.essentials?.length || packing?.clothingTips) && (
            <Reveal from="left" delay={120}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="backpack" size={20} /></div>
                <h3>What to Pack</h3>
                {packing.clothingTips && <p style={{ fontSize: 13.5, color: "var(--dd-text-2)", lineHeight: 1.7, margin: "0 0 10px" }}>{packing.clothingTips}</p>}
                {packing.essentials?.length > 0 && (<><p className="dd-sub-label">Essentials:</p><ul className="dd-detail-list dd-detail-list--cols">{packing.essentials.map((item, i) => <li key={i}><Icon name="check" size={13} /><span>{item}</span></li>)}</ul></>)}
                {packing.gearRecommendations?.length > 0 && (<><p className="dd-sub-label">Recommended gear:</p><ul className="dd-detail-list">{packing.gearRecommendations.map((g, i) => <li key={i}><Icon name="check" size={13} /><span>{g}</span></li>)}</ul></>)}
              </div>
            </Reveal>
          )}

          {permits?.permitsRequired?.length > 0 && (
            <Reveal from="right" delay={120}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="ticket" size={20} /></div>
                <h3>Permits & Regulations</h3>
                {permits.bookingLeadTime && <div className="dd-highlight-box"><Icon name="calendar" size={14} /><span><strong>Book ahead:</strong> {permits.bookingLeadTime}</span></div>}
                <ul className="dd-detail-list">{permits.permitsRequired.map((p, i) => <li key={i}><Icon name="checkCircle" size={14} /><span>{p}</span></li>)}</ul>
                {permits.permitCost && <p style={{ fontSize: 13.5, color: "var(--dd-text-2)", margin: "8px 0 0" }}><Icon name="creditCard" size={13} style={{ display: "inline", marginRight: 5 }} />Cost: <strong>{permits.permitCost}</strong></p>}
                {permits.visitorLimits && <div className="dd-alert dd-alert--info"><Icon name="info" size={14} /><span>Visitor limit: {permits.visitorLimits}</span></div>}
              </div>
            </Reveal>
          )}

          {(pi?.budget?.rangeUsd || pi?.budget?.entranceFeeUsd) && (
            <Reveal from="left" delay={140}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="creditCard" size={20} /></div>
                <h3>Budget Guide (USD)</h3>
                <div className="dd-budget-grid">
                  {pi.budget.rangeUsd      && <div className="dd-budget-item"><span className="dd-budget-label">Budget Range</span><span className="dd-budget-val">{pi.budget.rangeUsd}</span></div>}
                  {pi.budget.entranceFeeUsd && <div className="dd-budget-item"><span className="dd-budget-label">Entrance Fee</span><span className="dd-budget-val">{pi.budget.entranceFeeUsd}</span></div>}
                  {pi.budget.guideCostUsd  && <div className="dd-budget-item"><span className="dd-budget-label">Guide Cost</span><span className="dd-budget-val">{pi.budget.guideCostUsd}</span></div>}
                  {pi.budget.mealCostRange && <div className="dd-budget-item"><span className="dd-budget-label">Meals</span><span className="dd-budget-val">{pi.budget.mealCostRange}</span></div>}
                </div>
              </div>
            </Reveal>
          )}

          {(pi?.culture?.localEtiquette?.length || pi?.culture?.tippingCulture) && (
            <Reveal from="right" delay={140}>
              <div className="dd-deepdive-block">
                <div className="dd-deepdive-block__icon"><Icon name="coffee" size={20} /></div>
                <h3>Culture & Etiquette</h3>
                {pi.culture.tippingCulture    && <p style={{ fontSize: 13.5, color: "var(--dd-text-2)", lineHeight: 1.7, margin: "0 0 8px" }}><strong>Tipping:</strong> {pi.culture.tippingCulture}</p>}
                {pi.culture.photographyRules  && <div className="dd-highlight-box"><Icon name="camera" size={14} /><span>{pi.culture.photographyRules}</span></div>}
                {pi.culture.localEtiquette?.length > 0 && (<><p className="dd-sub-label">Local etiquette:</p><ul className="dd-detail-list">{pi.culture.localEtiquette.map((e, i) => <li key={i}><Icon name="check" size={13} /><span>{e}</span></li>)}</ul></>)}
              </div>
            </Reveal>
          )}

        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   TIPS & SAFETY
═══════════════════════════════════════════════════════════ */
const TipsSafetySection = ({ d }) => {
  const localTips = d.localTips;
  const safetyInfo = d.safetyInfo;
  if (!localTips && !safetyInfo) return null;

  const parseTips = raw => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return [];
      if (t.startsWith("[")) { try { return JSON.parse(t).map(x => String(x).trim()).filter(Boolean); } catch {} }
      return [t];
    }
    return [];
  };
  const tipsArr = parseTips(localTips);
  const safetyPoints = safetyInfo
    ? (typeof safetyInfo === "string" ? safetyInfo.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8) : [String(safetyInfo)])
    : [];

  return (
    <section className="dd-section dd-section--mint">
      <div className="dd-inner">
        <Reveal from="bottom"><SectionHead title="Tips & Safety" /></Reveal>
        <div className="dd-tips-grid">
          {tipsArr.length > 0 && (
            <Reveal from="left">
              <div className="dd-tips-card">
                <div className="dd-tips-card__header">
                  <div className="dd-tips-card__header-icon"><Icon name="lightbulb" size={22} /></div>
                  <div><h3>Local Tips</h3><p>Insider advice from expert guides</p></div>
                </div>
                <div className="dd-tips-card__body">
                  <ul className="dd-tips-list">
                    {tipsArr.map((tip, i) => (
                      <li key={i}>
                        <span className="dd-tips-list__num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="dd-tips-list__text">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          )}
          {safetyPoints.length > 0 && (
            <Reveal from="right" delay={80}>
              <div className="dd-safety-card">
                <div className="dd-safety-card__header">
                  <div className="dd-safety-card__header-icon"><Icon name="shield" size={22} /></div>
                  <div><h3>Safety Information</h3><p>Stay safe and prepared</p></div>
                </div>
                <div className="dd-safety-card__body">
                  <div className="dd-safety-alert"><Icon name="alertTriangle" size={16} /><span>Please read before your trip</span></div>
                  <ul className="dd-safety-list">
                    {safetyPoints.map((pt, i) => <li key={i}><Icon name="checkCircle" size={14} /><span>{pt.trim()}</span></li>)}
                  </ul>
                  <div className="dd-safety-footer"><Icon name="headphones" size={14} /><span>24/7 Emergency Support Available</span></div>
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
   FAQ
═══════════════════════════════════════════════════════════ */
const FaqSection = ({ d }) => {
  const [openIdx, setOpenIdx] = useState(null);
  const [faqs, setFaqs] = useState(d.faqs || []);
  useEffect(() => { if (d.faqs?.length) setFaqs(d.faqs); }, [d.faqs]);

  const fallback = useMemo(() => [
    { id: "f1", question: `What is the best time to visit ${d.name}?`, answer: d.bestTimeToVisit || "Contact us for seasonal recommendations." },
    { id: "f2", question: `How difficult is ${d.name}?`,               answer: d.difficulty ? `Rated as ${d.difficulty}.` : "Varies. Contact us." },
    { id: "f3", question: "What permits are required?",                  answer: (d.practicalInfo?.permitsAndRegulations?.permitsRequired || []).join(", ") || "Our team handles all permits." },
    { id: "f4", question: "Is it safe?",                                 answer: d.safetyInfo || "Safety is our top priority." },
    { id: "f5", question: "What should I pack?",                         answer: (d.practicalInfo?.packing?.essentials || []).join(", ") || "Warm layers, waterproof gear, sturdy boots." },
  ], [d]);

  const displayFaqs = faqs.length > 0 ? faqs : fallback;

  return (
    <section className="dd-section dd-section--soft">
      <div className="dd-inner">
        <Reveal from="bottom">
          <SectionHead title="Frequently Asked Questions" desc={`Everything you need to know about ${d.name}`} />
        </Reveal>
        <div className="dd-faq-list">
          {displayFaqs.map((faq, i) => (
            <Reveal key={faq.id || i} from="bottom" delay={i * 45}>
              <div className={`dd-faq-item${openIdx === i ? " dd-faq-item--open" : ""}`}>
                <button className="dd-faq-btn"
                  onClick={() => setOpenIdx(prev => prev === i ? null : i)}
                  aria-expanded={openIdx === i}>
                  <span className="dd-faq-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="dd-faq-q">{faq.question}</span>
                  <span className="dd-faq-chevron"><Icon name="chevronDown" size={17} /></span>
                </button>
                <div className="dd-faq-body">
                  <div className="dd-faq-body__inner">
                    <p>{typeof faq.answer === "string" ? faq.answer.replace(/\*\*/g, "") : faq.answer}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal from="bottom" delay={200}>
          <div className="dd-faq-cta">
            <div className="dd-faq-cta__icon"><Icon name="messageCircle" size={26} /></div>
            <div className="dd-faq-cta__text">
              <h3>Still have questions?</h3>
              <p>Our experts are ready to help plan your trip to {d.name}.</p>
            </div>
            <div className="dd-faq-cta__btns">
              <Link to={`/booking?destination=${d.slug}`} className="dd-btn dd-btn--primary">
                <Icon name="calendarCheck" size={14} /> Book Now
              </Link>
              <Link to="/contact" className="dd-btn dd-btn--outline">
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
   MORE DESTINATIONS IN SAME COUNTRY
   — horizontal scrollable carousel with prev/next controls
═══════════════════════════════════════════════════════════ */
const MoreInCountrySection = ({ d }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const trackRef = useRef(null);

  const countryId   = d.country?.id || d.country?._id || d.countryId;
  const countrySlug = d.countrySlug  || d.country?.slug;
  const countryName = d.country?.name || "This Country";

  /* Fetch */
  useEffect(() => {
    if (!countryId && !countrySlug) { setLoading(false); return; }
    (async () => {
      try {
        const param = countryId ? `countryId=${countryId}` : `countrySlug=${countrySlug}`;
        const res   = await api.get(`/destinations?${param}&limit=12&sort=rating`);
        const data  = res.data?.destinations || res.data?.data || res.data || [];
        setDestinations(
          data.filter(dest =>
            dest.slug !== d.slug &&
            dest.id   !== d.id  &&
            dest._id  !== d._id
          ).slice(0, 10)
        );
      } catch { setDestinations([]); }
      finally { setLoading(false); }
    })();
  }, [countryId, countrySlug, d.slug, d.id, d._id]);

  /* Drag-to-scroll */
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const onMouseDown = useCallback(e => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
  }, []);
  const onMouseMove = useCallback(e => {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX);
  }, []);
  const onMouseUp = useCallback(() => {
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  }, []);

  /* Arrow scroll */
  const STEP = 320;
  const scrollBy = useCallback(dir => {
    trackRef.current?.scrollBy({ left: dir * STEP, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <section className="dd-more-section">
        <div className="dd-inner">
          <div className="dd-more-head-row">
            <SectionHead title={`More in ${countryName}`} center={false} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className="dd-rel-skel">
                <div className="dd-rel-skel__img" />
                <div className="dd-rel-skel__body">
                  <div className="dd-rel-skel__line" style={{ height: 18, width: "70%" }} />
                  <div className="dd-rel-skel__line" style={{ height: 13, width: "45%" }} />
                  <div className="dd-rel-skel__line" style={{ height: 13, width: "55%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!destinations.length) return null;

  return (
    <section className="dd-more-section">
      <div className="dd-inner">
        {/* Header row with controls */}
        <div className="dd-more-head-row">
          <Reveal from="left">
            <SectionHead
              title={`More in ${countryName}`}
              desc={`${destinations.length} more incredible destinations waiting for you`}
              center={false}
            />
          </Reveal>
          <Reveal from="right">
            <div className="dd-more-ctrl-group">
              <span className="dd-more-progress">
                {destinations.length} places
              </span>
              <button
                className="dd-more-ctrl-btn"
                onClick={() => scrollBy(-1)}
                aria-label="Scroll left"
              >
                <Icon name="chevronLeft" size={18} />
              </button>
              <button
                className="dd-more-ctrl-btn"
                onClick={() => scrollBy(1)}
                aria-label="Scroll right"
              >
                <Icon name="chevronRight" size={18} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Carousel track */}
        <div className="dd-more-track-wrap">
          <div
            className="dd-more-track"
            ref={trackRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {destinations.map((dest, i) => {
              const img = dest.heroImage || dest.imageUrl || (dest.images || [])[0] || (dest.gallery || [])[0]?.imageUrl;
              const slug     = dest.slug || dest.id;
              const rating   = dest.rating;
              const duration = dest.duration || (dest.durationDays ? `${dest.durationDays} days` : null);
              const desc     = dest.shortDescription || dest.description;

              return (
                <Link key={dest.id || i} to={`/destinations/${slug}`} className="dd-rel-card">
                  {/* Image */}
                  <div className="dd-rel-card__img-wrap">
                    {img
                      ? <img className="dd-rel-card__img" src={img} alt={dest.name} loading="lazy" />
                      : <div className="dd-rel-card__img-placeholder">
                          <Icon name="mountain" size={48} />
                        </div>
                    }
                    <div className="dd-rel-card__img-overlay" />

                    {/* Badge */}
                    {dest.isFeatured && (
                      <span className="dd-rel-card__badge dd-rel-card__badge--featured">
                        <Icon name="award" size={9} /> Featured
                      </span>
                    )}
                    {!dest.isFeatured && dest.isPopular && (
                      <span className="dd-rel-card__badge dd-rel-card__badge--popular">
                        <Icon name="sparkles" size={9} /> Trending
                      </span>
                    )}
                    {!dest.isFeatured && !dest.isPopular && dest.isNew && (
                      <span className="dd-rel-card__badge dd-rel-card__badge--new">
                        <Icon name="star" size={9} /> New
                      </span>
                    )}

                    {/* Rating */}
                    {rating && (
                      <div className="dd-rel-card__rating">
                        <Icon name="star" size={10} fill="currentColor" />
                        {rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="dd-rel-card__body">
                    <h3 className="dd-rel-card__name">{dest.name}</h3>

                    {(dest.country?.name || dest.location) && (
                      <div className="dd-rel-card__loc">
                        <Icon name="mapPin" size={11} />
                        {dest.country?.flag ? `${dest.country.flag} ` : ""}
                        {dest.location || dest.country?.name}
                      </div>
                    )}

                    {/* Chips */}
                    <div className="dd-rel-card__chips">
                      {duration && (
                        <span className="dd-rel-card__chip dd-rel-card__chip--dur">
                          <Icon name="clock" size={10} /> {duration}
                        </span>
                      )}
                      {dest.difficulty && (
                        <span className="dd-rel-card__chip dd-rel-card__chip--diff">
                          {dest.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Short description */}
                    {desc && (
                      <p className="dd-rel-card__desc">{desc}</p>
                    )}

                    {/* Footer */}
                    <div className="dd-rel-card__footer">
                      <span className="dd-rel-card__cta">
                        Explore destination
                        <Icon name="arrowRight" size={13} />
                      </span>
                      <div className="dd-rel-card__arrow-btn">
                        <Icon name="arrowRight" size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* View all */}
        {countrySlug && (
          <Reveal from="bottom" delay={100}>
            <div className="dd-more-viewall">
              <Link to={`/country/${countrySlug}`} className="dd-btn dd-btn--outline dd-btn--lg">
                <Icon name="globe" size={15} />
                View All Destinations in {countryName}
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   COMMENTS (second-to-last)
═══════════════════════════════════════════════════════════ */
const CommentsSection = ({ d }) => {
  const destId = d?.id || d?._id || d?.slug;
  const { comments, loading, createComment, error } = useDestinationComments(destId);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try { await createComment(destId, text.trim()); setText(""); }
    catch {} finally { setSubmitting(false); }
  };

  if (!destId) return null;

  return (
    <section className="dd-comments-section">
      <div className="dd-inner">
        <Reveal from="bottom">
          <SectionHead title="Community Discussion" desc={`Share your experience and read what others say about ${d.name}`} />
        </Reveal>
        <Reveal from="bottom" delay={80}>
          <div className="dd-comments-portal">
            <div className="dd-comments-portal__header">
              <div className="dd-comments-portal__header-icon">
                <Icon name="messageCircle" size={22} />
              </div>
              <div>
                <h3 className="dd-comments-portal__title">Share Your Thoughts</h3>
                <p className="dd-comments-portal__subtitle">Comments from fellow travellers</p>
              </div>
              <span className="dd-comments-portal__count">{comments.length}</span>
            </div>

            {error && (
              <div className="dd-alert dd-alert--warn" style={{ marginBottom: 16 }}>
                <Icon name="alertTriangle" size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="dd-comments-form">
              <input type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder={`Write a comment about ${d.name}...`}
                maxLength={500} className="dd-comments-form__input" />
              <button type="submit" disabled={submitting || !text.trim()} className="dd-comments-form__btn">
                {submitting ? "Posting…" : "Post Comment"}
              </button>
            </form>

            <div>
              {comments.map(c => (
                <div key={c.id} className="dd-comment-item">
                  <div className="dd-comment-item__header">
                    <div className="dd-comment-item__avatar">
                      {(c.user?.name || c.authorName || "A")[0]}
                    </div>
                    <div>
                      <div className="dd-comment-item__name">{c.user?.name || c.authorName || "Anonymous"}</div>
                      <div className="dd-comment-item__date">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <p className="dd-comment-item__text">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && !loading && (
                <p className="dd-comments-empty">
                  No comments yet — be the first to share your experience!
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════
   END CTA — absolute last thing on the page
═══════════════════════════════════════════════════════════ */
const EndCta = ({ d, navigate }) => (
  <section className="dd-end-cta">
    <div className="dd-inner">
      <Reveal from="bottom">
        <div className="dd-end-cta__inner">
          <div className="dd-end-cta__left">
            <div className="dd-end-cta__icon">
              <Icon name="calendarCheck" size={28} />
            </div>
            <div className="dd-end-cta__text">
              <h3>Ready to experience {d.name}?</h3>
              <p>Book today and secure your spot. Limited availability.</p>
            </div>
          </div>
          <div className="dd-end-cta__btns">
            <button
              className="dd-btn dd-btn--primary dd-btn--lg"
              onClick={() => navigate(`/booking?destination=${d.slug}`)}>
              <Icon name="calendarCheck" size={16} /> Book Now
            </button>
            <button
              className="dd-btn dd-btn--ghost dd-btn--lg"
              onClick={() => navigate("/contact")}>
              <Icon name="mail" size={15} /> Enquire
            </button>
          </div>
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
  const navigate   = useNavigate();
  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [identifier]);

  if (loading)             return <div className="dd-page"><SkeletonPage /></div>;
  if (error || !destination) return <div className="dd-page"><ErrorPage error={error} navigate={navigate} /></div>;

  const d = destination;

  return (
    <ScrollProvider>
      <div className="dd-page">
        <ProgressBar />

        <PageHeader
          title={d.name}
          subtitle={d.tagline || `Discover the incredible beauty and experiences awaiting you at ${d.name}`}
          backgroundImage={d.heroImage || d.imageUrl}
          breadcrumbs={[
            { label: "Explore", path: "/explore" },
            { label: "Destinations", path: "/destinations" },
            d.country?.name ? { label: d.country.name, path: `/country/${d.countrySlug || d.country?.slug}` } : null,
            { label: d.name },
          ].filter(Boolean)}
          height="620px"
          align="center"
        />
        
        <div style={{ marginTop: "-80px" }}>
          <AboutSection      d={d} />
          <MediaShowcase     d={d} />
          <HighlightsSection d={d} />
          <DeepDiveSection   d={d} />
          <TipsSafetySection d={d} />
          <FaqSection        d={d} />
          <MoreInCountrySection d={d} />
          <CommentsSection   d={d} />
          <EndCta            d={d} navigate={navigate} />
        </div>
      </div>
    </ScrollProvider>
  );
};

export default DestinationDetail;