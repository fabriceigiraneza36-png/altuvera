import React, { useMemo } from "react";
import ImageCycle from "./ImageCycle";
import "./CountrySlideshow.css";

const CountrySlideshow = ({ images = [], alt = "" }) => {
  const srcs = useMemo(
    () =>
      (Array.isArray(images) ? images : [])
        .map((img) => img?.url || img?.src || img)
        .filter(Boolean),
    [images],
  );

  if (!srcs.length) return null;

  return (
    <div className="cs-slideshow">
      <ImageCycle
        images={srcs}
        showControls
        showDots
        clickToNavigate
        overlayGradient="linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.65) 100%)"
        aspectRatio="16/9"
      />
    </div>
  );
};

export default CountrySlideshow;
