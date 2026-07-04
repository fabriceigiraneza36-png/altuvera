/**
 * NewsletterPopup.jsx
 * Exit-intent + timed popup — wired to live backend
 *
 * ✅ FIXED: Added hasMountedRef so the popup only tries to show
 *           itself once per page load (prevents repeated triggers)
 * ✅ FIXED: success flag auto-dismisses popup cleanly
 * ✅ FIXED: Dismiss sets localStorage before setVisible(false)
 *           so re-triggers can't fire in the same tick
 */

import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { FiX }           from 'react-icons/fi';
import SubscriptionForm  from './SubscriptionForm';

const DISMISSED_KEY  = 'altuvera_nl_dismissed';
const SHOW_AFTER_MS  = 30_000;   // 30 s timed trigger
const SUCCESS_WAIT   = 3_500;    // auto-close after success

const NewsletterPopup = ({ source = 'popup' }) => {
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Ref guards so timers/listeners can't double-fire
  const dismissedRef   = useRef(false);
  const shownRef       = useRef(false);
  const closeTimerRef  = useRef(null);

  // ── Show logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Already dismissed in this or a previous session
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const showPopup = () => {
      if (dismissedRef.current || shownRef.current) return;
      shownRef.current = true;
      setVisible(true);
    };

    const timer = setTimeout(showPopup, SHOW_AFTER_MS);

    const onMouseLeave = (e) => {
      if (e.clientY <= 0) showPopup();
    };

    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimerRef.current);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []); // ✅ runs exactly once on mount

  // ── Dismiss ────────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;                              // 🔒 lock first
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    clearTimeout(closeTimerRef.current);
    setVisible(false);
  }, []);

  // ── Success callback from SubscriptionForm ─────────────────────────────────
  const handleSuccess = useCallback(() => {
    setSuccess(true);
    // Auto-close after SUCCESS_WAIT ms
    closeTimerRef.current = setTimeout(dismiss, SUCCESS_WAIT);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        aria-hidden="true"
        style={{
          position:        'fixed',
          inset:           0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter:  'blur(4px)',
          zIndex:          9998,
          animation:       'nlFadeIn 0.3s ease-out forwards',
        }}
      />

      <style>{`
        @keyframes nlFadeIn  {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nlSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Modal wrapper */}
      <div
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '16px',
          pointerEvents:  'none',
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter signup"
          style={{
            position:      'relative',
            width:         '100%',
            maxWidth:      520,
            pointerEvents: 'auto',
            animation:     'nlSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close newsletter popup"
            style={{
              position:        'absolute',
              top:             12,
              right:           12,
              zIndex:          10,
              width:           32,
              height:          32,
              borderRadius:    '50%',
              border:          'none',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color:           '#fff',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              backdropFilter:  'blur(4px)',
            }}
          >
            <FiX size={16} />
          </button>

          {/* ✅ No auto-subscribe logic here — requireAuth=false,
              user must click the Subscribe button */}
          <SubscriptionForm
            title="Don't Miss Safari Season!"
            description="Get exclusive wildlife updates, early-bird deals, and curated itineraries before anyone else."
            buttonText="Get Updates"
            sectionLabel="Limited Offers"
            source={source}
            showNameField={false}
            theme="dark"
            style={{ borderRadius: 24 }}
            onSuccess={handleSuccess}
            requireAuth={false}
          />

          {/* Skip link — hidden once subscribed */}
          {!success && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={dismiss}
                style={{
                  background: 'none',
                  border:     'none',
                  color:      'rgba(255,255,255,0.45)',
                  fontSize:   13,
                  cursor:     'pointer',
                  padding:    '4px 8px',
                }}
              >
                No thanks, I'll miss out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsletterPopup;