import React, { useState } from "react";
import { API_URL } from "../../utils/apiBase";

export default function AccountRecoveryComplete() {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("request") || "";
  const token = params.get("token") || "";
  const [email,setEmail] = useState("");
  const [busy,setBusy] = useState(false);
  const [done,setDone] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response=await fetch(API_URL+"/users/account-recovery/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId,token,email})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.success===false)throw new Error(result.message||"Recovery could not be completed.");
      setDone(true);setMessage(result.message||"Recovery completed.");
      window.history.replaceState({},document.title,window.location.pathname);
    } catch(e) {setError(e.message||"Recovery could not be completed.");}
    finally {setBusy(false);}
  };
  return <main className="arc-page"><section className="arc-card">
    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><span className="text-2xl">✓</span></div>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Altuvera account security</p>
    <h1 className="mt-2 text-2xl font-bold">{done?"Recovery complete":"Complete account recovery"}</h1>
    {done ? <div className="mt-4 space-y-4"><p className="text-sm leading-6 text-gray-600">{message}</p><a href="/" className="inline-flex rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white">Return to Altuvera</a></div> : <>
      <p className="mt-3 text-sm leading-6 text-gray-600">This one-time link is available only after an administrator manually verifies your identity. Enter the alternate email address that was approved for this request. Completing recovery changes the account email, removes existing passkeys and authenticator factors, and revokes all sessions.</p>
      {(!requestId||!token) && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">This recovery link is incomplete. Request a new recovery review from Altuvera support.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label htmlFor="recovery-complete-email" className="block text-sm font-semibold">Approved alternate email</label>
        <input id="recovery-complete-email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="name@example.com"/>
        <button type="submit" disabled={busy||!requestId||!token} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?"Verifying secure link…":"Complete recovery"}</button>
      </form>
      <p className="mt-4 text-xs leading-5 text-gray-500">Never share this link, your authenticator code, or your recovery codes. The link expires 30 minutes after approval and can be used once.</p>
    </>}
  <style>{`.arc-page{min-height:80vh;display:grid;place-items:center;padding:clamp(18px,4vw,42px) 14px;background:radial-gradient(circle at 12% 12%,rgba(20,157,100,.10),transparent 30%),linear-gradient(145deg,#f5faf6,#fff 65%);color:#193629;box-sizing:border-box}.arc-card{position:relative;overflow:hidden;width:min(100%,520px);padding:clamp(22px,5vw,40px);border:1px solid #dcebe1;border-radius:25px;background:#fff;box-shadow:0 20px 60px rgba(20,65,42,.09);animation:arc-enter .55s cubic-bezier(.2,.75,.25,1) both}.arc-card:before{content:"";position:absolute;right:-75px;top:-105px;width:210px;height:210px;border:1px solid rgba(8,123,84,.12);border-radius:50%;box-shadow:0 0 0 24px rgba(8,123,84,.035),0 0 0 48px rgba(8,123,84,.025);pointer-events:none}.arc-card>div:first-child{position:relative;display:grid;place-items:center;width:54px;height:54px;margin-bottom:20px;border:1px solid #d6ecde;border-radius:17px;background:linear-gradient(145deg,#f2fbf5,#e2f5e9);color:#087b54;box-shadow:0 8px 20px rgba(8,123,84,.09);animation:arc-float 4s ease-in-out infinite}.arc-card>div:first-child span{font-size:25px;font-weight:800}.arc-card>p:first-of-type{margin:0;color:#087b54;font-size:10px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.arc-card h1{margin:10px 0 0;color:#173b2b;font-size:clamp(25px,5vw,34px);line-height:1.12;letter-spacing:-.04em;font-weight:850}.arc-card p{line-height:1.7}.arc-card .text-gray-600{color:#718178!important;font-size:13px}.arc-card .text-xs{color:#87958d;font-size:10px}.arc-card label{display:block;margin:0 0 7px;color:#3b5647;font-size:11px;font-weight:750}.arc-card input{width:100%;min-height:46px;padding:12px;border:1px solid #dce8e0;border-radius:11px;background:#fbfdfb;color:#1b3929;font:inherit;font-size:13px;outline:none;box-sizing:border-box;transition:border-color .18s,box-shadow .18s}.arc-card input:focus{border-color:#15966a;box-shadow:0 0 0 3px rgba(21,150,106,.11);background:#fff}.arc-card button,.arc-card a{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:45px;padding:12px 16px;border:1px solid #087b54;border-radius:11px;background:linear-gradient(135deg,#0a8a60,#08734f);color:#fff;text-decoration:none;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 6px 14px rgba(8,123,84,.14);transition:transform .18s,box-shadow .18s}.arc-card button:hover:not(:disabled),.arc-card a:hover{transform:translateY(-1px);box-shadow:0 9px 19px rgba(8,123,84,.2)}.arc-card button:disabled{opacity:.45;cursor:not-allowed}.arc-card [role=alert]{padding:12px;border:1px solid #f1d7d8;border-radius:11px;background:#fff7f7;color:#a33e45;font-size:11px;line-height:1.6}.arc-card form{display:grid;gap:12px}@keyframes arc-enter{from{opacity:0;transform:translateY(15px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes arc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@media(max-width:480px){.arc-page{min-height:75vh;padding:14px 12px}.arc-card{padding:23px 18px;border-radius:20px}.arc-card h1{font-size:27px}.arc-card .text-gray-600{font-size:12px}}@media(prefers-reduced-motion:reduce){.arc-card,.arc-card *{animation-duration:.01ms!important;transition-duration:.01ms!important}}`}</style></section></main>;
}
