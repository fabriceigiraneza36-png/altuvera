import React, { useEffect, useMemo, useState } from "react";
import {
  Globe, MapPin, Check, AlertCircle,
  User, Users, Heart, Building2, Sparkles, UsersRound,
} from "lucide-react";

const GROUPS = [
  { v: "solo", l: "Solo", icon: User },
  { v: "couple", l: "Couple", icon: Heart },
  { v: "family", l: "Family", icon: UsersRound },
  { v: "friends", l: "Friends", icon: Users },
  { v: "corporate", l: "Corporate", icon: Building2 },
  { v: "honeymoon", l: "Honeymoon", icon: Sparkles },
];

export default function Step1Destination({
  data,
  set,
  touch,
  errors,
  touched,
  countriesList,
  destinationsList,
}) {
  const [countryQuery, setCountryQuery] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationPickerOpen, setDestinationPickerOpen] = useState(false);

  const selectedCountry = useMemo(
    () => countriesList.find(c => String(c.value) === String(data.countryId)) || null,
    [countriesList, data.countryId]
  );

  useEffect(() => {
    if (selectedCountry) setCountryQuery(selectedCountry.label);
  }, [selectedCountry?.value, selectedCountry?.label, data.countryId]);

  const filtered = useMemo(() => {
    if (!data.countryId) return [];
    const byId = destinationsList.filter(
      (d) => String(d.countryId) === String(data.countryId)
    );
    if (byId.length) return byId;

    const country = countriesList.find(
      (c) => String(c.value) === String(data.countryId)
    );
    const name = (country?.label || "").trim().toLowerCase();
    if (!name) return [];
    return destinationsList.filter(
      (d) => String(d.country || "").trim().toLowerCase() === name
    );
  }, [destinationsList, countriesList, data.countryId]);

  const selectedDest = useMemo(
    () => filtered.find((d) => String(d.value) === String(data.destinationId)) || null,
    [filtered, data.destinationId]
  );

  useEffect(() => {
    if (selectedDest) setDestinationQuery(selectedDest.label);
  }, [selectedDest?.value, selectedDest?.label, data.destinationId]);

  const matchingCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    return countriesList.filter(c => !q || c.label.toLowerCase().includes(q)).slice(0, 8);
  }, [countriesList, countryQuery]);

  const matchingDestinations = useMemo(() => {
    const q = destinationQuery.trim().toLowerCase();
    return filtered.filter(d => !q || d.label.toLowerCase().includes(q) || String(d.country || "").toLowerCase().includes(q)).slice(0, 8);
  }, [filtered, destinationQuery]);

  return (
    <div>
      <div className="bk-field-group">
        <label htmlFor="countryId" className="bk-label">
          Destination Country <span className="bk-label-req">*</span>
        </label>

        <div className="bk-input-wrap" style={{ position: "relative" }}>
          <span className="bk-input-ico"><Globe size={17} /></span>
          <input id="countryId" role="combobox" aria-expanded={countryPickerOpen && matchingCountries.length > 0}
            aria-autocomplete="list" autoComplete="off" value={countryQuery}
            placeholder="Search countries…"
            onFocus={() => setCountryPickerOpen(true)}
            onChange={(e) => { setCountryQuery(e.target.value); setCountryPickerOpen(true); set("countryId", ""); set("destinationId", ""); set("attractionName", ""); }}
            onKeyDown={(e) => { if (e.key === "Escape") setCountryPickerOpen(false); }}
            className={`bk-input${touched.countryId && errors.countryId ? " bk-input--err" : ""}`} />
          {countryPickerOpen && matchingCountries.length > 0 && (
            <div role="listbox" className="bk-country-suggest" style={{ top: "50px" }}>
              {matchingCountries.map(country => (
                <button key={country.value} type="button" role="option" aria-selected={String(country.value) === String(data.countryId)}
                  className="bk-country-suggest__item"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    set("countryId", country.value);
                    set("destinationId", "");
                    setCountryQuery(country.label);
                    setDestinationQuery("");
                    setCountryPickerOpen(false);
                    setDestinationPickerOpen(false);
                    touch("countryId");
                  }}>
                  <span>{country.label}</span><strong>{String(country.value) === String(data.countryId) ? "Selected" : ""}</strong>
                </button>
              ))}
            </div>
          )}
        </div>

        {touched.countryId && errors.countryId && (
          <p className="bk-field-err">
            <AlertCircle size={13} /> {errors.countryId}
          </p>
        )}
      </div>

      {data.countryId && (
        filtered.length > 0 ? (
          <div className="bk-field-group">
            <label className="bk-label">
              Specific Destination <span className="bk-label-req">*</span>
            </label>

            <div className="bk-field-group" style={{ position: "relative" }}>
              <div className="bk-input-wrap" style={{ position: "relative" }}>
                <span className="bk-input-ico"><MapPin size={17} /></span>
                <input role="combobox" aria-label="Search destination" aria-expanded={destinationPickerOpen && matchingDestinations.length > 0}
                  aria-autocomplete="list" autoComplete="off" value={destinationQuery}
                  placeholder="Search destinations in this country…"
                  onFocus={() => setDestinationPickerOpen(true)}
                  onChange={e => { setDestinationQuery(e.target.value); setDestinationPickerOpen(true); set("destinationId", ""); }}
                  onKeyDown={e => { if (e.key === "Escape") setDestinationPickerOpen(false); }}
                  className={`bk-input${touched.destinationId && errors.destinationId ? " bk-input--err" : ""}`} />
                {destinationPickerOpen && matchingDestinations.length > 0 && (
                  <div role="listbox" className="bk-country-suggest" style={{ top: "50px" }}>
                    {matchingDestinations.map(d => (
                      <button key={d.value} type="button" role="option" aria-selected={String(data.destinationId) === String(d.value)}
                        className="bk-country-suggest__item" onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          set("destinationId", d.value);
                          set("attractionName", "");
                          setDestinationQuery(d.label);
                          setDestinationPickerOpen(false);
                          touch("destinationId");
                        }}>
                        <span>{d.label}</span><strong>{d.country || ""}</strong>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!selectedDest && <div className="bk-dest-grid">
              {filtered.map((d) => {
                const active = data.destinationId === d.value;

                return (
                  <button
                    key={d.value}
                    type="button"
                    className={`bk-dest-card${active ? " bk-dest-card--active" : ""}`}
                    onClick={() => {
                      set("destinationId", d.value);
                      set("attractionName", "");
                      touch("destinationId");
                    }}
                    style={{ textAlign: "left" }}
                  >
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.label}
                        loading="lazy"
                        className="bk-dest-card__img"
                      />
                    ) : (
                      <div
                        className="bk-dest-card__img"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
                          color: "#059669",
                        }}
                      >
                        <MapPin size={28} />
                      </div>
                    )}

                    <div className="bk-dest-card__body">
                      <p className="bk-dest-card__name">{d.label}</p>
                      {d.country && (
                        <p className="bk-dest-card__ctry">
                          <MapPin size={10} style={{ display: "inline-block", marginRight: 4 }} />
                          {d.country}
                        </p>
                      )}
                    </div>

                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          background: "#059669",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 8px 16px rgba(5,150,105,0.28)",
                        }}
                      >
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>}

            {touched.destinationId && errors.destinationId && (
              <p className="bk-field-err">
                <AlertCircle size={13} /> {errors.destinationId}
              </p>
            )}

                        {selectedDest && Array.isArray(selectedDest.attractions) && selectedDest.attractions.length > 0 && (
              <section className="bk-attraction-picker" aria-labelledby="bk-attraction-title">
                <div className="bk-attraction-heading">
                  <div>
                    <p className="bk-attraction-eyebrow">Optional add-ons</p>
                    <h3 id="bk-attraction-title">Choose attractions to include</h3>
                    <p>Select any experiences you want us to include in your booking for {selectedDest.label}. You can leave this blank.</p>
                  </div>
                  <span className="bk-attraction-count">{(data.attractionName || "").split("; ").filter(Boolean).length} selected</span>
                </div>
                <div className="bk-attraction-list">
                  {selectedDest.attractions.map((attraction) => {
                    const name = typeof attraction === "string" ? attraction : String(attraction?.name || attraction?.title || attraction?.label || attraction?.attraction_name || "").trim();
                    if (!name) return null;
                    const selected = (data.attractionName || "").split("; ").filter(Boolean).includes(name);
                    return <label key={name} className={`bk-attraction-option${selected ? " is-selected" : ""}`}>
                      <input type="checkbox" checked={selected} onChange={() => {
                        const current = (data.attractionName || "").split("; ").filter(Boolean);
                        const next = selected ? current.filter(item => item !== name) : [...current, name];
                        set("attractionName", next.join("; "));
                      }} />
                      <span className="bk-attraction-check"><Check size={14} /></span>
                      <span className="bk-attraction-name">{name}</span>
                      <span className="bk-attraction-state">{selected ? "Included" : "Add"}</span>
                    </label>;
                  })}
                </div>
                {data.attractionName && <button type="button" className="bk-attraction-clear" onClick={() => set("attractionName", "")}>Clear selected attractions</button>}
                <style>{`
                  .bk-attraction-picker{margin-top:22px;padding:18px;border:1px solid #d8eee0;border-radius:18px;background:linear-gradient(145deg,#f8fdf9,#effaf3)}
                  .bk-attraction-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
                  .bk-attraction-eyebrow{font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#16834c;margin-bottom:4px}
                  .bk-attraction-heading h3{font-size:16px;line-height:1.3;color:#123d29;font-weight:850}
                  .bk-attraction-heading p:not(.bk-attraction-eyebrow){font-size:12px;color:#64766b;line-height:1.5;margin-top:5px;max-width:500px}
                  .bk-attraction-count{flex-shrink:0;padding:5px 9px;border-radius:999px;background:#d8f6e3;color:#12683b;font-size:10px;font-weight:800}
                  .bk-attraction-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
                  .bk-attraction-option{min-width:0;display:flex;align-items:center;gap:9px;padding:11px;border:1px solid #e0e9e3;border-radius:12px;background:#fff;cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s}
                  .bk-attraction-option.is-selected{border-color:#24a565;background:#e9f9ef;box-shadow:0 0 0 2px rgba(36,165,101,.08)}
                  .bk-attraction-option input{position:absolute;opacity:0;width:1px;height:1px}
                  .bk-attraction-check{width:19px;height:19px;flex-shrink:0;border:1px solid #b8cabe;border-radius:6px;display:flex;align-items:center;justify-content:center;color:transparent}
                  .bk-attraction-option.is-selected .bk-attraction-check{background:#16834c;border-color:#16834c;color:#fff}
                  .bk-attraction-name{font-size:12px;font-weight:750;color:#203b2c;line-height:1.35;overflow-wrap:anywhere}
                  .bk-attraction-state{margin-left:auto;font-size:9px;font-weight:800;text-transform:uppercase;color:#748579;white-space:nowrap}
                  .bk-attraction-option.is-selected .bk-attraction-state{color:#16834c}
                  .bk-attraction-clear{margin-top:12px;border:0;background:transparent;color:#46745a;font-size:11px;font-weight:750;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
                  @media(max-width:520px){.bk-attraction-picker{padding:13px}.bk-attraction-list{grid-template-columns:1fr}.bk-attraction-heading h3{font-size:14px}}
                `}</style>
              </section>
            )}

            {selectedDest && false && (
              <div
                className="bk-selected"
                style={{
                  marginTop: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(236,253,245,0.9)",
                  border: "1px solid rgba(16,185,129,0.18)",
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#d1fae5",
                    border: "1px solid rgba(5,150,105,0.18)",
                  }}
                >
                  {selectedDest.image ? (
                    <img
                      src={selectedDest.image}
                      alt={selectedDest.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#059669",
                      }}
                    >
                      <MapPin size={22} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#047857",
                      background: "rgba(255,255,255,0.7)",
                      padding: "5px 8px",
                      borderRadius: 999,
                    }}
                  >
                    <Check size={11} /> Selected
                  </p>

                  <p style={{ marginTop: 8, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                    {selectedDest.label}
                  </p>

                  {data.attractionName && (
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      Attraction: {data.attractionName}
                    </p>
                  )}

                  {selectedDest.country && (
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                      {selectedDest.country}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#fefce8",
              border: "1.5px solid #fde047",
              marginBottom: 22,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "#854d0e", marginBottom: 4 }}>
              No destinations listed yet
            </p>
            <p style={{ fontSize: 12, color: "#a16207" }}>
              <a
                href="https://wa.me/250785751391"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#059669", fontWeight: 700 }}
              >
                Message us on WhatsApp
              </a>{" "}
              — we’ll build a custom itinerary for you.
            </p>
          </div>
        )
      )}

      <div className="bk-field-group">
        <label className="bk-label">
          Group Type <span className="bk-label-req">*</span>
        </label>

        <div className="bk-chip-grid">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            const active = data.groupType === g.v;

            return (
              <button
                key={g.v}
                type="button"
                className={`bk-chip${active ? " bk-chip--active" : ""}`}
                onClick={() => {
                  set("groupType", g.v);
                  touch("groupType");
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Icon size={15} />
                {g.l}
                {active && (
                  <span className="bk-chip__check">
                    <Check size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {touched.groupType && errors.groupType && (
          <p className="bk-field-err">
            <AlertCircle size={13} /> {errors.groupType}
          </p>
        )}
      </div>
    </div>
  );
   }
