import React, { memo, useState, useRef } from "react";
import { User, Camera } from "lucide-react";
import { THEME } from "../BookingShared";

const ProfileImageUpload = ({ user, formData, setFormData, isMobile }) => {
  const [preview, setPreview] = useState(
    user?.avatar || formData.userImage || "",
  );
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData((prev) => ({ ...prev, userImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginBottom: 32, textAlign: "center" }}>
      <div
        style={{
          position: "relative",
          width: isMobile ? 100 : 120,
          height: isMobile ? 100 : 120,
          margin: "0 auto",
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${THEME.primary}`,
            background: THEME.gray100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img
              src={preview}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Profile Preview"
            />
          ) : (
            <User size={isMobile ? 50 : 60} color={THEME.gray400} />
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            background: THEME.primary,
            borderRadius: "50%",
            width: isMobile ? 32 : 36,
            height: isMobile ? 32 : 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Camera size={isMobile ? 16 : 18} color="white" />
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleFile}
      />
      <p
        style={{
          fontSize: 13,
          color: THEME.textLight,
          marginTop: 12,
          fontWeight: 500,
        }}
      >
        {user
          ? "Personalize your booking profile"
          : "Upload your photo for this booking"}
      </p>
    </div>
  );
};

export default ProfileImageUpload;
