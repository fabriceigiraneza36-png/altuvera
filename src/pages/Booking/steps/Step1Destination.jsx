import React, { useMemo } from "react";
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

  return (
    <div>
      <div className="bk-field-group">
        <label htmlFor="countryId" className="bk-label">
          Destination Country <span className="bk-label-req">*</span>
        </label>

        <div className="bk-input-wrap">
          <span className="bk-input-ico">
            <Globe size={17} />
          </span>

          <select
            id="countryId"
            value={data.countryId}
            onChange={(e) => {
              set("countryId", e.target.value);
              set("destinationId", "");
            }}
            onBlur={() => touch("countryId")}
            className={`bk-select${touched.countryId && errors.countryId ? " bk-input--err" : ""}`}
          >
            <option value="">— Select a country —</option>
            {countriesList.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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

            <div className="bk-dest-grid">
              {filtered.map((d) => {
                const active = data.destinationId === d.value;

                return (
                  <button
                    key={d.value}
                    type="button"
                    className={`bk-dest-card${active ? " bk-dest-card--active" : ""}`}
                    onClick={() => {
                      set("destinationId", d.value);
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
            </div>

            {touched.destinationId && errors.destinationId && (
              <p className="bk-field-err">
                <AlertCircle size={13} /> {errors.destinationId}
              </p>
            )}

            {selectedDest && (
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
