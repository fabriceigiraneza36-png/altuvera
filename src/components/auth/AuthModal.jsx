/**
 * AuthModal.jsx
 * Professional authentication modal with Google OAuth integration
 * Supports multi-step signup, email verification, and secure session management
 */

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
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useUserAuth } from "../../context/UserAuthContext";
import logoimg from "../../assets/altuvera.png";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
import "./AuthModal.css";

// ============================================================================
// Side Media (Images + Videos)
// ============================================================================

const SIDE_MEDIA = [
  {
    type: "image",
    src: "https://i.pinimg.com/736x/9a/56/27/9a5627c41868a6f8861341e82df30b84.jpg",
    alt: "Safari landscape",
  },
  {
    type: "image",
    src: "https://i.pinimg.com/736x/c2/26/91/c22691ef2c1f5a1e9544ec1e62774740.jpg",
    alt: "Wildlife in East Africa",
  },
  {
    type: "video",
    // Public sample video (Google Cloud bucket) - reliable for autoplay tests
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://i.pinimg.com/736x/9a/56/27/9a5627c41868a6f8861341e82df30b84.jpg",
    alt: "Savanna wildlife video",
  },
  {
    type: "image",
    src: "https://i.pinimg.com/1200x/37/97/46/37974679b2a1c892e16ba2fda5aa9914.jpg",
    alt: "Elephants at sunset",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1400&auto=format&fit=crop&q=70",
    alt: "Mountain landscape in East Africa",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://i.pinimg.com/1200x/37/97/46/37974679b2a1c892e16ba2fda5aa9914.jpg",
    alt: "Elephants Dream sample video",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1400&auto=format&fit=crop&q=70",
    alt: "Safari jeep at golden hour",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&auto=format&fit=crop&q=70",
    alt: "Sintel sample video",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&auto=format&fit=crop&q=70",
    alt: "Sunrise over savanna",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=70",
    alt: "For Bigger Blazes sample video",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&auto=format&fit=crop&q=70",
    alt: "Elephant close-up in the wild",
  },
];

const clampIndex = (idx, length) => {
  if (length <= 0) return 0;
  return ((idx % length) + length) % length;
};

const getAnimVariant = (idx) => String(((Number(idx) || 0) % 5) + 1);

const SideMediaRotator = ({ items = SIDE_MEDIA, intervalMs = 6500 }) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const [index, setIndex] = useState(0);
  const [navDir, setNavDir] = useState("next"); // "next" | "prev"
  const [outgoing, setOutgoing] = useState(null);
  const outgoingTimerRef = useRef(null);
  const lastIndexRef = useRef(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const goTo = useCallback(
    (nextIndex) => {
      setIndex((prev) =>
        clampIndex(typeof nextIndex === "number" ? nextIndex : prev, safeItems.length),
      );
    },
    [safeItems.length],
  );

  const next = useCallback(() => {
    setNavDir("next");
    setIndex((prev) => clampIndex(prev + 1, safeItems.length));
  }, [safeItems.length]);

  const prev = useCallback(() => {
    setNavDir("prev");
    setIndex((prev) => clampIndex(prev - 1, safeItems.length));
  }, [safeItems.length]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (safeItems.length <= 1) return undefined;
    if (outgoingTimerRef.current) clearTimeout(outgoingTimerRef.current);

    const prevIdx = lastIndexRef.current;
    const prevItem = safeItems[clampIndex(prevIdx, safeItems.length)];
    const nextItem = safeItems[clampIndex(index, safeItems.length)];

    if (prevItem && nextItem && prevIdx !== index) {
      setOutgoing({
        item: prevItem,
        idx: prevIdx,
        key: `${Date.now()}-${prevIdx}-${prevItem?.src || ""}`,
      });
      outgoingTimerRef.current = setTimeout(() => setOutgoing(null), 760);
    }

    lastIndexRef.current = index;
    return () => {
      if (outgoingTimerRef.current) clearTimeout(outgoingTimerRef.current);
      outgoingTimerRef.current = null;
    };
  }, [index, safeItems]);

  useEffect(() => {
    if (safeItems.length <= 1) return undefined;
    clearTimer();

    const current = safeItems[index];
    const isVideo = current?.type === "video";

    if (!isVideo) {
      timerRef.current = setTimeout(next, intervalMs);
      return undefined;
    }

    // For videos: attempt autoplay; advance on end; also fallback to interval.
    timerRef.current = setTimeout(next, Math.max(intervalMs, 12000));
    return undefined;
  }, [clearTimer, index, intervalMs, next, safeItems]);

  useEffect(() => {
    const current = safeItems[index];
    if (current?.type !== "video") return undefined;

    const el = videoRef.current;
    if (!el) return undefined;

    const tryPlay = () => {
      el.muted = true;
      const p = el.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    tryPlay();

    const onEnded = () => next();
    const onLoaded = () => {
      // If duration is known and reasonable, schedule a precise advance.
      const d = Number(el.duration);
      if (!Number.isFinite(d) || d <= 0) return;
      clearTimer();
      timerRef.current = setTimeout(next, Math.min(30000, Math.max(6000, d * 1000 + 400)));
    };

    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [clearTimer, index, next, safeItems]);

  const handleDoubleClick = useCallback(
    (event) => {
      if (safeItems.length <= 1) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (event.clientX < midX) prev();
      else next();
    },
    [next, prev, safeItems.length],
  );

  const [videoError, setVideoError] = useState(false);

  const current = safeItems[clampIndex(index, safeItems.length)];
  const [mediaLoading, setMediaLoading] = useState(true);

  // Reset video error when index changes
  useEffect(() => {
    setVideoError(false);
  }, [index]);

  useEffect(() => {
    setMediaLoading(true);
  }, [index]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleMediaReady = useCallback(() => {
    setMediaLoading(false);
  }, []);

  const renderLayer = useCallback(
    ({ item, idx, phase, layerKey }) => {
      if (!item) return null;
      const isVideo = item?.type === "video";
      const variant = getAnimVariant(idx);

      if (isVideo) {
        // Keep video transition simple (fade) while images get slide-in/out.
        return (
          <video
            key={layerKey}
            ref={phase === "in" ? videoRef : undefined}
            className={`auth-side-media__el auth-side-media__layer is-video is-${phase}`}
            poster={item.poster}
            autoPlay
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            crossOrigin="anonymous"
            onLoadedData={phase === "in" ? handleMediaReady : undefined}
            onError={phase === "in" ? () => {
              handleVideoError();
              handleMediaReady();
            } : undefined}
            aria-label={item.alt || "Background video"}
          >
            <source src={item.src} type="video/mp4" />
          </video>
        );
      }

      return (
        <img
          key={layerKey}
          className={`auth-side-media__el auth-side-media__layer is-image is-${phase}`}
          data-anim={variant}
          src={item?.src}
          alt={item?.alt || ""}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={phase === "in" ? handleMediaReady : undefined}
          onError={phase === "in" ? handleMediaReady : undefined}
        />
      );
    },
    [handleMediaReady, handleVideoError],
  );

  return (
    <div
      className="auth-side-media"
      data-dir={navDir}
      onDoubleClick={handleDoubleClick}
    >
      {outgoing?.item && renderLayer({
        item: outgoing.item,
        idx: outgoing.idx,
        phase: "out",
        layerKey: outgoing.key,
      })}

      {renderLayer({
        item: current?.type === "video" && videoError ? null : current,
        idx: index,
        phase: "in",
        layerKey: `in-${index}-${current?.src || ""}`,
      })}

      {mediaLoading && (
        <div className="auth-side-media__loading" aria-hidden="true">
          <div className="auth-side-media__spinner" />
        </div>
      )}

      {safeItems.length > 1 && (
        <div className="auth-side-hint" aria-hidden="true">
          Double-click left/right to change
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Constants & Configuration
// ============================================================================

const CODE_VALIDITY_MINUTES = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s\-()]{6,}$/;
const MAX_BIO_LENGTH = 300;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB to match context limit

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Traveler",
    icon: HiGlobe,
    description: "Explore destinations",
    color: "#3b82f6",
  },
  {
    value: "photographer",
    label: "Photographer",
    icon: HiPhotograph,
    description: "Capture moments",
    color: "#8b5cf6",
  },
  {
    value: "planner",
    label: "Travel Planner",
    icon: HiSparkles,
    description: "Create itineraries",
    color: "#059669",
  },
];

// Utility Functions
// ============================================================================

const emptyCode = () => ["", "", "", "", "", ""];

const utf8ToBase64 = (value) => {
  const encoded = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return window.btoa(encoded);
};

const getInitials = (value = "") => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase());
  return parts.length > 0 ? parts.join("") : "U";
};

const buildInitialAvatar = (nameOrEmail, color = "#059669") => {
  const initials = getInitials(nameOrEmail);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:1" /><stop offset="100%" style="stop-color:${color};stop-opacity:0.8" /></linearGradient></defs><rect width="128" height="128" rx="24" fill="url(#grad)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="600" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });

const formatPhoneNumber = (value) => {
  // Remove all non-numeric characters except +
  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned;
};

const InlineSpinner = ({ label = "Loading" }) => (
  <span className="auth-inline-spinner" role="status" aria-label={label} />
);

// ============================================================================
// Main Component
// ============================================================================

export default function AuthModal() {
  // ---------------------------------------------------------------------------
  // Context & Hooks
  // ---------------------------------------------------------------------------
  const {
    isModalOpen,
    modalView,
    setModalView,
    closeModal,
    login,
    register,
    verifyCode,
    resendCode,
    pendingEmail,
    persistSession,
    setSessionPreference,
    googleUser,
    googleLoaded,
    googleLoading,
    githubLoading,
    hasGooglePending,
    promptGoogleAuth,
    startGithubAuth,
    completeGoogleSignUp,
    clearGooglePending,
    socialAuthError,
    clearSocialAuthError,
    uploadAvatar,
  } = useUserAuth();

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    bio: "",
    role: "user",
    keepSignedIn: persistSession,
    avatarFile: null,
    avatarPreview: "",
  });

  const [signInStep, setSignInStep] = useState(1);
  const [signUpStep, setSignUpStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [code, setCode] = useState(emptyCode());
  const [resendTimer, setResendTimer] = useState(0);
  const [verifySource, setVerifySource] = useState("login");
  const [authMethod, setAuthMethod] = useState("email");
  const [codeRowState, setCodeRowState] = useState(""); // "" | "verifying" | "success" | "error"
  const [googleBadgeImageLoading, setGoogleBadgeImageLoading] = useState(false);
  const [profileAvatarImageLoading, setProfileAvatarImageLoading] =
    useState(false);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const previousTitleRef = useRef(document.title);
  const wasOpenRef = useRef(false);
  const codeRefs = useRef([]);
  const googleFallbackRef = useRef(null);
  const firstInputRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const isLogin = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify = modalView === "verify";

  const activeEmail = (
    pendingEmail ||
    formData.email ||
    googleUser?.email ||
    ""
  ).trim();

  const isEmailValid = EMAIL_REGEX.test(formData.email.trim());
  const isNameValid = formData.fullName.trim().length >= 2;
  const isPhoneValid =
    !formData.phone.trim() || PHONE_REGEX.test(formData.phone.trim());
  const isBioValid = formData.bio.trim().length <= MAX_BIO_LENGTH;
  const isSocialBusy = googleLoading || githubLoading || loading;

  const titleByView = useMemo(
    () => ({
      login: "Sign In | Altuvera",
      register: "Sign Up | Altuvera",
      verify: "Verify Email | Altuvera",
    }),
    [],
  );

  const currentRole = useMemo(
    () => ROLE_OPTIONS.find((r) => r.value === formData.role),
    [formData.role],
  );

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Document title management
  useEffect(() => {
    if (isModalOpen && !wasOpenRef.current) {
      previousTitleRef.current = document.title;
    }

    if (isModalOpen) {
      document.title = titleByView[modalView] || "Account | Altuvera";
    } else if (wasOpenRef.current) {
      document.title = previousTitleRef.current;
    }

    wasOpenRef.current = isModalOpen;
  }, [isModalOpen, modalView, titleByView]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalOpen]);

  // Sync Google user data
  useEffect(() => {
    if (googleUser && isRegister && signUpStep === 1) {
      setFormData((prev) => ({
        ...prev,
        email: googleUser.email || prev.email,
        fullName: googleUser.name || prev.fullName,
        avatarPreview: googleUser.picture || prev.avatarPreview,
      }));

      setSignUpStep(2);
      setAuthMethod("google");
      setSuccess(
        "✓ Google account connected! Complete your profile to continue.",
      );
    }
  }, [googleUser, isRegister, signUpStep]);

  // Reset form on modal state change
  useEffect(() => {
    if (!isModalOpen) return;

    setError("");
    setSuccess("");
    setCode(emptyCode());
    setResendTimer(0);
    setAuthMethod("email");
    setCodeRowState("");

    if (isLogin) {
      setSignInStep(1);
    }

    if (isRegister && !hasGooglePending) {
      setSignUpStep(1);
      setFormData((prev) => ({
        ...prev,
        email: "",
        fullName: "",
        phone: "",
        bio: "",
        avatarFile: null,
        avatarPreview: "",
      }));
    }

    setFormData((prev) => ({ ...prev, keepSignedIn: persistSession }));

    // Focus first input after animation
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 300);
  }, [isLogin, isModalOpen, isRegister, persistSession, hasGooglePending]);

  useEffect(() => {
    if (socialAuthError) {
      setError(socialAuthError);
    }
  }, [socialAuthError]);

  useEffect(() => {
    if (googleUser?.picture) {
      setGoogleBadgeImageLoading(true);
      setProfileAvatarImageLoading(true);
    }
  }, [googleUser?.picture]);

  useEffect(() => {
    if (formData.avatarPreview) {
      setProfileAvatarImageLoading(true);
    }
  }, [formData.avatarPreview]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError("");
      setSuccess("");
      clearSocialAuthError();
    },
    [clearSocialAuthError],
  );

  const switchView = useCallback(
    (view) => {
      if (loading) return;

      setModalView(view);
      setError("");
      setSuccess("");
      setCode(emptyCode());
      setAuthMethod("email");
      clearSocialAuthError();

      if (view === "login") {
        setSignInStep(1);
        clearGooglePending();
      }

      if (view === "register" && !hasGooglePending) {
        setSignUpStep(1);
        setFormData((prev) => ({
          ...prev,
          email: "",
          fullName: "",
          phone: "",
          bio: "",
          avatarPreview: "",
        }));
      }
    },
    [
      clearGooglePending,
      clearSocialAuthError,
      hasGooglePending,
      loading,
      setModalView,
    ],
  );

  const handleGoogleAuth = useCallback(
    async (mode = "signin") => {
      if (!googleLoaded || isSocialBusy) return;

      clearSocialAuthError();
      setError("");
      setSuccess("");

      try {
        const result = await promptGoogleAuth({
          mode,
          fallbackElement: googleFallbackRef.current,
        });

        if (mode === "signup" && result) {
          setSuccess("✓ Google account connected! Complete your profile.");
        }
      } catch (err) {
        const message = err?.message || "Google authentication failed.";

        // User-friendly error messages
        if (message.includes("popup") || message.includes("closed")) {
          setError("Sign-in window was closed. Please try again.");
        } else if (message.includes("network")) {
          setError("Network error. Please check your connection.");
        } else {
          setError(message);
        }
      }
    },
    [clearSocialAuthError, googleLoaded, isSocialBusy, promptGoogleAuth],
  );

  const handleGithubAuth = useCallback(
    (mode = "signin") => {
      if (isSocialBusy) return;
      clearSocialAuthError();
      setError("");
      setSuccess("");

      try {
        startGithubAuth(mode);
      } catch (err) {
        setError(err?.message || "GitHub authentication failed.");
      }
    },
    [clearSocialAuthError, isSocialBusy, startGithubAuth],
  );

  const handleAvatarFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, GIF, or WebP).");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5MB or less.");
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: preview,
      }));
      setError("");
    } catch {
      setError("Unable to preview this image. Please try another file.");
    }
  }, []);

  const resolveAvatarValue = useCallback(async () => {
    // Use Google avatar if available and no custom upload
    if (googleUser?.picture && !formData.avatarFile) {
      return googleUser.picture;
    }

    const fallback =
      formData.avatarPreview ||
      buildInitialAvatar(
        formData.fullName || formData.email,
        currentRole?.color,
      );

    if (!formData.avatarFile) {
      return fallback;
    }

    setAvatarUploading(true);
    try {
      const uploadedUrl = await uploadAvatar(formData.avatarFile);
      return uploadedUrl;
    } catch (err) {
      console.warn("Avatar upload failed:", err.message);
      setSuccess(
        "Using placeholder avatar. You can update it later in your profile.",
      );
      return fallback;
    } finally {
      setAvatarUploading(false);
    }
  }, [
    currentRole?.color,
    formData.avatarFile,
    formData.avatarPreview,
    formData.email,
    formData.fullName,
    googleUser?.picture,
    uploadAvatar,
  ]);

  // ---------------------------------------------------------------------------
  // Email Sign-In Handlers
  // ---------------------------------------------------------------------------

  const handleSignInNext = useCallback(() => {
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSignInStep(2);
  }, [isEmailValid]);

  const handleSignInSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!isEmailValid || !isNameValid) {
        setError("Please complete your email and full name.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setVerifySource("login");
        setAuthMethod("email");
        setSessionPreference(formData.keepSignedIn);

        await login({
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          persistSession: formData.keepSignedIn,
        });

        setSuccess(
          `✓ Verification code sent to ${formData.email}. Valid for ${CODE_VALIDITY_MINUTES} minutes.`,
        );
        setCode(emptyCode());
      } catch (submitError) {
        setError(submitError.message || "Sign in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      formData.email,
      formData.fullName,
      formData.keepSignedIn,
      isEmailValid,
      isNameValid,
      login,
      setSessionPreference,
      authMethod,
    ],
  );

  // ---------------------------------------------------------------------------
  // Sign-Up Handlers
  // ---------------------------------------------------------------------------

  const goToSignUpNextStep = useCallback(() => {
    if (signUpStep === 2) {
      if (!isPhoneValid) {
        setError("Phone format looks invalid. Please check it.");
        return;
      }

      if (!isBioValid) {
        setError(`Bio must be ${MAX_BIO_LENGTH} characters or less.`);
        return;
      }

      setError("");
      setSignUpStep(3);
    }
  }, [isBioValid, isPhoneValid, signUpStep]);

  const handleSignUpSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!agreeTerms) {
        setError(
          "Please accept the Terms of Service and Privacy Policy to continue.",
        );
        return;
      }

      if (authMethod === "google" && !hasGooglePending) {
        setError(
          "Google authentication is required. Please sign in with Google first.",
        );
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setVerifySource("register");
        setSessionPreference(formData.keepSignedIn);

        const avatar = await resolveAvatarValue();

        if (authMethod === "google") {
          await completeGoogleSignUp({
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            bio: formData.bio.trim(),
            role: formData.role,
            avatar,
          });
        } else {
          await register({
            email: formData.email.trim(),
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            bio: formData.bio.trim(),
            role: formData.role,
            avatar,
            persistSession: formData.keepSignedIn,
          });
        }

        setSuccess(
          authMethod === "google"
            ? "✓ Account created successfully! Welcome to Altuvera."
            : `✓ Almost there! Verification code sent to ${formData.email}.`,
        );
      } catch (submitError) {
        setError(submitError.message || "Sign up failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      authMethod,
      formData.email,
      register,
      agreeTerms,
      completeGoogleSignUp,
      formData.bio,
      formData.fullName,
      formData.keepSignedIn,
      formData.phone,
      formData.role,
      hasGooglePending,
      resolveAvatarValue,
      setSessionPreference,
    ],
  );

  // ---------------------------------------------------------------------------
  // Verification Code Handlers
  // ---------------------------------------------------------------------------

  const handleCodeChange = useCallback(
    (index, nextValue) => {
      if (!/^[0-9]?$/.test(nextValue)) return;

      const nextCode = [...code];
      nextCode[index] = nextValue;
      setCode(nextCode);
      setError("");
      setCodeRowState("");

      if (nextValue && index < codeRefs.current.length - 1) {
        codeRefs.current[index + 1]?.focus();
      }
    },
    [code],
  );

  const handleCodeKeyDown = useCallback(
    (index, event) => {
      if (event.key === "Backspace" && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  const handleCodePaste = useCallback((event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const nextCode = emptyCode();
    pasted.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    setCodeRowState("");
    const nextFocusIndex = Math.min(pasted.length, 5);
    codeRefs.current[nextFocusIndex]?.focus();
  }, []);

  const doVerify = useCallback(
    async (codeValue) => {
      if (!activeEmail) {
        setError("Missing email. Please restart sign in/sign up.");
        return;
      }

      if (codeValue.length !== 6) {
        setError("Please enter the full 6-digit verification code.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        setCodeRowState("verifying");
        await verifyCode(activeEmail, codeValue);
        setCodeRowState("success");
      } catch (verifyError) {
        setCodeRowState("error");
        setError(
          verifyError.message || "Verification failed. Please try again.",
        );
        // Reset error state animation after delay
        setTimeout(() => setCodeRowState(""), 800);
      } finally {
        setLoading(false);
      }
    },
    [activeEmail, verifyCode],
  );

  const handleVerifySubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const codeValue = code.join("");
      await doVerify(codeValue);
    },
    [code, doVerify],
  );

  // *** AUTO-VERIFY: trigger when all 6 digits are filled ***
  useEffect(() => {
    const codeValue = code.join("");
    if (
      codeValue.length === 6 &&
      isVerify &&
      !loading &&
      codeRowState !== "verifying"
    ) {
      // Small delay so the user sees the last digit appear
      const timer = setTimeout(() => {
        doVerify(codeValue);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [code, isVerify, loading, codeRowState, doVerify]);

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;

    try {
      setLoading(true);
      setError("");
      await resendCode(activeEmail);
      setSuccess(
        `✓ New verification code sent to ${activeEmail}. Valid for ${CODE_VALIDITY_MINUTES} minutes.`,
      );
      setResendTimer(60);
      setCode(emptyCode());
      codeRefs.current[0]?.focus();
    } catch (resendError) {
      setError(
        resendError.message || "Unable to resend code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeEmail, loading, resendCode, resendTimer]);

  const handleBackFromVerify = useCallback(() => {
    setCode(emptyCode());
    setError("");
    setSuccess("");
    setModalView(verifySource);
  }, [setModalView, verifySource]);

  // ---------------------------------------------------------------------------
  // Render Guards
  // ---------------------------------------------------------------------------

  if (!isModalOpen) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeModal}
      role="presentation"
      aria-hidden={!isModalOpen}
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Side Panel - NEW */}
        <div className="auth-side-panel">
          <SideMediaRotator />
          <div className="auth-side-overlay" />
          <div className="auth-side-content">
            <h3 className="auth-side-title">Discover East Africa</h3>
            <p className="auth-side-text">Join thousands of travelers exploring the wild beauty and ancient culture of the Rift Valley.</p>
          </div>
        </div>

        <div className="auth-main-panel">
          {/* ===== HEADER ===== */}
          <header className="auth-modal-header">
            <div className="auth-modal-brand">
              <div className="auth-brand-logo">
                <div className="auth-brand-icon">
                  <img
                    src={logoimg}
                    alt="Altuvera"
                    className="auth-brand-icon-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="auth-brand-glow" aria-hidden="true" />
              </div>
              <div className="auth-brand-info">
                <span className="auth-brand-text">Altuvera</span>
                <span className="auth-brand-tagline">Premium Adventures</span>
              </div>
            </div>

            <button
              className="auth-close-btn"
              onClick={closeModal}
              aria-label="Close authentication modal"
              type="button"
            >
              <HiX aria-hidden="true" />
            </button>
          </header>

        {/* ===== TABS ===== */}
        {!isVerify && (
          <div
            className="auth-modal-tabs"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
              onClick={() => switchView("login")}
              role="tab"
              aria-selected={isLogin}
              aria-controls="login-panel"
            >
              <HiLockClosed aria-hidden="true" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab ${isRegister ? "auth-tab--active" : ""}`}
              onClick={() => switchView("register")}
              role="tab"
              aria-selected={isRegister}
              aria-controls="register-panel"
            >
              <HiSparkles aria-hidden="true" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* ===== CONTENT ===== */}
        <main className="auth-modal-content">
          {/* Messages */}
          {error && (
            <div className="auth-message auth-message--error" role="alert">
              <HiExclamationCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-message auth-message--success" role="status">
              <HiCheckCircle aria-hidden="true" />
              <span>{success}</span>
            </div>
          )}

          {/* ===== LOGIN VIEW ===== */}
          {isLogin && (
            <div
              className={`auth-view auth-view--login auth-view--step-${signInStep}`}
              id="login-panel"
              role="tabpanel"
              aria-labelledby="login-tab"
            >
              <div className="auth-view-header">
                <div className="auth-view-icon auth-view-icon--signin">
                  <HiShieldCheck aria-hidden="true" />
                </div>
                <h2 id="auth-modal-title">Welcome Back</h2>
                <p>Sign in to access your travel dashboard</p>
              </div>

              {/* Combined View: Email/Username First, Google Optional */}
              <div
                className="auth-form auth-form--animated"
                key="signin-combined"
              >
                <form className="auth-form" onSubmit={handleSignInSubmit}>
                  <label className="auth-field">
                    <span className="auth-field-label">Email Address</span>
                    <div className="auth-input-wrap">
                      <HiMail className="auth-input-icon" aria-hidden="true" />
                      <EmailAutocompleteInput
                        ref={firstInputRef}
                        value={formData.email}
                        onValueChange={(next) => updateField("email", next)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        aria-invalid={
                          !isEmailValid && formData.email.length > 0
                        }
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span className="auth-field-label">
                      Full Name / Username
                    </span>
                    <div className="auth-input-wrap">
                      <HiUser className="auth-input-icon" aria-hidden="true" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) =>
                          updateField("fullName", event.target.value)
                        }
                        placeholder="Your name or username"
                        autoComplete="username"
                        required
                        minLength={2}
                        aria-invalid={
                          !isNameValid && formData.fullName.length > 0
                        }
                      />
                    </div>
                  </label>

                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.keepSignedIn}
                      onChange={(event) =>
                        updateField("keepSignedIn", event.target.checked)
                      }
                    />
                    <span>Keep me signed in on this device</span>
                  </label>

                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={loading || !isEmailValid || !isNameValid}
                    aria-busy={loading}
                  >
                    {loading && (
                      <InlineSpinner label="Sending verification code" />
                    )}
                    <span>
                      {loading ? "Sending Code..." : "Continue with Email"}
                    </span>
                    <HiArrowRight aria-hidden="true" />
                  </button>

                  <div className="auth-divider" role="separator">
                    <span>or sign in with</span>
                  </div>

                  {!githubLoading && (
                    <button
                      type="button"
                      className="auth-btn auth-btn--google"
                      onClick={() => handleGoogleAuth("signin")}
                      disabled={!googleLoaded || googleLoading || loading}
                      aria-busy={googleLoading}
                    >
                      {googleLoading && (
                        <InlineSpinner label="Connecting to Google" />
                      )}
                      {!googleLoading && (
                        <FcGoogle
                          className="auth-google-icon"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {googleLoading
                          ? "Authenticating Google..."
                          : "Continue with Google"}
                      </span>
                    </button>
                  )}

                  {!googleLoading && (
                    <button
                      type="button"
                      className="auth-btn auth-btn--github"
                      onClick={() => handleGithubAuth("signin")}
                      disabled={githubLoading || loading}
                      aria-busy={githubLoading}
                    >
                      {githubLoading && (
                        <InlineSpinner label="Connecting to GitHub" />
                      )}
                      {!githubLoading && (
                        <FiGithub
                          className="auth-github-icon"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {githubLoading
                          ? "Authenticating GitHub..."
                          : "Continue with GitHub"}
                      </span>
                    </button>
                  )}
                </form>

                <div className="auth-google-fallback-wrap">
                  <div ref={googleFallbackRef} />
                </div>
              </div>

              <p className="auth-switch-hint">
                <span>New to Altuvera?</span>
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchView("register")}
                >
                  Create an account
                </button>
              </p>
            </div>
          )}

          {/* ===== REGISTER VIEW ===== */}
          {isRegister && (
            <div
              className={`auth-view auth-view--register auth-view--step-${signUpStep}`}
              id="register-panel"
              role="tabpanel"
              aria-labelledby="register-tab"
            >
              <div className="auth-view-header">
                <div className="auth-view-icon auth-view-icon--signup">
                  <HiGlobe aria-hidden="true" />
                </div>
                <h2 id="auth-modal-title">
                  {signUpStep === 1
                    ? "Choose Sign-Up Method"
                    : signUpStep === 2
                      ? "Complete Your Profile"
                      : "Final Confirmation"}
                </h2>
                <p>
                  {signUpStep === 1
                    ? "Join our community to start your journey"
                    : signUpStep === 2
                      ? "Tell us about yourself and your travel interests"
                      : "Review your information and create your account"}
                </p>
              </div>

              {/* Progress Indicator */}
              <div
                className="auth-progress"
                role="progressbar"
                aria-valuenow={signUpStep}
                aria-valuemin="1"
                aria-valuemax="3"
              >
                {[
                  { num: 1, label: "Method" },
                  { num: 2, label: "Profile" },
                  { num: 3, label: "Done" },
                ].map((step) => (
                  <div
                    key={step.num}
                    className={`auth-progress-step ${
                      signUpStep >= step.num ? "auth-progress-step--active" : ""
                    } ${signUpStep > step.num ? "auth-progress-step--completed" : ""}`}
                  >
                    <div className="auth-progress-circle">
                      {signUpStep > step.num ? (
                        <HiCheck aria-hidden="true" />
                      ) : (
                        step.num
                      )}
                    </div>
                    <span className="auth-progress-label">{step.label}</span>
                  </div>
                ))}
                <div className="auth-progress-line" aria-hidden="true">
                  <div
                    className="auth-progress-line-fill"
                    style={{ width: `${((signUpStep - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>

              {signUpStep === 1 && (
                <div
                  className="auth-form auth-form--animated"
                  key="signup-step-1"
                >
                  {!hasGooglePending ? (
                    <>
                      <div className="auth-form-group">
                        <label className="auth-field">
                          <span className="auth-field-label">
                            Email Address
                          </span>
                          <div className="auth-input-wrap">
                            <HiMail
                              className="auth-input-icon"
                              aria-hidden="true"
                            />
                            <EmailAutocompleteInput
                              ref={firstInputRef}
                              value={formData.email}
                              onValueChange={(next) =>
                                updateField("email", next)
                              }
                              placeholder="traveler@example.com"
                              autoComplete="email"
                              required
                            />
                          </div>
                        </label>
                        <label className="auth-field">
                          <span className="auth-field-label">Full Name</span>
                          <div className="auth-input-wrap">
                            <HiUser
                              className="auth-input-icon"
                              aria-hidden="true"
                            />
                            <input
                              type="text"
                              value={formData.fullName}
                              onChange={(event) =>
                                updateField("fullName", event.target.value)
                              }
                              placeholder="Your full name"
                              autoComplete="name"
                              required
                            />
                          </div>
                        </label>
                      </div>

                      <button
                        type="button"
                        className="auth-btn auth-btn--primary"
                        onClick={() => {
                          if (isEmailValid && isNameValid) {
                            setSignUpStep(2);
                            setAuthMethod("email");
                          } else {
                            setError(
                              "Please enter a valid email and full name.",
                            );
                          }
                        }}
                        disabled={!isEmailValid || !isNameValid}
                      >
                        <span>Create Account with Email</span>
                        <HiArrowRight aria-hidden="true" />
                      </button>

                      <div className="auth-divider" role="separator">
                        <span>or sign up with</span>
                      </div>

                      {!githubLoading && (
                        <button
                          type="button"
                          className="auth-btn auth-btn--google"
                          onClick={() => handleGoogleAuth("signup")}
                          disabled={!googleLoaded || googleLoading || loading}
                          aria-busy={googleLoading}
                        >
                          {googleLoading && (
                            <InlineSpinner label="Connecting to Google" />
                          )}
                          {!googleLoading && (
                            <FcGoogle
                              className="auth-google-icon"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {googleLoading
                              ? "Authenticating Google..."
                              : "Continue with Google"}
                          </span>
                        </button>
                      )}

                      {!googleLoading && (
                        <button
                          type="button"
                          className="auth-btn auth-btn--github"
                          onClick={() => handleGithubAuth("signup")}
                          disabled={githubLoading || loading}
                          aria-busy={githubLoading}
                        >
                          {githubLoading && (
                            <InlineSpinner label="Connecting to GitHub" />
                          )}
                          {!githubLoading && (
                            <FiGithub
                              className="auth-github-icon"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {githubLoading
                              ? "Authenticating GitHub..."
                              : "Continue with GitHub"}
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="auth-google-connected">
                      <HiCheckCircle size={48} color="var(--auth-primary)" />
                      <h3>Google Connected</h3>
                      <p>Success! Click continue to finalize your profile.</p>
                      <button
                        className="auth-btn auth-btn--primary"
                        onClick={() => setSignUpStep(2)}
                      >
                        <span>Continue Setup</span>
                        <HiArrowRight />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Profile Details */}
              {signUpStep === 2 && (
                <div
                  className="auth-form auth-form--animated"
                  key="signup-step-2"
                >
                  {googleUser && (
                    <div className="auth-google-badge">
                      <div className="auth-image-shell auth-image-shell--sm">
                        {googleBadgeImageLoading && (
                          <span
                            className="auth-image-loader"
                            aria-label="Loading profile image"
                          />
                        )}
                        <img
                          src={
                            googleUser.picture ||
                            buildInitialAvatar(googleUser.name)
                          }
                          alt={`${googleUser.name}'s profile`}
                          className="auth-google-badge-avatar"
                          onLoad={() => setGoogleBadgeImageLoading(false)}
                          onError={() => setGoogleBadgeImageLoading(false)}
                        />
                      </div>
                      <div className="auth-google-badge-info">
                        <span className="auth-google-badge-name">
                          {googleUser.name}
                        </span>
                        <span className="auth-google-badge-email">
                          {googleUser.email}
                        </span>
                      </div>
                      <HiCheckCircle
                        className="auth-google-badge-check"
                        aria-label="Verified"
                      />
                    </div>
                  )}

                  <label className="auth-field">
                    <span className="auth-field-label">
                      Phone Number{" "}
                      <span className="auth-field-optional">(Optional)</span>
                    </span>
                    <div className="auth-input-wrap">
                      <HiPhone className="auth-input-icon" aria-hidden="true" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            formatPhoneNumber(event.target.value),
                          )
                        }
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        aria-invalid={
                          !isPhoneValid && formData.phone.length > 0
                        }
                      />
                    </div>
                    <span className="auth-field-hint">
                      <HiInformationCircle aria-hidden="true" />
                      Used for booking confirmations and updates
                    </span>
                  </label>

                  <label className="auth-field">
                    <span className="auth-field-label">I am a...</span>
                    <div
                      className="auth-role-grid"
                      role="radiogroup"
                      aria-label="Select your role"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        (() => {
                          const RoleIcon = option.icon;
                          return (
                        <button
                          key={option.value}
                          type="button"
                          className={`auth-role-option ${
                            formData.role === option.value
                              ? "auth-role-option--active"
                              : ""
                          }`}
                          onClick={() => updateField("role", option.value)}
                          role="radio"
                          aria-checked={formData.role === option.value}
                        >
                          <span className="auth-role-icon" aria-hidden="true">
                            <RoleIcon aria-hidden="true" />
                          </span>
                          <span className="auth-role-label">
                            {option.label}
                          </span>
                          <span className="auth-role-desc">
                            {option.description}
                          </span>
                        </button>
                          );
                        })()
                      ))}
                    </div>
                  </label>

                  <label className="auth-field">
                    <span className="auth-field-label">
                      Bio{" "}
                      <span className="auth-field-optional">(Optional)</span>
                    </span>
                    <div className="auth-input-wrap auth-input-wrap--textarea">
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(event) =>
                          updateField("bio", event.target.value)
                        }
                        placeholder="Tell us about your travel style and what you're looking for..."
                        maxLength={MAX_BIO_LENGTH}
                        aria-invalid={!isBioValid}
                      />
                    </div>
                    <span
                      className={`auth-field-counter ${
                        formData.bio.length > MAX_BIO_LENGTH * 0.9
                          ? "auth-field-counter--warning"
                          : ""
                      }`}
                    >
                      {formData.bio.length}/{MAX_BIO_LENGTH}
                    </span>
                  </label>

                  <div className="auth-row">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={() => {
                        setSignUpStep(1);
                        clearGooglePending();
                      }}
                    >
                      <HiArrowLeft aria-hidden="true" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      className="auth-btn auth-btn--primary"
                      onClick={goToSignUpNextStep}
                      disabled={!isPhoneValid || !isBioValid}
                    >
                      <span>Continue</span>
                      <HiArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Avatar & Confirmation */}
              {signUpStep === 3 && (
                <form
                  className="auth-form auth-form--animated"
                  key="signup-step-3"
                  onSubmit={handleSignUpSubmit}
                >
                  <div className="auth-avatar-section">
                    <div className="auth-avatar-preview-wrap">
                      {formData.avatarPreview ? (
                        <div className="auth-image-shell auth-image-shell--lg">
                          {profileAvatarImageLoading && (
                            <span
                              className="auth-image-loader"
                              aria-label="Loading profile image"
                            />
                          )}
                          <img
                            src={formData.avatarPreview}
                            alt="Your profile avatar"
                            className="auth-avatar-preview"
                            onLoad={() => setProfileAvatarImageLoading(false)}
                            onError={() => setProfileAvatarImageLoading(false)}
                          />
                        </div>
                      ) : (
                        <div
                          className="auth-avatar-preview auth-avatar-initials"
                          style={{
                            background: `linear-gradient(135deg, ${currentRole?.color}, ${currentRole?.color}dd)`,
                          }}
                        >
                          {getInitials(formData.fullName || formData.email)}
                        </div>
                      )}
                      <label
                        className={`auth-avatar-edit ${avatarUploading ? "auth-avatar-edit--uploading" : ""}`}
                      >
                        {avatarUploading ? (
                          <HiRefresh className="auth-spin" aria-hidden="true" />
                        ) : (
                          <HiPhotograph aria-hidden="true" />
                        )}
                        <span className="sr-only">Upload profile picture</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                          onChange={handleAvatarFileChange}
                          aria-label="Upload profile picture"
                          disabled={avatarUploading}
                        />
                        {avatarUploading && (
                          <div className="auth-avatar-upload-progress" />
                        )}
                      </label>
                    </div>
                    <div className="auth-avatar-info">
                      <h4>
                        {formData.fullName || googleUser?.name || "Your Name"}
                      </h4>
                      <p>{formData.email || googleUser?.email}</p>
                      <span
                        className="auth-role-badge"
                        style={{ borderColor: currentRole?.color }}
                      >
                        <span aria-hidden="true">{currentRole?.icon}</span>{" "}
                        {currentRole?.label}
                      </span>
                    </div>
                  </div>

                  <div className="auth-summary-card">
                    <h4>Account Summary</h4>
                    <dl className="auth-summary-list">
                      <div className="auth-summary-row">
                        <dt>Email</dt>
                        <dd>{formData.email || googleUser?.email}</dd>
                      </div>
                      <div className="auth-summary-row">
                        <dt>Phone</dt>
                        <dd>{formData.phone || "Not provided"}</dd>
                      </div>
                      <div className="auth-summary-row">
                        <dt>Role</dt>
                        <dd>{currentRole?.label}</dd>
                      </div>
                      <div className="auth-summary-row">
                        <dt>Authentication Way</dt>
                        <dd
                          className={
                            authMethod === "google"
                              ? "auth-summary-google"
                              : "auth-summary-email"
                          }
                        >
                          {authMethod === "google" ? (
                            <>
                              <FcGoogle aria-hidden="true" />
                              <span>Google Account</span>
                            </>
                          ) : (
                            <>
                              <HiMail aria-hidden="true" />
                              <span>Email Verification</span>
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.keepSignedIn}
                      onChange={(event) =>
                        updateField("keepSignedIn", event.target.checked)
                      }
                    />
                    <span>Keep me signed in on this device</span>
                  </label>

                  <label className="auth-checkbox-label auth-checkbox-label--terms">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(event) => setAgreeTerms(event.target.checked)}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <div className="auth-row">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={() => setSignUpStep(2)}
                    >
                      <HiArrowLeft aria-hidden="true" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="auth-btn auth-btn--primary auth-btn--success"
                      disabled={loading || avatarUploading || !agreeTerms}
                      aria-busy={loading || avatarUploading}
                    >
                      {(loading || avatarUploading) && (
                        <InlineSpinner label="Creating account" />
                      )}
                      <span>
                        {loading || avatarUploading
                          ? "Creating Your Account..."
                          : "Create Account"}
                      </span>
                      <HiCheck aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}

              <p className="auth-switch-hint">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchView("login")}
                >
                  Sign in instead
                </button>
              </p>
            </div>
          )}

          {/* ===== VERIFY VIEW ===== */}
          {isVerify && (
            <div className="auth-view auth-view--verify">
              <div className="auth-view-header">
                <div className="auth-view-icon auth-view-icon--verify">
                  <HiMail aria-hidden="true" />
                </div>
                <h2 id="auth-modal-title">Verify Your Email</h2>
                <p>We've sent a 6-digit verification code to:</p>
                <div className="auth-email-badge">
                  {activeEmail || "No email found"}
                </div>
                <span className="auth-verify-note">
                  Code expires in {CODE_VALIDITY_MINUTES} minutes
                </span>
              </div>

              <form
                className="auth-form auth-form--animated"
                onSubmit={handleVerifySubmit}
              >
                <div
                  className={`auth-code-row ${codeRowState ? `auth-code-row--${codeRowState}` : ""}`}
                  onPaste={handleCodePaste}
                  role="group"
                  aria-label="Verification code input"
                >
                  {code.map((digit, index) => {
                    const allFilled = code.join("").length === 6;
                    return (
                      <input
                        key={index}
                        ref={(element) => {
                          codeRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(event) =>
                          handleCodeChange(index, event.target.value)
                        }
                        onKeyDown={(event) => handleCodeKeyDown(index, event)}
                        className={`auth-code-input ${digit ? "auth-code-input--filled" : ""} ${allFilled && !codeRowState ? "auth-code-input--all-filled" : ""}`}
                        aria-label={`Digit ${index + 1} of 6`}
                        autoComplete="one-time-code"
                        disabled={
                          codeRowState === "verifying" ||
                          codeRowState === "success"
                        }
                      />
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={
                    loading ||
                    code.join("").length !== 6 ||
                    codeRowState === "verifying"
                  }
                  aria-busy={loading || codeRowState === "verifying"}
                >
                  {(loading || codeRowState === "verifying") && (
                    <InlineSpinner label="Verifying code" />
                  )}
                  <span>
                    {codeRowState === "verifying"
                      ? "Verifying..."
                      : codeRowState === "success"
                        ? "Verified!"
                        : loading
                          ? "Verifying..."
                          : "Verify & Continue"}
                  </span>
                  <HiArrowRight aria-hidden="true" />
                </button>

                <div className="auth-row auth-row--verify">
                  <button
                    type="button"
                    className="auth-btn auth-btn--ghost"
                    onClick={handleBackFromVerify}
                  >
                    <HiArrowLeft aria-hidden="true" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    className="auth-btn auth-btn--secondary"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    aria-busy={loading}
                  >
                    <HiRefresh
                      className={resendTimer > 0 ? "" : "auth-icon-spin"}
                      aria-hidden="true"
                    />
                    {loading && <InlineSpinner label="Resending code" />}
                    <span>
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend Code"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* ===== FOOTER ===== */}
        <footer className="auth-modal-footer">
          <div className="auth-footer-security">
            <HiShieldCheck aria-hidden="true" />
            <span>Protected by industry-standard 256-bit encryption</span>
          </div>
        </footer>
      </div>
    </div>
  </div>
  );
}
