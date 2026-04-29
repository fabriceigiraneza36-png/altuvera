// components/auth/NotLoggedInMessage.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiUserX } from 'react-icons/fi';

const NotLoggedInMessage = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.4
          }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)',
              borderRadius: '16px',
              padding: '16px 20px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #F59E0B',
              backdropFilter: 'blur(10px)',
              minWidth: '280px',
              maxWidth: '350px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#F59E0B20',
                border: '2px solid #F59E0B40',
                flexShrink: 0,
              }}
            >
              <FiUserX size={20} color="#D97706" />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#92400E',
                  marginBottom: '2px',
                  lineHeight: '1.4',
                }}
              >
                You are not logged in!
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#A16207',
                  lineHeight: '1.4',
                }}
              >
                Please sign in to access this feature.
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 1.5, ease: "linear" }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                backgroundColor: '#F59E0B',
                borderRadius: '0 0 16px 16px',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotLoggedInMessage;