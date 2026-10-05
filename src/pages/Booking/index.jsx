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

const BK_CSS = `
.bk-page{min-height:100vh;background:#f6fbf8;color:#10221a;font-family:Inter,system-ui,-apple-system,sans-serif}.bk-wrap{max-width:1240px;margin:auto;padding:28px 18px 56px}.bk-layout{display:grid;grid-template-columns:minmax(280px,.9fr) minmax(0,1.1fr);min-height:700px;border-radius:28px;overflow:hidden;background:#fff;box-shadow:0 24px 70px rgba(15,118,110,.12)}.bk-visual{min-height:700px;background:#064e3b}.bk-form{padding:34px 38px;display:flex;flex-direction:column;min-width:0}.bk-progress{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-bottom:28px}.bk-pitem{min-width:0;text-align:center}.bk-dot{height:5px;border-radius:99px;background:#dce9e2;margin-bottom:7px}.bk-pitem.on .bk-dot,.bk-pitem.done .bk-dot{background:#059669}.bk-ptext{font-size:10px;color:#789084;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bk-pitem.on .bk-ptext{color:#047857;font-weight:800}.bk-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:24px}.bk-eyebrow{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#059669;margin:0 0 7px}.bk-title{font-size:30px;line-height:1.1;margin:0;color:#10221a;font-weight:850}.bk-sub{margin:8px 0 0;color:#718078;font-size:13px;line-height:1.55}.bk-step{animation:bkIn .32s ease both}@keyframes bkIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.bk-field-group{margin-bottom:19px}.bk-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bk-label{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#52645b;margin-bottom:7px}.bk-label-req{color:#ef4444;margin-left:3px}.bk-input-wrap{position:relative}.bk-input-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#7b9186;pointer-events:none;display:flex}.bk-input,.bk-select,.bk-textarea{width:100%;box-sizing:border-box;border:1px solid #dce8e1;background:#fff;border-radius:12px;min-height:46px;padding:0 13px 0 40px;color:#17251e;font-size:14px;outline:none;transition:.2s}.bk-select{appearance:auto}.bk-textarea{padding:12px 14px;min-height:110px;resize:vertical}.bk-input:focus,.bk-select:focus,.bk-textarea:focus{border-color:#34b981;box-shadow:0 0 0 4px rgba(16,185,129,.1)}.bk-input--err{border-color:#ef4444!important}.bk-input--valid{border-color:#86d7b4}.bk-field-err{display:flex;align-items:center;gap:5px;color:#dc2626;font-size:11px;margin:6px 0 0}.bk-hint{color:#87958e;font-size:11px;margin:6px 0 0}.bk-dest-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.bk-dest-card{position:relative;border:1px solid #dce8e1;background:#fff;border-radius:15px;padding:0;overflow:hidden;cursor:pointer;transition:.2s}.bk-dest-card--active{border:2px solid #10b981;box-shadow:0 0 0 3px rgba(16,185,129,.08)}.bk-dest-card__img{width:100%;height:112px;object-fit:cover;display:block}.bk-dest-card__body{padding:10px 12px}.bk-dest-card__name{font-weight:800;font-size:13px;margin:0;color:#183127}.bk-dest-card__ctry{font-size:10px;color:#789084;margin:5px 0 0}.bk-chip-grid{display:flex;flex-wrap:wrap;gap:8px}.bk-chip{border:1px solid #dce8e1;background:#fff;border-radius:999px;padding:9px 12px;color:#52645b;font-size:12px;font-weight:750;cursor:pointer;display:inline-flex;align-items:center;gap:7px}.bk-chip--active{border-color:#34b981;background:#ecfdf5;color:#047857}.bk-counter{display:flex;align-items:center;justify-content:space-between;border:1px solid #e1ebe5;border-radius:14px;padding:11px 13px;background:#fbfdfc}.bk-counter__lbl{font-size:13px;font-weight:800;margin:0}.bk-counter__sub{font-size:10px;color:#87958e;margin:3px 0 0}.bk-counter__ctrl{display:flex;align-items:center;gap:12px}.bk-counter__btn{width:30px;height:30px;border:1px solid #d8e5dd;background:#fff;border-radius:50%;display:grid;place-items:center;color:#047857;cursor:pointer}.bk-counter__btn:disabled{opacity:.35}.bk-counter__val{font-weight:850;min-width:18px;text-align:center}.bk-actions{display:flex;justify-content:space-between;gap:12px;margin-top:auto;padding-top:24px;border-top:1px solid #edf3ef}.bk-btn{border:0;border-radius:12px;min-height:46px;padding:0 20px;font-weight:800;font-size:13px;cursor:pointer;transition:.2s;display:inline-flex;align-items:center;justify-content:center;gap:8px}.bk-btn:hover{transform:translateY(-1px)}.bk-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.bk-btn-primary{background:#059669;color:#fff;box-shadow:0 9px 20px rgba(5,150,105,.18)}.bk-btn-secondary{background:#f4f8f5;color:#52645b}.bk-review{display:grid;grid-template-columns:1fr 1fr;gap:12px}.bk-review-card{border:1px solid #e1ebe5;border-radius:15px;padding:15px;background:#fbfdfc}.bk-review-card h4{margin:0 0 9px;font-size:12px;color:#047857;text-transform:uppercase;letter-spacing:.08em}.bk-review-card p{margin:4px 0;font-size:12px;color:#516159}.bk-review-card strong{color:#1c3026}.bk-error-box{background:#fff1f2;border:1px solid #fecdd3;color:#be123c;border-radius:13px;padding:12px 14px;font-size:12px;margin-bottom:18px}.bk-success{max-width:700px;margin:auto;background:#fff;border-radius:24px;padding:30px 18px;box-shadow:0 20px 60px rgba(15,118,110,.1)}@media(max-width:900px){.bk-layout{grid-template-columns:1fr}.bk-visual{min-height:250px;height:250px}.bk-form{padding:28px 24px}}@media(max-width:560px){.bk-wrap{padding:12px 10px 28px}.bk-layout{border-radius:18px}.bk-visual{height:205px;min-height:205px}.bk-form{padding:22px 16px}.bk-title{font-size:24px}.bk-progress{gap:4px;margin-bottom:22px}.bk-ptext{font-size:8px}.bk-field-row,.bk-dest-grid,.bk-review{grid-template-columns:1fr}.bk-actions{position:sticky;bottom:0;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);margin:20px -16px -22px;padding:12px 16px;z-index:20}.bk-btn{flex:1}.bk-dest-card__img{height:145px}}@media(max-width:380px){.bk-form{padding:18px 12px}.bk-title{font-size:22px}.bk-actions{margin-left:-12px;margin-right:-12px}}.bk-phone-row{display:grid;grid-template-columns:145px minmax(0,1fr);position:relative;align-items:stretch}.bk-phone-row .bk-phone-number{border-radius:0 12px 12px 0;padding-left:14px}.bk-phone-country{position:relative;z-index:5}.bk-phone-country__button{width:100%;height:46px;border:1px solid #dce8e1;border-right:0;border-radius:12px 0 0 12px;background:#fff;display:flex;align-items:center;justify-content:center;gap:7px;color:#52645b;font-size:12px;font-weight:800;cursor:pointer}.bk-phone-country__button strong{color:#047857}.bk-phone-country__menu{position:absolute;top:51px;left:0;width:min(300px,calc(100vw - 52px));background:#fff;border:1px solid #dce8e1;border-radius:14px;box-shadow:0 18px 40px rgba(16,34,26,.16);overflow:hidden;z-index:50}.bk-phone-country__search{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #edf3ef;padding:11px 12px;outline:0;font-size:12px}.bk-phone-country__list{max-height:230px;overflow:auto}.bk-phone-country__option,.bk-country-suggest__item{width:100%;border:0;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;text-align:left;color:#30483d;font-size:12px;cursor:pointer}.bk-phone-country__option:hover,.bk-country-suggest__item:hover{background:#ecfdf5;color:#047857}.bk-phone-country__option strong,.bk-country-suggest__item strong{color:#047857;white-space:nowrap}.bk-country-suggest{position:absolute;left:0;right:0;top:73px;background:#fff;border:1px solid #dce8e1;border-radius:12px;box-shadow:0 16px 36px rgba(16,34,26,.14);overflow:hidden;z-index:30}.bk-country-suggest__item{padding:11px 13px}.bk-phone-row--err .bk-phone-country__button{border-color:#ef4444}.bk-phone-row--err .bk-phone-number{border-color:#ef4444!important}.bk-consent-group{border:0;padding:0;margin:8px 0 0;min-width:0}.bk-check-row{position:relative;display:flex;align-items:flex-start;gap:11px;width:100%;box-sizing:border-box;padding:9px 2px;border-radius:10px;cursor:pointer;color:#30483d;line-height:1.5}.bk-check-row:hover{background:#f6fbf8}.bk-checkbox{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}.bk-check-box{flex:0 0 22px;width:22px;height:22px;margin-top:1px;border:2px solid #b8c9c0;border-radius:6px;background:#fff;color:#fff;display:grid;place-items:center;transition:all .2s ease;box-sizing:border-box}.bk-checkbox:focus-visible + .bk-check-box{outline:3px solid rgba(16,185,129,.2);outline-offset:2px}.bk-check-row--on .bk-check-box{border-color:#059669;background:#059669;box-shadow:0 3px 10px rgba(5,150,105,.18)}.bk-check-txt{font-size:13px;line-height:1.55;min-width:0}.bk-check-txt a{color:#047857;font-weight:750;text-decoration:underline;text-underline-offset:2px}.bk-check-row--err .bk-check-box{border-color:#ef4444}.bk-consent-error{padding-left:33px;margin-top:2px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:560px){.bk-phone-row{grid-template-columns:120px minmax(0,1fr)}.bk-country-suggest{top:73px}.bk-phone-country__menu{width:min(290px,calc(100vw - 40px))}}
`;

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
      const mappedCountries = ca.map(x=>({value:String(x.id??x.value??x.code??""),label:String(x.name??x.label??"")})).filter(x=>x.value);
      const mappedDestinations = da.map(x=>({
        value:String(x.id??x.value??""),
        label:String(x.name??x.label??""),
        slug:String(x.slug??""),
        country:String(x.country?.name??x.countryName??x.country??""),
        countryId:String(x.country_id??x.countryId??x.country?.id??""),
        image:String(x.image??x.thumbnail??x.imageUrl??x.image_url??""),
        category:String(x.category??x.type??x.destination_type??"").toLowerCase()
      })).filter(x=>x.value);
      setCountriesList(mappedCountries);
      setDestinationsList(mappedDestinations);

      // Destination cards pass the destination id/slug in the booking URL.
      // Preselect it, together with its country, when the booking form opens.
      try {
        const params = new URLSearchParams(window.location.search);
        const requested = String(params.get("destination") || "").trim();
        const requestedName = String(params.get("destinationName") || "").trim().toLowerCase();
        const match = mappedDestinations.find(d =>
          (requested && (String(d.value) === requested || d.slug === requested)) ||
          (requestedName && d.label.toLowerCase() === requestedName)
        );
        if (match) {
          // The destination step is where the user will see the preselection.
          set("destinationId", match.value);
          if (match.countryId) set("countryId", match.countryId);
        }
      } catch {}
    }).catch(()=>{}).finally(()=>alive&&setLoadingRefs(false));
    return()=>{alive=false};
  },[set]);

  useEffect(()=>{ firstInputRef.current?.focus?.(); },[step]);

  const selectedDest=useMemo(()=>destinationsList.find(d=>String(d.value)===String(data.destinationId)),[destinationsList,data.destinationId]);
  const hero=selectedDest?.image?{src:selectedDest.image,caption:selectedDest.label,tag:"Your destination"}:null;

  const quickArrival = [{label:"1 week",value:new Date(Date.now()+7*864e5).toISOString().slice(0,10)},{label:"2 weeks",value:new Date(Date.now()+14*864e5).toISOString().slice(0,10)}];
  const quickDeparture = data.startDate ? [5,7,10,14].map(n=>({label:`${n} nights`,value:new Date(new Date(data.startDate+"T00:00:00").getTime()+n*864e5).toISOString().slice(0,10)})) : [];

  const destinationForImage = selectedDest ? {src:selectedDest.image,alt:selectedDest.label,caption:selectedDest.label,tag:"Your selection"} : null;

  if(submitted) return <div className="bk-success"><SuccessScreen
        displayName={displayName}
        bookingRef={bookingRef}
        email={data.email}
        category={selectedDest?.category || ""}
        onReset={reset}
      /></div>;

  const title=STEPS[step]?.label || "Review";
  const desc=STEPS[step]?.desc || "";
  const review = step===4;

  const next = () => { if(step===3){ tryNext(); } else tryNext(); };

  return <div className="bk-page">
    <style>{BK_CSS}</style>
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
                <div className="bk-review-card"><h4>Traveller identity</h4><p><strong>{data.firstName} {data.lastName}</strong></p><p>Nationality: {data.nationality || "Not provided"}</p><p>Country of residence: {data.country || "Not provided"}</p></div>
                <div className="bk-review-card"><h4>Destination</h4><p><strong>{selectedDest?.label || "Selected destination"}</strong></p><p>Country: {countriesList.find(c=>c.value===data.countryId)?.label || "Not selected"}</p><p>Destination ID: {data.destinationId || "—"}</p><p>Category: {selectedDest?.category || "—"}</p></div>
                <div className="bk-review-card"><h4>Travel dates</h4><p><strong>{data.flexibleDates ? "Flexible dates" : `${pretty(data.startDate)} → ${pretty(data.endDate)}`}</strong></p><p>{data.flexibleDates ? `Months: ${(data.flexibleMonths||[]).join(", ") || "Not selected"}` : "Fixed travel dates"}</p></div>
                <div className="bk-review-card"><h4>Travelers</h4><p><strong>{totalTravelers} traveler{totalTravelers!==1?"s":""}</strong></p><p>Adults: {data.adults}</p><p>Children: {data.children}</p><p>Group type: {data.groupType || "Not selected"}</p></div>
                <div className="bk-review-card"><h4>Contact</h4><p><strong>{data.email}</strong></p><p>Phone / WhatsApp: {data.phone || "Not provided"}</p><p>Preferred method: <strong>{data.preferredContactMethod || "Not selected"}</strong></p><p>Phone country code: {data.phoneCountryCode || "—"}</p></div>
                <div className="bk-review-card"><h4>Experience & requests</h4><p>Attraction / experience: <strong>{data.attractionName || "Not selected"}</strong></p><p>Accommodation: {data.accommodationType || "Not specified"}</p><p>Special requests: {data.specialRequests || "None provided"}</p></div>
              </div>
              <div className="bk-review-card" style={{marginTop:12}}>
                <h4>Submission preferences</h4>
                <p>Safari tips and offers: <strong>{data.newsletterOptIn ? "Yes" : "No"}</strong></p>
                <p>Terms & Privacy: <strong>{data.agreeToTerms ? "Accepted" : "Not accepted"}</strong></p>
                <p>Source: <strong>Website</strong></p>
              </div>
              <div style={{marginTop:14,padding:14,borderRadius:14,background:"#ecfdf5",color:"#35604e",fontSize:12,lineHeight:1.55}}>
                <Check size={15} style={{verticalAlign:"-3px",marginRight:6,color:"#059669"}}/>
                <strong>Final review:</strong> every value above is what will be sent to Altuvera. After submission, you will receive a secure email asking you to confirm that you personally requested this booking from your real inbox. Planning begins only after that confirmation.
              </div>
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
