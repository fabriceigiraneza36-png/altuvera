import { useCallback, useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api").replace(/\\/+$/, "");
const TOKEN_KEY = "altuvera_auth_token";

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

const base64UrlToBytes = (value) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const encoded = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(encoded);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const readResponse = async (response, fallback) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false || data.error) {
    throw new Error(data.message || data.error || fallback);
  }
  return data;
};

const pushHeaders = () => {
  const token = getToken();
  if (!token) throw new Error("Please sign in again before enabling browser notifications.");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
};

async function saveSubscription(subscription) {
  const json = subscription?.toJSON?.() || {};
  if (!subscription?.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("The browser did not return a complete notification subscription. Please try enabling notifications again.");
  }

  const response = await fetch(API_BASE + "/push/subscribe", {
    method: "POST",
    credentials: "include",
    headers: pushHeaders(),
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      userAgent: navigator.userAgent,
    }),
  });
  await readResponse(response, "Altuvera could not register this browser.");
}

export function useBrowserPush() {
  const { isAuthenticated } = useUserAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState(() => (
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  ));
  const [deliveryAllowed, setDeliveryAllowed] = useState(null);
  const [browserSubscribed, setBrowserSubscribed] = useState(false);
  const [serverSynced, setServerSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const canPush = typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      (window.isSecureContext || window.location.hostname === "localhost");

    setSupported(canPush);
    if (!canPush) {
      setPermission("unsupported");
      setBrowserSubscribed(false);
      setServerSynced(false);
      return false;
    }

    setPermission(Notification.permission);
    setError("");

    try {
      const statusResponse = await fetch(API_BASE + "/push/user-delivery-status", {
        method: "GET",
        cache: "no-store",
      });
      const statusData = await readResponse(statusResponse, "Could not check Altuvera browser notification settings.");
      setDeliveryAllowed(statusData.enabled !== false);

      if (!isAuthenticated) {
        setBrowserSubscribed(false);
        setServerSynced(false);
        return false;
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
      const subscription = await registration.pushManager.getSubscription();
      setBrowserSubscribed(Boolean(subscription));

      if (!subscription) {
        setServerSynced(false);
        return false;
      }

      await saveSubscription(subscription);
      setServerSynced(true);
      return true;
    } catch (err) {
      setServerSynced(false);
      setError(err?.message || "Could not verify this browser notification subscription.");
      return false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;
    const runRefresh = async () => {
      if (!active) return;
      await refresh();
    };
    runRefresh();
    const onFocus = () => runRefresh();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const enablePush = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!supported || !isAuthenticated) {
        throw new Error("Sign in using a supported browser to enable notifications.");
      }

      let nextPermission = Notification.permission;
      if (nextPermission === "default") {
        nextPermission = await Notification.requestPermission();
      }
      setPermission(nextPermission);

      if (nextPermission === "denied") {
        throw new Error("Notifications are blocked for this site. Allow them in your browser or device site settings, then return and try again.");
      }
      if (nextPermission !== "granted") {
        throw new Error("Browser notification permission was not granted.");
      }

      const keyResponse = await fetch(API_BASE + "/push/vapid-public-key", { cache: "no-store" });
      const keyData = await readResponse(keyResponse, "Could not load Altuvera push configuration.");
      if (!keyData.publicKey) {
        throw new Error("Browser notifications are temporarily unavailable. Please contact Altuvera support.");
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(keyData.publicKey),
        });
      }

      await saveSubscription(subscription);
      setBrowserSubscribed(true);
      setServerSynced(true);
      setError("");
      return true;
    } catch (err) {
      setError(err?.message || "Could not enable browser notifications.");
      await refresh();
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, isAuthenticated, refresh]);

  const enabled = browserSubscribed && serverSynced;
  const showReminder = Boolean(
    isAuthenticated && supported && deliveryAllowed === true && !enabled
  );

  return {
    supported,
    permission,
    deliveryAllowed,
    browserSubscribed,
    serverSynced,
    enabled,
    showReminder,
    loading,
    error,
    enablePush,
    refresh,
  };
}
