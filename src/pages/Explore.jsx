import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight,
  FiMapPin,
  FiCompass,
  FiCamera,
  FiClock,
  FiStar,
  FiHeart,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiGlobe,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiPhone,
  FiMail,
  FiCheck,
  FiSun,
  FiTarget,
  FiFeather,
  FiBookOpen,
  FiArrowUpRight
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import AnimatedSection from '../components/common/AnimatedSection';
import Button from '../components/common/Button';
import { countries } from '../data/countries';

/* ===================================================================
   DESIGN TOKENS — GREEN & WHITE PALETTE
   =================================================================== */

const G = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
};

const W = {
  pure: '#FFFFFF',
  off: '#FAFFFE',
  warm: '#F8FDF9',
};

const N = {
  900: '#0F1B0F',
  800: '#1A2E1A',
  700: '#2D452D',
  600: '#3F5C3F',
  500: '#5A7A5A',
  400: '#7A9E7A',
  300: '#A8C5A8',
  200: '#D0E3D0',
  100: '#E8F0E8',
  50: '#F4F8F4',
};

/* ===================================================================
   DATA
   =================================================================== */

const EXPERIENCE_FILTERS = [
  { id: 'all', name: 'All', icon: '✨' },
  { id: 'safari', name: 'Safari', icon: '🦁' },
  { id: 'wildlife', name: 'Wildlife', icon: '🐘' },
  { id: 'adventure', name: 'Adventure', icon: '⛰️' },
  { id: 'beach', name: 'Beach', icon: '🏝️' },
  { id: 'cultural', name: 'Cultural', icon: '🏛️' },
];

const GALLERY_SLIDES = [
  {
    images: [
      'https://i.pinimg.com/1200x/ed/00/e4/ed00e4d4f784630b8e1e1fdb9f1e9dbe.jpg',
      'https://i.pinimg.com/736x/db/9f/c0/db9fc09ed986e007870040a56f6383f2.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa73QGCLzaCips2hFLpodiiAJRfXux7sW4yg&s',
      'https://africaadventurevacations.com/wp-content/uploads/2022/01/Top-ten-Serengeti-National-Park-safari-activities.jpg',
    ],
    title: 'Serengeti National Park',
    subtitle: 'Tanzania',
    description:
      'Endless plains stretching to the horizon, where two million wildebeest begin their annual migration — the greatest wildlife show on earth.',
  },
  {
    images: [
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80',
      'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&q=80',
      'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800&q=80',
      'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?w=800&q=80',
    ],
    title: 'Bwindi Impenetrable Forest',
    subtitle: 'Uganda',
    description:
      "Home to nearly half the world's remaining mountain gorillas, this ancient rainforest offers encounters that change perspectives forever.",
  },
  {
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      'https://images.unsplash.com/photo-1521150932951-303a95503ed3?w=800&q=80',
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800&q=80',
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
    ],
    title: 'Mount Kilimanjaro',
    subtitle: 'Tanzania',
    description:
      "Africa's rooftop at 5,895 meters — five climate zones, glacial summits, and a sunrise that makes every step worthwhile.",
  },
];

const FEATURED_EXPERIENCES = [
  {
    id: 'great-migration',
    title: 'Great Migration Safari',
    images: [
      'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
      'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80',
    ],
    location: 'Kenya & Tanzania',
    duration: '7 Days',
    description:
      "Witness millions of wildebeest cross the Mara River in nature's greatest spectacle. Traverse the vast Serengeti plains alongside predators and prey in an ecosystem unchanged for millennia.",
    category: 'safari',
    price: 3500,
    originalPrice: 4200,
    rating: 4.9,
    reviewCount: 124,
    highlights: ['Mara River Crossing', 'Luxury Camps', 'Hot Air Balloon'],
    groupSize: '2-8',
    difficulty: 'Easy',
    featured: true,
  },
  {
    id: 'gorilla-trekking',
    title: 'Mountain Gorilla Trekking',
    images: [
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80',
      'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&q=80',
      'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800&q=80',
    ],
    location: 'Rwanda & Uganda',
    duration: '4 Days',
    description:
      'Face-to-face encounters with endangered mountain gorillas in their misty volcanic habitat. Trek through bamboo forests and sit among gentle giants.',
    category: 'wildlife',
    price: 4200,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 89,
    highlights: ['Gorilla Families', 'Volcano Hikes', 'Conservation'],
    groupSize: '2-6',
    difficulty: 'Moderate',
    featured: true,
  },
  {
    id: 'kilimanjaro-summit',
    title: 'Kilimanjaro Summit Trek',
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      'https://images.unsplash.com/photo-1521150932951-303a95503ed3?w=800&q=80',
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800&q=80',
    ],
    location: 'Tanzania',
    duration: '8 Days',
    description:
      "Conquer Africa's highest peak through five distinct climate zones. From lush rainforest to arctic summit, a truly unforgettable adventure.",
    category: 'adventure',
    price: 2800,
    originalPrice: 3200,
    rating: 4.8,
    reviewCount: 156,
    highlights: ['Uhuru Peak', '5 Climate Zones', 'Expert Guides'],
    groupSize: '4-12',
    difficulty: 'Challenging',
    featured: false,
  },
  {
    id: 'zanzibar-escape',
    title: 'Zanzibar Island Paradise',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80',
    ],
    location: 'Tanzania',
    duration: '5 Days',
    description:
      "Turquoise waters, white-sand beaches, and the intoxicating aroma of spice gardens. Explore Stone Town's winding alleys and dive into pristine coral reefs.",
    category: 'beach',
    price: 1800,
    originalPrice: 2100,
    rating: 4.7,
    reviewCount: 203,
    highlights: ['Stone Town', 'Spice Tours', 'Snorkeling'],
    groupSize: '2-10',
    difficulty: 'Easy',
    featured: false,
  },
  {
    id: 'masai-cultural',
    title: 'Masai Cultural Immersion',
    images: [
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    ],
    location: 'Kenya',
    duration: '3 Days',
    description:
      'Live among the legendary Masai warriors. Learn ancient traditions, participate in ceremonies, craft beadwork, and understand the bond between people and land.',
    category: 'cultural',
    price: 1200,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 67,
    highlights: ['Village Stay', 'Traditional Dance', 'Beadwork'],
    groupSize: '2-8',
    difficulty: 'Easy',
    featured: false,
  },
  {
    id: 'serengeti-luxury',
    title: 'Serengeti Luxury Safari',
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
      'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80',
    ],
    location: 'Tanzania',
    duration: '6 Days',
    description:
      'The ultimate luxury safari. Private game drives in custom 4x4s, five-star lodges with infinity pools, gourmet bush dinners under a canopy of stars.',
    category: 'safari',
    price: 5800,
    originalPrice: 6500,
    rating: 5.0,
    reviewCount: 45,
    highlights: ['Private Drives', '5-Star Lodge', 'Bush Dinner'],
    groupSize: '2-4',
    difficulty: 'Easy',
    featured: true,
  },
];

const EXPERIENCE_CATEGORIES = [
  {
    id: 'wildlife-safaris',
    icon: '🦁',
    title: 'Wildlife Safaris',
    count: 25,
    description:
      'Witness the Big Five roaming free across sprawling savannas and national parks.',
    images: [
      'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
      'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80',
    ],
    path: '/destinations?category=safari',
  },
  {
    id: 'mountain-treks',
    icon: '🏔️',
    title: 'Mountain Treks',
    count: 12,
    description:
      "Scale Africa's most iconic peaks, from Kilimanjaro to the Rwenzori moonscapes.",
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      'https://images.unsplash.com/photo-1521150932951-303a95503ed3?w=800&q=80',
      'https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800&q=80',
    ],
    path: '/destinations?category=trekking',
  },
  {
    id: 'beach-holidays',
    icon: '🏖️',
    title: 'Beach & Island',
    count: 18,
    description:
      "Paradise beaches lapped by the Indian Ocean — from Zanzibar to Kenya's coral coast.",
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80',
    ],
    path: '/destinations?category=beach',
  },
  {
    id: 'cultural-tours',
    icon: '🏛️',
    title: 'Cultural Tours',
    count: 14,
    description:
      'Connect with centuries-old traditions, vibrant communities, and rich heritage.',
    images: [
      'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
      'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    ],
    path: '/destinations?category=cultural',
  },
];

const STATS = [
  { icon: <FiGlobe />, value: '12+', label: 'Countries' },
  { icon: <FiUsers />, value: '50K+', label: 'Happy Travelers' },
  { icon: <FiAward />, value: '98%', label: 'Satisfaction' },
  { icon: <FiStar />, value: '4.9', label: 'Average Rating' },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'London, UK',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    text: 'The Great Migration safari was absolutely breathtaking. Every detail was perfectly planned — from the luxury tented camp to our incredible guide who seemed to know every animal personally. This was genuinely the trip of a lifetime.',
    rating: 5,
    trip: 'Great Migration Safari',
  },
  {
    id: 2,
    name: 'James Chen',
    location: 'San Francisco, USA',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    text: "Gorilla trekking in Rwanda changed my entire perspective on conservation. Sitting just meters from a silverback gorilla and his family was the most profound wildlife encounter I've ever had.",
    rating: 5,
    trip: 'Gorilla Trekking',
  },
  {
    id: 3,
    name: 'Maria Santos',
    location: 'São Paulo, Brazil',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    text: "Summiting Kilimanjaro was the hardest and most rewarding thing I've ever done. The team made it possible and safe — their encouragement got me through the final push to Uhuru Peak at sunrise.",
    rating: 5,
    trip: 'Kilimanjaro Summit',
  },
];

const WHY_ITEMS = [
  {
    icon: <FiSun size={24} />,
    title: 'Year-Round Sunshine',
    text: 'East Africa enjoys warm, pleasant weather throughout the year, making it perfect for travel any season.',
  },
  {
    icon: <FiTarget size={24} />,
    title: 'Unmatched Biodiversity',
    text: 'Home to over 1,100 bird species, the Big Five, mountain gorillas, and marine ecosystems teeming with life.',
  },
  {
    icon: <FiFeather size={24} />,
    title: 'Rich Cultural Heritage',
    text: "From the Masai warriors of Kenya to the ancient kingdoms of Uganda, cultures as diverse as the landscapes.",
  },
  {
    icon: <FiBookOpen size={24} />,
    title: 'Stories That Last Forever',
    text: "These aren't vacations — they're life-changing experiences. Memories that define who you are.",
  },
];

const PHOTO_MOSAIC = [
  {
    src: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=80',
    alt: 'Wildebeest migration across savanna',
    span: 'large',
  },
  {
    src: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&q=80',
    alt: 'Mountain gorilla in forest',
    span: 'small',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    alt: 'Tropical beach with palm trees',
    span: 'small',
  },
  {
    src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    alt: 'Mountain landscape with clouds',
    span: 'medium',
  },
  {
    src: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=80',
    alt: 'Masai warrior at sunset',
    span: 'medium',
  },
  {
    src: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
    alt: 'Safari vehicle and elephants',
    span: 'large',
  },
];

const MAX_COUNTRIES = 6;

/* ===================================================================
   HELPERS
   =================================================================== */

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      size={13}
      style={{
        fill: i < Math.floor(rating) ? G[500] : 'transparent',
        color: i < Math.floor(rating) ? G[500] : N[300],
      }}
    />
  ));

/* ===================================================================
   INJECT GLOBAL CSS
   =================================================================== */

const injectStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('explore-global-css')) return;
  const el = document.createElement('style');
  el.id = 'explore-global-css';
  el.textContent = `
    @keyframes eGradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .e-filter-scroll::-webkit-scrollbar{display:none}
    .e-filter-scroll{-ms-overflow-style:none;scrollbar-width:none}
    @media(max-width:1024px){
      .e-exp-grid{grid-template-columns:1fr 1fr!important}
      .e-cat-grid{grid-template-columns:1fr 1fr!important}
      .e-gallery-pair{grid-template-columns:1fr!important}
      .e-why-split{flex-direction:column!important}
      .e-why-split>div{width:100%!important}
      .e-test-grid{grid-template-columns:1fr!important}
      .e-mosaic{grid-template-columns:1fr 1fr!important}
    }
    @media(max-width:768px){
      .e-exp-grid{grid-template-columns:1fr!important}
      .e-cat-grid{grid-template-columns:1fr!important}
      .e-country-grid{grid-template-columns:1fr 1fr!important}
      .e-stats-grid{grid-template-columns:1fr 1fr!important}
      .e-mosaic{grid-template-columns:1fr!important}
      .e-trust-grid{grid-template-columns:1fr!important}
    }
    @media(max-width:480px){
      .e-country-grid{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(el);
};

/* ===================================================================
   SLIDESHOW HOOK
   =================================================================== */

function useSlideshow(images, interval) {
  const ms = interval || 4500;
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, ms);
    return () => clearInterval(timerRef.current);
  }, [images, ms]);

  const goNext = useCallback(() => {
    if (!images) return;
    setIdx((prev) => (prev + 1) % images.length);
  }, [images]);

  const goPrev = useCallback(() => {
    if (!images) return;
    setIdx((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  return { idx, goNext, goPrev };
}

/* ===================================================================
   SUB-COMPONENTS
   =================================================================== */

function SectionLabel({ icon, text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 24px',
        backgroundColor: G[50],
        borderRadius: 50,
        color: G[700],
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 2.5,
        marginBottom: 20,
        border: '1px solid ' + G[200],
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {text}
    </span>
  );
}

function SectionLabelDark({ icon, text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 24px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 50,
        color: G[300],
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 2.5,
        marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {text}
    </span>
  );
}

function SectionHeader({ icon, label, title, subtitle, align, dark }) {
  const a = align || 'center';
  const d = dark || false;
  return (
    <header style={{ textAlign: a, marginBottom: 60 }}>
      {d ? (
        <SectionLabelDark icon={icon} text={label} />
      ) : (
        <SectionLabel icon={icon} text={label} />
      )}
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(30px,5vw,52px)',
          fontWeight: 700,
          color: d ? W.pure : N[900],
          marginBottom: subtitle ? 18 : 0,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 17,
            color: d ? 'rgba(255,255,255,0.65)' : N[500],
            maxWidth: a === 'center' ? 660 : 'none',
            margin: a === 'center' ? '0 auto' : 0,
            lineHeight: 1.8,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

/* ---- Slideshow Container ---- */

function SlideshowCard({ images, height, borderRadius, children, overlay }) {
  const h = height || 400;
  const br = borderRadius !== undefined ? borderRadius : 24;
  const showOverlay = overlay !== false;
  const { idx, goNext, goPrev } = useSlideshow(images, 5000);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        height: h,
        borderRadius: br,
        overflow: 'hidden',
        backgroundColor: G[900],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {images &&
        images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt=""
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === idx ? 1 : 0,
              transform: i === idx ? 'scale(1)' : 'scale(1.06)',
              transition: 'opacity 1s ease, transform 6s ease',
            }}
          />
        ))}

      {showOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(5,37,20,0.05) 0%, rgba(5,37,20,0.75) 100%)',
          }}
        />
      )}

      {images && images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: W.pure,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 5,
            }}
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: W.pure,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 5,
            }}
          >
            <FiChevronRight size={18} />
          </button>
        </>
      )}

      {images && images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: children ? 'auto' : 16,
            top: children ? 16 : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            zIndex: 5,
          }}
        >
          {images.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === idx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === idx ? G[400] : 'rgba(255,255,255,0.4)',
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>
      )}

      {children && (
        <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ---- Gallery Showcase ---- */

function GalleryShowcase({ data }) {
  const { idx, goNext, goPrev } = useSlideshow(data.images, 5500);
  const [h, setH] = useState(false);

  return (
    <div
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        height: 480,
        backgroundColor: G[950],
        boxShadow: h
          ? '0 30px 60px rgba(22,163,74,0.2)'
          : '0 8px 32px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.4s',
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      {data.images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s ease, transform 7s ease',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(5,46,22,0.3) 0%, rgba(5,46,22,0.8) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'clamp(28px,5vw,48px)',
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: G[300],
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            display: 'block',
          }}
        >
          {data.subtitle}
        </span>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px,4vw,40px)',
            fontWeight: 700,
            color: W.pure,
            marginBottom: 14,
            lineHeight: 1.2,
          }}
        >
          {data.title}
        </h3>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            maxWidth: 560,
            marginBottom: 24,
          }}
        >
          {data.description}
        </p>
        <Link
          to="/destinations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            backgroundColor: G[600],
            color: W.pure,
            borderRadius: 50,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Discover More <FiArrowRight size={15} />
        </Link>
      </div>

      <button
        onClick={goPrev}
        aria-label="Previous"
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          color: W.pure,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: h ? 1 : 0,
          transition: 'opacity 0.3s',
          zIndex: 5,
        }}
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={goNext}
        aria-label="Next"
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          color: W.pure,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: h ? 1 : 0,
          transition: 'opacity 0.3s',
          zIndex: 5,
        }}
      >
        <FiChevronRight size={20} />
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 'clamp(28px,5vw,48px)',
          display: 'flex',
          gap: 6,
          zIndex: 5,
        }}
      >
        {data.images.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === idx ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                i === idx ? G[400] : 'rgba(255,255,255,0.3)',
              transition: 'all 0.4s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Experience Card ---- */

function ExperienceCard({ exp, index }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const hasDiscount =
    exp.originalPrice && exp.originalPrice > exp.price;
  const discount = hasDiscount
    ? Math.round((1 - exp.price / exp.originalPrice) * 100)
    : 0;

  return (
    <article
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: W.pure,
        boxShadow: hovered
          ? '0 24px 56px rgba(22,163,74,0.18)'
          : '0 4px 24px rgba(0,0,0,0.06)',
        transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-10px)' : 'none',
        border: '1px solid ' + (hovered ? G[200] : N[100]),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative' }}>
        <SlideshowCard
          images={exp.images}
          height={280}
          borderRadius={0}
          overlay={false}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </SlideshowCard>

        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 6,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {exp.featured && (
              <span
                style={{
                  padding: '5px 14px',
                  background: 'linear-gradient(135deg,' + G[600] + ',' + G[500] + ')',
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 700,
                  color: W.pure,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <FiAward size={11} /> Featured
              </span>
            )}
            {hasDiscount && (
              <span
                style={{
                  padding: '5px 14px',
                  backgroundColor: G[800],
                  borderRadius: 30,
                  fontSize: 11,
                  fontWeight: 700,
                  color: G[300],
                  textTransform: 'uppercase',
                }}
              >
                Save {discount}%
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: liked
                ? G[600]
                : 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              zIndex: 7,
            }}
            aria-label={
              liked ? 'Remove from wishlist' : 'Add to wishlist'
            }
          >
            <FiHeart
              size={16}
              style={{
                color: W.pure,
                fill: liked ? W.pure : 'transparent',
              }}
            />
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px 28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
          }}
        >
          <FiMapPin size={13} color={G[600]} />
          <span
            style={{ fontSize: 13, color: G[700], fontWeight: 600 }}
          >
            {exp.location}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: N[900],
            marginBottom: 10,
            lineHeight: 1.3,
          }}
        >
          {exp.title}
        </h3>

        <p
          style={{
            fontSize: 14,
            color: N[500],
            lineHeight: 1.7,
            marginBottom: 16,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {exp.description}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 18,
          }}
        >
          {exp.highlights.map((hl, i) => (
            <span
              key={i}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor: G[50],
                color: G[800],
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid ' + G[200],
              }}
            >
              {hl}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {renderStars(exp.rating)}
          </div>
          <span
            style={{ fontSize: 14, fontWeight: 700, color: G[700] }}
          >
            {exp.rating}
          </span>
          <span style={{ fontSize: 13, color: N[400] }}>
            ({exp.reviewCount} reviews)
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 18,
            borderTop: '1px solid ' + N[100],
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: N[500],
                fontWeight: 500,
              }}
            >
              <FiClock size={13} color={G[600]} /> {exp.duration}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: N[500],
                fontWeight: 500,
              }}
            >
              <FiUsers size={13} color={G[600]} /> {exp.groupSize}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            {hasDiscount && (
              <span
                style={{
                  fontSize: 13,
                  textDecoration: 'line-through',
                  color: N[400],
                  display: 'block',
                }}
              >
                {formatPrice(exp.originalPrice)}
              </span>
            )}
            <span style={{ fontSize: 11, color: N[400] }}>From</span>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: G[700],
                lineHeight: 1,
              }}
            >
              {formatPrice(exp.price)}
            </div>
          </div>
        </div>

        <Link
          to={'/booking?experience=' + exp.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 20,
            padding: '14px 0',
            borderRadius: 16,
            backgroundColor: hovered ? G[700] : G[600],
            color: W.pure,
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 700,
            transition: 'background-color 0.3s',
          }}
        >
          View Details <FiArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

/* ---- Country Card ---- */

function CountryCard({ country }) {
  const [h, setH] = useState(false);
  return (
    <Link
      to={'/country/' + country.id}
      style={{
        backgroundColor: W.pure,
        borderRadius: 20,
        padding: '36px 20px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: h
          ? '0 18px 48px rgba(22,163,74,0.14)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        transform: h ? 'translateY(-8px)' : 'none',
        border: '1px solid ' + (h ? G[200] : N[100]),
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg,' + G[500] + ',' + G[400] + ')',
          transform: h ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.4s',
          transformOrigin: 'center',
        }}
      />
      <span
        style={{
          fontSize: 52,
          marginBottom: 14,
          transition: 'transform 0.3s',
          transform: h ? 'scale(1.15)' : 'scale(1)',
          display: 'block',
        }}
      >
        {country.flag}
      </span>
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 20,
          fontWeight: 700,
          color: N[900],
          marginBottom: 6,
        }}
      >
        {country.name}
      </h3>
      <span
        style={{
          fontSize: 13,
          color: G[600],
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {country.tagline}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 20px',
          backgroundColor: h ? G[600] : G[50],
          color: h ? W.pure : G[700],
          borderRadius: 30,
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.3s',
        }}
      >
        Explore <FiArrowRight size={13} />
      </span>
    </Link>
  );
}

/* ---- Category Card ---- */

function CategoryCard({ cat }) {
  const [h, setH] = useState(false);
  return (
    <Link to={cat.path} style={{ textDecoration: 'none' }}>
      <article
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
          transform: h ? 'translateY(-8px)' : 'none',
          boxShadow: h
            ? '0 24px 56px rgba(22,163,74,0.18)'
            : '0 6px 24px rgba(0,0,0,0.06)',
          border: '1px solid ' + (h ? G[200] : 'transparent'),
        }}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
      >
        <SlideshowCard
          images={cat.images}
          height={360}
          borderRadius={0}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(5,46,22,0.15) 0%, rgba(5,46,22,0.88) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: 32,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                fontSize: 30,
                transition: 'transform 0.3s',
                transform: h ? 'scale(1.12)' : 'none',
              }}
            >
              {cat.icon}
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 26,
                fontWeight: 700,
                color: W.pure,
                marginBottom: 8,
              }}
            >
              {cat.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.6,
                marginBottom: 16,
                maxWidth: 340,
              }}
            >
              {cat.description}
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                backgroundColor: h
                  ? G[600]
                  : 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: 30,
                fontSize: 14,
                color: W.pure,
                fontWeight: 600,
                border:
                  '1px solid ' +
                  (h ? G[500] : 'rgba(255,255,255,0.2)'),
                transition: 'all 0.3s',
                width: 'fit-content',
              }}
            >
              {cat.count}+ Trips <FiArrowRight size={14} />
            </span>
          </div>
        </SlideshowCard>
      </article>
    </Link>
  );
}

/* ---- Stat ---- */

function StatItem({ stat }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '36px 20px',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
        border:
          '1px solid rgba(255,255,255,' + (h ? '0.18' : '0.08') + ')',
        transition: 'all 0.35s',
        transform: h ? 'translateY(-6px)' : 'none',
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 22,
          color: G[300],
        }}
      >
        {stat.icon}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 38,
          fontWeight: 800,
          color: W.pure,
          marginBottom: 6,
          lineHeight: 1,
        }}
      >
        {stat.value}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}
      >
        {stat.label}
      </div>
    </div>
  );
}

/* ---- Testimonial ---- */

function TestimonialCard({ t }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{
        backgroundColor: W.pure,
        borderRadius: 24,
        padding: 36,
        boxShadow: h
          ? '0 18px 48px rgba(22,163,74,0.12)'
          : '0 2px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.4s',
        transform: h ? 'translateY(-6px)' : 'none',
        border: '1px solid ' + (h ? G[200] : N[100]),
        position: 'relative',
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 28,
          fontSize: 72,
          fontFamily: 'Georgia, serif',
          color: G[100],
          lineHeight: 1,
        }}
      >
        &ldquo;
      </div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
        {renderStars(t.rating)}
      </div>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.85,
          color: N[600],
          marginBottom: 24,
          fontStyle: 'italic',
          position: 'relative',
          zIndex: 1,
        }}
      >
        &ldquo;{t.text}&rdquo;
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingTop: 18,
          borderTop: '1px solid ' + N[100],
          flexWrap: 'wrap',
        }}
      >
        <img
          src={t.avatar}
          alt={t.name}
          loading="lazy"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid ' + G[200],
          }}
        />
        <div>
          <div
            style={{ fontWeight: 700, color: N[900], fontSize: 15 }}
          >
            {t.name}
          </div>
          <div style={{ fontSize: 13, color: N[400] }}>
            {t.location}
          </div>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            padding: '4px 14px',
            backgroundColor: G[50],
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: G[700],
            border: '1px solid ' + G[200],
          }}
        >
          {t.trip}
        </span>
      </div>
    </div>
  );
}

/* ---- Trust Badge ---- */

function TrustBadge({ icon, title, desc }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: 24,
        borderRadius: 16,
        backgroundColor: W.pure,
        border: '1px solid ' + G[200],
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: G[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: G[700],
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h4
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: N[900],
            marginBottom: 4,
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: 13,
            color: N[500],
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ---- Newsletter ---- */

function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) {
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div
      style={{
        background:
          'linear-gradient(135deg,' + G[700] + ' 0%,' + G[900] + ' 100%)',
        borderRadius: 32,
        padding: 'clamp(40px,6vw,72px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <SectionLabelDark icon={<FiMail size={14} />} text="Stay Inspired" />
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px,4vw,38px)',
            fontWeight: 700,
            color: W.pure,
            marginBottom: 14,
          }}
        >
          Get Exclusive Travel Inspiration
        </h3>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 32,
            lineHeight: 1.7,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Join 25,000+ adventurers receiving hand-picked destination
          stories, insider tips, and members-only offers every week.
        </p>
        {done ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 32px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 50,
              color: G[300],
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <FiCheck size={20} /> Welcome aboard! Check your inbox.
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{
              display: 'flex',
              gap: 12,
              maxWidth: 480,
              margin: '0 auto',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                flex: '1 1 260px',
                padding: '16px 24px',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: W.pure,
                fontSize: 15,
                outline: 'none',
                minWidth: 200,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                borderRadius: 50,
                border: 'none',
                backgroundColor: W.pure,
                color: G[700],
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              Subscribe <FiArrowRight size={16} />
            </button>
          </form>
        )}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 16,
          }}
        >
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}

/* ===================================================================
   MAIN PAGE COMPONENT
   =================================================================== */

function Explore() {
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    injectStyles();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return FEATURED_EXPERIENCES;
    return FEATURED_EXPERIENCES.filter((e) => e.category === filter);
  }, [filter]);

  const displayedCountries = useMemo(
    () => countries.slice(0, MAX_COUNTRIES),
    []
  );

  const pad = 'clamp(80px,12vw,120px) clamp(16px,5vw,48px)';
  const box = { maxWidth: 1400, margin: '0 auto' };

  return (
    <>
      <Helmet>
        <title>
          Explore East Africa | Premium Safari &amp; Adventure Experiences
        </title>
        <meta
          name="description"
          content="Discover incredible safari experiences, wildlife encounters, mountain treks, beach holidays, and cultural tours across East Africa."
        />
      </Helmet>

      <PageHeader
        title="Explore East Africa"
        subtitle="Discover the world's most extraordinary wildlife, landscapes, and cultures in a region where every horizon tells a different story."
        backgroundImage="https://res.cloudinary.com/doijjawna/image/upload/v1772201526/Gemini_Generated_Image_xd99sdxd99sdxd99_ermxfz.png"
        breadcrumbs={[{ label: 'Explore', path: '/explore' }]}
      />

      {/* ============ INTRO EDITORIAL ============ */}
      <section
        style={{
          padding: 'clamp(60px,10vw,100px) clamp(16px,5vw,48px)',
          backgroundColor: W.off,
        }}
      >
        <div style={{ ...box, maxWidth: 900, textAlign: 'center' }}>
          <AnimatedSection animation="fadeInUp">
            <SectionLabel
              icon={<FiCompass size={13} />}
              text="Our Story"
            />
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px,4vw,42px)',
                fontWeight: 700,
                color: N[900],
                lineHeight: 1.25,
                marginBottom: 24,
              }}
            >
              Where the Wild Heart of Africa Beats Loudest
            </h2>
            <p
              style={{
                fontSize: 17,
                color: N[500],
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              East Africa is a land of superlatives — home to the
              world&apos;s greatest wildlife migration, Africa&apos;s tallest
              mountain, the planet&apos;s second-deepest lake, and some of the
              last remaining mountain gorillas on earth. From the
              sun-scorched plains of the Serengeti to the misty peaks of
              the Virunga volcanoes, every corner pulses with life,
              color, and ancient stories waiting to be discovered.
            </p>
            <p
              style={{
                fontSize: 17,
                color: N[500],
                lineHeight: 1.9,
                marginBottom: 0,
              }}
            >
              For over a decade, we have been crafting journeys that go
              beyond ordinary tourism. We connect travelers with local
              communities, support conservation efforts, and design
              experiences that leave both visitors and destinations
              better for the encounter. Whether you seek the thrill of a
              dawn game drive, the serenity of a tropical island, or the
              triumph of a mountain summit — your story begins here.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section
        style={{
          padding: 'clamp(60px,10vw,100px) clamp(16px,5vw,48px)',
          background:
            'linear-gradient(160deg,' + G[900] + ' 0%,' + G[800] + ' 100%)',
        }}
      >
        <div style={box}>
          <div
            className="e-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr)',
              gap: 20,
            }}
          >
            {STATS.map((s, i) => (
              <AnimatedSection
                key={i}
                animation="fadeInUp"
                delay={i * 0.1}
              >
                <StatItem stat={s} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALLERY SHOWCASES ============ */}
      <section style={{ padding: pad }}>
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              icon={<FiCamera size={14} />}
              label="Iconic Destinations"
              title="Places That Take Your Breath Away"
              subtitle="Explore our most beloved destinations through stunning photography and vivid storytelling. Each location delivers moments you will remember forever."
            />
          </AnimatedSection>

          <div
            className="e-gallery-pair"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 28,
              marginBottom: 28,
            }}
          >
            <AnimatedSection animation="fadeInUp" delay={0}>
              <GalleryShowcase data={GALLERY_SLIDES[0]} />
            </AnimatedSection>
            <AnimatedSection animation="fadeInUp" delay={0.15}>
              <GalleryShowcase data={GALLERY_SLIDES[1]} />
            </AnimatedSection>
          </div>
          <AnimatedSection animation="fadeInUp" delay={0.2}>
            <GalleryShowcase data={GALLERY_SLIDES[2]} />
          </AnimatedSection>
        </div>
      </section>

      {/* ============ WHY EAST AFRICA ============ */}
      <section style={{ padding: pad, backgroundColor: G[50] }}>
        <div style={box}>
          <div
            className="e-why-split"
            style={{
              display: 'flex',
              gap: 'clamp(32px,5vw,80px)',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '45%', flexShrink: 0 }}>
              <AnimatedSection animation="fadeInUp">
                <SectionHeader
                  icon={<FiSun size={14} />}
                  label="Why East Africa"
                  title="A Region Like No Other"
                  subtitle="East Africa offers something no other destination can — an unfiltered connection with nature at its most raw and magnificent."
                  align="left"
                />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 20,
                  }}
                >
                  {WHY_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor: W.pure,
                          border: '1px solid ' + G[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: G[700],
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h4
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: N[900],
                            marginBottom: 4,
                          }}
                        >
                          {item.title}
                        </h4>
                        <p
                          style={{
                            fontSize: 14,
                            color: N[500],
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
            <div style={{ width: '55%', flexShrink: 0 }}>
              <AnimatedSection animation="fadeInUp" delay={0.15}>
                <SlideshowCard
                  images={[
                    'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
                    'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
                    'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
                  ]}
                  height={560}
                  borderRadius={28}
                />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED EXPERIENCES ============ */}
      <section style={{ padding: pad }}>
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              icon={<FiCompass size={14} />}
              label="Featured Experiences"
              title="Unforgettable Adventures Await"
              subtitle="Hand-picked experiences that showcase the very best of East Africa — from heart-pounding safaris and gorilla encounters to tropical retreats and cultural immersions."
            />
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp">
            <nav
              className="e-filter-scroll"
              role="tablist"
              aria-label="Filter experiences"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 48,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {EXPERIENCE_FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={active}
                    style={{
                      padding: '12px 26px',
                      borderRadius: 50,
                      border: active
                        ? 'none'
                        : '1.5px solid ' + N[200],
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: active ? G[600] : W.pure,
                      color: active ? W.pure : N[700],
                      boxShadow: active
                        ? '0 4px 14px rgba(22,163,74,0.3)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.3s',
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{f.icon}</span>{' '}
                    {f.name}
                  </button>
                );
              })}
            </nav>
          </AnimatedSection>

          <p style={{ fontSize: 15, color: N[500], marginBottom: 28 }}>
            Showing{' '}
            <strong style={{ color: N[900] }}>{filtered.length}</strong>{' '}
            experience{filtered.length !== 1 ? 's' : ''}
          </p>

          <div
            className="e-exp-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 28,
            }}
          >
            {filtered.map((exp, i) => (
              <AnimatedSection
                key={exp.id}
                animation="fadeInUp"
                delay={i * 0.08}
              >
                <ExperienceCard exp={exp} index={i} />
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <AnimatedSection animation="fadeIn">
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: N[500],
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 16 }}>
                  🌿
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 24,
                    color: N[800],
                    marginBottom: 10,
                  }}
                >
                  No experiences found
                </h3>
                <p style={{ fontSize: 16, marginBottom: 24 }}>
                  Try a different category to discover more adventures.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 50,
                    border: 'none',
                    background:
                      'linear-gradient(135deg,' +
                      G[600] +
                      ',' +
                      G[500] +
                      ')',
                    color: W.pure,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Show All
                </button>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: 'center', marginTop: 56 }}>
              <Button
                to="/destinations"
                variant="primary"
                size="large"
                icon={<FiArrowRight size={18} />}
              >
                Browse All Experiences
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ PHOTO MOSAIC ============ */}
      <section style={{ padding: pad, backgroundColor: G[50] }}>
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              icon={<FiCamera size={14} />}
              label="Visual Journey"
              title="A Glimpse Into the Wild"
              subtitle="Every photograph tells a story of untamed beauty, ancient traditions, and the raw power of nature. These moments await you."
            />
          </AnimatedSection>

          <div
            className="e-mosaic"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 16,
              gridAutoRows: 220,
            }}
          >
            {PHOTO_MOSAIC.map((p, i) => {
              const spanStyle =
                p.span === 'large'
                  ? { gridColumn: 'span 2', gridRow: 'span 2' }
                  : p.span === 'medium'
                  ? { gridColumn: 'span 1', gridRow: 'span 2' }
                  : {};
              return (
                <AnimatedSection
                  key={i}
                  animation="fadeInUp"
                  delay={i * 0.08}
                >
                  <div
                    style={{
                      ...spanStyle,
                      borderRadius: 20,
                      overflow: 'hidden',
                      height: '100%',
                    }}
                  >
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s',
                        display: 'block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ COUNTRIES ============ */}
      <section style={{ padding: pad }}>
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              label="🌍 Destinations"
              title="Explore by Country"
              subtitle="Each East African nation offers a distinct mosaic of landscapes, cultures, and wildlife. Click on a country to explore its unique treasures."
            />
          </AnimatedSection>

          <div
            className="e-country-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 22,
            }}
          >
            {displayedCountries.map((c, i) => (
              <AnimatedSection
                key={c.id}
                animation="fadeInUp"
                delay={i * 0.07}
              >
                <CountryCard country={c} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Button
                to="/destinations"
                variant="primary"
                icon={<FiArrowRight size={18} />}
              >
                View All Countries
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section
        style={{ padding: pad, backgroundColor: G[950] }}
      >
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              icon={<FiTarget size={14} />}
              label="Ways to Travel"
              title="Choose Your Adventure"
              subtitle="Whether you crave the adrenaline of a summit push or the gentle rhythm of a beach hammock, we have the perfect experience for you."
              dark
            />
          </AnimatedSection>

          <div
            className="e-cat-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,1fr)',
              gap: 28,
            }}
          >
            {EXPERIENCE_CATEGORIES.map((cat, i) => (
              <AnimatedSection
                key={cat.id}
                animation="fadeInUp"
                delay={i * 0.1}
              >
                <CategoryCard cat={cat} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EDITORIAL — RESPONSIBLE TRAVEL ============ */}
      <section style={{ padding: pad }}>
        <div style={{ ...box, maxWidth: 900, textAlign: 'center' }}>
          <AnimatedSection animation="fadeInUp">
            <SectionLabel
              icon={<FiBookOpen size={13} />}
              text="Travel Insights"
            />
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px,4vw,42px)',
                fontWeight: 700,
                color: N[900],
                lineHeight: 1.25,
                marginBottom: 24,
              }}
            >
              Responsible Travel, Extraordinary Impact
            </h2>
            <p
              style={{
                fontSize: 17,
                color: N[500],
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              We believe that the best travel experiences leave a
              positive footprint. Every safari we operate, every lodge we
              partner with, and every community we visit is chosen for
              its commitment to conservation and sustainable tourism.
              When you travel with us, a portion of your trip directly
              funds anti-poaching patrols, community schools, and
              wildlife rehabilitation programs.
            </p>
            <p
              style={{
                fontSize: 17,
                color: N[500],
                lineHeight: 1.9,
                marginBottom: 20,
              }}
            >
              Our guides are not just experts in tracking the Big Five —
              they are conservationists, storytellers, and ambassadors
              for their communities. They will share the science behind
              migration patterns, the challenges facing endangered
              species, and the innovative solutions being pioneered
              right here in East Africa.
            </p>
            <p
              style={{
                fontSize: 17,
                color: N[500],
                lineHeight: 1.9,
                marginBottom: 32,
              }}
            >
              From carbon-offset flights to solar-powered lodges, from
              locally sourced meals to fair-trade handicrafts — every
              detail of your journey supports the people and places that
              make East Africa so extraordinary. Travel should be a
              force for good, and together, we are making sure it is.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 32px',
                  backgroundColor: G[600],
                  color: W.pure,
                  borderRadius: 50,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Our Mission <FiArrowRight size={15} />
              </Link>
              <Link
                to="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 32px',
                  backgroundColor: G[50],
                  color: G[700],
                  borderRadius: 50,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  border: '2px solid ' + G[200],
                }}
              >
                Sustainability <FiArrowUpRight size={15} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section style={{ padding: pad, backgroundColor: G[50] }}>
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <SectionHeader
              icon={<FiStar size={14} />}
              label="Traveler Stories"
              title="Voices of Our Community"
              subtitle="Real stories from real travelers who experienced the magic of East Africa with us — and came back transformed."
            />
          </AnimatedSection>

          <div
            className="e-test-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 28,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection
                key={t.id}
                animation="fadeInUp"
                delay={i * 0.1}
              >
                <TestimonialCard t={t} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST BADGES ============ */}
      <section
        style={{
          padding: 'clamp(60px,8vw,80px) clamp(16px,5vw,48px)',
        }}
      >
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <div
              style={{
                textAlign: 'center',
                marginBottom: 48,
              }}
            >
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: N[900],
                  marginBottom: 10,
                }}
              >
                Travel With Complete Confidence
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: N[500],
                  maxWidth: 560,
                  margin: '0 auto',
                }}
              >
                Your safety, satisfaction, and peace of mind are our top
                priorities from first enquiry to final farewell.
              </p>
            </div>
          </AnimatedSection>
          <div
            className="e-trust-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
            }}
          >
            <AnimatedSection animation="fadeInUp" delay={0}>
              <TrustBadge
                icon={<FiShield size={22} />}
                title="100% Financial Protection"
                desc="Your payments are fully secured and insured. Book with absolute confidence."
              />
            </AnimatedSection>
            <AnimatedSection animation="fadeInUp" delay={0.08}>
              <TrustBadge
                icon={<FiCalendar size={22} />}
                title="Flexible Cancellation"
                desc="Plans change — cancel up to 30 days before departure for a full refund."
              />
            </AnimatedSection>
            <AnimatedSection animation="fadeInUp" delay={0.16}>
              <TrustBadge
                icon={<FiPhone size={22} />}
                title="24/7 Expert Support"
                desc="Our travel specialists are always available, wherever you are in the world."
              />
            </AnimatedSection>
            <AnimatedSection animation="fadeInUp" delay={0.24}>
              <TrustBadge
                icon={<FiAward size={22} />}
                title="Award-Winning Company"
                desc="Recognized by leading publications for excellence in African travel."
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section
        style={{
          padding: 'clamp(60px,8vw,80px) clamp(16px,5vw,48px)',
          backgroundColor: G[50],
        }}
      >
        <div style={box}>
          <AnimatedSection animation="fadeInUp">
            <NewsletterBlock />
          </AnimatedSection>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section
        style={{
          padding: 'clamp(100px,15vw,160px) clamp(16px,5vw,48px)',
          background:
            'linear-gradient(160deg,' +
            N[900] +
            ' 0%,' +
            G[900] +
            ' 40%,' +
            G[800] +
            ' 100%)',
          backgroundSize: '200% 200%',
          animation: 'eGradient 10s ease infinite',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '12%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ ...box, position: 'relative', zIndex: 1 }}>
          <AnimatedSection animation="scaleIn">
            <SectionLabelDark
              icon={<FiCompass size={14} />}
              text="Begin Your Story"
            />
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(34px,6vw,58px)',
                fontWeight: 800,
                color: W.pure,
                marginBottom: 20,
                lineHeight: 1.15,
              }}
            >
              Your East African
              <br />
              Adventure Starts Here
            </h2>
            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 44,
                maxWidth: 640,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.8,
              }}
            >
              Whether you dream of golden savannas, misty mountains, or
              turquoise shores — our expert travel designers will craft
              a journey as unique as you are. No detail too small, no
              dream too big.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                to="/booking"
                variant="white"
                size="large"
                icon={<FiArrowRight size={18} />}
              >
                Plan Your Trip
              </Button>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '18px 36px',
                  borderRadius: 50,
                  border: '2px solid rgba(255,255,255,0.25)',
                  backgroundColor: 'transparent',
                  color: W.pure,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 700,
                  transition: 'all 0.3s',
                }}
              >
                <FiMail size={18} /> Speak to an Expert
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

export default Explore;