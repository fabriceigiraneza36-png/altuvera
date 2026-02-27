import React from "react";
import { Routes, Route } from "react-router-dom";
import { useApp } from "./context/AppContext";
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

// Public pages
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import CountryPage from "./pages/CountryPage";
import CountryDestinations from "./pages/CountryDestinations";
import DestinationDetail from "./pages/DestinationDetail";
import Tips from "./pages/Tips";
import Explore from "./pages/Explore";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import InteractiveMap from "./pages/InteractiveMap";
import VirtualTour from "./pages/VirtualTour";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import FAQ from "./pages/FAQ";
import PaymentTerms from "./pages/PaymentTerms";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";

// Protected pages
import UserProfile from "./pages/auth/UserProfile";
import MyBookings from "./pages/auth/MyBookings";
import Wishlist from "./pages/auth/Wishlist";
import UserSettings from "./pages/auth/UserSettings";

function App() {
  const { isLoading } = useApp();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>

          {/* Public */}
          <Route path="/" element={<PageWrapper title="Home"><Home /></PageWrapper>} />
          <Route path="/destinations" element={<PageWrapper title="Destinations"><Destinations /></PageWrapper>} />
          <Route path="/country/:countryId" element={<PageWrapper title="Country"><CountryPage /></PageWrapper>} />
          <Route path="/country/:countryId/destinations" element={<PageWrapper title="Country Destinations"><CountryDestinations /></PageWrapper>} />
          <Route path="/destination/:destinationId" element={<PageWrapper title="Destination Details"><DestinationDetail /></PageWrapper>} />
          <Route path="/tips" element={<PageWrapper title="Travel Tips"><Tips /></PageWrapper>} />
          <Route path="/explore" element={<PageWrapper title="Explore"><Explore /></PageWrapper>} />
          <Route path="/posts" element={<PageWrapper title="Blog Posts"><Posts /></PageWrapper>} />
          <Route path="/post/:slug" element={<PageWrapper title="Post Details"><PostDetail /></PageWrapper>} />
          <Route path="/interactive-map" element={<PageWrapper title="Interactive Map"><InteractiveMap /></PageWrapper>} />
          <Route path="/virtual-tour" element={<PageWrapper title="Virtual Tour"><VirtualTour /></PageWrapper>} />
          <Route path="/services" element={<PageWrapper title="Services"><Services /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper title="About Us"><About /></PageWrapper>} />
          <Route path="/payment-terms" element={<PageWrapper title="Payment Terms"><PaymentTerms /></PageWrapper>} />
          <Route path="/team" element={<PageWrapper title="Our Team"><Team /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper title="Contact Us"><Contact /></PageWrapper>} />
          <Route path="/gallery" element={<PageWrapper title="Gallery"><Gallery /></PageWrapper>} />
          <Route path="/faq" element={<PageWrapper title="FAQ"><FAQ /></PageWrapper>} />

          {/* Protected */}
          <Route path="/booking" element={
            <ProtectedRoute>
              <PageWrapper title="Booking">
                <Booking />
              </PageWrapper>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <PageWrapper title="My Profile">
                <UserProfile />
              </PageWrapper>
            </ProtectedRoute>
          } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <PageWrapper title="My Bookings">
                <MyBookings />
              </PageWrapper>
            </ProtectedRoute>
          } />

          <Route path="/wishlist" element={
            <ProtectedRoute>
              <PageWrapper title="Wishlist">
                <Wishlist />
              </PageWrapper>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <PageWrapper title="Settings">
                <UserSettings />
              </PageWrapper>
            </ProtectedRoute>
          } />

          <Route path="*" element={<PageWrapper title="Page Not Found"><NotFound /></PageWrapper>} />

        </Routes>
      </main>

      <Footer />
      <ScrollToTop />
      <PersistentVideoPlayer />
      <PersistentMapViewer />
      <CookieConsent />
      <AuthModal />
    </div>
  );
}

export default App;