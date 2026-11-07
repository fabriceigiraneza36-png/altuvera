const CATEGORY_DEFINITIONS = [
  { id: "people", label: "Portraits", style: "lorelei", palette: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc"] },
  { id: "modern", label: "Modern People", style: "notionists", palette: ["d1fae5", "dbeafe", "fce7f3", "fef3c7"] },
  { id: "friendly", label: "Friendly Faces", style: "big-smile", palette: ["a7f3d0", "bfdbfe", "fde68a", "fbcfe8"] },
  { id: "adventure", label: "Adventure", style: "adventurer", palette: ["bbf7d0", "bae6fd", "fed7aa", "ddd6fe"] },
  { id: "wildlife", label: "Animals", style: "fun-emoji", palette: ["d9f99d", "bfdbfe", "fde68a", "fecdd3"] },
  { id: "technology", label: "Technology", style: "bottts", palette: ["c7d2fe", "bae6fd", "a7f3d0", "e9d5ff"] },
  { id: "nature", label: "Nature", style: "shapes", palette: ["bbf7d0", "d9f99d", "a7f3d0", "fde68a"] },
  { id: "water", label: "Water & Ocean", style: "rings", palette: ["bae6fd", "bfdbfe", "cffafe", "ddd6fe"] },
  { id: "food", label: "Fruits & Food", style: "pixel-art", palette: ["fecaca", "fed7aa", "fde68a", "d9f99d"] },
  { id: "sketch", label: "Sketch", style: "croodles", palette: ["fbcfe8", "ddd6fe", "bfdbfe", "bbf7d0"] },
  { id: "minimal", label: "Minimal", style: "thumbs", palette: ["e2e8f0", "d1fae5", "dbeafe", "fce7f3"] },
  { id: "abstract", label: "Abstract", style: "identicon", palette: ["c4b5fd", "a7f3d0", "fda4af", "93c5fd"] },
  { id: "pets", label: "Pets & Companions", style: "fun-emoji", palette: ["fde68a", "fecaca", "bfdbfe", "bbf7d0"] },
  { id: "birds", label: "Birds & Wings", style: "pixel-art", palette: ["bae6fd", "d9f99d", "fbcfe8", "ddd6fe"] },
  { id: "botanical", label: "Flowers & Botanicals", style: "shapes", palette: ["bbf7d0", "fbcfe8", "d9f99d", "fef3c7"] },
  { id: "travel", label: "Travel & Adventure", style: "adventurer-neutral", palette: ["bfdbfe", "bbf7d0", "fed7aa", "ddd6fe"] },
  { id: "space", label: "Space & Science", style: "bottts-neutral", palette: ["c7d2fe", "bae6fd", "a7f3d0", "e9d5ff"] },
  { id: "creative", label: "Creative Studio", style: "open-peeps", palette: ["fbcfe8", "ddd6fe", "bfdbfe", "bbf7d0"] },
  { id: "professional", label: "Professional Portraits", style: "personas", palette: ["d1fae5", "dbeafe", "fce7f3", "fef3c7"] },
];

const makeAvatar = (category, index) => {
  const seed = `altuvera-${category.id}-${String(index + 1).padStart(2, "0")}`;
  const backgroundColor = category.palette[index % category.palette.length];
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    radius: "50",
    size: "160",
  });

  return {
    id: seed,
    label: `${category.label} ${String(index + 1).padStart(2, "0")}`,
    categoryId: category.id,
    categoryLabel: category.label,
    url: `https://api.dicebear.com/10.x/${category.style}/svg?${params.toString()}`,
  };
};

export const PROFILE_AVATAR_CATEGORIES = CATEGORY_DEFINITIONS;
export const PROFILE_AVATARS = CATEGORY_DEFINITIONS.flatMap((category) =>
  Array.from({ length: 32 }, (_, index) => makeAvatar(category, index)),
);
export const PROFILE_AVATAR_COUNT = PROFILE_AVATARS.length;
