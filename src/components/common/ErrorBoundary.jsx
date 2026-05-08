// src/components/common/ErrorBoundary.jsx
import React from "react";
import {
  FiAlertTriangle,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import { useConnection } from "../../context/ConnectionContext";
import "./ErrorBoundary.css";

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

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, retryCount, onRetry, fallback }) => {
  const { isOnline, connectionStatus, checkConnection } = useConnection();

  if (fallback) return fallback;

  const isNetworkError = !isOnline || connectionStatus === "disconnected";
  const isRetryable = retryCount < 3;

  const title = isNetworkError ? "Connection Lost" : "Something Went Wrong";
  const description = isNetworkError
    ? "Your internet connection appears to be unavailable. Please check your network and try again."
    : "We hit an unexpected problem while loading this section. You can retry or refresh the page.";

  return (
    <section className="error-boundary-wrapper">
      <div className="error-background">
        <span className="bg-orb orb-1"></span>
        <span className="bg-orb orb-2"></span>
        <span className="bg-orb orb-3"></span>
      </div>

      <div className="error-card" role="alert" aria-live="assertive">
        <div className="error-status-badge">
          {isNetworkError ? <FiWifiOff /> : <FiAlertTriangle />}
          <span>{isNetworkError ? "Offline Mode" : "Application Error"}</span>
        </div>

        <div
          className={`error-icon-shell ${
            isNetworkError ? "network-shell" : "warning-shell"
          }`}
        >
          {isNetworkError ? (
            <FiWifiOff className="error-icon network" />
          ) : (
            <FiAlertTriangle className="error-icon warning" />
          )}
        </div>

        <h2 className="error-title">{title}</h2>

        <p className="error-description">{description}</p>

        <div className="error-info-row">
          <div className="info-chip">
            <span className="chip-label">Status</span>
            <span className="chip-value">
              {isNetworkError ? "Disconnected" : "Unexpected issue"}
            </span>
          </div>

          <div className="info-chip">
            <span className="chip-label">Retry attempts</span>
            <span className="chip-value">{retryCount} / 3</span>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <details className="error-details">
            <summary>Error details</summary>
            <pre>{error.toString()}</pre>
          </details>
        )}

        <div className="error-actions">
          {isRetryable && (
            <button onClick={onRetry} className="action-btn primary-btn">
              <FiRefreshCw />
              <span>Try Again</span>
            </button>
          )}

          {isNetworkError && (
            <button
              onClick={checkConnection}
              className="action-btn secondary-btn"
            >
              <FiWifi />
              <span>Check Connection</span>
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="action-btn ghost-btn"
          >
            <FiRefreshCw />
            <span>Refresh Page</span>
          </button>
        </div>

        {!isRetryable && (
          <p className="retry-limit-text">
            Maximum quick retries reached. A full page refresh is recommended.
          </p>
        )}
      </div>
    </section>
  );
};

export default ErrorBoundary;