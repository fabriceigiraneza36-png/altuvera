import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  FiSearch,
  FiGrid,
  FiList,
  FiX,
  FiArrowRight,
  FiClock,
  FiExternalLink,
  FiCheckCircle,
  FiMapPin,
  FiShield,
  FiSun,
  FiBriefcase,
  FiCoffee,
  FiHeart,
  FiGlobe,
  FiMessageCircle,
  FiDollarSign,
  FiCamera,
  FiDownloadCloud,
  FiMenu,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import DownloadTips from "../components/common/DownloadTips";
import { tips } from "../data/tips";

// --- ASSETS & CONFIGURATION ---
const categoryBackgrounds = {
  "Health & Safety":
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
  Culture:
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
  Transportation:
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
  Accommodation:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "Food & Drink":
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  Wildlife:
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
  Budget: "https://images.unsplash.com/photo-1553729459-uj4hs4bzlfi?w=800&q=80",
  Packing:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  Photography:
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  Weather:
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80",
  "Visa & Documents":
    "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=800&q=80",
  Communication:
    "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80",
  Money:
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80",
};

const getBackgroundForCategory = (category) => {
  for (const [key, url] of Object.entries(categoryBackgrounds)) {
    if (
      category?.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(category?.toLowerCase())
    ) {
      return url;
    }
  }
  return categoryBackgrounds.default;
};

// --- CUSTOM HOOK: USE IN VIEW (FIXED FOR CRASHES) ---
const useInView = (options = { threshold: 0.1, rootMargin: "0px" }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // Only trigger once
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
};

// --- MAIN COMPONENT ---
const Tips = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [layout, setLayout] = useState("grid");
  const [modalTip, setModalTip] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipCount, setTipCount] = useState(0);

  // Derived State
  const categories = useMemo(
    () => ["all", ...new Set(tips.map((t) => t.category))],
    [],
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

  // Animated Counter
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
    }, 20);
    return () => clearInterval(id);
  }, [filteredTips.length, tipCount]);

  // Modal Logic
  const openModal = useCallback((tip) => {
    setModalTip(tip);
    requestAnimationFrame(() => setModalVisible(true));
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setModalTip(null), 400);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const fn = (e) => e.key === "Escape" && modalTip && closeModal();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [modalTip, closeModal]);

  // Get Icon for Category
  const getCategoryIcon = (cat) => {
    const lower = cat.toLowerCase();
    if (lower.includes("health") || lower.includes("safety"))
      return <FiShield />;
    if (lower.includes("culture")) return <FiGlobe />;
    if (lower.includes("transport")) return <FiBriefcase />;
    if (lower.includes("food")) return <FiCoffee />;
    if (lower.includes("wildlife")) return <FiHeart />;
    if (lower.includes("budget") || lower.includes("money"))
      return <FiDollarSign />;
    if (lower.includes("photo")) return <FiCamera />;
    if (lower.includes("weather")) return <FiSun />;
    if (lower.includes("comm")) return <FiMessageCircle />;
    return <FiMapPin />;
  };

  return (
    <div className="tips-wrapper">
      <style>{`
        /* --- PROFESSIONAL DESIGN SYSTEM --- */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          /* Palette: Deep Emerald & Slate */
          --c-primary: #047857;
          --c-primary-dark: #064e3b;
          --c-primary-light: #10b981;
          --c-surface: #ffffff;
          --c-bg: #f8fafc;
          --c-text-main: #0f172a;
          --c-text-muted: #64748b;
          --c-border: #e2e8f0;
          
          /* Shadows */
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          --shadow-glow: 0 0 20px rgba(16, 185, 129, 0.15);

          /* Animation */
          --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
          --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* --- LAYOUT --- */
        .tips-wrapper {
          background: var(--c-bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--c-text-main);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .tips-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* --- STICKY TOOLBAR --- */
        .toolbar {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          padding: 16px 24px;
          margin-bottom: 40px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 20px;
          z-index: 100;
          transition: all 0.3s ease;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          min-width: 280px;
          max-width: 450px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border-radius: 12px;
          border: 1px solid var(--c-border);
          background: #f1f5f9;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--c-text-main);
          transition: all 0.2s;
          outline: none;
        }

        .search-input:focus {
          background: #fff;
          border-color: var(--c-primary);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--c-text-muted);
          pointer-events: none;
        }

        .controls-group {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
        }

        .layout-btn {
          background: transparent;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--c-text-muted);
          transition: all 0.2s;
        }

        .layout-btn.active {
          background: #fff;
          color: var(--c-primary);
          box-shadow: var(--shadow-sm);
        }

        /* --- CATEGORY CHIPS --- */
        .category-scroller {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 32px;
          scrollbar-width: none;
        }
        .category-scroller::-webkit-scrollbar { display: none; }

        .chip {
          padding: 8px 16px;
          border-radius: 100px;
          border: 1px solid transparent;
          background: var(--c-surface);
          color: var(--c-text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: var(--shadow-sm);
        }

        .chip:hover {
          transform: translateY(-2px);
          color: var(--c-primary);
          border-color: var(--c-primary-light);
        }

        .chip.active {
          background: var(--c-primary);
          color: #fff;
          box-shadow: 0 4px 10px rgba(4, 120, 87, 0.3);
        }

        /* --- GRID & LIST --- */
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* --- CARD DESIGN --- */
        .tip-card {
          background: var(--c-surface);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.6);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s var(--ease-out);
          opacity: 0;
          transform: translateY(30px);
        }

        .tip-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .tip-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          border-color: rgba(16, 185, 129, 0.3);
        }

        /* List View Specifics */
        .tips-list .tip-card {
          flex-direction: row;
          height: 160px;
          align-items: center;
        }
        .tips-list .tip-card__media {
          width: 200px;
          height: 100%;
          flex-shrink: 0;
          border-radius: 0;
        }
        .tips-list .tip-card__content {
          flex: 1;
          padding: 0 24px;
        }
        .tips-list .tip-card__footer {
          border-top: none;
          border-left: 1px solid #f1f5f9;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          background: transparent;
          margin-top: 0;
        }
        .tips-list .tip-card__summary { display: none; }
        .tips-list .tip-card__badge { margin-bottom: 8px; }
        .tips-list .tip-card__title { font-size: 1.4rem; }

        /* Card Media */
        .tip-card__media {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
          transition: transform 0.5s var(--ease-out);
        }
        .tip-card:hover .tip-card__media { transform: scale(1.05); }
        .tip-card__media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(4, 120, 87, 0.1) 100%);
        }

        /* Card Content */
        .tip-card__content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .tip-card__badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--c-primary);
          background: rgba(16, 185, 129, 0.1);
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          width: fit-content;
        }

        .tip-card__title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--c-text-main);
          line-height: 1.3;
        }

        .tip-card__summary {
          font-size: 0.95rem;
          color: var(--c-text-muted);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Card Footer */
        .tip-card__footer {
          margin-top: auto;
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
        }

        .btn-read-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--c-primary);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-read-more:hover {
          background: var(--c-primary-dark);
          transform: translateY(-2px);
        }

        /* --- MODAL --- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          padding: 20px;
        }
        .modal-overlay.open { opacity: 1; visibility: visible; }

        .modal-container {
          background: white;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: scale(0.95) translateY(20px);
          transition: all 0.4s var(--ease-elastic);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .modal-overlay.open .modal-container {
          transform: scale(1) translateY(0);
        }

        .modal-header {
          padding: 32px;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 24px;
          position: relative;
        }

        .modal-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: white;
          color: var(--c-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          color: var(--c-text-main);
        }

        .modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: white;
          color: var(--c-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 32px;
          overflow-y: auto;
        }

        .modal-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #475569;
          margin-bottom: 32px;
        }

        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .check-item:hover {
          background: white;
          border-color: var(--c-primary-light);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }
        .check-icon {
          color: var(--c-primary);
          margin-top: 2px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .tips-grid { grid-template-columns: 1fr; }
          .tips-list .tip-card { flex-direction: column; height: auto; }
          .tips-list .tip-card__media { width: 100%; height: 180px; }
          .tips-list .tip-card__footer { border-left: none; border-top: 1px solid #f1f5f9; padding: 16px 24px; }
          .toolbar { flex-direction: column; align-items: stretch; }
          .controls-group { justify-content: space-between; }
          .modal-header { flex-direction: column; text-align: center; }
          .modal-title { font-size: 1.5rem; }
        }
      `}</style>

      {/* --- HEADER --- */}
      <PageHeader
        title="Travel Insights"
        subtitle="Curated professional advice for a seamless East African experience."
        backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80"
        breadcrumbs={[{ label: "Travel Tips" }]}
      >
        <div
          data-download-trigger
          style={{ opacity: 0, pointerEvents: "none", position: "absolute" }}
        />
      </PageHeader>

      <div className="tips-container">
        {/* --- TOOLBAR --- */}
        <div className="toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search advice, safety, culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="controls-group">
            <button
              className={`layout-btn ${layout === "grid" ? "active" : ""}`}
              onClick={() => setLayout("grid")}
              aria-label="Grid View"
            >
              <FiGrid size={18} />
            </button>
            <button
              className={`layout-btn ${layout === "list" ? "active" : ""}`}
              onClick={() => setLayout("list")}
              aria-label="List View"
            >
              <FiList size={18} />
            </button>
          </div>
        </div>

        {/* --- CATEGORIES --- */}
        <div className="category-scroller">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? <FiGlobe size={14} /> : getCategoryIcon(cat)}
              {cat === "all" ? "All Insights" : cat}
            </button>
          ))}
        </div>

        {/* --- STATS --- */}
        <div
          style={{
            marginBottom: "24px",
            color: "var(--c-text-muted)",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Displaying{" "}
          <strong style={{ color: "var(--c-primary)" }}>{tipCount}</strong>{" "}
          curated tips
        </div>

        {/* --- CONTENT --- */}
        {filteredTips.length > 0 ? (
          <div className={layout === "grid" ? "tips-grid" : "tips-list"}>
            {filteredTips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                layout={layout}
                onOpen={openModal}
                getIcon={getCategoryIcon}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--c-text-muted)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "#f1f5f9",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <FiSearch size={32} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "var(--c-text-main)" }}>
              No insights found
            </h3>
            <p>Try adjusting your search terms or category filters.</p>
          </div>
        )}

        {/* --- DOWNLOAD --- */}
        <div
          style={{
            marginTop: "80px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "40px",
          }}
        >
          <DownloadTips
            tips={filteredTips}
            tourName="East Africa Travel Guide"
            className="tips__download"
          />
        </div>
      </div>

      {/* --- MODAL --- */}
      {modalTip && (
        <div
          className={`modal-overlay ${modalVisible ? "open" : ""}`}
          onClick={closeModal}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
              <div className="modal-icon-box">
                {getCategoryIcon(modalTip.category)}
              </div>
              <div>
                <div
                  style={{
                    color: "var(--c-primary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {modalTip.category}
                </div>
                <h2 className="modal-title">{modalTip.title}</h2>
              </div>
            </div>

            <div className="modal-body">
              <p className="modal-text">{modalTip.content}</p>

              {modalTip.tips && modalTip.tips.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      marginBottom: "16px",
                      color: "var(--c-text-main)",
                    }}
                  >
                    Key Takeaways
                  </h4>
                  <div className="checklist-grid">
                    {modalTip.tips.map((item, i) => (
                      <div key={i} className="check-item">
                        <FiCheckCircle className="check-icon" size={20} />
                        <span style={{ fontSize: "0.95rem", color: "#334155" }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalTip.source && (
                <div
                  style={{
                    marginTop: "40px",
                    paddingTop: "20px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <a
                    href="#"
                    style={{
                      color: "var(--c-primary)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                    }}
                  >
                    <FiExternalLink size={16} />
                    Source Reference
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: TIP CARD ---
const TipCard = ({ tip, layout, onOpen, getIcon }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <article ref={ref} className={`tip-card ${isInView ? "in-view" : ""}`}>
      <div
        className="tip-card__media"
        style={{
          backgroundImage: `url(${getBackgroundForCategory(tip.category)})`,
        }}
      />

      <div className="tip-card__content">
        <div className="tip-card__badge">
          {getIcon(tip.category)}
          {tip.category}
        </div>
        <h3 className="tip-card__title">{tip.title}</h3>
        <p className="tip-card__summary">{tip.summary}</p>
      </div>

      <div className="tip-card__footer">
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "#94a3b8",
          }}
        >
          <FiClock size={14} />
          <span>{tip.lastUpdated || "Updated recently"}</span>
        </div>
        <button
          className="btn-read-more"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(tip);
          }}
        >
          Read Guide <FiArrowRight size={16} />
        </button>
      </div>
    </article>
  );
};

export default Tips;
