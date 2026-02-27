import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const AnimatedSection = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0, 
  duration = 0.6,
  threshold = 0.1,
  style = {},
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const [ref, isVisible] = useScrollAnimation(threshold);

  const animations = {
    fadeInUp: {
      initial: { opacity: 0, transform: 'translateY(40px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeInDown: {
      initial: { opacity: 0, transform: 'translateY(-40px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeInLeft: {
      initial: { opacity: 0, transform: 'translateX(-40px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
    },
    fadeInRight: {
      initial: { opacity: 0, transform: 'translateX(40px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
    },
    scaleIn: {
      initial: { opacity: 0, transform: 'scale(0.9)' },
      animate: { opacity: 1, transform: 'scale(1)' },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slideUp: {
      initial: { opacity: 0, transform: 'translateY(60px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
    },
    zoomIn: {
      initial: { opacity: 0, transform: 'scale(0.8)' },
      animate: { opacity: 1, transform: 'scale(1)' },
    },
    rotateIn: {
      initial: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' },
      animate: { opacity: 1, transform: 'rotate(0) scale(1)' },
    },
  };

  const currentAnimation = animations[animation] || animations.fadeInUp;

  const animatedStyle = {
    ...style,
    ...(isVisible ? currentAnimation.animate : currentAnimation.initial),
    transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
    willChange: 'opacity, transform',
  };

  return (
    <Component 
      ref={ref} 
      style={animatedStyle} 
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default AnimatedSection;