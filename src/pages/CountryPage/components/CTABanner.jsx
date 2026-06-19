// src/pages/CountryPage/components/CTABanner.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiCompass, FiArrowRight, FiMail, FiAward, FiShield, FiUsers, FiStar } from "react-icons/fi";

export default function CTABanner({ country, slug, navigate }) {
  return (
    <div className="cpx-cta">
      <div className="cpx-cta__orbs" aria-hidden="true">
        {[
          {s:360,style:{top:"-15%",left:"-8%",animationDuration:"10s"}},
          {s:220,style:{bottom:"-8%",right:"-5%",animationDuration:"14s",animationDelay:"3s"}},
          {s:160,style:{top:"25%",right:"12%",animationDuration:"8s",animationDelay:"1.5s"}},
        ].map((o,i) => <div key={i} className="cpx-cta__orb" style={{width:o.s,height:o.s,...o.style}} />)}
      </div>
      <div className="cpx-cta__inner">
        <span className="cpx-label cpx-label--dark" style={{marginBottom:28}}>
          <FiCompass size={13} /> Begin Your Story
        </span>
        <h2 className="cpx-cta__title">
          Your {country.name}<br />Adventure Starts Here
        </h2>
        <p className="cpx-cta__desc">
          Whether you dream of golden savannas, misty mountains, or turquoise shores —
          our expert travel designers will craft a journey as unique as you are.
        </p>
        <div className="cpx-cta__actions">
          <Link to={`/country/${slug}/destinations`} className="cpx-btn cpx-btn--white cpx-btn--lg">
            <FiCompass size={16} /> Explore Destinations <FiArrowRight size={15} />
          </Link>
          <button className="cpx-btn cpx-btn--ghost cpx-btn--lg" onClick={() => navigate("/contact")}>
            <FiMail size={15} /> Speak to an Expert
          </button>
        </div>
        <div className="cpx-cta__trust">
          {[
            {icon:<FiAward size={17} />,label:"Expert Guides"},
            {icon:<FiShield size={17} />,label:"Safe & Ethical"},
            {icon:<FiUsers size={17} />,label:"24/7 Support"},
            {icon:<FiStar size={17} />,label:"Top Rated"},
          ].map((item,i) => (
            <div key={i} className="cpx-cta__trust-item">{item.icon} {item.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}