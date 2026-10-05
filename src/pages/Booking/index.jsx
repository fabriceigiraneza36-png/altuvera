import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import SEO from "../../components/common/SEO";
import PageHeader from "../../components/common/PageHeader";

const BK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bk-emerald: #059669;
    --bk-mint: #ecfdf5;
    --bk-gray: #e5e7eb;
  }

  .bk-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .bk-input {
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 10px 14px;
    border: 1px solid var(--bk-gray);
    border-radius: 10px;
    font-size: 14px;
  }

  .bk-input:focus {
    outline: none;
    border-color: var(--bk-emerald);
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;

  const ID = "bk-v8-styles";
  if (document.getElementById(ID)) return;

  const style = document.createElement("style");
  style.id = ID;
  style.textContent = BK_CSS;
  document.head.appendChild(style);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WDS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const fmtS = (v) => (v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

const makeQuickPicks = (base = null) => {
  const d = base ? new Date(base) : new Date();
  const add = (n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return toStr(r.getFullYear(), r.getMonth(), r.getDate());
  };

  return [
    { label: "1 week", value: add(7) },
    { label: "2 weeks", value: add(14) },
    { label: "1 month", value: add(30) },
  ];
};

const makeDepartureQuickPicks = (arrival) => {
  if (!arrival) return [];
  const d = new Date(arrival);
  const add = (n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return toStr(r.getFullYear(), r.getMonth(), r.getDate());
  };

  return [
    { label: "5 nights", value: add(5) },
    { label: "7 nights", value: add(7) },
    { label: "10 nights", value: add(10) },
    { label: "14 nights", value: add(14) },
  ];
};

const BkDatePicker = React.memo(function BkDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate = null,
  maxDate = null,
  quickPicks = [],
}) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(() => (value ? new Date(value) : new Date()).getFullYear());
  const [vm, setVm] = useState(() => (value ? new Date(value) : new Date()).getMonth());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };

    const handleKeyEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyEscape);
    };
  }, [open]);

  const tod = new Date();
  tod.setHours(0, 0, 0, 0);

  const minD = minDate ? new Date(minDate) : tod;
  minD.setHours(0, 0, 0, 0);

  const maxD = maxDate ? new Date(maxDate) : null;
  if (maxD) maxD.setHours(0, 0, 0, 0);

  const fd = new Date(vy, vm, 1).getDay();
  const dim = new Date(vy, vm + 1, 0).getDate();
  const canP = new Date(vy, vm, 1) > minD;
  const canN = !maxD || new Date(vy, vm + 1, 1) <= maxD;

  const prev = () => (vm === 0 ? (setVm(11), setVy((y) => y - 1)) : setVm((m) => m - 1));
  const next = () => (vm === 11 ? (setVm(0), setVy((y) => y + 1)) : setVm((m) => m + 1));

  const pick = (day) => {
    onChange(toStr(vy, vm, day));
    setOpen(false);
  };

  const dis = (day) => {
    const d = new Date(vy, vm, day);
    d.setHours(0, 0, 0, 0);
    return d < minD || (maxD && d > maxD);
  };

  const isToday = (day) => vy === tod.getFullYear() && vm === tod.getMonth() && day === tod.getDate();

  const isSelected = (day) => {
    if (!value) return false;
    const s = new Date(value);
    if (Number.isNaN(s.getTime())) return false;
    return vy === s.getFullYear() && vm === s.getMonth() && day === s.getDate();
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#4B5563", textTransform: "uppercase" }}>
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="bk-input"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
          background: "white",
        }}
      >
        <span style={{ fontSize: 14, color: value ? "#111827" : "#9CA3AF" }}>
          {value ? fmtS(value) : placeholder}
        </span>
        <FiChevronDown size={16} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "white",
            border: "1px solid var(--bk-gray)",
            borderRadius: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#111827" }}>
              {MONTHS[vm]} {vy}
            </h4>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={prev}
                disabled={!canP}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid var(--bk-gray)",
                  borderRadius: 6,
                  background: "white",
                  cursor: canP ? "pointer" : "not-allowed",
                  opacity: canP ? 1 : 0.5,
                }}
              >
                ←
              </button>

              <button
                type="button"
                onClick={next}
                disabled={!canN}
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid var(--bk-gray)",
                  borderRadius: 6,
                  background: "white",
                  cursor: canN ? "pointer" : "not-allowed",
                  opacity: canN ? 1 : 0.5,
                }}
              >
                →
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center", marginBottom: 12 }}>
            {WDS.map((d) => (
              <span key={d} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", padding: 4 }}>
                {d}
              </span>
            ))}

            {Array.from({ length: fd }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {Array.from({ length: dim }).map((_, i) => {
              const day = i + 1;
              const disabled = dis(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && pick(day)}
                  style={{
                    aspect: "1",
                    border: "none",
                    borderRadius: 6,
                    background: isSelected(day) ? "#059669" : isToday(day) ? "#d1fae5" : "transparent",
                    color: isSelected(day) ? "white" : disabled ? "#d1d5db" : "#111827",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {quickPicks.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--bk-gray)", flexWrap: "wrap" }}>
              {quickPicks.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => {
                    onChange(qp.value);
                    setOpen(false);
                  }}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--bk-gray)",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default function Booking() {
  const [destination, setDestination] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    injectStyles();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ destination, arrival, departure, guests });
  };

  return (
    <>
      <SEO
        title="Book Your Adventure | Altuvera"
        description="Plan and book your perfect Rwanda getaway"
        image="/og-image.jpg"
      />

      <PageHeader
        title="Book Your Journey"
        subtitle="Find and reserve your perfect Rwandan experience"
      />

      <div style={{ padding: "60px 24px", background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)" }}>
        <div className="bk-container">
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: "center", color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Plan Your Perfect Escape
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", marginBottom: 6 }}>
                Destination
              </label>
              <input
                type="text"
                placeholder="Where to?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bk-input"
                style={{ width: "100%" }}
              />
            </div>

            <BkDatePicker
              label="Arrival Date"
              value={arrival}
              onChange={setArrival}
              placeholder="Check-in"
              quickPicks={makeQuickPicks()}
            />

            <BkDatePicker
              label="Departure Date"
              value={departure}
              onChange={setDeparture}
              placeholder="Check-out"
              minDate={arrival}
              quickPicks={makeDepartureQuickPicks(arrival)}
            />

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", marginBottom: 6 }}>
                Guests
              </label>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                className="bk-input"
                style={{ width: "100%" }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 28px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(5,150,105,0.2)",
                alignSelf: "flex-end",
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
