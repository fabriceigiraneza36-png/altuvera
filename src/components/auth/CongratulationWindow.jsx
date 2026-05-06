import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import confetti from "canvas-confetti";
import "./CongratulationWindow.css";

/**
 * Welcome Modal for first login/signup
 * Shows different content based on signup vs login
 * Includes confetti animation and is fully responsive
 */
const CongratulationWindow = ({ isVisible, type, user, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const content = {
    signup: {
      icon: FiCheckCircle,
      title: "Welcome to Altuvera! 🎉",
      message: "Your account is all set. Get ready for an unforgettable safari adventure!",
      subtitle: "Let's start planning your first trip",
      cta: "Explore Destinations",
      ctaLink: "/destinations",
      tips: [
        "Browse 50+ curated destinations",
        "Customize your perfect safari",
        "Book with confidence",
      ],
    },
    login: {
      icon: FiCheckCircle,
      title: "Welcome Back! 👋",
      message: "Great to see you again! Ready to plan your next adventure?",
      subtitle: "Pick up where you left off",
      cta: "View My Bookings",
      ctaLink: "/my-bookings",
      tips: [
        "Check your active bookings",
        "View saved destinations",
        "Update your preferences",
      ],
    },
  };

  const currentContent = content[type] || content.login;
  const IconComponent = currentContent.icon;

  // Trigger confetti animation
  useEffect(() => {
    if (isVisible && !showConfetti) {
      setShowConfetti(true);
      // Trigger confetti after a small delay
      setTimeout(() => triggerConfetti(), 200);
    }
  }, [isVisible]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      gravity: 0.8,
      shapes: ["circle", "square"],
      colors: ["#059669", "#10B981", "#34D399", "#A7F3D0", "#D1FAE5"],
    });

    // Secondary burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.2, y: 0.3 },
      });
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.8, y: 0.3 },
      });
    }, 150);
  };

  const handleClose = () => {
    setShowConfetti(false);
    onClose?.();
  };

  const handleCtaClick = () => {
    handleClose();
    if (currentContent.ctaLink) {
      window.location.href = currentContent.ctaLink;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="congrats-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="congrats-modal-wrapper"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <div className="congrats-container">
              {/* Close Button */}
              <button
                className="congrats-close-btn"
                onClick={handleClose}
                aria-label="Close welcome modal"
              >
                <FiX size={20} />
              </button>

              {/* Icon Animation */}
              <motion.div
                className="congrats-icon-wrapper"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  delay: 0.2,
                }}
              >
                <IconComponent size={48} />
              </motion.div>

              {/* Content */}
              <motion.div
                className="congrats-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h2 className="congrats-title">{currentContent.title}</h2>

                <p className="congrats-message">{currentContent.message}</p>

                {user?.fullName && (
                  <p className="congrats-greeting">
                    {type === "signup"
                      ? `Welcome, ${user.fullName.split(" ")[0]}! 🌍`
                      : `Hello again, ${user.fullName.split(" ")[0]}! 👋`}
                  </p>
                )}

                <p className="congrats-subtitle">{currentContent.subtitle}</p>
              </motion.div>

              {/* Tips */}
              <motion.div
                className="congrats-tips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {currentContent.tips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    className="tip-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <span className="tip-dot">✓</span>
                    <span className="tip-text">{tip}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                className="congrats-cta-btn"
                onClick={handleCtaClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentContent.cta}
                <FiArrowRight size={18} style={{ marginLeft: 8 }} />
              </motion.button>

              {/* Progress Indicators */}
              <motion.div
                className="congrats-progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="progress-dots">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="dot"
                      animate={{
                        scale: i === 1 ? 1.2 : 0.8,
                        opacity: i === 1 ? 1 : 0.4,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CongratulationWindow;