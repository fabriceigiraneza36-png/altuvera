// src/pages/NotFound.jsx — Premium Green/White Redesign
import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome, FiSearch, FiMapPin, FiArrowRight, FiCompass,
  FiBookOpen, FiMail, FiPackage, FiMap,
} from "react-icons/fi";
import SEO from "../components/common/SEO";

/* ── Styles ── */
const NF_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

  .nf-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    background: #f0fdf4;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 5vw, 60px);
    position: relative;
    overflow: hidden;
  }

  /* ── Background pattern ── */
  .nf-bg-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23059669' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* ── Blobs ── */
  .nf-blob {
    position: absolute; border-radius: 50%; pointer-events: none;
  }
  .nf-blob-1 {
    width: clamp(200px,32vw,440px); height: clamp(200px,32vw,440px);
    top: -100px; right: -100px;
    background: radial-gradient(circle, rgba(52,211,153,0.16) 0%, transparent 70%);
  }
  .nf-blob-2 {
    width: clamp(160px,24vw,320px); height: clamp(160px,24vw,320px);
    bottom: -70px; left: -70px;
    background: radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%);
  }
  .nf-blob-3 {
    width: 200px; height: 200px;
    top: 40%; left: 8%;
    background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
  }

  /* ── Card ── */
  .nf-card {
    position: relative; z-index: 1;
    max-width: 700px; width: 100%;
    text-align: center;
  }

  /* ── 404 Number ── */
  .nf-404-wrap {
    position: relative;
    display: inline-block;
    margin-bottom: 6px;
  }
  .nf-404 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(110px, 20vw, 200px);
    font-weight: 900;
    background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin: 0;
    letter-spacing: -0.04em;
    filter: drop-shadow(0 4px 28px rgba(5,150,105,0.2));
  }
  .nf-404-compass {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    color: #059669;
    opacity: 0.05;
    pointer-events: none;
  }

  /* ── Status pill ── */
  .nf-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 20px;
    border-radius: 50px;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #a7f3d0;
    margin-bottom: 24px;
  }
  .nf-pill-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
  }
  .nf-pill-text {
    font-size: 12px; font-weight: 800; color: #047857;
    letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ── Heading ── */
  .nf-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(24px, 4.5vw, 42px);
    font-weight: 800; color: #064e3b;
    margin-bottom: 14px;
    line-height: 1.18; letter-spacing: -0.02em;
  }
  .nf-desc {
    font-size: clamp(14px, 2vw, 17px);
    color: #4b5563; line-height: 1.8;
    max-width: 520px; margin: 0 auto clamp(28px,5vw,44px);
  }

  /* ── CTA buttons ── */
  .nf-btns {
    display: flex; gap: 14px;
    justify-content: center; flex-wrap: wrap;
    margin-bottom: clamp(32px,5vw,52px);
  }
  .nf-btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 28px; border-radius: 50px;
    background: linear-gradient(135deg, #059669, #065f46);
    color: white; font-weight: 700; font-size: 15px;
    text-decoration: none; transition: all 0.28s ease;
    box-shadow: 0 8px 28px rgba(5,150,105,0.3);
    border: none; cursor: pointer; font-family: inherit;
  }
  .nf-btn-primary:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 16px 44px rgba(5,150,105,0.42);
    background: linear-gradient(135deg, #047857, #064e3b);
  }
  .nf-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 50px;
    background: white; color: #059669;
    font-weight: 700; font-size: 15px;
    text-decoration: none; transition: all 0.28s ease;
    border: 2px solid #a7f3d0;
    box-shadow: 0 4px 16px rgba(5,150,105,0.10);
  }
  .nf-btn-secondary:hover {
    background: #f0fdf4; border-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(5,150,105,0.16);
  }
  .nf-btn-arrow {
    transition: transform 0.28s ease;
  }
  .nf-btn-secondary:hover .nf-btn-arrow {
    transform: translateX(4px);
  }

  /* ── Suggestions panel ── */
  .nf-panel {
    background: white;
    border-radius: 26px;
    padding: clamp(22px,4vw,38px);
    box-shadow: 0 20px 60px rgba(5,150,105,0.10), 0 4px 16px rgba(0,0,0,0.04);
    border: 1px solid #d1fae5;
    text-align: left;
  }
  .nf-panel-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .nf-panel-icon-wrap {
    width: 38px; height: 38px; border-radius: 11px;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #a7f3d0;
    display: flex; align-items: center; justify-content: center;
    color: #059669; flex-shrink: 0;
  }
  .nf-panel-label {
    font-size: 13px; font-weight: 800; color: #064e3b;
    text-transform: uppercase; letter-spacing: 0.07em;
  }
  .nf-panel-sub {
    font-size: 11.5px; color: #9ca3af; margin-top: 2px;
  }
  .nf-suggestions {
    display: flex; flex-direction: column; gap: 10px;
  }

  /* ── Suggestion card ── */
  .nf-suggestion {
    display: flex; align-items: center; gap: 16px;
    padding: 14px 18px; border-radius: 16px;
    text-decoration: none;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    border: 1.5px solid #d1fae5;
    transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .nf-suggestion:hover {
    background: linear-gradient(135deg, #dcfce7, #d1fae5);
    border-color: #a7f3d0;
    transform: translateX(8px);
    box-shadow: 0 6px 22px rgba(5,150,105,0.14);
  }
  .nf-sug-icon {
    width: 46px; height: 46px; border-radius: 13px;
    background: #d1fae5;
    display: flex; align-items: center; justify-content: center;
    color: #059669; flex-shrink: 0;
    transition: all 0.28s ease;
    border: 1px solid #a7f3d0;
  }
  .nf-suggestion:hover .nf-sug-icon {
    background: linear-gradient(135deg, #059669, #065f46);
    color: white;
    border-color: #059669;
    box-shadow: 0 4px 14px rgba(5,150,105,0.32);
  }
  .nf-sug-text {
    font-size: 14px; font-weight: 700; color: #064e3b;
    line-height: 1.3; margin-bottom: 3px;
  }
  .nf-sug-sub {
    font-size: 12.5px; color: #9ca3af; line-height: 1.4;
  }
  .nf-sug-arrow {
    color: #a7f3d0; flex-shrink: 0; margin-left: auto;
    transition: all 0.28s ease;
  }
  .nf-suggestion:hover .nf-sug-arrow {
    color: #059669; transform: translateX(4px);
  }

  /* ── Footer note ── */
  .nf-footer {
    margin-top: 26px;
    font-size: 12.5px; color: #9ca3af; line-height: 1.6;
  }
  .nf-footer-link {
    color: #059669; font-weight: 600; text-decoration: none;
    transition: all 0.2s;
  }
  .nf-footer-link:hover { text-decoration: underline; }

  @keyframes nf-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  .nf-404-wrap { animation: nf-float 4s ease infinite; }

  @media (max-width: 480px) {
    .nf-btns { flex-direction: column; align-items: stretch; }
    .nf-btn-primary, .nf-btn-secondary { justify-content: center; }
    .nf-suggestion { padding: 12px 14px; }
    .nf-sug-icon { width: 38px; height: 38px; border-radius: 10px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .nf-404-wrap { animation: none !important; }
    *, *::before, *::after { transition-duration: 0.01ms !important; }
  }
`;

const SUGGESTIONS = [
  { icon: FiMapPin,    text: "Explore Destinations", sub: "Discover East Africa's finest locations",          path: "/destinations", },
  { icon: FiPackage,   text: "Browse Packages",       sub: "Find the perfect safari package for you",          path: "/packages",      },
  { icon: FiBookOpen,  text: "Read Travel Stories",   sub: "Inspiration from our community of explorers",      path: "/posts",         },
  { icon: FiMail,      text: "Contact Us",            sub: "Our team is happy to point you in the right direction", path: "/contact",  },
];

let _nfStylesInjected = false;
function injectNFStyles() {
  if (_nfStylesInjected || typeof document === "undefined") return;
  if (document.getElementById("nf-styles")) { _nfStylesInjected = true; return; }
  const s = document.createElement("style");
  s.id = "nf-styles";
  s.textContent = NF_STYLES;
  document.head.appendChild(s);
  _nfStylesInjected = true;
}

const NotFound = () => {
  useEffect(() => { injectNFStyles(); }, []);

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for cannot be found. Explore our destinations or return home."
        url="/404"
        keywords={["404", "page not found", "not found", "error"]}
      />

      <main className="nf-root" role="main">
        <div className="nf-bg-pattern" aria-hidden="true" />
        <div className="nf-blob nf-blob-1" aria-hidden="true" />
        <div className="nf-blob nf-blob-2" aria-hidden="true" />
        <div className="nf-blob nf-blob-3" aria-hidden="true" />

        <article className="nf-card">
          {/* 404 */}
          <div className="nf-404-wrap">
            <h1 className="nf-404" aria-label="Error 404">404</h1>
            <FiCompass size={110} className="nf-404-compass" aria-hidden="true" />
          </div>

          {/* Status pill */}
          <div className="nf-pill">
            <span className="nf-pill-dot" />
            <span className="nf-pill-text">Page Not Found</span>
          </div>

          {/* Heading */}
          <h2 className="nf-title">Lost in the Wilderness?</h2>

          <p className="nf-desc">
            Even the best explorers take a wrong turn sometimes. The page you're
            looking for seems to have wandered off into the savanna — but don't
            worry, we'll get you back on track.
          </p>

          {/* CTAs */}
          <nav aria-label="Primary navigation options" className="nf-btns">
            <Link to="/" className="nf-btn-primary">
              <FiHome size={17} /> Back to Home
            </Link>
            <Link to="/destinations" className="nf-btn-secondary">
              Explore Destinations
              <FiArrowRight size={16} className="nf-btn-arrow" />
            </Link>
          </nav>

          {/* Suggestions panel */}
          <section aria-labelledby="nf-suggestions-heading" className="nf-panel">
            <div className="nf-panel-header">
              <div className="nf-panel-icon-wrap">
                <FiCompass size={17} />
              </div>
              <div>
                <div className="nf-panel-label" id="nf-suggestions-heading">
                  Quick Navigation
                </div>
                <div className="nf-panel-sub">Popular destinations to get you back on track</div>
              </div>
            </div>

            <nav aria-label="Alternative navigation" className="nf-suggestions">
              {SUGGESTIONS.map((s, i) => {
                const Ic = s.icon;
                return (
                  <Link key={s.path} to={s.path} className="nf-suggestion">
                    <div className="nf-sug-icon">
                      <Ic size={19} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="nf-sug-text">{s.text}</div>
                      <div className="nf-sug-sub">{s.sub}</div>
                    </div>
                    <FiArrowRight size={17} className="nf-sug-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>
          </section>

          {/* Footer note */}
          <p className="nf-footer">
            If you believe this is a mistake, please{" "}
            <Link to="/contact" className="nf-footer-link">contact our team</Link>{" "}
            and we'll help you out.
          </p>
        </article>
      </main>
    </>
  );
};

export default NotFound;