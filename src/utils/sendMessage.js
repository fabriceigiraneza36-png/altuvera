/**
 * sendMessage.js v3.1
 * ═══════════════════════════════════════════════════════════════════════════
 * Three clearly-named async functions:
 *
 *   sendContactForm(formData)
 *     → POST /api/contact
 *     → Used by: Contact page
 *     → Sends DIRECTLY — no OTP, no verification step
 *
 *   sendChatMessage({ conversationId, body, sessionId, token, metadata })
 *     → POST /api/messages/send
 *     → Used by: Chat portal HTTP fallback when socket is offline
 *
 *   submitBookingRequest(formData, token)
 *     → POST /api/bookings
 *     → Used by: Booking wizard final step
 *
 *   sendMessage  (legacy alias → sendContactForm)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// API BASE
// ═══════════════════════════════════════════════════════════════════════════

const resolveApiBase = () => {
  const raw  = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com";
  const base = raw.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE = resolveApiBase();

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

/** Read auth token from storage */
const readStoredToken = () => {
  try {
    return (
      localStorage.getItem("altuvera_auth_token")  ||
      sessionStorage.getItem("altuvera_auth_token") ||
      null
    );
  } catch {
    return null;
  }
};

/** Build Authorization header if token is available */
const authHeaders = (token) => {
  const t = token || readStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * Standard JSON POST.
 * Always throws a structured Error on failure.
 *
 * @param {string} url
 * @param {object} body
 * @param {string} [token]
 * @returns {Promise<object>}
 */
const postJSON = async (url, body, token) => {
  let res;
  try {
    res = await fetch(url, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(
      "Network error — please check your connection and try again."
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data?.error        ||
      data?.message      ||
      data?.errors?.[0]  ||
      `Request failed (${res.status})`;

    // Rate limit — give a user-friendly message
    if (res.status === 429) {
      const wait =
        data?.retryAfter ||
        data?.retry_after ||
        data?.waitSeconds ||
        60;
      throw Object.assign(
        new Error(`Too many requests. Please wait ${wait} seconds and try again.`),
        { status: 429, retryAfter: wait, data }
      );
    }

    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data;
};

// ═══════════════════════════════════════════════════════════════════════════
// FIELD RESOLVERS
// Handle all common naming conventions from form components
// ═══════════════════════════════════════════════════════════════════════════

const resolveName = (f) => {
  if (f.name)      return f.name;
  if (f.fullName)  return f.fullName;
  if (f.full_name) return f.full_name;
  if (f.firstName || f.first_name) {
    return `${f.firstName || f.first_name || ""} ${
      f.lastName || f.last_name || ""
    }`.trim();
  }
  return "";
};

const resolveEmail = (f) =>
  f.email        ||
  f.userEmail    ||
  f.user_email   ||
  f.contactEmail ||
  "";

const resolveMessage = (f) =>
  f.message     ||
  f.body        ||
  f.content     ||
  f.description ||
  f.notes       ||
  f.details     ||
  "";

const resolvePhone = (f) =>
  f.phone        ||
  f.phoneNumber  ||
  f.phone_number ||
  f.telephone    ||
  null;

/** Build a structured summary message for booking-style forms */
const buildBookingMessage = (f) => {
  const lines = [];

  if (f.destinationName || f.destination)
    lines.push(`Destination: ${f.destinationName || f.destination}`);

  if (f.groupType)
    lines.push(`Group Type: ${f.groupType}`);

  if (f.isFlexible) {
    lines.push(
      `Dates: Flexible${
        f.flexibleMonths?.length
          ? ` (${f.flexibleMonths.join(", ")})`
          : ""
      }`
    );
  } else {
    if (f.startDate) lines.push(`Departure: ${f.startDate}`);
    if (f.endDate)   lines.push(`Return: ${f.endDate}`);
  }

  const parts = [];
  if (f.adults)   parts.push(`${f.adults} adult${f.adults   !== 1 ? "s" : ""}`);
  if (f.children) parts.push(`${f.children} child${f.children !== 1 ? "ren" : ""}`);
  if (f.infants)  parts.push(`${f.infants} infant${f.infants  !== 1 ? "s" : ""}`);
  if (parts.length) lines.push(`Travellers: ${parts.join(", ")}`);

  if (f.accommodationType) lines.push(`Accommodation: ${f.accommodationType}`);
  if (f.budgetRange)       lines.push(`Budget: ${f.budgetRange}`);
  if (f.interests?.length) lines.push(`Interests: ${f.interests.join(", ")}`);
  if (f.dietaryRequirements) lines.push(`Dietary: ${f.dietaryRequirements}`);
  if (f.specialRequests)   lines.push(`Special Requests: ${f.specialRequests}`);
  if (f.medicalDetails)    lines.push(`Medical: ${f.medicalDetails}`);
  if (f.hearAboutUs)       lines.push(`How they heard: ${f.hearAboutUs}`);

  return lines.join("\n");
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONTACT FORM
// POST /api/contact
// ─────────────────────────────────────────────────────────────────────────
// Sends DIRECTLY to the backend contact route.
// Does NOT call sendVerificationCode or any OTP endpoint.
// The backend sends the admin notification + visitor auto-reply via SMTP.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit a contact form message.
 *
 * @param {object} formData   - from Contact.jsx form state
 * @returns {Promise<{ success: true, message: string }>}
 * @throws {Error} with .message suitable for display to the user
 */
export const sendContactForm = async (formData) => {
  if (!formData || typeof formData !== "object") {
    throw new Error("Form data is required.");
  }

  const name    = resolveName(formData).trim();
  const email   = resolveEmail(formData).trim();
  let   message = resolveMessage(formData).trim();

  // Build rich message body for booking-style contact forms
  if (!message) {
    message = buildBookingMessage(formData).trim();
  }

  // ── Client-side validation ───────────────────────────────────────────
  if (!name)
    throw new Error("Name is required.");
  if (!email)
    throw new Error("Email address is required.");
  if (!isValidEmail(email))
    throw new Error("Please enter a valid email address.");
  if (!message)
    throw new Error("Message is required.");
  if (message.length < 10)
    throw new Error("Message must be at least 10 characters.");

  const subject =
    formData.subject         ||
    formData.topic           ||
    (formData.destinationName
      ? `Booking Inquiry — ${formData.destinationName}`
      : null)                ||
    "General Inquiry";

  const payload = {
    // Core fields
    name,
    full_name:   name,
    email,
    message,
    subject,

    // Optional enrichment
    phone:               resolvePhone(formData)             || undefined,
    trip_type:           formData.trip_type   ||
                         formData.tripType    || undefined,
    travel_date:         formData.travel_date ||
                         formData.travelDate  ||
                         formData.startDate   || undefined,
    number_of_travelers: formData.number_of_travelers ||
                         formData.numberOfTravelers   ||
                         formData.adults              || undefined,
    source: formData.source || "website",
  };

  // Remove undefined keys so backend doesn't receive noisy nulls
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  if (import.meta.env.DEV) {
    console.info("[sendContactForm] → POST", `${API_BASE}/contact`);
    console.debug("[sendContactForm] payload:", payload);
  }

  // ── POST directly to /api/contact ────────────────────────────────────
  // Backend will:
  //   1. Validate
  //   2. Email admin notification via SMTP
  //   3. Send auto-reply to visitor via SMTP
  //   4. Return { success: true }
  return postJSON(`${API_BASE}/contact`, payload);
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. CHAT MESSAGE  (Socket HTTP fallback)
// POST /api/messages/send
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a chat message via HTTP when the WebSocket is offline.
 *
 * @param {{ conversationId, body, sessionId?, token?, metadata? }} opts
 */
export const sendChatMessage = async ({
  conversationId,
  body,
  sessionId,
  token,
  metadata = {},
}) => {
  if (!conversationId)
    throw new Error("conversationId is required.");
  if (!body?.trim())
    throw new Error("Message body is required.");

  const payload = {
    conversationId: Number(conversationId),
    body:           body.trim(),
    sessionId:      sessionId || undefined,
    metadata:       { ...metadata, source: "http-fallback" },
  };

  if (import.meta.env.DEV) {
    console.info(
      "[sendChatMessage] → POST", `${API_BASE}/messages/send`,
      { conversationId, body: body.slice(0, 60) }
    );
  }

  return postJSON(`${API_BASE}/messages/send`, payload, token);
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. BOOKING REQUEST
// POST /api/bookings
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit the completed booking wizard form.
 *
 * @param {object} formData   - from useBookingWizard formData
 * @param {string} [token]    - auth token (optional, read from storage if absent)
 */
export const submitBookingRequest = async (formData, token) => {
  if (!formData || typeof formData !== "object") {
    throw new Error("Form data is required.");
  }

  const name      = resolveName(formData).trim();
  const email     = resolveEmail(formData).trim();
  const firstName =
    formData.firstName ||
    formData.first_name ||
    name.split(" ")[0] ||
    name;
  const lastName  =
    formData.lastName  ||
    formData.last_name ||
    name.split(" ").slice(1).join(" ") ||
    "";

  // ── Validation ───────────────────────────────────────────────────────
  if (!firstName)
    throw new Error("First name is required.");
  if (!email)
    throw new Error("Email address is required.");
  if (!isValidEmail(email))
    throw new Error("Please enter a valid email address.");
  if (!formData.agreeToTerms)
    throw new Error("You must agree to the terms and conditions.");

  const payload = {
    // Contact
    firstName,
    lastName,
    email,
    phone:       resolvePhone(formData) || "",
    country:     formData.country       || "",
    hearAboutUs: formData.hearAboutUs   || "",

    // Trip
    destinationId:  formData.destinationId  || null,
    countryId:      formData.countryId      || null,
    categoryId:     formData.categoryId     || null,
    serviceId:      formData.serviceId      || null,
    startDate:      formData.startDate      || null,
    endDate:        formData.endDate        || null,
    isFlexible:     Boolean(formData.isFlexible),
    flexibleMonths: Array.isArray(formData.flexibleMonths)
      ? formData.flexibleMonths
      : [],

    // Travellers
    adults:    Number(formData.adults)   || 1,
    children:  Number(formData.children) || 0,
    infants:   Number(formData.infants)  || 0,
    groupType: formData.groupType        || "couple",

    // Preferences
    accommodationType:    formData.accommodationType    || "",
    interests:            Array.isArray(formData.interests)
      ? formData.interests
      : [],
    budgetRange:          formData.budgetRange          || "",
    dietaryRequirements:  formData.dietaryRequirements  || "",
    specialRequests:      formData.specialRequests       || "",
    hasMedicalConditions: Boolean(formData.hasMedicalConditions),
    medicalDetails:       formData.medicalDetails        || "",

    // Meta
    agreeToTerms:        Boolean(formData.agreeToTerms),
    subscribeNewsletter: Boolean(formData.subscribeNewsletter),
    source: "website_booking_form",
  };

  if (import.meta.env.DEV) {
    console.info(
      "[submitBookingRequest] → POST", `${API_BASE}/bookings`,
      {
        name,
        email,
        destination: payload.destinationId,
        travellers:  payload.adults + payload.children + payload.infants,
      }
    );
  }

  return postJSON(`${API_BASE}/bookings`, payload, token);
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ALIAS
// ═══════════════════════════════════════════════════════════════════════════

export const sendMessage = sendContactForm;
export default sendContactForm;