// ============================================================================
// UserAuthContext.jsx
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

// ============================================================================
// Configuration
// ============================================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_SCOPE =
  import.meta.env.VITE_GITHUB_SCOPE || "read:user user:email";

const resolveGithubRedirectUri = () => {
  if (import.meta.env.VITE_GITHUB_REDIRECT_URI) {
    return import.meta.env.VITE_GITHUB_REDIRECT_URI;
  }
  const path =
    import.meta.env.VITE_GITHUB_REDIRECT_PATH || "/auth/github/callback";
  return `${window.location.origin}${path}`;
};

if (import.meta.env.DEV) {
  const required = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
    VITE_GITHUB_REDIRECT_URI: import.meta.env.VITE_GITHUB_REDIRECT_URI,
  };
  Object.entries(required).forEach(([k, v]) => {
    if (!v) console.warn(`[Auth] Missing env var: ${k}`);
  });
}

// ============================================================================
// Storage Keys
// ============================================================================

const KEYS = {
  TOKEN: "altuvera_auth_token",
  REFRESH: "altuvera_refresh_token",
  SESSION_PREF: "altuvera_persist_session",
  PROFILE_CACHE: "altuvera_profile_cache",
  GOOGLE_PENDING: "altuvera_google_pending",
  GITHUB_STATE: "altuvera_github_state",
  GITHUB_INTENT: "altuvera_github_intent",
  LOGIN_COUNTER: "altuvera_login_counter",
  LAST_LOGOUT: "altuvera_last_logout",
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
    } catch {
      return null;
    }
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
    } catch {
      /* storage unavailable */
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  getJSON: (key) => {
    try {
      const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setJSON: (key, val, useSession = true) => {
    try {
      (useSession ? sessionStorage : localStorage).setItem(
        key,
        JSON.stringify(val),
      );
    } catch {
      /* storage full */
    }
  },
  getPersist: () => {
    try {
      const v = localStorage.getItem(KEYS.SESSION_PREF);
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  },
  getLoginCounter: () => {
    try {
      const saved = localStorage.getItem(KEYS.LOGIN_COUNTER);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  },
  setLoginCounter: (count) => {
    try {
      localStorage.setItem(KEYS.LOGIN_COUNTER, String(count));
    } catch {
      /* ignore */
    }
  },
  clearAuth: () => {
    [KEYS.TOKEN, KEYS.REFRESH].forEach((k) => {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
    [KEYS.GOOGLE_PENDING, KEYS.GITHUB_STATE, KEYS.GITHUB_INTENT].forEach(
      (k) => {
        try {
          sessionStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      },
    );
  },
};

// ============================================================================
// Pure Utilities
// ============================================================================

const trim = (v) => (typeof v === "string" ? v.trim() : "");

const pick = (...vals) => {
  for (const v of vals) {
    const t = trim(v);
    if (t) return t;
  }
  return "";
};

const normalizeUser = (
  raw,
  { fallbackEmail = "", fallbackName = "", fallbackAvatar = "", cache = {} } = {},
) => {
  if (!raw || typeof raw !== "object") return null;

  const email = pick(raw.email, raw.userEmail, raw.user_email, fallbackEmail);
  const cached = email ? (cache[email.toLowerCase()] ?? null) : null;
  const fullName = pick(
    raw.fullName,
    raw.full_name,
    raw.name,
    raw.displayName,
    raw.username,
    cached?.fullName,
    fallbackName,
    email ? email.split("@")[0] : "",
    "Traveler",
  );
  const avatar = pick(
    raw.avatar,
    raw.avatarUrl,
    raw.avatar_url,
    raw.picture,
    raw.photoURL,
    cached?.avatar,
    fallbackAvatar,
  );

  return {
    id: raw.id || raw._id || raw.userId || null,
    email,
    fullName,
    name: fullName,
    avatar: avatar || null,
    phone: pick(raw.phone, raw.phoneNumber, raw.phone_number),
    bio: pick(raw.bio, raw.biography, raw.about),
    role: pick(raw.role, raw.userRole, "user"),
    authProvider: pick(raw.authProvider, raw.auth_provider, raw.provider, "email"),
    isVerified: Boolean(
      raw.isVerified || raw.is_verified || raw.emailVerified || raw.verified,
    ),
    emailVerified: Boolean(
      raw.emailVerified || raw.email_verified || raw.isVerified,
    ),
    isActive:
      typeof raw.isActive === "boolean"
        ? raw.isActive
        : typeof raw.is_active === "boolean"
          ? raw.is_active
          : true,
    preferences:
      raw.preferences && typeof raw.preferences === "object"
        ? raw.preferences
        : {},
    lastLogin: raw.lastLogin || raw.last_login || null,
    createdAt: raw.createdAt || raw.created_at || null,
    // Include subscription status if provided by backend
    subscribed: Boolean(raw.subscribed ?? raw.isSubscribed ?? false),
  };
};

const extractPayload = (data) => {
  const d = data?.data || data || {};
  return {
    token: d.token || d.accessToken || d.access_token || data?.token || null,
    refreshToken: d.refreshToken || d.refresh_token || data?.refreshToken || null,
    user: d.user || data?.user || d || null,
    isNewUser: Boolean(d.isNewUser || d.is_new_user || data?.isNewUser),
    requiresProfile: Boolean(
      d.requiresProfile || d.requires_profile || data?.requiresProfile,
    ),
  };
};

const decodeJWT = (credential) => {
  if (!credential) return null;
  try {
    const b64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
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
  } catch {
    return {};
  }
};

const isNewUserCheck = (userData) => {
  if (!userData?.createdAt || !userData?.updatedAt) return false;
  try {
    return (
      Math.abs(
        new Date(userData.createdAt).getTime() -
          new Date(userData.updatedAt).getTime(),
      ) < 1000
    );
  } catch {
    return false;
  }
};

// ============================================================================
// Provider
// ============================================================================

export function UserAuthProvider({ children }) {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => store.get(KEYS.TOKEN));
  const [authLoading, setAuthLoading] = useState(true);
  const [persistSession, setPersistSession] = useState(() => store.getPersist());

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");

  // ── Re-verification state ────────────────────────────────────────────────────
  const [requiresLoginVerification, setRequiresLoginVerification] = useState(false);
  const [pendingSocialAuth, setPendingSocialAuth] = useState(null);
  const [loginCounter, setLoginCounter] = useState(() => store.getLoginCounter());

  // ── Congratulation / notification state ─────────────────────────────────────
  const [showCongratulation, setShowCongratulation] = useState(false);
  const [congratulationType, setCongratulationType] = useState("");
  const [showNotLoggedInMessage, setShowNotLoggedInMessage] = useState(false);

  // ── Social auth state ────────────────────────────────────────────────────────
  const [googleUser, setGoogleUser] = useState(() =>
    store.getJSON(KEYS.GOOGLE_PENDING),
  );
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState("");

  // ── Refs ─────────────────────────────────────────────────────────────────────
  // ✅ All useRef calls are at top level, never inside callbacks or IIFEs
  const fetchingRef = useRef(false);
  const pendingRef = useRef(null);
  const googleInitRef = useRef(false);
  const refreshRef = useRef(null);
  const googleCbRef = useRef(null);
  const profileCacheRef = useRef(null);
  const congratTimerRef = useRef(null);
  const notLoggedInTimerRef = useRef(null);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);
  const hasGooglePending = useMemo(
    () => !!googleUser?.email && !!googleUser?.credential,
    [googleUser],
  );

  // ── Init profile cache lazily (after mount) ──────────────────────────────────
  useEffect(() => {
    if (profileCacheRef.current === null) {
      profileCacheRef.current = readProfileCache();
    }
  }, []);

  // ── Cleanup timers on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      if (congratTimerRef.current) clearTimeout(congratTimerRef.current);
      if (notLoggedInTimerRef.current) clearTimeout(notLoggedInTimerRef.current);
    };
  }, []);

  const getCache = useCallback(() => profileCacheRef.current ?? {}, []);

  // ============================================================================
  // Helpers
  // ============================================================================

  const triggerCongratulation = useCallback((type) => {
    if (congratTimerRef.current) clearTimeout(congratTimerRef.current);
    setCongratulationType(type);
    setShowCongratulation(true);
    congratTimerRef.current = setTimeout(() => {
      setShowCongratulation(false);
      congratTimerRef.current = null;
    }, 3000);
  }, []);

  // ============================================================================
  // Profile Cache
  // ============================================================================

  const cacheProfile = useCallback(
    (profile) => {
      const email = trim(profile?.email);
      if (!email) return;
      const next = {
        ...getCache(),
        [email.toLowerCase()]: {
          email,
          fullName: trim(profile?.fullName || profile?.name),
          avatar: trim(profile?.avatar),
        },
      };
      profileCacheRef.current = next;
      try {
        localStorage.setItem(KEYS.PROFILE_CACHE, JSON.stringify(next));
      } catch {
        /* storage full */
      }
    },
    [getCache],
  );

  // ============================================================================
  // Session Management
  // ============================================================================

  const clearAuth = useCallback(() => {
    store.clearAuth();
    setToken(null);
    setUser(null);
    setGoogleUser(null);
    pendingRef.current = null;
    setRequiresLoginVerification(false);
    setPendingSocialAuth(null);
    try {
      localStorage.setItem(KEYS.LAST_LOGOUT, Date.now().toString());
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setSessionPreference = useCallback(
    (persist) => {
      const next = Boolean(persist);
      setPersistSession(next);
      try {
        localStorage.setItem(KEYS.SESSION_PREF, String(next));
      } catch {
        /* ignore */
      }
      const t = token || store.get(KEYS.TOKEN);
      if (t) store.set(KEYS.TOKEN, t, next);
      const r = store.get(KEYS.REFRESH);
      if (r) store.set(KEYS.REFRESH, r, next);
    },
    [token],
  );

  const saveAuth = useCallback(
    (data, opts = {}) => {
      const { token: tok, refreshToken: ref, user: raw } = extractPayload(data);
      const persist =
        typeof opts.persist === "boolean" ? opts.persist : persistSession;

      if (tok) {
        store.set(KEYS.TOKEN, tok, persist);
        setToken(tok);
      }
      if (ref) store.set(KEYS.REFRESH, ref, persist);

      const fallback = {
        email: pendingRef.current?.email || googleUser?.email || "",
        name: pendingRef.current?.fullName || googleUser?.name || "",
        avatar: pendingRef.current?.avatar || googleUser?.picture || "",
      };

      const normalized = normalizeUser(raw, {
        fallbackEmail: fallback.email,
        fallbackName: fallback.name,
        fallbackAvatar: fallback.avatar,
        cache: getCache(),
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      pendingRef.current = null;
      setGoogleUser(null);
      store.remove(KEYS.GOOGLE_PENDING);

      return data;
    },
    [cacheProfile, getCache, googleUser, persistSession],
  );

  // ============================================================================
  // Login Counter (persist on change)
  // ============================================================================

  useEffect(() => {
    store.setLoginCounter(loginCounter);
  }, [loginCounter]);

  // ============================================================================
  // Modal
  // ============================================================================

  const openModal = useCallback((view = "login", options = {}) => {
    const { skipNotLoggedInMessage = false } = options;

    if (skipNotLoggedInMessage) {
      setModalView(view);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      return;
    }

    if (notLoggedInTimerRef.current) clearTimeout(notLoggedInTimerRef.current);
    setShowNotLoggedInMessage(true);

    notLoggedInTimerRef.current = setTimeout(() => {
      setShowNotLoggedInMessage(false);
      setModalView(view);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      notLoggedInTimerRef.current = null;
    }, 1500);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalView("login");
    setPendingEmail("");
    setSocialAuthError("");
    setGoogleUser(null);
    store.remove(KEYS.GOOGLE_PENDING);
    document.body.style.overflow = "";
  }, []);

  // ============================================================================
  // Core API Fetch
  // ============================================================================

  const authFetch = useCallback(
    async (endpoint, opts = {}) => {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

      const tok = token || store.get(KEYS.TOKEN);
      const isForm = opts.body instanceof FormData;

      const makeHeaders = (t) => ({
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...opts.headers,
      });

      let res;
      try {
        res = await fetch(url, { ...opts, headers: makeHeaders(tok) });
      } catch (networkErr) {
        throw new Error(
          "Network error. Please check your connection.",
        );
      }

      // Token refresh on 401
      if (res.status === 401 && !opts._retry) {
        const rt = store.get(KEYS.REFRESH);
        if (rt) {
          try {
            if (!refreshRef.current) {
              refreshRef.current = fetch(`${API_BASE}/users/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: rt }),
              })
                .then(async (r) => {
                  const d = await r.json().catch(() => ({}));
                  if (!r.ok) throw new Error(d?.message || "Session expired");
                  saveAuth(d, { persist: persistSession });
                  return extractPayload(d).token;
                })
                .finally(() => {
                  refreshRef.current = null;
                });
            }
            const newTok = await refreshRef.current;
            res = await fetch(url, {
              ...opts,
              _retry: true,
              headers: makeHeaders(newTok),
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

      let data = null;
      try {
        const ct = res.headers.get("content-type") || "";
        data = ct.includes("application/json")
          ? await res.json()
          : { message: await res.text() };
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 401) clearAuth();
        const msg =
          data?.message ||
          data?.error ||
          data?.data?.message ||
          `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data || {};
    },
    [clearAuth, persistSession, saveAuth, token],
  );

  // ============================================================================
  // Session Restore
  // ============================================================================

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;
    const tok = token || store.get(KEYS.TOKEN);
    if (!tok) {
      setAuthLoading(false);
      return;
    }

    fetchingRef.current = true;
    try {
      const data = await authFetch("/users/me");
      const raw = data?.data?.user || data?.data || data?.user || data;
      const normalized = normalizeUser(raw, { cache: getCache() });
      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
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
  // Email OTP Auth
  // ============================================================================

  const login = useCallback(
    async (payload) => {
      const p = typeof payload === "object" ? payload : { email: payload };
      const email = trim(p.email);
      if (!email) throw new Error("Email is required.");
      if (typeof p.persistSession === "boolean")
        setSessionPreference(p.persistSession);

      // Re-verification required after 2+ successful logins
      if (loginCounter >= 2) {
        setPendingEmail(email);
        setRequiresLoginVerification(true);
        try {
          await authFetch("/users/login", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
        } catch {
          // User can manually resend
        }
        setModalView("verify");
        return { requiresVerification: true };
      }

      const data = await authFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setPendingEmail(email);
      setModalView("verify");
      return data;
    },
    [authFetch, loginCounter, setSessionPreference],
  );

  const register = useCallback(
    async (payload) => {
      const p = typeof payload === "object" ? payload : { email: payload };
      const email = trim(p.email);
      if (!email) throw new Error("Email is required.");
      if (typeof p.persistSession === "boolean")
        setSessionPreference(p.persistSession);

      const data = await authFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          fullName: trim(p.fullName) || undefined,
          phone: trim(p.phone) || undefined,
          bio: trim(p.bio) || undefined,
        }),
      });
      setPendingEmail(email);
      setModalView("verify");
      return data;
    },
    [authFetch, setSessionPreference],
  );

  const verifyCode = useCallback(
    async (email, code) => {
      const e = trim(email || pendingEmail);
      const c = trim(String(code || ""));
      if (!e) throw new Error("Email is required.");
      if (!c) throw new Error("Verification code is required.");

      const data = await authFetch("/users/verify-code", {
        method: "POST",
        body: JSON.stringify({ email: e, code: c }),
      });

      // Handle re-verification path (social or email after 2+ logins)
      if (requiresLoginVerification) {
        if (pendingSocialAuth) {
          saveAuth(pendingSocialAuth, { persist: persistSession });
        } else {
          saveAuth(data, { persist: persistSession });
        }

        // Reset counter after successful re-verification
        setLoginCounter(0);
        setRequiresLoginVerification(false);
        setPendingSocialAuth(null);
        setPendingEmail("");
        closeModal();

        const userData = pendingSocialAuth?.user || data?.user;
        triggerCongratulation(isNewUserCheck(userData) ? "signup" : "login");
        return data;
      }

      // Normal verification flow
      saveAuth(data, { persist: persistSession });
      setPendingEmail("");
      closeModal();

      // Increment counter on successful login
      setLoginCounter((prev) => prev + 1);

      triggerCongratulation(isNewUserCheck(data?.user) ? "signup" : "login");
      return data;
    },
    [
      authFetch,
      closeModal,
      pendingEmail,
      pendingSocialAuth,
      persistSession,
      requiresLoginVerification,
      saveAuth,
      triggerCongratulation,
    ],
  );

  const resendCode = useCallback(
    async (email) => {
      const e = trim(email || pendingEmail);
      if (!e) throw new Error("Email is required.");
      return authFetch("/users/resend-code", {
        method: "POST",
        body: JSON.stringify({ email: e }),
      });
    },
    [authFetch, pendingEmail],
  );

  const checkEmail = useCallback(
    async (email) => {
      const e = trim(email);
      if (!e) return { exists: false };
      try {
        const d = await authFetch("/users/check-email", {
          method: "POST",
          body: JSON.stringify({ email: e }),
        });
        return d?.data || { exists: false };
      } catch {
        return { exists: false };
      }
    },
    [authFetch],
  );

  // ============================================================================
  // Google Auth
  // ============================================================================

  const googleSignIn = useCallback(
    async (credential, extra = {}) => {
      if (!credential) throw new Error("Google sign-in was cancelled.");
      setGoogleLoading(true);
      setSocialAuthError("");

      try {
        const decoded = decodeJWT(credential);
        const userEmail = decoded?.email || "";

        // Re-verification required
        if (loginCounter >= 2 && userEmail) {
          setPendingEmail(userEmail);
          setRequiresLoginVerification(true);
          setPendingSocialAuth({ credential, extra, userEmail });
          try {
            await authFetch("/users/login", {
              method: "POST",
              body: JSON.stringify({ email: userEmail }),
            });
          } catch {
            /* user can resend */
          }
          setModalView("verify");
          return { requiresVerification: true };
        }

        // Normal flow
        const data = await authFetch("/users/google", {
          method: "POST",
          body: JSON.stringify({
            credential,
            phone: trim(extra.phone),
            bio: trim(extra.bio),
            avatar: trim(extra.avatar),
          }),
        });

        const { isNewUser, requiresProfile } = extractPayload(data);

        if (isNewUser || requiresProfile) {
          const pending = {
            credential,
            email: decoded?.email || "",
            name: decoded?.name || "",
            picture: decoded?.picture || "",
            sub: decoded?.sub || "",
          };
          setGoogleUser(pending);
          store.setJSON(KEYS.GOOGLE_PENDING, pending);
          setModalView("register");
          return { ...data, requiresProfile: true, googleUser: pending };
        }

        saveAuth(data, { persist: persistSession });
        closeModal();
        return data;
      } catch (err) {
        const msg = err?.message || "Google sign-in failed.";
        setSocialAuthError(msg);
        throw new Error(msg);
      } finally {
        setGoogleLoading(false);
      }
    },
    [authFetch, closeModal, loginCounter, persistSession, saveAuth],
  );

  const handleGoogleResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        setSocialAuthError("Google sign-in was cancelled.");
        setGoogleLoading(false);
        return;
      }
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
        setSocialAuthError(err?.message || "Google sign-in failed.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleSignIn],
  );

  const initGoogleSdk = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || googleInitRef.current) return;

    const setup = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          itp_support: false,
        });
        setGoogleLoaded(true);
        googleInitRef.current = true;
      } catch (err) {
        console.warn("[Auth] Google SDK init error:", err.message);
      }
    };

    if (window.google?.accounts) {
      setup();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        setup();
      } else {
        existing.addEventListener("load", setup, { once: true });
      }
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      s.dataset.loaded = "true";
      setup();
    };
    s.onerror = () => {
      console.warn("[Auth] Failed to load Google SDK (check connectivity).");
      setGoogleLoaded(false);
    };
    document.head.appendChild(s);
  }, [handleGoogleResponse]);

  const promptGoogleAuth = useCallback(
    (opts = {}) =>
      new Promise((resolve, reject) => {
        if (!GOOGLE_CLIENT_ID) {
          return reject(new Error("Google Sign-In is not configured."));
        }
        if (!googleLoaded || !window.google?.accounts?.id) {
          return reject(
            new Error("Google Sign-In is loading. Please try again in a moment."),
          );
        }

        setSocialAuthError("");
        setGoogleLoading(true);

        let settled = false;
        const settle = (fn, val) => {
          if (settled) return;
          settled = true;
          setGoogleLoading(false);
          googleCbRef.current = null;
          fn(val);
        };

        if (opts.container) {
          try {
            opts.container.innerHTML = "";
            window.google.accounts.id.renderButton(opts.container, {
              theme: "outline",
              size: "large",
              shape: "pill",
              width: opts.buttonWidth || 320,
              text: opts.mode === "signup" ? "signup_with" : "signin_with",
              logo_alignment: "left",
            });
            setGoogleLoading(false);
            settled = true;
            return resolve({ buttonRendered: true });
          } catch (err) {
            return settle(reject, err);
          }
        }

        const timeout = setTimeout(
          () =>
            settle(
              reject,
              new Error("Google sign-in timed out. Please try again."),
            ),
          30_000,
        );

        googleCbRef.current = async (credential) => {
          clearTimeout(timeout);
          try {
            let result;
            if (opts.mode === "signup") {
              const decoded = decodeJWT(credential);
              result = {
                credential,
                email: decoded?.email || "",
                name: decoded?.name || "",
                picture: decoded?.picture || "",
                sub: decoded?.sub || "",
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
          window.google.accounts.id.prompt((n) => {
            if (n.isNotDisplayed() || n.isSkippedMoment()) {
              clearTimeout(timeout);
              settle(
                reject,
                new Error(
                  "Google prompt was dismissed. Please use the Google button.",
                ),
              );
            }
          });
        } catch {
          /* One Tap unavailable — button fallback handles it */
        }
      }),
    [googleLoaded, googleSignIn],
  );

  const completeGoogleSignUp = useCallback(
    async (profileData = {}) => {
      const pending = googleUser || store.getJSON(KEYS.GOOGLE_PENDING);
      if (!pending?.credential) {
        throw new Error(
          "Google authentication required. Please sign in with Google first.",
        );
      }
      const fullName = trim(profileData?.fullName || pending.name);
      const avatar = trim(profileData?.avatar || pending.picture);
      pendingRef.current = { email: pending.email, fullName, avatar };

      const data = await googleSignIn(pending.credential, {
        phone: trim(profileData?.phone),
        bio: trim(profileData?.bio),
        avatar,
      });
      const { token: tok, requiresProfile } = extractPayload(data);
      if (!tok || requiresProfile) {
        throw new Error(
          "Account setup incomplete. Please complete all required fields.",
        );
      }
      return data;
    },
    [googleSignIn, googleUser],
  );

  const clearGooglePending = useCallback(() => {
    setGoogleUser(null);
    store.remove(KEYS.GOOGLE_PENDING);
  }, []);

  const clearSocialAuthError = useCallback(() => setSocialAuthError(""), []);

  // ============================================================================
  // GitHub Auth
  // ============================================================================

  const githubSignIn = useCallback(
    async (code, profileData = {}) => {
      if (!code) throw new Error("GitHub authorization code is required.");

      setGithubLoading(true);
      setSocialAuthError("");

      try {
        const data = await authFetch("/users/github", {
          method: "POST",
          body: JSON.stringify({
            code,
            phone: trim(profileData?.phone),
            bio: trim(profileData?.bio),
          }),
        });

        const { token: tok } = extractPayload(data);
        if (!tok) {
          throw new Error(
            "GitHub authentication did not return a valid session.",
          );
        }

        // Re-verification required
        const userEmail = data?.user?.email || data?.data?.user?.email || "";
        if (loginCounter >= 2 && userEmail) {
          setPendingSocialAuth(data);
          setRequiresLoginVerification(true);
          setPendingEmail(userEmail);
          try {
            await authFetch("/users/login", {
              method: "POST",
              body: JSON.stringify({ email: userEmail }),
            });
          } catch {
            /* user can resend */
          }
          setModalView("verify");
          return { requiresVerification: true };
        }

        // Normal flow
        saveAuth(data, { persist: persistSession });
        setLoginCounter((prev) => prev + 1);
        closeModal();
        return data;
      } catch (err) {
        const msg = err?.message || "GitHub sign-in failed.";
        setSocialAuthError(msg);
        throw new Error(msg);
      } finally {
        setGithubLoading(false);
      }
    },
    [authFetch, closeModal, loginCounter, persistSession, saveAuth],
  );

  const startGithubAuth = useCallback((mode = "signin") => {
    if (!GITHUB_CLIENT_ID) {
      const msg = import.meta.env.DEV
        ? "GitHub Sign-In is not configured. Add VITE_GITHUB_CLIENT_ID to your .env.local file and restart the dev server."
        : "GitHub Sign-In is temporarily unavailable. Please use Google or email sign-in.";
      console.error("[GitHub Auth] VITE_GITHUB_CLIENT_ID is not set.", {
        MODE: import.meta.env.MODE,
        VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
      });
      setSocialAuthError(msg);
      throw new Error(msg);
    }

    setSocialAuthError("");

    const redirectUri = resolveGithubRedirectUri();
    const state = randomState();

    sessionStorage.setItem(KEYS.GITHUB_STATE, state);
    sessionStorage.setItem(KEYS.GITHUB_INTENT, mode);

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", GITHUB_SCOPE);
    url.searchParams.set("state", state);
    url.searchParams.set("allow_signup", "true");

    if (import.meta.env.DEV) {
      console.log("[GitHub Auth]", {
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: GITHUB_SCOPE,
        url: url.toString(),
      });
    }

    window.location.assign(url.toString());
  }, []);

  const consumeGithubCallback = useCallback(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthErr = url.searchParams.get("error");
    const errDesc = url.searchParams.get("error_description");
    const provider = url.searchParams.get("auth_provider");

    // Only process when URL contains OAuth params
    if (!code && !oauthErr) return;
    if (provider && provider !== "github") return;

    const expectedState = sessionStorage.getItem(KEYS.GITHUB_STATE);

    // Clean URL immediately
    const clean = new URL(window.location.href);
    ["code", "state", "error", "error_description", "auth_provider"].forEach(
      (p) => clean.searchParams.delete(p),
    );
    window.history.replaceState(
      {},
      document.title,
      `${clean.pathname}${clean.search}${clean.hash}`,
    );

    setGithubLoading(true);
    setSocialAuthError("");

    try {
      if (oauthErr) {
        throw new Error(
          errDesc
            ? decodeURIComponent(errDesc)
            : "GitHub sign-in was cancelled.",
        );
      }
      if (!code || !state || !expectedState || expectedState !== state) {
        throw new Error(
          "GitHub sign-in could not be verified. Please try again.",
        );
      }
      await githubSignIn(code);
    } catch (err) {
      const msg = err?.message || "GitHub sign-in failed.";
      setSocialAuthError(msg);
      openModal("login");
    } finally {
      sessionStorage.removeItem(KEYS.GITHUB_STATE);
      sessionStorage.removeItem(KEYS.GITHUB_INTENT);
      setGithubLoading(false);
    }
  }, [githubSignIn, openModal]);

  // ============================================================================
  // Profile Management
  // ============================================================================

  const updateProfile = useCallback(
    async (updates) => {
      const data = await authFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const raw = data?.data?.user || data?.data || data?.user || data;
      const normalized = normalizeUser(
        { ...(user || {}), ...(raw || {}) },
        { cache: getCache() },
      );
      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }
      return data;
    },
    [authFetch, cacheProfile, getCache, user],
  );

  const uploadAvatar = useCallback(
    async (file) => {
      if (!(file instanceof File))
        throw new Error("Please select a valid image file.");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Image must be 10MB or less.");

      const allowed = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/avif",
      ];
      if (!allowed.includes(file.type)) {
        throw new Error("Please upload a JPEG, PNG, GIF, WebP, or AVIF image.");
      }

      const form = new FormData();
      form.append("image", file);
      form.append("type", "avatar");

      const data = await authFetch("/uploads/image", {
        method: "POST",
        body: form,
      });
      const p = data?.data || data || {};
      const avatarUrl = p.url || p.imageUrl || p.avatar || p.avatarUrl;
      if (!avatarUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      const normalized = normalizeUser(
        { ...(user || {}), avatar: avatarUrl },
        { cache: getCache() },
      );
      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      try {
        await updateProfile({ avatar: avatarUrl });
      } catch (err) {
        console.warn("[Auth] Avatar sync failed:", err.message);
      }

      return avatarUrl;
    },
    [authFetch, cacheProfile, getCache, updateProfile, user],
  );

  // ============================================================================
  // Logout & Account
  // ============================================================================

  const logout = useCallback(async () => {
    try {
      await authFetch("/users/logout", { method: "POST" });
    } catch {
      /* always clear locally */
    } finally {
      clearAuth();
      setPendingEmail("");
      closeModal();
    }
  }, [authFetch, clearAuth, closeModal]);

  const deleteAccount = useCallback(async () => {
    const data = await authFetch("/users/me", { method: "DELETE" });
    clearAuth();
    closeModal();
    return data;
  }, [authFetch, clearAuth, closeModal]);

  const refreshAuthToken = useCallback(async () => {
    const rt = store.get(KEYS.REFRESH);
    if (!rt) return false;
    try {
      const data = await authFetch("/users/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken: rt }),
      });
      const { token: tok, refreshToken: ref } = extractPayload(data);
      if (tok) {
        store.set(KEYS.TOKEN, tok, persistSession);
        setToken(tok);
      }
      if (ref) store.set(KEYS.REFRESH, ref, persistSession);
      return true;
    } catch {
      return false;
    }
  }, [authFetch, persistSession]);

  const resetPassword = useCallback(async () => {
    throw new Error("Please use email OTP or social login.");
  }, []);

  const changePassword = useCallback(async () => {
    throw new Error("Please use email OTP or social login.");
  }, []);

  // ============================================================================
  // Bootstrap Effects
  // ============================================================================

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    initGoogleSdk();
  }, [initGoogleSdk]);

  useEffect(() => {
    consumeGithubCallback();
  }, [consumeGithubCallback]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo(
    () => ({
      // State
      user,
      token,
      isAuthenticated,
      authLoading,
      isModalOpen,
      modalView,
      pendingEmail,
      googleUser,
      googleLoaded,
      googleLoading,
      githubLoading,
      hasGooglePending,
      socialAuthError,
      persistSession,
      showCongratulation,
      congratulationType,
      showNotLoggedInMessage,
      requiresLoginVerification,
      // Modal
      openModal,
      closeModal,
      setModalView,
      // Email auth
      login,
      register,
      verifyCode,
      resendCode,
      checkEmail,
      // Google auth
      googleSignIn,
      completeGoogleSignUp,
      promptGoogleAuth,
      clearGooglePending,
      clearSocialAuthError,
      // GitHub auth
      githubSignIn,
      startGithubAuth,
      // Profile
      updateProfile,
      uploadAvatar,
      // Session
      setSessionPreference,
      refreshAuthToken,
      logout,
      deleteAccount,
      resetPassword,
      changePassword,
      // Utilities
      fetchUser,
      authFetch,
      saveAuth,
    }),
    [
      user,
      token,
      isAuthenticated,
      authLoading,
      isModalOpen,
      modalView,
      pendingEmail,
      googleUser,
      googleLoaded,
      googleLoading,
      githubLoading,
      hasGooglePending,
      socialAuthError,
      persistSession,
      showCongratulation,
      congratulationType,
      showNotLoggedInMessage,
      requiresLoginVerification,
      openModal,
      closeModal,
      setModalView,
      login,
      register,
      verifyCode,
      resendCode,
      checkEmail,
      googleSignIn,
      completeGoogleSignUp,
      promptGoogleAuth,
      clearGooglePending,
      clearSocialAuthError,
      githubSignIn,
      startGithubAuth,
      updateProfile,
      uploadAvatar,
      setSessionPreference,
      refreshAuthToken,
      logout,
      deleteAccount,
      resetPassword,
      changePassword,
      fetchUser,
      authFetch,
      saveAuth,
    ],
  );

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return ctx;
}

export default UserAuthContext;