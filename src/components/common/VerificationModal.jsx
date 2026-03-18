import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const MotionModal = motion.div;

const VerificationModal = ({
  open,
  email,
  purpose = "verification",
  loading = false,
  error,
  onClose,
  onSubmit,
  initialCode = "",
}) => {
  const inputRef = useRef(null);
  const [code, setCode] = React.useState(initialCode);

  useEffect(() => {
    if (open) {
      setCode(initialCode || "");
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialCode]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <MotionModal
        className="modal"
        role="document"
        animate={
          error
            ? { x: [0, -8, 8, -6, 6, 0] }
            : { opacity: 1 }
        }
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <header className="modal__header">
          <h2 className="modal__title">Verify your email</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="modal__body">
          <p>
            We sent a verification code to <strong>{email}</strong>. Enter it here to continue.
          </p>
          <label className="modal__label">
            Code
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="modal__input"
              placeholder="Enter code"
              autoComplete="one-time-code"
            />
          </label>
          {error && <div className="modal__error">{error}</div>}
        </div>

        <footer className="modal__footer">
          <button
            type="button"
            className="modal__button modal__button--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal__button modal__button--primary"
            onClick={() => onSubmit(code)}
            disabled={loading || !code.trim()}
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
        </footer>
      </MotionModal>

      <style>
        {`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1500;
          }
          .modal {
            width: min(520px, 90vw);
            background: #0f172a;
            border: 1px solid rgba(148, 163, 184, 0.25);
            border-radius: 14px;
            padding: 1.25rem;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.5);
          }
          .modal__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }
          .modal__title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 700;
            color: #f8fafc;
          }
          .modal__close {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 1.4rem;
            cursor: pointer;
            line-height: 1;
          }
          .modal__body {
            color: #cbd5e1;
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }
          .modal__label {
            display: block;
            margin-top: 1rem;
            color: #cbd5e1;
            font-size: 0.85rem;
          }
          .modal__input {
            width: 100%;
            margin-top: 0.35rem;
            padding: 0.6rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(15, 23, 42, 0.7);
            color: #f8fafc;
          }
          .modal__error {
            margin-top: 0.75rem;
            padding: 0.65rem 0.75rem;
            border-radius: 0.65rem;
            background: rgba(244, 63, 94, 0.18);
            color: #f0abfc;
            font-size: 0.85rem;
          }
          .modal__footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.55rem;
          }
          .modal__button {
            padding: 0.55rem 1.1rem;
            border-radius: 0.65rem;
            border: 1px solid rgba(148, 163, 184, 0.5);
            background: rgba(14, 165, 233, 0.12);
            color: #e2e8f0;
            cursor: pointer;
            font-weight: 600;
          }
          .modal__button--primary {
            background: rgba(16, 185, 129, 0.2);
            border-color: rgba(16, 185, 129, 0.6);
          }
          .modal__button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

export default VerificationModal;
