import { useEffect, useRef, useState, useCallback } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  const handleObserver = useCallback(([entry]) => {
    setIsIntersecting(entry.isIntersecting);
    if (entry.isIntersecting && !hasIntersected) {
      setHasIntersected(true);
    }
  }, [hasIntersected]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '0px',
      ...options
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [options, handleObserver]);

  return { targetRef, isIntersecting, hasIntersected };
};

export default useIntersectionObserver;