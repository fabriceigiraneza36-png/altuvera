// src/components/auth/CongratulationWindow.jsx

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiMapPin,
  FiHeart,
  FiStar,
  FiZap,
  FiX,
} from "react-icons/fi";
import "./CongratulationWindow.css";

const FloatingBubble = ({ delay, left }) => {
  return (
    <motion.div
      className="floating-bubble"
      initial={{
        opacity: 0,
        y: -40,
        scale: 0.7,
      }}
      animate={{
        opacity: [0, 0.8, 0],
        y: [0, 180, 360],
        x: [0, -12, 8],
        scale: [0.7, 1, 0.8],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      style={{
        left: `${left}%`,
      }}
    />
  );
};

const CongratulationWindow = ({
  isVisible,
  type = "login",
  user,
  onClose,
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = {
    signup: [
      {
        icon: FiZap,
        title: "Welcome to Altuvera",
        message:
          "Your premium journey starts here. Explore unforgettable destinations beautifully.",
      },
      {
        icon: FiMapPin,
        title: "Discover Beautiful Places",
        message:
          "Luxury travel experiences and breathtaking adventures are waiting for you.",
      },
      {
        icon: FiHeart,
        title: "Made For You",
        message:
          "Smart personalized recommendations built around your dream destinations.",
      },
    ],
    login: [
      {
        icon: FiCheckCircle,
        title: "Welcome Back",
        message:
          "We're happy to see you again. Your next amazing journey awaits.",
      },
      {
        icon: FiStar,
        title: "Your Adventures Continue",
        message:
          "Saved destinations, wishlist dreams, and new experiences are ready.",
      },
      {
        icon: FiHeart,
        title: "Your Personal Travel Space",
        message:
          "Everything you love is still here—organized, elegant, and ready.",
      },
    ],
  };

  const currentMessages = messages[type] || messages.login;
  const current = currentMessages[currentMessage];

  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: i * 0.18,
        left: 5 + i * 5,
      })),
    []
  );

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % currentMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible, currentMessages.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="congrats-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="congrats-backdrop" />

          {/* Floating bubbles */}
          <div className="bubble-container">
            {bubbles.map((bubble) => (
              <FloatingBubble
                key={bubble.id}
                delay={bubble.delay}
                left={bubble.left}
              />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            className="congrats-modal"
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
          >
            {/* Close */}
            <button
              className="close-btn"
              onClick={onClose}
            >
              <FiX />
            </button>

            {/* Icon */}
            <motion.div
              className="icon-wrapper"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            >
              {current?.icon && <current.icon size={38} />}
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.35,
                }}
              >
                <h2 className="congrats-title">
                  {current?.title}
                </h2>

                <p className="congrats-message">
                  {current?.message}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* User */}
            {user?.fullName && (
              <p className="user-greeting">
                Hello, {user.fullName.split(" ")[0]}
              </p>
            )}

            {/* Indicators */}
            <div className="progress-wrapper">
              {currentMessages.map((_, index) => (
                <motion.div
                  key={index}
                  className="progress-dot"
                  animate={{
                    width: index === currentMessage ? 28 : 8,
                    opacity: index === currentMessage ? 1 : 0.35,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
              ))}
            </div>

            {/* Footer Box */}
            <div className="bottom-note">
              Premium destinations, smart recommendations,
              and unforgettable travel experiences await you.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationWindow;