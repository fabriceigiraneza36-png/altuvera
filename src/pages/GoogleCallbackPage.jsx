// src/pages/GoogleCallbackPage.jsx
// Route: /auth/google/callback
// This page is loaded inside the Google OAuth2 popup window.
// It parses the id_token from the URL and posts it to the opener.

import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    const send = () => {
      try {
        // Parse from hash (implicit flow) or query (code flow)
        const hash = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const query = new URLSearchParams(window.location.search);

        const idToken =
          hash.get("id_token") ||
          query.get("id_token") ||
          query.get("credential");

        const error =
          hash.get("error") ||
          query.get("error");

        const state =
          hash.get("state") ||
          query.get("state");

        if (!window.opener) {
          // Not in a popup — redirect to home
          window.location.replace("/");
          return;
        }

        // Post result back to parent
        window.opener.postMessage(
          {
            type: "google_auth_callback",
            credential: idToken || null,
            error: error || null,
            state: state || null,
          },
          window.location.origin,
        );

        // Give parent time to process, then close
        setTimeout(() => window.close(), 300);
      } catch (err) {
        console.error("[GoogleCallback] Error:", err);
        try {
          window.opener?.postMessage(
            {
              type: "google_auth_callback",
              credential: null,
              error: err.message || "Callback error",
              state: null,
            },
            window.location.origin,
          );
        } catch { /* ignore */ }
        setTimeout(() => window.close(), 300);
      }
    };

    send();
  }, []);

  // Minimal UI shown briefly in the popup
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#f9fafb",
        color: "#374151",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #e5e7eb",
          borderTopColor: "#059669",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "15px", margin: 0 }}>
        Completing sign-in…
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}