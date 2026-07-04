// src/utils/cookiePreferences.js
// ============================================================================
// Cookie Preferences — Real Cookie Management Utility
// ============================================================================

export const COOKIE_PREFS_KEY = "altuvera_cookie_prefs";
export const OPEN_COOKIE_SETTINGS_EVENT = "altuvera:open-cookie-settings";

// ── Cookie Categories ────────────────────────────────────────────────────────

export const COOKIE_CATEGORIES = {
  necessary: {
    id: "necessary",
    label: "Essential Cookies",
    description:
      "Required for core functionality — authentication, security, session management, and CSRF protection. Cannot be disabled.",
    examples: ["session_id", "csrf_token", "auth_token", "lang"],
    required: true,
  },
  analytics: {
    id: "analytics",
    label: "Analytics & Performance",
    description:
      "Help us understand how visitors use our site — page views, bounce rates, and performance metrics. All data is anonymised.",
    examples: ["_ga", "_gid", "_gat", "amp_*"],
    required: false,
  },
  marketing: {
    id: "marketing",
    label: "Marketing & Personalisation",
    description:
      "Allow us to show you relevant offers, retargeting ads, and personalised content based on your browsing behaviour.",
    examples: ["_fbp", "_gcl_au", "ads_*", "personalization_id"],
    required: false,
  },
};

// ── Default Preferences ──────────────────────────────────────────────────────

export const DEFAULT_PREFS = {
  necessary: true,
  analytics: false,
  marketing: false,
  consentGiven: false,
  consentVersion: "1.0",
  updatedAt: null,
  ipRegion: null,
};

// ── Storage Helpers ──────────────────────────────────────────────────────────

export const readStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return { ...DEFAULT_PREFS, ...parsed, necessary: true };
  } catch {
    return null;
  }
};

export const writePreferences = (prefs) => {
  try {
    const final = {
      ...DEFAULT_PREFS,
      ...prefs,
      necessary: true,
      consentGiven: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(final));
    return final;
  } catch {
    return null;
  }
};

export const clearPreferences = () => {
  try {
    localStorage.removeItem(COOKIE_PREFS_KEY);
  } catch {
    // ignore
  }
};

// ── Real Cookie Enforcement ──────────────────────────────────────────────────

/**
 * Removes cookies by name pattern for a given category.
 * Works for document.cookie (client-side accessible cookies only).
 */
const removeCookiesByPattern = (patterns) => {
  try {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      const shouldRemove = patterns.some((pattern) => {
        if (pattern.endsWith("*")) {
          return name.startsWith(pattern.slice(0, -1));
        }
        return name === pattern;
      });
      if (shouldRemove) {
        // Remove for current domain + all path combinations
        const domains = [
          window.location.hostname,
          `.${window.location.hostname}`,
          "",
        ];
        const paths = ["/", window.location.pathname, ""];
        domains.forEach((domain) => {
          paths.forEach((path) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${
              domain ? `; domain=${domain}` : ""
            }; SameSite=Lax`;
          });
        });
      }
    });
  } catch {
    // Silently fail — cookie deletion is best-effort for client-side
  }
};

/**
 * Disables Google Analytics if analytics consent is revoked.
 */
const disableGoogleAnalytics = () => {
  try {
    const gaId = window.GA_MEASUREMENT_ID || "G-XXXXXXXXXX";
    window[`ga-disable-${gaId}`] = true;
    // Remove GA cookies
    removeCookiesByPattern(["_ga", "_gid", "_gat", "amp_*"]);
  } catch {
    // GA not loaded
  }
};

/**
 * Enables Google Analytics if analytics consent is given.
 */
const enableGoogleAnalytics = () => {
  try {
    const gaId = window.GA_MEASUREMENT_ID || "G-XXXXXXXXXX";
    window[`ga-disable-${gaId}`] = false;
    // Trigger gtag consent update
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  } catch {
    // GA not loaded
  }
};

/**
 * Removes marketing/tracking cookies.
 */
const disableMarketingCookies = () => {
  try {
    removeCookiesByPattern(["_fbp", "_fbc", "_gcl_au", "ads_", "personalization_id"]);
    // Facebook Pixel opt-out
    if (typeof window.fbq === "function") {
      window.fbq("consent", "revoke");
    }
    // Google Ads consent update
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  } catch {
    // Third-party scripts not loaded
  }
};

/**
 * Enables marketing cookies.
 */
const enableMarketingCookies = () => {
  try {
    if (typeof window.fbq === "function") {
      window.fbq("consent", "grant");
    }
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  } catch {
    // Third-party scripts not loaded
  }
};

/**
 * Apply consent preferences to all tracking scripts.
 * This is the CORE function that gives real impact.
 */
export const applyConsentPreferences = (prefs) => {
  if (!prefs) return;

  // ── Analytics ──
  if (prefs.analytics) {
    enableGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }

  // ── Marketing ──
  if (prefs.marketing) {
    enableMarketingCookies();
  } else {
    disableMarketingCookies();
  }

  // ── Google Consent Mode v2 (broad) ──
  try {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        functionality_storage: "granted",
        security_storage: "granted",
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: prefs.marketing ? "granted" : "denied",
        ad_user_data: prefs.marketing ? "granted" : "denied",
        ad_personalization: prefs.marketing ? "granted" : "denied",
        personalization_storage: prefs.marketing ? "granted" : "denied",
      });
    }
  } catch {
    // gtag not available
  }

  // ── Dispatch custom event for other parts of the app ──
  try {
    window.dispatchEvent(
      new CustomEvent("altuvera:consent-updated", {
        detail: {
          necessary: true,
          analytics: prefs.analytics,
          marketing: prefs.marketing,
          timestamp: prefs.updatedAt,
        },
        bubbles: true,
      })
    );
  } catch {
    // Custom events not supported
  }
};

/**
 * Initialize consent mode BEFORE any scripts load (call as early as possible).
 */
export const initConsentMode = () => {
  const stored = readStoredPreferences();

  // Default to denied (privacy-first)
  try {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "default", {
        functionality_storage: "granted",
        security_storage: "granted",
        analytics_storage: stored?.analytics ? "granted" : "denied",
        ad_storage: stored?.marketing ? "granted" : "denied",
        ad_user_data: stored?.marketing ? "granted" : "denied",
        ad_personalization: stored?.marketing ? "granted" : "denied",
        personalization_storage: stored?.marketing ? "granted" : "denied",
        wait_for_update: 2000,
      });
    }
  } catch {
    // gtag not yet available
  }

  // Apply stored preferences immediately
  if (stored?.consentGiven) {
    applyConsentPreferences(stored);
  }
};

/**
 * Open cookie settings panel from anywhere in the app.
 */
export const openCookieSettings = () => {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
  } catch {
    // ignore
  }
};

/**
 * Check if a specific category is consented.
 */
export const hasConsent = (category) => {
  const stored = readStoredPreferences();
  if (!stored?.consentGiven) return category === "necessary";
  return Boolean(stored[category]);
};

/**
 * Get all current preferences (safe read).
 */
export const getPreferences = () => {
  return readStoredPreferences() || { ...DEFAULT_PREFS };
};