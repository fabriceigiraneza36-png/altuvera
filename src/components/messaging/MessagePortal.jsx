import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react'
import { useMessaging } from '../../context/MessagingContext'
import { useUserAuth }  from '../../context/UserAuthContext'
import EmojiPicker      from './EmojiPicker'
import './MessagePortal.css'

/* ── helpers ─────────────────────────────────────────────────────────────── */
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return '' }
}

const formatDay = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d   = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return '' }
}

const groupByDay = (msgs) => {
  const groups = []
  let lastDay  = null
  for (const msg of msgs) {
    const day = formatDay(msg.createdAt)
    if (day !== lastDay) {
      groups.push({ type: 'day', label: day, key: `day-${msg.id}` })
      lastDay = day
    }
    groups.push({ type: 'message', msg, key: `msg-${msg.id}` })
  }
  return groups
}

/* ── Status dot ─────────────────────────────────────────────────────────── */
const ConnectionDot = ({ state }) => {
  const map = {
    connected:    { color: '#22c55e', label: 'Online',       pulse: true },
    connecting:   { color: '#f59e0b', label: 'Connecting…',  pulse: true },
    reconnecting: { color: '#f59e0b', label: 'Reconnecting…',pulse: true },
    disconnected: { color: '#9ca3af', label: 'Offline',      pulse: false },
  }
  const cfg = map[state] || map.disconnected
  return (
    <span className="mp__status-dot-wrap" title={cfg.label}>
      <span
        className={`mp__status-dot ${cfg.pulse ? 'mp__status-dot--pulse' : ''}`}
        style={{ background: cfg.color }}
      />
    </span>
  )
}

/* ── Single message bubble ──────────────────────────────────────────────── */
const MessageBubble = React.memo(({ msg, isOwn }) => (
  <div className={`mp__bubble-row ${isOwn ? 'mp__bubble-row--own' : ''}`}>
    {!isOwn && (
      <div className="mp__avatar-sm">
        <span>A</span>
      </div>
    )}
    <div className={`mp__bubble ${isOwn ? 'mp__bubble--own' : 'mp__bubble--other'}`}>
      {!isOwn && (
        <p className="mp__bubble-sender">{msg.senderName || 'Support'}</p>
      )}
      <p className="mp__bubble-text">{msg.body}</p>
      <div className="mp__bubble-meta">
        <span className="mp__bubble-time">{formatTime(msg.createdAt)}</span>
        {isOwn && (
          <span className="mp__bubble-read" title={msg.isRead ? 'Read' : 'Sent'}>
            {msg.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  </div>
))

MessageBubble.displayName = 'MessageBubble'

/* ── Typing animation ────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="mp__bubble-row">
    <div className="mp__avatar-sm"><span>A</span></div>
    <div className="mp__bubble mp__bubble--other mp__bubble--typing">
      <span className="mp__typing-dot" />
      <span className="mp__typing-dot" />
      <span className="mp__typing-dot" />
    </div>
  </div>
)

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PORTAL
   ══════════════════════════════════════════════════════════════════════════ */
export default function MessagePortal() {
  const {
    isOpen, closePortal,
    messages, sendMessage, emitTyping,
    isTyping, adminOnline, connected,
    connectionState, sendingMsg, registered,
  } = useMessaging()

  const { user } = useUserAuth()

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

  /* ── auto-scroll ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [messages, isTyping, isOpen])

  /* ── focus input on open ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen && registered) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, registered])

  /* ── hide intro if has messages ─────────────────────────────────────── */
  useEffect(() => {
    if (messages.length > 0) setShowIntro(false)
  }, [messages.length])

  /* ── outside click → close emoji ────────────────────────────────────── */
  useEffect(() => {
    const fn = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── Esc → close ─────────────────────────────────────────────────────── */
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

  /* ── typing events ────────────────────────────────────────────────────── */
  const handleTyping = useCallback(() => {
    if (!isTypingNow) {
      setIsTypingNow(true)
      emitTyping(true)
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setIsTypingNow(false)
      emitTyping(false)
    }, 2500)
  }, [isTypingNow, emitTyping])

  /* ── send ────────────────────────────────────────────────────────────── */
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
    sendMessage(body)
    setInput('')
    setEmojiOpen(false)
    setShowIntro(false)
    inputRef.current?.focus()
  }, [input, user, guestName, sendMessage, emitTyping])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    handleTyping()
  }, [handleSend, handleTyping])

  /* ── emoji select ───────────────────────────────────────────────────── */
  const handleEmojiSelect = useCallback((emoji) => {
    setInput((prev) => prev + emoji)
    setEmojiOpen(false)
    inputRef.current?.focus()
  }, [])

  /* ── textarea auto-resize ────────────────────────────────────────────── */
  const handleTextareaInput = useCallback((e) => {
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }, [])

  /* ── grouped messages ────────────────────────────────────────────────── */
  const grouped = useMemo(() => groupByDay(messages), [messages])

  /* ── connection label ────────────────────────────────────────────────── */
  const statusLabel = useMemo(() => {
    if (connectionState === 'connected' && adminOnline) return 'Support is online'
    if (connectionState === 'connected') return 'Connected'
    if (connectionState === 'connecting') return 'Connecting…'
    if (connectionState === 'reconnecting') return 'Reconnecting…'
    return 'Offline'
  }, [connectionState, adminOnline])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="mp__backdrop" onClick={closePortal} />

      {/* Portal window */}
      <div className="mp" role="dialog" aria-label="Live support chat">

        {/* ── Header ── */}
        <div className="mp__header">
          <div className="mp__header-left">
            <div className="mp__support-avatar">
              <span>🌍</span>
              {adminOnline && <span className="mp__online-ring" />}
            </div>
            <div>
              <h3 className="mp__header-title">Altuvera Support</h3>
              <div className="mp__header-status">
                <ConnectionDot state={connectionState} />
                <span className="mp__header-status-text">{statusLabel}</span>
              </div>
            </div>
          </div>
          <div className="mp__header-actions">
            <button
              className="mp__header-btn"
              onClick={() => { window.location.href = 'mailto:support@altuvera.com' }}
              title="Email us"
              type="button"
              aria-label="Email support"
            >
              📧
            </button>
            <button
              className="mp__header-btn"
              onClick={closePortal}
              aria-label="Close chat"
              title="Close"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Guest info form ── */}
        {!user && showIntro && (
          <div className="mp__guest-form">
            <p className="mp__guest-title">👋 Start a conversation</p>
            <p className="mp__guest-sub">We typically reply within minutes</p>
            <input
              className="mp__guest-input"
              type="text"
              placeholder="Your name (optional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="mp__guest-input"
              type="email"
              placeholder="Your email (optional)"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        )}

        {/* ── Messages ── */}
        <div className="mp__messages">
          {/* Intro bubble */}
          {showIntro && messages.length === 0 && (
            <div className="mp__intro">
              <div className="mp__intro-icon">🌍</div>
              <h4 className="mp__intro-title">Welcome to Altuvera!</h4>
              <p className="mp__intro-text">
                Ask us anything about destinations, bookings, safaris, or travel planning.
                We're here to help you plan your perfect adventure!
              </p>
              <div className="mp__intro-chips">
                {[
                  '🗺️ Destinations',
                  '📅 Booking',
                  '🦁 Wildlife',
                  '✈️ Planning',
                ].map((chip) => (
                  <button
                    key={chip}
                    className="mp__intro-chip"
                    onClick={() => { setInput(chip.slice(3)); setShowIntro(false) }}
                    type="button"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message groups */}
          {grouped.map((item) =>
            item.type === 'day' ? (
              <div key={item.key} className="mp__day-label">
                <span>{item.label}</span>
              </div>
            ) : (
              <MessageBubble
                key={item.key}
                msg={item.msg}
                isOwn={item.msg.senderType === 'user'}
              />
            )
          )}

          {/* Admin typing */}
          {isTyping && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input area ── */}
        <div className="mp__input-area">
          {/* Emoji picker */}
          {emojiOpen && (
            <div ref={emojiRef} className="mp__emoji-wrap">
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setEmojiOpen(false)}
              />
            </div>
          )}

          <div className="mp__input-row">
            <button
              className="mp__input-btn"
              onClick={() => setEmojiOpen((v) => !v)}
              title="Emoji"
              type="button"
              aria-label="Toggle emoji picker"
            >
              😊
            </button>

            <textarea
              ref={inputRef}
              className="mp__textarea"
              placeholder={connected ? 'Type your message…' : 'Connecting…'}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                handleTyping()
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={!connected}
              aria-label="Message input"
              style={{
                height: 'auto',
                minHeight: '36px',
                maxHeight: '120px',
              }}
              onInput={handleTextareaInput}
            />

            <button
              className={`mp__send-btn ${input.trim() ? 'mp__send-btn--active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || !connected || sendingMsg}
              title="Send message"
              type="button"
              aria-label="Send message"
            >
              {sendingMsg ? (
                <span className="mp__send-spinner" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
              )}
            </button>
          </div>

          <p className="mp__input-hint">
            Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </>
  )
}