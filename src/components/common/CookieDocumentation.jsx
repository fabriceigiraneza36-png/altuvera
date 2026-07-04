// src/components/common/CookieDocumentation.jsx
// ============================================================================
// Cookie Documentation — Full Policy Drawer (Tailwind CSS only)
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COOKIE_CATEGORIES } from "../../utils/cookiePreferences";

// ─── Internal event ───────────────────────────────────────────────────────────
const OPEN_DOCS_EVENT = "altuvera:open-cookie-docs";

/**
 * Call from anywhere to open the cookie documentation drawer.
 */
export const openCookieDocs = () => {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_DOCS_EVENT));
  } catch {
    // ignore
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ShieldIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ExternalLinkIcon = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── Section Component ────────────────────────────────────────────────────────

const DocSection = ({ title, children }) => (
  <section className="mb-6">
    <h3 className="text-sm font-bold text-slate-800 mb-2.5 pb-1.5 border-b border-slate-100">
      {title}
    </h3>
    {children}
  </section>
);

// ─── Cookie Table ─────────────────────────────────────────────────────────────

const CookieTable = ({ category }) => (
  <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
    {/* Category header */}
    <div
      className={[
        "px-3.5 py-2.5 border-b border-slate-200",
        category.required
          ? "bg-slate-50"
          : "bg-gradient-to-r from-emerald-50 to-green-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          {category.label}
        </span>
        {category.required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Always Active
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
        {category.description}
      </p>
    </div>

    {/* Cookie examples */}
    <div className="divide-y divide-slate-100">
      {category.examples.map((ex) => (
        <div
          key={ex}
          className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors"
        >
          <code className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {ex}
          </code>
          <span className="text-[10px] text-slate-400 ml-2">
            {category.required ? "Session / Persistent" : "30 days"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Documentation Drawer ────────────────────────────────────────────────

export default function CookieDocumentation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(OPEN_DOCS_EVENT, handler);
    return () => window.removeEventListener(OPEN_DOCS_EVENT, handler);
  }, []);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[10001] bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-[10002] w-full max-w-[520px] bg-white shadow-2xl shadow-slate-900/20 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 160, damping: 24 }}
            role="dialog"
            aria-modal="true"
            aria-label="Cookie Policy"
          >
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <ShieldIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Cookie Policy
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Last updated: January 2025
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Close cookie policy"
              >
                <XIcon size={15} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 text-sm">
              {/* Intro */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 mb-6">
                <p className="text-[12.5px] text-emerald-800 leading-relaxed">
                  Altuvera Safaris is committed to your privacy. This policy
                  explains exactly what cookies we use, why we use them, and
                  how you can control them. We comply with GDPR, UK GDPR, and
                  the ePrivacy Directive.
                </p>
              </div>

              {/* What are cookies */}
              <DocSection title="What Are Cookies?">
                <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                  Cookies are small text files stored on your device when you
                  visit a website. They help websites remember your preferences,
                  keep you signed in, and collect analytics data.
                </p>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">
                  We distinguish between <strong>first-party cookies</strong>{" "}
                  (set by Altuvera) and{" "}
                  <strong>third-party cookies</strong> (set by external services
                  like Google Analytics). You can control both through our
                  preferences panel.
                </p>
              </DocSection>

              {/* Categories */}
              <DocSection title="Cookies We Use">
                {Object.values(COOKIE_CATEGORIES).map((cat) => (
                  <CookieTable key={cat.id} category={cat} />
                ))}
              </DocSection>

              {/* Your rights */}
              <DocSection title="Your Rights & Controls">
                <div className="space-y-2">
                  {[
                    {
                      title: "Right to Withdraw Consent",
                      desc: 'You can change or withdraw your consent at any time via "Manage Cookies" in our footer. Changes take effect immediately.',
                    },
                    {
                      title: "Right to Access",
                      desc: "You can request a copy of all personal data we hold about you by contacting privacy@altuvera.com.",
                    },
                    {
                      title: "Right to Erasure",
                      desc: "You can request deletion of your personal data at any time. Essential cookies required for security cannot be deleted while you are using the service.",
                    },
                    {
                      title: "Browser Controls",
                      desc: "You can block or delete cookies directly through your browser settings. Note that blocking essential cookies may prevent some features from working.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                      <div>
                        <p className="text-[12px] font-bold text-slate-700 mb-0.5">
                          {item.title}
                        </p>
                        <p className="text-[11.5px] text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DocSection>

              {/* Third-party links */}
              <DocSection title="Third-Party Services">
                <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                  With your consent, we may use the following services which
                  set their own cookies:
                </p>
                <div className="space-y-2">
                  {[
                    {
                      name: "Google Analytics 4",
                      purpose: "Website analytics & performance",
                      link: "https://policies.google.com/privacy",
                    },
                    {
                      name: "Google Ads",
                      purpose: "Advertising & remarketing",
                      link: "https://policies.google.com/privacy",
                    },
                    {
                      name: "Meta Pixel",
                      purpose: "Social media advertising",
                      link: "https://www.facebook.com/privacy/policy/",
                    },
                  ].map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">
                          {svc.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {svc.purpose}
                        </p>
                      </div>
                      <a
                        href={svc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                      >
                        Privacy Policy
                        <ExternalLinkIcon size={11} />
                      </a>
                    </div>
                  ))}
                </div>
              </DocSection>

              {/* Contact */}
              <DocSection title="Contact">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    For privacy enquiries, contact our Data Protection Officer:
                  </p>
                  <a
                    href="mailto:privacy@altuvera.com"
                    className="text-[12px] text-emerald-600 font-bold hover:text-emerald-700 focus:outline-none underline-offset-2 hover:underline"
                  >
                    privacy@altuvera.com
                  </a>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Altuvera Safaris Ltd, Nairobi, Kenya
                  </p>
                </div>
              </DocSection>
            </div>

            {/* Sticky footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 leading-snug">
                  You can manage your cookie preferences at any time.
                </p>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 hover:from-emerald-400 hover:to-green-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}