import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getBrandLogoUrl, toAbsoluteUrl, withBrand } from "../../utils/seo";

const DEFAULT_DESCRIPTION =
  "Book authentic East African safaris and cultural tours with Altuvera. Expert-guided adventures across Rwanda, Tanzania, Uganda, Rwanda, and Ethiopia.";

const PageWrapper = ({
  title,
  description,
  image,
  canonical,
  noindex = false,
  children,
}) => {
  const location = useLocation();
  const url = canonical || toAbsoluteUrl(location.pathname || "/");
  const metaTitle = withBrand(title);
  const metaDescription = String(description || DEFAULT_DESCRIPTION).trim();
  const metaImage = image || getBrandLogoUrl();

  // Generate structured data (JSON-LD) for SEO
  const generateStructuredData = () => {
    // Default to WebPage schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": metaTitle,
      "description": metaDescription,
      "url": url,
      "publisher": {
        "@type": "Organization",
        "name": "Altuvera",
        "logo": {
          "@type": "ImageObject",
          "url": metaImage
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${url}?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    // Adjust schema type based on page content
    if (location.pathname.startsWith('/packages')) {
      schema["@type"] = "ItemList";
      schema["name"] = "Altuvera Travel Packages";
    } else if (location.pathname.startsWith('/destinations')) {
      schema["@type"] = "CollectionPage";
      schema["name"] = "East Africa Travel Destinations";
    } else if (location.pathname.startsWith('/posts') || location.pathname.startsWith('/post/')) {
      schema["@type"] = "Blog";
      schema["name"] = "Altuvera Travel Blog";
    } else if (location.pathname === '/' || location.pathname === '') {
      schema["@type"] = "WebSite";
      schema["name"] = "Altuvera Safaris";
    }

    return JSON.stringify(schema, null, 2);
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        {metaDescription ? (
          <meta name="description" content={metaDescription} />
        ) : null}
        <link rel="canonical" href={url} />

        <meta
          name="robots"
          content={
            noindex
              ? "noindex, nofollow"
              : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          }
        />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Altuvera" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={metaTitle} />
        {metaDescription ? (
          <meta property="og:description" content={metaDescription} />
        ) : null}
        <meta property="og:image" content={metaImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        {metaDescription ? (
          <meta name="twitter:description" content={metaDescription} />
        ) : null}
        <meta name="twitter:image" content={metaImage} />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {generateStructuredData()}
        </script>
      </Helmet>
      {children}
    </>
  );
};

export default PageWrapper;

