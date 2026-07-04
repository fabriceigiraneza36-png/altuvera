export const SLUG_MAP = {
  'Rwanda': 'rwanda',
  'tanzania': 'tanzania',
  'uganda': 'uganda',
  'rwanda': 'rwanda',
  // Add more mappings as needed
};

export const getCountrySlug = (country) => {
  if (typeof country === 'string') {
    const name = country.trim();
    return SLUG_MAP[name.toLowerCase()] || name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
  }
  return country?.slug || country?.id || 
         getCountrySlug(country?.name || country?.name);
};
