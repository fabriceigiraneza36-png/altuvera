import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM - GREEN & WHITE THEME
   ═══════════════════════════════════════════════════ */

const theme = {
  // Primary Colors (Green)
  primary: "#059669",
  primaryDark: "#047857",
  primaryDarker: "#065F46",
  primaryLight: "#D1FAE5",
  primaryMuted: "#ECFDF5",
  
  // Accent Colors
  accent: "#10B981",
  accentLight: "#A7F3D0",
  
  // Neutral Colors
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  
  // Semantic Colors
  success: "#10B981",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
  star: "#FBBF24",
  
  // Typography
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSerif: "'Playfair Display', Georgia, serif",
  
  // Layout
  containerMax: "1280px",
  containerNarrow: "960px",
  
  // Spacing
  sectionPy: "96px",
  sectionPyMobile: "64px",
  
  // Borders & Shadows
  radiusXs: "4px",
  radiusSm: "8px",
  radiusMd: "12px",
  radiusLg: "16px",
  radiusXl: "24px",
  radiusFull: "9999px",
  
  shadowXs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowSm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  shadowXl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  shadow2xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  
  // Transitions
  transitionFast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  transitionBase: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  transitionSlow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════ */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&display=swap');
    
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Animations */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .skeleton {
      background: linear-gradient(
        90deg,
        ${theme.gray200} 25%,
        ${theme.gray100} 50%,
        ${theme.gray200} 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    .fade-in-up {
      animation: fadeInUp 0.6s ease forwards;
    }
    
    .fade-in {
      animation: fadeIn 0.4s ease forwards;
    }
    
    .scale-in {
      animation: scaleIn 0.3s ease forwards;
    }
    
    .hover-lift {
      transition: transform ${theme.transitionBase}, box-shadow ${theme.transitionBase};
    }
    
    .hover-lift:hover {
      transform: translateY(-6px);
      box-shadow: ${theme.shadowXl};
    }
    
    .hover-scale {
      transition: transform ${theme.transitionSlow};
    }
    
    .hover-scale:hover {
      transform: scale(1.02);
    }
    
    .img-zoom {
      transition: transform ${theme.transitionSlow};
    }
    
    .img-zoom:hover {
      transform: scale(1.08);
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.gray100};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.gray300};
      border-radius: 5px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.gray400};
    }
    
    /* Focus Styles */
    *:focus-visible {
      outline: 2px solid ${theme.primary};
      outline-offset: 2px;
    }
    
    /* Selection */
    ::selection {
      background: ${theme.primaryLight};
      color: ${theme.primaryDarker};
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    ...size,
    isMobile: size.width < 768,
    isTablet: size.width >= 768 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
};

/* ═══════════════════════════════════════════════════
   SKELETON COMPONENTS
   ═══════════════════════════════════════════════════ */

const Skeleton = ({ 
  width = "100%", 
  height = "20px", 
  radius = theme.radiusSm,
  style = {},
  className = ""
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius: radius,
      ...style,
    }}
  />
);

const SkeletonText = ({ lines = 3, lastWidth = "60%" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height="16px" 
        width={i === lines - 1 ? lastWidth : "100%"} 
      />
    ))}
  </div>
);

const LoadingSkeleton = ({ isMobile }) => (
  <div style={{ background: theme.white, minHeight: "100vh" }}>
    {/* Hero Skeleton */}
    <div style={{ position: "relative", height: isMobile ? "60vh" : "75vh" }}>
      <Skeleton width="100%" height="100%" radius="0" />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: isMobile ? "32px 20px" : "64px 48px",
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
        }}
      >
        <div style={{ maxWidth: theme.containerMax, margin: "0 auto" }}>
          <Skeleton width="120px" height="28px" style={{ marginBottom: 16 }} />
          <Skeleton 
            width={isMobile ? "90%" : "500px"} 
            height={isMobile ? "36px" : "52px"} 
            style={{ marginBottom: 16 }} 
          />
          <Skeleton 
            width={isMobile ? "100%" : "400px"} 
            height="24px" 
            style={{ marginBottom: 32 }} 
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[100, 80, 120, 90].map((w, i) => (
              <Skeleton key={i} width={`${w}px`} height="36px" radius={theme.radiusFull} />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Quick Info Bar Skeleton */}
    <div
      style={{
        background: theme.white,
        borderBottom: `1px solid ${theme.gray200}`,
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: theme.containerMax,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
          gap: 24,
        }}
      >
        {Array.from({ length: isMobile ? 4 : 5 }).map((_, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <Skeleton width="40px" height="40px" radius="50%" style={{ margin: "0 auto 12px" }} />
            <Skeleton width="60%" height="12px" style={{ margin: "0 auto 8px" }} />
            <Skeleton width="80%" height="18px" style={{ margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </div>

    {/* Content Skeleton */}
    <div style={{ maxWidth: theme.containerMax, margin: "0 auto", padding: isMobile ? "48px 20px" : "80px 48px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: 48,
        }}
      >
        {/* Main Content */}
        <div>
          <Skeleton width="180px" height="32px" style={{ marginBottom: 24 }} />
          <SkeletonText lines={6} />
          
          <div style={{ marginTop: 48 }}>
            <Skeleton width="150px" height="28px" style={{ marginBottom: 24 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Skeleton width="24px" height="24px" radius="50%" />
                  <Skeleton width="70%" height="18px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div
            style={{
              background: theme.gray50,
              borderRadius: theme.radiusLg,
              padding: 24,
            }}
          >
            <Skeleton width="100%" height="48px" radius={theme.radiusMd} style={{ marginBottom: 20 }} />
            <Skeleton width="60%" height="20px" style={{ marginBottom: 24 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <Skeleton width="40%" height="16px" />
                  <Skeleton width="50%" height="16px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Skeleton */}
      <div style={{ marginTop: 80 }}>
        <Skeleton width="140px" height="32px" style={{ marginBottom: 32 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="100%" style={{ paddingBottom: "75%" }} radius={theme.radiusMd} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════ */

const Container = ({ children, narrow = false, style = {} }) => (
  <div
    style={{
      maxWidth: narrow ? theme.containerNarrow : theme.containerMax,
      margin: "0 auto",
      padding: "0 24px",
      width: "100%",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon,
  style = {} 
}) => {
  const variants = {
    primary: { bg: theme.primaryLight, color: theme.primaryDark },
    accent: { bg: theme.accentLight, color: theme.primaryDarker },
    white: { bg: "rgba(255,255,255,0.2)", color: theme.white, border: "1px solid rgba(255,255,255,0.3)" },
    whiteSolid: { bg: theme.white, color: theme.gray800 },
    gray: { bg: theme.gray100, color: theme.gray700 },
    success: { bg: "#D1FAE5", color: "#065F46" },
    warning: { bg: "#FEF3C7", color: "#92400E" },
    info: { bg: "#DBEAFE", color: "#1E40AF" },
    dark: { bg: "rgba(0,0,0,0.6)", color: theme.white },
  };

  const sizes = {
    xs: { padding: "4px 8px", fontSize: 10, gap: 4 },
    sm: { padding: "5px 12px", fontSize: 11, gap: 5 },
    md: { padding: "6px 14px", fontSize: 12, gap: 6 },
    lg: { padding: "8px 18px", fontSize: 14, gap: 8 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        background: v.bg,
        color: v.color,
        border: v.border || "none",
        fontWeight: 600,
        fontFamily: theme.fontSans,
        borderRadius: theme.radiusFull,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
        ...s,
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: s.fontSize + 2 }}>{icon}</span>}
      {children}
    </span>
  );
};

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon,
  iconRight,
  fullWidth = false,
  as: Component = "button",
  style = {},
  ...props 
}) => {
  const variants = {
    primary: {
      background: theme.primary,
      color: theme.white,
      border: "none",
      hoverBg: theme.primaryDark,
    },
    secondary: {
      background: theme.white,
      color: theme.primary,
      border: `2px solid ${theme.primary}`,
      hoverBg: theme.primaryMuted,
    },
    outline: {
      background: "transparent",
      color: theme.gray700,
      border: `2px solid ${theme.gray300}`,
      hoverBg: theme.gray50,
    },
    ghost: {
      background: "transparent",
      color: theme.primary,
      border: "none",
      hoverBg: theme.primaryMuted,
    },
    white: {
      background: theme.white,
      color: theme.gray800,
      border: "none",
      hoverBg: theme.gray100,
    },
    dark: {
      background: theme.gray900,
      color: theme.white,
      border: "none",
      hoverBg: theme.gray800,
    },
  };

  const sizes = {
    sm: { padding: "10px 18px", fontSize: 13, gap: 6 },
    md: { padding: "14px 28px", fontSize: 15, gap: 8 },
    lg: { padding: "18px 36px", fontSize: 16, gap: 10 },
    xl: { padding: "20px 44px", fontSize: 17, gap: 12 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <Component
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        fontFamily: theme.fontSans,
        fontWeight: 600,
        borderRadius: theme.radiusMd,
        cursor: "pointer",
        textDecoration: "none",
        transition: `all ${theme.transitionBase}`,
        width: fullWidth ? "100%" : "auto",
        background: v.background,
        color: v.color,
        border: v.border,
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = v.hoverBg || v.background;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.transform = "translateY(0)";
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
      {iconRight && <span>{iconRight}</span>}
    </Component>
  );
};

const Card = ({ 
  children, 
  hover = true, 
  padding,
  style = {},
  className = "",
  ...props 
}) => (
  <div
    className={`${hover ? "hover-lift" : ""} ${className}`}
    style={{
      background: theme.white,
      borderRadius: theme.radiusLg,
      border: `1px solid ${theme.gray200}`,
      overflow: "hidden",
      padding: padding,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, subtitle, align = "left", isMobile }) => (
  <div style={{ textAlign: align, marginBottom: isMobile ? 32 : 48 }}>
    <h2
      style={{
        fontFamily: theme.fontSerif,
        fontSize: isMobile ? 28 : 40,
        fontWeight: 700,
        color: theme.gray900,
        margin: 0,
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
    {subtitle && (
      <p
        style={{
          fontSize: isMobile ? 16 : 18,
          color: theme.gray500,
          margin: "12px 0 0",
          lineHeight: 1.6,
          maxWidth: align === "center" ? 600 : "none",
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const IconBox = ({ icon, size = 48, bg = theme.primaryMuted, color = theme.primary }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      color,
      flexShrink: 0,
    }}
  >
    {icon}
  </div>
);

const Divider = ({ style = {} }) => (
  <hr
    style={{
      border: "none",
      height: 1,
      background: theme.gray200,
      margin: "32px 0",
      ...style,
    }}
  />
);

/* ═══════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════ */

const Hero = ({ destination, isMobile }) => {
  const d = destination;

  return (
    <section
      style={{
        position: "relative",
        height: isMobile ? "75vh" : "85vh",
        minHeight: 550,
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${d.heroImage || d.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,0.3) 40%,
            rgba(0,0,0,0.75) 100%
          )`,
        }}
      />

      {/* Green Accent Line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: theme.primary,
        }}
      />

      {/* Content */}
      <Container
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: isMobile ? 48 : 72,
        }}
      >
        <div className="fade-in-up" style={{ maxWidth: 800 }}>
          {/* Breadcrumb / Country */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Link
              to={`/countries/${d.countrySlug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {d.country?.flag && <span style={{ fontSize: 20 }}>{d.country.flag}</span>}
              <span>{d.countryName || d.country?.name}</span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>{d.region}</span>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {d.isFeatured && <Badge variant="primary" size="md" icon="⭐">Featured</Badge>}
            {d.isPopular && <Badge variant="warning" size="md" icon="🔥">Popular</Badge>}
            {d.isNew && <Badge variant="info" size="md" icon="✨">New</Badge>}
            {d.isEcoFriendly && <Badge variant="success" size="md" icon="🌿">Eco-Friendly</Badge>}
            {d.destinationType && <Badge variant="white" size="md">{d.destinationType}</Badge>}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: theme.fontSerif,
              fontSize: isMobile ? 36 : 56,
              fontWeight: 800,
              color: theme.white,
              margin: "0 0 16px",
              lineHeight: 1.1,
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            {d.name}
          </h1>

          {/* Tagline */}
          {d.tagline && (
            <p
              style={{
                fontSize: isMobile ? 18 : 24,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 28px",
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {d.tagline}
            </p>
          )}

          {/* Rating & Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: isMobile ? 16 : 24 }}>
            {d.rating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(251, 191, 36, 0.2)",
                    padding: "8px 14px",
                    borderRadius: theme.radiusFull,
                  }}
                >
                  <span style={{ color: theme.star, fontSize: 18 }}>★</span>
                  <span style={{ color: theme.white, fontWeight: 700, fontSize: 16 }}>
                    {d.rating}
                  </span>
                </div>
                {d.reviewCount > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                    ({d.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}
            
            {d.duration && (
              <Badge variant="dark" size="lg" icon="🕐">
                {d.duration}
              </Badge>
            )}
            
            {d.category && (
              <Badge variant="dark" size="lg">
                {d.category}
              </Badge>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK INFO BAR
   ═══════════════════════════════════════════════════ */

const QuickInfoBar = ({ destination, isMobile }) => {
  const d = destination;

  const infoItems = [
    {
      icon: "🕐",
      label: "Duration",
      value: d.duration || `${d.durationDays} Days`,
      show: d.duration || d.durationDays,
    },
    {
      icon: "📊",
      label: "Difficulty",
      value: d.difficulty || d.fitnessLevel,
      show: d.difficulty || d.fitnessLevel,
      badge: true,
    },
    {
      icon: "👥",
      label: "Group Size",
      value: d.minGroupSize && d.maxGroupSize 
        ? `${d.minGroupSize} - ${d.maxGroupSize}` 
        : d.maxGroupSize ? `Up to ${d.maxGroupSize}` : null,
      show: d.minGroupSize || d.maxGroupSize,
    },
    {
      icon: "⭐",
      label: "Rating",
      value: d.rating ? `${d.rating} / 5` : null,
      show: d.rating,
      highlight: true,
    },
    {
      icon: "🎫",
      label: "Entry Fee",
      value: d.entranceFee,
      show: d.entranceFee,
    },
  ].filter(item => item.show);

  if (infoItems.length === 0) return null;

  return (
    <section
      style={{
        background: theme.white,
        borderBottom: `1px solid ${theme.gray200}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: theme.shadowSm,
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile 
              ? `repeat(${Math.min(infoItems.length, 2)}, 1fr)` 
              : `repeat(${Math.min(infoItems.length, 5)}, 1fr)`,
            gap: isMobile ? 16 : 0,
            padding: isMobile ? "20px 0" : "24px 0",
          }}
        >
          {infoItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: isMobile ? "12px" : "16px 24px",
                borderRight: !isMobile && i < infoItems.length - 1 
                  ? `1px solid ${theme.gray200}` 
                  : "none",
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: theme.gray500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </span>
              {item.badge ? (
                <Badge 
                  variant={item.value === "easy" ? "success" : item.value === "moderate" ? "warning" : "info"} 
                  size="sm"
                >
                  {item.value}
                </Badge>
              ) : (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: item.highlight ? theme.primary : theme.gray800,
                  }}
                >
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   OVERVIEW SECTION
   ═══════════════════════════════════════════════════ */

const Overview = ({ destination, isMobile }) => {
  const d = destination;
  const description = d.description || d.shortDescription;

  if (!description && !d.overview) return null;

  return (
    <section
      style={{
        background: theme.white,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
            gap: isMobile ? 48 : 64,
            alignItems: "start",
          }}
        >
          {/* Main Content */}
          <div>
            <SectionTitle isMobile={isMobile}>
              About This Destination
            </SectionTitle>

            {/* Overview Box */}
            {d.overview && (
              <div
                style={{
                  background: theme.primaryMuted,
                  borderLeft: `4px solid ${theme.primary}`,
                  borderRadius: `0 ${theme.radiusMd} ${theme.radiusMd} 0`,
                  padding: isMobile ? 20 : 28,
                  marginBottom: 32,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 500,
                    color: theme.primaryDarker,
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  {d.overview}
                </p>
              </div>
            )}

            {/* Description */}
            {description && (
              <div style={{ fontSize: 16, lineHeight: 1.85, color: theme.gray600 }}>
                {description.split("\n\n").map((paragraph, i) => (
                  <p key={i} style={{ margin: i > 0 ? "24px 0 0" : 0 }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Key Info Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              {d.isFamilyFriendly && (
                <Badge variant="success" size="lg" icon="👨‍👩‍👧‍👦">
                  Family Friendly
                </Badge>
              )}
              {d.isEcoFriendly && (
                <Badge variant="primary" size="lg" icon="🌿">
                  Eco-Friendly
                </Badge>
              )}
              {d.minAge && (
                <Badge variant="info" size="lg" icon="📋">
                  Min Age: {d.minAge}+
                </Badge>
              )}
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div style={{ position: "sticky", top: 100 }}>
            <Card hover={false} style={{ border: `2px solid ${theme.primary}` }}>
              {/* Price / CTA Header */}
              <div
                style={{
                  background: theme.primary,
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 500,
                  }}
                >
                  Starting from
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 800,
                    color: theme.white,
                    fontFamily: theme.fontSans,
                  }}
                >
                  {d.entranceFee || "Contact for Price"}
                </p>
              </div>

              <div style={{ padding: 24 }}>
                <Button fullWidth size="lg" style={{ marginBottom: 16 }}>
                  Book Now
                </Button>
                <Button variant="outline" fullWidth size="md">
                  Contact Us
                </Button>

                <Divider />

                {/* Quick Facts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {d.operatingHours && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconBox icon="🕐" size={40} />
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: theme.gray500, fontWeight: 500 }}>
                          Operating Hours
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: theme.gray800, fontWeight: 600 }}>
                          {d.operatingHours}
                        </p>
                      </div>
                    </div>
                  )}

                  {d.nearestCity && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconBox icon="🏙️" size={40} />
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: theme.gray500, fontWeight: 500 }}>
                          Nearest City
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: theme.gray800, fontWeight: 600 }}>
                          {d.nearestCity}
                        </p>
                      </div>
                    </div>
                  )}

                  {d.nearestAirport && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconBox icon="✈️" size={40} />
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: theme.gray500, fontWeight: 500 }}>
                          Nearest Airport
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: theme.gray800, fontWeight: 600 }}>
                          {d.nearestAirport}
                        </p>
                      </div>
                    </div>
                  )}

                  {d.altitudeMeters && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconBox icon="⛰️" size={40} />
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: theme.gray500, fontWeight: 500 }}>
                          Altitude
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: theme.gray800, fontWeight: 600 }}>
                          {d.altitudeMeters.toLocaleString()}m
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   HIGHLIGHTS SECTION
   ═══════════════════════════════════════════════════ */

const Highlights = ({ destination, isMobile }) => {
  const highlights = destination.highlights || [];

  if (highlights.length === 0) return null;

  return (
    <section
      style={{
        background: theme.gray50,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle={`What makes ${destination.name} special`}
          isMobile={isMobile}
        >
          Highlights
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {highlights.map((highlight, i) => (
            <Card
              key={i}
              padding={isMobile ? 24 : 32}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.white,
                  fontWeight: 800,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  color: theme.gray700,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {highlight}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   ACTIVITIES SECTION
   ═══════════════════════════════════════════════════ */

const Activities = ({ destination, isMobile }) => {
  const activities = destination.activities || [];

  if (activities.length === 0) return null;

  const activityIcons = {
    "Game drives": "🚙",
    "Hot air balloon safari": "🎈",
    "Bush walks": "🚶",
    "Cultural village visits": "🏘️",
    "Bird watching": "🦅",
    "Photography safaris": "📷",
    "Night game drives": "🌙",
    "Bush breakfast": "🍳",
    "default": "✨",
  };

  return (
    <section
      style={{
        background: theme.white,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle="Experiences awaiting you"
          isMobile={isMobile}
        >
          Things To Do
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {activities.map((activity, i) => (
            <Card
              key={i}
              padding={24}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: theme.primaryMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto 16px",
                }}
              >
                {activityIcons[activity] || activityIcons.default}
              </div>
              <h4
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: theme.gray800,
                }}
              >
                {activity}
              </h4>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE SECTION
   ═══════════════════════════════════════════════════ */

const Wildlife = ({ destination, isMobile }) => {
  const wildlife = destination.wildlife || [];

  if (wildlife.length === 0) return null;

  const animalIcons = {
    "Lion": "🦁",
    "Leopard": "🐆",
    "Cheetah": "🐆",
    "African Elephant": "🐘",
    "Elephant": "🐘",
    "Cape Buffalo": "🐃",
    "Buffalo": "🐃",
    "Wildebeest": "🦬",
    "Zebra": "🦓",
    "Hippopotamus": "🦛",
    "Nile Crocodile": "🐊",
    "Crocodile": "🐊",
    "Giraffe": "🦒",
    "Hyena": "🐺",
    "African Wild Dog": "🐕",
    "Rhinoceros": "🦏",
    "Rhino": "🦏",
    "default": "🦌",
  };

  return (
    <section
      style={{
        background: theme.gray50,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle={`Incredible species you may encounter at ${destination.name}`}
          isMobile={isMobile}
        >
          Wildlife
        </SectionTitle>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {wildlife.map((animal, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: theme.white,
                padding: "14px 22px",
                borderRadius: theme.radiusFull,
                border: `1px solid ${theme.gray200}`,
                boxShadow: theme.shadowSm,
                transition: `all ${theme.transitionBase}`,
              }}
              className="hover-lift"
            >
              <span style={{ fontSize: 24 }}>
                {animalIcons[animal] || animalIcons.default}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: theme.gray700,
                }}
              >
                {animal}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   GALLERY SECTION
   ═══════════════════════════════════════════════════ */

const Gallery = ({ destination, isMobile }) => {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  
  const gallery = destination.gallery || [];
  const images = gallery.length > 0 
    ? gallery.map(g => g.imageUrl) 
    : destination.images || [];

  if (images.length === 0) return null;

  return (
    <section
      style={{
        background: theme.white,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle="Stunning visuals from this destination"
          isMobile={isMobile}
        >
          Photo Gallery
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile 
              ? "repeat(2, 1fr)" 
              : images.length <= 4 
                ? "repeat(4, 1fr)" 
                : "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {images.slice(0, 8).map((img, i) => (
            <div
              key={i}
              onClick={() => setLightbox({ open: true, index: i })}
              style={{
                position: "relative",
                paddingBottom: i === 0 && !isMobile ? "100%" : "75%",
                gridColumn: i === 0 && !isMobile && images.length > 4 ? "span 2" : "span 1",
                gridRow: i === 0 && !isMobile && images.length > 4 ? "span 2" : "span 1",
                borderRadius: theme.radiusMd,
                overflow: "hidden",
                cursor: "pointer",
              }}
              className="hover-scale"
            >
              <img
                src={img}
                alt={`${destination.name} - Photo ${i + 1}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className="img-zoom"
              />
              {/* Hover Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: `all ${theme.transitionBase}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.4)";
                  e.currentTarget.querySelector("span").style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0)";
                  e.currentTarget.querySelector("span").style.opacity = 0;
                }}
              >
                <span
                  style={{
                    color: theme.white,
                    fontSize: 32,
                    opacity: 0,
                    transition: `opacity ${theme.transitionBase}`,
                  }}
                >
                  🔍
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox.open && (
          <div
            onClick={() => setLightbox({ ...lightbox, open: false })}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.95)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
            className="fade-in"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightbox({ ...lightbox, open: false })}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: theme.white,
                width: 48,
                height: 48,
                borderRadius: "50%",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            {/* Main Image */}
            <img
              src={images[lightbox.index]}
              alt=""
              style={{
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: theme.radiusMd,
              }}
              onClick={(e) => e.stopPropagation()}
              className="scale-in"
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({
                      ...lightbox,
                      index: (lightbox.index - 1 + images.length) % images.length,
                    });
                  }}
                  style={{
                    position: "absolute",
                    left: 24,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: theme.white,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    fontSize: 24,
                    cursor: "pointer",
                  }}
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox({
                      ...lightbox,
                      index: (lightbox.index + 1) % images.length,
                    });
                  }}
                  style={{
                    position: "absolute",
                    right: 24,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: theme.white,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    fontSize: 24,
                    cursor: "pointer",
                  }}
                >
                  →
                </button>
              </>
            )}

            {/* Counter */}
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
              }}
            >
              {lightbox.index + 1} / {images.length}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   LOCATION & MAP SECTION
   ═══════════════════════════════════════════════════ */

const Location = ({ destination, isMobile }) => {
  const d = destination;
  const hasLocation = d.latitude && d.longitude;
  const hasInfo = d.region || d.nearestCity || d.nearestAirport || d.gettingThere;

  if (!hasLocation && !hasInfo) return null;

  return (
    <section
      style={{
        background: theme.gray50,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle="How to get there and where it's located"
          isMobile={isMobile}
        >
          Location & Access
        </SectionTitle>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 32,
          }}
        >
          {/* Map */}
          {hasLocation && (
            <Card hover={false} style={{ overflow: "hidden", height: 400 }}>
              <iframe
                title="Location Map"
                src={`https://www.google.com/maps?q=${d.latitude},${d.longitude}&z=12&output=embed`}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                loading="lazy"
                allowFullScreen
              />
            </Card>
          )}

          {/* Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {d.region && (
              <Card padding={24} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <IconBox icon="📍" size={56} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: theme.gray500, fontWeight: 500 }}>
                    Region
                  </p>
                  <p style={{ margin: 0, fontSize: 18, color: theme.gray800, fontWeight: 700 }}>
                    {d.region}
                  </p>
                </div>
              </Card>
            )}

            {d.nearestCity && (
              <Card padding={24} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <IconBox icon="🏙️" size={56} bg={theme.accentLight} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: theme.gray500, fontWeight: 500 }}>
                    Nearest City
                  </p>
                  <p style={{ margin: 0, fontSize: 18, color: theme.gray800, fontWeight: 700 }}>
                    {d.nearestCity}
                  </p>
                </div>
              </Card>
            )}

            {d.nearestAirport && (
              <Card padding={24} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <IconBox icon="✈️" size={56} bg={theme.infoLight} color={theme.info} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: theme.gray500, fontWeight: 500 }}>
                    Nearest Airport
                  </p>
                  <p style={{ margin: 0, fontSize: 18, color: theme.gray800, fontWeight: 700 }}>
                    {d.nearestAirport}
                  </p>
                  {d.distanceFromAirportKm && (
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: theme.gray500 }}>
                      {d.distanceFromAirportKm} km away
                    </p>
                  )}
                </div>
              </Card>
            )}

            {d.gettingThere && (
              <Card padding={24}>
                <h4 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: theme.gray800 }}>
                  Getting There
                </h4>
                <p style={{ margin: 0, fontSize: 15, color: theme.gray600, lineHeight: 1.7 }}>
                  {d.gettingThere}
                </p>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   PRACTICAL INFO SECTION
   ═══════════════════════════════════════════════════ */

const PracticalInfo = ({ destination, isMobile }) => {
  const d = destination;
  
  const infoItems = [
    { icon: "🎫", label: "Entrance Fee", value: d.entranceFee },
    { icon: "🕐", label: "Operating Hours", value: d.operatingHours },
    { icon: "📅", label: "Best Time to Visit", value: d.bestTimeToVisit },
    { icon: "👥", label: "Group Size", value: d.minGroupSize && d.maxGroupSize ? `${d.minGroupSize} - ${d.maxGroupSize} people` : null },
    { icon: "👶", label: "Minimum Age", value: d.minAge ? `${d.minAge} years` : null },
    { icon: "💪", label: "Fitness Level", value: d.fitnessLevel },
  ].filter(item => item.value);

  const hasInfo = infoItems.length > 0 || d.whatToExpect || d.localTips || d.safetyInfo;

  if (!hasInfo) return null;

  return (
    <section
      style={{
        background: theme.white,
        padding: isMobile ? "64px 0" : "96px 0",
      }}
    >
      <Container>
        <SectionTitle
          subtitle="Everything you need to plan your visit"
          isMobile={isMobile}
        >
          Practical Information
        </SectionTitle>

        {/* Info Grid */}
        {infoItems.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 48,
            }}
          >
            {infoItems.map((item, i) => (
              <Card key={i} padding={24}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 32 }}>{item.icon}</span>
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: 12,
                        color: theme.gray500,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 16,
                        color: theme.gray800,
                        fontWeight: 600,
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: 24,
          }}
        >
          {d.whatToExpect && (
            <Card hover={false}>
              <div
                style={{
                  padding: "20px 24px",
                  background: theme.primaryMuted,
                  borderBottom: `1px solid ${theme.primaryLight}`,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: theme.primaryDark,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>📋</span> What to Expect
                </h4>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 15, color: theme.gray600, lineHeight: 1.7 }}>
                  {d.whatToExpect}
                </p>
              </div>
            </Card>
          )}

          {d.localTips && (
            <Card hover={false}>
              <div
                style={{
                  padding: "20px 24px",
                  background: theme.warningLight,
                  borderBottom: `1px solid ${theme.warning}30`,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#92400E",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>💡</span> Local Tips
                </h4>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 15, color: theme.gray600, lineHeight: 1.7 }}>
                  {d.localTips}
                </p>
              </div>
            </Card>
          )}

          {d.safetyInfo && (
            <Card hover={false} style={{ gridColumn: isMobile ? "span 1" : "span 2" }}>
              <div
                style={{
                  padding: "20px 24px",
                  background: "#FEF2F2",
                  borderBottom: "1px solid #FECACA",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#991B1B",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>⚠️</span> Safety Information
                </h4>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ margin: 0, fontSize: 15, color: theme.gray600, lineHeight: 1.7 }}>
                  {d.safetyInfo}
                </p>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   CTA FOOTER SECTION
   ═══════════════════════════════════════════════════ */

const CTAFooter = ({ destination, isMobile }) => {
  const d = destination;

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDarker} 100%)`,
        padding: isMobile ? "72px 24px" : "120px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Container style={{ position: "relative" }}>
        <h2
          style={{
            fontFamily: theme.fontSerif,
            fontSize: isMobile ? 32 : 48,
            fontWeight: 800,
            color: theme.white,
            margin: "0 0 20px",
            lineHeight: 1.2,
          }}
        >
          Ready to Experience {d.name}?
        </h2>
        <p
          style={{
            fontSize: isMobile ? 17 : 20,
            color: "rgba(255,255,255,0.9)",
            maxWidth: 600,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Start planning your unforgettable adventure today. Book now and create memories that will last a lifetime.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button variant="white" size="lg" icon="📅">
            Book This Experience
          </Button>
          <Button
            variant="secondary"
            size="lg"
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.4)",
              color: theme.white,
            }}
            as={Link}
            to={`/countries/${d.countrySlug}`}
          >
            Explore More in {d.countryName}
          </Button>
        </div>

        {/* Trust Badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? 24 : 48,
            marginTop: 48,
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Top Rated</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Verified</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Secure Booking</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>24/7 Support</div>
          </div>
        </div>
      </Container>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════ */

const ErrorState = ({ error, navigate }) => (
  <div
    style={{
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: theme.fontSans,
      padding: 48,
      textAlign: "center",
      background: theme.gray50,
    }}
  >
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: theme.primaryMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 64,
        marginBottom: 32,
      }}
    >
      🗺️
    </div>
    <h2
      style={{
        fontFamily: theme.fontSerif,
        fontSize: 36,
        fontWeight: 700,
        color: theme.gray800,
        margin: "0 0 16px",
      }}
    >
      Destination Not Found
    </h2>
    <p
      style={{
        fontSize: 18,
        color: theme.gray500,
        maxWidth: 500,
        margin: "0 0 36px",
        lineHeight: 1.6,
      }}
    >
      {error || "The destination you're looking for doesn't exist or may have been removed."}
    </p>
    <div style={{ display: "flex", gap: 16 }}>
      <Button onClick={() => navigate(-1)} variant="outline" size="lg">
        Go Back
      </Button>
      <Button onClick={() => navigate("/destinations")} size="lg">
        Browse Destinations
      </Button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   API FUNCTION
   ═══════════════════════════════════════════════════ */

const fetchDestinationData = async (slug) => {
  const response = await fetch(`/api/destinations/${slug}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || "Failed to fetch destination");
  }
  
  return data.data;
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

const DestinationDetails = () => {
  const { slug, id } = useParams();
  const destinationSlug = slug || id;
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch destination data
  useEffect(() => {
    if (!destinationSlug) return;

    setLoading(true);
    setError(null);

    fetchDestinationData(destinationSlug)
      .then((data) => {
        setDestination(data);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [destinationSlug]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [destinationSlug]);

  // Loading state
  if (loading) {
    return (
      <div style={{ fontFamily: theme.fontSans }}>
        <GlobalStyles />
        <LoadingSkeleton isMobile={isMobile} />
      </div>
    );
  }

  // Error state
  if (error || !destination) {
    return (
      <div style={{ fontFamily: theme.fontSans }}>
        <GlobalStyles />
        <ErrorState error={error} navigate={navigate} />
      </div>
    );
  }

  // Success - Render destination
  return (
    <div
      style={{
        fontFamily: theme.fontSans,
        color: theme.gray800,
        background: theme.white,
      }}
    >
      <GlobalStyles />

      <Hero destination={destination} isMobile={isMobile} />
      <QuickInfoBar destination={destination} isMobile={isMobile} />
      
      <div className="fade-in-up">
        <Overview destination={destination} isMobile={isMobile} />
        <Highlights destination={destination} isMobile={isMobile} />
        <Activities destination={destination} isMobile={isMobile} />
        <Wildlife destination={destination} isMobile={isMobile} />
        <Gallery destination={destination} isMobile={isMobile} />
        <Location destination={destination} isMobile={isMobile} />
        <PracticalInfo destination={destination} isMobile={isMobile} />
      </div>

      <CTAFooter destination={destination} isMobile={isMobile} />
    </div>
  );
};

export default DestinationDetails;