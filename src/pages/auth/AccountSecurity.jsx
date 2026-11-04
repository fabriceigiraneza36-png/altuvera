import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../utils/apiBase";
import { startRegistration } from "@simplewebauthn/browser";
import { MailCheck, Fingerprint, KeyRound, Key, MonitorSmartphone, ShieldAlert } from "lucide-react";

const api = async (path, body, method) => {
  const token = localStorage.getItem("altuvera_auth_token") || sessionStorage.getItem("altuvera_auth_token");
  const response = await fetch(`${API_URL}/users${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: { "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  const result = await response.json().catch(()=>({}));
  if (!response.ok || result.success === false) throw new Error(result.message || "Security request failed.");
  return result;
};

export default function AccountSecurity() {
  const [status,setStatus] = useState(null);
  const [passkeys,setPasskeys] = useState([]);
  const [passkeyName,setPasskeyName] = useState("");
  const [deviceNameEdited,setDeviceNameEdited] = useState(false);
  useEffect(() => {
    let active = true;
    const ua = navigator.userAgent || "";
    const platform = navigator.userAgentData?.platform || navigator.platform || "";
    const detect = (model = "") => {
      const text = [model, ua, platform].join(" ");
      if (/smart.?tv|hbbtv|web0s|tizen.*tv|netcast|googletv|appletv/i.test(text)) return model || "Smart TV";
      if (/watch|wear.?os|watchos/i.test(text)) return model || "Smartwatch";
      if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return model || "iPad";
      if (/iPhone/i.test(ua)) return model || "iPhone";
      if (/iPod/i.test(ua)) return model || "iPod touch";
      const android = /Android/i.test(text);
      const tablet = /tablet/i.test(text) || (android && !/mobile/i.test(ua));
      if (model) return model + (android ? (tablet ? " tablet" : " phone") : "");
      const androidModel = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?\s*[;)]/i);
      if (androidModel?.[1] && !/wv|linux/i.test(androidModel[1])) return androidModel[1].trim();
      if (android) return tablet ? "Android tablet" : "Android phone";
      if (/Windows/i.test(text)) return "Windows desktop";
      if (/Mac/i.test(text)) return "Mac desktop";
      if (/CrOS/i.test(text)) return "Chromebook";
      if (/Linux/i.test(text)) return "Linux desktop";
      return "Web device";
    };
    const initial = detect();
    setPasskeyName(current => current || initial);
    if (navigator.userAgentData?.getHighEntropyValues) {
      navigator.userAgentData.getHighEntropyValues(["model", "platform", "platformVersion"])
        .then(info => {
          if (!active || deviceNameEdited) return;
          const detected = detect(info.model || "");
          if (detected && detected !== "Web device") setPasskeyName(detected);
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [deviceNameEdited]);
  const [secret,setSecret] = useState(null);
  const [code,setCode] = useState("");
  const [recoveryCodes,setRecoveryCodes] = useState([]);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [recoveryEmail,setRecoveryEmail] = useState("");
  const [recoveryContactEmail,setRecoveryContactEmail] = useState("");
  const [recoveryRequested,setRecoveryRequested] = useState(false);
  const [rotateCode,setRotateCode] = useState("");
  const refresh = useCallback(async()=>{ try { const r=await api("/security/factors"); setStatus(r.data); const p=await api("/security/passkeys"); setPasskeys(p.data||[]); } catch(e){setError(e.message);} },[]);
  useEffect(()=>{refresh();},[refresh]);
  const run = async (fn) => { setBusy(true);setError("");setMessage("");try{await fn();}catch(e){setError(e.message);}finally{setBusy(false);} };
  return <main className="as-page">
    <header className="mb-8"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Account protection</p><h1 className="mt-2 text-3xl font-bold">Security & recovery</h1><p className="mt-3 text-gray-600">Email verification is used whenever you sign in. Add an authenticator and save recovery codes so you have another way to prove account ownership.</p></header>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-emerald-800">{message}</p>}
    <section className="as-compact-card mb-5 rounded-2xl border border-gray-200 p-5"><div className="as-card-heading"><h2 className="text-lg font-semibold as-section-title"><MailCheck size={19}/> Email verification</h2><span className="as-status-pill">Enabled</span></div><p className="mt-2 text-sm text-gray-600">Altuvera emails a one-time code for each passwordless sign-in, including after logout.</p></section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5"><div className="as-card-heading"><div className="as-card-copy"><h2 className="text-lg font-semibold as-section-title"><Fingerprint size={19}/> Authenticator app</h2><p className="mt-1 text-sm text-gray-600">Use Google Authenticator, Microsoft Authenticator, Aegis or another TOTP app. Free; no SMS charges.</p></div><span className="as-status-pill">{status?.authenticatorEnabled ? "Enabled" : "Not enabled"}</span></div>
    {!secret ? <button disabled={busy || status?.authenticatorEnabled} onClick={()=>run(async()=>{const r=await api("/security/totp/setup",{});setSecret(r.data);})} className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Set up authenticator</button> : <div className="mt-4 space-y-3"><p className="text-sm">Add this key manually in your authenticator app:</p><code className="block break-all rounded-lg bg-gray-100 p-3">{secret.secret}</code><a className="inline-block text-sm font-semibold text-emerald-700 underline" href={secret.otpauthUrl}>Open authenticator link</a><label className="block text-sm font-medium" htmlFor="totp-code">6-digit code</label><input id="totp-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" className="w-full rounded-xl border p-3" placeholder="000000"/><button disabled={busy || code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/confirm",{code});setSecret(null);setCode("");setMessage(r.message);await refresh();})} className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Verify and enable</button><button onClick={()=>{setSecret(null);setCode("");}} className="ml-3 rounded-xl border px-4 py-2">Cancel</button></div>}
    {status?.authenticatorEnabled && <div className="mt-4 flex flex-wrap gap-2"><input aria-label="Authenticator code to disable" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" className="min-w-0 flex-1 rounded-xl border p-3" placeholder="Current 6-digit code"/><button disabled={busy||code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/disable",{code});setCode("");setMessage(r.message);await refresh();})} className="rounded-xl border border-red-300 px-4 py-2 text-red-700">Disable</button></div>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5">
      <div className="as-card-heading"><div className="as-card-copy"><h2 className="text-lg font-semibold as-section-title"><KeyRound size={19}/> Passkeys</h2><p className="mt-1 text-sm text-gray-600">Use your device screen lock, fingerprint, face recognition or a security key. You can skip this and continue using email verification.</p></div><span className="as-status-pill">{passkeys.length} saved</span></div>
      <label htmlFor="passkey-name" className="mt-4 block text-sm font-medium">Device label</label>
      <input id="passkey-name" value={passkeyName} onChange={e=>{setDeviceNameEdited(true);setPasskeyName(e.target.value.slice(0,120));}} className="mt-1 w-full rounded-xl border p-3" placeholder="Detected device name"/>
      <button disabled={busy} onClick={()=>run(async()=>{if(!window.PublicKeyCredential||!navigator.credentials)throw new Error("Passkeys are not supported in this browser. Try a recent browser on HTTPS.");const o=await api("/security/passkeys/register/options",{});const response=await startRegistration({optionsJSON:o.data});const saved=await api("/security/passkeys/register/verify",{response,deviceName:passkeyName});setMessage(saved.message);await refresh();})} className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy?"Please wait…":"Add a passkey"}</button>
      {passkeys.length>0 && <ul className="mt-4 divide-y">{passkeys.map(p=><li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{p.device_name||"Passkey"}</p><p className="text-xs text-gray-500">Added {p.created_at?new Date(p.created_at).toLocaleDateString():""}{p.last_used_at?" · Last used "+new Date(p.last_used_at).toLocaleDateString():""}</p></div><button disabled={busy} onClick={()=>{if(!window.confirm("Remove this passkey from your Altuvera account?"))return;run(async()=>{const r=await api("/security/passkeys/"+p.id,null,"DELETE");setMessage(r.message);await refresh();})}} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700">Remove</button></li>)}</ul>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5"><h2 className="text-lg font-semibold as-section-title"><Key size={19}/> One-time recovery codes</h2><p className="mt-1 text-sm text-gray-600">Generate ten backup codes. Each code works once; store them securely and do not share them.</p>{status?.authenticatorEnabled && <input aria-label="Authenticator code before replacing recovery codes" value={rotateCode} onChange={e=>setRotateCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" className="mt-4 w-full rounded-xl border p-3" placeholder="Enter current authenticator code to replace codes"/>}<button disabled={busy || (status?.authenticatorEnabled && rotateCode.length!==6)} onClick={()=>run(async()=>{const r=await api("/security/recovery-codes",{code:rotateCode});setRecoveryCodes(r.data.codes||[]);setRotateCode("");setMessage(r.message);await refresh();})} className="mt-4 rounded-xl border px-4 py-2 font-semibold">Generate / replace codes</button>{recoveryCodes.length>0 && <div className="mt-4 rounded-xl bg-gray-50 p-4"><p className="mb-3 text-sm font-semibold">Shown only now — save these before leaving.</p><div className="grid grid-cols-2 gap-2 font-mono text-sm">{recoveryCodes.map(c=><code key={c}>{c}</code>)}</div><button onClick={()=>navigator.clipboard?.writeText(recoveryCodes.join("\n"))} className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">Copy codes</button></div>}</section>
    <section className="mt-5 rounded-2xl border border-red-200 p-5"><h2 className="text-lg font-semibold as-section-title"><MonitorSmartphone size={19}/> Active sessions</h2><p className="mt-1 text-sm text-gray-600">If you think someone else may have access, revoke all active sessions. You will need to sign in again on this device and your other devices.</p><button disabled={busy} onClick={()=>{if(!window.confirm("Revoke every active Altuvera session? You will need to sign in again."))return;run(async()=>{const r=await api("/security/revoke-sessions",{});setMessage(r.message);});}} className="mt-4 rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Revoke all sessions</button></section>
    <section className="rounded-2xl border border-gray-200 p-5"><h2 className="text-lg font-semibold as-section-title"><ShieldAlert size={19}/> Can’t access your account?</h2><p className="mt-1 text-sm text-gray-600">Request a manual recovery review. For your safety, a request never grants access automatically; the Altuvera team must verify ownership. If you can access your registered email, use it below. If not, contact Altuvera support for a manual identity review.</p><form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();run(async()=>{const r=await fetch(`${API_URL}/users/account-recovery/request`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:recoveryEmail,recoveryContactEmail})});const d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw new Error(d.message||"Could not submit recovery request.");setRecoveryRequested(true);setMessage(d.message||"If eligible, the support team will review your request.");});}}><label htmlFor="recovery-email" className="block text-sm font-medium">Registered email address</label><input id="recovery-email" type="email" required autoComplete="email" value={recoveryEmail} onChange={e=>{setRecoveryEmail(e.target.value);setRecoveryRequested(false);}} className="w-full rounded-xl border p-3" placeholder="you@example.com"/><label htmlFor="recovery-contact-email" className="block text-sm font-medium">Alternate email you can access (required for manual recovery)</label><input id="recovery-contact-email" type="email" required autoComplete="email" value={recoveryContactEmail} onChange={e=>{setRecoveryContactEmail(e.target.value);setRecoveryRequested(false);}} className="w-full rounded-xl border p-3" placeholder="trusted-address@example.com"/><p className="text-xs text-gray-500">An administrator must verify your identity before sending a one-time recovery link to this address.</p><button disabled={busy||recoveryRequested} type="submit" className="rounded-xl border border-emerald-700 px-4 py-2 font-semibold text-emerald-800 disabled:opacity-50">{recoveryRequested?"Request submitted":"Request recovery review"}</button></form><p className="mt-3 text-sm">Recovery codes remaining: {status?.recoveryCodesRemaining ?? "—"}</p></section>
  <style>{`
/* The top heading keeps its original colours and layout; only its existing ring moves. */
.as-page>header{isolation:isolate}
.as-page>header:after{animation:as-heading-orbit 19s ease-in-out infinite alternate;will-change:transform}
@keyframes as-heading-orbit{
  0%{transform:translate3d(0,0,0) rotate(0deg)}
  35%{transform:translate3d(-24px,-12px,0) rotate(9deg)}
  70%{transform:translate3d(-8px,18px,0) rotate(-7deg)}
  100%{transform:translate3d(18px,-8px,0) rotate(4deg)}
}
@media(prefers-reduced-motion:reduce){.as-page>header:after{animation:none!important}}
.as-page{max-width:1080px;width:100%;margin:0 auto;padding:clamp(18px,3.2vw,38px) clamp(14px,3vw,30px) 72px;color:#193629;box-sizing:border-box;--as-green:#087b54}
.as-page *{box-sizing:border-box}
.as-page>header{position:relative;isolation:isolate;overflow:hidden;margin:0 0 22px!important;padding:clamp(22px,4vw,38px)!important;border:1px solid #dceee3;border-radius:25px;background:radial-gradient(circle at 88% 12%,rgba(35,174,111,.14),transparent 34%),linear-gradient(135deg,#f5fcf7,#fff 70%);box-shadow:0 14px 38px rgba(17,75,45,.055);animation:as-rise .55s ease both}
.as-page>header:after{content:"";position:absolute;z-index:-1;width:190px;height:190px;right:-65px;bottom:-115px;border:1px solid rgba(8,123,84,.13);border-radius:50%;box-shadow:0 0 0 22px rgba(8,123,84,.035),0 0 0 44px rgba(8,123,84,.025)}
.as-page>header p:first-child{color:#087b54!important;font-size:10px!important;font-weight:850!important;letter-spacing:.16em!important}
.as-page>header h1{margin:12px 0 8px!important;color:#173b2b!important;font-size:clamp(27px,4.3vw,42px)!important;line-height:1.08!important;letter-spacing:-.045em!important;font-weight:850!important}
.as-page>header p:last-child{max-width:690px;color:#687c70!important;font-size:14px!important;line-height:1.7!important}
.as-page>section{margin:0 0 14px!important;padding:clamp(16px,2.5vw,23px)!important;border:1px solid #e3ece6!important;border-radius:19px!important;background:#fff!important;box-shadow:0 7px 24px rgba(20,60,38,.035);animation:as-rise .55s ease both}
.as-page>section h2{color:#234332!important;font-size:15px!important;font-weight:820!important;letter-spacing:-.02em}
.as-page>section p{line-height:1.65}
.as-page>section>div>span,.as-page>section>span{border-radius:99px!important}
.as-page input{max-width:100%;min-height:43px;padding:11px 12px!important;border:1px solid #dce8e0!important;border-radius:11px!important;background:#fbfdfb!important;color:#1b3929!important;font-size:12px!important;outline:none;transition:border-color .18s,box-shadow .18s}
.as-page input:focus{border-color:#15966a!important;box-shadow:0 0 0 3px rgba(21,150,106,.11)!important;background:#fff!important}
.as-page button{min-height:40px;padding:10px 14px!important;border-radius:11px!important;font-size:11px!important;font-weight:800!important;transition:transform .18s,box-shadow .18s,background .18s}
.as-page button:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 7px 16px rgba(8,123,84,.12)}
.as-page button:disabled{opacity:.48;cursor:not-allowed}
.as-page button.bg-emerald-700{background:linear-gradient(135deg,#0a8a60,#08734f)!important;box-shadow:0 5px 12px rgba(8,123,84,.13)}
.as-page button.border{border-color:#dce8e0!important;background:#fff!important;color:#456354}
.as-page button.border-red-300{border-color:#e8c7c8!important;color:#ad4b52!important}
.as-page .bg-gray-50{border:1px solid #e2eee6;border-radius:13px;background:#f8fcf9!important}
.as-page code{overflow-wrap:anywhere}
.as-page a{color:#087b54}
.as-page [role="alert"]{border:1px solid #f3d7d8;border-radius:13px;background:#fff8f8!important;color:#a33e45!important}
.as-page [role="status"]{border:1px solid #ccebd8;border-radius:13px;background:#f2fbf5!important;color:#176b49!important}
.as-page section:last-of-type{border-color:#dceee3!important;background:linear-gradient(145deg,#fff,#f9fdf9)!important}
@keyframes as-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:640px){.as-page{padding:14px 12px 60px}.as-page>header{padding:22px 18px!important;border-radius:20px}.as-page>header h1{font-size:clamp(26px,8vw,34px)!important}.as-page>header p:last-child{font-size:12px!important}.as-page>section{padding:16px!important}.as-page .grid.grid-cols-2{grid-template-columns:minmax(0,1fr)!important}.as-page .flex.flex-wrap{align-items:stretch}.as-page .flex.flex-wrap input{min-width:0}.as-page button{max-width:100%}}
@media(prefers-reduced-motion:reduce){.as-page *, .as-page *:before,.as-page *:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`}
/* Compact, consistent card headers and icon alignment */
.as-page>section{padding:16px 18px!important;margin-bottom:11px!important}
.as-page>section h2.as-section-title{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;margin:0!important;line-height:1.25!important;vertical-align:middle}
.as-page>section h2.as-section-title svg{display:block;flex:0 0 20px;width:20px;height:20px;align-self:center;color:#13845b;stroke-width:1.9}
.as-page .as-card-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}
.as-page .as-card-copy{flex:1 1 auto;min-width:0}
.as-page .as-card-copy>p{margin-top:5px!important}
.as-page .as-status-pill{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;white-space:nowrap;padding:5px 10px!important;border:1px solid #dceee3;background:#f2faf5;color:#16734f;font-size:11px;font-weight:750;line-height:1.2}
.as-page .as-compact-card>p{margin-bottom:0!important}
.as-page>section>p{margin-top:6px!important}
.as-page>section>h2.as-section-title{margin:0!important}
.as-page>section>button,.as-page>section>form{margin-top:11px}
.as-page>section>div.mt-4{margin-top:11px!important}
@media(max-width:640px){
 .as-page>section{padding:14px 15px!important}
 .as-page .as-card-heading{align-items:center;gap:8px}
 .as-page .as-card-copy{flex-basis:0}
 .as-page .as-card-copy>p{font-size:11px!important;line-height:1.5!important}
 .as-page .as-status-pill{padding:5px 8px!important;font-size:10px!important}
 .as-page>section h2.as-section-title{gap:8px!important}
}
</style></main>;
}
