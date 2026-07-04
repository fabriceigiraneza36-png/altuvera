// src/pages/CountryPage/components/WildlifeSection.jsx
import React from "react";
import { FiEye } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

export default function WildlifeSection({ country, wildlife }) {
  if (!wildlife.length) return null;
  return (
    <section className="cpx-sec cpx-sec--white">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiEye size={13} />} label="Wildlife & Nature"
            sub={`Wildlife and fauna found across ${country.name}`}>Wildlife Encounters</SectionTitle>
        </AnimatedSection>
        <div className="cpx-wildlife">
          {wildlife.map((animal, i) => (
            <AnimatedSection key={i} animation="scaleIn" delay={0.03 + i * 0.03}>
              <div className="cpx-wildlife-pill">
                <div className="cpx-wildlife-pill__dot" /><span>{animal}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}