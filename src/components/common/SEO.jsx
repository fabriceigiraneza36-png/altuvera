import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  BRAND_LOGO_PATH,
  DEFAULT_SEO_DESCRIPTION,
  getSiteUrl,
  toAbsoluteUrl,
  toMetaDescription,
  withBrand,
} from "../../utils/seo";

const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  structuredData,
  breadcrumbs,
  canonical,
  keywords,
  author,
  published,
  modified,
  section,
  tags,
}) => {
  const location = useLocation();
  const siteName = "Altuvera";
const COUNTRY_SEO = {
  rwanda: {
    name: "Rwanda",
    title: "Rwanda Safaris & Gorilla Trekking",
    description: "Discover Rwanda gorilla trekking in Volcanoes National Park, Akagera wildlife safaris and Nyungwe Forest with Altuvera. Plan a tailor-made Rwanda journey.",
    keywords: ["Rwanda safaris", "gorilla trekking Rwanda", "Volcanoes National Park", "Rwanda wildlife tours"],
  },
  uganda: {
    name: "Uganda",
    title: "Uganda Safaris & Gorilla Trekking",
    description: "Discover Uganda gorilla trekking in Bwindi, Queen Elizabeth National Park wildlife safaris and tailor-made journeys with Altuvera.",
    keywords: ["Uganda safaris", "gorilla trekking Uganda", "Bwindi Impenetrable Forest", "Uganda wildlife tours"],
  },
  tanzania: {
    name: "Tanzania",
    title: "Tanzania Safaris, Kilimanjaro & Zanzibar",
    description: "Explore Tanzania safaris in the Serengeti and Ngorongoro, Kilimanjaro trekking and Zanzibar escapes with Altuvera.",
    keywords: ["Tanzania safaris", "Serengeti safaris", "Ngorongoro Crater", "Kilimanjaro trekking"],
  },
  kenya: {
    name: "Kenya",
    title: "Kenya Safaris & Maasai Mara Wildlife",
    description: "Plan Kenya safaris in the Maasai Mara and Amboseli, with wildlife encounters and tailor-made East African journeys from Altuvera.",
    keywords: ["Kenya safaris", "Maasai Mara safaris", "Amboseli National Park", "Kenya wildlife tours"],
  },
  ethiopia: {
    name: "Ethiopia",
    title: "Ethiopia Tours, Highlands & Cultural Journeys",
    description: "Discover Ethiopia's highlands, Lalibela's heritage and the Simien Mountains with Altuvera. Plan a tailor-made journey with local insight.",
    keywords: ["Ethiopia tours", "Lalibela", "Simien Mountains", "Ethiopia cultural travel"],
  },
};

const normalizeCountryCanonical = (value) => {
  const raw = String(value || "/");
  try {
    const parsed = new URL(raw, getSiteUrl());
    parsed.pathname = parsed.pathname.replace(/^\/country\/([^/]+)\/?$/i, (_match, slug) => {
      return /^\d+$/.test(slug) ? "/country/" + slug : "/country/" + slug.toLowerCase();
    });
    parsed.search = "";
    parsed.hash = "";
    return parsed.origin === new URL(getSiteUrl()).origin ? parsed.pathname : parsed.toString();
  } catch {
    return raw.replace(/^\/country\/([^/]+)\/?$/i, (_match, slug) => "/country/" + slug.toLowerCase());
  }
};
  const baseUrl = getSiteUrl();
  const countrySeo = (() => {
    const match = location.pathname.match(/^\/country\/([^/]+)\/?$/i);
    if (!match) return null;
    return COUNTRY_SEO[match[1].toLowerCase()] || null;
  })();
  const requestedCanonical = canonical || url || location.pathname || "/";
  const canonicalPath = normalizeCountryCanonical(requestedCanonical);
  const fullTitle = withBrand(countrySeo?.title || title || siteName);
  const fullDescription = toMetaDescription(countrySeo?.description || description || DEFAULT_SEO_DESCRIPTION);
  const fullImage = toAbsoluteUrl(image || BRAND_LOGO_PATH);
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const suppliedKeywords = Array.isArray(keywords) ? keywords : keywords ? [keywords] : [];
  const keywordList = [...new Set([...suppliedKeywords, ...(countrySeo?.keywords || [])].filter(Boolean))];
  const tagList = Array.isArray(tags) ? tags : [];

  const structuredDataArray = [];
  if (countrySeo) {
    structuredDataArray.push({
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: countrySeo.name,
      description: fullDescription,
      url: canonicalUrl,
      image: fullImage,
    });
  }
  if (type === "article" && published) {
    structuredDataArray.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title || fullTitle,
      description: fullDescription,
      image: [fullImage],
      url: canonicalUrl,
      datePublished: published,
      ...(modified ? { dateModified: modified } : {}),
      ...(author ? { author: { "@type": "Person", name: author } } : {}),
      publisher: {
        "@type": "Organization",
        "@id": baseUrl + "/#organization",
        name: siteName,
        logo: {
          "@type": "ImageObject",
          url: baseUrl + BRAND_LOGO_PATH,
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      ...(section ? { articleSection: section } : {}),
      ...(tagList.length ? { keywords: tagList.join(", ") } : {}),
    });
  }

  if (Array.isArray(breadcrumbs) && breadcrumbs.length) {
    const items = breadcrumbs
      .filter((crumb) => crumb && crumb.name && crumb.url)
      .map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: toAbsoluteUrl(normalizeCountryCanonical(crumb.url)),
      }));
    if (items.length) {
      structuredDataArray.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items,
      });
    }
  }

  if (structuredData) {
    structuredDataArray.push(
      ...(Array.isArray(structuredData) ? structuredData : [structuredData]),
    );
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {keywordList.length > 0 && <meta name="keywords" content={keywordList.join(", ")} />}
      {author && <meta name="author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tagList.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}

      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={fullTitle + " — Altuvera"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@altuverasafari" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle + " — Altuvera"} />

      {structuredDataArray.map((data, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
