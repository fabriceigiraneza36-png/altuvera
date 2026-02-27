// src/pages/InteractiveMap.jsx

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  FiMapPin,
  FiArrowRight,
  FiZoomIn,
  FiZoomOut,
  FiSearch,
  FiShuffle,
  FiMap,
  FiGlobe,
  FiLayers,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiClock,
  FiStar,
  FiRefreshCw,
  FiAlertCircle,
  FiCompass,
  FiNavigation,
  FiMaximize2,
  FiGrid,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { useCountries } from "../hooks/useCountries";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════════ */
const injectStyles = `
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.6); }
    70%  { box-shadow: 0 0 0 14px rgba(5,150,105,0); }
    100% { box-shadow: 0 0 0 0 rgba(5,150,105,0); }
  }
  @keyframes markerBounce {
    0%, 100% { transform: translate(-50%,-50%) scale(1); }
    50%      { transform: translate(-50%,-50%) scale(1.2); }
  }
  @keyframes slideInInfo {
    from { opacity: 0; transform: translateY(16px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes progressLine {
    from { width: 0; }
    to   { width: 100%; }
  }
  .imap-scroll-track::-webkit-scrollbar { height: 5px; }
  .imap-scroll-track::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.04); border-radius: 3px;
  }
  .imap-scroll-track::-webkit-scrollbar-thumb {
    background: #059669; border-radius: 3px;
  }
  .imap-country-list::-webkit-scrollbar { width: 4px; }
  .imap-country-list::-webkit-scrollbar-track { background: transparent; }
  .imap-country-list::-webkit-scrollbar-thumb {
    background: #D1D5DB; border-radius: 2px;
  }
`;

/* ═══════════════════════════════════════════════════════
   MAP VIEWS
   ═══════════════════════════════════════════════════════ */
const mapViews = {
  physical: {
    name: "Terrain",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1400&q=85",
    icon: <FiMap size={15} />,
    overlay:
      "linear-gradient(135deg, rgba(2,44,34,0.45) 0%, rgba(5,150,105,0.25) 100%)",
  },
  satellite: {
    name: "Satellite",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&q=85",
    icon: <FiGlobe size={15} />,
    overlay:
      "linear-gradient(135deg, rgba(15,23,42,0.5) 0%, rgba(30,58,138,0.3) 100%)",
  },
  political: {
    name: "Political",
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=85",
    icon: <FiLayers size={15} />,
    overlay:
      "linear-gradient(135deg, rgba(30,41,59,0.45) 0%, rgba(99,102,241,0.2) 100%)",
  },
};

/* ═══════════════════════════════════════════════════════
   PREDEFINED MARKER POSITIONS
   ═══════════════════════════════════════════════════════ */
const countryPositions = {
  kenya: { top: "45%", left: "65%" },
  tanzania: { top: "60%", left: "60%" },
  uganda: { top: "40%", left: "50%" },
  rwanda: { top: "52%", left: "45%" },
  burundi: { top: "58%", left: "44%" },
  ethiopia: { top: "25%", left: "65%" },
  "south-sudan": { top: "30%", left: "50%" },
  eritrea: { top: "18%", left: "70%" },
  djibouti: { top: "22%", left: "78%" },
  somalia: { top: "35%", left: "80%" },
};

/* ═══════════════════════════════════════════════════════
   SKELETON LOADERS
   ═══════════════════════════════════════════════════════ */
const shimmerBg = {
  background:
    "linear-gradient(110deg, #e2e8f0 8%, #f1f5f9 18%, #e2e8f0 33%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease infinite",
};

const SkeletonMap = () => (
  <div style={{ borderRadius: "24px", height: "600px", ...shimmerBg }} />
);

const SkeletonSidebar = () => (
  <div
    style={{
      borderRadius: "24px",
      height: "500px",
      ...shimmerBg,
    }}
  />
);

const SkeletonCard = () => (
  <div
    style={{
      flex: "0 0 240px",
      height: "140px",
      borderRadius: "18px",
      ...shimmerBg,
    }}
  />
);

/* ═══════════════════════════════════════════════════════
   ERROR DISPLAY
   ═══════════════════════════════════════════════════════ */
const ErrorDisplay = ({ message, onRetry }) => (
  <div
    style={{
      textAlign: "center",
      padding: "80px 24px",
      background: "linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)",
      borderRadius: "28px",
      maxWidth: "520px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        width: "76px",
        height: "76px",
        borderRadius: "50%",
        background: "#FEE2E2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
      }}
    >
      <FiAlertCircle size={34} color="#DC2626" />
    </div>
    <h3
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "24px",
        color: "#991B1B",
        marginBottom: "10px",
      }}
    >
      Map Data Unavailable
    </h3>
    <p style={{ color: "#B91C1C", marginBottom: "28px", lineHeight: 1.6 }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "13px 34px",
        background: "linear-gradient(135deg, #059669, #047857)",
        color: "#fff",
        border: "none",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "600",
        boxShadow: "0 4px 20px rgba(5,150,105,0.3)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(5,150,105,0.4)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,150,105,0.3)";
      }}
    >
      <FiRefreshCw size={17} /> Reload Map
    </button>
  </div>
);

ErrorDisplay.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

/* ═══════════════════════════════════════════════════════
   MAP MARKER (memoized)
   ═══════════════════════════════════════════════════════ */
const MapMarker = React.memo(
  ({ country, isSelected, isHovered, onClick, onHover, position }) => {
    const size = isSelected ? "30px" : isHovered ? "26px" : "20px";

    return (
      <div
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          transform: "translate(-50%, -50%)",
          cursor: "pointer",
          zIndex: isSelected ? 25 : isHovered ? 20 : 10,
          transition: "z-index 0s",
        }}
        onClick={() => onClick(country)}
        onMouseOver={() => onHover(country)}
        onMouseOut={() => onHover(null)}
        onFocus={() => onHover(country)}
        onBlur={() => onHover(null)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${country.name}`}
        onKeyDown={(e) => e.key === "Enter" && onClick(country)}
      >
        {/* Pulse ring */}
        {isSelected && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "2px solid rgba(5,150,105,0.4)",
              animation: "pulse 2s infinite",
            }}
          />
        )}

        {/* Dot */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: isSelected
              ? "linear-gradient(135deg, #059669, #34D399)"
              : isHovered
                ? "#10B981"
                : "rgba(16,185,129,0.85)",
            border: isSelected
              ? "3px solid #fff"
              : "2.5px solid rgba(255,255,255,0.9)",
            boxShadow: isSelected
              ? "0 0 20px rgba(5,150,105,0.5)"
              : "0 2px 10px rgba(0,0,0,0.25)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
            animation:
              isSelected || isHovered ? "markerBounce 0.4s ease" : "none",
          }}
        />

        {/* Tooltip */}
        {(isHovered || isSelected) && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: "14px",
              padding: "10px 16px",
              backgroundColor: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              pointerEvents: "none",
              zIndex: 35,
              border: "1px solid rgba(5,150,105,0.15)",
              animation: "slideInInfo 0.25s ease",
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(255,255,255,0.97)",
                border: "1px solid rgba(5,150,105,0.15)",
                borderTop: "none",
                borderLeft: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "22px" }}>{country.flag}</span>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {country.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#059669",
                    fontWeight: "500",
                    marginTop: "2px",
                  }}
                >
                  {country.capital}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MapMarker.displayName = "MapMarker";
MapMarker.propTypes = {
  country: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  isHovered: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onHover: PropTypes.func.isRequired,
  position: PropTypes.object.isRequired,
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const InteractiveMap = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [mapView, setMapView] = useState("physical");
  const [searchTerm, setSearchTerm] = useState("");
  const [panelTab, setPanelTab] = useState("list");
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const trackRef = useRef(null);

  const { countries, loading, error, refetch } = useCountries();

  /* ── Filtered countries ── */
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const q = searchTerm.toLowerCase();
    return countries.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q) ||
        c.tagline?.toLowerCase().includes(q)
    );
  }, [searchTerm, countries]);

  /* ── Handlers ── */
  const handleSelect = useCallback((country) => {
    setSelectedCountry((prev) =>
      prev?.id === country.id ? null : country
    );
    setPanelTab("detail");
  }, []);

  const handleHover = useCallback((c) => setHoveredCountry(c), []);

  const handleRandom = useCallback(() => {
    if (countries.length === 0) return;
    const idx = Math.floor(Math.random() * countries.length);
    setSelectedCountry(countries[idx]);
    setPanelTab("detail");
  }, [countries]);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(z + 0.25, 2.5)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z - 0.25, 0.5)),
    []
  );
  const zoomReset = useCallback(() => setZoom(1), []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        }
        if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        }
        if (e.key === "0") {
          e.preventDefault();
          zoomReset();
        }
      }
      if (e.key === "Escape") setSelectedCountry(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoomIn, zoomOut, zoomReset]);

  /* ── Scroll selected card into view ── */
  useEffect(() => {
    if (!trackRef.current || !selectedCountry) return;
    const idx = countries.findIndex((c) => c.id === selectedCountry.id);
    const child = trackRef.current.children[idx];
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedCountry, countries]);

  /* ── Current map config ── */
  const currentMap = mapViews[mapView];

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ backgroundColor: "#F7FDF9", minHeight: "100vh" }}>
      <style>{injectStyles}</style>

      <PageHeader
        title="Interactive Map"
        subtitle="Navigate East Africa's most extraordinary destinations through our immersive explorer"
        backgroundImage="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920"
        breadcrumbs={[{ label: "Interactive Map" }]}
      />

      <section style={{ padding: "48px 24px 100px" }}>
        <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
          {/* ── ERROR ── */}
          {error && <ErrorDisplay message={error} onRetry={refetch} />}

          {/* ── LOADING ── */}
          {loading && !error && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 380px",
                  gap: "28px",
                  marginBottom: "36px",
                }}
              >
                <SkeletonMap />
                <SkeletonSidebar />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  overflow: "hidden",
                }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── MAIN ── */}
          {!loading && !error && countries.length > 0 && (
            <>
              {/* ═══════ MAP + SIDEBAR GRID ═══════ */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 380px",
                  gap: "28px",
                  marginBottom: "36px",
                  alignItems: "start",
                }}
              >
                {/* ── MAP AREA ── */}
                <AnimatedSection animation="fadeInUp">
                  <div
                    style={{
                      position: "relative",
                      backgroundColor: "#fff",
                      borderRadius: "28px",
                      overflow: "hidden",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Map surface */}
                    <div
                      ref={mapRef}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "620px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Background */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `url(${currentMap.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          transform: `scale(${zoom})`,
                          transition:
                            "transform 0.4s cubic-bezier(0.4,0,0.2,1), background-image 0.6s ease",
                          transformOrigin: "center center",
                        }}
                      />

                      {/* Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: currentMap.overlay,
                          pointerEvents: "none",
                        }}
                      />

                      {/* Markers */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          transform: `scale(${zoom})`,
                          transition:
                            "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
                          transformOrigin: "center center",
                        }}
                      >
                        {countries.map((country) => {
                          const pos = countryPositions[country.id] ||
                            countryPositions[country.slug] || {
                              top: "50%",
                              left: "50%",
                            };
                          return (
                            <MapMarker
                              key={country.id}
                              country={country}
                              isSelected={
                                selectedCountry?.id === country.id
                              }
                              isHovered={
                                hoveredCountry?.id === country.id
                              }
                              onClick={handleSelect}
                              onHover={handleHover}
                              position={pos}
                            />
                          );
                        })}
                      </div>

                      {/* ── Top-left info badge ── */}
                      <div
                        style={{
                          position: "absolute",
                          top: "20px",
                          left: "20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 18px",
                          backgroundColor: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(14px)",
                          borderRadius: "14px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          zIndex: 20,
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        <FiCompass size={16} color="#059669" />
                        <span>
                          <strong>{countries.length}</strong> countries •{" "}
                          {currentMap.name} view
                        </span>
                      </div>

                      {/* ── Map view toggle ── */}
                      <div
                        style={{
                          position: "absolute",
                          top: "20px",
                          right: "20px",
                          display: "flex",
                          gap: "4px",
                          padding: "5px",
                          backgroundColor: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(14px)",
                          borderRadius: "16px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                          zIndex: 20,
                        }}
                      >
                        {Object.entries(mapViews).map(([key, view]) => (
                          <button
                            key={key}
                            onClick={() => setMapView(key)}
                            aria-label={`${view.name} view`}
                            aria-pressed={mapView === key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                              padding: "9px 16px",
                              borderRadius: "12px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.25s ease",
                              backgroundColor:
                                mapView === key
                                  ? "#059669"
                                  : "transparent",
                              color:
                                mapView === key ? "#fff" : "#4B5563",
                            }}
                            onMouseOver={(e) => {
                              if (mapView !== key) {
                                e.currentTarget.style.backgroundColor =
                                  "#F3F4F6";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (mapView !== key) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                          >
                            {view.icon}
                            {view.name}
                          </button>
                        ))}
                      </div>

                      {/* ── Zoom controls ── */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "20px",
                          right: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          zIndex: 20,
                        }}
                      >
                        {[
                          {
                            icon: <FiZoomIn size={18} />,
                            fn: zoomIn,
                            label: "Zoom in",
                          },
                          {
                            icon: <FiZoomOut size={18} />,
                            fn: zoomOut,
                            label: "Zoom out",
                          },
                          {
                            icon: <FiMaximize2 size={16} />,
                            fn: zoomReset,
                            label: "Reset",
                          },
                        ].map((btn, i) => (
                          <button
                            key={i}
                            onClick={btn.fn}
                            aria-label={btn.label}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "13px",
                              backgroundColor:
                                "rgba(255,255,255,0.92)",
                              backdropFilter: "blur(14px)",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#374151",
                              boxShadow:
                                "0 3px 14px rgba(0,0,0,0.1)",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "#059669";
                              e.currentTarget.style.color = "#fff";
                              e.currentTarget.style.transform =
                                "scale(1.08)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(255,255,255,0.92)";
                              e.currentTarget.style.color = "#374151";
                              e.currentTarget.style.transform =
                                "scale(1)";
                            }}
                          >
                            {btn.icon}
                          </button>
                        ))}

                        {/* Zoom level indicator */}
                        <div
                          style={{
                            textAlign: "center",
                            padding: "6px 0",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                          }}
                        >
                          {Math.round(zoom * 100)}%
                        </div>
                      </div>

                      {/* ── Bottom legend bar ── */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "20px",
                          left: "20px",
                          display: "flex",
                          gap: "16px",
                          padding: "10px 18px",
                          backgroundColor: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(14px)",
                          borderRadius: "14px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          zIndex: 20,
                          fontSize: "12px",
                          color: "#6B7280",
                          fontWeight: "500",
                        }}
                      >
                        {[
                          { color: "#10B981", label: "Destinations" },
                          { color: "#059669", label: "Selected" },
                          { color: "#FBBF24", label: "Hovered" },
                        ].map((item) => (
                          <span
                            key={item.label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: item.color,
                                boxShadow: `0 0 6px ${item.color}60`,
                              }}
                            />
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* ── SIDEBAR PANEL ── */}
                <AnimatedSection animation="fadeInUp">
                  <div
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "28px",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      position: "sticky",
                      top: "100px",
                    }}
                  >
                    {/* Panel header */}
                    <div
                      style={{
                        padding: "28px 28px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "20px",
                        }}
                      >
                        <h3
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#111827",
                            margin: 0,
                          }}
                        >
                          {selectedCountry
                            ? selectedCountry.name
                            : "Explorer"}
                        </h3>
                        <FiNavigation
                          size={20}
                          color="#059669"
                          style={{
                            transform: selectedCountry
                              ? "rotate(45deg)"
                              : "none",
                            transition: "transform 0.3s",
                          }}
                        />
                      </div>

                      {/* Tabs */}
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          padding: "4px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "14px",
                          marginBottom: "20px",
                        }}
                      >
                        {[
                          { key: "list", label: "Countries", icon: <FiGrid size={14} /> },
                          { key: "detail", label: "Details", icon: <FiInfo size={14} /> },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setPanelTab(tab.key)}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "7px",
                              padding: "10px",
                              borderRadius: "11px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.25s",
                              backgroundColor:
                                panelTab === tab.key
                                  ? "#fff"
                                  : "transparent",
                              color:
                                panelTab === tab.key
                                  ? "#111827"
                                  : "#9CA3AF",
                              boxShadow:
                                panelTab === tab.key
                                  ? "0 2px 8px rgba(0,0,0,0.08)"
                                  : "none",
                            }}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Panel body */}
                    <div style={{ padding: "0 28px 28px" }}>
                      {/* ── LIST TAB ── */}
                      {panelTab === "list" && (
                        <>
                          {/* Search */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "11px 14px",
                              backgroundColor: "#F9FAFB",
                              borderRadius: "14px",
                              border: "2px solid transparent",
                              transition: "border-color 0.2s, box-shadow 0.2s",
                              marginBottom: "14px",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#10B981";
                              e.currentTarget.style.boxShadow =
                                "0 0 0 4px rgba(16,185,129,0.08)";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor =
                                "transparent";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <FiSearch size={16} color="#9CA3AF" />
                            <input
                              ref={searchRef}
                              type="text"
                              placeholder="Search countries..."
                              value={searchTerm}
                              onChange={(e) =>
                                setSearchTerm(e.target.value)
                              }
                              aria-label="Search countries"
                              style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                fontSize: "14px",
                                outline: "none",
                                color: "#111827",
                              }}
                            />
                            {searchTerm && (
                              <button
                                onClick={() => {
                                  setSearchTerm("");
                                  searchRef.current?.focus();
                                }}
                                aria-label="Clear search"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#9CA3AF",
                                  padding: "2px",
                                  display: "flex",
                                }}
                              >
                                <FiX size={15} />
                              </button>
                            )}
                          </div>

                          {/* Random button */}
                          <button
                            onClick={handleRandom}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "9px",
                              width: "100%",
                              padding: "12px",
                              background:
                                "linear-gradient(135deg, #059669, #047857)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "14px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              marginBottom: "16px",
                              transition:
                                "transform 0.2s, box-shadow 0.2s",
                              boxShadow:
                                "0 4px 16px rgba(5,150,105,0.25)",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 8px 24px rgba(5,150,105,0.35)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(5,150,105,0.25)";
                            }}
                          >
                            <FiShuffle size={16} />
                            Surprise Me
                          </button>

                          {/* Country list */}
                          <div
                            className="imap-country-list"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              maxHeight: "380px",
                              overflowY: "auto",
                              paddingRight: "4px",
                            }}
                          >
                            {filtered.length > 0 ? (
                              filtered.map((country) => {
                                const isActive =
                                  selectedCountry?.id === country.id;
                                return (
                                  <div
                                    key={country.id}
                                    onClick={() =>
                                      handleSelect(country)
                                    }
                                    onMouseOver={() =>
                                      handleHover(country)
                                    }
                                    onMouseOut={() =>
                                      handleHover(null)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select ${country.name}`}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleSelect(country)
                                    }
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "14px",
                                      padding: "14px",
                                      borderRadius: "16px",
                                      cursor: "pointer",
                                      transition: "all 0.25s ease",
                                      backgroundColor: isActive
                                        ? "#ECFDF5"
                                        : "transparent",
                                      border: isActive
                                        ? "2px solid #059669"
                                        : "2px solid transparent",
                                      boxShadow: isActive
                                        ? "0 4px 14px rgba(5,150,105,0.1)"
                                        : "none",
                                    }}
                                    onMouseOverCapture={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor =
                                          "#F9FAFB";
                                        e.currentTarget.style.transform =
                                          "translateX(4px)";
                                      }
                                    }}
                                    onMouseOutCapture={(e) => {
                                      if (!isActive) {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                        e.currentTarget.style.transform =
                                          "translateX(0)";
                                      }
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "30px",
                                        filter:
                                          "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
                                      }}
                                    >
                                      {country.flag}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontSize: "15px",
                                          fontWeight: "600",
                                          color: "#111827",
                                          marginBottom: "3px",
                                        }}
                                      >
                                        {country.name}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          color: "#6B7280",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {country.capital}
                                        {country.tagline &&
                                          ` • ${country.tagline}`}
                                      </div>
                                    </div>
                                    <FiArrowRight
                                      size={16}
                                      color={
                                        isActive
                                          ? "#059669"
                                          : "#D1D5DB"
                                      }
                                      style={{
                                        transition: "color 0.2s",
                                        flexShrink: 0,
                                      }}
                                    />
                                  </div>
                                );
                              })
                            ) : (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "48px 16px",
                                  color: "#9CA3AF",
                                }}
                              >
                                <FiSearch
                                  size={28}
                                  style={{
                                    marginBottom: "12px",
                                    opacity: 0.4,
                                  }}
                                />
                                <p
                                  style={{
                                    fontSize: "14px",
                                    marginBottom: "12px",
                                  }}
                                >
                                  No countries match "{searchTerm}"
                                </p>
                                <button
                                  onClick={() => {
                                    setSearchTerm("");
                                    searchRef.current?.focus();
                                  }}
                                  style={{
                                    color: "#059669",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Clear search
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* ── DETAIL TAB ── */}
                      {panelTab === "detail" && (
                        <>
                          {selectedCountry ? (
                            <div
                              style={{ animation: "slideInInfo 0.35s ease" }}
                            >
                              {/* Flag + name hero */}
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "28px 0 24px",
                                  background:
                                    "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                                  borderRadius: "20px",
                                  marginBottom: "24px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "64px",
                                    display: "block",
                                    marginBottom: "12px",
                                    filter:
                                      "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                  }}
                                >
                                  {selectedCountry.flag}
                                </span>
                                <h4
                                  style={{
                                    fontFamily:
                                      "'Playfair Display', serif",
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    color: "#111827",
                                    margin: "0 0 6px",
                                  }}
                                >
                                  {selectedCountry.name}
                                </h4>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#059669",
                                    fontWeight: "500",
                                  }}
                                >
                                  {selectedCountry.tagline ||
                                    "East Africa"}
                                </span>
                              </div>

                              {/* Description */}
                              <p
                                style={{
                                  fontSize: "14px",
                                  color: "#4B5563",
                                  lineHeight: 1.7,
                                  marginBottom: "24px",
                                }}
                              >
                                {selectedCountry.description ||
                                  `Discover the beauty of ${selectedCountry.name}, a jewel of East Africa with stunning landscapes and vibrant culture.`}
                              </p>

                              {/* Info grid */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "12px",
                                  marginBottom: "24px",
                                }}
                              >
                                {[
                                  {
                                    label: "Capital",
                                    value: selectedCountry.capital,
                                    icon: (
                                      <FiMapPin
                                        size={14}
                                        color="#059669"
                                      />
                                    ),
                                  },
                                  {
                                    label: "Best Time",
                                    value:
                                      selectedCountry.bestTime ||
                                      "Year-round",
                                    icon: (
                                      <FiClock
                                        size={14}
                                        color="#0891B2"
                                      />
                                    ),
                                  },
                                  {
                                    label: "Region",
                                    value:
                                      selectedCountry.region ||
                                      "East Africa",
                                    icon: (
                                      <FiGlobe
                                        size={14}
                                        color="#7C3AED"
                                      />
                                    ),
                                  },
                                  {
                                    label: "Highlights",
                                    value:
                                      selectedCountry.language ||
                                      "Safari & Culture",
                                    icon: (
                                      <FiStar
                                        size={14}
                                        color="#F59E0B"
                                      />
                                    ),
                                  },
                                ].map((item) => (
                                  <div
                                    key={item.label}
                                    style={{
                                      padding: "14px",
                                      backgroundColor: "#F9FAFB",
                                      borderRadius: "14px",
                                      border: "1px solid #F3F4F6",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      {item.icon}
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#9CA3AF",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.5px",
                                          fontWeight: "600",
                                        }}
                                      >
                                        {item.label}
                                      </span>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#111827",
                                      }}
                                    >
                                      {item.value}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* CTA */}
                              <Button
                                to={`/country/${selectedCountry.slug || selectedCountry.id}`}
                                variant="primary"
                                fullWidth
                                icon={<FiArrowRight size={18} />}
                              >
                                Explore {selectedCountry.name}
                              </Button>

                              <button
                                onClick={() => {
                                  setSelectedCountry(null);
                                  setPanelTab("list");
                                }}
                                style={{
                                  marginTop: "14px",
                                  width: "100%",
                                  padding: "10px",
                                  background: "none",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: "12px",
                                  color: "#6B7280",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.borderColor =
                                    "#059669";
                                  e.currentTarget.style.color =
                                    "#059669";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.borderColor =
                                    "#E5E7EB";
                                  e.currentTarget.style.color =
                                    "#6B7280";
                                }}
                              >
                                ← Back to all countries
                              </button>
                            </div>
                          ) : (
                            /* No selection placeholder */
                            <div
                              style={{
                                textAlign: "center",
                                padding: "60px 20px",
                              }}
                            >
                              <div
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 20px",
                                }}
                              >
                                <FiMapPin size={32} color="#059669" />
                              </div>
                              <h4
                                style={{
                                  fontFamily:
                                    "'Playfair Display', serif",
                                  fontSize: "20px",
                                  fontWeight: "700",
                                  color: "#111827",
                                  marginBottom: "8px",
                                }}
                              >
                                Select a Country
                              </h4>
                              <p
                                style={{
                                  fontSize: "14px",
                                  color: "#9CA3AF",
                                  lineHeight: 1.6,
                                  marginBottom: "24px",
                                }}
                              >
                                Click any marker on the map or choose
                                from the list
                              </p>
                              <button
                                onClick={() => setPanelTab("list")}
                                style={{
                                  padding: "10px 24px",
                                  backgroundColor: "#ECFDF5",
                                  color: "#059669",
                                  border: "none",
                                  borderRadius: "12px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#D1FAE5";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#ECFDF5";
                                }}
                              >
                                Browse Countries
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* ═══════ BOTTOM COUNTRY SLIDESHOW ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div>
                  {/* Section header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "26px",
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: "4px",
                        }}
                      >
                        Quick Navigate
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                        }}
                      >
                        Scroll through all {countries.length} East African
                        countries
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        {
                          icon: <FiChevronLeft size={18} />,
                          fn: () =>
                            trackRef.current?.scrollBy({
                              left: -300,
                              behavior: "smooth",
                            }),
                          label: "Scroll left",
                        },
                        {
                          icon: <FiChevronRight size={18} />,
                          fn: () =>
                            trackRef.current?.scrollBy({
                              left: 300,
                              behavior: "smooth",
                            }),
                          label: "Scroll right",
                        },
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.fn}
                          aria-label={btn.label}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#374151",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "#059669";
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor =
                              "#059669";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "#fff";
                            e.currentTarget.style.color = "#374151";
                            e.currentTarget.style.borderColor =
                              "#E5E7EB";
                          }}
                        >
                          {btn.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal scroll track */}
                  <div
                    ref={trackRef}
                    className="imap-scroll-track"
                    style={{
                      display: "flex",
                      gap: "18px",
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingBottom: "10px",
                      scrollBehavior: "smooth",
                    }}
                  >
                    {countries.map((country) => {
                      const isActive =
                        selectedCountry?.id === country.id;
                      return (
                        <div
                          key={country.id}
                          onClick={() => handleSelect(country)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View ${country.name}`}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleSelect(country)
                          }
                          style={{
                            flex: "0 0 240px",
                            scrollSnapAlign: "start",
                            position: "relative",
                            borderRadius: "20px",
                            overflow: "hidden",
                            cursor: "pointer",
                            height: "150px",
                            transition:
                              "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                            border: isActive
                              ? "3px solid #059669"
                              : "3px solid transparent",
                            boxShadow: isActive
                              ? "0 8px 28px rgba(5,150,105,0.2)"
                              : "0 4px 16px rgba(0,0,0,0.06)",
                            transform: isActive
                              ? "translateY(-4px)"
                              : "translateY(0)",
                          }}
                          onMouseOver={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.transform =
                                "translateY(-4px)";
                              e.currentTarget.style.boxShadow =
                                "0 8px 24px rgba(0,0,0,0.1)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.transform =
                                "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 16px rgba(0,0,0,0.06)";
                            }
                          }}
                        >
                          {/* Background image */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundImage: `url(${
                                country.image ||
                                country.thumbnail_url ||
                                `https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400`
                              })`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              transition: "transform 0.5s ease",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform =
                                "scale(1.08)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform =
                                "scale(1)")
                            }
                          />

                          {/* Gradient */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%)",
                            }}
                          />

                          {/* Active top bar */}
                          {isActive && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "3px",
                                background:
                                  "linear-gradient(90deg, #059669, #34D399)",
                              }}
                            />
                          )}

                          {/* Content */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: "16px",
                              display: "flex",
                              alignItems: "flex-end",
                              gap: "12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "28px",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                              }}
                            >
                              {country.flag}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "15px",
                                  fontWeight: "700",
                                  color: "#fff",
                                  marginBottom: "2px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {country.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#34D399",
                                  fontWeight: "500",
                                }}
                              >
                                {country.capital}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>

              {/* ═══════ STATS BAR ═══════ */}
              <AnimatedSection animation="fadeInUp">
                <div
                  style={{
                    marginTop: "56px",
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {[
                    {
                      icon: <FiGlobe size={24} />,
                      value: countries.length,
                      label: "Countries",
                      color: "#059669",
                      bg: "#ECFDF5",
                    },
                    {
                      icon: <FiMapPin size={24} />,
                      value: "50+",
                      label: "Destinations",
                      color: "#0891B2",
                      bg: "#ECFEFF",
                    },
                    {
                      icon: <FiCompass size={24} />,
                      value: "3",
                      label: "Map Views",
                      color: "#7C3AED",
                      bg: "#F5F3FF",
                    },
                    {
                      icon: <FiNavigation size={24} />,
                      value: "360°",
                      label: "Coverage",
                      color: "#DB2777",
                      bg: "#FDF2F8",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "22px",
                        padding: "28px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                        border: "1px solid #F3F4F6",
                        transition:
                          "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                        cursor: "default",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-6px)";
                        e.currentTarget.style.boxShadow = `0 16px 40px ${stat.color}15`;
                        e.currentTarget.style.borderColor = `${stat.color}25`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 12px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "#F3F4F6";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "16px",
                          backgroundColor: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily:
                              "'Playfair Display', serif",
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#111827",
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6B7280",
                            marginTop: "4px",
                            fontWeight: "500",
                          }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </>
          )}

          {/* ── EMPTY ── */}
          {!loading && !error && countries.length === 0 && (
            <div style={{ textAlign: "center", padding: "100px 24px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <FiMap size={44} color="#059669" />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "30px",
                  color: "#111827",
                  marginBottom: "10px",
                }}
              >
                No Countries Available
              </h3>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "16px",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                Country data is being prepared. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InteractiveMap;