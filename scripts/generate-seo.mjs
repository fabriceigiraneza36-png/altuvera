import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import destinations, { getAllDestinations } from "../src/data/destinations.js";
import posts from "../src/data/posts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicDir = path.join(repoRoot, "public");

const baseUrlRaw =
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  "https://altuvera.vercel.app";
const baseUrl = String(baseUrlRaw).replace(/\/+$/, "");

const today = new Date().toISOString().slice(0, 10);

const toAbs = (p) => {
  const normalized = String(p || "/").startsWith("/") ? p : `/${p}`;
  return `${baseUrl}${normalized}`;
};

const escapeXml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

const buildSitemap = () => {
  const staticRoutes = [
    "/",
    "/destinations",
    "/explore",
    "/services",
    "/about",
    "/contact",
    "/gallery",
    "/tips",
    "/posts",
    "/interactive-map",
    "/virtual-tour",
    "/team",
    "/faq",
    "/privacy",
    "/terms",
    "/payment-terms",
  ];

  const countryIds = Array.from(
    new Set(Object.keys(destinations || {}).map((k) => String(k))),
  ).sort();

  const destinationItems = getAllDestinations()
    .filter((d) => d && d.id)
    .map((d) => ({
      loc: `/destination/${d.id}`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8,
      image: Array.isArray(d.images) ? d.images[0] : undefined,
      imageTitle: d.name,
    }));

  const postItems = (Array.isArray(posts) ? posts : [])
    .filter((p) => p && p.slug)
    .map((p) => ({
      loc: `/post/${p.slug}`,
      lastmod: isIsoDate(p.date) ? p.date : today,
      changefreq: "monthly",
      priority: 0.7,
      image: p.image,
      imageTitle: p.title,
    }));

  const urlEntries = [];

  for (const r of staticRoutes) {
    urlEntries.push({
      loc: r,
      lastmod: today,
      changefreq: r === "/" ? "weekly" : "monthly",
      priority: r === "/" ? 1.0 : 0.8,
    });
  }

  for (const id of countryIds) {
    urlEntries.push({
      loc: `/country/${id}`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.85,
    });
    urlEntries.push({
      loc: `/country/${id}/destinations`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  urlEntries.push(...destinationItems, ...postItems);

  const seen = new Set();
  const urls = urlEntries.filter((u) => {
    const key = String(u.loc);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  );

  for (const u of urls) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(toAbs(u.loc))}</loc>`);
    if (u.lastmod) lines.push(`    <lastmod>${escapeXml(u.lastmod)}</lastmod>`);
    if (u.changefreq)
      lines.push(`    <changefreq>${escapeXml(u.changefreq)}</changefreq>`);
    if (typeof u.priority === "number")
      lines.push(`    <priority>${u.priority.toFixed(2)}</priority>`);
    if (u.image && String(u.image).startsWith("http")) {
      lines.push("    <image:image>");
      lines.push(`      <image:loc>${escapeXml(u.image)}</image:loc>`);
      if (u.imageTitle)
        lines.push(`      <image:title>${escapeXml(u.imageTitle)}</image:title>`);
      lines.push("    </image:image>");
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  lines.push("");
  return lines.join("\n");
};

const toRssDate = (iso) => {
  const d = new Date(isIsoDate(iso) ? `${iso}T00:00:00Z` : Date.now());
  return d.toUTCString();
};

const buildRss = () => {
  const items = (Array.isArray(posts) ? posts : [])
    .filter((p) => p && p.slug)
    .slice()
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push("<rss version=\"2.0\">");
  lines.push("  <channel>");
  lines.push("    <title>Altuvera Journal</title>");
  lines.push(`    <link>${escapeXml(toAbs("/posts"))}</link>`);
  lines.push(
    `    <description>${escapeXml(
      "Travel guides, safari tips, and stories from East Africa and beyond.",
    )}</description>`,
  );
  lines.push("    <language>en</language>");
  lines.push(
    `    <lastBuildDate>${escapeXml(new Date().toUTCString())}</lastBuildDate>`,
  );

  for (const p of items) {
    const link = toAbs(`/post/${p.slug}`);
    lines.push("    <item>");
    lines.push(`      <title>${escapeXml(p.title)}</title>`);
    lines.push(`      <link>${escapeXml(link)}</link>`);
    lines.push(`      <guid isPermaLink="true">${escapeXml(link)}</guid>`);
    lines.push(`      <pubDate>${escapeXml(toRssDate(p.date))}</pubDate>`);
    if (p.excerpt)
      lines.push(`      <description>${escapeXml(p.excerpt)}</description>`);
    if (p.category) lines.push(`      <category>${escapeXml(p.category)}</category>`);
    lines.push("    </item>");
  }

  lines.push("  </channel>");
  lines.push("</rss>");
  lines.push("");
  return lines.join("\n");
};

const main = async () => {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), buildSitemap(), "utf8");
  await fs.writeFile(path.join(publicDir, "rss.xml"), buildRss(), "utf8");
};

await main();

