/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOKING API CLIENT v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralised fetch wrapper with:
 *  - Automatic retry with exponential back-off
 *  - Structured error parsing
 *  - Request/response logging in development
 *  - Field normalisation before sending
 */

const API_BASE = import.meta.env.VITE_API_URL || "";
const DEV      = import.meta.env.DEV;

/* ─── Custom error class ─────────────────────────────────────────────────── */

export class ApiError extends Error {
  /**
   * @param {number}   status   HTTP status code
   * @param {string}   message  Human-readable message
   * @param {object[]} details  Validation error details (if any)
   * @param {object}   raw      Full parsed response body
   */
  constructor(status, message, details = [], raw = {}) {
    super(message);
    this.name    = "ApiError";
    this.status  = status;
    this.details = details;
    this.raw     = raw;
  }

  /** True if this is a validation (400) error */
  get isValidation() { return this.status === 400; }

  /** True if rate-limited */
  get isRateLimit() { return this.status === 429; }

  /** True if server error */
  get isServerError() { return this.status >= 500; }

  /** True if network / no response */
  get isNetwork() { return this.status === 0; }

  /**
   * Return a user-friendly message string.
   * If there are validation details, list them.
   */
  toUserMessage() {
    if (this.details && this.details.length) {
      return this.details.map((d) => d.message || d.msg || String(d)).join("\n");
    }
    return this.message || "An unexpected error occurred. Please try again.";
  }

  /**
   * Return a field → message map for form error display.
   * @returns {Record<string, string>}
   */
  toFieldErrors() {
    const map = {};
    if (Array.isArray(this.details)) {
      for (const d of this.details) {
        const field = d.field || d.param || "general";
        map[field]  = d.message || d.msg || "Invalid value";
      }
    }
    return map;
  }
}

/* ─── Core fetch wrapper ─────────────────────────────────────────────────── */

/**
 * Fetch with timeout, retry, and structured error parsing.
 *
 * @param {string} endpoint   Path relative to API_BASE (e.g. "/api/bookings")
 * @param {object} options    fetch() options
 * @param {object} config     { retries, retryDelay, timeout }
 */
export const apiFetch = async (
  endpoint,
  options   = {},
  { retries = 2, retryDelay = 800, timeout = 15000 } = {},
) => {
  const url     = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach auth token if present
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOnce = async (attempt) => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeout);

    if (DEV) {
      console.group(`[API] ${options.method || "GET"} ${url} (attempt ${attempt + 1})`);
      if (options.body) {
        try { console.log("→ body:", JSON.parse(options.body)); } catch { /* raw */ }
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Parse response body
      const contentType = response.headers.get("content-type") || "";
      let   body        = null;

      if (contentType.includes("application/json")) {
        try { body = await response.json(); }
        catch { body = { success: false, error: "Invalid JSON response from server" }; }
      } else {
        const text = await response.text();
        body = { success: false, error: text || `HTTP ${response.status}` };
      }

      if (DEV) {
        console.log("← status:", response.status);
        console.log("← body:",   body);
        console.groupEnd();
      }

      if (!response.ok) {
        const message = body?.error || body?.message || `HTTP ${response.status}`;
        const details = body?.details || [];
        throw new ApiError(response.status, message, details, body);
      }

      return body;
    } catch (err) {
      clearTimeout(timer);
      if (DEV) console.groupEnd();

      // Already an ApiError — rethrow
      if (err instanceof ApiError) throw err;

      // AbortError = timeout
      if (err.name === "AbortError") {
        throw new ApiError(0, "Request timed out. Please check your connection and try again.", [], {});
      }

      // Network error
      throw new ApiError(0, "Network error. Please check your connection.", [], {});
    }
  };

  // Retry loop — only retry on server errors (5xx) or network errors
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchOnce(attempt);
    } catch (err) {
      lastError = err;

      const shouldRetry =
        attempt < retries &&
        (err.isServerError || err.isNetwork) &&
        !err.isValidation;

      if (!shouldRetry) break;

      const delay = retryDelay * Math.pow(2, attempt); // exponential back-off
      if (DEV) console.warn(`[API] Retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
};

/* ─── Booking-specific helpers ───────────────────────────────────────────── */

/**
 * Normalise form data keys to what the backend expects.
 * This is a FRONTEND mirror of the backend normalizeBookingData helper,
 * ensuring both ends agree on field names.
 */
const prepareBookingPayload = (formData) => {
  const d = { ...formData };

  // Ensure booking_type is set and valid
  const VALID_TYPES = ["destination","service","custom","package"];
  if (!VALID_TYPES.includes(d.booking_type)) d.booking_type = "custom";

  // Coerce numeric fields
  const toInt = (v, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  d.number_of_adults    = toInt(d.number_of_adults    ?? d.adults,   1);
  d.number_of_children  = toInt(d.number_of_children  ?? d.children, 0);
  d.number_of_travelers = toInt(
    d.number_of_travelers ?? d.travelers,
    d.number_of_adults + d.number_of_children || 1,
  );

  // Strip undefined / null / empty-string values to keep payload clean
  // (but keep 0 and false)
  const clean = {};
  for (const [k, v] of Object.entries(d)) {
    if (v !== undefined && v !== null && v !== "") clean[k] = v;
  }

  return clean;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   PUBLIC API FUNCTIONS
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Submit a booking.
 * @param {object} formData  Raw form data (any key casing accepted)
 * @returns {Promise<{ booking_number, referenceNumber, status, email, … }>}
 * @throws {ApiError}
 */
export const createBooking = async (formData) => {
  const payload = prepareBookingPayload(formData);

  const result = await apiFetch("/api/bookings", {
    method: "POST",
    body:   JSON.stringify(payload),
  });

  return result.data;
};

/**
 * Send OTP to email.
 * @param {string} email
 * @returns {Promise<{ expiresIn: number }>}
 * @throws {ApiError}
 */
export const sendOtp = async (email) => {
  return apiFetch("/api/bookings/send-otp", {
    method: "POST",
    body:   JSON.stringify({ email: email.trim().toLowerCase() }),
  });
};

/**
 * Verify OTP code.
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{ verified: boolean }>}
 * @throws {ApiError}
 */
export const verifyOtp = async (email, code) => {
  return apiFetch("/api/bookings/verify-otp", {
    method: "POST",
    body:   JSON.stringify({
      email: email.trim().toLowerCase(),
      code:  String(code).trim(),
    }),
  });
};

/**
 * Track a booking by reference number.
 * @param {string} bookingNumber
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export const trackBooking = async (bookingNumber) => {
  const result = await apiFetch(
    `/api/bookings/track/${encodeURIComponent(bookingNumber.trim().toUpperCase())}`,
  );
  return result.data;
};

/**
 * Fetch current user's bookings (requires auth).
 * @param {{ page?, limit?, status? }} params
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
export const getMyBookings = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ),
  ).toString();

  return apiFetch(`/api/bookings/my-bookings${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
};

/**
 * Fetch a country by slug (with optional related data).
 * @param {string}  slug
 * @param {boolean} includeRelated
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export const getCountry = async (slug, includeRelated = false) => {
  const qs = includeRelated ? "?includeRelated=true" : "";
  const result = await apiFetch(
    `/api/countries/${encodeURIComponent(slug)}${qs}`,
    {},
    { retries: 1, timeout: 20000 }, // longer timeout for related data
  );
  return result.data;
};

/**
 * Fetch all countries.
 * @param {object} params  Query params
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
export const getCountries = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ),
  ).toString();

  return apiFetch(`/api/countries${qs ? `?${qs}` : ""}`);
};  