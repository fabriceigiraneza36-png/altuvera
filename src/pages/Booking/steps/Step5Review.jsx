import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5
                    border-b border-emerald-100/60 last:border-0">
      <span className="text-xs font-bold text-gray-400 uppercase
                       tracking-wider flex-shrink-0 mt-0.5 w-28">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right leading-snug">
        {value}
      </span>
    </div>
  );
}

export default function Step5Review({
  data, displayName, getDestinationName, getCountryName,
  onNext, onBack, submitting, submitError, onDismissError,
}) {
  const total = Number(data.adults) + Number(data.children);

  const travelInfo = data.flexibleDates
    ? `Flexible — ${data.flexibleMonths.join(", ") || "any month"}`
    : [
        data.startDate,
        data.endDate ? `→ ${data.endDate}` : null,
      ].filter(Boolean).join(" ") || "Not specified";

  return (
    <StepShell
      stepKey="review"
      heading={`Looks amazing${displayName ? `, ${displayName}` : ""}!`}
      subheading="Everything looks great. Review your details, then send your request — completely free."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Send My Request"
      isLast
      submitting={submitting}
    >
      {/* Error */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="bg-red-50 border border-red-200 rounded-2xl p-4
                     flex gap-3 items-start relative"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-2">{submitError}</p>
            <a href="https://wa.me/250785751391" target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]
                         hover:bg-[#1ebe5d] text-white text-xs font-bold
                         px-3.5 py-2 rounded-xl transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor"
                className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967
                  -.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164
                  -.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
                  -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13
                  -.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497
                  .099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
                  -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01
                  -.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 
                  0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 
                  4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871
                  .118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289
                  .173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 
                  5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.428a.75
                  .75 0 00.921.916l5.474-1.503A11.95 11.95 0 0012 24c6.627 
                  0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 01-5.127
                  -1.415l-.369-.218-3.822 1.049 1.016-3.711-.237-.381A9.95 
                  9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 
                  10-10 10z"/>
              </svg>
              Contact Us on WhatsApp
            </a>
          </div>
          <button type="button" onClick={onDismissError}
            className="absolute top-3 right-3 text-red-300 hover:text-red-500
                       transition-colors focus:outline-none"
            aria-label="Dismiss error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </motion.div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-50/70 to-green-50/50
                      border border-emerald-100 rounded-3xl p-5 sm:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-widest
                       text-emerald-500 mb-4">
          Your Adventure Summary
        </p>
        <SummaryRow label="Name"        value={`${data.firstName} ${data.lastName}`.trim()} />
        <SummaryRow label="Country"     value={getCountryName()} />
        <SummaryRow label="Destination" value={getDestinationName()} />
        <SummaryRow label="Travel"      value={travelInfo} />
        <SummaryRow label="Group"       value={
          `${total} traveler${total !== 1 ? "s" : ""}` +
          (data.groupType ? ` · ${data.groupType}` : "") +
          ` (${data.adults} adult${data.adults !== 1 ? "s" : ""}` +
          (data.children > 0 ? ` + ${data.children} child${data.children !== 1 ? "ren" : ""}` : "") + ")"
        } />
        <SummaryRow label="Email"       value={data.email} />
        <SummaryRow label="Phone"       value={data.phone} />
        <SummaryRow label="Contact via" value={data.preferredContactMethod} />
        {data.specialRequests && (
          <SummaryRow label="Requests" value={data.specialRequests} />
        )}
      </div>

      {/* What happens next */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-widest
                       text-blue-500 mb-3">
          What happens next
        </p>
        <div className="space-y-2">
          {[
            "Check your email — click the verification link we send you",
            "Our team reviews your request within 24 hours",
            "We reach out to personalise your itinerary — via your preferred method",
            "We send a custom proposal. You decide. No pressure, no payment now.",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700
                               text-[10px] font-extrabold flex items-center
                               justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-blue-700 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* No payment note */}
      <div className="flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" className="w-4 h-4 text-emerald-500" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944
               a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591
               3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
               0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p className="text-xs font-semibold text-gray-500">
          This is a free consultation request — no payment required
        </p>
      </div>
    </StepShell>
  );
}