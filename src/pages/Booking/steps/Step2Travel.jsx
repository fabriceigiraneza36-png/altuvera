import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

const MONTHS = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December",
];

export default function Step2Travel({
  data, set, touch, errors, touched, displayName, onNext, onBack,
}) {
  const today = new Date().toISOString().split("T")[0];

  const toggleMonth = m => {
    const curr = data.flexibleMonths || [];
    set("flexibleMonths",
      curr.includes(m) ? curr.filter(x => x !== m) : [...curr, m]);
  };

  const nights =
    data.startDate && data.endDate
      ? Math.round(
          (new Date(data.endDate) - new Date(data.startDate))
          / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <StepShell
      stepKey="travel"
      heading="When should we plan this?"
      subheading={`${displayName ? `${displayName}, do` : "Do"} you have specific dates, or are you flexible?`}
      onNext={onNext}
      onBack={onBack}
    >
      {/* Toggle */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { val: false, label: "Specific Dates",
            sub: "I know when I'm going",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" className="w-5 h-5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
            )},
          { val: true, label: "Flexible",
            sub: "Open to suggestions",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" className="w-5 h-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
            )},
        ].map(opt => (
          <button key={String(opt.val)} type="button"
            onClick={() => set("flexibleDates", opt.val)}
            className={`
              p-4 rounded-2xl border-2 text-left transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
              ${data.flexibleDates === opt.val
                ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50"
                : "border-gray-200 bg-white hover:border-emerald-200 hover:-translate-y-0.5"}
            `}
          >
            <span className={`mb-2 block ${data.flexibleDates === opt.val
              ? "text-emerald-500" : "text-gray-400"}`}>
              {opt.icon}
            </span>
            <p className="text-sm font-bold text-gray-800">{opt.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!data.flexibleDates ? (
          <motion.div
            key="specific"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Departure */}
            <div>
              <label htmlFor="startDate"
                className="block text-sm font-semibold text-gray-700 mb-1.5">
                Departure Date
              </label>
              <input
                id="startDate" type="date"
                value={data.startDate} min={today}
                onChange={e => set("startDate", e.target.value)}
                onBlur={() => touch("startDate")}
                className={`
                  w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900
                  text-base font-medium outline-none transition-all duration-200
                  focus:ring-4 focus:ring-emerald-100/60
                  ${touched.startDate && errors.startDate
                    ? "border-red-300 bg-red-50/60"
                    : "border-gray-200 bg-white focus:border-emerald-400 hover:border-gray-300"}
                `}
              />
              {touched.startDate && errors.startDate && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 font-medium">
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* Return */}
            <div>
              <label htmlFor="endDate"
                className="block text-sm font-semibold text-gray-700 mb-1.5">
                Return Date
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                id="endDate" type="date"
                value={data.endDate}
                min={data.startDate || today}
                onChange={e => set("endDate", e.target.value)}
                onBlur={() => touch("endDate")}
                className={`
                  w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900
                  text-base font-medium outline-none transition-all duration-200
                  focus:ring-4 focus:ring-emerald-100/60
                  ${touched.endDate && errors.endDate
                    ? "border-red-300 bg-red-50/60"
                    : "border-gray-200 bg-white focus:border-emerald-400 hover:border-gray-300"}
                `}
              />
              {touched.endDate && errors.endDate && (
                <p role="alert" className="mt-1.5 text-xs text-red-500 font-medium">
                  {errors.endDate}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="flexible"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Which months might work?
              {touched.flexibleMonths && errors.flexibleMonths && (
                <span className="ml-2 text-red-500 text-xs font-normal">
                  {errors.flexibleMonths}
                </span>
              )}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MONTHS.map(m => {
                const on = data.flexibleMonths?.includes(m);
                return (
                  <button key={m} type="button" onClick={() => toggleMonth(m)}
                    className={`
                      py-2.5 rounded-xl border-2 text-xs font-bold
                      transition-all duration-150 focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-emerald-400
                      ${on
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600"}
                    `}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration pill */}
      {nights > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-emerald-50 border
                     border-emerald-100 rounded-2xl px-4 py-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-4 h-4 text-emerald-500 flex-shrink-0"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
          </svg>
          <p className="text-sm font-bold text-emerald-700">
            {nights} night{nights !== 1 ? "s" : ""} — what an adventure awaits!
          </p>
        </motion.div>
      )}
    </StepShell>
  );
}