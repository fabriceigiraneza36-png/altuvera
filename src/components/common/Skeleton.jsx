import React from "react";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, rgba(2,44,34,0.06) 0%, rgba(16,185,129,0.14) 45%, rgba(2,44,34,0.06) 100%)",
  backgroundSize: "200% 100%",
  animation: "altu-skeleton-shimmer 1.15s ease-in-out infinite",
};

export function Skeleton({
  height = 14,
  width = "100%",
  radius = 10,
  style,
  className,
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        ...shimmerStyle,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, lineHeight = 14, gap = 10 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : gap }}>
          <Skeleton
            height={lineHeight}
            width={i === lines - 1 ? "82%" : "100%"}
            radius={8}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ style }) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: "1px solid rgba(5,150,105,0.14)",
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 18px 50px rgba(2,44,34,.06)",
        overflow: "hidden",
        ...style,
      }}
      aria-hidden="true"
    >
      <Skeleton height={210} radius={0} />
      <div style={{ padding: 18 }}>
        <Skeleton height={12} width={120} radius={999} />
        <div style={{ height: 12 }} />
        <Skeleton height={20} width={"88%"} radius={12} />
        <div style={{ height: 10 }} />
        <SkeletonText lines={3} lineHeight={14} gap={10} />
        <div style={{ height: 16 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <Skeleton height={34} width={110} radius={999} />
          <Skeleton height={34} width={90} radius={999} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonKeyframes() {
  return (
    <style>
      {`
        @keyframes altu-skeleton-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}
    </style>
  );
}

