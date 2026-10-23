// src/components/common/CongratulationWindow.jsx
// ═══════════════════════════════════════════════════════════════════════════════
// CONGRATULATION WINDOW v2.0 — Green/White Theme, Lucide Icons, No Emojis
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, CheckCircle, ArrowRight, MapPin, Bookmark,
  Calendar, Star, Sparkles, Globe, Compass, ShieldCheck,
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
    maxHeight:      "min(88dvh, 760px)",
    background:     "#ffffff",
    borderRadius:   22,
    overflowX:      "hidden",
    overflowY:      "auto",
    boxShadow:      "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
    fontFamily:     "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Top gradient strip */
  topStrip: {
    background:     "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
    padding:        "24px 24px 20px",
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
  profileRing: {
    width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.14)",
    border: "2px solid rgba(255,255,255,0.58)", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 12px", overflow: "hidden", position: "relative",
    zIndex: 1, boxShadow: "0 0 0 7px rgba(255,255,255,0.06), 0 10px 28px rgba(0,0,0,.18)",
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
  body: { padding: "16px 22px 20px" },

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
    gap:            8,
    marginBottom:   14,
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
    padding:        "11px 20px",
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
    width: active ? 20 : 7, height: 7, borderRadius: 99,
    background: active ? "#059669" : "#e2e8f0", transition: "all 0.3s",
  }),
  quickLinks: {
    display: "flex", gap: 9, marginTop: 12, padding: "2px 2px 8px",
    overflowX: "auto", overflowY: "hidden", scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch", scrollbarWidth: "thin",
  },
  quickLink: {
    display: "flex", alignItems: "center", gap: 8, minWidth: 0,
    padding: "10px 11px", borderRadius: 12, border: "1px solid #dbece4",
    background: "#fbfefc", color: "#166534", textDecoration: "none",
    fontSize: "0.78rem", fontWeight: 750, transition: "all .18s ease",
    flex: "0 0 auto", minWidth: 138, scrollSnapAlign: "start",
  },
};

const KEYFRAMES = `
  @keyframes cgProfileReveal { 0% { transform: translateY(10px) scale(.82); opacity: 0; } 65% { transform: translateY(-3px) scale(1.04); opacity: 1; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes cgBubbleDrift { 0%,100% { transform:translate3d(0,0,0) scale(1); } 50% { transform:translate3d(-10px,8px,0) scale(1.06); } }
  .cg-bubble { animation:cgBubbleDrift 7s ease-in-out infinite; }
  .cg-bubble--slow { animation-duration:9s; animation-delay:-2s; }
  .cg-profile-photo { width:100%; height:100%; object-fit:cover; display:block; opacity:.94; }
  .cg-quick-links::-webkit-scrollbar { height:4px; }
  .cg-quick-links::-webkit-scrollbar-thumb { background:#c7e5d4; border-radius:99px; }
  @media (max-width: 520px) { .cg-modal { max-height:min(90dvh,720px)!important; border-radius:20px!important; } .cg-top { padding:22px 18px 18px!important; } .cg-body { padding:14px 16px 16px!important; } .cg-profile { width:68px!important;height:68px!important; } .cg-tips { gap:7px!important;margin-bottom:10px!important; } .cg-tip { padding:8px 10px!important; } .cg-cta { margin-bottom:10px!important; } }
  @media (prefers-reduced-motion: reduce) { .cg-profile { animation:none!important; } }
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
      { icon: Globe,    text: "Browse curated African destinations" },
      { icon: Compass,  text: "Discover experiences for your next safari" },
      { icon: Star,     text: "Save favorites and plan at your pace" },
    ],
    quickLinks: [
      { icon: Globe, label: "Destinations", href: "/destinations" },
      { icon: Compass, label: "Safari packages", href: "/packages" },
      { icon: Bookmark, label: "My wishlist", href: "/wishlist" },
      { icon: Calendar, label: "My bookings", href: "/my-bookings" },
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
      { icon: Calendar, text: "Check your active bookings" },
      { icon: MapPin,   text: "Return to destinations you love" },
      { icon: Bookmark, text: "Keep your travel plans organized" },
    ],
    quickLinks: [
      { icon: Globe, label: "Destinations", href: "/destinations" },
      { icon: Calendar, label: "My bookings", href: "/my-bookings" },
      { icon: Bookmark, label: "My wishlist", href: "/wishlist" },
      { icon: Star, label: "My profile", href: "/profile" },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function CongratulationWindow({ isVisible, type, user, onClose }) {
  const confettiFiredRef = useRef(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);

  useEffect(() => {
    if (isVisible) setShowSecurityPrompt(type === "signup");
  }, [isVisible, type]);

  const cfg       = CONTENT[type] || CONTENT.login;
  const firstName = (user?.fullName || user?.name || "").split(" ")[0] || null;
  const avatarUrl = user?.avatar || user?.profilePicture || user?.profileImage || user?.avatarUrl || user?.picture || "";
  const avatarInitials = (user?.fullName || user?.name || user?.email || "A").trim().split(/\\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  /* ── Confetti ── */
  useEffect(() => {
    if (!isVisible) {
      confettiFiredRef.current = false;
      return undefined;
    }
    if (confettiFiredRef.current) return undefined;
    confettiFiredRef.current = true;

    const fire = () => {
      confetti({
        particleCount: 100,
        spread: 78,
        origin: { y: 0.58 },
        gravity: 0.78,
        shapes: ["circle", "square"],
        colors: ["#059669", "#10b981", "#34d399", "#a7f3d0", "#d1fae5", "#fbbf24"],
      });
      setTimeout(() => {
        confetti({ particleCount: 40, spread: 100, origin: { x: 0.18, y: 0.35 } });
        confetti({ particleCount: 40, spread: 100, origin: { x: 0.82, y: 0.35 } });
      }, 220);
    };

    const timer = setTimeout(fire, 160);
    return () => clearTimeout(timer);
  }, [isVisible]);

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
    confettiFiredRef.current = false;
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
                className="cg-modal"
                style={S.modal}
                initial={{ opacity: 0, scale: 0.88, y: 22 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              >
                {/* ── Top strip ─────────────────────────────────────── */}
                <div className="cg-top" style={S.topStrip}>
                  <div className="cg-bubble" style={S.stripBubble1} />
                  <div className="cg-bubble cg-bubble--slow" style={S.stripBubble2} />

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

                  {/* Full-circle profile photo over the animated dark-green header */}
                  <motion.div className="cg-profile" style={S.profileRing}
                    initial={{ scale: 0.78, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.12 }}>
                    {avatarUrl ? <img className="cg-profile-photo" src={avatarUrl} alt={`${user?.fullName || user?.name || "Your"} profile`} /> : <span aria-label="Profile initials" style={{ color:"#fff", fontWeight:900, fontSize:25, letterSpacing:"-.04em" }}>{avatarInitials}</span>}
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
                <div className="cg-body" style={S.body}>

                  {type === "signup" && showSecurityPrompt ? (
                    <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
                      <div style={{ width: 62, height: 62, margin: "0 auto 16px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#047857", background: "#ecfdf5" }}>
                        <ShieldCheck size={30} />
                      </div>
                      <h3 style={{ margin: "0 0 8px", color: "#102a20", fontSize: "1.2rem", lineHeight: 1.3, fontWeight: 850 }}>Add another way to sign in?</h3>
                      <p style={{ margin: "0 auto 20px", maxWidth: 330, color: "#64756b", fontSize: "0.88rem", lineHeight: 1.6 }}>Your account is ready. You can set up a passkey using your device's fingerprint, face unlock, PIN, or security key. You can also skip this and continue.</p>
                      <button type="button" onClick={() => { setShowSecurityPrompt(false); window.open("/account/security", "_blank", "noopener,noreferrer"); }} style={{ ...S.cta, marginBottom: 10 }}>
                        Set up a passkey <ArrowRight size={18} />
                      </button>
                      <button type="button" onClick={() => setShowSecurityPrompt(false)} style={{ width: "100%", minHeight: 44, border: "1px solid #dbe8e0", borderRadius: 13, background: "#fff", color: "#456153", fontSize: "0.88rem", fontWeight: 750, cursor: "pointer" }}>
                        Skip for now
                      </button>
                    </div>
                  ) : (
                    <>
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
                  <div className="cg-tips" style={S.tipsWrap}>
                    {cfg.tips.map(({ icon: TipIcon, text }, idx) => (
                      <motion.div
                        key={text}
                        className="cg-tip"
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

                  {type === "signup" && (
                    <p style={{ margin: "0 0 12px", textAlign: "center", color: "#047857", fontSize: "0.78rem", lineHeight: 1.5 }}>
                      A welcome email is on its way to your inbox.
                    </p>
                  )}

                  <nav aria-label="Quick links" className="cg-quick-links" style={S.quickLinks}>
                    {(cfg.quickLinks || []).map(({ icon: LinkIcon, label, href }) => (
                      <a key={href} href={href} style={S.quickLink}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#ecfdf5"; e.currentTarget.style.borderColor = "#86efac"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fbfefc"; e.currentTarget.style.borderColor = "#dbece4"; }}>
                        <LinkIcon size={15} aria-hidden="true" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                      </a>
                    ))}
                  </nav>

                  {/* CTA */}
                  <motion.button
                    className="cg-cta"
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

                    </>)}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}