import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const Reveal = ({ children, from = "up", delay = 0, duration = 500 }) => {
  const [visible, setVisible] = React.useState(false);
  const transformMap = {
    left: "translateX(-22px)",
    right: "translateX(22px)",
    up: "translateY(22px)",
    bottom: "translateY(-22px)",
    scale: "scale(0.96)",
  };

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0) scale(1)" : (transformMap[from] || "translateY(22px)"),
        transition: `opacity ${duration}ms cubic-bezier(.22,1,.36,1), transform ${duration}ms cubic-bezier(.22,1,.36,1)`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
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

        <section className="d-sec d-sec--soft d-facts-section">
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
          <section className="d-sec d-sec--soft d-destination-gallery">
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
          <section className="d-sec d-sec--white d-experiences">
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
