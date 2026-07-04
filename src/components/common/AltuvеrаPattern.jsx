import React from 'react';

const AltuveraPattern = ({ 
  variant = 'topography', 
  opacity = 0.04,
  color = '#059669',
  animated = false,
  style = {},
}) => {
  const getPattern = () => {
    const c = encodeURIComponent(color);
    const o = opacity;
    
    const patterns = {
      // Elegant topographic lines - perfect for safari/adventure
      topography: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1' d='M0 300c150-100 300 100 600 0M0 350c150-80 350 80 600 0M0 250c200-80 400 80 600 0M0 400c100-60 500 60 600 0M0 200c250-60 350 60 600 0'/%3E%3C/svg%3E")`,

      // Clean geometric grid - professional/modern
      grid: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='0.5' x='0.5' y='0.5' width='39' height='39'/%3E%3C/svg%3E")`,

      // Subtle dots - minimal and clean
      dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle fill='${c}' fill-opacity='${o}' cx='12' cy='12' r='1.5'/%3E%3C/svg%3E")`,

      // African-inspired geometric
      tribal: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1' d='M30 0v60M0 30h60M15 0v60M45 0v60M0 15h60M0 45h60'/%3E%3Cpath fill='${c}' fill-opacity='${o * 0.5}' d='M28 28h4v4h-4z'/%3E%3C/svg%3E")`,

      // Mountain range silhouette
      mountains: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M0 55 L20 25 L35 40 L55 15 L75 35 L90 20 L120 55'/%3E%3C/svg%3E")`,

      // Compass rose inspired
      compass: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle fill='none' stroke='${c}' stroke-opacity='${o}' cx='40' cy='40' r='20'/%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' d='M40 15v10M40 55v10M15 40h10M55 40h10'/%3E%3C/svg%3E")`,

      // Flowing waves - beach/water themes
      waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='30' viewBox='0 0 120 30'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1.5' stroke-linecap='round' d='M0 15c20-10 40 10 60 0s40 10 60 0'/%3E%3C/svg%3E")`,

      // Safari grass/savanna
      savanna: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1' stroke-linecap='round' d='M5 40V25c0-5 3-8 3-12M15 40V28c0-4 2-6 2-10M25 40V30c0-3 2-5 2-8M35 40V27c0-4 3-7 3-11'/%3E%3C/svg%3E")`,

      // Diamond/luxury pattern
      diamond: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1' d='M24 4L44 24L24 44L4 24Z'/%3E%3C/svg%3E")`,

      // Tree canopy - forest/nature
      canopy: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle fill='none' stroke='${c}' stroke-opacity='${o}' cx='30' cy='30' r='15'/%3E%3Ccircle fill='none' stroke='${c}' stroke-opacity='${o * 0.5}' cx='30' cy='30' r='25'/%3E%3C/svg%3E")`,

      // Hexagonal - modern/tech feel
      hex: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='43.4' viewBox='0 0 50 43.4'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1' d='M25 0l25 14.4v14.4L25 43.4 0 28.8V14.4z'/%3E%3C/svg%3E")`,

      // Crosshatch - classic/elegant
      crosshatch: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='0.5' d='M0 0l40 40M40 0L0 40'/%3E%3C/svg%3E")`,

      // Animal print inspired (subtle)
      spots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cellipse fill='${c}' fill-opacity='${o}' cx='25' cy='25' rx='8' ry='6' transform='rotate(20 25 25)'/%3E%3Cellipse fill='${c}' fill-opacity='${o}' cx='75' cy='30' rx='10' ry='7' transform='rotate(-15 75 30)'/%3E%3Cellipse fill='${c}' fill-opacity='${o}' cx='50' cy='70' rx='9' ry='6' transform='rotate(10 50 70)'/%3E%3C/svg%3E")`,

      // Feather/leaf - organic
      leaf: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1.5' stroke-linecap='round' d='M40 10c0 30-25 35-25 55M40 10c0 30 25 35 25 55M40 10v55'/%3E%3C/svg%3E")`,

      // Minimal plus signs
      plus: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='none' stroke='${c}' stroke-opacity='${o}' stroke-width='1.5' stroke-linecap='round' d='M16 8v16M8 16h16'/%3E%3C/svg%3E")`,
    };
    
    return patterns[variant] || patterns.topography;
  };

  const baseStyles = {
    position: 'absolute',
    inset: 0,
    backgroundImage: getPattern(),
    backgroundRepeat: 'repeat',
    pointerEvents: 'none',
    zIndex: 0,
    transition: 'opacity 0.3s ease',
    ...style,
  };

  const animationStyles = animated ? {
    animation: 'altuveraPatternMove 45s linear infinite',
  } : {};

  return (
    <>
      {animated && (
        <style>
          {`
            @keyframes altuveraPatternMove {
              0% { background-position: 0 0; }
              100% { background-position: 200px 200px; }
            }
          `}
        </style>
      )}
      <div 
        style={{ ...baseStyles, ...animationStyles }}
        aria-hidden="true"
      />
    </>
  );
};

// Pattern preview component for development
export const PatternPreview = ({ color = '#059669' }) => {
  const variants = [
    'topography', 'grid', 'dots', 'tribal', 'mountains', 
    'compass', 'waves', 'savanna', 'diamond', 'canopy',
    'hex', 'crosshatch', 'spots', 'leaf', 'plus'
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      {variants.map(v => (
        <div 
          key={v} 
          style={{ 
            position: 'relative', 
            height: '120px', 
            background: '#f8fafc',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}
        >
          <AltuveraPattern variant={v} color={color} opacity={0.08} />
          <span style={{ 
            position: 'absolute', 
            bottom: '8px', 
            left: '8px', 
            fontSize: '12px',
            fontWeight: 500,
            color: '#64748b',
            background: 'white',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AltuveraPattern;