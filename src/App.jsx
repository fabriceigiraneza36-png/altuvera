import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { getRedirectUrl } from "./utils/routeUtils";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import PersistentVideoPlayer from "./components/common/PersistentVideoPlayer";
import PersistentMapViewer from "./components/common/PersistentMapViewer";
import Loader from "./components/common/Loader";
import CookieConsent from "./components/common/CookieConsent";
import AuthModal from "./components/auth/AuthModal";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageWrapper from "./components/common/PageWrapper";
import "leaflet/dist/leaflet.css";

// Regular components
import WhatsAppButton from "./components/common/WhatsAppButton";

// Lazy load all pages
const Home = React.lazy(() => import("./pages/Home"));
const Destinations = React.lazy(() => import("./pages/Destinations"));
const CountryPage = React.lazy(() => import("./pages/CountryPage"));
const CountryDestinations = React.lazy(
  () => import("./pages/CountryDestinations"),
);
const DestinationDetail = React.lazy(() => import("./pages/DestinationDetail"));
const Tips = React.lazy(() => import("./pages/Tips"));
const Explore = React.lazy(() => import("./pages/Explore"));
const Posts = React.lazy(() => import("./pages/Posts"));
const PostDetail = React.lazy(() => import("./pages/PostDetail"));
const InteractiveMap = React.lazy(() => import("./pages/InteractiveMap"));
const VirtualTour = React.lazy(() => import("./pages/VirtualTour"));
const Services = React.lazy(() => import("./pages/Services"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const Booking = React.lazy(() => import("./pages/Booking"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const PaymentTerms = React.lazy(() => import("./pages/PaymentTerms"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Team = React.lazy(() => import("./pages/Team"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Protected pages
const UserProfile = React.lazy(() => import("./pages/auth/UserProfile"));
const MyBookings = React.lazy(() => import("./pages/auth/MyBookings"));
const Wishlist = React.lazy(() => import("./pages/auth/Wishlist"));
const UserSettings = React.lazy(() => import("./pages/auth/UserSettings"));

// Smart Redirect Component - handles typos and incorrect URLs
const SmartRedirect = () => {
  const location = useLocation();
  const redirectUrl = getRedirectUrl(location.pathname);
  
  if (redirectUrl) {
    // Use replace to avoid creating history entries for bad URLs
    return <Navigate to={redirectUrl} replace />;
  }
  
  // No redirect found, show 404
  return (
    <PageWrapper title="Page Not Found">
      <NotFound />
    </PageWrapper>
  );
};

function App() {
  const location = useLocation();
  const { isLoading, setIsLoading } = useApp();

  useEffect(() => {
    if (location.pathname !== "/" && isLoading) {
      setIsLoading(false);
    }
  }, [isLoading, location.pathname, setIsLoading]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <React.Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PageWrapper title="Home">
                  <Home />
                </PageWrapper>
              }
            />
            <Route
              path="/destinations"
              element={
                <PageWrapper title="Destinations">
                  <Destinations />
                </PageWrapper>
              }
            />
            <Route
              path="/country/:countryId"
              element={
                <PageWrapper title="Country">
                  <CountryPage />
                </PageWrapper>
              }
            />
            <Route
              path="/country/:countryId/destinations"
              element={
                <PageWrapper title="Country Destinations">
                  <CountryDestinations />
                </PageWrapper>
              }
            />
            <Route
              path="/destination/:destinationId"
              element={
                <PageWrapper title="Destination Details">
                  <DestinationDetail />
                </PageWrapper>
              }
            />
            <Route
              path="/tips"
              element={
                <PageWrapper title="Travel Tips">
                  <Tips />
                </PageWrapper>
              }
            />
            <Route
              path="/explore"
              element={
                <PageWrapper title="Explore">
                  <Explore />
                </PageWrapper>
              }
            />
            <Route
              path="/posts"
              element={
                <PageWrapper title="Blog Posts">
                  <Posts />
                </PageWrapper>
              }
            />
            <Route
              path="/post/:slug"
              element={
                <PageWrapper title="Post Details">
                  <PostDetail />
                </PageWrapper>
              }
            />
            <Route
              path="/interactive-map"
              element={
                <PageWrapper title="Interactive Map">
                  <InteractiveMap />
                </PageWrapper>
              }
            />
            <Route
              path="/virtual-tour"
              element={
                <PageWrapper title="Virtual Tour">
                  <VirtualTour />
                </PageWrapper>
              }
            />
            <Route
              path="/services"
              element={
                <PageWrapper title="Services">
                  <Services />
                </PageWrapper>
              }
            />
            <Route
              path="/about"
              element={
                <PageWrapper title="About Us">
                  <About />
                </PageWrapper>
              }
            />
            <Route
              path="/payment-terms"
              element={
                <PageWrapper title="Payment Terms">
                  <PaymentTerms />
                </PageWrapper>
              }
            />
            <Route
              path="/team"
              element={
                <PageWrapper title="Our Team">
                  <Team />
                </PageWrapper>
              }
            />
            <Route
              path="/contact"
              element={
                <PageWrapper title="Contact Us">
                  <Contact />
                </PageWrapper>
              }
            />
            <Route
              path="/gallery"
              element={
                <PageWrapper title="Gallery">
                  <Gallery />
                </PageWrapper>
              }
            />
            <Route
              path="/faq"
              element={
                <PageWrapper title="FAQ">
                  <FAQ />
                </PageWrapper>
              }
            />
            <Route
              path="/privacy"
              element={
                <PageWrapper title="Privacy Policy">
                  <PrivacyPolicy />
                </PageWrapper>
              }
            />
            <Route
              path="/terms"
              element={
                <PageWrapper title="Terms of Service">
                  <TermsOfService />
                </PageWrapper>
              }
            />

            {/* Protected */}
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <PageWrapper title="Booking">
                    <Booking />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageWrapper title="My Profile">
                    <UserProfile />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <PageWrapper title="My Bookings">
                    <MyBookings />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <PageWrapper title="Wishlist">
                    <Wishlist />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PageWrapper title="Settings">
                    <UserSettings />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Smart Redirect - handles typos and incorrect URLs */}
            <Route
              path="/:pathMatch(.*)*"
              element={<SmartRedirect />}
            />

            <Route
              path="*"
              element={
                <PageWrapper title="Page Not Found">
                  <NotFound />
                </PageWrapper>
              }
            />
          </Routes>
        </React.Suspense>
      </main>

      <Footer />
      <ScrollToTop />
      <PersistentVideoPlayer />
      <PersistentMapViewer />
      <CookieConsent />
      <AuthModal />
      <WhatsAppButton />
      {isLoading && <Loader />}
    </div>
  );
}

export default App;
