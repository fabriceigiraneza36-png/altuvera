// src/pages/CountryPage/components/BestTimeSection.jsx
import React from "react";
import { FiCalendar, FiThermometer, FiSun } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function BestTimeSection({ country, facts }) {
  const bestFact = facts.find(f => f.label === "Best Time to Visit");
  const climateFact = facts.find(f => f.label === "Climate");
  if (!bestFact && !climateFact) return null;
  const pi = country?.practicalInfo?.climate || null;
  const best = pi?.bestMonths || [];
  const avoid = pi?.avoidMonths || [];
  const status = (m) => {
    const ml = m.toLowerCase().slice(0, 3);
    if (best.some(b => b.toLowerCase().startsWith(ml))) return "best";
    if (avoid.some(a => a.toLowerCase().startsWith(ml))) return "avoid";
    return "ok";
  };

  return (
    <section className="cpx-sec cpx-sec--warm" id="best-time">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiCalendar size={13} />} label="When to Go" center
            sub="Plan your visit at the perfect time of year">Best Time to Visit</SectionTitle>
        </AnimatedSection>
        <div className="cpx-besttime">
          <AnimatedSection animation="fadeInLeft" delay={0.1}>
            <div className="cpx-besttime__hero">
              <div className="cpx-besttime__hero-label"><FiSun size={12} /> Recommended Season</div>
              <div className="cpx-besttime__hero-val">{bestFact?.value || "Year-round"}</div>
              {climateFact && <p className="cpx-besttime__hero-note">{climateFact.value}</p>}
              {pi?.climateNotes && <p className="cpx-besttime__hero-note">{pi.climateNotes}</p>}
              {(pi?.avgTempLowC != null || pi?.avgTempHighC != null) && (
                <div className="cpx-besttime__temps">
                  {pi.avgTempLowC != null && <span className="cpx-chip cpx-chip--glass"><FiThermometer size={11} /> {pi.avgTempLowC}°C Low</span>}
                  {pi.avgTempHighC != null && <span className="cpx-chip cpx-chip--glass"><FiSun size={11} /> {pi.avgTempHighC}°C High</span>}
                </div>
              )}
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fadeInRight" delay={0.15}>
            <div className="cpx-besttime__cal">
              <span className="cpx-besttime__cal-label">Monthly Travel Guide</span>
              {best.length > 0 ? (
                <>
                  <div className="cpx-besttime__months">
                    {MONTHS.map(m => (
                      <div key={m} className={`cpx-besttime__month cpx-besttime__month--${status(m)}`}>
                        <span>{m}</span><div className="cpx-besttime__pip" />
                      </div>
                    ))}
                  </div>
                  <div className="cpx-besttime__legend">
                    {[{c:"best",l:"Best Time"},{c:"ok",l:"Acceptable"},{c:"avoid",l:"Avoid"}].map(x => (
                      <div key={x.c} className="cpx-besttime__legend-item">
                        <div className={`cpx-besttime__legend-dot cpx-besttime__legend-dot--${x.c}`} />{x.l}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  {facts.filter(f => ["Climate","Best Time to Visit"].includes(f.label)).map((f, i) => (
                    <div key={i} className="cpx-info-row" style={{ borderRadius:20 }}>
                      <div className="cpx-info-row__icon"><f.icon size={15} /></div>
                      <div>
                        <span className="cpx-info-row__label">{f.label}</span>
                        <span className="cpx-info-row__val">{f.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}