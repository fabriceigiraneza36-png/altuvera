import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FiArrowRight,
  FiLinkedin,
  FiMail,
  FiTwitter,
  FiInstagram,
  FiExternalLink,
  FiMapPin,
  FiAward,
  FiUsers,
  FiGlobe,
  FiHeart,
  FiPhone,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";
import AnimatedSection from "./AnimatedSection";
import Button from "./Button";

// ══════════════════════════════════════════════════════════════════════════════
// API SERVICE — Connects to the updated backend controller
// ══════════════════════════════════════════════════════════════════════════════
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://backend-1-ghrv.onrender.com/api";

const teamAPI = {
  /**
   * Generic fetch wrapper with timeout, error normalisation, and retry
   */
  async _fetch(endpoint, options = {}, retries = 2) {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message || `Request failed with status ${response.status}`
        );
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeout);

      // Retry on network errors (not on 4xx/5xx)
      if (retries > 0 && err.name !== "AbortError" && !err.message.includes("status")) {
        await new Promise((r) => setTimeout(r, 1000));
        return this._fetch(endpoint, options, retries - 1);
      }

      throw err;
    }
  },

  /** GET /api/team — all active members with optional query params */
  async getAll(params = {}) {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      )
    ).toString();
    return this._fetch(`/team${query ? `?${query}` : ""}`);
  },

  /** GET /api/team/:identifier — by ID or slug */
  async getById(identifier) {
    return this._fetch(`/team/${identifier}`);
  },

  /** GET /api/team/department/:department */
  async getByDepartment(department) {
    return this._fetch(`/team/department/${encodeURIComponent(department)}`);
  },

  /** GET /api/team/featured?limit=N */
  async getFeatured(limit = 6) {
    return this._fetch(`/team/featured?limit=${limit}`);
  },

  /** GET /api/team/departments/list */
  async getDepartments() {
    return this._fetch("/team/departments/list");
  },

  /** GET /api/team/stats */
  async getStats() {
    return this._fetch("/team/stats");
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// FALLBACK DATA — Used when the API is unreachable
// ══════════════════════════════════════════════════════════════════════════════
const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: "IGIRANEZA Fabrice",
    slug: "igiraneza-fabrice",
    role: "Founder & CEO",
    department: "Leadership",
    image_url: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Visionary entrepreneur leading Altuvera's mission to deliver transformative travel experiences across East Africa.",
    expertise: ["Strategic Planning", "Tourism Innovation", "Partnership Development"],
    languages: ["English", "French", "Kinyarwanda"],
    certifications: [],
    years_experience: 12,
    location: "Kigali, Rwanda",
    country: "Rwanda",
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    instagram_url: null,
    website_url: null,
    email: "fabrice@altuvera.com",
    phone: null,
    is_featured: true,
    is_active: true,
    show_on_homepage: true,
    display_order: 1,
    joined_date: "2020-01-15",
  },
  {
    id: 2,
    name: "UWIMANA Grace",
    slug: "uwimana-grace",
    role: "Head of Operations",
    department: "Operations",
    image_url: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Ensures seamless coordination of every itinerary with precision, local expertise, and attention to detail.",
    expertise: ["Logistics Management", "Quality Assurance", "Team Coordination"],
    languages: ["English", "Swahili"],
    certifications: [],
    years_experience: 8,
    location: "Musanze, Rwanda",
    country: "Rwanda",
    linkedin_url: "https://linkedin.com",
    twitter_url: null,
    instagram_url: null,
    website_url: null,
    email: "grace@altuvera.com",
    phone: null,
    is_featured: false,
    is_active: true,
    show_on_homepage: true,
    display_order: 2,
    joined_date: "2021-03-01",
  },
  {
    id: 3,
    name: "MUTABAZI Jean",
    slug: "mutabazi-jean",
    role: "Lead Safari Guide",
    department: "Guides",
    image_url: "https://randomuser.me/api/portraits/men/67.jpg",
    bio: "Expert wildlife guide combining extensive field knowledge with exceptional safety standards for unforgettable expeditions.",
    expertise: ["Wildlife Tracking", "Bird Identification", "Conservation Education"],
    languages: ["English", "Swahili", "French"],
    certifications: ["Certified Safari Guide", "Wilderness First Aid"],
    years_experience: 15,
    location: "Serengeti, Tanzania",
    country: "Tanzania",
    linkedin_url: "https://linkedin.com",
    twitter_url: null,
    instagram_url: null,
    website_url: null,
    email: "jean@altuvera.com",
    phone: null,
    is_featured: true,
    is_active: true,
    show_on_homepage: true,
    display_order: 3,
    joined_date: "2020-06-20",
  },
  {
    id: 4,
    name: "INGABIRE Diane",
    slug: "ingabire-diane",
    role: "Customer Experience Manager",
    department: "Customer Service",
    image_url: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "Designs guest-first service experiences from initial inquiry through post-trip follow-up and feedback collection.",
    expertise: ["Client Relations", "Service Design", "Feedback Analysis"],
    languages: ["English", "French"],
    certifications: [],
    years_experience: 6,
    location: "Kampala, Uganda",
    country: "Uganda",
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    instagram_url: null,
    website_url: null,
    email: "diane@altuvera.com",
    phone: null,
    is_featured: false,
    is_active: true,
    show_on_homepage: true,
    display_order: 4,
    joined_date: "2021-09-10",
  },
  {
    id: 5,
    name: "HABIMANA Patrick",
    slug: "habimana-patrick",
    role: "Conservation Liaison",
    department: "Conservation",
    image_url: "https://randomuser.me/api/portraits/men/52.jpg",
    bio: "Manages partnerships with wildlife conservancies and oversees community development initiatives across the region.",
    expertise: ["Conservation Strategy", "Community Engagement", "Sustainability"],
    languages: ["English", "Rukiga"],
    certifications: ["Conservation Management Certificate"],
    years_experience: 10,
    location: "Bwindi, Uganda",
    country: "Uganda",
    linkedin_url: "https://linkedin.com",
    twitter_url: null,
    instagram_url: null,
    website_url: null,
    email: "patrick@altuvera.com",
    phone: null,
    is_featured: false,
    is_active: true,
    show_on_homepage: false,
    display_order: 5,
    joined_date: "2021-01-05",
  },
  {
    id: 6,
    name: "MUKAMANA Claudine",
    slug: "mukamana-claudine",
    role: "Marketing Director",
    department: "Marketing",
    image_url: "https://randomuser.me/api/portraits/women/65.jpg",
    bio: "Leads brand strategy and digital marketing initiatives to connect travelers with authentic African experiences.",
    expertise: ["Digital Marketing", "Brand Strategy", "Content Creation"],
    languages: ["English", "French", "Kinyarwanda"],
    certifications: [],
    years_experience: 7,
    location: "Kigali, Rwanda",
    country: "Rwanda",
    linkedin_url: "https://linkedin.com",
    twitter_url: "https://twitter.com",
    instagram_url: "https://instagram.com",
    website_url: null,
    email: "claudine@altuvera.com",
    phone: null,
    is_featured: false,
    is_active: true,
    show_on_homepage: true,
    display_order: 6,
    joined_date: "2022-02-14",
  },
];

const FALLBACK_STATS = {
  total_members: 15,
  countries_covered: 4,
  combined_experience: 50,
  happy_travelers: 2000,
};

// ══════════════════════════════════════════════════════════════════════════════
// SHIMMER / SKELETON LOADER
// ══════════════════════════════════════════════════════════════════════════════
const TeamCardSkeleton = ({ styles }) => (
  <div style={styles.card} aria-hidden="true">
    <div style={styles.skeletonImageContainer}>
      <div style={styles.skeletonImage} />
    </div>
    <div style={{ ...styles.skeletonText, width: "70%", height: "24px", margin: "0 auto 8px" }} />
    <div style={{ ...styles.skeletonText, width: "50%", height: "16px", margin: "0 auto 12px" }} />
    <div style={{ ...styles.skeletonText, width: "40%", height: "22px", margin: "0 auto 14px", borderRadius: "50px" }} />
    <div style={{ ...styles.skeletonText, width: "90%", height: "14px", margin: "0 auto 6px" }} />
    <div style={{ ...styles.skeletonText, width: "80%", height: "14px", margin: "0 auto 6px" }} />
    <div style={{ ...styles.skeletonText, width: "70%", height: "14px", margin: "0 auto 16px" }} />
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "14px" }}>
      <div style={{ ...styles.skeletonText, width: "60px", height: "22px", borderRadius: "6px" }} />
      <div style={{ ...styles.skeletonText, width: "60px", height: "22px", borderRadius: "6px" }} />
      <div style={{ ...styles.skeletonText, width: "60px", height: "22px", borderRadius: "6px" }} />
    </div>
    <div style={{ ...styles.skeletonText, width: "45%", height: "14px", margin: "0 auto 16px" }} />
    <div style={{ display: "flex", justifyContent: "center", gap: "10px", paddingTop: "16px", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ ...styles.skeletonText, width: "40px", height: "40px", borderRadius: "50%" }} />
      <div style={{ ...styles.skeletonText, width: "40px", height: "40px", borderRadius: "50%" }} />
      <div style={{ ...styles.skeletonText, width: "40px", height: "40px", borderRadius: "50%" }} />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// TEAM CARD — Renders every field the backend returns
// ══════════════════════════════════════════════════════════════════════════════
const TeamCard = ({ member, styles }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imageSrc = member.image_url || member.image;
  const expertise = Array.isArray(member.expertise) ? member.expertise : [];
  const languages = Array.isArray(member.languages) ? member.languages : [];
  const certifications = Array.isArray(member.certifications) ? member.certifications : [];

  // Count how many social links exist (for layout)
  const socialLinks = [
    member.linkedin_url && { href: member.linkedin_url, icon: <FiLinkedin size={16} />, label: "LinkedIn" },
    member.twitter_url && { href: member.twitter_url, icon: <FiTwitter size={16} />, label: "Twitter" },
    member.instagram_url && { href: member.instagram_url, icon: <FiInstagram size={16} />, label: "Instagram" },
    member.website_url && { href: member.website_url, icon: <FiExternalLink size={16} />, label: "Website" },
    member.email && { href: `mailto:${member.email}`, icon: <FiMail size={16} />, label: "Email", external: false },
    member.phone && { href: `tel:${member.phone}`, icon: <FiPhone size={16} />, label: "Phone", external: false },
  ].filter(Boolean);

  // Generate initials for fallback avatar
  const initials = member.name
    ? member.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <article
      style={{
        ...styles.card,
        transform: isHovered ? "translateY(-12px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 25px 50px rgba(5, 150, 105, 0.2)"
          : "0 12px 28px rgba(5, 150, 105, 0.1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
    >
      {/* Featured Badge */}
      {member.is_featured && (
        <div style={styles.featuredBadge}>
          <FiAward size={12} />
          <span>Featured</span>
        </div>
      )}

      {/* Image */}
      <div style={styles.imageContainer}>
        <div
          style={{
            ...styles.imageWrapper,
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          {/* Shimmer placeholder while loading */}
          {!imageLoaded && !imageError && (
            <div style={styles.imagePlaceholder}>
              <div style={styles.shimmer} />
            </div>
          )}

          {/* Initials fallback on error */}
          {imageError && (
            <div style={styles.initialsAvatar}>
              <span style={styles.initialsText}>{initials}</span>
            </div>
          )}

          {/* Actual image */}
          {imageSrc && !imageError && (
            <img
              src={imageSrc}
              alt={`${member.name} – ${member.role}`}
              style={{
                ...styles.image,
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              loading="lazy"
            />
          )}
        </div>

        {/* Active Status Dot */}
        <div
          style={{
            ...styles.statusIndicator,
            backgroundColor: member.is_active ? "#10B981" : "#9CA3AF",
          }}
          title={member.is_active ? "Active" : "Inactive"}
        />
      </div>

      {/* Card Content */}
      <div style={styles.cardContent}>
        {/* Name */}
        <h3 style={styles.name}>{member.name}</h3>

        {/* Role */}
        <p style={styles.role}>{member.role}</p>

        {/* Department */}
        {member.department && (
          <span style={styles.department}>{member.department}</span>
        )}

        {/* Bio */}
        {member.bio && <p style={styles.bio}>{member.bio}</p>}

        {/* Expertise Tags */}
        {expertise.length > 0 && (
          <div style={styles.expertiseContainer}>
            {expertise.slice(0, 3).map((skill, idx) => (
              <span key={idx} style={styles.expertiseTag}>
                {skill}
              </span>
            ))}
            {expertise.length > 3 && (
              <span style={styles.expertiseMore}>+{expertise.length - 3}</span>
            )}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div style={styles.languagesRow}>
            <FiGlobe size={12} style={{ flexShrink: 0, color: "#9CA3AF" }} />
            <span style={styles.languagesText}>
              {languages.slice(0, 3).join(", ")}
              {languages.length > 3 ? ` +${languages.length - 3}` : ""}
            </span>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div style={styles.certificationsRow}>
            <FiAward size={12} style={{ flexShrink: 0, color: "#D97706" }} />
            <span style={styles.certificationsText}>
              {certifications[0]}
              {certifications.length > 1 ? ` +${certifications.length - 1}` : ""}
            </span>
          </div>
        )}

        {/* Years Experience */}
        {member.years_experience > 0 && (
          <div style={styles.experienceRow}>
            <FiCalendar size={12} style={{ flexShrink: 0, color: "#9CA3AF" }} />
            <span style={styles.experienceText}>
              {member.years_experience}+ years experience
            </span>
          </div>
        )}

        {/* Location */}
        {member.location && (
          <div style={styles.locationRow}>
            <FiMapPin size={12} style={{ flexShrink: 0 }} />
            <span>{member.location}</span>
          </div>
        )}
      </div>

      {/* Social / Contact Links */}
      {socialLinks.length > 0 && (
        <div style={styles.socials}>
          {socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target={link.external !== false ? "_blank" : undefined}
              rel={link.external !== false ? "noopener noreferrer" : undefined}
              style={styles.iconButton}
              aria-label={link.label}
              title={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STATS SECTION — Dynamic from /api/team/stats with fallback
// ══════════════════════════════════════════════════════════════════════════════
const StatsSection = ({ styles }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await teamAPI.getStats();
        if (!cancelled) setStats(res.data);
      } catch {
        if (!cancelled) setStats(FALLBACK_STATS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const data = stats || FALLBACK_STATS;

  const items = [
    { icon: <FiUsers size={28} />, value: `${data.total_members || 3}+`, label: "Team Members" },
    { icon: <FiGlobe size={28} />, value: `${data.countries_covered || 2}`, label: "Countries Covered" },
    { icon: <FiAward size={28} />, value: `${data.combined_experience || 5}+`, label: "Years Combined Experience" },
    { icon: <FiHeart size={28} />, value: `${data.happy_travelers || "2"}+`, label: "Happy Travelers" },
  ];

  return (
    <div style={styles.statsContainer} className="stats-container">
      {items.map((stat, index) => (
        <AnimatedSection key={index} animation="fadeInUp" delay={index * 0.1}>
          <div
            style={{
              ...styles.statCard,
              ...(loading ? { opacity: 0.6 } : {}),
            }}
          >
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={styles.statValue}>{loading ? "—" : stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DEPARTMENT FILTER
// ══════════════════════════════════════════════════════════════════════════════
const DepartmentFilter = ({ departments, activeFilter, onFilterChange, memberCounts, styles }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // On mobile, show a collapsible list
  const visibleDepartments = isExpanded ? departments : departments.slice(0, 5);
  const hasMore = departments.length > 5;

  return (
    <div style={styles.filterContainer}>
      <button
        style={{
          ...styles.filterButton,
          ...(activeFilter === "all" ? styles.filterButtonActive : {}),
        }}
        onClick={() => onFilterChange("all")}
        aria-pressed={activeFilter === "all"}
      >
        All Team
        {memberCounts.all > 0 && (
          <span style={styles.filterCount}>{memberCounts.all}</span>
        )}
      </button>

      {visibleDepartments.map((dept) => (
        <button
          key={dept}
          style={{
            ...styles.filterButton,
            ...(activeFilter === dept ? styles.filterButtonActive : {}),
          }}
          onClick={() => onFilterChange(dept)}
          aria-pressed={activeFilter === dept}
        >
          {dept}
          {(memberCounts[dept] || 0) > 0 && (
            <span
              style={{
                ...styles.filterCount,
                ...(activeFilter === dept ? styles.filterCountActive : {}),
              }}
            >
              {memberCounts[dept]}
            </span>
          )}
        </button>
      ))}

      {hasMore && (
        <button
          style={styles.filterExpandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Show fewer departments" : "Show more departments"}
        >
          <FiChevronDown
            size={16}
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
          {isExpanded ? "Less" : `+${departments.length - 5}`}
        </button>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ERROR STATE
// ══════════════════════════════════════════════════════════════════════════════
const ErrorState = ({ message, onRetry, styles }) => (
  <div style={styles.errorContainer}>
    <FiAlertCircle size={40} style={{ color: "#DC2626", marginBottom: "16px" }} />
    <p style={styles.errorText}>{message}</p>
    <button style={styles.retryButton} onClick={onRetry}>
      <FiRefreshCw size={16} />
      <span>Try Again</span>
    </button>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════════════════════════
const EmptyState = ({ activeFilter, onReset, styles }) => (
  <div style={styles.emptyContainer}>
    <FiUsers size={48} style={{ color: "#D1D5DB", marginBottom: "16px" }} />
    <p style={styles.emptyTitle}>No team members found</p>
    <p style={styles.emptyText}>
      {activeFilter !== "all"
        ? `No team members in the "${activeFilter}" department.`
        : "Team members will appear here once added."}
    </p>
    {activeFilter !== "all" && (
      <button style={styles.resetFilterButton} onClick={onReset}>
        View All Team Members
      </button>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const TeamContent = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [usingFallback, setUsingFallback] = useState(false);
  const isMounted = useRef(true);

  // ── Fetch team members and departments concurrently ──────────────────
  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const [membersRes, departmentsRes] = await Promise.allSettled([
        teamAPI.getAll({ sort: "display_order", order: "ASC", limit: 100 }),
        teamAPI.getDepartments(),
      ]);

      if (!isMounted.current) return;

      // Members
      if (membersRes.status === "fulfilled") {
        const teamData = membersRes.value.data || membersRes.value || [];
        const memberArray = Array.isArray(teamData) ? teamData : [];
        setMembers(memberArray);
        setFilteredMembers(memberArray);
      } else {
        throw new Error(membersRes.reason?.message || "Failed to fetch team members");
      }

      // Departments
      if (departmentsRes.status === "fulfilled") {
        const deptData = departmentsRes.value.data || departmentsRes.value || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);
      }
      // If departments fail, derive from members
      else if (membersRes.status === "fulfilled") {
        const teamData = membersRes.value.data || membersRes.value || [];
        const memberArray = Array.isArray(teamData) ? teamData : [];
        const derived = [...new Set(memberArray.map((m) => m.department).filter(Boolean))].sort();
        setDepartments(derived);
      }
    } catch (err) {
      if (!isMounted.current) return;

      console.warn("API fetch failed, using fallback data:", err.message);
      setMembers(FALLBACK_MEMBERS);
      setFilteredMembers(FALLBACK_MEMBERS);
      setDepartments(
        [...new Set(FALLBACK_MEMBERS.map((m) => m.department).filter(Boolean))].sort()
      );
      setUsingFallback(true);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // ── Filter members when activeFilter changes ────────────────────────
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(
        members.filter(
          (m) => m.department && m.department.toLowerCase() === activeFilter.toLowerCase()
        )
      );
    }
  }, [activeFilter, members]);

  // ── Compute member counts per department ────────────────────────────
  const memberCounts = useMemo(() => {
    const counts = { all: members.length };
    members.forEach((m) => {
      if (m.department) {
        counts[m.department] = (counts[m.department] || 0) + 1;
      }
    });
    return counts;
  }, [members]);

  // ── Retry handler ───────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setActiveFilter("all");
    fetchData();
  }, [fetchData]);

  // ════════════════════════════════════════════════════════════════════
  // STYLES
  // ════════════════════════════════════════════════════════════════════
  const styles = {
    // Section
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
        radial-gradient(circle at 20% 20%, rgba(5,150,105,0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(16,185,129,0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(52,211,153,0.03) 0%, transparent 40%)
      `,
      pointerEvents: "none",
    },
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    },

    // Heading
    heading: { textAlign: "center", marginBottom: "60px" },
    label: {
      display: "inline-block",
      padding: "8px 20px",
      backgroundColor: "rgba(5,150,105,0.1)",
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
    titleHighlight: { color: "#059669", position: "relative" },
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

    // Fallback banner
    fallbackBanner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "12px 20px",
      backgroundColor: "#FFFBEB",
      border: "1px solid #FDE68A",
      borderRadius: "12px",
      marginBottom: "30px",
      color: "#92400E",
      fontSize: "14px",
      fontWeight: "500",
    },

    // Stats
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
      boxShadow: "0 8px 30px rgba(5,150,105,0.08)",
      border: "1px solid rgba(209,250,229,0.5)",
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
    statLabel: { fontSize: "14px", color: "#6B7280", fontWeight: "500" },

    // Filters
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
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    filterButtonActive: {
      backgroundColor: "#059669",
      borderColor: "#059669",
      color: "white",
    },
    filterCount: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "22px",
      height: "22px",
      padding: "0 6px",
      borderRadius: "50px",
      backgroundColor: "rgba(5,150,105,0.12)",
      color: "#059669",
      fontSize: "11px",
      fontWeight: "700",
    },
    filterCountActive: {
      backgroundColor: "rgba(255,255,255,0.25)",
      color: "white",
    },
    filterExpandButton: {
      padding: "12px 20px",
      borderRadius: "50px",
      border: "2px dashed #D1FAE5",
      backgroundColor: "transparent",
      color: "#059669",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },

    // Grid
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "30px",
      marginBottom: "60px",
    },

    // Card
    card: {
      backgroundColor: "white",
      borderRadius: "24px",
      border: "1px solid rgba(209,250,229,0.8)",
      boxShadow: "0 12px 28px rgba(5,150,105,0.1)",
      padding: "32px 24px",
      textAlign: "center",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
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
      zIndex: 2,
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
      animation: "teamShimmer 1.5s infinite linear",
    },
    initialsAvatar: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D1FAE5",
      borderRadius: "50%",
    },
    initialsText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "36px",
      fontWeight: "700",
      color: "#059669",
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
      marginBottom: "auto",
      paddingBottom: "20px",
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
    expertiseMore: {
      padding: "4px 10px",
      backgroundColor: "#F3F4F6",
      borderRadius: "6px",
      fontSize: "11px",
      color: "#6B7280",
      fontWeight: "500",
    },
    languagesRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#6B7280",
      marginBottom: "8px",
    },
    languagesText: {
      fontSize: "12px",
      color: "#6B7280",
    },
    certificationsRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#92400E",
      marginBottom: "8px",
    },
    certificationsText: {
      fontSize: "12px",
      color: "#92400E",
    },
    experienceRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#6B7280",
      marginBottom: "8px",
    },
    experienceText: {
      fontSize: "12px",
      color: "#6B7280",
    },
    locationRow: {
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
      flexWrap: "wrap",
      gap: "10px",
      paddingTop: "16px",
      borderTop: "1px solid #F3F4F6",
      marginTop: "auto",
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

    // Skeleton
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
      animation: "teamShimmer 1.5s infinite linear",
    },
    skeletonText: {
      backgroundColor: "#E5E7EB",
      backgroundImage: "linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%)",
      backgroundSize: "200% 100%",
      animation: "teamShimmer 1.5s infinite linear",
      borderRadius: "6px",
    },

    // CTA
    cta: {
      textAlign: "center",
      padding: "50px 30px",
      backgroundColor: "#059669",
      borderRadius: "24px",
      border: "1px solid rgba(209,250,229,0.5)",
    },
    ctaTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: "28px",
      color: "#064E3B",
      marginBottom: "12px",
    },
    ctaText: {
      fontSize: "16px",
      color: "#9fa7b5",
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

    // Error
    errorContainer: {
      textAlign: "center",
      padding: "60px 24px",
      backgroundColor: "#FEF2F2",
      borderRadius: "16px",
      marginBottom: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    errorText: {
      color: "#DC2626",
      fontSize: "16px",
      marginBottom: "20px",
    },
    retryButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 28px",
      borderRadius: "50px",
      border: "2px solid #DC2626",
      backgroundColor: "white",
      color: "#DC2626",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },

    // Empty
    emptyContainer: {
      textAlign: "center",
      padding: "60px 24px",
      backgroundColor: "#F9FAFB",
      borderRadius: "16px",
      marginBottom: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    emptyTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },
    emptyText: {
      fontSize: "14px",
      color: "#6B7280",
      marginBottom: "20px",
    },
    resetFilterButton: {
      padding: "10px 24px",
      borderRadius: "50px",
      border: "2px solid #D1FAE5",
      backgroundColor: "white",
      color: "#059669",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };

  // ── Inject keyframes & responsive overrides ─────────────────────────
  useEffect(() => {
    if (!document.querySelector("#team-content-keyframes")) {
      const sheet = document.createElement("style");
      sheet.id = "team-content-keyframes";
      sheet.textContent = `
        @keyframes teamShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
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

        /* Icon button hover */
        .team-grid a[aria-label]:hover {
          background-color: #059669 !important;
          border-color: #059669 !important;
          color: white !important;
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(sheet);
      return () => {
        const el = document.querySelector("#team-content-keyframes");
        if (el) el.remove();
      };
    }
  }, []);

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════
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
              From strategic leadership to expert field guides, our dedicated
              professionals work collaboratively to deliver seamless,
              responsible, and deeply authentic East African travel experiences.
            </p>
            <div style={styles.divider} />
          </div>
        </AnimatedSection>

        {/* Fallback Warning Banner */}
        {usingFallback && !loading && (
          <AnimatedSection animation="fadeInUp">
            <div style={styles.fallbackBanner}>
              <FiAlertCircle size={16} />
              <span>Showing preview data — live data will load when the server is available.</span>
              <button
                onClick={handleRetry}
                style={{
                  background: "none",
                  border: "none",
                  color: "#059669",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginLeft: "4px",
                }}
              >
                Retry
              </button>
            </div>
          </AnimatedSection>
        )}

        {/* Stats */}
        <StatsSection styles={styles} />

        {/* Department Filter */}
        {departments.length > 0 && !loading && (
          <AnimatedSection animation="fadeInUp">
            <DepartmentFilter
              departments={departments}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              memberCounts={memberCounts}
              styles={styles}
            />
          </AnimatedSection>
        )}

        {/* Error State */}
        {error && (
          <AnimatedSection animation="fadeInUp">
            <ErrorState
              message={error}
              onRetry={handleRetry}
              styles={styles}
            />
          </AnimatedSection>
        )}

        {/* Team Grid */}
        <div style={styles.grid} className="team-grid" role="list">
          {loading
            ? [...Array(6)].map((_, index) => (
                <AnimatedSection key={`skeleton-${index}`} animation="fadeInUp" delay={index * 0.08}>
                  <TeamCardSkeleton styles={styles} />
                </AnimatedSection>
              ))
            : filteredMembers.map((member, index) => (
                <AnimatedSection
                  key={member.id || index}
                  animation="fadeInUp"
                  delay={index * 0.1}
                >
                  <TeamCard member={member} styles={styles} />
                </AnimatedSection>
              ))}
        </div>

        {/* Empty State */}
        {!loading && !error && filteredMembers.length === 0 && (
          <AnimatedSection animation="fadeInUp">
            <EmptyState
              activeFilter={activeFilter}
              onReset={() => setActiveFilter("all")}
              styles={styles}
            />
          </AnimatedSection>
        )}

        {/* CTA Section */}
        <AnimatedSection animation="fadeInUp">
          <div style={styles.cta}>
            <h3 style={styles.ctaTitle}>Ready to Start Your Adventure?</h3>
            <p style={styles.ctaText}>
              Connect with our team to begin planning your transformative East
              African journey.
            </p>
            <div style={styles.buttonGroup}>
              <Button
                to="/contact"
                variant="primary"
                icon={<FiArrowRight size={18} />}
              >
                Contact Our Team
              </Button>
              <Button to="/destinations" variant="outline">
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