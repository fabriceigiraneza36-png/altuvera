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

  const prev = () => vm === 0 ? (setVm(11), setVy((y) => y - 1)) : setVm((m) => m - 1);
  const next = () => vm === 11 ? (setVm(0), setVy((y) => y + 1)) : setVm((m) => m + 1);
  const pick = (day) => { onChange(toStr(vy, vm, day)); setOpen(false); };
  const dis = (day) => {
    const d = new Date(vy, vm, day);
    d.setHours(0, 0, 0, 0);
    return d < minD || (maxD && d > maxD);
  };
  const isT = (day) => vy === tod.getFullYear() && vm === tod.getMonth() && day === tod.getDate();

  const isS = (day) => {
    if (!value) return false;
    const s = new Date(value);
    if (Number.isNaN(s.getTime())) return false;
    return vy === s.getFullYear() && vm === s.getMonth() && day === s.getDate();
  };

  return (
    <div className="bk-dp" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        className={`bk-input ${error ? "bk-input--err" : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {icon || <Calendar size={18} />}
          <span>
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--sb-slate-gray)",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
            <span
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginTop: "2px",
              }}
            >
              {value ? fmtS(value) : placeholder}
            </span>
          </span>
        </span>
        <ChevronRight size={16} style={{ color: "var(--sb-slate-light)" }} />
      </button>

      {open && (
        <div className="bk-cal">
          <div className="bk-cal__hdr">
            <button type="button" className="bk-cal__nav" onClick={prev} disabled={!canP}>
              <ChevronLeft size={14} />
            </button>
            <span className="bk-cal__month">{MONTHS[vm]} {vy}</span>
            <button type="button" className="bk-cal__nav" onClick={next} disabled={!canN}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="bk-cal__wds">
            {WDS.map((w) => <span key={w}>{w}</span>)}
          </div>

          <div className="bk-cal__grid">
            {Array.from({ length: fd }).map((_, i) => <span key={`e-${i}`} />)}
            {Array.from({ length: dim }).map((_, i) => {
              const day = i + 1;
              const disabled = dis(day);
              let classes = "bk-cal__day";
              if (isT(day)) classes += " bk-cal__day--today";
              if (isS(day)) classes += " bk-cal__day--sel";
              return (
                <button
                  key={day}
                  type="button"
                  className={classes}
                  disabled={disabled}
                  onClick={() => !disabled && pick(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {quickPicks.length > 0 && (
            <div className="bk-cal__quick">
              {quickPicks.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  className="bk-cal__qbtn"
                  onClick={() => {
                    onChange(qp.value);
                    setOpen(false);
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
});        <div>
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
