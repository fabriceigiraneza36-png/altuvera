// src/pages/Booking/GlobalStyles.jsx
import React from "react";

const css = `
  /* ── Reset & Base ── */
  .bk-section * { box-sizing: border-box; }

  /* ── Animations ── */
  @keyframes bk-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes bk-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes bk-pulse-ring {
    0%   { transform: scale(1);    opacity: 0.6; }
    100% { transform: scale(1.45); opacity: 0;   }
  }
  @keyframes bk-float {
    0%,100% { transform: translateY(0)   rotate(0deg);   opacity: 0.4; }
    50%      { transform: translateY(-22px) rotate(180deg); opacity: 0.7; }
  }
  @keyframes bk-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes bk-confetti-fall {
    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
  @keyframes bk-bounce {
    0%,100% { transform: translateY(0);   }
    50%      { transform: translateY(-8px); }
  }
  @keyframes bk-scale-in {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1);    }
  }
  @keyframes bk-slide-right {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0);     }
  }

  /* ── Glass Card ── */
  .bk-glass {
    background: rgba(255,255,255,0.96);
    border: 1.5px solid rgba(5,150,105,0.12);
    border-radius: 28px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
  }
  .bk-glass--glow {
    box-shadow:
      0 0 0 1px rgba(16,185,129,0.08),
      0 32px 80px rgba(2,44,34,0.12),
      0 8px 24px rgba(5,150,105,0.08);
  }

  /* ── Progress Stepper ── */
  .bk-stepper {
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 18px 24px;
    margin-bottom: 24px;
    border: 1.5px solid rgba(5,150,105,0.1);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .bk-stepper::-webkit-scrollbar { display: none; }
  .bk-step {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 12px;
    transition: background 0.2s ease;
    border: none;
    background: none;
    font-family: inherit;
  }
  .bk-step:hover { background: rgba(16,185,129,0.06); }
  .bk-step__bubble {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    border: 2px solid transparent;
  }
  .bk-step__bubble--done {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }
  .bk-step__bubble--active {
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff;
    box-shadow: 0 4px 16px rgba(5,150,105,0.4);
    transform: scale(1.1);
  }
  .bk-step__bubble--pending {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
  }
  .bk-step__label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
  }
  .bk-step__name {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }
  .bk-step__name--active { color: #059669; }
  .bk-step__name--done   { color: #065f46; }
  .bk-step__name--pending{ color: #9ca3af; }
  .bk-step__desc {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
  }
  .bk-step-line {
    flex: 1;
    min-width: 20px;
    height: 2px;
    border-radius: 999px;
    margin: 0 4px;
    transition: background 0.4s ease;
  }
  .bk-step-line--done    { background: linear-gradient(90deg, #10b981, #059669); }
  .bk-step-line--pending { background: #e5e7eb; }

  /* ── Form Fields ── */
  .bk-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 7px;
    letter-spacing: 0.01em;
  }
  .bk-label span { color: #ef4444; margin-left: 2px; }
  .bk-input, .bk-select, .bk-textarea {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    font-size: 14.5px;
    font-family: inherit;
    color: #111827;
    background: #fff;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }
  .bk-input:focus, .bk-select:focus, .bk-textarea:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16,185,129,0.1);
  }
  .bk-input--error, .bk-select--error, .bk-textarea--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
  }
  .bk-field-error {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #ef4444;
    font-size: 12px;
    font-weight: 500;
    margin-top: 5px;
  }
  .bk-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
  .bk-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }

  /* ── Option Cards ── */
  .bk-opt-grid {
    display: grid;
    gap: 10px;
  }
  .bk-opt-grid--2 { grid-template-columns: repeat(2, 1fr); }
  .bk-opt-grid--3 { grid-template-columns: repeat(3, 1fr); }
  .bk-opt-grid--4 { grid-template-columns: repeat(4, 1fr); }
  .bk-opt-card {
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 14px 12px;
    cursor: pointer;
    text-align: center;
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    user-select: none;
  }
  .bk-opt-card:hover {
    border-color: #10b981;
    background: #f0fdf4;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(16,185,129,0.12);
  }
  .bk-opt-card--active {
    border-color: #059669 !important;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7) !important;
    box-shadow: 0 4px 16px rgba(5,150,105,0.18) !important;
    transform: translateY(-2px) !important;
  }
  .bk-opt-card__icon { font-size: 22px; line-height: 1; }
  .bk-opt-card__label { font-size: 12.5px; font-weight: 700; color: #374151; }
  .bk-opt-card__desc  { font-size: 11px;   color: #9ca3af; }

  /* ── Interest Chips ── */
  .bk-interests { display: flex; flex-wrap: wrap; gap: 9px; }
  .bk-interest {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    user-select: none;
  }
  .bk-interest:hover {
    border-color: #10b981;
    background: #f0fdf4;
    color: #059669;
    transform: scale(1.04);
  }
  .bk-interest--active {
    border-color: #059669 !important;
    background: linear-gradient(135deg, #059669, #10b981) !important;
    color: #fff !important;
    box-shadow: 0 3px 10px rgba(5,150,105,0.3) !important;
  }

  /* ── Counter ── */
  .bk-counter {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1.5px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
    width: fit-content;
    background: #fff;
  }
  .bk-counter__btn {
    width: 42px;
    height: 42px;
    border: none;
    background: #f9fafb;
    cursor: pointer;
    font-size: 20px;
    font-weight: 700;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
    user-select: none;
    flex-shrink: 0;
  }
  .bk-counter__btn:hover:not(:disabled) {
    background: #10b981;
    color: #fff;
  }
  .bk-counter__btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .bk-counter__val {
    min-width: 50px;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
    color: #111827;
    border-left: 1.5px solid #e5e7eb;
    border-right: 1.5px solid #e5e7eb;
    padding: 0 8px;
    line-height: 42px;
  }

  /* ── Date Input ── */
  .bk-date-wrap { position: relative; }
  .bk-date-wrap input[type="date"] {
    cursor: pointer;
    color-scheme: light;
  }

  /* ── Checkbox ── */
  .bk-check-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    user-select: none;
  }
  .bk-check {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid #d1d5db;
    background: #fff;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    margin-top: 1px;
    cursor: pointer;
  }
  .bk-check--on {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: #059669;
    box-shadow: 0 2px 8px rgba(16,185,129,0.3);
  }
  .bk-check__mark { color: #fff; font-size: 12px; line-height: 1; }
  .bk-check-label { font-size: 13.5px; color: #374151; line-height: 1.5; }

  /* ── Summary Card ── */
  .bk-summary {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    border: 1.5px solid #a7f3d0;
    border-radius: 20px;
    padding: 24px 28px;
  }
  .bk-summary__row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(16,185,129,0.12);
  }
  .bk-summary__row:last-child { border-bottom: none; }
  .bk-summary__key { font-size: 13px; font-weight: 600; color: #6b7280; }
  .bk-summary__val { font-size: 14px; font-weight: 700; color: #064e3b; text-align: right; }

  /* ── Buttons ── */
  .bk-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 50px;
    border: none;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
    letter-spacing: 0.01em;
    user-select: none;
    white-space: nowrap;
  }
  .bk-btn--primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    box-shadow: 0 4px 18px rgba(16,185,129,0.32),
                inset 0 1px 0 rgba(255,255,255,0.15);
    border: 1.5px solid rgba(5,150,105,0.4);
  }
  .bk-btn--primary:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 28px rgba(16,185,129,0.42),
                inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .bk-btn--primary:active { transform: scale(0.98); }
  .bk-btn--secondary {
    background: rgba(255,255,255,0.95);
    color: #374151;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .bk-btn--secondary:hover:not(:disabled) {
    border-color: #10b981;
    color: #059669;
    background: #f0fdf4;
    transform: translateY(-1px);
  }
  .bk-btn--ghost {
    background: transparent;
    color: #6b7280;
    border: 1.5px solid transparent;
  }
  .bk-btn--ghost:hover { color: #374151; background: #f3f4f6; }
  .bk-btn--full { width: 100%; }
  .bk-btn--sm { padding: 10px 20px; font-size: 13.5px; }
  .bk-btn--lg { padding: 16px 36px; font-size: 16px; }
  .bk-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }
  .bk-btn__spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: bk-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* ── Floating Particles ── */
  .bk-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: bk-float linear infinite;
  }

  /* ── WhatsApp Banner ── */
  .bk-wa-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    background: linear-gradient(135deg, #dcfce7, #f0fdf4);
    border: 1.5px solid #a7f3d0;
    border-radius: 18px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  /* ── Destination Search ── */
  .bk-dest-search {
    position: relative;
  }
  .bk-dest-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
    max-height: 280px;
    overflow-y: auto;
    z-index: 100;
    animation: bk-scale-in 0.18s ease;
    scrollbar-width: thin;
    scrollbar-color: #d1fae5 transparent;
  }
  .bk-dest-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid #f3f4f6;
  }
  .bk-dest-option:last-child { border-bottom: none; }
  .bk-dest-option:hover { background: #f0fdf4; }
  .bk-dest-option--active { background: #dcfce7; }
  .bk-dest-thumb {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: #e5e7eb;
  }

  /* ── Step content ── */
  .bk-step-content {
    animation: bk-fadeUp 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  .bk-step-header {
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;
  }
  .bk-step-header__icon {
    font-size: 36px;
    margin-bottom: 10px;
    display: block;
  }
  .bk-step-header__title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
  }
  .bk-step-header__sub {
    font-size: 14.5px;
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
  }

  /* ── Navigation ── */
  .bk-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 36px;
    padding-top: 24px;
    border-top: 1px solid #f3f4f6;
    flex-wrap: wrap;
  }

  /* ── Section separator ── */
  .bk-sep {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d1fae5, transparent);
    margin: 28px 0;
  }

  /* ── Info box ── */
  .bk-info-box {
    display: flex;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 14px;
    border: 1px solid;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .bk-info-box--green {
    background: #f0fdf4;
    border-color: #a7f3d0;
    color: #065f46;
  }
  .bk-info-box--amber {
    background: #fffbeb;
    border-color: #fde68a;
    color: #92400e;
  }
  .bk-info-box--blue {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .bk-opt-grid--4 { grid-template-columns: repeat(2, 1fr); }
    .bk-opt-grid--3 { grid-template-columns: repeat(2, 1fr); }
    .bk-opt-grid--2 { grid-template-columns: 1fr; }
    .bk-stepper { padding: 12px 14px; gap: 0; }
    .bk-step__desc { display: none; }
    .bk-nav { flex-direction: column-reverse; }
    .bk-nav .bk-btn { width: 100%; }
  }
  @media (max-width: 420px) {
    .bk-opt-grid--4, .bk-opt-grid--3 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

const GlobalStyles = () => (
  <style
    id="booking-global-css"
    dangerouslySetInnerHTML={{ __html: css }}
  />
);

export default GlobalStyles;