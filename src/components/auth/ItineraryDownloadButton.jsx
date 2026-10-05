import React from "react";

export default function ItineraryDownloadButton({booking,itinerary}){
  const download=()=>{
    const esc=(v)=>String(v??"").replace(/[&<>"']/g,(ch)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
    const days=(itinerary?.days||[]).map((day,i)=>"<section><h2>Day "+(i+1)+" · "+esc(day.title||day.location||"Adventure day")+"</h2>"+
      (day.date?"<p><strong>Date:</strong> "+esc(day.date)+"</p>":"")+
      (day.location?"<p><strong>Location:</strong> "+esc(day.location)+"</p>":"")+
      (Array.isArray(day.activities)&&day.activities.length?"<ul>"+day.activities.map(a=>"<li>"+esc(a)+"</li>").join("")+"</ul>":"")+
      (day.transport?"<p><strong>Transport:</strong> "+esc(day.transport)+"</p>":"")+
      (day.accommodation?"<p><strong>Stay:</strong> "+esc(day.accommodation)+"</p>":"")+
      (day.meals?"<p><strong>Meals:</strong> "+esc(day.meals)+"</p>":"")+
      (day.notes?"<p><strong>Notes:</strong> "+esc(day.notes)+"</p>":"")+"</section>").join("");
    const html="<!doctype html><html><head><meta charset='utf-8'><title>"+esc(itinerary?.title||"Altuvera Itinerary")+"</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:40px auto;padding:0 20px;color:#0f172a}header{background:#064e3b;color:#fff;padding:28px;border-radius:18px;margin-bottom:24px}section{border:1px solid #d1fae5;border-radius:14px;padding:18px;margin-bottom:14px}h2{color:#047857}p,li{line-height:1.6;color:#475569}@media print{body{margin:0}}</style></head><body><header><h1>"+esc(itinerary?.title||"Altuvera Itinerary")+"</h1><p style='color:#d1fae5'>"+esc(booking?.destination_name||"Your journey")+" · "+esc(booking?.booking_number||"")+"</p></header>"+(itinerary?.introduction?"<p>"+esc(itinerary.introduction)+"</p>":"")+days+"</body></html>";
    const blob=new Blob([html],{type:"text/html;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=(booking?.booking_number||"altuvera")+"-itinerary.html";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <button onClick={download} style={{border:"1px solid #a7f3d0",borderRadius:11,padding:"10px 14px",background:"#fff",color:"#047857",fontWeight:800,fontSize:12,cursor:"pointer"}}>↓ Download itinerary</button>;
}
