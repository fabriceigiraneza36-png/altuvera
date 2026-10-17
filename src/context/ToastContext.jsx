import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: {
    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    border: "1px solid rgba(22, 163, 74, 0.18)",
    color: "#14532d",
  },
  error: {
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    border: "1px solid rgba(220, 38, 38, 0.18)",
    color: "#991b1b",
  },
  info: {
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    border: "1px solid rgba(3, 105, 161, 0.18)",
    color: "#0c4a6e",
  },
};

const makeToast = ({ type = "info", title, message, duration = 4000 }) => ({
  id: `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`,
  type,
  title,
  message,
  duration,
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const swipeRef = useRef(new Map());
  const [swipePositions, setSwipePositions] = useState({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration }) => {
      const toast = makeToast({ type, title, message, duration });
      setToasts((prev) => [toast, ...prev]);
      if (toast.duration > 0) {
        window.setTimeout(() => removeToast(toast.id), toast.duration);
      }
      return toast.id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      info: (message, opts = {}) =>
        addToast({ type: "info", title: opts.title || "Info", message, duration: opts.duration }),
      success: (message, opts = {}) =>
        addToast({ type: "success", title: opts.title || "Success", message, duration: opts.duration }),
      error: (message, opts = {}) =>
        addToast({ type: "error", title: opts.title || "Error", message, duration: opts.duration }),
      add: addToast,
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          zIndex: 99999,
          right: 16,
          top: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "none",
          maxWidth: 360,
        }}
      >
        {toasts.map((toast) => {
          const theme = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          return (
            <div
              key={toast.id}
              onPointerDown={(event) => {
                swipeRef.current.set(toast.id, { startX: event.clientX, startY: event.clientY, deltaX: 0, startAt: Date.now() });
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = swipeRef.current.get(toast.id);
                if (!start) return;
                const dx = event.clientX - start.startX;
                const dy = event.clientY - start.startY;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) {
                  start.deltaX = dx;
                  setSwipePositions((prev) => ({ ...prev, [toast.id]: { x: dx, opacity: Math.max(.2, 1 - Math.abs(dx) / 240) } }));
                }
              }}
              onPointerUp={() => {
                const start = swipeRef.current.get(toast.id);
                swipeRef.current.delete(toast.id);
                if (!start) return;
                const dx = start.deltaX;
                const fast = Date.now() - start.startAt < 240 && Math.abs(dx) > 35;
                if (Math.abs(dx) > 90 || fast) {
                  setSwipePositions((prev) => ({ ...prev, [toast.id]: { x: dx < 0 ? -window.innerWidth : window.innerWidth, opacity: 0 } }));
                  window.setTimeout(() => removeToast(toast.id), 170);
                } else {
                  setSwipePositions((prev) => ({ ...prev, [toast.id]: { x: 0, opacity: 1 } }));
                }
              }}
              onPointerCancel={() => {
                swipeRef.current.delete(toast.id);
                setSwipePositions((prev) => ({ ...prev, [toast.id]: { x: 0, opacity: 1 } }));
              }}
              style={{
                pointerEvents: "auto",
                padding: "14px 16px",
                borderRadius: 18,
                boxShadow: "0 18px 46px rgba(15, 23, 42, 0.12)",
                background: theme.background,
                border: theme.border,
                color: theme.color,
                minWidth: 260,
                overflow: "hidden",
                touchAction: "pan-y",
                transform: "translate3d(" + (swipePositions[toast.id]?.x || 0) + "px,0,0)",
                opacity: swipePositions[toast.id]?.opacity ?? 1,
                transition: swipeRef.current.has(toast.id) ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms ease",
                willChange: "transform, opacity",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    {toast.title}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.95 }}>
                    {toast.message}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: theme.color,
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
