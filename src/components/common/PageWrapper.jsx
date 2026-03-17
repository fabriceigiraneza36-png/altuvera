import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getBrandLogoUrl, toAbsoluteUrl } from "../../utils/seo";

const DEFAULT_DESCRIPTION =
  "Book authentic East African safaris and cultural tours with Altuvera. Expert-guided adventures across Kenya, Tanzania, Uganda, Rwanda, and Ethiopia.";

const withBrand = (title) => {
  const t = String(title || "").trim();
  if (!t) return "Altuvera";
  if (/altuvera/i.test(t)) return t;
  return `${t} | Altuvera`;
};

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
      </Helmet>
      {children}
    </>
  );
};

export default PageWrapper;

