import axios from 'axios';
import { API_URL } from '../utils/apiBase';

const getStoredToken = () => localStorage.getItem('altuvera_auth_token') || localStorage.getItem('token');
const getStoredRefreshToken = () => localStorage.getItem('altuvera_refresh_token') || localStorage.getItem('refreshToken');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // ✅ Important for cookies/CORS
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getStoredRefreshToken();
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_URL}/users/refresh-token`,
            { refreshToken }
          );

          if (data.success) {
            localStorage.setItem('altuvera_auth_token', data.data.token);
            localStorage.setItem('altuvera_refresh_token', data.data.refreshToken);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('altuvera_auth_token');
        localStorage.removeItem('altuvera_refresh_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;