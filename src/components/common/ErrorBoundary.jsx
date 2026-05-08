// src/components/common/ErrorBoundary.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
  FiXCircle,
  FiClock,
  FiCpu,
  FiShield,
} from "react-icons/fi";
import { useConnection } from "../../context/ConnectionContext";
import "./ErrorBoundary.css";

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY CLASS COMPONENT
// ═══════════════════════════════════════════════════════════════

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorModal
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════
// ERROR MODAL — ANIMATED POPUP
// ═══════════════════════════════════════════════════════════════

const ErrorModal = ({ error, errorInfo, retryCount, onRetry }) => {
  const { isOnline, connectionStatus, checkConnection } = useConnection();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const [timestamp] = useState(new Date());
  const modalRef = useRef(null);

  const isNetworkError = !isOnline || connectionStatus === "disconnected";
  const maxRetries = 3;
  const isRetryable = retryCount < maxRetries;

  // ── Error classification ────────────────────────────────────
  const errorType = isNetworkError
    ? "network"
    : error?.name === "ChunkLoadError"
      ? "chunk"
      : error?.name === "TypeError"
        ? "type"
        : "runtime";

  const errorConfig = {
    network: {
      icon: <FiWifiOff />,
      title: "Connection Lost",
      subtitle: "Network Error Detected",
      alertTitle: "No Internet Connection",
      alertDesc:
        "Your device appears to be offline. Please check your Wi-Fi or mobile data and try again.",
    },
    chunk: {
      icon: <FiCpu />,
      title: "Update Available",
      subtitle: "Application Changed",
      alertTitle: "New Version Deployed",
      alertDesc:
        "The application has been updated since your last visit. A page refresh will load the latest version.",
    },
    type: {
      icon: <FiXCircle />,
      title: "Type Error",
      subtitle: "Code Exception Detected",
      alertTitle: "Unexpected Data Type",
      alertDesc:
        "A component received unexpected data. This usually resolves with a retry or page refresh.",
    },
    runtime: {
      icon: <FiAlertTriangle />,
      title: "Runtime Error",
      subtitle: "Exception Detected",
      alertTitle: "Something Went Wrong",
      alertDesc:
        "An unexpected error occurred in the application. Our team has been notified automatically.",
    },
  };

  const config = errorConfig[errorType];

  // ── Handle retry with loading state ─────────────────────────
  const handleRetryClick = useCallback(async () => {
    if (!isRetryable || isRetrying) return;
    setIsRetrying(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsRetrying(false);
    onRetry();
  }, [isRetryable, isRetrying, onRetry]);

  // ── Handle connection check ─────────────────────────────────
  const handleCheckConnection = useCallback(async () => {
    setIsRetrying(true);
    await checkConnection();
    await new Promise((r) => setTimeout(r, 600));
    setIsRetrying(false);
    if (navigator.onLine) onRetry();
  }, [checkConnection, onRetry]);

  // ── ESC key to close / retry ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isRetryable) handleRetryClick();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRetryClick, isRetryable]);

  // ── Trap focus inside modal ─────────────────────────────────
  useEffect(() => {
    const btn = modalRef.current?.querySelector("button");
    if (btn) btn.focus();
  }, []);

  // ── Format error details ────────────────────────────────────
  const errorMessage = error?.message || error?.toString() || "Unknown error";
  const errorName = error?.name || "Error";
  const componentStack = errorInfo?.componentStack || "";
  const timeString = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateString = timestamp.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="eb-backdrop" role="dialog" aria-modal="true" aria-label="Error occurred">
      {/* Floating particles */}
      <div className="eb-particles">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="eb-particle" />
        ))}
      </div>

      {/* Modal */}
      <div className="eb-modal" ref={modalRef}>
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="eb-header">
          <div className="eb-header-pattern" />

          <div className={`eb-icon-shell ${isNetworkError ? "network" : ""}`}>
            <span className="eb-icon">{config.icon}</span>
            <span className="eb-warning-badge" />
          </div>

          <h1 className="eb-header-title">{config.title}</h1>
          <p className="eb-header-subtitle">{config.subtitle}</p>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="eb-body">
          {/* Warning alert */}
          <div className={`eb-alert ${errorType === "runtime" || errorType === "type" ? "error-type" : ""}`}>
            <div className="eb-alert-icon">
              <FiShield />
            </div>
            <div className="eb-alert-content">
              <p className="eb-alert-title">{config.alertTitle}</p>
              <p className="eb-alert-desc">{config.alertDesc}</p>
            </div>
          </div>

          {/* Error details box */}
          <div className="eb-error-box">
            <div className="eb-error-header">
              <span className="eb-error-dot" />
              <span className="eb-error-label">{errorName}</span>
            </div>
            <div className="eb-error-body">
              <p className="eb-error-message">{errorMessage}</p>

              {(componentStack || error?.stack) && (
                <>
                  <button
                    onClick={() => setShowStack(!showStack)}
                    style={{
                      appearance: "none",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "var(--eb-font-heading)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#b91c1c",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "6px 0",
                      marginBottom: showStack ? "10px" : 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{
                      transform: showStack ? "rotate(90deg)" : "rotate(0)",
                      transition: "transform 0.2s ease",
                      display: "inline-block",
                    }}>
                      ▶
                    </span>
                    {showStack ? "Hide" : "Show"} Stack Trace
                  </button>

                  {showStack && (
                    <pre className="eb-error-stack">
                      {error?.stack || componentStack}
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info cards */}
          <div className="eb-info-grid">
            <div className="eb-info-card">
              <span className="eb-info-label">
                <FiClock style={{ marginRight: "4px", verticalAlign: "middle" }} />
                Occurred At
              </span>
              <span className="eb-info-value">{timeString}</span>
            </div>
            <div className="eb-info-card">
              <span className="eb-info-label">
                <FiCpu style={{ marginRight: "4px", verticalAlign: "middle" }} />
                Error Type
              </span>
              <span className="eb-info-value" style={{ textTransform: "capitalize" }}>
                {errorType}
              </span>
            </div>
            <div className="eb-info-card">
              <span className="eb-info-label">
                <FiWifi style={{ marginRight: "4px", verticalAlign: "middle" }} />
                Connection
              </span>
              <span className="eb-info-value">
                {isNetworkError ? "Offline" : "Online"}
              </span>
            </div>
            <div className="eb-info-card">
              <span className="eb-info-label">
                <FiShield style={{ marginRight: "4px", verticalAlign: "middle" }} />
                Date
              </span>
              <span className="eb-info-value">{dateString}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="eb-actions">
            {isRetryable && (
              <button
                className="eb-btn eb-btn-primary"
                onClick={handleRetryClick}
                disabled={isRetrying}
              >
                <span className={`eb-btn-icon ${isRetrying ? "spin" : ""}`}>
                  <FiRefreshCw />
                </span>
                {isRetrying ? "Retrying..." : "Try Again"}
              </button>
            )}

            {isNetworkError && (
              <button
                className="eb-btn eb-btn-secondary"
                onClick={handleCheckConnection}
                disabled={isRetrying}
              >
                <span className="eb-btn-icon">
                  <FiWifi />
                </span>
                Check Connection
              </button>
            )}

            <button
              className="eb-btn eb-btn-ghost"
              onClick={() => window.location.reload()}
            >
              <span className="eb-btn-icon">
                <FiRefreshCw />
              </span>
              Refresh Page
            </button>
          </div>

          {/* Retry counter */}
          {retryCount > 0 && (
            <div className="eb-retry-badge">
              <p className="eb-retry-text">
                Attempt {retryCount} of {maxRetries}
              </p>
              <div className="eb-retry-bar">
                {[...Array(maxRetries)].map((_, i) => (
                  <span
                    key={i}
                    className={`eb-retry-dot ${
                      i < retryCount
                        ? i === retryCount - 1 && !isRetryable
                          ? "failed"
                          : "used"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="eb-footer">
          <p className="eb-footer-text">
            Powered by{" "}
            <span className="eb-footer-brand">Altuvera</span>
            {" · "}
            Press <kbd style={{
              padding: "2px 6px",
              borderRadius: "4px",
              background: "var(--eb-green-100)",
              border: "1px solid var(--eb-green-200)",
              fontSize: "0.7rem",
              fontWeight: 700,
            }}>ESC</kbd> to retry
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;