import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function Field({ label, id, value, onChange, onBlur, error, touched, placeholder, autoFocus, autoComplete }) {
  const err = touched && error;
  return (
    <div>
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input id={id} type="text" autoFocus={autoFocus} autoComplete={autoComplete||"off"}
          value={value} onChange={e=>onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder}
          className={`w-full px-4 py-3 lg:py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-300
            text-sm lg:text-base font-medium outline-none transition-all focus:ring-4 focus:ring-emerald-100/60
            ${err ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}`}
          aria-invalid={!!err} aria-describedby={err?`${id}-err`:undefined}/>
        {value.trim()&&!err&&(
          <motion.span initial={{scale:0}} animate={{scale:1}}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </motion.span>
        )}
      </div>
      {err&&(<motion.p id={`${id}-err`} role="alert" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
        className="mt-1.5 text-xs text-red-500 font-medium">{error}</motion.p>)}
    </div>
  );
}

export default function Step0Name({ data, set, touch, errors, touched, onNext }) {
  return (
    <StepShell stepKey="name"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 013 0m-3 6a1.5 1.5 0 003 0m0-6V9m0-3.5a1.5 1.5 0 013 0v6m-3 0a1.5 1.5 0 003 0m0 0V11m0-5.5a1.5 1.5 0 013 0v3"/></svg>}
      heading="Hey there! What's your name?"
      subheading="Let's get started — we'll personalise everything for you."
      onNext={onNext} nextLabel="Let's Begin" isFirst>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First Name" id="firstName" autoFocus autoComplete="given-name"
          value={data.firstName} onChange={v=>set("firstName",v)} onBlur={()=>touch("firstName")}
          error={errors.firstName} touched={touched.firstName} placeholder="e.g. Sarah"/>
        <Field label="Last Name" id="lastName" autoComplete="family-name"
          value={data.lastName} onChange={v=>set("lastName",v)} onBlur={()=>touch("lastName")}
          error={errors.lastName} touched={touched.lastName} placeholder="e.g. Johnson"/>
      </div>
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.18}}
        className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-emerald-600" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Welcome to Altuvera Safaris</p>
          <p className="text-xs text-gray-500 leading-relaxed">This takes just 2 minutes. No payment needed — we'll create a free personalised itinerary.</p>
        </div>
      </motion.div>
    </StepShell>
  );
}