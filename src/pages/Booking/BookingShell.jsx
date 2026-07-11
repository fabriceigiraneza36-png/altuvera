// src/pages/Booking/BookingShell.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Owns ALL shared booking state so it survives step navigation.
// Children (BookingWizard) consume it via BookingContext.
// ─────────────────────────────────────────────────────────────────────────────
import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from "react";
import { Outlet } from "react-router-dom";
import { useBookingPersistence } from "../../hooks/useBookingPersistence";
import { useBookingWizard }      from "../../hooks/useBookingWizard";

/* ── Context ── */
const BookingCtx = createContext(null);
export const useBookingCtx = () => {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBookingCtx must be inside BookingShell");
  return ctx;
};

/* ── Validation ── */
export function validateStep(step, formData) {
  const errors = {};

  if (step === 0) {
    if (!formData.countryId)
      errors.countryId = "Please select a country";
    if (!formData.isFlexible && !formData.startDate)
      errors.startDate = "Please select a departure date";
    if (formData.isFlexible && !(formData.flexibleMonths || []).length)
      errors.flexibleMonths = "Please select at least one month";
  }

  if (step === 1) {
    if (!formData.adults || parseInt(formData.adults, 10) < 1)
      errors.adults = "At least 1 adult is required";
    if (!formData.groupType)
      errors.groupType = "Please select a group type";
  }

  // step 2 = Review — no validation
  if (step === 3) {
    if (!formData.firstName?.trim()) errors.firstName = "First name is required";
    if (!formData.lastName?.trim())  errors.lastName  = "Last name is required";
    if (!formData.email?.trim())     errors.email     = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email";
    if (!formData.phone?.trim())     errors.phone     = "Phone number is required";
    if (!formData.country?.trim())   errors.country   = "Your country is required";
    if (!formData.agreeToTerms)      errors.agreeToTerms = "You must agree to the terms";
  }

  return errors;
}

/* ── Shell ── */
const BookingShell = () => {
  const persistence = useBookingPersistence();
  const wizard      = useBookingWizard();

  /* ── Form state — survives all child route changes ── */
  const [formData, setFormDataRaw] = useState(
    () => ({ ...persistence.DEFAULT_FORM, ...persistence.formData }),
  );

  /* Merge wizard pre-fill (email, name from auth) once */
  const mergedOnce = useRef(false);
  useEffect(() => {
    if (wizard.loadingData || mergedOnce.current || !wizard.formData) return;
    mergedOnce.current = true;
    setFormDataRaw((prev) => {
      const patch = {};
      ["email", "firstName", "lastName", "phone"].forEach((f) => {
        if (wizard.formData[f] && !prev[f]) patch[f] = wizard.formData[f];
      });
      return Object.keys(patch).length ? { ...prev, ...patch } : prev;
    });
  }, [wizard.loadingData, wizard.formData]);

  const setFormData = useCallback((updater) => {
    setFormDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistence.setFormData(next);
      return next;
    });
  }, [persistence]);

  /* ── Validation state ── */
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  /* ── Shake ── */
  const [shake, setShake] = useState(false);
  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  /* ── Submit state ── */
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitError,   setSubmitError]   = useState(null);
  const [retryCount,    setRetryCount]    = useState(0);
  const [submissionRef, setSubmissionRef] = useState(null);
  const [bookingEmail,  setBookingEmail]  = useState(null);

  /* ── Resume banner ── */
  const [showResume, setShowResume] = useState(
    () => persistence.hasSavedData && (persistence.currentStep ?? 0) > 0,
  );

  /* ── Field handlers ── */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  }, [setFormData]);

  const handleBlur = useCallback((e, stepOverride) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
  }, []);

  const handleInterestToggle = useCallback((val) => {
    setFormData((p) => ({
      ...p,
      interests: (p.interests || []).includes(val)
        ? (p.interests || []).filter((i) => i !== val)
        : [...(p.interests || []), val],
    }));
  }, [setFormData]);

  /* ── Helpers ── */
  const getTripDuration = useCallback(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const d = Math.round(
      (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000,
    );
    return d > 0 ? d : null;
  }, [formData.startDate, formData.endDate]);

  const getTotalVisitors = useCallback(() =>
    (parseInt(formData.adults,   10) || 0) +
    (parseInt(formData.children, 10) || 0) +
    (parseInt(formData.infants,  10) || 0),
  [formData.adults, formData.children, formData.infants]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async (navigate) => {
    const errs = validateStep(3, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(Object.fromEntries(Object.keys(errs).map((k) => [k, true])));
      triggerShake();
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await wizard.handleSubmit?.(formData);
      const ref = result?.ref || result?.id || result?.bookingId
        || wizard.submissionRef || null;
      persistence.clearStorage();
      setBookingEmail(formData.email);
      setSubmissionRef(ref);
      navigate("/booking/success", { replace: true });
    } catch (err) {
      setSubmitError(err);
      setRetryCount((c) => c + 1);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, wizard, persistence, triggerShake]);

  /* ── Resume handlers ── */
  const handleResume = useCallback((navigate) => {
    setShowResume(false);
    const targetStep = persistence.currentStep ?? 0;
    const { stepToPath } = require("./BookingRouter");
    navigate(`/booking/${stepToPath(targetStep)}`);
  }, [persistence.currentStep]);

  const handleStartFresh = useCallback((navigate) => {
    persistence.clearStorage();
    setFormDataRaw(persistence.DEFAULT_FORM);
    setErrors({});
    setTouched({});
    setShowResume(false);
    navigate("/booking/trip", { replace: true });
  }, [persistence]);

  /* ── Context value ── */
  const ctx = {
    /* form */
    formData, setFormData,
    errors, setErrors,
    touched, setTouched,
    handleChange, handleBlur, handleInterestToggle,
    /* nav */
    shake, triggerShake,
    validateStep,
    /* submit */
    isSubmitting, submitError, setSubmitError,
    retryCount, submissionRef, bookingEmail,
    handleSubmit,
    /* resume */
    showResume, setShowResume,
    handleResume, handleStartFresh,
    /* helpers */
    getTripDuration, getTotalVisitors,
    /* wizard remote data */
    wizard,
    persistence,
  };

  return (
    <BookingCtx.Provider value={ctx}>
      <Outlet />
    </BookingCtx.Provider>
  );
};

export default BookingShell;