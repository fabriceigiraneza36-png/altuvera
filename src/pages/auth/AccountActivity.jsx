import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ShieldCheck, CalendarClock, Search, ChevronLeft, ChevronRight, Clock3, LockKeyhole, Send, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../components/auth/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const token = () => {
  try {
    return localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token") || localStorage.getItem("auth_token") || "";
  } catch { return ""; }
};
const request = (url, options = {}) => fetch(url, {
  credentials: "include",
  ...options,
  headers: {
    "Content-Type": "application/json",
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...(options.headers || {}),
  },
});
const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};
const eventIcon = (type = "") => {
  const value = type.toLowerCase();
  if (value.includes("login") || value.includes("security")) return ShieldCheck;
  if (value.includes("booking")) return CalendarClock;
  return Activity;
};

export default function AccountActivity() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async (nextPage = page, quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const response = await request(`${API_BASE}/account-activity/my?page=${nextPage}&limit=20`);
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to load activity.");
      setItems(Array.isArray(payload.data) ? payload.data : []);
      setRequests(Array.isArray(payload.deletionRequests) ? payload.deletionRequests : []);
      setTotal(Number(payload.pagination?.total || 0));
      setPage(Number(payload.pagination?.page || nextPage));
    } catch (err) {
      setError(err.message || "We couldn't load your account activity. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => { load(1); }, []); // initial load only
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => [item.title, item.description, item.event_type, item.outcome]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [items, search]);

  const submitRequest = async () => {
    if (!selected || sending) return;
    setSending(true); setNotice("");
    try {
      const response = await request(`${API_BASE}/account-activity/my/${selected.id}/deletion-request`, {
        method: "POST", body: JSON.stringify({ reason: reason.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Request could not be submitted.");
      setSelected(null); setReason("");
      setNotice("Your request has been sent to an administrator for review. This activity remains unchanged until a decision is made.");
      await load(page, true);
    } catch (err) {
      setNotice(err.message || "Request could not be submitted.");
    } finally { setSending(false); }
  };

  const statusFor = (activityId) => requests.find((item) => String(item.activity_id) === String(activityId) && item.status === "pending");
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <Helmet><title>Account Activity | Altuvera</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <DashboardLayout title="Account Activity" subtitle="A transparent record of important actions connected to your Altuvera account.">
        <style>{`
          .aa-shell{color:#111827;min-width:0}.aa-summary{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin-bottom:18px}
          .aa-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:13px;background:#ecfdf5;color:#065f46}
          .aa-summary p{margin:4px 0 0;color:#64748b;font-size:13px;line-height:1.55}.aa-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:18px 0}
          .aa-search{display:flex;gap:8px;align-items:center;flex:1 1 220px;min-width:0;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:0 12px;color:#64748b}
          .aa-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;padding:12px 0;color:#111827;font-size:14px}
          .aa-btn{display:inline-flex;gap:7px;align-items:center;justify-content:center;border:1px solid #d1d5db;background:#fff;color:#1f2937;border-radius:10px;padding:9px 12px;font-size:13px;font-weight:650;cursor:pointer}
          .aa-btn:disabled{opacity:.55;cursor:not-allowed}.aa-btn-primary{background:#065f46;border-color:#065f46;color:#fff}.aa-list{display:grid;gap:10px}
          .aa-item{display:flex;gap:13px;align-items:flex-start;background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:15px;min-width:0}
          .aa-item-icon{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;border-radius:12px;background:#f0fdf4;color:#065f46}
          .aa-item-body{flex:1;min-width:0}.aa-item-head{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap}
          .aa-item h3{font-size:14px;line-height:1.35;margin:0;color:#111827;font-weight:750}.aa-item p{font-size:13px;line-height:1.55;margin:5px 0 0;color:#4b5563;overflow-wrap:anywhere}
          .aa-date{display:flex;gap:5px;align-items:center;color:#6b7280;font-size:11px;white-space:normal}.aa-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:9px}
          .aa-pill{font-size:10px;font-weight:750;letter-spacing:.02em;padding:4px 8px;border-radius:99px;background:#f3f4f6;color:#374151;text-transform:capitalize}
          .aa-empty,.aa-error{padding:28px 18px;text-align:center;background:#fff;border:1px dashed #d1d5db;border-radius:15px;color:#6b7280;font-size:14px}
          .aa-note{padding:12px 14px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;font-size:13px;margin:12px 0;line-height:1.5}
          .aa-modal-backdrop{position:fixed;inset:0;z-index:2000;background:rgba(15,23,42,.46);display:grid;place-items:center;padding:16px}
          .aa-modal{width:min(100%,440px);max-height:min(85dvh,600px);overflow:auto;background:#fff;border-radius:18px;padding:20px;box-shadow:0 24px 80px rgba(15,23,42,.25)}
          .aa-modal h3{margin:0;font-size:19px;color:#111827}.aa-modal p{color:#4b5563;font-size:13px;line-height:1.6}.aa-modal textarea{width:100%;box-sizing:border-box;resize:vertical;min-height:90px;padding:11px;border:1px solid #d1d5db;border-radius:10px;font:inherit;font-size:14px;outline-color:#059669}
          .aa-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:16px;color:#6b7280;font-size:12px}
          @media(max-width:520px){.aa-item{padding:12px;gap:9px}.aa-item-icon{width:34px;height:34px;flex-basis:34px}.aa-item-head{display:block}.aa-date{margin-top:6px}.aa-summary{padding:13px}.aa-pager{align-items:stretch}.aa-pager span{align-self:center}}
          @media(prefers-reduced-motion:reduce){.aa-btn{transition:none}}
        `}</style>
        <div className="aa-shell">
          <div className="aa-summary">
            <div className="aa-icon"><LockKeyhole size={21}/></div>
            <div><strong>Private, read-only history</strong><p>Important account events appear here with their date and outcome. Only trusted server-side events are recorded. You cannot edit or delete records directly; you may ask an administrator to review a record.</p></div>
          </div>
          {notice && <div className="aa-note" role="status">{notice}</div>}
          <div className="aa-toolbar">
            <label className="aa-search"><Search size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search this page's activity" aria-label="Search activity"/></label>
            <button className="aa-btn" onClick={()=>load(page,true)} disabled={refreshing}><RefreshCw size={15}/>{refreshing?"Refreshing":"Refresh"}</button>
          </div>
          {loading ? <div className="aa-empty">Loading your activity…</div> :
            error ? <div className="aa-error" role="alert"><AlertCircle size={19}/><p>{error}</p><button className="aa-btn" onClick={()=>load(page)}>Try again</button></div> :
            filtered.length === 0 ? <div className="aa-empty"><Activity size={25}/><p>{search ? "No activity on this page matches your search." : "No account activity has been recorded yet."}</p></div> :
            <div className="aa-list">{filtered.map((item)=>{
              const Icon=eventIcon(item.event_type); const pending=statusFor(item.id);
              return <article className="aa-item" key={item.id}>
                <div className="aa-item-icon"><Icon size={19}/></div>
                <div className="aa-item-body">
                  <div className="aa-item-head"><h3>{item.title}</h3><span className="aa-date"><Clock3 size={12}/>{formatDate(item.created_at)}</span></div>
                  {item.description && <p>{item.description}</p>}
                  <div className="aa-meta"><span className="aa-pill">{String(item.event_type||"activity").replaceAll("_"," ")}</span><span className="aa-pill">{item.outcome||"recorded"}</span>
                    {pending ? <span className="aa-pill" style={{background:"#fef3c7",color:"#92400e"}}>Review pending</span> :
                    <button className="aa-btn" onClick={()=>{setSelected(item);setReason("");}}>Request review</button>}
                  </div>
                </div>
              </article>;
            })}</div>
          }
          {!loading && !error && total > 20 && <div className="aa-pager"><span>{total} recorded events · Page {page} of {totalPages}</span><div style={{display:"flex",gap:8}}><button className="aa-btn" disabled={page<=1} onClick={()=>load(page-1)}><ChevronLeft size={15}/>Previous</button><button className="aa-btn" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next<ChevronRight size={15}/></button></div></div>}
          {requests.length>0 && <section style={{marginTop:24}}><h3 style={{fontSize:15,margin:"0 0 10px"}}>Your review requests</h3><div className="aa-list">{requests.map((item)=><div className="aa-item" key={item.id}><div className="aa-item-icon"><ShieldCheck size={18}/></div><div className="aa-item-body"><h3>Activity record #{item.activity_id}</h3><p>{item.reason||"No reason supplied"}</p><div className="aa-meta"><span className="aa-pill">{item.status}</span><span className="aa-date">{formatDate(item.created_at)}</span></div></div></div>)}</div></section>}
        </div>
        {selected && <div className="aa-modal-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <section className="aa-modal" role="dialog" aria-modal="true" aria-labelledby="aa-modal-title">
            <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><h3 id="aa-modal-title">Request an activity review</h3><button className="aa-btn" aria-label="Close" onClick={()=>setSelected(null)}><X size={17}/></button></div>
            <p><strong>{selected.title}</strong><br/>{formatDate(selected.created_at)}<br/>{selected.description}</p>
            <p>Submitting this request does not delete the record. An administrator must approve it, and the approval itself will be recorded.</p>
            <label style={{display:"block",fontSize:13,fontWeight:700,marginBottom:7}} htmlFor="aa-reason">Reason (optional)</label>
            <textarea id="aa-reason" maxLength={500} value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Explain why you want an administrator to review this record."/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}><button className="aa-btn" onClick={()=>setSelected(null)}>Cancel</button><button className="aa-btn aa-btn-primary" disabled={sending} onClick={submitRequest}><Send size={15}/>{sending?"Sending…":"Send request"}</button></div>
          </section>
        </div>}
      </DashboardLayout>
    </>
  );
}
