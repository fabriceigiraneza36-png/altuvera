import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCompass, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ImageCycle from "../common/ImageCycle";

const EAST_AFRICA = new Set([
  "kenya",
  "tanzania",
  "uganda",
  "rwanda",
  "burundi",
  "ethiopia",
  "eritrea",
  "djibouti",
  "somalia",
  "south sudan",
]);

const FALLBACKS = [
  {
    id: "fallback-mara",
    name: "Maasai Mara",
    country: "Kenya",
    images: [
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    ],
  },
  {
    id: "fallback-serengeti",
    name: "Serengeti Plains",
    country: "Tanzania",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800",
    ],
  },
  {
    id: "fallback-bwindi",
    name: "Bwindi Forest",
    country: "Uganda",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800",
    ],
  },
];

const isEastAfrica = (destination) => {
  const country = String(destination?.country || "").trim().toLowerCase();
  if (country && EAST_AFRICA.has(country)) return true;
  const location = String(destination?.location || "").trim().toLowerCase();
  return [...EAST_AFRICA].some((c) => location.includes(c));
};

const pickShowcaseList = (destinations, loading) => {
  if (Array.isArray(destinations) && destinations.length > 0) {
    const ea = destinations.filter(isEastAfrica);
    const list = (ea.length ? ea : destinations).slice(0, 12);
    return list.length ? list : [];
  }
  if (loading) return [];
  return FALLBACKS;
};

export default function DestinationNameSlideshow({
  destinations = [],
  loading = false,
}) {
  const list = useMemo(
    () => pickShowcaseList(destinations, loading),
    [destinations, loading],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0 });
  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());

  useEffect(() => {
    if (!list.length) return;
    const t = setInterval(() => {
      setActiveIndex((p) => (p + 1) % list.length);
    }, 4500);
    return () => clearInterval(t);
  }, [list.length]);

  useEffect(() => {
    const idx = hoveredIndex ?? activeIndex;
    if (idx == null || !containerRef.current) return;
    const el = itemRefs.current.get(idx);
    if (!el) return;
    const crect = containerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = Math.max(
      12,
      Math.min(crect.width - 232, r.left - crect.left + r.width / 2 - 116),
    );
    const top = Math.max(16, r.top - crect.top - 250);
    setPopupPos({ left, top });
  }, [activeIndex, hoveredIndex]);

  const active = list[hoveredIndex ?? activeIndex];
  const activeImages = active?.images?.length ? active.images : [];

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(10px)",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <FiCompass size={14} />
          Destination Spotlight
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(26px, 3.6vw, 44px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "white",
          }}
        >
          Names that call you to go
        </div>
        <p
          style={{
            marginTop: 12,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 780,
            marginInline: "auto",
            lineHeight: 1.75,
            fontSize: 15,
          }}
        >
          Hover a destination to preview the vibe. Every location below comes
          from the live destinations feed (fallbacks appear only if the backend
          is unreachable).
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          aria-label="Previous destination"
          onClick={() =>
            setActiveIndex((p) => (p - 1 + (list.length || 1)) % (list.length || 1))
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "transform .2s ease, background .2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FiChevronLeft size={18} />
        </button>
        <div
          style={{
            flex: 1,
            maxWidth: 980,
            overflowX: "auto",
            padding: "10px 6px",
            scrollbarWidth: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              minWidth: "max-content",
            }}
          >
            {list.map((d, idx) => {
              const activeish = idx === (hoveredIndex ?? activeIndex);
              return (
                <motion.button
                  key={d.id || d.slug || `${d.name}-${idx}`}
                  type="button"
                  ref={(node) => {
                    if (!node) return;
                    itemRefs.current.set(idx, node);
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(idx)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setActiveIndex(idx)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 999,
                    border: activeish
                      ? "1px solid rgba(52,211,153,0.55)"
                      : "1px solid rgba(255,255,255,0.18)",
                    background: activeish
                      ? "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(255,255,255,0.06))"
                      : "rgba(255,255,255,0.06)",
                    color: "white",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: 10,
                    boxShadow: activeish
                      ? "0 18px 50px rgba(16,185,129,0.18)"
                      : "none",
                    transition: "all .25s ease",
                    backdropFilter: "blur(10px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 900,
                      fontSize: 18,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {d.name || "Destination"}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: activeish
                        ? "rgba(236,253,245,0.95)"
                        : "rgba(255,255,255,0.65)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {d.country || "East Africa"}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          aria-label="Next destination"
          onClick={() => setActiveIndex((p) => (p + 1) % (list.length || 1))}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "transform .2s ease, background .2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence>
        {!!activeImages.length && (
          <motion.div
            key={active?.id || active?.slug || activeIndex}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: popupPos.left,
              top: popupPos.top,
              width: 232,
              height: 232,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.38)",
              background: "rgba(2,44,34,0.6)",
              backdropFilter: "blur(12px)",
              pointerEvents: "none",
            }}
          >
            <ImageCycle
              images={activeImages}
              interval={2600}
              showControllers={false}
              showDots
              clickToNavigate={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 12,
                color: "white",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 900,
                  fontSize: 16,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                {active?.name || "Destination"}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 700,
                }}
              >
                {active?.country || "East Africa"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

