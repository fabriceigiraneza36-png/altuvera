import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const PageHeader = ({ 
  title, 
  subtitle, 
  backgroundImage, 
  breadcrumbs = [],
  overlay = true,
  height = '500px',
  align = 'center',
  children,
}) => {
  const styles = {
    header: {
      position: 'relative',
      height: height,
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: backgroundImage 
        ? `url(${backgroundImage})` 
        : 'linear-gradient(135deg, #022C22 0%, #065F46 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transform: 'scale(1.1)',
      transition: 'transform 0.3s ease',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: overlay 
        ? 'linear-gradient(180deg, rgba(2, 44, 34, 0.7) 0%, rgba(2, 44, 34, 0.9) 100%)'
        : 'transparent',
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5,
      pointerEvents: 'none',
    },
    content: {
      position: 'relative',
      zIndex: 2,
      textAlign: align,
      padding: '0 24px',
      maxWidth: '900px',
      width: '100%',
    },
    breadcrumbs: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    breadcrumbLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'rgba(255, 255, 255, 0.8)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'color 0.3s ease',
    },
    breadcrumbSeparator: {
      color: 'rgba(255, 255, 255, 0.4)',
    },
    breadcrumbCurrent: {
      color: '#10B981',
      fontSize: '14px',
      fontWeight: '600',
    },
    decorativeLine: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      gap: '16px',
      marginBottom: '30px',
    },
    line: {
      width: '60px',
      height: '2px',
      backgroundColor: '#10B981',
    },
    diamond: {
      width: '10px',
      height: '10px',
      backgroundColor: '#10B981',
      transform: 'rotate(45deg)',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 'clamp(36px, 6vw, 56px)',
      fontWeight: '700',
      color: 'white',
      marginBottom: '16px',
      lineHeight: '1.2',
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    subtitle: {
      fontSize: 'clamp(16px, 2vw, 18px)',
      color: 'rgba(255, 255, 255, 0.9)',
      maxWidth: '600px',
      margin: align === 'center' ? '0 auto' : '0',
      lineHeight: '1.7',
    },
    decoration: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100px',
      background: 'linear-gradient(180deg, transparent 0%, white 100%)',
      pointerEvents: 'none',
    },
    floatingElement: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>
      <div style={styles.pattern}></div>
      
      {/* Floating Elements */}
      <div style={{ 
        ...styles.floatingElement, 
        width: '300px', 
        height: '300px', 
        top: '-100px', 
        left: '-100px',
      }}></div>
      <div style={{ 
        ...styles.floatingElement, 
        width: '200px', 
        height: '200px', 
        bottom: '50px', 
        right: '-50px',
      }}></div>
      
      <div style={styles.content}>
        {breadcrumbs.length > 0 && (
          <nav style={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link 
              to="/" 
              style={styles.breadcrumbLink}
              onMouseOver={(e) => e.target.style.color = '#10B981'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              <FiHome size={14} /> Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <FiChevronRight size={14} style={styles.breadcrumbSeparator} />
                {index === breadcrumbs.length - 1 || !crumb.path ? (
                  <span style={styles.breadcrumbCurrent}>{crumb.label}</span>
                ) : (
                  <Link 
                    to={crumb.path} 
                    style={styles.breadcrumbLink}
                    onMouseOver={(e) => e.target.style.color = '#10B981'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div style={styles.decorativeLine}>
          <div style={styles.line}></div>
          <div style={styles.diamond}></div>
          <div style={styles.line}></div>
        </div>
        
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
      
      <div style={styles.decoration}></div>
    </header>
  );
};

export default PageHeader;