import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function Field({ label, id, type = "text", value, onChange, onBlur,
                 error, touched, placeholder, autoComplete, required }) {
  const hasErr = touched && error;
  return (
    <div>
      <label htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={type} autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 rounded-2xl border-2 text-gray-900
            placeholder-gray-300 text-base font-medium outline-none
            transition-all duration-200 focus:ring-4 focus:ring-emerald-100/60
            ${hasErr
              ? "border-red-300 bg-red-50/60 focus:border-red-400"
              : "border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}
          `}
          aria-invalid={!!hasErr}
          aria-describedby={hasErr ? `${id}-err` : undefined}
        />
        {value.trim() && !hasErr && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
        )}
      </div>
      {hasErr && (
        <motion.p
          id={`${id}-err`} role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
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

function Checkbox({ checked, onChange, children, error, touched, id }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div
        id={id}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={e => (e.key === " " || e.key === "Enter") && onChange(!checked)}
        className={`
          flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center
          justify-center transition-all duration-200 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
          ${checked
            ? "bg-emerald-500 border-emerald-500"
            : touched && error
              ? "border-red-400 bg-red-50"
              : "bg-white border-gray-300 group-hover:border-emerald-300"}
        `}
      >
        {checked && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="3" className="w-3 h-3" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-600 leading-snug">{children}</span>
    </label>
  );
}

const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email",    label: "Email"    },
  { value: "phone",    label: "Phone"    },
];

export default function Step4Contact({
  data, set, touch, errors, touched,
  displayName, onNext, onBack,
}) {
  return (
    <StepShell
      stepKey="contact"
      heading={`Almost there${displayName ? `, ${displayName}` : ""}!`}
      subheading="Just your contact details — we'll only reach out about your booking."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Review My Booking"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Email Address" id="email" type="email"
          autoComplete="email" required
          value={data.email}
          onChange={v => set("email", v)}
          onBlur={() => touch("email")}
          error={errors.email} touched={touched.email}
          placeholder="you@example.com"
        />
        <Field
          label="Phone / WhatsApp" id="phone" type="tel"
          autoComplete="tel" required
          value={data.phone}
          onChange={v => set("phone", v)}
          onBlur={() => touch("phone")}
          error={errors.phone} touched={touched.phone}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Country of Residence" id="country"
          autoComplete="country-name" required
          value={data.country}
          onChange={v => set("country", v)}
          onBlur={() => touch("country")}
          error={errors.country} touched={touched.country}
          placeholder="e.g. United States"
        />
        <Field
          label="Nationality" id="nationality"
          autoComplete="off"
          value={data.nationality}
          onChange={v => set("nationality", v)}
          onBlur={() => touch("nationality")}
          error={errors.nationality} touched={touched.nationality}
          placeholder="e.g. American"
        />
      </div>

      {/* Preferred contact */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Preferred contact method
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map(m => (
            <button
              key={m.value} type="button"
              onClick={() => set("preferredContactMethod", m.value)}
              className={`
                px-4 py-2.5 rounded-xl border-2 text-sm font-semibold
                transition-all duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-emerald-400
                ${data.preferredContactMethod === m.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200"}
              `}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-1">
        <Checkbox
          id="newsletter"
          checked={data.newsletterOptIn}
          onChange={v => set("newsletterOptIn", v)}
        >
          Send me safari tips, travel inspiration and exclusive offers
        </Checkbox>

        <Checkbox
          id="terms"
          checked={data.agreeToTerms}
          onChange={v => { set("agreeToTerms", v); touch("agreeToTerms"); }}
          error={errors.agreeToTerms}
          touched={touched.agreeToTerms}
        >
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-emerald-600 font-bold hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-emerald-600 font-bold hover:underline">
            Privacy Policy
          </a>
          <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
        </Checkbox>

        {touched.agreeToTerms && errors.agreeToTerms && (
          <p role="alert" className="text-xs text-red-500 font-medium pl-8">
            {errors.agreeToTerms}
          </p>
        )}
      </div>

      {/* Privacy reassurance */}
      <div className="flex items-start gap-2.5 bg-gray-50 rounded-2xl p-3.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
          aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          Your data is encrypted and never sold.
          We'll only contact you about your safari request — nothing else.
        </p>
      </div>
    </StepShell>
  );
}