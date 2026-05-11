/**
 * NewsletterPopup.jsx
 * Exit-intent + timed popup — wired to live backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import SubscriptionForm from './SubscriptionForm';

const DISMISSED_KEY = 'altuvera_nl_dismissed';
const SHOW_AFTER_MS = 30_000; // 30 seconds

const NewsletterPopup = ({ source = 'popup' }) => {
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Show logic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Timed trigger
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);

    // Exit-intent trigger
    const onMouseLeave = (e) => {
      if (e.clientY <= 0 && !localStorage.getItem(DISMISSED_KEY)) {
        setVisible(true);
      }
    };

    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  const handleSuccess = useCallback(() => {
    setSuccess(true);
    // Auto-close after 3.5s on success
    setTimeout(() => {
      dismiss();
    }, 3500);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
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
        @keyframes nlFadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes nlSlideUp { from { opacity:0; transform:translateY(40px) scale(0.96); }
                               to   { opacity:1; transform:translateY(0)    scale(1);    } }
      `}</style>

      {/* Modal */}
      <div
        style={{
          position:        'fixed',
          inset:           0,
          zIndex:          9999,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '16px',
          pointerEvents:   'none',
        }}
      >
        <div
          style={{
            position:        'relative',
            width:           '100%',
            maxWidth:        520,
            pointerEvents:   'auto',
            animation:       'nlSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
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
              zIndex:          1,
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
          />

          {/* Skip link */}
          {!success && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={dismiss}
                style={{
                  background:  'none',
                  border:      'none',
                  color:       'rgba(255,255,255,0.45)',
                  fontSize:    13,
                  cursor:      'pointer',
                  padding:     '4px 8px',
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