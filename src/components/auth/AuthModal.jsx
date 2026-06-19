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
  HiExclamationCircle,
  HiInformationCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { FiGithub, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdVerified, MdOutlineSecurityUpdateGood } from "react-icons/md";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAuthStats } from "../../hooks/useAuthStats";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
// ✅ DO NOT import index.css here — it's already imported in main.jsx
// ✅ Only import the component-scoped CSS
import "./AuthModal.css";

/* ═══════════════════════════════════════════════════════════════
   GALLERY IMAGES
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
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;
const MAX_BIO = 300;
const MAX_FILE = 10 * 1024 * 1024;
const CODE_TTL_LOGIN_REGISTER = 10 * 60;
const CODE_TTL_RESEND = 15 * 60;

const ROLES = [
  {
    value: "user",
    label: "Traveler",
    icon: HiGlobe,
    desc: "Explore & discover",
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
    label: "Planner",
    icon: HiSparkles,
    desc: "Craft itineraries",
    color: "#059669",
  },
];

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
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
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Cannot read file"));
    r.readAsDataURL(file);
  });

const formatPhone = (v) => String(v || "").replace(/[^\d+]/g, "");

const formatExpiry = (seconds) => {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};

const isDismissalError = (msg = "") => {
  const m = msg.toLowerCase();
  return (
    m.includes("dismiss") ||
    m.includes("cancel") ||
    m.includes("closed") ||
    m.includes("credential_cancelled") ||
    m.includes("popup_closed") ||
    m.includes("skipped") ||
    m.includes("not_displayed") ||
    m.includes("google button")
  );
};

/* ═══════════════════════════════════════════════════════════════
   GALLERY SLIDESHOW
═══════════════════════════════════════════════════════════════ */
const GallerySlideshow = ({ intervalMs = 5000 }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const advance = useCallback(
    (dir = 1) => setCurrent((i) => (i + dir + GALLERY.length) % GALLERY.length),
    [],
  );

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => advance(1), intervalMs);
    return () => clearInterval(timerRef.current);
  }, [advance, intervalMs, isPaused]);

  useEffect(() => {
    const img = new Image();
    img.src = GALLERY[(current + 1) % GALLERY.length].src;
  }, [current]);

  const slide = GALLERY[current];

  return (
    <div
      className="relative h-full w-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-hidden="true"
    >
      {/* Slides */}
      {GALLERY.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            transition:
              "opacity 1200ms ease-in-out, transform 1200ms ease-in-out",
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.05)",
          }}
        >
          {/* ✅ Use style prop for h-full w-full on img to avoid global CSS override */}
          <img
            src={item.src}
            alt={item.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            loading={i <= 1 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 10 }}
        className="bg-gradient-to-t from-black/70 via-black/20 to-black/30"
      />
      <div
        style={{ position: "absolute", inset: 0, zIndex: 10 }}
        className="bg-gradient-to-r from-black/20 to-transparent"
      />

      {/* Content */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 20 }}
        className="flex flex-col justify-between p-6 sm:p-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md p-1.5 ring-1 ring-white/20 flex items-center justify-center">
            <img
              src={getBrandLogoUrl()}
              alt={BRAND_LOGO_ALT}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
              loading="eager"
            />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight tracking-tight">
              Altuvera
            </h3>
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">
              Premium Adventures
            </p>
          </div>
        </div>

        {/* Caption + nav */}
        <div className="space-y-5">
          <div key={current} className="transition-all duration-500">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
              {slide.caption}
            </p>
            <h4
              className="text-white text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight"
              style={{ animation: "fadeSlideUp 600ms ease-out both" }}
            >
              {slide.subtitle}
            </h4>
          </div>

          {/* Dots + arrows */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {GALLERY.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    transition: "all 300ms",
                    borderRadius: "9999px",
                    width: i === current ? "2rem" : "0.5rem",
                    height: i === current ? "0.5rem" : "0.5rem",
                    backgroundColor:
                      i === current
                        ? "rgb(52 211 153)"
                        : "rgba(255,255,255,0.4)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => advance(-1)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="Previous slide"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => advance(1)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="Next slide"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              key={`prog-${current}`}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full"
              style={{
                animation: !isPaused
                  ? `progressBar ${intervalMs}ms linear forwards`
                  : "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
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

  useAuthStats();

  /* ── State ── */
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
  const [codeState, setCodeState] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [codeExpiry, setCodeExpiry] = useState(CODE_TTL_LOGIN_REGISTER);
  const [codeExpired, setCodeExpired] = useState(false);

  /* ── Refs ── */
  const codeRefs = useRef([]);
  const firstInputRef = useRef(null);
  const expiryTimerRef = useRef(null);

  /* ── Derived ── */
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
    () => ROLES.find((r) => r.value === form.role) || ROLES[0],
    [form.role],
  );

  const avatarSrc = useMemo(
    () =>
      form.avatarPreview ||
      (googleUser?.picture && authMethod === "google"
        ? googleUser.picture
        : null) ||
      initAvatar(form.fullName || form.email || "U", currentRole?.color),
    [
      form.avatarPreview,
      form.fullName,
      form.email,
      googleUser?.picture,
      authMethod,
      currentRole?.color,
    ],
  );

  /* ── Expiry countdown ── */
  const startExpiryCountdown = useCallback(
    (seconds = CODE_TTL_LOGIN_REGISTER) => {
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
    },
    [],
  );

  const stopExpiryCountdown = useCallback(() => {
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    setCodeExpiry(CODE_TTL_LOGIN_REGISTER);
    setCodeExpired(false);
  }, []);

  useEffect(
    () => () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    },
    [],
  );

  /* ── Field updater ── */
  const set = useCallback(
    (field, val) => {
      setForm((p) => ({ ...p, [field]: val }));
      setError("");
      setSuccess("");
      clearSocialAuthError?.();
    },
    [clearSocialAuthError],
  );

  const switchView = useCallback(
    (view) => {
      if (loading) return;
      stopExpiryCountdown();
      setModalView(view);
      setError("");
      setSuccess("");
      setCode(emptyCode());
      setAuthMethod("email");
      setEmailTouched(false);
      setNameTouched(false);
      clearSocialAuthError?.();
      if (view === "login") clearGooglePending?.();
    },
    [
      clearGooglePending,
      clearSocialAuthError,
      loading,
      setModalView,
      stopExpiryCountdown,
    ],
  );

  /* ── Effects ── */
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const h = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    stopExpiryCountdown();
    setError("");
    setSuccess("");
    setCode(emptyCode());
    setResendTimer(0);
    setAuthMethod("email");
    setCodeState("");
    setEmailTouched(false);
    setNameTouched(false);
    if (isRegister && !hasGooglePending) setSignUpStep(1);
    setForm((p) => ({ ...p, keepSignedIn: persistSession }));
    setTimeout(() => firstInputRef.current?.focus(), 350);
  }, [
    isLogin,
    isModalOpen,
    isRegister,
    persistSession,
    hasGooglePending,
    stopExpiryCountdown,
  ]);

  useEffect(() => {
    if (!socialAuthError) return;
    if (isDismissalError(socialAuthError)) {
      clearSocialAuthError?.();
      return;
    }
    setError(socialAuthError);
  }, [socialAuthError, clearSocialAuthError]);

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
      setSuccess("Google account connected! Complete your profile.");
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

  /* ── Social auth ── */
  const handleGoogleAuth = useCallback(
    async (mode = "signin") => {
      if (!googleLoaded || isBusy) return;
      clearSocialAuthError?.();
      setError("");
      setSuccess("");
      try {
        const result = await promptGoogleAuth({ mode });
        if (result?.dismissed) return;
        if (mode === "signup" && result)
          setSuccess("Google connected! Complete your profile.");
      } catch (err) {
        const msg = err?.message || "";
        if (isDismissalError(msg)) return;
        setError(msg || "Google authentication failed.");
      }
    },
    [clearSocialAuthError, googleLoaded, isBusy, promptGoogleAuth],
  );

  const handleGithubAuth = useCallback(
    (mode = "signin") => {
      if (isBusy) return;
      clearSocialAuthError?.();
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

  /* ── Avatar ── */
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }
    if (file.size > MAX_FILE) {
      setError("Image must be 10 MB or less.");
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
      setSuccess("Using placeholder — update anytime.");
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

  /* ── Sign In ── */
  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      setEmailTouched(true);
      setNameTouched(true);
      if (!emailOk) {
        setError("Please enter a valid email.");
        return;
      }
      if (!nameOk) {
        setError("Please enter your full name.");
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
          fullName: form.fullName.trim(),
          persistSession: form.keepSignedIn,
        });
        startExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
        setSuccess("Verification code sent! Check your inbox.");
      } catch (err) {
        setError(err?.message || "Sign in failed.");
      } finally {
        setLoading(false);
      }
    },
    [
      emailOk,
      nameOk,
      form.email,
      form.fullName,
      form.keepSignedIn,
      login,
      setSessionPreference,
      startExpiryCountdown,
    ],
  );

  /* ── Verify ── */
  const doVerify = useCallback(
    async (val) => {
      if (!activeEmail) {
        setError("Missing email. Please restart.");
        return;
      }
      if (val.length !== 6) {
        setError("Enter the full 6-digit code.");
        return;
      }
      if (codeExpired) {
        setError("Code expired. Request a new one.");
        return;
      }
      try {
        setLoading(true);
        setCodeState("verifying");
        setError("");
        await verifyCode(activeEmail, val);
        setCodeState("success");
        stopExpiryCountdown();
      } catch (err) {
        setCodeState("error");
        setError(err?.message || "Verification failed.");
        setTimeout(() => {
          setCodeState("");
          setCode(emptyCode());
          codeRefs.current[0]?.focus();
        }, 700);
      } finally {
        setLoading(false);
      }
    },
    [activeEmail, codeExpired, verifyCode, stopExpiryCountdown],
  );

  useEffect(() => {
    const val = code.join("");
    if (
      val.length === 6 &&
      isVerify &&
      !loading &&
      codeState !== "verifying" &&
      codeState !== "success" &&
      !codeExpired
    ) {
      const t = setTimeout(() => doVerify(val), 400);
      return () => clearTimeout(t);
    }
  }, [code, isVerify, loading, codeState, codeExpired, doVerify]);

  /* ── Sign Up ── */
  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      if (!agreeTerms) {
        setError("Please accept the Terms and Privacy Policy.");
        return;
      }
      if (authMethod === "google" && !hasGooglePending) {
        setError("Google auth required first.");
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
          setSuccess("Account created! Welcome to Altuvera.");
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
          startExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
          setSuccess("Verification code sent.");
        }
      } catch (err) {
        setError(err?.message || "Sign up failed.");
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
      startExpiryCountdown,
    ],
  );

  /* ── Code handlers ── */
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

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await resendCode(activeEmail);
      startExpiryCountdown(CODE_TTL_RESEND);
      setResendTimer(60);
      setCode(emptyCode());
      setCodeState("");
      setSuccess(`New code sent to ${activeEmail}. Valid for 15 min.`);
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message || "Unable to resend.");
    } finally {
      setLoading(false);
    }
  }, [activeEmail, loading, resendCode, resendTimer, startExpiryCountdown]);

  const handleBackFromVerify = useCallback(() => {
    stopExpiryCountdown();
    setCode(emptyCode());
    setError("");
    setSuccess("");
    setModalView(verifySource);
  }, [setModalView, stopExpiryCountdown, verifySource]);

  if (!isModalOpen) return null;

  /* ═══════════════════════════════════════════════════════════
     RENDER HELPERS
  ═══════════════════════════════════════════════════════════ */

  const Spinner = ({ className = "" }) => (
    <div
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  );

  const InputField = ({
    id,
    label,
    icon: IconComponent,
    type = "text",
    value,
    onChange,
    onBlur,
    placeholder,
    error: fieldError,
    valid,
    required,
    autoComplete,
    refProp,
    isEmail = false,
    ...props
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}
        {!required && (
          <span className="text-gray-400 font-normal text-xs ml-1">
            — Optional
          </span>
        )}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <IconComponent
            className={`w-[18px] h-[18px] transition-colors duration-200 ${
              fieldError
                ? "text-red-400"
                : valid
                  ? "text-emerald-500"
                  : "text-gray-400"
            }`}
          />
        </div>
        {isEmail ? (
          <EmailAutocompleteInput
            id={id}
            ref={refProp}
            value={value}
            onValueChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete || "email"}
            required={required}
            className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 ${
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
            id={id}
            ref={refProp}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            className={`w-full h-12 pl-11 pr-10 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-200 ${
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
          <HiCheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 animate-scaleIn" />
        )}
      </div>
      {fieldError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-slideDown">
          <HiExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {fieldError}
        </p>
      )}
    </div>
  );

  const SocialButtons = ({ mode }) => (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => handleGoogleAuth(mode)}
        disabled={!googleLoaded || googleLoading || loading}
        className="flex items-center justify-center gap-2.5 h-12 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {googleLoading ? <Spinner /> : <FcGoogle className="w-5 h-5" />}
        <span>
          {!googleLoaded
            ? "Loading…"
            : googleLoading
              ? "Connecting…"
              : "Google"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => handleGithubAuth(mode)}
        disabled={githubLoading || loading}
        className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {githubLoading ? <Spinner /> : <FiGithub className="w-5 h-5" />}
        <span>{githubLoading ? "Connecting…" : "GitHub"}</span>
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     JSX
  ═══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Animation keyframes injected once at runtime ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes viewIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          50%  { transform: scale(1.15); }
          to   { transform: scale(1); }
        }
        @keyframes scaleX {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }

        /* Animation utility classes used by this modal only */
        .am-fadeIn     { animation: fadeIn     300ms ease-out both; }
        .am-modalIn    { animation: modalIn    450ms cubic-bezier(0.34,1.56,0.64,1) both 80ms; }
        .am-viewIn     { animation: viewIn     350ms ease-out both; }
        .am-stepIn     { animation: stepIn     350ms ease-out both; }
        .am-slideDown  { animation: slideDown  300ms ease-out both; }
        .am-scaleIn    { animation: scaleIn    300ms ease-out both; }
        .am-scaleX     { animation: scaleX     250ms ease-out both; }
        .am-shake      { animation: shake      500ms ease-in-out; }

        /* Scrollbar for the form panel */
        .auth-form-scroll::-webkit-scrollbar       { width: 5px; }
        .auth-form-scroll::-webkit-scrollbar-track { background: transparent; }
        .auth-form-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        .auth-form-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="am-fadeIn fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      >
        {/* ── Modal shell ── */}
        <div
          className="am-modalIn relative w-full max-w-[1040px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          style={{ maxHeight: "92vh" }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 z-50" />

          {/* ── LEFT: Gallery (desktop) ── */}
          <div className="hidden lg:block lg:w-[48%] xl:w-[50%] relative bg-gray-900 flex-shrink-0">
            <GallerySlideshow />
          </div>

          {/* ── LEFT: Gallery (mobile collapsed) ── */}
          <div
            className="lg:hidden relative bg-gray-900 flex-shrink-0"
            style={{ height: "10rem" }}
          >
            <GallerySlideshow intervalMs={6000} />
          </div>

          {/* ── RIGHT: Form panel ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 lg:hidden">
                  <img
                    src={getBrandLogoUrl()}
                    alt={BRAND_LOGO_ALT}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
                <div className="hidden lg:block">
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Altuvera
                  </h3>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                aria-label="Close"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {!isVerify && (
              <div className="flex border-b border-gray-100 px-5 sm:px-7 flex-shrink-0">
                {[
                  { view: "login", label: "Sign In", icon: HiLockClosed },
                  {
                    view: "register",
                    label: "Create Account",
                    icon: HiSparkles,
                  },
                ].map(({ view, label, icon: TabIcon }) => (
                  <button
                    key={view}
                    onClick={() => switchView(view)}
                    disabled={loading}
                    className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      modalView === view
                        ? "text-emerald-600"
                        : "text-gray-500 hover:text-gray-700"
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

            {/* Scrollable form body */}
            <div className="auth-form-scroll flex-1 overflow-y-auto overflow-x-hidden px-5 sm:px-7 py-6">
              {/* ── Alerts ── */}
              {error && (
                <div className="am-slideDown mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm text-red-700">
                    {typeof error === "string" ? error : "An error occurred."}
                  </p>
                  <button
                    onClick={() => setError("")}
                    className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="am-slideDown mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <HiCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm text-emerald-700">{success}</p>
                </div>
              )}

              {/* ════════════ LOGIN ════════════ */}
              {isLogin && (
                <div className="am-viewIn">
                  <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 mb-4">
                      <HiShieldCheck className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h2
                      id="auth-title"
                      className="text-2xl font-extrabold text-gray-900 tracking-tight"
                    >
                      Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Sign in to your travel dashboard
                    </p>
                  </div>

                  <form
                    onSubmit={handleSignIn}
                    noValidate
                    className="space-y-4"
                  >
                    <InputField
                      id="login-email"
                      label="Email Address"
                      icon={HiMail}
                      value={form.email}
                      onChange={(v) => set("email", v)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      isEmail
                      refProp={firstInputRef}
                      error={
                        emailTouched && !emailOk
                          ? "Please enter a valid email."
                          : ""
                      }
                      valid={emailTouched && emailOk}
                    />
                    <InputField
                      id="login-name"
                      label="Full Name"
                      icon={HiUser}
                      value={form.fullName}
                      onChange={(v) => set("fullName", v)}
                      onBlur={() => setNameTouched(true)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                      error={
                        nameTouched && !nameOk
                          ? "At least 2 characters required."
                          : ""
                      }
                      valid={nameTouched && nameOk}
                    />

                    {/* Keep signed in */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          form.keepSignedIn
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-300 group-hover:border-gray-400"
                        }`}
                      >
                        {form.keepSignedIn && (
                          <HiCheck className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={form.keepSignedIn}
                        onChange={(e) => set("keepSignedIn", e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm text-gray-600">
                        Keep me signed in
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || isBusy}
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Spinner />
                          <span>Signing In…</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Email</span>
                          <HiArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-1">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        or continue with
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <SocialButtons mode="signin" />
                  </form>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
                    {[
                      { icon: RiShieldKeyholeLine, text: "256-bit Encrypted" },
                      { icon: MdVerified, text: "Verified" },
                      { icon: MdOutlineSecurityUpdateGood, text: "GDPR" },
                    ].map(({ icon: BadgeIcon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-1.5 text-[11px] text-gray-400"
                      >
                        <BadgeIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Switch to register */}
                  <div className="text-center mt-6 pt-5 border-t border-gray-100">
                    <span className="text-sm text-gray-500">New here? </span>
                    <button
                      onClick={() => switchView("register")}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                    >
                      Create an account <HiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ REGISTER ════════════ */}
              {isRegister && (
                <div className="am-viewIn">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
                      <HiGlobe className="w-7 h-7 text-blue-600" />
                    </div>
                    <h2
                      id="auth-title"
                      className="text-2xl font-extrabold text-gray-900 tracking-tight"
                    >
                      {
                        ["Choose Method", "Your Profile", "Confirm"][
                          signUpStep - 1
                        ]
                      }
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {
                        [
                          "Pick how you'd like to join",
                          "Tell us about yourself",
                          "Review and create your account",
                        ][signUpStep - 1]
                      }
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center justify-center mb-7 px-4">
                    {[
                      { n: 1, l: "Method" },
                      { n: 2, l: "Profile" },
                      { n: 3, l: "Confirm" },
                    ].map(({ n, l }, i) => (
                      <React.Fragment key={n}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                              signUpStep > n
                                ? "bg-emerald-500 text-white"
                                : signUpStep === n
                                  ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {signUpStep > n ? (
                              <HiCheck className="w-4 h-4" />
                            ) : (
                              n
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-medium transition-colors duration-300 ${
                              signUpStep >= n
                                ? "text-emerald-600"
                                : "text-gray-400"
                            }`}
                          >
                            {l}
                          </span>
                        </div>
                        {i < 2 && (
                          <div className="flex-1 h-0.5 mx-3 mb-5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full bg-emerald-500 rounded-full transition-all duration-500 ${
                                signUpStep > n ? "w-full" : "w-0"
                              }`}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* ── Step 1 ── */}
                  {signUpStep === 1 && (
                    <div className="space-y-4 am-stepIn">
                      {hasGooglePending ? (
                        <div className="text-center py-8 px-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                            <HiCheckCircle className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Google Connected
                          </h3>
                          <p className="text-sm text-gray-600 mb-5">
                            Click Continue to set up your profile.
                          </p>
                          <button
                            onClick={() => setSignUpStep(2)}
                            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                          >
                            Continue <HiArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <InputField
                            id="reg-email"
                            label="Email Address"
                            icon={HiMail}
                            value={form.email}
                            onChange={(v) => set("email", v)}
                            onBlur={() => setEmailTouched(true)}
                            placeholder="traveler@example.com"
                            autoComplete="email"
                            required
                            isEmail
                            refProp={firstInputRef}
                            error={
                              emailTouched && !emailOk
                                ? "Enter a valid email."
                                : ""
                            }
                            valid={emailTouched && emailOk}
                          />
                          <InputField
                            id="reg-name"
                            label="Full Name"
                            icon={HiUser}
                            value={form.fullName}
                            onChange={(v) => set("fullName", v)}
                            onBlur={() => setNameTouched(true)}
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                            error={
                              nameTouched && !nameOk
                                ? "At least 2 characters."
                                : ""
                            }
                            valid={nameTouched && nameOk}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEmailTouched(true);
                              setNameTouched(true);
                              if (emailOk && nameOk) {
                                setAuthMethod("email");
                                setSignUpStep(2);
                              } else {
                                setError("Enter a valid email and name.");
                              }
                            }}
                            disabled={isBusy}
                            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 transition-all duration-200"
                          >
                            <FiZap className="w-4 h-4" />
                            Continue with Email
                            <HiArrowRight className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-4 my-1">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                              or
                            </span>
                            <div className="flex-1 h-px bg-gray-200" />
                          </div>
                          <SocialButtons mode="signup" />
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
                            src={
                              googleUser.picture || initAvatar(googleUser.name)
                            }
                            alt=""
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "9999px",
                              objectFit: "cover",
                              display: "block",
                              border: "2px solid #e5e7eb",
                              flexShrink: 0,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {googleUser.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {googleUser.email}
                            </p>
                          </div>
                          <MdVerified className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        </div>
                      )}

                      <InputField
                        id="reg-phone"
                        label="Phone Number"
                        icon={HiPhone}
                        type="tel"
                        value={form.phone}
                        onChange={(v) => set("phone", formatPhone(v))}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        error={
                          form.phone && !phoneOk
                            ? "Enter a valid phone number."
                            : ""
                        }
                        valid={form.phone && phoneOk}
                      />

                      {/* Role selector */}
                      <div className="space-y-2">
                        <span className="block text-sm font-semibold text-gray-700">
                          I am a…
                        </span>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {ROLES.map(
                            ({ value, label, icon: RIcon, desc, color }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => set("role", value)}
                                className={`relative flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                                  form.role === value
                                    ? "border-emerald-400 bg-emerald-50/80 shadow-sm shadow-emerald-100"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                                }`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-all duration-200 ${
                                    form.role === value
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  <RIcon className="w-[18px] h-[18px]" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                  {label}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">
                                  {desc}
                                </span>
                                {form.role === value && (
                                  <div className="am-scaleIn absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <HiCheck className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reg-bio"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Short Bio{" "}
                          <span className="text-gray-400 font-normal text-xs">
                            — Optional
                          </span>
                        </label>
                        <textarea
                          id="reg-bio"
                          rows={3}
                          value={form.bio}
                          onChange={(e) => set("bio", e.target.value)}
                          placeholder="Tell us about your travel style…"
                          maxLength={MAX_BIO + 20}
                          className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-sm p-3.5 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-gray-300 resize-none transition-all duration-200"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <HiInformationCircle className="w-3.5 h-3.5" />
                            Shown on your public profile
                          </p>
                          <span
                            className={`text-xs tabular-nums ${
                              form.bio.length > MAX_BIO * 0.85
                                ? form.bio.length > MAX_BIO
                                  ? "text-red-500 font-semibold"
                                  : "text-amber-500"
                                : "text-gray-400"
                            }`}
                          >
                            {form.bio.length}/{MAX_BIO}
                          </span>
                        </div>
                      </div>

                      {/* Nav */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSignUpStep(1);
                            clearGooglePending?.();
                          }}
                          className="flex items-center gap-2 px-5 h-11 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                          <HiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!phoneOk) {
                              setError("Invalid phone.");
                              return;
                            }
                            if (!bioOk) {
                              setError(`Bio max ${MAX_BIO} chars.`);
                              return;
                            }
                            setError("");
                            setSignUpStep(3);
                          }}
                          disabled={!phoneOk || !bioOk}
                          className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                        >
                          Continue <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3 ── */}
                  {signUpStep === 3 && (
                    <form
                      onSubmit={handleSignUp}
                      noValidate
                      className="space-y-5 am-stepIn"
                    >
                      {/* Avatar card */}
                      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200">
                        <div className="relative flex-shrink-0">
                          <div
                            className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"
                            style={{
                              width: "72px",
                              height: "72px",
                              padding: "3px",
                            }}
                          >
                            <img
                              src={avatarSrc}
                              alt="Avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "9999px",
                                objectFit: "cover",
                                display: "block",
                                border: "2px solid white",
                              }}
                            />
                          </div>
                          <label
                            className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-emerald-600 hover:scale-110 transition-all ${
                              avatarUploading ? "cursor-wait" : ""
                            }`}
                          >
                            {avatarUploading ? (
                              <HiRefresh className="w-3.5 h-3.5 text-white animate-spin" />
                            ) : (
                              <HiPhotograph className="w-3.5 h-3.5 text-white" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              disabled={avatarUploading}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate">
                            {form.fullName || googleUser?.name || "Your Name"}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {form.email || googleUser?.email}
                          </p>
                          <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
                            {React.createElement(currentRole?.icon || HiGlobe, {
                              className: "w-3.5 h-3.5",
                            })}
                            {currentRole?.label}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">
                          Account Summary
                        </h4>
                        <dl className="space-y-2.5">
                          {[
                            ["Email", form.email || googleUser?.email],
                            ["Phone", form.phone || "Not provided"],
                            ["Role", currentRole?.label],
                            [
                              "Auth",
                              authMethod === "google" ? "Google" : "Email OTP",
                            ],
                          ].map(([dt, dd]) => (
                            <div
                              key={dt}
                              className="flex justify-between text-sm"
                            >
                              <dt className="text-gray-500">{dt}</dt>
                              <dd className="font-medium text-gray-800 text-right truncate ml-4 max-w-[180px]">
                                {dd}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      {/* Keep signed in */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            form.keepSignedIn
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {form.keepSignedIn && (
                            <HiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={form.keepSignedIn}
                          onChange={(e) =>
                            set("keepSignedIn", e.target.checked)
                          }
                          className="sr-only"
                        />
                        <span className="text-sm text-gray-600">
                          Keep me signed in
                        </span>
                      </label>

                      {/* Terms */}
                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-gray-50 border border-gray-200 group">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            agreeTerms
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {agreeTerms && (
                            <HiCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          required
                          className="sr-only"
                        />
                        <span className="text-sm text-gray-600 leading-relaxed">
                          I agree to the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700"
                          >
                            Terms
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700"
                          >
                            Privacy Policy
                          </a>
                        </span>
                      </label>

                      {/* Nav */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSignUpStep(2)}
                          disabled={loading || avatarUploading}
                          className="flex items-center gap-2 px-5 h-11 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-100 transition-all"
                        >
                          <HiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading || avatarUploading || !agreeTerms}
                          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200"
                        >
                          {loading || avatarUploading ? (
                            <>
                              <Spinner />
                              <span>Creating…</span>
                            </>
                          ) : (
                            <>
                              <span>Create Account</span>
                              <HiCheck className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Switch to login */}
                  <div className="text-center mt-6 pt-5 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      Already have an account?{" "}
                    </span>
                    <button
                      onClick={() => switchView("login")}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                    >
                      Sign in <HiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ════════════ VERIFY ════════════ */}
              {isVerify && (
                <div className="am-viewIn">
                  <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 mb-4">
                      <HiMail className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h2
                      id="auth-title"
                      className="text-2xl font-extrabold text-gray-900 tracking-tight"
                    >
                      Check Your Inbox
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      We sent a 6-digit code to:
                    </p>
                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-800">
                      <HiMail className="w-4 h-4 text-emerald-500" />
                      <span className="break-all">
                        {activeEmail || "No email"}
                      </span>
                    </div>

                    {/* Expiry badge */}
                    {codeState !== "success" && (
                      <div
                        className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          codeExpired
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : codeExpiry <= 30
                              ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                              : codeExpiry <= 120
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {codeExpired ? (
                          <>
                            <HiExclamationCircle className="w-4 h-4" />
                            <span>Code expired — request a new one</span>
                          </>
                        ) : (
                          <>
                            <HiInformationCircle className="w-4 h-4" />
                            <span>
                              Expires in{" "}
                              <strong className="tabular-nums font-bold">
                                {formatExpiry(codeExpiry)}
                              </strong>
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      doVerify(code.join(""));
                    }}
                    noValidate
                    className="space-y-5"
                  >
                    {/* OTP inputs */}
                    <div
                      className={`flex justify-center gap-2.5 sm:gap-3 ${
                        codeState === "verifying" ? "animate-pulse" : ""
                      } ${codeState === "error" ? "am-shake" : ""}`}
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
                          pattern="[0-9]"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleCodeKey(i, e)}
                          disabled={
                            codeState === "verifying" ||
                            codeState === "success" ||
                            codeExpired
                          }
                          className={`text-center text-2xl font-bold font-mono rounded-xl border-2 outline-none transition-all duration-200 ${
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
                          style={{ width: "3rem", height: "3.5rem" }}
                          aria-label={`Digit ${i + 1}`}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                        />
                      ))}
                    </div>

                    {/* Status banners */}
                    {codeState === "verifying" && (
                      <div className="am-slideDown flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium">
                        <Spinner /> Verifying…
                      </div>
                    )}
                    {codeState === "success" && (
                      <div className="am-slideDown flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                        <HiCheckCircle className="w-5 h-5" /> Verified!
                        Redirecting…
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        code.join("").length !== 6 ||
                        codeState === "verifying" ||
                        codeState === "success" ||
                        codeExpired
                      }
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading || codeState === "verifying" ? (
                        <>
                          <Spinner />
                          <span>Verifying…</span>
                        </>
                      ) : codeState === "success" ? (
                        <>
                          <HiCheckCircle className="w-5 h-5" />
                          <span>Verified!</span>
                        </>
                      ) : codeExpired ? (
                        <>
                          <HiExclamationCircle className="w-5 h-5" />
                          <span>Code Expired</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Continue</span>
                          <HiArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Back + Resend */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleBackFromVerify}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-gray-600 font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-all sm:w-auto w-full"
                      >
                        <HiArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-emerald-600 font-semibold text-sm border-2 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <HiRefresh
                          className={`w-4 h-4 ${
                            resendTimer > 0 || loading ? "animate-spin" : ""
                          }`}
                        />
                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-7 py-3.5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <RiShieldKeyholeLine className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL encryption • We never share your data
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
