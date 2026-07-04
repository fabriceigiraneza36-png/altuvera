// src/pages/Booking/BookingShared.js

/* ═══════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════ */
export const THEME = {
  colors: {
    primary: "#047857",
    primaryDark: "#065f46",
    primaryLight: "#10b981",
    primaryXLight: "#34d399",
    primaryGhost: "rgba(4,120,87,0.08)",
    primaryBorder: "#bbf7d0",

    surface: "#ffffff",
    surfaceAlt: "#f0fdf4",
    surfaceSoft: "#ecfdf5",

    text: "#0f172a",
    textMid: "#374151",
    textSoft: "#6b7280",
    textXSoft: "#9ca3af",

    border: "#e5e7eb",
    borderSoft: "#f3f4f6",

    error: "#ef4444",
    errorBg: "#fef2f2",
    errorBorder: "#fecaca",

    warning: "#f59e0b",
    warningBg: "#fffbeb",

    success: "#10b981",
    successBg: "#ecfdf5",

    gold: "#d97706",
    goldBg: "#fef3c7",
  },

  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'Playfair Display', Georgia, serif",
  },

  radii: {
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
    md: "0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)",
    lg: "0 12px 40px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06)",
    xl: "0 24px 64px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.06)",
    green: "0 8px 32px rgba(4,120,87,.20)",
    greenLg: "0 16px 48px rgba(4,120,87,.28)",
  },

  transitions: {
    fast: "all .15s ease",
    base: "all .25s cubic-bezier(.4,0,.2,1)",
    slow: "all .45s cubic-bezier(.16,1,.3,1)",
    spring: "all .6s cubic-bezier(.34,1.56,.64,1)",
  },

  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    toast: 500,
  },
};

/* ═══════════════════════════════════════════════════════
   UTILITY — normalizeOptionLabel
   Converts any option shape → { value, label, icon?, desc? }
═══════════════════════════════════════════════════════ */
export const normalizeOptionLabel = (option) => {
  if (!option) return { value: "", label: "" };

  // Already a plain string
  if (typeof option === "string") {
    return { value: option, label: option };
  }

  // Number / boolean primitive
  if (typeof option !== "object") {
    const s = String(option);
    return { value: s, label: s };
  }

  // Object shape — normalise common key variants
  const value =
    option.value ??
    option.id ??
    option.key ??
    option.code ??
    option.slug ??
    "";

  const label =
    option.label ??
    option.name ??
    option.title ??
    option.text ??
    option.display ??
    String(value);

  const icon = option.icon ?? option.emoji ?? option.symbol ?? undefined;
  const desc = option.desc ?? option.description ?? option.subtitle ?? undefined;

  return {
    value: String(value),
    label: String(label),
    ...(icon !== undefined && { icon }),
    ...(desc !== undefined && { desc }),
  };
};

/* ═══════════════════════════════════════════════════════
   STEPS
═══════════════════════════════════════════════════════ */
export const STEPS = [
  {
    id: 0,
    key: "trip",
    label: "Trip Details",
    icon: "🗺️",
    description: "Where & when",
  },
  {
    id: 1,
    key: "travelers",
    label: "Travelers",
    icon: "👥",
    description: "Who's coming",
  },
  {
    id: 2,
    key: "preferences",
    label: "Preferences",
    icon: "✨",
    description: "Your style",
  },
  {
    id: 3,
    key: "review",
    label: "Review",
    icon: "📋",
    description: "Check details",
  },
  {
    id: 4,
    key: "contact",
    label: "Contact",
    icon: "📬",
    description: "Your info",
  },
];

/* ═══════════════════════════════════════════════════════
   OPTION LISTS
═══════════════════════════════════════════════════════ */
export const GROUP_TYPES = [
  { value: "solo",      label: "Solo Adventure", icon: "🧳" },
  { value: "couple",    label: "Couple",          icon: "💑" },
  { value: "family",    label: "Family",          icon: "👨‍👩‍👧‍👦" },
  { value: "friends",   label: "Friends Group",   icon: "🎉" },
  { value: "corporate", label: "Corporate",       icon: "🏢" },
  { value: "honeymoon", label: "Honeymoon",       icon: "💍" },
];

export const ACCOMMODATION_TYPES = [
  { value: "budget",       label: "Budget",       icon: "🏕️", desc: "Camps & hostels"   },
  { value: "mid-range",    label: "Mid-Range",    icon: "🏨", desc: "Comfortable lodges" },
  { value: "luxury",       label: "Luxury",       icon: "🏰", desc: "5-star lodges"      },
  { value: "ultra-luxury", label: "Ultra Luxury", icon: "👑", desc: "Private reserves"   },
];

export const INTERESTS = [
  { value: "wildlife",        label: "Wildlife Safaris",      icon: "🦁" },
  { value: "hiking",          label: "Hiking & Trekking",     icon: "🥾" },
  { value: "culture",         label: "Cultural Experiences",  icon: "🎭" },
  { value: "photography",     label: "Photography",           icon: "📸" },
  { value: "birdwatching",    label: "Bird Watching",         icon: "🦅" },
  { value: "gorillas",        label: "Gorilla Trekking",      icon: "🦍" },
  { value: "beaches",         label: "Beach & Relaxation",    icon: "🏖️" },
  { value: "adventure",       label: "Adventure Sports",      icon: "⛰️" },
  { value: "food",            label: "Local Cuisine",         icon: "🍽️" },
  { value: "conservation",    label: "Conservation",          icon: "🌿" },
  { value: "hot-air-balloon", label: "Hot Air Balloon",       icon: "🎈" },
  { value: "nightlife",       label: "Nightlife & Music",     icon: "🎵" },
];

export const BUDGET_RANGES = [
  { value: "under-2000",  label: "Under $2,000",       icon: "💵"    },
  { value: "2000-5000",   label: "$2,000 – $5,000",    icon: "💵💵"  },
  { value: "5000-10000",  label: "$5,000 – $10,000",   icon: "💵💵💵"},
  { value: "over-10000",  label: "Over $10,000",        icon: "💎"    },
  { value: "flexible",    label: "Flexible",            icon: "🤝"    },
];

export const HEAR_ABOUT_US_OPTIONS = [
  { value: "google",       label: "Google Search",       icon: "🔍" },
  { value: "social",       label: "Social Media",        icon: "📱" },
  { value: "referral",     label: "Friend / Family",     icon: "👥" },
  { value: "travel-agent", label: "Travel Agent",        icon: "🧳" },
  { value: "magazine",     label: "Magazine / Blog",     icon: "📰" },
  { value: "repeat",       label: "Previous Guest",      icon: "⭐" },
  { value: "other",        label: "Other",               icon: "💬" },
];

export const DIETARY_OPTIONS = [
  { value: "none",         label: "No restrictions",  icon: "✅" },
  { value: "vegetarian",   label: "Vegetarian",       icon: "🥦" },
  { value: "vegan",        label: "Vegan",            icon: "🌱" },
  { value: "gluten-free",  label: "Gluten-Free",      icon: "🌾" },
  { value: "halal",        label: "Halal",            icon: "☪️"  },
  { value: "kosher",       label: "Kosher",           icon: "✡️"  },
  { value: "nut-allergy",  label: "Nut Allergy",      icon: "🥜" },
  { value: "other",        label: "Other",            icon: "💬" },
];

export const FLEXIBLE_MONTHS = [
  { value: "jan", label: "January"   },
  { value: "feb", label: "February"  },
  { value: "mar", label: "March"     },
  { value: "apr", label: "April"     },
  { value: "may", label: "May"       },
  { value: "jun", label: "June"      },
  { value: "jul", label: "July"      },
  { value: "aug", label: "August"    },
  { value: "sep", label: "September" },
  { value: "oct", label: "October"   },
  { value: "nov", label: "November"  },
  { value: "dec", label: "December"  },
];

/* ═══════════════════════════════════════════════════════
   INITIAL FORM STATE
═══════════════════════════════════════════════════════ */
export const INITIAL_FORM = {
  // Step 0 — Trip
  destinationId:  "",
  countryId:      "",
  categoryId:     "",
  serviceId:      "",
  startDate:      "",
  endDate:        "",
  isFlexible:     false,
  flexibleMonths: [],

  // Step 1 — Travelers
  adults:    2,
  children:  0,
  infants:   0,
  groupType: "couple",

  // Step 2 — Preferences
  accommodationType:    "mid-range",
  interests:            [],
  budgetRange:          "",
  dietaryRequirements:  "",
  specialRequests:      "",
  hasMedicalConditions: false,
  medicalDetails:       "",

  // Step 4 — Contact
  firstName:           "",
  lastName:            "",
  email:               "",
  phone:               "",
  whatsapp:            "",
  nationality:         "",
  country:             "",
  agreeToTerms:        false,
  subscribeNewsletter: false,
  source:              "website",
};

/* ═══════════════════════════════════════════════════════
   VALIDATION HELPERS
═══════════════════════════════════════════════════════ */

/**
 * Validate a single step — returns an object of { field: errorMessage }
 * Empty object means the step is valid.
 */
export const validateStep = (stepKey, form) => {
  const errors = {};

  switch (stepKey) {
    case "trip": {
      if (!form.destinationId && !form.countryId) {
        errors.destinationId = "Please select a destination or country.";
      }
      if (!form.isFlexible) {
        if (!form.startDate) errors.startDate = "Start date is required.";
        if (!form.endDate)   errors.endDate   = "End date is required.";
        if (form.startDate && form.endDate && form.startDate >= form.endDate) {
          errors.endDate = "End date must be after start date.";
        }
      } else if (!form.flexibleMonths.length) {
        errors.flexibleMonths = "Please select at least one preferred month.";
      }
      break;
    }

    case "travelers": {
      if (!form.adults || form.adults < 1) {
        errors.adults = "At least 1 adult is required.";
      }
      if (!form.groupType) {
        errors.groupType = "Please select a group type.";
      }
      break;
    }

    case "preferences": {
      if (!form.accommodationType) {
        errors.accommodationType = "Please choose an accommodation type.";
      }
      if (!form.budgetRange) {
        errors.budgetRange = "Please select a budget range.";
      }
      break;
    }

    case "review":
      // Read-only summary step — always valid
      break;

    case "contact": {
      if (!form.firstName.trim()) errors.firstName = "First name is required.";
      if (!form.lastName.trim())  errors.lastName  = "Last name is required.";
      if (!form.email.trim()) {
        errors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = "Please enter a valid email address.";
      }
      if (!form.phone.trim()) errors.phone = "Phone number is required.";
      if (!form.country.trim()) errors.country = "Country of residence is required.";
      if (!form.agreeToTerms) {
        errors.agreeToTerms = "You must agree to the terms and conditions.";
      }
      break;
    }

    default:
      break;
  }

  return errors;
};

/**
 * Validate all steps at once — returns { [stepKey]: { [field]: message } }
 */
export const validateAllSteps = (form) => {
  const allErrors = {};
  STEPS.forEach(({ key }) => {
    const errs = validateStep(key, form);
    if (Object.keys(errs).length) allErrors[key] = errs;
  });
  return allErrors;
};

/**
 * Check whether a specific step is complete / valid
 */
export const isStepComplete = (stepKey, form) =>
  Object.keys(validateStep(stepKey, form)).length === 0;

/* ═══════════════════════════════════════════════════════
   FORMATTING HELPERS
═══════════════════════════════════════════════════════ */

/** Format a date string (ISO) → "Jan 15, 2025" */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/** Calculate number of nights between two date strings */
export const calcNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const diff = new Date(endDate) - new Date(startDate);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

/** Summarise traveler counts → "2 Adults, 1 Child" */
export const formatTravelers = ({ adults = 0, children = 0, infants = 0 }) => {
  const parts = [];
  if (adults)   parts.push(`${adults} Adult${adults   !== 1 ? "s" : ""}`);
  if (children) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  if (infants)  parts.push(`${infants} Infant${infants  !== 1 ? "s" : ""}`);
  return parts.join(", ") || "No travelers";
};

/** Total traveler count */
export const totalTravelers = ({ adults = 0, children = 0, infants = 0 }) =>
  adults + children + infants;

/** Get the label for a value from any of the option arrays */
export const getOptionLabel = (options, value) => {
  if (!value) return "";
  const opt = options.find((o) => o.value === value);
  return opt ? opt.label : value;
};

/** Get icon for a value from any of the option arrays */
export const getOptionIcon = (options, value) => {
  if (!value) return "";
  const opt = options.find((o) => o.value === value);
  return opt?.icon ?? "";
};

/** Build a human-readable booking summary string */
export const buildSummaryText = (form) => {
  const lines = [];

  if (form.startDate && form.endDate) {
    const nights = calcNights(form.startDate, form.endDate);
    lines.push(
      `📅 ${formatDate(form.startDate)} → ${formatDate(form.endDate)} (${nights} night${nights !== 1 ? "s" : ""})`
    );
  } else if (form.isFlexible && form.flexibleMonths.length) {
    lines.push(`📅 Flexible: ${form.flexibleMonths.join(", ")}`);
  }

  lines.push(`👥 ${formatTravelers(form)}`);

  if (form.groupType) {
    lines.push(`🧳 ${getOptionLabel(GROUP_TYPES, form.groupType)}`);
  }

  if (form.accommodationType) {
    lines.push(`🏨 ${getOptionLabel(ACCOMMODATION_TYPES, form.accommodationType)}`);
  }

  if (form.budgetRange) {
    lines.push(`💰 ${getOptionLabel(BUDGET_RANGES, form.budgetRange)}`);
  }

  if (form.interests.length) {
    lines.push(`✨ ${form.interests.map((v) => getOptionLabel(INTERESTS, v)).join(", ")}`);
  }

  return lines.join("\n");
};