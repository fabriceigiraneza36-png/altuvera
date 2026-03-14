// src/pages/PaymentTerms.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiShield,
  FiFileText,
  FiCalendar,
  FiXCircle,
  FiDownload,
  FiMail,
  FiPrinter,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiLock,
  FiGlobe,
  FiUsers,
  FiPercent,
  FiDollarSign,
  FiAward,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiArrowRight,
  FiArrowLeft,
  FiSend,
  FiInfo,
  FiRefreshCw,
  FiCreditCard,
  FiSmartphone,
  FiX,
  FiUser,
  FiCopy,
  FiCheck,
  FiEdit3,
  FiFlag,
  FiStar,
  FiEye,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import EmailAutocompleteInput from "../components/common/EmailAutocompleteInput";

/* ═══════════════════════════════════════════════════════
   ADMIN CONFIGURATION
   ═══════════════════════════════════════════════════════ */
const ADMIN = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 780 702 773",
  phone2: "+250 792 352 409",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792 352 409",
  email: "bookings@altuvera.com",
  office: "Kigali, Rwanda",
};

/* ═══════════════════════════════════════════════════════
   COUNTRIES LIST
   ═══════════════════════════════════════════════════════ */
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo (Republic of the)", "Congo (Democratic Republic of the)", "Cook Islands", "Costa Rica", "Cote d'Ivoire",
  "Croatia", "Cuba", "Cyprus", "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Western Sahara", "Yemen",
  "Zambia", "Zimbabwe",
  "State of Palestine",
  "Other"
];

/* ═══════════════════════════════════════════════════════
   GLOBAL CSS ANIMATIONS & UTILITIES
   ═══════════════════════════════════════════════════════ */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&display=swap');

  :root {
    --pt-emerald-50: #ECFDF5; --pt-emerald-100: #D1FAE5; --pt-emerald-200: #A7F3D0;
    --pt-emerald-500: #10B981; --pt-emerald-600: #059669; --pt-emerald-700: #047857;
    --pt-emerald-800: #065F46; --pt-emerald-900: #064E3B;
    --pt-gray-50: #F9FAFB; --pt-gray-100: #F3F4F6; --pt-gray-200: #E5E7EB;
    --pt-gray-300: #D1D5DB; --pt-gray-400: #9CA3AF; --pt-gray-500: #6B7280;
    --pt-gray-600: #4B5563; --pt-gray-700: #374151; --pt-gray-800: #1F2937;
    --pt-gray-900: #111827;
    --pt-red-500: #EF4444; --pt-red-50: #FEF2F2;
    --pt-amber-500: #F59E0B; --pt-amber-50: #FFFBEB;
    --pt-blue-500: #3B82F6; --pt-blue-50: #EFF6FF;
    --pt-violet-500: #8B5CF6; --pt-violet-50: #F5F3FF;
    --pt-pink-500: #EC4899; --pt-pink-50: #FDF2F8;
    --pt-radius-sm: 8px; --pt-radius-md: 14px; --pt-radius-lg: 20px;
    --pt-radius-xl: 28px; --pt-radius-full: 9999px;
    --pt-shadow-sm: 0 1px 3px rgba(0,0,0,.06);
    --pt-shadow-md: 0 4px 24px rgba(0,0,0,.06);
    --pt-shadow-lg: 0 12px 48px rgba(0,0,0,.08);
    --pt-shadow-xl: 0 24px 64px rgba(0,0,0,.12);
    --pt-transition: cubic-bezier(.4,0,.2,1);
  }

  .pt-root {
    background:
      radial-gradient(circle at 15% 0%, rgba(16,185,129,0.08) 0%, transparent 34%),
      radial-gradient(circle at 85% 12%, rgba(59,130,246,0.06) 0%, transparent 32%),
      #fafdf7;
  }

  .pt-nav button {
    backdrop-filter: saturate(130%) blur(6px);
  }

  .pt-section-card {
    border-radius: 24px;
    border: 1px solid #eef2ef;
    box-shadow: 0 12px 34px rgba(2, 44, 34, 0.08);
  }

  @keyframes pt-fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pt-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pt-scaleIn {
    from { opacity: 0; transform: scale(.88) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pt-slideRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pt-slideLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pt-backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pt-checkPop {
    0%   { transform: scale(0) rotate(-45deg); }
    60%  { transform: scale(1.3) rotate(0deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes pt-shake {
    0%, 100% { transform: translateX(0); }
    15%, 55% { transform: translateX(-8px); }
    35%, 75% { transform: translateX(8px); }
  }
  @keyframes pt-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .7; transform: scale(.97); }
  }
  @keyframes pt-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pt-successRing {
    0%   { transform: scale(0); opacity: 0; }
    50%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes pt-confetti {
    0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-60px) rotate(720deg); opacity: 0; }
  }
  @keyframes pt-progressPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,.3); }
    50%      { box-shadow: 0 0 0 8px rgba(5,150,105,0); }
  }
  @keyframes pt-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes pt-borderGlow {
    0%, 100% { border-color: rgba(5,150,105,.2); }
    50%      { border-color: rgba(5,150,105,.5); }
  }
  @keyframes pt-spin {
    to { transform: rotate(360deg); }
  }

  .pt-scroll::-webkit-scrollbar { height: 5px; }
  .pt-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.04); border-radius: 3px; }
  .pt-scroll::-webkit-scrollbar-thumb { background: #059669; border-radius: 3px; }

  .pt-field-valid   { border-color: #10B981 !important; }
  .pt-field-invalid { border-color: #EF4444 !important; }
  .pt-field-shake   { animation: pt-shake .45s ease !important; }

  @media print { .no-print { display: none !important; } body { background: #fff !important; } }

  @media (max-width: 1024px) {
    .pt-g3 { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .pt-g2  { grid-template-columns: 1fr !important; }
    .pt-g3  { grid-template-columns: 1fr !important; }
    .pt-nav { position: relative !important; top: 0 !important; }
    .pt-cbar { flex-direction: column !important; text-align: center !important; }
    .pt-stats { grid-template-columns: 1fr 1fr !important; }
    .pt-modal-inner { margin: 12px !important; max-height: 94vh !important; border-radius: 20px !important; }
    .pt-hero-btns { flex-direction: column !important; align-items: center !important; }
  }
  @media (max-width: 640px) {
    .pt-nav { padding: 0 12px !important; }
    .pt-nav button { padding: 9px 14px !important; font-size: 13px !important; }
    .pt-stats { gap: 12px !important; }
  }
  @media (max-width: 480px) {
    .pt-stats { grid-template-columns: 1fr !important; }
    .pt-modal-inner { margin: 8px !important; border-radius: 16px !important; }
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
`;

/* ═══════════════════════════════════════════════════════
   VALIDATION UTILITIES (REAL-TIME)
   ═══════════════════════════════════════════════════════ */
const Validators = {
  fullName: (v) => {
    if (!v.trim()) return "Full name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    if (v.trim().length > 60) return "Name must be under 60 characters";
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(v.trim()))
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    if (v.trim().split(/\s+/).length < 2)
      return "Please enter your full name (first and last)";
    return "";
  },
  username: (v) => {
    if (!v.trim()) return "Username is required";
    if (v.trim().length < 3) return "Username must be at least 3 characters";
    if (v.trim().length > 30) return "Username must be under 30 characters";
    if (!/^[a-zA-Z0-9_.-]+$/.test(v.trim()))
      return "Only letters, numbers, dots, hyphens, and underscores";
    if (/^[^a-zA-Z]/.test(v.trim()))
      return "Username must start with a letter";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
      return "Please enter a valid email address";
    return "";
  },
  phone: (v) => {
    if (!v.trim()) return "Phone number is required";
    const clean = v.replace(/[\s\-().]/g, "");
    if (!/^\+?\d{7,15}$/.test(clean))
      return "Enter a valid phone number (7-15 digits, optionally starting with +)";
    return "";
  },
  country: (v) => {
    if (!v) return "Please select your country";
    return "";
  },
  message: (v) => {
    if (v.trim().length > 500)
      return "Message must be under 500 characters";
    return "";
  },
};

/* ═══════════════════════════════════════════════════════
   REUSABLE FLOATING INPUT COMPONENT
   ═══════════════════════════════════════════════════════ */
const FloatingField = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  error,
  isValid,
  touched,
  placeholder,
  required = false,
  maxLength,
  autoComplete,
  inputRef,
  disabled = false,
  helpText,
  as = "input",
  options = [],
  rows = 3,
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const showError = touched && error;
  const showValid = touched && isValid && !error;

  const fieldStyle = {
    width: "100%",
    padding: as === "select" ? "16px 44px 16px 46px" : "16px 44px 16px 46px",
    borderRadius: "14px",
    border: `2px solid ${
      showError ? "#EF4444" : showValid ? "#10B981" : focused ? "#059669" : "#E5E7EB"
    }`,
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.25s var(--pt-transition)",
    backgroundColor: disabled ? "#F9FAFB" : focused ? "#fff" : "#FAFBFC",
    boxSizing: "border-box",
    color: "#111827",
    WebkitAppearance: as === "select" ? "none" : undefined,
    appearance: as === "select" ? "none" : undefined,
    resize: as === "textarea" ? "vertical" : undefined,
    boxShadow: focused
      ? `0 0 0 4px ${showError ? "rgba(239,68,68,.08)" : "rgba(5,150,105,.08)"}`
      : "none",
  };

  return (
    <div style={{ marginBottom: "22px", position: "relative" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: "700",
          color: showError ? "#EF4444" : showValid ? "#059669" : "#374151",
          marginBottom: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          transition: "color 0.2s",
        }}
      >
        {Icon && <Icon size={13} />}
        {label}
        {required && (
          <span style={{ color: "#EF4444", fontSize: "14px", lineHeight: 1 }}>
            *
          </span>
        )}
      </label>

      <div style={{ position: "relative" }}>
        {/* Left icon */}
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: as === "textarea" ? "18px" : "50%",
            transform: as === "textarea" ? "none" : "translateY(-50%)",
            color: showError
              ? "#EF4444"
              : showValid
              ? "#10B981"
              : focused
              ? "#059669"
              : "#9CA3AF",
            transition: "color 0.2s",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {Icon && <Icon size={18} />}
        </div>

        {/* Field */}
        {as === "textarea" ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            rows={rows}
            style={fieldStyle}
          />
        ) : as === "select" ? (
          <select
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            style={{ ...fieldStyle, cursor: "pointer" }}
          >
            <option value="">{placeholder || "Select..."}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          type === "email" ? (
            <EmailAutocompleteInput
              ref={inputRef}
              value={value}
              onValueChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              autoComplete={autoComplete}
              maxLength={maxLength}
              disabled={disabled}
              style={fieldStyle}
              aria-invalid={Boolean(showError)}
            />
          ) : (
            <input
              ref={inputRef}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              autoComplete={autoComplete}
              maxLength={maxLength}
              disabled={disabled}
              style={fieldStyle}
            />
          )
        )}

        {/* Right status icon */}
        <div
          style={{
            position: "absolute",
            right: as === "select" ? "36px" : "16px",
            top: as === "textarea" ? "18px" : "50%",
            transform: as === "textarea" ? "none" : "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {showValid && (
            <FiCheckCircle
              size={18}
              color="#10B981"
              style={{ animation: "pt-checkPop 0.35s ease" }}
            />
          )}
          {showError && (
            <FiAlertCircle
              size={18}
              color="#EF4444"
              style={{ animation: "pt-checkPop 0.35s ease" }}
            />
          )}
        </div>

        {/* Select chevron */}
        {as === "select" && (
          <div
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#9CA3AF",
            }}
          >
            <FiChevronDown size={18} />
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: "6px",
            fontSize: "12px",
            color: "#EF4444",
            fontWeight: "500",
            animation: "pt-fadeUp 0.25s ease",
          }}
        >
          <FiAlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Help text */}
      {helpText && !showError && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <FiInfo size={11} />
          {helpText}
        </div>
      )}

      {/* Character count for textarea */}
      {as === "textarea" && maxLength && (
        <div
          style={{
            position: "absolute",
            bottom: "-18px",
            right: "4px",
            fontSize: "11px",
            color:
              value.length > maxLength * 0.9
                ? "#EF4444"
                : value.length > maxLength * 0.7
                ? "#F59E0B"
                : "#9CA3AF",
            fontWeight: "500",
          }}
        >
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   STEP PROGRESS INDICATOR
   ═══════════════════════════════════════════════════════ */
const StepProgress = ({ currentStep, totalSteps, stepLabels }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "24px", padding: "0 8px" }}>
    {Array.from({ length: totalSteps }, (_, i) => {
      const stepNum = i + 1;
      const isCompleted = stepNum < currentStep;
      const isCurrent = stepNum === currentStep;
      const isUpcoming = stepNum > currentStep;

      return (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: "0 0 auto" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "700",
                transition: "all 0.4s var(--pt-transition)",
                backgroundColor: isCompleted
                  ? "#059669"
                  : isCurrent
                  ? "#064E3B"
                  : "#F3F4F6",
                color: isCompleted || isCurrent ? "#fff" : "#9CA3AF",
                boxShadow: isCurrent
                  ? "0 0 0 4px rgba(5,150,105,.15)"
                  : "none",
                animation: isCurrent ? "pt-progressPulse 2s infinite" : "none",
              }}
            >
              {isCompleted ? (
                <FiCheck size={16} style={{ animation: "pt-checkPop 0.35s ease" }} />
              ) : (
                stepNum
              )}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isCurrent ? "700" : "500",
                color: isCurrent ? "#059669" : isCompleted ? "#059669" : "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
                transition: "all 0.3s",
              }}
            >
              {stepLabels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div
              style={{
                flex: "1 1 auto",
                height: "3px",
                margin: "0 4px",
                marginBottom: "20px",
                borderRadius: "2px",
                backgroundColor: "#F3F4F6",
                position: "relative",
                overflow: "hidden",
                minWidth: "20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                  backgroundColor: "#059669",
                  borderRadius: "2px",
                  transition: "width 0.6s var(--pt-transition)",
                }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════
   MULTI-STEP CONTACT MODAL
   Steps: 1) Personal  2) Contact  3) Preferences  4) Review  5) Success
   ═══════════════════════════════════════════════════════ */
const MultiStepContactModal = ({ isOpen, onClose, contextMessage }) => {
  const TOTAL_STEPS = 5;
  const STEP_LABELS = ["Personal", "Contact", "Preference", "Review", "Done"];

  const [step, setStep] = useState(1);
  const styles = {
    contactText: {
      fontSize: "15px",
      lineHeight: "1.6",
    },
  };
  const [slideDir, setSlideDir] = useState("right");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form data
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    paymentMethod: "",
    message: "",
  });

  // Track which fields have been interacted with
  const [touched, setTouched] = useState({});
  // Shake animation trigger
  const [shakeFields, setShakeFields] = useState({});

  const nameRef = useRef(null);

  // ── Reset on open ──
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSlideDir("right");
      setTouched({});
      setShakeFields({});
      setCopied(false);
      setIsSubmitting(false);
      setTimeout(() => nameRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Escape to close ──
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ── Lock body scroll ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Real-time field update ──
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setShakeFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  // ── Validation per field ──
  const getError = useCallback((field) => {
    const v = form[field];
    if (Validators[field]) return Validators[field](v);
    return "";
  }, [form]);

  const isFieldValid = useCallback(
    (field) => touched[field] && !getError(field),
    [touched, getError]
  );

  // ── Validate a step ──
  const validateStep = useCallback(
    (s) => {
      const fieldsPerStep = {
        1: ["fullName", "username"],
        2: ["email", "phone", "country"],
        3: [], // paymentMethod is optional at this stage
      };
      const fields = fieldsPerStep[s] || [];
      let valid = true;
      const newTouched = { ...touched };
      const newShake = {};
      for (const f of fields) {
        newTouched[f] = true;
        const err = getError(f);
        if (err) {
          valid = false;
          newShake[f] = true;
        }
      }
      setTouched(newTouched);
      if (!valid) {
        setShakeFields(newShake);
        setTimeout(() => setShakeFields({}), 500);
      }
      return valid;
    },
    [touched, getError]
  );

  // ── Navigation ──
  const goNext = useCallback(() => {
    if (step < 4 && !validateStep(step)) return;
    if (step === 4) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSlideDir("right");
        setStep(5);
      }, 1200);
      return;
    }
    setSlideDir("right");
    setStep((p) => Math.min(p + 1, TOTAL_STEPS));
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setSlideDir("left");
    setStep((p) => Math.max(p - 1, 1));
  }, []);

  // ── Composed message ──
  const composedMessage = useMemo(() => {
    const greeting = `Hello ${ADMIN.name}! 👋`;
    const intro = `\n\nMy name is *${form.fullName.trim() || "___"}* (@${form.username.trim() || "___"})`;
    const contact = `\nEmail: ${form.email.trim() || "___"}\nPhone: ${form.phone.trim() || "___"}\nCountry: ${form.country || "___"}`;
    const method = form.paymentMethod
      ? `\nPreferred Payment: *${form.paymentMethod}*`
      : "";
    const ctx = contextMessage
      ? `\n\n${contextMessage}`
      : "\n\nI'd like to discuss booking and payment details for a safari with Altuvera.";
    const note = form.message.trim()
      ? `\n\nAdditional Note: ${form.message.trim()}`
      : "";
    return greeting + intro + contact + method + ctx + note + "\n\nThank you!";
  }, [form, contextMessage]);

  const waLink = useMemo(
    () =>
      `https://wa.me/${ADMIN.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(composedMessage)}`,
    [composedMessage]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(composedMessage);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = composedMessage;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [composedMessage]);

  // ── Step completion percentage ──
  const completionPercent = useMemo(() => {
    const allFields = ["fullName", "username", "email", "phone", "country"];
    const validCount = allFields.filter(
      (f) => !Validators[f]?.(form[f])
    ).length;
    return Math.round((validCount / allFields.length) * 100);
  }, [form]);

  if (!isOpen) return null;

  const animationName =
    slideDir === "right" ? "pt-slideRight" : "pt-slideLeft";

  // Step header configs
  const stepHeaders = {
    1: {
      bg: "linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)",
      icon: <FiUser size={28} />,
      title: "Personal Information",
      subtitle: "Tell us who you are so we can personalize your experience",
    },
    2: {
      bg: "linear-gradient(135deg, #0E7490 0%, #0891B2 50%, #06B6D4 100%)",
      icon: <FiPhone size={28} />,
      title: "Contact Details",
      subtitle: "How should our booking manager reach you?",
    },
    3: {
      bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)",
      icon: <FiCreditCard size={28} />,
      title: "Booking Preferences",
      subtitle: "Select your preferred payment method and add any notes",
    },
    4: {
      bg: "linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)",
      icon: <FiEye size={28} />,
      title: "Review & Confirm",
      subtitle: "Double-check your details before we connect you with Fabrice",
    },
    5: {
      bg: "linear-gradient(135deg, #128C7E 0%, #25D366 100%)",
      icon: <FaWhatsapp size={30} />,
      title: "You're All Set!",
      subtitle: `Send the message below to ${ADMIN.name} on WhatsApp`,
    },
  };

  const header = stepHeaders[step];

  const paymentOptions = [
    { id: "mtn", label: "MTN Mobile Money", icon: "📱" },
    { id: "airtel", label: "Airtel Money", icon: "📱" },
    { id: "mpesa", label: "M-Pesa", icon: "📲" },
    { id: "bank", label: "Bank Transfer (SWIFT)", icon: "🏦" },
    { id: "card", label: "Credit / Debit Card", icon: "💳" },
    { id: "western", label: "Western Union / MoneyGram", icon: "🌐" },
    { id: "other", label: "Other / Discuss", icon: "💬" },
  ];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "pt-backdropIn 0.25s ease",
        padding: "16px",
      }}
    >
      <div
        className="pt-modal-inner"
        role="dialog"
        aria-modal="true"
        aria-label="Contact Form"
        style={{
          width: "100%",
          maxWidth: step === 5 ? "560px" : "520px",
          backgroundColor: "#fff",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.05)",
          animation: "pt-scaleIn 0.35s var(--pt-transition)",
          transition: "max-width 0.4s var(--pt-transition)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            background: header.bg,
            padding: "28px 28px 24px",
            textAlign: "center",
            color: "#fff",
            position: "relative",
            flexShrink: 0,
            transition: "background 0.5s ease",
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,.25)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,.12)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            <FiX size={18} />
          </button>

          {step < 5 && (
            <StepProgress
              currentStep={step}
              totalSteps={4}
              stepLabels={STEP_LABELS.slice(0, 4)}
            />
          )}

          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "rgba(255,255,255,.15)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "8px auto 14px",
              transition: "all 0.3s",
            }}
          >
            {header.icon}
          </div>

          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            {header.title}
          </h3>
          <p style={{ fontSize: "13px", opacity: 0.85, lineHeight: 1.5, maxWidth: "380px", margin: "0 auto" }}>
            {header.subtitle}
          </p>

          {step < 5 && (
            <div
              style={{
                marginTop: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                backgroundColor: "rgba(255,255,255,.15)",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              <FiCheckCircle size={12} />
              {completionPercent}% Complete
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div
          style={{
            padding: "28px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* ════ STEP 1: PERSONAL ════ */}
          {step === 1 && (
            <div key="step1" style={{ animation: `${animationName} 0.35s ease` }}>
              <FloatingField
                label="Full Name"
                icon={FiUser}
                value={form.fullName}
                onChange={(v) => updateField("fullName", v)}
                error={getError("fullName")}
                isValid={isFieldValid("fullName")}
                touched={touched.fullName}
                placeholder="e.g. John Smith"
                required
                autoComplete="name"
                inputRef={nameRef}
                helpText="Enter your first and last name"
              />
              <FloatingField
                label="Username"
                icon={FiEdit3}
                value={form.username}
                onChange={(v) => updateField("username", v)}
                error={getError("username")}
                isValid={isFieldValid("username")}
                touched={touched.username}
                placeholder="e.g. john.smith"
                required
                maxLength={30}
                autoComplete="username"
                helpText="Letters, numbers, dots, hyphens, underscores"
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "14px 16px",
                  backgroundColor: "#F0FDF4",
                  borderRadius: "12px",
                  fontSize: "13px",
                  color: "#065F46",
                  lineHeight: 1.6,
                  border: "1px solid #D1FAE5",
                }}
              >
                <FiLock
                  size={15}
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span>
                  Your information is only used to compose your WhatsApp
                  message. Nothing is stored or shared with third parties.
                </span>
              </div>
            </div>
          )}

          {/* ════ STEP 2: CONTACT ════ */}
          {step === 2 && (
            <div key="step2" style={{ animation: `${animationName} 0.35s ease` }}>
              <FloatingField
                label="Email Address"
                icon={FiMail}
                type="email"
                value={form.email}
                onChange={(v) => updateField("email", v)}
                error={getError("email")}
                isValid={isFieldValid("email")}
                touched={touched.email}
                placeholder="e.g. john@email.com"
                required
                autoComplete="email"
              />
              <FloatingField
                label="Phone Number"
                icon={FiPhone}
                type="tel"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                error={getError("phone")}
                isValid={isFieldValid("phone")}
                touched={touched.phone}
                placeholder="e.g. +1 234 567 8900"
                required
                autoComplete="tel"
                helpText="Include country code for international numbers"
              />
              <FloatingField
                label="Country / Region"
                icon={FiFlag}
                as="select"
                value={form.country}
                onChange={(v) => updateField("country", v)}
                error={getError("country")}
                isValid={isFieldValid("country")}
                touched={touched.country}
                placeholder="Select your country..."
                required
                options={COUNTRIES}
              />
            </div>
          )}

          {/* ════ STEP 3: PREFERENCES ════ */}
          {step === 3 && (
            <div key="step3" style={{ animation: `${animationName} 0.35s ease` }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                <FiCreditCard size={13} />
                Preferred Payment Method
                <span style={{ fontSize: "11px", fontWeight: "500", color: "#9CA3AF", textTransform: "none", letterSpacing: "0" }}>
                  (optional)
                </span>
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                {paymentOptions.map((opt) => {
                  const sel = form.paymentMethod === opt.label;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        updateField(
                          "paymentMethod",
                          sel ? "" : opt.label
                        )
                      }
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        padding: "16px 10px",
                        borderRadius: "14px",
                        border: sel
                          ? "2px solid #059669"
                          : "2px solid #F3F4F6",
                        backgroundColor: sel ? "#ECFDF5" : "#FAFBFC",
                        cursor: "pointer",
                        transition: "all 0.25s var(--pt-transition)",
                        position: "relative",
                        overflow: "hidden",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: sel ? "#065F46" : "#4B5563",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseOver={(e) => {
                        if (!sel) {
                          e.currentTarget.style.borderColor = "#D1FAE5";
                          e.currentTarget.style.backgroundColor = "#F0FDF4";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!sel) {
                          e.currentTarget.style.borderColor = "#F3F4F6";
                          e.currentTarget.style.backgroundColor = "#FAFBFC";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {sel && (
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#059669",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "pt-checkPop 0.35s ease",
                          }}
                        >
                          <FiCheck size={11} color="#fff" />
                        </div>
                      )}
                      <span style={{ fontSize: "22px" }}>{opt.icon}</span>
                      <span style={{ textAlign: "center", lineHeight: 1.3 }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <FloatingField
                label="Additional Message"
                icon={FiMessageCircle}
                as="textarea"
                value={form.message}
                onChange={(v) => updateField("message", v)}
                error={getError("message")}
                isValid={!getError("message") && form.message.trim().length > 0}
                touched={touched.message}
                placeholder="e.g. Interested in a 5-day gorilla trekking safari for 2 in July..."
                rows={3}
                maxLength={500}
                helpText="Share any details about your dream safari"
              />
            </div>
          )}

          {/* ════ STEP 4: REVIEW ════ */}
          {step === 4 && (
            <div key="step4" style={{ animation: `${animationName} 0.35s ease` }}>
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "18px",
                  padding: "24px",
                  marginBottom: "20px",
                  border: "1px solid #F3F4F6",
                }}
              >
                {[
                  { icon: <FiUser size={16} />, label: "Full Name", value: form.fullName },
                  { icon: <FiEdit3 size={16} />, label: "Username", value: `@${form.username}` },
                  { icon: <FiMail size={16} />, label: "Email", value: form.email },
                  { icon: <FiPhone size={16} />, label: "Phone", value: form.phone },
                  { icon: <FiFlag size={16} />, label: "Country", value: form.country },
                  {
                    icon: <FiCreditCard size={16} />,
                    label: "Payment Method",
                    value: form.paymentMethod || "Not specified",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 0",
                      borderBottom:
                        i < 5 ? "1px solid #E5E7EB" : "none",
                      animation: `pt-fadeUp 0.3s ease ${i * 0.06}s both`,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#059669",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "2px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#111827",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.value || "—"}
                      </div>
                    </div>
                  </div>
                ))}

                {form.message.trim() && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px 16px",
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      animation: "pt-fadeUp 0.3s ease 0.36s both",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiMessageCircle size={12} />
                      Message
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#4B5563",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {form.message}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSlideDir("left");
                  setStep(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#6B7280",
                  transition: "all 0.2s",
                  margin: "0 auto 4px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#059669";
                  e.currentTarget.style.color = "#059669";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#6B7280";
                }}
              >
                <FiEdit3 size={13} />
                Edit Details
              </button>
            </div>
          )}

          {/* ════ STEP 5: SUCCESS ════ */}
          {step === 5 && (
            <div key="step5" style={{ animation: "pt-fadeUp 0.4s ease" }}>
              {/* Admin Card */}
              <div
                style={{
                  padding: "24px",
                  background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)",
                  borderRadius: "20px",
                  border: "1px solid #D1FAE5",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #059669, #047857)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    color: "#fff",
                    fontSize: "22px",
                    fontWeight: "700",
                    fontFamily: "'Playfair Display', serif",
                    boxShadow: "0 6px 20px rgba(5,150,105,.25)",
                    animation: "pt-successRing 0.5s ease",
                  }}
                >
                  IF
                </div>
                <h4
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: "4px",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {ADMIN.name}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#059669",
                    fontWeight: "600",
                    marginBottom: "14px",
                  }}
                >
                  Altuvera Booking Manager
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 24px",
                    backgroundColor: "#fff",
                    borderRadius: "50px",
                    border: "2px solid #059669",
                    boxShadow: "0 4px 16px rgba(5,150,105,.12)",
                  }}
                >
                  <FaWhatsapp size={20} color="#25D366" />
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#064E3B",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {ADMIN.whatsappDisplay}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "12px" }}>
                  Save this number and send the message below
                </p>
              </div>

              {/* Pre-composed message */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiMessageCircle size={13} />
                    Your Composed Message
                  </label>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      backgroundColor: copied ? "#ECFDF5" : "#F9FAFB",
                      border: copied ? "1px solid #059669" : "1px solid #E5E7EB",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: copied ? "#059669" : "#6B7280",
                      transition: "all 0.2s",
                    }}
                  >
                    {copied ? (
                      <>
                        <FiCheck size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div
                  style={{
                    padding: "18px 20px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "14px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "'Inter', sans-serif",
                    maxHeight: "180px",
                    overflowY: "auto",
                    transition: "background 0.3s",
                    ...(copied ? { background: "#ECFDF5" } : {}),
                  }}
                >
                  {composedMessage}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    padding: "16px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "16px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 8px 28px rgba(37,211,102,.3)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 36px rgba(37,211,102,.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,211,102,.3)";
                  }}
                >
                  <FaWhatsapp size={22} />
                  Open WhatsApp
                </a>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "14px",
                    backgroundColor: "#fff",
                    color: "#064E3B",
                    border: "2px solid #D1FAE5",
                    borderRadius: "16px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#F0FDF4";
                    e.currentTarget.style.borderColor = "#059669";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.borderColor = "#D1FAE5";
                  }}
                >
                  <FiCopy size={16} />
                  {copied
                    ? "Copied! Paste in WhatsApp"
                    : "Copy Message & Send Manually"}
                </button>
              </div>

              {/* Instructions */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px 18px",
                  backgroundColor: "#FFFBEB",
                  borderRadius: "14px",
                  border: "1px solid #FEF3C7",
                  fontSize: "13px",
                  color: "#92400E",
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <FiInfo size={14} />
                  How to send from your phone:
                </strong>
                <ol style={{ margin: 0, paddingLeft: "18px" }}>
                  <li>
                    Save <strong>{ADMIN.whatsappDisplay}</strong> to your
                    contacts
                  </li>
                  <li>
                    Open WhatsApp and find "
                    <strong>{ADMIN.name}</strong>"
                  </li>
                  <li>Tap "Copy Message" above, then paste and send</li>
                </ol>
              </div>
            </div>
          )}

          {/* ── FOOTER NAVIGATION ── */}
          {step < 5 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: step === 1 ? "flex-end" : "space-between",
                gap: "12px",
                marginTop: "8px",
                paddingTop: "16px",
                borderTop: "1px solid #F3F4F6",
              }}
            >
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 24px",
                    backgroundColor: "transparent",
                    color: "#6B7280",
                    border: "2px solid #E5E7EB",
                    borderRadius: "14px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "all 0.25s",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#9CA3AF";
                    e.currentTarget.style.color = "#374151";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#6B7280";
                  }}
                >
                  <FiArrowLeft size={16} />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 32px",
                  background:
                    step === 4
                      ? "linear-gradient(135deg, #25D366, #128C7E)"
                      : "linear-gradient(135deg, #064E3B, #047857)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "14px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontWeight: "700",
                  transition: "all 0.3s",
                  boxShadow:
                    step === 4
                      ? "0 6px 24px rgba(37,211,102,.25)"
                      : "0 6px 24px rgba(6,78,59,.2)",
                  fontFamily: "'Inter', sans-serif",
                  opacity: isSubmitting ? 0.7 : 1,
                  flex: step === 1 ? "none" : undefined,
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      step === 4
                        ? "0 10px 32px rgba(37,211,102,.35)"
                        : "0 10px 32px rgba(6,78,59,.3)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    step === 4
                      ? "0 6px 24px rgba(37,211,102,.25)"
                      : "0 6px 24px rgba(6,78,59,.2)";
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid rgba(255,255,255,.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "pt-spin 0.6s linear infinite",
                      }}
                    />
                    Preparing...
                  </>
                ) : step === 4 ? (
                  <>
                    <FaWhatsapp size={18} />
                    Get WhatsApp Contact
                  </>
                ) : (
                  <>
                    Continue
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Close / start over in step 5 */}
          {step === 5 && (
            <button
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                background: "none",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#9CA3AF";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#6B7280";
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TERM CARD COMPONENT
   ═══════════════════════════════════════════════════════ */
const TermCard = React.memo(({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  return (
    <article
      onClick={() => setExpanded((p) => !p)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(e) => e.key === "Enter" && setExpanded((p) => !p)}
      style={{
        position: "relative",
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "32px 28px 52px",
        border: "1px solid #F3F4F6",
        boxShadow: "var(--pt-shadow-md)",
        cursor: "pointer",
        transition: "all 0.4s var(--pt-transition)",
        overflow: "hidden",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 20px 50px ${item.color}12`;
        e.currentTarget.style.borderColor = `${item.color}30`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--pt-shadow-md)";
        e.currentTarget.style.borderColor = "#F3F4F6";
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${item.color}, ${item.color}55)`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "18px",
          backgroundColor: item.bgColor,
          color: item.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          transition: "transform 0.3s",
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "20px",
          fontWeight: "700",
          color: "#111827",
          marginBottom: "12px",
          lineHeight: 1.3,
        }}
      >
        {item.title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "#4B5563",
          lineHeight: 1.7,
          marginBottom: expanded ? "16px" : "0",
        }}
      >
        {item.text}
      </p>

      {expanded && (
        <div
          style={{
            padding: "16px 18px",
            backgroundColor: "#F9FAFB",
            borderRadius: "14px",
            borderLeft: `3px solid ${item.color}`,
            fontSize: "13px",
            color: "#6B7280",
            lineHeight: 1.7,
            animation: "pt-fadeUp 0.3s ease",
          }}
        >
          <FiInfo
            size={14}
            style={{ marginRight: "8px", color: item.color, verticalAlign: "middle" }}
          />
          {item.details}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "18px",
          right: "22px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "12px",
          color: "#9CA3AF",
          fontWeight: "500",
          transition: "color 0.2s",
        }}
      >
        {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        {expanded ? "Less" : "Details"}
      </div>
    </article>
  );
});
TermCard.displayName = "TermCard";

/* ═══════════════════════════════════════════════════════
   FAQ ITEM COMPONENT
   ═══════════════════════════════════════════════════════ */
const FaqItem = React.memo(({ faq, index, isOpen, onToggle }) => (
  <div style={{ borderBottom: "1px solid #F3F4F6" }}>
    <button
      onClick={() => onToggle(index)}
      aria-expanded={isOpen}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        padding: "22px 0",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "17px",
          fontWeight: "600",
          color: isOpen ? "#059669" : "#111827",
          transition: "color 0.25s",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {faq.question}
      </span>
      <span
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          backgroundColor: isOpen ? "#ECFDF5" : "#F9FAFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: isOpen ? "#059669" : "#9CA3AF",
          transition: "all 0.3s",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <FiChevronDown size={16} />
      </span>
    </button>
    {isOpen && (
      <div
        style={{
          paddingBottom: "22px",
          paddingRight: "50px",
          color: "#4B5563",
          fontSize: "15px",
          lineHeight: 1.8,
          animation: "pt-fadeUp 0.3s ease",
        }}
      >
        {faq.answer}
      </div>
    )}
  </div>
));
FaqItem.displayName = "FaqItem";

/* ═══════════════════════════════════════════════════════
   MAIN PAYMENT TERMS PAGE
   ═══════════════════════════════════════════════════════ */
const PaymentTerms = () => {
  const [activeNav, setActiveNav] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState(null);
  const [declarationNote, setDeclarationNote] = useState("");
  const [gateOpen, setGateOpen] = useState(false);
  const [gateContext, setGateContext] = useState("");
  const trackRef = useRef(null);

  // ── Scroll spy + scroll-to-top visibility ──
  useEffect(() => {
    const handler = () => {
      setShowScrollTop(window.scrollY > 600);
      const sections = [
        "overview",
        "process",
        "methods",
        "cancellation",
        "faq",
      ];
      for (const id of sections) {
        const el = document.getElementById(`pt-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveNav(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = useCallback((id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleFaq = useCallback(
    (i) => setExpandedFaq((p) => (p === i ? null : i)),
    []
  );

  const openGate = useCallback((ctx) => {
    setGateContext(ctx || "");
    setGateOpen(true);
  }, []);

  const handleDeclaration = useCallback(() => {
    if (!preferredMethod) return;
    const methodObj = paymentMethods.find((x) => x.id === preferredMethod);
    const m = methodObj?.name || preferredMethod;
    const note = declarationNote.trim()
      ? `\nNote: ${declarationNote.trim()}`
      : "";
    openGate(
      `I'd like to declare my preferred payment method: *${m}*${note}\n\nPlease contact me to finalize my booking.`
    );
  }, [preferredMethod, declarationNote, openGate]);

  // ═══════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════
  const navItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: <FiFileText size={15} /> },
      { id: "process", label: "How It Works", icon: <FiRefreshCw size={15} /> },
      { id: "methods", label: "Payment", icon: <FiCreditCard size={15} /> },
      { id: "cancellation", label: "Cancellation", icon: <FiXCircle size={15} /> },
      { id: "faq", label: "FAQ", icon: <FiHelpCircle size={15} /> },
    ],
    []
  );

  const terms = useMemo(
    () => [
      {
        icon: FiCheckCircle,
        title: "Booking Confirmation",
        text: "Your safari is confirmed once we agree on all details via WhatsApp with our booking manager, IGIRANEZA Fabrice. A 30% deposit secures your experience.",
        details:
          "After your WhatsApp consultation with Fabrice, you'll receive a personalized itinerary and invoice. Your deposit secures gorilla permits, accommodations, and guide services.",
        color: "#059669",
        bgColor: "#ECFDF5",
      },
      {
        icon: FiClock,
        title: "Balance Payment",
        text: "The remaining 70% is due 30 days before travel. For bookings within 30 days, full payment is discussed directly with Fabrice.",
        details:
          "We send a reminder 45 days before departure. Payment timelines are flexible — just discuss with Fabrice on WhatsApp.",
        color: "#F59E0B",
        bgColor: "#FFFBEB",
      },
      {
        icon: FiShield,
        title: "Secure & Personal",
        text: "Every transaction is handled personally by IGIRANEZA Fabrice. No automated charges — you control when and how you pay.",
        details:
          "Your payment details are never stored on our website. All financial discussions happen securely via WhatsApp or email directly with Fabrice.",
        color: "#3B82F6",
        bgColor: "#EFF6FF",
      },
      {
        icon: FiPercent,
        title: "Group Discounts",
        text: "Groups of 4+ enjoy special rates. Contact Fabrice for a custom quote tailored to your group size.",
        details:
          "4–6: 5% off | 7–10: 10% off | 11+: 15% off + complimentary guide. Discussed during your WhatsApp consultation.",
        color: "#8B5CF6",
        bgColor: "#F5F3FF",
      },
      {
        icon: FiHeart,
        title: "Flexible Rescheduling",
        text: "Reschedule once free with 45+ days' notice — just message Fabrice on WhatsApp.",
        details:
          "Changes within 45–30 days: 10% admin fee. Within 30 days: standard cancellation applies. We always find the best solution.",
        color: "#EC4899",
        bgColor: "#FDF2F8",
      },
      {
        icon: FiAward,
        title: "Price Guarantee",
        text: "The price Fabrice quotes is the price you pay. No hidden fees, no surprise charges — ever.",
        details:
          "Includes park fees, permits, accommodation, transport, meals as specified, and guide. Excludes flights, visas, insurance, tips.",
        color: "#059669",
        bgColor: "#ECFDF5",
      },
    ],
    []
  );

  const processSteps = useMemo(
    () => [
      {
        step: "01",
        icon: <FiMessageCircle size={28} />,
        title: "Message Fabrice",
        desc: `Save ${ADMIN.whatsappDisplay} and send a message about your dream safari — dates, interests, group size, and budget.`,
        color: "#059669",
      },
      {
        step: "02",
        icon: <FiCalendar size={28} />,
        title: "Receive Your Itinerary",
        desc: "Fabrice crafts a personalized itinerary and detailed quote. You'll refine every detail together.",
        color: "#0891B2",
      },
      {
        step: "03",
        icon: <FiCreditCard size={28} />,
        title: "Declare Payment Method",
        desc: "Choose MTN MoMo, M-Pesa, bank transfer, credit card, or others. No payment on our website.",
        color: "#7C3AED",
      },
      {
        step: "04",
        icon: <FiDollarSign size={28} />,
        title: "Confirm with Deposit",
        desc: "Pay 30% through your chosen method. Fabrice confirms receipt and your safari is officially booked!",
        color: "#F59E0B",
      },
      {
        step: "05",
        icon: <FiCheckCircle size={28} />,
        title: "Pay Balance & Travel",
        desc: "Complete the remaining balance 30 days before departure. Your East African adventure awaits!",
        color: "#EC4899",
      },
    ],
    []
  );

  const paymentMethods = useMemo(
    () => [
      {
        id: "mtn",
        name: "MTN Mobile Money",
        icon: <FiSmartphone size={24} />,
        desc: "Send to our MTN MoMo number. Fabrice confirms instantly via WhatsApp.",
        popular: true,
        color: "#FFCB05",
        region: "Rwanda, Uganda",
      },
      {
        id: "airtel",
        name: "Airtel Money",
        icon: <FiSmartphone size={24} />,
        desc: "Quick transfer via Airtel Money across East Africa.",
        popular: false,
        color: "#ED1C24",
        region: "Uganda, Kenya, Rwanda",
      },
      {
        id: "bank",
        name: "Bank Transfer (SWIFT)",
        icon: <FiDollarSign size={24} />,
        desc: "International wire to our business account. Ideal for large bookings.",
        popular: false,
        color: "#1E40AF",
        region: "Worldwide",
      },
      {
        id: "card",
        name: "Credit / Debit Card",
        icon: <FiCreditCard size={24} />,
        desc: "Visa, Mastercard, Amex. 4% fee. Secure link sent via WhatsApp.",
        popular: false,
        color: "#7C3AED",
        region: "Worldwide",
      },
      {
        id: "mpesa",
        name: "M-Pesa",
        icon: <FiSmartphone size={24} />,
        desc: "Kenya & Tanzania's leading mobile money. Fast and reliable.",
        popular: true,
        color: "#4CAF50",
        region: "Kenya, Tanzania",
      },
      {
        id: "western",
        name: "Western Union / MoneyGram",
        icon: <FiGlobe size={24} />,
        desc: "Cash pickup available. Details shared by Fabrice via WhatsApp.",
        popular: false,
        color: "#F59E0B",
        region: "Worldwide",
      },
    ],
    []
  );

  const cancellationTiers = useMemo(
    () => [
      { period: "60+ days", refund: "Full refund minus deposit", percent: "70%", color: "#059669" },
      { period: "45–59 days", refund: "60% refund of total", percent: "60%", color: "#10B981" },
      { period: "30–44 days", refund: "40% refund of total", percent: "40%", color: "#F59E0B" },
      { period: "15–29 days", refund: "20% refund of total", percent: "20%", color: "#F97316" },
      { period: "8–14 days", refund: "10% refund of total", percent: "10%", color: "#EF4444" },
      { period: "0–7 days", refund: "No refund", percent: "0%", color: "#DC2626" },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        question: "How does the payment process work at Altuvera?",
        answer: `Altuvera uses a personal, WhatsApp-based system. You'll chat directly with our booking manager IGIRANEZA Fabrice (${ADMIN.whatsappDisplay}), discuss your safari, declare your preferred payment method, and receive private payment instructions. Nothing is processed on our website.`,
      },
      {
        question: "Why doesn't Altuvera process payments on the website?",
        answer:
          "We believe in a personal approach. Every safari is unique, and we ensure your experience is tailored before any payment. Chatting with Fabrice first lets us answer all questions and customize everything.",
      },
      {
        question: "Who is IGIRANEZA Fabrice?",
        answer:
          "Fabrice is Altuvera's dedicated booking manager. He personally handles every inquiry, itinerary, and payment arrangement. When you message us on WhatsApp, you're speaking directly with him — not a chatbot.",
      },
      {
        question: "Are gorilla and chimpanzee permits refundable?",
        answer:
          "No. Permits from UWA (Uganda), RDB (Rwanda), or ICCN (DRC) are 100% non-refundable once purchased. Fabrice can assist with date changes subject to availability (60+ days' notice).",
      },
      {
        question: "What's included in the safari price?",
        answer:
          "Typically: accommodation, park fees, permits, professional guide, 4×4 vehicle, water, meals as specified, and transfers. Excluded: flights, visas, insurance, gratuities, personal expenses.",
      },
      {
        question: "Can I pay in my local currency?",
        answer:
          "Yes! We quote in USD but accept EUR, GBP, UGX, RWF, KES, TZS at prevailing rates. Tell Fabrice your preferred currency.",
      },
      {
        question: "What if I need to cancel or change dates?",
        answer:
          "With 45+ days' notice, reschedule once free. Cancellation refunds depend on notice period (see table). Message Fabrice and he'll find the best solution.",
      },
      {
        question: "Is my payment information safe?",
        answer:
          "Yes. We don't process or store payments on our website. Instructions are shared privately by Fabrice via WhatsApp. Credit card links use PCI-compliant providers.",
      },
    ],
    []
  );

  const trustBadges = useMemo(
    () => [
      { icon: <FiShield size={22} />, label: "Secure Payments", sub: "Personal & Private" },
      { icon: <FiAward size={22} />, label: "Licensed Operator", sub: "Fully Certified" },
      { icon: <FiUsers size={22} />, label: "2,000+ Travelers", sub: "Since 2018" },
      { icon: <FiCheckCircle size={22} />, label: "Price Guarantee", sub: "No Hidden Fees" },
      { icon: <FiHeart size={22} />, label: "98% Satisfaction", sub: "Verified Reviews" },
      { icon: <FiGlobe size={22} />, label: "6 Countries", sub: "East Africa" },
    ],
    []
  );

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="pt-root" style={{ backgroundColor: "#FAFDF7", minHeight: "100vh" }}>
      <style>{globalCSS}</style>

      {/* Multi-Step Contact Modal */}
      <MultiStepContactModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        contextMessage={gateContext}
      />

      {/* Page Header */}
      <PageHeader
        title="Payment & Booking Terms"
        subtitle="Transparent pricing, personal service, and secure payments — your safari starts with trust"
        backgroundImage="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920"
        breadcrumbs={[{ label: "Payment Terms" }]}
      />

      {/* ═══ STICKY NAVIGATION ═══ */}
      <div
        className="pt-nav no-print"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "rgba(255,255,255,.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(5,150,105,.08)",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1480px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px 0",
            overflowX: "auto",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(`pt-${item.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "10px 20px",
                borderRadius: "40px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                whiteSpace: "nowrap",
                transition: "all 0.25s var(--pt-transition)",
                backgroundColor:
                  activeNav === item.id ? "#064E3B" : "transparent",
                color: activeNav === item.id ? "#fff" : "#6B7280",
                boxShadow:
                  activeNav === item.id
                    ? "0 4px 14px rgba(6,78,59,.2)"
                    : "none",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseOver={(e) => {
                if (activeNav !== item.id) {
                  e.currentTarget.style.backgroundColor = "#F3F4F6";
                  e.currentTarget.style.color = "#111827";
                }
              }}
              onMouseOut={(e) => {
                if (activeNav !== item.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B7280";
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <section style={{ padding: "48px 24px 100px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* ═══ HERO SECTION ═══ */}
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                  backgroundColor: "#ECFDF5",
                  borderRadius: "30px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  marginBottom: "24px",
                  border: "1px solid #D1FAE5",
                }}
              >
                <FiLock size={14} /> Personal & Secure
              </div>
              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(32px, 5vw, 54px)",
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: "20px",
                  lineHeight: 1.15,
                }}
              >
                How Booking &{" "}
                <span
                  style={{
                    color: "#059669",
                    position: "relative",
                  }}
                >
                  Payment
                  <svg
                    style={{
                      position: "absolute",
                      bottom: "-6px",
                      left: 0,
                      width: "100%",
                      height: "8px",
                    }}
                    viewBox="0 0 200 8"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 6 Q50 0 100 4 T200 2"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity=".3"
                    />
                  </svg>
                </span>{" "}
                Works
              </h1>
              <p
                style={{
                  fontSize: "clamp(16px, 1.8vw, 19px)",
                  color: "#4B5563",
                  maxWidth: "780px",
                  margin: "0 auto 16px",
                  lineHeight: 1.7,
                }}
              >
                At Altuvera, every booking is personal. Chat directly with our
                booking manager{" "}
                <strong style={{ color: "#064E3B" }}>{ADMIN.name}</strong> on
                WhatsApp to plan your dream safari. No payment is ever processed
                on this website.
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "#6B7280",
                  marginBottom: "36px",
                }}
              >
                All payments are arranged privately via WhatsApp at{" "}
                <strong style={{ color: "#059669" }}>
                  {ADMIN.whatsappDisplay}
                </strong>
              </p>

              <div
                className="pt-hero-btns"
                style={{
                  display: "flex",
                  gap: "14px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() =>
                    openGate(
                      "I'd like to discuss booking and payment details for a safari with Altuvera."
                    )
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 36px",
                    background: "linear-gradient(135deg, #25D366, #128C7E)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    transition: "all 0.3s var(--pt-transition)",
                    boxShadow: "0 8px 30px rgba(37,211,102,.3)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 40px rgba(37,211,102,.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(37,211,102,.3)";
                  }}
                >
                  <FaWhatsapp size={22} /> Message{" "}
                  {ADMIN.name.split(" ")[0]} on WhatsApp
                </button>
                <button
                  onClick={() => scrollTo("pt-process")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "16px 32px",
                    background: "transparent",
                    color: "#064E3B",
                    border: "2px solid #D1FAE5",
                    borderRadius: "50px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    transition: "all 0.3s var(--pt-transition)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#ECFDF5";
                    e.currentTarget.style.borderColor = "#059669";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#D1FAE5";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FiInfo size={18} /> Learn How It Works
                </button>
              </div>

              {/* Stats */}
              <div
                className="pt-stats"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                  marginTop: "52px",
                  maxWidth: "820px",
                  margin: "52px auto 0",
                }}
              >
                {[
                  { value: "0%", label: "Website Fees" },
                  { value: "24/7", label: "WhatsApp Support" },
                  { value: "100%", label: "Transparency" },
                  { value: "6+", label: "Payment Methods" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: "center",
                      padding: "20px 12px",
                      backgroundColor: "#fff",
                      borderRadius: "18px",
                      border: "1px solid #F3F4F6",
                      transition: "all 0.3s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(5,150,105,.08)";
                      e.currentTarget.style.borderColor = "#D1FAE5";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#F3F4F6";
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "30px",
                        fontWeight: "800",
                        color: "#059669",
                        marginBottom: "4px",
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6B7280",
                        fontWeight: "500",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* ═══ OVERVIEW: KEY TERMS ═══ */}
          <div id="pt-overview">
            <AnimatedSection animation="fadeInUp">
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 18px",
                    backgroundColor: "#ECFDF5",
                    borderRadius: "30px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#059669",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "16px",
                    border: "1px solid #D1FAE5",
                  }}
                >
                  Key Terms
                </span>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(26px, 3vw, 38px)",
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: "10px",
                  }}
                >
                  Payment Terms at a Glance
                </h2>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#6B7280",
                    maxWidth: "550px",
                    margin: "0 auto",
                  }}
                >
                  Click any card to expand and learn more
                </p>
              </div>
            </AnimatedSection>
            <div
              className="pt-g3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "72px",
              }}
            >
              {terms.map((item, i) => (
                <AnimatedSection
                  key={item.title}
                  animation="fadeInUp"
                  delay={i * 0.07}
                >
                  <TermCard item={item} index={i} />
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* ═══ HOW IT WORKS ═══ */}
          <div id="pt-process">
            <AnimatedSection animation="fadeInUp">
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "32px",
                  padding: "clamp(32px, 5vw, 64px)",
                  boxShadow: "var(--pt-shadow-lg)",
                  border: "1px solid #F3F4F6",
                  marginBottom: "72px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "52px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 18px",
                      backgroundColor: "#ECFDF5",
                      borderRadius: "30px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#059669",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "16px",
                      border: "1px solid #D1FAE5",
                    }}
                  >
                    Simple 5-Step Process
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(26px, 3vw, 40px)",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    From Inquiry to Adventure
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#6B7280",
                      maxWidth: "560px",
                      margin: "0 auto",
                    }}
                  >
                    Five steps to your personalized East African safari
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "32px",
                  }}
                >
                  {processSteps.map((s, idx) => (
                    <div
                      key={s.step}
                      style={{
                        textAlign: "center",
                        animation: `pt-fadeUp 0.5s ease ${idx * 0.1}s both`,
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "24px",
                          background: `${s.color}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          color: s.color,
                          position: "relative",
                          transition: "all 0.35s var(--pt-transition)",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "scale(1.1) translateY(-4px)";
                          e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}20`;
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "scale(1) translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {s.icon}
                        <span
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: s.color,
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 3px 10px ${s.color}40`,
                          }}
                        >
                          {s.step}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: "10px",
                        }}
                      >
                        {s.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          lineHeight: 1.7,
                        }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA Banner */}
                <div
                  style={{
                    marginTop: "52px",
                    padding: "28px 32px",
                    background:
                      "linear-gradient(135deg, #064E3B, #047857)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "24px",
                    flexWrap: "wrap",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(37,211,102,.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pt-float 3s ease-in-out infinite",
                      }}
                    >
                      <FaWhatsapp size={26} />
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: "700" }}>
                        Chat with {ADMIN.name}
                      </div>
                      <div style={{ fontSize: "14px", opacity: 0.85 }}>
                        {ADMIN.whatsappDisplay} — responds within minutes
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      openGate("I'm ready to start planning my safari!")
                    }
                    style={{
                      padding: "12px 28px",
                      backgroundColor: "#25D366",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      boxShadow: "0 4px 16px rgba(37,211,102,.3)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <FaWhatsapp size={18} /> Start Chat
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* ═══ PAYMENT METHODS ═══ */}
          <div id="pt-methods">
            <AnimatedSection animation="fadeInUp">
              <div style={{ marginBottom: "72px" }}>
                <div style={{ textAlign: "center", marginBottom: "44px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 18px",
                      backgroundColor: "#F5F3FF",
                      borderRadius: "30px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#7C3AED",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "16px",
                      border: "1px solid #EDE9FE",
                    }}
                  >
                    Payment Options
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(26px, 3vw, 40px)",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    Accepted Payment Methods
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#6B7280",
                      maxWidth: "620px",
                      margin: "0 auto",
                    }}
                  >
                    Select your preferred method. Payment details are shared by{" "}
                    {ADMIN.name} via WhatsApp after consultation.
                  </p>
                </div>

                <div
                  className="pt-g3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                    marginBottom: "52px",
                  }}
                >
                  {paymentMethods.map((m) => {
                    const sel = preferredMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() =>
                          setPreferredMethod((p) =>
                            p === m.id ? null : m.id
                          )
                        }
                        role="button"
                        tabIndex={0}
                        aria-pressed={sel}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          setPreferredMethod((p) =>
                            p === m.id ? null : m.id
                          )
                        }
                        style={{
                          position: "relative",
                          backgroundColor: sel ? "#ECFDF5" : "#fff",
                          borderRadius: "22px",
                          padding: "28px 24px",
                          border: sel
                            ? "2px solid #059669"
                            : "2px solid #F3F4F6",
                          cursor: "pointer",
                          transition:
                            "all 0.35s var(--pt-transition)",
                          boxShadow: sel
                            ? "0 8px 28px rgba(5,150,105,.12)"
                            : "var(--pt-shadow-sm)",
                        }}
                        onMouseOver={(e) => {
                          if (!sel) {
                            e.currentTarget.style.borderColor = "#D1FAE5";
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 12px 32px rgba(5,150,105,.06)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!sel) {
                            e.currentTarget.style.borderColor = "#F3F4F6";
                            e.currentTarget.style.transform =
                              "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "var(--pt-shadow-sm)";
                          }
                        }}
                      >
                        {m.popular && (
                          <span
                            style={{
                              position: "absolute",
                              top: "14px",
                              right: "14px",
                              padding: "4px 10px",
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Popular
                          </span>
                        )}
                        {sel && (
                          <div
                            style={{
                              position: "absolute",
                              top: "14px",
                              left: "14px",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#059669",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              animation: "pt-checkPop 0.4s ease",
                            }}
                          >
                            <FiCheckCircle size={14} color="#fff" />
                          </div>
                        )}
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "16px",
                            backgroundColor: `${m.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px",
                            color:
                              m.color === "#FFCB05"
                                ? "#92400E"
                                : m.color,
                          }}
                        >
                          {m.icon}
                        </div>
                        <h4
                          style={{
                            fontSize: "17px",
                            fontWeight: "700",
                            color: "#111827",
                            marginBottom: "8px",
                          }}
                        >
                          {m.name}
                        </h4>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#6B7280",
                            lineHeight: 1.6,
                            marginBottom: "10px",
                          }}
                        >
                          {m.desc}
                        </p>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <FiGlobe size={11} />
                          {m.region}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Declaration Panel */}
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "28px",
                    padding: "clamp(28px, 4vw, 48px)",
                    boxShadow: "var(--pt-shadow-lg)",
                    border: "1px solid #F3F4F6",
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "26px",
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: "10px",
                      }}
                    >
                      Declare Your Payment Preference
                    </h3>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#6B7280",
                        maxWidth: "560px",
                        margin: "0 auto",
                        lineHeight: 1.6,
                      }}
                    >
                      Select a method above, add an optional note, then click
                      below. You'll go through a quick form before being
                      connected with {ADMIN.name}.
                    </p>
                  </div>

                  {/* Selected method display */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: "16px",
                      border: preferredMethod
                        ? "2px solid #059669"
                        : "2px dashed #D1D5DB",
                      backgroundColor: preferredMethod
                        ? "#ECFDF5"
                        : "#FAFAFA",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "20px",
                      transition: "all 0.3s var(--pt-transition)",
                    }}
                  >
                    {preferredMethod ? (
                      <>
                        <FiCheckCircle size={20} color="#059669" />
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#065F46",
                          }}
                        >
                          {
                            paymentMethods.find(
                              (x) => x.id === preferredMethod
                            )?.name
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <FiCreditCard size={20} color="#9CA3AF" />
                        <span
                          style={{ fontSize: "15px", color: "#9CA3AF" }}
                        >
                          Select a payment method from above
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ marginBottom: "28px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#374151",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Additional Note{" "}
                      <span
                        style={{
                          fontWeight: "400",
                          color: "#9CA3AF",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      value={declarationNote}
                      onChange={(e) =>
                        setDeclarationNote(e.target.value)
                      }
                      placeholder="e.g. Interested in a 5-day gorilla trekking safari for 2 in July..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "14px",
                        border: "2px solid #E5E7EB",
                        fontSize: "15px",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "'Inter', sans-serif",
                        transition:
                          "border-color 0.25s, box-shadow 0.25s",
                        backgroundColor: "#FAFBFC",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#059669";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 4px rgba(5,150,105,.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={handleDeclaration}
                      disabled={!preferredMethod}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px 40px",
                        background: preferredMethod
                          ? "linear-gradient(135deg, #25D366, #128C7E)"
                          : "#E5E7EB",
                        color: preferredMethod ? "#fff" : "#9CA3AF",
                        border: "none",
                        borderRadius: "50px",
                        cursor: preferredMethod
                          ? "pointer"
                          : "not-allowed",
                        fontSize: "16px",
                        fontWeight: "700",
                        transition: "all 0.3s var(--pt-transition)",
                        boxShadow: preferredMethod
                          ? "0 8px 28px rgba(37,211,102,.3)"
                          : "none",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseOver={(e) => {
                        if (preferredMethod)
                          e.currentTarget.style.transform =
                            "translateY(-2px)";
                      }}
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform =
                          "translateY(0)")
                      }
                    >
                      <FaWhatsapp size={20} /> Declare & Message{" "}
                      {ADMIN.name.split(" ")[0]}
                    </button>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9CA3AF",
                        marginTop: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <FiLock size={11} /> You'll enter your details
                      first — then get {ADMIN.name}'s WhatsApp contact
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* ═══ CANCELLATION POLICY ═══ */}
          <div id="pt-cancellation">
            <AnimatedSection animation="fadeInUp">
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "28px",
                  padding: "clamp(28px, 4vw, 52px)",
                  boxShadow: "var(--pt-shadow-lg)",
                  border: "1px solid #F3F4F6",
                  marginBottom: "72px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "44px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 18px",
                      backgroundColor: "#FEF2F2",
                      borderRadius: "30px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#DC2626",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "16px",
                      border: "1px solid #FECACA",
                    }}
                  >
                    Cancellation Policy
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(26px, 3vw, 38px)",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    Refund Schedule
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#6B7280",
                      maxWidth: "520px",
                      margin: "0 auto",
                    }}
                  >
                    Refund percentages based on notice before departure
                  </p>
                </div>

                <div
                  className="pt-g3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "36px",
                  }}
                >
                  {cancellationTiers.map((t, idx) => (
                    <div
                      key={t.period}
                      style={{
                        padding: "24px 20px",
                        borderRadius: "18px",
                        border: `2px solid ${t.color}20`,
                        backgroundColor: `${t.color}05`,
                        textAlign: "center",
                        transition: "all 0.35s var(--pt-transition)",
                        animation: `pt-fadeUp 0.4s ease ${idx * 0.06}s both`,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = `${t.color}50`;
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = `0 10px 28px ${t.color}12`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = `${t.color}20`;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "34px",
                          fontWeight: "800",
                          color: t.color,
                          marginBottom: "8px",
                        }}
                      >
                        {t.percent}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "6px",
                        }}
                      >
                        {t.period} before
                      </div>
                      <div style={{ fontSize: "13px", color: "#6B7280" }}>
                        {t.refund}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="pt-g2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      padding: "20px 24px",
                      backgroundColor: "#FEF2F2",
                      borderRadius: "16px",
                      borderLeft: "4px solid #EF4444",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        fontWeight: "700",
                        color: "#991B1B",
                        fontSize: "15px",
                      }}
                    >
                      <FiAlertCircle size={18} /> Non-Refundable Items
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#7F1D1D",
                        lineHeight: 1.7,
                      }}
                    >
                      Gorilla, chimpanzee, and volcano permits are 100%
                      non-refundable once issued.
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "20px 24px",
                      backgroundColor: "#ECFDF5",
                      borderRadius: "16px",
                      borderLeft: "4px solid #059669",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                        fontWeight: "700",
                        color: "#065F46",
                        fontSize: "15px",
                      }}
                    >
                      <FiHeart size={18} /> Our Promise
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#064E3B",
                        lineHeight: 1.7,
                      }}
                    >
                      Message {ADMIN.name.split(" ")[0]} — we always find
                      the best solution for rescheduling or credits.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* ═══ FAQ ═══ */}
          <div id="pt-faq">
            <AnimatedSection animation="fadeInUp">
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "28px",
                  padding: "clamp(28px, 4vw, 56px)",
                  boxShadow: "var(--pt-shadow-lg)",
                  border: "1px solid #F3F4F6",
                  marginBottom: "72px",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "44px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 18px",
                      backgroundColor: "#EFF6FF",
                      borderRadius: "30px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#2563EB",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "16px",
                      border: "1px solid #DBEAFE",
                    }}
                  >
                    Have Questions?
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(26px, 3vw, 40px)",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Frequently Asked Questions
                  </h2>
                </div>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  {faqs.map((f, i) => (
                    <FaqItem
                      key={i}
                      faq={f}
                      index={i}
                      isOpen={expandedFaq === i}
                      onToggle={toggleFaq}
                    />
                  ))}
                </div>
                <div
                  style={{
                    marginTop: "44px",
                    textAlign: "center",
                    padding: "36px 24px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: "20px",
                    border: "1px solid #F3F4F6",
                  }}
                >
                  <FiHelpCircle
                    size={28}
                    color="#059669"
                    style={{ marginBottom: "12px" }}
                  />
                  <h4
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "8px",
                    }}
                  >
                    Still have questions?
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B7280",
                      marginBottom: "24px",
                    }}
                  >
                    Chat directly with {ADMIN.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        openGate(
                          "I have a question about Altuvera's payment terms."
                        )
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#25D366",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.25s",
                        boxShadow:
                          "0 4px 14px rgba(37,211,102,.25)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform =
                          "translateY(-2px)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform =
                          "translateY(0)")
                      }
                    >
                      <FaWhatsapp size={16} /> Ask on WhatsApp
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `mailto:${ADMIN.email}?subject=Payment Question`)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        backgroundColor: "#064E3B",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.25s",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform =
                          "translateY(-2px)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform =
                          "translateY(0)")
                      }
                    >
                      <FiMail size={16} /> Email Us
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* ═══ TRUST BADGES ═══ */}
          <AnimatedSection animation="fadeInUp">
            <div style={{ marginBottom: "60px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Why Travelers Trust Altuvera
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    {
                      icon: <FiChevronLeft size={18} />,
                      d: -280,
                    },
                    {
                      icon: <FiChevronRight size={18} />,
                      d: 280,
                    },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        trackRef.current?.scrollBy({
                          left: b.d,
                          behavior: "smooth",
                        })
                      }
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#374151",
                        transition: "all 0.25s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "#059669";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#059669";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.color = "#374151";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      {b.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div
                ref={trackRef}
                className="pt-scroll"
                style={{
                  display: "flex",
                  gap: "18px",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  paddingBottom: "8px",
                  scrollBehavior: "smooth",
                }}
              >
                {trustBadges.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      flex: "0 0 220px",
                      scrollSnapAlign: "start",
                      backgroundColor: "#fff",
                      borderRadius: "20px",
                      padding: "28px 24px",
                      textAlign: "center",
                      border: "1px solid #F3F4F6",
                      boxShadow: "var(--pt-shadow-sm)",
                      transition:
                        "all 0.35s var(--pt-transition)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 14px 36px rgba(5,150,105,.1)";
                      e.currentTarget.style.borderColor = "#D1FAE5";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "var(--pt-shadow-sm)";
                      e.currentTarget.style.borderColor = "#F3F4F6";
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "16px",
                        backgroundColor: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                        color: "#059669",
                      }}
                    >
                      {b.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#111827",
                        marginBottom: "4px",
                      }}
                    >
                      {b.label}
                    </div>
                    <div
                      style={{ fontSize: "13px", color: "#6B7280" }}
                    >
                      {b.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* ═══ CONTACT BAR ═══ */}
          <AnimatedSection animation="fadeInUp">
            <div
              className="pt-cbar"
              style={{
                background:
                  "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
                borderRadius: "28px",
                padding: "36px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "24px",
                color: "#fff",
              }}
            >
              {[
                {
                  icon: <FaWhatsapp size={22} />,
                  label: "WhatsApp",
                  value: (
                    <span style={styles.contactText}>
                      {ADMIN.phone1}
                      <br />
                      {ADMIN.phone2}
                    </span>
                  ),
                  action: () =>
                    openGate(
                      "I'd like to learn more about Altuvera."
                    ),
                  hl: true,
                },
                {
                  icon: <FiPhone size={20} />,
                  label: "Call",
                  value: (
                    <span style={styles.contactText}>
                      {ADMIN.phone1}
                      <br />
                      {ADMIN.phone2}
                    </span>
                  ),
                },
                {
                  icon: <FiMail size={20} />,
                  label: "Email",
                  value: ADMIN.email,
                },
                {
                  icon: <FiMapPin size={20} />,
                  label: "Office",
                  value: ADMIN.office,
                },
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={c.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    cursor: c.action ? "pointer" : "default",
                    padding: c.hl ? "10px 20px" : "0",
                    backgroundColor: c.hl
                      ? "rgba(37,211,102,.2)"
                      : "transparent",
                    borderRadius: c.hl ? "50px" : "0",
                    transition: "all 0.25s",
                  }}
                  onMouseOver={(e) => {
                    if (c.action)
                      e.currentTarget.style.backgroundColor =
                        "rgba(37,211,102,.3)";
                  }}
                  onMouseOut={(e) => {
                    if (c.action)
                      e.currentTarget.style.backgroundColor = c.hl
                        ? "rgba(37,211,102,.2)"
                        : "transparent";
                  }}
                >
                  <span style={{ opacity: 0.9 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                      {c.label}
                    </div>
                    <div
                      style={{ fontSize: "15px", fontWeight: "600" }}
                    >
                      {c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* ═══ DOCUMENT ACTIONS ═══ */}
          <AnimatedSection animation="fadeInUp">
            <div
              className="no-print"
              style={{
                marginTop: "44px",
                textAlign: "center",
                display: "flex",
                gap: "14px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  icon: <FiPrinter size={16} />,
                  label: "Print Terms",
                  fn: () => window.print(),
                },
                {
                  icon: <FiMail size={16} />,
                  label: "Email Terms",
                  fn: () =>
                    (window.location.href = `mailto:?subject=Altuvera Payment Terms&body=View terms: ${window.location.href}`),
                },
                {
                  icon: <FiDownload size={16} />,
                  label: "Request PDF",
                  fn: () =>
                    openGate(
                      "Could you please send me Altuvera's payment terms as a PDF?"
                    ),
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={a.fn}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    backgroundColor: "#fff",
                    color: "#374151",
                    border: "1px solid #E5E7EB",
                    borderRadius: "50px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.25s",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#059669";
                    e.currentTarget.style.color = "#059669";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#374151";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <p
            style={{
              textAlign: "center",
              marginTop: "36px",
              fontSize: "13px",
              color: "#9CA3AF",
            }}
          >
            Last updated: February 2025 • All bookings managed by{" "}
            {ADMIN.name} (
            <span style={styles.contactText}>
              {ADMIN.phone1} | {ADMIN.phone2}
            </span>
            )
          </p>
        </div>
      </section>

      {/* ═══ SCROLL TO TOP ═══ */}
      <button
        className="no-print"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #064E3B, #059669)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 28px rgba(5,150,105,.3)",
          transition: "all 0.35s var(--pt-transition)",
          zIndex: 90,
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? "auto" : "none",
          transform: showScrollTop
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.8)",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform =
            "translateY(-3px) scale(1.05)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.transform = "translateY(0) scale(1)")
        }
      >
        <FiChevronUp size={22} />
      </button>
    </div>
  );
};

export default PaymentTerms;
