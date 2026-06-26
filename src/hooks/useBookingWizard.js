/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * useBookingWizard — v2.1
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Changes from v2.0:
 *  - useSelector replaced with useSafeRedux() — never throws outside Provider
 *  - isMounted guard uses AbortController pattern (cleaner async cancel)
 *  - Data fetch consolidated into a single Promise.allSettled call
 *  - validateStep covers steps 1-4 (was only step 4)
 *  - handleSubmit cleans payload with a dedicated sanitizePayload helper
 *  - goToStep debounce prevents double-click race
 *  - All returned callbacks are stable (exhaustive useCallback deps)
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { ReactReduxContext } from "react-redux";
import { createBooking, ApiError, getCountries } from "../api/bookingApi";
import { STEPS } from "../pages/Booking/BookingShared";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Redux hook — returns null values instead of throwing when the
// Redux store isn't available (SSR, missing Provider, lazy-load race).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads auth state from Redux without throwing if the store is absent.
 *
 * @returns {{ user: object|null, isAuthenticated: boolean }}
 */
const useSafeReduxAuth = () => {
  // ReactReduxContext is null when no <Provider> is present.
  const reduxCtx = useContext(ReactReduxContext);

  const [authState, setAuthState] = useState(() => {
    // Attempt synchronous read on first render (avoids a flicker).
    try {
      if (!reduxCtx) return { user: null, isAuthenticated: false };
      const { auth = {} } = reduxCtx.store.getState();
      return {
        user:            auth.user            ?? null,
        isAuthenticated: auth.isAuthenticated ?? false,
      };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  });

  useEffect(() => {
    if (!reduxCtx) return;

    // Subscribe to store changes and keep local state in sync.
    const unsubscribe = reduxCtx.store.subscribe(() => {
      try {
        const { auth = {} } = reduxCtx.store.getState();
        setAuthState({
          user:            auth.user            ?? null,
          isAuthenticated: auth.isAuthenticated ?? false,
        });
      } catch {
        // Store was torn down — ignore.
      }
    });

    return unsubscribe;
  }, [reduxCtx]);

  return authState;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** Fallback fetch for destinations / services (not in bookingApi yet). */
const fetchJSON = async (path, signal) => {
  const res = await fetch(`${API_BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
  return res.json();
};

const INITIAL_FORM = {
  // Step 1 — Trip
  destination_id:  "",
  service_id:      "",
  booking_type:    "custom",
  travel_date:     "",
  return_date:     "",
  flexible_dates:  false,
  category:        "",
  country:         "",

  // Step 2 — Travelers
  number_of_adults:     1,
  number_of_children:   0,
  number_of_travelers:  1,
  accommodation_type:   "",
  room_type:            "",
  dietary_requirements: "",
  accessibility_needs:  "",
  special_requests:     "",

  // Step 3 — Preferences
  interests:      [],
  customer_notes: "",
  budget_range:   "",

  // Step 4 — Contact
  full_name:   "",
  email:       "",
  phone:       "",
  whatsapp:    "",
  nationality: "",
  source:      "website",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips empty strings, null, and undefined from a payload object
 * so the API doesn't receive noisy empty fields.
 */
const sanitizePayload = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

/**
 * Converts an ApiError into a flat { fieldName: message } map.
 * Falls back to { general: message } for non-validation errors.
 */
const buildFieldErrors = (err) => {
  if (err instanceof ApiError && typeof err.toFieldErrors === "function") {
    return err.toFieldErrors();
  }
  return { general: err?.message || "Unknown error" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Static option sets (stable references — defined outside the hook)
// ─────────────────────────────────────────────────────────────────────────────

const GROUP_TYPES = [
  { value: "solo",      label: "Solo Traveler" },
  { value: "couple",    label: "Couple"        },
  { value: "family",    label: "Family"        },
  { value: "group",     label: "Group"         },
  { value: "corporate", label: "Corporate"     },
];

const ACCOMMODATION_TYPES = [
  { value: "luxury",   label: "Luxury (5-Star)"       },
  { value: "standard", label: "Standard (3-4 Star)"   },
  { value: "budget",   label: "Budget / Hostel"        },
  { value: "camping",  label: "Camping / Glamping"     },
  { value: "mixed",    label: "Mixed / Flexible"       },
];

const INTERESTS = [
  "Wildlife Safari",   "Mountain Trekking",  "Cultural Tours",
  "Beach & Relaxation","Adventure Sports",   "Photography",
  "Bird Watching",     "Gorilla Trekking",   "Historical Sites",
  "Food & Cuisine",
];

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useBookingWizard = () => {

  // ── Auth (safe — won't throw outside Provider) ───────────────────────────
  const { user, isAuthenticated } = useSafeReduxAuth();

  // ── UI state ─────────────────────────────────────────────────────────────
  const [currentStep,    setCurrentStep]    = useState(1);
  const [isAnimating,    setIsAnimating]    = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [isSubmitted,    setIsSubmitted]    = useState(false);
  const [loadingData,    setLoadingData]    = useState(true);
  const [submissionRef,  setSubmissionRef]  = useState(null);
  const [showModal,      setShowModal]      = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  // ── API / reference data ──────────────────────────────────────────────────
  const [categoriesList,   setCategoriesList]   = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [countriesList,    setCountriesList]    = useState([]);
  const [servicesData,     setServicesData]     = useState([]);

  // ── Submission error ──────────────────────────────────────────────────────
  const [submitError,      setSubmitError]      = useState(null);
  const [submitRetryCount, setSubmitRetryCount] = useState(0);

  // ── Navigation debounce guard ─────────────────────────────────────────────
  const navigatingRef = useRef(false);

  // ── Mounted guard ─────────────────────────────────────────────────────────
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Prefill contact fields from authenticated user ────────────────────────
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      full_name:   prev.full_name   || user.full_name   || user.name  || "",
      email:       prev.email       || user.email        || "",
      phone:       prev.phone       || user.phone        || "",
      nationality: prev.nationality || user.nationality  || "",
    }));
  }, [user]);

  // ── Load reference data (countries, destinations, services) ──────────────
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setLoadingData(true);

      const [countriesResult, destResult, svcResult] = await Promise.allSettled([
        getCountries({ is_active: true, limit: 200 }),
        fetchJSON("/api/destinations?is_active=true&limit=200", signal),
        fetchJSON("/api/services?is_active=true&limit=200",     signal),
      ]);

      if (!mountedRef.current) return;

      // Countries
      if (countriesResult.status === "fulfilled") {
        setCountriesList(countriesResult.value?.data ?? []);
      } else {
        console.warn("[BookingWizard] Countries load failed:", countriesResult.reason?.message);
      }

      // Destinations
      if (destResult.status === "fulfilled") {
        setDestinationsList(destResult.value?.data ?? []);
      } else if (!signal.aborted) {
        console.warn("[BookingWizard] Destinations load failed:", destResult.reason?.message);
      }

      // Services + derive categories
      if (svcResult.status === "fulfilled") {
        const svcs = svcResult.value?.data ?? [];
        setServicesData(svcs);
        const cats = [
          ...new Set(svcs.map((s) => s.category).filter(Boolean)),
        ];
        setCategoriesList(cats);
      } else if (!signal.aborted) {
        console.warn("[BookingWizard] Services load failed:", svcResult.reason?.message);
      }

      if (mountedRef.current) setLoadingData(false);
    };

    load();
    return () => controller.abort();
  }, []);

  // ── Computed display name ─────────────────────────────────────────────────
  const displayName =
    formData.full_name ||
    user?.full_name    ||
    user?.name         ||
    user?.email        ||
    "Traveler";

  // ── Derived trip values ───────────────────────────────────────────────────
  const getTripDuration = useCallback(() => {
    if (!formData.travel_date || !formData.return_date) return null;
    const start = new Date(formData.travel_date);
    const end   = new Date(formData.return_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
    return Math.ceil((end - start) / 86_400_000);
  }, [formData.travel_date, formData.return_date]);

  const getTotalVisitors = useCallback(() => {
    const adults   = Math.max(0, parseInt(formData.number_of_adults,   10) || 0);
    const children = Math.max(0, parseInt(formData.number_of_children, 10) || 0);
    return Math.max(1, adults + children);
  }, [formData.number_of_adults, formData.number_of_children]);

  const getDestinationName = useCallback(
    (id) =>
      destinationsList.find((d) => String(d.id) === String(id))?.name ?? String(id),
    [destinationsList],
  );

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    // Accept both a SyntheticEvent and a plain { name, value } object.
    const target     = e?.target ?? e;
    const fieldName  = target?.name  ?? "";
    const fieldValue = target?.type === "checkbox" ? target.checked : (target?.value ?? "");

    if (!fieldName) return;

    setFormData((prev) => {
      const next = { ...prev, [fieldName]: fieldValue };

      // Keep number_of_travelers in sync.
      if (fieldName === "number_of_adults" || fieldName === "number_of_children") {
        const adults   = Math.max(0, parseInt(
          fieldName === "number_of_adults"   ? fieldValue : prev.number_of_adults, 10,
        ) || 0);
        const children = Math.max(0, parseInt(
          fieldName === "number_of_children" ? fieldValue : prev.number_of_children, 10,
        ) || 0);
        next.number_of_travelers = Math.max(1, adults + children);
      }

      return next;
    });

    // Clear the field's error on change.
    setErrors((prev) => {
      if (!(fieldName in prev)) return prev;
      const { [fieldName]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // ── Field blur ────────────────────────────────────────────────────────────
  const handleBlur = useCallback((e) => {
    const name = e?.target?.name ?? (typeof e === "string" ? e : "");
    if (name) setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // ── Interests toggle ──────────────────────────────────────────────────────
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

  // ── Step validation ───────────────────────────────────────────────────────
  /**
   * Returns a { fieldName: message } map for the given step.
   * Empty object → step is valid.
   */
  const validateStep = useCallback(
    (step) => {
      const errs = {};

      switch (step) {
        case 1:
          if (!formData.destination_id)
            errs.destination_id = "Please select a destination.";
          if (!formData.travel_date)
            errs.travel_date = "Please choose a departure date.";
          break;

        case 2:
          if (!formData.number_of_adults || formData.number_of_adults < 1)
            errs.number_of_adults = "At least 1 adult is required.";
          break;

        case 3:
          // Preferences are optional — validate here if needed.
          break;

        case 4: {
          const name  = String(formData.full_name ?? "").trim();
          const email = String(formData.email     ?? "").trim();
          const phone = String(formData.phone     ?? "").trim();

          if (!name)
            errs.full_name = "Full name is required.";
          if (!email)
            errs.email = "Email address is required.";
          else if (!EMAIL_RE.test(email))
            errs.email = "Please enter a valid email address.";
          if (!phone)
            errs.phone = "Phone number is required.";
          break;
        }

        default:
          break;
      }

      return errs;
    },
    [
      formData.destination_id,
      formData.travel_date,
      formData.number_of_adults,
      formData.full_name,
      formData.email,
      formData.phone,
    ],
  );

  // ── Step navigation ───────────────────────────────────────────────────────
  const goToStep = useCallback(
    (step) => {
      if (step < 1 || step > STEPS.length) return;
      if (navigatingRef.current) return;           // debounce rapid clicks

      navigatingRef.current = true;
      setIsAnimating(true);

      setTimeout(() => {
        if (mountedRef.current) {
          setCurrentStep(step);
          setIsAnimating(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        navigatingRef.current = false;
      }, 180);
    },
    [], // STEPS.length is a constant
  );

  const nextStep = useCallback(
    () => {
      // Validate current step before advancing.
      const errs = validateStep(currentStep);
      if (Object.keys(errs).length) {
        setErrors(errs);
        setTouched((prev) => {
          const t = { ...prev };
          for (const k of Object.keys(errs)) t[k] = true;
          return t;
        });
        return;
      }
      goToStep(currentStep + 1);
    },
    [currentStep, goToStep, validateStep],
  );

  const prevStep = useCallback(
    () => goToStep(currentStep - 1),
    [currentStep, goToStep],
  );

  const handleStepClick = useCallback(
    (step) => { if (step <= currentStep) goToStep(step); },
    [currentStep, goToStep],
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (isSubmitting) return;                    // guard double-submit

      // Run client-side validation for the final step.
      const stepErrs = validateStep(currentStep);
      if (Object.keys(stepErrs).length) {
        setErrors(stepErrs);
        setTouched((prev) => {
          const t = { ...prev };
          for (const k of Object.keys(stepErrs)) t[k] = true;
          return t;
        });
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setErrors({});

      try {
        const payload = sanitizePayload({
          ...formData,
          number_of_travelers: getTotalVisitors(),
          number_of_adults:    Math.max(1, parseInt(formData.number_of_adults,   10) || 1),
          number_of_children:  Math.max(0, parseInt(formData.number_of_children, 10) || 0),
          source:              "website",
          referrer_url:        typeof window !== "undefined" ? window.location.href : undefined,
        });

        const data = await createBooking(payload);

        if (!mountedRef.current) return;

        setIsSubmitted(true);
        setSubmissionRef(
          data?.booking_number ?? data?.referenceNumber ?? data?.id ?? "",
        );
        setSubmitRetryCount(0);

      } catch (err) {
        if (!mountedRef.current) return;

        console.error("[BookingWizard] Submit error:", err);

        if (err instanceof ApiError) {
          if (err.isValidation) {
            const fieldErrors = buildFieldErrors(err);
            setErrors(fieldErrors);
            setTouched((prev) => {
              const t = { ...prev };
              for (const k of Object.keys(fieldErrors)) t[k] = true;
              return t;
            });
            setSubmitError(
              Object.values(fieldErrors).join("; ") ||
              "Please check the highlighted fields and try again.",
            );
          } else if (err.isRateLimit) {
            setSubmitError("Too many requests — please wait a moment before trying again.");
          } else if (err.isServerError) {
            setSubmitError(
              "Our servers are temporarily unavailable. " +
              "Please try again shortly or contact us via WhatsApp.",
            );
          } else if (err.isNetwork) {
            setSubmitError(
              "Network error — please check your internet connection and try again.",
            );
          } else {
            setSubmitError(err.message || "Booking failed. Please try again.");
          }
        } else {
          setSubmitError(
            "An unexpected error occurred. Please try again or contact support.",
          );
        }

        setSubmitRetryCount((c) => c + 1);

      } finally {
        if (mountedRef.current) setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, currentStep, isSubmitting, validateStep, getTotalVisitors],
  );

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // ── Public API ────────────────────────────────────────────────────────────
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

    // Reference data
    categoriesList,
    destinationsList,
    countriesList,
    servicesData,

    // Computed
    displayName,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,

    // Static option sets
    groupTypes:         GROUP_TYPES,
    accommodationTypes: ACCOMMODATION_TYPES,
    interests:          INTERESTS,

    // Auth
    user,
    isAuthenticated,
  };
};