import React, { useState, useEffect } from "react";
import { 
  FiArrowRight, 
  FiLinkedin, 
  FiMail, 
  FiTwitter,
  FiMapPin,
  FiAward,
  FiUsers,
  FiGlobe,
  FiHeart
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

// ----------------------------------------------------------------------
// API Service – Vite uses import.meta.env, not process.env
// ----------------------------------------------------------------------
const teamAPI = {
  // Vite exposes env variables with VITE_ prefix – update your .env file accordingly
  baseURL: import.meta.env.VITE_API_URL || 'http://https://backend-1-ghrv.onrender.com//api',
  
  async getAll() {
    const response = await fetch(`${this.baseURL}/team`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  },
  
  async getById(id) {
    const response = await fetch(`${this.baseURL}/team/${id}`);
    if (!response.ok) throw new Error('Failed to fetch team member');
    return response.json();
  },
  
  async getByDepartment(department) {
    const response = await fetch(`${this.baseURL}/team/department/${department}`);
    if (!response.ok) throw new Error('Failed to fetch team members');
    return response.json();
  }
};

// ----------------------------------------------------------------------
// Skeleton Loader Component
// ----------------------------------------------------------------------
const TeamCardSkeleton = ({ styles }) => (
  <div style={styles.card}>
    <div style={styles.skeletonImageContainer}>
      <div style={styles.skeletonImage} />
    </div>
    <div style={{ ...styles.skeletonText, width: '70%', height: '24px', margin: '0 auto 8px' }} />
    <div style={{ ...styles.skeletonText, width: '50%', height: '16px', margin: '0 auto 12px' }} />
    <div style={{ ...styles.skeletonText, width: '90%', height: '14px', margin: '0 auto 6px' }} />
    <div style={{ ...styles.skeletonText, width: '80%', height: '14px', margin: '0 auto 16px' }} />
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
      <div style={{ ...styles.skeletonText, width: '34px', height: '34px', borderRadius: '50%' }} />
      <div style={{ ...styles.skeletonText, width: '34px', height: '34px', borderRadius: '50%' }} />
      <div style={{ ...styles.skeletonText, width: '34px', height: '34px', borderRadius: '50%' }} />
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Team Card Component
// ----------------------------------------------------------------------
const TeamCard = ({ member, styles, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 25px 50px rgba(5, 150, 105, 0.2)' 
          : '0 12px 28px rgba(5, 150, 105, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {member.is_featured && (
        <div style={styles.featuredBadge}>
          <FiAward size={12} />
          <span>Featured</span>
        </div>
      )}

      {/* Image Container */}
      <div style={styles.imageContainer}>
        <div style={{
          ...styles.imageWrapper,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}>
          {!imageLoaded && (
            <div style={styles.imagePlaceholder}>
              <div style={styles.shimmer} />
            </div>
          )}
          <img
            src={member.image_url || member.image}
            alt={member.name}
            style={{
              ...styles.image,
              opacity: imageLoaded ? 1 : 0,
            }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* Status Indicator */}
        <div style={{
          ...styles.statusIndicator,
          backgroundColor: member.is_active ? '#10B981' : '#9CA3AF',
        }} />
      </div>

      {/* Content */}
      <div style={styles.cardContent}>
        <h3 style={styles.name}>{member.name}</h3>
        <p style={styles.role}>{member.role}</p>
        
        {member.department && (
          <span style={styles.department}>{member.department}</span>
        )}
        
        <p style={styles.bio}>{member.bio}</p>

        {/* Expertise Tags */}
        {member.expertise && member.expertise.length > 0 && (
          <div style={styles.expertiseContainer}>
            {member.expertise.slice(0, 3).map((skill, idx) => (
              <span key={idx} style={styles.expertiseTag}>{skill}</span>
            ))}
          </div>
        )}

        {/* Location */}
        {member.location && (
          <div style={styles.location}>
            <FiMapPin size={12} />
            <span>{member.location}</span>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div style={styles.socials}>
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.iconButton}
            aria-label="LinkedIn profile"
          >
            <FiLinkedin size={16} />
          </a>
        )}
        {member.twitter_url && (
          <a
            href={member.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.iconButton}
            aria-label="Twitter profile"
          >
            <FiTwitter size={16} />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            style={styles.iconButton}
            aria-label="Email"
          >
            <FiMail size={16} />
          </a>
        )}
      </div>
    </article>
  );
};

// ----------------------------------------------------------------------
// Stats Section
// ----------------------------------------------------------------------
const StatsSection = ({ styles }) => {
  const stats = [
    { icon: <FiUsers size={28} />, value: "15+", label: "Team Members" },
    { icon: <FiGlobe size={28} />, value: "4", label: "Countries Covered" },
    { icon: <FiAward size={28} />, value: "50+", label: "Years Combined Experience" },
    { icon: <FiHeart size={28} />, value: "2000+", label: "Happy Travelers" },
  ];

  return (
    <div style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <AnimatedSection key={index} animation="fadeInUp" delay={index * 0.1}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// Department Filter
// ----------------------------------------------------------------------
const DepartmentFilter = ({ departments, activeFilter, onFilterChange, styles }) => (
  <div style={styles.filterContainer}>
    <button
      style={{
        ...styles.filterButton,
        ...(activeFilter === 'all' ? styles.filterButtonActive : {}),
      }}
      onClick={() => onFilterChange('all')}
    >
      All Team
    </button>
    {departments.map((dept) => (
      <button
        key={dept}
        style={{
          ...styles.filterButton,
          ...(activeFilter === dept ? styles.filterButtonActive : {}),
        }}
        onClick={() => onFilterChange(dept)}
      >
        {dept}
      </button>
    ))}
  </div>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const TeamContent = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fallback data
  const fallbackMembers = [
    {
      id: 1,
      name: "IGIRANEZA Fabrice",
      role: "Founder & CEO",
      department: "Leadership",
      image_url: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
      expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"],
      location: "Kigali, Rwanda",
      linkedin_url: "https://linkedin.com",
      twitter_url: "https://twitter.com",
      email: "fabrice@altuvera.com",
      is_featured: true,
      is_active: true,
    },
    {
      id: 2,
      name: "UWIMANA Grace",
      role: "Head of Operations",
      department: "Operations",
      image_url: "https://randomuser.me/api/portraits/women/44.jpg",
      bio: "Ensures seamless coordination of every itinerary with precision, local expertise, and attention to detail.",
      expertise: ["Logistics Management", "Quality Assurance", "Team Coordination"],
      location: "Nairobi, Kenya",
      linkedin_url: "https://linkedin.com",
      email: "grace@altuvera.com",
      is_featured: false,
      is_active: true,
    },
    {
      id: 3,
      name: "MUTABAZI Jean",
      role: "Lead Safari Guide",
      department: "Guides",
      image_url: "https://randomuser.me/api/portraits/men/67.jpg",
      bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards for unforgettable expeditions.",
      expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"],
      location: "Serengeti, Tanzania",
      linkedin_url: "https://linkedin.com",
      email: "jean@altuvera.com",
      is_featured: true,
      is_active: true,
    },
    {
      id: 4,
      name: "INGABIRE Diane",
      role: "Customer Experience Manager",
      department: "Customer Service",
      image_url: "https://randomuser.me/api/portraits/women/28.jpg",
      bio: "Designs guest-first service experiences from initial inquiry through post-trip follow-up and feedback collection.",
      expertise: ["Client Relations", "Service Design", "Feedback Analysis"],
      location: "Kampala, Uganda",
      linkedin_url: "https://linkedin.com",
      twitter_url: "https://twitter.com",
      email: "diane@altuvera.com",
      is_featured: false,
      is_active: true,
    },
    {
      id: 5,
      name: "HABIMANA Patrick",
      role: "Conservation Liaison",
      department: "Conservation",
      image_url: "https://randomuser.me/api/portraits/men/52.jpg",
      bio: "Manages partnerships with wildlife conservancies and oversees community development initiatives across the region.",
      expertise: ["Conservation Strategy", "Community Engagement", "Sustainability"],
      location: "Bwindi, Uganda",
      linkedin_url: "https://linkedin.com",
      email: "patrick@altuvera.com",
      is_featured: false,
      is_active: true,
    },
    {
      id: 6,
      name: "MUKAMANA Claudine",
      role: "Marketing Director",
      department: "Marketing",
      image_url: "https://randomuser.me/api/portraits/women/65.jpg",
      bio: "Leads brand strategy and digital marketing initiatives to connect travelers with authentic African experiences.",
      expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"],
      location: "Kigali, Rwanda",
      linkedin_url: "https://linkedin.com",
      twitter_url: "https://twitter.com",
      email: "claudine@altuvera.com",
      is_featured: false,
      is_active: true,
    },
  ];

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teamAPI.getAll();
        // Adjust based on your API response structure
        const teamData = data.data || data;
        setMembers(teamData);
        setFilteredMembers(teamData);
      } catch (err) {
        console.warn('API fetch failed, using fallback data:', err.message);
        setMembers(fallbackMembers);
        setFilteredMembers(fallbackMembers);
        // Optionally set an error message to display to the user
        // setError('Could not load team members. Showing preview data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members by department
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter(m => m.department === activeFilter));
    }
  }, [activeFilter, members]);

  // Get unique departments
  const departments = [...new Set(members.map(m => m.department).filter(Boolean))];

  // --------------------------------------------------------------------
  // Styles object (unchanged from original)
  // --------------------------------------------------------------------
  const styles = {
    // Section Styles
    section: {
      padding: "100px 24px",
      background: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 50%, #ECFDF5 100%)",
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(5, 150, 105, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(52, 211, 153, 0.03) 0%, transparent 40%)
      `,
      pointerEvents: "none",
    },
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },
    
    // Heading Styles
    heading: {
      textAlign: "center",
      marginBottom: "60px",
    },
    label: {
      display: "inline-block",
      padding: "8px 20px",
      backgroundColor: "rgba(5, 150, 105, 0.1)",
      borderRadius: "50px",
      color: "#059669",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "20px",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(32px, 5vw, 52px)",
      color: "#064E3B",
      marginBottom: "16px",
      lineHeight: "1.2",
    },
    titleHighlight: {
      color: "#059669",
      position: "relative",
    },
    subtitle: {
      color: "#4B5563",
      fontSize: "18px",
      lineHeight: "1.8",
      maxWidth: "700px",
      margin: "0 auto",
    },
    divider: {
      width: "80px",
      height: "4px",
      background: "linear-gradient(90deg, #059669, #10B981)",
      margin: "24px auto 0",
      borderRadius: "2px",
    },

    // Stats Styles
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "24px",
      marginBottom: "70px",
      padding: "0 20px",
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "32px 24px",
      textAlign: "center",
      boxShadow: "0 8px 30px rgba(5, 150, 105, 0.08)",
      border: "1px solid rgba(209, 250, 229, 0.5)",
      transition: "all 0.3s ease",
    },
    statIcon: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#ECFDF5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 16px",
      color: "#059669",
    },
    statValue: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "36px",
      fontWeight: "700",
      color: "#064E3B",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "14px",
      color: "#6B7280",
      fontWeight: "500",
    },

    // Filter Styles
    filterContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "50px",
    },
    filterButton: {
      padding: "12px 24px",
      borderRadius: "50px",
      border: "2px solid #D1FAE5",
      backgroundColor: "white",
      color: "#059669",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    filterButtonActive: {
      backgroundColor: "#059669",
      borderColor: "#059669",
      color: "white",
    },

    // Grid Styles
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "30px",
      marginBottom: "60px",
    },

    // Card Styles
    card: {
      backgroundColor: "white",
      borderRadius: "24px",
      border: "1px solid rgba(209, 250, 229, 0.8)",
      boxShadow: "0 12px 28px rgba(5, 150, 105, 0.1)",
      padding: "32px 24px",
      textAlign: "center",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
    },
    featuredBadge: {
      position: "absolute",
      top: "16px",
      right: "16px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      backgroundColor: "#FEF3C7",
      color: "#D97706",
      fontSize: "11px",
      fontWeight: "700",
      borderRadius: "50px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    imageContainer: {
      position: "relative",
      width: "130px",
      height: "130px",
      margin: "0 auto 20px",
    },
    imageWrapper: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      overflow: "hidden",
      border: "4px solid #D1FAE5",
      transition: "all 0.4s ease",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "opacity 0.3s ease",
    },
    imagePlaceholder: {
      position: "absolute",
      inset: 0,
      backgroundColor: "#E5E7EB",
      borderRadius: "50%",
      overflow: "hidden",
    },
    shimmer: {
      position: "absolute",
      inset: 0,
      backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite linear",
    },
    statusIndicator: {
      position: "absolute",
      bottom: "8px",
      right: "8px",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      border: "3px solid white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
    cardContent: {
      marginBottom: "20px",
    },
    name: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "22px",
      color: "#111827",
      marginBottom: "6px",
      fontWeight: "600",
    },
    role: {
      fontSize: "15px",
      color: "#059669",
      fontWeight: "600",
      marginBottom: "8px",
    },
    department: {
      display: "inline-block",
      padding: "4px 12px",
      backgroundColor: "#F0FDF4",
      borderRadius: "50px",
      fontSize: "12px",
      color: "#047857",
      fontWeight: "500",
      marginBottom: "14px",
    },
    bio: {
      fontSize: "14px",
      color: "#6B7280",
      lineHeight: "1.7",
      marginBottom: "16px",
    },
    expertiseContainer: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "6px",
      marginBottom: "14px",
    },
    expertiseTag: {
      padding: "4px 10px",
      backgroundColor: "#ECFDF5",
      borderRadius: "6px",
      fontSize: "11px",
      color: "#059669",
      fontWeight: "500",
    },
    location: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#9CA3AF",
    },
    socials: {
      display: "flex",
      justifyContent: "center",
      gap: "12px",
      paddingTop: "16px",
      borderTop: "1px solid #F3F4F6",
    },
    iconButton: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "2px solid #A7F3D0",
      backgroundColor: "#ECFDF5",
      color: "#047857",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
    },

    // Skeleton Styles
    skeletonImageContainer: {
      width: "130px",
      height: "130px",
      margin: "0 auto 20px",
    },
    skeletonImage: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      backgroundColor: "#E5E7EB",
      backgroundImage: "linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite linear",
    },
    skeletonText: {
      backgroundColor: "#E5E7EB",
      backgroundImage: "linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite linear",
      borderRadius: "6px",
    },

    // CTA Styles
    cta: {
      textAlign: "center",
      padding: "50px 0",
      backgroundColor: "rgba(5, 150, 105, 0.03)",
      borderRadius: "24px",
      border: "1px solid rgba(209, 250, 229, 0.5)",
    },
    ctaTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "28px",
      color: "#064E3B",
      marginBottom: "12px",
    },
    ctaText: {
      fontSize: "16px",
      color: "#6B7280",
      marginBottom: "24px",
      maxWidth: "500px",
      margin: "0 auto 24px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      flexWrap: "wrap",
    },

    // Error State
    errorContainer: {
      textAlign: "center",
      padding: "60px 24px",
      backgroundColor: "#FEF2F2",
      borderRadius: "16px",
      marginBottom: "40px",
    },
    errorText: {
      color: "#DC2626",
      fontSize: "16px",
      marginBottom: "16px",
    },
  };

  // Inject global keyframes once (avoid duplicates)
  useEffect(() => {
    // Check if the style already exists to prevent duplicates
    if (!document.querySelector('#team-shimmer-keyframes')) {
      const styleSheet = document.createElement("style");
      styleSheet.id = 'team-shimmer-keyframes';
      styleSheet.textContent = `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @media (max-width: 768px) {
          .team-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-container {
            grid-template-columns: 1fr !important;
          }
        }
      `;
      document.head.appendChild(styleSheet);
      return () => {
        const existing = document.querySelector('#team-shimmer-keyframes');
        if (existing) existing.remove();
      };
    }
  }, []);

  return (
    <section style={styles.section}>
      <div style={styles.backgroundPattern} />
      
      <div style={styles.container}>
        {/* Header */}
        <AnimatedSection animation="fadeInUp">
          <div style={styles.heading}>
            <span style={styles.label}>Our People</span>
            <h2 style={styles.title}>
              Meet the <span style={styles.titleHighlight}>Team</span>
            </h2>
            <p style={styles.subtitle}>
              From strategic leadership to expert field guides, our dedicated professionals 
              work collaboratively to deliver seamless, responsible, and deeply authentic 
              East African travel experiences.
            </p>
            <div style={styles.divider} />
          </div>
        </AnimatedSection>

        {/* Stats Section */}
        <StatsSection styles={styles} />

        {/* Department Filter */}
        {departments.length > 0 && (
          <AnimatedSection animation="fadeInUp">
            <DepartmentFilter
              departments={departments}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              styles={styles}
            />
          </AnimatedSection>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Team Grid */}
        <div style={styles.grid} className="team-grid">
          {loading ? (
            // Skeleton Loaders
            [...Array(6)].map((_, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 0.08}>
                <TeamCardSkeleton styles={styles} />
              </AnimatedSection>
            ))
          ) : (
            // Team Cards
            filteredMembers.map((member, index) => (
              <AnimatedSection
                key={member.id}
                animation="fadeInUp"
                delay={index * 0.1}
              >
                <TeamCard member={member} styles={styles} index={index} />
              </AnimatedSection>
            ))
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredMembers.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#6B7280', fontSize: '16px' }}>
                No team members found in this department.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* CTA Section */}
        <AnimatedSection animation="fadeInUp">
          <div style={styles.cta}>
            <h3 style={styles.ctaTitle}>Ready to Start Your Adventure?</h3>
            <p style={styles.ctaText}>
              Connect with our team to begin planning your transformative East African journey.
            </p>
            <div style={styles.buttonGroup}>
              <Button
                to="/contact"
                variant="primary"
                icon={<FiArrowRight size={18} />}
              >
                Contact Our Team
              </Button>
              <Button
                to="/destinations"
                variant="outline"
              >
                Explore Destinations
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TeamContent;