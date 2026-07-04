import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ADVENTURE_CATALOG } from "../data/adventureCatalog";
import { useDestinations } from "../hooks/useDestinations";
import DestinationCard from "../components/common/DestinationCard";

export default function AdventureGuide() {
  const { slug } = useParams();
  const { destinations = [], loading } = useDestinations({ limit: 100, sort: "-featured" });

  const adventure = useMemo(
    () => ADVENTURE_CATALOG.find((item) => item.slug === slug) || ADVENTURE_CATALOG[0],
    [slug]
  );

  const matchedDestinations = useMemo(() => {
    const terms = new Set([
      ...(adventure.filters || []),
      adventure.title,
      adventure.slug,
      adventure.eyebrow,
    ].map((term) => String(term).toLowerCase()));

    return destinations.filter((destination) => {
      const haystack = [
        destination.category,
        destination.experienceCategory,
        destination.adventureCategory,
        destination.classification,
        destination.destinationType,
        destination.name,
        destination.tagline,
        destination.shortDescription,
        destination.description,
        destination.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return [...terms].some((term) => haystack.includes(term));
    });
  }, [adventure, destinations]);

  if (!adventure) return null;

  return (
    <main className="adventure-guide-page">
      <section className="adventure-guide-hero" style={{ backgroundImage: `linear-gradient(135deg, rgba(2,6,23,.78), rgba(6,78,59,.72)), url(${adventure.image})` }}>
        <div className="home-container adventure-guide-hero-inner">
          <p className="adventure-guide-kicker">Adventure guide</p>
          <h1 className="adventure-guide-title">{adventure.title}</h1>
          <p className="adventure-guide-summary">{adventure.summary}</p>
          <div className="adventure-guide-pill-row">
            <span className="adventure-guide-pill">{adventure.eyebrow}</span>
            <span className="adventure-guide-pill">{matchedDestinations.length} matching destinations</span>
          </div>
        </div>
      </section>

      <section className="home-container adventure-guide-content-grid">
        <article className="adventure-guide-card adventure-guide-card--wide">
          <h2>Why this journey is extraordinary</h2>
          <p>{adventure.description}</p>
          <p>{adventure.whyItMatters}</p>
        </article>

        <article className="adventure-guide-card">
          <h3>What you’ll experience</h3>
          <ul className="adventure-guide-list">
            {adventure.whatYouWillExperience.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="adventure-guide-card">
          <h3>Best for</h3>
          <div className="adventure-guide-tags">
            {adventure.bestFor.map((item) => <span key={item} className="adventure-guide-tag">{item}</span>)}
          </div>
        </article>
      </section>

      <section className="home-container adventure-guide-destinations-section">
        <div className="section-header">
          <h2 className="section-title">Destinations in this adventure</h2>
          <p className="section-subtitle">Browse the experiences that most closely match this travel style.</p>
        </div>

        {loading ? (
          <p className="adventure-guide-empty">Loading destinations…</p>
        ) : matchedDestinations.length ? (
          <div className="destinations-grid">
{matchedDestinations.slice(0, 6).map((destination, index) => (
               <DestinationCard
                 key={destination.slug || destination.id || index}
                 destination={destination}
                 priority={index === 0}
               />
             ))}
          </div>
        ) : (
          <div className="adventure-guide-empty">
            <p>No destinations are currently tagged for this adventure category.</p>
            <Link to="/destinations" className="adventure-guide-link">Browse all destinations</Link>
          </div>
        )}
      </section>
    </main>
  );
}
