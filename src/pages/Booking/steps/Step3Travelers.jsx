import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

const GROUP_TYPES = [
  { value: "solo",      label: "Solo",       sub: "Just me" },
  { value: "couple",    label: "Couple",     sub: "Romantic getaway" },
  { value: "family",    label: "Family",     sub: "Kids welcome" },
  { value: "friends",   label: "Friends",    sub: "Group adventure" },
  { value: "corporate", label: "Corporate",  sub: "Team / business" },
  { value: "honeymoon", label: "Honeymoon",  sub: "Once in a lifetime" },
];

function Counter({ label, sub, value, onChange, min = 0, max = 50 }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5
                    bg-white rounded-2xl border-2 border-gray-100
                    hover:border-emerald-100 transition-colors">
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-9 h-9 rounded-full border-2 border-gray-200
                     flex items-center justify-center text-gray-500
                     hover:border-emerald-400 hover:text-emerald-600
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <span className="w-7 text-center text-lg font-extrabold
                         text-gray-900 tabular-nums">
          {value}
        </span>

        <button type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-9 h-9 rounded-full border-2 border-gray-200
                     flex items-center justify-center text-gray-500
                     hover:border-emerald-400 hover:text-emerald-600
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Step3Travelers({
  data, set, touch, errors, touched, displayName, onNext, onBack,
}) {
  const total = Number(data.adults) + Number(data.children);

  return (
    <StepShell
      stepKey="travelers"
      heading="Who's joining the adventure?"
      subheading={`${displayName ? `${displayName}, t` : "T"}ell us about your group so we can tailor everything perfectly.`}
      onNext={onNext}
      onBack={onBack}
    >
      {/* Group type */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Group Type
          {touched.groupType && errors.groupType && (
            <span className="ml-2 text-red-500 text-xs font-normal">
              {errors.groupType}
            </span>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {GROUP_TYPES.map(g => (
            <button
              key={g.value} type="button"
              onClick={() => { set("groupType", g.value); touch("groupType"); }}
              className={`
                py-3.5 px-4 rounded-2xl border-2 text-left
                transition-all duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-emerald-400
                ${data.groupType === g.value
                  ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50"
                  : "border-gray-200 bg-white hover:border-emerald-200 hover:-translate-y-0.5"}
              `}
            >
              <p className={`text-sm font-bold mb-0.5
                ${data.groupType === g.value ? "text-emerald-700" : "text-gray-800"}`}>
                {g.label}
              </p>
              <p className="text-xs text-gray-400">{g.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-gray-700">
          Number of Travelers
          {touched.adults && errors.adults && (
            <span className="ml-2 text-red-500 text-xs font-normal">
              {errors.adults}
            </span>
          )}
        </p>
        <Counter label="Adults" sub="Age 18+"
          value={Number(data.adults)} min={1} max={50}
          onChange={v => set("adults", v)} />
        <Counter label="Children" sub="Under 18"
          value={Number(data.children)} min={0} max={20}
          onChange={v => set("children", v)} />
      </div>

      {/* Total pill */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2.5 bg-emerald-50 border
                     border-emerald-100 rounded-2xl px-4 py-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-4 h-4 text-emerald-500 flex-shrink-0"
            aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2
                 M9 7a4 4 0 100 8 4 4 0 000-8z
                 M23 21v-2a4 4 0 00-3-3.87
                 M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <p className="text-sm font-bold text-emerald-700">
            {total} traveler{total !== 1 ? "s" : ""}
            {data.groupType && (
              <span className="font-normal text-emerald-600">
                {" "}· {data.groupType} trip
              </span>
            )}
          </p>
        </motion.div>
      )}

      {/* Special requests */}
      <div>
        <label htmlFor="specialRequests"
          className="block text-sm font-semibold text-gray-700 mb-1.5">
          Special Requests
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          id="specialRequests"
          value={data.specialRequests}
          onChange={e => set("specialRequests", e.target.value)}
          rows={3}
          placeholder="Dietary needs, accessibility, anniversaries, wildlife wishlist…"
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200
                     focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60
                     outline-none text-sm text-gray-900 resize-none
                     placeholder-gray-300 bg-white hover:border-gray-300
                     transition-all duration-200"
        />
      </div>
    </StepShell>
  );
}