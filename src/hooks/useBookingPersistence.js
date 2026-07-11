// src/hooks/useBookingPersistence.js
/**
 * Persists booking form data to localStorage with step tracking.
 * Survives page reloads. Auto-clears after 7 days.
 */
import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY  = "altuvera_booking_v2";
const EXPIRY_DAYS  = 7;
const EXPIRY_MS    = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

const DEFAULT_FORM = {
  // Step 0 — Trip
  countryId:       "",
  destinationId:   "",
  categoryId:      "",
  startDate:       "",
  endDate:         "",
  isFlexible:      false,
  flexibleMonths:  [],
  // Step 1 — Travelers
  adults:          1,
  children:        0,
  infants:         0,
  groupType:       "",
  accommodationType: "",
  // Step 2 — Review (read-only, no own fields)
  // Step 3 — Contact
  firstName:       "",
  lastName:        "",
  email:           "",
  phone:           "",
  country:         "",
  preferredContactMethod: "whatsapp",
  preferredContactTime:   "",
  pickupLocation:         "",
  marketingSource:        "",
  specialRequests:        "",
  newsletterOptIn:        false,
  agreeToTerms:           false,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt) return null;
    if (Date.now() - parsed.savedAt > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(data, step) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      formData: data,
      step,
      savedAt: Date.now(),
    }));
  } catch { /* quota exceeded — silent */ }
}

export function useBookingPersistence(initialStep = 0) {
  const saved = loadFromStorage();

  const [formData, setFormDataRaw] = useState(
    () => ({ ...DEFAULT_FORM, ...(saved?.formData ?? {}) }),
  );
  const [currentStep, setCurrentStepRaw] = useState(
    () => saved?.step ?? initialStep,
  );

  const debounceRef = useRef(null);

  // Debounced save — avoids hammering localStorage on every keystroke
  const persistNow = useCallback((data, step) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveToStorage(data, step), 400);
  }, []);

  const setFormData = useCallback((updater) => {
    setFormDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistNow(next, currentStep);
      return next;
    });
  }, [currentStep, persistNow]);

  const setCurrentStep = useCallback((step) => {
    setCurrentStepRaw(step);
    persistNow(formData, step);
  }, [formData, persistNow]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasSavedData = !!saved;
  const savedAt      = saved?.savedAt ?? null;

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    clearStorage,
    hasSavedData,
    savedAt,
    DEFAULT_FORM,
  };
}