/**
 * SubscriptionForm.jsx
 * Fully wired to live backend — sends real emails, saves to DB
 */

import React, { useState, useCallback, useEffect } from 'react';
import { FiMail, FiCheck, FiArrowRight, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import EmailAutocompleteInput from './EmailAutocompleteInput';
import { useSubscription } from '../../hooks/useSubscription';

// ── Loading spinner ───────────────────────────────────────────────────────────
const Spinner = ({ color = '#065F46' }) => (
  <svg
    width="16" height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'subSpin 0.8s linear infinite', flexShrink: 0 }}
  >
    <style>{`@keyframes subSpin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const SubscriptionForm = ({
  title        = "Get Exclusive Travel Inspiration",
  description  = "Join 25,000+ adventurers receiving hand-picked destination stories, insider tips, and members-only offers every week.",
  buttonText   = "Subscribe",
  disclaimer   = "No spam. Unsubscribe anytime.",
  theme        = "dark",       // "dark" | "light"
  icon         = <FiMail size={14} />,
  sectionLabel = "Stay Inspired",
  showNameField = false,        // optional name input
  source       = "website",    // tracks where the signup came from
  className    = "",
  style        = {},
  onSuccess    = null,          // optional callback({ email, subscriber, alreadySubscribed })
  initialEmail = "",            // optional pre-filled email (e.g., from logged-in user)
  initialName  = "",            // optional pre-filled name
  user         = null,          // optional user object for context
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [name,  setName]  = useState(initialName);

  const {
    loading,
    success,
    error,
    alreadySubscribed,
    subscriber,
    subscribe,
    reset,
  } = useSubscription();

  const isDark = theme === 'dark';

  // Update local state if initial props change (e.g., user logs in)
  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
    if (initialName && !name) setName(initialName);
  }, [initialEmail, initialName, email, name]);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const result = await subscribe({
      email:  email.trim(),
      name:   name.trim(),
      source,
    });

    if (result.success) {
      setEmail('');
      setName('');
      onSuccess?.({
        email,
        subscriber:        result.subscriber,
        alreadySubscribed: result.alreadySubscribed,
      });
    }
  }, [email, name, source, subscribe, onSuccess]);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    container: {
      background: isDark
        ? 'linear-gradient(135deg,#065F46 0%,#064E3B 100%)'
        : 'linear-gradient(135deg,#F0FDF4 0%,#DCFCE7 100%)',
      borderRadius: 32,
      padding:      'clamp(28px,5vw,52px)',
      textAlign:    'center',
      position:     'relative',
      overflow:     'hidden',
      ...style,
    },
    blob: {
      position:      'absolute',
      top:           '-40%',
      right:         '-10%',
      width:         400,
      height:        400,
      borderRadius:  '50%',
      background:    isDark
        ? 'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)'
        : 'radial-gradient(circle,rgba(34,197,94,0.1) 0%,transparent 70%)',
      pointerEvents: 'none',
    },
    badge: {
      display:         'inline-flex',
      alignItems:      'center',
      gap:             8,
      padding:         '10px 24px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(6,95,70,0.08)',
      borderRadius:    50,
      color:           isDark ? '#86EFAC' : '#065F46',
      fontSize:        12,
      fontWeight:      800,
      textTransform:   'uppercase',
      letterSpacing:   2.5,
      marginBottom:    20,
      border:          isDark
        ? '1px solid rgba(255,255,255,0.1)'
        : '1px solid rgba(6,95,70,0.15)',
    },
    title: {
      fontFamily:   "'Playfair Display',Georgia,serif",
      fontSize:     'clamp(26px,4vw,38px)',
      fontWeight:   700,
      color:        isDark ? '#FFFFFF' : '#065F46',
      marginBottom: 14,
      lineHeight:   1.2,
    },
    description: {
      fontSize:     16,
      color:        isDark ? 'rgba(255,255,255,0.7)' : 'rgba(6,95,70,0.7)',
      marginBottom: 32,
      lineHeight:   1.7,
      maxWidth:     520,
      marginLeft:   'auto',
      marginRight:  'auto',
    },
    form: {
      display:        'flex',
      flexDirection:  'column',
      gap:            12,
      maxWidth:       480,
      margin:         '0 auto',
    },
    row: {
      display:         'flex',
      gap:             12,
      flexWrap:        'wrap',
      justifyContent:  'center',
    },
    nameInput: {
      width:           '100%',
      padding:         '14px 22px',
      borderRadius:    50,
      border:          isDark
        ? '2px solid rgba(255,255,255,0.15)'
        : '2px solid rgba(6,95,70,0.2)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
      color:           isDark ? '#FFFFFF' : '#065F46',
      fontSize:        15,
      outline:         'none',
    },
    emailInput: {
      flex:            '1 1 220px',
      padding:         '16px 24px',
      borderRadius:    50,
      border:          isDark
        ? '2px solid rgba(255,255,255,0.15)'
        : '2px solid rgba(6,95,70,0.2)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
      color:           isDark ? '#FFFFFF' : '#065F46',
      fontSize:        15,
      outline:         'none',
      minWidth:        200,
    },
    button: {
      padding:         '16px 32px',
      borderRadius:    50,
      border:          'none',
      backgroundColor: isDark ? '#FFFFFF' : '#065F46',
      color:           isDark ? '#065F46' : '#FFFFFF',
      fontSize:        15,
      fontWeight:      700,
      cursor:          loading ? 'not-allowed' : 'pointer',
      display:         'flex',
      alignItems:      'center',
      gap:             8,
      whiteSpace:      'nowrap',
      opacity:         loading || !email.trim() ? 0.7 : 1,
      transition:      'opacity 0.2s,transform 0.2s',
      flexShrink:      0,
    },
    errorBox: {
      display:         'flex',
      alignItems:      'center',
      gap:             8,
      padding:         '12px 20px',
      backgroundColor: 'rgba(239,68,68,0.12)',
      border:          '1px solid rgba(239,68,68,0.3)',
      borderRadius:    12,
      color:           isDark ? '#FCA5A5' : '#DC2626',
      fontSize:        14,
      textAlign:       'left',
    },
    successBox: {
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      gap:             12,
      padding:         '32px 24px',
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(5,150,105,0.06)',
      border:          isDark
        ? '1px solid rgba(255,255,255,0.12)'
        : '1px solid rgba(5,150,105,0.2)',
      borderRadius:    20,
      maxWidth:        400,
      margin:          '0 auto',
    },
    successIcon: {
      width:           56,
      height:          56,
      borderRadius:    '50%',
      backgroundColor: isDark ? 'rgba(134,239,172,0.15)' : 'rgba(5,150,105,0.1)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
    },
    successTitle: {
      fontSize:   18,
      fontWeight: 700,
      color:      isDark ? '#FFFFFF' : '#065F46',
      margin:     0,
    },
    successSubtitle: {
      fontSize:    14,
      color:       isDark ? 'rgba(255,255,255,0.65)' : 'rgba(6,95,70,0.7)',
      margin:      0,
      lineHeight:  1.6,
    },
    resetBtn: {
      background:  'none',
      border:      'none',
      cursor:      'pointer',
      fontSize:    13,
      color:       isDark ? 'rgba(255,255,255,0.45)' : 'rgba(6,95,70,0.5)',
      display:     'flex',
      alignItems:  'center',
      gap:         5,
      padding:     '4px 8px',
      borderRadius: 8,
    },
    disclaimer: {
      fontSize:  12,
      color:     isDark ? 'rgba(255,255,255,0.4)' : 'rgba(6,95,70,0.5)',
      marginTop: 16,
    },
  };

  // ── Render: Success ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={className} style={s.container}>
        <div style={s.blob} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={s.successBox}>

            {/* Icon */}
            <div style={s.successIcon}>
              {alreadySubscribed
                ? <span style={{ fontSize: 26 }}>😊</span>
                : <FiCheck size={26} color={isDark ? '#86EFAC' : '#059669'} />
              }
            </div>

            {/* Title */}
            <p style={s.successTitle}>
              {alreadySubscribed
                ? "You're Already Subscribed!"
                : "Welcome to the Family! 🎉"}
            </p>

            {/* Message */}
            <p style={s.successSubtitle}>
              {alreadySubscribed
                ? "You're already on our list. Keep an eye on your inbox for our latest updates!"
                : subscriber?.email
                  ? `A welcome email is on its way to ${subscriber.email}. Check your inbox!`
                  : "A welcome email is on its way. Check your inbox (and spam folder)!"}
            </p>

            {/* Reset button */}
            <button onClick={reset} style={s.resetBtn}>
              <FiRefreshCw size={12} />
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Form ────────────────────────────────────────────────────────────
  return (
    <div className={className} style={s.container}>
      <div style={s.blob} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        {sectionLabel && (
          <div>
            <span style={s.badge}>
              {icon && <span style={{ display: 'flex' }}>{icon}</span>}
              {sectionLabel}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 style={s.title}>{title}</h3>

        {/* Description */}
        <p style={s.description}>{description}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form} noValidate>

          {/* Optional name field */}
          {showNameField && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name (optional)"
              disabled={loading}
              style={s.nameInput}
            />
          )}

          {/* Email + Button row */}
          <div style={s.row}>
            <EmailAutocompleteInput
              value={email}
              onValueChange={setEmail}
              required
              placeholder="Enter your email"
              disabled={loading}
              style={s.emailInput}
            />

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={s.button}
            >
              {loading
                ? <><Spinner color={isDark ? '#065F46' : '#FFFFFF'} /> Subscribing…</>
                : <>{buttonText} <FiArrowRight size={16} /></>
              }
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={s.errorBox}>
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Disclaimer */}
        <p style={s.disclaimer}>🔒 {disclaimer}</p>
      </div>
    </div>
  );
};

export default SubscriptionForm;