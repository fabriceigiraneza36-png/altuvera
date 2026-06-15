// AuthModal.jsx — Full Premium Version
// Green/White · Mobile Bottom Sheet · Career Multi-Select · Smooth Validation
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
  HiPhotograph,
  HiPencilAlt,
  HiAcademicCap,
  HiColorSwatch,
  HiCode,
  HiSun,
  HiPlus,
  HiTag,
} from "react-icons/hi";
import { FiGithub, FiZap, FiCamera } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdVerified, MdOutlineSecurityUpdateGood } from "react-icons/md";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { useUserAuth } from "../../context/UserAuthContext";
import { useAuthStats } from "../../hooks/useAuthStats";
import { getBrandLogoUrl, BRAND_LOGO_ALT } from "../../utils/seo";
import EmailAutocompleteInput from "../common/EmailAutocompleteInput";
import "./AuthModal.css";

/* ════════════════════════════════════════════════════════════
   GALLERY
════════════════════════════════════════════════════════════ */
const GALLERY = [
  {
    src: "https://i.pinimg.com/736x/7a/e8/6f/7ae86f7fb7eddaceb8ed5ba212c19a0e.jpg",
    alt: "Majestic lion in golden savanna",
    caption: "Serengeti, Tanzania",
    subtitle: "Where the wild roams free",
    color: "#059669",
  },
  {
    src: "https://i.pinimg.com/736x/81/3c/12/813c12e76fbd4fc43517b90804423d90.jpg",
    alt: "Turquoise waters and white sand",
    caption: "Zanzibar, Tanzania",
    subtitle: "Paradise found",
    color: "#10B981",
  },
  {
    src: "https://i.pinimg.com/1200x/34/da/8e/34da8ee9bedf86bde3797e5b37884910.jpg",
    alt: "Snow-capped Kilimanjaro",
    caption: "Kilimanjaro, Tanzania",
    subtitle: "Touch the sky",
    color: "#059669",
  },
  {
    src: "https://i.pinimg.com/736x/74/23/d3/7423d340555f9ae1eeba5a9528a94715.jpg",
    alt: "Mountain gorilla in misty forest",
    caption: "Volcanoes NP, Rwanda",
    subtitle: "Meet our closest relatives",
    color: "#10B981",
  },
  {
    src: "https://i.pinimg.com/736x/30/f1/ad/30f1ada2ba80044e4b1db79ac0e95768.jpg",
    alt: "Giraffes at sunset",
    caption: "Maasai Mara, Kenya",
    subtitle: "Golden hour magic",
    color: "#047857",
  },
  {
    src: "https://i.pinimg.com/736x/3d/f5/f7/3df5f7a59bdb7704087eec05f6ee4476.jpg",
    alt: "Ngorongoro Crater panorama",
    caption: "Ngorongoro, Tanzania",
    subtitle: "Nature's amphitheatre",
    color: "#059669",
  },
];

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const EMAIL_RE                = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE                = /^[+\d][\d\s\-()]{6,}$/;
const MAX_BIO                 = 300;
const MAX_FILE                = 10 * 1024 * 1024;
const CODE_TTL_LOGIN_REGISTER = 10 * 60;
const CODE_TTL_RESEND         = 15 * 60;

/* ── Preset Careers ── */
const PRESET_CAREERS = [
  { id: "traveler",     label: "Traveler",     Icon: HiGlobe       },
  { id: "photographer", label: "Photographer", Icon: HiPhotograph  },
  { id: "planner",      label: "Planner",      Icon: HiSparkles    },
  { id: "farmer",       label: "Farmer",       Icon: HiSun         },
  { id: "developer",    label: "Developer",    Icon: HiCode        },
  { id: "designer",     label: "Designer",     Icon: HiColorSwatch },
  { id: "writer",       label: "Writer",       Icon: HiPencilAlt   },
  { id: "student",      label: "Student",      Icon: HiAcademicCap },
];

const TRUST_BADGES = [
  { Icon: RiShieldKeyholeLine,         text: "256-bit SSL"  },
  { Icon: MdVerified,                  text: "Verified"     },
  { Icon: MdOutlineSecurityUpdateGood, text: "GDPR"         },
];

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */
const emptyCode = () => ["", "", "", "", "", ""];

const getInitials = (v = "") =>
  v.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).join("") || "U";

const toBase64 = (s) => {
  try {
    return window.btoa(
      encodeURIComponent(s).replace(
        /%([0-9A-F]{2})/g,
        (_, h) => String.fromCharCode(parseInt(h, 16))
      )
    );
  } catch { return ""; }
};

const initAvatar = (name, color = "#059669") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="${color}"/>
        <stop offset="100%" stop-color="${color}88"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="32" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Inter,system-ui,sans-serif" font-size="52" font-weight="800"
      fill="#ffffff">${getInitials(name)}</text>
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

const formatPhone  = (v) => String(v || "").replace(/[^\d+\s\-()]/g, "");
const formatExpiry = (s) => {
  const t = Math.max(0, s);
  return `${Math.floor(t / 60).toString().padStart(2, "0")}:${(t % 60)
    .toString().padStart(2, "0")}`;
};

const isDismissalError = (msg = "") => {
  const m = msg.toLowerCase();
  return (
    m.includes("dismiss")   || m.includes("cancel")  ||
    m.includes("closed")    || m.includes("skipped") ||
    m.includes("credential_cancelled") ||
    m.includes("popup_closed")         ||
    m.includes("not_displayed")        ||
    m.includes("google button")
  );
};

const capitalize = (s = "") =>
  s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase();

/* ════════════════════════════════════════════════════════════
   GALLERY SLIDESHOW
════════════════════════════════════════════════════════════ */
const GallerySlideshow = React.memo(({ intervalMs = 10000 }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % GALLERY.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [intervalMs]);

  const slide = GALLERY[current];

  return (
    <div className="am-gallery-inner" aria-hidden="true">
      {GALLERY.map((item, i) => (
        <div
          key={i}
          className="am-gallery-slide"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1.0)" : "scale(1.04)",
            transition: "opacity 1200ms ease-in-out, transform 1400ms ease-in-out",
            zIndex: i === current ? 1 : 0,
          }}
        >
          <img src={item.src} alt={item.alt} loading={i <= 1 ? "eager" : "lazy"} decoding="async" />
        </div>
      ))}

      <div className="am-gallery-overlay-t" />
      <div className="am-gallery-overlay-r" />

      <div className="am-gallery-content">
        <div className="am-gallery-logo">
          <div className="am-gallery-logo-icon">
            <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} loading="eager" />
          </div>
          <div>
            <div className="am-gallery-logo-name">Altuvera</div>
            <div className="am-gallery-logo-tag">Premium Adventures</div>
          </div>
        </div>

        <div className="am-gallery-bottom">
          <div key={current} className="am-gallery-caption">
            <div className="am-gallery-caption-tag">
              <div className="am-gallery-caption-dot" style={{ backgroundColor: slide.color }} />
              <span className="am-gallery-caption-location" style={{ color: slide.color }}>
                {slide.caption}
              </span>
            </div>
            <h4 className="am-gallery-caption-title">{slide.subtitle}</h4>
          </div>
        </div>
      </div>
    </div>
  );
});
GallerySlideshow.displayName = "GallerySlideshow";

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function AuthModal() {
  const {
    isModalOpen, modalView, setModalView, closeModal,
    login, register, verifyCode, resendCode,
    pendingEmail, persistSession, setSessionPreference,
    googleUser, googleLoaded, googleLoading, githubLoading,
    hasGooglePending, promptGoogleAuth, startGithubAuth,
    completeGoogleSignUp, clearGooglePending,
    socialAuthError, clearSocialAuthError, uploadAvatar,
  } = useUserAuth();

  useAuthStats();

  /* ── Form State ── */
  const [form, setForm] = useState({
    email:        "",
    fullName:     "",
    phone:        "",
    bio:          "",
    keepSignedIn: persistSession,
    avatarFile:   null,
    avatarPreview:"",
  });

  /* ── Career State ── */
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [customCareerInput, setCustomCareerInput] = useState("");
  const [customCareers, setCustomCareers] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customCareerRef = useRef(null);

  /* ── UI State ── */
  const [signUpStep,      setSignUpStep]      = useState(1);
  const [stepDir,         setStepDir]         = useState("forward");
  const [agreeTerms,      setAgreeTerms]      = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [code,            setCode]            = useState(emptyCode());
  const [resendTimer,     setResendTimer]     = useState(0);
  const [verifySource,    setVerifySource]    = useState("login");
  const [authMethod,      setAuthMethod]      = useState("email");
  const [codeState,       setCodeState]       = useState("");
  const [codeExpiry,      setCodeExpiry]      = useState(CODE_TTL_LOGIN_REGISTER);
  const [codeExpired,     setCodeExpired]     = useState(false);
  const [avatarDragOver,  setAvatarDragOver]  = useState(false);
  const [focusedField,    setFocusedField]    = useState(null);

  /* ── Touched State ── */
  const [touched, setTouched] = useState({
    email: false, fullName: false, phone: false,
  });

  /* ── Refs ── */
  const codeRefs       = useRef([]);
  const firstInputRef  = useRef(null);
  const expiryTimerRef = useRef(null);
  const fileInputRef   = useRef(null);

  /* ── Derived ── */
  const isLogin    = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify   = modalView === "verify";

  const activeEmail = (pendingEmail || form.email || googleUser?.email || "").trim();
  const emailOk     = EMAIL_RE.test(form.email.trim());
  const nameOk      = form.fullName.trim().length >= 2;
  const phoneOk     = !form.phone.trim() || PHONE_RE.test(form.phone.trim());
  const bioOk       = form.bio.trim().length <= MAX_BIO;
  const isBusy      = googleLoading || githubLoading || loading;

  const allCareers = useMemo(
    () => [...selectedCareers, ...customCareers],
    [selectedCareers, customCareers]
  );

  /* ── Expiry Countdown ── */
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

  useEffect(() => () => {
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
  }, []);

  /* ── Field Updater ── */
  const updateField = useCallback((field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    setError("");
    setSuccess("");
    clearSocialAuthError?.();
  }, [clearSocialAuthError]);

  const touch = useCallback((field) => {
    setTouched((p) => ({ ...p, [field]: true }));
  }, []);

  const goStep = useCallback((n) => {
    setStepDir(n > signUpStep ? "forward" : "back");
    setSignUpStep(n);
  }, [signUpStep]);

  const navigateStep = useCallback((n) => {
    if (loading) return;
    setError("");
    goStep(n);
  }, [goStep, loading]);

  const switchView = useCallback((view) => {
    if (loading) return;
    setModalView(view);
    setSignUpStep(1);
    setStepDir("forward");
    setError("");
    setSuccess("");
    setCode(emptyCode());
    setAuthMethod("email");
    setTouched({ email: false, fullName: false, phone: false });
    setFocusedField(null);
    clearSocialAuthError?.();
    if (view === "login") clearGooglePending?.();
  }, [clearGooglePending, clearSocialAuthError, loading, setModalView]);

  /* ── Reset on open ── */
  const justOpenedRef = useRef(false);
  useEffect(() => {
    if (!isModalOpen) { justOpenedRef.current = false; return; }
    if (justOpenedRef.current) return;
    justOpenedRef.current = true;
    stopExpiryCountdown();
    setError(""); setSuccess(""); setCode(emptyCode());
    setResendTimer(0); setAuthMethod("email"); setCodeState("");
    setTouched({ email: false, fullName: false, phone: false });
    setFocusedField(null);
    setAgreeTerms(false);
    setSelectedCareers([]);
    setCustomCareers([]);
    setCustomCareerInput("");
    setShowCustomInput(false);
    setForm((p) => ({ email: "", fullName: "", phone: "", bio: "", keepSignedIn: persistSession, avatarFile: null, avatarPreview: "" }));
    setTimeout(() => firstInputRef.current?.focus(), 400);
    const t = setTimeout(() => { justOpenedRef.current = false; }, 600);
    return () => clearTimeout(t);
  }, [isModalOpen, persistSession, stopExpiryCountdown]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  /* ── ESC close ── */
  useEffect(() => {
    if (!isModalOpen) return;
    const h = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeModal, isModalOpen]);

  /* ── Social auth error ── */
  useEffect(() => {
    if (!socialAuthError) return;
    if (isDismissalError(socialAuthError)) { clearSocialAuthError?.(); return; }
    setError(socialAuthError);
  }, [socialAuthError, clearSocialAuthError]);

   /* ── Google user prefill + step setup ── */
  const googleSetupDoneRef = useRef(false);
  useEffect(() => {
    if (!googleUser || !isRegister) {
      googleSetupDoneRef.current = false;
      return;
    }
    if (googleSetupDoneRef.current) return;
    googleSetupDoneRef.current = true;
    setForm((p) => ({
      ...p,
      email:         googleUser.email   || p.email,
      fullName:      googleUser.name    || p.fullName,
      avatarPreview: googleUser.picture || p.avatarPreview,
    }));
    navigateStep(2);
    setAuthMethod("google");
    setSuccess("Google account connected! Complete your profile below.");
  }, [googleUser, isRegister, navigateStep]);

  /* ── Resend countdown ── */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(
      () => setResendTimer((p) => Math.max(0, p - 1)),
      1000
    );
    return () => clearInterval(t);
  }, [resendTimer]);

  /* ── Career helpers ── */
  const togglePresetCareer = useCallback((id) => {
    setSelectedCareers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setError("");
  }, []);

  const addCustomCareer = useCallback(() => {
    const val = capitalize(customCareerInput);
    if (!val) return;
    const normalised = val.toLowerCase();
    const alreadyPreset = PRESET_CAREERS.some(
      (c) => c.label.toLowerCase() === normalised
    );
    if (alreadyPreset) {
      const preset = PRESET_CAREERS.find(
        (c) => c.label.toLowerCase() === normalised
      );
      if (preset && !selectedCareers.includes(preset.id)) {
        setSelectedCareers((p) => [...p, preset.id]);
      }
      setCustomCareerInput("");
      return;
    }
    if (customCareers.includes(val)) {
      setCustomCareerInput("");
      return;
    }
    setCustomCareers((p) => [...p, val]);
    setCustomCareerInput("");
  }, [customCareerInput, customCareers, selectedCareers]);

  const removeCustomCareer = useCallback((career) => {
    setCustomCareers((p) => p.filter((c) => c !== career));
  }, []);

  const removePresetCareer = useCallback((id) => {
    setSelectedCareers((p) => p.filter((c) => c !== id));
  }, []);

  /* ── Social Auth ── */
  const handleGoogleAuth = useCallback(async (mode = "signin") => {
    if (!googleLoaded || isBusy) return;
    clearSocialAuthError?.();
    setError(""); setSuccess("");
    try {
      const result = await promptGoogleAuth({ mode });
      if (result?.dismissed) return;
      if (mode === "signup" && result)
        setSuccess("Google connected! Complete your profile.");
    } catch (err) {
      const msg = err?.message || "";
      if (isDismissalError(msg)) return;
      setError(msg || "Google authentication failed. Please try again.");
    }
  }, [clearSocialAuthError, googleLoaded, isBusy, promptGoogleAuth]);

  const handleGithubAuth = useCallback((mode = "signin") => {
    if (isBusy) return;
    clearSocialAuthError?.();
    setError(""); setSuccess("");
    try { startGithubAuth(mode); }
    catch (err) { setError(err?.message || "GitHub authentication failed."); }
  }, [clearSocialAuthError, isBusy, startGithubAuth]);

  /* ── Avatar ── */
  const processAvatarFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Select a valid image file."); return;
    }
    if (file.size > MAX_FILE) {
      setError("Image must be 10 MB or smaller."); return;
    }
    try {
      const preview = await readFile(file);
      setForm((p) => ({ ...p, avatarFile: file, avatarPreview: preview }));
      setError("");
    } catch { setError("Unable to preview this image."); }
  }, []);

  const handleAvatarChange = useCallback(
    (e) => processAvatarFile(e.target.files?.[0]),
    [processAvatarFile]
  );
  const handleAvatarDrop = useCallback((e) => {
    e.preventDefault();
    setAvatarDragOver(false);
    processAvatarFile(e.dataTransfer.files?.[0]);
  }, [processAvatarFile]);

  const resolveAvatar = useCallback(async () => {
    if (googleUser?.picture && !form.avatarFile) return googleUser.picture;
    const fallback =
      form.avatarPreview || initAvatar(form.fullName || form.email, "#059669");
    if (!form.avatarFile) return fallback;
    setAvatarUploading(true);
    try { return await uploadAvatar(form.avatarFile); }
    catch { setSuccess("Using placeholder — update anytime."); return fallback; }
    finally { setAvatarUploading(false); }
  }, [form, googleUser?.picture, uploadAvatar]);

  /* ── Sign In ── */
  const handleSignIn = useCallback(async (e) => {
    e.preventDefault();
    setTouched({ email: true, fullName: true, phone: false });
    if (!emailOk) { setError("Enter a valid email address."); return; }
    if (!nameOk)  { setError("Enter your full name.");        return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      setVerifySource("login"); setAuthMethod("email");
      setSessionPreference(form.keepSignedIn);
      await login({
        email:          form.email.trim(),
        fullName:       form.fullName.trim(),
        persistSession: form.keepSignedIn,
      });
      startExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
      setSuccess("Verification code sent! Check your inbox.");
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally { setLoading(false); }
  }, [emailOk, nameOk, form, login, setSessionPreference, startExpiryCountdown]);

  /* ── Verify ── */
  const doVerify = useCallback(async (val) => {
    if (!activeEmail)    { setError("Missing email. Please restart."); return; }
    if (val.length !== 6){ setError("Enter the full 6-digit code.");   return; }
    if (codeExpired)     { setError("Code has expired. Request a new one."); return; }
    try {
      setLoading(true); setCodeState("verifying"); setError("");
      await verifyCode(activeEmail, val);
      setCodeState("success");
      stopExpiryCountdown();
    } catch (err) {
      setCodeState("error");
      setError(err?.message || "Verification failed. Please try again.");
      setTimeout(() => {
        setCodeState(""); setCode(emptyCode());
        codeRefs.current[0]?.focus();
      }, 800);
    } finally { setLoading(false); }
  }, [activeEmail, codeExpired, verifyCode, stopExpiryCountdown]);

  useEffect(() => {
    const val = code.join("");
    if (
      val.length === 6 && isVerify && !loading &&
      codeState !== "verifying" && codeState !== "success" && !codeExpired
    ) {
      const t = setTimeout(() => doVerify(val), 350);
      return () => clearTimeout(t);
    }
  }, [code, isVerify, loading, codeState, codeExpired, doVerify]);

  /* ── Sign Up ── */
  const handleSignUp = useCallback(async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please accept the Terms and Privacy Policy."); return;
    }
    if (authMethod === "google" && !hasGooglePending) {
      setError("Google authentication required first."); return;
    }
    try {
      setLoading(true); setError(""); setSuccess("");
      setVerifySource("register");
      setSessionPreference(form.keepSignedIn);
      const avatar = await resolveAvatar();
      const payload = {
        fullName: form.fullName.trim(),
        phone:    form.phone.trim(),
        bio:      form.bio.trim(),
        careers:  allCareers,
        role:     allCareers[0] || "traveler",
        avatar,
      };
      if (authMethod === "google") {
        await completeGoogleSignUp(payload);
        setSuccess("Account created! Welcome to Altuvera.");
      } else {
        await register({
          ...payload,
          email:          form.email.trim(),
          persistSession: form.keepSignedIn,
        });
        startExpiryCountdown(CODE_TTL_LOGIN_REGISTER);
        setSuccess("Verification code sent to your inbox!");
      }
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally { setLoading(false); }
  }, [
    agreeTerms, authMethod, hasGooglePending,
    form, allCareers, resolveAvatar, completeGoogleSignUp,
    register, setSessionPreference, startExpiryCountdown,
  ]);

  /* ── OTP Handlers ── */
  const handleCodeChange = useCallback((i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    setCode((p) => { const n = [...p]; n[i] = val; return n; });
    setError(""); setCodeState("");
    if (val && i < 5) codeRefs.current[i + 1]?.focus();
  }, []);

  const handleCodeKey = useCallback((i, e) => {
    if (e.key === "Backspace"  && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft"  && i > 0)             codeRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5)             codeRefs.current[i + 1]?.focus();
  }, [code]);

  const handleCodePaste = useCallback((e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const next = emptyCode();
    digits.split("").forEach((d, idx) => { next[idx] = d; });
    setCode(next); setCodeState("");
    codeRefs.current[Math.min(digits.length, 5)]?.focus();
  }, []);

  const handleResend = useCallback(async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;
    try {
      setLoading(true); setError(""); setSuccess("");
      await resendCode(activeEmail);
      startExpiryCountdown(CODE_TTL_RESEND);
      setResendTimer(60); setCode(emptyCode()); setCodeState("");
      setSuccess(`New code sent to ${activeEmail}. Valid for 15 minutes.`);
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.message || "Unable to resend. Please try again.");
    } finally { setLoading(false); }
  }, [activeEmail, loading, resendCode, resendTimer, startExpiryCountdown]);

  const handleBackFromVerify = useCallback(() => {
    stopExpiryCountdown();
    setSignUpStep(1);
    setStepDir("forward");
    setCode(emptyCode()); setError(""); setSuccess("");
    setModalView(verifySource);
  }, [setModalView, stopExpiryCountdown, verifySource]);

  if (!isModalOpen) return null;

  /* ════════════════════════════════════════════════════════
     SHARED UI COMPONENTS
  ════════════════════════════════════════════════════════ */

  const Spinner = ({ size = "sm" }) => (
    <span className={`am-spinner am-spinner--${size}`} />
  );

  const InputField = ({
    id, label, icon: Icon, type = "text", value, onChange, onBlur,
    placeholder, fieldError, valid, required, autoComplete,
    refProp, isEmail = false, hint,
  }) => {
    const isFocused = focusedField === id;
    const iconClass = fieldError
      ? "am-input-icon--error"
      : valid
      ? "am-input-icon--valid"
      : isFocused
      ? "am-input-icon--focus"
      : "am-input-icon--default";

    return (
      <div className="am-form-group">
        <label htmlFor={id} className="am-label">
          <span>
            {label}
            {!required && (
              <span className="am-label-optional"> — Optional</span>
            )}
          </span>
          {hint && <span className="am-label-hint">{hint}</span>}
        </label>
        <div className="am-input-wrap">
          <div className={`am-input-icon ${iconClass}`}>
            <Icon />
          </div>

          {isEmail ? (
            <EmailAutocompleteInput
              id={id}
              ref={refProp}
              value={value}
              onValueChange={onChange}
              onBlur={() => { touch(id.split("-").pop()); onBlur?.(); setFocusedField(null); }}
              onFocus={() => setFocusedField(id)}
              placeholder={placeholder}
              autoComplete={autoComplete || "email"}
              required={required}
              className={`am-input ${
                fieldError ? "am-input--error"
                : valid    ? "am-input--valid"
                : ""
              }`}
            />
          ) : (
            <input
              id={id}
              ref={refProp}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => {
                touch(id.split("-").pop());
                onBlur?.();
                setFocusedField(null);
              }}
              onFocus={() => setFocusedField(id)}
              placeholder={placeholder}
              autoComplete={autoComplete}
              required={required}
              className={`am-input ${
                fieldError ? "am-input--error"
                : valid    ? "am-input--valid"
                : ""
              }`}
            />
          )}

          {valid && !fieldError && (
            <div className="am-input-status am-input-status--valid am-scaleIn">
              <HiCheckCircle />
            </div>
          )}
          {fieldError && (
            <div className="am-input-status am-input-status--error">
              <HiExclamationCircle />
            </div>
          )}
        </div>
        {fieldError && (
          <p className="am-field-error">
            <HiExclamationCircle /> {fieldError}
          </p>
        )}
      </div>
    );
  };

  const Checkbox = ({ checked, onChange, children }) => (
    <label className="am-checkbox-label">
      <div
        className={`am-checkbox-box ${checked ? "checked" : ""}`}
        onClick={onChange}
      >
        {checked && <HiCheck />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />
      <span className="am-checkbox-text">{children}</span>
    </label>
  );

  const Alert = ({ type, message, onClose }) => {
    if (!message) return null;
    return (
      <div className={`am-alert am-alert--${type} am-slideDown`}>
        <span className="am-alert-icon">
          {type === "error"
            ? <HiExclamationCircle />
            : <HiCheckCircle />}
        </span>
        <p className="am-alert-text">
          {typeof message === "string" ? message : "An error occurred."}
        </p>
        {onClose && (
          <button
            className="am-alert-close"
            onClick={onClose}
            aria-label="Dismiss"
          >
            <HiX />
          </button>
        )}
      </div>
    );
  };

  const SocialButtons = ({ mode }) => (
    <div className="am-social-row">
      <button
        type="button"
        onClick={() => handleGoogleAuth(mode)}
        disabled={!googleLoaded || googleLoading || loading}
        className="am-social-btn am-social-btn--google"
      >
        {googleLoading ? <Spinner /> : <FcGoogle />}
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
        className="am-social-btn am-social-btn--github"
      >
        {githubLoading ? <Spinner /> : <FiGithub />}
        <span>{githubLoading ? "Connecting…" : "GitHub"}</span>
      </button>
    </div>
  );

  const Divider = ({ label = "or continue with" }) => (
    <div className="am-divider">
      <div className="am-divider-line" />
      <span className="am-divider-text">{label}</span>
      <div className="am-divider-line right" />
    </div>
  );

  const Stepper = ({ current: cur }) => (
    <div className="am-stepper">
      {["Method", "Profile", "Confirm"].map((label, i) => {
        const n        = i + 1;
        const isDone   = cur > n;
        const isActive = cur === n;
        return (
          <React.Fragment key={n}>
            <div className="am-step">
              <div
                className={`am-step-circle ${
                  isDone   ? "am-step-circle--done"
                  : isActive ? "am-step-circle--active"
                  : "am-step-circle--pending"
                }`}
              >
                {isDone
                  ? <HiCheck />
                  : <span>{n}</span>}
                {isActive && <span className="am-step-ping am-ping" />}
              </div>
              <span
                className={`am-step-label ${
                  isActive ? "am-step-label--active"
                  : isDone ? "am-step-label--done"
                  : "am-step-label--pending"
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className="am-step-connector">
                <div
                  className="am-step-connector-fill"
                  style={{ width: cur > n ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── Career Selector ── */
  const CareerSelector = () => (
    <div className="am-career-section">
      <div className="am-form-label-row">
        <HiTag />
        <span className="am-career-label">
          Your Career(s)
          <span className="am-career-label-hint">
            — select all that apply
          </span>
        </span>
      </div>

      {/* Selected tags row */}
      {allCareers.length > 0 && (
        <div className="am-career-tags">
          {selectedCareers.map((id) => {
            const preset = PRESET_CAREERS.find((c) => c.id === id);
            if (!preset) return null;
            return (
              <span key={id} className="am-career-tag am-tagPop">
                <preset.Icon style={{ width: 11, height: 11 }} />
                {preset.label}
                <button
                  type="button"
                  className="am-career-tag-remove"
                  onClick={() => removePresetCareer(id)}
                  aria-label={`Remove ${preset.label}`}
                >
                  <HiX />
                </button>
              </span>
            );
          })}
          {customCareers.map((career) => (
            <span key={career} className="am-career-tag am-tagPop">
              <HiUser style={{ width: 11, height: 11 }} />
              {career}
              <button
                type="button"
                className="am-career-tag-remove"
                onClick={() => removeCustomCareer(career)}
                aria-label={`Remove ${career}`}
              >
                <HiX />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset chips */}
      <div className="am-career-grid">
        {PRESET_CAREERS.map(({ id, label, Icon }) => {
          const isSelected = selectedCareers.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => togglePresetCareer(id)}
              className={`am-career-chip ${
                isSelected ? "am-career-chip--selected" : ""
              }`}
            >
              <Icon />
              <span>{label}</span>
              {isSelected && (
                <span className="am-career-chip-check am-scaleIn">
                  <HiCheck />
                </span>
              )}
            </button>
          );
        })}

        {/* "Others" chip */}
        <button
          type="button"
          onClick={() => {
            setShowCustomInput((v) => !v);
            setTimeout(() => customCareerRef.current?.focus(), 100);
          }}
          className={`am-career-chip ${showCustomInput ? "am-career-chip--selected" : ""}`}
        >
          <HiPlus />
          <span>Others</span>
        </button>
      </div>

      {/* Custom input box */}
      {showCustomInput && (
        <div className="am-slideDown">
          <div className="am-career-custom">
            <div className="am-career-custom-input-wrap">
              <input
                ref={customCareerRef}
                type="text"
                value={customCareerInput}
                onChange={(e) => setCustomCareerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCareer();
                  }
                }}
                placeholder="e.g. Musician, Chef, Architect…"
                className="am-career-custom-input"
                maxLength={40}
              />
            </div>
            <button
              type="button"
              onClick={addCustomCareer}
              className="am-btn-primary"
              style={{ width: "auto", height: 44, padding: "0 18px", borderRadius: 12 }}
              disabled={!customCareerInput.trim()}
            >
              Add
            </button>
          </div>
          <p className="am-career-custom-hint">
            <HiInformationCircle />
            Press <kbd>Enter</kbd> or click <strong>Add</strong> — you can
            add multiple careers
          </p>
        </div>
      )}
    </div>
  );

  /* ── Expiry pill class ── */
  const expiryClass = codeExpired
    ? "am-expiry-pill--expired"
    : codeExpiry <= 30
    ? "am-expiry-pill--urgent"
    : codeExpiry <= 120
    ? "am-expiry-pill--warn"
    : "am-expiry-pill--normal";

  /* ════════════════════════════════════════════════════════
     VIEWS (shared between desktop & mobile)
  ════════════════════════════════════════════════════════ */

  /* ── LOGIN VIEW ── */
  const LoginView = () => (
    <div className="am-viewIn">
      <div className="am-view-head">
        <div className="am-view-icon-wrap am-view-icon-wrap--green">
          <HiShieldCheck />
        </div>
        <h2 className="am-view-title">Welcome Back</h2>
        <p className="am-view-subtitle">Sign in to continue your adventure</p>
      </div>

      <form onSubmit={handleSignIn} noValidate className="am-form">
        <InputField
          id="l-email"
          label="Email Address"
          icon={HiMail}
          value={form.email}
          onChange={(v) => updateField("email", v)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          isEmail
          refProp={firstInputRef}
          fieldError={touched.email && !emailOk ? "Enter a valid email address." : ""}
          valid={touched.email && emailOk}
        />
        <InputField
          id="l-fullName"
          label="Full Name"
          icon={HiUser}
          value={form.fullName}
          onChange={(v) => updateField("fullName", v)}
          placeholder="Your full name"
          autoComplete="name"
          required
          fieldError={touched.fullName && !nameOk ? "At least 2 characters required." : ""}
          valid={touched.fullName && nameOk}
        />

        <Checkbox
          checked={form.keepSignedIn}
          onChange={() => updateField("keepSignedIn", !form.keepSignedIn)}
        >
          Keep me signed in for 30 days
        </Checkbox>

        <button
          type="submit"
          disabled={loading || isBusy}
          className="am-btn-primary"
        >
          {loading
            ? <><Spinner /><span>Signing In…</span></>
            : <><span>Continue with Email</span><HiArrowRight /></>}
        </button>

        <Divider />
        <SocialButtons mode="signin" />
      </form>

      <div className="am-trust-row">
        {TRUST_BADGES.map(({ Icon, text }) => (
          <div key={text} className="am-trust-badge">
            <Icon /> <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="am-switch-row">
        <p className="am-switch-text">
          New here?{" "}
          <button
            className="am-btn-link"
            onClick={() => switchView("register")}
          >
            Create an account <HiArrowRight />
          </button>
        </p>
      </div>
    </div>
  );

  /* ── REGISTER VIEW ── */
  const RegisterView = () => (
    <div className="am-viewIn">
      <div className="am-view-head">
        <div
          className={`am-view-icon-wrap ${
            signUpStep === 1 ? "am-view-icon-wrap--blue"
            : signUpStep === 2 ? "am-view-icon-wrap--green"
            : "am-view-icon-wrap--violet"
          }`}
        >
          {signUpStep === 1
            ? <HiGlobe />
            : signUpStep === 2
            ? <HiUser />
            : <HiCheckCircle />}
        </div>
        <h2 className="am-view-title">
          {["Choose Method", "Your Profile", "Confirm & Launch"][signUpStep - 1]}
        </h2>
        <p className="am-view-subtitle">
          {[
            "How would you like to join?",
            "Tell us about yourself",
            "Review and finalize your account",
          ][signUpStep - 1]}
        </p>
      </div>

      <Stepper current={signUpStep} />

      {/* ─── STEP 1 ─── */}
      {signUpStep === 1 && (
        <div className={`${isStepLocked ? "am-stepIn--locked" : stepDir === "forward" ? "am-stepIn" : "am-stepBack"}`}>
          {hasGooglePending ? (
            <div className="am-google-connected">
              <div className="am-google-connected-icon">
                <HiCheckCircle />
              </div>
              <h3 className="am-google-connected-title">Google Connected!</h3>
              <p className="am-google-connected-text">
                Your Google account is linked. Let's set up your profile.
              </p>
              <button
                className="am-btn-primary"
                onClick={() => navigateStep(2)}
              >
                <span>Set Up Profile</span>
                <HiArrowRight />
              </button>
            </div>
          ) : (
              <div
                className={`${isStepLocked ? "am-stepIn--locked" : "am-stepIn"} am-form`}
              >
              <InputField
                id="r-email"
                label="Email Address"
                icon={HiMail}
                value={form.email}
                onChange={(v) => updateField("email", v)}
                placeholder="traveler@example.com"
                autoComplete="email"
                required
                isEmail
                refProp={firstInputRef}
                fieldError={
                  touched.email && !emailOk
                    ? "Enter a valid email address."
                    : ""
                }
                valid={touched.email && emailOk}
              />
              <InputField
                id="r-fullName"
                label="Full Name"
                icon={HiUser}
                value={form.fullName}
                onChange={(v) => updateField("fullName", v)}
                placeholder="Your full name"
                autoComplete="name"
                required
                fieldError={
                  touched.fullName && !nameOk
                    ? "At least 2 characters required."
                    : ""
                }
                valid={touched.fullName && nameOk}
              />

              <button
                type="button"
                className="am-btn-primary"
                disabled={isBusy}
                onClick={() => {
                  setTouched((p) => ({ ...p, email: true, fullName: true }));
                  if (emailOk && nameOk) {
                    setAuthMethod("email");
                    navigateStep(2);
                  } else {
                    setError("Enter a valid email and full name.");
                  }
                }}
              >
                <FiZap />
                <span>Continue with Email</span>
                <HiArrowRight />
              </button>

              <Divider label="or sign up with" />
              <SocialButtons mode="signup" />
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2 ─── */}
      {signUpStep === 2 && (
        <div className={`${isStepLocked ? "am-stepIn--locked" : stepDir === "forward" ? "am-stepIn" : "am-stepBack"}`}>
          <div className="am-form">
            {googleUser && (
              <div className="am-google-user">
                <img
                  src={googleUser.picture || initAvatar(googleUser.name)}
                  alt="Google profile"
                  className="am-google-user-img"
                />
                <div className="am-google-user-info">
                  <p className="am-google-user-name">{googleUser.name}</p>
                  <p className="am-google-user-email">{googleUser.email}</p>
                </div>
                <div className="am-google-user-badge">
                  <MdVerified /> Google
                </div>
              </div>
            )}

            <InputField
              id="r-phone"
              label="Phone Number"
              icon={HiPhone}
              type="tel"
              value={form.phone}
              onChange={(v) => updateField("phone", formatPhone(v))}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              fieldError={
                touched.phone && form.phone && !phoneOk
                  ? "Enter a valid phone number."
                  : ""
              }
              valid={form.phone.length > 0 && phoneOk}
            />

            {/* Career multi-select */}
            <CareerSelector />

            {/* Bio */}
            <div className="am-form-group">
              <label htmlFor="r-bio" className="am-label">
                <span>
                  Short Bio
                  <span className="am-label-optional"> — Optional</span>
                </span>
              </label>
              <textarea
                id="r-bio"
                rows={3}
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                onFocus={() => setFocusedField("bio")}
                onBlur={() => setFocusedField(null)}
                placeholder="Tell us about your travel style…"
                maxLength={MAX_BIO + 20}
                className={`am-textarea ${
                  form.bio.length > MAX_BIO ? "am-textarea--error" : ""
                }`}
              />
              <div className="am-bio-footer">
                <p className="am-bio-hint">
                  <HiInformationCircle />
                  Shown on your public profile
                </p>
                <div className="am-bio-counter">
                  <div className="am-bio-bar-track">
                    <div
                      className="am-bio-bar-fill"
                      style={{
                        width: `${Math.min(
                          (form.bio.length / MAX_BIO) * 100,
                          100
                        )}%`,
                        backgroundColor:
                          form.bio.length > MAX_BIO
                            ? "#ef4444"
                            : form.bio.length > MAX_BIO * 0.85
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    />
                  </div>
                  <span
                    className={`am-bio-count ${
                      form.bio.length > MAX_BIO
                        ? "am-bio-count--over"
                        : form.bio.length > MAX_BIO * 0.85
                        ? "am-bio-count--warn"
                        : ""
                    }`}
                  >
                    {form.bio.length}/{MAX_BIO}
                  </span>
                </div>
              </div>
            </div>

            <div className="am-btn-row">
              <button
                type="button"
                className="am-btn-secondary"
                onClick={() => {
                  clearGooglePending?.();
                  navigateStep(1);
                }}
                disabled={isStepLocked}
              >
                <HiArrowLeft /> Back
              </button>
              <button
                type="button"
                className="am-btn-primary"
                disabled={!bioOk}
                onClick={() => {
                  setTouched((p) => ({ ...p, phone: true }));
                  if (!phoneOk) {
                    setError("Enter a valid phone number.");
                    return;
                  }
                  if (!bioOk) {
                    setError(`Bio must be ${MAX_BIO} characters or less.`);
                    return;
                  }
                  setError("");
                  navigateStep(3);
                }}
              >
                <span>Continue</span>
                <HiArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3 ─── */}
      {signUpStep === 3 && (
        <form
          onSubmit={handleSignUp}
          noValidate
          className={`am-form ${isStepLocked ? "am-stepIn--locked" : stepDir === "forward" ? "am-stepIn" : "am-stepBack"}`}
        >
          {/* Avatar card */}
          <div
            className={`am-avatar-card ${
              avatarDragOver ? "am-avatar-card--drag" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setAvatarDragOver(true);
            }}
            onDragLeave={() => setAvatarDragOver(false)}
            onDrop={handleAvatarDrop}
          >
            <div className="am-avatar-card-inner">
              <div className="am-avatar-wrap">
                <div className="am-avatar-ring">
                  <img
                    src={avatarSrc}
                    alt="Your avatar"
                    className="am-avatar-img"
                  />
                </div>
                <label
                  className={`am-avatar-upload-btn ${
                    avatarUploading ? "am-avatar-upload-btn--busy" : ""
                  }`}
                >
                  {avatarUploading ? (
                    <HiRefresh
                      style={{
                        width: 13,
                        height: 13,
                        animation: "am-spin 700ms linear infinite",
                      }}
                    />
                  ) : (
                    <FiCamera />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div className="am-avatar-info">
                <p className="am-avatar-name">
                  {form.fullName || googleUser?.name || "Your Name"}
                </p>
                <p className="am-avatar-email">
                  {form.email || googleUser?.email}
                </p>
                {allCareers.length > 0 && (
                  <div className="am-avatar-careers">
                    {allCareers.slice(0, 3).map((c) => {
                      const preset = PRESET_CAREERS.find(
                        (p) => p.id === c || p.label === c
                      );
                      return (
                        <span key={c} className="am-avatar-career-chip">
                          {preset ? (
                            <preset.Icon
                              style={{ width: 10, height: 10 }}
                            />
                          ) : (
                            <HiUser style={{ width: 10, height: 10 }} />
                          )}
                          {preset ? preset.label : c}
                        </span>
                      );
                    })}
                    {allCareers.length > 3 && (
                      <span className="am-avatar-career-chip">
                        +{allCareers.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <p className="am-avatar-drag-hint">
                  Drag & drop or click to upload
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="am-summary-card">
            <div className="am-summary-head">
              <h4 className="am-summary-title">
                <HiInformationCircle />
                Account Summary
              </h4>
            </div>
            <div className="am-summary-body">
              {[
                {
                  label: "Email",
                  value: form.email || googleUser?.email,
                },
                { label: "Phone", value: form.phone || "Not provided" },
                {
                  label: "Careers",
                  value:
                    allCareers.length > 0
                      ? allCareers
                          .slice(0, 3)
                          .map((c) => {
                            const p = PRESET_CAREERS.find(
                              (pr) => pr.id === c
                            );
                            return p ? p.label : c;
                          })
                          .join(", ") +
                        (allCareers.length > 3
                          ? ` +${allCareers.length - 3}`
                          : "")
                      : "Not specified",
                },
                {
                  label: "Auth",
                  value:
                    authMethod === "google" ? "Google OAuth" : "Email OTP",
                },
              ].map(({ label, value }) => (
                <div key={label} className="am-summary-row">
                  <span className="am-summary-label">{label}</span>
                  <span className="am-summary-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Checkbox
            checked={form.keepSignedIn}
            onChange={() => updateField("keepSignedIn", !form.keepSignedIn)}
          >
            Keep me signed in for 30 days
          </Checkbox>

          <div className={`am-terms-wrap ${agreeTerms ? "checked" : ""}`}>
            <Checkbox
              checked={agreeTerms}
              onChange={() => setAgreeTerms((v) => !v)}
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="am-terms-link"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="am-terms-link"
              >
                Privacy Policy
              </a>
            </Checkbox>
          </div>

          <div className="am-btn-row">
              <button
                type="button"
                className="am-btn-secondary"
                disabled={loading || avatarUploading}
                onClick={() => navigateStep(2)}
              >
                <HiArrowLeft /> Back
              </button>
            <button
              type="submit"
              className="am-btn-primary"
              disabled={loading || avatarUploading || !agreeTerms}
            >
              {loading || avatarUploading ? (
                <><Spinner /><span>Creating Account…</span></>
              ) : (
                <><span>Create Account</span><HiSparkles /></>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="am-switch-row">
        <p className="am-switch-text">
          Already have an account?{" "}
          <button
            className="am-btn-link"
            onClick={() => switchView("login")}
          >
            Sign in <HiArrowRight />
          </button>
        </p>
      </div>
    </div>
  );

  /* ── VERIFY VIEW ── */
  const VerifyView = () => (
    <div className="am-viewIn">
      <div className="am-view-head">
        <div className="am-view-icon-wrap am-view-icon-wrap--indigo">
          <HiMail />
        </div>
        <h2 className="am-view-title">Check Your Inbox</h2>
        <p className="am-view-subtitle">
          We sent a 6-digit verification code to:
        </p>
        <div className="am-email-chip">
          <HiMail />
          {activeEmail || "No email provided"}
        </div>
        {codeState !== "success" && (
          <div className={`am-expiry-pill ${expiryClass}`}>
            {codeExpired ? (
              <>
                <HiExclamationCircle />
                <span>Code expired — request a new one</span>
              </>
            ) : (
              <>
                <HiInformationCircle />
                <span>
                  Expires in{" "}
                  <strong className="am-expiry-mono">
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
        className="am-form"
      >
        <div
          className={`am-otp-row ${
            codeState === "verifying" ? "am-otp-row--verifying" : ""
          } ${codeState === "error" ? "am-otp-row--shake" : ""}`}
          onPaste={handleCodePaste}
          role="group"
          aria-label="6-digit verification code"
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
              onFocus={(e) => e.target.select()}
              disabled={
                codeState === "verifying" ||
                codeState === "success" ||
                codeExpired
              }
              className={`am-otp-input ${
                codeExpired
                  ? "am-otp-input--expired"
                  : codeState === "success"
                  ? "am-otp-input--success"
                  : codeState === "error"
                  ? "am-otp-input--error"
                  : digit
                  ? "am-otp-input--filled"
                  : ""
              }`}
              aria-label={`Digit ${i + 1} of 6`}
              autoComplete={i === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>

        {codeState === "verifying" && (
          <div className="am-code-banner am-code-banner--verifying am-slideDown">
            <Spinner /> <span>Verifying your code…</span>
          </div>
        )}
        {codeState === "success" && (
          <div className="am-code-banner am-code-banner--success am-slideDown">
            <HiCheckCircle /> <span>Verified! Signing you in…</span>
          </div>
        )}

        <button
          type="submit"
          className="am-btn-primary"
          disabled={
            loading ||
            code.join("").length !== 6 ||
            codeState === "verifying" ||
            codeState === "success" ||
            codeExpired
          }
        >
          {loading || codeState === "verifying" ? (
            <><Spinner /><span>Verifying…</span></>
          ) : codeState === "success" ? (
            <><HiCheckCircle /><span>Verified!</span></>
          ) : codeExpired ? (
            <><HiExclamationCircle /><span>Code Expired</span></>
          ) : (
            <><span>Verify & Continue</span><HiArrowRight /></>
          )}
        </button>

        <div className="am-verify-actions">
          <button
            type="button"
            className="am-btn-secondary"
            disabled={loading || codeState === "verifying"}
            onClick={handleBackFromVerify}
          >
            <HiArrowLeft /> Back
          </button>
          <button
            type="button"
            className="am-btn-ghost-green"
            disabled={resendTimer > 0 || loading || codeState === "verifying"}
            onClick={handleResend}
          >
            <HiRefresh
              style={{
                animation:
                  resendTimer > 0 || loading
                    ? "am-spin 700ms linear infinite"
                    : "none",
              }}
            />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
          </button>
        </div>

        <p className="am-spam-hint">
          <HiInformationCircle />
          Check your spam folder if you don't see it
        </p>
      </form>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className={`am-backdrop am-fadeIn ${isBusy ? "am-backdrop--busy" : ""}`} onClick={isBusy ? undefined : closeModal}>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM SHEET  (< 640px)
      ══════════════════════════════════════════ */}
      <div
        className="am-modal-mobile am-mobileIn"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="am-title-mobile"
      >
        {/* Drag handle */}
        <div className="am-mobile-handle">
          <div className="am-mobile-handle-bar" />
        </div>

        {/* Mobile Header */}
        <div className="am-mobile-header">
          <div className="am-mobile-header-brand">
            <div className="am-mobile-header-logo">
              <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} />
            </div>
            <span className="am-mobile-header-name">Altuvera</span>
          </div>
          <button
            className="am-mobile-close"
            onClick={closeModal}
            aria-label="Close"
          >
            <HiX />
          </button>
        </div>

        {/* Mobile Tabs */}
        {!isVerify && (
          <div className="am-mobile-tabs">
            {[
              { view: "login",    label: "Sign In",  Icon: HiLockClosed },
              { view: "register", label: "Sign Up",  Icon: HiSparkles   },
            ].map(({ view, label, Icon }) => (
              <button
                key={view}
                className={`am-mobile-tab ${modalView === view ? "active" : ""}`}
                onClick={() => switchView(view)}
                disabled={loading}
              >
                <Icon />
                <span>{label}</span>
                {modalView === view && (
                  <span className="am-mobile-tab-indicator am-scaleX" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Body */}
        <div className="am-mobile-body">
          <Alert
            type="error"
            message={error}
            onClose={() => setError("")}
          />
          <Alert type="success" message={success} />

          {isLogin    && <LoginView    />}
          {isRegister && <RegisterView />}
          {isVerify   && <VerifyView   />}
        </div>

        {/* Mobile Footer */}
        <div className="am-mobile-footer">
          <p className="am-mobile-footer-text">
            <RiShieldKeyholeLine />
            <span>256-bit SSL • We never share your data</span>
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP MODAL  (≥ 640px)
      ══════════════════════════════════════════ */}
      <div
        className="am-modal am-modalIn"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="am-title"
      >
        {/* Gallery Panel */}
        <div className="am-gallery-panel">
          <GallerySlideshow />
        </div>

        {/* Form Panel */}
        <div className="am-form-panel">

          {/* Desktop Header */}
          <div className="am-header">
            <div className="am-header-brand">
              <div className="am-header-logo">
                <img src={getBrandLogoUrl()} alt={BRAND_LOGO_ALT} />
              </div>
              <div className="am-header-wordmark">
                <span className="am-header-name">Altuvera</span>
                <span className="am-header-badge">Premium</span>
              </div>
            </div>
            <button
              className="am-close-btn"
              onClick={closeModal}
              aria-label="Close"
            >
              <HiX />
            </button>
          </div>

          {/* Desktop Tabs */}
          {!isVerify && (
            <div className="am-tabs" role="tablist">
              {[
                { view: "login",    label: "Sign In",        Icon: HiLockClosed },
                { view: "register", label: "Create Account", Icon: HiSparkles   },
              ].map(({ view, label, Icon }) => (
                <button
                  key={view}
                  role="tab"
                  aria-selected={modalView === view}
                  onClick={() => switchView(view)}
                  disabled={loading}
                  className={`am-tab ${modalView === view ? "active" : ""}`}
                >
                  <Icon />
                  <span>{label}</span>
                  {modalView === view && (
                    <span className="am-tab-indicator am-scaleX" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Desktop Scrollable Body */}
          <div className="am-body">
            <Alert
              type="error"
              message={error}
              onClose={() => setError("")}
            />
            <Alert type="success" message={success} />

            {isLogin    && <LoginView    />}
            {isRegister && <RegisterView />}
            {isVerify   && <VerifyView   />}
          </div>

          {/* Desktop Footer */}
          <div className="am-footer">
            <p className="am-footer-text">
              <RiShieldKeyholeLine />
              <span>256-bit SSL encryption</span>
              <span className="am-footer-sep">•</span>
              <span>We never sell or share your data</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}