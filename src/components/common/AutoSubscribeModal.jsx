/**
 * AutoSubscribeModal.jsx
 * Shows to logged-in users asking permission to auto-subscribe with their email.
 * Non-intrusive, dismissible, with smart timing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiMail, FiX, FiCheck, FiArrowRight } from 'react-icons/fi';
import { useUserAuth } from '../../context/UserAuthContext';
import { useSubscription } from '../../hooks/useSubscription';

const DISMISSED_KEY = 'altuvera_auto_subscribe_dismissed';
const SHOW_AFTER_MS = 8000; // 8 seconds after page load
const SUBSCRIBED_KEY = 'altuvera_subscribed_email';

export const AutoSubscribeModal = ({ onClosed }) => {
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const { user, isAuthenticated } = useUserAuth();
  const { subscribe, reset: resetSubscription } = useSubscription();

  const userEmail = user?.email?.toLowerCase?.() || '';
  const alreadySubscribed = typeof window !== 'undefined'
    ? localStorage.getItem(`${SUBSCRIBED_KEY}_${userEmail}`) === 'true'
    : false;

  // Also check user profile's subscribed flag
  const profileSaysSubscribed = user?.subscribed === true;

  // ── Show logic ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !userEmail || alreadySubscribed || profileSaysSubscribed) {
      setHasCheckedStorage(true);
      return;
    }

    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setVisible(true);
      }
      setHasCheckedStorage(true);
    }, SHOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated, userEmail, alreadySubscribed, profileSaysSubscribed]);

  // ── Dismiss ─────────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    onClosed?.();
  }, [onClosed]);

  // ── Subscribe handler ───────────────────────────────────────────────────────
  const handleSubscribe = useCallback(async () => {
    if (!userEmail) return;
    setSubscribing(true);
    setError('');

    const result = await subscribe({
      email: userEmail,
      name: user?.fullName || user?.name || undefined,
      source: 'auto-subscribe-logged-in',
    });

    setSubscribing(false);

    if (result.success) {
      setSubscribed(true);
      localStorage.setItem(`${SUBSCRIBED_KEY}_${userEmail}`, 'true');
      setTimeout(() => {
        dismiss();
      }, 2000);
    } else {
      setError(result.error || 'Subscription failed');
    }
  }, [userEmail, user, subscribe, dismiss]);

  // ── Decline handler ─────────────────────────────────────────────────────────
  const handleDecline = useCallback(() => {
    dismiss();
  }, [dismiss]);

  // ── Reset subscription state when modal opens ───────────────────────────────
  useEffect(() => {
    if (visible) {
      setSubscribed(false);
      setError('');
      resetSubscription();
    }
  }, [visible, resetSubscription]);

  if (!hasCheckedStorage || !isAuthenticated || !userEmail || alreadySubscribed) {
    return null;
  }

  if (subscribed) {
    return (
      <div style={overlayStyles} onClick={dismiss}>
        <style>{`
          @keyframes checkBounce {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={successCardStyles} onClick={e => e.stopPropagation()}>
          <div style={{
            ...successIconBox,
            animation: 'checkBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}>
            <FiCheck size={32} color="#fff" />
          </div>
          <h3 style={successTitle}>You're Subscribed!</h3>
          <p style={successText}>
            Welcome to our family. Watch <strong>{userEmail}</strong> for updates.
          </p>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div style={overlayStyles} onClick={dismiss}>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div style={modalCardStyles} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close subscription prompt"
          style={closeBtnStyles}
        >
          <FiX size={16} />
        </button>

        {/* Icon */}
        <div style={iconBoxStyles}>
          <FiMail size={24} color="#fff" />
        </div>

        {/* Content */}
        <h3 style={titleStyles}>Stay in the Loop</h3>
        <p style={descStyles}>
          Get exclusive travel inspiration, insider tips, and members-only offers delivered to your inbox every week.
        </p>

        {/* Email preview */}
        <div style={emailPreviewStyles}>
          <span style={{ fontSize: 13, color: '#6B7280', marginRight: 8 }}>To:</span>
          <span style={{ fontWeight: 600, color: '#065F46', fontSize: 14 }}>{userEmail}</span>
        </div>

        {/* Error */}
        {error && (
          <div style={errorBoxStyles}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={actionsStyles}>
          <button
            onClick={handleDecline}
            disabled={subscribing}
            style={{
              ...btnStyles,
              ...declineBtnStyles,
              opacity: subscribing ? 0.6 : 1,
            }}
          >
            No thanks
          </button>
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            style={{
              ...btnStyles,
              ...subscribeBtnStyles,
              opacity: subscribing || !userEmail ? 0.7 : 1,
            }}
          >
            {subscribing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size={16} />
                Subscribing…
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Subscribe <FiArrowRight size={14} />
              </span>
            )}
          </button>
        </div>

        {/* Discreet dismiss text */}
        <p style={discreetTextStyles}>
          You can unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </div>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ size = 14, color = '#065F46' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: 'subSpin 0.8s linear infinite', flexShrink: 0 }}>
    <style>{`@keyframes subSpin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ── Styles ─────────────────────────────────────────────────────────────────────
const overlayStyles = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 99998,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  animation: 'modalFadeIn 0.25s ease-out forwards',
};

const modalCardStyles = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
  borderRadius: 28,
  padding: 'clamp(24px, 5vw, 40px)',
  maxWidth: 460,
  width: '100%',
  position: 'relative',
  boxShadow: '0 24px 80px -12px rgba(5, 150, 105, 0.35), 0 0 0 1px rgba(5,150,105,0.1)',
  animation: 'modalSlideUp 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  textAlign: 'center',
};

const closeBtnStyles = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(5, 150, 105, 0.08)',
  color: '#065F46',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
};

const iconBoxStyles = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  boxShadow: '0 12px 32px rgba(5,150,105,0.35)',
};

const titleStyles = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 'clamp(22px, 4vw, 28px)',
  fontWeight: 700,
  color: '#064e3b',
  margin: '0 0 12px',
  lineHeight: 1.25,
};

const descStyles = {
  fontSize: 15,
  color: 'rgba(6, 78, 59, 0.7)',
  lineHeight: 1.65,
  margin: '0 0 20px',
  maxWidth: 380,
  marginLeft: 'auto',
  marginRight: 'auto',
};

const emailPreviewStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 18px',
  background: '#ecfdf5',
  border: '1px solid #a7f3d0',
  borderRadius: 12,
  marginBottom: 20,
};

const errorBoxStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '10px 16px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: 10,
  color: '#DC2626',
  fontSize: 13,
  marginBottom: 16,
};

const actionsStyles = {
  display: 'flex',
  gap: 10,
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: 14,
};

const btnStyles = {
  padding: '14px 26px',
  borderRadius: 50,
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 700,
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 140,
  justifyContent: 'center',
};

const subscribeBtnStyles = {
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  color: '#fff',
  boxShadow: '0 6px 20px rgba(5,150,105,0.3)',
};

const declineBtnStyles = {
  background: 'rgba(5, 150, 105, 0.08)',
  color: '#065F46',
  border: '1px solid rgba(5, 150, 105, 0.15)',
};

const successCardStyles = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
  borderRadius: 28,
  padding: 'clamp(32px, 6vw, 48px)',
  maxWidth: 400,
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 24px 80px -12px rgba(5, 150, 105, 0.35)',
};

const successIconBox = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

const successTitle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 'clamp(20px, 4vw, 26px)',
  fontWeight: 700,
  color: '#064e3b',
  margin: '0 0 10px',
};

const successText = {
  fontSize: 15,
  color: 'rgba(6, 78, 59, 0.7)',
  lineHeight: 1.6,
  margin: 0,
};

const discreetTextStyles = {
  fontSize: 12,
  color: 'rgba(6, 78, 59, 0.5)',
  margin: 0,
  marginTop: 12,
};

export default AutoSubscribeModal;
