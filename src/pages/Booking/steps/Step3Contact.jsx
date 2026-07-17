import React from "react";
import { HiPhone, HiHome, HiCheck } from "react-icons/hi";
import { EmailField, InputField } from "../components/FormComponents";

const METHODS = [
  { v: "whatsapp", l: "WhatsApp" },
  { v: "email",    l: "Email" },
  { v: "phone",    l: "Phone" },
];

export default function Step3Contact({
  data, set, touch, errors, touched,
}) {
  return (
    <div className="space-y-4">
      <EmailField
        id="email" label="Email Address" required
        value={data.email}
        onChange={(v) => set("email", v)}
        onBlur={() => touch("email")}
        error={touched.email && errors.email}
        valid={touched.email && !errors.email && !!data.email}
        hint="For your booking confirmation"
      />
      <InputField
        id="phone" label="Phone / WhatsApp" icon={HiPhone}
        type="tel" autoComplete="tel" required
        value={data.phone}
        onChange={(v) => set("phone", v)}
        onBlur={() => touch("phone")}
        placeholder="+1 555 123 4567"
        error={touched.phone && errors.phone}
        valid={touched.phone && !errors.phone && data.phone.length > 6}
      />
      <InputField
        id="country" label="Country of Residence" icon={HiHome}
        autoComplete="country-name" required
        value={data.country}
        onChange={(v) => set("country", v)}
        onBlur={() => touch("country")}
        placeholder="United States"
        error={touched.country && errors.country}
        valid={touched.country && !errors.country && data.country.trim().length >= 2}
      />

      {/* Contact method */}
      <div className="space-y-2">
        <span className="block text-sm font-semibold text-gray-700">Preferred contact</span>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(m => (
            <button key={m.v} type="button" onClick={() => set("preferredContactMethod", m.v)}
              className={`relative h-11 rounded-xl border-2 text-sm font-semibold transition-all
                ${data.preferredContactMethod === m.v
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}>
              {m.l}
              {data.preferredContactMethod === m.v && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full
                                bg-emerald-500 flex items-center justify-center">
                  <HiCheck className="w-2 h-2 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
            ${data.newsletterOptIn ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-gray-400"}`}>
            {data.newsletterOptIn && <HiCheck className="w-3 h-3 text-white" />}
          </div>
          <input type="checkbox" checked={data.newsletterOptIn}
            onChange={(e) => set("newsletterOptIn", e.target.checked)} className="sr-only" />
          <span className="text-sm text-gray-600">Send me safari tips and offers</span>
        </label>

        <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border group transition-all
          ${data.agreeToTerms
            ? "border-emerald-200 bg-emerald-50/50"
            : touched.agreeToTerms && errors.agreeToTerms
              ? "border-red-200 bg-red-50/50"
              : "border-gray-200 bg-gray-50"}`}>
          <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${data.agreeToTerms ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-gray-400"}`}>
            {data.agreeToTerms && <HiCheck className="w-3 h-3 text-white" />}
          </div>
          <input type="checkbox" checked={data.agreeToTerms}
            onChange={(e) => { set("agreeToTerms", e.target.checked); touch("agreeToTerms"); }} className="sr-only" />
          <span className="text-sm text-gray-600 leading-relaxed">
            I agree to the{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700"
              onClick={(e) => e.stopPropagation()}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 font-medium underline underline-offset-2 hover:text-emerald-700"
              onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
            <span className="text-red-500 ml-0.5">*</span>
          </span>
        </label>
        {touched.agreeToTerms && errors.agreeToTerms && (
          <p className="text-xs text-red-500 pl-8">{errors.agreeToTerms}</p>
        )}
      </div>
    </div>
  );
}