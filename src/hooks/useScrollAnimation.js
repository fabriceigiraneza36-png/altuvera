import { useEffect, useState, useRef, useCallback } from "react";

/**
 * useScrollAnimation
 * Observes an element entering the viewport and returns [ref, isVisible].
 *
 * @param {number}  threshold   - Intersection ratio to trigger (0–1). Default 0.1.
 * @param {boolean} triggerOnce - If true, stays visible once triggered. Default true.
 * @param {string}  rootMargin  - IO rootMargin. Default '-40px 0px -40px 0px'
 *                                (triggers a bit before/after the viewport edge).
 */
export const useScrollAnimation = (
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = "-40px 0px -40px 0px",
) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const observerRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Once visible and triggerOnce, disconnect to free resources
        if (triggerOnce && observerRef.current) {
          observerRef.current.disconnect();
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [triggerOnce],
  );

  useEffect(() => {
    // Bail out gracefully if IO is not supported
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });
    observerRef.current = observer;
    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, handleObserver]);

  return [ref, isVisible];
};

export default useScrollAnimation;
