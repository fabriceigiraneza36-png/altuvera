// src/components/common/CookieConsent.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
    };
  } catch {
    return null;
  }
};

const Toggle = ({ checked, onChange, disabled }) => (
  <label className={`cc-toggle ${checked ? "on" : ""} ${disabled ? "off" : ""}`}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span />
  </label>
);

const Row = ({ icon: Icon, title, desc, checked, onChange, disabled }) => (
  <div className={`cc-row ${disabled ? "disabled" : ""}`}>
    <div className="cc-row-left">
      <span className="cc-icon">
        <Icon />
      </span>
      <div>
        <h5>{title}</h5>
        <p>{desc}</p>
      </div>
    </div>

    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

const Button = ({ children, variant = "ghost", onClick }) => (
  <button className={`cc-btn ${variant}`} onClick={onClick}>
    {children}
  </button>
);

export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);

  // STRICT: only hidden when consent is given
  const [open, setOpen] = useState(!stored?.consentGiven);
  const [settings, setSettings] = useState(false);
  const [prefs, setPrefs] = useState(stored || defaultPrefs);

  // external trigger support
  useEffect(() => {
    const handler = () => setSettings(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
  }, []);

  // Apple-style background focus effect
  useEffect(() => {
    const active = open || settings;
    document.body.classList.toggle("cc-active", active);
    return () => document.body.classList.remove("cc-active");
  }, [open, settings]);

  const save = useCallback((data) => {
    const final = {
      ...defaultPrefs,
      ...data,
      necessary: true,
      consentGiven: true,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(final));

    setPrefs(final);
    setOpen(false);
    setSettings(false);
  }, []);

  return (
    <>
      {/* ================= BANNER ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="cc-banner"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 130, damping: 18 }}
          >
            <div className="cc-top">
              <div className="cc-mark">
                <HiShieldCheck />
              </div>

              <div>
                <span className="cc-tag">
                  <HiSparkles /> Privacy First
                </span>

                <h3>We use cookies</h3>
                <p>
                  We use cookies to improve your experience, security, and performance.
                </p>
              </div>
            </div>

            <div className="cc-actions">
              <Button onClick={() => setSettings(true)}>Customize</Button>

              <Button
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Essential
              </Button>

              <Button
                variant="primary"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Accept All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {settings && (
          <motion.div
            className="cc-overlay"
            onClick={() => setSettings(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cc-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <button className="cc-close" onClick={() => setSettings(false)}>
                <HiX />
              </button>

              <div className="cc-head">
                <h3>Cookie Preferences</h3>
                <p>Control how your data is used across the platform.</p>
              </div>

              <div className="cc-body">
                <Row
                  icon={HiLockClosed}
                  title="Essential"
                  desc="Required for security & core features"
                  checked
                  disabled
                />

                <Row
                  icon={HiChartBar}
                  title="Analytics"
                  desc="Help improve performance"
                  checked={prefs.analytics}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, analytics: e.target.checked }))
                  }
                />

                <Row
                  icon={HiSpeakerphone}
                  title="Marketing"
                  desc="Personalized content & offers"
                  checked={prefs.marketing}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, marketing: e.target.checked }))
                  }
                />
              </div>

              <div className="cc-footer">
                <Button
                  onClick={() =>
                    save({ analytics: false, marketing: false })
                  }
                >
                  Essential Only
                </Button>

                <Button
                  variant="primary"
                  onClick={() => save(prefs)}
                >
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}