import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  to, 
  href,
  onClick, 
  fullWidth = false,
  icon,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
    borderRadius: '14px',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
  };

  const variants = {
    primary: {
      backgroundColor: '#059669',
      color: 'white',
      boxShadow: '0 4px 15px rgba(5, 150, 105, 0.3)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#059669',
      border: '2px solid #059669',
      boxShadow: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'white',
      border: '2px solid white',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      color: '#059669',
      boxShadow: 'none',
    },
    white: {
      backgroundColor: 'white',
      color: '#059669',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    },
    danger: {
      backgroundColor: '#EF4444',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    },
    dark: {
      backgroundColor: '#1a1a1a',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
  };

  const sizes = {
    small: {
      padding: '10px 20px',
      fontSize: '13px',
    },
    medium: {
      padding: '14px 28px',
      fontSize: '15px',
    },
    large: {
      padding: '18px 36px',
      fontSize: '16px',
    },
    xlarge: {
      padding: '22px 44px',
      fontSize: '18px',
    },
  };

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...style,
  };

  const handleMouseOver = (e) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'translateY(-3px)';
    
    switch (variant) {
      case 'primary':
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.4)';
        e.currentTarget.style.backgroundColor = '#10B981';
        break;
      case 'secondary':
        e.currentTarget.style.backgroundColor = '#059669';
        e.currentTarget.style.color = 'white';
        break;
      case 'ghost':
        e.currentTarget.style.backgroundColor = '#059669';
        e.currentTarget.style.color = 'white';
        break;
      case 'outline':
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.color = '#059669';
        break;
      case 'white':
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.backgroundColor = '#F0FDF4';
        break;
      case 'danger':
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
        e.currentTarget.style.backgroundColor = '#DC2626';
        break;
      case 'dark':
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.backgroundColor = '#374151';
        break;
      default:
        break;
    }
  };

  const handleMouseOut = (e) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'translateY(0)';
    Object.assign(e.currentTarget.style, variants[variant]);
  };

  const handleMouseDown = (e) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleMouseUp = (e) => {
    if (disabled || loading) return;
    e.currentTarget.style.transform = 'translateY(-3px)';
  };

  const LoadingSpinner = () => (
    <span 
      style={{ 
        width: '18px', 
        height: '18px', 
        border: '2px solid transparent',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} 
    />
  );

  const content = (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}
      </style>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {children}
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        </>
      )}
    </>
  );

  const eventHandlers = {
    onMouseOver: handleMouseOver,
    onMouseOut: handleMouseOut,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  };

  // External link
  if (href) {
    return (
      <a
        href={href}
        style={buttonStyle}
        target="_blank"
        rel="noopener noreferrer"
        {...eventHandlers}
        {...props}
      >
        {content}
      </a>
    );
  }

  // Internal link
  if (to) {
    return (
      <Link
        to={to}
        style={buttonStyle}
        {...eventHandlers}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      {...eventHandlers}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;