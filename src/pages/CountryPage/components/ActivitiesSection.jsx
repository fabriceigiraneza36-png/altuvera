// src/pages/CountryPage/components/ActivitiesSection.jsx
import React from "react";
import { FiCompass } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";
import { getActIcon } from "../helpers";

export default function ActivitiesSection({ country, activities }) {
  if (!activities.length) return null;
  return (
    <section className="cpx-sec cpx-sec--soft">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiCompass size={13} />} label="Things To Do" center
            sub={`Unforgettable experiences awaiting you in ${country.name}`}>
            Activities &amp; Experiences
          </SectionTitle>
        </AnimatedSection>
        <div className="cpx-act-grid">
          {activities.map((act, i) => {
            const ActIcon = getActIcon(act);
            return (
              <AnimatedSection key={i} animation="scaleIn" delay={0.04 + i * 0.05}>
                <div className="cpx-act-card">
                  <div className="cpx-act-card__ring"><ActIcon size={22} /></div>
                  <h4>{act}</h4>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}