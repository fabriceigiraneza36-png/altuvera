// src/pages/Services.jsx
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
  FiMessageCircle,
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
  FiBriefcase,
  FiPackage,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import AnimatedSection from "../components/common/AnimatedSection";
import TeamCard from "../components/common/TeamCard";
import { useMediaQuery } from "../hooks/useMediaQuery";
import useScrollProgress from "../hooks/useScrollProgress";
import { services } from "../data/services";
import { useFeaturedTestimonials } from "../hooks/useTestimonials";

/* ─────────────────────────────────────────────
   INJECT FONTS + BASE STYLES
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --sv-green:    #059669;
      --sv-green-lt: #10b981;
      --sv-green-dk: #047857;
      --sv-forest:   #022c22;
      --sv-mint:     #ecfdf5;
      --sv-text:     #0f172a;
      --sv-text-2:   #475569;
      --sv-text-3:   #94a3b8;
      --sv-border:   #e2e8f0;
      --sv-surface:  #ffffff;
      --sv-bg:       #f8fafb;
      --sv-radius:   20px;
      --sv-ease:     cubic-bezier(0.22,1,0.36,1);
    }

    @keyframes sv-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes sv-gradient-shift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes sv-fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .sv-page {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--sv-bg);
      color: var(--sv-text);
    }

    /* ── Scroll progress bar ── */
    .sv-progress {
      position: fixed; top: 0; left: 0; z-index: 9999;
      height: 3px;
      background: linear-gradient(90deg, #10b981, #059669, #047857);
      transition: width 80ms linear;
      box-shadow: 0 0 10px rgba(16,185,129,.4);
    }

    /* ── Section ── */
    .sv-section {
      padding: clamp(48px,6vw,80px) clamp(16px,5vw,56px);
    }
    .sv-section--white { background: #fff; }
    .sv-section--mint  { background: var(--sv-mint); }
    .sv-section--dark  {
      background: linear-gradient(140deg, var(--sv-forest) 0%, #064e3b 55%, var(--sv-forest) 100%);
      background-size: 200% 200%;
      animation: sv-gradient-shift 14s ease infinite;
    }
    .sv-inner { max-width: 1360px; margin: 0 auto; }

    /* ── Section head ── */
    .sv-head {
      text-align: center;
      max-width: 720px;
      margin: 0 auto clamp(28px,4vw,48px);
    }
    .sv-label {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 16px; border-radius: 999px;
      background: var(--sv-mint); color: var(--sv-green-dk);
      font-size: 11px; font-weight: 700;
      letter-spacing: .08em; text-transform: uppercase;
      border: 1px solid #a7f3d0; margin-bottom: 16px;
    }
    .sv-label--light {
      background: rgba(16,185,129,.15);
      color: #a7f3d0; border-color: rgba(16,185,129,.25);
    }
    .sv-h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(28px,4.5vw,50px);
      font-weight: 400; line-height: 1.1;
      color: var(--sv-text); margin: 0 0 14px;
      letter-spacing: -.025em;
    }
    .sv-h2--light { color: #fff; }
    .sv-desc {
      font-size: clamp(14px,1.4vw,16px);
      color: var(--sv-text-2); line-height: 1.8;
      max-width: 600px; margin: 0 auto;
    }
    .sv-desc--light { color: rgba(255,255,255,.68); }

    /* ── Skeleton shimmer ── */
    .sv-skel {
      background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 40%, #f1f5f9 80%);
      background-size: 200%; border-radius: 10px;
      animation: sv-shimmer 1.6s ease infinite;
    }

    /* ─── SERVICE CARD ─── */
    .sv-card {
      background: #fff;
      border-radius: var(--sv-radius);
      border: 1.5px solid var(--sv-border);
      box-shadow: 0 2px 16px rgba(0,0,0,.05);
      overflow: hidden;
      display: flex; flex-direction: column;
      height: 100%; cursor: pointer;
      transition: transform .42s var(--sv-ease),
                  box-shadow .42s var(--sv-ease),
                  border-color .3s ease;
    }
    .sv-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 56px rgba(5,150,105,.14), 0 0 0 1.5px rgba(16,185,129,.2);
      border-color: rgba(16,185,129,.3);
    }
    .sv-card:focus-visible {
      outline: 3px solid #10b981; outline-offset: 4px;
    }
    .sv-card__img {
      transition: transform .65s var(--sv-ease);
    }
    .sv-card:hover .sv-card__img { transform: scale(1.06); }

    .sv-card__cta {
      transition: background .35s var(--sv-ease), color .25s ease;
    }
    .sv-card:hover .sv-card__cta {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: #fff !important;
    }
    .sv-card:hover .sv-card__cta-icon { color: #fff !important; }
    .sv-card:hover .sv-card__cta-text { color: #fff !important; }

    /* ── Why cards ── */
    .sv-why-card {
      background: #fff;
      border-radius: 18px;
      border: 1.5px solid var(--sv-border);
      padding: clamp(22px,3vw,30px);
      transition: transform .38s var(--sv-ease), box-shadow .38s ease, border-color .3s ease;
      height: 100%;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .sv-why-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 44px rgba(5,150,105,.1);
      border-color: rgba(16,185,129,.28);
    }
    .sv-why-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, #10b981, #059669);
      transform: scaleX(0); transform-origin: left;
      transition: transform .42s var(--sv-ease);
    }
    .sv-why-card:hover::before { transform: scaleX(1); }
    .sv-why-icon {
      transition: transform .4s var(--sv-ease), background .3s ease;
    }
    .sv-why-card:hover .sv-why-icon {
      transform: scale(1.08) rotate(-4deg);
      background: var(--sv-green) !important;
      color: #fff !important;
    }

    /* ── Testimonial card ── */
    .sv-testi-card {
      background: #fff;
      border-radius: 18px;
      border: 1.5px solid var(--sv-border);
      padding: clamp(22px,3vw,28px);
      box-shadow: 0 2px 14px rgba(0,0,0,.04);
      transition: transform .38s var(--sv-ease), box-shadow .38s ease;
      height: 100%; display: flex; flex-direction: column;
      position: relative; overflow: hidden;
    }
    .sv-testi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 44px rgba(5,150,105,.1);
    }

    /* ── Modal scrollbar ── */
    .sv-modal-scroll::-webkit-scrollbar { width: 4px; }
    .sv-modal-scroll::-webkit-scrollbar-track { background: #f0fdf4; }
    .sv-modal-scroll::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 2px; }

    /* ── Grids ── */
    .sv-grid-3 {
      display: grid;
      gap: clamp(16px,2.5vw,24px);
      grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr));
    }
    .sv-grid-2 {
      display: grid;
      gap: clamp(14px,2vw,20px);
      grid-template-columns: repeat(auto-fill, minmax(min(100%,280px),1fr));
    }

    @media (max-width: 480px) {
      .sv-grid-3, .sv-grid-2 { grid-template-columns: 1fr; }
    }
    @media (min-width: 481px) and (max-width: 767px) {
      .sv-grid-3 { grid-template-columns: repeat(2,1fr); }
      .sv-grid-2 { grid-template-columns: repeat(2,1fr); }
    }
    @media (min-width: 768px) {
      .sv-grid-3 { grid-template-columns: repeat(3,1fr); }
      .sv-grid-2 { grid-template-columns: repeat(3,1fr); }
    }
    @media (min-width: 1100px) {
      .sv-grid-3 { grid-template-columns: repeat(3,1fr); }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }

    /* ══════════════════════════════════════════
       WHY ALTUVERA — NEW GREEN CARD DESIGN
    ══════════════════════════════════════════ */
    .why-section {
      padding: clamp(3rem,6vw,5rem) 0;
      background: #f0fdf4;
    }
    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .why-card {
      background: #fff;
      border-radius: 1.75rem;
      overflow: hidden;
      border: 1px solid #d1fae5;
      box-shadow: 0 4px 20px rgba(5,150,105,0.06);
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      text-decoration: none;
      color: inherit;
    }
    .why-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 25px 50px -12px rgba(16,185,129,0.25);
      border-color: #a7f3d0;
    }
    .why-card-img-wrap {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, #059669, #047857);
    }
    .why-card-img-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent, rgba(16,185,129,0.15));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .why-card:hover .why-card-img-wrap::after {
      opacity: 1;
    }
    .why-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
      display: block;
    }
    .why-card:hover .why-card-img {
      transform: scale(1.06);
    }
    .why-card-icon-wrap {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #059669, #047857);
      position: relative;
    }
    .why-card-icon-wrap::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -40%;
      width: 80%;
      height: 80%;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
      filter: blur(20px);
    }
    .why-card-icon {
      color: rgba(255,255,255,0.95);
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.18));
      transition: transform 0.3s ease;
      position: relative;
      z-index: 1;
    }
    .why-card:hover .why-card-icon {
      transform: scale(1.1);
    }
    .why-card-eco-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255,255,255,0.95);
      color: #059669;
      font-size: .65rem;
      font-weight: 800;
      letter-spacing: .06em;
      text-transform: uppercase;
      padding: .3rem .7rem;
      border-radius: 99px;
      display: flex;
      align-items: center;
      gap: .3rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-family: 'Inter', sans-serif;
      z-index: 2;
    }
    .why-card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: .75rem;
    }
    .why-card-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.2rem;
      font-weight: 700;
      color: #064e3b;
      line-height: 1.3;
      margin: 0;
    }
    .why-card-desc {
      font-family: 'Inter', sans-serif;
      font-size: .88rem;
      color: #4b5563;
      line-height: 1.7;
      margin: 0;
      flex: 1;
    }
    .why-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: .4rem;
    }
    .why-card-tag {
      font-family: 'Inter', sans-serif;
      font-size: .68rem;
      font-weight: 600;
      padding: .25rem .65rem;
      border-radius: 99px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #d1fae5;
      cursor: pointer;
      transition: all .2s ease;
    }
    .why-card-tag:hover {
      background: #d1fae5;
      color: #047857;
    }
    .why-card-footer {
      padding: 1rem 1.5rem;
      background: #f0fdf4;
      border-top: 1px solid #d1fae5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Inter', sans-serif;
    }
    .why-card-footer-left {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: .75rem;
      color: #059669;
    }
    .why-card-footer-avatar {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669, #047857);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: .65rem;
      font-weight: 800;
    }
    .why-card-cta {
      display: flex;
      align-items: center;
      gap: .35rem;
      font-size: .78rem;
      font-weight: 700;
      color: #fff;
      background: #059669;
      border: none;
      border-radius: .65rem;
      padding: .5rem 1rem;
      cursor: pointer;
      transition: all .25s ease;
      text-decoration: none;
    }
    .why-card-cta:hover {
      background: #047857;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(5,150,105,0.35);
    }
    .home-section-title-serif {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.75rem,3.5vw,2.75rem);
      font-weight: 800;
      color: #14532d;
      line-height: 1.1;
      margin-bottom: .85rem;
    }
    .home-section-eyebrow {
      font-family: 'Inter', sans-serif;
      font-size: .68rem;
      font-weight: 800;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #16a34a;
      margin-bottom: .75rem;
      display: block;
    }
    .home-section-subtitle-new {
      font-family: 'Inter', sans-serif;
      font-size: clamp(.88rem,1.3vw,1rem);
      color: #5A7A5A;
      line-height: 1.65;
      max-width: 580px;
    }
    .section-cta {
      display: flex;
      justify-content: center;
      margin-top: clamp(1.5rem,3vw,2.5rem);
    }
    .home-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 clamp(1.25rem,4vw,3rem);
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   TEAM DATA (live + fallback)
───────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

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
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
};

const FALLBACK_TEAM = [
  {
    id: 1,
    name: "IGIRANEZA Fabrice",
    role: "Founder & CEO",
    department: "Leadership",
    image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
    expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"],
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
    expertise: ["Logistics Management", "Quality Assurance", "Team Coordination"],
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
    expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"],
    languages: ["English", "Swahili", "French"],
    location: "Serengeti, Tanzania",
    is_featured: true,
    is_active: true,
  },
];

/* ═══════════════════════════════════════════
   WHY ALTUVERA DATA
═══════════════════════════════════════════ */
const WHY_CARDS = [
  {
    id: 1,
    title: "Expert Local Guides",
    description: "Our guides are born and raised in the regions they lead. Decades of field experience, wildlife knowledge, and cultural fluency turn every game drive into a master class.",
    tags: ["Certified", "Multilingual", "Wildlife Experts"],
    badge: "Top Rated",
    badgeIcon: "⭐",
    image: "https://i.pinimg.com/236x/14/f8/7f/14f87f11922888cf40a8ca405d731246.jpg",
    footer: "Guided by Altuvera Pros",
    link: "/team",
    ctaLabel: "Meet the Team",
    iconType: "compass",
  },
  {
    id: 2,
    title: "Sustainable Safari Practices",
    description: "Every journey we design actively protects the ecosystems you visit. From carbon offset programs to direct community investment, we travel with purpose.",
    tags: ["Eco-Certified", "Carbon Offset", "Community Impact"],
    badge: "Eco",
    badgeIcon: "🌿",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200",
    footer: "Conservation First",
    link: "/about#mission",
    ctaLabel: "Our Mission",
    iconType: "leaf",
  },
  {
    id: 3,
    title: "Fully Tailored Itineraries",
    description: "No two travelers are alike. We craft each journey from scratch — adjusting pacing, accommodations, and experiences to match your exact vision and travel style.",
    tags: ["Bespoke", "Flexible", "Curated"],
    badge: "Custom",
    badgeIcon: "✦",
    image: "https://i.pinimg.com/1200x/8f/9d/e8/8f9de8dad8e26fc74268e13f37149f92.jpg",
    footer: "Your Journey, Your Rules",
    link: "/packages",
    ctaLabel: "View Packages",
    iconType: "map",
  },
  {
    id: 4,
    title: "Authentic Cultural Immersion",
    description: "Beyond wildlife — we connect you with the people who define these landscapes. Share meals with Maasai elders, visit gorilla conservation projects, witness living traditions.",
    tags: ["Cultural", "Authentic", "Immersive"],
    badge: "Unique",
    badgeIcon: "🏛",
    image: "https://i.pinimg.com/736x/e1/5b/9e/e15b9ef8fe7dfae13d170068d8d3008e.jpg",
    footer: "Real Connections",
    link: "/destinations",
    ctaLabel: "Explore",
    iconType: "heart",
  },
  {
    id: 5,
    title: "Seamless End-to-End Service",
    description: "From your first enquiry to your final transfer home, our team is with you every step. 24/7 in-country support means no detail goes unmanaged.",
    tags: ["24/7 Support", "Logistics", "Hassle-Free"],
    badge: "Premium",
    badgeIcon: "💎",
    image: "https://i.pinimg.com/1200x/19/8d/ab/198dab499b95cff53e2a48a8ba02c673.jpg",
    footer: "Always by Your Side",
    link: "/contact",
    ctaLabel: "Contact Us",
    iconType: "shield",
  },
  {
    id: 6,
    title: "Award-Winning Experiences",
    description: "Recognised by travellers and industry bodies alike for excellence in responsible tourism. Our track record speaks through the stories our guests share.",
    tags: ["Award-Winning", "5-Star Rated", "Trusted"],
    badge: "Best in Class",
    badgeIcon: "🏆",
    image: "https://i.pinimg.com/736x/08/73/a9/0873a9c33c198ea63293106972294bf0.jpg",
    footer: "Recognised Excellence",
    link: "/about",
    ctaLabel: "Learn More",
    iconType: "star",
  },
];

/* SVG icons for why cards */
const WhyCardIcon = ({ type, size = 52 }) => {
  const icons = {
    compass: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    ),
    leaf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
    map: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  };
  return icons[type] || icons.compass;
};

/* ═══════════════════════════════════════════
   STATIC DATA
───────────────────────────────────────────── */
const WHY_ITEMS = [
  {
    Icon: FiAward,
    title: "Expert Local Guides",
    stat: "15+ yrs",
    desc: "Certified field guides with deep ecological knowledge, cultural fluency, and wildlife expertise.",
  },
  {
    Icon: FiShield,
    title: "Fully Insured & Safe",
    stat: "100%",
    desc: "Comprehensive travel insurance, rigorous safety protocols, and 24/7 emergency response.",
  },
  {
    Icon: FiUsers,
    title: "Small-Group Intimacy",
    stat: "≤ 12",
    desc: "Maximum personal attention in intimate groups — no overcrowded buses or rushed itineraries.",
  },
  {
    Icon: FiTarget,
    title: "Bespoke Itineraries",
    stat: "Custom",
    desc: "Every journey is built from scratch around your timeline, interests, budget, and travel style.",
  },
  {
    Icon: FiTrendingUp,
    title: "Consistently Rated 4.9★",
    stat: "4.9 ★",
    desc: "Thousands of verified five-star reviews across Google, TripAdvisor, and independent platforms.",
  },
  {
    Icon: FiClock,
    title: "24/7 On-Ground Support",
    stat: "24 / 7",
    desc: "Live assistance from first enquiry through to your safe return — we're always just a call away.",
  },
];

/* ─────────────────────────────────────────────
    HELPERS / HOOKS
───────────────────────────────────────────── */
const useScrollReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const useKeyClose = (fn) => {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
};

const Reveal = ({ index = 0, children }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity .55s var(--sv-ease), transform .55s var(--sv-ease)`,
        transitionDelay: `${(index % 6) * 70}ms`,
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────────── */
const ServiceCard = ({ service, index, onClick, isMobile }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = useMemo(() => {
    const g = Array.isArray(service.gallery) && service.gallery.length ? service.gallery : null;
    const f = Array.isArray(service.images)  && service.images.length  ? service.images  : null;
    return g || f || [service.image];
  }, [service]);

  const prev = (e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(p => (p - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(p => (p + 1) % images.length); };

  const features = service.features?.slice(0, 3) || [];

  return (
    <article
      className="sv-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${service.title}`}
      onClick={() => onClick(service)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(service)}
    >
      {/* ── Image ── */}
      <div style={{ position: "relative", height: isMobile ? "200px" : "230px", overflow: "hidden", flexShrink: 0 }}>
        {!imgLoaded && (
          <div className="sv-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={`${service.id}-${imgIdx}`}
            src={images[imgIdx]}
            alt={service.title}
            loading={index > 2 ? "lazy" : "eager"}
            onLoad={() => setImgLoaded(true)}
            className="sv-card__img"
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .35 }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AnimatePresence>

        {/* Gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,44,34,.05) 0%, rgba(2,44,34,.68) 100%)" }} />

        {/* Arrow nav */}
        {images.length > 1 && ["prev","next"].map(dir => (
          <button
            key={dir}
            type="button"
            onClick={dir === "prev" ? prev : next}
            aria-label={dir === "prev" ? "Previous image" : "Next image"}
            style={{
              position: "absolute", top: "50%",
              [dir === "prev" ? "left" : "right"]: 10,
              transform: "translateY(-50%)",
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(2,44,34,.55)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 4,
            }}
          >
            {dir === "prev" ? <FiChevronLeft size={14}/> : <FiChevronRight size={14}/>}
          </button>
        ))}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div style={{ position: "absolute", bottom: 54, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 4 }}>
            {images.slice(0,5).map((_,i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setImgLoaded(false); setImgIdx(i); }}
                aria-label={`Image ${i+1}`}
                style={{
                  width: i === imgIdx ? 20 : 5, height: 5,
                  borderRadius: 999,
                  background: i === imgIdx ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.4)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all .38s var(--sv-ease)",
                }}
              />
            ))}
          </div>
        )}

        {/* Badge */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 999,
            background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)",
            fontSize: 10, fontWeight: 800, color: "#047857",
            textTransform: "uppercase", letterSpacing: "1.5px",
            border: "1px solid rgba(167,243,208,.5)",
          }}>
            Premium
          </span>
        </div>

        {/* Title overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 14px", zIndex: 3 }}>
          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: isMobile ? 18 : 21,
            fontWeight: 400, color: "#fff",
            lineHeight: 1.18, margin: 0,
            textShadow: "0 1px 8px rgba(2,44,34,.5)",
          }}>
            {service.title}
          </h3>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: isMobile ? "18px 16px" : "20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{
          fontSize: 13, color: "var(--sv-text-2)", lineHeight: 1.72,
          marginBottom: 16,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {service.description}
        </p>

        {/* Features */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {features.map((f, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 999,
              background: i === 0 ? "var(--sv-mint)" : "#f8fafc",
              border: `1px solid ${i === 0 ? "#a7f3d0" : "var(--sv-border)"}`,
              fontSize: 11, fontWeight: 600,
              color: i === 0 ? "var(--sv-green-dk)" : "var(--sv-text-2)",
              maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <FiCheck size={9} strokeWidth={3} color={i === 0 ? "#059669" : "#94a3b8"} />
              {f}
            </span>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, #e2e8f0, transparent)", marginBottom: 16 }} />

        {/* CTA row */}
        <div
          className="sv-card__cta"
          style={{
            marginTop: "auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 16px", borderRadius: 14,
            background: "var(--sv-mint)",
            border: "1.5px solid #a7f3d0",
          }}
        >
          <span className="sv-card__cta-text" style={{ fontSize: 13, fontWeight: 700, color: "var(--sv-green-dk)" }}>
            View Experience
          </span>
          <span className="sv-card__cta-icon" style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(5,150,105,.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--sv-green-dk)",
          }}>
            <FiArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
};

/* ─────────────────────────────────────────────
   WHY CARD
───────────────────────────────────────────── */
const WhyCard = ({ card, index }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={card.link}
      className="why-card mixed-card-reveal"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={card.ctaLabel}
    >
      {/* Image / Icon top area */}
      <div className="why-card-img-wrap">
        {!imgError && card.image ? (
          <img
            src={card.image}
            alt={card.title}
            className="why-card-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="why-card-icon-wrap">
            <div className="why-card-icon">
              <WhyCardIcon type={card.iconType} size={56} />
            </div>
          </div>
        )}
        {/* ECO / type badge */}
        <div className="why-card-eco-badge">
          <span>{card.badgeIcon}</span>
          <span>{card.badge}</span>
        </div>
      </div>

      {/* Body */}
      <div className="why-card-body">
        <h3 className="why-card-title">{card.title}</h3>
        <p className="why-card-desc">{card.description}</p>
        <div className="why-card-tags">
          {card.tags.map((tag, i) => (
            <span key={i} className="why-card-tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="why-card-footer">
        <div className="why-card-footer-left">
          <div className="why-card-footer-avatar">
            {card.footer.charAt(0)}
          </div>
          <span style={{ fontWeight: 600, fontSize: ".75rem" }}>{card.footer}</span>
        </div>
        <span className="why-card-cta">
          {card.ctaLabel}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>
    </Link>
  );
};

/* ─────────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────────── */
const TestiCard = ({ t }) => {
  const [imgOk, setImgOk] = useState(false);
  return (
    <div className="sv-testi-card">
      {/* Watermark */}
      <div aria-hidden style={{
        position: "absolute", top: -4, right: 18,
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 88, color: "#ecfdf5", lineHeight: 1,
        fontWeight: 400, userSelect: "none", pointerEvents: "none",
      }}>
        "
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <FiStar key={i} size={13} fill="#10b981" color="#10b981" />
        ))}
      </div>

      {/* Trip label */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 999,
        background: "var(--sv-mint)", border: "1px solid #a7f3d0",
        fontSize: 10, fontWeight: 700, color: "var(--sv-green-dk)",
        textTransform: "uppercase", letterSpacing: ".07em",
        marginBottom: 14,
      }}>
        <FiCompass size={10} /> {t.trip}
      </div>

      {/* Quote */}
      <p style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: "clamp(13px,1.5vw,14.5px)",
        color: "var(--sv-text-2)", lineHeight: 1.82,
        fontStyle: "italic", flex: 1, marginBottom: 20,
        position: "relative",
      }}>
        "{t.quote}"
      </p>

      {/* Author */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: "#f8fafb", borderRadius: 14,
        border: "1.5px solid var(--sv-border)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
          border: "2px solid #a7f3d0", background: "#ecfdf5", flexShrink: 0,
        }}>
          <img
            src={t.avatar} alt={t.author} loading="lazy"
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: "opacity .3s" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--sv-text)" }}>{t.author}</div>
          <div style={{ fontSize: 11.5, color: "var(--sv-text-3)", fontWeight: 500, marginTop: 1 }}>{t.role}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FiCheck size={12} color="#fff" strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SERVICE MODAL
───────────────────────────────────────────── */
const ServiceModal = ({ service, onClose }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [imgOk, setImgOk] = useState(false);
  const panelRef = useRef(null);

  useKeyClose(onClose);

  useEffect(() => {
    const sy = window.scrollY;
    Object.assign(document.body.style, { position: "fixed", top: `-${sy}px`, width: "100%", overflow: "hidden" });
    panelRef.current?.focus();
    return () => {
      Object.assign(document.body.style, { position: "", top: "", width: "", overflow: "" });
      window.scrollTo(0, sy);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .2 }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`${service.title} details`}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(2,44,34,.88)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 8 : 24,
      }}
    >
      <motion.div
        ref={panelRef} tabIndex={-1}
        className="sv-modal-scroll"
        initial={{ scale: .92, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .92, opacity: 0, y: 28 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: isMobile ? 20 : 28,
          maxWidth: 880, width: "100%", maxHeight: "92vh",
          overflowY: "auto", position: "relative",
          boxShadow: "0 40px 80px rgba(2,44,34,.3)", outline: "none",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(2,44,34,.6)", color: "#fff",
            border: "1px solid rgba(255,255,255,.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
            transition: "background .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(2,44,34,.85)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(2,44,34,.6)"}
        >
          <FiX size={17} />
        </button>

        {/* Hero image */}
        <div style={{
          position: "relative", height: isMobile ? 210 : 320, overflow: "hidden",
          borderRadius: isMobile ? "20px 20px 0 0" : "28px 28px 0 0",
        }}>
          {!imgOk && <div className="sv-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
          <img
            src={service.image} alt={service.title}
            onLoad={() => setImgOk(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgOk ? 1 : 0, transition: "opacity .4s" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(2,44,34,.85) 0%, rgba(2,44,34,.35) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "20px 20px 18px" : "30px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 999,
              background: "rgba(16,185,129,.2)", border: "1px solid rgba(16,185,129,.3)",
              color: "#a7f3d0", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: ".08em",
              marginBottom: 10,
            }}>
              <FiPackage size={10} /> Signature Experience
            </span>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: isMobile ? 22 : 34, fontWeight: 400,
              color: "#fff", margin: 0, lineHeight: 1.15,
            }}>
              {service.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "22px 18px" : "32px 36px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
            gap: isMobile ? 24 : 36,
          }}>
            {/* Left */}
            <div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 10,
                }}>
                  <FiFeather size={12} /> About This Experience
                </h3>
                <p style={{ fontSize: 14, color: "var(--sv-text-2)", lineHeight: 1.82 }}>
                  {service.description}
                </p>
              </div>

              <div>
                <h3 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 12,
                }}>
                  <FiCheck size={12} /> What's Included
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {service.features.map((feat, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: .05 + idx * .04 }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "8px 12px", borderRadius: 12,
                        background: "#f8fafb", border: "1.5px solid #e2e8f0",
                        fontSize: 13, color: "var(--sv-text-2)", lineHeight: 1.6,
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: "var(--sv-green)", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <FiCheck size={9} strokeWidth={3} />
                      </span>
                      {feat}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Booking panel */}
            <div>
              <div style={{
                background: "var(--sv-mint)", padding: isMobile ? 20 : 26,
                borderRadius: 18, border: "1.5px solid #a7f3d0",
                position: isMobile ? "static" : "sticky", top: 20,
              }}>
                <h4 style={{
                  fontSize: 10, fontWeight: 800, color: "var(--sv-green-dk)",
                  letterSpacing: ".09em", textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  Ready to Book?
                </h4>
                <p style={{ fontSize: 13, color: "var(--sv-text-2)", marginBottom: 18, lineHeight: 1.68 }}>
                  Let our team craft your perfect{" "}
                  {service.title.toLowerCase()} experience.
                </p>

                <Button to="/booking" variant="primary" fullWidth size="large" icon={<FiArrowRight size={14}/>}>
                  Start Planning
                </Button>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {[
                    { href: "tel:+250792352409", Icon: FiPhone, label: "+250 792 352 409", ext: true },
                    { href: "/contact", Icon: FiMail, label: "Send an Enquiry", ext: false },
                  ].map(({ href, Icon: Ic, label, ext }) => {
                    const s = {
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "11px 14px", borderRadius: 12, background: "#fff",
                      border: "1.5px solid var(--sv-border)",
                      fontSize: 13, fontWeight: 600, color: "var(--sv-text-2)",
                      textDecoration: "none", cursor: "pointer",
                      transition: "border-color .2s, color .2s, background .2s",
                    };
                    return ext ? (
                      <a key={label} href={href} style={s}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#a7f3d0"; e.currentTarget.style.color="var(--sv-green-dk)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--sv-border)"; e.currentTarget.style.color="var(--sv-text-2)"; }}>
                        <Ic size={14} color="var(--sv-green)" /> {label}
                      </a>
                    ) : (
                      <Link key={label} to={href} style={s} onClick={onClose}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="#a7f3d0"; e.currentTarget.style.color="var(--sv-green-dk)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--sv-border)"; e.currentTarget.style.color="var(--sv-text-2)"; }}>
                        <Ic size={14} color="var(--sv-green)" /> {label}
                      </Link>
                    );
                  })}
                </div>

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1.5px solid #a7f3d0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Free consultation — no obligation", "100% satisfaction guarantee", "Flexible payment options"].map((txt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--sv-text-2)" }}>
                      <FiCheck size={12} color="var(--sv-green)" strokeWidth={3} /> {txt}
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

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
const SectionHead = ({ label, title, desc, light = false, Icon = FiCompass }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className="sv-head"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity .55s var(--sv-ease), transform .55s var(--sv-ease)",
      }}
    >
      <div className={`sv-label ${light ? "sv-label--light" : ""}`}>
        <Icon size={11} /> {label}
      </div>
      <h2 className={`sv-h2 ${light ? "sv-h2--light" : ""}`}>{title}</h2>
      {desc && <p className={`sv-desc ${light ? "sv-desc--light" : ""}`}>{desc}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const Services = () => {
  const [selected, setSelected] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);
  const { testimonials, loading: testimonialsLoading, error: testimonialsError } = useFeaturedTestimonials(6);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollProgress = useScrollProgress();

  const open  = useCallback((svc) => setSelected(svc), []);
  const close = useCallback(() => setSelected(null), []);

  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await teamAPI.getAll({ sort: "display_order", order: "ASC", limit: 6 });
      const arr = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
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
        keywords={["safari services","East Africa travel","guided tours","wildlife expeditions","adventure travel"]}
        url="/services"
        type="website"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Services", url: "/services" }]}
      />

      <GlobalStyles />

      {/* Progress bar */}
      <div className="sv-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="sv-page">
        <PageHeader
          title="Our Services"
          subtitle="Premium travel experiences crafted for the discerning East Africa adventurer"
          backgroundImage="https://i.pinimg.com/1200x/1c/d9/96/1cd9962233acb19c410546340c0f8f39.jpg"
          breadcrumbs={[{ label: "Services", path: "/services" }]}
        />

        {/* ══ SERVICES GRID ══ */}
        <section className="sv-section">
          <div className="sv-inner">
            <SectionHead
              label="What We Offer"
              title="Tailored Travel Experiences"
              desc="From thrilling wildlife safaris to cultural immersions — explore our complete range of handcrafted East Africa journeys."
              Icon={FiPackage}
            />

            <div className="sv-grid-3">
              {services.map((svc, i) => (
                <Reveal key={svc.id} index={i}>
                  <ServiceCard service={svc} index={i} onClick={open} isMobile={isMobile} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Altuvera — NEW GREEN CARD DESIGN ── */}
        <section className="why-section">
          <div className="home-container">
            <div className="section-header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h2 className="home-section-title-serif">
                The Altuvera <span style={{ color: "#22c55e" }}>Difference</span>
              </h2>
              <p className="home-section-subtitle-new" style={{ margin: "0 auto" }}>
                Experience the difference that comes with expertise, passion, and an
                unwavering commitment to excellence in every journey we craft.
              </p>
            </div>
            <div className="why-grid">
              {WHY_CARDS.map((card, i) => (
                <WhyCard key={card.id} card={card} index={i} />
              ))}
            </div>
            <div className="section-cta" style={{ marginTop: "2.5rem" }}>
              <Button to="/about" variant="primary" size="large" icon={<FiArrowRight size={18} />}>
                Learn More About Us
              </Button>
            </div>
          </div>
        </section>

        {/* ══ TEAM ══ */}
        <section className="sv-section sv-section--white">
          <div className="sv-inner">
            <SectionHead
              label="Meet The Team"
              title="The People Behind Every Journey"
              desc="Our specialists combine local knowledge, conservation experience, and hospitality excellence to deliver seamless East African adventures."
              Icon={FiUsers}
            />

            {teamError && !teamLoading && (
              <div style={{ textAlign: 'center', marginBottom: 24, color: '#b45309', fontSize: 13, fontWeight: 600 }}>
                Showing preview team members while the live feed is unavailable.
              </div>
            )}

            <div className="sv-grid-3">
              {teamLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ padding: 18, borderRadius: 24, background: '#fff', border: '1px solid #e2e8f0', minHeight: 360 }}>
                      <div className="sv-skel" style={{ width: 112, height: 112, borderRadius: '50%', margin: '0 auto 16px' }} />
                      <div className="sv-skel" style={{ height: 20, width: '64%', margin: '0 auto 10px' }} />
                      <div className="sv-skel" style={{ height: 14, width: '44%', margin: '0 auto 16px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '84%', margin: '0 auto 8px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '72%', margin: '0 auto 8px' }} />
                      <div className="sv-skel" style={{ height: 12, width: '68%', margin: '0 auto' }} />
                    </div>
                  ))
                : teamMembers.map((member, i) => (
                    <Reveal key={member.id || i} index={i}>
                      <TeamCard member={member} />
                    </Reveal>
                  ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="sv-section sv-section--mint">
          <div className="sv-inner">
            <SectionHead
              label="Traveller Stories"
              title="Voices of Our Community"
              desc="Real accounts from travellers who experienced the Altuvera difference — and came back changed."
              Icon={FiHeart}
            />

            <div className="sv-grid-3">
              {testimonialsLoading ? (
                [0, 1, 2].map((i) => (
                  <Reveal key={`sk-${i}`} index={i}>
                    <div className="sv-testi-card" style={{ padding: 24 }}>
                      <div style={{ height: 14, width: "45%", background: "#DCFCE7", borderRadius: 6, marginBottom: 16 }} />
                      <div style={{ height: 10, width: "95%", background: "#F0FDF4", borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, width: "80%", background: "#F0FDF4", borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, width: "60%", background: "#F0FDF4", borderRadius: 4, marginBottom: 24 }} />
                      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #F0FDF4", paddingTop: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#DCFCE7" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, width: "50%", background: "#BBF7D0", borderRadius: 4, marginBottom: 6 }} />
                          <div style={{ height: 10, width: "35%", background: "#F0FDF4", borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))
              ) : testimonialsError ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                  <p style={{ fontWeight: 600, color: "#0f172a" }}>Could not load testimonials</p>
                  <p style={{ fontSize: ".88rem" }}>{testimonialsError}</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                  <p style={{ fontWeight: 600, color: "#0f172a" }}>No testimonials yet</p>
                  <p style={{ fontSize: ".88rem" }}>Be the first to share your experience!</p>
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
                    <Reveal key={t.id || i} index={i}>
                      <TestiCard t={card} />
                    </Reveal>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="sv-section sv-section--white">
          <div className="sv-inner">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: .6, ease: [.22,1,.36,1] }}
              style={{
                maxWidth: 900, margin: "0 auto",
                padding: isMobile ? "48px 24px" : "72px 72px",
                background: "linear-gradient(140deg, var(--sv-forest) 0%, #064e3b 50%, #047857 100%)",
                backgroundSize: "200% 200%",
                animation: "sv-gradient-shift 14s ease infinite",
                borderRadius: isMobile ? 22 : 32,
                boxShadow: "0 40px 80px rgba(2,44,34,.25), 0 0 60px rgba(16,185,129,.1)",
                position: "relative", overflow: "hidden", textAlign: "center",
              }}
            >
              {/* Orbs */}
              {[
                { top: "-40%", left: "-12%" },
                { bottom: "-40%", right: "-12%" },
              ].map((pos, i) => (
                <div key={i} aria-hidden style={{
                  position: "absolute", ...pos,
                  width: 360, height: 360, borderRadius: "50%", pointerEvents: "none",
                  background: "radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%)",
                }} />
              ))}

              {/* Top shimmer line */}
              <div style={{
                position: "absolute", top: 0, left: "12%", right: "12%",
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(167,243,208,.3), transparent)",
              }} />

              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 16px", borderRadius: 999,
                  background: "rgba(16,185,129,.18)", border: "1px solid rgba(16,185,129,.3)",
                  color: "#a7f3d0", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 20,
                }}>
                  <FiSun size={11} /> Begin Your Adventure
                </div>

                <h2 style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(28px,5.5vw,52px)", fontWeight: 400,
                  color: "#fff", lineHeight: 1.1, letterSpacing: "-.025em",
                  marginBottom: 16,
                }}>
                  Ready to Start Your Journey?
                </h2>

                <p style={{
                  fontSize: "clamp(14px,1.5vw,17px)",
                  color: "rgba(255,255,255,.68)",
                  maxWidth: 520, margin: "0 auto 28px",
                  lineHeight: 1.8,
                }}>
                  Contact our expert team and let us design the East African adventure
                  of a lifetime — tailored entirely to you.
                </p>

                {/* Trust chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", justifyContent: "center",
                  gap: 8, marginBottom: 32,
                }}>
                  {["5,000+ travellers worldwide","4.9 ★ average rating","100% satisfaction guarantee"].map((txt, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 14px", borderRadius: 999,
                      background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.13)",
                      fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 500,
                    }}>
                      <FiCheck size={10} color="#4ade80" strokeWidth={3} /> {txt}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button to="/booking" variant="white" size="large" icon={<FiArrowRight size={15}/>}>
                    Start Planning
                  </Button>
                  <Button to="/contact" variant="outline" size="large"
                    style={{ borderColor: "rgba(255,255,255,.28)", color: "#fff", background: "transparent" }}>
                    <FiMail size={15} /> Contact Us
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <AnimatePresence mode="wait">
        {selected && (
          <ServiceModal key={selected.id} service={selected} onClose={close} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;