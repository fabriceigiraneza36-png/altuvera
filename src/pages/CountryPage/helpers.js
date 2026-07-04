// src/pages/CountryPage/helpers.js

import {
  FiMapPin, FiDollarSign, FiSun, FiBookOpen, FiUsers,
  FiClock, FiShield, FiGlobe, FiThermometer, FiInfo,
  FiCompass, FiCamera, FiFeather, FiEye,
} from "react-icons/fi";

export const txt = (v) => {
  if (!v) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(", ");
  if (typeof v === "object")
    return txt(v.name || v.label || v.value || v.code || v.title || "");
  return "";
};

export const pick = (...vals) => {
  for (const v of vals) { const t = txt(v); if (t) return t; }
  return "";
};

export const splitToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(splitToArray).filter(Boolean);
  if (typeof value === "object")
    return splitToArray(value.name || value.label || value.value || "");
  return String(value).split(/[,·|/•;]+/).map(s => s.trim()).filter(Boolean);
};

export const formatPopulation = (p) => {
  const n = Number(p);
  if (!n || isNaN(n)) return "";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

export const getHero = (c) =>
  pick(c?.heroImage, c?.hero_image, c?.coverImage, c?.cover_image, c?.image, c?.bannerImage) ||
  (Array.isArray(c?.images) ? c.images[0] : "");
export const getFlag = (c) => pick(c?.flagUrl, c?.flag_url, c?.flag);
export const getRegion = (c) => pick(c?.region, c?.continent, c?.subRegion);
export const getTagline = (c) => pick(c?.tagline, c?.shortDescription, c?.short_description, c?.intro);
export const getDesc = (c) => pick(c?.description, c?.overview, c?.about, c?.summary, c?.content);
export const getDestsCount = (c) => c?.destinationsCount ?? c?.destinations_count ?? c?.destinationCount ?? c?.totalDestinations ?? null;
export const getRating = (c) => c?.averageRating ?? c?.average_rating ?? c?.rating ?? null;
export const getReviews = (c) => c?.reviews || [];
export const getReviewAgg = (c) => c?.reviewAggregate || null;
export const getFaqs = (c) => c?.faqs || [];
export const getHowToGetThere = (c) => c?.howToGetThere || null;
export const getPracticalInfo = (c) => c?.practicalInfo || null;

export const getWildlife = (c) => {
  const src = c?.wildlife || c?.animals || c?.fauna || [];
  if (Array.isArray(src)) return src.map(x => txt(x)).filter(Boolean).slice(0, 20);
  return splitToArray(src).slice(0, 20);
};

export const getActivities = (c) => {
  const src = c?.activities || c?.topActivities || c?.things_to_do || [];
  if (Array.isArray(src)) return src.map(x => txt(x)).filter(Boolean).slice(0, 12);
  return splitToArray(src).slice(0, 12);
};

export const getAlerts = (c) => [
  { title: "Local Tips", text: c?.localTips, theme: "amber" },
  { title: "Safety Info", text: c?.safetyInfo, theme: "red" },
].filter(a => a.text);

const FACT_ICONS = {
  Capital: FiMapPin, Currency: FiDollarSign, "Best Time to Visit": FiSun,
  Languages: FiBookOpen, Population: FiUsers, "Time Zone": FiClock,
  Visa: FiShield, Climate: FiThermometer, Region: FiGlobe, Electricity: FiFeather,
};

export const extractFacts = (c) => {
  if (!c) return [];
  const facts = [];
  const add = (label, value) => {
    const v = txt(value);
    if (v) facts.push({ label, value: v, icon: FACT_ICONS[label] || FiInfo });
  };
  add("Capital", pick(c.capital, c.capitalCity));
  add("Currency", pick(c.currency, c.currencies, c.money));
  add("Best Time to Visit", pick(c.bestTimeToVisit, c.best_time_to_visit, c.bestSeason));
  add("Languages", pick(c.languages, c.language, c.officialLanguages));
  const pop = formatPopulation(c.population || c.populationCount);
  if (pop) facts.push({ label: "Population", value: pop, icon: FiUsers });
  add("Time Zone", pick(c.timezone, c.timeZone, c.time_zone));
  add("Visa", pick(c.visaInfo, c.visa_info, c.visaRequirements));
  add("Climate", pick(c.climate, c.weatherInfo));
  add("Region", pick(c.region, c.continent, c.subRegion));
  return facts;
};

export const extractHighlights = (c) => {
  if (!c) return [];
  const sources = [c.knownFor, c.highlights, c.topActivities, c.signatureExperiences, c.interests, c.tags, c.wildlifeHighlights, c.culturalHighlights];
  const unique = new Set();
  sources.forEach(src => splitToArray(src).forEach(v => unique.add(v)));
  return Array.from(unique).slice(0, 12);
};

export const extractTips = (c) => {
  if (!c) return [];
  const sources = [c.travelTips, c.travel_tips, c.tips, c.advisories, c.safety];
  for (const src of sources) {
    const arr = splitToArray(src);
    if (arr.length) return arr.slice(0, 6);
  }
  return [];
};

export const extractGallery = (c) => {
  if (!c) return [];
  const sources = [c.galleryImages, c.gallery, c.images, c.photos];
  for (const src of sources) {
    if (Array.isArray(src) && src.length > 0) {
      return src.map(img => typeof img === "string" ? img : img?.url || img?.src || "")
        .filter(Boolean).slice(0, 10);
    }
  }
  return [];
};

const ACT_MAP = {
  "game drives": FiCompass, safari: FiCompass, bird: FiEye, photo: FiCamera,
  walk: FiMapPin, hike: FiMapPin, trek: FiMapPin, culture: FiBookOpen,
  village: FiBookOpen, balloon: FiSun, fishing: FiCompass, boat: FiCompass,
  swim: FiCompass, snorkel: FiCompass,
};
export const getActIcon = (act) => {
  const a = act.toLowerCase();
  for (const [k, v] of Object.entries(ACT_MAP)) {
    if (a.includes(k)) return v;
  }
  return FiCompass;
};