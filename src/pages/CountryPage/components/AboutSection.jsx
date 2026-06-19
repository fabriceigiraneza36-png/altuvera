// src/pages/CountryPage/components/AboutSection.jsx
import React from "react";
import { FiGlobe, FiStar, FiCalendar, FiCompass, FiAward, FiShield, FiUsers } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

function SidebarCard({ country, navigate, facts }) {
  return (
    <div className="cpx-sidebar">
      <div className="cpx-sidebar-card">
        <div className="cpx-sidebar-card__hdr">
          <div className="cpx-sidebar-card__icon"><FiGlobe size={22} /></div>
          <h4 className="cpx-sidebar-card__h4">Plan Your Visit</h4>
          <p className="cpx-sidebar-card__desc">Let our experts craft your perfect {country.name} experience</p>
        </div>
        <div className="cpx-sidebar-card__btns">
          <button className="cpx-btn cpx-btn--primary cpx-btn--full" onClick={() => navigate("/contact")}>
            <FiCalendar size={15} /> Enquire Now
          </button>
          <button className="cpx-btn cpx-btn--outline cpx-btn--full" onClick={() => navigate("/contact")}>
            <FiCompass size={15} /> Talk to an Expert
          </button>
        </div>
        {facts.length > 0 && (
          <div className="cpx-sidebar-card__body">
            {facts.slice(0, 5).map((f, i) => (
              <div key={i} className="cpx-sidebar-card__row">
                <div className="cpx-sidebar-card__row-icon"><f.icon size={14} /></div>
                <div>
                  <span className="cpx-sidebar-card__row-label">{f.label}</span>
                  <span className="cpx-sidebar-card__row-val">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cpx-sidebar-card__trust">
          {[
            { icon: <FiAward size={17} />, label: "Expert Guides" },
            { icon: <FiShield size={17} />, label: "Safe Travel" },
            { icon: <FiUsers size={17} />, label: "24/7 Support" },
          ].map((item, i) => (
            <div key={i} className="cpx-sidebar-card__trust-item">
              <div className="cpx-sidebar-card__trust-icon">{item.icon}</div>
              <span className="cpx-sidebar-card__trust-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AboutSection({ country, desc, highlights, facts, navigate }) {
  if (!desc && !highlights.length) return null;
  return (
    <section className="cpx-sec cpx-sec--soft">
      <div className="cpx-wrap">
        <div className="cpx-about">
          <div>
            {desc && (
              <AnimatedSection animation="fadeInUp" delay={0.05}>
                <SectionTitle icon={<FiGlobe size={13} />} label="Overview"
                  sub={`What makes ${country.name} a world-class destination`}>
                  About {country.name}
                </SectionTitle>
                {(country.overview || country.intro) && (
                  <div className="cpx-pullquote" style={{ marginBottom: 32 }}>
                    <p>{country.overview || country.intro}</p>
                  </div>
                )}
                <div className="cpx-prose">
                  {desc.split(/\n\n|\r\n\r\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </AnimatedSection>
            )}
            {highlights.length > 0 && (
              <AnimatedSection animation="fadeInUp" delay={0.15}>
                <div style={{ marginTop: 52 }}>
                  <SectionTitle icon={<FiStar size={13} />} label="Highlights"
                    sub={`Signature experiences in ${country.name}`}>
                    What {country.name} is Known For
                  </SectionTitle>
                  <div className="cpx-hl-grid">
                    {highlights.map((h, i) => (
                      <AnimatedSection key={i} animation="scaleIn" delay={0.03 + i * 0.04}>
                        <div className="cpx-hl-card">
                          <span className="cpx-hl-card__num">{String(i + 1).padStart(2, "0")}</span>
                          <p>{h}</p>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}
          </div>
          <AnimatedSection animation="fadeInRight" delay={0.1}>
            <SidebarCard country={country} navigate={navigate} facts={facts} />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}