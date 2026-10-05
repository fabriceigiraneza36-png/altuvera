import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
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
} from "lucide-react";
import { useDestination } from "../hooks/useDestinations";

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

  sources.push(...(Array.isArray(destination.images) ? destination.images : []));
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

const Reveal = ({ children, from = "up", delay = 0, duration = 400 }) => {
  const transformMap = {
    left: "translateX(-18px)",
    right: "translateX(18px)",
    up: "translateY(18px)",
    bottom: "translateY(-18px)",
    scale: "scale(0.98)",
  };

  return (
    <div
      style={{
        opacity: 1,
        transform: transformMap[from] || "translateY(0)",
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transitionDelay: `${delay}ms`,
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
    const preferred = [destination?.heroImage, ...(gallery.slice(0, 3).map((img) => img.url))].filter(Boolean);
    return [...new Set(preferred.map(resolveImageUrl))].slice(0, 3);
  }, [destination?.heroImage, gallery]);

  const additionalImages = useMemo(
    () => gallery.filter((img) => !heroSlides.includes(img.url)).slice(0, 5),
    [gallery, heroSlides]
  );

  useEffect(() => {
    setHeroSlide(0);
  }, [target]);

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

  const stats = [
    destination.durationDays && { label: "Days", value: destination.durationDays },
    destination.duration && { label: "Duration", value: destination.duration },
    destination.rating && { label: "Rating", value: `${Number(destination.rating).toFixed(1)} / 5` },
    destination.bestTimeToVisit && { label: "Best time", value: destination.bestTimeToVisit },
  ].filter(Boolean);

  return (
    <ScrollProvider>
      <div className="d-page">
        <ProgressBar />

        <header className="d-hero">
          <div className="d-hero__slides">
            {heroSlides.length > 0 ? heroSlides.map((src, index) => (
              <div key={src} className={`d-hero__slide ${index === heroSlide ? "active" : ""}`}>
                <img src={src} alt={`${destination.name} — view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} />
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

              <h1 className="d-hero__title">{destination.name}</h1>
              {destination.tagline && <p className="d-hero__sub">{destination.tagline}</p>}

              <div className="d-hero__ctas">
                <button className="d-btn d-btn--emerald d-btn--lg" onClick={() => navigate(`/booking?destination=${destination.slug}`)}>
                  <Ic n="calendar" size={17} /> Book This Destination
                </button>

                <button className="d-btn d-btn--glass d-btn--lg" onClick={() => document.getElementById("dd-about")?.scrollIntoView({ behavior: "smooth" })}>
                  <Ic n="chevDown" size={17} /> Explore
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

        {additionalImages.length > 0 && (
          <section className="d-sec d-sec--soft d-destination-gallery">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH title="See More of the Journey" sub={`A closer look at ${destination.name}`} tag="Destination gallery" />
              </Reveal>
              <div className="d-gal-mosaic">
                {additionalImages.map((img, index) => (
                  <button key={img.url} type="button" className={`d-gal-cell ${index === 0 ? "d-gal-cell--wide" : ""}`} onClick={() => window.dispatchEvent(new CustomEvent("altuvera:destination-lightbox", { detail: { images: [...heroSlides, ...additionalImages], index: heroSlides.length + index } }))}>
                    <img src={img.url} alt={img.caption || `${destination.name} gallery image ${index + 1}`} loading="lazy" />
                    <span className="d-gal-cell__ov"><span>{img.caption || "Explore photo"}</span></span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="d-sec d-sec--white">
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
      </div>
    </ScrollProvider>
  );
}
