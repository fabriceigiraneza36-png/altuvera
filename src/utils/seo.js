export const getSiteUrl = () => {
  const envUrl = import.meta?.env?.VITE_SITE_URL;
  const raw =
    (typeof envUrl === "string" && envUrl.trim()) ||
    (typeof window !== "undefined" && window.location?.origin) ||
    "https://altuvera.vercel.app";
  return String(raw).replace(/\/+$/, "");
};

export const toAbsoluteUrl = (path = "/") => {
  const p = String(path || "/");
  const normalized = p.startsWith("/") ? p : `/${p}`;
  return `${getSiteUrl()}${normalized}`;
};

export const BRAND_LOGO_PATH = "/altuvera.png";
export const BRAND_LOGO_ALT = "Altuvera logo";
export const getBrandLogoUrl = () => toAbsoluteUrl(BRAND_LOGO_PATH);

export const toMetaDescription = (text = "", max = 160) => {
  const s = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
};

