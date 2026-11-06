import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ADVENTURE_CATALOG } from "../data/adventureCatalog";
import { useDestinations } from "../hooks/useDestinations";
import DestinationCard from "../components/common/DestinationCard";
import SEO from "../components/common/SEO";
import { getAdventureDestinationMatches } from "../utils/adventureMatching";

const COUNTRY_LABELS = {
  rwanda: "Rwanda",
  uganda: "Uganda",
  kenya: "Kenya",
  tanzania: "Tanzania",
};

export default function AdventureGuide() {
  const { slug } = useParams();
  const { destinations = [], loading } = useDestinations({
    limit: 100,
    sort: "-featured",
    include: "gallery",
  });

  const adventure = useMemo(
    () => ADVENTURE_CATALOG.find((item) => item.slug === slug) || null,
    [slug],
  );

  const matchedDestinations = useMemo(
    () => getAdventureDestinationMatches(adventure, destinations),
    [adventure, destinations],
  );

  const relatedCountries = useMemo(
    () =>
      (adventure?.relatedCountrySlugs || [])
        .filter((countrySlug) => COUNTRY_LABELS[countrySlug])
        .map((countrySlug) => ({
          slug: countrySlug,
          name: COUNTRY_LABELS[countrySlug],
        })),
    [adventure],
  );

  if (!adventure) {
    return (
      <main className="adventure-guide-page">
        <section className="home-container adventure-guide-content-grid">
          <article className="adventure-guide-card adventure-guide-card--wide">
            <h1>Adventure guide not found</h1>
            <p>This guide may have moved. Explore our destinations to find another East African experience.</p>
            <Link to="/destinations" className="adventure-guide-link">Browse destinations</Link>
          </article>
        </section>
      </main>
    );
  }

  const description = adventure.seoDescription || adventure.summary;

  return (
    <main className="adventure-guide-page">
      <SEO
        title={adventure.seoTitle || adventure.title}
        description={description}
        keywords={adventure.keywords || adventure.filters}
        url={`/adventures/${adventure.slug}`}
        image={adventure.image}
        type="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Explore", url: "/explore" },
          { name: adventure.title, url: `/adventures/${adventure.slug}` },
        ]}
      />

      <section
        className="adventure-guide-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(2,6,23,.78), rgba(6,78,59,.72)), url(${adventure.image})`,
        }}
      >
        <div className="home-container adventure-guide-hero-inner">
          <p className="adventure-guide-kicker">East Africa travel guide</p>
          <h1 className="adventure-guide-title">{adventure.title}</h1>
          <p className="adventure-guide-summary">{adventure.summary}</p>
          <div className="adventure-guide-pill-row">
            <span className="adventure-guide-pill">{adventure.eyebrow}</span>
            <span className="adventure-guide-pill">
              {loading ? "Finding related destinations" : `${matchedDestinations.length} related destinations`}
            </span>
          </div>
        </div>
      </section>

      <section className="home-container adventure-guide-content-grid">
        <article className="adventure-guide-card adventure-guide-card--wide">
          <h2>Plan the right experience</h2>
          <p>{adventure.description}</p>
          <p>{adventure.whyItMatters}</p>
        </article>

        <article className="adventure-guide-card">
          <h2>What you may experience</h2>
          <ul className="adventure-guide-list">
            {adventure.whatYouWillExperience.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="adventure-guide-card">
          <h2>Who this journey suits</h2>
          <div className="adventure-guide-tags">
            {adventure.bestFor.map((item) => <span key={item} className="adventure-guide-tag">{item}</span>)}
          </div>
        </article>
      </section>

      {relatedCountries.length > 0 && (
        <section className="home-container adventure-guide-destinations-section">
          <div className="section-header">
            <h2 className="section-title">Explore this experience by country</h2>
            <p className="section-subtitle">
              Compare the places included in this travel theme and explore each country guide.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 14,
            }}
          >
            {relatedCountries.map((country) => (
              <Link
                key={country.slug}
                to={`/country/${country.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "18px 20px",
                  borderRadius: 14,
                  border: "1px solid #dcebe1",
                  background: "#fff",
                  color: "#14532d",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <span>{country.name}</span>
                <span aria-hidden="true">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="home-container adventure-guide-destinations-section">
        <div className="section-header">
          <h2 className="section-title">Destinations for this experience</h2>
          <p className="section-subtitle">
            Browse destinations that match this travel style. Availability and suitability depend on your dates and itinerary.
          </p>
        </div>

        {loading ? (
          <p className="adventure-guide-empty">Loading destinations…</p>
        ) : matchedDestinations.length ? (
          <div className="destinations-grid destination-horizontal-row">
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
            <p>There are no destinations currently tagged for this guide.</p>
            <Link to="/destinations" className="adventure-guide-link">Browse all destinations</Link>
          </div>
        )}
      </section>

      {Array.isArray(adventure.faqs) && adventure.faqs.length > 0 && (
        <section className="home-container adventure-guide-destinations-section">
          <div className="section-header">
            <h2 className="section-title">Frequently asked questions</h2>
            <p className="section-subtitle">Helpful details to consider while planning your journey.</p>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {adventure.faqs.map((item) => (
              <details
                key={item.question}
                style={{
                  padding: "18px 20px",
                  border: "1px solid #dcebe1",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <summary style={{ color: "#14532d", fontWeight: 750, cursor: "pointer" }}>
                  {item.question}
                </summary>
                <p style={{ margin: "12px 0 0", color: "#475569", lineHeight: 1.75 }}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(adventure.planningLinks) && adventure.planningLinks.length > 0 && (
        <section className="home-container adventure-guide-destinations-section">
          <div className="section-header">
            <h2 className="section-title">Official planning information</h2>
            <p className="section-subtitle">
              Check park rules and current visitor requirements with the responsible authorities before travelling.
            </p>
          </div>
          <ul className="adventure-guide-list">
            {adventure.planningLinks.map((item) => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="home-container adventure-guide-destinations-section">
        <div className="adventure-guide-card adventure-guide-card--wide">
          <h2>Build a journey around your interests</h2>
          <p>
            Tell us where you would like to go, when you hope to travel and what you want to experience.
            Our team can help shape a route around your priorities.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link to="/booking" className="adventure-guide-link">Plan your journey</Link>
            <Link to="/contact" className="adventure-guide-link">Contact Altuvera</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
