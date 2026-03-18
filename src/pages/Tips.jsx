import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiGrid,
  FiList,
  FiSidebar,
  FiMaximize2,
  FiX,
  FiBookOpen,
  FiArrowRight,
  FiClock,
  FiExternalLink,
  FiStar,
  FiCompass,
  FiMap,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import DownloadTips from "../components/common/DownloadTips";
import { tips } from "../data/tips";

// Background images mapped to common tip categories
const categoryBackgrounds = {
  "Health & Safety": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
  "Culture": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
  "Transportation": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
  "Accommodation": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "Food & Drink": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "Wildlife": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
  "Budget": "https://images.unsplash.com/photo-1553729459-uj4hs4bzlfi?w=800&q=80",
  "Packing": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  "Photography": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  "Weather": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80",
  "Visa & Documents": "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80",
  "Communication": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80",
  "Money": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80",
};

const getBackgroundForCategory = (category) => {
  for (const [key, url] of Object.entries(categoryBackgrounds)) {
    if (category?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category?.toLowerCase())) {
      return url;
    }
  }
  return categoryBackgrounds["default"];
};

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [modalTip, setModalTip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tipCount, setTipCount] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const modalRef = useRef(null);
  const searchRef = useRef(null);

  const categories = useMemo(
    () => [...new Set(tips.map((t) => t.category))],
    []
  );

  const filteredTips = useMemo(() => {
    return tips.filter((tip) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        tip.title.toLowerCase().includes(q) ||
        tip.summary.toLowerCase().includes(q) ||
        tip.content.toLowerCase().includes(q) ||
        (tip.lastUpdated && tip.lastUpdated.toLowerCase().includes(q)) ||
        (tip.source && tip.source.toLowerCase().includes(q)) ||
        tip.tips.some((t) => t.toLowerCase().includes(q));
      const matchCat =
        selectedCategory === "all" || tip.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const target = filteredTips.length;
    if (tipCount === target) return;
    const step = target > tipCount ? 1 : -1;
    const id = setInterval(() => {
      setTipCount((p) => {
        if (p === target) {
          clearInterval(id);
          return p;
        }
        return p + step;
      });
    }, 30);
    return () => clearInterval(id);
  }, [filteredTips.length, tipCount]);

  const toggleTip = useCallback(
    (id) => setExpandedTip((p) => (p === id ? null : id)),
    []
  );

  const openModal = useCallback((tip) => {
    setModalTip(tip);
    requestAnimationFrame(() => setModalVisible(true));
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => {
      setModalTip(null);
      document.body.style.overflow = "";
    }, 400);
  }, []);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && modalTip && closeModal();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [modalTip, closeModal]);

  const TipDetails = ({ tip, isModal }) => (
    <div className={`td ${isModal ? "td--modal" : ""}`}>
      <p className="td__content">{tip.content}</p>
      <div className="td__checks">
        {tip.tips.map((item, i) => (
          <div
            className="td__check"
            key={`${tip.id}-${i}`}
            style={{ "--ci": i }}
          >
            <span className="td__check-icon">✓</span>
            <span className="td__check-text">{item}</span>
          </div>
        ))}
      </div>
      {(tip.lastUpdated || tip.source) && (
        <div className="td__meta">
          {tip.lastUpdated && (
            <span className="td__meta-item">
              <FiClock size={13} />
              {tip.lastUpdated}
            </span>
          )}
          {tip.source && (
            <span className="td__meta-item">
              <FiExternalLink size={13} />
              {tip.source}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const TipCard = ({ tip, isExpanded, onToggle, onOpenModal, index }) => {
    const isCompact = layout === "compact";
    const bgImage = getBackgroundForCategory(tip.category);

    return (
      <article
        className={`tc tc--${layout} ${isExpanded ? "tc--expanded" : ""}`}
        style={{ "--idx": index }}
        onMouseEnter={() => setHoveredCard(tip.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Background Image */}
        <div className="tc__bg-image" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="tc__bg-overlay" />
          <div className="tc__bg-pattern" />
        </div>

        {/* Animated border glow */}
        <div className={`tc__border-glow ${hoveredCard === tip.id ? "tc__border-glow--active" : ""}`} />

        <header className="tc__head" onClick={() => onToggle(tip.id)}>
          <div className="tc__icon-wrap">
            <div className="tc__icon">{tip.icon}</div>
            <div className="tc__icon-ring" />
            <div className="tc__icon-particles">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="tc__particle" style={{ "--pi": i }} />
              ))}
            </div>
          </div>
          <div className="tc__info">
            <span className="tc__cat">
              <FiCompass size={10} className="tc__cat-icon" />
              {tip.category}
            </span>
            <h3 className="tc__title">{tip.title}</h3>
            {!isCompact && <p className="tc__summary">{tip.summary}</p>}
          </div>
          <button
            type="button"
            className={`tc__toggle ${isExpanded ? "tc__toggle--on" : ""}`}
            aria-label="Toggle details"
          >
            <FiChevronDown size={18} />
          </button>
        </header>

        <div className={`tc__body ${isExpanded ? "tc__body--open" : ""}`}>
          <div className="tc__body-inner">
            <TipDetails tip={tip} />
          </div>
        </div>

        <footer className="tc__foot">
          <div className="tc__foot-decorations">
            <FiStar size={12} className="tc__foot-star" />
            <div className="tc__foot-line" />
          </div>
          <button
            className="tc__detail-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(tip);
            }}
          >
            <FiMaximize2 size={14} />
            <span>Full Details</span>
            <FiArrowRight size={14} className="tc__detail-arrow" />
          </button>
        </footer>
      </article>
    );
  };

  return (
    <div className="tp">
      <style>{`
/* ═══════════════════════════════════════ */
/* ══════════ DESIGN TOKENS ═════════════ */
/* ═══════════════════════════════════════ */
.tp {
  --bg: linear-gradient(175deg, #f0fdf4 0%, #ecfdf5 20%, #f0fdf4 40%, #ffffff 60%, #ecfdf5 80%, #f0fdf4 100%);
  --panel: rgba(255, 255, 255, 0.92);
  --panel-solid: #ffffff;
  --c: #059669;
  --c-light: #10b981;
  --c-dark: #047857;
  --c-darker: #065f46;
  --cl: #ecfdf5;
  --cb: #d1fae5;
  --c-glow: rgba(16, 185, 129, 0.15);
  --c-glow-strong: rgba(16, 185, 129, 0.3);
  --txt: #0f172a;
  --txt2: #475569;
  --txt3: #334155;
  --mute: #94a3b8;
  --brd: #e2e8f0;
  --brd-light: #f1f5f9;
  --r: 24px;
  --r-sm: 16px;
  --r-lg: 32px;
  --spring: cubic-bezier(.175, .885, .32, 1.275);
  --bounce: cubic-bezier(.68, -0.55, .265, 1.55);
  --smooth: cubic-bezier(.4, 0, .2, 1);
  --elastic: cubic-bezier(.25, .46, .45, .94);
  --fast: .2s;
  --med: .35s;
  --slow: .5s;
  --fd: 'Playfair Display', serif;
  --fb: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  position: relative;
}

/* Subtle animated background pattern */
.tp::before {
  content: "";
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse 600px 400px at 20% 30%, rgba(16, 185, 129, 0.04), transparent),
    radial-gradient(ellipse 500px 350px at 80% 70%, rgba(5, 150, 105, 0.03), transparent),
    radial-gradient(ellipse 400px 300px at 50% 50%, rgba(52, 211, 153, 0.02), transparent);
  pointer-events: none;
  z-index: 0;
  animation: bgPulse 12s ease-in-out infinite alternate;
}
@keyframes bgPulse {
  0% { opacity: 0.7; transform: scale(1) }
  100% { opacity: 1; transform: scale(1.02) }
}

/* Floating decorative elements */
.tp::after {
  content: "";
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.06), transparent 70%);
  top: -100px;
  right: -100px;
  animation: floatOrb 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0) scale(1) }
  25% { transform: translate(-50px, 80px) scale(1.1) }
  50% { transform: translate(-30px, 40px) scale(0.95) }
  75% { transform: translate(-60px, 100px) scale(1.05) }
}

/* ═══════════════════════════════════════ */
/* ══════════ SHELL ══════════════════════ */
/* ═══════════════════════════════════════ */
.tp__shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(36px, 5vw, 64px) clamp(16px, 3vw, 28px) clamp(80px, 10vw, 140px);
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════ */
/* ══════════ TOOLBAR PANEL ═════════════ */
/* ═══════════════════════════════════════ */
.tp__panel {
  background: var(--panel);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--r-lg);
  border: 1px solid rgba(187, 247, 208, 0.5);
  box-shadow:
    0 0 0 1px rgba(5, 150, 105, 0.04),
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 60px -15px rgba(2, 44, 34, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: clamp(24px, 3vw, 36px);
  position: relative;
  overflow: hidden;
  transition: box-shadow var(--med) var(--smooth), transform var(--med) var(--smooth);
}
.tp__panel:hover {
  box-shadow:
    0 0 0 1px rgba(5, 150, 105, 0.06),
    0 8px 12px -2px rgba(0, 0, 0, 0.03),
    0 30px 70px -18px rgba(2, 44, 34, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Animated top gradient bar */
.tp__panel::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px; right: -1px;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669, #34d399, #059669, #10b981);
  background-size: 400% 100%;
  animation: gradientFlow 6s ease infinite;
  border-radius: var(--r-lg) var(--r-lg) 0 0;
}
@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
}

/* Subtle inner glow */
.tp__panel::after {
  content: "";
  position: absolute;
  top: 4px; left: 20%; right: 20%;
  height: 60px;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.04), transparent);
  border-radius: 0 0 50% 50%;
  pointer-events: none;
}

.tp__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════ */
/* ══════════ SEARCH ════════════════════ */
/* ═══════════════════════════════════════ */
.tp__search {
  position: relative;
  flex: 2 1 340px;
}
.tp__search-icon {
  position: absolute;
  left: 18px; top: 50%;
  transform: translateY(-50%);
  color: var(--mute);
  pointer-events: none;
  transition: color var(--med), transform var(--med) var(--spring);
}
.tp__search:focus-within .tp__search-icon {
  color: var(--c);
  transform: translateY(-50%) scale(1.1);
}
.tp__search-input {
  width: 100%;
  padding: 16px 52px 16px 50px;
  border-radius: 18px;
  border: 2px solid var(--brd);
  font-size: 15px;
  font-family: var(--fb);
  color: var(--txt);
  background: rgba(250, 255, 254, 0.8);
  box-sizing: border-box;
  transition: all var(--med) var(--smooth);
  letter-spacing: 0.2px;
}
.tp__search-input:focus {
  outline: none;
  border-color: var(--c-light);
  box-shadow: 
    0 0 0 4px rgba(16, 185, 129, 0.1),
    0 4px 20px rgba(5, 150, 105, 0.08);
  background: #fff;
  transform: translateY(-1px);
}
.tp__search-input::placeholder {
  color: var(--mute);
  font-weight: 400;
}
.tp__search-clear {
  position: absolute;
  right: 14px; top: 50%;
  transform: translateY(-50%);
  width: 30px; height: 30px;
  border: none; border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--med) var(--spring);
  opacity: 0; pointer-events: none;
  transform: translateY(-50%) scale(0.8);
}
.tp__search-clear--show {
  opacity: 1; pointer-events: auto;
  transform: translateY(-50%) scale(1);
}
.tp__search-clear:hover {
  background: #fee2e2; color: #dc2626;
  transform: translateY(-50%) scale(1.1);
}

/* ═══════════════════════════════════════ */
/* ══════════ CONTROLS ══════════════════ */
/* ═══════════════════════════════════════ */
.tp__controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.tp__filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: var(--r-sm);
  background: var(--cl);
  color: var(--c);
  font-size: 13px;
  font-weight: 700;
  border: 2px solid var(--cb);
  cursor: pointer;
  transition: all var(--med) var(--spring);
  letter-spacing: .4px;
  position: relative;
  overflow: hidden;
}
.tp__filter-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--c), var(--c-dark));
  opacity: 0;
  transition: opacity var(--med);
  border-radius: inherit;
}
.tp__filter-btn:hover {
  border-color: var(--c);
  color: #fff;
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.25);
  transform: translateY(-2px);
}
.tp__filter-btn:hover::before {
  opacity: 1;
}
.tp__filter-btn svg,
.tp__filter-btn span {
  position: relative;
  z-index: 1;
}
.tp__filter-btn--on {
  background: var(--c);
  border-color: var(--c);
  color: #fff;
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
}
.tp__filter-btn--on::before {
  opacity: 1;
}

/* Layout switcher */
.tp__layouts {
  display: flex;
  gap: 4px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid var(--brd);
  border-radius: 16px;
  padding: 4px;
}
.tp__layout-btn {
  background: transparent;
  border: none;
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all .3s var(--spring);
  position: relative;
}
.tp__layout-btn:hover { color: var(--c); transform: scale(1.05) }
.tp__layout-btn--on {
  background: linear-gradient(135deg, var(--c), var(--c-dark));
  color: #fff;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.35);
  transform: scale(1.08);
}

/* ═══════════════════════════════════════ */
/* ══════════ CATEGORIES ════════════════ */
/* ═══════════════════════════════════════ */
.tp__cats {
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height .5s var(--smooth), opacity .4s, margin .4s, padding .4s;
  position: relative;
  z-index: 1;
  padding-top: 0;
}
.tp__cats--open {
  max-height: 300px;
  opacity: 1;
  margin-top: 20px;
  padding-top: 4px;
}
.tp__cats--always {
  max-height: none;
  opacity: 1;
  margin-top: 20px;
  padding-top: 4px;
}
.tp__chip {
  border: 2px solid var(--brd);
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--fb);
  transition: all .3s var(--spring);
  position: relative;
  overflow: hidden;
}
.tp__chip::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--c), var(--c-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .35s var(--smooth);
  z-index: 0;
  border-radius: inherit;
}
.tp__chip span {
  position: relative;
  z-index: 1;
}
.tp__chip:hover {
  border-color: #86efac;
  color: var(--c);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.12);
}
.tp__chip--on {
  border-color: var(--c);
  background: var(--c);
  color: #fff;
  box-shadow: 0 6px 24px rgba(5, 150, 105, 0.3);
  transform: translateY(-2px);
}
.tp__chip--on::before {
  transform: scaleX(1);
}
.tp__chip--on:hover {
  color: #fff;
}

/* ═══════════════════════════════════════ */
/* ══════════ STATS BAR ═════════════════ */
/* ═══════════════════════════════════════ */
.tp__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  position: relative;
  z-index: 1;
}
.tp__count {
  color: var(--txt2);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.tp__count strong {
  color: var(--c);
  font-weight: 800;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  transition: transform var(--fast) var(--spring);
}
.tp__book-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--mute);
  font-size: 13px;
  font-weight: 500;
  background: rgba(241, 245, 249, 0.6);
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--brd-light);
}

/* ═══════════════════════════════════════ */
/* ══════════ LAYOUT CONTAINERS ═════════ */
/* ═══════════════════════════════════════ */
.tp__grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}
.tp__list {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.tp__compact {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ═══════════════════════════════════════ */
/* ══════════ TIP CARD ══════════════════ */
/* ═══════════════════════════════════════ */
.tc {
  background: var(--panel-solid);
  border-radius: var(--r);
  border: 1.5px solid rgba(187, 247, 208, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all .4s var(--smooth);
  position: relative;
  isolation: isolate;
}

/* Background image layer */
.tc__bg-image {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity .6s var(--smooth);
  z-index: 0;
}
.tc:hover .tc__bg-image {
  opacity: 0.06;
}
.tc--expanded .tc__bg-image {
  opacity: 0.04;
}

.tc__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.98) 40%,
    rgba(255, 255, 255, 1) 100%
  );
}

.tc__bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.02) 0%, transparent 50%);
  opacity: 0;
  transition: opacity .4s;
}
.tc:hover .tc__bg-pattern {
  opacity: 1;
}

/* Animated border glow */
.tc__border-glow {
  position: absolute;
  inset: -2px;
  border-radius: calc(var(--r) + 2px);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(16, 185, 129, 0.3) 60deg,
    transparent 120deg,
    rgba(5, 150, 105, 0.2) 180deg,
    transparent 240deg,
    rgba(52, 211, 153, 0.3) 300deg,
    transparent 360deg
  );
  opacity: 0;
  z-index: -1;
  transition: opacity .5s var(--smooth);
  animation: rotateBorder 8s linear infinite;
}
.tc__border-glow--active {
  opacity: 1;
}
@keyframes rotateBorder {
  to { transform: rotate(360deg) }
}

/* Left accent bar */
.tc::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 0;
  background: linear-gradient(180deg, var(--c-light), var(--c), var(--c-dark));
  border-radius: 0 4px 4px 0;
  transition: height .5s var(--spring);
  z-index: 2;
}
.tc:hover::before {
  height: 100%;
}
.tc:hover {
  border-color: #a7f3d0;
  box-shadow:
    0 0 0 1px rgba(5, 150, 105, 0.06),
    0 10px 25px -5px rgba(2, 44, 34, 0.08),
    0 20px 50px -12px rgba(4, 120, 87, 0.12);
  transform: translateY(-4px);
}
.tc--expanded {
  border-color: #86efac;
  box-shadow:
    0 0 0 1px rgba(5, 150, 105, 0.08),
    0 12px 30px -6px rgba(2, 44, 34, 0.1),
    0 24px 56px -14px rgba(4, 120, 87, 0.15);
}
.tc--expanded::before {
  height: 100%;
}

/* Compact variant */
.tc--compact {
  border-radius: 18px;
}
.tc--compact .tc__head {
  padding: 14px 18px;
}
.tc--compact .tc__icon-wrap { width: 46px; height: 46px }
.tc--compact .tc__icon { font-size: 22px }
.tc--compact .tc__title { font-size: 16px }
.tc--compact .tc__bg-image { display: none }

/* List variant */
.tc--list .tc__head {
  padding: 22px 26px;
}

/* ═══════════════════════════════════════ */
/* ══════════ CARD HEADER ═══════════════ */
/* ═══════════════════════════════════════ */
.tc__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  padding: clamp(20px, 2.5vw, 26px);
  cursor: pointer;
  user-select: none;
  transition: background var(--fast);
  position: relative;
  z-index: 1;
}
.tc__head:hover {
  background: rgba(5, 150, 105, 0.02);
}

.tc__icon-wrap {
  position: relative;
  width: 58px; height: 58px;
  flex-shrink: 0;
}
.tc__icon {
  width: 100%; height: 100%;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 28px;
  background: linear-gradient(145deg, #d1fae5, #a7f3d0);
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.9),
    0 4px 14px rgba(2, 44, 34, 0.1);
  position: relative;
  z-index: 2;
  transition: all .4s var(--spring);
}
.tc:hover .tc__icon {
  transform: scale(1.08) rotate(-3deg);
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.9),
    0 8px 28px rgba(5, 150, 105, 0.25);
}

/* Icon ring animation */
.tc__icon-ring {
  position: absolute;
  inset: -6px;
  border-radius: 22px;
  border: 2px solid rgba(16, 185, 129, 0.15);
  opacity: 0;
  transition: all .4s var(--smooth);
  z-index: 1;
}
.tc:hover .tc__icon-ring {
  opacity: 1;
  inset: -8px;
  border-color: rgba(16, 185, 129, 0.25);
  animation: ringPulse 2s ease-in-out infinite;
}
@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.6 }
  50% { transform: scale(1.05); opacity: 1 }
}

/* Floating particles */
.tc__icon-particles {
  position: absolute;
  inset: -12px;
  z-index: 0;
}
.tc__particle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--c-light);
  opacity: 0;
  transition: opacity .3s;
}
.tc:hover .tc__particle {
  opacity: 0.6;
  animation: particleFloat 3s ease-in-out infinite;
  animation-delay: calc(var(--pi) * 0.5s);
}
.tc__particle:nth-child(1) { top: 10%; left: -5px }
.tc__particle:nth-child(2) { bottom: 20%; right: -3px }
.tc__particle:nth-child(3) { top: 50%; right: -8px }
@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1) }
  50% { transform: translateY(-8px) scale(1.5) }
}

.tc__info { min-width: 0 }

.tc__cat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--c);
  background: linear-gradient(135deg, var(--cl), rgba(209, 250, 229, 0.6));
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 4px 12px;
  transition: all var(--med);
}
.tc__cat-icon {
  transition: transform .5s var(--spring);
}
.tc:hover .tc__cat-icon {
  transform: rotate(45deg);
}

.tc__title {
  margin: 0 0 6px;
  color: var(--txt);
  font-size: clamp(17px, 2vw, 22px);
  font-family: var(--fd);
  font-weight: 700;
  line-height: 1.3;
  transition: color var(--med);
}
.tc:hover .tc__title { color: var(--c-dark) }

.tc__summary {
  margin: 0;
  color: var(--txt2);
  font-size: 14px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ═══════════════════════════════════════ */
/* ══════════ TOGGLE BUTTON ═════════════ */
/* ═══════════════════════════════════════ */
.tc__toggle {
  width: 42px; height: 42px;
  border-radius: 14px;
  border: 2px solid #d1fae5;
  background: var(--cl);
  color: var(--c);
  display: grid; place-items: center;
  cursor: pointer;
  transition: all .35s var(--spring);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.tc__toggle::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--c), var(--c-dark));
  opacity: 0;
  transition: opacity var(--med);
  border-radius: inherit;
}
.tc__toggle svg {
  transition: transform .4s var(--spring);
  position: relative;
  z-index: 1;
}
.tc__toggle--on svg {
  transform: rotate(180deg);
}
.tc__head:hover .tc__toggle {
  border-color: var(--c);
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 6px 18px rgba(5, 150, 105, 0.3);
}
.tc__head:hover .tc__toggle::before {
  opacity: 1;
}

/* ═══════════════════════════════════════ */
/* ══════════ EXPANDABLE BODY ═══════════ */
/* ═══════════════════════════════════════ */
.tc__body {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height .5s var(--smooth),
              opacity .4s var(--smooth);
}
.tc__body--open {
  max-height: 2000px;
  opacity: 1;
}
.tc__body-inner {
  border-top: 1px solid rgba(187, 247, 208, 0.4);
  padding: 24px 26px 28px;
  background: linear-gradient(180deg, rgba(250, 255, 254, 0.9) 0%, rgba(240, 253, 244, 0.8) 100%);
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════ */
/* ══════════ CARD FOOTER ═══════════════ */
/* ═══════════════════════════════════════ */
.tc__foot {
  padding: 12px 22px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(241, 245, 249, 0.8);
  position: relative;
  z-index: 1;
}
.tc__foot-decorations {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.tc__foot-star {
  color: #d1fae5;
  transition: all .4s var(--spring);
}
.tc:hover .tc__foot-star {
  color: var(--c-light);
  transform: rotate(72deg) scale(1.2);
}
.tc__foot-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--cb), transparent);
  max-width: 60px;
}

.tc__detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid #d1fae5;
  border-radius: 14px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c);
  cursor: pointer;
  font-family: var(--fb);
  transition: all .3s var(--spring);
  overflow: hidden;
  position: relative;
  letter-spacing: .3px;
}
.tc__detail-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--c), var(--c-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .35s var(--smooth);
  z-index: 0;
  border-radius: inherit;
}
.tc__detail-btn span,
.tc__detail-btn svg {
  position: relative;
  z-index: 1;
}
.tc__detail-btn:hover {
  border-color: var(--c);
  color: #fff;
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.25);
  transform: translateY(-2px);
}
.tc__detail-btn:hover::before {
  transform: scaleX(1);
}
.tc__detail-arrow {
  transition: transform .3s var(--spring);
}
.tc__detail-btn:hover .tc__detail-arrow {
  transform: translateX(4px);
}

/* ═══════════════════════════════════════ */
/* ══════════ TIP DETAILS ═══════════════ */
/* ═══════════════════════════════════════ */
.td__content {
  margin: 0 0 22px;
  color: var(--txt3);
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-line;
}
.td--modal .td__content {
  font-size: 16px;
  line-height: 1.9;
}

.td__checks {
  display: grid;
  gap: 12px;
  margin-bottom: 22px;
}
.td__check {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.9), rgba(236, 253, 245, 0.7));
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 16px 18px;
  color: #14532d;
  font-size: 14px;
  line-height: 1.6;
  transition: all .3s var(--smooth);
  opacity: 0;
  transform: translateX(-10px);
  animation: checkSlideIn .45s var(--smooth) calc(var(--ci) * .05s + .1s) forwards;
  backdrop-filter: blur(8px);
}
@keyframes checkSlideIn {
  to { opacity: 1; transform: none }
}
.td__check:hover {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border-color: #86efac;
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.1);
}
.td__check-icon {
  width: 26px; height: 26px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--c-light), var(--c));
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.35);
  transition: transform .3s var(--spring);
}
.td__check:hover .td__check-icon {
  transform: scale(1.1) rotate(-5deg);
}
.td__check-text {
  padding-top: 3px;
}

.td__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed rgba(203, 213, 225, 0.5);
}
.td__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  background: rgba(241, 245, 249, 0.5);
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--brd-light);
  transition: all var(--med);
}
.td__meta-item:hover {
  background: var(--cl);
  border-color: var(--cb);
  color: var(--c);
}

/* ═══════════════════════════════════════ */
/* ══════════ MODAL ═════════════════════ */
/* ═══════════════════════════════════════ */
.tm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 44, 34, 0.5);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
  opacity: 0;
  visibility: hidden;
  transition: opacity .4s var(--smooth), visibility .4s;
}
.tm-overlay--show {
  opacity: 1;
  visibility: visible;
}

.tm {
  background: #fff;
  border-radius: var(--r-lg);
  max-width: 780px;
  width: 100%;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 0 1px rgba(5, 150, 105, 0.06),
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 40px 100px -20px rgba(2, 44, 34, 0.25);
  transform: translateY(30px) scale(.95);
  transition: transform .5s var(--spring), opacity .4s;
  opacity: 0;
  position: relative;
}
.tm-overlay--show .tm {
  transform: none;
  opacity: 1;
}

/* Modal background image */
.tm__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.04;
  z-index: 0;
}
.tm__bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.97) 0%, 
    rgba(255, 255, 255, 0.99) 30%,
    rgba(255, 255, 255, 1) 100%
  );
  z-index: 0;
}

.tm__head {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px 32px;
  border-bottom: 1px solid rgba(187, 247, 208, 0.4);
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(250, 255, 254, 0.95), rgba(255, 255, 255, 0.95));
  position: relative;
  z-index: 1;
}
.tm__icon {
  width: 68px; height: 68px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  font-size: 36px;
  background: linear-gradient(145deg, #d1fae5, #a7f3d0);
  box-shadow:
    inset 0 2px 8px rgba(255, 255, 255, 0.9),
    0 8px 24px rgba(2, 44, 34, 0.12);
  flex-shrink: 0;
  animation: modalIconAppear .6s var(--spring) .2s both;
}
@keyframes modalIconAppear {
  from { transform: scale(0.5) rotate(-10deg); opacity: 0 }
  to { transform: none; opacity: 1 }
}

.tm__info { flex: 1; min-width: 0 }
.tm__cat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--c);
  background: var(--cl);
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 5px 14px;
  animation: modalCatAppear .5s var(--smooth) .3s both;
}
@keyframes modalCatAppear {
  from { transform: translateY(-8px); opacity: 0 }
  to { transform: none; opacity: 1 }
}

.tm__title {
  margin: 0;
  font-size: clamp(24px, 3vw, 30px);
  font-family: var(--fd);
  font-weight: 700;
  color: var(--txt);
  line-height: 1.25;
  animation: modalTitleAppear .5s var(--smooth) .35s both;
}
@keyframes modalTitleAppear {
  from { transform: translateY(8px); opacity: 0 }
  to { transform: none; opacity: 1 }
}

.tm__close {
  width: 44px; height: 44px;
  border: 2px solid var(--brd);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .3s var(--spring);
  backdrop-filter: blur(8px);
}
.tm__close:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: rotate(90deg) scale(1.05);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.15);
}

.tm__body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
  overscroll-behavior: contain;
  position: relative;
  z-index: 1;
  animation: modalBodyAppear .5s var(--smooth) .4s both;
}
@keyframes modalBodyAppear {
  from { transform: translateY(12px); opacity: 0 }
  to { transform: none; opacity: 1 }
}

/* ═══════════════════════════════════════ */
/* ══════════ EMPTY STATE ═══════════════ */
/* ═══════════════════════════════════════ */
.tp__empty {
  text-align: center;
  padding: 70px 36px;
  border-radius: var(--r);
  border: 2px dashed #d1fae5;
  color: var(--txt2);
  font-size: 15px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  margin-top: 32px;
  position: relative;
  overflow: hidden;
}
.tp__empty::before {
  content: "";
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 300px 200px at 30% 40%, rgba(16, 185, 129, 0.04), transparent),
    radial-gradient(ellipse 250px 180px at 70% 60%, rgba(5, 150, 105, 0.03), transparent);
  pointer-events: none;
}
.tp__empty-icon {
  font-size: 56px;
  margin-bottom: 18px;
  opacity: .5;
  animation: emptyBounce 2s ease-in-out infinite;
}
@keyframes emptyBounce {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-8px) }
}
.tp__empty-text {
  margin: 0;
  font-weight: 600;
  font-size: 17px;
  color: var(--txt);
}
.tp__empty-sub {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--mute);
}

/* ═══════════════════════════════════════ */
/* ══════════ RESPONSIVE ════════════════ */
/* ═══════════════════════════════════════ */
@media (max-width: 768px) {
  .tp__grid {
    grid-template-columns: 1fr;
  }
  .tp__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .tp__controls {
    justify-content: space-between;
  }
  .tc__head {
    gap: 14px;
  }
  .tc__icon-wrap {
    width: 50px; height: 50px;
  }
  .tc__icon { font-size: 24px; border-radius: 15px }
  .tm__head {
    flex-wrap: wrap;
    padding: 22px;
  }
  .tm__body { padding: 22px }
  .tm__title { font-size: 22px }
  .tm-overlay { padding: 16px }
  .tp__panel { border-radius: 24px; padding: clamp(18px, 3vw, 28px) }
}

@media (max-width: 480px) {
  .tc { border-radius: 20px }
  .tc__title { font-size: 16px }
  .tc__summary { font-size: 13px; -webkit-line-clamp: 2 }
  .tc__body-inner { padding: 18px }
  .tc__foot { padding: 10px 16px 14px }
  .tp__chip { padding: 8px 14px; font-size: 12px }
  .tm { border-radius: 24px; max-height: 92vh }
  .tm__icon { width: 56px; height: 56px; font-size: 30px }
  .tp__panel { border-radius: 20px }
  .tc__icon-wrap { width: 44px; height: 44px }
  .tc__icon { font-size: 22px; border-radius: 13px }
  .tc__head { padding: 16px }
  .tc__detail-btn { padding: 8px 14px; font-size: 12px }
}

/* ═══════════════════════════════════════ */
/* ══════════ REDUCED MOTION ════════════ */
/* ═══════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}

/* ═══════════════════════════════════════ */
/* ══════════ SCROLLBAR ═════════════════ */
/* ═══════════════════════════════════════ */
.tm__body::-webkit-scrollbar {
  width: 6px;
}
.tm__body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}
.tm__body::-webkit-scrollbar-thumb {
  background: #d1fae5;
  border-radius: 3px;
  transition: background .3s;
}
.tm__body::-webkit-scrollbar-thumb:hover {
  background: var(--c-light);
}
      `}</style>

      <PageHeader
        title="Travel Tips"
        subtitle="Essential advice and insider knowledge for your East African adventure."
        backgroundImage="https://i.pinimg.com/736x/4d/d7/b7/4dd7b788dfcaa0198254585156b94a9a.jpg"
        breadcrumbs={[{ label: "Travel Tips" }]}
      />

      <section className="tp__shell">
        <AnimatedSection animation="fadeInUp">
          <div className="tp__panel">
            <div className="tp__toolbar">
              <div className="tp__search">
                <FiSearch size={18} className="tp__search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  className="tp__search-input"
                  placeholder="Search tips, advice, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className={`tp__search-clear ${
                    searchQuery ? "tp__search-clear--show" : ""
                  }`}
                  onClick={() => {
                    setSearchQuery("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              </div>

              <div className="tp__controls">
                <button
                  type="button"
                  className={`tp__filter-btn ${
                    filterOpen ? "tp__filter-btn--on" : ""
                  }`}
                  onClick={() => setFilterOpen((p) => !p)}
                >
                  <FiFilter size={14} />
                  <span>Filters</span>
                  <FiChevronDown
                    size={14}
                    style={{
                      transition: "transform .35s cubic-bezier(.175,.885,.32,1.275)",
                      transform: filterOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>

                <div className="tp__layouts">
                  {[
                    { key: "grid", Icon: FiGrid },
                    { key: "list", Icon: FiList },
                    { key: "compact", Icon: FiSidebar },
                  ].map(({ key, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      className={`tp__layout-btn ${
                        layout === key ? "tp__layout-btn--on" : ""
                      }`}
                      onClick={() => setLayout(key)}
                      aria-label={`${key} layout`}
                    >
                      <Icon size={17} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`tp__cats ${
                filterOpen ? "tp__cats--open" : ""
              } ${categories.length <= 6 ? "tp__cats--always" : ""}`}
            >
              <button
                type="button"
                className={`tp__chip ${
                  selectedCategory === "all" ? "tp__chip--on" : ""
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                <span>All Tips</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`tp__chip ${
                    selectedCategory === cat ? "tp__chip--on" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            <div className="tp__stats">
              <p className="tp__count">
                Showing <strong>{tipCount}</strong> of {tips.length} tips
              </p>
              <span className="tp__book-icon">
                <FiBookOpen size={14} />
                {selectedCategory !== "all" ? selectedCategory : "All categories"}
              </span>
            </div>
          </div>
        </AnimatedSection>

        {filteredTips.length > 0 ? (
          <div className={`tp__${layout}`}>
            {filteredTips.map((tip, i) => (
              <AnimatedSection
                key={tip.id}
                animation="fadeInUp"
                delay={i * 0.04}
              >
                <TipCard
                  tip={tip}
                  isExpanded={expandedTip === tip.id}
                  onToggle={toggleTip}
                  onOpenModal={openModal}
                  index={i}
                />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection animation="fadeInUp">
            <div className="tp__empty">
              <div className="tp__empty-icon">🔍</div>
              <p className="tp__empty-text">
                No tips matched your current filters.
              </p>
              <p className="tp__empty-sub">
                Try adjusting your search or selecting a different category.
              </p>
            </div>
          </AnimatedSection>
        )}

        {modalTip && (
          <div
            className={`tm-overlay ${modalVisible ? "tm-overlay--show" : ""}`}
            onClick={closeModal}
          >
            <div
              ref={modalRef}
              className="tm"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tm-title"
            >
              <div
                className="tm__bg"
                style={{
                  backgroundImage: `url(${getBackgroundForCategory(modalTip.category)})`,
                }}
              />
              <div className="tm__bg-gradient" />

              <div className="tm__head">
                <div className="tm__icon">{modalTip.icon}</div>
                <div className="tm__info">
                  <span className="tm__cat">
                    <FiMap size={10} />
                    {modalTip.category}
                  </span>
                  <h2 className="tm__title" id="tm-title">
                    {modalTip.title}
                  </h2>
                </div>
                <button
                  className="tm__close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="tm__body">
                <TipDetails tip={modalTip} isModal />
              </div>
            </div>
          </div>
        )}

        {/* Download Tips Section */}
        <DownloadTips tips={filteredTips} tourName="East Africa Travel Tips" className="tips__download" />
      </section>
    </div>
  );
};

export default Tips;