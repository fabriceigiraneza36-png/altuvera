// src/components/common/ConnectionStatus.jsx
import React from 'react';
import { FiWifi, FiWifiOff, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useConnection } from '../../context/ConnectionContext';

const ConnectionStatus = ({ className = '' }) => {
  const { isOnline, connectionStatus } = useConnection();

  if (connectionStatus === 'connected') {
    return null; // Don't show anything when connected
  }

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'offline':
        return {
          icon: FiWifiOff,
          text: 'Offline',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
      case 'disconnected':
        return {
          icon: FiAlertTriangle,
          text: 'Connection Lost',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'degraded':
        return {
          icon: FiWifi,
          text: 'Slow Connection',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'checking':
        return {
          icon: FiCheck,
          text: 'Checking...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const Icon = statusInfo.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color} text-sm font-medium shadow-lg ${className}`}>
      <Icon className="w-4 h-4" />
      <span>{statusInfo.text}</span>
    </div>
  );
};

export default ConnectionStatus;