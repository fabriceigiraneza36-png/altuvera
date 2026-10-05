import React from "react";
import {
  Calendar, User, UsersRound, Minus, Plus, ClipboardList,
  Check, AlertCircle, Sparkles,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function Counter({ label, sub, icon: Icon, value, onChange, min = 0, max = 50 }) {
  return (
    <div className="bk-counter">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(236,253,245,0.9)",
            color: "#059669",
          }}
        >
          <Icon size={17} />
        </div>

        <div>
          <p className="bk-counter__lbl">{label}</p>
          <p className="bk-counter__sub">{sub}</p>
        </div>
      </div>

      <div className="bk-counter__ctrl">
        <button
          type="button"
          className="bk-counter__btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} />
        </button>

        <span className="bk-counter__val">{value}</span>

        <button
          type="button"
          className="bk-counter__btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Step2Trip({
  data,
  set,
  touch,
  errors,
  touched,
  DatePicker,
  DateRangeBar,
  makeQuickPicks,
  makeDepartureQuickPicks,
}) {
  const total = Number(data.adults) + Number(data.children);

  const toggleMonth = (month) => {
    const current = data.flexibleMonths || [];
    set(
      "flexibleMonths",
      current.includes(month)
        ? current.filter((x) => x !== month)
        : [...current, month]
    );
  };

  return (
    <div>
      <div className="bk-field-group">
        <label className="bk-label">
          Travel Dates <span className="bk-label-req">*</span>
        </label>

        <div className="bk-chip-grid">
          {[
            { val: false, lbl: "I have dates" },
            { val: true, lbl: "I'm flexible" },
          ].map((o) => (
            <button
              key={String(o.val)}
              type="button"
              onClick={() => set("flexibleDates", o.val)}
              className={`bk-chip${data.flexibleDates === o.val ? " bk-chip--active" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Calendar size={14} />
              {o.lbl}
              {data.flexibleDates === o.val && (
                <span className="bk-chip__check">
                  <Check size={11} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!data.flexibleDates ? (
        <div className="bk-field-group">
          {DatePicker && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <DatePicker
                label="Arrival"
                value={data.arrivalDate || data.startDate}
                onChange={(v) => {
                  set("startDate", v);
                  if (data.endDate && data.endDate <= v) set("endDate", "");
                  touch("startDate");
                }}
                placeholder="Choose arrival date"
                error={touched.startDate && errors.startDate}
                icon={<Calendar size={18} />}
                quickPicks={makeQuickPicks?.() || []}
              />
              <DatePicker
                label="Departure"
                value={data.departureDate || data.endDate}
                onChange={(v) => {
                  set("endDate", v);
                  touch("endDate");
                }}
                placeholder="Choose departure date"
                minDate={data.arrivalDate || data.startDate}
                error={touched.endDate && errors.endDate}
                icon={<Calendar size={18} />}
                quickPicks={makeDepartureQuickPicks?.(data.arrivalDate || data.startDate) || []}
              />

              <DateRangeBar
                arrivalDate={data.arrivalDate || data.startDate}
                departureDate={data.departureDate || data.endDate}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bk-field-group">
          <label className="bk-label">Preferred months</label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {MONTHS.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => toggleMonth(month)}
                className={`bk-month${data.flexibleMonths?.includes(month) ? " bk-month--active" : ""}`}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: data.flexibleMonths?.includes(month) ? "#ecfdf5" : "#fff",
                  color: data.flexibleMonths?.includes(month) ? "#059669" : "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>

          {touched.flexibleMonths && errors.flexibleMonths && (
            <p className="bk-field-err">
              <AlertCircle size={13} /> {errors.flexibleMonths}
            </p>
          )}
        </div>
      )}

      <div className="bk-field-group">
        <label className="bk-label">
          Travellers <span className="bk-label-req">*</span>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Counter
            label="Adults"
            sub="Age 18+"
            icon={User}
            value={Number(data.adults)}
            min={1}
            onChange={(v) => set("adults", v)}
          />

          <Counter
            label="Children"
            sub="Under 18"
            icon={UsersRound}
            value={Number(data.children)}
            min={0}
            max={20}
            onChange={(v) => set("children", v)}
          />
        </div>

        {total > 0 && (
          <p className="bk-hint" style={{ color: "#059669", fontWeight: 700 }}>
            <Sparkles size={12} style={{ display: "inline-block", marginRight: 4 }} />
            {total} traveller{total !== 1 ? "s" : ""} total
          </p>
        )}

        {touched.adults && errors.adults && (
          <p className="bk-field-err">
            <AlertCircle size={13} /> {errors.adults}
          </p>
        )}
      </div>

      <div className="bk-field-group">
        <label htmlFor="specialRequests" className="bk-label">
          <ClipboardList size={13} style={{ display: "inline-block", marginRight: 6 }} />
          Special Requests
        </label>

        <textarea
          id="specialRequests"
          value={data.specialRequests}
          onChange={(e) => set("specialRequests", e.target.value)}
          placeholder="Dietary needs, celebrations, accessibility, wildlife interests..."
          maxLength={500}
          className="bk-textarea"
          style={{ paddingLeft: 14 }}
        />

        <p className="bk-hint">
          Anything special we should know? ({data.specialRequests?.length || 0}/500)
        </p>
      </div>
    </div>
  );
    }
