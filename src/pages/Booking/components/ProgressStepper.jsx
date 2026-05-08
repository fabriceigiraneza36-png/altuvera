import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Users, Heart, User, Check } from "lucide-react";
import { THEME } from "../BookingShared";

const ProgressStepper = memo(
  ({ steps, currentStep, onStepClick, isMobile }) => {
    const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

    const getIcon = (iconName) => {
      const iconMap = {
        compass: <Compass size={22} />,
        users: <Users size={22} />,
        heart: <Heart size={22} />,
        user: <User size={22} />,
      };
      return iconMap[iconName] || null;
    };

    return (
      <div style={{ marginBottom: isMobile ? 28 : 44, padding: "0 16px" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Progress Line Background */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? 20 : 26,
              left: isMobile ? 30 : 60,
              right: isMobile ? 30 : 60,
              height: 4,
              background: THEME.gray200,
              borderRadius: 4,
              zIndex: 0,
            }}
          />

          {/* Animated Progress Fill */}
          <motion.div
            style={{
              position: "absolute",
              top: isMobile ? 20 : 26,
              left: isMobile ? 30 : 60,
              height: 4,
              background: `linear-gradient(90deg, ${THEME.primary} 0%, ${THEME.primaryLight} 50%, ${THEME.primaryLighter} 100%)`,
              borderRadius: 4,
              zIndex: 1,
              boxShadow: `0 0 16px ${THEME.shadowDark}`,
            }}
            initial={{ width: 0 }}
            animate={{
              width: `calc(${progressPercent}% - ${isMobile ? 60 : 120}px * ${progressPercent / 100})`,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />

          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isClickable = step.number < currentStep;

            return (
              <motion.div
                key={step.number}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 2,
                  flex: 1,
                  cursor: isClickable ? "pointer" : "default",
                }}
                onClick={() => isClickable && onStepClick(step.number)}
                whileHover={isClickable ? { scale: 1.03 } : {}}
                whileTap={isClickable ? { scale: 0.97 } : {}}
              >
                <motion.div
                  style={{
                    width: isMobile ? 40 : 52,
                    height: isMobile ? 40 : 52,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isMobile ? 8 : 12,
                    position: "relative",
                    border: "3px solid",
                  }}
                  animate={{
                    backgroundColor: isCompleted || isActive ? THEME.primary : THEME.white,
                    borderColor: isCompleted || isActive ? THEME.primary : THEME.gray200,
                    scale: isActive ? 1.08 : 1,
                    boxShadow: isActive
                      ? `0 0 0 6px rgba(5, 150, 105, 0.12), 0 8px 20px ${THEME.shadowDark}`
                      : isCompleted
                        ? `0 4px 12px ${THEME.shadow}`
                        : "0 2px 6px rgba(0, 0, 0, 0.04)",
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  {isActive && (
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        border: `2px solid ${THEME.primary}`,
                      }}
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Check
                          size={isMobile ? 18 : 22}
                          color="white"
                          strokeWidth={3}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ color: isActive ? "white" : THEME.gray400 }}
                      >
                        {getIcon(step.icon)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.span
                  style={{
                    fontSize: isMobile ? 10 : 13,
                    fontWeight: 600,
                    textAlign: "center",
                    maxWidth: isMobile ? 55 : 90,
                    lineHeight: 1.3,
                  }}
                  animate={{
                    color: isActive
                      ? THEME.primary
                      : isCompleted
                        ? THEME.primaryDark
                        : THEME.gray400,
                  }}
                >
                  {isMobile ? step.shortTitle : step.title}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

export default ProgressStepper;
