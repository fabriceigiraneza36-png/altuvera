import React from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const AnimatedSection = ({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  style = {},
  className = "",
  as: Component = "div",
  ...props
}) => {
  const [ref, isVisible] = useScrollAnimation(threshold);

  const animations = {
    fadeInUp: {
      initial: { opacity: 0, transform: "translateY(40px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
    },
    fadeInDown: {
      initial: { opacity: 0, transform: "translateY(-40px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
    },
    fadeInLeft: {
      initial: { opacity: 0, transform: "translateX(-40px)" },
      animate: { opacity: 1, transform: "translateX(0)" },
    },
    fadeInRight: {
      initial: { opacity: 0, transform: "translateX(40px)" },
      animate: { opacity: 1, transform: "translateX(0)" },
    },
    scaleIn: {
      initial: { opacity: 0, transform: "scale(0.9)" },
      animate: { opacity: 1, transform: "scale(1)" },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slideUp: {
      initial: { opacity: 0, transform: "translateY(60px)" },
      animate: { opacity: 1, transform: "translateY(0)" },
    },
    zoomIn: {
      initial: { opacity: 0, transform: "scale(0.8)" },
      animate: { opacity: 1, transform: "scale(1)" },
    },
    rotateIn: {
      initial: { opacity: 0, transform: "rotate(-10deg) scale(0.9)" },
      animate: { opacity: 1, transform: "rotate(0) scale(1)" },
    },
    perspectiveIn: {
      initial: {
        opacity: 0,
        transform: "perspective(1000px) rotateX(25deg) translateY(50px)",
      },
      animate: {
        opacity: 1,
        transform: "perspective(1000px) rotateX(0deg) translateY(0)",
      },
    },
    flipIn: {
      initial: {
        opacity: 0,
        transform: "perspective(1000px) rotateY(-20deg) scale(1.05)",
      },
      animate: {
        opacity: 1,
        transform: "perspective(1000px) rotateY(0deg) scale(1)",
      },
    },
    blurIn: {
      initial: { opacity: 0, filter: "blur(20px)", transform: "scale(1.1)" },
      animate: { opacity: 1, filter: "blur(0px)", transform: "scale(1)" },
    },
    slideReveal: {
      initial: { opacity: 0, transform: "skewY(2deg) translateY(30px)" },
      animate: { opacity: 1, transform: "skewY(0deg) translateY(0)" },
    },
    maskReveal: {
      initial: { clipPath: "inset(100% 0 0 0)", opacity: 0 },
      animate: { clipPath: "inset(0% 0 0 0)", opacity: 1 },
    },
    glitchIn: {
      initial: { opacity: 0, transform: "translateX(-15px)" },
      animate: { opacity: 1, transform: "translateX(0)" },
      transition: { type: "spring", stiffness: 300, damping: 10 },
    },
  };

  const currentAnimation = animations[animation] || animations.fadeInUp;

  const animatedStyle = {
    ...style,
    ...(isVisible ? currentAnimation.animate : currentAnimation.initial),
    transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
    willChange: "opacity, transform",
  };

  return (
    <Component ref={ref} style={animatedStyle} className={className} {...props}>
      {children}
    </Component>
  );
};

export default AnimatedSection;
