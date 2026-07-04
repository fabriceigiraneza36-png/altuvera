// src/utils/destinationAdapter.js
// ============================================================
// Destination Adapter — maps backend camelCase response to
// the exact shape consumed by DestinationCard + DestinationDetail
// ============================================================

export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";

const toNum = (v, fb = 0) => {
  const n = Number(v);
  return isFinite(n) ? n : fb;
};

const toArr = (v) =>
  Array.isArray(v) ? v.filter(Boolean) : [];

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
};

/* ── Practical Info sub-adapter ─────────────────────────── */
const adaptPracticalInfo = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  return {
    id:            raw.id,
    destinationId: raw.destinationId,

    gettingThere: {
      nearestAirport:       raw.gettingThere?.nearestAirport       || null,
      distanceFromAirport:  raw.gettingThere?.distanceFromAirport  || null,
      driveTimeFromCapital: raw.gettingThere?.driveTimeFromCapital  || null,
      roadConditions:       raw.gettingThere?.roadConditions        || null,
      transportOptions:     toArr(raw.gettingThere?.transportOptions),
      borderCrossings:      raw.gettingThere?.borderCrossings       || null,
    },

    healthAndSafety: {
      vaccinationsRequired:    toArr(raw.healthAndSafety?.vaccinationsRequired),
      vaccinationsRecommended: toArr(raw.healthAndSafety?.vaccinationsRecommended),
      malariaRisk:             raw.healthAndSafety?.malariaRisk      || null,
      waterSafety:             raw.healthAndSafety?.waterSafety      || null,
      medicalFacilities:       raw.healthAndSafety?.medicalFacilities || null,
      emergencyContacts:       raw.healthAndSafety?.emergencyContacts || {},
      safetyRating:            raw.healthAndSafety?.safetyRating     || null,
      safetyNotes:             raw.healthAndSafety?.safetyNotes      || null,
    },

    permitsAndRegulations: {
      permitsRequired: toArr(raw.permitsAndRegulations?.permitsRequired),
      permitCost:      raw.permitsAndRegulations?.permitCost     || null,
      bookingLeadTime: raw.permitsAndRegulations?.bookingLeadTime || null,
      visitorLimits:   raw.permitsAndRegulations?.visitorLimits  || null,
      regulations:     raw.permitsAndRegulations?.regulations    || null,
    },

    climate: {
      avgTempLowC:      toNum(raw.climate?.avgTempLowC,  null),
      avgTempHighC:     toNum(raw.climate?.avgTempHighC, null),
      rainfallMmAnnual: toNum(raw.climate?.rainfallMmAnnual, null),
      humidityPercent:  toNum(raw.climate?.humidityPercent, null),
      uvIndexPeak:      toNum(raw.climate?.uvIndexPeak,  null),
      bestMonths:       toArr(raw.climate?.bestMonths),
      avoidMonths:      toArr(raw.climate?.avoidMonths),
      climateNotes:     raw.climate?.climateNotes || null,
    },

    packing: {
      essentials:          toArr(raw.packing?.essentials),
      clothingTips:        raw.packing?.clothingTips || null,
      gearRecommendations: toArr(raw.packing?.gearRecommendations),
    },

    budget: {
      rangeUsd:       raw.budget?.rangeUsd       || null,
      entranceFeeUsd: raw.budget?.entranceFeeUsd || null,
      guideCostUsd:   raw.budget?.guideCostUsd   || null,
      mealCostRange:  raw.budget?.mealCostRange  || null,
    },

    connectivity: {
      cellCoverage:       raw.connectivity?.cellCoverage       || null,
      wifiAvailable:      toBool(raw.connectivity?.wifiAvailable),
      electricityVoltage: raw.connectivity?.electricityVoltage || null,
      plugTypes:          toArr(raw.connectivity?.plugTypes),
    },

    culture: {
      currencyTips:    raw.culture?.currencyTips    || null,
      tippingCulture:  raw.culture?.tippingCulture  || null,
      localEtiquette:  toArr(raw.culture?.localEtiquette),
      photographyRules:raw.culture?.photographyRules || null,
    },

    updatedAt: raw.updatedAt || null,
  };
};

/* ── How To Get There sub-adapter ───────────────────────── */
const adaptHowToGetThere = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  return {
    nearestAirport:       raw.nearestAirport       || null,
    nearestCity:          raw.nearestCity           || null,
    distanceFromAirport:  raw.distanceFromAirport   || null,
    driveTimeFromCapital: raw.driveTimeFromCapital   || null,
    countryCapital:       raw.countryCapital         || null,
    roadConditions:       raw.roadConditions         || null,
    transportOptions:     toArr(raw.transportOptions),
    borderCrossings:      raw.borderCrossings        || null,
    generalInfo:          raw.generalInfo            || null,
    mapPosition: {
      lat: toNum(raw.mapPosition?.lat, null),
      lng: toNum(raw.mapPosition?.lng, null),
    },
    address:     raw.address     || null,
    countryName: raw.countryName || null,
    callingCode: raw.callingCode || null,
  };
};

/* ── Review sub-adapter ─────────────────────────────────── */
const adaptReview = (raw) => {
  if (!raw) return null;
  return {
    id:             raw.id,
    reviewerName:   raw.reviewerName   || "Anonymous",
    reviewerCountry:raw.reviewerCountry || null,
    reviewerAvatar: raw.reviewerAvatar  || null,
    title:          raw.title           || null,
    content:        raw.content         || "",
    rating:         toNum(raw.rating,   0),
    tripDate:       raw.tripDate        || null,
    tripType:       raw.tripType        || null,
    images:         toArr(raw.images),
    isVerified:     toBool(raw.isVerified),
    isFeatured:     toBool(raw.isFeatured),
    helpfulCount:   toNum(raw.helpfulCount, 0),
    createdAt:      raw.createdAt       || null,
  };
};

/* ── Gallery item sub-adapter ───────────────────────────── */
const adaptGalleryItem = (raw) => ({
  id:           raw.id,
  imageUrl:     raw.imageUrl     || raw.image_url || null,
  thumbnailUrl: raw.thumbnailUrl || null,
  caption:      raw.caption      || null,
  altText:      raw.altText      || null,
  isPrimary:    toBool(raw.isPrimary),
  sortOrder:    toNum(raw.sortOrder, 0),
});

/* ── Itinerary day sub-adapter ──────────────────────────── */
const adaptItineraryDay = (raw) => ({
  id:            raw.id,
  dayNumber:     toNum(raw.dayNumber,  0),
  title:         raw.title            || "",
  description:   raw.description      || null,
  activities:    toArr(raw.activities),
  highlights:    toArr(raw.highlights),
  meals:         toArr(raw.meals),
  accommodation: raw.accommodation    || null,
  distanceKm:    toNum(raw.distanceKm, null),
  imageUrl:      raw.imageUrl         || null,
});

/* ── FAQ sub-adapter ────────────────────────────────────── */
const adaptFaq = (raw) => ({
  id:           raw.id,
  question:     raw.question     || "",
  answer:       raw.answer       || "",
  category:     raw.category     || null,
  helpfulCount: toNum(raw.helpfulCount, 0),
});

/* ── Tip sub-adapter ────────────────────────────────────── */
const adaptTip = (raw) => ({
  id:         raw.id,
  tipId:      raw.tipId       || raw.id,
  slug:       raw.slug        || null,
  headline:   raw.headline    || raw.slug || "",
  summary:    raw.summary     || "",
  body:       raw.body        || null,
  category:   raw.category    || null,
  tripPhase:  raw.tripPhase   || null,
  icon:       raw.icon        || null,
  imageUrl:   raw.imageUrl    || null,
  tags:       toArr(raw.tags),
  checklist:  toArr(raw.checklist),
  isFeatured: toBool(raw.isFeatured),
  sortOrder:  toNum(raw.sortOrder, 0),
});

/* ── Reviews aggregate ──────────────────────────────────── */
const adaptReviewAggregate = (raw) => {
  if (!raw) return null;
  return {
    avgRating:    toNum(raw.avgRating,    0),
    totalReviews: toNum(raw.totalReviews, 0),
    distribution: {
      fiveStar:  toNum(raw.distribution?.fiveStar,  0),
      fourStar:  toNum(raw.distribution?.fourStar,  0),
      threeStar: toNum(raw.distribution?.threeStar, 0),
      twoStar:   toNum(raw.distribution?.twoStar,   0),
      oneStar:   toNum(raw.distribution?.oneStar,   0),
    },
  };
};

/* ═══════════════════════════════════════════════════════════
   MAIN ADAPTER
   ═══════════════════════════════════════════════════════════ */
export const adaptDestination = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  /* ── Images ─────────────────────────────────────────────── */
  const images = toArr(raw.images).length
    ? toArr(raw.images)
    : [raw.heroImage || raw.imageUrl || raw.image_url || FALLBACK_IMAGE].filter(Boolean);

  /* ── Country ────────────────────────────────────────────── */
  const country = raw.country && typeof raw.country === "object"
    ? raw.country
    : raw.country
      ? { name: String(raw.country) }
      : {};

  /* ── Gallery ────────────────────────────────────────────── */
  const gallery = toArr(raw.gallery).map(adaptGalleryItem);

  /* ── Itinerary ──────────────────────────────────────────── */
  const itinerary = toArr(raw.itinerary).map(adaptItineraryDay);

  /* ── FAQs ───────────────────────────────────────────────── */
  const faqs = toArr(raw.faqs).map(adaptFaq);

  /* ── Reviews ────────────────────────────────────────────── */
  const reviews          = toArr(raw.reviews).map(adaptReview).filter(Boolean);
  const reviewAggregate  = adaptReviewAggregate(raw.aggregate || null);

  /* ── Tips ───────────────────────────────────────────────── */
  const tips = toArr(raw.tips).map(adaptTip);

  /* ── Tags ───────────────────────────────────────────────── */
  const tags = toArr(raw.tags).map((t) =>
    typeof t === "string"
      ? { name: t, slug: t, category: null }
      : { name: t.name || "", slug: t.slug || "", category: t.category || null }
  );

  /* ── Related ────────────────────────────────────────────── */
  const related = toArr(raw.related)
    .map(adaptDestination)
    .filter(Boolean);

  return {
    // ── Identifiers ──────────────────────────────────────────
    id:        raw.slug || String(raw.id || ""),
    slug:      raw.slug || String(raw.id || ""),
    numericId: raw.id,

    // ── Basic Content ────────────────────────────────────────
    name:             raw.name             || raw.title || "Beautiful Destination",
    tagline:          raw.tagline          || "",
    shortDescription: raw.shortDescription || raw.short_description || "",
    description:      raw.description      || "",
    overview:         raw.overview         || "",

    // ── Extended Content ─────────────────────────────────────
    highlights:      toArr(raw.highlights),
    activities:      toArr(raw.activities),
    wildlife:        toArr(raw.wildlife),
    bestTimeToVisit: raw.bestTimeToVisit || raw.best_time_to_visit || raw.bestTime || "Year Round",
    gettingThere:    raw.gettingThere    || null,
    whatToExpect:    raw.whatToExpect    || null,
    localTips:       raw.localTips       || null,
    safetyInfo:      raw.safetyInfo      || null,

    // ── Classification ───────────────────────────────────────
    category:       raw.category        || "",
    classification: raw.classification || raw.adventureCategory || raw.category || raw.destinationType || "Adventure",
    adventureCategory: raw.adventureCategory || raw.classification || raw.category || raw.destinationType || "Adventure",
    difficulty:     raw.difficulty      || "moderate",
    destinationType:raw.destinationType || null,

    // ── Country (STRONG RELATIONSHIP) ────────────────────────
    country:      country.name || raw.countryName || "East Africa",
    countrySlug:  country.slug || raw.countrySlug || "",
    countryId:    country.id   || raw.countryId   || "",
    countryFlag:  country.flag || raw.countryFlag  || "",
    countryObj:   {
      id:        country.id        || raw.countryId   || null,
      slug:      country.slug      || raw.countrySlug || "",
      name:      country.name      || raw.countryName || "",
      flag:      country.flag      || raw.countryFlag || "",
      flagUrl:   country.flagUrl   || null,
      continent: country.continent || null,
      region:    country.region    || null,
    },

    // ── Location ─────────────────────────────────────────────
    location:              raw.region || raw.nearestCity || country.name || "East Africa",
    region:                raw.region             || null,
    nearestCity:           raw.nearestCity         || null,
    nearestAirport:        raw.nearestAirport       || null,
    distanceFromAirportKm: toNum(raw.distanceFromAirportKm, null),
    address:               raw.address              || null,
    latitude:              toNum(raw.latitude,  null),
    longitude:             toNum(raw.longitude, null),
    altitudeMeters:        toNum(raw.altitudeMeters, null),
    mapPosition: {
      lat: toNum(raw.mapPosition?.lat ?? raw.latitude,  null),
      lng: toNum(raw.mapPosition?.lng ?? raw.longitude, null),
    },

    // ── Media ────────────────────────────────────────────────
    images,
    imageUrl:      raw.imageUrl      || images[0] || FALLBACK_IMAGE,
    heroImage:     raw.heroImage     || raw.imageUrl || images[0] || FALLBACK_IMAGE,
    thumbnailUrl:  raw.thumbnailUrl  || images[0] || FALLBACK_IMAGE,
    videoUrl:      raw.videoUrl      || null,
    virtualTourUrl:raw.virtualTourUrl || null,

    // ── Duration & Group ─────────────────────────────────────
    duration:      raw.duration      || raw.durationDisplay || null,
    durationDays:  toNum(raw.durationDays),
    durationNights:toNum(raw.durationNights),
    minGroupSize:  toNum(raw.minGroupSize,  1),
    maxGroupSize:  toNum(raw.maxGroupSize,  null),
    minAge:        toNum(raw.minAge,        null),
    fitnessLevel:  raw.fitnessLevel  || null,

    // ── Availability ─────────────────────────────────────────
    entranceFee:   raw.entranceFee    || null,
    operatingHours:raw.operatingHours || null,
    isSoldOut:     toBool(raw.isSoldOut),

    // ── Ratings & Stats ──────────────────────────────────────
    rating:       toNum(raw.rating),
    reviewCount:  toNum(raw.reviewCount || raw.review_count),
    viewCount:    toNum(raw.viewCount),
    bookingCount: toNum(raw.bookingCount),
    wishlistCount:toNum(raw.wishlistCount),

    // ── Boolean Flags ────────────────────────────────────────
    isFeatured:      toBool(raw.isFeatured),
    isPopular:       toBool(raw.isPopular),
    isNew:           toBool(raw.isNew),
    isEcoFriendly:   toBool(raw.isEcoFriendly),
    isFamilyFriendly:toBool(raw.isFamilyFriendly),
    isActive:        raw.isActive !== false,
    isSoldOut:       toBool(raw.isSoldOut),

    // ── SEO ──────────────────────────────────────────────────
    metaTitle:       raw.metaTitle       || raw.name || "",
    metaDescription: raw.metaDescription || raw.shortDescription || "",

    // ── Status ───────────────────────────────────────────────
    status:      raw.status      || "published",
    publishedAt: raw.publishedAt || null,
    createdAt:   raw.createdAt   || null,
    updatedAt:   raw.updatedAt   || null,

    // ── Rich Relations (populated when include=all) ───────────
    gallery,
    itinerary,
    faqs,
    reviews,
    reviewAggregate,
    tips,
    tags,
    related,
    practicalInfo:  adaptPracticalInfo(raw.practicalInfo   || null),
    howToGetThere:  adaptHowToGetThere(raw.howToGetThere   || null),
  };
};

export const adaptDestinationList = (rows) =>
  (Array.isArray(rows) ? rows : []).map(adaptDestination).filter(Boolean);