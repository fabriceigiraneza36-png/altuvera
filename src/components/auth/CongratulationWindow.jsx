// components/auth/CongratulationWindow.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiZap, FiHeart, FiMapPin, FiStar } from 'react-icons/fi';

const CongratulationWindow = ({ isVisible, type, user, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = {
    signup: [
      {
        icon: FiZap,
        title: "Welcome to Altuvera! 🎉",
        message: "Your adventure begins now. Let's explore the world together!",
        color: "#22C55E"
      },
      {
        icon: FiMapPin,
        title: "Ready for Discovery",
        message: "Thousands of destinations await your exploration.",
        color: "#3B82F6"
      },
      {
        icon: FiHeart,
        title: "Personalized Experience",
        message: "We'll tailor recommendations just for you.",
        color: "#F43F5E"
      }
    ],
    login: [
      {
        icon: FiCheckCircle,
        title: "Welcome Back! 👋",
        message: "Great to see you again. Ready to continue your journey?",
        color: "#22C55E"
      },
      {
        icon: FiStar,
        title: "Your Adventures Await",
        message: "New destinations and experiences are waiting for you.",
        color: "#F59E0B"
      },
      {
        icon: FiHeart,
        title: "Personalized for You",
        message: "We've saved your preferences and wishlist.",
        color: "#F43F5E"
      }
    ]
  };

  const currentMessages = messages[type] || messages.login;
  const current = currentMessages[currentMessage];

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % currentMessages.length);
    }, 1000); // Change message every second

    return () => clearInterval(interval);
  }, [isVisible, currentMessages.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.5
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              minWidth: '320px',
              maxWidth: '400px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated background gradient */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(45deg, #22C55E, #3B82F6, #F43F5E)',
                  'linear-gradient(45deg, #3B82F6, #F43F5E, #22C55E)',
                  'linear-gradient(45deg, #F43F5E, #22C55E, #3B82F6)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
                borderRadius: '24px',
              }}
            />

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: current?.color || '#22C55E',
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
              />
            ))}

            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: `${current?.color || '#22C55E'}15`,
                  border: `3px solid ${current?.color || '#22C55E'}30`,
                  marginBottom: '20px',
                  margin: '0 auto 20px auto',
                }}
              >
                {current?.icon && (
                  <current.icon
                    size={36}
                    color={current.color}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1E293B',
                  marginBottom: '12px',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {current?.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  fontSize: '16px',
                  color: '#64748B',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                {current?.message}
              </motion.p>

              {/* Progress indicator */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '16px',
                }}
              >
                {currentMessages.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i === currentMessage ? 1.2 : 1,
                      opacity: i === currentMessage ? 1 : 0.3,
                    }}
                    style={{
                      width: i === currentMessage ? '12px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: current?.color || '#22C55E',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Personalized greeting */}
            {user?.fullName && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  color: '#94A3B8',
                  fontWeight: '500',
                }}
              >
                Hello, {user.fullName.split(' ')[0]}! ✨
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationWindow;