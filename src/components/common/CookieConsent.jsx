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
  HiCog,
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
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

const Button = ({ children, variant = "ghost", onClick, fullWidth }) => (
  <button
    className={`cc-btn ${variant} ${fullWidth ? 'full-width' : ''}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default function CookieConsent() {
  const stored = useMemo(() => readStoredPreferences(), []);
  const [open, setOpen] = useState(!stored?.consentGiven);
  const [settings, setSettings] = useState(false);
  const [prefs, setPrefs] = useState(stored || defaultPrefs);

  useEffect(() => {
    const handler = () => setSettings(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler);
  }, []);

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
            <div className="cc-content">
              <div className="cc-header">
                <div className="cc-icon-bg">
                  <HiShieldCheck />
                </div>
                <div>
                  <span className="cc-tag">
                    <HiSparkles /> Privacy First
                  </span>
                  <h3>We value your privacy</h3>
                  <p>We use cookies to enhance your experience, security, and performance.</p>
                </div>
              </div>

              <div className="cc-actions">
                <Button onClick={() => setSettings(true)}>Customize</Button>
                <Button onClick={() => save({ analytics: false, marketing: false })}>Essential Only</Button>
                <Button variant="primary" onClick={() => save({ analytics: true, marketing: true })}>Accept All</Button>
              </div>
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
              <div className="cc-modal-header">
                <div>
                  <h3>Cookie Preferences</h3>
                  <p>Choose what data we can collect about you</p>
                </div>
                <button className="cc-close" onClick={() => setSettings(false)}>
                  <HiX />
                </button>
              </div>

              <div className="cc-body">
                <Row
                  icon={HiLockClosed}
                  title="Essential Cookies"
                  desc="Required for security & core features"
                  checked
                  disabled
                />
                <Row
                  icon={HiChartBar}
                  title="Analytics"
                  desc="Help improve performance"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                />
                <Row
                  icon={HiSpeakerphone}
                  title="Marketing"
                  desc="Personalized content & offers"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                />
              </div>

              <div className="cc-footer">
                <Button onClick={() => save({ analytics: false, marketing: false })}>Save Essentials</Button>
                <Button variant="primary" onClick={() => save(prefs)}>Save Preferences</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}