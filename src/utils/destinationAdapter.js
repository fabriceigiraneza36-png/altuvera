export const FALLBACK_IMAGE =
  "https://drive.google.com/uc?export=view&id=1BfTgabjQR1J8gj-HEHZ-68WxTvnZrDD1";

export const FALLBACK_IMAGES = [
  "https://drive.google.com/uc?export=view&id=1BfTgabjQR1J8gj-HEHZ-68WxTvnZrDD1",
];

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const adaptDestination = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const explicitImages = Array.isArray(raw.images)
    ? raw.images.filter(Boolean)
    : [];

  // Ensure we always have at least the fallback image
  const primaryImage =
    raw.image ||
    raw.image_url ||
    raw.heroImage ||
    raw.hero_image_url ||
    explicitImages[0] ||
    FALLBACK_IMAGE;

  // Always include fallback as a guaranteed image option
  const images = [FALLBACK_IMAGE, primaryImage, ...explicitImages].filter(
    (img, index, self) => img && self.indexOf(img) === index
  );

  // Extract country information from nested country object or direct fields
  const countryData = raw.country || {};
  
  // Use slug for frontend URLs - this is the key for linking to country pages
  const countrySlug =
    raw.countrySlug ||           // Direct field (e.g., "kenya")
    countryData.slug ||          // From nested country object
    raw.country_slug ||          // Snake case variant
    (typeof countryData.id === 'string' ? countryData.id : null); // String ID from country
  
  const countryName =
    raw.countryName ||           // Direct field
    countryData.name ||         // From nested country object
    raw.country_name ||          // Snake case variant
    raw.country ||              // Fallback to string
    "East Africa";
  
  const countryId =
    raw.countryId ||            // Direct field
    countryData.id ||           // From nested country object
    raw.country_id ||           // Snake case variant
    "";
  
  const countryFlag = countryData.flag || "";

  // Primary identifier for frontend URL (use slug)
  const slug = raw.slug || String(raw.id || "");
  
  return {
    ...raw,
    // Frontend uses slug as the primary ID for URLs
    id: slug, // This is used for React keys and URL params
    slug: slug,
    // Keep numeric ID for internal use
    numericId: raw.id,
    // Country information for linking
    countryId: countryId ? String(countryId) : "",
    countrySlug: countrySlug || "",
    countryName: countryName,
    country: countryName, // Alias for compatibility
    countryFlag: countryFlag,
    location: raw.location || countryName,
    type: raw.type || raw.category || "Destination",
    description: raw.short_description || raw.description || "",
    fullDescription:
      raw.fullDescription || raw.full_description || raw.description || "",
    images,
    image: primaryImage,
    heroImage: primaryImage,
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    bestTime: raw.bestTime || raw.best_season || "Year Round",
    bestSeason: raw.bestSeason || raw.best_season || raw.bestTime || "Year Round",
    duration: raw.duration || "Flexible",
    difficulty: raw.difficulty || "All Levels",
    rating: toNumber(raw.rating, 0),
    reviews: toNumber(raw.review_count ?? raw.reviews, 0),
    review_count: toNumber(raw.review_count ?? raw.reviews, 0),
    price: raw.price || raw.price_range || "On Request",
    groupSize: raw.groupSize || raw.group_size || "Small Groups",
  };
};

export const adaptDestinationList = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map(adaptDestination)
    .filter(Boolean);

