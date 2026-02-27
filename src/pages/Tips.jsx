import React, { useMemo, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiFilter } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import { tips } from "../data/tips";

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTip, setExpandedTip] = useState(null);

  const categories = useMemo(() => [...new Set(tips.map((tip) => tip.category))], []);

  const filteredTips = useMemo(() => {
    return tips.filter((tip) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tip.title.toLowerCase().includes(query) ||
        tip.summary.toLowerCase().includes(query) ||
        tip.content.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === "all" || tip.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
        }

        .tips-search {
          position: relative;
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

        .tips-grid {
          margin-top: 26px;
          display: grid;
          gap: 16px;
        }

        .tips-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e8f0eb;
          box-shadow: 0 8px 26px rgba(2, 44, 34, 0.06);
          overflow: hidden;
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }

        .tips-card:hover {
          transform: translateY(-2px);
          border-color: #b9ecd5;
          box-shadow: 0 14px 32px rgba(4, 120, 87, 0.12);
        }

        .tips-card-head {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: clamp(16px, 2.3vw, 22px);
          cursor: pointer;
        }

        .tips-card-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 28px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          flex-shrink: 0;
        }

        .tips-card-cat {
          display: inline-flex;
          margin-bottom: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          padding: 4px 8px;
        }

        .tips-card-title {
          margin: 0 0 4px;
          color: var(--tips-text);
          font-size: clamp(18px, 2.4vw, 23px);
          font-family: "Playfair Display", serif;
          line-height: 1.2;
        }

        .tips-card-summary {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.55;
        }

        .tips-card-toggle {
          width: 38px;
          height: 38px;
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
          border-top: 1px solid #edf2ef;
          background: linear-gradient(180deg, #ffffff 0%, #f7fcf9 100%);
          padding: 18px 22px 22px;
        }

        .tips-card-text {
          margin: 0 0 16px;
          color: #334155;
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-line;
        }

        .tips-checklist {
          display: grid;
          gap: 10px;
        }

        .tips-check {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          padding: 10px 12px;
          color: #14532d;
          font-size: 13px;
          line-height: 1.5;
        }

        .tips-check-dot {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #059669;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
        }

        .tips-empty {
          text-align: center;
          padding: 24px;
          border-radius: 16px;
          border: 1px dashed #c7d9ce;
          color: #64748b;
          font-size: 14px;
          background: #fff;
        }

        @media (max-width: 900px) {
          .tips-toolbar {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .tips-card-head {
            grid-template-columns: auto minmax(0, 1fr);
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
              <div className="tips-filter-label">
                <FiFilter size={14} />
                Filter by Category
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

        <div className="tips-grid">
          {filteredTips.map((tip, index) => (
            <AnimatedSection key={tip.id} animation="fadeInUp" delay={index * 0.04}>
              <article className="tips-card">
                <header
                  className="tips-card-head"
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                >
                  <div className="tips-card-icon" aria-hidden="true">
                    {tip.icon}
                  </div>
                  <div>
                    <span className="tips-card-cat">{tip.category}</span>
                    <h3 className="tips-card-title">{tip.title}</h3>
                    <p className="tips-card-summary">{tip.summary}</p>
                  </div>
                  <button type="button" className="tips-card-toggle" aria-label="Toggle tip details">
                    {expandedTip === tip.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                  </button>
                </header>

                {expandedTip === tip.id && (
                  <div className="tips-card-body">
                    <p className="tips-card-text">{tip.content}</p>
                    <div className="tips-checklist">
                      {tip.tips.map((item, idx) => (
                        <div className="tips-check" key={`${tip.id}-item-${idx}`}>
                          <span className="tips-check-dot">OK</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </AnimatedSection>
          ))}

          {filteredTips.length === 0 && (
            <div className="tips-empty">No tips matched your current search and category filters.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tips;
