// src/hooks/useBookingWizard.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useServices } from "../hooks/useServices";
import {
  STEPS,
  ADMIN_CONTACT,
  formatDate,
  getWhatsAppLink,
  normalizeResponseArray,
} from "../pages/Booking/BookingShared";
import { sendMessage } from "../utils/sendMessage";

const BOOKING_DRAFT_KEY = "altuvera_booking_draft_v1";

const buildDefaults = (user) => ({
  tripType: "",
  destination: "",
  startDate: "",
  endDate: "",
  adults: 2,
  children: 0,
  groupType: "couple",
  accommodation: "mid-range",
  interests: [],
  preferredContactMethod: "whatsapp",
  preferredContactTime: "",
  pickupLocation: "",
  flightArrival: "",
  flightDeparture: "",
  dietaryRequirements: "",
  accessibilityNeeds: "",
  marketingSource: "",
  newsletterOptIn: false,
  userImage: user?.avatar || "",
  name: user?.full_name || user?.fullName || user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  country: "",
  specialRequests: "",
});

const readDraft = (user) => {
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return buildDefaults(user);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return buildDefaults(user);
    return { ...buildDefaults(user), ...parsed };
  } catch {
    return buildDefaults(user);
  }
};

export const useBookingWizard = () => {
  const { authFetch, user, openModal } = useUserAuth();
  const { services: servicesData = [] } = useServices();

  const [countriesList, setCountriesList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [formData, setFormData] = useState(() => readDraft(user));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Track whether user-sync has run once
  const userSynced = useRef(false);

  /* ── Display name ── */
  const displayName = useMemo(
    () => user?.full_name || user?.fullName || user?.name || user?.email?.split("@")[0] || "",
    [user],
  );
  const isAuthenticated = Boolean(user?.email);

  /* ── Persist draft to sessionStorage (debounced) ── */
  useEffect(() => {
    if (isSubmitted) {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      return;
    }
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(formData));
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(id);
  }, [formData, isSubmitted]);

  /* ── Sync auth user fields ONCE on mount / user change ── */
  useEffect(() => {
    if (!user || userSynced.current) return;
    userSynced.current = true;
    setFormData((prev) => ({
      ...prev,
      name: user.full_name || user.fullName || user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      country: prev.country || user.country || "",
      userImage: user.avatar || prev.userImage || "",
    }));
  }, [user]);

  /* ── Fetch booking data ── */
  const fetchBookingData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cRes, catRes, destRes] = await Promise.all([
        authFetch("/countries").catch(() => null),
        authFetch("/destinations/categories").catch(() => null),
        authFetch("/destinations").catch(() => null),
      ]);
      setCountriesList(normalizeResponseArray(cRes));
      setCategoriesList(normalizeResponseArray(catRes));
      setDestinationsList(normalizeResponseArray(destRes));
    } catch (err) {
      console.error("Failed to fetch booking data", err);
    } finally {
      setLoadingData(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  /* ── Static lists ── */
  const interests = useMemo(() => [
    { name: "Wildlife Safari", icon: "🦁" },
    { name: "Mountain Trekking", icon: "🏔️" },
    { name: "Gorilla Tracking", icon: "🦍" },
    { name: "Beach & Relaxation", icon: "🏖️" },
    { name: "Cultural Experiences", icon: "🎭" },
    { name: "Photography", icon: "📸" },
    { name: "Bird Watching", icon: "🦅" },
    { name: "Adventure Sports", icon: "🪂" },
  ], []);

  const accommodationTypes = useMemo(() => [
    { id: "budget", name: "Budget Friendly", description: "Comfortable lodges & camps", icon: "🏕️" },
    { id: "mid-range", name: "Mid-Range", description: "Quality lodges & tented camps", icon: "🏨" },
    { id: "luxury", name: "Luxury", description: "Premium lodges & camps", icon: "🏰" },
    { id: "ultra-luxury", name: "Ultra Luxury", description: "Exclusive private experiences", icon: "👑" },
  ], []);

  const groupTypes = useMemo(() => [
    { id: "solo", name: "Solo", full_name: "Solo Traveler", icon: "🧑" },
    { id: "couple", name: "Couple", full_name: "Couple", icon: "💑" },
    { id: "family", name: "Family", full_name: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "friends", name: "Friends", full_name: "Friends", icon: "👥" },
    { id: "business", name: "Business", full_name: "Business", icon: "💼" },
  ], []);

  /* ── Validation ── */
  const validationRules = useMemo(() => ({
    tripType: { required: true, message: "Please select a trip type" },
    destination: { required: true, message: "Please select a destination" },
    startDate: {
      required: true,
      message: "Please select a start date",
      validate: (v) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return new Date(v) < today ? "Start date cannot be in the past" : null;
      },
    },
    endDate: {
      required: true,
      message: "Please select an end date",
      validate: (v) =>
        formData.startDate && new Date(v) <= new Date(formData.startDate)
          ? "End date must be after start date"
          : null,
    },
    name: {
      required: true, message: "Full name is required", minLength: 3,
      pattern: /^[a-zA-Z\s'\-]+$/, patternMessage: "Letters only please",
    },
    email: {
      required: true, message: "Email is required",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "Enter a valid email",
    },
    phone: {
      required: true, message: "Phone number is required",
      pattern: /^[\d\s+\-()]{8,20}$/, patternMessage: "Enter a valid phone number",
    },
    country: { required: true, message: "Please enter your country" },
  }), [formData.startDate]);

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;
    if (rules.required && (!value || (typeof value === "string" && !value.trim()))) return rules.message;
    if (rules.minLength && value && value.length < rules.minLength) return `Minimum ${rules.minLength} characters`;
    if (rules.pattern && value && !rules.pattern.test(value)) return rules.patternMessage;
    if (rules.validate) return rules.validate(value);
    return null;
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => touched[name] ? { ...prev, [name]: validateField(name, value) } : prev);
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }, [validateField]);

  const handleInterestToggle = useCallback((interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  const validateStep = useCallback((step) => {
    const stepFields = {
      1: ["tripType", "destination", "startDate", "endDate"],
      2: [],
      3: [],
      4: ["name", "email", "phone", "country"],
    };
    const fields = stepFields[step] || [];
    const newErrors = {}, newTouched = {};
    let isValid = true;
    fields.forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) { newErrors[field] = error; isValid = false; }
    });
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  }, [formData, validateField]);

  /* ── Helpers ── */
  const getTripDuration = useCallback(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const diff = Math.ceil(
      (new Date(formData.endDate) - new Date(formData.startDate)) / 86400000
    );
    return diff > 0 ? `${diff} ${diff === 1 ? "day" : "days"}` : null;
  }, [formData.startDate, formData.endDate]);

  const getTotalVisitors = useCallback(
    () => (formData.adults || 0) + (formData.children || 0),
    [formData.adults, formData.children],
  );

  const getDestinationName = useCallback(() => {
    const key = String(formData.destination || "").trim();
    if (!key) return "Not selected";
    const dest = [...destinationsList, ...countriesList].find(
      (c) => [c.id, c._id, c.slug, c.countryId].map(String).includes(key)
    );
    return dest ? `${dest.flag || "📍"} ${dest.name}` : "Not selected";
  }, [formData.destination, destinationsList, countriesList]);

  /* ── Build WhatsApp message ── */
  const buildBookingMessage = useCallback(() => {
    const accommodationName = accommodationTypes.find((a) => a.id === formData.accommodation)?.name || "Not specified";
    const groupTypeName = groupTypes.find((g) => g.id === formData.groupType)?.full_name || "Not specified";
    const interestsList = formData.interests.length > 0 ? formData.interests.join(", ") : "None selected";

    return `🌍 *NEW BOOKING REQUEST — ALTUVERA TOURS*

Hello ${ADMIN_CONTACT.name}! 👋

📋 *TRAVELER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━
• *Name:* ${formData.name}
• *Email:* ${formData.email}
• *Phone:* ${formData.phone}
• *Country:* ${formData.country}

✈️ *TRIP DETAILS*
━━━━━━━━━━━━━━━━━━━━━━
• *Trip Type:* ${formData.tripType || "Not specified"}
• *Destination:* ${getDestinationName()}
• *Dates:* ${formatDate(formData.startDate)} → ${formatDate(formData.endDate)}
• *Duration:* ${getTripDuration() || "Not specified"}

👥 *GROUP INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━
• *Group Type:* ${groupTypeName}
• *Adults:* ${formData.adults}
• *Children:* ${formData.children}
• *Total:* ${getTotalVisitors()} travelers

⭐ *PREFERENCES*
━━━━━━━━━━━━━━━━━━━━━━
• *Accommodation:* ${accommodationName}
• *Interests:* ${interestsList}
• *Preferred Contact:* ${formData.preferredContactMethod || "Not specified"}
• *Best Time:* ${formData.preferredContactTime || "Not specified"}
• *Pickup:* ${formData.pickupLocation || "Not specified"}
• *Found Us Via:* ${formData.marketingSource || "Not specified"}

💬 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━━
${formData.specialRequests || "No special requests"}

📅 *Submitted:* ${new Date().toLocaleString()}`;
  }, [formData, getTripDuration, getTotalVisitors, getDestinationName, accommodationTypes, groupTypes]);

  const sendWhatsAppMessage = useCallback(() => {
    window.open(getWhatsAppLink(buildBookingMessage()), "_blank");
  }, [buildBookingMessage]);

  const saveBookingLocally = useCallback((booking) => {
    try {
      const existing = JSON.parse(localStorage.getItem("altuvera_bookings") || "[]");
      localStorage.setItem(
        "altuvera_bookings",
        JSON.stringify([booking, ...(Array.isArray(existing) ? existing : [])].slice(0, 50))
      );
    } catch { /* ignore */ }
  }, []);

  /* ── Submit ── */
  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      userId: user?.id || user?.userId || null,
      userName: user?.fullName || user?.name || formData.name,
      userEmail: user?.email || formData.email,
      userPhone: user?.phone || formData.phone,
      tripDuration: getTripDuration(),
      totalTravelers: getTotalVisitors(),
      destinationName: getDestinationName(),
      message: buildBookingMessage(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await sendMessage({ type: "booking", data: payload });
    } catch (err) {
      console.error("Booking submission error:", err);
    } finally {
      saveBookingLocally(payload);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => sendWhatsAppMessage(), 2500);
    }
  }, [
    validateStep, formData, user,
    getTripDuration, getTotalVisitors, getDestinationName,
    buildBookingMessage, sendWhatsAppMessage, saveBookingLocally,
  ]);

  /* ── Navigation ── */
  const nextStep = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, 4));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => Math.max(s - 1, 1));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  }, []);

  const handleStepClick = useCallback((stepNumber) => {
    if (stepNumber >= currentStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepNumber);
      setIsAnimating(false);
    }, 220);
  }, [currentStep]);

  return {
    currentStep, isAnimating, isSubmitting, isSubmitted, loadingData, isAuthenticated,
    formData, setFormData, displayName, user, openModal,
    countriesList, categoriesList, destinationsList, servicesData,
    groupTypes, accommodationTypes, interests,
    errors, touched, handleChange, handleBlur, handleInterestToggle,
    validateStep, getTripDuration, getTotalVisitors, getDestinationName,
    nextStep, prevStep, handleStepClick, handleSubmit,
    STEPS,
  };
};

export default useBookingWizard;