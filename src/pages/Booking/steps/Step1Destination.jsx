import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

function SelectField({ label, id, value, onChange, onBlur,
                       error, touched, options, placeholder, disabled }) {
  const hasErr = touched && error;
  return (
    <div>
      {label && (
        <label htmlFor={id}
          className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id} value={value} disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={`
            w-full px-4 py-3.5 pr-10 rounded-2xl border-2 text-gray-900
            text-base font-medium appearance-none outline-none
            transition-all duration-200 focus:ring-4 focus:ring-emerald-100/60
            disabled:opacity-40 disabled:cursor-not-allowed
            ${hasErr
              ? "border-red-300 bg-red-50/60 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}
          `}
          aria-invalid={!!hasErr}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5"
          className="w-4 h-4 text-gray-400 absolute right-3.5
                     top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {hasErr && (
        <p role="alert"
          className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function DestCard({ dest, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(dest.value)}
      className={`
        relative p-4 rounded-2xl border-2 text-left transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
        ${selected
          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50"
          : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:-translate-y-0.5"}
      `}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500
                          rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="3" className="w-3 h-3" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </span>
      )}
      <p className="text-sm font-bold text-gray-800 leading-snug pr-5">
        {dest.label}
      </p>
      {dest.country && (
        <p className="text-xs text-gray-400 mt-0.5">{dest.country}</p>
      )}
    </button>
  );
}

export default function Step1Destination({
  data, set, touch, errors, touched,
  countriesList, destinationsList,
  displayName, onNext, onBack,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const base = data.countryId
      ? destinationsList.filter(d => String(d.countryId) === String(data.countryId))
      : destinationsList;
    if (!search.trim()) return base;
    return base.filter(d =>
      d.label.toLowerCase().includes(search.toLowerCase()));
  }, [destinationsList, data.countryId, search]);

  const useCards = filtered.length > 0 && filtered.length <= 8;

  return (
    <StepShell
      stepKey="destination"
      heading={`Where are you dreaming of${displayName ? `, ${displayName}` : ""}?`}
      subheading="Pick your destination country and the specific place that calls to you."
      onNext={onNext}
      onBack={onBack}
    >
      {/* Country */}
      <SelectField
        label="Destination Country" id="countryId"
        value={data.countryId}
        onChange={v => {
          set("countryId", v);
          set("destinationId", "");
          setSearch("");
        }}
        onBlur={() => touch("countryId")}
        error={errors.countryId}
        touched={touched.countryId}
        options={countriesList}
        placeholder="— Choose a country —"
      />

      {/* Destinations */}
      <AnimatePresence mode="wait">
        {data.countryId && (
          <motion.div
            key={data.countryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Specific Destination
                {touched.destinationId && errors.destinationId && (
                  <span className="ml-2 text-red-500 text-xs font-normal">
                    {errors.destinationId}
                  </span>
                )}
              </p>

              {/* Search box */}
              {filtered.length > 6 && (
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5 text-gray-400 absolute
                               left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/>
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200
                               text-xs bg-white outline-none focus:border-emerald-400
                               focus:ring-2 focus:ring-emerald-100 w-32"
                  />
                </div>
              )}
            </div>

            {/* Card grid or select */}
            {useCards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filtered.map(d => (
                  <DestCard
                    key={d.value} dest={d}
                    selected={data.destinationId === d.value}
                    onSelect={v => { set("destinationId", v); touch("destinationId"); }}
                  />
                ))}
              </div>
            ) : filtered.length > 8 ? (
              <SelectField
                label="" id="destinationId"
                value={data.destinationId}
                onChange={v => set("destinationId", v)}
                onBlur={() => touch("destinationId")}
                error={errors.destinationId}
                touched={touched.destinationId}
                options={filtered}
                placeholder="— Select a destination —"
              />
            ) : (
              <div className="bg-amber-50 border border-amber-100
                              rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  No destinations found
                </p>
                <p className="text-xs text-amber-600">
                  Contact us on WhatsApp — we'll build a custom itinerary for you!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}