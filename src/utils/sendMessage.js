/**
 * sendMessage.js v3.2
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses toAbsoluteApiUrl from apiBase — never doubles /api.
 *
 *   sendContactForm(formData)   → POST /api/contact
 *   sendChatMessage(opts)       → POST /api/messages/send
 *   submitBookingRequest(f, t)  → POST /api/bookings
 *   sendMessage                 → alias of sendContactForm
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { toAbsoluteApiUrl } from "./apiBase";

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

const readStoredToken = () => {
  try {
    return (
      localStorage.getItem("altuvera_auth_token")   ||
      sessionStorage.getItem("altuvera_auth_token") ||
      null
    );
  } catch {
    return null;
  }
};

const authHeaders = (token) => {
  const t = token || readStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/**
 * POST JSON to a relative API path.
 * path must NOT include /api prefix — toAbsoluteApiUrl handles that.
 */
const postJSON = async (path, body, token) => {
  const url = toAbsoluteApiUrl(path);

  if (import.meta.env.DEV) {
    console.info(`[sendMessage] POST ${url}`);
  }

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
      data?.error       ||
      data?.message     ||
      data?.errors?.[0] ||
      `Request failed (${res.status})`;

    if (res.status === 429) {
      const wait =
        data?.retryAfter  ||
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

const buildBookingMessage = (f) => {
  const lines = [];
  if (f.destinationName || f.destination)
    lines.push(`Destination: ${f.destinationName || f.destination}`);
  if (f.groupType)
    lines.push(`Group Type: ${f.groupType}`);
  if (f.isFlexible) {
    lines.push(
      `Dates: Flexible${
        f.flexibleMonths?.length ? ` (${f.flexibleMonths.join(", ")})` : ""
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
  return lines.join("\n");
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONTACT FORM  →  POST /api/contact
// Sends directly — NO OTP, NO verification step needed.
// Backend emails admin + sends auto-reply to visitor via SMTP.
// ═══════════════════════════════════════════════════════════════════════════

export const sendContactForm = async (formData) => {
  if (!formData || typeof formData !== "object") {
    throw new Error("Form data is required.");
  }

  const name    = resolveName(formData).trim();
  const email   = resolveEmail(formData).trim();
  let   message = resolveMessage(formData).trim();

  if (!message) message = buildBookingMessage(formData).trim();

  if (!name)                      throw new Error("Name is required.");
  if (!email)                     throw new Error("Email address is required.");
  if (!isValidEmail(email))       throw new Error("Please enter a valid email address.");
  if (!message)                   throw new Error("Message is required.");
  if (message.length < 10)        throw new Error("Message must be at least 10 characters.");

  const subject =
    formData.subject ||
    formData.topic   ||
    (formData.destinationName
      ? `Booking Inquiry — ${formData.destinationName}`
      : null) ||
    "General Inquiry";

  const payload = {
    name,
    full_name:           name,
    email,
    message,
    subject,
    phone:               resolvePhone(formData)             || undefined,
    trip_type:           formData.trip_type  ||
                         formData.tripType   || undefined,
    travel_date:         formData.travel_date ||
                         formData.travelDate  ||
                         formData.startDate   || undefined,
    number_of_travelers: formData.number_of_travelers ||
                         formData.numberOfTravelers   ||
                         formData.adults              || undefined,
    source: formData.source || "website",
  };

  // Strip undefined keys
  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  // Link this contact inquiry to the live-chat conversation so the user
  // can see the team's replies inside the messaging portal.
  try {
    const sid = localStorage.getItem("atv_session_id");
    if (sid) payload.sessionId = sid;
  } catch { /* ignore */ }

  // POST /api/contact  (toAbsoluteApiUrl handles the full URL)
  return postJSON("/contact", payload);
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. CHAT MESSAGE  →  POST /api/messages/send
// ═══════════════════════════════════════════════════════════════════════════

export const sendChatMessage = async ({
  conversationId,
  body,
  sessionId,
  token,
  metadata = {},
}) => {
  if (!conversationId) throw new Error("conversationId is required.");
  if (!body?.trim())   throw new Error("Message body is required.");

  return postJSON(
    "/messages/send",
    {
      conversationId: Number(conversationId),
      body:           body.trim(),
      sessionId:      sessionId || undefined,
      metadata:       { ...metadata, source: "http-fallback" },
    },
    token
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. BOOKING REQUEST  →  POST /api/bookings
// ═══════════════════════════════════════════════════════════════════════════

export const submitBookingRequest = async (formData, token) => {
  if (!formData || typeof formData !== "object") {
    throw new Error("Form data is required.");
  }

  const name      = resolveName(formData).trim();
  const email     = resolveEmail(formData).trim();
  const firstName =
    formData.firstName  ||
    formData.first_name ||
    name.split(" ")[0]  ||
    name;
  const lastName =
    formData.lastName  ||
    formData.last_name ||
    name.split(" ").slice(1).join(" ") ||
    "";

  if (!firstName)             throw new Error("First name is required.");
  if (!email)                 throw new Error("Email address is required.");
  if (!isValidEmail(email))   throw new Error("Please enter a valid email address.");
  if (!formData.agreeToTerms) throw new Error("You must agree to the terms and conditions.");

  return postJSON(
    "/bookings",
    {
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
        ? formData.flexibleMonths : [],

      // Travellers
      adults:    Number(formData.adults)   || 1,
      children:  Number(formData.children) || 0,
      infants:   Number(formData.infants)  || 0,
      groupType: formData.groupType        || "couple",

      // Preferences
      accommodationType:    formData.accommodationType   || "",
      interests:            Array.isArray(formData.interests)
        ? formData.interests : [],
      budgetRange:          formData.budgetRange          || "",
      dietaryRequirements:  formData.dietaryRequirements  || "",
      specialRequests:      formData.specialRequests       || "",
      hasMedicalConditions: Boolean(formData.hasMedicalConditions),
      medicalDetails:       formData.medicalDetails        || "",

      // Meta
      agreeToTerms:        Boolean(formData.agreeToTerms),
      subscribeNewsletter: Boolean(formData.subscribeNewsletter),
      source: "website_booking_form",
    },
    token
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY ALIAS
// ═══════════════════════════════════════════════════════════════════════════

export const sendMessage = sendContactForm;
export default sendContactForm;