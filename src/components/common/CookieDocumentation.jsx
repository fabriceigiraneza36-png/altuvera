// src/components/common/CookieDocumentation.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiShieldCheck,
  HiLockClosed,
  HiChartBar,
  HiSpeakerphone,
  HiGlobeAlt,
  HiClock,
  HiEye,
  HiTrash,
} from "react-icons/hi";
import { FiExternalLink } from "react-icons/fi";

const COOKIE_DOC_EVENT = "altuvera:open-cookie-docs";

export const openCookieDocs = () => {
  window.dispatchEvent(new Event(COOKIE_DOC_EVENT));
};

const Section = ({ icon: Icon, title, children, color = "#16a34a" }) => (
  <div className="cd-section">
    <div className="cd-section-header">
      <div className="cd-section-icon" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <h3>{title}</h3>
    </div>
    <div className="cd-section-body">{children}</div>
  </div>
);

const Badge = ({ children, variant = "green" }) => (
  <span className={`cd-badge cd-badge--${variant}`}>{children}</span>
);

const CookieDocumentation = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(COOKIE_DOC_EVENT, handler);
    return () => window.removeEventListener(COOKIE_DOC_EVENT, handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            className="cd-modal"
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
          >
            {/* ===== HEADER ===== */}
            <div className="cd-header">
              <div className="cd-header-left">
                <div className="cd-header-icon">
                  <HiShieldCheck />
                </div>
                <div>
                  <h2>Cookie Documentation</h2>
                  <p>How Altuvera uses cookies and similar technologies</p>
                </div>
              </div>
              <button className="cd-close" onClick={() => setOpen(false)}>
                <HiX size={20} />
              </button>
            </div>

            {/* ===== BODY ===== */}
            <div className="cd-body">
              {/* What are cookies */}
              <Section icon={HiGlobeAlt} title="What Are Cookies?" color="#3B82F6">
                <p className="cd-text">
                  Cookies are small text files stored on your device when you visit a website.
                  They help us recognize you, remember your preferences, and understand how
                  you interact with our platform — enabling a smoother, more personalized safari
                  planning experience.
                </p>
                <p className="cd-text">
                  We also use similar technologies like <strong>local storage</strong>,{" "}
                  <strong>session storage</strong>, and <strong>pixel tags</strong> for
                  analytics and performance monitoring.
                </p>
              </Section>

              {/* Cookie types */}
              <Section icon={HiLockClosed} title="Types of Cookies We Use" color="#16a34a">
                <div className="cd-cookie-grid">
                  <div className="cd-cookie-card">
                    <div className="cd-cookie-card-header">
                      <HiLockClosed size={16} />
                      <strong>Essential</strong>
                      <Badge>Always on</Badge>
                    </div>
                    <p className="cd-cookie-desc">
                      Required for core functionality: authentication, security, session
                      management, and load balancing. Cannot be disabled.
                    </p>
                    <div className="cd-cookie-examples">
                      <span>Session ID</span>
                      <span>CSRF token</span>
                      <span>Auth token</span>
                    </div>
                  </div>

                  <div className="cd-cookie-card">
                    <div className="cd-cookie-card-header">
                      <HiChartBar size={16} />
                      <strong>Analytics</strong>
                      <Badge variant="slate">Optional</Badge>
                    </div>
                    <p className="cd-cookie-desc">
                      Help us understand visitor behavior, page performance, and platform
                      usage — so we can improve your experience across East Africa.
                    </p>
                    <div className="cd-cookie-examples">
                      <span>Page views</span>
                      <span>Session duration</span>
                      <span>Device type</span>
                    </div>
                  </div>

                  <div className="cd-cookie-card">
                    <div className="cd-cookie-card-header">
                      <HiSpeakerphone size={16} />
                      <strong>Marketing</strong>
                      <Badge variant="slate">Optional</Badge>
                    </div>
                    <p className="cd-cookie-desc">
                      Used to deliver relevant safari offers, destination recommendations, and
                      personalized content based on your interests.
                    </p>
                    <div className="cd-cookie-examples">
                      <span>Ad preferences</span>
                      <span>Interest tags</span>
                      <span>Campaign tracking</span>
                    </div>
                  </div>
                </div>
              </Section>

              {/* Duration */}
              <Section icon={HiClock} title="Cookie Duration" color="#F59E0B">
                <div className="cd-duration-list">
                  <div className="cd-duration-item">
                    <div>
                      <strong>Session Cookies</strong>
                      <p>Deleted when you close your browser. Used for temporary session data.</p>
                    </div>
                    <Badge variant="amber">Temporary</Badge>
                  </div>
                  <div className="cd-duration-item">
                    <div>
                      <strong>Persistent Cookies</strong>
                      <p>Stored for a set period (typically 30 days – 12 months). Remember preferences across visits.</p>
                    </div>
                    <Badge variant="amber">30d – 12mo</Badge>
                  </div>
                </div>
              </Section>

              {/* Third-party */}
              <Section icon={HiGlobeAlt} title="Third-Party Services" color="#8B5CF6">
                <p className="cd-text">
                  We partner with trusted providers who may set their own cookies:
                </p>
                <ul className="cd-list">
                  <li>
                    <strong>Google Analytics</strong> — anonymized traffic and behavior analytics.
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="cd-link">
                      Google Privacy Policy <FiExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <strong>Payment Processors</strong> — secure transaction handling.
                    Cookies governed by processor privacy policies.
                  </li>
                  <li>
                    <strong>Cloud Infrastructure</strong> — AWS / Render for hosting.
                    Limited technical cookies for CDN and load balancing.
                  </li>
                </ul>
              </Section>

              {/* Managing cookies */}
              <Section icon={HiEye} title="Managing Your Cookies" color="#06B6D4">
                <p className="cd-text">
                  You have full control over non-essential cookies:
                </p>
                <ul className="cd-checklist">
                  <li>Use the <strong>Cookie Settings</strong> button in the footer to manage preferences anytime.</li>
                  <li>Clear cookies via your browser settings (Chrome, Firefox, Safari, Edge).</li>
                  <li>Opt out of analytics tracking through your browser or device settings.</li>
                </ul>
                <p className="cd-text cd-text--small">
                  Disabling essential cookies may affect login sessions, booking flows, and
                  security features.
                </p>
              </Section>

              {/* Data & security */}
              <Section icon={HiShieldCheck} title="Data & Security" color="#EC4899">
                <p className="cd-text">
                  Cookie data is stored securely and never shared with unauthorized parties.
                  We do not use cookies to track you across unrelated websites for advertising
                  purposes without consent.
                </p>
                <div className="cd-security-grid">
                  <div className="cd-security-item">
                    <HiLockClosed size={16} />
                    <span>Encrypted storage</span>
                  </div>
                  <div className="cd-security-item">
                    <HiShieldCheck size={16} />
                    <span>No unauthorized sharing</span>
                  </div>
                  <div className="cd-security-item">
                    <HiTrash size={16} />
                    <span>Right to delete</span>
                  </div>
                </div>
              </Section>

              {/* Updates */}
              <Section icon={HiClock} title="Policy Updates" color="#64748b">
                <p className="cd-text">
                  We may update this documentation when we introduce new features or
                  third-party integrations that use cookies. Check the &ldquo;Last
                  Updated&rdquo; date below.
                </p>
                <p className="cd-text cd-text--small">
                  Last updated: <strong>June 2026</strong> &nbsp;·&nbsp; Version 1.0
                </p>
              </Section>
            </div>

            {/* ===== FOOTER ===== */}
            <div className="cd-modal-footer">
              <button className="cd-footer-btn cd-footer-btn--ghost" onClick={() => setOpen(false)}>
                Close
              </button>
              <button
                className="cd-footer-btn cd-footer-btn--primary"
                onClick={() => { setOpen(false); }}
              >
                <HiShieldCheck size={16} />
                Manage Preferences
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieDocumentation;
