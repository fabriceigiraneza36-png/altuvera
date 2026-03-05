import React from "react";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import AnimatedSection from "../common/AnimatedSection";
import Button from "../common/Button";
import { useDestinations } from "../../hooks/useDestinations";
import DestinationCard from "../common/DestinationCard";

const FeaturedDestinations = () => {
  const { destinations: allDestinations = [] } = useDestinations({
    limit: 6,
    sort: "-featured",
  });
  const destinations = allDestinations.slice(0, 6);

  const styles = {
    section: {
      padding: "clamp(100px, 15vw, 160px) clamp(20px, 6vw, 60px)",
      backgroundColor: "#F0FDF4",
      position: "relative",
      overflow: "hidden",
    },
    pattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: "none",
    },
    container: {
      maxWidth: "1800px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    header: {
      textAlign: "center",
      marginBottom: "80px",
    },
    label: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 24px",
      backgroundColor: "rgba(5, 150, 105, 0.08)",
      borderRadius: "100px",
      color: "#059669",
      fontSize: "14px",
      fontWeight: "700",
      marginBottom: "20px",
      textTransform: "uppercase",
      letterSpacing: "2px",
      border: "1px solid rgba(5, 150, 105, 0.1)",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(36px, 6vw, 64px)",
      fontWeight: "800",
      color: "#1a1a1a",
      marginBottom: "24px",
      lineHeight: "1.1",
    },
    subtitle: {
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "#6B7280",
      maxWidth: "750px",
      margin: "0 auto",
      lineHeight: "1.8",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
      gap: "clamp(32px, 5vw, 64px)",
      marginBottom: "80px",
      width: "100%",
    },
    viewAllContainer: {
      textAlign: "center",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.pattern}></div>
      <div style={styles.container}>
        <AnimatedSection animation="fadeInUp">
          <div style={styles.header}>
            <span style={styles.label}>
              <FiMapPin size={14} /> Featured Destinations
            </span>
            <h2 style={styles.title}>Extraordinary Places Await</h2>
            <p style={styles.subtitle}>
              Discover handpicked destinations that showcase the best of East
              Africa's natural wonders, wildlife, and cultural heritage.
            </p>
          </div>
        </AnimatedSection>

        <div style={styles.grid}>
          {destinations.map((destination, index) => (
            <div key={destination.id} style={{ display: "flex", justifyContent: "center" }}>
              <DestinationCard
                destination={destination}
                index={index}
              />
            </div>
          ))}
        </div>

        <AnimatedSection animation="fadeInUp">
          <div style={styles.viewAllContainer}>
            <Button
              to="/destinations"
              variant="primary"
              size="large"
              icon={<FiArrowRight size={18} />}
            >
              View All Destinations
            </Button>
          </div>
        </AnimatedSection>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FeaturedDestinations;
