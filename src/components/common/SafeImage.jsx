// src/components/common/SafeImage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in replacement for <img> with automatic fallback
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from "react";
import { generateSvgPlaceholder } from "../../utils/placeholderImage";

const SafeImage = ({
  src,
  alt = "Altuvera",
  width = 800,
  height = 600,
  fallbackText,
  className,
  style,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const text = fallbackText || alt || "Altuvera";

  const handleError = useCallback(
    (e) => {
      if (hasError) return; // Prevent infinite loop
      setHasError(true);
      setImgSrc(generateSvgPlaceholder(width, height, text));
      onError?.(e);
    },
    [hasError, width, height, text, onError]
  );

  const handleLoad = useCallback(
    (e) => {
      onLoad?.(e);
    },
    [onLoad]
  );

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default SafeImage;