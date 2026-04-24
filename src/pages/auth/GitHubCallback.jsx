// src/pages/auth/GitHubCallback.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";

export default function GitHubCallback() {
  const navigate = useNavigate();
  const { consumeGithubCallback } = useUserAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const handle = async () => {
      try {
        await consumeGithubCallback();
        navigate("/", { replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    };

    handle();
  }, [consumeGithubCallback, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #e5e7eb",
          borderTopColor: "#059669",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#6b7280", margin: 0 }}>
        Completing GitHub sign-in...
      </p>
    </div>
  );
}