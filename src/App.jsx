// ============================================================================
// App.jsx — Application Shell
// ============================================================================

import React, {
  useEffect,
  useMemo,
  Suspense,
  useState,
  useCallback,
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
import ChecklistFloating from "./components/common/ChecklistFloating";
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
// LEGACY URL REDIRECT MAP
// ============================================================================

const REDIRECT_MAP = {
  "/home": "/",
  "/destinations/": "/destinations",
  "/tours": "/destinations",
  "/safaris": "/destinations",
  "/blog": "/posts",
  "/articles": "/posts",
  "/news": "/posts",
  "/map": "/interactive-map",
  "/contact-us": "/contact",
  "/about-us": "/about",
  "/our-team": "/team",
  "/faqs": "/faq",
};

/**
 * Resolves legacy/mistyped URLs to their canonical destination.
 * Returns null if no redirect is needed.
 */
function getRedirectUrl(pathname) {
  if (!pathname) return null;
  const clean = pathname.toLowerCase().replace(/\/$/, "") || "/";
  return REDIRECT_MAP[clean] ?? null;
}

// ============================================================================
// Route Definitions
// ============================================================================

const publicRoutes = [
  {
    path: "/",
    component: React.lazy(() => import("./pages/Home")),
    meta: {
      title: "East Africa Safaris & Tours",
      description: "Book authentic East African safaris and cultural tours with Altuvera.",
    },
  },
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
      description: "Discover destination highlights, best time to visit, and travel tips.",
    },
  },
  {
    path: "/country/:countryId",
    component: React.lazy(() => import("./pages/CountryPage")),
    meta: {
      title: "Country Guides",
      description: "Country travel guides and planning tips for East African adventures.",
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
      description: "Explore experiences and culture for your East African journey.",
    },
  },
  {
    path: "/posts",
    component: React.lazy(() => import("./pages/Posts")),
    meta: {
      title: "Journal",
      description: "Travel guides, safari tips, and stories from East Africa.",
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
  {
    path: "/interactive-map",
    component: React.lazy(() => import("./pages/InteractiveMap")),
    meta: {
      title: "Interactive Map",
      description: "Explore destinations with Altuvera's interactive map.",
    },
  },
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
      description: "Browse photos from safaris and cultural experiences.",
    },
  },
  {
    path: "/faq",
    component: React.lazy(() => import("./pages/FAQ")),
    meta: {
      title: "FAQ",
      description: "Answers to common questions about booking and safaris.",
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
  {
    path: "/tailwind-test",
    component: React.lazy(() =>
      import("./components/common/TailwindTest")
    ),
    meta: { title: "Tailwind Test", description: "" },
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
// GitHub OAuth Callback Page
// ============================================================================

const GitHubCallbackPage = React.memo(() => {
  const { githubLoading, isAuthenticated, socialAuthError } =
    useUserAuth();

  useEffect(() => {
    if (githubLoading) return;
    const delay = socialAuthError ? 1200 : 1800;
    const timer = setTimeout(() => {
      window.location.replace("/");
    }, delay);
    return () => clearTimeout(timer);
  }, [githubLoading, isAuthenticated, socialAuthError]);

  const isError = Boolean(socialAuthError);
  const isDone = !githubLoading && isAuthenticated;

  const statusMsg = isError
    ? "Sign-in failed. Redirecting…"
    : isDone
      ? "Signed in! Redirecting…"
      : githubLoading
        ? "Verifying your GitHub account…"
        : "Completing sign-in…";

  return (
    <div style={cbStyles.page}>
      <div style={cbStyles.card}>
        <style>{`@keyframes ghSpin { to { transform: rotate(360deg); } }`}</style>

        <div
          style={{
            ...cbStyles.spinner,
            borderTopColor: isError
              ? "#ef4444"
              : isDone
                ? "#059669"
                : "#059669",
            animationDuration: isDone ? "2s" : "0.8s",
          }}
        />

        {/* GitHub SVG mark */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="#24292f"
          style={{ marginBottom: 14 }}
          aria-hidden="true"
        >
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>

        <h2 style={cbStyles.title}>GitHub Sign-In</h2>
        <p
          style={{
            ...cbStyles.status,
            color: isError ? "#ef4444" : isDone ? "#059669" : "#6b7280",
          }}
        >
          {statusMsg}
        </p>
        {isError && (
          <p style={cbStyles.errorDetail}>{socialAuthError}</p>
        )}
      </div>
    </div>
  );
});
GitHubCallbackPage.displayName = "GitHubCallbackPage";

const cbStyles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0fdf4 0%,#f9fafb 100%)",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    borderRadius: 20,
    padding: "48px 40px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
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
    animation: "ghSpin 0.8s linear infinite",
    marginBottom: 24,
  },
  title: {
    margin: "0 0 8px",
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
  },
  status: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  errorDetail: {
    marginTop: 10,
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 1.5,
    maxWidth: 280,
  },
};

// ============================================================================
// Celebration Overlay
// ============================================================================

const CELEBRATION_KEYFRAMES = `
  @keyframes celFadeIn    { from { opacity:0; }                            to { opacity:1; } }
  @keyframes celSlideUp   { from { opacity:0; transform:translateY(30px);} to { opacity:1; transform:translateY(0); } }
  @keyframes celPulse     { 0%,100%{transform:scale(1);}                  50%{transform:scale(1.08);} }
  @keyframes celBounce    { 0%,100%{transform:translateY(0);}              50%{transform:translateY(-8px);} }
`;

const CelebrationOverlay = React.memo(({ userName }) => {
  const displayName = userName
    ? userName
      .split(" ")
      .map((n) => n[0]?.toUpperCase() + n.slice(1))
      .join(" ")
    : "Traveler";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,150,105,0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        animation: "celFadeIn 0.5s ease-out forwards",
      }}
    >
      <style>{CELEBRATION_KEYFRAMES}</style>

      <div
        style={{
          background: "linear-gradient(135deg,#fff 0%,#f0fdf4 100%)",
          borderRadius: 32,
          padding: "60px 40px",
          textAlign: "center",
          boxShadow:
            "0 32px 64px -16px rgba(0,0,0,0.28), 0 0 0 1px rgba(5,150,105,0.1)",
          maxWidth: 480,
          width: "90%",
          position: "relative",
          overflow: "hidden",
          animation: "celSlideUp 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 130,
            height: 130,
            background:
              "radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 160,
            height: 160,
            background:
              "radial-gradient(circle,rgba(5,150,105,0.1) 0%,transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Checkmark icon */}
        <div
          style={{
            width: 100,
            height: 100,
            margin: "0 auto 28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 32px rgba(5,150,105,0.4)",
            animation: "celPulse 2.5s ease-in-out infinite",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "clamp(26px,5vw,40px)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 10px",
            fontFamily: "'Playfair Display',Georgia,serif",
            letterSpacing: "-0.02em",
            animation: "celBounce 3s ease-in-out 1s infinite",
          }}
        >
          Welcome, {displayName}!
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "#059669",
            margin: "0 0 18px",
            fontWeight: 600,
            fontStyle: "italic",
          }}
        >
          Your adventure starts now
        </p>

        <p
          style={{
            fontSize: 15,
            color: "#475569",
            lineHeight: 1.7,
            margin: "0 auto 28px",
            maxWidth: 380,
          }}
        >
          You now have full access to plan your dream safari, save
          destinations, and discover the magic of East Africa.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {["🗺️ Explore", "📅 Book", "❤️ Save"].map((item, i) => (
            <span
              key={i}
              style={{
                padding: "10px 18px",
                background: "rgba(5,150,105,0.08)",
                borderRadius: 12,
                border: "1px solid rgba(5,150,105,0.15)",
                fontSize: 14,
                color: "#059669",
                fontWeight: 700,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/destinations"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "15px 32px",
            background: "linear-gradient(135deg,#059669,#10b981)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 10px 24px rgba(5,150,105,0.3)",
            transition: "transform 0.25s,box-shadow 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 16px 32px rgba(5,150,105,0.42)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 10px 24px rgba(5,150,105,0.3)";
          }}
        >
          Start Exploring →
        </a>
      </div>
    </div>
  );
});
CelebrationOverlay.displayName = "CelebrationOverlay";

// ============================================================================
// Layout Components
// ============================================================================

const AppLayout = React.memo(() => (
  <>
    <Navbar />
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <ChecklistFloating />
  </>
));
AppLayout.displayName = "AppLayout";

const OverlayLayer = React.memo(
  ({ isLoading, showCelebration, userName }) => (
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
      {showCelebration && <CelebrationOverlay userName={userName} />}
      {isLoading && <Loader fullScreen />}
    </>
  )
);
OverlayLayer.displayName = "OverlayLayer";

// ============================================================================
// Smart Redirect — handles 404s and legacy URL redirects
// ============================================================================

const SmartRedirect = React.memo(() => {
  const { pathname } = useLocation();

  // getRedirectUrl is defined at module scope above — always available
  const redirectUrl = useMemo(
    () => getRedirectUrl(pathname),
    [pathname]
  );

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

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
// Route Renderers
// ============================================================================

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

const renderProtectedRoute = ({
  path,
  component: Component,
  meta,
}) => (
  <Route
    key={path}
    path={path}
    element={
      <ProtectedRoute>
        <PageWrapper
          title={meta.title}
          description={meta.description}
          noindex={meta.noindex ?? true}
        >
          <Component />
        </PageWrapper>
      </ProtectedRoute>
    }
  />
);

// ============================================================================
// Root App
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

  // Track previous auth state to only show celebration on NEW login
  const [prevAuth, setPrevAuth] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Clear loader on navigation (except home)
  useEffect(() => {
    if (location.pathname !== "/" && isLoading) {
      setIsLoading(false);
    }
  }, [isLoading, location.pathname, setIsLoading]);

  // Prefetch countries for dropdowns/filters
  useEffect(() => {
    countryService.getAll({}).catch(() => { });
    countryService.getAll({ featured: true }).catch(() => { });
  }, []);

  // Dev performance logging
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const entry = performance.getEntriesByType?.("navigation")?.[0];
    if (entry) {
      console.debug(
        `[Router] ${location.pathname} — DOM interactive: ${Math.round(entry.domInteractive)}ms`
      );
    }
  }, [location.pathname]);

  // Show celebration ONLY when auth transitions false → true
  useEffect(() => {
    if (isAuthenticated && !prevAuth && user) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    setPrevAuth(isAuthenticated);
  }, [isAuthenticated, prevAuth, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        isolation: "isolate",
      }}
    >
      <Routes>
        {/* GitHub OAuth callback — bare page, no Navbar/Footer */}
        <Route
          path="/auth/github/callback"
          element={
            <PageWrapper title="Signing in with GitHub…" noindex>
              <GitHubCallbackPage />
            </PageWrapper>
          }
        />

        {/* Main shell */}
        <Route element={<AppLayout />}>
          {publicRoutes.map(renderPublicRoute)}
          {protectedRoutes.map(renderProtectedRoute)}

          {/* Catch-all: redirect legacy URLs or show 404 */}
          <Route path="*" element={<SmartRedirect />} />
        </Route>

        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      </Routes>

      <OverlayLayer
        isLoading={isLoading}
        showCelebration={showCelebration}
        userName={user?.fullName || user?.name}
      />

      <CongratulationWindow
        isVisible={showCongratulation}
        type={congratulationType}
        user={user}
        onClose={() => { }}
      />

      <NotLoggedInMessage isVisible={showNotLoggedInMessage} />
    </div>
  );
}

// ============================================================================
// Providers wrapper
// ============================================================================

const AppWithProviders = () => (
  <MessagingProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </MessagingProvider>
);

export default AppWithProviders;