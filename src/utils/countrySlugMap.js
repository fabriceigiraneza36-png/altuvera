// Normalize country URLs consistently for client-side canonicals and internal links.
export const SLUG_MAP = {
  rwanda: "rwanda",
  tanzania: "tanzania",
  uganda: "uganda",
};

const normalizeSlug = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  // Numeric country IDs are supported by the country API and must stay numeric.
  if (/^\d+$/.test(raw)) return raw;
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getCountrySlug = (country) => {
  const value = typeof country === "string"
    ? country
    : country && typeof country === "object"
      ? country.slug || country.id || country.name
      : "";
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return normalizeSlug(SLUG_MAP[raw.toLowerCase()] || raw);
};
