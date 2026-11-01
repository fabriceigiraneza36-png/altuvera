import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, MessageSquareText, X } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

const BellIcon = ({ count }) => (
  <span style={{ position:'relative', display:'grid', placeItems:'center', width:44, height:44, borderRadius:16, color:'#087f58', background:'linear-gradient(145deg,#f1fbf5,#e0f5e9)', border:'1px solid #ccebd9', boxShadow:'0 5px 16px rgba(5,150,105,.12)' }}>
    {count > 0 ? <MessageSquareText size={22} strokeWidth={1.9} /> : <BellRing size={22} strokeWidth={1.9} />}
    <AnimatePresence>
      {count > 0 && <motion.span key="badge" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} style={{position:'absolute',top:-5,right:-5,minWidth:19,height:19,padding:'0 4px',boxSizing:'border-box',display:'grid',placeItems:'center',borderRadius:999,background:'#e11d48',color:'#fff',fontSize:10,fontWeight:850,lineHeight:1,border:'2px solid #fff',boxShadow:'0 2px 7px rgba(225,29,72,.3)'}}>{count>99?'99+':count}</motion.span>}
    </AnimatePresence>
  </span>
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
          if (!open) { notifs.refresh(); void notifs.markAllRead(); }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${notifs.unreadCount > 0 ? ` (${notifs.unreadCount} unread)` : ''}`} title="Notifications"
        style={{
          background:   'transparent',
          border:       'none',
          cursor:       'pointer',
          padding:      0,
          borderRadius: 16,
          color:        '#087f58',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'background 0.2s',
        }}
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
              padding:         0,
              background:      'rgba(7,25,20,0.62)',
              backdropFilter:  'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="notification-dialog"
              style={{ position:'relative', width:'min(100%, 520px)', maxWidth:'100%', height:'100%', maxHeight:'100%', display:'flex', flexDirection:'column' }}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="notification-dialog-close"
                style={{ position:'absolute', top:'max(12px, env(safe-area-inset-top))', right:14, width:40, height:40, display:'grid', placeItems:'center', borderRadius:14, border:'1px solid rgba(255,255,255,.16)', background:'#0f2922', color:'#fff', cursor:'pointer', boxShadow:'0 8px 22px rgba(0,0,0,.22)', zIndex:10 }}
              >
                <X size={20} />
              </button>

              <style>{`.notification-dialog > div { height:100%; max-height:100%; border-radius:24px; } @media (max-width:640px) { .notification-dialog { width:100%!important; height:100dvh!important; height:100vh!important; max-width:none!important; } .notification-dialog > div { height:100%; max-height:100%; border-radius:0!important; border:0!important; padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom); box-sizing:border-box; } .notification-dialog-close { top:max(10px,env(safe-area-inset-top))!important; right:12px!important; } }`}</style>
              <NotificationPanel {...notifs} onClose={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}