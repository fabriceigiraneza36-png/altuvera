import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
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
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { tips } from "../data/tips";

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [modalTip, setModalTip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tipCount, setTipCount] = useState(0);
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

  // Animate count
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
    }, 350);
  }, []);

  // ESC closes modal
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && modalTip && closeModal();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [modalTip, closeModal]);

  // Shared details renderer
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

  // Unified card component
  const TipCard = ({ tip, isExpanded, onToggle, onOpenModal, index }) => {
    const isCompact = layout === "compact";
    return (
      <article
        className={`tc tc--${layout} ${isExpanded ? "tc--expanded" : ""}`}
        style={{ "--idx": index }}
      >
        <header className="tc__head" onClick={() => onToggle(tip.id)}>
          <div className="tc__icon-wrap">
            <div className="tc__icon">{tip.icon}</div>
            <div className="tc__icon-glow" />
          </div>
          <div className="tc__info">
            <span className="tc__cat">{tip.category}</span>
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
/* ══════════ TOKENS ══════════ */
.tp {
  --bg: linear-gradient(175deg, #f0fdf4 0%, #ecfdf5 30%, #f8fafc 70%, #f0fdf4 100%);
  --panel: #ffffff;
  --c: #059669;
  --ch: #047857;
  --cl: #ecfdf5;
  --cb: #d1fae5;
  --txt: #0f172a;
  --txt2: #475569;
  --mute: #94a3b8;
  --brd: #e2e8f0;
  --r: 20px;
  --r-sm: 14px;
  --spring: cubic-bezier(.175,.885,.32,1.275);
  --smooth: cubic-bezier(.4,0,.2,1);
  --fast: .2s;
  --med: .35s;
  --fd: 'Playfair Display', serif;
  --fb: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  min-height: 100vh;
}

/* ══════════ SHELL ══════════ */
.tp__shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(32px,5vw,56px) clamp(14px,3vw,24px) clamp(80px,10vw,130px);
}

/* ══════════ TOOLBAR PANEL ══════════ */
.tp__panel {
  background: var(--panel);
  border-radius: 28px;
  border: 1px solid var(--cb);
  box-shadow:
    0 0 0 1px rgba(5,150,105,.04),
    0 20px 50px -12px rgba(2,44,34,.08);
  padding: clamp(20px,3vw,32px);
  position: relative;
  overflow: hidden;
}
.tp__panel::before {
  content: "";
  position: absolute;
  top: -1px; left: -1px; right: -1px;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669, #34d399, #059669);
  background-size: 300% 100%;
  animation: gradientSlide 4s ease infinite;
  border-radius: 28px 28px 0 0;
}
@keyframes gradientSlide {
  0%,100% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
}

.tp__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* Search */
.tp__search {
  position: relative;
  flex: 2 1 320px;
}
.tp__search-icon {
  position: absolute;
  left: 16px; top: 50%;
  transform: translateY(-50%);
  color: var(--mute);
  pointer-events: none;
  transition: color var(--fast);
}
.tp__search:focus-within .tp__search-icon {
  color: var(--c);
}
.tp__search-input {
  width: 100%;
  padding: 14px 48px 14px 46px;
  border-radius: 16px;
  border: 1.5px solid var(--brd);
  font-size: 14px;
  font-family: var(--fb);
  color: var(--txt);
  background: #fafffe;
  box-sizing: border-box;
  transition: border-color var(--fast), box-shadow var(--fast), background var(--fast);
}
.tp__search-input:focus {
  outline: none;
  border-color: var(--c);
  box-shadow: 0 0 0 4px rgba(5,150,105,.1);
  background: #fff;
}
.tp__search-input::placeholder {
  color: var(--mute);
}
.tp__search-clear {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  width: 28px; height: 28px;
  border: none; border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--fast);
  opacity: 0; pointer-events: none;
}
.tp__search-clear--show {
  opacity: 1; pointer-events: auto;
}
.tp__search-clear:hover {
  background: #fee2e2; color: #dc2626;
}

/* Controls */
.tp__controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.tp__filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 16px;
  border-radius: var(--r-sm);
  background: var(--cl);
  color: var(--c);
  font-size: 13px;
  font-weight: 700;
  border: 1.5px solid var(--cb);
  cursor: pointer;
  transition: all var(--fast);
  letter-spacing: .3px;
}
.tp__filter-btn:hover {
  background: var(--c);
  border-color: var(--c);
  color: #fff;
  box-shadow: 0 6px 20px rgba(5,150,105,.25);
}
.tp__filter-btn--on {
  background: var(--c);
  border-color: var(--c);
  color: #fff;
}

/* Layout switcher */
.tp__layouts {
  display: flex;
  gap: 3px;
  background: #f1f5f9;
  border: 1px solid var(--brd);
  border-radius: 14px;
  padding: 3px;
}
.tp__layout-btn {
  background: transparent;
  border: none;
  width: 38px; height: 38px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all .25s var(--spring);
  position: relative;
}
.tp__layout-btn:hover { color: var(--c) }
.tp__layout-btn--on {
  background: var(--c);
  color: #fff;
  box-shadow: 0 4px 14px rgba(5,150,105,.3);
  transform: scale(1.05);
}

/* Categories */
.tp__cats {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height .4s var(--smooth), opacity .3s, margin .3s;
}
.tp__cats--open {
  max-height: 300px;
  opacity: 1;
  margin-top: 16px;
}
.tp__cats--always {
  max-height: none;
  opacity: 1;
}
.tp__chip {
  border: 1.5px solid var(--brd);
  background: #fff;
  color: #475569;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--fb);
  transition: all .25s var(--spring);
  position: relative;
  overflow: hidden;
}
.tp__chip::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--c);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .3s var(--smooth);
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
  transform: translateY(-1px);
}
.tp__chip--on {
  border-color: var(--c);
  background: var(--c);
  color: #fff;
  box-shadow: 0 6px 20px rgba(5,150,105,.25);
  transform: translateY(-1px);
}
.tp__chip--on::before {
  transform: scaleX(1);
}
.tp__chip--on:hover {
  color: #fff;
}

/* Stats bar */
.tp__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}
.tp__count {
  color: var(--txt2);
  font-size: 13px;
  font-weight: 500;
}
.tp__count strong {
  color: var(--c);
  font-weight: 700;
  font-size: 16px;
}
.tp__book-icon {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--mute);
  font-size: 12px;
}

/* ══════════ LAYOUT CONTAINERS ══════════ */
.tp__grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 22px;
}
.tp__list {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tp__compact {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ══════════ TIP CARD ══════════ */
.tc {
  background: var(--panel);
  border-radius: 24px;
  border: 1.5px solid #e8f5ee;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all .35s var(--smooth);
  position: relative;
}
.tc::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 4px; height: 0;
  background: var(--c);
  border-radius: 0 4px 4px 0;
  transition: height .4s var(--spring);
}
.tc:hover::before {
  height: 100%;
}
.tc:hover {
  border-color: #a7f3d0;
  box-shadow:
    0 0 0 1px rgba(5,150,105,.06),
    0 20px 50px -12px rgba(4,120,87,.15);
  transform: translateY(-3px);
}
.tc--expanded {
  border-color: #86efac;
  box-shadow:
    0 0 0 1px rgba(5,150,105,.08),
    0 24px 56px -14px rgba(4,120,87,.18);
}
.tc--expanded::before {
  height: 100%;
}

/* compact variant */
.tc--compact {
  border-radius: 16px;
}
.tc--compact .tc__head {
  padding: 14px 18px;
}
.tc--compact .tc__icon-wrap { width: 44px; height: 44px }
.tc--compact .tc__icon { font-size: 22px }
.tc--compact .tc__title { font-size: 16px }

/* list variant */
.tc--list .tc__head {
  padding: 20px 24px;
}

/* Header */
.tc__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: clamp(18px,2.5vw,24px);
  cursor: pointer;
  user-select: none;
  transition: background var(--fast);
}
.tc__head:hover {
  background: rgba(5,150,105,.02);
}

.tc__icon-wrap {
  position: relative;
  width: 56px; height: 56px;
  flex-shrink: 0;
}
.tc__icon {
  width: 100%; height: 100%;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 28px;
  background: linear-gradient(145deg, #d1fae5, #a7f3d0);
  box-shadow:
    inset 0 2px 6px rgba(255,255,255,.8),
    0 4px 12px rgba(2,44,34,.08);
  position: relative;
  z-index: 1;
  transition: transform .3s var(--spring), box-shadow .3s;
}
.tc:hover .tc__icon {
  transform: scale(1.06) rotate(-2deg);
  box-shadow:
    inset 0 2px 6px rgba(255,255,255,.8),
    0 8px 24px rgba(5,150,105,.2);
}
.tc__icon-glow {
  position: absolute;
  inset: -6px;
  border-radius: 20px;
  background: radial-gradient(circle, rgba(16,185,129,.2), transparent 70%);
  opacity: 0;
  transition: opacity .3s;
  z-index: 0;
}
.tc:hover .tc__icon-glow { opacity: 1 }

.tc__info { min-width: 0 }

.tc__cat {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--c);
  background: var(--cl);
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 3px 10px;
}

.tc__title {
  margin: 0 0 5px;
  color: var(--txt);
  font-size: clamp(17px, 2vw, 22px);
  font-family: var(--fd);
  font-weight: 700;
  line-height: 1.25;
  transition: color var(--fast);
}
.tc:hover .tc__title { color: var(--ch) }

.tc__summary {
  margin: 0;
  color: var(--txt2);
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Toggle button */
.tc__toggle {
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1.5px solid #d1fae5;
  background: var(--cl);
  color: var(--c);
  display: grid; place-items: center;
  cursor: pointer;
  transition: all .3s var(--spring);
  flex-shrink: 0;
}
.tc__toggle svg {
  transition: transform .35s var(--spring);
}
.tc__toggle--on svg {
  transform: rotate(180deg);
}
.tc__head:hover .tc__toggle {
  background: var(--c);
  border-color: var(--c);
  color: #fff;
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(5,150,105,.3);
}

/* Expandable body */
.tc__body {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height .45s var(--smooth),
              opacity .35s var(--smooth);
}
.tc__body--open {
  max-height: 2000px;
  opacity: 1;
}
.tc__body-inner {
  border-top: 1px solid #e8f5ee;
  padding: 22px 24px 26px;
  background: linear-gradient(180deg, #fafffe 0%, #f0fdf4 100%);
}

/* Footer */
.tc__foot {
  padding: 10px 20px 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}
.tc__detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1.5px solid #d1fae5;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c);
  cursor: pointer;
  font-family: var(--fb);
  transition: all .25s var(--spring);
  overflow: hidden;
  position: relative;
}
.tc__detail-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--c);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .3s var(--smooth);
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
  box-shadow: 0 6px 20px rgba(5,150,105,.2);
  transform: translateY(-1px);
}
.tc__detail-btn:hover::before {
  transform: scaleX(1);
}
.tc__detail-arrow {
  transition: transform .25s var(--spring);
}
.tc__detail-btn:hover .tc__detail-arrow {
  transform: translateX(3px);
}

/* ══════════ TIP DETAILS (shared) ══════════ */
.td__content {
  margin: 0 0 20px;
  color: #334155;
  font-size: 15px;
  line-height: 1.85;
  white-space: pre-line;
}
.td--modal .td__content {
  font-size: 16px;
}

.td__checks {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}
.td__check {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 14px 16px;
  color: #14532d;
  font-size: 14px;
  line-height: 1.55;
  transition: all .25s var(--smooth);
  opacity: 0;
  transform: translateX(-8px);
  animation: checkIn .4s var(--smooth) calc(var(--ci) * .04s + .1s) forwards;
}
@keyframes checkIn {
  to { opacity: 1; transform: none }
}
.td__check:hover {
  background: #ecfdf5;
  border-color: #86efac;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(5,150,105,.08);
}
.td__check-icon {
  width: 24px; height: 24px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: var(--c);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5,150,105,.3);
}
.td__check-text {
  padding-top: 2px;
}

.td__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed #cbd5e1;
}
.td__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* ══════════ MODAL ══════════ */
.tm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2,44,34,.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity .35s var(--smooth), visibility .35s;
}
.tm-overlay--show {
  opacity: 1;
  visibility: visible;
}

.tm {
  background: #fff;
  border-radius: 28px;
  max-width: 740px;
  width: 100%;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 0 1px rgba(5,150,105,.06),
    0 40px 100px -20px rgba(2,44,34,.3);
  transform: translateY(20px) scale(.97);
  transition: transform .4s var(--spring), opacity .3s;
  opacity: 0;
}
.tm-overlay--show .tm {
  transform: none;
  opacity: 1;
}

.tm__head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid #e8f5ee;
  flex-shrink: 0;
  background: linear-gradient(180deg, #fafffe, #fff);
}
.tm__icon {
  width: 64px; height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-size: 34px;
  background: linear-gradient(145deg, #d1fae5, #a7f3d0);
  box-shadow:
    inset 0 2px 6px rgba(255,255,255,.8),
    0 6px 18px rgba(2,44,34,.1);
  flex-shrink: 0;
}
.tm__info { flex: 1; min-width: 0 }
.tm__cat {
  display: inline-flex;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: var(--c);
  background: var(--cl);
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 4px 12px;
}
.tm__title {
  margin: 0;
  font-size: clamp(22px,3vw,28px);
  font-family: var(--fd);
  font-weight: 700;
  color: var(--txt);
  line-height: 1.2;
}
.tm__close {
  width: 42px; height: 42px;
  border: 1.5px solid var(--brd);
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .25s var(--spring);
}
.tm__close:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
  transform: rotate(90deg);
}

.tm__body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
  overscroll-behavior: contain;
}

/* ══════════ EMPTY STATE ══════════ */
.tp__empty {
  text-align: center;
  padding: 60px 30px;
  border-radius: 24px;
  border: 2px dashed #d1fae5;
  color: var(--txt2);
  font-size: 15px;
  background: rgba(255,255,255,.7);
  margin-top: 28px;
}
.tp__empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: .4;
}
.tp__empty-text {
  margin: 0;
  font-weight: 500;
}
.tp__empty-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--mute);
}

/* ══════════ RESPONSIVE ══════════ */
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
    gap: 12px;
  }
  .tc__icon-wrap {
    width: 48px; height: 48px;
  }
  .tc__icon { font-size: 24px }
  .tm__head {
    flex-wrap: wrap;
    padding: 20px;
  }
  .tm__body { padding: 20px }
  .tm__title { font-size: 22px }
}

@media (max-width: 480px) {
  .tc { border-radius: 18px }
  .tc__title { font-size: 16px }
  .tc__summary { font-size: 13px; -webkit-line-clamp: 2 }
  .tc__body-inner { padding: 16px }
  .tc__foot { padding: 8px 14px 12px }
  .tp__chip { padding: 7px 12px; font-size: 12px }
  .tm { border-radius: 20px; max-height: 92vh }
  .tm__icon { width: 52px; height: 52px; font-size: 28px }
}

/* ═══ reduced motion ═══ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
      `}</style>

      <PageHeader
        title="Travel Tips"
        subtitle="Essential advice and insider knowledge for your East African adventure."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
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
                  Filters
                  <FiChevronDown
                    size={14}
                    style={{
                      transition: "transform .3s",
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

            {/* Categories */}
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

            {/* Stats */}
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

        {/* Cards */}
        {filteredTips.length > 0 ? (
          <div className={`tp__${layout}`}>
            {filteredTips.map((tip, i) => (
              <AnimatedSection
                key={tip.id}
                animation="fadeInUp"
                delay={i * 0.03}
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
          <div className="tp__empty">
            <div className="tp__empty-icon">🔍</div>
            <p className="tp__empty-text">
              No tips matched your current filters.
            </p>
            <p className="tp__empty-sub">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}

        {/* Modal */}
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
              <div className="tm__head">
                <div className="tm__icon">{modalTip.icon}</div>
                <div className="tm__info">
                  <span className="tm__cat">{modalTip.category}</span>
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
      </section>
    </div>
  );
};

export default Tips;