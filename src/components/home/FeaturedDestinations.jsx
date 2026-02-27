import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMapPin, FiStar } from "react-icons/fi";
import AnimatedSection from "../common/AnimatedSection";
import Button from "../common/Button";
import { getAllDestinations } from "../../data/destinations";

import { countries } from "../../data/countries";

import DestinationCard from "../common/DestinationCard";

const FeaturedDestinations = () => {
  const destinations = getAllDestinations().slice(0, 6);

  const styles = {
    section: {
      padding: "clamp(72px, 10vw, 120px) clamp(14px, 4vw, 24px)",
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
      maxWidth: "1400px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    header: {
      textAlign: "center",
      marginBottom: "60px",
    },
    label: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      backgroundColor: "rgba(5, 150, 105, 0.1)",
      borderRadius: "50px",
      color: "#059669",
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(32px, 5vw, 48px)",
      fontWeight: "700",
      color: "#1a1a1a",
      marginBottom: "16px",
    },
    subtitle: {
      fontSize: "18px",
      color: "#6B7280",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.7",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
      gap: "clamp(16px, 3vw, 32px)",
      marginBottom: "clamp(28px, 5vw, 50px)",
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
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={index}
            />
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
    </section>
  );
};

export default FeaturedDestinations;
