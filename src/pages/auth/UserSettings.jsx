import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/users/DashboardLayout";
import {
  HiLogout,
  HiShieldCheck,
  HiBell,
  HiGlobeAlt,
  HiMoon,
  HiDeviceMobile,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import "./AuthPages.css";
import { Link } from "react-router-dom";

export default function UserSettings() {
  const { user, logout, updateProfile } = useUserAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const initialPrefs = useMemo(
    () => ({
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      smsNotifications: user?.preferences?.smsNotifications ?? false,
      marketingEmails: user?.preferences?.marketingEmails ?? true,
      darkMode: user?.preferences?.darkMode ?? false,
      language: user?.preferences?.language || "en",
      travelUpdates: user?.preferences?.travelUpdates ?? true,
    }),
    [user],
  );

  const [preferences, setPreferences] = useState(initialPrefs);

  useEffect(() => {
    setPreferences(initialPrefs);
  }, [initialPrefs]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const persistPreferences = async (nextPrefs, { silent = false } = {}) => {
    try {
      setSaving(true);
      setSyncState("saving");
      setError("");
      await updateProfile({ preferences: nextPrefs });
      setSyncState("saved");
      if (!silent) {
        setSuccess("Settings updated successfully.");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setSyncState("error");
      setError(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSyncState("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => persistPreferences(next, { silent: true }),
      700,
    );
  };

  const saveNow = () => persistPreferences(preferences);

  return (
    <>
      <Helmet>
        <title>Settings | Altuvera</title>
      </Helmet>

      <DashboardLayout
        title="Settings"
        subtitle="Realtime preferences, privacy controls, and account security."
      >
        {success && (
          <div className="auth-page-message success">
            <HiCheckCircle size={18} /> {success}
          </div>
        )}
        {error && (
          <div className="auth-page-message error">
            <HiExclamationCircle size={18} /> {error}
          </div>
        )}

        <div className="settings-section">
          <div className="settings-section-header">
            <HiBell />
            <h2>Notifications</h2>
          </div>
          <div className="settings-fields">
            {[
              [
                "emailNotifications",
                "Email notifications",
                "Trip reminders, booking confirmations, and alerts.",
              ],
              [
                "smsNotifications",
                "SMS notifications",
                "Critical travel updates via SMS.",
              ],
              [
                "marketingEmails",
                "Marketing emails",
                "Offers, destination picks, and seasonal campaigns.",
              ],
              [
                "travelUpdates",
                "Travel updates",
                "Safety advisories and destination updates.",
              ],
            ].map(([key, label, desc]) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.85rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                    {desc}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(preferences[key])}
                  onChange={(e) => updatePreference(key, e.target.checked)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <HiGlobeAlt />
            <h2>Experience</h2>
          </div>
          <div className="settings-fields">
            <label className="settings-field">
              <span>Language</span>
              <select
                value={preferences.language}
                onChange={(e) => updatePreference("language", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
              </select>
            </label>

            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <HiMoon />
                <span style={{ fontWeight: 600 }}>Dark mode preference</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(preferences.darkMode)}
                onChange={(e) => updatePreference("darkMode", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-header">
            <HiShieldCheck />
            <h2>Security</h2>
          </div>
          <p
            style={{ color: "#666", fontSize: "0.9rem", margin: "0 0 0.5rem" }}
          >
            Your account uses passwordless authentication. Sign-in verification
            codes are sent securely to <strong>{user?.email}</strong>.
          </p>
          <p style={{ color: "#888", fontSize: "0.82rem" }}>
            <HiDeviceMobile
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />
            Keep this email accessible while traveling.
          </p>

          <div
            style={{ marginTop: "1rem", fontSize: "0.82rem", color: "#64748b" }}
          >
            Sync status:{" "}
            <strong
              style={{ color: syncState === "error" ? "#dc2626" : "#0f172a" }}
            >
              {saving
                ? "Saving..."
                : syncState === "saved"
                  ? "Saved"
                  : syncState === "dirty"
                    ? "Unsaved changes"
                    : "Ready"}
            </strong>
          </div>

          <button
            className="settings-save-btn"
            disabled={saving}
            onClick={saveNow}
          >
            {saving ? "Saving..." : "Save Now"}
          </button>
        </div>

        <div className="settings-section danger">
          <h2>Session</h2>
          <p>Sign out of your current session on this device.</p>
          <button className="danger-btn" onClick={handleLogout}>
            <HiLogout style={{ marginRight: "6px" }} /> Sign Out
          </button>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Link
            to="/users/user-account-control"
            style={{ color: "#10b981", fontWeight: "600" }}
          >
            Go to User Account Control
          </Link>
        </div>
      </DashboardLayout>
    </>
  );
}
