import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const GALLERY = [
  { src: "https://i.pinimg.com/736x/7a/e8/6f/7ae86f7fb7eddaceb8ed5ba212c19a0e.jpg",
    alt: "Male lion in savanna", caption: "Serengeti, Tanzania", subtitle: "Where the wild roams free" },
  { src: "https://i.pinimg.com/736x/81/3c/12/813c12e76fbd4fc43517b90804423d90.jpg",
    alt: "Turquoise waters", caption: "Zanzibar, Tanzania", subtitle: "Paradise found" },
  { src: "https://i.pinimg.com/1200x/34/da/8e/34da8ee9bedf86bde3797e5b37884910.jpg",
    alt: "Kilimanjaro", caption: "Kilimanjaro, Tanzania", subtitle: "Touch the sky" },
  { src: "https://i.pinimg.com/736x/74/23/d3/7423d340555f9ae1eeba5a9528a94715.jpg",
    alt: "Gorilla in mist", caption: "Volcanoes NP, Rwanda", subtitle: "Meet our closest relatives" },
  { src: "https://i.pinimg.com/736x/30/f1/ad/30f1ada2ba80044e4b1db79ac0e95768.jpg",
    alt: "Giraffes at sunset", caption: "Maasai Mara, Kenya", subtitle: "Golden hour magic" },
  { src: "https://i.pinimg.com/736x/3d/f5/f7/3df5f7a59bdb7704087eec05f6ee4476.jpg",
    alt: "Ngorongoro Crater", caption: "Ngorongoro, Tanzania", subtitle: "Nature's amphitheatre" },
];

export default function GallerySlideshow({
  intervalMs = 5000,
  showBrand = true,
  hero = null,
  heroMs = 5000,
}) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heroShownAt, setHeroShownAt] = useState(0);
  const timerRef = useRef(null);

  const advance = useCallback(
    (dir = 1) => setCurrent((i) => (i + dir + GALLERY.length) % GALLERY.length),
    [],
  );

  // When a hero image is supplied, show it up-front for heroMs, then
  // silently resume the standard slideshow (without resetting its index).
  const heroActive = !!hero && Date.now() - heroShownAt < heroMs;

  useEffect(() => {
    if (hero) setHeroShownAt(Date.now());
  }, [hero]);

  useEffect(() => {
    if (isPaused || heroActive) return;
    timerRef.current = setInterval(() => advance(1), intervalMs);
    return () => clearInterval(timerRef.current);
  }, [advance, intervalMs, isPaused, heroActive]);

  useEffect(() => {
    const img = new Image();
    img.src = GALLERY[(current + 1) % GALLERY.length].src;
  }, [current]);

  const slide = GALLERY[current];

  return (
    <div
      className="relative h-full w-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-hidden="true"
    >
      {GALLERY.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            transition: "opacity 1200ms ease-in-out, transform 1200ms ease-in-out",
            opacity: i === current ? 1 : 0,
            transform: i === current ? "scale(1)" : "scale(1.05)",
          }}
        >
          <img
            src={item.src} alt={item.alt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading={i <= 1 ? "eager" : "lazy"} decoding="async"
          />
        </div>
      ))}

      {/* Hero override — chosen destination image, shown silently for heroMs */}
      {heroActive && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 30,
          transition: "opacity 800ms ease-in-out",
        }}>
          <img
            src={hero.src} alt={hero.alt || "Selected destination"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="eager" decoding="async"
          />
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}
            className="bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
          <div className="absolute bottom-4 left-4 z-20">
            <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
              {hero.tag || "Your selection"}
            </p>
            <p className="text-white text-base sm:text-lg font-bold leading-tight tracking-tight">
              {hero.caption || ""}
            </p>
          </div>
        </div>
      )}

      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}
        className="bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}
        className="bg-gradient-to-r from-black/30 to-transparent" />

      <div style={{ position: "absolute", inset: 0, zIndex: 20 }}
        className="flex flex-col justify-between p-6 sm:p-8">

        {showBrand && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md p-1.5
                            ring-1 ring-white/20 flex items-center justify-center">
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600
                              flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight tracking-tight">Altuvera</h3>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">
                Premium Safaris
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div key={current}>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
              {slide.caption}
            </p>
            <h4 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight"
              style={{ animation: "fadeSlideUp 600ms ease-out both" }}>
              {slide.subtitle}
            </h4>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {GALLERY.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  style={{
                    transition: "all 300ms", borderRadius: "9999px",
                    width: i === current ? "2rem" : "0.5rem", height: "0.5rem",
                    backgroundColor: i === current ? "rgb(52 211 153)" : "rgba(255,255,255,0.4)",
                    border: "none", cursor: "pointer", padding: 0,
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => advance(-1)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                           flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="Previous">
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => advance(1)}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                           flex items-center justify-center text-white hover:bg-white/20 transition-all"
                aria-label="Next">
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div key={`prog-${current}`}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full"
              style={{ animation: !isPaused ? `progressBar ${intervalMs}ms linear forwards` : "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}