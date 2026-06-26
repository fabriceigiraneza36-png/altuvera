/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useBookingWizard — v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Full booking wizard state with:
 *  - Robust API error handling (ApiError)
 *  - Field-level validation error display
 *  - Retry logic for transient failures
 *  - OTP flow management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector }  from "react-redux";
import { createBooking, ApiError } from "../api/bookingApi";
import { STEPS }        from "../pages/Booking/BookingShared";
import { getCountries, getCountry } from "../api/bookingApi";

/* ─── Initial form state ─────────────────────────────────────────────────── */

const INITIAL_FORM = {
  // Step 1 — Trip Details
  destination_id:       "",
  service_id:           "",
  booking_type:         "custom",
  travel_date:          "",
  return_date:          "",
  flexible_dates:       false,
  category:             "",
  country:              "",

  // Step 2 — Travelers
  number_of_adults:    1,
  number_of_children:  0,
  number_of_travelers: 1,
  accommodation_type:  "",
  room_type:           "",
  dietary_requirements: "",
  accessibility_needs: "",
  special_requests:    "",

  // Step 3 — Preferences
  interests:           [],
  customer_notes:      "",
  budget_range:        "",

  // Step 4 — Contact
  full_name:           "",
  email:               "",
  phone:               "",
  whatsapp:            "",
  nationality:         "",
  source:              "website",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const buildErrorMap = (apiError) => {
  if (!apiError) return {};
  if (apiError instanceof ApiError) return apiError.toFieldErrors();
  return { general: apiError.message || "Unknown error" };
};

export const useBookingWizard = () => {
  /* ── Auth state ── */
  const { user, isAuthenticated } = useSelector((s) => s.auth || {});

  /* ── UI state ── */
  const [currentStep,  setCurrentStep]  = useState(1);
  const [isAnimating,  setIsAnimating]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted,  setIsSubmitted]  = useState(false);
  const [loadingData,  setLoadingData]  = useState(true);
  const [submissionRef, setSubmissionRef] = useState(null);

  /* ── Form state ── */
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  /* ── API data ── */
  const [categoriesList,    setCategoriesList]    = useState([]);
  const [destinationsList,  setDestinationsList]  = useState([]);
  const [countriesList,     setCountriesList]     = useState([]);
  const [servicesData,      setServicesData]      = useState([]);

  /* ── Submission error ── */
  const [submitError,  setSubmitError]  = useState(null);
  const [submitRetryCount, setSubmitRetryCount] = useState(0);

  /* ── Modal helpers (login prompt) ── */
  const [showModal, setShowModal]       = useState(false);
  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const isMounted = useRef(true);
  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  /* ── Prefill form with logged-in user data ── */
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name:   prev.full_name   || user.full_name   || user.name  || "",
        email:       prev.email       || user.email        || "",
        phone:       prev.phone       || user.phone        || "",
        nationality: prev.nationality || user.nationality  || "",
      }));
    }
  }, [user]);

  /* ── Load reference data ── */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoadingData(true);
      try {
        // Load countries for dropdown
        const countriesRes = await getCountries({ is_active: true, limit: 200 });
        if (!cancelled && countriesRes?.data) {
          setCountriesList(countriesRes.data);
        }

        // Load destinations
        const destRes = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/destinations?is_active=true&limit=200`,
        );
        if (!cancelled && destRes.ok) {
          const destData = await destRes.json();
          setDestinationsList(destData.data || []);
        }

        // Load services
        const svcRes = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/services?is_active=true&limit=200`,
        );
        if (!cancelled && svcRes.ok) {
          const svcData = await svcRes.json();
          setServicesData(svcData.data || []);
          // Extract categories
          const cats = [...new Set((svcData.data || []).map((s) => s.category).filter(Boolean))];
          setCategoriesList(cats);
        }
      } catch (err) {
        console.warn("[BookingWizard] Data load error (non-fatal):", err.message);
        // Don't block the form — data is optional
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  /* ── Computed values ── */

  const displayName = formData.full_name ||
    (user ? (user.full_name || user.name || user.email) : null) ||
    "Traveler";

  const getTripDuration = useCallback(() => {
    if (!formData.travel_date || !formData.return_date) return null;
    const start = new Date(formData.travel_date);
    const end   = new Date(formData.return_date);
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }, [formData.travel_date, formData.return_date]);

  const getTotalVisitors = useCallback(() => {
    const adults   = parseInt(formData.number_of_adults,   10) || 1;
    const children = parseInt(formData.number_of_children, 10) || 0;
    return adults + children;
  }, [formData.number_of_adults, formData.number_of_children]);

  const getDestinationName = useCallback(
    (id) => destinationsList.find((d) => String(d.id) === String(id))?.name || id,
    [destinationsList],
  );

  /* ── Static options ── */
  const groupTypes = [
    { value: "solo",   label: "Solo Traveler" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "group",  label: "Group" },
    { value: "corporate", label: "Corporate" },
  ];

  const accommodationTypes = [
    { value: "luxury",   label: "Luxury (5-Star)" },
    { value: "standard", label: "Standard (3-4 Star)" },
    { value: "budget",   label: "Budget / Hostel" },
    { value: "camping",  label: "Camping / Glamping" },
    { value: "mixed",    label: "Mixed / Flexible" },
  ];

  const interests = [
    "Wildlife Safari", "Mountain Trekking", "Cultural Tours",
    "Beach & Relaxation", "Adventure Sports", "Photography",
    "Bird Watching", "Gorilla Trekking", "Historical Sites", "Food & Cuisine",
  ];

  /* ── Field change handler ── */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target || {};
    const fieldName  = name  || (typeof e === "string" ? e : "");
    const fieldValue = type === "checkbox" ? checked : (value ?? e);

    setFormData((prev) => {
      const next = { ...prev, [fieldName]: fieldValue };

      // Keep number_of_travelers in sync with adults + children
      if (fieldName === "number_of_adults" || fieldName === "number_of_children") {
        const adults   = parseInt(
          fieldName === "number_of_adults" ? fieldValue : prev.number_of_adults, 10,
        ) || 0;
        const children = parseInt(
          fieldName === "number_of_children" ? fieldValue : prev.number_of_children, 10,
        ) || 0;
        next.number_of_travelers = Math.max(1, adults + children);
      }

      return next;
    });

    // Clear field error on change
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /* ── Blur handler ── */
  const handleBlur = useCallback((e) => {
    const name = e?.target?.name || (typeof e === "string" ? e : "");
    if (name) setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  /* ── Interests toggle ── */
  const handleInterestToggle = useCallback((interest) => {
    setFormData((prev) => {
      const cur = Array.isArray(prev.interests) ? prev.interests : [];
      return {
        ...prev,
        interests: cur.includes(interest)
          ? cur.filter((i) => i !== interest)
          : [...cur, interest],
      };
    });
  }, []);

  /* ── Step navigation ── */
  const goToStep = useCallback((step) => {
    if (step < 1 || step > STEPS.length) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  }, []);

  const nextStep = useCallback(() => goToStep(currentStep + 1), [currentStep, goToStep]);
  const prevStep = useCallback(() => goToStep(currentStep - 1), [currentStep, goToStep]);

  const handleStepClick = useCallback(
    (step) => { if (step <= currentStep) goToStep(step); },
    [currentStep, goToStep],
  );

  /* ── Client-side step validation ── */
  const validateStep = useCallback((step) => {
    const errs = {};

    if (step === 4) {
      const name  = String(formData.full_name || "").trim();
      const email = String(formData.email     || "").trim();

      if (!name)
        errs.full_name = "Full name is required";

      if (!email)
        errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errs.email = "Please enter a valid email address";
    }

    return errs;
  }, [formData]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();

    // Client-side validation first
    const stepErrs = validateStep(currentStep);
    if (Object.keys(stepErrs).length) {
      setErrors(stepErrs);
      // Mark all errored fields as touched
      const touched = {};
      for (const k of Object.keys(stepErrs)) touched[k] = true;
      setTouched((prev) => ({ ...prev, ...touched }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      // Build final payload
      const payload = {
        ...formData,
        // Ensure totals are correct
        number_of_travelers: getTotalVisitors(),
        number_of_adults:    parseInt(formData.number_of_adults,   10) || 1,
        number_of_children:  parseInt(formData.number_of_children, 10) || 0,
        // Source tracking
        source:     "website",
        referrer_url: typeof window !== "undefined" ? window.location.href : undefined,
      };

      // Remove empty strings to avoid validation noise
      for (const [k, v] of Object.entries(payload)) {
        if (v === "" || v === null) delete payload[k];
      }

      const data = await createBooking(payload);

      if (!isMounted.current) return;

      setIsSubmitted(true);
      setSubmissionRef(data?.booking_number || data?.referenceNumber || "");
      setSubmitRetryCount(0);
    } catch (err) {
      if (!isMounted.current) return;

      console.error("[BookingWizard] Submit error:", err);

      if (err instanceof ApiError) {
        if (err.isValidation) {
          // Map server validation errors back to form fields
          const fieldErrors = err.toFieldErrors();
          setErrors(fieldErrors);

          // Touch all errored fields
          const t = {};
          for (const k of Object.keys(fieldErrors)) t[k] = true;
          setTouched((prev) => ({ ...prev, ...t }));

          // Build user-facing message
          const msg = Object.values(fieldErrors).join("; ") ||
            "Please check the highlighted fields and try again.";
          setSubmitError(msg);
        } else if (err.isRateLimit) {
          setSubmitError("Too many requests. Please wait a moment before trying again.");
        } else if (err.isServerError) {
          setSubmitError(
            "Our servers are temporarily unavailable. " +
            "Please try again in a moment or contact us via WhatsApp.",
          );
        } else if (err.isNetwork) {
          setSubmitError(
            "Network error. Please check your internet connection and try again.",
          );
        } else {
          setSubmitError(err.message || "Booking failed. Please try again.");
        }

        setSubmitRetryCount((c) => c + 1);
      } else {
        setSubmitError("An unexpected error occurred. Please try again or contact support.");
        setSubmitRetryCount((c) => c + 1);
      }
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  }, [formData, currentStep, validateStep, getTotalVisitors]);

  return {
    // UI
    currentStep,
    isAnimating,
    isSubmitting,
    isSubmitted,
    loadingData,
    showModal,
    openModal,
    closeModal,

    // Form
    formData,
    setFormData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleInterestToggle,

    // Navigation
    nextStep,
    prevStep,
    handleStepClick,

    // Submission
    handleSubmit,
    submitError,
    setSubmitError,
    submissionRef,
    submitRetryCount,

    // Data
    categoriesList,
    destinationsList,
    countriesList,
    servicesData,

    // Computed
    displayName,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    groupTypes,
    accommodationTypes,
    interests,

    // Auth
    user,
    isAuthenticated,
  };
};