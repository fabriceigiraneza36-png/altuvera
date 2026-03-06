// PageHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

// ═══════════════════════════════════════════════════════════════
// MODERN PAGE HEADER COMPONENT
// Professional, Responsive, Animated
// ═══════════════════════════════════════════════════════════════

const PageHeader = ({
  title,
  subtitle,
  tagline,
  backgroundImage,
  breadcrumbs = [],
  overlay = true,
  height = "500px",
  align = "center",
  children,
  parallax = true,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    if (!parallax) return;
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.4);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallax]);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    header: {
      position: "relative",
      height: isMobile ? "auto" : height,
      minHeight: isMobile ? "380px" : "450px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      isolation: "isolate",
    },

    background: {
      position: "absolute",
      inset: "-20px",
      backgroundImage: backgroundImage
        ? `url(${backgroundImage})`
        : "linear-gradient(135deg, #022C22 0%, #064E3B 50%, #065F46 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      transform: parallax ? `translateY(${scrollY}px) scale(1.1)` : "scale(1.1)",
      transition: "transform 0.1s linear",
      willChange: "transform",
    },

    overlay: {
      position: "absolute",
      inset: 0,
      background: overlay
        ? `linear-gradient(
            180deg,
            rgba(2, 44, 34, 0.5) 0%,
            rgba(2, 44, 34, 0.7) 50%,
            rgba(2, 44, 34, 0.85) 100%
          )`
        : "transparent",
      zIndex: 1,
    },

    noiseOverlay: {
      position: "absolute",
      inset: 0,
      opacity: 0.03,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      zIndex: 2,
      pointerEvents: "none",
    },

    pattern: {
      position: "absolute",
      inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.6,
      zIndex: 2,
      pointerEvents: "none",
    },

    content: {
      position: "relative",
      zIndex: 10,
      textAlign: align,
      padding: isMobile ? "80px 20px 60px" : "0 32px",
      maxWidth: "960px",
      width: "100%",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    },

    breadcrumbs: {
      display: "flex",
      alignItems: "center",
      justifyContent: align === "center" ? "center" : "flex-start",
      gap: "6px",
      marginBottom: "28px",
      flexWrap: "wrap",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
    },

    breadcrumbLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      color: "rgba(255, 255, 255, 0.75)",
      textDecoration: "none",
      fontSize: "13px",
      fontWeight: 500,
      padding: "6px 10px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      transition: "all 0.25s ease",
    },

    breadcrumbSeparator: {
      color: "rgba(255, 255, 255, 0.3)",
      display: "flex",
      alignItems: "center",
    },

    breadcrumbCurrent: {
      color: "#34D399",
      fontSize: "13px",
      fontWeight: 600,
      padding: "6px 12px",
      background: "rgba(16, 185, 129, 0.12)",
      borderRadius: "8px",
      border: "1px solid rgba(16, 185, 129, 0.2)",
    },

    decorativeLine: {
      display: "flex",
      alignItems: "center",
      justifyContent: align === "center" ? "center" : "flex-start",
      gap: "12px",
      marginBottom: "24px",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
    },

    line: {
      width: "50px",
      height: "2px",
      background: "linear-gradient(90deg, transparent 0%, #10B981 50%, transparent 100%)",
      borderRadius: "2px",
    },

    diamond: {
      width: "8px",
      height: "8px",
      background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
      transform: "rotate(45deg)",
      borderRadius: "2px",
      boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
    },

    tagline: {
      color: "#34D399",
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "2.5px",
      marginBottom: "16px",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)",
      padding: "8px 16px",
      borderRadius: "100px",
      border: "1px solid rgba(16, 185, 129, 0.25)",
      backdropFilter: "blur(8px)",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
    },

    taglineDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#34D399",
      animation: "pulse 2s ease-in-out infinite",
    },

    title: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: isMobile ? "clamp(32px, 8vw, 42px)" : "clamp(40px, 5vw, 60px)",
      fontWeight: 700,
      color: "#FFFFFF",
      marginBottom: "20px",
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
      textShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
    },

    subtitle: {
      fontSize: isMobile ? "15px" : "17px",
      color: "rgba(255, 255, 255, 0.85)",
      maxWidth: "640px",
      margin: align === "center" ? "0 auto" : "0",
      lineHeight: 1.75,
      fontWeight: 400,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
    },

    childrenContainer: {
      marginTop: "32px",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
    },

    bottomFade: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "120px",
      background: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, white 100%)",
      zIndex: 3,
      pointerEvents: "none",
    },

    floatingOrb: {
      position: "absolute",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
      filter: "blur(40px)",
      zIndex: 1,
      pointerEvents: "none",
      animation: "float 8s ease-in-out infinite",
    },

    cornerAccent: {
      position: "absolute",
      width: "200px",
      height: "200px",
      border: "1px solid rgba(16, 185, 129, 0.1)",
      borderRadius: "50%",
      zIndex: 1,
      pointerEvents: "none",
    },
  };

  // Inject keyframes
  useEffect(() => {
    if (document.getElementById("page-header-keyframes")) return;
    const style = document.createElement("style");
    style.id = "page-header-keyframes";
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.85); }
      }
      @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        33% { transform: translate(20px, -20px); }
        66% { transform: translate(-15px, 15px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleBreadcrumbHover = (e, isHover) => {
    e.currentTarget.style.background = isHover
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(255, 255, 255, 0.05)";
    e.currentTarget.style.color = isHover ? "#34D399" : "rgba(255, 255, 255, 0.75)";
    e.currentTarget.style.borderColor = isHover
      ? "rgba(16, 185, 129, 0.3)"
      : "rgba(255, 255, 255, 0.08)";
  };

  return (
    <header ref={headerRef} style={styles.header}>
      {/* Background Layers */}
      <div style={styles.background} aria-hidden="true" />
      <div style={styles.overlay} aria-hidden="true" />
      <div style={styles.noiseOverlay} aria-hidden="true" />
      <div style={styles.pattern} aria-hidden="true" />

      {/* Floating Orbs */}
      <div
        style={{
          ...styles.floatingOrb,
          width: "400px",
          height: "400px",
          top: "-150px",
          left: "-100px",
          animationDelay: "0s",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          ...styles.floatingOrb,
          width: "300px",
          height: "300px",
          bottom: "-50px",
          right: "-80px",
          animationDelay: "-3s",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          ...styles.floatingOrb,
          width: "200px",
          height: "200px",
          top: "30%",
          right: "15%",
          animationDelay: "-5s",
        }}
        aria-hidden="true"
      />

      {/* Corner Accents */}
      <div
        style={{
          ...styles.cornerAccent,
          top: "-100px",
          right: "-100px",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          ...styles.cornerAccent,
          bottom: "-100px",
          left: "-100px",
          width: "150px",
          height: "150px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div style={styles.content}>
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav style={styles.breadcrumbs} aria-label="Breadcrumb navigation">
            <Link
              to="/"
              style={styles.breadcrumbLink}
              onMouseEnter={(e) => handleBreadcrumbHover(e, true)}
              onMouseLeave={(e) => handleBreadcrumbHover(e, false)}
            >
              <FiHome size={13} />
              <span>Home</span>
            </Link>

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.label || index}>
                <span style={styles.breadcrumbSeparator}>
                  <FiChevronRight size={14} />
                </span>
                {index === breadcrumbs.length - 1 || !crumb.path ? (
                  <span style={styles.breadcrumbCurrent}>{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    style={styles.breadcrumbLink}
                    onMouseEnter={(e) => handleBreadcrumbHover(e, true)}
                    onMouseLeave={(e) => handleBreadcrumbHover(e, false)}
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Decorative Line */}
        <div style={styles.decorativeLine} aria-hidden="true">
          <div style={styles.line} />
          <div style={styles.diamond} />
          <div style={styles.line} />
        </div>

        {/* Tagline */}
        {tagline && (
          <span style={styles.tagline}>
            <span style={styles.taglineDot} />
            {tagline}
          </span>
        )}

        {/* Title */}
        <h1 style={styles.title}>{title}</h1>

        {/* Subtitle */}
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}

        {/* Children */}
        {children && <div style={styles.childrenContainer}>{children}</div>}
      </div>

      {/* Bottom Fade */}
      <div style={styles.bottomFade} aria-hidden="true" />
    </header>
  );
};

export default PageHeader;