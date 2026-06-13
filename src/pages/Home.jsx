// src/pages/Home.jsx
import React, {
  useState, useEffect, useCallback, useRef, useMemo, memo,
} from "react";
import { Link } from "react-router-dom";
import {
  motion, AnimatePresence, useScroll, useTransform, useInView,
  useSpring, useMotionValue, useMotionValueEvent,
} from "framer-motion";

import Hero, { HERO_SLIDES } from "../components/home/Hero";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import Confetti from "../components/common/Confetti";
import SEO from "../components/common/SEO";
import DestinationCard from "../components/home/DestinationCard";

import { useApp } from "../context/AppContext";
import { useDestinations } from "../hooks/useDestinations";
import { useCountries } from "../hooks/useCountries";
import { useGallery } from "../hooks/useGallery";
import { useTestimonials } from "../hooks/useTestimonials";
import { useWishlist } from "../hooks/useWishlist";
import "../styles/Home.css";

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */
const IconArrowRight = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
const IconCheck = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
const IconStar = ({ size = 16, color = "currentColor", fill = "none", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const IconMapPin = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconGlobe = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);
const IconCompass = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
);
const IconChevronLeft = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15 18-6-6 6-6" /></svg>
);
const IconChevronRight = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 18 6-6-6-6" /></svg>
);

const IconMap = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /><path d="M15 5.764v15" /><path d="M9 3.236v15" /></svg>
);
const IconSun = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.34-7.07-1.41 1.41M6.34 17.66l-1.41 1.41" /></svg>
);
const IconTarget = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
const IconBookOpen = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
);
const IconZap = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
);
const IconCamera = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);
const IconFlag = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" /></svg>
);
const IconExpand = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6M21 7.8V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6" /></svg>
);
const IconRefresh = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
);
const IconWhatsApp = ({ size = 24, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
);
const IconPhone = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const IconMessageCircle = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
);
const IconShield = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconClock = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const IconUsers = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconLoader = ({ size = 16, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

/* ═══════════════════════════════════════════
   UTILITY HOOKS
   ═══════════════════════════════════════════ */
const usePrefersReducedMotion = () => {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const h = (e) => setR(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return r;
};

const useWindowSize = () => {
  const [s, setS] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    let raf;
    const h = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setS({ w: window.innerWidth, h: window.innerHeight })
      );
    };
    window.addEventListener("resize", h);
    return () => {
      window.removeEventListener("resize", h);
      cancelAnimationFrame(raf);
    };
  }, []);
  return s;
};

/* ═══════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════ */
const ScrollProgress = memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  return <motion.div className="scroll-progress-bar" style={{ scaleX }} />;
});

/* ═══════════════════════════════════════════
   MAGNETIC WRAPPER
   ═══════════════════════════════════════════ */
const MagneticWrap = memo(({ children, strength = 0.25, scale = 1.02 }) => {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });
  const ss = useSpring(1, { stiffness: 280, damping: 22 });
  const onMove = useCallback(
    (e) => {
      if (reduced) return;
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      x.set((e.clientX - r.left - r.width / 2) * strength);
      y.set((e.clientY - r.top - r.height / 2) * strength);
      ss.set(scale);
    },
    [reduced, strength, scale, x, y, ss]
  );
  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    ss.set(1);
  }, [x, y, ss]);
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: "inline-block", x: sx, y: sy, scale: ss }}
    >
      {children}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */
const Counter = memo(({ end, suffix = "", duration = 2.5 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const sv = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const [d, setD] = useState("0");
  useEffect(() => {
    if (inView) mv.set(parseInt(end, 10));
  }, [inView, end, mv]);
  useMotionValueEvent(sv, "change", (v) => setD(Math.round(v).toLocaleString()));
  return <span ref={ref}>{d}{suffix}</span>;
});

/* ═══════════════════════════════════════════
   TEXT REVEAL
   ═══════════════════════════════════════════ */
const TextReveal = memo(({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div>{children}</div>;
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ y: "120%", opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.25, 1, 0.5, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   SPLIT TEXT
   ═══════════════════════════════════════════ */
const SplitText = memo(({ children, className, style, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = usePrefersReducedMotion();
  const words = typeof children === "string" ? children.split(" ") : [children];
  if (reduced) return <span className={className} style={style}>{children}</span>;
  return (
    <span ref={ref} className={className} style={{ ...style, display: "inline" }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}
        >
          <motion.span
            initial={{ y: "130%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.05,
              ease: [0.25, 1, 0.5, 1],
            }}
            style={{ display: "inline-block" }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
});

/* ═══════════════════════════════════════════
   STAGGER CONTAINER / ITEM
   ═══════════════════════════════════════════ */
const StaggerWrap = memo(({ children, stagger = 0.1, className, style }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
});

const StaggerChild = memo(({ children, style }) => (
  <motion.div
    style={style}
    variants={{
      hidden: { opacity: 0, y: 44, filter: "blur(6px)" },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.75, ease: [0.25, 1, 0.5, 1] },
      },
    }}
  >
    {children}
  </motion.div>
));

/* ═══════════════════════════════════════════
   PARALLAX SECTION
   ═══════════════════════════════════════════ */
const ParallaxSection = memo(({ image, children, height = "80vh", overlay }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = usePrefersReducedMotion();
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : ["-15%", "15%"]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [1.22, 1.08, 1.15]
  );
  const contentOp = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    [0, 1, 1, 0]
  );
  const contentY = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    reduced ? [0, 0, 0, 0] : [70, 0, 0, -70]
  );
  return (
    <section ref={ref} className="cta-section" style={{ height, minHeight: 480 }}>
      <motion.div
        className="cta-bg"
        style={{ backgroundImage: `url(${image})`, y, scale }}
      />
      <div className="cta-overlay" style={{ background: overlay }} />
      <motion.div className="cta-inner" style={{ opacity: contentOp, y: contentY }}>
        {children}
      </motion.div>
    </section>
  );
});

/* ═══════════════════════════════════════════
   ADVENTURE CARD (with slideshow)
   ═══════════════════════════════════════════ */
const AdventureCard = memo(({ adventure, index, onOpen }) => {
  const [cur, setCur] = useState(0);
  const [hov, setHov] = useState(false);
  const ivRef = useRef(null);
  const imgs = adventure.images || [adventure.image];

  useEffect(() => {
    if (imgs.length <= 1) return;
    ivRef.current = setInterval(
      () => setCur((p) => (p + 1) % imgs.length),
      hov ? 2200 : 4500
    );
    return () => clearInterval(ivRef.current);
  }, [imgs.length, hov]);

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation();
      setCur((p) => (p - 1 + imgs.length) % imgs.length);
    },
    [imgs.length]
  );
  const goNext = useCallback(
    (e) => {
      e.stopPropagation();
      setCur((p) => (p + 1) % imgs.length);
    },
    [imgs.length]
  );

  return (
    <motion.div
      className="adventure-card-v2"
      onClick={() => onOpen?.(adventure)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(adventure);
        }
      }}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="adventure-card-v2-images">
        <AnimatePresence mode="wait">
          <motion.img
            key={cur}
            src={imgs[cur]}
            alt={adventure.title}
            className="adventure-card-v2-img"
            loading="lazy"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45 }}
          />
        </AnimatePresence>
        <div className="adventure-card-v2-gradient" />
        {imgs.length > 1 && (
          <motion.div
            className="adventure-card-v2-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="adventure-card-v2-nav-btn"
              onClick={goPrev}
              aria-label="Previous"
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              className="adventure-card-v2-nav-btn"
              onClick={goNext}
              aria-label="Next"
            >
              <IconChevronRight size={18} />
            </button>
          </motion.div>
        )}
        {imgs.length > 1 && (
          <div className="adventure-card-v2-indicators">
            {imgs.map((_, i) => (
              <button
                key={i}
                className={`adventure-card-v2-indicator${i === cur ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCur(i);
                }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="adventure-card-v2-content">
        <h3 className="adventure-card-v2-title">{adventure.title}</h3>
        <p className="adventure-card-v2-desc">{adventure.description}</p>
        <button
          type="button"
          className="adventure-card-v2-link"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.(adventure);
          }}
        >
          <span>View details</span>
          <IconArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COUNTRY CARD (with slideshow)
   ═══════════════════════════════════════════ */
const CountryCard = memo(({ country, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [curImg, setCurImg] = useState(0);
  const [hover, setHover] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const ivRef = useRef(null);

  const allImages = useMemo(() => {
    if (
      country.images &&
      Array.isArray(country.images) &&
      country.images.length > 0
    ) {
      return country.images.filter(Boolean);
    }
    const singleImg =
      country.imageUrl ||
      country.heroImage ||
      country.coverImageUrl ||
      country.flagUrl;
    return singleImg ? [singleImg] : [];
  }, [country]);

  useEffect(() => {
    if (allImages.length <= 1) return;
    ivRef.current = setInterval(() => {
      setCurImg((p) => (p + 1) % allImages.length);
    }, hover ? 2200 : 5000);
    return () => clearInterval(ivRef.current);
  }, [allImages.length, hover]);

  useEffect(() => {
    setImgLoaded(false);
  }, [curImg]);

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation();
      setCurImg((p) => (p - 1 + allImages.length) % allImages.length);
    },
    [allImages.length]
  );

  const goNext = useCallback(
    (e) => {
      e.stopPropagation();
      setCurImg((p) => (p + 1) % allImages.length);
    },
    [allImages.length]
  );

  return (
    <motion.div
      ref={ref}
      className="country-card"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.25, 1, 0.5, 1],
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ✅ FIX: Link wraps content INSIDE motion.div, closes before motion.div */}
      <Link to={`/country/${country.slug || country.id}`}>
        <div className="country-card-image-wrap">
          {/* Slideshow */}
          <div className="country-card-images">
            <AnimatePresence mode="wait">
              <motion.img
                key={curImg}
                src={allImages[curImg]}
                alt={`${country.name} - ${curImg + 1}`}
                className="country-card-image"
                loading={curImg === 0 ? "lazy" : "eager"}
                onLoad={() => setImgLoaded(true)}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
          </div>

          <div className="country-card-image-overlay" />
          {country.flagUrl && (
            <div className="country-card-flag">
              <img src={country.flagUrl} alt={`${country.name} flag`} />
            </div>
          )}

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <motion.div
              className="country-card-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: hover ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ pointerEvents: hover ? "auto" : "none" }}
            >
              <button
                className="country-card-nav-btn"
                onClick={goPrev}
                aria-label="Previous image"
              >
                <IconChevronLeft size={18} />
              </button>
              <button
                className="country-card-nav-btn"
                onClick={goNext}
                aria-label="Next image"
              >
                <IconChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Indicators */}
          {allImages.length > 1 && (
            <div className="country-card-indicators">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`country-card-indicator${
                    i === curImg ? " active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurImg(i);
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Skeleton loader */}
          {!imgLoaded && (
            <div className="country-card-skeleton">
              <div className="skeleton-shimmer" />
            </div>
          )}
        </div>

        <div className="country-card-content">
          <div className="country-card-header">
            <h3 className="country-card-name">{country.name}</h3>
            {country.continent && (
              <span className="country-card-continent">{country.continent}</span>
            )}
          </div>
          {country.tagline && (
            <p className="country-card-tagline">{country.tagline}</p>
          )}
          <div className="country-card-footer">
            <div className="country-card-meta">
              {country.capital && (
                <span className="country-card-capital">
                  <IconFlag size={12} />
                  {country.capital}
                </span>
              )}
            </div>
            <span className="country-card-cta">
              Explore <IconArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
      {/* ✅ Link closes here, INSIDE motion.div */}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COUNTRIES SKELETON
   ═══════════════════════════════════════════ */
const CountriesSkeleton = ({ count = 4 }) => (
  <div className="countries-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="country-card country-card--skeleton">
        <div
          className="country-card-image-wrap skeleton-shimmer"
          style={{ height: 180 }}
        />
        <div className="country-card-content">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--text" />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   COUNTRIES MESSAGE
   ═══════════════════════════════════════════ */
const CountriesMessage = ({ type = "loading", error, onRetry }) => {
  const cfg = {
    loading: {
      icon: "🌍",
      title: "Discovering Countries…",
      description: "Loading stunning East African destinations for you.",
      showRetry: false,
    },
    error: {
      icon: "⚠️",
      title: "Couldn't Load Countries",
      description: error || "Something went wrong. Please try again.",
      showRetry: true,
    },
    empty: {
      icon: "🗺️",
      title: "No Countries Found",
      description:
        "We're still adding amazing destinations. Check back soon.",
      showRetry: true,
    },
  };
  const c = cfg[type] || cfg.loading;
  return (
    <motion.div
      className="countries-message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="countries-message-icon">{c.icon}</div>
      <h3 className="countries-message-title">{c.title}</h3>
      <p className="countries-message-desc">{c.description}</p>
      {c.showRetry && onRetry && (
        <button className="countries-message-retry" onClick={onRetry}>
          <IconRefresh size={16} /> Try Again
        </button>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   SIGNATURE CARD
   ═══════════════════════════════════════════ */
const SignatureCard = memo(({ experience, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  if (!experience) return null;
  const { title, subtitle, description, image, stats } = experience;
  return (
    <motion.article
      ref={ref}
      className="sig-card"
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.14, ease: [0.25, 1, 0.5, 1] }}
    >
<div className="sig-card-img-wrap">
          <img src={image} alt={title} className="sig-card-img" loading="lazy" />
          <div className="sig-card-img-gradient" />
          <div className="sig-card-subtitle-tag">{subtitle}</div>
        </div>
      <div className="sig-card-body">
        <h3 className="sig-card-title">{title}</h3>
        <p className="sig-card-desc">{description}</p>
        <div className="sig-card-stats">
          {Object.entries(stats || {})
            .filter(([k]) => k !== "Rating")
            .map(([key, value]) => (
              <div key={key} className="sig-card-stat">
                <div className="sig-card-stat-label">{key}</div>
                <div className="sig-card-stat-value">{value}</div>
              </div>
            ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="sig-card-cta"
          onClick={() => (window.location.href = "/booking")}
        >
          Book This Experience <IconArrowRight size={16} />
        </motion.button>
      </div>
      <div className="sig-card-corner-accent" />
    </motion.article>
  );
});

/* ═══════════════════════════════════════════
   GALLERY CARD
   ═══════════════════════════════════════════ */
const GalleryCard = memo(({ image, index, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      className="gallery-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={() => onClick?.(image, index)}
      layoutId={`gallery-${image.id}`}
    >
      <div className="gallery-card-image-wrap">
        <img
          src={image.thumb || image.src}
          alt={image.alt || image.title}
          className="gallery-card-image"
          loading="lazy"
        />
        <div className="gallery-card-overlay">
          <div className="gallery-card-actions">
            <button className="gallery-card-action" aria-label="View full size">
              <IconExpand size={20} />
            </button>
          </div>
          {image.category && (
            <span className="gallery-card-category">{image.category}</span>
          )}
        </div>
      </div>
      {(image.title || image.location) && (
        <div className="gallery-card-info">
          {image.title && (
            <h4 className="gallery-card-title">{image.title}</h4>
          )}
          {image.location && (
            <span className="gallery-card-location">
              <IconMapPin size={12} />
              {image.location}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════════ */
const GalleryLightbox = memo(({ images, currentIndex, onClose, onNavigate }) => {
  const img = images[currentIndex];
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight") onNavigate(currentIndex + 1);
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [currentIndex, onClose, onNavigate]);

  return (
    <motion.div
      className="gallery-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="gallery-lightbox-close" onClick={onClose}>
        ✕
      </button>
      <button
        className="gallery-lightbox-nav gallery-lightbox-nav--prev"
        disabled={currentIndex === 0}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(currentIndex - 1);
        }}
      >
        <IconChevronLeft size={32} />
      </button>
      <motion.div
        className="gallery-lightbox-content"
        onClick={(e) => e.stopPropagation()}
        layoutId={`gallery-${img.id}`}
      >
        <img
          src={img.src}
          alt={img.alt || img.title}
          className="gallery-lightbox-image"
        />
        {(img.title || img.description) && (
          <div className="gallery-lightbox-info">
            {img.title && <h3>{img.title}</h3>}
            {img.description && <p>{img.description}</p>}
            {img.photographer && (
              <span className="gallery-lightbox-photographer">
                📷 {img.photographer}
              </span>
            )}
          </div>
        )}
      </motion.div>
      <button
        className="gallery-lightbox-nav gallery-lightbox-nav--next"
        disabled={currentIndex === images.length - 1}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(currentIndex + 1);
        }}
      >
        <IconChevronRight size={32} />
      </button>
      <div className="gallery-lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
    SCROLL-INTO-VIEW TESTIMONIALS SLIDER
    ═══════════════════════════════════════════ */
const ScrollIntoViewTestimonials = memo(({ items }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [typedText, setTypedText] = useState("");
  const sectionRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index) => {
    setActiveSlide(index);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAutoPlaying(true);
          } else {
            setIsAutoPlaying(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || reduced || items.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, reduced, items.length]);

  const currentItem = items[activeSlide] || items[0];

  useEffect(() => {
    const text = currentItem?.quote || currentItem?.content || currentItem?.text || currentItem?.testimonial_text || "An unforgettable experience that exceeded all expectations.";

    if (reduced) {
      setTypedText(text);
      return undefined;
    }

    setTypedText("");
    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setTypedText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [currentItem, reduced]);

  const renderStars = (count = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`testimonial-star${i >= count ? ' empty' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div ref={sectionRef} className="testimonials-sliders">
      <div className="testimonials-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
        {items.map((t, i) => (
          <div key={t._id || t.id || i} className="testimonial-slide">
            <div className="testimonial-card">
              <div className="testimonial-image-side">
                <div className="testimonial-curve-sep">
                  <svg viewBox="0 0 50 500" preserveAspectRatio="none">
                    <path d="M50,0 C0,80 50,160 0,250 C50,340 0,420 50,500 L50,0Z" fill="#fff"/>
                  </svg>
                </div>
                <div className="testimonial-image-wrapper">
                  <div className="testimonial-avatar-ring">
                    <img
                      src={t.image || `https://i.pravatar.cc/130?img=${i + 10}`}
                      alt={t.name || 'Traveler'}
                    />
                  </div>
                  <div>
                    <div className="testimonial-customer-name">{t.name || 'Happy Traveler'}</div>
                    <div className="testimonial-customer-role">{t.role || t.location || 'East Africa'}</div>
                    <div className="testimonial-customer-company">🏢 {t.company || t.country || 'Altuvera'}</div>
                  </div>
                </div>
              </div>
              <div className="testimonial-content-side">
                <div className="testimonial-quote-icon">"</div>
                <div className="testimonial-stars">
                  {renderStars(t.stars || t.rating || 5)}
                </div>
                <div className="testimonial-green-bar"></div>
                <div className="testimonial-text">
                  {i === activeSlide ? typedText : (t.quote || t.content || t.text || t.testimonial_text || 'An unforgettable experience that exceeded all expectations.')}
                  {i === activeSlide && !reduced && <span className="testimonial-cursor" aria-hidden="true" />}
                </div>
                <div className="testimonial-content-author">
                  <span className="testimonial-author-line"></span>
                  <span className="testimonial-author-name-text">
                    {t.name || 'Happy Traveler'}, {t.company || t.country || 'East Africa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="testimonials-slider-nav">
        <button
          className="testimonials-nav-btn"
          onClick={prevSlide}
          aria-label="Previous"
        >
          ◀
        </button>
        <div className="testimonials-slider-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`testimonials-dot${i === activeSlide ? ' active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          className="testimonials-nav-btn"
          onClick={nextSlide}
          aria-label="Next"
        >
          ▶
        </button>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */
const Home = () => {
  const { setIsLoading } = useApp();
  const { w: winW } = useWindowSize();
  const isMobile = winW < 768;
  const homeRootRef = useRef(null);
  const hasCompletedRef = useRef(false);

  const [activeProcess, setActiveProcess] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedAdventure, setSelectedAdventure] = useState(null);

  const { destinations: allDest = [], loading: destLoading } = useDestinations({
    limit: 100,
    sort: "-featured",
  });
  const {
    countries = [],
    loading: countriesLoading,
    error: countriesError,
    refetch: refetchCountries,
  } = useCountries({ limit: 8 });
  const { images: galleryImages = [], loading: galleryLoading } = useGallery({
    limit: 12,
    sort: "featured",
  });
  const {
    testimonials: allTestimonials = [],
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useTestimonials();
  const { loadWishlist, toggleWishlist, isWishlisted } = useWishlist();
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  /* Process auto-advance */
  useEffect(() => {
    const t = setInterval(() => setActiveProcess((p) => (p + 1) % 4), 5000);
    return () => clearInterval(t);
  }, []);

  /* Lightbox */
  const openLightbox = useCallback((_, i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const navigateLightbox = useCallback(
    (i) => {
      if (i >= 0 && i < galleryImages.length) setLightboxIndex(i);
    },
    [galleryImages.length]
  );

  /* Preload hero slides */
  useEffect(() => {
    if (hasCompletedRef.current) return;
    if (destLoading) {
      setIsLoading(true);
      return;
    }
    let cancelled = false;
    const preload = (src) =>
      new Promise((r) => {
        const img = new Image();
        img.onload = r;
        img.onerror = r;
        img.src = src;
      });
    const run = async () => {
      setIsLoading(true);
      await new Promise((r) => requestAnimationFrame(r));
      const urls = new Set();
      HERO_SLIDES?.forEach((s) => {
        if (s.image) urls.add(s.image);
        if (s.fallback) urls.add(s.fallback);
      });
      await Promise.all(
        [...urls]
          .filter(Boolean)
          .filter((u) => !u.startsWith("blob:"))
          .slice(0, 5)
          .map(preload)
      );
      if (!cancelled) {
        hasCompletedRef.current = true;
        setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [destLoading, setIsLoading]);

  /* ─── Static Data ─── */
  const adventureTypes = useMemo(
    () => [
      {
        icon: "🦁",
        title: "Safari Adventures",
        description:
          "Witness Africa's incredible wildlife in their natural habitat across stunning national parks.",
        count: "5+ Safaris",
        color: "#F59E0B",
        slug: "safari-adventures",
        filters: ["safari", "wildlife", "savanna", "park"],
        images: [
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
          "https://images.unsplash.com/photo-1534759846116-5799c33ce22a?w=800",
        ],
      },
      {
        icon: "🏔️",
        title: "Mountain Trekking",
        description:
          "Conquer legendary peaks from Kilimanjaro to the Rwenzoris with expert guides.",
        count: "0+ Treks",
        color: "#6366F1",
        slug: "mountain-trekking",
        filters: ["mountain", "trek", "hiking", "climb"],
        images: [
          "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        ],
      },
      {
        icon: "🦍",
        title: "Primate Tracking",
        description:
          "Intimate encounters with endangered mountain gorillas in misty bamboo forests.",
        count: "1+ Experiences",
        color: "#10B981",
        slug: "primate-tracking",
        filters: ["gorilla", "primate", "wildlife", "forest"],
        images: [
          "https://images.unsplash.com/photo-1580674287404-60e2e0fcb95e?w=800",
          "https://i.pinimg.com/736x/47/68/82/476882571830551aee93bee95882881c.jpg",
        ],
      },
      {
        icon: "🏖️",
        title: "Beach Escapes",
        description:
          "Pristine white-sand beaches along the Indian Ocean with world-class resorts.",
        count: "1+ Beaches",
        color: "#EC4899",
        slug: "beach-escapes",
        filters: ["beach", "coast", "island", "ocean"],
        images: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
        ],
      },
      {
        icon: "🎭",
        title: "Cultural Immersion",
        description:
          "Authentic experiences with local communities, ancient traditions, and vibrant ceremonies.",
        count: "1+ Experiences",
        color: "#8B5CF6",
        slug: "cultural-immersion",
        filters: ["culture", "heritage", "community", "traditional"],
        images: [
          "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
          "https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=800",
        ],
      },
      {
        icon: "📸",
        title: "Photography Tours",
        description:
          "Capture award-winning shots on photography-focused expeditions through iconic landscapes.",
        count: "1+ Tours",
        color: "#EF4444",
        slug: "photography-tours",
        filters: ["photography", "camera", "wildlife", "landscape"],
        images: [
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        ],
      },
    ],
    []
  );

  const openAdventureModal = useCallback((adventure) => {
    setSelectedAdventure(adventure);
  }, []);

  const closeAdventureModal = useCallback(() => {
    setSelectedAdventure(null);
  }, []);

  const matchedDestinations = useMemo(() => {
    if (!selectedAdventure) return [];

    const terms = (selectedAdventure.filters || []).map((term) => String(term).toLowerCase());
    const normalized = (value) => String(value || "").toLowerCase();

    return allDest.filter((destination) => {
      const haystack = [
        destination.category,
        destination.experienceCategory,
        destination.adventureCategory,
        destination.classification,
        destination.destinationType,
        destination.name,
        destination.tagline,
      ]
        .map(normalized)
        .join(" ");

      return terms.some((term) => haystack.includes(term));
    });
  }, [allDest, selectedAdventure]);

  const processSteps = useMemo(
    () => [
      {
        step: "01",
        title: "Dream & Discover",
        description:
          "Share your travel aspirations with our experts. Whether it's the Great Migration, Kilimanjaro, or a hidden beach paradise — we listen and begin crafting possibilities.",
        icon: IconCompass,
        image:
          "https://i.pinimg.com/736x/59/86/5b/59865b2946331b97477e3425c60b7d4d.jpg",
      },
      {
        step: "02",
        title: "Design & Customize",
        description:
          "Our travel architects craft a bespoke itinerary tailored to your interests, budget, and timeline. Every detail hand-selected.",
        icon: IconMap,
        image:
          "https://previews.123rf.com/images/sebra/sebra1703/sebra170300196/74246858-travel-planning-concept-on-map.jpg",
      },
      {
        step: "03",
        title: "Prepare & Pack",
        description:
          "Receive your comprehensive travel guide with packing lists, cultural tips, health advisories, and insider recommendations.",
        icon: IconBookOpen,
        image:
          "https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?w=800",
      },
      {
        step: "04",
        title: "Experience & Remember",
        description:
          "Embark on your adventure with confidence, supported by local guides and 24/7 assistance. Create memories that last a lifetime.",
        icon: IconSun,
        image:
          "https://i.pinimg.com/736x/13/bd/69/13bd691c2d9e85cb5009a3d9485d4c94.jpg",
      },
    ],
    []
  );

  /* ═══ RENDER ═══ */
  return (
    <div ref={homeRootRef} className="home-root">
      <ScrollProgress />

      {/* ── HERO ── */}
      <Hero />

      {/* ── INTRODUCTION ── */}
      <section className="home-section intro-section">
        <div className="blob blob--green-1" />
        <div className="blob blob--green-2" />
        <div className="home-container">
          <div className="intro-grid">
            <div className="intro-content">
              <TextReveal>
                <h1 className="intro-heading">
                  Discover the{" "}
                  <span className="text-gradient">Untamed Magic</span> of East
                  Africa
                </h1>
              </TextReveal>
              <TextReveal delay={0.14}>
                <p className="intro-quote">
                  "Where the wild horizon meets your deepest sense of wonder"
                </p>
              </TextReveal>
              {[
                'For over fifteen years, Altuvera has been the trusted compass for discerning travelers seeking extraordinary encounters in East Africa. We architect <strong>transformative journeys</strong> that weave the thunder of the Great Migration, the gentle gaze of silverback gorillas, and the warmth of Maasai campfires under star-filled skies.',
                'Our locally-born guides share an unshakable commitment to <strong>sustainable, community-driven tourism</strong>. Every safari dollar funds wildlife corridors. Every cultural visit empowers local artisans.',
              ].map((text, i) => (
                <TextReveal key={i} delay={0.18 + i * 0.06}>
                  <p
                    className="intro-paragraph"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </TextReveal>
              ))}
              <TextReveal delay={0.32}>
                <div className="intro-cta-row">
                  <MagneticWrap>
                    <Button
                      to="/about"
                      variant="primary"
                      icon={<IconArrowRight size={17} />}
                    >
                      Our Story
                    </Button>
                  </MagneticWrap>
                  <MagneticWrap>
                    <Button to="/destinations" variant="outline">
                      Browse Destinations
                    </Button>
                  </MagneticWrap>
                </div>
              </TextReveal>
              <TextReveal delay={0.4}>
                <div className="intro-stats">
                  <div className="intro-stat">
                    <span className="intro-stat-value">
                      <Counter end={15} suffix="+" />
                    </span>
                    <span className="intro-stat-label">Years Experience</span>
                  </div>
                  <div className="intro-stat">
                    <span className="intro-stat-value">
                      <Counter end={5000} suffix="+" />
                    </span>
                    <span className="intro-stat-label">Happy Travelers</span>
                  </div>
                  <div className="intro-stat">
                    <span className="intro-stat-value">
                      <Counter end={countries.length || 10} suffix="+" />
                    </span>
                    <span className="intro-stat-label">Countries</span>
                  </div>
                </div>
              </TextReveal>
            </div>
            <AnimatedSection animation="rotateIn" delay={0.2}>
              <div className="intro-image-collage">
                <div className="intro-image-main">
<img
                     src="https://i.pinimg.com/736x/c2/26/91/c22691ef2c1f5a1e9544ec1e62774740.jpg"
                     alt="African Safari"
                     loading="lazy"
                   /></div>
                 {!isMobile && (
                  <div className="intro-image-stack">
                    <motion.div
                      className="intro-image-stack-item"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1549366021-9f761d450615?w=400"
                        alt="Wildlife"
                        loading="lazy"
                      />
                    </motion.div>
                    <motion.div
                      className="intro-image-stack-item"
                      animate={{ y: [0, 8, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400"
                        alt="Safari"
                        loading="lazy"
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="home-section destinations-section">
        <div className="blob blob--teal" />
        <div className="home-container">
            <AnimatedSection animation="blurIn">
            <div className="section-header">
              <h2 className="section-title">
                Handpicked <span className="text-gradient">Destinations</span>
              </h2>
              <p className="section-subtitle">
                From the endless plains of the Serengeti to the pristine shores
                of Zanzibar, discover destinations that ignite the soul.
              </p>
            </div>
          </AnimatedSection>
          <StaggerWrap stagger={0.08} className="destinations-grid">
            {allDest.slice(0, 6).map((d, i) => (
              <StaggerChild key={d?._id || d?.slug || i}>
                <DestinationCard
                  destination={d}
                  isWishlisted={isWishlisted(d?._id || d?.id || d?.slug)}
                  onWishlistToggle={toggleWishlist}
                />
              </StaggerChild>
            ))}
          </StaggerWrap>
          <AnimatedSection animation="fadeInUp">
            <div className="section-cta">
              <MagneticWrap>
                <Button
                  to="/destinations"
                  variant="primary"
                  size="large"
                  icon={<IconArrowRight size={18} />}
                >
                  View All Destinations
                </Button>
              </MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── COUNTRIES ── */}
      <section className="home-section countries-section">
        <div className="blob blob--emerald" />
        <div className="home-container">
            <AnimatedSection animation="blurIn">
            <div className="section-header">
              <h2 className="section-title">
                Discover <span className="text-gradient">East Africa</span>
              </h2>
              <p className="section-subtitle">
                From the savannas of Kenya to the beaches of Zanzibar, each
                country offers unique adventures waiting to be explored.
              </p>
            </div>
          </AnimatedSection>
          {countriesLoading ? (
            <>
              <CountriesMessage type="loading" />
              <CountriesSkeleton count={isMobile ? 2 : 4} />
            </>
          ) : countriesError ? (
            <CountriesMessage
              type="error"
              error={countriesError}
              onRetry={refetchCountries}
            />
          ) : countries.length === 0 ? (
            <CountriesMessage type="empty" onRetry={refetchCountries} />
          ) : (
            <StaggerWrap stagger={0.08} className="countries-grid">
              {countries.slice(0, isMobile ? 4 : 8).map((country, i) => (
                <StaggerChild key={country.id || country.slug || i}>
                  <CountryCard country={country} index={i} />
                </StaggerChild>
              ))}
            </StaggerWrap>
          )}
          {!countriesLoading && !countriesError && countries.length > 0 && (
            <AnimatedSection animation="fadeInUp">
              <div className="section-cta">
                <MagneticWrap>
                  <Button
                    to="/countries"
                    variant="outline"
                    size="large"
                    icon={<IconArrowRight size={18} />}
                  >
                    View All Countries
                  </Button>
                </MagneticWrap>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ── ADVENTURE TYPES ── */}
      <section className="home-section adventures-section">
        <div className="home-container">
            <AnimatedSection animation="perspectiveIn">
            <div className="section-header">
              <h2 className="section-title">
                Choose Your <span className="text-gradient">Adventure</span>
              </h2>
              <p className="section-subtitle">
                Six categories of extraordinary experiences, each crafted to
                deliver the Africa you've always dreamed of.
              </p>
            </div>
          </AnimatedSection>
          <div className="adventures-grid-v2">
            {adventureTypes.map((a, i) => (
              <AdventureCard key={a.title} adventure={a} index={i} onOpen={openAdventureModal} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section process-section">
        <div className="home-container">
            <AnimatedSection animation="perspectiveIn">
            <div className="section-header">
              <h2 className="section-title">
                Your Journey in{" "}
                <span className="text-gradient">Four Simple Steps</span>
              </h2>
              <p className="section-subtitle">
                From inspiration to stepping onto African soil, we make every
                step seamless.
              </p>
            </div>
          </AnimatedSection>
          <div className="process-layout">
            <AnimatedSection animation="fadeInLeft">
              <div className="process-tabs-panel">
                {processSteps.map((s, i) => (
                  <button
                    key={i}
                    className={`process-tab${activeProcess === i ? " active" : ""}`}
                    onClick={() => setActiveProcess(i)}
                  >
                    <div className="process-tab-header">
                      <motion.div
                        animate={{
                          background:
                            activeProcess === i ? "#059669" : "#F1F5F9",
                          color: activeProcess === i ? "#fff" : "#94A3B8",
                        }}
                        transition={{ duration: 0.4 }}
                        className="process-tab-icon"
                      >
                        <s.icon size={19} />
                      </motion.div>
                      <div>
                        <div className="process-tab-step">Step {s.step}</div>
                        <div
                          className={`process-tab-title${
                            activeProcess === i
                              ? " process-tab-title--active"
                              : ""
                          }`}
                        >
                          {s.title}
                        </div>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      {activeProcess === i && (
                        <motion.p
                          key="desc"
                          className="process-tab-desc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {s.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
                <div className="process-progress-bar-track">
                  <motion.div
                    className="process-progress-bar-fill"
                    animate={{
                      width: `${
                        ((activeProcess + 1) / processSteps.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeInRight">
              <div className="process-image-panel">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProcess}
                    className="process-image-container"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.55 }}
                  >
                    <img
                      src={processSteps[activeProcess].image}
                      alt={processSteps[activeProcess].title}
                      loading="lazy"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="process-image-overlay" />
                <motion.div
                  key={`cap-${activeProcess}`}
                  className="process-image-caption"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.55, delay: 0.18 }}
                >
                  <span className="process-caption-step">
                    Step {processSteps[activeProcess].step}
                  </span>
                  <div className="process-caption-title">
                    {processSteps[activeProcess].title}
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
</section>

       {/* ── GALLERY ── */}
       <section className="home-section gallery-section">
        <div className="home-container">
        <AnimatedSection animation="fadeInUp">
            <div className="section-header">
              <h2 className="section-title">
                Africa Through <span className="text-gradient">Our Lens</span>
              </h2>
              <p className="section-subtitle">
                Every image tells a story of wonder, connection, and discovery.
                Real moments captured on real journeys.
              </p>
            </div>
          </AnimatedSection>
          {galleryLoading ? (
            <div className="gallery-grid-home">
              {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`gallery-grid-item${
                    i === 0 ? " gallery-grid-item--large" : ""
                  }`}
                >
                  <div
                    className="skeleton-shimmer"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 180,
                      borderRadius: 16,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : galleryImages.length > 0 ? (
            <>
              <div className="gallery-grid-home">
                {galleryImages.slice(0, isMobile ? 6 : 9).map((image, i) => (
                  <div
                    key={image.id}
                    className={`gallery-grid-item${
                      i === 0 ? " gallery-grid-item--large" : ""
                    }${i === 3 ? " gallery-grid-item--tall" : ""}`}
                  >
                    <GalleryCard image={image} index={i} onClick={openLightbox} />
                  </div>
                ))}
              </div>
              <AnimatedSection animation="fadeInUp">
                <div className="section-cta">
                  <MagneticWrap>
                    <Button
                      to="/gallery"
                      variant="outline"
                      size="large"
                      icon={<IconCamera size={18} />}
                    >
                      Explore Full Gallery
                    </Button>
                  </MagneticWrap>
                </div>
              </AnimatedSection>
            </>
          ) : (
            <div className="gallery-empty">
              <span className="gallery-empty-icon">📸</span>
              <p>
                Our gallery is coming soon. Check back for stunning African
                landscapes.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="home-section testimonials-section">
        <div className="home-container">
          <AnimatedSection animation="fadeInUp">
            <div className="section-header">
              <h2 className="section-title">
                What Our Travelers{" "}
                <span className="text-gradient">Say</span>
              </h2>
              <p className="section-subtitle">
                Real stories from adventurers who've experienced East Africa
                with Altuvera.
              </p>
            </div>
          </AnimatedSection>
          {testimonialsLoading ? (
            <div className="testimonials-loading">
              <div className="testimonials-row">
                {Array.from({ length: 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="testimonial-card testimonial-card--skeleton"
                  >
                    <div className="skeleton-shimmer" style={{ height: 200, borderRadius: 24 }} />
                  </div>
                ))}
              </div>
            </div>
          ) : testimonialsError ? (
            <div className="testimonials-error">
              <div className="testimonials-error-icon">⚠️</div>
              <h3 className="testimonials-error-title">
                Unable to Load Reviews
              </h3>
              <p className="testimonials-error-desc">
                We're having trouble loading testimonials right now. Please try
                again later.
              </p>
            </div>
          ) : allTestimonials.length > 0 ? (
            <ScrollIntoViewTestimonials items={allTestimonials} />
          ) : (
            <div className="testimonials-empty-state">
              <div className="testimonials-empty-icon">💬</div>
              <h3 className="testimonials-empty-title">Reviews Coming Soon</h3>
              <p className="testimonials-empty-desc">
                We're collecting amazing stories from our travelers. Check back
                soon!
              </p>
            </div>
          )}
         </div>
       </section>

      {/* Newsletter section removed intentionally for a more polished homepage */}

      {/* ── FINAL CTA ── */}
      <ParallaxSection
        image="https://i.pinimg.com/736x/2f/e4/bf/2fe4bffc3c384f4744669a6807620a6d.jpg"
        height="82vh"
        overlay="linear-gradient(135deg, rgba(2,44,34,.93) 0%, rgba(5,150,105,.82) 100%)"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75, type: "spring", bounce: 0.32 }}
        >
          <div className="cta-compass-icon">
            <IconCompass size={28} color="white" />
          </div>
        </motion.div>
        <SplitText className="cta-title">
          Your East African Adventure Awaits
        </SplitText>
        <TextReveal delay={0.28}>
          <p className="cta-subtitle">
            Let our team design your perfect journey through the heart of
            Africa. From thundering wildebeest crossings to the quiet wonder of
            a gorilla's gaze — your story begins here.
          </p>
        </TextReveal>
        <TextReveal delay={0.4}>
          <p className="cta-note">
            Join 5,000+ travelers who've discovered what makes Altuvera truly
            unforgettable.
          </p>
        </TextReveal>
        <TextReveal delay={0.5}>
          <div className="cta-btn-row">
            <MagneticWrap>
              <Button
                to="/booking"
                variant="white"
                size="large"
                icon={<IconArrowRight size={18} />}
              >
                Start Planning Now
              </Button>
            </MagneticWrap>
            <MagneticWrap>
              <Button to="/contact" variant="outline" size="large">
                Speak to an Expert
              </Button>
            </MagneticWrap>
          </div>
        </TextReveal>
      </ParallaxSection>

      {/* ── ADVENTURE MODAL ── */}
      <AnimatePresence>
        {selectedAdventure && (
          <motion.div
            className="adventure-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAdventureModal}
          >
            <motion.div
              className="adventure-modal-card"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="adventure-modal-close"
                onClick={closeAdventureModal}
                aria-label="Close adventure details"
              >
                ×
              </button>
              <div className="adventure-modal-hero">
                <img
                  src={selectedAdventure.images?.[0] || "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200"}
                  alt={selectedAdventure.title}
                  className="adventure-modal-hero-img"
                />
                <div className="adventure-modal-hero-copy">
                  <p className="adventure-modal-label">Choose Your Adventure</p>
                  <h3 className="adventure-modal-title">{selectedAdventure.title}</h3>
                  <p className="adventure-modal-copy">{selectedAdventure.description}</p>
                </div>
              </div>

              <div className="adventure-modal-body">
                <div>
                  <h4 className="adventure-modal-subtitle">Available destinations</h4>
                  <p className="adventure-modal-text">
                    Live results from our backend, grouped by the same adventure category you selected.
                  </p>
                </div>
                <div className="adventure-modal-destinations">
                  {matchedDestinations.length > 0 ? (
                    matchedDestinations.slice(0, 6).map((destination) => (
                      <Link
                        key={destination.slug || destination.id}
                        to={`/destinations/${destination.slug || destination.id}`}
                        className="adventure-modal-destination-card"
                        onClick={closeAdventureModal}
                      >
                        <img
                          src={destination.imageUrl || destination.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"}
                          alt={destination.name}
                          className="adventure-modal-destination-img"
                        />
                        <div className="adventure-modal-destination-copy">
                          <p className="adventure-modal-destination-category">{destination.category || "Adventure"}</p>
                          <h5 className="adventure-modal-destination-title">{destination.name}</h5>
                          <p className="adventure-modal-destination-desc">{destination.shortDescription || destination.description}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="adventure-modal-empty">No matching destinations are available yet for this adventure. Please try another category.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxOpen && galleryImages.length > 0 && (
          <GalleryLightbox
            images={galleryImages}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;