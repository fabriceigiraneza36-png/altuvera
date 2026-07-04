/**
 * SubscriptionForm.jsx
 * Fully wired to live backend — sends real emails, saves to DB
 *
 * ✅ FIXED: Removed auto-subscribe useEffect that caused infinite loop
 * ✅ FIXED: Added hasSubmittedRef guard to prevent duplicate calls
 * ✅ FIXED: Logged-in users subscribe on button click only, not automatically
 */

import React, {
  useState, useCallback, useEffect, useRef,
} from 'react';
import {
  FiMail,
  FiCheck,
  FiArrowRight,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { useUserAuth }            from '../../context/UserAuthContext';
import { useSubscription }        from '../../hooks/useSubscription';
import EmailAutocompleteInput     from './EmailAutocompleteInput';

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ color = '#065F46' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'subSpin 0.8s linear infinite', flexShrink: 0 }}
  >
    <style>{`@keyframes subSpin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ── Safe string coercion ──────────────────────────────────────────────────────
const safeStr = (v) => {
  if (v === null || v === undefined)   return '';
  if (typeof v === 'string')           return v;
  if (typeof v === 'number' ||
      typeof v === 'boolean')          return String(v);
  if (typeof v === 'object') {
    if (typeof v.message === 'string') return v.message;
    if (typeof v.code    === 'string') return v.code;
    try { return JSON.stringify(v); }  catch { return 'An error occurred.'; }
  }
  return 'An error occurred.';
};

// ─────────────────────────────────────────────────────────────────────────────

const SubscriptionForm = ({
  title        = 'Get Exclusive Travel Inspiration',
  description  = 'Join adventurers receiving hand-picked destination stories, insider tips, and members-only offers every week.',
  buttonText   = 'Subscribe',
  disclaimer   = 'No spam. Unsubscribe anytime.',
  theme        = 'dark',      // 'dark' | 'light'
  icon         = <FiMail size={14} />,
  sectionLabel = 'Stay Inspired',
  showNameField = false,
  source       = 'website',
  className    = '',
  style        = {},
  onSuccess    = null,
  initialEmail = '',
  initialName  = '',
  requireAuth  = false,
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

  const { isAuthenticated, openModal, user: authUser } = useUserAuth();

  // ✅ Guard: prevent duplicate submissions on any given mount
  const hasSubmittedRef = useRef(false);
  const isDark          = theme === 'dark';

  // Sync initialEmail / initialName when they change from outside
  // (but only if the local field is still empty, so we don't overwrite user input)
  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
  }, [initialEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialName && !name) setName(initialName);
  }, [initialName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset submission guard when the hook resets
  useEffect(() => {
    if (!success && !loading && !error) {
      hasSubmittedRef.current = false;
    }
  }, [success, loading, error]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    // ✅ Guard: only one submit per lifecycle
    if (hasSubmittedRef.current) return;

    // If requireAuth and not logged in → open login modal, do NOT subscribe
    if (requireAuth && !isAuthenticated) {
      openModal('login');
      return;
    }

    // Determine email to use
    // For logged-in users prefer their profile email; fall back to typed email
    const emailToUse = isAuthenticated
      ? (authUser?.email || email).trim()
      : email.trim();

    if (!emailToUse) return;

    hasSubmittedRef.current = true;          // 🔒 lock

    const result = await subscribe({
      email:  emailToUse,
      name:   name.trim(),
      source,
      userId: isAuthenticated ? (authUser?.id ?? null) : null,
    });

    if (result?.success) {
      setEmail('');
      setName('');
      onSuccess?.({
        email:             emailToUse,
        subscriber:        result.subscriber,
        alreadySubscribed: result.alreadySubscribed,
      });
    } else {
      // Allow retry on failure
      hasSubmittedRef.current = false;
    }
  }, [
    email, name, source,
    subscribe, onSuccess,
    isAuthenticated, authUser,
    openModal, requireAuth,
  ]);

  // ── Styles ────────────────────────────────────────────────────────────────
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
      position:     'absolute',
      top:          '-40%',
      right:        '-10%',
      width:        400,
      height:       400,
      borderRadius: '50%',
      background:   isDark
        ? 'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)'
        : 'radial-gradient(circle,rgba(34,197,94,0.1)  0%,transparent 70%)',
      pointerEvents: 'none',
    },
    badge: {
      display:         'inline-flex',
      alignItems:      'center',
      gap:             8,
      padding:         '10px 24px',
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(6,95,70,0.08)',
      borderRadius:  50,
      color:         isDark ? '#86EFAC' : '#065F46',
      fontSize:      12,
      fontWeight:    800,
      textTransform: 'uppercase',
      letterSpacing: 2.5,
      marginBottom:  20,
      border:        isDark
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
      fontSize:    16,
      color:       isDark
        ? 'rgba(255,255,255,0.7)'
        : 'rgba(6,95,70,0.7)',
      marginBottom: 32,
      lineHeight:  1.7,
      maxWidth:    520,
      margin:      '0 auto 32px',
    },
    form: {
      display:       'flex',
      flexDirection: 'column',
      gap:           12,
      maxWidth:      480,
      margin:        '0 auto',
    },
    row: {
      display:        'flex',
      gap:            12,
      flexWrap:       'wrap',
      justifyContent: 'center',
    },
    nameInput: {
      width:           '100%',
      padding:         '14px 22px',
      borderRadius:    50,
      border:          isDark
        ? '2px solid rgba(255,255,255,0.15)'
        : '2px solid rgba(6,95,70,0.2)',
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(255,255,255,0.8)',
      color:    isDark ? '#FFFFFF' : '#065F46',
      fontSize: 15,
      outline:  'none',
    },
    emailInput: {
      flex:            '1 1 220px',
      padding:         '16px 24px',
      borderRadius:    50,
      border:          isDark
        ? '2px solid rgba(255,255,255,0.15)'
        : '2px solid rgba(6,95,70,0.2)',
      backgroundColor: isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(255,255,255,0.8)',
      color:    isDark ? '#FFFFFF' : '#065F46',
      fontSize: 15,
      outline:  'none',
      minWidth: 200,
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
      border:       isDark
        ? '1px solid rgba(255,255,255,0.12)'
        : '1px solid rgba(5,150,105,0.2)',
      borderRadius: 20,
      maxWidth:     400,
      margin:       '0 auto',
    },
    successIcon: {
      width:           56,
      height:          56,
      borderRadius:    '50%',
      backgroundColor: isDark
        ? 'rgba(134,239,172,0.15)'
        : 'rgba(5,150,105,0.1)',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: {
      fontSize:   18,
      fontWeight: 700,
      color:      isDark ? '#FFFFFF' : '#065F46',
      margin:     0,
    },
    successSubtitle: {
      fontSize:   14,
      color:      isDark
        ? 'rgba(255,255,255,0.65)'
        : 'rgba(6,95,70,0.7)',
      margin:     0,
      lineHeight: 1.6,
    },
    resetBtn: {
      background:   'none',
      border:       'none',
      cursor:       'pointer',
      fontSize:     13,
      color:        isDark
        ? 'rgba(255,255,255,0.45)'
        : 'rgba(6,95,70,0.5)',
      display:      'flex',
      alignItems:   'center',
      gap:          5,
      padding:      '4px 8px',
      borderRadius: 8,
    },
    disclaimer: {
      fontSize:  12,
      color:     isDark
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(6,95,70,0.5)',
      marginTop: 16,
    },
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    const subEmail =
      typeof subscriber?.email === 'string' ? subscriber.email : null;

    return (
      <div className={className} style={s.container}>
        <div style={s.blob} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={s.successBox}>

            <div style={s.successIcon}>
              {alreadySubscribed
                ? <span style={{ fontSize: 26 }}>😊</span>
                : <FiCheck size={26} color={isDark ? '#86EFAC' : '#059669'} />}
            </div>

            <p style={s.successTitle}>
              {alreadySubscribed
                ? "You're Already Subscribed!"
                : 'Welcome to the Family! 🎉'}
            </p>

            <p style={s.successSubtitle}>
              {alreadySubscribed
                ? "You're already on our list. Keep an eye on your inbox for our latest updates!"
                : subEmail
                  ? `A welcome email is on its way to ${subEmail}. Check your inbox!`
                  : 'A welcome email is on its way. Check your inbox (and spam folder)!'}
            </p>

            <button onClick={reset} style={s.resetBtn}>
              <FiRefreshCw size={12} />
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ────────────────────────────────────────────────────────────
  const errorMessage = error ? safeStr(error) : null;

  // For logged-in users, show their profile email (read-only hint)
  const displayEmail = isAuthenticated && authUser?.email
    ? authUser.email
    : email;

  return (
    <div className={className} style={s.container}>
      <div style={s.blob} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {sectionLabel && (
          <div>
            <span style={s.badge}>
              {icon && <span style={{ display: 'flex' }}>{icon}</span>}
              {sectionLabel}
            </span>
          </div>
        )}

        <h3 style={s.title}>{title}</h3>
        <p style={s.description}>{description}</p>

        <form onSubmit={handleSubmit} style={s.form} noValidate>

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

          <div style={s.row}>
            {/* If logged in, show read-only email pill; else show input */}
            {isAuthenticated && authUser?.email ? (
              <div style={{
                ...s.emailInput,
                display:    'flex',
                alignItems: 'center',
                opacity:    0.75,
                cursor:     'default',
                userSelect: 'none',
              }}>
                <FiMail size={14} style={{ marginRight: 8, flexShrink: 0 }} />
                <span style={{
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>
                  {authUser.email}
                </span>
              </div>
            ) : (
              <EmailAutocompleteInput
                value={email}
                onValueChange={setEmail}
                required
                placeholder="Enter your email"
                disabled={loading}
                style={s.emailInput}
              />
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (!isAuthenticated && !email.trim()) ||
                hasSubmittedRef.current
              }
              style={{
                ...s.button,
                opacity: (
                  loading ||
                  (!isAuthenticated && !email.trim()) ||
                  hasSubmittedRef.current
                ) ? 0.7 : 1,
              }}
            >
              {loading
                ? <><Spinner color={isDark ? '#065F46' : '#FFFFFF'} /> Subscribing…</>
                : <>{buttonText} <FiArrowRight size={16} /></>}
            </button>
          </div>

          {errorMessage && (
            <div style={s.errorBox} role="alert" aria-live="polite">
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>

        <p style={s.disclaimer}>🔒 {disclaimer}</p>
      </div>
    </div>
  );
};

export default SubscriptionForm;