// src/pages/Services.jsx — Fully Redesigned & Fixed
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import {
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiAward,
  FiHeart,
  FiShield,
  FiClock,
  FiStar,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCompass,
  FiGlobe,
  FiZap,
  FiCamera,
  FiMap,
  FiFeather,
  FiSun,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiPackage,
  FiPlay,
  FiGrid,
  FiNavigation,
  FiLayers,
  FiEye,
  FiThumbsUp,
} from "react-icons/fi";
import { motion, AnimatePresence, useInView } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import TeamCard from "../components/common/TeamCard";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";
import { useFeaturedTestimonials } from "../hooks/useTestimonials";

/* ═══════════════════════════════════════════════
   API CONFIG — using native fetch, NOT apiFetch
═══════════════════════════════════════════════ */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-1-ghrv.onrender.com/api";

/* ═══════════════════════════════════════════════
   TEAM API — safe fetch with retry
═══════════════════════════════════════════════ */
const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: { Accept: "application/json", ...options.headers },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `Status ${res.status}`);
      }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== "AbortError") {
        await new Promise((r) => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== ""
        )
      )
    ).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
};

/* ═══════════════════════════════════════════════
   FALLBACK TEAM DATA
═══════════════════════════════════════════════ */
const FALLBACK_TEAM = [
  {
    id: 1,
    name: "IGIRANEZA Fabrice",
    role: "Founder & CEO",
    department: "Leadership",
    image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
    expertise: [
      "Strategic Planning",
      "Tourism Innovation",
      "Partnership Development",
    ],
    languages: ["English", "French", "Kinyarwanda"],
    location: "Musanze, Rwanda",
    is_featured: true,
    is_active: true,
  },
  {
    id: 2,
    name: "UWIMANA Grace",
    role: "Head of Operations",
    department: "Operations",
    image_url: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Ensures seamless coordination of every itinerary with precision and local expertise.",
    expertise: [
      "Logistics Management",
      "Quality Assurance",
      "Team Coordination",
    ],
    languages: ["English", "Swahili"],
    location: "Musanze, Rwanda",
    is_featured: false,
    is_active: true,
  },
  {
    id: 3,
    name: "MUTABAZI Jean",
    role: "Lead Safari Guide",
    department: "Guides",
    image_url: "https://randomuser.me/api/portraits/men/67.jpg",
    bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards.",
    expertise: [
      "Wildlife Tracking",
      "Bird Identification",
      "Conservation Education",
    ],
    languages: ["English", "Swahili", "French"],
    location: "Serengeti, Tanzania",
    is_featured: true,
    is_active: true,
  },
];

/* ═══════════════════════════════════════════════
   WHY ALTUVERA DATA
═══════════════════════════════════════════════ */
const WHY_DATA = [
  {
    id: 1,
    icon: FiCompass,
    title: "Expert Local Guides",
    desc: "Certified guides with 15+ years of experience, wildlife mastery, and cultural fluency in every region.",
    stat: "15+",
    statLabel: "Years Experience",
    color: "#059669",
    tags: ["Certified", "Multilingual"],
    image:
      "https://i.pinimg.com/236x/14/f8/7f/14f87f11922888cf40a8ca405d731246.jpg",
  },
  {
    id: 2,
    icon: FiFeather,
    title: "Sustainable Practices",
    desc: "Carbon-offset programs, community investment, and eco-certified lodges in every itinerary.",
    stat: "100%",
    statLabel: "Eco-Certified",
    color: "#10b981",
    tags: ["Eco", "Carbon Offset"],
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600",
  },
  {
    id: 3,
    icon: FiLayers,
    title: "Tailored Itineraries",
    desc: "Every journey built from scratch — accommodations, pacing, and experiences matched to your vision.",
    stat: "Custom",
    statLabel: "Built for You",
    color: "#047857",
    tags: ["Bespoke", "Flexible"],
    image:
      "https://i.pinimg.com/1200x/8f/9d/e8/8f9de8dad8e26fc74268e13f37149f92.jpg",
  },
  {
    id: 4,
    icon: FiHeart,
    title: "Cultural Immersion",
    desc: "Go beyond wildlife — share meals with Maasai elders, visit conservation projects, witness living traditions.",
    stat: "50+",
    statLabel: "Communities",
    color: "#0d9488",
    tags: ["Authentic", "Immersive"],
    image:
      "https://i.pinimg.com/736x/e1/5b/9e/e15b9ef8fe7dfae13d170068d8d3008e.jpg",
  },
  {
    id: 5,
    icon: FiShield,
    title: "24/7 Support",
    desc: "From first enquiry to safe return — live in-country assistance, fully insured, zero stress.",
    stat: "24/7",
    statLabel: "Always On",
    color: "#065f46",
    tags: ["Premium", "Insured"],
    image:
      "https://i.pinimg.com/1200x/19/8d/ab/198dab499b95cff53e2a48a8ba02c673.jpg",
  },
  {
    id: 6,
    icon: FiAward,
    title: "Award-Winning",
    desc: "Recognised globally for responsible tourism excellence — 4.9★ average across all review platforms.",
    stat: "4.9★",
    statLabel: "Avg Rating",
    color: "#059669",
    tags: ["5-Star", "Trusted"],
    image:
      "https://i.pinimg.com/736x/08/73/a9/0873a9c33c198ea63293106972294bf0.jpg",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    icon: FiMail,
    title: "Share Your Vision",
    desc: "Tell us your dream destinations, travel dates, budget, and interests through our simple booking form.",
  },
  {
    num: "02",
    icon: FiMap,
    title: "We Craft Your Journey",
    desc: "Our experts design a fully tailored itinerary with handpicked lodges, guides, and experiences.",
  },
  {
    num: "03",
    icon: FiCalendar,
    title: "Review & Confirm",
    desc: "Fine-tune every detail until it's perfect, then secure your spot with flexible payment options.",
  },
  {
    num: "04",
    icon: FiNavigation,
    title: "Travel & Transform",
    desc: "Arrive and let us handle everything. 24/7 support ensures a seamless, unforgettable adventure.",
  },
];

/* ═══════════════════════════════════════════════
   ANIMATION HELPERS
═══════════════════════════════════════════════ */
const EASE = [0.22, 1, 0.36, 1];

const ScrollReveal = ({ children, delay = 0, className = "", style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, height: "100%" }}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const useKeyClose = (fn) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
};

/* ═══════════════════════════════════════════════
   SERVICE CARD — NEW MAGAZINE-STYLE DESIGN
═══════════════════════════════════════════════ */
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const images = useMemo(() => {
    const g =
      Array.isArray(service.gallery) && service.gallery.length
        ? service.gallery
        : null;
    const f =
      Array.isArray(service.images) && service.images.length
        ? service.images
        : null;
    return g || f || [service.image];
  }, [service]);

  const prev = (e) => {
    e.stopPropagation();
    setImgLoaded(false);
    setImgIdx((p) => (p - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setImgLoaded(false);
    setImgIdx((p) => (p + 1) % images.length);
  };

  const features = service.features?.slice(0, 3) || [];

  return (
    <article
      className="sv-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && onClick(service)
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Area */}
      <div className="sv-card__img-area">
        {!imgLoaded && (
          <div
            className="sv-skel"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 0,
              zIndex: 1,
            }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={images[imgIdx]}
            alt={service.title}
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgLoaded(true)}
            className="sv-card__img"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="sv-card__gradient" />

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="sv-card__nav sv-card__nav--prev"
              onClick={prev}
              aria-label="Previous image"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="sv-card__nav sv-card__nav--next"
              onClick={next}
              aria-label="Next image"
            >
              <FiChevronRight size={14} />
            </button>

            <div className="sv-card__dots">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sv-card__dot${
                    i === imgIdx ? " sv-card__dot--active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgLoaded(false);
                    setImgIdx(i);
                  }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category badge */}
        <div className="sv-card__badge">
          <FiZap size={9} /> Premium
        </div>

        {/* Floating number */}
        <div className="sv-card__num">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Content Area */}
      <div className="sv-card__content">
        <h3 className="sv-card__title">{service.title}</h3>

        <p className="sv-card__desc">{service.description}</p>

        {/* Feature tags */}
        {features.length > 0 && (
          <div className="sv-card__tags">
            {features.map((f, i) => (
              <span
                key={i}
                className={`sv-card__tag${
                  i === 0 ? " sv-card__tag--primary" : ""
                }`}
              >
                <FiCheck size={9} strokeWidth={3} />
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="sv-card__divider" />

        {/* CTA */}
        <div className="sv-card__cta">
          <div className="sv-card__cta-left">
            <FiEye size={13} />
            <span>View Experience</span>
          </div>
          <div className="sv-card__cta-arrow">
            <FiArrowRight size={14} />
          </div>
        </div>
      </div>
    </article>
  );
};

/* ═══════════════════════════════════════════════
   WHY CARD — NEW HORIZONTAL SPLIT DESIGN
═══════════════════════════════════════════════ */
const WhyCard = ({ item, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const Icon = item.icon;

  return (
    <div className="sv-why">
      {/* Image side */}
      <div className="sv-why__visual">
        {!imgErr && item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="sv-why__img"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="sv-why__icon-fallback">
            <Icon size={40} />
          </div>
        )}
        <div className="sv-why__overlay" />

        {/* Stat bubble */}
        <div className="sv-why__stat">
          <span className="sv-why__stat-val">{item.stat}</span>
          <span className="sv-why__stat-lbl">{item.statLabel}</span>
        </div>

        {/* Number */}
        <div className="sv-why__num">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Text side */}
      <div className="sv-why__body">
        <div className="sv-why__icon-circle" style={{ "--why-c": item.color }}>
          <Icon size={18} />
        </div>
        <h3 className="sv-why__title">{item.title}</h3>
        <p className="sv-why__desc">{item.desc}</p>
        <div className="sv-why__tag-row">
          {item.tags.map((t, i) => (
            <span key={i} className="sv-why__tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   PROCESS STEP CARD
═══════════════════════════════════════════════ */
const ProcessCard = ({ step, index }) => {
  const Icon = step.icon;
  return (
    <div className="sv-proc">
      <div className="sv-proc__num-wrap">
        <span className="sv-proc__num">{step.num}</span>
        {index < PROCESS_STEPS.length - 1 && (
          <div className="sv-proc__line" />
        )}
      </div>
      <div className="sv-proc__icon">
        <Icon size={22} />
      </div>
      <h4 className="sv-proc__title">{step.title}</h4>
      <p className="sv-proc__desc">{step.desc}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TESTIMONIAL CARD — NEW GLASS DESIGN
═══════════════════════════════════════════════ */
const TestiCard = ({ t }) => {
  const [imgOk, setImgOk] = useState(false);

  return (
    <div className="sv-testi">
      {/* Quote mark */}
      <div className="sv-testi__quote-mark" aria-hidden>
        ❝
      </div>

      {/* Stars */}
      <div className="sv-testi__stars">
        {Array.from({ length: t.rating }).map((_, i) => (
          <FiStar key={i} size={13} fill="#10b981" color="#10b981" />
        ))}
      </div>

      {/* Trip label */}
      {t.trip && (
        <div className="sv-testi__trip">
          <FiCompass size={10} /> {t.trip}
        </div>
      )}

      {/* Quote text */}
      <p className="sv-testi__text">"{t.quote}"</p>

      {/* Author */}
      <div className="sv-testi__author">
        <div className="sv-testi__avatar">
          {t.avatar && (
            <img
              src={t.avatar}
              alt={t.author}
              loading="lazy"
              onLoad={() => setImgOk(true)}
              className="sv-testi__avatar-img"
              style={{ opacity: imgOk ? 1 : 0 }}
            />
          )}
          {!imgOk && (
            <span className="sv-testi__avatar-fallback">
              {t.author?.charAt(0) || "?"}
            </span>
          )}
        </div>
        <div className="sv-testi__author-info">
          <div className="sv-testi__name">{t.author}</div>
          <div className="sv-testi__role">{t.role}</div>
        </div>
        <div className="sv-testi__verified">
          <FiCheck size={11} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SECTION HEAD
═══════════════════════════════════════════════ */
const SectionHead = ({
  label,
  title,
  desc,
  light = false,
  Icon = FiCompass,
}) => (
  <ScrollReveal>
    <div className="sv-head">
      <div className={`sv-label${light ? " sv-label--light" : ""}`}>
        <Icon size={11} /> {label}
      </div>
      <h2 className={`sv-h2${light ? " sv-h2--light" : ""}`}>{title}</h2>
      {desc && (
        <p className={`sv-desc${light ? " sv-desc--light" : ""}`}>{desc}</p>
      )}
    </div>
  </ScrollReveal>
);

/* ═══════════════════════════════════════════════
   SERVICE MODAL — REDESIGNED
═══════════════════════════════════════════════ */
const ServiceModal = ({ service, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgOk, setImgOk] = useState(false);
  const panelRef = useRef(null);

  useKeyClose(onClose);

  useEffect(() => {
    const sy = window.scrollY;
    Object.assign(document.body.style, {
      position: "fixed",
      top: `-${sy}px`,
      width: "100%",
      overflow: "hidden",
    });
    panelRef.current?.focus();
    return () => {
      Object.assign(document.body.style, {
        position: "",
        top: "",
        width: "",
        overflow: "",
      });
      window.scrollTo(0, sy);
    };
  }, []);

  return (
    <motion.div
      className="sv-modal-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${service.title} details`}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className="sv-modal"
        initial={{ scale: 0.92, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 28 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="sv-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={17} />
        </button>

        {/* Hero */}
        <div className="sv-modal__hero">
          {!imgOk && (
            <div
              className="sv-skel"
              style={{ position: "absolute", inset: 0, borderRadius: 0 }}
            />
          )}
          <img
            src={service.image}
            alt={service.title}
            onLoad={() => setImgOk(true)}
            className="sv-modal__hero-img"
            style={{ opacity: imgOk ? 1 : 0 }}
          />
          <div className="sv-modal__hero-overlay" />
          <div className="sv-modal__hero-content">
            <span className="sv-modal__hero-badge">
              <FiPackage size={10} /> Signature Experience
            </span>
            <h2 className="sv-modal__hero-title">{service.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="sv-modal__body">
          <div className="sv-modal__grid">
            {/* Left */}
            <div className="sv-modal__main">
              <div className="sv-modal__section">
                <h3 className="sv-modal__section-label">
                  <FiFeather size={12} /> About This Experience
                </h3>
                <p className="sv-modal__text">{service.description}</p>
              </div>

              <div className="sv-modal__section">
                <h3 className="sv-modal__section-label">
                  <FiCheck size={12} /> What's Included
                </h3>
                <ul className="sv-modal__features">
                  {service.features?.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      className="sv-modal__feature"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04 }}
                    >
                      <span className="sv-modal__feature-check">
                        <FiCheck size={9} strokeWidth={3} />
                      </span>
                      {feat}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Booking panel */}
            <div className="sv-modal__sidebar">
              <div className="sv-modal__booking">
                <h4 className="sv-modal__booking-label">Ready to Book?</h4>
                <p className="sv-modal__booking-desc">
                  Let our team craft your perfect{" "}
                  {service.title.toLowerCase()} experience.
                </p>

                <Button
                  to="/booking"
                  variant="primary"
                  fullWidth
                  size="large"
                  icon={<FiArrowRight size={14} />}
                >
                  Start Planning
                </Button>

                <div className="sv-modal__booking-links">
                  <a
                    href="tel:+250792352409"
                    className="sv-modal__booking-link"
                  >
                    <FiPhone size={14} /> +250 792 352 409
                  </a>
                  <Link
                    to="/contact"
                    className="sv-modal__booking-link"
                    onClick={onClose}
                  >
                    <FiMail size={14} /> Send an Enquiry
                  </Link>
                </div>

                <div className="sv-modal__guarantees">
                  {[
                    "Free consultation — no obligation",
                    "100% satisfaction guarantee",
                    "Flexible payment options",
                  ].map((txt, i) => (
                    <div key={i} className="sv-modal__guarantee">
                      <FiCheck size={12} strokeWidth={3} /> {txt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN SERVICES PAGE
═══════════════════════════════════════════════ */
const Services = () => {
  const [selected, setSelected] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);
  const {
    testimonials,
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useFeaturedTestimonials(6);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollProgress = useScrollProgress();

  const open = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  /* Fetch team using native fetch (NOT apiFetch) */
  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await teamAPI.getAll({
        sort: "display_order",
        order: "ASC",
        limit: 6,
      });
      const arr = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setTeamMembers(arr.length > 0 ? arr : FALLBACK_TEAM);
    } catch (err) {
      setTeamMembers(FALLBACK_TEAM);
      setTeamError(err.message || "Unable to load team members");
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <>
      <SEO
        title="Our Services"
        description="Discover Altuvera's premium safari services across East Africa — wildlife expeditions, gorilla trekking, mountain climbing, beach holidays, and bespoke cultural experiences."
        keywords={[
          "safari services",
          "East Africa travel",
          "guided tours",
          "wildlife expeditions",
          "adventure travel",
        ]}
        url="/services"
        type="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ]}
      />

      <style>{CSS}</style>

      {/* Progress bar */}
      <div className="sv-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="sv-page">
        <PageHeader
          title="Our Services"
          subtitle="Premium travel experiences crafted for the discerning East Africa adventurer"
          backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
          breadcrumbs={[{ label: "Services", path: "/services" }]}
        />

        {/* ═══ SERVICES GRID ═══ */}
        <section className="sv-section">
          <div className="sv-inner">
            <SectionHead
              label="What We Offer"
              title="Tailored Travel Experiences"
              desc="From thrilling wildlife safaris to cultural immersions — explore our complete range of handcrafted East Africa journeys."
              Icon={FiPackage}
            />
            <div className="sv-grid-services">
              {services.map((svc, i) => (
                <ScrollReveal key={svc.id} delay={i * 0.06}>
                  <ServiceCard
                    service={svc}
                    index={i}
                    onClick={open}
                    isMobile={isMobile}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY ALTUVERA ═══ */}
        <section className="sv-section sv-section--mint">
          <div className="sv-inner">
            <SectionHead
              label="Why Choose Us"
              title="The Altuvera Difference"
              desc="Experience the difference that comes with expertise, passion, and an unwavering commitment to excellence."
              Icon={FiAward}
            />
            <div className="sv-grid-why">
              {WHY_DATA.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.07}>
                  <WhyCard item={item} index={i} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="sv-section sv-section--dark">
          <div className="sv-inner">
            <SectionHead
              label="How It Works"
              title="Your Journey in 4 Simple Steps"
              desc="From dreaming to experiencing — here's how we bring your perfect safari to life."
              light
              Icon={FiZap}
            />
            <div className="sv-grid-process">
              {PROCESS_STEPS.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <ProcessCard step={step} index={i} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TEAM ═══ */}
        <section className="sv-section">
          <div className="sv-inner">
            <SectionHead
              label="Meet The Team"
              title="The People Behind Every Journey"
              desc="Our specialists combine local knowledge, conservation experience, and hospitality excellence."
              Icon={FiUsers}
            />

            {teamError && !teamLoading && (
              <div className="sv-team-notice">
                Showing preview team members while live feed is unavailable.
              </div>
            )}

            <div className="sv-grid-team">
              {teamLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="sv-team-skel">
                      <div
                        className="sv-skel"
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: "50%",
                          margin: "0 auto 16px",
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 18,
                          width: "60%",
                          margin: "0 auto 10px",
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 14,
                          width: "40%",
                          margin: "0 auto 16px",
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 11,
                          width: "80%",
                          margin: "0 auto 6px",
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 11,
                          width: "65%",
                          margin: "0 auto",
                        }}
                      />
                    </div>
                  ))
                : teamMembers.map((member, i) => (
                    <ScrollReveal key={member.id || i} delay={i * 0.08}>
                      <TeamCard member={member} />
                    </ScrollReveal>
                  ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="sv-section sv-section--mint">
          <div className="sv-inner">
            <SectionHead
              label="Traveller Stories"
              title="Voices of Our Community"
              desc="Real accounts from travellers who experienced the Altuvera difference."
              Icon={FiHeart}
            />

            <div className="sv-grid-testi">
              {testimonialsLoading ? (
                [0, 1, 2].map((i) => (
                  <ScrollReveal key={`sk-${i}`} delay={i * 0.08}>
                    <div className="sv-testi sv-testi--skel">
                      <div
                        className="sv-skel"
                        style={{
                          height: 14,
                          width: "45%",
                          marginBottom: 16,
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 10,
                          width: "95%",
                          marginBottom: 8,
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 10,
                          width: "80%",
                          marginBottom: 8,
                        }}
                      />
                      <div
                        className="sv-skel"
                        style={{
                          height: 10,
                          width: "60%",
                          marginBottom: 24,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div
                          className="sv-skel"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            className="sv-skel"
                            style={{
                              height: 12,
                              width: "50%",
                              marginBottom: 6,
                            }}
                          />
                          <div
                            className="sv-skel"
                            style={{ height: 10, width: "35%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))
              ) : testimonialsError ? (
                <div className="sv-empty">
                  <p className="sv-empty__title">
                    Could not load testimonials
                  </p>
                  <p className="sv-empty__desc">{testimonialsError}</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="sv-empty">
                  <p className="sv-empty__title">No testimonials yet</p>
                  <p className="sv-empty__desc">
                    Be the first to share your experience!
                  </p>
                </div>
              ) : (
                testimonials.map((t, i) => {
                  const card = {
                    quote: t.testimonial_text || t.text || "",
                    author: t.name || "Traveller",
                    role: t.location || "Verified Traveller",
                    rating: parseInt(t.rating) || 5,
                    avatar: t.avatar_url || t.avatar || "",
                    trip: t.trip || "",
                  };
                  return (
                    <ScrollReveal key={t.id || i} delay={i * 0.07}>
                      <TestiCard t={card} />
                    </ScrollReveal>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="sv-section">
          <div className="sv-inner">
            <ScrollReveal>
              <div className="sv-cta">
                {/* Decorative orbs */}
                <div className="sv-cta__orb sv-cta__orb--1" />
                <div className="sv-cta__orb sv-cta__orb--2" />
                <div className="sv-cta__shimmer" />

                <div className="sv-cta__content">
                  <div className="sv-cta__badge">
                    <FiSun size={11} /> Begin Your Adventure
                  </div>

                  <h2 className="sv-cta__title">
                    Ready to Start Your Journey?
                  </h2>

                  <p className="sv-cta__desc">
                    Contact our expert team and let us design the East African
                    adventure of a lifetime — tailored entirely to you.
                  </p>

                  {/* Trust chips */}
                  <div className="sv-cta__chips">
                    {[
                      "5,000+ travellers",
                      "4.9★ rating",
                      "100% satisfaction",
                    ].map((txt, i) => (
                      <span key={i} className="sv-cta__chip">
                        <FiCheck size={10} strokeWidth={3} /> {txt}
                      </span>
                    ))}
                  </div>

                  <div className="sv-cta__btns">
                    <Button
                      to="/booking"
                      variant="white"
                      size="large"
                      icon={<FiArrowRight size={15} />}
                    >
                      Start Planning
                    </Button>
                    <Button
                      to="/contact"
                      variant="outline"
                      size="large"
                      style={{
                        borderColor: "rgba(255,255,255,.28)",
                        color: "#fff",
                        background: "transparent",
                      }}
                    >
                      <FiMail size={15} /> Contact Us
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selected && (
          <ServiceModal
            key={selected.id}
            service={selected}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   CSS — Complete Responsive Styles
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --sv-green:#059669;
  --sv-green-lt:#10b981;
  --sv-green-dk:#047857;
  --sv-forest:#022c22;
  --sv-mint:#ecfdf5;
  --sv-text:#0f172a;
  --sv-text-2:#475569;
  --sv-text-3:#94a3b8;
  --sv-border:#e2e8f0;
  --sv-surface:#ffffff;
  --sv-bg:#f8fafb;
  --sv-radius:20px;
  --sv-ease:cubic-bezier(0.22,1,0.36,1);
}

/* ── Animations ── */
@keyframes sv-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes sv-gradient-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes sv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes sv-pulse-ring{0%{transform:scale(1);opacity:.3}100%{transform:scale(1.4);opacity:0}}

/* ── Page ── */
.sv-page{
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--sv-bg);
  color:var(--sv-text);
  overflow-x:hidden;
}

/* ── Progress ── */
.sv-progress{
  position:fixed;top:0;left:0;z-index:9999;
  height:3px;
  background:linear-gradient(90deg,#10b981,#059669,#047857);
  transition:width 80ms linear;
  box-shadow:0 0 10px rgba(16,185,129,.4);
}

/* ── Skeleton ── */
.sv-skel{
  background:linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 40%,#f1f5f9 80%);
  background-size:200%;
  border-radius:10px;
  animation:sv-shimmer 1.6s ease infinite;
}

/* ── Section ── */
.sv-section{
  padding:clamp(48px,6vw,88px) clamp(16px,5vw,56px);
}
.sv-section--white{background:#fff}
.sv-section--mint{background:var(--sv-mint)}
.sv-section--dark{
  background:linear-gradient(140deg,var(--sv-forest) 0%,#064e3b 55%,var(--sv-forest) 100%);
  background-size:200% 200%;
  animation:sv-gradient-shift 14s ease infinite;
}
.sv-inner{max-width:1360px;margin:0 auto}

/* ── Section Head ── */
.sv-head{text-align:center;max-width:720px;margin:0 auto clamp(28px,4vw,52px)}
.sv-label{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 16px;border-radius:999px;
  background:var(--sv-mint);color:var(--sv-green-dk);
  font-size:11px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;
  border:1px solid #a7f3d0;margin-bottom:16px;
}
.sv-label--light{
  background:rgba(16,185,129,.15);
  color:#a7f3d0;border-color:rgba(16,185,129,.25);
}
.sv-h2{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(28px,4.5vw,50px);
  font-weight:400;line-height:1.1;
  color:var(--sv-text);margin:0 0 14px;
  letter-spacing:-.025em;
}
.sv-h2--light{color:#fff}
.sv-desc{
  font-size:clamp(14px,1.4vw,16px);
  color:var(--sv-text-2);line-height:1.8;
  max-width:600px;margin:0 auto;
}
.sv-desc--light{color:rgba(255,255,255,.68)}

/* ═══════════════════════════════
   SERVICE CARDS — Magazine Style
═══════════════════════════════ */
.sv-grid-services{
  display:grid;
  gap:clamp(16px,2.5vw,24px);
  grid-template-columns:repeat(3,1fr);
}
@media(max-width:1023px){.sv-grid-services{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.sv-grid-services{grid-template-columns:1fr}}

.sv-card{
  background:#fff;
  border-radius:var(--sv-radius);
  border:1.5px solid var(--sv-border);
  overflow:hidden;
  display:flex;flex-direction:column;
  height:100%;cursor:pointer;
  transition:transform .42s var(--sv-ease),
             box-shadow .42s var(--sv-ease),
             border-color .3s ease;
  position:relative;
}
.sv-card:hover{
  transform:translateY(-8px);
  box-shadow:0 24px 56px rgba(5,150,105,.14),0 0 0 1.5px rgba(16,185,129,.2);
  border-color:rgba(16,185,129,.3);
}
.sv-card:focus-visible{outline:3px solid #10b981;outline-offset:4px}

/* Card Image */
.sv-card__img-area{
  position:relative;
  height:clamp(200px,22vw,240px);
  overflow:hidden;
  flex-shrink:0;
}
.sv-card__img{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:cover;
  transition:transform .65s var(--sv-ease);
}
.sv-card:hover .sv-card__img{transform:scale(1.06)}
.sv-card__gradient{
  position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(2,44,34,.02) 0%,rgba(2,44,34,.72) 100%);
  pointer-events:none;
}

/* Card Nav */
.sv-card__nav{
  position:absolute;top:50%;
  transform:translateY(-50%);
  width:32px;height:32px;border-radius:50%;
  background:rgba(2,44,34,.55);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.2);
  color:#fff;display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:4;
  opacity:0;transition:opacity .3s,background .2s;
}
.sv-card:hover .sv-card__nav{opacity:1}
.sv-card__nav:hover{background:rgba(2,44,34,.85)}
.sv-card__nav--prev{left:10px}
.sv-card__nav--next{right:10px}

/* Card Dots */
.sv-card__dots{
  position:absolute;bottom:14px;left:50%;
  transform:translateX(-50%);
  display:flex;gap:5px;z-index:4;
}
.sv-card__dot{
  width:6px;height:6px;border-radius:999px;
  background:rgba(255,255,255,.4);
  border:none;cursor:pointer;padding:0;
  transition:all .38s var(--sv-ease);
}
.sv-card__dot--active{
  width:22px;
  background:rgba(255,255,255,.95);
}

/* Card Badge */
.sv-card__badge{
  position:absolute;top:12px;left:12px;z-index:5;
  display:inline-flex;align-items:center;gap:4px;
  padding:5px 12px;border-radius:999px;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  font-size:10px;font-weight:800;color:#047857;
  text-transform:uppercase;letter-spacing:1.2px;
  border:1px solid rgba(167,243,208,.5);
}

/* Card Number */
.sv-card__num{
  position:absolute;top:12px;right:12px;z-index:5;
  width:32px;height:32px;border-radius:10px;
  background:rgba(16,185,129,.2);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  border:1px solid rgba(16,185,129,.3);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:#fff;
  letter-spacing:.5px;
}

/* Card Content */
.sv-card__content{
  padding:clamp(16px,2vw,22px);
  flex:1;display:flex;flex-direction:column;
}
.sv-card__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(18px,1.8vw,22px);
  font-weight:400;color:var(--sv-text);
  line-height:1.2;margin:0 0 10px;
  letter-spacing:-.01em;
}
.sv-card__desc{
  font-size:13px;color:var(--sv-text-2);line-height:1.72;
  margin-bottom:16px;
  display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;
}
.sv-card__tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.sv-card__tag{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 10px;border-radius:999px;
  background:#f8fafc;border:1px solid var(--sv-border);
  font-size:11px;font-weight:600;color:var(--sv-text-2);
  max-width:160;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.sv-card__tag--primary{
  background:var(--sv-mint);border-color:#a7f3d0;color:var(--sv-green-dk);
}
.sv-card__divider{
  height:1px;margin-bottom:14px;
  background:linear-gradient(90deg,#e2e8f0,transparent);
}

/* Card CTA */
.sv-card__cta{
  margin-top:auto;
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;border-radius:14px;
  background:var(--sv-mint);border:1.5px solid #a7f3d0;
  transition:all .35s var(--sv-ease);
}
.sv-card:hover .sv-card__cta{
  background:linear-gradient(135deg,#10b981,#059669);
  border-color:#10b981;
}
.sv-card__cta-left{
  display:flex;align-items:center;gap:7px;
  font-size:13px;font-weight:700;color:var(--sv-green-dk);
  transition:color .25s;
}
.sv-card:hover .sv-card__cta-left{color:#fff}
.sv-card__cta-arrow{
  width:30px;height:30px;border-radius:50%;
  background:rgba(5,150,105,.12);
  display:flex;align-items:center;justify-content:center;
  color:var(--sv-green-dk);
  transition:all .3s var(--sv-ease);
}
.sv-card:hover .sv-card__cta-arrow{
  background:rgba(255,255,255,.2);color:#fff;
}

/* ═══════════════════════════════
   WHY CARDS — Split Design
═══════════════════════════════ */
.sv-grid-why{
  display:grid;
  gap:clamp(16px,2.5vw,24px);
  grid-template-columns:repeat(3,1fr);
}
@media(max-width:1023px){.sv-grid-why{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.sv-grid-why{grid-template-columns:1fr}}

.sv-why{
  background:#fff;
  border-radius:var(--sv-radius);
  border:1.5px solid var(--sv-border);
  overflow:hidden;
  display:flex;flex-direction:column;
  height:100%;
  transition:transform .42s var(--sv-ease),
             box-shadow .42s var(--sv-ease),
             border-color .3s ease;
  position:relative;
}
.sv-why:hover{
  transform:translateY(-7px);
  box-shadow:0 20px 48px rgba(5,150,105,.12);
  border-color:rgba(16,185,129,.3);
}
.sv-why::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,#10b981,#059669);
  transform:scaleX(0);transform-origin:left;
  transition:transform .42s var(--sv-ease);
  z-index:2;
}
.sv-why:hover::before{transform:scaleX(1)}

/* Why Visual */
.sv-why__visual{
  position:relative;
  height:180px;overflow:hidden;
  flex-shrink:0;
}
.sv-why__img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .6s var(--sv-ease);
}
.sv-why:hover .sv-why__img{transform:scale(1.06)}
.sv-why__icon-fallback{
  width:100%;height:100%;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#059669,#047857);
  color:rgba(255,255,255,.9);
}
.sv-why__overlay{
  position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 40%,rgba(2,44,34,.5) 100%);
  pointer-events:none;
}

/* Why Stat Bubble */
.sv-why__stat{
  position:absolute;bottom:12px;right:12px;z-index:3;
  display:flex;flex-direction:column;align-items:center;
  padding:8px 14px;border-radius:14px;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  border:1px solid rgba(167,243,208,.5);
  box-shadow:0 4px 14px rgba(0,0,0,.08);
}
.sv-why__stat-val{
  font-size:16px;font-weight:800;color:#047857;
  line-height:1.1;letter-spacing:-.02em;
}
.sv-why__stat-lbl{
  font-size:9px;font-weight:600;color:var(--sv-text-3);
  text-transform:uppercase;letter-spacing:.06em;
}

/* Why Number */
.sv-why__num{
  position:absolute;top:12px;left:12px;z-index:3;
  width:28px;height:28px;border-radius:8px;
  background:rgba(16,185,129,.2);
  border:1px solid rgba(16,185,129,.3);
  display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;color:#fff;
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
}

/* Why Body */
.sv-why__body{
  padding:clamp(18px,2.2vw,24px);
  flex:1;display:flex;flex-direction:column;
}
.sv-why__icon-circle{
  width:42px;height:42px;border-radius:13px;
  background:var(--sv-mint);
  display:flex;align-items:center;justify-content:center;
  color:var(--why-c,#059669);
  margin-bottom:14px;
  transition:all .35s var(--sv-ease);
  border:1.5px solid #a7f3d0;
}
.sv-why:hover .sv-why__icon-circle{
  background:var(--why-c,#059669);
  color:#fff;border-color:var(--why-c,#059669);
  transform:rotate(-4deg) scale(1.05);
}
.sv-why__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(16px,1.6vw,19px);
  font-weight:400;color:var(--sv-text);
  margin:0 0 8px;line-height:1.25;
}
.sv-why__desc{
  font-size:13px;color:var(--sv-text-2);
  line-height:1.72;margin:0 0 14px;flex:1;
}
.sv-why__tag-row{display:flex;flex-wrap:wrap;gap:5px}
.sv-why__tag{
  padding:3px 10px;border-radius:999px;
  background:var(--sv-mint);border:1px solid #a7f3d0;
  font-size:10px;font-weight:700;color:var(--sv-green-dk);
  text-transform:uppercase;letter-spacing:.04em;
}

/* ═══════════════════════════════
   PROCESS STEPS
═══════════════════════════════ */
.sv-grid-process{
  display:grid;
  gap:clamp(16px,2.5vw,24px);
  grid-template-columns:repeat(4,1fr);
}
@media(max-width:900px){.sv-grid-process{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.sv-grid-process{grid-template-columns:1fr}}

.sv-proc{
  background:rgba(255,255,255,.06);
  border:1.5px solid rgba(16,185,129,.15);
  border-radius:var(--sv-radius);
  padding:clamp(22px,3vw,30px);
  text-align:center;
  position:relative;
  transition:all .35s var(--sv-ease);
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
}
.sv-proc:hover{
  background:rgba(255,255,255,.1);
  border-color:rgba(16,185,129,.3);
  transform:translateY(-5px);
}
.sv-proc__num-wrap{
  display:flex;align-items:center;justify-content:center;
  margin-bottom:18px;position:relative;
}
.sv-proc__num{
  width:42px;height:42px;border-radius:50%;
  background:linear-gradient(135deg,#10b981,#059669);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:800;color:#fff;
  box-shadow:0 6px 18px rgba(16,185,129,.35);
  position:relative;z-index:2;
}
.sv-proc__line{
  position:absolute;top:50%;right:-50%;
  width:100%;height:2px;
  background:linear-gradient(90deg,rgba(16,185,129,.3),transparent);
}
@media(max-width:520px){.sv-proc__line{display:none}}
.sv-proc__icon{
  width:52px;height:52px;border-radius:16px;
  background:rgba(16,185,129,.12);
  border:1.5px solid rgba(16,185,129,.2);
  display:flex;align-items:center;justify-content:center;
  color:#a7f3d0;margin:0 auto 16px;
  transition:all .35s var(--sv-ease);
}
.sv-proc:hover .sv-proc__icon{
  background:rgba(16,185,129,.2);
  transform:scale(1.08);
}
.sv-proc__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(15px,1.4vw,18px);
  font-weight:400;color:#fff;
  margin:0 0 8px;
}
.sv-proc__desc{
  font-size:12.5px;color:rgba(255,255,255,.6);
  line-height:1.72;margin:0;
}

/* ═══════════════════════════════
   TESTIMONIALS
═══════════════════════════════ */
.sv-grid-testi{
  display:grid;
  gap:clamp(16px,2.5vw,24px);
  grid-template-columns:repeat(3,1fr);
}
@media(max-width:900px){.sv-grid-testi{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.sv-grid-testi{grid-template-columns:1fr}}

.sv-testi{
  background:#fff;
  border-radius:18px;
  border:1.5px solid var(--sv-border);
  padding:clamp(22px,3vw,28px);
  box-shadow:0 2px 14px rgba(0,0,0,.04);
  transition:transform .38s var(--sv-ease),box-shadow .38s ease;
  height:100%;display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.sv-testi:hover{
  transform:translateY(-5px);
  box-shadow:0 16px 44px rgba(5,150,105,.1);
}
.sv-testi--skel{pointer-events:none}

/* Quote mark */
.sv-testi__quote-mark{
  position:absolute;top:-8px;right:18px;
  font-size:72px;color:#ecfdf5;
  line-height:1;user-select:none;pointer-events:none;
  font-family:'DM Serif Display',Georgia,serif;
}

/* Stars */
.sv-testi__stars{display:flex;gap:3px;margin-bottom:14px;position:relative;z-index:1}

/* Trip */
.sv-testi__trip{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:999px;
  background:var(--sv-mint);border:1px solid #a7f3d0;
  font-size:10px;font-weight:700;color:var(--sv-green-dk);
  text-transform:uppercase;letter-spacing:.07em;
  margin-bottom:14px;
}

/* Quote text */
.sv-testi__text{
  font-size:clamp(13px,1.5vw,14.5px);
  color:var(--sv-text-2);line-height:1.82;
  font-style:italic;flex:1;margin:0 0 20px;
  position:relative;z-index:1;
}

/* Author */
.sv-testi__author{
  display:flex;align-items:center;gap:12px;
  padding:12px 14px;background:#f8fafb;
  border-radius:14px;border:1.5px solid var(--sv-border);
}
.sv-testi__avatar{
  width:44px;height:44px;border-radius:50%;
  overflow:hidden;border:2px solid #a7f3d0;
  background:#ecfdf5;flex-shrink:0;
  position:relative;
}
.sv-testi__avatar-img{
  width:100%;height:100%;object-fit:cover;
  transition:opacity .3s;
}
.sv-testi__avatar-fallback{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:700;color:var(--sv-green-dk);
}
.sv-testi__author-info{flex:1;min-width:0}
.sv-testi__name{font-size:14px;font-weight:700;color:var(--sv-text)}
.sv-testi__role{font-size:11.5px;color:var(--sv-text-3);font-weight:500;margin-top:1px}
.sv-testi__verified{
  width:28px;height:28px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#10b981,#059669);
  display:flex;align-items:center;justify-content:center;
  color:#fff;
}

/* ═══════════════════════════════
   TEAM
═══════════════════════════════ */
.sv-grid-team{
  display:grid;
  gap:clamp(16px,2.5vw,24px);
  grid-template-columns:repeat(3,1fr);
}
@media(max-width:900px){.sv-grid-team{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.sv-grid-team{grid-template-columns:1fr}}

.sv-team-notice{
  text-align:center;margin-bottom:24px;
  color:#b45309;font-size:13px;font-weight:600;
}
.sv-team-skel{
  padding:24px;border-radius:24px;
  background:#fff;border:1px solid #e2e8f0;
  min-height:320px;
}

/* ═══════════════════════════════
   EMPTY STATE
═══════════════════════════════ */
.sv-empty{
  grid-column:1/-1;
  text-align:center;padding:3rem 1rem;color:#64748b;
}
.sv-empty__title{font-weight:600;color:#0f172a;margin-bottom:6px}
.sv-empty__desc{font-size:.88rem}

/* ═══════════════════════════════
   CTA SECTION
═══════════════════════════════ */
.sv-cta{
  max-width:900px;margin:0 auto;
  padding:clamp(48px,6vw,72px) clamp(24px,4vw,72px);
  background:linear-gradient(140deg,var(--sv-forest) 0%,#064e3b 50%,#047857 100%);
  background-size:200% 200%;
  animation:sv-gradient-shift 14s ease infinite;
  border-radius:clamp(22px,3vw,32px);
  box-shadow:0 40px 80px rgba(2,44,34,.25),0 0 60px rgba(16,185,129,.1);
  position:relative;overflow:hidden;text-align:center;
}
.sv-cta__orb{
  position:absolute;width:360px;height:360px;
  border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);
}
.sv-cta__orb--1{top:-40%;left:-12%}
.sv-cta__orb--2{bottom:-40%;right:-12%}
.sv-cta__shimmer{
  position:absolute;top:0;left:12%;right:12%;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(167,243,208,.3),transparent);
}
.sv-cta__content{position:relative;z-index:2}
.sv-cta__badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 16px;border-radius:999px;
  background:rgba(16,185,129,.18);border:1px solid rgba(16,185,129,.3);
  color:#a7f3d0;font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:.08em;
  margin-bottom:20px;
}
.sv-cta__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(28px,5.5vw,52px);font-weight:400;
  color:#fff;line-height:1.1;letter-spacing:-.025em;
  margin:0 0 16px;
}
.sv-cta__desc{
  font-size:clamp(14px,1.5vw,17px);
  color:rgba(255,255,255,.68);
  max-width:520px;margin:0 auto 28px;line-height:1.8;
}
.sv-cta__chips{
  display:flex;flex-wrap:wrap;justify-content:center;
  gap:8px;margin-bottom:32px;
}
.sv-cta__chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 14px;border-radius:999px;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.13);
  font-size:12px;color:rgba(255,255,255,.65);font-weight:500;
}
.sv-cta__btns{
  display:flex;gap:12px;justify-content:center;flex-wrap:wrap;
}

/* ═══════════════════════════════
   MODAL
═══════════════════════════════ */
.sv-modal-bg{
  position:fixed;inset:0;z-index:10000;
  background:rgba(2,44,34,.88);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  display:flex;align-items:center;justify-content:center;
  padding:clamp(8px,2vw,24px);
}
.sv-modal{
  background:#fff;border-radius:clamp(20px,3vw,28px);
  max-width:880px;width:100%;max-height:92vh;
  overflow-y:auto;position:relative;
  box-shadow:0 40px 80px rgba(2,44,34,.3);
  outline:none;
}
.sv-modal::-webkit-scrollbar{width:4px}
.sv-modal::-webkit-scrollbar-track{background:#f0fdf4}
.sv-modal::-webkit-scrollbar-thumb{background:#a7f3d0;border-radius:2px}

.sv-modal__close{
  position:absolute;top:14px;right:14px;
  width:38px;height:38px;border-radius:50%;
  background:rgba(2,44,34,.6);color:#fff;
  border:1px solid rgba(255,255,255,.18);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:10;transition:background .2s;
}
.sv-modal__close:hover{background:rgba(2,44,34,.85)}

/* Modal Hero */
.sv-modal__hero{
  position:relative;
  height:clamp(210px,30vw,320px);
  overflow:hidden;
  border-radius:clamp(20px,3vw,28px) clamp(20px,3vw,28px) 0 0;
}
.sv-modal__hero-img{
  width:100%;height:100%;object-fit:cover;
  transition:opacity .4s;
}
.sv-modal__hero-overlay{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(2,44,34,.85) 0%,rgba(2,44,34,.35) 50%,transparent 100%);
}
.sv-modal__hero-content{
  position:absolute;bottom:0;left:0;right:0;
  padding:clamp(20px,3vw,30px);z-index:2;
}
.sv-modal__hero-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 12px;border-radius:999px;
  background:rgba(16,185,129,.2);border:1px solid rgba(16,185,129,.3);
  color:#a7f3d0;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:.08em;
  margin-bottom:10px;
}
.sv-modal__hero-title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(22px,3.5vw,34px);font-weight:400;
  color:#fff;margin:0;line-height:1.15;
}

/* Modal Body */
.sv-modal__body{padding:clamp(22px,3vw,36px)}
.sv-modal__grid{
  display:grid;
  grid-template-columns:1.35fr 1fr;
  gap:clamp(24px,3vw,36px);
}
@media(max-width:768px){.sv-modal__grid{grid-template-columns:1fr}}
.sv-modal__main{display:flex;flex-direction:column;gap:24px}
.sv-modal__section{margin:0}
.sv-modal__section-label{
  font-size:10px;font-weight:800;color:var(--sv-green-dk);
  letter-spacing:.09em;text-transform:uppercase;
  display:flex;align-items:center;gap:5px;margin-bottom:10px;
}
.sv-modal__text{font-size:14px;color:var(--sv-text-2);line-height:1.82;margin:0}
.sv-modal__features{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px}
.sv-modal__feature{
  display:flex;align-items:flex-start;gap:10px;
  padding:8px 12px;border-radius:12px;
  background:#f8fafb;border:1.5px solid #e2e8f0;
  font-size:13px;color:var(--sv-text-2);line-height:1.6;
}
.sv-modal__feature-check{
  width:18px;height:18px;border-radius:50%;
  background:var(--sv-green);color:#fff;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-top:1px;
}

/* Modal Sidebar */
.sv-modal__sidebar{}
.sv-modal__booking{
  background:var(--sv-mint);padding:clamp(20px,3vw,26px);
  border-radius:18px;border:1.5px solid #a7f3d0;
  position:sticky;top:20px;
}
@media(max-width:768px){.sv-modal__booking{position:static}}
.sv-modal__booking-label{
  font-size:10px;font-weight:800;color:var(--sv-green-dk);
  letter-spacing:.09em;text-transform:uppercase;
  margin:0 0 6px;
}
.sv-modal__booking-desc{
  font-size:13px;color:var(--sv-text-2);margin:0 0 18px;line-height:1.68;
}
.sv-modal__booking-links{
  display:flex;flex-direction:column;gap:8px;margin-top:10px;
}
.sv-modal__booking-link{
  display:flex;align-items:center;gap:9px;
  padding:11px 14px;border-radius:12px;background:#fff;
  border:1.5px solid var(--sv-border);
  font-size:13px;font-weight:600;color:var(--sv-text-2);
  text-decoration:none;cursor:pointer;
  transition:border-color .2s,color .2s;
}
.sv-modal__booking-link:hover{
  border-color:#a7f3d0;color:var(--sv-green-dk);
}
.sv-modal__guarantees{
  margin-top:18px;padding-top:16px;
  border-top:1.5px solid #a7f3d0;
  display:flex;flex-direction:column;gap:8px;
}
.sv-modal__guarantee{
  display:flex;align-items:center;gap:8px;
  font-size:12px;color:var(--sv-text-2);
}

/* ═══════════════════════════════
   RESPONSIVE FINAL TOUCHES
═══════════════════════════════ */
@media(max-width:520px){
  .sv-cta__btns{flex-direction:column;align-items:stretch}
  .sv-cta__chips{flex-direction:column;align-items:center}
  .sv-proc__line{display:none}
}

@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
    scroll-behavior:auto!important;
  }
}
`;

export default Services;