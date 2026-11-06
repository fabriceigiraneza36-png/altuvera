export const BRAND_SUPPORT_EMAIL = "info@altuverasafaris.com";
export const BRAND_SUPPORT_PHONE = "+250785751391";

export const DEFAULT_SEO_DESCRIPTION =
  "Explore gorilla trekking, wildlife safaris and cultural journeys across Rwanda and East Africa with Altuvera.";

export const getSiteUrl = () => {
  const envUrl =
    import.meta.env?.VITE_SITE_URL ||
    import.meta.env?.VITE_APP_URL ||
    "https://www.altuverasafaris.com";
  return String(envUrl).trim().replace(/\/+$/, "");
};

export const withBrand = (title) => {
  const raw = String(title || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Altuvera";
  return /\baltuvera\b/i.test(raw) ? raw : raw + " | Altuvera";
};

export const toAbsoluteUrl = (value = "/") => {
  const raw = String(value || "/").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const normalized = raw.startsWith("/") ? raw : "/" + raw;
  return getSiteUrl() + normalized;
};

export const BRAND_LOGO_PATH = "/altuvera.png";
export const BRAND_LOGO_ALT = "Altuvera official logo";
export const getBrandLogoUrl = () => toAbsoluteUrl(BRAND_LOGO_PATH);

export const toMetaDescription = (text = "", max = 160) => {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return DEFAULT_SEO_DESCRIPTION;
  if (value.length <= max) return value;
  const shortened = value.slice(0, Math.max(1, max - 1)).trimEnd();
  const boundary = shortened.lastIndexOf(" ");
  return (boundary > max * 0.65 ? shortened.slice(0, boundary) : shortened).trimEnd() + "…";
};


/**
 * Produces a route-aware description when a page has no usable editorial summary.
 * This prevents dynamic pages from inheriting the same site-wide fallback snippet.
 */
export const getRouteSeoDescription = (pathname = "", title = "") => {
  let path = String(pathname || "/").split(/[?#]/)[0];
  try { path = decodeURIComponent(path); } catch { /* keep the original path */ }
  path = path.replace(/\/+$/, "") || "/";
  const words = (value) =>
    String(value || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const segment = path.split("/").filter(Boolean).pop() || "";
  const subject = words(segment) || String(title || "East Africa");
  const match = path.match(/^\/(destinations|packages|post|country|adventures)\/([^/]+)(?:\/(destinations))?$/i);
  if (!match) return "";
  const section = match[1].toLowerCase();
  const name = words(match[2]) || subject;

  if (section === "destinations") {
    return `Discover ${name} in East Africa with Altuvera. Explore its landscapes, wildlife, highlights and practical travel information before planning your visit.`;
  }
  if (section === "packages") {
    return `Explore the ${name} safari package by Altuvera, including its destination, itinerary, wildlife experiences and useful trip-planning details.`;
  }
  if (section === "post") {
    return `Read Altuvera's ${name} travel guide for destination context, local insights and practical ideas to help plan your next East African journey.`;
  }
  if (section === "adventures") {
    return `Explore ${name.toLowerCase()} experiences with Altuvera, with ideas for wildlife encounters, cultural discovery and planning an East African journey.`;
  }
  if (section === "country" && match[3]) {
    return `Browse safari destinations, national parks and cultural experiences in ${name} with Altuvera, and find places to include in your journey.`;
  }
  if (section === "country") {
    return `Discover ${name} with Altuvera: explore national parks, wildlife, culture and places to visit, with practical ideas for planning a trip.`;
  }
  return "";
};
