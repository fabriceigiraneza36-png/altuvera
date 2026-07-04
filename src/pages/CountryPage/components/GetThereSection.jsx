// src/pages/CountryPage/components/GetThereSection.jsx
import React from "react";
import { FiMapPin, FiCompass, FiMap } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";
import { getHowToGetThere } from "../helpers";

export default function GetThereSection({ country }) {
  const hgt = getHowToGetThere(country);
  const lat = hgt?.mapPosition?.lat ?? country.latitude;
  const lng = hgt?.mapPosition?.lng ?? country.longitude;
  const hasMap = lat && lng;
  const transport = hgt?.transportOptions || [];
  const rows = [
    { icon: FiCompass, label: "Nearest Airport", val: hgt?.nearestAirport || country.nearestAirport,
      sub: hgt?.distanceFromAirport || (country.distanceFromAirportKm ? `${country.distanceFromAirportKm} km` : null) },
    { icon: FiMapPin, label: "Nearest City", val: hgt?.nearestCity || country.nearestCity },
    { icon: FiMap, label: "Getting Around", val: hgt?.generalInfo || country.gettingThere },
  ].filter(r => r.val);
  if (!rows.length && !hasMap && !transport.length) return null;

  return (
    <section className="cpx-sec cpx-sec--white">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiMapPin size={13} />} label="Getting There"
            sub="Everything you need to know about reaching your destination">How to Get There</SectionTitle>
        </AnimatedSection>
        <div className={`cpx-getthere ${hasMap ? "cpx-getthere--map" : ""}`}>
          {hasMap && (
            <AnimatedSection animation="fadeInLeft" delay={0.1}>
              <div className="cpx-getthere__map">
                <iframe title={`Map of ${country.name}`}
                  src={`https://www.google.com/maps?q=${lat},${lng}&z=6&output=embed`}
                  loading="lazy" allowFullScreen />
              </div>
            </AnimatedSection>
          )}
          <AnimatedSection animation="fadeInRight" delay={0.15}>
            <div className="cpx-info-rows">
              {transport.length > 0 && (
                <div style={{ padding:"20px 22px",borderBottom:"1px solid var(--cp-n50)" }}>
                  <span className="cpx-mini-label">Transport Options</span>
                  <div className="cpx-chip-row">
                    {transport.map((t, i) => <span key={i} className="cpx-chip cpx-chip--soft">{t}</span>)}
                  </div>
                </div>
              )}
              {rows.map((row, i) => (
                <div key={i} className="cpx-info-row">
                  <div className="cpx-info-row__icon"><row.icon size={16} /></div>
                  <div>
                    <span className="cpx-info-row__label">{row.label}</span>
                    <span className="cpx-info-row__val">{row.val}</span>
                    {row.sub && <span className="cpx-info-row__sub">{row.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}