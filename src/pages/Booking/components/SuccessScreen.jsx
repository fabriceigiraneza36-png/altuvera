import React, { useEffect, useRef } from "react";
import { HiCheckCircle, HiMail, HiChatAlt2, HiPlus, HiHome } from "react-icons/hi";

const WA = "250785751391";

function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = (c.width = c.offsetWidth), H = (c.height = c.offsetHeight);
    const COLS = ["#10b981","#34d399","#6ee7b7","#a7f3d0","#059669","#047857"];
    const P = Array.from({ length: 80 }, () => ({
      x: Math.random()*W, y: Math.random()*H-H, r: Math.random()*5+3,
      d: Math.random()*60+20, col: COLS[Math.floor(Math.random()*6)],
      ta: Math.random()*.1+.04, tai: 0,
    }));
    let a=0, raf;
    const draw = () => {
      ctx.clearRect(0,0,W,H); a+=.008;
      P.forEach((p,i) => {
        p.tai+=p.ta; p.y+=(Math.cos(a+p.d)+1+p.r/2)*1.3; p.x+=Math.sin(a)*1.1;
        if(p.y>H+12) P[i]={...p,x:Math.random()*W,y:-10};
        ctx.fillStyle=p.col; ctx.beginPath();
        ctx.ellipse(p.x+Math.sin(p.tai)*8,p.y,p.r,p.r*.4,p.tai,0,Math.PI*2);
        ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const t=setTimeout(()=>cancelAnimationFrame(raf),5500);
    return()=>{cancelAnimationFrame(raf);clearTimeout(t)};
  },[]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true"/>;
}

export default function SuccessScreen({ displayName, bookingRef, email, onReset }) {
  return (
    <div className="relative overflow-hidden">
      <Confetti />
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

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6
                        text-left flex gap-3 items-start max-w-md mx-auto">
          <HiMail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800 mb-0.5">Verify your email</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              We sent a confirmation link to <strong>{email || "your inbox"}</strong>.
              Click it to confirm. Check spam if you don't see it.
            </p>
          </div>
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