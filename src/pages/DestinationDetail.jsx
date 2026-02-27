import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiStar,
  FiClock,
  FiCheck,
  FiCalendar,
  FiUsers,
  FiCamera,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiArrowLeft,
  FiX,
  FiMaximize2,
  FiDownload,
  FiMessageCircle,
  FiPhone,
  FiMail,
  FiSun,
  FiDroplet,
  FiWind,
  FiThermometer,
  FiPlay,
  FiGrid,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiAlertCircle,
  FiShield,
  FiGlobe,
  FiNavigation,
  FiCoffee,
  FiBookmark,
  FiPrinter,
  FiMap,
  FiCompass,
  FiSunrise,
  FiSunset,
  FiCloudRain,
  FiUmbrella,
  FiPackage,
  FiHelpCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiEdit3,
  FiCreditCard,
  FiWifi,
  FiZap,
  FiBattery,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiEye,
  FiLayers,
  FiTarget,
  FiFlag,
  FiHome,
  FiTruck,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import AnimatedSection from "../components/common/AnimatedSection";
import Button from "../components/common/Button";
import { countries } from "../data/countries";
import {
  getDestinationById,
  getDestinationsByCountry,
} from "../data/destinations";

// CSS Keyframes
const keyframesStyle = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slideInFromBottom {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1); }
    75% { transform: scale(1.2); }
  }
  @keyframes rotateIn {
    from { opacity: 0; transform: rotate(-180deg) scale(0); }
    to { opacity: 1; transform: rotate(0) scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(5, 150, 105, 0.3); }
    50% { box-shadow: 0 0 40px rgba(5, 150, 105, 0.6); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to { width: var(--progress); }
  }
`;

const DestinationDetail = () => {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const destination = getDestinationById(destinationId);
  
  // States
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedTip, setSelectedTip] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState({});
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  const contentRef = useRef(null);
  const galleryRef = useRef(null);

  // Responsive breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Mock data for additional features
  const weatherData = {
    current: { temp: "24°C", condition: "Sunny", humidity: "65%", wind: "12 km/h" },
    forecast: [
      { day: "Mon", temp: "25°C", icon: "☀️" },
      { day: "Tue", temp: "23°C", icon: "⛅" },
      { day: "Wed", temp: "22°C", icon: "🌧️" },
      { day: "Thu", temp: "24°C", icon: "☀️" },
      { day: "Fri", temp: "26°C", icon: "☀️" },
    ],
  };

  const packingList = [
    { category: "Essentials", items: ["Passport & ID", "Travel Insurance", "Cash & Cards", "Phone & Charger"] },
    { category: "Clothing", items: ["Comfortable shoes", "Light layers", "Rain jacket", "Sun hat"] },
    { category: "Health", items: ["First aid kit", "Sunscreen SPF50+", "Insect repellent", "Medications"] },
    { category: "Gear", items: ["Camera", "Power bank", "Reusable water bottle", "Day backpack"] },
  ];

  const travelTips = [
    { icon: "💡", title: "Best Time to Visit", tip: "Early morning (6-8 AM) offers the best lighting and fewer crowds." },
    { icon: "📸", title: "Photo Spots", tip: "The eastern viewpoint offers stunning sunrise shots. Bring a tripod!" },
    { icon: "👟", title: "What to Wear", tip: "Comfortable walking shoes are essential. The terrain can be uneven." },
    { icon: "🍽️", title: "Local Food", tip: "Try the local street food markets for authentic cuisine at great value." },
    { icon: "💬", title: "Language", tip: "Learn basic greetings in the local language - locals appreciate the effort!" },
    { icon: "🚗", title: "Getting Around", tip: "Book transportation in advance during peak season for better rates." },
  ];

  const safetyInfo = [
    { level: "Overall Safety", rating: 4.5, description: "Generally very safe for tourists" },
    { level: "Health Services", rating: 4.0, description: "Good medical facilities nearby" },
    { level: "Infrastructure", rating: 4.2, description: "Well-maintained paths and facilities" },
    { level: "Communication", rating: 4.8, description: "Good mobile coverage available" },
  ];

  const accessibilityInfo = [
    { feature: "Wheelchair Access", available: true, note: "Main areas accessible" },
    { feature: "Audio Guides", available: true, note: "Available in 8 languages" },
    { feature: "Rest Areas", available: true, note: "Every 500 meters" },
    { feature: "Assistance Dogs", available: true, note: "Welcome in all areas" },
    { feature: "Braille Signage", available: false, note: "Limited availability" },
  ];

  const localCulture = [
    { title: "Greetings", description: "A slight bow or nod is customary when greeting locals." },
    { title: "Dress Code", description: "Modest clothing is appreciated, especially at cultural sites." },
    { title: "Photography", description: "Always ask permission before photographing people." },
    { title: "Tipping", description: "Tipping is not mandatory but appreciated for good service." },
  ];

  const faqData = [
    { question: "What is the best time of year to visit?", answer: "The ideal time is during spring (March-May) and autumn (September-November) when weather is mild and crowds are smaller." },
    { question: "How long should I plan for this destination?", answer: `We recommend ${destination?.duration || "2-3 days"} to fully experience all the highlights without rushing.` },
    { question: "Is this suitable for families with children?", answer: "Yes! This destination offers activities suitable for all ages. Children under 12 have special guided tours available." },
    { question: "What languages are spoken here?", answer: "The primary language is local, but English is widely understood in tourist areas. Guides are available in multiple languages." },
    { question: "Are there food options for dietary restrictions?", answer: "Yes, vegetarian, vegan, and gluten-free options are available at most restaurants in the area." },
    { question: "What payment methods are accepted?", answer: "Major credit cards are widely accepted. ATMs are available, but carrying some cash is recommended." },
  ];

  const reviewsData = [
    { id: 1, name: "Sarah M.", avatar: "👩", rating: 5, date: "2 weeks ago", title: "Absolutely breathtaking!", comment: "One of the most beautiful places I've ever visited. The local guides were knowledgeable and friendly.", helpful: 24, images: 3, verified: true },
    { id: 2, name: "John D.", avatar: "👨", rating: 4, date: "1 month ago", title: "Great experience overall", comment: "Beautiful scenery and well-organized. Would recommend going early morning to avoid crowds.", helpful: 18, images: 2, verified: true },
    { id: 3, name: "Emily R.", avatar: "👩‍🦰", rating: 5, date: "1 month ago", title: "Must visit!", comment: "Exceeded all expectations. The sunset views are absolutely magical. Don't miss the local food!", helpful: 31, images: 5, verified: true },
    { id: 4, name: "Michael T.", avatar: "🧔", rating: 4, date: "2 months ago", title: "Beautiful but crowded", comment: "Stunning location. Visit during weekdays if possible. The facilities are clean and well-maintained.", helpful: 12, images: 1, verified: false },
  ];

  const itinerary = [
    { time: "06:00", activity: "Sunrise viewing", description: "Best time for photography", icon: <FiSunrise /> },
    { time: "08:00", activity: "Breakfast", description: "Local cuisine experience", icon: <FiCoffee /> },
    { time: "09:30", activity: "Guided tour", description: "Main attractions walk", icon: <FiMap /> },
    { time: "12:30", activity: "Lunch break", description: "Rest and refuel", icon: <FiCoffee /> },
    { time: "14:00", activity: "Free exploration", description: "Discover hidden gems", icon: <FiCompass /> },
    { time: "17:00", activity: "Sunset spot", description: "Golden hour views", icon: <FiSunset /> },
  ];

  const nearbyAttractions = [
    { name: "Mountain Viewpoint", distance: "2.5 km", time: "15 min drive", type: "Nature" },
    { name: "Historic Temple", distance: "4.0 km", time: "25 min drive", type: "Culture" },
    { name: "Local Market", distance: "1.2 km", time: "5 min walk", type: "Shopping" },
    { name: "Waterfall Trail", distance: "6.0 km", time: "30 min drive", type: "Adventure" },
  ];

  const transportOptions = [
    { mode: "By Air", details: "Nearest airport: International Airport (45 km)", icon: "✈️", time: "1 hour" },
    { mode: "By Train", details: "Direct trains from major cities daily", icon: "🚂", time: "3-4 hours" },
    { mode: "By Bus", details: "Regular bus services available", icon: "🚌", time: "4-5 hours" },
    { mode: "By Car", details: "Well-connected highways, parking available", icon: "🚗", time: "Varies" },
  ];

  const essentialPhrases = [
    { phrase: "Hello", local: "Merhaba", pronunciation: "mer-HA-ba" },
    { phrase: "Thank you", local: "Teşekkürler", pronunciation: "teh-shek-KOOR-ler" },
    { phrase: "Please", local: "Lütfen", pronunciation: "LOOT-fen" },
    { phrase: "Excuse me", local: "Pardon", pronunciation: "par-DON" },
    { phrase: "How much?", local: "Ne kadar?", pronunciation: "neh ka-DAR" },
  ];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || isLightboxOpen || !destination) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isLightboxOpen, destination]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === "Escape") setIsLightboxOpen(false);
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  const nextImage = useCallback(() => {
    if (!destination) return;
    setIsImageLoaded(false);
    setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
  }, [destination]);

  const prevImage = useCallback(() => {
    if (!destination) return;
    setIsImageLoaded(false);
    setCurrentImageIndex(
      (prev) => (prev - 1 + destination.images.length) % destination.images.length
    );
  }, [destination]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: destination.name,
          text: destination.description,
          url: window.location.href,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadGuide = () => {
    alert("Downloading travel guide PDF...");
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleHelpful = (reviewId) => {
    setHelpfulReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  if (!destination) {
    return (
      <>
        <style>{keyframesStyle}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "40px 20px",
            background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #D1FAE5 100%)",
            textAlign: "center",
          }}
        >
          <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: "40px" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 20px 60px rgba(5, 150, 105, 0.3)",
              }}
            >
              <FiMapPin size={48} color="white" />
            </div>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "32px" : "48px",
              marginBottom: "20px",
              color: "#1a1a1a",
              animation: "fadeInUp 0.8s ease forwards",
            }}
          >
            Destination Not Found
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#6B7280",
              marginBottom: "40px",
              maxWidth: "500px",
              animation: "fadeInUp 0.8s ease 0.2s forwards",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            The destination you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ animation: "fadeInUp 0.8s ease 0.4s forwards", opacity: 0, animationFillMode: "forwards" }}>
            <Button to="/destinations" variant="primary">
              Explore All Destinations
            </Button>
          </div>
        </div>
      </>
    );
  }

  const country = countries.find((c) => c.id === destination.countryId);
  const relatedDestinations = getDestinationsByCountry(destination.countryId)
    .filter((d) => d.id !== destination.id)
    .slice(0, 3);

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiGrid size={16} /> },
    { id: "highlights", label: "Highlights", icon: <FiStar size={16} /> },
    { id: "planning", label: "Planning", icon: <FiCalendar size={16} /> },
    { id: "tips", label: "Tips & Info", icon: <FiInfo size={16} /> },
    { id: "reviews", label: "Reviews", icon: <FiMessageCircle size={16} /> },
  ];

  const styles = {
    // Hero Section
    heroSection: {
      position: "relative",
      height: isMobile ? "75vh" : "90vh",
      minHeight: isMobile ? "550px" : "650px",
      overflow: "hidden",
    },
    heroBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.8s ease, opacity 0.5s ease",
      transform: isImageLoaded ? "scale(1)" : "scale(1.1)",
      opacity: isImageLoaded ? 1 : 0,
    },
    heroOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)",
    },
    heroContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: isMobile ? "30px 20px 120px" : "60px 60px 140px",
      color: "white",
      zIndex: 10,
    },
    breadcrumbs: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "20px",
      fontSize: "14px",
      opacity: 0.9,
      flexWrap: "wrap",
      animation: "fadeInUp 0.8s ease forwards",
    },
    breadcrumbLink: {
      color: "white",
      textDecoration: "none",
      transition: "opacity 0.3s ease",
    },
    heroTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? "36px" : isTablet ? "52px" : "68px",
      fontWeight: "700",
      marginBottom: "16px",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      animation: "fadeInUp 0.8s ease 0.2s forwards",
      opacity: 0,
      animationFillMode: "forwards",
      lineHeight: "1.1",
    },
    heroSubtitle: {
      fontSize: isMobile ? "16px" : "20px",
      maxWidth: "700px",
      lineHeight: "1.7",
      opacity: 0.95,
      animation: "fadeInUp 0.8s ease 0.4s forwards",
      animationFillMode: "forwards",
    },
    heroStats: {
      display: "flex",
      flexWrap: "wrap",
      gap: isMobile ? "16px" : "30px",
      marginTop: "24px",
      animation: "fadeInUp 0.8s ease 0.6s forwards",
      opacity: 0,
      animationFillMode: "forwards",
    },
    heroStat: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 18px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "30px",
      fontSize: "14px",
      fontWeight: "500",
    },
    // Back Button
    backButton: {
      position: "fixed",
      top: isScrolled ? "20px" : "100px",
      left: isMobile ? "15px" : "40px",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: isScrolled ? "#059669" : "white",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "600",
      padding: isMobile ? "10px 16px" : "12px 20px",
      backgroundColor: isScrolled ? "white" : "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(10px)",
      borderRadius: "50px",
      border: isScrolled ? "1px solid #E5E7EB" : "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
    },
    // Top Actions
    topActions: {
      position: "absolute",
      top: "20px",
      right: isMobile ? "15px" : "40px",
      display: "flex",
      gap: "12px",
      zIndex: 20,
      animation: "fadeInDown 0.8s ease forwards",
    },
    actionButton: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    // Image Counter & Controls
    imageControls: {
      position: "absolute",
      bottom: isMobile ? "20px" : "40px",
      right: isMobile ? "20px" : "60px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 20,
      animation: "fadeInUp 0.8s ease 0.6s forwards",
      opacity: 0,
      animationFillMode: "forwards",
    },
    imageCounter: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(10px)",
      padding: "10px 20px",
      borderRadius: "30px",
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    navButton: {
      width: isMobile ? "44px" : "52px",
      height: isMobile ? "44px" : "52px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    // Thumbnail Strip
    thumbnailStrip: {
      position: "absolute",
      bottom: isMobile ? "80px" : "100px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "10px",
      zIndex: 20,
      animation: "fadeInUp 0.8s ease 0.5s forwards",
      opacity: 0,
      animationFillMode: "forwards",
    },
    thumbnailDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid transparent",
    },
    thumbnailDotActive: {
      backgroundColor: "white",
      transform: "scale(1.2)",
      border: "2px solid #059669",
    },
    // Scroll Indicator
    scrollIndicator: {
      position: "absolute",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      display: isMobile ? "none" : "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      color: "white",
      cursor: "pointer",
      zIndex: 20,
      animation: "fadeInUp 0.8s ease 0.8s forwards, bounce 2s ease-in-out infinite 1s",
      opacity: 0,
      animationFillMode: "forwards",
    },
    // Quick Actions Bar (below hero)
    quickActionsBar: {
      backgroundColor: "white",
      borderBottom: "1px solid #E5E7EB",
      padding: isMobile ? "16px 20px" : "20px 40px",
      position: "sticky",
      top: "0",
      zIndex: 100,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    },
    quickActionsContainer: {
      maxWidth: "1400px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
    },
    quickActionsLeft: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "12px" : "20px",
      flexWrap: "wrap",
    },
    quickActionsRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    quickActionBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 18px",
      borderRadius: "10px",
      border: "2px solid #E5E7EB",
      backgroundColor: "white",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      transition: "all 0.3s ease",
    },
    // Main Content Section
    contentSection: {
      backgroundColor: "#FAFFFE",
      padding: isMobile ? "40px 20px 100px" : "60px 40px 120px",
      position: "relative",
    },
    contentContainer: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    // Tabs
    tabsWrapper: {
      marginBottom: "40px",
      overflowX: "auto",
      borderBottom: "2px solid #E5E7EB",
    },
    tabsContainer: {
      display: "flex",
      gap: "8px",
      minWidth: "max-content",
    },
    tab: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: isMobile ? "14px 18px" : "16px 24px",
      fontSize: isMobile ? "13px" : "14px",
      fontWeight: "600",
      color: "#6B7280",
      cursor: "pointer",
      borderBottom: "3px solid transparent",
      transition: "all 0.3s ease",
      whiteSpace: "nowrap",
      background: "none",
      border: "none",
      borderRadius: "12px 12px 0 0",
      marginBottom: "-2px",
    },
    tabActive: {
      color: "#059669",
      borderBottomColor: "#059669",
      backgroundColor: "#F0FDF4",
    },
    // Content Grid
    contentGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 380px",
      gap: isMobile ? "40px" : "50px",
    },
    // Main Content
    mainContent: {
      animation: "fadeInLeft 0.8s ease forwards",
    },
    // Section Styles
    sectionCard: {
      backgroundColor: "white",
      borderRadius: "20px",
      padding: isMobile ? "24px" : "32px",
      marginBottom: "30px",
      boxShadow: "0 4px 25px rgba(0, 0, 0, 0.04)",
      border: "1px solid #E5E7EB",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      marginBottom: "24px",
    },
    sectionIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? "22px" : "26px",
      fontWeight: "700",
      color: "#1a1a1a",
    },
    sectionSubtitle: {
      fontSize: "14px",
      color: "#6B7280",
      marginTop: "4px",
    },
    // Badge
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
      color: "#059669",
      fontSize: "13px",
      fontWeight: "700",
      borderRadius: "30px",
      marginBottom: "20px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    // Description
    description: {
      fontSize: isMobile ? "15px" : "16px",
      color: "#4B5563",
      lineHeight: "1.9",
      marginBottom: "24px",
    },
    // Highlights Grid
    highlightsList: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "16px",
    },
    highlightItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "18px",
      backgroundColor: "#F9FAFB",
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
      transition: "all 0.3s ease",
    },
    highlightIcon: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      flexShrink: 0,
    },
    // Weather Card
    weatherGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    weatherItem: {
      textAlign: "center",
      padding: "16px",
      backgroundColor: "#F0FDF4",
      borderRadius: "12px",
    },
    weatherForecast: {
      display: "flex",
      gap: "12px",
      overflowX: "auto",
      paddingBottom: "8px",
    },
    forecastDay: {
      flex: "0 0 auto",
      textAlign: "center",
      padding: "14px 20px",
      backgroundColor: "#F9FAFB",
      borderRadius: "12px",
      minWidth: "80px",
    },
    // Packing List
    packingGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "20px",
    },
    packingCategory: {
      padding: "20px",
      backgroundColor: "#F9FAFB",
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
    },
    packingTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    packingItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 0",
      fontSize: "14px",
      color: "#4B5563",
      borderBottom: "1px solid #E5E7EB",
    },
    // Tips Carousel
    tipsCarousel: {
      position: "relative",
    },
    tipCard: {
      padding: "28px",
      backgroundColor: "#F0FDF4",
      borderRadius: "16px",
      border: "2px solid #D1FAE5",
      textAlign: "center",
    },
    tipIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    tipTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "12px",
    },
    tipText: {
      fontSize: "15px",
      color: "#4B5563",
      lineHeight: "1.7",
    },
    tipDots: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      marginTop: "20px",
    },
    tipDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: "#D1FAE5",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    tipDotActive: {
      backgroundColor: "#059669",
      transform: "scale(1.2)",
    },
    // Safety Rating
    safetyItem: {
      marginBottom: "20px",
    },
    safetyHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    },
    safetyLabel: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
    },
    safetyValue: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#059669",
    },
    safetyBar: {
      height: "8px",
      backgroundColor: "#E5E7EB",
      borderRadius: "4px",
      overflow: "hidden",
    },
    safetyProgress: {
      height: "100%",
      background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
      borderRadius: "4px",
      transition: "width 1s ease",
    },
    safetyDescription: {
      fontSize: "13px",
      color: "#6B7280",
      marginTop: "6px",
    },
    // Accessibility List
    accessibilityItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: "1px solid #E5E7EB",
    },
    accessibilityLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    accessibilityIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    // FAQ
    faqItem: {
      marginBottom: "12px",
      borderRadius: "14px",
      overflow: "hidden",
      border: "1px solid #E5E7EB",
      backgroundColor: "white",
    },
    faqQuestion: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 20px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      color: "#1a1a1a",
      transition: "background-color 0.3s ease",
    },
    faqAnswer: {
      padding: "0 20px 18px",
      fontSize: "14px",
      color: "#4B5563",
      lineHeight: "1.8",
    },
    // Reviews
    reviewCard: {
      padding: "24px",
      backgroundColor: "#F9FAFB",
      borderRadius: "16px",
      marginBottom: "16px",
      border: "1px solid #E5E7EB",
    },
    reviewHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "14px",
      flexWrap: "wrap",
      gap: "12px",
    },
    reviewAuthor: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    reviewAvatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#D1FAE5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    },
    reviewName: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#1a1a1a",
    },
    reviewDate: {
      fontSize: "13px",
      color: "#6B7280",
    },
    reviewStars: {
      display: "flex",
      gap: "2px",
    },
    reviewTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "10px",
    },
    reviewComment: {
      fontSize: "14px",
      color: "#4B5563",
      lineHeight: "1.7",
      marginBottom: "14px",
    },
    reviewActions: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    reviewAction: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6B7280",
      cursor: "pointer",
      transition: "color 0.3s ease",
      background: "none",
      border: "none",
      padding: "0",
    },
    // Itinerary
    itineraryList: {
      position: "relative",
      paddingLeft: "30px",
    },
    itineraryLine: {
      position: "absolute",
      left: "11px",
      top: "20px",
      bottom: "20px",
      width: "2px",
      backgroundColor: "#D1FAE5",
    },
    itineraryItem: {
      display: "flex",
      gap: "20px",
      marginBottom: "24px",
      position: "relative",
    },
    itineraryDot: {
      position: "absolute",
      left: "-30px",
      top: "4px",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: "#059669",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "12px",
      zIndex: 1,
    },
    itineraryTime: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#059669",
      minWidth: "60px",
    },
    itineraryContent: {
      flex: 1,
    },
    itineraryActivity: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#1a1a1a",
      marginBottom: "4px",
    },
    itineraryDesc: {
      fontSize: "14px",
      color: "#6B7280",
    },
    // Transport Options
    transportGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: "16px",
    },
    transportCard: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "20px",
      backgroundColor: "#F9FAFB",
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
    },
    transportIcon: {
      fontSize: "32px",
    },
    transportInfo: {
      flex: 1,
    },
    transportMode: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "4px",
    },
    transportDetails: {
      fontSize: "13px",
      color: "#6B7280",
    },
    transportTime: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#059669",
      backgroundColor: "#D1FAE5",
      padding: "6px 12px",
      borderRadius: "20px",
    },
    // Nearby Attractions
    nearbyList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    nearbyItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px",
      backgroundColor: "#F9FAFB",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      transition: "all 0.3s ease",
    },
    nearbyLeft: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    nearbyIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      backgroundColor: "#D1FAE5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#059669",
    },
    nearbyName: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1a1a1a",
    },
    nearbyMeta: {
      fontSize: "13px",
      color: "#6B7280",
    },
    nearbyType: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#059669",
      backgroundColor: "#D1FAE5",
      padding: "4px 10px",
      borderRadius: "20px",
    },
    // Phrases
    phrasesList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    phraseItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      backgroundColor: "#F9FAFB",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
    },
    phraseEnglish: {
      fontSize: "14px",
      color: "#6B7280",
    },
    phraseLocal: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#1a1a1a",
    },
    phrasePronunciation: {
      fontSize: "12px",
      color: "#059669",
      fontStyle: "italic",
    },
    // Sidebar
    sidebar: {
      animation: "fadeInRight 0.8s ease forwards",
    },
    sidebarCard: {
      backgroundColor: "white",
      borderRadius: "20px",
      padding: isMobile ? "24px" : "28px",
      boxShadow: "0 10px 50px rgba(0, 0, 0, 0.06)",
      border: "1px solid #E5E7EB",
      marginBottom: "24px",
      position: isDesktop ? "sticky" : "relative",
      top: isDesktop ? "100px" : "0",
    },
    // Quick Info Card
    quickInfoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    quickInfoItem: {
      padding: "16px",
      backgroundColor: "#F9FAFB",
      borderRadius: "14px",
      textAlign: "center",
    },
    quickInfoIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 10px",
      color: "#059669",
    },
    quickInfoValue: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "2px",
    },
    quickInfoLabel: {
      fontSize: "12px",
      color: "#6B7280",
    },
    // Rating Display
    ratingDisplay: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "20px",
      backgroundColor: "#FEF3C7",
      borderRadius: "16px",
      marginBottom: "24px",
    },
    ratingBig: {
      fontSize: "42px",
      fontWeight: "700",
      color: "#92400E",
      fontFamily: "'Playfair Display', serif",
    },
    ratingDetails: {
      flex: 1,
    },
    ratingStars: {
      display: "flex",
      gap: "3px",
      marginBottom: "4px",
    },
    ratingCount: {
      fontSize: "13px",
      color: "#92400E",
    },
    // Contact Card
    contactCard: {
      padding: "24px",
      backgroundColor: "#F0FDF4",
      borderRadius: "16px",
      border: "2px solid #D1FAE5",
    },
    contactTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    contactItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 0",
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
      transition: "color 0.3s ease",
      borderBottom: "1px solid #D1FAE5",
    },
    // CTA Buttons
    ctaButtons: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      marginBottom: "24px",
    },
    ctaButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "16px 24px",
      borderRadius: "14px",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
      textDecoration: "none",
      textAlign: "center",
    },
    ctaPrimary: {
      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
      color: "white",
      boxShadow: "0 8px 25px rgba(5, 150, 105, 0.3)",
    },
    ctaSecondary: {
      backgroundColor: "white",
      color: "#059669",
      border: "2px solid #059669",
    },
    // Related Section
    relatedSection: {
      marginTop: "80px",
      paddingTop: "60px",
      borderTop: "2px solid #E5E7EB",
    },
    relatedHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
      flexWrap: "wrap",
      gap: "20px",
    },
    relatedGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
      gap: "24px",
    },
    relatedCard: {
      backgroundColor: "white",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 25px rgba(0, 0, 0, 0.05)",
      border: "1px solid #E5E7EB",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      textDecoration: "none",
    },
    relatedImageWrapper: {
      position: "relative",
      height: "180px",
      overflow: "hidden",
    },
    relatedImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.5s ease",
    },
    relatedContent: {
      padding: "20px",
    },
    relatedType: {
      fontSize: "11px",
      color: "#059669",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "8px",
    },
    relatedTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "18px",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "12px",
    },
    relatedMeta: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      fontSize: "13px",
      color: "#6B7280",
    },
    // Modals
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "20px",
      animation: "fadeIn 0.3s ease",
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "24px",
      padding: "32px",
      maxWidth: "450px",
      width: "100%",
      animation: "scaleIn 0.3s ease",
    },
    modalTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "24px",
      textAlign: "center",
    },
    shareOptions: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    shareOption: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "18px 12px",
      backgroundColor: "#F9FAFB",
      borderRadius: "16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "2px solid transparent",
    },
    // Lightbox
    lightbox: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    lightboxClose: {
      position: "absolute",
      top: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    lightboxImage: {
      maxWidth: "90vw",
      maxHeight: "85vh",
      objectFit: "contain",
      borderRadius: "8px",
    },
    lightboxNav: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    // Mobile CTA
    mobileCTA: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "16px 20px",
      backgroundColor: "white",
      boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.1)",
      display: isMobile ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      zIndex: 1000,
      animation: "slideInFromBottom 0.5s ease",
    },
  };

  return (
    <>
      <style>{keyframesStyle}</style>
      
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div
          style={styles.heroBackground}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={destination.images[currentImageIndex]}
            alt={destination.name}
            style={styles.heroImage}
            onLoad={() => setIsImageLoaded(true)}
          />
          <div style={styles.heroOverlay} />
        </div>

        {/* Top Actions */}
        <div style={styles.topActions}>
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: isFavorite ? "#059669" : "rgba(255, 255, 255, 0.2)",
              animation: isFavorite ? "heartBeat 0.6s ease" : "none",
            }}
            onClick={() => setIsFavorite(!isFavorite)}
            title="Add to favorites"
          >
            <FiHeart size={20} style={{ fill: isFavorite ? "white" : "none" }} />
          </button>
          <button
            style={{
              ...styles.actionButton,
              backgroundColor: isBookmarked ? "#059669" : "rgba(255, 255, 255, 0.2)",
            }}
            onClick={() => setIsBookmarked(!isBookmarked)}
            title="Save for later"
          >
            <FiBookmark size={20} style={{ fill: isBookmarked ? "white" : "none" }} />
          </button>
          <button
            style={styles.actionButton}
            onClick={handleShare}
            title="Share"
          >
            <FiShare2 size={20} />
          </button>
          <button
            style={styles.actionButton}
            onClick={() => setIsLightboxOpen(true)}
            title="View gallery"
          >
            <FiMaximize2 size={20} />
          </button>
        </div>

        {/* Hero Content */}
        <div style={styles.heroContent}>
          <div style={styles.breadcrumbs}>
            <Link to="/" style={styles.breadcrumbLink}>Home</Link>
            <span>›</span>
            <Link to="/destinations" style={styles.breadcrumbLink}>Destinations</Link>
            <span>›</span>
            <Link to={`/country/${destination.countryId}`} style={styles.breadcrumbLink}>{country?.name}</Link>
            <span>›</span>
            <span style={{ fontWeight: "600" }}>{destination.name}</span>
          </div>
          <h1 style={styles.heroTitle}>{destination.name}</h1>
          <p style={styles.heroSubtitle}>{destination.description}</p>
          
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <FiStar size={16} style={{ fill: "#FFD700", color: "#FFD700" }} />
              <span>{destination.rating} Rating</span>
            </div>
            <div style={styles.heroStat}>
              <FiClock size={16} />
              <span>{destination.duration}</span>
            </div>
            <div style={styles.heroStat}>
              <FiUsers size={16} />
              <span>{destination.difficulty}</span>
            </div>
            <div style={styles.heroStat}>
              <FiMessageCircle size={16} />
              <span>{destination.reviews}+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Dots */}
        <div style={styles.thumbnailStrip}>
          {destination.images.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.thumbnailDot,
                ...(currentImageIndex === index ? styles.thumbnailDotActive : {}),
              }}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsAutoPlaying(false);
              }}
            />
          ))}
        </div>

        {/* Image Controls */}
        <div style={styles.imageControls}>
          <div style={styles.imageCounter}>
            <FiCamera size={16} />
            <span>{currentImageIndex + 1} / {destination.images.length}</span>
          </div>
          <button
            style={styles.navButton}
            onClick={() => { prevImage(); setIsAutoPlaying(false); }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#059669"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <FiChevronLeft size={22} />
          </button>
          <button
            style={styles.navButton}
            onClick={() => { nextImage(); setIsAutoPlaying(false); }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#059669"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <FiChevronRight size={22} />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div style={styles.scrollIndicator} onClick={scrollToContent}>
          <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: "2px" }}>EXPLORE MORE</span>
          <FiChevronDown size={22} />
        </div>
      </section>

      {/* Back Button */}
      <Link
        to="/destinations"
        style={styles.backButton}
        onMouseOver={(e) => { e.currentTarget.style.transform = "translateX(-5px)"; e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.15)"; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = isScrolled ? "0 4px 20px rgba(0,0,0,0.1)" : "none"; }}
      >
        <FiArrowLeft size={18} />
        {!isMobile && <span>Back</span>}
      </Link>

      {/* Quick Actions Bar */}
      <div style={styles.quickActionsBar}>
        <div style={styles.quickActionsContainer}>
          <div style={styles.quickActionsLeft}>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>Quick Actions:</span>
            <button
              style={styles.quickActionBtn}
              onClick={handleDownloadGuide}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
            >
              <FiDownload size={16} />
              {!isMobile && "Download Guide"}
            </button>
            <button
              style={styles.quickActionBtn}
              onClick={handlePrint}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
            >
              <FiPrinter size={16} />
              {!isMobile && "Print"}
            </button>
            <button
              style={styles.quickActionBtn}
              onClick={handleShare}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
            >
              <FiShare2 size={16} />
              {!isMobile && "Share"}
            </button>
          </div>
          <div style={styles.quickActionsRight}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", backgroundColor: "#F0FDF4", borderRadius: "10px", color: "#059669", fontWeight: "600", fontSize: "14px" }}>
              <FiEye size={16} />
              <span>2.4k views today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <section style={styles.contentSection} ref={contentRef}>
        <div style={styles.contentContainer}>
          {/* Tabs */}
          <div style={styles.tabsWrapper}>
            <div style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab.id ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseOver={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.color = "#059669"; e.currentTarget.style.backgroundColor = "#F0FDF4"; } }}
                  onMouseOut={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.backgroundColor = "transparent"; } }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.contentGrid}>
            {/* Main Content */}
            <div style={styles.mainContent}>
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div style={{ animation: "fadeInUp 0.5s ease" }}>
                  {/* About Section */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiInfo size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>About This Destination</h2>
                        <p style={styles.sectionSubtitle}>Everything you need to know</p>
                      </div>
                    </div>
                    <span style={styles.badge}>
                      <FiMapPin size={14} />
                      {destination.type}
                    </span>
                    <p style={styles.description}>{destination.fullDescription}</p>
                    
                    {/* Meta Info */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px", marginTop: "24px" }}>
                      {[
                        { icon: <FiMapPin size={18} />, label: "Location", value: country?.name },
                        { icon: <FiClock size={18} />, label: "Duration", value: destination.duration },
                        { icon: <FiUsers size={18} />, label: "Difficulty", value: destination.difficulty },
                        { icon: <FiCalendar size={18} />, label: "Best Time", value: destination.bestTime },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "12px", textAlign: "center" }}>
                          <div style={{ color: "#059669", marginBottom: "8px" }}>{item.icon}</div>
                          <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>{item.label}</div>
                          <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weather Section */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiSun size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Current Weather</h2>
                        <p style={styles.sectionSubtitle}>Live conditions & forecast</p>
                      </div>
                    </div>
                    <div style={{ ...styles.weatherGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}>
                      <div style={styles.weatherItem}>
                        <FiThermometer size={24} style={{ color: "#059669", marginBottom: "8px" }} />
                        <div style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a1a" }}>{weatherData.current.temp}</div>
                        <div style={{ fontSize: "13px", color: "#6B7280" }}>Temperature</div>
                      </div>
                      <div style={styles.weatherItem}>
                        <FiSun size={24} style={{ color: "#F59E0B", marginBottom: "8px" }} />
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a" }}>{weatherData.current.condition}</div>
                        <div style={{ fontSize: "13px", color: "#6B7280" }}>Condition</div>
                      </div>
                      <div style={styles.weatherItem}>
                        <FiDroplet size={24} style={{ color: "#3B82F6", marginBottom: "8px" }} />
                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>{weatherData.current.humidity}</div>
                        <div style={{ fontSize: "13px", color: "#6B7280" }}>Humidity</div>
                      </div>
                      <div style={styles.weatherItem}>
                        <FiWind size={24} style={{ color: "#6B7280", marginBottom: "8px" }} />
                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>{weatherData.current.wind}</div>
                        <div style={{ fontSize: "13px", color: "#6B7280" }}>Wind Speed</div>
                      </div>
                    </div>
                    <div style={styles.weatherForecast}>
                      {weatherData.forecast.map((day, i) => (
                        <div key={i} style={styles.forecastDay}>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "8px" }}>{day.day}</div>
                          <div style={{ fontSize: "28px", marginBottom: "6px" }}>{day.icon}</div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{day.temp}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Itinerary */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiCalendar size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Suggested Itinerary</h2>
                        <p style={styles.sectionSubtitle}>Make the most of your day</p>
                      </div>
                    </div>
                    <div style={styles.itineraryList}>
                      <div style={styles.itineraryLine} />
                      {itinerary.map((item, i) => (
                        <div key={i} style={styles.itineraryItem}>
                          <div style={styles.itineraryDot}>{item.icon}</div>
                          <div style={styles.itineraryTime}>{item.time}</div>
                          <div style={styles.itineraryContent}>
                            <div style={styles.itineraryActivity}>{item.activity}</div>
                            <div style={styles.itineraryDesc}>{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HIGHLIGHTS TAB */}
              {activeTab === "highlights" && (
                <div style={{ animation: "fadeInUp 0.5s ease" }}>
                  {/* Highlights */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiStar size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Experience Highlights</h2>
                        <p style={styles.sectionSubtitle}>What makes this place special</p>
                      </div>
                    </div>
                    <div style={styles.highlightsList}>
                      {destination.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          style={styles.highlightItem}
                          onMouseOver={(e) => { e.currentTarget.style.transform = "translateX(8px)"; e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.backgroundColor = "#F0FDF4"; }}
                          onMouseOut={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                        >
                          <div style={styles.highlightIcon}>
                            <FiCheck size={18} />
                          </div>
                          <span style={{ fontSize: "15px", color: "#374151", fontWeight: "500", lineHeight: "1.5" }}>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiMapPin size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Nearby Attractions</h2>
                        <p style={styles.sectionSubtitle}>Explore the surrounding area</p>
                      </div>
                    </div>
                    <div style={styles.nearbyList}>
                      {nearbyAttractions.map((attraction, i) => (
                        <div
                          key={i}
                          style={styles.nearbyItem}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.backgroundColor = "#F0FDF4"; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                        >
                          <div style={styles.nearbyLeft}>
                            <div style={styles.nearbyIcon}>
                              <FiNavigation size={18} />
                            </div>
                            <div>
                              <div style={styles.nearbyName}>{attraction.name}</div>
                              <div style={styles.nearbyMeta}>{attraction.distance} • {attraction.time}</div>
                            </div>
                          </div>
                          <span style={styles.nearbyType}>{attraction.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo Gallery Preview */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiCamera size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Photo Gallery</h2>
                        <p style={styles.sectionSubtitle}>{destination.images.length} photos from travelers</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px" }}>
                      {destination.images.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          style={{ position: "relative", borderRadius: "12px", overflow: "hidden", cursor: "pointer", height: "120px" }}
                          onClick={() => { setCurrentImageIndex(i); setIsLightboxOpen(true); }}
                        >
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} onMouseOver={(e) => e.target.style.transform = "scale(1.1)"} onMouseOut={(e) => e.target.style.transform = "scale(1)"} />
                          {i === 3 && destination.images.length > 4 && (
                            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: "700" }}>
                              +{destination.images.length - 4} more
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PLANNING TAB */}
              {activeTab === "planning" && (
                <div style={{ animation: "fadeInUp 0.5s ease" }}>
                  {/* Packing List */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiPackage size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>What to Pack</h2>
                        <p style={styles.sectionSubtitle}>Essential items for your trip</p>
                      </div>
                    </div>
                    <div style={styles.packingGrid}>
                      {packingList.map((category, i) => (
                        <div key={i} style={styles.packingCategory}>
                          <div style={styles.packingTitle}>
                            <FiPackage size={18} style={{ color: "#059669" }} />
                            {category.category}
                          </div>
                          {category.items.map((item, j) => (
                            <div key={j} style={styles.packingItem}>
                              <FiCheck size={16} style={{ color: "#059669" }} />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Getting There */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiNavigation size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Getting There</h2>
                        <p style={styles.sectionSubtitle}>Transportation options</p>
                      </div>
                    </div>
                    <div style={styles.transportGrid}>
                      {transportOptions.map((option, i) => (
                        <div key={i} style={styles.transportCard}>
                          <div style={styles.transportIcon}>{option.icon}</div>
                          <div style={styles.transportInfo}>
                            <div style={styles.transportMode}>{option.mode}</div>
                            <div style={styles.transportDetails}>{option.details}</div>
                          </div>
                          <div style={styles.transportTime}>{option.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local Phrases */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiGlobe size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Useful Phrases</h2>
                        <p style={styles.sectionSubtitle}>Basic local language</p>
                      </div>
                    </div>
                    <div style={styles.phrasesList}>
                      {essentialPhrases.map((phrase, i) => (
                        <div key={i} style={styles.phraseItem}>
                          <span style={styles.phraseEnglish}>{phrase.phrase}</span>
                          <div style={{ textAlign: "right" }}>
                            <div style={styles.phraseLocal}>{phrase.local}</div>
                            <div style={styles.phrasePronunciation}>{phrase.pronunciation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TIPS & INFO TAB */}
              {activeTab === "tips" && (
                <div style={{ animation: "fadeInUp 0.5s ease" }}>
                  {/* Travel Tips Carousel */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiZap size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Insider Tips</h2>
                        <p style={styles.sectionSubtitle}>Pro tips from experienced travelers</p>
                      </div>
                    </div>
                    <div style={styles.tipsCarousel}>
                      <div style={styles.tipCard}>
                        <div style={styles.tipIcon}>{travelTips[selectedTip].icon}</div>
                        <div style={styles.tipTitle}>{travelTips[selectedTip].title}</div>
                        <div style={styles.tipText}>{travelTips[selectedTip].tip}</div>
                      </div>
                      <div style={styles.tipDots}>
                        {travelTips.map((_, i) => (
                          <div
                            key={i}
                            style={{
                              ...styles.tipDot,
                              ...(selectedTip === i ? styles.tipDotActive : {}),
                            }}
                            onClick={() => setSelectedTip(i)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Safety Information */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiShield size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Safety Information</h2>
                        <p style={styles.sectionSubtitle}>Know before you go</p>
                      </div>
                    </div>
                    {safetyInfo.map((item, i) => (
                      <div key={i} style={styles.safetyItem}>
                        <div style={styles.safetyHeader}>
                          <span style={styles.safetyLabel}>{item.level}</span>
                          <span style={styles.safetyValue}>{item.rating}/5</span>
                        </div>
                        <div style={styles.safetyBar}>
                          <div style={{ ...styles.safetyProgress, width: `${(item.rating / 5) * 100}%` }} />
                        </div>
                        <div style={styles.safetyDescription}>{item.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Accessibility */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiUsers size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Accessibility</h2>
                        <p style={styles.sectionSubtitle}>Facilities & services available</p>
                      </div>
                    </div>
                    {accessibilityInfo.map((item, i) => (
                      <div key={i} style={styles.accessibilityItem}>
                        <div style={styles.accessibilityLeft}>
                          <div style={{ ...styles.accessibilityIcon, backgroundColor: item.available ? "#D1FAE5" : "#FEE2E2", color: item.available ? "#059669" : "#DC2626" }}>
                            {item.available ? <FiCheck size={16} /> : <FiX size={16} />}
                          </div>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>{item.feature}</div>
                            <div style={{ fontSize: "13px", color: "#6B7280" }}>{item.note}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Local Culture */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiGlobe size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Local Culture & Etiquette</h2>
                        <p style={styles.sectionSubtitle}>Respect local customs</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
                      {localCulture.map((item, i) => (
                        <div key={i} style={{ padding: "18px", backgroundColor: "#F9FAFB", borderRadius: "12px", borderLeft: "4px solid #059669" }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a", marginBottom: "8px" }}>{item.title}</div>
                          <div style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.6" }}>{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQ */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiHelpCircle size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
                        <p style={styles.sectionSubtitle}>Common questions answered</p>
                      </div>
                    </div>
                    {faqData.map((faq, i) => (
                      <div key={i} style={styles.faqItem}>
                        <div
                          style={{ ...styles.faqQuestion, backgroundColor: expandedFaq === i ? "#F0FDF4" : "white" }}
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === i ? <FiChevronUp size={20} style={{ color: "#059669" }} /> : <FiChevronDown size={20} />}
                        </div>
                        {expandedFaq === i && (
                          <div style={styles.faqAnswer}>{faq.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <div style={{ animation: "fadeInUp 0.5s ease" }}>
                  {/* Reviews Summary */}
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <div style={styles.sectionIcon}>
                        <FiMessageCircle size={22} />
                      </div>
                      <div>
                        <h2 style={styles.sectionTitle}>Traveler Reviews</h2>
                        <p style={styles.sectionSubtitle}>{destination.reviews}+ verified reviews</p>
                      </div>
                    </div>

                    {/* Rating Summary */}
                    <div style={{ display: "flex", alignItems: "center", gap: "30px", padding: "24px", backgroundColor: "#F9FAFB", borderRadius: "16px", marginBottom: "30px", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "56px", fontWeight: "700", color: "#1a1a1a", fontFamily: "'Playfair Display', serif" }}>{destination.rating}</div>
                        <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginBottom: "4px" }}>
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} size={18} style={{ fill: i < Math.floor(destination.rating) ? "#F59E0B" : "none", color: "#F59E0B" }} />
                          ))}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6B7280" }}>{destination.reviews} reviews</div>
                      </div>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13px", color: "#6B7280", minWidth: "40px" }}>{star} star</span>
                            <div style={{ flex: 1, height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", backgroundColor: "#F59E0B", width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%`, borderRadius: "4px" }} />
                            </div>
                            <span style={{ fontSize: "13px", color: "#6B7280", minWidth: "35px" }}>{star === 5 ? "70%" : star === 4 ? "20%" : star === 3 ? "7%" : star === 2 ? "2%" : "1%"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    {reviewsData.slice(0, showAllReviews ? reviewsData.length : 3).map((review) => (
                      <div key={review.id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                          <div style={styles.reviewAuthor}>
                            <div style={styles.reviewAvatar}>{review.avatar}</div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={styles.reviewName}>{review.name}</span>
                                {review.verified && (
                                  <span style={{ fontSize: "11px", backgroundColor: "#D1FAE5", color: "#059669", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>Verified</span>
                                )}
                              </div>
                              <span style={styles.reviewDate}>{review.date}</span>
                            </div>
                          </div>
                          <div style={styles.reviewStars}>
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} size={16} style={{ fill: i < review.rating ? "#F59E0B" : "none", color: "#F59E0B" }} />
                            ))}
                          </div>
                        </div>
                        <div style={styles.reviewTitle}>{review.title}</div>
                        <div style={styles.reviewComment}>{review.comment}</div>
                        {review.images > 0 && (
                          <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6B7280" }}>
                            <FiCamera size={14} />
                            <span>{review.images} photos</span>
                          </div>
                        )}
                        <div style={styles.reviewActions}>
                          <button
                            style={{ ...styles.reviewAction, color: helpfulReviews[review.id] ? "#059669" : "#6B7280" }}
                            onClick={() => toggleHelpful(review.id)}
                          >
                            <FiThumbsUp size={14} style={{ fill: helpfulReviews[review.id] ? "#059669" : "none" }} />
                            <span>Helpful ({review.helpful + (helpfulReviews[review.id] ? 1 : 0)})</span>
                          </button>
                          <button style={styles.reviewAction}>
                            <FiMessageCircle size={14} />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {reviewsData.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        style={{ width: "100%", padding: "16px", backgroundColor: "#F0FDF4", border: "2px solid #D1FAE5", borderRadius: "12px", fontSize: "15px", fontWeight: "600", color: "#059669", cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#D1FAE5"; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#F0FDF4"; }}
                      >
                        {showAllReviews ? <><FiChevronUp size={18} /> Show Less</> : <><FiChevronDown size={18} /> Show All {reviewsData.length} Reviews</>}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarCard}>
                {/* Rating Display */}
                <div style={styles.ratingDisplay}>
                  <div style={styles.ratingBig}>{destination.rating}</div>
                  <div style={styles.ratingDetails}>
                    <div style={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={18} style={{ fill: i < Math.floor(destination.rating) ? "#F59E0B" : "none", color: "#F59E0B" }} />
                      ))}
                    </div>
                    <div style={styles.ratingCount}>{destination.reviews}+ reviews</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div style={styles.quickInfoGrid}>
                  {[
                    { icon: <FiClock size={18} />, value: destination.duration, label: "Duration" },
                    { icon: <FiUsers size={18} />, value: destination.difficulty, label: "Difficulty" },
                    { icon: <FiMapPin size={18} />, value: destination.type, label: "Type" },
                    { icon: <FiCalendar size={18} />, value: destination.bestTime?.split(" ")[0] || "Spring", label: "Best Time" },
                  ].map((item, i) => (
                    <div key={i} style={styles.quickInfoItem}>
                      <div style={styles.quickInfoIcon}>{item.icon}</div>
                      <div style={styles.quickInfoValue}>{item.value}</div>
                      <div style={styles.quickInfoLabel}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div style={styles.ctaButtons}>
                  <Link
                    to="/contact"
                    style={{ ...styles.ctaButton, ...styles.ctaPrimary }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 35px rgba(5, 150, 105, 0.4)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(5, 150, 105, 0.3)"; }}
                  >
                    <FiMail size={18} />
                    Request Information
                  </Link>
                  <Link
                    to="/booking"
                    style={{ ...styles.ctaButton, ...styles.ctaSecondary }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#F0FDF4"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                  >
                    <FiCalendar size={18} />
                    Plan My Trip
                  </Link>
                  <button
                    style={{ ...styles.ctaButton, backgroundColor: "#F9FAFB", color: "#374151", border: "2px solid #E5E7EB" }}
                    onClick={handleDownloadGuide}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.color = "#059669"; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <FiDownload size={18} />
                    Download Guide (PDF)
                  </button>
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                  {["Free Cancellation", "Expert Guides", "Small Groups", "24/7 Support"].map((feature, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: "#F0FDF4", color: "#059669", fontSize: "12px", fontWeight: "600", borderRadius: "20px", border: "1px solid #D1FAE5" }}>
                      <FiCheck size={12} /> {feature}
                    </span>
                  ))}
                </div>

                {/* Contact Card */}
                <div style={styles.contactCard}>
                  <div style={styles.contactTitle}>
                    <FiPhone size={18} style={{ color: "#059669" }} />
                    Need Help Planning?
                  </div>
                  <div
                    style={styles.contactItem}
                    onMouseOver={(e) => e.currentTarget.style.color = "#059669"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#374151"}
                  >
                    <FiPhone size={18} style={{ color: "#059669" }} />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div
                    style={styles.contactItem}
                    onMouseOver={(e) => e.currentTarget.style.color = "#059669"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#374151"}
                  >
                    <FiMail size={18} style={{ color: "#059669" }} />
                    <span>travel@explorer.com</span>
                  </div>
                  <div
                    style={{ ...styles.contactItem, borderBottom: "none" }}
                    onMouseOver={(e) => e.currentTarget.style.color = "#059669"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#374151"}
                  >
                    <FiMessageCircle size={18} style={{ color: "#059669" }} />
                    <span>Live Chat Available</span>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div style={{ ...styles.sidebarCard, padding: "0", overflow: "hidden", position: "relative", height: "200px", top: "0" }}>
                <div style={{ width: "100%", height: "100%", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                  <FiMap size={48} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>Interactive Map</span>
                  <button
                    style={{ padding: "10px 20px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                    onClick={() => alert("Opening map...")}
                  >
                    View on Map
                  </button>
                </div>
              </div>

              {/* Share Card */}
              <div style={{ ...styles.sidebarCard, top: "0" }}>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" }}>Share This Destination</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { icon: "📱", label: "Copy", action: copyToClipboard },
                    { icon: "✉️", label: "Email", action: () => window.open(`mailto:?subject=${destination.name}&body=${window.location.href}`) },
                    { icon: "💬", label: "WhatsApp", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(destination.name + " " + window.location.href)}`) },
                    { icon: "🐦", label: "Twitter", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(destination.name)}&url=${window.location.href}`) },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={option.action}
                      style={{ flex: 1, padding: "14px 8px", backgroundColor: "#F9FAFB", border: "2px solid #E5E7EB", borderRadius: "12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.3s ease" }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.backgroundColor = "#F0FDF4"; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                    >
                      <span style={{ fontSize: "20px" }}>{option.icon}</span>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280" }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Destinations */}
          {relatedDestinations.length > 0 && (
            <div style={styles.relatedSection}>
              <div style={styles.relatedHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={styles.sectionIcon}>
                    <FiMapPin size={22} />
                  </div>
                  <div>
                    <h2 style={{ ...styles.sectionTitle, marginBottom: "4px" }}>More in {country?.name}</h2>
                    <p style={{ fontSize: "14px", color: "#6B7280" }}>Explore similar destinations</p>
                  </div>
                </div>
                <Link
                  to={`/country/${destination.countryId}`}
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", textDecoration: "none", fontWeight: "600", fontSize: "15px", padding: "10px 20px", backgroundColor: "#F0FDF4", borderRadius: "10px", transition: "all 0.3s ease" }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#D1FAE5"; e.currentTarget.style.gap = "12px"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#F0FDF4"; e.currentTarget.style.gap = "8px"; }}
                >
                  View All <FiArrowRight size={18} />
                </Link>
              </div>
              <div style={styles.relatedGrid}>
                {relatedDestinations.map((dest, index) => (
                  <Link
                    key={dest.id}
                    to={`/destination/${dest.id}`}
                    style={{ ...styles.relatedCard, animation: `fadeInUp 0.6s ease ${index * 0.15}s forwards`, opacity: 0, animationFillMode: "forwards" }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(5, 150, 105, 0.12)"; e.currentTarget.querySelector("img").style.transform = "scale(1.1)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 25px rgba(0, 0, 0, 0.05)"; e.currentTarget.querySelector("img").style.transform = "scale(1)"; }}
                  >
                    <div style={styles.relatedImageWrapper}>
                      <img src={dest.images[0]} alt={dest.name} style={styles.relatedImage} />
                    </div>
                    <div style={styles.relatedContent}>
                      <span style={styles.relatedType}>{dest.type}</span>
                      <h3 style={styles.relatedTitle}>{dest.name}</h3>
                      <div style={styles.relatedMeta}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiStar size={14} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
                          {dest.rating}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiClock size={14} />
                          {dest.duration}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiUsers size={14} />
                          {dest.difficulty}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile CTA */}
      <div style={styles.mobileCTA}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={14} style={{ fill: i < Math.floor(destination.rating) ? "#F59E0B" : "none", color: "#F59E0B" }} />
            ))}
          </div>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>{destination.reviews}+ reviews</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            style={{ width: "44px", height: "44px", borderRadius: "12px", border: "2px solid #E5E7EB", backgroundColor: isFavorite ? "#F0FDF4" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <FiHeart size={20} style={{ color: isFavorite ? "#059669" : "#6B7280", fill: isFavorite ? "#059669" : "none" }} />
          </button>
          <Link
            to="/contact"
            style={{ padding: "12px 24px", background: "linear-gradient(135deg, #059669 0%, #10B981 100%)", color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FiMail size={16} />
            Inquire
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div style={styles.lightbox} onClick={() => setIsLightboxOpen(false)}>
          <button
            style={styles.lightboxClose}
            onClick={() => setIsLightboxOpen(false)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
          >
            <FiX size={24} />
          </button>
          <button
            style={{ ...styles.lightboxNav, left: "20px" }}
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
          >
            <FiChevronLeft size={28} />
          </button>
          <img
            src={destination.images[currentImageIndex]}
            alt={destination.name}
            style={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{ ...styles.lightboxNav, right: "20px" }}
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
          >
            <FiChevronRight size={28} />
          </button>
          <div style={{ position: "absolute", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px" }}>
            {destination.images.map((_, index) => (
              <div
                key={index}
                style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: currentImageIndex === index ? "white" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s ease" }}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div style={styles.modal} onClick={() => setShowShareModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Share This Destination</h3>
            <div style={styles.shareOptions}>
              {[
                { icon: "📱", label: "Copy Link", action: copyToClipboard },
                { icon: "✉️", label: "Email", action: () => window.open(`mailto:?subject=${destination.name}&body=${window.location.href}`) },
                { icon: "💬", label: "WhatsApp", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(destination.name + " " + window.location.href)}`) },
                { icon: "🐦", label: "Twitter", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(destination.name)}&url=${window.location.href}`) },
              ].map((option, i) => (
                <button
                  key={i}
                  style={styles.shareOption}
                  onClick={option.action}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#D1FAE5"; e.currentTarget.style.borderColor = "#059669"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: "28px" }}>{option.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{option.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              style={{ width: "100%", padding: "16px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.3s ease" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#E5E7EB"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationDetail;