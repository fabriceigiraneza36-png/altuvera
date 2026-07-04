import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
// import EmailAutocompleteInput from "../../components/common/EmailAutocompleteInput";
import { THEME, normalizeOptionId, normalizeOptionLabel, normalizeOptionValue } from "../BookingShared";

// ═══════════════════════════════════════════════════════════════════════════
// FORM INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FormInput = memo(
  ({
    name,
    label,
    type = "text",
    placeholder,
    required,
    icon: Icon,
    value,
    onChange,
    onBlur,
    error,
    touched,
    isMobile,
    helpText,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = touched && error;
    const isValid = touched && !error && value;

    return (
      <motion.div
        style={{ position: "relative" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: THEME.text,
            marginBottom: 10,
          }}
        >
          {Icon && <Icon size={16} style={{ color: THEME.primary }} />}
          {label}
          {required && (
            <span style={{ color: THEME.error, fontSize: 12 }}>*</span>
          )}
        </label>

        <motion.div
          style={{ position: "relative" }}
          animate={{
            x: hasError ? [0, -4, 4, -4, 4, 0] : 0,
          }}
          transition={{ duration: 0.35 }}
        >
          <div
            style={{
              position: "relative",
              background: `linear-gradient(135deg, ${hasError ? '#FEF2F2' : isFocused ? '#FFFFFF' : isValid ? THEME.background : THEME.gray50} 0%, ${hasError ? '#FEF2F2' : isFocused ? '#FFFFFF' : THEME.gray50} 100%)`,
              borderRadius: 16,
              border: `2px solid ${hasError ? THEME.error : isFocused ? THEME.primary : isValid ? THEME.primaryLight : THEME.gray200}`,
              boxShadow: isFocused
                ? `0 0 0 4px rgba(5, 150, 105, 0.08), 0 8px 24px ${THEME.shadow}`
                : hasError
                  ? "0 0 0 4px rgba(239, 68, 68, 0.08)"
                  : "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
            }}
          >
            {type === "email" ? (
              <motion.input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  setIsFocused(false);
                  onBlur?.(e);
                }}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: isMobile ? "16px 18px" : "18px 22px",
                  paddingRight: isValid ? 52 : 22,
                  fontSize: isMobile ? 16 : 15,
                  fontWeight: 500,
                  border: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                  color: THEME.text,
                }}
                aria-invalid={hasError}
                {...props}
              />
            ) : (
              <motion.input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  setIsFocused(false);
                  onBlur?.(e);
                }}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: isMobile ? "16px 18px" : "18px 22px",
                  paddingRight: isValid ? 52 : 22,
                  fontSize: isMobile ? 16 : 15,
                  fontWeight: 500,
                  border: "none",
                  backgroundColor: "transparent",
                  outline: "none",
                  color: THEME.text,
                }}
                {...props}
              />
            )}

            <AnimatePresence>
              {isValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{
                    position: "absolute",
                    right: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <CheckCircle size={20} color={THEME.primaryLight} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                borderRadius: 8,
              }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {helpText && !hasError && (
          <p style={{ marginTop: 6, fontSize: 12, color: THEME.gray400 }}>
            {helpText}
          </p>
        )}
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// FORM SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FormSelect = memo(
  ({
    name,
    label,
    options,
    required,
    placeholder,
    icon: Icon,
    value,
    onChange,
    onBlur,
    error,
    touched,
    isMobile,
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = touched && error;
    const isValid = touched && !error && value;

    return (
      <motion.div
        style={{ position: "relative" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            color: THEME.text,
            marginBottom: 10,
          }}
        >
          {Icon && <Icon size={16} style={{ color: THEME.primary }} />}
          {label}
          {required && (
            <span style={{ color: THEME.error, fontSize: 12 }}>*</span>
          )}
        </label>

        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              background: `linear-gradient(135deg, ${hasError ? '#FEF2F2' : isFocused ? '#FFFFFF' : isValid ? THEME.background : THEME.gray50} 0%, ${hasError ? '#FEF2F2' : isFocused ? '#FFFFFF' : THEME.gray50} 100%)`,
              borderRadius: 16,
              border: `2px solid ${hasError ? THEME.error : isFocused ? THEME.primary : isValid ? THEME.primaryLight : THEME.gray200}`,
              boxShadow: isFocused
                ? `0 0 0 4px rgba(5, 150, 105, 0.08), 0 8px 24px ${THEME.shadow}`
                : "0 4px 12px rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              overflow: "hidden",
            }}
          >
            <select
              name={name}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              style={{
                width: "100%",
                padding: isMobile ? "16px 18px" : "18px 22px",
                paddingRight: 52,
                fontSize: isMobile ? 16 : 15,
                fontWeight: 500,
                border: "none",
                backgroundColor: "transparent",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                color: THEME.text,
              }}
            >
              <option value="">
                {placeholder || `Select ${label.toLowerCase()}`}
              </option>
              {Array.isArray(options) &&
                options.map((opt, optIndex) => {
                  let optionId, optionLabel, optionFlag;

                  if (typeof opt === "string") {
                    optionId = opt;
                    optionLabel = opt;
                  } else if (typeof opt === "object" && opt !== null) {
                    optionId = opt.id || opt.value || opt._id || opt.name || optIndex;
                    optionLabel = normalizeOptionLabel(
                      opt.name || opt.title || opt.label || opt.category || optionId,
                    );
                    optionFlag = normalizeOptionLabel(opt.flag || "");
                  } else {
                    optionId = optIndex;
                    optionLabel = normalizeOptionLabel(opt);
                  }

                  return (
                    <option
                      key={`${name}-option-${normalizeOptionId(optionId)}-${optIndex}`}
                      value={normalizeOptionId(optionId)}
                    >
                      {optionFlag && `${optionFlag} `}
                      {optionLabel}
                    </option>
                  );
                })}
            </select>

            <div
              style={{
                position: "absolute",
                right: 18,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: THEME.gray500,
              }}
            >
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                padding: "12px 16px",
                fontSize: 13,
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                borderRadius: 12,
                border: "1px solid rgba(220, 38, 38, 0.2)",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.1)",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const Counter = memo(
  ({ label, description, value, onChange, min = 0, max = 20, isMobile }) => {
    const isAtMin = value <= min;
    const isAtMax = value >= max;

    return (
      <motion.div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? 18 : 24,
          backgroundColor: value > min ? THEME.background : THEME.gray50,
          borderRadius: 18,
          border: `2px solid ${value > min ? THEME.primaryLighter : THEME.gray200}`,
          transition: "all 0.3s ease",
        }}
        whileHover={{ borderColor: THEME.primary }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 13, color: THEME.textLight }}>
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 14 : 18,
          }}
        >
          <motion.button
            type="button"
            onClick={() => !isAtMin && onChange(value - 1)}
            disabled={isAtMin}
            style={{
              width: isMobile ? 42 : 48,
              height: isMobile ? 42 : 48,
              borderRadius: 14,
              border: `2px solid ${THEME.gray200}`,
              backgroundColor: THEME.white,
              cursor: isAtMin ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAtMin ? 0.4 : 1,
              transition: "all 0.2s ease",
            }}
            whileHover={
              !isAtMin ? { scale: 1.05, borderColor: THEME.primary } : {}
            }
            whileTap={!isAtMin ? { scale: 0.95 } : {}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={THEME.gray700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/>
            </svg>
          </motion.button>

          <motion.span
            key={value}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              fontSize: isMobile ? 24 : 28,
              fontWeight: 800,
              color: THEME.primary,
              minWidth: 44,
              textAlign: "center",
            }}
          >
            {value}
          </motion.span>

          <motion.button
            type="button"
            onClick={() => !isAtMax && onChange(value + 1)}
            disabled={isAtMax}
            style={{
              width: isMobile ? 42 : 48,
              height: isMobile ? 42 : 48,
              borderRadius: 14,
              border: `2px solid ${THEME.primary}`,
              backgroundColor: THEME.primary,
              cursor: isAtMax ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isAtMax ? 0.4 : 1,
              transition: "all 0.2s ease",
            }}
            whileHover={!isAtMax ? { scale: 1.05 } : {}}
            whileTap={!isAtMax ? { scale: 0.95 } : {}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SelectionCard = memo(
  ({ selected, onClick, icon, title, description, badge, isMobile }) => {
    return (
      <motion.div
        onClick={onClick}
        style={{
          padding: isMobile ? 18 : 24,
          borderRadius: 18,
          border: `2px solid ${selected ? THEME.primary : THEME.gray200}`,
          backgroundColor: selected ? THEME.background : THEME.white,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
        whileHover={{
          borderColor: THEME.primary,
          boxShadow: `0 8px 24px ${THEME.shadow}`,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{ fontSize: isMobile ? 28 : 34, flexShrink: 0 }}>
          {icon}
        </span>

        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: isMobile ? 15 : 17,
              fontWeight: 700,
              color: THEME.text,
              marginBottom: 4,
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: isMobile ? 12 : 14,
              color: THEME.textLight,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
          {badge && (
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: THEME.primary,
                backgroundColor: `rgba(5, 150, 105, 0.1)`,
                borderRadius: 6,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: THEME.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// INTEREST TAG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const InterestTag = memo(({ selected, onClick, icon, name, isMobile }) => {
  return (
    <motion.div
      onClick={onClick}
      style={{
        padding: isMobile ? "14px 12px" : "18px 16px",
        borderRadius: 16,
        border: `2px solid ${selected ? THEME.primary : THEME.gray200}`,
        backgroundColor: selected ? THEME.primary : THEME.white,
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
      whileHover={{
        borderColor: THEME.primary,
        y: -2,
        boxShadow: `0 6px 16px ${THEME.shadow}`,
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        backgroundColor: selected ? THEME.primary : THEME.white,
      }}
    >
      <span style={{ fontSize: isMobile ? 26 : 32 }}>{icon}</span>
      <span
        style={{
          fontSize: isMobile ? 11 : 13,
          fontWeight: 600,
          color: selected ? THEME.white : THEME.text,
          colorAdjust: "exact",
          lineHeight: 1.3,
        }}
      >
        {name}
      </span>
    </motion.div>
  );
});
