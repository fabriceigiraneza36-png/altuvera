import { useState, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const STEPS = [
  { id: "name",        label: "Welcome",     icon: "wave"    },
  { id: "destination", label: "Destination", icon: "globe"   },
  { id: "travel",      label: "Dates",       icon: "calendar"},
  { id: "travelers",   label: "Travelers",   icon: "users"   },
  { id: "contact",     label: "Contact",     icon: "mail"    },
  { id: "review",      label: "Review",      icon: "check"   },
];

const INITIAL_DATA = {
  firstName: "", lastName: "",
  countryId: "", destinationId: "",
  startDate: "", endDate: "",
  flexibleDates: false, flexibleMonths: [],
  adults: 1, children: 0,
  groupType: "", specialRequests: "",
  email: "", phone: "",
  country: "", nationality: "",
  preferredContactMethod: "whatsapp",
  newsletterOptIn: false,
  agreeToTerms: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS = [
  // Step 0 — Name
  (d) => {
    const e = {};
    if (!d.firstName.trim()) e.firstName = "We'd love to know your first name!";
    if (!d.lastName.trim())  e.lastName  = "And your last name, please?";
    return e;
  },
  // Step 1 — Destination
  (d) => {
    const e = {};
    if (!d.countryId)     e.countryId     = "Please pick a country";
    if (!d.destinationId) e.destinationId = "Which destination calls to you?";
    return e;
  },
  // Step 2 — Travel dates
  (d) => {
    const e = {};
    if (!d.flexibleDates && !d.startDate)
      e.startDate = "When do you plan to travel?";
    if (!d.flexibleDates && d.startDate && d.endDate && d.endDate < d.startDate)
      e.endDate = "Return must be after departure";
    if (d.flexibleDates && !d.flexibleMonths.length)
      e.flexibleMonths = "Pick at least one month";
    return e;
  },
  // Step 3 — Travelers
  (d) => {
    const e = {};
    if (!d.adults || Number(d.adults) < 1) e.adults    = "At least 1 adult required";
    if (!d.groupType)                       e.groupType = "What type of group?";
    return e;
  },
  // Step 4 — Contact
  (d) => {
    const e = {};
    if (!d.email.trim() || !EMAIL_RE.test(d.email))
      e.email = "Valid email needed for your confirmation";
    if (!d.phone.trim())   e.phone   = "Phone for WhatsApp coordination";
    if (!d.country.trim()) e.country = "Where are you based?";
    if (!d.agreeToTerms)   e.agreeToTerms = "Please accept to continue";
    return e;
  },
  // Step 5 — Review (no extra validation)
  () => ({}),
];

export function useBookingForm({ countriesList = [], destinationsList = [] }) {
  const [step,         setStep]         = useState(0);
  const [data,         setData]         = useState(INITIAL_DATA);
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [submitError,  setSubmitError]  = useState(null);
  const [bookingRef,   setBookingRef]   = useState(null);
  const retryCount = useRef(0);

  /* ── field setter ── */
  const set = useCallback((field, value) => {
    setData(prev  => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const touch = useCallback((field) =>
    setTouched(prev => ({ ...prev, [field]: true })), []);

  /* ── advance step ── */
  const tryNext = useCallback(() => {
    const errs = VALIDATORS[step]?.(data) || {};
    if (Object.keys(errs).length) {
      setErrors(errs);
      const allTouched = Object.keys(errs)
        .reduce((a, k) => ({ ...a, [k]: true }), {});
      setTouched(prev => ({ ...prev, ...allTouched }));
      return false;
    }
    setErrors({});
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [step, data]);

  const goBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const jumpTo = useCallback((target) => {
    if (target < step) setStep(target);
  }, [step]);

  /* ── submit ── */
  const submit = useCallback(async () => {
    const errs = VALIDATORS[4]?.(data) || {};
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      firstName:              data.firstName,
      lastName:               data.lastName,
      full_name:              `${data.firstName} ${data.lastName}`.trim(),
      email:                  data.email,
      phone:                  data.phone,
      country:                data.country,
      nationality:            data.nationality || undefined,
      countryId:              data.countryId   || undefined,
      destinationId:          data.destinationId || undefined,
      startDate:              data.flexibleDates ? undefined : data.startDate || undefined,
      endDate:                data.flexibleDates ? undefined : data.endDate   || undefined,
      flexibleDates:          data.flexibleDates,
      flexibleMonths:         data.flexibleDates ? data.flexibleMonths : [],
      adults:                 Number(data.adults),
      children:               Number(data.children),
      groupType:              data.groupType,
      specialRequests:        data.specialRequests || undefined,
      preferredContactMethod: data.preferredContactMethod,
      newsletterOptIn:        data.newsletterOptIn,
      agreeToTerms:           data.agreeToTerms,
      source:                 "website",
      booking_type:           "destination",
    };

    try {
      const res  = await fetch(`${API}/bookings`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          (Array.isArray(json?.errors) ? json.errors[0]?.message : null) ||
          json?.error || json?.message || "Submission failed. Please try again.";
        throw new Error(msg);
      }
      setBookingRef(json.data?.booking_number || null);
      setSubmitted(true);
      retryCount.current = 0;
    } catch (err) {
      retryCount.current += 1;
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  const reset = useCallback(() => {
    setStep(0); setData(INITIAL_DATA);
    setErrors({}); setTouched({});
    setSubmitted(false); setSubmitError(null);
    setBookingRef(null); retryCount.current = 0;
  }, []);

  /* ── derived ── */
  const displayName    = data.firstName.trim() || null;
  const totalTravelers = Number(data.adults) + Number(data.children);

  const getDestinationName = useCallback(() =>
    destinationsList.find(d => d.value === data.destinationId)?.label || "",
  [destinationsList, data.destinationId]);

  const getCountryName = useCallback(() =>
    countriesList.find(c => c.value === data.countryId)?.label || "",
  [countriesList, data.countryId]);

  return {
    step, data, set, touch, errors, touched,
    tryNext, goBack, jumpTo, submit, reset,
    submitting, submitted, submitError, setSubmitError,
    bookingRef, displayName, totalTravelers,
    getDestinationName, getCountryName,
    retryCount: retryCount.current,
  };
}