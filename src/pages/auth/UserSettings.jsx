import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { HiLogout, HiShieldCheck } from "react-icons/hi";
import "./AuthPages.css";

export default function UserSettings() {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <Helmet><title>Settings | Altuvera</title></Helmet>
      <div className="auth-page">
        <div className="auth-page-container">
          <h1 className="auth-page-title">Settings</h1>
          <p className="auth-page-subtitle">Manage your account</p>

          <div className="settings-section">
            <div className="settings-section-header">
              <HiShieldCheck />
              <h2>Security</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.9rem", margin: "0 0 0.5rem" }}>
              Your account uses passwordless authentication. Each time you sign in,
              we send a secure verification code to <strong>{user?.email}</strong>.
            </p>
            <p style={{ color: "#888", fontSize: "0.82rem" }}>
              🔒 No password to remember or manage — your email is your key.
            </p>
          </div>

          <div className="settings-section danger">
            <h2>Session</h2>
            <p>Sign out of your current session on this device.</p>
            <button className="danger-btn" onClick={handleLogout}>
              <HiLogout style={{ marginRight: "6px" }} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}