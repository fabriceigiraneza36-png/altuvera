import React, { useState, useEffect, useRef, useCallback } from 'react';

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Preparing your adventure');
  const [isVisible, setIsVisible] = useState(true);
  const [randomRotations, setRandomRotations] = useState([]);
  const progressIntervalRef = useRef(null);
  const textIntervalRef = useRef(null);

  const loadingMessages = [
    'Preparing your adventure',
    'Discovering hidden gems',
    'Charting unique paths',
    'Curating experiences',
    'Weaving local stories',
    'Almost ready for takeoff',
  ];

  // Generate random rotations for floating elements
  useEffect(() => {
    setRandomRotations(loadingMessages.map(() => Math.random() * 360));
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (textIntervalRef.current) clearInterval(textIntervalRef.current);
    };
  }, []);

  // Smooth progress animation with easing
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Smooth exit animation
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        // Smoother progress increments with easing
        const increment = Math.min(15, (100 - prev) * 0.15);
        return Math.min(100, prev + increment * (0.5 + Math.random() * 0.5));
      });
    }, 200);

    textIntervalRef.current = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        return loadingMessages[(currentIndex + 1) % loadingMessages.length];
      });
    }, 1200); // Slightly slower for better readability

    return () => {
      clearInterval(progressIntervalRef.current);
      clearInterval(textIntervalRef.current);
    };
  }, []);

  // Calculate rotation for floating elements
  const getFloatingRotation = useCallback((index) => {
    const baseRotation = randomRotations[index] || 0;
    return `rotate(${baseRotation + (Date.now() * 0.01) % 360}deg)`;
  }, [randomRotations]);

  if (!isVisible) return null;

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(145deg, #022C22 0%, #064e3b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: progress >= 100 ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 20%),
        radial-gradient(circle at 70% 60%, rgba(5, 150, 105, 0.1) 0%, transparent 25%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: 'none',
      animation: 'slowPulse 8s ease-in-out infinite',
    },
    content: {
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
      transform: `scale(${1 - (progress * 0.002)})`,
      transition: 'transform 0.3s ease',
    },
    logoContainer: {
      marginBottom: '30px',
      animation: 'float 4s ease-in-out infinite',
      filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
    },
    logo: {
      width: '120px',
      height: '120px',
      borderRadius: '32px',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '56px',
      fontWeight: '800',
      fontFamily: "'Playfair Display', serif",
      margin: '0 auto',
      boxShadow: '0 25px 40px -10px rgba(5, 150, 105, 0.5)',
      position: 'relative',
      overflow: 'hidden',
    },
    logoGlow: {
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
      animation: 'rotate 8s linear infinite',
    },
    text: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '52px',
      fontWeight: '800',
      color: 'white',
      marginBottom: '10px',
      letterSpacing: '-1px',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      background: 'linear-gradient(135deg, #fff 0%, #e0f2fe 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    tagline: {
      fontFamily: "'Dancing Script', cursive",
      fontSize: '24px',
      color: '#10B981',
      marginBottom: '50px',
      opacity: 0.9,
      transform: 'translateY(0)',
      animation: 'fadeInUp 0.8s ease-out',
    },
    progressWrapper: {
      position: 'relative',
      width: '320px',
      margin: '0 auto',
    },
    progressContainer: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '20px',
      backdropFilter: 'blur(5px)',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 80%, #6EE7B7 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      width: `${Math.min(progress, 100)}%`,
      position: 'relative',
      overflow: 'hidden',
    },
    progressShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      animation: 'shine 1.5s infinite',
    },
    loadingText: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.7)',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      fontWeight: '500',
      transition: 'opacity 0.3s ease',
    },
    loadingDot: {
      display: 'inline-block',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    mountains: {
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      opacity: 0.3,
      filter: 'drop-shadow(0 10px 10px rgba(0, 0, 0, 0.2))',
    },
    mountain: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent transparent #10B981 transparent',
      transition: 'transform 0.3s ease',
      animation: 'mountainFloat 4s ease-in-out infinite',
    },
    floatingCircle: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(20px)',
    },
    particle: {
      position: 'absolute',
      width: '4px',
      height: '4px',
      background: '#10B981',
      borderRadius: '50%',
      opacity: 0.3,
      animation: 'particleFloat 3s ease-in-out infinite',
    },
  };

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
  }));

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shine {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes slowPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 0.9;
              transform: translateY(0);
            }
          }
          @keyframes mountainFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes particleFloat {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(10px, -10px); }
            50% { transform: translate(20px, 5px); }
            75% { transform: translate(5px, 15px); }
          }
          @keyframes glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
          }
        `}
      </style>
      
      <div style={styles.pattern}></div>
      
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            ...styles.particle,
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
      
      {/* Floating Circles */}
      <div style={{ 
        ...styles.floatingCircle, 
        width: '500px', 
        height: '500px', 
        top: '-200px', 
        left: '-200px',
        animation: 'float 8s ease-in-out infinite',
      }}></div>
      <div style={{ 
        ...styles.floatingCircle, 
        width: '400px', 
        height: '400px', 
        bottom: '-150px', 
        right: '-150px',
        animation: 'float 10s ease-in-out infinite reverse',
      }}></div>
      <div style={{ 
        ...styles.floatingCircle, 
        width: '300px', 
        height: '300px', 
        top: '40%', 
        right: '20%',
        animation: 'float 12s ease-in-out infinite',
      }}></div>
      
      <div style={styles.content}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <div style={styles.logoGlow}></div>
            <span style={{ position: 'relative', zIndex: 1 }}>A</span>
          </div>
        </div>
        <h1 style={styles.text}>Altuvera</h1>
        <p style={styles.tagline}>True adventure in High & Deep Culture</p>
        
        <div style={styles.progressWrapper}>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={styles.progressShine}></div>
            </div>
          </div>
          <p style={styles.loadingText}>
            {loadingText}
            <span style={styles.loadingDot}>.</span>
            <span style={{ ...styles.loadingDot, animationDelay: '0.2s' }}>.</span>
            <span style={{ ...styles.loadingDot, animationDelay: '0.4s' }}>.</span>
          </p>
          <p style={{ 
            ...styles.loadingText, 
            fontSize: '12px', 
            marginTop: '10px',
            opacity: 0.5,
          }}>
            {Math.round(progress)}%
          </p>
        </div>
      </div>
      
      <div style={styles.mountains}>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 25px 45px 25px',
          animationDelay: '0s',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 35px 65px 35px',
          animationDelay: '0.2s',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 30px 55px 30px',
          animationDelay: '0.4s',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 22px 40px 22px',
          animationDelay: '0.6s',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 20px 35px 20px',
          animationDelay: '0.8s',
        }}></div>
      </div>
    </div>
  );
};

export default Loader;