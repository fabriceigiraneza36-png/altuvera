import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Counter({ label, sub, value, onChange, min = 0, max = 50 }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 lg:py-3.5
                    bg-white rounded-xl border-2 border-gray-100
                    hover:border-emerald-200 transition-colors">
      <div>
        <p className="text-sm lg:text-base font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center
                     text-gray-500 hover:border-emerald-700 hover:text-emerald-800
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={`Decrease ${label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <span className="w-7 text-center text-lg font-extrabold text-emerald-950 tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center
                     text-gray-500 hover:border-emerald-700 hover:text-emerald-800
                     disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label={`Increase ${label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function Step2Travel({ data, set, touch, errors, touched, displayName, onNext, onBack }) {
  const today = new Date().toISOString().split("T")[0];
  const total = Number(data.adults) + Number(data.children);
  const nights = data.startDate && data.endDate
    ? Math.round((new Date(data.endDate) - new Date(data.startDate)) / 864e5) : 0;

  const toggle = m => {
    const c = data.flexibleMonths || [];
    set("flexibleMonths", c.includes(m) ? c.filter(x => x !== m) : [...c, m]);
  };

  return (
    <StepShell stepKey="travel"
      icon={<CalIcon />}
      heading="Tell us about your trip"
      subheading={`${displayName ? `${displayName}, w` : "W"}hen and how many? Any special requests?`}
      onNext={onNext} onBack={onBack}>

      {/* 1. Dates */}
      <div>
        <p className="block text-sm lg:text-base font-semibold text-emerald-950 mb-2">
          Travel Dates
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { val: false, lbl: "Specific",  sub: "I have dates" },
            { val: true,  lbl: "Flexible",  sub: "Any time" },
          ].map(o => (
            <button key={String(o.val)} type="button" onClick={() => set("flexibleDates", o.val)}
              className={`p-3 rounded-xl border-2 text-left transition-all
                ${data.flexibleDates === o.val
                  ? "border-emerald-700 bg-emerald-50 shadow-md shadow-emerald-900/10"
                  : "border-gray-200 bg-white hover:border-emerald-300 hover:-translate-y-0.5"}`}>
              <p className={`text-sm font-bold ${data.flexibleDates === o.val ? "text-emerald-900" : "text-gray-800"}`}>
                {o.lbl}
              </p>
              <p className="text-xs text-gray-400">{o.sub}</p>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!data.flexibleDates ? (
            <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="grid sm:grid-cols-2 gap-3">
              {[
                { lbl: "Departure",         id: "startDate", min: today },
                { lbl: "Return (optional)", id: "endDate",   min: data.startDate || today },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-gray-600 mb-1">{f.lbl}</label>
                  <input id={f.id} type="date" value={data[f.id]} min={f.min}
                    onChange={e => set(f.id, e.target.value)} onBlur={() => touch(f.id)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-gray-900 text-sm font-medium
                      outline-none transition-all focus:ring-4 focus:ring-emerald-900/10
                      ${touched[f.id] && errors[f.id]
                        ? "border-red-300 bg-red-50/50"
                        : "border-gray-200 bg-white focus:border-emerald-700 hover:border-gray-300"}`}/>
                  {touched[f.id] && errors[f.id] && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{errors[f.id]}</p>
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="f" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Preferred months
                {touched.flexibleMonths && errors.flexibleMonths &&
                  <span className="ml-2 text-red-500">{errors.flexibleMonths}</span>}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {MONTHS.map(m => (
                  <button key={m} type="button" onClick={() => toggle(m)}
                    className={`py-2 rounded-lg border-2 text-[11px] font-bold transition-all
                      ${data.flexibleMonths?.includes(m)
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {nights > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-2 text-xs font-bold text-emerald-800">
            {nights} night{nights !== 1 ? "s" : ""} planned
          </motion.div>
        )}
      </div>

      {/* 2. Travelers */}
      <div>
        <p className="block text-sm lg:text-base font-semibold text-emerald-950 mb-2">
          Number of Travelers
          {touched.adults && errors.adults &&
            <span className="ml-2 text-red-500 text-xs">{errors.adults}</span>}
        </p>
        <div className="space-y-2">
          <Counter label="Adults" sub="Age 18+" value={Number(data.adults)} min={1} onChange={v => set("adults", v)} />
          <Counter label="Children" sub="Under 18" value={Number(data.children)} min={0} max={20} onChange={v => set("children", v)} />
        </div>
        {total > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-2 text-xs font-bold text-emerald-800">
            {total} traveler{total !== 1 ? "s" : ""} total
          </motion.div>
        )}
      </div>

      {/* 3. Special requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm lg:text-base font-semibold text-emerald-950 mb-1.5">
          Anything special?
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea id="specialRequests" value={data.specialRequests}
          onChange={e => set("specialRequests", e.target.value)}
          rows={3} placeholder="Dietary needs, accessibility, celebrations, wildlife interests..."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
            focus:border-emerald-700 focus:ring-4 focus:ring-emerald-900/10
            outline-none text-sm text-gray-900 resize-none placeholder-gray-300
            bg-white hover:border-gray-300 transition-all"/>
      </div>
    </StepShell>
  );
}