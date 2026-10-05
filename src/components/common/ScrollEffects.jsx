import React, { createContext, useContext, useEffect, useState } from "react";

const ScrollContext = createContext({ progress: 0 });

export const ScrollProvider = ({ children }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      const next = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      setProgress(Math.min(Math.max(next, 0), 100));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <ScrollContext.Provider value={{ progress }}>{children}</ScrollContext.Provider>;
};

export const ProgressBar = ({ color = "#10b981", height = 3 }) => {
  const { progress } = useContext(ScrollContext);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height,
        background: "rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: color,
          transition: "width 120ms ease-out",
        }}
      />
    </div>
  );
};

export const Reveal = ({ children, from = "up", delay = 0, duration = 400 }) => {
  const transformBy = {
    left: "translateX(-18px)",
    right: "translateX(18px)",
    up: "translateY(18px)",
    bottom: "translateY(-18px)",
    scale: "scale(0.98)",
  };

  return (
    <div
      style={{
        opacity: 1,
        transform: transformBy[from] || "translateY(0)",
        transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default { ScrollProvider, ProgressBar, Reveal };
