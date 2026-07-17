import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

function Select({ label, id, value, onChange, onBlur, error, touched, options, placeholder }) {
  const err = touched && error;
  return (
    <div>
      {label&&<label htmlFor={id} className="block text-sm lg:text-base font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <select id={id} value={value} onChange={e=>onChange(e.target.value)} onBlur={onBlur}
          className={`w-full px-4 py-3 lg:py-4 pr-10 rounded-2xl border-2 text-gray-900
            text-sm lg:text-base font-medium appearance-none outline-none transition-all
            focus:ring-4 focus:ring-emerald-100/60
            ${err?"border-red-300 bg-red-50/50":"border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}`}>
          <option value="">{placeholder}</option>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {err&&<p role="alert" className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default function Step1Destination({ data, set, touch, errors, touched, countriesList, destinationsList, displayName, onNext, onBack }) {
  /* KEY FIX: compare with String() on both sides */
  const filtered = useMemo(() => {
    if (!data.countryId) return destinationsList;
    return destinationsList.filter(d => String(d.countryId) === String(data.countryId));
  }, [destinationsList, data.countryId]);

  const useCards = filtered.length > 0 && filtered.length <= 12;

  return (
    <StepShell stepKey="destination"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path strokeLinecap="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
      heading={`Where are you dreaming of${displayName?`, ${displayName}`:""}?`}
      subheading="Choose your destination country and specific place."
      onNext={onNext} onBack={onBack}>

      <Select label="Country" id="countryId" value={data.countryId}
        onChange={v=>{set("countryId",v);set("destinationId","");}} onBlur={()=>touch("countryId")}
        error={errors.countryId} touched={touched.countryId}
        options={countriesList} placeholder="— Select country —"/>

      <AnimatePresence mode="wait">
        {data.countryId && (
          <motion.div key={data.countryId}
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-6}} transition={{duration:.22}}>

            {useCards ? (
              <div>
                <p className="text-sm lg:text-base font-semibold text-gray-700 mb-3">
                  Destination
                  {touched.destinationId&&errors.destinationId&&(
                    <span className="ml-2 text-red-500 text-xs font-normal">{errors.destinationId}</span>
                  )}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:gap-3">
                  {filtered.map(d=>(
                    <button key={d.value} type="button"
                      onClick={()=>{set("destinationId",d.value);touch("destinationId");}}
                      className={`relative p-3 lg:p-4 rounded-2xl border-2 text-left transition-all
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                        ${data.destinationId===d.value
                          ?"border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50"
                          :"border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:-translate-y-0.5"}`}>
                      {data.destinationId===d.value&&(
                        <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </span>
                      )}
                      <p className="text-sm lg:text-base font-bold text-gray-800 leading-snug pr-5">{d.label}</p>
                      {d.country&&<p className="text-xs text-gray-400 mt-0.5">{d.country}</p>}
                    </button>
                  ))}
                </div>
              </div>
            ) : filtered.length > 12 ? (
              <Select label="Destination" id="destinationId" value={data.destinationId}
                onChange={v=>set("destinationId",v)} onBlur={()=>touch("destinationId")}
                error={errors.destinationId} touched={touched.destinationId}
                options={filtered} placeholder="— Select destination —"/>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                <p className="text-sm font-semibold text-amber-700 mb-1">No destinations found for this country</p>
                <p className="text-xs text-amber-600">
                  <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
                    className="text-emerald-600 font-bold hover:underline">Contact us on WhatsApp</a>
                  {" "}— we'll build a custom itinerary!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}