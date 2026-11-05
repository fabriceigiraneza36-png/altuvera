import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_SEO_DESCRIPTION,
  getRouteSeoDescription,
  getSiteUrl,
  getBrandLogoUrl,
  toAbsoluteUrl,
  toMetaDescription,
  withBrand,
} from "../../utils/seo";

const PageWrapper = ({
  title,
  description,
  image,
  canonical,
  noindex = false,
  children,
}) => {
  const location = useLocation();
  const baseUrl = getSiteUrl();
  const metaTitle = withBrand(title || "Altuvera");
  const routeDescription = getRouteSeoDescription(location.pathname, title);
  const metaDescription = toMetaDescription(description || routeDescription || DEFAULT_SEO_DESCRIPTION);
  const metaImage = image ? toAbsoluteUrl(image) : getBrandLogoUrl();

  // Canonicals describe the clean page URL, not tracking parameters or fragments.
  const canonicalInput = canonical || location.pathname || "/";
  let canonicalUrl = toAbsoluteUrl(canonicalInput);
  try {
    const parsed = new URL(canonicalUrl, baseUrl + "/");
    parsed.search = "";
    parsed.hash = "";
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    canonicalUrl = parsed.toString();
  } catch {
    canonicalUrl = toAbsoluteUrl(location.pathname || "/");
  }

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl + "#webpage",
    name: metaTitle,
    description: metaDescription,
    url: canonicalUrl,
    isPartOf: { "@id": baseUrl + "/#website" },
    publisher: { "@id": baseUrl + "/#organization" },
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta
          name="robots"
          content={
            noindex
              ? "noindex, nofollow"
              : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          }
        />
        <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Altuvera" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:alt" content={metaTitle + " — Altuvera"} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@altuverasafari" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <meta name="twitter:image:alt" content={metaTitle + " — Altuvera"} />
        <meta name="theme-color" content="#087a50" />
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
      </Helmet>
      {children}
    </>
  );
};

export default PageWrapper;
