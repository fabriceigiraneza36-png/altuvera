import React, { useCallback, useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const LOGO = "/altuvera.png";

const asImages = (destination) => {
  if (!destination) return [];
  const values = [
    destination.images, destination.hero_images, destination.heroImages,
    destination.hero_slides, destination.heroSlides, destination.gallery_images,
    destination.galleryImages, destination.gallery, destination.image_urls,
    destination.attraction_images, destination.attractionImages,
    destination.banner_images, destination.bannerImages,
    destination.cover_image_url, destination.coverImage, destination.cover_image,
    destination.coverImageUrl, destination.hero_image_url, destination.heroImage,
    destination.hero_image, destination.image_url, destination.imageUrl,
    destination.thumbnail_url, destination.thumbnailUrl, destination.image,
    destination.thumbnail, destination.src,
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

export default function GallerySlideshow({ intervalMs = 6500, hero = null }) {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const pointerRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setCurrent(0);
    setDragX(0);
    if (!hero) {
      setSlides([]);
      return () => { alive = false; };
    }

    const direct = asImages(hero);
    setSlides(direct.length ? direct : []);
    const findDestinationImages = async () => {
      try {
        const response = await fetch(API + "/destinations?is_active=true&limit=200");
        if (!response.ok) return;
        const json = await response.json();
        const destinations = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const wanted = String(hero.id || hero.slug || hero.caption || "").trim().toLowerCase();
        const match = destinations.find((item) =>
          [item.id, item.slug, item.name, item.title].some(
            (value) => String(value ?? "").trim().toLowerCase() === wanted
          )
        );
        const destinationImages = asImages(match);
        if (alive && destinationImages.length) setSlides(destinationImages);
      } catch {
        // Keep the images already supplied by the booking form.
      }
    };
    if (direct.length < 2 && (hero.id || hero.slug || hero.caption)) findDestinationImages();
    return () => { alive = false; };
  }, [hero?.id, hero?.slug, hero?.caption, hero?.src, hero?.images]);

  const advance = useCallback((direction) => {
    setCurrent((index) => {
      const length = slides.length;
      return length > 1 ? (index + direction + length) % length : 0;
    });
    setDragX(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || dragging || slides.length < 2) return undefined;
    const timer = window.setInterval(() => advance(1), intervalMs);
    return () => window.clearInterval(timer);
  }, [advance, intervalMs, paused, dragging, slides.length]);

  const startDrag = (event) => {
    if (slides.length < 2 || (event.pointerType === "mouse" && event.button !== 0)) return;
    pointerRef.current = { startX: event.clientX, lastX: event.clientX, width: viewportRef.current?.clientWidth || 1 };
    setPaused(true);
    setDragging(true);
    setDragX(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!pointerRef.current) return;
    const delta = event.clientX - pointerRef.current.startX;
    const limit = pointerRef.current.width * 0.72;
    pointerRef.current.lastX = event.clientX;
    setDragX(Math.max(-limit, Math.min(limit, delta)));
  };

  const finishDrag = (event) => {
    if (!pointerRef.current) return;
    const delta = event.clientX - pointerRef.current.startX;
    const threshold = Math.max(42, pointerRef.current.width * 0.13);
    if (Math.abs(delta) >= threshold) advance(delta < 0 ? 1 : -1);
    pointerRef.current = null;
    setDragX(0);
    setDragging(false);
    setPaused(false);
  };

  const cancelDrag = () => {
    pointerRef.current = null;
    setDragX(0);
    setDragging(false);
    setPaused(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); advance(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); advance(-1); }
  };

  const slideWidth = slides.length ? 100 / slides.length : 100;
  const offset = "calc(-" + (current * slideWidth) + "% + " + dragX + "px)";

  return (
    <div
      ref={viewportRef}
      className={"bk-gallery" + (dragging ? " is-dragging" : "")}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={cancelDrag}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { if (!pointerRef.current) setPaused(false); }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={hero ? "Selected destination photo gallery. Swipe or use the arrow keys to browse." : "Altuvera booking gallery"}
      style={{
        position: "relative", width: "100%", height: "100%", minHeight: "inherit",
        overflow: "hidden", background: "#064e3b", touchAction: "pan-y",
        cursor: slides.length > 1 ? (dragging ? "grabbing" : "grab") : "default",
        userSelect: "none", outline: "none",
      }}
    >
      {!hero || !slides.length ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "radial-gradient(circle at center, #0b6b4e 0%, #064e3b 60%, #043b2d 100%)" }}>
          <img src={LOGO} alt="Altuvera logo" style={{ display: "block", width: "min(58%, 260px)", maxHeight: "46%", objectFit: "contain", filter: "drop-shadow(0 10px 24px rgba(0,0,0,.18))" }} />
        </div>
      ) : (
        <>
          <div
            className="bk-gallery__track"
            style={{
              display: "flex", width: (slides.length * 100) + "%", height: "100%",
              transform: "translate3d(" + offset + ",0,0)",
              transition: dragging ? "none" : "transform 620ms cubic-bezier(.22,.75,.22,1)",
              willChange: "transform",
            }}
          >
            {slides.map((src, index) => (
              <div key={src} className="bk-gallery__slide" style={{ flex: "0 0 " + slideWidth + "%", width: slideWidth + "%", height: "100%", minWidth: 0, position: "relative", overflow: "hidden" }}>
                <img
                  src={src}
                  alt={(hero.caption || "Selected destination") + " view " + (index + 1)}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  draggable="false"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.08) 18%,rgba(0,0,0,.08) 48%,rgba(0,0,0,.72) 100%)", pointerEvents: "none" }} />
          <div className="bk-gallery__caption" style={{ position: "absolute", left: 28, right: 28, bottom: 30, zIndex: 2, color: "#fff", pointerEvents: "none" }}>
            <p style={{ margin: "0 0 9px", color: "#86efac", fontSize: 10, letterSpacing: ".17em", fontWeight: 850, textTransform: "uppercase" }}>Your selected destination</p>
            <h2 style={{ margin: 0, fontSize: "clamp(23px,3vw,35px)", lineHeight: 1.08, fontWeight: 850, letterSpacing: "-.025em", textShadow: "0 2px 16px rgba(0,0,0,.25)" }}>{hero.caption || "Your adventure"}</h2>
            {slides.length > 1 && <p style={{ margin: "9px 0 0", color: "rgba(255,255,255,.8)", fontSize: 11, fontWeight: 650 }}>Swipe to explore the next view</p>}
          </div>
        </>
      )}
    </div>
  );
}
