import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import {
  HiLogout, HiBell, HiCheckCircle,
  HiExclamationCircle, HiSparkles, HiRefresh,
} from "react-icons/hi";
import {
  FiSave, FiLogOut, FiShield, FiBell,
} from "react-icons/fi";

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const css = `
  .us-root * { box-sizing: border-box; }
  .us-root {
    display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(12px, 2vw, 20px);
    width: 100%; min-width: 0; animation: usFadeIn 0.5s ease-out;
  }
  /* The global dashboard shell reserves space for a fixed navbar. The site
     navbar is in normal flow, so settings must not add that space a second time. */
  .dashboard-layout:has(.us-root) { padding-top: 0; }
  .dashboard-layout:has(.us-root) .dashboard-content {
    padding: clamp(14px, 2.5vw, 28px); min-width: 0; max-width: 1180px;
  }
  .dashboard-layout:has(.us-root) .dashboard-header { margin-bottom: 14px; }
  .us-root .us-card { min-width: 0; }
  .us-root .us-card-body .us-fields { gap: 8px; }
  .us-root .us-toggle-row { min-width: 0; padding: 12px 14px; }
  .us-root .us-toggle-left { min-width: 0; }
  .us-root .us-toggle-label, .us-root .us-toggle-desc { overflow-wrap: anywhere; }
  .us-root .us-toggle-desc { line-height: 1.45; }
  .us-root .us-card-header { padding: 16px 20px; }
  .us-root .us-card-body { padding: 16px 20px; }
  .us-root .us-danger-body, .us-root .us-danger-header { padding: 16px 20px; }
  @media (min-width: 900px) {
    .us-root { grid-template-columns: minmax(0, 1fr) minmax(280px, .72fr); align-items: start; }
    .us-root > .us-card { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    .dashboard-layout:has(.us-root) .dashboard-content { padding: 12px; }
    .dashboard-layout:has(.us-root) .dashboard-header { margin-bottom: 10px; }
    .us-root { gap: 12px; }
    .us-root .us-card-header { padding: 14px 16px; }
    .us-root .us-card-body { padding: 12px; }
    .us-root .us-toggle-row { flex-direction: row; align-items: center; gap: 10px; }
    .us-root .us-toggle-left { flex: 1; }
    .us-root .us-toggle-icon { width: 32px; height: 32px; }
    .us-root .us-toggle-label { font-size: .84rem; }
    .us-root .us-toggle-desc { font-size: .72rem; }
    .us-root .us-switch { margin-left: auto; }
    .us-root .us-danger-header, .us-root .us-danger-body { padding: 14px 16px; }
  }
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
function UserPushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState(() => typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const apiBase = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

  const toUint8Array = (value) => {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const decoded = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
  };

  useEffect(() => {
    let active = true;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSupported(false);
      return () => { active = false; };
    }
    setSupported(true);
    navigator.serviceWorker.register("/push-sw.js", { scope: "/" })
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => { if (active) setSubscribed(Boolean(subscription)); })
      .catch(() => { if (active) setMessage("Push is not available in this browser yet. Try updating your browser and reopening Altuvera."); });
    return () => { active = false; };
  }, []);

  const enablePush = async () => {
    setLoading(true); setMessage("");
    try {
      if (!("Notification" in window)) throw new Error("This browser does not support web notifications.");
      let currentPermission = Notification.permission;
      if (currentPermission !== "granted") {
        currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);
      }
      if (currentPermission !== "granted") throw new Error(currentPermission === "denied"
        ? "Notifications are blocked by your browser. Allow them in site settings, then try again."
        : "Please allow notifications to continue.");
      const keyResponse = await fetch(`${apiBase}/push/vapid-public-key`);
      if (!keyResponse.ok) throw new Error("Could not connect to Altuvera's notification service.");
      const keyData = await keyResponse.json();
      if (!keyData.publicKey) throw new Error("Push notifications are not configured on the server yet.");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, applicationServerKey: toUint8Array(keyData.publicKey),
      });
      const token = localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token") || "";
      if (!token) throw new Error("Please sign in again before enabling push notifications.");
      const response = await fetch(`${apiBase}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ endpoint: subscription.endpoint, p256dh: subscription.toJSON().keys?.p256dh, auth: subscription.toJSON().keys?.auth, userAgent: navigator.userAgent }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || "Could not save this device subscription.");
      setSubscribed(true); setPermission("granted"); setMessage("Push notifications are enabled on this device.");
    } catch (error) { setMessage(error.message || "Could not enable push notifications."); }
    finally { setLoading(false); }
  };

  const disablePush = async () => {
    setLoading(true); setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const token = localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token") || "";
        await fetch(`${apiBase}/push/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false); setMessage("Push notifications are disabled on this device.");
    } catch (error) { setMessage(error.message || "Could not disable push notifications."); }
    finally { setLoading(false); }
  };

  return (
    <SectionCard icon={<FiBell size={18} />} title="Push Notifications" subtitle="Receive important booking, account, and travel updates even when Altuvera is not open">
      {!supported ? (
        <p style={{ margin: 0, color: "#64748b", fontSize: ".88rem" }}>This browser does not support web push notifications. Try a supported browser or install Altuvera from a supported browser on your device.</p>
      ) : (
        <>
          <div className="us-security-info">
            <strong>{subscribed ? "This device is subscribed" : "Push notifications are not enabled on this device"}</strong>
            <p style={{ margin: "6px 0 0" }}>Browser permission: <strong>{permission}</strong>. You can change this choice at any time.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button className="us-btn us-btn-primary" type="button" onClick={subscribed ? disablePush : enablePush} disabled={loading}>
              {loading ? "Please wait…" : subscribed ? "Disable on this device" : "Enable push notifications"}
            </button>
            {message && <p role="status" style={{ margin: 0, fontSize: ".82rem", color: message.includes("enabled") || message.includes("disabled") ? "#047857" : "#b91c1c", flexBasis: "100%" }}>{message}</p>}
          </div>
        </>
      )}
    </SectionCard>
  );
}

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
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    marketingEmails: user?.preferences?.marketingEmails ?? false,
    travelUpdates: user?.preferences?.travelUpdates ?? true,
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
                key: "marketingEmails",
                icon: <HiSparkles size={16} />,
                label: "Marketing Emails",
                desc: "Offers, destination picks, and seasonal campaigns.",
              },
              {
                key: "travelUpdates",
                icon: <HiSparkles size={16} />,
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

          <UserPushNotifications />

          {/* Experience and personalization controls that were not connected to
              working site behavior have been removed. */}

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
        </div>
      </DashboardLayout>
    </>
  );
}