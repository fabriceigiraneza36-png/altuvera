// src/pages/CountryPage/components/TipsSection.jsx
import React from "react";
import { FiBookOpen } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

export default function TipsSection({ tips }) {
  if (!tips.length) return null;
  return (
    <section className="cpx-sec cpx-sec--white">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiBookOpen size={13} />} label="Travel Tips"
            sub="Practical advice from experienced travelers and local experts">Know Before You Go</SectionTitle>
        </AnimatedSection>
        <div className="cpx-tips-grid">
          {tips.map((tip, i) => (
            <AnimatedSection key={i} animation="fadeInUp" delay={0.04 + i * 0.05}>
              <div className="cpx-tip">
                <span className="cpx-tip__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="cpx-tip__text">{tip}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}