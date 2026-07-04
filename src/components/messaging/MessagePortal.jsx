/**
 * MessagePortal.jsx
 * Full-featured chat portal — Green/White theme
 * Optimized, compact, responsive, professional
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo, memo,
} from 'react'
import { useMessaging, CHAT_BACKGROUNDS } from '../../context/MessagingContext'
import { useUserAuth } from '../../context/UserAuthContext'
import EmojiPicker from './EmojiPicker'
import './MessagePortal.css'

/* ══════════════════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════════════════ */
const ICON_PATHS = {
  globe:          <><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  send:           <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
  smile:          <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  x:              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  mail:           <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  user:           <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  atSign:         <><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></>,
  messageCircle:  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  headphones:     <><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>,
  mapPin:         <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  calendar:       <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  compass:        <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
  plane:          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>,
  check:          <polyline points="20 6 9 17 4 12"/>,
  checkCheck:     <><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></>,
  sparkles:       <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
  shieldCheck:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
  messagesSquare: <><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></>,
  package:        <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>,
  externalLink:   <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  logIn:          <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  reply:          <><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>,
  forward:        <><polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/></>,
  edit:           <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:          <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  pin:            <><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17H19V13L17 7H7L5 13V17Z"/><line x1="9" y1="7" x2="9" y2="4"/><line x1="15" y1="7" x2="15" y2="4"/></>,
  unpin:          <><line x1="2" y1="2" x2="22" y2="22"/><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-4l-2-6H7"/></>,
  search:         <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  chevronDown:    <polyline points="6 9 12 15 18 9"/>,
  moreHorizontal: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  copy:           <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  palette:        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5S18.33 11 17.5 11z"/>,
  wifi:           <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  wifiOff:        <><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  zap:            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
}

const Icon = memo(({ name, size = 16, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={`mp__icon${className ? ` ${className}` : ''}`}
    aria-hidden="true"
    {...props}
  >
    {ICON_PATHS[name] || ICON_PATHS.messageCircle}
  </svg>
))
Icon.displayName = 'Icon'

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════════════ */
const formatTime = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

const formatDay = (d) => {
  if (!d) return ''
  try {
    const dt   = new Date(d)
    const now  = new Date()
    const diff = Math.floor((now - dt) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  } catch { return '' }
}

const groupByDay = (msgs) => {
  const g = []; let last = null
  for (const m of msgs) {
    const day = formatDay(m.createdAt)
    if (day !== last) {
      g.push({ type: 'day', label: day, key: `day-${m.id}-${day}` })
      last = day
    }
    g.push({ type: 'message', msg: m, key: `msg-${m.id}` })
  }
  return g
}

const fmtPrice = (p, c = 'USD') => {
  if (!p && p !== 0) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: c, maximumFractionDigits: 0,
    }).format(p)
  } catch { return `$${Number(p).toLocaleString()}` }
}

const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✈️']

/* ══════════════════════════════════════════════════════════════════════════
   QUICK CHIPS
══════════════════════════════════════════════════════════════════════════ */
const QUICK_CHIPS = [
  { label: 'Destinations', icon: 'mapPin'   },
  { label: 'Booking',      icon: 'calendar' },
  { label: 'Wildlife',     icon: 'compass'  },
  { label: 'Planning',     icon: 'plane'    },
]

/* ══════════════════════════════════════════════════════════════════════════
   CONNECTION STATUS CONFIG
══════════════════════════════════════════════════════════════════════════ */
const getConnectionConfig = (connectionState, adminOnline) => {
  if (connectionState === 'connected' && adminOnline) {
    return { label: 'Online', color: '#10b981', bg: '#ecfdf5', icon: 'wifi', pulse: true }
  }
  if (connectionState === 'connected') {
    return { label: 'Connected', color: '#6b7280', bg: '#f9fafb', icon: 'wifi', pulse: false }
  }
  if (connectionState === 'connecting' || connectionState === 'reconnecting') {
    return { label: 'Connecting…', color: '#f59e0b', bg: '#fffbeb', icon: 'zap', pulse: true }
  }
  return { label: 'Offline', color: '#ef4444', bg: '#fef2f2', icon: 'wifiOff', pulse: false }
}

/* ══════════════════════════════════════════════════════════════════════════
   REACTION PICKER
══════════════════════════════════════════════════════════════════════════ */
const ReactionPicker = memo(({ onSelect, onClose }) => (
  <div className="mp__reaction-picker" role="menu" aria-label="Reactions">
    {COMMON_REACTIONS.map((e) => (
      <button
        key={e}
        className="mp__reaction-btn"
        onClick={() => { onSelect(e); onClose() }}
        type="button"
        role="menuitem"
        title={e}
      >
        {e}
      </button>
    ))}
  </div>
))
ReactionPicker.displayName = 'ReactionPicker'

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGE CONTEXT MENU
══════════════════════════════════════════════════════════════════════════ */
const MessageMenu = memo(({
  msg, isOwn, onReply, onEdit, onDelete, onForward, onPin, onCopy, onClose,
}) => {
  const items = [
    { icon: 'reply',   label: 'Reply',   action: onReply,   show: true },
    { icon: 'forward', label: 'Forward', action: onForward, show: !msg.isDeleted },
    { icon: 'edit',    label: 'Edit',    action: onEdit,    show: isOwn && !msg.isDeleted },
    { icon: 'copy',    label: 'Copy',    action: onCopy,    show: !msg.isDeleted },
    {
      icon: msg.isPinned ? 'unpin' : 'pin',
      label: msg.isPinned ? 'Unpin' : 'Pin',
      action: onPin,
      show: true,
    },
    {
      icon: 'trash', label: 'Delete',
      action: onDelete, show: isOwn && !msg.isDeleted, danger: true,
    },
  ].filter((i) => i.show)

  return (
    <div className="mp__msg-menu" role="menu">
      {items.map((item) => (
        <button
          key={item.label}
          className={`mp__msg-menu-item${item.danger ? ' mp__msg-menu-item--danger' : ''}`}
          onClick={(e) => { e.stopPropagation(); item.action(); onClose() }}
          type="button"
          role="menuitem"
        >
          <Icon name={item.icon} size={13} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
})
MessageMenu.displayName = 'MessageMenu'

/* ══════════════════════════════════════════════════════════════════════════
   TYPING INDICATOR
══════════════════════════════════════════════════════════════════════════ */
const TypingIndicator = memo(() => (
  <div className="mp__bubble-row mp__bubble-row--typing-row">
    <div className="mp__avatar-sm" aria-hidden="true">
      <Icon name="headphones" size={12} />
    </div>
    <div className="mp__bubble mp__bubble--other mp__bubble--typing" aria-label="Support is typing">
      <span className="mp__typing-dot" />
      <span className="mp__typing-dot" />
      <span className="mp__typing-dot" />
    </div>
  </div>
))
TypingIndicator.displayName = 'TypingIndicator'

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════════════════ */
const MessageBubble = memo(({
  msg, isOwn, userName, highlighted,
  onReply, onEdit, onDelete, onForward, onPin, onReact, msgRef,
}) => {
  const [showMenu,  setShowMenu]  = useState(false)
  const [showReact, setShowReact] = useState(false)
  const [copied,    setCopied]    = useState(false)
  const menuRef = useRef(null)

  const pkgCtx   = msg.packageContext || msg.metadata?.packageContext
  const replyCtx = msg.replyTo        || msg.metadata?.replyTo
  const fwdCtx   = msg.forwardedFrom  || msg.metadata?.forwardedFrom
  const sender   = isOwn
    ? (userName || msg.senderName || 'You')
    : (msg.senderName || 'Support')

  useEffect(() => {
    if (!showMenu && !showReact) return
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
        setShowReact(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [showMenu, showReact])

  const handleCopy = useCallback(() => {
    if (!msg.body) return
    navigator.clipboard?.writeText(msg.body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [msg.body])

  const totalReactions = useMemo(
    () => Object.values(msg.reactions || {}).reduce((a, r) => a + (r.count || 0), 0),
    [msg.reactions],
  )

  return (
    <div
      ref={msgRef}
      id={`msg-${msg.id}`}
      className={[
        'mp__bubble-row',
        isOwn            ? 'mp__bubble-row--own'         : '',
        msg.isOptimistic ? 'mp__bubble-row--optimistic'  : '',
        highlighted      ? 'mp__bubble-row--highlighted' : '',
      ].filter(Boolean).join(' ')}
    >
      {/* Avatar */}
      <div className={`mp__avatar-sm${isOwn ? ' mp__avatar-sm--user' : ''}`} aria-hidden="true">
        {isOwn
          ? <span>{(sender[0] || 'U').toUpperCase()}</span>
          : <Icon name="headphones" size={12} />}
      </div>

      {/* Bubble + actions */}
      <div className="mp__bubble-wrapper" ref={menuRef}>
        {/* Hover actions */}
        {!msg.isDeleted && (
          <div className={`mp__bubble-actions${isOwn ? ' mp__bubble-actions--own' : ''}`}>
            <div className="mp__bubble-action-btns">
              <button
                className="mp__action-btn"
                onClick={() => { setShowReact(v => !v); setShowMenu(false) }}
                title="React"
                type="button"
                aria-label="Add reaction"
              >
                <Icon name="smile" size={13} />
              </button>
              <button
                className="mp__action-btn"
                onClick={() => { onReply(msg); setShowMenu(false) }}
                title="Reply"
                type="button"
                aria-label="Reply"
              >
                <Icon name="reply" size={13} />
              </button>
              <button
                className="mp__action-btn"
                onClick={() => { setShowMenu(v => !v); setShowReact(false) }}
                title="More options"
                type="button"
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <Icon name="moreHorizontal" size={13} />
              </button>
            </div>

            {showReact && (
              <ReactionPicker
                onSelect={(emoji) => onReact(msg.id, emoji)}
                onClose={() => setShowReact(false)}
              />
            )}

            {showMenu && (
              <MessageMenu
                msg={msg}
                isOwn={isOwn}
                onReply={() => onReply(msg)}
                onEdit={() => onEdit(msg)}
                onDelete={() => onDelete(msg.id)}
                onForward={() => onForward(msg)}
                onPin={() => onPin(msg)}
                onCopy={handleCopy}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={[
            'mp__bubble',
            isOwn          ? 'mp__bubble--own'     : 'mp__bubble--other',
            msg.isDeleted  ? 'mp__bubble--deleted' : '',
          ].filter(Boolean).join(' ')}
        >
          {/* Sender */}
          <div className="mp__bubble-sender">
            <Icon name={isOwn ? 'user' : 'shieldCheck'} size={10} />
            <span>{sender}</span>
            {msg.isPinned && (
              <span className="mp__bubble-pin-badge" title="Pinned">
                <Icon name="pin" size={9} />
              </span>
            )}
          </div>

          {/* Forwarded */}
          {fwdCtx && !msg.isDeleted && (
            <div className="mp__fwd-banner">
              <span className="mp__fwd-header">
                <Icon name="forward" size={10} />
                Forwarded from <strong>{fwdCtx.senderName || 'User'}</strong>
              </span>
              <p className="mp__fwd-preview">{fwdCtx.body}</p>
            </div>
          )}

          {/* Reply context */}
          {replyCtx && !msg.isDeleted && (
            <div className="mp__reply-preview">
              <div className="mp__reply-bar-line" />
              <div className="mp__reply-content">
                <span className="mp__reply-sender">{replyCtx.senderName || 'User'}</span>
                <p className="mp__reply-text">{replyCtx.body}</p>
              </div>
            </div>
          )}

          {/* Package context */}
          {pkgCtx && !msg.isDeleted && (
            <div className="mp__bubble-pkg">
              {pkgCtx.image && (
                <img src={pkgCtx.image} alt={pkgCtx.title} className="mp__bubble-pkg-img" />
              )}
              <div className="mp__bubble-pkg-info">
                <span className="mp__bubble-pkg-label">
                  <Icon name="package" size={9} /> Inquiry
                </span>
                <p className="mp__bubble-pkg-title">{pkgCtx.title}</p>
              </div>
            </div>
          )}

          {/* Body */}
          {msg.isDeleted
            ? (
              <p className="mp__bubble-deleted">
                <Icon name="trash" size={11} />
                <span>Message deleted</span>
              </p>
            )
            : <p className="mp__bubble-text">{msg.body}</p>}

          {/* Meta */}
          <div className="mp__bubble-meta">
            {msg.isEdited && !msg.isDeleted && (
              <span className="mp__bubble-edited">edited</span>
            )}
            <span className="mp__bubble-time">{formatTime(msg.createdAt)}</span>
            {copied && <span className="mp__bubble-copied">✓ Copied</span>}
            {isOwn && !msg.isDeleted && (
              msg.isOptimistic
                ? (
                  <span className="mp__bubble-sending" aria-label="Sending">
                    <span className="mp__send-dot" />
                  </span>
                )
                : (
                  <span
                    className={`mp__bubble-status${msg.isRead ? ' mp__bubble-status--read' : ''}`}
                    aria-label={msg.isRead ? 'Read' : 'Delivered'}
                  >
                    <Icon name={msg.isRead ? 'checkCheck' : 'check'} size={11} />
                  </span>
                )
            )}
          </div>
        </div>

        {/* Reactions */}
        {totalReactions > 0 && !msg.isDeleted && (
          <div className={`mp__reactions${isOwn ? ' mp__reactions--own' : ''}`}>
            {Object.entries(msg.reactions || {})
              .filter(([, r]) => r.count > 0)
              .map(([emoji, r]) => (
                <button
                  key={emoji}
                  className="mp__reaction-badge"
                  onClick={() => onReact(msg.id, emoji)}
                  type="button"
                  title={`${r.count} reaction${r.count !== 1 ? 's' : ''}`}
                >
                  {emoji} <span>{r.count}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
})
MessageBubble.displayName = 'MessageBubble'

/* ══════════════════════════════════════════════════════════════════════════
   PACKAGE CONTEXT CARD
══════════════════════════════════════════════════════════════════════════ */
const PackageContextCard = memo(({ pkg, onClear }) => {
  if (!pkg) return null
  return (
    <div className="mp__pkg-card">
      <div className="mp__pkg-card-inner">
        {pkg.image && (
          <img src={pkg.image} alt={pkg.title} className="mp__pkg-img" />
        )}
        <div className="mp__pkg-info">
          <span className="mp__pkg-label">
            <Icon name="package" size={10} /> Asking about
          </span>
          <p className="mp__pkg-title">{pkg.title}</p>
          {pkg.destination && (
            <p className="mp__pkg-dest">
              <Icon name="mapPin" size={10} />
              {pkg.destination}
            </p>
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
            <a
              href={`/packages/${pkg.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mp__pkg-view-btn"
              title="View package"
            >
              <Icon name="externalLink" size={12} />
            </a>
          )}
          <button className="mp__pkg-clear-btn" onClick={onClear} title="Remove" type="button">
            <Icon name="x" size={12} />
          </button>
        </div>
      </div>
    </div>
  )
})
PackageContextCard.displayName = 'PackageContextCard'

/* ══════════════════════════════════════════════════════════════════════════
   PINNED PANEL
══════════════════════════════════════════════════════════════════════════ */
const PinnedPanel = memo(({ pins, onClose, onScrollTo }) => (
  <div className="mp__pinned-panel" role="region" aria-label="Pinned messages">
    <div className="mp__pinned-header">
      <Icon name="pin" size={13} />
      <span>Pinned ({pins.length})</span>
      <button onClick={onClose} type="button" className="mp__panel-close" aria-label="Close">
        <Icon name="x" size={13} />
      </button>
    </div>
    <div className="mp__pinned-list">
      {pins.length === 0
        ? <p className="mp__pinned-empty">No pinned messages</p>
        : pins.map((p) => (
          <button
            key={p.id}
            className="mp__pinned-item"
            onClick={() => { onScrollTo(p.id); onClose() }}
            type="button"
          >
            <span className="mp__pinned-sender">{p.senderName || 'User'}</span>
            <span className="mp__pinned-body">{p.body}</span>
            <span className="mp__pinned-time">{formatTime(p.createdAt)}</span>
          </button>
        ))}
    </div>
  </div>
))
PinnedPanel.displayName = 'PinnedPanel'

/* ══════════════════════════════════════════════════════════════════════════
   BACKGROUND PICKER
══════════════════════════════════════════════════════════════════════════ */
const BackgroundPicker = memo(({ current, onChange, onClose }) => (
  <div className="mp__bg-picker" role="region" aria-label="Chat background">
    <div className="mp__bg-header">
      <Icon name="palette" size={13} />
      <span>Background</span>
      <button onClick={onClose} type="button" className="mp__panel-close" aria-label="Close">
        <Icon name="x" size={13} />
      </button>
    </div>
    <div className="mp__bg-grid">
      {CHAT_BACKGROUNDS.map((bg) => (
        <button
          key={bg.id}
          className={`mp__bg-swatch${current?.id === bg.id ? ' mp__bg-swatch--active' : ''}`}
          style={{ background: bg.value, backgroundSize: bg.size || 'cover' }}
          onClick={() => { onChange(bg); onClose() }}
          title={bg.label}
          type="button"
          aria-pressed={current?.id === bg.id}
          aria-label={bg.label}
        >
          {current?.id === bg.id && (
            <span className="mp__bg-check" aria-hidden="true">
              <Icon name="check" size={11} />
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
))
BackgroundPicker.displayName = 'BackgroundPicker'

/* ══════════════════════════════════════════════════════════════════════════
   SEARCH BAR
══════════════════════════════════════════════════════════════════════════ */
const SearchBar = memo(({ query, onChange, onClose, resultCount }) => (
  <div className="mp__search-bar" role="search">
    <Icon name="search" size={13} className="mp__search-icon" />
    <input
      type="text"
      className="mp__search-input"
      placeholder="Search messages…"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      aria-label="Search messages"
    />
    {query && (
      <span className="mp__search-count" aria-live="polite">
        {resultCount} result{resultCount !== 1 ? 's' : ''}
      </span>
    )}
    <button
      className="mp__search-close"
      onClick={onClose}
      type="button"
      aria-label="Close search"
    >
      <Icon name="x" size={13} />
    </button>
  </div>
))
SearchBar.displayName = 'SearchBar'

/* ══════════════════════════════════════════════════════════════════════════
   CONTEXT BARS (Reply / Forward / Edit)
══════════════════════════════════════════════════════════════════════════ */
const ContextBar = memo(({ type, msg, onCancel }) => {
  const configs = {
    reply:   { icon: 'reply',   label: 'Replying to',      cls: 'mp__ctx-bar--reply'   },
    forward: { icon: 'forward', label: 'Forwarding',       cls: 'mp__ctx-bar--forward' },
    edit:    { icon: 'edit',    label: 'Editing message',  cls: 'mp__ctx-bar--edit'    },
  }
  const c = configs[type]
  if (!c || !msg) return null

  return (
    <div className={`mp__ctx-bar ${c.cls}`} role="status">
      <Icon name={c.icon} size={13} className="mp__ctx-bar-icon" />
      <div className="mp__ctx-bar-content">
        <span className="mp__ctx-bar-label">{c.label}</span>
        <p className="mp__ctx-bar-body">{msg.body?.slice(0, 80)}{msg.body?.length > 80 ? '…' : ''}</p>
      </div>
      <button
        className="mp__ctx-bar-cancel"
        onClick={onCancel}
        type="button"
        aria-label={`Cancel ${type}`}
      >
        <Icon name="x" size={13} />
      </button>
    </div>
  )
})
ContextBar.displayName = 'ContextBar'

/* ══════════════════════════════════════════════════════════════════════════
   GUEST FORM
══════════════════════════════════════════════════════════════════════════ */
const GuestForm = memo(({
  guestName, guestEmail, onNameChange, onEmailChange,
  onSignIn, onClose,
}) => (
  <div className="mp__guest-form">
    <div className="mp__guest-header">
      <Icon name="sparkles" size={15} className="mp__guest-header-icon" />
      <div>
        <p className="mp__guest-title">Start chatting</p>
        <p className="mp__guest-sub">Usually replies in minutes</p>
      </div>
    </div>
    <div className="mp__guest-fields">
      <div className="mp__guest-field">
        <Icon name="user" size={13} className="mp__guest-field-icon" />
        <input
          className="mp__guest-input"
          type="text"
          placeholder="Your name (optional)"
          value={guestName}
          onChange={(e) => onNameChange(e.target.value)}
          autoComplete="name"
          aria-label="Your name"
        />
      </div>
      <div className="mp__guest-field">
        <Icon name="atSign" size={13} className="mp__guest-field-icon" />
        <input
          className="mp__guest-input"
          type="email"
          placeholder="Your email (optional)"
          value={guestEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
          aria-label="Your email"
        />
      </div>
    </div>
    {typeof onSignIn === 'function' && (
      <button className="mp__guest-signin" onClick={onSignIn} type="button">
        <Icon name="logIn" size={12} />
        Have an account? <strong>Sign in</strong>
      </button>
    )}
  </div>
))
GuestForm.displayName = 'GuestForm'

/* ══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════════════════════ */
const EmptyState = memo(({ userName, packageContext, onChipClick }) => {
  if (packageContext) {
    return (
      <div className="mp__intro">
        <div className="mp__intro-icon">
          <Icon name="messagesSquare" size={26} />
        </div>
        <h4 className="mp__intro-title">
          {userName ? `Hi ${userName}! 👋` : 'Ask about this package'}
        </h4>
        <p className="mp__intro-text">
          You're inquiring about <strong>{packageContext.title}</strong>.
          Ask about availability, pricing, or customization.
        </p>
        <div className="mp__intro-chips">
          {['Availability?', 'Group discount?', 'Customise trip', 'Book now'].map((q) => (
            <button key={q} className="mp__intro-chip" onClick={() => onChipClick(q)} type="button">
              {q}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mp__intro">
      <div className="mp__intro-icon">
        <Icon name="messagesSquare" size={26} />
      </div>
      <h4 className="mp__intro-title">
        {userName ? `Welcome, ${userName}! 👋` : 'Welcome to Altuvera!'}
      </h4>
      <p className="mp__intro-text">
        Ask us anything about destinations, bookings, safaris, or travel planning.
      </p>
      <div className="mp__intro-chips">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c.label}
            className="mp__intro-chip"
            onClick={() => onChipClick(c.label)}
            type="button"
          >
            <Icon name={c.icon} size={12} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
})
EmptyState.displayName = 'EmptyState'

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PORTAL
══════════════════════════════════════════════════════════════════════════ */
export default function MessagePortal() {
  const {
    isOpen, closePortal,
    messages, filteredMessages,
    sendMessage, emitTyping,
    editMessage, deleteMessage, reactToMessage,
    forwardMessage, forwardingMsg,
    isTyping, adminOnline, connected,
    connectionState, sendingMsg, registered,
    newConversationNotification,
    packageContext, clearPackageContext,
    replyingTo, startReply, cancelReply,
    editingMsg, setEditingMsg, cancelEdit,
    pinnedMessages, togglePin, showPinned, setShowPinned,
    chatBackground, changeChatBackground,
    searchQuery, searchMessages,
    highlightedMsg, scrollToMessage,
  } = useMessaging()

  const {
    user, isAuthenticated, openModal: openAuthModal,
  } = useUserAuth()

  // ── State ────────────────────────────────────────────────────────────────
  const [input,        setInput]        = useState('')
  const [emojiOpen,    setEmojiOpen]    = useState(false)
  const [isTypingNow,  setIsTypingNow]  = useState(false)
  const [guestName,    setGuestName]    = useState('')
  const [guestEmail,   setGuestEmail]   = useState('')
  const [showIntro,    setShowIntro]    = useState(true)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [showSearch,   setShowSearch]   = useState(false)
  const [charCount,    setCharCount]    = useState(0)

  // ── Refs ─────────────────────────────────────────────────────────────────
  const bottomRef    = useRef(null)
  const inputRef     = useRef(null)
  const typingTimer  = useRef(null)
  const emojiRef     = useRef(null)
  const msgRefs      = useRef({})

  // ── Derived ──────────────────────────────────────────────────────────────
  const userName = useMemo(
    () => user?.fullName || user?.name || user?.email?.split('@')[0] || '',
    [user],
  )

  // ── Fill input when editing ───────────────────────────────────────────────
  useEffect(() => {
    if (editingMsg) {
      const body = editingMsg.body || ''
      setInput(body)
      setCharCount(body.length)
      inputRef.current?.focus()
    }
  }, [editingMsg])

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      80,
    )
    return () => clearTimeout(t)
  }, [messages, isTyping, isOpen])

  // ── Focus on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && registered) {
      const t = setTimeout(() => inputRef.current?.focus(), 250)
      return () => clearTimeout(t)
    }
  }, [isOpen, registered])

  // ── Hide intro ────────────────────────────────────────────────────────────
  useEffect(() => { if (messages.length > 0) setShowIntro(false) }, [messages.length])
  useEffect(() => { if (packageContext) setShowIntro(false) }, [packageContext])
  useEffect(() => {
    if (newConversationNotification && isOpen) setShowIntro(false)
  }, [newConversationNotification, isOpen])

  // ── Scroll to highlighted ─────────────────────────────────────────────────
  useEffect(() => {
    if (!highlightedMsg) return
    const el = document.getElementById(`msg-${highlightedMsg}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightedMsg])

  // ── Close emoji on outside click ──────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (!isOpen) return
      if (e.key !== 'Escape') return
      if (emojiOpen)     { setEmojiOpen(false);                           return }
      if (showBgPicker)  { setShowBgPicker(false);                        return }
      if (showSearch)    { setShowSearch(false); searchMessages('');       return }
      if (replyingTo)    { cancelReply();                                  return }
      if (editingMsg)    { cancelEdit(); setInput(''); setCharCount(0);    return }
      if (forwardingMsg) { forwardMessage(null);                           return }
      closePortal()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [
    emojiOpen, showBgPicker, showSearch, replyingTo, editingMsg,
    forwardingMsg, isOpen, closePortal, cancelReply, cancelEdit,
    searchMessages, forwardMessage,
  ])

  // ── Typing ────────────────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!isTypingNow) { setIsTypingNow(true); emitTyping(true) }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setIsTypingNow(false)
      emitTyping(false)
    }, 2500)
  }, [isTypingNow, emitTyping])

  // ── Resize textarea ───────────────────────────────────────────────────────
  const resizeTextarea = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const resetTextarea = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '38px'
  }, [])

  // ── Send / Save edit ──────────────────────────────────────────────────────
 // Replace handleSend in MessagePortal.jsx

// Only this function changes in MessagePortal.jsx
// Replace the existing handleSend:

const handleSend = useCallback(() => {
  const body = input.trim()
  if (!body) return

  // Must be registered (have a conversationId) before sending
  if (!registered) {
    // Show user-friendly status, don't show error for first attempt
    if (connected) {
      // Still registering — show brief wait message
      setSubmitError('Connecting… please try again in a moment.')
      setTimeout(() => {
        if (mountedRef?.current) setSubmitError(null)
      }, 2000)
    } else {
      setSubmitError('Not connected. Please wait…')
    }
    return
  }

  clearTimeout(typingTimer.current)
  emitTyping(false)
  setIsTypingNow(false)

  if (editingMsg) {
    editMessage(editingMsg.id, body)
    cancelEdit()
    setInput('')
    setCharCount(0)
    resetTextarea()
    return
  }

  sendMessage(body, {
    guestName:  guestName.trim()  || user?.fullName || user?.name || '',
    guestEmail: guestEmail.trim() || user?.email    || null,
  })

  setInput('')
  setCharCount(0)
  setEmojiOpen(false)
  setShowIntro(false)
  resetTextarea()
  inputRef.current?.focus()
}, [
  input, registered, connected, user, guestName, guestEmail,
  sendMessage, emitTyping, editingMsg, editMessage,
  cancelEdit, isAuthenticated, resetTextarea,
])

// Also add mountedRef to MessagePortal:
const mountedRef = useRef(true)
useEffect(() => {
  mountedRef.current = true
  return () => { mountedRef.current = false }
}, [])

// Add registration status indicator in the footer
// (add below the hint text in mp__input-footer)
// {!registered && connected && (
//   <span className="mp__registering">Connecting…</span>
// )}
// {!connected && (
//   <span className="mp__offline">Reconnecting…</span>
// )}

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else {
      handleTyping()
    }
  }, [handleSend, handleTyping])

  // ── Emoji ─────────────────────────────────────────────────────────────────
  const handleEmojiSelect = useCallback((emoji) => {
    const el = inputRef.current
    if (el) {
      const s  = el.selectionStart ?? input.length
      const en = el.selectionEnd   ?? input.length
      const v  = input.slice(0, s) + emoji + input.slice(en)
      setInput(v)
      setCharCount(v.length)
      setEmojiOpen(false)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(s + emoji.length, s + emoji.length)
        resizeTextarea()
      })
    } else {
      setInput(p => p + emoji)
      setCharCount(c => c + emoji.length)
      setEmojiOpen(false)
    }
  }, [input, resizeTextarea])

  // ── Chip click ────────────────────────────────────────────────────────────
  const handleChipClick = useCallback((text) => {
    setInput(text)
    setCharCount(text.length)
    setShowIntro(false)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      resizeTextarea()
    })
  }, [resizeTextarea])

  // ── Scroll to pinned msg ──────────────────────────────────────────────────
  const handleScrollToMsg = useCallback((id) => {
    scrollToMessage(id)
    setShowPinned(false)
  }, [scrollToMessage, setShowPinned])

  // ── Close all panels ──────────────────────────────────────────────────────
  const closeAllPanels = useCallback(() => {
    setShowBgPicker(false)
    setShowPinned(false)
    setShowSearch(false)
  }, [setShowPinned])

  // ── Computed ──────────────────────────────────────────────────────────────
  const displayMessages = showSearch ? filteredMessages : messages
  const grouped = useMemo(() => groupByDay(displayMessages), [displayMessages])

  const connConfig = useMemo(
    () => getConnectionConfig(connectionState, adminOnline),
    [connectionState, adminOnline],
  )

  const bgStyle = useMemo(() => {
    const bg = chatBackground
    if (!bg) return {}
    if (bg.type === 'gradient' || bg.type === 'pattern') {
      return { background: bg.value, backgroundSize: bg.size || 'auto' }
    }
    return { backgroundColor: bg.value }
  }, [chatBackground])

  const isDarkBg = useMemo(
    () => ['dark', 'gradient2', 'nature2'].includes(chatBackground?.id),
    [chatBackground],
  )

  const hasContextBar = replyingTo || forwardingMsg || editingMsg
  const contextType   = replyingTo ? 'reply' : forwardingMsg ? 'forward' : editingMsg ? 'edit' : null
  const contextMsg    = replyingTo || forwardingMsg || editingMsg

  const inputPlaceholder = useMemo(() => {
    if (editingMsg)    return 'Edit your message…'
    if (forwardingMsg) return `Forward: "${forwardingMsg.body?.slice(0, 30)}…"`
    if (packageContext) return `Ask about ${packageContext.title}…`
    if (!connected)    return 'Reconnecting…'
    return 'Type a message…'
  }, [editingMsg, forwardingMsg, packageContext, connected])

  const canSend = input.trim().length > 0 && connected

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`mp__backdrop${isOpen ? ' mp__backdrop--visible' : ''}`}
        onClick={closePortal}
        aria-hidden="true"
      />

      {/* Portal */}
      <div
        className={[
          'mp',
          isOpen   ? 'mp--open'    : 'mp--closed',
          isDarkBg ? 'mp--dark-bg' : '',
        ].filter(Boolean).join(' ')}
        role="dialog"
        aria-label="Live support chat"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
      >

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="mp__header">
          <div className="mp__header-main">
            {/* Left: avatar + info */}
            <div className="mp__header-left">
              <div className="mp__support-avatar" aria-hidden="true">
                <Icon name="globe" size={15} />
                {adminOnline && <span className="mp__online-ring" />}
              </div>
              <div className="mp__header-info">
                <h2 className="mp__header-title">Altuvera Support</h2>
                <div className="mp__header-status">
                  <span
                    className={`mp__status-dot${connConfig.pulse ? ' mp__status-dot--pulse' : ''}`}
                    style={{ background: connConfig.color }}
                  />
                  <span className="mp__header-status-text" style={{ color: connConfig.color }}>
                    {connConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="mp__header-actions">
              {pinnedMessages.length > 0 && (
                <button
                  className={`mp__header-btn${showPinned ? ' mp__header-btn--active' : ''}`}
                  onClick={() => { setShowPinned(v => !v); setShowBgPicker(false); setShowSearch(false) }}
                  title={`${pinnedMessages.length} pinned messages`}
                  type="button"
                  aria-label="Pinned messages"
                  aria-pressed={showPinned}
                >
                  <Icon name="pin" size={13} />
                  <span className="mp__header-btn-badge">{pinnedMessages.length}</span>
                </button>
              )}
              <button
                className={`mp__header-btn${showSearch ? ' mp__header-btn--active' : ''}`}
                onClick={() => {
                  setShowSearch(v => !v)
                  setShowBgPicker(false)
                  setShowPinned(false)
                  if (showSearch) searchMessages('')
                }}
                title="Search messages"
                type="button"
                aria-label="Search"
                aria-pressed={showSearch}
              >
                <Icon name="search" size={13} />
              </button>
              <button
                className={`mp__header-btn${showBgPicker ? ' mp__header-btn--active' : ''}`}
                onClick={() => { setShowBgPicker(v => !v); setShowPinned(false); setShowSearch(false) }}
                title="Change background"
                type="button"
                aria-label="Background"
                aria-pressed={showBgPicker}
              >
                <Icon name="palette" size={13} />
              </button>
              <button
                className="mp__header-btn"
                title="Email us"
                type="button"
                aria-label="Email support"
                onClick={() => window.open('mailto:support@altuvera.com')}
              >
                <Icon name="mail" size={13} />
              </button>
              <button
                className="mp__header-btn mp__header-btn--close"
                onClick={closePortal}
                title="Close chat"
                type="button"
                aria-label="Close chat"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          </div>

          {/* Authenticated user bar */}
          {isAuthenticated && user && (
            <div className="mp__user-bar">
              <div className="mp__user-avatar" aria-hidden="true">
                {user.avatar
                  ? <img src={user.avatar} alt={userName} className="mp__user-avatar-img" />
                  : <span>{getInitials(user.fullName || user.name || user.email)}</span>}
              </div>
              <div className="mp__user-info">
                <p className="mp__user-name">{user.fullName || user.name || user.email?.split('@')[0]}</p>
                {user.email && <p className="mp__user-email">{user.email}</p>}
              </div>
              <span className="mp__user-badge">
                <Icon name="shieldCheck" size={10} /> Verified
              </span>
            </div>
          )}
        </header>

        {/* ── PANELS ─────────────────────────────────────────────────────── */}
        {showPinned && (
          <PinnedPanel
            pins={pinnedMessages}
            onClose={() => setShowPinned(false)}
            onScrollTo={handleScrollToMsg}
          />
        )}

        {showBgPicker && (
          <BackgroundPicker
            current={chatBackground}
            onChange={changeChatBackground}
            onClose={() => setShowBgPicker(false)}
          />
        )}

        {showSearch && (
          <SearchBar
            query={searchQuery}
            onChange={searchMessages}
            resultCount={filteredMessages.length}
            onClose={() => { setShowSearch(false); searchMessages('') }}
          />
        )}

        {/* ── PACKAGE CARD ────────────────────────────────────────────────── */}
        {packageContext && (
          <PackageContextCard pkg={packageContext} onClear={clearPackageContext} />
        )}

        {/* ── GUEST FORM ──────────────────────────────────────────────────── */}
        {!isAuthenticated && showIntro && !packageContext && (
          <GuestForm
            guestName={guestName}
            guestEmail={guestEmail}
            onNameChange={setGuestName}
            onEmailChange={setGuestEmail}
            onSignIn={typeof openAuthModal === 'function'
              ? () => { closePortal(); openAuthModal('login', { skipNotLoggedInMessage: true }) }
              : null}
          />
        )}

        {/* ── MESSAGES AREA ───────────────────────────────────────────────── */}
        <main
          className={`mp__messages${isDarkBg ? ' mp__messages--dark' : ''}`}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          style={bgStyle}
        >
          {/* Empty state */}
          {showIntro && messages.length === 0 && (
            <EmptyState
              userName={userName}
              packageContext={packageContext}
              onChipClick={handleChipClick}
            />
          )}

          {/* Day groups + messages */}
          {grouped.map((item) =>
            item.type === 'day'
              ? (
                <div key={item.key} className="mp__day-label" role="separator">
                  <span>{item.label}</span>
                </div>
              )
              : (
                <MessageBubble
                  key={item.key}
                  msg={item.msg}
                  isOwn={item.msg.senderType === 'user'}
                  userName={userName}
                  highlighted={highlightedMsg === item.msg.id}
                  onReply={startReply}
                  onEdit={(msg) => { setEditingMsg(msg); setInput(msg.body); setCharCount(msg.body?.length || 0) }}
                  onDelete={deleteMessage}
                  onForward={forwardMessage}
                  onPin={togglePin}
                  onReact={reactToMessage}
                  msgRef={(el) => { if (el) msgRefs.current[item.msg.id] = el }}
                />
              )
          )}

          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} aria-hidden="true" />
        </main>

        {/* ── COMPOSE AREA ────────────────────────────────────────────────── */}
        <footer className="mp__input-area">
          {/* Context bars */}
          {hasContextBar && (
            <ContextBar
              type={contextType}
              msg={contextMsg}
              onCancel={() => {
                if (replyingTo)    cancelReply()
                if (forwardingMsg) forwardMessage(null)
                if (editingMsg)    { cancelEdit(); setInput(''); setCharCount(0) }
              }}
            />
          )}

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
              className={`mp__input-icon-btn${emojiOpen ? ' mp__input-icon-btn--active' : ''}`}
              onClick={() => setEmojiOpen(v => !v)}
              title="Emoji"
              type="button"
              aria-label="Open emoji picker"
              aria-expanded={emojiOpen}
            >
              <Icon name="smile" size={16} />
            </button>

            <textarea
              ref={inputRef}
              className="mp__textarea"
              placeholder={inputPlaceholder}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setCharCount(e.target.value.length)
                resizeTextarea()
                handleTyping()
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={!connected}
              style={{ height: '38px', minHeight: '38px', maxHeight: '120px' }}
              aria-label="Message input"
              aria-multiline="true"
            />

            <button
              className={[
                'mp__send-btn',
                canSend    ? 'mp__send-btn--active' : '',
                editingMsg ? 'mp__send-btn--edit'   : '',
              ].filter(Boolean).join(' ')}
              onClick={handleSend}
              disabled={!canSend || sendingMsg}
              title={editingMsg ? 'Save edit' : 'Send message'}
              type="button"
              aria-label={editingMsg ? 'Save edit' : 'Send message'}
            >
              {sendingMsg
                ? <span className="mp__send-spinner" aria-hidden="true" />
                : editingMsg
                  ? <Icon name="check" size={15} />
                  : <Icon name="send" size={15} />}
            </button>
          </div>

          <div className="mp__input-footer">
            <p className="mp__input-hint">
              <kbd>Enter</kbd> to {editingMsg ? 'save' : 'send'} ·{' '}
              <kbd>Shift+Enter</kbd> new line
            </p>
            <div className="mp__input-footer-right">
              {charCount > 0 && (
                <span className={`mp__char-count${charCount > 800 ? ' mp__char-count--warn' : ''}`}>
                  {charCount}
                </span>
              )}
              {editingMsg && (
                <button
                  className="mp__edit-cancel-btn"
                  onClick={() => { cancelEdit(); setInput(''); setCharCount(0) }}
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}