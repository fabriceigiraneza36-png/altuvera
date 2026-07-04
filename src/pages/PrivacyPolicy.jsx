// src/pages/PrivacyPolicy.jsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FiShield, FiDatabase, FiSettings, FiShare2, FiGlobe, FiLock,
  FiUserCheck, FiClock, FiMail, FiChevronRight, FiCheckCircle,
  FiPrinter, FiDownload, FiSearch, FiEye, FiTrash2, FiEdit3,
  FiXCircle, FiMenu, FiX, FiArrowUp, FiArrowDown,
  FiFileText, FiMapPin, FiPhone, FiChevronDown,
  FiFlag, FiBookOpen, FiInfo, FiAlertTriangle,
  FiHash, FiExternalLink,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const LAST_UPDATED = "March 3, 2026";
const EFFECTIVE_DATE = "March 10, 2026";
const VERSION = "2.1";

const SECTIONS = [
  {
    id: "information-collected",
    icon: FiDatabase,
    title: "Information We Collect",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    highlights: [
      { icon: FiUserCheck, label: "Information you provide", detail: "Name, email, phone, travel preferences, account details" },
      { icon: FiEye, label: "Automatically collected", detail: "Browser type, device info, IP address, pages visited" },
    ],
    body: [
      "We collect personal information you provide directly when creating an account, making a booking, or contacting our team — including your name, email address, phone number, travel preferences, passport details (when required for bookings), and payment information.",
      "We also automatically collect technical data such as browser type, device information, IP address, approximate location, referring URLs, and pages visited. This helps us improve platform performance, security, and your overall experience.",
      "When you interact with our safari guides or travel consultants, conversation summaries may be retained to provide better, more personalized service in the future.",
    ],
  },
  {
    id: "how-we-use",
    icon: FiSettings,
    title: "How We Use Your Information",
    gradient: "linear-gradient(135deg, #059669, #047857)",
    highlights: [
      { icon: FiCheckCircle, label: "Service delivery", detail: "Process bookings, provide support, send trip updates" },
      { icon: FiCheckCircle, label: "Platform improvement", detail: "Analytics, personalization, security monitoring" },
    ],
    body: [
      "We use your information to deliver and continuously improve our services — including processing travel inquiries and bookings, sending essential trip confirmations and updates, providing responsive customer support, and personalizing destination recommendations.",
      "With your consent, we may send marketing communications about new destinations, special safari packages, and seasonal offers across East Africa. You can opt out at any time through your account settings or the unsubscribe link in any email.",
      "We also use aggregated, anonymized data for analytics purposes to understand travel trends across Rwanda, Tanzania, Uganda, and Ethiopia.",
    ],
  },
  {
    id: "sharing",
    icon: FiShare2,
    title: "Sharing of Information",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    highlights: [
      { icon: FiXCircle, label: "We never sell your data", detail: "Your personal information is not for sale — period" },
      { icon: FiCheckCircle, label: "Limited, necessary sharing", detail: "Only with verified travel partners to fulfill bookings" },
    ],
    body: [
      "We do not sell, rent, or trade your personal information to third parties for their marketing purposes.",
      "We share information only with trusted, vetted service providers and travel partners — strictly to fulfill your safari bookings, arrange accommodations, process secure payments, provide ground transportation, and comply with legal obligations in relevant East African jurisdictions.",
      "All third-party partners are contractually bound to handle your data with the same level of care and confidentiality that we maintain.",
    ],
  },
  {
    id: "cookies",
    icon: FiGlobe,
    title: "Cookies & Tracking",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    highlights: [
      { icon: FiCheckCircle, label: "Essential cookies", detail: "Authentication, security, session management" },
      { icon: FiCheckCircle, label: "Optional cookies", detail: "Analytics, preferences, personalization" },
    ],
    body: [
      "We use cookies and similar tracking technologies to authenticate your sessions, remember your language and currency preferences, analyze platform usage patterns, and deliver a more personalized browsing experience.",
      "You can manage cookie preferences through your browser settings or via our in-app cookie consent banner. Disabling certain cookies may affect platform functionality. We respect Do Not Track signals where technically feasible.",
    ],
  },
  {
    id: "retention",
    icon: FiClock,
    title: "Data Retention",
    gradient: "linear-gradient(135deg, #ec4899, #be185d)",
    body: [
      "We retain personal information only as long as necessary for active service delivery, legal and regulatory compliance, dispute resolution, fraud prevention, and legitimate business purposes.",
      "Booking records are typically retained for 7 years in accordance with East African financial regulations. You may request earlier deletion of non-essential data at any time.",
      "When data is no longer needed, it is securely deleted or irreversibly anonymized.",
    ],
  },
  {
    id: "security",
    icon: FiLock,
    title: "Data Security",
    gradient: "linear-gradient(135deg, #ef4444, #b91c1c)",
    body: [
      "We implement industry-standard technical and organizational safeguards to protect your information — including TLS/SSL encryption for data in transit, encrypted storage for sensitive data at rest, regular security audits, and role-based access controls for our team.",
      "While no internet transmission or digital storage system can be guaranteed 100% secure, we continuously monitor, update, and strengthen our security practices to minimize risk.",
      "In the unlikely event of a data breach, we will notify affected users and relevant authorities in accordance with applicable data protection laws.",
    ],
  },
  {
    id: "your-rights",
    icon: FiUserCheck,
    title: "Your Rights",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    highlights: [
      { icon: FiEye, label: "Access", detail: "View what data we hold about you" },
      { icon: FiEdit3, label: "Correct", detail: "Update inaccurate information" },
      { icon: FiTrash2, label: "Delete", detail: "Request complete data removal" },
      { icon: FiDownload, label: "Export", detail: "Download a copy of your data" },
    ],
    body: [
      "Depending on your location and applicable law, you have the right to access, correct, update, or delete your personal information, restrict or object to certain processing activities, withdraw consent at any time, and request a portable copy of your data.",
      "East African residents and EU/UK visitors are afforded rights under their respective data protection frameworks. We handle all requests promptly and in good faith.",
      "To exercise any of these rights, contact our Data Protection team using the details in Section 9 below.",
    ],
  },
  {
    id: "international-transfers",
    icon: FiGlobe,
    title: "International Transfers",
    gradient: "linear-gradient(135deg, #14b8a6, #0d9488)",
    body: [
      "Your information may be processed in countries other than your country of residence — including Rwanda, Tanzania, Uganda, and Ethiopia — as well as cloud infrastructure regions required for reliable service delivery.",
      "Where required by law, we apply appropriate safeguards for international data transfers, such as Standard Contractual Clauses or equivalent mechanisms recognized under applicable data protection regulations.",
    ],
  },
  {
    id: "contact",
    icon: FiMail,
    title: "Contact Us",
    gradient: "linear-gradient(135deg, #059669, #047857)",
    body: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, we'd love to hear from you.",
    ],
    contact: {
      email: "altuverasafari@gmail.com",
      address: "Musanze, Rwanda",
      response: "We aim to respond within 48 hours on business days.",
    },
  },
];

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root {
  --pp-green: #059669;
  --pp-green-lt: #10b981;
  --pp-green-dk: #047857;
  --pp-forest: #022c22;
  --pp-mint: #ecfdf5;
  --pp-text: #0f172a;
  --pp-text2: #475569;
  --pp-text3: #94a3b8;
  --pp-border: #e2e8f0;
  --pp-surface: #ffffff;
  --pp-bg: #f8fafb;
  --pp-radius: 20px;
  --pp-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

*, *::before, *::after { box-sizing: border-box; }

.pp-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--pp-bg);
  min-height: 100vh;
}

/* ══════════ SCROLL LINK ══════════ */
.pp-scroll-link-wrap {
  display: flex;
  justify-content: center;
  padding: 0;
  background: linear-gradient(180deg, #f0fdf4 0%, var(--pp-bg) 100%);
  position: relative;
  z-index: 5;
}
.pp-scroll-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border: none;
  background: none;
  color: var(--pp-green-dk);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s var(--pp-ease);
  letter-spacing: 0.01em;
  position: relative;
}
.pp-scroll-link::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 32px;
  right: 32px;
  height: 2px;
  background: var(--pp-green-lt);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s var(--pp-ease);
}
.pp-scroll-link:hover::after {
  transform: scaleX(1);
}
.pp-scroll-link:hover {
  color: var(--pp-green);
}
.pp-scroll-link__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--pp-mint);
  border: 1.5px solid #a7f3d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pp-green);
  transition: all 0.3s var(--pp-ease);
}
.pp-scroll-link:hover .pp-scroll-link__icon {
  background: var(--pp-green);
  color: white;
  border-color: var(--pp-green);
  transform: translateY(3px);
}

/* ══════════ MAIN LAYOUT ══════════ */
.pp-main {
  background: var(--pp-bg);
  padding: clamp(28px, 4vw, 48px) 0 clamp(64px, 8vw, 112px);
}
.pp-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 40px);
}
.pp-layout {
  display: grid;
  grid-template-columns: 264px 1fr;
  gap: 32px;
  align-items: flex-start;
}

/* ══════════ SIDEBAR ══════════ */
.pp-sidebar {
  position: sticky;
  top: 28px;
}
.pp-sidebar-card {
  background: var(--pp-surface);
  border-radius: 20px;
  padding: 20px 16px;
  border: 1px solid #d1fae5;
  box-shadow: 0 2px 16px rgba(5,150,105,0.06);
}
.pp-sidebar-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11.5px;
  font-weight: 800;
  color: #064e3b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d1fae5;
}
.pp-sidebar-title-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg, #059669, #047857);
  display: flex; align-items: center; justify-content: center;
  color: white;
}

/* Search */
.pp-search {
  position: relative;
  margin-bottom: 12px;
}
.pp-search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--pp-text3);
  pointer-events: none;
}
.pp-search-input {
  width: 100%;
  padding: 9px 36px 9px 34px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  border: 1.5px solid #d1fae5;
  border-radius: 11px;
  background: #fafffe;
  color: var(--pp-text);
  outline: none;
  transition: all 0.2s;
}
.pp-search-input::placeholder { color: #b0b8c4; }
.pp-search-input:focus {
  border-color: var(--pp-green);
  background: white;
  box-shadow: 0 0 0 3px rgba(5,150,105,0.08);
}
.pp-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px; height: 20px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: var(--pp-text2);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s;
}
.pp-search-clear:hover { background: #fee2e2; color: #dc2626; }

/* Nav items */
.pp-nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 14px;
}
.pp-nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border-radius: 11px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7280;
  text-align: left;
  width: 100%;
  transition: all 0.2s;
  line-height: 1.35;
}
.pp-nav-item:hover {
  background: #f0fdf4;
  color: #065f46;
}
.pp-nav-item--active {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(5,150,105,0.22);
}
.pp-nav-num {
  font-size: 10px;
  font-weight: 800;
  opacity: 0.45;
  min-width: 16px;
  flex-shrink: 0;
}
.pp-nav-item--active .pp-nav-num { opacity: 0.75; }
.pp-nav-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-nav-arrow {
  opacity: 0;
  transform: translateX(-3px);
  transition: all 0.2s;
  flex-shrink: 0;
}
.pp-nav-item:hover .pp-nav-arrow,
.pp-nav-item--active .pp-nav-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Sidebar actions */
.pp-sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #d1fae5;
}
.pp-sidebar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  border-radius: 11px;
  border: 1.5px solid #d1fae5;
  background: #fafffe;
  color: #065f46;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}
.pp-sidebar-btn:hover {
  background: #dcfce7;
  border-color: #a7f3d0;
  transform: translateX(2px);
}

/* Mobile nav toggle */
.pp-mobile-toggle {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 100;
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 28px rgba(5,150,105,0.35);
  transition: all 0.3s var(--pp-ease);
}
.pp-mobile-toggle:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 36px rgba(5,150,105,0.45);
}

/* ══════════ CONTENT ══════════ */
.pp-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* Intro card */
.pp-intro {
  position: relative;
  background: var(--pp-surface);
  border-radius: 22px;
  padding: clamp(24px, 4vw, 36px);
  border: 1px solid #d1fae5;
  box-shadow: 0 2px 16px rgba(5,150,105,0.05);
  overflow: hidden;
}
.pp-intro::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #064e3b, #10b981, #4ade80, #10b981, #064e3b);
  background-size: 300% 100%;
  animation: ppShimmer 6s ease infinite;
}
@keyframes ppShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.pp-intro__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: flex-start;
}
.pp-intro__icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1.5px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--pp-green);
  flex-shrink: 0;
}
.pp-intro__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 400;
  color: #064e3b;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.pp-intro__text {
  font-size: 14.5px;
  color: var(--pp-text2);
  line-height: 1.78;
  margin: 0 0 18px;
}
.pp-intro__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pp-intro__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 50px;
  background: #f0fdf4;
  border: 1px solid #a7f3d0;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--pp-green-dk);
}

/* No results */
.pp-no-results {
  text-align: center;
  padding: clamp(40px, 6vw, 64px) 24px;
  background: var(--pp-surface);
  border-radius: 22px;
  border: 1px solid #d1fae5;
}
.pp-no-results__icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #f0fdf4;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  color: var(--pp-text3);
}
.pp-no-results h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 22px;
  color: var(--pp-text);
  margin: 0 0 6px;
}
.pp-no-results p {
  font-size: 14px;
  color: var(--pp-text3);
  margin: 0 0 22px;
}
.pp-no-results__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(5,150,105,0.25);
  transition: all 0.25s;
}
.pp-no-results__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(5,150,105,0.35);
}

/* ══════════ SECTION CARDS ══════════ */
.pp-section {
  background: var(--pp-surface);
  border-radius: 22px;
  padding: clamp(24px, 4vw, 34px);
  border: 1px solid #d1fae5;
  box-shadow: 0 1px 10px rgba(5,150,105,0.04);
  transition: all 0.3s var(--pp-ease);
  scroll-margin-top: 32px;
}
.pp-section:hover {
  box-shadow: 0 8px 32px rgba(5,150,105,0.09);
  border-color: #a7f3d0;
}
.pp-section__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}
.pp-section__icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: transform 0.3s var(--pp-ease);
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.pp-section:hover .pp-section__icon {
  transform: rotate(-4deg) scale(1.05);
}
.pp-section__num {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--pp-text3);
  margin-bottom: 4px;
}
.pp-section__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(19px, 2.8vw, 24px);
  font-weight: 400;
  color: #064e3b;
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

/* Highlights */
.pp-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 22px;
}
.pp-highlight {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #f0fdf4;
  border-radius: 14px;
  border: 1.5px solid #d1fae5;
  transition: all 0.22s var(--pp-ease);
}
.pp-highlight:hover {
  background: #dcfce7;
  border-color: #a7f3d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(5,150,105,0.07);
}
.pp-highlight__icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  color: var(--pp-green-dk);
}
.pp-highlight__label {
  font-size: 13px;
  font-weight: 700;
  color: #064e3b;
  margin-bottom: 2px;
}
.pp-highlight__detail {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

/* Body */
.pp-body {
  border-top: 1px solid #d1fae5;
  padding-top: 18px;
}
.pp-para {
  font-size: 14.5px;
  color: #374151;
  line-height: 1.82;
  margin: 0 0 14px;
}
.pp-para:last-child { margin-bottom: 0; }

/* Contact card */
.pp-contact-card {
  margin-top: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f0fdf4, white);
  border-radius: 18px;
  border: 1.5px solid #a7f3d0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.pp-contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.pp-contact-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--pp-mint);
  border: 1px solid #a7f3d0;
  display: flex; align-items: center; justify-content: center;
  color: var(--pp-green);
  flex-shrink: 0;
}
.pp-contact-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--pp-text3);
  margin-bottom: 3px;
}
.pp-contact-val {
  font-size: 14px;
  font-weight: 600;
  color: var(--pp-text);
  line-height: 1.45;
}
.pp-contact-link {
  color: var(--pp-green);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
}
.pp-contact-link:hover {
  color: #064e3b;
  text-decoration: underline;
}

/* ══════════ BOTTOM CTA ══════════ */
.pp-cta {
  background: linear-gradient(155deg, #0f172a 0%, #022c22 50%, #064e3b 100%);
  border-radius: 24px;
  padding: clamp(40px, 6vw, 72px) clamp(24px, 5vw, 56px);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.pp-cta::before {
  content: '';
  position: absolute;
  top: -40%; left: -20%;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.pp-cta::after {
  content: '';
  position: absolute;
  bottom: -30%; right: -15%;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.pp-cta__inner { position: relative; z-index: 1; }
.pp-cta__icon {
  width: 68px; height: 68px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  color: #86efac;
}
.pp-cta__title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 400;
  color: white;
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}
.pp-cta__text {
  font-size: 15px;
  color: rgba(255,255,255,0.55);
  line-height: 1.72;
  max-width: 460px;
  margin: 0 auto 32px;
}
.pp-cta__btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.pp-cta__btn-a {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 15px 32px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(16,185,129,0.35);
  transition: all 0.3s var(--pp-ease);
}
.pp-cta__btn-a:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 40px rgba(16,185,129,0.5);
}
.pp-cta__btn-b {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 15px 32px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.28s ease;
}
.pp-cta__btn-b:hover {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.35);
  transform: translateY(-2px);
}

/* ══════════ SCROLL TOP ══════════ */
.pp-scroll-top {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(5,150,105,0.35);
  z-index: 50;
  transition: all 0.3s var(--pp-ease);
}
.pp-scroll-top:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 10px 32px rgba(5,150,105,0.45);
}

/* ══════════ BACKDROP & MOBILE SIDEBAR ══════════ */
.pp-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4,47,31,0.45);
  backdrop-filter: blur(6px);
  z-index: 998;
}
.pp-mobile-sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 300px;
  max-width: 85vw;
  z-index: 999;
  background: white;
  overflow-y: auto;
  box-shadow: 8px 0 40px rgba(0,0,0,0.15);
}
.pp-mobile-sidebar .pp-sidebar-card {
  border-radius: 0;
  border: none;
  min-height: 100vh;
  box-shadow: none;
}
.pp-mobile-close {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 0;
}
.pp-mobile-close__label {
  font-size: 13px;
  font-weight: 800;
  color: #064e3b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pp-mobile-close__btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1.5px solid #d1fae5;
  background: #f0fdf4;
  color: #065f46;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
}
.pp-mobile-close__btn:hover {
  background: #dcfce7;
  border-color: #a7f3d0;
}

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 1100px) {
  .pp-layout { grid-template-columns: 1fr !important; }
  .pp-sidebar--desktop { display: none !important; }
  .pp-mobile-toggle { display: inline-flex; }
}
@media (min-width: 1101px) {
  .pp-mobile-sidebar,
  .pp-backdrop,
  .pp-mobile-toggle { display: none !important; }
}
@media (max-width: 768px) {
  .pp-intro__row { grid-template-columns: 1fr !important; }
  .pp-cta__btns { flex-direction: column; align-items: center; }
  .pp-contact-card { grid-template-columns: 1fr !important; }
  .pp-scroll-link { font-size: 13px; padding: 12px 24px; }
}
@media (max-width: 480px) {
  .pp-highlights { grid-template-columns: 1fr; }
  .pp-scroll-top { bottom: 18px; right: 18px; width: 42px; height: 42px; }
  .pp-mobile-toggle { bottom: 18px; left: 18px; padding: 10px 18px; font-size: 12px; }
  .pp-intro__chips { gap: 6px; }
  .pp-intro__chip { font-size: 10.5px; padding: 4px 11px; }
}
@media print {
  .pp-sidebar--desktop, .pp-cta, .pp-scroll-top,
  .pp-mobile-toggle, .pp-scroll-link-wrap { display: none !important; }
  .pp-layout { grid-template-columns: 1fr !important; }
  .pp-main { background: white !important; padding-top: 20px !important; }
  .pp-section { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

::selection { background: #059669; color: white; }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const ID = "pp-styles-v4";
  const existing = document.getElementById(ID);
  if (existing) existing.remove();
  const el = document.createElement("style");
  el.id = ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════ */
const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.68, 0.35, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   SIDEBAR CONTENT (shared between desktop + mobile)
═══════════════════════════════════════════════════════ */
const SidebarContent = ({ activeSection, searchQuery, setSearchQuery, onNavigate }) => (
  <div className="pp-sidebar-card">
    <div className="pp-sidebar-title">
      <div className="pp-sidebar-title-icon"><FiFileText size={12} /></div>
      Contents
    </div>

    <div className="pp-search">
      <FiSearch size={13} className="pp-search-icon" />
      <input
        type="text"
        placeholder="Search policy…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pp-search-input"
      />
      {searchQuery && (
        <button className="pp-search-clear" onClick={() => setSearchQuery("")}>
          <FiX size={9} />
        </button>
      )}
    </div>

    <nav className="pp-nav-list">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onNavigate(s.id)}
          className={`pp-nav-item${activeSection === s.id ? " pp-nav-item--active" : ""}`}
        >
          <span className="pp-nav-num">{String(i + 1).padStart(2, "0")}</span>
          <span className="pp-nav-text">{s.title}</span>
          <FiChevronRight size={11} className="pp-nav-arrow" />
        </button>
      ))}
    </nav>

    <div className="pp-sidebar-actions">
      <button onClick={() => window.print()} className="pp-sidebar-btn">
        <FiPrinter size={13} /> Print Policy
      </button>
      <button onClick={() => window.print()} className="pp-sidebar-btn">
        <FiDownload size={13} /> Download PDF
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   SECTION CARD
═══════════════════════════════════════════════════════ */
const SectionCard = React.forwardRef(({ section, index }, ref) => {
  const Icon = section.icon;
  return (
    <article className="pp-section" id={section.id} ref={ref}>
      <div className="pp-section__header">
        <div className="pp-section__icon" style={{ background: section.gradient }}>
          <Icon size={20} />
        </div>
        <div>
          <span className="pp-section__num">Section {index + 1}</span>
          <h2 className="pp-section__title">{section.title}</h2>
        </div>
      </div>

      {section.highlights && (
        <div className="pp-highlights">
          {section.highlights.map((h, j) => {
            const HIcon = h.icon;
            return (
              <div key={j} className="pp-highlight">
                <div className="pp-highlight__icon"><HIcon size={14} /></div>
                <div>
                  <div className="pp-highlight__label">{h.label}</div>
                  <div className="pp-highlight__detail">{h.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pp-body">
        {section.body.map((para, j) => (
          <p key={j} className="pp-para">{para}</p>
        ))}
      </div>

      {section.contact && (
        <div className="pp-contact-card">
          <div className="pp-contact-item">
            <div className="pp-contact-icon"><FiMail size={15} /></div>
            <div>
              <span className="pp-contact-label">Email</span>
              <a href={`mailto:${section.contact.email}`} className="pp-contact-link">
                {section.contact.email}
              </a>
            </div>
          </div>
          <div className="pp-contact-item">
            <div className="pp-contact-icon"><FiMapPin size={15} /></div>
            <div>
              <span className="pp-contact-label">Address</span>
              <span className="pp-contact-val">{section.contact.address}</span>
            </div>
          </div>
          <div className="pp-contact-item">
            <div className="pp-contact-icon"><FiClock size={15} /></div>
            <div>
              <span className="pp-contact-label">Response Time</span>
              <span className="pp-contact-val">{section.contact.response}</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});
SectionCard.displayName = "SectionCard";

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef({});
  const contentRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  // Scroll spy + scroll-top visibility
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      let found = null;
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) found = section.id;
        }
      }
      if (found) setActiveSection(found);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const scrollToSection = useCallback((id) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSidebarOpen(false);
  }, []);

  const scrollToContent = useCallback(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.body.some((line) => line.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="pp-root">
      {/* Hero */}
      <PageHeader
        title="Privacy Policy"
        subtitle="How Altuvera collects, uses, and protects your information across our East African travel platform."
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      {/* Scroll Down Link */}
      <div className="pp-scroll-link-wrap">
        <button className="pp-scroll-link" onClick={scrollToContent}>
          <span className="pp-scroll-link__icon">
            <FiArrowDown size={15} />
          </span>
          Read Our Privacy Policy
        </button>
      </div>

      {/* Main */}
      <section className="pp-main" ref={contentRef}>
        <div className="pp-container">
          <div className="pp-layout">
            {/* Desktop Sidebar */}
            <aside className="pp-sidebar pp-sidebar--desktop">
              <SidebarContent
                activeSection={activeSection}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNavigate={scrollToSection}
              />
            </aside>

            {/* Mobile Sidebar + Backdrop */}
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    className="pp-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.aside
                    className="pp-mobile-sidebar"
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="pp-mobile-close">
                      <span className="pp-mobile-close__label">Navigation</span>
                      <button
                        className="pp-mobile-close__btn"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    <SidebarContent
                      activeSection={activeSection}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      onNavigate={scrollToSection}
                    />
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Content */}
            <main className="pp-content">
              {/* Intro */}
              <ScrollReveal>
                <div className="pp-intro">
                  <div className="pp-intro__row">
                    <div className="pp-intro__icon">
                      <FiShield size={22} />
                    </div>
                    <div>
                      <h2 className="pp-intro__title">Our Commitment to Your Privacy</h2>
                      <p className="pp-intro__text">
                        At Altuvera, we believe your personal information deserves the highest
                        level of protection. This policy explains transparently how we collect,
                        use, share, and safeguard your data as you explore East Africa's most
                        extraordinary destinations with us.
                      </p>
                      <div className="pp-intro__chips">
                        <span className="pp-intro__chip">
                          <FiClock size={11} /> Updated {LAST_UPDATED}
                        </span>
                        <span className="pp-intro__chip">
                          <FiCheckCircle size={11} /> Version {VERSION}
                        </span>
                        <span className="pp-intro__chip">
                          <FiShield size={11} /> GDPR Aligned
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* No results */}
              {filteredSections.length === 0 && (
                <ScrollReveal>
                  <div className="pp-no-results">
                    <div className="pp-no-results__icon">
                      <FiSearch size={28} />
                    </div>
                    <h3>No matching sections</h3>
                    <p>Try a different search term or clear your query.</p>
                    <button
                      className="pp-no-results__btn"
                      onClick={() => setSearchQuery("")}
                    >
                      <FiX size={13} /> Clear Search
                    </button>
                  </div>
                </ScrollReveal>
              )}

              {/* Sections */}
              {filteredSections.map((section, i) => (
                <ScrollReveal key={section.id} delay={i * 0.03}>
                  <SectionCard
                    section={section}
                    index={SECTIONS.indexOf(section)}
                    ref={(el) => (sectionRefs.current[section.id] = el)}
                  />
                </ScrollReveal>
              ))}

              {/* Bottom CTA */}
              <ScrollReveal>
                <div className="pp-cta">
                  <div className="pp-cta__inner">
                    <div className="pp-cta__icon">
                      <FiShield size={26} />
                    </div>
                    <h3 className="pp-cta__title">Questions About Your Privacy?</h3>
                    <p className="pp-cta__text">
                      Our Data Protection team is here to help. Reach out anytime and
                      we'll respond within 48 hours.
                    </p>
                    <div className="pp-cta__btns">
                      <a href="mailto:altuverasafari@gmail.com" className="pp-cta__btn-a">
                        <FiMail size={15} /> Contact Our Team
                      </a>
                      <a href="/terms" className="pp-cta__btn-b">
                        Terms of Service <FiChevronRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </main>
          </div>
        </div>
      </section>

      {/* Mobile Contents Toggle */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            className="pp-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            aria-label="Open table of contents"
          >
            <FiMenu size={15} /> Contents
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="pp-scroll-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25 }}
            aria-label="Scroll to top"
          >
            <FiArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}