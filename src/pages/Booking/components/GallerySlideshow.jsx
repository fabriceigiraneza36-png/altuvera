import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const LOGO = "/altuvera.png";

const asImages = (destination) => {
  if (!destination) return [];
  const values = [
    destination.hero_images, destination.heroImages, destination.hero_slides,
    destination.heroSlides, destination.gallery, destination.images,
    destination.attraction_images, destination.attractionImages,
    destination.banner_images, destination.bannerImages,
    destination.cover_image_url, destination.coverImage,
    destination.image_url, destination.imageUrl, destination.thumbnail_url,
    destination.thumbnailUrl, destination.image, destination.thumbnail,
  ];
  const urls = [];
  const add = (value) => {
    if (Array.isArray(value)) return value.forEach(add);
    if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) urls.push(value.trim());
    else if (value && typeof value === "object") {
      add(value.url || value.src || value.image_url || value.imageUrl || value.image || value.path);
    }
  };
  values.forEach(add);
  return [...new Set(urls)];
};

export default function GallerySlideshow({ intervalMs = 4800, showBrand = false, hero = null }) {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setCurrent(0);
    if (!hero) {
      setSlides([]);
      return () => { alive = false; };
    }
    const direct = asImages(hero);
    setSlides(direct.length ? direct : (hero.src ? [hero.src] : []));
    const findDestinationImages = async () => {
      try {
        const response = await fetch(`${API}/destinations?is_active=true&limit=200`);
        if (!response.ok) return;
        const json = await response.json();
        const destinations = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const wanted = String(hero.id || hero.slug || hero.caption || "").trim().toLowerCase();
        const match = destinations.find((item) => [
          item.id, item.slug, item.name, item.title,
        ].some((value) => String(value ?? "").trim().toLowerCase() === wanted));
        const destinationImages = asImages(match);
        if (alive && destinationImages.length) setSlides(destinationImages);
      } catch {
        // The destination's primary image remains as a reliable fallback.
      }
    };
    findDestinationImages();
    return () => { alive = false; };
  }, [hero?.id, hero?.slug, hero?.caption, hero?.src]);

  const advance = useCallback((direction = 1) => {
    setCurrent((index) => {
      const length = slides.length;
      return length ? (index + direction + length) % length : 0;
    });
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    timerRef.current = window.setInterval(() => advance(1), intervalMs);
    return () => window.clearInterval(timerRef.current);
  }, [advance, intervalMs, paused, slides.length]);

  const slide = slides[current];
  return (
    <div
      className="bk-gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: "inherit", overflow: "hidden", background: "#064e3b" }}
      aria-label={hero ? "Selected destination slideshow" : "Altuvera booking"}
    >
      {!hero || !slide ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "radial-gradient(circle at center, #0b6b4e 0%, #064e3b 60%, #043b2d 100%)" }}>
          <img src={LOGO} alt="Altuvera logo" style={{ display: "block", width: "min(58%, 260px)", maxHeight: "46%", objectFit: "contain", filter: "drop-shadow(0 10px 24px rgba(0,0,0,.18))" }} />
        </div>
      ) : (
        <>
          {slides.map((src, index) => (
            <div key={src} style={{ position: "absolute", inset: 0, opacity: index === current ? 1 : 0, transform: index === current ? "scale(1)" : "scale(1.055)", transition: "opacity 1000ms ease, transform 5000ms ease" }}>
              <img src={src} alt={`${hero.caption || "Selected destination"} view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.58))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 24, zIndex: 2, color: "#fff" }}>
            <p style={{ margin: "0 0 7px", color: "#6ee7b7", fontSize: 11, letterSpacing: ".16em", fontWeight: 800, textTransform: "uppercase" }}>Your selected destination</p>
            <h2 style={{ margin: 0, fontSize: "clamp(22px,3vw,32px)", lineHeight: 1.1, fontWeight: 850 }}>{hero.caption || "Your adventure"}</h2>
            {slides.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {slides.map((_, index) => <button key={index} type="button" onClick={() => setCurrent(index)} aria-label={`Show destination image ${index + 1}`} style={{ width: index === current ? 24 : 7, height: 7, border: 0, padding: 0, borderRadius: 99, background: index === current ? "#6ee7b7" : "rgba(255,255,255,.6)", cursor: "pointer", transition: "all .25s" }} />)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => advance(-1)} aria-label="Previous destination image" style={controlStyle}><HiChevronLeft size={19} /></button>
                  <button type="button" onClick={() => advance(1)} aria-label="Next destination image" style={controlStyle}><HiChevronRight size={19} /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const controlStyle = { width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.45)", color: "#fff", background: "rgba(255,255,255,.15)", cursor: "pointer" };
