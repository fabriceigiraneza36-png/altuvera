import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  HiCheckCircle,
  HiChatAlt2,
  HiPlus,
  HiOutlineMail,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineMap,
} from "react-icons/hi";

const WA = "250785751391";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SUCCESS_CSS = `
.bcm-overlay{font-family:var(--font-body,"Inter",system-ui,sans-serif);position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:clamp(10px,2.4vw,30px);background:rgba(5,24,17,.76);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);overscroll-behavior:contain;animation:bcmBackdropIn .24s ease both}
.bcm-dialog{font-family:var(--font-body,"Inter",system-ui,sans-serif);position:relative;display:flex;flex-direction:column;width:min(100%,850px);max-height:min(92dvh,900px);overflow:hidden;border:1px solid rgba(255,255,255,.72);border-radius:28px;background:#fff;box-shadow:0 34px 100px rgba(0,0,0,.32);outline:none;animation:bcmDialogIn .42s cubic-bezier(.2,.8,.2,1) both}
.bcm-hero{position:relative;isolation:isolate;flex:0 0 auto;overflow:hidden;padding:25px 32px 29px;color:#fff;background:radial-gradient(ellipse at 78% 4%,rgba(115,211,160,.24),transparent 37%),linear-gradient(125deg,#062e23 0%,#07533b 58%,#0a7250 100%)}
.bcm-hero:before,.bcm-hero:after{position:absolute;z-index:-1;content:"";pointer-events:none;border:1px solid rgba(255,255,255,.09);border-radius:50%}
.bcm-hero:before{width:360px;height:360px;right:-115px;top:-240px}
.bcm-hero:after{width:260px;height:260px;right:8%;bottom:-220px}
.bcm-confetti{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
.bcm-topline{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
.bcm-brand{display:inline-flex;align-items:center;gap:9px;font-size:10px;font-weight:900;letter-spacing:.2em;color:rgba(255,255,255,.78)}
.bcm-brand-mark{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(255,255,255,.22);border-radius:9px;background:rgba(255,255,255,.1);color:#d1fae5;font-size:12px}
.bcm-home-link{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;color:rgba(255,255,255,.86);background:rgba(255,255,255,.08);font-size:11px;font-weight:750;text-decoration:none;transition:background .2s,border-color .2s}
.bcm-home-link:hover{border-color:rgba(255,255,255,.42);background:rgba(255,255,255,.15);color:#fff}
.bcm-hero-main{display:flex;align-items:center;gap:19px;max-width:710px}
.bcm-check-wrap{position:relative;display:grid;place-items:center;flex:0 0 72px;width:72px;height:72px;border:1px solid rgba(209,250,229,.65);border-radius:22px;background:linear-gradient(145deg,#5ee0a4,#059669);box-shadow:0 12px 28px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.45);color:#fff}
.bcm-check-wrap:after{position:absolute;inset:-7px;content:"";border:1px solid rgba(167,243,208,.2);border-radius:27px}
.bcm-eyebrow{margin:0 0 7px;color:#a7f3d0;font-size:10px;font-weight:900;letter-spacing:.17em;text-transform:uppercase}
.bcm-title{margin:0;color:#fff;font-size:clamp(25px,3.6vw,36px);font-weight:850;letter-spacing:-.045em;line-height:1.08}
.bcm-lead{max-width:570px;margin:9px 0 0;color:rgba(240,253,244,.82);font-size:13px;line-height:1.65}
.bcm-received-pill{display:inline-flex;align-items:center;gap:7px;margin-top:13px;padding:6px 10px;border:1px solid rgba(167,243,208,.28);border-radius:999px;background:rgba(3,35,25,.26);color:#d1fae5;font-size:10px;font-weight:800;letter-spacing:.04em}
.bcm-live-dot{width:6px;height:6px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 0 4px rgba(110,231,183,.13)}
.bcm-body{min-height:0;overflow:auto;overscroll-behavior:contain;padding:25px 32px 27px;scrollbar-width:thin;scrollbar-color:#c7d8cd transparent}
.bcm-intro{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:17px}
.bcm-section-label{margin:0 0 5px;color:#138052;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
.bcm-section-title{margin:0;color:#142b20;font-size:17px;font-weight:850;letter-spacing:-.025em}
.bcm-intro-copy{margin:5px 0 0;color:#718078;font-size:12px;line-height:1.55}
.bcm-reference{display:flex;align-items:center;justify-content:space-between;gap:15px;min-width:0;padding:12px 15px;border:1px solid #dcefe3;border-radius:15px;background:linear-gradient(115deg,#f0fbf4,#fbfefc)}
.bcm-reference-label{display:block;margin-bottom:4px;color:#718078;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
.bcm-reference-value{display:block;overflow-wrap:anywhere;color:#086b43;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;font-weight:900;letter-spacing:.035em}
.bcm-reference-note{flex:0 0 auto;padding:6px 9px;border:1px solid #dbe9e0;border-radius:999px;background:#fff;color:#63776b;font-size:9px;font-weight:800}
.bcm-journey{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
.bcm-detail{display:flex;align-items:flex-start;gap:10px;min-width:0;padding:13px 12px;border:1px solid #e7eee9;border-radius:14px;background:#fff}
.bcm-detail-icon{display:grid;place-items:center;flex:0 0 31px;width:31px;height:31px;border-radius:10px;background:#eaf8ef;color:#087c4b}
.bcm-detail-copy{min-width:0}
.bcm-detail-label{display:block;margin:1px 0 4px;color:#829087;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
.bcm-detail-value{display:block;overflow-wrap:anywhere;color:#20382b;font-size:11px;font-weight:800;line-height:1.45}
.bcm-verify{display:flex;align-items:flex-start;gap:13px;margin-top:16px;padding:15px 16px;border:1px solid #f0dfb4;border-radius:16px;background:linear-gradient(110deg,#fff9e9,#fffdf7)}
.bcm-verify-icon{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border:1px solid #f2dfa9;border-radius:11px;background:#fff1c7;color:#96620b}
.bcm-verify-copy{min-width:0}
.bcm-verify-title{margin:1px 0 4px;color:#68460c;font-size:12px;font-weight:900}
.bcm-verify-text{margin:0;color:#765f35;font-size:11px;line-height:1.6}
.bcm-verify-email{display:block;margin-top:5px;overflow-wrap:anywhere;color:#624608;font-size:11px;font-weight:850}
.bcm-next{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:15px}
.bcm-next-item{display:flex;align-items:flex-start;gap:8px;min-width:0}
.bcm-next-icon{display:grid;place-items:center;flex:0 0 25px;width:25px;height:25px;border-radius:8px;background:#eff7f2;color:#168050}
.bcm-next-copy{min-width:0}
.bcm-next-copy strong{display:block;margin:1px 0 3px;color:#31483a;font-size:10px;font-weight:900}
.bcm-next-copy span{display:block;color:#7b8980;font-size:10px;line-height:1.5}
.bcm-footer{display:flex;flex:0 0 auto;align-items:center;justify-content:space-between;gap:14px;padding:16px 32px max(16px,env(safe-area-inset-bottom));border-top:1px solid #edf2ee;background:rgba(251,253,251,.97)}
.bcm-footer-note{color:#8a968f;font-size:10px;line-height:1.45}
.bcm-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}
.bcm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:43px;padding:0 15px;border:1px solid transparent;border-radius:12px;font-size:11px;font-weight:850;text-decoration:none;cursor:pointer;transition:transform .2s,box-shadow .2s,background .2s,border-color .2s}
.bcm-btn:hover{transform:translateY(-1px)}
.bcm-btn:focus-visible,.bcm-home-link:focus-visible{outline:3px solid rgba(16,185,129,.35);outline-offset:3px}
.bcm-btn-primary{background:linear-gradient(135deg,#078e59,#056b43);color:#fff;box-shadow:0 8px 17px rgba(5,118,75,.18)}
.bcm-btn-primary:hover{background:linear-gradient(135deg,#079b61,#075c3b);box-shadow:0 11px 22px rgba(5,118,75,.24)}
.bcm-btn-secondary{border-color:#dce8e0;background:#fff;color:#3d5948}
.bcm-btn-secondary:hover{border-color:#9ed6b4;background:#f4fbf6;color:#086b43}
.bcm-btn-tertiary{min-height:36px;padding:0 8px;background:transparent;color:#738278}
.bcm-btn-tertiary:hover{background:#f0f7f2;color:#087c4b}
@keyframes bcmBackdropIn{from{opacity:0}to{opacity:1}}
@keyframes bcmDialogIn{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:640px){
 .bcm-overlay{place-items:center;padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom))}
 .bcm-dialog{width:100%;max-height:calc(100dvh - max(16px,env(safe-area-inset-top)) - max(16px,env(safe-area-inset-bottom)));border-radius:22px}
 .bcm-hero{padding:18px 18px 20px}
 .bcm-topline{margin-bottom:16px}
 .bcm-brand{font-size:9px;letter-spacing:.15em}
 .bcm-brand-mark{width:25px;height:25px}
 .bcm-home-link{min-height:31px;padding:0 9px;font-size:10px}
 .bcm-hero-main{align-items:flex-start;gap:12px}
 .bcm-check-wrap{flex-basis:54px;width:54px;height:54px;border-radius:17px}
 .bcm-check-wrap svg{width:31px;height:31px}
 .bcm-check-wrap:after{inset:-5px;border-radius:21px}
 .bcm-eyebrow{font-size:9px}
 .bcm-title{font-size:clamp(23px,7vw,29px)}
 .bcm-lead{margin-top:7px;font-size:11px;line-height:1.55}
 .bcm-received-pill{margin-top:9px;padding:5px 8px;font-size:9px}
 .bcm-body{padding:18px 16px 20px}
 .bcm-intro{margin-bottom:12px}
 .bcm-section-title{font-size:15px}
 .bcm-intro-copy{font-size:11px}
 .bcm-reference{padding:11px 12px}
 .bcm-reference-value{font-size:12px}
 .bcm-reference-note{font-size:8px;padding:5px 7px}
 .bcm-journey{grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}
 .bcm-detail{padding:10px 9px;gap:8px}
 .bcm-detail-icon{flex-basis:28px;width:28px;height:28px}
 .bcm-detail-value{font-size:10px}
 .bcm-verify{margin-top:12px;padding:12px;gap:10px}
 .bcm-verify-text,.bcm-verify-email{font-size:10px}
 .bcm-next{grid-template-columns:1fr;gap:9px;margin-top:13px}
 .bcm-next-item{align-items:center}
 .bcm-footer{display:block;padding:12px 16px max(13px,env(safe-area-inset-bottom))}
 .bcm-footer-note{text-align:center;margin-bottom:10px;font-size:9px}
 .bcm-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .bcm-btn{min-height:42px;padding:0 9px;font-size:10px}
 .bcm-btn-tertiary{grid-column:1/-1;min-height:33px}
}
@media(max-width:380px){
 .bcm-journey{grid-template-columns:1fr}
 .bcm-reference{align-items:flex-start;flex-direction:column;gap:8px}
 .bcm-reference-note{align-self:flex-start}
 .bcm-title{font-size:23px}
 .bcm-footer{padding-left:12px;padding-right:12px}
}
@media(prefers-reduced-motion:reduce){
 .bcm-overlay,.bcm-dialog{animation:none!important}
 .bcm-btn,.bcm-home-link{transition:none!important}
}
`;

function CelebrationParticles({ category = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    let raf;
    let running = true;
    let stopTimer;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const type = String(category).toLowerCase();
    const water = /lake|river|water|beach|coast|marine|island/.test(type);
    const mountain = /mountain|trek|hike|highland/.test(type);
    const rect = () => ({ w: parent.clientWidth, h: parent.clientHeight });
    const particles = Array.from({ length: 118 }, (_, i) => ({
      kind: i < 64 ? "confetti" : i < 82 && water ? "bubble" : i < 98 && mountain ? "snow" : i < 108 ? "spark" : "mist",
      x: Math.random() * Math.max(1, parent.clientWidth),
      y: -20 - Math.random() * 220,
      vx: (Math.random() - .5) * 2.3,
      vy: .9 + Math.random() * 2.6,
      size: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .15,
      life: .62 + Math.random() * .38,
      hue: i % 5,
    }));

    const confetti = ["#10b981","#34d399","#6ee7b7","#a7f3d0","#f5c46a","#ffffff"];
    const draw = (p, w, h) => {
      p.rot += p.spin;
      p.x += p.vx + Math.sin(p.y * .012) * .4;
      p.y += p.vy;
      if (p.y > h + 20 && !p.burst) { p.y = -20; p.x = Math.random() * w; }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === "bubble") {
        ctx.strokeStyle = "rgba(125,211,252,.72)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, p.size + 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === "snow") {
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.beginPath(); ctx.arc(0,0,p.size*.8,0,Math.PI*2); ctx.fill();
      } else if (p.kind === "spark") {
        ctx.fillStyle = confetti[(p.hue + 2) % confetti.length];
        ctx.fillRect(-p.size, -p.size * .25, p.size * 2, p.size * .5);
      } else if (p.kind === "mist") {
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.arc(0,0,p.size*2.2,0,Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = confetti[p.hue % confetti.length];
        ctx.fillRect(-p.size*.8, -p.size*.35, p.size*1.6, p.size*.7);
      }
      ctx.restore();
    };

    const animate = () => {
      if (!running) return;
      const { w, h } = rect();
      ctx.clearRect(0, 0, w, h);
      const gradient = ctx.createRadialGradient(w*.5, h*.08, 5, w*.5, h*.08, Math.max(w,h)*.85);
      gradient.addColorStop(0, "rgba(255,214,102,.25)");
      gradient.addColorStop(.4, "rgba(255,237,180,.10)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,w,h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        draw(particle, w, h);
        if (particle.burst && ++particle.age > particle.ttl) particles.splice(i, 1);
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    const burstAt = (event) => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(animate);
      }
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => { running = false; cancelAnimationFrame(raf); }, 8500);
      const bounds = parent.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      for (let i = 0; i < 42; i++) {
        const angle = (Math.PI * 2 * i) / 42 + (Math.random() - .5) * .24;
        const speed = 2 + Math.random() * 4.5;
        particles.push({
          kind: "confetti", x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: 2.5 + Math.random() * 4.5,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - .5) * .28,
          life: .95, hue: i % confetti.length,
          burst: true, age: 0, ttl: 34 + Math.floor(Math.random() * 24),
        });
      }
    };
    parent.addEventListener("pointerdown", burstAt);
    stopTimer = setTimeout(() => { running = false; cancelAnimationFrame(raf); }, 8500);

    return () => {
      running = false;
      clearTimeout(stopTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("pointerdown", burstAt);
    };
  }, [category]);

  return <canvas ref={ref} className="bcm-confetti" aria-hidden="true" />;
}

export default function SuccessScreen({
  displayName,
  bookingRef,
  email,
  category,
  destination,
  country,
  arrivalDate,
  departureDate,
  travelers,
  onReset,
}) {
  const dialogRef = useRef(null);
  const formattedArrival = formatDate(arrivalDate);
  const formattedDeparture = formatDate(departureDate);
  const dateSummary = formattedArrival && formattedDeparture
    ? `${formattedArrival} – ${formattedDeparture}`
    : formattedArrival || (arrivalDate ? "Flexible travel dates" : "Dates to be arranged");
  const whatsappText = bookingRef
    ? `Hello Altuvera, I have submitted booking request ${bookingRef} and would like to discuss the next steps.`
    : "Hello Altuvera, I have submitted a booking request and would like to discuss the next steps.";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActive = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousActive && typeof previousActive.focus === "function") previousActive.focus();
    };
  }, []);

  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    const panel = dialogRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter((element) => element.getAttribute("aria-hidden") !== "true");
    if (!focusable.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="bcm-overlay">
      <style>{SUCCESS_CSS}</style>
      <section
        ref={dialogRef}
        className="bcm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bcm-title"
        aria-describedby="bcm-description"
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        <header className="bcm-hero">
          <CelebrationParticles category={category} />
          <div className="bcm-topline">
            <div className="bcm-brand">
              <span className="bcm-brand-mark">A</span>
              <span>ALTUVERA · EAST AFRICA</span>
            </div>
            <Link to="/" className="bcm-home-link">
              Back to website <HiOutlineArrowRight size={14} />
            </Link>
          </div>

          <div className="bcm-hero-main">
            <div className="bcm-check-wrap" aria-hidden="true">
              <HiCheckCircle size={43} />
            </div>
            <div>
              <p className="bcm-eyebrow">Request successfully received</p>
              <h1 id="bcm-title" className="bcm-title">
                {displayName ? `Thank you, ${displayName}.` : "Your journey starts here."}
              </h1>
              <p id="bcm-description" className="bcm-lead">
                Your booking request is safely with the Altuvera travel team. We’re ready to help shape your next East African adventure.
              </p>
              <span className="bcm-received-pill">
                <span className="bcm-live-dot" /> Booking request received
              </span>
            </div>
          </div>
        </header>

        <div className="bcm-body">
          <div className="bcm-intro">
            <div>
              <p className="bcm-section-label">Your request summary</p>
              <h2 className="bcm-section-title">A few details to keep close</h2>
              <p className="bcm-intro-copy">Keep your reference handy when speaking with our travel team.</p>
            </div>
          </div>

          {bookingRef && (
            <div className="bcm-reference">
              <div>
                <span className="bcm-reference-label">Your booking reference</span>
                <strong className="bcm-reference-value">{bookingRef}</strong>
              </div>
              <span className="bcm-reference-note">Save for your records</span>
            </div>
          )}

          {(destination || country || dateSummary || travelers) && (
            <div className="bcm-journey">
              {destination && (
                <div className="bcm-detail">
                  <span className="bcm-detail-icon"><HiOutlineMap size={16}/></span>
                  <span className="bcm-detail-copy">
                    <span className="bcm-detail-label">Destination</span>
                    <strong className="bcm-detail-value">{destination}{country ? `, ${country}` : ""}</strong>
                  </span>
                </div>
              )}
              {(arrivalDate || dateSummary) && (
                <div className="bcm-detail">
                  <span className="bcm-detail-icon"><HiOutlineCalendar size={16}/></span>
                  <span className="bcm-detail-copy">
                    <span className="bcm-detail-label">Travel dates</span>
                    <strong className="bcm-detail-value">{dateSummary}</strong>
                  </span>
                </div>
              )}
              {travelers ? (
                <div className="bcm-detail">
                  <span className="bcm-detail-icon"><HiOutlineUsers size={16}/></span>
                  <span className="bcm-detail-copy">
                    <span className="bcm-detail-label">Travellers</span>
                    <strong className="bcm-detail-value">{travelers} {travelers === 1 ? "traveller" : "travellers"}</strong>
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <section className="bcm-verify" aria-label="Email verification required">
            <span className="bcm-verify-icon"><HiOutlineMail size={19}/></span>
            <div className="bcm-verify-copy">
              <h3 className="bcm-verify-title">One important next step: verify your email</h3>
              <p className="bcm-verify-text">
                Check your inbox and spam folder for Altuvera’s secure verification email. Open the message and confirm that you made this request. Our team can begin planning after your email is verified.
              </p>
              {email && <strong className="bcm-verify-email">{email}</strong>}
            </div>
          </section>

          <div className="bcm-next" aria-label="What happens next">
            <div className="bcm-next-item">
              <span className="bcm-next-icon"><HiOutlineShieldCheck size={14}/></span>
              <span className="bcm-next-copy"><strong>Secure verification</strong><span>Confirm your request from your own inbox.</span></span>
            </div>
            <div className="bcm-next-item">
              <span className="bcm-next-icon"><HiOutlineClock size={14}/></span>
              <span className="bcm-next-copy"><strong>Personal follow-up</strong><span>Our team will review your details and get in touch.</span></span>
            </div>
            <div className="bcm-next-item">
              <span className="bcm-next-icon"><HiOutlineMap size={14}/></span>
              <span className="bcm-next-copy"><strong>Trip planning</strong><span>We’ll work with you on the best next steps.</span></span>
            </div>
          </div>
        </div>

        <footer className="bcm-footer">
          <p className="bcm-footer-note">Need help? Our travel team is just a message away.</p>
          <div className="bcm-actions">
            <a
              className="bcm-btn bcm-btn-primary"
              href={`https://wa.me/${WA}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <HiChatAlt2 size={17}/> WhatsApp our team
            </a>
            <Link to="/destinations" className="bcm-btn bcm-btn-secondary">
              Explore destinations <HiOutlineArrowRight size={14}/>
            </Link>
            <button type="button" className="bcm-btn bcm-btn-tertiary" onClick={onReset}>
              <HiPlus size={14}/> Start another request
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
