// src/utils/routeUtils.js

import { destinations } from "../data/destinations";

// ============================================
// BRAND CONSTANTS
// ============================================

export const BRAND_NAME = "Altuvera Safaris";
export const BRAND_TAGLINE = "Your Gateway to African Adventures";
export const BRAND_LOGO_ALT =
  "Altuvera Safaris - Premium African Safari Experiences";
export const BRAND_DESCRIPTION =
  "Experience the magic of Africa with Altuvera Safaris. We offer premium safari experiences across Rwanda, Tanzania, Uganda, Rwanda, and beyond.";

export const BRAND_COLORS = {
  primary: "#064e3b",
  primaryLight: "#065f46",
  primaryDark: "#022c22",
  secondary: "#047857",
  accent: "#10b981",
  accentLight: "#34d399",
  white: "#ffffff",
  black: "#0f172a",
  gray: "#64748b",
  grayLight: "#f1f5f9",
};

export const BRAND_CONTACT = {
  phone: "+250 792352409",
  phoneAlt: "+250 792352409",
  email: "altuverasafari@gmail.com",
  emailBookings: "fabriceigiraneza36@gmail.com",
  address: "Musanze, Rwanda",
  whatsapp: "https://wa.me/250792352409",
};

export const BRAND_SOCIAL = {
  facebook: "https://facebook.com/altuverasafaris",
  instagram: "https://instagram.com/altuverasafaris",
  twitter: "https://twitter.com/altuverasafaris",
  youtube: "https://youtube.com/@altuverasafaris",
  tiktok: "https://tiktok.com/@altuverasafaris",
  linkedin: "https://linkedin.com/company/altuverasafaris",
};

export const BRAND_META = {
  siteName: "Altuvera Safaris",
  siteUrl: "https://altuvera.com",
  defaultImage: "/images/og-default.jpg",
  twitterHandle: "@altuverasafaris",
  locale: "en_US",
};

// ============================================
// TEXT CLEANING & FORMATTING UTILITIES
// ============================================

/**
 * Clean - General purpose text cleaning function
 * Removes extra whitespace, trims, and normalizes text
 */
export const clean = (text) => {
  if (!text) return "";
  if (typeof text !== "string") text = String(text);

  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Normalize multiple line breaks to max 2
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Convert text into a short list of sentences/phrases
 */
export const toS = (text = "", max = 3) => {
  const s = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return [];

  const parts = s
    .split(/\n+|[\.\?!]\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.slice(0, max);
};

/**
 * Clean text and remove HTML tags
 */
export const cleanHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return clean(tmp.textContent || tmp.innerText || "");
};

/**
 * Clean and truncate text
 */
export const cleanTruncate = (text, maxLength = 150, suffix = "...") => {
  if (!text) return "";
  const cleaned = clean(text);
  if (cleaned.length <= maxLength) return cleaned;

  // Try to break at word boundary
  const truncated = cleaned.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }

  return truncated.trim() + suffix;
};

/**
 * Clean phone number - remove all non-digit characters except +
 */
export const cleanPhone = (phone) => {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "");
};

/**
 * Clean email address
 */
export const cleanEmail = (email) => {
  if (!email) return "";
  return email.trim().toLowerCase();
};

/**
 * Clean array - remove empty, null, undefined values
 */
export const cleanArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => item != null && item !== "");
};

/**
 * Clean object - remove null, undefined, empty string values
 */
export const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return {};

  const cleaned = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value != null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

// ============================================
// URL CORRECTIONS - Common typos and their fixes
// ============================================

const URL_CORRECTIONS = {
  // Home page variations
  "/home": "/",
  "/index": "/",
  "/index.html": "/",

  // Destination typos
  "/destinations": "/destinations",
  "/destionation": "/destinations",
  "/destinaion": "/destinations",
  "/destinatios": "/destinations",
  "/destinaton": "/destinations",
  "/destinattions": "/destinations",
  "/destination": "/destinations",

  // ... rest of your URL_CORRECTIONS
  "/countries": "/destinations",
};

// ============================================
// COUNTRY ALIASES
// ============================================

const COUNTRY_ALIASES = {
  "/Rwanda": "/country/Rwanda",
  "/tanzania": "/country/tanzania",
  "/uganda": "/country/uganda",
  "/rwanda": "/country/rwanda",
  // ... rest of your COUNTRY_ALIASES
};

// ============================================
// LEVENSHTEIN DISTANCE
// ============================================

const levenshteinDistance = (a, b) => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// ============================================
// FIND CLOSEST ROUTE
// ============================================

const findClosestRoute = (pathname, routes) => {
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, "");
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const route of routes) {
    const normalizedRoute = route.toLowerCase().replace(/\/$/, "");
    const distance = levenshteinDistance(normalizedPath, normalizedRoute);

    const startsWithDistance = normalizedPath.startsWith(normalizedRoute)
      ? Math.max(0, normalizedPath.length - normalizedRoute.length) * 0.1
      : Infinity;

    const finalDistance = Math.min(distance, startsWithDistance);

    if (finalDistance < bestDistance) {
      bestDistance = finalDistance;
      bestMatch = route;
    }
  }

  const threshold = Math.max(3, normalizedPath.length * 0.4);
  return bestDistance <= threshold ? bestMatch : null;
};

// ============================================
// MAIN REDIRECT FUNCTION
// ============================================

export const getRedirectUrl = (pathname) => {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "");

  if (URL_CORRECTIONS[normalizedPath]) {
    return URL_CORRECTIONS[normalizedPath];
  }

  if (COUNTRY_ALIASES[normalizedPath]) {
    return COUNTRY_ALIASES[normalizedPath];
  }

  const destinationList = Array.isArray(destinations)
    ? destinations
    : Object.values(destinations || {}).flat();

  const destinationMatch = Array.isArray(destinationList)
    ? destinationList.find((d) => {
        const slug = d?.slug || d?.id;
        if (!slug) return false;
        return (
          `/${slug}` === normalizedPath ||
          `/destination/${slug}` === normalizedPath
        );
      })
    : null;
  if (destinationMatch) {
    const slug = destinationMatch.slug || destinationMatch.id;
    return slug ? `/destination/${slug}` : null;
  }

  const knownRoutes = [
    "/",
    "/destinations",
    "/explore",
    "/services",
    "/about",
    "/contact",
    "/booking",
    "/gallery",
    "/tips",
    "/posts",
    "/interactive-map",
    "/virtual-tour",
    "/team",
    "/faq",
    "/privacy",
    "/terms",
    "/payment-terms",
    "/profile",
    "/my-bookings",
    "/wishlist",
    "/settings",
    "/country/Rwanda",
    "/country/tanzania",
    "/country/uganda",
    "/country/rwanda",
  ];

  const closestRoute = findClosestRoute(normalizedPath, knownRoutes);
  if (closestRoute && closestRoute !== normalizedPath) {
    return closestRoute;
  }

  return null;
};

export const needsRedirect = (pathname) => {
  return getRedirectUrl(pathname) !== null;
};

export const getAllKnownRoutes = () => [
  "/",
  "/destinations",
  "/explore",
  "/services",
  "/about",
  "/contact",
  "/booking",
  "/gallery",
  "/tips",
  "/posts",
  "/interactive-map",
  "/virtual-tour",
  "/team",
  "/faq",
  "/privacy",
  "/terms",
  "/payment-terms",
  "/profile",
  "/my-bookings",
  "/wishlist",
  "/settings",
];

export const getAllCountryRoutes = () => [
  "/country/Rwanda",
  "/country/tanzania",
  "/country/uganda",
  "/country/rwanda",
  "/country/ethiopia",
  "/country/djibouti",
  "/country/botswana",
  "/country/namibia",
  "/country/south-africa",
  "/country/zambia",
  "/country/zimbabwe",
];

// ============================================
// ROUTE PRELOADING
// ============================================

export const preloadRoute = (pathname) => {
  const runLoader = (loader) => {
    if (typeof loader !== "function") return null;
    if (typeof loader.preload === "function") return loader.preload();
    return loader();
  };

  const routeToComponent = {
    "/": () => import("../pages/Home"),
    "/destinations": () => import("../pages/Destinations"),
    "/explore": () => import("../pages/Explore"),
    "/services": () => import("../pages/Services"),
    "/about": () => import("../pages/About"),
    "/contact": () => import("../pages/Contact"),
    "/booking": () => import("../pages/Booking"),
    "/gallery": () => import("../pages/Gallery"),
    "/tips": () => import("../pages/Tips"),
    "/posts": () => import("../pages/Posts"),
    "/interactive-map": () => import("../pages/InteractiveMap"),
    "/virtual-tour": () => import("../pages/VirtualTour"),
    "/team": () => import("../pages/Team"),
    "/faq": () => import("../pages/FAQ"),
    "/privacy": () => import("../pages/PrivacyPolicy"),
    "/terms": () => import("../pages/TermsOfService"),
    "/payment-terms": () => import("../pages/PaymentTerms"),
    "/profile": () => import("../pages/auth/UserProfile"),
    "/my-bookings": () => import("../pages/auth/MyBookings"),
    "/wishlist": () => import("../pages/auth/Wishlist"),
    "/settings": () => import("../pages/auth/UserSettings"),
  };

  const normalizedPath = pathname.toLowerCase().replace(/\/$/, "");

  if (normalizedPath.startsWith("/country/")) {
    const loader = routeToComponent["/destinations"];
    if (loader) runLoader(loader);
    return;
  }

  if (normalizedPath.startsWith("/destination/")) {
    const loader = routeToComponent["/destinations"];
    if (loader) runLoader(loader);
    return;
  }

  if (normalizedPath.startsWith("/post/")) {
    const loader = routeToComponent["/posts"];
    if (loader) runLoader(loader);
    return;
  }

  const loader = routeToComponent[normalizedPath];
  if (loader) runLoader(loader);
};

// ============================================
// SEO & META HELPERS
// ============================================

export const generatePageTitle = (pageTitle) => {
  if (!pageTitle) return BRAND_NAME;
  return `${pageTitle} | ${BRAND_NAME}`;
};

export const generateMetaDescription = (description, maxLength = 160) => {
  if (!description) return BRAND_DESCRIPTION;
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + "...";
};

export const generateCanonicalUrl = (path) => {
  const baseUrl = BRAND_META.siteUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const generateOgImage = (imagePath) => {
  if (!imagePath) return `${BRAND_META.siteUrl}${BRAND_META.defaultImage}`;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BRAND_META.siteUrl}${imagePath}`;
};

export const generateBreadcrumbs = (pathname) => {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Home", path: "/" }];

  let currentPath = "";

  const labelMap = {
    country: "Countries",
    destination: "Destinations",
    destinations: "Destinations",
    post: "Blog",
    posts: "Blog",
    tips: "Travel Tips",
    services: "Services",
    about: "About Us",
    contact: "Contact",
    booking: "Book Now",
    gallery: "Gallery",
    team: "Our Team",
    faq: "FAQ",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    "payment-terms": "Payment Terms",
    "interactive-map": "Interactive Map",
    "virtual-tour": "Virtual Tour",
    explore: "Explore",
    profile: "My Profile",
    "my-bookings": "My Bookings",
    wishlist: "Wishlist",
    settings: "Settings",
  };

  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;

    let label =
      labelMap[segment] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    breadcrumbs.push({
      label,
      path: currentPath,
      isLast: index === paths.length - 1,
    });
  });

  return breadcrumbs;
};

// ============================================
// URL UTILITIES
// ============================================

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const unslugify = (slug) => {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const isExternalUrl = (url) => {
  if (!url) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
};

export const getQueryParams = (search) => {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Brand constants
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_LOGO_ALT,
  BRAND_DESCRIPTION,
  BRAND_COLORS,
  BRAND_CONTACT,
  BRAND_SOCIAL,
  BRAND_META,

  // Route functions
  getRedirectUrl,
  needsRedirect,
  getAllKnownRoutes,
  getAllCountryRoutes,
  preloadRoute,

  // SEO helpers
  generatePageTitle,
  generateMetaDescription,
  generateCanonicalUrl,
  generateOgImage,
  generateBreadcrumbs,

  // URL utilities
  slugify,
  unslugify,
  isExternalUrl,
  getQueryParams,
  buildQueryString,

  // Cleaning utilities
  clean,
  toS,
  cleanHtml,
  cleanTruncate,
  cleanPhone,
  cleanEmail,
  cleanArray,
  cleanObject,
};
