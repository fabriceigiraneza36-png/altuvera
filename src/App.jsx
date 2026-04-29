// ============================================================================
// App.jsx — Application Shell
// ============================================================================

import React, { useEffect, useMemo, Suspense, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useApp } from "./context/AppContext";
import { useUserAuth } from "./context/UserAuthContext";
import { ConnectionProvider } from "./context/ConnectionContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ConnectionStatus from "./components/common/ConnectionStatus";
import TailwindTest from "./components/common/TailwindTest";
import { HiSparkles } from "react-icons/hi";
import countryService from "./services/countryService";

// ── Eager imports ─────────────────────────────────────────────────────────────
import Navbar            from "./components/common/Navbar";
import Footer            from "./components/common/Footer";
import ChecklistFloating from "./components/common/ChecklistFloating";
import ScrollToTop       from "./components/common/ScrollToTop";
import Loader            from "./components/common/Loader";
import CookieConsent     from "./components/common/CookieConsent";
import AuthModal         from "./components/auth/AuthModal";
import CongratulationWindow from "./components/auth/CongratulationWindow";
import NotLoggedInMessage from "./components/auth/NotLoggedInMessage";
import ProtectedRoute    from "./components/auth/ProtectedRoute";
import PageWrapper       from "./components/common/PageWrapper";
import WhatsAppButton    from "./components/common/WhatsAppButton";

// ── Lazy imports ──────────────────────────────────────────────────────────────
const PersistentVideoPlayer = React.lazy(() => import("./components/common/PersistentVideoPlayer"));
const PersistentMapViewer   = React.lazy(() => import("./components/common/PersistentMapViewer"));
const NotFound              = React.lazy(() => import("./pages/NotFound"));

// ============================================================================
// Route Definitions
// ============================================================================

const publicRoutes = [
  { path: "/",                             component: React.lazy(() => import("./pages/Home")),                meta: { title: "East Africa Safaris & Tours",  description: "Book authentic East African safaris and cultural tours with Altuvera." } },
  { path: "/destinations",                 component: React.lazy(() => import("./pages/Destinations")),        meta: { title: "Destinations",                 description: "Explore handpicked destinations across East Africa." } },
  { path: "/country/:countryId",           component: React.lazy(() => import("./pages/CountryPage")),         meta: { title: "Country Guides",               description: "Country travel guides and planning tips for East African adventures." } },
  { path: "/country/:countryId/destinations", component: React.lazy(() => import("./pages/CountryDestinations")), meta: { title: "Country Destinations",      description: "Browse top destinations and highlights by country." } },
  { path: "/destination/:destinationId",   component: React.lazy(() => import("./pages/DestinationDetail")),   meta: { title: "Destination",                  description: "Discover destination highlights, best time to visit, and travel tips." } },
  { path: "/tips",                         component: React.lazy(() => import("./pages/Tips")),                 meta: { title: "Travel Tips",                  description: "Practical safari and travel tips for East Africa." } },
  { path: "/explore",                      component: React.lazy(() => import("./pages/Explore")),              meta: { title: "Explore",                      description: "Explore experiences and culture for your East African journey." } },
  { path: "/posts",                        component: React.lazy(() => import("./pages/Posts")),                meta: { title: "Journal",                      description: "Travel guides, safari tips, and stories from East Africa." } },
  { path: "/post/:slug",                   component: React.lazy(() => import("./pages/PostDetail")),           meta: { title: "Article",                      description: "Read Altuvera travel stories and guides." } },
  { path: "/interactive-map",              component: React.lazy(() => import("./pages/InteractiveMap")),       meta: { title: "Interactive Map",              description: "Explore destinations with Altuvera's interactive map." } },
  { path: "/tailwind-test",              component: React.lazy(() => import("./components/common/TailwindTest")), meta: { title: "Tailwind Test", description: "Testing Tailwind CSS functionality" } },
  { path: "/services",                     component: React.lazy(() => import("./pages/Services")),             meta: { title: "Services",                     description: "Safari planning and travel services by Altuvera." } },
  { path: "/about",                        component: React.lazy(() => import("./pages/About")),                meta: { title: "About Altuvera",               description: "Learn about Altuvera and our safari mission." } },
  { path: "/contact",                      component: React.lazy(() => import("./pages/Contact")),              meta: { title: "Contact Altuvera",             description: "Get in touch with Altuvera to plan your safari." } },
  { path: "/gallery",                      component: React.lazy(() => import("./pages/Gallery")),              meta: { title: "Gallery",                      description: "Browse photos from safaris and cultural experiences." } },
  { path: "/faq",                          component: React.lazy(() => import("./pages/FAQ")),                  meta: { title: "FAQ",                          description: "Answers to common questions about booking and safaris." } },
  { path: "/team",                         component: React.lazy(() => import("./pages/Team")),                 meta: { title: "Our Team",                     description: "Meet the Altuvera team." } },
  { path: "/payment-terms",               component: React.lazy(() => import("./pages/PaymentTerms")),         meta: { title: "Payment Terms",                description: "Payment terms and booking information." } },
  { path: "/privacy",                      component: React.lazy(() => import("./pages/PrivacyPolicy")),        meta: { title: "Privacy Policy",               description: "Altuvera privacy policy." } },
  { path: "/terms",                        component: React.lazy(() => import("./pages/TermsOfService")),       meta: { title: "Terms of Service",             description: "Altuvera terms of service." } },
];

const protectedRoutes = [
  { path: "/booking",      component: React.lazy(() => import("./pages/Booking")),               meta: { title: "Booking",     noindex: true } },
  { path: "/profile",      component: React.lazy(() => import("./pages/auth/UserProfile")),      meta: { title: "My Profile",  noindex: true } },
  { path: "/my-bookings",  component: React.lazy(() => import("./pages/auth/MyBookings")),       meta: { title: "My Bookings", noindex: true } },
  { path: "/wishlist",     component: React.lazy(() => import("./pages/auth/Wishlist")),         meta: { title: "Wishlist",    noindex: true } },
  { path: "/settings",     component: React.lazy(() => import("./pages/auth/UserSettings")),     meta: { title: "Settings",    noindex: true } },
];

// ============================================================================
// Prefetch
// ============================================================================

const prefetchRoutes = () => {
  // Prefetch disabled to avoid runtime errors with lazy components
};

// ============================================================================
// GitHub OAuth Callback Page
// UserAuthContext.consumeGithubCallback() fires automatically via useEffect
// and processes code+state, exchanges for token, cleans URL.
// This component only renders the loading/status UI.
// ============================================================================

const GitHubCallbackPage = React.memo(() => {
  const { githubLoading, isAuthenticated, socialAuthError } = useUserAuth();

  useEffect(() => {
    if (githubLoading) return; // Still processing
    const delay = socialAuthError ? 400 : 1500;
    const timer = setTimeout(() => {
      // Use replace so back button doesn't return to callback URL
      window.location.replace(isAuthenticated ? "/" : "/");
    }, delay);
    return () => clearTimeout(timer);
  }, [githubLoading, isAuthenticated, socialAuthError]);

  const isError  = Boolean(socialAuthError);
  const isDone   = !githubLoading && isAuthenticated;
  const statusMsg =
    isError   ? "Sign-in failed. Redirecting…"         :
    isDone    ? "Signed in successfully! Redirecting…"  :
    githubLoading ? "Verifying your GitHub account…"   :
                "Completing sign-in…";

  return (
    <div style={callbackStyles.page}>
      <div style={callbackStyles.card}>
        <div
          style={{
            ...callbackStyles.spinner,
            ...(isError ? callbackStyles.spinnerError : {}),
            ...(isDone  ? callbackStyles.spinnerDone  : {}),
          }}
        />
        <style>{`@keyframes ghSpin { to { transform: rotate(360deg); } }`}</style>

        {/* GitHub mark */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#24292f" style={{ marginBottom: 14 }} aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>

        <h2 style={callbackStyles.title}>GitHub Sign-In</h2>
        <p style={{ ...callbackStyles.status, color: isError ? "#ef4444" : isDone ? "#059669" : "#6b7280" }}>
          {statusMsg}
        </p>
        {isError && (
          <p style={callbackStyles.errorDetail}>{socialAuthError}</p>
        )}
      </div>
    </div>
  );
});

GitHubCallbackPage.displayName = "GitHubCallbackPage";

const callbackStyles = {
  page: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    display: "flex", flexDirection: "column", alignItems: "center",
    background: "#fff", borderRadius: 20,
    padding: "48px 40px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    maxWidth: 380, width: "90%", textAlign: "center",
  },
  spinner: {
    width: 40, height: 40,
    border: "3px solid #e5e7eb", borderTopColor: "#059669",
    borderRadius: "50%",
    animation: "ghSpin 0.8s linear infinite",
    marginBottom: 24,
  },
  spinnerError: { borderTopColor: "#ef4444" },
  spinnerDone:  { borderTopColor: "#059669", animationDuration: "2s" },
  title:       { margin: "0 0 8px", fontSize: 20, fontWeight: 600, color: "#111827" },
  status:      { margin: 0, fontSize: 14, lineHeight: 1.5, fontWeight: 500 },
  errorDetail: { marginTop: 10, fontSize: 13, color: "#9ca3af", lineHeight: 1.5, maxWidth: 280 },
};

// ============================================================================
// Layout Components
// ============================================================================

// ============================================================================
// Layout Components
// ============================================================================

const CelebrationOverlay = ({ userName }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const displayName = userName ? userName.split(' ').map(n => n[0]?.toUpperCase() + n.slice(1)).join(' ') : 'Traveler';

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(5, 150, 105, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        animation: "celebrationFadeIn 0.6s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes celebrationFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes celebrationSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes celebrationCheckmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .celebration-card {
          animation: celebrationSlideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center;
        }
        .celebration-icon {
          animation: celebrationPulse 2s ease-in-out infinite;
        }
        .celebration-name {
          animation: celebrationBounce 3s ease-in-out infinite;
        }
      `}</style>

      <div className="celebration-card" style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
        borderRadius: "32px",
        padding: "60px 40px",
        textAlign: "center",
        boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(5, 150, 105, 0.1)",
        maxWidth: "480px",
        width: "90%",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: "radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        {/* Main content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Checkmark circle */}
          <div className="celebration-icon" style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 32px rgba(5, 150, 105, 0.4)",
          }}>
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: "celebrationCheckmark 0.8s ease-out 0.5s forwards" }} />
            </svg>
          </div>

          {/* Welcome text */}
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 12px",
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.02em",
          }}>
            Congratulations, {displayName}!
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#059669",
            margin: "0 0 24px",
            fontWeight: 600,
            fontStyle: "italic",
          }}>
            Your account is ready to explore
          </p>

          <p style={{
            fontSize: "15px",
            color: "#475569",
            lineHeight: 1.7,
            margin: "0 0 32px",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            You now have full access to plan your dream safari, track bookings, and discover the magic of East Africa.
          </p>

          {/* Feature highlights */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}>
            {[
              { icon: "🗺️", label: "Explore" },
              { icon: "📅", label: "Book" },
              { icon: "❤️", label: "Save" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "12px",
                background: "rgba(5, 150, 105, 0.08)",
                borderRadius: "12px",
                border: "1px solid rgba(5, 150, 105, 0.15)",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "4px" }}>{item.icon}</div>
                <div style={{
                  fontSize: "12px",
                  color: "#059669",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="/destinations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 32px",
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "white",
              textDecoration: "none",
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "16px",
              boxShadow: "0 12px 24px rgba(5, 150, 105, 0.3)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              animation: "celebrationSlideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards",
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 16px 32px rgba(5, 150, 105, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(5, 150, 105, 0.3)";
            }}
          >
            Start Exploring
            <span style={{ fontSize: "18px" }}>→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const AppLayout = React.memo(() => (
  <>
    <ConnectionStatus />
    <Navbar />
    <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <ChecklistFloating />
  </>
));
AppLayout.displayName = "AppLayout";

const OverlayLayer = React.memo(({ isLoading, showCelebration, userName }) => (
  <>
    <ScrollToTop />
    <Suspense fallback={null}>
      <PersistentVideoPlayer />
      <PersistentMapViewer />
    </Suspense>
    <CookieConsent />
    <AuthModal />
    <WhatsAppButton />
    {showCelebration && <CelebrationOverlay userName={userName} />}
    {isLoading && <Loader fullScreen />}
  </>
));
OverlayLayer.displayName = "OverlayLayer";

// ============================================================================
// Smart Redirect (404 + legacy URLs)
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
// Route Renderers
// ============================================================================

const renderPublicRoute = ({ path, component: Component, meta }) => (
  <Route
    key={path}
    path={path}
    element={
      <PageWrapper title={meta.title} description={meta.description} noindex={meta.noindex}>
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
        <PageWrapper title={meta.title} description={meta.description} noindex={meta.noindex ?? true}>
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
  const location             = useLocation();
  const { isLoading, setIsLoading } = useApp();
  const { isAuthenticated, user, showCongratulation, congratulationType, showNotLoggedInMessage } = useUserAuth();
  const [showCelebration, setShowCelebration] = useState(false);

   useEffect(() => {
     if (location.pathname !== "/" && isLoading) setIsLoading(false);
   }, [isLoading, location.pathname, setIsLoading]);

   useEffect(() => { prefetchRoutes(); }, []);

   // Prefetch countries on app start for faster dropdowns
   useEffect(() => {
     // Fetch all countries (for footer, destinations filter, etc.)
     countryService.getAll({}).catch(() => {});
     // Fetch featured countries (for navbar dropdown)
     countryService.getAll({ featured: true }).catch(() => {});
   }, []);

   useEffect(() => {
     if (!import.meta.env.DEV) return;
     const entry = performance.getEntriesByType?.("navigation")?.[0];
     if (entry) {
       console.debug(`[Router] ${location.pathname} — DOM interactive: ${Math.round(entry.domInteractive)}ms`);
     }
   }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", isolation: "isolate" }}>
      <Routes>
        {/* GitHub OAuth Callback — outside AppLayout (no Navbar/Footer) */}
        <Route
          path="/auth/github/callback"
          element={
            <PageWrapper title="Signing in with GitHub…" noindex>
              <GitHubCallbackPage />
            </PageWrapper>
          }
        />

        {/* Main Layout */}
        <Route element={<AppLayout />}>
          {publicRoutes.map(renderPublicRoute)}
          {protectedRoutes.map(renderProtectedRoute)}
          <Route path="*" element={<SmartRedirect />} />
        </Route>
      </Routes>

      <OverlayLayer isLoading={isLoading} showCelebration={showCelebration} userName={user?.fullName || user?.name} />
      <CongratulationWindow
        isVisible={showCongratulation}
        type={congratulationType}
        user={user}
        onClose={() => {}} // Handled automatically by timeout in context
      />
      <NotLoggedInMessage isVisible={showNotLoggedInMessage} />
    </div>
  );
}

// Wrap App with providers
const AppWithProviders = () => (
  <ConnectionProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </ConnectionProvider>
);

export default AppWithProviders;