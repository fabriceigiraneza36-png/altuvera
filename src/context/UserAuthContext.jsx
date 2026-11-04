// ============================================================================
// UserAuthContext.jsx — COOP-safe popup + FedCM-ready + no dismissal errors
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";
import userDataCache from "../utils/userDataCache";
import { startAuthentication } from "@simplewebauthn/browser";
import { reportAuthDiagnostic } from "../utils/authDiagnostics";

// ============================================================================
// Configuration
// ============================================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_SCOPE =
  import.meta.env.VITE_GITHUB_SCOPE || "read:user user:email";

const resolveAuthDiagnosticProvider = (path, body = null) => {
  if (/\/users\/google/i.test(path)) return "google";
  if (/\/users\/github/i.test(path)) return "github";
  if (/\/users\/facebook/i.test(path)) return "facebook";
  if (/passkey/i.test(path)) return "passkey";
  if (/\/users\/login\/(?:factor|verify-factor)/i.test(path)) {
    try {
      const method = typeof body === "string" ? JSON.parse(body)?.method : body?.method;
      return method === "recovery_code" ? "recovery_code" : "authenticator";
    } catch { return "authenticator"; }
  }
  if (/\/users\/(?:login|register|verify-code|verify|resend-code|forgot-username)/i.test(path)) return "email";
  return null;
};

const authDiagnosticStage = (path) =>
  String(path || "unknown").replace(/^\/users\//i, "").split("?")[0].replace(/\//g, "_").slice(0, 80) || "unknown";



// ── Re-verification threshold — must match backend REVERIFICATION_THRESHOLD ──
const REVERIFICATION_THRESHOLD = 3;

const resolveGithubRedirectUri = () => {
  if (import.meta.env.VITE_GITHUB_REDIRECT_URI)
    return import.meta.env.VITE_GITHUB_REDIRECT_URI;
  if (import.meta.env.VITE_GITHUB_CALLBACK_URL)
    return import.meta.env.VITE_GITHUB_CALLBACK_URL;
  const path =
    import.meta.env.VITE_GITHUB_REDIRECT_PATH || "/auth/github/callback";
  return `${window.location.origin}${path}`;
};

if (import.meta.env.DEV) {
  const vars = {
    VITE_API_URL:             import.meta.env.VITE_API_URL,
    VITE_GOOGLE_CLIENT_ID:    import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GITHUB_CLIENT_ID:    import.meta.env.VITE_GITHUB_CLIENT_ID,
    VITE_GITHUB_REDIRECT_URI: import.meta.env.VITE_GITHUB_REDIRECT_URI,
    VITE_GITHUB_CALLBACK_URL: import.meta.env.VITE_GITHUB_CALLBACK_URL,
  };
  Object.entries(vars).forEach(([k, v]) => {
    if (!v) console.warn(`[Auth] Missing env var: ${k}`);
  });
}

// ============================================================================
// Storage Keys
// ============================================================================

const KEYS = {
  TOKEN:                "altuvera_auth_token",
  REFRESH:              "altuvera_refresh_token",
  SESSION_PREF:         "altuvera_persist_session",
  PROFILE_CACHE:        "altuvera_profile_cache",
  GOOGLE_PENDING:       "altuvera_google_pending",
  GOOGLE_POPUP_STATE:   "altuvera_google_popup_state",
  GITHUB_STATE:         "altuvera_github_state",
  GITHUB_INTENT:        "altuvera_github_intent",
  LOGIN_COUNTER:        "altuvera_login_counter",
  LAST_LOGOUT:          "altuvera_last_logout",
  WELCOME_SHOWN_PREFIX: "altuvera_welcome_shown:",
  PENDING_VERIFICATION: "altuvera_pending_email_verification_v1",
  AUTH_RESUME_VIEW: "altuvera_auth_resume_view_v1",
};

const PENDING_VERIFICATION_TTL_MS = 10 * 60 * 1000;

const getCodeExpiryTimestamp = (response) => {
  const raw = response?.data?.codeExpiresAt ?? response?.codeExpiresAt;
  const timestamp = typeof raw === "number" ? raw : Date.parse(raw || "");
  return Number.isFinite(timestamp) && timestamp > Date.now() ? timestamp : undefined;
};

const readPendingVerification = () => {
  try {
    const raw = sessionStorage.getItem(KEYS.PENDING_VERIFICATION);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    const expiresAt = Number(pending?.expiresAt);
    if (!pending?.email || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      sessionStorage.removeItem(KEYS.PENDING_VERIFICATION);
      return null;
    }
    return { ...pending, email: String(pending.email).trim(), expiresAt };
  } catch { return null; }
};

const writePendingVerification = (pending) => {
  try { sessionStorage.setItem(KEYS.PENDING_VERIFICATION, JSON.stringify(pending)); }
  catch { /* current-session verification still works if storage is unavailable */ }
};

const clearStoredPendingVerification = () => {
  try {
    sessionStorage.removeItem(KEYS.PENDING_VERIFICATION);
    sessionStorage.removeItem("altuvera_signup_draft_v1");
    sessionStorage.removeItem(KEYS.AUTH_RESUME_VIEW);
  } catch { /* storage unavailable */ }
};

// ============================================================================
// Context
// ============================================================================

const UserAuthContext = createContext(null);

// ============================================================================
// Storage Utilities
// ============================================================================

const store = {
  get: (key) => {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch { return null; }
  },
  set: (key, val, persist) => {
    try {
      if (persist) {
        localStorage.setItem(key, val);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, val);
        localStorage.removeItem(key);
      }
    } catch { /* storage unavailable */ }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch { /* ignore */ }
  },
  getJSON: (key) => {
    try {
      const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setJSON: (key, val, useSession = true) => {
    try {
      (useSession ? sessionStorage : localStorage).setItem(
        key, JSON.stringify(val),
      );
    } catch { /* storage full */ }
  },
  getPersist: () => {
    try {
      const v = localStorage.getItem(KEYS.SESSION_PREF);
      return v === null ? true : v === "true";
    } catch { return true; }
  },
  getLoginCounter: () => {
    try {
      return parseInt(localStorage.getItem(KEYS.LOGIN_COUNTER) || "0", 10);
    } catch { return 0; }
  },
  setLoginCounter: (n) => {
    try { localStorage.setItem(KEYS.LOGIN_COUNTER, String(n)); }
    catch { /* ignore */ }
  },
  clearAuth: () => {
    [KEYS.TOKEN, KEYS.REFRESH].forEach((k) => {
      try { localStorage.removeItem(k); sessionStorage.removeItem(k); }
      catch { /* ignore */ }
    });
    [
      KEYS.GOOGLE_PENDING, KEYS.GOOGLE_POPUP_STATE,
      KEYS.GITHUB_STATE,   KEYS.GITHUB_INTENT,
    ].forEach((k) => {
      try { sessionStorage.removeItem(k); } catch { /* ignore */ }
    });
  },
};

// ============================================================================
// Pure Utilities
// ============================================================================

const trim = (v) => (typeof v === "string" ? v.trim() : "");

const normalizeFactorMethods = (methods) => {
  const source = Array.isArray(methods) ? methods : [];
  const normalized = source.map((entry) => {
    const raw = typeof entry === "string"
      ? entry
      : entry?.method || entry?.type || entry?.name || entry?.factor || "";
    const value = String(raw).trim().toLowerCase().replace(/[ -]+/g, "_");
    if (["passkey", "webauthn", "security_key", "public_key"].includes(value)) return "passkey";
    if (["totp", "authenticator", "authenticator_app", "otp"].includes(value)) return "totp";
    if (["recovery_code", "recovery_codes", "backup_code", "backup_codes"].includes(value)) return "recovery_code";
    return "";
  }).filter(Boolean);
  return normalized.length ? [...new Set(normalized)] : ["totp", "recovery_code"];
};

const pick = (...vals) => {
  for (const v of vals) {
    const t = trim(v);
    if (t) return t;
  }
  return "";
};

const normalizeUser = (raw, {
  fallbackEmail  = "",
  fallbackName   = "",
  fallbackAvatar = "",
  cache          = {},
} = {}) => {
  if (!raw || typeof raw !== "object") return null;

  const email  = pick(raw.email, raw.userEmail, raw.user_email, fallbackEmail);
  const cached = email ? (cache[email.toLowerCase()] ?? null) : null;

  const fullName = pick(
    raw.fullName, raw.full_name, raw.name, raw.displayName,
    raw.username, cached?.fullName, fallbackName,
    email ? email.split("@")[0] : "", "Traveler",
  );
  const avatar = pick(
    raw.avatar, raw.avatarUrl, raw.avatar_url,
    raw.picture, raw.photoURL, cached?.avatar, fallbackAvatar,
  );

  return {
    id:            raw.id || raw._id || raw.userId || null,
    email,
    fullName,
    name:          fullName,
    avatar:        avatar || null,
    phone:         pick(raw.phone, raw.phoneNumber, raw.phone_number),
    bio:           pick(raw.bio,   raw.biography,   raw.about),
    role:          pick(raw.role,  raw.userRole,    "user"),
    authProvider:  pick(raw.authProvider, raw.auth_provider, raw.provider, "email"),
    isVerified:    Boolean(
      raw.isVerified || raw.is_verified || raw.emailVerified || raw.verified,
    ),
    emailVerified: Boolean(
      raw.emailVerified || raw.email_verified || raw.isVerified,
    ),
    isActive: typeof raw.isActive  === "boolean" ? raw.isActive
            : typeof raw.is_active === "boolean" ? raw.is_active
            : true,
    preferences: (raw.preferences && typeof raw.preferences === "object")
      ? raw.preferences : {},
    lastLogin:    raw.lastLogin  || raw.last_login  || null,
    createdAt:    raw.createdAt  || raw.created_at  || null,
    loginCounter: typeof raw.loginCounter  === "number" ? raw.loginCounter
                : typeof raw.login_counter === "number" ? raw.login_counter
                : 0,
    subscribed:   Boolean(raw.subscribed ?? raw.isSubscribed ?? false),
  };
};

const extractPayload = (data) => {
  const d = data?.data || data || {};
  return {
    token:           d.token        || d.accessToken  || d.access_token  || data?.token        || null,
    refreshToken:    d.refreshToken || d.refresh_token                   || data?.refreshToken || null,
    user:            d.user         || data?.user      || d               || null,
    isNewUser:       Boolean(d.isNewUser         || d.is_new_user    || data?.isNewUser),
    requiresProfile: Boolean(d.requiresProfile   || d.requires_profile || data?.requiresProfile),
    loginCounter:    d.loginCounter ?? d.login_counter ?? data?.loginCounter ?? null,
    wasReverification: Boolean(d.wasReverification ?? data?.wasReverification),
  };
};

const decodeJWT = (credential) => {
  if (!credential) return null;
  try {
    const b64  = credential.split(".")[1]
      .replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64).split("").map((c) =>
        "%" + c.charCodeAt(0).toString(16).padStart(2, "0"),
      ).join(""),
    );
    return JSON.parse(json);
  } catch { return null; }
};

const randomState = () => {
  try {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

const readProfileCache = () => {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

// ─── Error classifiers ────────────────────────────────────────────────────────

const isDismissalError = (msg = "") => {
  const m = msg.toLowerCase();
  return (
    m.includes("dismiss")         || m.includes("cancel")             ||
    m.includes("closed")          || m.includes("credential_cancelled") ||
    m.includes("popup_closed")    || m.includes("skipped")            ||
    m.includes("not_displayed")   || m.includes("access_denied")
  );
};

// ─── COOP-safe popup closed check ────────────────────────────────────────────
let _popupClosedCache = null;
const isPopupClosed = (popup) => {
  if (_popupClosedCache !== null) return _popupClosedCache;
  try {
    const closed = !popup || popup.closed;
    _popupClosedCache = closed;
    return closed;
  } catch {
    return false;
  }
};

// ─── FedCM-safe One Tap notification classifier ───────────────────────────────
const classifyOneTapNotification = (notification) => {
  try {
    let displayed    = false;
    let skipped      = false;
    let dismissed    = false;
    let notDisplayed = false;

    try { displayed    = Boolean(notification.isDisplayMoment?.());  } catch { /* FedCM */ }
    try { skipped      = Boolean(notification.isSkippedMoment?.());  } catch { /* FedCM */ }
    try { dismissed    = Boolean(notification.isDismissedMoment?.()); } catch { /* FedCM */ }
    try { notDisplayed = Boolean(notification.isNotDisplayed?.());   } catch { /* FedCM */ }

    if (displayed)            return "success";
    if (skipped || dismissed) return "dismissed";
    if (notDisplayed)         return "unavailable";
    return "dismissed";
  } catch { return "dismissed"; }
};

// ============================================================================
// Google OAuth2 Popup — COOP-safe
// ============================================================================

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const openGooglePopup = (clientId, mode = "signin") =>
  new Promise((resolve, reject) => {
    if (!clientId)
      return reject(new Error("Google Sign-In is not configured."));

    const state       = randomState();
    const nonce       = randomState();
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    try { sessionStorage.setItem(KEYS.GOOGLE_POPUP_STATE, state); }
    catch { /* ignore */ }

    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  redirectUri,
      response_type: "id_token token",
      scope:         "openid email profile",
      state,
      nonce,
      prompt: mode === "signup" ? "select_account consent" : "select_account",
    });

    const W    = 500, H = 640;
    const left = Math.round((window.screen.width  - W) / 2);
    const top  = Math.round((window.screen.height - H) / 2);
    const features = [
      `width=${W}`, `height=${H}`,
      `left=${left}`, `top=${top}`,
      "resizable=yes", "scrollbars=yes",
      "toolbar=no", "menubar=no", "status=yes",
    ].join(",");

    let popup;
    try {
      popup = window.open(
        `${GOOGLE_OAUTH_URL}?${params}`,
        `google_oauth_${Date.now()}`,
        features,
      );
    } catch { popup = null; }

    if (!popup) {
      return reject(new Error(
        "Popup was blocked by your browser. " +
        "Please allow popups for this site and try again.",
      ));
    }

    let settled       = false;
    let pollTimer     = null;
    let msgHandler    = null;
    let watchdogTimer = null;
    let bc            = null;

    _popupClosedCache = null; // fresh for this popup instance

    const cleanup = () => {
      settled = true;
      if (pollTimer)     { clearInterval(pollTimer);    pollTimer     = null; }
      if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
      if (msgHandler)    { window.removeEventListener("message", msgHandler); msgHandler = null; }
      if (bc)            { try { bc.close(); } catch {} bc = null; }
      try { sessionStorage.removeItem(KEYS.GOOGLE_POPUP_STATE); } catch {}
      try { if (!isPopupClosed(popup)) popup.close(); } catch {}
    };

    const settle = (fn, val) => {
      if (settled) return;
      cleanup();
      fn(val);
    };

    const getSavedState = () => {
      try { return sessionStorage.getItem(KEYS.GOOGLE_POPUP_STATE); }
      catch { return state; }
    };

    const handleMessage = (event) => {
      if (settled) return;
      if (event.origin !== window.location.origin) return;
      const { type, credential, idToken, error, state: retState } = event.data || {};
      if (type !== "google_auth_callback") return;

      if (retState && getSavedState() && retState !== getSavedState())
        return settle(reject, new Error("Security check failed. Please try again."));

      if (error) {
        if (isDismissalError(error))
          return settle(resolve, { dismissed: true, reason: "popup_closed" });
        return settle(reject, new Error(error));
      }

      const tok = credential || idToken;
      if (!tok)
        return settle(resolve, { dismissed: true, reason: "no_credential" });

      settle(resolve, tok);
    };

    // Strategy 1: postMessage
    msgHandler = handleMessage;
    window.addEventListener("message", msgHandler);

    // Strategy 2: BroadcastChannel
    try {
      bc = new BroadcastChannel("google_auth_popup");
      bc.onmessage = (event) => {
        if (settled) return;
        const { type, credential, idToken, error, state: retState } = event.data || {};
        if (type !== "google_auth_callback") return;

        if (retState && getSavedState() && retState !== getSavedState())
          return settle(reject, new Error("Security check failed."));

        if (error) {
          if (isDismissalError(error))
            return settle(resolve, { dismissed: true, reason: "popup_closed" });
          return settle(reject, new Error(error));
        }

        const tok = credential || idToken;
        if (tok) settle(resolve, tok);
      };
    } catch { /* BroadcastChannel not supported */ }

    // Strategy 3: Poll popup URL
    pollTimer = setInterval(() => {
      if (settled) { clearInterval(pollTimer); return; }

      if (isPopupClosed(popup)) {
        clearInterval(pollTimer);
        if (!settled) settle(resolve, { dismissed: true, reason: "popup_closed" });
        return;
      }

      try {
        const href = popup.location?.href || "";
        if (!href || !href.startsWith(window.location.origin)) return;

        const hash  = new URLSearchParams(popup.location.hash.replace("#", "?"));
        const query = new URLSearchParams(popup.location.search);

        const idToken =
          hash.get("id_token")  || hash.get("credential")  ||
          query.get("id_token") || query.get("credential");

        const errParam = hash.get("error")  || query.get("error");
        const retState = hash.get("state")  || query.get("state");

        if (errParam) {
          clearInterval(pollTimer);
          if (isDismissalError(errParam) || errParam === "access_denied")
            return settle(resolve, { dismissed: true, reason: errParam });
          return settle(reject, new Error(`Google error: ${errParam}`));
        }

        if (idToken) {
          const savedState = getSavedState();
          if (retState && savedState && retState !== savedState) {
            clearInterval(pollTimer);
            return settle(reject, new Error("Security check failed."));
          }
          clearInterval(pollTimer);
          settle(resolve, idToken);
        }
      } catch {
        // Cross-origin read — still on Google's domain, keep polling
      }
    }, 400);

    // Watchdog: 5-minute timeout
    watchdogTimer = setTimeout(() => {
      if (!settled) settle(resolve, { dismissed: true, reason: "timeout" });
    }, 5 * 60 * 1000);
  });

// ============================================================================
// Provider
// ============================================================================

export function UserAuthProvider({ children }) {

  // ── Core state ──────────────────────────────────────────────────────────────
  const [user, setUser]                     = useState(null);
  const [token, setToken]                   = useState(() => store.get(KEYS.TOKEN));
  const [authLoading, setAuthLoading]       = useState(true);
  const [persistSession, setPersistSession] = useState(() => store.getPersist());

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalView,   setModalView]     = useState("login");
  const [pendingVerification, setPendingVerification] = useState(() => readPendingVerification());
  const [pendingEmail, setPendingEmail] = useState(() => readPendingVerification()?.email || "");
  const [pendingFactorChallenge, setPendingFactorChallenge] = useState("");
  const [pendingFactorMethods, setPendingFactorMethods] = useState([]);

  // ── Re-verification ───────────────────────────────────────────────────────
  const [requiresLoginVerification, setRequiresLoginVerification] = useState(false);
  const [pendingSocialAuth, setPendingSocialAuth]                  = useState(null);

  // ── Login counter (synced from server) ────────────────────────────────────
  const [loginCounter, setLoginCounter] = useState(() => store.getLoginCounter());

  // ── Notifications ─────────────────────────────────────────────────────────
  const [showCongratulation,     setShowCongratulation]     = useState(false);
  const [congratulationType,     setCongratulationType]     = useState("");
  const [showNotLoggedInMessage, setShowNotLoggedInMessage] = useState(false);

  // ── Social auth ───────────────────────────────────────────────────────────
  const [googleUser,    setGoogleUser]    = useState(() => store.getJSON(KEYS.GOOGLE_PENDING));
  const [googleLoaded,  setGoogleLoaded]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState("");
  const [socialAuthProfile, setSocialAuthProfile] = useState(null);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const fetchingRef     = useRef(false);
  const pendingRef      = useRef(null);
  const googleInitRef   = useRef(false);
  const refreshRef      = useRef(null);
  const googleCbRef     = useRef(null);
  const profileCacheRef = useRef(null);
  const congratTimerRef = useRef(null);
  const notLoggedInRef  = useRef(null);
  const otpRestoreAttemptedRef = useRef(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const isAuthenticated  = useMemo(() => !!user && !!token, [user, token]);

  const hasGooglePending = useMemo(
    () => !!googleUser?.email && !!googleUser?.credential,
    [googleUser],
  );

  // ── Init profile cache ────────────────────────────────────────────────────
  useEffect(() => {
    if (profileCacheRef.current === null)
      profileCacheRef.current = readProfileCache();
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    document.body.style.overflow = "";
    if (congratTimerRef.current) clearTimeout(congratTimerRef.current);
    if (notLoggedInRef.current)  clearTimeout(notLoggedInRef.current);
  }, []);

  const getCache = useCallback(() => profileCacheRef.current ?? {}, []);

  const persistPendingVerification = useCallback((email, details = {}) => {
    const normalizedEmail = trim(email);
    if (!normalizedEmail) return null;
    const now = Date.now();
    const previous = readPendingVerification();
    const requestedExpiry = Number(details.expiresAt);
    const next = {
      ...(previous || {}),
      ...details,
      email: normalizedEmail,
      createdAt: now,
      expiresAt: Number.isFinite(requestedExpiry) && requestedExpiry > now
        ? requestedExpiry : now + PENDING_VERIFICATION_TTL_MS,
    };
    writePendingVerification(next);
    setPendingVerification(next);
    setPendingEmail(normalizedEmail);
    return next;
  }, []);

  const clearPendingVerification = useCallback(() => {
    clearStoredPendingVerification();
    setPendingVerification(null);
    setPendingEmail("");
  }, []);

  // Restore a still-valid email-code flow after a page refresh, including
  // OAuth callbacks where a previous session token may still exist. Closing the
  // modal does not discard the challenge; it can be resumed for the same 10 min.
  useEffect(() => {
    if (authLoading || otpRestoreAttemptedRef.current) return;
    otpRestoreAttemptedRef.current = true;
    const saved = readPendingVerification();
    if (!saved) return;
    setPendingVerification(saved);
    setPendingEmail(saved.email);
    setModalView("verify");
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, [authLoading]);

  // ── Sync loginCounter to storage whenever it changes ─────────────────────
  useEffect(() => { store.setLoginCounter(loginCounter); }, [loginCounter]);

  // ============================================================================
  // Helpers
  // ============================================================================

  const triggerCongratulation = useCallback((type) => {
    if (type === "signup") {
      try {
        const email = (user?.email || pendingRef.current?.email || "").toLowerCase();
        if (email) {
          const key = `${KEYS.WELCOME_SHOWN_PREFIX}${email}`;
          if (localStorage.getItem(key)) return;
          localStorage.setItem(key, Date.now().toString());
        }
      } catch { /* storage unavailable */ }
    }
    if (congratTimerRef.current) clearTimeout(congratTimerRef.current);
    setCongratulationType(type === "signup" ? "signup" : "login");
    setShowCongratulation(true);
    // Keep the success modal visible until dismissed or a quick link is chosen.
    congratTimerRef.current = null;
  }, [user]);

  const dismissCongratulation = useCallback(() => {
    if (congratTimerRef.current) clearTimeout(congratTimerRef.current);
    congratTimerRef.current = null;
    setShowCongratulation(false);
  }, []);

  // ============================================================================
  // Profile Cache
  // ============================================================================

  const cacheProfile = useCallback((profile) => {
    const email = trim(profile?.email);
    if (!email) return;
    const next = {
      ...getCache(),
      [email.toLowerCase()]: {
        email,
        fullName: trim(profile?.fullName || profile?.name),
        avatar:   trim(profile?.avatar),
      },
    };
    profileCacheRef.current = next;
    try { localStorage.setItem(KEYS.PROFILE_CACHE, JSON.stringify(next)); }
    catch { /* storage full */ }
  }, [getCache]);

  // ============================================================================
  // Session
  // ============================================================================

  const clearAuth = useCallback(() => {
    store.clearAuth();
    setToken(null);
    setUser(null);
    setGoogleUser(null);
    pendingRef.current = null;
    setRequiresLoginVerification(false);
    setPendingSocialAuth(null);
    setLoginCounter(0);
    store.setLoginCounter(0);
    try { localStorage.setItem(KEYS.LAST_LOGOUT, Date.now().toString()); }
    catch { /* ignore */ }
  }, []);

  const setSessionPreference = useCallback((persist) => {
    const next = Boolean(persist);
    setPersistSession(next);
    try { localStorage.setItem(KEYS.SESSION_PREF, String(next)); } catch {}
    const t = token || store.get(KEYS.TOKEN);
    if (t) store.set(KEYS.TOKEN, t, next);
    const r = store.get(KEYS.REFRESH);
    if (r) store.set(KEYS.REFRESH, r, next);
  }, [token]);

  // ══════════════════════════════════════════════════════════════════════════
  // ✅ FIX: saveAuth now also accepts a top-level `data` shape from
  //    forgotUsernameVerify which wraps everything inside data.data
  //    The extractPayload function already handles both shapes, so this
  //    is handled transparently — no special casing needed here.
  // ══════════════════════════════════════════════════════════════════════════
  const saveAuth = useCallback((data, opts = {}) => {
    const {
      token: tok, refreshToken: ref, user: raw,
      loginCounter: serverCounter,
    } = extractPayload(data);

    const persist = typeof opts.persist === "boolean" ? opts.persist : persistSession;

    if (tok) { store.set(KEYS.TOKEN, tok, persist); setToken(tok); }
    if (ref)   store.set(KEYS.REFRESH, ref, persist);

    if (typeof serverCounter === "number") {
      setLoginCounter(serverCounter);
      store.setLoginCounter(serverCounter);
    }

    const fallback = {
      email:  pendingRef.current?.email    || googleUser?.email   || "",
      name:   pendingRef.current?.fullName || googleUser?.name    || "",
      avatar: pendingRef.current?.avatar   || googleUser?.picture || "",
    };

    const normalized = normalizeUser(raw, {
      fallbackEmail:  fallback.email,
      fallbackName:   fallback.name,
      fallbackAvatar: fallback.avatar,
      cache:          getCache(),
    });

    if (normalized) { setUser(normalized); cacheProfile(normalized); }

    pendingRef.current = null;
    setGoogleUser(null);
    store.remove(KEYS.GOOGLE_PENDING);

    return data;
  }, [cacheProfile, getCache, googleUser, persistSession]);

  // ============================================================================
  // Modal
  // ============================================================================

  const openModal = useCallback((view = "login", options = {}) => {
    const {
      skipNotLoggedInMessage = false,
      resumePendingVerification = true,
      resumeSavedForm = true,
    } = options;

    // A valid code challenge takes priority when a visitor opens the normal
    // sign-in entry point again. This prevents a closed/refreshed OTP flow from
    // silently looking like a brand-new login and avoids sending another code.
    const storedPending = readPendingVerification();
    const inMemoryPending = pendingVerification &&
      Number(pendingVerification.expiresAt) > Date.now()
      ? pendingVerification
      : null;
    const resumablePending = storedPending || inMemoryPending;
    let nextView = resumePendingVerification && view === "login" && resumablePending
      ? "verify"
      : view;

    // If the visitor refreshed or dismissed the modal while filling the
    // registration form (before an OTP was issued), reopen that form rather
    // than dropping them into a blank sign-in screen.
    if (resumeSavedForm && nextView === "login" && !resumablePending) {
      try {
        const savedView = sessionStorage.getItem(KEYS.AUTH_RESUME_VIEW);
        const rawSignupDraft = JSON.parse(sessionStorage.getItem("altuvera_signup_draft_v1") || "null");
        const hasUsableSignupDraft = Boolean(
          rawSignupDraft?.data &&
          Number(rawSignupDraft.expiresAt) > Date.now() &&
          String(rawSignupDraft.data.email || "").trim()
        );
        if (savedView === "register" && hasUsableSignupDraft) nextView = "register";
      } catch { /* Storage can be unavailable in private browsing. */ }
    }

    if (nextView === "verify" && resumablePending) {
      setPendingVerification(resumablePending);
      setPendingEmail(resumablePending.email);
    }

    if (skipNotLoggedInMessage) {
      setModalView(nextView);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      return;
    }

    if (notLoggedInRef.current) clearTimeout(notLoggedInRef.current);
    setShowNotLoggedInMessage(true);
    notLoggedInRef.current = setTimeout(() => {
      setShowNotLoggedInMessage(false);
      setModalView(nextView);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      notLoggedInRef.current = null;
    }, 1500);
  }, [pendingVerification]);

  const closeModal = useCallback(() => {
    const savedVerification = readPendingVerification();
    setPendingVerification(savedVerification);
    setIsModalOpen(false);
    setPendingEmail(savedVerification?.email || "");
    setSocialAuthError("");
    setSocialAuthProfile(null);
    setGoogleUser(null);
    store.remove(KEYS.GOOGLE_PENDING);
    document.body.style.overflow = "";
  }, []);

  // ============================================================================
  // Core API Fetch
  // ============================================================================

  const authFetch = useCallback(async (endpoint, opts = {}) => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    // Public authentication endpoints must never inherit an old bearer token.
    // Otherwise an expired session can intercept a fresh login/OTP/OAuth attempt
    // and incorrectly trigger the authenticated-session refresh path.
    const authPath = endpoint.startsWith("http")
      ? new URL(endpoint).pathname
      : (endpoint.startsWith("/") ? endpoint : `/${endpoint}`).split("?")[0];
    const isPublicAuthRequest = /^\/users\/(?:login(?:\/(?:passkey\/(?:options|verify)|factor|verify-factor))?|register|verify-code|resend-code|check-email|google(?:\/signup-complete)?|github|facebook|forgot-username|forgot-password)(?:\/|$)/i.test(authPath);
    const diagnosticProvider = resolveAuthDiagnosticProvider(authPath, opts.body);
    const tok    = isPublicAuthRequest ? null : (token || store.get(KEYS.TOKEN));
    const isForm = opts.body instanceof FormData;

    const makeHeaders = (t) => ({
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...opts.headers,
    });

    const method = String(opts.method || "GET").toUpperCase();
    const cacheable = method === "GET" && opts.cache !== false && !opts._retry;
    const cacheKey = url;
    if (cacheable && !opts._skipCacheRead) {
      const cached = userDataCache.get(cacheKey);
      if (cached) {
        // Stale-while-revalidate: render cached data immediately, but ALWAYS
        // synchronize it with the server in the background.
        void authFetch(endpoint, { ...opts, _skipCacheRead: true }).catch(() => {});
        return cached;
      }
    }
    const execute = (requestToken = tok) => fetch(url, { ...opts, headers: makeHeaders(requestToken) });
    let res;
    try {
      const request = execute(tok);
      res = await request;
    } catch (networkError) {
      const message = "Network error. Please check your connection and try again.";
      const referenceId = diagnosticProvider
        ? reportAuthDiagnostic({
            provider: diagnosticProvider,
            stage: authDiagnosticStage(authPath),
            category: "network",
            errorCode: networkError?.name || "NETWORK_ERROR",
            error: networkError,
            message,
          })
        : "";
      const surfaced = new Error(referenceId ? `${message} Reference: ${referenceId}` : message);
      surfaced.code = "AUTH_NETWORK_ERROR";
      surfaced.diagnosticReference = referenceId;
      throw surfaced;
    }

    // 401 → try token refresh
    if (res.status === 401 && !opts._retry && !isPublicAuthRequest) {
      const rt = store.get(KEYS.REFRESH);
      if (rt) {
        try {
          if (!refreshRef.current) {
            refreshRef.current = fetch(`${API_BASE}/users/refresh-token`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ refreshToken: rt }),
            })
              .then(async (r) => {
                const d = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(d?.message || "Session expired");
                saveAuth(d, { persist: persistSession });
                return extractPayload(d).token;
              })
              .finally(() => { refreshRef.current = null; });
          }
          const newTok = await refreshRef.current;
          res = await fetch(url, {
            ...opts, _retry: true, headers: makeHeaders(newTok),
          });
        } catch {
          clearAuth();
          throw new Error("Session expired. Please sign in again.");
        }
      } else {
        clearAuth();
        throw new Error("Session expired. Please sign in again.");
      }
    }

    if (res.status === 204) return {};

    let resData = null;
    try {
      const ct = res.headers.get("content-type") || "";
      resData = ct.includes("application/json")
        ? await res.json()
        : { message: await res.text() };
    } catch { resData = {}; }

    if (!res.ok) {
      if (res.status === 401 && !isPublicAuthRequest) clearAuth();
      const msg =
        resData?.message || resData?.error || resData?.data?.message ||
        `Request failed (${res.status})`;
      const err  = new Error(msg);
      err.status = res.status;
      err.data   = resData;
      err.diagnosticReference = resData?.diagnosticReference || "";
      if (diagnosticProvider && !err.diagnosticReference) {
        err.diagnosticReference = reportAuthDiagnostic({
          provider: diagnosticProvider,
          stage: authDiagnosticStage(authPath),
          category: res.status === 429 ? "rate_limited" : "unexpected",
          errorCode: resData?.code || `HTTP_${res.status}`,
          httpStatus: res.status,
          message: msg,
        });
      }
      if (err.diagnosticReference) err.message = `${msg} Reference: ${err.diagnosticReference}`;
      throw err;
    }

    const finalData = resData || {};
    if (cacheable) {
      userDataCache.set(cacheKey, finalData, opts.cacheTime || 30 * 1000);
    } else {
      userDataCache.clear();
    }
    return finalData;
  }, [clearAuth, persistSession, saveAuth, token]);

  // Revalidate dashboard data only after authFetch has been initialized.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const endpoints = [
      "/users/me",
      "/bookings/my-bookings?limit=50&page=1",
      "/bookings/my?limit=10&page=1",
      "/notifications/my?page=1&limit=20",
      "/notifications/my/unread-count",
      "/messages/conversations?limit=100",
    ];
    const run = () => endpoints.forEach((endpoint) =>
      authFetch(endpoint, { cacheTime: 30 * 1000 }).catch(() => {})
    );
    let idleId = null;
    let timeoutId = null;
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(run, { timeout: 1500 });
    else timeoutId = window.setTimeout(run, 600);

    // Keep the shared dashboard cache fresh while the session is open. Cached
    // values remain instant, but every cycle still revalidates against server.
    const refreshId = window.setInterval(run, 30_000);

    return () => {
      if (idleId !== null && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.clearInterval(refreshId);
    };
  }, [isAuthenticated, token, authFetch]);

  // ============================================================================
  // Session Restore
  // ============================================================================

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;
    const tok = token || store.get(KEYS.TOKEN);
    if (!tok) { setAuthLoading(false); return; }

    fetchingRef.current = true;
    try {
      const data = await authFetch("/users/me");
      const raw  = data?.data?.user || data?.data || data?.user || data;
      const norm = normalizeUser(raw, { cache: getCache() });
      if (norm) {
        setUser(norm);
        cacheProfile(norm);
        if (typeof norm.loginCounter === "number") {
          setLoginCounter(norm.loginCounter);
          store.setLoginCounter(norm.loginCounter);
        }
      }
    } catch (err) {
      console.warn("[Auth] Session restore failed:", err.message);
      clearAuth();
    } finally {
      setAuthLoading(false);
      fetchingRef.current = false;
    }
  }, [authFetch, cacheProfile, clearAuth, getCache, token]);

  // ============================================================================
  // Email OTP
  // ============================================================================

  const login = useCallback(async (payload) => {
    const p     = typeof payload === "object" ? payload : { email: payload };
    const email = trim(p.email);
    if (!email) throw new Error("Email is required.");
    if (typeof p.persistSession === "boolean") setSessionPreference(p.persistSession);

    pendingRef.current = { email, fullName: trim(p.fullName) || "" };

    const data = await authFetch("/users/login", {
      method: "POST",
      body:   JSON.stringify({
        email,
        fullName: trim(p.fullName) || undefined,
      }),
    }).catch((err) => {
      pendingRef.current = null;
      const surfaced = new Error(err?.message || "Failed to send verification code.");
      surfaced.status = err?.status;
      surfaced.code = err?.data?.code || err?.code || "";
      surfaced.data = err?.data || null;
      throw surfaced;
    });

    // ✅ FIX: If the backend returns the user's stored fullName in the
    //    login response (which our updated authController now does),
    //    update pendingRef so verifyCode can use it for the greeting.
    const returnedName = data?.data?.fullName || data?.fullName || "";
    if (returnedName && !pendingRef.current?.fullName) {
      pendingRef.current = { ...pendingRef.current, fullName: returnedName };
    }

    persistPendingVerification(email, {
      fullName: trim(returnedName || p.fullName), purpose: "login", provider: "email",
      expiresAt: getCodeExpiryTimestamp(data),
    });
    setRequiresLoginVerification(false);
    setModalView("verify");

    return data;
  }, [authFetch, persistPendingVerification, setSessionPreference]);

  const register = useCallback(async (payload) => {
    const p     = typeof payload === "object" ? payload : { email: payload };
    const email = trim(p.email);
    if (!email) throw new Error("Email is required.");
    if (typeof p.persistSession === "boolean") setSessionPreference(p.persistSession);

    pendingRef.current = {
      email,
      fullName: trim(p.fullName) || "",
      avatar:   trim(p.avatar)   || "",
    };

    const data = await authFetch("/users/register", {
      method: "POST",
      body:   JSON.stringify({
        email,
        fullName: trim(p.fullName) || undefined,
        phone:    trim(p.phone)    || undefined,
        bio:      trim(p.bio)      || undefined,
        avatar:   trim(p.avatar)   || undefined,
        preferences: p.preferences && typeof p.preferences === "object" ? p.preferences : undefined,
      }),
    }).catch((err) => {
      pendingRef.current = null;
      throw new Error(err?.message || "Failed to send verification code.");
    });

    persistPendingVerification(email, {
      fullName: trim(p.fullName), purpose: "signup", provider: "email",
      expiresAt: getCodeExpiryTimestamp(data),
    });
    setModalView("verify");

    return data;
  }, [authFetch, persistPendingVerification, setSessionPreference]);

  // ============================================================================
  // Verify Code
  // ============================================================================

  const verifyCode = useCallback(async (email, code) => {
    const e = trim(email)
      || trim(pendingEmail)
      || trim(pendingRef.current?.email)
      || "";
    const c = trim(String(code || ""));

    if (!e) throw new Error("Email is required. Please restart the sign-in flow.");
    if (!c) throw new Error("Verification code is required.");

    const data = await authFetch("/users/verify-code", {
      method: "POST",
      body:   JSON.stringify({ email: e, code: c }),
    });

    if (data?.requiresSecondFactor || data?.data?.requiresSecondFactor) {
      clearPendingVerification();
      const challenge = data.challengeToken || data.data?.challengeToken;
      if (!challenge) throw new Error("The additional verification challenge was missing. Please sign in again.");
      setPendingFactorChallenge(challenge);
      const methods = normalizeFactorMethods(data.methods || data.data?.methods);
      setPendingFactorMethods(methods);
      setModalView("factor");
      return { requiresSecondFactor: true, methods };
    }

    const payload    = extractPayload(data);
    const newCounter = payload.loginCounter
      ?? data?.data?.loginCounter
      ?? data?.loginCounter
      ?? 0;

    if (requiresLoginVerification) {
      if (pendingSocialAuth?.data) {
        saveAuth(pendingSocialAuth.data, { persist: persistSession });
      } else {
        saveAuth(data, { persist: persistSession });
      }
      setLoginCounter(newCounter);
      store.setLoginCounter(newCounter);
      setRequiresLoginVerification(false);
      setPendingSocialAuth(null);
      clearPendingVerification();
      closeModal();
      triggerCongratulation(
        data?.data?.isNewUser || data?.isNewUser ? "signup" : "login",
      );
      return data;
    }

    saveAuth(data, { persist: persistSession });
    clearPendingVerification();
    setLoginCounter(newCounter);
    store.setLoginCounter(newCounter);
    closeModal();
    triggerCongratulation(
      data?.data?.isNewUser || data?.isNewUser ? "signup" : "login",
    );
    return data;
  }, [
    authFetch, clearPendingVerification, closeModal, pendingEmail, pendingSocialAuth,
    persistSession, requiresLoginVerification, saveAuth, triggerCongratulation,
  ]);


  // Shared completion path for direct security-method authentication. The server
  // returns the same complete account/session payload as email and OAuth login.
  const finishStandaloneSecurityLogin = useCallback((data) => {
    const payload = extractPayload(data);
    if (!payload.token || !payload.user)
      throw new Error("Altuvera could not create a complete sign-in session. Please try another method.");
    saveAuth(data, { persist: persistSession });
    const counter = payload.loginCounter ?? payload.user?.loginCounter ?? 0;
    setLoginCounter(counter);
    store.setLoginCounter(counter);
    clearPendingVerification();
    try { sessionStorage.removeItem("altuvera_login_draft_v1"); } catch { /* storage unavailable */ }
    setPendingEmail("");
    setPendingFactorChallenge("");
    setPendingFactorMethods([]);
    closeModal();
    triggerCongratulation("login");
    return data;
  }, [saveAuth, persistSession, clearPendingVerification, closeModal, triggerCongratulation]);

  const loginWithSecurityCode = useCallback(async (method, email, code) => {
    const data = await authFetch("/users/login/factor", {
      method: "POST",
      body: JSON.stringify({ method, email: trim(email), code: trim(code) }),
    });
    if (data?.success === false) throw new Error(data.message || "Security verification failed.");
    return finishStandaloneSecurityLogin(data);
  }, [authFetch, finishStandaloneSecurityLogin]);

  const startPasskeyLogin = useCallback(async (email = "") => {
    if (!window.PublicKeyCredential || !navigator.credentials)
      throw new Error("Passkeys are not supported in this browser or device.");
    const optionsResponse = await authFetch("/users/login/passkey/options", {
      method: "POST",
      body: JSON.stringify(email ? { email: trim(email) } : {}),
    });
    const source = optionsResponse?.data || optionsResponse || {};
    const challengeToken = source.challengeToken;
    if (!challengeToken) throw new Error("Altuvera could not start passkey sign-in. Please try another method.");
    const optionsJSON = { ...source };
    delete optionsJSON.challengeToken;
    delete optionsJSON.success;
    const assertion = await startAuthentication({ optionsJSON });
    const data = await authFetch("/users/login/passkey/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken, response: assertion }),
    });
    if (data?.success === false) throw new Error(data.message || "Passkey verification failed.");
    return finishStandaloneSecurityLogin(data);
  }, [authFetch, finishStandaloneSecurityLogin]);

  const beginFactorChallenge = useCallback((challenge, methods = []) => {
    if (!challenge) throw new Error("The additional verification challenge was missing. Please sign in again.");
    setPendingFactorChallenge(challenge);
    setPendingFactorMethods(normalizeFactorMethods(methods));
    setModalView("factor");
  }, []);

  // Explicitly abandon an in-progress second-factor challenge before switching
  // to a different sign-in provider. The challenge is never reused afterwards.
  const cancelPendingFactorChallenge = useCallback(() => {
    setPendingFactorChallenge("");
    setPendingFactorMethods([]);
  }, []);

  const verifyLoginFactor = useCallback(async (method, code) => {
    if (!pendingFactorChallenge) throw new Error("Your verification session expired. Please sign in again.");
    const data = await authFetch("/users/login/verify-factor", {
      method: "POST",
      body: JSON.stringify({ challengeToken: pendingFactorChallenge, method, code: trim(code) }),
    });
    if (data?.success === false) throw new Error(data.message || "Additional verification failed.");
    const payload = extractPayload(data);
    saveAuth(data, { persist: persistSession });
    const newCounter = payload.loginCounter ?? data?.data?.loginCounter ?? 0;
    setLoginCounter(newCounter);
    store.setLoginCounter(newCounter);
    setPendingFactorChallenge("");
    setPendingFactorMethods([]);
    setPendingEmail("");
    closeModal();
    triggerCongratulation("login");
    return data;
  }, [authFetch, pendingFactorChallenge, persistSession, saveAuth, closeModal, triggerCongratulation]);


  const verifyLoginPasskey = useCallback(async () => {
    if (!pendingFactorChallenge) throw new Error("Your verification session expired. Please sign in again.");
    if (!window.PublicKeyCredential || !navigator.credentials) throw new Error("Passkeys are not supported in this browser.");
    const options = await authFetch("/users/login/passkey/options", {
      method: "POST",
      body: JSON.stringify({ challengeToken: pendingFactorChallenge }),
    });
    const assertion = await startAuthentication({ optionsJSON: options.data || options });
    const data = await authFetch("/users/login/passkey/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken: pendingFactorChallenge, response: assertion }),
    });
    if (data?.success === false) throw new Error(data.message || "Passkey verification failed.");
    const payload = extractPayload(data);
    saveAuth(data, { persist: persistSession });
    const newCounter = payload.loginCounter ?? data?.data?.loginCounter ?? 0;
    setLoginCounter(newCounter);
    store.setLoginCounter(newCounter);
    setPendingFactorChallenge("");
    setPendingFactorMethods([]);
    setPendingEmail("");
    closeModal();
    triggerCongratulation("login");
    return data;
  }, [pendingFactorChallenge, authFetch, persistSession, saveAuth, closeModal, triggerCongratulation]);

  // ============================================================================
  // Resend Code
  // ============================================================================

  const resendCode = useCallback(async (email) => {
    const e = trim(email || pendingEmail);
    if (!e) throw new Error("Email is required.");

    const data = await authFetch("/users/resend-code", {
      method: "POST",
      body:   JSON.stringify({ email: e }),
    });

    // ✅ FIX: If backend returns the user's fullName in resend response,
    //    update pendingRef so the UI can display their name as a reminder.
    const returnedName = data?.data?.fullName || data?.fullName || "";
    if (returnedName && pendingRef.current) {
      pendingRef.current = { ...pendingRef.current, fullName: returnedName };
    }
    // readPendingVerification intentionally rejects expired challenges. Keep
    // the in-memory metadata as a fallback for a resend initiated from the
    // still-open expired-code screen, preserving whether this was signup,
    // login, Google, or GitHub verification.
    const storedPrevious = readPendingVerification();
    const memoryPrevious = pendingVerification &&
      trim(pendingVerification.email).toLowerCase() === e.toLowerCase()
      ? pendingVerification
      : null;
    const previous = storedPrevious || memoryPrevious;
    persistPendingVerification(e, {
      purpose: previous?.purpose || "login",
      provider: previous?.provider || "email",
      fullName: returnedName || previous?.fullName || pendingRef.current?.fullName || "",
      expiresAt: getCodeExpiryTimestamp(data),
    });

    return data;
  }, [authFetch, pendingEmail, pendingVerification, persistPendingVerification]);

  const checkEmail = useCallback(async (email) => {
    const e = trim(email);
    if (!e) return { exists: false };
    try {
      const d = await authFetch("/users/check-email", {
        method: "POST",
        body:   JSON.stringify({ email: e }),
      });
      return d?.data || { exists: false };
    } catch { return { exists: false }; }
  }, [authFetch]);

  // ============================================================================
  // Google Core Sign-In
  // ============================================================================

  const googleSignIn = useCallback(async (credential, extra = {}) => {
    if (!credential) throw new Error("Google sign-in was cancelled.");
    setGoogleLoading(true);
    setSocialAuthError("");
    setSocialAuthProfile(null);

    try {
      const data = await authFetch("/users/google", {
        method: "POST",
        body:   JSON.stringify({
          credential,
          idToken:  credential,
          phone:    trim(extra.phone),
          bio:      trim(extra.bio),
          avatar:   trim(extra.avatar),
        }),
      });

      if (data?.requiresEmailVerification || data?.data?.requiresEmailVerification) {
        persistPendingVerification(data?.data?.email || "", {
          fullName: data?.data?.fullName || "", purpose: "login", provider: "google",
          expiresAt: getCodeExpiryTimestamp(data),
        });
        openModal("verify", { skipNotLoggedInMessage: true });
        return { requiresVerification: true, email: data?.data?.email || "" };
      }

      const { token: sessionToken, isNewUser, requiresProfile } = extractPayload(data);

      if (isNewUser || requiresProfile) {
        const decoded = decodeJWT(credential);
        const pending = {
          credential,
          email:   decoded?.email   || "",
          name:    decoded?.name    || "",
          picture: decoded?.picture || "",
          sub:     decoded?.sub     || "",
        };
        setGoogleUser(pending);
        store.setJSON(KEYS.GOOGLE_PENDING, pending);
        setModalView("register");
        openModal("register", { skipNotLoggedInMessage: true });
        return { ...data, requiresProfile: true, googleUser: pending };
      }

      // Never close the modal or imply success unless the backend actually
      // issued a session token. Google identity alone is not an Altuvera login.
      if (!sessionToken) {
        throw new Error(
          "Google verified your identity, but Altuvera did not create a login session. Please try again or sign in with email.",
        );
      }

      saveAuth(data, { persist: persistSession });
      closeModal();
      triggerCongratulation("login");
      return data;
    } catch (err) {
      const errData = err?.data || {};
      if (
        errData?.code === "REVERIFICATION_REQUIRED" ||
        errData?.requiresReVerification
      ) {
        const revEmail = errData.email || "";
        persistPendingVerification(revEmail, { purpose: "reverification", provider: "google" });
        setSocialAuthError("");
        setRequiresLoginVerification(true);
        setModalView("verify");
        return { requiresVerification: true };
      }

      const msg = err?.message || "Google sign-in failed.";
      const decoded = decodeJWT(credential);
      const providerProfile = errData?.data?.profile || errData?.profile || {};
      const profile = {
        provider: "google",
        email: trim(providerProfile.email || decoded?.email),
        fullName: trim(providerProfile.fullName || providerProfile.name || decoded?.name),
        avatar: trim(providerProfile.avatar || providerProfile.picture || decoded?.picture),
        code: errData?.code || "",
      };
      setSocialAuthProfile(profile);
      const needsSignup = ["ACCOUNT_REMOVED", "ACCOUNT_RECREATE_REQUIRED", "ACCOUNT_NOT_FOUND"].includes(errData?.code);
      if (needsSignup && profile.email) {
        const pending = {
          credential,
          email: profile.email,
          name: profile.fullName,
          picture: profile.avatar,
          sub: decoded?.sub || "",
        };
        setGoogleUser(pending);
        store.remove(KEYS.GOOGLE_PENDING);
        setModalView("register");
        openModal("register", { skipNotLoggedInMessage: true });
      } else {
        setGoogleUser(null);
        store.remove(KEYS.GOOGLE_PENDING);
        setModalView("login");
        openModal("login", { skipNotLoggedInMessage: true });
      }
      setSocialAuthError(msg);
      const surfaced = new Error(msg);
      surfaced.code = errData?.code || "";
      surfaced.data = errData;
      throw surfaced;
    } finally {
      setGoogleLoading(false);
    }
  }, [authFetch, clearPendingVerification, closeModal, openModal, persistPendingVerification, persistSession, saveAuth, triggerCongratulation, setModalView]);

  // ============================================================================
  // One Tap Response Handler
  // ============================================================================

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) { setGoogleLoading(false); return; }

    if (googleCbRef.current) {
      const cb = googleCbRef.current;
      googleCbRef.current = null;
      cb(response.credential);
      return;
    }

    try {
      setGoogleLoading(true);
      await googleSignIn(response.credential);
    } catch (err) {
      const msg = err?.message || "";
      if (!isDismissalError(msg))
        setSocialAuthError(msg || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }, [googleSignIn]);

  // ============================================================================
  // Google SDK Init — FedCM opt-in
  // ============================================================================

  const initGoogleSdk = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || googleInitRef.current) return;

    const setup = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id:             GOOGLE_CLIENT_ID,
          callback:              handleGoogleResponse,
          auto_select:           false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt:  true,
          itp_support:           true,
        });
        setGoogleLoaded(true);
        googleInitRef.current = true;
      } catch (err) {
        console.warn("[Auth] Google SDK init error:", err.message);
        setGoogleLoaded(false);
      }
    };

    if (window.google?.accounts) { setup(); return; }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.dataset.loaded === "true"
        ? setup()
        : existing.addEventListener("load", setup, { once: true });
      return;
    }

    const s   = document.createElement("script");
    s.src     = "https://accounts.google.com/gsi/client";
    s.async   = true;
    s.defer   = true;
    s.onload  = () => { s.dataset.loaded = "true"; setup(); };
    s.onerror = () => {
      console.warn("[Auth] Failed to load Google SDK.");
      setGoogleLoaded(false);
    };
    document.head.appendChild(s);
  }, [handleGoogleResponse]);

  // ============================================================================
  // promptGoogleAuth — One Tap → Popup fallback (COOP-safe)
  // ============================================================================

  const promptGoogleAuth = useCallback(
    (opts = {}) =>
      new Promise((resolve, reject) => {
        if (!GOOGLE_CLIENT_ID)
          return reject(new Error("Google Sign-In is not configured."));

        setSocialAuthError("");
        setSocialAuthProfile(null);
        setGoogleLoading(true);

        let settled = false;
        const settle = (fn, val) => {
          if (settled) return;
          settled = true;
          setGoogleLoading(false);
          googleCbRef.current = null;
          fn(val);
        };

        // ── Button render path ──────────────────────────────────────────
        if (opts.container) {
          if (!googleLoaded || !window.google?.accounts?.id) {
            return settle(reject, new Error("Google Sign-In is loading. Please try again."));
          }
          try {
            opts.container.innerHTML = "";
            window.google.accounts.id.renderButton(opts.container, {
              theme:          "outline",
              size:           "large",
              shape:          "pill",
              width:          opts.buttonWidth || 320,
              text:           opts.mode === "signup" ? "signup_with" : "signin_with",
              logo_alignment: "left",
            });
            settled = true;
            setGoogleLoading(false);
            return resolve({ buttonRendered: true });
          } catch (err) {
            return settle(reject, err);
          }
        }

        // ── Helper: run popup fallback ──────────────────────────────────
        const runPopup = async (reason) => {
          if (settled) return;
          if (import.meta.env.DEV)
            console.info(`[Auth] One Tap ${reason} → popup fallback`);

          setGoogleLoading(true);
          try {
            const result = await openGooglePopup(GOOGLE_CLIENT_ID, opts.mode || "signin");

            if (result?.dismissed) return settle(resolve, result);

            const credential = result;

            if (opts.mode === "signup") {
              const decoded = decodeJWT(credential);
              const pending = {
                credential,
                email:   decoded?.email   || "",
                name:    decoded?.name    || "",
                picture: decoded?.picture || "",
                sub:     decoded?.sub     || "",
              };
              setGoogleUser(pending);
              store.setJSON(KEYS.GOOGLE_PENDING, pending);
              return settle(resolve, pending);
            }

            const authResult = await googleSignIn(credential);
            settle(resolve, authResult);
          } catch (err) {
            const msg = err?.message || "";
            if (isDismissalError(msg))
              return settle(resolve, { dismissed: true, reason: "popup_closed" });
            settle(reject, err);
          }
        };

        // ── Skip One Tap for explicit button clicks ──────────────────────
        if (opts.skipOneTap) {
          runPopup("skip_one_tap");
          return;
        }

        // ── Try One Tap first ────────────────────────────────────────────
        if (!googleLoaded || !window.google?.accounts?.id) {
          runPopup("sdk_not_ready");
          return;
        }

        const oneTapTimeout = setTimeout(() => {
          googleCbRef.current = null;
          if (opts.autoPrompt) {
            settle(resolve, { dismissed: true, reason: "one_tap_timeout" });
            return;
          }
          runPopup("timeout");
        }, 8_000);

        googleCbRef.current = async (credential) => {
          clearTimeout(oneTapTimeout);
          try {
            let result;
            if (opts.mode === "signup") {
              const decoded = decodeJWT(credential);
              result = {
                credential,
                email:   decoded?.email   || "",
                name:    decoded?.name    || "",
                picture: decoded?.picture || "",
                sub:     decoded?.sub     || "",
              };
              setGoogleUser(result);
              store.setJSON(KEYS.GOOGLE_PENDING, result);
            } else {
              result = await googleSignIn(credential);
            }
            settle(resolve, result);
          } catch (err) {
            settle(reject, err);
          }
        };

        try {
          window.google.accounts.id.prompt((notification) => {
            const outcome = classifyOneTapNotification(notification);
            if (outcome === "dismissed" || outcome === "unavailable") {
              clearTimeout(oneTapTimeout);
              googleCbRef.current = null;
              if (opts.autoPrompt) {
                settle(resolve, { dismissed: true, reason: outcome });
                return;
              }
              runPopup(outcome);
            }
          });
        } catch {
          clearTimeout(oneTapTimeout);
          googleCbRef.current = null;
          if (opts.autoPrompt) {
            settle(resolve, { dismissed: true, reason: "one_tap_error" });
            return;
          }
          runPopup("one_tap_error");
        }
      }),
    [googleLoaded, googleSignIn],
  );

  // ============================================================================
  // Complete Google Sign-Up
  // ============================================================================

  const completeGoogleSignUp = useCallback(async (profileData = {}) => {
    const pending = googleUser || store.getJSON(KEYS.GOOGLE_PENDING);
    if (!pending?.credential) {
      throw new Error(
        "Google authentication required. Please sign in with Google first.",
      );
    }

    const fullName = trim(profileData?.fullName || pending.name);
    const avatar   = trim(profileData?.avatar   || pending.picture);
    pendingRef.current = { email: pending.email, fullName, avatar };

    let data;
    try {
      data = await authFetch("/users/google/signup-complete", {
        method: "POST",
        body:   JSON.stringify({
          credential: pending.credential,
          idToken:    pending.credential,
          fullName,
          phone:      trim(profileData?.phone),
          bio:        trim(profileData?.bio),
          avatar,
          role:      trim(profileData?.role) || "user",
          dateOfBirth: trim(profileData?.dateOfBirth),
          nationality: trim(profileData?.nationality),
          residenceCountry: trim(profileData?.residenceCountry),
          preferredLanguage: trim(profileData?.preferredLanguage),
          profession: trim(profileData?.profession),
          travelStyles: Array.isArray(profileData?.travelStyles) ? profileData.travelStyles : [],
        }),
      });
    } catch (err) {
      const errData = err?.data || {};
      if (
        errData?.code === "REVERIFICATION_REQUIRED" ||
        errData?.requiresReVerification
      ) {
        persistPendingVerification(errData.email || pending.email, { purpose: "reverification", provider: "google" });
        setRequiresLoginVerification(true);
        setModalView("verify");
        pendingRef.current = null;
        return { requiresVerification: true };
      }
      pendingRef.current = null;
      throw err;
    }

    if (data?.requiresEmailVerification || data?.data?.requiresEmailVerification) {
      persistPendingVerification(data?.data?.email || pending.email, {
        fullName, purpose: "signup", provider: "google",
        expiresAt: getCodeExpiryTimestamp(data),
      });
      openModal("verify", { skipNotLoggedInMessage: true });
      pendingRef.current = null;
      setGoogleUser(null);
      store.remove(KEYS.GOOGLE_PENDING);
      return { requiresVerification: true, email: data?.data?.email || pending.email };
    }

    const extracted = extractPayload(data);

    if (extracted.requiresProfile && !extracted.token) {
      throw new Error(
        "Account setup incomplete. Please ensure all required fields are filled.",
      );
    }

    saveAuth(data, { persist: persistSession });
    closeModal();
    triggerCongratulation("signup");

    return data;
  }, [authFetch, clearPendingVerification, closeModal, googleUser, persistPendingVerification, persistSession, saveAuth, triggerCongratulation]);

  const clearGooglePending = useCallback(() => {
    setGoogleUser(null);
    store.remove(KEYS.GOOGLE_PENDING);
  }, []);

  const clearSocialAuthError = useCallback(() => { setSocialAuthError(""); setSocialAuthProfile(null); }, []);

  // ============================================================================
  // GitHub Auth
  // ============================================================================

  const githubSignIn = useCallback(async (code, profileData = {}) => {
    if (!code) throw new Error("GitHub authorization code is required.");
    setGithubLoading(true);
    setSocialAuthError("");
    setSocialAuthProfile(null);

    try {
      const data = await authFetch("/users/github", {
        method: "POST",
        body:   JSON.stringify({
          code,
          mode: profileData?.mode === "signup" ? "signup" : "signin",
          phone: trim(profileData?.phone),
          bio:   trim(profileData?.bio),
        }),
      });

      if (data?.requiresEmailVerification || data?.data?.requiresEmailVerification) {
        persistPendingVerification(data?.data?.email || "", {
          fullName: data?.data?.fullName || "", purpose: "login", provider: "github",
          expiresAt: getCodeExpiryTimestamp(data),
        });
        openModal("verify", { skipNotLoggedInMessage: true });
        return { requiresVerification: true, email: data?.data?.email || "" };
      }

      const { token: tok } = extractPayload(data);
      if (!tok)
        throw new Error("GitHub authentication did not return a valid session.");

      saveAuth(data, { persist: persistSession });
      closeModal();
      triggerCongratulation("login");
      return data;
    } catch (err) {
      const errData = err?.data || {};
      if (
        errData?.code === "REVERIFICATION_REQUIRED" ||
        errData?.requiresReVerification
      ) {
        const revEmail = errData.email || "";
        persistPendingVerification(revEmail, { purpose: "reverification", provider: "github" });
        setSocialAuthError("");
        setRequiresLoginVerification(true);
        setModalView("verify");
        return { requiresVerification: true };
      }

      const msg = err?.message || "GitHub sign-in failed.";
      const providerProfile = errData?.data?.profile || errData?.profile || {};
      if (providerProfile.email) {
        setSocialAuthProfile({
          provider: "github",
          email: trim(providerProfile.email),
          fullName: trim(providerProfile.fullName || providerProfile.name),
          avatar: trim(providerProfile.avatar || providerProfile.picture),
          code: errData?.code || "",
        });
      }
      setSocialAuthError(msg);
      const surfaced = new Error(msg);
      surfaced.code = errData?.code || "";
      surfaced.data = errData;
      throw surfaced;
    } finally {
      setGithubLoading(false);
    }
  }, [authFetch, clearPendingVerification, closeModal, openModal, persistPendingVerification, persistSession, saveAuth, triggerCongratulation]);

  const startGithubAuth = useCallback((mode = "signin") => {
    if (!GITHUB_CLIENT_ID) {
      const msg = import.meta.env.DEV
        ? "GitHub Sign-In is not configured. Add VITE_GITHUB_CLIENT_ID to your .env.local file."
        : "GitHub Sign-In is temporarily unavailable.";
      setSocialAuthError(msg);
      throw new Error(msg);
    }

    setSocialAuthError("");
    setSocialAuthProfile(null);
    const redirectUri = resolveGithubRedirectUri();
    const state       = randomState();

    sessionStorage.setItem(KEYS.GITHUB_STATE,  state);
    sessionStorage.setItem(KEYS.GITHUB_INTENT, mode);

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id",    GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope",        GITHUB_SCOPE);
    url.searchParams.set("state",        state);
    url.searchParams.set("allow_signup", "true");

    window.location.assign(url.toString());
  }, []);

  const startFacebookAuth = useCallback(() => {
    setSocialAuthError("");
    setSocialAuthProfile(null);
    setFacebookLoading(true);
    const apiRoot = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const endpoint = apiRoot + "/users/facebook/signin";
    window.location.assign(endpoint);
  }, []);

  const consumeFacebookCallback = useCallback(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/auth/facebook/callback") return;

    const url = new URL(window.location.href);
    const emailOtpRequired = url.searchParams.get("emailOtpRequired");
    const email = String(url.searchParams.get("email") || "").trim();
    const fullName = String(url.searchParams.get("fullName") || "").trim();
    const expiresAt = Number(url.searchParams.get("expiresAt"));
    const errorCode = url.searchParams.get("error") || "";

    ["emailOtpRequired", "email", "fullName", "provider", "expiresAt", "error"]
      .forEach((key) => url.searchParams.delete(key));
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

    setFacebookLoading(false);
    if (emailOtpRequired === "1" && email) {
      persistPendingVerification(email, {
        purpose: "login",
        provider: "facebook",
        fullName,
        expiresAt: Number.isFinite(expiresAt) && expiresAt > Date.now()
          ? expiresAt
          : Date.now() + PENDING_VERIFICATION_TTL_MS,
      });
      setSocialAuthError("");
      setSocialAuthProfile({ provider: "facebook", email, fullName });
      setModalView("verify");
      openModal("verify", { skipNotLoggedInMessage: true });
      return;
    }

    const messages = {
      facebook_cancelled: "Facebook sign-in was cancelled. You can choose another method.",
      facebook_not_configured: "Facebook sign-in is not configured yet. Altuvera needs its Meta app credentials first.",
      facebook_email_required: "Facebook did not return an email address. Grant the email permission and use a Facebook account with a confirmed email.",
      facebook_state_invalid: "Facebook sign-in could not be verified securely. Please try again.",
      facebook_token_failed: "Facebook could not complete authorization. Please try again.",
      verification_rate_limited: "A verification code was recently sent. Wait for the current code or try again when the resend limit resets.",
      account_removed: "Your previous Altuvera account was removed. Contact Altuvera support if you need to recreate it.",
      account_recreate_required: "We couldn't find an active Altuvera account. Choose account creation to continue.",
      account_not_found: "We couldn't find an Altuvera account for this Facebook identity.",
      account_deactivated: "This Altuvera account is currently deactivated. Contact Altuvera support.",
    };
    setSocialAuthProfile(null);
    setSocialAuthError(messages[errorCode] || (errorCode ? "Facebook sign-in could not be completed. Please try again." : ""));
    setModalView("login");
    openModal("login", { skipNotLoggedInMessage: true });
  }, [openModal, persistPendingVerification, setModalView]);

  const consumeGithubCallback = useCallback(async () => {
    if (typeof window === "undefined" || window.location.pathname !== "/auth/github/callback") return;
    const url      = new URL(window.location.href);
    const code     = url.searchParams.get("code");
    const state    = url.searchParams.get("state");
    const oauthErr = url.searchParams.get("error");
    const errDesc  = url.searchParams.get("error_description");
    const provider = url.searchParams.get("auth_provider");
    const emailOtpRequired = url.searchParams.get("emailOtpRequired");
    const emailOtpAddress = url.searchParams.get("email");
    const emailOtpFullName = url.searchParams.get("fullName") || "";
    const emailOtpExpiry = Number(url.searchParams.get("expiresAt"));

    if (emailOtpRequired === "1" && emailOtpAddress) {
      // The backend has ALREADY sent the OTP before redirecting here. Never call
      // /users/login again: that would send a second code and can invalidate the
      // first one. Persist the original challenge synchronously before React can
      // render the callback page, so its redirect guard sees the pending OTP.
      [
        "code", "state", "error", "error_description", "auth_provider",
        "emailOtpRequired", "email", "fullName", "provider", "expiresAt",
      ].forEach((p) => url.searchParams.delete(p));
      window.history.replaceState(
        {}, document.title,
        `${url.pathname}${url.search}${url.hash}`,
      );

      persistPendingVerification(emailOtpAddress, {
        purpose: "login",
        provider: "github",
        fullName: emailOtpFullName,
        expiresAt: Number.isFinite(emailOtpExpiry) && emailOtpExpiry > Date.now()
          ? emailOtpExpiry
          : Date.now() + PENDING_VERIFICATION_TTL_MS,
      });
      setSocialAuthError("");
      setModalView("verify");
      openModal("verify", { skipNotLoggedInMessage: true });
      return;
    }
    if (!code && !oauthErr) return;
    if (provider && provider !== "github") return;

    const expectedState = sessionStorage.getItem(KEYS.GITHUB_STATE);
    const githubIntent = sessionStorage.getItem(KEYS.GITHUB_INTENT) || "signin";

    // Clean URL immediately
    const clean = new URL(window.location.href);
    ["code", "state", "error", "error_description", "auth_provider"]
      .forEach((p) => clean.searchParams.delete(p));
    window.history.replaceState(
      {}, document.title,
      `${clean.pathname}${clean.search}${clean.hash}`,
    );

    setGithubLoading(true);
    setSocialAuthError("");

    try {
      if (oauthErr) {
        const oauthMessages = {
          account_removed: "Your previous Altuvera account was removed. You can create a fresh account using this same email address.",
          account_recreate_required: "We couldn't find an active Altuvera account for these details. Create an account to continue.",
          account_not_found: "We couldn't find an Altuvera account for this GitHub identity. Create an account to continue.",
          account_deactivated: "This Altuvera account is currently deactivated. Contact Altuvera support if you need help restoring access.",
          verification_rate_limited: "A verification code was recently sent. Wait for the current code or try again when the resend limit resets.",
          github_auth_failed: "GitHub could not start sign-in. Please try again.",
          github_token_failed: "GitHub did not complete authorization. Please try again.",
          github_profile_failed: "Altuvera could not retrieve the verified GitHub profile details needed to continue.",
        };
        throw new Error(oauthMessages[oauthErr] || (errDesc ? decodeURIComponent(errDesc) : "GitHub sign-in was cancelled."));
      }
      if (!code || !state || !expectedState || expectedState !== state) {
        throw new Error("GitHub sign-in could not be verified. Please try again.");
      }
      await githubSignIn(code, { mode: githubIntent });
    } catch (err) {
      const callbackCode = err?.code || err?.data?.code || (
        ["account_removed", "account_recreate_required", "account_not_found"].includes(oauthErr)
          ? oauthErr.toUpperCase()
          : ""
      );
      const profile = err?.data?.data?.profile || err?.data?.profile || null;
      if (profile?.email) {
        setSocialAuthProfile({
          provider: "github",
          email: trim(profile.email),
          fullName: trim(profile.fullName || profile.name),
          avatar: trim(profile.avatar || profile.picture),
          code: callbackCode,
        });
      }
      setSocialAuthError(err?.message || "GitHub sign-in failed.");
      const needsSignup = ["ACCOUNT_REMOVED", "ACCOUNT_RECREATE_REQUIRED", "ACCOUNT_NOT_FOUND"].includes(callbackCode);
      setModalView(needsSignup ? "register" : "login");
      openModal(needsSignup ? "register" : "login", { skipNotLoggedInMessage: true });
    } finally {
      sessionStorage.removeItem(KEYS.GITHUB_STATE);
      sessionStorage.removeItem(KEYS.GITHUB_INTENT);
      setGithubLoading(false);
    }
  }, [githubSignIn, openModal, persistPendingVerification, setModalView]);

  // ============================================================================
  // Profile Management
  // ============================================================================

  const updateProfile = useCallback(async (updates) => {
    const data = await authFetch("/users/profile", {
      method: "PUT",
      body:   JSON.stringify(updates),
    });
    const raw  = data?.data?.user || data?.data || data?.user || data;
    const norm = normalizeUser(
      { ...(user || {}), ...(raw || {}) },
      { cache: getCache() },
    );
    if (norm) { setUser(norm); cacheProfile(norm); }
    return data;
  }, [authFetch, cacheProfile, getCache, user]);

  const uploadAvatar = useCallback(async (file) => {
    if (!(file instanceof File))
      throw new Error("Please select a valid image file.");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("Image must be 10MB or less.");

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
    if (!allowed.includes(file.type))
      throw new Error("Please upload a JPEG, PNG, GIF, WebP, or AVIF image.");

    const form = new FormData();
    form.append("image", file);
    form.append("type",  "avatar");

    const data      = await authFetch("/uploads/image/avatar", { method: "POST", body: form });
    const p         = data?.data || data || {};
    const avatarUrl = p.url || p.imageUrl || p.avatar || p.avatarUrl;
    if (!avatarUrl)
      throw new Error("Upload succeeded but no image URL was returned.");

    // Persist the new URL first. Never replace the visible/cached avatar until
    // the database confirms the update; if persistence fails, remove the newly
    // uploaded orphan so the old profile photo remains intact.
    try {
      await updateProfile({ avatar: avatarUrl });
    } catch (error) {
      const publicId = p.publicId || p.public_id;
      if (publicId) {
        await authFetch("/uploads/asset/" + encodeURIComponent(publicId), { method: "DELETE" }).catch(() => {});
      }
      throw error;
    }

    return avatarUrl;
  }, [authFetch, updateProfile]);

  // ============================================================================
  // Logout & Account
  // ============================================================================

  const logout = useCallback(async () => {
    try { await authFetch("/users/logout", { method: "POST" }); }
    catch { /* always clear locally */ }
    finally { clearAuth(); setPendingEmail(""); closeModal(); }
  }, [authFetch, clearAuth, closeModal]);

  const deleteAccount = useCallback(async () => {
    const data = await authFetch("/users/me", { method: "DELETE" });
    clearAuth(); closeModal();
    return data;
  }, [authFetch, clearAuth, closeModal]);

  const refreshAuthToken = useCallback(async () => {
    const rt = store.get(KEYS.REFRESH);
    if (!rt) return false;
    try {
      const data = await authFetch("/users/refresh-token", {
        method: "POST",
        body:   JSON.stringify({ refreshToken: rt }),
      });
      const { token: tok, refreshToken: ref } = extractPayload(data);
      if (tok) { store.set(KEYS.TOKEN, tok, persistSession); setToken(tok); }
      if (ref)   store.set(KEYS.REFRESH, ref, persistSession);
      return true;
    } catch { return false; }
  }, [authFetch, persistSession]);

  const resetPassword  = useCallback(async () => {
    throw new Error("Please use email OTP or social login.");
  }, []);
  const changePassword = useCallback(async () => {
    throw new Error("Please use email OTP or social login.");
  }, []);

  // ============================================================================
  // Bootstrap
  // ============================================================================

  useEffect(() => { fetchUser(); },            [fetchUser]);
  useEffect(() => { initGoogleSdk(); },        [initGoogleSdk]);
  useEffect(() => { consumeGithubCallback(); }, [consumeGithubCallback]);
  useEffect(() => { consumeFacebookCallback(); }, [consumeFacebookCallback]);

  // Offer Google's native One Tap prompt without forcing a login modal or
  // opening a popup. A visitor who dismisses it can continue browsing normally.
  useEffect(() => {
    if (authLoading || isAuthenticated || isModalOpen || !googleLoaded) return;
    try {
      if (sessionStorage.getItem("altuvera_google_one_tap_prompted") === "true") return;
      sessionStorage.setItem("altuvera_google_one_tap_prompted", "true");
    } catch { /* session storage may be unavailable */ }

    const promptTimer = setTimeout(() => {
      if (!isAuthenticated && !isModalOpen) {
        promptGoogleAuth({ mode: "signin", autoPrompt: true }).catch((err) => {
          if (import.meta.env.DEV) console.info("[Auth] One Tap unavailable:", err?.message || err);
        });
      }
    }, 900);

    return () => clearTimeout(promptTimer);
  }, [authLoading, googleLoaded, isAuthenticated, isModalOpen, promptGoogleAuth]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo(() => ({
    user, token, isAuthenticated, authLoading,
    isModalOpen, modalView, pendingEmail, pendingFactorChallenge, pendingFactorMethods,
    googleUser, googleLoaded, googleLoading, githubLoading, facebookLoading,
    hasGooglePending, socialAuthError, socialAuthProfile, persistSession,
    showCongratulation, congratulationType, showNotLoggedInMessage,
    requiresLoginVerification, dismissCongratulation, pendingVerification,
    openModal, closeModal, setModalView, persistPendingVerification, clearPendingVerification,
    login, register, verifyCode, beginFactorChallenge, cancelPendingFactorChallenge, verifyLoginFactor, verifyLoginPasskey, loginWithSecurityCode, startPasskeyLogin, resendCode, checkEmail,
    googleSignIn, completeGoogleSignUp, promptGoogleAuth,
    clearGooglePending, clearSocialAuthError,
    githubSignIn, startGithubAuth, startFacebookAuth,
    updateProfile, uploadAvatar,
    setSessionPreference, refreshAuthToken,
    logout, deleteAccount, resetPassword, changePassword,
    fetchUser, authFetch, saveAuth,
  }), [
    user, token, isAuthenticated, authLoading,
    isModalOpen, modalView, pendingEmail, pendingFactorChallenge, pendingFactorMethods,
    googleUser, googleLoaded, googleLoading, githubLoading, facebookLoading,
    hasGooglePending, socialAuthError, socialAuthProfile, persistSession,
    showCongratulation, congratulationType, showNotLoggedInMessage,
    requiresLoginVerification, dismissCongratulation,
    openModal, closeModal, setModalView,
    login, register, verifyCode, beginFactorChallenge, cancelPendingFactorChallenge, verifyLoginFactor, verifyLoginPasskey, loginWithSecurityCode, startPasskeyLogin, resendCode, checkEmail,
    googleSignIn, completeGoogleSignUp, promptGoogleAuth,
    clearGooglePending, clearSocialAuthError,
    githubSignIn, startGithubAuth, startFacebookAuth,
    updateProfile, uploadAvatar,
    setSessionPreference, refreshAuthToken,
    logout, deleteAccount, resetPassword, changePassword,
    fetchUser, authFetch, saveAuth,
  ]);

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within a UserAuthProvider");
  return ctx;
}

export default UserAuthContext;