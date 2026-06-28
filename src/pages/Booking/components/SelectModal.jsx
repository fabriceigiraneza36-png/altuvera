import React, { memo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SelectModal = memo(({
  isOpen, onClose, onSelect, items,
  mode = "country",
  selectedValue,
  isMobile,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filtered = (items || []).filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (mode === "country") {
      return (
        item.label?.toLowerCase().includes(q) ||
        item.region?.toLowerCase().includes(q)
      );
    }
    return (
      item.label?.toLowerCase().includes(q) ||
      item.country?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    onSelect(item);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="bk-select-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bk-select-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMobile ? "95vw" : 520,
              maxHeight: isMobile ? "85vh" : 520,
            }}
          >
            {/* Header */}
            <div className="bk-select-modal__header">
              <h3 className="bk-select-modal__title">
                {mode === "country" ? "Select Country" : "Select Destination"}
              </h3>
              <button
                type="button"
                className="bk-select-modal__close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="bk-select-modal__search-wrap">
              <span className="bk-select-modal__search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                className="bk-select-modal__search"
                placeholder={
                  mode === "country"
                    ? "Search countries…"
                    : "Search destinations…"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="bk-select-modal__clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* List */}
            <div className="bk-select-modal__list">
              {filtered.length === 0 ? (
                <div className="bk-select-modal__empty">
                  No {mode === "country" ? "countries" : "destinations"} found
                </div>
              ) : (
                filtered.map((item) => {
                  const isActive = selectedValue === item.value;
                  if (mode === "country") {
                    return (
                      <button
                        key={item.value}
                        type="button"
                        className={`bk-select-modal__item${
                          isActive ? " bk-select-modal__item--active" : ""
                        }`}
                        onClick={() => handleSelect(item)}
                        aria-pressed={isActive}
                      >
                        <span className="bk-select-modal__flag">
                          {item.flag && !item.flag.startsWith("http")
                            ? item.flag
                            : "🌍"}
                        </span>
                        <div className="bk-select-modal__item-text">
                          <span className="bk-select-modal__item-label">
                            {item.label}
                          </span>
                          {item.region && (
                            <span className="bk-select-modal__item-sub">
                              {item.region}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <span className="bk-select-modal__check">✓</span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`bk-select-modal__item${
                        isActive ? " bk-select-modal__item--active" : ""
                      }`}
                      onClick={() => handleSelect(item)}
                      aria-pressed={isActive}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.label}
                          className="bk-select-modal__thumb"
                        />
                      ) : (
                        <span className="bk-select-modal__thumb bk-select-modal__thumb--placeholder">
                          🏞️
                        </span>
                      )}
                      <div className="bk-select-modal__item-text">
                        <span className="bk-select-modal__item-label">
                          {item.label}
                        </span>
                        <span className="bk-select-modal__item-sub">
                          {item.country}
                          {item.duration && ` · ${item.duration}`}
                        </span>
                      </div>
                      <div className="bk-select-modal__item-meta">
                        {item.rating && (
                          <span className="bk-select-modal__rating">
                            ⭐ {Number(item.rating).toFixed(1)}
                          </span>
                        )}
                        {isActive && (
                          <span className="bk-select-modal__check">✓</span>
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
