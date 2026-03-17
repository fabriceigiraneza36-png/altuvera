import React, { useState, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  FiFileText,
  FiCheckCircle,
  FiUser,
  FiCreditCard,
  FiAlertTriangle,
  FiAward,
  FiExternalLink,
  FiAlertCircle,
  FiRefreshCw,
  FiGlobe,
  FiMail,
  FiChevronRight,
  FiClock,
  FiShield,
  FiSearch,
  FiPrinter,
  FiDownload,
  FiBookOpen,
  FiUserCheck,
  FiLock,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import PageHeader from "../components/common/PageHeader";

/* ══════════════════════════════════════════════════════════════
   BRAND TOKENS
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
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
};

/* ══════════════════════════════════════════════════════════════
   CONFIGURATION
   ══════════════════════════════════════════════════════════════ */

const LAST_UPDATED = "March 3, 2026";
const EFFECTIVE_DATE = "March 10, 2026";
const VERSION = "3.0";

const SECTIONS = [
  {
    id: "acceptance",
    icon: FiCheckCircle,
    title: "Acceptance of Terms",
    color: BRAND.green700,
    important: true,
    body: [
      "By accessing or using any Altuvera services — including our website, mobile applications, booking platform, or customer support channels — you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
      "If you do not agree with any part of these terms, you must discontinue use of our platform immediately. Your continued use constitutes acceptance of any updates or modifications to these terms.",
    ],
  },
  {
    id: "services",
    icon: FiGlobe,
    title: "Services and Eligibility",
    color: "#3B82F6",
    body: [
      "Altuvera provides travel-related information, destination content, safari planning tools, booking facilitation, and customer support services across Kenya, Tanzania, Uganda, Rwanda, and Ethiopia.",
      "To create an account or submit a booking request, you must be at least 18 years of age or have the consent of a parent or legal guardian. You represent that all information you provide is accurate, current, and complete.",
    ],
  },
  {
    id: "account",
    icon: FiUserCheck,
    title: "Account Responsibilities",
    color: "#8B5CF6",
    body: [
      "When you create an account with Altuvera, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.",
      "You agree to notify us immediately at security@altuvera.com if you suspect any unauthorized access to your account or any other security breach.",
    ],
  },
  {
    id: "booking",
    icon: FiCreditCard,
    title: "Booking and Payments",
    color: "#F59E0B",
    important: true,
    body: [
      "All safari bookings, tour reservations, and travel arrangements made through Altuvera are subject to the specific booking terms, deposit requirements, payment timelines, and cancellation policies presented at checkout.",
      "You agree to provide accurate traveler information (including passport details where required), valid payment details, and any special requirements at the time of booking.",
      "Refund eligibility and amounts are determined by the cancellation policy applicable to your specific booking.",
    ],
  },
  {
    id: "conduct",
    icon: FiAlertTriangle,
    title: "Prohibited Conduct",
    color: "#EF4444",
    body: [
      "When using Altuvera services, you agree not to attempt unauthorized access to our systems, upload malicious content, infringe on intellectual property rights, submit fraudulent information, or engage in any unlawful behavior.",
      "Violation of these terms may result in immediate account termination, cancellation of bookings without refund, and potential legal action.",
    ],
  },
  {
    id: "intellectual-property",
    icon: FiAward,
    title: "Intellectual Property",
    color: "#EC4899",
    body: [
      "All content on the Altuvera platform — including text, graphics, logos, photographs, video content, and software — is owned by or licensed to Altuvera and protected by international copyright and trademark laws.",
      "You may not reproduce, distribute, or commercially exploit any content without our prior written consent.",
    ],
  },
  {
    id: "third-party",
    icon: FiExternalLink,
    title: "Third-Party Services",
    color: "#06B6D4",
    body: [
      "Our platform may integrate with third-party services including payment processors, accommodation providers, and safari operators. These third-party services are governed by their own terms and policies.",
      "Altuvera is not responsible for the content, practices, or availability of external services.",
    ],
  },
  {
    id: "liability",
    icon: FiShield,
    title: "Limitation of Liability",
    color: "#14B8A6",
    important: true,
    body: [
      "To the fullest extent permitted by applicable law, Altuvera shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or third-party travel services.",
      "Our total liability for any claim shall not exceed the amount you paid to Altuvera in the 12 months preceding the claim.",
    ],
  },
  {
    id: "indemnification",
    icon: FiShield,
    title: "Indemnification",
    color: "#8B5CF6",
    body: [
      "You agree to indemnify and hold harmless Altuvera, its officers, directors, and employees from any claims, liabilities, damages, or expenses arising from your breach of these terms or violation of any applicable laws.",
    ],
  },
  {
    id: "changes",
    icon: FiRefreshCw,
    title: "Changes to Terms",
    color: "#F59E0B",
    body: [
      "We reserve the right to modify these Terms of Service at any time. When we make material changes, we will update the 'Last Updated' date and notify you where appropriate.",
      "Your continued use following changes constitutes acceptance of the revised terms.",
    ],
  },
  {
    id: "governing-law",
    icon: FiGlobe,
    title: "Governing Law",
    color: BRAND.green700,
    body: [
      "These Terms of Service shall be governed by the laws of the Republic of Kenya. Any disputes shall first be attempted to be resolved through good-faith negotiation.",
      "For users in the EU or UK, mandatory consumer protection laws of your country of residence may apply.",
    ],
  },
  {
    id: "contact",
    icon: FiMail,
    title: "Contact Us",
    color: BRAND.green700,
    body: [
      "If you have any questions about these Terms of Service, please contact us at legal@altuvera.com or hello@altuvera.com.",
    ],
    isContact: true,
  },
];

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL COMPONENT
   ══════════════════════════════════════════════════════════════ */

const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.68, 0.35, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */

export default function TermsOfService() {
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
    <div style={styles.page}>
      <PageHeader
        title="Terms of Service"
        subtitle="The legal terms governing your use of Altuvera's East African travel platform."
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920"
        breadcrumbs={[{ label: "Terms of Service" }]}
      />

      {/* Summary Bar */}
      <section style={styles.summaryBar}>
        <div style={styles.wrap}>
          <div style={styles.summaryGrid}>
            {[
              { icon: FiFileText, label: "Legal Agreement", sub: "Binding terms" },
              { icon: FiShield, label: "Your Rights", sub: "Protected by law" },
              { icon: FiClock, label: "Last Updated", sub: LAST_UPDATED },
              { icon: FiCheckCircle, label: `Version ${VERSION}`, sub: `Effective ${EFFECTIVE_DATE}` },
            ].map((item, i) => (
              <div key={i} style={styles.summaryItem}>
                <div style={styles.summaryIcon}>
                  <item.icon size={20} />
                </div>
                <div>
                  <div style={styles.summaryLabel}>{item.label}</div>
                  <div style={styles.summarySub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section style={styles.keyPoints}>
        <div style={styles.wrap}>
          <div style={styles.keyPointsHeader}>
            <FiInfo size={18} color={BRAND.green700} />
            <span>Key Points Summary</span>
          </div>
          <div style={styles.keyPointsGrid}>
            {[
              { icon: FiCheckCircle, title: "Agreement Required", desc: "Using our services means you accept these terms" },
              { icon: FiUser, title: "Age Requirement", desc: "You must be 18+ or have guardian consent" },
              { icon: FiCreditCard, title: "Payment Terms", desc: "Deposits and cancellation policies apply" },
              { icon: FiShield, title: "Limited Liability", desc: "We're not liable for third-party issues" },
              { icon: FiGlobe, title: "Kenyan Law", desc: "These terms are governed by Kenyan law" },
              { icon: FiMail, title: "Questions?", desc: "Contact legal@altuvera.com" },
            ].map((point, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div style={styles.keyPoint}>
                  <div style={styles.keyPointIcon}>
                    <point.icon size={18} />
                  </div>
                  <div>
                    <div style={styles.keyPointTitle}>{point.title}</div>
                    <div style={styles.keyPointDesc}>{point.desc}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={styles.main}>
        <div style={styles.wrap}>
          <div style={styles.layout}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
              <div style={styles.sidebarInner}>
                <div style={styles.sidebarHeader}>
                  <FiFileText size={16} color={BRAND.green700} />
                  <span>Table of Contents</span>
                </div>

                {/* Search */}
                <div style={styles.searchBox}>
                  <FiSearch size={15} style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                {/* Nav */}
                <nav style={styles.nav}>
                  {SECTIONS.map((section, i) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      style={{
                        ...styles.navItem,
                        ...(activeSection === section.id ? styles.navItemActive : {}),
                      }}
                    >
                      <span style={styles.navNum}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={styles.navText}>{section.title}</span>
                      {section.important && <span style={styles.navBadge}>Key</span>}
                    </button>
                  ))}
                </nav>

                {/* Actions */}
                <div style={styles.sidebarActions}>
                  <button style={styles.actionBtn} onClick={handlePrint}>
                    <FiPrinter size={15} />
                    <span>Print Terms</span>
                  </button>
                  <button style={styles.actionBtn} onClick={handlePrint}>
                    <FiDownload size={15} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main style={styles.content}>
              {/* Intro Card */}
              <ScrollReveal>
                <div style={styles.introCard}>
                  <div style={styles.introIcon}>
                    <HiSparkles size={26} color={BRAND.green700} />
                  </div>
                  <div>
                    <h2 style={styles.introTitle}>Legal Agreement</h2>
                    <p style={styles.introText}>
                      These Terms of Service outline the rules and guidelines for using Altuvera's
                      travel platform. By using our services, you agree to be bound by these terms.
                    </p>
                    <div style={styles.introMeta}>
                      <span style={styles.metaChip}>
                        <FiClock size={12} /> Updated: {LAST_UPDATED}
                      </span>
                      <span style={styles.metaChip}>
                        <FiCheckCircle size={12} /> Version {VERSION}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Agreement Notice */}
              <ScrollReveal delay={0.05}>
                <div style={styles.agreementNotice}>
                  <div style={styles.noticeIcon}>
                    <FiAlertCircle size={22} />
                  </div>
                  <div>
                    <strong>Important:</strong> By creating an account, making a booking, or
                    using any Altuvera service, you agree to these Terms of Service and our Privacy Policy.
                  </div>
                </div>
              </ScrollReveal>

              {/* No Results */}
              {filteredSections.length === 0 && (
                <ScrollReveal>
                  <div style={styles.noResults}>
                    <FiSearch size={40} color={BRAND.slate400} />
                    <h3 style={styles.noResultsTitle}>No matching sections</h3>
                    <p style={styles.noResultsText}>Try a different search term.</p>
                    <button style={styles.clearBtn} onClick={() => setSearchQuery("")}>
                      Clear Search
                    </button>
                  </div>
                </ScrollReveal>
              )}

              {/* Sections */}
              {filteredSections.map((section, i) => {
                const SectionIcon = section.icon;
                return (
                  <ScrollReveal key={section.id} delay={i * 0.03}>
                    <article
                      id={section.id}
                      ref={(el) => (sectionRefs.current[section.id] = el)}
                      style={{
                        ...styles.sectionCard,
                        ...(section.important ? styles.sectionCardImportant : {}),
                      }}
                    >
                      {section.important && (
                        <div style={styles.importantBadge}>
                          <FiAlertCircle size={12} />
                          <span>Important Section</span>
                        </div>
                      )}

                      <div style={styles.sectionHeader}>
                        <div
                          style={{
                            ...styles.sectionIcon,
                            background: `linear-gradient(135deg, ${section.color}18, ${section.color}08)`,
                            color: section.color,
                            border: `1px solid ${section.color}20`,
                          }}
                        >
                          <SectionIcon size={22} />
                        </div>
                        <div>
                          <span style={styles.sectionNum}>Section {i + 1}</span>
                          <h2 style={styles.sectionTitle}>{section.title}</h2>
                        </div>
                      </div>

                      <div style={styles.sectionBody}>
                        {section.body.map((paragraph, j) => (
                          <p key={j} style={styles.paragraph}>
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {section.isContact && (
                        <div style={styles.contactCard}>
                          <div style={styles.contactRow}>
                            <FiMail size={18} color={BRAND.green700} />
                            <div>
                              <span style={styles.contactLabel}>Legal Inquiries</span>
                              <a href="mailto:legal@altuvera.com" style={styles.contactLink}>
                                legal@altuvera.com
                              </a>
                            </div>
                          </div>
                          <div style={styles.contactRow}>
                            <FiMail size={18} color={BRAND.green700} />
                            <div>
                              <span style={styles.contactLabel}>General Questions</span>
                              <a href="mailto:hello@altuvera.com" style={styles.contactLink}>
                                hello@altuvera.com
                              </a>
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
                <div style={styles.bottomCta}>
                  <div style={styles.bottomIcon}>
                    <FiShield size={28} color="#fff" />
                  </div>
                  <h3 style={styles.bottomTitle}>Related Policies</h3>
                  <p style={styles.bottomText}>
                    Review our complete legal framework to understand your rights.
                  </p>
                  <div style={styles.bottomBtns}>
                    <a href="/privacy" style={styles.ctaBtnWhite}>
                      <FiShield size={16} /> Privacy Policy
                    </a>
                    <a href="/payment-terms" style={styles.ctaBtnGhost}>
                      Payment Terms <FiChevronRight size={16} />
                    </a>
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

const styles = {
  page: {
    fontFamily: "'Inter', system-ui, sans-serif",
    color: BRAND.slate800,
    WebkitFontSmoothing: "antialiased",
  },
  wrap: {
    maxWidth: 1340,
    margin: "0 auto",
    padding: "0 24px",
  },

  // Summary Bar
  summaryBar: {
    background: BRAND.green900,
    padding: "0 24px",
    boxShadow: "0 4px 20px rgba(6, 78, 59, 0.3)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    maxWidth: 1340,
    margin: "0 auto",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "26px 20px",
    borderRight: "1px solid rgba(255, 255, 255, 0.07)",
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: BRAND.green300,
  },
  summaryLabel: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#fff",
  },
  summarySub: {
    fontSize: 12.5,
    color: "rgba(255, 255, 255, 0.55)",
    marginTop: 2,
  },

  // Key Points
  keyPoints: {
    background: "#fff",
    padding: "40px 24px",
    borderBottom: `1px solid ${BRAND.slate200}`,
  },
  keyPointsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    fontWeight: 700,
    color: BRAND.slate900,
    marginBottom: 20,
  },
  keyPointsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14,
  },
  keyPoint: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "18px 20px",
    background: BRAND.slate50,
    borderRadius: 14,
    border: `1px solid ${BRAND.slate200}`,
    transition: "all 0.3s",
  },
  keyPointIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: BRAND.green100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: BRAND.green800,
    flexShrink: 0,
  },
  keyPointTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: BRAND.slate900,
    marginBottom: 3,
  },
  keyPointDesc: {
    fontSize: 13,
    color: BRAND.slate500,
    lineHeight: 1.5,
  },

  // Main Layout
  main: {
    background: `linear-gradient(180deg, ${BRAND.slate50}, ${BRAND.green50} 30%, ${BRAND.slate50})`,
    padding: "48px 0 100px",
    position: "relative",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 40,
    alignItems: "start",
  },

  // Sidebar
  sidebar: {
    position: "sticky",
    top: 100,
  },
  sidebarInner: {
    background: "#fff",
    borderRadius: 20,
    padding: "24px 20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
    border: "1px solid rgba(6, 78, 59, 0.06)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    fontWeight: 700,
    color: BRAND.slate900,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: `1px solid ${BRAND.slate200}`,
  },
  searchBox: {
    position: "relative",
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: BRAND.slate400,
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    border: `1.5px solid ${BRAND.slate200}`,
    borderRadius: 10,
    background: BRAND.slate50,
    color: BRAND.slate800,
    outline: "none",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 16,
    maxHeight: 400,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 12px",
    background: "none",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12.5,
    fontWeight: 500,
    color: BRAND.slate600,
    textAlign: "left",
    transition: "all 0.25s",
    width: "100%",
  },
  navItemActive: {
    background: `linear-gradient(135deg, ${BRAND.green800}, ${BRAND.green700})`,
    color: "#fff",
    fontWeight: 600,
    boxShadow: "0 4px 14px rgba(6, 78, 59, 0.2)",
  },
  navNum: {
    fontSize: 10,
    fontWeight: 700,
    opacity: 0.5,
    minWidth: 18,
  },
  navText: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  navBadge: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "2px 6px",
    background: BRAND.green100,
    color: BRAND.green800,
    borderRadius: 4,
  },
  sidebarActions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingTop: 14,
    borderTop: `1px solid ${BRAND.slate200}`,
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "10px 12px",
    background: BRAND.green50,
    border: "1px solid rgba(6, 78, 59, 0.08)",
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: BRAND.green800,
    cursor: "pointer",
    transition: "all 0.25s",
    width: "100%",
  },

  // Content
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    minWidth: 0,
  },

  // Intro Card
  introCard: {
    display: "flex",
    gap: 20,
    padding: 30,
    background: "#fff",
    borderRadius: 20,
    border: "1px solid rgba(6, 78, 59, 0.06)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: BRAND.green50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(6, 78, 59, 0.08)",
  },
  introTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: BRAND.slate900,
    margin: "0 0 10px",
  },
  introText: {
    fontSize: 15,
    color: BRAND.slate600,
    lineHeight: 1.75,
    margin: "0 0 16px",
  },
  introMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  metaChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    background: BRAND.green50,
    border: "1px solid rgba(6, 78, 59, 0.08)",
    borderRadius: 50,
    fontSize: 12,
    fontWeight: 600,
    color: BRAND.green800,
  },

  // Agreement Notice
  agreementNotice: {
    display: "flex",
    gap: 16,
    padding: "20px 24px",
    background: "linear-gradient(135deg, #FEF3C7, #FEF9C3)",
    border: "1px solid #FCD34D",
    borderRadius: 16,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 1.65,
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#FDE68A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#92400E",
  },

  // No Results
  noResults: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: 20,
    border: `1px solid ${BRAND.slate200}`,
  },
  noResultsTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    color: BRAND.slate900,
    margin: "16px 0 8px",
  },
  noResultsText: {
    fontSize: 14,
    color: BRAND.slate500,
    margin: "0 0 20px",
  },
  clearBtn: {
    padding: "10px 24px",
    background: BRAND.green700,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  // Section Cards
  sectionCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    border: "1px solid rgba(6, 78, 59, 0.05)",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.025)",
    transition: "all 0.35s",
    scrollMarginTop: 90,
    position: "relative",
  },
  sectionCardImportant: {
    borderLeft: `4px solid ${BRAND.green600}`,
  },
  importantBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    background: BRAND.green100,
    border: "1px solid rgba(6, 78, 59, 0.15)",
    borderRadius: 50,
    fontSize: 11,
    fontWeight: 700,
    color: BRAND.green800,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionNum: {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: BRAND.slate400,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: BRAND.slate900,
    margin: 0,
    lineHeight: 1.3,
  },
  sectionBody: {
    borderTop: `1px solid ${BRAND.slate100}`,
    paddingTop: 20,
  },
  paragraph: {
    fontSize: 15,
    color: BRAND.slate700,
    lineHeight: 1.8,
    margin: "0 0 14px",
  },

  // Contact Card
  contactCard: {
    marginTop: 20,
    padding: 24,
    background: `linear-gradient(135deg, ${BRAND.green50}, #fff)`,
    borderRadius: 16,
    border: "1px solid rgba(6, 78, 59, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  contactRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  contactLabel: {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: BRAND.slate400,
    marginBottom: 3,
  },
  contactLink: {
    fontSize: 14.5,
    fontWeight: 600,
    color: BRAND.green700,
    textDecoration: "none",
  },

  // Bottom CTA
  bottomCta: {
    background: `linear-gradient(135deg, ${BRAND.green900} 0%, ${BRAND.green800} 40%, ${BRAND.green700} 100%)`,
    borderRadius: 24,
    padding: "56px 40px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    marginTop: 16,
  },
  bottomIcon: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 22px",
  },
  bottomTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 12px",
  },
  bottomText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.78)",
    lineHeight: 1.7,
    maxWidth: 460,
    margin: "0 auto 28px",
  },
  bottomBtns: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  ctaBtnWhite: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "15px 30px",
    borderRadius: 14,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14.5,
    fontWeight: 650,
    textDecoration: "none",
    background: "#fff",
    color: BRAND.green800,
    boxShadow: "0 8px 28px rgba(0, 0, 0, 0.16)",
  },
  ctaBtnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "15px 30px",
    borderRadius: 14,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14.5,
    fontWeight: 650,
    textDecoration: "none",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#fff",
    border: "2px solid rgba(255, 255, 255, 0.18)",
  },
};