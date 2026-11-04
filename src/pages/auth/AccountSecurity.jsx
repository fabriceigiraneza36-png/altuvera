import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../utils/apiBase";
import { startRegistration } from "@simplewebauthn/browser";
import { ShieldCheck, MailCheck, Fingerprint, KeyRound, Key, MonitorSmartphone, ShieldAlert, CheckCircle2, LockKeyhole, ArrowUpRight } from "lucide-react";

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
    <section className="as-hero-card mb-5 rounded-2xl border border-gray-200 p-5">
      <span className="as-orbit as-orbit-one" aria-hidden="true"/><span className="as-orbit as-orbit-two" aria-hidden="true"/><span className="as-orbit as-orbit-three" aria-hidden="true"/>
      <div className="as-hero-content">
        <div className="as-hero-top"><div className="as-hero-icon"><ShieldCheck size={24} strokeWidth={1.8}/></div><span className="as-live-pill"><span/>Protection active</span></div>
        <div className="as-hero-copy"><p className="as-eyebrow">Your account’s first line of defence</p><h2 className="text-lg font-semibold"><MailCheck size={19}/> Email verification</h2><p className="mt-1 text-sm text-gray-600">Enabled — Altuvera emails a one-time code for each passwordless sign-in, including after logout.</p></div>
        <div className="as-hero-foot"><span><CheckCircle2 size={15}/> One-time sign-in codes</span><span><LockKeyhole size={15}/> Identity protected</span></div>
      </div>
    </section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold as-section-title"><Fingerprint size={19}/> Authenticator app</h2><p className="mt-1 text-sm text-gray-600">Use Google Authenticator, Microsoft Authenticator, Aegis or another TOTP app. Free; no SMS charges.</p></div><span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{status?.authenticatorEnabled ? "Enabled" : "Not enabled"}</span></div>
    {!secret ? <button disabled={busy || status?.authenticatorEnabled} onClick={()=>run(async()=>{const r=await api("/security/totp/setup",{});setSecret(r.data);})} className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Set up authenticator</button> : <div className="mt-4 space-y-3"><p className="text-sm">Add this key manually in your authenticator app:</p><code className="block break-all rounded-lg bg-gray-100 p-3">{secret.secret}</code><a className="inline-block text-sm font-semibold text-emerald-700 underline" href={secret.otpauthUrl}>Open authenticator link</a><label className="block text-sm font-medium" htmlFor="totp-code">6-digit code</label><input id="totp-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" className="w-full rounded-xl border p-3" placeholder="000000"/><button disabled={busy || code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/confirm",{code});setSecret(null);setCode("");setMessage(r.message);await refresh();})} className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Verify and enable</button><button onClick={()=>{setSecret(null);setCode("");}} className="ml-3 rounded-xl border px-4 py-2">Cancel</button></div>}
    {status?.authenticatorEnabled && <div className="mt-4 flex flex-wrap gap-2"><input aria-label="Authenticator code to disable" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" className="min-w-0 flex-1 rounded-xl border p-3" placeholder="Current 6-digit code"/><button disabled={busy||code.length!==6} onClick={()=>run(async()=>{const r=await api("/security/totp/disable",{code});setCode("");setMessage(r.message);await refresh();})} className="rounded-xl border border-red-300 px-4 py-2 text-red-700">Disable</button></div>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold as-section-title"><KeyRound size={19}/> Passkeys</h2><p className="mt-1 text-sm text-gray-600">Use your device screen lock, fingerprint, face recognition or a security key. You can skip this and continue using email verification.</p></div><span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{passkeys.length} saved</span></div>
      <label htmlFor="passkey-name" className="mt-4 block text-sm font-medium">Device label</label>
      <input id="passkey-name" value={passkeyName} onChange={e=>{setDeviceNameEdited(true);setPasskeyName(e.target.value.slice(0,120));}} className="mt-1 w-full rounded-xl border p-3" placeholder="Detected device name"/>
      <button disabled={busy} onClick={()=>run(async()=>{if(!window.PublicKeyCredential||!navigator.credentials)throw new Error("Passkeys are not supported in this browser. Try a recent browser on HTTPS.");const o=await api("/security/passkeys/register/options",{});const response=await startRegistration({optionsJSON:o.data});const saved=await api("/security/passkeys/register/verify",{response,deviceName:passkeyName});setMessage(saved.message);await refresh();})} className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy?"Please wait…":"Add a passkey"}</button>
      {passkeys.length>0 && <ul className="mt-4 divide-y">{passkeys.map(p=><li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{p.device_name||"Passkey"}</p><p className="text-xs text-gray-500">Added {p.created_at?new Date(p.created_at).toLocaleDateString():""}{p.last_used_at?" · Last used "+new Date(p.last_used_at).toLocaleDateString():""}</p></div><button disabled={busy} onClick={()=>{if(!window.confirm("Remove this passkey from your Altuvera account?"))return;run(async()=>{const r=await api("/security/passkeys/"+p.id,null,"DELETE");setMessage(r.message);await refresh();})}} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700">Remove</button></li>)}</ul>}
    </section>
    <section className="mb-5 rounded-2xl border border-gray-200 p-5"><h2 className="text-lg font-semibold as-section-title"><Key size={19}/> One-time recovery codes</h2><p className="mt-1 text-sm text-gray-600">Generate ten backup codes. Each code works once; store them securely and do not share them.</p>{status?.authenticatorEnabled && <input aria-label="Authenticator code before replacing recovery codes" value={rotateCode} onChange={e=>setRotateCode(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" className="mt-4 w-full rounded-xl border p-3" placeholder="Enter current authenticator code to replace codes"/>}<button disabled={busy || (status?.authenticatorEnabled && rotateCode.length!==6)} onClick={()=>run(async()=>{const r=await api("/security/recovery-codes",{code:rotateCode});setRecoveryCodes(r.data.codes||[]);setRotateCode("");setMessage(r.message);await refresh();})} className="mt-4 rounded-xl border px-4 py-2 font-semibold">Generate / replace codes</button>{recoveryCodes.length>0 && <div className="mt-4 rounded-xl bg-gray-50 p-4"><p className="mb-3 text-sm font-semibold">Shown only now — save these before leaving.</p><div className="grid grid-cols-2 gap-2 font-mono text-sm">{recoveryCodes.map(c=><code key={c}>{c}</code>)}</div><button onClick={()=>navigator.clipboard?.writeText(recoveryCodes.join("\n"))} className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">Copy codes</button></div>}</section>
    <section className="mt-5 rounded-2xl border border-red-200 p-5"><h2 className="text-lg font-semibold as-section-title"><MonitorSmartphone size={19}/> Active sessions</h2><p className="mt-1 text-sm text-gray-600">If you think someone else may have access, revoke all active sessions. You will need to sign in again on this device and your other devices.</p><button disabled={busy} onClick={()=>{if(!window.confirm("Revoke every active Altuvera session? You will need to sign in again."))return;run(async()=>{const r=await api("/security/revoke-sessions",{});setMessage(r.message);});}} className="mt-4 rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Revoke all sessions</button></section>
    <section className="rounded-2xl border border-gray-200 p-5"><h2 className="text-lg font-semibold as-section-title"><ShieldAlert size={19}/> Can’t access your account?</h2><p className="mt-1 text-sm text-gray-600">Request a manual recovery review. For your safety, a request never grants access automatically; the Altuvera team must verify ownership. If you can access your registered email, use it below. If not, contact Altuvera support for a manual identity review.</p><form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();run(async()=>{const r=await fetch(`${API_URL}/users/account-recovery/request`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:recoveryEmail,recoveryContactEmail})});const d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw new Error(d.message||"Could not submit recovery request.");setRecoveryRequested(true);setMessage(d.message||"If eligible, the support team will review your request.");});}}><label htmlFor="recovery-email" className="block text-sm font-medium">Registered email address</label><input id="recovery-email" type="email" required autoComplete="email" value={recoveryEmail} onChange={e=>{setRecoveryEmail(e.target.value);setRecoveryRequested(false);}} className="w-full rounded-xl border p-3" placeholder="you@example.com"/><label htmlFor="recovery-contact-email" className="block text-sm font-medium">Alternate email you can access (required for manual recovery)</label><input id="recovery-contact-email" type="email" required autoComplete="email" value={recoveryContactEmail} onChange={e=>{setRecoveryContactEmail(e.target.value);setRecoveryRequested(false);}} className="w-full rounded-xl border p-3" placeholder="trusted-address@example.com"/><p className="text-xs text-gray-500">An administrator must verify your identity before sending a one-time recovery link to this address.</p><button disabled={busy||recoveryRequested} type="submit" className="rounded-xl border border-emerald-700 px-4 py-2 font-semibold text-emerald-800 disabled:opacity-50">{recoveryRequested?"Request submitted":"Request recovery review"}</button></form><p className="mt-3 text-sm">Recovery codes remaining: {status?.recoveryCodesRemaining ?? "—"}</p></section>
  <style>{`
/* Polished account security experience */
.as-page{max-width:1120px;padding-top:clamp(18px,3.4vw,42px);--as-green:#087b54}
.as-page>header{background:linear-gradient(125deg,#f4fbf6 0%,#fff 58%,#f2faf5 100%);box-shadow:0 18px 46px rgba(17,75,45,.07)}
.as-page>header:before{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(110deg,transparent 20%,rgba(8,123,84,.055) 48%,transparent 72%);background-size:220% 100%;animation:as-header-sweep 12s ease-in-out infinite}
.as-page>section{position:relative;overflow:hidden;transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease}
.as-page>section:not(.as-hero-card):hover{transform:translateY(-2px);border-color:#cfe5d7!important;box-shadow:0 14px 34px rgba(20,60,38,.07)}
.as-section-title{display:flex;align-items:center;gap:10px}
.as-section-title svg{flex:none;color:#087b54;padding:7px;width:34px;height:34px;border-radius:11px;background:#edf8f1;box-shadow:inset 0 0 0 1px #dcefe3}
.as-hero-card{isolation:isolate;min-height:190px;padding:0!important;border:1px solid rgba(8,123,84,.22)!important;border-radius:23px!important;background:linear-gradient(120deg,#073d2d 0%,#07543c 52%,#08724e 100%)!important;color:#f2fff7;box-shadow:0 20px 48px rgba(4,69,43,.2)!important}
.as-hero-card:before{content:"";position:absolute;z-index:-2;inset:-45%;background:conic-gradient(from 0deg,transparent 0 18%,rgba(183,255,213,.12) 27%,transparent 38% 57%,rgba(112,233,168,.13) 68%,transparent 81%);animation:as-hero-rotate 30s linear infinite}
.as-hero-card:after{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(ellipse at 14% 18%,rgba(151,255,194,.15),transparent 34%),radial-gradient(ellipse at 88% 80%,rgba(112,230,164,.16),transparent 38%),linear-gradient(100deg,rgba(2,35,24,.14),transparent 70%);pointer-events:none}
.as-hero-content{position:relative;z-index:2;padding:clamp(21px,3.4vw,32px)}
.as-hero-top{display:flex;align-items:center;justify-content:space-between;gap:14px}
.as-hero-icon{display:grid;place-items:center;width:50px;height:50px;border:1px solid rgba(225,255,237,.3);border-radius:16px;background:rgba(236,255,244,.12);color:#e6fff0;box-shadow:0 8px 26px rgba(0,20,12,.12);animation:as-icon-hover 5s ease-in-out infinite}
.as-live-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid rgba(219,255,231,.24);border-radius:99px;background:rgba(240,255,246,.1);color:#e6fff0;font-size:10px;font-weight:800;letter-spacing:.04em}
.as-live-pill span{width:7px;height:7px;border-radius:50%;background:#8cf0b2;box-shadow:0 0 0 4px rgba(140,240,178,.13);animation:as-live-pulse 2s ease-out infinite}
.as-hero-copy{max-width:700px;margin-top:20px}
.as-hero-copy .as-eyebrow{margin:0 0 7px;color:#a9e9c2;font-size:9px;font-weight:850;letter-spacing:.17em;text-transform:uppercase}
.as-hero-copy h2{display:flex;align-items:center;gap:9px;color:#f5fff8!important;font-size:clamp(19px,3vw,23px)!important}
.as-hero-copy h2 svg{color:#a8edc3}
.as-hero-copy>p:last-child{max-width:680px;color:rgba(238,255,244,.79)!important;font-size:12px!important}
.as-hero-foot{display:flex;flex-wrap:wrap;gap:10px 20px;margin-top:20px;padding-top:14px;border-top:1px solid rgba(229,255,238,.15)}
.as-hero-foot span{display:inline-flex;align-items:center;gap:7px;color:#d8f7e3;font-size:10px;font-weight:700}
.as-hero-foot svg{color:#9be8b8}
.as-orbit{position:absolute;z-index:0;display:block;pointer-events:none;border:1px solid rgba(215,255,231,.18);border-radius:50%;will-change:transform}
.as-orbit-one{width:260px;height:260px;right:4%;top:-155px;box-shadow:0 0 0 22px rgba(218,255,231,.035),0 0 0 54px rgba(218,255,231,.025);animation:as-drift-one 17s ease-in-out infinite alternate}
.as-orbit-two{width:175px;height:175px;right:22%;bottom:-125px;border-color:rgba(191,255,215,.15);box-shadow:0 0 0 18px rgba(218,255,231,.03);animation:as-drift-two 13s ease-in-out infinite alternate}
.as-orbit-three{width:92px;height:92px;right:11%;top:34%;background:radial-gradient(circle,rgba(167,255,198,.12),transparent 72%);border-color:rgba(215,255,231,.2);animation:as-drift-three 10s ease-in-out infinite alternate}
@keyframes as-hero-rotate{to{transform:rotate(360deg)}}
@keyframes as-drift-one{0%{transform:translate3d(0,0,0) rotate(-8deg)}35%{transform:translate3d(-30px,18px,0) rotate(7deg)}70%{transform:translate3d(14px,38px,0) rotate(15deg)}100%{transform:translate3d(-18px,-12px,0) rotate(3deg)}}
@keyframes as-drift-two{0%{transform:translate3d(0,0,0) scale(.92)}40%{transform:translate3d(30px,-22px,0) scale(1.08)}75%{transform:translate3d(-18px,-42px,0) scale(.98)}100%{transform:translate3d(20px,8px,0) scale(1.04)}}
@keyframes as-drift-three{0%{transform:translate3d(0,0,0) scale(.85);opacity:.55}50%{transform:translate3d(-25px,20px,0) scale(1.2);opacity:1}100%{transform:translate3d(16px,-24px,0) scale(.92);opacity:.7}}
@keyframes as-live-pulse{0%{box-shadow:0 0 0 0 rgba(140,240,178,.3)}70%{box-shadow:0 0 0 7px rgba(140,240,178,0)}100%{box-shadow:0 0 0 0 rgba(140,240,178,0)}}
@keyframes as-icon-hover{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes as-header-sweep{0%,100%{background-position:120% 0}50%{background-position:-120% 0}}
@media(max-width:600px){.as-hero-content{padding:20px 17px}.as-hero-card{min-height:0}.as-orbit-one{right:-14%;top:-130px}.as-orbit-two{right:12%;bottom:-120px}.as-hero-foot{gap:9px 14px}.as-hero-foot span{font-size:9px}}
@media(prefers-reduced-motion:reduce){.as-hero-card:before,.as-orbit,.as-hero-icon,.as-live-pill span,.as-page>header:before{animation:none!important}}

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
`}</style></main>;
}
