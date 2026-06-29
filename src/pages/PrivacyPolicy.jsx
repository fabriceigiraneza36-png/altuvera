// src/pages/PrivacyPolicy.jsx — Premium Green/White Redesign
import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FiShield, FiDatabase, FiSettings, FiShare2, FiGlobe, FiLock,
  FiUserCheck, FiClock, FiMail, FiChevronRight, FiCheckCircle,
  FiPrinter, FiDownload, FiSearch, FiEye, FiTrash2, FiEdit3,
  FiXCircle, FiMenu, FiX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";

/* ── Constants ── */
const LAST_UPDATED   = "March 3, 2026";
const EFFECTIVE_DATE = "March 10, 2026";
const VERSION        = "2.1";

const SECTIONS = [
  {
    id: "information-collected", icon: FiDatabase, title: "Information We Collect", color: "#3B82F6",
    highlights: [
      { icon: FiUserCheck, label: "Information you provide",  detail: "Name, email, phone, travel preferences, account details" },
      { icon: FiEye,       label: "Automatically collected",  detail: "Browser type, device info, IP address, pages visited" },
    ],
    body: [
      "We collect personal information you provide directly when creating an account, making a booking, or contacting our team — including your name, email address, phone number, travel preferences, passport details (when required for bookings), and payment information.",
      "We also automatically collect technical data such as browser type, device information, IP address, approximate location, referring URLs, and pages visited. This helps us improve platform performance, security, and your overall experience.",
      "When you interact with our safari guides or travel consultants, conversation summaries may be retained to provide better, more personalized service in the future.",
    ],
  },
  {
    id: "how-we-use", icon: FiSettings, title: "How We Use Your Information", color: "#047857",
    highlights: [
      { icon: FiCheckCircle, label: "Service delivery",     detail: "Process bookings, provide support, send trip updates" },
      { icon: FiCheckCircle, label: "Platform improvement", detail: "Analytics, personalization, security monitoring" },
    ],
    body: [
      "We use your information to deliver and continuously improve our services — including processing travel inquiries and bookings, sending essential trip confirmations and updates, providing responsive customer support, and personalizing destination recommendations.",
      "With your consent, we may send marketing communications about new destinations, special safari packages, and seasonal offers across East Africa. You can opt out at any time through your account settings or the unsubscribe link in any email.",
      "We also use aggregated, anonymized data for analytics purposes to understand travel trends across Rwanda, Tanzania, Uganda, and Ethiopia.",
    ],
  },
  {
    id: "sharing", icon: FiShare2, title: "Sharing of Information", color: "#8B5CF6",
    highlights: [
      { icon: FiXCircle,     label: "We never sell your data",  detail: "Your personal information is not for sale — period" },
      { icon: FiCheckCircle, label: "Limited, necessary sharing", detail: "Only with verified travel partners to fulfill bookings" },
    ],
    body: [
      "We do not sell, rent, or trade your personal information to third parties for their marketing purposes.",
      "We share information only with trusted, vetted service providers and travel partners — strictly to fulfill your safari bookings, arrange accommodations, process secure payments, provide ground transportation, and comply with legal obligations in relevant East African jurisdictions.",
      "All third-party partners are contractually bound to handle your data with the same level of care and confidentiality that we maintain.",
    ],
  },
  {
    id: "cookies", icon: FiGlobe, title: "Cookies and Tracking", color: "#F59E0B",
    highlights: [
      { icon: FiCheckCircle, label: "Essential cookies", detail: "Authentication, security, session management" },
      { icon: FiCheckCircle, label: "Optional cookies",  detail: "Analytics, preferences, personalization" },
    ],
    body: [
      "We use cookies and similar tracking technologies to authenticate your sessions, remember your language and currency preferences, analyze platform usage patterns, and deliver a more personalized browsing experience.",
      "You can manage cookie preferences through your browser settings or via our in-app cookie consent banner. Disabling certain cookies may affect platform functionality. We respect Do Not Track signals where technically feasible.",
    ],
  },
  {
    id: "retention", icon: FiClock, title: "Data Retention", color: "#EC4899",
    body: [
      "We retain personal information only as long as necessary for active service delivery, legal and regulatory compliance, dispute resolution, fraud prevention, and legitimate business purposes.",
      "Booking records are typically retained for 7 years in accordance with East African financial regulations. You may request earlier deletion of non-essential data at any time.",
      "When data is no longer needed, it is securely deleted or irreversibly anonymized.",
    ],
  },
  {
    id: "security", icon: FiLock, title: "Data Security", color: "#EF4444",
    body: [
      "We implement industry-standard technical and organizational safeguards to protect your information — including TLS/SSL encryption for data in transit, encrypted storage for sensitive data at rest, regular security audits, and role-based access controls for our team.",
      "While no internet transmission or digital storage system can be guaranteed 100% secure, we continuously monitor, update, and strengthen our security practices to minimize risk.",
      "In the unlikely event of a data breach, we will notify affected users and relevant authorities in accordance with applicable data protection laws.",
    ],
  },
  {
    id: "your-rights", icon: FiUserCheck, title: "Your Rights", color: "#06B6D4",
    highlights: [
      { icon: FiEye,      label: "Access",  detail: "View what data we hold" },
      { icon: FiEdit3,    label: "Correct", detail: "Update inaccurate data" },
      { icon: FiTrash2,   label: "Delete",  detail: "Request data removal" },
      { icon: FiDownload, label: "Export",  detail: "Download your data" },
    ],
    body: [
      "Depending on your location and applicable law, you have the right to access, correct, update, or delete your personal information, restrict or object to certain processing activities, withdraw consent at any time, and request a portable copy of your data.",
      "East African residents and EU/UK visitors are afforded rights under their respective data protection frameworks. We handle all requests promptly and in good faith.",
      "To exercise any of these rights, contact our Data Protection team using the details in Section 9 below.",
    ],
  },
  {
    id: "international-transfers", icon: FiGlobe, title: "International Transfers", color: "#14B8A6",
    body: [
      "Your information may be processed in countries other than your country of residence — including Rwanda, Tanzania, Uganda, and Ethiopia — as well as cloud infrastructure regions required for reliable service delivery.",
      "Where required by law, we apply appropriate safeguards for international data transfers, such as Standard Contractual Clauses or equivalent mechanisms recognized under applicable data protection regulations.",
    ],
  },
  {
    id: "contact", icon: FiMail, title: "Contact Us", color: "#047857",
    body: ["If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, we'd love to hear from you."],
    contact: { email: "altuverasafari@gmail.com", address: "Musanze, Rwanda", response: "We aim to respond within 48 hours on business days." },
  },
];

/* ── Inject styles ── */
const PP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

  .pp2-root {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    background: #f0fdf4;
  }

  /* ── Summary bar ── */
  .pp2-summary-bar {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
    position: relative; z-index: 5;
    box-shadow: 0 4px 24px rgba(4,47,31,0.28);
    overflow: hidden;
  }
  .pp2-summary-bar::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .pp2-summary-inner {
    max-width: 1320px; margin: 0 auto;
    padding: 0 clamp(16px,3vw,40px);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
    position: relative; z-index: 1;
  }
  .pp2-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    flex: 1;
  }
  .pp2-summary-item {
    display: flex; align-items: center; gap: 14px;
    padding: 24px 20px;
    border-right: 1px solid rgba(255,255,255,0.08);
    transition: background 0.2s;
  }
  .pp2-summary-item:last-child { border-right: none; }
  .pp2-summary-item:hover { background: rgba(255,255,255,0.04); }
  .pp2-summary-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: rgba(255,255,255,0.10);
    display: flex; align-items: center; justify-content: center;
    color: #86efac; flex-shrink: 0;
  }
  .pp2-summary-label { font-size: 14px; font-weight: 700; color: white; line-height: 1.3; }
  .pp2-summary-sub   { font-size: 12px; color: rgba(255,255,255,0.52); font-weight: 500; margin-top: 2px; }
  .pp2-menu-btn {
    display: none; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 12px;
    background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.2);
    color: white; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; white-space: nowrap; font-family: inherit;
    flex-shrink: 0;
  }
  .pp2-menu-btn:hover { background: rgba(255,255,255,0.18); }

  /* ── Main ── */
  .pp2-main {
    background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%);
    padding: 48px 0 96px; position: relative;
  }
  .pp2-wrap { max-width: 1320px; margin: 0 auto; padding: 0 clamp(16px,3vw,40px); }
  .pp2-layout {
    display: grid; grid-template-columns: 256px 1fr; gap: 36px; align-items: flex-start;
    position: relative;
  }
  .pp2-layout-full { grid-template-columns: 1fr; }

  /* ── Backdrop ── */
  .pp2-backdrop {
    display: none; position: fixed; inset: 0;
    background: rgba(4,47,31,0.45); backdrop-filter: blur(6px); z-index: 998;
  }

  /* ── Sidebar ── */
  .pp2-sidebar {
    position: sticky; top: 96px;
  }
  .pp2-sidebar-inner {
    background: white; border-radius: 22px;
    padding: 22px 18px;
    border: 1px solid #d1fae5;
    box-shadow: 0 4px 20px rgba(5,150,105,0.07);
  }
  .pp2-sidebar-head {
    display: flex; align-items: center; gap: 9px;
    font-size: 13px; font-weight: 800; color: #064e3b;
    text-transform: uppercase; letter-spacing: 0.07em;
    margin-bottom: 16px; padding-bottom: 14px;
    border-bottom: 1px solid #d1fae5;
  }
  .pp2-sidebar-head-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg,#059669,#065f46);
    display: flex; align-items: center; justify-content: center; color: white;
  }
  .pp2-search-wrap { position: relative; margin-bottom: 14px; }
  .pp2-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
  .pp2-search-input {
    width: 100%; padding: 9px 11px 9px 34px; box-sizing: border-box;
    font-family: 'Inter', sans-serif; font-size: 13px;
    border: 1.5px solid #d1fae5; border-radius: 11px;
    background: #f9fffe; color: #1f2937; outline: none; transition: all 0.2s;
  }
  .pp2-search-input::placeholder { color: #9ca3af; }
  .pp2-search-input:focus { border-color: #059669; background: white; box-shadow: 0 0 0 3px rgba(5,150,105,0.09); }
  .pp2-nav { display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px; }
  .pp2-nav-btn {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 11px; border-radius: 11px; border: none;
    background: transparent; cursor: pointer;
    font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 500;
    color: #6b7280; text-align: left; transition: all 0.2s; width: 100%;
  }
  .pp2-nav-btn:hover { background: #f0fdf4; color: #065f46; }
  .pp2-nav-btn.active {
    background: linear-gradient(135deg, #059669, #065f46);
    color: white; font-weight: 700;
    box-shadow: 0 4px 14px rgba(5,150,105,0.24);
  }
  .pp2-nav-num { font-size: 10px; font-weight: 800; opacity: 0.5; min-width: 18px; }
  .pp2-nav-btn.active .pp2-nav-num { opacity: 0.8; }
  .pp2-nav-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pp2-nav-arrow { opacity: 0; transform: translateX(-4px); transition: all 0.2s; flex-shrink: 0; }
  .pp2-nav-btn:hover .pp2-nav-arrow,
  .pp2-nav-btn.active .pp2-nav-arrow { opacity: 1; transform: translateX(0); }
  .pp2-sidebar-actions {
    display: flex; flex-direction: column; gap: 7px;
    padding-top: 14px; border-top: 1px solid #d1fae5;
  }
  .pp2-action-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 11px; border-radius: 11px;
    border: 1.5px solid #d1fae5; background: #f0fdf4;
    color: #065f46; font-family: 'Inter',sans-serif; font-size: 12.5px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; width: 100%;
  }
  .pp2-action-btn:hover { background: #dcfce7; border-color: #a7f3d0; transform: translateX(2px); }

  /* ── Content ── */
  .pp2-content { display: flex; flex-direction: column; gap: 22px; min-width: 0; }

  /* Intro card */
  .pp2-intro {
    display: flex; gap: 20px;
    padding: clamp(22px,4vw,32px);
    background: white; border-radius: 22px;
    border: 1px solid #d1fae5;
    box-shadow: 0 4px 20px rgba(5,150,105,0.06);
    position: relative; overflow: hidden;
  }
  .pp2-intro::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg,#064e3b,#059669,#4ade80,#059669,#064e3b);
    background-size: 200% 100%; animation: pp2-shimmer 5s ease infinite;
  }
  @keyframes pp2-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .pp2-intro-icon {
    width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
    background: linear-gradient(135deg,#f0fdf4,#dcfce7);
    border: 1.5px solid #a7f3d0;
    display: flex; align-items: center; justify-content: center; color: #059669;
  }
  .pp2-intro-title { font-family:'Playfair Display',serif; font-size:clamp(18px,3vw,22px); font-weight:700; color:#064e3b; margin:0 0 10px; }
  .pp2-intro-text  { font-size:14.5px; color:#4b5563; line-height:1.78; margin:0 0 16px; }
  .pp2-intro-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .pp2-intro-chip  {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 13px; border-radius:50px;
    background:#f0fdf4; border:1px solid #a7f3d0;
    font-size:11.5px; font-weight:700; color:#047857;
  }

  /* No results */
  .pp2-no-results {
    text-align:center; padding:56px 24px;
    background:white; border-radius:22px; border:1px solid #d1fae5;
  }
  .pp2-no-results h3 { font-family:'Playfair Display',serif; font-size:22px; color:#064e3b; margin:14px 0 8px; }
  .pp2-no-results p  { font-size:14px; color:#9ca3af; margin:0 0 20px; }
  .pp2-clear-btn {
    padding:10px 24px; background:linear-gradient(135deg,#059669,#065f46);
    color:white; border:none; border-radius:12px;
    font-family:'Inter',sans-serif; font-size:13px; font-weight:700; cursor:pointer;
    transition:all 0.22s; box-shadow:0 4px 16px rgba(5,150,105,0.28);
  }
  .pp2-clear-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(5,150,105,0.38); }

  /* Section cards */
  .pp2-section {
    background:white; border-radius:22px; padding:clamp(22px,4vw,32px);
    border:1px solid #d1fae5; box-shadow:0 2px 12px rgba(5,150,105,0.05);
    transition:all 0.3s ease; scroll-margin-top:100px;
  }
  .pp2-section:hover { box-shadow:0 10px 36px rgba(5,150,105,0.10); border-color:#a7f3d0; }
  .pp2-section-header { display:flex; align-items:flex-start; gap:16px; margin-bottom:22px; }
  .pp2-section-icon {
    width:50px; height:50px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; transition:transform 0.3s;
  }
  .pp2-section:hover .pp2-section-icon { transform:rotate(-5deg) scale(1.06); }
  .pp2-section-num { display:block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.09em; color:#9ca3af; margin-bottom:4px; }
  .pp2-section-title { font-family:'Playfair Display',serif; font-size:clamp(18px,3vw,22px); font-weight:700; color:#064e3b; margin:0; line-height:1.25; }

  /* Highlights */
  .pp2-highlights { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:10px; margin-bottom:22px; }
  .pp2-highlight {
    display:flex; align-items:flex-start; gap:11px;
    padding:14px 16px; background:#f0fdf4;
    border-radius:14px; border:1.5px solid #d1fae5; transition:all 0.22s;
  }
  .pp2-highlight:hover { background:#dcfce7; border-color:#a7f3d0; transform:translateY(-2px); }
  .pp2-hl-icon { width:32px; height:32px; border-radius:9px; background:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
  .pp2-hl-label  { font-size:13px; font-weight:700; color:#064e3b; margin-bottom:3px; }
  .pp2-hl-detail { font-size:12px; color:#6b7280; line-height:1.5; }

  /* Body */
  .pp2-body { border-top:1px solid #d1fae5; padding-top:18px; }
  .pp2-para { font-size:14.5px; color:#374151; line-height:1.82; margin:0 0 13px; }
  .pp2-para:last-child { margin-bottom:0; }

  /* Contact card */
  .pp2-contact {
    margin-top:18px; padding:22px 24px;
    background:linear-gradient(135deg,#f0fdf4,white);
    border-radius:16px; border:1px solid #a7f3d0;
    display:flex; flex-direction:column; gap:16px;
  }
  .pp2-contact-row { display:flex; align-items:flex-start; gap:13px; }
  .pp2-contact-label { display:block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#9ca3af; margin-bottom:3px; }
  .pp2-contact-val { font-size:14px; font-weight:600; color:#1f2937; }
  .pp2-contact-link { color:#059669; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s; }
  .pp2-contact-link:hover { color:#064e3b; text-decoration:underline; }

  /* Bottom CTA */
  .pp2-bottom {
    background:linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 100%);
    border-radius:24px; padding:clamp(40px,6vw,64px) clamp(24px,5vw,56px);
    text-align:center; position:relative; overflow:hidden;
  }
  .pp2-bottom-pattern {
    position:absolute; inset:0; pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .pp2-bottom-inner { position:relative; z-index:1; }
  .pp2-bottom-icon {
    width:72px; height:72px; border-radius:50%;
    background:rgba(255,255,255,0.10); backdropFilter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 20px; border:1.5px solid rgba(255,255,255,0.16);
  }
  .pp2-bottom-title { font-family:'Playfair Display',serif; font-size:clamp(22px,4vw,30px); font-weight:800; color:white; margin:0 0 12px; }
  .pp2-bottom-text  { font-size:15px; color:rgba(255,255,255,0.75); line-height:1.7; max-width:440px; margin:0 auto 28px; }
  .pp2-bottom-btns  { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .pp2-cta-white {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 28px; border-radius:14px;
    background:white; color:#065f46;
    font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
    text-decoration:none; transition:all 0.28s ease;
    box-shadow:0 8px 28px rgba(0,0,0,0.18);
  }
  .pp2-cta-white:hover { transform:translateY(-3px); box-shadow:0 16px 44px rgba(0,0,0,0.22); }
  .pp2-cta-ghost {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 28px; border-radius:14px;
    background:rgba(255,255,255,0.09); color:white;
    font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
    text-decoration:none; transition:all 0.28s ease;
    border:2px solid rgba(255,255,255,0.20); backdropFilter:blur(8px);
  }
  .pp2-cta-ghost:hover { background:rgba(255,255,255,0.16); transform:translateY(-3px); }

  /* Responsive */
  @media (max-width:1100px) {
    .pp2-summary-grid { grid-template-columns:repeat(2,1fr); }
    .pp2-summary-item:nth-child(2) { border-right:none; }
    .pp2-menu-btn { display:inline-flex; }
    .pp2-layout { grid-template-columns:1fr; }
    .pp2-sidebar {
      position:fixed; top:0; left:0; bottom:0; width:300px; max-width:85vw;
      z-index:999; border-radius:0; overflow-y:auto;
    }
    .pp2-sidebar-inner { border-radius:0; min-height:100vh; }
    .pp2-backdrop { display:block; }
  }
  @media (max-width:768px) {
    .pp2-intro { flex-direction:column; gap:16px; }
    .pp2-bottom-btns { flex-direction:column; align-items:center; }
  }
  @media (max-width:480px) {
    .pp2-summary-grid { grid-template-columns:1fr; }
    .pp2-summary-item { border-right:none; border-bottom:1px solid rgba(255,255,255,0.07); padding:18px 16px; }
    .pp2-summary-item:last-child { border-bottom:none; }
    .pp2-highlights { grid-template-columns:1fr; }
  }
  @media print {
    .pp2-sidebar,.pp2-summary-bar,.pp2-bottom { display:none!important; }
    .pp2-layout { grid-template-columns:1fr!important; }
    .pp2-main { background:#fff!important; }
  }
  @media (prefers-reduced-motion:reduce) {
    *,*::before,*::after { animation-duration:0.01ms!important; transition-duration:0.01ms!important; }
  }
  ::-webkit-scrollbar { width:7px; }
  ::-webkit-scrollbar-track { background:#f0fdf4; }
  ::-webkit-scrollbar-thumb { background:#059669; border-radius:4px; }
  ::-webkit-scrollbar-thumb:hover { background:#064e3b; }
  ::selection { background:#059669; color:#fff; }
`;

let _pp2Injected = false;
function injectPP2Styles() {
  if (_pp2Injected || typeof document === "undefined") return;
  if (document.getElementById("pp2-styles")) { _pp2Injected = true; return; }
  const s = document.createElement("style");
  s.id = "pp2-styles";
  s.textContent = PP_STYLES;
  document.head.appendChild(s);
  _pp2Injected = true;
}

/* ── ScrollReveal ── */
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.68, 0.35, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => { injectPP2Styles(); }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.body.some(line => line.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const SidebarContent = () => (
    <div className="pp2-sidebar-inner">
      <div className="pp2-sidebar-head">
        <div className="pp2-sidebar-head-icon"><FiShield size={14} /></div>
        Quick Navigation
      </div>

      <div className="pp2-search-wrap">
        <FiSearch size={14} className="pp2-search-icon" />
        <input
          type="text" placeholder="Search policy…"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="pp2-search-input"
        />
      </div>

      <nav className="pp2-nav">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`pp2-nav-btn ${activeSection === s.id ? "active" : ""}`}
          >
            <span className="pp2-nav-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="pp2-nav-text">{s.title}</span>
            <FiChevronRight size={12} className="pp2-nav-arrow" />
          </button>
        ))}
      </nav>

      <div className="pp2-sidebar-actions">
        {[
          { icon: FiPrinter,  label: "Print Policy",   onClick: () => window.print() },
          { icon: FiDownload, label: "Download PDF",    onClick: () => window.print() },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick} className="pp2-action-btn">
            <btn.icon size={14} /> {btn.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pp2-root">

      <PageHeader
        title="Privacy Policy"
        subtitle="How Altuvera collects, uses, and protects your information across our East African travel platform."
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      {/* ── Summary bar ── */}
      <section className="pp2-summary-bar">
        <div className="pp2-summary-inner">
          <div className="pp2-summary-grid">
            {[
              { icon: FiShield,       label: "Your Data Protected", sub: "Enterprise-grade encryption"     },
              { icon: FiLock,         label: "Never Sold",          sub: "We don't sell your data"         },
              { icon: FiClock,        label: "Last Updated",        sub: LAST_UPDATED                      },
              { icon: FiCheckCircle,  label: `Version ${VERSION}`,  sub: `Effective ${EFFECTIVE_DATE}`     },
            ].map((item, i) => (
              <div key={i} className="pp2-summary-item">
                <div className="pp2-summary-icon"><item.icon size={19} /></div>
                <div>
                  <div className="pp2-summary-label">{item.label}</div>
                  <div className="pp2-summary-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="pp2-menu-btn"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
          >
            {sidebarOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            <span>{sidebarOpen ? "Close" : "Contents"}</span>
          </button>
        </div>
      </section>

      {/* ── Main ── */}
      <section className="pp2-main">
        <div className="pp2-wrap">
          <div className={`pp2-layout ${!sidebarOpen ? "pp2-layout-full" : ""}`} style={{ position: "relative" }}>

            {/* Backdrop */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  className="pp2-backdrop"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.aside
                  className="pp2-sidebar"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <SidebarContent />
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Also show desktop sidebar when not on mobile */}
            {!sidebarOpen && (
              <aside className="pp2-sidebar" style={{ display: 'none' }} id="pp2-desktop-sidebar" />
            )}

            {/* Content */}
            <main className="pp2-content">

              {/* Intro */}
              <ScrollReveal>
                <div className="pp2-intro">
                  <div className="pp2-intro-icon">
                    <HiSparkles size={22} color="#059669" />
                  </div>
                  <div>
                    <h2 className="pp2-intro-title">Our Commitment to Your Privacy</h2>
                    <p className="pp2-intro-text">
                      At Altuvera, we believe your personal information deserves the highest level of
                      protection. This policy explains transparently how we collect, use, share, and
                      safeguard your data as you explore East Africa's most extraordinary destinations with us.
                    </p>
                    <div className="pp2-intro-chips">
                      {[
                        { icon: FiClock,        text: `Last updated: ${LAST_UPDATED}` },
                        { icon: FiCheckCircle,  text: `Version ${VERSION}`            },
                        { icon: FiShield,       text: "GDPR Aligned"                  },
                      ].map((c, i) => (
                        <span key={i} className="pp2-intro-chip">
                          <c.icon size={11} /> {c.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* No results */}
              {filteredSections.length === 0 && (
                <ScrollReveal>
                  <div className="pp2-no-results">
                    <FiSearch size={38} color="#9ca3af" />
                    <h3>No matching sections</h3>
                    <p>Try a different search term or clear your query.</p>
                    <button className="pp2-clear-btn" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </button>
                  </div>
                </ScrollReveal>
              )}

              {/* Sections */}
              {filteredSections.map((section, i) => {
                const Ic = section.icon;
                return (
                  <ScrollReveal key={section.id} delay={i * 0.04}>
                    <article
                      className="pp2-section"
                      id={section.id}
                      ref={el => (sectionRefs.current[section.id] = el)}
                    >
                      <div className="pp2-section-header">
                        <div
                          className="pp2-section-icon"
                          style={{ background: `${section.color}14`, color: section.color, border: `1.5px solid ${section.color}20` }}
                        >
                          <Ic size={21} />
                        </div>
                        <div>
                          <span className="pp2-section-num">Section {i + 1}</span>
                          <h2 className="pp2-section-title">{section.title}</h2>
                        </div>
                      </div>

                      {section.highlights && (
                        <div className="pp2-highlights">
                          {section.highlights.map((h, j) => {
                            const HI = h.icon;
                            return (
                              <div key={j} className="pp2-highlight">
                                <div className="pp2-hl-icon" style={{ color: section.color }}>
                                  <HI size={15} />
                                </div>
                                <div>
                                  <div className="pp2-hl-label">{h.label}</div>
                                  <div className="pp2-hl-detail">{h.detail}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pp2-body">
                        {section.body.map((para, j) => (
                          <p key={j} className="pp2-para">{para}</p>
                        ))}
                      </div>

                      {section.contact && (
                        <div className="pp2-contact">
                          {[
                            { icon: FiMail,  label: "Email",         val: section.contact.email,    link: `mailto:${section.contact.email}` },
                            { icon: FiGlobe, label: "Address",       val: section.contact.address,  link: null },
                            { icon: FiClock, label: "Response Time", val: section.contact.response, link: null },
                          ].map((row, j) => (
                            <div key={j} className="pp2-contact-row">
                              <row.icon size={17} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                              <div>
                                <span className="pp2-contact-label">{row.label}</span>
                                {row.link
                                  ? <a href={row.link} className="pp2-contact-link">{row.val}</a>
                                  : <span className="pp2-contact-val">{row.val}</span>
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  </ScrollReveal>
                );
              })}

              {/* Bottom CTA */}
              <ScrollReveal>
                <div className="pp2-bottom">
                  <div className="pp2-bottom-pattern" />
                  <div className="pp2-bottom-inner">
                    <div className="pp2-bottom-icon"><FiShield size={28} color="white" /></div>
                    <h3 className="pp2-bottom-title">Questions About Your Privacy?</h3>
                    <p className="pp2-bottom-text">
                      Our Data Protection team is here to help. Reach out anytime and we'll respond within 48 hours.
                    </p>
                    <div className="pp2-bottom-btns">
                      <a href="mailto:altuverasafari@gmail.com" className="pp2-cta-white">
                        <FiMail size={15} /> Contact Our Team
                      </a>
                      <a href="/terms" className="pp2-cta-ghost">
                        View Terms of Service <FiChevronRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </main>
          </div>
        </div>
      </section>

      {/* Desktop sidebar — always visible on wide screens */}
      <style>{`
        @media (min-width: 1101px) {
          .pp2-layout {
            grid-template-columns: 256px 1fr !important;
          }
          .pp2-layout .pp2-content {
            /* always full content col */
          }
          #pp2-desktop-sidebar-fixed {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}