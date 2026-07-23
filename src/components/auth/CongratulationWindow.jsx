// src/components/common/CongratulationWindow.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// CONGRATULATION WINDOW v2.0 — Green/White Theme, Lucide Icons, No Emojis
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, CheckCircle, ArrowRight, MapPin, Bookmark,
  Calendar, Star, Sparkles, Globe, Compass,
} from "lucide-react";
import confetti from "canvas-confetti";

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */

const S = {
  backdrop: {
    position:   "fixed",
    inset:      0,
    zIndex:     9998,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
  },
  wrapper: {
    position:       "fixed",
    inset:          0,
    zIndex:         9999,
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "20px",
    pointerEvents:  "none",
  },
  modal: {
    pointerEvents:  "auto",
    width:          "100%",
    maxWidth:       460,
    background:     "#ffffff",
    borderRadius:   24,
    overflow:       "hidden",
    boxShadow:      "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
    fontFamily:     "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Top gradient strip */
  topStrip: {
    background:     "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
    padding:        "32px 28px 28px",
    position:       "relative",
    overflow:       "hidden",
    textAlign:      "center",
  },
  stripBubble1: {
    position:     "absolute",
    top:          -60,
    right:        -60,
    width:        180,
    height:       180,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.05)",
    pointerEvents: "none",
  },
  stripBubble2: {
    position:     "absolute",
    bottom:       -40,
    left:         -40,
    width:        140,
    height:       140,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.04)",
    pointerEvents: "none",
  },
  iconRing: {
    width:          80,
    height:         80,
    borderRadius:   "50%",
    background:     "rgba(255,255,255,0.15)",
    border:         "2px solid rgba(255,255,255,0.3)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 auto 16px",
    backdropFilter: "blur(8px)",
  },
  stripTitle: {
    fontSize:    "1.45rem",
    fontWeight:  900,
    color:       "#ffffff",
    margin:      "0 0 6px",
    lineHeight:  1.2,
    position:    "relative",
    zIndex:      1,
  },
  stripSub: {
    fontSize:  "0.85rem",
    color:     "rgba(255,255,255,0.75)",
    margin:    0,
    position:  "relative",
    zIndex:    1,
  },

  /* Close button */
  closeBtn: {
    position:       "absolute",
    top:            14,
    right:          14,
    zIndex:         10,
    width:          34,
    height:         34,
    borderRadius:   "50%",
    border:         "none",
    background:     "rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    cursor:         "pointer",
    color:          "#fff",
    transition:     "background 0.2s",
  },

  /* Body */
  body: { padding: "24px 28px 28px" },

  greeting: {
    textAlign:    "center",
    marginBottom: 20,
  },
  greetName: {
    fontSize:   "1.05rem",
    fontWeight: 800,
    color:      "#0f172a",
    margin:     "0 0 4px",
  },
  greetMsg: {
    fontSize:   "0.87rem",
    color:      "#64748b",
    margin:     0,
    lineHeight: 1.55,
  },

  /* Tips */
  tipsWrap: {
    display:        "flex",
    flexDirection:  "column",
    gap:            10,
    marginBottom:   24,
  },
  tipItem: {
    display:     "flex",
    alignItems:  "center",
    gap:         10,
    padding:     "10px 14px",
    background:  "#f8fafc",
    borderRadius: 12,
    border:      "1px solid #e2e8f0",
  },
  tipIconWrap: {
    width:          32,
    height:         32,
    borderRadius:   10,
    background:     "#ecfdf5",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
  },
  tipText: {
    fontSize:   "0.85rem",
    fontWeight: 600,
    color:      "#0f172a",
    margin:     0,
  },

  /* CTA button */
  cta: {
    width:          "100%",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    padding:        "14px 24px",
    borderRadius:   14,
    border:         "none",
    background:     "linear-gradient(135deg, #059669, #047857)",
    color:          "#ffffff",
    fontSize:       "0.95rem",
    fontWeight:     800,
    cursor:         "pointer",
    fontFamily:     "inherit",
    boxShadow:      "0 4px 16px rgba(5,150,105,0.3)",
    transition:     "all 0.2s",
    marginBottom:   16,
  },

  /* Progress dots */
  dotsWrap: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
  },
  dot: (active) => ({
    width:        active ? 20 : 7,
    height:       7,
    borderRadius: 99,
    background:   active ? "#059669" : "#e2e8f0",
    transition:   "all 0.3s",
  }),
};

const KEYFRAMES = `
  @keyframes cgRing {
    0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
    60%  { transform: scale(1.1) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg);    opacity: 1; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT CONFIG
═══════════════════════════════════════════════════════════════════════════ */

const CONTENT = {
  signup: {
    Icon:     CheckCircle,
    title:    "Welcome to Altuvera!",
    message:  "Your account is set up. Get ready for an unforgettable safari adventure.",
    subtitle: "Start planning your first trip",
    cta:      "Explore Destinations",
    ctaLink:  "/destinations",
    tips: [
      { icon: Globe,    text: "Browse 50+ curated destinations" },
      { icon: Compass,  text: "Customize your perfect safari"   },
      { icon: Star,     text: "Book with confidence"            },
    ],
  },
  login: {
    Icon:     Sparkles,
    title:    "Welcome Back!",
    message:  "Great to see you again. Ready to plan your next adventure?",
    subtitle: "Pick up where you left off",
    cta:      "View My Bookings",
    ctaLink:  "/my-bookings",
    tips: [
      { icon: Calendar, text: "Check your active bookings"    },
      { icon: MapPin,   text: "View saved destinations"       },
      { icon: Bookmark, text: "Update your preferences"       },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function CongratulationWindow({ isVisible, type, user, onClose }) {
  const [confettiFired, setConfettiFired] = useState(false);
  const [activeStep,    setActiveStep]    = useState(1);

  const cfg       = CONTENT[type] || CONTENT.login;
  const { Icon }  = cfg;
  const firstName = (user?.fullName || user?.name || "").split(" ")[0] || null;

  /* ── Confetti ── */
  useEffect(() => {
    if (!isVisible || confettiFired) return;
    setConfettiFired(true);

    const fire = () => {
      confetti({
        particleCount: 80,
        spread:        70,
        origin:        { y: 0.6 },
        gravity:       0.8,
        shapes:        ["circle", "square"],
        colors:        ["#059669", "#10b981", "#34d399", "#a7f3d0", "#d1fae5"],
      });
      setTimeout(() => {
        confetti({ particleCount: 35, spread: 100, origin: { x: 0.2, y: 0.35 } });
        confetti({ particleCount: 35, spread: 100, origin: { x: 0.8, y: 0.35 } });
      }, 180);
    };

    const t = setTimeout(fire, 200);
    return () => clearTimeout(t);
  }, [isVisible, confettiFired]);

  /* ── Dot animation ── */
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(
      () => setActiveStep((p) => (p + 1) % 3),
      900,
    );
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setConfettiFired(false);
    onClose?.();
  };

  const handleCta = () => {
    handleClose();
    if (cfg.ctaLink) window.location.href = cfg.ctaLink;
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              style={S.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
            />

            {/* Wrapper */}
            <div style={S.wrapper}>
              <motion.div
                style={S.modal}
                initial={{ opacity: 0, scale: 0.82, y: 40 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.88,  y: 20 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                {/* ── Top strip ─────────────────────────────────────── */}
                <div style={S.topStrip}>
                  <div style={S.stripBubble1} />
                  <div style={S.stripBubble2} />

                  {/* Close */}
                  <button
                    style={S.closeBtn}
                    onClick={handleClose}
                    aria-label="Close"
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  >
                    <X size={16} />
                  </button>

                  {/* Animated icon ring */}
                  <motion.div
                    style={S.iconRing}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0    }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                  >
                    <Icon size={36} color="#ffffff" />
                  </motion.div>

                  <motion.h2
                    style={S.stripTitle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                  >
                    {cfg.title}
                  </motion.h2>

                  <motion.p
                    style={S.stripSub}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {cfg.message}
                  </motion.p>
                </div>

                {/* ── Body ──────────────────────────────────────────── */}
                <div style={S.body}>

                  {/* Personalised greeting */}
                  {firstName && (
                    <motion.div
                      style={S.greeting}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={{ delay: 0.4 }}
                    >
                      <p style={S.greetName}>
                        {type === "signup"
                          ? `Welcome, ${firstName}!`
                          : `Hello again, ${firstName}!`}
                      </p>
                      <p style={S.greetMsg}>{cfg.subtitle}</p>
                    </motion.div>
                  )}

                  {/* Tips */}
                  <div style={S.tipsWrap}>
                    {cfg.tips.map(({ icon: TipIcon, text }, idx) => (
                      <motion.div
                        key={text}
                        style={S.tipItem}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0   }}
                        transition={{ delay: 0.45 + idx * 0.1 }}
                      >
                        <div style={S.tipIconWrap}>
                          <TipIcon size={16} color="#059669" />
                        </div>
                        <p style={S.tipText}>{text}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.button
                    style={S.cta}
                    onClick={handleCta}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.75 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 22px rgba(5,150,105,0.38)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {cfg.cta}
                    <ArrowRight size={18} />
                  </motion.button>

                  {/* Animated dots */}
                  <motion.div
                    style={S.dotsWrap}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={S.dot(i === activeStep)} />
                    ))}
                  </motion.div>

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}