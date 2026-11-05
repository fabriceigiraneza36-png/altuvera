const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const TOKEN_KEY = "altuvera_auth_token";
const token = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";

const call = async (url, options = {}, tokenOverride = null) => {
  const { authToken: _ignored, ...fetchOptions } = options;
  const accessToken = tokenOverride || token();
  const headers = { ...(fetchOptions.headers || {}) };
  if (accessToken) headers.Authorization = "Bearer " + accessToken;

  const res = await fetch(API_BASE + url, {
    ...fetchOptions,
    headers,
    credentials: "omit",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.message || data?.error || "Request failed");
    error.status = res.status;
    error.code = data?.code || "";
    error.data = data;
    throw error;
  }
  return data;
};

export const bookingIdentityAPI = {
  request: (id) => call("/booking-identity/" + encodeURIComponent(id) + "/request", { method: "POST" }),
  get: (id, accessToken = null) => call("/booking-identity/" + encodeURIComponent(id), {}, accessToken),
  createActionToken: (id, accessToken) => call(
    "/booking-identity/" + encodeURIComponent(id) + "/action-token",
    { method: "POST" },
    accessToken
  ),
  upload: (id, file, accessToken = null) => {
    const form = new FormData();
    form.append("portrait", file);
    return call(
      "/booking-identity/" + encodeURIComponent(id) + "/upload",
      { method: "POST", body: form },
      accessToken
    );
  },
  confirm: (id) => call("/booking-identity/" + encodeURIComponent(id) + "/confirm", { method: "POST" })
};

export default bookingIdentityAPI;
