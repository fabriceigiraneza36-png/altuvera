// src/pages/DestinationDetail.jsx
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  createContext, useContext,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import { useUserAuth } from "../context/UserAuthContext";
import { api } from "../utils/api";
import PageHeader from "../components/common/PageHeader";
import CommentsCarousel from "./CommentsCarousel";
import "../styles/DestinationDetail.css";

/* ══════════════════════════════════════════════════════════════
   ICON SYSTEM — inline SVG, no emoji
══════════════════════════════════════════════════════════════ */
const P = {
  mapPin:        "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 100 6 3 3 0 000-6z",
  clock:         "M12 2a10 10 0 100 20A10 10 0 0012 2zm.5 5H11v6l5.2 3.2.8-1.3-4.5-2.7V7z",
  star:          "M12 2l3.1 6.3L22 9.3l-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.1 2 9.3l6.9-1L12 2z",
  users:         "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
  calendar:      "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  globe:         "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z",
  compass:       "M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 5.8l-2.1 6.4-6.4 2.1 2.1-6.4 6.4-2.1z",
  camera:        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  eye:           "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:             "M18 6L6 18M6 6l12 12",
  chevLeft:      "M15 18l-6-6 6-6",
  chevRight:     "M9 18l6-6-6-6",
  chevDown:      "M6 9l6 6 6-6",
  chevUp:        "M18 15l-6-6-6 6",
  check:         "M20 6L9 17l-5-5",
  checkCircle:   "M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3",
  shield:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mail:          "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:         "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 3h3a2 2 0 012 1.7c.1.9.4 1.7.7 2.5a2 2 0 01-.4 2.1l-1.3 1.3a16 16 0 006.3 6.3l1.3-1.3a2 2 0 012.1-.4c.8.3 1.6.5 2.5.7a2 2 0 011.7 2.1z",
  arrowRight:    "M5 12h14M12 5l7 7-7 7",
  sparkles:      "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  alertTri:      "M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4m0 4h.01",
  info:          "M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4m0-4h.01",
  lightbulb:     "M9 21h6m-3-18a6 6 0 00-4 10.5V17a1 1 0 001 1h6a1 1 0 001-1v-3.5A6 6 0 0012 3z",
  backpack:      "M4 10l-.3 8.2A2 2 0 005.7 20h12.7a2 2 0 002-1.8L20 10M4 10h16M4 10l1-6h14l1 6",
  barChart:      "M18 20V10M12 20V4M6 20v-6",
  creditCard:    "M1 4h22v16H1zM1 10h22",
  map:           "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16m8-12v16",
  mountain:      "M8 3l4 8 5-5 5 15H2L8 3z",
  thermometer:   "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
  droplet:       "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  snowflake:     "M12 2v20m5.7-16.3L12 12M6.3 6.3L12 12m10 0H2m15.7 5.7L12 12M6.3 17.7L12 12",
  coffee:        "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  car:           "M16 3H5a2 2 0 00-2 2v7a2 2 0 002 2h1m10 0h3a2 2 0 002-2V8a2 2 0 00-2-2h-2l-1-3zM9 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z",
  plane:         "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  award:         "M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  zoomIn:        "M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.3-4.3M11 8v6m-3-3h6",
  external:      "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  heart:         "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 000-7.8z",
  bookmark:      "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  flag:          "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  wallet:        "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22",
  plus:          "M12 5v14M5 12h14",
  minus:         "M5 12h14",
  send:          "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  route:         "M3 7h2.6c.3 0 .5.1.7.3l2.4 2.4c.2.2.5.3.7.3h3.2c.3 0 .5-.1.7-.3l2.4-2.4c.2-.2.4-.3.7-.3H21",
  grid:          "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  list:          "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  sparkle2:      "M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z",
  binoculars:    "M21 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM10 12.5h4",
};

const Ic = ({
  n, size = 20, cls = "", sw = 1.8, fill = "none", style = {},
}) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={cls}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    <path d={P[n] || P.compass} />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════════════════ */
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
    <div className="dp">
      <div className="dp__bar" style={{ transform: `scaleX(${p})`, transformOrigin: "left" }} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════ */
function useSlideshow(len, ms = 5000) {
  const [idx, setIdx] = useState(0);
  const t = useRef(null);
  const restart = useCallback(() => {
    clearInterval(t.current);
    if (len <= 1) return;
    t.current = setInterval(() => setIdx(i => (i + 1) % len), ms);
  }, [len, ms]);
  useEffect(() => { restart(); return () => clearInterval(t.current); }, [restart]);
  return {
    idx,
    goTo:   useCallback(i => { setIdx(i); restart(); }, [restart]),
    goNext: useCallback(() => { setIdx(i => (i + 1) % len); restart(); }, [len, restart]),
    goPrev: useCallback(() => { setIdx(i => (i - 1 + len) % len); restart(); }, [len, restart]),
  };
}

const useInView = ({ threshold = 0.06, once = true } = {}) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); if (once) obs.disconnect(); }
      else if (!once) setVis(false);
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return [ref, vis];
};

/* ══════════════════════════════════════════════════════════════
   REVEAL
══════════════════════════════════════════════════════════════ */
const Reveal = ({
  children, from = "bottom", delay = 0, distance = 20, className = "",
}) => {
  const [ref, vis] = useInView();
  const map = {
    bottom: `translateY(${distance}px)`,
    top:    `translateY(-${distance}px)`,
    left:   `translateX(-${distance}px)`,
    right:  `translateX(${distance}px)`,
    scale:  "scale(0.95)",
    none:   "none",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? "none" : (map[from] ?? map.bottom),
        transition: `opacity .5s cubic-bezier(.22,1,.36,1) ${delay}ms,
                     transform .5s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        willChange: "opacity,transform",
      }}
    >
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   SECTION HEADING  (uses .d-sh CSS)
══════════════════════════════════════════════════════════════ */
const SH = ({ title, sub, center = true, light = false, tag }) => (
  <div className={`d-sh${center ? " d-sh--c" : ""}${light ? " d-sh--light" : ""}`}>
    {tag && <span className="d-stag">{tag}</span>}
    <h2 className="d-sh__t">{title}</h2>
    {sub && <p className="d-sh__s">{sub}</p>}
    <div className="d-sh__bar" />
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SKELETON / ERROR
══════════════════════════════════════════════════════════════ */
const Bone = ({ w = "100%", h = 16, r = 8 }) => (
  <div className="d-bone" style={{ width: w, height: h, borderRadius: r }} />
);

const SkeletonPage = () => (
  <div className="d-page">
    <div className="d-skel-hero" />
    <div className="d-wrap">
      <div className="d-skel-row" style={{ marginTop: 48 }}>
        {[80, 60, 75, 55, 70, 65].map((w, i) => (
          <Bone key={i} w={`${w}%`} h={14} r={6} />
        ))}
      </div>
    </div>
  </div>
);

const ErrorPage = ({ error, navigate }) => (
  <div className="d-page">
    <div className="d-error">
      <div className="d-error__glow" />
      <div className="d-error__circle">
        <Ic n="map" size={38} />
      </div>
      <h2>Destination Not Found</h2>
      <p>{error || "This destination doesn't exist or may have been removed."}</p>
      <div className="d-error__btns">
        <button onClick={() => navigate(-1)} className="d-btn d-btn--outline">
          <Ic n="chevLeft" size={15} /> Go Back
        </button>
        <button onClick={() => navigate("/destinations")} className="d-btn d-btn--emerald">
          <Ic n="compass" size={15} /> Browse All
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════════════ */
const Lightbox = ({ images, idx, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const fn = e => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="d-lb">
      <div className="d-lb__bd" onClick={onClose} />
      <button className="d-lb__x" onClick={onClose} aria-label="Close">
        <Ic n="x" size={18} />
      </button>
      <div className="d-lb__stage">
        <img src={images[idx]} alt="" className="d-lb__img" />
      </div>
      {images.length > 1 && (
        <>
          <button className="d-lb__arr d-lb__arr--p" onClick={onPrev} aria-label="Previous">
            <Ic n="chevLeft" size={20} />
          </button>
          <button className="d-lb__arr d-lb__arr--n" onClick={onNext} aria-label="Next">
            <Ic n="chevRight" size={20} />
          </button>
          <div className="d-lb__foot">
            <div className="d-lb__strip">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={`d-lb__thumb${i === idx ? " on" : ""}`}
                  onClick={() => {
                    /* bubble up via onNext/onPrev proxy – simplest: call goTo */
                  }}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <span className="d-lb__count">{idx + 1} / {images.length}</span>
          </div>
        </>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
const Hero = ({ d, navigate }) => {
  const slides = useMemo(() => {
    const all = [
      d.heroImage, d.imageUrl,
      ...(d.images  || []),
      ...(d.gallery || []).map(g => g.imageUrl),
    ].filter(Boolean);
    return [...new Set(all)].slice(0, 8);
  }, [d]);

  const { idx, goTo } = useSlideshow(slides.length, 6500);

  const stats = [
    d.durationDays                    && { icon: "clock",    n: d.durationDays,                   l: "Days"       },
    (d.activities || []).length > 0   && { icon: "compass",  n: `${(d.activities || []).length}+`, l: "Activities" },
    d.rating                          && { icon: "star",     n: d.rating.toFixed(1),               l: "Rating"     },
  ].filter(Boolean);

  return (
    <header className="d-hero">
      {/* Slides */}
      <div className="d-hero__slides">
        {slides.length > 0 ? slides.map((src, i) => (
          <div key={i} className={`d-hero__slide${i === idx ? " active" : ""}`}>
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        )) : (
          <div className="d-hero__slide d-hero__slide--empty active">
            <Ic n="mountain" size={80} />
          </div>
        )}
      </div>
      <div className="d-hero__ov" />

      {/* Breadcrumb */}
      <nav className="d-hero__nav">
        <div className="d-wrap">
          <ol className="d-hero__crumbs">
            {[
              { label: "Explore",      path: "/explore" },
              { label: "Destinations", path: "/destinations" },
              d.country?.name && { label: d.country.name, path: `/country/${d.countrySlug || d.country?.slug}` },
            ].filter(Boolean).map((bc, i) => (
              <li key={i}>
                <Link to={bc.path}>{bc.label}</Link>
              </li>
            ))}
            <li aria-current="page">{d.name}</li>
          </ol>
        </div>
      </nav>

      {/* Body */}
      <div className="d-wrap" style={{ position: "relative", zIndex: 5 }}>
        <div className="d-hero__body">
          {d.country?.name && (
            <div className="d-hero__loc">
              <Ic n="mapPin" size={12} />
              <span style={{ letterSpacing: "3px", fontSize: ".76rem", fontWeight: 700 }}>
                {d.country.flag && `${d.country.flag} `}{d.country.name.toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="d-hero__title">{d.name}</h1>

          {d.tagline && <p className="d-hero__sub">{d.tagline}</p>}

          <div className="d-hero__ctas">
            <button
              className="d-btn d-btn--emerald d-btn--lg"
              onClick={() => navigate(`/booking?destination=${d.slug}`)}
            >
              <Ic n="calendar" size={17} /> Book This Destination
            </button>
            <button
              className="d-btn d-btn--glass d-btn--lg"
              onClick={() => document.getElementById("dd-about")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Ic n="chevDown" size={17} /> Explore
            </button>
          </div>

          {stats.length > 0 && (
            <div className="d-hero__stats">
              {stats.map((s, i) => (
                <div key={i} className="d-hero__stat">
                  <div className="d-hero__stat-n">{s.n}</div>
                  <div className="d-hero__stat-l">
                    <Ic n={s.icon} size={12} style={{ marginRight: 5, opacity: .7 }} />
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="d-hero__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`d-hero__dot${i === idx ? " on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div className="d-hero__scroll">
        <span>SCROLL</span>
        <Ic n="chevDown" size={16} cls="d-hero__bounce" />
      </div>
    </header>
  );
};

/* ══════════════════════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════════════════════ */
const AboutSection = ({ d, navigate }) => {
  const desc = d.description || d.shortDescription || d.overview;
  if (!desc && !d.highlights?.length) return null;

  /* Aside slider */
  const asideImgs = useMemo(() => {
    const all = [
      d.heroImage, d.imageUrl,
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images  || []),
    ].filter(Boolean);
    return [...new Set(all)].slice(0, 8);
  }, [d]);
  const { idx, goTo, goNext, goPrev } = useSlideshow(asideImgs.length, 4500);

  const statCards = [
    d.country?.name      && { icon: "mapPin",   label: "Location",    val: d.country.name,                          link: `/country/${d.countrySlug || d.country?.slug}` },
    d.duration           && { icon: "clock",    label: "Duration",    val: d.duration                                                    },
    d.difficulty         && { icon: "barChart", label: "Difficulty",  val: d.difficulty                                                  },
    d.bestTimeToVisit    && { icon: "calendar", label: "Best Season", val: d.bestTimeToVisit                                             },
    d.rating             && { icon: "star",     label: "Rating",      val: `${d.rating.toFixed(1)} / 5`                                  },
    (d.minGroupSize && d.maxGroupSize) && { icon: "users", label: "Group Size", val: `${d.minGroupSize}–${d.maxGroupSize}` },
    d.altitude_meters    && { icon: "mountain", label: "Altitude",    val: `${d.altitude_meters} m`                                      },
    d.nearestCity        && { icon: "mapPin",   label: "Nearest City",val: d.nearestCity                                                 },
  ].filter(Boolean);

  return (
    <section id="dd-about" className="d-sec d-sec--white">
      <div className="d-wrap">
        <div className="d-about">
          {/* ── MAIN ── */}
          <div className="d-about__main">
            <Reveal from="left">
              {d.destinationType && (
                <span className="d-stag">
                  <Ic n="compass" size={11} style={{ marginRight: 5 }} />
                  {d.destinationType}
                </span>
              )}
              <h2 className="d-about__title">Discover {d.name}</h2>
            </Reveal>

            {desc && (
              <Reveal from="left" delay={60}>
                <div className="d-prose">
                  {desc.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}

            {statCards.length > 0 && (
              <Reveal from="bottom" delay={120}>
                <div className="d-about__stats-grid">
                  {statCards.map((s, i) => (
                    <div key={i} className="d-about__stat-card">
                      <div className="d-about__stat-icon">
                        <Ic n={s.icon} size={16} />
                      </div>
                      <span className="d-about__stat-l">{s.label}</span>
                      <span className="d-about__stat-v">
                        {s.link
                          ? <Link to={s.link} className="d-about__stat-link">{s.val}</Link>
                          : s.val}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal from="bottom" delay={180}>
              <div className="d-about__book-row">
                <button
                  className="d-btn d-btn--emerald"
                  onClick={() => navigate(`/booking?destination=${d.slug}`)}
                >
                  <Ic n="calendar" size={15} /> Reserve Your Spot
                </button>
                <button
                  className="d-btn d-btn--outline"
                  onClick={() => navigate("/contact")}
                >
                  <Ic n="mail" size={15} /> Send Enquiry
                </button>
              </div>
            </Reveal>
          </div>

          {/* ── ASIDE ── */}
          <aside className="d-about__aside">
            <Reveal from="right" delay={60}>
              {asideImgs.length > 0 && (
                <div className="d-aside-slider">
                  <div className="d-aside-slider__track">
                    {asideImgs.map((src, i) => (
                      <div
                        key={i}
                        className={`d-aside-slider__slide${
                          i === idx ? " active" : i === (idx - 1 + asideImgs.length) % asideImgs.length ? " was" : " will"
                        }`}
                      >
                        <img src={src} alt={`${d.name} ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} />
                      </div>
                    ))}
                  </div>
                  {asideImgs.length > 1 && (
                    <>
                      <button className="d-aside-slider__arr d-aside-slider__arr--p" onClick={goPrev} aria-label="Previous">
                        <Ic n="chevLeft" size={14} />
                      </button>
                      <button className="d-aside-slider__arr d-aside-slider__arr--n" onClick={goNext} aria-label="Next">
                        <Ic n="chevRight" size={14} />
                      </button>
                      <div className="d-aside-slider__dots">
                        {asideImgs.map((_, i) => (
                          <button
                            key={i}
                            className={`d-aside-slider__dot${i === idx ? " on" : ""}`}
                            onClick={() => goTo(i)}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                      <div className="d-aside-slider__counter">
                        {idx + 1} / {asideImgs.length}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Reveal>

            <Reveal from="right" delay={130}>
              <div className="d-aside-details">
                <div className="d-aside-details__hdr">
                  {d.country?.flag && (
                    <span className="d-aside-details__flag">{d.country.flag}</span>
                  )}
                  <div>
                    <span className="d-aside-details__sub">Destination</span>
                    <span className="d-aside-details__country">{d.name}</span>
                  </div>
                </div>
                <ul className="d-aside-details__list">
                  {[
                    { icon: "mapPin",   label: "Country",     val: d.country?.name, link: `/country/${d.countrySlug || d.country?.slug}` },
                    { icon: "clock",    label: "Duration",    val: d.duration || (d.durationDays ? `${d.durationDays} days` : null) },
                    { icon: "calendar", label: "Best Time",   val: d.bestTimeToVisit },
                    { icon: "barChart", label: "Difficulty",  val: d.difficulty },
                    { icon: "users",    label: "Group",       val: (d.minGroupSize && d.maxGroupSize) ? `${d.minGroupSize}–${d.maxGroupSize} people` : null },
                    { icon: "plane",    label: "Airport",     val: d.nearestAirport || d.howToGetThere?.nearestAirport },
                  ].filter(s => s.val).map((s, i) => (
                    <li key={i} className="d-aside-details__item">
                      <div className="d-aside-details__item-icon">
                        <Ic n={s.icon} size={14} />
                      </div>
                      <div>
                        <span className="d-aside-details__item-label">{s.label}</span>
                        <span className="d-aside-details__item-val">
                          {s.link
                            ? <Link to={s.link} className="d-aside-details__item-link">{s.val}</Link>
                            : s.val}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="d-aside-details__foot">
                  <button
                    className="d-btn d-btn--emerald d-btn--full"
                    onClick={() => navigate(`/booking?destination=${d.slug}`)}
                  >
                    <Ic n="calendar" size={15} /> Book Now
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

/* ══════════════════════════════════════════════════════════════
   HIGHLIGHTS & ACTIVITIES
══════════════════════════════════════════════════════════════ */
const HighlightsSection = ({ d }) => {
  const highlights = d.highlights || [];
  const activities = d.activities || [];
  if (!highlights.length && !activities.length) return null;

  const imgPool = useMemo(() => {
    const all = [
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images  || []),
      d.heroImage, d.imageUrl,
    ].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  const items = [
    ...highlights.map((h, i) => ({
      text: h, type: "Highlight", icon: "sparkles",
      img: imgPool[i % Math.max(imgPool.length, 1)],
      desc: `Experience the wonder of ${h}.`,
    })),
    ...activities.map((a, i) => ({
      text: a, type: "Activity", icon: "compass",
      img: imgPool[(highlights.length + i) % Math.max(imgPool.length, 1)],
      desc: `Expert-guided ${a} experiences await.`,
    })),
  ].slice(0, 9);

  return (
    <section className="d-sec d-sec--soft">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title={`What Makes ${d.name} Unforgettable`}
            sub="Hover any card to discover the details"
          />
        </Reveal>

        <div className="d-exp-grid">
          {items.map((item, i) => (
            <Reveal key={i} from="scale" delay={i * 40}>
              <div className="d-exp-card">
                <div className="d-exp-card__media">
                  {item.img
                    ? <img src={item.img} alt={item.text} loading="lazy" />
                    : (
                      <div className="d-exp-card__placeholder">
                        <Ic n={item.icon} size={48} />
                      </div>
                    )
                  }
                  <div className="d-exp-card__overlay">
                    <span className="d-exp-card__ov-tag">
                      <Ic n={item.icon} size={10} style={{ marginRight: 4 }} />
                      {item.type}
                    </span>
                    <h4 className="d-exp-card__ov-title">{item.text}</h4>
                    <p className="d-exp-card__ov-desc">{item.desc}</p>
                    <div className="d-exp-card__ov-icon">
                      <Ic n="arrowRight" size={14} />
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

/* ══════════════════════════════════════════════════════════════
   GALLERY
══════════════════════════════════════════════════════════════ */
const GallerySection = ({ d }) => {
  const [view, setView]   = useState("mosaic"); // "mosaic" | "list"
  const [lb, setLb]       = useState({ open: false, idx: 0 });

  const imgs = useMemo(() => {
    const all = [
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images  || []),
      d.heroImage, d.imageUrl,
    ].filter(Boolean);
    return [...new Set(all)].slice(0, 12);
  }, [d]);

  if (!imgs.length) return null;

  const open  = i => setLb({ open: true, idx: i });
  const close = ()  => setLb({ open: false, idx: 0 });
  const prev  = ()  => setLb(p => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
  const next  = ()  => setLb(p => ({ ...p, idx: (p.idx + 1) % imgs.length }));

  return (
    <section className="d-sec d-sec--white">
      <div className="d-wrap">
        <div className="d-gal-top">
          <Reveal from="left">
            <SH
              title="Photo Gallery"
              sub={`${imgs.length} photos from ${d.name}`}
              center={false}
            />
          </Reveal>
          <Reveal from="right">
            <div className="d-gal-controls">
              <button
                className={`d-gal-btn${view === "mosaic" ? " on" : ""}`}
                onClick={() => setView("mosaic")}
              >
                <Ic n="grid" size={14} /> <span>Grid</span>
              </button>
              <button
                className={`d-gal-btn${view === "list" ? " on" : ""}`}
                onClick={() => setView("list")}
              >
                <Ic n="list" size={14} /> <span>List</span>
              </button>
            </div>
          </Reveal>
        </div>

        {view === "mosaic" ? (
          <div className="d-gal-mosaic">
            {imgs.map((src, i) => (
              <Reveal key={i} from="scale" delay={i * 30}>
                <button className="d-gal-cell" onClick={() => open(i)} aria-label={`View photo ${i + 1}`}>
                  <img src={src} alt={`${d.name} photo ${i + 1}`} loading="lazy" />
                  <div className="d-gal-cell__ov">
                    <Ic n="zoomIn" size={22} />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="d-gal-list">
            {imgs.map((src, i) => (
              <Reveal key={i} from="left" delay={i * 25}>
                <button className="d-gal-list__row" onClick={() => open(i)} aria-label={`View photo ${i + 1}`}>
                  <div className="d-gal-list__thumb">
                    <img src={src} alt={`${d.name} ${i + 1}`} loading="lazy" />
                  </div>
                  <div className="d-gal-list__info">
                    <span className="d-gal-list__num">Photo {String(i + 1).padStart(2, "0")}</span>
                    <span className="d-gal-list__name">{d.name} — View {i + 1}</span>
                  </div>
                  <Ic n="chevRight" size={16} cls="d-gal-list__icon" />
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {lb.open && (
        <Lightbox
          images={imgs} idx={lb.idx}
          onClose={close} onPrev={prev} onNext={next}
        />
      )}
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   WILDLIFE
══════════════════════════════════════════════════════════════ */
const WildlifeSection = ({ d }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;

  const imgPool = useMemo(() => {
    const all = [
      ...(d.gallery || []).map(g => g.imageUrl),
      ...(d.images  || []),
      d.heroImage, d.imageUrl,
    ].filter(Boolean);
    return [...new Set(all)];
  }, [d]);

  return (
    <section className="d-sec d-sec--soft">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title="Wildlife Encounters"
            sub={`Remarkable wildlife you may encounter at ${d.name}`}
          />
        </Reveal>
        <div className="d-wildlife-grid">
          {list.slice(0, 8).map((animal, i) => (
            <Reveal key={i} from="scale" delay={i * 40}>
              <div className="d-wildlife-card">
                {imgPool[i % Math.max(imgPool.length, 1)] ? (
                  <img
                    src={imgPool[i % Math.max(imgPool.length, 1)]}
                    alt={animal}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#166534",
                  }}>
                    <Ic n="binoculars" size={36} />
                  </div>
                )}
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

/* ══════════════════════════════════════════════════════════════
   DEEP DIVE
══════════════════════════════════════════════════════════════ */
const HighlightBox = ({ icon = "check", children }) => (
  <div className="d-deepdive__highlight-box">
    <Ic n={icon} size={15} />
    <span>{children}</span>
  </div>
);

const SubLabel = ({ children }) => (
  <p className="d-deepdive__sub-label">{children}</p>
);

const Block = ({ icon, title, children, full = false, from = "left", delay = 0 }) => (
  <Reveal from={from} delay={delay}>
    <div className={`d-deepdive__block${full ? " d-deepdive__block--full" : ""}`}>
      <div className="d-deepdive__block-icon">
        <Ic n={icon} size={20} />
      </div>
      <h3>{title}</h3>
      {children}
    </div>
  </Reveal>
);

const UL = ({ items, icon = "checkCircle", cols = false }) => (
  <ul className={`d-deepdive__ul${cols ? " d-deepdive__ul--cols" : ""}`}>
    {items.map((item, i) => (
      <li key={i}>
        <Ic n={icon} size={13} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const OL = ({ items }) => (
  <ol className="d-deepdive__ol">
    {items.map((item, i) => (
      <li key={i}>
        <span className="d-deepdive__ol-num">{String(i + 1).padStart(2, "0")}</span>
        <span>{item}</span>
      </li>
    ))}
  </ol>
);

const PillList = ({ items, danger = false }) => (
  <ul className="d-deepdive__pill-list">
    {items.map((m, i) => (
      <li key={i} className={`d-deepdive__pill ${danger ? "d-deepdive__pill--red" : "d-deepdive__pill--green"}`}>
        {m}
      </li>
    ))}
  </ul>
);

const DDAlert = ({ warn, icon, children }) => (
  <div className={`d-deepdive__alert ${warn ? "d-deepdive__alert--warn" : "d-deepdive__alert--info"}`}>
    <Ic n={icon || (warn ? "alertTri" : "info")} size={15} />
    <span>{children}</span>
  </div>
);

const Prose = ({ text }) => (
  <div className="d-deepdive__prose">
    {(text || "").split("\n\n").filter(Boolean).map((p, i) => (
      <p key={i}>{p}</p>
    ))}
  </div>
);

const DeepDiveSection = ({ d, navigate }) => {
  const hasAny =
    d.overview || d.description || d.whatToExpect ||
    d.gettingThere || d.bestTimeToVisit ||
    d.highlights?.length || d.activities?.length || d.practicalInfo;

  if (!hasAny) return null;

  const pi      = d.practicalInfo;
  const climate = pi?.climate;
  const packing = pi?.packing;
  const health  = pi?.healthAndSafety;
  const permits = pi?.permitsAndRegulations;

  return (
    <section className="d-sec d-sec--leaf">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title={`Complete Guide to ${d.name}`}
            sub="Everything you need to plan an unforgettable visit"
          />
        </Reveal>

        <div className="d-deepdive__grid">

          {(d.overview || d.description) && (
            <Block icon="globe" title="Overview" full from="bottom">
              <Prose text={d.overview || d.description} />
            </Block>
          )}

          {d.whatToExpect && (
            <Block icon="eye" title="What to Expect" from="left" delay={40}>
              <Prose text={d.whatToExpect} />
            </Block>
          )}

          {(d.bestTimeToVisit || climate) && (
            <Block icon="thermometer" title="Climate & Best Time" from="right" delay={40}>
              {d.bestTimeToVisit && (
                <HighlightBox icon="calendar">
                  <strong>Best Season:</strong> {d.bestTimeToVisit}
                </HighlightBox>
              )}
              {climate?.climateNotes && (
                <p className="d-deepdive__para">{climate.climateNotes}</p>
              )}
              {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
                <div className="d-deepdive__temp-row">
                  {climate.avgTempLowC  != null && (
                    <span className="d-deepdive__temp-chip d-deepdive__temp-chip--low">
                      <Ic n="snowflake" size={12} /> Low: {climate.avgTempLowC}°C
                    </span>
                  )}
                  {climate.avgTempHighC != null && (
                    <span className="d-deepdive__temp-chip d-deepdive__temp-chip--high">
                      <Ic n="thermometer" size={12} /> High: {climate.avgTempHighC}°C
                    </span>
                  )}
                </div>
              )}
              {climate?.bestMonths?.length > 0 && (
                <><SubLabel>Best months</SubLabel><PillList items={climate.bestMonths} /></>
              )}
              {climate?.avoidMonths?.length  > 0 && (
                <><SubLabel>Avoid</SubLabel><PillList items={climate.avoidMonths} danger /></>
              )}
            </Block>
          )}

          {d.highlights?.length > 0 && (
            <Block icon="sparkles" title="Key Highlights" from="left" delay={60}>
              <OL items={d.highlights} />
            </Block>
          )}

          {d.activities?.length > 0 && (
            <Block icon="compass" title="Activities" from="right" delay={60}>
              <UL items={d.activities} icon="checkCircle" />
            </Block>
          )}

          {(d.gettingThere || d.howToGetThere?.generalInfo) && (
            <Block icon="map" title="Getting There" from="left" delay={80}>
              <Prose text={d.gettingThere || d.howToGetThere?.generalInfo} />
              {d.howToGetThere?.nearestAirport && (
                <HighlightBox icon="plane">
                  <strong>Nearest Airport:</strong> {d.howToGetThere.nearestAirport}
                </HighlightBox>
              )}
              {d.howToGetThere?.driveTimeFromCapital && (
                <HighlightBox icon="car">
                  <strong>Drive time:</strong> {d.howToGetThere.driveTimeFromCapital}
                </HighlightBox>
              )}
              {d.howToGetThere?.transportOptions?.length > 0 && (
                <><SubLabel>Transport Options</SubLabel>
                <UL items={d.howToGetThere.transportOptions} icon="route" /></>
              )}
            </Block>
          )}

          {(health?.vaccinationsRequired?.length || health?.malariaRisk || health?.safetyNotes) && (
            <Block icon="shield" title="Health & Safety" from="right" delay={80}>
              {health.malariaRisk && (
                <DDAlert warn>
                  Malaria risk: <strong>{health.malariaRisk}</strong>
                </DDAlert>
              )}
              {health.safetyNotes && <p className="d-deepdive__para">{health.safetyNotes}</p>}
              {health.vaccinationsRequired?.length > 0 && (
                <><SubLabel>Required vaccinations</SubLabel>
                <UL items={health.vaccinationsRequired} icon="checkCircle" /></>
              )}
              {health.vaccinationsRecommended?.length > 0 && (
                <><SubLabel>Recommended</SubLabel>
                <UL items={health.vaccinationsRecommended} /></>
              )}
              {health.waterSafety && (
                <HighlightBox icon="droplet">{health.waterSafety}</HighlightBox>
              )}
            </Block>
          )}

          {(packing?.essentials?.length || packing?.clothingTips) && (
            <Block icon="backpack" title="What to Pack" from="left" delay={100}>
              {packing.clothingTips && (
                <p className="d-deepdive__para">{packing.clothingTips}</p>
              )}
              {packing.essentials?.length > 0 && (
                <><SubLabel>Essentials</SubLabel>
                <UL items={packing.essentials} cols icon="check" /></>
              )}
              {packing.gearRecommendations?.length > 0 && (
                <><SubLabel>Gear</SubLabel>
                <UL items={packing.gearRecommendations} /></>
              )}
            </Block>
          )}

          {permits?.permitsRequired?.length > 0 && (
            <Block icon="flag" title="Permits & Regulations" from="right" delay={100}>
              {permits.bookingLeadTime && (
                <HighlightBox icon="calendar">
                  <strong>Book ahead:</strong> {permits.bookingLeadTime}
                </HighlightBox>
              )}
              <UL items={permits.permitsRequired} icon="checkCircle" />
              {permits.permitCost && (
                <HighlightBox icon="creditCard">
                  Cost: <strong>{permits.permitCost}</strong>
                </HighlightBox>
              )}
              {permits.visitorLimits && (
                <DDAlert>Visitor limit: {permits.visitorLimits}</DDAlert>
              )}
            </Block>
          )}

          {(pi?.budget?.rangeUsd || pi?.budget?.entranceFeeUsd) && (
            <Block icon="wallet" title="Budget Guide (USD)" from="left" delay={120}>
              <div className="d-deepdive__budget-grid">
                {[
                  ["Budget Range",  pi.budget.rangeUsd],
                  ["Entrance Fee",  pi.budget.entranceFeeUsd],
                  ["Guide Cost",    pi.budget.guideCostUsd],
                  ["Meals",         pi.budget.mealCostRange],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label} className="d-deepdive__budget-item">
                    <span className="d-deepdive__budget-label">{label}</span>
                    <span className="d-deepdive__budget-val">{val}</span>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {(pi?.culture?.localEtiquette?.length || pi?.culture?.tippingCulture) && (
            <Block icon="coffee" title="Culture & Etiquette" from="right" delay={120}>
              {pi.culture.tippingCulture && (
                <p className="d-deepdive__para">
                  <strong>Tipping:</strong> {pi.culture.tippingCulture}
                </p>
              )}
              {pi.culture.photographyRules && (
                <HighlightBox icon="camera">{pi.culture.photographyRules}</HighlightBox>
              )}
              {pi.culture.localEtiquette?.length > 0 && (
                <><SubLabel>Local Etiquette</SubLabel>
                <UL items={pi.culture.localEtiquette} icon="checkCircle" /></>
              )}
            </Block>
          )}
        </div>

        {/* In-section book CTA */}
        <Reveal from="bottom" delay={100}>
          <div className="d-deepdive__book-cta">
            <div className="d-deepdive__book-cta__text">
              <h3>Ready to experience {d.name}?</h3>
              <p>Our expert guides are ready to craft your perfect itinerary.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="d-btn d-btn--white"
                onClick={() => navigate(`/booking?destination=${d.slug}`)}
              >
                <Ic n="calendar" size={15} /> Book Now
              </button>
              <button
                className="d-btn d-btn--glass"
                onClick={() => navigate("/contact")}
              >
                <Ic n="mail" size={15} /> Enquire
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   TIPS & SAFETY
══════════════════════════════════════════════════════════════ */
const TipsSafetySection = ({ d }) => {
  const localTips  = d.localTips;
  const safetyInfo = d.safetyInfo;
  if (!localTips && !safetyInfo) return null;

  const parseTips = raw => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw !== "string") return [String(raw)];
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      try { return JSON.parse(t).map(x => String(x).trim()).filter(Boolean); }
      catch {}
    }
    return [t];
  };

  const tips = parseTips(localTips);
  const safePts = safetyInfo
    ? (typeof safetyInfo === "string"
        ? safetyInfo.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8)
        : [String(safetyInfo)])
    : [];

  if (!tips.length && !safePts.length) return null;

  return (
    <section className="d-sec d-sec--white">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title="Tips & Safety"
            sub="Insider advice to make your visit safe and unforgettable"
          />
        </Reveal>

        <div className="d-tips-grid">
          {tips.length > 0 && (
            <Reveal from="left">
              <div className="d-tips-card">
                <div className="d-tips-card__hdr">
                  <div className="d-tips-card__hdr-icon">
                    <Ic n="lightbulb" size={22} />
                  </div>
                  <div>
                    <h3>Local Tips</h3>
                    <p>Insider advice from our expert guides</p>
                  </div>
                </div>
                <ul className="d-tips-list">
                  {tips.map((tip, i) => (
                    <li key={i} className="d-tips-list__item">
                      <span className="d-tips-list__num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="d-tips-list__text">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {safePts.length > 0 && (
            <Reveal from="right" delay={60}>
              <div className="d-safety-card">
                <div className="d-safety-card__hdr">
                  <div className="d-safety-card__hdr-icon">
                    <Ic n="shield" size={22} />
                  </div>
                  <div>
                    <h3>Safety Information</h3>
                    <p>Stay safe and well-prepared</p>
                  </div>
                </div>
                <div className="d-safety-card__body">
                  <div className="d-safety-card__alert">
                    <Ic n="alertTri" size={14} />
                    Please read before your trip
                  </div>
                  <ul className="d-safety-list">
                    {safePts.map((pt, i) => (
                      <li key={i} className="d-safety-list__item">
                        <Ic n="checkCircle" size={14} cls="d-safety-list__icon" />
                        <span>{pt.trim()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="d-safety-card__footer">
                    <Ic n="phone" size={14} />
                    24/7 Emergency Support Available
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

/* ══════════════════════════════════════════════════════════════
   MAP
══════════════════════════════════════════════════════════════ */
const MapSection = ({ d }) => {
  const lat = d.latitude  || d.coordinates?.lat;
  const lng = d.longitude || d.coordinates?.lng;
  if (!lat || !lng) return null;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.3}%2C${lat - 0.3}%2C${lng + 0.3}%2C${lat + 0.3}&layer=mapnik&marker=${lat}%2C${lng}`;
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <section className="d-sec d-sec--soft">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title="Location"
            sub={`Explore where ${d.name} sits on the map`}
          />
        </Reveal>
        <Reveal from="bottom" delay={60}>
          <div className="d-map-wrap">
            <div className="d-map-overlay">
              <span className="d-map-pin">
                <Ic n="mapPin" size={13} />
                {d.name}
              </span>
              {d.country?.name && (
                <span className="d-map-pin">
                  <Ic n="globe" size={13} />
                  {d.country.name}
                </span>
              )}
              <span className="d-map-zoom-badge">
                <Ic n="zoomIn" size={12} /> Live Map
              </span>
            </div>
            <div className="d-map-frame">
              <iframe
                src={src}
                title={`Map of ${d.name}`}
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="d-map-foot">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="d-map-link"
              >
                <Ic n="external" size={14} /> Open in Google Maps
              </a>
              <span className="d-map-coords">
                {Number(lat).toFixed(4)}°, {Number(lng).toFixed(4)}°
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════ */
const FaqSection = ({ d, navigate }) => {
  const [openIdx, setOpenIdx] = useState(null);

  const displayFaqs = useMemo(() => {
    if (d.faqs?.length) return d.faqs;
    return [
      { id: "f1", question: `What is the best time to visit ${d.name}?`,   answer: d.bestTimeToVisit || "Contact us for seasonal recommendations." },
      { id: "f2", question: `How difficult is ${d.name}?`,                 answer: d.difficulty ? `Rated as ${d.difficulty}.` : "Difficulty varies by experience level. Contact us for details." },
      { id: "f3", question: "What permits are required?",                   answer: (d.practicalInfo?.permitsAndRegulations?.permitsRequired || []).join(", ") || "Our team handles all necessary permits." },
      { id: "f4", question: "Is it safe to visit?",                        answer: d.safetyInfo || "Safety is our top priority — our guides are trained to the highest standards." },
      { id: "f5", question: "What should I pack?",                          answer: (d.practicalInfo?.packing?.essentials || []).join(", ") || "Warm layers, waterproof gear, sturdy boots, and sun protection." },
    ];
  }, [d]);

  return (
    <section className="d-sec d-sec--white">
      <div className="d-wrap">
        <Reveal from="bottom">
          <SH
            title="Frequently Asked Questions"
            sub={`Everything you need to know about ${d.name}`}
          />
        </Reveal>

        <div className="d-faq-list">
          {displayFaqs.map((faq, i) => {
            const open = openIdx === i;
            return (
              <Reveal key={faq.id || i} from="bottom" delay={i * 35}>
                <div className={`d-faq-item${open ? " d-faq-item--open" : ""}`}>
                  <button
                    className="d-faq-item__btn"
                    onClick={() => setOpenIdx(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="d-faq-item__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="d-faq-item__q">{faq.question}</span>
                    <span className="d-faq-item__icon">
                      {open ? <Ic n="chevUp" size={14} /> : <Ic n="chevDown" size={14} />}
                    </span>
                  </button>
                  <div className="d-faq-item__body">
                    <div className="d-faq-item__inner">
                      <p>{typeof faq.answer === "string" ? faq.answer.replace(/\*\*/g, "") : faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal from="bottom" delay={100}>
          <div className="d-faq-cta">
            <div className="d-faq-cta__icon">
              <Ic n="messageCircle" size={26} />
            </div>
            <div className="d-faq-cta__text">
              <h3>Still have questions?</h3>
              <p>Our destination specialists are happy to help you plan your trip.</p>
            </div>
            <div className="d-faq-cta__btns">
              <button
                className="d-btn d-btn--emerald"
                onClick={() => navigate("/contact")}
              >
                <Ic n="mail" size={15} /> Contact Us
              </button>
              <button
                className="d-btn d-btn--outline"
                onClick={() => navigate(`/booking?destination=${d.slug}`)}
              >
                <Ic n="calendar" size={15} /> Book Now
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   MORE IN COUNTRY
══════════════════════════════════════════════════════════════ */
const MoreInCountrySection = ({ d }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const trackRef = useRef(null);

  const countryId   = d.country?.id || d.country?._id || d.countryId;
  const countrySlug = d.countrySlug || d.country?.slug;
  const countryName = d.country?.name || "This Country";

  useEffect(() => {
    if (!countryId && !countrySlug) { setLoading(false); return; }
    (async () => {
      try {
        const param = countryId ? `countryId=${countryId}` : `countrySlug=${countrySlug}`;
        const res   = await api.get(`/destinations?${param}&limit=12&sort=rating`);
        const data  = res.data?.destinations || res.data?.data || res.data || [];
        setDestinations(
          data.filter(dest => dest.slug !== d.slug && dest.id !== d.id).slice(0, 10)
        );
      } catch { setDestinations([]); }
      finally  { setLoading(false); }
    })();
  }, [countryId, countrySlug, d.slug, d.id]);

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
    el.scrollLeft = drag.current.scrollLeft - (e.pageX - el.offsetLeft - drag.current.startX);
  }, []);
  const onMouseUp = useCallback(() => {
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  }, []);
  const scrollBy = useCallback(dir => (
    trackRef.current?.scrollBy({ left: dir * 310, behavior: "smooth" })
  ), []);

  if (loading) return (
    <section className="d-sec d-sec--soft">
      <div className="d-wrap">
        <SH title={`More in ${countryName}`} center={false} />
        <div style={{ display: "flex", gap: 18, overflow: "hidden" }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ minWidth: 270, borderRadius: 18, overflow: "hidden", flexShrink: 0, border: "1.5px solid #dcfce7" }}>
              <Bone w="100%" h={170} r={0} />
              <div style={{ padding: "14px 16px" }}>
                <Bone w="65%" h={15} r={6} />
                <Bone w="42%" h={11} r={5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!destinations.length) return null;

  return (
    <section className="d-sec d-sec--soft">
      <div className="d-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <Reveal from="left">
            <SH
              title={`More in ${countryName}`}
              sub={`${destinations.length} more incredible places await`}
              center={false}
            />
          </Reveal>
          <Reveal from="right">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {[
                { dir: -1, icon: "chevLeft",  label: "Scroll left"  },
                { dir:  1, icon: "chevRight", label: "Scroll right" },
              ].map(({ dir, icon, label }) => (
                <button
                  key={dir}
                  onClick={() => scrollBy(dir)}
                  aria-label={label}
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#fff", border: "1.5px solid #d1fae5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#166534",
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { background: "#ecfdf5", borderColor: "#86efac" })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { background: "#fff",    borderColor: "#d1fae5" })}
                >
                  <Ic n={icon} size={16} />
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display: "flex", gap: 18, overflowX: "auto",
            cursor: "grab", paddingBottom: 8, userSelect: "none",
            scrollbarWidth: "thin", scrollbarColor: "#a7f3d0 #f1f5f9",
          }}
        >
          {destinations.map((dest, i) => {
            const img      = dest.heroImage || dest.imageUrl || (dest.images || [])[0];
            const slug     = dest.slug || dest.id;
            const duration = dest.duration || (dest.durationDays ? `${dest.durationDays} days` : null);

            return (
              <Link
                key={dest.id || i}
                to={`/destinations/${slug}`}
                className="d-rev-card"
                style={{
                  minWidth: 280, maxWidth: 280, borderRadius: 18,
                  overflow: "hidden", flexShrink: 0,
                  textDecoration: "none", display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", height: 165, overflow: "hidden", background: "#dcfce7", flexShrink: 0 }}>
                  {img
                    ? <img src={img} alt={dest.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.07)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534" }}>
                        <Ic n="mountain" size={42} />
                      </div>
                  }
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,46,22,.38) 0%, transparent 55%)" }} />
                  {dest.rating && (
                    <div style={{
                      position: "absolute", top: 8, right: 8, padding: "3px 9px", borderRadius: 999,
                      background: "rgba(5,46,22,.72)", color: "#fbbf24",
                      fontSize: 11, fontWeight: 700, display: "flex", gap: 4, alignItems: "center",
                    }}>
                      <Ic n="star" size={10} fill="currentColor" sw={0} /> {dest.rating.toFixed(1)}
                    </div>
                  )}
                  {(dest.isFeatured || dest.isPopular) && (
                    <span style={{
                      position: "absolute", top: 8, left: 8,
                      padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, color: "#fff",
                      background: dest.isFeatured ? "#166534" : "#7c3aed",
                    }}>
                      <Ic n={dest.isFeatured ? "award" : "sparkles"} size={9} style={{ marginRight: 3 }} />
                      {dest.isFeatured ? "Featured" : "Trending"}
                    </span>
                  )}
                </div>

                <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1rem", fontWeight: 700, color: "#052e16", lineHeight: 1.25, margin: 0 }}>
                    {dest.name}
                  </h3>
                  {(dest.country?.name || dest.location) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}>
                      <Ic n="mapPin" size={11} /> {dest.country?.flag && `${dest.country.flag} `}{dest.location || dest.country?.name}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {duration && (
                      <span style={{ padding: "2px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 600, display: "flex", gap: 3, alignItems: "center" }}>
                        <Ic n="clock" size={10} /> {duration}
                      </span>
                    )}
                    {dest.difficulty && (
                      <span style={{ padding: "2px 9px", borderRadius: 999, background: "#f3f4f6", color: "#6b7280", fontSize: 11, fontWeight: 600 }}>
                        {dest.difficulty}
                      </span>
                    )}
                  </div>
                  {(dest.shortDescription || dest.description) && (
                    <p style={{
                      fontSize: 12.5, color: "#6b7280", lineHeight: 1.55, margin: 0,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {dest.shortDescription || dest.description}
                    </p>
                  )}
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                    <span style={{ fontSize: 12.5, color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      Explore <Ic n="arrowRight" size={12} />
                    </span>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#166534",
                    }}>
                      <Ic n="arrowRight" size={13} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {countrySlug && (
          <Reveal from="bottom" delay={80}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <Link
                to={`/country/${countrySlug}`}
                className="d-btn d-btn--outline d-btn--lg"
              >
                <Ic n="globe" size={16} />
                View All Destinations in {countryName}
                <Ic n="arrowRight" size={14} />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════
   END CTA
══════════════════════════════════════════════════════════════ */
const EndCta = ({ d, navigate }) => (
  <section className="d-cta-footer">
    <div className="d-cta-footer__bg" />
    <div className="d-wrap">
      <div className="d-cta-footer__inner">
        <h2>Ready to experience {d.name}?</h2>
        <p>
          Book today and secure your spot with our expert team.
          Limited availability — don't miss your chance.
        </p>
        <div className="d-cta-footer__btns">
          <button
            className="d-btn d-btn--white d-btn--lg"
            onClick={() => navigate(`/booking?destination=${d.slug}`)}
          >
            <Ic n="calendar" size={17} /> Book Now
          </button>
          <button
            className="d-btn d-btn--glass d-btn--lg"
            onClick={() => navigate("/contact")}
          >
            <Ic n="mail" size={17} /> Send Enquiry
          </button>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate   = useNavigate();
  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [identifier]);

  if (loading)              return <SkeletonPage />;
  if (error || !destination) return <ErrorPage error={error} navigate={navigate} />;

  const d = destination;

  return (
    <ScrollProvider>
      <div className="d-page">
        <ProgressBar />

        <Hero d={d} navigate={navigate} />

        <AboutSection       d={d} navigate={navigate} />
        <HighlightsSection  d={d} />
        <GallerySection     d={d} />
        <WildlifeSection    d={d} />
        <DeepDiveSection    d={d} navigate={navigate} />
        <TipsSafetySection  d={d} />
        <MapSection         d={d} />
        <FaqSection         d={d} navigate={navigate} />
        <MoreInCountrySection d={d} />
        <CommentsCarousel   destination={d} />
        <EndCta             d={d} navigate={navigate} />
      </div>
    </ScrollProvider>
  );
};

export default DestinationDetail;