// src/components/common/TeamContent.jsx — Clean Professional Redesign
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  FiArrowRight, FiLinkedin, FiMail, FiTwitter, FiInstagram,
  FiExternalLink, FiMapPin, FiAward, FiUsers, FiGlobe,
  FiPhone, FiCalendar, FiRefreshCw, FiAlertCircle, FiChevronDown,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

/* ── API ── */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api";

const teamAPI = {
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, headers: { Accept: "application/json", ...options.headers } });
      clearTimeout(timeout);
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `Status ${res.status}`); }
      return res.json();
    } catch (err) {
      clearTimeout(timeout);
      if (retries > 0 && err.name !== "AbortError" && !err.message.includes("status")) {
        await new Promise(r => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }
      throw err;
    }
  },
  getAll(params = {}) {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))).toString();
    return this._fetch(`/team${q ? `?${q}` : ""}`);
  },
  getDepartments() { return this._fetch("/team/departments/list"); },
};

/* ── Fallback data ── */
const FALLBACK_MEMBERS = [
  { id: 1, name: "IGIRANEZA Fabrice", role: "Founder & CEO", department: "Leadership", image_url: "https://randomuser.me/api/portraits/men/32.jpg", bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.", expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"], languages: ["English", "French", "Kinyarwanda"], certifications: [], years_experience: 12, location: "Musanze, Rwanda", linkedin_url: "https://linkedin.com", twitter_url: "https://twitter.com", email: "fabrice@altuvera.com", is_featured: true, is_active: true, display_order: 1 },
  { id: 2, name: "UWIMANA Grace", role: "Head of Operations", department: "Operations", image_url: "https://randomuser.me/api/portraits/women/44.jpg", bio: "Ensures seamless coordination of every itinerary with precision and local expertise.", expertise: ["Logistics Management", "Quality Assurance", "Team Coordination"], languages: ["English", "Swahili"], certifications: [], years_experience: 8, location: "Musanze, Rwanda", linkedin_url: "https://linkedin.com", email: "grace@altuvera.com", is_featured: false, is_active: true, display_order: 2 },
  { id: 3, name: "MUTABAZI Jean", role: "Lead Safari Guide", department: "Guides", image_url: "https://randomuser.me/api/portraits/men/67.jpg", bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards.", expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"], languages: ["English", "Swahili", "French"], certifications: ["Certified Safari Guide", "Wilderness First Aid"], years_experience: 15, location: "Serengeti, Tanzania", linkedin_url: "https://linkedin.com", email: "jean@altuvera.com", is_featured: true, is_active: true, display_order: 3 },
  { id: 4, name: "INGABIRE Diane", role: "Customer Experience Manager", department: "Customer Service", image_url: "https://randomuser.me/api/portraits/women/28.jpg", bio: "Designs guest-first service experiences from initial inquiry through post-trip follow-up.", expertise: ["Client Relations", "Service Design", "Feedback Analysis"], languages: ["English", "French"], certifications: [], years_experience: 6, location: "Kampala, Uganda", linkedin_url: "https://linkedin.com", twitter_url: "https://twitter.com", email: "diane@altuvera.com", is_featured: false, is_active: true, display_order: 4 },
  { id: 5, name: "HABIMANA Patrick", role: "Conservation Liaison", department: "Conservation", image_url: "https://randomuser.me/api/portraits/men/52.jpg", bio: "Manages partnerships with wildlife conservancies and oversees community development initiatives.", expertise: ["Conservation Strategy", "Community Engagement", "Sustainability"], languages: ["English", "Rukiga"], certifications: ["Conservation Management Certificate"], years_experience: 10, location: "Bwindi, Uganda", linkedin_url: "https://linkedin.com", email: "patrick@altuvera.com", is_featured: false, is_active: true, display_order: 5 },
  { id: 6, name: "MUKAMANA Claudine", role: "Marketing Director", department: "Marketing", image_url: "https://randomuser.me/api/portraits/women/65.jpg", bio: "Leads brand strategy and digital marketing initiatives to connect travelers with authentic African experiences.", expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"], languages: ["English", "French", "Kinyarwanda"], certifications: [], years_experience: 7, location: "Musanze, Rwanda", linkedin_url: "https://linkedin.com", twitter_url: "https://twitter.com", instagram_url: "https://instagram.com", email: "claudine@altuvera.com", is_featured: false, is_active: true, display_order: 6 },
];

/* ── Styles ── */
const TC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

  .tc-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    padding: clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px);
    background: #ffffff;
    position: relative;
    overflow: hidden;
  }

  .tc-root::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #d1fae5, transparent);
  }

  .tc-wrap {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* ── Heading ── */
  .tc-heading {
    text-align: center;
    margin-bottom: 36px;
  }

  .tc-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4.5vw, 46px);
    font-weight: 800;
    color: #111827;
    margin: 0 0 12px;
    line-height: 1.15;
    letter-spacing: -0.025em;
  }

  .tc-title-accent {
    color: #059669;
    position: relative;
  }

  .tc-subtitle {
    font-size: clamp(14px, 1.8vw, 16.5px);
    color: #6b7280;
    line-height: 1.75;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 400;
  }

  /* ── Fallback banner ── */
  .tc-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 10px;
    margin-bottom: 24px;
    color: #92400e;
    font-size: 13px;
  }

  /* ── Filters ── */
  .tc-filters {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
  }

  .tc-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 8px;
    border: 1.5px solid #e5e7eb;
    background: #ffffff;
    color: #374151;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tc-filter-btn:hover {
    border-color: #a7f3d0;
    background: #f0fdf4;
    color: #059669;
  }

  .tc-filter-btn.active {
    background: #059669;
    border-color: #059669;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
  }

  .tc-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.06);
    font-size: 10px;
    font-weight: 800;
    color: inherit;
  }

  .tc-filter-btn.active .tc-filter-count {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .tc-filter-more {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: 8px;
    border: 1.5px dashed #d1d5db;
    background: transparent;
    color: #6b7280;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tc-filter-more:hover {
    border-color: #a7f3d0;
    color: #059669;
    background: #f0fdf4;
  }

  /* ── Grid ── */
  .tc-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 40px;
  }

  /* ── Card ── */
  .tc-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .tc-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(5, 150, 105, 0.06);
    border-color: #a7f3d0;
  }

  /* Card image area */
  .tc-card-img-wrap {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    background: #f3f4f6;
  }

  .tc-card-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  }

  .tc-card:hover .tc-card-img {
    transform: scale(1.05);
  }

  .tc-card-img-fallback {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  }

  .tc-card-initials {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 800;
    color: #059669;
    opacity: 0.7;
  }

  .tc-card-img-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.15), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .tc-card:hover .tc-card-img-overlay {
    opacity: 1;
  }

  .tc-featured-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    color: #d97706;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 2;
  }

  /* Card body */
  .tc-card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .tc-card-dept {
    display: inline-block;
    width: fit-content;
    padding: 2px 10px;
    border-radius: 5px;
    background: #f0fdf4;
    font-size: 10.5px;
    color: #047857;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .tc-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  .tc-card-role {
    font-size: 13.5px;
    color: #059669;
    font-weight: 600;
    margin: 0 0 10px;
  }

  .tc-card-bio {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.65;
    margin: 0 0 14px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Expertise */
  .tc-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .tc-card-tag {
    padding: 3px 8px;
    border-radius: 5px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    font-size: 10.5px;
    color: #4b5563;
    font-weight: 500;
  }

  .tc-card-tag-more {
    padding: 3px 8px;
    border-radius: 5px;
    background: #f3f4f6;
    font-size: 10.5px;
    color: #9ca3af;
    font-weight: 600;
  }

  /* Meta */
  .tc-card-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
  }

  .tc-card-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #9ca3af;
  }

  .tc-card-meta-item svg {
    flex-shrink: 0;
    color: #d1d5db;
  }

  /* Socials */
  .tc-card-socials {
    display: flex;
    gap: 6px;
    padding-top: 14px;
    border-top: 1px solid #f3f4f6;
    margin-top: auto;
  }

  .tc-card-social {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .tc-card-social:hover {
    background: #059669;
    border-color: #059669;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(5, 150, 105, 0.25);
  }

  /* ── Skeleton ── */
  .tc-skel {
    background: linear-gradient(110deg, #f3f4f6 8%, #fafafa 18%, #f3f4f6 33%);
    background-size: 200% 100%;
    animation: tc-shimmer 1.4s ease-in-out infinite;
    border-radius: 6px;
  }

  @keyframes tc-shimmer {
    from { background-position: -200% 0; }
    to { background-position: 200% 0; }
  }

  .tc-skel-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  .tc-skel-card .tc-skel-img {
    width: 100%;
    padding-top: 100%;
    border-radius: 0;
  }

  .tc-skel-card .tc-skel-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── Error / Empty ── */
  .tc-state-box {
    text-align: center;
    padding: 48px 24px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 28px;
  }

  .tc-state-box.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  .tc-state-box.empty {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .tc-state-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 12px 0 6px;
  }

  .tc-state-text {
    font-size: 13.5px;
    color: #9ca3af;
    margin: 0 0 18px;
    line-height: 1.6;
  }

  .tc-action-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 22px;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .tc-action-btn.retry {
    background: #fef2f2;
    border: 1.5px solid #f87171;
    color: #dc2626;
  }

  .tc-action-btn.retry:hover {
    background: #fee2e2;
    transform: translateY(-1px);
  }

  .tc-action-btn.reset {
    background: #059669;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
  }

  .tc-action-btn.reset:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  }

  /* ── CTA ── */
  .tc-cta {
    background: #111827;
    border-radius: 20px;
    padding: clamp(36px, 5vw, 56px) clamp(24px, 5vw, 48px);
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .tc-cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #059669, #34d399, #059669);
  }

  .tc-cta-inner {
    position: relative;
    z-index: 1;
  }

  .tc-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 3.5vw, 28px);
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 10px;
  }

  .tc-cta-text {
    font-size: 14.5px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto 24px;
  }

  .tc-cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .tc-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 640px) {
    .tc-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .tc-card-img-wrap {
      padding-top: 75%;
    }

    .tc-cta-btns {
      flex-direction: column;
      align-items: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tc-card,
    .tc-card-social,
    .tc-card-img {
      transition: none !important;
    }

    .tc-skel {
      animation: none !important;
    }
  }
`;

let _tcInjected = false;
function injectTCStyles() {
  if (_tcInjected || typeof document === "undefined") return;
  if (document.getElementById("tc-styles-v2")) { _tcInjected = true; return; }
  const s = document.createElement("style");
  s.id = "tc-styles-v2";
  s.textContent = TC_STYLES;
  document.head.appendChild(s);
  _tcInjected = true;
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="tc-skel-card" aria-hidden="true">
      <div className="tc-skel tc-skel-img" />
      <div className="tc-skel-body">
        <div className="tc-skel" style={{ width: "35%", height: 12 }} />
        <div className="tc-skel" style={{ width: "70%", height: 18 }} />
        <div className="tc-skel" style={{ width: "50%", height: 14 }} />
        <div className="tc-skel" style={{ width: "100%", height: 12, marginTop: 4 }} />
        <div className="tc-skel" style={{ width: "85%", height: 12 }} />
        <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid #f3f4f6", marginTop: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="tc-skel" style={{ width: 32, height: 32, borderRadius: 8 }} />)}
        </div>
      </div>
    </div>
  );
}

/* ── Team card ── */
function TeamCard({ member }) {
  const [imgState, setImgState] = useState("loading"); // loading | loaded | error

  const expertise = Array.isArray(member.expertise) ? member.expertise : [];
  const languages = Array.isArray(member.languages) ? member.languages : [];
  const certifications = Array.isArray(member.certifications) ? member.certifications : [];

  const socialLinks = [
    member.linkedin_url && { href: member.linkedin_url, icon: <FiLinkedin size={14} />, label: "LinkedIn" },
    member.twitter_url && { href: member.twitter_url, icon: <FiTwitter size={14} />, label: "Twitter" },
    member.instagram_url && { href: member.instagram_url, icon: <FiInstagram size={14} />, label: "Instagram" },
    member.website_url && { href: member.website_url, icon: <FiExternalLink size={14} />, label: "Website" },
    member.email && { href: `mailto:${member.email}`, icon: <FiMail size={14} />, label: "Email", internal: true },
    member.phone && { href: `tel:${member.phone}`, icon: <FiPhone size={14} />, label: "Phone", internal: true },
  ].filter(Boolean);

  const initials = member.name
    ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <article className="tc-card" role="listitem">
      {/* Image */}
      <div className="tc-card-img-wrap">
        {member.is_featured && (
          <div className="tc-featured-tag">
            <FiAward size={10} /> Featured
          </div>
        )}

        {imgState === "loading" && member.image_url && (
          <div className="tc-skel" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
        )}

        {imgState === "error" || !member.image_url ? (
          <div className="tc-card-img-fallback">
            <span className="tc-card-initials">{initials}</span>
          </div>
        ) : (
          <img
            src={member.image_url}
            alt={`${member.name} — ${member.role}`}
            className="tc-card-img"
            style={{ opacity: imgState === "loaded" ? 1 : 0 }}
            onLoad={() => setImgState("loaded")}
            onError={() => setImgState("error")}
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="tc-card-img-overlay" />
      </div>

      {/* Body */}
      <div className="tc-card-body">
        {member.department && <span className="tc-card-dept">{member.department}</span>}
        <h3 className="tc-card-name">{member.name}</h3>
        <p className="tc-card-role">{member.role}</p>
        {member.bio && <p className="tc-card-bio">{member.bio}</p>}

        {expertise.length > 0 && (
          <div className="tc-card-tags">
            {expertise.slice(0, 3).map((s, i) => <span key={i} className="tc-card-tag">{s}</span>)}
            {expertise.length > 3 && <span className="tc-card-tag-more">+{expertise.length - 3}</span>}
          </div>
        )}

        <div className="tc-card-meta">
          {languages.length > 0 && (
            <div className="tc-card-meta-item">
              <FiGlobe size={11} />
              <span>{languages.slice(0, 3).join(", ")}{languages.length > 3 ? ` +${languages.length - 3}` : ""}</span>
            </div>
          )}
          {certifications.length > 0 && (
            <div className="tc-card-meta-item" style={{ color: "#d97706" }}>
              <FiAward size={11} style={{ color: "#f59e0b" }} />
              <span>{certifications[0]}{certifications.length > 1 ? ` +${certifications.length - 1}` : ""}</span>
            </div>
          )}
          {member.years_experience > 0 && (
            <div className="tc-card-meta-item">
              <FiCalendar size={11} />
              <span>{member.years_experience}+ years experience</span>
            </div>
          )}
          {member.location && (
            <div className="tc-card-meta-item">
              <FiMapPin size={11} />
              <span>{member.location}</span>
            </div>
          )}
        </div>

        {socialLinks.length > 0 && (
          <div className="tc-card-socials">
            {socialLinks.map((lk, i) => (
              <a
                key={i}
                href={lk.href}
                target={lk.internal ? undefined : "_blank"}
                rel={lk.internal ? undefined : "noopener noreferrer"}
                className="tc-card-social"
                aria-label={lk.label}
                title={lk.label}
              >
                {lk.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ── Department filter ── */
function DepartmentFilter({ departments, activeFilter, onFilter, memberCounts }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? departments : departments.slice(0, 5);
  const hasMore = departments.length > 5;

  return (
    <div className="tc-filters">
      <button
        onClick={() => onFilter("all")}
        className={`tc-filter-btn ${activeFilter === "all" ? "active" : ""}`}
      >
        All
        {memberCounts.all > 0 && <span className="tc-filter-count">{memberCounts.all}</span>}
      </button>

      {visible.map(dept => {
        const name = typeof dept === "string" ? dept : dept.name;
        return (
          <button
            key={name}
            onClick={() => onFilter(name)}
            className={`tc-filter-btn ${activeFilter === name ? "active" : ""}`}
          >
            {name}
            {memberCounts[name] > 0 && <span className="tc-filter-count">{memberCounts[name]}</span>}
          </button>
        );
      })}

      {hasMore && (
        <button className="tc-filter-more" onClick={() => setExpanded(v => !v)}>
          <FiChevronDown size={13} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          {expanded ? "Less" : `+${departments.length - 5}`}
        </button>
      )}
    </div>
  );
}

/* ── Main component ── */
const TeamContent = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [usingFallback, setUsingFallback] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => { injectTCStyles(); }, []);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    try {
      const [membersRes, deptsRes] = await Promise.allSettled([
        teamAPI.getAll({ sort: "display_order", order: "ASC", limit: 100 }),
        teamAPI.getDepartments(),
      ]);
      if (!isMounted.current) return;

      if (membersRes.status === "fulfilled") {
        const arr = Array.isArray(membersRes.value.data)
          ? membersRes.value.data
          : (Array.isArray(membersRes.value) ? membersRes.value : []);
        setMembers(arr);
        setFilteredMembers(arr);
      } else {
        throw new Error(membersRes.reason?.message || "Failed to fetch team");
      }

      if (deptsRes.status === "fulfilled") {
        setDepartments(Array.isArray(deptsRes.value.data) ? deptsRes.value.data : []);
      } else if (membersRes.status === "fulfilled") {
        const arr = Array.isArray(membersRes.value.data) ? membersRes.value.data : [];
        setDepartments([...new Set(arr.map(m => m.department).filter(Boolean))].sort());
      }
    } catch {
      if (!isMounted.current) return;
      setMembers(FALLBACK_MEMBERS);
      setFilteredMembers(FALLBACK_MEMBERS);
      setDepartments([...new Set(FALLBACK_MEMBERS.map(m => m.department).filter(Boolean))].sort());
      setUsingFallback(true);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => { isMounted.current = false; };
  }, [fetchData]);

  useEffect(() => {
    setFilteredMembers(
      activeFilter === "all"
        ? members
        : members.filter(m => m.department?.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [activeFilter, members]);

  const memberCounts = useMemo(() => {
    const c = { all: members.length };
    members.forEach(m => { if (m.department) c[m.department] = (c[m.department] || 0) + 1; });
    return c;
  }, [members]);

  const handleRetry = useCallback(() => { setActiveFilter("all"); fetchData(); }, [fetchData]);

  return (
    <section className="tc-root">
      <div className="tc-wrap">
        {/* Heading */}
        <AnimatedSection animation="fadeInUp">
          <div className="tc-heading">
            <h2 className="tc-title">
              Meet Our <span className="tc-title-accent">Team</span>
            </h2>
            <p className="tc-subtitle">
              Dedicated professionals working collaboratively to deliver seamless
              and authentic East African travel experiences.
            </p>
          </div>
        </AnimatedSection>

        {/* Fallback banner */}
        {usingFallback && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div className="tc-banner">
              <FiAlertCircle size={14} />
              <span>Showing preview data — live data will load when the server is available.</span>
              <button
                onClick={handleRetry}
                style={{
                  background: "none", border: "none", color: "#059669",
                  fontWeight: 700, cursor: "pointer", textDecoration: "underline",
                  marginLeft: 4, fontFamily: "inherit", fontSize: "13px",
                }}
              >
                Retry
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* Filters */}
        {departments.length > 0 && !loading && (
          <AnimatedSection animation="fadeInUp">
            <DepartmentFilter
              departments={departments}
              activeFilter={activeFilter}
              onFilter={setActiveFilter}
              memberCounts={memberCounts}
            />
          </AnimatedSection>
        )}

        {/* Error */}
        {error && (
          <AnimatedSection animation="fadeInUp">
            <div className="tc-state-box error">
              <FiAlertCircle size={36} color="#f87171" />
              <h3 className="tc-state-title">Failed to Load Team</h3>
              <p className="tc-state-text">{error}</p>
              <button className="tc-action-btn retry" onClick={handleRetry}>
                <FiRefreshCw size={14} /> Try Again
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* Cards grid */}
        <div className="tc-grid" role="list">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.06}>
                <SkeletonCard />
              </AnimatedSection>
            ))
            : filteredMembers.map((member, i) => (
              <AnimatedSection key={member.id || i} animation="fadeInUp" delay={i * 0.07}>
                <TeamCard member={member} />
              </AnimatedSection>
            ))
          }
        </div>

        {/* Empty */}
        {!loading && !error && filteredMembers.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <div className="tc-state-box empty">
              <FiUsers size={40} style={{ color: "#d1d5db" }} />
              <h3 className="tc-state-title">No Team Members Found</h3>
              <p className="tc-state-text">
                {activeFilter !== "all"
                  ? `No members in the "${activeFilter}" department.`
                  : "Team members will appear here once added."}
              </p>
              {activeFilter !== "all" && (
                <button className="tc-action-btn reset" onClick={() => setActiveFilter("all")}>
                  View All Members
                </button>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* CTA */}
        <AnimatedSection animation="fadeInUp">
          <div className="tc-cta">
            <div className="tc-cta-inner">
              <h3 className="tc-cta-title">Ready to Start Your Adventure?</h3>
              <p className="tc-cta-text">
                Connect with our team to begin planning your transformative East African journey.
              </p>
              <div className="tc-cta-btns">
                <Button to="/contact" variant="primary" icon={<FiArrowRight size={16} />}>
                  Contact Our Team
                </Button>
                <Button to="/destinations" variant="outline">
                  Explore Destinations
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamContent;