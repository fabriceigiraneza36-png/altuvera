// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useConnection } from '../../context/ConnectionContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Could send to error reporting service here
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback
        error={this.state.error}
        retryCount={this.state.retryCount}
        onRetry={this.handleRetry}
        fallback={this.props.fallback}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, retryCount, onRetry, fallback }) => {
  const { isOnline, connectionStatus, checkConnection } = useConnection();

  if (fallback) {
    return fallback;
  }

  const isNetworkError = !isOnline || connectionStatus === 'disconnected';
  const isRetryable = retryCount < 3;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          {isNetworkError ? (
            <FiWifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          ) : (
            <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isNetworkError ? 'Connection Lost' : 'Something went wrong'}
        </h2>

        <p className="text-gray-600 mb-6">
          {isNetworkError
            ? 'Please check your internet connection and try again.'
            : 'We encountered an unexpected error. Please try refreshing the page.'
          }
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">
              {error.toString()}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {isRetryable && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {isNetworkError && (
            <button
              onClick={checkConnection}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiWifi className="w-4 h-4" />
              Check Connection
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Retry attempts: {retryCount}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;