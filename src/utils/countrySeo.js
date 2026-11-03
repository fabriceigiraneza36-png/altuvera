const asText = (value) => {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" · ");
  if (typeof value === "object") {
    for (const key of ["name", "title", "label", "text", "description", "content"]) {
      if (value[key] != null) {
        const result = asText(value[key]);
        if (result) return result;
      }
    }
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
};

const firstText = (...values) => {
  for (const value of values) {
    const result = asText(value);
    if (result) return result;
  }
  return "";
};

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const COUNTRY_TITLES = {
  rwanda: "Safaris & Gorilla Trekking",
  uganda: "Safaris & Gorilla Trekking",
  tanzania: "Safaris & Wildlife Tours",
  kenya: "Safaris & Wildlife Tours",
  ethiopia: "Tours & Cultural Experiences",
};

const COUNTRY_DESCRIPTIONS = {
  rwanda:
    "Plan a Rwanda safari with Altuvera Safaris. Explore gorilla trekking, wildlife encounters, scenic landscapes and cultural experiences with local insight.",
  uganda:
    "Discover Uganda with Altuvera Safaris. Explore gorilla trekking, wildlife safaris, forest adventures and cultural experiences across the country.",
  tanzania:
    "Explore Tanzania with Altuvera Safaris. Discover wildlife safaris, mountain adventures, coastal escapes and cultural experiences.",
  kenya:
    "Explore Kenya with Altuvera Safaris. Discover wildlife safaris, remarkable landscapes, coastal escapes and cultural experiences.",
  ethiopia:
    "Explore Ethiopia with Altuvera Safaris. Discover historic landscapes, highland scenery and cultural experiences across the country.",
};

const withBrand = (value) => {
  const title = String(value || "").replace(/\s+/g, " ").trim();
  if (!title) return "Altuvera Safaris";
  return /\baltuvera\b/i.test(title) ? title : title + " | Altuvera Safaris";
};

const limitDescription = (value, maxLength = 160) => {
  const description = String(value || "").replace(/\s+/g, " ").trim();
  if (description.length <= maxLength) return description;
  const shortened = description.slice(0, maxLength - 1).trimEnd();
  const boundary = shortened.lastIndexOf(" ");
  return (boundary > maxLength * 0.65 ? shortened.slice(0, boundary) : shortened).trimEnd() + "…";
};

export const getCountrySeo = (country = {}, fallbackName = "") => {
  const name = firstText(
    country.name,
    country.country_name,
    country.countryName,
    country.title,
    fallbackName,
  );
  const slug = slugify(
    firstText(country.slug, country.country_slug, country.name, country.country_name, fallbackName),
  );
  const titleOverride = firstText(
    country.meta_title,
    country.metaTitle,
    country.seo_title,
    country.seoTitle,
  );
  const title = withBrand(
    titleOverride || (name
      ? name + " " + (COUNTRY_TITLES[slug] || "Travel Experiences & Safaris")
      : "East Africa Travel Experiences"),
  );
  const descriptionSource = firstText(
    country.seo_description,
    country.seoDescription,
    country.meta_description,
    country.metaDescription,
    country.short_description,
    country.shortDescription,
    country.tagline,
    country.short_notes,
    country.description,
    country.overview,
    country.full_description,
    COUNTRY_DESCRIPTIONS[slug],
    name ? "Discover " + name + " with Altuvera Safaris. Explore local landscapes, wildlife and cultural experiences, and plan a journey shaped around your interests." : "",
  );
  return {
    name,
    slug,
    title,
    description: limitDescription(descriptionSource),
  };
};

export { slugify as slugifyCountry };
