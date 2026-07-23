/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOOKING API CLIENT v3.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralised fetch wrapper with:
 *  - Automatic retry with exponential back-off
 *  - Structured error parsing (ApiError class)
 *  - Request/response logging in development
 *  - Field normalisation before sending
 *  - Matches backend bookings.js field expectations exactly
 */

import { API_URL } from "../utils/apiBase";

const API_BASE = API_URL;
const DEV      = import.meta.env.DEV;

/* ═══════════════════════════════════════════════════════════════════════════════
   CUSTOM ERROR CLASS
═══════════════════════════════════════════════════════════════════════════════ */

export class ApiError extends Error {
  /**
   * @param {number}            status   HTTP status code (0 = network error)
   * @param {string}            message  Human-readable message
   * @param {Array<object>}     details  Validation error details (if any)
   * @param {object}            raw      Full parsed response body
   */
  constructor(status, message, details = [], raw = {}) {
    super(message);
    this.name    = "ApiError";
    this.status  = status;
    this.details = Array.isArray(details) ? details : [];
    this.raw     = raw;
  }

  /** True if this is a validation (400) error */
  get isValidation() { return this.status === 400; }

  /** True if unauthorised */
  get isUnauthorised() { return this.status === 401; }

  /** True if forbidden */
  get isForbidden() { return this.status === 403; }

  /** True if not found */
  get isNotFound() { return this.status === 404; }

  /** True if rate-limited */
  get isRateLimit() { return this.status === 429; }

  /** True if server error */
  get isServerError() { return this.status >= 500; }

  /** True if network / timeout (no response received) */
  get isNetwork() { return this.status === 0; }

  /**
   * Return a single user-friendly string.
   * Lists validation details if present.
   */
  toUserMessage() {
    if (this.details.length) {
      return this.details
        .map((d) => d.message || d.msg || String(d))
        .join("\n");
    }
    return this.message || "An unexpected error occurred. Please try again.";
  }

  /**
   * Return a field → message map for inline form error display.
   * Falls back to "_form" key for non-field errors.
   * @returns {Record<string, string>}
   */
  toFieldErrors() {
    const map = {};

    if (this.details.length) {
      for (const d of this.details) {
        const field   = d.field || d.param || "_form";
        map[field]    = d.message || d.msg || "Invalid value";
      }
    } else {
      map["_form"] = this.toUserMessage();
    }

    return map;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CORE FETCH WRAPPER
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch with timeout, retry (exponential back-off), and structured error parsing.
 *
 * @param {string} endpoint         Path relative to API_BASE  e.g. "/bookings"
 * @param {RequestInit} options     Standard fetch() options
 * @param {object} config
 * @param {number} config.retries   Max retry attempts for 5xx / network errors
 * @param {number} config.retryDelay  Base delay in ms (doubles each attempt)
 * @param {number} config.timeout   Request timeout in ms
 * @returns {Promise<object>}       Parsed JSON response body
 * @throws  {ApiError}
 */
export const apiFetch = async (
  endpoint,
  options = {},
  { retries = 2, retryDelay = 800, timeout = 15_000 } = {},
) => {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach auth token if stored
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  /* ── Single attempt ────────────────────────────────────────────────── */
  const fetchOnce = async (attempt) => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeout);

    if (DEV) {
      console.group(
        `%c[API] ${options.method || "GET"} ${url}  (attempt ${attempt + 1})`,
        "color:#059669;font-weight:700",
      );
      if (options.body) {
        try { console.log("→ body:", JSON.parse(options.body)); }
        catch { console.log("→ body (raw):", options.body); }
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",   // send cookies for session-based auth
        signal:      controller.signal,
      });

      clearTimeout(timer);

      /* Parse body */
      const contentType = response.headers.get("content-type") || "";
      let body          = null;

      if (contentType.includes("application/json")) {
        try   { body = await response.json(); }
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
        // Collect all possible error shapes from backend
        const message =
          body?.message ||
          body?.error   ||
          (body?.errors  ? (Array.isArray(body.errors) ? body.errors.join("; ") : body.errors) : null) ||
          `Request failed with status ${response.status}`;

        // Details can come as body.details, body.errors (array of objects), etc.
        const details = (() => {
          if (Array.isArray(body?.details)) return body.details;
          if (Array.isArray(body?.errors)  && typeof body.errors[0] === "object")
            return body.errors;
          return [];
        })();

        throw new ApiError(response.status, message, details, body);
      }

      return body;

    } catch (err) {
      clearTimeout(timer);
      if (DEV && !(err instanceof ApiError)) console.groupEnd();

      if (err instanceof ApiError) throw err;

      if (err.name === "AbortError") {
        throw new ApiError(
          0,
          "Request timed out. Please check your connection and try again.",
          [],
          {},
        );
      }

      throw new ApiError(
        0,
        "Network error. Please check your connection.",
        [],
        {},
      );
    }
  };

  /* ── Retry loop ────────────────────────────────────────────────────── */
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchOnce(attempt);
    } catch (err) {
      lastError = err;

      // Only retry on server / network errors — never on validation
      const shouldRetry =
        attempt < retries &&
        (err.isServerError || err.isNetwork) &&
        !err.isValidation;

      if (!shouldRetry) break;

      const delay = retryDelay * Math.pow(2, attempt);
      if (DEV) console.warn(`[API] Retrying in ${delay} ms…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   BOOKING PAYLOAD NORMALISER
   Mirrors the backend normaliseBookingData helper so both ends agree on names.
═══════════════════════════════════════════════════════════════════════════════ */

const VALID_BOOKING_TYPES = ["destination", "service", "custom", "package"];

/**
 * Normalise raw form data into the exact shape the backend expects.
 *
 * Backend fields (routes/bookings.js):
 *   guest_name, guest_email, guest_phone,
 *   booking_type,
 *   package_id, package_title, package_price, currency,
 *   travel_date, end_date,
 *   number_of_adults, number_of_children, travelers_count,
 *   total_price, special_requests
 *
 * @param {object} formData  Raw form / payload (any casing / naming)
 * @returns {object}         Clean, backend-ready payload
 */
const normaliseBookingPayload = (formData) => {
  const d = { ...formData };

  /* ── booking_type ── */
  if (!VALID_BOOKING_TYPES.includes(d.booking_type)) {
    d.booking_type = "package";
  }

  /* ── integer helpers ── */
  const toInt = (v, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const toFloat = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  };

  /* ── traveler counts ─ accept both naming conventions ── */
  const adults   = Math.max(1, toInt(d.number_of_adults   ?? d.adults,   1));
  const children = Math.max(0, toInt(d.number_of_children ?? d.children, 0));
  const travelers = toInt(
    d.travelers_count ?? d.number_of_travelers ?? d.travelers,
    adults + children,
  );

  /* ── string helpers ── */
  const trimStr  = (v) => (v != null ? String(v).trim()              : undefined);
  const lowerStr = (v) => (v != null ? String(v).trim().toLowerCase() : undefined);

  /* ── build clean payload ── */
  const payload = {
    // Guest
    guest_name:           trimStr(d.guest_name),
    guest_email:          lowerStr(d.guest_email),
    guest_phone:          trimStr(d.guest_phone) || undefined,

    // Booking meta
    booking_type:         d.booking_type,

    // Package reference
    package_id:           d.package_id   ? toInt(d.package_id)          : undefined,
    package_title:        trimStr(d.package_title)                       || undefined,
    package_price:        toFloat(d.package_price ?? d.price)            ?? undefined,
    currency:             trimStr(d.currency)?.toUpperCase()             || "USD",

    // Travel dates
    travel_date:          trimStr(d.travel_date)                         || undefined,
    end_date:             trimStr(d.end_date)                            || undefined,

    // Travelers
    number_of_adults:     adults,
    number_of_children:   children,
    travelers_count:      travelers,

    // Pricing
    total_price:          toFloat(d.total_price)                         ?? undefined,

    // Extras
    special_requests:     trimStr(d.special_requests)                    || undefined,
  };

  /* ── strip undefined values (keep 0 and false) ── */
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined),
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   PUBLIC API — BOOKINGS
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Submit a new booking.
 *
 * @param {object} formData  Raw form data (any key casing accepted)
 * @returns {Promise<{
 *   booking_number: string,
 *   booking_ref:    string,
 *   status:         string,
 *   guest_email:    string,
 *   [key: string]:  any
 * }>}
 * @throws {ApiError}
 *
 * @example
 *   const booking = await createBooking({
 *     guest_name:  "Jane Doe",
 *     guest_email: "jane@example.com",
 *     package_id:  42,
 *     travel_date: "2025-11-01",
 *     number_of_adults: 2,
 *   });
 *   console.log(booking.booking_number); // "BKXYZ12345"
 */
export const createBooking = async (formData) => {
  const payload = normaliseBookingPayload(formData);

  if (DEV) {
    console.log("[bookingApi] createBooking → normalised payload:", payload);
  }

  const result = await apiFetch("/bookings", {
    method: "POST",
    body:   JSON.stringify(payload),
  });

  // Backend returns { success, message, data: { booking_number, … } }
  return result?.data ?? result;
};

/**
 * Fetch the current user's bookings (requires auth).
 *
 * @param {{ page?: number, limit?: number, status?: string }} params
 * @returns {Promise<{ data: object[], pagination: object }>}
 * @throws {ApiError}
 */
export const getMyBookings = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ),
  ).toString();

  return apiFetch(`/bookings/my-bookings${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
};

/**
 * Track any booking by its reference number (public endpoint).
 *
 * @param {string} bookingNumber   e.g. "BKXYZ12345"
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export const trackBooking = async (bookingNumber) => {
  const result = await apiFetch(
    `/bookings/track/${encodeURIComponent(
      String(bookingNumber).trim().toUpperCase(),
    )}`,
    { method: "GET" },
  );
  return result?.data ?? result;
};

/**
 * Update booking status (admin).
 *
 * @param {number|string} id
 * @param {string}        status  "pending" | "confirmed" | "cancelled" | "completed" | "waitlisted"
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export const updateBookingStatus = async (id, status) => {
  const result = await apiFetch(`/bookings/${id}/status`, {
    method: "PATCH",
    body:   JSON.stringify({ status }),
  });
  return result?.data ?? result;
};

/**
 * Delete a booking (admin).
 *
 * @param {number|string} id
 * @returns {Promise<{ success: boolean, message: string }>}
 * @throws {ApiError}
 */
export const deleteBooking = async (id) => {
  return apiFetch(`/bookings/${id}`, { method: "DELETE" });
};

/* ═══════════════════════════════════════════════════════════════════════════════
   PUBLIC API — OTP
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Send a one-time password to the given email.
 *
 * @param {string} email
 * @returns {Promise<{ expiresIn: number }>}
 * @throws {ApiError}
 */
export const sendOtp = async (email) => {
  return apiFetch("/bookings/send-otp", {
    method: "POST",
    body:   JSON.stringify({ email: String(email).trim().toLowerCase() }),
  });
};

/**
 * Verify an OTP code for the given email.
 *
 * @param {string} email
 * @param {string} code
 * @returns {Promise<{ verified: boolean }>}
 * @throws {ApiError}
 */
export const verifyOtp = async (email, code) => {
  return apiFetch("/bookings/verify-otp", {
    method: "POST",
    body:   JSON.stringify({
      email: String(email).trim().toLowerCase(),
      code:  String(code).trim(),
    }),
  });
};

/* ═══════════════════════════════════════════════════════════════════════════════
   PUBLIC API — COUNTRIES
═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch a single country by slug.
 *
 * @param {string}  slug
 * @param {boolean} includeRelated  Include related packages / destinations
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export const getCountry = async (slug, includeRelated = false) => {
  const qs     = includeRelated ? "?includeRelated=true" : "";
  const result = await apiFetch(
    `/countries/${encodeURIComponent(slug)}${qs}`,
    { method: "GET" },
    { retries: 1, timeout: 20_000 },   // longer timeout for enriched data
  );
  return result?.data ?? result;
};

/**
 * Fetch all countries with optional filtering / pagination.
 *
 * @param {object} params  Any query params (page, limit, search, …)
 * @returns {Promise<{ data: object[], pagination: object }>}
 * @throws {ApiError}
 */
export const getCountries = async (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ),
  ).toString();

  return apiFetch(`/countries${qs ? `?${qs}` : ""}`, { method: "GET" });
};