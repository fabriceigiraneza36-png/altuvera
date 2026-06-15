// src/hooks/useBookingWizard.js
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { useDestinations } from "./useDestinations";
import { useCountries } from "./useCountries";
import { INITIAL_FORM, STEPS } from "../pages/Booking/BookingShared";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ── Validators ── */
const required = (v) => (v ? "" : "This field is required");
const validEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email";
const validPhone = (v) =>
  !v || /^[\d\s\+\-\(\)]{7,20}$/.test(v) ? "" : "Enter a valid phone number";

const STEP_VALIDATORS = {
  0: (f) => {
    const e = {};
    if (!f.countryId && !f.destinationId)
      e.destinationId = "Please select a country or destination";
    if (!f.startDate) e.startDate = "Please choose a start date";
    if (f.startDate && f.endDate && f.endDate <= f.startDate)
      e.endDate = "End date must be after start date";
    return e;
  },
  1: (f) => {
    const e = {};
    if (f.adults < 1) e.adults = "At least 1 adult required";
    if (f.adults > 30) e.adults = "Max 30 adults";
    if (!f.groupType) e.groupType = "Please select a group type";
    return e;
  },
  2: () => ({}),
  3: () => ({}),
  4: (f) => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = required(f.firstName);
    if (!f.lastName.trim()) e.lastName = required(f.lastName);
    const emailErr = validEmail(f.email);
    if (emailErr) e.email = emailErr;
    const phoneErr = validPhone(f.phone);
    if (phoneErr) e.phone = phoneErr;
    if (!f.agreeToTerms) e.agreeToTerms = "You must accept the terms";
    return e;
  },
};

export const useBookingWizard = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, openModal } = useUserAuth?.() || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState(() => {
    const base = { ...INITIAL_FORM };
    // Pre-fill from URL params
    const dest = searchParams.get("destination");
    const country = searchParams.get("country");
    if (dest) base.destinationId = dest;
    if (country) base.countryId = country;
    return base;
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionRef, setSubmissionRef] = useState("");

  // Pre-fill contact from authenticated user
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || user.full_name?.split(" ")[0] || "",
        lastName: prev.lastName || user.lastName || user.full_name?.split(" ").slice(1).join(" ") || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user, isAuthenticated]);

  /* ── Data loading ── */
  const { destinations: rawDests = [], loading: loadingDests } = useDestinations?.({ limit: 200 }) || {};
  const { countries: rawCountries = [], loading: loadingCountries } = useCountries?.({ limit: 100 }) || {};
  const [servicesData, setServicesData] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const loadingData = loadingDests || loadingCountries;

  useEffect(() => {
    setLoadingServices(true);
    fetch(`${API}/api/services`)
      .then((r) => r.json())
      .then((d) => setServicesData(d.data || d.services || d || []))
      .catch(() => setServicesData([]))
      .finally(() => setLoadingServices(false));
  }, []);

  /* ── Derived lists ── */
  const destinationsList = rawDests.map((d) => ({
    value: String(d.id),
    label: d.name,
    country: d.country || d.countryObj?.name || "",
    image: d.imageUrl || d.heroImage || "",
    duration: d.duration || "",
    rating: d.rating,
  }));

  const countriesList = rawCountries.map((c) => ({
    value: String(c.id),
    label: c.name,
    flag: c.flag || c.flagUrl || "",
    region: c.region || "",
  }));

  const categoriesList = [
    ...new Set(rawDests.map((d) => d.category).filter(Boolean)),
  ].map((c) => ({ value: c, label: c }));

  /* ── Computed ── */
  const getTotalVisitors = useCallback(
    () =>
      (parseInt(formData.adults) || 0) +
      (parseInt(formData.children) || 0) +
      (parseInt(formData.infants) || 0),
    [formData.adults, formData.children, formData.infants]
  );

  const getTripDuration = useCallback(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const diff = new Date(formData.endDate) - new Date(formData.startDate);
    const days = Math.ceil(diff / 86400000);
    return days > 0 ? days : null;
  }, [formData.startDate, formData.endDate]);

  const getDestinationName = useCallback(() => {
    if (formData.destinationId) {
      const d = destinationsList.find((x) => x.value === formData.destinationId);
      return d?.label || "";
    }
    if (formData.countryId) {
      const c = countriesList.find((x) => x.value === formData.countryId);
      return c?.label || "";
    }
    return "";
  }, [formData.destinationId, formData.countryId, destinationsList, countriesList]);

  const displayName = user?.firstName || user?.full_name?.split(" ")[0] || "";

  /* ── Handlers ── */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const stepErrors = STEP_VALIDATORS[currentStep]?.(formData) || {};
      if (stepErrors[name]) {
        setErrors((prev) => ({ ...prev, [name]: stepErrors[name] }));
      }
    },
    [currentStep, formData]
  );

  const handleInterestToggle = useCallback((val) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(val)
        ? prev.interests.filter((i) => i !== val)
        : [...prev.interests, val],
    }));
  }, []);

  const validateStep = useCallback(
    (step) => {
      const validate = STEP_VALIDATORS[step];
      if (!validate) return true;
      const errs = validate(formData);
      setErrors(errs);
      const fields = Object.keys(errs);
      if (fields.length) {
        setTouched((prev) => ({
          ...prev,
          ...fields.reduce((a, k) => ({ ...a, [k]: true }), {}),
        }));
        return false;
      }
      return true;
    },
    [formData]
  );

  const animateTransition = useCallback(async (fn) => {
    setIsAnimating(true);
    await new Promise((r) => setTimeout(r, 220));
    fn();
    await new Promise((r) => setTimeout(r, 60));
    setIsAnimating(false);
  }, []);

  const nextStep = useCallback(async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep >= STEPS.length - 1) return;
    await animateTransition(() => {
      setCurrentStep((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [currentStep, validateStep, animateTransition]);

  const prevStep = useCallback(async () => {
    if (currentStep <= 0) return;
    await animateTransition(() => {
      setCurrentStep((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [currentStep, animateTransition]);

  const handleStepClick = useCallback(
    async (idx) => {
      if (idx > currentStep) {
        for (let s = currentStep; s < idx; s++) {
          if (!validateStep(s)) return;
        }
      }
      await animateTransition(() => {
        setCurrentStep(idx);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    },
    [currentStep, validateStep, animateTransition]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!validateStep(4)) return;

      setIsSubmitting(true);
      try {
        const payload = {
          // Trip
          destinationId: formData.destinationId || null,
          countryId: formData.countryId || null,
          categoryId: formData.categoryId || null,
          serviceId: formData.serviceId || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          isFlexible: formData.isFlexible,
          flexibleMonths: formData.flexibleMonths,
          // Travelers
          adults: parseInt(formData.adults) || 1,
          children: parseInt(formData.children) || 0,
          infants: parseInt(formData.infants) || 0,
          groupType: formData.groupType,
          totalVisitors: getTotalVisitors(),
          // Preferences
          accommodationType: formData.accommodationType,
          interests: formData.interests,
          budgetRange: formData.budgetRange,
          dietaryRequirements: formData.dietaryRequirements,
          specialRequests: formData.specialRequests,
          hasMedicalConditions: formData.hasMedicalConditions,
          medicalDetails: formData.medicalDetails,
          // Contact
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country,
          hearAboutUs: formData.hearAboutUs,
          agreeToTerms: formData.agreeToTerms,
          subscribeNewsletter: formData.subscribeNewsletter,
          // Meta
          destinationName: getDestinationName(),
          tripDurationDays: getTripDuration(),
          source: "website-booking-wizard",
        };

        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API}/api/bookings`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Booking failed");

        setSubmissionRef(data.data?.referenceNumber || data.data?.id || data.referenceNumber || "");
        setIsSubmitted(true);
      } catch (err) {
        setErrors({ submit: err.message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateStep, getTotalVisitors, getTripDuration, getDestinationName]
  );

  return {
    // State
    currentStep,
    isAnimating,
    formData,
    setFormData,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    loadingData,
    submissionRef,
    // Lists
    destinationsList,
    countriesList,
    categoriesList,
    servicesData,
    // Computed
    getTotalVisitors,
    getTripDuration,
    getDestinationName,
    displayName,
    // Auth
    user,
    isAuthenticated,
    openModal,
    // Handlers
    handleChange,
    handleBlur,
    handleInterestToggle,
    validateStep,
    nextStep,
    prevStep,
    handleStepClick,
    handleSubmit,
    // Static data (passed through)
    groupTypes: [
      { value: "solo", label: "Solo Adventure", icon: "🧳" },
      { value: "couple", label: "Couple", icon: "💑" },
      { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
      { value: "friends", label: "Friends Group", icon: "🎉" },
      { value: "corporate", label: "Corporate", icon: "🏢" },
      { value: "honeymoon", label: "Honeymoon", icon: "💍" },
    ],
    accommodationTypes: [
      { value: "budget", label: "Budget", icon: "🏕️", desc: "Camps & hostels" },
      { value: "mid-range", label: "Mid-Range", icon: "🏨", desc: "Comfortable lodges" },
      { value: "luxury", label: "Luxury", icon: "🏰", desc: "5-star lodges" },
      { value: "ultra-luxury", label: "Ultra Luxury", icon: "👑", desc: "Private reserves" },
    ],
    interests: [
      { value: "wildlife", label: "Wildlife Safaris", icon: "🦁" },
      { value: "hiking", label: "Hiking & Trekking", icon: "🥾" },
      { value: "culture", label: "Cultural Experiences", icon: "🎭" },
      { value: "photography", label: "Photography", icon: "📸" },
      { value: "birdwatching", label: "Bird Watching", icon: "🦅" },
      { value: "gorillas", label: "Gorilla Trekking", icon: "🦍" },
      { value: "beaches", label: "Beach & Relaxation", icon: "🏖️" },
      { value: "adventure", label: "Adventure Sports", icon: "⛰️" },
      { value: "food", label: "Local Cuisine", icon: "🍽️" },
      { value: "conservation", label: "Conservation", icon: "🌿" },
      { value: "hot-air-balloon", label: "Hot Air Balloon", icon: "🎈" },
      { value: "nightlife", label: "Nightlife & Music", icon: "🎵" },
    ],
  };
};