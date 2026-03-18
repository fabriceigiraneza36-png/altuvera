import React, { useEffect, useRef } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

/**
 * AnimatedSection
 * Wraps any element in an intersection-observer-driven entrance animation.
 *
 * Props:
 *   animation   – one of the keys below (default: "fadeInUp")
 *   delay       – seconds (default 0)
 *   duration    – seconds (default 0.65)
 *   threshold   – IO threshold 0–1 (default 0.1)
 *   rootMargin  – IO rootMargin string (default "-40px 0px -40px 0px")
 *   as          – HTML tag / component to render (default "div")
 *   style, className, ...rest passed through
 *
 * CSS approach:
 *   Also places a `data-animate` attribute + `is-visible` class  so the
 *   pure-CSS system in index.css kicks in automatically as a complement.
 */

const ANIMATIONS = {
  fadeInUp: {
    initial: "opacity:0;transform:translateY(28px)",
    animate: "opacity:1;transform:translateY(0)",
  },
  fadeInDown: {
    initial: "opacity:0;transform:translateY(-28px)",
    animate: "opacity:1;transform:translateY(0)",
  },
  fadeInLeft: {
    initial: "opacity:0;transform:translateX(-34px)",
    animate: "opacity:1;transform:translateX(0)",
  },
  fadeInRight: {
    initial: "opacity:0;transform:translateX(34px)",
    animate: "opacity:1;transform:translateX(0)",
  },
  scaleIn: {
    initial: "opacity:0;transform:scale(0.88)",
    animate: "opacity:1;transform:scale(1)",
  },
  fadeIn: {
    initial: "opacity:0",
    animate: "opacity:1",
  },
  slideUp: {
    initial: "opacity:0;transform:translateY(42px)",
    animate: "opacity:1;transform:translateY(0)",
  },
  zoomIn: {
    initial: "opacity:0;transform:scale(0.78);filter:blur(6px)",
    animate: "opacity:1;transform:scale(1);filter:blur(0px)",
  },
  rotateIn: {
    initial: "opacity:0;transform:rotate(-10deg) scale(0.9)",
    animate: "opacity:1;transform:rotate(0) scale(1)",
  },
  perspectiveIn: {
    initial:
      "opacity:0;transform:perspective(1000px) rotateX(22deg) translateY(50px)",
    animate:
      "opacity:1;transform:perspective(1000px) rotateX(0deg) translateY(0)",
  },
  flipIn: {
    initial:
      "opacity:0;transform:perspective(1000px) rotateY(-18deg) scale(1.04)",
    animate: "opacity:1;transform:perspective(1000px) rotateY(0deg) scale(1)",
  },
  blurIn: {
    initial: "opacity:0;filter:blur(20px);transform:scale(1.1)",
    animate: "opacity:1;filter:blur(0px);transform:scale(1)",
  },
  slideReveal: {
    initial: "opacity:0;transform:skewY(2.5deg) translateY(32px)",
    animate: "opacity:1;transform:skewY(0deg) translateY(0)",
  },
  maskReveal: {
    initial: "opacity:0;clip-path:inset(100% 0 0 0)",
    animate: "opacity:1;clip-path:inset(0% 0 0 0)",
  },
};

// Parse the semicolon-separated inline-style string into a React style object
const parseStyles = (str) =>
  str.split(";").reduce((acc, rule) => {
    const [prop, ...vals] = rule.split(":");
    if (!prop?.trim()) return acc;
    const camel = prop.trim().replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    acc[camel] = vals.join(":").trim();
    return acc;
  }, {});

const AnimatedSection = ({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.48,
  threshold = 0.1,
  rootMargin = "80px 0px -40px 0px",
  style = {},
  className = "",
  as: Component = "div",
  ...props
}) => {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [ref, isVisible] = useScrollAnimation(threshold, true, rootMargin);

  const anim = ANIMATIONS[animation] ?? ANIMATIONS.fadeInUp;
  const currentStyles =
    reduceMotion || isVisible
      ? parseStyles(anim.animate)
      : parseStyles(anim.initial);

  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
  const transitionValue = reduceMotion
    ? "none"
    : `opacity ${duration}s ${easing} ${delay}s, ` +
      `transform ${duration}s ${easing} ${delay}s, ` +
      `filter ${duration}s ${easing} ${delay}s, ` +
      `clip-path ${duration}s ${easing} ${delay}s`;

  const animatedStyle = {
    willChange: reduceMotion ? "auto" : "opacity, transform, filter, clip-path",
    ...currentStyles,
    transition: transitionValue,
    ...style,
  };

  return (
    <Component
      ref={ref}
      style={animatedStyle}
      className={[className, isVisible ? "is-visible" : ""]
        .filter(Boolean)
        .join(" ")}
      data-animate={animation}
      {...props}
    >
      {children}
    </Component>
  );
};

export default AnimatedSection;
