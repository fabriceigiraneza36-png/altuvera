// src/pages/Booking/BookingShared.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared constants, helpers, theme, validation and WhatsApp builder
// ✅ v4.0 — normalizeOptionLabel now returns STRING not object (bug fix)
// ─────────────────────────────────────────────────────────────────────────────

/* ═══════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════ */
export const THEME = {
  colors: {
    primary:       "#047857",
    primaryDark:   "#065f46",
    primaryLight:  "#10b981",
    primaryXLight: "#34d399",
    primaryGhost:  "rgba(4,120,87,0.08)",
    primaryBorder: "#bbf7d0",
    surface:       "#ffffff",
    surfaceAlt:    "#f0fdf4",
    surfaceSoft:   "#ecfdf5",
    text:          "#0f172a",
    textMid:       "#374151",
    textSoft:      "#6b7280",
    textXSoft:     "#9ca3af",
    border:        "#e5e7eb",
    borderSoft:    "#f3f4f6",
    error:         "#ef4444",
    errorBg:       "#fef2f2",
    errorBorder:   "#fecaca",
    warning:       "#f59e0b",
    warningBg:     "#fffbeb",
    success:       "#10b981",
    successBg:     "#ecfdf5",
    gold:          "#d97706",
    goldBg:        "#fef3c7",
  },
  fonts: {
    sans:  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'Playfair Display', Georgia, serif",
  },
  radii: {
    sm:   "4px",
    md:   "8px",
    lg:   "16px",
    xl:   "24px",
    full: "9999px",
  },
  shadows: {
    sm:      "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
    md:      "0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04)",
    lg:      "0 12px 40px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06)",
    xl:      "0 24px 64px rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.06)",
    green:   "0 8px 32px rgba(4,120,87,.20)",
    greenLg: "0 16px 48px rgba(4,120,87,.28)",
  },
  transitions: {
    fast:   "all .15s ease",
    base:   "all .25s cubic-bezier(.4,0,.2,1)",
    slow:   "all .45s cubic-bezier(.16,1,.3,1)",
    spring: "all .6s cubic-bezier(.34,1.56,.64,1)",
  },
  zIndex: {
    base:     1,
    dropdown: 100,
    sticky:   200,
    overlay:  300,
    modal:    400,
    toast:    500,
  },
};

/* ═══════════════════════════════════════════════════════
   ADMIN CONTACT
═══════════════════════════════════════════════════════ */
export const ADMIN_CONTACT = {
  name:  "Safari Expert",
  phone: "250785751391",
  wa:    "https://wa.me/250785751391",
};

/* ═══════════════════════════════════════════════════════
   ✅ FIXED — normalizeOptionLabel returns a STRING, not an object
   Previous version returned {value, label} causing React error #31
   when the result was rendered directly as a child.
═══════════════════════════════════════════════════════ */

/**
 * Extract the display LABEL string from any option shape.
 * Always returns a plain string — safe to render as React child.
 */
export const normalizeOptionLabel = (option) => {
  if (option === null || option === undefined) return "";
  if (typeof option === "string") return option;
  if (typeof option === "number" || typeof option === "boolean")
    return String(option);
  if (typeof option === "object") {
    const label =
      option.label ??
      option.name  ??
      option.title ??
      option.text  ??
      option.display ??
      option.value ??
      option.id    ??
      "";
    return String(label);
  }
  return String(option);
};

/**
 * Extract the VALUE string from any option shape.
 * Always returns a plain string — safe to store in formData.
 */
export const normalizeOptionValue = (option) => {
  if (option === null || option === undefined) return "";
  if (typeof option === "string") return option;
  if (typeof option === "number" || typeof option === "boolean")
    return String(option);
  if (typeof option === "object") {
    return String(
      option.value ??
      option.id    ??
      option._id   ??
      option.slug  ??
      option.key   ??
      option.code  ??
      "",
    );
  }
  return String(option);
};

/**
 * Extract a full normalized option descriptor object.
 * Only use this when you need ALL fields (value + label + icon + desc).
 * Do NOT render the return value directly as a React child.
 */
export const normalizeOptionDescriptor = (option) => {
  if (!option) return { value: "", label: "" };
  const value = normalizeOptionValue(option);
  const label = normalizeOptionLabel(option);
  const raw   = typeof option === "object" ? option : {};
  return {
    value,
    label,
    ...(raw.icon  !== undefined && { icon:  raw.icon  }),
    ...(raw.emoji !== undefined && { emoji: raw.emoji }),
    ...(raw.desc  !== undefined && { desc:  raw.desc  }),
    ...(raw.description !== undefined && { desc: raw.description }),
  };
};

/* ═══════════════════════════════════════════════════════
   STEPS  (4-step flow)
═══════════════════════════════════════════════════════ */
export const STEPS = [
  { id: 0, key: "trip",      label: "Trip Details", icon: "🗺️",  description: "Where & when"   },
  { id: 1, key: "travelers", label: "Travellers",   icon: "👥",  description: "Who's coming"   },
  { id: 2, key: "contact",   label: "Contact",      icon: "📬",  description: "Your info"      },
  { id: 3, key: "review",    label: "Review",       icon: "📋",  description: "Check & submit" },
];

/* ═══════════════════════════════════════════════════════
   MONTHS
═══════════════════════════════════════════════════════ */
export const MONTHS = [
  { s: "Jan", v: "january"   }, { s: "Feb", v: "february"  },
  { s: "Mar", v: "march"     }, { s: "Apr", v: "april"     },
  { s: "May", v: "may"       }, { s: "Jun", v: "june"      },
  { s: "Jul", v: "july"      }, { s: "Aug", v: "august"    },
  { s: "Sep", v: "september" }, { s: "Oct", v: "october"   },
  { s: "Nov", v: "november"  }, { s: "Dec", v: "december"  },
];

export const FLEXIBLE_MONTHS = [
  { value: "jan", label: "January"   }, { value: "feb", label: "February"  },
  { value: "mar", label: "March"     }, { value: "apr", label: "April"     },
  { value: "may", label: "May"       }, { value: "jun", label: "June"      },
  { value: "jul", label: "July"      }, { value: "aug", label: "August"    },
  { value: "sep", label: "September" }, { value: "oct", label: "October"   },
  { value: "nov", label: "November"  }, { value: "dec", label: "December"  },
];

/* ═══════════════════════════════════════════════════════
   OPTION LISTS — all icon fields are plain emoji strings
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
  { value: "budget",       label: "Budget",       icon: "🏕️", desc: "Camps & hostels"    },
  { value: "mid-range",    label: "Mid-Range",    icon: "🏨", desc: "Comfortable lodges" },
  { value: "luxury",       label: "Luxury",       icon: "🏰", desc: "5-star lodges"      },
  { value: "ultra-luxury", label: "Ultra Luxury", icon: "👑", desc: "Private reserves"   },
];

export const INTERESTS = [
  { value: "wildlife",        label: "Wildlife Safaris",     icon: "🦁" },
  { value: "hiking",          label: "Hiking & Trekking",    icon: "🥾" },
  { value: "culture",         label: "Cultural Experiences", icon: "🎭" },
  { value: "photography",     label: "Photography",          icon: "📸" },
  { value: "birdwatching",    label: "Bird Watching",        icon: "🦅" },
  { value: "gorillas",        label: "Gorilla Trekking",     icon: "🦍" },
  { value: "beaches",         label: "Beach & Relaxation",   icon: "🏖️" },
  { value: "adventure",       label: "Adventure Sports",     icon: "⛰️" },
  { value: "food",            label: "Local Cuisine",        icon: "🍽️" },
  { value: "conservation",    label: "Conservation",         icon: "🌿" },
  { value: "hot-air-balloon", label: "Hot Air Balloon",      icon: "🎈" },
  { value: "nightlife",       label: "Nightlife & Music",    icon: "🎵" },
];

export const BUDGET_OPTIONS = [
  { value: "under-2000",  label: "Under $2,000",     icon: "💵"     },
  { value: "2000-5000",   label: "$2,000 – $5,000",  icon: "💵💵"   },
  { value: "5000-10000",  label: "$5,000 – $10,000", icon: "💵💵💵" },
  { value: "over-10000",  label: "Over $10,000",     icon: "💎"     },
  { value: "flexible",    label: "Flexible",         icon: "🤝"     },
];

/** @deprecated use BUDGET_OPTIONS */
export const BUDGET_RANGES = BUDGET_OPTIONS;

export const BUDGET_LABELS = Object.fromEntries(
  BUDGET_OPTIONS.map((b) => [b.value, b.label]),
);

export const HEAR_ABOUT_US_OPTIONS = [
  { value: "google",       label: "Google Search",   icon: "🔍" },
  { value: "social",       label: "Social Media",    icon: "📱" },
  { value: "referral",     label: "Friend / Family", icon: "👥" },
  { value: "travel-agent", label: "Travel Agent",    icon: "🧳" },
  { value: "magazine",     label: "Magazine / Blog", icon: "📰" },
  { value: "repeat",       label: "Previous Guest",  icon: "⭐" },
  { value: "other",        label: "Other",           icon: "💬" },
];

export const DIETARY_OPTIONS = [
  { value: "none",        label: "No restrictions", icon: "✅" },
  { value: "vegetarian",  label: "Vegetarian",      icon: "🥦" },
  { value: "vegan",       label: "Vegan",           icon: "🌱" },
  { value: "gluten-free", label: "Gluten-Free",     icon: "🌾" },
  { value: "halal",       label: "Halal",           icon: "☪️"  },
  { value: "kosher",      label: "Kosher",          icon: "✡️"  },
  { value: "nut-allergy", label: "Nut Allergy",     icon: "🥜" },
  { value: "other",       label: "Other",           icon: "💬" },
];

/* ═══════════════════════════════════════════════════════
   DEFAULT / INITIAL FORM STATE
═══════════════════════════════════════════════════════ */
export const DEFAULT_FORM = {
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
  adults:            2,
  children:          0,
  infants:           0,
  groupType:         "",
  accommodationType: "",
  budgetRange:       "",

  // Preferences
  interests:            [],
  dietaryRequirements:  "",
  specialRequests:      "",
  hasMedicalConditions: false,
  medicalDetails:       "",

  // Step 2 — Contact
  firstName:              "",
  lastName:               "",
  email:                  "",
  phone:                  "",
  whatsapp:               "",
  nationality:            "",
  country:                "",
  preferredContactMethod: "whatsapp",
  preferredContactTime:   "",
  pickupLocation:         "",
  marketingSource:        "",
  newsletterOptIn:        false,
  agreeToTerms:           false,
  subscribeNewsletter:    false,
  hearAboutUs:            "",
  source:                 "website",
};

/** @alias DEFAULT_FORM */
export const INITIAL_FORM = DEFAULT_FORM;

/* ═══════════════════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════════════════ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateStep = (stepOrKey, form) => {
  const key =
    typeof stepOrKey === "number"
      ? (STEPS[stepOrKey]?.key ?? String(stepOrKey))
      : stepOrKey;

  const errors = {};

  switch (key) {
    case "trip":
    case "0": {
      if (!form.destinationId && !form.countryId)
        errors.countryId = "Please select a destination or country.";
      if (!form.isFlexible) {
        if (!form.startDate) errors.startDate = "Departure date is required.";
        if (form.startDate && form.endDate && form.startDate >= form.endDate)
          errors.endDate = "Return date must be after departure.";
      } else if (!(form.flexibleMonths || []).length) {
        errors.flexibleMonths = "Please select at least one preferred month.";
      }
      break;
    }
    case "travelers":
    case "1": {
      if (!form.adults || parseInt(form.adults, 10) < 1)
        errors.adults = "At least 1 adult is required.";
      if (!form.groupType)
        errors.groupType = "Please select a group type.";
      break;
    }
    case "contact":
    case "2": {
      if (!form.firstName?.trim()) errors.firstName = "First name is required.";
      if (!form.lastName?.trim())  errors.lastName  = "Last name is required.";
      if (!form.email?.trim()) {
        errors.email = "Email is required.";
      } else if (!EMAIL_RE.test(form.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
      if (!form.agreeToTerms)
        errors.agreeToTerms = "You must agree to the terms.";
      break;
    }
    case "review":
    case "3":
      break;
    default:
      break;
  }

  return errors;
};

export const validateAllSteps = (form) => {
  const allErrors = {};
  STEPS.forEach(({ key }) => {
    const errs = validateStep(key, form);
    if (Object.keys(errs).length) allErrors[key] = errs;
  });
  return allErrors;
};

export const isStepComplete = (stepOrKey, form) =>
  Object.keys(validateStep(stepOrKey, form)).length === 0;

/* ═══════════════════════════════════════════════════════
   FORMATTING HELPERS
═══════════════════════════════════════════════════════ */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return dateStr; }
};

export const formatDateFull = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateStr; }
};

export const calcNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return Math.max(
    0,
    Math.round((new Date(endDate) - new Date(startDate)) / 86_400_000),
  );
};

export const formatTravelers = ({ adults = 0, children = 0, infants = 0 }) => {
  const parts = [];
  if (adults)   parts.push(`${adults} Adult${adults   !== 1 ? "s" : ""}`);
  if (children) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  if (infants)  parts.push(`${infants} Infant${infants  !== 1 ? "s" : ""}`);
  return parts.join(", ") || "No travelers";
};

export const totalTravelers = ({ adults = 0, children = 0, infants = 0 }) =>
  (parseInt(adults,   10) || 0) +
  (parseInt(children, 10) || 0) +
  (parseInt(infants,  10) || 0);

export const getOptionLabel = (options, value) => {
  if (!value || !Array.isArray(options)) return "";
  return options.find((o) => o.value === value)?.label ?? String(value);
};

export const getOptionIcon = (options, value) => {
  if (!value || !Array.isArray(options)) return "";
  const icon = options.find((o) => o.value === value)?.icon;
  // ✅ Always return a string — never an object
  return typeof icon === "string" ? icon : "";
};

export const buildSummaryText = (form) => {
  const lines = [];
  if (form.startDate && form.endDate) {
    const nights = calcNights(form.startDate, form.endDate);
    lines.push(
      `📅 ${formatDate(form.startDate)} → ${formatDate(form.endDate)} ` +
      `(${nights} night${nights !== 1 ? "s" : ""})`,
    );
  } else if (form.isFlexible && form.flexibleMonths?.length) {
    lines.push(`📅 Flexible: ${form.flexibleMonths.join(", ")}`);
  }
  lines.push(`👥 ${formatTravelers(form)}`);
  if (form.groupType)
    lines.push(`🧳 ${getOptionLabel(GROUP_TYPES, form.groupType)}`);
  if (form.accommodationType)
    lines.push(`🏨 ${getOptionLabel(ACCOMMODATION_TYPES, form.accommodationType)}`);
  if (form.budgetRange)
    lines.push(`💰 ${getOptionLabel(BUDGET_OPTIONS, form.budgetRange)}`);
  if (form.interests?.length)
    lines.push(`✨ ${form.interests.map((v) => getOptionLabel(INTERESTS, v)).join(", ")}`);
  return lines.join("\n");
};

/* ═══════════════════════════════════════════════════════
   WHATSAPP MESSAGE BUILDER
═══════════════════════════════════════════════════════ */
export const buildWhatsAppMessage = ({
  formData,
  destinationsList   = [],
  countriesList      = [],
  groupTypes         = [],
  accommodationTypes = [],
}) => {
  const dest    = destinationsList.find((d) => d.value === formData.destinationId);
  const country = countriesList.find((c)    => c.value === formData.countryId);

  // Merge static + dynamic, dedupe by value
  const allGroups = [...groupTypes, ...GROUP_TYPES];
  const allAccoms = [...accommodationTypes, ...ACCOMMODATION_TYPES];
  const group = allGroups.find(
    (g) => (g.value || g.id) === formData.groupType,
  );
  const accom = allAccoms.find(
    (a) => (a.value || a.id) === (formData.accommodationType || formData.accommodation),
  );

  // ✅ Safe icon extraction — always strings
  const groupIcon = typeof group?.icon === "string" ? group.icon : "";
  const accomIcon = typeof accom?.icon === "string" ? accom.icon : "";
  const groupName = group?.label || group?.name || "";
  const accomName = accom?.label || accom?.name || "";

  let dateInfo = "";
  if (formData.isFlexible && formData.flexibleMonths?.length) {
    dateInfo = `Flexible — ${formData.flexibleMonths
      .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
      .join(", ")}`;
  } else if (formData.startDate) {
    const nights = calcNights(formData.startDate, formData.endDate);
    dateInfo = formData.endDate
      ? `${formatDate(formData.startDate)} → ${formatDate(formData.endDate)}${
          nights ? ` (${nights} night${nights !== 1 ? "s" : ""})` : ""
        }`
      : formatDate(formData.startDate);
  }

  const adults   = parseInt(formData.adults,   10) || 0;
  const children = parseInt(formData.children, 10) || 0;
  const infants  = parseInt(formData.infants,  10) || 0;
  const total    = adults + children + infants;

  const budgetLabel = formData.budgetRange
    ? (BUDGET_LABELS[formData.budgetRange] || formData.budgetRange)
    : null;

  const interestLabels = (formData.interests || [])
    .map((v) => getOptionLabel(INTERESTS, v) || v)
    .join(", ");

  // ✅ Safe country name — never render an object
  const destCountryName = (() => {
    const c = dest?.country;
    if (!c) return "";
    if (typeof c === "string") return c;
    if (typeof c === "object") return c?.name ?? c?.label ?? "";
    return "";
  })();

  const lines = [
    "🌍 *NEW BOOKING REQUEST*",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "👤 *CONTACT INFORMATION*",
    `Name:     ${[formData.firstName, formData.lastName].filter(Boolean).join(" ") || "—"}`,
    `Email:    ${formData.email   || "—"}`,
    `Phone:    ${formData.phone   || "—"}`,
    `Country:  ${formData.country || "—"}`,
    formData.whatsapp && formData.whatsapp !== formData.phone
      ? `WhatsApp: ${formData.whatsapp}` : null,
    "",
    "✈️ *TRIP DETAILS*",
    `Destination: ${dest?.label || country?.label || "Not specified"}`,
    destCountryName ? `Country:     ${destCountryName}` : null,
    dateInfo ? `Dates:       ${dateInfo}` : null,
    formData.categoryId ? `Category:    ${formData.categoryId}` : null,
    "",
    "👥 *TRAVELLERS*",
    `Total:       ${total} (${formatTravelers({ adults, children, infants })})`,
    groupName ? `Group Type:  ${groupIcon ? groupIcon + " " : ""}${groupName}` : null,
    accomName ? `Accom.:      ${accomIcon ? accomIcon + " " : ""}${accomName}` : null,
    budgetLabel ? `Budget:      ${budgetLabel}` : null,
    "",
    interestLabels ? `✨ *INTERESTS*\n${interestLabels}` : null,
    formData.preferredContactMethod
      ? `📞 *PREFERRED CONTACT*\n${formData.preferredContactMethod}${
          formData.preferredContactTime
            ? ` — best time: ${formData.preferredContactTime}` : ""
        }` : null,
    formData.pickupLocation
      ? `📍 *PICKUP LOCATION*\n${formData.pickupLocation}` : null,
    formData.marketingSource
      ? `🔍 *HOW THEY FOUND US*\n${
          getOptionLabel(HEAR_ABOUT_US_OPTIONS, formData.marketingSource) ||
          formData.marketingSource
        }` : null,
    formData.dietaryRequirements
      ? `🍽️ *DIETARY*\n${formData.dietaryRequirements}` : null,
    formData.specialRequests
      ? `💬 *SPECIAL REQUESTS*\n${formData.specialRequests}` : null,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    `📅 Submitted: ${new Date().toLocaleString("en-US", {
      dateStyle: "medium", timeStyle: "short",
    })}`,
    `🌐 Source: ${formData.source || "website"}`,
  ].filter((l) => l !== null);

  return lines.join("\n");
};

export const sendWhatsApp = (formData, lists = {}) => {
  const message = buildWhatsAppMessage({ formData, ...lists });
  const url     = `https://wa.me/${ADMIN_CONTACT.phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
};