// src/pages/Booking/steps/Step1Destination.jsx
import React, { useMemo } from "react";
import {
  HiGlobe, HiLocationMarker, HiCheck, HiExclamationCircle,
  HiUser, HiUserGroup, HiUsers, HiOfficeBuilding, HiHeart, HiSparkles,
} from "react-icons/hi";

const GROUPS = [
  { v: "solo",      l: "Solo",      icon: HiUser         },
  { v: "couple",    l: "Couple",    icon: HiHeart        },
  { v: "family",    l: "Family",    icon: HiUserGroup    },
  { v: "friends",   l: "Friends",   icon: HiUsers        },
  { v: "corporate", l: "Corporate", icon: HiOfficeBuilding },
  { v: "honeymoon", l: "Honeymoon", icon: HiSparkles     },
];

export default function Step1Destination({
  data, set, touch, errors, touched,
  countriesList, destinationsList,
}) {
  const filtered = useMemo(() => {
    if (!data.countryId) return [];
    const byId = destinationsList.filter(
      d => String(d.countryId) === String(data.countryId),
    );
    if (byId.length) return byId;
    const country = countriesList.find(c => String(c.value) === String(data.countryId));
    const name = (country?.label || "").trim().toLowerCase();
    if (!name) return [];
    return destinationsList.filter(
      d => String(d.country || "").trim().toLowerCase() === name,
    );
  }, [destinationsList, countriesList, data.countryId]);

  const selectedDest = useMemo(
    () => filtered.find(d => String(d.value) === String(data.destinationId)) || null,
    [filtered, data.destinationId],
  );

  return (
    <div>
      {/* Country select */}
      <div className="bk-field-group">
        <label htmlFor="countryId" className="bk-label">
          Destination Country <span className="bk-label-req">*</span>
        </label>
        <div className="bk-input-wrap">
          <span className="bk-input-ico"><HiGlobe size={17} /></span>
          <select
            id="countryId"
            value={data.countryId}
            onChange={e => { set("countryId", e.target.value); set("destinationId", ""); }}
            onBlur={() => touch("countryId")}
            className={`bk-select${touched.countryId && errors.countryId ? " bk-input--err" : ""}`}
          >
            <option value="">— Select a country —</option>
            {countriesList.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        {touched.countryId && errors.countryId && (
          <p className="bk-field-err">
            <HiExclamationCircle size={13} /> {errors.countryId}
          </p>
        )}
      </div>

      {/* Destination cards */}
      {data.countryId && (
        filtered.length > 0 ? (
          <div className="bk-field-group">
            <label className="bk-label">
              Specific Destination <span className="bk-label-req">*</span>
            </label>
            <div className="bk-dest-grid">
              {filtered.map(d => {
                const active = data.destinationId === d.value;
                return (
                  <button
                    key={d.value} type="button"
                    className={`bk-dest-card${active ? " bk-dest-card--active" : ""}`}
                    onClick={() => { set("destinationId", d.value); touch("destinationId"); }}
                  >
                    {d.image ? (
                      <img src={d.image} alt={d.label} loading="lazy"
                        className="bk-dest-card__img" />
                    ) : (
                      <div className="bk-dest-card__img">
                        <HiLocationMarker size={28} />
                      </div>
                    )}
                    <div className="bk-dest-card__body">
                      <p className="bk-dest-card__name">{d.label}</p>
                      {d.country && (
                        <p className="bk-dest-card__ctry">
                          <HiLocationMarker size={10} /> {d.country}
                        </p>
                      )}
                    </div>
                    {active && (
                      <div className="bk-dest-card__badge">
                        <HiCheck size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {touched.destinationId && errors.destinationId && (
              <p className="bk-field-err">
                <HiExclamationCircle size={13} /> {errors.destinationId}
              </p>
            )}

            {selectedDest && (
              <div className="bk-selected">
                <div className="bk-selected__img">
                  {selectedDest.image ? (
                    <img src={selectedDest.image} alt={selectedDest.label} />
                  ) : (
                    <HiLocationMarker size={22} />
                  )}
                </div>
                <div className="bk-selected__body">
                  <p className="bk-selected__tag">
                    <HiCheck size={11} /> Selected
                  </p>
                  <p className="bk-selected__name">{selectedDest.label}</p>
                  {data.attractionName && (
                    <p className="bk-selected__ctry">Attraction: {data.attractionName}</p>
                  )}
                  {selectedDest.country && (
                    <p className="bk-selected__ctry">{selectedDest.country}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: "14px 16px", borderRadius: 14,
            background: "#fefce8", border: "1.5px solid #fde047",
            marginBottom: 22,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#854d0e", marginBottom: 4 }}>
              No destinations listed yet
            </p>
            <p style={{ fontSize: 12, color: "#a16207" }}>
              <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--g)", fontWeight: 700 }}>
                Message us on WhatsApp
              </a>
              {" "}— we'll build a custom itinerary for you.
            </p>
          </div>
        )
      )}

      {/* Group type chips */}
      <div className="bk-field-group">
        <label className="bk-label">
          Group Type <span className="bk-label-req">*</span>
        </label>
        <div className="bk-chip-grid">
          {GROUPS.map(g => {
            const Icon = g.icon;
            const active = data.groupType === g.v;
            return (
              <button
                key={g.v} type="button"
                className={`bk-chip${active ? " bk-chip--active" : ""}`}
                onClick={() => { set("groupType", g.v); touch("groupType"); }}
              >
                <Icon size={15} />
                {g.l}
                {active && (
                  <span className="bk-chip__check">
                    <HiCheck size={11} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {touched.groupType && errors.groupType && (
          <p className="bk-field-err">
            <HiExclamationCircle size={13} /> {errors.groupType}
          </p>
        )}
      </div>
    </div>
  );
}