import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  HiAdjustments,
  HiShieldCheck,
  HiSparkles,
  HiX,
  HiCheck,
  HiLockClosed,
  HiChartBar,
  HiSpeakerphone,
} from "react-icons/hi";
import {
  COOKIE_PREFS_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
} from "../../utils/cookiePreferences";

// ═══════════════════════════════════════════════════════════════
// MODERN COOKIE CONSENT COMPONENT
// Professional, Responsive, Accessible
// ═══════════════════════════════════════════════════════════════

const defaultPrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
  consentGiven: false,
  updatedAt: null,
};

const readStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...defaultPrefs,
      ...parsed,
      necessary: true,
      consentGiven: true,
    };
  } catch {
    return null;
  }
};

// Styles object for cleaner JSX
const styles = {
  // Banner Container
  banner: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 48px)",
    maxWidth: "720px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: `
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 10px 15px -3px rgba(0, 0, 0, 0.08),
      0 25px 50px -12px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
    padding: "28px 32px",
    zIndex: 99998,
    animation: "cookieBannerSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  },

  bannerInner: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  bannerHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },

  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
  },

  iconSvg: {
    width: "24px",
    height: "24px",
    color: "#FFFFFF",
  },

  textContent: {
    flex: 1,
    minWidth: 0,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#15803D",
    marginBottom: "10px",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },

  badgeIcon: {
    width: "14px",
    height: "14px",
  },

  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },

  description: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748B",
    margin: 0,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    paddingTop: "4px",
  },

  // Buttons
  btnBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  btnPrimary: {
    background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    color: "#FFFFFF",
    boxShadow: "0 4px 14px rgba(34, 197, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
  },

  btnSecondary: {
    background: "#F1F5F9",
    color: "#475569",
    boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.06)",
  },

  btnGhost: {
    background: "transparent",
    color: "#64748B",
    padding: "12px 16px",
  },

  btnIcon: {
    width: "16px",
    height: "16px",
  },

  // Modal Overlay
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 99999,
    animation: "cookieOverlayFadeIn 0.3s ease-out",
  },

  // Modal
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    maxHeight: "calc(100vh - 48px)",
    background: "#FFFFFF",
    borderRadius: "24px",
    boxShadow: `
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 0, 0, 0.03)
    `,
    overflow: "hidden",
    animation: "cookieModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  },

  modalHeader: {
    padding: "28px 28px 0",
    position: "relative",
  },

  modalClose: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "none",
    background: "#F1F5F9",
    color: "#64748B",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  modalTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
    paddingRight: "44px",
  },

  modalDescription: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748B",
    margin: 0,
  },

  modalBody: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "400px",
    overflowY: "auto",
  },

  // Cookie Category Card
  cookieCard: {
    background: "#F8FAFC",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid #E2E8F0",
    transition: "all 0.2s ease",
  },

  cookieCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },

  cookieCardInfo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: 0,
  },

  cookieCardIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cookieCardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0F172A",
    margin: "0 0 4px 0",
  },

  cookieCardDesc: {
    fontSize: "13px",
    color: "#64748B",
    margin: 0,
    lineHeight: 1.4,
  },

  // Toggle Switch
  toggle: {
    position: "relative",
    width: "52px",
    height: "28px",
    flexShrink: 0,
  },

  toggleInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    margin: 0,
    zIndex: 1,
  },

  toggleTrack: {
    position: "absolute",
    inset: 0,
    borderRadius: "100px",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  },

  toggleThumb: {
    position: "absolute",
    top: "3px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#FFFFFF",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  toggleIcon: {
    width: "12px",
    height: "12px",
  },

  // Modal Footer
  modalFooter: {
    padding: "20px 28px 28px",
    display: "flex",
    gap: "12px",
    borderTop: "1px solid #E2E8F0",
    background: "#FAFBFC",
  },

  // Responsive styles will be handled inline
};

// Keyframes injected once
const injectKeyframes = () => {
  if (document.getElementById("cookie-consent-keyframes")) return;
  const style = document.createElement("style");
  style.id = "cookie-consent-keyframes";
  style.textContent = `
    @keyframes cookieBannerSlideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    @keyframes cookieOverlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes cookieModalSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .cookie-consent-body-lock {
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
};

// Toggle Component
const Toggle = ({ checked, onChange, disabled = false }) => {
  const trackStyle = {
    ...styles.toggleTrack,
    background: disabled
      ? "#E2E8F0"
      : checked
      ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
      : "#CBD5E1",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  const thumbStyle = {
    ...styles.toggleThumb,
    left: checked ? "27px" : "3px",
    background: disabled ? "#F1F5F9" : "#FFFFFF",
  };

  return (
    <div style={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ ...styles.toggleInput, cursor: disabled ? "not-allowed" : "pointer" }}
        aria-checked={checked}
      />
      <div style={trackStyle} />
      <div style={thumbStyle}>
        {checked && (
          <HiCheck
            style={{
              ...styles.toggleIcon,
              color: disabled ? "#94A3B8" : "#22C55E",
            }}
          />
        )}
      </div>
    </div>
  );
};

// Cookie Category Card Component
const CookieCard = ({ icon: Icon, iconBg, title, description, checked, onChange, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.cookieCard,
        borderColor: isHovered && !disabled ? "#CBD5E1" : "#E2E8F0",
        background: disabled ? "#F1F5F9" : "#F8FAFC",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cookieCardHeader}>
        <div style={styles.cookieCardInfo}>
          <div style={{ ...styles.cookieCardIcon, background: iconBg }}>
            <Icon style={{ width: "20px", height: "20px", color: "#FFFFFF" }} />
          </div>
          <div>
            <h4 style={styles.cookieCardTitle}>{title}</h4>
            <p style={styles.cookieCardDesc}>{description}</p>
          </div>
        </div>
        <Toggle checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
};

// Button Component
const Button = ({ variant = "secondary", children, onClick, style = {}, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    primary: {
      ...styles.btnPrimary,
      transform: isHovered ? "translateY(-1px)" : "none",
      boxShadow: isHovered
        ? "0 6px 20px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
        : styles.btnPrimary.boxShadow,
    },
    secondary: {
      ...styles.btnSecondary,
      background: isHovered ? "#E2E8F0" : "#F1F5F9",
    },
    ghost: {
      ...styles.btnGhost,
      background: isHovered ? "rgba(0, 0, 0, 0.04)" : "transparent",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...styles.btnBase, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

// Main Component
export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);
  const [preferences, setPreferences] = useState(stored || defaultPrefs);
  const [showBanner, setShowBanner] = useState(!stored);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Inject keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (showSettings) {
      document.body.classList.add("cookie-consent-body-lock");
    } else {
      document.body.classList.remove("cookie-consent-body-lock");
    }
    return () => document.body.classList.remove("cookie-consent-body-lock");
  }, [showSettings]);

  // Listen for external open settings event
  useEffect(() => {
    const openSettings = () => setShowSettings(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  // Escape key to close modal
  useEffect(() => {
    if (!showSettings) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowSettings(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showSettings]);

  const persistPreferences = useCallback((nextPrefs) => {
    const finalPrefs = {
      ...defaultPrefs,
      ...nextPrefs,
      necessary: true,
      consentGiven: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(finalPrefs));
    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    persistPreferences({ analytics: true, marketing: true });
  }, [persistPreferences]);

  const acceptEssentialOnly = useCallback(() => {
    persistPreferences({ analytics: false, marketing: false });
  }, [persistPreferences]);

  const saveCustomPreferences = useCallback(() => {
    persistPreferences(preferences);
  }, [persistPreferences, preferences]);

  // Responsive banner styles
  const bannerResponsive = isMobile
    ? {
        ...styles.banner,
        bottom: "16px",
        left: "16px",
        right: "16px",
        width: "auto",
        transform: "none",
        padding: "24px 20px",
        borderRadius: "16px",
        animation: "cookieBannerSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    : styles.banner;

  const actionsResponsive = isMobile
    ? { ...styles.actions, flexDirection: "column" }
    : styles.actions;

  const buttonFullWidth = isMobile ? { flex: 1, width: "100%" } : {};

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <div style={bannerResponsive} role="dialog" aria-label="Cookie consent" aria-modal="false">
          <div style={styles.bannerInner}>
            <div style={styles.bannerHeader}>
              <div style={styles.iconContainer}>
                <HiShieldCheck style={styles.iconSvg} />
              </div>
              <div style={styles.textContent}>
                <div style={styles.badge}>
                  <HiSparkles style={styles.badgeIcon} />
                  Privacy First
                </div>
                <h2 style={styles.title}>We value your privacy</h2>
                <p style={styles.description}>
                  We use cookies to enhance your experience. Essential cookies keep you signed in,
                  while optional cookies help us improve our services.
                </p>
              </div>
            </div>

            <div style={actionsResponsive}>
              <Button variant="ghost" onClick={() => setShowSettings(true)} style={buttonFullWidth}>
                <HiAdjustments style={styles.btnIcon} />
                Customize
              </Button>
              <Button variant="secondary" onClick={acceptEssentialOnly} style={buttonFullWidth}>
                Essential Only
              </Button>
              <Button variant="primary" onClick={acceptAll} style={buttonFullWidth}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={styles.overlay}
          onClick={() => setShowSettings(false)}
          role="presentation"
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setShowSettings(false)}
                aria-label="Close cookie settings"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E2E8F0";
                  e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <HiX style={{ width: "18px", height: "18px" }} />
              </button>
              <h3 id="cookie-modal-title" style={styles.modalTitle}>
                Cookie Preferences
              </h3>
              <p style={styles.modalDescription}>
                Manage your cookie settings. Essential cookies cannot be disabled as they are
                required for security and authentication.
              </p>
            </div>

            <div style={styles.modalBody}>
              <CookieCard
                icon={HiLockClosed}
                iconBg="linear-gradient(135deg, #64748B 0%, #475569 100%)"
                title="Essential Cookies"
                description="Required for authentication, security, and core functionality."
                checked={true}
                disabled={true}
              />

              <CookieCard
                icon={HiChartBar}
                iconBg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                title="Analytics Cookies"
                description="Help us understand how you use our site to improve your experience."
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                }
              />

              <CookieCard
                icon={HiSpeakerphone}
                iconBg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                title="Marketing Cookies"
                description="Used to deliver personalized advertisements and measure their effectiveness."
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                }
              />
            </div>

            <div style={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={acceptEssentialOnly}
                style={{ flex: 1 }}
              >
                Essential Only
              </Button>
              <Button
                variant="primary"
                onClick={saveCustomPreferences}
                style={{ flex: 1 }}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}