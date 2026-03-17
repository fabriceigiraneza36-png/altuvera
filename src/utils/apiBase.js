// Centralized API base URL for the frontend.
// Set `VITE_API_URL` (recommended) to something like:
// https://backend-1-ghrv.onrender.com/api
export const API_URL = String(
  import.meta.env.VITE_API_URL || "https://backend-1-ghrv.onrender.com/api",
).replace(/\/+$/, "");

