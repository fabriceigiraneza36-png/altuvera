// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUserAuth } from '../context/UserAuthContext';

const API_BASE    = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api';
const TOKEN_KEY   = 'altuvera_auth_token';
const POLL_MS     = 60_000;
const BOOKING_MS  = 5 * 60_000;
const PROX_DAYS   = [1, 3, 7];

const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch { return null; }
};

const msUntil   = (d) => new Date(d).getTime() - Date.now();
const daysUntil = (d) => Math.ceil(msUntil(d) / 86_400_000);

const authFetch = (url, opts = {}) => {
  const token = getToken();
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
};

export function useNotifications() {
  const { user, isAuthenticated } = useUserAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [total,         setTotal]         = useState(0);
  const [tripAlerts,    setTripAlerts]    = useState([]);

  const pollRef         = useRef(null);
  const bookingRef      = useRef(null);
  const alertedRef      = useRef(new Set());
  const socketRef       = useRef(null);
  const mountedRef      = useRef(true);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res  = await authFetch(`${API_BASE}/notifications/my?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;
      const rows = data.data || [];
      setNotifications(prev => pageNum === 1 ? rows : [...prev, ...rows]);
      setUnreadCount(data.unread_count ?? 0);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.total_pages ?? 1);
      setPage(pageNum);
    } catch (err) {
      console.warn('[useNotifications] fetch failed:', err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res  = await authFetch(`${API_BASE}/notifications/my/unread-count`);
      if (!res.ok) return;
      const data = await res.json();
      if (mountedRef.current) setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) fetchNotifications(page + 1);
  }, [fetchNotifications, loading, page, totalPages]);

  const refresh = useCallback(() => fetchNotifications(1), [fetchNotifications]);

  // ── Trip proximity alerts ─────────────────────────────────────────────────

  const checkUpcomingBookings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const res = await authFetch(
        `${API_BASE}/bookings/my-bookings?status=confirmed&limit=20`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const bookings = data.data || data.bookings || [];
      const newAlerts = [];

      for (const b of bookings) {
        if (!b.travel_date) continue;
        const days = daysUntil(b.travel_date);
        if (days < 0) continue;

        for (const threshold of PROX_DAYS) {
          const key = `${b.id}-${threshold}`;
          if (alertedRef.current.has(key)) continue;
          if (days <= threshold) {
            alertedRef.current.add(key);
            const msg =
              days === 0 ? `🌍 Your trip "${b.destination_name || 'Your Adventure'}" is TODAY!` :
              days === 1 ? `✈️ Your trip "${b.destination_name || 'Your Adventure'}" is TOMORROW!` :
              `🗓️ Your trip "${b.destination_name || 'Your Adventure'}" is in ${days} days.`;
            newAlerts.push({
              id: key, bookingId: b.id, bookingNumber: b.booking_number,
              destination: b.destination_name || 'Your Adventure',
              travelDate: b.travel_date, daysUntil: days, message: msg,
              type: days <= 1 ? 'urgent' : days <= 3 ? 'warning' : 'info',
              createdAt: new Date().toISOString(),
            });
            break;
          }
        }
      }

      if (newAlerts.length > 0 && mountedRef.current) {
        setTripAlerts(prev => {
          const ids = new Set(prev.map(a => a.id));
          return [...newAlerts.filter(a => !ids.has(a.id)), ...prev];
        });
      }
    } catch (err) {
      console.warn('[useNotifications] booking check failed:', err.message);
    }
  }, [isAuthenticated, user?.id]);

  const dismissTripAlert    = useCallback((id) => setTripAlerts(p => p.filter(a => a.id !== id)), []);
  const dismissAllTripAlerts = useCallback(() => setTripAlerts([]), []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id
        ? { ...n, is_read: true, read_at: new Date().toISOString() } : n),
    );
    setUnreadCount(c => Math.max(0, c - 1));
    try {
      await authFetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
    } catch { /* optimistic */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await authFetch(`${API_BASE}/notifications/mark-all-read`, { method: 'PATCH' });
    } catch { /* optimistic */ }
  }, []);

  const react = useCallback(async (id, reaction) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, reaction } : n),
    );
    try {
      await authFetch(`${API_BASE}/notifications/${id}/react`, {
        method: 'PATCH', body: JSON.stringify({ reaction }),
      });
    } catch { /* optimistic */ }
  }, []);

  const reply = useCallback(async (id, replyText) => {
    if (!replyText?.trim()) return;
    const res  = await authFetch(`${API_BASE}/notifications/${id}/reply`, {
      method: 'POST', body: JSON.stringify({ replyText: replyText.trim() }),
    });
    if (!res.ok) throw new Error('Failed to send reply');
    const data = await res.json();
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, reply_text: replyText.trim(), replied_at: new Date().toISOString() } : n,
      ),
    );
    return data;
  }, []);

  const deleteOne = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setTotal(c => Math.max(0, c - 1));
    try {
      await authFetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
    } catch { /* optimistic */ }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]); setUnreadCount(0); setTotal(0);
    try {
      await authFetch(`${API_BASE}/notifications/clear-all`, { method: 'DELETE' });
    } catch { /* optimistic */ }
  }, []);

  // ── Socket ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;
    let socket;
    try {
      // Dynamically import so this works even if socket util doesn't exist
      import('../utils/socket').then(({ connectSocket }) => {
        try { socket = connectSocket(); } catch { return; }
        socketRef.current = socket;

        const onNew = (notif) => {
          if (!mountedRef.current) return;
          setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });
          setUnreadCount(c => c + 1);
          setTotal(c => c + 1);
        };

        const onUpdated = (notif) => {
          if (!mountedRef.current) return;
          setNotifications(prev =>
            prev.map(n => n.id === notif.id ? { ...n, ...notif } : n),
          );
        };

        const onAdminReplied = ({ notificationId, adminReply }) => {
          if (!mountedRef.current) return;
          setNotifications(prev =>
            prev.map(n =>
              n.id === notificationId ? { ...n, admin_reply: adminReply } : n,
            ),
          );
        };

        const onUnreadCount = ({ count }) => {
          if (mountedRef.current) setUnreadCount(count ?? 0);
        };

        socket.on('notification:new',          onNew);
        socket.on('notification:updated',      onUpdated);
        socket.on('notification:admin-replied',onAdminReplied);
        socket.on('notification:unread-count', onUnreadCount);
      }).catch(() => {/* socket not available */});
    } catch { /* silent */ }

    return () => {
      if (socketRef.current) {
        socketRef.current.off?.('notification:new');
        socketRef.current.off?.('notification:updated');
        socketRef.current.off?.('notification:admin-replied');
        socketRef.current.off?.('notification:unread-count');
      }
    };
  }, [isAuthenticated]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    if (!isAuthenticated) return;

    fetchNotifications(1);
    checkUpcomingBookings();

    pollRef.current    = setInterval(fetchUnreadCount,       POLL_MS);
    bookingRef.current = setInterval(checkUpcomingBookings,  BOOKING_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(pollRef.current);
      clearInterval(bookingRef.current);
    };
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount, checkUpcomingBookings]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const groupedNotifications = useMemo(() => ({
    booking: notifications.filter(n => n.type?.startsWith('booking') || n.category === 'booking'),
    system:  notifications.filter(n => !n.type?.startsWith('booking') && n.category !== 'booking'),
    all:     notifications,
  }), [notifications]);

  return {
    notifications,
    groupedNotifications,
    unreadCount,
    loading,
    hasMore: page < totalPages,
    total,
    page,
    totalPages,
    tripAlerts,
    dismissTripAlert,
    dismissAllTripAlerts,
    fetchNotifications,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    react,
    reply,
    deleteOne,
    clearAll,
  };
}

export default useNotifications;