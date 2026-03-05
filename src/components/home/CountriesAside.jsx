import React from "react";

const countries = [
  { name: "Rwanda", code: "rw" },
  { name: "Kenya", code: "ke" },
  { name: "Tanzania", code: "tz" },
  { name: "Uganda", code: "ug" },
  { name: "Ethiopia", code: "et" }
];

export default function EastAfricaFlags() {
  return (
    <div className="page">
      <style>{styles}</style>

      <div className="grid">
        {countries.map((country) => (
          <div key={country.code} className="card">
            <div className="flag-wrapper">
              <div className="flag">
                <img
                  src={`https://flagcdn.com/w320/${country.code}.svg`}
                  srcSet={`https://flagcdn.com/w640/${country.code}.svg 2x`}
                  alt={`Flag of ${country.name}`}
                  loading="lazy"
                  width="320"
                  height="213"
                />
              </div>
            </div>
            <span className="country-name">{country.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: system-ui, -apple-system, 'Inter', sans-serif;
    background: radial-gradient(circle at 20% 20%, #1f2a44 0%, #0b1220 60%),
                linear-gradient(135deg, #0b1220, #111c36);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    width: 100%;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .flag-wrapper {
    width: 100%;
    max-width: 280px;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .flag {
    position: relative;
    width: 100%;
    padding-bottom: 66.25%; /* 1.5:1 aspect ratio (standard flag proportions) */
    background: #f0f0f0;
    overflow: hidden;
    transform-origin: center;
    animation: gentleWave 12s ease-in-out infinite;
  }

  .flag img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Enhanced lighting effect */
  .flag::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 30%,
      rgba(0, 0, 0, 0.2) 60%,
      rgba(255, 255, 255, 0.15) 100%
    );
    mix-blend-mode: overlay;
    pointer-events: none;
    z-index: 2;
    animation: lightSweep 8s linear infinite;
  }

  /* Subtle ripple effect */
  .flag::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 4px,
      transparent 8px,
      transparent 24px
    );
    opacity: 0.5;
    pointer-events: none;
    z-index: 2;
    animation: rippleMove 10s ease-in-out infinite;
  }

  @keyframes gentleWave {
    0% {
      transform: perspective(800px) rotateY(0deg) scale(1);
    }
    25% {
      transform: perspective(800px) rotateY(4deg) scale(1.02);
    }
    50% {
      transform: perspective(800px) rotateY(-3deg) scale(0.99);
    }
    75% {
      transform: perspective(800px) rotateY(4deg) scale(1.02);
    }
    100% {
      transform: perspective(800px) rotateY(0deg) scale(1);
    }
  }

  @keyframes lightSweep {
    0% {
      transform: translateX(-120%) skewX(-15deg);
    }
    100% {
      transform: translateX(120%) skewX(-15deg);
    }
  }

  @keyframes rippleMove {
    0% {
      transform: translateX(0) translateY(0);
    }
    33% {
      transform: translateX(-8px) translateY(-2px);
    }
    66% {
      transform: translateX(4px) translateY(2px);
    }
    100% {
      transform: translateX(0) translateY(0);
    }
  }

  .country-name {
    color: rgba(255, 255, 255, 0.95);
    font-size: 1.125rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    margin-top: 0.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .page {
      padding: 1rem;
    }
    
    .grid {
      gap: 1rem;
    }
    
    .country-name {
      font-size: 1rem;
    }
  }

  /* Optional: Add a subtle loading animation for images */
  .flag img {
    transition: opacity 0.3s ease;
    opacity: 0;
  }

  .flag img[src] {
    opacity: 1;
  }
`;