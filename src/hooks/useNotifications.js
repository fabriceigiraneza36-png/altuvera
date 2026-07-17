// src/hooks/useNotifications.js
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useUserAuth } from "../context/UserAuthContext";

/* ─────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────*/
const API_BASE   = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const TOKEN_KEY  = "altuvera_auth_token";
const POLL_MS    = 60_000;          // unread-count refresh
const BOOKING_MS = 5 * 60_000;     // booking proximity check
const PROX_DAYS  = [1, 3, 7];      // thresholds for trip alerts
const MAX_FAILS  = 3;              // stop polling after N consecutive errors

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────*/
const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    );
  } catch {
    return null;
  }
};

const authFetch = (url, opts = {}) => {
  const token = getToken();
  return fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
};

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);

/* ─────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────────*/
export function useNotifications() {
  const { user, isAuthenticated } = useUserAuth();

  /* ── Core state ── */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [total,         setTotal]         = useState(0);
  const [tripAlerts,    setTripAlerts]    = useState([]);

  /* ── Refs ── */
  const mountedRef   = useRef(true);
  const pollRef      = useRef(null);
  const bookingRef   = useRef(null);
  const alertedRef   = useRef(new Set());   // keys already shown
  const failsRef     = useRef(0);
  const abortRef     = useRef(null);
  const socketRef    = useRef(null);

  /* ══════════════════════════════════════════════════════════
     FETCH — notifications list
     GET /api/notifications/my?page=&limit=
  ══════════════════════════════════════════════════════════*/
  const fetchNotifications = useCallback(
    async (pageNum = 1) => {
      if (!isAuthenticated)          return;
      if (failsRef.current >= MAX_FAILS) return;

      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const res = await authFetch(
          `${API_BASE}/notifications/my?page=${pageNum}&limit=20`,
          { signal: abortRef.current.signal },
        );

        // Not logged in
        if (res.status === 401 || res.status === 403) {
          failsRef.current = MAX_FAILS;
          if (mountedRef.current) {
            setNotifications([]);
            setUnreadCount(0);
          }
          return;
        }

        // Route missing — back off silently
        if (res.status === 404) {
          failsRef.current += 1;
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!mountedRef.current) return;

        failsRef.current = 0;

        const rows = data.data || [];
        setNotifications((prev) =>
          pageNum === 1 ? rows : [...prev, ...rows],
        );
        setUnreadCount(data.unread_count ?? 0);
        setTotal(data.pagination?.total        ?? 0);
        setTotalPages(data.pagination?.total_pages ?? 1);
        setPage(pageNum);

        /* Merge trip alerts from server response */
        const serverAlerts = data.tripAlerts ?? [];
        if (serverAlerts.length > 0 && mountedRef.current) {
          setTripAlerts((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const fresh = serverAlerts.filter(
              (a) => !existingIds.has(a.id),
            );
            return fresh.length ? [...fresh, ...prev] : prev;
          });
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        failsRef.current += 1;
        if (mountedRef.current) setError(err.message);
        console.warn("[useNotifications] fetch error:", err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [isAuthenticated],
  );

  /* ══════════════════════════════════════════════════════════
     FETCH — unread count only (lightweight poll)
     GET /api/notifications/my/unread-count
  ══════════════════════════════════════════════════════════*/
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated)              return;
    if (failsRef.current >= MAX_FAILS) return;
    try {
      const res = await authFetch(
        `${API_BASE}/notifications/my/unread-count`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (mountedRef.current) setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  /* ── Convenience ── */
  const refresh = useCallback(() => {
    failsRef.current = 0;
    fetchNotifications(1);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) fetchNotifications(page + 1);
  }, [fetchNotifications, loading, page, totalPages]);

  /* ══════════════════════════════════════════════════════════
     TRIP PROXIMITY ALERTS  (client-side, from bookings)
  ══════════════════════════════════════════════════════════*/
  const checkUpcomingBookings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const res = await authFetch(
        `${API_BASE}/bookings/my-bookings?status=confirmed&limit=20`,
      );
      if (!res.ok) return;
      const data     = await res.json();
      const bookings = data.data || data.bookings || [];
      const fresh    = [];

      for (const b of bookings) {
        if (!b.travel_date) continue;
        const days = daysUntil(b.travel_date);
        if (days < 0) continue;

        for (const threshold of PROX_DAYS) {
          if (days > threshold) continue;
          const key = `${b.id}-${threshold}`;
          if (alertedRef.current.has(key)) break;

          alertedRef.current.add(key);
          const dest = b.destination_name || "Your Adventure";
          const msg  =
            days === 0 ? `🌍 Your trip "${dest}" is TODAY!` :
            days === 1 ? `✈️ Your trip "${dest}" is TOMORROW!` :
                         `🗓️ Your trip "${dest}" is in ${days} days.`;

          fresh.push({
            id:           key,
            bookingId:    b.id,
            bookingNumber: b.booking_number,
            destination:  dest,
            travelDate:   b.travel_date,
            daysUntil:    days,
            message:      msg,
            type:         days <= 1 ? "urgent" : days <= 3 ? "warning" : "info",
            createdAt:    new Date().toISOString(),
          });
          break;  // only emit the closest threshold
        }
      }

      if (fresh.length > 0 && mountedRef.current) {
        setTripAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const added = fresh.filter((a) => !existingIds.has(a.id));
          return added.length ? [...added, ...prev] : prev;
        });
      }
    } catch (err) {
      console.warn("[useNotifications] booking check error:", err.message);
    }
  }, [isAuthenticated, user?.id]);

  const dismissTripAlert = useCallback(
    (id) => setTripAlerts((p) => p.filter((a) => a.id !== id)),
    [],
  );

  const dismissAllTripAlerts = useCallback(
    () => setTripAlerts([]),
    [],
  );

  /* ══════════════════════════════════════════════════════════
     ACTIONS
  ══════════════════════════════════════════════════════════*/

  /* PATCH /api/notifications/:id/read */
  const markRead = useCallback(async (id) => {
    // Optimistic UI
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await authFetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
      });
    } catch (err) {
      console.warn("[useNotifications] markRead error:", err.message);
    }
  }, []);

  /* PATCH /api/notifications/mark-all-read */
  const markAllRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      await authFetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "PATCH",
      });
    } catch (err) {
      console.warn("[useNotifications] markAllRead error:", err.message);
    }
  }, []);

  /* PATCH /api/notifications/:id/react  body: { reaction } */
  const react = useCallback(async (id, reaction) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, reaction } : n)),
    );
    try {
      await authFetch(`${API_BASE}/notifications/${id}/react`, {
        method: "PATCH",
        body:   JSON.stringify({ reaction }),
      });
    } catch (err) {
      console.warn("[useNotifications] react error:", err.message);
    }
  }, []);

  /* POST /api/notifications/:id/reply  body: { replyText } */
  const reply = useCallback(async (id, replyText) => {
    if (!replyText?.trim()) throw new Error("Reply text is required");

    const res = await authFetch(`${API_BASE}/notifications/${id}/reply`, {
      method: "POST",
      body:   JSON.stringify({ replyText: replyText.trim() }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Failed (${res.status})`);
    }

    const data = await res.json();
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              reply_text: replyText.trim(),
              replied_at: new Date().toISOString(),
            }
          : n,
      ),
    );
    return data;
  }, []);

  /* DELETE /api/notifications/:id */
  const deleteOne = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((c) => Math.max(0, c - 1));
    setUnreadCount((c) => {
      // Reduce count only if the deleted item was unread
      return c; // already reflected by server next poll
    });

    try {
      await authFetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[useNotifications] deleteOne error:", err.message);
    }
  }, []);

  /* DELETE /api/notifications/clear-all */
  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    setTotal(0);

    try {
      await authFetch(`${API_BASE}/notifications/clear-all`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[useNotifications] clearAll error:", err.message);
    }
  }, []);

  /* ══════════════════════════════════════════════════════════
     SOCKET.IO  — real-time updates (optional)
  ══════════════════════════════════════════════════════════*/
  useEffect(() => {
    if (!isAuthenticated) return;

    // Dynamically import socket util so the hook works without it
    let cancelled = false;
    import("../utils/socket")
      .then(({ connectSocket }) => {
        if (cancelled) return;
        try {
          const socket = connectSocket();
          socketRef.current = socket;

          const onNew = (notif) => {
            if (!mountedRef.current) return;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });
            setUnreadCount((c) => c + 1);
            setTotal((c) => c + 1);
          };

          const onUpdated = (notif) => {
            if (!mountedRef.current) return;
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notif.id ? { ...n, ...notif } : n,
              ),
            );
          };

          const onAdminReplied = ({ notificationId, adminReply }) => {
            if (!mountedRef.current) return;
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notificationId
                  ? { ...n, admin_reply: adminReply }
                  : n,
              ),
            );
          };

          const onUnreadCount = ({ count }) => {
            if (mountedRef.current) setUnreadCount(count ?? 0);
          };

          socket.on("notification:new",           onNew);
          socket.on("notification:updated",       onUpdated);
          socket.on("notification:admin-replied", onAdminReplied);
          socket.on("notification:unread-count",  onUnreadCount);

          // Request current unread count from server
          socket.emit("notification:get-unread");
        } catch {
          /* socket unavailable — polling covers it */
        }
      })
      .catch(() => { /* utils/socket.js not present */ });

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.off("notification:new");
        socket.off("notification:updated");
        socket.off("notification:admin-replied");
        socket.off("notification:unread-count");
      }
    };
  }, [isAuthenticated]);

  /* ══════════════════════════════════════════════════════════
     LIFECYCLE — mount / unmount / auth change
  ══════════════════════════════════════════════════════════*/
  useEffect(() => {
    mountedRef.current = true;
    failsRef.current   = 0;

    if (!isAuthenticated) {
      // Clear state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      setTripAlerts([]);
      return;
    }

    fetchNotifications(1);
    checkUpcomingBookings();

    pollRef.current    = setInterval(fetchUnreadCount,      POLL_MS);
    bookingRef.current = setInterval(checkUpcomingBookings, BOOKING_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(pollRef.current);
      clearInterval(bookingRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [
    isAuthenticated,
    fetchNotifications,
    fetchUnreadCount,
    checkUpcomingBookings,
  ]);

  /* ══════════════════════════════════════════════════════════
     DERIVED
  ══════════════════════════════════════════════════════════*/
  const groupedNotifications = useMemo(
    () => ({
      all: notifications,
      unread:  notifications.filter((n) => !n.is_read),
      read:    notifications.filter((n) =>  n.is_read),
      booking: notifications.filter(
        (n) => n.type?.startsWith("booking") || n.category === "booking",
      ),
      system: notifications.filter(
        (n) =>
          !n.type?.startsWith("booking") && n.category !== "booking",
      ),
    }),
    [notifications],
  );

  /* ══════════════════════════════════════════════════════════
     RETURN
  ══════════════════════════════════════════════════════════*/
  return {
    /* State */
    notifications,
    groupedNotifications,
    unreadCount,
    loading,
    error,
    page,
    totalPages,
    total,
    hasMore:  page < totalPages,
    tripAlerts,

    /* Trip alerts */
    dismissTripAlert,
    dismissAllTripAlerts,

    /* Data */
    fetchNotifications,
    loadMore,
    refresh,

    /* Actions */
    markRead,
    markAllRead,
    react,
    reply,
    deleteOne,
    clearAll,
  };
}

export default useNotifications;