import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";

export default function ConfirmBookingRequest() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("Confirming your booking request securely…");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState("error");
      setMessage("This confirmation link is missing its security token.");
      return;
    }
    fetch(`${API}/bookings/verify-email/${encodeURIComponent(token)}?json=1`, {
      credentials: "include",
    })
      .then(async r => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok || !body.success) throw new Error(body.message || body.error || "Confirmation failed.");
        setState("success");
        setMessage("Your booking request is confirmed. Altuvera can now begin reviewing and planning your trip.");
        setTimeout(() => navigate(`/booking/verify?status=success&ref=${encodeURIComponent(body.data?.booking_number || "")}`, { replace:true }), 900);
      })
      .catch(e => {
        setState("error");
        setMessage(e.message || "This confirmation link is invalid or expired.");
      });
  }, [params, navigate]);

  return (
    <div style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"32px 16px",background:"#f6fbf8"}}>
      <div style={{width:"min(560px,100%)",background:"#fff",borderRadius:28,padding:"42px 28px",textAlign:"center",boxShadow:"0 24px 70px rgba(15,118,110,.12)",border:"1px solid #e2eee8"}}>
        <div style={{width:72,height:72,borderRadius:"50%",margin:"0 auto 18px",display:"grid",placeItems:"center",background:state==="success"?"#ecfdf5":state==="error"?"#fef2f2":"#f1f5f9",color:state==="success"?"#059669":state==="error"?"#dc2626":"#64748b"}}>
          {state==="loading" ? <Loader2 size={34} className="animate-spin"/> : state==="success" ? <CheckCircle2 size={38}/> : <XCircle size={38}/>}
        </div>
        <ShieldCheck size={18} color="#059669" style={{margin:"0 auto 8px"}}/>
        <h1 style={{margin:"0 0 10px",fontSize:26,fontWeight:850,color:"#10221a"}}>
          {state==="success" ? "Booking request confirmed" : state==="error" ? "Confirmation unavailable" : "Confirming your request"}
        </h1>
        <p style={{margin:0,color:"#64756d",fontSize:14,lineHeight:1.7}}>{message}</p>
        {state!=="loading" && <button onClick={()=>navigate(state==="success"?"/my-bookings":"/")} style={{marginTop:24,border:0,borderRadius:12,padding:"12px 20px",background:"#059669",color:"#fff",fontWeight:800,cursor:"pointer"}}>{state==="success"?"Open My Bookings":"Return home"}</button>}
      </div>
    </div>
  );
}
