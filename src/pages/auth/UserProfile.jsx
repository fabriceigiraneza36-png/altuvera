import React, { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCamera,
  HiCheck,
  HiPencil,
  HiOutlinePhotograph,
  HiRefresh,
  HiExclamationCircle,
  HiShieldCheck,
  HiStar,
  HiClock,
  HiFingerPrint,
} from "react-icons/hi";
import { FiSave, FiX, FiEdit3, FiAlertCircle, FiCheckCircle, FiLink } from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTOSAVE_DELAY = 900;
const SUCCESS_MESSAGE_DURATION = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SYNC_STATE = {
  IDLE: "idle",
  DIRTY: "dirty",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
};

// ─── Inline Styles (scoped) ───────────────────────────────────────────────────
const css = `
  /* ── Reset & Base ── */
  .up-root * { box-sizing: border-box; }

  /* ── Layout wrapper ── */
  .up-root {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: upFadeIn 0.5s ease-out;
  }

  /* ── Hero Banner ── */
  .up-hero {
    position: relative;
    background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%);
    border-radius: 20px;
    padding: 2.5rem 2rem 2rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .up-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .up-hero::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }

  /* ── Avatar section ── */
  .up-avatar-wrap {
    position: relative;
    flex-shrink: 0;
    z-index: 2;
  }
  .up-avatar {
    width: 110px; height: 110px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.25);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    background: linear-gradient(135deg, #059669, #34d399);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; font-weight: 800; color: #fff;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    user-select: none;
  }
  .up-avatar:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
  .up-avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1.6rem;
    pointer-events: none;
    z-index: 3;
  }
  .up-camera-btn {
    position: absolute; bottom: 4px; right: 4px;
    width: 34px; height: 34px; border-radius: 50%;
    background: #059669; border: 2px solid #fff;
    color: #fff; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.25s ease;
    z-index: 4; box-shadow: 0 4px 12px rgba(5,150,105,0.5);
  }
  .up-camera-btn:hover { background: #047857; transform: scale(1.15); }
  .up-camera-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Hero info ── */
  .up-hero-info { flex: 1; z-index: 2; min-width: 180px; }
  .up-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 800;
    color: #fff; margin: 0 0 4px;
    line-height: 1.2;
  }
  .up-hero-email {
    color: rgba(255,255,255,0.7); font-size: 0.9rem;
    margin: 0 0 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .up-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .up-badge {
    padding: 4px 12px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .up-badge-role { background: rgba(255,255,255,0.15); color: #fff; }
  .up-badge-verified { background: rgba(16,185,129,0.3); color: #6ee7b7; border-color: rgba(16,185,129,0.4); }
  .up-badge-year { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }

  /* ── Hero actions ── */
  .up-hero-actions { z-index: 2; }
  .up-edit-hero-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 0.65rem 1.4rem; border-radius: 10px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
    backdrop-filter: blur(8px);
  }
  .up-edit-hero-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  /* ── Notification ── */
  .up-notif {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 1rem 1.25rem; border-radius: 12px;
    font-size: 0.9rem; font-weight: 500;
    animation: upSlideIn 0.3s ease;
  }
  .up-notif.success {
    background: #ecfdf5; color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .up-notif.error {
    background: #fef2f2; color: #991b1b;
    border: 1px solid #fecaca;
  }
  .up-notif-left { display: flex; align-items: center; gap: 10px; }
  .up-notif-dismiss {
    background: transparent; border: none; cursor: pointer;
    color: inherit; opacity: 0.5; padding: 4px; border-radius: 6px;
    display: flex; align-items: center; transition: opacity 0.2s;
  }
  .up-notif-dismiss:hover { opacity: 1; }

  /* ── Card ── */
  .up-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }
  .up-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

  /* ── Card Header ── */
  .up-card-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    background: #fafdfb;
  }
  .up-card-title-row { display: flex; align-items: center; gap: 10px; }
  .up-card-accent { width: 5px; height: 22px; background: #059669; border-radius: 3px; }
  .up-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0; }
  .up-card-actions { display: flex; align-items: center; gap: 8px; }

  /* ── Sync status ── */
  .up-sync-bar {
    padding: 0.6rem 1.75rem;
    border-bottom: 1px solid #f8fafc;
    font-size: 0.78rem; color: #64748b;
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap;
    background: #f8fafc;
  }
  .up-sync-dot {
    display: inline-block;
    width: 7px; height: 7px; border-radius: 50%;
    margin-right: 6px; vertical-align: middle;
  }
  .up-sync-dot.saving  { background: #f59e0b; animation: upPulse 1s infinite; }
  .up-sync-dot.saved   { background: #10b981; }
  .up-sync-dot.dirty   { background: #f97316; }
  .up-sync-dot.error   { background: #ef4444; }
  .up-sync-dot.idle    { background: #94a3b8; }

  /* ── Form body ── */
  .up-form-body { padding: 1.75rem; }
  .up-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .up-field { display: flex; flex-direction: column; gap: 6px; }
  .up-field.full { grid-column: 1 / -1; }
  .up-field label {
    font-size: 0.78rem; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: 0.6px;
    display: flex; align-items: center; gap: 6px;
  }
  .up-field label svg { color: #059669; font-size: 1rem; }
  .up-field p {
    margin: 0; color: #0f172a; font-size: 0.95rem; font-weight: 500;
    padding: 0.65rem 0; border-bottom: 1px solid #f1f5f9;
    min-height: 44px; display: flex; align-items: center;
  }
  .up-field p.readonly { color: #64748b; font-weight: 400; }
  .up-field input, .up-field textarea {
    padding: 0.72rem 1rem; border-radius: 10px;
    border: 1.5px solid #e2e8f0; font-size: 0.95rem; color: #0f172a;
    background: #fff; outline: none; width: 100%;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: inherit;
  }
  .up-field input:focus, .up-field textarea:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .up-field textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

  /* ── Auto-save toggle ── */
  .up-autosave-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.8rem; color: #64748b; cursor: pointer;
    padding: 4px 8px; border-radius: 6px; transition: background 0.15s;
  }
  .up-autosave-label:hover { background: #f1f5f9; }
  .up-autosave-label input { accent-color: #059669; }

  /* ── Buttons ── */
  .up-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.65rem 1.4rem; border-radius: 10px;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.2s ease;
    font-family: inherit;
  }
  .up-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.3);
  }
  .up-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(5,150,105,0.4);
  }
  .up-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .up-btn-ghost {
    background: transparent; color: #475569;
    border: 1.5px solid #e2e8f0;
  }
  .up-btn-ghost:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
  .up-btn-sm { padding: 0.5rem 1rem; font-size: 0.82rem; }
  .up-btn-cancel { color: #ef4444; border-color: #fecaca; }
  .up-btn-cancel:hover { background: #fef2f2; color: #dc2626; border-color: #f87171; }

  /* ── Form footer ── */
  .up-form-footer {
    display: flex; justify-content: flex-end; align-items: center;
    gap: 10px; margin-top: 1.75rem; padding-top: 1.25rem;
    border-top: 1px solid #f1f5f9;
  }

  /* ── Stats grid ── */
  .up-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
  .up-stat-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .up-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
  .up-stat-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.3rem;
  }
  .up-stat-body h3 { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px; }
  .up-stat-body p { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }

  /* ── Security section ── */
  .up-security { display: flex; flex-direction: column; gap: 0; }
  .up-security-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 1rem 1.75rem; border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .up-security-row:last-child { border-bottom: none; }
  .up-security-row:hover { background: #fafdfb; }
  .up-security-left { display: flex; align-items: center; gap: 12px; }
  .up-security-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    background: #f0fdf4; color: #059669;
  }
  .up-security-label { font-size: 0.9rem; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
  .up-security-sub { font-size: 0.78rem; color: #94a3b8; margin: 0; }
  .up-security-badge {
    padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .up-security-badge.ok  { background: #dcfce7; color: #166534; }
  .up-security-badge.na  { background: #f1f5f9; color: #64748b; }

  /* ── Keyframes ── */
  @keyframes upFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes upSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes upSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes upPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .up-spin { animation: upSpin 1s linear infinite; }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .up-fields { grid-template-columns: 1fr; }
    .up-field.full { grid-column: 1; }
    .up-hero { flex-direction: column; align-items: flex-start; gap: 1.25rem; padding: 1.75rem 1.25rem; }
    .up-hero-name { font-size: 1.4rem; }
    .up-form-body { padding: 1.25rem; }
    .up-card-header { padding: 1rem 1.25rem; }
    .up-sync-bar { padding: 0.5rem 1.25rem; }
    .up-security-row { padding: 0.9rem 1.25rem; }
    .up-stats { grid-template-columns: 1fr 1fr; }
    .up-form-footer { flex-wrap: wrap; }
  }
  @media (max-width: 400px) {
    .up-stats { grid-template-columns: 1fr; }
    .up-avatar { width: 90px; height: 90px; font-size: 2rem; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserProfile() {
  const { user, updateProfile, uploadAvatar } = useUserAuth();

  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUrlError, setPhotoUrlError] = useState("");
  const [autoSave, setAutoSave] = useState(true);
  const [syncState, setSyncState] = useState(SYNC_STATE.IDLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirty, setDirty]       = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const fileInputRef        = useRef(null);
  const autosaveTimerRef    = useRef(null);
  const notificationTimerRef = useRef(null);

  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || user?.name || "",
    phone:    user?.phone || "",
    bio:      user?.bio || "",
  }));

  // Sync form when user loads (e.g. after fetchUser resolves)
  useEffect(() => {
    if (user && !editing) {
      setForm({
        fullName: user?.fullName || user?.name || "",
        phone:    user?.phone || "",
        bio:      user?.bio || "",
      });
    }
  }, [user, editing]);

  const initials = React.useMemo(() => {
    const name = form.fullName || user?.email || "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [form.fullName, user?.email]);

  const showNotification = useCallback((type, message) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotification({ type, message });
    if (type === "success") {
      notificationTimerRef.current = setTimeout(
        () => setNotification({ type: "", message: "" }),
        SUCCESS_MESSAGE_DURATION,
      );
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setSyncState(SYNC_STATE.DIRTY);
    setNotification({ type: "", message: "" });
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      fullName: user?.fullName || user?.name || "",
      phone:    user?.phone || "",
      bio:      user?.bio || "",
    });
    setDirty(false);
    setSyncState(SYNC_STATE.IDLE);
  }, [user]);

  const handleCancel = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setEditing(false);
    resetForm();
    setNotification({ type: "", message: "" });
  }, [resetForm]);

  const persistProfile = useCallback(async ({ silent = false } = {}) => {
    try {
      setLoading(true);
      setSyncState(SYNC_STATE.SAVING);
      await updateProfile(form);
      setDirty(false);
      setSyncState(SYNC_STATE.SAVED);
      setLastSavedAt(new Date());
      if (!silent) {
        showNotification("success", "Profile updated successfully!");
        setEditing(false);
      }
      return true;
    } catch (err) {
      setSyncState(SYNC_STATE.ERROR);
      showNotification("error", err.message || "Failed to update profile. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, updateProfile, showNotification]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    await persistProfile({ silent: false });
  }, [persistProfile]);

  const validateFile = useCallback((file) => {
    if (!file) return { valid: false, error: "No file selected." };
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
      return { valid: false, error: "Please select a JPEG, PNG, or WebP image." };
    if (file.size > MAX_FILE_SIZE)
      return { valid: false, error: "File size must be less than 5 MB." };
    return { valid: true };
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const v = validateFile(file);
    if (!v.valid) {
      showNotification("error", v.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    try {
      setUploading(true);
      await uploadAvatar(file);
      showNotification("success", "Profile picture updated!");
    } catch (err) {
      showNotification("error", err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadAvatar, validateFile, showNotification]);

  const handleUrlImage = useCallback(async () => {
    if (uploading) return;
    const entered = photoUrl;
    if (!entered.trim()) { setPhotoUrlError("Enter a direct link to an image."); return; }
    let url;
    try {
      url = new URL(entered.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use a secure HTTPS image link.");
      if (!url.hostname.includes(".") || /\s/.test(entered.trim())) throw new Error("Enter a valid image URL, such as https://example.com/photo.jpg");
    } catch (err) {
      setPhotoUrlError(err.message || "Enter a valid image URL.");
      return;
    }
    try {
      setUploading(true);
      const response = await fetch(url.href, { mode: "cors" });
      if (!response.ok) throw new Error("Could not retrieve that image. Try a direct image URL.");
      const blob = await response.blob();
      if (!blob.type || !blob.type.startsWith("image/")) throw new Error("That URL did not return an image.");
      if (blob.size > MAX_FILE_SIZE) throw new Error("Image must be 5 MB or smaller.");
      const extension = (blob.type.split("/")[1] || "png").replace("jpeg", "jpg");
      const file = new File([blob], "profile-image." + extension, { type: blob.type });
      const validation = validateFile(file);
      if (!validation.valid) throw new Error(validation.error);
      await uploadAvatar(file);
      showNotification("success", "Profile picture updated and its URL saved to your account.");
      setPhotoModalOpen(false);
      setPhotoUrl("");
      setPhotoUrlError("");
    } catch (err) {
      showNotification("error", err.message || "Could not use that URL. The image host may block browser access (CORS); try another direct image URL or select a file from your device.");
    } finally {
      setUploading(false);
    }
  }, [uploading, photoUrl, showNotification, validateFile, uploadAvatar]);

  const handleImageClick = useCallback(() => {
    if (!uploading) fileInputRef.current?.click();
  }, [uploading]);

  // Auto-save
  useEffect(() => {
    if (!editing || !autoSave || !dirty) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(
      () => persistProfile({ silent: true }),
      AUTOSAVE_DELAY,
    );
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [editing, autoSave, dirty, form, persistProfile]);

  // Cleanup
  useEffect(() => () => {
    if (autosaveTimerRef.current)    clearTimeout(autosaveTimerRef.current);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
  }, []);

  const syncLabel = {
    [SYNC_STATE.SAVING]: "Saving…",
    [SYNC_STATE.SAVED]:  "Saved",
    [SYNC_STATE.DIRTY]:  "Unsaved changes",
    [SYNC_STATE.IDLE]:   "Ready",
    [SYNC_STATE.ERROR]:  "Error saving",
  };

  const memberYear = new Date(user?.createdAt || Date.now()).getFullYear();
  const provider   = user?.authProvider || "email";

  return (
    <>
      <Helmet>
        <title>My Profile | Altuvera</title>
        <meta name="description" content="Manage your personal information and traveler preferences" />
      </Helmet>

      <DashboardLayout
        title="My Profile"
        subtitle="Manage your personal information and account settings."
      >
        <style>{css}</style>
        <div className="up-root">

          {/* ── Hero Banner ── */}
          <div className="up-hero">
            {/* Avatar */}
            <div className="up-avatar-wrap">
              {uploading && (
                <div className="up-avatar-overlay">
                  <HiRefresh className="up-spin" />
                </div>
              )}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="up-avatar"
                  onClick={handleImageClick}
                  style={{ cursor: uploading ? "not-allowed" : "pointer" }}
                />
              ) : (
                <div
                  className="up-avatar"
                  onClick={handleImageClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Change profile picture"
                  onKeyPress={(e) => { if (e.key === "Enter") handleImageClick(); }}
                >
                  {initials}
                </div>
              )}
              <button
                className="up-camera-btn"
                onClick={() => setPhotoModalOpen(true)}
                disabled={uploading}
                type="button"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                {uploading ? <HiRefresh className="up-spin" /> : <HiCamera />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
              />
            </div>

            {/* Info */}
            <div className="up-hero-info">
              <h1 className="up-hero-name">{user?.fullName || user?.name || "Safari Traveler"}</h1>
              <p className="up-hero-email">
                <HiMail style={{ opacity: 0.7 }} />
                {user?.email || "—"}
              </p>
              <div className="up-badges">
                {user?.role && (
                  <span className="up-badge up-badge-role">
                    {user.role}
                  </span>
                )}
                {user?.isVerified && (
                  <span className="up-badge up-badge-verified">
                    ✓ Verified
                  </span>
                )}
                <span className="up-badge up-badge-year">
                  Member {memberYear}
                </span>
              </div>
            </div>

            {/* Quick Edit */}
            {!editing && (
              <div className="up-hero-actions">
                <button
                  className="up-edit-hero-btn"
                  onClick={() => setEditing(true)}
                  type="button"
                >
                  <FiEdit3 size={15} /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* ── Notification ── */}
          {notification.message && (
            <div className={`up-notif ${notification.type}`} role="alert">
              <div className="up-notif-left">
                {notification.type === "success"
                  ? <FiCheckCircle size={18} />
                  : <FiAlertCircle size={18} />}
                <span>{notification.message}</span>
              </div>
              <button
                className="up-notif-dismiss"
                onClick={() => setNotification({ type: "", message: "" })}
                aria-label="Dismiss"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* ── Profile Card ── */}
          <div className="up-card">
            {/* Card Header */}
            <div className="up-card-header">
              <div className="up-card-title-row">
                <div className="up-card-accent" />
                <h2 className="up-card-title">Personal Information</h2>
              </div>
              <div className="up-card-actions">
                {editing ? (
                  <>
                    <label className="up-autosave-label">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
                      Auto-save
                    </label>
                    <button
                      className="up-btn up-btn-sm up-btn-ghost up-btn-cancel"
                      onClick={handleCancel}
                      type="button"
                    >
                      <FiX size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="up-btn up-btn-sm up-btn-ghost"
                    onClick={() => setEditing(true)}
                    type="button"
                  >
                    <HiPencil size={14} /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Sync bar */}
            {editing && (
              <div className="up-sync-bar">
                <span>
                  <span className={`up-sync-dot ${syncState}`} />
                  {syncLabel[syncState]}
                </span>
                <span>
                  {lastSavedAt
                    ? `Last saved ${lastSavedAt.toLocaleTimeString()}`
                    : "Not yet saved"}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="up-form-body">
                <div className="up-fields">
                  {/* Full Name */}
                  <Field
                    icon={<HiUser />}
                    label="Full Name"
                    editing={editing}
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoFocus
                  />

                  {/* Email */}
                  <Field
                    icon={<HiMail />}
                    label="Email Address"
                    value={user?.email || "—"}
                    readonly
                  />

                  {/* Phone */}
                  <Field
                    icon={<HiPhone />}
                    label="Phone Number"
                    editing={editing}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 700 123 456"
                  />

                  {/* Auth Provider */}
                  <Field
                    icon={<HiFingerPrint />}
                    label="Sign-in Method"
                    value={provider.charAt(0).toUpperCase() + provider.slice(1)}
                    readonly
                  />

                  {/* Bio */}
                  <div className="up-field full">
                    <label>
                      <HiOutlinePhotograph /> Bio / About You
                    </label>
                    {editing ? (
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Share your travel experiences, interests, or anything about yourself…"
                        rows={4}
                      />
                    ) : (
                      <p style={{ lineHeight: 1.65, color: form.bio ? "#0f172a" : "#94a3b8" }}>
                        {form.bio || "No bio added yet. Click Edit to add one."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer buttons */}
                {editing && (
                  <div className="up-form-footer">
                    <button
                      type="button"
                      className="up-btn up-btn-ghost up-btn-cancel"
                      onClick={handleCancel}
                    >
                      <FiX size={15} /> Discard
                    </button>
                    <button
                      type="submit"
                      className="up-btn up-btn-primary"
                      disabled={loading || !dirty}
                    >
                      {loading
                        ? <><HiRefresh className="up-spin" /> Saving…</>
                        : <><FiSave /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* ── Security & Account Info ── */}
          <div className="up-card">
            <div className="up-card-header">
              <div className="up-card-title-row">
                <div className="up-card-accent" />
                <h2 className="up-card-title">Security & Account</h2>
              </div>
            </div>
            <div className="up-security">
              <SecurityRow
                icon={<HiShieldCheck />}
                label="Email Verification"
                sub="Your identity has been confirmed"
                status={user?.isVerified ? "ok" : "na"}
                statusLabel={user?.isVerified ? "Verified" : "Unverified"}
              />
              <SecurityRow
                icon={<HiClock />}
                label="Last Login"
                sub={user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Session active"}
                status="ok"
                statusLabel="Active"
              />
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="up-stats">
            <StatCard
              icon={<HiCheck size={22} />}
              iconBg="#dcfce7"
              iconColor="#059669"
              label="Account Status"
              value="Verified Account"
            />
            <StatCard
              icon={<HiShieldCheck size={22} />}
              iconBg="#eff6ff"
              iconColor="#2563eb"
              label="Sign-in Provider"
              value={provider.charAt(0).toUpperCase() + provider.slice(1)}
            />
            <StatCard
              icon={<HiClock size={22} />}
              iconBg="#f5f3ff"
              iconColor="#7c3aed"
              label="Member Since"
              value={memberYear.toString()}
            />
          </div>

        </div>
      {photoModalOpen && (
        <div
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget && !uploading) setPhotoModalOpen(false); }}
          onKeyDown={(e) => { if (e.key === "Escape" && !uploading) setPhotoModalOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(3, 24, 18, .68)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))" }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="up-photo-modal-title" style={{ width: "100%", maxWidth: 440, maxHeight: "min(90dvh, 680px)", overflowY: "auto", background: "#fff", color: "#10231d", borderRadius: 24, padding: "clamp(20px, 5vw, 28px)", boxShadow: "0 28px 90px rgba(0,0,0,.32)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ width: 48, height: 48, flex: "0 0 48px", borderRadius: 16, display: "grid", placeItems: "center", background: "#e7f6ef", color: "#047857" }}><HiCamera size={25} /></div>
                <div>
                  <h2 id="up-photo-modal-title" style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 1.45rem)", lineHeight: 1.25, fontWeight: 800 }}>Change profile photo</h2>
                  <p style={{ margin: "5px 0 0", color: "#6b7c75", fontSize: 14, lineHeight: 1.45 }}>Choose a photo that represents you.</p>
                </div>
              </div>
              <button type="button" onClick={() => setPhotoModalOpen(false)} disabled={uploading} aria-label="Close photo options" style={{ flex: "0 0 38px", border: 0, background: "#f1f5f3", color: "#344b42", borderRadius: 12, width: 38, height: 38, fontSize: 22, cursor: "pointer" }}><FiX /></button>
            </div>
            <button type="button" onClick={() => { setPhotoModalOpen(false); handleImageClick(); }} disabled={uploading} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, marginTop: 24, padding: 15, border: "1px solid #d7e8df", borderRadius: 16, background: "#f7fbf9", color: "#075e46", fontWeight: 750, cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#dff3e9", flex: "0 0 42px" }}><HiOutlinePhotograph size={22} /></span>
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block" }}>Choose from device</span><span style={{ display: "block", marginTop: 4, color: "#718078", fontSize: 12, fontWeight: 500 }}>Select an image saved on your phone or computer</span></span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px", color: "#8a9992", fontSize: 11, fontWeight: 800, letterSpacing: ".12em" }}><span style={{ height: 1, background: "#e4ece7", flex: 1 }} /><span>OR USE A LINK</span><span style={{ height: 1, background: "#e4ece7", flex: 1 }} /></div>
            <form onSubmit={(e) => { e.preventDefault(); handleUrlImage(); }} noValidate>
              <label htmlFor="up-profile-photo-url" style={{ display: "block", color: "#253d33", fontSize: 14, fontWeight: 750, marginBottom: 8 }}>Image URL</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 13px", border: "1px solid " + (photoUrlError ? "#dc4545" : "#cbdcd3"), borderRadius: 13, background: photoUrlError ? "#fffafa" : "#fbfdfc", boxShadow: photoUrlError ? "0 0 0 3px rgba(220,69,69,.08)" : "none" }}>
                <FiLink aria-hidden="true" style={{ color: "#648176", flex: "0 0 auto" }} />
                <input id="up-profile-photo-url" type="url" inputMode="url" value={photoUrl} onChange={(e) => { const value = e.target.value; setPhotoUrl(value); setPhotoUrlError(value.trim() && !/^https?:\/\//i.test(value.trim()) ? "Link must start with https:// or http://." : ""); }} placeholder="https://example.com/photo.jpg" autoComplete="url" aria-invalid={!!photoUrlError} aria-describedby="up-photo-url-help up-photo-url-error" style={{ flex: 1, width: "100%", minWidth: 0, padding: "15px 0", border: 0, outline: "none", background: "transparent", color: "#10231d", fontSize: 16, boxSizing: "border-box" }} />
              </div>
              {photoUrlError ? <p id="up-photo-url-error" role="alert" style={{ margin: "8px 0 0", color: "#c53030", fontSize: 12, lineHeight: 1.45 }}>{photoUrlError}</p> : null}
              <p id="up-photo-url-help" style={{ margin: "8px 0 0", color: "#78877f", fontSize: 12, lineHeight: 1.5 }}>Use a direct, publicly accessible image link. The image must load successfully and be 5 MB or smaller.</p>
              <button type="submit" disabled={uploading || !photoUrl.trim() || !!photoUrlError} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 18, padding: 14, border: 0, borderRadius: 13, background: "#047857", color: "#fff", fontWeight: 800, fontSize: 15, cursor: uploading ? "wait" : "pointer", opacity: uploading || !photoUrl.trim() || !!photoUrlError ? .55 : 1 }}>
                {uploading ? <HiRefresh className="up-spin" /> : <HiOutlinePhotograph />} {uploading ? "Validating and updating…" : "Use this image"}
              </button>
            </form>
            <p style={{ margin: "15px 0 0", color: "#87958e", fontSize: 11, textAlign: "center", lineHeight: 1.5 }}>Supported images: JPEG, PNG, WebP · Max 5 MB</p>
          </section>
        </div>
      )}
      </DashboardLayout>
    </>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ icon, label, editing, name, type = "text", value, onChange, placeholder, autoFocus, readonly }) {
  return (
    <div className="up-field">
      <label>
        {icon} {label}
      </label>
      {readonly || !editing ? (
        <p className={readonly ? "readonly" : ""}>
          {value || "—"}
        </p>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
}

// ─── SecurityRow ──────────────────────────────────────────────────────────────
function SecurityRow({ icon, label, sub, status, statusLabel }) {
  return (
    <div className="up-security-row">
      <div className="up-security-left">
        <div className="up-security-icon">{icon}</div>
        <div>
          <p className="up-security-label">{label}</p>
          <p className="up-security-sub">{sub}</p>
        </div>
      </div>
      <span className={`up-security-badge ${status}`}>{statusLabel}</span>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="up-stat-card">
      <div className="up-stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="up-stat-body">
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}