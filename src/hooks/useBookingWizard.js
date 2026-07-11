/**
 * useBookingWizard — v2.3
 * FIXES:
 *  - fetchJSON paths no longer include /api prefix (API_URL already has it)
 *  - getCountries replaced with direct fetchJSON (consistent URL handling)
 *  - All other logic unchanged from v2.2
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import { ReactReduxContext } from "react-redux";
import { createBooking, ApiError } from "../api/bookingApi";
import { STEPS } from "../pages/Booking/BookingShared";
import { toAbsoluteApiUrl } from "../utils/apiBase";

// ─────────────────────────────────────────────────────────────────────────────
// Safe Redux hook
// ─────────────────────────────────────────────────────────────────────────────
const useSafeReduxAuth = () => {
  const reduxCtx = useContext(ReactReduxContext);

  const [authState, setAuthState] = useState(() => {
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
    const unsubscribe = reduxCtx.store.subscribe(() => {
      try {
        const { auth = {} } = reduxCtx.store.getState();
        setAuthState({
          user:            auth.user            ?? null,
          isAuthenticated: auth.isAuthenticated ?? false,
        });
      } catch { /* store torn down */ }
    });
    return unsubscribe;
  }, [reduxCtx]);

  return authState;
};

// ─────────────────────────────────────────────────────────────────────────────
// fetchJSON — uses toAbsoluteApiUrl so /api is never doubled
// paths must NOT start with /api
// ─────────────────────────────────────────────────────────────────────────────
const fetchJSON = async (path, signal) => {
  // toAbsoluteApiUrl auto-strips any accidental /api prefix
  const url = toAbsoluteApiUrl(path);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL FORM — all camelCase
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Step 0 — Trip
  destinationId:  "",
  countryId:      "",
  categoryId:     "",
  startDate:      "",
  endDate:        "",
  isFlexible:     false,
  flexibleMonths: [],

  // Step 1 — Travelers
  adults:    1,
  children:  0,
  infants:   0,
  groupType: "",

  // Step 2 — Preferences
  accommodationType:    "",
  budgetRange:          "",
  interests:            [],
  dietaryRequirements:  "",
  specialRequests:      "",
  hasMedicalConditions: false,
  medicalDetails:       "",

  // Step 4 — Contact
  firstName:    "",
  lastName:     "",
  email:        "",
  phone:        "",
  whatsapp:     "",
  nationality:  "",
  country:      "",
  agreeToTerms: false,
  source:       "website",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const sanitizePayload = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

const buildFieldErrors = (err) => {
  if (err instanceof ApiError && typeof err.toFieldErrors === "function") {
    return err.toFieldErrors();
  }
  return { general: err?.message || "Unknown error" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Static option sets
// ─────────────────────────────────────────────────────────────────────────────
const GROUP_TYPES = [
  { value: "solo",      label: "Solo",      icon: "🧍" },
  { value: "couple",    label: "Couple",    icon: "👫" },
  { value: "family",    label: "Family",    icon: "👨‍👩‍👧‍👦" },
  { value: "group",     label: "Group",     icon: "👥" },
  { value: "corporate", label: "Corporate", icon: "💼" },
];

const ACCOMMODATION_TYPES = [
  { value: "luxury",   label: "Luxury",   icon: "👑", desc: "5-Star resorts & lodges"   },
  { value: "standard", label: "Standard", icon: "🏨", desc: "3–4 star hotels"           },
  { value: "budget",   label: "Budget",   icon: "🏕️", desc: "Hostels & guesthouses"    },
  { value: "camping",  label: "Camping",  icon: "⛺", desc: "Camping & glamping"        },
  { value: "mixed",    label: "Mixed",    icon: "🔀", desc: "Flexible / mix of options" },
];

const INTERESTS = [
  { value: "wildlife",    label: "Wildlife Safari",    icon: "🦁" },
  { value: "trekking",    label: "Mountain Trekking",  icon: "🏔️" },
  { value: "culture",     label: "Cultural Tours",     icon: "🏛️" },
  { value: "beach",       label: "Beach & Relaxation", icon: "🏖️" },
  { value: "adventure",   label: "Adventure Sports",   icon: "🪂" },
  { value: "photography", label: "Photography",        icon: "📸" },
  { value: "birds",       label: "Bird Watching",      icon: "🦜" },
  { value: "gorillas",    label: "Gorilla Trekking",   icon: "🦍" },
  { value: "history",     label: "Historical Sites",   icon: "🏯" },
  { value: "food",        label: "Food & Cuisine",     icon: "🍽️" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useBookingWizard = () => {
  const { user, isAuthenticated } = useSafeReduxAuth();

  // ── UI state ──────────────────────────────────────────────────────────
  const [currentStep,    setCurrentStep]    = useState(0);
  const [isAnimating,    setIsAnimating]    = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [isSubmitted,    setIsSubmitted]    = useState(false);
  const [loadingData,    setLoadingData]    = useState(true);
  const [submissionRef,  setSubmissionRef]  = useState(null);
  const [showModal,      setShowModal]      = useState(false);

  // ── Form state ────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});

  // ── Reference data ────────────────────────────────────────────────────
  const [categoriesList,   setCategoriesList]   = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [countriesList,    setCountriesList]    = useState([]);
  const [servicesData,     setServicesData]     = useState([]);

  const [pendingBookingId, setPendingBookingId] = useState(null);

  // ── Fields auto-completed from the logged-in user's account ──
  const [prefilledFields, setPrefilledFields] = useState({});

  // ── Submission error ──────────────────────────────────────────────────
  const [submitError,      setSubmitError]      = useState(null);
  const [submitRetryCount, setSubmitRetryCount] = useState(0);

  // ── Guards ────────────────────────────────────────────────────────────
  const navigatingRef = useRef(false);
  const mountedRef    = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Prefill from authenticated user ──────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const sources = {
      firstName:   user.first_name  || user.name?.split(" ")[0] || "",
      lastName:    user.last_name   || user.name?.split(" ")[1] || "",
      email:       user.email       || "",
      phone:       user.phone       || "",
      nationality: user.nationality || user.country || "",
      country:     user.country     || user.countryOfResidence || "",
    };
    setFormData((prev) => {
      const next   = { ...prev };
      const filled = {};
      let changed  = false;
      for (const [field, value] of Object.entries(sources)) {
        if (value && !prev[field]) {
          next[field] = value;
          filled[field] = true;
          changed = true;
        }
      }
      if (changed) {
        setPrefilledFields((pf) => ({ ...pf, ...filled }));
      }
      return next;
    });
  }, [user, setFormData]);

  // ── Load reference data ───────────────────────────────────────────────
  // FIXED: paths do NOT include /api — toAbsoluteApiUrl adds it
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setLoadingData(true);

      const [countriesResult, destResult, svcResult] = await Promise.allSettled([
        // ✅ "/countries" → "https://backend.../api/countries"
        fetchJSON("/countries?is_active=true&limit=200", signal),
        // ✅ "/destinations" → "https://backend.../api/destinations"
        fetchJSON("/destinations?is_active=true&limit=200", signal),
        // ✅ "/services" → "https://backend.../api/services"
        fetchJSON("/services?is_active=true&limit=200", signal),
      ]);

      if (!mountedRef.current) return;

      // Countries
      if (countriesResult.status === "fulfilled") {
        const raw = countriesResult.value?.data ?? countriesResult.value ?? [];
        setCountriesList(
          (Array.isArray(raw) ? raw : []).map((c) => ({
            value:  String(c.id    ?? c.value ?? c.code ?? ""),
            label:  c.name  ?? c.label ?? "",
            flag:   c.flag  ?? "",
            region: c.region ?? c.continent ?? "",
          }))
        );
      } else {
        console.warn("[BookingWizard] Countries failed:", countriesResult.reason?.message);
      }

      // Destinations
      if (destResult.status === "fulfilled") {
        const raw = destResult.value?.data ?? destResult.value ?? [];
        setDestinationsList(
          (Array.isArray(raw) ? raw : []).map((d) => ({
            value:     String(d.id ?? d.value ?? ""),
            label:     d.name  ?? d.label ?? "",
            slug:      String(d.slug ?? d.slug_url ?? d.value ?? ""),
            country:   typeof d.country === "object"
              ? (d.country?.name ?? d.countryName ?? "")
              : (d.country ?? ""),
            countryId: String(d.country_id ?? ""),
            image:     d.image ?? d.thumbnail ?? d.imageUrl ?? "",
            rating:    d.rating ?? null,
            duration:  d.duration ?? "",
          }))
        );
      } else if (!signal.aborted) {
        console.warn("[BookingWizard] Destinations failed:", destResult.reason?.message);
      }

      // Services + derive categories
      if (svcResult.status === "fulfilled") {
        const raw  = svcResult.value?.data ?? svcResult.value ?? [];
        const svcs = Array.isArray(raw) ? raw : [];
        setServicesData(svcs);
        const cats = [...new Set(svcs.map((s) => s.category).filter(Boolean))];
        setCategoriesList(cats.map((c) => ({ value: c, label: c })));
      } else if (!signal.aborted) {
        console.warn("[BookingWizard] Services failed:", svcResult.reason?.message);
      }

      if (mountedRef.current) setLoadingData(false);
    };

    load();
    return () => controller.abort();
  }, []);

  // ── Computed values ───────────────────────────────────────────────────
  const displayName =
    [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
    user?.full_name || user?.name || user?.email || "Traveler";

  const getTripDuration = useCallback(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end   = new Date(formData.endDate);
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    return Math.ceil((end - start) / 86_400_000);
  }, [formData.startDate, formData.endDate]);

  const getTotalVisitors = useCallback(() => {
    const adults   = Math.max(0, parseInt(formData.adults,   10) || 0);
    const children = Math.max(0, parseInt(formData.children, 10) || 0);
    const infants  = Math.max(0, parseInt(formData.infants,  10) || 0);
    return Math.max(1, adults + children + infants);
  }, [formData.adults, formData.children, formData.infants]);

  const getDestinationName = useCallback(
    (id) =>
      destinationsList.find((d) => String(d.value) === String(id ?? formData.destinationId))?.label
        ?? String(id ?? formData.destinationId ?? ""),
    [destinationsList, formData.destinationId]
  );

  // ── Field change ──────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const target     = e?.target ?? e;
    const fieldName  = target?.name  ?? "";
    const fieldValue = target?.type === "checkbox"
      ? target.checked
      : (target?.value ?? "");

    if (!fieldName) return;

    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }));
    setErrors((prev) => {
      if (!(fieldName in prev)) return prev;
      const { [fieldName]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // ── Field blur ────────────────────────────────────────────────────────
  const handleBlur = useCallback((e) => {
    const name = e?.target?.name ?? (typeof e === "string" ? e : "");
    if (name) setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // ── Interest toggle ───────────────────────────────────────────────────
  const handleInterestToggle = useCallback((interestValue) => {
    setFormData((prev) => {
      const cur = Array.isArray(prev.interests) ? prev.interests : [];
      return {
        ...prev,
        interests: cur.includes(interestValue)
          ? cur.filter((i) => i !== interestValue)
          : [...cur, interestValue],
      };
    });
  }, []);

  // ── Step validation ───────────────────────────────────────────────────
  const validateStep = useCallback(
    (step) => {
      const errs = {};
      switch (step) {
        case 0:
          if (!formData.countryId && !formData.destinationId) {
            errs.countryId = "Please select a country or destination.";
          }
          if (!formData.isFlexible) {
            if (!formData.startDate)
              errs.startDate = "Please choose a departure date.";
          } else {
            if (!formData.flexibleMonths?.length)
              errs.flexibleMonths = "Please select at least one preferred month.";
          }
          break;
        case 1:
          if (!formData.adults || parseInt(formData.adults, 10) < 1)
            errs.adults = "At least 1 adult is required.";
          if (!formData.groupType)
            errs.groupType = "Please select your group type.";
          break;
        case 2:
          if (!formData.accommodationType)
            errs.accommodationType = "Please select an accommodation style.";
          if (!formData.budgetRange)
            errs.budgetRange = "Please select your budget range.";
          break;
        case 3:
          break;
        case 4:
          if (!formData.firstName?.trim()) errs.firstName = "First name is required.";
          if (!formData.lastName?.trim())  errs.lastName  = "Last name is required.";
          if (!formData.email?.trim())     errs.email     = "Email address is required.";
          else if (!EMAIL_RE.test(formData.email.trim()))
            errs.email = "Please enter a valid email address.";
          if (!formData.phone?.trim())     errs.phone     = "Phone number is required.";
          if (!formData.country?.trim())   errs.country   = "Country of residence is required.";
          if (!formData.agreeToTerms)
            errs.agreeToTerms = "You must agree to the terms to continue.";
          break;
        default:
          break;
      }
      return errs;
    },
    [
      formData.countryId,       formData.destinationId,
      formData.isFlexible,      formData.startDate,
      formData.flexibleMonths,  formData.adults,
      formData.groupType,       formData.accommodationType,
      formData.budgetRange,     formData.firstName,
      formData.lastName,        formData.email,
      formData.phone,           formData.country,
      formData.agreeToTerms,
    ]
  );

  // ── Navigation ────────────────────────────────────────────────────────
  const goToStep = useCallback((step) => {
    if (step < 0 || step > STEPS.length - 1) return;
    if (navigatingRef.current) return;

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
  }, []);

  const nextStep = useCallback(() => {
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
    setErrors({});
    goToStep(currentStep + 1);
  }, [currentStep, goToStep, validateStep]);

  const prevStep = useCallback(
    () => goToStep(currentStep - 1),
    [currentStep, goToStep]
  );

  const handleStepClick = useCallback(
    (step) => { if (step <= currentStep) goToStep(step); },
    [currentStep, goToStep]
  );

  // ── Compute booking_type before submit
  const computeBookingType = useCallback(() => {
    const { destinationId, countryId, categoryId } = formData;
    if (destinationId || countryId || categoryId) return "destination";
    return "custom";
  }, [formData]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const stepErrs = validateStep(4);
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
        booking_type:          computeBookingType(),
        destination_id:       formData.destinationId || undefined,
        country_id:           formData.countryId     || undefined,
        category_id:          formData.categoryId    || undefined,
        travel_date:          formData.startDate     || undefined,
        return_date:          formData.endDate       || undefined,
        flexible_dates:       formData.isFlexible,
        flexible_months:      formData.flexibleMonths?.join(",") || undefined,
        number_of_adults:     Math.max(1, parseInt(formData.adults,   10) || 1),
        number_of_children:   Math.max(0, parseInt(formData.children, 10) || 0),
        number_of_infants:    Math.max(0, parseInt(formData.infants,  10) || 0),
        number_of_travelers:  getTotalVisitors(),
        group_type:           formData.groupType           || undefined,
        accommodation_type:   formData.accommodationType   || undefined,
        budget_range:         formData.budgetRange         || undefined,
        interests:            formData.interests?.join(",") || undefined,
        dietary_requirements: formData.dietaryRequirements || undefined,
        special_requests:     formData.specialRequests     || undefined,
        medical_conditions:   formData.medicalDetails      || undefined,
        first_name:           formData.firstName?.trim(),
        last_name:            formData.lastName?.trim(),
        full_name:            `${formData.firstName} ${formData.lastName}`.trim(),
        email:                formData.email?.trim(),
        phone:                formData.phone?.trim(),
        whatsapp:             formData.whatsapp?.trim() || formData.phone?.trim(),
        nationality:          formData.nationality || undefined,
        country:              formData.country || undefined,
        source:               "website",
        referrer_url:         typeof window !== "undefined"
          ? window.location.href : undefined,
      });

      const data = await createBooking(payload);
      setPendingBookingId(data?.id ?? data?.bookingId ?? null);
      if (!mountedRef.current) return;

      setIsSubmitted(true);
      setSubmissionRef(
        data?.booking_number ?? data?.referenceNumber ?? data?.id ?? ""
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
            "Please check the highlighted fields and try again."
          );
        } else if (err.isRateLimit) {
          setSubmitError("Too many requests — please wait a moment before trying again.");
        } else if (err.isServerError) {
          setSubmitError(
            "Our servers are temporarily unavailable. " +
            "Please try again shortly or contact us via WhatsApp."
          );
        } else if (err.isNetwork) {
          setSubmitError(
            "Network error — please check your internet connection and try again."
          );
        } else {
          setSubmitError(err.message || "Booking failed. Please try again.");
        }
      } else {
        setSubmitError(
          "An unexpected error occurred. Please try again or contact support."
        );
      }

      setSubmitRetryCount((c) => c + 1);
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  }, [formData, currentStep, isSubmitting, validateStep, getTotalVisitors, computeBookingType]);

  // ── Modal helpers ─────────────────────────────────────────────────────
  const openModal  = useCallback(() => setShowModal(true),  []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // ── Public API ────────────────────────────────────────────────────────
  return {
    currentStep, isAnimating, isSubmitting, isSubmitted,
    loadingData, showModal, openModal, closeModal,
    formData, setFormData, errors, touched,
    handleChange, handleBlur, handleInterestToggle,
    nextStep, prevStep, handleStepClick,
    handleSubmit, submitError, setSubmitError,
    submissionRef, submitRetryCount,
    pendingBookingId,
    categoriesList, destinationsList, countriesList, servicesData,
    displayName, getTripDuration, getTotalVisitors, getDestinationName,
    groupTypes:         GROUP_TYPES,
    accommodationTypes: ACCOMMODATION_TYPES,
    interests:          INTERESTS,
    user, isAuthenticated,
    prefilledFields,
  };
};