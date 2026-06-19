// src/pages/CountryPage/components/FAQSection.jsx
import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

export default function FAQSection({ faqs }) {
  const [open, setOpen] = useState(null);
  if (!faqs.length) return null;
  return (
    <section className="cpx-sec cpx-sec--warm">
      <div className="cpx-wrap cpx-wrap--sm">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiInfo size={13} />} label="FAQ" center
            sub="Answers to the most common questions">Frequently Asked Questions</SectionTitle>
        </AnimatedSection>
        <div className="cpx-faqs">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} animation="fadeInUp" delay={0.04 + i * 0.05}>
              <div className={`cpx-faq ${open === i ? "open" : ""}`}>
                <button className="cpx-faq__btn" onClick={() => setOpen(open === i ? null : i)}>
                  <span className="cpx-faq__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cpx-faq__text">{faq.question}</span>
                  <div className="cpx-faq__toggle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d={open === i ? "M18 6L6 18M6 6l12 12" : "M12 5v14M5 12h14"} />
                    </svg>
                  </div>
                </button>
                <div className="cpx-faq__ans"><div className="cpx-faq__ans-inner">{faq.answer}</div></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}