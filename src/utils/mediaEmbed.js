const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;

export const extractYouTubeId = (value = "") => {
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^[a-zA-Z0-9_-]{6,}$/.test(raw)) return raw;
  const match = raw.match(YOUTUBE_ID_REGEX);
  return match?.[1] || "";
};

export const toYouTubeEmbedUrl = (value = "", options = {}) => {
  const id = extractYouTubeId(value);
  if (!id) return "";

  const {
    autoplay = 1,
    mute = 0,
    rel = 0,
    modestbranding = 1,
    playsinline = 1,
    controls = 1,
    fs = 1,
    ivLoadPolicy = 3,
    ccLoadPolicy = 0,
    disablekb = 0,
  } = options;

  const params = new URLSearchParams({
    autoplay: String(autoplay),
    mute: String(mute),
    rel: String(rel),
    modestbranding: String(modestbranding),
    playsinline: String(playsinline),
    controls: String(controls),
    fs: String(fs),
    iv_load_policy: String(ivLoadPolicy),
    cc_load_policy: String(ccLoadPolicy),
    disablekb: String(disablekb),
  });

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
};

export const toGoogleMapEmbedUrl = ({
  lat,
  lng,
  query = "",
  zoom = 6,
}) => {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (hasCoords) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }
  const safeQuery = encodeURIComponent(String(query || "").trim());
  return `https://www.google.com/maps?q=${safeQuery}&z=${zoom}&output=embed`;
};

export const toGoogleMapOpenUrl = ({ lat, lng, query = "" }) => {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    String(query || "").trim()
  )}`;
};
