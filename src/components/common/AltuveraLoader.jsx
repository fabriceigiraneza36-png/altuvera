import React from "react";

const styles = `
.altuvera-loading {
  position: relative; isolation: isolate; min-height: 100svh; min-height: 100dvh; width: 100%;
  display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 28px 20px;
  background: radial-gradient(ellipse at 50% 36%, #f0fdf4 0%, #f8fafc 48%, #ffffff 100%);
  color: #052e16; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; text-align: center;
}
.altuvera-loading__bubble-layer {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  transform: translate3d(var(--bubble-parallax-x, 0px), var(--bubble-parallax-y, 0px), 0);
  transition: transform .18s cubic-bezier(.22, 1, .36, 1); will-change: transform;
}
.altuvera-loading__bubble {
  position: absolute; top: -12vh; display: block; border-radius: 50%; pointer-events: none;
  border: 1px solid rgba(16,185,129,.13);
  background: radial-gradient(circle at 32% 26%, rgba(255,255,255,.92), rgba(16,185,129,.09) 66%, rgba(16,185,129,.025));
  box-shadow: inset 0 0 9px rgba(255,255,255,.7), 0 0 20px rgba(16,185,129,.035);
  animation: altuveraBubbleFloat 14s ease-in-out infinite;
}
@keyframes altuveraBubbleFloat {
  0% { transform: translate3d(0,-5vh,0) scale(.86); opacity: 0; }
  12% { opacity: .28; }
  48% { transform: translate3d(var(--bubble-drift, 16px),45vh,0) scale(1.04); opacity: .2; }
  84% { opacity: .16; }
  100% { transform: translate3d(0,110dvh,0) scale(.94); opacity: 0; }
}
.altuvera-loading__content { position: relative; z-index: 1; width: min(100%, 600px); display: flex; align-items: center; flex-direction: column; }
.altuvera-loading__brand { width: min(100%, 550px); display: flex; align-items: center; justify-content: center; gap: 18px; margin: 0 auto 42px; text-align: left; }
.altuvera-loading__logo-wrap { display: grid; place-items: center; flex: 0 0 auto; width: clamp(62px, 14vw, 86px); height: clamp(62px, 14vw, 86px); margin: 0; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; animation: altuveraLogoFloat 3.8s ease-in-out infinite; }
.altuvera-loading__logo { display: block; width: 100%; height: 100%; object-fit: contain; }
.altuvera-loading__brand-copy { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; }
.altuvera-loading__wordmark { display: flex; align-items: center; gap: .045em; margin: 0 0 7px; color: #064e3b; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; font-size: clamp(21px, 4.2vw, 34px); font-weight: 800; line-height: 1; letter-spacing: .04em; white-space: nowrap; }
.altuvera-loading__letter { display: inline-block; opacity: 0; transform-origin: left center; animation: altuveraLetterReveal .68s cubic-bezier(.2,.8,.2,1) both; will-change: transform, opacity, filter; }
.altuvera-loading__tagline { margin: 0; max-width: 265px; color: #059669; font-size: 9px; font-weight: 800; letter-spacing: .1em; line-height: 1.55; text-transform: uppercase; }
.altuvera-loading__title { margin: 0; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; color: #052e16; font-size: clamp(17px, 2.8vw, 21px); font-weight: 800; line-height: 1.35; letter-spacing: -.025em; }
.altuvera-loading__message { margin: 9px 0 25px; color: #64748b; font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; font-size: 13px; line-height: 1.75; max-width: 360px; }
.altuvera-loading__track { width: 142px; height: 3px; overflow: hidden; border-radius: 999px; background: #d1fae5; }
.altuvera-loading__track::after { content: ""; display: block; width: 42%; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#166534,#34d399); animation: altuveraLoadingSweep 1.35s ease-in-out infinite; }
@keyframes altuveraLogoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes altuveraLetterReveal { 0% { opacity: 0; transform: translate3d(-17px,0,0) scale(.94); filter: blur(3px); } 65% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); } }
@keyframes altuveraLoadingSweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(340%); } }
@media (max-width: 480px) {
  .altuvera-loading { padding: 24px 16px; }
  .altuvera-loading__brand { gap: 11px; margin-bottom: 34px; }
  .altuvera-loading__logo-wrap { width: 58px; height: 58px; }
  .altuvera-loading__wordmark { font-size: 20px; letter-spacing: .035em; gap: .035em; }
  .altuvera-loading__tagline { font-size: 7px; letter-spacing: .055em; max-width: 178px; }
  .altuvera-loading__title { font-size: 17px; }
  .altuvera-loading__message { margin-bottom: 22px; font-size: 12px; max-width: 315px; }
}
@media (prefers-reduced-motion: reduce) {
  .altuvera-loading__bubble-layer, .altuvera-loading__bubble, .altuvera-loading__logo-wrap, .altuvera-loading__letter, .altuvera-loading__track::after {
    animation: none !important; transition: none !important; filter: none !important;
  }
  .altuvera-loading__letter { opacity: 1 !important; transform: none !important; }
}
`;

export default function AltuveraLoader({ title = "Discovering your next journey", message = "We’re preparing the places, stories and experiences waiting for you." }) {
  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    event.currentTarget.style.setProperty("--bubble-parallax-x", String(x * 20) + "px");
    event.currentTarget.style.setProperty("--bubble-parallax-y", String(y * 14) + "px");
  };
  const resetBubbleMotion = (event) => {
    event.currentTarget.style.setProperty("--bubble-parallax-x", "0px");
    event.currentTarget.style.setProperty("--bubble-parallax-y", "0px");
  };

  return (
    <div className="altuvera-loading" role="status" aria-live="polite" aria-label={title}
      onPointerMove={handlePointerMove} onPointerLeave={resetBubbleMotion}>
      <style>{styles}</style>
      <div className="altuvera-loading__bubble-layer" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} className="altuvera-loading__bubble" style={{
            left: String(5 + index * 12) + "%",
            width: String(14 + (index % 3) * 7) + "px",
            height: String(14 + (index % 3) * 7) + "px",
            animationDuration: String(13 + (index % 4) * 2.2) + "s",
            animationDelay: String(index * -1.7) + "s",
            "--bubble-drift": String((index % 3 - 1) * 22) + "px",
          }} />
        ))}
      </div>
      <div className="altuvera-loading__content">
        <div className="altuvera-loading__brand">
          <div className="altuvera-loading__logo-wrap">
            <img className="altuvera-loading__logo" src="/altuvera.png" alt="Altuvera Safaris logo" />
          </div>
          <div className="altuvera-loading__brand-copy">
            <p className="altuvera-loading__wordmark" aria-label="Altuvera">
              {"ALTUVERA".split("").map((letter, index) => (
                <span key={letter + "-" + index} aria-hidden="true" className="altuvera-loading__letter" style={{ animationDelay: (index * 68) + "ms" }}>{letter}</span>
              ))}
            </p>
            <p className="altuvera-loading__tagline">True adventure in high places &amp; deep culture</p>
          </div>
        </div>
        <h2 className="altuvera-loading__title">{title}</h2>
        <p className="altuvera-loading__message">{message}</p>
        <div className="altuvera-loading__track" aria-hidden="true" />
      </div>
    </div>
  );
}
