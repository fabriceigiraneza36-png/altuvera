import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to prefetch a URL when the user hovers over a link
 * This makes page transitions much faster by loading the next page's chunks in advance
 */
export const usePrefetch = (enabled = true) => {
  const prefetchTimerRef = useRef(null);

  const prefetch = useCallback((url) => {
    if (!enabled || !url || typeof window === 'undefined') return;
    
    // Only prefetch internal links
    if (!url.startsWith('/') || url.startsWith('//') || url.startsWith('http')) {
      return;
    }

    // Create a link element for prefetching
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    
    // Add to head (browsers will handle the actual prefetching)
    document.head.appendChild(link);
    
    // Also try to fetch the JS chunks for the route
    // This is more aggressive prefetching
    try {
      // Fetch the route as a document to get the script tags
      const prefetchDoc = document.createElement('link');
      prefetchDoc.rel = 'prefetch';
      prefetchDoc.as = 'fetch';
      prefetchDoc.href = url;
      document.head.appendChild(prefetchDoc);
    } catch (e) {
      // Silently fail if prefetching isn't supported
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, []);

  return { prefetch };
};

/**
 * Hook that automatically prefetches links when user hovers over them
 * Attach to parent elements containing links
 */
export const useLinkPrefetch = (selector = 'a[href]', enabled = true) => {
  const { prefetch } = usePrefetch(enabled);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseEnter = (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Only prefetch internal links
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
        prefetch(href);
      }
    };

    // Use event delegation
    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [prefetch, enabled]);

  return null;
};

/**
 * Hook to prefetch images that are likely to be needed
 */
export const useImagePrefetch = (imageUrls = [], enabled = true) => {
  useEffect(() => {
    if (!enabled || !imageUrls.length || typeof window === 'undefined') return;

    imageUrls.forEach((url) => {
      if (!url) return;
      
      const img = new Image();
      img.src = url;
    });
  }, [imageUrls, enabled]);
};

/**
 * Hook to lazy load a component when it comes into view
 * Uses dynamic import for code splitting
 */
export const useLazyComponent = (importFn, enabled = true) => {
  const loadedRef = useRef(false);
  const componentRef = useRef(null);

  useEffect(() => {
    if (!enabled || loadedRef.current) return;
    
    // Prefetch the component code
    importFn().then((module) => {
      loadedRef.current = true;
      // Store the component for later use
      componentRef.current = module.default;
    }).catch((error) => {
      console.warn('Failed to prefetch component:', error);
    });
  }, [importFn, enabled]);

  return componentRef;
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useOnScreen = (ref, options = {}) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};
