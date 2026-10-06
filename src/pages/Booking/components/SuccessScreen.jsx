import React, { useEffect, useRef } from "react";
import { HiCheckCircle, HiChatAlt2, HiPlus, HiOutlineMail, HiOutlineClock, HiOutlineShieldCheck } from "react-icons/hi";

const WA = "250785751391";

function CelebrationParticles({ category = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    let raf;
    let running = true;

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
    const wildlife = /wildlife|safari|game|gorilla|nature/.test(type);

    const rect = () => ({ w: parent.clientWidth, h: parent.clientHeight });
    const particles = Array.from({ length: 180 }, (_, i) => ({
      kind: i < 95 ? "confetti" : i < 125 && water ? "bubble" : i < 145 && mountain ? "snow" : i < 160 ? "spark" : "mist",
      x: Math.random() * Math.max(1, parent.clientWidth),
      y: -20 - Math.random() * 260,
      vx: (Math.random() - .5) * 2.8,
      vy: 1.2 + Math.random() * 3.6,
      size: 2 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .18,
      life: .65 + Math.random() * .35,
      hue: i % 5,
    }));

    const confetti = ["#10b981","#34d399","#6ee7b7","#a7f3d0","#f59e0b","#ffffff"];
    const draw = (p, w, h) => {
      p.rot += p.spin;
      p.x += p.vx + Math.sin(p.y * .012) * .45;
      p.y += p.vy;
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.kind === "bubble") {
        ctx.strokeStyle = "rgba(125,211,252,.72)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, p.size + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.fillRect(-p.size * .35, -p.size * .45, 1.5, 1.5);
      } else if (p.kind === "snow") {
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.beginPath(); ctx.arc(0,0,p.size*.8,0,Math.PI*2); ctx.fill();
      } else if (p.kind === "spark") {
        ctx.fillStyle = confetti[(p.hue + 2) % confetti.length];
        ctx.fillRect(-p.size, -p.size * .25, p.size * 2, p.size * .5);
      } else if (p.kind === "mist") {
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath(); ctx.arc(0,0,p.size*2.4,0,Math.PI*2); ctx.fill();
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

      // Sunrise rays behind the celebration.
      const gradient = ctx.createRadialGradient(w*.5, h*.08, 5, w*.5, h*.08, Math.max(w,h)*.85);
      gradient.addColorStop(0, "rgba(255,214,102,.28)");
      gradient.addColorStop(.35, "rgba(255,237,180,.12)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,w,h);

      ctx.globalAlpha = .12;
      ctx.strokeStyle = "#fde68a";
      for (let i=0;i<9;i++) {
        ctx.beginPath();
        ctx.moveTo(w*.5, h*.04);
        ctx.lineTo(w*(i/8), h*.72);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      particles.forEach(p => draw(p,w,h));
      raf = requestAnimationFrame(animate);
    };
    animate();

    const stop = setTimeout(() => { running = false; cancelAnimationFrame(raf); }, 8500);
    return () => {
      running = false;
      clearTimeout(stop);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [category]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true" />;
}

function Confetti({ category }) {
  return <CelebrationParticles category={category} />;
}

export default function SuccessScreen({ displayName, bookingRef, email, category, onReset }) {
  return (
    <div className="relative overflow-hidden bg-white">
      <Confetti category={category} />
      <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
              <HiCheckCircle className="h-12 w-12 text-white" />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
              Booking request received
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {displayName ? `You're set, ${displayName}!` : "Your adventure request is in."}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
              Thank you for choosing Altuvera. Your request is safely with our travel team, and we’ll help shape the next steps into a memorable East African journey.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-left">
              <HiOutlineMail className="mb-2 h-5 w-5 text-emerald-600" />
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Check your inbox</p>
              <p className="mt-1 text-xs leading-5 text-gray-700">Confirm that you personally made this booking request.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-left shadow-sm">
              <HiOutlineClock className="mb-2 h-5 w-5 text-emerald-600" />
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Next step</p>
              <p className="mt-1 text-xs leading-5 text-gray-700">Our travel team will respond within 24 hours.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-left shadow-sm">
              <HiOutlineShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Secure request</p>
              <p className="mt-1 text-xs leading-5 text-gray-700">Planning begins after your email confirmation.</p>
            </div>
          </div>

          {bookingRef && (
            <div className="mx-auto mt-5 flex max-w-xl flex-col items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:px-5">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">Booking reference</p>
                <p className="mt-1 break-all font-mono text-sm font-extrabold tracking-wide text-emerald-700">{bookingRef}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-gray-500 shadow-sm">Keep this reference</span>
            </div>
          )}

          {email && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Confirmation sent to <span className="font-semibold text-gray-700 break-all">{email}</span>
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5 hover:bg-[#1ebe5d] sm:max-w-xs">
              <HiChatAlt2 className="h-5 w-5" /> WhatsApp Us
            </a>
            <button type="button" onClick={onReset}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 sm:max-w-xs">
              <HiPlus className="h-4 w-4" /> Start another booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}