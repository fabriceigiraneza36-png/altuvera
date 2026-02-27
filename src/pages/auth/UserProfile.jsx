import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCamera,
  HiCheck,
  HiPencil,
} from "react-icons/hi";
import "./AuthPages.css";

export default function UserProfile() {
  const { user, updateProfile } = useUserAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await updateProfile(form);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.fullName || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Helmet>
        <title>My Profile | Altuvera</title>
      </Helmet>
      <div className="auth-page">
        <div className="auth-page-container">
          <div className="profile-header">
            <div className="profile-avatar-section">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="profile-avatar-large"
                />
              ) : (
                <div className="profile-avatar-large initials">{initials}</div>
              )}
              <button className="avatar-upload-btn" title="Change photo">
                <HiCamera />
              </button>
            </div>
            <div className="profile-header-info">
              <h1>{form.fullName || "Your Profile"}</h1>
              <p>{user?.email}</p>
              {user?.role && <span className="role-badge">{user.role}</span>}
            </div>
          </div>

          {success && (
            <div className="auth-page-message success">
              <HiCheck /> {success}
            </div>
          )}
          {error && <div className="auth-page-message error">{error}</div>}

          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Personal Information</h2>
              <button
                className="edit-toggle-btn"
                onClick={() => setEditing((e) => !e)}
              >
                <HiPencil /> {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="profile-fields">
                <div className="profile-field">
                  <label><HiUser /> Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{form.fullName || "—"}</p>
                  )}
                </div>
                <div className="profile-field">
                  <label><HiMail /> Email</label>
                  <p className="readonly">{user?.email}</p>
                </div>
                <div className="profile-field">
                  <label><HiPhone /> Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254 700 123456"
                    />
                  ) : (
                    <p>{form.phone || "—"}</p>
                  )}
                </div>
                <div className="profile-field full-width">
                  <label>Bio</label>
                  {editing ? (
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p>{form.bio || "—"}</p>
                  )}
                </div>
              </div>
              {editing && (
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}