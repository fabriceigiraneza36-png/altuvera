import React, { useState, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiDatabase,
  FiSettings,
  FiShare2,
  FiGlobe,
  FiLock,
  FiUserCheck,
  FiClock,
  FiMail,
  FiChevronRight,
  FiCheckCircle,
  FiArrowUp,
  FiPrinter,
  FiDownload,
  FiSearch,
  FiAlertCircle,
  FiEye,
  FiTrash2,
  FiEdit3,
  FiXCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";

/* ══════════════════════════════════════════════════════════════
   BRAND TOKENS — Darkened East African Green Palette
   ══════════════════════════════════════════════════════════════ */

const BRAND = {
  green900: "#064e3b",
  green800: "#065f46",
  green700: "#047857",
  green600: "#059669",
  green500: "#10b981",
  green400: "#34d399",
  green300: "#6ee7b7",
  green200: "#a7f3d0",
  green100: "#d1fae5",
  green50: "#ecfdf5",
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
};

const TIMING = {
  smooth: [0.21, 0.68, 0.35, 0.98],
  snappy: [0.4, 0, 0.2, 1],
};

/* ══════════════════════════════════════════════════════════════
   CONFIGURATION
   ══════════════════════════════════════════════════════════════ */

const LAST_UPDATED = "March 3, 2026";
const EFFECTIVE_DATE = "March 10, 2026";
const VERSION = "2.1";

const SECTIONS = [
  {
    id: "information-collected",
    icon: FiDatabase,
    title: "Information We Collect",
    color: "#3B82F6",
    highlights: [
      {
        icon: FiUserCheck,
        label: "Information you provide",
        detail: "Name, email, phone, travel preferences, account details",
      },
      {
        icon: FiEye,
        label: "Automatically collected",
        detail: "Browser type, device info, IP address, pages visited",
      },
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
    color: BRAND.green700,
    highlights: [
      {
        icon: FiCheckCircle,
        label: "Service delivery",
        detail: "Process bookings, provide support, send trip updates",
      },
      {
        icon: FiCheckCircle,
        label: "Platform improvement",
        detail: "Analytics, personalization, security monitoring",
      },
    ],
    body: [
      "We use your information to deliver and continuously improve our services — including processing travel inquiries and bookings, sending essential trip confirmations and updates, providing responsive customer support, and personalizing destination recommendations.",
      "With your consent, we may send marketing communications about new destinations, special safari packages, and seasonal offers across East Africa. You can opt out at any time through your account settings or the unsubscribe link in any email.",
      "We also use aggregated, anonymized data for analytics purposes to understand travel trends across Rwanda, Tanzania, Uganda, Rwanda, and Ethiopia — helping us curate better experiences for all travelers.",
    ],
  },
  {
    id: "sharing",
    icon: FiShare2,
    title: "Sharing of Information",
    color: "#8B5CF6",
    highlights: [
      {
        icon: FiXCircle,
        label: "We never sell your data",
        detail: "Your personal information is not for sale — period",
      },
      {
        icon: FiCheckCircle,
        label: "Limited, necessary sharing",
        detail: "Only with verified travel partners to fulfill bookings",
      },
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
    title: "Cookies and Tracking",
    color: "#F59E0B",
    highlights: [
      {
        icon: FiCheckCircle,
        label: "Essential cookies",
        detail: "Authentication, security, session management",
      },
      {
        icon: FiCheckCircle,
        label: "Optional cookies",
        detail: "Analytics, preferences, personalization",
      },
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
    color: "#EC4899",
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
    color: "#EF4444",
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
    color: "#06B6D4",
    highlights: [
      { icon: FiEye, label: "Access", detail: "View what data we hold" },
      { icon: FiEdit3, label: "Correct", detail: "Update inaccurate data" },
      { icon: FiTrash2, label: "Delete", detail: "Request data removal" },
      {
        icon: FiDownload,
        label: "Export",
        detail: "Download your data",
      },
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
    color: "#14B8A6",
    body: [
      "Your information may be processed in countries other than your country of residence — including Rwanda, Rwanda, Tanzania, Uganda, and Ethiopia — as well as cloud infrastructure regions required for reliable service delivery.",
      "Where required by law, we apply appropriate safeguards for international data transfers, such as Standard Contractual Clauses or equivalent mechanisms recognized under applicable data protection regulations.",
    ],
  },
  {
    id: "contact",
    icon: FiMail,
    title: "Contact Us",
    color: BRAND.green700,
    body: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, we'd love to hear from you.",
    ],
    contact: {
      email: "altuverasafari@gmail.com",
      address: "Altuvera House, Safari Way, Kinigi, Musanze, Rwanda",
      response: "We aim to respond within 48 hours on business days.",
    },
  },
];

/* ══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ══════════════════════════════════════════════════════════════ */

const ScrollReveal = ({ children, delay = 0, direction = "up", className = "", style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const dirs = { up: { y: 32 }, down: { y: -32 }, left: { x: -40 }, right: { x: 40 } };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: TIMING.smooth }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef({});

  const scrollToSection = (id) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePrint = () => window.print();

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
    <div className="pp">
      <style>{privacyStyles}</style>

      <PageHeader
        title="Privacy Policy"
        subtitle="How Altuvera collects, uses, and protects your information across our East African travel platform."
        backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920"
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      {/* ════════ HERO SUMMARY BAR ════════ */}
      <section className="pp-summary-bar">
        <div className="pp-wrap">
          <div className="pp-summary-grid">
            {[
              { icon: FiShield, label: "Your Data Protected", sub: "Enterprise-grade encryption" },
              { icon: FiLock, label: "Never Sold", sub: "We don't sell your data" },
              { icon: FiClock, label: "Last Updated", sub: LAST_UPDATED },
              { icon: FiCheckCircle, label: `Version ${VERSION}`, sub: `Effective ${EFFECTIVE_DATE}` },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08} direction="up">
                <div className="pp-summary-item">
                  <div className="pp-summary-icon">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div className="pp-summary-label">{item.label}</div>
                    <div className="pp-summary-sub">{item.sub}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ MAIN CONTENT ════════ */}
      <section className="pp-main">
        <div className="pp-wrap">
          <div className="pp-layout">
            {/* ── Sidebar Navigation ── */}
            <ScrollReveal direction="left" delay={0.1}>
              <aside className="pp-sidebar">
                <div className="pp-sidebar-inner">
                  <div className="pp-sidebar-header">
                    <FiShield size={16} color={BRAND.green700} />
                    <span>Quick Navigation</span>
                  </div>

                  {/* Search */}
                  <div className="pp-sidebar-search">
                    <FiSearch size={15} className="pp-search-icon" />
                    <input
                      type="text"
                      placeholder="Search policy..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pp-search-input"
                    />
                  </div>

                  {/* Navigation items */}
                  <nav className="pp-nav">
                    {SECTIONS.map((section, i) => (
                      <button
                        key={section.id}
                        className={`pp-nav-item ${activeSection === section.id ? "active" : ""}`}
                        onClick={() => scrollToSection(section.id)}
                      >
                        <span className="pp-nav-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="pp-nav-text">{section.title}</span>
                        <FiChevronRight size={14} className="pp-nav-arrow" />
                      </button>
                    ))}
                  </nav>

                  {/* Actions */}
                  <div className="pp-sidebar-actions">
                    <button className="pp-action-btn" onClick={handlePrint}>
                      <FiPrinter size={15} />
                      <span>Print Policy</span>
                    </button>
                    <button className="pp-action-btn" onClick={handlePrint}>
                      <FiDownload size={15} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </aside>
            </ScrollReveal>

            {/* ── Content Area ── */}
            <main className="pp-content">
              {/* Intro */}
              <ScrollReveal>
                <div className="pp-intro-card">
                  <div className="pp-intro-icon">
                    <HiSparkles size={24} color={BRAND.green700} />
                  </div>
                  <div>
                    <h2 className="pp-intro-title">Our Commitment to Your Privacy</h2>
                    <p className="pp-intro-text">
                      At Altuvera, we believe your personal information deserves the highest level of
                      protection. This policy explains transparently how we collect, use, share, and
                      safeguard your data as you explore East Africa's most extraordinary destinations
                      with us.
                    </p>
                    <div className="pp-intro-meta">
                      <span className="pp-meta-chip">
                        <FiClock size={12} /> Last updated: {LAST_UPDATED}
                      </span>
                      <span className="pp-meta-chip">
                        <FiCheckCircle size={12} /> Version {VERSION}
                      </span>
                      <span className="pp-meta-chip">
                        <FiShield size={12} /> GDPR Aligned
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* No results */}
              {filteredSections.length === 0 && (
                <ScrollReveal>
                  <div className="pp-no-results">
                    <FiSearch size={40} color={BRAND.slate400} />
                    <h3>No matching sections</h3>
                    <p>Try a different search term or clear your query.</p>
                    <button
                      className="pp-clear-btn"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </button>
                  </div>
                </ScrollReveal>
              )}

              {/* Sections */}
              {filteredSections.map((section, i) => {
                const SectionIcon = section.icon;
                return (
                  <ScrollReveal key={section.id} delay={i * 0.04}>
                    <article
                      className="pp-section-card"
                      id={section.id}
                      ref={(el) => (sectionRefs.current[section.id] = el)}
                    >
                      {/* Section header */}
                      <div className="pp-section-header">
                        <div
                          className="pp-section-icon"
                          style={{
                            background: `linear-gradient(135deg, ${section.color}18, ${section.color}08)`,
                            color: section.color,
                            border: `1px solid ${section.color}20`,
                          }}
                        >
                          <SectionIcon size={22} />
                        </div>
                        <div>
                          <span className="pp-section-num">Section {i + 1}</span>
                          <h2 className="pp-section-title">{section.title}</h2>
                        </div>
                      </div>

                      {/* Highlights */}
                      {section.highlights && (
                        <div className="pp-highlights">
                          {section.highlights.map((h, j) => {
                            const HIcon = h.icon;
                            return (
                              <div key={j} className="pp-highlight">
                                <div
                                  className="pp-highlight-icon"
                                  style={{ color: section.color }}
                                >
                                  <HIcon size={16} />
                                </div>
                                <div>
                                  <div className="pp-highlight-label">{h.label}</div>
                                  <div className="pp-highlight-detail">{h.detail}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Body paragraphs */}
                      <div className="pp-section-body">
                        {section.body.map((paragraph, j) => (
                          <p key={j} className="pp-paragraph">
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Contact card (for contact section) */}
                      {section.contact && (
                        <div className="pp-contact-card">
                          <div className="pp-contact-row">
                            <FiMail size={18} color={BRAND.green700} />
                            <div>
                              <span className="pp-contact-label">Email</span>
                              <a
                                href={`mailto:${section.contact.email}`}
                                className="pp-contact-value pp-contact-link"
                              >
                                {section.contact.email}
                              </a>
                            </div>
                          </div>
                          <div className="pp-contact-row">
                            <FiGlobe size={18} color={BRAND.green700} />
                            <div>
                              <span className="pp-contact-label">Address</span>
                              <span className="pp-contact-value">
                                {section.contact.address}
                              </span>
                            </div>
                          </div>
                          <div className="pp-contact-row">
                            <FiClock size={18} color={BRAND.green700} />
                            <div>
                              <span className="pp-contact-label">Response Time</span>
                              <span className="pp-contact-value">
                                {section.contact.response}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  </ScrollReveal>
                );
              })}

              {/* Bottom CTA */}
              <ScrollReveal>
                <div className="pp-bottom-cta">
                  <div className="pp-bottom-pattern" />
                  <div className="pp-bottom-inner">
                    <div className="pp-bottom-icon">
                      <FiShield size={28} color="#fff" />
                    </div>
                    <h3 className="pp-bottom-title">Questions About Your Privacy?</h3>
                    <p className="pp-bottom-text">
                      Our Data Protection team is here to help. Reach out anytime and we'll
                      respond within 48 hours.
                    </p>
                    <div className="pp-bottom-btns">
                      <a href="mailto:altuverasafari@gmail.com" className="pp-cta-btn pp-cta-btn--white">
                        <FiMail size={16} /> Contact Our Team
                      </a>
                      <a href="/terms" className="pp-cta-btn pp-cta-btn--ghost">
                        View Terms of Service <FiChevronRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════════ */

const privacyStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.pp {
  font-family: 'Inter', system-ui, sans-serif;
  color: ${BRAND.slate800};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.pp-wrap {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ═══════════════ SUMMARY BAR ═══════════════ */
.pp-summary-bar {
  background: ${BRAND.green900};
  padding: 0 24px;
  position: relative;
  z-index: 5;
  box-shadow: 0 4px 20px rgba(6, 78, 59, 0.3);
}
.pp-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 1340px;
  margin: 0 auto;
}
.pp-summary-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 26px 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  transition: background 0.3s;
}
.pp-summary-item:last-child { border-right: none; }
.pp-summary-item:hover { background: rgba(255, 255, 255, 0.03); }
.pp-summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${BRAND.green300};
  flex-shrink: 0;
}
.pp-summary-label {
  font-size: 14.5px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}
.pp-summary-sub {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  margin-top: 2px;
}

/* ═══════════════ MAIN LAYOUT ═══════════════ */
.pp-main {
  background: linear-gradient(180deg, #f0fdf4, ${BRAND.green50} 30%, ${BRAND.slate50});
  padding: 48px 0 100px;
  position: relative;
}
.pp-main::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 8% 15%, rgba(6, 78, 59, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 92% 80%, rgba(4, 120, 87, 0.03) 0%, transparent 50%);
  pointer-events: none;
}
.pp-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
  align-items: start;
  position: relative;
  z-index: 1;
}

/* ═══════════════ SIDEBAR ═══════════════ */
.pp-sidebar {
  position: sticky;
  top: 100px;
}
.pp-sidebar-inner {
  background: #fff;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(6, 78, 59, 0.06);
}
.pp-sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: ${BRAND.slate900};
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${BRAND.slate200};
}

/* Search */
.pp-sidebar-search {
  position: relative;
  margin-bottom: 16px;
}
.pp-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${BRAND.slate400};
}
.pp-search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  border: 1.5px solid ${BRAND.slate200};
  border-radius: 10px;
  background: ${BRAND.slate50};
  color: ${BRAND.slate800};
  outline: none;
  transition: all 0.3s;
}
.pp-search-input::placeholder { color: ${BRAND.slate400}; }
.pp-search-input:focus {
  border-color: ${BRAND.green700};
  background: #fff;
  box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.06);
}

/* Nav */
.pp-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 18px;
}
.pp-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: ${BRAND.slate600};
  text-align: left;
  transition: all 0.25s;
  width: 100%;
}
.pp-nav-item:hover {
  background: ${BRAND.green50};
  color: ${BRAND.green800};
}
.pp-nav-item.active {
  background: linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700});
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(6, 78, 59, 0.2);
}
.pp-nav-num {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.5;
  min-width: 20px;
}
.pp-nav-item.active .pp-nav-num { opacity: 0.8; }
.pp-nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pp-nav-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.25s;
  flex-shrink: 0;
}
.pp-nav-item:hover .pp-nav-arrow,
.pp-nav-item.active .pp-nav-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Sidebar actions */
.pp-sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid ${BRAND.slate200};
}
.pp-action-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  background: ${BRAND.green50};
  border: 1px solid rgba(6, 78, 59, 0.08);
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: ${BRAND.green800};
  cursor: pointer;
  transition: all 0.25s;
  width: 100%;
}
.pp-action-btn:hover {
  background: ${BRAND.green100};
  transform: translateX(2px);
}

/* ═══════════════ CONTENT AREA ═══════════════ */
.pp-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

/* Intro card */
.pp-intro-card {
  display: flex;
  gap: 20px;
  padding: 30px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(6, 78, 59, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}
.pp-intro-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, ${BRAND.green900}, ${BRAND.green700}, ${BRAND.green500}, ${BRAND.green700}, ${BRAND.green900});
  background-size: 200% 100%;
  animation: pp-shimmer 5s ease infinite;
}
@keyframes pp-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.pp-intro-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${BRAND.green50};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(6, 78, 59, 0.08);
}
.pp-intro-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: ${BRAND.slate900};
  margin: 0 0 10px;
}
.pp-intro-text {
  font-size: 15px;
  color: ${BRAND.slate600};
  line-height: 1.75;
  margin: 0 0 16px;
}
.pp-intro-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pp-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${BRAND.green50};
  border: 1px solid rgba(6, 78, 59, 0.08);
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  color: ${BRAND.green800};
}

/* No results */
.pp-no-results {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid ${BRAND.slate200};
}
.pp-no-results h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: ${BRAND.slate900};
  margin: 16px 0 8px;
}
.pp-no-results p {
  font-size: 14px;
  color: ${BRAND.slate500};
  margin: 0 0 20px;
}
.pp-clear-btn {
  padding: 10px 24px;
  background: ${BRAND.green700};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}
.pp-clear-btn:hover {
  background: ${BRAND.green800};
  transform: translateY(-2px);
}

/* ═══════════════ SECTION CARDS ═══════════════ */
.pp-section-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(6, 78, 59, 0.05);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.025);
  transition: all 0.35s;
  scroll-margin-top: 90px;
}
.pp-section-card:hover {
  box-shadow: 0 8px 32px rgba(6, 78, 59, 0.06);
  border-color: rgba(6, 78, 59, 0.1);
}

/* Section header */
.pp-section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.pp-section-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s;
}
.pp-section-card:hover .pp-section-icon {
  transform: rotate(-5deg) scale(1.05);
}
.pp-section-num {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${BRAND.slate400};
  margin-bottom: 4px;
}
.pp-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: ${BRAND.slate900};
  margin: 0;
  line-height: 1.3;
}

/* Highlights */
.pp-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.pp-highlight {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  background: ${BRAND.slate50};
  border-radius: 14px;
  border: 1px solid ${BRAND.slate200};
  transition: all 0.3s;
}
.pp-highlight:hover {
  background: ${BRAND.green50};
  border-color: rgba(6, 78, 59, 0.1);
  transform: translateY(-2px);
}
.pp-highlight-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.pp-highlight-label {
  font-size: 13.5px;
  font-weight: 700;
  color: ${BRAND.slate900};
  margin-bottom: 3px;
}
.pp-highlight-detail {
  font-size: 12.5px;
  color: ${BRAND.slate500};
  line-height: 1.5;
}

/* Body */
.pp-section-body {
  border-top: 1px solid ${BRAND.slate100};
  padding-top: 20px;
}
.pp-paragraph {
  font-size: 15px;
  color: ${BRAND.slate700};
  line-height: 1.8;
  margin: 0 0 14px;
}
.pp-paragraph:last-child { margin-bottom: 0; }

/* Contact card */
.pp-contact-card {
  margin-top: 20px;
  padding: 24px;
  background: linear-gradient(135deg, ${BRAND.green50}, #fff);
  border-radius: 16px;
  border: 1px solid rgba(6, 78, 59, 0.1);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pp-contact-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.pp-contact-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${BRAND.slate400};
  margin-bottom: 3px;
}
.pp-contact-value {
  font-size: 14.5px;
  font-weight: 600;
  color: ${BRAND.slate800};
}
.pp-contact-link {
  color: ${BRAND.green700};
  text-decoration: none;
  transition: color 0.2s;
}
.pp-contact-link:hover {
  color: ${BRAND.green900};
  text-decoration: underline;
}

/* ═══════════════ BOTTOM CTA ═══════════════ */
.pp-bottom-cta {
  background: linear-gradient(135deg, ${BRAND.green900} 0%, ${BRAND.green800} 40%, ${BRAND.green700} 100%);
  border-radius: 24px;
  padding: 56px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-top: 16px;
}
.pp-bottom-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}
.pp-bottom-inner { position: relative; z-index: 1; }
.pp-bottom-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
  backdrop-filter: blur(4px);
}
.pp-bottom-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}
.pp-bottom-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
  max-width: 460px;
  margin: 0 auto 28px;
}
.pp-bottom-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}
.pp-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 14.5px;
  font-weight: 650;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.pp-cta-btn--white {
  background: #fff;
  color: ${BRAND.green800};
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
}
.pp-cta-btn--white:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
}
.pp-cta-btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.18);
}
.pp-cta-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

/* ═══════════════ RESPONSIVE ═══════════════ */
@media (max-width: 1024px) {
  .pp-layout {
    grid-template-columns: 1fr;
  }
  .pp-sidebar {
    position: static;
  }
  .pp-sidebar-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }
  .pp-sidebar-header {
    width: 100%;
    margin-bottom: 4px;
    padding-bottom: 12px;
  }
  .pp-sidebar-search {
    flex: 1;
    min-width: 200px;
    margin-bottom: 0;
  }
  .pp-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
    margin-bottom: 8px;
  }
  .pp-nav-item {
    padding: 8px 14px;
    font-size: 12.5px;
    white-space: nowrap;
    width: auto;
  }
  .pp-nav-num { display: none; }
  .pp-sidebar-actions {
    flex-direction: row;
    width: 100%;
    padding-top: 12px;
  }
}

@media (max-width: 768px) {
  .pp-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .pp-summary-item:nth-child(2) { border-right: none; }
  .pp-section-card { padding: 24px 20px; }
  .pp-intro-card { flex-direction: column; padding: 24px 20px; }
  .pp-bottom-cta { padding: 40px 24px; }
}

@media (max-width: 480px) {
  .pp-summary-grid { grid-template-columns: 1fr; }
  .pp-summary-item {
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 18px 16px;
  }
  .pp-summary-item:last-child { border-bottom: none; }
  .pp-section-header { flex-direction: column; gap: 12px; }
  .pp-highlights { grid-template-columns: 1fr; }
  .pp-bottom-btns { flex-direction: column; align-items: stretch; }
  .pp-cta-btn { justify-content: center; width: 100%; }
  .pp-intro-meta { flex-direction: column; }
}

/* Print styles */
@media print {
  .pp-sidebar, .pp-summary-bar, .pp-bottom-cta, .pp-sidebar-actions { display: none !important; }
  .pp-layout { grid-template-columns: 1fr !important; }
  .pp-section-card { break-inside: avoid; box-shadow: none; border: 1px solid #ddd; }
  .pp-main { background: #fff !important; padding: 20px 0 !important; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Scrollbar */
::-webkit-scrollbar { width: 7px; }
::-webkit-scrollbar-track { background: ${BRAND.green50}; }
::-webkit-scrollbar-thumb { background: ${BRAND.green800}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${BRAND.green900}; }
::selection { background: ${BRAND.green800}; color: #fff; }
`;