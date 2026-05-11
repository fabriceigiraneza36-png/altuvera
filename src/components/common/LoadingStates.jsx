// src/components/common/LoadingStates.jsx
import React from 'react';
import { FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export const LoadingSpinner = ({
  size = 'md',
  color = 'green',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <FiLoader
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

export const LoadingSkeleton = ({
  className = '',
  lines = 3,
  height = 'h-4'
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded ${height}`} />
      ))}
    </div>
  );
};

export const LoadingCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

export const ConnectionAwareWrapper = ({ children, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return children;
};

export const DataLoader = ({
  loading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  children
}) => {
  if (loading) {
    return loadingComponent || <LoadingSpinner size="lg" className="mx-auto" />;
  }

  if (error) {
    return errorComponent || (
      <div className="text-center p-8">
        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-4">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return children;
};