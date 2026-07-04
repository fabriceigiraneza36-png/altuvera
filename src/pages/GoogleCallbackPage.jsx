// src/pages/GoogleCallbackPage.jsx
// ============================================================================
// Google OAuth2 Implicit Flow Callback
//
// Flow:
//   openGooglePopup() opens this page as a popup window.
//   Google redirects here with id_token in the URL hash (#id_token=...).
//   This page sends the token back to the opener via:
//     1. BroadcastChannel  — works under ALL COOP policies (primary)
//     2. postMessage        — works with "same-origin-allow-popups" (fallback)
//   Then closes itself.
//
// Route: /auth/google/callback
// ============================================================================

import { useEffect, useRef, useState } from "react";

export default function GoogleCallbackPage() {
  const sentRef = useRef(false);
  const [uiState, setUiState] = useState("processing"); // "processing" | "success" | "error" | "manual_close"

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    // ── Parse URL ──────────────────────────────────────────────────────────
    // Google implicit flow puts tokens in the hash fragment (#id_token=...)
    // Some setups may put them in query string — we check both.
    const hash  = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const query = new URLSearchParams(window.location.search);

    const idToken =
      hash.get("id_token")   || hash.get("credential")   ||
      query.get("id_token")  || query.get("credential")  || null;

    const error =
      hash.get("error")  || query.get("error")  || null;

    const state =
      hash.get("state")  || query.get("state")  || null;

    // ── Build payload ──────────────────────────────────────────────────────
    let payload;

    if (error) {
      payload = {
        type:       "google_auth_callback",
        credential: null,
        idToken:    null,
        error,
        state,
      };
    } else if (idToken) {
      payload = {
        type:       "google_auth_callback",
        credential: idToken,
        idToken,
        error:      null,
        state,
      };
    } else {
      // Landed here directly or no token in URL — could be a navigation error.
      // Tell the opener gracefully so it can resolve(dismissed) instead of hanging.
      payload = {
        type:       "google_auth_callback",
        credential: null,
        idToken:    null,
        error:      "no_credential",
        state,
      };
    }

    // ── Send to opener ─────────────────────────────────────────────────────
    // We use a two-step approach:
    //   Step 1: BroadcastChannel  → works even under strict COOP
    //   Step 2: postMessage       → backup for browsers without BroadcastChannel
    //
    // Timings:
    //   - Send immediately (no artificial delay — parent registers listener before opening popup)
    //   - Keep BroadcastChannel open 2000ms (gives parent time to process)
    //   - Attempt window.close() at 1200ms (after both strategies have fired)
    //   - Show manual-close UI at 3000ms if window is still open

    let bcInstance = null;

    // Strategy 1: BroadcastChannel
    try {
      bcInstance = new BroadcastChannel("google_auth_popup");
      bcInstance.postMessage(payload);

      // Keep open long enough for parent to receive + process
      setTimeout(() => {
        try { bcInstance?.close(); } catch { /* ignore */ }
        bcInstance = null;
      }, 2000);
    } catch {
      // BroadcastChannel not supported in this browser — postMessage will handle it
    }

    // Strategy 2: postMessage to opener
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      }
    } catch {
      // COOP "same-origin" blocks opener access entirely —
      // BroadcastChannel already handled it above
    }

    // ── Update UI ──────────────────────────────────────────────────────────
    if (error) {
      setUiState("error");
    } else if (idToken) {
      setUiState("success");
    } else {
      setUiState("error");
    }

    // ── Close popup ────────────────────────────────────────────────────────
    // Attempt at 1200ms — enough time for both strategies to deliver.
    // Some browsers (Firefox, Safari) may refuse window.close() if the
    // page wasn't opened by script — we handle that with the fallback UI.
    const closeTimer = setTimeout(() => {
      try {
        window.close();
      } catch {
        // Browser refused close — show manual close button
      }

      // If still open after 1800ms more, show the manual close UI
      setTimeout(() => {
        try {
          if (!window.closed) setUiState("manual_close");
        } catch {
          setUiState("manual_close");
        }
      }, 1800);
    }, 1200);

    return () => {
      clearTimeout(closeTimer);
      try { bcInstance?.close(); } catch { /* ignore */ }
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "100vh",
        fontFamily:     "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background:     "linear-gradient(135deg, #022C22 0%, #065F46 100%)",
        color:          "#ffffff",
        gap:            "24px",
        padding:        "24px",
        boxSizing:      "border-box",
      }}
    >
      {/* Card */}
      <div
        style={{
          background:   "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          border:       "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding:      "40px 48px",
          textAlign:    "center",
          maxWidth:     "340px",
          width:        "100%",
          boxShadow:    "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Icon / Spinner */}
        <div style={{ marginBottom: "20px" }}>
          {uiState === "processing" && (
            <div
              style={{
                width:        "52px",
                height:       "52px",
                border:       "4px solid rgba(255,255,255,0.15)",
                borderTopColor: "#10b981",
                borderRadius: "50%",
                animation:    "spin 0.75s linear infinite",
                margin:       "0 auto",
              }}
            />
          )}

          {uiState === "success" && (
            <div
              style={{
                width:           "52px",
                height:          "52px",
                borderRadius:    "50%",
                background:      "linear-gradient(135deg, #059669, #10b981)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                margin:          "0 auto",
                animation:       "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {/* Checkmark SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {(uiState === "error" || uiState === "manual_close") && (
            <div
              style={{
                width:           "52px",
                height:          "52px",
                borderRadius:    "50%",
                background:      uiState === "manual_close"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(239,68,68,0.2)",
                border:          uiState === "manual_close"
                  ? "2px solid rgba(255,255,255,0.2)"
                  : "2px solid rgba(239,68,68,0.4)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                margin:          "0 auto",
                animation:       "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {uiState === "manual_close" ? (
                // Info icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                // X icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18"
                    stroke="rgba(239,68,68,0.9)"
                    strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Logo wordmark */}
        <p
          style={{
            fontSize:      "11px",
            fontWeight:    600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color:         "rgba(16,185,129,0.8)",
            margin:        "0 0 12px",
          }}
        >
          Altuvera
        </p>

        {/* Heading */}
        <h2
          style={{
            fontSize:   "18px",
            fontWeight: 700,
            margin:     "0 0 8px",
            color:      "#fff",
          }}
        >
          {uiState === "processing"   && "Completing sign-in…"}
          {uiState === "success"      && "Signed in!"}
          {uiState === "error"        && "Sign-in failed"}
          {uiState === "manual_close" && "You can close this window"}
        </h2>

        {/* Sub-text */}
        <p
          style={{
            fontSize:   "13px",
            color:      "rgba(255,255,255,0.6)",
            margin:     "0 0 20px",
            lineHeight: 1.5,
          }}
        >
          {uiState === "processing"   && "This window will close automatically."}
          {uiState === "success"      && "Redirecting you back…"}
          {uiState === "error"        && "Please close this window and try again."}
          {uiState === "manual_close" && "Your sign-in was processed. You may now close this tab."}
        </p>

        {/* Manual close button — only shown when window.close() was refused */}
        {uiState === "manual_close" && (
          <button
            onClick={() => { try { window.close(); } catch { /* ignore */ } }}
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              justifyContent:"center",
              gap:           "8px",
              padding:       "10px 24px",
              borderRadius:  "10px",
              border:        "none",
              background:    "rgba(255,255,255,0.12)",
              color:         "#fff",
              fontSize:      "14px",
              fontWeight:    600,
              cursor:        "pointer",
              transition:    "background 200ms",
              width:         "100%",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          >
            Close Window
          </button>
        )}

        {/* Progress dots for processing state */}
        {uiState === "processing" && (
          <div
            style={{
              display:        "flex",
              justifyContent: "center",
              gap:            "6px",
              marginTop:      "4px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width:        "6px",
                  height:       "6px",
                  borderRadius: "50%",
                  background:   "rgba(16,185,129,0.6)",
                  animation:    `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}