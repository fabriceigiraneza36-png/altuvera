import React, { useState } from "react";

/**
 * LazyImage component displays a shimmer skeleton while the image is loading.
 * Props are passed through to the underlying <img> element.
 */
const LazyImage = ({
  src,
  alt,
  style = {},
  className = "",
  loading = "lazy",
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", ...style }} className={className}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#e5e7eb",
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite linear",
            zIndex: 1,
          }}
        >
          <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        loading={loading}
        {...rest}
      />
    </div>
  );
};

export default LazyImage;
