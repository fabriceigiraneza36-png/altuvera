// src/pages/CountryPage/components/FactsGrid.jsx
import React from "react";
import { FiInfo } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

export default function FactsGrid({ country, facts }) {
  if (!facts.length) return null;
  return (
    <section className="cpx-sec cpx-sec--white">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiInfo size={13} />} label="Quick Facts" center
            sub={`Essential information for planning your trip to ${country.name}`}>
            Travel Information
          </SectionTitle>
        </AnimatedSection>
        <div className="cpx-facts-grid">
          {facts.map((f, i) => (
            <AnimatedSection key={`${f.label}-${i}`} animation="fadeInUp" delay={0.04 + i * 0.04}>
              <div className="cpx-fact">
                <div className="cpx-fact__icon"><f.icon size={18} /></div>
                <div>
                  <span className="cpx-fact__label">{f.label}</span>
                  <span className="cpx-fact__value">{f.value}</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}