import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // for routing

const countries = [
  { name: "Rwanda", code: "rw" },
  { name: "Kenya", code: "ke" },
  { name: "Tanzania", code: "tz" },
  { name: "Uganda", code: "ug" },
  { name: "Ethiopia", code: "et" }
];

export default function EastAfricaFlags() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      container.style.setProperty("--windX", `${x}deg`);
      container.style.setProperty("--windY", `${y}deg`);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div ref={containerRef} className="flags-section">
      <style>{styles}</style>

      <div className="flags-container">
        {countries.map((country) => (
          <Link
            key={country.code}
            to={`/country/${country.name.toLowerCase()}`}
            className="flag-item"
          >
            <div className="flag-canvas">
              <div className="flag-cloth">
                <img
                  src={`https://flagcdn.com/w640/${country.code}.png`}
                  srcSet={`https://flagcdn.com/w1280/${country.code}.png 2x`}
                  alt={`Flag of ${country.name}`}
                />
                {/* Ripple layers */}
                <div className="ripple ripple1"></div>
                <div className="ripple ripple2"></div>
                <div className="ripple ripple3"></div>
                {/* Moving light reflection */}
                <div className="light"></div>
                {/* Fabric grain */}
                <div className="fabric"></div>
              </div>
            </div>

            <h3 className="country-label">{country.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = `

/* SECTION */
.flags-section {
  --windX:0deg;
  --windY:0deg;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#ffffff,#e6fdf2,#ffffff);
  padding:4rem 2rem;
  font-family:Inter,sans-serif;
}

/* GRID */
.flags-container {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:2.5rem;
  max-width:1200px;
  width:100%;
}

/* FLAG ITEM */
.flag-item {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0.8rem;
  text-decoration:none;
  transition:transform 0.4s ease, box-shadow 0.4s ease;
}

.flag-item:hover {
  transform:translateY(-5px) scale(1.03);
  box-shadow:0 18px 50px rgba(16,185,129,0.35),0 6px 18px rgba(0,0,0,0.18);
}

/* CANVAS */
.flag-canvas {
  perspective:1400px;
  width:100%;
  max-width:300px;
}

/* FLAG CLOTH */
.flag-cloth {
  position:relative;
  width:100%;
  padding-bottom:66%;
  border-radius:12px;
  overflow:hidden;
  transform-origin:left;
  animation:mainWave 3.2s ease-in-out infinite;
  transform: rotateY(var(--windX)) rotateX(var(--windY));
  box-shadow:0 12px 35px rgba(0,0,0,0.18);
  transition:transform 0.3s ease;
}

.flag-cloth img {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  z-index:1;
}

/* RIPPLE LAYERS */
.ripple {
  position:absolute;
  inset:0;
  pointer-events:none;
  mix-blend-mode:overlay;
  z-index:2;
}

.ripple1 { background:linear-gradient(120deg,rgba(255,255,255,0.4),transparent 60%); animation:ripple1Anim 2.6s linear infinite; }
.ripple2 { background:linear-gradient(140deg,rgba(0,0,0,0.25),transparent 70%); animation:ripple2Anim 3.3s linear infinite; }
.ripple3 { background:linear-gradient(100deg,rgba(255,255,255,0.3),transparent 65%); animation:ripple3Anim 4s linear infinite; }

/* LIGHT REFLECTION */
.light {
  position:absolute;
  inset:0;
  background:linear-gradient(120deg,rgba(255,255,255,0.45),transparent 45%,rgba(0,0,0,0.25),transparent 70%);
  mix-blend-mode:overlay;
  animation:lightMove 3s linear infinite;
  z-index:3;
}

/* FABRIC GRAIN */
.fabric {
  position:absolute;
  inset:0;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,0.05),transparent 2px);
  z-index:4;
  pointer-events:none;
}

/* COUNTRY LABEL */
.country-label {
  font-size:1.15rem;
  font-weight:600;
  letter-spacing:1px;
  color:#065f46;
  text-transform:uppercase;
  transition:0.4s ease;
  text-align:center;
  text-shadow:0 2px 8px rgba(0,0,0,0.25);
}

.flag-item:hover .country-label {
  color:#047857;
  transform:translateY(-2px);
  text-shadow:0 4px 12px rgba(16,185,129,0.45);
}

/* MAIN FLAG WAVE */
@keyframes mainWave {
  0% { transform:rotateY(var(--windX)) skewX(0deg); }
  25% { transform:rotateY(calc(var(--windX)-8deg)) skewX(1deg); }
  50% { transform:rotateY(calc(var(--windX)+6deg)) skewX(-1deg); }
  75% { transform:rotateY(calc(var(--windX)-6deg)) skewX(0.5deg); }
  100% { transform:rotateY(var(--windX)) skewX(0deg); }
}

/* RIPPLE ANIMATIONS */
@keyframes ripple1Anim {0%{transform:translateX(-120%)}100%{transform:translateX(200%)}}
@keyframes ripple2Anim {0%{transform:translateX(-150%)}100%{transform:translateX(180%)}}
@keyframes ripple3Anim {0%{transform:translateX(-130%)}100%{transform:translateX(210%)}}

/* LIGHT ANIMATION */
@keyframes lightMove {0%{transform:translateX(-120%)}100%{transform:translateX(200%)}}

/* RESPONSIVE DESIGN */

/* Tablets */
@media(max-width:1024px){
  .flags-container {grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:2rem;}
  .flag-canvas {max-width:280px;}
  .country-label {font-size:1.05rem;}
}

/* Mobile */
@media(max-width:768px){
  .flags-container {grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1.8rem;}
  .flag-canvas {max-width:240px;}
  .flag-item:hover {transform:scale(1.02) translateY(-3px);}
  .country-label {font-size:1rem;}
}

/* Small mobile */
@media(max-width:480px){
  .flags-container {grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1.5rem;}
  .flag-canvas {max-width:200px;}
  .country-label {font-size:0.95rem;}
}

`;