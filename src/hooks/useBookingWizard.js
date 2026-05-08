import { useState, useEffect, useCallback, useMemo } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useServices } from "../hooks/useServices";
import { applyBookingPrefill } from "../utils/bookingPrefill";
import {
  STEPS,
  ADMIN_CONTACT,
  formatDate,
  getWhatsAppLink,
  normalizeResponseArray,
} from "../pages/Booking/BookingShared";

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

  const displayName = useMemo(
    () => user?.full_name || user?.name || user?.email?.split("@")[0] || "",
    [user],
  );
  const isAuthenticated = Boolean(user?.email);

  const BOOKING_DRAFT_KEY = "altuvera_booking_draft_v1";

  const [formData, setFormData] = useState(() => {
    const defaults = {
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
      name: user?.full_name || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      country: "",
      specialRequests: "",
    };

    try {
      const raw =
        sessionStorage.getItem(BOOKING_DRAFT_KEY) ||
        localStorage.getItem(BOOKING_DRAFT_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaults;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isSubmitted) {
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      localStorage.removeItem(BOOKING_DRAFT_KEY);
    }
  }, [BOOKING_DRAFT_KEY, isSubmitted]);

  useEffect(() => {
    if (isSubmitted) return;
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // ignore storage failures
      }
    }, 250);
    return () => clearTimeout(id);
  }, [BOOKING_DRAFT_KEY, formData, isSubmitted]);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      name: user.full_name || user.fullName || user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      country: prev.country || user.country || prev.country,
    }));
  }, [user]);

  const fetchBookingData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cRes, catRes, destRes] = await Promise.all([
        authFetch("/countries").catch(() => null),
        authFetch("/destinations/categories").catch(() => null),
        authFetch("/destinations").catch(() => null),
      ]);

      const countries = normalizeResponseArray(cRes);
      const categories = normalizeResponseArray(catRes);
      const destinations = normalizeResponseArray(destRes);

      setCountriesList(countries);
      setCategoriesList(categories);
      setDestinationsList(destinations);
    } catch (err) {
      console.error("Failed to fetch booking data", err);
    } finally {
      setLoadingData(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  useEffect(() => {
    applyBookingPrefill(formData, setFormData);
  }, [formData]);

  const interests = useMemo(
    () => [
      { name: "Wildlife Safari", icon: "🦁" },
      { name: "Mountain Trekking", icon: "🏔️" },
      { name: "Gorilla Tracking", icon: "🦍" },
      { name: "Beach & Relaxation", icon: "🏖️" },
      { name: "Cultural Experiences", icon: "🎭" },
      { name: "Photography", icon: "📸" },
      { name: "Bird Watching", icon: "🦅" },
      { name: "Adventure Sports", icon: "🪂" },
    ],
    [],
  );

  const accommodationTypes = useMemo(
    () => [
      { id: "budget", name: "Budget Friendly", description: "Comfortable lodges & camps", icon: "🏕️" },
      { id: "mid-range", name: "Mid-Range", description: "Quality lodges & tented camps", icon: "🏨" },
      { id: "luxury", name: "Luxury", description: "Premium lodges & camps", icon: "🏰" },
      { id: "ultra-luxury", name: "Ultra Luxury", description: "Exclusive private experiences", icon: "👑" },
    ],
    [],
  );

  const groupTypes = useMemo(
    () => [
      { id: "solo", name: "Solo", full_name: "Solo Traveler", icon: "🧑" },
      { id: "couple", name: "Couple", full_name: "Couple", icon: "💑" },
      { id: "family", name: "Family", full_name: "Family", icon: "👨‍👩‍👧‍👦" },
      { id: "friends", name: "Friends", full_name: "Friends", icon: "👥" },
      { id: "business", name: "Business", full_name: "Business", icon: "💼" },
    ],
    [],
  );

  const validationRules = useMemo(
    () => ({
      tripType: { required: true, message: "Please select a trip type" },
      destination: { required: true, message: "Please select a destination" },
      startDate: {
        required: true,
        message: "Please select a start date",
        validate: (value) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (new Date(value) < today) return "Start date cannot be in the past";
          return null;
        },
      },
      endDate: {
        required: true,
        message: "Please select an end date",
        validate: (value) => {
          if (formData.startDate && new Date(value) <= new Date(formData.startDate)) {
            return "End date must be after start date";
          }
          return null;
        },
      },
      name: {
        required: true,
        message: "Full name is required",
        minLength: 3,
        pattern: /^[a-zA-Z\s'-]+$/,
        patternMessage: "Please enter a valid name (letters only)",
      },
      email: {
        required: true,
        message: "Email is required",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: "Please enter a valid email address",
      },
      phone: {
        required: true,
        message: "Phone number is required",
        pattern: /^[\d\s+\-()]{8,20}$/,
        patternMessage: "Please enter a valid phone number",
      },
      country: { required: true, message: "Please enter your country" },
    }),
    [formData.startDate],
  );

  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) return null;

      if (rules.required && (!value || (typeof value === "string" && !value.trim()))) {
        return rules.message;
      }
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.patternMessage;
      }
      if (rules.validate) {
        return rules.validate(value);
      }
      return null;
    },
    [validationRules],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField],
  );

  const handleInterestToggle = useCallback((interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }, []);

  const validateStep = useCallback(
    (step) => {
      const stepFields = {
        1: ["tripType", "destination", "startDate", "endDate"],
        2: [],
        3: [],
        4: ["name", "email", "phone", "country"],
      };

      const fields = stepFields[step] || [];
      let isValid = true;
      const newErrors = {};
      const newTouched = {};

      fields.forEach((field) => {
        newTouched[field] = true;
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      setTouched((prev) => ({ ...prev, ...newTouched }));
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return isValid;
    },
    [formData, validateField],
  );

  const getTripDuration = useCallback(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} ${diff === 1 ? "day" : "days"}` : null;
    }
    return null;
  }, [formData.startDate, formData.endDate]);

  const getTotalVisitors = useCallback(
    () => formData.adults + formData.children,
    [formData.adults, formData.children],
  );

  const getDestinationName = useCallback(() => {
    const destinationKey = String(formData.destination || "").trim();
    const dest = destinationsList.find(
      (c) =>
        String(c.id || "").trim() === destinationKey ||
        String(c._id || "").trim() === destinationKey ||
        String(c.slug || "").trim() === destinationKey ||
        String(c.countryId || "").trim() === destinationKey,
    );
    if (dest) return `${dest.flag || "📍"} ${dest.name}`;
    const country = countriesList.find(
      (c) =>
        String(c.id || "").trim() === destinationKey ||
        String(c.slug || "").trim() === destinationKey ||
        String(c.countryId || "").trim() === destinationKey,
    );
    return country ? `${country.flag || "🏳️"} ${country.name}` : "Not selected";
  }, [formData.destination, destinationsList, countriesList]);

  const buildBookingMessage = useCallback(() => {
    const tripDuration = getTripDuration() || "Not specified";
    const totalVisitors = getTotalVisitors();
    const destinationName = getDestinationName();
    const accommodationType =
      accommodationTypes.find((a) => a.id === formData.accommodation)?.name ||
      "Not specified";
    const groupTypeName =
      groupTypes.find((g) => g.id === formData.groupType)?.full_name ||
      "Not specified";
    const interestsList =
      formData.interests.length > 0
        ? formData.interests.join(", ")
        : "None selected";

    return `🌍 *NEW BOOKING REQUEST - ALTUVERA TOURS*

Hello ${ADMIN_CONTACT.name}! 👋

You have received a new booking inquiry:

📋 *TRAVELER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━
• *Name:* ${formData.name}
• *Email:* ${formData.email}
• *Phone:* ${formData.phone}
• *Country:* ${formData.country}

✈️ *TRIP DETAILS*
━━━━━━━━━━━━━━━━━━━━━━
• *Trip Type:* ${formData.tripType || "Not specified"}
• *Destination:* ${destinationName}
• *Travel Dates:* ${formatDate(formData.startDate)} to ${formatDate(formData.endDate)}
• *Duration:* ${tripDuration}

👥 *GROUP INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━
• *Group Type:* ${groupTypeName}
• *Adults:* ${formData.adults}
• *Children:* ${formData.children}
• *Total Travelers:* ${totalVisitors}

⭐ *PREFERENCES*
━━━━━━━━━━━━━━━━━━━━━━
• *Accommodation Style:* ${accommodationType}
• *Interests:* ${interestsList}
• *Budget/Person:* ${formData.budgetPerPerson ? `${formData.currency} ${formData.budgetPerPerson}` : "Not specified"}
• *Preferred Contact:* ${formData.preferredContactMethod || "Not specified"}
• *Best Contact Time:* ${formData.preferredContactTime || "Not specified"}
• *Pickup Location:* ${formData.pickupLocation || "Not specified"}
• *Found Us Via:* ${formData.marketingSource || "Not specified"}

💬 *SPECIAL REQUESTS*
━━━━━━━━━━━━━━━━━━━━━━
${formData.specialRequests || "No special requests"}

━━━━━━━━━━━━━━━━━━━━━━
📅 *Submitted:* ${new Date().toLocaleString()}

Please provide a personalized quote and itinerary. Thank you!`;
  }, [
    formData,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,
    accommodationTypes,
    groupTypes,
  ]);

  const sendWhatsAppMessage = useCallback(() => {
    window.open(getWhatsAppLink(buildBookingMessage()), "_blank");
  }, [buildBookingMessage]);

  const saveBookingLocally = (booking) => {
    try {
      const raw = localStorage.getItem("altuvera_bookings");
      const existing = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(existing) ? existing : [];
      localStorage.setItem(
        "altuvera_bookings",
        JSON.stringify([booking, ...list].slice(0, 50)),
      );
    } catch {
      // ignore
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateStep(4)) return;

      setIsSubmitting(true);

      const bookingPayload = {
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
        const result = await sendMessage({
          type: "booking",
          data: bookingPayload,
        });

        saveBookingLocally(bookingPayload);

        if (result?.success) {
          // Show success animation before redirecting
          setIsSubmitted(true);
          // Delay WhatsApp redirect to allow confetti animation
          setTimeout(() => {
            sendWhatsAppMessage();
          }, 3000);
        } else {
          // Still show success even if backend fails, but redirect immediately
          setIsSubmitted(true);
          setTimeout(() => {
            sendWhatsAppMessage();
          }, 1500);
        }
      } catch (err) {
        console.error("Booking submission error:", err);
        saveBookingLocally(bookingPayload);
        // Show success animation even on error, then redirect
        setIsSubmitted(true);
        setTimeout(() => {
          sendWhatsAppMessage();
        }, 1500);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateStep,
      formData,
      getTripDuration,
      getTotalVisitors,
      getDestinationName,
      sendWhatsAppMessage,
    ],
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
        setIsAnimating(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 250);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      setIsAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 250);
  }, []);

  const handleStepClick = useCallback(
    (stepNumber) => {
      if (stepNumber < currentStep) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(stepNumber);
          setIsAnimating(false);
        }, 250);
      }
    },
    [currentStep],
  );

  return {
    // State
    currentStep,
    isAnimating,
    isSubmitting,
    isSubmitted,
    loadingData,
    isAuthenticated,

    // Data
    formData,
    setFormData,
    displayName,
    user,
    openModal,

    // Lists
    countriesList,
    categoriesList,
    destinationsList,
    servicesData,
    groupTypes,
    accommodationTypes,
    interests,

    // Helpers
    errors,
    touched,
    handleChange,
    handleBlur,
    handleInterestToggle,
    validateStep,
    getTripDuration,
    getTotalVisitors,
    getDestinationName,

    // Actions
    nextStep,
    prevStep,
    handleStepClick,
    handleSubmit,

    // Constants
    STEPS,
  };
};

export default useBookingWizard;
