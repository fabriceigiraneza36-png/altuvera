import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchCountryPageData } from "../data/countries";

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM - GREEN & WHITE THEME
   ═══════════════════════════════════════════════════ */

const theme = {
  // Primary Colors
  primary: "#059669",
  primaryDark: "#047857",
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
  
  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  
  // Typography
  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSerif: "'Playfair Display', Georgia, serif",
  
  // Spacing
  containerMax: "1280px",
  sectionPadding: "80px",
  sectionPaddingMobile: "48px",
  
  // Borders & Shadows
  radiusSm: "8px",
  radiusMd: "12px",
  radiusLg: "16px",
  radiusXl: "24px",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  shadowXl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  
  // Transitions
  transitionFast: "150ms ease",
  transitionBase: "200ms ease",
  transitionSlow: "300ms ease",
};

/* ═══════════════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════════════ */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    .skeleton {
      background: linear-gradient(
        90deg,
        ${theme.gray200} 25%,
        ${theme.gray100} 50%,
        ${theme.gray200} 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: ${theme.radiusSm};
    }
    
    .fade-in {
      animation: fade-in 0.6s ease forwards;
    }
    
    .hover-lift {
      transition: transform ${theme.transitionBase}, box-shadow ${theme.transitionBase};
    }
    
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: ${theme.shadowXl};
    }
    
    .hover-scale img {
      transition: transform ${theme.transitionSlow};
    }
    
    .hover-scale:hover img {
      transform: scale(1.05);
    }
    
    .nav-item {
      position: relative;
      transition: color ${theme.transitionFast};
    }
    
    .nav-item::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: ${theme.primary};
      transition: width ${theme.transitionBase};
    }
    
    .nav-item:hover::after,
    .nav-item.active::after {
      width: 100%;
    }
    
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.gray100};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.gray300};
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.gray400};
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
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

const SkeletonBox = ({ width = "100%", height = "20px", radius = theme.radiusSm, style = {} }) => (
  <div
    className="skeleton"
    style={{
      width,
      height,
      borderRadius: radius,
      ...style,
    }}
  />
);

const SkeletonHero = ({ isMobile }) => (
  <div style={{ position: "relative", height: isMobile ? "70vh" : "80vh", background: theme.gray200 }}>
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? "32px 20px" : "64px 48px",
        background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
      }}
    >
      <div style={{ maxWidth: theme.containerMax, margin: "0 auto" }}>
        <SkeletonBox width="120px" height="32px" style={{ marginBottom: 16 }} />
        <SkeletonBox width={isMobile ? "80%" : "400px"} height={isMobile ? "36px" : "56px"} style={{ marginBottom: 16 }} />
        <SkeletonBox width={isMobile ? "100%" : "600px"} height="24px" style={{ marginBottom: 8 }} />
        <SkeletonBox width={isMobile ? "70%" : "400px"} height="24px" style={{ marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <SkeletonBox width="140px" height="48px" radius={theme.radiusMd} />
          <SkeletonBox width="160px" height="48px" radius={theme.radiusMd} />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonNav = () => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: theme.white,
      borderBottom: `1px solid ${theme.gray200}`,
      padding: "16px 24px",
    }}
  >
    <div
      style={{
        maxWidth: theme.containerMax,
        margin: "0 auto",
        display: "flex",
        gap: 24,
      }}
    >
      {[80, 100, 90, 110, 85, 95].map((w, i) => (
        <SkeletonBox key={i} width={`${w}px`} height="20px" />
      ))}
    </div>
  </div>
);

const SkeletonQuickFacts = ({ isMobile }) => (
  <div style={{ background: theme.white, padding: isMobile ? "32px 20px" : "48px", borderBottom: `1px solid ${theme.gray200}` }}>
    <div style={{ maxWidth: theme.containerMax, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 16 : 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: 24,
              background: theme.gray50,
              borderRadius: theme.radiusMd,
            }}
          >
            <SkeletonBox width="48px" height="48px" radius="50%" style={{ marginBottom: 16 }} />
            <SkeletonBox width="60%" height="14px" style={{ marginBottom: 8 }} />
            <SkeletonBox width="80%" height="20px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonSection = ({ isMobile, cardCount = 3 }) => (
  <div style={{ padding: isMobile ? "48px 20px" : "80px 48px" }}>
    <div style={{ maxWidth: theme.containerMax, margin: "0 auto" }}>
      <SkeletonBox width="200px" height="32px" style={{ marginBottom: 12 }} />
      <SkeletonBox width={isMobile ? "100%" : "500px"} height="20px" style={{ marginBottom: 40 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : `repeat(${cardCount}, 1fr)`,
          gap: 24,
        }}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            style={{
              background: theme.white,
              borderRadius: theme.radiusMd,
              overflow: "hidden",
              border: `1px solid ${theme.gray200}`,
            }}
          >
            <SkeletonBox width="100%" height="200px" radius="0" />
            <div style={{ padding: 24 }}>
              <SkeletonBox width="70%" height="20px" style={{ marginBottom: 12 }} />
              <SkeletonBox width="100%" height="14px" style={{ marginBottom: 8 }} />
              <SkeletonBox width="90%" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LoadingSkeleton = ({ isMobile }) => (
  <div style={{ background: theme.gray50 }}>
    <SkeletonHero isMobile={isMobile} />
    <SkeletonNav />
    <SkeletonQuickFacts isMobile={isMobile} />
    <SkeletonSection isMobile={isMobile} />
    <div style={{ background: theme.white }}>
      <SkeletonSection isMobile={isMobile} cardCount={4} />
    </div>
    <SkeletonSection isMobile={isMobile} />
  </div>
);

/* ═══════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════ */

const Container = ({ children, style = {} }) => (
  <div
    style={{
      maxWidth: theme.containerMax,
      margin: "0 auto",
      padding: "0 24px",
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionWrapper = ({ id, background = theme.gray50, children, isMobile }) => (
  <section
    id={id}
    style={{
      background,
      padding: isMobile ? `${theme.sectionPaddingMobile} 0` : `${theme.sectionPadding} 0`,
    }}
  >
    <Container>{children}</Container>
  </section>
);

const SectionHeader = ({ title, subtitle, action, isMobile }) => (
  <div style={{ marginBottom: isMobile ? 32 : 48 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: subtitle ? 12 : 0,
      }}
    >
      <h2
        style={{
          fontFamily: theme.fontSerif,
          fontSize: isMobile ? 28 : 36,
          fontWeight: 700,
          color: theme.gray900,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
    {subtitle && (
      <p
        style={{
          fontSize: isMobile ? 16 : 18,
          color: theme.gray500,
          margin: 0,
          lineHeight: 1.6,
          maxWidth: 600,
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const Badge = ({ children, variant = "primary", size = "md" }) => {
  const variants = {
    primary: { bg: theme.primaryLight, color: theme.primaryDark },
    accent: { bg: theme.accentLight, color: theme.primaryDark },
    white: { bg: "rgba(255,255,255,0.2)", color: theme.white },
    gray: { bg: theme.gray100, color: theme.gray700 },
    success: { bg: "#D1FAE5", color: "#065F46" },
    warning: { bg: "#FEF3C7", color: "#92400E" },
  };
  
  const sizes = {
    sm: { padding: "4px 10px", fontSize: 11 },
    md: { padding: "6px 14px", fontSize: 12 },
    lg: { padding: "8px 18px", fontSize: 14 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: v.bg,
        color: v.color,
        fontWeight: 600,
        borderRadius: 50,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        ...s,
      }}
    >
      {children}
    </span>
  );
};

const Card = ({ children, hover = true, className = "", style = {} }) => (
  <div
    className={`${hover ? "hover-lift" : ""} ${className}`}
    style={{
      background: theme.white,
      borderRadius: theme.radiusMd,
      border: `1px solid ${theme.gray200}`,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Button = ({ children, variant = "primary", size = "md", as: Component = "button", ...props }) => {
  const variants = {
    primary: {
      background: theme.primary,
      color: theme.white,
      border: "none",
    },
    secondary: {
      background: theme.white,
      color: theme.primary,
      border: `2px solid ${theme.primary}`,
    },
    ghost: {
      background: "transparent",
      color: theme.primary,
      border: `1px solid ${theme.gray200}`,
    },
    white: {
      background: theme.white,
      color: theme.gray800,
      border: "none",
    },
  };

  const sizes = {
    sm: { padding: "10px 20px", fontSize: 14 },
    md: { padding: "14px 28px", fontSize: 15 },
    lg: { padding: "18px 36px", fontSize: 16 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <Component
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: theme.fontSans,
        fontWeight: 600,
        borderRadius: theme.radiusMd,
        cursor: "pointer",
        textDecoration: "none",
        transition: `all ${theme.transitionBase}`,
        ...v,
        ...s,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

/* ═══════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════ */

const Hero = ({ country, isMobile }) => {
  const c = country;
  
  return (
    <div
      style={{
        position: "relative",
        height: isMobile ? "70vh" : "85vh",
        minHeight: 500,
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${c.heroImage || c.flagUrl})`,
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
            rgba(0,0,0,0.2) 0%,
            rgba(0,0,0,0.4) 50%,
            rgba(0,0,0,0.8) 100%
          )`,
        }}
      />
      
      {/* Green Accent Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${theme.primary}20, transparent 60%)`,
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
          paddingBottom: isMobile ? 48 : 80,
        }}
      >
        <div style={{ maxWidth: 800 }} className="fade-in">
          {/* Region Badge */}
          {c.region && (
            <Badge variant="white" size="lg" style={{ marginBottom: 20 }}>
              {c.region}
            </Badge>
          )}
          
          {/* Country Name with Flag */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            {c.flagUrl && (
              <img
                src={c.flagUrl}
                alt={`${c.name} flag`}
                style={{
                  width: isMobile ? 56 : 72,
                  height: isMobile ? 40 : 52,
                  borderRadius: 8,
                  boxShadow: theme.shadowLg,
                  objectFit: "cover",
                }}
              />
            )}
            <h1
              style={{
                fontFamily: theme.fontSerif,
                fontSize: isMobile ? 36 : 64,
                fontWeight: 700,
                color: theme.white,
                margin: 0,
                lineHeight: 1.1,
                textShadow: "0 2px 20px rgba(0,0,0,0.3)",
              }}
            >
              {c.name}
            </h1>
          </div>
          
          {/* Description */}
          {c.tagline && (
            <p
              style={{
                fontSize: isMobile ? 18 : 22,
                color: "rgba(255,255,255,0.9)",
                margin: "0 0 32px",
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              {c.tagline}
            </p>
          )}
          
          {/* Quick Stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: isMobile ? 16 : 32,
              marginBottom: 32,
            }}
          >
            {c.capital && (
              <div style={{ color: "rgba(255,255,255,0.9)" }}>
                <span style={{ fontSize: 13, opacity: 0.7, display: "block" }}>Capital</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{c.capital}</span>
              </div>
            )}
            {c.population && (
              <div style={{ color: "rgba(255,255,255,0.9)" }}>
                <span style={{ fontSize: 13, opacity: 0.7, display: "block" }}>Population</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{formatNumber(c.population)}</span>
              </div>
            )}
            {c.destinationCount > 0 && (
              <div style={{ color: "rgba(255,255,255,0.9)" }}>
                <span style={{ fontSize: 13, opacity: 0.7, display: "block" }}>Destinations</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{c.destinationCount}+ Places</span>
              </div>
            )}
          </div>
          
          {/* CTA Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button as={Link} to={`/countries/${c.slug}/destinations`} size="lg">
              Explore Destinations
            </Button>
            <Button
              variant="secondary"
              size="lg"
              style={{ 
                background: "rgba(255,255,255,0.1)", 
                borderColor: "rgba(255,255,255,0.3)",
                color: theme.white,
              }}
              onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SECTION NAVIGATION
   ═══════════════════════════════════════════════════ */

const SectionNav = ({ sections, active, onClick, isMobile }) => {
  const navRef = React.useRef(null);

  useEffect(() => {
    if (navRef.current && active) {
      const activeEl = navRef.current.querySelector(`[data-section="${active}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [active]);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: theme.white,
        borderBottom: `1px solid ${theme.gray200}`,
        boxShadow: theme.shadowSm,
      }}
    >
      <Container>
        <div
          ref={navRef}
          style={{
            display: "flex",
            gap: isMobile ? 8 : 4,
            overflowX: "auto",
            padding: "16px 0",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              data-section={section.id}
              onClick={() => onClick(section.id)}
              className={`nav-item ${active === section.id ? "active" : ""}`}
              style={{
                padding: isMobile ? "10px 16px" : "10px 20px",
                background: active === section.id ? theme.primaryMuted : "transparent",
                color: active === section.id ? theme.primary : theme.gray600,
                border: "none",
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: theme.fontSans,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: `all ${theme.transitionFast}`,
              }}
            >
              {isMobile ? section.short : section.label}
            </button>
          ))}
        </div>
      </Container>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════
   QUICK FACTS
   ═══════════════════════════════════════════════════ */

const QuickFacts = ({ country, isMobile }) => {
  const c = country;
  
  const facts = [
    { icon: "🏛️", label: "Capital", value: c.capital },
    { icon: "👥", label: "Population", value: c.population ? formatNumber(c.population) : null },
    { icon: "🌍", label: "Area", value: c.area ? `${formatNumber(c.area)} km²` : null },
    { icon: "💰", label: "Currency", value: c.currency },
    { icon: "🗣️", label: "Language", value: Array.isArray(c.languages) ? c.languages[0] : c.languages },
    { icon: "🕐", label: "Timezone", value: c.timezone },
    { icon: "📞", label: "Calling Code", value: c.callingCode },
    { icon: "🚗", label: "Driving Side", value: c.drivingSide },
  ].filter(f => f.value);

  if (facts.length === 0) return null;

  return (
    <section style={{ background: theme.white, borderBottom: `1px solid ${theme.gray200}` }}>
      <Container style={{ padding: isMobile ? "32px 24px" : "48px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile 
              ? "repeat(2, 1fr)" 
              : `repeat(${Math.min(facts.length, 4)}, 1fr)`,
            gap: isMobile ? 16 : 24,
          }}
        >
          {facts.slice(0, 8).map((fact, i) => (
            <div
              key={i}
              style={{
                padding: isMobile ? 20 : 28,
                background: theme.gray50,
                borderRadius: theme.radiusMd,
                borderLeft: `4px solid ${theme.primary}`,
                transition: `all ${theme.transitionBase}`,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{fact.icon}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.gray500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {fact.label}
              </div>
              <div
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  color: theme.gray800,
                }}
              >
                {fact.value}
              </div>
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

const Overview = ({ country, isMobile }) => {
  const c = country;
  const hasContent = c.description || c.fullDescription || (c.highlights?.length > 0);
  
  if (!hasContent) return null;

  return (
    <SectionWrapper id="overview" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="Overview"
        subtitle={`Discover what makes ${c.name} a remarkable destination`}
        isMobile={isMobile}
      />
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 32 : 48,
          alignItems: "start",
        }}
      >
        {/* Description */}
        <div>
          {(c.fullDescription || c.description) && (
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: theme.gray600,
              }}
            >
              {splitParagraphs(c.fullDescription || c.description).map((p, i) => (
                <p key={i} style={{ margin: i > 0 ? "20px 0 0" : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
        
        {/* Highlights */}
        {c.highlights?.length > 0 && (
          <Card hover={false} style={{ padding: isMobile ? 24 : 32 }}>
            <h3
              style={{
                fontFamily: theme.fontSerif,
                fontSize: 22,
                fontWeight: 600,
                color: theme.gray800,
                margin: "0 0 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: theme.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                ✨
              </span>
              Highlights
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {c.highlights.map((h, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom: i < c.highlights.length - 1 ? `1px solid ${theme.gray100}` : "none",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: theme.primary,
                      color: theme.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 15, color: theme.gray700, lineHeight: 1.5 }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   GEOGRAPHY & CLIMATE
   ═══════════════════════════════════════════════════ */

const GeographyClimate = ({ country, isMobile }) => {
  const c = country;
  const geo = c.geography || {};
  const hasContent = c.area || Object.keys(geo).length > 0 || c.climate;

  if (!hasContent) return null;

  const geoFacts = [
    { label: "Terrain", value: geo.terrain },
    { label: "Highest Point", value: geo.highestPoint },
    { label: "Major Rivers", value: Array.isArray(geo.majorRivers) ? geo.majorRivers.join(", ") : geo.majorRivers },
    { label: "Natural Resources", value: Array.isArray(geo.naturalResources) ? geo.naturalResources.slice(0, 4).join(", ") : geo.naturalResources },
  ].filter(f => f.value);

  return (
    <SectionWrapper id="geography" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="Geography & Climate"
        subtitle={`Explore the natural landscapes and weather patterns of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 24,
        }}
      >
        {/* Geography Card */}
        {geoFacts.length > 0 && (
          <Card hover={false}>
            <div
              style={{
                padding: "20px 24px",
                background: theme.primaryMuted,
                borderBottom: `1px solid ${theme.primaryLight}`,
              }}
            >
              <h3
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
                <span>🏔️</span> Geography
              </h3>
            </div>
            <div style={{ padding: 24 }}>
              {geoFacts.map((fact, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 0",
                    borderBottom: i < geoFacts.length - 1 ? `1px solid ${theme.gray100}` : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.gray500,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 4,
                    }}
                  >
                    {fact.label}
                  </div>
                  <div style={{ fontSize: 15, color: theme.gray800, lineHeight: 1.5 }}>
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Climate Card */}
        {c.climate && (
          <Card hover={false}>
            <div
              style={{
                padding: "20px 24px",
                background: theme.accentLight,
                borderBottom: `1px solid ${theme.accent}20`,
              }}
            >
              <h3
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
                <span>🌤️</span> Climate
              </h3>
            </div>
            <div style={{ padding: 24 }}>
              {typeof c.climate === "string" ? (
                <p style={{ margin: 0, fontSize: 15, color: theme.gray700, lineHeight: 1.7 }}>
                  {c.climate}
                </p>
              ) : (
                <div>
                  {c.climate.overview && (
                    <p style={{ margin: "0 0 16px", fontSize: 15, color: theme.gray700, lineHeight: 1.7 }}>
                      {c.climate.overview}
                    </p>
                  )}
                  {c.climate.bestTime && (
                    <div
                      style={{
                        padding: 16,
                        background: theme.gray50,
                        borderRadius: theme.radiusSm,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: theme.primary,
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        Best Time to Visit
                      </div>
                      <div style={{ fontSize: 15, color: theme.gray800 }}>
                        {c.climate.bestTime}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   PEOPLE & CULTURE
   ═══════════════════════════════════════════════════ */

const PeopleCulture = ({ country, isMobile }) => {
  const c = country;
  const hasContent = c.population || c.languages?.length > 0 || c.ethnicGroups?.length > 0 || c.religions?.length > 0;

  if (!hasContent) return null;

  return (
    <SectionWrapper id="people" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="People & Culture"
        subtitle={`Learn about the diverse communities and traditions of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {/* Languages */}
        {c.languages?.length > 0 && (
          <Card hover={false} style={{ padding: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              🗣️
            </div>
            <h4 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: theme.gray800 }}>
              Languages
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {c.languages.map((lang, i) => (
                <Badge key={i} variant="gray" size="sm">
                  {typeof lang === "string" ? lang : lang.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Ethnic Groups */}
        {c.ethnicGroups?.length > 0 && (
          <Card hover={false} style={{ padding: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              👥
            </div>
            <h4 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: theme.gray800 }}>
              Ethnic Groups
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {c.ethnicGroups.slice(0, 6).map((group, i) => (
                <Badge key={i} variant="accent" size="sm">
                  {typeof group === "string" ? group : group.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Religions */}
        {c.religions?.length > 0 && (
          <Card hover={false} style={{ padding: 28 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: theme.primaryMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              🛕
            </div>
            <h4 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: theme.gray800 }}>
              Religions
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {c.religions.slice(0, 6).map((religion, i) => (
                <Badge key={i} variant="primary" size="sm">
                  {typeof religion === "string" ? religion : religion.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   HISTORY & HERITAGE
   ═══════════════════════════════════════════════════ */

const HistoryHeritage = ({ country, isMobile }) => {
  const c = country;
  const timeline = c.historicalTimeline || [];
  const unesco = c.unescoSites || [];
  const hasContent = timeline.length > 0 || unesco.length > 0;

  if (!hasContent) return null;

  return (
    <SectionWrapper id="history" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="History & Heritage"
        subtitle={`Discover the rich history and cultural heritage of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 32,
        }}
      >
        {/* Timeline */}
        {timeline.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.gray800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>📜</span> Historical Timeline
            </h3>
            <div style={{ position: "relative", paddingLeft: 24 }}>
              {/* Timeline Line */}
              <div
                style={{
                  position: "absolute",
                  left: 4,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: theme.primaryLight,
                }}
              />
              {timeline.slice(0, 6).map((event, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    paddingBottom: 28,
                  }}
                >
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: -24,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: theme.primary,
                      border: `3px solid ${theme.white}`,
                      boxShadow: `0 0 0 3px ${theme.primaryLight}`,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.primary,
                      marginBottom: 4,
                    }}
                  >
                    {event.year || event.period}
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: theme.gray800 }}>
                    {event.title || event.event}
                  </h4>
                  {event.description && (
                    <p style={{ margin: 0, fontSize: 14, color: theme.gray600, lineHeight: 1.6 }}>
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNESCO Sites */}
        {unesco.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: theme.gray800,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>🏛️</span> UNESCO World Heritage Sites
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {unesco.slice(0, 5).map((site, i) => (
                <Card key={i} style={{ padding: 20 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    {site.imageUrl && (
                      <img
                        src={site.imageUrl}
                        alt={site.name}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: theme.radiusSm,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: theme.gray800 }}>
                        {site.name}
                      </h4>
                      {site.yearInscribed && (
                        <Badge variant="primary" size="sm" style={{ marginBottom: 8 }}>
                          Inscribed {site.yearInscribed}
                        </Badge>
                      )}
                      {site.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: theme.gray600,
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {site.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   WILDLIFE & NATURE
   ═══════════════════════════════════════════════════ */

const WildlifeNature = ({ country, isMobile }) => {
  const c = country;
  const wildlife = c.wildlife || {};
  const hasContent = Object.values(wildlife).some(v => Array.isArray(v) && v.length > 0);

  if (!hasContent) return null;

  const categories = [
    { key: "mammals", label: "Mammals", icon: "🦁" },
    { key: "birds", label: "Birds", icon: "🦅" },
    { key: "reptiles", label: "Reptiles", icon: "🐊" },
    { key: "marineLife", label: "Marine Life", icon: "🐋" },
    { key: "endangered", label: "Endangered Species", icon: "⚠️" },
  ].filter(cat => wildlife[cat.key]?.length > 0);

  return (
    <SectionWrapper id="wildlife" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="Wildlife & Nature"
        subtitle={`Explore the incredible biodiversity and natural wonders of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {categories.map((cat, i) => (
          <Card key={i} hover={false}>
            <div
              style={{
                padding: "18px 24px",
                background: theme.primaryMuted,
                borderBottom: `1px solid ${theme.primaryLight}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: theme.primaryDark }}>
                {cat.label}
              </h4>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {wildlife[cat.key].slice(0, 8).map((animal, j) => (
                  <Badge key={j} variant="gray" size="sm">
                    {typeof animal === "string" ? animal : animal.name}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   CUISINE
   ═══════════════════════════════════════════════════ */

const Cuisine = ({ country, isMobile }) => {
  const c = country;
  const cuisine = c.cuisine || {};
  const dishes = cuisine.dishes || cuisine.traditionalDishes || [];
  const beverages = cuisine.beverages || [];
  const hasContent = dishes.length > 0 || beverages.length > 0;

  if (!hasContent) return null;

  return (
    <SectionWrapper id="cuisine" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="Local Cuisine"
        subtitle={`Taste the authentic flavors and culinary traditions of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {dishes.slice(0, 6).map((dish, i) => (
          <Card key={i} className="hover-scale" style={{ overflow: "hidden" }}>
            {dish.imageUrl && (
              <div style={{ height: 180, overflow: "hidden" }}>
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>🍽️</span>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: theme.gray800 }}>
                  {dish.name}
                </h4>
              </div>
              {dish.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: theme.gray600,
                    lineHeight: 1.6,
                  }}
                >
                  {dish.description}
                </p>
              )}
              {dish.isVegetarian && (
                <Badge variant="success" size="sm" style={{ marginTop: 12 }}>
                  🌱 Vegetarian
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Beverages */}
      {beverages.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: theme.gray800,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>🍹</span> Traditional Beverages
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {beverages.map((bev, i) => (
              <Card key={i} style={{ padding: "16px 20px" }}>
                <span style={{ fontWeight: 600, color: theme.gray800 }}>
                  {typeof bev === "string" ? bev : bev.name}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL ESSENTIALS
   ═══════════════════════════════════════════════════ */

const TravelEssentials = ({ country, isMobile }) => {
  const c = country;
  const hasContent = c.visaInfo || c.healthInfo || c.safety || c.currency || c.electricityInfo;

  if (!hasContent) return null;

  const essentials = [
    {
      icon: "📋",
      title: "Visa Information",
      content: c.visaInfo,
      color: theme.primary,
      bg: theme.primaryMuted,
    },
    {
      icon: "💊",
      title: "Health & Vaccinations",
      content: c.healthInfo,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      icon: "🛡️",
      title: "Safety & Security",
      content: c.safety,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      icon: "🔌",
      title: "Electricity",
      content: c.electricityInfo,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ].filter(e => e.content);

  return (
    <SectionWrapper id="travel" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="Travel Essentials"
        subtitle={`Important information for planning your trip to ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {essentials.map((item, i) => (
          <Card key={i} hover={false}>
            <div
              style={{
                padding: "18px 24px",
                background: item.bg,
                borderBottom: `1px solid ${item.color}20`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: item.color }}>
                {item.title}
              </h4>
            </div>
            <div style={{ padding: 24 }}>
              {typeof item.content === "string" ? (
                <p style={{ margin: 0, fontSize: 15, color: theme.gray700, lineHeight: 1.7 }}>
                  {item.content}
                </p>
              ) : (
                <div style={{ fontSize: 15, color: theme.gray700, lineHeight: 1.7 }}>
                  {item.content.description || JSON.stringify(item.content)}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   FESTIVALS & EVENTS
   ═══════════════════════════════════════════════════ */

const Festivals = ({ country, isMobile }) => {
  const c = country;
  const festivals = c.festivals || [];

  if (festivals.length === 0) return null;

  return (
    <SectionWrapper id="festivals" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="Festivals & Events"
        subtitle={`Experience the vibrant celebrations and cultural events of ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {festivals.slice(0, 6).map((fest, i) => (
          <Card key={i} className="hover-scale" style={{ overflow: "hidden" }}>
            {fest.imageUrl && (
              <div style={{ height: 180, overflow: "hidden" }}>
                <img
                  src={fest.imageUrl}
                  alt={fest.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: theme.gray800 }}>
                  {fest.name}
                </h4>
                {fest.isMajorEvent && (
                  <Badge variant="warning" size="sm">Major</Badge>
                )}
              </div>
              {(fest.period || fest.month) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                    color: theme.primary,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span>📅</span> {fest.period || fest.month}
                </div>
              )}
              {fest.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: theme.gray600,
                    lineHeight: 1.6,
                  }}
                >
                  {fest.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   AIRPORTS / GETTING THERE
   ═══════════════════════════════════════════════════ */

const Airports = ({ country, isMobile }) => {
  const c = country;
  const airports = c.airports || [];

  if (airports.length === 0) return null;

  return (
    <SectionWrapper id="airports" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="Getting There"
        subtitle={`Key airports and entry points for traveling to ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {airports.slice(0, 6).map((airport, i) => (
          <Card
            key={i}
            style={{
              padding: 24,
              borderLeft: airport.isMainInternational
                ? `4px solid ${theme.primary}`
                : `4px solid ${theme.gray300}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: airport.isMainInternational ? theme.primaryMuted : theme.gray100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                ✈️
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: theme.gray800 }}>
                  {airport.name}
                </h4>
                {airport.code && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.primary,
                      background: theme.primaryLight,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {airport.code}
                  </span>
                )}
              </div>
            </div>
            {airport.location && (
              <p style={{ margin: "0 0 8px", fontSize: 14, color: theme.gray600 }}>
                📍 {airport.location}
              </p>
            )}
            {airport.type && (
              <Badge variant="gray" size="sm">
                {airport.type}
              </Badge>
            )}
            {airport.description && (
              <p style={{ margin: "12px 0 0", fontSize: 14, color: theme.gray600, lineHeight: 1.6 }}>
                {airport.description}
              </p>
            )}
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   DESTINATIONS
   ═══════════════════════════════════════════════════ */

const Destinations = ({ destinations, countryName, countrySlug, isMobile }) => {
  if (!destinations || destinations.length === 0) return null;

  return (
    <SectionWrapper id="destinations" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="Explore Destinations"
        subtitle={`Discover the most stunning places to visit in ${countryName}`}
        action={
          countrySlug && (
            <Link
              to={`/countries/${countrySlug}/destinations`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 600,
                color: theme.primary,
                textDecoration: "none",
              }}
            >
              View All <span>→</span>
            </Link>
          )
        }
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {destinations.slice(0, 9).map((dest, i) => (
          <Link
            key={dest.id || i}
            to={`/destinations/${dest.slug || dest.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Card className="hover-scale" style={{ height: "100%", overflow: "hidden" }}>
              <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                <img
                  src={dest.image_url || (dest.images || [])[0]}
                  alt={dest.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* Gradient Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
                  }}
                />
                {/* Featured Badge */}
                {dest.is_featured && (
                  <Badge
                    variant="primary"
                    size="sm"
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                    }}
                  >
                    Featured
                  </Badge>
                )}
                {/* Rating */}
                {dest.rating && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(0,0,0,0.7)",
                      color: "#FBBF24",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ★ {dest.rating}
                  </div>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: 18,
                    fontWeight: 600,
                    color: theme.gray800,
                  }}
                >
                  {dest.name}
                </h4>
                {dest.category && (
                  <Badge variant="accent" size="sm" style={{ marginBottom: 10 }}>
                    {dest.category}
                  </Badge>
                )}
                {dest.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: theme.gray600,
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {dest.description}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   IMAGE GALLERY
   ═══════════════════════════════════════════════════ */

const Gallery = ({ images, name, isMobile }) => {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  if (!images || images.length === 0) return null;

  return (
    <SectionWrapper id="gallery" background={theme.gray50} isMobile={isMobile}>
      <SectionHeader
        title="Photo Gallery"
        subtitle={`Stunning images from ${name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {images.slice(0, 8).map((img, i) => {
          const url = typeof img === "string" ? img : img.url;
          const caption = typeof img === "object" ? img.caption : null;

          return (
            <div
              key={i}
              onClick={() => setLightbox({ open: true, index: i })}
              style={{
                position: "relative",
                paddingBottom: "75%",
                borderRadius: theme.radiusMd,
                overflow: "hidden",
                cursor: "pointer",
              }}
              className="hover-scale"
            >
              <img
                src={url}
                alt={caption || `${name} photo ${i + 1}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0)",
                  transition: `background ${theme.transitionBase}`,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0)"}
              />
            </div>
          );
        })}
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
            padding: 32,
          }}
        >
          <button
            onClick={() => setLightbox({ ...lightbox, open: false })}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "none",
              border: "none",
              color: theme.white,
              fontSize: 32,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          <img
            src={typeof images[lightbox.index] === "string" ? images[lightbox.index] : images[lightbox.index].url}
            alt=""
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: theme.radiusMd,
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox({ ...lightbox, index: (lightbox.index - 1 + images.length) % images.length });
                }}
                style={{
                  position: "absolute",
                  left: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: theme.white,
                  width: 48,
                  height: 48,
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
                  setLightbox({ ...lightbox, index: (lightbox.index + 1) % images.length });
                }}
                style={{
                  position: "absolute",
                  right: 24,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: theme.white,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   TRAVEL TIPS
   ═══════════════════════════════════════════════════ */

const TravelTips = ({ country, isMobile }) => {
  const c = country;
  const tips = c.travelTips || [];

  if (tips.length === 0) return null;

  return (
    <SectionWrapper id="tips" background={theme.white} isMobile={isMobile}>
      <SectionHeader
        title="Travel Tips"
        subtitle={`Helpful advice for your trip to ${c.name}`}
        isMobile={isMobile}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        {tips.map((tip, i) => (
          <Card key={i} style={{ padding: 24, display: "flex", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: theme.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: theme.primary,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div>
              {tip.title && (
                <h4 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: theme.gray800 }}>
                  {tip.title}
                </h4>
              )}
              <p style={{ margin: 0, fontSize: 14, color: theme.gray600, lineHeight: 1.6 }}>
                {typeof tip === "string" ? tip : tip.content || tip.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ═══════════════════════════════════════════════════
   FOOTER CTA
   ═══════════════════════════════════════════════════ */

const FooterCTA = ({ country, isMobile }) => {
  const c = country;

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        padding: isMobile ? "64px 24px" : "96px 48px",
        textAlign: "center",
      }}
    >
      <Container>
        <h2
          style={{
            fontFamily: theme.fontSerif,
            fontSize: isMobile ? 28 : 42,
            fontWeight: 700,
            color: theme.white,
            margin: "0 0 16px",
          }}
        >
          Ready to Explore {c.name}?
        </h2>
        <p
          style={{
            fontSize: isMobile ? 16 : 20,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 560,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Start planning your adventure today. Discover stunning destinations, rich culture, and unforgettable experiences.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {c.destinationCount > 0 && (
            <Button as={Link} to={`/countries/${c.slug}/destinations`} variant="white" size="lg">
              View All Destinations
            </Button>
          )}
          <Button
            as={Link}
            to="/countries"
            variant="secondary"
            size="lg"
            style={{
              background: "transparent",
              borderColor: "rgba(255,255,255,0.4)",
              color: theme.white,
            }}
          >
            Explore More Countries
          </Button>
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
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: theme.primaryMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 56,
        marginBottom: 32,
      }}
    >
      🌍
    </div>
    <h2
      style={{
        fontFamily: theme.fontSerif,
        fontSize: 32,
        fontWeight: 700,
        color: theme.gray800,
        margin: "0 0 16px",
      }}
    >
      Country Not Found
    </h2>
    <p
      style={{
        fontSize: 18,
        color: theme.gray500,
        maxWidth: 480,
        margin: "0 0 32px",
        lineHeight: 1.6,
      }}
    >
      {error || "The country you're looking for doesn't exist or has been removed."}
    </p>
    <Button onClick={() => navigate("/countries")} size="lg">
      Browse Countries
    </Button>
  </div>
);

/* ═══════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════ */

const formatNumber = (num) => {
  if (typeof num !== "number") return num;
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const splitParagraphs = (text) => {
  if (!text) return [];
  return text.split(/\n\n|\n/).filter(Boolean);
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

const CountryPage = () => {
  const { idOrSlug, id } = useParams();
  const slug = idOrSlug || id;
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const [country, setCountry] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // Fetch data from backend
  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);

    fetchCountryPageData(slug)
      .then(({ country, destinations }) => {
        setCountry(country);
        setDestinations(destinations);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Scroll to section
  const scrollTo = useCallback((sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Scroll spy
  useEffect(() => {
    if (!country) return;

    const handler = () => {
      const sectionIds = sections.map((s) => s.id);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.getBoundingClientRect().top <= 150) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [country]);

  // Build visible sections
  const sections = [];
  if (country) {
    const c = country;
    
    if (c.description || c.fullDescription || c.highlights?.length) {
      sections.push({ id: "overview", label: "Overview", short: "Overview" });
    }
    if (c.area || Object.keys(c.geography || {}).length || c.climate) {
      sections.push({ id: "geography", label: "Geography & Climate", short: "Geography" });
    }
    if (c.population || c.languages?.length || c.ethnicGroups?.length) {
      sections.push({ id: "people", label: "People & Culture", short: "People" });
    }
    if ((c.historicalTimeline || []).length || (c.unescoSites || []).length) {
      sections.push({ id: "history", label: "History & Heritage", short: "History" });
    }
    if (Object.values(c.wildlife || {}).some(v => Array.isArray(v) && v.length)) {
      sections.push({ id: "wildlife", label: "Wildlife", short: "Wildlife" });
    }
    if (Object.values(c.cuisine || {}).some(v => Array.isArray(v) && v.length)) {
      sections.push({ id: "cuisine", label: "Cuisine", short: "Food" });
    }
    if (c.visaInfo || c.healthInfo || c.drivingSide || c.callingCode) {
      sections.push({ id: "travel", label: "Travel Essentials", short: "Travel" });
    }
    if ((c.festivals || []).length > 0) {
      sections.push({ id: "festivals", label: "Festivals", short: "Festivals" });
    }
    if ((c.airports || []).length > 0) {
      sections.push({ id: "airports", label: "Getting There", short: "Airports" });
    }
    if (destinations.length > 0) {
      sections.push({ id: "destinations", label: "Destinations", short: "Places" });
    }
    if ((c.images || []).length > 0) {
      sections.push({ id: "gallery", label: "Gallery", short: "Photos" });
    }
    if ((c.travelTips || []).length > 0) {
      sections.push({ id: "tips", label: "Travel Tips", short: "Tips" });
    }
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div style={{ fontFamily: theme.fontSans }}>
        <GlobalStyles />
        <LoadingSkeleton isMobile={isMobile} />
      </div>
    );
  }

  // Error state
  if (error || !country) {
    return (
      <div style={{ fontFamily: theme.fontSans }}>
        <GlobalStyles />
        <ErrorState error={error} navigate={navigate} />
      </div>
    );
  }

  // Render
  return (
    <div style={{ fontFamily: theme.fontSans, color: theme.gray800, background: theme.gray50 }}>
      <GlobalStyles />

      <Hero country={country} isMobile={isMobile} />

      {sections.length > 0 && (
        <SectionNav
          sections={sections}
          active={activeSection}
          onClick={scrollTo}
          isMobile={isMobile}
        />
      )}

      <QuickFacts country={country} isMobile={isMobile} />

      <div className="fade-in">
        <Overview country={country} isMobile={isMobile} />
        <GeographyClimate country={country} isMobile={isMobile} />
        <PeopleCulture country={country} isMobile={isMobile} />
        <HistoryHeritage country={country} isMobile={isMobile} />
        <WildlifeNature country={country} isMobile={isMobile} />
        <Cuisine country={country} isMobile={isMobile} />
        <TravelEssentials country={country} isMobile={isMobile} />
        <Festivals country={country} isMobile={isMobile} />
        <Airports country={country} isMobile={isMobile} />
        <Destinations
          destinations={destinations}
          countryName={country.name}
          countrySlug={country.slug}
          isMobile={isMobile}
        />
        <Gallery images={country.images} name={country.name} isMobile={isMobile} />
        <TravelTips country={country} isMobile={isMobile} />
      </div>

      <FooterCTA country={country} isMobile={isMobile} />
    </div>
  );
};

export default CountryPage;