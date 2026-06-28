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

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position:     'absolute',
              top:          'calc(100% + 10px)',
              right:        0,
              zIndex:       9999,
              width:        380,
              maxWidth:     'calc(100vw - 24px)',
            }}
          >
            <NotificationPanel
              {...notifs}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}