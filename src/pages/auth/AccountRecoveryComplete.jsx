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
  return <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-10 text-gray-900"><section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
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
  </section></main>;
}
