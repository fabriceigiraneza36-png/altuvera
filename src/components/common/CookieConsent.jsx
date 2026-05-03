// src/components/common/CookieConsent.jsx

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
import "./CookieConsent.css";

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

const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={`cookie-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-track">
        <span className="toggle-thumb">
          {checked && <HiCheck />}
        </span>
      </span>
    </label>
  );
};

const CookieCard = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`cookie-card ${disabled ? "disabled" : ""}`}>
      <div className="cookie-card-left">
        <div className="cookie-card-icon">
          <Icon />
        </div>

        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

const Button = ({
  children,
  variant = "secondary",
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cookie-btn ${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);
  const [preferences, setPreferences] = useState(stored || defaultPrefs);
  const [showBanner, setShowBanner] = useState(!stored);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const openSettings = () => setShowSettings(true);

    window.addEventListener(
      OPEN_COOKIE_SETTINGS_EVENT,
      openSettings
    );

    return () =>
      window.removeEventListener(
        OPEN_COOKIE_SETTINGS_EVENT,
        openSettings
      );
  }, []);

  useEffect(() => {
    if (showSettings) {
      document.body.classList.add("cookie-lock");
    } else {
      document.body.classList.remove("cookie-lock");
    }

    return () =>
      document.body.classList.remove("cookie-lock");
  }, [showSettings]);

  const persistPreferences = useCallback((nextPrefs) => {
    const finalPrefs = {
      ...defaultPrefs,
      ...nextPrefs,
      necessary: true,
      consentGiven: true,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      COOKIE_PREFS_KEY,
      JSON.stringify(finalPrefs)
    );

    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = () => {
    persistPreferences({
      analytics: true,
      marketing: true,
    });
  };

  const acceptEssentialOnly = () => {
    persistPreferences({
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomPreferences = () => {
    persistPreferences(preferences);
  };

  return (
    <>
      {showBanner && (
        <div className="cookie-banner">
          <div className="cookie-banner-top">
            <div className="banner-icon">
              <HiShieldCheck />
            </div>

            <div className="banner-content">
              <span className="cookie-badge">
                <HiSparkles />
                Privacy First
              </span>

              <h2>We value your privacy</h2>

              <p>
                We use cookies to improve your browsing
                experience, maintain security, and help us
                improve our services.
              </p>
            </div>
          </div>

          <div className="cookie-actions">
            <Button
              variant="ghost"
              onClick={() => setShowSettings(true)}
            >
              <HiAdjustments />
              Customize
            </Button>

            <Button
              variant="secondary"
              onClick={acceptEssentialOnly}
            >
              Essential Only
            </Button>

            <Button
              variant="primary"
              onClick={acceptAll}
            >
              Accept All
            </Button>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="cookie-overlay"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="cookie-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setShowSettings(false)}
            >
              <HiX />
            </button>

            <div className="modal-header">
              <h3>Cookie Preferences</h3>

              <p>
                Manage how cookies are used on your account.
                Essential cookies are required for security
                and core platform functionality.
              </p>
            </div>

            <div className="modal-body">
              <CookieCard
                icon={HiLockClosed}
                title="Essential Cookies"
                description="Required for login, security and platform stability."
                checked={true}
                disabled={true}
              />

              <CookieCard
                icon={HiChartBar}
                title="Analytics Cookies"
                description="Help us improve performance and understand user behavior."
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    analytics: e.target.checked,
                  }))
                }
              />

              <CookieCard
                icon={HiSpeakerphone}
                title="Marketing Cookies"
                description="Used to personalize recommendations and promotions."
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    marketing: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={acceptEssentialOnly}
              >
                Essential Only
              </Button>

              <Button
                variant="primary"
                onClick={saveCustomPreferences}
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