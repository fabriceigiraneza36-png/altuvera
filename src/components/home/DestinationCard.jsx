// components/home/DestinationCard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./DestinationCard.css";

const IconChevronLeft = ({ size = 18, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15 18-6-6 6-6" /></svg>
);
const IconChevronRight = ({ size = 18, color = "currentColor", ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 18 6-6-6-6" /></svg>
);

/* ═══════════════════════════════════════════
   INLINE SVG ICONS
   ═══════════════════════════════════════════ */
const IconLeaf = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <path d="M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H216c-47.6 0-92.5 12.6-131.2 34.7C56.7 310.5 40 370.5 40 434.9c0 7.1 .4 14.1 1.3 21.1H48c4.6 0 9.1-.2 13.7-.5l24.2-1.2c65.1-3.3 121.8-40.1 146.7-97.3c12-27.6 37.6-45.1 67.4-45.1c36.5 0 66 29.5 66 66c0 11.8-3.1 22.8-8.5 32.4C414.4 389.4 448 339.2 448 280c0-106-86-192-192-192z" />
  </svg>
);

const IconStar = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
    <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L439.6 329l104.2-103c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L382.2 150.3 316.9 18z" />
  </svg>
);

const IconLocationDot = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 384 512" fill={color}>
    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
  </svg>
);

const IconClock = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
  </svg>
);

const IconUsers = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 640 512" fill={color}>
    <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96H21.3C9.6 320 0 310.4 0 298.7zM405.3 320H362.7c26.5-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C550.2 192 598 239.8 598 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1-192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z" />
  </svg>
);

const IconTemperature = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 320 512" fill={color}>
    <path d="M160 64c-26.5 0-48 21.5-48 48V276.5c0 17.3-7.1 31.9-15.3 42.5C86.2 332.6 80 349.5 80 368c0 44.2 35.8 80 80 80s80-35.8 80-80c0-18.5-6.2-35.4-16.7-48.9c-8.2-10.6-15.3-25.2-15.3-42.5V112c0-26.5-21.5-48-48-48zM48 112C48 50.2 98.1 0 160 0s112 50.1 112 112V276.5c0 .1 .1 .3 .2 .6c.2 .6 .8 1.6 1.7 2.8C290 302.4 300 324.3 300 368c0 79.5-64.5 144-144 144S12 447.5 12 368c0-43.7 19.5-82.9 50.2-109.3c1-.9 1.5-1.9 1.7-2.6c.1-.2 .2-.4 .2-.6V112z" />
  </svg>
);

const IconArrowRight = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 448 512" fill={color}>
    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
  </svg>
);

const IconChevronDown = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
  </svg>
);

const IconChevronUp = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
  </svg>
);

const IconHeart = ({ size = 16, color = "currentColor", filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill={filled ? color : "none"} stroke={filled ? "none" : color} strokeWidth="32">
    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
  </svg>
);

/* ═══════════════════════════════════════════
   HIGHLIGHT ICON MAP
   ═══════════════════════════════════════════ */
const highlightIcons = {
  kayaking: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M256 0a56 56 0 1 1 0 112A56 56 0 1 1 256 0zM108.8 286.4c-13.3 17.7-38.3 21.3-56 8s-21.3-38.3-8-56l69.6-92.8c21.6-28.8 55.4-45.6 91.2-45.6h60.8c35.8 0 69.6 16.8 91.2 45.6l69.6 92.8c13.3 17.7 9.7 42.7-8 56s-42.7 9.7-56-8L336 196.8V304l91.2 68.4c10.6 8 16.8 20.4 16.8 33.6v72c0 22.1-17.9 40-40 40s-40-17.9-40-40V425.6l-72-54V464c0 22.1-17.9 40-40 40s-40-17.9-40-40V371.6l-72 54V478c0 22.1-17.9 40-40 40S60 500.1 60 478V406c0-13.2 6.2-25.6 16.8-33.6L168 304V196.8L108.8 286.4z" />
    </svg>
  ),
  wildlife: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 640 512" fill={color}>
      <path d="M407 47c9.4-9.4 24.6-9.4 33.9 0l17.2 17.2c1.9-.1 3.9-.2 5.8-.2h32c11.2 0 21.9 2.3 31.6 6.5L543 55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L561 105c4.2 9.7 6.5 20.4 6.5 31.6v13.3l41.1 41.1c4.7 4.7 7.4 11.2 7.4 17.9v1.5c0 7.6-3.3 14.8-9.1 19.7L574.6 257l6.2 52.5c.5 4.4 .3 8.8-.5 13.1l-22.5 112.5c-2.4 12.1-13.1 20.9-25.5 20.9H496c-11.7 0-21.9-7.9-24.8-19.3L448 352l-23.2 84.8C421.9 448.1 411.7 456 400 456H362.7c-12.4 0-23-8.8-25.5-20.9l-22.5-112.5c-.8-4.3-1-8.7-.5-13.1l6.2-52.5L288.1 230c-5.8-4.9-9.1-12.1-9.1-19.7v-1.5c0-6.7 2.7-13.2 7.4-17.9l41.1-41.1V136.5c0-11.2 2.3-21.9 6.5-31.6L318 89c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l15.5 15.5c9.7-4.2 20.4-6.5 31.6-6.5h32c2 0 3.9 .1 5.8 .2L407 47z" />
    </svg>
  ),
  volcano: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <path d="M256 32c12.5 0 24.1 6.4 30.8 17L503.4 394.5C513.5 411.2 501.5 432 482.1 432H29.9c-19.4 0-31.4-20.8-21.3-37.5L225.2 49c6.7-10.6 18.3-17 30.8-17zm0 84.3L107.4 384H404.6L256 116.3z" />
    </svg>
  ),
  gorilla: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M320 192h17.1c22.1 38.3 63.5 64 110.9 64c11 0 21.8-1.4 32-4v228c0 17.7-14.3 32-32 32s-32-14.3-32-32V339.2L280 448h56c17.7 0 32 14.3 32 32s-14.3 32-32 32H192c-53 0-96-43-96-96V192.5c0-16.1-12-29.8-28-31.8l-7.9-1C34.7 157.1 16 134.6 16 108.2c0-29 23.5-52.5 52.5-52.5c4.5 0 9 .6 13.3 1.6L128 64h64c17.7 0 32-14.3 32-32s14.3-32 32-32h32c88.4 0 160 71.6 160 160v32H320z" />
    </svg>
  ),
  hiking: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 384 512" fill={color}>
      <path d="M192 48a48 48 0 1 1 96 0 48 48 0 1 1-96 0zm51.3 182.7L224.2 307l49.7 49.7c9 9 14.1 21.2 14.1 33.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V397.3l-73.9-73.9c-15.8-15.8-22.2-38.6-16.9-60.3l20.4-84c8.3-34.1 42.7-54.9 76.7-46.4c19 4.8 34.7 17.4 42.7 34.6l7.1 15.1c9.7 20.6 30.2 33.8 52.8 36.5L364.4 224c17.5 2 29.6 18 27.6 35.5s-18 29.6-35.5 27.6l-51.4-6c-34.4-4-64.2-24.8-79.8-55.4z" />
    </svg>
  ),
  beach: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M346.3 271.8l-60.1-21.9L214 448H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H282.1l64.1-176.2zm121.1-.2l-3.3 9.1 67.7 24.6c18.1 6.6 38-8.4 31.4-26.5l-29-80.1c-4.8-13.2-20.2-19.2-32.8-12.8L430.4 209l-23.7 65.1zM262.4 213.6l-180 87.9c-3.6 1.8-6.8 4.2-9.4 7.1L2.6 387.1C-2.4 393.3 .7 402.6 8.3 404.1l97.2 19.2c12 2.4 24.3-1.4 33-10.1l66.8-66.8-15-47.4c-2.7-8.6-1.7-17.9 2.7-25.6l69.4-59.8z" />
    </svg>
  ),
  safari: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M544 0H32C14.3 0 0 14.3 0 32v48c0 8.8 7.2 16 16 16h16v368c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V96h16c8.8 0 16-7.2 16-16V32c0-17.7-14.3-32-32-32zM288 416h-64V288h64v128zm128 0h-64V288h64v128z" />
    </svg>
  ),
  photography: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 384a112 112 0 1 1 0-224 112 112 0 1 1 0 224z" />
    </svg>
  ),
  culture: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 640 512" fill={color}>
      <path d="M0 488V171.3c0-7.5 2.5-14.8 7-20.7L151 8.1C156.6 1 165.1-2 173.3 1.2L320 48l146.7-46.8c8.2-3.2 16.7-.2 22.3 6.9L633 150.6c4.5 5.9 7 13.2 7 20.7V488c0 13.3-10.7 24-24 24H568V264c0-17.7-14.3-32-32-32H424c-17.7 0-32 14.3-32 32V512H248V264c0-17.7-14.3-32-32-32H104c-17.7 0-32 14.3-32 32V512H24c-13.3 0-24-10.7-24-24z" />
    </svg>
  ),
  boat: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M256 16c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16V96H256V16zM96 128h384c17.7 0 32 14.3 32 32V288H64V160c0-17.7 14.3-32 32-32zM24 384c-13.3 0-24-10.7-24-24V320H576v40c0 13.3-10.7 24-24 24H24zM0 448c0-8.8 7.2-16 16-16H560c8.8 0 16 7.2 16 16v32c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V448z" />
    </svg>
  ),
  mountain: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
      <path d="M256 32c12.5 0 24.1 6.4 30.8 17L503.4 394.5C513.5 411.2 501.5 432 482.1 432H29.9c-19.4 0-31.4-20.8-21.3-37.5L225.2 49c6.7-10.6 18.3-17 30.8-17z" />
    </svg>
  ),
  default: ({ size = 22, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 576 512" fill={color}>
      <path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.8l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const getHighlightKey = (text) => {
  const t = (
    typeof text === "string"
      ? text
      : text?.name || text?.text || text?.title || ""
  ).toLowerCase();
  if (t.includes("kayak") || t.includes("canoe") || t.includes("paddle")) return "kayaking";
  if (t.includes("wildlife") || t.includes("safari") || t.includes("game drive")) return "wildlife";
  if (t.includes("volcano") || t.includes("volcan")) return "volcano";
  if (t.includes("gorilla") || t.includes("primate") || t.includes("chimp")) return "gorilla";
  if (t.includes("hik") || t.includes("trek") || t.includes("walk")) return "hiking";
  if (t.includes("beach") || t.includes("coast") || t.includes("swim")) return "beach";
  if (t.includes("photo") || t.includes("camera")) return "photography";
  if (
    t.includes("cultur") ||
    t.includes("heritage") ||
    t.includes("community") ||
    t.includes("village")
  ) return "culture";
  if (t.includes("boat") || t.includes("cruise") || t.includes("sail")) return "boat";
  if (t.includes("mountain") || t.includes("peak") || t.includes("summit")) return "mountain";
  return "default";
};

const getHighlightLabel = (h) => {
  if (typeof h === "string") return h;
  return h?.text || h?.name || h?.title || "Experience";
};

const getCategoryLabel = (category) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("eco")) return "ECOTOURISM";
  if (cat.includes("safari") || cat.includes("wildlife")) return "SAFARI";
  if (cat.includes("mountain") || cat.includes("trek")) return "TREKKING";
  if (cat.includes("gorilla") || cat.includes("primate")) return "WILDLIFE";
  if (cat.includes("beach") || cat.includes("coast")) return "BEACH";
  if (cat.includes("culture") || cat.includes("heritage")) return "CULTURE";
  if (cat.includes("photo")) return "PHOTOGRAPHY";
  if (cat.includes("adventure")) return "ADVENTURE";
  return (category || "ECOTOURISM").toUpperCase();
};

/* ═══════════════════════════════════════════
   DESTINATION CARD COMPONENT
   ═══════════════════════════════════════════ */
const DestinationCard = memo(({
  destination,
  isWishlisted = false,
  onWishlistToggle,
  index = 0,
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isWishlisted);
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [curImg, setCurImg] = useState(0);
  const [hover, setHover] = useState(false);
  const ivRef = useRef(null);

  /* ── Sync wishlist prop ── */
  useEffect(() => {
    setLiked(isWishlisted);
  }, [isWishlisted]);

  if (!destination) return null;

  /* ── Destructure destination ── */
  const {
    _id, id, name, title, slug,
    image, images: destImages, coverImage, thumbnail,
    location, country, region,
    category, categories,
    rating,
    description, shortDescription, summary,
    duration, groupSize, highlights,
    featured, temperature, temp,
  } = destination;

  /* ── Display values ── */
  const displayName     = name || title || "Untitled Destination";
  const displayLocation = location || country || region || "East Africa";
  const displayCountry  = country || region || (location ? location.split(",").pop()?.trim() : "Rwanda");
  const displayCategory = getCategoryLabel(category || categories?.[0]);
  const displayRating   = rating || 4.9;
  const displayDesc     = shortDescription || summary || description ||
    "Discover the breathtaking beauty of this incredible destination. Crystal-clear waters, stunning landscapes, and rich cultural experiences await.";
  const displayDuration  = duration    || "3-5 Days";
  const displayGroupSize = groupSize   || "Max 12";
  const displayTemp      = temperature || temp || "22-28°C";
  const displayHighlights = (highlights || []).slice(0, 3);
  const linkPath  = `/destinations/${slug || _id || id || ""}`;
  const animDelay = index * 100;

  /* ── Images array ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const allImages = useMemo(() => {
    if (destImages && Array.isArray(destImages) && destImages.length > 0) {
      return destImages.filter(Boolean);
    }
    const singleImg = image || coverImage || thumbnail;
    if (singleImg) return [singleImg];
    return [`https://picsum.photos/id/${1015 + (index % 30)}/800/600`];
  }, [destImages, image, coverImage, thumbnail, index]);

  /* ── ✅ FIX 1: renderedHighlights defined here ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renderedHighlights = useMemo(() =>
    displayHighlights.map((h, i) => {
      const label    = getHighlightLabel(h);
      const key      = getHighlightKey(h);
      const IconComp = highlightIcons[key] || highlightIcons.default;
      return (
        <div key={i} className="dc-highlight">
          <div className="dc-highlight-icon">
            <IconComp size={22} color="#059669" />
          </div>
          <p className="dc-highlight-label">{label}</p>
        </div>
      );
    }),
  [displayHighlights]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto image rotation ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (allImages.length <= 1) return;
    ivRef.current = setInterval(() => {
      setCurImg((p) => (p + 1) % allImages.length);
    }, hover ? 2200 : 5000);
    return () => clearInterval(ivRef.current);
  }, [allImages.length, hover]);

  /* ── Reset skeleton on slide change ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setImageLoaded(false);
  }, [curImg]);

  /* ── Callbacks ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const goPrev = useCallback((e) => {
    e.stopPropagation();
    setCurImg((p) => (p - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const goNext = useCallback((e) => {
    e.stopPropagation();
    setCurImg((p) => (p + 1) % allImages.length);
  }, [allImages.length]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => !prev);
    if (onWishlistToggle) {
      onWishlistToggle(_id || id || slug);
    }
  }, [onWishlistToggle, _id, id, slug]);

  /* ── ✅ FIX 2: toggleReadMore defined ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const toggleReadMore = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  /* ── ✅ FIX 3: handleExplore defined ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleExplore = useCallback(() => {
    navigate(linkPath);
  }, [navigate, linkPath]);

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  return (
    <div
      className="dc-card"
      style={{ animationDelay: `${animDelay}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >

      {/* ═══ IMAGE SECTION ═══ */}
      <div className="dc-hero">

        {/* Slideshow */}
        <div className="dc-hero-images">
          <AnimatePresence mode="wait">
            <motion.img
              key={curImg}
              src={allImages[curImg]}
              alt={`${displayName} - image ${curImg + 1}`}
              className="dc-hero-img"
              loading={curImg === 0 ? "lazy" : "eager"}
              onLoad={() => setImageLoaded(true)}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        </div>

        {/* Gradient overlay */}
        <div className="dc-hero-gradient" />

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <motion.div
            className="dc-hero-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: hover ? "auto" : "none" }}
          >
            <button className="dc-hero-nav-btn" onClick={goPrev} aria-label="Previous image">
              <IconChevronLeft size={20} />
            </button>
            <button className="dc-hero-nav-btn" onClick={goNext} aria-label="Next image">
              <IconChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Image indicators */}
        {allImages.length > 1 && (
          <div className="dc-hero-indicators">
            {allImages.map((_, i) => (
              <button
                key={i}
                className={`dc-hero-indicator${i === curImg ? " active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setCurImg(i); }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Top badges */}
        <div className="dc-top-badges" style={{ animationDelay: `${animDelay + 100}ms` }}>
          <div className="dc-top-badges-left">
            <div className="dc-badge-category">
              <IconLeaf size={12} color="white" />
              <span>{displayCategory}</span>
            </div>
            <div className="dc-badge-rating">
              <IconStar size={12} color="#fbbf24" />
              <span>{displayRating}</span>
            </div>
          </div>
          <div className="dc-badge-country" style={{ animationDelay: `${animDelay + 200}ms` }}>
            <IconLocationDot size={12} color="#059669" />
            <span>{displayCountry}</span>
          </div>
        </div>

        {/* Wishlist button */}
        <button
          className={`dc-wishlist-btn${liked ? " dc-wishlist-btn--active" : ""}`}
          onClick={handleLike}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <IconHeart size={16} color={liked ? "#fff" : "#059669"} filled={liked} />
        </button>

        {/* Featured badge */}
        {featured && (
          <div className="dc-featured-badge">
            <span className="dc-featured-pulse" />
            FEATURED
          </div>
        )}

        {/* Title overlay */}
        <div className="dc-hero-info" style={{ animationDelay: `${animDelay + 300}ms` }}>
          <h2 className="dc-title">{displayName}</h2>
          <p className="dc-subtitle">{displayLocation}</p>
        </div>

        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="dc-skeleton">
            <div className="dc-skeleton-shimmer" />
          </div>
        )}
      </div>

      {/* ═══ CONTENT SECTION ═══ */}
      <div className="dc-content">

        {/* Quick Info Row */}
        <div className="dc-quick-info" style={{ animationDelay: `${animDelay + 400}ms` }}>
          <div className="dc-info-item">
            <IconClock size={14} color="#059669" />
            <span>{displayDuration}</span>
          </div>
          <div className="dc-info-item">
            <IconUsers size={14} color="#059669" />
            <span>{displayGroupSize}</span>
          </div>
          <div className="dc-info-item">
            <IconTemperature size={14} color="#059669" />
            <span>{displayTemp}</span>
          </div>
        </div>

        {/* Description with Read More */}
        <div className="dc-desc-wrap" style={{ animationDelay: `${animDelay + 500}ms` }}>
          <p className={`dc-description${!expanded ? " dc-description--clamped" : ""}`}>
            {displayDesc}
          </p>
          {displayDesc.length > 130 && (
            <button className="dc-read-more" onClick={toggleReadMore}>
              {expanded ? (
                <>Read less <IconChevronUp size={10} color="currentColor" /></>
              ) : (
                <>Read more <IconChevronDown size={10} color="currentColor" /></>
              )}
            </button>
          )}
        </div>

        {/* ✅ Highlights Grid — uses renderedHighlights */}
        {renderedHighlights.length > 0 && (
          <div className="dc-highlights" style={{ animationDelay: `${animDelay + 600}ms` }}>
            {renderedHighlights}
          </div>
        )}

        {/* CTA Button */}
        <button
          className="dc-cta"
          onClick={handleExplore}
          style={{ animationDelay: `${animDelay + 700}ms` }}
        >
          Explore This Destination
          <IconArrowRight size={14} color="white" />
        </button>
      </div>
    </div>
  );
});

DestinationCard.displayName = "DestinationCard";
export default DestinationCard;