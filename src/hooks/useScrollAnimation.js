import { useEffect, useState, useRef, useCallback } from 'react';

export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [triggerOnce]);

  useEffect(() => {
    const currentRef = ref.current;
    
    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin: '0px 0px -50px 0px',
    });

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, handleObserver]);

  return [ref, isVisible];
};

export default useScrollAnimation;
