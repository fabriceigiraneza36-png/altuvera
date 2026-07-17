import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

function F({label,id,type="text",value,onChange,onBlur,error,touched,placeholder,autoComplete,required}){
  const err=touched&&error;
  return(
    <div>
      <label htmlFor={id} className="block text-sm lg:text-base font-semibold text-gray-700 mb-1.5">
        {label}{required&&<span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input id={id} type={type} autoComplete={autoComplete} value={value}
          onChange={e=>onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder}
          className={`w-full px-4 py-3 lg:py-4 rounded-2xl border-2 text-gray-900 placeholder-gray-300
            text-sm lg:text-base font-medium outline-none transition-all focus:ring-4 focus:ring-emerald-100/60
            ${err?"border-red-300 bg-red-50/50":"border-gray-200 bg-white hover:border-gray-300 focus:border-emerald-400"}`}/>
        {value.trim()&&!err&&(
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </span>
        )}
      </div>
      {err&&<motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="mt-1.5 text-xs text-red-500 font-medium">{error}</motion.p>}
    </div>
  );
}

const METHODS=[{v:"whatsapp",l:"WhatsApp"},{v:"email",l:"Email"},{v:"phone",l:"Phone"}];

export default function Step4Contact({data,set,touch,errors,touched,displayName,onNext,onBack}){
  return(
    <StepShell stepKey="contact"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
      heading={`Almost there${displayName?`, ${displayName}`:""}!`}
      subheading="Just your contact details — we'll only reach out about your trip."
      onNext={onNext} onBack={onBack} nextLabel="Review My Booking">

      <div className="grid sm:grid-cols-2 gap-4">
        <F label="Email" id="email" type="email" autoComplete="email" required value={data.email}
          onChange={v=>set("email",v)} onBlur={()=>touch("email")} error={errors.email} touched={touched.email} placeholder="you@example.com"/>
        <F label="Phone / WhatsApp" id="phone" type="tel" autoComplete="tel" required value={data.phone}
          onChange={v=>set("phone",v)} onBlur={()=>touch("phone")} error={errors.phone} touched={touched.phone} placeholder="+1 555 123 4567"/>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <F label="Country" id="country" autoComplete="country-name" required value={data.country}
          onChange={v=>set("country",v)} onBlur={()=>touch("country")} error={errors.country} touched={touched.country} placeholder="e.g. United States"/>
        <F label="Nationality" id="nationality" value={data.nationality}
          onChange={v=>set("nationality",v)} onBlur={()=>touch("nationality")} error={errors.nationality} touched={touched.nationality} placeholder="e.g. American"/>
      </div>

      <div>
        <p className="text-sm lg:text-base font-semibold text-gray-700 mb-2">Preferred contact</p>
        <div className="flex flex-wrap gap-2">
          {METHODS.map(m=>(
            <button key={m.v} type="button" onClick={()=>set("preferredContactMethod",m.v)}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                ${data.preferredContactMethod===m.v?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-gray-200 bg-white text-gray-600 hover:border-emerald-200"}`}>
              {m.l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {[
          {id:"newsletterOptIn",field:"newsletterOptIn",label:"Send me safari tips and offers"},
        ].map(c=>(
          <label key={c.id} className="flex items-start gap-3 cursor-pointer group">
            <div onClick={()=>set(c.field,!data[c.field])}
              className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
                ${data[c.field]?"bg-emerald-500 border-emerald-500":"bg-white border-gray-300 group-hover:border-emerald-300"}`}>
              {data[c.field]&&<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
            </div>
            <span className="text-sm text-gray-600">{c.label}</span>
          </label>
        ))}

        <label className="flex items-start gap-3 cursor-pointer group">
          <div onClick={()=>{set("agreeToTerms",!data.agreeToTerms);touch("agreeToTerms");}}
            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${data.agreeToTerms?"bg-emerald-500 border-emerald-500":touched.agreeToTerms&&errors.agreeToTerms?"border-red-400 bg-red-50":"bg-white border-gray-300 group-hover:border-emerald-300"}`}>
            {data.agreeToTerms&&<svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className="text-sm text-gray-600">
            I agree to the <a href="/terms" target="_blank" className="text-emerald-600 font-bold hover:underline" onClick={e=>e.stopPropagation()}>Terms</a> and{" "}
            <a href="/privacy" target="_blank" className="text-emerald-600 font-bold hover:underline" onClick={e=>e.stopPropagation()}>Privacy Policy</a>
            <span className="text-red-400 ml-0.5">*</span>
          </span>
        </label>
        {touched.agreeToTerms&&errors.agreeToTerms&&<p className="text-xs text-red-500 font-medium pl-8">{errors.agreeToTerms}</p>}
      </div>
    </StepShell>
  );
}