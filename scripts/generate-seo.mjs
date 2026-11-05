import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import posts from "../src/data/posts.js";
import { ADVENTURE_CATALOG } from "../src/data/adventureCatalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "public");

const baseUrlRaw =
  process.env.VITE_SITE_URL ||
  process.env.VITE_APP_URL ||
  process.env.SITE_URL ||
  "https://www.altuverasafaris.com";
const baseUrl = String(baseUrlRaw).replace(/\/+$/, "");
const apiBase = String(
  process.env.VITE_API_URL ||
  process.env.API_URL ||
  "https://backend-jd8f.onrender.com/api",
).replace(/\/+$/, "");

const toAbs = (value = "/") => {
  const raw = String(value || "/");
  if (/^https?:\/\//i.test(raw)) return raw;
  return baseUrl + (raw.startsWith("/") ? raw : "/" + raw);
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const validDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fetchJson = async (route) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(apiBase + route, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("HTTP " + response.status + " for " + route);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const extractRows = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.rows,
    payload?.results,
    ...keys.map((key) => payload?.[key]),
    ...keys.map((key) => payload?.data?.[key]),
  ];
  return candidates.find(Array.isArray) || [];
};

const getLiveSeoData = async () => {
  const results = await Promise.allSettled([
    fetchJson("/countries?limit=500&is_active=true"),
    fetchJson("/packages?page=1&limit=100&sort=latest"),
  ]);
  const countries = results[0].status === "fulfilled"
    ? extractRows(results[0].value, ["countries"])
    : [];
  const packages = results[1].status === "fulfilled"
    ? extractRows(results[1].value, ["packages"])
    : [];

  if (results[0].status === "rejected") {
    console.warn("[seo] Live countries unavailable:", results[0].reason?.message || results[0].reason);
  }
  if (results[1].status === "rejected") {
    console.warn("[seo] Live packages unavailable:", results[1].reason?.message || results[1].reason);
  }
  return { countries, packages };
};

const buildSitemap = async () => {
  const staticRoutes = [
    "/",
    "/destinations",
    "/packages",
    "/explore",
    "/services",
    "/about",
    "/contact",
    "/gallery",
    "/tips",
    "/posts",
    "/interactive-map",
    "/team",
    "/faq",
    "/privacy",
    "/terms",
    "/payment-terms",
  ];

  const live = await getLiveSeoData();
  // Country URLs must come only from explicitly active backend records.
  // Fail closed when the live API is unavailable or returns no active countries:
  // never infer country pages from destination keys or bundled static content.
  const countryBySlug = new Map();

  for (const country of live.countries) {
    if (!country) continue;
    const active = [country.is_active, country.isActive].some(
      (value) => value === true || value === 1 || String(value).trim().toLowerCase() === "true",
    );
    if (!active) continue;

    const slug = slugify(
      country.slug || country.country_slug || country.name || country.country_name || country.id,
    );
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) continue;
    if (!countryBySlug.has(slug)) countryBySlug.set(slug, country);
  }

  if (!countryBySlug.size) {
    console.warn("[seo] No explicitly active countries returned; omitting country URLs from sitemap.");
  }

  const entries = staticRoutes.map((loc) => ({ loc }));

  // Every public adventure guide has its own crawlable landing page.
  for (const guide of ADVENTURE_CATALOG) {
    const slug = String(guide?.slug || "").trim().toLowerCase();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) continue;
    entries.push({
      loc: "/adventures/" + slug,
      ...(typeof guide.image === "string" && /^https:\/\//i.test(guide.image)
        ? { image: guide.image, imageTitle: guide.title || slug }
        : {}),
    });
  }

  for (const [slug, country] of [...countryBySlug.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const lastmod = validDate(country.updated_at || country.updatedAt || country.modified_at);
    entries.push({ loc: "/country/" + slug, ...(lastmod ? { lastmod } : {}) });
    entries.push({ loc: "/country/" + slug + "/destinations", ...(lastmod ? { lastmod } : {}) });
  }

  // Packages are taken only from the public API, which filters drafts for guests.
  // Destination details are handled by the database-backed destinations sitemap.
  const packagesBySlug = new Map();
  for (const pkg of live.packages) {
    if (!pkg || pkg.is_published === false || pkg.isPublished === false) continue;
    const slug = String(pkg.slug || "").trim().toLowerCase();
    if (!slug || !/^[a-z0-9_-]+$/.test(slug)) continue;
    if (!packagesBySlug.has(slug)) packagesBySlug.set(slug, pkg);
  }

  for (const [slug, pkg] of [...packagesBySlug.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const lastmod = validDate(pkg.updated_at || pkg.updatedAt || pkg.created_at || pkg.createdAt);
    const image = pkg.cover_image_url || pkg.poster_url || pkg.image_url || "";
    entries.push({
      loc: "/packages/" + slug,
      ...(lastmod ? { lastmod } : {}),
      ...(typeof image === "string" && /^https:\/\//i.test(image)
        ? { image, imageTitle: pkg.title || slug }
        : {}),
    });
  }

  const postsBySlug = new Map();
  for (const post of Array.isArray(posts) ? posts : []) {
    const slug = String(post?.slug || "").trim().toLowerCase();
    if (slug && /^[a-z0-9_-]+$/.test(slug) && !postsBySlug.has(slug)) postsBySlug.set(slug, post);
  }

  for (const [slug, post] of [...postsBySlug.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const lastmod = validDate(post.updatedAt || post.updated_at || post.dateModified || post.date);
    entries.push({
      loc: "/post/" + slug,
      ...(lastmod ? { lastmod } : {}),
      ...(typeof post.image === "string" && /^https:\/\//i.test(post.image)
        ? { image: post.image, imageTitle: post.title || slug }
        : {}),
    });
  }

  const seen = new Set();
  const urls = entries.filter((entry) => {
    const key = String(entry.loc || "").replace(/\/+$/, "") || "/";
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];

  for (const entry of urls) {
    lines.push("  <url>");
    lines.push("    <loc>" + escapeXml(toAbs(entry.loc)) + "</loc>");
    if (entry.lastmod) lines.push("    <lastmod>" + escapeXml(entry.lastmod) + "</lastmod>");
    if (entry.image) {
      lines.push("    <image:image>");
      lines.push("      <image:loc>" + escapeXml(entry.image) + "</image:loc>");
      if (entry.imageTitle) lines.push("      <image:title>" + escapeXml(entry.imageTitle) + "</image:title>");
      lines.push("    </image:image>");
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>", "");
  return lines.join("\n");
};

const toRssDate = (iso) => {
  const dateValue = validDate(iso);
  return new Date(dateValue ? dateValue + "T00:00:00Z" : Date.now()).toUTCString();
};

const buildRss = () => {
  const items = (Array.isArray(posts) ? posts : [])
    .filter((post) => post && post.slug)
    .slice()
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Altuvera Journal</title>",
    "    <link>" + escapeXml(toAbs("/posts")) + "</link>",
    "    <description>" + escapeXml("Travel guides, safari tips and stories from East Africa and beyond.") + "</description>",
    "    <language>en</language>",
    "    <lastBuildDate>" + escapeXml(new Date().toUTCString()) + "</lastBuildDate>",
  ];

  for (const post of items) {
    const link = toAbs("/post/" + post.slug);
    lines.push("    <item>");
    lines.push("      <title>" + escapeXml(post.title) + "</title>");
    lines.push("      <link>" + escapeXml(link) + "</link>");
    lines.push("      <guid isPermaLink=\"true\">" + escapeXml(link) + "</guid>");
    lines.push("      <pubDate>" + escapeXml(toRssDate(post.date)) + "</pubDate>");
    if (post.excerpt) lines.push("      <description>" + escapeXml(post.excerpt) + "</description>");
    if (post.category) lines.push("      <category>" + escapeXml(post.category) + "</category>");
    lines.push("    </item>");
  }

  lines.push("  </channel>", "</rss>", "");
  return lines.join("\n");
};

const main = async () => {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), await buildSitemap(), "utf8");
  await fs.writeFile(path.join(publicDir, "rss.xml"), buildRss(), "utf8");
};

await main();
