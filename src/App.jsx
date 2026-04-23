// ─────────────────────────────────────────────────────────────
// App.jsx — Supercharged Application Shell
// Enterprise-grade routing, performance, and user experience
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, Suspense } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { getRedirectUrl } from "./utils/routeUtils";
import "leaflet/dist/leaflet.css";

// ─── Layout & Shell Components (loaded eagerly — critical path) ────────
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

// ─── Deferred Shell Components (non-critical, loaded after paint) ──────
const PersistentVideoPlayer = React.lazy(
  () => import("./components/common/PersistentVideoPlayer"),
);
const PersistentMapViewer = React.lazy(
  () => import("./components/common/PersistentMapViewer"),
);

const publicRoutes = [
  { path: "/", component: React.lazy(() => import("./pages/Home")), meta: { title: "East Africa Safaris & Tours", description: "Book authentic East African safaris and cultural tours with Altuvera. Guided adventures in Kenya, Tanzania, Uganda, Rwanda, and Ethiopia." } },
  { path: "/destinations", component: React.lazy(() => import("./pages/Destinations")), meta: { title: "Destinations", description: "Explore handpicked destinations across East Africa, from iconic national parks to beaches and cultural highlights." } },
  { path: "/country/:countryId", component: React.lazy(() => import("./pages/CountryPage")), meta: { title: "Country Guides", description: "Country travel guides, top destinations, and planning tips for East African adventures with Altuvera." } },
  { path: "/country/:countryId/destinations", component: React.lazy(() => import("./pages/CountryDestinations")), meta: { title: "Country Destinations", description: "Browse top destinations, experiences, and must-see highlights by country." } },
  { path: "/destination/:destinationId", component: React.lazy(() => import("./pages/DestinationDetail")), meta: { title: "Destination", description: "Discover destination highlights, best time to visit, and travel tips. Plan your safari with Altuvera." } },
  { path: "/tips", component: React.lazy(() => import("./pages/Tips")), meta: { title: "Travel Tips", description: "Practical safari and travel tips to help you plan a smooth, memorable East African trip." } },
  { path: "/explore", component: React.lazy(() => import("./pages/Explore")), meta: { title: "Explore", description: "Explore experiences, culture, and inspiration for your next East African journey." } },
  { path: "/posts", component: React.lazy(() => import("./pages/Posts")), meta: { title: "Journal", description: "Travel guides, safari tips, and stories from East Africa and beyond." } },
  { path: "/post/:slug", component: React.lazy(() => import("./pages/PostDetail")), meta: { title: "Article", description: "Read Altuvera travel stories and guides to help you plan your safari and cultural experiences." } },
  { path: "/interactive-map", component: React.lazy(() => import("./pages/InteractiveMap")), meta: { title: "Interactive Map", description: "Explore destinations and plan routes with Altuvera's interactive map." } },
  { path: "/virtual-tour", component: React.lazy(() => import("./pages/VirtualTour")), meta: { title: "Virtual Tour", description: "Take a virtual tour and preview experiences before you travel with Altuvera." } },
  { path: "/services", component: React.lazy(() => import("./pages/Services")), meta: { title: "Services", description: "Safari planning, guided tours, and travel support services offered by Altuvera." } },
  { path: "/about", component: React.lazy(() => import("./pages/About")), meta: { title: "About Altuvera", description: "Learn about Altuvera and our mission to deliver authentic East African safari and cultural tours." } },
  { path: "/contact", component: React.lazy(() => import("./pages/Contact")), meta: { title: "Contact Altuvera", description: "Get in touch with Altuvera to plan your safari, ask questions, or request a custom itinerary." } },
  { path: "/gallery", component: React.lazy(() => import("./pages/Gallery")), meta: { title: "Gallery", description: "Browse photos from safaris, landscapes, wildlife, and cultural experiences." } },
  { path: "/faq", component: React.lazy(() => import("./pages/FAQ")), meta: { title: "FAQ", description: "Answers to common questions about booking, travel logistics, safety, and safari experiences." } },
  { path: "/team", component: React.lazy(() => import("./pages/Team")), meta: { title: "Our Team", description: "Meet the Altuvera team behind our safari and cultural experiences." } },
  { path: "/payment-terms", component: React.lazy(() => import("./pages/PaymentTerms")), meta: { title: "Payment Terms", description: "Payment terms and booking information for Altuvera tours." } },
  { path: "/privacy", component: React.lazy(() => import("./pages/PrivacyPolicy")), meta: { title: "Privacy Policy", description: "Read Altuvera's privacy policy." } },
  { path: "/terms", component: React.lazy(() => import("./pages/TermsOfService")), meta: { title: "Terms of Service", description: "Read Altuvera's terms of service." } },
];

const protectedRoutes = [
  { path: "/booking", component: React.lazy(() => import("./pages/Booking")), meta: { title: "Booking", noindex: true } },
  { path: "/profile", component: React.lazy(() => import("./pages/auth/UserProfile")), meta: { title: "My Profile", noindex: true } },
  { path: "/my-bookings", component: React.lazy(() => import("./pages/auth/MyBookings")), meta: { title: "My Bookings", noindex: true } },
  { path: "/wishlist", component: React.lazy(() => import("./pages/auth/Wishlist")), meta: { title: "Wishlist", noindex: true } },
  { path: "/settings", component: React.lazy(() => import("./pages/auth/UserSettings")), meta: { title: "Settings", noindex: true } },
];

const HIGH_PRIORITY_PREFETCH = [
  () => import("./pages/Home"),
  () => import("./pages/Destinations"),
  () => import("./pages/About"),
  () => import("./pages/Contact"),
];

const prefetchRoutes = () => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        HIGH_PRIORITY_PREFETCH.forEach((loader) => {
          loader().catch(() => {});
        });
      },
      { timeout: 4000 },
    );
  }
};

const NotFound = React.lazy(() => import("./pages/NotFound"));

const SmartRedirect = React.memo(() => {
  const { pathname } = useLocation();
  const redirectUrl = useMemo(() => getRedirectUrl(pathname), [pathname]);

  if (redirectUrl) return <Navigate to={redirectUrl} replace />;

  return (
    <PageWrapper title="Page Not Found" noindex>
      <NotFound />
    </PageWrapper>
  );
});

SmartRedirect.displayName = "SmartRedirect";

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
    {isLoading && <Loader />}
  </>
));

OverlayLayer.displayName = "OverlayLayer";

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
        <PageWrapper title={meta.title} description={meta.description} noindex={meta.noindex}>
          <Component />
        </PageWrapper>
      </ProtectedRoute>
    }
  />
);

function App() {
  const location = useLocation();
  const { isLoading, setIsLoading } = useApp();

  useEffect(() => {
    if (location.pathname !== "/" && isLoading) setIsLoading(false);
  }, [isLoading, location.pathname, setIsLoading]);

  useEffect(() => {
    prefetchRoutes();
  }, []);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
    if (process.env.NODE_ENV === "development" && navigationEntry) {
      console.debug(
        `[Router] ${location.pathname} — DOM interactive: ${Math.round(navigationEntry.domInteractive)}ms`,
      );
    }
  }, [location.pathname]);

  return (
    <div style={styles.appShell}>
      <Routes>
        <Route element={<AppLayout />}>
          {publicRoutes.map(renderPublicRoute)}
          {protectedRoutes.map(renderProtectedRoute)}
          <Route path="/:pathMatch(.*)/*" element={<SmartRedirect />} />
          <Route path="*" element={<SmartRedirect />} />
        </Route>
      </Routes>
      <OverlayLayer isLoading={isLoading} />
    </div>
  );
}

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
