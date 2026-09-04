import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDestination } from "../hooks/useDestinations";
import PageHeader from "../components/common/PageHeader";
import "./DestinationDetail.css";

const slugify = value => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AttractionDetail() {
  const { destinationId, attractionSlug } = useParams();
  const navigate = useNavigate();
  const { destination, loading, error } = useDestination(destinationId);
  const attraction = useMemo(() => {
    const list = destination?.attractions || [];
    return list.find(item => slugify(item.slug || item.name || item.title) === attractionSlug);
  }, [destination, attractionSlug]);

  if (loading) return <div className="d-page"><PageHeader title="Loading attraction" /></div>;
  if (error || !destination || !attraction) return <div className="d-page"><PageHeader title="Attraction not found" /><div className="d-wrap"><Link className="d-btn d-btn--outline" to={`/destinations/${destinationId}`}>Back to destination</Link></div></div>;

  const name = attraction.name || attraction.title;
  const image = attraction.imageUrl || attraction.image_url || attraction.image || destination.heroImage || destination.imageUrl;
  return (
    <div className="d-page">
      <PageHeader title={name} subtitle={`An experience inside ${destination.name}`} />
      <main className="d-wrap" style={{ padding: "48px 0 80px" }}>
        {image && <img src={image} alt={name} style={{ width: "100%", maxHeight: 520, objectFit: "cover", borderRadius: 18 }} />}
        <div style={{ maxWidth: 760, margin: "32px auto 0" }}>
          <p className="d-prose">{attraction.description || `Discover ${name} in ${destination.name}.`}</p>
          <div className="d-about__book-row">
            <button className="d-btn d-btn--emerald" onClick={() => navigate(`/booking?destination=${encodeURIComponent(destination.slug)}&attraction=${encodeURIComponent(name)}`)}>Book this attraction</button>
            <Link className="d-btn d-btn--outline" to={`/destinations/${destination.slug}`}>Back to {destination.name}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
