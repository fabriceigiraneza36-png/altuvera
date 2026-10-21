import React from "react";

const styles = `
.altuvera-loading { min-height: 100svh; min-height: 100dvh; width: 100%; display: flex; align-items: center; justify-content: center; padding: 32px 20px; background: radial-gradient(ellipse at 50% 38%, #f0fdf4 0%, #f8fafc 48%, #ffffff 100%); color: #052e16; font-family: 'Plus Jakarta Sans', Inter, system-ui, sans-serif; text-align: center; }
.altuvera-loading__content { width: min(100%, 420px); display: flex; align-items: center; flex-direction: column; }
.altuvera-loading__logo-wrap { width: 104px; height: 104px; display: grid; place-items: center; margin-bottom: 27px; border-radius: 30px; background: rgba(255,255,255,.92); border: 1px solid rgba(22,101,52,.10); box-shadow: 0 18px 48px rgba(5,46,22,.10), 0 0 0 9px rgba(16,185,129,.045); animation: altuveraLogoBounce 1.35s cubic-bezier(.36,.07,.19,.97) infinite; }
.altuvera-loading__logo { display: block; width: 76px; height: 76px; object-fit: contain; }
.altuvera-loading__eyebrow { margin: 0 0 9px; color: #15803d; font-size: 10px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
.altuvera-loading__title { margin: 0; font-family: 'DM Serif Display', Georgia, serif; color: #052e16; font-size: clamp(28px, 5vw, 38px); font-weight: 400; line-height: 1.15; letter-spacing: -.025em; }
.altuvera-loading__message { margin: 12px 0 25px; color: #64748b; font-size: 14px; line-height: 1.75; max-width: 340px; }
.altuvera-loading__track { width: 132px; height: 3px; overflow: hidden; border-radius: 999px; background: #d1fae5; }
.altuvera-loading__track::after { content: ''; display: block; width: 42%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#166534,#34d399); animation: altuveraLoadingSweep 1.35s ease-in-out infinite; }
@keyframes altuveraLogoBounce { 0%,100% { transform: translateY(0) scale(1); } 45% { transform: translateY(-13px) scale(1.025); } 60% { transform: translateY(-7px) scale(.99); } }
@keyframes altuveraLoadingSweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(340%); } }
@media (prefers-reduced-motion: reduce) { .altuvera-loading__logo-wrap, .altuvera-loading__track::after { animation: none; } }
@media (max-width: 480px) { .altuvera-loading__logo-wrap { width: 88px; height: 88px; border-radius: 26px; margin-bottom: 23px; } .altuvera-loading__logo { width: 65px; height: 65px; } .altuvera-loading__message { font-size: 13px; } }
`;

export default function AltuveraLoader({ title = "Discovering your next journey", message = "We’re preparing the places, stories and experiences waiting for you." }) {
  return (
    <div className="altuvera-loading" role="status" aria-live="polite" aria-label={title}>
      <style>{styles}</style>
      <div className="altuvera-loading__content">
        <div className="altuvera-loading__logo-wrap">
          <img className="altuvera-loading__logo" src="/logo.png" alt="Altuvera Safaris" />
        </div>
        <p className="altuvera-loading__eyebrow">Altuvera Safaris</p>
        <h2 className="altuvera-loading__title">{title}</h2>
        <p className="altuvera-loading__message">{message}</p>
        <div className="altuvera-loading__track" aria-hidden="true" />
      </div>
    </div>
  );
}
