import React from "react";
import { motion } from "framer-motion";
import StepShell from "../components/StepShell";

const GROUPS = [
  {v:"solo",l:"Solo",s:"Just me"},{v:"couple",l:"Couple",s:"Romantic getaway"},
  {v:"family",l:"Family",s:"Kids welcome"},{v:"friends",l:"Friends",s:"Group trip"},
  {v:"corporate",l:"Corporate",s:"Business"},{v:"honeymoon",l:"Honeymoon",s:"Special trip"},
];

function Counter({label,sub,value,onChange,min=0,max=50}){
  return(
    <div className="flex items-center justify-between px-4 py-3 lg:py-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-100 transition-colors">
      <div><p className="text-sm lg:text-base font-bold text-gray-800">{label}</p><p className="text-xs text-gray-400">{sub}</p></div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 transition-all"
          aria-label={`Decrease ${label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <span className="w-7 text-center text-lg font-extrabold text-gray-900 tabular-nums">{value}</span>
        <button type="button" onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 transition-all"
          aria-label={`Increase ${label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function Step3Travelers({ data, set, touch, errors, touched, displayName, onNext, onBack }) {
  const total = Number(data.adults)+Number(data.children);
  return (
    <StepShell stepKey="travelers"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
      heading="Who's joining the adventure?"
      subheading={`${displayName?`${displayName}, t`:"T"}ell us about your group.`}
      onNext={onNext} onBack={onBack}>

      <div>
        <p className="text-sm lg:text-base font-semibold text-gray-700 mb-3">
          Group Type {touched.groupType&&errors.groupType&&<span className="ml-2 text-red-500 text-xs">{errors.groupType}</span>}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {GROUPS.map(g=>(
            <button key={g.v} type="button" onClick={()=>{set("groupType",g.v);touch("groupType");}}
              className={`py-3 px-3 lg:py-4 lg:px-4 rounded-2xl border-2 text-left transition-all
                ${data.groupType===g.v?"border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50":"border-gray-200 bg-white hover:border-emerald-200 hover:-translate-y-0.5"}`}>
              <p className={`text-sm lg:text-base font-bold ${data.groupType===g.v?"text-emerald-700":"text-gray-800"}`}>{g.l}</p>
              <p className="text-xs text-gray-400">{g.s}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-sm lg:text-base font-semibold text-gray-700">
          Travelers {touched.adults&&errors.adults&&<span className="ml-2 text-red-500 text-xs">{errors.adults}</span>}
        </p>
        <Counter label="Adults" sub="Age 18+" value={Number(data.adults)} min={1} onChange={v=>set("adults",v)}/>
        <Counter label="Children" sub="Under 18" value={Number(data.children)} min={0} max={20} onChange={v=>set("children",v)}/>
      </div>

      {total>0&&(
        <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}}
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-500 flex-shrink-0"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z"/></svg>
          <p className="text-sm font-bold text-emerald-700">{total} traveler{total!==1?"s":""}{data.groupType&&<span className="font-normal text-emerald-600"> · {data.groupType}</span>}</p>
        </motion.div>
      )}

      <div>
        <label htmlFor="specialRequests" className="block text-sm lg:text-base font-semibold text-gray-700 mb-1.5">
          Special Requests <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea id="specialRequests" value={data.specialRequests} onChange={e=>set("specialRequests",e.target.value)}
          rows={3} placeholder="Dietary needs, accessibility, celebrations..."
          className="w-full px-4 py-3 lg:py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400
            focus:ring-4 focus:ring-emerald-100/60 outline-none text-sm lg:text-base text-gray-900
            resize-none placeholder-gray-300 bg-white hover:border-gray-300 transition-all"/>
      </div>
    </StepShell>
  );
}