import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

const BellIcon = ({ count }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key="badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          style={{
            position:     'absolute',
            top:          -6,
            right:        -6,
            background:   '#ef4444',
            color:        '#fff',
            borderRadius: '999px',
            fontSize:     count > 99 ? 8 : 10,
            fontWeight:   800,
            minWidth:     18,
            height:       18,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            padding:      '0 4px',
            border:       '2px solid #fff',
            lineHeight:   1,
          }}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
)

export default function NotificationBell({ style = {} }) {
  const [open, setOpen] = useState(false)
  const bellRef         = useRef(null)
  const panelRef        = useRef(null)
  const notifs          = useNotifications()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        bellRef.current  && !bellRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Bell Button */}
      <motion.button
        ref={bellRef}
        onClick={() => {
          setOpen(v => !v)
          if (!open) notifs.refresh()
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${notifs.unreadCount > 0 ? ` (${notifs.unreadCount} unread)` : ''}`}
        style={{
          background:   'transparent',
          border:       'none',
          cursor:       'pointer',
          padding:      8,
          borderRadius: 10,
          color:        '#374151',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'background 0.2s',
        }}
        onMouseEnter={e  => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={e  => (e.currentTarget.style.background = 'transparent')}
      >
        <BellIcon count={notifs.unreadCount} />
      </motion.button>

      {/* Centered Modal Overlay (no more left-floating dropdown) */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
            style={{
              position:        'fixed',
              inset:           0,
              zIndex:          99999,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              padding:         '20px',
              background:      'rgba(15,23,42,0.45)',
              backdropFilter:  'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                position:         'relative',
                width:           '100%',
                maxWidth:        440,
                maxHeight:       'calc(100vh - 120px)',
                display:         'flex',
                flexDirection:    'column',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                style={{
                  position:        'absolute',
                  top:             -14,
                  right:           -14,
                  width:           34,
                  height:          34,
                  borderRadius:    '50%',
                  border:          'none',
                  background:      '#0f172a',
                  color:           '#fff',
                  fontSize:        18,
                  lineHeight:      1,
                  cursor:          'pointer',
                  boxShadow:       '0 4px 12px rgba(0,0,0,0.25)',
                  zIndex:          1,
                }}
              >
                ×
              </button>

              <NotificationPanel
                {...notifs}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}