// ═══════════════════════════════════════════════════════════════
// src/utils/multiBackendFetch.js
// Simplified backend fetcher - NO MORE MULTI-BACKEND
// ═══════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api';

/**
 * Main fetch function - single backend only
 */
export const multiBackendFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
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
    console.error(`[API] Error fetching ${endpoint}:`, error);
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