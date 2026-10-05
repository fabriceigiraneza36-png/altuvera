import React,{useEffect,useState} from "react";
import {Camera,CheckCircle,ShieldCheck,Upload,ArrowLeft} from "lucide-react";
import {bookingIdentityAPI} from "../../api/bookingIdentity";

export default function BookingIdentityVerification(){
  const id=window.location.pathname.split("/").filter(Boolean).pop();
  const [booking,setBooking]=useState(null),[file,setFile]=useState(null),[preview,setPreview]=useState(""),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
  useEffect(()=>{bookingIdentityAPI.get(id).then(r=>setBooking(r.data)).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[id]);
  const choose=e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith("image/")){setError("Please choose an image.");return}setFile(f);setPreview(URL.createObjectURL(f));setError("")};
  const submit=async()=>{if(!file)return;setSending(true);setError("");try{const r=await bookingIdentityAPI.upload(id,file);setBooking(r.data);setDone(true)}catch(e){setError(e.message)}finally{setSending(false)}};
  if(loading)return <div style={{minHeight:"70vh",display:"grid",placeItems:"center",color:"#64748b"}}>Loading secure verification…</div>;
  return <div style={{minHeight:"78vh",background:"linear-gradient(180deg,#f0fdf4,#fff)",padding:"32px 16px"}}>
    <div style={{maxWidth:620,margin:"0 auto",background:"#fff",border:"1px solid #d1fae5",borderRadius:24,boxShadow:"0 20px 60px rgba(5,150,105,.10)",overflow:"hidden"}}>
      <div style={{padding:"28px 26px",background:"linear-gradient(135deg,#022c22,#047857)",color:"#fff"}}>
        <ShieldCheck size={30}/><h1 style={{margin:"10px 0 6px",fontSize:25}}>Traveller verification</h1><p style={{margin:0,color:"#d1fae5",lineHeight:1.6}}>A quick identity step requested by Altuvera before your journey is confirmed.</p>
      </div>
      <div style={{padding:26}}>
        {booking&&<div style={{padding:14,borderRadius:14,background:"#f8fafc",marginBottom:18}}><b>{booking.destination_name||"Your journey"}</b><div style={{fontSize:12,color:"#64748b",marginTop:4}}>Booking {booking.booking_number||("#"+booking.id)}</div></div>}
        {done||booking?.identity_portrait_status==="uploaded"||booking?.identity_portrait_status==="verified"
          ? <div style={{textAlign:"center",padding:"30px 10px"}}><CheckCircle size={52} color="#059669"/><h2 style={{color:"#065f46"}}>Portrait received</h2><p style={{color:"#64748b",lineHeight:1.6}}>Thank you. Altuvera has received your portrait and will review your traveller information before confirmation.</p><a href="/my-bookings" style={{display:"inline-flex",alignItems:"center",gap:7,padding:"11px 16px",borderRadius:10,background:"#059669",color:"#fff",textDecoration:"none",fontWeight:700}}>View my bookings</a></div>
          : <>
            <p style={{color:"#475569",lineHeight:1.7}}>Upload one recent, clear face portrait. Please use a simple photo where your face is visible and well lit.</p>
            <label style={{display:"block",border:"2px dashed #a7f3d0",borderRadius:18,padding:20,textAlign:"center",cursor:"pointer",background:"#f0fdf4"}}>
              {preview?<img src={preview} alt="Portrait preview" style={{width:150,height:150,objectFit:"cover",borderRadius:18,margin:"0 auto 12px"}}/>:<Camera size={42} color="#059669" style={{margin:"0 auto 10px"}}/>}
              <span style={{display:"block",fontWeight:800,color:"#047857"}}>{file?"Change portrait":"Choose portrait"}</span><span style={{display:"block",fontSize:11,color:"#64748b",marginTop:4}}>JPG, PNG or WEBP</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} style={{display:"none"}}/>
            </label>
            {error&&<div style={{marginTop:12,padding:11,borderRadius:10,background:"#fef2f2",color:"#b91c1c",fontSize:13}}>{error}</div>}
            <button onClick={submit} disabled={!file||sending} style={{width:"100%",marginTop:16,border:0,borderRadius:12,padding:13,background:"#059669",color:"#fff",fontWeight:800,fontSize:14,opacity:(!file||sending)?.5:1,cursor:!file||sending?"not-allowed":"pointer"}}><Upload size={15} style={{verticalAlign:"-2px",marginRight:6}}/>{sending?"Uploading securely…":"Send portrait to Altuvera"}</button>
          </>}
        <button onClick={()=>window.history.back()} style={{marginTop:18,border:0,background:"transparent",color:"#64748b",fontWeight:700,cursor:"pointer"}}><ArrowLeft size={14} style={{verticalAlign:"-2px",marginRight:4}}/>Back</button>
      </div>
    </div>
  </div>
}
