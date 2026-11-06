const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const asList = (value) => Array.isArray(value) ? value : value ? [value] : [];

const getTagValues = (destination) => [
  ...asList(destination?.tags).flatMap((tag) =>
    typeof tag === "string"
      ? [tag]
      : [tag?.name, tag?.slug, tag?.category].filter(Boolean)
  ),
  ...asList(destination?.activities),
  ...asList(destination?.highlights),
  ...asList(destination?.attractions).flatMap((item) =>
    typeof item === "string" ? [item] : [item?.name, item?.title, item?.description].filter(Boolean)
  ),
];

const matchesPhrase = (haystack, phrase) => {
  const normalizedHaystack = ` ${normalize(haystack)} `;
  const normalizedPhrase = normalize(phrase);
  return Boolean(normalizedPhrase) && normalizedHaystack.includes(` ${normalizedPhrase} `);
};

const getDestinationCategories = (destination) => [
  destination?.category,
  destination?.classification,
  destination?.adventureCategory,
  destination?.adventure_category,
  destination?.destinationType,
  destination?.destination_type,
  destination?.type,
].map(normalize).filter(Boolean);

export const matchesAdventureDestination = (adventure, destination) => {
  if (!adventure || !destination || typeof destination !== "object") return false;

  const allowedCategories = new Set(
    asList(adventure.destinationCategories).map(normalize).filter(Boolean)
  );
  const categories = getDestinationCategories(destination);
  if (categories.some((category) => allowedCategories.has(category))) return true;

  const textFields = [
    destination.name,
    destination.title,
    destination.slug,
    destination.tagline,
    destination.shortDescription,
    destination.short_description,
    destination.description,
    destination.summary,
    destination.country,
    destination.countryName,
    ...getTagValues(destination),
  ].filter(Boolean).join(" ");

  return asList(adventure.destinationKeywords).some((keyword) =>
    matchesPhrase(textFields, keyword)
  );
};

export const getAdventureDestinationMatches = (adventure, destinations = []) => {
  if (!adventure || !Array.isArray(destinations)) return [];
  return destinations
    .filter((destination) => matchesAdventureDestination(adventure, destination))
    .sort((a, b) => {
      const featured = Number(Boolean(b.isFeatured ?? b.is_featured)) - Number(Boolean(a.isFeatured ?? a.is_featured));
      if (featured) return featured;
      const rating = Number(b.rating || 0) - Number(a.rating || 0);
      return rating;
    });
};

export const getDestinationExperienceLabel = (destination) => {
  const categories = getDestinationCategories(destination);
  if (categories.some((item) => ["primate","gorilla","chimpanzee"].includes(item))) return "Primate encounters";
  if (categories.some((item) => ["wildlife","safari"].includes(item))) return "Wildlife & safari";
  if (categories.some((item) => ["mountain","trekking","hiking"].includes(item))) return "Mountain & trekking";
  if (categories.some((item) => ["beach","coast","marine"].includes(item))) return "Coast & islands";
  if (categories.some((item) => ["cultural","culture","historical","heritage"].includes(item))) return "Culture & heritage";
  if (categories.some((item) => ["photography"].includes(item))) return "Photography";
  const fallback = categories[0] || "destination";
  return fallback.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const getDestinationCountry = (destination) => {
  const country = destination?.country;
  if (country && typeof country === "object") {
    return {
      name: country.name || destination.countryName || destination.country_name || "",
      slug: country.slug || destination.countrySlug || destination.country_slug || "",
    };
  }
  const name = String(country || destination?.countryName || destination?.country_name || "").trim();
  const slug = destination?.countrySlug || destination?.country_slug ||
    normalize(name).replace(/\s+/g, "-");
  return { name, slug };
};

export const getDestinationImage = (destination) => {
  const gallery = asList(destination?.gallery || destination?.galleryImages);
  const firstGalleryImage = gallery
    .map((image) => typeof image === "string"
      ? image
      : image?.imageUrl || image?.image_url || image?.url || image?.src || image?.thumbnailUrl
    )
    .find((value) => typeof value === "string" && value.trim());
  const images = asList(destination?.images).map((image) =>
    typeof image === "string" ? image : image?.imageUrl || image?.image_url || image?.url || image?.src
  );
  return [
    destination?.heroImage,
    destination?.coverImageUrl,
    destination?.cover_image_url,
    destination?.imageUrl,
    destination?.image_url,
    destination?.thumbnailUrl,
    destination?.thumbnail_url,
    firstGalleryImage,
    ...images,
  ].find((value) => typeof value === "string" && value.trim()) || "";
};
