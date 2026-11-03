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
  const siteName = "Altuvera Safaris";
  const baseUrl = getSiteUrl();
  const fullTitle = withBrand(title || siteName);
  const fullDescription = toMetaDescription(description || DEFAULT_SEO_DESCRIPTION);
  const fullImage = toAbsoluteUrl(image || BRAND_LOGO_PATH);
  const canonicalUrl = toAbsoluteUrl(canonical || url || location.pathname || "/");
  const keywordList = Array.isArray(keywords) ? keywords : keywords ? [keywords] : [];
  const tagList = Array.isArray(tags) ? tags : [];

  const structuredDataArray = [];
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
        item: toAbsoluteUrl(crumb.url),
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
      <meta property="og:image:alt" content={fullTitle + " — Altuvera Safaris"} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@altuverasafari" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle + " — Altuvera Safaris"} />

      {structuredDataArray.map((data, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
