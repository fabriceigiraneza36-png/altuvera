import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL || "";
const TOKEN_STORAGE_KEY = "user_token";
const SESSION_PREF_KEY = "altuvera_persist_session";
const PROFILE_CACHE_KEY = "altuvera_profile_cache";
const DEFAULT_AVATAR_UPLOAD_PATH = "/auth/avatar";
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;

const UserAuthContext = createContext(null);

const getStoredToken = () =>
  localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);

const getStoredSessionPreference = () => {
  const stored = localStorage.getItem(SESSION_PREF_KEY);
  if (stored === null) return true;
  return stored === "true";
};

const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");

const readProfileCache = () => {
  const raw = localStorage.getItem(PROFILE_CACHE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeProfileCache = (cache) => {
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cache));
};

const avatarFromPayload = (payload) =>
  safeTrim(
    payload?.avatar ||
      payload?.avatarUrl ||
      payload?.profileImage ||
      payload?.image ||
      payload?.photo ||
      payload?.photoURL ||
      ""
  );

const resolveCachedProfile = (cache, email) => {
  if (!email) return null;
  return cache?.[email?.toLowerCase?.()] || null;
};

const normalizeUser = (
  payload,
  { fallbackEmail = "", fallbackName = "", fallbackAvatar = "", profileCache = {} } = {}
) => {
  if (!payload || typeof payload !== "object") return null;

  const email = safeTrim(payload.email || payload.userEmail || fallbackEmail);
  const cached = resolveCachedProfile(profileCache, email);
  const resolvedName = safeTrim(
    payload.fullName ||
      payload.full_name ||
      payload.name ||
      payload.displayName ||
      payload.username ||
      cached?.fullName ||
      fallbackName
  );
  const resolvedAvatar = safeTrim(
    avatarFromPayload(payload) || cached?.avatar || fallbackAvatar
  );
  const fallbackDisplayName = email ? email.split("@")[0] : "Traveler";
  const fullName = resolvedName || fallbackDisplayName;

  return {
    ...payload,
    email,
    fullName,
    name: fullName,
    avatar: resolvedAvatar || null,
  };
};

const extractAuthPayload = (data) => {
  const payload = data?.data || data;
  return {
    token: payload?.token || data?.token,
    user: payload?.user || data?.user || payload,
  };
};

const buildVerificationCodeOptions = () => ({
  forceNewCode: true,
  regenerateCode: true,
  codeExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
  verificationExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
});

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState(true);
  const [persistSession, setPersistSession] = useState(() => getStoredSessionPreference());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");

  const fetchingRef = useRef(false);
  const profileCacheRef = useRef(readProfileCache());
  const pendingProfileRef = useRef(null);

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

  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const storeToken = useCallback(
    (authToken, persist) => {
      if (!authToken) return;

      if (persist) {
        localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      } else {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, authToken);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    },
    []
  );

  const setSessionPreference = useCallback(
    (persist) => {
      const nextPreference = Boolean(persist);
      setPersistSession(nextPreference);
      localStorage.setItem(SESSION_PREF_KEY, String(nextPreference));

      const currentToken = token || getStoredToken();
      if (currentToken) {
        storeToken(currentToken, nextPreference);
      }
    },
    [storeToken, token]
  );

  const openModal = useCallback((view = "login") => {
    setModalView(view);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalView("login");
    setPendingEmail("");
    document.body.style.overflow = "";
  }, []);

  const saveAuth = useCallback(
    (data, options = {}) => {
      const { token: extractedToken, user: extractedUser } = extractAuthPayload(data);
      const persist =
        typeof options.persist === "boolean" ? options.persist : persistSession;

      if (extractedToken) {
        storeToken(extractedToken, persist);
        setToken(extractedToken);
      }

      const pendingProfile = pendingProfileRef.current;
      const normalized = normalizeUser(extractedUser, {
        fallbackEmail: pendingProfile?.email,
        fallbackName: pendingProfile?.fullName,
        fallbackAvatar: pendingProfile?.avatar,
        profileCache: profileCacheRef.current,
      });

      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }
      pendingProfileRef.current = null;

      return data;
    },
    [cacheProfile, persistSession, storeToken]
  );

  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = token || getStoredToken();
      const isFormData = options.body instanceof FormData;

      const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...options.headers,
      };

      let response;
      try {
        response = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });
      } catch {
        throw new Error("Network error. Please check your connection.");
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
          clearStoredAuth();
          setToken(null);
          setUser(null);
        }

        const errorMessage =
          data?.error ||
          data?.message ||
          data?.data?.error ||
          data?.data?.message ||
          `Request failed (${response.status})`;

        throw new Error(errorMessage);
      }

      return data || {};
    },
    [clearStoredAuth, token]
  );

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;

    const currentToken = token || getStoredToken();
    if (!currentToken) {
      setAuthLoading(false);
      return;
    }

    fetchingRef.current = true;

    try {
      const data = await authFetch(`${API_URL}/auth/me`);
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
      console.error("Failed to fetch user:", error);
      clearStoredAuth();
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
      fetchingRef.current = false;
    }
  }, [authFetch, cacheProfile, clearStoredAuth, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const register = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = payload?.email?.trim?.() || "";
      const fullName = payload?.fullName?.trim?.() || payload?.full_name?.trim?.() || "";
      const persistOverride =
        typeof payload?.persistSession === "boolean"
          ? payload.persistSession
          : persistSession;

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const body = {
        email,
        fullName,
        full_name: fullName,
        phone: payload?.phone?.trim?.() || null,
        bio: payload?.bio?.trim?.() || null,
        avatar: payload?.avatar || null,
        role: payload?.role?.trim?.() || "user",
        persistSession: persistOverride,
        rememberSession: persistOverride,
        ...buildVerificationCodeOptions(),
      };

      pendingProfileRef.current = {
        email,
        fullName,
        avatar: safeTrim(payload?.avatar || ""),
      };

      const data = await authFetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setPendingEmail(email);
      setModalView("verify");
      return data;
    },
    [authFetch, persistSession, setSessionPreference]
  );

  const login = useCallback(
    async (emailOrPayload, fullNameArg) => {
      const payload =
        typeof emailOrPayload === "object"
          ? emailOrPayload
          : { email: emailOrPayload, fullName: fullNameArg };

      const email = payload?.email?.trim?.() || "";
      const fullName = payload?.fullName?.trim?.() || payload?.full_name?.trim?.() || "";
      const persistOverride =
        typeof payload?.persistSession === "boolean"
          ? payload.persistSession
          : persistSession;

      if (typeof payload?.persistSession === "boolean") {
        setSessionPreference(payload.persistSession);
      }

      const body = {
        email,
        fullName,
        full_name: fullName,
        persistSession: persistOverride,
        rememberSession: persistOverride,
        ...buildVerificationCodeOptions(),
      };

      pendingProfileRef.current = {
        email,
        fullName,
        avatar: "",
      };

      const data = await authFetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setPendingEmail(email);
      setModalView("verify");
      return data;
    },
    [authFetch, persistSession, setSessionPreference]
  );

  const verifyCode = useCallback(
    async (email, code) => {
      const normalizedCode = String(code || "").replace(/\D/g, "").slice(0, 6);
      const data = await authFetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        body: JSON.stringify({ email, code: normalizedCode }),
      });

      saveAuth(data, { persist: persistSession });
      setPendingEmail("");
      closeModal();
      return data;
    },
    [authFetch, closeModal, persistSession, saveAuth]
  );

  const resendCode = useCallback(
    async (email) => {
      return authFetch(`${API_URL}/auth/resend-code`, {
        method: "POST",
        body: JSON.stringify({
          email: email?.trim?.() || "",
          ...buildVerificationCodeOptions(),
        }),
      });
    },
    [authFetch]
  );

  const updateProfile = useCallback(
    async (updates) => {
      const data = await authFetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      const payload = data?.data || data;
      const updatedUser = payload?.user || payload;
      const normalized = normalizeUser(
        { ...(user || {}), ...(updatedUser || {}) },
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
      if (!(file instanceof File)) {
        throw new Error("Please select an image to upload.");
      }

      const endpoint = AVATAR_UPLOAD_URL || `${API_URL}${DEFAULT_AVATAR_UPLOAD_PATH}`;
      const formData = new FormData();
      formData.append("avatar", file);

      const data = await authFetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const payload = data?.data || data || {};
      const uploadedAvatar = avatarFromPayload(payload);

      if (!uploadedAvatar) {
        throw new Error("Avatar upload succeeded but no URL was returned.");
      }

      const normalized = normalizeUser(
        { ...(user || {}), avatar: uploadedAvatar },
        { profileCache: profileCacheRef.current }
      );
      if (normalized) {
        setUser(normalized);
        cacheProfile(normalized);
      }

      await updateProfile({ avatar: uploadedAvatar }).catch(() => {});
      return uploadedAvatar;
    },
    [authFetch, cacheProfile, updateProfile, user]
  );

  const logout = useCallback(async () => {
    try {
      await authFetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => {});
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      pendingProfileRef.current = null;
      setPendingEmail("");
      closeModal();
    }
  }, [authFetch, clearStoredAuth, closeModal]);

  const googleSignIn = useCallback(
    async (credential) => {
      const data = await authFetch(`${API_URL}/auth/google`, {
        method: "POST",
        body: JSON.stringify({ credential }),
      });

      saveAuth(data, { persist: persistSession });
      closeModal();
      return data;
    },
    [authFetch, closeModal, persistSession, saveAuth]
  );

  const githubSignIn = useCallback(
    async (code) => {
      const data = await authFetch(`${API_URL}/auth/github`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      saveAuth(data, { persist: persistSession });
      closeModal();
      return data;
    },
    [authFetch, closeModal, persistSession, saveAuth]
  );

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    authLoading,

    isModalOpen,
    modalView,
    setModalView,
    pendingEmail,

    register,
    login,
    verifyCode,
    resendCode,
    logout,
    updateProfile,
    uploadAvatar,

    googleSignIn,
    githubSignIn,

    openModal,
    closeModal,

    persistSession,
    setSessionPreference,

    fetchUser,
    authFetch,
    saveAuth,
  };

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);

  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }

  return context;
}

export default UserAuthContext;
