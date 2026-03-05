import React, { useMemo, useState } from "react";
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
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { tips } from "../data/tips";

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [modalTip, setModalTip] = useState(null); // tip object for modal

  const categories = useMemo(() => [...new Set(tips.map((tip) => tip.category))], []);

  const filteredTips = useMemo(() => {
    return tips.filter((tip) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tip.title.toLowerCase().includes(query) ||
        tip.summary.toLowerCase().includes(query) ||
        tip.content.toLowerCase().includes(query) ||
        (tip.lastUpdated && tip.lastUpdated.toLowerCase().includes(query)) ||
        (tip.source && tip.source.toLowerCase().includes(query)) ||
        tip.tips.some((t) => t.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === "all" || tip.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleTip = (id) => {
    setExpandedTip(expandedTip === id ? null : id);
  };

  const openModal = (tip) => setModalTip(tip);
  const closeModal = () => setModalTip(null);

  // Reusable expanded details component (used both inline and in modal)
  const TipDetails = ({ tip }) => (
    <>
      <p className="tips-card-text">{tip.content}</p>
      <div className="tips-checklist">
        {tip.tips.map((item, idx) => (
          <div className="tips-check" key={`${tip.id}-item-${idx}`}>
            <span className="tips-check-dot">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="tips-metadata">
        {tip.lastUpdated && (
          <div className="tips-metadata-item">
            <span>📅</span>
            <span>Last updated: {tip.lastUpdated}</span>
          </div>
        )}
        {tip.source && (
          <div className="tips-metadata-item">
            <span>📰</span>
            <span>Source: {tip.source}</span>
          </div>
        )}
      </div>
    </>
  );

  // Card components for each layout (now with modal button)
  const GridTipCard = ({ tip, isExpanded, onToggle, onOpenModal }) => (
    <article className="tips-card tips-card-grid">
      <header className="tips-card-head" onClick={() => onToggle(tip.id)}>
        <div className="tips-card-icon" aria-hidden="true">
          {tip.icon}
        </div>
        <div>
          <span className="tips-card-cat">{tip.category}</span>
          <h3 className="tips-card-title">{tip.title}</h3>
          <p className="tips-card-summary">{tip.summary}</p>
        </div>
        <button
          type="button"
          className="tips-card-toggle"
          aria-label="Toggle tip details"
        >
          {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </header>
      {isExpanded && (
        <div className="tips-card-body">
          <TipDetails tip={tip} />
        </div>
      )}
      <div className="tips-card-footer">
        <button
          className="tips-modal-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal(tip);
          }}
          aria-label="Open in modal"
        >
          <FiMaximize2 size={16} />
          <span>Details</span>
        </button>
      </div>
    </article>
  );

  const ListTipCard = ({ tip, isExpanded, onToggle, onOpenModal }) => (
    <article className="tips-card tips-card-list">
      <header className="tips-card-head" onClick={() => onToggle(tip.id)}>
        <div className="tips-card-icon" aria-hidden="true">
          {tip.icon}
        </div>
        <div className="tips-card-content">
          <span className="tips-card-cat">{tip.category}</span>
          <h3 className="tips-card-title">{tip.title}</h3>
          <p className="tips-card-summary">{tip.summary}</p>
        </div>
        <button
          type="button"
          className="tips-card-toggle"
          aria-label="Toggle tip details"
        >
          {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </header>
      {isExpanded && (
        <div className="tips-card-body">
          <TipDetails tip={tip} />
        </div>
      )}
      <div className="tips-card-footer">
        <button
          className="tips-modal-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal(tip);
          }}
          aria-label="Open in modal"
        >
          <FiMaximize2 size={16} />
          <span>Details</span>
        </button>
      </div>
    </article>
  );

  const CompactTipCard = ({ tip, isExpanded, onToggle, onOpenModal }) => (
    <article className="tips-card tips-card-compact">
      <header className="tips-card-head" onClick={() => onToggle(tip.id)}>
        <div className="tips-card-icon" aria-hidden="true">
          {tip.icon}
        </div>
        <div className="tips-card-content">
          <span className="tips-card-cat">{tip.category}</span>
          <h3 className="tips-card-title">{tip.title}</h3>
        </div>
        <button
          type="button"
          className="tips-card-toggle"
          aria-label="Toggle tip details"
        >
          {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </header>
      {isExpanded && (
        <div className="tips-card-body">
          <TipDetails tip={tip} />
        </div>
      )}
      <div className="tips-card-footer">
        <button
          className="tips-modal-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal(tip);
          }}
          aria-label="Open in modal"
        >
          <FiMaximize2 size={16} />
          <span>Details</span>
        </button>
      </div>
    </article>
  );

  return (
    <div className="tips-page">
      <style>{`
        .tips-page {
          --tips-bg: #f4f9f4;
          --tips-panel: #ffffff;
          --tips-primary: #047857;
          --tips-primary-soft: #ecfdf5;
          --tips-border: #d1fae5;
          --tips-text: #0f172a;
          --tips-muted: #475569;
          background: linear-gradient(180deg, #f8fffb 0%, #f3faf5 100%);
        }

        .tips-shell {
          max-width: 1220px;
          margin: 0 auto;
          padding: clamp(34px, 5vw, 58px) clamp(14px, 3vw, 24px) clamp(80px, 10vw, 120px);
        }

        .tips-panel {
          background: var(--tips-panel);
          border-radius: 24px;
          border: 1px solid var(--tips-border);
          box-shadow: 0 16px 40px rgba(2, 44, 34, 0.08);
          padding: clamp(18px, 3vw, 28px);
        }

        .tips-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          justify-content: space-between;
        }

        .tips-search {
          position: relative;
          flex: 2 1 300px;
        }

        .tips-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .tips-search input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border-radius: 14px;
          border: 1px solid #dbe4de;
          font-size: 14px;
          color: var(--tips-text);
          background: #fff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .tips-search input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }

        .tips-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .tips-filter-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--tips-primary-soft);
          color: var(--tips-primary);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .tips-layout-switcher {
          display: flex;
          gap: 4px;
          background: #fff;
          border: 1px solid #dbe4de;
          border-radius: 40px;
          padding: 4px;
        }

        .tips-layout-btn {
          background: transparent;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tips-layout-btn.active {
          background: #059669;
          color: white;
        }

        .tips-categories {
          margin-top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tips-chip {
          border: 1px solid #dbe4de;
          background: #fff;
          color: #334155;
          padding: 9px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tips-chip:hover {
          border-color: #9fe6c4;
          color: var(--tips-primary);
        }

        .tips-chip.is-active {
          border-color: #059669;
          background: #059669;
          color: #fff;
          box-shadow: 0 8px 20px rgba(5,150,105,0.25);
        }

        .tips-meta {
          margin-top: 12px;
          color: var(--tips-muted);
          font-size: 13px;
        }

        /* Layout containers */
        .tips-grid-layout {
          margin-top: 26px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .tips-list-layout {
          margin-top: 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tips-compact-layout {
          margin-top: 26px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Base card styles (refined) */
        .tips-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #e2f0e8;
          box-shadow: 0 10px 30px -8px rgba(2, 44, 34, 0.1);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          flex-direction: column;
        }

        .tips-card:hover {
          transform: translateY(-4px);
          border-color: #b9ecd5;
          box-shadow: 0 20px 40px -12px rgba(4, 120, 87, 0.25);
        }

        .tips-card-head {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
          padding: clamp(18px, 2.5vw, 24px);
          cursor: pointer;
          background: white;
        }

        .tips-card-list .tips-card-head {
          grid-template-columns: auto 1fr auto;
        }

        .tips-card-compact .tips-card-head {
          grid-template-columns: auto 1fr auto;
          padding: 14px 18px;
        }

        .tips-card-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 30px;
          background: linear-gradient(145deg, #d1fae5, #a7f3d0);
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 8px rgba(2, 44, 34, 0.1);
        }

        .tips-card-cat {
          display: inline-block;
          margin-bottom: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          padding: 4px 10px;
        }

        .tips-card-title {
          margin: 0 0 6px;
          color: var(--tips-text);
          font-size: clamp(18px, 2.4vw, 24px);
          font-family: "Playfair Display", serif;
          font-weight: 600;
          line-height: 1.2;
        }

        .tips-card-summary {
          margin: 0;
          color: #4b5e6b;
          font-size: 14px;
          line-height: 1.6;
        }

        .tips-card-toggle {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid #d1fae5;
          background: #ecfdf5;
          color: #047857;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .tips-card-head:hover .tips-card-toggle {
          background: #059669;
          border-color: #059669;
          color: #fff;
        }

        .tips-card-body {
          border-top: 1px solid #e2f0e8;
          background: linear-gradient(180deg, #ffffff 0%, #f8fdfa 100%);
          padding: 20px 24px 24px;
        }

        .tips-card-text {
          margin: 0 0 18px;
          color: #2d3c48;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-line;
        }

        .tips-checklist {
          display: grid;
          gap: 12px;
          margin-bottom: 18px;
        }

        .tips-check {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: start;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 12px 16px;
          color: #14532d;
          font-size: 14px;
          line-height: 1.5;
        }

        .tips-check-dot {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #059669;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        .tips-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed #cbd5e1;
          font-size: 13px;
          color: #5b6f7e;
        }

        .tips-metadata-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tips-card-footer {
          padding: 12px 20px 16px;
          background: white;
          border-top: 1px solid #ecfdf5;
          display: flex;
          justify-content: flex-end;
        }

        .tips-modal-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid #d1fae5;
          border-radius: 30px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #047857;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tips-modal-btn:hover {
          background: #059669;
          border-color: #059669;
          color: white;
        }

        .tips-modal-btn svg {
          transition: transform 0.2s ease;
        }

        .tips-modal-btn:hover svg {
          transform: scale(1.1);
        }

        /* Modal styles */
        .tips-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 44, 34, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .tips-modal {
          background: white;
          border-radius: 32px;
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 40px 80px -20px rgba(2, 44, 34, 0.4);
          animation: scaleUp 0.3s ease;
        }

        .tips-modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px 28px;
          border-bottom: 1px solid #e2f0e8;
        }

        .tips-modal-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          font-size: 36px;
          background: linear-gradient(145deg, #d1fae5, #a7f3d0);
        }

        .tips-modal-header-text {
          flex: 1;
        }

        .tips-modal-category {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          padding: 4px 12px;
          display: inline-block;
          margin-bottom: 6px;
        }

        .tips-modal-title {
          margin: 0;
          font-size: 28px;
          font-family: "Playfair Display", serif;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .tips-modal-close {
          background: transparent;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tips-modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .tips-modal-body {
          padding: 28px;
        }

        .tips-modal-content {
          font-size: 16px;
          line-height: 1.8;
          color: #2d3c48;
          white-space: pre-line;
          margin-bottom: 24px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .tips-empty {
          text-align: center;
          padding: 40px;
          border-radius: 24px;
          border: 1px dashed #c7d9ce;
          color: #64748b;
          font-size: 15px;
          background: #fff;
        }

        @media (max-width: 640px) {
          .tips-card-head {
            grid-template-columns: auto 1fr auto;
          }
          .tips-card-toggle {
            grid-column: 2;
            justify-self: end;
          }
        }
      `}</style>

      <PageHeader
        title="Travel Tips"
        subtitle="Essential advice and insider knowledge for your East African adventure."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920"
        breadcrumbs={[{ label: "Travel Tips" }]}
      />

      <section className="tips-shell">
        <AnimatedSection animation="fadeInUp">
          <div className="tips-panel">
            <div className="tips-toolbar">
              <label className="tips-search" htmlFor="tips-search-input">
                <FiSearch size={18} />
                <input
                  id="tips-search-input"
                  type="text"
                  placeholder="Search tips, summaries, and full content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>

              <div className="tips-controls">
                <div className="tips-filter-label">
                  <FiFilter size={14} />
                  Filter
                </div>
                <div className="tips-layout-switcher">
                  <button
                    type="button"
                    className={`tips-layout-btn ${layout === "grid" ? "active" : ""}`}
                    onClick={() => setLayout("grid")}
                    aria-label="Grid layout"
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    type="button"
                    className={`tips-layout-btn ${layout === "list" ? "active" : ""}`}
                    onClick={() => setLayout("list")}
                    aria-label="List layout"
                  >
                    <FiList size={18} />
                  </button>
                  <button
                    type="button"
                    className={`tips-layout-btn ${layout === "compact" ? "active" : ""}`}
                    onClick={() => setLayout("compact")}
                    aria-label="Compact layout"
                  >
                    <FiSidebar size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="tips-categories">
              <button
                type="button"
                className={`tips-chip ${selectedCategory === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Tips
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`tips-chip ${selectedCategory === category ? "is-active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="tips-meta">
              Showing {filteredTips.length} of {tips.length} tips
            </p>
          </div>
        </AnimatedSection>

        {/* Dynamic layout container */}
        <div className={`tips-${layout}-layout`}>
          {filteredTips.map((tip, index) => {
            const isExpanded = expandedTip === tip.id;
            const commonProps = {
              tip,
              isExpanded,
              onToggle: toggleTip,
              onOpenModal: openModal,
            };

            return (
              <AnimatedSection key={tip.id} animation="fadeInUp" delay={index * 0.02}>
                {layout === "grid" && <GridTipCard {...commonProps} />}
                {layout === "list" && <ListTipCard {...commonProps} />}
                {layout === "compact" && <CompactTipCard {...commonProps} />}
              </AnimatedSection>
            );
          })}
          {filteredTips.length === 0 && (
            <div className="tips-empty">No tips matched your current search and category filters.</div>
          )}
        </div>

        {/* Modal */}
        {modalTip && (
          <div className="tips-modal-overlay" onClick={closeModal}>
            <div className="tips-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tips-modal-header">
                <div className="tips-modal-icon">{modalTip.icon}</div>
                <div className="tips-modal-header-text">
                  <span className="tips-modal-category">{modalTip.category}</span>
                  <h2 className="tips-modal-title">{modalTip.title}</h2>
                </div>
                <button className="tips-modal-close" onClick={closeModal} aria-label="Close modal">
                  <FiX size={24} />
                </button>
              </div>
              <div className="tips-modal-body">
                <p className="tips-modal-content">{modalTip.content}</p>
                <div className="tips-checklist">
                  {modalTip.tips.map((item, idx) => (
                    <div className="tips-check" key={`modal-${modalTip.id}-item-${idx}`}>
                      <span className="tips-check-dot">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="tips-metadata">
                  {modalTip.lastUpdated && (
                    <div className="tips-metadata-item">
                      <span>📅</span>
                      <span>Last updated: {modalTip.lastUpdated}</span>
                    </div>
                  )}
                  {modalTip.source && (
                    <div className="tips-metadata-item">
                      <span>📰</span>
                      <span>Source: {modalTip.source}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Tips;