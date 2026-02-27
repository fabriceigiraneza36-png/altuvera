import React, { useState, useEffect, useMemo } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const Statistics = () => {
  const [ref, isVisible] = useScrollAnimation(0.3);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);

  const stats = useMemo(() => [
    { value: 10, suffix: '+', label: 'East African Countries', icon: '🌍' },
    { value: 500, suffix: '+', label: 'Unique Destinations', icon: '📍' },
    { value: 15000, suffix: '+', label: 'Happy Travelers', icon: '😊' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐' },
  ], []);

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true);
      
      const timers = stats.map((stat, index) => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 16);

        return setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
          }
          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(start);
            return newCounts;
          });
          
          if (start >= end) {
            // Will be cleared in cleanup
          }
        }, 16);
      });

      // Cleanup function
      return () => {
        timers.forEach(timer => clearInterval(timer));
      };
    }
  }, [isVisible, hasAnimated, stats]);

  const styles = {
    section: {
      padding: '100px 24px',
      background: 'linear-gradient(135deg, #022C22 0%, #065F46 100%)',
      position: 'relative',
      overflow: 'hidden',
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5,
      pointerEvents: 'none',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '40px',
    },
    stat: {
      textAlign: 'center',
      padding: '40px 20px',
      borderRadius: '24px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    icon: {
      fontSize: '48px',
      marginBottom: '20px',
      display: 'block',
    },
    value: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 'clamp(36px, 5vw, 56px)',
      fontWeight: '700',
      color: 'white',
      marginBottom: '8px',
      lineHeight: '1',
    },
    suffix: {
      color: '#10B981',
    },
    label: {
      fontSize: '16px',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    floatingCircle: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
  };

  return (
    <section style={styles.section} ref={ref}>
      <div style={styles.pattern}></div>
      
      {/* Floating Elements */}
      <div style={{ ...styles.floatingCircle, width: '400px', height: '400px', top: '-200px', left: '-100px' }}></div>
      <div style={{ ...styles.floatingCircle, width: '300px', height: '300px', bottom: '-150px', right: '-50px' }}></div>
      
      <div style={styles.container}>
        <div style={styles.grid}>
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              style={{
                ...styles.stat,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={styles.icon} role="img" aria-label={stat.label}>
                {stat.icon}
              </span>
              <div style={styles.value}>
                {counts[index].toLocaleString()}
                <span style={styles.suffix}>{stat.suffix}</span>
              </div>
              <div style={styles.label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;