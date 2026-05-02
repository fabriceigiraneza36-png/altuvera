// src/pages/NotFound.jsx
import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiMapPin,
  FiArrowRight,
  FiCompass,
  FiBookOpen,
  FiMail,
} from "react-icons/fi";
import SEO from "../components/common/SEO";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  {
    icon:     FiMapPin,
    text:     "Explore Destinations",
    sub:      "Discover East Africa's finest locations",
    path:     "/destinations",
    ariaLabel:"Navigate to destinations",
  },
  {
    icon:     FiSearch,
    text:     "Browse Services",
    sub:      "Find the perfect travel package for you",
    path:     "/services",
    ariaLabel:"Navigate to services",
  },
  {
    icon:     FiBookOpen,
    text:     "Read Travel Stories",
    sub:      "Inspiration from our community of explorers",
    path:     "/posts",
    ariaLabel:"Navigate to blog posts",
  },
  {
    icon:     FiMail,
    text:     "Contact Us",
    sub:      "Our team is happy to point you in the right direction",
    path:     "/contact",
    ariaLabel:"Navigate to contact page",
  },
];

const PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ═══════════════════════════════════════════════════════
   INTERNAL: primary / secondary buttons (replaces missing Button)
   ═══════════════════════════════════════════════════════ */
const PrimaryButton = ({ to, children, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseOver={() => setHovered(true)}
      onMouseOut={()  => setHovered(false)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            10,
        padding:        "14px 28px",
        borderRadius:   9999,
        background:     hovered
          ? "linear-gradient(135deg,#047857,#059669)"
          : "linear-gradient(135deg,#059669,#10B981)",
        color:          "white",
        fontWeight:     700,
        fontSize:       15,
        textDecoration: "none",
        boxShadow:      hovered
          ? "0 14px 40px rgba(5,150,105,0.40)"
          : "0 8px 24px rgba(5,150,105,0.28)",
        transform:      hovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        transition:     "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        letterSpacing:  "-0.01em",
        position:       "relative",
        overflow:       "hidden",
        border:         "none",
      }}
    >
      {icon}
      {children}
    </Link>
  );
};

const SecondaryButton = ({ to, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseOver={() => setHovered(true)}
      onMouseOut={()  => setHovered(false)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            8,
        padding:        "13px 28px",
        borderRadius:   9999,
        background:     hovered ? "#ECFDF5" : "white",
        color:          "#059669",
        fontWeight:     700,
        fontSize:       15,
        textDecoration: "none",
        border:         `2px solid ${hovered ? "#059669" : "#D1FAE5"}`,
        transform:      hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow:      hovered
          ? "0 8px 24px rgba(5,150,105,0.14)"
          : "0 2px 8px rgba(5,150,105,0.08)",
        transition:     "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {children}
      <FiArrowRight
        size={16}
        style={{
          transform:  hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      />
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════
   SUGGESTION CARD
   ═══════════════════════════════════════════════════════ */
const SuggestionCard = ({ suggestion, index }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = suggestion.icon;

  return (
    <Link
      to={suggestion.path}
      aria-label={suggestion.ariaLabel}
      onMouseOver={() => setHovered(true)}
      onMouseOut={()  => setHovered(false)}
      onFocus={()    => setHovered(true)}
      onBlur={()     => setHovered(false)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            16,
        padding:        "16px 20px",
        borderRadius:   16,
        textDecoration: "none",
        backgroundColor: hovered ? "#D1FAE5" : "#F0FDF4",
        border:         `1px solid ${hovered ? "#A7F3D0" : "#D1FAE5"}`,
        transform:      hovered ? "translateX(8px)" : "translateX(0)",
        boxShadow:      hovered
          ? "0 6px 20px rgba(5,150,105,0.12)"
          : "0 1px 4px rgba(5,150,105,0.06)",
        transition:     "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width:          46,
          height:         46,
          borderRadius:   14,
          backgroundColor: hovered ? "#059669" : "#D1FAE5",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          color:          hovered ? "white" : "#059669",
          flexShrink:     0,
          transition:     "all 0.3s ease",
          boxShadow:      hovered ? "0 6px 16px rgba(5,150,105,0.28)" : "none",
        }}
      >
        <Icon size={20} aria-hidden="true" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:   14.5, fontWeight: 700,
          color:      "#064E3B", lineHeight: 1.3, marginBottom: 2,
        }}>
          {suggestion.text}
        </div>
        <div style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.4 }}>
          {suggestion.sub}
        </div>
      </div>

      {/* Arrow */}
      <FiArrowRight
        size={17}
        style={{
          color:      "#059669",
          transform:  hovered ? "translateX(4px)" : "translateX(0)",
          transition: "transform 0.3s ease",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════
   FLOATING DECORATION
   ═══════════════════════════════════════════════════════ */
const Blob = ({ style }) => (
  <div
    aria-hidden="true"
    style={{
      position:      "absolute",
      borderRadius:  "50%",
      pointerEvents: "none",
      ...style,
    }}
  />
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
const NotFound = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") navigate("/");
  }, [navigate]);

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for cannot be found. Explore our destinations or return home."
        url="/404"
        keywords={["404", "page not found", "not found", "error"]}
      />

      <main
        role="main"
        style={{
          minHeight:      "100vh",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          backgroundColor:"#F0FDF4",
          padding:        "clamp(24px,5vw,60px)",
          position:       "relative",
          overflow:       "hidden",
          fontFamily:     "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Background pattern */}
        <div
          aria-hidden="true"
          style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: PATTERN,
            pointerEvents:   "none",
          }}
        />

        {/* Decorative blobs */}
        <Blob style={{
          width: "clamp(200px,30vw,400px)", height: "clamp(200px,30vw,400px)",
          top: "-80px", right: "-80px",
          background: "radial-gradient(circle, rgba(52,211,153,0.18) 0%, rgba(52,211,153,0.06) 50%, transparent 75%)",
        }} />
        <Blob style={{
          width: "clamp(160px,22vw,300px)", height: "clamp(160px,22vw,300px)",
          bottom: "-60px", left: "-60px",
          background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.04) 50%, transparent 75%)",
        }} />
        <Blob style={{
          width: 180, height: 180,
          top: "40%", left: "10%",
          background: "radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)",
        }} />

        {/* Main card */}
        <article
          style={{
            position:        "relative",
            zIndex:          1,
            maxWidth:        680,
            width:           "100%",
            textAlign:       "center",
          }}
        >
          {/* ── 404 number ── */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
            <h1
              aria-label="Error 404"
              style={{
                fontFamily:            "'Playfair Display', Georgia, serif",
                fontSize:              "clamp(110px,18vw,190px)",
                fontWeight:            800,
                background:            "linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%)",
                WebkitBackgroundClip:  "text",
                WebkitTextFillColor:   "transparent",
                backgroundClip:        "text",
                lineHeight:            1,
                margin:                0,
                letterSpacing:         "-0.03em",
                filter:                "drop-shadow(0 4px 24px rgba(5,150,105,0.18))",
              }}
            >
              404
            </h1>

            {/* Compass watermark behind 404 */}
            <FiCompass
              size={100}
              aria-hidden="true"
              style={{
                position:  "absolute",
                top:       "50%",
                left:      "50%",
                transform: "translate(-50%,-50%)",
                color:     "#059669",
                opacity:   0.06,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Divider pill */}
          <div style={{
            display:        "inline-flex",
            alignItems:     "center",
            gap:            8,
            padding:        "6px 18px",
            borderRadius:   9999,
            backgroundColor:"#ECFDF5",
            border:         "1px solid #A7F3D0",
            marginBottom:   24,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow: "0 0 0 3px rgba(16,185,129,0.18)",
            }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#047857", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Page Not Found
            </span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize:   "clamp(26px,4vw,40px)",
              fontWeight: 800,
              color:      "#064E3B",
              marginBottom: 14,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Lost in the Wilderness?
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize:   "clamp(15px,2vw,17px)",
              color:      "#4B5563",
              marginBottom: "clamp(32px,5vw,48px)",
              lineHeight: 1.8,
              maxWidth:   500,
              marginLeft: "auto",
              marginRight:"auto",
            }}
          >
            Even the best explorers take a wrong turn sometimes. The page you're
            looking for seems to have wandered off into the savanna — but don't
            worry, we'll get you back on track.
          </p>

          {/* CTA buttons */}
          <nav
            aria-label="Primary navigation options"
            style={{
              display:       "flex",
              gap:           14,
              justifyContent:"center",
              flexWrap:      "wrap",
              marginBottom:  "clamp(36px,5vw,52px)",
            }}
          >
            <PrimaryButton to="/" icon={<FiHome size={18} />}>
              Back to Home
            </PrimaryButton>
            <SecondaryButton to="/destinations">
              Explore Destinations
            </SecondaryButton>
          </nav>

          {/* Suggestions panel */}
          <section
            aria-labelledby="suggestions-heading"
            style={{
              backgroundColor: "white",
              borderRadius:    28,
              padding:         "clamp(24px,4vw,40px)",
              boxShadow:
                "0 20px 60px rgba(5,150,105,0.10), 0 4px 16px rgba(0,0,0,0.04)",
              border:          "1px solid #D1FAE5",
              textAlign:       "left",
            }}
          >
            {/* Panel header */}
            <div style={{
              display:       "flex",
              alignItems:    "center",
              gap:           10,
              marginBottom:  22,
            }}>
              <div style={{
                width:          34,
                height:         34,
                borderRadius:   10,
                background:     "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                color:          "#059669",
                border:         "1px solid #A7F3D0",
              }}>
                <FiCompass size={16} />
              </div>
              <div>
                <h3
                  id="suggestions-heading"
                  style={{
                    fontSize:   13.5,
                    fontWeight: 700,
                    color:      "#064E3B",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  Quick Navigation
                </h3>
                <p style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 2 }}>
                  Popular destinations to help you find your way
                </p>
              </div>
            </div>

            <nav
              aria-label="Alternative navigation"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {SUGGESTIONS.map((s, i) => (
                <SuggestionCard key={s.path} suggestion={s} index={i} />
              ))}
            </nav>
          </section>

          {/* Footer note */}
          <p style={{
            marginTop: 28,
            fontSize:  12.5,
            color:     "#9CA3AF",
            lineHeight: 1.6,
          }}>
            If you believe this is a mistake, please{" "}
            <Link
              to="/contact"
              style={{ color: "#059669", fontWeight: 600, textDecoration: "none" }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e)  => (e.currentTarget.style.textDecoration = "none")}
            >
              contact our team
            </Link>{" "}
            and we'll help you out.
          </p>
        </article>
      </main>
    </>
  );
};

export default NotFound;