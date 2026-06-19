// src/pages/CountryPage/components/PracticalSection.jsx
import React from "react";
import { FiInfo, FiAlertCircle } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";
import { getPracticalInfo, getAlerts } from "../helpers";

export default function PracticalSection({ country }) {
  const pi = getPracticalInfo(country);
  const alerts = getAlerts(country);
  const packing = pi?.packing?.essentials || [];
  const clothingTips = pi?.packing?.clothingTips;
  const vaccReq = pi?.healthAndSafety?.vaccinationsRequired || [];
  const vaccRec = pi?.healthAndSafety?.vaccinationsRecommended || [];
  const malaria = pi?.healthAndSafety?.malariaRisk;
  const safetyNotes = pi?.healthAndSafety?.safetyNotes;
  const permits = pi?.permitsAndRegulations?.permitsRequired || [];
  const leadTime = pi?.permitsAndRegulations?.bookingLeadTime;
  const visitorLimits = pi?.permitsAndRegulations?.visitorLimits;
  const etiquette = pi?.culture?.localEtiquette || [];
  const tipping = pi?.culture?.tippingCulture;
  const photoRules = pi?.culture?.photographyRules;

  const cards = [];
  if (packing.length || clothingTips) cards.push({ type: "packing" });
  if (vaccReq.length || vaccRec.length || malaria || safetyNotes) cards.push({ type: "health" });
  if (permits.length || leadTime || visitorLimits) cards.push({ type: "permits" });
  if (etiquette.length || tipping || photoRules) cards.push({ type: "culture" });
  if (!cards.length && !alerts.length) return null;

  const cfg = { packing:{title:"What to Pack",theme:"green",icon:"🎒"}, health:{title:"Health & Safety",theme:"amber",icon:"🏥"},
    permits:{title:"Permits & Regulations",theme:"blue",icon:"📋"}, culture:{title:"Local Culture",theme:"purple",icon:"🌍"} };

  return (
    <section className="cpx-sec cpx-sec--soft">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiInfo size={13} />} label="Practical Info" center
            sub="Everything you need to know for a smooth journey">Travel Essentials</SectionTitle>
        </AnimatedSection>
        {alerts.length > 0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:32 }}>
            {alerts.map((a, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.08}>
                <div className={`cpx-alert cpx-alert--${a.theme}`}>
                  <FiAlertCircle size={18} className="cpx-alert__icon" />
                  <div><div className="cpx-alert__title">{a.title}</div><div className="cpx-alert__text">{a.text}</div></div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
        <div className="cpx-prac-grid">
          {cards.map((card, ci) => {
            const c = cfg[card.type];
            return (
              <AnimatedSection key={ci} animation="fadeInUp" delay={0.06 + ci * 0.1}>
                <div className="cpx-prac-card">
                  <div className={`cpx-prac-card__hdr cpx-prac-card__hdr--${c.theme}`}>
                    <div className="cpx-prac-card__hdr-icon"><span style={{fontSize:18}}>{c.icon}</span></div>
                    <span className="cpx-prac-card__hdr-title">{c.title}</span>
                  </div>
                  <div className="cpx-prac-card__body">
                    {card.type === "packing" && (<>
                      {packing.length > 0 && <div className="cpx-chip-row" style={{marginBottom:clothingTips?16:0}}>
                        {packing.map((p,i) => <span key={i} className="cpx-chip cpx-chip--soft">{p}</span>)}
                      </div>}
                      {clothingTips && <p className="cpx-prac-card__note">{clothingTips}</p>}
                    </>)}
                    {card.type === "health" && (<>
                      {malaria && <div className="cpx-alert cpx-alert--red" style={{padding:"12px 16px",marginBottom:14}}>
                        <FiAlertCircle size={14} /><div><div className="cpx-alert__title">Malaria Risk</div><div className="cpx-alert__text">{malaria}</div></div>
                      </div>}
                      {vaccReq.length > 0 && <div className="cpx-prac-card__group"><span className="cpx-mini-label">Required Vaccinations</span>
                        <div className="cpx-chip-row">{vaccReq.map((v,i) => <span key={i} className="cpx-chip cpx-chip--soft-gray">{v}</span>)}</div></div>}
                      {vaccRec.length > 0 && <div className="cpx-prac-card__group"><span className="cpx-mini-label">Recommended</span>
                        <div className="cpx-chip-row">{vaccRec.map((v,i) => <span key={i} className="cpx-chip cpx-chip--soft">{v}</span>)}</div></div>}
                      {safetyNotes && <p className="cpx-prac-card__note">{safetyNotes}</p>}
                    </>)}
                    {card.type === "permits" && (<>
                      {permits.length > 0 && <div className="cpx-prac-card__group"><span className="cpx-mini-label">Required Permits</span>
                        <div className="cpx-chip-row">{permits.map((p,i) => <span key={i} className="cpx-chip cpx-chip--soft-gray">{p}</span>)}</div></div>}
                      {[{l:"Booking Lead Time",v:leadTime},{l:"Visitor Limits",v:visitorLimits}].filter(r=>r.v).map((r,i) => (
                        <div key={i} className="cpx-prac-card__kv"><span>{r.l}</span><span>{r.v}</span></div>
                      ))}
                    </>)}
                    {card.type === "culture" && (<>
                      {etiquette.length > 0 && <ul className="cpx-prac-card__list">{etiquette.map((e,i) => <li key={i}>{e}</li>)}</ul>}
                      {tipping && <p className="cpx-prac-card__note"><strong>Tipping:</strong> {tipping}</p>}
                      {photoRules && <p className="cpx-prac-card__note"><strong>Photography:</strong> {photoRules}</p>}
                    </>)}
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}