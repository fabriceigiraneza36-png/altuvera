// src/utils/destinationAdapter.js
export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";

const toNum = (v, fb = 0) => { const n = Number(v); return isFinite(n) ? n : fb; };
const toArr = (v) => Array.isArray(v) ? v.filter(Boolean) : [];

export const adaptDestination = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  // Backend serializes: images[], imageUrl, heroImage, country{id,slug,name,flag}
  const images = toArr(raw.images).length ? toArr(raw.images) 
    : [raw.heroImage || raw.imageUrl || raw.image_url || FALLBACK_IMAGE];

  const country = raw.country || {};

  return {
    // IDs - backend sends both numeric id and slug
    id:            raw.slug || String(raw.id || ""),
    slug:          raw.slug || String(raw.id || ""),
    numericId:     raw.id,

    // Content
    name:          raw.name || raw.title || "Beautiful Destination",
    tagline:       raw.tagline || "",
    shortDescription: raw.shortDescription || raw.short_description || "",
    description:   raw.description || raw.overview || "",
    highlights:    toArr(raw.highlights),
    activities:    toArr(raw.activities),

    // Country
    country:       country.name || raw.countryName || "East Africa",
    countrySlug:   country.slug || raw.countrySlug || "",
    countryId:     country.id   || raw.countryId   || "",
    countryFlag:   country.flag || raw.countryFlag  || "",
    location:      raw.region   || raw.nearestCity  || country.name || "East Africa",

    // Media
    images,
    heroImage:     raw.heroImage || raw.imageUrl || images[0],

    // Stats
    rating:        toNum(raw.rating),
    reviewCount:   toNum(raw.reviewCount || raw.review_count),

    // Duration & logistics
    duration:      raw.duration || raw.durationDisplay || null,
    durationDays:  toNum(raw.durationDays),
    difficulty:    raw.difficulty || "moderate",
    category:      raw.category || "",
    bestTime:      raw.bestTimeToVisit || raw.bestTime || "Year Round",

    // Flags
    isFeatured:    Boolean(raw.isFeatured),
    isPopular:     Boolean(raw.isPopular),
    isNew:         Boolean(raw.isNew),
    isEcoFriendly: Boolean(raw.isEcoFriendly),

    // Status
    status:        raw.status || "published",
    isActive:      raw.isActive !== false,
  };
};

export const adaptDestinationList = (rows) =>
  (Array.isArray(rows) ? rows : []).map(adaptDestination).filter(Boolean);