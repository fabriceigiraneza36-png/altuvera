/**
 * NewsletterWidget.jsx
 * Minimal inline widget for footer / sidebar
 */

import React, { useState, useEffect } from 'react';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useSubscription } from '../../hooks/useSubscription';

const NewsletterWidget = ({
  source    = 'footer',
  className = '',
  style     = {},
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);

  const {
    loading,
    success,
    error,
    alreadySubscribed,
    subscriber,
    subscribe,
    reset,
  } = useSubscription();

  // Update if initialEmail changes (e.g., when user logs in)
  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
  }, [initialEmail, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await subscribe({ email, source });
    if (result.success) setEmail('');
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={className} style={style}>
        <div style={{
          display:         'flex',
          alignItems:      'flex-start',
          gap:             12,
          padding:         '14px 16px',
          backgroundColor: '#F0FDF4',
          border:          '1px solid #BBF7D0',
          borderRadius:    14,
        }}>
          <div style={{
            width:           36,
            height:          36,
            borderRadius:    '50%',
            backgroundColor: '#DCFCE7',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
          }}>
            {alreadySubscribed
              ? <span style={{ fontSize: 18 }}>😊</span>
              : <FiCheck size={18} color="#059669" />
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              margin:     '0 0 2px',
              fontSize:   14,
              fontWeight: 700,
              color:      '#065F46',
            }}>
              {alreadySubscribed ? 'Already subscribed!' : "You're in! 🎉"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
              {alreadySubscribed
                ? 'Watch your inbox for our updates.'
                : subscriber?.email
                  ? `Welcome email sent to ${subscriber.email}`
                  : 'Welcome email sent — check your inbox!'
              }
            </p>
            <button
              onClick={reset}
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                fontSize:     12,
                color:        '#9CA3AF',
                padding:      '4px 0 0',
                textDecoration: 'underline',
              }}
            >
              Subscribe another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────────────────────────────
  return (
    <div className={className} style={style}>
      <form onSubmit={handleSubmit}>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
            style={{
              flex:            1,
              minWidth:        0,
              padding:         '10px 14px',
              fontSize:        14,
              border:          '1px solid #E5E7EB',
              borderRadius:    10,
              outline:         'none',
              backgroundColor: '#FFFFFF',
              color:           '#111827',
              opacity:         loading ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            style={{
              padding:         '10px 18px',
              backgroundColor: '#059669',
              color:           '#FFFFFF',
              border:          'none',
              borderRadius:    10,
              fontSize:        14,
              fontWeight:      700,
              cursor:          loading || !email.trim() ? 'not-allowed' : 'pointer',
              opacity:         loading || !email.trim() ? 0.6 : 1,
              whiteSpace:      'nowrap',
              display:         'flex',
              alignItems:      'center',
              gap:             6,
              transition:      'opacity 0.2s',
            }}
          >
            {loading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5"
                   style={{ animation: 'subSpin 0.8s linear infinite' }}>
                <style>{`@keyframes subSpin{to{transform:rotate(360deg)}}`}</style>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
            ) : 'Subscribe'}
          </button>
        </div>

        {error && (
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            marginTop:  8,
            fontSize:   12,
            color:      '#DC2626',
          }}>
            <FiAlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}

        <p style={{
          margin:    '8px 0 0',
          fontSize:  11,
          color:     '#9CA3AF',
          lineHeight: 1.5,
        }}>
          🔒 No spam · Unsubscribe anytime
        </p>
      </form>
    </div>
  );
};

export default NewsletterWidget;