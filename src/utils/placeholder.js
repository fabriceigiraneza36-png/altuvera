// src/utils/placeholder.js
// ─────────────────────────────────────────────────────────────────────────────
// Local SVG placeholder generator — replaces via.placeholder.com
// Zero external requests, works offline, fully customizable
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate an inline SVG data URI placeholder image.
 *
 * @param {object} opts
 * @param {number}  opts.width   - Image width  (default 800)
 * @param {number}  opts.height  - Image height (default 600)
 * @param {string}  opts.text    - Label text   (default "Altuvera")
 * @param {string}  opts.bg      - Background color (default #064e3b)
 * @param {string}  opts.fg      - Text/icon color  (default #6ee7b7)
 * @param {string}  opts.accent  - Accent color for border (default #059669)
 * @returns {string} data URI
 */
export const svgPlaceholder = ({
  width  = 800,
  height = 600,
  text   = "Altuvera",
  bg     = "#064e3b",
  fg     = "#6ee7b7",
  accent = "#059669",
} = {}) => {
  const fontSize = Math.round(Math.min(width, height) / 10);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}dd"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none"
            stroke="${fg}" stroke-width="0.3" opacity="0.15"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Subtle grid -->
  <rect width="${width}" height="${height}" fill="url(#grid)"/>

  <!-- Accent border -->
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}"
        rx="4" fill="none"
        stroke="${accent}" stroke-width="1.5" opacity="0.4"/>

  <!-- Image icon -->
  <g transform="translate(${width / 2}, ${height / 2 - fontSize * 0.8})"
     opacity="0.35">
    <rect x="-28" y="-22" width="56" height="44"
          rx="4" fill="none" stroke="${fg}" stroke-width="2"/>
    <circle cx="-10" cy="-8" r="5" fill="${fg}"/>
    <polyline points="-28,10 -14,-2 -2,8 10,-4 28,10"
              fill="none" stroke="${fg}" stroke-width="2"
              stroke-linejoin="round"/>
  </g>

  <!-- Label text -->
  <text
    x="${width / 2}" y="${height / 2 + fontSize * 0.9}"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Inter, system-ui, -apple-system, sans-serif"
    font-size="${fontSize}px"
    font-weight="500"
    fill="${fg}"
    opacity="0.9"
  >${text}</text>

  <!-- Dimensions label -->
  <text
    x="${width / 2}" y="${height - 16}"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Inter, system-ui, monospace"
    font-size="${Math.round(fontSize * 0.45)}px"
    fill="${fg}"
    opacity="0.4"
  >${width} × ${height}</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// ── Pre-built common sizes ────────────────────────────────────────────────────

export const PLACEHOLDER_800x600 = svgPlaceholder({
  width: 800, height: 600, text: "Altuvera",
});

export const PLACEHOLDER_1200x800 = svgPlaceholder({
  width: 1200, height: 800, text: "Altuvera",
});

export const PLACEHOLDER_400x300 = svgPlaceholder({
  width: 400, height: 300, text: "Altuvera",
});

export const PLACEHOLDER_SQUARE = svgPlaceholder({
  width: 400, height: 400, text: "Altuvera",
});

export const PLACEHOLDER_AVATAR = svgPlaceholder({
  width: 128, height: 128, text: "A",
  bg: "#059669", fg: "#ffffff", accent: "#34d399",
});

export const PLACEHOLDER_CARD = svgPlaceholder({
  width: 600, height: 400, text: "Altuvera",
  bg: "#1e3a5f", fg: "#93c5fd", accent: "#3b82f6",
});

export const PLACEHOLDER_BANNER = svgPlaceholder({
  width: 1920, height: 600, text: "Altuvera — Premium Adventures",
  bg: "#022c22", fg: "#6ee7b7", accent: "#059669",
});

/**
 * Drop-in replacement for via.placeholder.com URLs.
 *
 * Usage:
 *   // Before: "https://via.placeholder.com/800x600?text=Altuvera+Placeholder"
 *   // After:
 *   import { placeholder } from "@utils/placeholder";
 *   placeholder(800, 600, "Altuvera Placeholder")
 */
export const placeholder = (
  width  = 800,
  height = 600,
  text   = "Altuvera",
  opts   = {},
) => svgPlaceholder({ width, height, text, ...opts });

export default placeholder;