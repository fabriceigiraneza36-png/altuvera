destination.heroImageimport React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import { extractUniqueImages } from "../utils/extractUniqueImages";
import { Ic } from "../components/common/icons";
import { ScrollProvider, ProgressBar, Reveal } from "../components/common/ScrollEffects";

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

const SH = ({ title, sub, center = true, light = false, tag }) => (
  <div className={`d-sh${center ? " d-sh--c" : ""}${light ? " d-sh--light" : ""}`}>
    {tag && <span className="d-stag">{tag}</span>}
    <h2 className="d-sh__t">{title}</h2>
    {sub && <p className="d-sh__s">{sub}</p>}
    <div className="d-sh__bar" />
  </div>
);

export default function DestinationDetail() {
  const { slug, destinationSlug, id } = useParams();
  const navigate = useNavigate();
  const target = slug || destinationSlug || id;

  const { destination, loading, error } = useDestination(target);

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

  const heroImage =
    gallery[0]?.url ||
    destination.heroImage ||
    destination.imageUrl ||
    destination.image ||
    "";

  const description =
    destination.description ||
    destination.shortDescription ||
    destination.overview ||
    "";

  const attractions = Array.isArray(destination.attractions) ? destination.attractions : [];
  const highlights = Array.isArray(destination.highlights) ? destination.highlights : [];

  const stats = [
    destination.durationDays && { label: "Days", value: destination.durationDays },
    destination.duration && { label: "Duration", value: destination.duration },
    destination.rating && { label: "Rating", value: `${destination.rating.toFixed(1)} / 5` },
    destination.bestTimeToVisit && { label: "Best time", value: destination.bestTimeToVisit },
  ].filter(Boolean);

  return (
    <ScrollProvider>
      <div className="d-page">
        <ProgressBar />

        <header className="d-hero">
          <div className="d-hero__slides">
            {heroImage ? (
              <div className="d-hero__slide active">
                <img src={heroImage} alt={destination.name} loading="eager" />
              </div>
            ) : (
              <div className="d-hero__slide d-hero__slide--empty active">
                <Ic n="mountain" size={80} />
              </div>
            )}
          </div>

          <div className="d-hero__ov" />

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
              {destination.country?.name && (
                <div className="d-hero__loc">
                  <Ic n="mapPin" size={12} />
                  <span style={{ letterSpacing: "3px", fontSize: ".76rem", fontWeight: 700 }}>
                    {destination.country.flagUrl && (
                      <img
                        src={destination.country.flagUrl}
                        alt=""
                        style={{
                          width: 16,
                          height: 11,
                          objectFit: "cover",
                          marginRight: 7,
                          verticalAlign: "-1px",
                        }}
                      />
                    )}
                    {destination.country.name.toUpperCase()}
                  </span>
                </div>
              )}

              <h1 className="d-hero__title">{destination.name}</h1>
              {destination.tagline && <p className="d-hero__sub">{destination.tagline}</p>}

              <div className="d-hero__ctas">
                <button
                  className="d-btn d-btn--emerald d-btn--lg"
                  onClick={() => navigate(`/booking?destination=${destination.slug}`)}
                >
                  <Ic n="calendar" size={17} /> Book This Destination
                </button>

                <button
                  className="d-btn d-btn--glass d-btn--lg"
                  onClick={() =>
                    document.getElementById("dd-about")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
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
                          n={
                            s.label === "Days" || s.label === "Duration"
                              ? "clock"
                              : s.label === "Rating"
                              ? "star"
                              : "calendar"
                          }
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
                    <button
                      className="d-btn d-btn--emerald"
                      onClick={() => navigate(`/booking?destination=${destination.slug}`)}
                    >
                      <Ic n="calendar" size={15} /> Reserve Your Spot
                    </button>
                    <button className="d-btn d-btn--outline" onClick={() => navigate("/contact")}>
                      <Ic n="mail" size={15} /> Send Enquiry
                    </button>
                  </div>
                </Reveal>
              </div>

              <aside className="d-about__aside">
                {gallery.length > 0 && (
                  <Reveal from="right" delay={60}>
                    <div className="d-aside-slider">
                      <div className="d-aside-slider__track">
                        {gallery.map((img, index) => (
                          <div key={index} className="d-aside-slider__slide active">
                            <img
                              src={img.url}
                              alt={`${destination.name} ${index + 1}`}
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}
              </aside>
            </div>
          </div>
        </section>

        {highlights.length > 0 && (
          <section className="d-sec d-sec--soft">
            <div className="d-wrap">
              <Reveal from="bottom">
                <SH
                  title={`What Makes ${destination.name} Unforgettable`}
                  sub="Explore the highlights of this unforgettable destination"
                />
              </Reveal>

              <div className="d-exp-grid">
                {highlights.slice(0, 6).map((item, index) => (
                  <Reveal key={index} from="scale" delay={index * 40}>
                    <div className="d-exp-card">
                      <div className="d-exp-card__media">
                        <img
                          src={gallery[index % Math.max(gallery.length, 1)]?.url || heroImage}
                          alt={String(item)}
                          loading="lazy"
                        />
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
                <SH
                  title="Popular Attractions"
                  sub="Discover the moments that define this destination"
                />
              </Reveal>

              <div className="d-exp-grid">
                {attractions.slice(0, 6).map((attraction, index) => {
                  const name = attraction.name || attraction.title || "Attraction";
                  const image =
                    attraction.imageUrl ||
                    attraction.image_url ||
                    attraction.image ||
                    gallery[index % Math.max(gallery.length, 1)]?.url ||
                    heroImage;

                  const slug =
                    attraction.slug ||
                    name
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "");

                  return (
                    <Reveal key={`${name}-${index}`} from="scale" delay={index * 40}>
                      <div className="d-exp-card">
                        <div className="d-exp-card__media">
                          <img src={image} alt={name} loading="lazy" />
                          <div className="d-exp-card__overlay">
                            <h4 className="d-exp-card__ov-title">{name}</h4>
                            <p className="d-exp-card__ov-desc">
                              {attraction.description || `Explore ${name}.`}
                            </p>
                            <div className="d-exp-card__ov-actions">
                              <Link
                                className="d-btn d-btn--white"
                                to={`/destinations/${destination.slug}/attractions/${slug}`}
                              >
                                Learn more
                              </Link>

                              <Link
                                className="d-btn d-btn--emerald"
                                to={`/booking?destination=${encodeURIComponent(destination.slug)}&attraction=${encodeURIComponent(name)}`}
                              >
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
          }ation" />
              </Reveal>

              <div className="d-exp-grid">
                {attractions.slice(0, 6).map((attraction, index) => {
                  const name = attraction.name || attraction.title || "Attraction";
                  const image = attraction.imageUrl || attraction.image_url || attraction.image || gallery[index % Math.max(gallery.length, 1)]?.url || heroImage;
                  const slug = attraction.slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

                  return (
                    <Reveal key={`${name}-${index}`} from="scale" delay={index * 40}>
                      <div className="d-exp-card">
                        <div className="d-exp-card__media">
                          <img src={image} alt={name} loading="lazy" />
                          <div className="d-exp-card__overlay">
                            <h4 className="d-exp-card__ov-title">{name}</h4>
                            <p className="d-exp-card__ov-desc">{attraction.description || `Explore ${name}.`}</p>
                            <div className="d-exp-card__ov-actions">
                              <Link className="d-btn d-btn--white" to={`/destinations/${destination.slug}/attractions/${slug}`}>Learn more</Link>
                              <Link className="d-btn d-btn--emerald" to={`/booking?destination=${encodeURIComponent(destination.slug)}&attraction=${encodeURIComponent(name)}`}>Book now</Link>
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
