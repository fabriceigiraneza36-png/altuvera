import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Calendar,
  Camera,
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
  ArrowDown,
  Share2,
  Heart,
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

const canonicalImageKey = (value) => {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, API_URL);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return raw.replace(/\/+$/, "");
  }
};

const extractUniqueImages = (destination, limit = Number.POSITIVE_INFINITY) => {
  if (!destination) return [];
  const result = [];
  const seen = new Set();
  const add = (value, depth = 0) => {
    if (!value || depth > 4) return;
    if (typeof value === "string") {
      const clean = value.trim();
      const key = canonicalImageKey(clean);
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push({ url: clean });
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => add(entry, depth + 1));
      return;
    }
    if (typeof value === "object") {
      const direct = value.url || value.imageUrl || value.image_url || value.image || value.src ||
        value.thumbnailUrl || value.thumbnail_url || value.secure_url || value.originalUrl || value.original_url;
      if (direct) add(direct, depth + 1);
      ["images", "gallery", "galleryImages", "gallery_images", "photos", "media", "items", "attractionImages", "attraction_images", "attractionsImages", "attractions_images"].forEach((key) => {
        if (value[key]) add(value[key], depth + 1);
      });
    }
  };
  [
    destination.heroImages, destination.hero_images, destination.heroSlides, destination.hero_slides,
    destination.bannerSlides, destination.banner_slides, destination.images, destination.image_urls,
    destination.imageUrls, destination.gallery, destination.galleryImages, destination.gallery_images,
    destination.photos, destination.media, destination.attractions,
    destination.attractionImages, destination.attraction_images, destination.attractionsImages, destination.attractions_images, destination.attractionGallery, destination.attraction_gallery,
    destination.heroImage, destination.hero_image, destination.coverImageUrl, destination.cover_image_url,
    destination.imageUrl, destination.image_url, destination.image, destination.thumbnailUrl, destination.thumbnail_url,
  ].forEach((source) => add(source));
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
    camera: Camera,
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

const SH = ({ title, sub, center = true, light = false }) => (
  <div className={`d-sh${center ? " d-sh--c" : ""}${light ? " d-sh--light" : ""}`}>
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
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxControlsVisible, setLightboxControlsVisible] = useState(true);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const touchStartRef = useRef(null);
  const pinchStartRef = useRef(null);
  const lastTapRef = useRef(0);
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState("Share");

  const gallery = useMemo(
    () =>
      destination
        ? extractUniqueImages(destination).map((img) => ({
            ...img,
            url: resolveImageUrl(img?.url || img?.imageUrl || img?.image),
          }))
        : [],
    [destination]
  );
  const heroSlides = useMemo(() => {
    const heroSources = [
      ...(Array.isArray(destination?.heroImages) ? destination.heroImages : []),
      ...(Array.isArray(destination?.hero_images) ? destination.hero_images : []),
      ...(Array.isArray(destination?.heroSlides) ? destination.heroSlides : []),
      ...(Array.isArray(destination?.hero_slides) ? destination.hero_slides : []),
      ...(Array.isArray(destination?.bannerSlides) ? destination.bannerSlides : []),
      ...(Array.isArray(destination?.banner_slides) ? destination.banner_slides : []),
      destination?.heroImage,
      destination?.hero_image,
    ].filter(Boolean);
    const normalize = (value) => resolveImageUrl(
      typeof value === "string" ? value :
      value?.imageUrl || value?.image_url || value?.url || value?.image || value?.src || value?.thumbnailUrl || value?.thumbnail_url
    );
    const explicit = [...new Set(heroSources.map(normalize).filter(Boolean))];
    const fallback = normalize(destination?.coverImageUrl || destination?.cover_image_url || destination?.imageUrl || destination?.image_url || destination?.thumbnailUrl || destination?.thumbnail_url);
    const photos = gallery.map((img) => img.url).filter(Boolean);
    const slides = explicit.length ? [...explicit] : (fallback ? [fallback] : []);
    if (slides.length < 2) photos.forEach((url) => { if (!slides.includes(url)) slides.push(url); });
    return [...new Set(slides)].slice(0, 10);
  }, [destination, gallery]);

  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    setHeroSlide(0);
  }, [target]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const additionalImages = useMemo(
    () => gallery.filter((img) => !heroSlides.includes(img.url)),
    [gallery, heroSlides]
  );

  useEffect(() => {
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

  const heroImage = heroSlides[0] || gallery[0]?.url || destination.heroImage || destination.imageUrl || destination.image || "";
  const description = destination.description || destination.shortDescription || destination.overview || "";
  const attractions = Array.isArray(destination.attractions) ? destination.attractions : [];
  const attractionImages = [...new Map(
    [
      ...(Array.isArray(destination.attractionImages) ? destination.attractionImages : []),
      ...(Array.isArray(destination.attraction_images) ? destination.attraction_images : []),
      ...(Array.isArray(destination.attractionsImages) ? destination.attractionsImages : []),
      ...(Array.isArray(destination.attractions_images) ? destination.attractions_images : []),
      ...attractions.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        return [
          ...(Array.isArray(item.images) ? item.images : []),
          ...(Array.isArray(item.gallery) ? item.gallery : []),
          ...(Array.isArray(item.photos) ? item.photos : []),
          item.imageUrl || item.image_url || item.image || item.url || item.src,
        ].filter(Boolean);
      }),
    ].map((item) => {
      const url = resolveImageUrl(typeof item === "string" ? item :
        item?.imageUrl || item?.image_url || item?.url || item?.image || item?.src ||
        item?.secure_url || item?.originalUrl || item?.original_url || item?.thumbnailUrl || item?.thumbnail_url);
      return url ? [url, { url, caption: typeof item === "object" ? item.caption || item.title || item.name || "" : "" }] : null;
    }).filter(Boolean)
  ).values()];
  // Use one canonical, de-duplicated image collection for the count and gallery.
  // Include hero/cover images as well as additional and attraction-specific photos.
  const attractionGalleryImages = [...new Map(
    [...gallery, ...attractionImages]
      .map((img) => ({
        ...img,
        url: resolveImageUrl(img?.url || img?.imageUrl || img?.image_url || img?.image || img?.src),
      }))
      .filter((img) => img?.url)
      .map((img) => [img.url, img])
  ).values()];
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
          <div className="d-hero__slides" aria-hidden="true">
            {heroSlides.length > 0 ? (
              heroSlides.map((image, index) => (
                <div
                  key={`hero-slide-${image}-${index}`}
                  className={`d-hero__slide${index === heroSlide ? " active" : ""}`}
                >
                  <img
                    src={image}
                    alt=""
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="d-hero__slide d-hero__slide--empty" />
            )}
          </div>
          <div className="d-hero__ov" />
          <div className="d-hero__fog" aria-hidden="true">
            <div className="d-hero__fog-layer d-hero__fog-layer--1" />
            <div className="d-hero__fog-layer d-hero__fog-layer--2" />
          </div>
          <div className="d-hero__fog-bottom" aria-hidden="true" />
          <div className="d-hero__grain" aria-hidden="true" />

          <div className="d-wrap d-hero__clean-wrap">
            <div className="d-hero__body">
              <span className="d-hero__eyebrow">
                <MapPin size={14} /> {countryInfo?.name || "East Africa"}
              </span>
              <h1 className="d-hero__title">{destination.name}</h1>
              {destination.tagline && <p className="d-hero__sub">{destination.tagline}</p>}
              <div className="d-hero__ctas" aria-label="Destination actions">
                <button className="d-btn d-btn--emerald d-btn--lg" onClick={() => navigate(`/booking?destination=${encodeURIComponent(destination.slug || target)}`)}>
                  <Calendar size={18} /> Book This Destination
                </button>
                <button type="button" className="d-hero-tool d-hero-tool--share" onClick={shareDestination}>
                  <Share2 size={17} /> <span>{shareState}</span>
                </button>
              </div>
            </div>
          </div>
          <span className="d-hero__photo-count" aria-label={`${attractionGalleryImages.length} destination photos`}>
            <Camera size={16} /> {attractionGalleryImages.length} {attractionGalleryImages.length === 1 ? "photo" : "photos"}
          </span>
          <a className="d-hero__scroll-link" href="#dd-about" aria-label="Scroll down to destination details">
            <span>Scroll to explore</span><ArrowDown size={17} className="d-hero__scroll-icon" />
          </a>
        </header>

        <nav className="d-quicknav" aria-label="Destination sections">
          <div className="d-wrap d-quicknav__inner">
            <Link to="/destinations" className="d-quicknav__back"><ChevronLeft size={15} /> Destinations</Link>
            <div className="d-quicknav__links">
              <a href="#dd-about">Story</a>
              <a href="#dd-facts">Facts</a>
              {attractionGalleryImages.length > 0 && <a href="#dd-attraction-gallery">Gallery</a>}
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
                {destination.shortDescription && destination.shortDescription !== description && (
                  <Reveal from="left" delay={90}>
                    <div className="d-prose">
                      <h3>In brief</h3>
                      {destination.shortDescription.split("\n\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                  </Reveal>
                )}
                {destination.overview && destination.overview !== description && (
                  <Reveal from="left" delay={120}>
                    <div className="d-prose">
                      <h3>Destination overview</h3>
                      {destination.overview.split("\n\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
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
                        <strong>{gallery.length} photos in the destination gallery</strong>
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

        {attractionGalleryImages.length > 0 && (
          <section id="dd-attraction-gallery" className="d-sec d-sec--soft d-destination-gallery">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH title="Explore More Attractions" sub={`Discover more sights and experiences at ${destination.name}`} />
              </Reveal>
              <div className="d-gal-mosaic">
                {attractionGalleryImages.map((img, index) => (
                  <button
                    key={img.url}
                    type="button"
                    className={`d-gal-cell ${index === 0 ? "d-gal-cell--wide" : ""}`}
                    onClick={() => { setLightboxIndex(index); setLightboxZoom(1); setLightboxControlsVisible(false); }}
                    aria-label={`Open ${destination.name} attraction photo ${index + 1}`}
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

        {[
          ["Nearest city", destination.nearestCity],
          ["Nearest airport", destination.nearestAirport],
          ["Address", destination.address],
          ["Altitude", destination.altitudeMeters != null ? `${destination.altitudeMeters.toLocaleString()} m` : null],
          ["Distance from airport", destination.distanceFromAirportKm != null ? `${destination.distanceFromAirportKm} km` : null],
          ["Duration", destination.duration || (destination.durationDays ? `${destination.durationDays} days` : null)],
          ["Nights", destination.durationNights != null && destination.durationNights > 0 ? destination.durationNights : null],
          ["Entrance fee", destination.entranceFee],
          ["Operating hours", destination.operatingHours],
          ["Minimum age", destination.minAge != null ? `${destination.minAge}+` : null],
          ["Group size", destination.maxGroupSize ? `${destination.minGroupSize || 1}–${destination.maxGroupSize} guests` : (destination.minGroupSize ? `From ${destination.minGroupSize} guests` : null)],
          ["Fitness level", destination.fitnessLevel],
          ["Category", destination.category],
          ["Classification", destination.classification],
          ["Coordinates", destination.latitude != null && destination.longitude != null ? `${destination.latitude}, ${destination.longitude}` : null],
        ].filter(([, value]) => value !== null && value !== undefined && value !== "").length > 0 && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <SH title="Practical destination details" sub="Useful specifics to help you plan confidently." />
              <div className="d-facts-grid">
                {[
                  ["Nearest city", destination.nearestCity],
                  ["Nearest airport", destination.nearestAirport],
                  ["Address", destination.address],
                  ["Altitude", destination.altitudeMeters != null ? `${destination.altitudeMeters.toLocaleString()} m` : null],
                  ["Distance from airport", destination.distanceFromAirportKm != null ? `${destination.distanceFromAirportKm} km` : null],
                  ["Duration", destination.duration || (destination.durationDays ? `${destination.durationDays} days` : null)],
                  ["Nights", destination.durationNights != null && destination.durationNights > 0 ? destination.durationNights : null],
                  ["Entrance fee", destination.entranceFee],
                  ["Operating hours", destination.operatingHours],
                  ["Minimum age", destination.minAge != null ? `${destination.minAge}+` : null],
                  ["Group size", destination.maxGroupSize ? `${destination.minGroupSize || 1}–${destination.maxGroupSize} guests` : (destination.minGroupSize ? `From ${destination.minGroupSize} guests` : null)],
                  ["Fitness level", destination.fitnessLevel],
                  ["Category", destination.category],
                  ["Classification", destination.classification],
                  ["Coordinates", destination.latitude != null && destination.longitude != null ? `${destination.latitude}, ${destination.longitude}` : null],
                ].filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => (
                  <article key={label} className="d-fact-card">
                    <div className="d-fact-card__icon"><MapPin size={18}/></div>
                    <div><span>{label}</span><strong style={{whiteSpace:"normal",overflowWrap:"anywhere"}}>{String(value)}</strong></div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

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
                {highlights.map((item, index) => (
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

        {Array.isArray(destination.activities) && destination.activities.length > 0 && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <SH title="Activities" sub={`Things you can experience at ${destination.name}`} />
              <div className="d-facts-grid">
                {destination.activities.map((activity, index) => {
                  const label = typeof activity === "string" ? activity : activity?.name || activity?.title || activity?.label || "";
                  const detail = typeof activity === "object" ? activity?.description || activity?.details : "";
                  if (!label) return null;
                  return <article key={`${label}-${index}`} className="d-fact-card"><div className="d-fact-card__icon"><Compass size={18}/></div><div><span>Activity</span><strong style={{whiteSpace:"normal",overflowWrap:"anywhere"}}>{label}</strong>{detail && <p style={{marginTop:6,color:"#64748b",lineHeight:1.6}}>{detail}</p>}</div></article>;
                })}
              </div>
            </div>
          </section>
        )}

        {Array.isArray(destination.wildlife) && destination.wildlife.length > 0 && (
          <section className="d-sec d-sec--white">
            <div className="d-wrap">
              <SH title="Wildlife & nature" sub={`Nature highlights around ${destination.name}`} />
              <div className="d-chips" style={{display:"flex",flexWrap:"wrap",gap:10}}>
                {destination.wildlife.map((item, index) => <span key={index} className="d-chip" style={{display:"inline-flex",padding:"9px 13px",borderRadius:999,background:"#ecfdf5",border:"1px solid #a7f3d0",color:"#065f46",whiteSpace:"normal"}}>{typeof item === "string" ? item : item?.name || item?.title || JSON.stringify(item)}</span>)}
              </div>
            </div>
          </section>
        )}

        {Array.isArray(destination.itinerary) && destination.itinerary.length > 0 && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <SH title="Suggested itinerary" sub={`Explore ${destination.name} day by day`} />
              <div className="d-deepdive__grid">
                {destination.itinerary.map((day, index) => <article key={day.id || index} className="d-deepdive__block"><div className="d-deepdive__block-icon"><Calendar size={20}/></div><h3>{day.title || `Day ${day.dayNumber || index + 1}`}</h3>{day.description && <p className="d-deepdive__para">{day.description}</p>}{Array.isArray(day.activities) && day.activities.length > 0 && <p className="d-deepdive__para">{day.activities.join(" · ")}</p>}{day.accommodation && <p className="d-deepdive__para"><strong>Accommodation:</strong> {day.accommodation}</p>}</article>)}
              </div>
            </div>
          </section>
        )}

        {Array.isArray(destination.faqs) && destination.faqs.length > 0 && (
          <section className="d-sec d-sec--white">
            <div className="d-wrap">
              <SH title="Frequently asked questions" sub={`Helpful answers before visiting ${destination.name}`} />
              <div className="d-deepdive__grid">
                {destination.faqs.map((faq, index) => <article key={faq.id || index} className="d-deepdive__block"><h3>{faq.question || faq.title || `Question ${index + 1}`}</h3><p className="d-deepdive__para">{faq.answer || faq.description || ""}</p></article>)}
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
                {attractions.map((attraction, index) => {
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
            <img src={heroImage} alt="" loading="lazy" />
          </div>
          <div className="d-final-cta__overlay" />
          <div className="d-wrap d-final-cta__inner">
            <Reveal from="up">
              <span className="d-final-cta__eyebrow"><Users size={14} /> YOUR EAST AFRICAN JOURNEY STARTS HERE</span>
              <h2>Make {destination.name} part of your story.</h2>
              <p>Tell us what you want to experience. Our team will shape a thoughtful, responsive journey around your interests, timing and travel style.</p>
              <div className="d-final-cta__actions">
                <button className="d-btn d-btn--emerald d-btn--lg" onClick={() => navigate(`/booking?destination=${encodeURIComponent(destination.slug || target)}`)}>
                  <Calendar size={17} /> Plan This Journey
                </button>
                <button type="button" className="d-btn d-btn--glass d-btn--lg d-save-destination" onClick={toggleSaved} aria-pressed={saved}>
                  <Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved to favorites" : "Save Destination"}
                </button>
                <button className="d-btn d-btn--glass d-btn--lg" onClick={() => navigate("/contact")}>
                  <Mail size={17} /> Talk to Altuvera
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {lightboxIndex !== null && attractionGalleryImages.length > 0 && (
        <div
          className={`d-lightbox ${lightboxControlsVisible ? "d-lightbox--controls" : "d-lightbox--quiet"}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${destination.name} photo stories`}
          onClick={() => setLightboxControlsVisible((visible) => !visible)}
          onTouchStart={(event) => {
            if (event.touches.length === 2) {
              const dx = event.touches[0].clientX - event.touches[1].clientX;
              const dy = event.touches[0].clientY - event.touches[1].clientY;
              pinchStartRef.current = { distance: Math.hypot(dx, dy), zoom: lightboxZoom };
              touchStartRef.current = null;
            } else if (event.touches.length === 1) {
              touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now() };
            }
          }}
          onTouchMove={(event) => {
            if (event.touches.length === 2 && pinchStartRef.current) {
              event.preventDefault();
              const dx = event.touches[0].clientX - event.touches[1].clientX;
              const dy = event.touches[0].clientY - event.touches[1].clientY;
              const distance = Math.hypot(dx, dy);
              setLightboxZoom(Math.max(1, Math.min(4, pinchStartRef.current.zoom * distance / Math.max(1, pinchStartRef.current.distance))));
            }
          }}
          onTouchEnd={(event) => {
            if (pinchStartRef.current && event.touches.length < 2) { pinchStartRef.current = null; return; }
            const start = touchStartRef.current;
            if (!start || lightboxZoom > 1.02) { touchStartRef.current = null; return; }
            const changed = event.changedTouches?.[0];
            if (!changed) return;
            const dx = changed.clientX - start.x;
            const dy = changed.clientY - start.y;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              setLightboxIndex((index) => (index + (dx < 0 ? 1 : -1) + attractionGalleryImages.length) % attractionGalleryImages.length);
              setLightboxZoom(1);
              setLightboxControlsVisible(true);
            } else if (Math.abs(dy) > 100 && dy > 0) { setLightboxIndex(null); setLightboxZoom(1); }
            touchStartRef.current = null;
          }}
          onWheel={(event) => {
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              setLightboxZoom((zoom) => Math.max(1, Math.min(4, zoom + (event.deltaY < 0 ? 0.15 : -0.15))));
            }
          }}
        >
          <div className="d-story__backdrop" style={{ backgroundImage: `url("${attractionGalleryImages[lightboxIndex]?.url}")` }} />
          <div className="d-story__progress" aria-hidden="true">
            {attractionGalleryImages.map((_, index) => <span key={index} className={index === lightboxIndex ? "is-active" : index < lightboxIndex ? "is-seen" : ""}><i /></span>)}
          </div>
          <button type="button" className="d-lightbox__close d-story__control" onClick={(event) => { event.stopPropagation(); setLightboxIndex(null); setLightboxZoom(1); }} aria-label="Close photo stories"><X size={22} /></button>
          {attractionGalleryImages.length > 1 && <div className="d-story__side d-story__side--previous" aria-hidden="true"><img src={attractionGalleryImages[(lightboxIndex - 1 + attractionGalleryImages.length) % attractionGalleryImages.length]?.url} alt="" /></div>}
          {attractionGalleryImages.length > 1 && <div className="d-story__side d-story__side--next" aria-hidden="true"><img src={attractionGalleryImages[(lightboxIndex + 1) % attractionGalleryImages.length]?.url} alt="" /></div>}
          <button type="button" className="d-lightbox__arrow d-lightbox__arrow--p d-story__control" onClick={(event) => { event.stopPropagation(); setLightboxIndex((index) => (index - 1 + attractionGalleryImages.length) % attractionGalleryImages.length); setLightboxZoom(1); setLightboxControlsVisible(true); }} aria-label="Previous photo"><ChevronLeft size={26} /></button>
          <div key={`${attractionGalleryImages[lightboxIndex]?.url || lightboxIndex}-${lightboxIndex % 10}`} className={`d-story__frame d-story__transition-${lightboxIndex % 10}`}>
            <img
              className="d-lightbox__image d-story__image"
              src={attractionGalleryImages[lightboxIndex]?.url}
              alt={attractionGalleryImages[lightboxIndex]?.caption || `${destination.name} attraction photo ${lightboxIndex + 1}`}
              style={{ transform: `scale(${lightboxZoom})`, touchAction: "pan-y pinch-zoom" }}
              onClick={(event) => {
                event.stopPropagation();
                const now = Date.now();
                if (now - lastTapRef.current < 320) setLightboxZoom((zoom) => zoom > 1 ? 1 : 2.2);
                else setLightboxControlsVisible((visible) => !visible);
                lastTapRef.current = now;
              }}
              onDoubleClick={(event) => { event.stopPropagation(); setLightboxZoom((zoom) => zoom > 1 ? 1 : 2.2); }}
              draggable={false}
            />
          </div>
          <button type="button" className="d-lightbox__arrow d-lightbox__arrow--n d-story__control" onClick={(event) => { event.stopPropagation(); setLightboxIndex((index) => (index + 1) % attractionGalleryImages.length); setLightboxZoom(1); setLightboxControlsVisible(true); }} aria-label="Next photo"><ChevronRight size={26} /></button>
          <div className="d-lightbox__counter d-story__counter">{lightboxIndex + 1} <span>/</span> {attractionGalleryImages.length}{attractionGalleryImages[lightboxIndex]?.caption ? <small>{attractionGalleryImages[lightboxIndex].caption}</small> : null}</div>
          {lightboxZoom > 1 && <button type="button" className="d-story__zoom-reset" onClick={(event) => { event.stopPropagation(); setLightboxZoom(1); }} aria-label="Reset zoom">Reset zoom · {Math.round(lightboxZoom * 100)}%</button>}
        </div>
      )}
    </ScrollProvider>
  );
}
