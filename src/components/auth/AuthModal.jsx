// AuthModal.jsx - Optimized, complete
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
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
import "./AuthModal.css";


const SIDE_MEDIA = [
  // 1. IMAGE: Majestic Lion, Serengeti
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=1200&q=80",
    alt: "Male lion resting in the golden grass of the Serengeti",
  },
  // 2. VIDEO: Cinematic Safari
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=P8frC_cLLD4",
    poster: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    alt: "4K Cinematic Wildlife Safari Film",
  },
  // 3. IMAGE: Zanzibar Coast
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    alt: "Pristine white sand and turquoise waters of Zanzibar",
  },
  // 4. IMAGE: Mount Kilimanjaro Peak
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1626569104037-7756f7e2d93e?auto=format&fit=crop&w=1200&q=80",
    alt: "The snow-capped peak of Mount Kilimanjaro above the clouds",
  },
  // 5. VIDEO: Zanzibar Drone Tour
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=DZnw2TeLuEU",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    alt: "Aerial tour of Zanzibar's tropical coastline",
  },
  // 6. IMAGE: Rwanda Mountain Gorilla
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1581281863883-2469417a1668?auto=format&fit=crop&w=1200&q=80",
    alt: "Mountain gorilla in the misty forests of Rwanda",
  },
  // 7. IMAGE: Giraffes at Sunset, Maasai Mara
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1549366021-9f761d450614?auto=format&fit=crop&w=1200&q=80",
    alt: "Silhouettes of giraffes against an orange savanna sunset",
  },
  // 8. VIDEO: Gorilla Trekking Documentary
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=b1V4pzfuncg",
    poster: "https://images.unsplash.com/photo-1511497584788-876787c0296a?auto=format&fit=crop&w=1200&q=80",
    alt: "Gorilla trekking expedition in the Volcanoes National Park",
  },
  // 9. IMAGE: Stone Town Streets
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&w=1200&q=80",
    alt: "Historic narrow alleys and carved doors of Stone Town",
  },
  // 10. IMAGE: Lake Nakuru Flamingos
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1565126322818-4905187e0766?auto=format&fit=crop&w=1200&q=80",
    alt: "Massive flock of pink flamingos at Lake Nakuru, Rwanda",
  },
  // 11. VIDEO: Kilimanjaro Expedition
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=XRwrpXf5V6c",
    poster: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    alt: "Cinematic journey to the roof of Africa",
  },
  // 12. IMAGE: Ancient Baobab Tree
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1502675135417-54932689180c?auto=format&fit=crop&w=1200&q=80",
    alt: "Large ancient Baobab tree standing in the Tarangire landscape",
  },
  // 13. IMAGE: Ngorongoro Crater View
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=80",
    alt: "Panoramic view of the vast Ngorongoro Crater in Tanzania",
  },
  // 14. VIDEO: BBC Earth - Savanna Wildlife
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=o50N3-OaGdM",
    poster: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80",
    alt: "BBC Earth: The wild heart of the African Savanna",
  },
  // 15. IMAGE: Leopard in an Acacia
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
    alt: "Leopard resting high on a branch of an acacia tree",
  },
  // 16. IMAGE: Cheetah on the Lookout
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    alt: "Cheetah scanning the horizon for prey in the grass",
  },
  // 17. VIDEO: Rwanda's Untamed Beauty
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=HJPeBTk-0NA",
    poster: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80",
    alt: "The untouched wilderness of Rwanda in 4K",
  },
  // 18. IMAGE: Maasai Warrior
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1590001158193-7efcc52ee3d1?auto=format&fit=crop&w=1200&q=80",
    alt: "Portrait of a Maasai warrior in traditional red shuka",
  },
  // 19. IMAGE: Safari Camp at Night
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury safari camp lighting up at dusk under the stars",
  },
  // 20. IMAGE: Savannah Horizon
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1519066629447-267fffa62d4b?auto=format&fit=crop&w=1200&q=80",
    alt: "Infinite horizon of the East African savanna",
  },
];


const SideMediaRotator = ({ intervalMs = 6000 }) => {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(null);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setIdx((i) => {
      const n = (i + 1) % SIDE_MEDIA.length;
      setPrev(i);
      setTimeout(() => setPrev(null), 800);
      return n;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(next, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [next, intervalMs]);

  const cur = SIDE_MEDIA[idx];
  const prevItem = prev !== null ? SIDE_MEDIA[prev] : null;

  return (
    <div className="auth-side-media" onDoubleClick={() => next()}>
      {prevItem && (
        <img
          key={`out-${prev}`}
          className="auth-side-media__el auth-side-media__layer is-out"
          src={prevItem.src}
          alt={prevItem.alt}
          loading="eager"
        />
      )}
      <img
        key={`in-${idx}`}
        className="auth-side-media__el auth-side-media__layer is-in"
        src={cur.src}
        alt={cur.alt}
        loading="eager"
      />
    </div>
  );
};

// ── Constants ─────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;
const MAX_BIO = 300;
const MAX_FILE = 10 * 1024 * 1024;
const CODE_TTL = 10;

const ROLES = [
  {
    value: "user",
    label: "Traveler",
    icon: HiGlobe,
    desc: "Explore destinations",
    color: "#3b82f6",
  },
  {
    value: "photographer",
    label: "Photographer",
    icon: HiPhotograph,
    desc: "Capture moments",
    color: "#8b5cf6",
  },
  {
    value: "planner",
    label: "Travel Planner",
    icon: HiSparkles,
    desc: "Create itineraries",
    color: "#059669",
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const emptyCode = () => ["", "", "", "", "", ""];
const getInitials = (v = "") =>
  v
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
const toBase64 = (s) => {
  try {
    return window.btoa(
      encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) =>
        String.fromCharCode(parseInt(h, 16)),
      ),
    );
  } catch {
    return "";
  }
};
const initAvatar = (name, color = "#059669") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" font-size="48" font-weight="600" fill="#fff">${getInitials(name)}</text></svg>`;
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
};
const readFile = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Cannot read file"));
    r.readAsDataURL(file);
  });
const Spinner = ({ label = "Loading" }) => (
  <span className="auth-inline-spinner" role="status" aria-label={label} />
);
const formatPhone = (v) => String(v || "").replace(/[^\d+]/g, "");

// ── Main Component ────────────────────────────────────────────────────────────
export default function AuthModal() {
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

  // State
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    bio: "",
    role: "user",
    keepSignedIn: persistSession,
    avatarFile: null,
    avatarPreview: "",
  });
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
  const [codeState, setCodeState] = useState(""); // "" | "verifying" | "success" | "error"

  // Refs
  const codeRefs = useRef([]);
  const firstInputRef = useRef(null);
  const prevTitleRef = useRef(document.title);
  const wasOpenRef = useRef(false);

  // Computed
  const isLogin = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify = modalView === "verify";
  const activeEmail = (
    pendingEmail ||
    form.email ||
    googleUser?.email ||
    ""
  ).trim();
  const emailOk = EMAIL_RE.test(form.email.trim());
  const nameOk = form.fullName.trim().length >= 2;
  const phoneOk = !form.phone.trim() || PHONE_RE.test(form.phone.trim());
  const bioOk = form.bio.trim().length <= MAX_BIO;
  const isBusy = googleLoading || githubLoading || loading;
  const currentRole = useMemo(
    () => ROLES.find((r) => r.value === form.role),
    [form.role],
  );

  // Field updater
  const set = useCallback(
    (field, val) => {
      setForm((p) => ({ ...p, [field]: val }));
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
         clearGooglePending();
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

  // Effects
  useEffect(() => {
    if (isModalOpen && !wasOpenRef.current)
      prevTitleRef.current = document.title;
    if (isModalOpen)
      document.title =
        {
          login: "Sign In | Altuvera",
          register: "Sign Up | Altuvera",
          verify: "Verify Email | Altuvera",
        }[modalView] || "Account | Altuvera";
    else if (wasOpenRef.current) document.title = prevTitleRef.current;
    wasOpenRef.current = isModalOpen;
  }, [isModalOpen, modalView]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    setError("");
    setSuccess("");
    setCode(emptyCode());
    setResendTimer(0);
    setAuthMethod("email");
    setCodeState("");

    if (isRegister && !hasGooglePending) {
      setSignUpStep(1);
    }
    setForm((p) => ({ ...p, keepSignedIn: persistSession }));
    setTimeout(() => firstInputRef.current?.focus(), 300);
  }, [isLogin, isModalOpen, isRegister, persistSession, hasGooglePending]);

  useEffect(() => {
    if (socialAuthError) setError(socialAuthError);
  }, [socialAuthError]);

  useEffect(() => {
    if (googleUser && isRegister) {
      setForm((p) => ({
        ...p,
        email: googleUser.email || p.email,
        fullName: googleUser.name || p.fullName,
        avatarPreview: googleUser.picture || p.avatarPreview,
      }));
      setSignUpStep(2);
      setAuthMethod("google");
      setSuccess(
        "✓ Google account connected! Complete your profile to continue.",
      );
    }
  }, [googleUser, isRegister]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(
      () => setResendTimer((p) => Math.max(0, p - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-verify when all 6 digits filled
  useEffect(() => {
    const val = code.join("");
    if (val.length === 6 && isVerify && !loading && codeState !== "verifying") {
      const t = setTimeout(() => doVerify(val), 250);
      return () => clearTimeout(t);
    }
  }, [code, isVerify, loading, codeState]);

  // Google Auth
  const handleGoogleAuth = useCallback(
    async (mode = "signin") => {
      if (!googleLoaded || isBusy) return;
      clearSocialAuthError();
      setError("");
      setSuccess("");
      try {
        const result = await promptGoogleAuth({ mode });
        if (mode === "signup" && result)
          setSuccess("✓ Google account connected! Complete your profile.");
      } catch (err) {
        const msg = err?.message || "Google authentication failed.";
        setError(
          msg.includes("popup") || msg.includes("closed")
            ? "Sign-in window was closed. Please try again."
            : msg,
        );
      }
    },
    [clearSocialAuthError, googleLoaded, isBusy, promptGoogleAuth],
  );

  const handleGithubAuth = useCallback(
    (mode = "signin") => {
      if (isBusy) return;
      clearSocialAuthError();
      setError("");
      setSuccess("");
      try {
        startGithubAuth(mode);
      } catch (err) {
        setError(err?.message || "GitHub authentication failed.");
      }
    },
    [clearSocialAuthError, isBusy, startGithubAuth],
  );

  // Avatar
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    if (file.size > MAX_FILE) {
      setError("Image must be 10MB or less.");
      return;
    }
    try {
      const preview = await readFile(file);
      setForm((p) => ({ ...p, avatarFile: file, avatarPreview: preview }));
      setError("");
    } catch {
      setError("Unable to preview this image.");
    }
  }, []);

  const resolveAvatar = useCallback(async () => {
    if (googleUser?.picture && !form.avatarFile) return googleUser.picture;
    const fallback =
      form.avatarPreview ||
      initAvatar(form.fullName || form.email, currentRole?.color);
    if (!form.avatarFile) return fallback;
    setAvatarUploading(true);
    try {
      return await uploadAvatar(form.avatarFile);
    } catch {
      setSuccess("Using placeholder avatar. Update it in your profile.");
      return fallback;
    } finally {
      setAvatarUploading(false);
    }
  }, [
    currentRole?.color,
    form.avatarFile,
    form.avatarPreview,
    form.email,
    form.fullName,
    googleUser?.picture,
    uploadAvatar,
  ]);

  // Sign In
  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      if (!emailOk) {
        setError("Please enter a valid email address.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setVerifySource("login");
        setAuthMethod("email");
        setSessionPreference(form.keepSignedIn);
        await login({
          email: form.email.trim(),
          fullName: form.fullName.trim() || undefined,
          persistSession: form.keepSignedIn,
        });
        setSuccess("Verification code sent to your email.");
      } catch (err) {
        setError(err?.message || "Sign in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      emailOk,
      form.email,
      form.fullName,
      form.keepSignedIn,
      login,
      setSessionPreference,
    ],
  );

  // Sign Up
  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      if (!agreeTerms) {
        setError("Please accept the Terms of Service and Privacy Policy.");
        return;
      }
      if (authMethod === "google" && !hasGooglePending) {
        setError(
          "Google authentication required. Please sign in with Google first.",
        );
        return;
      }
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setVerifySource("register");
        setSessionPreference(form.keepSignedIn);
        const avatar = await resolveAvatar();
        if (authMethod === "google") {
          await completeGoogleSignUp({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            bio: form.bio.trim(),
            role: form.role,
            avatar,
          });
        } else {
          await register({
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            bio: form.bio.trim(),
            role: form.role,
            avatar,
            persistSession: form.keepSignedIn,
          });
        }
        setSuccess(
          authMethod === "google"
            ? "✓ Account created! Welcome to Altuvera."
            : "Verification code sent to your email.",
        );
      } catch (err) {
        setError(err?.message || "Sign up failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      agreeTerms,
      authMethod,
      completeGoogleSignUp,
      form,
      hasGooglePending,
      register,
      resolveAvatar,
      setSessionPreference,
    ],
  );

  // Code Handlers
  const handleCodeChange = useCallback((i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    setCode((p) => {
      const n = [...p];
      n[i] = val;
      return n;
    });
    setError("");
    setCodeState("");
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  }, []);

  const handleCodeKey = useCallback(
    (i, e) => {
      if (e.key === "Backspace" && !code[i] && i > 0)
        codeRefs.current[i - 1]?.focus();
    },
    [code],
  );

  const handleCodePaste = useCallback((e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!digits) return;
    const next = emptyCode();
    digits.split("").forEach((d, i) => {
      next[i] = d;
    });
    setCode(next);
    setCodeState("");
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  }, []);

  const doVerify = useCallback(
    async (val) => {
      if (!activeEmail) {
        setError("Missing email. Please restart.");
        return;
      }
      if (val.length !== 6) {
        setError("Please enter the full 6-digit code.");
        return;
      }
      try {
        setLoading(true);
        setCodeState("verifying");
        setError("");
        await verifyCode(activeEmail, val);
        setCodeState("success");
      } catch (err) {
        setCodeState("error");
        setError(err?.message || "Verification failed. Please try again.");
        setTimeout(() => setCodeState(""), 800);
      } finally {
        setLoading(false);
      }
    },
    [activeEmail, verifyCode],
  );

  const handleVerifySubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await doVerify(code.join(""));
    },
    [code, doVerify],
  );

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;
    try {
      setLoading(true);
      setError("");
      await resendCode(activeEmail);
      setSuccess(
        `✓ New code sent to ${activeEmail}. Valid for ${CODE_TTL} minutes.`,
      );
      setResendTimer(60);
      setCode(emptyCode());
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message || "Unable to resend code.");
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

  if (!isModalOpen) return null;

  const SocialButtons = ({ mode }) => (
    <div className="auth-row">
      <button
        type="button"
        className="auth-btn auth-btn--google"
        onClick={() => handleGoogleAuth(mode)}
        disabled={!googleLoaded || googleLoading || loading}
        aria-busy={googleLoading}
      >
        {googleLoading ? (
          <Spinner label="Connecting to Google" />
        ) : (
          <FcGoogle className="auth-google-icon" aria-hidden="true" />
        )}
        <span>{googleLoading ? "Connecting..." : "Google"}</span>
      </button>
      <button
        type="button"
        className="auth-btn auth-btn--github"
        onClick={() => handleGithubAuth(mode)}
        disabled={githubLoading || loading}
        aria-busy={githubLoading}
      >
        {githubLoading ? (
          <Spinner label="Connecting to GitHub" />
        ) : (
          <FiGithub className="auth-github-icon" aria-hidden="true" />
        )}
        <span>{githubLoading ? "Connecting..." : "GitHub"}</span>
      </button>
    </div>
  );

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeModal}
      role="presentation"
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Side Panel */}
        <div className="auth-side-panel">
          <SideMediaRotator />
          <div className="auth-side-overlay" />
          <div className="auth-side-content">
            <h3 className="auth-side-title">Discover East Africa</h3>
            <p className="auth-side-text">
              Join thousands of travelers exploring the wild beauty and ancient
              culture of the Rift Valley.
            </p>
          </div>
        </div>

        {/* Main Panel */}
        <div className="auth-main-panel">
          {/* Header */}
          <header className="auth-modal-header">
            <div className="auth-modal-brand">
              <div className="auth-brand-logo">
                <div className="auth-brand-icon">
                  <img
                    src={getBrandLogoUrl()}
                    alt={BRAND_LOGO_ALT}
                    className="auth-brand-icon-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="auth-brand-info">
                <span className="auth-brand-text">Altuvera</span>
                <span className="auth-brand-tagline">Premium Adventures</span>
              </div>
            </div>
            <button
              className="auth-close-btn"
              onClick={closeModal}
              aria-label="Close"
              type="button"
            >
              <HiX />
            </button>
          </header>

          {/* Tabs */}
          {!isVerify && (
            <div className="auth-modal-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
                onClick={() => switchView("login")}
                role="tab"
                aria-selected={isLogin}
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
              >
                <HiSparkles aria-hidden="true" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Content */}
          <main className="auth-modal-content">
            {/* Messages */}
            {error && (
              <div className="auth-message auth-message--error" role="alert">
                <HiExclamationCircle aria-hidden="true" />
                <p>
                  {typeof error === "string"
                    ? error
                    : error?.message || "An error occurred"}
                </p>
              </div>
            )}
            {success && (
              <div className="auth-message auth-message--success" role="status">
                <HiCheckCircle aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN ── */}
            {isLogin && (
              <div
                className="auth-view auth-view--login"
                id="login-panel"
                role="tabpanel"
              >
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--signin">
                    <HiShieldCheck />
                  </div>
                  <h2 id="auth-modal-title">Welcome Back</h2>
                  <p>Sign in to access your travel dashboard</p>
                </div>
                <form
                  className="auth-form auth-form--animated"
                  onSubmit={handleSignIn}
                >
                  <label className="auth-field">
                    <span className="auth-field-label">Email Address</span>
                    <div className="auth-input-wrap">
                      <HiMail className="auth-input-icon" aria-hidden="true" />
                      <EmailAutocompleteInput
                        ref={firstInputRef}
                        value={form.email}
                        onValueChange={(v) => set("email", v)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>
                  <label className="auth-field">
                    <span className="auth-field-label">Full Name</span>
                    <div className="auth-input-wrap">
                      <HiUser className="auth-input-icon" aria-hidden="true" />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => set("fullName", e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        required
                        minLength={2}
                      />
                    </div>
                  </label>
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.keepSignedIn}
                      onChange={(e) => set("keepSignedIn", e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={loading || !emailOk || !nameOk}
                    aria-busy={loading}
                  >
                    {loading && <Spinner />}
                    <span>
                      {loading ? "Signing in..." : "Continue with Email"}
                    </span>
                    <HiArrowRight />
                  </button>
                  <div className="auth-divider" role="separator">
                    <span>or continue with</span>
                  </div>
                  <SocialButtons mode="signin" />
                </form>
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

            {/* ── REGISTER ── */}
            {isRegister && (
              <div
                className="auth-view auth-view--register"
                id="register-panel"
                role="tabpanel"
              >
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--signup">
                    <HiGlobe />
                  </div>
                  <h2 id="auth-modal-title">
                    {
                      ["Choose Method", "Your Profile", "Confirmation"][
                        signUpStep - 1
                      ]
                    }
                  </h2>
                  <p>
                    {
                      [
                        "Join our community to start your journey",
                        "Tell us about yourself",
                        "Review and create your account",
                      ][signUpStep - 1]
                    }
                  </p>
                </div>

                {/* Progress */}
                <div
                  className="auth-progress"
                  role="progressbar"
                  aria-valuenow={signUpStep}
                  aria-valuemin="1"
                  aria-valuemax="3"
                >
                  {[
                    { n: 1, l: "Method" },
                    { n: 2, l: "Profile" },
                    { n: 3, l: "Done" },
                  ].map(({ n, l }) => (
                    <div
                      key={n}
                      className={`auth-progress-step ${signUpStep >= n ? "auth-progress-step--active" : ""} ${signUpStep > n ? "auth-progress-step--completed" : ""}`}
                    >
                      <div className="auth-progress-circle">
                        {signUpStep > n ? <HiCheck /> : n}
                      </div>
                      <span className="auth-progress-label">{l}</span>
                    </div>
                  ))}
                  <div className="auth-progress-line" aria-hidden="true">
                    <div
                      className="auth-progress-line-fill"
                      style={{ width: `${((signUpStep - 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step 1 */}
                {signUpStep === 1 && (
                  <div className="auth-form auth-form--animated">
                    {hasGooglePending ? (
                      <div className="auth-google-connected">
                        <HiCheckCircle size={48} color="var(--auth-primary)" />
                        <h3>Google Connected</h3>
                        <p>Click continue to set up your profile.</p>
                        <button
                          className="auth-btn auth-btn--primary"
                          onClick={() => setSignUpStep(2)}
                        >
                          <span>Continue Setup</span>
                          <HiArrowRight />
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className="auth-field">
                          <span className="auth-field-label">
                            Email Address
                          </span>
                          <div className="auth-input-wrap">
                            <HiMail className="auth-input-icon" />
                            <EmailAutocompleteInput
                              ref={firstInputRef}
                              value={form.email}
                              onValueChange={(v) => set("email", v)}
                              placeholder="traveler@example.com"
                              autoComplete="email"
                              required
                            />
                          </div>
                        </label>
                        <label className="auth-field">
                          <span className="auth-field-label">Full Name</span>
                          <div className="auth-input-wrap">
                            <HiUser className="auth-input-icon" />
                            <input
                              type="text"
                              value={form.fullName}
                              onChange={(e) => set("fullName", e.target.value)}
                              placeholder="Your full name"
                              autoComplete="name"
                              required
                            />
                          </div>
                        </label>
                        <button
                          type="button"
                          className="auth-btn auth-btn--primary"
                          onClick={() => {
                            if (emailOk && nameOk) {
                              setSignUpStep(2);
                              setAuthMethod("email");
                            } else
                              setError(
                                "Please enter a valid email and full name.",
                              );
                          }}
                          disabled={!emailOk || !nameOk}
                        >
                          <span>Continue with Email</span>
                          <HiArrowRight />
                        </button>
                        <div className="auth-divider">
                          <span>or continue with</span>
                        </div>
                        <SocialButtons mode="signup" />
                      </>
                    )}
                  </div>
                )}

                {/* Step 2 */}
                {signUpStep === 2 && (
                  <div className="auth-form auth-form--animated">
                    {googleUser && (
                      <div className="auth-google-badge">
                        <img
                          src={
                            googleUser.picture || initAvatar(googleUser.name)
                          }
                          alt={googleUser.name}
                          className="auth-google-badge-avatar"
                        />
                        <div className="auth-google-badge-info">
                          <span className="auth-google-badge-name">
                            {googleUser.name}
                          </span>
                          <span className="auth-google-badge-email">
                            {googleUser.email}
                          </span>
                        </div>
                        <HiCheckCircle className="auth-google-badge-check" />
                      </div>
                    )}
                    <label className="auth-field">
                      <span className="auth-field-label">
                        Phone{" "}
                        <span className="auth-field-optional">(Optional)</span>
                      </span>
                      <div className="auth-input-wrap">
                        <HiPhone className="auth-input-icon" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            set("phone", formatPhone(e.target.value))
                          }
                          placeholder="+1 (555) 000-0000"
                          autoComplete="tel"
                        />
                      </div>
                      <span className="auth-field-hint">
                        <HiInformationCircle />
                        Used for booking confirmations
                      </span>
                    </label>
                    <label className="auth-field">
                      <span className="auth-field-label">I am a...</span>
                      <div className="auth-role-grid" role="radiogroup">
                        {ROLES.map(({ value, label, icon, desc }) => {
                          const RoleIcon = icon;
                          return (
                            <button
                              key={value}
                              type="button"
                              className={`auth-role-option ${form.role === value ? "auth-role-option--active" : ""}`}
                              onClick={() => set("role", value)}
                              role="radio"
                              aria-checked={form.role === value}
                            >
                              <span className="auth-role-icon">
                                <RoleIcon />
                              </span>
                              <span className="auth-role-label">{label}</span>
                              <span className="auth-role-desc">{desc}</span>
                            </button>
                          );
                        })}
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
                          value={form.bio}
                          onChange={(e) => set("bio", e.target.value)}
                          placeholder="Tell us about your travel style..."
                          maxLength={MAX_BIO}
                        />
                      </div>
                      <span
                        className={`auth-field-counter ${form.bio.length > MAX_BIO * 0.9 ? "auth-field-counter--warning" : ""}`}
                      >
                        {form.bio.length}/{MAX_BIO}
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
                        <HiArrowLeft />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        className="auth-btn auth-btn--primary"
                        onClick={() => {
                          if (!phoneOk) {
                            setError("Invalid phone format.");
                            return;
                          }
                          if (!bioOk) {
                            setError(
                              `Bio must be ${MAX_BIO} characters or less.`,
                            );
                            return;
                          }
                          setError("");
                          setSignUpStep(3);
                        }}
                        disabled={!phoneOk || !bioOk}
                      >
                        <span>Continue</span>
                        <HiArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {signUpStep === 3 && (
                  <form
                    className="auth-form auth-form--animated"
                    onSubmit={handleSignUp}
                  >
                    <div className="auth-avatar-section">
                      <div className="auth-avatar-preview-wrap">
                        <div className="auth-image-shell auth-image-shell--lg">
                          <img
                            src={
                              form.avatarPreview ||
                              initAvatar(
                                form.fullName || form.email,
                                currentRole?.color,
                              )
                            }
                            alt="Profile avatar"
                            className="auth-avatar-preview"
                          />
                        </div>
                        <label
                          className={`auth-avatar-edit ${avatarUploading ? "auth-avatar-edit--uploading" : ""}`}
                        >
                          {avatarUploading ? (
                            <HiRefresh className="auth-spin" />
                          ) : (
                            <HiPhotograph />
                          )}
                          <span className="sr-only">Upload photo</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                          />
                        </label>
                      </div>
                      <div className="auth-avatar-info">
                        <h4>
                          {form.fullName || googleUser?.name || "Your Name"}
                        </h4>
                        <p>{form.email || googleUser?.email}</p>
                      </div>
                    </div>

                    <div className="auth-summary-card">
                      <h4>Account Summary</h4>
                      <dl className="auth-summary-list">
                        {[
                          ["Email", form.email || googleUser?.email],
                          ["Phone", form.phone || "Not provided"],
                          ["Role", currentRole?.label],
                          [
                            "Auth",
                            authMethod === "google"
                              ? "Google Account"
                              : "Email OTP",
                          ],
                        ].map(([dt, dd]) => (
                          <div key={dt} className="auth-summary-row">
                            <dt>{dt}</dt>
                            <dd>{dd}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.keepSignedIn}
                        onChange={(e) => set("keepSignedIn", e.target.checked)}
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <label className="auth-checkbox-label auth-checkbox-label--terms">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                      />
                      <span>
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
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
                        <HiArrowLeft />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        className="auth-btn auth-btn--primary auth-btn--success"
                        disabled={loading || avatarUploading || !agreeTerms}
                        aria-busy={loading || avatarUploading}
                      >
                        {(loading || avatarUploading) && <Spinner />}
                        <span>
                          {loading || avatarUploading
                            ? "Creating Account..."
                            : "Create Account"}
                        </span>
                        <HiCheck />
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

            {/* ── VERIFY ── */}
            {isVerify && (
              <div className="auth-view auth-view--verify">
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--verify">
                    <HiMail />
                  </div>
                  <h2 id="auth-modal-title">Verify Your Email</h2>
                  <p>We sent a 6-digit code to:</p>
                  <div className="auth-email-badge">
                    {activeEmail || "No email found"}
                  </div>
                  <span className="auth-verify-note">
                    Code expires in {CODE_TTL} minutes
                  </span>
                </div>
                <form
                  className="auth-form auth-form--animated"
                  onSubmit={handleVerifySubmit}
                >
                  <div
                    className={`auth-code-row ${codeState ? `auth-code-row--${codeState}` : ""}`}
                    onPaste={handleCodePaste}
                    role="group"
                    aria-label="Verification code"
                  >
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          codeRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKey(i, e)}
                        className={`auth-code-input ${digit ? "auth-code-input--filled" : ""} ${code.join("").length === 6 && !codeState ? "auth-code-input--all-filled" : ""}`}
                        aria-label={`Digit ${i + 1} of 6`}
                        autoComplete="one-time-code"
                        disabled={
                          codeState === "verifying" || codeState === "success"
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={
                      loading ||
                      code.join("").length !== 6 ||
                      codeState === "verifying"
                    }
                    aria-busy={loading}
                  >
                    {(loading || codeState === "verifying") && <Spinner />}
                    <span>
                      {codeState === "verifying"
                        ? "Verifying..."
                        : codeState === "success"
                          ? "Verified!"
                          : "Verify & Continue"}
                    </span>
                    <HiArrowRight />
                  </button>
                  <div className="auth-row auth-row--verify">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={handleBackFromVerify}
                    >
                      <HiArrowLeft />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      className="auth-btn auth-btn--secondary"
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                    >
                      <HiRefresh />
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

          {/* Footer */}
          <footer className="auth-modal-footer">
            <div className="auth-footer-security">
              <HiShieldCheck />
              <span>Protected by 256-bit encryption</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
