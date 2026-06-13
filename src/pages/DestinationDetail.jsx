// src/pages/DestinationDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import MiniVideoPlayer from "../components/common/MiniVideoPlayer";
import "./DestinationDetail.css";

/* ═══════════════════════════════════════════════════
   ICON URLs — Professional SVG icons from public CDNs
═══════════════════════════════════════════════════ */
const ICONS = {
  // Lucide icons via unpkg
  clock: "https://unpkg.com/lucide-static@latest/icons/clock.svg",
  barChart: "https://unpkg.com/lucide-static@latest/icons/bar-chart-3.svg",
  star: "https://unpkg.com/lucide-static@latest/icons/star.svg",
  starFilled: "https://unpkg.com/lucide-static@latest/icons/star.svg",
  users: "https://unpkg.com/lucide-static@latest/icons/users.svg",
  calendar: "https://unpkg.com/lucide-static@latest/icons/calendar.svg",
  mapPin: "https://unpkg.com/lucide-static@latest/icons/map-pin.svg",
  globe: "https://unpkg.com/lucide-static@latest/icons/globe.svg",
  plane: "https://unpkg.com/lucide-static@latest/icons/plane.svg",
  car: "https://unpkg.com/lucide-static@latest/icons/car.svg",
  bus: "https://unpkg.com/lucide-static@latest/icons/bus-front.svg",
  map: "https://unpkg.com/lucide-static@latest/icons/map.svg",
  compass: "https://unpkg.com/lucide-static@latest/icons/compass.svg",
  camera: "https://unpkg.com/lucide-static@latest/icons/camera.svg",
  eye: "https://unpkg.com/lucide-static@latest/icons/eye.svg",
  x: "https://unpkg.com/lucide-static@latest/icons/x.svg",
  chevronLeft: "https://unpkg.com/lucide-static@latest/icons/chevron-left.svg",
  chevronRight: "https://unpkg.com/lucide-static@latest/icons/chevron-right.svg",
  plus: "https://unpkg.com/lucide-static@latest/icons/plus.svg",
  check: "https://unpkg.com/lucide-static@latest/icons/check.svg",
  checkCircle: "https://unpkg.com/lucide-static@latest/icons/check-circle-2.svg",
  shield: "https://unpkg.com/lucide-static@latest/icons/shield-check.svg",
  headphones: "https://unpkg.com/lucide-static@latest/icons/headphones.svg",
  award: "https://unpkg.com/lucide-static@latest/icons/award.svg",
  mail: "https://unpkg.com/lucide-static@latest/icons/mail.svg",
  messageCircle: "https://unpkg.com/lucide-static@latest/icons/message-circle.svg",
  arrowDown: "https://unpkg.com/lucide-static@latest/icons/arrow-down.svg",
  arrowRight: "https://unpkg.com/lucide-static@latest/icons/arrow-right.svg",
  sparkles: "https://unpkg.com/lucide-static@latest/icons/sparkles.svg",
  flame: "https://unpkg.com/lucide-static@latest/icons/flame.svg",
  leaf: "https://unpkg.com/lucide-static@latest/icons/leaf.svg",
  sun: "https://unpkg.com/lucide-static@latest/icons/sun.svg",
  cloudSun: "https://unpkg.com/lucide-static@latest/icons/cloud-sun.svg",
  thermometer: "https://unpkg.com/lucide-static@latest/icons/thermometer.svg",
  snowflake: "https://unpkg.com/lucide-static@latest/icons/snowflake.svg",
  alertTriangle: "https://unpkg.com/lucide-static@latest/icons/alert-triangle.svg",
  lightbulb: "https://unpkg.com/lucide-static@latest/icons/lightbulb.svg",
  info: "https://unpkg.com/lucide-static@latest/icons/info.svg",
  backpack: "https://unpkg.com/lucide-static@latest/icons/backpack.svg",
  stethoscope: "https://unpkg.com/lucide-static@latest/icons/stethoscope.svg",
  syringe: "https://unpkg.com/lucide-static@latest/icons/syringe.svg",
  pill: "https://unpkg.com/lucide-static@latest/icons/pill.svg",
  clipboardList: "https://unpkg.com/lucide-static@latest/icons/clipboard-list.svg",
  ticket: "https://unpkg.com/lucide-static@latest/icons/ticket.svg",
  theater: "https://unpkg.com/lucide-static@latest/icons/theater.svg",
  coins: "https://unpkg.com/lucide-static@latest/icons/coins.svg",
  thumbsUp: "https://unpkg.com/lucide-static@latest/icons/thumbs-up.svg",
  building: "https://unpkg.com/lucide-static@latest/icons/building-2.svg",
  route: "https://unpkg.com/lucide-static@latest/icons/route.svg",
  road: "https://unpkg.com/lucide-static@latest/icons/milestone.svg",
  // Activity icons
  binoculars: "https://unpkg.com/lucide-static@latest/icons/binoculars.svg",
  footprints: "https://unpkg.com/lucide-static@latest/icons/footprints.svg",
  tent: "https://unpkg.com/lucide-static@latest/icons/tent.svg",
  sunrise: "https://unpkg.com/lucide-static@latest/icons/sunrise.svg",
  moon: "https://unpkg.com/lucide-static@latest/icons/moon.svg",
  fish: "https://unpkg.com/lucide-static@latest/icons/fish.svg",
  mountain: "https://unpkg.com/lucide-static@latest/icons/mountain.svg",
  waves: "https://unpkg.com/lucide-static@latest/icons/waves.svg",
  ship: "https://unpkg.com/lucide-static@latest/icons/ship.svg",
  bird: "https://unpkg.com/lucide-static@latest/icons/bird.svg",
  trees: "https://unpkg.com/lucide-static@latest/icons/trees.svg",
  home: "https://unpkg.com/lucide-static@latest/icons/home.svg",
  utensils: "https://unpkg.com/lucide-static@latest/icons/utensils.svg",
  flag: "https://unpkg.com/lucide-static@latest/icons/flag.svg",
  // Wildlife
  pawPrint: "https://unpkg.com/lucide-static@latest/icons/paw-print.svg",
};

const Icon = ({ name, size = 20, className = "", style = {} }) => (
  <img
    src={ICONS[name] || ICONS.compass}
    alt=""
    width={size}
    height={size}
    className={className}
    style={{ display: "block", ...style }}
    loading="lazy"
  />
);

/* ═══════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════ */
const useScreen = () => {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { w, mob: w < 640, tab: w >= 640 && w < 1024, desk: w >= 1024 };
};

const useInView = (threshold = 0.1, once = true) => {
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
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return [ref, vis];
};

const useTypewriter = (text = "", speed = 42, startDelay = 150) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [ref, vis] = useInView(0.2);
  useEffect(() => {
    if (!vis || !text) return;
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
  return [ref, displayed, done];
};

const useCounter = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const [ref, vis] = useInView(0.3);
  useEffect(() => {
    if (!vis || !target) return;
    const num =
      parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    if (!num) return;
    const start = Date.now();
    const iv = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * num));
      if (p >= 1) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [vis, target, duration]);
  return [ref, count, vis];
};

/* ═══════════════════════════════════════════════════
   ACTIVITY ICON MAPPING
═══════════════════════════════════════════════════ */
const ACTIVITY_ICON_MAP = {
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

const PHASE_STYLES = {
  "before-travel": {
    bg: "var(--dd-blue-light)",
    color: "#1E40AF",
    label: "Before Travel",
  },
  "on-arrival": {
    bg: "var(--dd-green-50)",
    color: "var(--dd-green-800)",
    label: "On Arrival",
  },
  "during-stay": {
    bg: "var(--dd-amber-light)",
    color: "var(--dd-amber-dark)",
    label: "During Stay",
  },
  departure: {
    bg: "var(--dd-neutral-100)",
    color: "var(--dd-neutral-700)",
    label: "Departure",
  },
};

/* ═══════════════════════════════════════════════════
   SKELETON PAGE
═══════════════════════════════════════════════════ */
const SkeletonPage = () => (
  <div className="dd-skeleton">
    <div className="dd-skeleton__hero">
      <div className="dd-skel" style={{ width: "100%", height: "100%", borderRadius: 0 }} />
      <div className="dd-skeleton__hero-overlay">
        <div className="dd-skeleton__hero-inner">
          <div className="dd-skel" style={{ width: 100, height: 26, borderRadius: 99, marginBottom: 18, opacity: 0.5 }} />
          <div className="dd-skel" style={{ width: "min(400px,70%)", height: 60, borderRadius: 10, marginBottom: 16, opacity: 0.45 }} />
          <div className="dd-skel" style={{ width: "min(280px,50%)", height: 20, marginBottom: 36, opacity: 0.38 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="dd-skel" style={{ width: 180, height: 52, borderRadius: 14, opacity: 0.4 }} />
            <div className="dd-skel" style={{ width: 140, height: 52, borderRadius: 14, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
    <div className="dd-container" style={{ padding: "clamp(40px,6vw,72px) clamp(16px,4vw,52px)" }}>
      <div className="dd-skeleton__stats">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="dd-skel" key={i} style={{ height: 90 }} />
        ))}
      </div>
      <div className="dd-skeleton__content">
        <div>
          <div className="dd-skel" style={{ width: 260, height: 38, marginBottom: 14 }} />
          <div className="dd-skel" style={{ width: "min(480px,90%)", height: 16, marginBottom: 8 }} />
          <div className="dd-skel" style={{ width: 52, height: 4, marginBottom: 40 }} />
          {[100, 100, 100, 80, 55].map((w, i) => (
            <div className="dd-skel" key={i} style={{ width: `${w}%`, height: 14, marginBottom: 12 }} />
          ))}
        </div>
        <div className="dd-skeleton__sidebar">
          <div className="dd-skel" style={{ width: "100%", height: 54, borderRadius: 12, marginBottom: 14 }} />
          <div className="dd-skel" style={{ width: "100%", height: 48, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   ERROR STATE
═══════════════════════════════════════════════════ */
const ErrorState = ({ error, navigate }) => (
  <div className="dd-error">
    <div className="dd-error__icon">
      <Icon name="map" size={64} />
    </div>
    <h2 className="dd-error__title">Destination Not Found</h2>
    <p className="dd-error__text">
      {error || "This destination doesn't exist or may have been removed."}
    </p>
    <div className="dd-error__actions">
      <button className="dd-error__btn dd-error__btn--secondary" onClick={() => navigate(-1)}>
        ← Go Back
      </button>
      <button className="dd-error__btn dd-error__btn--primary" onClick={() => navigate("/destinations")}>
        Browse Destinations
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════════════════ */
const Section = ({ children, id, variant = "white", style = {} }) => {
  const [ref, vis] = useInView(0.06);
  return (
    <section
      ref={ref}
      id={id}
      className={`dd-section dd-section--${variant}${vis ? " dd-section--visible" : ""}`}
      style={style}
    >
      {children}
    </section>
  );
};

const SectionHead = ({ children, sub, tw = false, center = false }) => {
  const text = typeof children === "string" ? children : "";
  const [twRef, displayed, done] = useTypewriter(tw ? text : "", 40, 120);

  if (tw) {
    return (
      <div ref={twRef} className={`dd-section-head${center ? " dd-section-head--center" : ""}`}>
        <h2 className="dd-section-head__title" style={{ opacity: 1, transform: "none" }}>
          {displayed}
          {!done && <span className="dd-hero__cursor" />}
        </h2>
        {sub && <p className="dd-section-head__sub" style={{ opacity: 1, transform: "none" }}>{sub}</p>}
        <div className="dd-section-head__line">
          <div className="dd-green-line" style={{ transform: "scaleX(1)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`dd-section-head${center ? " dd-section-head--center" : ""}`}>
      <h2 className="dd-section-head__title">{children}</h2>
      {sub && <p className="dd-section-head__sub">{sub}</p>}
      <div className="dd-section-head__line">
        <div className="dd-green-line" />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════ */
const Hero = ({ d, size }) => {
  const allImages = [
    d.heroImage,
    d.imageUrl,
    ...(d.images || []),
    ...(d.gallery || []).map((g) => g.imageUrl),
  ].filter(Boolean);

  const heroImages = [...new Set(allImages)].slice(0, 5);
  const [activeSlide, setActiveSlide] = useState(0);
  const [titleRef, titleDisplayed, titleDone] = useTypewriter(d.name || "", 52, 700);

  // Auto-slideshow
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const iv = setInterval(() => {
      setActiveSlide((p) => (p + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(iv);
  }, [heroImages.length]);

  const diffClass = d.difficulty === "easy"
    ? "dd-tag--difficulty-easy"
    : d.difficulty === "moderate"
    ? "dd-tag--difficulty-moderate"
    : "dd-tag--difficulty-hard";

  return (
    <section className="dd-hero">
      {/* Slideshow */}
      <div className="dd-hero__slideshow">
        {heroImages.length > 0 ? (
          heroImages.map((img, i) => (
            <div
              key={i}
              className={`dd-hero__slide${activeSlide === i ? " dd-hero__slide--active" : ""}`}
            >
              <img src={img} alt={`${d.name} ${i + 1}`} />
            </div>
          ))
        ) : (
          <div className="dd-hero__slide dd-hero__slide--active">
            <div className="dd-hero__slide-placeholder" />
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="dd-hero__overlay" />
      <div className="dd-hero__overlay-accent" />
      <div className="dd-hero__gradient-line" />

      {/* Slide indicators */}
      {heroImages.length > 1 && (
        <div className="dd-hero__indicators">
          {heroImages.map((_, i) => (
            <div
              key={i}
              className={`dd-hero__indicator${activeSlide === i ? " dd-hero__indicator--active" : ""}`}
              onClick={() => setActiveSlide(i)}
            >
              <div className="dd-hero__indicator-fill" />
            </div>
          ))}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="dd-hero__breadcrumb">
        <div className="dd-container">
          <div className="dd-hero__breadcrumb-inner">
            <Link to="/destinations" className="dd-hero__breadcrumb-link">
              Destinations
            </Link>
            {(d.country || d.countryObj?.name) && (
              <>
                <span className="dd-hero__breadcrumb-sep">›</span>
                <Link
                  to={`/country/${d.countrySlug || d.countryObj?.slug}`}
                  className="dd-hero__breadcrumb-link"
                >
                  {d.countryFlag && <span style={{ fontSize: 17 }}>{d.countryFlag}</span>}
                  {d.country || d.countryObj?.name}
                </Link>
              </>
            )}
            <span className="dd-hero__breadcrumb-sep">›</span>
            <span className="dd-hero__breadcrumb-current">{d.name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dd-container dd-hero__content">
        <div className="dd-hero__content-inner">
          {/* Badges */}
          <div className="dd-hero__badges">
            {d.isFeatured && (
              <span className="dd-tag dd-tag--amber">
                <Icon name="star" size={14} className="dd-tag__icon" /> Featured
              </span>
            )}
            {d.isPopular && (
              <span className="dd-tag dd-tag--amber">
                <Icon name="flame" size={14} className="dd-tag__icon" /> Popular
              </span>
            )}
            {d.isNew && (
              <span className="dd-tag dd-tag--success">
                <Icon name="sparkles" size={14} className="dd-tag__icon" /> New
              </span>
            )}
            {d.isEcoFriendly && (
              <span className="dd-tag dd-tag--eco">
                <Icon name="leaf" size={14} className="dd-tag__icon" style={{ filter: "brightness(0) invert(1)" }} /> Eco-Friendly
              </span>
            )}
            {d.destinationType && <span className="dd-tag dd-tag--white">{d.destinationType}</span>}
          </div>

          {/* Title */}
          <div ref={titleRef} className="dd-hero__title-wrap">
            <h1 className="dd-hero__title">
              {titleDisplayed}
              {!titleDone && <span className="dd-hero__cursor" />}
            </h1>
          </div>

          {/* Tagline */}
          {d.tagline && <p className="dd-hero__tagline">{d.tagline}</p>}

          {/* Meta row */}
          <div className="dd-hero__meta">
            {d.rating > 0 && (
              <div className="dd-hero__rating">
                <Icon name="star" size={18} className="dd-hero__rating-star" />
                <span className="dd-hero__rating-value">{d.rating.toFixed(1)}</span>
                {d.reviewCount > 0 && (
                  <span className="dd-hero__rating-count">
                    ({d.reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
            {d.duration && (
              <span className="dd-tag dd-tag--dark">
                <Icon name="clock" size={14} className="dd-tag__icon" style={{ filter: "brightness(0) invert(1)" }} /> {d.duration}
              </span>
            )}
            {d.difficulty && (
              <span className={`dd-tag ${diffClass}`}>{d.difficulty}</span>
            )}
            {d.category && <span className="dd-tag dd-tag--dark">{d.category}</span>}
          </div>

          {/* CTAs */}
          <div className="dd-hero__ctas">
            <button
              className="dd-btn dd-btn--primary"
              onClick={() =>
                document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Discover More
              <Icon name="arrowDown" size={18} className="dd-btn__icon" style={{ filter: "brightness(0) invert(1)" }} />
            </button>
            <button
              className="dd-btn dd-btn--outline"
              onClick={() =>
                document.getElementById("contact-sidebar")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Plan Your Visit
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {!size.mob && (
        <div className="dd-hero__scroll dd-hide-mobile">
          <span>Scroll</span>
          <div className="dd-hero__scroll-mouse">
            <div className="dd-hero__scroll-dot" />
          </div>
        </div>
      )}
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK STATS BAR
═══════════════════════════════════════════════════ */
const StatItem = ({ icon, label, rawValue, accent = false }) => {
  const isNum = /^[\d.]+$/.test(String(rawValue).replace(/[^0-9.]/g, ""));
  const numPart = parseFloat(String(rawValue).replace(/[^0-9.]/g, "")) || 0;
  const suffix = String(rawValue).replace(/[\d.]+/, "").trim();
  const [ref, count, vis] = useCounter(isNum && numPart > 1 ? numPart : 0, 1200);
  const displayValue = isNum && numPart > 1 ? `${count}${suffix ? " " + suffix : ""}` : rawValue;

  return (
    <div ref={ref} className="dd-stats-bar__item">
      <Icon name={icon} size={24} className="dd-stats-bar__icon" />
      <span className="dd-stats-bar__label">{label}</span>
      <span className={`dd-stats-bar__value${accent ? " dd-stats-bar__value--accent" : ""}`}>
        {vis ? displayValue : rawValue}
      </span>
    </div>
  );
};

const QuickStatsBar = ({ d }) => {
  const stats = [
    { icon: "clock", label: "Duration", value: d.duration || (d.durationDays ? `${d.durationDays} Days` : null) },
    { icon: "barChart", label: "Difficulty", value: d.difficulty },
    { icon: "star", label: "Rating", value: d.rating ? `${d.rating.toFixed(1)} / 5.0` : null, accent: true },
    { icon: "users", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize} pax` : null },
    { icon: "calendar", label: "Best Season", value: d.bestTimeToVisit },
  ].filter((s) => s.value);

  if (!stats.length) return null;

  return (
    <div className="dd-stats-bar">
      <div className="dd-container">
        <div className="dd-stats-bar__grid" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 5)}, 1fr)` }}>
          {stats.map((s, i) => (
            <StatItem key={i} icon={s.icon} label={s.label} rawValue={s.value} accent={s.accent} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CONTACT SIDEBAR
═══════════════════════════════════════════════════ */
const ContactSidebar = ({ d, navigate }) => {
  const infoRows = [
    { icon: "clock", label: "Operating Hours", value: d.operatingHours },
    { icon: "building", label: "Nearest City", value: d.nearestCity },
    { icon: "plane", label: "Nearest Airport", value: d.nearestAirport },
    { icon: "calendar", label: "Best Time", value: d.bestTimeToVisit },
    { icon: "users", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize}–${d.maxGroupSize} people` : null },
    { icon: "info", label: "Min Age", value: d.minAge ? `${d.minAge}+ years` : null },
  ].filter((r) => r.value);

  return (
    <div id="contact-sidebar" className="dd-sidebar">
      {/* Header */}
      <div className="dd-sidebar__header">
        <div className="dd-sidebar__header-ring" style={{ width: 120, height: 120, top: -30, right: -30 }} />
        <div className="dd-sidebar__header-ring" style={{ width: 80, height: 80, bottom: -20, left: -20 }} />
        <Icon name="globe" size={52} className="dd-sidebar__header-icon" />
        <h3 className="dd-sidebar__header-title">Plan Your Visit</h3>
        <p className="dd-sidebar__header-text">
          Our experts will craft your perfect {d.name} experience
        </p>
      </div>

      {/* Body */}
      <div className="dd-sidebar__body">
        <div className="dd-sidebar__ctas">
          <button onClick={() => navigate("/contact")} className="dd-btn dd-btn--primary dd-btn--full">
            <Icon name="mail" size={18} className="dd-btn__icon" style={{ filter: "brightness(0) invert(1)" }} />
            Enquire Now
          </button>
          <button onClick={() => navigate("/contact")} className="dd-btn dd-btn--outline-green dd-btn--full">
            <Icon name="messageCircle" size={18} className="dd-btn__icon" />
            Speak to a Safari Expert
          </button>
        </div>

        {infoRows.length > 0 && <div className="dd-sidebar__divider" />}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {infoRows.map((row, i) => (
            <div key={i} className="dd-sidebar__info-row">
              <div className="dd-sidebar__info-icon">
                <Icon name={row.icon} size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="dd-sidebar__info-label">{row.label}</div>
                <div className="dd-sidebar__info-value">{row.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="dd-sidebar__trust">
          {[
            { icon: "award", text: "Expert Guides" },
            { icon: "shield", text: "Safe Travel" },
            { icon: "headphones", text: "24/7 Support" },
          ].map((t, i) => (
            <div key={i} className="dd-sidebar__trust-item">
              <Icon name={t.icon} size={22} className="dd-sidebar__trust-icon" />
              <div className="dd-sidebar__trust-text">{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   OVERVIEW SECTION
═══════════════════════════════════════════════════ */
const OverviewSection = ({ d, size, navigate }) => {
  const desc = d.description || d.shortDescription;
  if (!desc && !d.overview) return null;

  return (
    <Section id="overview" variant="white">
      <div className="dd-container">
        <div className="dd-overview__grid">
          {/* Left */}
          <div>
            <SectionHead tw sub={`Discover what makes ${d.name} extraordinary`}>
              About This Destination
            </SectionHead>
            {d.overview && (
              <div className="dd-overview__quote">
                <p>{d.overview}</p>
              </div>
            )}
            {desc && (
              <div className="dd-overview__desc">
                {desc
                  .split("\n\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
            )}
            {(d.isFamilyFriendly || d.isEcoFriendly || d.minAge) && (
              <div className="dd-overview__features">
                {d.isFamilyFriendly && (
                  <span className="dd-tag dd-tag--success">
                    <Icon name="users" size={14} className="dd-tag__icon" /> Family Friendly
                  </span>
                )}
                {d.isEcoFriendly && (
                  <span className="dd-tag dd-tag--green">
                    <Icon name="leaf" size={14} className="dd-tag__icon" /> Eco-Friendly
                  </span>
                )}
                {d.minAge && (
                  <span className="dd-tag dd-tag--blue">
                    <Icon name="clipboardList" size={14} className="dd-tag__icon" /> Min Age: {d.minAge}+
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <ContactSidebar d={d} navigate={navigate} />
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   HIGHLIGHTS
═══════════════════════════════════════════════════ */
const HighlightsSection = ({ d, size }) => {
  const list = d.highlights || [];
  if (!list.length) return null;
  const [ref, vis] = useInView(0.1);

  return (
    <Section id="highlights" variant="gray">
      <div className="dd-container">
        <SectionHead tw sub={`What makes ${d.name} unforgettable`}>
          Highlights
        </SectionHead>
        <div
          ref={ref}
          className={`dd-highlights__grid dd-stagger${vis ? " dd-stagger--visible" : ""}`}
        >
          {list.map((h, i) => {
            const [cRef, count] = useCounter(i + 1, 600);
            return (
              <div key={i} ref={cRef} className="dd-card dd-card--lift dd-highlight-card">
                <div className="dd-highlight-card__number">{count}</div>
                <p className="dd-highlight-card__text">{h}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   BEST TIME TO VISIT
═══════════════════════════════════════════════════ */
const BestTimeSection = ({ d }) => {
  const pi = d.practicalInfo;
  const climate = pi?.climate;
  const bestTime = d.bestTimeToVisit;
  if (!bestTime && !climate) return null;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const bestMonths = climate?.bestMonths || [];
  const avoidMonths = climate?.avoidMonths || [];

  const getStatus = (m) => {
    if (bestMonths.some((b) => b.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(b.slice(0, 3).toLowerCase()))) return "best";
    if (avoidMonths.some((a) => a.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(a.slice(0, 3).toLowerCase()))) return "avoid";
    return "ok";
  };

  return (
    <Section id="best-time" variant="white">
      <div className="dd-container">
        <SectionHead sub="Plan your visit at the perfect time">Best Time to Visit</SectionHead>
        <div className={`dd-besttime__grid${!bestMonths.length ? " dd-besttime__grid--single" : ""}`} style={!bestMonths.length ? { gridTemplateColumns: "1fr" } : {}}>
          {/* Season card */}
          <div className="dd-besttime__season-card">
            <div className="dd-besttime__season-ring" />
            <Icon name="cloudSun" size={42} className="dd-besttime__season-icon" />
            <div className="dd-besttime__season-label">Recommended Season</div>
            <h4 className="dd-besttime__season-title">{bestTime}</h4>
            {climate?.climateNotes && <p className="dd-besttime__season-note">{climate.climateNotes}</p>}
            {(climate?.avgTempLowC != null || climate?.avgTempHighC != null) && (
              <div className="dd-besttime__temp-tags">
                {climate.avgTempLowC != null && (
                  <span className="dd-besttime__temp-tag">
                    <Icon name="snowflake" size={14} className="dd-besttime__temp-icon" /> {climate.avgTempLowC}°C Low
                  </span>
                )}
                {climate.avgTempHighC != null && (
                  <span className="dd-besttime__temp-tag">
                    <Icon name="sun" size={14} className="dd-besttime__temp-icon" /> {climate.avgTempHighC}°C High
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Monthly grid */}
          {bestMonths.length > 0 && (
            <div className="dd-besttime__monthly">
              <div className="dd-besttime__monthly-label">Monthly Guide</div>
              <div className="dd-besttime__month-grid">
                {months.map((m) => {
                  const st = getStatus(m);
                  return (
                    <div key={m} className={`dd-besttime__month dd-besttime__month--${st}`}>
                      <div className="dd-besttime__month-name">{m}</div>
                      <div className={`dd-besttime__month-status`}>
                        <Icon
                          name={st === "best" ? "checkCircle" : st === "avoid" ? "x" : "info"}
                          size={12}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="dd-besttime__legend">
                {[
                  { cls: "best", label: "Best" },
                  { cls: "ok", label: "OK" },
                  { cls: "avoid", label: "Avoid" },
                ].map((l, i) => (
                  <div key={i} className="dd-besttime__legend-item">
                    <div className={`dd-besttime__legend-dot dd-besttime__legend-dot--${l.cls}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   ACTIVITIES
═══════════════════════════════════════════════════ */
const ActivitiesSection = ({ d, size }) => {
  const list = d.activities || [];
  if (!list.length) return null;
  const [ref, vis] = useInView(0.1);

  return (
    <Section id="activities" variant="gray">
      <div className="dd-container">
        <SectionHead tw sub="Experiences awaiting you">Things To Do</SectionHead>
        <div ref={ref} className={`dd-activities__grid dd-stagger${vis ? " dd-stagger--visible" : ""}`}>
          {list.map((act, i) => (
            <div key={i} className="dd-card dd-card--lift dd-activity-card">
              <div className="dd-activity-card__icon-wrap" style={{ animationDelay: `${i * 0.28}s` }}>
                <Icon name={ACTIVITY_ICON_MAP[act] || "compass"} size={30} className="dd-activity-card__icon" />
              </div>
              <h4 className="dd-activity-card__name">{act}</h4>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE
═══════════════════════════════════════════════════ */
const WildlifeSection = ({ d }) => {
  const list = d.wildlife || [];
  if (!list.length) return null;
  const [ref, vis] = useInView(0.1);

  return (
    <Section id="wildlife" variant="white">
      <div className="dd-container">
        <SectionHead sub={`Incredible species at ${d.name}`} center>Wildlife</SectionHead>
        <div ref={ref} className={`dd-wildlife__list dd-stagger${vis ? " dd-stagger--visible" : ""}`}>
          {list.map((animal, i) => (
            <div key={i} className="dd-wildlife__item">
              <Icon name="pawPrint" size={24} className="dd-wildlife__item-icon" />
              <span className="dd-wildlife__item-name">{animal}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY
═══════════════════════════════════════════════════ */
const GallerySection = ({ d, size }) => {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const gallery = d.gallery || [];
  const imgs = gallery.length
    ? gallery.map((g) => g.imageUrl).filter(Boolean)
    : (d.images || []).filter(Boolean);
  if (!imgs.length) return null;

  const prev = useCallback(
    (e) => {
      e.stopPropagation();
      setLb((p) => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
    },
    [imgs.length]
  );
  const next = useCallback(
    (e) => {
      e.stopPropagation();
      setLb((p) => ({ ...p, idx: (p.idx + 1) % imgs.length }));
    },
    [imgs.length]
  );

  useEffect(() => {
    if (!lb.open) return;
    const h = (e) => {
      if (e.key === "Escape") setLb((p) => ({ ...p, open: false }));
      if (e.key === "ArrowLeft") setLb((p) => ({ ...p, idx: (p.idx - 1 + imgs.length) % imgs.length }));
      if (e.key === "ArrowRight") setLb((p) => ({ ...p, idx: (p.idx + 1) % imgs.length }));
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [lb.open, imgs.length]);

  const visible = imgs.slice(0, 10);
  const [ref, vis] = useInView(0.05);

  return (
    <Section id="gallery" variant="gray">
      <div className="dd-container">
        <div className="dd-gallery__header">
          <SectionHead sub={`Stunning visuals from ${d.name}`}>Photo Gallery</SectionHead>
          <div className="dd-gallery__count">
            <Icon name="camera" size={16} className="dd-gallery__count-icon" />
            {visible.length} photos
          </div>
        </div>

        <div ref={ref} className="dd-gallery__grid">
          {visible.map((img, i) => (
            <div
              key={i}
              onClick={() => setLb({ open: true, idx: i })}
              className={`dd-gallery__item dd-img-zoom${i === 0 ? " dd-gallery__item--big" : i === 3 ? " dd-gallery__item--wide" : ""}`}
              style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "none" : "scale(0.92)",
                transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`,
              }}
            >
              <img src={img} alt={`${d.name} ${i + 1}`} />
              <div className="dd-gallery__item-overlay">
                <div className="dd-gallery__item-view">
                  <Icon name="eye" size={14} className="dd-gallery__item-view-icon" />
                  View
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lb.open && (
        <div className="dd-lightbox" onClick={() => setLb((p) => ({ ...p, open: false }))}>
          <button className="dd-lightbox__close" onClick={() => setLb((p) => ({ ...p, open: false }))}>
            <Icon name="x" size={20} className="dd-lightbox__close-icon" />
          </button>

          <img
            src={imgs[lb.idx]}
            alt=""
            className="dd-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />

          {imgs.length > 1 && (
            <>
              <button className="dd-lightbox__nav dd-lightbox__nav--prev" onClick={prev}>
                <Icon name="chevronLeft" size={22} className="dd-lightbox__nav-icon" />
              </button>
              <button className="dd-lightbox__nav dd-lightbox__nav--next" onClick={next}>
                <Icon name="chevronRight" size={22} className="dd-lightbox__nav-icon" />
              </button>
              <div className="dd-lightbox__footer">
                <div className="dd-lightbox__thumbs">
                  {imgs.slice(0, 14).map((img, i) => (
                    <div
                      key={i}
                      className={`dd-lightbox__thumb${lb.idx === i ? " dd-lightbox__thumb--active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLb((p) => ({ ...p, idx: i }));
                      }}
                    >
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
                <div className="dd-lightbox__counter">
                  {lb.idx + 1} / {imgs.length}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   HOW TO GET THERE
═══════════════════════════════════════════════════ */
const HowToGetThereSection = ({ d, size }) => {
  const hgt = d.howToGetThere;
  const lat = hgt?.mapPosition?.lat ?? d.latitude;
  const lng = hgt?.mapPosition?.lng ?? d.longitude;
  const hasMap = lat && lng;

  const rows = [
    { icon: "plane", label: "Nearest Airport", value: hgt?.nearestAirport || d.nearestAirport, sub: hgt?.distanceFromAirport || (d.distanceFromAirportKm ? `${d.distanceFromAirportKm} km away` : null) },
    { icon: "building", label: "Nearest City", value: hgt?.nearestCity || d.nearestCity },
    { icon: "car", label: "Drive from Capital", value: hgt?.driveTimeFromCapital && hgt?.countryCapital ? `${hgt.driveTimeFromCapital} from ${hgt.countryCapital}` : hgt?.driveTimeFromCapital },
    { icon: "road", label: "Road Conditions", value: hgt?.roadConditions },
  ].filter((r) => r.value);

  const transportOptions = hgt?.transportOptions || [];
  const generalInfo = hgt?.generalInfo || d.gettingThere;

  if (!rows.length && !hasMap && !generalInfo && !transportOptions.length) return null;

  const [ref, vis] = useInView(0.1);

  return (
    <Section id="getting-there" variant="white">
      <div className="dd-container">
        <SectionHead sub="Directions and travel logistics">How to Get There</SectionHead>
        <div className={`dd-getthere__grid${!hasMap || size.mob ? " dd-getthere__grid--full" : ""}`} style={(!hasMap || size.mob) ? { gridTemplateColumns: "1fr" } : {}}>
          {hasMap && (
            <div className="dd-getthere__map">
              <iframe
                title={`Getting to ${d.name}`}
                src={`https://www.google.com/maps?q=${lat},${lng}&z=12&output=embed`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          )}

          <div>
            {transportOptions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="dd-getthere__transport-label">Transport Options</div>
                <div className="dd-getthere__transport-tags">
                  {transportOptions.map((t, i) => {
                    const iconName = t.toLowerCase().includes("flight") ? "plane" : t.toLowerCase().includes("bus") ? "bus" : "car";
                    return (
                      <span key={i} className="dd-tag dd-tag--green">
                        <Icon name={iconName} size={14} className="dd-tag__icon" /> {t}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={ref} className={`dd-stagger${vis ? " dd-stagger--visible" : ""}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rows.map((row, i) => (
                <div key={i} className="dd-card dd-card--lift-sm dd-getthere__info-card">
                  <div className="dd-getthere__info-icon">
                    <Icon name={row.icon} size={22} />
                  </div>
                  <div>
                    <div className="dd-getthere__info-label">{row.label}</div>
                    <div className="dd-getthere__info-value">{row.value}</div>
                    {row.sub && <div className="dd-getthere__info-sub">{row.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {generalInfo && (
              <div className="dd-card dd-getthere__general">
                <div className="dd-getthere__general-header">
                  <Icon name="map" size={22} className="dd-getthere__general-icon" />
                  <h4 className="dd-getthere__general-title">Getting There</h4>
                </div>
                <p className="dd-getthere__general-text">{generalInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   PRACTICAL INFO
═══════════════════════════════════════════════════ */
const PracticalSection = ({ d, size }) => {
  const pi = d.practicalInfo;
  const packing = pi?.packing?.essentials || [];
  const vaccReq = pi?.healthAndSafety?.vaccinationsRequired || [];
  const vaccRec = pi?.healthAndSafety?.vaccinationsRecommended || [];
  const malariaRisk = pi?.healthAndSafety?.malariaRisk;
  const safetyNotes = pi?.healthAndSafety?.safetyNotes;
  const permits = pi?.permitsAndRegulations?.permitsRequired || [];
  const leadTime = pi?.permitsAndRegulations?.bookingLeadTime;
  const visitorLimits = pi?.permitsAndRegulations?.visitorLimits;
  const etiquette = pi?.culture?.localEtiquette || [];
  const tipping = pi?.culture?.tippingCulture;
  const photoRules = pi?.culture?.photographyRules;

  const infoCards = [
    { icon: "lightbulb", title: "Local Tips", text: d.localTips, bgClass: "amber" },
    { icon: "alertTriangle", title: "Safety Info", text: d.safetyInfo, bgClass: "red" },
  ].filter((c) => c.text);

  const hasContent = packing.length || vaccReq.length || vaccRec.length || permits.length || etiquette.length || infoCards.length;
  if (!hasContent) return null;

  const [ref, vis] = useInView(0.06);

  return (
    <Section id="practical" variant="gray">
      <div className="dd-container">
        <SectionHead tw sub="Everything you need to know before you go">Practical Information</SectionHead>

        {infoCards.length > 0 && (
          <div className="dd-practical__info-cards">
            {infoCards.map((c, i) => (
              <div key={i} className="dd-card">
                <div
                  className="dd-practical__card-header"
                  style={{
                    background: c.bgClass === "amber" ? "var(--dd-amber-light)" : "var(--dd-red-light)",
                    borderColor: c.bgClass === "amber" ? "#FDE68A" : "#FECACA",
                  }}
                >
                  <Icon name={c.icon} size={22} className="dd-practical__card-header-icon" />
                  <h4
                    className="dd-practical__card-header-title"
                    style={{ color: c.bgClass === "amber" ? "var(--dd-amber-dark)" : "var(--dd-red)" }}
                  >
                    {c.title}
                  </h4>
                </div>
                <div className="dd-practical__card-body">
                  <p style={{ margin: 0, fontSize: "clamp(13px,1.2vw,15px)", color: "var(--dd-neutral-600)", lineHeight: 1.85 }}>
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={ref} className={`dd-practical__grid dd-stagger${vis ? " dd-stagger--visible" : ""}`}>
          {packing.length > 0 && (
            <div className="dd-card">
              <div className="dd-practical__card-header" style={{ background: "var(--dd-green-50)", borderColor: "var(--dd-green-100)" }}>
                <Icon name="backpack" size={22} className="dd-practical__card-header-icon" />
                <h4 className="dd-practical__card-header-title" style={{ color: "var(--dd-green-800)" }}>What to Pack</h4>
              </div>
              <div className="dd-practical__card-body">
                <div className="dd-practical__tags">
                  {packing.map((item, i) => (
                    <span key={i} className="dd-tag dd-tag--green">
                      <Icon name="check" size={12} className="dd-tag__icon" /> {item}
                    </span>
                  ))}
                </div>
                {pi?.packing?.clothingTips && (
                  <p className="dd-practical__note">{pi.packing.clothingTips}</p>
                )}
              </div>
            </div>
          )}

          {(vaccReq.length > 0 || vaccRec.length > 0 || malariaRisk) && (
            <div className="dd-card">
              <div className="dd-practical__card-header" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
                <Icon name="stethoscope" size={22} className="dd-practical__card-header-icon" />
                <h4 className="dd-practical__card-header-title" style={{ color: "#9A3412" }}>Health Requirements</h4>
              </div>
              <div className="dd-practical__card-body">
                {malariaRisk && (
                  <div className="dd-practical__alert">
                    <Icon name="alertTriangle" size={16} className="dd-practical__alert-icon" />
                    <span className="dd-practical__alert-text">Malaria Risk: {malariaRisk}</span>
                  </div>
                )}
                {vaccReq.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="dd-practical__group-label dd-practical__group-label--required">Required</div>
                    <div className="dd-practical__tags">
                      {vaccReq.map((v, i) => (
                        <span key={i} className="dd-tag dd-tag--red">
                          <Icon name="syringe" size={12} className="dd-tag__icon" /> {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {vaccRec.length > 0 && (
                  <div>
                    <div className="dd-practical__group-label dd-practical__group-label--recommended">Recommended</div>
                    <div className="dd-practical__tags">
                      {vaccRec.map((v, i) => (
                        <span key={i} className="dd-tag dd-tag--amber">
                          <Icon name="pill" size={12} className="dd-tag__icon" /> {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {safetyNotes && <p className="dd-practical__note">{safetyNotes}</p>}
              </div>
            </div>
          )}

          {(permits.length > 0 || leadTime || visitorLimits) && (
            <div className="dd-card">
              <div className="dd-practical__card-header" style={{ background: "var(--dd-blue-light)", borderColor: "#BFDBFE" }}>
                <Icon name="clipboardList" size={22} className="dd-practical__card-header-icon" />
                <h4 className="dd-practical__card-header-title" style={{ color: "#1E40AF" }}>Permits & Regulations</h4>
              </div>
              <div className="dd-practical__card-body">
                {permits.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="dd-practical__group-label" style={{ color: "var(--dd-neutral-400)" }}>Required Permits</div>
                    <div className="dd-practical__tags">
                      {permits.map((p, i) => (
                        <span key={i} className="dd-tag dd-tag--blue">
                          <Icon name="ticket" size={12} className="dd-tag__icon" /> {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {[
                  { label: "Booking Lead Time", value: leadTime },
                  { label: "Visitor Limits", value: visitorLimits },
                ]
                  .filter((r) => r.value)
                  .map((r, i) => (
                    <div key={i} className="dd-practical__detail-row">
                      <span className="dd-practical__detail-label">{r.label}</span>
                      <span className="dd-practical__detail-value">{r.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(etiquette.length > 0 || tipping || photoRules) && (
            <div className="dd-card">
              <div className="dd-practical__card-header" style={{ background: "var(--dd-amber-light)", borderColor: "#FDE68A" }}>
                <Icon name="theater" size={22} className="dd-practical__card-header-icon" />
                <h4 className="dd-practical__card-header-title" style={{ color: "var(--dd-amber-dark)" }}>Local Culture</h4>
              </div>
              <div className="dd-practical__card-body">
                {etiquette.length > 0 && (
                  <ul>
                    {etiquette.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
                {tipping && (
                  <p className="dd-practical__note">
                    <strong>Tipping:</strong> {tipping}
                  </p>
                )}
                {photoRules && (
                  <p className="dd-practical__note">
                    <strong>Photography:</strong> {photoRules}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL TIPS
═══════════════════════════════════════════════════ */
const TipsSection = ({ d, size }) => {
  const tips = d.tips || [];
  if (!tips.length) return null;
  const [ref, vis] = useInView(0.08);

  return (
    <Section id="tips" variant="white">
      <div className="dd-container">
        <SectionHead sub={`Expert advice for your trip to ${d.name}`}>Travel Tips</SectionHead>
        <div ref={ref} className={`dd-tips__grid dd-stagger${vis ? " dd-stagger--visible" : ""}`}>
          {tips.map((tip, i) => {
            const phase = PHASE_STYLES[tip.tripPhase] || PHASE_STYLES["during-stay"];
            return (
              <div key={i} className="dd-card dd-card--lift">
                <div className="dd-tip-card__header" style={{ background: phase.bg }}>
                  {tip.icon && <Icon name="lightbulb" size={20} className="dd-tip-card__header-icon" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="dd-tip-card__phase" style={{ color: phase.color }}>
                      {phase.label}
                    </span>
                    {tip.category && <span className="dd-tip-card__category">· {tip.category}</span>}
                  </div>
                  {tip.isFeatured && <Icon name="star" size={16} className="dd-tip-card__featured" />}
                </div>
                <div className="dd-tip-card__body">
                  {tip.headline && <h4 className="dd-tip-card__headline">{tip.headline}</h4>}
                  <p className="dd-tip-card__summary">{tip.summary}</p>
                  {tip.checklist?.length > 0 && (
                    <ul className="dd-tip-card__checklist">
                      {tip.checklist.slice(0, 4).map((item, j) => (
                        <li key={j} className="dd-tip-card__checklist-item">
                          <Icon name="check" size={14} className="dd-tip-card__check-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════════════ */
const ReviewsSection = ({ d, size }) => {
  const reviews = d.reviews || [];
  const agg = d.reviewAggregate;
  if (!reviews.length && !agg) return null;

  const totalReviews = agg?.totalReviews || d.reviewCount || 0;
  const avgRating = agg?.avgRating || d.rating || 0;
  const dist = agg?.distribution;
  const stars = dist
    ? [
        { label: "5 ★", count: dist.fiveStar },
        { label: "4 ★", count: dist.fourStar },
        { label: "3 ★", count: dist.threeStar },
        { label: "2 ★", count: dist.twoStar },
        { label: "1 ★", count: dist.oneStar },
      ]
    : [];

  const [aggRef, aggCount, aggVis] = useCounter(avgRating * 10, 1400);
  const [ref, vis] = useInView(0.08);

  return (
    <Section id="reviews" variant="gray">
      <div className="dd-container">
        <SectionHead sub="Hear from travellers who've been there">What Travelers Say</SectionHead>

        {agg && (
          <div ref={aggRef} className="dd-card dd-reviews__aggregate">
            <div className="dd-reviews__score">
              <div className="dd-reviews__score-number">
                {aggVis ? (aggCount / 10).toFixed(1) : avgRating.toFixed(1)}
              </div>
              <div className="dd-reviews__score-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    size={22}
                    className={`dd-reviews__star ${i < Math.round(avgRating) ? "dd-reviews__star--filled" : "dd-reviews__star--empty"}`}
                  />
                ))}
              </div>
              <div className="dd-reviews__score-count">{totalReviews.toLocaleString()} reviews</div>
            </div>

            {stars.length > 0 && (
              <div className="dd-reviews__bars">
                {stars.map((s) => {
                  const pct = totalReviews > 0 ? Math.round((s.count / totalReviews) * 100) : 0;
                  return (
                    <div key={s.label} className="dd-reviews__bar-row">
                      <span className="dd-reviews__bar-label">{s.label}</span>
                      <div className="dd-reviews__bar-track">
                        <div className="dd-reviews__bar-fill" style={{ width: aggVis ? `${pct}%` : "0%" }} />
                      </div>
                      <span className="dd-reviews__bar-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <div ref={ref} className={`dd-reviews__list dd-stagger${vis ? " dd-stagger--visible" : ""}`}>
            {reviews.map((rev, i) => (
              <div key={i} className="dd-card dd-card--lift dd-review-card">
                <div className="dd-review-card__header">
                  <div className="dd-review-card__avatar">
                    {rev.reviewerAvatar ? (
                      <img src={rev.reviewerAvatar} alt="" />
                    ) : (
                      <span className="dd-review-card__avatar-initial">
                        {(rev.reviewerName || "A")[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dd-review-card__name">{rev.reviewerName || "Anonymous"}</div>
                    <div className="dd-review-card__meta">
                      {rev.reviewerCountry && `${rev.reviewerCountry}`}
                      {rev.tripDate && ` · ${new Date(rev.tripDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                    </div>
                  </div>
                  {rev.isVerified && <Icon name="checkCircle" size={18} className="dd-review-card__verified" />}
                </div>

                <div className="dd-review-card__rating-row">
                  <div className="dd-review-card__stars">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Icon
                        key={s}
                        name="star"
                        size={14}
                        className={`dd-review-card__star ${s < Math.round(rev.rating) ? "dd-reviews__star--filled" : "dd-reviews__star--empty"}`}
                      />
                    ))}
                  </div>
                  <span className="dd-review-card__rating-val">{rev.rating.toFixed(1)}</span>
                  {rev.tripType && <span className="dd-tag dd-tag--gray" style={{ fontSize: 9.5 }}>{rev.tripType}</span>}
                </div>

                {rev.title && <p className="dd-review-card__title">"{rev.title}"</p>}
                <p className="dd-review-card__content">"{rev.content}"</p>
                {rev.helpfulCount > 0 && (
                  <p className="dd-review-card__helpful">
                    <Icon name="thumbsUp" size={14} className="dd-review-card__helpful-icon" />
                    {rev.helpfulCount} found helpful
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════ */
const FAQSection = ({ d }) => {
  const [open, setOpen] = useState(null);
  const list = d.faqs || [];
  if (!list.length) return null;

  return (
    <Section id="faqs" variant="white">
      <div className="dd-container dd-container--narrow">
        <SectionHead sub="Common questions answered" center>
          Frequently Asked Questions
        </SectionHead>
        <div className="dd-faqs__list">
          {list.map((faq, i) => (
            <div key={i} className={`dd-faq-item${open === i ? " dd-faq-item--open" : ""}`}>
              <button className="dd-faq-item__question" onClick={() => setOpen(open === i ? null : i)}>
                <span className="dd-faq-item__question-text">{faq.question}</span>
                <div className="dd-faq-item__toggle">
                  <Icon name="plus" size={14} className="dd-faq-item__toggle-icon" />
                </div>
              </button>
              {open === i && (
                <div className="dd-faq-item__answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

/* ═══════════════════════════════════════════════════
   FOOTER CTA
═══════════════════════════════════════════════════ */
const FooterCTA = ({ d, navigate, size }) => {
  const [twRef, displayed, done] = useTypewriter(`Ready to Experience ${d.name}?`, 42, 200);

  return (
    <section className="dd-footer-cta">
      <div className="dd-footer-cta__pattern" />

      {/* Animated rings */}
      {[
        { s: 220, t: "8%", l: "3%", d: "0s" },
        { s: 140, b: "10%", r: "4%", d: "1.7s" },
        { s: 90, t: "32%", r: "16%", d: "1s" },
        { s: 170, b: "5%", l: "16%", d: "2.4s" },
      ].map((r, i) => (
        <div
          key={i}
          className="dd-footer-cta__ring"
          style={{
            width: r.s,
            height: r.s,
            top: r.t,
            left: r.l,
            right: r.r,
            bottom: r.b,
            animationDelay: r.d,
          }}
        />
      ))}

      <div className="dd-container" style={{ position: "relative" }}>
        <div className="dd-footer-cta__globe">
          <Icon name="globe" size={38} className="dd-footer-cta__globe-icon" />
        </div>

        <div ref={twRef} className="dd-footer-cta__title-wrap">
          <h2 className="dd-footer-cta__title">
            {displayed}
            {!done && <span className="dd-hero__cursor" />}
          </h2>
        </div>

        <p className="dd-footer-cta__subtitle">
          Our safari experts will craft a personalised journey just for you. Get in touch and start
          planning your perfect adventure.
        </p>

        <div className="dd-footer-cta__actions">
          <button className="dd-btn dd-btn--primary" onClick={() => navigate("/contact")}>
            <Icon name="mail" size={18} className="dd-btn__icon" style={{ filter: "brightness(0) invert(1)" }} />
            Enquire About This Trip
          </button>
          {(d.countrySlug || d.countryObj?.slug) && (
            <Link to={`/country/${d.countrySlug || d.countryObj?.slug}`} className="dd-btn dd-btn--outline">
              More {d.country || d.countryObj?.name} Destinations
              <Icon name="arrowRight" size={18} className="dd-btn__icon" style={{ filter: "brightness(0) invert(1)" }} />
            </Link>
          )}
        </div>

        <div className="dd-footer-cta__trust">
          {[
            { icon: "award", text: "Expert Guides" },
            { icon: "checkCircle", text: "Verified" },
            { icon: "shield", text: "Safe & Ethical" },
            { icon: "headphones", text: "24/7 Support" },
          ].map((t, i) => (
            <div key={i} className="dd-footer-cta__trust-item">
              <Icon name={t.icon} size={28} className="dd-footer-cta__trust-icon" />
              <div className="dd-footer-cta__trust-text">{t.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════ */
const DestinationDetail = () => {
  const { destinationId, slug, id } = useParams();
  const identifier = destinationId || slug || id;
  const navigate = useNavigate();
  const size = useScreen();

  const { destination, loading, error } = useDestination(identifier);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [identifier]);

  if (loading) return <div className="dd-root"><SkeletonPage /></div>;
  if (error || !destination) return <div className="dd-root"><ErrorState error={error} navigate={navigate} /></div>;

  const d = destination;

  return (
    <div className="dd-root">
      <Hero d={d} size={size} />
      <QuickStatsBar d={d} />
      <OverviewSection d={d} size={size} navigate={navigate} />
      <HighlightsSection d={d} size={size} />
      <BestTimeSection d={d} />
      <ActivitiesSection d={d} size={size} />
      <WildlifeSection d={d} />
      <GallerySection d={d} size={size} />
      <HowToGetThereSection d={d} size={size} />
      <PracticalSection d={d} size={size} />
      <TipsSection d={d} size={size} />
      <ReviewsSection d={d} size={size} />
      <FAQSection d={d} />
      <section className="dd-section dd-section--gray" style={{ padding: "40px 0" }}>
        <div className="dd-container">
          <MiniVideoPlayer
            title={`${d.name} Videos`}
            videos={[
              ...(d.virtualTourUrl
                ? [{ url: d.virtualTourUrl, title: `${d.name} Virtual Tour` }]
                : []),
              ...(d.videoUrl
                ? [{ url: d.videoUrl, title: `${d.name} Video` }]
                : []),
              ...(Array.isArray(d.videos) ? d.videos : []),
            ].filter((v) => v?.url)}
          />
        </div>
      </section>
      <FooterCTA d={d} size={size} navigate={navigate} />
    </div>
  );
};

export default DestinationDetail;