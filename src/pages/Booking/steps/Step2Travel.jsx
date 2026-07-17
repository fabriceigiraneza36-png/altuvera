import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepShell from "../components/StepShell";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Step2Travel({ data, set, touch, errors, touched, displayName, onNext, onBack }) {
  const today = new Date().toISOString().split("T")[0];
  const toggle = m => {
    const c = data.flexibleMonths||[];
    set("flexibleMonths", c.includes(m)?c.filter(x=>x!==m):[...c,m]);
  };
  const nights = data.startDate&&data.endDate ? Math.round((new Date(data.endDate)-new Date(data.startDate))/864e5) : 0;

  return (
    <StepShell stepKey="travel"
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
      heading="When should we plan this?"
      subheading={`${displayName?`${displayName}, do`:"Do"} you have dates in mind?`}
      onNext={onNext} onBack={onBack}>

      <div className="grid grid-cols-2 gap-3">
        {[{val:false,lbl:"Specific Dates",sub:"I know when"},{val:true,lbl:"Flexible",sub:"Open to options"}].map(o=>(
          <button key={String(o.val)} type="button" onClick={()=>set("flexibleDates",o.val)}
            className={`p-4 lg:p-5 rounded-2xl border-2 text-left transition-all focus:outline-none
              ${data.flexibleDates===o.val
                ?"border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100/50"
                :"border-gray-200 bg-white hover:border-emerald-200 hover:-translate-y-0.5"}`}>
            <p className="text-sm lg:text-base font-bold text-gray-800">{o.lbl}</p>
            <p className="text-xs text-gray-400 mt-0.5">{o.sub}</p>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!data.flexibleDates ? (
          <motion.div key="specific" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
            className="grid sm:grid-cols-2 gap-4">
            {[{lbl:"Departure",id:"startDate",min:today,req:true},{lbl:"Return (optional)",id:"endDate",min:data.startDate||today}].map(f=>(
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm lg:text-base font-semibold text-gray-700 mb-1.5">{f.lbl}</label>
                <input id={f.id} type="date" value={data[f.id]} min={f.min}
                  onChange={e=>set(f.id,e.target.value)} onBlur={()=>touch(f.id)}
                  className={`w-full px-4 py-3 lg:py-4 rounded-2xl border-2 text-gray-900 text-sm lg:text-base
                    font-medium outline-none transition-all focus:ring-4 focus:ring-emerald-100/60
                    ${touched[f.id]&&errors[f.id]?"border-red-300 bg-red-50/50":"border-gray-200 bg-white focus:border-emerald-400 hover:border-gray-300"}`}/>
                {touched[f.id]&&errors[f.id]&&<p className="mt-1.5 text-xs text-red-500 font-medium">{errors[f.id]}</p>}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="flex" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}>
            <p className="text-sm lg:text-base font-semibold text-gray-700 mb-3">
              Which months?
              {touched.flexibleMonths&&errors.flexibleMonths&&<span className="ml-2 text-red-500 text-xs">{errors.flexibleMonths}</span>}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MONTHS.map(m=>(
                <button key={m} type="button" onClick={()=>toggle(m)}
                  className={`py-2.5 rounded-xl border-2 text-xs lg:text-sm font-bold transition-all
                    ${data.flexibleMonths?.includes(m)
                      ?"border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      :"border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}>
                  {m.slice(0,3)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {nights>0&&(
        <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}}
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-500 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
          <p className="text-sm font-bold text-emerald-700">{nights} night{nights!==1?"s":""} planned!</p>
        </motion.div>
      )}
    </StepShell>
  );
}