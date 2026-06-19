// src/pages/CountryPage/components/OverviewPanel.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiGlobe, FiAward, FiStar, FiCamera, FiCompass, FiArrowRight, FiMap } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";

export default function OverviewPanel({ country, hero, flag, region, tagline, destsCount, rating, slug, navigate }) {
  const isFlagEmoji = flag && !flag.startsWith("http") && !flag.includes("/");
  const isFlagUrl = flag && (flag.startsWith("http") || flag.includes("/"));

  return (
    <AnimatedSection animation="fadeInUp">
      <div className="cpx-overview" id="cpx-overview">
        <div className="cpx-overview__media">
          {hero ? (
            <img src={hero} alt={country.name} className="cpx-overview__img" />
          ) : (
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(145deg,var(--cp-g950),var(--cp-g800))",display:"grid",placeItems:"center" }}>
              <FiGlobe size={100} style={{ color:"rgba(255,255,255,.1)" }} />
            </div>
          )}
          <div className="cpx-overview__media-ov" />
          <div className="cpx-overview__badges">
            {country.isFeatured && <span className="cpx-chip cpx-chip--green"><FiAward size={11} /> Featured</span>}
            {region && <span className="cpx-chip cpx-chip--glass"><FiGlobe size={11} /> {region}</span>}
          </div>
          <div className="cpx-overview__flag">
            {isFlagUrl ? <img src={flag} alt="flag" /> :
             isFlagEmoji ? <span>{flag}</span> :
             <FiGlobe size={28} color="#fff" />}
          </div>
        </div>
        <div className="cpx-overview__body">
          <div className="cpx-overview__eyebrow">
            <span className="cpx-overview__pulse" /> Country Guide
          </div>
          <h2 className="cpx-overview__name">{country.name}</h2>
          {tagline && <p className="cpx-overview__tagline">{tagline}</p>}
          <div className="cpx-overview__divider" />
          <div className="cpx-overview__meta">
            {destsCount != null && (
              <span className="cpx-overview__meta-item">
                <FiCamera size={14} /> {destsCount} Destination{destsCount===1?"":"s"}
              </span>
            )}
            {rating != null && (
              <span className="cpx-overview__meta-item">
                <FiStar size={14} style={{color:"#f59e0b"}} /> {Number(rating).toFixed(1)} Rating
              </span>
            )}
            {region && <span className="cpx-overview__meta-item"><FiGlobe size={14} /> {region}</span>}
          </div>
          <div className="cpx-overview__actions">
            <Link to={`/country/${slug}/destinations`} className="cpx-btn cpx-btn--primary">
              <FiCompass size={15} /> Explore Destinations <FiArrowRight size={14} />
            </Link>
            <Link to="/interactive-map" className="cpx-btn cpx-btn--outline">
              <FiMap size={14} /> View on Map
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}