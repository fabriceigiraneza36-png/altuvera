// src/main.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Application Entry Point
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { UserAuthProvider } from "./context/UserAuthContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import "./index.css";
import { generateSvgPlaceholder } from "./utils/placeholderImage";


// Auto-fix broken images globally
document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (
      target?.tagName === "IMG" &&
      target.dataset.fallback !== "true" &&
      !target.src?.startsWith("data:")
    ) {
      target.dataset.fallback = "true";
      const w = target.naturalWidth || target.width || 800;
      const h = target.naturalHeight || target.height || 600;
      const text = target.alt || "Altuvera";
      target.src = generateSvgPlaceholder(w, h, text);
    }
  },
  true // Capture phase - catches all img errors
);

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL OBSERVER (lazy — non-blocking)
// ─────────────────────────────────────────────────────────────────────────────

const initScrollObserver = async () => {
  try {
    const { initScrollObserver: init } = await import(
      "./utils/scrollObserver.js"
    );
    init();
  } catch {
    // scrollObserver is a progressive enhancement — safe to ignore
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

window.addEventListener("unhandledrejection", (event) => {
  // Suppress intentional aborts (fetch cancellations, etc.)
  if (
    event.reason?.name === "AbortError" ||
    event.reason?.message?.toLowerCase().includes("aborted")
  ) {
    event.preventDefault();
    return;
  }
  if (import.meta.env.DEV) {
    console.error("[App] Unhandled rejection:", event.reason);
  }
});

window.addEventListener("error", (event) => {
  // Suppress third-party script errors (analytics, Google SDK, etc.)
  if (
    event.filename?.includes("google") ||
    event.filename?.includes("gtag") ||
    event.filename?.includes("gsi")
  ) {
    event.preventDefault();
    return;
  }
  if (import.meta.env.DEV) {
    console.error("[App] Unhandled error:", event.error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE MARK (Dev only)
// ─────────────────────────────────────────────────────────────────────────────

if (import.meta.env.DEV) {
  performance.mark("app:init:start");
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ELEMENT
// ─────────────────────────────────────────────────────────────────────────────

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    '[App] Root element "#root" not found. Check your index.html.'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <HelmetProvider>
        <AppProvider>
          <UserAuthProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </UserAuthProvider>
        </AppProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// ─────────────────────────────────────────────────────────────────────────────
// POST-RENDER (non-blocking progressive enhancements)
// ─────────────────────────────────────────────────────────────────────────────

// Activate scroll animations after first paint
if ("requestIdleCallback" in window) {
  window.requestIdleCallback(initScrollObserver, { timeout: 3000 });
} else {
  setTimeout(initScrollObserver, 1000);
}

// Dev performance report
if (import.meta.env.DEV) {
  performance.mark("app:init:end");
  performance.measure("app:init", "app:init:start", "app:init:end");
  const [measure] = performance.getEntriesByName("app:init");
  if (measure) {
    console.debug(
      `[App] Initialized in ${Math.round(measure.duration)}ms`
    );
  }
}