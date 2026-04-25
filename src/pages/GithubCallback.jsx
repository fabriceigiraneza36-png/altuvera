// src/pages/GithubCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

export default function GithubCallback() {
  const { githubLoading } = useUserAuth();
  const navigate = useNavigate();

  // consumeGithubCallback() runs automatically via useEffect in UserAuthContext
  // It reads URL params, calls API, saves auth, then cleans URL

  useEffect(() => {
    // After callback is processed (loading done), redirect home
    if (!githubLoading) {
      const timer = setTimeout(() => navigate("/", { replace: true }), 1500);
      return () => clearTimeout(timer);
    }
  }, [githubLoading, navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#059669", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Completing GitHub sign-in...</p>
    </div>
  );
}