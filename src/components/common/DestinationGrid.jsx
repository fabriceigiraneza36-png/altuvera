// src/components/destinations/DestinationGrid.jsx
import { memo } from "react";
import DestinationCard from "./DestinationCard";

const Skeleton = ({ compact }) => (
  <div style={{
    borderRadius: compact ? 20 : 26, overflow: "hidden",
    background: "#fff", border: "1px solid #e5e7eb",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  }}>
    <div style={{
      height: compact ? 220 : 280,
      background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
    <div style={{ padding: compact ? "16px 18px" : "22px 24px" }}>
      {[80, 60, 90].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 20 : 14, borderRadius: 8, marginBottom: 10,
          width: `${w}%`,
          background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }} />
      ))}
    </div>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

const EmptyState = ({ message = "No destinations found", onReset }) => (
  <div style={{
    gridColumn: "1 / -1", textAlign: "center",
    padding: "80px 20px",
  }}>
    <div style={{ fontSize: 64, marginBottom: 20 }}>🌍</div>
    <h3 style={{ color: "#374151", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
      {message}
    </h3>
    <p style={{ color: "#9ca3af", marginBottom: 24 }}>
      Try adjusting your filters or search terms
    </p>
    {onReset && (
      <button
        onClick={onReset}
        style={{
          background: "#10b981", color: "#fff", border: "none",
          borderRadius: 12, padding: "12px 28px",
          fontWeight: 700, cursor: "pointer", fontSize: 15,
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
);

const DestinationGrid = memo(({
  destinations = [],
  loading       = false,
  error         = null,
  compact       = false,
  skeletonCount = 6,
  columns       = { default: 1, sm: 2, lg: 3 },
  onWishlistToggle,
  onReset,
  emptyMessage,
  style = {},
}) => {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? "280px" : "320px"}, 1fr))`,
    gap: compact ? 20 : 28,
    ...style,
  };

  if (error) return (
    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
    </div>
  );

  return (
    <div style={gridStyle}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => <Skeleton key={i} compact={compact} />)
        : destinations.length === 0
          ? <EmptyState message={emptyMessage} onReset={onReset} />
          : destinations.map((dest, i) => (
              <DestinationCard
                key={dest.slug || dest.id || i}
                destination={dest}
                compact={compact}
                priority={i === 0}
                onWishlistToggle={onWishlistToggle}
              />
            ))
      }
    </div>
  );
});

DestinationGrid.displayName = "DestinationGrid";
export default DestinationGrid;