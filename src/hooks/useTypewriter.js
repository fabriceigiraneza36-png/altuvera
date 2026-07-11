// src/hooks/useTypewriter.js
/**
 * Typewriter hook — cycles through strings with cursor blink.
 * Returns { text, isDone } where isDone=true when typing finished.
 */
import { useState, useEffect, useRef } from "react";

export function useTypewriter(strings, options = {}) {
  const {
    speed       = 45,
    deleteSpeed = 25,
    pauseAfter  = 1800,
    loop        = true,
    startDelay  = 0,
  } = options;

  const [displayText, setDisplayText]   = useState("");
  const [stringIndex, setStringIndex]   = useState(0);
  const [charIndex,   setCharIndex]     = useState(0);
  const [isDeleting,  setIsDeleting]    = useState(false);
  const [isPaused,    setIsPaused]      = useState(false);
  const [isDone,      setIsDone]        = useState(false);
  const [started,     setStarted]       = useState(startDelay === 0);

  useEffect(() => {
    if (startDelay > 0) {
      const t = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(t);
    }
  }, [startDelay]);

  useEffect(() => {
    if (!started || !strings?.length) return;
    if (isPaused) return;

    const current = strings[stringIndex] ?? "";

    if (!isDeleting && charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    }

    if (!isDeleting && charIndex === current.length) {
      if (!loop && stringIndex === strings.length - 1) {
        setIsDone(true);
        return;
      }
      setIsPaused(true);
      const t = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseAfter);
      return () => clearTimeout(t);
    }

    if (isDeleting && charIndex > 0) {
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, deleteSpeed);
      return () => clearTimeout(t);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setStringIndex((i) => (i + 1) % strings.length);
    }
  }, [
    started, strings, stringIndex, charIndex,
    isDeleting, isPaused, loop, speed, deleteSpeed, pauseAfter,
  ]);

  return { text: displayText, isDone };
}

/** Single-shot typewriter — types once and stops. */
export function useTypewriterOnce(text, options = {}) {
  const { text: t, isDone } = useTypewriter(
    text ? [text] : [],
    { ...options, loop: false },
  );
  return { text: t, isDone };
}