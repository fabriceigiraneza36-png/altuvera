// src/utils/api.js

import { apiFetch } from "./apiBase";

export const api = {
  /**
   * Make API requests with consistent base URL
   * @param {string} endpoint - e.g., '/api/subscribers'
   * @param {object} options - fetch options
   */
  async fetch(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await apiFetch(endpoint, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  },

  // Convenience methods
  get: (endpoint) => api.fetch(endpoint, { method: 'GET' }),
  
  post: (endpoint, body) => api.fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  put: (endpoint, body) => api.fetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  
  delete: (endpoint) => api.fetch(endpoint, { method: 'DELETE' }),
};

export default api;
