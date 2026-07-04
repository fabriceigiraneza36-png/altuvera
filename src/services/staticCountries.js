import { countries } from '../data/countries.js';

const getFallbackCountry = (slug) => {
  if (!slug || typeof slug !== 'string') return null;
  
  // Normalize slug for comparison (trim, lowercase)
  const normalizedSlug = slug.trim().toLowerCase();
  
  // Find exact match by id/slug field
  const country = countries.find(c => 
    (c.id && c.id.toLowerCase() === normalizedSlug) ||
    (c.slug && c.slug.toLowerCase() === normalizedSlug)
  );
  
  return country ? { 
    ...country, 
    fallback: true,
    dataSource: 'static-fallback'
  } : null;
};

export { getFallbackCountry, countries };

