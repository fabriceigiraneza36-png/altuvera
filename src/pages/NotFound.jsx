import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiSearch, 
  FiMapPin, 
  FiArrowRight,
  FiCompass 
} from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import Button from '../components/common/Button';

/**
 * Navigation suggestion configuration
 * @typedef {Object} NavigationSuggestion
 * @property {React.ComponentType} icon - Icon component
 * @property {string} text - Display text
 * @property {string} path - Navigation path
 * @property {string} ariaLabel - Accessibility label
 */

/** @type {NavigationSuggestion[]} */
const NAVIGATION_SUGGESTIONS = [
  { 
    icon: FiMapPin, 
    text: 'Explore Destinations', 
    path: '/destinations',
    ariaLabel: 'Navigate to destinations page'
  },
  { 
    icon: FiSearch, 
    text: 'Search Our Services', 
    path: '/services',
    ariaLabel: 'Navigate to services page'
  },
  { 
    icon: FiHome, 
    text: 'Return Home', 
    path: '/',
    ariaLabel: 'Navigate to home page'
  },
];

/** Design system color tokens */
const COLORS = {
  primary: {
    main: '#059669',
    light: '#10B981',
    lighter: '#D1FAE5',
    lightest: '#F0FDF4',
  },
  neutral: {
    dark: '#1a1a1a',
    medium: '#6B7280',
    light: '#FFFFFF',
  },
  shadow: {
    soft: '0 10px 40px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
};

/** SVG pattern for background decoration */
const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/**
 * Floating decorative element component
 * @param {Object} props
 * @param {string} props.size - Element size (CSS value)
 * @param {Object} props.position - Position coordinates
 */
const FloatingElement = ({ size, position }) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%)`,
      pointerEvents: 'none',
      ...position,
    }}
  />
);

/**
 * Suggestion link card component with hover interactions
 * @param {Object} props
 * @param {NavigationSuggestion} props.suggestion - Suggestion data
 * @param {number} props.index - Item index for animation delay
 */
const SuggestionCard = ({ suggestion, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const IconComponent = suggestion.icon;

  const cardStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 24px',
    backgroundColor: isHovered ? COLORS.primary.lighter : COLORS.primary.lightest,
    borderRadius: '16px',
    textDecoration: 'none',
    color: COLORS.neutral.dark,
    fontWeight: '500',
    fontSize: '15px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isHovered ? 'translateX(12px)' : 'translateX(0)',
    animationDelay: `${index * 100}ms`,
  }), [isHovered, index]);

  const iconContainerStyles = useMemo(() => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: isHovered ? COLORS.primary.main : COLORS.primary.lighter,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isHovered ? COLORS.neutral.light : COLORS.primary.main,
    transition: 'all 0.3s ease',
    flexShrink: 0,
  }), [isHovered]);

  return (
    <Link
      to={suggestion.path}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={suggestion.ariaLabel}
    >
      <span style={iconContainerStyles}>
        <IconComponent size={20} aria-hidden="true" />
      </span>
      <span>{suggestion.text}</span>
      <FiArrowRight 
        size={18} 
        style={{ 
          marginLeft: 'auto', 
          color: COLORS.primary.main,
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }} 
        aria-hidden="true"
      />
    </Link>
  );
};

/**
 * 404 Not Found Page Component
 * 
 * Displays a user-friendly error page when a route is not found.
 * Features animated elements, navigation suggestions, and clear CTAs.
 * 
 * @component
 * @example
 * return <NotFound />
 */
const NotFound = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      navigate('/');
    }
  }, [navigate]);

  const styles = useMemo(() => ({
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary.lightest,
      padding: 'clamp(24px, 5vw, 60px)',
      position: 'relative',
      overflow: 'hidden',
    },
    pattern: {
      position: 'absolute',
      inset: 0,
      backgroundImage: BACKGROUND_PATTERN,
      pointerEvents: 'none',
    },
    content: {
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
      maxWidth: '640px',
      width: '100%',
    },
    illustration: {
      marginBottom: 'clamp(32px, 5vw, 48px)',
      position: 'relative',
      display: 'inline-block',
    },
    errorCode: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(120px, 20vw, 200px)',
      fontWeight: '700',
      background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1',
      margin: 0,
      letterSpacing: '-0.02em',
    },
    compassIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 0.15,
      pointerEvents: 'none',
    },
    heading: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 'clamp(28px, 4vw, 40px)',
      fontWeight: '700',
      color: COLORS.neutral.dark,
      marginBottom: '16px',
      lineHeight: '1.2',
    },
    description: {
      fontSize: 'clamp(16px, 2vw, 18px)',
      color: COLORS.neutral.medium,
      marginBottom: 'clamp(32px, 5vw, 48px)',
      lineHeight: '1.8',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      marginBottom: 'clamp(40px, 6vw, 60px)',
      flexWrap: 'wrap',
    },
    suggestionsPanel: {
      backgroundColor: COLORS.neutral.light,
      borderRadius: '28px',
      padding: 'clamp(28px, 4vw, 44px)',
      boxShadow: COLORS.shadow.soft,
      border: `1px solid ${COLORS.primary.lighter}`,
    },
    suggestionsHeading: {
      fontSize: '16px',
      fontWeight: '600',
      color: COLORS.neutral.dark,
      marginBottom: '24px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    suggestionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
  }), []);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Safari Adventures</title>
        <meta 
          name="description" 
          content="The page you're looking for cannot be found. Explore our destinations or return home." 
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <main style={styles.container} role="main">
        <div style={styles.pattern} aria-hidden="true" />
        
        {/* Decorative floating elements */}
        <FloatingElement 
          size="400px" 
          position={{ top: '-100px', right: '-100px' }} 
        />
        <FloatingElement 
          size="300px" 
          position={{ bottom: '-50px', left: '-50px' }} 
        />

        <article style={styles.content}>
          {/* Error illustration */}
          <figure style={styles.illustration}>
            <h1 style={styles.errorCode} aria-label="Error 404">
              404
            </h1>
            <FiCompass 
              size={80} 
              style={styles.compassIcon}
              aria-hidden="true"
            />
          </figure>

          {/* Error message */}
          <h2 style={styles.heading}>Lost in the Wilderness?</h2>
          <p style={styles.description}>
            Even the best explorers sometimes take a wrong turn. The page you're 
            looking for seems to have wandered off into the savanna. Let's get 
            you back on track!
          </p>

          {/* Primary actions */}
          <nav style={styles.buttonGroup} aria-label="Primary navigation">
            <Button 
              to="/" 
              variant="primary" 
              size="large" 
              icon={<FiHome size={18} />}
              aria-label="Return to home page"
            >
              Back to Home
            </Button>
            <Button 
              to="/destinations" 
              variant="secondary" 
              size="large"
              aria-label="Browse all destinations"
            >
              Explore Destinations
            </Button>
          </nav>

          {/* Suggestions panel */}
          <section 
            style={styles.suggestionsPanel}
            aria-labelledby="suggestions-heading"
          >
            <h3 
              id="suggestions-heading" 
              style={styles.suggestionsHeading}
            >
              Quick Navigation
            </h3>
            <nav 
              style={styles.suggestionsList} 
              aria-label="Alternative navigation options"
            >
              {NAVIGATION_SUGGESTIONS.map((suggestion, index) => (
                <SuggestionCard
                  key={suggestion.path}
                  suggestion={suggestion}
                  index={index}
                />
              ))}
            </nav>
          </section>
        </article>
      </main>
    </>
  );
};

export default NotFound;