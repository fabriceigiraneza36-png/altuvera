const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const QUEUE_KEY = "altuvera_auth_diagnostics_queue_v1";
const MAX_QUEUED = 20;

const makeReferenceId = () => {
  const random = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()
    : Math.random().toString(36).slice(2, 12).toUpperCase();
  return `AUTH-${Date.now().toString(36).toUpperCase()}-${random}`;
};

const clean = (value, max = 240) => String(value ?? "")
  .replace(/[\r\n\t]+/g, " ")
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
  .replace(/\b(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, "$1[redacted]")
  .replace(/(access_token|id_token|credential|client_secret|code)=([^&\s]+)/gi, "$1=[redacted]")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, max);

const readQueue = () => {
  try {
    const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(value) ? value.slice(-MAX_QUEUED) : [];
  } catch { return []; }
};

const writeQueue = (items) => {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUED))); }
  catch { /* diagnostics remain best-effort when storage is unavailable */ }
};

let flushPromise = null;
const flushAuthDiagnostics = () => {
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    const queue = readQueue();
    if (!queue.length || (typeof navigator !== "undefined" && navigator.onLine === false)) return;
    const remaining = [];
    for (const item of queue) {
      try {
        const response = await fetch(`${API_BASE.replace(/\/+$/, "")}/users/auth-diagnostics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
          keepalive: true,
        });
        if (!response.ok) remaining.push(item);
      } catch {
        remaining.push(item);
      }
    }
    writeQueue(remaining);
  })().finally(() => { flushPromise = null; });
  return flushPromise;
};

export const reportAuthDiagnostic = ({
  provider = "unknown",
  stage = "unknown",
  category = "unexpected",
  errorCode = "",
  httpStatus = null,
  message = "",
  error = null,
  details = {},
} = {}) => {
  const referenceId = makeReferenceId();
  const errorMessage = error?.message || error?.reason || message || "Authentication could not be completed.";
  const status = Number(httpStatus ?? error?.status ?? error?.statusCode);
  const payload = {
    referenceId,
    provider: clean(provider, 24).toLowerCase(),
    stage: clean(stage, 80),
    category: clean(category, 40).toLowerCase(),
    errorCode: clean(errorCode || error?.code || error?.name || "AUTH_FAILURE", 90),
    httpStatus: Number.isInteger(status) && status >= 100 && status <= 599 ? status : null,
    message: clean(errorMessage, 240),
    details: {
      errorName: clean(error?.name || details.errorName || "Error", 80),
      clientCode: clean(error?.code || details.clientCode || "", 80),
      online: typeof navigator === "undefined" ? null : navigator.onLine !== false,
    },
    pagePath: typeof window === "undefined" ? "" : window.location.pathname,
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
  };

  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);
  void flushAuthDiagnostics();
  return referenceId;
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void flushAuthDiagnostics(); });
}
