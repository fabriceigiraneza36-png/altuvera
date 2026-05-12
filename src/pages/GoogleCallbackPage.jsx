// src/pages/GoogleCallbackPage.jsx
import { useEffect, useRef } from "react";

export default function GoogleCallbackPage() {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    const send = () => {
      try {
        // Parse id_token from hash (implicit flow) or query string
        const hash  = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const query = new URLSearchParams(window.location.search);

        const idToken =
          hash.get("id_token")   || hash.get("credential") ||
          query.get("id_token")  || query.get("credential");

        const error =
          hash.get("error")  || query.get("error");

        const state =
          hash.get("state")  || query.get("state");

        const payload = {
          type:       "google_auth_callback",
          credential: idToken || null,
          idToken:    idToken || null,
          error:      error   || null,
          state:      state   || null,
        };

        // ── Strategy 1: BroadcastChannel (works under all COOP policies) ──
        try {
          const bc = new BroadcastChannel("google_auth_popup");
          bc.postMessage(payload);
          // Small delay so parent receives before channel closes
          setTimeout(() => { try { bc.close(); } catch { /* ignore */ } }, 500);
        } catch { /* BroadcastChannel not supported */ }

        // ── Strategy 2: postMessage to opener (needs same-origin-allow-popups) ──
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, window.location.origin);
          }
        } catch {
          // COOP blocked — BroadcastChannel already handled it
        }

        // Close popup after sending
        setTimeout(() => {
          try { window.close(); } catch { /* ignore */ }
        }, 800);
      } catch (err) {
        // Last resort error reporting
        try {
          const bc = new BroadcastChannel("google_auth_popup");
          bc.postMessage({
            type: "google_auth_callback",
            credential: null,
            error: err.message || "Callback failed",
            state: null,
          });
          setTimeout(() => { try { bc.close(); } catch { /* ignore */ } }, 500);
        } catch { /* ignore */ }
        setTimeout(() => { try { window.close(); } catch { /* ignore */ } }, 800);
      }
    };

    // Small delay to ensure parent listener is ready
    setTimeout(send, 100);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "Inter, system-ui, sans-serif",
      background: "linear-gradient(135deg, #022C22 0%, #065F46 100%)",
      color: "#ffffff",
      gap: "20px",
    }}>
      {/* Spinner */}
      <div style={{
        width: "48px", height: "48px",
        border: "4px solid rgba(255,255,255,0.2)",
        borderTopColor: "#10b981",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 8px" }}>
          Completing sign-in…
        </p>
        <p style={{ fontSize: "14px", opacity: 0.7, margin: 0 }}>
          This window will close automatically.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}