// AuthModal.jsx - Professional, Elevated, Complete
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
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { FiGithub, FiZap } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdVerified, MdOutlineSecurityUpdateGood } from "react-icons/md";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { useUserAuth } from "../../context/UserAuthContext";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
import "./AuthModal.css";

// ── Side Media Library ────────────────────────────────────────────────────────
const SIDE_MEDIA = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=1200&q=85",
    alt: "Male lion resting in the golden grass of the Serengeti",
    caption: "Serengeti, Tanzania",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=85",
    alt: "Pristine white sand and turquoise waters of Zanzibar",
    caption: "Zanzibar, Tanzania",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1626569104037-7756f7e2d93e?auto=format&fit=crop&w=1200&q=85",
    alt: "The snow-capped peak of Mount Kilimanjaro above the clouds",
    caption: "Kilimanjaro, Tanzania",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1581281863883-2469417a1668?auto=format&fit=crop&w=1200&q=85",
    alt: "Mountain gorilla in the misty forests of Rwanda",
    caption: "Volcanoes NP, Rwanda",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1549366021-9f761d450614?auto=format&fit=crop&w=1200&q=85",
    alt: "Silhouettes of giraffes against an orange savanna sunset",
    caption: "Maasai Mara, Kenya",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&w=1200&q=85",
    alt: "Historic narrow alleys and carved doors of Stone Town",
    caption: "Stone Town, Zanzibar",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1565126322818-4905187e0766?auto=format&fit=crop&w=1200&q=85",
    alt: "Massive flock of pink flamingos at Lake Nakuru",
    caption: "Lake Nakuru, Kenya",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=85",
    alt: "Panoramic view of the vast Ngorongoro Crater in Tanzania",
    caption: "Ngorongoro Crater, Tanzania",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=85",
    alt: "Leopard resting high on a branch of an acacia tree",
    caption: "Masai Mara, Kenya",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
    alt: "Cheetah scanning the horizon for prey in the grass",
    caption: "Amboseli, Kenya",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1590001158193-7efcc52ee3d1?auto=format&fit=crop&w=1200&q=85",
    alt: "Portrait of a Maasai warrior in traditional red shuka",
    caption: "Maasai Village, Tanzania",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&w=1200&q=85",
    alt: "Luxury safari camp lighting up at dusk under the stars",
    caption: "Safari Camp, Serengeti",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1519066629447-267fffa62d4b?auto=format&fit=crop&w=1200&q=85",
    alt: "Infinite horizon of the East African savanna",
    caption: "East African Savanna",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1502675135417-54932689180c?auto=format&fit=crop&w=1200&q=85",
    alt: "Large ancient Baobab tree standing in the Tarangire landscape",
    caption: "Tarangire NP, Tanzania",
  },
];

// ── Side Media Rotator ────────────────────────────────────────────────────────
const ANIM_VARIANTS = ["slide-right", "slide-up", "zoom-in", "diagonal", "fade"];

const SideMediaRotator = ({ intervalMs = 7000 }) => {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(null);
  const [animVariant, setAnimVariant] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    setIdx((i) => {
      const n = (i + 1) % SIDE_MEDIA.length;
      setPrev(i);
      setAnimVariant((v) => (v + 1) % ANIM_VARIANTS.length);
      setTimeout(() => setPrev(null), 900);
      return n;
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [advance, intervalMs, isPaused]);

  const cur = SIDE_MEDIA[idx];
  const prevItem = prev !== null ? SIDE_MEDIA[prev] : null;
  const variant = ANIM_VARIANTS[animVariant];

  return (
    <div
      className="auth-side-media"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onDoubleClick={advance}
      aria-hidden="true"
    >
      {/* Outgoing layer */}
      {prevItem && (
        <div
          className={`auth-side-media__layer is-out is-out--${variant}`}
          key={`out-${prev}`}
        >
          <img
            src={prevItem.src}
            alt={prevItem.alt}
            className="auth-side-media__img"
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      {/* Incoming layer */}
      <div
        className={`auth-side-media__layer is-in is-in--${variant}`}
        key={`in-${idx}`}
      >
        <img
          src={cur.src}
          alt={cur.alt}
          className="auth-side-media__img"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Ken Burns zoom on current */}
      <div className="auth-side-media__ken-burns" />

      {/* Progress indicators */}
      <div className="auth-side-media__dots">
        {SIDE_MEDIA.map((_, i) => (
          <button
            key={i}
            className={`auth-side-dot ${i === idx ? "auth-side-dot--active" : ""}`}
            onClick={() => {
              setPrev(idx);
              setAnimVariant((v) => (v + 1) % ANIM_VARIANTS.length);
              setIdx(i);
              setTimeout(() => setPrev(null), 900);
            }}
            aria-label={`View ${SIDE_MEDIA[i].caption}`}
          />
        ))}
      </div>
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
    desc: "Explore & discover destinations",
    color: "#3b82f6",
    gradient: "from-blue-50 to-blue-100",
  },
  {
    value: "photographer",
    label: "Photographer",
    icon: HiPhotograph,
    desc: "Capture unforgettable moments",
    color: "#8b5cf6",
    gradient: "from-purple-50 to-purple-100",
  },
  {
    value: "planner",
    label: "Travel Planner",
    icon: HiSparkles,
    desc: "Craft & share itineraries",
    color: "#059669",
    gradient: "from-emerald-50 to-emerald-100",
  },
];

const TRUST_BADGES = [
  { icon: RiShieldKeyholeLine, label: "256-bit Encrypted" },
  { icon: MdVerified, label: "Verified Platform" },
  { icon: MdOutlineSecurityUpdateGood, label: "GDPR Compliant" },
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
        String.fromCharCode(parseInt(h, 16))
      )
    );
  } catch {
    return "";
  }
};

const initAvatar = (name, color = "#059669") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${color}cc"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Inter,sans-serif" font-size="52" font-weight="700" fill="#fff">
      ${getInitials(name)}
    </text>
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

// ── Sub-components ────────────────────────────────────────────────────────────
const Spinner = ({ label = "Loading", size = "sm" }) => (
  <span
    className={`auth-spinner auth-spinner--${size}`}
    role="status"
    aria-label={label}
  />
);

const FieldHint = ({ icon: Icon = HiInformationCircle, children }) => (
  <span className="auth-field-hint">
    <Icon aria-hidden="true" />
    <span>{children}</span>
  </span>
);

const AuthDivider = ({ label = "or continue with" }) => (
  <div className="auth-divider" role="separator" aria-label={label}>
    <div className="auth-divider__line" />
    <span className="auth-divider__text">{label}</span>
    <div className="auth-divider__line" />
  </div>
);

const TrustRow = () => (
  <div className="auth-trust-row">
    {TRUST_BADGES.map(({ icon: Icon, label }) => (
      <div className="auth-trust-badge" key={label}>
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

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

  // ── Form State ──
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

  // ── Refs ──
  const codeRefs = useRef([]);
  const firstInputRef = useRef(null);
  const prevTitleRef = useRef(document.title);
  const wasOpenRef = useRef(false);

  // ── Computed ──
  const isLogin = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify = modalView === "verify";
  const activeEmail = (pendingEmail || form.email || googleUser?.email || "").trim();
  const emailOk = EMAIL_RE.test(form.email.trim());
  const nameOk = form.fullName.trim().length >= 2;
  const phoneOk = !form.phone.trim() || PHONE_RE.test(form.phone.trim());
  const bioOk = form.bio.trim().length <= MAX_BIO;
  const isBusy = googleLoading || githubLoading || loading;

  const currentRole = useMemo(
    () => ROLES.find((r) => r.value === form.role) || ROLES[0],
    [form.role]
  );

  const avatarSrc = useMemo(
    () =>
      form.avatarPreview ||
      (googleUser?.picture && authMethod === "google" ? googleUser.picture : null) ||
      initAvatar(form.fullName || form.email || "U", currentRole?.color),
    [form.avatarPreview, form.fullName, form.email, googleUser?.picture, authMethod, currentRole?.color]
  );

  // ── Field Updater ──
  const set = useCallback(
    (field, val) => {
      setForm((p) => ({ ...p, [field]: val }));
      setError("");
      setSuccess("");
      clearSocialAuthError?.();
    },
    [clearSocialAuthError]
  );

  const switchView = useCallback(
    (view) => {
      if (loading) return;
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
    [clearGooglePending, clearSocialAuthError, loading, setModalView]
  );

  // ── Effects ──
  useEffect(() => {
    if (isModalOpen && !wasOpenRef.current) prevTitleRef.current = document.title;
    if (isModalOpen) {
      document.title =
        { login: "Sign In | Altuvera", register: "Create Account | Altuvera", verify: "Verify Email | Altuvera" }[modalView] ||
        "Account | Altuvera";
    } else if (wasOpenRef.current) {
      document.title = prevTitleRef.current;
    }
    wasOpenRef.current = isModalOpen;
  }, [isModalOpen, modalView]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => { if (e.key === "Escape") closeModal(); };
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
    setEmailTouched(false);
    setNameTouched(false);
    if (isRegister && !hasGooglePending) setSignUpStep(1);
    setForm((p) => ({ ...p, keepSignedIn: persistSession }));
    setTimeout(() => firstInputRef.current?.focus(), 320);
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
      setSuccess("Google account connected! Complete your profile to continue.");
    }
  }, [googleUser, isRegister]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Auto-verify on 6 digits
  useEffect(() => {
    const val = code.join("");
    if (val.length === 6 && isVerify && !loading && codeState !== "verifying") {
      const t = setTimeout(() => doVerify(val), 300);
      return () => clearTimeout(t);
    }
  }, [code, isVerify, loading, codeState]);

  // ── Google / GitHub Auth ──
  const handleGoogleAuth = useCallback(
    async (mode = "signin") => {
      if (!googleLoaded || isBusy) return;
      clearSocialAuthError?.();
      setError("");
      setSuccess("");
      try {
        const result = await promptGoogleAuth({ mode });
        if (mode === "signup" && result)
          setSuccess("Google account connected! Complete your profile.");
      } catch (err) {
        const msg = err?.message || "Google authentication failed.";
        setError(
          msg.includes("popup") || msg.includes("closed")
            ? "Sign-in window was closed. Please try again."
            : msg
        );
      }
    },
    [clearSocialAuthError, googleLoaded, isBusy, promptGoogleAuth]
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
    [clearSocialAuthError, isBusy, startGithubAuth]
  );

  // ── Avatar ──
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > MAX_FILE) { setError("Image must be 10 MB or less."); return; }
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
    const fallback = form.avatarPreview || initAvatar(form.fullName || form.email, currentRole?.color);
    if (!form.avatarFile) return fallback;
    setAvatarUploading(true);
    try {
      return await uploadAvatar(form.avatarFile);
    } catch {
      setSuccess("Using placeholder avatar — update it anytime in your profile.");
      return fallback;
    } finally {
      setAvatarUploading(false);
    }
  }, [currentRole?.color, form.avatarFile, form.avatarPreview, form.email, form.fullName, googleUser?.picture, uploadAvatar]);

  // ── Sign In ──
  const handleSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      setEmailTouched(true);
      setNameTouched(true);
      if (!emailOk) { setError("Please enter a valid email address."); return; }
      if (!nameOk) { setError("Please enter your full name."); return; }
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setVerifySource("login");
        setAuthMethod("email");
        setSessionPreference(form.keepSignedIn);
        await login({ email: form.email.trim(), fullName: form.fullName.trim(), persistSession: form.keepSignedIn });
        setSuccess("Verification code sent! Check your inbox.");
      } catch (err) {
        setError(err?.message || "Sign in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [emailOk, nameOk, form.email, form.fullName, form.keepSignedIn, login, setSessionPreference]
  );

  // ── Sign Up ──
  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      if (!agreeTerms) { setError("Please accept the Terms of Service and Privacy Policy."); return; }
      if (authMethod === "google" && !hasGooglePending) {
        setError("Google authentication required. Please sign in with Google first.");
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
          await completeGoogleSignUp({ fullName: form.fullName.trim(), phone: form.phone.trim(), bio: form.bio.trim(), role: form.role, avatar });
        } else {
          await register({ email: form.email.trim(), fullName: form.fullName.trim(), phone: form.phone.trim(), bio: form.bio.trim(), role: form.role, avatar, persistSession: form.keepSignedIn });
        }
        setSuccess(authMethod === "google" ? "Account created! Welcome to Altuvera." : "Verification code sent to your email.");
      } catch (err) {
        setError(err?.message || "Sign up failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [agreeTerms, authMethod, completeGoogleSignUp, form, hasGooglePending, register, resolveAvatar, setSessionPreference]
  );

  // ── Code Handlers ──
  const handleCodeChange = useCallback((i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    setCode((p) => { const n = [...p]; n[i] = val; return n; });
    setError("");
    setCodeState("");
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  }, []);

  const handleCodeKey = useCallback(
    (i, e) => {
      if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
    },
    [code]
  );

  const handleCodePaste = useCallback((e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = emptyCode();
    digits.split("").forEach((d, i) => { next[i] = d; });
    setCode(next);
    setCodeState("");
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  }, []);

  const doVerify = useCallback(
    async (val) => {
      if (!activeEmail) { setError("Missing email. Please restart."); return; }
      if (val.length !== 6) { setError("Please enter the full 6-digit code."); return; }
      try {
        setLoading(true);
        setCodeState("verifying");
        setError("");
        await verifyCode(activeEmail, val);
        setCodeState("success");
      } catch (err) {
        setCodeState("error");
        setError(err?.message || "Verification failed. Please try again.");
        setTimeout(() => setCodeState(""), 900);
      } finally {
        setLoading(false);
      }
    },
    [activeEmail, verifyCode]
  );

  const handleVerifySubmit = useCallback(
    async (e) => { e.preventDefault(); await doVerify(code.join("")); },
    [code, doVerify]
  );

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;
    try {
      setLoading(true);
      setError("");
      await resendCode(activeEmail);
      setSuccess(`New code sent to ${activeEmail}. Valid for ${CODE_TTL} minutes.`);
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

  // ── Social Buttons ──
  const SocialButtons = ({ mode }) => (
    <div className="auth-social-row">
      <button
        type="button"
        className="auth-btn auth-btn--google"
        onClick={() => handleGoogleAuth(mode)}
        disabled={!googleLoaded || googleLoading || loading}
        aria-busy={googleLoading}
      >
        {googleLoading
          ? <Spinner label="Connecting to Google" />
          : <FcGoogle className="auth-social-icon" aria-hidden="true" />}
        <span>{googleLoading ? "Connecting…" : "Google"}</span>
      </button>
      <button
        type="button"
        className="auth-btn auth-btn--github"
        onClick={() => handleGithubAuth(mode)}
        disabled={githubLoading || loading}
        aria-busy={githubLoading}
      >
        {githubLoading
          ? <Spinner label="Connecting to GitHub" />
          : <FiGithub className="auth-social-icon" aria-hidden="true" />}
        <span>{githubLoading ? "Connecting…" : "GitHub"}</span>
      </button>
    </div>
  );

  // ── Render ──
  return (
    <div
      className="auth-overlay"
      onClick={closeModal}
      role="presentation"
      aria-label="Close authentication modal"
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Animated Accent Bar ── */}
        <div className="auth-modal__accent-bar" aria-hidden="true" />

        {/* ── Side Panel ── */}
        <aside className="auth-side-panel" aria-hidden="true">
          <SideMediaRotator />

          {/* Dark gradient overlay */}
          <div className="auth-side-panel__overlay" />

          {/* Side content */}
          <div className="auth-side-panel__content">
            <div className="auth-side-panel__logo">
              <img
                src={getBrandLogoUrl()}
                alt={BRAND_LOGO_ALT}
                className="auth-side-panel__logo-img"
                loading="eager"
              />
            </div>
            <h3 className="auth-side-panel__title">
              Discover<br />East Africa
            </h3>
            <p className="auth-side-panel__subtitle">
              Join thousands of travelers exploring the wild beauty and ancient
              culture of the Rift Valley and beyond.
            </p>
            <div className="auth-side-panel__stats">
              {[
                { value: "50K+", label: "Travelers" },
                { value: "120+", label: "Destinations" },
                { value: "4.9★", label: "Rated" },
              ].map(({ value, label }) => (
                <div className="auth-side-stat" key={label}>
                  <span className="auth-side-stat__value">{value}</span>
                  <span className="auth-side-stat__label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Panel ── */}
        <main className="auth-main-panel">
          {/* Header */}
          <header className="auth-modal-header">
            <div className="auth-modal-brand">
              <div className="auth-brand-logomark">
                <img
                  src={getBrandLogoUrl()}
                  alt={BRAND_LOGO_ALT}
                  className="auth-brand-logomark__img"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="auth-brand-text-group">
                <span className="auth-brand-name">Altuvera</span>
                <span className="auth-brand-tagline">Premium Adventures</span>
              </div>
            </div>
            <button
              className="auth-close-btn"
              onClick={closeModal}
              aria-label="Close dialog"
              type="button"
            >
              <HiX aria-hidden="true" />
            </button>
          </header>

          {/* Tab Nav */}
          {!isVerify && (
            <nav className="auth-tab-nav" role="tablist" aria-label="Authentication options">
              <button
                type="button"
                className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
                onClick={() => switchView("login")}
                role="tab"
                aria-selected={isLogin}
                aria-controls="login-panel"
                id="login-tab"
                disabled={loading}
              >
                <HiLockClosed aria-hidden="true" />
                <span>Sign In</span>
                {isLogin && <span className="auth-tab__indicator" aria-hidden="true" />}
              </button>
              <button
                type="button"
                className={`auth-tab ${isRegister ? "auth-tab--active" : ""}`}
                onClick={() => switchView("register")}
                role="tab"
                aria-selected={isRegister}
                aria-controls="register-panel"
                id="register-tab"
                disabled={loading}
              >
                <HiSparkles aria-hidden="true" />
                <span>Create Account</span>
                {isRegister && <span className="auth-tab__indicator" aria-hidden="true" />}
              </button>
            </nav>
          )}

          {/* Scrollable Content Area */}
          <div className="auth-modal-body">
            {/* Messages */}
            {error && (
              <div
                className="auth-alert auth-alert--error"
                role="alert"
                aria-live="assertive"
              >
                <HiExclamationCircle aria-hidden="true" />
                <p>{typeof error === "string" ? error : error?.message || "An error occurred."}</p>
                <button
                  className="auth-alert__dismiss"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  type="button"
                >
                  <HiX />
                </button>
              </div>
            )}
            {success && (
              <div
                className="auth-alert auth-alert--success"
                role="status"
                aria-live="polite"
              >
                <HiCheckCircle aria-hidden="true" />
                <span>{success}</span>
              </div>
            )}

            {/* ══════════════════════════════════════════
                LOGIN VIEW
            ══════════════════════════════════════════ */}
            {isLogin && (
              <section
                className="auth-view auth-view--login"
                id="login-panel"
                role="tabpanel"
                aria-labelledby="login-tab"
              >
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--signin">
                    <HiShieldCheck aria-hidden="true" />
                  </div>
                  <h2 id="auth-modal-title" className="auth-view-title">
                    Welcome Back
                  </h2>
                  <p className="auth-view-subtitle">
                    Sign in to access your travel dashboard
                  </p>
                </div>

                <form
                  className="auth-form"
                  onSubmit={handleSignIn}
                  noValidate
                >
                  {/* Email */}
                  <div className={`auth-field ${emailTouched && !emailOk ? "auth-field--error" : emailTouched && emailOk ? "auth-field--valid" : ""}`}>
                    <label className="auth-field-label" htmlFor="login-email">
                      Email Address
                    </label>
                    <div className="auth-input-wrap">
                      <HiMail className="auth-input-icon" aria-hidden="true" />
                      <EmailAutocompleteInput
                        id="login-email"
                        ref={firstInputRef}
                        value={form.email}
                        onValueChange={(v) => set("email", v)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        aria-invalid={emailTouched && !emailOk}
                        aria-describedby={emailTouched && !emailOk ? "login-email-error" : undefined}
                      />
                      {emailTouched && emailOk && (
                        <HiCheckCircle className="auth-input-valid-icon" aria-hidden="true" />
                      )}
                    </div>
                    {emailTouched && !emailOk && (
                      <span className="auth-field-error" id="login-email-error" role="alert">
                        Please enter a valid email address.
                      </span>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className={`auth-field ${nameTouched && !nameOk ? "auth-field--error" : nameTouched && nameOk ? "auth-field--valid" : ""}`}>
                    <label className="auth-field-label" htmlFor="login-name">
                      Full Name
                    </label>
                    <div className="auth-input-wrap">
                      <HiUser className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="login-name"
                        type="text"
                        value={form.fullName}
                        onChange={(e) => set("fullName", e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                        minLength={2}
                        aria-invalid={nameTouched && !nameOk}
                      />
                      {nameTouched && nameOk && (
                        <HiCheckCircle className="auth-input-valid-icon" aria-hidden="true" />
                      )}
                    </div>
                    {nameTouched && !nameOk && (
                      <span className="auth-field-error" role="alert">
                        Please enter at least 2 characters.
                      </span>
                    )}
                  </div>

                  {/* Keep Signed In */}
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      checked={form.keepSignedIn}
                      onChange={(e) => set("keepSignedIn", e.target.checked)}
                    />
                    <span className="auth-checkbox__box" aria-hidden="true">
                      {form.keepSignedIn && <HiCheck />}
                    </span>
                    <span className="auth-checkbox__label">Keep me signed in</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary auth-btn--full"
                    disabled={loading || isBusy}
                    aria-busy={loading}
                  >
                    {loading
                      ? <><Spinner label="Signing in" /><span>Signing In…</span></>
                      : <><span>Continue with Email</span><HiArrowRight aria-hidden="true" /></>}
                  </button>

                  <AuthDivider />
                  <SocialButtons mode="signin" />
                </form>

                <TrustRow />

                <p className="auth-switch-hint">
                  <span>New to Altuvera?</span>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchView("register")}
                  >
                    Create an account <HiArrowRight aria-hidden="true" />
                  </button>
                </p>
              </section>
            )}

            {/* ══════════════════════════════════════════
                REGISTER VIEW
            ══════════════════════════════════════════ */}
            {isRegister && (
              <section
                className="auth-view auth-view--register"
                id="register-panel"
                role="tabpanel"
                aria-labelledby="register-tab"
              >
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--signup">
                    <HiGlobe aria-hidden="true" />
                  </div>
                  <h2 id="auth-modal-title" className="auth-view-title">
                    {["Choose Method", "Your Profile", "Final Details"][signUpStep - 1]}
                  </h2>
                  <p className="auth-view-subtitle">
                    {[
                      "Start your journey — pick how you'd like to join",
                      "Tell us a bit about yourself",
                      "Review your details and create your account",
                    ][signUpStep - 1]}
                  </p>
                </div>

                {/* Progress Bar */}
                <div
                  className="auth-stepper"
                  role="progressbar"
                  aria-valuenow={signUpStep}
                  aria-valuemin="1"
                  aria-valuemax="3"
                  aria-label={`Step ${signUpStep} of 3`}
                >
                  {[
                    { n: 1, label: "Method" },
                    { n: 2, label: "Profile" },
                    { n: 3, label: "Confirm" },
                  ].map(({ n, label }, i) => (
                    <React.Fragment key={n}>
                      <div className={`auth-stepper-step ${signUpStep >= n ? "is-active" : ""} ${signUpStep > n ? "is-done" : ""}`}>
                        <div className="auth-stepper-circle">
                          {signUpStep > n ? <HiCheck aria-hidden="true" /> : <span>{n}</span>}
                        </div>
                        <span className="auth-stepper-label">{label}</span>
                      </div>
                      {i < 2 && (
                        <div className={`auth-stepper-line ${signUpStep > n ? "is-filled" : ""}`} aria-hidden="true">
                          <div className="auth-stepper-line-fill" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* ── STEP 1: Choose Auth Method ── */}
                {signUpStep === 1 && (
                  <div className="auth-form auth-step-anim">
                    {hasGooglePending ? (
                      <div className="auth-google-connected-card">
                        <div className="auth-google-connected-card__icon">
                          <HiCheckCircle aria-hidden="true" />
                        </div>
                        <h3>Google Account Connected</h3>
                        <p>Your Google account is ready. Click Continue to set up your profile.</p>
                        <button
                          type="button"
                          className="auth-btn auth-btn--primary auth-btn--full"
                          onClick={() => setSignUpStep(2)}
                        >
                          <span>Continue Setup</span>
                          <HiArrowRight aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Email */}
                        <div className={`auth-field ${emailTouched && !emailOk ? "auth-field--error" : emailTouched && emailOk ? "auth-field--valid" : ""}`}>
                          <label className="auth-field-label" htmlFor="reg-email">
                            Email Address
                          </label>
                          <div className="auth-input-wrap">
                            <HiMail className="auth-input-icon" aria-hidden="true" />
                            <EmailAutocompleteInput
                              id="reg-email"
                              ref={firstInputRef}
                              value={form.email}
                              onValueChange={(v) => set("email", v)}
                              onBlur={() => setEmailTouched(true)}
                              placeholder="traveler@example.com"
                              autoComplete="email"
                              required
                              aria-invalid={emailTouched && !emailOk}
                            />
                            {emailTouched && emailOk && (
                              <HiCheckCircle className="auth-input-valid-icon" aria-hidden="true" />
                            )}
                          </div>
                          {emailTouched && !emailOk && (
                            <span className="auth-field-error" role="alert">
                              Please enter a valid email address.
                            </span>
                          )}
                        </div>

                        {/* Full Name */}
                        <div className={`auth-field ${nameTouched && !nameOk ? "auth-field--error" : nameTouched && nameOk ? "auth-field--valid" : ""}`}>
                          <label className="auth-field-label" htmlFor="reg-name">
                            Full Name
                          </label>
                          <div className="auth-input-wrap">
                            <HiUser className="auth-input-icon" aria-hidden="true" />
                            <input
                              id="reg-name"
                              type="text"
                              value={form.fullName}
                              onChange={(e) => set("fullName", e.target.value)}
                              onBlur={() => setNameTouched(true)}
                              placeholder="Your full name"
                              autoComplete="name"
                              required
                              minLength={2}
                              aria-invalid={nameTouched && !nameOk}
                            />
                            {nameTouched && nameOk && (
                              <HiCheckCircle className="auth-input-valid-icon" aria-hidden="true" />
                            )}
                          </div>
                          {nameTouched && !nameOk && (
                            <span className="auth-field-error" role="alert">
                              Please enter at least 2 characters.
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="auth-btn auth-btn--primary auth-btn--full"
                          onClick={() => {
                            setEmailTouched(true);
                            setNameTouched(true);
                            if (emailOk && nameOk) {
                              setSignUpStep(2);
                              setAuthMethod("email");
                            } else {
                              setError("Please enter a valid email and full name.");
                            }
                          }}
                          disabled={isBusy}
                        >
                          <FiZap aria-hidden="true" />
                          <span>Continue with Email</span>
                          <HiArrowRight aria-hidden="true" />
                        </button>

                        <AuthDivider />
                        <SocialButtons mode="signup" />
                      </>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Profile ── */}
                {signUpStep === 2 && (
                  <div className="auth-form auth-step-anim">
                    {/* Google Badge */}
                    {googleUser && (
                      <div className="auth-google-badge">
                        <img
                          src={googleUser.picture || initAvatar(googleUser.name)}
                          alt={googleUser.name}
                          className="auth-google-badge__avatar"
                        />
                        <div className="auth-google-badge__info">
                          <span className="auth-google-badge__name">{googleUser.name}</span>
                          <span className="auth-google-badge__email">{googleUser.email}</span>
                        </div>
                        <MdVerified className="auth-google-badge__verified" aria-label="Verified with Google" />
                      </div>
                    )}

                    {/* Phone */}
                    <div className={`auth-field ${form.phone && !phoneOk ? "auth-field--error" : form.phone && phoneOk ? "auth-field--valid" : ""}`}>
                      <label className="auth-field-label" htmlFor="reg-phone">
                        Phone Number
                        <span className="auth-field-optional"> — Optional</span>
                      </label>
                      <div className="auth-input-wrap">
                        <HiPhone className="auth-input-icon" aria-hidden="true" />
                        <input
                          id="reg-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", formatPhone(e.target.value))}
                          placeholder="+1 (555) 000-0000"
                          autoComplete="tel"
                          aria-invalid={form.phone && !phoneOk}
                        />
                      </div>
                      <FieldHint>Used for booking confirmations & alerts.</FieldHint>
                      {form.phone && !phoneOk && (
                        <span className="auth-field-error" role="alert">
                          Please enter a valid phone number.
                        </span>
                      )}
                    </div>

                    {/* Role */}
                    <div className="auth-field">
                      <span className="auth-field-label">I am a…</span>
                      <div
                        className="auth-role-grid"
                        role="radiogroup"
                        aria-label="Select your role"
                      >
                        {ROLES.map(({ value, label, icon: RoleIcon, desc, color }) => (
                          <button
                            key={value}
                            type="button"
                            className={`auth-role-card ${form.role === value ? "auth-role-card--active" : ""}`}
                            onClick={() => set("role", value)}
                            role="radio"
                            aria-checked={form.role === value}
                            style={{ "--role-color": color }}
                          >
                            <span className="auth-role-card__icon">
                              <RoleIcon aria-hidden="true" />
                            </span>
                            <span className="auth-role-card__label">{label}</span>
                            <span className="auth-role-card__desc">{desc}</span>
                            {form.role === value && (
                              <span className="auth-role-card__check" aria-hidden="true">
                                <HiCheck />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className={`auth-field ${form.bio.length > MAX_BIO ? "auth-field--error" : ""}`}>
                      <label className="auth-field-label" htmlFor="reg-bio">
                        Short Bio
                        <span className="auth-field-optional"> — Optional</span>
                      </label>
                      <div className="auth-input-wrap auth-input-wrap--textarea">
                        <textarea
                          id="reg-bio"
                          rows={3}
                          value={form.bio}
                          onChange={(e) => set("bio", e.target.value)}
                          placeholder="Tell us about your travel style and passions…"
                          maxLength={MAX_BIO + 20}
                          aria-describedby="bio-counter"
                        />
                      </div>
                      <div className="auth-field-footer">
                        <FieldHint>Shown on your public profile.</FieldHint>
                        <span
                          id="bio-counter"
                          className={`auth-char-counter ${form.bio.length > MAX_BIO * 0.85 ? "auth-char-counter--warn" : ""} ${form.bio.length > MAX_BIO ? "auth-char-counter--over" : ""}`}
                        >
                          {form.bio.length}/{MAX_BIO}
                        </span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="auth-btn-row">
                      <button
                        type="button"
                        className="auth-btn auth-btn--ghost"
                        onClick={() => { setSignUpStep(1); clearGooglePending?.(); }}
                      >
                        <HiArrowLeft aria-hidden="true" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        className="auth-btn auth-btn--primary"
                        onClick={() => {
                          if (!phoneOk) { setError("Invalid phone number format."); return; }
                          if (!bioOk) { setError(`Bio must be ${MAX_BIO} characters or less.`); return; }
                          setError("");
                          setSignUpStep(3);
                        }}
                        disabled={!phoneOk || !bioOk}
                      >
                        <span>Continue</span>
                        <HiArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Confirm & Submit ── */}
                {signUpStep === 3 && (
                  <form
                    className="auth-form auth-step-anim"
                    onSubmit={handleSignUp}
                  >
                    {/* Avatar Upload */}
                    <div className="auth-avatar-section">
                      <div className="auth-avatar-wrap">
                        <div className="auth-avatar-ring">
                          <img
                            src={avatarSrc}
                            alt="Your profile avatar"
                            className="auth-avatar-img"
                          />
                        </div>
                        <label className={`auth-avatar-upload-btn ${avatarUploading ? "is-uploading" : ""}`} aria-label="Upload profile photo">
                          {avatarUploading
                            ? <HiRefresh className="auth-spin" aria-hidden="true" />
                            : <HiPhotograph aria-hidden="true" />}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <div className="auth-avatar-meta">
                        <h4 className="auth-avatar-meta__name">
                          {form.fullName || googleUser?.name || "Your Name"}
                        </h4>
                        <p className="auth-avatar-meta__email">
                          {form.email || googleUser?.email}
                        </p>
                        <span className="auth-avatar-meta__role" style={{ "--role-color": currentRole?.color }}>
                          {React.createElement(currentRole?.icon || HiGlobe, { className: "auth-avatar-meta__role-icon", "aria-hidden": true })}
                          {currentRole?.label}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="auth-summary">
                      <h4 className="auth-summary__heading">Account Summary</h4>
                      <dl className="auth-summary__list">
                        {[
                          ["Email", form.email || googleUser?.email],
                          ["Phone", form.phone || "Not provided"],
                          ["Role", currentRole?.label],
                          ["Auth Method", authMethod === "google" ? "Google Account" : "Email Verification"],
                        ].map(([dt, dd]) => (
                          <div className="auth-summary__row" key={dt}>
                            <dt>{dt}</dt>
                            <dd>{dd}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* Keep Signed In */}
                    <label className="auth-checkbox">
                      <input
                        type="checkbox"
                        checked={form.keepSignedIn}
                        onChange={(e) => set("keepSignedIn", e.target.checked)}
                      />
                      <span className="auth-checkbox__box" aria-hidden="true">
                        {form.keepSignedIn && <HiCheck />}
                      </span>
                      <span className="auth-checkbox__label">Keep me signed in on this device</span>
                    </label>

                    {/* Terms */}
                    <label className="auth-checkbox auth-checkbox--terms">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                      />
                      <span className="auth-checkbox__box" aria-hidden="true">
                        {agreeTerms && <HiCheck />}
                      </span>
                      <span className="auth-checkbox__label">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                      </span>
                    </label>

                    {/* Navigation */}
                    <div className="auth-btn-row">
                      <button
                        type="button"
                        className="auth-btn auth-btn--ghost"
                        onClick={() => setSignUpStep(2)}
                        disabled={loading || avatarUploading}
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
                        {(loading || avatarUploading)
                          ? <><Spinner label="Creating account" /><span>Creating Account…</span></>
                          : <><span>Create Account</span><HiCheck aria-hidden="true" /></>}
                      </button>
                    </div>
                  </form>
                )}

                <p className="auth-switch-hint">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchView("login")}
                  >
                    Sign in instead <HiArrowRight aria-hidden="true" />
                  </button>
                </p>
              </section>
            )}

            {/* ══════════════════════════════════════════
                VERIFY VIEW
            ══════════════════════════════════════════ */}
            {isVerify && (
              <section className="auth-view auth-view--verify">
                <div className="auth-view-header">
                  <div className="auth-view-icon auth-view-icon--verify">
                    <HiMail aria-hidden="true" />
                  </div>
                  <h2 id="auth-modal-title" className="auth-view-title">
                    Check Your Inbox
                  </h2>
                  <p className="auth-view-subtitle">
                    We sent a 6-digit verification code to:
                  </p>
                  <div className="auth-email-chip">
                    <HiMail aria-hidden="true" />
                    <span>{activeEmail || "No email found"}</span>
                  </div>
                  <span className="auth-verify-expiry">
                    <HiInformationCircle aria-hidden="true" />
                    Code expires in {CODE_TTL} minutes
                  </span>
                </div>

                <form
                  className="auth-form"
                  onSubmit={handleVerifySubmit}
                  noValidate
                >
                  <div
                    className={`auth-code-group ${codeState ? `auth-code-group--${codeState}` : ""}`}
                    onPaste={handleCodePaste}
                    role="group"
                    aria-label="Enter 6-digit verification code"
                  >
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { codeRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKey(i, e)}
                        className={`auth-code-input ${digit ? "is-filled" : ""}`}
                        aria-label={`Digit ${i + 1} of 6`}
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        disabled={codeState === "verifying" || codeState === "success"}
                      />
                    ))}
                  </div>

                  {/* Status indicator */}
                  {codeState === "verifying" && (
                    <div className="auth-verify-status auth-verify-status--verifying">
                      <Spinner label="Verifying code" />
                      <span>Verifying your code…</span>
                    </div>
                  )}
                  {codeState === "success" && (
                    <div className="auth-verify-status auth-verify-status--success">
                      <HiCheckCircle aria-hidden="true" />
                      <span>Verified! Redirecting…</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary auth-btn--full"
                    disabled={loading || code.join("").length !== 6 || codeState === "verifying" || codeState === "success"}
                    aria-busy={loading}
                  >
                    {loading || codeState === "verifying"
                      ? <><Spinner label="Verifying" /><span>Verifying…</span></>
                      : codeState === "success"
                      ? <><HiCheckCircle aria-hidden="true" /><span>Verified!</span></>
                      : <><span>Verify & Continue</span><HiArrowRight aria-hidden="true" /></>}
                  </button>

                  <div className="auth-verify-actions">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={handleBackFromVerify}
                      disabled={loading}
                    >
                      <HiArrowLeft aria-hidden="true" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      className="auth-btn auth-btn--outline"
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                      aria-live="polite"
                    >
                      <HiRefresh className={resendTimer === 0 && !loading ? "" : "auth-spin"} aria-hidden="true" />
                      <span>
                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend Code"}
                      </span>
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>

          {/* Footer */}
          <footer className="auth-modal-footer">
            <div className="auth-footer-inner">
              <RiShieldKeyholeLine aria-hidden="true" />
              <span>Protected by 256-bit SSL encryption &bull; We never share your data</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}