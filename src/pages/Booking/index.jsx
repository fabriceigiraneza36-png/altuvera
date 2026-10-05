import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useSearchParams, useNavigate, Navigate, Link } from "react-router-dom";
import { MessageSquare, AlertCircle, Send } from "lucide-react";
import { BookingProvider, useBookingContext } from "./BookingContext";

const WA = "250785751391";
const HERO_IMG = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80&auto=format&fit=crop";

const BK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  :root {
    --sb-emerald: #059669;
    --sb-emerald-light: #10b981;
    --sb-mint: #ecfdf5;
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  const ID = "bk-v8-premium";
  if (document.getElementById(ID)) return;
  const s = document.createElement("style");
  s.id = ID;
  s.textContent = BK_CSS;
  document.head.appendChild(s);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const toStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const fmtS = (v) => (v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const fmtC = (v) => (v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");
const nights = (a, b) => (!a || !b ? 0 : Math.round((new Date(b) - new Date(a)) / 864e5));

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
  label, value, onChange, placeholder = "Select date",
  minDate = null, maxDate = null, error = false, icon = null, quickPicks = [],
}) {
  const [open, setOpen] = useState(false);
  const [vy, setVy] = useState(() => (value ? new Date(value) : new Date()).getFullYear());
  const [vm, setVm] = useState(() => (value ? new Date(value) : new Date()).getMonth());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dn = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const dk = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", dn);
    document.addEventListener("keydown", dk);
    return () => {
      document.removeEventListener("mousedown", dn);
      document.removeEventListener("keydown", dk);
    };
  }, [open]);

  const tod = new Date(); tod.setHours(0,0,0,0);
  const minD = minDate ? new Date(minDate) : tod; minD.setHours(0,0,0,0);
  const maxD = maxDate ? new Date(maxDate) : null; if (maxD) maxD.setHours(0,0,0,0);

  const fd = new Date(vy, vm, 1).getDay();
  const dim = new Date(vy, vm + 1, 0).getDate();
  const canP = new Date(vy, vm, 1) > minD;
  const canN = !maxD || new Date(vy, vm + 1, 1) <= maxD;

  const prev = () => vm === 0 ? (setVm(11), setVy((y) => y - 1)) : setVm((m) => m - 1);
  const next = () => vm === 11 ? (setVm(0), setVy((y) => y + 1)) : setVm((m) => m + 1);
  const pick = (day) => { onChange(toStr(vy, vm, day)); setOpen(false); };
  const dis = (day) => { const d = new Date(vy, vm, day); d.setHours(0,0,0,0); return d < minD || (maxD && d > maxD); };
  const isT = (day) => vy === tod.getFullYear() && vm === tod.getMonth() && day === tod.getDate();
  const isS = (day) => {
    if (!value) return false;
    const s = new Date(value);
    return vy === s.getFullYear() && vm === s.getMonth() && day === s.getDate();
  };

  return (
    <div className="bk-dp" ref={ref} style={{ position: "relative" }}>
      <button type="button" style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "10px", width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => setOpen(p => !p)}>
        {value ? fmtS(value) : placeholder}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 100, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700 }}>{MONTHS[vm]} {vy}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="button" onClick={prev} disabled={!canP} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}>←</button>
              <button type="button" onClick={next} disabled={!canN} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer" }}>→</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center", marginBottom: "12px" }}>
            {WDS.map(w => <span key={w} style={{ fontSize: "11px", fontWeight: 700 }}>{w}</span>)}
            {Array.from({ length: fd }).map((_, i) => <span key={`e-${i}`} />)}
            {Array.from({ length: dim }).map((_, i) => {
              const day = i + 1;
              const disabled = dis(day);
              return (
                <button key={day} type="button" disabled={disabled} onClick={() => !disabled && pick(day)} style={{
                  aspect: "1", border: "none", background: isS(day) ? "#059669" : isT(day) ? "#d1fae5" : "transparent",
                  color: isS(day) ? "white" : disabled ? "#d1d5db" : "#111827",
                  fontSize: "12px", fontWeight: 600, borderRadius: "6px", cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.35 : 1,
                }}>
                  {day}
                </button>
              );
            })}
          </div>
          {quickPicks.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
              {quickPicks.map(qp => (
                <button key={qp.label} type="button" onClick={() => { onChange(qp.value); setOpen(false); }} style={{
                  fontSize: "11px", fontWeight: 700, padding: "6px 12px", borderRadius: "6px",
                  border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer"
                }}>
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

function BookingPage() {
  useEffect(injectStyles, []);
  const form = useBookingContext();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#f8fafc", color: "#0f172a", minHeight: "100vh" }}>
      <header style={{ position: "relative", height: "clamp(280px, 30vw, 420px)", backgroundColor: "#022c22", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={HERO_IMG} alt="Safari" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,44,34,0.4) 0%, rgba(15,23,42,0.9) 100%)", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "800px", padding: "0 24px" }}>
          <h1 style={{ fontSize: "clamp(28px, 4.5vw, 54px)", fontWeight: 400, color: "#fff", marginBottom: "12px" }}>
            Tailor-Made Safaris Crafted For You
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: "rgba(255,255,255,0.7)", maxWidth: "580px", margin: "0 auto", lineHeight: 1.6 }}>
            Enquire today with zero upfront payment. Our experienced local specialists will craft your perfect custom itinerary.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(2, 44, 34, 0.08)", overflow: "hidden" }}>
          <div style={{ padding: "40px", background: "rgba(248,250,252,0.45)" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "32px" }}>
              Plan Your African Odyssey
            </h2>
            <form style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", marginBottom: "6px" }}>Destination</label>
                <input type="text" placeholder="Where to?" style={{ width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", outline: "none" }} />
              </div>
              <BkDatePicker label="Arrival Date" placeholder="Select arrival" quickPicks={makeQuickPicks()} />
              <BkDatePicker label="Departure Date" placeholder="Select departure" quickPicks={[]} />
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a", marginBottom: "6px" }}>Guests</label>
                <input type="number" min="1" defaultValue="2" style={{ width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", outline: "none" }} />
              </div>
              <button type="submit" style={{ background: "#059669", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(5,150,105,0.2)", alignSelf: "flex-end" }}>
                Search
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Booking() {
  return (
    <BookingProvider>
      <BookingPage />
    </BookingProvider>
  );
}
