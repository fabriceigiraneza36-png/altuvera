const SITE_ORIGIN = "https://www.altuverasafaris.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/altuvera.png`;

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const getText = (...values) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }
  return "";
};

const imageUrl = (value) => {
  if (!value) return "";
  const raw = typeof value === "string"
    ? value
    : value.url || value.imageUrl || value.image_url || value.image || value.src ||
      value.thumbnailUrl || value.thumbnail_url || value.secure_url || "";
  if (!raw || typeof raw !== "string") return "";
  try {
    return new URL(raw, "https://api.altuverasafaris.com").toString();
  } catch {
    return "";
  }
};

const unwrapDestination = (payload) => {
  const candidates = [
    payload?.data?.destination,
    payload?.destination,
    payload?.data?.data,
    payload?.data,
    payload,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) return candidate[0];
    if (candidate && typeof candidate === "object" && (candidate.name || candidate.slug || candidate.title)) return candidate;
  }
  return null;
};

const findDestinationImage = (destination) => {
  if (!destination) return "";
  const values = [
    destination.heroImages, destination.hero_images, destination.hero_image,
    destination.heroImage, destination.coverImageUrl, destination.cover_image_url,
    destination.imageUrl, destination.image_url, destination.image, destination.thumbnailUrl,
    destination.thumbnail_url, destination.images, destination.image_urls, destination.imageUrls,
    destination.gallery, destination.galleryImages, destination.gallery_images,
    destination.attractionImages, destination.attraction_images, destination.attractions,
  ];
  const flatten = (value, depth = 0) => {
    if (depth > 4 || value == null) return [];
    if (Array.isArray(value)) return value.flatMap((item) => flatten(item, depth + 1));
    if (typeof value === "object") {
      const direct = imageUrl(value);
      return direct ? [direct] : Object.values(value).flatMap((item) => flatten(item, depth + 1));
    }
    const direct = imageUrl(value);
    return direct ? [direct] : [];
  };
  return values.flatMap((value) => flatten(value)).find(Boolean) || "";
};

const fetchDestination = async (slug) => {
  const configured = String(process.env.VITE_API_URL || process.env.API_URL || "").replace(/\/+$/, "");
  const bases = [];
  if (configured) {
    bases.push(configured);
    try {
      const origin = new URL(configured).origin;
      bases.push(`${origin}/api`, origin);
    } catch {}
  }
  bases.push(
    "https://api.altuverasafaris.com",
    "https://api.altuverasafaris.com/api",
    "https://backend-jd8f.onrender.com/api",
  );
  const seen = new Set();
  for (const base of bases.filter(Boolean)) {
    if (seen.has(base)) continue;
    seen.add(base);
    try {
      const response = await fetch(`${base}/destinations/${encodeURIComponent(slug)}?include=all`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4500),
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const destination = unwrapDestination(payload);
      if (destination) return destination;
    } catch {
      // Try the next configured API root; deployments sometimes use /api on the backend host.
    }
  }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method not allowed");
  }

  const rawSlug = String(req.query?.slug || "").trim();
  const slug = rawSlug.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 180);
  if (!slug) return res.status(400).send("Missing destination slug");

  const destination = await fetchDestination(slug);
  const name = getText(destination?.name, destination?.title) || "Discover East Africa";
  const description = getText(
    destination?.seoDescription, destination?.metaDescription,
    destination?.shortDescription, destination?.short_description,
    destination?.description, destination?.overview,
  ).slice(0, 240) || `Explore ${name} with Altuvera Safaris — authentic East African travel, culture and wildlife experiences.`;
  const image = findDestinationImage(destination) || DEFAULT_IMAGE;
  const canonical = `${SITE_ORIGIN}/destinations/${encodeURIComponent(slug)}`;
  const title = `${name} | Altuvera Safaris`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow,max-image-preview:large">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="place">
<meta property="og:site_name" content="Altuvera Safaris">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:secure_url" content="${escapeHtml(image)}">
<meta property="og:image:alt" content="${escapeHtml(name)} — destination photo from Altuvera Safaris">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(canonical)}">
</head>
<body>
<p>Opening <a href="${escapeHtml(canonical)}">${escapeHtml(name)}</a> on Altuvera Safaris…</p>
<script>location.replace(${JSON.stringify(canonical)});</script>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(200).send(html);
}
