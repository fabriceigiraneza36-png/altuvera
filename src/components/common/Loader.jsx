import React, { useState, useEffect } from 'react';

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Preparing your adventure');

  const loadingMessages = [
    'Preparing your adventure',
    'Loading destinations',
    'Gathering experiences',
    'Almost ready',
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        return loadingMessages[(currentIndex + 1) % loadingMessages.length];
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, []);

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#022C22',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    },
    pattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: 'none',
    },
    content: {
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
    },
    logoContainer: {
      marginBottom: '30px',
      animation: 'float 3s ease-in-out infinite',
    },
    logo: {
      width: '100px',
      height: '100px',
      borderRadius: '24px',
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '42px',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif",
      margin: '0 auto',
      boxShadow: '0 20px 50px rgba(5, 150, 105, 0.4)',
    },
    text: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '42px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '10px',
      letterSpacing: '-1px',
    },
    tagline: {
      fontFamily: "'Dancing Script', cursive",
      fontSize: '20px',
      color: '#10B981',
      marginBottom: '50px',
    },
    progressContainer: {
      width: '280px',
      height: '6px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginBottom: '20px',
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)',
      borderRadius: '3px',
      transition: 'width 0.3s ease',
      width: `${Math.min(progress, 100)}%`,
    },
    loadingText: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    mountains: {
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      opacity: 0.2,
    },
    mountain: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent transparent #059669 transparent',
    },
    floatingCircle: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      
      <div style={styles.pattern}></div>
      
      {/* Floating Elements */}
      <div style={{ 
        ...styles.floatingCircle, 
        width: '400px', 
        height: '400px', 
        top: '-100px', 
        left: '-100px',
        animation: 'float 6s ease-in-out infinite',
      }}></div>
      <div style={{ 
        ...styles.floatingCircle, 
        width: '300px', 
        height: '300px', 
        bottom: '-50px', 
        right: '-50px',
        animation: 'float 6s ease-in-out infinite reverse',
      }}></div>
      
      <div style={styles.content}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>A</div>
        </div>
        <h1 style={styles.text}>Altuvera</h1>
        <p style={styles.tagline}>True adventure in High & Deep Culture</p>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}></div>
        </div>
        <p style={styles.loadingText}>{loadingText}...</p>
      </div>
      
      <div style={styles.mountains}>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 20px 35px 20px',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 30px 50px 30px',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 25px 40px 25px',
        }}></div>
        <div style={{ 
          ...styles.mountain, 
          borderWidth: '0 18px 30px 18px',
        }}></div>
      </div>
    </div>
  );
};

export default Loader;