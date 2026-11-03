import { countries } from '../data/countries.js';

const getFallbackCountry = (slug) => {
  if (!slug || typeof slug !== 'string') return null;
  
  // Normalize slug for comparison (trim, lowercase)
  const normalizedSlug = slug.trim().toLowerCase();
  
  // Find exact match by id/slug field
  // Static country records are reference content, not proof of a live offering.
  // Only records explicitly marked active may be used as a fallback.
  const country = countries.find(c => {
    const active = c?.is_active === true || c?.isActive === true;
    return active && (
      (c.id && c.id.toLowerCase() === normalizedSlug) ||
      (c.slug && c.slug.toLowerCase() === normalizedSlug)
    );
  });
  
  return country ? { 
    ...country, 
    fallback: true,
    dataSource: 'static-fallback'
  } : null;
};

export { getFallbackCountry, countries };

