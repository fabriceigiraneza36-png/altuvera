import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { getBrandLogoUrl } from "../../utils/seo";
import { useCountries } from "../../hooks/useCountries";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiCheck,
  FiLinkedin,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const { user } = useUserAuth();
  const displayName =
    user?.fullName || user?.name || user?.email?.split("@")[0] || "";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  // Fetch countries from backend — pass limit so we don't fetch everything
  const {
    countries: backendCountries,
    loading: countriesLoading,
    error: countriesError,
  } = useCountries({ limit: 6 });

// 👇 ADD THIS TEMPORARILY
useEffect(() => {
  console.log("=== FOOTER COUNTRIES DEBUG ===");
  console.log("loading:", countriesLoading);
  console.log("error:", countriesError);
  console.log("backendCountries:", backendCountries);
}, [backendCountries, countriesLoading, countriesError]);


  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setSubscribed(true);
      setIsSubmitting(false);
      setEmail("");
    }, 1000);
  };

  const currentYear = new Date().getFullYear();
  const isMobile = viewportWidth <= 640;
  const isTablet = viewportWidth <= 1024;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Stable mapping — only re-computes when backendCountries changes
  const countries = useMemo(() => {
    if (!backendCountries?.length) return [];
    return backendCountries.slice(0, 6).map((country) => ({
      name: country.name,
      path: `/country/${
        country.slug ||
        country.id ||
        country.name.toLowerCase().replace(/\s+/g, "-")
      }`,
    }));
  }, [backendCountries]);

  const quickLinks = [
    { name: "Destinations", path: "/destinations" },
    { name: "Services", path: "/services" },
    { name: "Virtual Tours", path: "/virtual-tour" },
    { name: "Travel Tips", path: "/tips" },
    { name: "Gallery", path: "/gallery" },
    { name: "FAQ", path: "/faq" },
  ];

  const socialIcons = [
    {
      icon: FiFacebook,
      label: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61585299893450",
    },
    {
      icon: FaXTwitter,
      label: "X",
      url: "https://x.com/altuverasafari",
    },
    {
      icon: FiInstagram,
      label: "Instagram",
      url: "https://www.instagram.com/altu.vera1/",
    },
    {
      icon: FiLinkedin,
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/altuvera-safari-14b9033b5/",
    },
    {
      icon: FiYoutube,
      label: "YouTube",
      url: "#",
    },
  ];

  const styles = {
    footer: {
      backgroundColor: "#022C22",
      color: "white",
      position: "relative",
      overflow: "hidden",
    },
    pattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "200px",
      background:
        "linear-gradient(180deg, rgba(5, 150, 105, 0.1) 0%, transparent 100%)",
      pointerEvents: "none",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: isMobile
        ? "56px 16px calc(26px + env(safe-area-inset-bottom, 0px))"
        : isTablet
        ? "68px 20px 34px"
        : "80px 24px 40px",
      position: "relative",
      zIndex: 1,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(250px, 1fr))",
      gap: isMobile ? "28px" : isTablet ? "38px" : "48px",
      marginBottom: isMobile ? "34px" : "60px",
    },
    column: {},
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "12px" : "16px",
      marginBottom: isMobile ? "20px" : "28px",
      textDecoration: "none",
      transition: "transform 0.3s ease",
    },
    logoWrapper: {
      position: "relative",
      width: isMobile ? "52px" : "60px",
      height: isMobile ? "52px" : "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      padding: "0",
      overflow: "visible",
      border: "none",
      outline: "none",
      boxShadow: "none",
    },
    logoGlow: {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "70px",
      height: "70px",
      transform: "translate(-50%, -50%)",
      background:
        "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
      borderRadius: "50%",
      opacity: 0,
      pointerEvents: "none",
      transition: "opacity 0.3s ease",
    },
    logoImg: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
      transition:
        "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.5s ease",
      border: "none",
      borderRadius: "0",
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? "24px" : "30px",
      fontWeight: "800",
      color: "white",
      letterSpacing: "-0.5px",
      textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    tagline: {
      fontSize: isMobile ? "14px" : "15px",
      color: "rgba(255,255,255,0.7)",
      marginBottom: isMobile ? "18px" : "24px",
      lineHeight: "1.7",
    },
    socialLinks: {
      display: "flex",
      gap: isMobile ? "10px" : "12px",
    },
    socialLink: {
      width: isMobile ? "46px" : "44px",
      height: isMobile ? "46px" : "44px",
      borderRadius: "12px",
      backgroundColor: "rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      transition: "all 0.3s ease",
      cursor: "pointer",
      border: "none",
    },
    columnTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: "600",
      marginBottom: isMobile ? "16px" : "24px",
      color: "white",
    },
    linksList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    linkItem: {
      marginBottom: isMobile ? "10px" : "14px",
    },
    link: {
      color: "rgba(255,255,255,0.65)",
      textDecoration: "none",
      fontSize: isMobile ? "14px" : "15px",
      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      display: "inline-flex",
      alignItems: "center",
      gap: "0",
      minHeight: isMobile ? "34px" : "32px",
      position: "relative",
      padding: "4px 0",
    },
    linkUnderline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "2px",
      background: "linear-gradient(90deg, #10B981, #34D399)",
      transform: "scaleX(0)",
      transformOrigin: "right",
      transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
      borderRadius: "2px",
    },
    linkIcon: {
      fontSize: "0px",
      opacity: 0,
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      color: "#10B981",
    },
    contactItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: isMobile ? "12px" : "14px",
      marginBottom: isMobile ? "14px" : "20px",
    },
    contactIcon: {
      width: isMobile ? "42px" : "40px",
      height: isMobile ? "42px" : "40px",
      borderRadius: "10px",
      backgroundColor: "rgba(5, 150, 105, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#10B981",
      flexShrink: 0,
    },
    contactText: {
      fontSize: isMobile ? "14px" : "15px",
      color: "rgba(255,255,255,0.8)",
      lineHeight: "1.6",
    },
    divider: {
      height: "1px",
      backgroundColor: "rgba(255,255,255,0.1)",
      marginBottom: "30px",
    },
    bottom: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: isMobile ? "flex-start" : "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "14px" : "20px",
    },
    copyright: {
      fontSize: isMobile ? "13px" : "14px",
      color: "rgba(255,255,255,0.6)",
    },
    bottomLinks: {
      display: "flex",
      gap: isMobile ? "14px" : "24px",
      flexWrap: "wrap",
    },
    bottomLink: {
      color: "rgba(255,255,255,0.6)",
      textDecoration: "none",
      fontSize: isMobile ? "13px" : "14px",
      transition: "color 0.3s ease",
      minHeight: isMobile ? "30px" : "auto",
    },
    certifications: {
      display: "flex",
      gap: isMobile ? "10px" : "16px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    certBadge: {
      padding: isMobile ? "8px 12px" : "8px 16px",
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: "8px",
      fontSize: isMobile ? "11px" : "12px",
      color: "#10B981",
      fontWeight: "600",
    },
    // Loading skeleton styles
    skeletonItem: {
      height: isMobile ? "14px" : "15px",
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: "6px",
      marginBottom: isMobile ? "10px" : "14px",
      animation: "pulse 1.5s ease-in-out infinite",
    },
    errorText: {
      fontSize: isMobile ? "13px" : "14px",
      color: "#f87171",
      lineHeight: "1.5",
    },
  };

  // Shared hover handlers for nav links
  const onLinkMouseOver = (e) => {
    const link = e.currentTarget;
    link.style.color = "white";
    link.style.transform = "translateX(8px)";
    const underline = link.querySelector(".link-underline");
    const icon = link.querySelector(".link-icon");
    if (underline) {
      underline.style.transform = "scaleX(1)";
      underline.style.transformOrigin = "left";
    }
    if (icon) {
      icon.style.fontSize = "14px";
      icon.style.opacity = "1";
      icon.style.marginRight = "8px";
    }
  };

  const onLinkMouseOut = (e) => {
    const link = e.currentTarget;
    link.style.color = "rgba(255,255,255,0.65)";
    link.style.transform = "translateX(0)";
    const underline = link.querySelector(".link-underline");
    const icon = link.querySelector(".link-icon");
    if (underline) {
      underline.style.transform = "scaleX(0)";
      underline.style.transformOrigin = "right";
    }
    if (icon) {
      icon.style.fontSize = "0px";
      icon.style.opacity = "0";
      icon.style.marginRight = "0";
    }
  };

  const renderDestinations = () => {
    if (countriesLoading) {
      // Skeleton shimmer placeholders
      return Array.from({ length: 5 }).map((_, i) => (
        <li key={i} style={styles.linkItem}>
          <div
            style={{
              ...styles.skeletonItem,
              width: `${55 + Math.random() * 30}%`,
            }}
          />
        </li>
      ));
    }

    if (countriesError) {
      return (
        <li style={styles.linkItem}>
          <span style={styles.errorText}>
            ⚠ Could not load destinations.
            <br />
            <Link
              to="/destinations"
              style={{
                color: "#10B981",
                textDecoration: "underline",
                fontSize: "inherit",
              }}
            >
              Browse all destinations →
            </Link>
          </span>
        </li>
      );
    }

    if (countries.length === 0) {
      return (
        <li style={styles.linkItem}>
          <Link
            to="/destinations"
            style={styles.link}
            onMouseOver={onLinkMouseOver}
            onMouseOut={onLinkMouseOut}
          >
            <FiArrowRight className="link-icon" style={styles.linkIcon} />
            View all destinations
            <div className="link-underline" style={styles.linkUnderline} />
          </Link>
        </li>
      );
    }

    return countries.map((country) => (
      <li key={country.name} style={styles.linkItem}>
        <Link
          to={country.path}
          style={styles.link}
          onMouseOver={onLinkMouseOver}
          onMouseOut={onLinkMouseOut}
        >
          <FiArrowRight className="link-icon" style={styles.linkIcon} />
          {country.name}
          <div className="link-underline" style={styles.linkUnderline} />
        </Link>
      </li>
    ));
  };

  return (
    <footer data-checklist-trigger style={styles.footer}>
      {/* Pulse animation for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={styles.pattern} />

      <div style={styles.container}>
        <div style={styles.grid}>

          {/* ── Column 1: Brand ── */}
          <div style={styles.column}>
            <Link
              to="/"
              style={styles.logoContainer}
              onMouseOver={(e) => {
                const img = e.currentTarget.querySelector("img");
                const glow = e.currentTarget.querySelector(".footer-logo-glow");
                if (img) {
                  img.style.transform = "translateY(-2px) scale(1.05)";
                  img.style.filter =
                    "drop-shadow(0 10px 22px rgba(5,150,105,0.25))";
                }
                if (glow) glow.style.opacity = "1";
              }}
              onMouseOut={(e) => {
                const img = e.currentTarget.querySelector("img");
                const glow = e.currentTarget.querySelector(".footer-logo-glow");
                if (img) {
                  img.style.transform = "translateY(0) scale(1)";
                  img.style.filter =
                    "drop-shadow(0 8px 18px rgba(0,0,0,0.2))";
                }
                if (glow) glow.style.opacity = "0";
              }}
            >
              <div style={styles.logoWrapper}>
                <div
                  className="footer-logo-glow"
                  style={styles.logoGlow}
                />
                <img
                  src={getBrandLogoUrl()}
                  alt="Altuvera logo"
                  style={styles.logoImg}
                  onError={(e) => {
                    e.currentTarget.src = getBrandLogoUrl();
                  }}
                />
              </div>
              <span style={styles.logoText}>Altuvera</span>
            </Link>

            <p style={styles.tagline}>
              " True adventure in High Places & Deep Culture "
              <br />
              <br />
              Your gateway to extraordinary East African experiences. We craft
              journeys that transform, inspire, and create lasting memories.
            </p>

            <div style={styles.socialLinks}>
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.socialLink}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Column 2: Destinations ── */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Destinations</h3>
            <ul style={styles.linksList}>{renderDestinations()}</ul>
          </div>

          {/* ── Column 3: Quick Links ── */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Quick Links</h3>
            <ul style={styles.linksList}>
              {quickLinks.map((ql) => (
                <li key={ql.name} style={styles.linkItem}>
                  <Link
                    to={ql.path}
                    style={styles.link}
                    onMouseOver={onLinkMouseOver}
                    onMouseOut={onLinkMouseOut}
                  >
                    <FiArrowRight className="link-icon" style={styles.linkIcon} />
                    {ql.name}
                    <div className="link-underline" style={styles.linkUnderline} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact ── */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Contact Us</h3>

            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiMapPin size={18} />
              </div>
              <span style={styles.contactText}>
                Altuvera House, Safari Way
                <br />
                Musanze, Rwanda
              </span>
            </div>

            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiPhone size={18} />
              </div>
              <span style={styles.contactText}>
                +250 780 702 773
                <br />
                +250 792 352 409
              </span>
            </div>

            <div style={styles.contactItem}>
              <div style={styles.contactIcon}>
                <FiMail size={18} />
              </div>
              <span style={styles.contactText}>
                altuverasafari@gmail.com
                <br />
                fabriceigiraneza36@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={styles.divider} />

        {/* ── Bottom Bar ── */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} Altuvera. All rights reserved.{" "}
            {displayName ? `Made for you, ${displayName}.` : "Made for you."}
          </p>

          <div style={styles.certifications}>
            <span style={styles.certBadge}>🌱 Eco-Certified</span>
            <span style={styles.certBadge}>⭐ ATTA Member</span>
          </div>

          <div style={styles.bottomLinks}>
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms of Service", path: "/terms" },
              { label: "Cookie Policy", path: "/cookies" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                style={styles.bottomLink}
                onMouseOver={(e) => (e.target.style.color = "#10B981")}
                onMouseOut={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.6)")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;