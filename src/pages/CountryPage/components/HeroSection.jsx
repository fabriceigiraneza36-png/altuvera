// src/pages/CountryPage/components/HeroSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiGlobe, FiAward, FiTrendingUp, FiStar, FiCamera,
  FiCompass, FiArrowRight,
} from "react-icons/fi";

export default function HeroSection({ country, hero, flag, region, tagline, destsCount, rating, slug }) {
  const [slide, setSlide] = useState(0);

  const allImgs = useMemo(() => {
    const imgs = [];
    if (hero) imgs.push(hero);
    if (Array.isArray(country.images)) imgs.push(...country.images.filter(Boolean));
    if (Array.isArray(country.gallery)) {
      country.gallery.forEach(g => {
        const u = typeof g === "string" ? g : g?.url || g?.src || "";
        if (u) imgs.push(u);
      });
    }
    return [...new Set(imgs)].slice(0, 5);
  }, [country, hero]);

  useEffect(() => {
    if (allImgs.length <= 1) return;
    const iv = setInterval(() => setSlide(p => (p + 1) % allImgs.length), 7000);
    return () => clearInterval(iv);
  }, [allImgs.length]);

  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));

  return (
    <header className="cpx-hero">
      <div className="cpx-hero__slides">
        {allImgs.length > 0 ? allImgs.map((img, i) => (
          <div key={i} className={`cpx-hero__slide ${slide === i ? "active" : ""}`}>
            <img src={img} alt={country.name} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        )) : (
          <div className="cpx-hero__slide active cpx-hero__slide--empty">
            <FiGlobe size={140} style={{ color: "rgba(255,255,255,.06)" }} />
          </div>
        )}
      </div>
      <div className="cpx-hero__ov1" />
      <div className="cpx-hero__ov2" />
      <div className="cpx-hero__ov3" />

      {allImgs.length > 1 && (
        <div className="cpx-hero__dots">
          {allImgs.map((_, i) => (
            <button key={i} className={`cpx-hero__dot ${slide === i ? "active" : ""}`}
              onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      <nav className="cpx-hero__nav" aria-label="Breadcrumb">
        <div className="cpx-wrap">
          <ol className="cpx-hero__crumbs">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li aria-current="page">{country.name}</li>
          </ol>
        </div>
      </nav>

      <div className="cpx-hero__body">
        <div className="cpx-wrap">
          <div className="cpx-hero__inner">
            {region && (
              <div className="cpx-hero__region">
                <span className="cpx-hero__region-dot" />
                <FiGlobe size={11} /> {region}
              </div>
            )}
            <div className="cpx-hero__chips">
              {country.isFeatured && (
                <span className="cpx-chip cpx-chip--gold"><FiAward size={11} /> Featured</span>
              )}
              {country.isPopular && (
                <span className="cpx-chip cpx-chip--green"><FiTrendingUp size={11} /> Popular</span>
              )}
            </div>
            <h1 className="cpx-hero__title">{country.name}</h1>
            {tagline && <p className="cpx-hero__tagline">{tagline}</p>}
            <div className="cpx-hero__meta">
              {rating != null && (
                <span className="cpx-chip cpx-chip--dark">
                  <FiStar size={12} style={{ color: "#fbbf24" }} />
                  <strong>{Number(rating).toFixed(1)}</strong>
                  <span style={{ opacity: .6 }}>Rating</span>
                </span>
              )}
              {destsCount != null && (
                <span className="cpx-chip cpx-chip--dark">
                  <FiCamera size={12} />
                  <strong>{destsCount}</strong>
                  <span style={{ opacity: .6 }}>Destinations</span>
                </span>
              )}
            </div>
            <div className="cpx-hero__ctas">
              <Link to={`/country/${slug}/destinations`} className="cpx-btn cpx-btn--primary cpx-btn--lg">
                <FiCompass size={16} /> Explore Destinations <FiArrowRight size={15} />
              </Link>
              <button className="cpx-btn cpx-btn--ghost cpx-btn--lg"
                onClick={() => document.getElementById("cpx-overview")?.scrollIntoView({ behavior: "smooth" })}>
                Discover More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="cpx-hero__flag" aria-hidden="true">
        {isFlagUrl ? <img src={flag} alt="flag" /> :
         isFlagEmoji ? <span>{flag}</span> :
         <FiGlobe size={30} color="#fff" />}
      </div>

      <div className="cpx-hero__scroll" aria-hidden="true">
        <div className="cpx-hero__scroll-line" />
        <span className="cpx-hero__scroll-label">Scroll</span>
      </div>
    </header>
  );
}