import postsFallback from "../src/data/posts.js";

const SITE = "https://www.altuverasafaris.com";
const RAW_API = process.env.VITE_API_URL || process.env.API_URL || "https://backend-jd8f.onrender.com";
const API = String(RAW_API).replace(/\/+$/, "").replace(/\/api$/i, "") + "/api";
const LOGO = SITE + "/altuvera.png";

const STATIC = {
  "/": ["East Africa Safaris & Gorilla Trekking | Altuvera Safaris", "Explore gorilla trekking, wildlife safaris and cultural journeys across Rwanda and East Africa with Altuvera Safaris. Local insight, thoughtfully planned trips."],
  "/destinations": ["East Africa Safari Destinations | Altuvera Safaris", "Explore safari destinations across Rwanda, Uganda, Tanzania and Kenya, with wildlife experiences, gorilla trekking, mountain journeys and cultural discovery."],
  "/packages": ["East Africa Safari Packages | Altuvera Safaris", "Explore Altuvera Safaris journeys and request a tailored itinerary for wildlife, gorilla trekking, mountain and cultural experiences across East Africa."],
  "/posts": ["Travel Journal & Safari Guides | Altuvera Safaris", "Read travel stories, destination guides and practical safari advice from Altuvera Safaris, featuring East Africa and the wider region."],
  "/tips": ["East Africa Travel Tips | Altuvera Safaris", "Prepare for your East African journey with practical advice on seasons, packing, wildlife experiences, local culture and travel planning."],
  "/explore": ["Explore East Africa | Altuvera Safaris", "Discover East African experiences, destinations and trip ideas to help shape your next safari or cultural journey."],
  "/services": ["Safari & Travel Services | Altuvera Safaris", "Explore Altuvera Safaris services, including wildlife safaris, gorilla trekking, mountain adventures, cultural experiences and tailored travel planning."],
  "/about": ["About Altuvera Safaris | Authentic East African Adventures", "Meet Altuvera Safaris, a Rwanda-based travel company connecting guests with East African wildlife, landscapes, culture and local experiences."],
  "/contact": ["Contact Altuvera Safaris", "Contact Altuvera Safaris to discuss East African travel ideas, destination questions and a tailor-made safari or cultural journey."],
  "/gallery": ["East Africa Safari Gallery | Altuvera Safaris", "View landscapes, wildlife, destinations and cultural moments from Altuvera Safaris experiences across East Africa."],
  "/faq": ["Altuvera Safaris FAQs", "Find helpful answers about planning an East African safari with Altuvera Safaris, including destinations, bookings and travel preparation."],
  "/team": ["Meet the Altuvera Safaris Team", "Meet the people behind Altuvera Safaris and learn about the local knowledge and care that shape our East African travel experiences."],
  "/interactive-map": ["East Africa Travel Map | Altuvera Safaris", "Explore the locations and regions featured in Altuvera Safaris journeys across East Africa."],
  "/privacy": ["Privacy Policy | Altuvera Safaris", "Learn how Altuvera Safaris handles personal information, privacy and data protection when you use our website and services."],
  "/terms": ["Terms of Service | Altuvera Safaris", "Review the website terms and conditions for using Altuvera Safaris online services and information."],
  "/payment-terms": ["Booking Terms & Conditions | Altuvera Safaris", "Read the terms and conditions that apply to using Altuvera Safaris services and website."]
};

const PRIVATE = ["/dashboard", "/reviews", "/profile", "/my-bookings", "/wishlist", "/settings", "/account", "/notifications", "/messages", "/booking", "/booking-verification", "/auth", "/admin", "/tailwind-test"];
const esc = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const textOf = (v, max = 10000) => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map((x) => textOf(x, 1000)).filter(Boolean).join(" · ").slice(0, max);
  if (typeof v === "object") {
    for (const k of ["name", "title", "label", "text", "description", "content"]) {
      if (v[k] != null) { const x = textOf(v[k], max); if (x) return x; }
    }
    return "";
  }
  return String(v).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\s+/g, " ").trim().slice(0, max);
};
const first = (...values) => {
  for (const v of values) { const s = textOf(v); if (s) return s; }
  return "";
};
const arr = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") { try { const x = JSON.parse(v); return Array.isArray(x) ? x : []; } catch { return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean); } }
  return [];
};
const unwrap = (payload, preferred = "") => {
  const nested = preferred && payload && payload.data && payload.data[preferred];
  const direct = preferred && payload && payload[preferred];
  const options = preferred
    ? [nested, direct, payload && payload.data && payload.data.data, payload && payload.data, payload]
    : [payload && payload.data && payload.data.destination, payload && payload.data && payload.data.post, payload && payload.data && payload.data.package, payload && payload.data && payload.data.country, payload && payload.data, payload && payload.destination, payload && payload.post, payload && payload.package, payload && payload.country, payload];
  return options.find((x) => x && !Array.isArray(x) && typeof x === "object" && (x.name || x.title || x.slug || x.meta_title)) || {};
};
const fetchDestination = async (slug) => {
  const configured = String(process.env.VITE_API_URL || process.env.API_URL || "").replace(/\/+$/, "");
  const bases = [];
  if (configured) {
    bases.push(configured);
    try { bases.push(new URL(configured).origin + "/api"); } catch {}
  }
  bases.push("https://backend-jd8f.onrender.com/api", "https://api.altuverasafaris.com/api");
  const unique = Array.from(new Set(bases.map((base) => base.replace(/\/+$/, "").replace(/\/api$/i, "") + "/api")));
  const results = await Promise.all(unique.map(async (base) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3600);
    try {
      const response = await fetch(base + "/destinations/" + encodeURIComponent(slug) + "?include=all", {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const record = unwrap(await response.json(), "destination");
      const recordSlug = String(record.slug || "").trim().toLowerCase();
      return recordSlug === String(slug).trim().toLowerCase() ? record : null;
    } catch { return null; }
    finally { clearTimeout(timer); }
  }));
  return results.find(Boolean) || {};
};
const rows = (payload) => {
  if (Array.isArray(payload)) return payload;
  const options = [payload && payload.data, payload && payload.data && payload.data.data, payload && payload.results, payload && payload.items, payload && payload.destinations, payload && payload.posts, payload && payload.packages, payload && payload.data && payload.data.destinations, payload && payload.data && payload.data.posts, payload && payload.data && payload.data.packages];
  return options.find(Array.isArray) || [];
};
const fetchJson = async (endpoint) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4800);
  try {
    const response = await fetch(API + endpoint, { headers: { Accept: "application/json" }, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
  finally { clearTimeout(timer); }
};
const imageOf = (item) => {
  const values = item ? [item.hero_image, item.cover_image_url, item.thumbnail_url, item.image_url, item.image, item.featured_image, ...arr(item.images), ...arr(item.gallery), ...arr(item.image_gallery)] : [];
  for (const v of values) {
    const raw = typeof v === "string" ? v : v && (v.url || v.image_url || v.src);
    if (!raw) continue;
    try { const u = new URL(raw, SITE); if (u.protocol === "https:" || u.protocol === "http:") return u.toString(); } catch {}
  }
  return LOGO;
};
const listHtml = (items, prefix, label) => {
  const cards = items.slice(0, 30).map((item) => {
    const slug = first(item.slug, item.id), name = first(item.name, item.title, slug);
    if (!slug || !name) return "";
    const desc = first(item.short_description, item.excerpt, item.description);
    const img = imageOf(item);
    return '<article class="card"><a href="' + esc(prefix + encodeURIComponent(slug)) + '">' + (img !== LOGO ? '<img src="' + esc(img) + '" alt="' + esc(name) + '" loading="lazy">' : "") + '<span><strong>' + esc(name) + '</strong>' + (desc ? '<small>' + esc(desc.slice(0, 220)) + '</small>' : "") + '</span></a></article>';
  }).filter(Boolean).join("");
  return cards ? '<section><h2>' + esc(label) + '</h2><div class="cards">' + cards + '</div></section>' : '<p>Explore ' + esc(label) + ' with Altuvera Safaris. Contact our team for more information.</p>';
};
const render = async (route) => {
  const page = { title: "", description: "", image: LOGO, body: "", type: "WebPage", noindex: false, status: 200, author: "", published: "" };
  const parts = route.split("/").filter(Boolean);
  if (PRIVATE.some((p) => route === p || route.startsWith(p + "/"))) {
    page.title = "Private Account Area | Altuvera Safaris"; page.description = "This Altuvera Safaris page is available to signed-in account holders."; page.noindex = true;
    page.body = '<h1>Private account area</h1><p>This page is available to signed-in Altuvera Safaris account holders. Visit the <a href="/login">sign-in area</a> to continue.</p>'; return page;
  }
  const country = route.match(/^\/country\/([^/]+)(\/destinations)?$/i);
  if (country) {
    const data = unwrap(await fetchJson("/countries/" + encodeURIComponent(country[1])), "country");
    if (!data.name && !data.title) { page.title = "Country Guide | Altuvera Safaris"; page.description = "Explore country travel guides across East Africa."; page.noindex = true; page.status = 404; page.body = '<h1>Country guide unavailable</h1><p>Browse our <a href="/destinations">East Africa destinations</a>.</p>'; return page; }
    const name = first(data.name, data.title, country[1]), description = first(data.seo_description, data.meta_description, data.short_description, data.tagline, data.description, "Explore travel highlights and places to visit in " + name + " with Altuvera Safaris.");
    const destinations = arr(data.destinations), only = Boolean(country[2]);
    page.title = (only ? "Destinations in " + name : "Explore " + name) + " | Altuvera Safaris"; page.description = only ? "Browse destinations, national parks and travel experiences in " + name + " with Altuvera Safaris." : description; page.image = imageOf(data); page.type = "TouristDestination";
    page.body = '<h1>' + esc(only ? "Destinations in " + name : name + " Travel Guide") + '</h1><p>' + esc(description) + '</p>' + listHtml(destinations, "/destinations/", "Destinations in " + name) + '<p><a href="/destinations">Explore all East Africa destinations</a></p>'; return page;
  }
  const dest = route.match(/^\/destinations\/([^/]+)$/i);
  if (dest) {
    const data = await fetchDestination(dest[1]);
    if (!data.name && !data.title) { page.title = "Destination Guide | Altuvera Safaris"; page.description = "Explore East African destinations with Altuvera Safaris."; page.noindex = true; page.status = 404; page.body = '<h1>Destination unavailable</h1><p>Browse our <a href="/destinations">East Africa destinations</a>.</p>'; return page; }
    const name = first(data.name, data.title, dest[1]), countryName = first(data.country_name, data.countryName, data.country), description = first(data.seo_description, data.meta_description, data.short_description, data.shortDescription, data.description, data.overview, "Discover " + name + " with Altuvera Safaris.");
    const highlights = arr(data.highlights || data.activities || data.experiences).slice(0, 12), itinerary = arr(data.itinerary).slice(0, 7);
    page.title = first(data.meta_title, data.seo_title, name + (countryName ? " in " + countryName : "") + " | Altuvera Safaris"); page.description = description; page.image = imageOf(data); page.type = "TouristDestination";
    page.body = '<h1>' + esc(name) + '</h1>' + (countryName ? '<p class="eyebrow">' + esc(countryName) + ' · East Africa</p>' : "") + '<p>' + esc(description) + '</p>' + (highlights.length ? '<h2>Highlights and experiences</h2><ul>' + highlights.map((v) => '<li>' + esc(textOf(v, 600)) + '</li>').join("") + '</ul>' : "") + (itinerary.length ? '<h2>Suggested itinerary</h2>' + itinerary.map((v, i) => '<article><h3>' + esc(first(v.title, "Day " + (v.dayNumber || v.day_number || i + 1))) + '</h3><p>' + esc(first(v.description, v.activities)) + '</p></article>').join("") : "") + '<p><a href="/destinations">Browse all destinations</a></p>'; return page;
  }
  const post = route.match(/^\/post\/([^/]+)$/i);
  if (post) {
    const livePost = unwrap(await fetchJson("/posts/" + encodeURIComponent(post[1])), "post");
    const data = (livePost && (livePost.title || livePost.name)) ? livePost : (Array.isArray(postsFallback) ? postsFallback.find((item) => String(item.slug || "").toLowerCase() === String(post[1]).toLowerCase()) : null) || {};
    if (!data.title && !data.name) { page.title = "Travel Article | Altuvera Safaris"; page.description = "Read travel guides and stories from Altuvera Safaris."; page.noindex = true; page.status = 404; page.body = '<h1>Article unavailable</h1><p>Visit the <a href="/posts">Altuvera travel journal</a>.</p>'; return page; }
    const title = first(data.meta_title, data.title), description = first(data.meta_description, data.excerpt, data.short_description, data.description, "Read this Altuvera Safaris travel guide for destination ideas and practical travel advice.");
    page.title = title + (/\baltuvera\b/i.test(title) ? "" : " | Altuvera Safaris"); page.description = description; page.image = imageOf(data); page.type = "BlogPosting"; page.author = first(data.author_name, data.author, data.writer); page.published = first(data.published_at, data.publishedAt, data.date);
    page.body = '<article><h1>' + esc(first(data.title, title)) + '</h1><p class="eyebrow">' + esc(first(data.category, "Travel journal")) + (page.author ? " · " + esc(page.author) : "") + '</p>' + (page.image !== LOGO ? '<img class="hero" src="' + esc(page.image) + '" alt="' + esc(title) + '">' : "") + '<p class="lead">' + esc(description) + '</p>' + (first(data.content, data.body, data.article_body) ? '<h2>Article</h2><p>' + esc(first(data.content, data.body, data.article_body).slice(0, 12000)) + '</p>' : "") + '</article><p><a href="/posts">More travel guides and stories</a></p>'; return page;
  }
  const pkg = route.match(/^\/packages\/([^/]+)$/i);
  if (pkg) {
    const data = unwrap(await fetchJson("/packages/slug/" + encodeURIComponent(pkg[1])), "package");
    if (!data.title && !data.name) { page.title = "Safari Package | Altuvera Safaris"; page.description = "Explore Altuvera Safaris travel packages."; page.noindex = true; page.status = 404; page.body = '<h1>Package unavailable</h1><p>Browse <a href="/packages">all safari packages</a>.</p>'; return page; }
    const name = first(data.title, data.name), description = first(data.meta_description, data.short_description, data.description, "Discover " + name + " with Altuvera Safaris.");
    const highlights = arr(data.highlights || data.features).slice(0, 10);
    page.title = first(data.meta_title, name + " | East Africa Safari Package | Altuvera Safaris"); page.description = description; page.image = imageOf(data); page.type = "TouristTrip";
    page.body = '<h1>' + esc(name) + '</h1><p>' + esc(description) + '</p>' + (first(data.destination_name, data.destination) ? '<p class="eyebrow">Destination: ' + esc(first(data.destination_name, data.destination)) + '</p>' : "") + (highlights.length ? '<h2>Experience highlights</h2><ul>' + highlights.map((v) => '<li>' + esc(textOf(v, 600)) + '</li>').join("") + '</ul>' : "") + '<p><a href="/booking">Request this travel experience</a> · <a href="/packages">Explore all packages</a></p>'; return page;
  }
  if (route === "/destinations" || route === "/packages" || route === "/posts" || route === "/tips") {
    const destList = route === "/destinations", pkgList = route === "/packages", postList = route === "/posts" || route === "/tips";
    const response = await fetchJson(destList ? "/destinations?limit=50&sort=popular" : pkgList ? "/packages?page=1&limit=40&sort=latest" : "/posts?limit=40");
    const liveItems = rows(response), items = liveItems.length ? liveItems : (postList && Array.isArray(postsFallback) ? postsFallback : []), details = STATIC[route];
    page.title = details[0]; page.description = details[1];
    const label = destList ? "Safari destinations" : pkgList ? "Published safari packages" : "Travel stories and guides";
    page.body = '<h1>' + esc(details[0].replace(" | Altuvera Safaris", "")) + '</h1><p>' + esc(details[1]) + '</p>' + listHtml(items, destList ? "/destinations/" : pkgList ? "/packages/" : "/post/", label); return page;
  }
  const details = STATIC[route];
  if (details) {
    page.title = details[0]; page.description = details[1];
    const links = route === "/" ? [["Explore destinations", "/destinations"], ["Safari packages", "/packages"], ["Travel journal", "/posts"], ["Our services", "/services"], ["About Altuvera", "/about"], ["Contact our team", "/contact"]] : [];
    page.body = '<h1>' + esc(details[0].replace(" | Altuvera Safaris", "")) + '</h1><p>' + esc(details[1]) + '</p>' + (links.length ? '<nav aria-label="Explore Altuvera"><ul>' + links.map((v) => '<li><a href="' + esc(v[1]) + '">' + esc(v[0]) + '</a></li>').join("") + '</ul></nav>' : ""); return page;
  }
  page.title = "Page Not Found | Altuvera Safaris"; page.description = "The requested Altuvera Safaris page could not be found."; page.noindex = true; page.status = 404; page.body = '<h1>Page not found</h1><p>Visit the <a href="/">Altuvera Safaris homepage</a> or explore <a href="/destinations">East Africa destinations</a>.</p>'; return page;
};
const schema = (page, canonical) => {
  const organizationId = SITE + "/#organization";
  const websiteId = SITE + "/#website";
  const webpageId = canonical + "#webpage";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    "name": "Altuvera Safaris",
    "url": SITE + "/",
    "logo": { "@type": "ImageObject", "url": LOGO },
    "email": "info@altuverasafaris.com",
    "telephone": "+250785751391"
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    "url": SITE + "/",
    "name": "Altuvera Safaris",
    "publisher": { "@id": organizationId },
    "inLanguage": "en"
  };
  const pageEntity = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webpageId,
    "url": canonical,
    "name": page.title,
    "description": page.description,
    "isPartOf": { "@id": websiteId },
    "publisher": { "@id": organizationId },
    "mainEntity": page.type && page.type !== "WebPage"
      ? { "@id": canonical + (page.type === "BlogPosting" ? "#article" : page.type === "TouristDestination" ? "#destination" : "#trip") }
      : undefined
  };
  const data = [organization, website, pageEntity];
  if (page.type && page.type !== "WebPage") {
    const entity = {
      "@context": "https://schema.org",
      "@type": page.type,
      "@id": canonical + (page.type === "BlogPosting" ? "#article" : page.type === "TouristDestination" ? "#destination" : "#trip"),
      "name": page.title,
      "description": page.description,
      "image": page.image,
      "mainEntityOfPage": { "@id": webpageId }
    };
    if (page.type === "BlogPosting") {
      if (page.author) entity.author = { "@type": "Person", "name": page.author };
      if (page.published) entity.datePublished = page.published;
      entity.publisher = { "@id": organizationId };
    }
    data.push(entity);
  }
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
};
const htmlDocument = (page, canonical) => {
  const robots = page.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
  const image = page.image || LOGO;
  const crumb = '<nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/destinations">East Africa</a></nav>';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(page.title) + '</title><meta name="description" content="' + esc(page.description) + '">' +
    '<meta name="robots" content="' + robots + '"><meta name="googlebot" content="' + robots + '">' +
    '<link rel="canonical" href="' + esc(canonical) + '"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#087a50">' +
    '<meta property="og:type" content="' + (page.type === "BlogPosting" ? "article" : "website") + '"><meta property="og:site_name" content="Altuvera Safaris"><meta property="og:url" content="' + esc(canonical) + '">' +
    '<meta property="og:title" content="' + esc(page.title) + '"><meta property="og:description" content="' + esc(page.description) + '"><meta property="og:image" content="' + esc(image) + '">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(page.title) + '"><meta name="twitter:description" content="' + esc(page.description) + '"><meta name="twitter:image" content="' + esc(image) + '">' +
    '<script type="application/ld+json">' + schema(page, canonical) + '</script><style>' +
    ':root{font-family:Inter,Arial,sans-serif;color:#17251c;background:#f7faf7}*{box-sizing:border-box}body{margin:0}header,footer{background:#fff;border-bottom:1px solid #e3ece5}.top{max-width:1040px;margin:auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{color:#155d2c;font-weight:800;text-decoration:none}.top nav{display:flex;flex-wrap:wrap;gap:18px}a{color:#166534;text-decoration:none}main{max-width:1040px;margin:auto;padding:46px 24px;min-height:68vh}.crumb{display:flex;gap:10px;font-size:13px;color:#6b7a6e;margin-bottom:26px}h1{font-size:clamp(30px,5vw,48px);line-height:1.12;color:#123c23;margin:0 0 18px}h2{font-size:23px;color:#17472a;margin:34px 0 16px}p{max-width:780px;line-height:1.8;color:#425247;font-size:17px}.eyebrow{font-size:13px;font-weight:700;color:#31824b}.hero{display:block;width:min(100%,820px);max-height:460px;object-fit:cover;border-radius:18px;margin:24px 0}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{background:#fff;border:1px solid #e1ebe3;border-radius:14px;overflow:hidden}.card a{display:flex;align-items:center;gap:14px;padding:12px;color:#1c3927}.card img{width:88px;height:76px;border-radius:9px;object-fit:cover;flex:none}.card span{display:grid;gap:6px}.card small{line-height:1.5;color:#66756a}ul{padding-left:22px;color:#425247;line-height:1.85}footer{border-top:1px solid #e1ebe3;padding:24px}footer div{max-width:1040px;margin:auto;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;color:#66756a}@media(max-width:600px){.top{align-items:flex-start;flex-direction:column}.top nav{gap:12px}main{padding:32px 18px}}</style>' +
    '</head><body><header><div class="top"><a class="brand" href="/">ALTUVERA SAFARIS</a><nav aria-label="Main navigation"><a href="/destinations">Destinations</a><a href="/packages">Packages</a><a href="/services">Services</a><a href="/posts">Travel Journal</a><a href="/contact">Contact</a></nav></div></header>' +
    '<main id="main-content">' + crumb + page.body + '</main><footer><div><span>Altuvera Safaris · True Adventure in High Places &amp; Deep Culture</span><span><a href="/about">About</a> · <a href="/contact">Contact</a> · <a href="/privacy">Privacy</a></span></div></footer></body></html>';
};
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") { res.setHeader("Allow", "GET, HEAD"); return res.status(405).send("Method not allowed"); }
  let raw = String(req.query && req.query.path || "/");
  try { raw = new URL(raw, SITE).pathname; } catch { raw = "/"; }
  if (!raw.startsWith("/") || raw.startsWith("//")) raw = "/";
  let pathname = raw.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  const page = await render(pathname);
  const canonical = SITE + (pathname === "/" ? "/" : pathname);
  const output = htmlDocument(page, canonical);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.setHeader("Vary", "User-Agent");
  if (page.noindex) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(page.status || 200).send(req.method === "HEAD" ? "" : output);
}
