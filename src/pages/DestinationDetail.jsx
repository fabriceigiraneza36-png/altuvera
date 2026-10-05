import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import { useDestination } from "../hooks/useDestination";
import { extractUniqueImages } from "../utils/extractUniqueImages";
import { Ic } from "../components/common/icons";
import { ScrollProvider, ProgressBar, Reveal, useSlideshow } from "../components/common/ScrollEffects";

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

const Lightbox = ({ images, idx, onClose, onPrev, onNext, onGoTo }) => {
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
    <div className="d-lb">
      <div className="d-lb__bd" onClick={onClose} />
      <button className="d-lb__x" onClick={onClose} aria-label="Close">
        <Ic n="x" size={18} />
      </button>

      <div className="d-lb__stage">
        <img
          src={resolveImageUrl(images[idx]?.url)}
          alt={images[idx]?.caption || ""}
          className="d-lb__img"
        />
        {images[idx]?.caption && (
          <div className="d-lb__caption-banner">
            <p className="d-lb__caption-text">{images[idx].caption}</p>
          </div>
        )}
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
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`d-lb__thumb${i === idx ? " on" : ""}`}
                  onClick={() => onGoTo && onGoTo(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={resolveImageUrl(img.url)} alt="" />
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

const Hero = ({ d, navigate }) => {
  const slides = useMemo(() => extractUniqueImages(d, 12).map(i => resolveImageUrl(i.url)), [d]);
  const { idx, goTo } = useSlideshow(slides.length, 6500);

  const stats = [
    d.durationDays && { icon: "clock", n: d.durationDays, l: "Days" },
    (d.activities || []).length > 0 && { icon: "compass", n: `${(d.activities || []).length}+`, l: "Activities" },
    d.rating && { icon: "star", n: d.rating.toFixed(1), l: "Rating" },
  ].filter(Boolean);

  return (
    <header className="d-hero">
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

      <nav className="d-hero__nav">
        <div className="d-wrap">
          <ol className="d-hero__crumbs">
            {[
              { label: "Explore", path: "/explore" },
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

      <div className="d-wrap" style={{ position: "relative", zIndex: 5 }}>
        <div className="d-hero__body">
          {d.country?.name && (
            <div className="d-hero__loc">
              <Ic n="mapPin" size={12} />
              <span style={{ letterSpacing: "3px", fontSize: ".76rem", fontWeight: 700 }}>
                {d.country.flagUrl && <img src={d.country.flagUrl} alt="" style={{ width: 16, height: 11, objectFit: "cover", marginRight: 7, verticalAlign: "-1px" }} />}
                {d.country.name.toUpperCase()}
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

      <div className="d-hero__scroll">
        <span>SCROLL</span>
        <Ic n="chevDown" size={16} cls="d-hero__bounce" />
      </div>
    </header>
  );
};

const AboutSection = ({ d, navigate }) => {
  const desc = d.description || d.shortDescription || d.overview;
  if (!desc && !d.highlights?.length) return null;

  const asideImgs = useMemo(() => extractUniqueImages(d, 8).map(i => resolveImageUrl(i.url)), [d]);

  const { idx, goTo, goNext, goPrev } = useSlideshow(asideImgs.length, 4500);

  const statCards = [
    d.country?.name && { icon: "mapPin", label: "Location", val: d.country.name, link: `/country/${d.countrySlug || d.country?.slug}` },
    d.duration && { icon: "clock", label: "Duration", val: d.duration },
    d.difficulty && { icon: "barChart", label: "Difficulty", val: d.difficulty },
    d.bestTimeToVisit && { icon: "calendar", label: "Best Season", val: d.bestTimeToVisit },
    d.rating && { icon: "star", label: "Rating", val: `${d.rating.toFixed(1)} / 5` },
    (d.minGroupSize && d.maxGroupSize) && { icon: "users", label: "Group Size", val: `${d.minGroupSize}–${d.maxGroupSize}` },
    d.altitude_meters && { icon: "mountain", label: "Altitude", val: `${d.altitude_meters} m` },
    d.nearestCity && { icon: "mapPin", label: "Nearest City", val: d.nearestCity },
  ].filter(Boolean);

  return (
    <section id="dd-about" className="d-sec d-sec--white">
      <div className="d-wrap">
        <div className="d-about">
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
                    { icon: "mapPin", label: "Country", val: d.country?.name, link: `/country/${d.countrySlug || d.country?.slug}` },
                    { icon: "clock", label: "Duration", val: d.duration || (d.durationDays ? `${d.durationDays} days` : null) },
                    { icon: "calendar", label: "Best Time", val: d.bestTimeToVisit },
                    { icon: "barChart", label: "Difficulty", val: d.difficulty },
                    { icon: "users", label: "Group", val: (d.minGroupSize && d.maxGroupSize) ? `${d.minGroupSize}–${d.maxGroupSize} people` : null },
                    { icon: "plane", label: "Airport", val: d.nearestAirport || d.howToGetThere?.nearestAirport },
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

const HighlightsSection = ({ d }) => {
  const highlights = d.highlights || [];
  const activities = d.activities || [];
  const attractions = (d.attractions || []).filter(item => item && (item.name || item.title));
  if (!highlights.length && !activities.length && !attractions.length) return null;

  const imgPool = useMemo(() => extractUniqueImages(d, 20).map(i => resolveImageUrl(i.url)), [d]);

  const items = [
    ...attractions.map((attraction, i) => ({
      text: attraction.name || attraction.title,
      type: "Attraction",
      icon: "camera",
      img: attraction.imageUrl || attraction.image_url || attraction.image || imgPool[i % Math.max(imgPool.length, 1)],
      desc: attraction.description || `Explore ${attraction.name || attraction.title}.`,
      slug: attraction.slug || (attraction.name || attraction.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })),
    ...highlights.map((h, i) => ({
      text: h,
      type: "Highlight",
      icon: "sparkles",
      img: imgPool[i % Math.max(imgPool.length, 1)],
      desc: `Experience the wonder of ${h}.`,
    })),
    ...activities.map((a, i) => ({
      text: a,
      type: "Activity",
      icon: "compass",
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
                    <div className="d-exp-card__ov-actions">
                      {item.slug && (
                        <Link className="d-btn d-btn--white" to={`/destinations/${d.slug}/attractions/${item.slug}`}>
                          Learn more
                        </Link>
                      )}
                      <Link className="d-btn d-btn--emerald" to={`/booking?destination=${encodeURIComponent(d.slug)}&attraction=${encodeURIComponent(item.text)}`}>
                        Book now
                      </Link>
                    </div>
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

const GallerySection = ({ d }) => {
  const [view, setView] = useState("mosaic");
  const [lb, setLb] =       {d.destinationType}
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
                    { icon: "mapPin", label: "Country", val: d.country?.name, link: `/country/${d.countrySlug || d.country?.slug}` },
                    { icon: "clock", label: "Duration", val: d.duration || (d.durationDays ? `${d.durationDays} days` : null) },
                    { icon: "calendar", label: "Best Time", val: d.bestTimeToVisit },
                    { icon: "barChart", label: "Difficulty", val: d.difficulty },
                    { icon: "users", label: "Group", val: (d.minGroupSize && d.maxGroupSize) ? `${d.minGroupSize}–${d.maxGroupSize} people` : null },
                    { icon: "plane", label: "Airport", val: d.nearestAirport || d.howToGetThere?.nearestAirport },
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

const HighlightsSection = ({ d }) => {
  const highlights = d.highlights || [];
  const activities = d.activities || [];
  const attractions = (d.attractions || []).filter(item => item && (item.name || item.title));
  if (!highlights.length && !activities.length && !attractions.length) return null;

  const imgPool = useMemo(() => extractUniqueImages(d, 20).map(i => resolveImageUrl(i.url)), [d]);

  const items = [
    ...attractions.map((attraction, i) => ({
      text: attraction.name || attraction.title,
      type: "Attraction",
      icon: "camera",
      img: attraction.imageUrl || attraction.image_url || attraction.image || imgPool[i % Math.max(imgPool.length, 1)],
      desc: attraction.description || `Explore ${attraction.name || attraction.title}.`,
      slug: attraction.slug || (attraction.name || attraction.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })),
    ...highlights.map((h, i) => ({
      text: h,
      type: "Highlight",
      icon: "sparkles",
      img: imgPool[i % Math.max(imgPool.length, 1)],
      desc: `Experience the wonder of ${h}.`,
    })),
    ...activities.map((a, i) => ({
      text: a,
      type: "Activity",
      icon: "compass",
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
                    <div className="d-exp-card__ov-actions">
                      {item.slug && (
                        <Link className="d-btn d-btn--white" to={`/destinations/${d.slug}/attractions/${item.slug}`}>
                          Learn more
                        </Link>
                      )}
                      <Link className="d-btn d-btn--emerald" to={`/booking?destination=${encodeURIComponent(d.slug)}&attraction=${encodeURIComponent(item.text)}`}>
                        Book now
                      </Link>
                    </div>
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

const GallerySection = ({ d }) => {
  const [view, setView] = useState("mosaic");
  const [lb, setLb] =
