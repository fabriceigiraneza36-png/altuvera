import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br
                    from-emerald-50 to-green-50 border border-emerald-100
                    p-6 sm:p-10 lg:p-14 text-center shadow-xl shadow-emerald-100/60">
      <Confetti/>
      <div className="relative z-10 max-w-lg mx-auto">
        <motion.div initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}}
          transition={{type:"spring",stiffness:240,damping:18,delay:.1}}
          className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-5 rounded-full
                     bg-gradient-to-br from-emerald-400 to-green-600
                     flex items-center justify-center shadow-2xl shadow-emerald-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
            className="w-10 h-10 lg:w-12 lg:h-12" aria-hidden="true">
            <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
              initial={{pathLength:0}} animate={{pathLength:1}}
              transition={{delay:.35,duration:.55}}/>
          </svg>
        </motion.div>

        <motion.h2 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.22}}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          {displayName ? `You're set, ${displayName}!` : "Booking submitted!"}
        </motion.h2>

        <motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.3}}
          className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed mb-6">
          Our team will reach out within <strong className="text-gray-700">24 hours</strong> to
          craft your perfect itinerary — at no cost.
        </motion.p>

        {bookingRef && (
          <motion.div initial={{opacity:0,scale:.94}} animate={{opacity:1,scale:1}} transition={{delay:.38}}
            className="inline-flex items-center gap-2 bg-white border border-emerald-200
                       rounded-2xl px-5 py-3 mb-5 shadow-sm">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Booking Ref</p>
              <p className="text-sm font-extrabold text-emerald-700 tracking-wide font-mono">{bookingRef}</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.44}}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-left flex gap-3 items-start">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-blue-800 mb-0.5">Verify your email</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              We sent a confirmation link to <strong>{email||"your inbox"}</strong>.
              Click it to confirm. Check spam if you don't see it.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.52}}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d]
                       text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75.75 0 00.921.916l5.474-1.503A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.127-1.415l-.369-.218-3.822 1.049 1.016-3.711-.237-.381A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Chat on WhatsApp
          </a>
          <button type="button" onClick={onReset}
            className="inline-flex items-center justify-center gap-2 bg-white border-2
                       border-gray-200 hover:border-emerald-300 hover:text-emerald-700
                       text-gray-600 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5">
            New Booking
          </button>
        </motion.div>
      </div>
    </div>
  );
}