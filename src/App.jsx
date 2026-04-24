// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Enterprise Application Shell
// Routing · Performance · Auth · GitHub OAuth Callback
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, Suspense, useCallback } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useApp } from "./context/AppContext";
import { getRedirectUrl } from "./utils/routeUtils";
import "leaflet/dist/leaflet.css";

// ─── Eager Imports (Critical Path) ───────────────────────────────────────────
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ChecklistFloating from "./components/common/ChecklistFloating";
import ScrollToTop from "./components/common/ScrollToTop";
import Loader from "./components/common/Loader";
import CookieConsent from "./components/common/CookieConsent";
import AuthModal from "./components/auth/AuthModal";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageWrapper from "./components/common/PageWrapper";
import WhatsAppButton from "./components/common/WhatsAppButton";

// ─── Deferred Imports (Non-Critical) ─────────────────────────────────────────
const PersistentVideoPlayer = React.lazy(
  () => import("./components/common/PersistentVideoPlayer"),
);
const PersistentMapViewer = React.lazy(
  () => import("./components/common/PersistentMapViewer"),
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const publicRoutes = [
  {
    path: "/",
    component: React.lazy(() => import("./pages/Home")),
    meta: {
      title: "East Africa Safaris & Tours",
      description:
        "Book authentic East African safaris and cultural tours with Altuvera. Guided adventures in Kenya, Tanzania, Uganda, Rwanda, and Ethiopia.",
    },
  },
  {
    path: "/destinations",
    component: React.lazy(() => import("./pages/Destinations")),
    meta: {
      title: "Destinations",
      description:
        "Explore handpicked destinations across East Africa, from iconic national parks to beaches and cultural highlights.",
    },
  },
  {
    path: "/country/:countryId",
    component: React.lazy(() => import("./pages/CountryPage")),
    meta: {
      title: "Country Guides",
      description:
        "Country travel guides, top destinations, and planning tips for East African adventures with Altuvera.",
    },
  },
  {
    path: "/country/:countryId/destinations",
    component: React.lazy(() => import("./pages/CountryDestinations")),
    meta: {
      title: "Country Destinations",
      description:
        "Browse top destinations, experiences, and must-see highlights by country.",
    },
  },
  {
    path: "/destination/:destinationId",
    component: React.lazy(() => import("./pages/DestinationDetail")),
    meta: {
      title: "Destination",
      description:
        "Discover destination highlights, best time to visit, and travel tips. Plan your safari with Altuvera.",
    },
  },
  {
    path: "/tips",
    component: React.lazy(() => import("./pages/Tips")),
    meta: {
      title: "Travel Tips",
      description:
        "Practical safari and travel tips to help you plan a smooth, memorable East African trip.",
    },
  },
  {
    path: "/explore",
    component: React.lazy(() => import("./pages/Explore")),
    meta: {
      title: "Explore",
      description:
        "Explore experiences, culture, and inspiration for your next East African journey.",
    },
  },
  {
    path: "/posts",
    component: React.lazy(() => import("./pages/Posts")),
    meta: {
      title: "Journal",
      description:
        "Travel guides, safari tips, and stories from East Africa and beyond.",
    },
  },
  {
    path: "/post/:slug",
    component: React.lazy(() => import("./pages/PostDetail")),
    meta: {
      title: "Article",
      description:
        "Read Altuvera travel stories and guides to help you plan your safari and cultural experiences.",
    },
  },
  {
    path: "/interactive-map",
    component: React.lazy(() => import("./pages/InteractiveMap")),
    meta: {
      title: "Interactive Map",
      description:
        "Explore destinations and plan routes with Altuvera's interactive map.",
    },
  },
  {
    path: "/virtual-tour",
    component: React.lazy(() => import("./pages/VirtualTour")),
    meta: {
      title: "Virtual Tour",
      description:
        "Take a virtual tour and preview experiences before you travel with Altuvera.",
    },
  },
  {
    path: "/services",
    component: React.lazy(() => import("./pages/Services")),
    meta: {
      title: "Services",
      description:
        "Safari planning, guided tours, and travel support services offered by Altuvera.",
    },
  },
  {
    path: "/about",
    component: React.lazy(() => import("./pages/About")),
    meta: {
      title: "About Altuvera",
      description:
        "Learn about Altuvera and our mission to deliver authentic East African safari and cultural tours.",
    },
  },
  {
    path: "/contact",
    component: React.lazy(() => import("./pages/Contact")),
    meta: {
      title: "Contact Altuvera",
      description:
        "Get in touch with Altuvera to plan your safari, ask questions, or request a custom itinerary.",
    },
  },
  {
    path: "/gallery",
    component: React.lazy(() => import("./pages/Gallery")),
    meta: {
      title: "Gallery",
      description:
        "Browse photos from safaris, landscapes, wildlife, and cultural experiences.",
    },
  },
  {
    path: "/faq",
    component: React.lazy(() => import("./pages/FAQ")),
    meta: {
      title: "FAQ",
      description:
        "Answers to common questions about booking, travel logistics, safety, and safari experiences.",
    },
  },
  {
    path: "/team",
    component: React.lazy(() => import("./pages/Team")),
    meta: {
      title: "Our Team",
      description:
        "Meet the Altuvera team behind our safari and cultural experiences.",
    },
  },
  {
    path: "/payment-terms",
    component: React.lazy(() => import("./pages/PaymentTerms")),
    meta: {
      title: "Payment Terms",
      description: "Payment terms and booking information for Altuvera tours.",
    },
  },
  {
    path: "/privacy",
    component: React.lazy(() => import("./pages/PrivacyPolicy")),
    meta: {
      title: "Privacy Policy",
      description: "Read Altuvera's privacy policy.",
    },
  },
  {
    path: "/terms",
    component: React.lazy(() => import("./pages/TermsOfService")),
    meta: {
      title: "Terms of Service",
      description: "Read Altuvera's terms of service.",
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

// ─────────────────────────────────────────────────────────────────────────────
// PREFETCH CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const HIGH_PRIORITY_PREFETCH = [
  () => import("./pages/Home"),
  () => import("./pages/Destinations"),
  () => import("./pages/About"),
  () => import("./pages/Contact"),
];

const prefetchRoutes = () => {
  const run = () =>
    HIGH_PRIORITY_PREFETCH.forEach((loader) => loader().catch(() => {}));

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 2000);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GITHUB OAUTH CALLBACK PAGE
// ─────────────────────────────────────────────────────────────────────────────

const GitHubCallback = React.memo(() => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDesc = url.searchParams.get("error_description");
    const provider = url.searchParams.get("auth_provider");

    // Only handle if this is a GitHub callback
    if (!code && !error && provider !== "github") {
      navigate("/", { replace: true });
      return;
    }

    // The UserAuthContext consumeGithubCallback effect handles the actual
    // token exchange — we just show a loading screen and redirect after
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 5000);

    if (error) {
      console.error("[GitHub OAuth] Error:", errorDesc || error);
      clearTimeout(timer);
      navigate("/", { replace: true });
    }

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={githubCallbackStyles.container}>
      <div style={githubCallbackStyles.card}>
        {/* Spinner */}
        <div style={githubCallbackStyles.spinner} />
        <style>{spinnerKeyframes}</style>

        {/* GitHub Icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="#24292f"
          style={{ marginBottom: 16 }}
        >
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>

        <h2 style={githubCallbackStyles.title}>Completing GitHub Sign-In</h2>
        <p style={githubCallbackStyles.subtitle}>
          Please wait while we verify your account…
        </p>
      </div>
    </div>
  );
});

GitHubCallback.displayName = "GitHubCallback";

const spinnerKeyframes = `
  @keyframes githubSpinner {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const githubCallbackStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#ffffff",
    borderRadius: 20,
    padding: "48px 40px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    maxWidth: 380,
    width: "90%",
    textAlign: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e5e7eb",
    borderTopColor: "#059669",
    borderRadius: "50%",
    animation: "githubSpinner 0.8s linear infinite",
    marginBottom: 24,
  },
  title: {
    margin: "0 0 8px",
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.5,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// NOT FOUND
// ─────────────────────────────────────────────────────────────────────────────

const NotFound = React.lazy(() => import("./pages/NotFound"));

// ─────────────────────────────────────────────────────────────────────────────
// SMART REDIRECT (Handles legacy URLs + 404)
// ─────────────────────────────────────────────────────────────────────────────

const SmartRedirect = React.memo(() => {
  const { pathname } = useLocation();
  const redirectUrl = useMemo(() => getRedirectUrl(pathname), [pathname]);

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

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const AppLayout = React.memo(() => (
  <>
    <Navbar />
    <main style={styles.main}>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <ChecklistFloating />
  </>
));

AppLayout.displayName = "AppLayout";

// Overlay rendered outside main layout — always visible
const OverlayLayer = React.memo(({ isLoading }) => (
  <>
    <ScrollToTop />
    <Suspense fallback={null}>
      <PersistentVideoPlayer />
      <PersistentMapViewer />
    </Suspense>
    <CookieConsent />
    <AuthModal />
    <WhatsAppButton />
    {isLoading && <Loader fullScreen />}
  </>
));

OverlayLayer.displayName = "OverlayLayer";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

const renderPublicRoute = ({ path, component: Component, meta }) => (
  <Route
    key={path}
    path={path}
    element={
      <PageWrapper
        title={meta.title}
        description={meta.description}
        noindex={meta.noindex}
      >
        <Component />
      </PageWrapper>
    }
  />
);

const renderProtectedRoute = ({ path, component: Component, meta }) => (
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
          <Component />
        </PageWrapper>
      </ProtectedRoute>
    }
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const location = useLocation();
  const { isLoading, setIsLoading } = useApp();

  // Stop loading spinner when navigating away from home
  useEffect(() => {
    if (location.pathname !== "/" && isLoading) {
      setIsLoading(false);
    }
  }, [isLoading, location.pathname, setIsLoading]);

  // Prefetch high-priority routes on idle
  useEffect(() => {
    prefetchRoutes();
  }, []);

  // Dev-only performance logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      const entry = performance.getEntriesByType?.("navigation")?.[0];
      if (entry) {
        console.debug(
          `[Router] ${location.pathname} — DOM interactive: ${Math.round(
            entry.domInteractive,
          )}ms`,
        );
      }
    }
  }, [location.pathname]);

  return (
    <div style={styles.appShell}>
      <Routes>
        {/* ── GitHub OAuth Callback (outside AppLayout — no Navbar/Footer) ── */}
        <Route
          path="/auth/github/callback"
          element={
            <PageWrapper title="Signing in with GitHub…" noindex>
              <GitHubCallback />
            </PageWrapper>
          }
        />

        {/* ── Main Layout ─────────────────────────────────────────────────── */}
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          {publicRoutes.map(renderPublicRoute)}

          {/* Protected Routes */}
          {protectedRoutes.map(renderProtectedRoute)}

          {/* Catch-all → SmartRedirect handles legacy URLs + 404 */}
          <Route path="*" element={<SmartRedirect />} />
        </Route>
      </Routes>

      {/* Global Overlays */}
      <OverlayLayer isLoading={isLoading} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  appShell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    isolation: "isolate",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};

export default App;
