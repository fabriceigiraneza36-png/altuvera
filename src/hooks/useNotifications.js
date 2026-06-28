/**
 * useNotifications — user-facing notification hook
 *
 * Features:
 *  - Fetches paginated notifications from REST API
 *  - Subscribes to socket events for live delivery
 *  - Tracks unread count for bell badge
 *  - Handles read / react / reply / delete
 *  - Booking-proximity alert system:
 *      checks upcoming bookings and emits local alerts
 *      when a trip is ≤ 7 days away
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { notificationsUserAPI } from '../api/notifications'
import { connectSocket, getSocket } from '../utils/socket'
import { useUserAuth } from '../context/UserAuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api'

const TOKEN_KEY = 'altuvera_auth_token'

const POLL_INTERVAL_MS      = 60_000   // re-fetch unread count every 60s
const BOOKING_CHECK_MS      = 5 * 60_000 // check upcoming bookings every 5 min
const PROXIMITY_DAYS        = [1, 3, 7]  // alert thresholds in days

// ─── Helpers ──────────────────────────────────────────────────────────────────

const msUntil = (dateStr) => {
  if (!dateStr) return Infinity
  return new Date(dateStr).getTime() - Date.now()
}

const daysUntil = (dateStr) => Math.ceil(msUntil(dateStr) / 86_400_000)

const getToken = () => {
  try {
    return (
      localStorage.getItem(TOKEN_KEY)   ||
      sessionStorage.getItem(TOKEN_KEY) ||
      null
    )
  } catch { return null }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const { user, isAuthenticated } = useUserAuth()

  // ── Notification list state ────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [total,         setTotal]         = useState(0)

  // ── Trip proximity alerts ──────────────────────────────────────────────────
  // Local alerts shown in UI (not saved to DB — ephemeral)
  const [tripAlerts,    setTripAlerts]    = useState([])

  // ── Refs ───────────────────────────────────────────────────────────────────
  const pollTimerRef         = useRef(null)
  const bookingCheckTimerRef = useRef(null)
  const alertedBookingsRef   = useRef(new Set()) // prevent repeat alerts

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH notifications
  // ─────────────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const data = await notificationsUserAPI.getAll({
        page:  pageNum,
        limit: 20,
      })
      const rows = data.data || []
      setNotifications(prev =>
        pageNum === 1 ? rows : [...prev, ...rows],
      )
      setUnreadCount(data.unread_count ?? 0)
      setTotal(data.pagination?.total ?? 0)
      setTotalPages(data.pagination?.total_pages ?? 1)
      setPage(pageNum)
    } catch (err) {
      console.warn('[useNotifications] fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await notificationsUserAPI.getUnreadCount()
      setUnreadCount(data.count ?? 0)
    } catch { /* silent */ }
  }, [isAuthenticated])

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) fetchNotifications(page + 1)
  }, [fetchNotifications, loading, page, totalPages])

  const refresh = useCallback(() => fetchNotifications(1), [fetchNotifications])

  // ─────────────────────────────────────────────────────────────────────────
  // UPCOMING BOOKING PROXIMITY ALERTS
  // ─────────────────────────────────────────────────────────────────────────

  const checkUpcomingBookings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(
        `${API_BASE}/bookings/my-bookings?status=confirmed&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return
      const data = await res.json()
      const bookings = data.data || data.bookings || []

      const newAlerts = []

      for (const b of bookings) {
        if (!b.travel_date) continue
        const days = daysUntil(b.travel_date)
        if (days < 0) continue // past

        for (const threshold of PROXIMITY_DAYS) {
          const alertKey = `${b.id}-${threshold}`
          if (alertedBookingsRef.current.has(alertKey)) continue

          if (days <= threshold) {
            alertedBookingsRef.current.add(alertKey)

            const alertMsg =
              days === 0
                ? `🌍 Your trip "${b.destination_name || 'Your Adventure'}" is TODAY! Have a wonderful journey!`
                : days === 1
                ? `✈️ Your trip "${b.destination_name || 'Your Adventure'}" is TOMORROW! Time to pack!`
                : `🗓️ Your trip "${b.destination_name || 'Your Adventure'}" is in ${days} days. Are you ready?`

            newAlerts.push({
              id:            alertKey,
              bookingId:     b.id,
              bookingNumber: b.booking_number,
              destination:   b.destination_name || 'Your Adventure',
              travelDate:    b.travel_date,
              daysUntil:     days,
              message:       alertMsg,
              type:          days <= 1 ? 'urgent' : days <= 3 ? 'warning' : 'info',
              createdAt:     new Date().toISOString(),
            })
            break // one alert per booking per check cycle
          }
        }
      }

      if (newAlerts.length > 0) {
        setTripAlerts(prev => {
          // Dedupe
          const existingIds = new Set(prev.map(a => a.id))
          const fresh = newAlerts.filter(a => !existingIds.has(a.id))
          return [...fresh, ...prev]
        })
      }
    } catch (err) {
      console.warn('[useNotifications] booking proximity check failed:', err.message)
    }
  }, [isAuthenticated, user?.id])

  const dismissTripAlert = useCallback((alertId) => {
    setTripAlerts(prev => prev.filter(a => a.id !== alertId))
  }, [])

  const dismissAllTripAlerts = useCallback(() => {
    setTripAlerts([])
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    try {
      await notificationsUserAPI.markRead(id)
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n,
        ),
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      // Also tell socket so badge updates across tabs
      try {
        const socket = getSocket()
        if (socket?.connected) {
          socket.emit('notification:mark-read', { id })
        }
      } catch { /* non-fatal */ }
    } catch (err) {
      console.warn('[useNotifications] markRead failed:', err.message)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await notificationsUserAPI.markAllRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })),
      )
      setUnreadCount(0)
    } catch (err) {
      console.warn('[useNotifications] markAllRead failed:', err.message)
    }
  }, [])

  const react = useCallback(async (id, reaction) => {
    try {
      await notificationsUserAPI.react(id, reaction)
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, reaction, reacted_at: new Date().toISOString() } : n,
        ),
      )
    } catch (err) {
      console.warn('[useNotifications] react failed:', err.message)
    }
  }, [])

  const reply = useCallback(async (id, replyText) => {
    if (!replyText?.trim()) return
    try {
      const data = await notificationsUserAPI.reply(id, replyText.trim())
      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, reply_text: replyText.trim(), replied_at: new Date().toISOString() }
            : n,
        ),
      )
      return data
    } catch (err) {
      console.warn('[useNotifications] reply failed:', err.message)
      throw err
    }
  }, [])

  const deleteOne = useCallback(async (id) => {
    try {
      await notificationsUserAPI.deleteOne(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.warn('[useNotifications] deleteOne failed:', err.message)
    }
  }, [])

  const clearAll = useCallback(async () => {
    try {
      await notificationsUserAPI.clearAll()
      setNotifications([])
      setUnreadCount(0)
      setTotal(0)
    } catch (err) {
      console.warn('[useNotifications] clearAll failed:', err.message)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // SOCKET — live delivery
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return

    let socket
    try {
      socket = connectSocket()
    } catch { return }

    const onNew = (notif) => {
      setNotifications(prev => {
        // Dedupe by id
        if (prev.some(n => n.id === notif.id)) return prev
        return [notif, ...prev]
      })
      setUnreadCount(prev => prev + 1)
      setTotal(prev => prev + 1)
    }

    const onUpdated = (notif) => {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, ...notif } : n)),
      )
    }

    const onUnreadCount = ({ count }) => {
      setUnreadCount(count ?? 0)
    }

    socket.on('notification:new',           onNew)
    socket.on('notification:updated',       onUpdated)
    socket.on('notification:unread-count',  onUnreadCount)

    // Request current unread count on connect
    if (socket.connected) {
      socket.emit('notification:get-unread')
    } else {
      socket.once('connect', () => {
        socket.emit('notification:get-unread')
      })
    }

    return () => {
      socket.off('notification:new',          onNew)
      socket.off('notification:updated',      onUpdated)
      socket.off('notification:unread-count', onUnreadCount)
    }
  }, [isAuthenticated])

  // ─────────────────────────────────────────────────────────────────────────
  // POLLING — fallback for when socket is unavailable
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return

    fetchNotifications(1)
    checkUpcomingBookings()

    // Poll unread count every 60s
    pollTimerRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS)

    // Check upcoming bookings every 5 min
    bookingCheckTimerRef.current = setInterval(
      checkUpcomingBookings, BOOKING_CHECK_MS,
    )

    return () => {
      clearInterval(pollTimerRef.current)
      clearInterval(bookingCheckTimerRef.current)
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount, checkUpcomingBookings])

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────────────────────────────────

  const hasMore = page < totalPages

  const groupedNotifications = useMemo(() => {
    const booking = notifications.filter(n =>
      n.type?.startsWith('booking') || n.category === 'booking',
    )
    const system = notifications.filter(n =>
      !n.type?.startsWith('booking') && n.category !== 'booking',
    )
    return { booking, system, all: notifications }
  }, [notifications])

  return {
    // State
    notifications,
    groupedNotifications,
    unreadCount,
    loading,
    hasMore,
    total,
    page,
    totalPages,

    // Trip alerts
    tripAlerts,
    dismissTripAlert,
    dismissAllTripAlerts,

    // Actions
    fetchNotifications,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    react,
    reply,
    deleteOne,
    clearAll,
  }
}

export default useNotifications