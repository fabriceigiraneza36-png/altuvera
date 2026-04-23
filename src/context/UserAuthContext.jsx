// UserAuthContext.jsx - Enhanced version with full Google Auth support
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

// ============================================================================
// Configuration
// ============================================================================
import {
  API_URL,
  API_URLS,
  toAbsoluteApiUrl,
  toApiPath,
} from "../utils/apiBase";
const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL || "";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_PATH = import.meta.env.VITE_GITHUB_REDIRECT_PATH || "/";
const GITHUB_SCOPE =
  import.meta.env.VITE_GITHUB_SCOPE || "read:user user:email";

const TOKEN_STORAGE_KEY = "altuvera_auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "altuvera_refresh_token";
const SESSION_PREF_KEY = "altuvera_persist_session";
const PROFILE_CACHE_KEY = "altuvera_profile_cache";
const GOOGLE_PENDING_KEY = "altuvera_google_pending";
const GITHUB_OAUTH_STATE_KEY = "altuvera_github_oauth_state";
const GITHUB_OAUTH_INTENT_KEY = "altuvera_github_oauth_intent";

const DEFAULT_AVATAR_UPLOAD_PATH = "/uploads/image";
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;

// ============================================================================
// Context Creation
// ============================================================================
const UserAuthContext = createContext(null);

// ============================================================================
// Utility Functions
// ============================================================================
const getStoredToken = () =>
  localStorage.getItem(TOKEN_STORAGE_KEY) ||
  sessionStorage.getItem(TOKEN_STORAGE_KEY);

const getStoredRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ||
  sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

const getStoredSessionPreference = () => {
  const stored = localStorage.getItem(SESSION_PREF_KEY);
  return stored === null ? true : stored === "true";
};

const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");

const safeJsonParse = (raw, fallback = null) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const readProfileCache = () => {
  const raw = localStorage.getItem(PROFILE_CACHE_KEY);
  const parsed = safeJsonParse(raw, {});
  return parsed && typeof parsed === "object" ? parsed : {};
};

const writeProfileCache = (cache) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable
  }
};

const readPendingGoogleData = () => {
  const raw = sessionStorage.getItem(GOOGLE_PENDING_KEY);
  return safeJsonParse(raw, null);
};

const writePendingGoogleData = (data) => {
  if (data) {
    sessionStorage.setItem(GOOGLE_PENDING_KEY, JSON.stringify(data));
  } else {
    sessionStorage.removeItem(GOOGLE_PENDING_KEY);
  }
};

const avatarFromPayload = (payload) =>
  safeTrim(
    payload?.avatar ||
      payload?.avatarUrl ||
      payload?.avatar_url ||
      payload?.profileImage ||
      payload?.profile_image ||
      payload?.image ||
      payload?.photo ||
      payload?.photoURL ||
      payload?.picture ||
      "",
  );

const resolveCachedProfile = (cache, email) => {
  if (!email) return null;
  return cache?.[email?.toLowerCase?.()] || null;
};

const normalizeUser = (
  payload,
  {
    fallbackEmail = "",
    fallbackName = "",
    fallbackAvatar = "",
    profileCache = {},
  } = {},
) => {
  if (!payload || typeof payload !== "object") return null;

  const email = safeTrim(
    payload.email || payload.userEmail || payload.user_email || fallbackEmail,
  );
  const cached = resolveCachedProfile(profileCache, email);

  const resolvedName = safeTrim(
    payload.fullName ||
      payload.full_name ||
      payload.name ||
      payload.displayName ||
      payload.display_name ||
      payload.username ||
      cached?.fullName ||
      fallbackName,
  );

  const resolvedAvatar = safeTrim(
    avatarFromPayload(payload) || cached?.avatar || fallbackAvatar,
  );

  const fallbackDisplayName = email ? email.split("@")[0] : "Traveler";
  const fullName = resolvedName || fallbackDisplayName;

  return {
    id: payload.id || payload._id || payload.userId || payload.user_id,
    email,
    fullName,
    name: fullName,
    avatar: resolvedAvatar || null,
    phone: safeTrim(
      payload.phone || payload.phoneNumber || payload.phone_number || "",
    ),
    bio: safeTrim(payload.bio || payload.biography || payload.about || ""),
    role: safeTrim(
      payload.role || payload.userRole || payload.user_role || "user",
    ),
    authProvider:
      payload.authProvider ||
      payload.auth_provider ||
      payload.provider ||
      "email",
    emailVerified: Boolean(
      payload.emailVerified ||
      payload.email_verified ||
      payload.isVerified ||
      payload.is_verified ||
      payload.verified,
    ),
    isVerified: Boolean(
      payload.isVerified ||
      payload.is_verified ||
      payload.emailVerified ||
      payload.email_verified ||
      payload.verified,
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
    createdAt: payload.createdAt || payload.created_at,
    updatedAt: payload.updatedAt || payload.updated_at,
  };
};

const extractAuthPayload = (data) => {
  const payload = data?.data || data;
  return {
    token:
      payload?.token ||
      payload?.accessToken ||
      payload?.access_token ||
      data?.token,
    refreshToken:
      payload?.refreshToken ||
      payload?.refresh_token ||
      payload?.refresh ||
      data?.refreshToken,
    user: payload?.user || data?.user || payload,
    isNewUser: Boolean(
      payload?.isNewUser || payload?.is_new_user || data?.isNewUser,
    ),
    requiresProfile: Boolean(
      payload?.requiresProfile ||
      payload?.requires_profile ||
      data?.requiresProfile,
    ),
  };
};

const buildVerificationCodeOptions = () => ({
  forceNewCode: true,
  regenerateCode: true,
  codeExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
  verificationExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
});

const SOCIAL_ENDPOINT_PREFIXES = ["auth", "users"];

const generateOauthState = () => {
  if (window?.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * Decode Google JWT credential to extract user info
 */
const decodeGoogleCredential = (credential) => {
  if (!credential) return null;

  try {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// ============================================================================
// Provider Component
// ============================================================================
export function UserAuthProvider({ children }) {
  // -------------------------------------------------------------------------
  // Core Auth State
  // -------------------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState(true);
  const [persistSession, setPersistSession] = useState(() =>
    getStoredSessionPreference(),
  );

  // -------------------------------------------------------------------------
  // Modal State
  // -------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");

  // -------------------------------------------------------------------------
  // Google Auth State
  // -------------------------------------------------------------------------
  const [googleUser, setGoogleUser] = useState(() => readPendingGoogleData());
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [socialAuthError, setSocialAuthError] = useState("");

  // -------------------------------------------------------------------------
  // Refs
  // -------------------------------------------------------------------------
  const fetchingRef = useRef(false);
  const profileCacheRef = useRef(readProfileCache());
  const pendingProfileRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const refreshPromiseRef = useRef(null);

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------
  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);

  const hasGooglePending = useMemo(
    () => !!googleUser?.email && !!googleUser?.credential,
    [googleUser],
  );

  // -------------------------------------------------------------------------
  // Profile Cache Management
  // -------------------------------------------------------------------------
  const cacheProfile = useCallback((profile) => {
    const email = safeTrim(profile?.email);
    if (!email) return;

    const key = email.toLowerCase();
    profileCacheRef.current = {
      ...profileCacheRef.current,
      [key]: {
        email,
        fullName: safeTrim(profile?.fullName || profile?.name || ""),
        avatar: safeTrim(profile?.avatar || ""),
      },
    };

    writeProfileCache(profileCacheRef.current);
  }, []);

  // -------------------------------------------------------------------------
  // Token Management
  // -------------------------------------------------------------------------
  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(GOOGLE_PENDING_KEY);
    sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GITHUB_OAUTH_INTENT_KEY);
  }, []);

  const applyLoggedOutState = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setGoogleUser(null);
    pendingProfileRef.current = null;
  }, [clearStoredAuth]);

  const storeToken = useCallback((authToken, persist) => {
    if (!authToken) return;

    if (persist) {
      localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const storeRefreshToken = useCallback((refreshToken, persist) => {
    if (!refreshToken) return;

    if (persist) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  }, []);

  const setSessionPreference = useCallback(
    (persist) => {
      const nextPreference = Boolean(persist);
      setPersistSession(nextPreference);
      localStorage.setItem(SESSION_PREF_KEY, String(nextPreference));

      const currentToken = token || getStoredToken();
      if (currentToken) {
        storeToken(currentToken, nextPreference);
      }

      const currentRefreshToken = getStoredRefreshToken();
      if (currentRefreshToken) {
        storeRefreshToken(currentRefreshToken, nextPreference);
      }
    },
    [storeRefreshToken, storeToken, token],
  );

  // -------------------------------------------------------------------------
  // Modal Management
  // -------------------------------------------------------------------------
  const openModal = useCallback((view = "login") => {
    setModalView(view);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalView("login");
    setPendingEmail("");
    setGoogleUser(null);
    setSocialAuthError("");
    writePendingGoogleData(null);
    document.body.style.overflow = "";
  }, []);

  // -------------------------------------------------------------------------
  // Auth State Saving
  // -------------------------------------------------------------------------
  const saveAuth = useCallback(
    (data, options = {}) => {
      const {
        token: extractedToken,
        refreshToken: extractedRefreshToken,
        user: extractedUser,
      } = extractAuthPayload(data);
      const persist =
        typeof options.persist === "boolean" ? options.persist : persistSession;

      if (extractedToken) {
        storeToken(extractedToken, persist);
        setToken(extractedToken);
      }

      if (extractedRefreshToken) {
        storeRefreshToken(extractedRefreshToken, persist);
      }

      const pendingProfile = pendingProfileRef.current;
      const googleProfile = googleUser;

      const normalized = normalizeUser(extractedUser, {
        fallbackEmail: pendingProfile?.email || googleProfile?.email || "",
        fallbackName: pendingProfile?.fullName || googleProfile?.name || "",
        fallbackAvatar: pendingProfile?.avatar || googleProfile?.picture || "",
        profileCache: profileCacheRef.current,
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      pendingProfileRef.current = null;
      setGoogleUser(null);
      writePendingGoogleData(null);

      return data;
    },
    [cacheProfile, googleUser, persistSession, storeRefreshToken, storeToken],
  );

  // -------------------------------------------------------------------------
  // API Fetch Wrapper
  // -------------------------------------------------------------------------
  const authFetch = useCallback(
    async (url, options = {}) => {
      const { skipAuthRefresh = false, ...requestOptions } = options;
      const currentToken = token || getStoredToken();
      const isFormData = requestOptions.body instanceof FormData;

      const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...requestOptions.headers,
      };

      const pathFromKnownBase = toApiPath(url);
      const candidateUrls = pathFromKnownBase
        ? API_URLS.map((base) => toAbsoluteApiUrl(pathFromKnownBase, base))
        : [url];

      const executeRequest = async (authTokenOverride = currentToken) => {
        let response;
        for (const candidateUrl of candidateUrls) {
          const candidateHeaders = {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(authTokenOverride
              ? { Authorization: `Bearer ${authTokenOverride}` }
              : {}),
            ...requestOptions.headers,
          };

          try {
            response = await fetch(candidateUrl, {
              ...requestOptions,
              credentials: "include",
              headers: candidateHeaders,
            });

            if (
              response.status >= 500 &&
              candidateUrl !== candidateUrls.at(-1)
            ) {
              continue;
            }

            break;
          } catch (networkError) {
            if (candidateUrl !== candidateUrls.at(-1)) continue;
            throw new Error(
              "Network error. Please check your connection and try again.",
            );
          }
        }

        return response;
      };

      let response = await executeRequest();

      const shouldRefresh = false;

      if (shouldRefresh) {
        try {
          if (!refreshPromiseRef.current) {
            const refreshToken = getStoredRefreshToken();
            refreshPromiseRef.current = (async () => {
              const refreshResponse = await fetch(
                `${API_URL}/users/refresh-token`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ refreshToken }),
                },
              );

              let refreshData = null;
              try {
                refreshData = await refreshResponse.json();
              } catch {
                refreshData = null;
              }

              if (!refreshResponse.ok) {
                const refreshMessage =
                  refreshData?.message ||
                  refreshData?.error ||
                  "Session expired. Please sign in again.";
                const refreshError = new Error(refreshMessage);
                refreshError.status = refreshResponse.status;
                throw refreshError;
              }

              saveAuth(refreshData, { persist: persistSession });
              return extractAuthPayload(refreshData).token;
            })().finally(() => {
              refreshPromiseRef.current = null;
            });
          }

          const refreshedToken = await refreshPromiseRef.current;
          response = await executeRequest(refreshedToken);
        } catch (refreshError) {
          applyLoggedOutState();
          throw refreshError;
        }
      }

      if (response.status === 204) {
        return {};
      }

      let data = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        try {
          const textData = await response.text();
          data = textData ? { message: textData } : null;
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          applyLoggedOutState();
        }

        const errorMessage =
          data?.error ||
          data?.message ||
          data?.data?.error ||
          data?.data?.message ||
          `Request failed (${response.status})`;

        const requestError = new Error(errorMessage);
        requestError.status = response.status;
        throw requestError;
      }

      return data || {};
    },
    [API_URLS, applyLoggedOutState, persistSession, saveAuth, token],
  );

  // -------------------------------------------------------------------------
  // Fetch Current User
  // -------------------------------------------------------------------------
  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;

    const currentToken = token || getStoredToken();
    if (!currentToken) {
      setAuthLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      const data = await authFetch(`${API_URL}/auth/webauthn/me`);
      const payload = data?.data || data;
      const userData = payload?.user || payload;

      const normalized = normalizeUser(userData, {
        profileCache: profileCacheRef.current,
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error.message);
      clearStoredAuth();
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
      fetchingRef.current = false;
    }
  }, [authFetch, cacheProfile, clearStoredAuth, token]);

  // -------------------------------------------------------------------------
  // Google SDK Initialization
  // -------------------------------------------------------------------------
  const initializeGoogleSdk = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || googleInitializedRef.current) return;

    if (window.google?.accounts) {
      setGoogleLoaded(true);
      googleInitializedRef.current = true;
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setGoogleLoaded(true);
        googleInitializedRef.current = true;
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setGoogleLoaded(true);
      googleInitializedRef.current = true;
    };

    script.onerror = () => {
      console.warn("Failed to load Google Sign-In SDK");
      setGoogleLoaded(false);
    };

    document.head.appendChild(script);
  }, []);

  // -------------------------------------------------------------------------
  // Social Auth Helpers
  // -------------------------------------------------------------------------
  const clearSocialAuthError = useCallback(() => {
    setSocialAuthError("");
  }, []);

  const requestSocialProviderAuth = useCallback(
    async (provider, payload) => {
      let firstError = null;

      for (const prefix of SOCIAL_ENDPOINT_PREFIXES) {
        try {
          return await authFetch(`${API_URL}/${prefix}/${provider}`, {
            method: "POST",
            body: JSON.stringify(payload || {}),
          });
        } catch (error) {
          if (!firstError) firstError = error;
          if (error?.status && ![400, 404, 405].includes(error.status)) {
            throw error;
          }
        }
      }

      throw firstError || new Error(`Unable to authenticate with ${provider}.`);
    },
    [authFetch],
  );

  // -------------------------------------------------------------------------
  // Google Sign-In (Direct Login)
  // -------------------------------------------------------------------------
  const googleSignIn = useCallback(
    async (credentialOrResponse, profileData = {}) => {
      const credential =
        typeof credentialOrResponse === "string"
          ? credentialOrResponse
          : credentialOrResponse?.credential;

      if (!credential) {
        throw new Error("Google credential is required.");
      }

      setGoogleLoading(true);

      try {
        const data = await requestSocialProviderAuth("google", {
          credential,
          phone: safeTrim(profileData?.phone || ""),
          bio: safeTrim(profileData?.bio || ""),
          avatar: safeTrim(profileData?.avatar || ""),
        });

        const { isNewUser, requiresProfile } = extractAuthPayload(data);

        // If backend indicates this is a new user requiring profile setup
        if (isNewUser || requiresProfile) {
          const decodedUser = decodeGoogleCredential(credential);
          const googleData = {
            credential,
            email: decodedUser?.email || "",
            name: decodedUser?.name || "",
            picture: decodedUser?.picture || "",
            sub: decodedUser?.sub || "",
          };

          setGoogleUser(googleData);
          writePendingGoogleData(googleData);
          setModalView("register");

          return { ...data, requiresProfile: true, googleUser: googleData };
        }

        saveAuth(data, { persist: persistSession });
        closeModal();
        return data;
      } catch (error) {
        throw error;
      } finally {
        setGoogleLoading(false);
      }
    },
    [closeModal, persistSession, requestSocialProviderAuth, saveAuth],
  );

  // -------------------------------------------------------------------------
  // Google Sign-Up (Start with Google, Complete Profile)
  // -------------------------------------------------------------------------
  const googleSignUp = useCallback(async (credentialOrResponse) => {
    const credential =
      typeof credentialOrResponse === "string"
        ? credentialOrResponse
        : credentialOrResponse?.credential;

    if (!credential) {
      throw new Error("Google credential is required.");
    }

    setGoogleLoading(true);

    try {
      const decodedUser = decodeGoogleCredential(credential);

      if (!decodedUser?.email) {
        throw new Error("Could not decode Google account information.");
      }

      const googleData = {
        credential,
        email: decodedUser.email,
        name: decodedUser.name || "",
        picture: decodedUser.picture || "",
        sub: decodedUser.sub || "",
        emailVerified: decodedUser.email_verified || false,
      };

      setGoogleUser(googleData);
      writePendingGoogleData(googleData);

      return googleData;
    } catch (error) {
      throw error;
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Complete Profile After Google Auth
  // -------------------------------------------------------------------------
  // In UserAuthContext.jsx - Update completeGoogleSignUp function

  const completeGoogleSignUp = useCallback(
    async (profileData) => {
      const currentGoogleUser = googleUser || readPendingGoogleData();

      if (!currentGoogleUser?.credential) {
        throw new Error(
          "Google authentication is required. Please sign in with Google first.",
        );
      }

      const fullName = safeTrim(
        profileData?.fullName || currentGoogleUser.name || "",
      );
      const avatar = safeTrim(
        profileData?.avatar || currentGoogleUser.picture || "",
      );

      pendingProfileRef.current = {
        email: currentGoogleUser.email,
        fullName,
        avatar,
      };

      try {
        const data = await googleSignIn(currentGoogleUser.credential, {
          phone: safeTrim(profileData?.phone || ""),
          bio: safeTrim(profileData?.bio || ""),
          avatar,
        });

        const { token: authToken, requiresProfile } = extractAuthPayload(data);
        if (!authToken || requiresProfile) {
          throw new Error(
            "Account setup is not complete yet. Please finish required profile fields and try again.",
          );
        }

        return data;
      } catch (error) {
        console.error("Complete Google signup failed:", error);
        throw error;
      }
    },
    [googleSignIn, googleUser],
  );

  // -------------------------------------------------------------------------
  // Prompt Google One Tap / Popup
  // -------------------------------------------------------------------------
  const promptGoogleAuth = useCallback(
    (options = {}) => {
      return new Promise((resolve, reject) => {
        if (!googleLoaded || !window.google?.accounts) {
          reject(
            new Error(
              "Google Sign-In is not available. Please try again later.",
            ),
          );
          return;
        }

        if (!GOOGLE_CLIENT_ID) {
          reject(new Error("Google Sign-In is not configured."));
          return;
        }

        setSocialAuthError("");
        setGoogleLoading(true);

        try {
          let settled = false;
          const settleReject = (message) => {
            if (settled) return;
            settled = true;
            setGoogleLoading(false);
            reject(new Error(message));
          };

          const settleResolve = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
          };

          const authTimeout = window.setTimeout(() => {
            settleReject(
              "Google sign-in is taking longer than expected. Please use the official Google button below.",
            );
          }, 12000);

          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
              window.clearTimeout(authTimeout);
              setGoogleLoading(false);

              if (response.credential) {
                try {
                  if (options.mode === "signup") {
                    const result = await googleSignUp(response.credential);
                    settleResolve(result);
                  } else {
                    const result = await googleSignIn(response.credential);
                    settleResolve(result);
                  }
                } catch (error) {
                  if (!settled) reject(error);
                }
              } else {
                settleReject("Google sign-in was cancelled.");
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            context: options.mode === "signup" ? "signup" : "signin",
            ux_mode: options.uxMode || "popup",
            use_fedcm_for_prompt: true,
          });

          if (options.fallbackElement) {
            options.fallbackElement.innerHTML = "";
            window.google.accounts.id.renderButton(options.fallbackElement, {
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
              settleReject(
                "Google popup was blocked on this browser. Use the official Google button below.",
              );
            }

            if (
              notification.isDismissedMoment() &&
              notification.getDismissedReason() !== "credential_returned"
            ) {
              settleReject("Google sign-in was cancelled.");
            }
          });
        } catch (error) {
          setGoogleLoading(false);
          reject(error);
        }
      });
    },
    [googleLoaded, googleSignIn, googleSignUp],
  );

  // -------------------------------------------------------------------------
  // Clear Pending Google Data
  // -------------------------------------------------------------------------
  const clearGooglePending = useCallback(() => {
    setGoogleUser(null);
    writePendingGoogleData(null);
  }, []);

  const githubSignIn = useCallback(
    async (code, profileData = {}) => {
      if (!code) {
        throw new Error("GitHub authorization code is required.");
      }

      const data = await requestSocialProviderAuth("github", {
        code,
        phone: safeTrim(profileData?.phone || ""),
        bio: safeTrim(profileData?.bio || ""),
      });

      const { token: authToken } = extractAuthPayload(data);
      if (!authToken) {
        throw new Error(
          "GitHub authentication did not return a valid session.",
        );
      }

      saveAuth(data, { persist: persistSession });
      closeModal();
      return data;
    },
    [closeModal, persistSession, requestSocialProviderAuth, saveAuth],
  );

  const startGithubAuth = useCallback((mode = "signin") => {
    if (!GITHUB_CLIENT_ID) {
      throw new Error("GitHub Sign-In is not configured.");
    }

    const redirectUrl = new URL(GITHUB_REDIRECT_PATH, window.location.origin);
    redirectUrl.searchParams.set("auth_provider", "github");

    const state = generateOauthState();
    sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);
    sessionStorage.setItem(
      GITHUB_OAUTH_INTENT_KEY,
      mode === "signup" ? "signup" : "signin",
    );
    setSocialAuthError("");

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
    authorizeUrl.searchParams.set("redirect_uri", redirectUrl.toString());
    authorizeUrl.searchParams.set("scope", GITHUB_SCOPE);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("allow_signup", "true");

    window.location.assign(authorizeUrl.toString());
  }, []);

  const cleanGithubAuthParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("auth_provider");
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, nextUrl);
  }, []);

  const consumeGithubCallback = useCallback(async () => {
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("auth_provider");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    const oauthErrorDescription = url.searchParams.get("error_description");

    if (provider !== "github" && !oauthError && (!code || !state)) {
      return;
    }

    setGithubLoading(true);
    setSocialAuthError("");

    try {
      if (oauthError) {
        throw new Error(
          oauthErrorDescription
            ? decodeURIComponent(oauthErrorDescription)
            : "GitHub sign-in was cancelled.",
        );
      }

      const expectedState = sessionStorage.getItem(GITHUB_OAUTH_STATE_KEY);

      if (!code || !state || !expectedState || expectedState !== state) {
        throw new Error(
          "GitHub sign-in could not be verified. Please try again.",
        );
      }

      await githubSignIn(code);
    } catch (error) {
      setSocialAuthError(error.message || "GitHub sign-in failed.");
      openModal("login");
    } finally {
      sessionStorage.removeItem(GITHUB_OAUTH_STATE_KEY);
      sessionStorage.removeItem(GITHUB_OAUTH_INTENT_KEY);
      cleanGithubAuthParams();
      setGithubLoading(false);
    }
  }, [cleanGithubAuthParams, githubSignIn, openModal]);

  // -------------------------------------------------------------------------
  // Email/Password Auth Methods
  // -------------------------------------------------------------------------
  const register = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = safeTrim(payload?.email || "");
      const fullName = safeTrim(payload?.fullName || payload?.full_name || "");

      const persistOverride =
        typeof payload?.persistSession === "boolean"
          ? payload.persistSession
          : persistSession;

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const registerOptions = await authFetch(
        `${API_URL}/auth/webauthn/register-options`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            name: fullName,
          }),
        },
      );

      const optionsPayload = registerOptions?.data || registerOptions;
      const options = optionsPayload?.options || registerOptions?.options;
      const sessionData =
        optionsPayload?.sessionData || registerOptions?.sessionData || {};

      const attestationResponse = await startRegistration(options);

      const data = await authFetch(`${API_URL}/auth/webauthn/register-verify`, {
        method: "POST",
        body: JSON.stringify({
          email,
          name: fullName,
          webauthnUserIdB64: sessionData?.webauthnUserIdB64,
          response: attestationResponse,
        }),
      });

      saveAuth(data, { persist: persistOverride });
      setPendingEmail("");
      closeModal();
      return data;
    },
    [
      authFetch,
      closeModal,
      persistSession,
      saveAuth,
      setSessionPreference,
    ],
  );

  const login = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = safeTrim(payload?.email || "");

      const persistOverride =
        typeof payload?.persistSession === "boolean"
          ? payload.persistSession
          : persistSession;

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const loginOptions = await authFetch(
        `${API_URL}/auth/webauthn/login-options`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      );

      const optionsPayload = loginOptions?.data || loginOptions;
      const options = optionsPayload?.options || loginOptions?.options;
      const authenticationResponse = await startAuthentication(options);

      const data = await authFetch(`${API_URL}/auth/webauthn/login-verify`, {
        method: "POST",
        body: JSON.stringify({
          email,
          response: authenticationResponse,
        }),
      });

      saveAuth(data, { persist: persistOverride });
      setPendingEmail("");
      closeModal();
      return data;
    },
    [authFetch, closeModal, persistSession, saveAuth, setSessionPreference],
  );

  const verifyCode = useCallback(
    async (email, code) => {
      void email;
      void code;
      throw new Error("Verification codes are disabled. Use passkey authentication.");
    },
    [],
  );

  const resendCode = useCallback(
    async (email) => {
      void email;
      throw new Error("Verification codes are disabled. Use passkey authentication.");
    },
    [],
  );

  const checkEmail = useCallback(
    async (email) => {
      void email;
      return {};
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Profile Management
  // -------------------------------------------------------------------------
  const updateProfile = useCallback(
    async (updates) => {
      const data = await authFetch(`${API_URL}/auth/webauthn/profile`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      const payload = data?.data || data;
      const updatedUser = payload?.user || payload;

      const normalized = normalizeUser(
        { ...(user || {}), ...(updatedUser || {}) },
        { profileCache: profileCacheRef.current },
      );

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      return data;
    },
    [authFetch, cacheProfile, user],
  );

  const refreshAuthToken = useCallback(async () => {
    throw new Error("Refresh token flow is disabled for passkey auth.");
  }, []);

  const uploadAvatar = useCallback(
    async (file) => {
      if (!(file instanceof File)) {
        throw new Error("Please select a valid image file to upload.");
      }

      const maxSize = 10 * 1024 * 1024; // Increased to 10MB as per modern standards
      if (file.size > maxSize) {
        throw new Error("Image size must be 10MB or less.");
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/avif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Please upload a valid image (JPEG, PNG, GIF, WebP, or AVIF).",
        );
      }

      const endpoint =
        AVATAR_UPLOAD_URL || `${API_URL}${DEFAULT_AVATAR_UPLOAD_PATH}`;

      const formData = new FormData();
      // Most backends expect 'image' or 'file' or 'avatar'
      formData.append("image", file);
      formData.append("type", "avatar");

      const data = await authFetch(endpoint, {
        method: "POST",
        body: formData,
      });

      // The backend returns the URL directly or in a data object
      const payload = data?.data || data || {};
      const uploadedAvatar =
        payload.url || payload.imageUrl || avatarFromPayload(payload);

      if (!uploadedAvatar) {
        throw new Error(
          "Upload succeeded but no image URL was returned from the server.",
        );
      }

      // 1. Update the local user state first for immediate UI feedback
      const normalized = normalizeUser(
        { ...(user || {}), avatar: uploadedAvatar },
        { profileCache: profileCacheRef.current },
      );

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      // 2. Persist the change to the user's profile record in the database
      try {
        await updateProfile({ avatar: uploadedAvatar });
      } catch (err) {
        console.error("Failed to sync avatar to profile record:", err.message);
        // We don't throw here because the image is already uploaded and shown
      }

      return uploadedAvatar;
    },
    [authFetch, cacheProfile, updateProfile, user],
  );

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authFetch(`${API_URL}/auth/webauthn/logout`, { method: "POST" }).catch(
        () => {},
      );
    } finally {
      applyLoggedOutState();
      setPendingEmail("");
      closeModal();
    }
  }, [applyLoggedOutState, authFetch, closeModal]);
  const deleteAccount = useCallback(async () => {
    const data = await authFetch(`${API_URL}/auth/webauthn/me`, {
      method: "DELETE",
    });

    applyLoggedOutState();
    closeModal();
    return data;
  }, [applyLoggedOutState, authFetch, closeModal]);

  const resetPassword = useCallback(async () => {
    throw new Error(
      "Password reset is not available. This account system uses email OTP and social login only.",
    );
  }, []);

  const changePassword = useCallback(async () => {
    throw new Error(
      "Password changes are not available. This account system uses email OTP and social login only.",
    );
  }, []);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    initializeGoogleSdk();
  }, [initializeGoogleSdk]);

  useEffect(() => {
    consumeGithubCallback();
  }, [consumeGithubCallback]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // -------------------------------------------------------------------------
  // Context Value
  // -------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      // Core Auth State
      user,
      token,
      isAuthenticated,
      authLoading,

      // Modal State
      isModalOpen,
      modalView,
      setModalView,
      pendingEmail,
      openModal,
      closeModal,

      // Google Auth State
      googleUser,
      googleLoaded,
      googleLoading,
      githubLoading,
      hasGooglePending,
      socialAuthError,

      // Email Auth Methods
      register,
      login,
      checkEmail,
      verifyCode,
      resendCode,
      refreshAuthToken,
      logout,
      deleteAccount,
      resetPassword,
      changePassword,

      // Google Auth Methods
      googleSignIn,
      googleSignUp,
      completeGoogleSignUp,
      promptGoogleAuth,
      clearGooglePending,
      clearSocialAuthError,

      // GitHub Auth
      githubSignIn,
      startGithubAuth,

      // Profile Methods
      updateProfile,
      uploadAvatar,

      // Session Management
      persistSession,
      setSessionPreference,

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
      openModal,
      closeModal,
      googleUser,
      googleLoaded,
      googleLoading,
      githubLoading,
      hasGooglePending,
      socialAuthError,
      register,
      login,
      checkEmail,
      verifyCode,
      resendCode,
      refreshAuthToken,
      logout,
      deleteAccount,
      resetPassword,
      changePassword,
      googleSignIn,
      googleSignUp,
      completeGoogleSignUp,
      promptGoogleAuth,
      clearGooglePending,
      clearSocialAuthError,
      githubSignIn,
      startGithubAuth,
      updateProfile,
      uploadAvatar,
      persistSession,
      setSessionPreference,
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
  const context = useContext(UserAuthContext);

  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }

  return context;
}

export default UserAuthContext;
