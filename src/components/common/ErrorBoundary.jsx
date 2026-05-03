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

  static getDerivedStateFromError(error) {
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

const ErrorFallback = ({
  error,
  retryCount,
  onRetry,
  fallback,
}) => {
  const { isOnline, connectionStatus, checkConnection } =
    useConnection();

  if (fallback) {
    return fallback;
  }

  const isNetworkError =
    !isOnline || connectionStatus === "disconnected";
  const isRetryable = retryCount < 3;

  return (
    <div className="error-boundary-wrapper">
      <div className="error-card">
        <div className="error-glow"></div>

        <div className="error-icon-box">
          {isNetworkError ? (
            <FiWifiOff className="error-icon network" />
          ) : (
            <FiAlertTriangle className="error-icon warning" />
          )}
        </div>

        <h2 className="error-title">
          {isNetworkError
            ? "Connection Lost"
            : "Something went wrong"}
        </h2>

        <p className="error-description">
          {isNetworkError
            ? "Please check your internet connection and try again."
            : "We encountered an unexpected error. Please try refreshing the page."}
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="error-details">
            <summary>Error Details (Development)</summary>
            <pre>{error.toString()}</pre>
          </details>
        )}

        <div className="error-actions">
          {isRetryable && (
            <button
              onClick={onRetry}
              className="action-btn primary-btn"
            >
              <FiRefreshCw />
              Try Again
            </button>
          )}

          {isNetworkError && (
            <button
              onClick={checkConnection}
              className="action-btn secondary-btn"
            >
              <FiWifi />
              Check Connection
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="action-btn neutral-btn"
          >
            Refresh Page
          </button>
        </div>

        {retryCount > 0 && (
          <p className="retry-text">
            Retry attempts: {retryCount}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;