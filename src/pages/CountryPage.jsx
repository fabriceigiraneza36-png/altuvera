import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiMaximize2,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiStar,
  FiSun,
  FiTrendingUp,
  FiUsers,
  FiWifi,
  FiZap,
  FiCamera,
  FiMusic,
  FiCoffee,
  FiAnchor,
  FiActivity,
  FiAward,
  FiBookOpen,
  FiDroplet,
  FiFeather,
  FiGrid,
  FiMap,
  FiNavigation,
  FiSunrise,
  FiTarget,
  FiX,
  FiExternalLink,
  FiInfo,
  FiThumbsUp,
  FiMessageCircle,
  FiShare2,
  FiChevronDown,
  FiLayers,
  FiPackage,
  FiPocket,
  FiLink,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import CookieSettingsButton from "../components/common/CookieSettingsButton";
import { useApp } from "../context/AppContext";
import { countries } from "../data/countries";
import { useCountryDestinations } from "../hooks/useDestinations";
import useCountryInsights from "../hooks/useCountryInsights";
import { toGoogleMapEmbedUrl, toGoogleMapOpenUrl } from "../utils/mediaEmbed";
import { toAbsoluteUrl, toMetaDescription } from "../utils/seo";

/* ═══════════════════════════════════════════════════════ */
/*  HELPERS                                                */
/* ═══════════════════════════════════════════════════════ */
const clean = (v = "") =>
  String(v)
    .replace(/[*#`_]+/g, "")
    .trim();

const toS = (v = "", m = 4) =>
  (clean(v).match(/[^.!?]+[.!?]?/g) || [])
    .map(clean)
    .filter(Boolean)
    .slice(0, m);

const flagAnimVariant = (key = "") => {
  const s = clean(key);
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return String((hash % 5) + 1);
};

const COUNTRY_FLAG_ISO2 = {
  kenya: "ke",
  tanzania: "tz",
  uganda: "ug",
  rwanda: "rw",
  ethiopia: "et",
  djibouti: "dj",
};

const toFlagCdnUrl = (countryId, width = 1280) => {
  const code = COUNTRY_FLAG_ISO2[String(countryId || "").toLowerCase()];
  if (!code) return null;
  const w = Number(width) || 1280;
  return `https://flagcdn.com/w${w}/${code}.png`;
};

const toB = (v = "", m = 6) => {
  const p = clean(v)
    .split(/\n|;|•/)
    .map(clean)
    .filter(Boolean);
  return p.length > 1 ? p.slice(0, m) : toS(v, m);
};

const toP = (v = "", m = 3) => {
  const b = String(v || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map(clean)
    .filter(Boolean);
  if (b.length > 1) return b.slice(0, m);
  const s = toS(v, m * 2),
    p = [];
  for (let i = 0; i < s.length; i += 2)
    p.push(s[i + 1] ? `${s[i]} ${s[i + 1]}` : s[i]);
  return p.slice(0, m);
};

const hLL = (c) =>
  Number.isFinite(c?.mapPosition?.lat) && Number.isFinite(c?.mapPosition?.lng);

const mEmbed = (c) =>
  toGoogleMapEmbedUrl({
    lat: c?.mapPosition?.lat,
    lng: c?.mapPosition?.lng,
    query: `${c?.capital || ""}, ${c?.name || ""}`.trim(),
    zoom: 6,
  });

const mOpen = (c) =>
  toGoogleMapOpenUrl({
    lat: c?.mapPosition?.lat,
    lng: c?.mapPosition?.lng,
    query: `${c?.capital || ""}, ${c?.name || ""}`.trim(),
  });

/* ═══════════════════════════════════════════════════════ */
/*  SCROLL REVEAL                                          */
/* ═══════════════════════════════════════════════════════ */
function useReveal(th = 0.08) {
  const ref = useRef(null);
  const [v, sv] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          sv(true);
          o.unobserve(el);
        }
      },
      { threshold: th, rootMargin: "0px 0px -30px 0px" },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function R({
  children,
  a = "up",
  d = 0,
  dur = 0.72,
  className = "",
  as: T = "div",
  style: sx,
  th,
}) {
  const [ref, v] = useReveal(th);
  const tf = {
    up: ["translateY(120px)", "translateY(0)"],
    down: ["translateY(-120px)", "translateY(0)"],
    left: ["translateX(-140px)", "translateX(0)"],
    right: ["translateX(140px)", "translateX(0)"],
    zoom: ["scale(0.8)", "scale(1)"],
    fade: ["scale(0.92)", "scale(1)"],
  };
  const t = tf[a] || tf.up;
  return (
    <T
      ref={ref}
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? t[1] : t[0],
        transition: `opacity ${dur}s cubic-bezier(.16,1,.3,1) ${d}s, transform ${dur}s cubic-bezier(.16,1,.3,1) ${d}s`,
        willChange: "opacity, transform",
        ...sx,
      }}
    >
      {children}
    </T>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  COUNTER (scroll-triggered)                             */
/* ═══════════════════════════════════════════════════════ */
function Ct({ end, sfx = "", pfx = "", dc = 0, dur = 2200 }) {
  const [ref, v] = useReveal(0.15);
  const [val, sv] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!v || started.current) return;
    started.current = true;
    const num = parseFloat(String(end).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) {
      sv(end);
      return;
    }
    const s = performance.now();
    const tick = (now) => {
      const p = Math.min((now - s) / dur, 1);
      sv(((1 - Math.pow(1 - p, 4)) * num).toFixed(dc));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [v, end, dur, dc]);
  const n = parseFloat(String(end).replace(/[^0-9.]/g, ""));
  return (
    <span ref={ref}>
      {isNaN(n)
        ? end
        : `${pfx}${Number(val).toLocaleString(undefined, {
            minimumFractionDigits: dc,
            maximumFractionDigits: dc,
          })}${sfx}`}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  TYPEWRITER                                             */
/* ═══════════════════════════════════════════════════════ */
function TW({ text, speed = 14, className = "", onComplete }) {
  const [c, sc] = useState(0);
  const [done, sd] = useState(false);
  const safe = typeof text === "string" ? text : "";
  const raf = useRef();
  const last = useRef(0);
  const idx = useRef(0);
  useEffect(() => {
    if (!safe) {
      sc(0);
      sd(false);
      return;
    }
    sc(0);
    sd(false);
    idx.current = 0;
    last.current = performance.now();
    const tick = (now) => {
      const ch = safe[idx.current] || "";
      let dl = speed;
      if (ch === " ") dl = speed * 0.25;
      else if (".!?".includes(ch)) dl = speed * 5;
      else if (",;:".includes(ch)) dl = speed * 3;
      if (now - last.current >= dl) {
        idx.current++;
        sc(idx.current);
        last.current = now;
        if (idx.current >= safe.length) {
          sd(true);
          onComplete?.();
          return;
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [safe, speed, onComplete]);
  if (!safe) return null;
  return (
    <p className={`cp-tw ${className}`}>
      <span>{safe.slice(0, c)}</span>
      {!done && <span className="cp-tw__cursor" />}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  GALLERY                                                */
/* ═══════════════════════════════════════════════════════ */
function Gal({ imgs }) {
  const [a, sa] = useState(0);
  const [lb, slb] = useState(-1);
  const auto = useRef();
  useEffect(() => {
    auto.current = setInterval(
      () => sa((p) => (p + 1) % (imgs?.length || 1)),
      5000,
    );
    return () => clearInterval(auto.current);
  }, [imgs]);
  if (!imgs?.length) return null;
  return (
    <>
      <div className="cp-gal" onClick={() => slb(a)}>
        <img
          src={imgs[a]?.url}
          alt={imgs[a]?.cap}
          className="cp-gal__img"
          loading="lazy"
        />
        <div className="cp-gal__overlay">
          <FiMaximize2 size={22} />
          <span>{imgs[a]?.cap}</span>
        </div>
        <button
          className="cp-gal__nav cp-gal__nav--left"
          onClick={(e) => {
            e.stopPropagation();
            sa((p) => (p - 1 + imgs.length) % imgs.length);
          }}
          aria-label="Previous image"
        >
          <FiChevronLeft size={22} />
        </button>
        <button
          className="cp-gal__nav cp-gal__nav--right"
          onClick={(e) => {
            e.stopPropagation();
            sa((p) => (p + 1) % imgs.length);
          }}
          aria-label="Next image"
        >
          <FiChevronRight size={22} />
        </button>
        <span className="cp-gal__counter">
          {a + 1} / {imgs.length}
        </span>
        <div className="cp-gal__dots">
          {imgs.map((_, i) => (
            <button
              key={i}
              className={`cp-gal__dot${i === a ? " cp-gal__dot--active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                sa(i);
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="cp-gal__thumbs">
        {imgs.map((img, i) => (
          <button
            key={i}
            className={`cp-gal__thumb${
              i === a ? " cp-gal__thumb--active" : ""
            }`}
            onClick={() => sa(i)}
          >
            <img src={img.url} alt={img.cap} loading="lazy" />
          </button>
        ))}
      </div>
      {lb >= 0 && (
        <div className="cp-lb" onClick={() => slb(-1)}>
          <button
            className="cp-lb__close"
            onClick={() => slb(-1)}
            aria-label="Close lightbox"
          >
            <FiX size={24} />
          </button>
          <button
            className="cp-lb__arrow cp-lb__arrow--left"
            onClick={(e) => {
              e.stopPropagation();
              slb((p) => (p - 1 + imgs.length) % imgs.length);
            }}
            aria-label="Previous"
          >
            <FiChevronLeft size={28} />
          </button>
          <img
            src={imgs[lb]?.url}
            alt={imgs[lb]?.cap}
            className="cp-lb__img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="cp-lb__arrow cp-lb__arrow--right"
            onClick={(e) => {
              e.stopPropagation();
              slb((p) => (p + 1) % imgs.length);
            }}
            aria-label="Next"
          >
            <FiChevronRight size={28} />
          </button>
          <div className="cp-lb__caption">
            {imgs[lb]?.cap}
            {imgs[lb]?.ctx && ` — ${imgs[lb].ctx}`}
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  VIDEOS                                                 */
/* ═══════════════════════════════════════════════════════ */
function Vids({ videos }) {
  const [p, sp] = useState(null);
  if (!videos?.length) return null;
  return (
    <div className="cp-vid">
      {p !== null && (
        <R a="fade" className="cp-vid__player">
          <div className="cp-vid__embed">
            <iframe
              src={videos[p].url}
              title={videos[p].title}
              frameBorder="0"
              allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="cp-vid__bar">
            <h4>{videos[p].title}</h4>
            <button onClick={() => sp(null)}>
              <FiX size={14} /> Close
            </button>
          </div>
        </R>
      )}
      <div className="cp-vid__grid">
        {videos.map((v, i) => (
          <R key={i} a="up" d={i * 0.08}>
            <button
              className={`cp-vid__card${
                p === i ? " cp-vid__card--active" : ""
              }`}
              onClick={() => sp(i)}
            >
              <div className="cp-vid__thumbnail">
                <img src={v.thumb} alt={v.title} loading="lazy" />
                <div className="cp-vid__play-icon">
                  <FiPlay size={24} />
                </div>
              </div>
              <div className="cp-vid__title">{v.title}</div>
            </button>
          </R>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  AI HELPERS                                             */
/* ═══════════════════════════════════════════════════════ */
function Loader() {
  return (
    <div className="cp-loader">
      <div className="cp-loader__orb">
        <div className="cp-loader__ring" />
        <FiZap className="cp-loader__icon" />
      </div>
      <h4>Synchronizing Neural Core</h4>
      <p>Consulting High-Precision AI Models...</p>
      <div className="cp-loader__bars">
        {[0, 0.15, 0.3, 0.45, 0.6].map((d, i) => (
          <span key={i} style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
      <div className="cp-loader__skeleton" />
      <div className="cp-loader__skeleton cp-loader__skeleton--md" />
      <div className="cp-loader__skeleton cp-loader__skeleton--sm" />
    </div>
  );
}

function Err({ message, onRetry }) {
  return (
    <div className="cp-err">
      <div className="cp-err__icon">⚠️</div>
      <h4>Intelligence Unavailable</h4>
      <p>{message || "Failed to load intelligence data."}</p>
      {onRetry && (
        <button className="cp-err__btn" onClick={onRetry}>
          <FiRefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

function Stg({ index: i, children }) {
  const [v, sv] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => sv(true), 180 + i * 240);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <div
      className="cp-ai-stage"
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "translateY(0)" : "translateY(12px)",
        transition: "all .5s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  FLOATING SHARE BAR                                     */
/* ═══════════════════════════════════════════════════════ */
function ShareBar({ name }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const share = () => {
    if (navigator.share)
      navigator.share({ title: `Discover ${name}`, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };
  return (
    <div className={`cp-share${show ? " cp-share--visible" : ""}`}>
      <button onClick={share} title="Share" aria-label="Share this page">
        <FiShare2 size={18} />
      </button>
    </div>
  );
}
  
/* ═══════════════════════════════════════════════════════ */
/*  OFFICIAL TOURISM LINKS                                 */
/* ═══════════════════════════════════════════════════════ */
const OFFICIAL_LINKS = {
  kenya: {
    url: "https://www.magicalkenya.com/",
    label: "Magical Kenya — Official Tourism Board",
  },
  uganda: {
    url: "https://www.visituganda.com/",
    label: "Visit Uganda — Explore the Pearl of Africa",
  },
  tanzania: {
    url: "https://www.tanzaniatourism.go.tz/",
    label: "Tanzania Country — Official Portal",
  },
  rwanda: {
    url: "https://www.visitrwanda.com/",
    label: "Visit Rwanda — Official Tourism Website",
  },
  "south-africa": {
    url: "https://www.southafrica.net/",
    label: "South Africa — Official Site",
  },
  ethiopia: {
    url: "https://www.ethiopia.travel/",
    label: "Ethiopia Travel — Official Tourism",
  },
  somalia: {
    url: "https://www.visit-somalia.com/",
    label: "Visit Somalia — Official Portal",
  },
};
const getOfficialLink = (id) => OFFICIAL_LINKS[id] || null;

/* ═══════════════════════════════════════════════════════ */
/*  COUNTRY DATA                                           */
/* ═══════════════════════════════════════════════════════ */
/**
 * Modern, responsive, “content blocks” structure for country pages.
 * Goal: your UI can render sections in different layouts (hero split, cards, masonry, timelines, accordions)
 * without rewriting country copy. Content is interleaved with media for modern mixed layouts.
 *
 * Notes:
 * - All numeric travel stats are approximate/estimates and change year-to-year.
 * - Visa/health rules change; show “check official guidance” in UI.
 * - Unsplash images are placeholders; swap with licensed assets when you have them.
 */

const DATA = {
  meta: {
    updatedAt: "2026-03-07",
    contentTone: "professional-tourism",
    legalNote:
      "Travel requirements, fees, and health guidance change frequently. Always confirm visa rules, park fees, permits, and advisories via official government and operator channels.",
    uiDefaults: {
      currencyDisplay: "USD",
      distanceUnit: "km",
      temperatureUnit: "C",
      breakpoints: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280 },
      image: {
        quality: 80,
        sizes: {
          hero: "(max-width: 768px) 100vw, 60vw",
          card: "(max-width: 768px) 100vw, 33vw",
          masonry: "(max-width: 768px) 50vw, 25vw",
        },
        widths: [480, 768, 1024, 1280, 1600, 1920],
      },
    },
  },

  countries: {
    kenya: {
      id: "kenya",
      slug: "kenya",
      name: "Kenya",
      region: "East Africa",
      tagline:
        "The classic safari-and-sea itinerary—big cats, Rift Valley lakes, and a living Swahili coast.",
      theme: { accent: "#E11D48", surface: "#0B1220", textOnAccent: "#FFFFFF" },

      seo: {
        title:
          "Visit Kenya | Safaris, Beaches, Culture & Practical Travel Guide",
        description:
          "Plan a Kenya trip with safari highlights (Maasai Mara, Amboseli, Tsavo), Indian Ocean beaches (Diani, Lamu), best seasons, itineraries, and travel essentials.",
      },

      essentials: {
        capitals: [{ name: "Nairobi", type: "capital" }],
        languages: ["English", "Swahili"],
        currency: { code: "KES", name: "Kenyan Shilling" },
        timeZone: "EAT (UTC+3)",
        plugs: ["G"],
        drivingSide: "left",
        keyAirports: [
          { code: "NBO", name: "Jomo Kenyatta International (Nairobi)" },
          { code: "MBA", name: "Moi International (Mombasa)" },
          {
            code: "WIL",
            name: "Wilson Airport (Nairobi – domestic/safari flights)",
          },
        ],
      },

      quickKpis: [
        { label: "Population (est.)", value: "56M" },
        { label: "Area", value: "580,367 km²" },
        { label: "UNESCO Sites", value: "6" },
        { label: "Coastline", value: "536 km" },
        { label: "Best for", value: "Safari + Beach" },
      ],

      signature: {
        whatItsKnownFor: [
          "Big cat safaris and the Serengeti–Mara migration system",
          "Community conservancies and high-quality guiding",
          "Swahili coastal heritage and Indian Ocean resorts",
          "Rift Valley lakes and world-class birding",
        ],
        idealTripLength: [
          "7–10 days (first-timers)",
          "10–14 days (safari + coast)",
          "4–6 days (short safari)",
        ],
        travelStyles: [
          "Couples",
          "Family",
          "Photography",
          "Luxury",
          "Adventure",
          "Culture & Heritage",
        ],
      },

      whenToGo: {
        summary:
          "Kenya is a year-round destination. Dry seasons generally offer easier wildlife viewing; migration timing varies with rainfall.",
        seasons: [
          {
            name: "Peak safari season (drier)",
            months: "Jun–Oct",
            pros: [
              "Excellent wildlife visibility",
              "Comfortable safari conditions",
            ],
            watchFor: [
              "Higher prices and occupancy",
              "Advance booking recommended",
            ],
          },
          {
            name: "Short dry season",
            months: "Jan–Feb",
            pros: [
              "Great general safari conditions",
              "Hotter and sunnier coast",
            ],
            watchFor: ["Warm mid-day temperatures in some parks"],
          },
          {
            name: "Greener months",
            months: "Mar–May",
            pros: [
              "Lush landscapes",
              "Often better value",
              "Good photography light after rains",
            ],
            watchFor: [
              "Muddy roads in some areas",
              "Some camps may close seasonally",
            ],
          },
          {
            name: "Short rains",
            months: "Nov–Dec",
            pros: ["Fresh scenery", "Shoulder-season pricing"],
            watchFor: ["Rain showers; timing is variable"],
          },
        ],
      },

      practical: {
        entry: [
          {
            title: "Visa / entry authorization",
            detail:
              "Most travelers apply online in advance (requirements vary by nationality). Confirm rules and processing time before booking flights.",
          },
          {
            title: "Health",
            detail:
              "Malaria risk exists in many regions. Yellow fever proof may be required depending on your routing. Consult a travel clinic for vaccines and prophylaxis advice.",
          },
          {
            title: "Money",
            detail:
              "Cards work in cities and many lodges; carry cash for markets, tips, and remote areas. ATMs are common in major towns.",
          },
          {
            title: "Getting around",
            detail:
              "Safari circuits combine road transfers and short domestic flights to airstrips. A 4x4 is recommended for self-drive in rainy months.",
          },
          {
            title: "Responsible travel",
            detail:
              "Choose conservancy-based stays where possible, keep a respectful wildlife distance, and prefer community-led cultural experiences with clear benefit sharing.",
          },
        ],
      },

      // Modern “blocks” to render a responsive page
      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            layout: { reverseOnDesktop: false },
            title: "Kenya",
            subtitle:
              "Big cats on open savanna, flamingo lakes in the Rift Valley, and Swahili coastal towns shaped by centuries of Indian Ocean trade.",
            badges: ["Safari", "Beach", "Culture", "Birding"],
            media: {
              kind: "image",
              alt: "Lion in savanna grass at golden hour",
              credit: { name: "Unsplash", url: "https://unsplash.com" },
              src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80",
              srcSet: [
                "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=768&q=80 768w",
                "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1280&q=80 1280w",
                "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80 1920w",
              ],
              sizes: "(max-width: 768px) 100vw, 60vw",
              aspectRatio: "16/10",
              focalPoint: "center",
            },
            ctas: [
              { label: "Build a Kenya itinerary", href: "/plan/kenya" },
              { label: "Best time to visit", href: "#when-to-go" },
            ],
          },

          {
            type: "kpi.strip",
            id: "kpis",
            items: [
              {
                label: "Top wildlife areas",
                value: "Mara • Amboseli • Tsavo • Samburu",
              },
              { label: "Iconic coast", value: "Diani • Watamu • Lamu" },
              {
                label: "UNESCO highlights",
                value: "Lamu • Mt Kenya • Fort Jesus • Turkana",
              },
              { label: "Gateway", value: "Nairobi (NBO/WIL)" },
            ],
          },

          {
            type: "editorial.grid",
            id: "story-grid",
            title: "Why Kenya works so well for first-time safari travelers",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "Efficient safari circuits",
                body: "Kenya’s parks, conservancies, and airstrips are set up for multi-stop trips. Many travelers do a short flight to the Mara, then connect to Amboseli or Tsavo, and finish on the coast—without losing days to long drives.",
                media: {
                  src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                  alt: "Wildlife on open plains",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Conservancy-led experiences",
                body: "Community and private conservancies often allow walking safaris and night drives (where permitted). These models can also generate direct local revenue through land leases, jobs, and ranger programs.",
                media: {
                  src: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=1600&q=80",
                  alt: "Cultural experience and guiding",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Safari + beach is seamless",
                body: "Kenya’s Indian Ocean coast is a genuine second chapter—snorkeling and reefs in marine parks, dhow sailing, and heritage towns. It’s a classic way to decompress after early mornings on game drives.",
                media: {
                  src: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1600&q=80",
                  alt: "White-sand beach and palm trees",
                  aspectRatio: "4/3",
                },
              },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            subtitle:
              "Build your route around these regions, then layer in culture, food, and rest days.",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Maasai Mara & conservancies",
                text: "Kenya’s most famous safari landscape—big cats, river ecosystems, and strong guiding. Consider adding a conservancy stay for quieter viewing and (often) walking/night activities.",
                media: {
                  src: "https://images.unsplash.com/photo-1552410260-0fd9b577afa6?auto=format&fit=crop&w=1600&q=80",
                  alt: "Safari vehicle watching wildlife",
                },
              },
              {
                title: "Amboseli National Park",
                text: "Known for elephants and wide-open views with Kilimanjaro often visible on clear mornings. Excellent for photography when conditions align.",
                media: {
                  src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                  alt: "Elephants in open landscape",
                },
              },
              {
                title: "Tsavo East & Tsavo West",
                text: "A vast, rugged wilderness between Nairobi and the coast—ideal if you’re combining safari with Mombasa or Diani. Scenic geology and big landscapes are the draw.",
                media: {
                  src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                  alt: "Dramatic landscape and open terrain",
                },
              },
              {
                title: "Nairobi",
                text: "A lively gateway city for food, art, and day trips—plus Nairobi National Park. Plan at least one flexible day for museums, markets, and curated local experiences.",
                media: {
                  src: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=1600&q=80",
                  alt: "City skyline at dusk",
                },
              },
              {
                title: "Lamu Archipelago (UNESCO)",
                text: "Car-free alleys, coral-stone architecture, and dhow culture. Best for travelers who want heritage with a slower coastal rhythm.",
                media: {
                  src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
                  alt: "Historic stone town streets",
                },
              },
              {
                title: "Rift Valley lakes",
                text: "Boat rides, escarpments, and birdlife. Flamingo numbers vary year-to-year, but the overall biodiversity and scenery remain excellent.",
                media: {
                  src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80",
                  alt: "Lake landscape with birds",
                },
              },
            ],
          },

          {
            type: "carousel.experiences",
            id: "experiences",
            title: "Signature experiences",
            items: [
              {
                title: "Classic 4x4 game drives",
                text: "Dawn and late-afternoon drives for the best light and animal activity. Many lodges tailor drives for photographers, families, or birding-focused travelers.",
                media: {
                  src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1600&q=80",
                  alt: "Safari at sunrise",
                },
              },
              {
                title: "Hot-air balloon over the Mara (seasonal)",
                text: "A sunrise flight with sweeping savanna views. Weather dependent and typically booked well in advance during peak months.",
                media: {
                  src: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1600&q=80",
                  alt: "Hot air balloons over plains",
                },
              },
              {
                title: "Swahili coast snorkeling & dhow sailing",
                text: "Reefs, lagoons, and traditional sailing—ideal as a relaxing second leg after safari. Choose marine operators that follow wildlife-safe codes.",
                media: {
                  src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                  alt: "Ocean lagoon and boat",
                },
              },
              {
                title: "Mount Kenya trekking",
                text: "A highland trek through forest and alpine zones. Point Lenana is a popular non-technical objective for fit trekkers.",
                media: {
                  src: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1600&q=80",
                  alt: "Mountain at sunrise",
                },
              },
            ],
          },

          {
            type: "timeline.seasons",
            id: "when-to-go",
            anchor: "when-to-go",
            title: "Best time to visit Kenya",
            items: kenyaSeasonItems(), // optional: replace with static array if you prefer pure JSON
            // If you want pure JSON, remove the function usage and inline the same content as in whenToGo.seasons.
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries (realistic pacing)",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "7 days: Mara + Nairobi",
                days: 7,
                pace: "Comfortable",
                route: ["Nairobi", "Maasai Mara (3–4 nights)", "Nairobi"],
                notes:
                  "Ideal for first safari. Add a conservancy stay for quieter viewing. Include 1 flexible night in Nairobi for museums/food.",
              },
              {
                title: "10 days: Mara + Amboseli + coast",
                days: 10,
                pace: "Classic combo",
                route: ["Nairobi", "Mara", "Amboseli", "Diani/Watamu"],
                notes:
                  "Balances wildlife variety with beach recovery. Use short flights to reduce long drives and maximize experience time.",
              },
              {
                title: "14 days: conservancies + Rift Valley + Lamu",
                days: 14,
                pace: "In-depth",
                route: [
                  "Nairobi",
                  "Laikipia",
                  "Mara (conservancy)",
                  "Rift Valley lakes",
                  "Lamu",
                ],
                notes:
                  "For travelers who want guiding depth, walking options, and a heritage-focused coast rather than a resort scene.",
              },
            ],
          },

          {
            type: "accordion.practical",
            id: "essentials",
            title: "Travel essentials",
            items: [
              {
                q: "Do I need a visa?",
                a: "Most travelers apply online in advance. Requirements depend on nationality and routing—confirm before booking.",
              },
              {
                q: "Is Kenya good for families?",
                a: "Yes—many lodges cater to families with flexible schedules, private vehicles, and child-friendly activities. Always check age limits for walking/night activities.",
              },
              {
                q: "How much time should I spend in the Mara?",
                a: "Typically 3 nights for a first visit. Add nights if you want slower pacing, photography time, or a conservancy extension.",
              },
              {
                q: "What should I pack for safari?",
                a: "Neutral layers, sun protection, insect repellent, a warm layer for early drives, and a small daypack. Binoculars are highly recommended.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: Kenya in motion",
            items: [
              {
                title: "Kenya Safari — Maasai Mara",
                url: "https://youtu.be/xTYnb78h4G4",
                thumb:
                  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Nairobi — City & Wildlife",
                url: "https://www.youtube.com/embed/YWbqEGcwDgE",
                thumb:
                  "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Kenya Coast — Swahili Shores",
                url: "https://www.youtube.com/embed/1a9zq3b3Gm8",
                thumb:
                  "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80",
                alt: "Lion portrait",
              },
              {
                src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                alt: "Elephants in open plains",
              },
              {
                src: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1600&q=80",
                alt: "Mountain Kenya sunrise",
              },
              {
                src: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1600&q=80",
                alt: "Beach coastline",
              },
              {
                src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                alt: "Savanna migration scene",
              },
              {
                src: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
                alt: "Stone town alley",
              },
              {
                src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80",
                alt: "Lake and birds",
              },
              {
                src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1600&q=80",
                alt: "Safari sunrise light",
              },
            ],
          },
        ],
      },
    },

    uganda: {
      id: "uganda",
      slug: "uganda",
      name: "Uganda",
      region: "East Africa / Great Lakes",
      tagline:
        "The Pearl of Africa—gorillas, chimps, the Nile, and compact biodiversity-rich safaris.",
      theme: { accent: "#22C55E", surface: "#08130E", textOnAccent: "#06110C" },

      seo: {
        title:
          "Visit Uganda | Gorilla Trekking, Nile Adventures & Safari Planning",
        description:
          "Discover Uganda’s gorilla trekking in Bwindi, chimp tracking in Kibale, Nile adventures in Jinja, and classic safaris in Murchison and Queen Elizabeth—plus best seasons and travel essentials.",
      },

      essentials: {
        capitals: [{ name: "Kampala", type: "capital" }],
        languages: ["English", "Swahili (official)", "Luganda (widely spoken)"],
        currency: { code: "UGX", name: "Ugandan Shilling" },
        timeZone: "EAT (UTC+3)",
        plugs: ["G"],
        drivingSide: "left",
        keyAirports: [{ code: "EBB", name: "Entebbe International" }],
      },

      quickKpis: [
        { label: "National Parks", value: "10" },
        { label: "Bird species (recorded)", value: "1,000+" },
        { label: "Top primates", value: "Gorillas + chimps" },
        { label: "Signature river", value: "The Nile (Jinja source area)" },
        { label: "UNESCO sites", value: "3" },
      ],

      signature: {
        whatItsKnownFor: [
          "Mountain gorilla trekking (permit-based and strictly regulated)",
          "Chimpanzee tracking in primate-rich forests",
          "Boat safaris on the Nile and Kazinga Channel",
          "Adventure travel around Jinja",
        ],
        idealTripLength: [
          "6–9 days (gorillas + 1–2 parks)",
          "10–14 days (gorillas + chimps + 2 safaris)",
        ],
        travelStyles: [
          "Adventure",
          "Wildlife",
          "Birding",
          "Culture",
          "Photographers",
        ],
      },

      whenToGo: {
        summary:
          "Uganda is visitable year-round. Drier months often make trekking and park roads easier, but forests can be wet in any season.",
        seasons: [
          {
            name: "Drier periods",
            months: "Dec–Feb & Jun–Aug",
            pros: ["Better trail conditions"],
            watchFor: ["Higher demand"],
          },
          {
            name: "Wetter periods",
            months: "Mar–May & Sep–Nov",
            pros: ["Lush forests", "Often better value"],
            watchFor: ["Mud and rain showers"],
          },
        ],
      },

      practical: {
        importantPermits: [
          {
            title: "Gorilla permits",
            detail:
              "Limited and often sell out. Prices and rules change—book early through licensed operators and confirm current policy.",
          },
          {
            title: "Chimp tracking permits",
            detail:
              "Required in many sites; availability varies by park and season—reserve in advance in peak months.",
          },
        ],
        entry: [
          {
            title: "Visa",
            detail:
              "Most travelers use an e-visa system or eligible arrival options (nationality-dependent).",
          },
          {
            title: "Health",
            detail:
              "Yellow fever proof is commonly required; malaria prevention is advised in many regions.",
          },
          {
            title: "Trekking readiness",
            detail:
              "Expect steep, slippery trails. Porters are available and support local livelihoods.",
          },
        ],
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            layout: { reverseOnDesktop: true },
            title: "Uganda",
            subtitle:
              "Forest primates, river safaris, and the Nile’s adventure capital—remarkable diversity packed into a single itinerary.",
            badges: [
              "Gorilla trekking",
              "Chimp tracking",
              "Nile adventures",
              "Birding",
            ],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1920&q=80",
              alt: "Mountain gorilla in forest",
              aspectRatio: "16/10",
            },
            ctas: [
              { label: "Plan gorilla trekking", href: "/plan/uganda/gorillas" },
              { label: "Best seasons", href: "#when-to-go" },
            ],
          },

          {
            type: "kpi.grid",
            id: "kpi-grid",
            columns: { xs: 2, md: 4 },
            items: [
              {
                label: "Top parks",
                value: "Bwindi • Kibale • Murchison • Queen Elizabeth",
              },
              { label: "Adventure hub", value: "Jinja (Nile)" },
              { label: "Best add-on", value: "Lake Bunyonyi reset days" },
              { label: "UNESCO", value: "Bwindi • Rwenzori • Kasubi Tombs" },
            ],
          },

          {
            type: "editorial.stack",
            id: "editorial",
            title: "Uganda’s strongest travel combo",
            subtitle:
              "A practical way to build a trip that feels varied (without excessive transit).",
            items: [
              {
                heading: "1) Primates first",
                body: "Start with chimp tracking in Kibale (near Fort Portal) before gorilla trekking in Bwindi. This sequencing helps you ease into early starts and forest hiking before the biggest trek day.",
                media: {
                  src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                  alt: "Tropical forest canopy",
                },
              },
              {
                heading: "2) Add a classic safari",
                body: "Pair the forest with a savanna park: Murchison Falls for Nile boat safari drama, or Queen Elizabeth for the Kazinga Channel’s dense wildlife viewing. Many itineraries include both for variety.",
                media: {
                  src: "https://images.unsplash.com/photo-1596395463364-ce07e4df1c85?auto=format&fit=crop&w=1600&q=80",
                  alt: "Waterfall and river landscape",
                },
              },
              {
                heading: "3) Finish with water and rest",
                body: "Lake Bunyonyi is a popular decompression stop after Bwindi—cooler air, island views, and gentle activities before returning to Entebbe.",
                media: {
                  src: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?auto=format&fit=crop&w=1600&q=80",
                  alt: "Lake with islands and hills",
                },
              },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Bwindi Impenetrable National Park (UNESCO)",
                text: "One of the world’s most important mountain gorilla habitats. Treks are guided and strictly managed—plan for steep, muddy trails.",
                media: {
                  src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1600&q=80",
                  alt: "Gorilla in the forest",
                },
              },
              {
                title: "Kibale Forest National Park",
                text: "Premier chimp tracking in a primate-rich forest. Pair with Bigodi community wetlands for a slower, birdy afternoon.",
                media: {
                  src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                  alt: "Dense green forest trail",
                },
              },
              {
                title: "Murchison Falls National Park",
                text: "Game drives plus a standout boat safari to the falls. A strong choice if you want a “river safari” feel alongside savanna wildlife.",
                media: {
                  src: "https://images.unsplash.com/photo-1596395463364-ce07e4df1c85?auto=format&fit=crop&w=1600&q=80",
                  alt: "River and falls",
                },
              },
              {
                title: "Queen Elizabeth National Park",
                text: "Classic safari landscapes and the Kazinga Channel boat cruise, often with excellent hippo and bird viewing.",
                media: {
                  src: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1600&q=80",
                  alt: "Savanna wildlife scene",
                },
              },
              {
                title: "Jinja (Source of the Nile area)",
                text: "Rafting, kayaking, and relaxed riverside cafés. Choose reputable operators with strong safety standards and certified guides.",
                media: {
                  src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
                  alt: "River landscape suitable for rafting",
                },
              },
              {
                title: "Rwenzori Mountains (UNESCO)",
                text: "A unique trekking environment with Afro-alpine flora and high peaks. Multi-day routes require experienced guides and good preparation.",
                media: {
                  src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                  alt: "Mountain landscape and clouds",
                },
              },
            ],
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "6 days: gorillas + Lake Bunyonyi",
                days: 6,
                pace: "Efficient",
                route: [
                  "Entebbe",
                  "Bwindi (2–3 nights)",
                  "Lake Bunyonyi",
                  "Entebbe",
                ],
                notes:
                  "Best for travelers with limited time who want the core primate experience plus a rest buffer.",
              },
              {
                title: "9 days: chimps + gorillas + QENP",
                days: 9,
                pace: "Balanced",
                route: [
                  "Entebbe",
                  "Kibale",
                  "Queen Elizabeth",
                  "Bwindi",
                  "Entebbe",
                ],
                notes:
                  "A classic ‘forest + savanna’ structure with manageable driving days.",
              },
              {
                title: "12 days: Murchison + Kibale + gorillas",
                days: 12,
                pace: "In-depth",
                route: [
                  "Entebbe",
                  "Murchison",
                  "Kibale",
                  "Queen Elizabeth",
                  "Bwindi",
                  "Entebbe",
                ],
                notes:
                  "Adds a Nile boat safari and broader wildlife variety, ideal for birders and photographers.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: Uganda highlights",
            items: [
              {
                title: "Gorilla Trekking — Bwindi",
                url: "https://www.youtube.com/embed/K3FKRaGJwbk",
                thumb:
                  "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Source of the Nile — Jinja",
                url: "https://www.youtube.com/embed/r88pXkZcXi0",
                thumb:
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Uganda Safari — Parks & Rivers",
                url: "https://www.youtube.com/embed/CVGpEex4t6E",
                thumb:
                  "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1600&q=80",
                alt: "Gorilla close-up",
              },
              {
                src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                alt: "Forest canopy",
              },
              {
                src: "https://images.unsplash.com/photo-1596395463364-ce07e4df1c85?auto=format&fit=crop&w=1600&q=80",
                alt: "Waterfall river",
              },
              {
                src: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?auto=format&fit=crop&w=1600&q=80",
                alt: "Lake scenery",
              },
              {
                src: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1600&q=80",
                alt: "Savanna wildlife",
              },
              {
                src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                alt: "Mountain clouds",
              },
              {
                src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
                alt: "River view",
              },
              {
                src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                alt: "Landscape light",
              },
            ],
          },
        ],
      },
    },

    tanzania: {
      id: "tanzania",
      slug: "tanzania",
      name: "Tanzania",
      region: "East Africa",
      tagline:
        "Serengeti migration drama, Ngorongoro’s crater, Kilimanjaro’s summit, and Zanzibar’s coast.",
      theme: { accent: "#F59E0B", surface: "#0B1220", textOnAccent: "#0B1220" },

      seo: {
        title: "Visit Tanzania | Serengeti, Ngorongoro, Kilimanjaro & Zanzibar",
        description:
          "Plan Tanzania safaris across the Serengeti and Ngorongoro, climb Kilimanjaro, unwind in Zanzibar, and explore best seasons, itineraries, and travel essentials.",
      },

      essentials: {
        capitals: [
          { name: "Dodoma", type: "official" },
          { name: "Dar es Salaam", type: "commercial" },
        ],
        languages: ["Swahili", "English"],
        currency: { code: "TZS", name: "Tanzanian Shilling" },
        timeZone: "EAT (UTC+3)",
        plugs: ["D", "G (varies)"],
        drivingSide: "left",
        keyAirports: [
          { code: "JRO", name: "Kilimanjaro International (Arusha gateway)" },
          { code: "DAR", name: "Julius Nyerere International (Dar es Salaam)" },
          { code: "ZNZ", name: "Zanzibar International" },
        ],
      },

      quickKpis: [
        { label: "UNESCO sites", value: "7" },
        { label: "Iconic parks", value: "Serengeti • Ngorongoro • Tarangire" },
        { label: "Highest peak", value: "Kilimanjaro (5,895 m)" },
        { label: "Coastline", value: "1,400+ km" },
        { label: "Trip types", value: "Safari + Trek + Beach" },
      ],

      signature: {
        whatItsKnownFor: [
          "Great Migration across the Serengeti ecosystem",
          "Ngorongoro Crater’s concentrated wildlife viewing",
          "Kilimanjaro trekking routes with multi-day acclimatization",
          "Zanzibar’s Stone Town (UNESCO) and reef lagoons",
          "Remote chimp trekking (Mahale/Gombe) for specialists",
        ],
        idealTripLength: [
          "8–12 days (northern circuit + Zanzibar)",
          "12–16 days (add Serengeti depth or southern parks)",
        ],
        travelStyles: [
          "Wildlife",
          "Honeymoon",
          "Adventure",
          "Luxury",
          "Family",
          "Photography",
        ],
      },

      whenToGo: {
        summary:
          "Tanzania is year-round. Dry months are classic safari season; green months can be spectacular and often quieter. Migration location varies by rainfall and time of year.",
        seasons: [
          {
            name: "Dry season",
            months: "Jun–Oct",
            pros: ["Easier wildlife viewing", "Great for northern Serengeti"],
            watchFor: ["Peak pricing"],
          },
          {
            name: "Green season",
            months: "Nov–Mar",
            pros: ["Lush landscapes", "Excellent photography"],
            watchFor: ["Short showers possible"],
          },
          {
            name: "Long rains",
            months: "Mar–May",
            pros: ["Lower crowds in some areas"],
            watchFor: ["Some camps close; road conditions vary"],
          },
        ],
      },

      practical: {
        entry: [
          {
            title: "Visa",
            detail:
              "Rules vary by nationality; confirm e-visa/arrival options before booking.",
          },
          {
            title: "Health",
            detail:
              "Malaria prevention is commonly advised; yellow fever proof may be required depending on routing.",
          },
          {
            title: "Park fees",
            detail:
              "Fees are park- and residency-dependent and change; your operator typically includes them in quotes.",
          },
          {
            title: "Kilimanjaro planning",
            detail:
              "Route choice and acclimatization are key. Ask about porter welfare standards and safety protocols.",
          },
        ],
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "Tanzania",
            subtitle:
              "One itinerary can include the Serengeti’s migration ecosystem, Ngorongoro’s volcanic drama, a Kilimanjaro summit attempt, and a Zanzibar beach finish.",
            badges: [
              "Great Migration",
              "Ngorongoro",
              "Kilimanjaro",
              "Zanzibar",
            ],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80",
              alt: "Migration wildlife on the plains",
              aspectRatio: "16/10",
            },
            ctas: [
              { label: "Build Tanzania route", href: "/plan/tanzania" },
              { label: "Migration planner", href: "/plan/tanzania/migration" },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Serengeti National Park (UNESCO)",
                text: "A vast ecosystem of predators and grazing herds. Where you stay matters—choose camps that match the season’s wildlife location.",
                media: {
                  src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                  alt: "Wildlife on open plains",
                },
              },
              {
                title: "Ngorongoro Conservation Area (UNESCO)",
                text: "A striking caldera landscape with strong wildlife density on the crater floor. Early starts help avoid peak congestion.",
                media: {
                  src: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?auto=format&fit=crop&w=1600&q=80",
                  alt: "Crater landscape",
                },
              },
              {
                title: "Tarangire National Park",
                text: "Known for elephants and baobab scenery, often excellent in the drier months when wildlife concentrates near the river.",
                media: {
                  src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                  alt: "Elephants in savanna",
                },
              },
              {
                title: "Zanzibar (Stone Town UNESCO)",
                text: "Swahili coastal heritage and beach time. Combine a Stone Town stay with a reef-side hotel for the best of both.",
                media: {
                  src: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&w=1600&q=80",
                  alt: "Zanzibar beach and ocean",
                },
              },
              {
                title: "Kilimanjaro National Park (UNESCO)",
                text: "A multi-day, non-technical trek to Africa’s highest peak. Success depends on pace and acclimatization more than athleticism.",
                media: {
                  src: "https://images.unsplash.com/photo-1621414050946-1b4ea3cf6d68?auto=format&fit=crop&w=1600&q=80",
                  alt: "Kilimanjaro landscape",
                },
              },
              {
                title: "Mahale or Gombe (chimp trekking)",
                text: "Remote, specialist add-ons on Lake Tanganyika. Best for travelers who have time and want a unique primate focus beyond savanna safaris.",
                media: {
                  src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                  alt: "Forest near lake region",
                },
              },
            ],
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "8 days: northern circuit highlights",
                days: 8,
                pace: "Classic",
                route: [
                  "Arusha",
                  "Tarangire",
                  "Ngorongoro",
                  "Serengeti (3 nights)",
                  "Arusha",
                ],
                notes:
                  "Best for first-timers who want a strong mix of landscapes and wildlife without rushing.",
              },
              {
                title: "12 days: safari + Zanzibar",
                days: 12,
                pace: "Balanced",
                route: [
                  "Arusha",
                  "Serengeti",
                  "Ngorongoro",
                  "Fly to Zanzibar",
                  "Beach (4–5 nights)",
                ],
                notes:
                  "A flagship Tanzania trip—excellent for couples and families who want a relaxed finish.",
              },
              {
                title: "14 days: Kilimanjaro + safari",
                days: 14,
                pace: "Ambitious",
                route: [
                  "Kilimanjaro trek (7–9 days)",
                  "Safari (Tarangire/Ngorongoro/Serengeti)",
                ],
                notes:
                  "Plan a buffer day between the trek and safari, and choose a route with good acclimatization profile.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: Tanzania highlights",
            items: [
              {
                title: "Serengeti — Safari & Migration",
                url: "https://www.youtube.com/embed/ajfzOk_CZxE",
                thumb:
                  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Zanzibar — Stone Town & Beaches",
                url: "https://www.youtube.com/embed/v8PCWdDPJ5s",
                thumb:
                  "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Kilimanjaro — Summit Trek",
                url: "https://www.youtube.com/embed/8hVw0mN2ZlM",
                thumb:
                  "https://images.unsplash.com/photo-1621414050946-1b4ea3cf6d68?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                alt: "Serengeti wildlife",
              },
              {
                src: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?auto=format&fit=crop&w=1600&q=80",
                alt: "Zanzibar beach",
              },
              {
                src: "https://images.unsplash.com/photo-1621414050946-1b4ea3cf6d68?auto=format&fit=crop&w=1600&q=80",
                alt: "Kilimanjaro view",
              },
              {
                src: "https://images.unsplash.com/photo-1528277342758-f1d7613953a2?auto=format&fit=crop&w=1600&q=80",
                alt: "Stone Town streets",
              },
              {
                src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                alt: "Ocean lagoon",
              },
              {
                src: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?auto=format&fit=crop&w=1600&q=80",
                alt: "Crater scenery",
              },
              {
                src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                alt: "Elephants",
              },
              {
                src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                alt: "Forest region",
              },
            ],
          },
        ],
      },
    },

    rwanda: {
      id: "rwanda",
      slug: "rwanda",
      name: "Rwanda",
      region: "Great Lakes (East/Central Africa)",
      tagline:
        "A highland country with premium gorilla trekking, rainforest canopy walks, and efficient logistics.",
      theme: { accent: "#3B82F6", surface: "#071021", textOnAccent: "#FFFFFF" },

      seo: {
        title:
          "Visit Rwanda | Gorilla Trekking, Nyungwe Rainforest & Akagera Safaris",
        description:
          "Explore Rwanda’s gorilla trekking in Volcanoes National Park, Nyungwe rainforest canopy walk, Akagera Big Five safaris, and Lake Kivu—plus seasons and travel tips.",
      },

      essentials: {
        capitals: [{ name: "Kigali", type: "capital" }],
        languages: ["Kinyarwanda", "English", "French", "Swahili"],
        currency: { code: "RWF", name: "Rwandan Franc" },
        timeZone: "CAT (UTC+2)",
        plugs: ["C", "J (varies)"],
        drivingSide: "right",
        keyAirports: [{ code: "KGL", name: "Kigali International" }],
      },

      quickKpis: [
        { label: "National Parks", value: "4" },
        { label: "Signature experience", value: "Gorilla trekking" },
        { label: "Rainforest highlight", value: "Nyungwe canopy walk" },
        { label: "Savanna park", value: "Akagera" },
        { label: "UNESCO sites", value: "1" }, // Genocide memorial sites serial listing
      ],

      signature: {
        whatItsKnownFor: [
          "Strictly managed mountain gorilla trekking (permit-based)",
          "Nyungwe rainforest primates and canopy walkway",
          "Akagera conservation-led Big Five safaris",
          "Short transfer times and strong guiding infrastructure",
        ],
        idealTripLength: [
          "4–6 days (gorillas + Kigali)",
          "7–10 days (add Nyungwe or Akagera)",
          "10–12 days (all three parks + Lake Kivu)",
        ],
        travelStyles: [
          "Luxury",
          "Wildlife",
          "Culture",
          "Active travel",
          "Short high-impact trips",
        ],
      },

      whenToGo: {
        summary:
          "Rwanda’s high elevation keeps temperatures moderate. Drier months generally make trekking trails easier, but conditions can change quickly in the mountains.",
        seasons: [
          {
            name: "Drier",
            months: "Jun–Sep & Dec–Feb",
            pros: ["Better trail conditions"],
            watchFor: ["High demand for permits"],
          },
          {
            name: "Wetter",
            months: "Mar–May & Oct–Nov",
            pros: ["Lush scenery", "Often quieter"],
            watchFor: ["Mud and rain"],
          },
        ],
      },

      practical: {
        entry: [
          {
            title: "Visa",
            detail:
              "Visa options depend on nationality; confirm current rules before travel.",
          },
          {
            title: "Gorilla permits",
            detail:
              "Limited and can sell out. Prices and rules can change—book well in advance.",
          },
          {
            title: "Health protocols",
            detail:
              "Primate tourism often includes strict distancing/health measures—follow ranger guidance.",
          },
          {
            title: "Getting around",
            detail:
              "Transfers are efficient; private vehicles are common for multi-park routes.",
          },
        ],
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "Rwanda",
            subtitle:
              "Premium primate trekking, rainforest canopy walks, and conservation success stories—wrapped in a compact, easy-to-navigate itinerary.",
            badges: [
              "Gorillas",
              "Nyungwe rainforest",
              "Akagera safari",
              "Kigali culture",
            ],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1920&q=80",
              alt: "Gorilla in forest",
              aspectRatio: "16/10",
            },
            ctas: [
              {
                label: "Gorilla trekking guide",
                href: "/plan/rwanda/gorillas",
              },
              { label: "Add Akagera safari", href: "/plan/rwanda/akagera" },
            ],
          },

          {
            type: "editorial.grid",
            id: "story-grid",
            title: "What makes Rwanda different",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "High-value conservation tourism",
                body: "Rwanda is known for structured, permit-based wildlife experiences, high guiding standards, and a tourism model that prioritizes conservation outcomes and controlled visitor impact—especially around primates.",
                media: {
                  src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                  alt: "Nature landscape",
                },
              },
              {
                title: "A capital that’s worth time",
                body: "Kigali is more than a gateway: food culture, galleries, markets, and carefully curated historical sites. Many trips benefit from one unhurried day here before trekking.",
                media: {
                  src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1600&q=80",
                  alt: "City on green hills",
                },
              },
              {
                title: "Add a lake reset day",
                body: "Lake Kivu provides a softer counterpoint to early starts and steep trekking. It’s ideal for a recovery night or two—especially if you’re combining Volcanoes with Nyungwe.",
                media: {
                  src: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?auto=format&fit=crop&w=1600&q=80",
                  alt: "Lake view",
                },
              },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Volcanoes National Park",
                text: "Mountain gorilla trekking and golden monkey tracking in the Virunga volcanoes. Plan for weather shifts and steep trails.",
                media: {
                  src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1600&q=80",
                  alt: "Gorilla image",
                },
              },
              {
                title: "Nyungwe National Park",
                text: "Montane rainforest with chimp trekking options and a canopy walkway. Great for hikers and primate enthusiasts.",
                media: {
                  src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                  alt: "Rainforest canopy",
                },
              },
              {
                title: "Akagera National Park",
                text: "Savanna game drives and boat safaris on Lake Ihema. A flagship restoration success with strong conservation management.",
                media: {
                  src: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1600&q=80",
                  alt: "Savanna wildlife",
                },
              },
              {
                title: "Lake Kivu",
                text: "Kayaking, gentle hikes, and the Congo Nile Trail. A scenic break between parks, with comfortable lakeside lodges.",
                media: {
                  src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                  alt: "Lake shoreline",
                },
              },
              {
                title: "Kigali",
                text: "Markets, contemporary art, cafés, and guided cultural tours. Build in time for meaningful historical context where appropriate.",
                media: {
                  src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1600&q=80",
                  alt: "Kigali city view",
                },
              },
              {
                title: "Tea & coffee landscapes (regional add-ons)",
                text: "Rwanda’s specialty coffee and highland tea are excellent add-on experiences—washing stations, tastings, and scenic rural routes.",
                media: {
                  src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coffee or tea farm",
                },
              },
            ],
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "4 days: Kigali + gorillas",
                days: 4,
                pace: "Short premium",
                route: ["Kigali", "Volcanoes NP (2 nights)", "Kigali"],
                notes:
                  "High-impact trip with minimal transit—best when permits are secured early.",
              },
              {
                title: "7 days: gorillas + Lake Kivu + Kigali",
                days: 7,
                pace: "Balanced",
                route: ["Kigali", "Volcanoes NP", "Lake Kivu", "Kigali"],
                notes:
                  "Adds recovery time and a different landscape to complement trekking intensity.",
              },
              {
                title: "10 days: Volcanoes + Nyungwe + Akagera",
                days: 10,
                pace: "Full circuit",
                route: [
                  "Kigali",
                  "Volcanoes NP",
                  "Lake Kivu",
                  "Nyungwe",
                  "Akagera",
                  "Kigali",
                ],
                notes:
                  "A complete Rwanda itinerary: primates, rainforest, savanna, and lake scenery.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: Rwanda highlights",
            items: [
              {
                title: "Mountain Gorilla Encounters",
                url: "https://www.youtube.com/embed/4dCq-dshE5s",
                thumb:
                  "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Nyungwe Forest & Canopy Walk",
                url: "https://www.youtube.com/embed/P-Y3wGBxIig",
                thumb:
                  "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Akagera — Savanna Safari",
                url: "https://www.youtube.com/embed/2_Hn2L5VqAE",
                thumb:
                  "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?auto=format&fit=crop&w=1600&q=80",
                alt: "Gorilla",
              },
              {
                src: "https://images.unsplash.com/photo-1516408388733-2f8364f2e00b?auto=format&fit=crop&w=1600&q=80",
                alt: "Rainforest",
              },
              {
                src: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1600&q=80",
                alt: "Akagera wildlife",
              },
              {
                src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                alt: "Lake Kivu vibe",
              },
              {
                src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1600&q=80",
                alt: "Kigali city",
              },
              {
                src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80",
                alt: "Coffee/tea landscapes",
              },
              {
                src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                alt: "Highland scenery",
              },
              {
                src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                alt: "Sunset landscape",
              },
            ],
          },
        ],
      },
    },

    "south-africa": {
      id: "south-africa",
      slug: "south-africa",
      name: "South Africa",
      region: "Southern Africa",
      tagline:
        "Safaris, cities, wine routes, and coastlines—one of the world’s best-value multi-experience trips.",
      theme: { accent: "#A855F7", surface: "#0B0F1A", textOnAccent: "#FFFFFF" },

      seo: {
        title:
          "Visit South Africa | Kruger Safaris, Cape Town, Winelands & Road Trips",
        description:
          "Explore South Africa’s Big Five safaris, Cape Town and Table Mountain, the Winelands, Garden Route road trips, and practical travel tips for planning.",
      },

      essentials: {
        capitals: [
          { name: "Pretoria", type: "executive" },
          { name: "Cape Town", type: "legislative" },
          { name: "Bloemfontein", type: "judicial" },
        ],
        languages: [
          "11 official languages (incl. English, Zulu, Xhosa, Afrikaans)",
        ],
        currency: { code: "ZAR", name: "South African Rand" },
        timeZone: "SAST (UTC+2)",
        plugs: ["M", "N (varies)"],
        drivingSide: "left",
        keyAirports: [
          { code: "JNB", name: "O.R. Tambo International (Johannesburg)" },
          { code: "CPT", name: "Cape Town International" },
          { code: "DUR", name: "King Shaka International (Durban)" },
        ],
      },

      quickKpis: [
        { label: "UNESCO sites", value: "10" },
        { label: "Safari flagship", value: "Kruger + private reserves" },
        { label: "Top city", value: "Cape Town" },
        { label: "Wine estates", value: "500+" },
        { label: "Coastline", value: "2,700+ km" },
      ],

      signature: {
        whatItsKnownFor: [
          "Big Five safaris with excellent infrastructure",
          "Cape Town’s mountain-and-ocean setting",
          "Winelands food and tasting routes",
          "Garden Route road trip culture",
          "Powerful modern history and museums",
        ],
        idealTripLength: [
          "7–10 days (Cape Town + safari)",
          "12–16 days (add Garden Route or Winelands depth)",
        ],
        travelStyles: [
          "Self-drive",
          "Luxury",
          "City breaks",
          "Family",
          "Adventure",
          "Food & wine",
        ],
      },

      whenToGo: {
        summary:
          "South Africa is year-round, with opposite seasons to Europe/North America. Cape Town is best in summer; Kruger viewing is excellent in the dry winter months.",
        seasons: [
          {
            name: "Cape Town summer",
            months: "Nov–Mar",
            pros: ["Warm, dry, beach-friendly"],
            watchFor: ["Peak demand around holidays"],
          },
          {
            name: "Kruger winter (dry)",
            months: "May–Sep",
            pros: ["Excellent wildlife viewing"],
            watchFor: ["Cold nights on safari"],
          },
          {
            name: "Shoulder months",
            months: "Apr & Oct",
            pros: ["Good value", "Pleasant temps"],
            watchFor: ["Variable weather"],
          },
        ],
      },

      practical: {
        entry: [
          {
            title: "Visa",
            detail:
              "Many nationalities are visa-exempt; others need visas in advance. Confirm current rules.",
          },
          {
            title: "Safety",
            detail:
              "Varies by city/area—use standard precautions and local advice; reputable operators improve logistics.",
          },
          {
            title: "Power",
            detail:
              "Power interruptions can occur. Most hotels/lodges have backup systems—ask before booking if it matters.",
          },
          {
            title: "Self-drive",
            detail:
              "Excellent option with good highways. Long distances—consider domestic flights for multi-region trips.",
          },
        ],
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "South Africa",
            subtitle:
              "A ‘world in one country’: Big Five safaris, global-level food and wine, iconic coastlines, and city breaks built for road trips.",
            badges: ["Kruger safari", "Cape Town", "Winelands", "Garden Route"],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1920&q=80",
              alt: "Cape Town with mountain and city",
              aspectRatio: "16/10",
            },
            ctas: [
              {
                label: "Plan a Cape Town + safari trip",
                href: "/plan/south-africa",
              },
              {
                label: "Self-drive routes",
                href: "/plan/south-africa/road-trips",
              },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Kruger & private reserves",
                text: "Choose Kruger for breadth and self-drive flexibility, or private reserves for off-road tracking, night drives, and fewer vehicles at sightings (rules vary by reserve).",
                media: {
                  src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80",
                  alt: "Safari wildlife",
                },
              },
              {
                title: "Cape Town & Cape Peninsula",
                text: "Table Mountain, coastal drives, beaches, and day trips—pair with the Winelands for food and tastings.",
                media: {
                  src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1600&q=80",
                  alt: "Cape Town city view",
                },
              },
              {
                title: "Cape Winelands",
                text: "Historic towns, tasting routes, and standout dining. Great for a 2–4 night add-on with a driver or guided tastings.",
                media: {
                  src: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=80",
                  alt: "Vineyard landscape",
                },
              },
              {
                title: "Garden Route",
                text: "A classic coastal road trip with forests, lagoons, and adventure stops. Very flexible for families and outdoor travelers.",
                media: {
                  src: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coastal scenery",
                },
              },
              {
                title: "Johannesburg & Soweto",
                text: "Museums, contemporary art, and essential modern history. Best experienced via informed local guides and curated visits.",
                media: {
                  src: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c4?auto=format&fit=crop&w=1600&q=80",
                  alt: "Urban streetscape",
                },
              },
              {
                title: "Drakensberg mountains",
                text: "Hiking, dramatic escarpments, and scenic lodge stays—ideal if you want a mountain chapter beyond the coast.",
                media: {
                  src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                  alt: "Mountain range",
                },
              },
            ],
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "8 days: Cape Town + Winelands",
                days: 8,
                pace: "City + food",
                route: ["Cape Town (5 nights)", "Winelands (2–3 nights)"],
                notes:
                  "Ideal for first-timers who want scenery, beaches, restaurants, and relaxed day trips.",
              },
              {
                title: "10 days: Cape Town + safari",
                days: 10,
                pace: "Iconic",
                route: ["Cape Town", "Fly to Kruger region (3 nights)"],
                notes:
                  "A balanced ‘two-center’ itinerary with minimal long driving.",
              },
              {
                title: "14 days: road trip + safari",
                days: 14,
                pace: "Varied",
                route: ["Cape Town", "Garden Route", "Fly to Kruger region"],
                notes:
                  "Best if you enjoy driving days and want a wide variety of landscapes and activities.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: South Africa highlights",
            items: [
              {
                title: "Cape Town — City & Coast",
                url: "https://www.youtube.com/embed/wLeimq5ig-Q",
                thumb:
                  "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Kruger — Big Five Safari",
                url: "https://www.youtube.com/embed/0eCEveAHxiU",
                thumb:
                  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Garden Route — Road Trip",
                url: "https://www.youtube.com/embed/4i7g2n1YvJc",
                thumb:
                  "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?auto=format&fit=crop&w=1600&q=80",
                alt: "Cape Town",
              },
              {
                src: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=80",
                alt: "Winelands",
              },
              {
                src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80",
                alt: "Safari scene",
              },
              {
                src: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1600&q=80",
                alt: "Coastline drive",
              },
              {
                src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                alt: "Mountains",
              },
              {
                src: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c4?auto=format&fit=crop&w=1600&q=80",
                alt: "City culture",
              },
              {
                src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                alt: "Landscape sunset",
              },
              {
                src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                alt: "Ocean view",
              },
            ],
          },
        ],
      },
    },

    djibouti: {
      id: "djibouti",
      slug: "djibouti",
      name: "Djibouti",
      region: "Horn of Africa",
      tagline:
        "Volcanic deserts, salt lakes below sea level, and seasonal whale shark encounters.",
      theme: { accent: "#06B6D4", surface: "#06151A", textOnAccent: "#001014" },

      seo: {
        title: "Visit Djibouti | Lake Assal, Lac Abbé & Whale Shark Season",
        description:
          "Plan a Djibouti adventure: Lake Assal salt flats, Lac Abbé limestone chimneys, Gulf of Tadjoura whale sharks (seasonal), and essential travel planning tips.",
      },

      essentials: {
        capitals: [{ name: "Djibouti City", type: "capital" }],
        languages: ["French", "Arabic", "Somali", "Afar"],
        currency: { code: "DJF", name: "Djiboutian Franc" },
        timeZone: "EAT (UTC+3)",
        plugs: ["C", "E"],
        drivingSide: "right",
        keyAirports: [{ code: "JIB", name: "Djibouti–Ambouli International" }],
      },

      quickKpis: [
        { label: "Trip vibe", value: "Geology + marine life" },
        { label: "Signature site", value: "Lake Assal" },
        { label: "Iconic landscape", value: "Lac Abbé chimneys" },
        { label: "Whale sharks", value: "Seasonal (often Oct–Feb)" },
        { label: "UNESCO sites", value: "0" },
      ],

      signature: {
        whatItsKnownFor: [
          "Afar Rift geology—lava fields, salt flats, and geothermal features",
          "Lake Assal’s extreme salinity and stark white salt crusts",
          "Lac Abbé’s limestone chimneys and desert photography",
          "Gulf of Tadjoura whale shark snorkeling (seasonal; conditions vary)",
        ],
        idealTripLength: [
          "3–5 days (core highlights)",
          "6–8 days (add diving + Day Forest)",
        ],
        travelStyles: [
          "Adventure",
          "Photography",
          "Off-the-beaten-path",
          "Marine life",
        ],
      },

      whenToGo: {
        summary:
          "Djibouti can be extremely hot. Many travelers prefer the cooler months for desert travel; whale shark season is typically in cooler months but varies by year and conditions.",
        seasons: [
          {
            name: "Cooler months",
            months: "Nov–Mar",
            pros: ["Better for inland travel"],
            watchFor: ["Still sunny and dry—bring sun protection"],
          },
          {
            name: "Hot months",
            months: "May–Sep",
            pros: ["Fewer visitors"],
            watchFor: ["Extreme inland heat; plan carefully"],
          },
          {
            name: "Whale shark window (often)",
            months: "Oct–Feb",
            pros: ["Best chance for encounters"],
            watchFor: ["Sightings are never guaranteed"],
          },
        ],
      },

      practical: {
        entry: [
          {
            title: "Visa",
            detail:
              "Visa options vary by nationality; confirm e-visa/arrival eligibility and requirements before travel.",
          },
          {
            title: "Heat & hydration",
            detail:
              "Desert excursions require ample water, sun protection, and conservative scheduling.",
          },
          {
            title: "Transport",
            detail:
              "Inland highlights typically require a 4x4 and an experienced driver/guide due to remoteness.",
          },
          {
            title: "Marine wildlife etiquette",
            detail:
              "Choose operators that prohibit touching, chasing, or crowding whale sharks.",
          },
        ],
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "Djibouti",
            subtitle:
              "A small country with outsized landscapes—rift valleys, salt lakes, lava fields, and a coastline that hosts whale sharks in season.",
            badges: [
              "Lake Assal",
              "Lac Abbé",
              "Whale sharks (seasonal)",
              "Afar Rift",
            ],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80",
              alt: "Desert landscape at sunrise",
              aspectRatio: "16/10",
            },
            ctas: [
              { label: "Plan 4x4 desert route", href: "/plan/djibouti" },
              { label: "Whale shark season", href: "#when-to-go" },
            ],
          },

          {
            type: "editorial.stack",
            id: "editorial",
            title: "What to expect (and why it’s special)",
            items: [
              {
                heading: "Geology-first travel",
                body: "Djibouti isn’t a classic big-game safari destination. Its strength is the Afar Rift: salt flats, volcanic terrain, and stark, cinematic scenery that feels unlike most of Africa’s mainstream routes.",
                media: {
                  src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
                  alt: "Rift-like dramatic terrain",
                },
              },
              {
                heading: "Seasonal marine encounters",
                body: "The Gulf of Tadjoura is known for whale shark trips in season. Choose operators that keep distance and avoid crowding. Visibility and sightings vary with conditions.",
                media: {
                  src: "https://images.unsplash.com/photo-1544551763-cede9a7f1f0c?auto=format&fit=crop&w=1600&q=80",
                  alt: "Underwater ocean scene",
                },
              },
              {
                heading: "Logistics matter",
                body: "Distances can be short on a map but slow in practice due to terrain and heat. Guided 4x4 excursions are common for Lake Assal and Lac Abbé.",
                media: {
                  src: "https://images.unsplash.com/photo-1558980394-0c3b1d1bd3a1?auto=format&fit=crop&w=1600&q=80",
                  alt: "Off-road travel scene",
                },
              },
            ],
          },

          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Lake Assal",
                text: "A salt lake in a volcanic depression with bright white crusts and dramatic rift views. Best visited with enough water and heat planning.",
                media: {
                  src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80",
                  alt: "Salt flat landscape",
                },
              },
              {
                title: "Lac Abbé (desert chimneys)",
                text: "Known for limestone chimneys and geothermal steam vents—especially striking at sunrise and sunset. Often best as an overnight trip.",
                media: {
                  src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                  alt: "Desert silhouettes at golden hour",
                },
              },
              {
                title: "Gulf of Tadjoura",
                text: "Seasonal whale shark snorkeling and coastal boat trips. Confirm timing locally and prioritize responsible operators.",
                media: {
                  src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                  alt: "Turquoise sea lagoon",
                },
              },
              {
                title: "Moucha Islands (easy beach day)",
                text: "A relaxed coastal add-on for swimming and snorkeling conditions permitting—ideal as a low-effort break in the itinerary.",
                media: {
                  src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
                  alt: "Tropical island shoreline",
                },
              },
              {
                title: "Djibouti City",
                text: "Waterfront and markets reflecting French, Arab, Afar, and Somali influences. Useful as a base for organizing guided excursions.",
                media: {
                  src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coastal city street scene",
                },
              },
              {
                title: "Day Forest / Goda Mountains (seasonal)",
                text: "Higher-elevation relief from the heat and different vegetation zones. Best visited with current local conditions and a guide.",
                media: {
                  src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
                  alt: "Forest trail",
                },
              },
            ],
          },

          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "3 days: Lake Assal + city",
                days: 3,
                pace: "Short adventure",
                route: ["Djibouti City", "Lake Assal day trip", "City + coast"],
                notes:
                  "A strong intro for business travelers or stopovers who want one big landscape highlight.",
              },
              {
                title: "5 days: Assal + Lac Abbé + Tadjoura",
                days: 5,
                pace: "Core circuit",
                route: [
                  "Djibouti City",
                  "Lake Assal",
                  "Lac Abbé (overnight)",
                  "Tadjoura coast",
                ],
                notes:
                  "A classic loop that combines geology and sea time with realistic pacing.",
              },
              {
                title: "7 days: whale sharks + desert + islands",
                days: 7,
                pace: "In-depth",
                route: [
                  "Tadjoura (marine days)",
                  "Lake Assal",
                  "Lac Abbé",
                  "Moucha Islands",
                ],
                notes:
                  "Best in cooler months; keep marine days flexible for conditions.",
              },
            ],
          },

          {
            type: "media.videoRail",
            id: "videos",
            title: "Watch: Djibouti highlights",
            items: [
              {
                title: "Djibouti — Rift Landscapes (Lake Assal style)",
                url: "https://www.youtube.com/embed/2mQ0uQm1xkE",
                thumb:
                  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Whale Sharks — Gulf of Tadjoura (Seasonal)",
                url: "https://www.youtube.com/embed/0m6aKk1Qk3I",
                thumb:
                  "https://images.unsplash.com/photo-1544551763-cede9a7f1f0c?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Desert Chimneys — Lac Abbé Mood",
                url: "https://www.youtube.com/embed/4o5qk9sRZ1A",
                thumb:
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
              },
            ],
          },

          {
            type: "gallery.masonry",
            id: "gallery",
            title: "Photo highlights",
            columns: { xs: 2, md: 3, xl: 4 },
            items: [
              {
                src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=80",
                alt: "Salt flats",
              },
              {
                src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
                alt: "Rift landscape",
              },
              {
                src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                alt: "Desert sunset",
              },
              {
                src: "https://images.unsplash.com/photo-1544551763-cede9a7f1f0c?auto=format&fit=crop&w=1600&q=80",
                alt: "Marine scene",
              },
              {
                src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                alt: "Turquoise waters",
              },
              {
                src: "https://images.unsplash.com/photo-1558980394-0c3b1d1bd3a1?auto=format&fit=crop&w=1600&q=80",
                alt: "4x4 travel",
              },
              {
                src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
                alt: "City scene",
              },
              {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
                alt: "Forest break",
              },
            ],
          },
        ],
      },
    },

    ethiopia: {
      id: "ethiopia",
      slug: "ethiopia",
      name: "Ethiopia",
      region: "East/Horn of Africa",
      tagline:
        "The land of origins—ancient history, dramatic highlands, and unique wildlife.",
      theme: { accent: "#0EA5E9", surface: "#0F172A", textOnAccent: "#FFFFFF" },

      seo: {
        title: "Visit Ethiopia | Lalibela, Simien Mountains & Omo Valley",
        description:
          "Discover Ethiopia’s rock-hewn churches, high-altitude trekking in the Simien Mountains, and the diverse cultures of the Omo Valley.",
      },

      essentials: {
        capitals: [{ name: "Addis Ababa", type: "capital" }],
        languages: ["Amharic", "Oromo", "Somali", "Tigrinya"],
        currency: { code: "ETB", name: "Ethiopian Birr" },
        timeZone: "EAT (UTC+3)",
        plugs: ["C", "F", "G"],
        drivingSide: "right",
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "Ethiopia",
            subtitle:
              "The land of origins—ancient history, dramatic highlands, and unique wildlife found nowhere else on Earth.",
            badges: ["Lalibela", "Simien Mountains", "Omo Valley", "Danakil"],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&w=1920&q=80",
              alt: "Ancient rock church in Lalibela",
              aspectRatio: "16/10",
            },
            ctas: [
              { label: "Build Ethiopia route", href: "/plan/ethiopia" },
              { label: "Best time to visit", href: "#when-to-go" },
            ],
          },
          {
            type: "kpi.strip",
            id: "kpis",
            items: [
              { label: "UNESCO sites", value: "9" },
              { label: "Highest peak", value: "Ras Dashen (4,550m)" },
              { label: "Wildlife", value: "Gelada • Wolf • Ibex" },
              { label: "Unique trait", value: "Own calendar & time" },
            ],
          },
          {
            type: "editorial.grid",
            id: "culture-grid",
            title: "A journey through time and culture",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "Ancient civilizations",
                body: "From the obelisks of Axum to the castles of Gondar, Ethiopia's history spans thousands of years of independent development and unique Christian heritage.",
                media: {
                  src: "https://images.unsplash.com/photo-1569144654912-5f146d155a23?auto=format&fit=crop&w=1600&q=80",
                  alt: "Historic stone ruins",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Living traditions",
                body: "The coffee ceremony, colorful festivals like Timkat, and the diverse cultures of the Omo Valley offer a deep dive into unchanged traditions.",
                media: {
                  src: "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coffee ceremony",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Dramatic landscapes",
                body: "Hike the Simien escarpments or descend into the Danakil Depression—one of the hottest and lowest places on the planet.",
                media: {
                  src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                  alt: "Mountain landscape",
                  aspectRatio: "4/3",
                },
              },
            ],
          },
          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Lalibela",
                text: "UNESCO-listed rock-hewn churches, a feat of medieval engineering and faith.",
                media: {
                  src: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&w=1600&q=80",
                  alt: "Rock church",
                },
              },
              {
                title: "Simien Mountains",
                text: "High-altitude trekking with Gelada baboons and massive escarpment views.",
                media: {
                  src: "https://images.unsplash.com/photo-1569144654912-5f146d155a23?auto=format&fit=crop&w=1600&q=80",
                  alt: "Simien mountains",
                },
              },
              {
                title: "Danakil Depression",
                text: "Sulfuric springs and lava lakes in one of Earth's most extreme environments.",
                media: {
                  src: "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?auto=format&fit=crop&w=1600&q=80",
                  alt: "Danakil desert",
                },
              },
              {
                title: "Omo Valley",
                text: "Diverse set of tribes maintaining ancient customs and body art.",
                media: {
                  src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                  alt: "Omo valley people",
                },
              },
              {
                title: "Gondar",
                text: "The 'Camelot of Africa' with its 17th-century royal enclosure.",
                media: {
                  src: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1600&q=80",
                  alt: "Gondar castle",
                },
              },
              {
                title: "Bale Mountains",
                text: "Home to the rare Ethiopian wolf and endemic mountain nyala.",
                media: {
                  src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
                  alt: "Ethiopian wolf",
                },
              },
            ],
          },
          {
            type: "carousel.experiences",
            id: "experiences",
            title: "Signature experiences",
            items: [
              {
                title: "Explore Lalibela's Churches",
                text: "Descend into the hand-carved medieval churches during early morning service.",
                media: {
                  src: "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&w=1600&q=80",
                  alt: "Lalibela churches",
                },
              },
              {
                title: "Ethiopian Coffee Ceremony",
                text: "Experience the aromatic ritual that defines Ethiopian hospitality.",
                media: {
                  src: "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coffee ceremony",
                },
              },
              {
                title: "Danakil Adventure",
                text: "Camp near the Erta Ale lava lake and watch the ground glow red.",
                media: {
                  src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
                  alt: "Volcano lava",
                },
              },
              {
                title: "Simien Mountains Hike",
                text: "Walk among troops of Gelada baboons on the edge of the world.",
                media: {
                  src: "https://images.unsplash.com/photo-1569144654912-5f146d155a23?auto=format&fit=crop&w=1600&q=80",
                  alt: "Gelada baboons",
                },
              },
            ],
          },
          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "8 days: The Historic Route",
                days: 8,
                pace: "Classic",
                route: ["Addis Ababa", "Lalibela", "Gondar", "Axum"],
                notes: "Best for history buffs and first-time visitors.",
              },
              {
                title: "10 days: Nature & Wildlife",
                days: 10,
                pace: "Balanced",
                route: [
                  "Addis Ababa",
                  "Simien Mountains",
                  "Bale Mountains",
                  "Lake Tana",
                ],
                notes: "Ideal for trekking and spotting rare endemic species.",
              },
              {
                title: "14 days: The Grand Tour",
                days: 14,
                pace: "In-depth",
                route: [
                  "Addis Ababa",
                  "Historic North",
                  "Danakil",
                  "Omo Valley",
                ],
                notes:
                  "The ultimate Ethiopian adventure covering all major highlights.",
              },
            ],
          },
        ],
      },
    },

    somalia: {
      id: "somalia",
      slug: "somalia",
      name: "Somalia",
      region: "Horn of Africa",
      tagline:
        "Pristine coastlines, ancient history, and a resilient, vibrant culture.",
      theme: { accent: "#38BDF8", surface: "#0F172A", textOnAccent: "#FFFFFF" },

      seo: {
        title: "Visit Somalia | Mogadishu & Coastal Wonders",
        description:
          "Explore Somalia’s hidden gems, from the white sands of Liido Beach to historic coastal towns.",
      },

      essentials: {
        capitals: [{ name: "Mogadishu", type: "capital" }],
        languages: ["Somali", "Arabic"],
        currency: { code: "SOS", name: "Somali Shilling" },
        timeZone: "EAT (UTC+3)",
        plugs: ["C", "G"],
        drivingSide: "right",
      },

      page: {
        blocks: [
          {
            type: "hero.split",
            id: "hero",
            title: "Somalia",
            subtitle:
              "Pristine coastlines, ancient history, and a resilient, vibrant culture. Discover a land of ancient shores and untouched beauty.",
            badges: ["Mogadishu", "Liido Beach", "Berbera", "Laas Geel"],
            media: {
              kind: "image",
              src: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1920&q=80",
              alt: "Aerial view of Mogadishu coast",
              aspectRatio: "16/10",
            },
            ctas: [
              { label: "Plan coastal route", href: "/plan/somalia" },
              { label: "Best time to visit", href: "#when-to-go" },
            ],
          },
          {
            type: "kpi.strip",
            id: "kpis",
            items: [
              { label: "Coastline", value: "3,300+ km" },
              { label: "Oldest Art", value: "Laas Geel (5,000+ years)" },
              { label: "Marine Life", value: "Turtles • Dolphins • Reefs" },
              { label: "Culture", value: "Nation of Poets" },
            ],
          },
          {
            type: "editorial.grid",
            id: "discovery-grid",
            title: "Africa's longest coast and deep history",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "Prehistoric art",
                body: "Laas Geel contains some of the best-preserved rock art in Africa, depicting life from over 5,000 years ago.",
                media: {
                  src: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1600&q=80",
                  alt: "Cave art",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Untouched beaches",
                body: "From Liido Beach to the shores of Berbera, Somalia offers miles of white sand and turquoise waters.",
                media: {
                  src: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=1600&q=80",
                  alt: "Beach view",
                  aspectRatio: "4/3",
                },
              },
              {
                title: "Maritime heritage",
                body: "Ancient port cities like Zeila have linked Africa to the world for millennia through trade and seafaring.",
                media: {
                  src: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80",
                  alt: "Old harbor",
                  aspectRatio: "4/3",
                },
              },
            ],
          },
          {
            type: "cards.media",
            id: "top-places",
            title: "Top places to visit",
            columns: { xs: 1, sm: 2, lg: 3 },
            cards: [
              {
                title: "Laas Geel",
                text: "Vibrant ancient rock paintings in a cave complex near Hargeisa.",
                media: {
                  src: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1600&q=80",
                  alt: "Rock art",
                },
              },
              {
                title: "Liido Beach",
                text: "Mogadishu's most popular social spot, perfect for swimming and seafood.",
                media: {
                  src: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=1600&q=80",
                  alt: "Liido beach",
                },
              },
              {
                title: "Berbera",
                text: "Historical port town with Ottoman architecture and clear lagoons.",
                media: {
                  src: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80",
                  alt: "Berbera coast",
                },
              },
              {
                title: "Zeila",
                text: "Ruins of an ancient Islamic city that was once a major regional hub.",
                media: {
                  src: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=1600&q=80",
                  alt: "Ancient ruins",
                },
              },
              {
                title: "Daallo Forest",
                text: "High-altitude forest with waterfalls and unique botanical species.",
                media: {
                  src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
                  alt: "Green forest",
                },
              },
              {
                title: "Sheikh Mountains",
                text: "Scenic mountain town with cooler temperatures and colonial history.",
                media: {
                  src: "https://images.unsplash.com/photo-1458442310124-dde6edb43d10?auto=format&fit=crop&w=1600&q=80",
                  alt: "Mountain town",
                },
              },
            ],
          },
          {
            type: "carousel.experiences",
            id: "experiences",
            title: "Signature experiences",
            items: [
              {
                title: "Discover Laas Geel Art",
                text: "A guided tour of pre-historic paintings in a stunning natural setting.",
                media: {
                  src: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?auto=format&fit=crop&w=1600&q=80",
                  alt: "Cave painting",
                },
              },
              {
                title: "Coastal Excursions in Berbera",
                text: "Boat trips to reefs and shipwrecks in the Gulf of Aden.",
                media: {
                  src: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=1600&q=80",
                  alt: "Coastal boat",
                },
              },
              {
                title: "Somali Cuisine Tasting",
                text: "Enjoy traditional dishes like bariis (rice) and camel milk tea.",
                media: {
                  src: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=1600&q=80",
                  alt: "Somali food",
                },
              },
              {
                title: "Hargeisa Market Walk",
                text: "Bustling markets filled with color, gold, and local livestock trade.",
                media: {
                  src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
                  alt: "Market scene",
                },
              },
            ],
          },
          {
            type: "itineraries.cards",
            id: "itineraries",
            title: "Sample itineraries",
            columns: { xs: 1, md: 3 },
            items: [
              {
                title: "4 days: Somaliland Highlights",
                days: 4,
                pace: "Efficient",
                route: ["Hargeisa", "Laas Geel", "Berbera"],
                notes: "Most common and accessible route for first-timers.",
              },
              {
                title: "6 days: North & Coastal",
                days: 6,
                pace: "Balanced",
                route: ["Hargeisa", "Sheikh Mountains", "Berbera", "Zeila"],
                notes: "Includes scenic mountains and deep ancient history.",
              },
              {
                title: "10 days: Expedition Somalia",
                days: 10,
                pace: "Ambitious",
                route: ["Mogadishu", "Hargeisa", "Berbera", "Daallo Forest"],
                notes: "Requires careful logistics and security planning.",
              },
            ],
          },
        ],
      },
    },
  },
};

/**
 * OPTIONAL helper (remove if you want strict JSON).
 * I left this to show that you can keep “source-of-truth” seasons in one place and reuse them in blocks.
 */
function kenyaSeasonItems() {
  return [
    {
      label: "Jun–Oct",
      title: "Drier season / peak safari",
      detail:
        "Excellent wildlife visibility; migration often peaks in the Mara mid-year (timing varies).",
    },
    {
      label: "Jan–Feb",
      title: "Short dry season",
      detail: "Strong safari conditions; warm coastal weather.",
    },
    {
      label: "Mar–May",
      title: "Long rains",
      detail:
        "Greener landscapes; fewer crowds; some roads can be challenging.",
    },
    {
      label: "Nov–Dec",
      title: "Short rains",
      detail: "Shoulder season with fresh scenery; showers are often brief.",
    },
  ];
}

const getFB = (c) => {
  const descParas = c?.fullDescription
    ? c.fullDescription.split("\n\n").filter(Boolean)
    : [c?.description];
  return {
    intro: c?.description || `${c?.name || "This country"} is remarkable.`,
    discover: [...descParas, c?.additionalInfo].filter(Boolean),
    stats: [
      { l: "Capital", v: c?.capital || "N/A" },
      { l: "Area", v: c?.area || "N/A" },
      { l: "Language", v: c?.officialLanguages?.[0] || "N/A" },
    ],
    facts: [
      { t: "Currency", v: c?.currency || "N/A", s: c?.currencySymbol || "" },
      { t: "Timezone", v: c?.timezone || "N/A", s: "" },
      { t: "Best Time", v: c?.bestTime || "N/A", s: "To Visit" },
    ],
    activities: (c?.experiences || []).slice(0, 8).map((e) => ({
      n: clean(e),
      d: `Experience ${clean(e).toLowerCase()}.`,
    })),
    videos: c?.videos || [],
    gallery:
      c?.gallery ||
      (c?.images
        ? c.images.map((url, i) => ({
            url,
            cap: `${c?.name} Highlight ${i + 1}`,
            ctx: `Discover the breathtaking beauty of ${c?.name}.`,
          }))
        : c?.heroImage
          ? [{ url: c.heroImage, cap: c?.name, ctx: "" }]
          : []),
  };
};

/* ═══════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                         */
/* ═══════════════════════════════════════════════════════ */
const CountryPage = () => {
  const { countryId } = useParams();
  const { openMap } = useApp();
  const country = useMemo(
    () => countries.find((c) => c.id === countryId),
    [countryId],
  );
  const { destinations: dests = [] } = useCountryDestinations(countryId);
  const {
    insights,
    loading: aiL,
    error: aiE,
    retry,
  } = useCountryInsights(country);
  const td = useMemo(
    () => DATA?.countries?.[countryId] || getFB(country),
    [countryId, country],
  );
  const officialLink = useMemo(() => getOfficialLink(countryId), [countryId]);

  const info = useMemo(
    () =>
      country
        ? [
            { icon: FiMapPin, l: "Capital", v: clean(country.capital) },
            { icon: FiUsers, l: "Population", v: clean(country.population) },
            { icon: FiGlobe, l: "Area", v: clean(country.area) },
            { icon: FiDollarSign, l: "Currency", v: clean(country.currency) },
            { icon: FiClock, l: "Time Zone", v: clean(country.timezone) },
            { icon: FiSun, l: "Climate", v: clean(country.climate) },
            { icon: FiCalendar, l: "Best Time", v: clean(country.bestTime) },
          ]
        : [],
    [country],
  );

  const sec = useMemo(() => {
    if (!insights) return null;
    const fb = (a, d) => (a.length ? a : [d]);
    return {
      def: clean(insights.definition || insights.summary.slice(0, 100)),
      ov: fb(toP(insights.summary, 4), "—"),
      dem: fb(toB(insights.demographics, 8), "—"),
      eco: fb(toB(insights.economy, 8), "—"),
      tour: fb(toS(insights.tourismOutlook, 6), "—"),
      src: (insights.sources || []).map(clean).filter(Boolean).slice(0, 5),
    };
  }, [insights]);

  const aiHL = useMemo(() => {
    if (aiL)
      return `Pondering Live Country profile for ${country?.name || ""}...`;
    if (sec?.ov?.length) return toS(sec.ov[0], 2).join(" ");
    return `Discover ${country?.name || ""} — an extraordinary destination.`;
  }, [aiL, sec, country?.name]);

  const mE = useMemo(() => mEmbed(country), [country]);
  const mO = useMemo(() => mOpen(country), [country]);
  const mini = useCallback(
    () =>
      openMap({
        title: `${country?.name} Map`,
        lat: country?.mapPosition?.lat,
        lng: country?.mapPosition?.lng,
        query: `${country?.capital || ""}, ${country?.name || ""}`,
        zoom: 6,
      }),
    [openMap, country],
  );

  const canonicalUrl = useMemo(
    () => toAbsoluteUrl(`/country/${countryId}`),
    [countryId],
  );
  const ogImage = useMemo(() => {
    return (
      country?.heroImage ||
      country?.images?.[0] ||
      toAbsoluteUrl("/green%20logo.ico")
    );
  }, [country]);
  const seoTitle = useMemo(() => {
    if (!country) return "Country Not Found | Altuvera";
    return `${country.name} Safaris & Tours | Altuvera`;
  }, [country]);
  const seoDescription = useMemo(() => {
    if (!country) return "The requested country page was not found.";
    return toMetaDescription(
      country.description ||
        `Explore ${country.name}: safaris, culture, highlights, and bookable destinations with Altuvera.`,
      160,
    );
  }, [country]);

  if (!country)
    return (
      <>
        <Helmet>
          <title>Country Not Found | Altuvera</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        <div className="cp-notfound">
        <div className="cp-notfound__emoji">🌍</div>
        <h1>Country Not Found</h1>
        <p>The destination you're looking for doesn't exist in our database.</p>
        <Button to="/destinations" variant="primary">
          Explore All Destinations
        </Button>
      </div>
      </>
    );

  const flagHeroImage = useMemo(() => toFlagCdnUrl(countryId, 1280), [countryId]);
  const flagSlideImage = useMemo(() => toFlagCdnUrl(countryId, 640), [countryId]);
  const galleryImages = useMemo(() => {
    const base = Array.isArray(td.gallery) ? td.gallery.filter(Boolean) : [];
    if (!flagSlideImage) return base;
    const deduped = base.filter((u) => u !== flagSlideImage);
    return [flagSlideImage, ...deduped];
  }, [flagSlideImage, td.gallery]);

  /* Mixed content builder for the In-Depth Guide section */
  const mixed = () => {
    const paras = td.discover || [];
    const imgs = galleryImages;
    const acts = td.activities || [];
    const out = [];

    if (td.intro) {
      out.push(
        <R key="lead" a="up">
          <p className="cp-guide__lead">{td.intro}</p>
        </R>,
      );
    }

    paras.forEach((p, i) => {
      const img = imgs[i];
      const ev = i % 2 === 0;
      out.push(
        <R key={`p${i}`} a={ev ? "left" : "right"} d={0.04}>
          <div className={`cp-guide__row${ev ? "" : " cp-guide__row--flip"}`}>
            {img && (
              <div className="cp-guide__figure">
                <img src={img.url} alt={img.cap} loading="lazy" />
                <span className="cp-guide__figcap">
                  <FiCamera size={12} /> {img.cap}
                </span>
              </div>
            )}
            <div className="cp-guide__copy">
              <p>{p}</p>
              {img?.ctx && (
                <aside className="cp-guide__aside">
                  <FiInfo size={14} />
                  <em>{img.ctx}</em>
                </aside>
              )}
            </div>
          </div>
        </R>,
      );

      if (i > 0 && i % 2 === 1) {
        const ai = Math.floor(i / 2);
        const pair = [acts[ai * 2], acts[ai * 2 + 1]].filter(Boolean);
        if (pair.length) {
          out.push(
            <R key={`ac${ai}`} a="up" d={0.06}>
              <div className="cp-guide__activities">
                {pair.map((ac, j) => (
                  <div key={j} className="cp-guide__activity">
                    <div className="cp-guide__activity-marker" />
                    <div>
                      <strong>{ac.n}</strong>
                      <p>{ac.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </R>,
          );
        }
      }
    });

    const remImgs = imgs.slice(paras.length);
    if (remImgs.length > 0) {
      out.push(
        <R key="strip" a="up">
          <div className="cp-guide__strip">
            {remImgs.map((img, i) => (
              <div key={i} className="cp-guide__strip-item">
                <img src={img.url} alt={img.cap} loading="lazy" />
                <span>{img.cap}</span>
              </div>
            ))}
          </div>
        </R>,
      );
    }

    const usedA = Math.floor(paras.length / 2) * 2;
    const remA = acts.slice(usedA);
    if (remA.length > 0) {
      out.push(
        <R key="rema" a="up">
          <div className="cp-guide__activities cp-guide__activities--grid">
            {remA.map((ac, i) => (
              <div key={i} className="cp-guide__activity">
                <div className="cp-guide__activity-marker" />
                <div>
                  <strong>{ac.n}</strong>
                  <p>{ac.d}</p>
                </div>
              </div>
            ))}
          </div>
        </R>,
      );
    }
    return out;
  };

  return (
    <div className="cp-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script type="application/ld+json">
          {JSON.stringify(
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": canonicalUrl,
                  url: canonicalUrl,
                  name: seoTitle,
                  description: seoDescription,
                  isPartOf: {
                    "@type": "WebSite",
                    "@id": toAbsoluteUrl("/"),
                    url: toAbsoluteUrl("/"),
                    name: "Altuvera",
                  },
                  about: {
                    "@type": "Country",
                    name: country?.name,
                  },
                },
                {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "Home",
                      item: toAbsoluteUrl("/"),
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Destinations",
                      item: toAbsoluteUrl("/destinations"),
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: country?.name,
                      item: canonicalUrl,
                    },
                  ],
                },
              ],
            },
            null,
            0,
          )}
        </script>
      </Helmet>
      <style>{CSS}</style>
      <ShareBar name={country.name} />

      <PageHeader
        title={country.name}
        tagline={country.tagline}
        subtitle={aiHL}
        backgroundImage={flagHeroImage || country.heroImage}
        breadcrumbs={[
          { label: "Destinations", path: "/destinations" },
          { label: country.name },
        ]}
      />

      {/* Cookie Settings */}
      <section className="cp-section cp-section--cookie">
        <div className="cp-container">
          <CookieSettingsButton />
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <section className="cp-section cp-section--nav">
        <div className="cp-container">
          <div className="cp-nav-bar">
            <Link to="/destinations" className="cp-back-link">
              <FiArrowLeft size={15} />
              <span>All Countries</span>
            </Link>
            {officialLink && (
              <a
                href={officialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cp-official-link"
              >
                <FiLink size={13} />
                <span>{officialLink.label}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══ HERO SECTION ═══ */}
      <section className="cp-section cp-section--hero">
        <div className="cp-container">
          <div className="cp-hero-grid">
            <R a="left">
              <article className="cp-card cp-card--hero">
                <div className="cp-hero__flag-row">
                  <span
                    className="cp-hero__flag av-flag"
                    data-av-flag-anim={flagAnimVariant(country?.id || country?.name)}
                  >
                    {country.flag}
                  </span>
                  <div>
                    <span className="cp-badge cp-badge--primary">
                      {clean(country.tagline)}
                    </span>
                    <span className="cp-hero__region">
                      <FiMapPin size={11} /> {clean(country.region || "Africa")}
                    </span>
                  </div>
                </div>
                <h2 className="cp-hero__title">Discover {country.name}</h2>
                <p className="cp-hero__intro">{td.intro}</p>
                {td.discover?.[0] && (
                  <p className="cp-hero__text">{td.discover[0]}</p>
                )}
                {td.discover?.[1] && (
                  <p className="cp-hero__text">{td.discover[1]}</p>
                )}
                {officialLink && (
                  <a
                    href={officialLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-hero__cta"
                  >
                    <FiExternalLink size={15} /> Visit Official {country.name}{" "}
                    Tourism Website
                  </a>
                )}
              </article>
            </R>
            <R a="right" d={0.1}>
              <aside className="cp-card cp-card--sidebar">
                <h3 className="cp-card__heading">
                  <FiGrid size={16} /> Country Snapshot
                </h3>
                <div className="cp-info-list">
                  {info.map((it, i) => (
                    <R
                      key={it.l}
                      animation="flipIn"
                      delay={i * 0.04}
                      as="div"
                      className="cp-info-item"
                    >
                      <span className="cp-info-item__icon">
                        <it.icon size={16} />
                      </span>
                      <div>
                        <div className="cp-info-item__label">{it.l}</div>
                        <div className="cp-info-item__value">{it.v}</div>
                      </div>
                    </R>
                  ))}
                </div>
                <div className="cp-sidebar-actions">
                  <Button
                    to="/booking"
                    variant="primary"
                    icon={<FiCalendar size={15} />}
                  >
                    Plan Your Trip
                  </Button>
                  <Button
                    to={`/country/${country.id}/destinations`}
                    variant="secondary"
                    icon={<FiMapPin size={15} />}
                  >
                    Explore Places
                  </Button>
                </div>
              </aside>
            </R>
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      {td.stats?.length > 0 && (
        <section className="cp-section cp-section--stats">
          <div className="cp-container">
            <R a="up">
              <div className="cp-section-header">
                <span className="cp-badge">
                  <FiBarChart2 size={12} /> Live Statistics
                </span>
                <h2 className="cp-section-title">
                  {country.name} by the Numbers
                </h2>
              </div>
            </R>
            <div className="cp-stats-grid">
              {td.stats.map((st, i) => (
                <R
                  key={st.l}
                  animation="zoomIn"
                  delay={i * 0.08}
                  as="div"
                  className="cp-stat"
                >
                  <div className="cp-stat__value">
                    <Ct
                      end={st.v}
                      sfx={st.s || ""}
                      pfx={st.p || ""}
                      dc={st.dc || 0}
                      dur={1800 + i * 60}
                    />
                  </div>
                  <div className="cp-stat__label">{st.l}</div>
                </R>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FACTS SECTION ═══ */}
      {td.facts?.length > 0 && (
        <section className="cp-section cp-section--facts">
          <div className="cp-container">
            <R a="up">
              <div className="cp-section-header">
                <span className="cp-badge">
                  <FiInfo size={12} /> Essential Facts
                </span>
                <h2 className="cp-section-title">Know Before You Go</h2>
              </div>
            </R>
            <div className="cp-facts-grid">
              {td.facts.map((f, i) => (
                <R key={f.t} a="up" d={i * 0.04} as="div" className="cp-fact">
                  <div className="cp-fact__title">{f.t}</div>
                  <div className="cp-fact__value">{f.v}</div>
                  {f.s && <div className="cp-fact__sub">{f.s}</div>}
                </R>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ IN-DEPTH GUIDE ═══ */}
      <section className="cp-section cp-section--guide">
        <div className="cp-container cp-container--article">
          <R a="up">
            <div className="cp-section-header">
              <span className="cp-badge">
                <FiBookOpen size={12} /> In-Depth Guide
              </span>
              <h2 className="cp-section-title">
                Everything About {country.name}
              </h2>
              <p className="cp-section-subtitle">
                Landscapes, culture, activities, and experiences — with rich
                media throughout
              </p>
            </div>
          </R>
          <div className="cp-guide">{mixed()}</div>
        </div>
      </section>

      {/* ═══ VIDEOS ═══ */}
      {td.videos?.length > 0 && (
        <section className="cp-section cp-section--videos">
          <div className="cp-container">
            <R a="up">
              <div className="cp-section-header">
                <span className="cp-badge">
                  <FiPlay size={12} /> Video Showcase
                </span>
                <h2 className="cp-section-title">
                  Experience {country.name} Through Video
                </h2>
              </div>
            </R>
            <Vids videos={td.videos} />
          </div>
        </section>
      )}

      {/* ═══ GALLERY ═══ */}
      {galleryImages?.length > 2 && (
        <section className="cp-section cp-section--gallery">
          <div className="cp-container">
            <R a="up">
              <div className="cp-section-header">
                <span className="cp-badge">
                  <FiCamera size={12} /> Photo Gallery
                </span>
                <h2 className="cp-section-title">{country.name} in Pictures</h2>
              </div>
            </R>
            <R a="zoom" d={0.1}>
              <Gal imgs={galleryImages} />
            </R>
          </div>
        </section>
      )}

      {/* ═══ HIGHLIGHTS ═══ */}
      <section className="cp-section cp-section--highlights">
        <div className="cp-container">
          <R a="up">
            <div className="cp-section-header">
              <span className="cp-badge">
                <FiStar size={12} /> Highlights
              </span>
              <h2 className="cp-section-title">Why Visit {country.name}?</h2>
            </div>
          </R>
          <div className="cp-highlights-grid">
            {(country.highlights || []).slice(0, 12).map((h, i) => {
              const Ic = [
                FiMapPin,
                FiCompass,
                FiSun,
                FiStar,
                FiGlobe,
                FiBarChart2,
                FiTrendingUp,
                FiCalendar,
                FiAnchor,
                FiCamera,
                FiFeather,
                FiTarget,
              ][i % 12];
              return (
                <R key={h} a="up" d={i * 0.04}>
                  <article className="cp-highlight">
                    <div className="cp-highlight__icon">
                      <Ic size={20} />
                    </div>
                    <h4 className="cp-highlight__text">{clean(h)}</h4>
                    <span className="cp-highlight__number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </article>
                </R>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ EXPERIENCES ═══ */}
      <section className="cp-section cp-section--experiences">
        <div className="cp-container">
          <R a="up">
            <article className="cp-card cp-card--experiences">
              <span className="cp-badge">
                <FiHeart size={12} /> Signature Experiences
              </span>
              <h3 className="cp-card__heading" style={{ marginTop: 12 }}>
                Unforgettable Moments
              </h3>
              <div className="cp-chips">
                {(country.experiences || []).slice(0, 20).map((e, i) => (
                  <R
                    key={e}
                    a="zoom"
                    d={i * 0.02}
                    as="span"
                    className="cp-chip"
                  >
                    <FiCheck size={13} /> {clean(e)}
                  </R>
                ))}
              </div>
            </article>
          </R>
        </div>
      </section>

      {/* ═══ MAP ═══ */}
      <section className="cp-section cp-section--map">
        <div className="cp-container">
          <R a="up">
            <article className="cp-card">
              <div className="cp-map-header">
                <div>
                  <span className="cp-badge">
                    <FiMap size={12} /> Interactive Map
                  </span>
                  <h3 className="cp-card__heading">Explore {country.name}</h3>
                </div>
                <div className="cp-map-actions">
                  <button
                    onClick={mini}
                    className="cp-map-btn cp-map-btn--primary"
                  >
                    Mini View <FiMaximize2 size={13} />
                  </button>
                  <a
                    href={mO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-map-btn cp-map-btn--secondary"
                  >
                    Google Maps <FiExternalLink size={13} />
                  </a>
                </div>
              </div>
              <div className="cp-map-frame">
                <iframe
                  title={`${country.name} Map`}
                  src={mE}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </article>
          </R>
        </div>
      </section>

      {/* ═══ OFFICIAL LINK BANNER ═══ */}
      {officialLink && (
        <section className="cp-section cp-section--official-banner">
          <div className="cp-container">
            <R a="up">
              <div className="cp-official-banner">
                <div className="cp-official-banner__body">
                  <FiGlobe size={28} className="cp-official-banner__icon" />
                  <div>
                    <h3>Official {country.name} Tourism Website</h3>
                    <p>
                      Plan your trip with the official tourism board for
                      up-to-date travel advisories, visa info, events, and
                      bookings.
                    </p>
                  </div>
                </div>
                <a
                  href={officialLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-official-banner__cta"
                >
                  Visit {officialLink.label.split("—")[0]}{" "}
                  <FiExternalLink size={16} />
                </a>
              </div>
            </R>
          </div>
        </section>
      )}

      {/* ═══ AI INTELLIGENCE ═══ */}
      <section className="cp-section cp-section--ai">
        <div className="cp-container">
          <R animation="perspectiveIn">
            <div className="cp-ai-header">
              <div className="cp-ai-header__left">
                <span className="cp-badge cp-badge--ai">
                  <FiZap size={14} /> Neural Core
                </span>
                <h3 className="cp-ai-title">AI-Powered Live Intelligence</h3>
                <p className="cp-ai-subtitle">
                  Real-time strategic analysis and 2026 travel forecasting via
                  DeepSeek & Gemini
                </p>
              </div>
              {insights && (
                <button className="cp-ai-refresh" onClick={retry}>
                  <FiRefreshCw size={14} /> Refresh Intelligence
                </button>
              )}
            </div>
          </R>

          {aiL && (
            <div className="cp-ai-status">
              <Loader />
            </div>
          )}

          {aiE && !aiL && (
            <div className="cp-ai-status">
              <Err message={aiE} onRetry={retry} />
            </div>
          )}

          {!aiL && !aiE && insights && (
            <div className="cp-ai-grid">
              {/* Main Content */}
              <R animation="slideReveal" className="cp-ai-main">
                <div className="cp-ai-white-card">
                  <div className="cp-ai-card-header">
                    <div className="cp-ai-card-title">
                      <FiBookOpen size={18} /> Strategic Overview
                    </div>
                    <div className="cp-ai-live-indicator">
                      <span className="cp-ai-live-dot" /> LIVE FEED
                    </div>
                  </div>

                  <div className="cp-ai-content">
                    <Stg index={0}>
                      <div className="cp-ai-definition">
                        <TW text={sec.def} speed={10} className="cp-tw--def" />
                      </div>
                    </Stg>

                    <Stg index={1}>
                      <div className="cp-ai-section-label">Deep Analysis</div>
                      <div className="cp-ai-paragraphs">
                        {(sec?.ov || []).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </Stg>

                    {insights.currentEvents && (
                      <Stg index={2}>
                        <div className="cp-ai-pulse">
                          <div className="cp-ai-pulse__header">
                            <FiActivity size={14} /> Current Pulse
                          </div>
                          <TW
                            text={clean(insights.currentEvents)}
                            speed={15}
                            className="cp-tw--pulse"
                          />
                        </div>
                      </Stg>
                    )}

                    <div className="cp-ai-details-grid">
                      <Stg index={3}>
                        <div className="cp-ai-section-label">
                          Demographic Shifts
                        </div>
                        <ul className="cp-ai-detail-list">
                          {(sec?.dem || []).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </Stg>
                      <Stg index={4}>
                        <div className="cp-ai-section-label">
                          Economic Indicators
                        </div>
                        <ul className="cp-ai-detail-list">
                          {(sec?.eco || []).map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </Stg>
                    </div>

                    <Stg index={5}>
                      <div className="cp-ai-section-label">
                        2026 Tourism Horizon
                      </div>
                      <div className="cp-ai-outlook">
                        {(sec?.tour || []).map((t, i) => (
                          <div key={i} className="cp-ai-outlook__item">
                            <FiTrendingUp size={13} />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </Stg>

                    {sec?.src?.length > 0 && (
                      <div className="cp-ai-sources">
                        <span className="cp-ai-sources__label">
                          Verified Sources:
                        </span>
                        <div className="cp-ai-sources__tags">
                          {sec.src.map((s, i) => (
                            <span key={i} className="cp-ai-sources__tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </R>

              {/* Sidebar */}
              <R animation="blurIn" className="cp-ai-sidebar" delay={0.2}>
                <div className="cp-ai-sidebar-stack">
                  <div className="cp-ai-glass">
                    <h4 className="cp-ai-glass__title">
                      <FiBarChart2 size={16} /> Data Snapshot
                    </h4>
                    <div className="cp-ai-metrics">
                      {[
                        {
                          l: "Population",
                          v: insights.quickStats?.population,
                          ic: FiUsers,
                        },
                        {
                          l: "GDP Output",
                          v: insights.quickStats?.gdp,
                          ic: FiTrendingUp,
                        },
                        {
                          l: "Connectivity",
                          v: insights.quickStats?.internetPenetration,
                          ic: FiWifi,
                        },
                        {
                          l: "Annual Inflow",
                          v: insights.quickStats?.internationalArrivals,
                          ic: FiGlobe,
                        },
                      ].map((s) => (
                        <div key={s.l} className="cp-ai-metric">
                          <s.ic size={18} />
                          <div className="cp-ai-metric__value">
                            {clean(s.v)}
                          </div>
                          <div className="cp-ai-metric__label">{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cp-ai-glass">
                    <div className="cp-ai-info-stack">
                      {[
                        insights.safetyRating && {
                          ic: FiShield,
                          l: "Safety Index",
                          v: insights.safetyRating,
                        },
                        insights.costIndex && {
                          ic: FiDollarSign,
                          l: "Cost Index",
                          v: insights.costIndex,
                        },
                        insights.localCurrency && {
                          ic: FiPackage,
                          l: "Local Currency",
                          v: insights.localCurrency,
                        },
                        insights.connectivityScore && {
                          ic: FiWifi,
                          l: "Data Link",
                          v: insights.connectivityScore,
                        },
                      ]
                        .filter(Boolean)
                        .map((m) => (
                          <div key={m.l} className="cp-ai-info-row">
                            <div className="cp-ai-info-row__icon">
                              <m.ic size={16} />
                            </div>
                            <div>
                              <div className="cp-ai-info-row__label">{m.l}</div>
                              <div className="cp-ai-info-row__value">
                                {clean(m.v)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="cp-ai-glass cp-ai-glass--accent">
                    <h5 className="cp-ai-section-label cp-ai-section-label--light">
                      <FiMapPin size={12} /> Key Hubs
                    </h5>
                    <div className="cp-ai-tokens">
                      {(insights.topCities || []).map((c) => (
                        <span key={c} className="cp-ai-token">
                          {clean(c)}
                        </span>
                      ))}
                    </div>

                    <h5 className="cp-ai-section-label cp-ai-section-label--light cp-ai-section-label--mt">
                      <FiCalendar size={12} /> Peak Periods
                    </h5>
                    <div className="cp-ai-tokens">
                      {(insights.bestTravelMonths || []).map((m) => (
                        <span
                          key={m}
                          className="cp-ai-token cp-ai-token--white"
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    <h5 className="cp-ai-section-label cp-ai-section-label--light cp-ai-section-label--mt">
                      <FiZap size={12} /> Trending Now
                    </h5>
                    <div className="cp-ai-tokens">
                      {(insights.trendingAttractions || []).map((a) => (
                        <span key={a} className="cp-ai-token cp-ai-token--glow">
                          {clean(a)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {insights.visaInfo && (
                    <div className="cp-ai-glass cp-ai-glass--visa">
                      <div className="cp-ai-visa-header">
                        <FiNavigation size={18} /> Visa Intelligence
                      </div>
                      <p className="cp-ai-visa-text">
                        {clean(insights.visaInfo)}
                      </p>
                    </div>
                  )}
                </div>
              </R>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CUISINE & DESTINATIONS ═══ */}
      <section className="cp-section cp-section--final">
        <div className="cp-container">
          <div className="cp-final-grid">
            <R a="left">
              <article className="cp-card">
                <span className="cp-badge">
                  <FiCoffee size={12} /> Culture & Cuisine
                </span>
                <h3 className="cp-card__heading" style={{ marginTop: 12 }}>
                  Taste & Traditions
                </h3>
                <p className="cp-card__text-lg">
                  {clean(
                    country.additionalInfo || country.description || td.intro,
                  )}
                </p>
                {(country?.cuisine?.specialties || []).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div className="cp-label">🍽️ Signature Dishes</div>
                    <div className="cp-chips">
                      {country.cuisine.specialties.slice(0, 10).map((d) => (
                        <span key={d} className="cp-chip">
                          {clean(d)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(country.travelTips || []).length > 0 && (
                  <div>
                    <div className="cp-label">💡 Travel Tips</div>
                    <ul className="cp-tips">
                      {country.travelTips.slice(0, 8).map((t) => (
                        <li key={t}>{clean(t)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            </R>
            <R a="right" d={0.1}>
              <article className="cp-card">
                <span className="cp-badge">
                  <FiMapPin size={12} /> Featured Places
                </span>
                <h3 className="cp-card__heading" style={{ marginTop: 12 }}>
                  Destinations
                </h3>
                <div className="cp-dest-list">
                  {dests.slice(0, 6).map((d, i) => (
                    <R
                      key={d.id}
                      a="up"
                      d={i * 0.04}
                      as={Link}
                      to={`/destination/${d.id}`}
                      className="cp-dest"
                    >
                      <img
                        src={d.images[0]}
                        alt={d.name}
                        className="cp-dest__img"
                        loading="lazy"
                      />
                      <div className="cp-dest__body">
                        <div className="cp-dest__type">{clean(d.type)}</div>
                        <div className="cp-dest__name">{clean(d.name)}</div>
                        <div className="cp-dest__desc">
                          {clean(d.description).slice(0, 120)}…
                        </div>
                      </div>
                    </R>
                  ))}
                </div>
                <div className="cp-dest-actions">
                  <Button
                    to={`/country/${country.id}/destinations`}
                    variant="primary"
                    icon={<FiArrowRight size={15} />}
                  >
                    View All
                  </Button>
                  <Button
                    to="/booking"
                    variant="secondary"
                    icon={<FiCalendar size={15} />}
                  >
                    Plan Trip
                  </Button>
                </div>
              </article>
            </R>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cp-section cp-section--cta">
        <div className="cp-container">
          <R a="up">
            <div className="cp-cta">
              <div className="cp-cta__body">
                <h2>Ready to Explore {country.name}?</h2>
                <p>
                  Our expert team crafts bespoke itineraries tailored to your
                  interests, timeline, and budget. Start planning your dream
                  African adventure today.
                </p>
                <div className="cp-cta__buttons">
                  <Button
                    to="/booking"
                    variant="primary"
                    icon={<FiCalendar size={15} />}
                  >
                    Start Planning
                  </Button>
                  <Button
                    to="/contact"
                    variant="secondary"
                    icon={<FiUsers size={15} />}
                  >
                    Talk to Expert
                  </Button>
                  {officialLink && (
                    <a
                      href={officialLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-map-btn cp-map-btn--secondary"
                    >
                      Official Site <FiExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
              <span className="cp-cta__flag" aria-hidden="true">
                <span
                  className="cp-cta__flag-inner av-flag"
                  data-av-flag-anim={flagAnimVariant((country?.id || country?.name) + ":cta")}
                >
                  {country.flag}
                </span>
              </span>
            </div>
          </R>
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CSS — Professional Green & White Theme                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
/* ─── Design Tokens ─── */
:root {
  --cp-green-50: #f0fdf4;
  --cp-green-100: #dcfce7;
  --cp-green-200: #bbf7d0;
  --cp-green-300: #86efac;
  --cp-green-400: #4ade80;
  --cp-green-500: #22c55e;
  --cp-green-600: #16a34a;
  --cp-green-700: #15803d;
  --cp-green-800: #166534;
  --cp-green-900: #14532d;
  --cp-green-950: #052e16;
  --cp-white: #ffffff;
  --cp-gray-50: #f9fafb;
  --cp-gray-100: #f3f4f6;
  --cp-gray-200: #e5e7eb;
  --cp-gray-300: #d1d5db;
  --cp-gray-400: #9ca3af;
  --cp-gray-500: #6b7280;
  --cp-gray-600: #4b5563;
  --cp-gray-700: #374151;
  --cp-gray-800: #1f2937;
  --cp-gray-900: #111827;
  --cp-radius-sm: 8px;
  --cp-radius-md: 12px;
  --cp-radius-lg: 16px;
  --cp-radius-xl: 24px;
  --cp-radius-full: 9999px;
  --cp-shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04);
  --cp-shadow-md: 0 4px 6px rgba(0,0,0,0.04), 0 10px 20px rgba(0,0,0,0.04);
  --cp-shadow-lg: 0 10px 25px rgba(0,0,0,0.06), 0 20px 48px rgba(0,0,0,0.04);
  --cp-shadow-xl: 0 20px 50px rgba(0,0,0,0.08), 0 10px 24px rgba(0,0,0,0.06);
  --cp-font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --cp-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --cp-transition: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ─── Global Reset ─── */
*, *::before, *::after { box-sizing: border-box; }

.cp-page {
  background: var(--cp-white);
  font-family: var(--cp-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  color: var(--cp-gray-800);
  line-height: 1.6;
}

/* ─── Container ─── */
.cp-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 64px);
}

.cp-container--article {
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── Sections ─── */
.cp-section {
  width: 100%;
  padding: clamp(48px, 8vw, 96px) 0;
}

.cp-section--cookie {
  padding: 12px 0 0;
  background: var(--cp-white);
}

.cp-section--nav {
  padding: 16px 0;
  background: var(--cp-white);
  border-bottom: 1px solid var(--cp-gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,0.95);
}

.cp-section--hero {
  padding: clamp(140px, 18vw, 200px) 0;
  background: linear-gradient(180deg, rgba(16,185,129,0.16) 0%, rgba(255,255,255,0.92) 45%, rgba(255,255,255,1) 100%);
  overflow: hidden;
}

.cp-section--stats {
  background: var(--cp-white);
  border-top: 1px solid var(--cp-gray-100);
  border-bottom: 1px solid var(--cp-gray-100);
}

.cp-section--facts {
  background: var(--cp-green-50);
}

.cp-section--guide {
  background: var(--cp-white);
}

.cp-section--videos {
  background: var(--cp-gray-50);
}

.cp-section--gallery {
  background: var(--cp-white);
}

.cp-section--highlights {
  background: var(--cp-green-50);
}

.cp-section--experiences {
  background: var(--cp-white);
}

.cp-section--map {
  background: var(--cp-gray-50);
}

.cp-section--official-banner {
  padding: clamp(32px, 4vw, 48px) 0;
  background: var(--cp-white);
}

.cp-section--final {
  background: var(--cp-gray-50);
}

.cp-section--ai {
  padding: clamp(64px, 10vw, 120px) 0;
  background: linear-gradient(160deg, var(--cp-green-950) 0%, var(--cp-green-900) 35%, var(--cp-green-800) 100%);
  position: relative;
  overflow: hidden;
}

.cp-section--ai::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 15% 25%, rgba(34,197,94,0.12) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 75%, rgba(74,222,128,0.06) 0%, transparent 50%);
  pointer-events: none;
}

.cp-section--cta {
  background: linear-gradient(160deg, var(--cp-green-800) 0%, var(--cp-green-700) 50%, var(--cp-green-600) 100%);
  position: relative;
}

.cp-section--cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
  pointer-events: none;
}

/* ─── Section Headers ─── */
.cp-section-header {
  text-align: center;
  margin-bottom: clamp(36px, 5vw, 56px);
}

.cp-section-title {
  font-family: var(--cp-font-display);
  font-size: clamp(28px, 5vw, 52px);
  color: var(--cp-gray-900);
  margin: 14px 0 8px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.cp-section-subtitle {
  color: var(--cp-gray-500);
  font-size: clamp(14px, 1.8vw, 17px);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ─── Badge ─── */
.cp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: var(--cp-radius-full);
  background: var(--cp-green-50);
  color: var(--cp-green-700);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  border: 1px solid var(--cp-green-100);
}

.cp-badge--primary {
  background: var(--cp-green-600);
  color: var(--cp-white);
  border-color: var(--cp-green-600);
  font-size: 10px;
  letter-spacing: 1.5px;
}

.cp-badge--ai {
  background: rgba(255,255,255,0.08);
  color: var(--cp-green-200);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 0 24px rgba(34,197,94,0.12);
}

/* ─── Navigation Bar ─── */
.cp-nav-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cp-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--cp-green-800);
  font-weight: 600;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: var(--cp-radius-full);
  border: 1px solid var(--cp-green-200);
  background: var(--cp-green-50);
  transition: all 0.3s var(--cp-transition);
}

.cp-back-link:hover {
  background: var(--cp-green-100);
  transform: translateX(-3px);
}

.cp-official-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--cp-green-700);
  font-weight: 600;
  font-size: 13px;
  padding: 8px 18px;
  border-radius: var(--cp-radius-full);
  border: 1px solid var(--cp-green-200);
  background: var(--cp-white);
  transition: all 0.3s var(--cp-transition);
}

.cp-official-link:hover {
  background: var(--cp-green-50);
  transform: translateY(-2px);
  box-shadow: var(--cp-shadow-sm);
}

/* ─── Card ─── */
.cp-card {
  background: var(--cp-white);
  border-radius: var(--cp-radius-xl);
  padding: clamp(24px, 4vw, 44px);
  border: 1px solid var(--cp-gray-200);
  box-shadow: var(--cp-shadow-sm);
  transition: box-shadow 0.35s var(--cp-transition);
  height: 100%;
}

.cp-card:hover {
  box-shadow: var(--cp-shadow-lg);
}

.cp-card--hero {
  background: linear-gradient(145deg, var(--cp-white), var(--cp-green-50));
  border-color: var(--cp-green-100);
}

.cp-card--sidebar {
  position: sticky;
  top: 80px;
  background: var(--cp-white);
  border-color: var(--cp-green-100);
}

.cp-card--experiences {
  background: linear-gradient(155deg, var(--cp-white), var(--cp-green-50), var(--cp-white));
  border-color: var(--cp-green-100);
}

.cp-card__heading {
  font-family: var(--cp-font-display);
  font-size: clamp(22px, 3vw, 32px);
  color: var(--cp-gray-900);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.cp-card__text-lg {
  color: var(--cp-gray-600);
  line-height: 2;
  font-size: clamp(15px, 1.7vw, 17px);
  margin-bottom: 20px;
}

/* ─── Hero Grid ─── */
.cp-hero-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: clamp(24px, 3vw, 40px);
  align-items: start;
}

.cp-hero__flag-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.cp-hero__flag {
  --av-flag-size: clamp(36px, 4.8vw, 56px);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.cp-hero__region {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--cp-gray-500);
  margin-top: 4px;
}

.cp-hero__title {
  font-family: var(--cp-font-display);
  font-size: clamp(32px, 5vw, 56px);
  color: var(--cp-gray-900);
  margin-bottom: 24px;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 700;
}

.cp-hero__intro {
  color: var(--cp-gray-700);
  line-height: 2;
  font-size: clamp(16px, 1.8vw, 18px);
  margin-bottom: 20px;
  font-weight: 500;
}

.cp-hero__text {
  color: var(--cp-gray-600);
  line-height: 1.95;
  font-size: 15px;
  margin-bottom: 18px;
}

.cp-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--cp-radius-full);
  background: linear-gradient(135deg, var(--cp-green-600), var(--cp-green-700));
  color: var(--cp-white);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  margin-top: 8px;
  transition: all 0.3s var(--cp-transition);
  box-shadow: 0 4px 16px rgba(22,163,74,0.25);
}

.cp-hero__cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(22,163,74,0.35);
}

/* ─── Info List ─── */
.cp-info-list {
  display: grid;
  gap: 6px;
}

.cp-info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: var(--cp-gray-50);
  border: 1px solid transparent;
  border-radius: var(--cp-radius-md);
  transition: all 0.3s var(--cp-transition);
}

.cp-info-item:hover {
  background: var(--cp-green-50);
  transform: translateX(4px);
  border-color: var(--cp-green-100);
}

.cp-info-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--cp-green-50);
  color: var(--cp-green-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.cp-info-item:hover .cp-info-item__icon {
  background: var(--cp-green-600);
  color: var(--cp-white);
}

.cp-info-item__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--cp-gray-500);
  font-weight: 700;
}

.cp-info-item__value {
  font-size: 14px;
  color: var(--cp-gray-900);
  font-weight: 600;
}

.cp-sidebar-actions {
  display: grid;
  gap: 8px;
  margin-top: 22px;
}

/* ─── Stats ─── */
.cp-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0;
  border: 1px solid var(--cp-gray-200);
  border-radius: var(--cp-radius-xl);
  overflow: hidden;
  background: var(--cp-white);
}

.cp-stat {
  padding: clamp(20px, 3vw, 32px);
  text-align: center;
  border-bottom: 1px solid var(--cp-gray-100);
  border-right: 1px solid var(--cp-gray-100);
  transition: all 0.3s;
  background: var(--cp-white);
}

.cp-stat:hover {
  background: var(--cp-green-50);
}

.cp-stat__value {
  font-family: var(--cp-font-display);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  color: var(--cp-green-700);
  line-height: 1;
  letter-spacing: -0.02em;
}

.cp-stat__label {
  font-size: 11px;
  color: var(--cp-gray-500);
  font-weight: 600;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ─── Facts ─── */
.cp-facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.cp-fact {
  padding: 24px;
  background: var(--cp-white);
  border-radius: var(--cp-radius-lg);
  border: 1px solid var(--cp-gray-200);
  transition: all 0.35s var(--cp-transition);
}

.cp-fact:hover {
  transform: translateY(-4px);
  box-shadow: var(--cp-shadow-lg);
  border-color: var(--cp-green-200);
}

.cp-fact__title {
  font-size: 11px;
  color: var(--cp-green-600);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  margin-bottom: 6px;
}

.cp-fact__value {
  font-size: 17px;
  color: var(--cp-gray-900);
  font-weight: 700;
  line-height: 1.3;
}

.cp-fact__sub {
  font-size: 13px;
  color: var(--cp-gray-500);
  line-height: 1.5;
  margin-top: 4px;
}

/* ─── In-Depth Guide ─── */
.cp-guide {
  display: grid;
  gap: clamp(40px, 5vw, 64px);
}

.cp-guide__lead {
  font-size: clamp(18px, 2.5vw, 24px);
  line-height: 1.75;
  color: var(--cp-gray-800);
  font-weight: 500;
  border-left: 4px solid var(--cp-green-500);
  padding: 8px 0 8px 24px;
  margin: 0;
}

.cp-guide__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 4vw, 44px);
  align-items: center;
}

.cp-guide__row--flip {
  direction: rtl;
}

.cp-guide__row--flip > * {
  direction: ltr;
}

.cp-guide__figure {
  border-radius: var(--cp-radius-lg);
  overflow: hidden;
  position: relative;
  box-shadow: var(--cp-shadow-md);
}

.cp-guide__figure img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
  transition: transform 0.6s var(--cp-transition);
}

.cp-guide__figure:hover img {
  transform: scale(1.04);
}

.cp-guide__figcap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  color: var(--cp-white);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.cp-guide__copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cp-guide__copy p {
  font-size: clamp(15px, 1.7vw, 17px);
  line-height: 2;
  color: var(--cp-gray-700);
  margin: 0;
}

.cp-guide__aside {
  font-size: 14px;
  color: var(--cp-green-800);
  background: var(--cp-green-50);
  padding: 14px 18px;
  border-radius: var(--cp-radius-md);
  border-left: 4px solid var(--cp-green-400);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.6;
}

.cp-guide__activities {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.cp-guide__activities--grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.cp-guide__activity {
  display: flex;
  gap: 16px;
  padding: 22px;
  background: var(--cp-gray-50);
  border-radius: var(--cp-radius-lg);
  border: 1px solid var(--cp-gray-100);
  transition: all 0.3s var(--cp-transition);
}

.cp-guide__activity:hover {
  background: var(--cp-green-50);
  border-color: var(--cp-green-200);
  transform: translateY(-3px);
  box-shadow: var(--cp-shadow-sm);
}

.cp-guide__activity-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cp-green-500);
  margin-top: 5px;
  flex-shrink: 0;
}

.cp-guide__activity strong {
  font-size: 15px;
  color: var(--cp-gray-900);
  display: block;
  margin-bottom: 4px;
}

.cp-guide__activity p {
  font-size: 13px;
  color: var(--cp-gray-500);
  line-height: 1.7;
  margin: 0;
}

.cp-guide__strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.cp-guide__strip-item {
  border-radius: var(--cp-radius-md);
  overflow: hidden;
  position: relative;
}

.cp-guide__strip-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  transition: transform 0.4s var(--cp-transition);
}

.cp-guide__strip-item:hover img {
  transform: scale(1.06);
}

.cp-guide__strip-item span {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  color: var(--cp-white);
  font-size: 12px;
  font-weight: 600;
}

/* ─── Highlights ─── */
.cp-highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.cp-highlight {
  background: var(--cp-white);
  border-radius: var(--cp-radius-lg);
  padding: 28px 24px;
  border: 1px solid var(--cp-gray-200);
  height: 100%;
  transition: all 0.35s var(--cp-transition);
  position: relative;
  overflow: hidden;
}

.cp-highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--cp-green-400), var(--cp-green-600));
  transform: scaleX(0);
  transition: transform 0.35s;
  transform-origin: left;
}

.cp-highlight:hover::after {
  transform: scaleX(1);
}

.cp-highlight:hover {
  transform: translateY(-5px);
  box-shadow: var(--cp-shadow-lg);
  border-color: var(--cp-green-200);
}

.cp-highlight__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--cp-green-50);
  color: var(--cp-green-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  transition: all 0.3s;
}

.cp-highlight:hover .cp-highlight__icon {
  background: var(--cp-green-600);
  color: var(--cp-white);
}

.cp-highlight__text {
  font-size: 15px;
  color: var(--cp-gray-900);
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
}

.cp-highlight__number {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 13px;
  color: var(--cp-gray-300);
  font-weight: 700;
  font-family: var(--cp-font-display);
}

/* ─── Chips ─── */
.cp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--cp-radius-full);
  background: var(--cp-green-50);
  color: var(--cp-green-800);
  border: 1px solid var(--cp-green-100);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s;
}

.cp-chip:hover {
  background: var(--cp-green-100);
  transform: translateY(-2px);
}

/* ─── Label & Tips ─── */
.cp-label {
  font-size: 12px;
  color: var(--cp-green-700);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  margin-bottom: 12px;
}

.cp-tips {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.cp-tips li {
  color: var(--cp-gray-700);
  font-size: 14px;
  line-height: 1.75;
}

/* ─── Gallery ─── */
.cp-gal {
  position: relative;
  border-radius: var(--cp-radius-xl);
  overflow: hidden;
  aspect-ratio: 16/7;
  background: var(--cp-gray-100);
  box-shadow: var(--cp-shadow-lg);
  cursor: pointer;
}

.cp-gal__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--cp-transition);
}

.cp-gal:hover .cp-gal__img {
  transform: scale(1.03);
}

.cp-gal__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 36px;
  color: var(--cp-white);
  font-size: 17px;
  font-weight: 600;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.35s;
}

.cp-gal:hover .cp-gal__overlay {
  opacity: 1;
}

.cp-gal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cp-gray-800);
  transition: all 0.25s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  z-index: 2;
}

.cp-gal__nav:hover {
  background: var(--cp-white);
  transform: translateY(-50%) scale(1.1);
}

.cp-gal__nav--left { left: 18px; }
.cp-gal__nav--right { right: 18px; }

.cp-gal__counter {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0,0,0,0.5);
  color: var(--cp-white);
  padding: 6px 14px;
  border-radius: var(--cp-radius-full);
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  z-index: 2;
}

.cp-gal__dots {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.cp-gal__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  padding: 0;
  transition: all 0.25s;
}

.cp-gal__dot--active {
  background: var(--cp-white);
  transform: scale(1.4);
}

.cp-gal__thumbs {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--cp-green-200) transparent;
}

.cp-gal__thumb {
  flex-shrink: 0;
  width: 96px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: all 0.25s;
}

.cp-gal__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.cp-gal__thumb:hover {
  border-color: var(--cp-green-400);
}

.cp-gal__thumb:hover img {
  transform: scale(1.08);
}

.cp-gal__thumb--active {
  border-color: var(--cp-green-500);
  box-shadow: 0 0 0 3px var(--cp-green-200);
}

/* ─── Lightbox ─── */
.cp-lb {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0,0,0,0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cpFadeIn 0.25s;
  backdrop-filter: blur(20px);
}

.cp-lb__img {
  max-width: 92vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: var(--cp-radius-md);
}

.cp-lb__close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--cp-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.25s;
}

.cp-lb__close:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.1);
}

.cp-lb__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--cp-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  z-index: 10;
}

.cp-lb__arrow:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-50%) scale(1.1);
}

.cp-lb__arrow--left { left: clamp(14px, 3vw, 44px); }
.cp-lb__arrow--right { right: clamp(14px, 3vw, 44px); }

.cp-lb__caption {
  position: absolute;
  bottom: clamp(20px, 4vw, 44px);
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  background: rgba(0,0,0,0.4);
  padding: 10px 24px;
  border-radius: var(--cp-radius-full);
  backdrop-filter: blur(8px);
  max-width: 90vw;
  text-align: center;
  white-space: normal;
  font-weight: 500;
}

/* ─── Videos ─── */
.cp-vid__player {
  margin-bottom: 28px;
  border-radius: var(--cp-radius-xl);
  overflow: hidden;
  border: 1px solid var(--cp-green-200);
  box-shadow: var(--cp-shadow-lg);
}

.cp-vid__embed {
  position: relative;
  padding-top: 56.25%;
  background: #000;
}

.cp-vid__embed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cp-vid__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  background: var(--cp-white);
}

.cp-vid__bar h4 {
  margin: 0;
  font-size: 15px;
  color: var(--cp-gray-900);
  font-weight: 700;
}

.cp-vid__bar button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: var(--cp-radius-full);
  border: 1px solid var(--cp-gray-200);
  background: var(--cp-gray-50);
  color: var(--cp-gray-700);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cp-vid__bar button:hover {
  background: var(--cp-gray-100);
}

.cp-vid__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cp-vid__card {
  background: var(--cp-white);
  border-radius: var(--cp-radius-lg);
  overflow: hidden;
  border: 1px solid var(--cp-gray-200);
  cursor: pointer;
  transition: all 0.35s var(--cp-transition);
  padding: 0;
  text-align: left;
  width: 100%;
}

.cp-vid__card:hover {
  transform: translateY(-5px);
  box-shadow: var(--cp-shadow-lg);
  border-color: var(--cp-green-300);
}

.cp-vid__card--active {
  border-color: var(--cp-green-500);
}

.cp-vid__thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.cp-vid__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.cp-vid__card:hover .cp-vid__thumbnail img {
  transform: scale(1.05);
}

.cp-vid__play-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.25);
  transition: background 0.25s;
}

.cp-vid__card:hover .cp-vid__play-icon {
  background: rgba(22,163,74,0.4);
}

.cp-vid__play-icon svg {
  width: 50px;
  height: 50px;
  padding: 12px;
  background: rgba(255,255,255,0.95);
  border-radius: 50%;
  color: var(--cp-green-600);
  transition: transform 0.25s;
}

.cp-vid__card:hover .cp-vid__play-icon svg {
  transform: scale(1.1);
}

.cp-vid__title {
  padding: 14px 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--cp-gray-900);
}

/* ─── Map ─── */
.cp-map-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.cp-map-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cp-map-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border-radius: var(--cp-radius-full);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  text-decoration: none;
  border: none;
}

.cp-map-btn--primary {
  background: linear-gradient(135deg, var(--cp-green-600), var(--cp-green-700));
  color: var(--cp-white);
  box-shadow: 0 3px 12px rgba(22,163,74,0.2);
}

.cp-map-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22,163,74,0.3);
}

.cp-map-btn--secondary {
  background: var(--cp-green-50);
  color: var(--cp-green-700);
  border: 1px solid var(--cp-green-200);
}

.cp-map-btn--secondary:hover {
  background: var(--cp-green-100);
  transform: translateY(-2px);
}

.cp-map-frame {
  border-radius: var(--cp-radius-xl);
  overflow: hidden;
  border: 1px solid var(--cp-green-100);
}

.cp-map-frame iframe {
  width: 100%;
  min-height: 520px;
  border: 0;
  display: block;
}

/* ─── Official Banner ─── */
.cp-official-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: clamp(24px, 3vw, 36px) clamp(24px, 4vw, 40px);
  border-radius: var(--cp-radius-xl);
  background: linear-gradient(145deg, var(--cp-green-50), var(--cp-white));
  border: 2px solid var(--cp-green-200);
  flex-wrap: wrap;
}

.cp-official-banner__body {
  display: flex;
  align-items: center;
  gap: 18px;
}

.cp-official-banner__icon {
  color: var(--cp-green-600);
  flex-shrink: 0;
}

.cp-official-banner__body h3 {
  margin: 0;
  font-size: clamp(16px, 2vw, 20px);
  color: var(--cp-gray-900);
  font-family: var(--cp-font-display);
  font-weight: 700;
}

.cp-official-banner__body p {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--cp-gray-500);
  line-height: 1.6;
}

.cp-official-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--cp-radius-full);
  background: var(--cp-green-600);
  color: var(--cp-white);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s var(--cp-transition);
  box-shadow: 0 4px 16px rgba(22,163,74,0.25);
  white-space: nowrap;
}

.cp-official-banner__cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(22,163,74,0.35);
}

/* ─── Share Bar ─── */
.cp-share {
  position: fixed;
  right: 22px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 999;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s var(--cp-transition);
  pointer-events: none;
}

.cp-share--visible {
  opacity: 1;
  transform: translateY(-70px);
  pointer-events: auto;
}

.cp-share button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--cp-green-200);
  background: var(--cp-white);
  color: var(--cp-green-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.25s;
}

.cp-share button:hover {
  transform: scale(1.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  background: var(--cp-green-50);
}

/* ─── Destinations ─── */
.cp-dest-list {
  display: grid;
  gap: 12px;
}

.cp-dest {
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--cp-gray-200);
  border-radius: var(--cp-radius-lg);
  overflow: hidden;
  display: grid;
  grid-template-columns: 148px 1fr;
  background: var(--cp-white);
  transition: all 0.35s var(--cp-transition);
}

.cp-dest:hover {
  border-color: var(--cp-green-200);
  box-shadow: var(--cp-shadow-lg);
  transform: translateX(4px);
}

.cp-dest__img {
  width: 148px;
  height: 110px;
  object-fit: cover;
  transition: transform 0.4s;
}

.cp-dest:hover .cp-dest__img {
  transform: scale(1.05);
}

.cp-dest__body {
  padding: 14px 18px;
}

.cp-dest__type {
  color: var(--cp-green-600);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
}

.cp-dest__name {
  font-size: 15px;
  color: var(--cp-gray-900);
  font-weight: 700;
  margin-bottom: 4px;
}

.cp-dest__desc {
  font-size: 12px;
  color: var(--cp-gray-500);
  line-height: 1.65;
}

.cp-dest-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* ─── CTA ─── */
.cp-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  position: relative;
  z-index: 1;
}

.cp-cta__body {
  flex: 1;
}

.cp-cta h2 {
  font-family: var(--cp-font-display);
  font-size: clamp(30px, 5vw, 52px);
  color: var(--cp-white);
  margin: 0 0 16px;
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cp-cta p {
  color: rgba(255,255,255,0.8);
  font-size: clamp(15px, 1.8vw, 18px);
  line-height: 1.85;
  margin: 0 0 32px;
  max-width: 600px;
}

.cp-cta__buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.cp-cta__flag {
  animation: cpFloat 4s ease-in-out infinite;
  flex-shrink: 0;
}

.cp-cta__flag-inner {
  --av-flag-size: clamp(56px, 8vw, 96px);
  filter: drop-shadow(0 8px 32px rgba(0,0,0,0.25));
}

/* ─── Final Grid ─── */
.cp-final-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 3vw, 40px);
  align-items: start;
}

@media (max-width: 980px) {
  .cp-hero-grid {
    grid-template-columns: 1fr;
  }
  .cp-card--sidebar {
    position: static;
    top: auto;
  }
  .cp-stats-grid,
  .cp-facts-grid,
  .cp-highlights-grid,
  .cp-final-grid {
    grid-template-columns: 1fr;
  }
  .cp-dest {
    grid-template-columns: 1fr;
  }
  .cp-dest__img {
    height: 180px;
  }
}

@media (max-width: 640px) {
  .cp-section {
    padding: clamp(40px, 10vw, 80px) 0;
  }
  .cp-hero__title {
    font-size: clamp(28px, 7vw, 42px);
  }
  .cp-hero__intro {
    font-size: clamp(15px, 2.2vw, 16px);
  }
  .cp-guide__row {
    grid-template-columns: 1fr;
  }
  .cp-guide__row--flip {
    direction: ltr;
  }
  .cp-cta {
    flex-direction: column;
    gap: 24px;
  }
}

/* ─── Typewriter ─── */
.cp-tw {
  margin: 0;
  line-height: 1.9;
  font-size: 14px;
  color: rgba(255,255,255,0.92);
}

.cp-tw__cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background: var(--cp-green-400);
  margin-left: 1px;
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: cpBlink 0.85s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(74,222,128,0.4);
}

/* ─── AI Section ─── */
.cp-ai-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 56px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.cp-ai-title {
  font-family: var(--cp-font-display);
  font-size: clamp(32px, 5vw, 56px);
  color: var(--cp-white);
  margin: 14px 0 8px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cp-ai-subtitle {
  color: rgba(255,255,255,0.55);
  font-size: 15px;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.2px;
}

.cp-ai-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: var(--cp-radius-full);
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: var(--cp-white);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(12px);
}

.cp-ai-refresh:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-2px);
  border-color: var(--cp-green-300);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.cp-ai-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 32px;
  position: relative;
  z-index: 2;
}

.cp-ai-white-card {
  background: var(--cp-white);
  border-radius: var(--cp-radius-xl);
  padding: clamp(28px, 4vw, 44px);
  box-shadow: 0 24px 70px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.8);
}

.cp-ai-white-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--cp-green-400), var(--cp-green-600));
}

.cp-ai-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--cp-gray-100);
  padding-bottom: 20px;
}

.cp-ai-card-title {
  font-size: 20px;
  color: var(--cp-gray-900);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--cp-font-display);
  letter-spacing: -0.02em;
}

.cp-ai-live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  color: var(--cp-green-600);
  background: var(--cp-green-50);
  padding: 6px 14px;
  border-radius: var(--cp-radius-full);
  letter-spacing: 1px;
}

.cp-ai-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cp-green-500);
  animation: cpPulse 2s ease-in-out infinite;
}

.cp-ai-content {
  display: grid;
  gap: 28px;
}

.cp-ai-definition {
  background: var(--cp-gray-50);
  padding: 26px 30px;
  border-radius: var(--cp-radius-lg);
  border-left: 5px solid var(--cp-green-500);
}

.cp-tw--def {
  color: var(--cp-gray-800) !important;
  font-size: clamp(18px, 2.2vw, 22px) !important;
  line-height: 1.65 !important;
  font-weight: 600 !important;
  font-family: var(--cp-font-display) !important;
}

.cp-ai-section-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--cp-green-600);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-ai-section-label--light {
  color: var(--cp-green-300);
}

.cp-ai-section-label--mt {
  margin-top: 22px;
}

.cp-ai-paragraphs p {
  font-size: 16px;
  line-height: 1.85;
  color: var(--cp-gray-700);
  margin: 0 0 16px;
}

.cp-ai-pulse {
  background: var(--cp-green-950);
  padding: 24px 28px;
  border-radius: var(--cp-radius-lg);
  color: var(--cp-white);
  border: 1px solid var(--cp-green-800);
  box-shadow: inset 0 0 24px rgba(34,197,94,0.08);
}

.cp-ai-pulse__header {
  font-size: 10px;
  font-weight: 800;
  color: var(--cp-green-400);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.cp-tw--pulse {
  color: var(--cp-green-100) !important;
  font-size: 15px !important;
  line-height: 1.75 !important;
  font-style: italic !important;
}

.cp-ai-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.cp-ai-detail-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: var(--cp-gray-600);
}

.cp-ai-detail-list li {
  font-size: 14px;
  line-height: 1.65;
  font-weight: 500;
}

.cp-ai-outlook {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.cp-ai-outlook__item {
  padding: 18px 22px;
  background: var(--cp-gray-50);
  border-radius: var(--cp-radius-md);
  font-size: 13px;
  color: var(--cp-gray-800);
  line-height: 1.6;
  font-weight: 600;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.cp-ai-outlook__item:hover {
  background: var(--cp-white);
  border-color: var(--cp-green-200);
  box-shadow: var(--cp-shadow-sm);
  transform: translateY(-2px);
}

.cp-ai-outlook__item svg {
  color: var(--cp-green-500);
  margin-top: 2px;
  flex-shrink: 0;
}

.cp-ai-sources {
  margin-top: 20px;
  padding-top: 24px;
  border-top: 1px solid var(--cp-gray-100);
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.cp-ai-sources__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--cp-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cp-ai-sources__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cp-ai-sources__tag {
  font-size: 11px;
  color: var(--cp-green-700);
  background: var(--cp-green-50);
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
}

/* ─── AI Sidebar ─── */
.cp-ai-sidebar-stack {
  display: grid;
  gap: 20px;
}

.cp-ai-glass {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--cp-radius-lg);
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.cp-ai-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
  pointer-events: none;
}

.cp-ai-glass__title {
  font-size: 16px;
  color: var(--cp-white);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  font-family: var(--cp-font-display);
}

.cp-ai-glass--accent {
  background: linear-gradient(135deg, rgba(22,163,74,0.15), rgba(21,128,61,0.05));
  border-color: rgba(74,222,128,0.2);
}

.cp-ai-glass--visa {
  background: rgba(5,46,22,0.4);
  border-color: rgba(187,247,208,0.2);
}

.cp-ai-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cp-ai-metric {
  padding: 20px 16px;
  background: rgba(255,255,255,0.04);
  border-radius: var(--cp-radius-md);
  border: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  color: var(--cp-white);
  transition: all 0.3s;
}

.cp-ai-metric:hover {
  background: rgba(255,255,255,0.1);
  border-color: var(--cp-green-400);
  transform: translateY(-3px);
}

.cp-ai-metric svg {
  color: var(--cp-green-400);
  margin-bottom: 10px;
}

.cp-ai-metric__value {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.cp-ai-metric__label {
  font-size: 10px;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.cp-ai-info-stack {
  display: grid;
  gap: 12px;
}

.cp-ai-info-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(255,255,255,0.03);
  border-radius: var(--cp-radius-md);
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s;
}

.cp-ai-info-row:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--cp-green-500);
}

.cp-ai-info-row__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(34,197,94,0.15);
  color: var(--cp-green-400);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cp-ai-info-row__label {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.cp-ai-info-row__value {
  font-size: 14px;
  color: var(--cp-white);
  font-weight: 700;
}

.cp-ai-tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cp-ai-token {
  font-size: 12px;
  color: var(--cp-white);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 6px 16px;
  border-radius: var(--cp-radius-full);
  font-weight: 600;
  transition: all 0.2s;
}

.cp-ai-token:hover {
  background: rgba(255,255,255,0.15);
  border-color: var(--cp-green-400);
  transform: scale(1.04);
}

.cp-ai-token--white {
  background: var(--cp-white);
  color: var(--cp-gray-900);
  border-color: var(--cp-white);
}

.cp-ai-token--glow {
  box-shadow: 0 0 16px rgba(74,222,128,0.3);
  border-color: var(--cp-green-300);
  color: var(--cp-green-100);
}

.cp-ai-visa-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  color: var(--cp-green-200);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cp-ai-visa-text {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  line-height: 1.8;
  margin: 0;
}

.cp-ai-status {
  padding: 60px 0;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* ─── Loader ─── */
.cp-loader {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--cp-radius-xl);
  padding: 56px 32px;
  text-align: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(16px);
}

.cp-loader__orb {
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp-loader__ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: var(--cp-green-400);
  border-right-color: var(--cp-green-400);
  border-radius: 50%;
  animation: cpSpin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.cp-loader__icon {
  color: var(--cp-green-400);
  font-size: 22px;
  animation: cpPulse 2s ease-in-out infinite;
}

.cp-loader h4 {
  color: var(--cp-white);
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px;
}

.cp-loader p {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  margin: 0 0 28px;
}

.cp-loader__bars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 28px;
  height: 28px;
}

.cp-loader__bars span {
  width: 3px;
  height: 100%;
  background: var(--cp-green-400);
  border-radius: 2px;
  animation: cpBar 1.2s ease-in-out infinite;
}

.cp-loader__skeleton {
  height: 8px;
  border-radius: var(--cp-radius-full);
  max-width: 420px;
  margin: 0 auto 10px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.14) 40%, rgba(255,255,255,0.05));
  background-size: 280% 100%;
  animation: cpShimmer 1.6s ease infinite;
}

.cp-loader__skeleton--md { max-width: 320px; }
.cp-loader__skeleton--sm { max-width: 240px; }

/* ─── Error ─── */
.cp-err {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: var(--cp-radius-xl);
  padding: 48px 32px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cp-err__icon { font-size: 40px; margin-bottom: 12px; }

.cp-err h4 {
  color: #fca5a5;
  font-size: 18px;
  margin: 0 0 6px;
}

.cp-err p {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
  margin: 0 0 20px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.cp-err__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: var(--cp-radius-full);
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  color: var(--cp-white);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.cp-err__btn:hover {
  background: rgba(255,255,255,0.12);
  transform: translateY(-2px);
}

/* ─── 404 ─── */
.cp-notfound {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
  padding: 40px;
  background: var(--cp-white);
}

.cp-notfound__emoji { font-size: 88px; }

.cp-notfound h1 {
  font-family: var(--cp-font-display);
  font-size: clamp(30px, 5vw, 48px);
  color: var(--cp-gray-900);
  margin: 0;
}

.cp-notfound p {
  color: var(--cp-gray-500);
  font-size: 16px;
  margin: 0 0 12px;
}

/* ─── Animations ─── */
@keyframes cpSpin { to { transform: rotate(360deg); } }
@keyframes cpPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.95); } }
@keyframes cpBar { 0%, 100% { transform: scaleY(0.3); opacity: 0.35; } 50% { transform: scaleY(1); opacity: 1; } }
@keyframes cpShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes cpFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes cpFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes cpBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

/* ═══════════════════════════════════════════════════════ */
/*  RESPONSIVE                                             */
/* ═══════════════════════════════════════════════════════ */

@media (max-width: 1280px) {
  .cp-hero-grid { grid-template-columns: 1.4fr 1fr; }
  .cp-ai-grid { grid-template-columns: 1.6fr 1fr; }
}

@media (max-width: 1024px) {
  .cp-hero-grid { grid-template-columns: 1fr; }
  .cp-card--sidebar { position: static; }
  .cp-ai-grid { grid-template-columns: 1fr; }
  .cp-ai-white-card { padding: 28px; }
  .cp-ai-details-grid { grid-template-columns: 1fr; }
  .cp-final-grid { grid-template-columns: 1fr; }
  .cp-cta { flex-direction: column; text-align: center; }
  .cp-cta p { margin-left: auto; margin-right: auto; }
  .cp-cta__buttons { justify-content: center; }
  .cp-official-banner { flex-direction: column; text-align: center; }
  .cp-official-banner__body { flex-direction: column; text-align: center; }
}

@media (max-width: 768px) {
  .cp-section { padding: clamp(40px, 6vw, 64px) 0; }

  .cp-guide__row,
  .cp-guide__row--flip {
    grid-template-columns: 1fr;
    direction: ltr;
  }

  .cp-guide__activities,
  .cp-guide__activities--grid {
    grid-template-columns: 1fr;
  }

  .cp-dest { grid-template-columns: 128px 1fr; }
  .cp-dest__img { width: 128px; height: 96px; }

  .cp-map-header { flex-direction: column; }
  .cp-map-frame iframe { min-height: 380px; }

  .cp-gal { aspect-ratio: 16/9; }

  .cp-stats-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .cp-cta__flag-inner { --av-flag-size: 76px; }

  .cp-ai-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .cp-ai-metrics { grid-template-columns: 1fr; }
  .cp-ai-outlook { grid-template-columns: 1fr; }

  .cp-ai-header {
    text-align: center;
    justify-content: center;
  }

  .cp-ai-header__left {
    text-align: center;
    width: 100%;
  }

  .cp-share { right: 14px; bottom: 18px; }
  .cp-share button { width: 44px; height: 44px; }
}

@media (max-width: 480px) {
  .cp-container { padding: 0 16px; }

  .cp-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cp-stat { padding: 16px 8px; }
  .cp-stat__value { font-size: clamp(22px, 5vw, 32px); }

  .cp-dest { grid-template-columns: 1fr; }
  .cp-dest__img { width: 100%; height: 180px; }

  .cp-gal { aspect-ratio: 4/3; }
  .cp-gal__thumb { width: 76px; height: 52px; }

  .cp-map-frame iframe { min-height: 300px; }

  .cp-cta__flag-inner { --av-flag-size: 60px; }
  .cp-hero__flag { --av-flag-size: 42px; }

  .cp-facts-grid { grid-template-columns: 1fr; }
  .cp-highlights-grid { grid-template-columns: 1fr; }

  .cp-vid__grid { grid-template-columns: 1fr; }

  .cp-guide__strip { grid-template-columns: repeat(2, 1fr); }

  .cp-nav-bar { gap: 8px; }
  .cp-back-link, .cp-official-link { font-size: 12px; padding: 6px 14px; }
}

@media (max-width: 360px) {
  .cp-container { padding: 0 12px; }
  .cp-stats-grid { grid-template-columns: 1fr 1fr; }
  .cp-guide__strip { grid-template-columns: 1fr; }
}
`;

export default CountryPage;
