import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from "react";
import { STEPS } from "./useBookingForm";

const BookingContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "altuvera_booking_v1";

const INITIAL = {
  firstName: "", lastName: "", nationality: "",
  countryId: "", destinationId: "", groupType: "",
  startDate: "", endDate: "", flexibleDates: false, flexibleMonths: [],
  adults: 1, children: 0, specialRequests: "",
  email: "", phone: "", country: "",
  preferredContactMethod: "whatsapp",
  newsletterOptIn: false, agreeToTerms: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS = [
  (d) => {
    const e = {};
    if (!d.firstName.trim())    e.firstName    = "First name required";
    if (!d.lastName.trim())     e.lastName     = "Last name required";
    if (!d.nationality.trim())  e.nationality  = "Nationality required";
    return e;
  },
  (d) => {
    const e = {};
    if (!d.countryId)     e.countryId     = "Choose a country";
    if (!d.destinationId) e.destinationId = "Choose a destination";
    if (!d.groupType)     e.groupType     = "Select group type";
    return e;
  },
  (d) => {
    const e = {};
    if (!d.flexibleDates && !d.startDate) e.startDate = "Pick a date";
    if (!d.flexibleDates && d.startDate && d.endDate && d.endDate < d.startDate)
      e.endDate = "Return must be after departure";
    if (d.flexibleDates && (!d.flexibleMonths || !d.flexibleMonths.length))
      e.flexibleMonths = "Pick at least one month";
    if (!d.adults || Number(d.adults) < 1) e.adults = "At least 1 adult";
    return e;
  },
  (d) => {
    const e = {};
    if (!d.email.trim() || !EMAIL_RE.test(d.email)) e.email = "Valid email required";
    if (!d.phone.trim())   e.phone   = "Phone required";
    if (!d.country.trim()) e.country = "Country required";
    if (!d.agreeToTerms)   e.agreeToTerms = "Please accept terms";
    return e;
  },
];

const persist = (state) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
};
const restore = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function BookingProvider({ children }) {
  const saved = useRef(restore());

  const [step, setStep]         = useState(saved.current?.step ?? 0);
  const [data, setData]         = useState({ ...INITIAL, ...(saved.current?.data || {}) });
  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bookingRef, setBookingRef]   = useState(null);

  const retryRef = useRef(0);

  useEffect(() => {
    persist({ step, data });
  }, [step, data]);

  const set = useCallback((field, value) => {
    setData(p => ({ ...p, [field]: value }));
    setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  }, []);

  const touch = useCallback((field) =>
    setTouched(p => ({ ...p, [field]: true })), []);

  const validateStep = useCallback((s) => VALIDATORS[s]?.(data) || {}, [data]);

  const goTo = useCallback((s) => {
    const clamped = Math.max(0, Math.min(s, STEPS.length - 1));
    setStep(clamped);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const tryNext = useCallback(() => {
    const errs = VALIDATORS[step]?.(data) || {};
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(p => ({
        ...p,
        ...Object.keys(errs).reduce((a, k) => ({ ...a, [k]: true }), {}),
      }));
      return false;
    }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [step, data]);

  const goBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const jumpTo = useCallback((t) => {
    if (t <= step) {
      setStep(t);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const submit = useCallback(async () => {
    const errs = VALIDATORS[STEPS.length - 1]?.(data) || {};
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(p => ({
        ...p,
        ...Object.keys(errs).reduce((a, k) => ({ ...a, [k]: true }), {}),
      }));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: data.firstName, lastName: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email, phone: data.phone, country: data.country,
          nationality: data.nationality || undefined,
          countryId: data.countryId || undefined,
          destinationId: data.destinationId || undefined,
          startDate: data.flexibleDates ? undefined : data.startDate || undefined,
          endDate:   data.flexibleDates ? undefined : data.endDate   || undefined,
          flexibleDates: data.flexibleDates,
          flexibleMonths: data.flexibleDates ? data.flexibleMonths : [],
          adults: Number(data.adults), children: Number(data.children),
          groupType: data.groupType,
          specialRequests: data.specialRequests || undefined,
          preferredContactMethod: data.preferredContactMethod,
          newsletterOptIn: data.newsletterOptIn,
          agreeToTerms: data.agreeToTerms,
          source: "website", booking_type: "destination",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(
        (Array.isArray(json?.errors) ? json.errors[0]?.message : null) ||
        json?.error || json?.message || "Submission failed",
      );
      setBookingRef(json.data?.booking_number || null);
      setSubmitted(true);
      retryRef.current = 0;
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    } catch (err) {
      retryRef.current += 1;
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setStep(0);
    setData(INITIAL);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setSubmitError(null);
    setBookingRef(null);
    retryRef.current = 0;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const displayName = data.firstName.trim() || null;
  const totalTravelers = Number(data.adults) + Number(data.children);

  const getDestinationName = useCallback(
    (list) => list.find(d => String(d.value) === String(data.destinationId))?.label || "",
    [data.destinationId],
  );
  const getCountryName = useCallback(
    (list) => list.find(c => String(c.value) === String(data.countryId))?.label || "",
    [data.countryId],
  );

  const value = {
    step, STEPS,
    data, set, touch, errors, touched,
    validateStep, tryNext, goBack, jumpTo, goTo, submit, reset,
    submitting, submitted, submitError, setSubmitError,
    bookingRef, displayName, totalTravelers,
    getDestinationName, getCountryName,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingContext() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookingContext must be used within <BookingProvider>");
  return ctx;
}
