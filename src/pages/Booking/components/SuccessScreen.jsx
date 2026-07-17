import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const WA_NUMBER = "250785751391";

/* ── Canvas confetti ── */
function Confetti() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    const COLORS = [
      "#10b981","#34d399","#6ee7b7","#a7f3d0",
      "#059669","#047857","#d1fae5","#065f46",
    ];
    const pieces = Array.from({ length: 90 }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H - H,
      r:    Math.random() * 5 + 3,
      d:    Math.random() * 60 + 20,
      col:  COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10 - 10,
      ta:   Math.random() * 0.1 + 0.05,
      tai:  0,
    }));

    let angle = 0, raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      angle += 0.009;
      pieces.forEach((p, i) => {
        p.tai += p.ta;
        p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) * 1.4;
        p.x += Math.sin(angle) * 1.2;
        p.tilt = Math.sin(p.tai) * 11;
        if (p.y > H + 12) {
          pieces[i] = { ...p, x: Math.random() * W, y: -10 };
        }
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(p.x + p.tilt, p.y, p.r, p.r * 0.45, p.tilt, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cancelAnimationFrame(raf), 5500);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  return (
    <canvas ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true" />
  );
}

export default function SuccessScreen({ displayName, bookingRef, email, onReset }) {
  return (
    <div className="relative overflow-hidden rounded-3xl
                    bg-gradient-to-br from-emerald-50 to-green-50
                    border border-emerald-100 p-8 sm:p-12 text-center
                    shadow-xl shadow-emerald-100/60">
      <Confetti />

      <div className="relative z-10 max-w-lg mx-auto">

        {/* Animated check circle */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full
                     bg-gradient-to-br from-emerald-400 to-green-600
                     flex items-center justify-center
                     shadow-2xl shadow-emerald-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="3" className="w-11 h-11" aria-hidden="true">
            <motion.path
              strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.55 }}
            />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900
                     tracking-tight mb-3"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          {displayName ? `You're set, ${displayName}!` : "Adventure booked!"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 text-base leading-relaxed mb-6"
        >
          Your dream safari request has been received. Our expert team will
          personally reach out within{" "}
          <strong className="text-gray-700">24 hours</strong> to start
          crafting your perfect itinerary — at no cost.
        </motion.p>

        {/* Booking ref */}
        {bookingRef && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.38 }}
            className="inline-flex items-center gap-2.5 bg-white border
                       border-emerald-200 rounded-2xl px-5 py-3 mb-6
                       shadow-sm mx-auto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-4 h-4 text-emerald-500"
              aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest font-bold
                             text-gray-400">
                Booking Reference
              </p>
              <p className="text-sm font-extrabold text-emerald-700 tracking-wide">
                {bookingRef}
              </p>
            </div>
          </motion.div>
        )}

        {/* Email verification notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl
                     p-4 mb-7 text-left flex gap-3 items-start"
          role="status"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
            aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8
                 M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0
                 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-blue-800 mb-0.5">
              One more step — verify your email
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              We sent a confirmation link to{" "}
              <strong>{email || "your inbox"}</strong>.
              Click it to confirm your booking.
              Check spam if you don't see it within a few minutes.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2
                       bg-[#25D366] hover:bg-[#1ebe5d] text-white
                       font-bold text-sm px-6 py-3.5 rounded-2xl
                       shadow-lg shadow-green-100 transition-all
                       hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor"
              className="w-5 h-5" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967
                -.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164
                -.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
                -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13
                -.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497
                .099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
                -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01
                -.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 
                0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 
                4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871
                .118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289
                .173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 
                5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75
                .75 0 00.921.916l5.474-1.503A11.95 11.95 0 0012 24c6.627 
                0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.127
                -1.415l-.369-.218-3.822 1.049 1.016-3.711-.237-.381A9.95 
                9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 
                10-10 10z"/>
            </svg>
            Chat on WhatsApp
          </a>

          <button
            type="button" onClick={onReset}
            className="inline-flex items-center justify-center gap-2
                       bg-white border-2 border-gray-200
                       hover:border-emerald-300 hover:text-emerald-700
                       text-gray-600 font-bold text-sm
                       px-6 py-3.5 rounded-2xl transition-all
                       hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 4v16m8-8H4"/>
            </svg>
            New Booking
          </button>
        </motion.div>

        <p className="mt-6 text-xs text-gray-400">
          Our team responds within 24 hours · No payment required at this stage
        </p>
      </div>
    </div>
  );
}