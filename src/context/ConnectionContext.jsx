// src/context/ConnectionContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import enhancedApiClient from '../utils/enhancedApiClient';

const ConnectionContext = createContext();

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastHealthCheck, setLastHealthCheck] = useState(null);
  const [retryQueueLength, setRetryQueueLength] = useState(0);

  const checkConnection = useCallback(async () => {
    if (!isOnline) {
      setConnectionStatus('offline');
      return;
    }

    setConnectionStatus('checking');

    try {
      const health = await enhancedApiClient.healthCheck();
      setLastHealthCheck(health);

      if (health.status === 'healthy') {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('degraded');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setLastHealthCheck({
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      });
    }
  }, [isOnline]);

  useEffect(() => {
    // Listen to enhanced API client events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleHealthCheck = (health) => {
      setLastHealthCheck(health);
      setConnectionStatus(health.status === 'healthy' ? 'connected' : 'degraded');
    };

    enhancedApiClient.on('online', handleOnline);
    enhancedApiClient.on('offline', handleOffline);
    enhancedApiClient.on('health-check', handleHealthCheck);

    // Start connection monitoring
    enhancedApiClient.startConnectionMonitoring();

    // Initial check
    checkConnection();

    return () => {
      enhancedApiClient.stopConnectionMonitoring();
    };
  }, [checkConnection]);

  useEffect(() => {
    if (isOnline && connectionStatus === 'offline') {
      checkConnection();
    }
  }, [isOnline, connectionStatus, checkConnection]);

  const value = {
    isOnline,
    connectionStatus,
    lastHealthCheck,
    retryQueueLength,
    checkConnection,
    clearCache: () => enhancedApiClient.clearCache(),
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionContext;