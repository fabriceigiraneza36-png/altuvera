import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

const GROUPS = [
  { v: "solo",      l: "Solo",      s: "Just me" },
  { v: "couple",    l: "Couple",    s: "Two of us" },
  { v: "family",    l: "Family",    s: "Kids welcome" },
  { v: "friends",   l: "Friends",   s: "Group trip" },
  { v: "corporate", l: "Corporate", s: "Business" },
  { v: "honeymoon", l: "Honeymoon", s: "Romantic" },
];

function Select({ label, id, value, onChange, onBlur, error, touched, options, placeholder, icon }) {
  const err = touched && error;
  return (
    <div>
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-emerald-950 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select id={id} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          className={`w-full ${icon ? "pl-12" : "pl-4"} pr-10 py-3 lg:py-4 rounded-xl border-2
            text-gray-900 text-sm lg:text-base font-medium appearance-none outline-none
            transition-all focus:ring-4 focus:ring-emerald-900/10
            ${err
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-700"}`}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {err && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path strokeLinecap="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <circle cx="12" cy="11" r="3"/>
  </svg>
);

export default function Step1Destination({
  data, set, touch, errors, touched,
  countriesList, destinationsList, displayName, onNext, onBack,
}) {
  const filtered = useMemo(() => {
    if (!data.countryId) return [];
    return destinationsList.filter(d => String(d.countryId) === String(data.countryId));
  }, [destinationsList, data.countryId]);

  return (
    <StepShell stepKey="destination"
      icon={<GlobeIcon />}
      heading={`Where are you dreaming of${displayName ? `, ${displayName}` : ""}?`}
      subheading="Pick your country, specific destination, and group type."
      onNext={onNext} onBack={onBack}>

      {/* 1. Country */}
      <Select label="Destination Country" id="countryId"
        value={data.countryId}
        onChange={v => { set("countryId", v); set("destinationId", ""); }}
        onBlur={() => touch("countryId")}
        error={errors.countryId} touched={touched.countryId}
        options={countriesList}
        placeholder="— Choose a country —"
        icon={<GlobeIcon />} />

      {/* 2. Destination */}
      <AnimatePresence mode="wait">
        {data.countryId && (
          <motion.div key={data.countryId}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            {filtered.length > 0 ? (
              <Select label="Specific Destination" id="destinationId"
                value={data.destinationId}
                onChange={v => set("destinationId", v)}
                onBlur={() => touch("destinationId")}
                error={errors.destinationId} touched={touched.destinationId}
                options={filtered}
                placeholder="— Choose destination —"
                icon={<PinIcon />} />
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  No destinations listed for this country
                </p>
                <p className="text-xs text-amber-700">
                  <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
                    className="text-emerald-800 font-bold hover:underline">
                    Message us on WhatsApp
                  </a>
                  {" "}— we'll build a custom itinerary just for you.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Group type */}
      <div>
        <p className="block text-sm lg:text-base font-semibold text-emerald-950 mb-2">
          Group Type
          {touched.groupType && errors.groupType && (
            <span className="ml-2 text-red-500 text-xs font-normal">{errors.groupType}</span>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {GROUPS.map(g => (
            <button key={g.v} type="button"
              onClick={() => { set("groupType", g.v); touch("groupType"); }}
              className={`p-3 lg:p-4 rounded-xl border-2 text-left transition-all
                ${data.groupType === g.v
                  ? "border-emerald-700 bg-emerald-50 shadow-md shadow-emerald-900/10"
                  : "border-gray-200 bg-white hover:border-emerald-300 hover:-translate-y-0.5"}`}>
              <p className={`text-sm lg:text-base font-bold ${data.groupType === g.v ? "text-emerald-900" : "text-gray-800"}`}>
                {g.l}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{g.s}</p>
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  );
}