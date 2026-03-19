/**
 * Multi-Backend Fetch Utility
 * Attempts to fetch from multiple backends synchronously and returns the first successful response
 * 
 * Backends (in order of priority):
 * 1. https://backend-jd8f.onrender.com (production)
 * 2. http://localhost:3000 (local dev)
 * 3. http://localhost:3001 (alternative local dev)
 */

// Backend URLs configuration
const BACKENDS = [
  "https://backend-jd8f.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

// Cache for successful backend URL
let cachedBackend = null;
const CACHE_KEY = "altuvera_active_backend";

/**
 * Get the stored backend URL from localStorage
 */
export const getStoredBackend = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored && BACKENDS.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

/**
 * Store the successful backend URL
 */
const storeBackend = (url) => {
  try {
    localStorage.setItem(CACHE_KEY, url);
    cachedBackend = url;
  } catch {
    // localStorage not available
  }
};

/**
 * Get the preferred backend (cached or first available)
 */
export const getPreferredBackend = () => {
  if (cachedBackend) return cachedBackend;
  
  const stored = getStoredBackend();
  if (stored) {
    cachedBackend = stored;
    return stored;
  }
  
  // Try to determine best backend based on environment
  if (import.meta.env.PROD) {
    // Production: prefer the render backend
    cachedBackend = BACKENDS[0];
  } else {
    // Development: prefer localhost:3000
    cachedBackend = BACKENDS[1];
  }
  
  return cachedBackend;
};

/**
 * Build full URL for a given backend and path
 */
const buildUrl = (backend, path) => {
  const base = backend.endsWith("/") ? backend.slice(0, -1) : backend;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${cleanPath}`;
};

/**
 * Attempt to fetch from a single backend with timeout
 */
const fetchFromBackend = async (backend, path, options = {}, timeout = 5000) => {
  const url = buildUrl(backend, path);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return {
      success: true,
      data: await response.json(),
      backend,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    return {
      success: false,
      backend,
      error: error.name === "AbortError" ? "Timeout" : error.message,
    };
  }
};

/**
 * Synchronously try all backends and return the first successful response
 * This fetches from all backends in parallel and uses whichever responds first
 */
export const multiBackendFetch = async (path, options = {}) => {
  const startTime = Date.now();
  
  // Create fetch promises for all backends
  const fetchPromises = BACKENDS.map(backend => 
    fetchFromBackend(backend, path, options)
  );
  
  try {
    // Wait for all promises to settle, but process them as they resolve
    const results = await Promise.all(fetchPromises);
    
    // Find the first successful result
    const successful = results.find(r => r.success);
    
    if (successful) {
      const responseTime = Date.now() - startTime;
      console.log(`[MultiBackend] Success from ${successful.backend} (${responseTime}ms) for ${path}`);
      storeBackend(successful.backend);
      
      return {
        success: true,
        data: successful.data,
        backend: successful.backend,
        responseTime,
      };
    }
    
    // All backends failed
    const errors = results.map(r => `${r.backend}: ${r.error}`).join("; ");
    console.error(`[MultiBackend] All backends failed for ${path}: ${errors}`);
    
    return {
      success: false,
      error: `All backends failed: ${errors}`,
      results,
    };
  } catch (error) {
    console.error(`[MultiBackend] Unexpected error:`, error);
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Synchronous fetch - tries backends sequentially by response time
 * This ensures we get the fastest responding backend
 */
export const syncMultiBackendFetch = async (path, options = {}) => {
  const startTime = Date.now();
  
  // First, try the cached/preferred backend
  const preferred = getPreferredBackend();
  
  // Try preferred backend first
  const preferredResult = await fetchFromBackend(preferred, path, options, 5000);
  
  if (preferredResult.success) {
    const responseTime = Date.now() - startTime;
    console.log(`[MultiBackend] Preferred backend success: ${preferred} (${responseTime}ms)`);
    storeBackend(preferred);
    
    return {
      success: true,
      data: preferredResult.data,
      backend: preferred,
      responseTime,
    };
  }
  
  // Fallback: try other backends in parallel
  const otherBackends = BACKENDS.filter(b => b !== preferred);
  
  try {
    const fallbackResults = await Promise.race(
      otherBackends.map(backend => fetchFromBackend(backend, path, options, 8000))
        .map(async (promise, index) => {
          const result = await promise;
          return { ...result, index };
        })
    );
    
    // Wait for all fallbacks
    const allFallbacks = await Promise.all(
      otherBackends.map(async (backend, index) => {
        const result = await fetchFromBackend(backend, path, options, 8000);
        return { ...result, backend, index };
      })
    );
    
    // Find first successful fallback
    const successfulFallback = allFallbacks.find(r => r.success);
    
    if (successfulFallback) {
      const responseTime = Date.now() - startTime;
      console.log(`[MultiBackend] Fallback success: ${successfulFallback.backend} (${responseTime}ms)`);
      storeBackend(successfulFallback.backend);
      
      return {
        success: true,
        data: successfulFallback.data,
        backend: successfulFallback.backend,
        responseTime,
      };
    }
    
    // All backends failed
    console.error(`[MultiBackend] All backends failed for ${path}`);
    
    return {
      success: false,
      error: "All backends failed",
      triedBackends: BACKENDS,
    };
  } catch (error) {
    console.error(`[MultiBackend] Fallback error:`, error);
    
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Simple wrapper for making API calls with multi-backend support
 * Use this instead of direct fetch for all API calls
 */
export const apiMultiFetch = async (path, options = {}) => {
  const result = await syncMultiBackendFetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch from any backend");
  }
  
  return result.data;
};

/**
 * Get current active backend info
 */
export const getBackendInfo = () => {
  const active = getPreferredBackend();
  const stored = getStoredBackend();
  
  return {
    active,
    stored,
    allBackends: BACKENDS,
    isUsingCached: active === stored && stored !== null,
  };
};

export default apiMultiFetch;
