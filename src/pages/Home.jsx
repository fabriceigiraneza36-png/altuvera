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
import Hero, { HERO_SLIDES } from "../components/home/Hero";
import CountryGrid from "../components/home/CountriesAside";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { useApp } from "../context/AppContext";
import { testimonials } from "../data/testimonials";
import { services } from "../data/services";
import { posts } from "../data/posts";
import { useDestinations } from "../hooks/useDestinations";
import ImageCycle from "../components/common/ImageCycle";
import { useScrollTriggeredSlide } from "../hooks/useScrollTriggeredSlide";
import chatgpt from "../assets/chatgpt.png";

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
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    let raf;
    const handle = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setSize({ w: window.innerWidth, h: window.innerHeight }),
      );
    };
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("resize", handle);
      cancelAnimationFrame(raf);
    };
  }, []);
  return size;
};

/* ═══════════════════════════════════════════
   UTILITY: Smooth Scroll Hook
   ═══════════════════════════════════════════ */
const useSmoothScroll = () => {
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = '';
    };
  }, []);
};

/* ═══════════════════════════════════════════
   COMPONENT: Scroll Progress Bar
   ═══════════════════════════════════════════ */
const ScrollProgress = memo(() => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "linear-gradient(90deg, #059669, #10B981, #34D399)",
        transformOrigin: "0%",
        scaleX,
        zIndex: 9999,
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
  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });
  const springScale = useSpring(1, { stiffness: 280, damping: 22 });

  const handleMove = useCallback(
    (e) => {
      if (reduced) return;
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      x.set((e.clientX - r.left - r.width / 2) * strength);
      y.set((e.clientY - r.top - r.height / 2) * strength);
      springScale.set(scale);
    },
    [reduced, strength, scale, x, y, springScale],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    springScale.set(1);
  }, [x, y, springScale]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-block",
        x: springX,
        y: springY,
        scale: springScale,
      }}
    >
      {children}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Animated Counter
   ═══════════════════════════════════════════ */
const Counter = memo(({ end, suffix = "", duration = 2.5 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    duration: duration * 1000,
    bounce: 0,
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(parseInt(end, 10));
  }, [inView, end, motionVal]);

  useMotionValueEvent(springVal, "change", (v) => {
    setDisplay(Math.round(v).toLocaleString());
  });

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
});

/* ═══════════════════════════════════════════
   COMPONENT: Text Reveal (line-by-line)
   ═══════════════════════════════════════════ */
const TextReveal = memo(({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div>{children}</div>;
  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <motion.div
        initial={{ y: "120%", opacity: 0, rotateX: -20 }}
        animate={inView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
        transition={{ duration: 1, delay, ease: [0.25, 1, 0.5, 1] }}
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
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = usePrefersReducedMotion();
  const words = typeof children === "string" ? children.split(" ") : [children];

  if (reduced)
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );

  return (
    <span
      ref={ref}
      className={className}
      style={{ ...style, display: "inline" }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            marginRight: "0.3em",
          }}
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
      hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(6px)" },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
      },
    }}
  >
    {children}
  </motion.div>
));

/* ═══════════════════════════════════════════
   COMPONENT: 3D Perspective Card
   ═══════════════════════════════════════════ */
const PerspectiveCard = memo(
  ({ children, style, className, intensity = 12 }) => {
    const ref = useRef(null);
    const reduced = usePrefersReducedMotion();
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const gx = useMotionValue(50);
    const gy = useMotionValue(50);
    const isHovered = useMotionValue(0);
    const springRx = useSpring(rx, { stiffness: 280, damping: 28 });
    const springRy = useSpring(ry, { stiffness: 280, damping: 28 });
    const springHover = useSpring(isHovered, { stiffness: 180, damping: 22 });

    const handleMove = useCallback(
      (e) => {
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
      },
      [reduced, intensity, rx, ry, gx, gy, isHovered],
    );

    const handleLeave = useCallback(() => {
      rx.set(0);
      ry.set(0);
      gx.set(50);
      gy.set(50);
      isHovered.set(0);
    }, [rx, ry, gx, gy, isHovered]);

    const shadow = useTransform(
      springHover,
      [0, 1],
      ["0 4px 24px rgba(0,0,0,0.06)", "0 30px 60px rgba(5,150,105,0.18)"],
    );
    const translateY = useTransform(springHover, [0, 1], [0, -8]);

    return (
      <motion.div
        ref={ref}
        className={className}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          ...style,
          perspective: 900,
          transformStyle: "preserve-3d",
          rotateX: springRx,
          rotateY: springRy,
          boxShadow: shadow,
          y: translateY,
          position: "relative",
        }}
      >
        {children}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 20,
            opacity: springHover,
            background: useTransform(
              [gx, gy],
              ([gxVal, gyVal]) =>
                `radial-gradient(circle at ${gxVal}% ${gyVal}%, rgba(255,255,255,0.18), transparent 55%)`,
            ),
          }}
        />
      </motion.div>
    );
  },
);

/* ═══════════════════════════════════════════
   COMPONENT: Parallax Section
   ═══════════════════════════════════════════ */
const ParallaxSection = memo(
  ({ image, children, height = "75vh", overlay, id }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });
    const reduced = usePrefersReducedMotion();
    const y = useTransform(
      scrollYProgress,
      [0, 1],
      reduced ? ["0%", "0%"] : ["-15%", "15%"],
    );
    const scale = useTransform(
      scrollYProgress,
      [0, 0.5, 1],
      reduced ? [1, 1, 1] : [1.25, 1.08, 1.15],
    );
    const contentOp = useTransform(
      scrollYProgress,
      [0, 0.25, 0.75, 1],
      [0, 1, 1, 0],
    );
    const contentY = useTransform(
      scrollYProgress,
      [0, 0.35, 0.65, 1],
      reduced ? [0, 0, 0, 0] : [80, 0, 0, -80],
    );

    return (
      <section
        ref={ref}
        id={id}
        style={{
          position: "relative",
          height,
          minHeight: 480,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: "-25%",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            y,
            scale,
            willChange: "transform",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              overlay ||
              "linear-gradient(135deg, rgba(2,44,34,.88) 0%, rgba(5,150,105,.72) 100%)",
          }}
        />
        <motion.div
          style={{
            position: "relative",
            zIndex: 2,
            opacity: contentOp,
            y: contentY,
            width: "100%",
            maxWidth: 920,
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          {children}
        </motion.div>
      </section>
    );
  },
);

/* ═══════════════════════════════════════════
   COMPONENT: Image Lazy Loader with blur
   ═══════════════════════════════════════════ */
const LazyImage = memo(({ src, alt, style, className }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "250px" });

  return (
    <div
      ref={ref}
      style={{ position: "relative", overflow: "hidden", ...style }}
      className={className}
    >
      {/* Placeholder */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
          filter: "blur(0px)",
          transition: "opacity 0.6s ease",
          opacity: loaded ? 0 : 1,
          zIndex: 1,
        }}
      />
      {inView && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
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
const GalleryLightbox = memo(
  ({ images, activeIndex, onClose, onNext, onPrev }) => {
    useEffect(() => {
      const h = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") onNext();
        if (e.key === "ArrowLeft") onPrev();
      };
      window.addEventListener("keydown", h);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", h);
        document.body.style.overflow = "";
      };
    }, [onClose, onNext, onPrev]);

    const img = images[activeIndex];
    if (!img) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,.92)",
          backdropFilter: "blur(20px)",
        }}
        onClick={onClose}
      >
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          whileHover={{ scale: 1.1, background: "rgba(255,255,255,.2)" }}
        >
          <FiX size={22} />
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{
            position: "absolute",
            left: 24,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <FiChevronLeft size={24} />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "85vw",
              maxHeight: "85vh",
              position: "relative",
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{
                maxWidth: "85vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
            <div style={{ textAlign: "center", marginTop: 16, color: "white" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {img.alt}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <FiMapPin size={13} /> {img.location}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{
            position: "absolute",
            right: 24,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.15)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <FiChevronRight size={24} />
        </motion.button>

        {/* Thumbnails */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            overflowX: "auto",
            maxWidth: "80vw",
            padding: "0 20px",
          }}
        >
          {images.map((im, i) => (
            <motion.div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                width: 52,
                height: 38,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  i === activeIndex
                    ? "2px solid #10B981"
                    : "2px solid transparent",
                opacity: i === activeIndex ? 1 : 0.5,
                transition: "all .3s",
                flexShrink: 0,
              }}
            >
              <img
                src={im.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  },
);

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */
const Home = () => {
  const { setIsLoading } = useApp();
  const reduced = usePrefersReducedMotion();
  const { w: winW } = useWindowSize();
  const isMobile = winW < 768;
  const isTablet = winW < 1024;
  const homeRootRef = useRef(null);
  const hasCompletedPreloadRef = useRef(false);

  // Enable smooth scrolling
  useSmoothScroll();

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeProcess, setActiveProcess] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIdx, setLightboxIdx] = useState(-1);
  const { destinations: allDestinations = [], loading: destinationsLoading } = useDestinations({
    limit: 24,
    sort: "-featured",
  });

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((p) => (p + 1) % (testimonials?.length || 1));
  }, []);
  const prevTestimonial = useCallback(() => {
    setActiveTestimonial(
      (p) =>
        (p - 1 + (testimonials?.length || 1)) % (testimonials?.length || 1),
    );
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

  const handleNewsletter = useCallback(
    (e) => {
      e.preventDefault();
      if (email) {
        setIsSubscribed(true);
        setEmail("");
        setTimeout(() => setIsSubscribed(false), 5000);
      }
    },
    [email],
  );

  const getDestImg = useCallback(
    (d) =>
      d?.image ||
      d?.images?.[0] ||
      d?.heroImage ||
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    [],
  );

  useEffect(() => {
    if (hasCompletedPreloadRef.current) return;
    if (destinationsLoading) {
      setIsLoading(true);
      return;
    }

    let cancelled = false;

    const extractUrlsFromBackground = (value = "") => {
      const urls = [];
      const regex = /url\((['"]?)(.*?)\1\)/g;
      let match = regex.exec(value);
      while (match) {
        if (match[2]) urls.push(match[2]);
        match = regex.exec(value);
      }
      return urls;
    };

    const preloadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      });

    const preloadHomeImages = async () => {
      setIsLoading(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const urls = new Set();
      const root = homeRootRef.current;

      if (root) {
        root.querySelectorAll("img").forEach((img) => {
          const src = img.currentSrc || img.src;
          if (src) urls.add(src);
        });

        root.querySelectorAll("*").forEach((el) => {
          const bg = window.getComputedStyle(el).backgroundImage;
          extractUrlsFromBackground(bg).forEach((u) => urls.add(u));
        });
      }

      HERO_SLIDES.forEach((slide) => {
        if (slide.image) urls.add(slide.image);
        if (slide.fallback) urls.add(slide.fallback);
      });

      await Promise.all(
        [...urls]
          .filter(Boolean)
          .filter((url) => !url.startsWith("blob:"))
          .map(preloadImage),
      );

      if (!cancelled) {
        hasCompletedPreloadRef.current = true;
        setIsLoading(false);
      }
    };

    preloadHomeImages();

    return () => {
      cancelled = true;
    };
  }, [destinationsLoading, setIsLoading]);

  /* ─── Data ─── */
  const adventureTypes = useMemo(
    () => [
      {
        icon: "🦁",
        title: "Safari Adventures",
        description:
          "Witness Africa's incredible wildlife in their natural habitat across stunning national parks and vast golden savannahs stretching to the horizon.",
        count: "50+ Safaris",
        color: "#F59E0B",
        image:
          services?.[0]?.image ||
          "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600",
      },
      {
        icon: "🏔️",
        title: "Mountain Trekking",
        description:
          "Conquer legendary peaks from Kilimanjaro to the Rwenzoris with expert guides and unforgettable summit experiences above the clouds.",
        count: "15+ Treks",
        color: "#6366F1",
        image:
          services?.[1]?.image ||
          "https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=600",
      },
      {
        icon: "🦍",
        title: "Primate Tracking",
        description:
          "Intimate encounters with endangered mountain gorillas and chimpanzees in the misty bamboo forests of Uganda and Rwanda.",
        count: "1+ Experiences",
        color: "#10B981",
        image:
          services?.[2]?.image ||
          "https://images.unsplash.com/photo-1580674287404-60e2e0fcb95e?w=600",
      },
      {
        icon: "🏖️",
        title: "Beach Escapes",
        description:
          "Pristine white-sand beaches along the Indian Ocean coast with world-class resorts and hidden tropical island paradises.",
        count: "1+ Beaches",
        color: "#EC4899",
        image:
          services?.[3]?.image ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
      },
      {
        icon: "🎭",
        title: "Cultural Immersion",
        description:
          "Authentic experiences with local communities, ancient tribal traditions, and vibrant ceremonies that connect you to Africa's soul.",
        count: "30+ Experiences",
        color: "#8B5CF6",
        image:
          "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600",
      },
      {
        icon: "📸",
        title: "Photography Tours",
        description:
          "Capture award-winning shots with professional photography-focused expeditions through the world's most photogenic landscapes.",
        count: "12+ Tours",
        color: "#EF4444",
        image:
          "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600",
      },
    ],
    [],
  );

  const features = useMemo(
    () => [
      {
        icon: FiAward,
        title: "Expert Local Guides",
        description:
          "Our certified professionals possess deep regional knowledge passed down through generations, ensuring authentic journeys you won't find in any guidebook.",
        accent: "#F59E0B",
      },
      {
        icon: FiShield,
        title: "Safety Guaranteed",
        description:
          "Comprehensive safety protocols, satellite communication, medical kits, and 24/7 on-ground support give you complete peace of mind.",
        accent: "#3B82F6",
      },
      {
        icon: FiHeart,
        title: "Personalized Journeys",
        description:
          "Every itinerary is handcrafted to match your unique interests, pace, and travel style — no cookie-cutter experiences, ever.",
        accent: "#EC4899",
      },
      {
        icon: FiGlobe,
        title: "Sustainable Tourism",
        description:
          "Our eco-friendly practices protect the very landscapes and communities that make East Africa extraordinary for generations to come.",
        accent: "#10B981",
      },
      {
        icon: FiUsers,
        title: "Small Group Sizes",
        description:
          "With a maximum of 12 guests per expedition, enjoy intimate wildlife encounters and personalized attention from your dedicated guide.",
        accent: "#8B5CF6",
      },
      {
        icon: FiClock,
        title: "Flexible Booking",
        description:
          "Life happens — that's why we offer easy date changes, flexible payment plans, and free cancellation up to 30 days before departure.",
        accent: "#F97316",
      },
    ],
    [],
  );

  const processSteps = useMemo(
    () => [
      {
        step: "01",
        title: "Dream & Discover",
        description:
          "Share your travel aspirations with our experts. Whether it's the Great Migration, summiting Kilimanjaro, or a hidden beach paradise — we listen to every detail of your dream journey and begin shaping possibilities.",
        icon: FiCompass,
        image:
          "https://i.pinimg.com/736x/59/86/5b/59865b2946331b97477e3425c60b7d4d.jpg",
      },
      {
        step: "02",
        title: "Design & Customize",
        description:
          "Our travel architects craft a bespoke itinerary tailored to your interests, budget, and timeline. Every accommodation, activity, and transfer is hand-selected for quality, authenticity, and unforgettable impact.",
        icon: FiMap,
        image:
          "https://previews.123rf.com/images/sebra/sebra1703/sebra170300196/74246858-travel-planning-concept-on-map.jpg",
      },
      {
        step: "03",
        title: "Prepare & Pack",
        description:
          "Receive your comprehensive travel guide with packing lists, cultural tips, health advisories, visa guidance, and insider recommendations. Our concierge team handles every logistical detail seamlessly.",
        icon: FiBookOpen,
        image:
          "https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHJhdmVsJTIwcGxhbm5pbmd8ZW58MHx8MHx8fDA%3D&ixlib=rb-4.1.0&q=60&w=3000",
      },
      {
        step: "04",
        title: "Experience & Remember",
        description:
          "Embark on your adventure with confidence, supported by local guides and 24/7 assistance. Create memories that last a lifetime and stories you'll share for generations to come.",
        icon: FiSun,
        image:
          "https://i.pinimg.com/736x/13/bd/69/13bd691c2d9e85cb5009a3d9485d4c94.jpg",
      },
    ],
    [],
  );

  const galleryImages = useMemo(
    () => [
      {
        src: "https://i.pinimg.com/1200x/9b/93/6e/9b936e97002c0ceff3abeb21bf93b6be.jpg",
        alt: "Lion Pride at Dawn",
        location: "Serengeti, Tanzania",
        category: "Wildlife",
        h: 420,
      },
      {
        src: "https://i.pinimg.com/1200x/2a/79/76/2a7976e8a307a072cecfe31610f29b8b.jpg",
        alt: "Kilimanjaro Sunrise",
        location: "Amboseli, Kenya",
        category: "Landscapes",
        h: 280,
      },
      {
        src: "https://i.pinimg.com/1200x/1b/43/8f/1b438ff35ac3e041bda7e258bcc0e97f.jpg",
        alt: "Elephant Migration",
        location: "Tsavo, Kenya",
        category: "Wildlife",
        h: 340,
      },
      {
        src: "https://i.pinimg.com/1200x/a8/cd/38/a8cd38c9fa7a14ce7db3356c0157f6ce.jpg",
        alt: "Zanzibar Paradise",
        location: "Zanzibar, Tanzania",
        category: "Landscapes",
        h: 300,
      },
      {
        src: "https://i.pinimg.com/736x/47/3d/2b/473d2bf229cd5d69c001c016eb5a0bde.jpg",
        alt: "Mountain Gorilla",
        location: "Bwindi, Uganda",
        category: "Wildlife",
        h: 440,
      },
      {
        src: "https://i.pinimg.com/1200x/1e/9a/98/1e9a98f815e57a936dcd66df6b1b97a3.jpg",
        alt: "Maasai Ceremony",
        location: "Masai Mara, Kenya",
        category: "Culture",
        h: 260,
      },
      {
        src: "https://i.pinimg.com/1200x/97/d0/5a/97d05abdeb44c63add9fc725123a9dac.jpg",
        alt: "Summit Glory",
        location: "Kilimanjaro, Tanzania",
        category: "Adventure",
        h: 360,
      },
      {
        src: "https://i.pinimg.com/1200x/93/c0/f2/93c0f2b631667dfdb301b13ce2c58342.jpg",
        alt: "Savannah Sunset",
        location: "Serengeti, Tanzania",
        category: "Landscapes",
        h: 320,
      },
      {
        src: "https://i.pinimg.com/736x/d5/42/5e/d5425e1bcc16b46e4cf40cf2f420e0ef.jpg",
        alt: "Crater Highlands",
        location: "Ngorongoro, Tanzania",
        category: "Adventure",
        h: 380,
      },
    ],
    [],
  );

  const galleryCats = useMemo(
    () => ["All", "Wildlife", "Landscapes", "Culture", "Adventure"],
    [],
  );
  const filteredGallery = useMemo(
    () =>
      galleryFilter === "All"
        ? galleryImages
        : galleryImages.filter((g) => g.category === galleryFilter),
    [galleryFilter, galleryImages],
  );

  const signatureExperiences = useMemo(
    () => [
      {
        title: "The Great Migration",
        subtitle: "Serengeti & Masai Mara",
        description:
          "Witness over two million wildebeest, zebras, and gazelles thundering across the plains in nature's most spectacular wildlife event. Our expert guides position you at the best river crossings and calving grounds for front-row seats to this ancient drama that has played out for millennia.",
        image:
          "https://www.yourafricansafari.com/media/images/photos/2019/8/image_22741.jpg",
        stats: {
          Duration: "7–14 Days",
          Group: "Max 8 Guests",
          Rating: "4.9/5",
        },
      },
      {
        title: "Gorilla Trekking",
        subtitle: "Bwindi & Volcanoes NP",
        description:
          "Trek through emerald bamboo forests to sit just meters from a family of endangered mountain gorillas. With fewer than 1,000 remaining in the wild, this is one of the planet's most humbling and transformative wildlife encounters — a moment that will reshape your understanding of our connection to nature.",
        image:
          "https://i.pinimg.com/736x/47/68/82/476882571830551aee93bee95882881c.jpg",
        stats: { Duration: "3–5 Days", Group: "Max 6 Guests", Rating: "5.0/5" },
      },
      {
        title: "Kilimanjaro Summit",
        subtitle: "Roof of Africa",
        description:
          "Stand on the highest point in Africa at 5,895 meters as the sun rises over the continent. Our experienced mountain guides, premium equipment, and carefully planned acclimatization schedules ensure the highest summit success rates in the industry. This is more than a climb — it's a personal transformation.",
        image:
          "https://i.pinimg.com/1200x/02/d0/5f/02d05f9e9e112c1aeefc87aafdb77adf.jpg",
        stats: {
          Duration: "6–9 Days",
          Group: "Max 10 Guests",
          Rating: "4.8/5",
        },
      },
    ],
    [],
  );

  const partners = useMemo(
    () => [
      { name: "TripAdvisor", badge: "⭐ Excellence 2024" },
      { name: "ATTA", badge: "🌍 Certified Member" },
      { name: "Eco-Tourism", badge: "🌱 Gold Certified" },
      { name: "SafariBookings", badge: "🏆 Top Rated" },
      { name: "Lonely Planet", badge: "📘 Recommended" },
    ],
    [],
  );


  /* ═════════════════ RENDER ═════════════════ */
  return (
    <div ref={homeRootRef} style={{ overflowX: "hidden" }}>
      <ScrollProgress />

      {/* ─── Global Styles ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}

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

        .lr{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#059669,#10B981,#34D399);transform:scaleX(0);transform-origin:left;transition:transform .6s cubic-bezier(.4,0,.2,1)}
        .ch:hover .lr{transform:scaleX(1)}
        .iz{transition:transform .8s cubic-bezier(.4,0,.2,1)}
        .ch:hover .iz{transform:scale(1.06)}

        /* Blob decoration */
        .blob{position:absolute;border-radius:60% 40% 30% 70%/60% 30% 70% 40%;animation:morphBlob 12s ease-in-out infinite;pointer-events:none;filter:blur(60px);opacity:.06}

        /* Destination */
        .dg{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
        .dc{border-radius:24px;overflow:hidden;position:relative;background:#fff;box-shadow:0 2px 20px rgba(0,0,0,.05);transition:all .6s cubic-bezier(.4,0,.2,1);text-decoration:none;display:flex;flex-direction:column}
        .dc:hover{box-shadow:0 30px 70px rgba(5,150,105,.16)}
        .dc .db{position:absolute;inset:-3px;border-radius:27px;padding:3px;background:conic-gradient(from 0deg,#059669,#10B981,#34D399,#059669);opacity:0;transition:opacity .6s;z-index:-1}
        .dc:hover .db{opacity:1}
        .diw{position:relative;height:250px;overflow:hidden}
        .dog{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.6) 100%);opacity:0;transition:opacity .5s}
        .dc:hover .dog{opacity:1}
        .deb{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;color:#fff;transition:transform .5s cubic-bezier(.34,1.56,.64,1);border:2px solid rgba(255,255,255,.3)}
        .dc:hover .deb{transform:translate(-50%,-50%) scale(1)}
        .dcc{padding:24px 26px 28px;flex:1;display:flex;flex-direction:column}
        .drt{display:inline-flex;align-items:center;gap:4px;padding:5px 14px;background:rgba(245,158,11,.12);border-radius:20px;font-size:12px;font-weight:700;color:#92400E;position:absolute;top:16px;right:16px;z-index:3;backdrop-filter:blur(6px)}
        .dct{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#059669;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px}
        .dtt{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:#0F172A;margin-bottom:8px;line-height:1.3}
        .dds{font-size:14px;color:#64748B;line-height:1.65;flex:1;margin-bottom:12px}
        .dm{display:flex;align-items:center;gap:14px;font-size:13px;color:#94A3B8}

        /* Gallery */
        .gf{display:flex;justify-content:center;gap:8px;margin-bottom:44px;flex-wrap:wrap}
        .gfb{padding:10px 24px;border-radius:50px;border:2px solid #E2E8F0;background:transparent;font-size:14px;font-weight:600;color:#64748B;cursor:pointer;transition:all .35s;font-family:inherit}
        .gfb:hover{border-color:#059669;color:#059669}
        .gfb.act{background:#059669;border-color:#059669;color:#fff;box-shadow:0 6px 24px rgba(5,150,105,.3)}
        .gm{columns:3;column-gap:18px}
        .gi{break-inside:avoid;margin-bottom:18px;border-radius:20px;overflow:hidden;position:relative;cursor:pointer;display:block}
        .gi img{width:100%;display:block;transition:transform .7s ease}
        .gi:hover img{transform:scale(1.05)}
        .gio{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(2,44,34,.88) 100%);opacity:0;transition:opacity .45s;display:flex;flex-direction:column;justify-content:flex-end;padding:22px}
        .gi:hover .gio{opacity:1}
        .gii{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;transition:transform .45s cubic-bezier(.34,1.56,.64,1);border:2px solid rgba(255,255,255,.3)}
        .gi:hover .gii{transform:translate(-50%,-50%) scale(1)}
        .gcat{display:inline-block;padding:4px 12px;background:rgba(16,185,129,.2);border-radius:20px;font-size:11px;font-weight:700;color:#34D399;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
        .galt{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:3px}
        .gloc{font-size:13px;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:4px}

        /* Signature */
        .sc{display:grid;grid-template-columns:1fr 1fr;border-radius:32px;overflow:hidden;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.06);min-height:500px;transition:box-shadow .6s}
        .sc:hover{box-shadow:0 32px 80px rgba(0,0,0,.1)}
        .sc.rev{direction:rtl}.sc.rev>*{direction:ltr}
        .siw{position:relative;overflow:hidden;min-height:400px}
        .siw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .9s ease}
        .sc:hover .siw img{transform:scale(1.06)}

        /* Process */
        .ptab{padding:22px 28px;border-left:3px solid #E5E7EB;cursor:pointer;transition:all .45s;background:transparent;border-right:none;border-top:none;border-bottom:none;text-align:left;width:100%;font-family:inherit}
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
        }
        @media(max-width:768px){
          .qs{grid-template-columns:repeat(2,1fr)!important}
          .iis{display:none!important}
          .wg{grid-template-columns:1fr!important}
          .dg{grid-template-columns:1fr!important}
          .ag{grid-template-columns:1fr!important}
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
          html{scroll-behavior:auto}
        }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <Hero />

      {/* ═══════ INTRODUCTION ═══════ */}
      <section
        className="sp"
        style={{
          backgroundColor: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="blob"
          style={{
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            background: "#059669",
          }}
        />
        <div
          className="blob"
          style={{
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            background: "#10B981",
            animationDelay: "4s",
          }}
        />

        <div className="ctr">
          <div
            className="ig"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            <div>
              <TextReveal>
                <span className="sl">
                  <FiCompass size={14} /> Welcome to Altuvera
                </span>
              </TextReveal>
              <TextReveal delay={0.08}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(36px, 4.2vw, 58px)",
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1.12,
                    marginBottom: 28,
                  }}
                >
                  Discover the <span className="tg">Untamed Magic</span> of East
                  Africa
                </h2>
              </TextReveal>
              <TextReveal delay={0.14}>
                <p
                  style={{
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "clamp(22px, 2.5vw, 32px)",
                    color: "#059669",
                    marginBottom: 28,
                    paddingLeft: 24,
                    borderLeft: "4px solid #10B981",
                    lineHeight: 1.4,
                  }}
                >
                  "Where the wild horizon meets your deepest sense of wonder"
                </p>
              </TextReveal>
              {[
                "For over fifteen years, Altuvera has been the trusted compass for discerning travelers seeking extraordinary encounters in East Africa. We don't simply organize trips — we architect <strong>transformative journeys</strong> that weave together the thunder of the Great Migration, the gentle gaze of silverback gorillas, and the warmth of Maasai campfires under star-filled skies.",
                "Our locally-born guides, conservationists, and hospitality artisans share an unshakable commitment to <strong>sustainable, community-driven tourism</strong>. Every safari dollar funds wildlife corridors. Every cultural visit empowers local artisans. Every footprint we leave heals rather than harms.",
                "Whether you're a seasoned explorer or embarking on your first African adventure, our bespoke approach ensures every moment is curated, every detail anticipated, and every memory indelible. This isn't travel — it's transformation.",
              ].map((text, i) => (
                <TextReveal key={i} delay={0.18 + i * 0.06}>
                  <p
                    style={{
                      fontSize: 17,
                      color: "#475569",
                      lineHeight: 1.95,
                      marginBottom: 18,
                    }}
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </TextReveal>
              ))}
              <TextReveal delay={0.4}>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  <MagneticWrap>
                    <Button
                      to="/about"
                      variant="primary"
                      icon={<FiArrowRight size={18} />}
                    >
                      Our Story
                    </Button>
                  </MagneticWrap>
                  <MagneticWrap>
                    <Button to="/explore" variant="outline">
                      Browse Experiences
                    </Button>
                  </MagneticWrap>
                </div>
              </TextReveal>
              <StaggerWrap
                className="qs"
                stagger={0.1}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                  marginTop: 48,
                  paddingTop: 40,
                  borderTop: "1px solid #E5E7EB",
                }}
              >
              </StaggerWrap>
            </div>

            <div className="iw" style={{ position: "relative" }}>
              <AnimatedSection animation="rotateIn" delay={0.2}>
                <div
                  style={{
                    position: "relative",
                    minHeight: "clamp(360px, 52vw, 580px)",
                    width: "100%",
                  }}
                >
                  <ImageCycle
                    images={[
                      "https://i.pinimg.com/736x/c2/26/91/c22691ef2c1f5a1e9544ec1e62774740.jpg",
                      "https://i.pinimg.com/736x/77/d2/9c/77d29c30fa04d28e1b657c5669401f92.jpg",
                      "https://i.pinimg.com/736x/42/d6/3d/42d63db95b5ef30fb1c076829b554a2a.jpg",
                      "https://i.pinimg.com/736x/8d/55/a4/8d55a4b48e6207671ddd3691bbaf5354.jpg",
                      "https://i.pinimg.com/736x/d7/ef/86/d7ef8653e5a71a77f1be064b91fff916.jpg",
                      "https://i.pinimg.com/1200x/d0/af/e3/d0afe34b5ae890a0aa78264647847ba6.jpg",
                      "https://i.pinimg.com/1200x/84/e4/85/84e48535118942a4a468aa686841d974.jpg",
                      "https://i.pinimg.com/736x/55/e3/3e/55e33e50985ece6ae1b4256b880bc1d1.jpg",
                      "https://i.pinimg.com/1200x/bb/eb/a8/bbeba83d5cd3a6f8cef52d503aeb99a8.jpg",
                      "https://i.pinimg.com/736x/a6/fa/e8/a6fae858bd1ecf633229b5dade79c68a.jpg",
                      "https://i.pinimg.com/474x/b5/c6/13/b5c6134e42151a981a41eaf34166e27f.jpg"

                    ]}
                    style={{
                      width: "100%",
                      height: "clamp(360px, 52vw, 520px)",
                      borderRadius: 28,
                      objectFit: "cover",
                      boxShadow: "0 30px 80px rgba(0,0,0,.15)",
                    }}
                    interval={7000}
                  />
                  <ImageCycle
                    images={[
                      "https://www.vjv.com/media/hyegmdk3/giraffe-walking-savanna-queen-elizabeth-national-park-uganda-shutterstock_58932448.jpg?height=1080&quality=60&width=1920",
                      "https://www.travelandleisure.com/thmb/4rmCDPTq85-wHGIak69y6Uv1WWo%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/TAL-ol-jogi-aerial-view-full-ALISTLIZ1125-fde5875b5cbf433b862221dbaccddf92.jpg",
                      "https://i.pinimg.com/736x/42/d6/3d/42d63db95b5ef30fb1c076829b554a2a.jpg",
                      "https://i.pinimg.com/736x/8d/55/a4/8d55a4b48e6207671ddd3691bbaf5354.jpg",
                      "https://i.pinimg.com/736x/d7/ef/86/d7ef8653e5a71a77f1be064b91fff916.jpg",
                      "https://i.pinimg.com/1200x/d0/af/e3/d0afe34b5ae890a0aa78264647847ba6.jpg",
                      "https://i.pinimg.com/1200x/84/e4/85/84e48535118942a4a468aa686841d974.jpg",
                      "https://i.pinimg.com/736x/55/e3/3e/55e33e50985ece6ae1b4256b880bc1d1.jpg",
                      "https://i.pinimg.com/1200x/bb/eb/a8/bbeba83d5cd3a6f8cef52d503aeb99a8.jpg",
                      "https://i.pinimg.com/736x/a6/fa/e8/a6fae858bd1ecf633229b5dade79c68a.jpg",
                      "https://i.pinimg.com/474x/b5/c6/13/b5c6134e42151a981a41eaf34166e27f.jpg"
                    ]}
                    style={{
                      position: "absolute",
                      bottom: "clamp(10px, 3vw, 70px)",
                      left: "clamp(-20px, 1vw, -40px)",
                      width: "clamp(180px, 36%, 280px)",
                      height: "clamp(150px, 40vw, 200px)",
                      borderRadius: 24,
                      objectFit: "cover",
                      border: "8px solid white",
                      boxShadow: "0 30px 70px rgba(0,0,0,.25)",
                      zIndex: 5,
                      animation: "floatSoft 6s ease-in-out infinite",
                    }}
                    className="iis"
                    interval={4500}
                  />
                  <ImageCycle
                    images={[
                      "https://www.vjv.com/media/hyegmdk3/giraffe-walking-savanna-queen-elizabeth-national-park-uganda-shutterstock_58932448.jpg?height=1080&quality=60&width=1920",
                      "https://www.travelandleisure.com/thmb/4rmCDPTq85-wHGIak69y6Uv1WWo%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/TAL-ol-jogi-aerial-view-full-ALISTLIZ1125-fde5875b5cbf433b862221dbaccddf92.jpg",
                      "https://i.pinimg.com/736x/42/d6/3d/42d63db95b5ef30fb1c076829b554a2a.jpg",
                      "https://i.pinimg.com/736x/8d/55/a4/8d55a4b48e6207671ddd3691bbaf5354.jpg",
                      "https://i.pinimg.com/736x/d7/ef/86/d7ef8653e5a71a77f1be064b91fff916.jpg",
                      "https://i.pinimg.com/1200x/d0/af/e3/d0afe34b5ae890a0aa78264647847ba6.jpg",
                      "https://i.pinimg.com/1200x/84/e4/85/84e48535118942a4a468aa686841d974.jpg",
                      "https://i.pinimg.com/736x/55/e3/3e/55e33e50985ece6ae1b4256b880bc1d1.jpg",
                      "https://i.pinimg.com/1200x/bb/eb/a8/bbeba83d5cd3a6f8cef52d503aeb99a8.jpg",
                      "https://i.pinimg.com/736x/a6/fa/e8/a6fae858bd1ecf633229b5dade79c68a.jpg",
                      "https://i.pinimg.com/474x/b5/c6/13/b5c6134e42151a981a41eaf34166e27f.jpg"
                    ]}
                    style={{
                      position: "absolute",
                      bottom: "clamp(70px, 3vw, 70px)",
                      left: "clamp(13pc, 13.6pc , 30pc)",
                      width: "clamp(180px, 36%, 280px)",
                      height: "clamp(150px, 40vw, 200px)",
                      borderRadius: 24,
                      objectFit: "cover",
                      border: "8px solid white",
                      boxShadow: "0 30px 70px rgba(0,0,0,.25)",
                      zIndex: 5,
                      animation: "floatSoft 6s ease-in-out infinite",
                    }}
                    className="iis"
                    interval={4500}
                  />
                  <ImageCycle
                    images={[
                      "https://www.vjv.com/media/hyegmdk3/giraffe-walking-savanna-queen-elizabeth-national-park-uganda-shutterstock_58932448.jpg?height=1080&quality=60&width=1920",
                      "https://www.travelandleisure.com/thmb/4rmCDPTq85-wHGIak69y6Uv1WWo%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/TAL-ol-jogi-aerial-view-full-ALISTLIZ1125-fde5875b5cbf433b862221dbaccddf92.jpg",
                      "https://i.pinimg.com/736x/42/d6/3d/42d63db95b5ef30fb1c076829b554a2a.jpg",
                      "https://i.pinimg.com/736x/8d/55/a4/8d55a4b48e6207671ddd3691bbaf5354.jpg",
                      "https://i.pinimg.com/736x/d7/ef/86/d7ef8653e5a71a77f1be064b91fff916.jpg",
                      "https://i.pinimg.com/1200x/d0/af/e3/d0afe34b5ae890a0aa78264647847ba6.jpg",
                      "https://i.pinimg.com/1200x/84/e4/85/84e48535118942a4a468aa686841d974.jpg",
                      "https://i.pinimg.com/736x/55/e3/3e/55e33e50985ece6ae1b4256b880bc1d1.jpg",
                      "https://i.pinimg.com/1200x/bb/eb/a8/bbeba83d5cd3a6f8cef52d503aeb99a8.jpg",
                      "https://i.pinimg.com/736x/a6/fa/e8/a6fae858bd1ecf633229b5dade79c68a.jpg",
                      "https://i.pinimg.com/474x/b5/c6/13/b5c6134e42151a981a41eaf34166e27f.jpg"
                    ]}
                    style={{
                      position: "absolute",
                      bottom: "clamp(28pc, 3vw, 70px)",
                      left: "clamp(28pc, 10pc, 30pc)",
                      width: "clamp(180px, 36%, 280px)",
                      height: "clamp(150px, 40vw, 200px)",
                      borderRadius: 24,
                      objectFit: "cover",
                      border: "8px solid white",
                      boxShadow: "0 30px 70px rgba(0,0,0,.25)",
                      zIndex: 5,
                      animation: "floatSoft 6s ease-in-out infinite",
                    }}
                    className="iis"
                    interval={4500}
                  />
                                    <motion.div
                    animate={reduced ? {} : { y: [0, -12, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      top: "clamp(6px, 3vw, 20px)",
                      right: "clamp(12px, 3vw, 28px)",
                      width: "clamp(60px, 18vw, 105px)",
                      height: "clamp(60px, 18vw, 120px)",
                      borderRadius: 24,
                      display: "flex",
                      backdropFilter: 'blur(3px)',
                      alignItems: "center",
                      flexDirection: "column",
                      color: "white",
                      boxShadow: "0 20px 50px rgba(5,150,105,.45)",
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(30px, 4vw, 48px)",
                        fontWeight: 800,
                      }}
                    >
                      10+
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        fontWeight: 700,
                      }}
                    >
                      Countries
                    </span>
                  </motion.div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -30,
                      right: -30,
                      width: 130,
                      height: 130,
                      borderRadius: "50%",
                      border: "3px dashed rgba(5,150,105,.15)",
                      animation: "rotateSlow 25s linear infinite",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS ═══════ */}
      <section
        className="sp"
        style={{
          background: "linear-gradient(180deg, #F0FDF4 0%, #fff 100%)",
          position: "relative",
        }}
      >
        <div
          className="blob"
          style={{
            top: "20%",
            right: -200,
            width: 500,
            height: 500,
            background: "#10B981",
          }}
        />
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">
                <FiMapPin size={14} /> Explore Our Destinations
              </span>
              <h2 className="st">
                Handpicked <span className="tg">Destinations</span>
              </h2>
              <p className="ss">
                From the endless plains of the Serengeti to the pristine shores
                of Zanzibar, discover destinations that ignite the soul and stir
                the imagination. Each one is vetted by our team for authenticity
                and wonder.
              </p>
            </div>
          </AnimatedSection>
          <StaggerWrap className="dg" stagger={0.07}>
            {allDestinations.slice(0, 6).map((d, i) => (
              <StaggerChild key={d?.id || d?.slug || i}>
                <Link
                  to={`/destination/${d?.slug || d?.id || ""}`}
                  className="dc ch"
                  aria-label={`Explore ${d?.name || "destination"}`}
                >
                  <div className="db" />
                  <div className="diw">
                    <LazyImage
                      src={getDestImg(d)}
                      alt={d?.name || "Destination"}
                      style={{ width: "100%", height: "100%" }}
                      className="iz"
                    />
                    <div className="dog" />
                    <div className="deb">
                      <FiEye size={22} color="#fff" />
                    </div>
                    {d?.rating && (
                      <span className="drt">
                        <FiStar
                          size={11}
                          style={{ fill: "#F59E0B", color: "#F59E0B" }}
                        />{" "}
                        {d.rating}
                      </span>
                    )}
                  </div>
                  <div className="dcc">
                    <span className="dct">
                      <FiMapPin size={11} /> {d?.country || "East Africa"}
                    </span>
                    <h3 className="dtt">{d?.name || "Destination"}</h3>
                    <p className="dds">
                      {(
                        d?.description ||
                        "Explore this incredible destination with Altuvera's expert-guided experiences across breathtaking landscapes."
                      ).slice(0, 120)}
                      ...
                    </p>
                    <div className="dm">
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FiMapPin size={12} /> {d?.country || "Africa"}
                      </span>
                      {d?.duration && (
                        <span>
                          <FiClock size={12} /> {d.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="lr" />
                </Link>
              </StaggerChild>
            ))}
          </StaggerWrap>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <MagneticWrap>
                <Button
                  to="/destinations"
                  variant="primary"
                  size="large"
                  icon={<FiArrowRight size={18} />}
                >
                  View All Destinations
                </Button>
              </MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section
        className="sp"
        style={{
          background:
            "linear-gradient(180deg, #fff 0%, #F0FDF4 50%, #fff 100%)",
        }}
      >
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">
                <FiTarget size={14} /> How It Works
              </span>
              <h2 className="st">
                Your Journey in <span className="tg">Four Simple Steps</span>
              </h2>
              <p className="ss">
                From the first spark of inspiration to stepping onto African
                soil, we make the entire process seamless, exciting, and utterly
                stress-free.
              </p>
            </div>
          </AnimatedSection>
          <div
            className="pl"
            style={{
              display: "grid",
              gridTemplateColumns: "400px 1fr",
              gap: 48,
              alignItems: "start",
            }}
          >
            <AnimatedSection animation="fadeInLeft">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 8px 40px rgba(0,0,0,.06)",
                }}
              >
                {processSteps.map((s, i) => (
                  <button
                    key={i}
                    className={`ptab ${activeProcess === i ? "act" : ""}`}
                    onClick={() => setActiveProcess(i)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 6,
                      }}
                    >
                      <motion.div
                        animate={{
                          background:
                            activeProcess === i ? "#059669" : "#F1F5F9",
                          color: activeProcess === i ? "#fff" : "#94A3B8",
                        }}
                        transition={{ duration: 0.4 }}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <s.icon size={19} />
                      </motion.div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#059669",
                            fontWeight: 700,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                          }}
                        >
                          Step {s.step}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 18,
                            fontWeight: 700,
                            color: activeProcess === i ? "#059669" : "#1E293B",
                            transition: "color .4s",
                          }}
                        >
                          {s.title}
                        </div>
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      {activeProcess === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            fontSize: 14,
                            color: "#64748B",
                            lineHeight: 1.75,
                            overflow: "hidden",
                            marginTop: 8,
                          }}
                        >
                          {s.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}

                {/* Progress indicator */}
                <div
                  style={{
                    height: 4,
                    background: "#F1F5F9",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{
                      width: `${((activeProcess + 1) / processSteps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #059669, #10B981)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInRight">
              <div
                style={{
                  borderRadius: 28,
                  overflow: "hidden",
                  position: "relative",
                  height: "100%",
                  minHeight: 500,
                  boxShadow: "0 20px 60px rgba(0,0,0,.1)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProcess}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <LazyImage
                      src={processSteps[activeProcess].image}
                      alt={processSteps[activeProcess].title}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </motion.div>
                </AnimatePresence>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.6) 100%)",
                  }}
                />
                <motion.div
                  key={`t-${activeProcess}`}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    position: "absolute",
                    bottom: 36,
                    left: 36,
                    right: 36,
                    color: "white",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#34D399",
                      textTransform: "uppercase",
                      letterSpacing: 2,
                    }}
                  >
                    Step {processSteps[activeProcess].step}
                  </span>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 28,
                      fontWeight: 700,
                      marginBottom: 10,
                      marginTop: 6,
                    }}
                  >
                    {processSteps[activeProcess].title}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.65 }}>
                    {processSteps[activeProcess].description.slice(0, 130)}…
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      
      {/* Countries Aside Component */}
      {!isMobile && <CountryGrid />}

      {/* ═══════ CINEMATIC PARALLAX ═══════ */}
      <ParallaxSection
        image={chatgpt}
        height="78vh"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
          <MagneticWrap strength={0.15} scale={1.05}>
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 30px",
                cursor: "pointer",
                background: "rgba(255,255,255,.08)",
                backdropFilter: "blur(12px)",
                transition: "all .3s",
              }}
            >
              <FiPlay size={34} color="white" style={{ marginLeft: 4 }} />
            </div>
          </MagneticWrap>
        </motion.div>
        <SplitText
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(30px, 5vw, 58px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.12,
            marginBottom: 22,
            display: "block",
          }}
        >
          Experience Africa Through Our Eyes
        </SplitText>
        <TextReveal delay={0.3}>
          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 19px)",
              color: "rgba(255,255,255,.88)",
              lineHeight: 1.8,
              maxWidth: 660,
              margin: "0 auto",
            }}
          >
            Every sunrise over the savannah tells a story. Every encounter with
            wildlife rewrites what you thought possible. Watch how our travelers
            describe the indescribable — and start imagining your own chapter.
          </p>
        </TextReveal>
      </ParallaxSection>

      {/* ═══════ WHY CHOOSE US ═══════ */}
      <section
        className="sp"
        style={{
          backgroundColor: "#F0FDF4",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }}
        />
        <div
          className="blob"
          style={{
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            background: "#059669",
          }}
        />
      </section>

      {/* ═══════ SIGNATURE EXPERIENCES ═══════ */}
      <section
        className="sp"
        style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #fff 100%)" }}
      >
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">
                <FiZap size={14} /> Signature Experiences
              </span>
              <h2 className="st">
                Once-in-a-Lifetime <span className="tg">Encounters</span>
              </h2>
              <p className="ss">
                These aren't tours — they're the experiences travelers fly
                halfway around the world to have. Each refined over a decade to
                deliver pure, unfiltered magic.
              </p>
            </div>
          </AnimatedSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {signatureExperiences.map((exp, i) => (
              <AnimatedSection
                key={exp.title}
                animation={i % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
              >
                <div className={`sc ${i % 2 !== 0 ? "rev" : ""}`}>
                  <div className="siw">
                    <LazyImage
                      src={exp.image}
                      alt={exp.title}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, transparent 60%, rgba(0,0,0,.3) 100%)",
                      }}
                    />
                    {/* Badge */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{
                        position: "absolute",
                        top: 24,
                        left: 24,
                        padding: "8px 18px",
                        background: "rgba(255,255,255,.15)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 30,
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        border: "1px solid rgba(255,255,255,.2)",
                      }}
                    >
                      ⭐ {exp.stats.Rating}
                    </motion.div>
                  </div>
                  <div
                    style={{
                      padding: "clamp(28px, 4vw, 56px)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "#059669",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        marginBottom: 14,
                      }}
                    >
                      {exp.subtitle}
                    </span>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(26px, 3vw, 38px)",
                        fontWeight: 800,
                        color: "#0F172A",
                        marginBottom: 20,
                        lineHeight: 1.18,
                      }}
                    >
                      {exp.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 16,
                        color: "#475569",
                        lineHeight: 1.85,
                        marginBottom: 28,
                      }}
                    >
                      {exp.description}
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 16,
                        marginBottom: 32,
                        padding: "20px 0",
                        borderTop: "1px solid #ff9d009a",
                        borderBottom: "1px solid #17ff02",
                      }}
                    >
                      {Object.entries(exp.stats).map(([k, v]) => (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#94A3B8",
                              textTransform: "uppercase",
                              letterSpacing: 1,
                              marginBottom: 6,
                              fontWeight: 600,
                            }}
                          >
                            {k}
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#0F172A",
                            }}
                          >
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                    <MagneticWrap>
                      <Button
                        to="/booking"
                        variant="primary"
                        icon={<FiArrowRight size={16} />}
                      >
                        Book This Experience
                      </Button>
                    </MagneticWrap>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ADVENTURE TYPES ═══════ */}
      <section
        className="sp"
        style={{ background: "linear-gradient(180deg, #fff 0%, #F0FDF4 100%)" }}
      >
      </section>

      {/* ═══════ GALLERY ═══════ */}
      <section
        className="sp"
        style={{ background: "#fff", position: "relative", overflow: "hidden" }}
      >
        {/* Animated top border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, #059669, #10B981, #34D399, #10B981, #059669)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }}
        />
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 28,
                marginBottom: 16,
              }}
            >
              <div style={{ maxWidth: 600 }}>
                <span className="sl">
                  <FiCamera size={14} /> Visual Stories
                </span>
                <h2 className="st" style={{ marginBottom: 14 }}>
                  Moments That <span className="tg">Take Your Breath Away</span>
                </h2>
                <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.75 }}>
                  A curated collection of real moments captured by our travelers
                  and guides across East Africa's most extraordinary landscapes.
                  Each image tells a story of wonder, connection, and raw
                  beauty. Click any image to explore.
                </p>
              </div>
              <MagneticWrap>
                <Button
                  to="/gallery"
                  variant="outline"
                  icon={<FiArrowUpRight size={16} />}
                >
                  Full Gallery
                </Button>
              </MagneticWrap>
            </div>
          </AnimatedSection>

          {/* Filter */}
          <AnimatedSection animation="fadeInUp">
            <div className="gf">
              {galleryCats.map((cat) => (
                <motion.button
                  key={cat}
                  className={`gfb ${galleryFilter === cat ? "act" : ""}`}
                  onClick={() => setGalleryFilter(cat)}
                  whileTap={{ scale: 0.95 }}
                >
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
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -30 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  onClick={() => setLightboxIdx(galleryImages.indexOf(img))}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${img.alt}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setLightboxIdx(galleryImages.indexOf(img));
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    style={{ height: isMobile ? 260 : img.h }}
                    loading="lazy"
                  />
                  <div className="gio">
                    <span className="gcat">{img.category}</span>
                    <span className="galt">{img.alt}</span>
                    <span className="gloc">
                      <FiMapPin size={12} /> {img.location}
                    </span>
                  </div>
                  <div className="gii">
                    <FiMaximize2 size={20} color="#fff" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Gallery stats */}
          <AnimatedSection animation="fadeInUp">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "clamp(32px, 5vw, 60px)",
                marginTop: 52,
                paddingTop: 36,
                borderTop: "1px solid #E5E7EB",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  num: "2500",
                  suf: "+",
                  label: "Photos Captured",
                  icon: FiCamera,
                },
                {
                  num: "85",
                  suf: "+",
                  label: "Locations Covered",
                  icon: FiMapPin,
                },
                {
                  num: "12",
                  suf: "",
                  label: "Countries Featured",
                  icon: FiGlobe,
                },
                { num: "150", suf: "+", label: "Photographers", icon: FiUsers },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <s.icon
                    size={18}
                    style={{ color: "#059669", marginBottom: 8 }}
                  />
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(24px, 3vw, 34px)",
                      fontWeight: 800,
                      color: "#059669",
                    }}
                  >
                    <Counter end={s.num} suffix={s.suf} />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#94A3B8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {s.label}
                  </div>
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
              onNext={() =>
                setLightboxIdx((p) => (p + 1) % galleryImages.length)
              }
              onPrev={() =>
                setLightboxIdx(
                  (p) => (p - 1 + galleryImages.length) % galleryImages.length,
                )
              }
            />
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section
        ref={testimonialRef}
        className="sp"
        style={{
          background: "linear-gradient(135deg, #022C22 0%, #065F46 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: "none",
          }}
        />
        <div
          className="blob"
          style={{
            top: -200,
            right: -200,
            width: 500,
            height: 500,
            background: "#10B981",
            opacity: 0.04,
          }}
        />
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >

        </div>
      </section>

      {/* ═══════ BLOG ═══════ */}
      <section className="sp" style={{ background: "#fff" }}>
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div className="sh">
              <span className="sl">📝 Travel Journal</span>
              <h2 className="st">
                Latest <span className="tg">Stories & Insights</span>
              </h2>
              <p className="ss">
                Expert destination guides, insider travel tips, wildlife
                updates, and inspiring narratives straight from the heart of
                East Africa.
              </p>
            </div>
          </AnimatedSection>
          <div
            className="bg"
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 28,
            }}
          >
            <AnimatedSection animation="fadeInLeft">
              <Link
                to={`/post/${posts[0]?.slug}`}
                className="ch"
                style={{
                  position: "relative",
                  borderRadius: 28,
                  overflow: "hidden",
                  height: 520,
                  display: "block",
                  textDecoration: "none",
                  transition: "all .6s ease",
                  boxShadow: "0 4px 30px rgba(0,0,0,.08)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 30px 60px rgba(0,0,0,.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 4px 30px rgba(0,0,0,.08)";
                }}
              >
                <LazyImage
                  src={posts[0]?.image}
                  alt={posts[0]?.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                  }}
                  className="iz"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 25%, rgba(0,0,0,.88) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "clamp(24px, 4vw, 42px)",
                    color: "white",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "7px 18px",
                      background: "#059669",
                      borderRadius: 30,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 16,
                    }}
                  >
                    {posts[0]?.category}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(22px, 2.5vw, 34px)",
                      fontWeight: 700,
                      marginBottom: 12,
                      lineHeight: 1.22,
                    }}
                  >
                    {posts[0]?.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      opacity: 0.9,
                      lineHeight: 1.7,
                      marginBottom: 14,
                      maxWidth: 500,
                    }}
                  >
                    {posts[0]?.excerpt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 13,
                      opacity: 0.7,
                    }}
                  >
                    <FiCalendar size={13} /> <span>{posts[0]?.date}</span>
                    <span>•</span>
                    <span>{posts[0]?.readTime}</span>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
            <AnimatedSection animation="fadeInRight">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  height: "100%",
                }}
              >
                {posts.slice(1, 4).map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    style={{
                      display: "flex",
                      gap: 18,
                      padding: 18,
                      borderRadius: 20,
                      background: "#F8FAFC",
                      textDecoration: "none",
                      transition: "all .45s ease",
                      flex: 1,
                      alignItems: "center",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#D1FAE5";
                      e.currentTarget.style.transform = "translateX(6px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    <LazyImage
                      src={post.image}
                      alt={post.title}
                      style={{
                        width: 108,
                        height: 88,
                        borderRadius: 14,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#059669",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          marginBottom: 5,
                          display: "block",
                        }}
                      >
                        {post.category}
                      </span>
                      <h4
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0F172A",
                          marginBottom: 5,
                          lineHeight: 1.3,
                        }}
                      >
                        {post.title}
                      </h4>
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>
                        {post.date} · {post.readTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginTop: 52 }}>
              <MagneticWrap>
                <Button
                  to="/posts"
                  variant="primary"
                  icon={<FiArrowRight size={18} />}
                >
                  Read More Articles
                </Button>
              </MagneticWrap>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ PARTNERS ═══════ */}
      <section
        style={{
          padding: "72px 24px",
          background: "linear-gradient(180deg, #fff 0%, #F0FDF4 100%)",
        }}
      >
        <div className="ctr">
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#64748B",
                  marginBottom: 6,
                }}
              >
                Trusted & Recognized Worldwide
              </h3>
              <p style={{ fontSize: 14, color: "#94A3B8" }}>
                Proud partners and award recipients across the global travel
                industry
              </p>
            </div>
          </AnimatedSection>
          <StaggerWrap
            className="pf"
            stagger={0.08}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 52,
              flexWrap: "wrap",
            }}
          >
            {partners.map((p) => (
              <StaggerChild key={p.name}>
                <MagneticWrap strength={0.15}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      opacity: 0.55,
                      transition: "all .45s",
                      cursor: "pointer",
                      padding: "16px 24px",
                      borderRadius: 18,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.background = "rgba(5,150,105,.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = "0.55";
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: 28 }}>
                      {p.badge.split(" ")[0]}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1E293B",
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#059669",
                        fontWeight: 600,
                      }}
                    >
                      {p.badge.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                </MagneticWrap>
              </StaggerChild>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section
        style={{
          padding: "clamp(72px, 8vw, 115px) 24px",
          background: "linear-gradient(135deg, #059669, #10B981)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />
        <div
          className="blob"
          style={{
            top: "30%",
            left: "10%",
            width: 300,
            height: 300,
            background: "#fff",
            opacity: 0.03,
          }}
        />
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <AnimatedSection animation="scaleIn">
            <motion.div
              animate={reduced ? {} : { y: [0, -8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: 78,
                height: 78,
                borderRadius: "50%",
                background: "rgba(255,255,255,.12)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 26px",
              }}
            >
              <FiMail size={33} color="white" />
            </motion.div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 800,
                color: "white",
                marginBottom: 14,
              }}
            >
              Join Our Adventure Community
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,.88)",
                marginBottom: 34,
                lineHeight: 1.7,
                maxWidth: 550,
                margin: "0 auto 34px",
              }}
            >
              Get exclusive travel inspiration, early-bird offers, wildlife
              migration alerts, and insider tips delivered weekly. Join 25,000+
              fellow adventurers.
            </p>
            {isSubscribed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                style={{
                  padding: "18px 30px",
                  background: "rgba(255,255,255,.18)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  color: "white",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 16,
                }}
              >
                <FiCheck size={20} /> Welcome aboard! Your adventure starts now.
              </motion.div>
            ) : (
              <form
                onSubmit={handleNewsletter}
                className="nf"
                style={{
                  display: "flex",
                  gap: 12,
                  maxWidth: 530,
                  margin: "0 auto",
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "17px 24px",
                    borderRadius: 14,
                    border: "2px solid transparent",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color .35s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#059669")}
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
                <MagneticWrap strength={0.12}>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "17px 30px",
                      background: "#022C22",
                      color: "white",
                      border: "none",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all .35s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#065F46";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#022C22";
                      e.currentTarget.style.transform = "";
                    }}
                  >
                    Subscribe <FiArrowRight size={15} />
                  </motion.button>
                </MagneticWrap>
              </form>
            )}
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,.5)",
                marginTop: 18,
              }}
            >
              No spam, ever. Unsubscribe anytime. Your privacy matters.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <ParallaxSection
        image="https://i.pinimg.com/1200x/e9/54/7b/e9547bbaf9b1f804746e812843f15d84.jpg"
        height="82vh"
        overlay="linear-gradient(135deg, rgba(2,44,34,.93) 0%, rgba(5,150,105,.8) 100%)"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 30px",
              background: "rgba(255,255,255,.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <FiCompass size={28} color="white" />
          </div>
        </motion.div>
        <SplitText
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 58px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.12,
            marginBottom: 22,
            display: "block",
          }}
        >
          Your East African Adventure Awaits
        </SplitText>
        <TextReveal delay={0.3}>
          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 19px)",
              color: "rgba(255,255,255,.88)",
              maxWidth: 680,
              margin: "0 auto 18px",
              lineHeight: 1.8,
            }}
          >
            Let our team of passionate experts design your perfect journey
            through the heart of Africa. From the thundering wildebeest
            crossings of the Mara River to the quiet wonder of a gorilla's gaze
            — your story begins with a single step.
          </p>
        </TextReveal>
        <TextReveal delay={0.4}>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,.6)",
              maxWidth: 520,
              margin: "0 auto 42px",
              lineHeight: 1.7,
            }}
          >
            Start planning today and join 5+ travelers who've discovered
            what makes Altuvera truly unforgettable.
          </p>
        </TextReveal>
        <TextReveal delay={0.5}>
          <div
            className="ctab"
            style={{
              display: "flex",
              gap: 18,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <MagneticWrap>
              <Button
                to="/booking"
                variant="white"
                size="large"
                icon={<FiArrowRight size={18} />}
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
    </div>
  );
};

export default Home;