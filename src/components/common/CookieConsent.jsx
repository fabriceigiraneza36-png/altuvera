import React, { useEffect, useMemo, useState } from "react";
import { HiAdjustments, HiShieldCheck, HiSparkles } from "react-icons/hi";
import "./CookieConsent.css";
import {
  COOKIE_PREFS_KEY,
  OPEN_COOKIE_SETTINGS_EVENT,
} from "../../utils/cookiePreferences";

const defaultPrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
  consentGiven: false,
  updatedAt: null,
};

const readStoredPreferences = () => {
  const raw = localStorage.getItem(COOKIE_PREFS_KEY);
  if (!raw) return null;

  try {
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

export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);

  const [preferences, setPreferences] = useState(stored || defaultPrefs);
  const [showBanner, setShowBanner] = useState(!stored);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!showBanner && !showSettings) return;
    document.body.classList.add("cookie-consent-open");
    return () => document.body.classList.remove("cookie-consent-open");
  }, [showBanner, showSettings]);

  useEffect(() => {
    const openSettings = () => setShowSettings(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const persistPreferences = (nextPrefs) => {
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
  };

  const acceptAll = () => {
    persistPreferences({ analytics: true, marketing: true });
  };

  const acceptEssentialOnly = () => {
    persistPreferences({ analytics: false, marketing: false });
  };

  const saveCustomPreferences = () => {
    persistPreferences(preferences);
  };

  return (
    <>
      {showBanner && (
        <div className="cookie-banner cookie-banner--floating" role="dialog" aria-label="Cookie consent">
          <div className="cookie-banner__glow cookie-banner__glow--1" />
          <div className="cookie-banner__glow cookie-banner__glow--2" />

          <div className="cookie-banner__text">
            <span className="cookie-banner__badge">
              <HiSparkles />
              Privacy First
            </span>
            <strong>
              <HiShieldCheck />
              Cookie Preferences
            </strong>
            <p>
              We use essential cookies for sign-in/session flow and optional cookies for analytics and marketing.
            </p>
          </div>
          <div className="cookie-banner__actions">
            <button type="button" className="cookie-btn cookie-btn--ghost" onClick={() => setShowSettings(true)}>
              <HiAdjustments />
              Customize
            </button>
            <button type="button" className="cookie-btn cookie-btn--light" onClick={acceptEssentialOnly}>
              Essential Only
            </button>
            <button type="button" className="cookie-btn cookie-btn--primary" onClick={acceptAll}>
              Accept All
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="cookie-modal-overlay" onClick={() => setShowSettings(false)}>
          <div
            className="cookie-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Manage cookie preferences"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Manage Cookie Preferences</h3>
            <p>Adjust optional cookies anytime. Essential cookies remain enabled for security and sign-in.</p>

            <label className="cookie-toggle">
              <span>Necessary Cookies</span>
              <input type="checkbox" checked disabled />
            </label>

            <label className="cookie-toggle">
              <span>Analytics Cookies</span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, analytics: event.target.checked }))
                }
              />
            </label>

            <label className="cookie-toggle">
              <span>Marketing Cookies</span>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, marketing: event.target.checked }))
                }
              />
            </label>

            <div className="cookie-modal__actions">
              <button
                type="button"
                className="cookie-btn cookie-btn--light"
                onClick={acceptEssentialOnly}
              >
                Essential Only
              </button>
              <button
                type="button"
                className="cookie-btn cookie-btn--primary"
                onClick={saveCustomPreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
