const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const adaptDestination = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  const explicitImages = Array.isArray(raw.images)
    ? raw.images.filter(Boolean)
    : [];

  const primaryImage =
    raw.image ||
    raw.image_url ||
    raw.heroImage ||
    raw.hero_image_url ||
    explicitImages[0] ||
    FALLBACK_IMAGE;

  const images = [...new Set([primaryImage, ...explicitImages].filter(Boolean))];

  const countryName =
    raw.country_name || raw.country?.name || raw.country || "East Africa";
  const countryId =
    raw.country_id || raw.countryId || raw.country?.id || raw.country?.slug || "";

  return {
    ...raw,
    id: raw.slug || raw.id,
    slug: raw.slug || String(raw.id || ""),
    countryId: countryId ? String(countryId) : "",
    country: countryName,
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

