// src/utils/enhancedApiClient.js
import { multiBackendFetch } from './multiBackendFetch';

class EnhancedApiClient {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.retryQueue = [];
    this.isOnline = navigator.onLine;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes default

    this.setupNetworkListeners();
    this.setupInterceptors();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processRetryQueue();
      this.emit('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });
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
         // Cache successful GET responses
         if (response.config?.method === 'GET' && response.data) {
           const ttl = response.config.cacheTime || this.cacheTimeout;
           this.setCache(response.config.url, response.data, ttl);
         }
         return response;
       }
     ];
  }

  async request(endpoint, options = {}) {
    const config = {
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
    if (config.method === 'GET' && config.cache && this.isOnline) {
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
        const promise = multiBackendFetch(endpoint, config);
        this.pendingRequests.set(cacheKey, promise);

        const result = await promise;

        // Apply response interceptors
        let processedResult = result;
        for (const interceptor of this.responseInterceptors) {
          processedResult = await interceptor({ ...processedResult, config });
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

        // If offline, queue for retry
        if (!this.isOnline && config.retry) {
          this.addToRetryQueue({ endpoint, options: config });
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
    enhancedError.isNetworkError = !this.isOnline;
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

  addToRetryQueue(request) {
    this.retryQueue.push(request);
  }

  async processRetryQueue() {
    if (!this.isOnline || this.retryQueue.length === 0) return;

    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const request of queue) {
      try {
        await this.request(request.endpoint, request.options);
      } catch (error) {
        // If still failing, add back to queue
        if (this.shouldRetry(error)) {
          this.addToRetryQueue(request);
        }
      }
    }
  }

  // Event system for connection status
  eventListeners = new Map();

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Health check
  async healthCheck() {
    try {
      await this.request('/health', { method: 'GET', retry: false, cache: false });
      return { status: 'healthy', timestamp: Date.now() };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // Connection monitoring
  startConnectionMonitoring(interval = 30000) {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.healthCheck();
      this.emit('health-check', health);
    }, interval);
  }

  stopConnectionMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
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