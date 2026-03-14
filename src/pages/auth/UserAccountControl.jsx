import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../components/auth/DashboardLayout";
import "./UserAccountControl.css";

export default function UserAccountControl() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "security":
        return <SecuritySettings />;
      case "preferences":
        return <PreferencesSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <>
      <Helmet>
        <title>User Account Control | Altuvera</title>
      </Helmet>

      <DashboardLayout
        title="User Account Control"
        subtitle="Manage your profile, security, and preferences."
      >
        <div className="uac-tabs">
          <button
            className={`uac-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`uac-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button
            className={`uac-tab ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </button>
        </div>

        <div className="uac-content">{renderContent()}</div>
      </DashboardLayout>
    </>
  );
}

function ProfileSettings() {
  return (
    <div>
      <h2>Profile Settings</h2>
      <p>Update your personal information and profile picture.</p>
      {/* Add form for profile updates */}
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h2>Security Settings</h2>
      <p>Manage your password, two-factor authentication, and security questions.</p>
      {/* Add form for security updates */}
    </div>
  );
}

function PreferencesSettings() {
  return (
    <div>
      <h2>Preferences</h2>
      <p>Customize your notification preferences and app settings.</p>
      {/* Add form for preferences updates */}
    </div>
  );
}