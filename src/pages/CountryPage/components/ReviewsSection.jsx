// src/pages/CountryPage/components/ReviewsSection.jsx
import React from "react";
import { FiStar, FiAward, FiHeart } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

const StarRow = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <FiStar key={i} size={size} style={{
        fill: i < Math.round(rating) ? "#22C55E" : "transparent",
        color: i < Math.round(rating) ? "#22C55E" : "#A8C5A8",
      }} />
    ))}
  </div>
);

export default function ReviewsSection({ country, reviews, reviewAgg }) {
  if (!reviews.length && !reviewAgg) return null;
  const total = reviewAgg?.totalReviews || country?.reviewCount || 0;
  const avg = reviewAgg?.avgRating || country?.rating || 0;
  const dist = reviewAgg?.distribution;
  const bars = dist ? [
    { l:"5★",c:dist.fiveStar||0 },{ l:"4★",c:dist.fourStar||0 },
    { l:"3★",c:dist.threeStar||0 },{ l:"2★",c:dist.twoStar||0 },{ l:"1★",c:dist.oneStar||0 },
  ] : [];

  return (
    <section className="cpx-sec cpx-sec--soft">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiStar size={13} />} label="Traveler Stories" center
            sub="Real experiences shared by fellow travelers">Traveler Reviews</SectionTitle>
        </AnimatedSection>
        {reviewAgg && (
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <div className="cpx-rev-agg">
              <div className="cpx-rev-agg__score">
                <span className="cpx-rev-agg__num">{Number(avg).toFixed(1)}</span>
                <StarRow rating={avg} size={20} />
                <span className="cpx-rev-agg__total">{total.toLocaleString()} reviews</span>
              </div>
              {bars.length > 0 && (
                <div className="cpx-rev-agg__bars">
                  {bars.map(b => { const pct = total > 0 ? Math.round((b.c / total) * 100) : 0; return (
                    <div key={b.l} className="cpx-revbar">
                      <span className="cpx-revbar__label">{b.l}</span>
                      <div className="cpx-revbar__track"><div className="cpx-revbar__fill" style={{width:`${pct}%`}} /></div>
                      <span className="cpx-revbar__pct">{pct}%</span>
                    </div>
                  ); })}
                </div>
              )}
            </div>
          </AnimatedSection>
        )}
        {reviews.length > 0 && (
          <div className="cpx-revs-grid">
            {reviews.map((rev, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={0.06 + i * 0.07}>
                <article className="cpx-rev-card">
                  <div className="cpx-rev-card__top">
                    <div className="cpx-rev-card__avatar">
                      {rev.reviewerAvatar ? <img src={rev.reviewerAvatar} alt="" /> :
                       <span>{(rev.reviewerName || "A")[0].toUpperCase()}</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div className="cpx-rev-card__name">{rev.reviewerName || "Anonymous"}</div>
                      <div className="cpx-rev-card__meta">
                        {[rev.reviewerCountry, rev.tripDate && new Date(rev.tripDate).toLocaleDateString("en-US",{month:"short",year:"numeric"})]
                          .filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    {rev.isVerified && <FiAward size={16} style={{color:"var(--cp-g600)",flexShrink:0}} />}
                  </div>
                  <div className="cpx-rev-card__stars"><StarRow rating={rev.rating} /></div>
                  {rev.title && <p className="cpx-rev-card__title">"{rev.title}"</p>}
                  <p className="cpx-rev-card__body">&ldquo;{rev.content}&rdquo;</p>
                  {rev.helpfulCount > 0 && (
                    <div className="cpx-rev-card__footer">
                      <FiHeart size={12} /> {rev.helpfulCount} found helpful
                    </div>
                  )}
                </article>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}