import React from "react";
import AnimatedSection from "../common/AnimatedSection";
import { useCountries } from "../../hooks/useCountries";
import FeaturedCountryCard from "../common/FeaturedCountryCard";
import { FiArrowRight, FiRefreshCw, FiWifiOff } from "react-icons/fi";
import Button from "../common/Button";

const FeaturedCountries = () => {
  const { countries: backendCountries, loading, error, refetch } = useCountries({ featured: true, limit: 6 });

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
    loadingCard: {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '16px',
      height: '320px',
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '60px 20px',
      color: '#6B7280',
      textAlign: 'center',
      gridColumn: '1 / -1',
    },
  };

  return (
    <section style={styles.section}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
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
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <div key={i} style={styles.loadingCard} />
            ))
          ) : error ? (
            // Error state
            <div style={styles.errorContainer}>
              <FiWifiOff size={48} style={{ color: '#9CA3AF' }} />
              <p>Unable to load countries</p>
              <button
                onClick={refetch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <FiRefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : backendCountries && backendCountries.length > 0 ? (
            backendCountries.map((country, index) => (
              <FeaturedCountryCard
                key={country._id || country.id || index}
                destination={country}
              />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No featured countries available at the moment.
            </p>
          )}
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
