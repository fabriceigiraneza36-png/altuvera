// Elevated premium shiny version — glassmorphism + glow + luxury green-white theme

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

const Sparkle = ({ delay, left }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -80, scale: 0.6 }}
      animate={{
        opacity: [0, 1, 0],
        y: [0, 220, 420],
        x: [0, -15, 10],
        rotate: [0, 180, 360],
        scale: [0.6, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        left: `${left}%`,
        top: 0,
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(34,197,94,0.9) 60%, rgba(34,197,94,0.2) 100%)",
        boxShadow: "0 0 20px rgba(34,197,94,0.5)",
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
        title: "Welcome to Altuvera ✨",
        message:
          "Your premium adventure starts here. Explore unforgettable destinations beautifully.",
      },
      {
        icon: FiMapPin,
        title: "Discover New Places",
        message:
          "Luxury travel experiences and breathtaking journeys are waiting for you.",
      },
      {
        icon: FiHeart,
        title: "Tailored For You",
        message:
          "Smart personalized recommendations built around your dream adventures.",
      },
    ],
    login: [
      {
        icon: FiCheckCircle,
        title: "Welcome Back 👋",
        message:
          "We're excited to see you again. Your next beautiful journey awaits.",
      },
      {
        icon: FiStar,
        title: "Your Adventures Continue",
        message:
          "Saved destinations, wishlist dreams, and new experiences are ready.",
      },
      {
        icon: FiHeart,
        title: "Your Personalized Space",
        message:
          "Everything you love is still here—elegant, organized, and ready.",
      },
    ],
  };

  const currentMessages = messages[type] || messages.login;
  const current = currentMessages[currentMessage];

  const sparkles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        delay: i * 0.12,
        left: 4 + i * 4,
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        >
          {/* Premium backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom right, rgba(0,0,0,0.45), rgba(16,185,129,0.18))",
              backdropFilter: "blur(14px)",
            }}
          />

          {/* Ground sparkling confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {sparkles.map((item) => (
              <Sparkle
                key={item.id}
                delay={item.delay}
                left={item.left}
              />
            ))}
          </div>

          {/* Premium Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 80 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [20, -8, 4, 0],
              x: [0, -3, 3, -1, 0],
            }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
              duration: 0.7,
            }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[30px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.92))",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow:
                "0 30px 80px rgba(16,185,129,0.18), 0 10px 30px rgba(0,0,0,0.08)",
              backdropFilter: "blur(30px)",
            }}
          >
            {/* Shiny top glow */}
            <div
              style={{
                position: "absolute",
                top: -80,
                left: -50,
                width: "200%",
                height: "180px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
                transform: "rotate(-6deg)",
              }}
            />

            <div className="relative p-6 sm:p-8 text-center">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center transition hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                }}
              >
                <FiX size={18} className="text-green-700" />
              </button>

              {/* Premium Icon Circle */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(145deg, #ffffff, #dcfce7)",
                  border: "4px solid rgba(34,197,94,0.15)",
                  boxShadow:
                    "0 20px 40px rgba(34,197,94,0.15), inset 0 4px 10px rgba(255,255,255,0.9)",
                }}
              >
                {current?.icon && (
                  <current.icon
                    size={46}
                    className="text-green-600"
                  />
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                    {current?.title}
                  </h2>

                  <p className="mt-4 text-sm sm:text-base text-slate-600 leading-7 px-2">
                    {current?.message}
                  </p>
                </motion.div>
              </AnimatePresence>

              {user?.fullName && (
                <p className="mt-5 text-sm font-semibold text-green-700">
                  Hello, {user.fullName.split(" ")[0]} ✨
                </p>
              )}

              {/* Premium progress indicators */}
              <div className="mt-6 flex items-center justify-center gap-2">
                {currentMessages.map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      width: index === currentMessage ? 30 : 8,
                      opacity: index === currentMessage ? 1 : 0.35,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to right, #22c55e, #4ade80)",
                      boxShadow:
                        index === currentMessage
                          ? "0 0 14px rgba(34,197,94,0.35)"
                          : "none",
                    }}
                  />
                ))}
              </div>

              {/* Premium bottom box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-7 rounded-3xl p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(240,253,244,0.9), rgba(255,255,255,0.9))",
                  border: "1px solid rgba(34,197,94,0.08)",
                  boxShadow: "0 10px 30px rgba(34,197,94,0.05)",
                }}
              >
                <p className="text-sm font-medium text-slate-700 leading-6">
                  Premium destinations, smart recommendations, and unforgettable travel experiences await you.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CongratulationWindow;