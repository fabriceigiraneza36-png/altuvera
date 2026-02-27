import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Show/hide button and calculate progress based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setIsVisible(scrollY > 500);

      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / height) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const styles = {
    wrapper: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    progressCircle: {
      position: 'relative',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(5, 150, 105, 0.25)',
      overflow: 'hidden',
    },
    svg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      transform: 'rotate(-90deg)',
    },
    circleBg: {
      fill: 'none',
      stroke: 'rgba(5, 150, 105, 0.1)',
      strokeWidth: '4',
    },
    circleProgress: {
      fill: 'none',
      stroke: '#059669',
      strokeWidth: '4',
      strokeLinecap: 'round',
      strokeDasharray: '175.9', // 2 * PI * r (r=28)
      strokeDashoffset: 175.9 - (175.9 * scrollProgress) / 100,
      transition: 'stroke-dashoffset 0.1s linear',
    },
    button: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      color: 'white',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div 
      style={styles.wrapper}
      onMouseOver={(e) => {
        const btn = e.currentTarget.querySelector('.scroll-btn');
        if (btn) btn.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        const btn = e.currentTarget.querySelector('.scroll-btn');
        if (btn) btn.style.transform = 'scale(1)';
      }}
      onClick={scrollToTop}
    >
      <div style={styles.progressCircle}>
        <svg style={styles.svg}>
          <circle cx="30" cy="30" r="28" style={styles.circleBg} />
          <circle cx="30" cy="30" r="28" style={styles.circleProgress} />
        </svg>
        <div style={styles.button} className="scroll-btn">
          <FiArrowUp size={20} />
        </div>
      </div>
    </div>
  );
};

export default ScrollToTop;