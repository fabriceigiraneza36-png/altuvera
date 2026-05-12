// src/components/common/ChunkErrorBoundary.jsx
import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHUNK_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'ChunkLoadError',
  'Loading chunk',
  'Loading CSS chunk',
  'Cannot find module',
  'error loading dynamically imported module',
];

const SESSION_KEY_PREFIX = 'altuvera_chunk_reload_';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isChunkLoadError(error) {
  if (!error) return false;
  const text = [
    error?.message,
    error?.name,
    error?.type,
    String(error),
  ]
    .filter(Boolean)
    .join(' ');
  return CHUNK_PATTERNS.some((p) =>
    text.toLowerCase().includes(p.toLowerCase())
  );
}

function getSessionKey(chunkName) {
  return SESSION_KEY_PREFIX + (chunkName || 'default');
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily:
      "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#FAFFFE',
  },
  card: {
    textAlign: 'center',
    maxWidth: 500,
    width: '100%',
    padding: '56px 40px',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    boxShadow:
      '0 4px 6px rgba(0,0,0,0.04), 0 20px 48px rgba(0,0,0,0.06)',
    border: '1px solid #E8F0E8',
  },
  icon: {
    fontSize: 56,
    display: 'block',
    marginBottom: 24,
    lineHeight: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0F1B0F',
    marginBottom: 12,
    fontFamily: "'Playfair Display', Georgia, serif",
    lineHeight: 1.3,
  },
  desc: {
    fontSize: 15,
    color: '#5A7A5A',
    lineHeight: 1.75,
    marginBottom: 32,
    maxWidth: 380,
    margin: '0 auto 32px',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 36px',
    borderRadius: 50,
    border: 'none',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginBottom: 12,
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 28px',
    borderRadius: 50,
    border: '1.5px solid #D0E3D0',
    backgroundColor: 'transparent',
    color: '#3F5C3F',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: 4,
  },
  spinnerWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
    fontFamily: "'Poppins', system-ui, sans-serif",
    backgroundColor: '#FAFFFE',
  },
  spinner: {
    width: 44,
    height: 44,
    border: '3px solid #DCFCE7',
    borderTop: '3px solid #16A34A',
    borderRadius: '50%',
    animation: 'chunkSpin 0.8s linear infinite',
  },
  spinnerText: {
    fontSize: 14,
    color: '#5A7A5A',
    fontWeight: 500,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isChunkError: false,
      reloadAttempted: false,
      errorMessage: '',
    };
    this._reloadTimer = null;
  }

  static getDerivedStateFromError(error) {
    const chunk = isChunkLoadError(error);
    return {
      hasError: true,
      isChunkError: chunk,
      errorMessage: error?.message || String(error),
    };
  }

  componentDidCatch(error, info) {
    // Always log for monitoring
    console.error(
      '[ChunkErrorBoundary] Caught error:',
      error?.message || error,
      info?.componentStack?.split('\n').slice(0, 4).join('\n')
    );

    if (!isChunkLoadError(error)) return;

    const key = getSessionKey(this.props.chunkName);

    try {
      const alreadyTried = sessionStorage.getItem(key);

      if (!alreadyTried) {
        // Mark first attempt, then reload
        sessionStorage.setItem(key, '1');
        this._reloadTimer = setTimeout(() => {
          window.location.reload();
        }, 150);
      } else {
        // Already reloaded — show manual UI
        this.setState({ reloadAttempted: true });
      }
    } catch {
      // sessionStorage blocked (private mode etc.) — just reload once
      window.location.reload();
    }

    // Report to analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'chunk_load_error', {
        event_category: 'error',
        event_label: this.props.chunkName || 'unknown',
        value: 1,
      });
    }
  }

  componentWillUnmount() {
    if (this._reloadTimer) clearTimeout(this._reloadTimer);
  }

  handleManualReload = () => {
    try {
      const key = getSessionKey(this.props.chunkName);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    window.location.reload();
  };

  handleGoHome = () => {
    try {
      // Clear all chunk reload flags
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(SESSION_KEY_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    const { hasError, isChunkError, reloadAttempted } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    // Chunk error — auto-reload in progress
    if (isChunkError && !reloadAttempted) {
      return (
        <>
          <style>{`@keyframes chunkSpin { to { transform: rotate(360deg); } }`}</style>
          <div style={S.spinnerWrap}>
            <div style={S.spinner} />
            <p style={S.spinnerText}>Updating to the latest version…</p>
          </div>
        </>
      );
    }

    // Chunk error — auto-reload failed, show manual UI
    if (isChunkError && reloadAttempted) {
      return (
        <>
          <style>{`@keyframes chunkSpin { to { transform: rotate(360deg); } }`}</style>
          <div style={S.page}>
            <div style={S.card}>
              <span style={S.icon}>🔄</span>
              <h2 style={S.title}>New version available</h2>
              <p style={S.desc}>
                We just deployed an update and this page needs to
                reload to get the latest version. This only takes a
                second.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button
                  style={S.btnPrimary}
                  onClick={this.handleManualReload}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,163,74,0.38)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.3)';
                  }}
                >
                  ↻ &nbsp;Reload Page
                </button>
                <button
                  style={S.btnSecondary}
                  onClick={this.handleGoHome}
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Generic non-chunk error — let parent ErrorBoundary handle it
    // but provide a basic fallback just in case
    return (
      <div style={S.page}>
        <div style={S.card}>
          <span style={S.icon}>⚠️</span>
          <h2 style={S.title}>Something went wrong</h2>
          <p style={S.desc}>
            An unexpected error occurred loading this page. Please try
            reloading or return to the home page.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              style={S.btnPrimary}
              onClick={this.handleManualReload}
            >
              Reload Page
            </button>
            <button
              style={S.btnSecondary}
              onClick={this.handleGoHome}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ChunkErrorBoundary;