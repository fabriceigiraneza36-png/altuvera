import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import {
  HiLogout, HiShieldCheck, HiBell, HiGlobeAlt,
  HiMoon, HiDeviceMobile, HiCheckCircle,
  HiExclamationCircle, HiSparkles, HiRefresh,
} from "react-icons/hi";
import {
  FiSave, FiLayout, FiCheck, FiAlertCircle,
  FiToggleLeft, FiToggleRight, FiChevronRight,
  FiLogOut, FiShield, FiGlobe, FiBell,
  FiZap,
} from "react-icons/fi";

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const css = `
  .us-root * { box-sizing: border-box; }
  .us-root {
    display: flex; flex-direction: column; gap: 1.5rem;
    animation: usFadeIn 0.5s ease-out;
  }

  /* ── Notification ── */
  .us-notif {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; border-radius: 14px;
    font-size: 0.88rem; font-weight: 600;
    animation: usSlideIn 0.3s ease;
  }
  .us-notif.success { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
  .us-notif.error   { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }

  /* ── Card ── */
  .us-card {
    background: #fff; border-radius: 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }
  .us-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); }

  /* ── Card header ── */
  .us-card-header {
    display: flex; align-items: center; gap: 12px;
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    background: #fafdfb;
  }
  .us-card-header-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; display: flex; align-items: center;
    justify-content: center; font-size: 1rem; flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(5,150,105,0.2);
  }
  .us-card-header h2 {
    margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a;
  }
  .us-card-header p {
    margin: 2px 0 0; font-size: 0.78rem; color: #64748b;
  }
  .us-card-accent {
    width: 4px; height: 20px; background: #059669;
    border-radius: 2px; flex-shrink: 0;
  }

  /* ── Card body ── */
  .us-card-body { padding: 1.25rem 1.75rem; }
  .us-card-body .us-fields { display: flex; flex-direction: column; gap: 10px; }

  /* ── Toggle Row ── */
  .us-toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 14px 16px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; background: #fff;
    cursor: pointer; transition: all 0.2s ease;
    user-select: none;
  }
  .us-toggle-row:hover { border-color: #bbf7d0; background: #fafdfb; }
  .us-toggle-row.active { border-color: #a7f3d0; background: #f0fdf4; }

  .us-toggle-left { display: flex; align-items: center; gap: 12px; }
  .us-toggle-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem; flex-shrink: 0;
    background: #f1f5f9; color: #64748b;
    transition: all 0.2s;
  }
  .us-toggle-row.active .us-toggle-icon { background: #dcfce7; color: #059669; }
  .us-toggle-label {
    font-size: 0.9rem; font-weight: 700; color: #0f172a; margin: 0 0 2px;
  }
  .us-toggle-desc {
    font-size: 0.75rem; color: #94a3b8; margin: 0; line-height: 1.4;
  }

  /* ── Custom Toggle Switch ── */
  .us-switch {
    position: relative; width: 44px; height: 24px; flex-shrink: 0;
  }
  .us-switch input { opacity: 0; width: 0; height: 0; }
  .us-switch-track {
    position: absolute; inset: 0; border-radius: 24px;
    background: #e2e8f0; transition: background 0.25s ease;
    cursor: pointer;
  }
  .us-switch-track::after {
    content: ''; position: absolute;
    left: 3px; top: 50%; transform: translateY(-50%);
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; transition: left 0.25s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .us-switch input:checked ~ .us-switch-track { background: #059669; }
  .us-switch input:checked ~ .us-switch-track::after { left: 23px; }

  /* ── Select ── */
  .us-select-wrap { display: flex; flex-direction: column; gap: 6px; }
  .us-select-wrap label {
    font-size: 0.75rem; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.5px;
    display: flex; align-items: center; gap: 6px;
  }
  .us-select-wrap label svg { color: #059669; }
  .us-select {
    width: 100%; padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; font-size: 0.9rem; color: #0f172a;
    background: #fff; outline: none; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }
  .us-select:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }

  /* ── Inline select (right-aligned in toggle row) ── */
  .us-select-inline {
    padding: 6px 28px 6px 10px; border-radius: 8px;
    border: 1.5px solid #e2e8f0; font-size: 0.82rem; color: #0f172a;
    background: #f8fafc; outline: none; font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
  }
  .us-select-inline:focus { border-color: #059669; outline: none; }

  /* ── Input ── */
  .us-input {
    width: 100%; padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; font-size: 0.9rem; color: #0f172a;
    background: #fff; outline: none; font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .us-input:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.1);
  }
  .us-input-hint { font-size: 0.75rem; color: #94a3b8; margin: 6px 0 0; }

  /* ── Sync bar ── */
  .us-sync-bar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
    padding: 10px 16px; border-radius: 10px;
    background: #f8fafc; border: 1px solid #f1f5f9;
    font-size: 0.78rem; color: #64748b;
  }
  .us-sync-dot {
    display: inline-block; width: 7px; height: 7px;
    border-radius: 50%; margin-right: 6px; vertical-align: middle;
  }
  .us-sync-dot.saving { background: #f59e0b; animation: usPulse 1s infinite; }
  .us-sync-dot.saved  { background: #10b981; }
  .us-sync-dot.dirty  { background: #f97316; }
  .us-sync-dot.error  { background: #ef4444; }
  .us-sync-dot.idle   { background: #94a3b8; }

  /* ── Buttons ── */
  .us-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 12px;
    font-size: 0.88rem; font-weight: 700;
    cursor: pointer; border: none; transition: all 0.2s ease;
    font-family: inherit;
  }
  .us-btn-primary {
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.3);
  }
  .us-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(5,150,105,0.4);
  }
  .us-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .us-btn-danger {
    background: #fef2f2; color: #dc2626;
    border: 1.5px solid #fecaca;
  }
  .us-btn-danger:hover {
    background: #fee2e2; border-color: #f87171;
    transform: translateY(-1px);
  }
  .us-btn-ghost {
    background: #f8fafc; color: #475569;
    border: 1.5px solid #e2e8f0;
  }
  .us-btn-ghost:hover { background: #f1f5f9; color: #0f172a; }

  /* ── Security info ── */
  .us-security-info {
    padding: 14px 16px; border-radius: 12px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    font-size: 0.85rem; color: #166534; line-height: 1.6;
  }
  .us-security-info strong { color: #065f46; }

  /* ── Danger zone ── */
  .us-danger-card {
    background: #fff; border-radius: 18px;
    border: 1.5px solid #fecaca;
    box-shadow: 0 4px 20px rgba(220,38,38,0.05);
    overflow: hidden;
  }
  .us-danger-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #fef2f2;
    background: #fef2f2;
    display: flex; align-items: center; gap: 12px;
  }
  .us-danger-header h2 { margin:0; font-size:1rem; font-weight:800; color:#991b1b; }
  .us-danger-body { padding: 1.25rem 1.75rem; }
  .us-danger-body p { margin:0 0 16px; font-size:0.88rem; color:#64748b; }

  /* ── Account control link ── */
  .us-control-link {
    display: inline-flex; align-items: center; gap: 6px;
    color: #059669; font-weight: 700; font-size: 0.88rem;
    text-decoration: none; padding: 8px 14px; border-radius: 10px;
    background: #ecfdf5; border: 1px solid #a7f3d0;
    transition: all 0.2s;
  }
  .us-control-link:hover { background: #d1fae5; transform: translateX(3px); }

  /* ── Spinner ── */
  .us-spin { animation: usSpin 0.8s linear infinite; }

  /* ── Keyframes ── */
  @keyframes usFadeIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes usSlideIn { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }
  @keyframes usSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes usPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .us-card-body { padding: 1rem 1.25rem; }
    .us-card-header { padding: 1rem 1.25rem; }
    .us-danger-header, .us-danger-body { padding: 1rem 1.25rem; }
    .us-toggle-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;

// ─── Toggle Row Component ─────────────────────────────────────────────────────
function ToggleRow({ icon, label, desc, checked, onChange, right }) {
  return (
    <label className={`us-toggle-row ${checked ? "active" : ""}`}>
      <div className="us-toggle-left">
        <div className="us-toggle-icon">{icon}</div>
        <div>
          <p className="us-toggle-label">{label}</p>
          {desc && <p className="us-toggle-desc">{desc}</p>}
        </div>
      </div>
      {right || (
        <label className="us-switch" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="us-switch-track" />
        </label>
      )}
    </label>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="us-card">
      <div className="us-card-header">
        <div className="us-card-header-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="us-card-body">
        <div className="us-fields">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserSettings() {
  const { user, logout, updateProfile } = useUserAuth();
  const navigate = useNavigate();
  const [saving,    setSaving]    = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");
  const timerRef = useRef(null);

  const initialPrefs = useMemo(() => ({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications:   user?.preferences?.smsNotifications   ?? false,
    marketingEmails:    user?.preferences?.marketingEmails    ?? true,
    language:           user?.preferences?.language           || "en",
    travelUpdates:      user?.preferences?.travelUpdates      ?? true,
    autoFillForms:      user?.preferences?.autoFillForms      ?? true,
    defaultCategory:    user?.preferences?.defaultCategory    || "all",
    loaderPreference:   user?.preferences?.loaderPreference   || "default",
    customLoaderText:   user?.preferences?.customLoaderText   || "",
    reducedAnimations:  user?.preferences?.reducedAnimations  ?? false,
    defaultView:        user?.preferences?.defaultView        || "grid",
  }), [user]);

  const [preferences, setPreferences] = useState(initialPrefs);

  useEffect(() => { setPreferences(initialPrefs); }, [initialPrefs]);

  const handleLogout = useCallback(() => { logout(); navigate("/"); }, [logout, navigate]);

  const persistPreferences = useCallback(async (nextPrefs, { silent = false } = {}) => {
    try {
      setSaving(true);
      setSyncState("saving");
      setError("");
      await updateProfile({ preferences: nextPrefs });
      setSyncState("saved");
      if (!silent) {
        setSuccess("Settings updated successfully.");
        setTimeout(() => setSuccess(""), 3500);
      }
    } catch (err) {
      setSyncState("error");
      setError(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }, [updateProfile]);

  const updatePreference = useCallback((key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSyncState("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => persistPreferences(next, { silent: true }),
      700,
    );
  }, [preferences, persistPreferences]);

  const saveNow = useCallback(
    () => persistPreferences(preferences),
    [preferences, persistPreferences],
  );

  const syncLabel =
    saving         ? "Saving…"         :
    syncState === "saved"  ? "All changes saved" :
    syncState === "dirty"  ? "Unsaved changes"   :
    syncState === "error"  ? "Error saving"       :
    "Ready";

  return (
    <>
      <Helmet>
        <title>Settings | Altuvera</title>
        <meta name="description" content="Manage your preferences, privacy, and account security." />
      </Helmet>

      <DashboardLayout
        title="Settings"
        subtitle="Preferences, notifications, and account security."
      >
        <style>{css}</style>
        <div className="us-root">

          {/* ── Notifications ── */}
          {success && (
            <div className="us-notif success">
              <HiCheckCircle size={18} /> {success}
            </div>
          )}
          {error && (
            <div className="us-notif error">
              <HiExclamationCircle size={18} /> {error}
            </div>
          )}

          {/* ── Notification Preferences ── */}
          <SectionCard
            icon={<FiBell size={18} />}
            title="Notifications"
            subtitle="Control how we reach you"
          >
            {[
              {
                key: "emailNotifications",
                icon: <HiBell size={16} />,
                label: "Email Notifications",
                desc: "Trip reminders, booking confirmations, and alerts.",
              },
              {
                key: "smsNotifications",
                icon: <HiDeviceMobile size={16} />,
                label: "SMS Notifications",
                desc: "Critical travel updates via text message.",
              },
              {
                key: "marketingEmails",
                icon: <HiSparkles size={16} />,
                label: "Marketing Emails",
                desc: "Offers, destination picks, and seasonal campaigns.",
              },
              {
                key: "travelUpdates",
                icon: <HiGlobeAlt size={16} />,
                label: "Travel Updates",
                desc: "Safety advisories and destination news.",
              },
            ].map(({ key, icon, label, desc }) => (
              <ToggleRow
                key={key}
                icon={icon}
                label={label}
                desc={desc}
                checked={Boolean(preferences[key])}
                onChange={(e) => updatePreference(key, e.target.checked)}
              />
            ))}
          </SectionCard>

          {/* ── Experience ── */}
          <SectionCard
            icon={<FiGlobe size={18} />}
            title="Experience"
            subtitle="Language, appearance, and defaults"
          >
            {/* Language */}
            <div className="us-select-wrap">
              <label>
                <HiGlobeAlt /> Language
              </label>
              <select
                className="us-select"
                value={preferences.language}
                onChange={(e) => updatePreference("language", e.target.value)}
              >
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 French</option>
                <option value="sw">🇰🇪 Swahili</option>
              </select>
            </div>

            {/* Auto-fill */}
            <ToggleRow
              icon={<HiRefresh size={16} />}
              label="Auto-fill Forms"
              desc="Pre-fill booking forms with your saved information."
              checked={Boolean(preferences.autoFillForms)}
              onChange={(e) => updatePreference("autoFillForms", e.target.checked)}
            />

            {/* Default View */}
            <ToggleRow
              icon={<FiLayout size={16} />}
              label="Default Destination View"
              desc="Choose how destinations are displayed."
              checked={false}
              right={
                <select
                  className="us-select-inline"
                  value={preferences.defaultView}
                  onChange={(e) => {
                    e.stopPropagation();
                    updatePreference("defaultView", e.target.value);
                  }}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                  <option value="map">Map</option>
                </select>
              }
            />
          </SectionCard>

          {/* ── Personalization ── */}
          <SectionCard
            icon={<HiSparkles size={18} />}
            title="Personalization"
            subtitle="Tailor your Altuvera experience"
          >
            {/* Default Category */}
            <div className="us-select-wrap">
              <label>
                <HiSparkles /> Default Destination Category
              </label>
              <select
                className="us-select"
                value={preferences.defaultCategory}
                onChange={(e) => updatePreference("defaultCategory", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="safari">🦁 Safari Adventures</option>
                <option value="beach">🏖️ Beach Escapes</option>
                <option value="cultural">🏛️ Cultural Immersion</option>
                <option value="trekking">🏔️ Mountain Trekking</option>
                <option value="photography">📸 Photography Tours</option>
              </select>
            </div>

            {/* Loader Preference */}
            <div className="us-select-wrap">
              <label>
                <FiZap /> Loading Screen Style
              </label>
              <select
                className="us-select"
                value={preferences.loaderPreference}
                onChange={(e) => updatePreference("loaderPreference", e.target.value)}
              >
                <option value="default">Default Altuvera</option>
                <option value="personalized">Personalized (with your name)</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            {/* Custom Loader Text */}
            {preferences.loaderPreference === "personalized" && (
              <div className="us-select-wrap">
                <label>Custom Loader Message</label>
                <input
                  type="text"
                  className="us-input"
                  value={preferences.customLoaderText || ""}
                  onChange={(e) =>
                    updatePreference("customLoaderText", e.target.value.slice(0, 100))
                  }
                  placeholder={`e.g. "Ready for adventure, ${user?.fullName?.split(" ")[0] || "Traveler"}?"`}
                />
                <p className="us-input-hint">
                  Shown on the loading screen when you're signed in. Max 100 characters.
                </p>
              </div>
            )}

            {/* Reduced Animations */}
            <ToggleRow
              icon={<HiDeviceMobile size={16} />}
              label="Reduced Animations"
              desc="Improve performance on slower devices."
              checked={Boolean(preferences.reducedAnimations)}
              onChange={(e) => updatePreference("reducedAnimations", e.target.checked)}
            />
          </SectionCard>

          {/* ── Security ── */}
          <SectionCard
            icon={<FiShield size={18} />}
            title="Security"
            subtitle="Passwordless authentication & session info"
          >
            <div className="us-security-info">
              <p style={{ margin: "0 0 8px" }}>
                Your account uses <strong>passwordless authentication</strong>. Verification
                codes are sent securely to <strong>{user?.email}</strong>.
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#166534", opacity: 0.8 }}>
                Keep this email accessible while traveling to ensure uninterrupted access.
              </p>
            </div>

            {/* Sync Status + Save */}
            <div className="us-sync-bar">
              <span>
                <span className={`us-sync-dot ${syncState}`} />
                {syncLabel}
              </span>
              <button
                className="us-btn us-btn-primary"
                disabled={saving || syncState === "idle" || syncState === "saved"}
                onClick={saveNow}
                style={{ padding: "8px 18px", fontSize: "0.82rem" }}
              >
                {saving
                  ? <><HiRefresh size={14} className="us-spin" /> Saving…</>
                  : <><FiSave size={14} /> Save Now</>
                }
              </button>
            </div>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <div className="us-danger-card">
            <div className="us-danger-header">
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "#fecaca", color: "#dc2626",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <FiLogOut size={16} />
              </div>
              <h2>Session</h2>
            </div>
            <div className="us-danger-body">
              <p>Sign out of your current session on this device. Your data will remain safe.</p>
              <button className="us-btn us-btn-danger" onClick={handleLogout}>
                <HiLogout size={16} /> Sign Out
              </button>
            </div>
          </div>

          {/* ── Account Control Link ── */}
          <div>
            <Link to="/auth/user-account-control" className="us-control-link">
              Manage Account <FiChevronRight size={15} />
            </Link>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}