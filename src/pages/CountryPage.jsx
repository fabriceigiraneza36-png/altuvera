import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchCountryPageData } from "../data/countries";


const API =
  (process.env.REACT_APP_API_URL || "http://localhost:3001") + "/api";

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */

const useWindowWidth = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
};

/* ═══════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════ */

const T = {
  primary: "#0c3b5e",
  primaryLight: "#e3f0fb",
  secondary: "#1a8a5c",
  secondaryLight: "#e6f7ef",
  accent: "#d4930a",
  accentLight: "#fef7e4",
  danger: "#c0392b",
  text: "#1e293b",
  textMd: "#475569",
  textLt: "#94a3b8",
  bg: "#f7f8fc",
  white: "#ffffff",
  border: "#e2e8f0",
  shadow: "0 2px 8px rgba(0,0,0,.08)",
  shadowLg: "0 8px 30px rgba(0,0,0,.12)",
  radius: "14px",
  radiusSm: "10px",
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  serif: "Georgia,'Times New Roman',serif",
};

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const fmt = (n) => {
  if (n == null) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};

const fallbackImg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' fill='%23e2e8f0'%3E%3Crect width='800' height='500'/%3E%3Ctext x='400' y='260' text-anchor='middle' fill='%2394a3b8' font-size='28' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const splitParagraphs = (text) => {
  if (!text) return [];
  return text
    .split(/\n\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
};

/* ═══════════════════════════════════════════════════
   SHARED INLINE COMPONENT STYLES
   ═══════════════════════════════════════════════════ */

const sectionWrap = (mob) => ({
  maxWidth: 1200,
  margin: "0 auto",
  padding: mob ? "40px 16px" : "70px 32px",
});

const sectionTitle = (mob) => ({
  fontFamily: T.serif,
  fontSize: mob ? 26 : 34,
  fontWeight: 700,
  color: T.primary,
  marginBottom: 6,
  letterSpacing: "-0.02em",
});

const sectionSub = () => ({
  fontSize: 15,
  color: T.textMd,
  marginBottom: 36,
  lineHeight: 1.6,
});

const cardBase = () => ({
  background: T.white,
  borderRadius: T.radiusSm,
  boxShadow: T.shadow,
  overflow: "hidden",
  transition: "transform .25s, box-shadow .25s",
});

/* ═══════════════════════════════════════════════════
   GLOBAL CSS (injected once)
   ═══════════════════════════════════════════════════ */

const GlobalStyle = () => (
  <style>{`
    .cp-card:hover{transform:translateY(-5px);box-shadow:${T.shadowLg}!important}
    .cp-nav-link{position:relative;padding:14px 0;color:${T.textMd};font-weight:500;font-size:14px;
      text-decoration:none;white-space:nowrap;transition:color .2s;cursor:pointer;border:none;background:none}
    .cp-nav-link:hover,.cp-nav-link.active{color:${T.primary}}
    .cp-nav-link.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
      background:${T.primary};border-radius:3px 3px 0 0}
    .cp-fade{animation:cpFade .6s ease-out}
    @keyframes cpFade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .cp-img-zoom{transition:transform .45s ease}
    .cp-img-zoom:hover{transform:scale(1.06)}
    .cp-timeline-dot{width:14px;height:14px;border-radius:50%;border:3px solid ${T.primary};
      background:${T.white};position:absolute;left:-7px;top:4px;z-index:2}
    .cp-timeline-dot.major{background:${T.primary}}
    .cp-tag{display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;
      font-weight:500;margin:0 6px 8px 0}
    .cp-gallery-item{cursor:pointer;border-radius:${T.radiusSm};overflow:hidden}
    .cp-gallery-item:hover .cp-img-zoom{transform:scale(1.08)}
    .cp-lightbox{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);
      display:flex;align-items:center;justify-content:center;padding:20px;animation:cpFade .3s}
    .cp-lightbox img{max-width:90vw;max-height:85vh;border-radius:8px;object-fit:contain}
    .cp-lightbox-close{position:absolute;top:20px;right:28px;color:#fff;font-size:36px;
      cursor:pointer;background:none;border:none;line-height:1}
    @media(max-width:767px){
      .cp-facts-grid{grid-template-columns:repeat(2,1fr)!important}
      .cp-two-col{flex-direction:column!important}
      .cp-three-grid{grid-template-columns:1fr!important}
    }
    @media(min-width:768px) and (max-width:1023px){
      .cp-three-grid{grid-template-columns:repeat(2,1fr)!important}
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ── HERO ───────────────────────────────────────── */
const Hero = ({ c, mob }) => {
  const bg = c.heroImage || c.coverImageUrl || c.imageUrl || fallbackImg;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: mob ? "58vh" : "78vh",
        minHeight: 380,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(.65)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(12,59,94,.35) 0%, rgba(12,59,94,.75) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: mob ? "24px 16px 36px" : "48px 48px 56px",
          maxWidth: 1200,
          margin: "0 auto",
          color: "#fff",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            position: "absolute",
            top: mob ? 16 : 30,
            left: mob ? 16 : 48,
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 13,
            opacity: 0.85,
          }}
        >
          <Link
            to="/"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Home
          </Link>
          <span>›</span>
          <Link
            to="/countries"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Countries
          </Link>
          <span>›</span>
          <span style={{ opacity: 0.7 }}>{c.name}</span>
        </div>

        {/* Flag + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 20, marginBottom: 8 }}>
          {c.flag && (
            <span style={{ fontSize: mob ? 44 : 64, lineHeight: 1 }}>{c.flag}</span>
          )}
          <h1
            style={{
              fontFamily: T.serif,
              fontSize: mob ? 36 : 60,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.03em",
              textShadow: "0 2px 20px rgba(0,0,0,.3)",
            }}
          >
            {c.name}
          </h1>
        </div>

        {/* Official Name */}
        {c.officialName && (
          <p
            style={{
              margin: "0 0 6px",
              fontSize: mob ? 14 : 17,
              opacity: 0.85,
              fontStyle: "italic",
            }}
          >
            {c.officialName}
          </p>
        )}

        {/* Tagline */}
        {c.tagline && (
          <p
            style={{
              margin: "0 0 18px",
              fontSize: mob ? 16 : 22,
              fontWeight: 300,
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            "{c.tagline}"
          </p>
        )}

        {/* Quick chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          {c.capital && (
            <span style={chipStyle}>🏛 {c.capital}</span>
          )}
          {c.continent && (
            <span style={chipStyle}>🌍 {c.continent}</span>
          )}
          {c.population && (
            <span style={chipStyle}>👥 {fmt(c.population)}</span>
          )}
          {c.destinationCount > 0 && (
            <span style={{ ...chipStyle, background: "rgba(26,138,92,.85)" }}>
              📍 {c.destinationCount} Destination{c.destinationCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 16px",
  borderRadius: 30,
  background: "rgba(255,255,255,.18)",
  backdropFilter: "blur(6px)",
  fontSize: 13,
  fontWeight: 500,
  color: "#fff",
};

/* ── SECTION NAV ────────────────────────────────── */
const SectionNav = ({ sections, active, onClick, mob }) => {
  const ref = useRef(null);
  return (
    <nav
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          gap: mob ? 18 : 28,
          overflowX: "auto",
          padding: mob ? "0 12px" : "0 32px",
          scrollbarWidth: "none",
        }}
      >
        {sections.map((s) => (
          <button
            key={s.id}
            className={`cp-nav-link${active === s.id ? " active" : ""}`}
            onClick={() => onClick(s.id)}
          >
            {mob ? s.short || s.label : s.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

/* ── QUICK FACTS ────────────────────────────────── */
const QuickFacts = ({ c, mob }) => {
  const facts = [
    { icon: "🏛", label: "Capital", value: c.capital },
    { icon: "👥", label: "Population", value: fmt(c.population) },
    { icon: "📐", label: "Area", value: c.area ? `${fmt(c.area)} km²` : null },
    { icon: "🗣", label: "Language", value: (c.officialLanguages || c.languages || []).slice(0, 2).join(", ") || null },
    { icon: "💰", label: "Currency", value: c.currency ? `${c.currency}${c.currencySymbol ? ` (${c.currencySymbol})` : ""}` : null },
    { icon: "⏰", label: "Timezone", value: c.timezone },
    { icon: "📞", label: "Calling Code", value: c.callingCode },
    { icon: "🌐", label: "Internet", value: c.internetTLD },
  ].filter((f) => f.value && f.value !== "—");

  if (!facts.length) return null;

  return (
    <div style={{ background: T.primaryLight, padding: mob ? "24px 16px" : "32px" }}>
      <div
        className="cp-facts-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: mob ? "repeat(2,1fr)" : `repeat(${Math.min(facts.length, 4)}, 1fr)`,
          gap: mob ? 12 : 16,
        }}
      >
        {facts.map((f, i) => (
          <div
            key={i}
            style={{
              background: T.white,
              borderRadius: T.radiusSm,
              padding: mob ? "14px 12px" : "18px 20px",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,.05)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
            <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>
              {f.label}
            </div>
            <div style={{ fontSize: mob ? 14 : 16, fontWeight: 600, color: T.text }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── OVERVIEW ───────────────────────────────────── */
const Overview = ({ c, mob }) => {
  const descParas = splitParagraphs(c.description);
  const fullParas = splitParagraphs(c.fullDescription);
  const addParas = splitParagraphs(c.additionalInfo);
  const allParas = [...descParas, ...fullParas, ...addParas];
  const sideImages = (c.images || []).slice(0, 3);

  if (!allParas.length && !(c.highlights || []).length) return null;

  return (
    <section id="overview" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>About {c.name}</h2>
        {c.motto && (
          <p style={{ ...sectionSub(), fontStyle: "italic", color: T.accent }}>
            Motto: "{c.motto}"
          </p>
        )}

        <div
          className="cp-two-col"
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          {/* Text Column */}
          <div style={{ flex: "1 1 60%", minWidth: 0 }}>
            {allParas.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: mob ? 15 : 17,
                  lineHeight: 1.85,
                  color: T.text,
                  marginBottom: 20,
                  textAlign: "justify",
                }}
              >
                {p}
              </p>
            ))}
          </div>

          {/* Image Sidebar */}
          {sideImages.length > 0 && !mob && (
            <div style={{ flex: "0 0 36%", display: "flex", flexDirection: "column", gap: 16 }}>
              {sideImages.map((img, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: T.radiusSm,
                    overflow: "hidden",
                    boxShadow: T.shadow,
                  }}
                >
                  <img
                    src={img}
                    alt={`${c.name} ${i + 1}`}
                    className="cp-img-zoom"
                    style={{
                      width: "100%",
                      height: i === 0 ? 260 : 200,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => { e.target.src = fallbackImg; }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile images (horizontal scroll) */}
        {sideImages.length > 0 && mob && (
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              marginTop: 20,
              paddingBottom: 8,
              scrollbarWidth: "none",
            }}
          >
            {sideImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                style={{
                  width: 260,
                  height: 170,
                  objectFit: "cover",
                  borderRadius: T.radiusSm,
                  flexShrink: 0,
                }}
                onError={(e) => { e.target.src = fallbackImg; }}
              />
            ))}
          </div>
        )}

        {/* Highlights */}
        {(c.highlights || []).length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h3
              style={{
                fontFamily: T.serif,
                fontSize: mob ? 20 : 24,
                color: T.primary,
                marginBottom: 20,
              }}
            >
              ✦ Key Highlights
            </h3>
            <div
              className="cp-three-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
              }}
            >
              {c.highlights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 18px",
                    borderRadius: T.radiusSm,
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    fontSize: 14,
                    color: T.text,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ color: T.accent, fontSize: 18 }}>◆</span>
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experiences */}
        {(c.experiences || []).length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h3
              style={{
                fontFamily: T.serif,
                fontSize: mob ? 20 : 24,
                color: T.primary,
                marginBottom: 20,
              }}
            >
              🌟 Must-Have Experiences
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {c.experiences.map((e, i) => (
                <span
                  key={i}
                  className="cp-tag"
                  style={{ background: T.accentLight, color: "#92610a" }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── GEOGRAPHY & CLIMATE ─────────────────────────── */
const GeographyClimate = ({ c, mob }) => {
  const geo = c.geography || {};
  const seasons = c.seasons || {};
  const hasGeo = c.area || Object.keys(geo).length > 0;
  const hasClimate = c.climate || c.bestTime || Object.keys(seasons).length > 0;

  if (!hasGeo && !hasClimate) return null;

  return (
    <section id="geography" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Geography & Climate</h2>
        <p style={sectionSub()}>
          Explore the diverse landscapes, terrain, and weather patterns of {c.name}.
        </p>

        <div
          className="cp-two-col"
          style={{ display: "flex", gap: 32 }}
        >
          {/* Geography column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...cardBase(),
                padding: mob ? 20 : 28,
              }}
            >
              <h3 style={{ fontFamily: T.serif, fontSize: 20, color: T.primary, margin: "0 0 18px" }}>
                🗺 Geography
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {c.area && (
                  <StatItem label="Total Area" value={`${Number(c.area).toLocaleString()} km²`} />
                )}
                {c.populationDensity && (
                  <StatItem label="Pop. Density" value={`${c.populationDensity}/km²`} />
                )}
                {geo.terrain && (
                  <StatItem label="Terrain" value={geo.terrain} span />
                )}
                {geo.highest_point && (
                  <StatItem label="Highest Point" value={geo.highest_point} />
                )}
                {geo.lowest_point && (
                  <StatItem label="Lowest Point" value={geo.lowest_point} />
                )}
                {geo.coastline && (
                  <StatItem label="Coastline" value={geo.coastline} />
                )}
                {geo.natural_resources && (
                  <StatItem label="Resources" value={
                    Array.isArray(geo.natural_resources)
                      ? geo.natural_resources.join(", ")
                      : geo.natural_resources
                  } span />
                )}
              </div>
              {c.region && (
                <p style={{ marginTop: 16, fontSize: 14, color: T.textMd }}>
                  <strong>Region:</strong> {c.region}
                  {c.subRegion ? ` — ${c.subRegion}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Climate column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...cardBase(),
                padding: mob ? 20 : 28,
              }}
            >
              <h3 style={{ fontFamily: T.serif, fontSize: 20, color: T.primary, margin: "0 0 18px" }}>
                🌤 Climate & Weather
              </h3>
              {c.climate && (
                <p style={{ fontSize: 15, lineHeight: 1.75, color: T.text, marginBottom: 16 }}>
                  {c.climate}
                </p>
              )}
              {c.bestTime && (
                <div
                  style={{
                    background: T.accentLight,
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 22 }}>📅</span>
                  <div>
                    <div style={{ fontSize: 11, color: T.textLt, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8 }}>
                      Best Time to Visit
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>
                      {c.bestTime}
                    </div>
                  </div>
                </div>
              )}
              {(seasons.dry || []).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.textMd }}>Dry Season: </span>
                  <span style={{ fontSize: 14, color: T.text }}>{seasons.dry.join(", ")}</span>
                </div>
              )}
              {(seasons.wet || []).length > 0 && (
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.textMd }}>Wet Season: </span>
                  <span style={{ fontSize: 14, color: T.text }}>{seasons.wet.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Neighboring Countries */}
        {(c.neighboringCountries || []).length > 0 && (
          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: 16, color: T.primary, marginBottom: 12 }}>
              🤝 Neighboring Countries
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {c.neighboringCountries.map((n, i) => (
                <span
                  key={i}
                  className="cp-tag"
                  style={{ background: T.primaryLight, color: T.primary }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const StatItem = ({ label, value, span }) => (
  <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
    <div style={{ fontSize: 11, color: T.textLt, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 3 }}>
      {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{value}</div>
  </div>
);

/* ── PEOPLE & CULTURE ────────────────────────────── */
const PeopleCulture = ({ c, mob }) => {
  const hasDemo = c.population || c.lifeExpectancy || c.medianAge || c.literacyRate || c.urbanPopulation;
  const hasLang = (c.languages || []).length || (c.officialLanguages || []).length;
  const hasEthnic = (c.ethnicGroups || []).length;
  const hasRelig = (c.religions || []).length;

  if (!hasDemo && !hasLang && !hasEthnic && !hasRelig) return null;

  const demoCards = [
    { icon: "👥", label: "Population", value: fmt(c.population) },
    { icon: "🏙", label: "Urban Pop.", value: c.urbanPopulation ? `${c.urbanPopulation}%` : null },
    { icon: "❤️", label: "Life Expectancy", value: c.lifeExpectancy ? `${c.lifeExpectancy} yrs` : null },
    { icon: "📊", label: "Median Age", value: c.medianAge ? `${c.medianAge} yrs` : null },
    { icon: "📚", label: "Literacy Rate", value: c.literacyRate ? `${c.literacyRate}%` : null },
    { icon: "🏠", label: "Pop. Density", value: c.populationDensity ? `${c.populationDensity}/km²` : null },
  ].filter((d) => d.value);

  return (
    <section id="people" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>People & Culture</h2>
        <p style={sectionSub()}>
          Discover the vibrant communities, languages, and cultural traditions that define {c.name}.
        </p>

        {/* Demographics grid */}
        {demoCards.length > 0 && (
          <div
            className="cp-facts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : `repeat(${Math.min(demoCards.length, 3)}, 1fr)`,
              gap: 14,
              marginBottom: 36,
            }}
          >
            {demoCards.map((d, i) => (
              <div
                key={i}
                style={{
                  background: T.bg,
                  borderRadius: T.radiusSm,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ fontSize: mob ? 22 : 26, fontWeight: 700, color: T.primary }}>{d.value}</div>
                <div style={{ fontSize: 12, color: T.textLt, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                  {d.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages / Ethnic / Religions */}
        <div
          className="cp-three-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {hasLang && (
            <ListCard
              title="🗣 Languages"
              items={[
                ...(c.officialLanguages || []).map((l) => `${l} (Official)`),
                ...(c.nationalLanguages || []).map((l) => `${l} (National)`),
                ...(c.languages || []).filter(
                  (l) =>
                    !(c.officialLanguages || []).includes(l) &&
                    !(c.nationalLanguages || []).includes(l)
                ),
              ]}
              color={T.primary}
              bg={T.primaryLight}
            />
          )}
          {hasEthnic && (
            <ListCard
              title="🧑‍🤝‍🧑 Ethnic Groups"
              items={c.ethnicGroups}
              color={T.secondary}
              bg={T.secondaryLight}
            />
          )}
          {hasRelig && (
            <ListCard
              title="🕌 Religions"
              items={c.religions}
              color="#7c3aed"
              bg="#f3eeff"
            />
          )}
        </div>

        {/* Government */}
        {(c.governmentType || c.headOfState || c.independence) && (
          <div
            style={{
              marginTop: 32,
              ...cardBase(),
              padding: 24,
              background: T.bg,
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
            }}
          >
            <h4 style={{ width: "100%", margin: "0 0 4px", fontFamily: T.serif, fontSize: 18, color: T.primary }}>
              🏛 Government & Independence
            </h4>
            {c.governmentType && (
              <div>
                <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8 }}>Government</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.governmentType}</div>
              </div>
            )}
            {c.headOfState && (
              <div>
                <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8 }}>Head of State</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.headOfState}</div>
              </div>
            )}
            {c.independence && (
              <div>
                <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8 }}>Independence</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.independence}</div>
              </div>
            )}
            {c.demonym && (
              <div>
                <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8 }}>Demonym</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.demonym}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const ListCard = ({ title, items, color, bg }) => (
  <div
    style={{
      ...cardBase(),
      padding: 22,
    }}
  >
    <h4 style={{ margin: "0 0 14px", fontSize: 16, color }}>{title}</h4>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.slice(0, 12).map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: T.text,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
              opacity: 0.6,
            }}
          />
          {item}
        </div>
      ))}
      {items.length > 12 && (
        <div style={{ fontSize: 13, color: T.textLt, marginTop: 4 }}>
          +{items.length - 12} more
        </div>
      )}
    </div>
  </div>
);

/* ── HISTORY & HERITAGE ──────────────────────────── */
const HistoryHeritage = ({ c, mob }) => {
  const timeline = c.historicalTimeline || [];
  const unesco = c.unescoSites || [];

  if (!timeline.length && !unesco.length) return null;

  return (
    <section id="history" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>History & Heritage</h2>
        <p style={sectionSub()}>
          Journey through the defining moments and treasured heritage sites of {c.name}.
        </p>

        {/* Timeline */}
        {timeline.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontFamily: T.serif, fontSize: mob ? 20 : 24, color: T.primary, marginBottom: 24 }}>
              📜 Historical Timeline
            </h3>
            <div style={{ position: "relative", paddingLeft: 28 }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: T.border,
                }}
              />
              {timeline.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    marginBottom: i < timeline.length - 1 ? 28 : 0,
                    paddingLeft: 16,
                  }}
                >
                  <div className={`cp-timeline-dot${ev.isMajor ? " major" : ""}`} />
                  <div
                    style={{
                      ...cardBase(),
                      padding: "14px 18px",
                      background: ev.isMajor ? T.primaryLight : T.white,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.primary,
                          background: T.primaryLight,
                          padding: "2px 10px",
                          borderRadius: 4,
                        }}
                      >
                        {ev.year}
                      </span>
                      {ev.type && (
                        <span style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .5 }}>
                          {ev.type}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.text }}>
                      {ev.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UNESCO Sites */}
        {unesco.length > 0 && (
          <div>
            <h3 style={{ fontFamily: T.serif, fontSize: mob ? 20 : 24, color: T.primary, marginBottom: 24 }}>
              🏛 UNESCO World Heritage Sites
            </h3>
            <div
              className="cp-three-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 16,
              }}
            >
              {unesco.map((site, i) => (
                <div
                  key={i}
                  className="cp-card"
                  style={{
                    ...cardBase(),
                    padding: 22,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.text, flex: 1 }}>
                      {site.name}
                    </h4>
                    {site.year && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: T.accent,
                          background: T.accentLight,
                          padding: "2px 8px",
                          borderRadius: 4,
                          marginLeft: 8,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {site.year}
                      </span>
                    )}
                  </div>
                  {site.type && (
                    <span
                      className="cp-tag"
                      style={{
                        background:
                          site.type === "Natural"
                            ? T.secondaryLight
                            : site.type === "Mixed"
                            ? T.accentLight
                            : T.primaryLight,
                        color:
                          site.type === "Natural"
                            ? T.secondary
                            : site.type === "Mixed"
                            ? "#92610a"
                            : T.primary,
                        fontSize: 11,
                        margin: "0 0 10px",
                      }}
                    >
                      {site.type}
                    </span>
                  )}
                  {site.description && (
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: T.textMd }}>
                      {site.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── WILDLIFE & NATURE ───────────────────────────── */
const WildlifeNature = ({ c, mob }) => {
  const w = c.wildlife || {};
  const cats = [
    { icon: "🦁", title: "Mammals", items: w.mammals || [] },
    { icon: "🦅", title: "Birds", items: w.birds || [] },
    { icon: "🐠", title: "Marine Life", items: w.marine || [] },
    { icon: "🦎", title: "Reptiles", items: w.reptiles || [] },
  ].filter((cat) => cat.items.length > 0);

  if (!cats.length) return null;

  return (
    <section id="wildlife" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Wildlife & Nature</h2>
        <p style={sectionSub()}>
          {c.name} is home to an extraordinary array of wildlife and natural wonders.
        </p>

        <div
          className="cp-three-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(cats.length, 3)}, 1fr)`,
            gap: 20,
          }}
        >
          {cats.map((cat, i) => (
            <div
              key={i}
              style={{
                ...cardBase(),
                padding: 24,
                background: T.secondaryLight,
                border: "1px solid rgba(26,138,92,.15)",
              }}
            >
              <h4 style={{ margin: "0 0 16px", fontSize: 18, color: T.secondary }}>
                {cat.icon} {cat.title}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cat.items.map((item, j) => (
                  <span
                    key={j}
                    className="cp-tag"
                    style={{
                      background: T.white,
                      color: T.text,
                      border: `1px solid ${T.border}`,
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── CUISINE ─────────────────────────────────────── */
const Cuisine = ({ c, mob }) => {
  const cu = c.cuisine || {};
  const cats = [
    { icon: "🍚", title: "Staple Foods", items: cu.staples || [] },
    { icon: "🍖", title: "Specialties", items: cu.specialties || [] },
    { icon: "🥤", title: "Beverages", items: cu.beverages || [] },
    { icon: "🍰", title: "Desserts", items: cu.desserts || [] },
  ].filter((cat) => cat.items.length > 0);

  if (!cats.length) return null;

  return (
    <section id="cuisine" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Cuisine & Food Culture</h2>
        <p style={sectionSub()}>
          Savor the authentic flavors and culinary traditions of {c.name}.
        </p>

        <div
          className="cp-two-col"
          style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
        >
          {cats.map((cat, i) => (
            <div
              key={i}
              className="cp-card"
              style={{
                ...cardBase(),
                padding: 24,
                flex: mob ? "1 1 100%" : "1 1 calc(50% - 10px)",
                minWidth: mob ? undefined : 280,
              }}
            >
              <h4 style={{ margin: "0 0 14px", fontSize: 18, color: T.accent }}>
                {cat.icon} {cat.title}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cat.items.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: T.bg,
                      borderRadius: 8,
                      fontSize: 14,
                      color: T.text,
                    }}
                  >
                    <span style={{ color: T.accent }}>•</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── TRAVEL ESSENTIALS ───────────────────────────── */
const TravelEssentials = ({ c, mob }) => {
  const practicals = [
    { icon: "🚗", label: "Driving Side", value: c.drivingSide },
    { icon: "🔌", label: "Electrical Plug", value: c.electricalPlug },
    { icon: "⚡", label: "Voltage", value: c.voltage },
    { icon: "💧", label: "Water Safety", value: c.waterSafety },
    { icon: "📞", label: "Calling Code", value: c.callingCode },
    { icon: "🌐", label: "Internet TLD", value: c.internetTLD },
    { icon: "💰", label: "Currency", value: c.currency },
    { icon: "⏰", label: "Timezone", value: c.timezone },
  ].filter((p) => p.value);

  const hasVisa = c.visaInfo;
  const hasHealth = c.healthInfo;

  if (!practicals.length && !hasVisa && !hasHealth) return null;

  return (
    <section id="travel" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Travel Essentials</h2>
        <p style={sectionSub()}>
          Everything you need to know before planning your trip to {c.name}.
        </p>

        {/* Practical info grid */}
        {practicals.length > 0 && (
          <div
            className="cp-facts-grid"
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 14,
              marginBottom: 32,
            }}
          >
            {practicals.map((p, i) => (
              <div
                key={i}
                style={{
                  background: T.bg,
                  borderRadius: T.radiusSm,
                  padding: "16px 14px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Visa & Health */}
        <div
          className="cp-two-col"
          style={{ display: "flex", gap: 20 }}
        >
          {hasVisa && (
            <InfoCard
              icon="🛂"
              title="Visa Information"
              text={c.visaInfo}
              color={T.primary}
              bg={T.primaryLight}
            />
          )}
          {hasHealth && (
            <InfoCard
              icon="🏥"
              title="Health Information"
              text={c.healthInfo}
              color={T.danger}
              bg="#fef2f2"
            />
          )}
        </div>
      </div>
    </section>
  );
};

const InfoCard = ({ icon, title, text, color, bg }) => (
  <div
    style={{
      flex: 1,
      borderRadius: T.radiusSm,
      border: `1px solid ${color}22`,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        background: bg,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color }}>{title}</h4>
    </div>
    <div style={{ padding: "16px 20px", background: T.white }}>
      {splitParagraphs(text).map((p, i) => (
        <p key={i} style={{ margin: i > 0 ? "10px 0 0" : 0, fontSize: 14, lineHeight: 1.7, color: T.text }}>
          {p}
        </p>
      ))}
    </div>
  </div>
);

/* ── FESTIVALS ───────────────────────────────────── */
const Festivals = ({ c, mob }) => {
  const fests = c.festivals || [];
  if (!fests.length) return null;

  return (
    <section id="festivals" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Festivals & Events</h2>
        <p style={sectionSub()}>
          Experience the colorful celebrations and cultural events of {c.name}.
        </p>

        <div
          className="cp-three-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {fests.map((f, i) => (
            <div
              key={i}
              className="cp-card"
              style={{ ...cardBase(), overflow: "hidden" }}
            >
              {f.imageUrl && (
                <div style={{ height: 170, overflow: "hidden" }}>
                  <img
                    src={f.imageUrl}
                    alt={f.name}
                    className="cp-img-zoom"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.text }}>{f.name}</h4>
                  {f.isMajorEvent && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: T.accentLight, padding: "2px 8px", borderRadius: 4 }}>
                      MAJOR
                    </span>
                  )}
                </div>
                {(f.period || f.month) && (
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: T.primary, fontWeight: 500 }}>
                    📅 {f.period || f.month}
                  </p>
                )}
                {f.description && (
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: T.textMd }}>
                    {f.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── AIRPORTS ────────────────────────────────────── */
const Airports = ({ c, mob }) => {
  const airports = c.airports || [];
  if (!airports.length) return null;

  return (
    <section id="airports" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Getting There</h2>
        <p style={sectionSub()}>
          Key airports and entry points for traveling to {c.name}.
        </p>

        <div
          className="cp-three-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {airports.map((a, i) => (
            <div
              key={i}
              className="cp-card"
              style={{
                ...cardBase(),
                padding: 22,
                borderLeft: a.isMainInternational
                  ? `4px solid ${T.primary}`
                  : `4px solid ${T.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>✈️</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text }}>{a.name}</h4>
                  {a.code && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>
                      ({a.code})
                    </span>
                  )}
                </div>
              </div>
              {a.location && (
                <p style={{ margin: "0 0 4px", fontSize: 13, color: T.textMd }}>📍 {a.location}</p>
              )}
              {a.type && (
                <span
                  className="cp-tag"
                  style={{
                    background: T.primaryLight,
                    color: T.primary,
                    fontSize: 11,
                  }}
                >
                  {a.type}
                </span>
              )}
              {a.description && (
                <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, color: T.textMd }}>
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── DESTINATIONS ────────────────────────────────── */
const Destinations = ({ destinations, countryName, countrySlug, mob }) => {
  if (!destinations || !destinations.length) return null;

  return (
    <section id="destinations" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ ...sectionTitle(mob), marginBottom: 0 }}>
            Explore Destinations
          </h2>
          {countrySlug && (
            <Link
              to={`/countries/${countrySlug}/destinations`}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T.primary,
                textDecoration: "none",
              }}
            >
              View All →
            </Link>
          )}
        </div>
        <p style={sectionSub()}>
          Discover the most stunning places to visit in {countryName}.
        </p>

        <div
          className="cp-three-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {destinations.slice(0, 9).map((d, i) => (
            <Link
              key={d.id || i}
              to={`/destinations/${d.slug || d.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="cp-card"
                style={{ ...cardBase(), overflow: "hidden", height: "100%" }}
              >
                <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
                  <img
                    src={d.image_url || (d.images || [])[0] || fallbackImg}
                    alt={d.name}
                    className="cp-img-zoom"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => { e.target.src = fallbackImg; }}
                  />
                  {d.is_featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: T.accent,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 4,
                        textTransform: "uppercase",
                        letterSpacing: .5,
                      }}
                    >
                      Featured
                    </span>
                  )}
                  {d.rating && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(0,0,0,.65)",
                        color: "#fbbf24",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "3px 9px",
                        borderRadius: 4,
                      }}
                    >
                      ★ {d.rating}
                    </span>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  <h4
                    style={{
                      margin: "0 0 6px",
                      fontSize: 16,
                      fontWeight: 600,
                      color: T.text,
                    }}
                  >
                    {d.name}
                  </h4>
                  {d.category && (
                    <span
                      className="cp-tag"
                      style={{
                        background: T.secondaryLight,
                        color: T.secondary,
                        fontSize: 11,
                        margin: "0 0 8px",
                      }}
                    >
                      {d.category}
                    </span>
                  )}
                  {d.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: T.textMd,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {d.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── IMAGE GALLERY ───────────────────────────────── */
const Gallery = ({ images, name, mob }) => {
  const [lightbox, setLightbox] = useState(null);

  if (!images || !images.length) return null;

  return (
    <section id="gallery" style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Photo Gallery</h2>
        <p style={sectionSub()}>
          A visual journey through the beauty of {name}.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob
              ? "repeat(2,1fr)"
              : "repeat(4,1fr)",
            gap: 12,
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="cp-gallery-item"
              style={{
                gridRow:
                  !mob && (i === 0 || i === 5) ? "span 2" : undefined,
                height: !mob && (i === 0 || i === 5) ? undefined : mob ? 160 : 200,
                overflow: "hidden",
                borderRadius: T.radiusSm,
                cursor: "pointer",
              }}
              onClick={() => setLightbox(i)}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="cp-img-zoom"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => { e.target.src = fallbackImg; }}
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div className="cp-lightbox" onClick={() => setLightbox(null)}>
            <button className="cp-lightbox-close" onClick={() => setLightbox(null)}>
              ×
            </button>
            <img
              src={images[lightbox]}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((lightbox - 1 + images.length) % images.length);
                  }}
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,.15)",
                    border: "none",
                    color: "#fff",
                    fontSize: 32,
                    padding: "8px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((lightbox + 1) % images.length);
                  }}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,.15)",
                    border: "none",
                    color: "#fff",
                    fontSize: 32,
                    padding: "8px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,.7)",
                fontSize: 14,
              }}
            >
              {lightbox + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── TRAVEL TIPS ─────────────────────────────────── */
const TravelTips = ({ c, mob }) => {
  const tips = c.travelTips || [];
  if (!tips.length) return null;

  return (
    <section id="tips" style={{ background: T.bg }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Travel Tips</h2>
        <p style={sectionSub()}>
          Insider advice and practical tips for your journey to {c.name}.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
            gap: 14,
          }}
        >
          {tips.map((tip, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                background: T.white,
                borderRadius: T.radiusSm,
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,.04)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: T.primaryLight,
                  color: T.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.text }}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── ECONOMIC INFO ───────────────────────────────── */
const EconomicInfo = ({ c, mob }) => {
  const eco = c.economicInfo || {};
  const keys = Object.keys(eco);
  if (!keys.length) return null;

  return (
    <section style={{ background: T.white }}>
      <div style={sectionWrap(mob)}>
        <h2 style={sectionTitle(mob)}>Economy</h2>
        <p style={sectionSub()}>
          An overview of the economic landscape of {c.name}.
        </p>

        <div
          className="cp-facts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 14,
          }}
        >
          {keys.map((k) => (
            <div
              key={k}
              style={{
                background: T.bg,
                borderRadius: T.radiusSm,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: T.textLt, textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>
                {k.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>
                {typeof eco[k] === "object" ? JSON.stringify(eco[k]) : String(eco[k])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

const CountryPage = () => {
  const { idOrSlug, id } = useParams();
  const slug = idOrSlug || id;
  const navigate = useNavigate();
  const width = useWindowWidth();
  const mob = width < 768;

  const [country, setCountry] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
  if (!slug) return;
  setLoading(true);
  setError(null);

  fetchCountryPageData(slug)
    .then(({ country, destinations }) => {
      setCountry(country);
      setDestinations(destinations);
    })
    .catch((e) => setError(e.message))
    .finally(() => setLoading(false));
}, [slug]);

  /* ── scroll spy ─────────────────────────────────── */
  const scrollTo = useCallback((sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const ids = sections.map((s) => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── build visible sections list ────────────────── */
  const sections = [];
  if (country) {
    const c = country;
    const hasOverview =
      c.description || c.fullDescription || (c.highlights || []).length;
    const hasGeo =
      c.area || Object.keys(c.geography || {}).length || c.climate;
    const hasPeople =
      c.population ||
      (c.languages || []).length ||
      (c.ethnicGroups || []).length;
    const hasHistory =
      (c.historicalTimeline || []).length || (c.unescoSites || []).length;
    const hasWildlife =
      Object.values(c.wildlife || {}).some(
        (v) => Array.isArray(v) && v.length
      );
    const hasCuisine =
      Object.values(c.cuisine || {}).some(
        (v) => Array.isArray(v) && v.length
      );
    const hasTravel =
      c.visaInfo || c.healthInfo || c.drivingSide || c.callingCode;
    const hasFests = (c.festivals || []).length > 0;
    const hasAirports = (c.airports || []).length > 0;
    const hasDest = destinations.length > 0;
    const hasGallery = (c.images || []).length > 0;
    const hasTips = (c.travelTips || []).length > 0;

    if (hasOverview)
      sections.push({ id: "overview", label: "Overview", short: "Overview" });
    if (hasGeo)
      sections.push({
        id: "geography",
        label: "Geography & Climate",
        short: "Geography",
      });
    if (hasPeople)
      sections.push({
        id: "people",
        label: "People & Culture",
        short: "People",
      });
    if (hasHistory)
      sections.push({
        id: "history",
        label: "History & Heritage",
        short: "History",
      });
    if (hasWildlife)
      sections.push({ id: "wildlife", label: "Wildlife", short: "Wildlife" });
    if (hasCuisine)
      sections.push({ id: "cuisine", label: "Cuisine", short: "Food" });
    if (hasTravel)
      sections.push({
        id: "travel",
        label: "Travel Essentials",
        short: "Travel",
      });
    if (hasFests)
      sections.push({
        id: "festivals",
        label: "Festivals",
        short: "Festivals",
      });
    if (hasAirports)
      sections.push({
        id: "airports",
        label: "Getting There",
        short: "Airports",
      });
    if (hasDest)
      sections.push({
        id: "destinations",
        label: "Destinations",
        short: "Places",
      });
    if (hasGallery)
      sections.push({ id: "gallery", label: "Gallery", short: "Photos" });
    if (hasTips)
      sections.push({ id: "tips", label: "Travel Tips", short: "Tips" });
  }

  /* ── LOADING STATE ──────────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.sans,
          color: T.textMd,
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: `4px solid ${T.border}`,
            borderTopColor: T.primary,
            borderRadius: "50%",
            animation: "cpSpin 1s linear infinite",
          }}
        />
        <style>{`@keyframes cpSpin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 16, margin: 0 }}>Loading country information…</p>
      </div>
    );
  }

  /* ── ERROR STATE ────────────────────────────────── */
  if (error || !country) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: T.sans,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
        <h2 style={{ fontFamily: T.serif, fontSize: 28, color: T.primary, margin: "0 0 12px" }}>
          Country Not Found
        </h2>
        <p style={{ fontSize: 16, color: T.textMd, maxWidth: 400, margin: "0 0 24px", lineHeight: 1.6 }}>
          {error || "The country you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => navigate("/countries")}
          style={{
            padding: "12px 32px",
            background: T.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Browse Countries
        </button>
      </div>
    );
  }

  /* ── RENDER ─────────────────────────────────────── */
  const c = country;

  return (
    <div style={{ fontFamily: T.sans, color: T.text, background: T.bg }}>
      <GlobalStyle />

      <Hero c={c} mob={mob} />

      {sections.length > 0 && (
        <SectionNav
          sections={sections}
          active={activeSection}
          onClick={scrollTo}
          mob={mob}
        />
      )}

      <QuickFacts c={c} mob={mob} />

      <div className="cp-fade">
        <Overview c={c} mob={mob} />
        <GeographyClimate c={c} mob={mob} />
        <PeopleCulture c={c} mob={mob} />
        <HistoryHeritage c={c} mob={mob} />
        <WildlifeNature c={c} mob={mob} />
        <Cuisine c={c} mob={mob} />
        <EconomicInfo c={c} mob={mob} />
        <TravelEssentials c={c} mob={mob} />
        <Festivals c={c} mob={mob} />
        <Airports c={c} mob={mob} />
        <Destinations
          destinations={destinations}
          countryName={c.name}
          countrySlug={c.slug}
          mob={mob}
        />
        <Gallery images={c.images} name={c.name} mob={mob} />
        <TravelTips c={c} mob={mob} />
      </div>

      {/* ── FOOTER CTA ─────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${T.primary} 0%, #164e78 100%)`,
          padding: mob ? "48px 16px" : "72px 32px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontFamily: T.serif,
            fontSize: mob ? 26 : 36,
            fontWeight: 700,
            margin: "0 0 12px",
          }}
        >
          Ready to Explore {c.name}?
        </h2>
        <p
          style={{
            fontSize: mob ? 15 : 18,
            opacity: 0.85,
            maxWidth: 520,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Start planning your adventure today. Discover stunning destinations,
          rich culture, and unforgettable experiences.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {c.destinationCount > 0 && (
            <Link
              to={`/countries/${c.slug}/destinations`}
              style={{
                padding: "14px 36px",
                background: T.accent,
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                transition: "transform .2s",
              }}
            >
              View All Destinations
            </Link>
          )}
          <Link
            to="/countries"
            style={{
              padding: "14px 36px",
              background: "rgba(255,255,255,.15)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(255,255,255,.3)",
            }}
          >
            Explore More Countries
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CountryPage;