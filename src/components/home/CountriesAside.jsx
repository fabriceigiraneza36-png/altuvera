// components/home/CountryGrid.jsx
import React, { memo, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { countries } from "../../data/countries";

/* ═══════════════════════════════════════════
   COUNTRY FLAG IMAGES (high‑resolution from flagpedia.net)
   ═══════════════════════════════════════════ */
const COUNTRY_FLAG_CODES = {
  kenya: "ke",
  tanzania: "tz",
  uganda: "ug",
  rwanda: "rw",
  ethiopia: "et",
  "democratic republic of the congo": "cd",
  drc: "cd",
  burundi: "bi",
  "south sudan": "ss",
  somalia: "so",
  mozambique: "mz",
  madagascar: "mg",
  malawi: "mw",
  zambia: "zm",
  zimbabwe: "zw",
  botswana: "bw",
  "south africa": "za",
  namibia: "na",
  ghana: "gh",
  nigeria: "ng",
  egypt: "eg",
  morocco: "ma",
  senegal: "sn",
  congo: "cg",
  "republic of the congo": "cg",
  sudan: "sd",
  seychelles: "sc",
  djibouti: "dj",
  eritrea: "er",
  comoros: "km",
  mauritius: "mu",
  réunion: "re",
  mayotte: "yt",
  // Add more as needed
};

const getCountryFlagUrl = (countryName) => {
  if (!countryName) return null;

  const lower = countryName.toLowerCase().trim();

  // Try direct match first
  if (COUNTRY_FLAG_CODES[lower]) {
    // Use larger 128x96 size for HD quality
    return `https://flagpedia.net/data/flags/icon/128x96/${COUNTRY_FLAG_CODES[lower]}.png`;
  }

  // Try partial match
  for (const [key, code] of Object.entries(COUNTRY_FLAG_CODES)) {
    if (lower.includes(key)) {
      return `https://flagpedia.net/data/flags/icon/128x96/${code}.png`;
    }
  }

  return null;
};

/* ═══════════════════════════════════════════
   WAVING FLAG ANIMATION – CSS keyframes for realistic wind effect
   ═══════════════════════════════════════════ */
const waveKeyframes = `
  @keyframes gentleWave {
    0% { transform: rotate(0deg) skew(0deg) scale(1); }
    25% { transform: rotate(0.5deg) skew(0.5deg) scale(1.02); }
    50% { transform: rotate(1deg) skew(1deg) scale(1.03); }
    75% { transform: rotate(0.5deg) skew(0.5deg) scale(1.02); }
    100% { transform: rotate(0deg) skew(0deg) scale(1); }
  }
`;

/* ═══════════════════════════════════════════
   FLAG CARD – only flag, no card UI
   ═══════════════════════════════════════════ */
const FlagCard = memo(({ country, index }) => {
  const [imageError, setImageError] = useState(false);
  const flagUrl = getCountryFlagUrl(country?.name);
  const destinations = country?.destinations?.length || country?.destinationCount || "10+";

  useEffect(() => {
    setImageError(false);
  }, [country?.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="flag-wrapper"
    >
      <Link
        to={`/country/${country?.slug || country?.id || ""}`}
        className="flag-link"
        aria-label={`Explore ${country?.name || "country"}`}
      >
        {/* Flag image with wind animation on hover */}
        <div className="flag-container">
          {flagUrl && !imageError ? (
            <img
              src={flagUrl}
              alt={`Flag of ${country?.name}`}
              className="flag-image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <span className="flag-fallback">🌍</span>
          )}

          {/* Subtle country name on hover */}
          <div className="flag-hover-info">
            <span className="flag-country-name">{country?.name}</span>
            <span className="flag-destinations">{destinations} destinations</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════
   COUNTRY GRID – no cards, just flags
   ═══════════════════════════════════════════ */
const CountryGrid = () => {
  const countryList = useMemo(() => {
    try {
      return Array.isArray(countries) ? countries : [];
    } catch {
      return [];
    }
  }, []);

  const displayedCountries = countryList.slice(0, 8);

  return (
    <section className="country-grid-section">
      <style>{`
        ${waveKeyframes}

        .country-grid-section {
          padding: 3rem 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .country-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 2rem;
          justify-content: center;
        }

        .flag-wrapper {
          width: 100%;
          aspect-ratio: 4 / 3; /* typical flag proportion */
        }

        .flag-link {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
        }

        .flag-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .flag-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
          transition: filter 0.3s ease;
        }

        /* Wind-blown animation on hover */
        .flag-container:hover .flag-image {
          animation: gentleWave 1.2s infinite ease-in-out;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.2));
        }

        .flag-fallback {
          font-size: 4rem;
          line-height: 1;
        }

        /* Hover info – subtle overlay with country name */
        .flag-hover-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          color: white;
          padding: 0.5rem;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          border-radius: 0 0 12px 12px;
          font-family: 'Playfair Display', serif;
          pointer-events: none;
        }

        .flag-container:hover .flag-hover-info {
          opacity: 1;
          transform: translateY(0);
        }

        .flag-country-name {
          display: block;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }

        .flag-destinations {
          display: block;
          font-size: 0.75rem;
          opacity: 0.9;
        }

        /* Header and view all link (optional) */
        .country-grid-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .country-grid-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 0.6rem 1.4rem;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 8px 18px rgba(5, 150, 105, 0.3);
        }

        .view-all-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(5, 150, 105, 0.4);
        }

        @media (max-width: 640px) {
          .country-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .flag-fallback {
            font-size: 3rem;
          }

          .flag-country-name {
            font-size: 0.9rem;
          }

          .flag-destinations {
            font-size: 0.7rem;
          }
        }
      `}</style>

      <div className="country-grid-header">
        <h2 className="country-grid-title">Explore Countries</h2>
        <Link to="/countries" className="view-all-link">
          View All <FiArrowRight size={16} />
        </Link>
      </div>

      <div className="country-grid">
        {displayedCountries.map((country, index) => (
          <FlagCard key={country?.id || country?.slug || index} country={country} index={index} />
        ))}
      </div>
    </section>
  );
};

export default CountryGrid;