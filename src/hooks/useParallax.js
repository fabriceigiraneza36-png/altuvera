import { useState, useEffect, useCallback } from 'react';

export const useParallax = (speed = 0.5, direction = 'vertical') => {
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.pageYOffset;
    setOffset(scrollPosition * speed);
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const style = direction === 'vertical' 
    ? { transform: `translateY(${offset}px)` }
    : { transform: `translateX(${offset}px)` };

  return { offset, style };
};

export default useParallax;