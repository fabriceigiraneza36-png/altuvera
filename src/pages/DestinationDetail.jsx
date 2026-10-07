import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Mail,
  MapPin,
  Mountain,
  Star,
  Sparkles,
  ShieldCheck,
  Route,
  Users,
  Leaf,
  X,
} from "lucide-react";
import { useDestination } from "../hooks/useDestinations";
import "./DestinationDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api.altuverasafaris.com";

const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const cleaned = url.trim();
  if (!cleaned) return "";
  if (/^https?:\/\//i.test(cleaned) || cleaned.startsWith("data:")) return cleaned;

  try {
    const apiOrigin = new URL(API_URL).origin;
    return `${apiOrigin}${cleaned.startsWith("/") ? cleaned : `/${cleaned}`}`;
  } catch {
    return cleaned;
  }
};

const extractUniqueImages = (destination, limit = 12) => {
  if (!destination) return [];

  const seen = new Set();
  const push = (value) => {
    if (!value || typeof value !== "string") return;
    const clean = value.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    result.push({ url: clean });
  };

  const result = [];
  const sources = [];

  sources.push(...(Array.isArray(destination.heroImages) ? destination.heroImages : []));
  sources.push(...(Array.isArray(destination.hero_images) ? destination.hero_images : []));
  sources.push(...(Array.isArray(destination.images) ? destination.images : []));
  sources.push(...(Array.isArray(destination.image_urls) ? destination.image_urls : []));
  sources.push(...(Array.isArray(destination.imageUrls) ? destination.imageUrls : []));
  sources.push(...(Array.isArray(destination.gallery) ? destination.gallery : []));
  if (Array.isArray(destination.attractions)) {
    sources.push(...destination.attractions);
  }

  for (const item of sources) {
    if (typeof item === "string") {
      push(item);
      continue;
    }
    if (item && typeof item === "object") {
      push(item.url || item.imageUrl || item.image || item.image_url || item.src || item.thumbnailUrl);
    }
  }

  if (!result.length) {
    push(destination.heroImage || destination.imageUrl || destination.image || destination.thumbnailUrl || destination.coverImageUrl);
  }

  return result.slice(0, limit);
};

const Ic = ({ n, size = 16, style = {}, ...props }) => {
  const map = {
    calendar: Calendar,
    clock: Clock3,
    compass: Compass,
    mail: Mail,
    mapPin: MapPin,
    mountain: Mountain,
    star: Star,
    chevDown: ChevronDown,
  };
  const Icon = map[n] || Mountain;
  return <Icon size={size} {...props} style={{ flexShrink: 0, ...style }} />;
};

const ScrollContext = React.createContext({ progress: 0 });

const ScrollProvider = ({ children }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const next = (window.scrollY / max) * 100;
      setProgress(Math.min(Math.max(next, 0), 100));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <ScrollContext.Provider value={{ progress }}>{children}</ScrollContext.Provider>;
};

const ProgressBar = ({ color = "#10b981", height = 3 }) => {
  const { progress } = React.useContext(ScrollContext);
  return (
    <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height, background: "rgba(15, 23, 42, 0.08)" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: color, transition: "width 120ms ease-out" }} />
    </div>
  );
};

const Reveal = ({ children, from = "up", delay = 0, duration = 650 }) => {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);
  const transformMap = {
    left: "translate3d(-28px,0,0)",
    right: "translate3d(28px,0,0)",
    up: "translate3d(0,28px,0)",
    bottom: "translate3d(0,-28px,0)",
    scale: "scale(.94)",
  };

  React.useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0) scale(1)" : (transformMap[from] || transformMap.up),
        transition: `opacity ${duration}ms cubic-bezier(.22,1,.36,1), transform ${duration}ms cubic-bezier(.22,1,.36,1)`,
        transitionDelay: visible ? `${delay}ms` : "0ms",
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

const SH = ({ title, sub, center = true, light = false, tag }) => (
  <div className={`d-sh${center ? " d-sh--c" : ""}${light ? " d-sh--light" : ""}`}>
    {tag && <span className="d-stag">{tag}</span>}
    <h2 className="d-sh__t">{title}</h2>
    {sub && <p className="d-sh__s">{sub}</p>}
    <div className="d-sh__bar" />
  </div>
);

export default function DestinationDetail() {
  const { slug, destinationSlug, destinationId, id } = useParams();
  const navigate = useNavigate();
  const target = slug || destinationSlug || destinationId || id;

  const { destination, loading, error } = useDestination(target);
  const [heroSlide, setHeroSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState("Share");

  const gallery = useMemo(
    () =>
      destination
        ? extractUniqueImages(destination, 12).map((img) => ({
            ...img,
            url: resolveImageUrl(img?.url || img?.imageUrl || img?.image),
          }))
        : [],
    [destination]
  );
  const heroSlides = useMemo(() => {
    const preferred = [
      ...(Array.isArray(destination?.heroImages) ? destination.heroImages : []),
      destination?.heroImage,
      ...gallery.map((img) => img.url),
    ].filter(Boolean);

    return [...new Set(preferred.map((value) => {
      if (typeof value === "string") return resolveImageUrl(value);
      return resolveImageUrl(value?.imageUrl || value?.image_url || value?.url || value?.image);
    }).filter(Boolean))].slice(0, 3);
  }, [destination?.heroImages, destination?.heroImage, gallery]);

  const additionalImages = useMemo(
    () => gallery.filter((img) => !heroSlides.includes(img.url)).slice(0, 5),
    [gallery, heroSlides]
  );

  useEffect(() => {
    setHeroSlide(0);
    setLightboxIndex(null);
    setShareState("Share");
    try {
      setSaved(localStorage.getItem(`altuvera:saved-destination:${target}`) === "1");
    } catch { setSaved(false); }
  }, [target]);

  const toggleSaved = () => {
    const next = !saved;
    setSaved(next);
    try { localStorage.setItem(`altuvera:saved-destination:${target}`, next ? "1" : "0"); } catch {}
  };

  const shareDestination = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: destination?.name || "Altuvera destination", text: destination?.tagline || `Explore ${destination?.name || "this destination"} with Altuvera Safaris.`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setShareState("Copied");
      window.setTimeout(() => setShareState("Share"), 1800);
    } catch {}
  };

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);


  if (loading) {
    return (
      <div className="d-page">
        <div className="d-wrap" style={{ padding: "64px 24px" }}>
          <p>Loading destination…</p>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="d-page">
        <div className="d-wrap" style={{ padding: "64px 24px" }}>
          <h2>Destination not found</h2>
          <button className="d-btn d-btn--outline" onClick={() => navigate("/destinations")}>
            Browse destinations
          </button>
        </div>
      </div>
    );
  }

  const heroImage = heroSlides[heroSlide] || gallery[0]?.url || destination.heroImage || destination.imageUrl || destination.image || "";
  const description = destination.description || destination.shortDescription || destination.overview || "";
  const attractions = Array.isArray(destination.attractions) ? destination.attractions : [];
  const highlights = Array.isArray(destination.highlights) ? destination.highlights : [];
  const countryInfo = destination.countryObj || destination.country || {};

  const seoTitle = `${destination.name} Safari & Travel Guide | Altuvera Safaris`;
  const seoDescription = String(
    destination.seoDescription ||
    destination.metaDescription ||
    description ||
    `Explore ${destination.name} with Altuvera Safaris — curated East African wildlife, culture, nature and adventure experiences.`
  ).replace(/\s+/g, " ").trim().slice(0, 160);
  const canonicalUrl = `https://www.altuverasafaris.com/destinations/${encodeURIComponent(destination.slug || target)}`;
  const seoImages = heroSlides.slice(0, 3);
  const seoKeywords = [
    destination.name,
    destination.countryObj?.name || destination.country?.name || destination.countryName,
    "East Africa safari",
    "East Africa travel",
    "Altuvera Safaris",
  ].filter(Boolean).join(", ");
  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: seoDescription,
    url: canonicalUrl,
    touristType: ["Adventure tourists", "Safari travellers", "Cultural travellers"],
    image: seoImages,
    ...(countryInfo?.name ? { containedInPlace: { "@type": "Country", name: countryInfo.name } } : {}),
    provider: {
      "@type": "TravelAgency",
      name: "Altuvera Safaris",
      url: "https://www.altuverasafaris.com",
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://www.altuverasafaris.com/booking?destination=${encodeURIComponent(destination.slug || target)}`,
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      result: { "@type": "Reservation", name: `Plan a journey to ${destination.name}` },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Explore", item: "https://www.altuverasafaris.com/explore" },
      { "@type": "ListItem", position: 2, name: "Destinations", item: "https://www.altuverasafaris.com/destinations" },
      { "@type": "ListItem", position: 3, name: destination.name, item: canonicalUrl },
    ],
  };

  const stats = [
    destination.durationDays && { label: "Days", value: destination.durationDays },
    destination.duration && { label: "Duration", value: destination.duration },
    destination.rating && { label: "Rating", value: `${Number(destination.rating).toFixed(1)} / 5` },
    destination.bestTimeToVisit && { label: "Best time", value: destination.bestTimeToVisit },
  ].filter(Boolean);

  return (
    <ScrollProvider>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="place" />
        <meta property="og:site_name" content="Altuvera Safaris" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {seoImages.map((image, index) => (
          <React.Fragment key={`og-image-${index}`}>
            <meta property="og:image" content={image} />
            <meta property="og:image:alt" content={`${destination.name} — Altuvera Safaris destination photo ${index + 1}`} />
          </React.Fragment>
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {seoImages[0] && <meta name="twitter:image" content={seoImages[0]} />}
        <script type="application/ld+json">{JSON.stringify(destinationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <div className="d-page">
        <ProgressBar />

        <header className="d-hero">
          <div
            className="d-hero__slides"
            style={{ transform: `translate3d(-${heroSlide * 100}%,0,0)` }}
            aria-live="polite"
          >
            {heroSlides.length > 0 ? heroSlides.map((src, index) => (
              <div key={src} className={`d-hero__slide ${index === heroSlide ? "active" : ""}`}>
                <img
                  src={src}
                  alt={`${destination.name} — view ${index + 1} of ${heroSlides.length}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            )) : (
              <div className="d-hero__slide d-hero__slide--empty active">
                <Ic n="mountain" size={80} />
              </div>
            )}
          </div>

          <div className="d-hero__ov" />

          {heroSlides.length > 1 && (
            <>
              <button type="button" className="d-hero__arrow d-hero__arrow--p" onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous hero image">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="d-hero__arrow d-hero__arrow--n" onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)} aria-label="Next hero image">
                <ChevronRight size={20} />
              </button>
              <div className="d-hero__dots" aria-label="Destination hero slideshow">
                {heroSlides.map((_, index) => (
                  <button key={index} type="button" className={`d-hero__dot ${index === heroSlide ? "on" : ""}`} onClick={() => setHeroSlide(index)} aria-label={`Show hero image ${index + 1}`} />
                ))}
              </div>
              <div className="d-hero__thumbs" aria-label="Choose destination hero image">
                {heroSlides.map((src, index) => (
                  <button key={src} type="button" className={`d-hero__thumb ${index === heroSlide ? "active" : ""}`} onClick={() => setHeroSlide(index)} aria-label={`Show image ${index + 1}`}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          )}

          <nav className="d-hero__nav">
            <div className="d-wrap">
              <ol className="d-hero__crumbs">
                <li>
                  <Link to="/explore">Explore</Link>
                </li>
                <li>
                  <Link to="/destinations">Destinations</Link>
                </li>
                <li aria-current="page">{destination.name}</li>
              </ol>
            </div>
          </nav>

          <div className="d-wrap" style={{ position: "relative", zIndex: 5 }}>
            <div className="d-hero__body">
              {countryInfo?.name && (
                <div className="d-hero__loc">
                  <Ic n="mapPin" size={12} />
                  <span style={{ letterSpacing: "3px", fontSize: ".76rem", fontWeight: 700 }}>
                    {countryInfo.flagUrl && (
                      <img
                        src={countryInfo.flagUrl}
                        alt=""
                        style={{ width: 16, height: 11, objectFit: "cover", marginRight: 7, verticalAlign: "-1px" }}
                      />
                    )}
                    {String(countryInfo.name).toUpperCase()}
                  </span>
                </div>
              )}

              <span className="d-hero__eyebrow"><Sparkles size={13} /> CURATED EAST AFRICAN EXPERIENCE</span>
              <h1 className="d-hero__title">{destination.name}</h1>
              {destination.tagline && <p className="d-hero__sub">{destination.tagline}</p>}
              {description && (
                <p className="d-hero__story">
                  {description.replace(/\s+/g, " ").trim().slice(0, 220)}
                  {description.replace(/\s+/g, " ").trim().length > 220 ? "…" : ""}
                </p>
              )}

              <div className="d-hero__ctas">
                <button className="d-btn d-btn--emerald d-btn--lg" onClick={() => navigate(`/booking?destination=${destination.slug}`)}>
                  <Ic n="calendar" size={17} /> Book This Destination
                </button>
                <button className="d-btn d-btn--glass d-btn--lg" onClick={() => document.getElementById("dd-about")?.scrollIntoView({ behavior: "smooth" })}>
                  <Ic n="chevDown" size={17} /> Explore story
                </button>
                <button type="button" className="d-hero-tool" onClick={toggleSaved} aria-pressed={saved} title={saved ? "Remove from saved destinations" : "Save destination"}>
                  <span aria-hidden="true">{saved ? "♥" : "♡"}</span><span className="d-hero-tool__label">{saved ? "Saved" : "Save"}</span>
                </button>
                <button type="button" className="d-hero-tool" onClick={shareDestination} title="Share destination">
                  <span aria-hidden="true">↗</span><span className="d-hero-tool__label">{shareState}</span>
                </button>
              </div>

              {stats.length > 0 && (
                <div className="d-hero__stats">
                  {stats.map((s, i) => (
                    <div key={i} className="d-hero__stat">
                      <div className="d-hero__stat-n">{s.value}</div>
                      <div className="d-hero__stat-l">
                        <Ic
                          n={s.label === "Days" || s.label === "Duration" ? "clock" : s.label === "Rating" ? "star" : "calendar"}
                          size={12}
                          style={{ marginRight: 5, opacity: 0.7 }}
                        />
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="d-quicknav" aria-label="Destination sections">
          <div className="d-wrap d-quicknav__inner">
            <Link to="/destinations" className="d-quicknav__back"><ChevronLeft size={15} /> Destinations</Link>
            <div className="d-quicknav__links">
              <a href="#dd-about">Story</a>
              <a href="#dd-facts">Facts</a>
              {additionalImages.length > 0 && <a href="#dd-gallery">Gallery</a>}
              {highlights.length > 0 && <a href="#dd-experiences">Experiences</a>}
              <a href="#dd-plan">Plan</a>
            </div>
            <button type="button" className="d-quicknav__save" onClick={toggleSaved} aria-pressed={saved}>
              {saved ? "♥ Saved" : "♡ Save"}
            </button>
          </div>
        </nav>

        <section id="dd-about" className="d-sec d-sec--white">
          <div className="d-wrap">
            <div className="d-about">
              <div className="d-about__main">
                <Reveal from="left">
                  {destination.destinationType && (
                    <span className="d-stag">
                      <Ic n="compass" size={11} style={{ marginRight: 5 }} />
                      {destination.destinationType}
                    </span>
                  )}
                  <h2 className="d-about__title">Discover {destination.name}</h2>
                </Reveal>

                {description && (
                  <Reveal from="left" delay={60}>
                    <div className="d-prose">
                      {description.split("\n\n").filter(Boolean).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                )}

                <Reveal from="bottom" delay={180}>
                  <div className="d-about__book-row">
                    <button className="d-btn d-btn--emerald" onClick={() => navigate(`/booking?destination=${destination.slug}`)}>
                      <Ic n="calendar" size={15} /> Reserve Your Spot
                    </button>
                    <button className="d-btn d-btn--outline" onClick={() => navigate("/contact")}>
                      <Ic n="mail" size={15} /> Send Enquiry
                    </button>
                  </div>
                </Reveal>
              </div>

              <aside className="d-about__aside">
                {additionalImages.length > 0 && (
                  <Reveal from="right" delay={60}>
                    <div className="d-aside-slider d-about-photo-panel">
                      <img src={additionalImages[0].url} alt={`${destination.name} experience`} loading="lazy" />
                      <div className="d-about-photo-panel__caption">
                        <span>More of {destination.name}</span>
                        <strong>{additionalImages.length} additional photos</strong>
                      </div>
                    </div>
                  </Reveal>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section id="dd-facts" className="d-sec d-sec--soft d-facts-section">
          <div className="d-wrap">
            <Reveal from="bottom">
              <SH
                title="Your Destination at a Glance"
                sub="The essential details, thoughtfully presented before you travel."
                tag="Destination facts"
              />
            </Reveal>
            <div className="d-facts-grid">
              {[
                { icon: Clock3, label: "Typical duration", value: destination.durationDays ? `${destination.durationDays} days` : destination.duration || "Flexible" },
                { icon: Calendar, label: "Best time", value: destination.bestTimeToVisit || "Year-round" },
                { icon: Compass, label: "Experience", value: destination.destinationType || "Safari & discovery" },
                { icon: Star, label: "Guest rating", value: destination.rating ? `${Number(destination.rating).toFixed(1)} / 5` : "Highly rated" },
                { icon: MapPin, label: "Country", value: countryInfo?.name || "East Africa" },
                { icon: ShieldCheck, label: "Travel style", value: "Curated with Altuvera" },
              ].map(({ icon: Icon, label, value }, index) => (
                <Reveal key={label} from="scale" delay={index * 45}>
                  <article className="d-fact-card">
                    <div className="d-fact-card__icon"><Icon size={18} /></div>
                    <div>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {additionalImages.length > 0 && (
          <section id="dd-gallery" className="d-sec d-sec--soft d-destination-gallery">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH title="See More of the Journey" sub={`A closer look at ${destination.name}`} tag="Destination gallery" />
              </Reveal>
              <div className="d-gal-mosaic">
                {additionalImages.map((img, index) => (
                  <button
                    key={img.url}
                    type="button"
                    className={`d-gal-cell ${index === 0 ? "d-gal-cell--wide" : ""}`}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open ${destination.name} gallery image ${index + 1}`}
                  >
                    <img src={img.url} alt={img.caption || `${destination.name} gallery image ${index + 1}`} loading="lazy" />
                    <span className="d-gal-cell__ov"><span>View photo</span></span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="dd-plan" className="d-sec d-sec--white">
          <div className="d-wrap">
            <SH title={`Plan Your Visit to ${destination.name}`} sub="Useful information to help you prepare for the experience" />
            <div className="d-deepdive__grid">
              {destination.bestTimeToVisit && <div className="d-deepdive__block"><div className="d-deepdive__block-icon"><Calendar size={20}/></div><h3>Best Time to Visit</h3><p className="d-deepdive__para">{destination.bestTimeToVisit}</p></div>}
              {destination.gettingThere && <div className="d-deepdive__block"><div className="d-deepdive__block-icon"><MapPin size={20}/></div><h3>Getting There</h3><p className="d-deepdive__para">{destination.gettingThere}</p></div>}
              {destination.whatToExpect && <div className="d-deepdive__block"><div className="d-deepdive__block-icon"><Compass size={20}/></div><h3>What to Expect</h3><p className="d-deepdive__para">{destination.whatToExpect}</p></div>}
              {destination.safetyInfo && <div className="d-deepdive__block"><div className="d-deepdive__block-icon"><Star size={20}/></div><h3>Safety</h3><p className="d-deepdive__para">{destination.safetyInfo}</p></div>}
              {destination.localTips && <div className="d-deepdive__block d-deepdive__block--full"><div className="d-deepdive__block-icon"><Mountain size={20}/></div><h3>Local Tips</h3><p className="d-deepdive__para">{typeof destination.localTips === "string" ? destination.localTips : Array.isArray(destination.localTips) ? destination.localTips.join(" • ") : ""}</p></div>}
            </div>
          </div>
        </section>

        {highlights.length > 0 && (
          <section id="dd-experiences" className="d-sec d-sec--white d-experiences">
            <div className="d-wrap">
              <Reveal from="left">
                <SH
                  title={`Experiences that define ${destination.name}`}
                  sub="Go beyond sightseeing. Discover the landscapes, wildlife, culture and moments that make the journey memorable."
                  tag="The Altuvera experience"
                  center={false}
                />
              </Reveal>
              <div className="d-experience-list">
                {highlights.slice(0, 6).map((item, index) => (
                  <Reveal key={index} from={index % 2 ? "right" : "left"} delay={index * 45}>
                    <article className="d-experience-row">
                      <div className="d-experience-row__number">0{index + 1}</div>
                      <div className="d-experience-row__content">
                        <span className="d-experience-row__label"><Leaf size={13} /> Signature experience</span>
                        <h3>{item}</h3>
                        <p>Experience {item} as part of a thoughtfully planned East African journey, with space for discovery, connection and unforgettable moments.</p>
                      </div>
                      <div className="d-experience-row__icon"><Route size={22} /></div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {highlights.length > 0 && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH title={`What Makes ${destination.name} Unforgettable`} sub="Explore the highlights of this unforgettable destination" />
              </Reveal>

              <div className="d-exp-grid">
                {highlights.slice(0, 6).map((item, index) => (
                  <Reveal key={index} from="scale" delay={index * 40}>
                    <div className="d-exp-card">
                      <div className="d-exp-card__media">
                        <img src={gallery[index % Math.max(gallery.length, 1)]?.url || heroImage} alt={String(item)} loading="lazy" />
                        <div className="d-exp-card__overlay">
                          <h4 className="d-exp-card__ov-title">{item}</h4>
                          <p className="d-exp-card__ov-desc">Experience the wonder of {item}.</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {attractions.length > 0 && (
          <section className="d-sec d-sec--white">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH title="Popular Attractions" sub="Discover the moments that define this destination" />
              </Reveal>

              <div className="d-exp-grid">
                {attractions.slice(0, 6).map((attraction, index) => {
                  const name = attraction.name || attraction.title || attraction || "Attraction";
                  const image =
                    attraction.imageUrl ||
                    attraction.image_url ||
                    attraction.image ||
                    gallery[index % Math.max(gallery.length, 1)]?.url ||
                    heroImage;

                  const slug =
                    attraction.slug ||
                    String(name)
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");

                  return (
                    <Reveal key={`${name}-${index}`} from="scale" delay={index * 40}>
                      <div className="d-exp-card">
                        <div className="d-exp-card__media">
                          <img src={image} alt={String(name)} loading="lazy" />
                          <div className="d-exp-card__overlay">
                            <h4 className="d-exp-card__ov-title">{name}</h4>
                            <p className="d-exp-card__ov-desc">{attraction.description || `Explore ${name}.`}</p>
                            <div className="d-exp-card__ov-actions">
                              <Link className="d-btn d-btn--white" to={`/destinations/${destination.slug}/attractions/${slug}`}>
                                Learn more
                              </Link>
                              <Link className="d-btn d-btn--emerald" to={`/booking?destination=${encodeURIComponent(destination.slug)}&attraction=${encodeURIComponent(String(name))}`}>
                                Book now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        <section className="d-final-cta">
          <div className="d-final-cta__media">
            <img src={heroSlides[heroSlides.length > 1 ? (heroSlide + 1) % heroSlides.length : 0] || heroImage} alt="" loading="lazy" />
          </div>
          <div className="d-final-cta__overlay" />
          <div className="d-wrap d-final-cta__inner">
            <Reveal from="up">
              <span className="d-final-cta__eyebrow"><Users size={14} /> YOUR EAST AFRICAN JOURNEY STARTS HERE</span>
              <h2>Make {destination.name} part of your story.</h2>
              <p>Tell us what you want to experience. Our team will shape a thoughtful, responsive journey around your interests, timing and travel style.</p>
              <div className="d-final-cta__actions">
                <button className="d-btn d-btn--emerald d-btn--lg" onClick={() => navigate(`/booking?destination=${destination.slug}`)}>
                  <Calendar size={17} /> Plan This Journey
                </button>
                <button className="d-btn d-btn--glass d-btn--lg" onClick={() => navigate("/contact")}>
                  <Mail size={17} /> Talk to Altuvera
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {lightboxIndex !== null && additionalImages.length > 0 && (
        <div
          className="d-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${destination.name} photo gallery`}
          onClick={() => setLightboxIndex(null)}
        >
          <button type="button" className="d-lightbox__close" onClick={() => setLightboxIndex(null)} aria-label="Close photo gallery">
            <X size={22} />
          </button>
          <button
            type="button"
            className="d-lightbox__arrow d-lightbox__arrow--p"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + additionalImages.length) % additionalImages.length);
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>
          <img
            className="d-lightbox__image"
            src={additionalImages[lightboxIndex]?.url}
            alt={additionalImages[lightboxIndex]?.caption || `${destination.name} photo ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="d-lightbox__arrow d-lightbox__arrow--n"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % additionalImages.length);
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
          <div className="d-lightbox__counter">{lightboxIndex + 1} / {additionalImages.length}</div>
        </div>
      )}
    </ScrollProvider>
  );
}
