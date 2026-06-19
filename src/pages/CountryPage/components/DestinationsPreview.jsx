// src/pages/CountryPage/components/DestinationsPreview.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiCamera, FiArrowRight } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import DestinationCard from "../../../components/destinations/DestinationCard";
import SectionTitle from "./SectionTitle";

export default function DestinationsPreview({ country, slug, allDests, previewDests, destsLoading }) {
  if (!previewDests.length && !destsLoading) return null;
  return (
    <section className="cpx-sec cpx-sec--white">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <div className="cpx-dests-hdr">
            <SectionTitle icon={<FiCamera size={13} />} label="Top Destinations"
              sub={`Curated highlights and must-see places across ${country.name}`}>Must-Visit Places</SectionTitle>
            {allDests.length > 3 && (
              <Link to={`/country/${slug}/destinations`} className="cpx-btn cpx-btn--outline cpx-btn--sm">
                View All {allDests.length} <FiArrowRight size={13} />
              </Link>
            )}
          </div>
        </AnimatedSection>
        {destsLoading ? (
          <div className="cpx-dests-grid">
            {[1,2,3].map((_, i) => (
              <div key={i} className="cpx-dest-skel">
                <div className="cpx-shimmer" style={{ aspectRatio:"16/10" }} />
                <div style={{ padding:22 }}>
                  <div className="cpx-shimmer" style={{ height:22,width:"60%",marginBottom:12,borderRadius:12 }} />
                  <div className="cpx-shimmer" style={{ height:14,width:"85%",marginBottom:8,borderRadius:12 }} />
                  <div className="cpx-shimmer" style={{ height:14,width:"50%",borderRadius:12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cpx-dests-grid">
            {previewDests.map((dest, i) => (
              <AnimatedSection key={dest.slug || dest.id || i}
                animation={["fadeInUp","fadeInLeft","fadeInRight"][i % 3]} delay={0.07 + i * 0.07}>
                <DestinationCard destination={dest} priority={i === 0} />
              </AnimatedSection>
            ))}
          </div>
        )}
        {allDests.length > 3 && (
          <AnimatedSection animation="fadeInUp" delay={0.2}>
            <div style={{ textAlign:"center", marginTop:56 }}>
              <Link to={`/country/${slug}/destinations`} className="cpx-btn cpx-btn--primary cpx-btn--lg">
                <FiCamera size={16} /> See All {allDests.length} Destinations <FiArrowRight size={15} />
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}