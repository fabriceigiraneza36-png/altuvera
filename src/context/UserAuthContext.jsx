// ============================================================================
// UserAuthContext.jsx
// Complete Auth Context — OTP Email + Google OAuth + GitHub OAuth
// NO WebAuthn (uses standard OTP + Social Auth flow)
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
// Constants & Configuration
// ============================================================================

const API_BASE =
  import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_PATH = import.meta.env.VITE_GITHUB_REDIRECT_PATH || "/";
const GITHUB_SCOPE =
  import.meta.env.VITE_GITHUB_SCOPE || "read:user user:email";

const KEYS = {
  TOKEN: "altuvera_auth_token",
  REFRESH: "altuvera_refresh_token",
  SESSION_PREF: "altuvera_persist_session",
  PROFILE_CACHE: "altuvera_profile_cache",
  GOOGLE_PENDING: "altuvera_google_pending",
  GITHUB_STATE: "altuvera_github_oauth_state",
  GITHUB_INTENT: "altuvera_github_oauth_intent",
};

// ============================================================================
// Context
// ============================================================================

const UserAuthContext = createContext(null);

// ============================================================================
// Storage Utilities
// ============================================================================

const storage = {
  getToken: () =>
    localStorage.getItem(KEYS.TOKEN) || sessionStorage.getItem(KEYS.TOKEN),

  getRefreshToken: () =>
    localStorage.getItem(KEYS.REFRESH) ||
    sessionStorage.getItem(KEYS.REFRESH),

  setToken: (token, persist) => {
    if (!token) return;
    if (persist) {
      localStorage.setItem(KEYS.TOKEN, token);
      sessionStorage.removeItem(KEYS.TOKEN);
    } else {
      sessionStorage.setItem(KEYS.TOKEN, token);
      localStorage.removeItem(KEYS.TOKEN);
    }
  },

  setRefreshToken: (token, persist) => {
    if (!token) return;
    if (persist) {
      localStorage.setItem(KEYS.REFRESH, token);
      sessionStorage.removeItem(KEYS.REFRESH);
    } else {
      sessionStorage.setItem(KEYS.REFRESH, token);
      localStorage.removeItem(KEYS.REFRESH);
    }
  },

  getSessionPref: () => {
    const val = localStorage.getItem(KEYS.SESSION_PREF);
    return val === null ? true : val === "true";
  },

  setSessionPref: (persist) => {
    localStorage.setItem(KEYS.SESSION_PREF, String(Boolean(persist)));
  },

  getProfileCache: () => {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE_CACHE);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  },

  setProfileCache: (cache) => {
    try {
      localStorage.setItem(KEYS.PROFILE_CACHE, JSON.stringify(cache));
    } catch {
      // Storage full or unavailable
    }
  },

  getGooglePending: () => {
    try {
      const raw = sessionStorage.getItem(KEYS.GOOGLE_PENDING);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setGooglePending: (data) => {
    if (data) {
      sessionStorage.setItem(KEYS.GOOGLE_PENDING, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(KEYS.GOOGLE_PENDING);
    }
  },

  clearAll: () => {
    [KEYS.TOKEN, KEYS.REFRESH].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    [KEYS.GOOGLE_PENDING, KEYS.GITHUB_STATE, KEYS.GITHUB_INTENT].forEach(
      (key) => sessionStorage.removeItem(key)
    );
  },
};

// ============================================================================
// Data Utilities
// ============================================================================

const safeTrim = (val) => (typeof val === "string" ? val.trim() : "");

const extractString = (...values) => {
  for (const val of values) {
    const trimmed = safeTrim(val);
    if (trimmed) return trimmed;
  }
  return "";
};

const normalizeUser = (payload, { fallbackEmail = "", fallbackName = "", fallbackAvatar = "", profileCache = {} } = {}) => {
  if (!payload || typeof payload !== "object") return null;

  const email = extractString(
    payload.email,
    payload.userEmail,
    payload.user_email,
    fallbackEmail
  );

  const cachedProfile = email
    ? profileCache[email.toLowerCase()] || null
    : null;

  const fullName = extractString(
    payload.fullName,
    payload.full_name,
    payload.name,
    payload.displayName,
    payload.display_name,
    payload.username,
    cachedProfile?.fullName,
    fallbackName,
    email ? email.split("@")[0] : "",
    "Traveler"
  );

  const avatar = extractString(
    payload.avatar,
    payload.avatarUrl,
    payload.avatar_url,
    payload.picture,
    payload.photoURL,
    payload.photo,
    payload.image,
    cachedProfile?.avatar,
    fallbackAvatar
  );

  return {
    id: payload.id || payload._id || payload.userId || payload.user_id || null,
    email,
    fullName,
    name: fullName,
    avatar: avatar || null,
    phone: extractString(
      payload.phone,
      payload.phoneNumber,
      payload.phone_number
    ),
    bio: extractString(payload.bio, payload.biography, payload.about),
    role: extractString(
      payload.role,
      payload.userRole,
      payload.user_role,
      "user"
    ),
    authProvider: extractString(
      payload.authProvider,
      payload.auth_provider,
      payload.provider,
      "email"
    ),
    isVerified: Boolean(
      payload.isVerified ||
        payload.is_verified ||
        payload.emailVerified ||
        payload.email_verified ||
        payload.verified
    ),
    emailVerified: Boolean(
      payload.emailVerified ||
        payload.email_verified ||
        payload.isVerified ||
        payload.is_verified
    ),
    isActive:
      typeof payload.isActive === "boolean"
        ? payload.isActive
        : typeof payload.is_active === "boolean"
          ? payload.is_active
          : true,
    preferences:
      payload.preferences && typeof payload.preferences === "object"
        ? payload.preferences
        : {},
    lastLogin: payload.lastLogin || payload.last_login || null,
    createdAt: payload.createdAt || payload.created_at || null,
    updatedAt: payload.updatedAt || payload.updated_at || null,
  };
};

const extractAuthPayload = (data) => {
  const inner = data?.data || data || {};
  return {
    token:
      inner.token ||
      inner.accessToken ||
      inner.access_token ||
      data?.token ||
      null,
    refreshToken:
      inner.refreshToken ||
      inner.refresh_token ||
      inner.refresh ||
      data?.refreshToken ||
      null,
    user: inner.user || data?.user || inner || null,
    isNewUser: Boolean(
      inner.isNewUser || inner.is_new_user || data?.isNewUser
    ),
    requiresProfile: Boolean(
      inner.requiresProfile ||
        inner.requires_profile ||
        data?.requiresProfile
    ),
  };
};

const decodeGoogleCredential = (credential) => {
  if (!credential) return null;
  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const generateOAuthState = () => {
  if (window?.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// ============================================================================
// Provider
// ============================================================================

export function UserAuthProvider({ children }) {
  // ── Core State ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => storage.getToken());
  const [authLoading, setAuthLoading] = useState(true);
  const [persistSession, setPersistSession] = useState(() =>
    storage.getSessionPref()
  );

  // ── Modal State ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");

  // ── Social Auth State ───────────────────────────────────────────────────────
  const [googleUser, setGoogleUser] = useState(() => storage.getGooglePending());
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState("");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const fetchingRef = useRef(false);
  const profileCacheRef = useRef(storage.getProfileCache());
  const pendingProfileRef = useRef(null);
  const googleInitRef = useRef(false);
  const refreshPromiseRef = useRef(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);
  const hasGooglePending = useMemo(
    () => !!googleUser?.email && !!googleUser?.credential,
    [googleUser]
  );

  // ============================================================================
  // Profile Cache
  // ============================================================================

  const cacheProfile = useCallback((profile) => {
    const email = safeTrim(profile?.email);
    if (!email) return;
    const updated = {
      ...profileCacheRef.current,
      [email.toLowerCase()]: {
        email,
        fullName: safeTrim(profile?.fullName || profile?.name || ""),
        avatar: safeTrim(profile?.avatar || ""),
      },
    };
    profileCacheRef.current = updated;
    storage.setProfileCache(updated);
  }, []);

  // ============================================================================
  // Session Management
  // ============================================================================

  const clearAuth = useCallback(() => {
    storage.clearAll();
    setToken(null);
    setUser(null);
    setGoogleUser(null);
    pendingProfileRef.current = null;
  }, []);

  const setSessionPreference = useCallback(
    (persist) => {
      const next = Boolean(persist);
      setPersistSession(next);
      storage.setSessionPref(next);

      const currentToken = token || storage.getToken();
      if (currentToken) storage.setToken(currentToken, next);

      const currentRefresh = storage.getRefreshToken();
      if (currentRefresh) storage.setRefreshToken(currentRefresh, next);
    },
    [token]
  );

  const saveAuth = useCallback(
    (data, options = {}) => {
      const {
        token: newToken,
        refreshToken: newRefresh,
        user: rawUser,
      } = extractAuthPayload(data);

      const persist =
        typeof options.persist === "boolean" ? options.persist : persistSession;

      if (newToken) {
        storage.setToken(newToken, persist);
        setToken(newToken);
      }

      if (newRefresh) {
        storage.setRefreshToken(newRefresh, persist);
      }

      const fallbackEmail =
        pendingProfileRef.current?.email || googleUser?.email || "";
      const fallbackName =
        pendingProfileRef.current?.fullName || googleUser?.name || "";
      const fallbackAvatar =
        pendingProfileRef.current?.avatar || googleUser?.picture || "";

      const normalized = normalizeUser(rawUser, {
        fallbackEmail,
        fallbackName,
        fallbackAvatar,
        profileCache: profileCacheRef.current,
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      pendingProfileRef.current = null;
      setGoogleUser(null);
      storage.setGooglePending(null);

      return data;
    },
    [cacheProfile, googleUser, persistSession]
  );

  // ============================================================================
  // Modal Management
  // ============================================================================

  const openModal = useCallback((view = "login") => {
    setModalView(view);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalView("login");
    setPendingEmail("");
    setSocialAuthError("");
    setGoogleUser(null);
    storage.setGooglePending(null);
    document.body.style.overflow = "";
  }, []);

  // ============================================================================
  // Core API Fetch
  // ============================================================================

  const authFetch = useCallback(
    async (endpoint, options = {}) => {
      // Build absolute URL - always use production backend
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

      const currentToken = token || storage.getToken();
      const isFormData = options.body instanceof FormData;

      const buildHeaders = (authToken) => ({
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      });

      let response;

      try {
        response = await fetch(url, {
          ...options,
          headers: buildHeaders(currentToken),
        });
      } catch {
        throw new Error(
          "Network error. Please check your connection and try again."
        );
      }

      // ── Handle Token Refresh (401) ─────────────────────────────────────────
      if (response.status === 401 && !options._retry) {
        const refreshToken = storage.getRefreshToken();

        if (refreshToken) {
          try {
            if (!refreshPromiseRef.current) {
              refreshPromiseRef.current = fetch(`${API_BASE}/users/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              })
                .then(async (r) => {
                  const d = await r.json().catch(() => ({}));
                  if (!r.ok) throw new Error(d?.message || "Session expired");
                  saveAuth(d, { persist: persistSession });
                  return extractAuthPayload(d).token;
                })
                .finally(() => {
                  refreshPromiseRef.current = null;
                });
            }

            const newToken = await refreshPromiseRef.current;

            // Retry original request with new token
            response = await fetch(url, {
              ...options,
              _retry: true,
              headers: buildHeaders(newToken),
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

      // ── Parse Response ─────────────────────────────────────────────────────
      if (response.status === 204) return {};

      let data = null;
      const contentType = response.headers.get("content-type") || "";

      try {
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text ? { message: text } : {};
        }
      } catch {
        data = {};
      }

      // ── Handle Errors ──────────────────────────────────────────────────────
      if (!response.ok) {
        if (response.status === 401) clearAuth();

        // ✅ Always extract string message - prevents [object Object]
        const message =
          data?.message ||
          data?.error ||
          data?.data?.message ||
          data?.data?.error ||
          `Request failed (${response.status})`;

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data || {};
    },
    [clearAuth, persistSession, saveAuth, token]
  );

  // ============================================================================
  // Fetch Current User
  // ============================================================================

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;

    const currentToken = token || storage.getToken();
    if (!currentToken) {
      setAuthLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      // ✅ Correct endpoint: /users/me (not /auth/webauthn/me)
      const data = await authFetch("/users/me");
      const payload = data?.data || data;
      const rawUser = payload?.user || payload;

      const normalized = normalizeUser(rawUser, {
        profileCache: profileCacheRef.current,
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }
    } catch (error) {
      console.warn("[Auth] Session restore failed:", error.message);
      clearAuth();
    } finally {
      setAuthLoading(false);
      fetchingRef.current = false;
    }
  }, [authFetch, cacheProfile, clearAuth, token]);

  // ============================================================================
  // Email OTP Auth
  // ============================================================================

  const login = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = safeTrim(payload?.email || "");
      if (!email) throw new Error("Email is required.");

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const data = await authFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setPendingEmail(email);
      setModalView("otp");

      return data;
    },
    [authFetch, setSessionPreference]
  );

  const register = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = safeTrim(payload?.email || "");
      const fullName = safeTrim(
        payload?.fullName || payload?.full_name || ""
      );

      if (!email) throw new Error("Email is required.");

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const data = await authFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          fullName: fullName || undefined,
          phone: safeTrim(payload?.phone || "") || undefined,
          bio: safeTrim(payload?.bio || "") || undefined,
        }),
      });

      setPendingEmail(email);
      setModalView("otp");

      return data;
    },
    [authFetch, setSessionPreference]
  );

  const verifyCode = useCallback(
    async (email, code) => {
      const resolvedEmail = safeTrim(email || pendingEmail);
      const resolvedCode = safeTrim(String(code || ""));

      if (!resolvedEmail) throw new Error("Email is required.");
      if (!resolvedCode) throw new Error("Verification code is required.");

      const data = await authFetch("/users/verify-code", {
        method: "POST",
        body: JSON.stringify({ email: resolvedEmail, code: resolvedCode }),
      });

      saveAuth(data, { persist: persistSession });
      setPendingEmail("");
      closeModal();

      return data;
    },
    [authFetch, closeModal, pendingEmail, persistSession, saveAuth]
  );

  const resendCode = useCallback(
    async (email) => {
      const resolvedEmail = safeTrim(email || pendingEmail);
      if (!resolvedEmail) throw new Error("Email is required.");

      return authFetch("/users/resend-code", {
        method: "POST",
        body: JSON.stringify({ email: resolvedEmail }),
      });
    },
    [authFetch, pendingEmail]
  );

  const checkEmail = useCallback(
    async (email) => {
      const resolvedEmail = safeTrim(email || "");
      if (!resolvedEmail) return { exists: false };

      try {
        const data = await authFetch("/users/check-email", {
          method: "POST",
          body: JSON.stringify({ email: resolvedEmail }),
        });
        return data?.data || { exists: false };
      } catch {
        return { exists: false };
      }
    },
    [authFetch]
  );

  // ============================================================================
  // Google Auth
  // ============================================================================

  const initGoogleSdk = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || googleInitRef.current) return;

    if (window.google?.accounts) {
      setGoogleLoaded(true);
      googleInitRef.current = true;
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      existing.addEventListener("load", () => {
        setGoogleLoaded(true);
        googleInitRef.current = true;
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      googleInitRef.current = true;
    };
    script.onerror = () => {
      console.warn("[Auth] Failed to load Google SDK");
      setGoogleLoaded(false);
    };
    document.head.appendChild(script);
  }, []);

  const googleSignIn = useCallback(
    async (credentialOrResponse, profileData = {}) => {
      const credential =
        typeof credentialOrResponse === "string"
          ? credentialOrResponse
          : credentialOrResponse?.credential;

      if (!credential) {
        throw new Error("Google sign-in was cancelled.");
      }

      setGoogleLoading(true);
      setSocialAuthError("");

      try {
        // ✅ Correct endpoint: /users/google
        const data = await authFetch("/users/google", {
          method: "POST",
          body: JSON.stringify({
            credential,
            phone: safeTrim(profileData?.phone || ""),
            bio: safeTrim(profileData?.bio || ""),
            avatar: safeTrim(profileData?.avatar || ""),
          }),
        });

        const { isNewUser, requiresProfile } = extractAuthPayload(data);

        if (isNewUser || requiresProfile) {
          const decoded = decodeGoogleCredential(credential);
          const pending = {
            credential,
            email: decoded?.email || "",
            name: decoded?.name || "",
            picture: decoded?.picture || "",
            sub: decoded?.sub || "",
          };
          setGoogleUser(pending);
          storage.setGooglePending(pending);
          setModalView("register");
          return { ...data, requiresProfile: true, googleUser: pending };
        }

        saveAuth(data, { persist: persistSession });
        closeModal();
        return data;
      } catch (error) {
        // ✅ Set string message - prevents [object Object]
        const message = error?.message || "Google sign-in failed.";
        setSocialAuthError(message);
        throw new Error(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    [authFetch, closeModal, persistSession, saveAuth]
  );

  const googleSignUp = useCallback(
    async (credentialOrResponse) => {
      const credential =
        typeof credentialOrResponse === "string"
          ? credentialOrResponse
          : credentialOrResponse?.credential;

      if (!credential) throw new Error("Google credential is required.");

      setGoogleLoading(true);

      try {
        const decoded = decodeGoogleCredential(credential);
        if (!decoded?.email)
          throw new Error("Could not decode Google account information.");

        const pending = {
          credential,
          email: decoded.email,
          name: decoded.name || "",
          picture: decoded.picture || "",
          sub: decoded.sub || "",
          emailVerified: decoded.email_verified || false,
        };

        setGoogleUser(pending);
        storage.setGooglePending(pending);
        return pending;
      } finally {
        setGoogleLoading(false);
      }
    },
    []
  );

  const completeGoogleSignUp = useCallback(
    async (profileData = {}) => {
      const pending = googleUser || storage.getGooglePending();

      if (!pending?.credential) {
        throw new Error(
          "Google authentication required. Please sign in with Google first."
        );
      }

      const fullName = safeTrim(profileData?.fullName || pending.name || "");
      const avatar = safeTrim(profileData?.avatar || pending.picture || "");

      pendingProfileRef.current = { email: pending.email, fullName, avatar };

      const data = await googleSignIn(pending.credential, {
        phone: safeTrim(profileData?.phone || ""),
        bio: safeTrim(profileData?.bio || ""),
        avatar,
      });

      const { token: authToken, requiresProfile } = extractAuthPayload(data);
      if (!authToken || requiresProfile) {
        throw new Error("Account setup incomplete. Please complete all required fields.");
      }

      return data;
    },
    [googleSignIn, googleUser]
  );

  const promptGoogleAuth = useCallback(
    (options = {}) => {
      return new Promise((resolve, reject) => {
        if (!googleLoaded || !window.google?.accounts) {
          reject(new Error("Google Sign-In is not available. Please try again."));
          return;
        }

        if (!GOOGLE_CLIENT_ID) {
          reject(new Error("Google Sign-In is not configured."));
          return;
        }

        setSocialAuthError("");
        setGoogleLoading(true);

        let settled = false;

        const settle = (fn, val) => {
          if (settled) return;
          settled = true;
          setGoogleLoading(false);
          fn(val instanceof Error ? val : val);
        };

        const timeout = setTimeout(() => {
          settle(
            reject,
            new Error(
              "Google sign-in timed out. Please use the Google button below."
            )
          );
        }, 12000);

        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              clearTimeout(timeout);
              setGoogleLoading(false);

              if (!response?.credential) {
                settle(reject, new Error("Google sign-in was cancelled."));
                return;
              }

              try {
                const result =
                  options.mode === "signup"
                    ? await googleSignUp(response.credential)
                    : await googleSignIn(response.credential);
                settle(resolve, result);
              } catch (err) {
                settle(reject, err);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            context: options.mode === "signup" ? "signup" : "signin",
            ux_mode: "popup",
            use_fedcm_for_prompt: true,
          });

          // Render fallback button if container provided
          if (options.container) {
            options.container.innerHTML = "";
            window.google.accounts.id.renderButton(options.container, {
              theme: "outline",
              size: "large",
              shape: "pill",
              width: options.buttonWidth || 320,
              text: options.mode === "signup" ? "signup_with" : "signin_with",
            });
          }

          window.google.accounts.id.prompt((notification) => {
            if (
              notification.isNotDisplayed() ||
              notification.isSkippedMoment()
            ) {
              settle(
                reject,
                new Error(
                  "Google popup was blocked. Please use the Google button below."
                )
              );
              return;
            }

            if (
              notification.isDismissedMoment() &&
              notification.getDismissedReason() !== "credential_returned"
            ) {
              settle(reject, new Error("Google sign-in was cancelled."));
            }
          });
        } catch (err) {
          clearTimeout(timeout);
          settle(reject, err);
        }
      });
    },
    [googleLoaded, googleSignIn, googleSignUp]
  );

  const clearGooglePending = useCallback(() => {
    setGoogleUser(null);
    storage.setGooglePending(null);
  }, []);

  const clearSocialAuthError = useCallback(() => {
    setSocialAuthError("");
  }, []);

  // ============================================================================
  // GitHub Auth
  // ============================================================================

  const githubSignIn = useCallback(
    async (code, profileData = {}) => {
      if (!code) throw new Error("GitHub authorization code is required.");

      const data = await authFetch("/users/github", {
        method: "POST",
        body: JSON.stringify({
          code,
          phone: safeTrim(profileData?.phone || ""),
          bio: safeTrim(profileData?.bio || ""),
        }),
      });

      const { token: authToken } = extractAuthPayload(data);
      if (!authToken) {
        throw new Error("GitHub authentication did not return a valid session.");
      }

      saveAuth(data, { persist: persistSession });
      closeModal();
      return data;
    },
    [authFetch, closeModal, persistSession, saveAuth]
  );

  const startGithubAuth = useCallback((mode = "signin") => {
    if (!GITHUB_CLIENT_ID) throw new Error("GitHub Sign-In is not configured.");

    const redirectUrl = new URL(GITHUB_REDIRECT_PATH, window.location.origin);
    redirectUrl.searchParams.set("auth_provider", "github");

    const state = generateOAuthState();
    sessionStorage.setItem(KEYS.GITHUB_STATE, state);
    sessionStorage.setItem(KEYS.GITHUB_INTENT, mode);
    setSocialAuthError("");

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
    authorizeUrl.searchParams.set("redirect_uri", redirectUrl.toString());
    authorizeUrl.searchParams.set("scope", GITHUB_SCOPE);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("allow_signup", "true");

    window.location.assign(authorizeUrl.toString());
  }, []);

  const cleanGithubParams = useCallback(() => {
    const url = new URL(window.location.href);
    ["auth_provider", "code", "state", "error", "error_description"].forEach(
      (p) => url.searchParams.delete(p)
    );
    window.history.replaceState(
      {},
      document.title,
      `${url.pathname}${url.search}${url.hash}`
    );
  }, []);

  const consumeGithubCallback = useCallback(async () => {
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("auth_provider");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    const oauthErrorDesc = url.searchParams.get("error_description");

    if (provider !== "github" && !oauthError && (!code || !state)) return;

    setGithubLoading(true);
    setSocialAuthError("");

    try {
      if (oauthError) {
        throw new Error(
          oauthErrorDesc
            ? decodeURIComponent(oauthErrorDesc)
            : "GitHub sign-in was cancelled."
        );
      }

      const expectedState = sessionStorage.getItem(KEYS.GITHUB_STATE);
      if (!code || !state || !expectedState || expectedState !== state) {
        throw new Error("GitHub sign-in could not be verified. Please try again.");
      }

      await githubSignIn(code);
    } catch (error) {
      const message = error?.message || "GitHub sign-in failed.";
      setSocialAuthError(message);
      openModal("login");
    } finally {
      sessionStorage.removeItem(KEYS.GITHUB_STATE);
      sessionStorage.removeItem(KEYS.GITHUB_INTENT);
      cleanGithubParams();
      setGithubLoading(false);
    }
  }, [cleanGithubParams, githubSignIn, openModal]);

  // ============================================================================
  // Profile Management
  // ============================================================================

  const updateProfile = useCallback(
    async (updates) => {
      const data = await authFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      const payload = data?.data || data;
      const rawUser = payload?.user || payload;

      const normalized = normalizeUser(
        { ...(user || {}), ...(rawUser || {}) },
        { profileCache: profileCacheRef.current }
      );

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      return data;
    },
    [authFetch, cacheProfile, user]
  );

  const uploadAvatar = useCallback(
    async (file) => {
      if (!(file instanceof File)) throw new Error("Please select a valid image file.");

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) throw new Error("Image must be 10MB or less.");

      const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
      if (!ALLOWED.includes(file.type)) {
        throw new Error("Please upload a JPEG, PNG, GIF, WebP, or AVIF image.");
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "avatar");

      const data = await authFetch("/uploads/image", {
        method: "POST",
        body: formData,
      });

      const payload = data?.data || data || {};
      const avatarUrl =
        payload.url ||
        payload.imageUrl ||
        payload.avatar ||
        payload.avatarUrl ||
        null;

      if (!avatarUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      // Optimistic update
      const normalized = normalizeUser(
        { ...(user || {}), avatar: avatarUrl },
        { profileCache: profileCacheRef.current }
      );
      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      // Persist to backend
      try {
        await updateProfile({ avatar: avatarUrl });
      } catch (err) {
        console.warn("[Auth] Failed to sync avatar:", err.message);
      }

      return avatarUrl;
    },
    [authFetch, cacheProfile, updateProfile, user]
  );

  // ============================================================================
  // Logout & Account Deletion
  // ============================================================================

  const logout = useCallback(async () => {
    try {
      await authFetch("/users/logout", { method: "POST" });
    } catch {
      // Always logout even if request fails
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

  // Stubs for unsupported flows
  const resetPassword = useCallback(async () => {
    throw new Error("Password reset is unavailable. Please use email OTP or social login.");
  }, []);

  const changePassword = useCallback(async () => {
    throw new Error("Password changes are unavailable. Please use email OTP or social login.");
  }, []);

  const refreshAuthToken = useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const data = await authFetch("/users/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      const { token: newToken, refreshToken: newRefresh } = extractAuthPayload(data);
      if (newToken) {
        storage.setToken(newToken, persistSession);
        setToken(newToken);
      }
      if (newRefresh) {
        storage.setRefreshToken(newRefresh, persistSession);
      }
      return true;
    } catch {
      return false;
    }
  }, [authFetch, persistSession]);

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { initGoogleSdk(); }, [initGoogleSdk]);
  useEffect(() => { consumeGithubCallback(); }, [consumeGithubCallback]);
  useEffect(() => { return () => { document.body.style.overflow = ""; }; }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo(
    () => ({
      // ── State ──────────────────────────────────────────────────────────────
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

      // ── Modal ──────────────────────────────────────────────────────────────
      openModal,
      closeModal,
      setModalView,

      // ── Email OTP ──────────────────────────────────────────────────────────
      login,
      register,
      verifyCode,
      resendCode,
      checkEmail,

      // ── Google ─────────────────────────────────────────────────────────────
      googleSignIn,
      googleSignUp,
      completeGoogleSignUp,
      promptGoogleAuth,
      clearGooglePending,
      clearSocialAuthError,

      // ── GitHub ─────────────────────────────────────────────────────────────
      githubSignIn,
      startGithubAuth,

      // ── Profile ────────────────────────────────────────────────────────────
      updateProfile,
      uploadAvatar,

      // ── Session ────────────────────────────────────────────────────────────
      setSessionPreference,
      refreshAuthToken,

      // ── Account ────────────────────────────────────────────────────────────
      logout,
      deleteAccount,
      resetPassword,
      changePassword,

      // ── Utilities ──────────────────────────────────────────────────────────
      fetchUser,
      authFetch,
      saveAuth,
    }),
    [
      user, token, isAuthenticated, authLoading,
      isModalOpen, modalView, pendingEmail,
      googleUser, googleLoaded, googleLoading, githubLoading,
      hasGooglePending, socialAuthError, persistSession,
      openModal, closeModal, setModalView,
      login, register, verifyCode, resendCode, checkEmail,
      googleSignIn, googleSignUp, completeGoogleSignUp,
      promptGoogleAuth, clearGooglePending, clearSocialAuthError,
      githubSignIn, startGithubAuth,
      updateProfile, uploadAvatar,
      setSessionPreference, refreshAuthToken,
      logout, deleteAccount, resetPassword, changePassword,
      fetchUser, authFetch, saveAuth,
    ]
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
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}

export default UserAuthContext;