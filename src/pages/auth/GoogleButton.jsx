// src/components/auth/GoogleButton.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const GoogleButton = ({
  mode = "signin",
  onSuccess,
  onError,
  onCancel,
  width = 320,
  shape = "pill",
  theme = "outline",
  text,
  disabled = false,
}) => {
  const containerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(
    () => !!window.google?.accounts?.id
  );
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  // ── Load SDK ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setSdkReady(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      const handler = () => setSdkReady(true);
      existing.addEventListener("load", handler, { once: true });
      return () => existing.removeEventListener("load", handler);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      console.warn("[GoogleButton] SDK failed to load");
      onError?.(new Error("Google Sign-In SDK failed to load"));
    };
    document.head.appendChild(script);
  }, [onError]);

  // ── Render Button ─────────────────────────────────────────────────────────
  const renderButton = useCallback(() => {
    if (
      !sdkReady ||
      !containerRef.current ||
      !GOOGLE_CLIENT_ID ||
      initializedRef.current
    )
      return;

    try {
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) {
            onCancel?.();
            return;
          }

          setIsLoading(true);
          try {
            onSuccess?.(response.credential);
          } catch (err) {
            onError?.(err);
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // ✅ CRITICAL: Disable FedCM to prevent 403 errors
        use_fedcm_for_prompt: false,
        itp_support: false,
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme,
        size: "large",
        shape,
        width,
        text:
          text ||
          (mode === "signup" ? "signup_with" : "signin_with"),
        logo_alignment: "left",
      });
    } catch (err) {
      console.error("[GoogleButton] Render error:", err);
      initializedRef.current = false;
      onError?.(err);
    }
  }, [sdkReady, mode, theme, shape, width, text, onSuccess, onError, onCancel]);

  useEffect(() => {
    renderButton();
  }, [renderButton]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        minHeight: 44,
        opacity: disabled || isLoading ? 0.6 : 1,
        pointerEvents: disabled || isLoading ? "none" : "auto",
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Google renders button here */}
      <div ref={containerRef} />

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: 24,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #e5e7eb",
              borderTopColor: "#059669",
              borderRadius: "50%",
              animation: "googleBtnSpin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes googleBtnSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* SDK loading state */}
      {!sdkReady && (
        <div
          style={{
            width,
            height: 44,
            background: "#f3f4f6",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            color: "#9ca3af",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid #d1d5db",
              borderTopColor: "#6b7280",
              borderRadius: "50%",
              animation: "googleBtnSpin 0.7s linear infinite",
            }}
          />
          Loading Google...
        </div>
      )}
    </div>
  );
};

export default GoogleButton;