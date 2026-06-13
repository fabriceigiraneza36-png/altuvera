// ═══════════════════════════════════════════════════════════════
// src/utils/multiBackendFetch.js
// Simplified backend fetcher - NO MORE MULTI-BACKEND
// ═══════════════════════════════════════════════════════════════

import { API_URL, toAbsoluteApiUrl } from './apiBase';

const getStoredToken = () => localStorage.getItem('altuvera_auth_token') || localStorage.getItem('token');

/**
 * Main fetch function - single backend only
 */
export const multiBackendFetch = async (endpoint, options = {}) => {
  const baseUrl = toAbsoluteApiUrl(endpoint, API_URL);
  const params = options.params || {};
  const queryString = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
  const url = `${baseUrl}${queryString}`;
  const { params: _params, cache, cacheTime, cacheBust, retry, ...requestOptions } = options;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    },
    ...requestOptions,
  };

  // Add auth token if available
  const token = getStoredToken();
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    console.log(`[API] Fetching: ${url}`);
    
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Success: ${endpoint}`);
    return data;
    
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error(`[API] Error fetching ${endpoint}:`, error);
    } else {
      console.warn(`[API] Aborted fetch: ${endpoint}`);
    }
    throw error;
  }
};

/**
 * Get backend info (for debugging)
 */
export const getBackendInfo = () => {
  return {
    apiUrl: API_URL,
    isProduction: import.meta.env.PROD,
    environment: import.meta.env.MODE,
  };
};

/**
 * Get current backend URL
 */
export const getBackendUrl = () => API_URL;

// Default export
export default multiBackendFetch;