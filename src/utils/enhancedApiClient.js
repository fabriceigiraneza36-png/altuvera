// src/utils/enhancedApiClient.js
import { multiBackendFetch } from './multiBackendFetch';

class EnhancedApiClient {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes default

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.requestInterceptors = [
      (config) => {
        // Add timestamp for cache busting unless explicitly disabled
        if (config.method === 'GET' && config.cacheBust !== false) {
          config.params = config.params || {};
          config.params._t = Date.now();
        }
        return config;
      }
    ];

// Response interceptor
this.responseInterceptors = [
  (response) => {
    // response is raw JSON data (not an axios object)
    // caching is handled via setCache in the request method below
    // just pass the response through unchanged
    return response;
  }
];}

  async request(endpoint, options = {}) {
    let config = {
      method: 'GET',
      headers: {},
      retry: true,
      cache: true,
      ...options
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    const cacheKey = this.getCacheKey(endpoint, config);

    // Check cache for GET requests
    if (config.method === 'GET' && config.cache) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check for pending identical requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

   const makeRequest = async (attempt = 1) => {
  try {
const controller = new AbortController();
config.signal = controller.signal;
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

const promise = multiBackendFetch(endpoint, config);
promise.finally(() => clearTimeout(timeoutId));
    this.pendingRequests.set(cacheKey, promise);

    const result = await promise;

    // Apply response interceptors
    let processedResult = result;
    for (const interceptor of this.responseInterceptors) {
      processedResult = await interceptor(processedResult);
    }

    // ✅ Cache successful GET responses here
    // result is raw JSON — not axios, so no result.data wrapper
    if (config.method === 'GET' && processedResult) {
      const ttl = config.cacheTime || this.cacheTimeout;
      this.setCache(cacheKey, processedResult, ttl);
    }

    this.pendingRequests.delete(cacheKey);
    return processedResult;

  } catch (error) {
    this.pendingRequests.delete(cacheKey);

    if (config.retry && attempt < this.maxRetries && this.shouldRetry(error)) {
      console.warn(`[API] Retry ${attempt}/${this.maxRetries} for ${endpoint}:`, error.message);
      await this.delay(this.retryDelay * attempt);
      return makeRequest(attempt + 1);
    }

    throw this.enhanceError(error, endpoint, attempt);
  }
};

    return makeRequest();
  }

  shouldRetry(error) {
    // Retry on network errors, 5xx errors, and timeouts
    if (!error.message) return false;

    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'Failed to fetch',
      'Load failed'
    ];

    const isRetryable = retryableErrors.some(msg =>
      error.message.includes(msg)
    );

    const isServerError = error.message.includes('HTTP 5');

    return isRetryable || isServerError;
  }

  enhanceError(error, endpoint, attempt) {
    const enhancedError = new Error(error.message);
    enhancedError.endpoint = endpoint;
    enhancedError.attempt = attempt;
    enhancedError.timestamp = Date.now();
    enhancedError.isNetworkError = false;
    enhancedError.originalError = error;

    return enhancedError;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCacheKey(endpoint, config) {
    const params = new URLSearchParams(config.params || {}).toString();
    return `${config.method}:${endpoint}${params ? `?${params}` : ''}`;
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data, ttl = this.cacheTimeout) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiresAt
    });
  }

  clearCache() {
    this.cache.clear();
  }


  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
const enhancedApiClient = new EnhancedApiClient();

export default enhancedApiClient;
export { EnhancedApiClient };