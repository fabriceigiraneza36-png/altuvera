import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";
import EmailField from "../components/EmailField";

function Field({ label, id, type = "text", value, onChange, onBlur, error, touched, placeholder, autoComplete, required, icon }) {
  const err = touched && error;
  return (
    <div>
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-emerald-950 mb-1.5">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
        )}
        <input id={id} type={type} autoComplete={autoComplete} value={value}
          onChange={e => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder}
          className={`w-full ${icon ? "pl-12" : "pl-4"} pr-11 py-3 lg:py-4 rounded-xl border-2
            text-gray-900 placeholder-gray-300 text-sm lg:text-base font-medium
            outline-none transition-all focus:ring-4 focus:ring-emerald-900/10
            ${err
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-700"}`}/>
        {value.trim() && !err && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
        )}
      </div>
      {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 font-medium">{error}</motion.p>}
    </div>
  );
}

const METHODS = [
  { v: "whatsapp", l: "WhatsApp" },
  { v: "email",    l: "Email" },
  { v: "phone",    l: "Phone" },
];

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10"/>
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>
);

export default function Step3Contact({
  data, set, touch, errors, touched, displayName,
  onNext, onBack, submitting, submitError, onDismissError,
  getCountryName, getDestinationName,
}) {
  return (
    <StepShell stepKey="contact"
      icon={<SendIcon />}
      heading={`Ready to send${displayName ? `, ${displayName}` : ""}?`}
      subheading="Just three quick details and we'll be in touch within 24 hours."
      onNext={onNext} onBack={onBack} nextLabel="Send My Request" isLast submitting={submitting}>

      {submitError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start relative"
          role="alert">
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-2">{submitError}</p>
            <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3.5 py-2 rounded-lg">
              WhatsApp Us Now
            </a>
          </div>
          <button type="button" onClick={onDismissError}
            className="absolute top-3 right-3 text-red-300 hover:text-red-500" aria-label="Dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </motion.div>
      )}

      {/* 1. Email — with live suggestions */}
      <EmailField id="email" label="Email Address" required
        value={data.email} onChange={v => set("email", v)} onBlur={() => touch("email")}
        error={errors.email} touched={touched.email} />

      {/* 2. Phone */}
      <Field label="Phone / WhatsApp" id="phone" type="tel" autoComplete="tel" required
        value={data.phone} onChange={v => set("phone", v)} onBlur={() => touch("phone")}
        error={errors.phone} touched={touched.phone} placeholder="+1 555 123 4567"
        icon={<PhoneIcon />} />

      {/* 3. Country */}
      <Field label="Country of Residence" id="country" autoComplete="country-name" required
        value={data.country} onChange={v => set("country", v)} onBlur={() => touch("country")}
        error={errors.country} touched={touched.country} placeholder="e.g. United States"
        icon={<HomeIcon />} />

      {/* Preferred contact */}
      <div>
        <p className="text-sm lg:text-base font-semibold text-emerald-950 mb-2">Preferred contact method</p>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(m => (
            <button key={m.v} type="button" onClick={() => set("preferredContactMethod", m.v)}
              className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                ${data.preferredContactMethod === m.v
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}>
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary preview */}
      <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 rounded-2xl p-4 lg:p-5 text-white">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 mb-3">
          Your Adventure
        </p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-emerald-100">Name</span>
            <span className="font-bold text-right">{data.firstName} {data.lastName}</span>
          </div>
          {getCountryName() && (
            <div className="flex justify-between gap-4">
              <span className="text-emerald-100">Country</span>
              <span className="font-bold text-right">{getCountryName()}</span>
            </div>
          )}
          {getDestinationName() && (
            <div className="flex justify-between gap-4">
              <span className="text-emerald-100">Destination</span>
              <span className="font-bold text-right">{getDestinationName()}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-emerald-100">Travelers</span>
            <span className="font-bold text-right">
              {Number(data.adults) + Number(data.children)} · {data.groupType || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div onClick={() => set("newsletterOptIn", !data.newsletterOptIn)}
            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${data.newsletterOptIn
                ? "bg-emerald-700 border-emerald-700"
                : "bg-white border-gray-300 group-hover:border-emerald-400"}`}>
            {data.newsletterOptIn && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600">Send me safari tips and exclusive offers</span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div onClick={() => { set("agreeToTerms", !data.agreeToTerms); touch("agreeToTerms"); }}
            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${data.agreeToTerms
                ? "bg-emerald-700 border-emerald-700"
                : touched.agreeToTerms && errors.agreeToTerms
                  ? "border-red-400 bg-red-50"
                  : "bg-white border-gray-300 group-hover:border-emerald-400"}`}>
            {data.agreeToTerms && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <a href="/terms" target="_blank" className="text-emerald-800 font-bold hover:underline" onClick={e => e.stopPropagation()}>Terms</a>
            {" & "}
            <a href="/privacy" target="_blank" className="text-emerald-800 font-bold hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</a>
            <span className="text-red-500 ml-0.5">*</span>
          </span>
        </label>
        {touched.agreeToTerms && errors.agreeToTerms && (
          <p className="text-xs text-red-500 font-medium pl-8">{errors.agreeToTerms}</p>
        )}
      </div>
    </StepShell>
  );
}