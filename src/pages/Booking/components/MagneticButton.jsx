import React, { memo, useRef } from "react";
import { motion } from "framer-motion";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

const MagneticButton = memo(
  ({ children, strength = 0.25, className, style, ...props }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 180, damping: 18 });
    const springY = useSpring(y, { stiffness: 180, damping: 18 });

    const handleMouseMove = (e) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - rect.left - rect.width / 2) * strength);
      y.set((e.clientY - rect.top - rect.height / 2) * strength);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY, display: "inline-block", ...style }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

export default MagneticButton;
