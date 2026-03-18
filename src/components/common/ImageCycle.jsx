// ImageCycle.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useScrollTriggeredSlide } from "../../hooks/useScrollTriggeredSlide";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
} from "react-icons/fi";

// ═══════════════════════════════════════════════════════════════════
// APEX IMAGE CYCLE v5 — Cinematic Triple-Phase Slide Animations
// Each slide has 3 unique entrance styles that cycle automatically
// Zero flicker · GPU composited · Accessible · Professional
// ═══════════════════════════════════════════════════════════════════

// ─── Inject Global Keyframes Once ───────────────────────────────
const injectKeyframes = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const s = document.createElement("style");
    s.id = "apex-v5-kf";
    s.textContent = `
      @keyframes apexShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes apexFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes apexSpin{to{transform:rotate(360deg)}}
      @keyframes apexKenBurns{0%{transform:scale(1) translate(0,0)}50%{transform:scale(1.04) translate(-0.3%,-0.3%)}100%{transform:scale(1) translate(0,0)}}
    `;
    document.head.appendChild(s);
  };
})();

// ─── Easing Presets ─────────────────────────────────────────────
const EASE = {
  silk: [0.25, 0.46, 0.45, 0.94],
  expo: [0.16, 1, 0.3, 1],
  smooth: [0.22, 1, 0.36, 1],
  cinematic: [0.33, 1, 0.68, 1],
  elegant: [0.43, 0.13, 0.23, 0.96],
  luxe: [0.19, 1, 0.22, 1],
};

// ═══════════════════════════════════════════════════════════════════
// TRIPLE-PHASE ANIMATION SYSTEM
// Each slide index maps to a unique set of 3 entrance animations
// Visit 1 → Phase A, Visit 2 → Phase B, Visit 3 → Phase C, then loop
// ═══════════════════════════════════════════════════════════════════

const SLIDE_PHASES = [
  // ── Slide 0: Ethereal Set ──
  {
    A: {
      initial: { opacity: 0, scale: 1.06, y: "1%" },
      animate: { opacity: 1, scale: 1, y: "0%" },
      exit: { opacity: 0, scale: 0.97, y: "-0.5%" },
      transition: { duration: 1.1, ease: EASE.silk },
    },
    B: {
      initial: { opacity: 0, x: "5%", scale: 1.02 },
      animate: { opacity: 1, x: "0%", scale: 1 },
      exit: { opacity: 0, x: "-3%", scale: 0.99 },
      transition: { duration: 0.95, ease: EASE.smooth },
    },
    C: {
      initial: { opacity: 0, scale: 0.9, rotate: 1.5 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 1.05, rotate: -0.8 },
      transition: { duration: 1.2, ease: EASE.cinematic },
    },
  },
  // ── Slide 1: Horizon Set ──
  {
    A: {
      initial: { opacity: 0, x: "-4%", y: "1.5%" },
      animate: { opacity: 1, x: "0%", y: "0%" },
      exit: { opacity: 0, x: "2.5%", y: "-1%" },
      transition: { duration: 1.05, ease: EASE.smooth },
    },
    B: {
      initial: { opacity: 0, scale: 1.1, y: "-2%" },
      animate: { opacity: 1, scale: 1, y: "0%" },
      exit: { opacity: 0, scale: 0.94, y: "1%" },
      transition: { duration: 1.15, ease: EASE.silk },
    },
    C: {
      initial: { opacity: 0, x: "3%", rotate: -1.2 },
      animate: { opacity: 1, x: "0%", rotate: 0 },
      exit: { opacity: 0, x: "-2%", rotate: 0.6 },
      transition: { duration: 1, ease: EASE.elegant },
    },
  },
  // ── Slide 2: Ascend Set ──
  {
    A: {
      initial: { opacity: 0, y: "4%", scale: 1.01 },
      animate: { opacity: 1, y: "0%", scale: 1 },
      exit: { opacity: 0, y: "-2.5%", scale: 0.99 },
      transition: { duration: 1.1, ease: EASE.cinematic },
    },
    B: {
      initial: { opacity: 0, scale: 0.88 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.08 },
      transition: { duration: 1.25, ease: EASE.luxe },
    },
    C: {
      initial: { opacity: 0, x: "-3.5%", y: "-1.5%" },
      animate: { opacity: 1, x: "0%", y: "0%" },
      exit: { opacity: 0, x: "2%", y: "1%" },
      transition: { duration: 1, ease: EASE.smooth },
    },
  },
  // ── Slide 3: Prism Set ──
  {
    A: {
      initial: { opacity: 0, scale: 1.08, rotate: -1 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 0.95, rotate: 0.5 },
      transition: { duration: 1.15, ease: EASE.elegant },
    },
    B: {
      initial: { opacity: 0, y: "-3.5%", x: "2%" },
      animate: { opacity: 1, y: "0%", x: "0%" },
      exit: { opacity: 0, y: "2%", x: "-1.5%" },
      transition: { duration: 1.05, ease: EASE.cinematic },
    },
    C: {
      initial: { opacity: 0, scale: 0.93, y: "2%" },
      animate: { opacity: 1, scale: 1, y: "0%" },
      exit: { opacity: 0, scale: 1.04, y: "-1.5%" },
      transition: { duration: 1.2, ease: EASE.silk },
    },
  },
  // ── Slide 4: Drift Set ──
  {
    A: {
      initial: { opacity: 0, x: "4.5%", scale: 1.015 },
      animate: { opacity: 1, x: "0%", scale: 1 },
      exit: { opacity: 0, x: "-3%", scale: 0.995 },
      transition: { duration: 1, ease: EASE.smooth },
    },
    B: {
      initial: { opacity: 0, scale: 1.12 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.92 },
      transition: { duration: 1.2, ease: EASE.luxe },
    },
    C: {
      initial: { opacity: 0, y: "3%", rotate: 1.8 },
      animate: { opacity: 1, y: "0%", rotate: 0 },
      exit: { opacity: 0, y: "-2%", rotate: -0.9 },
      transition: { duration: 1.1, ease: EASE.elegant },
    },
  },
  // ── Slide 5: Velvet Set ──
  {
    A: {
      initial: { opacity: 0, y: "-3%", scale: 1.03 },
      animate: { opacity: 1, y: "0%", scale: 1 },
      exit: { opacity: 0, y: "2%", scale: 0.98 },
      transition: { duration: 1.05, ease: EASE.cinematic },
    },
    B: {
      initial: { opacity: 0, x: "-5%", rotate: 0.8 },
      animate: { opacity: 1, x: "0%", rotate: 0 },
      exit: { opacity: 0, x: "3%", rotate: -0.4 },
      transition: { duration: 1, ease: EASE.smooth },
    },
    C: {
      initial: { opacity: 0, scale: 0.86 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
      transition: { duration: 1.3, ease: EASE.silk },
    },
  },
  // ── Slide 6: Aurora Set ──
  {
    A: {
      initial: { opacity: 0, x: "2.5%", y: "2.5%" },
      animate: { opacity: 1, x: "0%", y: "0%" },
      exit: { opacity: 0, x: "-1.5%", y: "-1.5%" },
      transition: { duration: 1.1, ease: EASE.silk },
    },
    B: {
      initial: { opacity: 0, scale: 1.07, rotate: -1.5 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 0.96, rotate: 0.7 },
      transition: { duration: 1.15, ease: EASE.elegant },
    },
    C: {
      initial: { opacity: 0, y: "4%", x: "-1.5%" },
      animate: { opacity: 1, y: "0%", x: "0%" },
      exit: { opacity: 0, y: "-2.5%", x: "1%" },
      transition: { duration: 1.05, ease: EASE.cinematic },
    },
  },
  // ── Slide 7: Zenith Set ──
  {
    A: {
      initial: { opacity: 0, scale: 0.91, rotate: 1.2 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 1.06, rotate: -0.6 },
      transition: { duration: 1.2, ease: EASE.luxe },
    },
    B: {
      initial: { opacity: 0, x: "4%", y: "-2%" },
      animate: { opacity: 1, x: "0%", y: "0%" },
      exit: { opacity: 0, x: "-2.5%", y: "1.5%" },
      transition: { duration: 1, ease: EASE.smooth },
    },
    C: {
      initial: { opacity: 0, scale: 1.09 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.93 },
      transition: { duration: 1.15, ease: EASE.silk },
    },
  },
  // ── Slide 8: Mirage Set ──
  {
    A: {
      initial: { opacity: 0, x: "-3%", scale: 1.04 },
      animate: { opacity: 1, x: "0%", scale: 1 },
      exit: { opacity: 0, x: "2%", scale: 0.97 },
      transition: { duration: 1.05, ease: EASE.elegant },
    },
    B: {
      initial: { opacity: 0, y: "3.5%", rotate: -1 },
      animate: { opacity: 1, y: "0%", rotate: 0 },
      exit: { opacity: 0, y: "-2%", rotate: 0.5 },
      transition: { duration: 1.1, ease: EASE.cinematic },
    },
    C: {
      initial: { opacity: 0, scale: 0.87, x: "1.5%" },
      animate: { opacity: 1, scale: 1, x: "0%" },
      exit: { opacity: 0, scale: 1.07, x: "-1%" },
      transition: { duration: 1.25, ease: EASE.luxe },
    },
  },
  // ── Slide 9: Cosmos Set ──
  {
    A: {
      initial: { opacity: 0, scale: 1.05, y: "-2.5%" },
      animate: { opacity: 1, scale: 1, y: "0%" },
      exit: { opacity: 0, scale: 0.96, y: "1.5%" },
      transition: { duration: 1.1, ease: EASE.silk },
    },
    B: {
      initial: { opacity: 0, x: "-4.5%", y: "1%" },
      animate: { opacity: 1, x: "0%", y: "0%" },
      exit: { opacity: 0, x: "3%", y: "-0.5%" },
      transition: { duration: 1, ease: EASE.smooth },
    },
    C: {
      initial: { opacity: 0, rotate: 2, scale: 0.94 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: -1, scale: 1.04 },
      transition: { duration: 1.2, ease: EASE.elegant },
    },
  },
  // ── Slide 10: Nova Set ──
  {
    A: {
      initial: { opacity: 0, y: "3.5%", x: "1.5%" },
      animate: { opacity: 1, y: "0%", x: "0%" },
      exit: { opacity: 0, y: "-2%", x: "-1%" },
      transition: { duration: 1.05, ease: EASE.cinematic },
    },
    B: {
      initial: { opacity: 0, scale: 1.11, rotate: 0.8 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 0.93, rotate: -0.4 },
      transition: { duration: 1.2, ease: EASE.luxe },
    },
    C: {
      initial: { opacity: 0, x: "4%", scale: 0.97 },
      animate: { opacity: 1, x: "0%", scale: 1 },
      exit: { opacity: 0, x: "-2.5%", scale: 1.02 },
      transition: { duration: 1, ease: EASE.smooth },
    },
  },
  // ── Slide 11: Eclipse Set ──
  {
    A: {
      initial: { opacity: 0, scale: 0.89 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.08 },
      transition: { duration: 1.3, ease: EASE.silk },
    },
    B: {
      initial: { opacity: 0, x: "3%", y: "2%", rotate: -0.6 },
      animate: { opacity: 1, x: "0%", y: "0%", rotate: 0 },
      exit: { opacity: 0, x: "-2%", y: "-1.5%", rotate: 0.3 },
      transition: { duration: 1.1, ease: EASE.elegant },
    },
    C: {
      initial: { opacity: 0, y: "-4%", scale: 1.03 },
      animate: { opacity: 1, y: "0%", scale: 1 },
      exit: { opacity: 0, y: "2.5%", scale: 0.98 },
      transition: { duration: 1.05, ease: EASE.cinematic },
    },
  },
];

const PHASE_KEYS = ["A", "B", "C"];

const getTriplePhaseAnimation = (slideIndex, visitCount, reducedMotion) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25 },
    };
  }
  const set = SLIDE_PHASES[slideIndex % SLIDE_PHASES.length];
  const phase = PHASE_KEYS[visitCount % 3];
  return set[phase];
};

// ─── Skeleton ───────────────────────────────────────────────────
const Skeleton = memo(() => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#040406",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(90deg,transparent 0%,rgba(255,255,255,.008) 40%,rgba(255,255,255,.018) 50%,rgba(255,255,255,.008) 60%,transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "apexShimmer 2s infinite ease-in-out",
      }}
    />
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "rgba(139,92,246,.025)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "apexFloat 2.5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "1.5px solid rgba(139,92,246,.06)",
          borderTopColor: "rgba(139,92,246,.45)",
          animation: "apexSpin .85s linear infinite",
        }}
      />
    </div>
  </div>
));
Skeleton.displayName = "Skeleton";

// ─── Nav Arrow ──────────────────────────────────────────────────
const NavArrow = memo(({ dir, onClick, show }) => {
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  const left = dir === "left";

  return (
    <motion.button
      initial={{ opacity: 0, x: left ? -14 : 14 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : left ? -14 : 14 }}
      transition={{ duration: 0.5, ease: EASE.expo }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => {
        setH(false);
        setP(false);
      }}
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      aria-label={left ? "Previous" : "Next"}
      style={{
        position: "absolute",
        top: "50%",
        [left ? "left" : "right"]: "14px",
        transform: `translateY(-50%) scale(${p ? 0.88 : h ? 1.06 : 1})`,
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        border: "none",
        outline: "none",
        background: h ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.05)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        color: h ? "#0a0a14" : "rgba(255,255,255,.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 30,
        transition: "all .4s cubic-bezier(.22,1,.36,1)",
        boxShadow: h
          ? "0 6px 24px rgba(0,0,0,.25)"
          : "none",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {left ? (
        <FiChevronLeft size={16} strokeWidth={2.5} />
      ) : (
        <FiChevronRight size={16} strokeWidth={2.5} />
      )}
    </motion.button>
  );
});
NavArrow.displayName = "NavArrow";

// ─── Dots ───────────────────────────────────────────────────────
const Dots = memo(({ total, current, onSelect, show }) => {
  if (total <= 1) return null;
  return (
    <motion.nav
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: show ? 1 : 0.25, y: show ? 0 : 3 }}
      transition={{ duration: 0.5, ease: EASE.expo }}
      aria-label="Slide navigation"
      style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "5px 10px",
        background: "rgba(0,0,0,.18)",
        backdropFilter: "blur(30px) saturate(200%)",
        WebkitBackdropFilter: "blur(30px) saturate(200%)",
        borderRadius: "100px",
        border: "none",
        zIndex: 30,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <motion.button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(i);
            }}
            layout
            animate={{
              width: active ? "20px" : "5px",
              opacity: active ? 1 : 0.28,
            }}
            whileHover={{ opacity: 0.65, scale: 1.25 }}
            transition={{ duration: 0.45, ease: EASE.expo }}
            style={{
              height: "5px",
              borderRadius: "100px",
              border: "none",
              outline: "none",
              background: active
                ? "linear-gradient(135deg,#c084fc,#8b5cf6,#7c3aed)"
                : "rgba(255,255,255,.4)",
              cursor: "pointer",
              padding: 0,
              boxShadow: active ? "0 0 8px rgba(139,92,246,.35)" : "none",
            }}
            aria-label={`Slide ${i + 1}`}
            aria-current={active ? "true" : undefined}
          />
        );
      })}
    </motion.nav>
  );
});
Dots.displayName = "Dots";

// ─── Play / Pause ───────────────────────────────────────────────
const PlayPause = memo(({ playing, onToggle, show }) => {
  const [h, setH] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.6 }}
      transition={{ duration: 0.4, ease: EASE.expo }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      aria-label={playing ? "Pause" : "Play"}
      style={{
        position: "absolute",
        top: "14px",
        right: "14px",
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        border: "none",
        outline: "none",
        background: h ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.15)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 30,
        transition: "all .35s ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={playing ? "on" : "off"}
          initial={{ scale: 0.15, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.15, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.16 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? (
            <FiPause size={12} />
          ) : (
            <FiPlay size={12} style={{ marginLeft: 1 }} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
});
PlayPause.displayName = "PlayPause";

// ─── Counter ────────────────────────────────────────────────────
const Counter = memo(({ current, total, show }) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: show ? 0.7 : 0.22, y: 0 }}
    transition={{ duration: 0.45, ease: EASE.expo }}
    aria-live="polite"
    style={{
      position: "absolute",
      top: "14px",
      left: "14px",
      padding: "3px 9px",
      background: "rgba(0,0,0,.15)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      borderRadius: "100px",
      border: "none",
      color: "rgba(255,255,255,.7)",
      fontSize: "10px",
      fontWeight: 600,
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      letterSpacing: ".5px",
      zIndex: 30,
      userSelect: "none",
    }}
  >
    <span style={{ color: "#c084fc", fontWeight: 700 }}>{current + 1}</span>
    <span style={{ margin: "0 2px", opacity: 0.25 }}>·</span>
    <span>{total}</span>
  </motion.div>
));
Counter.displayName = "Counter";

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const ImageCycle = ({
  images = [],
  interval = 6000,
  style = {},
  className = "",
  showControls = true,
  // Back-compat alias used in some pages
  showControllers,
  showDots = true,
  showPlayPause = false,
  kenBurns = false,
  pauseOnHover = true,
  autoPlay = true,
  clickToNavigate = false,
  hideArrows = false,
  hintStorageKey,
  hintText = "Tip: Tap/click left or right side to change media",
  overlay = true,
  overlayGradient = "linear-gradient(180deg,rgba(0,0,0,.003) 0%,rgba(0,0,0,.035) 40%,rgba(0,0,0,.28) 100%)",
  onSlideChange,
  aspectRatio,
  currentIndex,
  onIndexChange,
}) => {
  const effectiveShowControls =
    typeof showControllers === "boolean" ? showControllers : showControls;

  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [idx, setIdx] = useState(typeof currentIndex === "number" ? currentIndex : 0);
  const [playing, setPlaying] = useState(autoPlay);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState(() => new Set());
  const [touchX, setTouchX] = useState(null);
  const [touchY, setTouchY] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [swipeHinted, setSwipeHinted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  // Track visit count per slide for triple-phase cycling
  const visitCounts = useRef({});

  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    const c = () => setMobile(window.innerWidth < 768);
    c();
    window.addEventListener("resize", c, { passive: true });
    return () => window.removeEventListener("resize", c);
  }, []);

  useEffect(() => {
    if (!clickToNavigate || safeImages.length <= 1) return undefined;
    if (!hintStorageKey) return undefined;
    try {
      const seen = localStorage.getItem(hintStorageKey) === "1";
      if (seen) return undefined;
      setHintVisible(true);
      localStorage.setItem(hintStorageKey, "1");
      const t = setTimeout(() => setHintVisible(false), 5200);
      return () => clearTimeout(t);
    } catch {
      // If storage is unavailable, still show once per mount.
      setHintVisible(true);
      const t = setTimeout(() => setHintVisible(false), 5200);
      return () => clearTimeout(t);
    }
  }, [clickToNavigate, hintStorageKey, safeImages.length]);

  // ── Preload all images eagerly ──
  useEffect(() => {
    if (!safeImages.length) return;
    let alive = true;
    safeImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      const done = () => {
        if (!alive) return;
        setLoaded((p) => {
          if (p.has(src)) return p;
          const n = new Set(p);
          n.add(src);
          return n;
        });
      };
      img.onload = done;
      img.onerror = done;
      if (img.complete) done();
    });
    return () => {
      alive = false;
    };
  }, [safeImages]);

  // ── Navigation ──
  const go = useCallback(
    (to) => {
      if (safeImages.length <= 1) return;
      const n =
        ((to % safeImages.length) + safeImages.length) % safeImages.length;
      setIdx(n);
      onSlideChange?.(n);
    },
    [safeImages.length, onSlideChange]
  );

  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  const scrollRef = useScrollTriggeredSlide(next, 250);
  useEffect(() => {
    if (scrollRef?.current && containerRef.current)
      scrollRef.current = containerRef.current;
  }, [scrollRef]);

  // ── Autoplay ──
  const autoplayEnabled = typeof interval === "number" && interval > 0;
  const shouldPlay =
    autoplayEnabled && playing && safeImages.length > 1 && (!pauseOnHover || !hovered);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (shouldPlay) timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [shouldPlay, interval, next]);

  // ── Track visits & get animation ──
  useEffect(() => {
    const key = idx;
    if (!visitCounts.current[key]) visitCounts.current[key] = 0;
    visitCounts.current[key]++;
  }, [idx]);

  const currentVisit = visitCounts.current[idx] || 1;

  const anim = useMemo(
    () => getTriplePhaseAnimation(idx, currentVisit - 1, reducedMotion),
    [idx, currentVisit, reducedMotion]
  );

  // ── Image load handler ──
  const markLoaded = useCallback((src) => {
    setLoaded((p) => {
      if (p.has(src)) return p;
      const n = new Set(p);
      n.add(src);
      return n;
    });
  }, []);

  // ── Touch ──
  const onTS = (e) => {
    setTouchX(e.touches[0].clientX);
    setTouchY(e.touches[0].clientY);
  };
  const onTE = (e) => {
    if (touchX === null) return;
    const dx = touchX - e.changedTouches[0].clientX;
    const dy = Math.abs(touchY - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 36 && Math.abs(dx) > dy) {
      dx > 0 ? next() : prev();
      if (!swipeHinted) setSwipeHinted(true);
    }
    setTouchX(null);
    setTouchY(null);
  };

  // ── Keyboard ──
  useEffect(() => {
    const h = (e) => {
      if (!hovered) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [hovered, next, prev]);

  // ── Derived ──
  const cur = safeImages[idx];
  const curLoaded = loaded.has(cur);
  const prevIdx =
    safeImages.length > 1
      ? (idx - 1 + safeImages.length) % safeImages.length
      : 0;
  const backdrop = safeImages[prevIdx];
  const hasNav = effectiveShowControls && safeImages.length > 1;
  const uiShow = hovered || mobile;

  // ─── Empty State ──────────────────────────────────────────────
  if (!safeImages.length) {
    return (
      <div
        ref={containerRef}
        className={className}
        role="img"
        aria-label="No images"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#040406",
          borderRadius: "inherit",
          border: "none",
          outline: "none",
          ...(aspectRatio && { aspectRatio }),
          ...style,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background:
              "radial-gradient(ellipse at center,rgba(139,92,246,.015) 0%,transparent 70%)",
          }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(139,92,246,.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(139,92,246,.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </motion.div>
          <span
            style={{
              color: "rgba(255,255,255,.18)",
              fontSize: "11px",
              fontWeight: 500,
              fontFamily: "'Inter',-apple-system,sans-serif",
              letterSpacing: ".3px",
            }}
          >
            No images available
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={(e) => {
        if (!clickToNavigate || safeImages.length <= 1) return;
        if (e.defaultPrevented) return;

        const target = e.target;
        if (
          target?.closest?.("button,a,input,select,textarea,[data-imgcycle-control]")
        ) {
          return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        e.clientX < mid ? prev() : next();
        if (!swipeHinted) setSwipeHinted(true);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTS}
      onTouchEnd={onTE}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Image ${idx + 1} of ${safeImages.length}`}
      tabIndex={0}
      style={{
        position: "relative",
        overflow: "hidden",
        transform: "translateZ(0)",
        background: "#040406",
        borderRadius: "inherit",
        border: "none",
        outline: "none",
        boxShadow: "none",
        isolation: "isolate",
        WebkitTapHighlightColor: "transparent",
        ...(aspectRatio && { aspectRatio }),
        ...style,
      }}
    >
      {/* ═══ L0 — Persistent Backdrop ═══ */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "#040406",
        }}
      >
        {loaded.has(backdrop) ? (
          <img
            src={backdrop}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              border: "none",
              outline: "none",
              display: "block",
            }}
          />
        ) : loaded.size > 0 ? (
          <img
            src={[...loaded][0]}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              border: "none",
              outline: "none",
              display: "block",
            }}
          />
        ) : null}
      </div>

      {/* ═══ L1 — Skeleton ═══ */}
      <AnimatePresence>
        {loaded.size === 0 && (
          <motion.div
            key="skel"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE.silk }}
            style={{ position: "absolute", inset: 0, zIndex: 3 }}
          >
            <Skeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ L2 — Animated Slide with Triple-Phase Animation ═══ */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`${idx}-${currentVisit}`}
          initial={anim.initial}
          animate={anim.animate}
          exit={anim.exit}
          transition={anim.transition}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            border: "none",
            outline: "none",
            willChange: "opacity, transform",
          }}
        >
          <img
            src={cur}
            alt={`Slide ${idx + 1}`}
            onLoad={() => markLoaded(cur)}
            loading="eager"
            decoding="async"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              border: "none",
              outline: "none",
              display: "block",
              opacity: curLoaded ? 1 : 0,
              transition: "opacity .2s ease",
              ...(kenBurns &&
                !reducedMotion && {
                  animation: `apexKenBurns ${interval * 1.5}ms ease-in-out infinite`,
                }),
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ═══ L3 — Overlay ═══ */}
      {overlay && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: overlayGradient,
            pointerEvents: "none",
            zIndex: 10,
            border: "none",
          }}
        />
      )}

      {/* ═══ L4 — Ambient Glow ═══ */}
      {!reducedMotion && (
        <>
          <motion.div
            animate={{ opacity: [0.04, 0.1, 0.04] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-16%",
              left: "-8%",
              width: "40%",
              height: "40%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(139,92,246,.035) 0%,transparent 70%)",
              pointerEvents: "none",
              zIndex: 9,
              filter: "blur(60px)",
            }}
          />
          <motion.div
            animate={{ opacity: [0.03, 0.07, 0.03] }}
            transition={{
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-12%",
              right: "-5%",
              width: "34%",
              height: "34%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(59,130,246,.025) 0%,transparent 70%)",
              pointerEvents: "none",
              zIndex: 9,
              filter: "blur(60px)",
            }}
          />
        </>
      )}

      {/* ═══ L5 — Vignette ═══ */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 11,
          boxShadow: "inset 0 0 60px 10px rgba(0,0,0,.04)",
          border: "none",
        }}
      />

      {/* ═══ UI ═══ */}

      {effectiveShowControls && safeImages.length > 1 && (
        <Counter current={idx} total={safeImages.length} show={uiShow} />
      )}

      {hasNav && !mobile && !hideArrows && (
        <>
          <div data-imgcycle-control>
            <NavArrow dir="left" onClick={prev} show={hovered} />
          </div>
          <div data-imgcycle-control>
            <NavArrow dir="right" onClick={next} show={hovered} />
          </div>
        </>
      )}

      {mobile && safeImages.length > 1 && !swipeHinted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 0.8 }}
          onAnimationComplete={() =>
            setTimeout(() => setSwipeHinted(true), 4500)
          }
          style={{
            position: "absolute",
            bottom: "52px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 2, repeat: 3, ease: "easeInOut" }}
            style={{
              width: "24px",
              height: "2.5px",
              borderRadius: "100px",
              background: "rgba(255,255,255,.15)",
              border: "none",
            }}
          />
        </motion.div>
      )}

      {effectiveShowControls && showPlayPause && safeImages.length > 1 && (
        <PlayPause
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          show={uiShow}
        />
      )}

      {effectiveShowControls && showDots && safeImages.length > 1 && safeImages.length <= 12 && (
        <Dots
          total={safeImages.length}
          current={idx}
          onSelect={go}
          show={uiShow}
        />
      )}

      {clickToNavigate && safeImages.length > 1 && hintText && (
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              key="imgcycle-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.92, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, ease: EASE.expo }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: "14px",
                transform: "translateX(-50%)",
                zIndex: 40,
                pointerEvents: "none",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.28)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.9)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.2px",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
                whiteSpace: "nowrap",
              }}
              aria-hidden="true"
            >
              {hintText}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default memo(ImageCycle);
