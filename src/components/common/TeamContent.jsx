import React from "react";
import { FiArrowRight, FiLinkedin, FiMail } from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

const TeamContent = () => {
  const members = [
    {
      name: "James Kariuki",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Leads strategy and partnerships to deliver meaningful travel experiences.",
    },
    {
      name: "Amara Okonkwo",
      role: "Head of Operations",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Ensures every itinerary is coordinated with precision and local expertise.",
    },
    {
      name: "David Mbeki",
      role: "Lead Safari Guide",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
      bio: "Combines wildlife knowledge and field safety for exceptional guided trips.",
    },
    {
      name: "Sarah Wanjiku",
      role: "Customer Experience",
      image: "https://randomuser.me/api/portraits/women/28.jpg",
      bio: "Designs guest-first service from first inquiry through post-trip follow-up.",
    },
  ];

  const styles = {
    section: {
      padding: "90px 24px",
      background:
        "radial-gradient(circle at 15% 10%, #D1FAE5 0%, #F0FDF4 30%, #FFFFFF 100%)",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    heading: {
      textAlign: "center",
      marginBottom: "50px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(30px, 4.8vw, 44px)",
      color: "#064E3B",
      marginBottom: "10px",
    },
    subtitle: {
      color: "#4B5563",
      fontSize: "16px",
      lineHeight: "1.8",
      maxWidth: "760px",
      margin: "0 auto",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "22px",
      marginBottom: "42px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "20px",
      border: "1px solid #D1FAE5",
      boxShadow: "0 12px 28px rgba(5, 150, 105, 0.1)",
      padding: "24px",
      textAlign: "center",
      transition: "all 0.25s ease",
    },
    image: {
      width: "105px",
      height: "105px",
      borderRadius: "999px",
      objectFit: "cover",
      border: "4px solid #D1FAE5",
      marginBottom: "12px",
    },
    name: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "22px",
      color: "#111827",
      marginBottom: "5px",
    },
    role: {
      fontSize: "14px",
      color: "#059669",
      fontWeight: "600",
      marginBottom: "10px",
    },
    bio: {
      fontSize: "14px",
      color: "#4B5563",
      lineHeight: "1.7",
      marginBottom: "12px",
    },
    socials: {
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    },
    iconButton: {
      width: "34px",
      height: "34px",
      borderRadius: "999px",
      border: "1px solid #A7F3D0",
      backgroundColor: "#ECFDF5",
      color: "#047857",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    cta: {
      display: "flex",
      justifyContent: "center",
    },
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <AnimatedSection animation="fadeInUp">
          <div style={styles.heading}>
            <h2 style={styles.title}>Meet the Team</h2>
            <p style={styles.subtitle}>
              From operations to guiding, our team works together to deliver
              smooth, responsible, and deeply local travel experiences.
            </p>
          </div>
        </AnimatedSection>

        <div style={styles.grid}>
          {members.map((member, index) => (
            <AnimatedSection key={member.name} animation="fadeInUp" delay={index * 0.08}>
              <article
                style={styles.card}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <img src={member.image} alt={member.name} style={styles.image} />
                <h3 style={styles.name}>{member.name}</h3>
                <p style={styles.role}>{member.role}</p>
                <p style={styles.bio}>{member.bio}</p>
                <div style={styles.socials}>
                  <button style={styles.iconButton} aria-label="LinkedIn profile">
                    <FiLinkedin size={15} />
                  </button>
                  <button style={styles.iconButton} aria-label="Email profile">
                    <FiMail size={15} />
                  </button>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fadeInUp">
          <div style={styles.cta}>
            <Button to="/contact" variant="primary" icon={<FiArrowRight size={18} />}>
              Connect With Our Team
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamContent;
