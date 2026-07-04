import { useEffect, useRef } from "react";

/**
 * Hook to trigger a callback every time the element scrolls a certain distance while in view.
 * Detects both vertical and horizontal scroll movement.
 * @param {Function} onTrigger - Function to call (e.g., nextSlide)
 * @param {number} scrollThreshold - Distance in pixels to trigger (default 150)
 */
export const useScrollTriggeredSlide = (onTrigger, scrollThreshold = 150) => {
  const lastScrollY = useRef(window.scrollY);
  const lastScrollX = useRef(window.scrollX);
  const accumulatedScroll = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const inView =
        rect.top <
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0 &&
        rect.left <
          (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right > 0;

      if (inView) {
        const currentScrollY = window.scrollY;
        const currentScrollX = window.scrollX;

        const deltaY = Math.abs(currentScrollY - lastScrollY.current);
        const deltaX = Math.abs(currentScrollX - lastScrollX.current);

        accumulatedScroll.current += deltaY + deltaX;

        if (accumulatedScroll.current >= scrollThreshold) {
          onTrigger();
          accumulatedScroll.current = 0;
        }

        lastScrollY.current = currentScrollY;
        lastScrollX.current = currentScrollX;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onTrigger, scrollThreshold]);

  return containerRef;
};
