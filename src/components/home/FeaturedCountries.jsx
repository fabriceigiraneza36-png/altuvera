import React from "react";
import AnimatedSection from "../common/AnimatedSection";
import { countries } from "../../data/countries";
import DestinationCard from "../common/DestinationCard";
import { FiArrowRight } from "react-icons/fi";
import Button from "../common/Button";

const FeaturedCountries = () => {
  const featuredCountries = countries.slice(0, 6);

  const styles = {
    section: {
      padding: "120px 24px",
      backgroundColor: "white",
      position: "relative",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
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
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
      gap: "clamp(16px, 3vw, 32px)",
      marginBottom: "50px",
    },
    viewAllContainer: {
      textAlign: "center",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <AnimatedSection animation="fadeInUp">
          <div style={styles.header}>
            <span style={styles.label}>🌍 East African Countries</span>
            <h2 style={styles.title}>Explore Our Destinations</h2>
            <p style={styles.subtitle}>
              Each country offers unique landscapes, wildlife, and cultural
              experiences waiting to be discovered.
            </p>
          </div>
        </AnimatedSection>

        <div style={styles.grid}>
          {featuredCountries.map((country, index) => (
            <DestinationCard
              key={country.id}
              destination={{
                ...country,
                location: country.capital,
                type: `${country.highlights?.length || 0}+ Places`,
              }}
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
              View All Countries
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FeaturedCountries;
