// src/pages/Booking/components/SelectModal.jsx
// ✅ v2.0 — item.country always coerced to string before render
import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Safely coerce any country field shape to a plain string.
 * API sometimes returns country as {id, name} object.
 */
const safeCountryStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.name ?? val.label ?? val.title ?? "";
  return String(val);
};

/**
 * Safely coerce any value to a render-safe string.
 */
const safeStr = (val, fallback = "") => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") return val.label ?? val.name ?? val.value ?? fallback;
  return String(val) || fallback;
};

const SelectModal = memo(({
  isOpen,
  onClose,
  onSelect,
  items,
  mode = "country",
  selectedValue,
  isMobile,
}) => {
  const [query, setQuery] = useState("");
  const inputRef   = useRef(null);
  const overlayRef = useRef(null);

  /* Reset + focus on open */
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* Escape to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* Prevent body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleClearQuery = useCallback(() => setQuery(""), []);

  const filtered = (items || []).filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (mode === "country") {
      return (
        safeStr(item.label).toLowerCase().includes(q) ||
        safeStr(item.region).toLowerCase().includes(q)
      );
    }
    return (
      safeStr(item.label).toLowerCase().includes(q) ||
      // ✅ safeCountryStr handles object country field
      safeCountryStr(item.country).toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback((item) => {
    onSelect(item);
  }, [onSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="bk-select-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.5)",
            backdropFilter: "blur(4px)",
            zIndex: 400,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: isMobile ? "16px" : "24px",
          }}
        >
          <motion.div
            className="bk-select-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 24px 64px rgba(0,0,0,.18)",
              width: isMobile ? "100%" : 520,
              maxWidth: "100%",
              maxHeight: isMobile ? "85vh" : 560,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 22px 16px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 12,
              flexShrink: 0,
            }}>
              <h3 style={{
                margin: 0, fontSize: 17, fontWeight: 800, color: "#111827",
                fontFamily: "'Playfair Display', serif",
              }}>
                {mode === "country" ? "Select Country" : "Select Destination"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#f3f4f6", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 16, color: "#6b7280",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{
              padding: "14px 22px",
              borderBottom: "1px solid #f3f4f6",
              flexShrink: 0,
            }}>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 16, pointerEvents: "none",
                }}>
                  🔍
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    mode === "country"
                      ? "Search countries…"
                      : "Search destinations…"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "11px 40px 11px 42px",
                    border: "2px solid #e5e7eb", borderRadius: 12,
                    fontSize: 14.5, outline: "none",
                    background: "#f9fafb", fontFamily: "inherit",
                    boxSizing: "border-box", color: "#111827",
                    transition: "border-color .2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#059669"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#e5e7eb"; }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearQuery}
                    aria-label="Clear search"
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "#e5e7eb", border: "none",
                      width: 22, height: 22, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, color: "#6b7280",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 0",
            }}>
              {filtered.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "40px 24px",
                  color: "#9ca3af", fontSize: 14,
                }}>
                  No {mode === "country" ? "countries" : "destinations"} found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((item) => {
                  const isActive = selectedValue === item.value;
                  // ✅ All rendered text is guaranteed strings
                  const itemLabel  = safeStr(item.label);
                  const itemFlag   = typeof item.flag === "string" &&
                    !item.flag.startsWith("http") ? item.flag : "🌍";
                  const itemRegion = safeStr(item.region);
                  // ✅ country always string — may be object from API
                  const itemCountry = safeCountryStr(item.country);
                  const itemDuration = safeStr(item.duration);
                  const itemRating  = item.rating ? Number(item.rating) : null;

                  if (mode === "country") {
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleSelect(item)}
                        aria-pressed={isActive}
                        style={{
                          width: "100%", display: "flex", alignItems: "center",
                          gap: 14, padding: "13px 22px",
                          background: isActive ? "#f0fdf4" : "transparent",
                          border: "none", cursor: "pointer",
                          textAlign: "left", fontFamily: "inherit",
                          transition: "background .15s",
                          borderLeft: isActive
                            ? "3px solid #059669" : "3px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>
                          {itemFlag}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 14.5, fontWeight: isActive ? 700 : 500,
                            color: isActive ? "#065f46" : "#111827",
                            overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {itemLabel}
                          </div>
                          {itemRegion && (
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                              {itemRegion}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <span style={{
                            fontSize: 16, color: "#059669",
                            flexShrink: 0, fontWeight: 700,
                          }}>✓</span>
                        )}
                      </button>
                    );
                  }

                  /* Destination mode */
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSelect(item)}
                      aria-pressed={isActive}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        gap: 14, padding: "12px 22px",
                        background: isActive ? "#f0fdf4" : "transparent",
                        border: "none", cursor: "pointer",
                        textAlign: "left", fontFamily: "inherit",
                        transition: "background .15s",
                        borderLeft: isActive
                          ? "3px solid #059669" : "3px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={itemLabel}
                          style={{
                            width: 48, height: 48, borderRadius: 10,
                            objectFit: "cover", flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 48, height: 48, borderRadius: 10,
                          background: "#f0fdf4", flexShrink: 0,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 22,
                        }}>
                          🏞️
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14.5, fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#065f46" : "#111827",
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {itemLabel}
                        </div>
                        <div style={{
                          fontSize: 12, color: "#9ca3af", marginTop: 2,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {/* ✅ itemCountry is always a string */}
                          {itemCountry && <span>{itemCountry}</span>}
                          {itemCountry && itemDuration && <span>·</span>}
                          {itemDuration && <span>{itemDuration}</span>}
                        </div>
                      </div>
                      <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "flex-end", gap: 4, flexShrink: 0,
                      }}>
                        {itemRating !== null && !isNaN(itemRating) && (
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: "#d97706",
                            display: "flex", alignItems: "center", gap: 3,
                          }}>
                            ⭐ {itemRating.toFixed(1)}
                          </span>
                        )}
                        {isActive && (
                          <span style={{
                            fontSize: 16, color: "#059669", fontWeight: 700,
                          }}>✓</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SelectModal.displayName = "SelectModal";
export default SelectModal;