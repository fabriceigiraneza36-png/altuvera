// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const ADMIN_CONTACT = {
  name: "IGIRANEZA Fabrice",
  phone1: "+250 780 702 773",
  phone2: "+250 792 352 409",
  whatsapp: "+250792352409",
  whatsappDisplay: "+250 792 352 409",
  role: "Travel Consultant",
};

export const THEME = {
  primary: "#059669",
  primaryLight: "#10B981",
  primaryLighter: "#34D399",
  primaryDark: "#065F46",
  primaryDarker: "#064E3B",
  accent: "#047857",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  white: "#FFFFFF",
  background: "#F0FDF4",
  backgroundAlt: "#ECFDF5",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  text: "#1a1a1a",
  textLight: "#6B7280",
  shadow: "rgba(5, 150, 105, 0.15)",
  shadowDark: "rgba(5, 150, 105, 0.25)",
};

export const STEPS = [
  {
    number: 1,
    title: "Destination & Dates",
    shortTitle: "Trip",
    icon: "compass",
    description: "Choose where and when",
  },
  {
    number: 2,
    title: "Travelers & Stay",
    shortTitle: "Group",
    icon: "users",
    description: "Tell us about your group",
  },
  {
    number: 3,
    title: "Interests",
    shortTitle: "Activities",
    icon: "heart",
    description: "What excites you most",
  },
  {
    number: 4,
    title: "Contact Details",
    shortTitle: "Details",
    icon: "user",
    description: "How can we reach you",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getWhatsAppLink = (message) => {
  const phoneNumber = ADMIN_CONTACT.whatsapp.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const normalizeResponseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.results)) return value.results;
  }
  return [];
};

export const normalizeOptionId = (id) =>
  id === undefined || id === null ? "" : String(id);

export const normalizeOptionLabel = (label) => {
  if (label === undefined || label === null) return "";
  if (typeof label === "object") {
    if (Array.isArray(label)) return label.join(", ");
    return JSON.stringify(label);
  }
  return String(label);
};

export const normalizeOptionValue = (value) =>
  value === undefined || value === null ? "" : String(value);

// Icon helpers
export const getIconComponent = (iconName, size = 22) => {
  const iconMap = {
    compass: <Compass size={size} />,
    users: <Users size={size} />,
    heart: <Heart size={size} />,
    user: <User size={size} />,
  };
  return iconMap[iconName] || null;
};
