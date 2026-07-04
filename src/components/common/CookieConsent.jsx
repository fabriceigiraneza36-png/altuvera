// src/components/common/CookieConsent.jsx
// ============================================================================
// Cookie Consent — Professional Dark-Green / White Theme (Tailwind CSS only)
// ============================================================================

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COOKIE_PREFS_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
  COOKIE_CATEGORIES,
  DEFAULT_PREFS,
  readStoredPreferences,
  writePreferences,
  applyConsentPreferences,
} from "../../utils/cookiePreferences";
import { openCookieDocs } from "./CookieDocumentation";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ShieldIcon = ({ size = 20, className = "" }) => (
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

const LockIcon = ({ size = 16, className = "" }) => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BarChartIcon = ({ size = 16, className = "" }) => (
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
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const MegaphoneIcon = ({ size = 16, className = "" }) => (
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
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);

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

const SparklesIcon = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
  </svg>
);

const BookIcon = ({ size = 14, className = "" }) => (
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
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SlidersIcon = ({ size = 14, className = "" }) => (
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
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const CheckIcon = ({ size = 10, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ChevronDownIcon = ({ size = 14, className = "" }) => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const InfoIcon = ({ size = 13, className = "" }) => (
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
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ─── Category Icon Map ────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  necessary: LockIcon,
  analytics: BarChartIcon,
  marketing: MegaphoneIcon,
};

// ─── Toggle Component ─────────────────────────────────────────────────────────

const Toggle = React.memo(({ checked, onChange, disabled, id }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-disabled={disabled}
    disabled={disabled}
    onClick={disabled ? undefined : () => onChange(!checked)}
    id={id}
    className={[
      "relative inline-flex items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
      "w-12 h-6 flex-shrink-0",
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer",
      checked && !disabled
        ? "bg-gradient-to-r from-emerald-500 to-green-700 shadow-lg shadow-emerald-500/30"
        : disabled && checked
        ? "bg-slate-400"
        : "bg-slate-200",
    ].join(" ")}
  >
    <span
      className={[
        "inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300",
        checked ? "translate-x-6" : "translate-x-0.5",
      ].join(" ")}
    />
  </button>
));
Toggle.displayName = "Toggle";

// ─── Cookie Row Component ─────────────────────────────────────────────────────

const CookieRow = React.memo(
  ({ categoryId, checked, onChange }) => {
    const [expanded, setExpanded] = useState(false);
    const category = COOKIE_CATEGORIES[categoryId];
    const Icon = CATEGORY_ICONS[categoryId] || LockIcon;
    const isRequired = category.required;

    return (
      <div
        className={[
          "rounded-xl border transition-all duration-200",
          checked && !isRequired
            ? "border-emerald-200 bg-emerald-50/50"
            : isRequired
            ? "border-slate-200 bg-slate-50/80"
            : "border-slate-200 bg-white",
        ].join(" ")}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-3.5">
          {/* Icon */}
          <div
            className={[
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              isRequired
                ? "bg-slate-100 text-slate-500"
                : checked
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-400",
            ].join(" ")}
          >
            <Icon size={16} />
          </div>

          {/* Label + toggle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {category.label}
              </span>
              {isRequired && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 pr-2">
              {category.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <ChevronDownIcon
                size={14}
                className={`transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
            <Toggle
              checked={checked || isRequired}
              onChange={(val) => !isRequired && onChange(val)}
              disabled={isRequired}
              id={`toggle-${categoryId}`}
            />
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pb-3.5 pt-0 border-t border-dashed border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5 mb-2">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                    <InfoIcon size={10} />
                    Examples:
                  </span>
                  {category.examples.map((ex) => (
                    <code
                      key={ex}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200"
                    >
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
CookieRow.displayName = "CookieRow";

// ─── Button Component ─────────────────────────────────────────────────────────

const CcButton = React.memo(
  ({ children, variant = "ghost", onClick, disabled = false, icon: Icon }) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

    const variants = {
      primary:
        "bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-green-600 hover:shadow-emerald-500/35 active:scale-[0.98]",
      secondary:
        "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]",
      ghost:
        "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 active:scale-[0.98]",
      danger:
        "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 active:scale-[0.98]",
    };

    return (
      <motion.button
        className={`${base} ${variants[variant] || variants.ghost}`}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {Icon && <Icon size={14} />}
        {children}
      </motion.button>
    );
  }
);
CcButton.displayName = "CcButton";

// ─── Consent Summary Pills ────────────────────────────────────────────────────

const ConsentSummary = React.memo(({ prefs }) => {
  const categories = Object.values(COOKIE_CATEGORIES);
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => {
        const isActive = cat.required || prefs[cat.id];
        return (
          <span
            key={cat.id}
            className={[
              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border",
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-200",
            ].join(" ")}
          >
            <span
              className={[
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                isActive ? "bg-emerald-500" : "bg-slate-300",
              ].join(" ")}
            />
            {cat.label}
          </span>
        );
      })}
    </div>
  );
});
ConsentSummary.displayName = "ConsentSummary";

// ─── Main Banner ──────────────────────────────────────────────────────────────

const CookieBanner = React.memo(({ onAcceptAll, onEssentialOnly, onCustomize, onLearnMore }) => (
  <motion.div
    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[min(540px,calc(100vw-24px))]"
    initial={{ opacity: 0, y: 48, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 24, scale: 0.96 }}
    transition={{ type: "spring", stiffness: 140, damping: 20 }}
    role="dialog"
    aria-modal="true"
    aria-label="Cookie consent"
    aria-live="polite"
  >
    {/* Card */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex gap-3.5 mb-4">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
            <ShieldIcon size={20} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5">
              <SparklesIcon size={8} />
              Privacy First
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-tight mb-0.5">
              Your Privacy, Your Choice
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              We use cookies to deliver a great experience, improve performance,
              and — only with your consent — personalise content and ads.
            </p>
          </div>
        </div>

        {/* GDPR notice */}
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 mb-4">
          <InfoIcon size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            We never sell your data. Essential cookies are always active for
            security. See our{" "}
            <button
              onClick={onLearnMore}
              className="text-emerald-600 font-semibold hover:text-emerald-700 underline-offset-2 hover:underline focus:outline-none"
            >
              Cookie Policy
            </button>{" "}
            for full details.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <CcButton
            variant="ghost"
            onClick={onLearnMore}
            icon={BookIcon}
          >
            Learn More
          </CcButton>
          <CcButton
            variant="secondary"
            onClick={onCustomize}
            icon={SlidersIcon}
          >
            Customise
          </CcButton>
          <CcButton variant="ghost" onClick={onEssentialOnly}>
            Essential Only
          </CcButton>
          <CcButton variant="primary" onClick={onAcceptAll}>
            Accept All
          </CcButton>
        </div>
      </div>
    </div>
  </motion.div>
));
CookieBanner.displayName = "CookieBanner";

// ─── Preferences Modal ────────────────────────────────────────────────────────

const CookieModal = React.memo(
  ({ prefs, onPrefsChange, onSave, onEssentialOnly, onAcceptAll, onClose, onLearnMore }) => {
    const stored = readStoredPreferences();
    const hadConsent = Boolean(stored?.consentGiven);

    return (
      <motion.div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={hadConsent ? onClose : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Cookie preferences"
      >
        <motion.div
          className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header accent */}
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600" />

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <SlidersIcon size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Cookie Preferences
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Control what data we collect
                </p>
              </div>
            </div>
            {hadConsent && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="Close"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto">
            {/* Current status */}
            {hadConsent && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Status
                </p>
                <ConsentSummary prefs={prefs} />
              </div>
            )}

            {/* Category rows */}
            {Object.keys(COOKIE_CATEGORIES).map((catId) => (
              <CookieRow
                key={catId}
                categoryId={catId}
                checked={prefs[catId] || COOKIE_CATEGORIES[catId].required}
                onChange={(val) =>
                  onPrefsChange((prev) => ({ ...prev, [catId]: val }))
                }
              />
            ))}

            {/* Info note */}
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 mt-1">
              <ShieldIcon size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Your choices take immediate effect. You can change your preferences
                at any time via the footer link.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <CcButton variant="ghost" onClick={onLearnMore} icon={BookIcon}>
                  Cookie Policy
                </CcButton>
                <CcButton variant="danger" onClick={onEssentialOnly}>
                  Essential Only
                </CcButton>
              </div>
              <div className="flex gap-2">
                <CcButton variant="secondary" onClick={onSave}>
                  Save Choices
                </CcButton>
                <CcButton variant="primary" onClick={onAcceptAll}>
                  Accept All
                </CcButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
CookieModal.displayName = "CookieModal";

// ─── Success Toast ────────────────────────────────────────────────────────────

const ConsentToast = React.memo(({ prefs, onManage }) => (
  <motion.div
    className="fixed bottom-5 right-5 z-[9998] max-w-[300px]"
    initial={{ opacity: 0, x: 20, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: 20, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 200, damping: 22 }}
  >
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-slate-900/10 overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-green-600" />
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckIcon size={10} className="text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 mb-0.5">
              Preferences Saved
            </p>
            <ConsentSummary prefs={prefs} />
            <button
              onClick={onManage}
              className="text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 mt-1.5 focus:outline-none underline-offset-2 hover:underline"
            >
              Manage preferences →
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));
ConsentToast.displayName = "ConsentToast";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);

  const [showBanner, setShowBanner] = useState(!stored?.consentGiven);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [prefs, setPrefs] = useState(stored || { ...DEFAULT_PREFS });

  const toastTimerRef = useRef(null);

  // ── Listen for "open settings" event (from footer, etc.) ──
  useEffect(() => {
    const handler = () => {
      setShowBanner(false);
      setShowModal(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
  }, []);

  // ── Apply stored prefs on mount ──
  useEffect(() => {
    if (stored?.consentGiven) {
      applyConsentPreferences(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Body scroll lock ──
  useEffect(() => {
    const shouldLock = showBanner || showModal;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showBanner, showModal]);

  // ── Cleanup toast timer ──
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ── Save & apply ──
  const handleSave = useCallback(
    (overridePrefs) => {
      const toSave = overridePrefs || prefs;
      const final = writePreferences(toSave);
      if (final) {
        setPrefs(final);
        applyConsentPreferences(final);
      }
      setShowBanner(false);
      setShowModal(false);

      // Show toast
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
    },
    [prefs]
  );

  const handleAcceptAll = useCallback(() => {
    handleSave({ necessary: true, analytics: true, marketing: true });
  }, [handleSave]);

  const handleEssentialOnly = useCallback(() => {
    handleSave({ necessary: true, analytics: false, marketing: false });
  }, [handleSave]);

  const handleSaveChoices = useCallback(() => {
    handleSave(prefs);
  }, [handleSave, prefs]);

  const handleCustomize = useCallback(() => {
    setShowBanner(false);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    const currentStored = readStoredPreferences();
    if (currentStored?.consentGiven) {
      setShowModal(false);
    }
    // If no consent yet, can't close without choosing
  }, []);

  const handleManageFromToast = useCallback(() => {
    setShowToast(false);
    setShowModal(true);
  }, []);

  return (
    <>
      {/* ── Banner ── */}
      <AnimatePresence>
        {showBanner && (
          <CookieBanner
            onAcceptAll={handleAcceptAll}
            onEssentialOnly={handleEssentialOnly}
            onCustomize={handleCustomize}
            onLearnMore={openCookieDocs}
          />
        )}
      </AnimatePresence>

      {/* ── Preferences Modal ── */}
      <AnimatePresence>
        {showModal && (
          <CookieModal
            prefs={prefs}
            onPrefsChange={setPrefs}
            onSave={handleSaveChoices}
            onAcceptAll={handleAcceptAll}
            onEssentialOnly={handleEssentialOnly}
            onClose={handleCloseModal}
            onLearnMore={openCookieDocs}
          />
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showToast && (
          <ConsentToast
            prefs={prefs}
            onManage={handleManageFromToast}
          />
        )}
      </AnimatePresence>
    </>
  );
}