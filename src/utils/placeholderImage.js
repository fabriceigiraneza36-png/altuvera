// src/utils/placeholderImage.js
// ─────────────────────────────────────────────────────────────────────────────
// Reliable placeholder images — replaces broken via.placeholder.com
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a reliable placeholder image URL
 * Uses multiple fallback services
 */
export const getPlaceholderImage = (
  width = 800,
  height = 600,
  text = "Altuvera",
  options = {}
) => {
  const {
    bg = "059669",      // Green background
    color = "ffffff",   // White text
    service = "auto",   // auto | picsum | placehold | svg
  } = options;

  // ✅ Option 1: placehold.co (most reliable, actively maintained)
  if (service === "placehold" || service === "auto") {
    return `https://placehold.co/${width}x${height}/${bg}/${color}?text=${encodeURIComponent(text)}`;
  }

  // ✅ Option 2: Picsum Photos (beautiful random nature photos - perfect for travel)
  if (service === "picsum") {
    return `https://picsum.photos/${width}/${height}`;
  }

  // ✅ Option 3: Inline SVG data URL (always works, no network needed)
  if (service === "svg") {
    return generateSvgPlaceholder(width, height, text, bg, color);
  }

  // Default: placehold.co
  return `https://placehold.co/${width}x${height}/${bg}/${color}?text=${encodeURIComponent(text)}`;
};

/**
 * Generate inline SVG placeholder (no network required)
 */
export const generateSvgPlaceholder = (
  width = 800,
  height = 600,
  text = "Altuvera",
  bg = "059669",
  color = "ffffff"
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bg}"/>
      <text
        x="50%" y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="${Math.max(14, Math.min(width / 10, 48))}px"
        font-weight="600"
        fill="#${color}"
        opacity="0.85"
      >${text}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Preset placeholders for common use cases
 */
export const PLACEHOLDERS = {
  destination: (text = "Destination") =>
    getPlaceholderImage(800, 600, text),

  country: (text = "Country") =>
    getPlaceholderImage(1200, 800, text),

  hero: (text = "Altuvera Safaris") =>
    getPlaceholderImage(1920, 1080, text, { bg: "1a1a2e", color: "ffffff" }),

  card: (text = "Safari") =>
    getPlaceholderImage(400, 300, text),

  avatar: (text = "User") =>
    getPlaceholderImage(200, 200, text, { bg: "6b7280", color: "ffffff" }),

  gallery: (text = "Photo") =>
    `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`,

  post: (text = "Article") =>
    getPlaceholderImage(1200, 630, text),

  team: (text = "Team") =>
    getPlaceholderImage(400, 400, text, { bg: "374151", color: "f9fafb" }),
};

/**
 * Smart image component handler — falls back gracefully
 */
export const handleImageError = (
  event,
  fallbackText = "Altuvera",
  width = 800,
  height = 600
) => {
  const img = event.currentTarget || event.target;
  if (!img) return;

  // Prevent infinite loop
  if (img.dataset.fallback === "true") return;
  img.dataset.fallback = "true";

  // Use inline SVG — never fails
  img.src = generateSvgPlaceholder(width, height, fallbackText);
  img.onerror = null;
};

export default getPlaceholderImage;