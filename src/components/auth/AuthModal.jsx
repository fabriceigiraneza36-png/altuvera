// AuthModal.jsx — Premium Split-Layout Auth with Tailwind CSS v4
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiLockClosed,
  HiMail,
  HiPhone,
  HiPhotograph,
  HiRefresh,
  HiSparkles,
  HiUser,
  HiX,
  HiShieldCheck,
  HiGlobe,
  HiCheckCircle,
  HiClipboardCopy,
  HiExclamationCircle,
  HiInformationCircle,
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiTranslate,
  HiLocationMarker,
  HiOfficeBuilding,
  HiPencil,
  HiQuestionMarkCircle,
} from "react-icons/hi";
import { FiGithub, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdVerified, MdOutlineSecurityUpdateGood } from "react-icons/md";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAuthStats } from "../../hooks/useAuthStats";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
import CountryPhoneSelect, { COUNTRIES } from "./CountryPhoneSelect";
import ProfessionPickerModal from "./ProfessionPickerModal";
import { API_URL } from "../../utils/apiBase";
import "./AuthModal.css";

/* ═══════════════════════════════════════════════════════════════
   GALLERY
═══════════════════════════════════════════════════════════════ */
const GALLERY = [
  {
    src: "https://i.pinimg.com/736x/7a/e8/6f/7ae86f7fb7eddaceb8ed5ba212c19a0e.jpg",
    alt: "Majestic male lion in golden savanna",
    caption: "Serengeti, Tanzania",
    subtitle: "Where the wild roams free",
  },
  {
    src: "https://i.pinimg.com/736x/81/3c/12/813c12e76fbd4fc43517b90804423d90.jpg",
    alt: "Crystal turquoise waters and white sand",
    caption: "Zanzibar, Tanzania",
    subtitle: "Paradise found",
  },
  {
    src: "https://i.pinimg.com/1200x/34/da/8e/34da8ee9bedf86bde3797e5b37884910.jpg",
    alt: "Snow-capped Kilimanjaro above clouds",
    caption: "Kilimanjaro, Tanzania",
    subtitle: "Touch the sky",
  },
  {
    src: "https://i.pinimg.com/736x/74/23/d3/7423d340555f9ae1eeba5a9528a94715.jpg",
    alt: "Mountain gorilla in misty forest",
    caption: "Volcanoes NP, Rwanda",
    subtitle: "Meet our closest relatives",
  },
  {
    src: "https://i.pinimg.com/736x/30/f1/ad/30f1ada2ba80044e4b1db79ac0e95768.jpg",
    alt: "Giraffes at sunset",
    caption: "Maasai Mara, Kenya",
    subtitle: "Golden hour magic",
  },
  {
    src: "https://i.pinimg.com/736x/3d/f5/f7/3df5f7a59bdb7704087eec05f6ee4476.jpg",
    alt: "Ngorongoro Crater panorama",
    caption: "Ngorongoro, Tanzania",
    subtitle: "Nature's amphitheatre",
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BIO = 300;
const MAX_FILE = 10 * 1024 * 1024;
const CODE_TTL_LOGIN_REGISTER = 10 * 60;
const CODE_TTL_RESEND = 10 * 60;
const SIGNUP_DRAFT_KEY = "altuvera_signup_draft_v1";
const SIGNUP_DRAFT_TTL_MS = 10 * 60 * 1000;

const API_BASE = API_URL;

const ROLES = [
  { value: "user",         label: "Traveler",      icon: HiGlobe,      desc: "Explore & discover",   color: "#3b82f6" },
  { value: "photographer", label: "Photographer",  icon: HiPhotograph, desc: "Capture moments",       color: "#8b5cf6" },
  { value: "planner",      label: "Planner",       icon: HiSparkles,   desc: "Craft itineraries",     color: "#059669" },
];

const LANGUAGES = [
  "English","French","Spanish","Arabic","Swahili",
  "Portuguese","German","Italian","Chinese (Mandarin)",
  "Japanese","Korean","Hindi","Russian","Dutch",
  "Turkish","Polish","Swedish","Norwegian","Danish",
  "Finnish","Amharic","Hausa","Yoruba","Zulu",
  "Afrikaans","Malay","Indonesian","Thai","Vietnamese",
];

const TRAVEL_STYLES = [
  { label: "Adventure", icon: HiSparkles },
  { label: "Luxury", icon: HiShieldCheck },
  { label: "Budget", icon: HiCheckCircle },
  { label: "Cultural", icon: HiOfficeBuilding },
  { label: "Wildlife", icon: HiGlobe },
  { label: "Beach", icon: HiGlobe },
  { label: "Mountain", icon: HiLocationMarker },
  { label: "City Break", icon: HiOfficeBuilding },
  { label: "Road Trip", icon: HiLocationMarker },
  { label: "Backpacking", icon: HiPhotograph },
  { label: "Family", icon: HiUser },
  { label: "Solo", icon: HiUser },
  { label: "Eco-Tourism", icon: HiGlobe },
  { label: "Photography", icon: HiPhotograph },
  { label: "Culinary", icon: HiCalendar },
  { label: "Spiritual", icon: HiSparkles },
];

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
const emptyCode = () => ["", "", "", "", "", ""];

const readSignupDraft = () => {
  try {
    const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    const expiresAt = Number(draft?.expiresAt);
    if (!draft?.data || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
      return null;
    }
    const data = draft.data;
    return {
      expiresAt,
      data: {
        email: String(data.email || ""),
        fullName: String(data.fullName || ""),
        phone: String(data.phone || ""),
        bio: String(data.bio || ""),
        role: String(data.role || "user"),
        keepSignedIn: data.keepSignedIn !== false,
        avatarPreview: /^https?:\/\//i.test(data.avatarPreview || "") ? data.avatarPreview : "",
        dateOfBirth: String(data.dateOfBirth || ""),
        nationality: String(data.nationality || ""),
        residenceCountry: String(data.residenceCountry || ""),
        preferredLanguage: String(data.preferredLanguage || ""),
        profession: String(data.profession || ""),
        travelStyles: Array.isArray(data.travelStyles) ? data.travelStyles.filter((v) => typeof v === "string").slice(0, 16) : [],
      },
    };
  } catch { return null; }
};

const persistSignupDraft = (form, expiresAt) => {
  const safeAvatar = /^https?:\/\//i.test(form.avatarPreview || "") ? form.avatarPreview : "";
  const data = {
    email: form.email || "", fullName: form.fullName || "", phone: form.phone || "",
    bio: form.bio || "", role: form.role || "user", keepSignedIn: Boolean(form.keepSignedIn),
    avatarPreview: safeAvatar, dateOfBirth: form.dateOfBirth || "", nationality: form.nationality || "",
    residenceCountry: form.residenceCountry || "", preferredLanguage: form.preferredLanguage || "",
    profession: form.profession || "", travelStyles: Array.isArray(form.travelStyles) ? form.travelStyles.slice(0, 16) : [],
  };
  try { sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify({ expiresAt, data })); }
  catch { /* form continues to work in memory if browser storage is unavailable */ }
};

const getInitials = (v = "") =>
  v.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).join("") || "U";

const toBase64 = (s) => {
  try {
    return window.btoa(
      encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) =>
        String.fromCharCode(parseInt(h, 16)),
      ),
    );
  } catch { return ""; }
};

const initAvatar = (name, color = "#059669") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}cc"/>
    </linearGradient></defs>
    <rect width="128" height="128" rx="28" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Inter,sans-serif" font-size="52" font-weight="700"
      fill="#fff">${getInitials(name)}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
};

const readFile = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(new Error("Cannot read file"));
    r.readAsDataURL(file);
  });

const formatExpiry = (seconds) => {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};

const isDismissalError = (msg = "") => {
  const m = msg.toLowerCase();
  return (
    m.includes("dismiss")    || m.includes("cancel")              ||
    m.includes("closed")     || m.includes("credential_cancelled")||
    m.includes("popup_closed")|| m.includes("skipped")            ||
    m.includes("not_displayed")|| m.includes("google button")
  );
};

const formatAuthError = (error, fallback = "Something went wrong. Please try again.") => {
  const raw = typeof error === "string" ? error : error?.response?.data?.message || error?.data?.message || error?.message || "";
  const message = String(raw).replace(/\s+/g, " ").trim();
  if (!message) return fallback;
  const lower = message.toLowerCase();
  if (/failed to fetch|networkerror|network request failed|load failed|offline|internet connection/.test(lower)) return "We couldn't reach Altuvera. Check your internet connection and try again.";
  if (/timeout|timed out|aborted/.test(lower)) return "The request took too long. Please try again.";
  if (/429|too many requests|rate.?limit|too many attempts/.test(lower)) return "There have been too many attempts. Please wait a little before trying again.";
  if (/already exists|already registered|email.*(taken|in use|registered)|duplicate.*email/.test(lower)) return "An account may already use this email. Try signing in or use the account-recovery option.";
  if (/invalid email|email.*invalid/.test(lower)) return "Check the email address and enter it in the format name@example.com.";
  if (/expired|invalid.*(otp|verification|security) code|incorrect.*(otp|verification|security) code/.test(lower)) return "That verification code is invalid or expired. Check the code or request a new one.";
  if (/not found|invalid credentials|unauthorized|authentication failed|incorrect.*(name|email)|user does not exist/.test(lower)) return "We couldn't verify those details. Check your email and full name, then try again.";
  if (message.length > 240 || /<\/?[a-z][^>]*>|\bat\s+[^\s]+\s*\(|typeerror|referenceerror|syntaxerror|unexpected token|unexpected end of json|cannot read properties|is not a function|internal server error|bad gateway/i.test(message)) return fallback;
  return message;
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY SLIDESHOW
═══════════════════════════════════════════════════════════════ */
const GallerySlideshow = ({ intervalMs = 5000 }) => {
  const [gallery, setGallery] = useState(GALLERY);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    if (media.addEventListener) media.addEventListener("change", updatePreference);
    else media.addListener?.(updatePreference);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", updatePreference);
      else media.removeListener?.(updatePreference);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const normalizeImage = (value, depth = 0) => {
      if (!value || depth > 4) return "";
      if (typeof value === "string") return value.trim();
      if (Array.isArray(value)) {
        for (const entry of value) {
          const src = normalizeImage(entry, depth + 1);
          if (src) return src;
        }
        return "";
      }
      if (typeof value !== "object") return "";
      for (const key of [
        "url", "imageUrl", "image_url", "image", "src", "secure_url",
        "thumbnailUrl", "thumbnail_url", "originalUrl", "original_url",
      ]) {
        const src = normalizeImage(value[key], depth + 1);
        if (src) return src;
      }
      return "";
    };

    const resolveImageUrl = (value) => {
      const raw = normalizeImage(value);
      if (!raw) return "";
      if (/^(https?:)?\/\//i.test(raw) || /^(data:|blob:)/i.test(raw)) return raw;
      try {
        const origin = new URL(API_BASE).origin;
        return new URL(raw.startsWith("/") ? raw : "/" + raw, origin).toString();
      } catch {
        return raw;
      }
    };

    const imageOf = (item) => {
      const candidates = [
        item?.image_url, item?.imageUrl, item?.image, item?.cover_image,
        item?.coverImage, item?.cover_image_url, item?.coverImageUrl,
        item?.featured_image, item?.featuredImage, item?.hero_image,
        item?.heroImage, item?.main_image, item?.mainImage, item?.thumbnail,
        item?.thumbnail_url, item?.thumbnailUrl, item?.image_urls, item?.imageUrls,
        item?.hero_images, item?.heroImages, item?.images,
        item?.gallery, item?.gallery_images, item?.galleryImages,
        item?.photos, item?.media,
      ];
      for (const candidate of candidates) {
        const src = resolveImageUrl(candidate);
        if (src) return src;
      }
      return "";
    };

    const arrayFrom = (payload) => {
      const candidates = [
        payload, payload?.data, payload?.destinations, payload?.results,
        payload?.items, payload?.data?.destinations, payload?.data?.results,
        payload?.data?.items, payload?.data?.data,
      ];
      return candidates.find((candidate) => Array.isArray(candidate)) || [];
    };

    const titleOf = (item) => {
      const value = item?.name || item?.title || item?.destination_name ||
        item?.destinationName || item?.country_name;
      return typeof value === "string" && value.trim() ? value.trim() : "Explore Africa";
    };

    const subtitleOf = (item) => {
      const candidates = [
        item?.short_description, item?.shortDescription, item?.tagline,
        item?.subtitle, item?.description,
      ];
      const value = candidates.find((candidate) =>
        typeof candidate === "string" && candidate.trim()
      );
      return value ? value.trim() : "Discover unforgettable African experiences";
    };

    fetch(String(API_BASE || "").replace(/\/+$/, "") + "/destinations", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Destinations unavailable");
        return response.json();
      })
      .then((payload) => {
        const items = arrayFrom(payload);
        const slides = items.slice(0, 20).map((item) => {
          const caption = titleOf(item);
          return {
            src: imageOf(item),
            alt: "Discover " + caption,
            caption,
            subtitle: subtitleOf(item),
          };
        }).filter((slide) => Boolean(slide.src));

        if (!cancelled && slides.length) {
          setGallery(slides);
          setCurrent(0);
        }
      })
      .catch(() => {
        // Keep the built-in Africa imagery available if the destinations API is offline.
      });

    return () => { cancelled = true; controller.abort(); };
  }, []);

  const advance = useCallback(
    () => setCurrent((index) => (index + 1) % gallery.length),
    [gallery.length],
  );

  useEffect(() => {
    if (isPaused || !isPageVisible || reducedMotion || gallery.length < 2) return undefined;
    const timer = setInterval(advance, intervalMs);
    return () => clearInterval(timer);
  }, [advance, gallery.length, intervalMs, isPaused, isPageVisible, reducedMotion]);

  useEffect(() => {
    const next = gallery[(current + 1) % gallery.length];
    if (!next?.src) return undefined;
    const image = new Image();
    image.src = next.src;
    return () => { image.onload = null; image.onerror = null; };
  }, [current, gallery]);

  const slide = gallery[current] || GALLERY[0];

  return (
    <div
      className="am-auth-slideshow relative h-full w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured African destinations"
    >
      {gallery.map((item, index) => (
        <div
          key={item.src + "-" + index}
          style={{
            position: "absolute", inset: 0,
            transition: "opacity 1200ms ease-in-out, transform 1200ms ease-in-out",
            opacity: index === current ? 1 : 0,
            transform: index === current ? "scale(1)" : "scale(1.045)",
            pointerEvents: index === current ? "auto" : "none",
          }}
          aria-hidden={index !== current}
        >
          <img
            src={item.src}
            alt={item.alt}
            onError={(event) => {
              const image = event.currentTarget;
              if (image.dataset.authFallbackApplied === "true") {
                image.style.opacity = "0";
                return;
              }
              image.dataset.authFallbackApplied = "true";
              const fallbackImage = GALLERY[(index + 1) % GALLERY.length].src;
              if (!fallbackImage || image.src === fallbackImage) {
                image.style.opacity = "0";
                return;
              }
              image.src = fallbackImage;
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading={index === current || index === (current + 1) % gallery.length ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      ))}

      <div className="am-auth-slideshow__shade am-auth-slideshow__shade--bottom" aria-hidden="true" />
      <div className="am-auth-slideshow__shade am-auth-slideshow__shade--side" aria-hidden="true" />

      <div className="am-auth-slideshow__content">
        <p className="am-auth-slideshow__single-phrase" key={current}>
          {slide.subtitle || slide.caption || "Discover Africa"}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */
const Spinner = ({ className = "" }) => (
  <div className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
);

const InputField = ({
  id, label, icon: Icon, type = "text",
  value, onChange, onBlur,
  placeholder, error: fieldError, valid,
  required, autoComplete, refProp,
  isEmail = false, hint, disabled = false,
  ...props
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      {!required && <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
          fieldError ? "text-red-400" : valid ? "text-emerald-500" : "text-gray-400"
        }`} />
      </div>

      {isEmail ? (
        <EmailAutocompleteInput
          id={id} ref={refProp}
          value={value} onValueChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete || "email"}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? id + "-error" : hint ? id + "-hint" : undefined}
          className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 ${
            disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
          } ${
            fieldError
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              : valid
                ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"
          }`}
          {...props}
        />
      ) : (
        <input
          id={id} ref={refProp} type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? id + "-error" : hint ? id + "-hint" : undefined}
          className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 ${
            disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
          } ${
            fieldError
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
              : valid
                ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300"
          }`}
          {...props}
        />
      )}

      {valid && (
        <HiCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
      )}
    </div>
    {hint && !fieldError && (
      <p id={id + "-hint"} className="text-xs text-gray-400 flex items-center gap-1">
        <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />{hint}
      </p>
    )}
    {fieldError && (
      <p id={id + "-error"} className="text-xs text-red-500 flex items-center gap-1" role="alert">
        <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />{fieldError}
      </p>
    )}
  </div>
);

const SelectField = ({
  id, label, icon: Icon,
  value, onChange, children,
  required, hint,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
      {label}
      {!required && <span className="text-gray-400 font-normal text-xs ml-1">— Optional</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <Icon className="w-[18px] h-[18px] text-gray-400" />
      </div>
      <select
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-12 pl-11 pr-9 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer"
      >
        {children}
      </select>
      <HiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
    </div>
    {hint && (
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />{hint}
      </p>
    )}
  </div>
);

const SocialButtons = ({
  mode, googleLoaded, googleLoading, githubLoading, loading, isOnline, onGoogle, onGithub,
}) => (
  <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3" role="group" aria-label="Continue with a social account">
    <button
      type="button" onClick={() => onGoogle(mode)}
      disabled={googleLoading || githubLoading || loading || !isOnline}
      aria-busy={googleLoading}
      title={!googleLoaded ? "Google sign-in may still be initializing; email sign-in remains available." : "Continue with Google"}
      aria-label={googleLoading ? "Connecting to Google" : "Continue with Google"}
      className="flex items-center justify-center gap-2.5 min-h-12 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-all duration-200"
    >
      {googleLoading ? <Spinner /> : <FcGoogle className="w-5 h-5" />}
      <span>{googleLoading ? "Connecting…" : "Google"}</span>
    </button>
    <button
      type="button" onClick={() => onGithub(mode)}
      disabled={githubLoading || googleLoading || loading || !isOnline}
      aria-busy={githubLoading}
      aria-label={githubLoading ? "Connecting to GitHub" : "Continue with GitHub"}
      className="flex items-center justify-center gap-2.5 min-h-12 rounded-xl bg-[#102c23] text-white text-sm font-semibold hover:bg-[#174838] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-all duration-200"
    >
      {githubLoading ? <Spinner /> : <FiGithub className="w-5 h-5" />}
      <span>{githubLoading ? "Connecting…" : "GitHub"}</span>
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AuthModal() {
  const {
    isModalOpen, modalView, setModalView, closeModal, openModal,
    login, register, verifyCode, beginFactorChallenge, verifyLoginFactor, verifyLoginPasskey, resendCode,
    pendingEmail, pendingVerification, clearPendingVerification, pendingFactorMethods, persistSession, setSessionPreference, updateProfile,
    googleUser, googleLoaded, googleLoading, githubLoading,
    hasGooglePending, promptGoogleAuth, startGithubAuth,
    completeGoogleSignUp, clearGooglePending,
    socialAuthError, clearSocialAuthError, uploadAvatar,
    /* ✅ NEW — used by doForgotUsernameVerify for immediate login */
    saveAuth,
  } = useUserAuth();

  useAuthStats();

  /* ── Form state ── */
  const [restoredSignupDraft] = useState(() => readSignupDraft());
  const signupDraftExpiresAtRef = useRef(restoredSignupDraft?.expiresAt || (Date.now() + SIGNUP_DRAFT_TTL_MS));
  const [form, setForm] = useState(() => ({
    email: "", fullName: "", phone: "", bio: "",
    role: "user", keepSignedIn: persistSession,
    avatarFile: null, avatarPreview: "",
    dateOfBirth: "", nationality: "",
    residenceCountry: "", preferredLanguage: "",
    profession: "", travelStyles: [],
    ...(restoredSignupDraft?.data || {}),
    avatarFile: null,
    keepSignedIn: restoredSignupDraft?.data?.keepSignedIn ?? persistSession,
  }));
  const [pendingPromptDismissed, setPendingPromptDismissed] = useState(false);
  const [pendingClockNow, setPendingClockNow] = useState(() => Date.now());

  useEffect(() => {
    if (!pendingVerification?.expiresAt) return undefined;
    setPendingClockNow(Date.now());
    const timer = window.setInterval(() => setPendingClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [pendingVerification?.expiresAt]);

  const [signUpStep,      setSignUpStep]      = useState(1);
  const [agreeTerms,      setAgreeTerms]      = useState(false);
  const [termsTouched,    setTermsTouched]    = useState(false);
  const [isOnline,        setIsOnline]        = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);
  const [loading,         setLoading]         = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [code,            setCode]            = useState(emptyCode());
  const [factorCode, setFactorCode] = useState("");
  const [factorMethod, setFactorMethod] = useState("totp");
  useEffect(() => { if (pendingFactorMethods.length && !pendingFactorMethods.includes(factorMethod)) setFactorMethod(pendingFactorMethods.includes("totp") ? "totp" : "recovery_code"); }, [pendingFactorMethods, factorMethod]);
  const [resendTimer,     setResendTimer]     = useState(0);
  const [verifySource,    setVerifySource]    = useState("login");
  const [authMethod,      setAuthMethod]      = useState("email");
  const [showAuthMethods, setShowAuthMethods] = useState(false);
  const [switchingView,   setSwitchingView]   = useState(false);
  const switchViewTimerRef = useRef(null);
  const [codeState,       setCodeState]       = useState("");
  const [emailTouched,    setEmailTouched]    = useState(false);
  const [nameTouched,     setNameTouched]     = useState(false);
  const [codeExpiry,      setCodeExpiry]      = useState(CODE_TTL_LOGIN_REGISTER);
  const [codeExpired,     setCodeExpired]     = useState(false);
  const [professionOpen,  setProfessionOpen]  = useState(false);

  /* ── Forgot Username state ── */
  const [forgotUsernameMode, setForgotUsernameMode] = useState(false);
  const [forgotStep,         setForgotStep]         = useState("email"); // "email"|"code"|"success"
  const [forgotEmail,        setForgotEmail]        = useState("");
  const [forgotEmailTouched, setForgotEmailTouched] = useState(false);
  const [forgotCode,         setForgotCode]         = useState(emptyCode());
  const [forgotCodeState,    setForgotCodeState]    = useState(""); // ""|"verifying"|"success"|"error"
  const [forgotResendTimer,  setForgotResendTimer]  = useState(0);
  const [forgotCodeExpiry,   setForgotCodeExpiry]   = useState(CODE_TTL_LOGIN_REGISTER);
  const [forgotCodeExpired,  setForgotCodeExpired]  = useState(false);

  /* ── Refs ── */
  const codeRefs          = useRef([]);
  const forgotCodeRefs    = useRef([]);
  const modalRef          = useRef(null);
  const firstInputRef     = useRef(null);
  const nameInputRef      = useRef(null);
  const termsInputRef     = useRef(null);
  const connectionWasOnline = useRef(typeof navigator === "undefined" || navigator.onLine !== false);
  const forgotEmailRef    = useRef(null);
  const expiryTimerRef    = useRef(null);
  const forgotExpiryTimerRef = useRef(null);

  /* ── Derived ── */
  const isLogin    = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify   = modalView === "verify";
  const isFactor   = modalView === "factor";

  const activeEmail   = (pendingEmail || form.email || googleUser?.email || "").trim();

  useEffect(() => {
    if (!pendingVerification?.email) return;
    setForm((previous) => ({
      ...previous,
      email: previous.email || pendingVerification.email,
      fullName: previous.fullName || pendingVerification.fullName || "",
    }));
  }, [pendingVerification?.email, pendingVerification?.fullName]);

  useEffect(() => {
    if (modalView !== "register" || !form.email.trim()) return;
    const expiresAt = signupDraftExpiresAtRef.current;
    if (expiresAt > Date.now()) persistSignupDraft(form, expiresAt);
  }, [form, modalView]);

  useEffect(() => {
    setPendingPromptDismissed(false);
  }, [pendingVerification?.email, pendingVerification?.expiresAt]);

  useEffect(() => {
    if (isVerify && codeExpired && pendingVerification) clearPendingVerification();
  }, [isVerify, codeExpired, pendingVerification, clearPendingVerification]);
  const emailOk       = EMAIL_RE.test(form.email.trim());
  const nameOk        = form.fullName.trim().length >= 2;
  const bioOk         = form.bio.trim().length <= MAX_BIO;
  const isBusy        = googleLoading || githubLoading || loading;
  const forgotEmailOk = EMAIL_RE.test(forgotEmail.trim());

  const currentRole = useMemo(
    () => ROLES.find((r) => r.value === form.role) || ROLES[0],
    [form.role],
  );

  const avatarSrc = useMemo(
    () =>
      form.avatarPreview ||
      (googleUser?.picture && authMethod === "google" ? googleUser.picture : null) ||
      initAvatar(form.fullName || form.email || "U", currentRole?.color),
    [form.avatarPreview, form.fullName, form.email, googleUser?.picture, authMethod, currentRole?.color],
  );

  const todayStr = new Date().toISOString().split("T")[0];

  /* ═══════════════════════════════════════════════════════════
     COUNTDOWN HELPERS
  ═══════════════════════════════════════════════════════════ */
  const startExpiryCountdown = useCallback((seconds = CODE_TTL_LOGIN_REGISTER) => {
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    setCodeExpiry(seconds);
    setCodeExpired(false);
    expiryTimerRef.current = setInterval(() => {
      setCodeExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(expiryTimerRef.current);
          expiryTimerRef.current = null;
          setCodeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopExpiryCountdown = useCallback(() => {
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    setCodeExpiry(CODE_TTL_LOGIN_REGISTER);
    setCodeExpired(false);
  }, []);

  const startForgotExpiryCountdown = useCallback((seconds = CODE_TTL_LOGIN_REGISTER) => {
    if (forgotExpiryTimerRef.current) clearInterval(forgotExpiryTimerRef.current);
    setForgotCodeExpiry(seconds);
    setForgotCodeExpired(false);
    forgotExpiryTimerRef.current = setInterval(() => {
      setForgotCodeExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(forgotExpiryTimerRef.current);
          forgotExpiryTimerRef.current = null;
          setForgotCodeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopForgotExpiryCountdown = useCallback(() => {
    if (forgotExpiryTimerRef.current) {
      clearInterval(forgotExpiryTimerRef.current);
      forgotExpiryTimerRef.current = null;
    }
    setForgotCodeExpiry(CODE_TTL_LOGIN_REGISTER);
    setForgotCodeExpired(false);
  }, []);

  /* Cleanup on unmount */
  useEffect(() => () => {
    if (expiryTimerRef.current)       clearInterval(expiryTimerRef.current);
    if (forgotExpiryTimerRef.current) clearInterval(forgotExpiryTimerRef.current);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     FIELD HELPERS
  ═══════════════════════════════════════════════════════════ */
  const set = useCallback((field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    setError("");
    setSuccess("");
    clearSocialAuthError?.();
  }, [clearSocialAuthError]);

  const toggleTravelStyle = useCallback((style) => {
    setForm((p) => ({
      ...p,
      travelStyles: p.travelStyles.includes(style)
        ? p.travelStyles.filter((s) => s !== style)
        : [...p.travelStyles, style],
    }));
  }, []);

  /* ═══════════════════════════════════════════════════════════
     FORGOT USERNAME RESET
  ═══════════════════════════════════════════════════════════ */
  const resetForgotUsername = useCallback(() => {
    setForgotUsernameMode(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotEmailTouched(false);
    setForgotCode(emptyCode());
    setForgotCodeState("");
    setForgotResendTimer(0);
    stopForgotExpiryCountdown();
    setError("");
    setSuccess("");
  }, [stopForgotExpiryCountdown]);

  /* ═══════════════════════════════════════════════════════════
     SWITCH VIEW
  ═══════════════════════════════════════════════════════════ */
  const switchView = useCallback((view) => {
    if (isBusy || switchingView || view === modalView) return;
    if (switchViewTimerRef.current) window.clearTimeout(switchViewTimerRef.current);
    setSwitchingView(true);
    switchViewTimerRef.current = window.setTimeout(() => {
      stopExpiryCountdown();
      resetForgotUsername();
      setModalView(view);
      setError(""); setSuccess("");
      setCode(emptyCode());
      setAuthMethod("email");
      setShowAuthMethods(false);
      setEmailTouched(false); setNameTouched(false); setTermsTouched(false);
      clearSocialAuthError?.();
      if (view === "login") clearGooglePending?.();
      setSwitchingView(false);
      switchViewTimerRef.current = null;
    }, 1500);
  }, [clearGooglePending, clearSocialAuthError, isBusy, switchingView, modalView, resetForgotUsername, setModalView, stopExpiryCountdown]);

  /* ═══════════════════════════════════════════════════════════
     EFFECTS
  ═══════════════════════════════════════════════════════════ */
  useEffect(() => () => {
    if (switchViewTimerRef.current) window.clearTimeout(switchViewTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (previouslyFocused && previouslyFocused.isConnected && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    const updateConnection = () => {
      const online = typeof navigator === "undefined" || navigator.onLine !== false;
      if (online && !connectionWasOnline.current) {
        setError((current) => typeof current === "string" && /offline|internet connection|could not reach altuvera|couldn\u0027t reach altuvera/i.test(current) ? "" : current);
        setSuccess("Connection restored. You can continue.");
      }
      connectionWasOnline.current = online;
      setIsOnline(online);
    };
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    updateConnection();
    return () => { window.removeEventListener("online", updateConnection); window.removeEventListener("offline", updateConnection); };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const focusableSelector = [
      "a[href]", "button:not([disabled])", "input:not([disabled])",
      "select:not([disabled])", "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const trapTabFocus = (event) => {
      if (event.key !== "Tab") return;
      const dialog = modalRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll(focusableSelector))
        .filter((element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true");
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus?.();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapTabFocus);
    return () => document.removeEventListener("keydown", trapTabFocus);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const h = (e) => { if (e.key === "Escape" && !professionOpen) closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeModal, isModalOpen, professionOpen]);

  useEffect(() => {
    if (!isModalOpen || !isVerify || !pendingVerification?.expiresAt) return undefined;
    const remaining = Math.max(0, Math.ceil((pendingVerification.expiresAt - Date.now()) / 1000));
    if (remaining <= 0) {
      setCodeExpired(true);
      setError("This verification code has expired. Request a new code to continue.");
      return undefined;
    }
    startExpiryCountdown(remaining);
    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
      expiryTimerRef.current = null;
    };
  }, [isModalOpen, isVerify, pendingVerification?.expiresAt, startExpiryCountdown]);

  useEffect(() => {
    if (!isModalOpen) return;
    // When reopening a saved OTP, keep the original absolute expiry. Resetting
    // this countdown to ten minutes would make the UI promise more time than
    // the server will accept after a refresh or a dismissed modal.
    if (!isVerify) stopExpiryCountdown();
    resetForgotUsername();
    setError(""); setSuccess("");
    setCode(emptyCode()); setResendTimer(0);
    setAuthMethod("email"); setShowAuthMethods(false); setCodeState("");
    setEmailTouched(false); setNameTouched(false); setTermsTouched(false);
    if (isRegister && !hasGooglePending) setSignUpStep(1);
    setForm((p) => ({ ...p, keepSignedIn: persistSession }));
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 350);
    return () => window.clearTimeout(focusTimer);
  }, [isLogin, isModalOpen, isRegister, isVerify, persistSession, hasGooglePending,
    stopExpiryCountdown, resetForgotUsername]);

  useEffect(() => {
    if (!socialAuthError) return;
    if (isDismissalError(socialAuthError)) { clearSocialAuthError?.(); return; }
    setError(socialAuthError);
  }, [socialAuthError, clearSocialAuthError]);

  useEffect(() => {
    if (googleUser && isRegister) {
      setForm((p) => ({
        ...p,
        email:         googleUser.email   || p.email,
        fullName:      googleUser.name    || p.fullName,
        avatarPreview: googleUser.picture || p.avatarPreview,
      }));
      setSignUpStep(2);
      setAuthMethod("google");
      setSuccess("Google account connected! Complete your profile.");
    }
  }, [googleUser, isRegister]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => {
    if (forgotResendTimer <= 0) return;
    const t = setInterval(() => setForgotResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [forgotResendTimer]);

  /* ═══════════════════════════════════════════════════════════
     SOCIAL AUTH
  ═══════════════════════════════════════════════════════════ */
  const handleGoogleAuth = useCallback(async (mode = "signin") => {
    if (isBusy) return;
    if (!isOnline) { setError("You appear to be offline. Reconnect before using social sign-in."); return; }
    clearSocialAuthError?.(); setError(""); setSuccess("");
    try {
      const result = await promptGoogleAuth({ mode, skipOneTap: true });
      if (result?.dismissed) return;
      if (mode === "signup" && result) setSuccess("Google connected! Complete your profile.");
    } catch (err) {
      const msg = err?.message || "";
      if (isDismissalError(msg)) return;
      setError(formatAuthError(msg, "Google authentication failed."));
    }
  }, [clearSocialAuthError, isBusy, isOnline, promptGoogleAuth]);

  const handleGithubAuth = useCallback((mode = "signin") => {
    if (isBusy) return;
    if (!isOnline) { setError("You appear to be offline. Reconnect before using social sign-in."); return; }
    clearSocialAuthError?.(); setError(""); setSuccess("");
    try { startGithubAuth(mode); }
    catch (err) { setError(formatAuthError(err, "GitHub authentication failed.")); }
  }, [clearSocialAuthError, isBusy, isOnline, startGithubAuth]);

  /* ═══════════════════════════════════════════════════════════
     AVATAR
  ═══════════════════════════════════════════════════════════ */
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image."); return; }
    if (file.size > MAX_FILE) { setError("Image must be 10 MB or less."); return; }
    try {
      const preview = await readFile(file);
      setForm((p) => ({ ...p, avatarFile: file, avatarPreview: preview }));
      setError("");
    } catch { setError("Unable to preview this image."); }
  }, []);

  const resolveAvatar = useCallback(async () => {
    if (googleUser?.picture && !form.avatarFile) return googleUser.picture;
    const fallback = form.avatarPreview || initAvatar(form.fullName || form.email, currentRole?.color);
    if (!form.avatarFile) return fallback;
    setAvatarUploading(true);
    try { return await uploadAvatar(form.avatarFile); }
    catch { setSuccess("Using placeholder — update anytime."); return fallback; }
    finally { setAvatarUploading(false); }
  }, [currentRole?.color, form.avatarFile, form.avatarPreview, form.email,
    form.fullName, googleUser?.picture, uploadAvatar]);

  /* ═══════════════════════════════════════════════════════════
     SIGN IN
  ═══════════════════════════════════════════════════════════ */
  const handleSignIn = useCallback(async (e) => {
    e.preventDefault();
    setEmailTouched(true); setNameTouched(true); setError("");
    if (!emailOk) { setError("Check your email address. It should look like name@example.com."); firstInputRef.current?.focus(); return; }
    if (!nameOk)  { setError("Enter the full name associated with your account."); nameInputRef.current?.focus(); return; }
    if (!isOnline) { setError("You appear to be offline. Reconnect to request your verification code."); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      setSessionPreference(form.keepSignedIn);
      await login({
        email:          form.email.trim(),
        fullName:       form.fullName.trim(),
        persistSession: form.keepSignedIn,
      });
      setSuccess("Verification code sent. Check your inbox, including the spam folder.");
    } catch (err) {
      setError(formatAuthError(err, "We could not start sign-in. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [emailOk, nameOk, form.email, form.fullName, form.keepSignedIn, isOnline, login, setSessionPreference]);

  /* ═══════════════════════════════════════════════════════════
     FORGOT USERNAME — Step 1: Send code
  ═══════════════════════════════════════════════════════════ */
  const handleForgotUsernameSendCode = useCallback(async (e) => {
    e.preventDefault();
    if (!isOnline) { setError("You appear to be offline. Reconnect before requesting a recovery code."); return; }
    setForgotEmailTouched(true);
    if (!forgotEmailOk) { setError("Please enter a valid email address."); forgotEmailRef.current?.focus(); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      const res  = await fetch(`${API_BASE}/users/forgot-username/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code.");
      setForgotStep("code");
      startForgotExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
      setSuccess("Verification code sent! Check your inbox.");
      setTimeout(() => forgotCodeRefs.current[0]?.focus(), 300);
    } catch (err) {
      setError(formatAuthError(err, "Failed to send verification code."));
    } finally {
      setLoading(false);
    }
  }, [forgotEmailOk, forgotEmail, isOnline, startForgotExpiryCountdown]);

  /* ═══════════════════════════════════════════════════════════
     FORGOT USERNAME — Step 2: Verify code & auto-login
     ✅ FIX: calls saveAuth() from context instead of writing
        to localStorage + reloading — state updates immediately
  ═══════════════════════════════════════════════════════════ */
  const doForgotUsernameVerify = useCallback(async (val) => {
    if (!isOnline) { setError("You appear to be offline. Reconnect before verifying your code."); return; }
    if (!forgotEmail.trim())  { setError("Missing email. Please restart."); return; }
    if (val.length !== 6)     { setError("Enter the full 6-digit code."); forgotCodeRefs.current[0]?.focus(); return; }
    if (forgotCodeExpired)    { setError("Code expired. Request a new one."); return; }

    try {
      setLoading(true); setForgotCodeState("verifying"); setError("");

      const res  = await fetch(`${API_BASE}/users/forgot-username/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");
      if (data?.requiresSecondFactor || data?.data?.requiresSecondFactor) {
        beginFactorChallenge(data?.data?.challengeToken || data?.challengeToken, data?.data?.methods || data?.methods || []);
        resetForgotUsername();
        return;
      }

      /* Mark code boxes as success */
      setForgotCodeState("success");
      stopForgotExpiryCountdown();

      const recoveredName  = data.data?.fullName || data.data?.username || "";
      const recoveredEmail = data.data?.email    || forgotEmail.trim();

      setSuccess(`Welcome back, ${recoveredName || recoveredEmail}! Signing you in…`);

      /* ── ✅ CRITICAL FIX ──────────────────────────────────────────────────
         The backend returns:  { data: { token, refreshToken, user, fullName, … } }
         saveAuth() from UserAuthContext reads extractPayload(data) which picks
         up data.data.token, data.data.refreshToken, data.data.user and calls:
           setToken(tok)         → JWT in state
           setUser(normalized)   → user object in state
           localStorage/session  → token persisted correctly

         This means React state is updated immediately — no page reload needed,
         no "not logged in" race, no wrong storage keys.
      ──────────────────────────────────────────────────────────────────────── */
      setTimeout(() => {
        saveAuth(data, { persist: form.keepSignedIn });
        resetForgotUsername();
        closeModal();
      }, 1200); // brief delay so user sees the "Signing you in…" message

    } catch (err) {
      setForgotCodeState("error");
      setError(formatAuthError(err, "Verification failed."));
      setTimeout(() => {
        setForgotCodeState("");
        setForgotCode(emptyCode());
        forgotCodeRefs.current[0]?.focus();
      }, 700);
    } finally {
      setLoading(false);
    }
  }, [
    forgotEmail, forgotCodeExpired, isOnline, stopForgotExpiryCountdown,
    form.keepSignedIn, saveAuth, resetForgotUsername, closeModal, beginFactorChallenge,
  ]);

  /* Auto-submit when 6 digits entered */
  useEffect(() => {
    const val = forgotCode.join("");
    if (
      val.length === 6          &&
      forgotUsernameMode        &&
      forgotStep === "code"     &&
      !loading                  &&
      forgotCodeState !== "verifying" &&
      forgotCodeState !== "success"   &&
      !forgotCodeExpired
    ) {
      const t = setTimeout(() => doForgotUsernameVerify(val), 400);
      return () => clearTimeout(t);
    }
  }, [forgotCode, forgotUsernameMode, forgotStep, loading,
    forgotCodeState, forgotCodeExpired, doForgotUsernameVerify]);

  const handleForgotCodeChange = useCallback((i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    setForgotCode((p) => { const n = [...p]; n[i] = val; return n; });
    setError(""); setForgotCodeState("");
    if (val && i < 5) forgotCodeRefs.current[i + 1]?.focus();
  }, []);

  const handleForgotCodeKey = useCallback((i, e) => {
    if (e.key === "Backspace" && !forgotCode[i] && i > 0)
      forgotCodeRefs.current[i - 1]?.focus();
  }, [forgotCode]);

  const handleForgotCodePaste = useCallback((e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = emptyCode();
    digits.split("").forEach((d, i) => { next[i] = d; });
    setForgotCode(next); setForgotCodeState("");
    forgotCodeRefs.current[Math.min(digits.length, 5)]?.focus();
  }, []);

  const handleForgotResend = useCallback(async () => {
    if (!forgotEmail.trim() || forgotResendTimer > 0 || loading) return;
    if (!isOnline) { setError("You appear to be offline. Reconnect before requesting another code."); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      const res  = await fetch(`${API_BASE}/users/forgot-username/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend.");
      startForgotExpiryCountdown(CODE_TTL_RESEND);
      setForgotResendTimer(60);
      setForgotCode(emptyCode());
      setForgotCodeState("");
      setSuccess(`New code sent to ${forgotEmail}. Valid for 10 min.`);
      forgotCodeRefs.current[0]?.focus();
    } catch (err) {
      setError(formatAuthError(err, "Unable to resend the code."));
    } finally {
      setLoading(false);
    }
  }, [forgotEmail, forgotResendTimer, isOnline, loading, startForgotExpiryCountdown]);

  /* ═══════════════════════════════════════════════════════════
     VERIFY (main OTP flow)
  ═══════════════════════════════════════════════════════════ */
  const doVerify = useCallback(async (val) => {
    if (!isOnline) { setError("You appear to be offline. Reconnect before verifying your code."); return; }
    if (!activeEmail) { setError("Missing email. Please restart."); return; }
    if (val.length !== 6) { setError("Enter the full 6-digit code."); codeRefs.current[0]?.focus(); return; }
    if (codeExpired)      { setError("Code expired. Request a new one."); return; }
    try {
      setLoading(true); setCodeState("verifying"); setError("");
      await verifyCode(activeEmail, val);
      setCodeState("success"); stopExpiryCountdown();
    } catch (err) {
      setCodeState("error"); setError(formatAuthError(err, "Verification failed."));
      setTimeout(() => { setCodeState(""); setCode(emptyCode()); codeRefs.current[0]?.focus(); }, 700);
    } finally { setLoading(false); }
  }, [activeEmail, codeExpired, isOnline, verifyCode, stopExpiryCountdown]);

  useEffect(() => {
    const val = code.join("");
    if (
      val.length === 6 && isVerify && !loading &&
      codeState !== "verifying" && codeState !== "success" && !codeExpired
    ) {
      const t = setTimeout(() => doVerify(val), 400);
      return () => clearTimeout(t);
    }
  }, [code, isVerify, loading, codeState, codeExpired, doVerify]);

  /* ═══════════════════════════════════════════════════════════
     SIGN UP
  ═══════════════════════════════════════════════════════════ */
  const handleSignUp = useCallback(async (e) => {
    e.preventDefault();
    setTermsTouched(true);
    if (!agreeTerms) { setError("Please accept the Terms and Privacy Policy to create your account."); termsInputRef.current?.focus(); return; }
    if (!isOnline) { setError("You appear to be offline. Reconnect before creating your account."); return; }
    if (authMethod === "google" && !hasGooglePending) { setError("Reconnect your Google account, or switch to email sign-up."); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      setVerifySource("register"); setSessionPreference(form.keepSignedIn);
      const avatar = await resolveAvatar();
      const draftExpiry = Date.now() + SIGNUP_DRAFT_TTL_MS;
      signupDraftExpiresAtRef.current = draftExpiry;
      persistSignupDraft({ ...form, avatarPreview: avatar || form.avatarPreview }, draftExpiry);
      if (authMethod === "google") {
        await completeGoogleSignUp({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          role: form.role,
          avatar,
          dateOfBirth: form.dateOfBirth,
          nationality: form.nationality,
          residenceCountry: form.residenceCountry,
          preferredLanguage: form.preferredLanguage,
          profession: form.profession,
          travelStyles: form.travelStyles,
        });
        setSuccess("Account created! Welcome to Altuvera.");
      } else {
        await register({
          email: form.email.trim(), fullName: form.fullName.trim(),
          phone: form.phone.trim(), bio: form.bio.trim(),
          role: form.role, avatar, persistSession: form.keepSignedIn,
          preferences: {
            dateOfBirth: form.dateOfBirth,
            nationality: form.nationality,
            residenceCountry: form.residenceCountry,
            preferredLanguage: form.preferredLanguage,
            profession: form.profession,
            travelStyles: form.travelStyles,
          },
        });
        startExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
        setSuccess("Verification code sent.");
      }
    } catch (err) { setError(formatAuthError(err, "We could not create your account. Please try again.")); }
    finally { setLoading(false); }
  }, [agreeTerms, authMethod, completeGoogleSignUp, form, hasGooglePending,
    isOnline, register, resolveAvatar, setSessionPreference, startExpiryCountdown, termsInputRef]);

  /* ═══════════════════════════════════════════════════════════
     OTP HANDLERS (main)
  ═══════════════════════════════════════════════════════════ */
  const handleCodeChange = useCallback((i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    setCode((p) => { const n = [...p]; n[i] = val; return n; });
    setError(""); setCodeState("");
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  }, []);

  const handleCodeKey = useCallback((i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  }, [code]);

  const handleCodePaste = useCallback((e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = emptyCode();
    digits.split("").forEach((d, i) => { next[i] = d; });
    setCode(next); setCodeState(""); setError("");
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  }, []);

  const handlePasteCodeButton = useCallback(async () => {
    try {
      if (!navigator.clipboard?.readText) {
        setError("Paste is not available here. Tap the first box and paste your code.");
        codeRefs.current[0]?.focus();
        return;
      }
      const digits = (await navigator.clipboard.readText()).replace(/\D/g, "").slice(0, 6);
      if (!digits) {
        setError("No verification digits found on your clipboard.");
        return;
      }
      const next = emptyCode();
      digits.split("").forEach((d, i) => { next[i] = d; });
      setCode(next); setCodeState(""); setError("");
      codeRefs.current[Math.min(digits.length, 5)]?.focus();
    } catch {
      setError("Clipboard access was blocked. Tap the first box and paste your code instead.");
      codeRefs.current[0]?.focus();
    }
  }, []);

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;
    if (!isOnline) { setError("You appear to be offline. Reconnect before requesting another code."); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      await resendCode(activeEmail);
      startExpiryCountdown(CODE_TTL_RESEND);
      setResendTimer(60); setCode(emptyCode()); setCodeState("");
      setSuccess(`New code sent to ${activeEmail}. Valid for 10 min.`);
      codeRefs.current[0]?.focus();
    } catch (err) { setError(formatAuthError(err, "Unable to resend.")); }
    finally { setLoading(false); }
  }, [activeEmail, isOnline, loading, resendCode, resendTimer, startExpiryCountdown]);

  const handleBackFromVerify = useCallback(() => {
    stopExpiryCountdown(); setCode(emptyCode()); setError(""); setSuccess("");
    setModalView(verifySource);
  }, [setModalView, stopExpiryCountdown, verifySource]);

  /* ── Guard ── */
  if (!isModalOpen) {
    if (!pendingVerification?.email || pendingPromptDismissed) return null;
    const remainingSeconds = Math.max(0, Math.ceil((pendingVerification.expiresAt - pendingClockNow) / 1000));
    return (
      <div className="fixed z-[10050] bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[min(92vw,390px)] am-viewIn" role="status" aria-live="polite">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-950/15">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300" />
          <div className="flex items-start gap-3 pt-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><HiMail className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900">Email verification is waiting</p>
              <p className="mt-1 break-all text-xs text-gray-500">{pendingVerification.email}</p>
              <p className="mt-1 text-xs text-emerald-700">{remainingSeconds > 0 ? `Your code remains valid for ${formatExpiry(remainingSeconds)}.` : "Your code has expired. Request a new one."}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => openModal("verify", { skipNotLoggedInMessage: true })} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"><HiShieldCheck className="h-4 w-4" /> {remainingSeconds > 0 ? "Continue verification" : "Request a new code"}</button>
                <button type="button" onClick={() => setPendingPromptDismissed(true)} className="min-h-10 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800">Not now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step labels ── */
  const STEP_LABELS    = ["Method",               "Profile",              "Details",                          "Confirm"];
  const STEP_TITLES    = ["Choose Method",         "Your Profile",         "More Details",                     "Confirm"];
  const STEP_SUBTITLES = ["Pick how you'd like to join", "Tell us about yourself", "Help us personalize your journey", "Review and create your account"];

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes modalIn    { from{opacity:0;transform:scale(0.95) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes viewIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepIn     { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideDown  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn    { from{transform:scale(0)} 50%{transform:scale(1.15)} to{transform:scale(1)} }
        @keyframes scaleX     { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fadeSlideUp{ from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressBar{ from{width:0%} to{width:100%} }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

        .am-fadeIn  { animation: fadeIn     300ms ease-out both; }
        .am-modalIn { animation: modalIn    450ms cubic-bezier(0.34,1.56,0.64,1) both 80ms; }
        .am-viewIn  { animation: viewIn     350ms ease-out both; }
        .am-stepIn  { animation: stepIn     350ms ease-out both; }
        .am-slideDown{ animation: slideDown 300ms ease-out both; }
        .am-scaleIn { animation: scaleIn    300ms ease-out both; }
        .am-scaleX  { animation: scaleX     250ms ease-out both; transform-origin:left; }
        .am-shake   { animation: shake      500ms ease-in-out; }

        .auth-scroll::-webkit-scrollbar       { width:5px; }
        .auth-scroll::-webkit-scrollbar-track { background:transparent; }
        .auth-scroll::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }
        .auth-scroll::-webkit-scrollbar-thumb:hover { background:#d1d5db; }

        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
        }
      `}</style>

      <ProfessionPickerModal
        isOpen={professionOpen}
        onClose={() => setProfessionOpen(false)}
        onSelect={(val) => set("profession", val)}
        current={form.profession}
      />

      {/* Backdrop */}
      <div
        className="am-fadeIn fixed inset-0 z-[9990] flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/55"
        onClick={closeModal}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className="am-modal am-modalIn relative w-full max-w-[1040px] bg-white rounded-none sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{
            maxHeight: "100dvh", height: "100dvh",
            ...(window.innerWidth >= 640 ? { height: "auto", maxHeight: "92vh" } : {}),
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog" aria-modal="true" aria-labelledby="auth-title"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-50" />

          {/* Single responsive destination slideshow: avoids duplicate API requests and timers */}
          <div className="am-auth-gallery relative bg-gray-900 flex-shrink-0">
            <GallerySlideshow />
          </div>

          {/* Form panel */}
          <div className="am-form-panel flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            {switchingView && (
              <div className="am-switch-transition" role="status" aria-live="polite" aria-label="Switching authentication form">
                <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} className="am-switch-transition__logo" />
                <span className="am-switch-transition__label">Altuvera</span>
              </div>
            )}

            {/* Header */}
            <div className="am-header flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 lg:hidden">
                  <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                </div>
                <div className="hidden lg:block">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Altuvera</h3>
                </div>
              </div>
              <button onClick={closeModal}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                aria-label="Close"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {!isVerify && !forgotUsernameMode && (
              <div className="flex border-b border-gray-100 px-4 sm:px-6 flex-shrink-0">
                {[
                  { view: "login",    label: "Sign In",        icon: HiLockClosed },
                  { view: "register", label: "Create Account", icon: HiSparkles   },
                ].map(({ view, label, icon: TabIcon }) => (
                  <button key={view} onClick={() => switchView(view)} disabled={isBusy}
                    className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      modalView === view ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{label}</span>
                    {modalView === view && (
                      <span className="am-scaleX absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable body */}
            <div className="auth-scroll flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-5">

              {!isOnline && (
                <div className="am-auth-offline mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900" role="status" aria-live="polite">
                  <HiExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold">You’re offline</p><p className="mt-0.5 text-xs leading-relaxed">Your details stay on this screen, but sign-in, verification and social authentication need an internet connection.</p></div>
                </div>
              )}
              {/* Alerts */}
              {error && (
                <div role="alert" aria-live="polite" className="am-slideDown mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm text-red-700">{typeof error === "string" ? error : "An error occurred."}</p>
                  <button aria-label="Dismiss error message" onClick={() => setError("")} className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors">
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              )}
              {success && (
                <div role="status" aria-live="polite" className="am-slideDown mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm text-emerald-700">{success}</p>
                </div>
              )}

              {/* ════════════════════════════════════════════════════
                  FORGOT USERNAME FLOW
              ════════════════════════════════════════════════════ */}
              {forgotUsernameMode && isLogin && (
                <div className="am-viewIn">

                  {/* Step: Email */}
                  {forgotStep === "email" && (
                    <>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 mb-3 p-3">
                          <HiQuestionMarkCircle className="w-7 h-7 text-amber-600" />
                        </div>
                        <h2 id="auth-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                          Forgot Your Name?
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter your email and we'll send a verification code to recover your account name.
                        </p>
                      </div>

                      <form onSubmit={handleForgotUsernameSendCode} noValidate className="space-y-4">
                        <InputField
                          id="forgot-email" label="Email Address" icon={HiMail}
                          value={forgotEmail}
                          onChange={(v) => { setForgotEmail(v); setError(""); setSuccess(""); }}
                          onBlur={() => setForgotEmailTouched(true)}
                          placeholder="you@example.com" autoComplete="email"
                          required isEmail refProp={forgotEmailRef}
                          error={forgotEmailTouched && !forgotEmailOk ? "Please enter a valid email." : ""}
                          valid={forgotEmailTouched && forgotEmailOk}
                        />
                        <button type="submit" disabled={loading}
                          className="w-full h-12 rounded-xl bg-amber-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {loading
                            ? <><Spinner /><span>Sending Code…</span></>
                            : <><HiMail className="w-4 h-4" /><span>Send Verification Code</span></>
                          }
                        </button>
                      </form>

                      <div className="text-center mt-5 pt-4 border-t border-gray-100">
                        <button onClick={resetForgotUsername}
                          className="text-sm font-semibold text-gray-500 hover:text-gray-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                        >
                          <HiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step: Code */}
                  {forgotStep === "code" && (
                    <>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 mb-3 sm:mb-4 p-2.5">
                          <HiMail className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                        </div>
                        <h2 id="auth-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                          Verify Your Identity
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to:</p>
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-800">
                          <HiMail className="w-4 h-4 text-emerald-500" />
                          <span className="break-all">{forgotEmail || "No email"}</span>
                        </div>

                        {forgotCodeState !== "success" && (
                          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            forgotCodeExpired
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : forgotCodeExpiry <= 30
                                ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                                : forgotCodeExpiry <= 120
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}>
                            {forgotCodeExpired ? (
                              <><HiExclamationCircle className="w-4 h-4" /><span>Code expired — request a new one</span></>
                            ) : (
                              <><HiInformationCircle className="w-4 h-4" />
                                <span>Expires in <strong className="tabular-nums font-bold">{formatExpiry(forgotCodeExpiry)}</strong></span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <form
                        onSubmit={(e) => { e.preventDefault(); doForgotUsernameVerify(forgotCode.join("")); }}
                        noValidate className="space-y-5"
                      >
                        <div
                          className={`flex justify-center gap-2 sm:gap-3 ${forgotCodeState === "verifying" ? "animate-pulse" : ""} ${forgotCodeState === "error" ? "am-shake" : ""}`}
                          onPaste={handleForgotCodePaste}
                          role="group" aria-label="Verification code"
                        >
                          {forgotCode.map((digit, i) => (
                            <input key={i}
                              ref={(el) => { forgotCodeRefs.current[i] = el; }}
                              type="text" inputMode="numeric" pattern="[0-9]"
                              maxLength={1} value={digit}
                              onChange={(e) => handleForgotCodeChange(i, e.target.value)}
                              onKeyDown={(e) => handleForgotCodeKey(i, e)}
                              disabled={forgotCodeState === "verifying" || forgotCodeState === "success" || forgotCodeExpired}
                              className={`text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border-2 outline-none transition-all duration-200 ${
                                forgotCodeExpired
                                  ? "border-red-200 bg-red-50/50 text-red-300 cursor-not-allowed"
                                  : forgotCodeState === "success"
                                    ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                    : forgotCodeState === "error"
                                      ? "border-red-300 bg-red-50"
                                      : digit
                                        ? "border-emerald-400 bg-emerald-50/50 text-gray-900"
                                        : "border-gray-200 bg-gray-50/50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                              }`}
                              style={{ width: "2.75rem", height: "3.25rem" }}
                              aria-label={`Digit ${i + 1}`}
                              autoComplete={i === 0 ? "one-time-code" : "off"}
                            />
                          ))}
                        </div>

                        {forgotCodeState === "verifying" && (
                          <div className="am-slideDown flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium">
                            <Spinner /> Verifying & recovering username…
                          </div>
                        )}
                        {forgotCodeState === "success" && (
                          <div className="am-slideDown flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                            <HiCheckCircle className="w-5 h-5" /> Username recovered! Signing you in…
                          </div>
                        )}

                        <button type="submit"
                          disabled={
                            loading || forgotCode.join("").length !== 6 ||
                            forgotCodeState === "verifying" || forgotCodeState === "success" || forgotCodeExpired
                          }
                          className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {loading || forgotCodeState === "verifying" ? (
                            <><Spinner /><span>Verifying…</span></>
                          ) : forgotCodeState === "success" ? (
                            <><HiCheckCircle className="w-5 h-5" /><span>Recovered!</span></>
                          ) : forgotCodeExpired ? (
                            <><HiExclamationCircle className="w-5 h-5" /><span>Code Expired</span></>
                          ) : (
                            <><span>Verify & Recover Username</span><HiArrowRight className="w-4 h-4" /></>
                          )}
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep("email");
                              stopForgotExpiryCountdown();
                              setForgotCode(emptyCode());
                              setError(""); setSuccess("");
                            }}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-gray-600 font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-all sm:w-auto w-full"
                          >
                            <HiArrowLeft className="w-4 h-4" /> Back
                          </button>
                          <button
                            type="button" onClick={handleForgotResend}
                            disabled={forgotResendTimer > 0 || loading}
                            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-emerald-600 font-semibold text-sm border-2 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <HiRefresh className={`w-4 h-4 ${forgotResendTimer > 0 || loading ? "animate-spin" : ""}`} />
                            {forgotResendTimer > 0 ? `Resend in ${forgotResendTimer}s` : "Resend Code"}
                          </button>
                        </div>
                      </form>

                      <div className="text-center mt-5 pt-4 border-t border-gray-100">
                        <button onClick={resetForgotUsername}
                          className="text-sm font-semibold text-gray-500 hover:text-gray-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                        >
                          <HiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ════════ LOGIN ════════ */}
              {isLogin && showAuthMethods && !forgotUsernameMode && (
                <div className="am-viewIn am-auth-methods px-4 sm:px-6 py-5 sm:py-7">
                  <button type="button" onClick={() => { setShowAuthMethods(false); setError(""); setSuccess(""); }} className="am-method-back" aria-label="Return to email sign in"><HiArrowLeft className="w-4 h-4" /> Back to sign in</button>
                  <div className="text-center mt-4 mb-6"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><HiShieldCheck className="h-6 w-6" /></div><h2 id="auth-title" className="mt-3 text-xl sm:text-2xl font-extrabold text-gray-900">Choose how to sign in</h2><p className="mt-1 text-sm text-gray-500">Use the method that is most convenient for you.</p></div>
                  {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
                  <div className="grid gap-3">
                    <button type="button" disabled={isBusy || !isOnline || switchingView} onClick={() => { setShowAuthMethods(false); setAuthMethod("email"); setError("Passkeys are available after you start email sign-in and reach the additional verification step. Enter your email and full name to continue."); setSuccess(""); window.setTimeout(() => firstInputRef.current?.focus(), 80); }} className="am-method-option"><span className="am-method-icon"><RiShieldKeyholeLine className="h-5 w-5" /></span><span className="am-method-copy"><strong>Continue with a passkey</strong><small>Available after starting sign-in with your email</small></span><HiArrowRight className="h-4 w-4 am-method-arrow" /></button>
                    <button type="button" disabled={googleLoading || githubLoading || loading || !isOnline} onClick={() => handleGoogleAuth("signin")} className="am-method-option"><span className="am-method-icon"><FcGoogle className="h-5 w-5" /></span><span className="am-method-copy"><strong>Continue with Google</strong><small>Sign in with your Google account</small></span><HiArrowRight className="h-4 w-4 am-method-arrow" /></button>
                    <button type="button" disabled={googleLoading || githubLoading || loading || !isOnline} onClick={() => handleGithubAuth("signin")} className="am-method-option"><span className="am-method-icon"><FiGithub className="h-5 w-5" /></span><span className="am-method-copy"><strong>Continue with GitHub</strong><small>Use your GitHub account</small></span><HiArrowRight className="h-4 w-4 am-method-arrow" /></button>
                    <button type="button" onClick={() => { setShowAuthMethods(false); setAuthMethod("email"); setError(""); setTimeout(() => firstInputRef.current?.focus(), 50); }} className="am-method-option"><span className="am-method-icon"><HiMail className="h-5 w-5" /></span><span className="am-method-copy"><strong>Email verification</strong><small>Receive a one-time verification code by email</small></span><HiArrowRight className="h-4 w-4 am-method-arrow" /></button>
                  </div>
                  <p className="mt-5 text-center text-xs leading-5 text-gray-400">Your available options depend on the methods enabled for your account and device.</p>
                </div>
              )}

              {isLogin && !forgotUsernameMode && !showAuthMethods && (
                <div className="am-viewIn">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 mb-3 p-3">
                      <HiShieldCheck className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h2 id="auth-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                      Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your travel dashboard</p>
                  </div>

                  <form onSubmit={handleSignIn} noValidate className="space-y-4">
                    <InputField
                      id="login-email" label="Email Address" icon={HiMail}
                      value={form.email} onChange={(v) => set("email", v)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="you@example.com" autoComplete="email"
                      required isEmail refProp={firstInputRef} disabled={isBusy}
                      error={emailTouched && !emailOk ? "Please enter a valid email." : ""}
                      valid={emailTouched && emailOk}
                    />

                    <div>
                      <InputField
                        id="login-name" label="Full Name" icon={HiUser} refProp={nameInputRef}
                        value={form.fullName} onChange={(v) => set("fullName", v)}
                        onBlur={() => setNameTouched(true)} disabled={isBusy}
                        placeholder="Your full name" autoComplete="name" required
                        error={nameTouched && !nameOk ? "At least 2 characters required." : ""}
                        valid={nameTouched && nameOk}
                      />
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotUsernameMode(true);
                            setForgotStep("email");
                            setForgotEmail(form.email || "");
                            setError(""); setSuccess("");
                            setTimeout(() => forgotEmailRef.current?.focus(), 300);
                          }}
                          className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                        >
                          <HiQuestionMarkCircle className="w-3.5 h-3.5" />
                          Forgot your name?
                        </button>
                      </div>
                    </div>

                    <label className="am-keep-signed flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        form.keepSignedIn ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-gray-400"
                      }`}>
                        {form.keepSignedIn && <HiCheck className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="checkbox" checked={form.keepSignedIn}
                        onChange={(e) => set("keepSignedIn", e.target.checked)} className="sr-only"
                      />
                      <span className="text-sm text-gray-600">Keep me signed in</span>
                    </label>

                    <button type="submit" disabled={loading || isBusy || !isOnline}
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading
                        ? <><Spinner /><span>Signing In…</span></>
                        : <><span>Continue with Email</span><HiArrowRight className="w-4 h-4" /></>
                      }
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <SocialButtons
                      mode="signin" isOnline={isOnline}
                      googleLoaded={googleLoaded} googleLoading={googleLoading}
                      githubLoading={githubLoading} loading={loading}
                      onGoogle={handleGoogleAuth} onGithub={handleGithubAuth}
                    />
                  </form>

                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => { setShowAuthMethods(true); setError(""); setSuccess(""); }} className="am-other-methods-link">
                      <RiShieldKeyholeLine className="h-4 w-4" /> Try another sign-in method <HiArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-5 mt-5 flex-wrap">
                    {[
                      { icon: RiShieldKeyholeLine,      text: "256-bit Encrypted" },
                      { icon: MdVerified,               text: "Verified"          },
                      { icon: MdOutlineSecurityUpdateGood, text: "GDPR"           },
                    ].map(({ icon: BI, text }) => (
                      <div key={text} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <BI className="w-3.5 h-3.5 text-emerald-500" /><span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-5 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">New here? </span>
                    <button onClick={() => switchView("register")}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                    >
                      Create an account <HiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════ REGISTER ════════ */}
              {isRegister && (
                <div className="am-viewIn">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 mb-3 p-2.5">
                      <HiGlobe className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 id="auth-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                      {STEP_TITLES[signUpStep - 1]}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{STEP_SUBTITLES[signUpStep - 1]}</p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center justify-center mb-5 px-2" role="progressbar" aria-label="Account setup progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={signUpStep} aria-valuetext={"Step " + signUpStep + " of 4: " + STEP_TITLES[signUpStep - 1]}>
                    {STEP_LABELS.map((label, i) => {
                      const n      = i + 1;
                      const done   = signUpStep > n;
                      const active = signUpStep === n;
                      return (
                        <React.Fragment key={n}>
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              done   ? "bg-emerald-500 text-white" :
                              active ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50" :
                                       "bg-gray-100 text-gray-400"
                            }`}>
                              {done ? <HiCheck className="w-3.5 h-3.5" /> : n}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide ${
                              signUpStep >= n ? "text-emerald-600" : "text-gray-400"
                            }`}>{label}</span>
                          </div>
                          {i < 3 && (
                            <div className="flex-1 h-0.5 mx-1 sm:mx-2 mb-4 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full bg-emerald-500 rounded-full transition-all duration-500 ${done ? "w-full" : "w-0"}`} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* ── Step 1 ── */}
                  {signUpStep === 1 && (
                    <div className="space-y-4 am-stepIn">
                      {hasGooglePending ? (
                        <div className="text-center py-8 px-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                            <HiCheckCircle className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Google Connected</h3>
                          <p className="text-sm text-gray-600 mb-5">Click Continue to set up your profile.</p>
                          <button onClick={() => setSignUpStep(2)}
                            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                          >
                            Continue <HiArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <InputField
                            id="reg-email" label="Email Address" icon={HiMail}
                            value={form.email} onChange={(v) => set("email", v)}
                            onBlur={() => setEmailTouched(true)}
                            placeholder="traveler@example.com" autoComplete="email"
                            required isEmail refProp={firstInputRef} disabled={isBusy}
                            error={emailTouched && !emailOk ? "Enter a valid email." : ""}
                            valid={emailTouched && emailOk}
                          />
                          <InputField
                            id="reg-name" label="Full Name" icon={HiUser} refProp={nameInputRef}
                            value={form.fullName} onChange={(v) => set("fullName", v)}
                            onBlur={() => setNameTouched(true)} disabled={isBusy}
                            placeholder="Your full name" autoComplete="name" required
                            error={nameTouched && !nameOk ? "At least 2 characters." : ""}
                            valid={nameTouched && nameOk}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEmailTouched(true); setNameTouched(true);
                              if (emailOk && nameOk) { setAuthMethod("email"); setError(""); setSignUpStep(2); }
                              else { setError(!emailOk ? "Enter a valid email address to continue." : "Enter your full name to continue."); if (!emailOk) firstInputRef.current?.focus(); else nameInputRef.current?.focus(); }
                            }}
                            disabled={isBusy}
                            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 transition-all"
                          >
                            <FiZap className="w-4 h-4" />Continue with Email<HiArrowRight className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                          <SocialButtons
                            mode="signup" isOnline={isOnline}
                            googleLoaded={googleLoaded} googleLoading={googleLoading}
                            githubLoading={githubLoading} loading={loading}
                            onGoogle={handleGoogleAuth} onGithub={handleGithubAuth}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Step 2 ── */}
                  {signUpStep === 2 && (
                    <div className="space-y-4 am-stepIn">
                      {googleUser && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <img
                            src={googleUser.picture || initAvatar(googleUser.name)} alt=""
                            style={{ width:"2.5rem", height:"2.5rem", borderRadius:"9999px", objectFit:"cover", display:"block", border:"2px solid #e5e7eb", flexShrink:0 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{googleUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">{googleUser.email}</p>
                          </div>
                          <MdVerified className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          Phone Number <span className="text-gray-400 font-normal text-xs">— Optional</span>
                        </label>
                        <CountryPhoneSelect
                          value={form.phone}
                          onChange={(v) => set("phone", v)}
                          placeholder="000 000 0000"
                          valid={form.phone.length > 8}
                        />
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          Used by guides/operators to reach you via WhatsApp
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="block text-sm font-semibold text-gray-700">I am a…</span>
                        <div className="grid grid-cols-3 gap-2">
                          {ROLES.map(({ value, label, icon: RIcon, desc }) => (
                            <button key={value} type="button" onClick={() => set("role", value)}
                              className={`relative flex flex-col items-center text-center p-2.5 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                form.role === value
                                  ? "border-emerald-400 bg-emerald-50/80 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-all ${
                                form.role === value ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                              }`}>
                                <RIcon className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-gray-800">{label}</span>
                              <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</span>
                              {form.role === value && (
                                <div className="am-scaleIn absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <HiCheck className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="reg-bio" className="block text-sm font-semibold text-gray-700">
                          Short Bio <span className="text-gray-400 font-normal text-xs">— Optional</span>
                        </label>
                        <textarea id="reg-bio" rows={3} value={form.bio}
                          onChange={(e) => set("bio", e.target.value)}
                          placeholder="Tell us about your travel style…"
                          maxLength={MAX_BIO + 20}
                          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm p-3.5 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 resize-none transition-all"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <HiInformationCircle className="w-3.5 h-3.5" />Shown on your public profile
                          </p>
                          <span className={`text-xs tabular-nums ${
                            form.bio.length > MAX_BIO * 0.85
                              ? form.bio.length > MAX_BIO ? "text-red-500 font-semibold" : "text-amber-500"
                              : "text-gray-400"
                          }`}>{form.bio.length}/{MAX_BIO}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => { setSignUpStep(1); clearGooglePending?.(); }}
                          className="flex items-center gap-2 px-4 h-11 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                          <HiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button"
                          onClick={() => {
                            if (!bioOk) { setError(`Bio max ${MAX_BIO} chars.`); return; }
                            setError(""); setSignUpStep(3);
                          }}
                          disabled={!bioOk}
                          className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                        >
                          Continue <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3 ── */}
                  {signUpStep === 3 && (
                    <div className="space-y-4 am-stepIn">
                      <InputField
                        id="reg-dob" label="Date of Birth" icon={HiCalendar}
                        type="date" value={form.dateOfBirth}
                        onChange={(v) => set("dateOfBirth", v)}
                        max={todayStr}
                        hint="Helps with age-restricted permits & park fees"
                      />
                      <SelectField
                        id="reg-nationality" label="Nationality"
                        icon={HiLocationMarker} value={form.nationality}
                        onChange={(v) => set("nationality", v)}
                        hint="Affects park entry fees & visa advice"
                      >
                        <option value="">Select nationality…</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>{c.code}  {c.name}  {c.dial}</option>
                        ))}
                      </SelectField>
                      <SelectField
                        id="reg-residence" label="Country of Residence"
                        icon={HiGlobe} value={form.residenceCountry}
                        onChange={(v) => set("residenceCountry", v)}
                        hint="Used for permit cost calculations"
                      >
                        <option value="">Select country…</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>{c.code}  {c.name}</option>
                        ))}
                      </SelectField>
                      <SelectField
                        id="reg-lang" label="Preferred Language"
                        icon={HiTranslate} value={form.preferredLanguage}
                        onChange={(v) => set("preferredLanguage", v)}
                        hint="We'll communicate in this language"
                      >
                        <option value="">Select language…</option>
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </SelectField>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          Profession <span className="text-gray-400 font-normal text-xs">— Optional</span>
                        </label>
                        <button type="button" onClick={() => setProfessionOpen(true)}
                          className={`w-full h-12 rounded-xl border-2 flex items-center gap-3 px-4 text-sm transition-all duration-200 ${
                            form.profession
                              ? "border-emerald-300 bg-emerald-50/50 text-emerald-700 hover:border-emerald-400"
                              : "border-gray-200 bg-gray-50/50 text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          <HiOfficeBuilding className={`w-[18px] h-[18px] flex-shrink-0 ${form.profession ? "text-emerald-500" : "text-gray-400"}`} />
                          <span className="flex-1 text-left truncate">{form.profession || "Select your profession…"}</span>
                          {form.profession
                            ? <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            : <HiPencil className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          }
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Travel Style <span className="text-gray-400 font-normal text-xs">— Optional</span>
                          </span>
                          {form.travelStyles.length > 0 && (
                            <button type="button"
                              onClick={() => setForm((p) => ({ ...p, travelStyles: [] }))}
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >Clear all</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {TRAVEL_STYLES.map(({ label, icon: TravelIcon }) => {
                            const active = form.travelStyles.includes(label);
                            return (
                              <button key={label} type="button" onClick={() => toggleTravelStyle(label)}
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all duration-150 ${
                                  active
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <TravelIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{label}</span>
                                {active && <HiCheck className="w-3 h-3" />}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <HiInformationCircle className="w-3.5 h-3.5" />Select all that apply — or skip
                        </p>
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setSignUpStep(2)}
                          className="flex items-center gap-2 px-4 h-11 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                          <HiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => { setError(""); setSignUpStep(4); }}
                          className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                        >
                          Continue <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 4 ── */}
                  {signUpStep === 4 && (
                    <form onSubmit={handleSignUp} noValidate className="space-y-4 am-stepIn">
                      {/* Avatar + name preview */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200">
                        <div className="relative flex-shrink-0">
                          <div className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                            style={{ width: "68px", height: "68px", padding: "3px" }}>
                            <img src={avatarSrc} alt="Avatar"
                              style={{ width:"100%", height:"100%", borderRadius:"9999px", objectFit:"cover", display:"block", border:"2px solid white" }}
                            />
                          </div>
                          <label className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-emerald-600 hover:scale-110 transition-all ${avatarUploading ? "cursor-wait" : ""}`}>
                            {avatarUploading
                              ? <HiRefresh className="w-3.5 h-3.5 text-white animate-spin" />
                              : <HiPhotograph className="w-3.5 h-3.5 text-white" />
                            }
                            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarUploading} className="sr-only" />
                          </label>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate">
                            {form.fullName || googleUser?.name || "Your Name"}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{form.email || googleUser?.email}</p>
                          <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600">
                            {React.createElement(currentRole?.icon || HiGlobe, { className: "w-3.5 h-3.5" })}
                            {currentRole?.label}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Account Summary</h4>
                        <dl className="space-y-2">
                          {[
                            ["Email",        form.email             || googleUser?.email],
                            ["Phone",        form.phone             || "Not provided"],
                            ["Role",         currentRole?.label],
                            ["Auth",         authMethod === "google" ? "Google" : "Email OTP"],
                            ["Nationality",  form.nationality        || "Not provided"],
                            ["Residence",    form.residenceCountry   || "Not provided"],
                            ["Language",     form.preferredLanguage  || "Not provided"],
                            ["Profession",   form.profession         || "Not provided"],
                            form.travelStyles.length > 0
                              ? ["Travel Style", form.travelStyles.slice(0, 3).join(", ") + (form.travelStyles.length > 3 ? ` +${form.travelStyles.length - 3}` : "")]
                              : null,
                          ].filter(Boolean).map(([dt, dd]) => (
                            <div key={dt} className="flex justify-between text-sm">
                              <dt className="text-gray-500 flex-shrink-0">{dt}</dt>
                              <dd className="font-medium text-gray-800 text-right truncate ml-3 max-w-[160px] sm:max-w-[200px]">{dd}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          form.keepSignedIn ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-gray-400"
                        }`}>
                          {form.keepSignedIn && <HiCheck className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" checked={form.keepSignedIn}
                          onChange={(e) => set("keepSignedIn", e.target.checked)} className="sr-only" />
                        <span className="text-sm text-gray-600">Keep me signed in</span>
                      </label>

                      <label className={`am-auth-terms flex items-start gap-3 cursor-pointer p-4 rounded-xl border group transition-all ${
                        agreeTerms ? "border-emerald-200 bg-emerald-50/50" : termsTouched ? "border-red-200 bg-red-50/60" : "border-gray-200 bg-gray-50"
                      }`}>
                        <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          agreeTerms ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-gray-400"
                        }`}>
                          {agreeTerms && <HiCheck className="w-3 h-3 text-white" />}
                        </div>
                        <input ref={termsInputRef} id="reg-terms" type="checkbox" checked={agreeTerms}
                          onChange={(e) => { setAgreeTerms(e.target.checked); setTermsTouched(true); if (e.target.checked) setError(""); }}
                          aria-invalid={termsTouched && !agreeTerms}
                          aria-describedby={termsTouched && !agreeTerms ? "reg-terms-error" : undefined}
                          required className="sr-only" />
                        <span className="text-sm text-gray-600 leading-relaxed">
                          I agree to the{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer"
                            className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700">Terms</a>
                          {" "}and{" "}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer"
                            className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700">Privacy Policy</a>
                          {termsTouched && !agreeTerms && (
                            <span id="reg-terms-error" role="alert" className="am-auth-field-error block mt-2">
                              Please accept the Terms and Privacy Policy before creating your account.
                            </span>
                          )}
                        </span>
                      </label>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setSignUpStep(3)} disabled={loading || avatarUploading}
                          className="flex items-center gap-2 px-4 h-11 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                          <HiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="submit" disabled={loading || avatarUploading || !isOnline}
                          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                        >
                          {loading || avatarUploading
                            ? <><Spinner /><span>Creating…</span></>
                            : <><span>Create Account</span><HiCheck className="w-4 h-4" /></>
                          }
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center mt-5 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Already have an account? </span>
                    <button onClick={() => switchView("login")}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                    >
                      Sign in <HiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {isFactor && (
                <div className="am-viewIn">
                  <div className="text-center mb-6">
                    <HiShieldCheck className="mx-auto mb-3 h-10 w-10 text-emerald-700" />
                    <h2 id="auth-title" className="text-xl font-extrabold text-gray-900">Verify it’s you</h2>
                    <p className="mt-2 text-sm text-gray-600">Email verified. Complete your additional security check to sign in.</p>
                  </div>
                  <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!isOnline) { setError("You appear to be offline. Reconnect before verifying your sign-in."); return; }
                    setLoading(true); setError("");
                    try { await verifyLoginFactor(factorMethod, factorCode); setFactorCode(""); }
                    catch (err) { setError(formatAuthError(err, "Verification failed.")); }
                    finally { setLoading(false); }
                  }}>
                    {pendingFactorMethods.includes("passkey") && (
                    <button type="button" disabled={loading || !isOnline} onClick={async()=>{if(!isOnline){setError("You appear to be offline. Reconnect before using a passkey.");return;}setLoading(true);setError("");try{await verifyLoginPasskey();setFactorCode("");}catch(err){setError(formatAuthError(err, "Passkey verification failed. Try another verification method."));}finally{setLoading(false);}}} className="mb-3 w-full rounded-xl border border-emerald-700 p-3 font-semibold text-emerald-800 disabled:opacity-50">Use a passkey on this device</button>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {pendingFactorMethods.includes("totp") && (<button type="button" onClick={() => {setFactorMethod("totp");setFactorCode("");setError("");}} className="rounded-xl border px-3 py-2 text-sm"><HiShieldCheck className="mr-1 inline h-4 w-4" />Authenticator app</button> )}
                      {pendingFactorMethods.includes("recovery_code") && (<button type="button" onClick={() => {setFactorMethod("recovery_code");setFactorCode("");setError("");}} className="rounded-xl border px-3 py-2 text-sm"><HiShieldCheck className="mr-1 inline h-4 w-4" />Recovery code</button> )}
                      <button type="button" onClick={() => { setFactorCode(""); setError(""); setShowAuthMethods(false); setModalView("login"); }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Skip passkey / back to sign in</button>
                    </div>
                    <label htmlFor="login-factor-code" className="block text-sm font-medium">{factorMethod === "totp" ? "6-digit authenticator code" : "5-digit recovery code"}</label>
                    <input id="login-factor-code" value={factorCode} onChange={(e) => setFactorCode(e.target.value.replace(/[^0-9]/g, "").slice(0, factorMethod === "totp" ? 6 : 5))} inputMode="numeric" autoComplete="one-time-code" className="w-full rounded-xl border-2 border-gray-200 p-3 text-lg tracking-widest" placeholder={factorMethod === "totp" ? "000000" : "00000"} aria-invalid={Boolean(error)} aria-describedby={error ? "factor-code-error" : undefined} disabled={loading || !isOnline} />
                    {error && <p id="factor-code-error" role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    <button type="submit" disabled={loading || !isOnline || factorCode.length !== (factorMethod === "totp" ? 6 : 5)} className="w-full rounded-xl bg-emerald-700 p-3 font-semibold text-white disabled:opacity-50">{loading ? "Verifying…" : "Verify and sign in"}</button>
                    <p className="text-xs text-gray-500">If you lose access to both methods, request account recovery after signing in on another trusted session or contact support.</p>
                  </form>
                </div>
              )}

              {/* ════════ VERIFY ════════ */}
              {isVerify && (
                <div className="am-viewIn">
                  <div className="text-center mb-5 sm:mb-6">
                    <div className="am-verify-hero-icon inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-100 via-white to-teal-50 mb-3 sm:mb-4 p-3">
                      {codeState === "success"
                        ? <HiCheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                        : <HiShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700" />}
                    </div>
                    <h2 id="auth-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                      {codeState === "success" ? "Email Verified" : "Verify Your Email"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 px-1">Enter the 6-digit security code we sent to</p>
                    <div className="am-verify-email-chip inline-flex items-center gap-2 mt-3 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 max-w-full">
                      <HiMail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="break-all min-w-0">{activeEmail || "No email"}</span>
                    </div>

                    {codeState !== "success" && (
                      <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        codeExpired
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : codeExpiry <= 30
                            ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                            : codeExpiry <= 120
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}>
                        {codeExpired ? (
                          <><HiExclamationCircle className="w-4 h-4" /><span>Code expired — request a new one</span></>
                        ) : (
                          <><HiInformationCircle className="w-4 h-4" />
                            <span>Expires in <strong className="tabular-nums font-bold">{formatExpiry(codeExpiry)}</strong></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); doVerify(code.join("")); }} noValidate className="am-verify-form space-y-4 sm:space-y-5">
                    <div
                      className={`am-verify-code-row flex justify-center gap-2 sm:gap-3 ${codeState === "verifying" ? "animate-pulse" : ""} ${codeState === "error" ? "am-shake" : ""}`}
                      onPaste={handleCodePaste} role="group" aria-label="Verification code"
                    >
                      {code.map((digit, i) => (
                        <input key={i}
                          ref={(el) => { codeRefs.current[i] = el; }}
                          type="text" inputMode="numeric" pattern="[0-9]"
                          maxLength={1} value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKey(i, e)}
                          disabled={codeState === "verifying" || codeState === "success" || codeExpired}
                          className={`am-verify-digit text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border-2 outline-none transition-all duration-200 ${
                            codeExpired
                              ? "border-red-200 bg-red-50/50 text-red-300 cursor-not-allowed"
                              : codeState === "success"
                                ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                                : codeState === "error"
                                  ? "border-red-300 bg-red-50"
                                  : digit
                                    ? "border-emerald-400 bg-emerald-50/50 text-gray-900"
                                    : "border-gray-200 bg-gray-50/50 text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          }`}
                          aria-label={`Digit ${i + 1} of 6`}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          aria-invalid={codeState === "error"}
                          aria-describedby={error ? "verify-code-error" : "verify-code-help"}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" onClick={handlePasteCodeButton}
                        disabled={loading || codeState === "success" || codeExpired}
                        className="am-verify-utility-btn inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <HiClipboardCopy className="w-4 h-4" /> Paste code
                      </button>
                      <button type="button" onClick={() => { setCode(emptyCode()); setCodeState(""); setError(""); codeRefs.current[0]?.focus(); }}
                        disabled={!code.some(Boolean) || loading || codeState === "success" || codeExpired}
                        className="am-verify-utility-btn inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <HiX className="w-4 h-4" /> Clear code
                      </button>
                    </div>
                    <p id="verify-code-help" className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                      <HiInformationCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      You can paste all 6 digits into any box.
                    </p>
                    {error && <p id="verify-code-error" role="alert" className="am-verify-inline-error text-center text-sm text-red-600 flex items-center justify-center gap-2"><HiExclamationCircle className="w-4 h-4 flex-shrink-0" />{error}</p>}

                    {codeState === "success" && (
                      <div className="am-slideDown flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                        <HiCheckCircle className="w-5 h-5" /> Verified! Redirecting…
                      </div>
                    )}

                    <button type="submit"
                      disabled={loading || code.join("").length !== 6 || codeState === "verifying" || codeState === "success" || codeExpired}
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading || codeState === "verifying" ? (
                        <><Spinner /><span>Verifying…</span></>
                      ) : codeState === "success" ? (
                        <><HiCheckCircle className="w-5 h-5" /><span>Verified!</span></>
                      ) : codeExpired ? (
                        <><HiExclamationCircle className="w-5 h-5" /><span>Code Expired</span></>
                      ) : (
                        <><span>Verify & Continue</span><HiArrowRight className="w-4 h-4" /></>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={handleBackFromVerify} disabled={loading}
                        className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-gray-600 font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-all sm:w-auto w-full"
                      >
                        <HiArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button type="button" onClick={handleResend} disabled={resendTimer > 0 || loading}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-emerald-600 font-semibold text-sm border-2 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <HiRefresh className={`w-4 h-4 ${resendTimer > 0 || loading ? "animate-spin" : ""}`} />
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>{/* end scrollable body */}

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <RiShieldKeyholeLine className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL encryption • We never share your data
              </p>
            </div>

          </div>{/* end form panel */}
        </div>{/* end modal */}
      </div>{/* end backdrop */}
    </>
  );
}