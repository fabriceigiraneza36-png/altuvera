// src/components/common/ErrorBoundary.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import "./ErrorBoundary.css";

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY CLASS
// ═══════════════════════════════════════════════════════════════

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
      return this.props.fallback || (
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

// ═══════════════════════════════════════════════════════════════
// ERROR CARD
// ═══════════════════════════════════════════════════════════════

const ErrorCard = ({ error, errorInfo, retryCount, onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timestamp] = useState(() => new Date());

  const maxRetries = 3;
  const canRetry = retryCount < maxRetries;

  // ── Build full error string ──────────────────────────────────
  const errorName = error?.name || "Error";
  const errorMessage = error?.message || error?.toString?.() || "Unknown error";
  const stack = error?.stack || "";
  const componentStack = errorInfo?.componentStack || "";
  const url = typeof window !== "undefined" ? window.location.href : "";
  const timeStr = timestamp.toLocaleString();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const fullErrorText = [
    `═══ ERROR REPORT ═══`,
    ``,
    `▸ NAME`,
    `  ${errorName}`,
    ``,
    `▸ MESSAGE`,
    `  ${errorMessage}`,
    ``,
    `▸ URL`,
    `  ${url}`,
    ``,
    `▸ TIME`,
    `  ${timeStr}`,
    ``,
    `▸ RETRY ATTEMPTS`,
    `  ${retryCount} / ${maxRetries}`,
    ``,
    `▸ BROWSER`,
    `  ${ua}`,
    ...(stack
      ? [``, `▸ STACK TRACE`, stack]
      : []),
    ...(componentStack
      ? [``, `▸ COMPONENT TREE`, componentStack.trim()]
      : []),
    ``,
    `═══ END REPORT ═══`,
  ].join("\n");

  // ── Copy handler ─────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullErrorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const area = document.createElement("textarea");
      area.value = fullErrorText;
      area.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }, [fullErrorText]);

  // ── Retry handler ────────────────────────────────────────────
  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) return;
    setIsRetrying(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsRetrying(false);
    onRetry();
  }, [canRetry, isRetrying, onRetry]);

  // ── ESC to retry ─────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && canRetry) handleRetry();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRetry, canRetry]);

  return (
    <div className="eb-overlay" role="dialog" aria-modal="true">
      <div className="eb-card">

        {/* ── Header ─────────────────────────────── */}
        <div className="eb-head">
          <div className="eb-head-dots" />
          <div className="eb-icon-wrap">
            <FiAlertTriangle />
            <span className="eb-icon-badge" />
          </div>
          <h1 className="eb-h-title">Error Detected</h1>
          <p className="eb-h-sub">Runtime Exception</p>
        </div>

        {/* ── Body ───────────────────────────────── */}
        <div className="eb-body">

          {/* ── Single error container ─────────── */}
          <div className="eb-error-container">
            <div className="eb-err-bar">
              <div className="eb-err-bar-left">
                <span className="eb-err-dot" />
                <span className="eb-err-label">{errorName}</span>
              </div>
              <button
                className={`eb-copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopy}
                title="Copy full error report"
              >
                {copied ? <FiCheck /> : <FiCopy />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="eb-err-content">
              <div className="eb-err-text">

                {/* Error message */}
                <span className="err-section">
                  <span className="err-heading">Message</span>
                  <span className="err-value">{errorMessage}</span>
                </span>

                {/* URL */}
                <span className="err-section">
                  <span className="err-heading">URL</span>
                  <span className="err-value">{url}</span>
                </span>

                {/* Time + Status */}
                <span className="err-section">
                  <span className="err-heading">Time / Status</span>
                  <span className="err-value">
                    {timeStr} · Attempt {retryCount}/{maxRetries}
                  </span>
                </span>

                {/* Stack trace */}
                {stack && (
                  <span className="err-section">
                    <span className="err-heading">Stack Trace</span>
                    <span className="err-stack">{stack}</span>
                  </span>
                )}

                {/* Component tree */}
                {componentStack && (
                  <span className="err-section">
                    <span className="err-heading">Component Tree</span>
                    <span className="err-stack">{componentStack.trim()}</span>
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* ── Buttons ────────────────────────── */}
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


            <button
              className="eb-b eb-b-ghost"
              onClick={() => window.location.reload()}
            >
              <span className="eb-b-icon"><FiRefreshCw /></span>
              Refresh Page
            </button>
          </div>

          {/* ── Retry dots ─────────────────────── */}
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
          <p>
            <span className="eb-foot-brand">Altuvera</span>
            {" · "}
            <kbd>ESC</kbd> to retry
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;