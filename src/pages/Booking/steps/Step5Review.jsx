import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function Row({label,value}){
  if(!value) return null;
  return(
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-emerald-100/60 last:border-0">
      <span className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 w-28">{label}</span>
      <span className="text-sm lg:text-base font-semibold text-gray-800 text-right leading-snug">{value}</span>
    </div>
  );
}

export default function Step5Review({data,displayName,getDestinationName,getCountryName,onNext,onBack,submitting,submitError,onDismissError}){
  const total=Number(data.adults)+Number(data.children);
  const travel=data.flexibleDates
    ?`Flexible — ${(data.flexibleMonths||[]).join(", ")||"any"}`
    :[data.startDate,data.endDate?`→ ${data.endDate}`:null].filter(Boolean).join(" ")||"Not set";

  return(
    <StepShell stepKey="review"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
      heading={`Looks amazing${displayName?`, ${displayName}`:""}!`}
      subheading="Review your details then send — completely free."
      onNext={onNext} onBack={onBack} nextLabel="Send My Request" isLast submitting={submitting}>

      {submitError&&(
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} role="alert"
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start relative">
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 mb-2">{submitError}</p>
            <a href="https://wa.me/250785751391" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3.5 py-2 rounded-xl">
              WhatsApp Us
            </a>
          </div>
          <button type="button" onClick={onDismissError} className="absolute top-3 right-3 text-red-300 hover:text-red-500" aria-label="Dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </motion.div>
      )}

      <div className="bg-gradient-to-br from-emerald-50/70 to-green-50/50 border border-emerald-100 rounded-3xl p-5 lg:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500 mb-4">Your Adventure Summary</p>
        <Row label="Name" value={`${data.firstName} ${data.lastName}`.trim()}/>
        <Row label="Country" value={getCountryName()}/>
        <Row label="Destination" value={getDestinationName()}/>
        <Row label="Travel" value={travel}/>
        <Row label="Group" value={`${total} traveler${total!==1?"s":""}${data.groupType?` · ${data.groupType}`:""}`}/>
        <Row label="Email" value={data.email}/>
        <Row label="Phone" value={data.phone}/>
        <Row label="Contact via" value={data.preferredContactMethod}/>
        {data.specialRequests&&<Row label="Requests" value={data.specialRequests}/>}
      </div>

      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500 mb-3">What happens next</p>
        {["Verify your email via the link we send","Team reviews within 24 hours","We contact you to personalise your itinerary","Custom proposal sent — no payment now"].map((t,i)=>(
          <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
            <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
            <p className="text-xs lg:text-sm text-blue-700 leading-relaxed">{t}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <p className="text-xs font-semibold text-gray-500">Free consultation — no payment required</p>
      </div>
    </StepShell>
  );
}