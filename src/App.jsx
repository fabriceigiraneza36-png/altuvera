// ============================================================================
// App.jsx — Application Shell (Optimized)
// ============================================================================

import React, {
  useEffect,
  useMemo,
  Suspense,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useApp } from "./context/AppContext";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import { useUserAuth } from "./context/UserAuthContext";
import { MessagingProvider } from "./context/MessagingContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import countryService from "./services/countryService";
import NewsletterPopup from "./components/common/NewsletterPopup";
import AutoSubscribeModal from "./components/common/AutoSubscribeModal";

// ── Eager imports ─────────────────────────────────────────────────────────────
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import Loader from "./components/common/Loader";
import CookieConsent from "./components/common/CookieConsent";
import AuthModal from "./components/auth/AuthModal";
import CongratulationWindow from "./components/auth/CongratulationWindow";
import NotLoggedInMessage from "./components/auth/NotLoggedInMessage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageWrapper from "./components/common/PageWrapper";
import WhatsAppButton from "./components/common/WhatsAppButton";

// ── Lazy imports ──────────────────────────────────────────────────────────────
const PersistentVideoPlayer = React.lazy(() =>
  import("./components/common/PersistentVideoPlayer")
);
const PersistentMapViewer = React.lazy(() =>
  import("./components/common/PersistentMapViewer")
);
const NotFound = React.lazy(() => import("./pages/NotFound"));

// ============================================================================
// CONSTANTS
// ============================================================================

const WELCOME_KEY_PREFIX         = "altuvera_welcome_shown:";
const CELEBRATION_DURATION_MS    = 4200;
const CALLBACK_REDIRECT_DELAY_MS = 1800;
const CALLBACK_ERROR_REDIRECT_DELAY_MS = 1200;

// ============================================================================
// LEGACY URL REDIRECT MAP
// ============================================================================

const REDIRECT_MAP = {
  "/home":          "/",
  "/destinations/": "/destinations",
  "/tours":         "/destinations",
  "/safaris":       "/destinations",
  "/blog":          "/posts",
  "/articles":      "/posts",
  "/news":          "/posts",
  "/map":           "/interactive-map",
  "/contact-us":    "/contact",
  "/about-us":      "/about",
  "/our-team":      "/team",
  "/faqs":          "/faq",
};

const getRedirectUrl = (pathname) => {
  if (!pathname) return null;
  const clean = pathname.toLowerCase().replace(/\/$/, "") || "/";
  return REDIRECT_MAP[clean] ?? null;
};

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

const publicRoutes = [
  // ── Home ──────────────────────────────────────────────────────────────────
  {
    path: "/",
    component: React.lazy(() => import("./pages/Home")),
    meta: {
      title: "East Africa Safaris & Tours",
      description:
        "Book authentic East African safaris and cultural tours with Altuvera.",
    },
  },

  // ── Dev / Test ─────────────────────────────────────────────────────────────
  {
    path: "/tailwind-test",
    component: React.lazy(() => import("./pages/TailwindTest")),
    meta: {
      title: "Tailwind CSS Test",
      description: "Live test page for Tailwind CSS styles.",
    },
  },

  // ── Destinations ───────────────────────────────────────────────────────────
  {
    path: "/destinations",
    component: React.lazy(() => import("./pages/Destinations")),
    meta: {
      title: "Destinations",
      description: "Explore handpicked destinations across East Africa.",
    },
  },
  {
    path: "/destinations/:destinationId",
    component: React.lazy(() => import("./pages/DestinationDetail")),
    meta: {
      title: "Destination",
      description:
        "Discover destination highlights, best time to visit, and travel tips.",
    },
  },

  // ── Adventures ─────────────────────────────────────────────────────────────
  {
    path: "/adventures/:slug",
    component: React.lazy(() => import("./pages/AdventureGuide")),
    meta: {
      title: "Adventure Guide",
      description:
        "Explore complete adventure guides and matching destinations across East Africa.",
    },
  },

  // ── Countries ──────────────────────────────────────────────────────────────
  //
  //  CountryPage lives at:  src/pages/CountryPage/index.jsx
  //  CountryPage.css lives at: src/pages/CountryPage/CountryPage.css
  //  (import './CountryPage.css' is inside CountryPage/index.jsx)
  //
  {
    path: "/country/:countryId",
    component: React.lazy(() => import("./pages/CountryPage/CountryPage.jsx")),
    meta: {
      title: "Country Guide",
      description:
        "Country travel guides and planning tips for East African adventures.",
    },
  },
  {
    path: "/country/:countryId/destinations",
    component: React.lazy(() => import("./pages/CountryDestinations")),
    meta: {
      title: "Country Destinations",
      description: "Browse top destinations and highlights by country.",
    },
  },

  // ── Content pages ──────────────────────────────────────────────────────────
  {
    path: "/tips",
    component: React.lazy(() => import("./pages/Tips")),
    meta: {
      title: "Travel Tips",
      description: "Practical safari and travel tips for East Africa.",
    },
  },
  {
    path: "/explore",
    component: React.lazy(() => import("./pages/Explore")),
    meta: {
      title: "Explore",
      description:
        "Explore experiences and culture for your East African journey.",
    },
  },
  {
    path: "/posts",
    component: React.lazy(() => import("./pages/Posts")),
    meta: {
      title: "Journal",
      description:
        "Travel guides, safari tips, and stories from East Africa.",
    },
  },
  {
    path: "/post/:slug",
    component: React.lazy(() => import("./pages/PostDetail")),
    meta: {
      title: "Article",
      description: "Read Altuvera travel stories and guides.",
    },
  },

  // ── Map ────────────────────────────────────────────────────────────────────
  {
    path: "/interactive-map",
    component: React.lazy(() => import("./pages/InteractiveMap")),
    meta: {
      title: "Interactive Map",
      description: "Explore destinations with Altuvera's interactive map.",
    },
  },

  // ── Info pages ─────────────────────────────────────────────────────────────
  {
    path: "/services",
    component: React.lazy(() => import("./pages/Services")),
    meta: {
      title: "Services",
      description: "Safari planning and travel services by Altuvera.",
    },
  },
  {
    path: "/about",
    component: React.lazy(() => import("./pages/About")),
    meta: {
      title: "About Altuvera",
      description: "Learn about Altuvera and our safari mission.",
    },
  },
  {
    path: "/contact",
    component: React.lazy(() => import("./pages/Contact")),
    meta: {
      title: "Contact Altuvera",
      description: "Get in touch with Altuvera to plan your safari.",
    },
  },
  {
    path: "/gallery",
    component: React.lazy(() => import("./pages/Gallery")),
    meta: {
      title: "Gallery",
      description:
        "Browse photos from safaris and cultural experiences.",
    },
  },
  {
    path: "/faq",
    component: React.lazy(() => import("./pages/FAQ")),
    meta: {
      title: "FAQ",
      description:
        "Answers to common questions about booking and safaris.",
    },
  },
  {
    path: "/team",
    component: React.lazy(() => import("./pages/Team")),
    meta: {
      title: "Our Team",
      description: "Meet the Altuvera team.",
    },
  },

  // ── Legal pages ────────────────────────────────────────────────────────────
  {
    path: "/payment-terms",
    component: React.lazy(() => import("./pages/PaymentTerms")),
    meta: {
      title: "Payment Terms",
      description: "Payment terms and booking information.",
    },
  },
  {
    path: "/privacy",
    component: React.lazy(() => import("./pages/PrivacyPolicy")),
    meta: {
      title: "Privacy Policy",
      description: "Altuvera privacy policy.",
    },
  },
  {
    path: "/terms",
    component: React.lazy(() => import("./pages/TermsOfService")),
    meta: {
      title: "Terms of Service",
      description: "Altuvera terms of service.",
    },
  },
];

const protectedRoutes = [
  {
    path: "/booking",
    component: React.lazy(() => import("./pages/Booking")),
    meta: { title: "Booking", noindex: true },
  },
  {
    path: "/profile",
    component: React.lazy(() => import("./pages/auth/UserProfile")),
    meta: { title: "My Profile", noindex: true },
  },
  {
    path: "/my-bookings",
    component: React.lazy(() => import("./pages/auth/MyBookings")),
    meta: { title: "My Bookings", noindex: true },
  },
  {
    path: "/wishlist",
    component: React.lazy(() => import("./pages/auth/Wishlist")),
    meta: { title: "Wishlist", noindex: true },
  },
  {
    path: "/settings",
    component: React.lazy(() => import("./pages/auth/UserSettings")),
    meta: { title: "Settings", noindex: true },
  },
];

// ============================================================================
// ROUTE RENDERERS
// ============================================================================

const renderPublicRoute = ({ path, component: Component, meta = {} }) => (
  <Route
    key={path}
    path={path}
    element={
      <PageWrapper
        title={meta.title}
        description={meta.description}
        noindex={meta.noindex}
      >
        <Suspense fallback={<Loader />}>
          <Component />
        </Suspense>
      </PageWrapper>
    }
  />
);

const renderProtectedRoute = ({ path, component: Component, meta = {} }) => (
  <Route
    key={path}
    path={path}
    element={
      <ProtectedRoute>
        <PageWrapper
          title={meta.title}
          description={meta.description}
          noindex={meta.noindex}
        >
          <Suspense fallback={<Loader />}>
            <Component />
          </Suspense>
        </PageWrapper>
      </ProtectedRoute>
    }
  />
);

// ============================================================================
// INLINE SVG ATOMS
// ============================================================================

const Icon = ({ children, size = 16, style, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={style}
    {...props}
  >
    {children}
  </svg>
);

const CheckIcon = ({ size = 28, strokeWidth = 3.5, color = "#fff" }) => (
  <Icon size={size} stroke={color} strokeWidth={strokeWidth}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);

const ArrowRightIcon = ({ size = 16, style }) => (
  <Icon size={size} style={style}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Icon>
);

const GlobeIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);

const CalendarIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const HeartIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);

const GitHubMark = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#24292f"
    aria-hidden="true"
    style={{ marginBottom: 14 }}
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

// ============================================================================
// STYLES — injected once, scoped to class prefix
// ============================================================================

const APP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap');

  @keyframes appFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes appScaleUp {
    from { opacity: 0; transform: scale(0.94) translateY(20px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes appCheckmark {
    0%   { transform: scale(0.7);  opacity: 0; }
    60%  { transform: scale(1.12);             }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes appPulseRing {
    0%   { transform: scale(1);   opacity: .6; }
    100% { transform: scale(1.6); opacity: 0;  }
  }
  @keyframes appFloatUp {
    0%   { opacity: 0; transform: translateY(8px);  }
    100% { opacity: 1; transform: translateY(0);     }
  }
  @keyframes appConfetti {
    0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
    100% { transform: translateY(-80px) rotate(360deg); opacity: 0; }
  }
  @keyframes ghSpin {
    to { transform: rotate(360deg); }
  }

  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    isolation: isolate;
    font-family: 'Playfair Display', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── Celebration card ── */
  .cel-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(4, 47, 31, 0.38);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
    animation: appFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .cel-card {
    background: #ffffff;
    border-radius: 28px;
    padding: clamp(36px, 5vw, 52px) clamp(28px, 4vw, 44px);
    text-align: center;
    box-shadow:
      0 32px 64px -12px rgba(4, 47, 31, 0.2),
      0  8px 24px -4px  rgba(4, 47, 31, 0.1),
      0  0   0   1px   rgba(4, 47, 31, 0.05);
    max-width: 420px;
    width: 100%;
    position: relative;
    overflow: hidden;
    animation: appScaleUp 0.65s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  }
  .cel-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .cel-blob--tl {
    top: -50px; left: -50px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(16,185,129,.09) 0%, transparent 70%);
  }
  .cel-blob--br {
    bottom: -50px; right: -50px;
    width: 160px; height: 160px;
    background: radial-gradient(circle, rgba(5,150,105,.07) 0%, transparent 70%);
  }
  .cel-checkmark-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 22px;
  }
  .cel-checkmark-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid rgba(16, 185, 129, 0.35);
    animation: appPulseRing 1.5s cubic-bezier(0, 0, 0.2, 1) 0.5s infinite;
  }
  .cel-checkmark-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(145deg, #10b981, #047857);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 14px 28px rgba(5, 150, 105, 0.3);
    animation: appCheckmark 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
  }
  .cel-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(22px, 4.5vw, 30px);
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    line-height: 1.2;
    position: relative;
    z-index: 1;
  }
  .cel-subtitle {
    font-size: 11px;
    color: #059669;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin: 0 0 16px;
    position: relative;
    z-index: 1;
    animation: appFloatUp 0.5s 0.4s both;
  }
  .cel-desc {
    font-size: 14.5px;
    color: #475569;
    line-height: 1.72;
    margin: 0 auto 26px;
    max-width: 340px;
    position: relative;
    z-index: 1;
    animation: appFloatUp 0.5s 0.5s both;
  }
  .cel-badges {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
    animation: appFloatUp 0.5s 0.6s both;
  }
  .cel-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 15px;
    background: #f0fdf4;
    border-radius: 99px;
    border: 1.5px solid rgba(4, 120, 87, 0.14);
    font-size: 13px;
    color: #047857;
    font-weight: 700;
    transition: all 0.2s ease;
  }
  .cel-badge:hover {
    background: #dcfce7;
    border-color: rgba(4, 120, 87, 0.28);
    transform: translateY(-1px);
  }
  .cel-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 15px 28px;
    background: linear-gradient(135deg, #047857, #065f46);
    color: #ffffff;
    text-decoration: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 15px;
    box-shadow: 0 8px 22px rgba(4, 120, 87, 0.22);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    animation: appFloatUp 0.5s 0.7s both;
    border: none;
    cursor: pointer;
    letter-spacing: 0.01em;
  }
  .cel-cta:hover {
    background: linear-gradient(135deg, #065f46, #022c22);
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(4, 120, 87, 0.32);
  }
  .cel-cta:active { transform: translateY(0); }

  /* ── GitHub callback page ── */
  .gh-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(145deg, #f0fdf4 0%, #f8fafc 100%);
    font-family: 'Playfair Display', 'Inter', -apple-system, sans-serif;
    padding: 20px;
  }
  .gh-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(40px, 6vw, 56px) clamp(32px, 5vw, 48px);
    box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.08),
      0  4px 12px rgba(0, 0, 0, 0.04),
      0  0   0   1px rgba(0, 0, 0, 0.04);
    max-width: 400px;
    width: 100%;
    text-align: center;
  }
  .gh-spinner {
    width: 44px;
    height: 44px;
    border: 3px solid #e5e7eb;
    border-top-color: #059669;
    border-radius: 50%;
    animation: ghSpin 0.8s linear infinite;
    margin-bottom: 28px;
  }
  .gh-spinner--error { border-top-color: #ef4444; animation-duration: 2s; }
  .gh-spinner--done  { border-top-color: #10b981; animation-duration: 2s; }
  .gh-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 10px;
    letter-spacing: -0.015em;
  }
  .gh-status {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 600;
    margin: 0;
  }
  .gh-status--default { color: #6b7280; }
  .gh-status--done    { color: #059669; }
  .gh-status--error   { color: #ef4444; }
  .gh-error-detail {
    margin-top: 10px;
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.6;
    max-width: 300px;
  }
  .gh-progress {
    width: 100%;
    height: 3px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 24px;
  }
  .gh-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 2px;
    animation: appReveal 1.6s ease-out both;
  }
  @keyframes appReveal {
    from { width: 0; }
    to   { width: 100%; }
  }
`;

let stylesInjected = false;
function injectAppStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.getElementById("app-styles");
  if (el) { stylesInjected = true; return; }
  const s = document.createElement("style");
  s.id = "app-styles";
  s.textContent = APP_STYLES;
  document.head.appendChild(s);
  stylesInjected = true;
}

// ============================================================================
// FEATURE BADGES
// ============================================================================

const FEATURE_BADGES = [
  { id: "explore", label: "Explore",  icon: <GlobeIcon    size={13} /> },
  { id: "book",    label: "Book",     icon: <CalendarIcon size={13} /> },
  { id: "save",    label: "Wishlist", icon: <HeartIcon    size={13} /> },
];

// ============================================================================
// GITHUB CALLBACK PAGE
// ============================================================================

const GitHubCallbackPage = React.memo(() => {
  const { githubLoading, isAuthenticated, socialAuthError } = useUserAuth();

  useEffect(() => {
    if (githubLoading) return;
    const delay = socialAuthError
      ? CALLBACK_ERROR_REDIRECT_DELAY_MS
      : CALLBACK_REDIRECT_DELAY_MS;
    const timer = setTimeout(() => window.location.replace("/"), delay);
    return () => clearTimeout(timer);
  }, [githubLoading, isAuthenticated, socialAuthError]);

  const isError     = Boolean(socialAuthError);
  const isDone      = !githubLoading && isAuthenticated && !isError;
  const statusClass = isError
    ? "gh-status--error"
    : isDone
    ? "gh-status--done"
    : "gh-status--default";
  const statusMsg   = isError
    ? "Sign-in failed. Redirecting…"
    : isDone
    ? "Signed in successfully! Redirecting…"
    : githubLoading
    ? "Verifying your GitHub account…"
    : "Completing sign-in…";
  const spinnerClass = isError
    ? "gh-spinner gh-spinner--error"
    : isDone
    ? "gh-spinner gh-spinner--done"
    : "gh-spinner";

  return (
    <div className="gh-page">
      <div className="gh-card">
        <div className={spinnerClass} aria-hidden="true" />
        <GitHubMark size={44} />
        <h1 className="gh-title">GitHub Sign‑In</h1>
        <p className={`gh-status ${statusClass}`}>{statusMsg}</p>
        {isError && <p className="gh-error-detail">{socialAuthError}</p>}
        {!isError && (
          <div className="gh-progress">
            <div className="gh-progress__fill" />
          </div>
        )}
      </div>
    </div>
  );
});
GitHubCallbackPage.displayName = "GitHubCallbackPage";

// ============================================================================
// CELEBRATION OVERLAY
// ============================================================================

const CelebrationOverlay = React.memo(({ userName, onDismiss }) => {
  const displayName = useMemo(() => {
    if (!userName) return "Traveler";
    return userName
      .split(" ")
      .map((n) => (n[0]?.toUpperCase() ?? "") + n.slice(1).toLowerCase())
      .join(" ");
  }, [userName]);

  return (
    <div
      className="cel-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome celebration"
      onClick={onDismiss}
    >
      <div className="cel-card" onClick={(e) => e.stopPropagation()}>
        <div className="cel-blob cel-blob--tl" aria-hidden="true" />
        <div className="cel-blob cel-blob--br" aria-hidden="true" />
        <div className="cel-checkmark-wrap">
          <div className="cel-checkmark-ring" aria-hidden="true" />
          <div className="cel-checkmark-circle">
            <CheckIcon size={30} strokeWidth={3} color="#fff" />
          </div>
        </div>
        <h2 className="cel-title">Welcome, {displayName}!</h2>
        <p className="cel-subtitle">Your adventure starts now</p>
        <p className="cel-desc">
          You now have full access to plan your dream safari, save stunning
          destinations, and explore the wonders of East Africa.
        </p>
        <div className="cel-badges">
          {FEATURE_BADGES.map(({ id, label, icon }) => (
            <span key={id} className="cel-badge">
              {icon}
              {label}
            </span>
          ))}
        </div>
        <a href="/destinations" className="cel-cta">
          <ArrowRightIcon size={16} />
          Start Exploring
        </a>
      </div>
    </div>
  );
});
CelebrationOverlay.displayName = "CelebrationOverlay";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

const AppLayout = React.memo(() => (
  <>
    <Navbar />
    <main
      id="main-content"
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </>
));
AppLayout.displayName = "AppLayout";

// ============================================================================
// OVERLAY LAYER
// ============================================================================

const OverlayLayer = React.memo(
  ({ isLoading, showCelebration, userName, onDismissCelebration }) => (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
        <PersistentVideoPlayer />
        <PersistentMapViewer />
      </Suspense>
      <CookieConsent />
      <AuthModal />
      <WhatsAppButton />
      <NewsletterPopup source="exit-popup" />
      <AutoSubscribeModal />
      {showCelebration && (
        <CelebrationOverlay
          userName={userName}
          onDismiss={onDismissCelebration}
        />
      )}
      {isLoading && <Loader fullScreen />}
    </>
  )
);
OverlayLayer.displayName = "OverlayLayer";

// ============================================================================
// SMART REDIRECT
// ============================================================================

const SmartRedirect = React.memo(() => {
  const { pathname } = useLocation();
  const redirectUrl  = useMemo(() => getRedirectUrl(pathname), [pathname]);

  if (redirectUrl) return <Navigate to={redirectUrl} replace />;

  return (
    <PageWrapper title="Page Not Found" noindex>
      <Suspense fallback={<Loader />}>
        <NotFound />
      </Suspense>
    </PageWrapper>
  );
});
SmartRedirect.displayName = "SmartRedirect";

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

function useCelebration({ isAuthenticated, user }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const prevAuthRef = useRef(false);
  const dismiss = useCallback(() => setShowCelebration(false), []);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;

    if (isAuthenticated && !wasAuthenticated && user) {
      const email = (user?.email ?? "").toLowerCase().trim();
      const key   = email ? `${WELCOME_KEY_PREFIX}${email}` : null;

      let shouldShow = false;
      try {
        if (!key || !localStorage.getItem(key)) {
          shouldShow = true;
          if (key) localStorage.setItem(key, String(Date.now()));
        }
      } catch {
        shouldShow = true;
      }

      if (shouldShow) {
        setShowCelebration(true);
        const timer = setTimeout(
          () => setShowCelebration(false),
          CELEBRATION_DURATION_MS
        );
        prevAuthRef.current = isAuthenticated;
        return () => clearTimeout(timer);
      }
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, user]);

  return { showCelebration, dismiss };
}

function usePrefetchCountries() {
  useEffect(() => {
    countryService.getAll({}).catch(() => {});
    countryService.getAll({ featured: true }).catch(() => {});
  }, []);
}

function useRouteLoader({ location, isLoading, setIsLoading }) {
  useEffect(() => {
    if (location.pathname !== "/" && isLoading) setIsLoading(false);
  }, [location.pathname, isLoading, setIsLoading]);
}

function useDevPerfLog(pathname) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const entry = performance.getEntriesByType?.("navigation")?.[0];
    if (entry) {
      console.debug(
        `[Router] ${pathname} — DOM interactive: ${Math.round(
          entry.domInteractive
        )} ms`
      );
    }
  }, [pathname]);
}

// ============================================================================
// ROOT APP
// ============================================================================

function App() {
  const location = useLocation();
  const { isLoading, setIsLoading } = useApp();
  const {
    isAuthenticated,
    user,
    showCongratulation,
    congratulationType,
    showNotLoggedInMessage,
  } = useUserAuth();

  useEffect(injectAppStyles, []);
  usePrefetchCountries();
  useRouteLoader({ location, isLoading, setIsLoading });
  useDevPerfLog(location.pathname);

  const { showCelebration, dismiss: dismissCelebration } = useCelebration({
    isAuthenticated,
    user,
  });

  const userName = user?.fullName || user?.name;

  return (
    <div className="app-shell">
      <Routes>
        {/* ── GitHub OAuth callback — bare page, no Navbar/Footer ── */}
        <Route
          path="/auth/github/callback"
          element={
            <PageWrapper title="Signing in with GitHub…" noindex>
              <GitHubCallbackPage />
            </PageWrapper>
          }
        />

        {/* ── Google OAuth callback ── */}
        <Route
          path="/auth/google/callback"
          element={<GoogleCallbackPage />}
        />

        {/* ── Main shell (Navbar + Footer) ── */}
        <Route element={<AppLayout />}>
          {publicRoutes.map(renderPublicRoute)}
          {protectedRoutes.map(renderProtectedRoute)}
          <Route path="*" element={<SmartRedirect />} />
        </Route>
      </Routes>

      <OverlayLayer
        isLoading={isLoading}
        showCelebration={showCelebration}
        userName={userName}
        onDismissCelebration={dismissCelebration}
      />

      <CongratulationWindow
        isVisible={showCongratulation}
        type={congratulationType}
        user={user}
        onClose={() => {}}
      />

      <NotLoggedInMessage isVisible={showNotLoggedInMessage} />
    </div>
  );
}

// ============================================================================
// PROVIDERS WRAPPER
// ============================================================================

const AppWithProviders = () => (
  <MessagingProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </MessagingProvider>
);

export default AppWithProviders;