import React from "react";
import { HiCalendar, HiUserGroup, HiChatAlt2, HiMinus, HiPlus } from "react-icons/hi";
import { TextareaField } from "../components/FormComponents";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Counter({ label, sub, value, onChange, min = 0, max = 50 }) {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-gray-50/50
                    rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center
                     text-gray-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={`Decrease ${label}`}>
          <HiMinus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-base font-bold text-gray-900 tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center
                     text-gray-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={`Increase ${label}`}>
          <HiPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function Step2Trip({ data, set, touch, errors, touched }) {
  const today = new Date().toISOString().split("T")[0];
  const total = Number(data.adults) + Number(data.children);
  const nights = data.startDate && data.endDate
    ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / 864e5) : 0;

  const toggle = (m) => {
    const c = data.flexibleMonths || [];
    set("flexibleMonths", c.includes(m) ? c.filter(x => x !== m) : [...c, m]);
  };

  return (
    <div className="space-y-5">
      {/* Dates */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Travel Dates <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: false, lbl: "I have dates" },
            { val: true,  lbl: "I'm flexible" },
          ].map(o => (
            <button key={String(o.val)} type="button"
              onClick={() => set("flexibleDates", o.val)}
              className={`h-11 rounded-xl border-2 text-sm font-semibold transition-all
                ${data.flexibleDates === o.val
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
              {o.lbl}
            </button>
          ))}
        </div>

        {!data.flexibleDates ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { lbl: "Departure",      id: "startDate", min: today },
              { lbl: "Return (opt.)",  id: "endDate",   min: data.startDate || today },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-[11px] font-semibold text-gray-500 mb-1">
                  {f.lbl}
                </label>
                <div className="relative">
                  <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input id={f.id} type="date" value={data[f.id]} min={f.min}
                    onChange={(e) => set(f.id, e.target.value)} onBlur={() => touch(f.id)}
                    className={`w-full h-11 pl-10 pr-3 rounded-xl border-2 bg-gray-50/50 text-gray-900 text-sm
                      outline-none transition-all focus:ring-4 focus:ring-emerald-100
                      ${touched[f.id] && errors[f.id]
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-emerald-500 hover:border-gray-300"}`}/>
                </div>
                {touched[f.id] && errors[f.id] && (
                  <p className="mt-1 text-[11px] text-red-500">{errors[f.id]}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-gray-500 mb-2">
              Preferred months
              {touched.flexibleMonths && errors.flexibleMonths &&
                <span className="ml-2 text-red-500">{errors.flexibleMonths}</span>}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {MONTHS.map(m => (
                <button key={m} type="button" onClick={() => toggle(m)}
                  className={`h-9 rounded-lg border-2 text-[11px] font-bold transition-all
                    ${data.flexibleMonths?.includes(m)
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}>
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {nights > 0 && (
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <HiCalendar className="w-3.5 h-3.5" />
            {nights} night{nights !== 1 ? "s" : ""} planned
          </p>
        )}
      </div>

      {/* Travelers */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Travelers <span className="text-red-500 ml-0.5">*</span>
          {touched.adults && errors.adults && (
            <span className="ml-2 text-red-500 text-xs font-normal">{errors.adults}</span>
          )}
        </label>
        <Counter label="Adults" sub="Age 18+" value={Number(data.adults)} min={1} onChange={v => set("adults", v)} />
        <Counter label="Children" sub="Under 18" value={Number(data.children)} min={0} max={20} onChange={v => set("children", v)} />
        {total > 0 && (
          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <HiUserGroup className="w-3.5 h-3.5" />
            {total} traveler{total !== 1 ? "s" : ""} total
          </p>
        )}
      </div>

      {/* Special requests */}
      <TextareaField
        id="specialRequests"
        label="Special Requests"
        value={data.specialRequests}
        onChange={(v) => set("specialRequests", v)}
        placeholder="Dietary needs, celebrations, accessibility, wildlife interests..."
        maxLength={500}
        hint="Anything special we should know?"
      />
    </div>
  );
}