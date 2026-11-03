export const BRAND_SUPPORT_EMAIL = "info@altuverasafaris.com";
export const BRAND_SUPPORT_PHONE = "+250785751391";

export const DEFAULT_SEO_DESCRIPTION =
  "Explore gorilla trekking, wildlife safaris and cultural journeys across Rwanda and East Africa with Altuvera Safaris.";

export const getSiteUrl = () => {
  const envUrl =
    import.meta.env?.VITE_SITE_URL ||
    import.meta.env?.VITE_APP_URL ||
    "https://www.altuverasafaris.com";
  return String(envUrl).trim().replace(/\/+$/, "");
};

export const withBrand = (title) => {
  const raw = String(title || "").replace(/\s+/g, " ").trim();
  if (!raw) return "Altuvera Safaris";
  return /\baltuvera\b/i.test(raw) ? raw : raw + " | Altuvera Safaris";
};

export const toAbsoluteUrl = (value = "/") => {
  const raw = String(value || "/").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const normalized = raw.startsWith("/") ? raw : "/" + raw;
  return getSiteUrl() + normalized;
};

export const BRAND_LOGO_PATH = "/altuvera.png";
export const BRAND_LOGO_ALT = "Altuvera Safaris official logo";
export const getBrandLogoUrl = () => toAbsoluteUrl(BRAND_LOGO_PATH);

export const toMetaDescription = (text = "", max = 160) => {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return DEFAULT_SEO_DESCRIPTION;
  if (value.length <= max) return value;
  const shortened = value.slice(0, Math.max(1, max - 1)).trimEnd();
  const boundary = shortened.lastIndexOf(" ");
  return (boundary > max * 0.65 ? shortened.slice(0, boundary) : shortened).trimEnd() + "…";
};
