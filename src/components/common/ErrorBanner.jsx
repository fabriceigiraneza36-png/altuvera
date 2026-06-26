/**
 * Reusable error banner for form submission errors.
 * Shows structured validation errors or a simple message.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ErrorBanner = ({
  error,        // string | null
  details,      // object[] | null — [{ field, message }]
  onRetry,      // function | null
  onDismiss,    // function | null
  retryCount,   // number
  className,
  style,
}) => {
  const [expanded, setExpanded] = useState(true);

  if (!error && (!details || !details.length)) return null;

  const isRetryable = typeof onRetry === "function" && retryCount < 3;

  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          key="error-banner"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{    opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={className}
          style={{
            background:   "#FEF2F2",
            border:       "1.5px solid #FECACA",
            borderRadius: 16,
            padding:      "18px 20px",
            marginBottom: 24,
            display:      "flex",
            gap:          12,
            alignItems:   "flex-start",
            ...style,
          }}
          role="alert"
          aria-live="assertive"
        >
          {/* Icon */}
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>⚠️</span>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin:     "0 0 4px",
              fontWeight: 700,
              color:      "#991B1B",
              fontSize:   15,
            }}>
              {error || "Validation Error"}
            </p>

            {/* Field-level details */}
            {details && details.length > 0 && (
              <ul style={{
                margin:     "8px 0 0",
                paddingLeft: 18,
                color:      "#B91C1C",
                fontSize:   13,
                lineHeight: 1.6,
              }}>
                {details.map((d, i) => (
                  <li key={i}>
                    {d.field && (
                      <strong style={{ textTransform: "capitalize" }}>
                        {d.field.replace(/_/g, " ")}:{" "}
                      </strong>
                    )}
                    {d.message || String(d)}
                  </li>
                ))}
              </ul>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {isRetryable && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    background:   "#DC2626",
                    color:        "#fff",
                    border:       "none",
                    borderRadius: 8,
                    padding:      "6px 14px",
                    fontSize:     13,
                    fontWeight:   600,
                    cursor:       "pointer",
                    transition:   "background 0.15s",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#B91C1C")}
                  onMouseOut={(e)  => (e.target.style.background = "#DC2626")}
                >
                  Try Again
                </button>
              )}

              <a
                href="https://wa.me/your-whatsapp-number"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background:   "#25D366",
                  color:        "#fff",
                  borderRadius: 8,
                  padding:      "6px 14px",
                  fontSize:     13,
                  fontWeight:   600,
                  textDecoration: "none",
                  display:      "inline-flex",
                  alignItems:   "center",
                  gap:          4,
                }}
              >
                💬 Contact on WhatsApp
              </a>
            </div>
          </div>

          {/* Dismiss */}
          {onDismiss && (
            <button
              type="button"
              onClick={() => { setExpanded(false); onDismiss(); }}
              aria-label="Dismiss error"
              style={{
                background: "transparent",
                border:     "none",
                color:      "#9CA3AF",
                fontSize:   18,
                cursor:     "pointer",
                padding:    "0 4px",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorBanner;