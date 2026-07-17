import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function Field({ label, id, value, onChange, onBlur, error, touched, placeholder, autoFocus, autoComplete, icon }) {
  const err = touched && error;
  return (
    <div>
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-emerald-950 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input id={id} type="text" autoFocus={autoFocus} autoComplete={autoComplete || "off"}
          value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-12" : "pl-4"} pr-11 py-3 lg:py-4 rounded-xl border-2
            text-gray-900 placeholder-gray-300 text-sm lg:text-base font-medium
            outline-none transition-all focus:ring-4 focus:ring-emerald-900/10
            ${err
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-700"}`}
          aria-invalid={!!err}
        />
        {value.trim() && !err && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </motion.span>
        )}
      </div>
      {err && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500 font-medium">
          {error}
        </motion.p>
      )}
    </div>
  );
}

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);
const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0h14l-2 4 2 4H3"/>
  </svg>
);

export default function Step0Name({ data, set, touch, errors, touched, onNext }) {
  return (
    <StepShell stepKey="identity"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>}
      heading="Let's start with your name"
      subheading="We'll personalise everything around you. This takes 2 minutes."
      onNext={onNext} nextLabel="Continue" isFirst>

      <Field label="First Name" id="firstName" autoFocus autoComplete="given-name"
        value={data.firstName} onChange={v => set("firstName", v)} onBlur={() => touch("firstName")}
        error={errors.firstName} touched={touched.firstName} placeholder="e.g. Sarah"
        icon={<UserIcon />} />

      <Field label="Last Name" id="lastName" autoComplete="family-name"
        value={data.lastName} onChange={v => set("lastName", v)} onBlur={() => touch("lastName")}
        error={errors.lastName} touched={touched.lastName} placeholder="e.g. Johnson"
        icon={<UserIcon />} />

      <Field label="Nationality" id="nationality"
        value={data.nationality} onChange={v => set("nationality", v)} onBlur={() => touch("nationality")}
        error={errors.nationality} touched={touched.nationality}
        placeholder="e.g. American, British, Rwandan"
        icon={<FlagIcon />} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-2xl p-4 lg:p-5 flex gap-3 items-start">
        <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-white/10 backdrop-blur-sm
                        border border-white/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-5 h-5 text-emerald-300">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm lg:text-base font-bold text-white mb-0.5">
            Welcome to Altuvera Safaris
          </p>
          <p className="text-xs lg:text-sm text-emerald-100 leading-relaxed">
            No payment now — we'll craft a free personalised itinerary and negotiate everything with you on WhatsApp.
          </p>
        </div>
      </motion.div>
    </StepShell>
  );
}