/**
 * MessagePortal.jsx
 * Green/white real-time chat — persistent socket, shows username,
 * embedded package context, responsive, animated
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react'
import { useMessaging } from '../../context/MessagingContext'
import { useUserAuth }  from '../../context/UserAuthContext'
import EmojiPicker      from './EmojiPicker'
import './MessagePortal.css'

/* ── Icon component ──────────────────────────────────────────────────── */
const Icon = ({ name, className = '', ...props }) => {
  const icons = {
    globe:         (<><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>),
    send:          (<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>),
    smile:         (<><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>),
    x:             (<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>),
    mail:          (<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>),
    user:          (<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>),
    atSign:        (<><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></>),
    messageCircle: (<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>),
    headphones:    (<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>),
    mapPin:        (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>),
    calendar:      (<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
    compass:       (<><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>),
    plane:         (<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>),
    check:         (<polyline points="20 6 9 17 4 12"/>),
    checkCheck:    (<><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></>),
    sparkles:      (<><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>),
    shieldCheck:   (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>),
    messagesSquare:(<><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></>),
    alertCircle:   (<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
    package:       (<><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>),
    externalLink:  (<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>),
    logIn:         (<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>),
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={`mp__icon ${className}`}
      aria-hidden="true" {...props}>
      {icons[name] || icons.messageCircle}
    </svg>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
const formatTime = (d) => {
  if (!d) return ''
  try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

const formatDay = (d) => {
  if (!d) return ''
  try {
    const dt = new Date(d)
    const diff = Math.floor((new Date() - dt) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return '' }
}

const groupByDay = (msgs) => {
  const g = []; let last = null
  for (const m of msgs) {
    const day = formatDay(m.createdAt)
    if (day !== last) { g.push({ type: 'day', label: day, key: `day-${m.id}-${day}` }); last = day }
    g.push({ type: 'message', msg: m, key: `msg-${m.id}` })
  }
  return g
}

const fmtPrice = (p, c = 'USD') => {
  if (!p && p !== 0) return 'Contact Us'
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(p) }
  catch { return `$${Number(p).toLocaleString()}` }
}

/* ── Subcomponents ────────────────────────────────────────────────────── */

const ConnectionDot = ({ state }) => {
  const map = {
    connected:    { color: '#16a34a', pulse: true  },
    connecting:   { color: '#4ade80', pulse: true  },
    reconnecting: { color: '#4ade80', pulse: true  },
    disconnected: { color: '#bbf7d0', pulse: false },
  }
  const cfg = map[state] || map.disconnected
  return (
    <span className="mp__status-dot-wrap">
      <span className={`mp__status-dot ${cfg.pulse ? 'mp__status-dot--pulse' : ''}`}
        style={{ background: cfg.color }} />
    </span>
  )
}

/* ── User identity bar — shows when logged in ──────────────────────── */
const UserIdentityBar = ({ user }) => {
  if (!user) return null
  const initials = (user.fullName || user.name || user.email || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const displayName = user.fullName || user.name || user.email?.split('@')[0] || 'Traveler'

  return (
    <div className="mp__user-bar">
      <div className="mp__user-bar-avatar">{initials}</div>
      <div className="mp__user-bar-info">
        <p className="mp__user-bar-name">{displayName}</p>
        {user.email && <p className="mp__user-bar-email">{user.email}</p>}
      </div>
      <div className="mp__user-bar-badge">
        <Icon name="shieldCheck" />
        Verified
      </div>
    </div>
  )
}

/* ── Package context card ─────────────────────────────────────────────── */
const PackageContextCard = ({ pkg, onClear }) => {
  if (!pkg) return null
  return (
    <div className="mp__pkg-card">
      <div className="mp__pkg-card-inner">
        {pkg.image && (
          <div className="mp__pkg-img-wrap">
            <img src={pkg.image} alt={pkg.title} className="mp__pkg-img" />
          </div>
        )}
        <div className="mp__pkg-info">
          <span className="mp__pkg-label"><Icon name="package" /> Asking about</span>
          <p className="mp__pkg-title">{pkg.title}</p>
          {pkg.destination && (
            <p className="mp__pkg-dest"><Icon name="mapPin" />{pkg.destination}</p>
          )}
          {pkg.price && (
            <p className="mp__pkg-price">
              {fmtPrice(pkg.price, pkg.currency || 'USD')}
              <span className="mp__pkg-price-label"> / {pkg.priceLabel || 'per person'}</span>
            </p>
          )}
        </div>
        <div className="mp__pkg-actions">
          {pkg.slug && (
            <a href={`/packages/${pkg.slug}`} target="_blank" rel="noopener noreferrer"
              className="mp__pkg-view-btn" title="View package">
              <Icon name="externalLink" />
            </a>
          )}
          <button className="mp__pkg-clear-btn" onClick={onClear}
            title="Remove" type="button">
            <Icon name="x" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Message bubble with user name + package context ──────────────────── */
const MessageBubble = React.memo(({ msg, isOwn, userName }) => {
  const pkgCtx = msg.packageContext || msg.metadata?.packageContext
  const senderDisplay = isOwn
    ? (userName || msg.senderName || 'You')
    : (msg.senderName || 'Support')

  return (
    <div className={`mp__bubble-row ${isOwn ? 'mp__bubble-row--own' : ''} ${msg.isOptimistic ? 'mp__bubble-row--optimistic' : ''}`}>
      {!isOwn && (
        <div className="mp__avatar-sm"><Icon name="headphones" /></div>
      )}
      {isOwn && (
        <div className="mp__avatar-sm mp__avatar-sm--user">
          {(senderDisplay[0] || 'U').toUpperCase()}
        </div>
      )}

      <div className={`mp__bubble ${isOwn ? 'mp__bubble--own' : 'mp__bubble--other'}`}>
        {/* Sender name — shown for both sides */}
        <p className={`mp__bubble-sender ${isOwn ? 'mp__bubble-sender--own' : ''}`}>
          {isOwn ? <Icon name="user" /> : <Icon name="shieldCheck" />}
          {senderDisplay}
        </p>

        {/* Package reference */}
        {pkgCtx && (
          <div className={`mp__bubble-pkg ${isOwn ? 'mp__bubble-pkg--own' : ''}`}>
            {pkgCtx.image && (
              <img src={pkgCtx.image} alt={pkgCtx.title} className="mp__bubble-pkg-img" />
            )}
            <div className="mp__bubble-pkg-info">
              <span className="mp__bubble-pkg-label">
                <Icon name="package" /> Package inquiry
              </span>
              <p className="mp__bubble-pkg-title">{pkgCtx.title}</p>
            </div>
          </div>
        )}

        <p className="mp__bubble-text">{msg.body}</p>

        <div className="mp__bubble-meta">
          <span className="mp__bubble-time">{formatTime(msg.createdAt)}</span>
          {isOwn && (
            msg.isOptimistic ? (
              <span className="mp__bubble-sending"><span className="mp__send-dot" /></span>
            ) : (
              <span className={`mp__bubble-status ${msg.isRead ? 'mp__bubble-status--read' : ''}`}
                title={msg.isRead ? 'Read' : 'Sent'}>
                <Icon name={msg.isRead ? 'checkCheck' : 'check'} />
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
})
MessageBubble.displayName = 'MessageBubble'

/* ── Typing indicator ─────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="mp__bubble-row mp__bubble-row--typing-anim">
    <div className="mp__avatar-sm"><Icon name="headphones" /></div>
    <div className="mp__bubble mp__bubble--other mp__bubble--typing">
      <span className="mp__typing-dot" /><span className="mp__typing-dot" /><span className="mp__typing-dot" />
    </div>
  </div>
)

/* ── Quick chips ──────────────────────────────────────────────────────── */
const QUICK_CHIPS = [
  { label: 'Destinations', icon: 'mapPin'   },
  { label: 'Booking',      icon: 'calendar' },
  { label: 'Wildlife',     icon: 'compass'  },
  { label: 'Planning',     icon: 'plane'    },
]

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PORTAL
   ══════════════════════════════════════════════════════════════════════════ */
export default function MessagePortal() {
  const {
    isOpen, closePortal,
    messages, sendMessage, emitTyping,
    isTyping, adminOnline, connected,
    connectionState, sendingMsg, registered,
    newConversationNotification,
    packageContext, clearPackageContext,
  } = useMessaging()

  const { user, isAuthenticated, openModal: openAuthModal } = useUserAuth()

  const [input,       setInput]       = useState('')
  const [emojiOpen,   setEmojiOpen]   = useState(false)
  const [isTypingNow, setIsTypingNow] = useState(false)
  const [guestName,   setGuestName]   = useState('')
  const [guestEmail,  setGuestEmail]  = useState('')
  const [showIntro,   setShowIntro]   = useState(true)

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const typingTimer = useRef(null)
  const emojiRef    = useRef(null)

  const userName = user?.fullName || user?.name || user?.email?.split('@')[0] || ''

  /* auto-scroll */
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() =>
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(t)
  }, [messages, isTyping, isOpen])

  /* focus on open */
  useEffect(() => {
    if (isOpen && registered) {
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [isOpen, registered])

  /* hide intro */
  useEffect(() => { if (messages.length > 0) setShowIntro(false) }, [messages.length])
  useEffect(() => { if (packageContext) setShowIntro(false) }, [packageContext])
  useEffect(() => {
    if (newConversationNotification && isOpen) setShowIntro(false)
  }, [newConversationNotification, isOpen])

  /* outside click → close emoji */
  useEffect(() => {
    const fn = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* Escape */
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') {
        if (emojiOpen) setEmojiOpen(false)
        else closePortal()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [emojiOpen, closePortal])

  /* typing */
  const handleTyping = useCallback(() => {
    if (!isTypingNow) { setIsTypingNow(true); emitTyping(true) }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setIsTypingNow(false); emitTyping(false)
    }, 2500)
  }, [isTypingNow, emitTyping])

  /* resize textarea */
  const resizeTextarea = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  /* send */
  const handleSend = useCallback(() => {
    const body = input.trim()
    if (!body) return
    if (!user && !guestName.trim()) {
      inputRef.current?.blur()
      return
    }
    clearTimeout(typingTimer.current)
    emitTyping(false)
    setIsTypingNow(false)
    sendMessage(body, {
      guestName:  guestName.trim()  || user?.fullName || user?.name || 'Guest',
      guestEmail: guestEmail.trim() || user?.email    || null,
    })
    setInput('')
    setEmojiOpen(false)
    setShowIntro(false)
    if (inputRef.current) inputRef.current.style.height = '38px'
    inputRef.current?.focus()
  }, [input, user, guestName, guestEmail, sendMessage, emitTyping])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    else handleTyping()
  }, [handleSend, handleTyping])

  /* emoji insert */
  const handleEmojiSelect = useCallback((emoji) => {
    const el = inputRef.current
    if (el) {
      const s = el.selectionStart ?? input.length
      const e = el.selectionEnd   ?? input.length
      const v = input.slice(0, s) + emoji + input.slice(e)
      setInput(v); setEmojiOpen(false)
      requestAnimationFrame(() => {
        el.focus(); el.setSelectionRange(s + emoji.length, s + emoji.length)
        resizeTextarea()
      })
    } else {
      setInput((p) => p + emoji); setEmojiOpen(false)
    }
  }, [input, resizeTextarea])

  const grouped = useMemo(() => groupByDay(messages), [messages])

  const statusLabel = useMemo(() => {
    if (connectionState === 'connected' && adminOnline) return 'Support is online'
    if (connectionState === 'connected')    return 'Connected'
    if (connectionState === 'connecting')   return 'Connecting…'
    if (connectionState === 'reconnecting') return 'Reconnecting…'
    return 'Offline'
  }, [connectionState, adminOnline])

  if (!isOpen) return null

  return (
    <>
      <div className="mp__backdrop" onClick={closePortal} aria-hidden="true" />

      <div className="mp" role="dialog" aria-label="Live support chat" aria-modal="true">

        {/* ── Header ── */}
        <div className="mp__header">
          <div className="mp__header-left">
            <div className="mp__support-avatar">
              <Icon name="globe" />
              {adminOnline && <span className="mp__online-ring" />}
            </div>
            <div className="mp__header-info">
              <h3 className="mp__header-title">Altuvera Support</h3>
              <div className="mp__header-status">
                <ConnectionDot state={connectionState} />
                <span className="mp__header-status-text">{statusLabel}</span>
              </div>
            </div>
          </div>
          <div className="mp__header-actions">
            {newConversationNotification && (
              <div className="mp__notification-badge" title="New message">
                <Icon name="alertCircle" />
              </div>
            )}
            <button className="mp__header-btn"
              onClick={() => { window.location.href = 'mailto:support@altuvera.com' }}
              title="Email us" type="button" aria-label="Email support">
              <Icon name="mail" />
            </button>
            <button className="mp__header-btn" onClick={closePortal}
              aria-label="Close chat" title="Close" type="button">
              <Icon name="x" />
            </button>
          </div>
        </div>

        {/* ── User identity bar — logged in users ── */}
        {isAuthenticated && user && <UserIdentityBar user={user} />}

        {/* ── Package context card ── */}
        {packageContext && (
          <PackageContextCard pkg={packageContext} onClear={clearPackageContext} />
        )}

        {/* ── Guest form — only for unauthenticated AND intro visible ── */}
        {!isAuthenticated && showIntro && !packageContext && (
          <div className="mp__guest-form">
            <div className="mp__guest-header">
              <Icon name="sparkles" />
              <p className="mp__guest-title">Start a conversation</p>
            </div>
            <p className="mp__guest-sub">We typically reply within minutes</p>
            <div className="mp__guest-field">
              <input className="mp__guest-input" type="text"
                placeholder="Your name (optional)"
                value={guestName} onChange={(e) => setGuestName(e.target.value)}
                autoComplete="name" />
              <Icon name="user" />
            </div>
            <div className="mp__guest-field">
              <input className="mp__guest-input" type="email"
                placeholder="Your email (optional)"
                value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                autoComplete="email" />
              <Icon name="atSign" />
            </div>

            {/* Sign in prompt */}
            {typeof openAuthModal === 'function' && (
              <button
                onClick={() => { closePortal(); openAuthModal('login', { skipNotLoggedInMessage: true }) }}
                className="mp__guest-signin"
                type="button"
              >
                <Icon name="logIn" />
                Already have an account? <strong>Sign in</strong>
              </button>
            )}
          </div>
        )}

        {/* ── Messages ── */}
        <div className="mp__messages" role="log" aria-live="polite">

          {/* Generic intro */}
          {showIntro && messages.length === 0 && !packageContext && (
            <div className="mp__intro">
              <div className="mp__intro-icon-wrap">
                <Icon name="messagesSquare" />
              </div>
              <h4 className="mp__intro-title">
                {userName
                  ? `Hi ${userName}! 👋`
                  : 'Welcome to Altuvera!'}
              </h4>
              <p className="mp__intro-text">
                Ask us anything about destinations, bookings, safaris, or travel planning.
                We're here to help!
              </p>
              <div className="mp__intro-chips">
                {QUICK_CHIPS.map((chip) => (
                  <button key={chip.label} className="mp__intro-chip"
                    onClick={() => { setInput(chip.label); setShowIntro(false); inputRef.current?.focus() }}
                    type="button">
                    <Icon name={chip.icon} />{chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Package context intro */}
          {showIntro && messages.length === 0 && packageContext && (
            <div className="mp__pkg-intro">
              <div className="mp__pkg-intro-icon">
                <Icon name="messagesSquare" />
              </div>
              <h4 className="mp__pkg-intro-title">
                {userName
                  ? `Hi ${userName}! Ask about this package`
                  : 'Ask about this package'}
              </h4>
              <p className="mp__pkg-intro-text">
                You're chatting about <strong>{packageContext.title}</strong>.
                Ask us anything — availability, pricing, customization, or group bookings.
              </p>
              <div className="mp__pkg-intro-chips">
                {['Availability?', 'Group discount?', 'Customise trip', 'Book now'].map((q) => (
                  <button key={q} className="mp__intro-chip"
                    onClick={() => { setInput(q); setShowIntro(false); inputRef.current?.focus() }}
                    type="button">{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {grouped.map((item) =>
            item.type === 'day' ? (
              <div key={item.key} className="mp__day-label"><span>{item.label}</span></div>
            ) : (
              <MessageBubble
                key={item.key}
                msg={item.msg}
                isOwn={item.msg.senderType === 'user'}
                userName={userName}
              />
            )
          )}

          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div className="mp__input-area">
          {emojiOpen && (
            <div ref={emojiRef} className="mp__emoji-wrap">
              <EmojiPicker onSelect={handleEmojiSelect}
                onClose={() => setEmojiOpen(false)} />
            </div>
          )}

          <div className="mp__input-row">
            <button
              className={`mp__input-icon-btn ${emojiOpen ? 'mp__input-icon-btn--active' : ''}`}
              onClick={() => setEmojiOpen((v) => !v)}
              title="Emoji" type="button" aria-label="Toggle emoji picker">
              <Icon name="smile" />
            </button>

            <textarea ref={inputRef} className="mp__textarea"
              placeholder={
                packageContext
                  ? `Ask about ${packageContext.title}…`
                  : connected
                  ? (userName ? `Message from ${userName}…` : 'Type your message…')
                  : 'Reconnecting…'
              }
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea(); handleTyping() }}
              onKeyDown={handleKeyDown}
              rows={1} disabled={!connected}
              aria-label="Type your message"
              style={{ height: '38px', minHeight: '38px', maxHeight: '120px' }}
            />

            <button
              className={`mp__send-btn ${input.trim() && connected ? 'mp__send-btn--active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || !connected || sendingMsg}
              title="Send message" type="button">
              {sendingMsg
                ? <span className="mp__send-spinner" />
                : <Icon name="send" />}
            </button>
          </div>

          <p className="mp__input-hint">
            <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> new line
          </p>
        </div>
      </div>
    </>
  )
}