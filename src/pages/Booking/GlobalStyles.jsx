// src/pages/Booking/GlobalStyles.jsx
import React from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* ── Reset & Base ── */
  .bk-section *, .bk-section *::before, .bk-section *::after {
    box-sizing: border-box;
  }
  .bk-section {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* ══════════════════════════════════════════════════════════
     KEYFRAMES
  ══════════════════════════════════════════════════════════ */
  @keyframes bk-fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes bk-spin {
    to { transform:rotate(360deg); }
  }
  @keyframes bk-pulse-ring {
    0%   { transform:scale(1);    opacity:0.55; }
    100% { transform:scale(1.5);  opacity:0;    }
  }
  @keyframes bk-float {
    0%,100% { transform:translateY(0)    rotate(0deg);   opacity:0.35; }
    50%     { transform:translateY(-22px) rotate(180deg); opacity:0.65; }
  }
  @keyframes bk-shimmer {
    0%   { background-position:200% 0;  }
    100% { background-position:-200% 0; }
  }
  @keyframes bk-confetti-fall {
    0%   { transform:translateY(-20px) rotate(0deg);    opacity:1; }
    100% { transform:translateY(110vh)  rotate(720deg);  opacity:0; }
  }
  @keyframes bk-bounce {
    0%,100% { transform:translateY(0);   }
    50%     { transform:translateY(-8px); }
  }
  @keyframes bk-scale-in {
    from { opacity:0; transform:scale(0.9);  }
    to   { opacity:1; transform:scale(1);    }
  }
  @keyframes bk-slide-right {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0);     }
  }
  @keyframes bk-otp-in {
    from { opacity:0; transform:translateY(10px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes bk-shake {
    0%,100% { transform:translateX(0);   }
    20%     { transform:translateX(-7px); }
    40%     { transform:translateX(7px);  }
    60%     { transform:translateX(-5px); }
    80%     { transform:translateX(5px);  }
  }
  @keyframes bk-tick {
    from { stroke-dashoffset:40; }
    to   { stroke-dashoffset:0;  }
  }
  @keyframes bk-countdown {
    from { stroke-dashoffset:0; }
    to   { stroke-dashoffset:126; }
  }

  /* ══════════════════════════════════════════════════════════
     GLASS CARD
  ══════════════════════════════════════════════════════════ */
  .bk-glass {
    background:rgba(255,255,255,0.97);
    border:1.5px solid rgba(5,150,105,0.12);
    border-radius:28px;
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    overflow:hidden;
  }
  .bk-glass--glow {
    box-shadow:
      0 0 0 1px rgba(16,185,129,0.07),
      0 32px 80px rgba(2,44,34,0.11),
      0 8px 24px rgba(5,150,105,0.07);
  }

  /* ══════════════════════════════════════════════════════════
     PROGRESS STEPPER
  ══════════════════════════════════════════════════════════ */
  .bk-stepper {
    display:flex;align-items:center;gap:0;
    background:rgba(255,255,255,0.96);
    border-radius:20px;padding:16px 22px;margin-bottom:22px;
    border:1.5px solid rgba(5,150,105,0.1);
    box-shadow:0 4px 18px rgba(0,0,0,0.05);
    overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
  }
  .bk-stepper::-webkit-scrollbar { display:none; }

  .bk-step {
    display:flex;align-items:center;gap:10px;flex-shrink:0;
    cursor:pointer;padding:8px 10px;border-radius:14px;
    transition:background 0.2s ease;border:none;background:none;
    font-family:inherit;
  }
  .bk-step:hover { background:rgba(16,185,129,0.06); }

  .bk-step__bubble {
    width:36px;height:36px;border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;
    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    border:2px solid transparent;
  }
  .bk-step__bubble--done {
    background:linear-gradient(135deg,#10b981,#059669);
    color:#fff;
    box-shadow:0 3px 10px rgba(16,185,129,0.28);
  }
  .bk-step__bubble--active {
    background:linear-gradient(135deg,#059669,#047857);
    color:#fff;
    box-shadow:0 4px 14px rgba(5,150,105,0.38);
    transform:scale(1.1);
  }
  .bk-step__bubble--pending {
    background:#f3f4f6;color:#9ca3af;border-color:#e5e7eb;
  }
  .bk-step__label {
    display:flex;flex-direction:column;align-items:flex-start;gap:1px;
  }
  .bk-step__name {
    font-size:13px;font-weight:700;line-height:1.2;
  }
  .bk-step__name--active  { color:#059669; }
  .bk-step__name--done    { color:#065f46; }
  .bk-step__name--pending { color:#9ca3af; }
  .bk-step__desc { font-size:11px;color:#9ca3af;font-weight:500; }

  .bk-step-line {
    flex:1;min-width:18px;height:2px;border-radius:999px;
    margin:0 3px;transition:background 0.4s ease;
  }
  .bk-step-line--done    { background:linear-gradient(90deg,#10b981,#059669); }
  .bk-step-line--pending { background:#e5e7eb; }

  /* ══════════════════════════════════════════════════════════
     FORM FIELDS
  ══════════════════════════════════════════════════════════ */
  .bk-label {
    display:block;font-size:13px;font-weight:700;
    color:#374151;margin-bottom:7px;letter-spacing:0.01em;
  }
  .bk-label span { color:#ef4444;margin-left:2px; }

  .bk-input, .bk-select, .bk-textarea {
    width:100%;padding:13px 16px;
    border:1.5px solid #e5e7eb;border-radius:14px;
    font-size:14.5px;font-family:inherit;
    color:#111827;background:#fff;
    transition:border-color 0.2s ease, box-shadow 0.2s ease;
    outline:none;-webkit-appearance:none;appearance:none;
  }
  .bk-input:hover   { border-color:#d1d5db; }
  .bk-input:focus,
  .bk-select:focus,
  .bk-textarea:focus {
    border-color:#10b981;
    box-shadow:0 0 0 4px rgba(16,185,129,0.1);
  }
  .bk-input--error,
  .bk-select--error,
  .bk-textarea--error {
    border-color:#ef4444 !important;
    box-shadow:0 0 0 3px rgba(239,68,68,0.09) !important;
  }
  .bk-input--verified {
    border-color:#10b981 !important;
    box-shadow:0 0 0 3px rgba(16,185,129,0.1) !important;
    background:#fafffe !important;
  }

  .bk-field-error {
    display:flex;align-items:center;gap:5px;
    color:#ef4444;font-size:12px;font-weight:500;margin-top:5px;
  }
  .bk-field-success {
    display:flex;align-items:center;gap:5px;
    color:#059669;font-size:12px;font-weight:600;margin-top:5px;
  }

  .bk-textarea { resize:vertical;min-height:100px;line-height:1.6; }

  .bk-select {
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 12px center;
    padding-right:38px;cursor:pointer;
  }

  /* Input with icon prefix */
  .bk-input-wrap {
    position:relative;display:flex;align-items:center;
  }
  .bk-input-wrap .bk-input {
    padding-left:44px;
  }
  .bk-input-icon {
    position:absolute;left:14px;color:#9ca3af;
    pointer-events:none;flex-shrink:0;z-index:1;
  }
  .bk-input-suffix {
    position:absolute;right:12px;
    display:flex;align-items:center;
  }

  /* ══════════════════════════════════════════════════════════
     OTP / EMAIL VERIFICATION
  ══════════════════════════════════════════════════════════ */
  .bk-otp-section {
    animation:bk-otp-in 0.4s cubic-bezier(0.16,1,0.3,1);
    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
    border:1.5px solid #6ee7b7;
    border-radius:20px;
    padding:24px;
    margin-top:16px;
  }
  .bk-otp-header {
    display:flex;align-items:center;gap:12px;margin-bottom:18px;
  }
  .bk-otp-icon {
    width:44px;height:44px;border-radius:13px;
    background:linear-gradient(135deg,#059669,#047857);
    display:flex;align-items:center;justify-content:center;
    color:#fff;flex-shrink:0;
    box-shadow:0 4px 12px rgba(5,150,105,0.28);
  }
  .bk-otp-title { font-size:15px;font-weight:700;color:#065f46;margin:0 0 2px; }
  .bk-otp-sub   { font-size:13px;color:#6b7280;margin:0; }

  /* 6-digit boxes */
  .bk-otp-boxes {
    display:flex;gap:8px;justify-content:flex-start;
    margin:16px 0;flex-wrap:wrap;
  }
  .bk-otp-box {
    width:52px;height:60px;
    border:2px solid #d1fae5;border-radius:14px;
    background:#fff;
    text-align:center;font-size:26px;font-weight:800;
    color:#047857;font-family:'Inter',monospace;
    outline:none;
    transition:border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
    caret-color:#059669;
  }
  .bk-otp-box:focus {
    border-color:#059669;
    box-shadow:0 0 0 4px rgba(16,185,129,0.15);
    transform:scale(1.06);
  }
  .bk-otp-box--filled {
    border-color:#10b981;
    background:linear-gradient(135deg,#f0fdf4,#ecfdf5);
  }
  .bk-otp-box--error {
    border-color:#ef4444 !important;
    animation:bk-shake 0.4s ease;
  }

  /* Timer ring */
  .bk-otp-timer {
    display:flex;align-items:center;gap:10px;margin-top:4px;
    flex-wrap:wrap;
  }
  .bk-otp-timer-ring {
    width:28px;height:28px;flex-shrink:0;
  }
  .bk-otp-timer-text {
    font-size:13px;font-weight:600;color:#6b7280;
  }
  .bk-otp-timer-text--urgent { color:#ef4444; }

  /* Send code button */
  .bk-send-code-btn {
    display:inline-flex;align-items:center;gap:7px;
    padding:11px 20px;border-radius:12px;border:none;
    background:linear-gradient(135deg,#10b981,#059669);
    color:#fff;font-weight:700;font-size:13.5px;
    font-family:inherit;cursor:pointer;white-space:nowrap;
    transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow:0 3px 10px rgba(16,185,129,0.25);
    flex-shrink:0;
  }
  .bk-send-code-btn:hover:not(:disabled) {
    transform:translateY(-2px) scale(1.03);
    box-shadow:0 7px 20px rgba(16,185,129,0.36);
  }
  .bk-send-code-btn:disabled {
    opacity:0.55;cursor:not-allowed;transform:none;
  }

  /* Verified badge */
  .bk-verified-badge {
    display:inline-flex;align-items:center;gap:7px;
    padding:8px 16px;border-radius:999px;
    background:linear-gradient(135deg,#dcfce7,#bbf7d0);
    border:1.5px solid #6ee7b7;
    color:#065f46;font-size:13px;font-weight:700;
    animation:bk-scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ══════════════════════════════════════════════════════════
     OPTION CARDS
  ══════════════════════════════════════════════════════════ */
  .bk-opt-grid {
    display:grid;gap:10px;
  }
  .bk-opt-grid--2 { grid-template-columns:repeat(2,1fr); }
  .bk-opt-grid--3 { grid-template-columns:repeat(3,1fr); }
  .bk-opt-grid--4 { grid-template-columns:repeat(4,1fr); }

  .bk-opt-card {
    border:2px solid #e5e7eb;border-radius:16px;
    padding:14px 12px;cursor:pointer;text-align:center;
    transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    background:#fff;
    display:flex;flex-direction:column;align-items:center;gap:7px;
    user-select:none;position:relative;overflow:hidden;
  }
  .bk-opt-card::before {
    content:"";position:absolute;inset:0;
    background:linear-gradient(135deg,#f0fdf4,#ecfdf5);
    opacity:0;transition:opacity 0.2s ease;
  }
  .bk-opt-card:hover {
    border-color:#10b981;transform:translateY(-2px);
    box-shadow:0 6px 18px rgba(16,185,129,0.13);
  }
  .bk-opt-card:hover::before { opacity:1; }
  .bk-opt-card--active {
    border-color:#059669 !important;
    background:linear-gradient(135deg,#f0fdf4,#dcfce7) !important;
    box-shadow:0 4px 16px rgba(5,150,105,0.18) !important;
    transform:translateY(-2px) !important;
  }
  .bk-opt-card--active::before { opacity:0 !important; }
  .bk-opt-card__icon {
    position:relative;z-index:1;
    display:flex;align-items:center;justify-content:center;
    color:#059669;
  }
  .bk-opt-card__icon-wrap {
    width:44px;height:44px;border-radius:13px;
    background:#f0fdf4;
    display:flex;align-items:center;justify-content:center;
    color:#059669;
    transition:all 0.2s ease;
  }
  .bk-opt-card--active .bk-opt-card__icon-wrap {
    background:linear-gradient(135deg,#059669,#10b981);
    color:#fff;
  }
  .bk-opt-card__label {
    position:relative;z-index:1;
    font-size:12.5px;font-weight:700;color:#374151;
  }
  .bk-opt-card__desc {
    position:relative;z-index:1;
    font-size:11px;color:#9ca3af;
  }

  /* ══════════════════════════════════════════════════════════
     INTEREST CHIPS
  ══════════════════════════════════════════════════════════ */
  .bk-interests { display:flex;flex-wrap:wrap;gap:9px; }
  .bk-interest {
    display:inline-flex;align-items:center;gap:7px;
    padding:8px 16px;border-radius:999px;
    border:1.5px solid #e5e7eb;background:#fff;
    cursor:pointer;font-size:13px;font-weight:600;color:#374151;
    transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);user-select:none;
  }
  .bk-interest:hover {
    border-color:#10b981;background:#f0fdf4;color:#059669;transform:scale(1.04);
  }
  .bk-interest--active {
    border-color:#059669 !important;
    background:linear-gradient(135deg,#059669,#10b981) !important;
    color:#fff !important;
    box-shadow:0 3px 10px rgba(5,150,105,0.3) !important;
  }

  /* ══════════════════════════════════════════════════════════
     COUNTER
  ══════════════════════════════════════════════════════════ */
  .bk-counter {
    display:flex;align-items:center;
    border:1.5px solid #e5e7eb;border-radius:14px;
    overflow:hidden;width:fit-content;background:#fff;
  }
  .bk-counter__btn {
    width:42px;height:42px;border:none;background:#f9fafb;
    cursor:pointer;font-size:20px;font-weight:700;color:#374151;
    display:flex;align-items:center;justify-content:center;
    transition:background 0.15s ease, color 0.15s ease;user-select:none;flex-shrink:0;
  }
  .bk-counter__btn:hover:not(:disabled) { background:#10b981;color:#fff; }
  .bk-counter__btn:disabled { opacity:0.35;cursor:not-allowed; }
  .bk-counter__val {
    min-width:50px;text-align:center;
    font-size:17px;font-weight:700;color:#111827;
    border-left:1.5px solid #e5e7eb;border-right:1.5px solid #e5e7eb;
    padding:0 8px;line-height:42px;
  }

  /* ══════════════════════════════════════════════════════════
     CHECKBOX
  ══════════════════════════════════════════════════════════ */
  .bk-check-row {
    display:flex;align-items:flex-start;gap:12px;
    cursor:pointer;user-select:none;
  }
  .bk-check {
    width:20px;height:20px;border-radius:6px;
    border:2px solid #d1d5db;background:#fff;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    transition:all 0.2s ease;margin-top:1px;cursor:pointer;
  }
  .bk-check--on {
    background:linear-gradient(135deg,#10b981,#059669);
    border-color:#059669;box-shadow:0 2px 8px rgba(16,185,129,0.28);
  }
  .bk-check__mark { color:#fff;font-size:12px;line-height:1; }
  .bk-check-label { font-size:13.5px;color:#374151;line-height:1.5; }

  /* ══════════════════════════════════════════════════════════
     SUMMARY CARD
  ══════════════════════════════════════════════════════════ */
  .bk-summary {
    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
    border:1.5px solid #a7f3d0;border-radius:20px;padding:22px 26px;
  }
  .bk-summary__row {
    display:flex;justify-content:space-between;align-items:flex-start;
    gap:12px;padding:10px 0;
    border-bottom:1px solid rgba(16,185,129,0.12);
  }
  .bk-summary__row:last-child { border-bottom:none; }
  .bk-summary__key { font-size:13px;font-weight:600;color:#6b7280; }
  .bk-summary__val { font-size:14px;font-weight:700;color:#064e3b;text-align:right; }

  /* ══════════════════════════════════════════════════════════
     BUTTONS
  ══════════════════════════════════════════════════════════ */
  .bk-btn {
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    padding:14px 28px;border-radius:50px;border:none;
    font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;
    transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
    letter-spacing:0.01em;user-select:none;white-space:nowrap;
  }
  .bk-btn--primary {
    background:linear-gradient(135deg,#10b981,#059669);color:#fff;
    box-shadow:0 4px 18px rgba(16,185,129,0.32),
               inset 0 1px 0 rgba(255,255,255,0.15);
    border:1.5px solid rgba(5,150,105,0.3);
  }
  .bk-btn--primary:hover:not(:disabled) {
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 8px 28px rgba(16,185,129,0.42),
               inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .bk-btn--primary:active { transform:scale(0.98); }
  .bk-btn--secondary {
    background:rgba(255,255,255,0.96);color:#374151;
    border:1.5px solid #e5e7eb;
    box-shadow:0 2px 8px rgba(0,0,0,0.06);
  }
  .bk-btn--secondary:hover:not(:disabled) {
    border-color:#10b981;color:#059669;
    background:#f0fdf4;transform:translateY(-1px);
  }
  .bk-btn--ghost {
    background:transparent;color:#6b7280;border:1.5px solid transparent;
  }
  .bk-btn--ghost:hover { color:#374151;background:#f3f4f6; }
  .bk-btn--full { width:100%; }
  .bk-btn--sm   { padding:10px 20px;font-size:13.5px; }
  .bk-btn--lg   { padding:16px 36px;font-size:16px; }
  .bk-btn:disabled { opacity:0.55;cursor:not-allowed;transform:none !important; }
  .bk-btn__spinner {
    width:18px;height:18px;
    border:2.5px solid rgba(255,255,255,0.3);
    border-top-color:#fff;border-radius:50%;
    animation:bk-spin 0.7s linear infinite;flex-shrink:0;
  }

  /* ══════════════════════════════════════════════════════════
     DESTINATION SEARCH
  ══════════════════════════════════════════════════════════ */
  .bk-dest-search { position:relative; }
  .bk-dest-dropdown {
    position:absolute;top:calc(100% + 6px);left:0;right:0;
    background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;
    box-shadow:0 16px 40px rgba(0,0,0,0.12);
    max-height:280px;overflow-y:auto;z-index:100;
    animation:bk-scale-in 0.18s ease;
    scrollbar-width:thin;scrollbar-color:#d1fae5 transparent;
  }
  .bk-dest-option {
    display:flex;align-items:center;gap:12px;padding:12px 16px;
    cursor:pointer;transition:background 0.15s ease;
    border-bottom:1px solid #f3f4f6;
  }
  .bk-dest-option:last-child { border-bottom:none; }
  .bk-dest-option:hover      { background:#f0fdf4; }
  .bk-dest-option--active    { background:#dcfce7; }
  .bk-dest-thumb {
    width:44px;height:44px;border-radius:10px;
    object-fit:cover;flex-shrink:0;background:#e5e7eb;
  }

  /* ══════════════════════════════════════════════════════════
     STEP CONTENT
  ══════════════════════════════════════════════════════════ */
  .bk-step-content { animation:bk-fadeUp 0.35s cubic-bezier(0.16,1,0.3,1); }

  .bk-step-header {
    margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid #f3f4f6;
  }
  .bk-step-header__icon-wrap {
    width:52px;height:52px;border-radius:16px;
    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
    border:1.5px solid #d1fae5;
    display:flex;align-items:center;justify-content:center;
    color:#059669;margin-bottom:14px;
  }
  .bk-step-header__title {
    font-family:'Playfair Display',Georgia,serif;
    font-size:clamp(22px,3vw,30px);font-weight:800;
    color:#0f172a;margin:0 0 6px;letter-spacing:-0.02em;
  }
  .bk-step-header__sub {
    font-size:14.5px;color:#6b7280;margin:0;line-height:1.65;
  }

  /* ══════════════════════════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════════════════════════ */
  .bk-nav {
    display:flex;align-items:center;justify-content:space-between;
    gap:12px;margin-top:34px;padding-top:22px;
    border-top:1px solid #f3f4f6;flex-wrap:wrap;
  }

  /* ══════════════════════════════════════════════════════════
     MISC
  ══════════════════════════════════════════════════════════ */
  .bk-sep {
    height:1px;
    background:linear-gradient(90deg,transparent,#d1fae5,transparent);
    margin:26px 0;
  }
  .bk-info-box {
    display:flex;gap:12px;padding:14px 18px;
    border-radius:14px;border:1px solid;
    font-size:13.5px;line-height:1.55;
    align-items:flex-start;
  }
  .bk-info-box--green { background:#f0fdf4;border-color:#a7f3d0;color:#065f46; }
  .bk-info-box--amber { background:#fffbeb;border-color:#fde68a;color:#92400e; }
  .bk-info-box--blue  { background:#eff6ff;border-color:#bfdbfe;color:#1e40af; }
  .bk-info-box--red   { background:#fef2f2;border-color:#fecaca;color:#991b1b; }

  .bk-trust-row {
    display:flex;align-items:center;justify-content:center;
    gap:20px;flex-wrap:wrap;margin-top:14px;
  }
  .bk-trust-item {
    display:flex;align-items:center;gap:6px;
    font-size:12px;color:#9ca3af;font-weight:600;
  }

  /* WhatsApp Banner */
  .bk-wa-banner {
    display:flex;align-items:center;gap:14px;
    padding:14px 22px;
    background:linear-gradient(135deg,#dcfce7,#f0fdf4);
    border:1.5px solid #a7f3d0;border-radius:18px;
    margin-bottom:20px;flex-wrap:wrap;
  }

  /* ══════════════════════════════════════════════════════════
     FLOATING PARTICLES
  ══════════════════════════════════════════════════════════ */
  .bk-particle {
    position:absolute;border-radius:50%;pointer-events:none;
    animation:bk-float linear infinite;
  }

  /* ══════════════════════════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════════════════════════ */
  @media (max-width:640px) {
    .bk-opt-grid--4 { grid-template-columns:repeat(2,1fr); }
    .bk-opt-grid--3 { grid-template-columns:repeat(2,1fr); }
    .bk-opt-grid--2 { grid-template-columns:1fr; }
    .bk-stepper     { padding:12px 14px; }
    .bk-step__desc  { display:none; }
    .bk-nav         { flex-direction:column-reverse; }
    .bk-nav .bk-btn { width:100%; }
    .bk-otp-box     { width:42px;height:52px;font-size:22px; }
    .bk-otp-boxes   { gap:6px; }
  }
  @media (max-width:380px) {
    .bk-otp-box { width:36px;height:48px;font-size:20px; }
    .bk-otp-boxes { gap:5px; }
  }
  @media (prefers-reduced-motion:reduce) {
    *,*::before,*::after {
      animation-duration:0.01ms !important;
      transition-duration:0.01ms !important;
    }
  }
`;

const GlobalStyles = () => (
  <style
    id="booking-global-css"
    dangerouslySetInnerHTML={{ __html: css }}
  />
);

export default GlobalStyles;