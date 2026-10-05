import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check, AlertCircle, MapPin, Users, Send, ShieldCheck } from "lucide-react";
import SEO from "../../components/common/SEO";
import PageHeader from "../../components/common/PageHeader";
import { BookingProvider } from "./BookingContext";
import { useBookingForm, STEPS } from "./useBookingForm";
import Step0Identity from "./steps/Step0Identity";
import Step1Destination from "./steps/Step1Destination";
import Step2Trip from "./steps/Step2Trip";
import Step3Contact from "./steps/Step3Contact";
import GallerySlideshow from "./components/GallerySlideshow";
import SuccessScreen from "./components/SuccessScreen";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

const isoToday = () => {
  const d = new Date(); d.setHours(0,0,0,0);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const pretty = (v) => v ? new Date(`${v}T00:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Not selected";

function DatePicker({ label, value, onChange, minDate, error }) {
  return <div className="bk-field-group">
    <label className="bk-label"><Calendar size={12} style={{verticalAlign:"-2px",marginRight:5}} />{label} <span className="bk-label-req">*</span></label>
    <div className="bk-input-wrap">
      <span className="bk-input-ico"><Calendar size={17}/></span>
      <input className={`bk-input${error ? " bk-input--err":""}`} type="date" min={minDate || isoToday()} value={value || ""} onChange={e=>onChange(e.target.value)} />
    </div>
    {error && <p className="bk-field-err"><AlertCircle size={13}/>{error}</p>}
  </div>;
}

function DateRangeBar({ arrival, departure }) {
  if (!arrival && !departure) return null;
  return <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:13,background:"#ecfdf5",color:"#047857",fontSize:12,fontWeight:750,marginBottom:18}}>
    <Calendar size={15}/>
    <span>{pretty(arrival)} → {pretty(departure)}</span>
    {arrival && departure && <span style={{marginLeft:"auto"}}>{Math.max(0,Math.round((new Date(departure)-new Date(arrival))/86400000))} nights</span>}
  </div>;
}

function BookingInner() {
  const { step, data, set, touch, errors, touched, tryNext, goBack, jumpTo, submit, reset, submitting, submitted, submitError, displayName, bookingRef, totalTravelers } = useBookingForm();
  const [countriesList,setCountriesList]=useState([]);
  const [destinationsList,setDestinationsList]=useState([]);
  const [loadingRefs,setLoadingRefs]=useState(true);
  const firstInputRef=useRef(null);

  useEffect(()=>{
    let alive=true;
    Promise.all([
      fetch(`${API}/countries?is_active=true&limit=200`).then(r=>r.json()),
      fetch(`${API}/destinations?is_active=true&limit=200`).then(r=>r.json())
    ]).then(([c,d])=>{
      if(!alive)return;
      const ca=Array.isArray(c?.data)?c.data:Array.isArray(c)?c:[];
      const da=Array.isArray(d?.data)?d.data:Array.isArray(d)?d:[];
      setCountriesList(ca.map(x=>({value:String(x.id??x.value??x.code??""),label:String(x.name??x.label??"")})).filter(x=>x.value));
      setDestinationsList(da.map(x=>({value:String(x.id??x.value??""),label:String(x.name??x.label??""),country:String(x.country?.name??x.countryName??x.country??""),countryId:String(x.country_id??x.countryId??""),image:String(x.image??x.thumbnail??x.imageUrl??"")})).filter(x=>x.value));
    }).catch(()=>{}).finally(()=>alive&&setLoadingRefs(false));
    return()=>{alive=false};
  },[]);

  useEffect(()=>{ firstInputRef.current?.focus?.(); },[step]);

  const selectedDest=useMemo(()=>destinationsList.find(d=>String(d.value)===String(data.destinationId)),[destinationsList,data.destinationId]);
  const hero=selectedDest?.image?{src:selectedDest.image,caption:selectedDest.label,tag:"Your destination"}:null;

  const quickArrival = [{label:"1 week",value:new Date(Date.now()+7*864e5).toISOString().slice(0,10)},{label:"2 weeks",value:new Date(Date.now()+14*864e5).toISOString().slice(0,10)}];
  const quickDeparture = data.startDate ? [5,7,10,14].map(n=>({label:`${n} nights`,value:new Date(new Date(data.startDate+"T00:00:00").getTime()+n*864e5).toISOString().slice(0,10)})) : [];

  const destinationForImage = selectedDest ? {src:selectedDest.image,alt:selectedDest.label,caption:selectedDest.label,tag:"Your selection"} : null;

  if(submitted) return <div className="bk-success"><SuccessScreen displayName={displayName} bookingRef={bookingRef} email={data.email} onReset={reset}/></div>;

  const title=STEPS[step]?.label || "Review";
  const desc=STEPS[step]?.desc || "";
  const review = step===4;

  const next = () => { if(step===3){ tryNext(); } else tryNext(); };

  return <div className="bk-page">
    {css}
    <SEO title="Book Your Adventure | Altuvera Safaris" description="Plan your East African adventure with Altuvera Safaris." image="/og-image.jpg"/>
    <PageHeader title="Book Your Journey" subtitle="Build your East African adventure in a few simple steps"/>
    <div className="bk-wrap">
      <div className="bk-layout">
        <aside className="bk-visual"><GallerySlideshow hero={destinationForImage}/></aside>
        <main className="bk-form">
          <div className="bk-progress">{STEPS.map((s,i)=><button key={s.id} type="button" className={`bk-pitem ${i===step?"on":""} ${i<step?"done":""}`} onClick={()=>jumpTo(i)} disabled={i>step} style={{border:0,background:"transparent",padding:0,cursor:i<=step?"pointer":"default"}}><div className="bk-dot"/><div className="bk-ptext">{i+1}. {s.label}</div></button>)}</div>
          <div className="bk-heading"><div><p className="bk-eyebrow">Step {step+1} of {STEPS.length}</p><h1 className="bk-title">{title}</h1><p className="bk-sub">{desc}</p></div><ShieldCheck size={25} color="#059669"/></div>

          {submitError && <div className="bk-error-box"><strong>We couldn't submit your booking.</strong><div style={{marginTop:4}}>{submitError}</div></div>}
          {loadingRefs && step===1 && <div style={{fontSize:12,color:"#718078",marginBottom:15}}>Loading destinations…</div>}

          <div className="bk-step" key={step}>
            {step===0 && <Step0Identity data={data} set={set} touch={touch} errors={errors} touched={touched} firstInputRef={firstInputRef}/>}
            {step===1 && <Step1Destination data={data} set={set} touch={touch} errors={errors} touched={touched} countriesList={countriesList} destinationsList={destinationsList}/>}
            {step===2 && <Step2Trip data={data} set={set} touch={touch} errors={errors} touched={touched}
              DatePicker={DatePicker}
              DateRangeBar={DateRangeBar}
              makeQuickPicks={()=>quickArrival}
              makeDepartureQuickPicks={()=>quickDeparture}/>}
            {step===3 && <Step3Contact data={data} set={set} touch={touch} errors={errors} touched={touched}/>}
            {review && <div>
              <div className="bk-review">
                <div className="bk-review-card"><h4>Traveller</h4><p><strong>{data.firstName} {data.lastName}</strong></p><p>{data.nationality}</p></div>
                <div className="bk-review-card"><h4>Destination</h4><p><strong>{selectedDest?.label || "Selected destination"}</strong></p><p>{countriesList.find(c=>c.value===data.countryId)?.label || ""}</p></div>
                <div className="bk-review-card"><h4>Trip</h4><p><strong>{data.flexibleDates?"Flexible dates":`${pretty(data.startDate)} → ${pretty(data.endDate)}`}</strong></p><p>{totalTravelers} traveller{totalTravelers!==1?"s":""} · {data.groupType}</p></div>
                <div className="bk-review-card"><h4>Contact</h4><p><strong>{data.email}</strong></p><p>{data.phone} · {data.preferredContactMethod}</p></div>
              </div>
              <div style={{marginTop:14,padding:14,borderRadius:14,background:"#ecfdf5",color:"#35604e",fontSize:12,lineHeight:1.55}}><Check size={15} style={{verticalAlign:"-3px",marginRight:6,color:"#059669"}}/>Everything looks good. Press <strong>Confirm booking</strong> to send your request securely to Altuvera Safaris.</div>
            </div>}
          </div>

          <div className="bk-actions">
            <button className="bk-btn bk-btn-secondary" type="button" onClick={goBack} disabled={step===0}><ChevronLeft size={17}/>Back</button>
            {step<4 ? <button className="bk-btn bk-btn-primary" type="button" onClick={next}>Continue <ChevronRight size={17}/></button>
              : <button className="bk-btn bk-btn-primary" type="button" onClick={submit} disabled={submitting}>{submitting?<><span>Submitting…</span></>:<><Send size={15}/>Confirm booking</>}</button>}
          </div>
        </main>
      </div>
    </div>
  </div>;
}

export default function Booking(){ return <BookingProvider><BookingInner/></BookingProvider>; }
