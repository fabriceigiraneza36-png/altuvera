import { destinations } from '../data/destinations';

// Common URL typos and their corrections
const URL_CORRECTIONS = {
  // Home page variations
  '/home': '/',
  '/index': '/',
  '/index.html': '/',
  
  // Destination typos
  '/destinations': '/destinations',
  '/destionation': '/destinations',
  '/destinaion': '/destinations',
  '/destinatios': '/destinations',
  '/destinaton': '/destinations',
  '/destinattions': '/destinations',
  '/destination': '/destinations',
  
  // Explore typos
  '/explore': '/explore',
  '/exlpore': '/explore',
  '/exprore': '/explore',
  '/exlore': '/explore',
  
  // Services typos
  '/services': '/services',
  '/service': '/services',
  '/servcies': '/services',
  '/servies': '/services',
  '/servics': '/services',
  
  // About typos
  '/about': '/about',
  '/aboutus': '/about',
  '/about-us': '/about',
  '/about_us': '/about',
  '/aubout': '/about',
  
  // Contact typos
  '/contact': '/contact',
  '/contat': '/contact',
  '/conact': '/contact',
  '/cntact': '/contact',
  '/contct': '/contact',
  
  // Booking typos
  '/booking': '/booking',
  '/bookin': '/booking',
  '/bokking': '/booking',
  '/bookng': '/booking',
  '/reservations': '/booking',
  
  // Gallery typos
  '/gallery': '/gallery',
  '/galery': '/gallery',
  '/galley': '/gallery',
  '/galler': '/gallery',
  '/gallry': '/gallery',
  
  // Tips/Blog typos
  '/tips': '/tips',
  '/blog': '/tips',
  '/posts': '/posts',
  '/post': '/posts',
  '/article': '/tips',
  '/articles': '/tips',
  
  // Interactive map typos
  '/map': '/interactive-map',
  '/interactive-map': '/interactive-map',
  '/interactivemap': '/interactive-map',
  '/intractive-map': '/interactive-map',
  
  // Virtual tour typos
  '/virtual-tour': '/virtual-tour',
  '/virtualtour': '/virtual-tour',
  '/vtour': '/virtual-tour',
  
  // Team typos
  '/team': '/team',
  '/teams': '/team',
  '/staff': '/team',
  '/guides': '/team',
  
  // FAQ typos
  '/faq': '/faq',
  '/faqs': '/faq',
  '/questions': '/faq',
  '/help': '/faq',
  
  // Privacy & Terms
  '/privacy': '/privacy',
  '/privacy-policy': '/privacy',
  '/terms': '/terms',
  '/terms-of-service': '/terms',
  '/tos': '/terms',
  
  // Payment
  '/payment': '/payment-terms',
  '/payment-terms': '/payment-terms',
  '/paymentterms': '/payment-terms',
  
  // Auth typos
  '/login': '/',
  '/signin': '/',
  '/signup': '/',
  '/register': '/',
  '/auth': '/',
  
  // Profile pages
  '/profile': '/profile',
  '/my-bookings': '/my-bookings',
  '/mybookings': '/my-bookings',
  '/bookings': '/my-bookings',
  '/wishlist': '/wishlist',
  '/favorites': '/wishlist',
  '/settings': '/settings',
};

// Country aliases - map various URLs to country pages
const COUNTRY_ALIASES = {
  '/kenya': '/country/kenya',
  '/tanzania': '/country/tanzania',
  '/uganda': '/country/uganda',
  '/rwanda': '/country/rwanda',
  '/ethiopia': '/country/ethiopia',
  '/djibouti': '/country/djibouti',
  '/serengeti': '/country/tanzania',
  '/masai-mara': '/country/kenya',
  '/masaimara': '/country/kenya',
  '/mara': '/country/kenya',
  '/zanzibar': '/country/tanzania',
  '/ngorongoro': '/country/tanzania',
  '/ Amboseli': '/country/kenya',
  '/tsavo': '/country/kenya',
  '/mount-kilimanjaro': '/country/tanzania',
  '/kilimanjaro': '/country/tanzania',
  '/kili': '/country/tanzania',
  '/virunga': '/country/drc',
  '/gorilla': '/country/uganda',
  '/gorillas': '/country/uganda',
  '/bwindi': '/country/uganda',
  '/mgahinga': '/country/uganda',
  '/volcanoes': '/country/rwanda',
};

// Levenshtein distance for fuzzy matching
const levenshteinDistance = (a, b) => {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

// Find closest matching route
const findClosestRoute = (pathname, routes) => {
  const normalizedPath = pathname.toLowerCase().replace(/\/$/, '');
  let bestMatch = null;
  let bestDistance = Infinity;
  
  for (const route of routes) {
    const normalizedRoute = route.toLowerCase().replace(/\/$/, '');
    const distance = levenshteinDistance(normalizedPath, normalizedRoute);
    
    // Also check if pathname starts with route (for sub-routes)
    const startsWithDistance = normalizedPath.startsWith(normalizedRoute) 
      ? Math.max(0, normalizedPath.length - normalizedRoute.length) * 0.1 
      : Infinity;
    
    const finalDistance = Math.min(distance, startsWithDistance);
    
    if (finalDistance < bestDistance) {
      bestDistance = finalDistance;
      bestMatch = route;
    }
  }
  
  // Only return if distance is reasonable (threshold based on path length)
  const threshold = Math.max(3, normalizedPath.length * 0.4);
  return bestDistance <= threshold ? bestMatch : null;
};

// Main redirect function
export const getRedirectUrl = (pathname) => {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, '');
  
  // 1. Check exact matches in URL corrections
  if (URL_CORRECTIONS[normalizedPath]) {
    return URL_CORRECTIONS[normalizedPath];
  }
  
  // 2. Check exact matches in country aliases
  if (COUNTRY_ALIASES[normalizedPath]) {
    return COUNTRY_ALIASES[normalizedPath];
  }
  
  // 3. Check for destination slugs
  const destinationMatch = destinations.find(
    d => `/${d.slug}` === normalizedPath || `/destination/${d.slug}` === normalizedPath
  );
  if (destinationMatch) {
    return `/destination/${destinationMatch.slug}`;
  }
  
  // 4. Check for post slugs
  // (You can add posts data here if available)
  
  // 5. Fuzzy match against known routes
  const knownRoutes = [
    '/',
    '/destinations',
    '/explore',
    '/services',
    '/about',
    '/contact',
    '/booking',
    '/gallery',
    '/tips',
    '/posts',
    '/interactive-map',
    '/virtual-tour',
    '/team',
    '/faq',
    '/privacy',
    '/terms',
    '/payment-terms',
    '/profile',
    '/my-bookings',
    '/wishlist',
    '/settings',
    '/country/kenya',
    '/country/tanzania',
    '/country/uganda',
    '/country/rwanda',
    '/country/ethiopia',
    '/country/djibouti',
  ];
  
  const closestRoute = findClosestRoute(normalizedPath, knownRoutes);
  if (closestRoute && closestRoute !== normalizedPath) {
    return closestRoute;
  }
  
  // No redirect needed
  return null;
};

// Check if a path needs redirect
export const needsRedirect = (pathname) => {
  return getRedirectUrl(pathname) !== null;
};

// Get all known routes for sitemap/validation
export const getAllKnownRoutes = () => [
  '/',
  '/destinations',
  '/explore',
  '/services',
  '/about',
  '/contact',
  '/booking',
  '/gallery',
  '/tips',
  '/posts',
  '/interactive-map',
  '/virtual-tour',
  '/team',
  '/faq',
  '/privacy',
  '/terms',
  '/payment-terms',
  '/profile',
  '/my-bookings',
  '/wishlist',
  '/settings',
];

// Route preloading helper
export const preloadRoute = (pathname) => {
  const runLoader = (loader) => {
    if (typeof loader !== 'function') return null;
    if (typeof loader.preload === 'function') return loader.preload();
    return loader();
  };

  // Map pathname to the component that needs to be loaded
  const routeToComponent = {
    '/': () => import('../pages/Home'),
    '/destinations': () => import('../pages/Destinations'),
    '/explore': () => import('../pages/Explore'),
    '/services': () => import('../pages/Services'),
    '/about': () => import('../pages/About'),
    '/contact': () => import('../pages/Contact'),
    '/booking': () => import('../pages/Booking'),
    '/gallery': () => import('../pages/Gallery'),
    '/tips': () => import('../pages/Tips'),
    '/posts': () => import('../pages/Posts'),
    '/interactive-map': () => import('../pages/InteractiveMap'),
    '/virtual-tour': () => import('../pages/VirtualTour'),
    '/team': () => import('../pages/Team'),
    '/faq': () => import('../pages/FAQ'),
    '/privacy': () => import('../pages/PrivacyPolicy'),
    '/terms': () => import('../pages/TermsOfService'),
    '/payment-terms': () => import('../pages/PaymentTerms'),
    '/profile': () => import('../pages/auth/UserProfile'),
    '/my-bookings': () => import('../pages/auth/MyBookings'),
    '/wishlist': () => import('../pages/auth/Wishlist'),
    '/settings': () => import('../pages/auth/UserSettings'),
  };

  const normalizedPath = pathname.toLowerCase().replace(/\/$/, '');
  
  // Check for country routes
  if (normalizedPath.startsWith('/country/')) {
    const loader = routeToComponent['/destinations'];
    if (loader) {
      runLoader(loader);
    }
    return;
  }
  
  // Check for destination routes
  if (normalizedPath.startsWith('/destination/')) {
    const loader = routeToComponent['/destinations'];
    if (loader) {
      runLoader(loader);
    }
    return;
  }
  
  // Check for post routes
  if (normalizedPath.startsWith('/post/')) {
    const loader = routeToComponent['/posts'];
    if (loader) {
      runLoader(loader);
    }
    return;
  }

  // Check exact match or prefix match for country pages
  const loader = routeToComponent[normalizedPath];
  if (loader) {
    runLoader(loader);
  }
};
