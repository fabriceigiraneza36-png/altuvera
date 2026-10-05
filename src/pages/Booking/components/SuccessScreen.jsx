import React, { useEffect, useRef } from "react";
import { HiCheckCircle, HiChatAlt2, HiPlus } from "react-icons/hi";

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
    <div className="relative overflow-hidden">
      <Confetti category={category} />
      <div className="relative z-10 p-6 sm:p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
                        bg-gradient-to-br from-emerald-400 to-emerald-600
                        shadow-2xl shadow-emerald-200 mb-6">
          <HiCheckCircle className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          {displayName ? `You're set, ${displayName}!` : "Booking submitted!"}
        </h2>

        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
          Our expert team will reach out within{" "}
          <strong className="text-gray-700">24 hours</strong> to craft your perfect itinerary — at no cost.
        </p>

        {bookingRef && (
          <div className="inline-flex items-center gap-2.5 bg-emerald-50 border border-emerald-200
                          rounded-2xl px-5 py-3 mb-5 shadow-sm">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Booking Ref</p>
              <p className="text-sm font-extrabold text-emerald-700 tracking-wide font-mono">{bookingRef}</p>
            </div>
          </div>
        )}

        <div className="relative z-10 max-w-md mx-auto mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-left">
          <p className="text-sm font-bold text-emerald-800 mb-1">Your request is safely with our team.</p>
          <p className="text-xs text-emerald-700 leading-relaxed">
            No email confirmation step is required. Keep your booking reference for follow-up.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2
                       bg-[#25D366] hover:bg-[#1ebe5d] text-white
                       font-bold text-sm px-6 py-3.5 rounded-xl
                       shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5">
            <HiChatAlt2 className="w-5 h-5" /> WhatsApp Us
          </a>
          <button type="button" onClick={onReset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200
                       hover:border-emerald-300 hover:text-emerald-700 text-gray-600 font-bold text-sm
                       px-6 py-3.5 rounded-xl transition-all">
            <HiPlus className="w-4 h-4" /> New Booking
          </button>
        </div>
      </div>
    </div>
  );
}