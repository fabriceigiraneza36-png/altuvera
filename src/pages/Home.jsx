import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiStar,
  FiMapPin,
  FiCamera,
  FiUsers,
  FiAward,
  FiHeart,
  FiShield,
  FiClock,
  FiGlobe,
  FiCompass,
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiMaximize2,
  FiMap,
  FiSun,
  FiTarget,
  FiBookOpen,
  FiZap,
  FiEye,
  FiX,
  FiChevronDown,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import Hero from "../components/home/Hero";
import Statistics from "../components/home/Statistics";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { testimonials } from "../data/testimonials";
import { services } from "../data/services";
import { posts } from "../data/posts";
import { countries } from "../data/countries";
import { getAllDestinations } from "../data/destinations";
import ImageCycle from "../components/common/ImageCycle";
import { useScrollTriggeredSlide } from "../hooks/useScrollTriggeredSlide";

/* ═══════════════════════════════════════════
   UTILITY: Reduced Motion Hook
   ═══════════════════════════════════════════ */
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
};

/* ═══════════════════════════════════════════
   UTILITY: Window Size Hook
   ═══════════════════════════════════════════ */
const useWindowSize = () => {
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1200, h: typeof window !== "undefined" ? window.innerHeight : 800 });
  useEffect(() => {
    let raf;
    const handle = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener("resize", handle);
    return () => { window.removeEventListener("resize", handle); cancelAnimationFrame(raf); };
  }, []);
  return size;
};

/* ═══════════════════════════════════════════
   COMPONENT: Scroll Progress Bar
   ═══════════════════════════════════════════ */
const ScrollProgress = memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #059669, #10B981, #34D399)",
        transformOrigin: "0%", scaleX, zIndex: 9999,
      }}
    />
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Magnetic Wrapper
   ═══════════════════════════════════════════ */
const MagneticWrap = memo(({ children, strength = 0.25, scale = 1.02 }) => {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });
  const springScale = useSpring(1, { stiffness: 300, damping: 20 });

  const handleMove = useCallback((e) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
    springScale.set(scale);
  }, [reduced, strength, scale, x, y, springScale]);

  const handleLeave = useCallback(() => {
    x.set(0); y.set(0); springScale.set(1);
  }, [x, y, springScale]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: "inline-block", x: springX, y: springY, scale: springScale }}
    >
      {children}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Animated Counter
   ═══════════════════════════════════════════ */
const Counter = memo(({ end, suffix = "", duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(parseInt(end, 10));
  }, [inView, end, motionVal]);

  useMotionValueEvent(springVal, "change", (v) => {
    setDisplay(Math.round(v).toLocaleString());
  });

  return <span ref={ref}>{display}{suffix}</span>;
});

/* ═══════════════════════════════════════════
   COMPONENT: Text Reveal (line-by-line)
   ═══════════════════════════════════════════ */
const TextReveal = memo(({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div>{children}</div>;
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ y: "110%", opacity: 0, rotateX: -15 }}
        animate={inView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Split Text Reveal (word-by-word)
   ═══════════════════════════════════════════ */
const SplitText = memo(({ children, className, style, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = usePrefersReducedMotion();
  const words = typeof children === "string" ? children.split(" ") : [children];

  if (reduced) return <span className={className} style={style}>{children}</span>;

  return (
    <span ref={ref} className={className} style={{ ...style, display: "inline" }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.3em" }}>
          <motion.span
            initial={{ y: "120%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: delay + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Stagger Container / Item
   ═══════════════════════════════════════════ */
const StaggerWrap = memo(({ children, stagger = 0.08, className, style }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref} className={className} style={style}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: stagger } }, hidden: {} }}
    >
      {children}
    </motion.div>
  );
});

const StaggerChild = memo(({ children, style }) => (
  <motion.div
    style={style}
    variants={{
      hidden: { opacity: 0, y: 60, scale: 0.94, filter: "blur(4px)" },
      visible: {
        opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      },
    }}
  >
    {children}
  </motion.div>
));

/* ═══════════════════════════════════════════
   COMPONENT: 3D Perspective Card
   ═══════════════════════════════════════════ */
const PerspectiveCard = memo(({ children, style, className, intensity = 12 }) => {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const isHovered = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 300, damping: 25 });
  const springRy = useSpring(ry, { stiffness: 300, damping: 25 });
  const springHover = useSpring(isHovered, { stiffness: 200, damping: 20 });

  const handleMove = useCallback((e) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    rx.set((y - 0.5) * -intensity);
    ry.set((x - 0.5) * intensity);
    gx.set(x * 100);
    gy.set(y * 100);
    isHovered.set(1);
  }, [reduced, intensity, rx, ry, gx, gy, isHovered]);

  const handleLeave = useCallback(() => {
    rx.set(0); ry.set(0); gx.set(50); gy.set(50); isHovered.set(0);
  }, [rx, ry, gx, gy, isHovered]);

  const shadow = useTransform(springHover, [0, 1], [
    "0 4px 24px rgba(0,0,0,0.06)",
    "0 30px 60px rgba(5,150,105,0.18)",
  ]);
  const translateY = useTransform(springHover, [0, 1], [0, -8]);

  return (
    <motion.div
      ref={ref} className={className}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        ...style, perspective: 900, transformStyle: "preserve-3d",
        rotateX: springRx, rotateY: springRy,
        boxShadow: shadow, y: translateY, position: "relative",
      }}
    >
      {children}
      <motion.div
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", zIndex: 20,
          opacity: springHover,
          background: useTransform(
            [gx, gy],
            ([gxVal, gyVal]) => `radial-gradient(circle at ${gxVal}% ${gyVal}%, rgba(255,255,255,0.18), transparent 55%)`
          ),
        }}
      />
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Parallax Section
   ═══════════════════════════════════════════ */
const ParallaxSection = memo(({ image, children, height = "75vh", overlay, id }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = usePrefersReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-20%", "20%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.3, 1.05, 1.2]);
  const contentOp = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], reduced ? [0, 0, 0, 0] : [90, 0, 0, -90]);

  return (
    <section ref={ref} id={id} style={{ position: "relative", height, minHeight: 480, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div style={{ position: "absolute", inset: "-30%", backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center", y, scale, willChange: "transform" }} />
      <div style={{ position: "absolute", inset: 0, background: overlay || "linear-gradient(135deg, rgba(2,44,34,.88) 0%, rgba(5,150,105,.72) 100%)" }} />
      <motion.div style={{ position: "relative", zIndex: 2, opacity: contentOp, y: contentY, width: "100%", maxWidth: 920, padding: "0 24px", textAlign: "center" }}>
        {children}
      </motion.div>
    </section>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Image Lazy Loader with blur
   ═══════════════════════════════════════════ */
const LazyImage = memo(({ src, alt, style, className }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "200px" });

  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden", ...style }} className={className}>
      {/* Placeholder */}
      <div style={{
        position: "absolute", inset: 0, background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
        filter: "blur(0px)", transition: "opacity 0.5s ease",
        opacity: loaded ? 0 : 1, zIndex: 1,
      }} />
      {inView && (
        <motion.img
          src={src} alt={alt}
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          className={className}
          loading="lazy"
        />
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Gallery Lightbox
   ═══════════════════════════════════════════ */
const GalleryLightbox = memo(({ images, activeIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose, onNext, onPrev]);

  const img = images[activeIndex];
  if (!img) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.92)", backdropFilter: "blur(20px)" }}
      onClick={onClose}
    >
      <motion.button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "absolute", top: 24, right: 24, width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} whileHover={{ scale: 1.1, background: "rgba(255,255,255,.2)" }}>
        <FiX size={22} />
      </motion.button>

      <motion.button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: "absolute", left: 24, width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} whileHover={{ scale: 1.1 }}>
        <FiChevronLeft size={24} />
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "85vw", maxHeight: "85vh", position: "relative" }}
        >
          <img src={img.src} alt={img.alt} style={{ maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }} />
          <div style={{ textAlign: "center", marginTop: 16, color: "white" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{img.alt}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><FiMapPin size={13} /> {img.location}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: "absolute", right: 24, width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} whileHover={{ scale: 1.1 }}>
        <FiChevronRight size={24} />
      </motion.button>

      {/* Thumbnails */}
      <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 8, justifyContent: "center", overflowX: "auto", maxWidth: "80vw", padding: "0 20px" }}>
        {images.map((im, i) => (
          <motion.div
            key={i}
            onClick={(e) => { e.stopPropagation(); /* handled by parent */ }}
            style={{
              width: 52, height: 38, borderRadius: 8, overflow: "hidden", cursor: "pointer",
              border: i === activeIndex ? "2px solid #10B981" : "2px solid transparent",
              opacity: i === activeIndex ? 1 : 0.5, transition: "all .3s",
              flexShrink: 0,
            }}
          >
            <img src={im.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COUNTRY FLAGS
   ═══════════════════════════════════════════ */
const FLAG_MAP = {
  kenya: "🇰🇪", tanzania: "🇹🇿", uganda: "🇺🇬", rwanda: "🇷🇼",
  ethiopia: "🇪🇹", "democratic republic of congo": "🇨🇩", drc: "🇨🇩",
  burundi: "🇧🇮", "south sudan": "🇸🇸", somalia: "🇸🇴",
  mozambique: "🇲🇿", madagascar: "🇲🇬", malawi: "🇲🇼",
  zambia: "🇿🇲", zimbabwe: "🇿🇼", botswana: "🇧🇼",
  "south africa": "🇿🇦", namibia: "🇳🇦", ghana: "🇬🇭",
  nigeria: "🇳🇬", egypt: "🇪🇬", morocco: "🇲🇦", senegal: "🇸🇳",
  congo: "🇨🇩", sudan: "🇸🇩", seychelles: "🇸🇨",
};
const getFlag = (name) => {
  if (!name) return "🌍";
  const lower = name.toLowerCase();
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (lower.includes(key)) return flag;
  }
  return "🌍";
};

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */
const Home = () => {
  const reduced = usePrefersReducedMotion();
  const { w: winW } = useWindowSize();
  const isMobile = winW < 768;
  const isTablet = winW < 1024;

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeProcess, setActiveProcess] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIdx, setLightboxIdx] = useState(-1);

  const allDestinations = useMemo(() => {
    try { const d = getAllDestinations(); return Array.isArray(d) ? d : []; }
    catch { return []; }
  }, []);

  const countryList = useMemo(() => {
    try { return Array.isArray(countries) ? countries : []; }
    catch { return []; }
  }, []);

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((p) => (p + 1) % (testimonials?.length || 1));
  }, []);
  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((p) => (p - 1 + (testimonials?.length || 1)) % (testimonials?.length || 1));
  }, []);
  const testimonialRef = useScrollTriggeredSlide(nextTestimonial, 250);

  useEffect(() => {
    const t = setInterval(nextTestimonial, 6000);
    return () => clearInterval(t);
  }, [nextTestimonial]);

  useEffect(() => {
    const t = setInterval(() => setActiveProcess((p) => (p + 1) % 4), 5000);
    return () => clearInterval(t);
  }, []);

  const handleNewsletter = useCallback((e) => {
    e.preventDefault();
    if (email) { setIsSubscribed(true); setEmail(""); setTimeout(() => setIsSubscribed(false), 5000); }
  }, [email]);

  const getDestImg = useCallback((d) => d?.image || d?.images?.[0] || d?.heroImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800", []);

  /* ─── Data ─── */
  const adventureTypes = useMemo(() => [
    { icon: "🦁", title: "Safari Adventures", description: "Witness Africa's incredible wildlife in their natural habitat across stunning national parks and vast golden savannahs stretching to the horizon.", count: "50+ Safaris", color: "#F59E0B", image: services?.[0]?.image || "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600" },
    { icon: "🏔️", title: "Mountain Trekking", description: "Conquer legendary peaks from Kilimanjaro to the Rwenzoris with expert guides and unforgettable summit experiences above the clouds.", count: "15+ Treks", color: "#6366F1", image: services?.[1]?.image || "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600" },
    { icon: "🦍", title: "Primate Tracking", description: "Intimate encounters with endangered mountain gorillas and chimpanzees in the misty bamboo forests of Uganda and Rwanda.", count: "10+ Experiences", color: "#10B981", image: services?.[2]?.image || "https://images.unsplash.com/photo-1580674287404-60e2e0fcb95e?w=600" },
    { icon: "🏖️", title: "Beach Escapes", description: "Pristine white-sand beaches along the Indian Ocean coast with world-class resorts and hidden tropical island paradises.", count: "20+ Beaches", color: "#EC4899", image: services?.[3]?.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600" },
    { icon: "🎭", title: "Cultural Immersion", description: "Authentic experiences with local communities, ancient tribal traditions, and vibrant ceremonies that connect you to Africa's soul.", count: "30+ Experiences", color: "#8B5CF6", image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600" },
    { icon: "📸", title: "Photography Tours", description: "Capture award-winning shots with professional photography-focused expeditions through the world's most photogenic landscapes.", count: "12+ Tours", color: "#EF4444", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600" },
  ], []);

  const features = useMemo(() => [
    { icon: FiAward, title: "Expert Local Guides", description: "Our certified professionals possess deep regional knowledge passed down through generations, ensuring authentic journeys you won't find in any guidebook.", accent: "#F59E0B" },
    { icon: FiShield, title: "Safety Guaranteed", description: "Comprehensive safety protocols, satellite communication, medical kits, and 24/7 on-ground support give you complete peace of mind.", accent: "#3B82F6" },
    { icon: FiHeart, title: "Personalized Journeys", description: "Every itinerary is handcrafted to match your unique interests, pace, and travel style — no cookie-cutter experiences, ever.", accent: "#EC4899" },
    { icon: FiGlobe, title: "Sustainable Tourism", description: "Our eco-friendly practices protect the very landscapes and communities that make East Africa extraordinary for generations to come.", accent: "#10B981" },
    { icon: FiUsers, title: "Small Group Sizes", description: "With a maximum of 12 guests per expedition, enjoy intimate wildlife encounters and personalized attention from your dedicated guide.", accent: "#8B5CF6" },
    { icon: FiClock, title: "Flexible Booking", description: "Life happens — that's why we offer easy date changes, flexible payment plans, and free cancellation up to 30 days before departure.", accent: "#F97316" },
  ], []);

  const processSteps = useMemo(() => [
    { step: "01", title: "Dream & Discover", description: "Share your travel aspirations with our experts. Whether it's the Great Migration, summiting Kilimanjaro, or a hidden beach paradise — we listen to every detail of your dream journey and begin shaping possibilities.", icon: FiCompass, image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800" },
    { step: "02", title: "Design & Customize", description: "Our travel architects craft a bespoke itinerary tailored to your interests, budget, and timeline. Every accommodation, activity, and transfer is hand-selected for quality, authenticity, and unforgettable impact.", icon: FiMap, image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800" },
    { step: "03", title: "Prepare & Pack", description: "Receive your comprehensive travel guide with packing lists, cultural tips, health advisories, visa guidance, and insider recommendations. Our concierge team handles every logistical detail seamlessly.", icon: FiBookOpen, image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800" },
    { step: "04", title: "Experience & Remember", description: "Embark on your adventure with confidence, supported by local guides and 24/7 assistance. Create memories that last a lifetime and stories you'll share for generations to come.", icon: FiSun, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" },
  ], []);

  const galleryImages = useMemo(() => [
    { src: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=900", alt: "Lion Pride at Dawn", location: "Serengeti, Tanzania", category: "Wildlife", h: 420 },
    { src: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=900", alt: "Kilimanjaro Sunrise", location: "Amboseli, Kenya", category: "Landscapes", h: 280 },
    { src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900", alt: "Elephant Migration", location: "Tsavo, Kenya", category: "Wildlife", h: 340 },
    { src: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=900", alt: "Zanzibar Paradise", location: "Zanzibar, Tanzania", category: "Landscapes", h: 300 },
    { src: "https://images.unsplash.com/photo-1580674287404-60e2e0fcb95e?w=900", alt: "Mountain Gorilla", location: "Bwindi, Uganda", category: "Wildlife", h: 440 },
    { src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900", alt: "Maasai Ceremony", location: "Masai Mara, Kenya", category: "Culture", h: 260 },
    { src: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=900", alt: "Summit Glory", location: "Kilimanjaro, Tanzania", category: "Adventure", h: 360 },
    { src: "https://images.unsplash.com/photo-1553775282-20af80779df7?w=900", alt: "Savannah Sunset", location: "Serengeti, Tanzania", category: "Landscapes", h: 320 },
    { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900", alt: "Crater Highlands", location: "Ngorongoro, Tanzania", category: "Adventure", h: 380 },
  ], []);

  const galleryCats = useMemo(() => ["All", "Wildlife", "Landscapes", "Culture", "Adventure"], []);
  const filteredGallery = useMemo(() =>
    galleryFilter === "All" ? galleryImages : galleryImages.filter((g) => g.category === galleryFilter),
  [galleryFilter, galleryImages]);

  const signatureExperiences = useMemo(() => [
    { title: "The Great Migration", subtitle: "Serengeti & Masai Mara", description: "Witness over two million wildebeest, zebras, and gazelles thundering across the plains in nature's most spectacular wildlife event. Our expert guides position you at the best river crossings and calving grounds for front-row seats to this ancient drama that has played out for millennia.", image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200", stats: { Duration: "7–14 Days", Group: "Max 8 Guests", Rating: "4.9/5" } },
    { title: "Gorilla Trekking", subtitle: "Bwindi & Volcanoes NP", description: "Trek through emerald bamboo forests to sit just meters from a family of endangered mountain gorillas. With fewer than 1,000 remaining in the wild, this is one of the planet's most humbling and transformative wildlife encounters — a moment that will reshape your understanding of our connection to nature.", image: "https://images.unsplash.com/photo-1580674287404-60e2e0fcb95e?w=1200", stats: { Duration: "3–5 Days", Group: "Max 6 Guests", Rating: "5.0/5" } },
    { title: "Kilimanjaro Summit", subtitle: "Roof of Africa", description: "Stand on the highest point in Africa at 5,895 meters as the sun rises over the continent. Our experienced mountain guides, premium equipment, and carefully planned acclimatization schedules ensure the highest summit success rates in the industry. This is more than a climb — it's a personal transformation.", image: "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=1200", stats: { Duration: "6–9 Days", Group: "Max 10 Guests", Rating: "4.8/5" } },
  ], []);

  const partners = useMemo(() => [
    { name: "TripAdvisor", badge: "⭐ Excellence 2024" },
    { name: "ATTA", badge: "🌍 Certified Member" },
    { name: "Eco-Tourism", badge: "🌱 Gold Certified" },
    { name: "SafariBookings", badge: "🏆 Top Rated" },
    { name: "Lonely Planet", badge: "📘 Recommended" },
  ], []);

  const quickStats = useMemo(() => [
    { number: "15", suffix: "+", label: "Years Experience" },
    { number: "50000", suffix: "+", label: "Happy Travelers" },
    { number: "500", suffix: "+", label: "Destinations" },
    { number: "98", suffix: "%", label: "Satisfaction" },
  ], []);

  /* ═════════════════ RENDER ═════════════════ */
  return (
    <div style={{ overflowX: "hidden" }}>
      <ScrollProgress />

      {/* ─── Global Styles ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}

        @keyframes floatSoft{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(1deg)}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes morphBlob{0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}25%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}50%{border-radius:50% 60% 30% 60%/30% 70% 40% 60%}75%{border-radius:60% 40% 60% 40%/70% 30% 50% 60%}100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}}

        .tg{background:linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sp{padding:clamp(80px,10vw,140px) 24px}
        .ctr{max-width:1400px;margin:0 auto;position:relative;z-index:1}
        .sh{text-align:center;margin-bottom:clamp(48px,6vw,72px)}
        .sl{display:inline-flex;align-items:center;gap:8px;padding:10px 22px;background:rgba(5,150,105,.08);border-radius:50px;color:#059669;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px}
        .sl-d{background:rgba(255,255,255,.08);color:#34D399}
        .st{font-family:'Playfair Display',serif;font-size:clamp(30px,4vw,50px);font-weight:800;color:#0F172A;margin-bottom:16px;line-height:1.16}
        .ss{font-size:clamp(15px,1.6vw,18px);color:#64748B;max-width:700px;margin:0 auto;line-height:1.8}

        .lr{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#059669,#10B981,#34D399);transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.4,0,.2,1)}
        .ch:hover .lr{transform:scaleX(1)}
        .iz{transition:transform .7s cubic-bezier(.4,0,.2,1)}
        .ch:hover .iz{transform:scale(1.06)}

        /* Blob decoration */
        .blob{position:absolute;border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:morphBlob 12s ease-in-out infinite;pointer-events:none;filter:blur(60px);opacity:.06}

        /* Destination */
        .dg{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        .dc{border-radius:24px;overflow:hidden;position:relative;background:#fff;box-shadow:0 2px 20px rgba(0,0,0,.05);transition:all .55s cubic-bezier(.4,0,.2,1);text-decoration:none;display:flex;flex-direction:column}
        .dc:hover{box-shadow:0 30px 70px rgba(5,150,105,.16)}
        .dc .db{position:absolute;inset:-3px;border-radius:27px;padding:3px;background:conic-gradient(from 0deg,#059669,#10B981,#34D399,#059669);opacity:0;transition:opacity .5s;z-index:-1}
        .dc:hover .db{opacity:1}
        .diw{position:relative;height:250px;overflow:hidden}
        .dog{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.6) 100%);opacity:0;transition:opacity .4s}
        .dc:hover .dog{opacity:1}
        .deb{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;color:#fff;transition:transform .45s cubic-bezier(.34,1.56,.64,1);border:2px solid rgba(255,255,255,.3)}
        .dc:hover .deb{transform:translate(-50%,-50%) scale(1)}
        .dcc{padding:24px 26px 28px;flex:1;display:flex;flex-direction:column}
        .drt{display:inline-flex;align-items:center;gap:4px;padding:5px 14px;background:rgba(245,158,11,.12);border-radius:20px;font-size:12px;font-weight:700;color:#92400E;position:absolute;top:16px;right:16px;z-index:3;backdrop-filter:blur(6px)}
        .dct{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px}
        .dtt{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:#0F172A;margin-bottom:8px;line-height:1.3}
        .dds{font-size:14px;color:#64748B;line-height:1.65;flex:1;margin-bottom:12px}
        .dm{display:flex;align-items:center;gap:14px;font-size:13px;color:#94A3B8}

        /* Country */
        .cgg{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
        .cc{position:relative;border-radius:24px;overflow:hidden;height:340px;cursor:pointer;text-decoration:none;display:block}
        .cc img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.4,0,.2,1),filter .5s}
        .cc:hover img{transform:scale(1.12);filter:brightness(.82)}
        .co{position:absolute;inset:0;background:linear-gradient(180deg,transparent 25%,rgba(0,0,0,.78) 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:30px;transition:background .4s}
        .cc:hover .co{background:linear-gradient(180deg,rgba(5,150,105,.12) 0%,rgba(0,0,0,.88) 100%)}
        .cfb{position:absolute;top:18px;right:18px;font-size:14px;background:rgba(255,255,255,.12);backdrop-filter:blur(12px);padding:9px 16px;border-radius:30px;color:#fff;font-weight:600;display:flex;align-items:center;gap:8px;transform:translateY(-14px) scale(.9);opacity:0;transition:all .45s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(255,255,255,.22)}
        .cc:hover .cfb{transform:translateY(0) scale(1);opacity:1}
        .cfe{font-size:24px}
        .cn{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#fff;margin-bottom:6px}
        .cd{font-size:14px;color:rgba(255,255,255,.8);line-height:1.55;max-height:0;overflow:hidden;opacity:0;transition:all .45s ease .08s}
        .cc:hover .cd{max-height:80px;opacity:1}
        .cdc{position:absolute;bottom:30px;right:30px;font-size:12px;color:#34D399;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0;transform:translateX(12px);transition:all .4s ease .12s;display:flex;align-items:center;gap:5px}
        .cc:hover .cdc{opacity:1;transform:translateX(0)}

        /* Gallery */
        .gf{display:flex;justify-content:center;gap:8px;margin-bottom:44px;flex-wrap:wrap}
        .gfb{padding:10px 24px;border-radius:50px;border:2px solid #E2E8F0;background:transparent;font-size:14px;font-weight:600;color:#64748B;cursor:pointer;transition:all .3s;font-family:inherit}
        .gfb:hover{border-color:#059669;color:#059669}
        .gfb.act{background:#059669;border-color:#059669;color:#fff;box-shadow:0 6px 24px rgba(5,150,105,.3)}
        .gm{columns:3;column-gap:18px}
        .gi{break-inside:avoid;margin-bottom:18px;border-radius:20px;overflow:hidden;position:relative;cursor:pointer;display:block}
        .gi img{width:100%;display:block;transition:transform .65s ease}
        .gi:hover img{transform:scale(1.05)}
        .gio{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(2,44,34,.88) 100%);opacity:0;transition:opacity .4s;display:flex;flex-direction:column;justify-content:flex-end;padding:22px}
        .gi:hover .gio{opacity:1}
        .gii{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;transition:transform .4s cubic-bezier(.34,1.56,.64,1);border:2px solid rgba(255,255,255,.3)}
        .gi:hover .gii{transform:translate(-50%,-50%) scale(1)}
        .gcat{display:inline-block;padding:4px 12px;background:rgba(16,185,129,.2);border-radius:20px;font-size:11px;font-weight:700;color:#34D399;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
        .galt{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:3px}
        .gloc{font-size:13px;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:4px}

        /* Signature */
        .sc{display:grid;grid-template-columns:1fr 1fr;border-radius:32px;overflow:hidden;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.06);min-height:500px;transition:box-shadow .5s}
        .sc:hover{box-shadow:0 32px 80px rgba(0,0,0,.1)}
        .sc.rev{direction:rtl}.sc.rev>*{direction:ltr}
        .siw{position:relative;overflow:hidden;min-height:400px}
        .siw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s ease}
        .sc:hover .siw img{transform:scale(1.06)}

        /* Process */
        .ptab{padding:22px 28px;border-left:3px solid #E5E7EB;cursor:pointer;transition:all .4s;background:transparent;border-right:none;border-top:none;border-bottom:none;text-align:left;width:100%;font-family:inherit}
        .ptab.act{border-left-color:#059669;background:rgba(5,150,105,.04)}
        .ptab:hover{background:rgba(5,150,105,.02)}

        /* Horizontal scroll gallery variant */
        .hsg{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:16px;scrollbar-width:thin;scrollbar-color:#059669 transparent}
        .hsg::-webkit-scrollbar{height:6px}
        .hsg::-webkit-scrollbar-track{background:transparent}
        .hsg::-webkit-scrollbar-thumb{background:#059669;border-radius:6px}
        .hsi{scroll-snap-align:start;flex-shrink:0}

        /* Responsive */
        @media(max-width:1200px){
          .ig{grid-template-columns:1fr!important;gap:48px!important}
          .iw{order:-1}
          .dg{grid-template-columns:repeat(2,1fr)!important}
          .pl{grid-template-columns:1fr!important}
          .sc{grid-template-columns:1fr!important;min-height:auto!important}
          .sc.rev{direction:ltr}
          .ag{grid-template-columns:repeat(2,1fr)!important}
          .wg{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:1024px){
          .bg{grid-template-columns:1fr!important}
          .gm{columns:2}
          .cgg{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:768px){
          .qs{grid-template-columns:repeat(2,1fr)!important}
          .iis{display:none!important}
          .wg{grid-template-columns:1fr!important}
          .dg{grid-template-columns:1fr!important}
          .ag{grid-template-columns:1fr!important}
          .cgg{grid-template-columns:1fr!important}
          .nf{flex-direction:column!important}
          .ctab{flex-direction:column!important;align-items:center}
          .gm{columns:1}
          .pf{gap:28px!important}
          .gf{gap:6px}.gfb{padding:8px 16px;font-size:12px}
          .siw{min-height:260px!important}
          .diw{height:210px!important}
        }
        @media(max-width:480px){
          .qs{grid-template-columns:1fr!important}
        }

        @media(prefers-reduced-motion:reduce){
          *{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
        }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <Hero />

      {/* ═══════ INTRODUCTION ═══════ */}
      <section className="sp" style={{ backgroundColor: "#fff", position: "relative", overflow: "hidden" }}>
        {/* Decorative blobs */}
        <div className="blob" style={{ top: -100, right: -100, width: 500, height: 500, background: "#059669" }} />
        <div className="blob" style={{ bottom: -150, left: -150, width: 400, height: 400, background: "#10B981", animationDelay: "4s" }} />

        <div className="ctr">
          <div className="ig" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <TextReveal>
                <span className="sl"><FiCompass size={14} /> Welcome to Altuvera</span>
              </TextReveal>
              <TextReveal delay={0.08}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 4.2vw, 58px)", fontWeight: 800, color: "#0F172A", lineHeight: 1.12, marginBottom: 28 }}>
                  Discover the <span className="tg">Untamed Magic</span> of East Africa
                </h2>
              </TextReveal>
              <TextReveal delay={0.14}>
                <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(22px, 2.5vw, 32px)", color: "#059669", marginBottom: 28, paddingLeft: 24, borderLeft: "4px solid #10B981", lineHeight: 1.4 }}>
                  "Where the wild horizon meets your deepest sense of wonder"
                </p>
              </TextReveal>
              {[
                "For over fifteen years, Altuvera has been the trusted compass for discerning travelers seeking extraordinary encounters in East Africa. We don't simply organize trips — we architect <strong>transformative journeys</strong> that weave together the thunder of the Great Migration, the gentle gaze of silverback gorillas, and the warmth of Maasai campfires under star-filled skies.",
                "Our locally-born guides, conservationists, and hospitality artisans share an unshakable commitment to <strong>sustainable, community-driven tourism</strong>. Every safari dollar funds wildlife corridors. Every cultural visit empowers local artisans. Every footprint we leave heals rather than harms.",
                "Whether you're a seasoned explorer or embarking on your first African adventure, our bespoke approach ensures every moment is curated, every detail anticipated, and every memory indelible. This isn't travel — it's transformation."
              ].map((text, i) => (
                <TextReveal key={i} delay={0.18 + i * 0.06}>
                  <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.95, marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: text }} />
                </TextReveal>
              ))}
              <TextReveal delay={0.4}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                  <MagneticWrap><Button to="/about" variant="primary" icon={<FiArrowRight size={18} />}>Our Story</Button></MagneticWrap>
                  <MagneticWrap><Button to="/explore" variant="outline">Browse Experiences</Button></MagneticWrap>
                </div>
              </TextReveal>
              <StaggerWrap className="qs" stagger={0.1} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 48, paddingTop: 40, borderTop: "1px solid #E5E7EB" }}>
                {quickStats.map((s) => (
                  <StaggerChild key={s.label}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 800, color: "#059669", marginBottom: 4 }}>
                        <Counter end={s.number} suffix={s.suffix} />
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>{s.label}</div>
                    </div>
                  </StaggerChild>
                ))}
              </StaggerWrap>
            </div>

            <div className="iw" style={{ position: "relative" }}>
              <AnimatedSection animation="rotateIn" delay={0.2}>
                <div style={{ position: "relative", minHeight: "clamp(360px, 52vw, 580px)", width: "100%" }}>
                  <ImageCycle
                    images={["https://i.pinimg.com/736x/b5/15/5f/b5155f7921d34e9d5cdfd5545cda2db8.jpg", "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200", "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200"]}
                    style={{ width: "100%", height: "clamp(360px, 52vw, 520px)", borderRadius: 28, objectFit: "cover", boxShadow: "0 30px 80px rgba(0,0,0,.15)" }}
                    interval={7000}
                  />
                  <ImageCycle
                    images={["https://i.pinimg.com/1200/c2/9f/44/c29f44fa94ebd6f672b4aedd2be232f9.jpg", "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800"]}
                    style={{ position: "absolute", bottom: "clamp(12px, 3vw, 32px)", left: "clamp(-20px, 1vw, -40px)", width: "clamp(180px, 36%, 280px)", height: "clamp(200px, 40vw, 360px)", borderRadius: 24, objectFit: "cover", border: "8px solid white", boxShadow: "0 30px 70px rgba(0,0,0,.25)", zIndex: 5, animation: "floatSoft 6s ease-in-out infinite" }}
                    className="iis"
                    interval={4500}
                  />
                  <motion.div
                    animate={reduced ? {} : { y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", top: "clamp(12px, 3vw, 40px)", right: "clamp(12px, 3vw, 28px)", width: "clamp(100px, 18vw, 155px)", height: "clamp(100px, 18vw, 155px)", borderRadius: 24, background: "linear-gradient(135deg, #059669, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "white", boxShadow: "0 20px 50px rgba(5,150,105,.45)", zIndex: 10 }}
                  >
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 800 }}>10+</span>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Countries</span>
                  </motion.div>
                  <div style={{ position: "absolute", bottom: -30, right: -30, width: 130, height: 130, borderRadius: "50%", border: "3px dashed rgba(5,150,105,.15)", animation: "rotateSlow 25s linear infinite", pointerEvents: "none" }} />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS ═══════ */}
      <section className="sp" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #fff 100%)", position: "relative" }}>
        <div className="blob" style={{ top: "20%", right: -200, width: 500, height: 500, background: "#10B981" }} />
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl"><FiMapPin size={14} /> Explore Our Destinations</span>
              <h2 className="st">Handpicked <span className="tg">Destinations</span></h2>
              <p className="ss">From the endless plains of the Serengeti to the pristine shores of Zanzibar, discover destinations that ignite the soul and stir the imagination. Each one is vetted by our team for authenticity and wonder.</p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="dg" stagger={0.07}>
            {allDestinations.slice(0, 6).map((d, i) => (
              <StaggerChild key={d?.id || d?.slug || i}>
                <Link to={`/destination/${d?.slug || d?.id || ""}`} className="dc ch" aria-label={`Explore ${d?.name || "destination"}`}>
                  <div className="db" />
                  <div className="diw">
                    <LazyImage src={getDestImg(d)} alt={d?.name || "Destination"} style={{ width: "100%", height: "100%" }} className="iz" />
                    <div className="dog" />
                    <div className="deb"><FiEye size={22} color="#fff" /></div>
                    {d?.rating && <span className="drt"><FiStar size={11} style={{ fill: "#F59E0B", color: "#F59E0B" }} /> {d.rating}</span>}
                  </div>
                  <div className="dcc">
                    <span className="dct"><FiMapPin size={11} /> {d?.country || "East Africa"}</span>
                    <h3 className="dtt">{d?.name || "Destination"}</h3>
                    <p className="dds">{(d?.description || "Explore this incredible destination with Altuvera's expert-guided experiences across breathtaking landscapes.").slice(0, 120)}...</p>
                    <div className="dm">
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FiMapPin size={12} /> {d?.country || "Africa"}</span>
                      {d?.duration && <span><FiClock size={12} /> {d.duration}</span>}
                    </div>
                  </div>
                  <div className="lr" />
                </Link>
              </StaggerChild>
            ))}
          </StaggerWrap>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <MagneticWrap><Button to="/destinations" variant="primary" size="large" icon={<FiArrowRight size={18} />}>View All Destinations</Button></MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="sp" style={{ background: "linear-gradient(180deg, #fff 0%, #F0FDF4 50%, #fff 100%)" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl"><FiTarget size={14} /> How It Works</span>
              <h2 className="st">Your Journey in <span className="tg">Four Simple Steps</span></h2>
              <p className="ss">From the first spark of inspiration to stepping onto African soil, we make the entire process seamless, exciting, and utterly stress-free.</p>
            </div>
          </AnimatedSection>
          <div className="pl" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 48, alignItems: "start" }}>
            <AnimatedSection animation="fadeInLeft">
              <div style={{ display: "flex", flexDirection: "column", borderRadius: 24, overflow: "hidden", background: "white", boxShadow: "0 8px 40px rgba(0,0,0,.06)" }}>
                {processSteps.map((s, i) => (
                  <button key={i} className={`ptab ${activeProcess === i ? "act" : ""}`} onClick={() => setActiveProcess(i)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
                      <motion.div
                        animate={{ background: activeProcess === i ? "linear-gradient(135deg, #059669, #10B981)" : "#F1F5F9", color: activeProcess === i ? "#fff" : "#94A3B8" }}
                        style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >
                        <s.icon size={19} />
                      </motion.div>
                      <div>
                        <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Step {s.step}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: activeProcess === i ? "#059669" : "#1E293B", transition: "color .3s" }}>{s.title}</div>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      {activeProcess === i && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75, overflow: "hidden", marginTop: 8 }}>
                          {s.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}

                {/* Progress indicator */}
                <div style={{ height: 4, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${((activeProcess + 1) / processSteps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #059669, #10B981)", borderRadius: 2 }}
                  />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInRight">
              <div style={{ borderRadius: 28, overflow: "hidden", position: "relative", height: "100%", minHeight: 500, boxShadow: "0 20px 60px rgba(0,0,0,.1)" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeProcess} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ position: "absolute", inset: 0 }}>
                    <LazyImage src={processSteps[activeProcess].image} alt={processSteps[activeProcess].title} style={{ width: "100%", height: "100%" }} />
                  </motion.div>
                </AnimatePresence>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.6) 100%)" }} />
                <motion.div key={`t-${activeProcess}`} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.15 }} style={{ position: "absolute", bottom: 36, left: 36, right: 36, color: "white" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: 2 }}>Step {processSteps[activeProcess].step}</span>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 10, marginTop: 6 }}>{processSteps[activeProcess].title}</div>
                  <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.65 }}>{processSteps[activeProcess].description.slice(0, 130)}…</div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════ STATISTICS ═══════ */}
      <Statistics />

      {/* ═══════ CINEMATIC PARALLAX ═══════ */}
      <ParallaxSection image="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1920" height="78vh">
        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}>
          <MagneticWrap strength={0.15} scale={1.05}>
            <div style={{ width: 86, height: 86, borderRadius: "50%", border: "2px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px", cursor: "pointer", background: "rgba(255,255,255,.08)", backdropFilter: "blur(12px)", transition: "all .3s" }}>
              <FiPlay size={34} color="white" style={{ marginLeft: 4 }} />
            </div>
          </MagneticWrap>
        </motion.div>
        <SplitText style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 800, color: "white", lineHeight: 1.12, marginBottom: 22, display: "block" }}>
          Experience Africa Through Our Eyes
        </SplitText>
        <TextReveal delay={0.3}>
          <p style={{ fontSize: "clamp(15px, 1.8vw, 19px)", color: "rgba(255,255,255,.88)", lineHeight: 1.8, maxWidth: 660, margin: "0 auto" }}>
            Every sunrise over the savannah tells a story. Every encounter with wildlife rewrites what you thought possible. Watch how our travelers describe the indescribable — and start imagining your own chapter.
          </p>
        </TextReveal>
      </ParallaxSection>

      {/* ═══════ WHY CHOOSE US ═══════ */}
      <section className="sp" style={{ backgroundColor: "#F0FDF4", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />
        <div className="blob" style={{ bottom: -100, right: -100, width: 500, height: 500, background: "#059669" }} />
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">💎 Why Choose Altuvera</span>
              <h2 className="st">The <span className="tg">Altuvera</span> Difference</h2>
              <p className="ss">We don't just plan trips — we craft transformative experiences rooted in expertise, integrity, and a deep love for East Africa's people, wildlife, and landscapes.</p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="wg" stagger={0.07} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {features.map((f) => (
              <StaggerChild key={f.title}>
                <PerspectiveCard
                  intensity={isMobile ? 0 : 10}
                  style={{ background: "white", borderRadius: 24, padding: "40px 30px", border: "1px solid rgba(5,150,105,.06)", overflow: "hidden", height: "100%", cursor: "default" }}
                >
                  <motion.div
                    whileHover={reduced ? {} : { rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
                    transition={{ duration: 0.55 }}
                    style={{ width: 66, height: 66, borderRadius: 20, background: `linear-gradient(135deg, ${f.accent}, ${f.accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 24, boxShadow: `0 12px 30px ${f.accent}44` }}
                  >
                    <f.icon size={27} />
                  </motion.div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 14.5, color: "#64748B", lineHeight: 1.75 }}>{f.description}</p>
                  <div className="lr" />
                </PerspectiveCard>
              </StaggerChild>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════ COUNTRIES ═══════ */}
      <section className="sp" style={{ background: "#fff" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl"><FiGlobe size={14} /> Explore by Country</span>
              <h2 className="st">Discover East <span className="tg">Africa's Gems</span></h2>
              <p className="ss">Each country offers a unique tapestry of landscapes, cultures, and wildlife experiences. Hover to discover what makes each destination uniquely extraordinary.</p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="cgg" stagger={0.08}>
            {countryList.slice(0, 6).map((c, i) => (
              <StaggerChild key={c?.id || c?.slug || i}>
                <Link to={`/country/${c?.slug || c?.id || ""}`} className="cc" aria-label={`Explore ${c?.name || "country"}`}>
                  <LazyImage src={c?.image || c?.heroImage || c?.images?.[0] || "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800"} alt={c?.name || "Country"} style={{ width: "100%", height: "100%" }} />
                  <div className="co">
                    <div className="cfb">
                      <span className="cfe">{getFlag(c?.name)}</span>
                      <span>{c?.name || "Country"}</span>
                    </div>
                    <h3 className="cn">{c?.name || "Country"}</h3>
                    <p className="cd">{(c?.description || "Explore incredible experiences in this stunning East African destination.").slice(0, 100)}...</p>
                    <span className="cdc">{c?.destinations?.length || c?.destinationCount || "10+"} Destinations <FiArrowUpRight size={14} /></span>
                  </div>
                </Link>
              </StaggerChild>
            ))}
          </StaggerWrap>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <MagneticWrap><Button to="/countries" variant="primary" icon={<FiArrowRight size={18} />}>Explore All Countries</Button></MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ SIGNATURE EXPERIENCES ═══════ */}
      <section className="sp" style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #fff 100%)" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl"><FiZap size={14} /> Signature Experiences</span>
              <h2 className="st">Once-in-a-Lifetime <span className="tg">Encounters</span></h2>
              <p className="ss">These aren't tours — they're the experiences travelers fly halfway around the world to have. Each refined over a decade to deliver pure, unfiltered magic.</p>
            </div>
          </AnimatedSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {signatureExperiences.map((exp, i) => (
              <AnimatedSection key={exp.title} animation={i % 2 === 0 ? "fadeInLeft" : "fadeInRight"}>
                <div className={`sc ${i % 2 !== 0 ? "rev" : ""}`}>
                  <div className="siw">
                    <LazyImage src={exp.image} alt={exp.title} style={{ width: "100%", height: "100%" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,.3) 100%)" }} />
                    {/* Badge */}
                    <motion.div whileHover={{ scale: 1.05 }} style={{ position: "absolute", top: 24, left: 24, padding: "8px 18px", background: "rgba(255,255,255,.15)", backdropFilter: "blur(10px)", borderRadius: 30, color: "white", fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,.2)" }}>
                      ⭐ {exp.stats.Rating}
                    </motion.div>
                  </div>
                  <div style={{ padding: "clamp(28px, 4vw, 56px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>{exp.subtitle}</span>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 800, color: "#0F172A", marginBottom: 20, lineHeight: 1.18 }}>{exp.title}</h3>
                    <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.85, marginBottom: 28 }}>{exp.description}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32, padding: "20px 0", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
                      {Object.entries(exp.stats).map(([k, v]) => (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>{k}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <MagneticWrap><Button to="/booking" variant="primary" icon={<FiArrowRight size={16} />}>Book This Experience</Button></MagneticWrap>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ADVENTURE TYPES ═══════ */}
      <section className="sp" style={{ background: "linear-gradient(180deg, #fff 0%, #F0FDF4 100%)" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">🧭 Types of Adventures</span>
              <h2 className="st">Choose Your <span className="tg">Experience</span></h2>
              <p className="ss">From thrilling safaris to tranquil beaches, from misty mountain treks to intimate cultural encounters — a perfect adventure awaits every traveler.</p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="ag" stagger={0.07} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {adventureTypes.map((a) => (
              <StaggerChild key={a.title}>
                <PerspectiveCard
                  intensity={isMobile ? 0 : 8}
                  style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid #E5E7EB", height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}
                  className="ch"
                >
                  <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                    <LazyImage src={a.image} alt={a.title} style={{ width: "100%", height: "100%" }} className="iz" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,.25) 100%)" }} />
                  </div>
                  <div style={{ padding: "24px 26px 30px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "-52px auto 18px", fontSize: 30, boxShadow: `0 10px 30px ${a.color}33`, border: "4px solid white", background: "white", position: "relative", zIndex: 2 }}>{a.icon}</div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{a.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 20, flex: 1 }}>{a.description}</p>
                    <span style={{ display: "inline-block", padding: "8px 22px", backgroundColor: `${a.color}12`, borderRadius: 30, fontSize: 13, fontWeight: 700, color: a.color }}>{a.count}</span>
                  </div>
                  <div className="lr" />
                </PerspectiveCard>
              </StaggerChild>
            ))}
          </StaggerWrap>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <MagneticWrap><Button to="/explore" variant="primary" size="large" icon={<FiArrowRight size={18} />}>Explore All Adventures</Button></MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ GALLERY ═══════ */}
      <section className="sp" style={{ background: "#fff", position: "relative", overflow: "hidden" }}>
        {/* Animated top border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 28, marginBottom: 16 }}>
              <div style={{ maxWidth: 600 }}>
                <span className="sl"><FiCamera size={14} /> Visual Stories</span>
                <h2 className="st" style={{ marginBottom: 14 }}>Moments That <span className="tg">Take Your Breath Away</span></h2>
                <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.75 }}>
                  A curated collection of real moments captured by our travelers and guides across East Africa's most extraordinary landscapes. Each image tells a story of wonder, connection, and raw beauty. Click any image to explore.
                </p>
              </div>
              <MagneticWrap><Button to="/gallery" variant="outline" icon={<FiArrowUpRight size={16} />}>Full Gallery</Button></MagneticWrap>
            </div>
          </AnimatedSection>

          {/* Filter */}
          <AnimatedSection animation="fadeInUp">
            <div className="gf">
              {galleryCats.map((cat) => (
                <motion.button key={cat} className={`gfb ${galleryFilter === cat ? "act" : ""}`} onClick={() => setGalleryFilter(cat)} whileTap={{ scale: 0.95 }}>
                  {cat}
                </motion.button>
              ))}
            </div>
          </AnimatedSection>

          {/* Masonry */}
          <motion.div className="gm" layout>
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((img, i) => (
                <motion.div
                  key={img.src + galleryFilter}
                  className="gi"
                  layout
                  initial={{ opacity: 0, scale: 0.88, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -20 }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  onClick={() => setLightboxIdx(galleryImages.indexOf(img))}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${img.alt}`}
                  onKeyDown={(e) => { if (e.key === "Enter") setLightboxIdx(galleryImages.indexOf(img)); }}
                >
                  <img src={img.src} alt={img.alt} style={{ height: isMobile ? 260 : img.h }} loading="lazy" />
                  <div className="gio">
                    <span className="gcat">{img.category}</span>
                    <span className="galt">{img.alt}</span>
                    <span className="gloc"><FiMapPin size={12} /> {img.location}</span>
                  </div>
                  <div className="gii"><FiMaximize2 size={20} color="#fff" /></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Gallery stats */}
          <AnimatedSection animation="fadeInUp">
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(32px, 5vw, 60px)", marginTop: 52, paddingTop: 36, borderTop: "1px solid #E5E7EB", flexWrap: "wrap" }}>
              {[
                { num: "2500", suf: "+", label: "Photos Captured", icon: FiCamera },
                { num: "85", suf: "+", label: "Locations Covered", icon: FiMapPin },
                { num: "12", suf: "", label: "Countries Featured", icon: FiGlobe },
                { num: "150", suf: "+", label: "Photographers", icon: FiUsers },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <s.icon size={18} style={{ color: "#059669", marginBottom: 8 }} />
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, color: "#059669" }}>
                    <Counter end={s.num} suffix={s.suf} />
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIdx >= 0 && (
            <GalleryLightbox
              images={galleryImages}
              activeIndex={lightboxIdx}
              onClose={() => setLightboxIdx(-1)}
              onNext={() => setLightboxIdx((p) => (p + 1) % galleryImages.length)}
              onPrev={() => setLightboxIdx((p) => (p - 1 + galleryImages.length) % galleryImages.length)}
            />
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section ref={testimonialRef} className="sp" style={{ background: "linear-gradient(135deg, #022C22 0%, #065F46 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, pointerEvents: "none" }} />
        <div className="blob" style={{ top: -200, right: -200, width: 500, height: 500, background: "#10B981", opacity: 0.04 }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl sl-d">❤️ Traveler Stories</span>
              <h2 className="st" style={{ color: "#fff" }}>What Our Travelers Say</h2>
              <p className="ss" style={{ color: "rgba(255,255,255,.6)" }}>Real stories from real adventurers who trusted us with their African dream. Their words speak louder than any brochure ever could.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="scaleIn">
            <div style={{ textAlign: "center", padding: "20px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 28 }}>
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0, rotate: -180 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", bounce: 0.5 }}>
                    <FiStar size={21} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
                  </motion.div>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 30, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -30, filter: "blur(6px)" }} transition={{ duration: 0.5 }}>
                  <div style={{ fontSize: 52, color: "#10B981", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 10, opacity: 0.35 }}>"</div>
                  <p style={{ fontSize: "clamp(17px, 2.2vw, 25px)", color: "white", lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Playfair Display', serif", maxWidth: 800, margin: "0 auto 34px" }}>
                    {testimonials[activeTestimonial]?.text}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
                    <motion.img
                      src={testimonials[activeTestimonial]?.avatar}
                      alt={testimonials[activeTestimonial]?.name}
                      style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", border: "3px solid #10B981", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}
                      layoutId={`avatar-${activeTestimonial}`}
                    />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 3 }}>{testimonials[activeTestimonial]?.name}</div>
                      <div style={{ fontSize: 13, color: "#34D399", marginBottom: 2 }}>{testimonials[activeTestimonial]?.location}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>{testimonials[activeTestimonial]?.trip}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 36 }}>
                <MagneticWrap strength={0.2}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={prevTestimonial} aria-label="Previous" style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", transition: "background .3s" }} onMouseOver={(e) => (e.currentTarget.style.background = "#059669")} onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}>
                    <FiChevronLeft size={21} />
                  </motion.button>
                </MagneticWrap>
                <MagneticWrap strength={0.2}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={nextTestimonial} aria-label="Next" style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", transition: "background .3s" }} onMouseOver={(e) => (e.currentTarget.style.background = "#059669")} onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}>
                    <FiChevronRight size={21} />
                  </motion.button>
                </MagneticWrap>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                {testimonials.map((_, i) => (
                  <motion.button key={i} onClick={() => setActiveTestimonial(i)} aria-label={`Testimonial ${i + 1}`}
                    animate={{ width: activeTestimonial === i ? 30 : 10, background: activeTestimonial === i ? "#10B981" : "rgba(255,255,255,.2)" }}
                    transition={{ duration: 0.35 }}
                    style={{ height: 10, borderRadius: 10, border: "none", cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ BLOG ═══════ */}
      <section className="sp" style={{ background: "#fff" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">📝 Travel Journal</span>
              <h2 className="st">Latest <span className="tg">Stories & Insights</span></h2>
              <p className="ss">Expert destination guides, insider travel tips, wildlife updates, and inspiring narratives straight from the heart of East Africa.</p>
            </div>
          </AnimatedSection>
          <div className="bg" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
            <AnimatedSection animation="fadeInLeft">
              <Link to={`/post/${posts[0]?.slug}`} className="ch" style={{ position: "relative", borderRadius: 28, overflow: "hidden", height: 520, display: "block", textDecoration: "none", transition: "all .5s ease", boxShadow: "0 4px 30px rgba(0,0,0,.08)" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,.15)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,0,0,.08)"; }}
              >
                <LazyImage src={posts[0]?.image} alt={posts[0]?.title} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} className="iz" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 25%, rgba(0,0,0,.88) 100%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 4vw, 42px)", color: "white" }}>
                  <span style={{ display: "inline-block", padding: "7px 18px", background: "#059669", borderRadius: 30, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>{posts[0]?.category}</span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 2.5vw, 34px)", fontWeight: 700, marginBottom: 12, lineHeight: 1.22 }}>{posts[0]?.title}</h3>
                  <p style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.7, marginBottom: 14, maxWidth: 500 }}>{posts[0]?.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, opacity: 0.7 }}>
                    <FiCalendar size={13} /> <span>{posts[0]?.date}</span><span>•</span><span>{posts[0]?.readTime}</span>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
            <AnimatedSection animation="fadeInRight">
              <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                {posts.slice(1, 4).map((post) => (
                  <Link key={post.id} to={`/post/${post.slug}`} style={{ display: "flex", gap: 18, padding: 18, borderRadius: 20, background: "#F8FAFC", textDecoration: "none", transition: "all .4s ease", flex: 1, alignItems: "center" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#D1FAE5"; e.currentTarget.style.transform = "translateX(6px)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.transform = ""; }}
                  >
                    <LazyImage src={post.image} alt={post.title} style={{ width: 108, height: 88, borderRadius: 14, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, display: "block" }}>{post.category}</span>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 5, lineHeight: 1.3 }}>{post.title}</h4>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{post.date} · {post.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 52 }}>
              <MagneticWrap><Button to="/posts" variant="primary" icon={<FiArrowRight size={18} />}>Read More Articles</Button></MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ PARTNERS ═══════ */}
      <section style={{ padding: "72px 24px", background: "linear-gradient(180deg, #fff 0%, #F0FDF4 100%)" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Trusted & Recognized Worldwide</h3>
              <p style={{ fontSize: 14, color: "#94A3B8" }}>Proud partners and award recipients across the global travel industry</p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="pf" stagger={0.08} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 52, flexWrap: "wrap" }}>
            {partners.map((p) => (
              <StaggerChild key={p.name}>
                <MagneticWrap strength={0.15}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: 0.55, transition: "all .4s", cursor: "pointer", padding: "16px 24px", borderRadius: 18 }}
                    onMouseOver={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.background = "rgba(5,150,105,.05)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.transform = ""; e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 28 }}>{p.badge.split(" ")[0]}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>{p.badge.split(" ").slice(1).join(" ")}</span>
                  </div>
                </MagneticWrap>
              </StaggerChild>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section style={{ padding: "clamp(72px, 8vw, 115px) 24px", background: "linear-gradient(135deg, #059669, #10B981)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -140, right: -140, width: 420, height: 420, borderRadius: "50%", border: "2px solid rgba(255,255,255,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />
        <div className="blob" style={{ top: "30%", left: "10%", width: 300, height: 300, background: "#fff", opacity: 0.03 }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <AnimatedSection animation="scaleIn">
            <motion.div animate={reduced ? {} : { y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} style={{ width: 78, height: 78, borderRadius: "50%", background: "rgba(255,255,255,.12)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px" }}>
              <FiMail size={33} color="white" />
            </motion.div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "white", marginBottom: 14 }}>Join Our Adventure Community</h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.88)", marginBottom: 34, lineHeight: 1.7, maxWidth: 550, margin: "0 auto 34px" }}>
              Get exclusive travel inspiration, early-bird offers, wildlife migration alerts, and insider tips delivered weekly. Join 25,000+ fellow adventurers.
            </p>
            {isSubscribed ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }} style={{ padding: "18px 30px", background: "rgba(255,255,255,.18)", backdropFilter: "blur(12px)", borderRadius: 16, color: "white", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10, fontSize: 16 }}>
                <FiCheck size={20} /> Welcome aboard! Your adventure starts now.
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletter} className="nf" style={{ display: "flex", gap: 12, maxWidth: 530, margin: "0 auto" }}>
                <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ flex: 1, padding: "17px 24px", borderRadius: 14, border: "2px solid transparent", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color .3s" }} onFocus={(e) => (e.target.style.borderColor = "#059669")} onBlur={(e) => (e.target.style.borderColor = "transparent")} />
                <MagneticWrap strength={0.12}>
                  <motion.button type="submit" whileTap={{ scale: 0.95 }} style={{ padding: "17px 30px", background: "#022C22", color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .3s", whiteSpace: "nowrap" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#065F46"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "#022C22"; e.currentTarget.style.transform = ""; }}
                  >
                    Subscribe <FiArrowRight size={15} />
                  </motion.button>
                </MagneticWrap>
              </form>
            )}
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 18 }}>No spam, ever. Unsubscribe anytime. Your privacy matters.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <ParallaxSection
        image="https://i.pinimg.com/736x/b5/15/5f/b5155f7921d34e9d5cdfd5545cda2db8.jpg"
        height="82vh"
        overlay="linear-gradient(135deg, rgba(2,44,34,.93) 0%, rgba(5,150,105,.8) 100%)"
      >
        <motion.div initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px", background: "rgba(255,255,255,.06)", backdropFilter: "blur(8px)" }}>
            <FiCompass size={28} color="white" />
          </div>
        </motion.div>
        <SplitText style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 800, color: "white", lineHeight: 1.12, marginBottom: 22, display: "block" }}>
          Your East African Adventure Awaits
        </SplitText>
        <TextReveal delay={0.3}>
          <p style={{ fontSize: "clamp(15px, 1.7vw, 19px)", color: "rgba(255,255,255,.88)", maxWidth: 680, margin: "0 auto 18px", lineHeight: 1.8 }}>
            Let our team of passionate experts design your perfect journey through the heart of Africa. From the thundering wildebeest crossings of the Mara River to the quiet wonder of a gorilla's gaze — your story begins with a single step.
          </p>
        </TextReveal>
        <TextReveal delay={0.4}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", maxWidth: 520, margin: "0 auto 42px", lineHeight: 1.7 }}>
            Start planning today and join 50,000+ travelers who've discovered what makes Altuvera truly unforgettable.
          </p>
        </TextReveal>
        <TextReveal delay={0.5}>
          <div className="ctab" style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
            <MagneticWrap><Button to="/booking" variant="white" size="large" icon={<FiArrowRight size={18} />}>Start Planning Now</Button></MagneticWrap>
            <MagneticWrap><Button to="/contact" variant="outline" size="large">Speak to an Expert</Button></MagneticWrap>
          </div>
        </TextReveal>
      </ParallaxSection>
    </div>
  );
};

export default Home;