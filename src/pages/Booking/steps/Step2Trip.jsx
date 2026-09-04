// src/pages/Booking/steps/Step2Trip.jsx
import React from "react";
import {
  HiCalendar, HiUserGroup, HiMinus, HiPlus, HiUser, HiHeart,
  HiClipboardList, HiCheck, HiExclamationCircle, HiSparkles,
} from "react-icons/hi";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Counter({ label, sub, icon: Icon, value, onChange, min = 0, max = 50 }) {
  return (
    <div className="bk-counter">
      <div className="bk-counter__info">
        <div className="bk-counter__icn"><Icon size={17} /></div>
        <div>
          <p className="bk-counter__lbl">{label}</p>
          <p className="bk-counter__sub">{sub}</p>
        </div>
      </div>
      <div className="bk-counter__ctrl">
        <button type="button" className="bk-counter__btn"
          onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          aria-label={`Decrease ${label}`}>
          <HiMinus size={14} />
        </button>
        <span className="bk-counter__val">{value}</span>
        <button type="button" className="bk-counter__btn"
          onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          aria-label={`Increase ${label}`}>
          <HiPlus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Step2Trip({
  data, set, touch, errors, touched,
  DatePicker, DateRangeBar, makeQuickPicks, makeDepartureQuickPicks,
}) {
  const total = Number(data.adults) + Number(data.children);

  const toggleMonth = m => {
    const c = data.flexibleMonths || [];
    set("flexibleMonths", c.includes(m) ? c.filter(x => x !== m) : [...c, m]);
  };

  return (
    <div>
      {/* Date mode toggle */}
      <div className="bk-field-group">
        <label className="bk-label">
          Travel Dates <span className="bk-label-req">*</span>
        </label>
        <div className="bk-chip-grid">
          {[
            { val: false, lbl: "I have dates" },
            { val: true,  lbl: "I'm flexible" },
          ].map(o => (
            <button key={String(o.val)} type="button"
              onClick={() => set("flexibleDates", o.val)}
              className={`bk-chip${data.flexibleDates === o.val ? " bk-chip--active" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}>
              <HiCalendar size={14} />
              {o.lbl}
              {data.flexibleDates === o.val && (
                <span className="bk-chip__check"><HiCheck size={11} /></span>
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
                onChange={v => { set("arrivalDate", v); set("startDate", v); }}
                placeholder="Choose arrival date"
                error={touched.arrivalDate && errors.arrivalDate}
                icon={<HiCalendar size={18} />}
                quickPicks={makeQuickPicks?.() || []}
              />
              <DatePicker
                label="Departure"
                value={data.departureDate || data.endDate}
                onChange={v => { set("departureDate", v); set("endDate", v); }}
                placeholder="Choose departure date"
                minDate={data.arrivalDate || data.startDate}
                error={touched.departureDate && errors.departureDate}
                icon={<HiCalendar size={18} />}
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
          <div className="bk-months">
            {MONTHS.map(m => (
              <button key={m} type="button"
                onClick={() => toggleMonth(m)}
                className={`bk-month${data.flexibleMonths?.includes(m) ? " bk-month--active" : ""}`}>
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
          {touched.flexibleMonths && errors.flexibleMonths && (
            <p className="bk-field-err">
              <HiExclamationCircle size={13} /> {errors.flexibleMonths}
            </p>
          )}
        </div>
      )}

      {/* Travelers */}
      <div className="bk-field-group">
        <label className="bk-label">
          Travellers <span className="bk-label-req">*</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Counter label="Adults" sub="Age 18+" icon={HiUser}
            value={Number(data.adults)} min={1}
            onChange={v => set("adults", v)} />
          <Counter label="Children" sub="Under 18" icon={HiUserGroup}
            value={Number(data.children)} min={0} max={20}
            onChange={v => set("children", v)} />
        </div>
        {total > 0 && (
          <p className="bk-hint" style={{ color: "var(--g)", fontWeight: 700 }}>
            <HiSparkles size={12} />
            {total} traveller{total !== 1 ? "s" : ""} total
          </p>
        )}
        {touched.adults && errors.adults && (
          <p className="bk-field-err">
            <HiExclamationCircle size={13} /> {errors.adults}
          </p>
        )}
      </div>

      {/* Special requests */}
      <div className="bk-field-group">
        <label htmlFor="specialRequests" className="bk-label">
          <HiClipboardList size={13} /> Special Requests
        </label>
        <textarea
          id="specialRequests"
          value={data.specialRequests}
          onChange={e => set("specialRequests", e.target.value)}
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