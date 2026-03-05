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
} from "react-icons/hi";
import { FiSave, FiX } from "react-icons/fi";
import "./AuthPages.css";

// Constants
const AUTOSAVE_DELAY = 900;
const SUCCESS_MESSAGE_DURATION = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Sync state enum
const SYNC_STATE = {
  IDLE: "idle",
  DIRTY: "dirty",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
};

export default function UserProfile() {
  const { user, updateProfile, uploadAvatar } = useUserAuth();

  // State management
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [syncState, setSyncState] = useState(SYNC_STATE.IDLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Refs
  const fileInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const notificationTimerRef = useRef(null);

  // Initialize form state from user data
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  }));

  // Memoized user initials
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

  // Show notification with auto-hide
  const showNotification = useCallback((type, message) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    setNotification({ type, message });

    if (type === "success") {
      notificationTimerRef.current = setTimeout(() => {
        setNotification({ type: "", message: "" });
      }, SUCCESS_MESSAGE_DURATION);
    }
  }, []);

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setSyncState(SYNC_STATE.DIRTY);
    setNotification({ type: "", message: "" });
  }, []);

  // Reset form to original values
  const resetForm = useCallback(() => {
    setForm({
      fullName: user?.fullName || user?.name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    });
    setDirty(false);
    setSyncState(SYNC_STATE.IDLE);
  }, [user]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    setEditing(false);
    resetForm();
    setNotification({ type: "", message: "" });
  }, [resetForm]);

  // Persist profile changes
  const persistProfile = useCallback(
    async ({ silent = false } = {}) => {
      try {
        setLoading(true);
        setSyncState(SYNC_STATE.SAVING);
        setNotification({ type: "", message: "" });

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
        console.error("Profile update error:", err);
        setSyncState(SYNC_STATE.ERROR);
        showNotification(
          "error",
          err.message || "Failed to update profile. Please try again."
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [form, updateProfile, showNotification]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      await persistProfile({ silent: false });
    },
    [persistProfile]
  );

  // Validate file before upload
  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Please select a valid image file (JPEG, PNG, or WebP)",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: "File size must be less than 5MB",
      };
    }

    return { valid: true };
  }, []);

  // Handle file upload
  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        showNotification("error", validation.error);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      try {
        setUploading(true);
        setNotification({ type: "", message: "" });

        await uploadAvatar(file);
        showNotification("success", "Profile picture updated!");
      } catch (err) {
        console.error("Avatar upload error:", err);
        showNotification(
          "error",
          err.message || "Failed to upload image. Please try again."
        );
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadAvatar, validateFile, showNotification]
  );

  // Handle avatar click
  const handleImageClick = useCallback(() => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }, [uploading]);

  // Auto-save effect
  useEffect(() => {
    if (!editing || !autoSave || !dirty) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      persistProfile({ silent: true });
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [editing, autoSave, dirty, form, persistProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Sync state display text
  const syncStateText = {
    [SYNC_STATE.SAVING]: "Saving...",
    [SYNC_STATE.SAVED]: "Saved",
    [SYNC_STATE.DIRTY]: "Unsaved changes",
    [SYNC_STATE.IDLE]: "Ready",
    [SYNC_STATE.ERROR]: "Error",
  };

  return (
    <>
      <Helmet>
        <title>My Profile | Altuvera</title>
        <meta
          name="description"
          content="Manage your personal information and traveler preferences"
        />
      </Helmet>

      <DashboardLayout
        title="My Profile"
        subtitle="Manage your personal information and traveler preferences."
      >
        <div className="profile-wrapper">
          <ProfileStyles />

          {/* Profile Header */}
          <ProfileHeader
            user={user}
            initials={initials}
            uploading={uploading}
            onImageClick={handleImageClick}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />

          {/* Notifications */}
          {notification.message && (
            <Notification
              type={notification.type}
              message={notification.message}
              onDismiss={() => setNotification({ type: "", message: "" })}
            />
          )}

          {/* Profile Card */}
          <div className="profile-card">
            <ProfileCardHeader
              editing={editing}
              autoSave={autoSave}
              onEdit={() => setEditing(true)}
              onCancel={handleCancel}
              onAutoSaveToggle={(checked) => setAutoSave(checked)}
            />

            {editing && (
              <SyncStatusBar
                syncState={syncState}
                syncStateText={syncStateText[syncState]}
                lastSavedAt={lastSavedAt}
              />
            )}

            <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
              <div className="profile-fields">
                <ProfileField
                  icon={<HiUser />}
                  label="Full Name"
                  editing={editing}
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoFocus
                />

                <ProfileField
                  icon={<HiMail />}
                  label="Email"
                  value={user?.email}
                  readonly
                />

                <ProfileField
                  icon={<HiPhone />}
                  label="Phone Number"
                  editing={editing}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254 700 123456"
                />

                <div className="profile-field full-width">
                  <label>Bio / About You</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Share your travel experiences or interests..."
                    />
                  ) : (
                    <p style={{ color: "#475569", lineHeight: 1.6 }}>
                      {form.bio || "No bio added yet."}
                    </p>
                  )}
                </div>
              </div>

              {editing && (
                <div
                  style={{
                    marginTop: "2.5rem",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={loading || !dirty}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "0.8rem 2.5rem",
                      opacity: !dirty ? 0.5 : 1,
                      cursor: !dirty ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? <HiRefresh className="spin" /> : <FiSave />}
                    {loading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Stats Cards */}
          <StatsCards user={user} />
        </div>
      </DashboardLayout>
    </>
  );
}

// Sub-components

function ProfileStyles() {
  return (
    <style>{`
      .profile-wrapper {
        animation: fadeIn 0.6s ease-out;
      }
      .profile-card {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        border: 1px solid #f1f5f9;
        overflow: hidden;
        background: #fff;
        border-radius: 20px;
        transition: transform 0.3s ease;
      }
      .profile-avatar-large {
        transition: filter 0.3s ease, transform 0.3s ease;
        border: 4px solid #fff;
        box-shadow: 0 8px 20px rgba(5, 150, 105, 0.2);
        background: #f1f5f9;
      }
      .profile-avatar-section:hover .profile-avatar-large {
        filter: brightness(0.8);
        transform: scale(1.02);
      }
      .avatar-upload-btn {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 5;
      }
      .avatar-upload-btn:hover {
        transform: scale(1.15);
        background: #047857;
      }
      .avatar-upload-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .upload-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        z-index: 2;
      }
      .spin { 
        animation: rotate 1s linear infinite; 
      }
      .notification-dismiss {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      .notification-dismiss:hover {
        opacity: 1;
      }
      @keyframes rotate { 
        from { transform: rotate(0deg); } 
        to { transform: rotate(360deg); } 
      }
      @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      @keyframes slideIn { 
        from { transform: translateX(-20px); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
      }
      
      .auth-page-message {
        padding: 1rem 1.25rem;
        border-radius: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        animation: slideIn 0.3s ease;
      }
    `}</style>
  );
}

function ProfileHeader({
  user,
  initials,
  uploading,
  onImageClick,
  fileInputRef,
  onFileChange,
}) {
  return (
    <div className="profile-header">
      <div
        className="profile-avatar-section"
        onClick={onImageClick}
        style={{ cursor: uploading ? "not-allowed" : "pointer" }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onImageClick();
          }
        }}
        aria-label="Change profile picture"
      >
        {uploading && (
          <div className="upload-overlay">
            <HiRefresh className="spin" />
          </div>
        )}
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Profile"
            className="profile-avatar-large"
          />
        ) : (
          <div className="profile-avatar-large initials">{initials}</div>
        )}
        <button
          className="avatar-upload-btn"
          title="Change photo"
          disabled={uploading}
          type="button"
          aria-label="Upload new profile picture"
        >
          <HiCamera />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          aria-label="Profile picture file input"
        />
      </div>
      <div className="profile-header-info">
        <h1>{user?.fullName || user?.name || "Safari Traveler"}</h1>
        <p style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <HiMail style={{ opacity: 0.6 }} /> {user?.email}
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {user?.role && <span className="role-badge">{user.role}</span>}
          <span
            className="role-badge"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            Member since{" "}
            {new Date(user?.createdAt || Date.now()).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Notification({ type, message, onDismiss }) {
  return (
    <div className={`auth-page-message ${type}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {type === "success" ? (
          <HiCheck size={20} />
        ) : (
          <HiExclamationCircle size={20} />
        )}
        <span>{message}</span>
      </div>
      <button
        className="notification-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <FiX size={20} />
      </button>
    </div>
  );
}

function ProfileCardHeader({
  editing,
  autoSave,
  onEdit,
  onCancel,
  onAutoSaveToggle,
}) {
  return (
    <div
      className="profile-card-header"
      style={{
        padding: "1.5rem 2rem 1rem",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "8px",
            height: "24px",
            background: "#059669",
            borderRadius: "4px",
          }}
        />
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
          Personal Information
        </h2>
      </div>
      {!editing ? (
        <button
          className="edit-toggle-btn"
          onClick={onEdit}
          style={{ background: "#f8fafc", fontWeight: 600 }}
        >
          <HiPencil /> Edit Profile
        </button>
      ) : (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              color: "#475569",
              marginRight: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => onAutoSaveToggle(e.target.checked)}
            />
            Auto-save
          </label>
          <button className="edit-toggle-btn" onClick={onCancel}>
            <FiX /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function SyncStatusBar({ syncState, syncStateText, lastSavedAt }) {
  return (
    <div
      style={{
        padding: "0.75rem 2rem 0.5rem",
        borderBottom: "1px solid #f8fafc",
        fontSize: "0.82rem",
        color: "#64748b",
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <span>
        Sync status:{" "}
        <strong
          style={{
            color: syncState === SYNC_STATE.ERROR ? "#dc2626" : "#0f172a",
          }}
        >
          {syncStateText}
        </strong>
      </span>
      <span>
        {lastSavedAt
          ? `Last saved ${lastSavedAt.toLocaleTimeString()}`
          : "Not saved yet"}
      </span>
    </div>
  );
}

function ProfileField({
  icon,
  label,
  editing,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoFocus,
  readonly,
}) {
  return (
    <div className="profile-field">
      <label>
        {icon} {label}
      </label>
      {readonly || !editing ? (
        <p
          className={readonly ? "readonly" : ""}
          style={!readonly ? { fontWeight: 500, color: "#0f172a" } : {}}
        >
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

function StatsCards({ user }) {
  return (
    <div
      style={{
        marginTop: "2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
      }}
    >
      <StatCard
        icon={<HiOutlinePhotograph size={24} />}
        title="Member Level"
        value="Elite Explorer"
        bgColor="#ecfdf5"
        iconColor="#059669"
      />
      <StatCard
        icon={<HiCheck size={24} />}
        title="Account Status"
        value="Verified Account"
        bgColor="#eff6ff"
        iconColor="#2563eb"
      />
    </div>
  );
}

function StatCard({ icon, title, value, bgColor, iconColor }) {
  return (
    <div
      className="profile-card"
      style={{
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: bgColor,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{title}</h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          {value}
        </p>
      </div>
    </div>
  );
}