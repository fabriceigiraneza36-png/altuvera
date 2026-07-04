// src/utils/bookingPrefill.js

/**
 * Booking Prefill Utility
 * 
 * Handles pre-filling the booking form with destination details
 * and saving booking preferences to localStorage/sessionStorage
 */

const BOOKING_PREFILL_KEY = "altuvera_booking_prefill";
const BOOKING_DRAFT_KEY = "altuvera_booking_draft_v1";

/**
 * Save destination details to storage for booking prefill
 * @param {Object} destination - The destination object
 */
export const saveDestinationForBooking = (destination) => {
  if (!destination) return;
  
  try {
    const prefillData = {
      destination: destination.name || destination.id,
      destinationId: destination.id || destination.slug,
      country: destination.countryName || destination.country,
      countrySlug: destination.countrySlug,
      destinationType: destination.type || destination.category,
      price: destination.price,
      duration: destination.duration,
      highlights: destination.highlights || [],
      timestamp: Date.now(),
    };
    
    // Save to both session and local storage for persistence
    sessionStorage.setItem(BOOKING_PREFILL_KEY, JSON.stringify(prefillData));
    localStorage.setItem(BOOKING_PREFILL_KEY, JSON.stringify(prefillData));
    
    return prefillData;
  } catch (error) {
    console.error("Failed to save booking prefill:", error);
    return null;
  }
};

/**
 * Get saved destination prefill data
 * @returns {Object|null} The saved prefill data or null
 */
export const getBookingPrefill = () => {
  try {
    // Try session storage first
    const sessionData = sessionStorage.getItem(BOOKING_PREFILL_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // Fall back to local storage
    const localData = localStorage.getItem(BOOKING_PREFILL_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
    
    return null;
  } catch (error) {
    console.error("Failed to get booking prefill:", error);
    return null;
  }
};

/**
 * Check if there's valid prefill data (less than 24 hours old)
 * @returns {boolean}
 */
export const hasValidPrefill = () => {
  const prefill = getBookingPrefill();
  if (!prefill?.timestamp) return false;
  
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return Date.now() - prefill.timestamp < twentyFourHours;
};

/**
 * Generate booking URL with prefill query parameters
 * @param {Object} destination - The destination object
 * @returns {string} The booking URL with query params
 */
export const getBookingUrl = (destination) => {
  if (!destination) return "/booking";
  
  // Save to storage first
  saveDestinationForBooking(destination);
  
  // Build query params
  const params = new URLSearchParams();
  
  if (destination.name) params.set("destination", destination.name);
  if (destination.id || destination.slug) params.set("destinationId", destination.id || destination.slug);
  if (destination.countryName || destination.country) params.set("country", destination.countryName || destination.country);
  if (destination.type || destination.category) params.set("tripType", destination.type || destination.category);
  if (destination.price) params.set("estimatedPrice", destination.price);
  if (destination.duration) params.set("suggestedDuration", destination.duration);
  
  const queryString = params.toString();
  return queryString ? `/booking?${queryString}` : "/booking";
};

/**
 * Clear booking prefill data
 */
export const clearBookingPrefill = () => {
  try {
    sessionStorage.removeItem(BOOKING_PREFILL_KEY);
    localStorage.removeItem(BOOKING_PREFILL_KEY);
  } catch (error) {
    console.error("Failed to clear booking prefill:", error);
  }
};

/**
 * Apply prefill data to booking form state
 * This should be called when the Booking component mounts
 * @param {Object} formData - Current form data state
 * @param {Function} setFormData - setState function for form data
 * @param {string} location - Current URL location (for query params)
 */
export const applyBookingPrefill = (formData, setFormData, location = window.location) => {
  const searchParams = new URLSearchParams(location.search);
  
  // Check for query params first
  const queryDestination = searchParams.get("destination");
  const queryDestinationId = searchParams.get("destinationId");
  const queryCountry = searchParams.get("country");
  const queryTripType = searchParams.get("tripType");
  const queryPrice = searchParams.get("estimatedPrice");
  const queryDuration = searchParams.get("suggestedDuration");
  
  // If we have query params, use them
  if (queryDestination) {
    setFormData((prev) => ({
      ...prev,
      destination: queryDestinationId || queryDestination,
      tripType: queryTripType || prev.tripType,
    }));
    return;
  }
  
  // Otherwise check storage prefill
  const storagePrefill = getBookingPrefill();
  if (storagePrefill && hasValidPrefill()) {
    // Only apply if destination field is empty
    if (!formData.destination) {
      setFormData((prev) => ({
        ...prev,
        destination: storagePrefill.destinationId || storagePrefill.destination,
        tripType: storagePrefill.destinationType || prev.tripType,
      }));
    }
  }
};

export default {
  saveDestinationForBooking,
  getBookingPrefill,
  hasValidPrefill,
  getBookingUrl,
  clearBookingPrefill,
  applyBookingPrefill,
};
