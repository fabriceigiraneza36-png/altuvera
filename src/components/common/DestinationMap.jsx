// DestinationMap.jsx — Interactive map showing destinations with coordinates
import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { FiMapPin, FiStar, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";

// ──────────────────────────────────────────────────────────────
// CUSTOM MARKER ICON (branded green pin)
// ──────────────────────────────────────────────────────────────
const createMarkerIcon = (isSelected = false) =>
  divIcon({
    className: "dm-marker-wrapper",
    iconSize: isSelected ? [36, 44] : [28, 36],
    iconAnchor: isSelected ? [18, 44] : [14, 36],
    popupAnchor: [0, -48],
    html: `
      <div style="
        position: relative;
        width: ${isSelected ? 36 : 28}px;
        height: ${isSelected ? 44 : 36}px;
      ">
        <!-- Pin shape -->
        <svg width="${isSelected ? 36 : 28}" height="${isSelected ? 44 : 36}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.059 0 0 8.059 0 18c0 11.25 18 26 18 26s18-14.75 18-26C36 8.059 27.941 0 18 0z"
                fill="${isSelected ? '#059669' : '#10B981'}"
                stroke="#FFFFFF"
                stroke-width="${isSelected ? 3 : 2.5}"/>
          <!-- Inner dot (for selected) -->
          ${isSelected ? `<circle cx="18" cy="16" r="6" fill="white"/>` : ''}
        </svg>
        <!-- Glow ring (selected only) -->
        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -8px;
            border: 2px solid rgba(5,150,105,0.35);
            border-radius: 50%;
            animation: dm-pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
    `,
  });

// ──────────────────────────────────────────────────────────────
// MAP EVENT LISTENERS (re-centering & interactions)
// ──────────────────────────────────────────────────────────────
const MapController = ({ selectedDest, onSelect, destinationsBounds }) => {
  const map = useMap();

  useMapEvents({
    click() { onSelect(null); },
  });

  // Fit bounds when destinations change
  useEffect(() => {
    if (destinationsBounds && destinationsBounds.length > 0) {
      map.fitBounds(destinationsBounds, { padding: [50, 50], maxZoom: 8, animate: true });
    }
  }, [destinationsBounds, map]);

  // Re-center on selection
  useEffect(() => {
    if (selectedDest) {
      const { latitude, longitude } = selectedDest.mapPosition || selectedDest;
      if (latitude != null && longitude != null) {
        map.flyTo([latitude, longitude], 10, { duration: 1.2 });
      }
    }
  }, [selectedDest, map]);

  return null;
};

// ──────────────────────────────────────────────────────────────
// DESTINATION MARKER POPUP CARD
// ──────────────────────────────────────────────────────────────
const DestinationPopup = ({ destination }) => {
  const d = useMemo(() => {
    const img = destination.images?.[0] || destination.image_url || destination.imageUrl || null;
    return {
      id: destination.id,
      name: destination.name || "Unnamed Destination",
      type: destination.category || destination.type || "Destination",
      rating: destination.rating || null,
      reviews: destination.reviews || destination.review_count || null,
      imageUrl: img,
      slug: destination.slug || destination.id,
      mapPosition: destination.mapPosition || {
        lat: destination.latitude || destination.lat,
        lng: destination.longitude || destination.lng,
      },
    };
  }, [destination]);

  return (
    <div style={{ minWidth: 260, fontFamily: "'Poppins', sans-serif" }}>
      {d.imageUrl ? (
        <img
          src={d.imageUrl}
          alt={d.name}
          style={{
            width: "100%", height: 140, objectFit: "cover",
            borderRadius: "12px 12px 0 0",
            margin: 0,
          }}
        />
      ) : (
        <div style={{
          width: "100%", height: 140,
          background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48, color: "#81c784",
          borderRadius: "12px 12px 0 0",
        }}>
          🗺️
        </div>
      )}

      <div style={{ padding: 14 }}>
        <span style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #059669, #047857)",
          color: "#fff",
          padding: "5px 12px",
          borderRadius: 30,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          {d.type}
        </span>

        <Link
          to={`/destinations/${d.slug}`}
          style={{
            textDecoration: "none",
            color: "#111827",
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.25,
            display: "block",
            marginBottom: d.rating ? 4 : 0,
          }}
        >
          {d.name}
        </Link>

        {d.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <FiStar size={14} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
            <span style={{ fontWeight: 700, color: "#111827" }}>{d.rating}</span>
            {d.reviews != null && (
              <span style={{ fontSize: 12, color: "#6B7280" }}>({d.reviews} reviews)</span>
            )}
          </div>
        )}

        <Link
          to={`/destinations/${d.slug}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 16px",
            background: "linear-gradient(135deg, #059669, #047857)",
            color: "white",
            borderRadius: 12,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
            transition: "all 0.2s ease",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(5,150,105,0.35)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          View Details <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// LOADING SKELETON
// ──────────────────────────────────────────────────────────────
const MapSkeleton = ({ height = 500 }) => (
  <div style={{
    width: "100%", height,
    background: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  }}>
    <div style={{
      width: 64, height: 64,
      borderRadius: "50%",
      background: "rgba(5,150,105,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "dm-pulse 1.5s infinite",
    }}>
      <FiMapPin size={28} color="#059669" />
    </div>
    <div style={{
      width: 180, height: 10,
      borderRadius: 5,
      background: "rgba(5,150,105,0.15)",
    }} />
    <div style={{ fontSize: 14, color: "#059669", fontWeight: 500 }}>
      Loading destinations map…
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────
// ERROR STATE
// ──────────────────────────────────────────────────────────────
const MapError = ({ message, onRetry }) => (
  <div style={{
    width: "100%",
    padding: 60,
    textAlign: "center",
    background: "radial-gradient(circle at center, #f0fdf4, #dcfce7)",
    borderRadius: 20,
    border: "2px solid rgba(5,150,105,0.12)",
  }}>
    <FiMapPin size={56} color="#EF4444" style={{ marginBottom: 16 }} />
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 24,
      color: "#991B1B",
      margin: "0 0 12px 0",
    }}>
      Map Unavailable
    </h3>
    <p style={{ color: "#B91C1C", marginBottom: 24, lineHeight: 1.6 }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        padding: "12px 28px",
        background: "linear-gradient(135deg, #059669, #047857)",
        color: "white",
        border: "none",
        borderRadius: 30,
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
      }}
    >
      Retry
    </button>
  </div>
);

// ──────────────────────────────────────────────────────────────
// EMPTY STATE (no coordinates)
// ──────────────────────────────────────────────────────────────
const MapEmpty = ({ countryName }) => (
  <div style={{
    width: "100%",
    padding: 60,
    textAlign: "center",
    background: "radial-gradient(circle at center, #f0fdf4, #dcfce7)",
    borderRadius: 20,
  }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>🗺️</div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 24,
      color: "#065F46",
      margin: "0 0 10px 0",
    }}>
      No Location Data
    </h3>
    <p style={{ color: "#059669", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
      Destinations in {countryName} don't have coordinates yet. Check back soon!
    </p>
  </div>
);

// ──────────────────────────────────────────────────────────────
// GLOBAL KEYFRAMES (injected once)
// ──────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("destination-map-styles")) return;
  const style = document.createElement("style");
  style.id = "destination-map-styles";
  style.textContent = `
    @keyframes dm-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
      70%      { box-shadow: 0 0 0 16px rgba(5,150,105,0); }
    }

    .dm-legend {
      font-family: 'Inter', 'Poppins', sans-serif;
      background: white;
      padding: 12px 18px;
      border-radius: 14px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      font-size: 12px;
      font-weight: 500;
      color: #374151;
    }

    .dm-legend-item {
      display: flex; align-items: center; gap: 8px;
    }

    .dm-legend-dot {
      width: 11px; height: 11px; border-radius: 50%;
      background: linear-gradient(135deg, #059669, #10B981);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(5,150,105,0.4);
    }

    /* Popup override for cleaner look */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
      padding: 0;
      overflow: hidden;
    }
    .leaflet-popup-content { margin: 0; min-width: 260px; }
    .leaflet-popup-tip { background: white; }
    .leaflet-popup-close-button { display: none; }

    /* Map container */
    .dm-map-container .leaflet-container {
      border-radius: 20px;
      border: 3px solid rgba(5,150,105,0.12);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
/**
 * DestinationMap — Displays multiple destinations on an interactive Leaflet map.
 *
 * Props:
 *   destinations (array) — required — Array of destination objects with coordinates
 *   height (number|string) — optional — Map height (default: 500px)
 *   showStats (boolean) — optional — Show destination count in corner
 *   className (string) — optional — Additional CSS class
 *
 * Destination object should include:
 *   - id, name, category/type, slug
 *   - latitude & longitude OR mapPosition: { lat, lng }
 *   - images[] optional
 *   - rating optional
 */
const DestinationMap = ({
  destinations = [],
  height = 500,
  showStats = true,
  className = "",
}) => {
  injectStyles();
  const [selectedDest, setSelectedDest] = useState(null);
  const [hoveredDestId, setHoveredDestId] = useState(null);

  // Filter destinations with valid coordinates
  const withCoords = useMemo(() =>
    destinations.filter(
      (d) => {
        const lat = d.latitude ?? d.mapPosition?.lat;
        const lng = d.longitude ?? d.mapPosition?.lng;
        return lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
      }
    ), [destinations]);

  // Compute bounds for auto-fitting map
  const bounds = useMemo(() => {
    if (withCoords.length === 0) return null;
    return withCoords.map((d) => [
      Number(d.latitude || d.mapPosition?.lat),
      Number(d.longitude || d.mapPosition?.lng),
    ]);
  }, [withCoords]);

  // Loading state (if no destinations passed yet)
  if (!destinations.length) return <MapSkeleton height={height} />;

  // Empty/no-coords state
  if (withCoords.length === 0) {
    return (
      <div style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, #f0fdf4, #dcfce7)",
        borderRadius: 20,
      }}>
        <div style={{ textAlign: "center", color: "#059669" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🗺️</div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            color: "#065F46",
            margin: "0 0 10px 0",
          }}>
            No Location Data
          </h3>
          <p>No destinations with coordinates available.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dm-map-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: 20,
        overflow: "hidden",
        border: "3px solid rgba(5,150,105,0.12)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
      }}
    >
      <MapContainer
        center={bounds[0]}
        zoom={6}
        minZoom={3}
        maxZoom={15}
        zoomControl={true}
        attributionControl={true}
        style={{ width: "100%", height: "100%" }}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50], maxZoom: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedDest={selectedDest}
          onSelect={setSelectedDest}
          destinationsBounds={bounds}
        />

        {/* Render a marker for each destination */}
        {withCoords.map((d) => {
          const lat = Number(d.latitude || d.mapPosition?.lat);
          const lng = Number(d.longitude || d.mapPosition?.lng);
          const isHovered = hoveredDestId === d.id;
          const isSelected = selectedDest?.id === d.id;

          const markerIcon = createMarkerIcon(isSelected || isHovered);

          return (
            <Marker
              key={d.id}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => setSelectedDest(isSelected ? null : d),
                mouseover: () => setHoveredDestId(d.id),
                mouseout: () => setHoveredDestId(null),
              }}
            >
              <Popup>
                <DestinationPopup destination={d} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Stats badge (optional) */}
      {showStats && (
        <div style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          padding: "10px 16px",
          borderRadius: 14,
          border: "1px solid rgba(5,150,105,0.15)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#059669",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <FiMapPin size={16} />
          {withCoords.length} destination{withCoords.length !== 1 ? "s" : ""} mapped
        </div>
      )}

      {/* Legend */}
      {withCoords.length > 0 && (
        <div className="dm-legend" style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div className="dm-legend-item">
            <div className="dm-legend-dot" />
            <span>Destination</span>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes
DestinationMap.propTypes = {
  destinations: PropTypes.arrayOf(PropTypes.object),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showStats: PropTypes.bool,
  className: PropTypes.string,
};

DestinationMap.displayName = "DestinationMap";

export default DestinationMap;
