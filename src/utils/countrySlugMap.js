const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const SLUG_MAP = {
  rwanda: "rwanda",
  tanzania: "tanzania",
  uganda: "uganda",
};

export const getCountrySlug = (country) => {
  if (country == null) return "";
  if (typeof country === "string" || typeof country === "number") {
    return slugify(country);
  }

  const value =
    country.slug ??
    country.country_slug ??
    country.id ??
    country.name ??
    country.country_name ??
    "";

  return slugify(value);
};
