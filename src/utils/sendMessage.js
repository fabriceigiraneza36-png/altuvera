// src/utils/sendMessage.js  (or src/services/contactService.js)
// ─────────────────────────────────────────────────────────────────────────────
// Sends booking/contact form data to backend
// Backend expects: name OR full_name, email, message (required)
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

/**
 * Send a contact/booking message to the backend
 * Handles all field name variations automatically
 */
export const sendMessage = async (formData) => {
  // ✅ Normalize ALL possible field name variations
  const payload = {
    // ── Required fields ──────────────────────────────────────────────────────
    // Backend accepts: name OR full_name
    name:
      formData.name ||
      formData.fullName ||
      formData.full_name ||
      formData.contactName ||
      formData.contact_name ||
      (formData.firstName || formData.first_name
        ? `${formData.firstName || formData.first_name} ${
            formData.lastName || formData.last_name || ""
          }`.trim()
        : "") ||
      "",

    email:
      formData.email ||
      formData.userEmail ||
      formData.user_email ||
      formData.contactEmail ||
      "",

    message:
      formData.message ||
      formData.body ||
      formData.content ||
      formData.description ||
      formData.notes ||
      formData.details ||
      formData.specialRequests ||
      formData.special_requests ||
      "",

    // ── Optional fields ───────────────────────────────────────────────────────
    subject:
      formData.subject ||
      formData.topic ||
      formData.title ||
      (formData.destination
        ? `Booking Inquiry - ${formData.destination}`
        : null) ||
      (formData.destinationName
        ? `Booking Inquiry - ${formData.destinationName}`
        : null) ||
      "Booking Inquiry",

    phone:
      formData.phone ||
      formData.phoneNumber ||
      formData.phone_number ||
      formData.telephone ||
      null,

    // ── Booking-specific ──────────────────────────────────────────────────────
    trip_type:
      formData.trip_type ||
      formData.tripType ||
      formData.tourType ||
      formData.tour_type ||
      formData.bookingType ||
      formData.booking_type ||
      formData.packageType ||
      null,

    travel_date:
      formData.travel_date ||
      formData.travelDate ||
      formData.departureDate ||
      formData.departure_date ||
      formData.startDate ||
      formData.start_date ||
      null,

    number_of_travelers:
      formData.number_of_travelers ||
      formData.numberOfTravelers ||
      formData.travelers ||
      formData.groupSize ||
      formData.group_size ||
      formData.adults ||
      null,

    source: formData.source || "website",
  };

  // Generate a fallback message for bookings when no explicit message field exists
  if (!payload.message?.trim()) {
    const details = [];
    if (formData.destinationName) details.push(`Destination: ${formData.destinationName}`);
    if (formData.destination) details.push(`Destination ID: ${formData.destination}`);
    if (formData.tripType) details.push(`Trip Type: ${formData.tripType}`);
    if (formData.startDate) details.push(`Start Date: ${formData.startDate}`);
    if (formData.endDate) details.push(`End Date: ${formData.endDate}`);
    if (formData.adults || formData.children) {
      const children = formData.children || 0;
      details.push(`Travelers: ${formData.adults || 0} adults, ${children} children`);
    }
    if (formData.specialRequests) details.push(`Special Requests: ${formData.specialRequests}`);
    if (details.length > 0) {
      payload.message = details.join("\n");
    }
  }

  // ✅ Debug log in development
  if (import.meta.env.DEV) {
    console.log("[Contact] Sending payload:", payload);
    console.log("[Contact] Original form data:", formData);
  }

  // ✅ Client-side validation before sending
  const errors = [];
  if (!payload.name?.trim()) errors.push("Name is required");
  if (!payload.email?.trim()) errors.push("Email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email?.trim() || "")) {
    errors.push("Valid email is required");
  }
  if (!payload.message?.trim()) errors.push("Message is required");
  if (payload.message?.trim().length < 20) {
    errors.push("Message must be at least 20 characters");
  }

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  // ✅ Send to backend
  const response = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // ✅ Always extract string error - prevents [object Object]
    const errorMessage =
      data?.error ||
      data?.message ||
      data?.errors?.[0] ||
      `Request failed (${response.status})`;

    throw new Error(errorMessage);
  }

  return data;
};

export default sendMessage;