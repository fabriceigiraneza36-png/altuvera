import React, { memo } from "react";
import { motion } from "framer-motion";
import { THEME } from "../BookingShared";

const GlassCard = memo(
  ({ children, style, className, hover = true, glow = false, ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          background: "rgba(255, 255, 255, 0.97)",
          backdropFilter: "blur(24px)",
          borderRadius: 32,
          border: `1px solid rgba(5, 150, 105, 0.1)`,
          boxShadow: isHovered && hover
            ? `0 32px 64px -16px ${THEME.shadow}, 0 0 0 1px rgba(5, 150, 105, 0.08)`
            : `0 24px 48px -16px rgba(0, 0, 0, 0.06)`,
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
        className={className}
        {...props}
      >
        {glow && (
          <motion.div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `radial-gradient(circle at center, rgba(5, 150, 105, 0.04) 0%, transparent 50%)`,
              pointerEvents: "none",
              zIndex: 0,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.div>
    );
  },
);

export default GlassCard;
