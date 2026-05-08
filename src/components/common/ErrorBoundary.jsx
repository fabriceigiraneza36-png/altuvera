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
  FiX,
  FiCode,
  FiLayers,
  FiInfo,
  FiTerminal,
} from "react-icons/fi";
import { useConnection } from "../../context/ConnectionContext";
import "./ErrorBoundary.css";

/* ═══════════════════════════════════════════════════════════════
   ERROR BOUNDARY (class wrapper)
   ═══════════════════════════════════════════════════════════════ */

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = () =>
    this.setState((p) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: p.retryCount + 1,
    }));

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <ErrorCard
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

/* ═══════════════════════════════════════════════════════════════
   FULL DETAILS POPUP
   ═══════════════════════════════════════════════════════════════ */

const DetailsPopup = ({ error, errorInfo, timestamp, onClose }) => {
  const popupRef = useRef(null);
  const errorMessage = error?.message || error?.toString?.() || "Unknown error";
  const errorName = error?.name || "Error";
  const stack = error?.stack || "";
  const componentStack = errorInfo?.componentStack || "";
  const timeStr = timestamp.toLocaleString();

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    popupRef.current?.querySelector("button")?.focus();
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="eb-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="eb-detail-popup" ref={popupRef}>

        {/* Header */}
        <div className="eb-detail-header">
          <div className="eb-detail-header-left">
            <span className="eb-detail-header-dot" />
            <span className="eb-detail-header-title">Full Error Report</span>
          </div>
          <button className="eb-detail-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="eb-detail-body">

          {/* Error message */}
          <div className="eb-detail-section">
            <p className="eb-detail-section-label">
              <FiAlertTriangle /> Error Message
            </p>
            <p className="eb-detail-msg">{errorMessage}</p>
          </div>

          {/* Metadata */}
          <div className="eb-detail-section">
            <p className="eb-detail-section-label">
              <FiInfo /> Details
            </p>
            <div className="eb-detail-info-grid">
              <div className="eb-detail-info-item">
                <span className="eb-detail-info-label">Name</span>
                <span className="eb-detail-info-value">{errorName}</span>
              </div>
              <div className="eb-detail-info-item">
                <span className="eb-detail-info-label">Time</span>
                <span className="eb-detail-info-value">{timeStr}</span>
              </div>
              <div className="eb-detail-info-item">
                <span className="eb-detail-info-label">URL</span>
                <span className="eb-detail-info-value">{window.location.pathname}</span>
              </div>
              <div className="eb-detail-info-item">
                <span className="eb-detail-info-label">Browser</span>
                <span className="eb-detail-info-value">
                  {navigator.userAgent.split(" ").slice(-2).join(" ").substring(0, 30)}
                </span>
              </div>
            </div>
          </div>

          {/* Stack trace */}
          {stack && (
            <div className="eb-detail-section">
              <p className="eb-detail-section-label">
                <FiTerminal /> Stack Trace
              </p>
              <pre className="eb-detail-stack">{stack}</pre>
            </div>
          )}

          {/* Component stack */}
          {componentStack && (
            <div className="eb-detail-section">
              <p className="eb-detail-section-label">
                <FiLayers /> Component Tree
              </p>
              <pre className="eb-detail-component">{componentStack.trim()}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPACT ERROR CARD
   ═══════════════════════════════════════════════════════════════ */

const ErrorCard = ({ error, errorInfo, retryCount, onRetry }) => {
  const { isOnline, connectionStatus, checkConnection } = useConnection();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [timestamp] = useState(() => new Date());

  const isNetworkError = !isOnline || connectionStatus === "disconnected";
  const maxRetries = 3;
  const canRetry = retryCount < maxRetries;

  const errorMessage = error?.message || error?.toString?.() || "Unknown error";
  const errorName = error?.name || "Error";

  const type = isNetworkError
    ? "network"
    : error?.name === "ChunkLoadError"
      ? "chunk"
      : "runtime";

  const cfg = {
    network: {
      icon: <FiWifiOff />,
      title: "Connection Lost",
      sub: "Network Error",
      alertTitle: "You Are Offline",
      alertDesc: "Check your internet connection and try again.",
    },
    chunk: {
      icon: <FiCpu />,
      title: "Update Required",
      sub: "Version Changed",
      alertTitle: "App Was Updated",
      alertDesc: "Refresh the page to load the latest version.",
    },
    runtime: {
      icon: <FiAlertTriangle />,
      title: "Error Detected",
      sub: "Runtime Exception",
      alertTitle: "Something Broke",
      alertDesc: "An unexpected error occurred. View details or retry.",
    },
  }[type];

  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;
    setIsRetrying(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsRetrying(false);
    onRetry();
  }, [canRetry, isRetrying, onRetry]);

  const handleCheck = useCallback(async () => {
    setIsRetrying(true);
    await checkConnection();
    await new Promise((r) => setTimeout(r, 500));
    setIsRetrying(false);
    if (navigator.onLine) onRetry();
  }, [checkConnection, onRetry]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && canRetry && !showPopup) handleRetry();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRetry, canRetry, showPopup]);

  const time = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <>
      <div className="eb-overlay" role="dialog" aria-modal="true">
        <div className="eb-card">
          {/* ── Header ─────────────────────────────── */}
          <div className="eb-top">
            <div className="eb-top-dots" />
            <div className={`eb-icon-bubble ${isNetworkError ? "shake" : ""}`}>
              {cfg.icon}
              <span className="eb-icon-dot" />
            </div>
            <h1 className="eb-title">{cfg.title}</h1>
            <p className="eb-subtitle">{cfg.sub}</p>
          </div>

          {/* ── Body ───────────────────────────────── */}
          <div className="eb-content">
            {/* Alert strip */}
            <div className={`eb-strip ${type === "runtime" ? "is-error" : ""}`}>
              <div className="eb-strip-icon">
                <FiShield />
              </div>
              <div>
                <p className="eb-strip-title">{cfg.alertTitle}</p>
                <p className="eb-strip-desc">{cfg.alertDesc}</p>
              </div>
            </div>

            {/* Error preview */}
            <div className="eb-err-preview">
              <div className="eb-err-preview-head">
                <span className="eb-err-dot" />
                <span className="eb-err-name">{errorName}</span>
              </div>
              <p className="eb-err-msg">
                {errorMessage.length > 120
                  ? `${errorMessage.substring(0, 120)}…`
                  : errorMessage}
              </p>
              <button
                className="eb-details-btn"
                onClick={() => setShowPopup(true)}
              >
                <FiCode style={{ fontSize: "12px" }} />
                View Full Details
                <span className={`eb-details-arrow ${showPopup ? "open" : ""}`}>
                  ▶
                </span>
              </button>
            </div>

            {/* Info chips */}
            <div className="eb-info-row">
              <div className="eb-info-chip">
                <span className="eb-chip-label"><FiClock /> Time</span>
                <span className="eb-chip-value">{time}</span>
              </div>
              <div className="eb-info-chip">
                <span className="eb-chip-label"><FiWifi /> Status</span>
                <span className="eb-chip-value">
                  {isNetworkError ? "Offline" : "Online"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="eb-btns">
              {canRetry && (
                <button
                  className="eb-b eb-b-primary"
                  onClick={handleRetry}
                  disabled={isRetrying}
                >
                  <span className={`eb-b-icon ${isRetrying ? "spin" : ""}`}>
                    <FiRefreshCw />
                  </span>
                  {isRetrying ? "Retrying…" : "Try Again"}
                </button>
              )}

              {isNetworkError && (
                <button
                  className="eb-b eb-b-secondary"
                  onClick={handleCheck}
                  disabled={isRetrying}
                >
                  <span className="eb-b-icon"><FiWifi /></span>
                  Check Connection
                </button>
              )}

              <button
                className="eb-b eb-b-ghost"
                onClick={() => window.location.reload()}
              >
                <span className="eb-b-icon"><FiRefreshCw /></span>
                Refresh Page
              </button>
            </div>

            {/* Retry dots */}
            {retryCount > 0 && (
              <div className="eb-retry">
                <p className="eb-retry-label">
                  Attempt {retryCount} / {maxRetries}
                </p>
                <div className="eb-retry-dots">
                  {[...Array(maxRetries)].map((_, i) => (
                    <span
                      key={i}
                      className={`eb-rdot ${
                        i < retryCount
                          ? i === retryCount - 1 && !canRetry
                            ? "fail"
                            : "used"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────── */}
          <div className="eb-foot">
            <p className="eb-foot-text">
              <span className="eb-foot-brand">Altuvera</span>
              {" · "}
              <kbd>ESC</kbd> to retry
            </p>
          </div>
        </div>
      </div>

      {/* ── Full Details Popup ─────────────────────── */}
      {showPopup && (
        <DetailsPopup
          error={error}
          errorInfo={errorInfo}
          timestamp={timestamp}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default ErrorBoundary;