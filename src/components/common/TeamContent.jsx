// src/components/common/TeamContent.jsx — Premium Green/White Redesign
import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  FiArrowRight, FiLinkedin, FiMail, FiTwitter, FiInstagram,
  FiExternalLink, FiMapPin, FiAward, FiUsers, FiGlobe, FiHeart,
  FiPhone, FiCalendar, FiRefreshCw, FiAlertCircle, FiChevronDown,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";
import SharedTeamCard from "./TeamCard";

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
  getStats()       { return this._fetch("/team/stats"); },
};

/* ── Fallback data ── */
const FALLBACK_MEMBERS = [
  { id:1, name:"IGIRANEZA Fabrice", role:"Founder & CEO", department:"Leadership", image_url:"https://randomuser.me/api/portraits/men/32.jpg", bio:"Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.", expertise:["Strategic Planning","Tourism Innovation","Partnership Development"], languages:["English","French","Kinyarwanda"], certifications:[], years_experience:12, location:"Musanze, Rwanda", linkedin_url:"https://linkedin.com", twitter_url:"https://twitter.com", email:"fabrice@altuvera.com", is_featured:true, is_active:true, display_order:1, joined_date:"2020-01-15" },
  { id:2, name:"UWIMANA Grace",     role:"Head of Operations",          department:"Operations",      image_url:"https://randomuser.me/api/portraits/women/44.jpg", bio:"Ensures seamless coordination of every itinerary with precision and local expertise.", expertise:["Logistics Management","Quality Assurance","Team Coordination"], languages:["English","Swahili"], certifications:[], years_experience:8, location:"Musanze, Rwanda", linkedin_url:"https://linkedin.com", email:"grace@altuvera.com", is_featured:false, is_active:true, display_order:2 },
  { id:3, name:"MUTABAZI Jean",     role:"Lead Safari Guide",           department:"Guides",          image_url:"https://randomuser.me/api/portraits/men/67.jpg", bio:"Expert wildlife guide combining extensive field knowledge with exceptional safety standards.", expertise:["Wildlife Tracking","Bird Identification","Conservation Education"], languages:["English","Swahili","French"], certifications:["Certified Safari Guide","Wilderness First Aid"], years_experience:15, location:"Serengeti, Tanzania", linkedin_url:"https://linkedin.com", email:"jean@altuvera.com", is_featured:true, is_active:true, display_order:3 },
  { id:4, name:"INGABIRE Diane",    role:"Customer Experience Manager", department:"Customer Service",image_url:"https://randomuser.me/api/portraits/women/28.jpg", bio:"Designs guest-first service experiences from initial inquiry through post-trip follow-up.", expertise:["Client Relations","Service Design","Feedback Analysis"], languages:["English","French"], certifications:[], years_experience:6, location:"Kampala, Uganda", linkedin_url:"https://linkedin.com", twitter_url:"https://twitter.com", email:"diane@altuvera.com", is_featured:false, is_active:true, display_order:4 },
  { id:5, name:"HABIMANA Patrick",  role:"Conservation Liaison",        department:"Conservation",    image_url:"https://randomuser.me/api/portraits/men/52.jpg", bio:"Manages partnerships with wildlife conservancies and oversees community development initiatives.", expertise:["Conservation Strategy","Community Engagement","Sustainability"], languages:["English","Rukiga"], certifications:["Conservation Management Certificate"], years_experience:10, location:"Bwindi, Uganda", linkedin_url:"https://linkedin.com", email:"patrick@altuvera.com", is_featured:false, is_active:true, display_order:5 },
  { id:6, name:"MUKAMANA Claudine", role:"Marketing Director",          department:"Marketing",       image_url:"https://randomuser.me/api/portraits/women/65.jpg", bio:"Leads brand strategy and digital marketing initiatives to connect travelers with authentic African experiences.", expertise:["Digital Marketing","Brand Strategy","Content Creation"], languages:["English","French","Kinyarwanda"], certifications:[], years_experience:7, location:"Musanze, Rwanda", linkedin_url:"https://linkedin.com", twitter_url:"https://twitter.com", instagram_url:"https://instagram.com", email:"claudine@altuvera.com", is_featured:false, is_active:true, display_order:6 },
];

const FALLBACK_STATS = { total_members:15, countries_covered:4, combined_experience:50, happy_travelers:2000 };

/* ── Styles ── */
const TC_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

  .tc-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    padding: clamp(64px,8vw,112px) clamp(16px,3vw,40px);
    background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%);
    position: relative; overflow: hidden;
  }
  .tc-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(circle at 15% 20%, rgba(5,150,105,0.04) 0%, transparent 50%),
      radial-gradient(circle at 85% 80%, rgba(16,185,129,0.05) 0%, transparent 50%);
  }
  .tc-wrap { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }

  /* ── Heading ── */
  .tc-heading { text-align: center; margin-bottom: 56px; }
  .tc-label {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 20px; border-radius: 50px;
    background: linear-gradient(135deg,#f0fdf4,#dcfce7); border: 1.5px solid #a7f3d0;
    color: #059669; font-size: 12px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px;
  }
  .tc-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px,5vw,52px); font-weight: 900;
    color: #064e3b; margin-bottom: 16px; line-height: 1.15; letter-spacing: -0.02em;
  }
  .tc-title-accent { color: #059669; }
  .tc-subtitle {
    font-size: clamp(15px,2vw,18px); color: #4b5563;
    line-height: 1.8; max-width: 660px; margin: 0 auto;
  }
  .tc-divider {
    width: 72px; height: 4px;
    background: linear-gradient(90deg,#059669,#4ade80);
    margin: 24px auto 0; border-radius: 2px;
  }

  /* ── Fallback banner ── */
  .tc-banner {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px; background: #fffbeb; border: 1.5px solid #fde68a;
    border-radius: 14px; margin-bottom: 28px; color: #92400e; font-size: 13.5px;
  }

  /* ── Stats ── */
  .tc-stats {
    display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
    gap: 20px; margin-bottom: 64px;
  }
  .tc-stat {
    background: white; border-radius: 22px; padding: 28px 22px; text-align: center;
    border: 1px solid #d1fae5; box-shadow: 0 6px 24px rgba(5,150,105,0.08);
    transition: all 0.3s ease;
  }
  .tc-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 44px rgba(5,150,105,0.14); }
  .tc-stat-icon {
    width: 58px; height: 58px; border-radius: 16px;
    background: linear-gradient(135deg,#f0fdf4,#dcfce7);
    border: 1.5px solid #a7f3d0;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; color: #059669;
  }
  .tc-stat-val  { font-family:'Playfair Display',serif; font-size:36px; font-weight:900; color:#064e3b; margin-bottom:4px; line-height:1; }
  .tc-stat-lbl  { font-size:13.5px; color:#6b7280; font-weight:500; }

  /* ── Filters ── */
  .tc-filters {
    display: flex; flex-wrap: wrap; justify-content: center;
    gap: 10px; margin-bottom: 48px;
  }
  .tc-filter-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 22px; border-radius: 50px;
    border: 1.5px solid #d1fae5; background: white;
    color: #059669; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600;
    cursor: pointer; transition: all 0.22s ease;
  }
  .tc-filter-btn:hover { border-color:#a7f3d0; background:#f0fdf4; transform:translateY(-1px); }
  .tc-filter-btn.active {
    background: linear-gradient(135deg,#059669,#065f46);
    border-color:#059669; color:white;
    box-shadow:0 4px 16px rgba(5,150,105,0.28);
  }
  .tc-filter-count {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:20px; height:20px; padding:0 5px; border-radius:50px;
    background:rgba(5,150,105,0.12); color:#059669; font-size:10.5px; font-weight:800;
  }
  .tc-filter-btn.active .tc-filter-count { background:rgba(255,255,255,0.22); color:white; }
  .tc-filter-more {
    display:inline-flex; align-items:center; gap:6px;
    padding:10px 18px; border-radius:50px;
    border:1.5px dashed #d1fae5; background:transparent;
    color:#059669; font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
    cursor:pointer; transition:all 0.22s;
  }
  .tc-filter-more:hover { border-color:#a7f3d0; background:#f0fdf4; }

  /* ── Grid ── */
  .tc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px,1fr));
    gap: 26px; margin-bottom: 56px;
  }

  /* ── Card ── */
  .tc-card {
    background: white; border-radius: 24px;
    border: 1px solid #d1fae5;
    box-shadow: 0 6px 24px rgba(5,150,105,0.08);
    padding: 28px 22px; text-align: center;
    transition: all 0.36s cubic-bezier(0.4,0,0.2,1);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .tc-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 56px rgba(5,150,105,0.18);
    border-color: #a7f3d0;
  }
  .tc-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg,#059669,#4ade80,#059669);
    opacity: 0; transition: opacity 0.3s;
  }
  .tc-card:hover::before { opacity: 1; }

  /* Featured badge */
  .tc-featured-badge {
    position: absolute; top: 14px; right: 14px;
    display: flex; align-items: center; gap: 4px;
    padding: 5px 11px; border-radius: 50px;
    background: linear-gradient(135deg,#fef3c7,#fde68a);
    color: #d97706; font-size: 10.5px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em;
    border: 1px solid #fde68a;
  }

  /* Avatar */
  .tc-avatar-wrap { position:relative; width:120px; height:120px; margin:0 auto 18px; }
  .tc-avatar-ring {
    width:100%; height:100%; border-radius:50%;
    overflow:hidden; border:4px solid #d1fae5;
    transition:all 0.36s ease;
    position:relative;
  }
  .tc-card:hover .tc-avatar-ring { border-color:#a7f3d0; box-shadow:0 0 0 6px rgba(5,150,105,0.10); }
  .tc-avatar-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease; }
  .tc-card:hover .tc-avatar-img { transform:scale(1.07); }
  .tc-avatar-fallback {
    width:100%; height:100%; border-radius:50%;
    background:linear-gradient(135deg,#d1fae5,#a7f3d0);
    display:flex; align-items:center; justify-content:center;
  }
  .tc-avatar-initials { font-family:'Playfair Display',serif; font-size:34px; font-weight:800; color:#059669; }
  .tc-status-dot {
    position:absolute; bottom:6px; right:6px;
    width:15px; height:15px; border-radius:50%;
    border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.14);
  }

  /* Card text */
  .tc-name { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#064e3b; margin-bottom:5px; line-height:1.25; }
  .tc-role { font-size:14px; color:#059669; font-weight:600; margin-bottom:8px; }
  .tc-dept {
    display:inline-block; padding:3px 12px; border-radius:50px;
    background:#f0fdf4; border:1px solid #d1fae5;
    font-size:11.5px; color:#047857; font-weight:600; margin-bottom:13px;
  }
  .tc-bio { font-size:13.5px; color:#6b7280; line-height:1.7; margin-bottom:14px; }

  /* Expertise tags */
  .tc-tags { display:flex; flex-wrap:wrap; justify-content:center; gap:5px; margin-bottom:12px; }
  .tc-tag { padding:3px 9px; border-radius:7px; background:#ecfdf5; border:1px solid #d1fae5; font-size:10.5px; color:#059669; font-weight:600; }
  .tc-tag-more { padding:3px 9px; border-radius:7px; background:#f3f4f6; font-size:10.5px; color:#6b7280; font-weight:600; }

  /* Meta rows */
  .tc-meta { display:flex; align-items:center; justify-content:center; gap:6px; font-size:12px; color:#6b7280; margin-bottom:6px; }

  /* Socials */
  .tc-socials {
    display:flex; justify-content:center; flex-wrap:wrap; gap:9px;
    padding-top:14px; border-top:1px solid #d1fae5; margin-top:auto;
  }
  .tc-social-link {
    width:36px; height:36px; border-radius:50%;
    border:1.5px solid #a7f3d0; background:#f0fdf4;
    color:#047857; display:flex; align-items:center; justify-content:center;
    text-decoration:none; transition:all 0.22s;
  }
  .tc-social-link:hover {
    background:linear-gradient(135deg,#059669,#065f46);
    border-color:#059669; color:white;
    transform:translateY(-2px); box-shadow:0 4px 12px rgba(5,150,105,0.3);
  }

  /* ── Skeleton ── */
  .tc-skeleton-shimmer {
    background:linear-gradient(110deg,#d1fae5 8%,#ecfdf5 18%,#d1fae5 33%);
    background-size:200% 100%;
    animation:tc-shimmer 1.5s ease infinite;
  }
  @keyframes tc-shimmer { from{background-position:-200% 0} to{background-position:200% 0} }

  /* ── Error / Empty ── */
  .tc-error, .tc-empty {
    text-align:center; padding:56px 24px; border-radius:20px;
    display:flex; flex-direction:column; align-items:center;
    margin-bottom:32px;
  }
  .tc-error { background:#fef2f2; border:1px solid #fecaca; }
  .tc-empty { background:#f0fdf4; border:1px solid #d1fae5; }
  .tc-error-title, .tc-empty-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#064e3b; margin:14px 0 8px; }
  .tc-error-text, .tc-empty-text  { font-size:14px; color:#9ca3af; margin:0 0 20px; line-height:1.6; }
  .tc-retry-btn, .tc-reset-btn {
    display:flex; align-items:center; gap:8px;
    padding:11px 26px; border-radius:50px; font-family:'Inter',sans-serif;
    font-size:13.5px; font-weight:700; cursor:pointer; transition:all 0.22s;
    border:none;
  }
  .tc-retry-btn { background:#fef2f2; border:2px solid #f87171; color:#dc2626; }
  .tc-retry-btn:hover { background:#fee2e2; transform:translateY(-2px); }
  .tc-reset-btn { background:linear-gradient(135deg,#059669,#065f46); color:white; box-shadow:0 4px 16px rgba(5,150,105,0.28); }
  .tc-reset-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(5,150,105,0.38); }

  /* ── CTA ── */
  .tc-cta {
    background:linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%);
    border-radius:26px; padding:clamp(40px,6vw,64px) clamp(24px,5vw,56px);
    text-align:center; position:relative; overflow:hidden;
  }
  .tc-cta-pattern {
    position:absolute; inset:0; pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .tc-cta-inner { position:relative; z-index:1; }
  .tc-cta-title { font-family:'Playfair Display',serif; font-size:clamp(22px,4vw,32px); font-weight:800; color:white; margin:0 0 12px; }
  .tc-cta-text  { font-size:15px; color:rgba(255,255,255,0.75); line-height:1.7; max-width:480px; margin:0 auto 28px; }
  .tc-cta-btns  { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

  /* Responsive */
  @media (max-width:768px) {
    .tc-grid { grid-template-columns:1fr; gap:18px; }
    .tc-stats { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:480px) {
    .tc-stats { grid-template-columns:1fr; }
    .tc-cta-btns { flex-direction:column; align-items:center; }
  }
  @media (prefers-reduced-motion:reduce) {
    .tc-card, .tc-stat, .tc-social-link { transition:none!important; }
    .tc-skeleton-shimmer { animation:none!important; }
  }
`;

let _tcInjected = false;
function injectTCStyles() {
  if (_tcInjected || typeof document === "undefined") return;
  if (document.getElementById("tc-styles")) { _tcInjected = true; return; }
  const s = document.createElement("style");
  s.id = "tc-styles";
  s.textContent = TC_STYLES;
  document.head.appendChild(s);
  _tcInjected = true;
}

/* ── Skeleton card ── */
function SkeletonCard() {
  const bar = (w, h, r = "8px", mb = "0") => (
    <div className="tc-skeleton-shimmer" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
  );
  return (
    <div className="tc-card" style={{ gap: 0 }} aria-hidden="true">
      <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 18px" }} className="tc-skeleton-shimmer" />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        {bar("65%", "22px", "8px")}
        {bar("45%", "14px", "6px")}
        {bar("38%", "20px", "50px")}
        {bar("90%", "13px", "5px")}
        {bar("75%", "13px", "5px")}
        {bar("60%", "13px", "5px")}
      </div>
      <div style={{ display:"flex", justifyContent:"center", gap:8, paddingTop:14, marginTop:14, borderTop:"1px solid #d1fae5" }}>
        {[1,2,3].map(i => <div key={i} className="tc-skeleton-shimmer" style={{ width:36, height:36, borderRadius:"50%" }} />)}
      </div>
    </div>
  );
}

/* ── Team card ── */
function TeamCard({ member }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr,    setImgErr]    = useState(false);

  const expertise      = Array.isArray(member.expertise)      ? member.expertise      : [];
  const languages      = Array.isArray(member.languages)      ? member.languages      : [];
  const certifications = Array.isArray(member.certifications) ? member.certifications : [];

  const socialLinks = [
    member.linkedin_url  && { href: member.linkedin_url,          icon: <FiLinkedin size={15} />,    label: "LinkedIn"  },
    member.twitter_url   && { href: member.twitter_url,           icon: <FiTwitter size={15} />,     label: "Twitter"   },
    member.instagram_url && { href: member.instagram_url,         icon: <FiInstagram size={15} />,   label: "Instagram" },
    member.website_url   && { href: member.website_url,           icon: <FiExternalLink size={15} />,label: "Website"   },
    member.email         && { href: `mailto:${member.email}`,     icon: <FiMail size={15} />,        label: "Email",    internal: true },
    member.phone         && { href: `tel:${member.phone}`,        icon: <FiPhone size={15} />,       label: "Phone",    internal: true },
  ].filter(Boolean);

  const initials = member.name
    ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <article className="tc-card" role="listitem">
      {member.is_featured && (
        <div className="tc-featured-badge">
          <FiAward size={11} /> Featured
        </div>
      )}

      {/* Avatar */}
      <div className="tc-avatar-wrap">
        <div className="tc-avatar-ring">
          {!imgLoaded && !imgErr && (
            <div className="tc-skeleton-shimmer" style={{ position:"absolute", inset:0, borderRadius:"50%" }} />
          )}
          {imgErr && (
            <div className="tc-avatar-fallback">
              <span className="tc-avatar-initials">{initials}</span>
            </div>
          )}
          {member.image_url && !imgErr && (
            <img
              src={member.image_url} alt={`${member.name} – ${member.role}`}
              className="tc-avatar-img"
              style={{ opacity: imgLoaded ? 1 : 0 }}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgErr(true); setImgLoaded(true); }}
              loading="lazy"
            />
          )}
        </div>
        <div
          className="tc-status-dot"
          style={{ backgroundColor: member.is_active ? "#10b981" : "#9ca3af" }}
          title={member.is_active ? "Active" : "Inactive"}
        />
      </div>

      {/* Info */}
      <h3 className="tc-name">{member.name}</h3>
      <p className="tc-role">{member.role}</p>
      {member.department && <span className="tc-dept">{member.department}</span>}
      {member.bio && <p className="tc-bio">{member.bio}</p>}

      {expertise.length > 0 && (
        <div className="tc-tags">
          {expertise.slice(0, 3).map((s, i) => <span key={i} className="tc-tag">{s}</span>)}
          {expertise.length > 3 && <span className="tc-tag-more">+{expertise.length - 3}</span>}
        </div>
      )}

      {languages.length > 0 && (
        <div className="tc-meta">
          <FiGlobe size={11} style={{ color:"#9ca3af", flexShrink:0 }} />
          <span>{languages.slice(0, 3).join(", ")}{languages.length > 3 ? ` +${languages.length - 3}` : ""}</span>
        </div>
      )}
      {certifications.length > 0 && (
        <div className="tc-meta" style={{ color:"#d97706" }}>
          <FiAward size={11} style={{ flexShrink:0 }} />
          <span>{certifications[0]}{certifications.length > 1 ? ` +${certifications.length - 1}` : ""}</span>
        </div>
      )}
      {member.years_experience > 0 && (
        <div className="tc-meta">
          <FiCalendar size={11} style={{ color:"#9ca3af", flexShrink:0 }} />
          <span>{member.years_experience}+ years experience</span>
        </div>
      )}
      {member.location && (
        <div className="tc-meta">
          <FiMapPin size={11} style={{ color:"#9ca3af", flexShrink:0 }} />
          <span>{member.location}</span>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="tc-socials">
          {socialLinks.map((lk, i) => (
            <a
              key={i} href={lk.href}
              target={lk.internal ? undefined : "_blank"}
              rel={lk.internal ? undefined : "noopener noreferrer"}
              className="tc-social-link" aria-label={lk.label} title={lk.label}
            >
              {lk.icon}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}

/* ── Stats section ── */
function StatsSection() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    teamAPI.getStats()
      .then(res => { if (!cancel) setStats(res.data); })
      .catch(() => { if (!cancel) setStats(FALLBACK_STATS); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, []);

  const data = stats || FALLBACK_STATS;
  const items = [
    { icon: <FiUsers size={24} />,   value: `${data.total_members || 3}+`,          label: "Team Members"               },
    { icon: <FiGlobe size={24} />,   value: `${data.countries_covered || 2}`,        label: "Countries Covered"          },
    { icon: <FiAward size={24} />,   value: `${data.combined_experience || 5}+`,     label: "Years Combined Experience"  },
    { icon: <FiHeart size={24} />,   value: `${data.happy_travelers || "2"}+`,       label: "Happy Travelers"            },
  ];

  return (
    <div className="tc-stats">
      {items.map((s, i) => (
        <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.09}>
          <div className="tc-stat" style={{ opacity: loading ? 0.6 : 1 }}>
            <div className="tc-stat-icon">{s.icon}</div>
            <div className="tc-stat-val">{loading ? "—" : s.value}</div>
            <div className="tc-stat-lbl">{s.label}</div>
          </div>
        </AnimatedSection>
      ))}
    </div>
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
        All Team
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
          <FiChevronDown size={14} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.25s" }} />
          {expanded ? "Less" : `+${departments.length - 5}`}
        </button>
      )}
    </div>
  );
}

/* ── Main component ── */
const TeamContent = () => {
  const [members,         setMembers]         = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments,     setDepartments]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [activeFilter,    setActiveFilter]    = useState("all");
  const [usingFallback,   setUsingFallback]   = useState(false);
  const isMounted = useRef(true);

  useEffect(() => { injectTCStyles(); }, []);

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true); setError(null); setUsingFallback(false);
    try {
      const [membersRes, deptsRes] = await Promise.allSettled([
        teamAPI.getAll({ sort:"display_order", order:"ASC", limit:100 }),
        teamAPI.getDepartments(),
      ]);
      if (!isMounted.current) return;

      if (membersRes.status === "fulfilled") {
        const arr = Array.isArray(membersRes.value.data) ? membersRes.value.data : (Array.isArray(membersRes.value) ? membersRes.value : []);
        setMembers(arr); setFilteredMembers(arr);
      } else {
        throw new Error(membersRes.reason?.message || "Failed to fetch team");
      }

      if (deptsRes.status === "fulfilled") {
        setDepartments(Array.isArray(deptsRes.value.data) ? deptsRes.value.data : []);
      } else if (membersRes.status === "fulfilled") {
        const arr = Array.isArray(membersRes.value.data) ? membersRes.value.data : [];
        setDepartments([...new Set(arr.map(m => m.department).filter(Boolean))].sort());
      }
    } catch (err) {
      if (!isMounted.current) return;
      setMembers(FALLBACK_MEMBERS); setFilteredMembers(FALLBACK_MEMBERS);
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
      <div className="tc-bg" aria-hidden="true" />
      <div className="tc-wrap">

        {/* Heading */}
        <AnimatedSection animation="fadeInUp">
          <div className="tc-heading">
            <div className="tc-label">
              <FiUsers size={13} /> Our People
            </div>
            <h2 className="tc-title">
              Meet the <span className="tc-title-accent">Team</span>
            </h2>
            <p className="tc-subtitle">
              From strategic leadership to expert field guides, our dedicated professionals
              work collaboratively to deliver seamless, responsible, and deeply authentic
              East African travel experiences.
            </p>
            <div className="tc-divider" />
          </div>
        </AnimatedSection>

        {/* Fallback banner */}
        {usingFallback && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div className="tc-banner">
              <FiAlertCircle size={15} />
              <span>Showing preview data — live data will load when the server is available.</span>
              <button onClick={handleRetry} style={{ background:"none",border:"none",color:"#059669",fontWeight:700,cursor:"pointer",textDecoration:"underline",marginLeft:4,fontFamily:"inherit" }}>
                Retry
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* Stats */}
        <StatsSection />

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
            <div className="tc-error">
              <FiAlertCircle size={38} color="#f87171" />
              <h3 className="tc-error-title">Failed to Load Team</h3>
              <p className="tc-error-text">{error}</p>
              <button className="tc-retry-btn" onClick={handleRetry}>
                <FiRefreshCw size={15} /> Try Again
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* Cards grid */}
        <div className="tc-grid" role="list">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <AnimatedSection key={i} animation="fadeInUp" delay={i * 0.07}>
                  <SkeletonCard />
                </AnimatedSection>
              ))
            : filteredMembers.map((member, i) => (
                <AnimatedSection key={member.id || i} animation="fadeInUp" delay={i * 0.08}>
                  <SharedTeamCard member={member} />
                </AnimatedSection>
              ))
          }
        </div>

        {/* Empty */}
        {!loading && !error && filteredMembers.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <div className="tc-empty">
              <FiUsers size={44} style={{ color:"#a7f3d0" }} />
              <h3 className="tc-empty-title">No Team Members Found</h3>
              <p className="tc-empty-text">
                {activeFilter !== "all"
                  ? `No members in the "${activeFilter}" department.`
                  : "Team members will appear here once added."}
              </p>
              {activeFilter !== "all" && (
                <button className="tc-reset-btn" onClick={() => setActiveFilter("all")}>
                  View All Members
                </button>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* CTA */}
        <AnimatedSection animation="fadeInUp">
          <div className="tc-cta">
            <div className="tc-cta-pattern" />
            <div className="tc-cta-inner">
              <h3 className="tc-cta-title">Ready to Start Your Adventure?</h3>
              <p className="tc-cta-text">
                Connect with our team to begin planning your transformative East African journey.
              </p>
              <div className="tc-cta-btns">
                <Button to="/contact" variant="primary" icon={<FiArrowRight size={17} />}>
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