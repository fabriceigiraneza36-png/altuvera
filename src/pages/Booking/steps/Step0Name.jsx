import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function TextField({ label, id, value, onChange, onBlur,
                     error, touched, placeholder, autoFocus, autoComplete }) {
  const hasErr = touched && error;
  return (
    <div>
      <label htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type="text"
          autoFocus={autoFocus}
          autoComplete={autoComplete || "off"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900
            placeholder-gray-300 text-base font-medium outline-none
            transition-all duration-200
            focus:ring-4 focus:ring-emerald-100/60
            ${hasErr
              ? "border-red-300 bg-red-50/60 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}
          `}
          aria-invalid={!!hasErr}
          aria-describedby={hasErr ? `${id}-err` : undefined}
        />
        {/* Valid indicator */}
        {value.trim() && !hasErr && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2
                       text-emerald-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 13l4 4L19 7"/>
            </svg>
          </motion.span>
        )}
      </div>
      {hasErr && (
        <motion.p
          id={`${id}-err`} role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500 font-medium
                     flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default function Step0Name({ data, set, touch, errors, touched, onNext }) {
  return (
    <StepShell
      stepKey="name"
      heading="Hey there! What's your name?"
      subheading="Let's start here — we'll personalise your entire journey around you."
      onNext={onNext}
      nextLabel="Let's Begin →"
      isFirst
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          label="First Name" id="firstName"
          autoFocus autoComplete="given-name"
          value={data.firstName}
          onChange={v => set("firstName", v)}
          onBlur={() => touch("firstName")}
          error={errors.firstName}
          touched={touched.firstName}
          placeholder="e.g. Sarah"
        />
        <TextField
          label="Last Name" id="lastName"
          autoComplete="family-name"
          value={data.lastName}
          onChange={v => set("lastName", v)}
          onBlur={() => touch("lastName")}
          error={errors.lastName}
          touched={touched.lastName}
          placeholder="e.g. Johnson"
        />
      </div>

      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-gradient-to-r from-emerald-50 to-green-50
                   border border-emerald-100 rounded-2xl p-4
                   flex gap-3 items-start"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center
                        justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-5 h-5 text-emerald-600"
            aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0
                 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2
                 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15
                 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 mb-0.5">
            Welcome to Altuvera Safaris
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            We create unforgettable East African adventures — gorilla treks,
            Serengeti safaris, Zanzibar escapes — all tailored personally for you.
            This takes just 2 minutes.
          </p>
        </div>
      </motion.div>
    </StepShell>
  );
}