import React from 'react';
import { Helmet } from 'react-helmet-async';
import { JsonLd } from 'react-schemaorg';
import { WebSite, Organization, BreadcrumbList, ListItem } from 'schema-dts';

const SEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
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
  const siteName = 'Altuvеrа';
  const defaultDescription = 'Discover extraordinary destinations and create unforgettable travel experiences with Altuvеrа. Expert travel planning, virtual tours, and personalized itineraries for your dream adventures.';
  const defaultImage = 'https://altuvera.vercel.app/og-image.jpg';
  const baseUrl = 'https://altuvera.vercel.app';

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || defaultDescription;
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
  const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;

  // Generate structured data
  const generateStructuredData = () => {
    const data = [];

    // Website structured data
    data.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
      description: defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/explore?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
    });

    // Organization structured data
    data.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: defaultDescription,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
      sameAs: [
        'https://facebook.com/altuvera',
        'https://twitter.com/altuvera',
        'https://instagram.com/altuvera',
        'https://linkedin.com/company/altuvera',
      ],
    });

    // Article/BlogPost structured data if applicable
    if (type === 'article' && (published || modified)) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPost',
        headline: title,
        description: fullDescription,
        image: fullImage,
        url: fullUrl,
        datePublished: published,
        dateModified: modified || published,
        author: {
          '@type': 'Organization',
          name: siteName,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': fullUrl,
        },
        articleSection: section,
        keywords: tags?.join(', '),
      });
    }

    // Breadcrumbs structured data
    if (breadcrumbs && breadcrumbs.length > 0) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
        })),
      });
    }

    // Custom structured data
    if (structuredData) {
      data.push(...(Array.isArray(structuredData) ? structuredData : [structuredData]));
    }

    return data;
  };

  const structuredDataArray = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      {section && <meta name="article:section" content={section} />}
      {tags && tags.length > 0 && <meta name="article:tag" content={tags.join(', ')} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@altuvera" />
      <meta name="twitter:creator" content="@altuvera" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1a365d" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />

      {/* Performance and Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />

      {/* Article specific meta tags */}
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Structured Data */}
      {structuredDataArray.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;