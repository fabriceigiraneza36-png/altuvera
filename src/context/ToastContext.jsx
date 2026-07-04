import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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
