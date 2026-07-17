import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const WA_NUMBER  = "250785751391";
const WA_URL     = `https://wa.me/${WA_NUMBER}`;
const SITE_URL   = import.meta.env.VITE_SITE_URL || "https://www.altuverasafaris.com";
const API_URL    = import.meta.env.VITE_API_URL  || "http://localhost:5000/api";

/* ── Tiny canvas confetti (success only) ──────────────────────── */
function Confetti({ active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;

    const W = (canvas.width  = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    const ctx = canvas.getContext("2d");

    const COLORS = [
      "#10b981","#34d399","#6ee7b7","#a7f3d0",
      "#059669","#047857","#d1fae5","#22c55e",
    ];

    const pieces = Array.from({ length: 100 }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H - H,
      r:   Math.random() * 6 + 3,
      d:   Math.random() * 60 + 20,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
      tai: 0,
      ta:  Math.random() * 0.12 + 0.04,
    }));

    let angle = 0;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      angle += 0.008;
      pieces.forEach((p, i) => {
        p.tai += p.ta;
        p.y   += (Math.cos(angle + p.d) + 1 + p.r / 2) * 1.3;
        p.x   += Math.sin(angle) * 1.1;
        if (p.y > H + 12) {
          pieces[i] = { ...p, x: Math.random() * W, y: -10 };
        }
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(
          p.x + Math.sin(p.tai) * 8,
          p.y,
          p.r,
          p.r * 0.4,
          p.tai,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    draw();
    const t = setTimeout(() => cancelAnimationFrame(raf), 6000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ── Animated check circle ────────────────────────────────────── */
function CheckCircle({ color = "emerald" }) {
  const colors = {
    emerald: "from-emerald-400 to-green-600",
    amber:   "from-amber-400  to-orange-500",
    red:     "from-red-400    to-rose-600",
    blue:    "from-blue-400   to-indigo-600",
  };
  const icons = {
    emerald: "M5 13l4 4L19 7",
    amber:   "M12 8v4m0 4h.01",
    red:     "M6 18L18 6M6 6l12 12",
    blue:    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
      className={`
        w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center
        bg-gradient-to-br ${colors[color]}
        shadow-2xl shadow-${color}-200
      `}
    >
      <svg
        viewBox="0 0 24 24" fill="none" stroke="white"
        strokeWidth="2.5" className="w-12 h-12"
        aria-hidden="true"
      >
        <motion.path
          strokeLinecap="round" strokeLinejoin="round"
          d={color === "emerald" ? "M5 13l4 4L19 7" :
             color === "red"     ? "M6 18L18 6M6 6l12 12" :
             "M12 9v3m0 3h.01"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.55 }}
        />
      </svg>
    </motion.div>
  );
}

/* ── Status step indicator ────────────────────────────────────── */
function StepDots({ total = 4, current = 0 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`
            rounded-full transition-all duration-300
            ${i < current
              ? "w-2.5 h-2.5 bg-emerald-500"
              : i === current
                ? "w-3.5 h-3.5 bg-emerald-500 ring-4 ring-emerald-100"
                : "w-2.5 h-2.5 bg-gray-200"}
          `}
        />
      ))}
    </div>
  );
}

/* ── Resend button ────────────────────────────────────────────── */
function ResendButton({ bookingId, email }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [msg,   setMsg]   = useState("");

  const handleResend = useCallback(async () => {
    if (!bookingId) {
      setMsg("Please contact us on WhatsApp to resend your link.");
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res  = await fetch(`${API_URL}/bookings/${bookingId}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to resend");
      setState("done");
      setMsg("A new verification link has been sent to your email.");
    } catch (err) {
      setState("error");
      setMsg(err.message || "Something went wrong. Please try WhatsApp.");
    }
  }, [bookingId]);

  if (state === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-emerald-700
                   bg-emerald-50 border border-emerald-200 rounded-2xl
                   px-4 py-3 text-sm font-semibold"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="w-4 h-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        {msg}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={state === "loading"}
        className="w-full py-3.5 rounded-2xl font-bold text-sm
                   border-2 border-emerald-200 text-emerald-700
                   hover:bg-emerald-50 hover:border-emerald-300
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center
                   justify-center gap-2"
      >
        {state === "loading" ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              aria-hidden="true">
              <path strokeLinecap="round"
                d="M12 2a10 10 0 0110 10" opacity="0.25"/>
              <path strokeLinecap="round" d="M12 2a10 10 0 0110 10"/>
            </svg>
            Sending new link…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0
                   0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357
                   -2m15.357 2H15"/>
            </svg>
            Resend Verification Link
          </>
        )}
      </button>
      {state === "error" && msg && (
        <p className="text-xs text-red-500 font-medium text-center">{msg}</p>
      )}
    </div>
  );
}

/* ── Countdown redirect timer ─────────────────────────────────── */
function CountdownRedirect({ to, seconds = 10 }) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      window.location.href = to;
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, to]);

  const pct = Math.round(((seconds - count) / seconds) * 100);

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">
          Redirecting to home…
        </span>
        <span className="text-xs font-bold text-emerald-600 tabular-nums">
          {count}s
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STATUS CONFIGURATIONS
════════════════════════════════════════════════════════════════ */
const STATUS_CONFIG = {
  success: {
    iconColor:  "emerald",
    accentFrom: "from-emerald-400",
    accentTo:   "to-green-500",
    bgClass:    "from-emerald-50 to-green-50",
    borderClass:"border-emerald-100",
    badgeBg:    "bg-emerald-100",
    badgeText:  "text-emerald-700",
    badgeLabel: "Email Verified",
    title:      (ref) => ref ? `Booking ${ref} Confirmed!` : "Email Verified!",
    subtitle:   "You're all set",
    showConfetti: true,
    showRedirect: true,
    showResend:   false,
    message: (ref) =>
      `Your email has been verified and your booking request is now with our
       expert travel team${ref ? ` (Ref: ${ref})` : ""}.
       We will personally reach out within 24 hours to start crafting
       your perfect itinerary. Get ready — Africa awaits!`,
    nextSteps: [
      "Check your inbox for a booking received confirmation email",
      "Our safari coordinator will contact you within 24 hours",
      "We'll design a personalised itinerary for your group at no cost",
      "Once you're happy, we officially confirm your adventure!",
    ],
  },

  already_verified: {
    iconColor:  "blue",
    accentFrom: "from-blue-400",
    accentTo:   "to-indigo-500",
    bgClass:    "from-blue-50 to-indigo-50",
    borderClass:"border-blue-100",
    badgeBg:    "bg-blue-100",
    badgeText:  "text-blue-700",
    badgeLabel: "Already Verified",
    title:      () => "Already Verified!",
    subtitle:   "You're good to go",
    showConfetti: false,
    showRedirect: true,
    showResend:   false,
    message: () =>
      `This booking has already been verified — no further action needed!
       Our travel team has your request and will be in touch within 24 hours
       if they haven't reached out already.`,
    nextSteps: [
      "Your booking request is already with our team",
      "Expect a call or WhatsApp message within 24 hours",
      "We'll craft a personalised itinerary tailored to your group",
    ],
  },

  expired: {
    iconColor:  "amber",
    accentFrom: "from-amber-400",
    accentTo:   "to-orange-500",
    bgClass:    "from-amber-50 to-orange-50",
    borderClass:"border-amber-100",
    badgeBg:    "bg-amber-100",
    badgeText:  "text-amber-700",
    badgeLabel: "Link Expired",
    title:      () => "Verification Link Expired",
    subtitle:   "Don't worry — this is easy to fix",
    showConfetti: false,
    showRedirect: false,
    showResend:   true,
    message: () =>
      `For security, email verification links expire after 24 hours.
       Your booking request is still saved — you just need a fresh link.
       Click below to resend, or contact us directly on WhatsApp and we'll
       sort it out in seconds.`,
    nextSteps: null,
  },

  invalid: {
    iconColor:  "red",
    accentFrom: "from-red-400",
    accentTo:   "to-rose-500",
    bgClass:    "from-red-50 to-rose-50",
    borderClass:"border-red-100",
    badgeBg:    "bg-red-100",
    badgeText:  "text-red-700",
    badgeLabel: "Invalid Link",
    title:      () => "Invalid Verification Link",
    subtitle:   "Something doesn't look right",
    showConfetti: false,
    showRedirect: false,
    showResend:   true,
    message: () =>
      `This verification link appears to be invalid or broken.
       This can happen if the link was copied incorrectly or has already
       been used. Please request a new link below, or reach out to us
       directly and we'll resolve it immediately.`,
    nextSteps: null,
  },

  error: {
    iconColor:  "red",
    accentFrom: "from-red-400",
    accentTo:   "to-rose-500",
    bgClass:    "from-red-50 to-rose-50",
    borderClass:"border-red-100",
    badgeBg:    "bg-red-100",
    badgeText:  "text-red-700",
    badgeLabel: "Error",
    title:      () => "Something Went Wrong",
    subtitle:   "Our team is here to help",
    showConfetti: false,
    showRedirect: false,
    showResend:   true,
    message: () =>
      `We encountered an unexpected error while verifying your email.
       Your booking request has been saved — this is just a verification
       hiccup. Please try again below or contact us on WhatsApp and
       we'll confirm your booking manually.`,
    nextSteps: null,
  },
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function BookingVerifyResult() {
  const [searchParams] = useSearchParams();

  const rawStatus  = searchParams.get("status") || "error";
  const ref        = searchParams.get("ref")    || null;
  const bookingId  = searchParams.get("id")     || null;
  const email      = searchParams.get("email")  || null;

  // Normalise unknown statuses to "error"
  const status = STATUS_CONFIG[rawStatus] ? rawStatus : "error";
  const cfg    = STATUS_CONFIG[status];

  /* Derived */
  const title    = cfg.title(ref);
  const message  = cfg.message(ref);

  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Step for dots — success = all done */
  const stepMap = {
    success:          4,
    already_verified: 4,
    expired:          2,
    invalid:          2,
    error:            2,
  };

  return (
    <div
      className={`
        relative min-h-screen flex flex-col items-center justify-center
        bg-gradient-to-br ${cfg.bgClass} px-4 py-12 overflow-hidden
      `}
    >
      {/* ── Decorative background blobs ── */}
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full
                   bg-emerald-200/20 blur-3xl pointer-events-none"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.1, 1], x: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full
                   bg-green-200/15 blur-3xl pointer-events-none"
      />

      {/* ── Dot grid ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.04,
        }}
      />

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`
          relative z-10 w-full max-w-lg
          bg-white/95 backdrop-blur-xl rounded-3xl
          shadow-2xl shadow-emerald-100/50
          border ${cfg.borderClass} overflow-hidden
        `}
        role="main"
        aria-live="polite"
      >
        {/* Confetti canvas */}
        <Confetti active={cfg.showConfetti} />

        {/* Top accent gradient bar */}
        <div
          aria-hidden="true"
          className={`
            absolute top-0 left-0 right-0 h-1.5
            bg-gradient-to-r ${cfg.accentFrom} ${cfg.accentTo}
          `}
        />

        {/* ── Card content ── */}
        <div className="relative z-10 p-8 sm:p-10 text-center">

          {/* Step dots */}
          <StepDots total={4} current={stepMap[status] ?? 2} />

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            <span className={`
              inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
              text-xs font-bold uppercase tracking-widest
              ${cfg.badgeBg} ${cfg.badgeText}
            `}>
              {cfg.badgeLabel}
            </span>
          </motion.div>

          {/* Icon */}
          <CheckCircle color={cfg.iconColor} />

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900
                       tracking-tight leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm font-semibold text-emerald-600 uppercase
                       tracking-widest mb-4"
          >
            {cfg.subtitle}
          </motion.p>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-base leading-relaxed mb-6"
          >
            {message}
          </motion.p>

          {/* Booking ref pill */}
          {ref && status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="inline-flex items-center gap-2.5 bg-emerald-50
                         border border-emerald-200 rounded-2xl px-5 py-3
                         mb-6 shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" className="w-4 h-4 text-emerald-500"
                aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest
                               font-bold text-gray-400">
                  Booking Reference
                </p>
                <p className="text-sm font-extrabold text-emerald-700
                               tracking-wide font-mono">
                  {ref}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Next steps (success / already_verified) ── */}
          <AnimatePresence>
            {cfg.nextSteps && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="bg-gradient-to-br from-emerald-50 to-green-50
                           border border-emerald-100 rounded-2xl
                           p-5 mb-6 text-left"
              >
                <p className="text-[11px] font-extrabold uppercase
                               tracking-widest text-emerald-600 mb-3">
                  What happens next?
                </p>
                <div className="space-y-0">
                  {cfg.nextSteps.map((step, i) => (
                    <div key={i}
                      className={`
                        flex items-start gap-3 py-3
                        ${i < cfg.nextSteps.length - 1
                          ? "border-b border-emerald-100" : ""}
                      `}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full
                                        bg-emerald-500 text-white text-[11px]
                                        font-extrabold flex items-center
                                        justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Resend button (expired / invalid / error) ── */}
          <AnimatePresence>
            {cfg.showResend && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="mb-4"
              >
                <ResendButton bookingId={bookingId} email={email} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CTA buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* WhatsApp — always present */}
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2
                         bg-[#25D366] hover:bg-[#1ebe5d] text-white
                         font-bold text-sm px-5 py-3.5 rounded-2xl
                         shadow-lg shadow-green-100 transition-all
                         hover:-translate-y-0.5"
            >
              {/* WhatsApp SVG icon */}
              <svg viewBox="0 0 24 24" fill="currentColor"
                className="w-5 h-5 flex-shrink-0" aria-hidden="true">
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
                  0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0
                  01-5.127-1.415l-.369-.218-3.822 1.049 1.016-3.711
                  -.237-.381A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10
                  4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Chat on WhatsApp
            </a>

            {/* Home link */}
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2
                         bg-white border-2 border-gray-200
                         hover:border-emerald-300 hover:text-emerald-700
                         text-gray-600 font-bold text-sm
                         px-5 py-3.5 rounded-2xl transition-all
                         hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" className="w-4 h-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Back to Home
            </Link>
          </motion.div>

          {/* ── Book another link (success) ── */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-4 text-center"
            >
              <Link
                to="/booking"
                className="text-sm font-semibold text-emerald-600
                           hover:text-emerald-700 hover:underline
                           transition-colors"
              >
                + Plan Another Trip
              </Link>
            </motion.div>
          )}

          {/* ── Auto-redirect countdown (success / already_verified) ── */}
          {cfg.showRedirect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <CountdownRedirect to="/" seconds={12} />
            </motion.div>
          )}

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 text-xs text-gray-400 leading-relaxed"
          >
            Need help? Email us at{" "}
            <a
              href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || "altuverasafari@gmail.com"}`}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {import.meta.env.VITE_SUPPORT_EMAIL || "altuverasafari@gmail.com"}
            </a>
          </motion.p>
        </div>
        {/* ── end card content ── */}
      </motion.div>

      {/* ── Trust badges below card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-8 flex flex-wrap justify-center gap-3"
      >
        {[
          { label: "Secure & Private",   sub: "256-bit encrypted"  },
          { label: "No Payment Now",     sub: "Free consultation"  },
          { label: "24/7 WhatsApp",      sub: "Real human support" },
          { label: "Expert Guides",      sub: "10+ years East Africa" },
        ].map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.07 }}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm
                       border border-emerald-100 rounded-full
                       px-3 py-2 shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
              aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112
                   2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0
                   003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332
                   9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-gray-700">{b.label}</p>
              <p className="text-[10px] text-gray-400">{b.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}